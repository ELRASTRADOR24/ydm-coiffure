import test from "node:test";
import assert from "node:assert/strict";
import {
  createBooking,
  getBookingByReference,
  updateBooking,
  getServices,
  getAvailabilities,
  getBookings,
  getSettings,
} from "../lib/store.js";
import {
  isSpecificSlotAvailable,
  calculateAvailableSlots,
} from "../lib/availabilityEngine.js";
import { buildBookingStatusUrl } from "../lib/appUrl.js";

test("End-to-End Booking Lifecycle Workflow", async () => {
  const services = await getServices(true);
  assert.ok(services.length > 0, "Services should be seeded");
  const testService = services[0];
  assert.equal(testService.depositAmount, 10, "Deposit amount must be strictly 10 €");

  const testDate = "2026-12-15"; // Future date (Tuesday)
  // Working hours: 09:30-19:00, break: 13:00-14:00, buffer: 15 min.
  // Afternoon slot: 14:00 to 17:30 (+15 min buffer = 17:45) fits comfortably before 19:00 close.
  const testTime = "14:00";
  const duration = testService.duration;

  // 1. Verify slot is initially available
  const [availabilities, settings] = await Promise.all([
    getAvailabilities(),
    getSettings(),
  ]);
  assert.equal(settings.paymentHoldHours, 5, "Hold period must be strictly 5 hours");
  const weeklyAvail = availabilities.find((a) => a.dayOfWeek === 2); // Tuesday

  const initialSlots = calculateAvailableSlots({
    dateStr: testDate,
    totalDuration: duration,
    weeklyAvailability: weeklyAvail,
    existingBookings: [],
    unavailabilities: [],
    settings,
    now: new Date("2026-11-20T08:00:00Z"),
  });
  assert.ok(initialSlots.includes(testTime), `Slot ${testTime} should be available. Available slots: ${initialSlots.join(", ")}`);

  // 2. Client requests booking -> PENDING_APPROVAL
  const booking = await createBooking({
    customer: {
      firstName: "Awa",
      lastName: "Traoré",
      email: "awa.traore@example.com",
      phone: "06 99 88 77 66",
      notes: "Test automated booking",
    },
    service: {
      id: testService.id || testService._id,
      name: testService.name,
      price: testService.price,
      duration: testService.duration,
      depositAmount: testService.depositAmount,
    },
    selectedOptions: [],
    date: testDate,
    startTime: testTime,
    endTime: "17:30",
    totalDuration: duration,
    totalPrice: testService.price,
    depositAmount: testService.depositAmount,
    remainingBalance: testService.price - testService.depositAmount,
    status: "PENDING_APPROVAL",
  });

  assert.ok(booking.bookingReference.startsWith("YDM-2026-"));
  assert.equal(booking.status, "PENDING_APPROVAL");

  // 3. PENDING_APPROVAL leaves the slot open for competing client requests until braider validates one
  const updatedExistingBookings = [booking];
  const slotStillOpenForRequests = isSpecificSlotAvailable({
    dateStr: testDate,
    startTime: testTime,
    totalDuration: duration,
    weeklyAvailability: weeklyAvail,
    existingBookings: updatedExistingBookings,
    unavailabilities: [],
    settings,
    now: new Date("2026-11-20T08:00:00Z"),
  });
  assert.equal(
    slotStillOpenForRequests,
    true,
    "PENDING_APPROVAL request must allow other clients to request the same slot before braider validation"
  );

  // 4. Braider approves booking -> PENDING_PAYMENT (direct tracking link) -> locks the slot & day
  const bookingId = booking.id || booking._id;
  const holdHours = settings.paymentHoldHours || 5;
  const refNow = new Date("2026-11-20T08:00:00Z");
  const approved = await updateBooking(bookingId, {
    status: "PENDING_PAYMENT",
    holdExpiresAt: new Date(refNow.getTime() + holdHours * 3600 * 1000).toISOString(),
    stripePaymentUrl: buildBookingStatusUrl(booking.bookingReference),
  });
  assert.equal(approved.status, "PENDING_PAYMENT");
  assert.ok(
    approved.stripePaymentUrl.startsWith("https://www.ydmcoiffure.com/reserver/statut/")
  );
  assert.equal(
    isSpecificSlotAvailable({
      dateStr: testDate,
      startTime: testTime,
      totalDuration: duration,
      weeklyAvailability: weeklyAvail,
      existingBookings: [approved],
      unavailabilities: [],
      settings,
      now: refNow,
    }),
    false,
    "Approved PENDING_PAYMENT booking must lock the slot"
  );

  // 5. Direct deposit confirmed by braider (Wero / Revolut / PayPal) -> CONFIRMED
  const confirmed = await updateBooking(bookingId, {
    status: "CONFIRMED",
    paidDepositAt: new Date().toISOString(),
    stripePaymentIntentId: "manual_cash_or_transfer",
  });
  assert.equal(confirmed.status, "CONFIRMED");
  assert.ok(confirmed.paidDepositAt);

  // 6. Verify lookup by booking reference
  const lookedUp = await getBookingByReference(booking.bookingReference);
  assert.equal(lookedUp.bookingReference, booking.bookingReference);
  assert.equal(lookedUp.status, "CONFIRMED");

  // 7. Cancellation frees the slot again
  const cancelled = await updateBooking(bookingId, {
    status: "CANCELLED",
  });
  assert.equal(cancelled.status, "CANCELLED");

  const slotAfterCancellation = isSpecificSlotAvailable({
    dateStr: testDate,
    startTime: testTime,
    totalDuration: duration,
    weeklyAvailability: weeklyAvail,
    existingBookings: [cancelled],
    unavailabilities: [],
    settings,
    now: new Date("2026-11-20T08:00:00Z"),
  });
  assert.equal(slotAfterCancellation, true, "Cancelled slot must be freed");
});
