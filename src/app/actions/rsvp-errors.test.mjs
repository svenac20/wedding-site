import assert from "node:assert/strict";
import test from "node:test";

import {
  findConflictingEmails,
  formatTakenEmailMessage,
  getRSVPErrorMessage,
} from "./rsvp-errors.ts";

test("lists every email assigned to a different guest", () => {
  const assignments = [
    { guestId: 1, email: "first@example.com" },
    { guestId: 2, email: "shared@example.com" },
    { guestId: 3, email: "SHARED@example.com" },
    { guestId: 4, email: "taken@example.com" },
  ];
  const existingOwners = [
    { guestId: 1, email: "first@example.com" },
    { guestId: 9, email: "taken@example.com" },
  ];

  assert.deepEqual(findConflictingEmails(assignments, existingOwners), [
    "shared@example.com",
    "taken@example.com",
  ]);
});

test("formats all conflicting addresses in the user-facing message", () => {
  assert.equal(
    formatTakenEmailMessage(["shared@example.com", "taken@example.com"]),
    "Sljedeće email adrese već pripadaju drugim gostima: shared@example.com, taken@example.com. Molimo unesite druge email adrese."
  );
});

test("explains when an RSVP email is already assigned to another guest", () => {
  const error = {
    code: "P2002",
    meta: { target: ["email"] },
  };

  assert.equal(
    getRSVPErrorMessage(error),
    "Ova email adresa već pripada drugom gostu. Molimo unesite drugu email adresu."
  );
});

test("leaves unrelated errors to the generic RSVP error handler", () => {
  assert.equal(getRSVPErrorMessage({ code: "P2025" }), null);
});
