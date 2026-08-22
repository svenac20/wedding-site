import assert from "node:assert/strict";
import test from "node:test";

import { resolveGuestDeliveryEmail } from "./rsvp-email-delivery.ts";

test("uses the primary email when an additional guest has no submitted email", () => {
  assert.equal(
    resolveGuestDeliveryEmail("  ", "primary@example.com"),
    "primary@example.com"
  );
});

test("uses an additional guest's submitted email when provided", () => {
  assert.equal(
    resolveGuestDeliveryEmail(" guest@example.com ", "primary@example.com"),
    "guest@example.com"
  );
});
