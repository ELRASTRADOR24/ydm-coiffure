/**
 * MOTEUR INTELLIGENT DE GESTION DES DISPONIBILITÉS — YDM COIFFURE
 * Gère le calcul des créneaux en temps réel, les conflits, les durées,
 * les pauses, les temps de battement et les règles d'avance.
 */

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

  // 1. Vérification de la fenêtre de réservation (date dans le futur et < maxDaysInAdvance)
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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

  // C. Réservations existantes (Confirmées, En attente, ou Paiement en cours non expiré)
  const currentTimeMs = now.getTime();
  for (const b of existingBookings) {
    // Ignorer les annulées, refusées ou expirées
    if (["CANCELLED", "REJECTED"].includes(b.status)) {
      continue;
    }

    if (b.status === "EXPIRED") {
      continue;
    }

    // Si PENDING_PAYMENT mais que le délai de blocage est expiré, ignorer
    if (
      b.status === "PENDING_PAYMENT" &&
      b.holdExpiresAt &&
      new Date(b.holdExpiresAt).getTime() < currentTimeMs
    ) {
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
  const minNoticeThresholdMs = now.getTime() + minNoticeHours * 60 * 60 * 1000;

  for (
    let candidateStart = workStartMin;
    candidateStart + totalDuration <= workEndMin;
    candidateStart += slotIntervalMinutes
  ) {
    const candidateEnd = candidateStart + totalDuration;
    // On ajoute le buffer pour vérifier que le créneau suivant pourra respecter le battement
    const candidateEndWithBuffer = candidateEnd + bufferMinutes;

    // A. Vérification du délai minimum (minNoticeHours)
    const slotDateTime = new Date(`${dateStr}T${minutesToTime(candidateStart)}:00`);
    if (slotDateTime.getTime() < minNoticeThresholdMs) {
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
