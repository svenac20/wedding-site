export function resolveGuestDeliveryEmail(
  submittedEmail: string | undefined,
  primaryEmail: string
): string {
  return submittedEmail?.trim() || primaryEmail.trim();
}
