import test from "node:test";
import assert from "node:assert/strict";
import {
  BOOKING_STORAGE_KEY,
  normalizeBookingReference,
  isValidBookingReference,
  getCookieBookingRef,
  saveTrackedBooking,
  getTrackedBookings,
  getLatestTrackedBookingRef,
  removeTrackedBooking,
} from "../lib/bookingPersistence.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

test("normalizeBookingReference & isValidBookingReference clean user inputs safely", () => {
  assert.equal(normalizeBookingReference("  ydm-2026-1234  "), "YDM-2026-1234");
  assert.equal(normalizeBookingReference("YDM-2026-AB<script>"), "YDM-2026-ABSCRIPT");
  assert.equal(isValidBookingReference("YDM-2026-1234"), true);
  assert.equal(isValidBookingReference("INVALID"), false);
  assert.equal(isValidBookingReference(""), false);
});

test("saveTrackedBooking persists across storage and cookie fallback without storing PII", () => {
  const storage = createMemoryStorage();
  const cookiesWritten = [];

  const next = saveTrackedBooking(
    {
      bookingReference: "ydm-2026-4455",
      status: "PENDING_PAYMENT",
      date: "2026-12-10",
      startTime: "10:00",
      service: { name: "Knotless Braids" },
      customer: {
        firstName: "Amina",
        lastName: "Diallo",
        email: "amina@secret.com",
        phone: "0600000000",
      },
    },
    {
      storage,
      setCookieFn: (line) => cookiesWritten.push(line),
      silent: true,
    }
  );

  assert.equal(next.length, 1);
  assert.equal(next[0].bookingReference, "YDM-2026-4455");
  assert.equal(next[0].serviceName, "Knotless Braids");
  assert.equal(next[0].firstName, "Amina");
  assert.equal(next[0].email, undefined);
  assert.equal(next[0].phone, undefined);

  assert.ok(cookiesWritten[0].startsWith("ydm_last_booking_ref=YDM-2026-4455"));

  // Simulate full reload using cookie only when storage was cleared
  const freshStorage = createMemoryStorage();
  assert.equal(
    getCookieBookingRef("foo=bar; ydm_last_booking_ref=YDM-2026-4455"),
    "YDM-2026-4455"
  );
  assert.equal(
    getLatestTrackedBookingRef({
      storage: freshStorage,
      cookieString: "ydm_last_booking_ref=YDM-2026-4455",
    }),
    "YDM-2026-4455"
  );

  // Deduplication and max cap (5)
  for (let i = 1; i <= 7; i += 1) {
    saveTrackedBooking(`YDM-2026-100${i}`, { storage, silent: true });
  }
  const all = getTrackedBookings({ storage });
  assert.equal(all.length, 5);
  assert.equal(all[0].bookingReference, "YDM-2026-1007");
  assert.ok(JSON.parse(storage.getItem(BOOKING_STORAGE_KEY)).length === 5);

  // Removing updates cookie to next latest or clears cookie
  removeTrackedBooking("YDM-2026-1007", {
    storage,
    setCookieFn: (line) => cookiesWritten.push(line),
    silent: true,
  });
  assert.equal(getLatestTrackedBookingRef({ storage }), "YDM-2026-1006");
  assert.ok(
    cookiesWritten[cookiesWritten.length - 1].startsWith(
      "ydm_last_booking_ref=YDM-2026-1006"
    )
  );
});
