import assert from "node:assert/strict";
import test from "node:test";
import {
  generateDaySlotTimes,
  mergeSlotsToRanges,
  buildDayMaskingModel,
  computeToggledDaySlots,
  getCalendarDayUnavailabilitySummary,
} from "../lib/slotMasking.js";
import { calculateAvailableSlots } from "../lib/availabilityEngine.js";

test("generateDaySlotTimes génère les créneaux toutes les 30 minutes dans les horaires d'ouverture", () => {
  assert.deepEqual(generateDaySlotTimes("09:00", "11:00", 30), [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
  ]);
  assert.deepEqual(generateDaySlotTimes("18:00", "09:00", 30), []);
});

test("mergeSlotsToRanges fusionne les créneaux contigus et conserve les trous", () => {
  assert.deepEqual(
    mergeSlotsToRanges(["14:30", "14:00", "15:00", "17:00", "14:00"]),
    [
      { startTime: "14:00", endTime: "15:30" },
      { startTime: "17:00", endTime: "17:30" },
    ]
  );
  assert.deepEqual(mergeSlotsToRanges([]), []);
});

test("buildDayMaskingModel identifie pauses, rendez-vous et créneaux masqués", () => {
  const weekly = {
    dayOfWeek: 5,
    isOpen: true,
    startTime: "09:00",
    endTime: "16:00",
    breaks: [{ start: "12:00", end: "13:00", label: "Pause" }],
    bufferTimeMinutes: 15,
  };
  const unavailabilities = [
    {
      id: "u1",
      date: "2026-11-20",
      isAllDay: false,
      startTime: "14:00",
      endTime: "15:00",
      reason: "Créneau masqué",
    },
  ];
  const bookings = [
    {
      id: "b1",
      date: "2026-11-20",
      startTime: "09:30",
      endTime: "11:00",
      status: "CONFIRMED",
      customer: { firstName: "Amira", lastName: "K." },
    },
    {
      id: "b2",
      date: "2026-11-20",
      startTime: "15:00",
      endTime: "16:00",
      status: "CANCELLED",
      customer: { firstName: "Annulée" },
    },
  ];

  const model = buildDayMaskingModel({
    dateStr: "2026-11-20",
    weeklyAvailability: weekly,
    unavailabilities,
    bookings,
  });

  assert.equal(model.isWeeklyClosed, false);
  assert.equal(model.isAllDayBlocked, false);
  assert.equal(model.maskedCount, 2); // 14:00 & 14:30

  const byTime = Object.fromEntries(model.slots.map((s) => [s.time, s]));
  assert.equal(byTime["09:00"].isMasked, false);
  assert.equal(byTime["09:00"].booking, null);
  assert.equal(byTime["09:30"].booking?.customerName, "Amira K.");
  assert.equal(byTime["10:30"].booking?.customerName, "Amira K.");
  assert.equal(byTime["12:00"].isBreak, true);
  assert.equal(byTime["12:30"].isBreak, true);
  assert.equal(byTime["14:00"].isMasked, true);
  assert.equal(byTime["14:30"].isMasked, true);
  // Réservation annulée ne bloque pas l'affichage créneau libre
  assert.equal(byTime["15:00"].booking, null);
});

test("computeToggledDaySlots bascule un créneau, découpe une plage ou applique Matin / Après-midi", () => {
  const model = buildDayMaskingModel({
    dateStr: "2026-11-20",
    weeklyAvailability: {
      dayOfWeek: 5,
      isOpen: true,
      startTime: "09:00",
      endTime: "17:00",
      breaks: [{ start: "12:30", end: "13:30" }],
    },
    unavailabilities: [
      {
        id: "u1",
        date: "2026-11-20",
        isAllDay: false,
        startTime: "14:00",
        endTime: "15:30",
      },
    ],
    bookings: [],
  });

  // Décocher 14:30 au milieu découpe 14:00-15:30 en deux plages propres
  const splitRes = computeToggledDaySlots({
    slots: model.slots,
    mode: "toggle-slot",
    slotTime: "14:30",
  });
  assert.deepEqual(splitRes.ranges, [
    { startTime: "14:00", endTime: "14:30" },
    { startTime: "15:00", endTime: "15:30" },
  ]);

  // Tout le matin (< 13:00, hors pause déjeuner 12:30)
  const morningRes = computeToggledDaySlots({
    slots: model.slots,
    mode: "morning",
  });
  assert.deepEqual(morningRes.ranges, [
    { startTime: "09:00", endTime: "12:30" },
    { startTime: "14:00", endTime: "15:30" },
  ]);

  // Tout libérer
  const clearRes = computeToggledDaySlots({
    slots: model.slots,
    mode: "clear",
  });
  assert.deepEqual(clearRes.ranges, []);
});

test("Les plages masquées par QuickSlotMasker ferment bien les créneaux publics correspondants", () => {
  const weekly = {
    dayOfWeek: 5,
    isOpen: true,
    startTime: "09:00",
    endTime: "18:00",
    breaks: [],
    bufferTimeMinutes: 15,
  };
  const { ranges } = computeToggledDaySlots({
    slots: buildDayMaskingModel({
      dateStr: "2026-11-20",
      weeklyAvailability: weekly,
      unavailabilities: [],
      bookings: [],
    }).slots,
    mode: "morning",
  });

  const unavailabilities = ranges.map((r) => ({
    date: "2026-11-20",
    isAllDay: false,
    startTime: r.startTime,
    endTime: r.endTime,
  }));

  const publicSlots = calculateAvailableSlots({
    dateStr: "2026-11-20",
    totalDuration: 120,
    weeklyAvailability: weekly,
    existingBookings: [],
    unavailabilities,
    settings: { minNoticeHours: 0, maxDaysInAdvance: 60 },
    now: new Date("2026-11-18T10:00:00Z"),
  });

  // Aucun créneau avant 13:00 ne doit rester disponible
  assert.equal(
    publicSlots.some((s) => s < "13:00"),
    false
  );
  assert.equal(publicSlots.includes("13:00"), true);
});

test("getCalendarDayUnavailabilitySummary retourne Repos / Fermé / Plages partielles sans décalage TZ", () => {
  const availabilities = [
    { dayOfWeek: 0, isOpen: false }, // Dimanche
    { dayOfWeek: 5, isOpen: true },  // Vendredi
  ];
  const unavailabilities = [
    { id: "1", date: "2026-11-20", isAllDay: true, reason: "Congés" },
    { id: "2", date: "2026-11-27", isAllDay: false, startTime: "14:00", endTime: "16:00" },
  ];

  // Dimanche 22 novembre 2026
  const sun = getCalendarDayUnavailabilitySummary({
    dateStr: "2026-11-22",
    availabilities,
    unavailabilities,
  });
  assert.equal(sun.isWeeklyClosed, true);

  // Vendredi 20 novembre 2026 (fermé toute la journée)
  const friBlocked = getCalendarDayUnavailabilitySummary({
    dateStr: "2026-11-20",
    availabilities,
    unavailabilities,
  });
  assert.equal(friBlocked.isWeeklyClosed, false);
  assert.equal(friBlocked.isAllDayBlocked, true);

  // Vendredi 27 novembre 2026 (partiel)
  const friPartial = getCalendarDayUnavailabilitySummary({
    dateStr: "2026-11-27",
    availabilities,
    unavailabilities,
  });
  assert.equal(friPartial.isAllDayBlocked, false);
  assert.equal(friPartial.partialRanges.length, 1);
  assert.equal(friPartial.partialRanges[0].startTime, "14:00");
});
