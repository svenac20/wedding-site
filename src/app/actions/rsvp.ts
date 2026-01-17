"use server";

import { RSVPStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface RSVPData {
  name: string;
  surname: string;
  email: string;
  drinkPreference: string;
  otherPreferences: string;
  confirmingForOthers: boolean;
  selectedGuests: number[];
}

interface RSVPResult {
  success: boolean;
  message: string;
}

export async function submitRSVP(data: RSVPData): Promise<RSVPResult> {
  try {
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

    if (existingGuest) {
      // Update existing guest's preferences and mark as attending
      await prisma.guest.update({
        where: { email: data.email },
        data: {
          drinkPreferences: data.drinkPreference || null,
          otherRequests: data.otherPreferences || null,
          rsvpStatus: "ATTENDING",
        },
      });
    } else {
      // Create new guest
      await prisma.guest.create({
        data: {
          name: data.name,
          surname: data.surname,
          email: data.email,
          drinkPreferences: data.drinkPreference || null,
          otherRequests: data.otherPreferences || null,
          guestOf: "SVEN", // Default, can be updated later
          rsvpStatus: "ATTENDING",
        },
      });
    }

    // If confirming for others, update their RSVP status
    if (data.confirmingForOthers && data.selectedGuests.length > 0) {
      await prisma.guest.updateMany({
        where: {
          id: { in: data.selectedGuests },
        },
        data: {
          rsvpStatus: "ATTENDING",
        },
      });
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
