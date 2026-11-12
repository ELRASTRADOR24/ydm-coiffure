import {
  timeToMinutes,
  minutesToTime,
  doIntervalsOverlap,
} from "./availabilityEngine.js";
import { isValidTimeString } from "./adminHelpers.js";

export const DEFAULT_SLOT_STEP_MINUTES = 30;
export const AFTERNOON_SPLIT_MINUTES = 13 * 60; // 13:00

/**
 * Retourne le jour de la semaine (0 = Dimanche .. 6 = Samedi) pour "YYYY-MM-DD"
 * sans jamais subir de décalage horaire/UTC.
 */
export function getDayOfWeekFromDateStr(dateStr) {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }
  const dt = new Date(`${dateStr}T12:00:00Z`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.getUTCDay();
}

/**
 * Génère la liste ordonnée des heures de créneaux possibles entre startTime et endTime.
 */
export function generateDaySlotTimes(
  startTime = "09:00",
  endTime = "19:00",
  stepMinutes = DEFAULT_SLOT_STEP_MINUTES
) {
  const safeStart = isValidTimeString(startTime) ? startTime : "09:00";
  const safeEnd = isValidTimeString(endTime) ? endTime : "19:00";
  const startMin = timeToMinutes(safeStart);
  const endMin = timeToMinutes(safeEnd);
  const step = Math.max(15, Number(stepMinutes) || DEFAULT_SLOT_STEP_MINUTES);

  if (startMin >= endMin) return [];

  const result = [];
  for (let m = startMin; m + step <= endMin; m += step) {
    result.push(minutesToTime(m));
  }
  return result;
}

/**
 * Fusionne une liste de créneaux individuels (ex: ["14:00", "14:30", "15:00"])
 * en plages horaires contiguës [{ startTime: "14:00", endTime: "15:30" }].
 */
export function mergeSlotsToRanges(
  slotTimes = [],
  stepMinutes = DEFAULT_SLOT_STEP_MINUTES
) {
  if (!Array.isArray(slotTimes) || slotTimes.length === 0) return [];
  const step = Math.max(15, Number(stepMinutes) || DEFAULT_SLOT_STEP_MINUTES);

  const uniqueMins = Array.from(
    new Set(
      slotTimes
        .filter((t) => isValidTimeString(t))
        .map((t) => timeToMinutes(t))
    )
  ).sort((a, b) => a - b);

  if (uniqueMins.length === 0) return [];

  const ranges = [];
  let runStart = uniqueMins[0];
  let runEnd = uniqueMins[0] + step;

  for (let i = 1; i < uniqueMins.length; i += 1) {
    const m = uniqueMins[i];
    if (m <= runEnd) {
      runEnd = Math.max(runEnd, m + step);
    } else {
      ranges.push({
        startTime: minutesToTime(runStart),
        endTime: minutesToTime(runEnd),
      });
      runStart = m;
      runEnd = m + step;
    }
  }

  ranges.push({
    startTime: minutesToTime(runStart),
    endTime: minutesToTime(runEnd),
  });

  return ranges;
}

function isBookingBlockingOnAdminGrid(booking, nowMs) {
  if (!booking || !booking.startTime || !booking.endTime) return false;
  if (["CANCELLED", "REJECTED", "EXPIRED", "PENDING_APPROVAL"].includes(booking.status)) {
    return false;
  }
  if (
    booking.status === "PENDING_PAYMENT" &&
    !booking.depositDeclared &&
    booking.holdExpiresAt &&
    new Date(booking.holdExpiresAt).getTime() < nowMs
  ) {
    return false;
  }
  return true;
}

/**
 * Construit le modèle complet d'un jour pour la check-list de masquage de créneaux.
 */
