import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  isBookingHoldExpired,
  getEffectiveBookingStatus,
  normalizeBookingStatus,
  selectFeaturedServices,
} from "../lib/adminHelpers.js";
import { formatDateFrench, formatShortDateFrench } from "../lib/utils.js";

test("isBookingHoldExpired, getEffectiveBookingStatus, and normalizeBookingStatus handle holds accurately", () => {
  const now = new Date("2026-11-11T12:00:00.000Z");

  // Active undeclared hold (expires in the future) -> stays PENDING_PAYMENT
  const activeHold = {
    status: "PENDING_PAYMENT",
    depositDeclared: false,
    holdExpiresAt: "2026-11-11T13:30:00.000Z",
  };
  assert.equal(isBookingHoldExpired(activeHold, now), false);
  assert.equal(getEffectiveBookingStatus(activeHold, now), "PENDING_PAYMENT");
  assert.equal(normalizeBookingStatus(activeHold, now), activeHold);

  // Expired hold WHERE deposit was declared -> NOT expired (waiting admin verification)
  const declaredHold = {
    status: "PENDING_PAYMENT",
    depositDeclared: true,
    holdExpiresAt: "2026-11-11T10:00:00.000Z",
  };
  assert.equal(isBookingHoldExpired(declaredHold, now), false);
  assert.equal(getEffectiveBookingStatus(declaredHold, now), "PENDING_PAYMENT");

  // Expired undeclared hold -> becomes EXPIRED without mutating original object
  const expiredHold = {
    id: "bk_exp",
    status: "PENDING_PAYMENT",
    depositDeclared: false,
    holdExpiresAt: "2026-11-11T11:59:59.000Z",
  };
  assert.equal(isBookingHoldExpired(expiredHold, now), true);
  assert.equal(getEffectiveBookingStatus(expiredHold, now), "EXPIRED");
  const normalized = normalizeBookingStatus(expiredHold, now);
  assert.notEqual(normalized, expiredHold);
  assert.equal(normalized.status, "EXPIRED");
  assert.equal(expiredHold.status, "PENDING_PAYMENT");

  // Non-PENDING_PAYMENT statuses are never marked expired by holdExpiresAt
  const confirmed = {
    status: "CONFIRMED",
    depositDeclared: false,
    holdExpiresAt: "2026-11-11T09:00:00.000Z",
  };
  assert.equal(isBookingHoldExpired(confirmed, now), false);
  assert.equal(getEffectiveBookingStatus(confirmed, now), "CONFIRMED");

  // Missing holdExpiresAt
  assert.equal(
    isBookingHoldExpired({ status: "PENDING_PAYMENT", depositDeclared: false }, now),
    false
  );
  assert.equal(getEffectiveBookingStatus(null, now), "UNKNOWN");
});

test("selectFeaturedServices prioritizes active isPopular services, excludes inactive, and caps at count", () => {
  const catalog = [
    { id: "s1", name: "Inactive Popular", isActive: false, isPopular: true },
    { id: "s2", name: "Normal 1", isActive: true, isPopular: false },
    { id: "s3", name: "Popular A", isActive: true, isPopular: true },
    { id: "s4", name: "Normal 2", isActive: true, isPopular: false },
    { id: "s5", name: "Popular B", isActive: true, isPopular: true },
  ];

  const featured = selectFeaturedServices(catalog, 3);
  assert.deepEqual(
    featured.map((s) => s.id),
    ["s3", "s5", "s2"]
  );

  // All inactive returns empty
  assert.deepEqual(
    selectFeaturedServices([{ id: "off", isActive: false, isPopular: true }], 3),
    []
  );

  // Fewer than 3 active returns all active popular-first
  assert.deepEqual(
    selectFeaturedServices(
      [
        { id: "a", isActive: true, isPopular: false },
        { id: "b", isActive: true, isPopular: true },
      ],
      3
    ).map((s) => s.id),
    ["b", "a"]
  );
});

