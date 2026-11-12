/**
 * MOTEUR INTELLIGENT DE GESTION DES DISPONIBILITÉS — YDM COIFFURE
 * Gère le calcul des créneaux en temps réel, les conflits, les durées,
 * les pauses, les temps de battement et les règles d'avance (toujours en heure Europe/Paris).
 */

const parisPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getParisWallParts(date) {
  const parts = {};
  for (const { type, value } of parisPartsFormatter.formatToParts(date)) {
    if (type !== "literal") {
      parts[type] = Number(value);
    }
  }
  return parts;
}

export function parisWallTimeToUtcMs(dateStr, minutesFromMidnight = 0) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  const targetAsUtc = Date.UTC(y, m - 1, d, hours, minutes, 0);

  let guess = targetAsUtc;
  for (let i = 0; i < 2; i += 1) {
    const p = getParisWallParts(new Date(guess));
    const gotAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const diff = gotAsUtc - targetAsUtc;
    if (diff === 0) break;
    guess -= diff;
  }
  return guess;
}

// Convertit "09:30" en minutes depuis minuit (570)
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Convertit des minutes depuis minuit (570) en "09:30"
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Vérifie si deux intervalles temporels se chevauchent
export function doIntervalsOverlap(startA, endA, startB, endB) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Indique si une réservation retient réellement son créneau :
 * - PENDING_APPROVAL n'est PAS bloquant : plusieurs clientes peuvent demander le même créneau
 *   tant que la coiffeuse n'en a pas validé un.
 * - CONFIRMED, RESCHEDULE_PROPOSED et PENDING_PAYMENT (non expiré ou acompte déclaré) bloquent.
 */
export function isValidatedHoldingBooking(booking, now = new Date()) {
  if (!booking) return false;
  if (["CANCELLED", "REJECTED", "EXPIRED", "PENDING_APPROVAL"].includes(booking.status)) {
    return false;
  }
  const currentTimeMs =
    typeof now === "number"
      ? now
      : (now instanceof Date ? now : new Date(now)).getTime();
  if (
    booking.status === "PENDING_PAYMENT" &&
    !booking.depositDeclared &&
    booking.holdExpiresAt &&
    new Date(booking.holdExpiresAt).getTime() < currentTimeMs
  ) {
    return false;
  }
  return true;
}

/**
 * Vérifie si la journée entière est verrouillée automatiquement parce qu'elle
 * a déjà atteint le plafond journalier de réservations validées (1 par défaut)
 * sans avoir été manuellement réouverte par l'admin.
 */
export function isDayLockedByValidatedBookings({
  dateStr,
  existingBookings = [],
  settings = {},
  now = new Date(),
}) {
  const rawMax = settings?.maxBookingsPerDay;
  const maxBookingsPerDay =
    rawMax === undefined || rawMax === null ? 1 : Number(rawMax);
  if (!Number.isFinite(maxBookingsPerDay) || maxBookingsPerDay <= 0) {
    return false;
  }

  const reopenedDates = Array.isArray(settings?.reopenedDates)
    ? settings.reopenedDates
    : [];
  if (dateStr && reopenedDates.includes(dateStr)) {
    return false;
  }

  const currentTimeMs =
    typeof now === "number"
      ? now
      : (now instanceof Date ? now : new Date(now)).getTime();

  const dayValidatedCount = (existingBookings || []).filter(
    (b) =>
      (!b?.date || !dateStr || b.date === dateStr) &&
      isValidatedHoldingBooking(b, currentTimeMs)
  ).length;

  return dayValidatedCount >= maxBookingsPerDay;
}

/**
 * Calcule l'ensemble des dates (YYYY-MM-DD) indisponibles pour les clientes :
 * fermetures exceptionnelles all-day + journées ayant déjà atteint leur capacité validée.
 */
export function computeBlockedDates({
  unavailabilities = [],
  existingBookings = [],
  settings = {},
  now = new Date(),
}) {
  const blockedSet = new Set(
    (unavailabilities || [])
      .filter((u) => u && u.isAllDay && u.date)
      .map((u) => u.date)
  );

  const rawMax = settings?.maxBookingsPerDay;
  const maxBookingsPerDay =
    rawMax === undefined || rawMax === null ? 1 : Number(rawMax);

  if (Number.isFinite(maxBookingsPerDay) && maxBookingsPerDay > 0) {
    const reopenedSet = new Set(
      Array.isArray(settings?.reopenedDates) ? settings.reopenedDates : []
    );
    const currentTimeMs =
      typeof now === "number"
        ? now
        : (now instanceof Date ? now : new Date(now)).getTime();

    const countsByDate = {};
    for (const b of existingBookings || []) {
      if (!b?.date) continue;
      if (!isValidatedHoldingBooking(b, currentTimeMs)) continue;
      countsByDate[b.date] = (countsByDate[b.date] || 0) + 1;
    }

    for (const [dStr, count] of Object.entries(countsByDate)) {
      if (count >= maxBookingsPerDay && !reopenedSet.has(dStr)) {
        blockedSet.add(dStr);
      }
    }
  }

  return Array.from(blockedSet).sort();
}

/**
 * Calcule tous les créneaux disponibles pour une date donnée et une durée totale de prestation.
 *
 * @param {Object} params
 * @param {string} params.dateStr - Date au format "YYYY-MM-DD"
 * @param {number} params.totalDuration - Durée totale de la prestation en minutes (service + options)
 * @param {Object} params.weeklyAvailability - Configuration pour le jour de la semaine
 * @param {Array} params.existingBookings - Liste des réservations pour ce jour
 * @param {Array} params.unavailabilities - Liste des congés/indisponibilités
 * @param {Object} params.settings - Paramètres généraux du salon
 * @param {Date} [params.now] - Date et heure actuelles pour le contrôle du délai minimum
 * @returns {Array<string>} - Liste des heures de début disponibles (ex: ["09:00", "13:45", "14:15"])
 */
