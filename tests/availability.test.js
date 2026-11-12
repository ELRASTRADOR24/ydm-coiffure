import test from "node:test";
import assert from "node:assert/strict";
import {
  timeToMinutes,
  minutesToTime,
  doIntervalsOverlap,
  calculateAvailableSlots,
  isSpecificSlotAvailable,
  computeBlockedDates,
  parisWallTimeToUtcMs,
} from "../lib/availabilityEngine.js";

test("timeToMinutes converts HH:mm to minutes correctly", () => {
  assert.equal(timeToMinutes("00:00"), 0);
  assert.equal(timeToMinutes("09:00"), 540);
  assert.equal(timeToMinutes("09:30"), 570);
  assert.equal(timeToMinutes("18:45"), 1125);
});

test("minutesToTime converts minutes to HH:mm string", () => {
  assert.equal(minutesToTime(0), "00:00");
  assert.equal(minutesToTime(570), "09:30");
  assert.equal(minutesToTime(1125), "18:45");
});

test("doIntervalsOverlap detects overlapping intervals", () => {
  // Interval A: 600-720 (10:00 - 12:00)
  // Interval B: 660-780 (11:00 - 13:00) => Overlap
  assert.equal(doIntervalsOverlap(600, 720, 660, 780), true);

  // Interval A: 600-720
  // Interval C: 720-800 => Adjacent (touching), no strict overlap
  assert.equal(doIntervalsOverlap(600, 720, 720, 800), false);

  // Interval D: 400-500 => Disjoint
  assert.equal(doIntervalsOverlap(600, 720, 400, 500), false);
});

test("calculateAvailableSlots excludes slots that exceed working hours or overlap breaks", () => {
  const weeklyAvailability = {
    dayOfWeek: 1,
    isOpen: true,
    startTime: "09:00",
    endTime: "18:00",
    breaks: [{ start: "12:30", end: "13:30" }],
    bufferTimeMinutes: 15,
  };

  // Prestation of 3 hours (180 min)
  const slots = calculateAvailableSlots({
    dateStr: "2026-12-01",
    totalDuration: 180,
    weeklyAvailability,
    existingBookings: [],
    unavailabilities: [],
    settings: { minNoticeHours: 0, maxDaysInAdvance: 60 },
    now: new Date("2026-11-20T08:00:00Z"),
  });

  // 09:00 -> 09:00 to 12:00 + 15 min buffer = 12:15, doesn't overlap break (12:30) => should be available
  assert.ok(slots.includes("09:00"));

  // 10:00 -> 10:00 to 13:00 overlaps break (12:30-13:30) => must NOT be available
  assert.ok(!slots.includes("10:00"));
  assert.ok(!slots.includes("10:30"));
  assert.ok(!slots.includes("11:00"));

  // 13:30 -> 13:30 to 16:30 + 15 min buffer = 16:45, fits before 18:00 => should be available
  assert.ok(slots.includes("13:30"));

  // 16:00 -> 16:00 + 180 min = 19:00, exceeds 18:00 close => must NOT be available
  assert.ok(!slots.includes("16:00"));
});

test("calculateAvailableSlots blocks conflicting existing confirmed booking", () => {
  const weeklyAvailability = {
    dayOfWeek: 2,
    isOpen: true,
    startTime: "09:00",
    endTime: "19:00",
    breaks: [],
    bufferTimeMinutes: 15,
  };

  // Existing booking from 10:00 to 13:00
  const existingBookings = [
    {
      id: "bk_1",
      startTime: "10:00",
      endTime: "13:00",
      status: "CONFIRMED",
    },
  ];

  // Try to find slots for a 2-hour (120 min) appointment when daily limit is unlimited (0)
  const slots = calculateAvailableSlots({
    dateStr: "2026-12-02",
    totalDuration: 120,
    weeklyAvailability,
    existingBookings,
    unavailabilities: [],
    settings: { minNoticeHours: 0, maxDaysInAdvance: 60, maxBookingsPerDay: 0 },
    now: new Date("2026-11-20T08:00:00Z"),
  });

  // 09:00 + 120min + 15min buffer = 11:15, overlaps 10:00-13:00 => blocked
  assert.ok(!slots.includes("09:00"));
  assert.ok(!slots.includes("10:00"));
  assert.ok(!slots.includes("11:00"));
  assert.ok(!slots.includes("12:00"));

  // 13:15 -> with buffer 15min after 13:00, 13:15 is the earliest safe start => 13:30 slot should be free
  assert.ok(slots.includes("13:30"));

  // With default maxBookingsPerDay (1), the entire day is locked once 1 validated booking exists
  const lockedDaySlots = calculateAvailableSlots({
    dateStr: "2026-12-02",
    totalDuration: 120,
    weeklyAvailability,
    existingBookings,
    unavailabilities: [],
    settings: { minNoticeHours: 0, maxDaysInAdvance: 60 },
    now: new Date("2026-11-20T08:00:00Z"),
  });
  assert.deepEqual(lockedDaySlots, []);
});

test("isSpecificSlotAvailable correctly identifies slot availability", () => {
  const weeklyAvailability = {
    dayOfWeek: 3,
    isOpen: true,
    startTime: "09:00",
    endTime: "18:00",
    breaks: [],
    bufferTimeMinutes: 15,
  };

  const isFree = isSpecificSlotAvailable({
    dateStr: "2026-12-03",
    startTime: "09:00",
    totalDuration: 120,
    weeklyAvailability,
    existingBookings: [],
    unavailabilities: [],
    settings: { minNoticeHours: 0, maxDaysInAdvance: 60 },
    now: new Date("2026-11-20T08:00:00Z"),
  });

  assert.equal(isFree, true);
});