test("formatDateFrench and formatShortDateFrench preserve calendar dates in Europe/Paris and guard invalid inputs", () => {
  // YYYY-MM-DD strings must never drift backward across winter/summer DST or timezones
  assert.equal(formatShortDateFrench("2026-01-15"), "15/01/2026");
  assert.equal(formatShortDateFrench("2026-07-14"), "14/07/2026");
  assert.equal(formatShortDateFrench("2026-11-18"), "18/11/2026");

  const longWinter = formatDateFrench("2026-01-15");
  assert.ok(longWinter.includes("15") && longWinter.includes("janvier") && longWinter.includes("2026"));

  const longSummer = formatDateFrench("2026-07-14");
  assert.ok(longSummer.includes("14") && longSummer.includes("juillet") && longSummer.includes("2026"));

  // Invalid / empty values return empty string instead of throwing RangeError
  assert.equal(formatDateFrench(""), "");
  assert.equal(formatDateFrench(null), "");
  assert.equal(formatDateFrench("not-a-date"), "");
  assert.equal(formatShortDateFrench(""), "");
  assert.equal(formatShortDateFrench(undefined), "");
  assert.equal(formatShortDateFrench("9999-99-99"), "");
});

test("createBooking & adjustCustomerStats only credit CONFIRMED bookings and clamp rollbacks >= 0", async () => {
  const origCwd = process.cwd();
  const prevMongoUri = process.env.MONGODB_URI;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ydm-audit-store-"));

  try {
    delete process.env.MONGODB_URI;
    process.chdir(tmpDir);

    // Import store.js lazily so DATA_DIR/DB_FILE point strictly inside tmpDir
    const {
      createBooking,
      adjustCustomerStats,
      getCustomers,
    } = await import("../lib/store.js");

    const testCustomer = {
      firstName: "Nadia",
      lastName: "Kone",
      email: "nadia.kone@example.com",
      phone: "06 11 22 33 44",
    };

    // 1. PENDING_APPROVAL booking creates CRM contact with 0 bookings / 0 spent
    await createBooking({
      customer: testCustomer,
      service: { id: "srv_1", name: "Knotless", price: 45, duration: 180, depositAmount: 10 },
      selectedOptions: [],
      date: "2026-12-10",
      startTime: "10:00",
      endTime: "13:00",
      totalDuration: 180,
      totalPrice: 45,
      depositAmount: 10,
      remainingBalance: 35,
      status: "PENDING_APPROVAL",
    });

    let customers = await getCustomers();
    let nadia = customers.find((c) => c.email === "nadia.kone@example.com");
    assert.ok(nadia, "Customer record should exist after PENDING_APPROVAL booking");
    assert.equal(nadia.totalBookings, 0);
    assert.equal(nadia.totalSpent, 0);

    // 2. Manual/pre-confirmed CONFIRMED booking increments CRM stats +1 & +75€
    await createBooking({
      customer: testCustomer,
      service: { id: "srv_2", name: "Fulani", price: 75, duration: 210, depositAmount: 10 },
      selectedOptions: [],
      date: "2026-12-12",
      startTime: "14:00",
      endTime: "17:30",
      totalDuration: 210,
      totalPrice: 75,
      depositAmount: 10,
      remainingBalance: 65,
      status: "CONFIRMED",
    });

    customers = await getCustomers();
    nadia = customers.find((c) => c.email === "nadia.kone@example.com");
    assert.equal(nadia.totalBookings, 1);
    assert.equal(nadia.totalSpent, 75);

    // 3. Cancellation rollback removes confirmed booking & clamps at 0 even if repeated
    await adjustCustomerStats(testCustomer, -1, -75, { updateLastBookingAt: false });
    customers = await getCustomers();
    nadia = customers.find((c) => c.email === "nadia.kone@example.com");
    assert.equal(nadia.totalBookings, 0);
    assert.equal(nadia.totalSpent, 0);

    await adjustCustomerStats(testCustomer, -5, -500, { updateLastBookingAt: false });
    customers = await getCustomers();
    nadia = customers.find((c) => c.email === "nadia.kone@example.com");
    assert.equal(nadia.totalBookings, 0);
    assert.equal(nadia.totalSpent, 0);
  } finally {
    process.chdir(origCwd);
    if (prevMongoUri !== undefined) {
      process.env.MONGODB_URI = prevMongoUri;
    } else {
      delete process.env.MONGODB_URI;
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
