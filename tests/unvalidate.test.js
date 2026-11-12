import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildUnvalidateBookingTransition } from "../lib/adminHelpers.js";
import { isSpecificSlotAvailable } from "../lib/availabilityEngine.js";

test("buildUnvalidateBookingTransition handles PENDING_PAYMENT, CONFIRMED, and disallows non-validated statuses", () => {
  const now = new Date("2026-11-12T10:00:00.000Z");

  // 1. PENDING_PAYMENT (declared or not) -> PENDING_APPROVAL, no stats rollback
  const pendingPayment = {
    status: "PENDING_PAYMENT",
    holdExpiresAt: "2026-11-12T15:00:00.000Z",
    depositDeclared: true,
    depositDeclaredMethod: "Wero",
    depositDeclaredAt: "2026-11-12T09:30:00.000Z",
    stripePaymentUrl: "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-1111",
  };
  const fromPending = buildUnvalidateBookingTransition(pendingPayment, {
    paymentHoldHours: 5,
    now,
  });
  assert.equal(fromPending.allowed, true);
  assert.equal(fromPending.nextStatus, "PENDING_APPROVAL");
  assert.equal(fromPending.shouldRollbackStats, false);
  assert.equal(fromPending.patch.holdExpiresAt, null);
  assert.equal(fromPending.patch.depositDeclared, false);
  assert.equal(fromPending.patch.depositDeclaredMethod, "");
  assert.equal(fromPending.patch.paidDepositAt, null);

  // 2. Expired hold PENDING_PAYMENT (undeclared past holdExpiresAt) -> effective EXPIRED -> disallowed
  const expiredPending = {
    status: "PENDING_PAYMENT",
    holdExpiresAt: "2026-11-12T08:00:00.000Z",
    depositDeclared: false,
  };
  const fromExpired = buildUnvalidateBookingTransition(expiredPending, { now });
  assert.equal(fromExpired.allowed, false);
  assert.equal(fromExpired.fromStatus, "EXPIRED");

  // 3. CONFIRMED -> defaults to PENDING_PAYMENT with fresh holdExpiresAt + stats rollback
  const confirmed = {
    status: "CONFIRMED",
    paidDepositAt: "2026-11-12T09:45:00.000Z",
    stripePaymentIntentId: "manual_cash_or_transfer",
    stripePaymentUrl: "",
  };
  const fromConfirmed = buildUnvalidateBookingTransition(confirmed, {
    paymentHoldHours: 5,
    now,
  });
  assert.equal(fromConfirmed.allowed, true);
  assert.equal(fromConfirmed.nextStatus, "PENDING_PAYMENT");
  assert.equal(fromConfirmed.shouldRollbackStats, true);
  assert.equal(fromConfirmed.needsCheckoutUrl, true);
  assert.equal(fromConfirmed.patch.paidDepositAt, null);
  assert.equal(fromConfirmed.patch.stripePaymentIntentId, "");
  assert.equal(fromConfirmed.patch.holdExpiresAt, "2026-11-12T15:00:00.000Z");

  // 4. CONFIRMED with explicit targetStatus: PENDING_APPROVAL
  const directToApproval = buildUnvalidateBookingTransition(confirmed, {
    targetStatus: "PENDING_APPROVAL",
    paymentHoldHours: 5,
    now,
  });
  assert.equal(directToApproval.allowed, true);
  assert.equal(directToApproval.nextStatus, "PENDING_APPROVAL");
  assert.equal(directToApproval.shouldRollbackStats, true);
  assert.equal(directToApproval.needsCheckoutUrl, false);
  assert.equal(directToApproval.patch.holdExpiresAt, null);

  // 5. Disallowed statuses
  for (const status of ["PENDING_APPROVAL", "RESCHEDULE_PROPOSED", "CANCELLED", "REJECTED"]) {
    const res = buildUnvalidateBookingTransition({ status }, { now });
    assert.equal(res.allowed, false, `Status ${status} should not be unvalidatable`);
  }
});

