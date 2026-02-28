"use server";

import { RSVPStatus } from "@/generated/prisma/enums";
import {
  sendRsvpConfirmationEmail,
  sendBulkRsvpConfirmationEmails,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

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

    // Check if guest already exists by email
    const existingGuest = await prisma.guest.findUnique({
      where: { email: data.email },
    });

    let primaryGuest: {
      name: string;
      surname: string;
      email: string | null;
      drinkPreferences: string | null;
      otherRequests: string | null;
    };

    if (existingGuest) {
      // Update existing guest's preferences and mark as attending
      primaryGuest = await prisma.guest.update({
        where: { email: data.email },
        data: {
          drinkPreferences: data.drinkPreference || null,
          otherRequests: data.otherPreferences || null,
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
          name: data.name,
          surname: data.surname,
          email: data.email,
          drinkPreferences: data.drinkPreference || null,
          otherRequests: data.otherPreferences || null,
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
      const guestDetailsMap = new Map(
        (data.guestDetailsList || []).map((g) => [g.id, g])
      );

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
              // Only update email if a valid non-empty value was provided
              ...(emailValue ? { email: emailValue } : {}),
            },
          });
        })
      );

      // Fetch updated additional guests with emails to send confirmations
      const additionalGuests = await prisma.guest.findMany({
        where: {
          id: { in: data.selectedGuests },
          email: { not: null },
        },
        select: {
          name: true,
          surname: true,
          email: true,
          drinkPreferences: true,
          otherRequests: true,
        },
      });

      // Send confirmation emails to additional guests (non-blocking)
      if (additionalGuests.length > 0) {
        const guestsWithEmail = additionalGuests
          .filter((g) => g.email !== null)
          .map((g) => ({
            name: g.name,
            surname: g.surname,
            email: g.email as string,
            drinkPreferences: g.drinkPreferences,
            otherRequests: g.otherRequests,
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
      message: "Došlo je do greške pri obradi. Molimo pokušajte ponovno.",
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
