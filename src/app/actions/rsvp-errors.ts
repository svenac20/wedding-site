export const EMAIL_TAKEN_MESSAGE =
  "Ova email adresa već pripada drugom gostu. Molimo unesite drugu email adresu.";

interface EmailAssignment {
  guestId: number | null;
  email: string;
}

interface ExistingEmailOwner {
  guestId: number;
  email: string;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function findConflictingEmails(
  assignments: EmailAssignment[],
  existingOwners: ExistingEmailOwner[]
): string[] {
  const ownersByEmail = new Map(
    existingOwners.map((owner) => [normalizeEmail(owner.email), owner.guestId])
  );
  const assignmentsByEmail = new Map<string, EmailAssignment[]>();

  for (const assignment of assignments) {
    const normalizedEmail = normalizeEmail(assignment.email);
    const matchingAssignments = assignmentsByEmail.get(normalizedEmail) || [];
    matchingAssignments.push(assignment);
    assignmentsByEmail.set(normalizedEmail, matchingAssignments);
  }

  const conflictingEmails: string[] = [];

  for (const [normalizedEmail, matchingAssignments] of assignmentsByEmail) {
    const assignedGuestIds = new Set(
      matchingAssignments.map(({ guestId }) =>
        guestId === null ? "new-guest" : `guest-${guestId}`
      )
    );
    const existingOwnerId = ownersByEmail.get(normalizedEmail);
    const belongsToAnotherGuest = matchingAssignments.some(
      ({ guestId }) =>
        existingOwnerId !== undefined && existingOwnerId !== guestId
    );

    if (assignedGuestIds.size > 1 || belongsToAnotherGuest) {
      conflictingEmails.push(matchingAssignments[0].email.trim());
    }
  }

  return conflictingEmails;
}

export function formatTakenEmailMessage(emails: string[]): string {
  if (emails.length === 1) {
    return `Email adresa ${emails[0]} već pripada drugom gostu. Molimo unesite drugu email adresu.`;
  }

  return `Sljedeće email adrese već pripadaju drugim gostima: ${emails.join(
    ", "
  )}. Molimo unesite druge email adrese.`;
}

export function getRSVPErrorMessage(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  if (error.code !== "P2002") {
    return null;
  }

  const target =
    "meta" in error &&
    typeof error.meta === "object" &&
    error.meta !== null &&
    "target" in error.meta
      ? error.meta.target
      : undefined;

  const fields = Array.isArray(target) ? target : [target];
  return fields.some((field) => String(field).toLowerCase().includes("email"))
    ? EMAIL_TAKEN_MESSAGE
    : null;
}