export function calculateAvailableSlots({
  dateStr,
  totalDuration,
  weeklyAvailability,
  existingBookings = [],
  unavailabilities = [],
  settings = {},
  now = new Date(),
}) {
  const slotIntervalMinutes = 30; // Pas de début de créneau (toutes les 30 min)
  const bufferMinutes = weeklyAvailability?.bufferTimeMinutes ?? 15;
  const minNoticeHours = settings?.minNoticeHours ?? 24;
  const maxDaysInAdvance = settings?.maxDaysInAdvance ?? 60;

  // 1. Vérification de la fenêtre de réservation (en date calendaire Europe/Paris)
  const [ty, tm, td] = dateStr.split("-").map(Number);
  const targetDayUtcMs = Date.UTC(ty, tm - 1, td);
  const nowParts = getParisWallParts(now instanceof Date ? now : new Date(now));
  const parisTodayUtcMs = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
  const diffDays = Math.round((targetDayUtcMs - parisTodayUtcMs) / 86400000);

  if (diffDays < 0 || diffDays > maxDaysInAdvance) {
    return [];
  }

  // 2. Vérification du jour travaillé
  if (!weeklyAvailability || !weeklyAvailability.isOpen) {
    return [];
  }

  // 3. Vérification des indisponibilités de la journée
  const dayUnavailabilities = unavailabilities.filter((u) => u.date === dateStr);
  const isAllDayBlocked = dayUnavailabilities.some((u) => u.isAllDay);
  if (isAllDayBlocked) {
    return [];
  }

  // 3b. Verrouillage automatique de la journée dès qu'un rendez-vous est validé (plafond journalier interne)
  if (
    isDayLockedByValidatedBookings({
      dateStr,
      existingBookings,
      settings,
      now,
    })
  ) {
    return [];
  }

  const workStartMin = timeToMinutes(weeklyAvailability.startTime || "09:00");
  const workEndMin = timeToMinutes(weeklyAvailability.endTime || "19:00");

  // Si la durée de la prestation dépasse la journée de travail entière
  if (totalDuration > workEndMin - workStartMin) {
    return [];
  }

  // 4. Construction de la liste des intervalles bloqués (Minutes)
  const blockedIntervals = [];

  // A. Pauses
  if (weeklyAvailability.breaks && Array.isArray(weeklyAvailability.breaks)) {
    for (const b of weeklyAvailability.breaks) {
      if (b.start && b.end) {
        blockedIntervals.push({
          start: timeToMinutes(b.start),
          end: timeToMinutes(b.end),
          type: "break",
        });
      }
    }
  }

  // B. Indisponibilités partielles
  for (const unav of dayUnavailabilities) {
    if (!unav.isAllDay && unav.startTime && unav.endTime) {
      blockedIntervals.push({
        start: timeToMinutes(unav.startTime),
        end: timeToMinutes(unav.endTime),
        type: "unavailability",
      });
    }
  }

  // C. Réservations existantes validées (Confirmées, Date proposée, ou Paiement en cours non expiré / acompte déclaré)
  // Les demandes PENDING_APPROVAL ne bloquent pas : plusieurs clientes peuvent proposer le même créneau.
  const currentTimeMs = (now instanceof Date ? now : new Date(now)).getTime();
  for (const b of existingBookings) {
    if (b.date && b.date !== dateStr) {
      continue;
    }
    if (!isValidatedHoldingBooking(b, currentTimeMs)) {
      continue;
    }

    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);

    // Ajouter le temps de battement après la prestation
    blockedIntervals.push({
      start: bStart,
      end: bEnd + bufferMinutes,
      type: "booking",
    });
  }

  // 5. Génération et vérification de chaque créneau potentiel
  const availableSlots = [];
  const minNoticeThresholdMs = currentTimeMs + minNoticeHours * 60 * 60 * 1000;

  for (
    let candidateStart = workStartMin;
    candidateStart + totalDuration <= workEndMin;
    candidateStart += slotIntervalMinutes
  ) {
    const candidateEnd = candidateStart + totalDuration;
    // On ajoute le buffer pour vérifier que le créneau suivant pourra respecter le battement
    const candidateEndWithBuffer = candidateEnd + bufferMinutes;

    // A. Vérification du délai minimum (minNoticeHours, toujours en heure Europe/Paris)
    const slotUtcMs = parisWallTimeToUtcMs(dateStr, candidateStart);
    if (slotUtcMs < minNoticeThresholdMs) {
      continue;
    }

    // B. Vérification de collision avec les intervalles bloqués
    let hasConflict = false;
    for (const blocked of blockedIntervals) {
      if (
        doIntervalsOverlap(
          candidateStart,
          candidateEndWithBuffer,
          blocked.start,
          blocked.end
        )
      ) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      availableSlots.push(minutesToTime(candidateStart));
    }
  }

  return availableSlots;
}

/**
 * Vérifie de façon stricte et atomique si un créneau précis est libre
 */
export function isSpecificSlotAvailable({
  dateStr,
  startTime,
  totalDuration,
  weeklyAvailability,
  existingBookings = [],
  unavailabilities = [],
  settings = {},
  excludeBookingId = null,
  now = new Date(),
}) {
  const availableSlots = calculateAvailableSlots({
    dateStr,
    totalDuration,
    weeklyAvailability,
    existingBookings: existingBookings.filter(
      (b) =>
        !excludeBookingId ||
        (b._id ? b._id.toString() : b.id) !== excludeBookingId.toString()
    ),
    unavailabilities,
    settings,
    now,
  });

  return availableSlots.includes(startTime);
}