export function buildDayMaskingModel({
  dateStr,
  weeklyAvailability,
  unavailabilities = [],
  bookings = [],
  stepMinutes = DEFAULT_SLOT_STEP_MINUTES,
  now = new Date(),
}) {
  const step = Math.max(15, Number(stepMinutes) || DEFAULT_SLOT_STEP_MINUTES);
  const dayUnavs = (unavailabilities || []).filter(
    (u) => u && u.date === dateStr
  );
  const isAllDayBlocked = dayUnavs.some((u) => Boolean(u.isAllDay));

  const partialUnavs = dayUnavs
    .filter(
      (u) =>
        !u.isAllDay &&
        isValidTimeString(u.startTime) &&
        isValidTimeString(u.endTime) &&
        timeToMinutes(u.startTime) < timeToMinutes(u.endTime)
    )
    .map((u) => ({
      id: u.id || u._id || `${u.startTime}-${u.endTime}`,
      startTime: u.startTime,
      endTime: u.endTime,
      reason: u.reason || "Créneau masqué",
      startMin: timeToMinutes(u.startTime),
      endMin: timeToMinutes(u.endTime),
    }))
    .sort((a, b) => a.startMin - b.startMin);

  if (!weeklyAvailability || !weeklyAvailability.isOpen) {
    return {
      isWeeklyClosed: true,
      isAllDayBlocked,
      startTime: weeklyAvailability?.startTime || "09:00",
      endTime: weeklyAvailability?.endTime || "19:00",
      maskedRanges: partialUnavs.map(({ id, startTime, endTime, reason }) => ({
        id,
        startTime,
        endTime,
        reason,
      })),
      slots: [],
      maskedCount: 0,
      allDayReason:
        dayUnavs.find((u) => u.isAllDay)?.reason || "Fermeture exceptionnelle",
    };
  }

  const startTime = isValidTimeString(weeklyAvailability.startTime)
    ? weeklyAvailability.startTime
    : "09:00";
  const endTime = isValidTimeString(weeklyAvailability.endTime)
    ? weeklyAvailability.endTime
    : "19:00";

  const breaks = (weeklyAvailability.breaks || [])
    .filter(
      (b) =>
        b &&
        isValidTimeString(b.start) &&
        isValidTimeString(b.end) &&
        timeToMinutes(b.start) < timeToMinutes(b.end)
    )
    .map((b) => ({
      startMin: timeToMinutes(b.start),
      endMin: timeToMinutes(b.end),
    }));

  const nowMs = (now instanceof Date ? now : new Date(now)).getTime();
  const activeBookings = (bookings || [])
    .filter((b) => b && b.date === dateStr && isBookingBlockingOnAdminGrid(b, nowMs))
    .map((b) => ({
      id: b.id || b._id,
      customerName: [b.customer?.firstName, b.customer?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "Cliente",
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      startMin: timeToMinutes(b.startTime),
      endMin: timeToMinutes(b.endTime),
    }));

  const times = generateDaySlotTimes(startTime, endTime, step);
  const slots = times.map((t) => {
    const sMin = timeToMinutes(t);
    const eMin = sMin + step;

    const isBreak = breaks.some((br) =>
      doIntervalsOverlap(sMin, eMin, br.startMin, br.endMin)
    );
    const matchingBooking =
      activeBookings.find((bk) =>
        doIntervalsOverlap(sMin, eMin, bk.startMin, bk.endMin)
      ) || null;
    const isMasked =
      !isAllDayBlocked &&
      partialUnavs.some((pu) =>
        doIntervalsOverlap(sMin, eMin, pu.startMin, pu.endMin)
      );

    return {
      time: t,
      endTime: minutesToTime(eMin),
      minutes: sMin,
      isBreak,
      booking: matchingBooking
        ? {
            id: matchingBooking.id,
            customerName: matchingBooking.customerName,
            startTime: matchingBooking.startTime,
            endTime: matchingBooking.endTime,
            status: matchingBooking.status,
          }
        : null,
      isMasked,
    };
  });

  return {
    isWeeklyClosed: false,
    isAllDayBlocked,
    startTime,
    endTime,
    maskedRanges: partialUnavs.map(({ id, startTime: st, endTime: et, reason }) => ({
      id,
      startTime: st,
      endTime: et,
      reason,
    })),
    slots,
    maskedCount: slots.filter((s) => s.isMasked).length,
    allDayReason:
      dayUnavs.find((u) => u.isAllDay)?.reason || "Fermeture exceptionnelle",
  };
}

/**
 * Calcule le nouvel ensemble de créneaux masqués et les plages fusionnées
 * après une action simple : basculer un créneau, le matin, l'après-midi ou tout effacer.
 */
export function computeToggledDaySlots({
  slots = [],
  mode = "toggle-slot",
  slotTime = "",
  stepMinutes = DEFAULT_SLOT_STEP_MINUTES,
}) {
  const selectableSlots = slots.filter((s) => !s.isBreak && !s.booking);
  const currentMasked = new Set(
    selectableSlots.filter((s) => s.isMasked).map((s) => s.time)
  );

  if (mode === "clear") {
    return { nextMaskedTimes: [], ranges: [] };
  }

  if (mode === "toggle-slot") {
    const target = selectableSlots.find((s) => s.time === slotTime);
    if (target) {
      if (currentMasked.has(slotTime)) {
        currentMasked.delete(slotTime);
      } else {
        currentMasked.add(slotTime);
      }
    }
  } else if (mode === "morning" || mode === "afternoon") {
    const periodSlots = selectableSlots.filter((s) =>
      mode === "morning"
        ? s.minutes < AFTERNOON_SPLIT_MINUTES
        : s.minutes >= AFTERNOON_SPLIT_MINUTES
    );
    const allAlreadyMasked =
      periodSlots.length > 0 &&
      periodSlots.every((s) => currentMasked.has(s.time));

    for (const s of periodSlots) {
      if (allAlreadyMasked) {
        currentMasked.delete(s.time);
      } else {
        currentMasked.add(s.time);
      }
    }
  }

  const nextMaskedTimes = Array.from(currentMasked).sort(
    (a, b) => timeToMinutes(a) - timeToMinutes(b)
  );
  return {
    nextMaskedTimes,
    ranges: mergeSlotsToRanges(nextMaskedTimes, stepMinutes),
  };
}

/**
 * Résumé rapide d'indisponibilité d'une date pour les pastilles du calendrier mensuel.
 */
export function getCalendarDayUnavailabilitySummary({
  dateStr,
  availabilities = [],
  unavailabilities = [],
}) {
  const dow = getDayOfWeekFromDateStr(dateStr);
  const weekly =
    dow === null
      ? null
      : (availabilities || []).find((a) => a.dayOfWeek === dow) || null;
  const dayUnavs = (unavailabilities || []).filter(
    (u) => u && u.date === dateStr
  );
  const isAllDayBlocked = dayUnavs.some((u) => Boolean(u.isAllDay));
  const partialRanges = dayUnavs
    .filter((u) => !u.isAllDay && u.startTime && u.endTime)
    .map((u) => ({
      id: u.id || u._id || `${u.startTime}-${u.endTime}`,
      startTime: u.startTime,
      endTime: u.endTime,
      reason: u.reason || "Créneau masqué",
    }))
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return {
    isWeeklyClosed: weekly ? !weekly.isOpen : false,
    isAllDayBlocked,
    partialRanges,
    allDayReason: dayUnavs.find((u) => u.isAllDay)?.reason || "",
  };
}
