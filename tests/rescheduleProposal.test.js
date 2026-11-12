import test from "node:test";
import assert from "node:assert/strict";
import Booking from "../models/Booking.js";
import { findManualBookingConflict, getEffectiveBookingStatus } from "../lib/adminHelpers.js";
import { isSpecificSlotAvailable } from "../lib/availabilityEngine.js";
import {
  DEFAULT_EMAIL_SETTINGS,
  buildEmailVariables,
  renderEmailFromTemplate,
} from "../lib/emailTemplates.js";

const weeklyAvail = {
  dayOfWeek: 2, // Tuesday
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
  paymentHoldHours: 2,
};

test("RESCHEDULE_PROPOSED holds proposed slot, frees previous slot, and transitions cleanly across accept/counter", () => {
  const initialDate = "2026-12-15"; // Tuesday
  const initialStart = "09:30";
  const proposedDate = "2026-12-15";
  const proposedStart = "14:00";
  const counterDate = "2026-12-22"; // Next Tuesday
  const counterStart = "10:00";
  const now = new Date("2026-11-20T08:00:00Z");

  // 1. Hairstylist proposes 14:00 instead of 09:30 -> RESCHEDULE_PROPOSED
  const proposedBooking = {
    _id: "b_resched_1",
    bookingReference: "YDM-2026-7777",
    status: "RESCHEDULE_PROPOSED",
    originalDate: initialDate,
    originalStartTime: initialStart,
    originalEndTime: "12:30",
    previousDate: initialDate,
    previousStartTime: initialStart,
    previousEndTime: "12:30",
    date: proposedDate,
    startTime: proposedStart,
    endTime: "17:00",
    proposedDate,
    proposedStartTime: proposedStart,
    proposedEndTime: "17:00",
    proposalMessage: "Je peux vous prendre à 14h plutôt qu'à 9h30.",
    proposalRound: 1,
    totalDuration: 180,
    service: { name: "Knotless (Sans mèches)" },
    customer: { firstName: "Nadia", lastName: "K." },
  };

  // Validate Mongoose schema accepts RESCHEDULE_PROPOSED & all proposal fields
  const { _id: _discardedId, ...bookingFieldsForSchema } = proposedBooking;
  const doc = new Booking({
    ...bookingFieldsForSchema,
    service: {
      id: "srv_1",
      name: "Knotless (Sans mèches)",
      price: 40,
      duration: 180,
      depositAmount: 10,
    },
    customer: {
      firstName: "Nadia",
      lastName: "K.",
      email: "nadia@example.com",
      phone: "0600000000",
    },
    totalPrice: 40,
    depositAmount: 10,
    remainingBalance: 30,
  });
  assert.equal(doc.validateSync(), undefined);
  assert.equal(getEffectiveBookingStatus(proposedBooking), "RESCHEDULE_PROPOSED");

  // Initial slot (09:30) is freed immediately (when daily cap is multi-client 0)
  assert.equal(
    isSpecificSlotAvailable({
      dateStr: initialDate,
      startTime: initialStart,
      totalDuration: 180,
      weeklyAvailability: weeklyAvail,
      existingBookings: [proposedBooking],
      unavailabilities: [],
      settings: { ...settings, maxBookingsPerDay: 0 },
      now,
    }),
    true
  );

  // Proposed slot (14:00) is held while waiting for client answer
  assert.equal(
    isSpecificSlotAvailable({
      dateStr: proposedDate,
      startTime: proposedStart,
      totalDuration: 180,
      weeklyAvailability: weeklyAvail,
      existingBookings: [proposedBooking],
      unavailabilities: [],
      settings,
      now,
    }),
    false
  );

  // Another admin proposal or manual booking on 14:00 conflicts unless excluding b_resched_1
  assert.equal(
    findManualBookingConflict({
      date: proposedDate,
      startTime: proposedStart,
      duration: 180,
      existingBookings: [proposedBooking],
      now,
    }).conflict,
    true
  );
  assert.equal(
    findManualBookingConflict({
      date: proposedDate,
      startTime: proposedStart,
      duration: 180,
      existingBookings: [proposedBooking],
      excludeBookingId: "b_resched_1",
      now,
    }).conflict,
    false
  );

  // 2. Client chooses another slot (counter-proposal -> back to PENDING_APPROVAL)
  const counteredBooking = {
    ...proposedBooking,
    status: "PENDING_APPROVAL",
    previousDate: proposedDate,
    previousStartTime: proposedStart,
    previousEndTime: "17:00",
    date: counterDate,
    startTime: counterStart,
    endTime: "13:00",
    proposalResponse: "COUNTER_PROPOSED",
    proposalDeclineReason: "Le mardi suivant à 10h m'arrange mieux.",
  };

  // Rejected proposed slot (2026-12-15 14:00) is freed for other clients
  assert.equal(
    isSpecificSlotAvailable({
      dateStr: proposedDate,
      startTime: proposedStart,
      totalDuration: 180,
      weeklyAvailability: weeklyAvail,
      existingBookings: [counteredBooking],
      unavailabilities: [],
      settings,
      now,
    }),
    true
  );

  // Counter-proposed slot (2026-12-22 10:00) is now held while awaiting stylist validation
  assert.equal(
    isSpecificSlotAvailable({
      dateStr: counterDate,
      startTime: counterStart,
      totalDuration: 180,
      weeklyAvailability: weeklyAvail,
      existingBookings: [counteredBooking],
      unavailabilities: [],
      settings,
      now,
    }),
    false
  );

  // 3. Email rendering escapes proposal note & old slot safely
  const vars = buildEmailVariables({
    booking: {
      ...proposedBooking,
      previousDate: "2026-12-15",
      previousStartTime: "09:30",
      date: "2026-12-16",
      startTime: "14:00",
      totalPrice: 40,
      depositAmount: 10,
      remainingBalance: 30,
    },
    reason: 'Disponible à 14h <script>alert("x")</script>',
    paymentHoldHours: 2,
  });
  const mail = renderEmailFromTemplate({
    templateKey: "rescheduleProposed",
    emailSettings: DEFAULT_EMAIL_SETTINGS,
    variables: vars,
  });
  assert.ok(mail.html.includes("15/12/2026"));
  assert.ok(mail.html.includes("16/12/2026"));
  assert.ok(mail.html.includes("?proposition=accepter"));
  assert.ok(mail.html.includes("?proposition=refuser"));
  assert.ok(!mail.html.includes('<script>alert("x")</script>'));
});