test("calculateAvailableSlots keeps depositDeclared PENDING_PAYMENT blocked even after holdExpiresAt", () => {
  const weeklyAvailability = {
    dayOfWeek: 0, // Dimanche ouvert
    isOpen: true,
    startTime: "09:00",
    endTime: "20:00",
    breaks: [],
    bufferTimeMinutes: 15,
  };

  const existingBookings = [
    {
      id: "bk_declared",
      startTime: "10:00",
      endTime: "13:00",
      status: "PENDING_PAYMENT",
      depositDeclared: true,
      holdExpiresAt: "2026-12-05T10:00:00.000Z", // expired
    },
    {
      id: "bk_unpaid_expired",
      startTime: "15:00",
      endTime: "17:00",
      status: "PENDING_PAYMENT",
      depositDeclared: false,
      holdExpiresAt: "2026-12-05T10:00:00.000Z", // expired and not declared
    },
  ];

  const slots = calculateAvailableSlots({
    dateStr: "2026-12-06", // Sunday
    totalDuration: 120,
    weeklyAvailability,
    existingBookings,
    unavailabilities: [],
    settings: { minNoticeHours: 24, maxDaysInAdvance: 60, maxBookingsPerDay: 0 },
    now: new Date("2026-12-05T14:00:00.000Z"),
  });

  // 10:00 must stay blocked because client clicked "J'ai payé"
  assert.ok(!slots.includes("10:00"));
  assert.ok(!slots.includes("11:00"));
  // 15:00 reopened because hold expired without declaration
  assert.ok(slots.includes("15:00"));
});

test("PENDING_APPROVAL keeps slots open for multiple clients while validated bookings lock the entire day (unless reopened)", () => {
  const weeklyAvailability = {
    dayOfWeek: 2,
    isOpen: true,
    startTime: "09:00",
    endTime: "18:00",
    breaks: [],
    bufferTimeMinutes: 15,
  };
  const now = new Date("2026-11-20T08:00:00Z");

  // Two competing PENDING_APPROVAL requests on 2026-12-08 at 10:00 -> day & slot stay open for more clients
  const pendingOnly = [
    { id: "p1", date: "2026-12-08", startTime: "10:00", endTime: "12:00", status: "PENDING_APPROVAL" },
    { id: "p2", date: "2026-12-08", startTime: "10:00", endTime: "12:00", status: "PENDING_APPROVAL" },
  ];

  const openSlots = calculateAvailableSlots({
    dateStr: "2026-12-08",
    totalDuration: 120,
    weeklyAvailability,
    existingBookings: pendingOnly,
    unavailabilities: [],
    settings: { minNoticeHours: 0, maxDaysInAdvance: 60, maxBookingsPerDay: 1 },
    now,
  });
  assert.ok(openSlots.includes("10:00"));
  assert.deepEqual(
    computeBlockedDates({
      unavailabilities: [],
      existingBookings: pendingOnly,
      settings: { maxBookingsPerDay: 1 },
      now,
    }),
    []
  );

  // One request is validated -> PENDING_PAYMENT (2h hold active) -> ENTIRE day locks immediately
  const validatedOne = [
    {
      id: "p1",
      date: "2026-12-08",
      startTime: "10:00",
      endTime: "12:00",
      status: "PENDING_PAYMENT",
      depositDeclared: false,
      holdExpiresAt: "2026-11-20T10:00:00Z",
    },
    pendingOnly[1],
  ];
  assert.deepEqual(
    calculateAvailableSlots({
      dateStr: "2026-12-08",
      totalDuration: 120,
      weeklyAvailability,
      existingBookings: validatedOne,
      unavailabilities: [],
      settings: { minNoticeHours: 0, maxDaysInAdvance: 60, maxBookingsPerDay: 1 },
      now,
    }),
    []
  );
  assert.deepEqual(
    computeBlockedDates({
      unavailabilities: [],
      existingBookings: validatedOne,
      settings: { maxBookingsPerDay: 1 },
      now,
    }),
    ["2026-12-08"]
  );

  // Admin reopens 2026-12-08 manually -> 10:00 remains blocked, 13:00 opens!
  const reopenedSlots = calculateAvailableSlots({
    dateStr: "2026-12-08",
    totalDuration: 120,
    weeklyAvailability,
    existingBookings: validatedOne,
    unavailabilities: [],
    settings: {
      minNoticeHours: 0,
      maxDaysInAdvance: 60,
      maxBookingsPerDay: 1,
      reopenedDates: ["2026-12-08"],
    },
    now,
  });
  assert.ok(!reopenedSlots.includes("10:00"));
  assert.ok(reopenedSlots.includes("13:00"));
  assert.deepEqual(
    computeBlockedDates({
      unavailabilities: [],
      existingBookings: validatedOne,
      settings: { maxBookingsPerDay: 1, reopenedDates: ["2026-12-08"] },
      now,
    }),
    []
  );
});

test("parisWallTimeToUtcMs handles CET (+1) and CEST (+2) transitions accurately", () => {
  // Winter CET (UTC+1): 2026-12-01 10:00 Paris == 09:00 UTC
  assert.equal(
    new Date(parisWallTimeToUtcMs("2026-12-01", 10 * 60)).toISOString(),
    "2026-12-01T09:00:00.000Z"
  );
  // Summer CEST (UTC+2): 2026-07-15 10:00 Paris == 08:00 UTC
  assert.equal(
    new Date(parisWallTimeToUtcMs("2026-07-15", 10 * 60)).toISOString(),
    "2026-07-15T08:00:00.000Z"
  );
});
