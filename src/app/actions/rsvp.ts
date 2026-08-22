"use server";

import { RSVPStatus } from "@/generated/prisma/enums";
import {
  sendRsvpConfirmationEmail,
  sendBulkRsvpConfirmationEmails,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { resolveGuestDeliveryEmail } from "./rsvp-email-delivery";
import {
  findConflictingEmails,
  formatTakenEmailMessage,
  getRSVPErrorMessage,
} from "./rsvp-errors";

interface GuestDetail {
  id: number;
  drinkPreference: string;
  email: string;
}

interface RSVPData {
  name: string;
  surname: string;
  email: string;
  drinkPreference: string;
  otherPreferences: string;
  physicalInvitation: boolean;
  invitationAddress: string;
  confirmingForOthers: boolean;
  selectedGuests: number[];
  guestDetailsList: GuestDetail[];
}

interface RSVPResult {
  success: boolean;
  message: string;
}

export async function submitRSVP(data: RSVPData): Promise<RSVPResult> {
  try {
    console.log("[RSVP] Received data:", JSON.stringify(data, null, 2));
    console.log("[RSVP] guestDetailsList:", JSON.stringify(data.guestDetailsList, null, 2));

    // Validate required fields
    if (!data.name || !data.surname || !data.email) {
      return {
        success: false,
        message: "Ime, prezime i email su obavezni.",
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: "Molimo unesite ispravnu email adresu.",
      };
    }

    const wantsPhysicalInvitation = Boolean(data.physicalInvitation);
    const invitationAddress = wantsPhysicalInvitation
      ? (data.invitationAddress || "").trim()
      : "";

    if (wantsPhysicalInvitation && !invitationAddress) {
      return {
        success: false,
        message: "Molimo unesite adresu za dostavu fizičke pozivnice.",
      };
    }

    // Check if guest already exists. Match by name + surname using a
    // case- and accent-insensitive collation (utf8mb4_unicode_ci) so that
    // user input like "sven scekic" matches a stored "Sven Šćekić".
    // Fall back to matching by email if no name match is found.
    const trimmedName = data.name.trim();
    const trimmedSurname = data.surname.trim();
    const trimmedEmail = data.email.trim();

    const matchedByName = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM Guest
      WHERE name COLLATE utf8mb4_unicode_ci = ${trimmedName}
        AND surname COLLATE utf8mb4_unicode_ci = ${trimmedSurname}
      LIMIT 1
    `;

    const existingGuest =
      matchedByName.length > 0
        ? await prisma.guest.findUnique({ where: { id: matchedByName[0].id } })
        : await prisma.guest.findUnique({ where: { email: trimmedEmail } });

    const guestDetailsMap = new Map(
      (data.guestDetailsList || []).map((guest) => [guest.id, guest])
    );
    const emailAssignments = [
      { guestId: existingGuest?.id ?? null, email: trimmedEmail },
      ...(data.confirmingForOthers
        ? data.selectedGuests.flatMap((guestId) => {
            const email = guestDetailsMap.get(guestId)?.email?.trim();
            return email ? [{ guestId, email }] : [];
          })
        : []),
    ];
    const submittedEmails = [
      ...new Map(
        emailAssignments.map(({ email }) => [email.toLowerCase(), email])
      ).values(),
    ];
    const existingEmailOwners = await prisma.guest.findMany({
      where: { email: { in: submittedEmails } },
      select: { id: true, email: true },
    });
    const conflictingEmails = findConflictingEmails(
      emailAssignments,
      existingEmailOwners.flatMap(({ id, email }) =>
        email ? [{ guestId: id, email }] : []
      )
    );

    if (conflictingEmails.length > 0) {
      return {
        success: false,
        message: formatTakenEmailMessage(conflictingEmails),
      };
    }

    let primaryGuest: {
      name: string;
      surname: string;
      email: string | null;
      drinkPreferences: string | null;
      otherRequests: string | null;
    };

    if (existingGuest) {
      // Update existing guest's preferences and mark as attending.
      // Preserve the stored (properly-accented) name/surname; always
      // override the stored email with the user-provided one.
      primaryGuest = await prisma.guest.update({
        where: { id: existingGuest.id },
        data: {
          email: trimmedEmail,
          drinkPreferences: data.drinkPreference || null,
          otherRequests: data.otherPreferences || null,
          physicalInvitation: Boolean(data.physicalInvitation),
          invitationAddress: invitationAddress || null,
          rsvpStatus: "ATTENDING",
        },
        select: {
          name: true,
          surname: true,
          email: true,
          drinkPreferences: true,
          otherRequests: true,
        },
      });
    } else {
      // Create new guest
      primaryGuest = await prisma.guest.create({
        data: {
          name: trimmedName,
          surname: trimmedSurname,
          email: trimmedEmail,
          drinkPreferences: data.drinkPreference || null,
          otherRequests: data.otherPreferences || null,
          physicalInvitation: Boolean(data.physicalInvitation),
          invitationAddress: invitationAddress || null,
          guestOf: "SVEN", // Default, can be updated later
          rsvpStatus: "ATTENDING",
        },
        select: {
          name: true,
          surname: true,
          email: true,
          drinkPreferences: true,
          otherRequests: true,
        },
      });
    }

    // Send confirmation email to primary guest (non-blocking)
    if (primaryGuest.email) {
      sendRsvpConfirmationEmail({
        name: primaryGuest.name,
        surname: primaryGuest.surname,
        email: primaryGuest.email,
        drinkPreferences: primaryGuest.drinkPreferences,
        otherRequests: primaryGuest.otherRequests,
      }).catch((err) => console.error("Failed to send primary guest email:", err));
    }

    // If confirming for others, update their RSVP status and drink preferences individually
    if (data.confirmingForOthers && data.selectedGuests.length > 0) {
      // Update each guest individually to save their specific drink preferences and email
      await Promise.all(
        data.selectedGuests.map((guestId) => {
          const detail = guestDetailsMap.get(guestId);
          const emailValue = detail?.email?.trim();
          return prisma.guest.update({
            where: { id: guestId },
            data: {
              rsvpStatus: "ATTENDING",
              drinkPreferences: detail?.drinkPreference || null,
              physicalInvitation: Boolean(data.physicalInvitation),
              invitationAddress: invitationAddress || null,
              // Only update email if a valid non-empty value was provided
              ...(emailValue ? { email: emailValue } : {}),
            },
          });
        })
      );

      // Fetch every updated guest so confirmations without a dedicated
      // recipient address can be delivered to the primary guest.
      const additionalGuests = await prisma.guest.findMany({
        where: {
          id: { in: data.selectedGuests },
        },
        select: {
          id: true,
          name: true,
          surname: true,
          drinkPreferences: true,
          otherRequests: true,
        },
      });

      // Send confirmation emails to additional guests (non-blocking)
      if (additionalGuests.length > 0) {
        const guestsWithEmail = additionalGuests.map((guest) => ({
          name: guest.name,
          surname: guest.surname,
          email: resolveGuestDeliveryEmail(
            guestDetailsMap.get(guest.id)?.email,
            trimmedEmail
          ),
          drinkPreferences: guest.drinkPreferences,
          otherRequests: guest.otherRequests,
        }));

        sendBulkRsvpConfirmationEmails(guestsWithEmail).catch((err) =>
          console.error("Failed to send additional guest emails:", err)
        );
      }
    }

    return {
      success: true,
      message: "Hvala vam! Vaša potvrda je uspješno poslana.",
    };
  } catch (error) {
    console.error("Failed to process RSVP:", error);
    return {
      success: false,
      message:
        getRSVPErrorMessage(error) ||
        "Došlo je do greške pri obradi. Molimo pokušajte ponovno.",
    };
  }
}

interface Guest {
  id: number;
  name: string;
  surname: string;
}

export async function getGuests(): Promise<Guest[]> {
  try {
    const guests = await prisma.guest.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
      },
      where: {
        rsvpStatus: RSVPStatus.PENDING,
      },
      orderBy: [
        { surname: "asc" },
        { name: "asc" },
      ],
    });

    return guests;
  } catch (error) {
    console.error("Failed to fetch guests:", error);
    return [];
  }
}