test("Unvalidate workflow in isolated store preserves slot hold and accurately rolls back customer stats", async () => {
  const origCwd = process.cwd();
  const prevMongoUri = process.env.MONGODB_URI;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ydm-unvalidate-"));

  try {
    delete process.env.MONGODB_URI;
    process.chdir(tmpDir);

    const {
      createBooking,
      updateBooking,
      adjustCustomerStats,
      getCustomers,
    } = await import(`../lib/store.js?t=${Date.now()}`);

    const customer = {
      firstName: "Lina",
      lastName: "Morel",
      email: "lina.morel@example.com",
      phone: "06 44 55 66 77",
    };

    const weeklyAvail = {
      dayOfWeek: 2, // Tuesday 2026-12-22
      isOpen: true,
      openTime: "09:30",
      closeTime: "19:00",
      breaks: [{ start: "13:00", end: "14:00" }],
    };
    const settings = {
      bufferMinutes: 15,
      slotIntervalMinutes: 30,
      minNoticeHours: 24,
      maxDaysInAdvance: 60,
      paymentHoldHours: 5,
    };
    const checkNow = new Date("2026-12-01T08:00:00.000Z");

    // 1. Create PENDING_APPROVAL booking (slot is held, stats = 0)
    let booking = await createBooking({
      customer,
      service: { id: "srv_1", name: "Knotless", price: 65, duration: 180, depositAmount: 10 },
      selectedOptions: [],
      date: "2026-12-22",
      startTime: "14:00",
      endTime: "17:00",
      totalDuration: 180,
      totalPrice: 65,
      depositAmount: 10,
      remainingBalance: 55,
      status: "PENDING_APPROVAL",
    });
    const bId = booking.id || booking._id;

    // 2. Approve -> PENDING_PAYMENT
    booking = await updateBooking(bId, {
      status: "PENDING_PAYMENT",
      holdExpiresAt: "2026-12-01T13:00:00.000Z",
      depositDeclared: true,
      depositDeclaredMethod: "Wero",
      depositDeclaredAt: "2026-12-01T09:00:00.000Z",
    });

    // 3. Revert PENDING_PAYMENT -> PENDING_APPROVAL (no stats rollback)
    const t1 = buildUnvalidateBookingTransition(booking, { now: checkNow });
    assert.equal(t1.allowed, true);
    assert.equal(t1.shouldRollbackStats, false);
    booking = await updateBooking(bId, t1.patch);
    assert.equal(booking.status, "PENDING_APPROVAL");
    assert.equal(booking.depositDeclared, false);
    assert.equal(
      isSpecificSlotAvailable({
        dateStr: "2026-12-22",
        startTime: "14:00",
        totalDuration: 180,
        weeklyAvailability: weeklyAvail,
        existingBookings: [booking],
        unavailabilities: [],
        settings,
        now: checkNow,
      }),
      false,
      "Reverted PENDING_APPROVAL booking must keep holding its slot"
    );

    // 4. Approve & confirm deposit -> CONFIRMED + customer stats (+1, +65)
    booking = await updateBooking(bId, {
      status: "CONFIRMED",
      paidDepositAt: "2026-12-01T09:30:00.000Z",
      stripePaymentIntentId: "manual_cash_or_transfer",
    });
    await adjustCustomerStats(booking.customer, 1, 65, { updateLastBookingAt: true });

    let lina = (await getCustomers()).find((c) => c.email === "lina.morel@example.com");
    assert.equal(lina.totalBookings, 1);
    assert.equal(lina.totalSpent, 65);

    // 5. Unvalidate CONFIRMED -> PENDING_PAYMENT + rollback stats (-1, -65)
    const t2 = buildUnvalidateBookingTransition(booking, {
      paymentHoldHours: 5,
      now: checkNow,
    });
    assert.equal(t2.allowed, true);
    assert.equal(t2.shouldRollbackStats, true);
    booking = await updateBooking(bId, t2.patch);
    await adjustCustomerStats(booking.customer, -1, -65, { updateLastBookingAt: false });

    assert.equal(booking.status, "PENDING_PAYMENT");
    assert.equal(booking.paidDepositAt, null);
    assert.equal(booking.stripePaymentIntentId, "");
    lina = (await getCustomers()).find((c) => c.email === "lina.morel@example.com");
    assert.equal(lina.totalBookings, 0);
    assert.equal(lina.totalSpent, 0);
    assert.equal(
      isSpecificSlotAvailable({
        dateStr: "2026-12-22",
        startTime: "14:00",
        totalDuration: 180,
        weeklyAvailability: weeklyAvail,
        existingBookings: [booking],
        unavailabilities: [],
        settings,
        now: checkNow,
      }),
      false,
      "Reverted PENDING_PAYMENT booking must keep holding its slot"
    );
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
