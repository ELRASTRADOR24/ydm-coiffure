import { timeToMinutes, doIntervalsOverlap } from "./availabilityEngine.js";
import {
  formatOptionChoiceDisplayLabel,
  isLengthOption,
} from "./servicePricing.js";

/**
 * Retourne la date courante au format "YYYY-MM-DD" dans le fuseau Europe/Paris
 * (évite le décalage d'un jour autour de minuit causé par UTC / toISOString()).
 */
export function getParisDateString(date = new Date()) {
  const safeDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(safeDate.getTime())) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(safeDate);
}

/**
 * Vérifie qu'une chaîne correspond à une date calendaire réelle YYYY-MM-DD.
 */
export function isValidDateString(dateStr) {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  return (
    utc.getUTCFullYear() === y &&
    utc.getUTCMonth() === m - 1 &&
    utc.getUTCDate() === d
  );
}

/**
 * Vérifie qu'une chaîne correspond à une heure valide HH:mm (00:00 à 23:59).
 */
export function isValidTimeString(timeStr) {
  return typeof timeStr === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);
}

/**
 * Génère de façon exacte (en UTC, sans dérive de changement d'heure été/hiver)
 * toutes les dates incluses entre startDate et endDate ("YYYY-MM-DD").
 */
export function expandDateRangeInclusive(startDate, endDate, maxDays = 366) {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    return {
      error: "Format de date invalide (attendu : AAAA-MM-JJ).",
    };
  }

  const [y1, m1, d1] = startDate.split("-").map(Number);
  const [y2, m2, d2] = endDate.split("-").map(Number);

  const startMs = Date.UTC(y1, m1 - 1, d1);
  const endMs = Date.UTC(y2, m2 - 1, d2);

  if (startMs > endMs) {
    return {
      error: "La date de fin doit être postérieure ou égale à la date de début.",
    };
  }

  const totalDays = Math.round((endMs - startMs) / 86400000) + 1;
  if (totalDays > maxDays) {
    return {
      error: `La période sélectionnée ne peut pas dépasser ${maxDays} jours.`,
    };
  }

  const dates = [];
  const curr = new Date(startMs);
  for (let i = 0; i < totalDays; i += 1) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return { dates };
}

/**
 * Contrôle réel de conflit pour les rendez-vous manuels ajoutés par l'admin :
 * vérifie uniquement les chevauchements avec les rendez-vous actifs et les
 * indisponibilités du jour — sans imposer le délai d'avance client (24h),
 * ni le pas fixe de 30 minutes, ni les horaires standards si l'admin force un créneau.
 */
export function findManualBookingConflict({
  date,
  startTime,
  duration,
  existingBookings = [],
  unavailabilities = [],
  excludeBookingId = null,
  now = new Date(),
}) {
  if (!isValidDateString(date)) {
    return {
      conflict: true,
      type: "invalid",
      reason: "Veuillez saisir une date valide.",
    };
  }
  if (!isValidTimeString(startTime)) {
    return {
      conflict: true,
      type: "invalid",
      reason: "Veuillez saisir une heure de début valide (HH:mm).",
    };
  }

  const dur = Number(duration);
  if (!Number.isFinite(dur) || dur <= 0) {
    return {
      conflict: true,
      type: "invalid",
      reason: "Durée de prestation invalide.",
    };
  }

  const startMin = timeToMinutes(startTime);
  const endMin = startMin + Math.round(dur);
  if (endMin > 24 * 60) {
    return {
      conflict: true,
      type: "bounds",
      reason: "La prestation dépasse minuit. Choisissez un horaire plus tôt.",
    };
  }

  const currentTimeMs = now instanceof Date ? now.getTime() : Date.now();

  for (const unav of unavailabilities) {
    if (!unav || unav.date !== date) continue;
    if (unav.isAllDay) {
      return {
        conflict: true,
        type: "unavailability",
        unavailability: unav,
        reason: `Cette journée est marquée comme indisponible${unav.reason ? ` (${unav.reason})` : ""}.`,
      };
    }
    if (isValidTimeString(unav.startTime) && isValidTimeString(unav.endTime)) {
      const uStart = timeToMinutes(unav.startTime);
      const uEnd = timeToMinutes(unav.endTime);
      if (doIntervalsOverlap(startMin, endMin, uStart, uEnd)) {
        return {
          conflict: true,
          type: "unavailability",
          unavailability: unav,
          reason: `Ce créneau chevauche une indisponibilité (${unav.startTime} - ${unav.endTime}).`,
        };
      }
    }
  }

  for (const b of existingBookings) {
    if (!b || b.date !== date) continue;
    const bId = b._id ? b._id.toString() : b.id;
    if (excludeBookingId && bId && bId === String(excludeBookingId)) {
      continue;
    }
    if (["CANCELLED", "REJECTED", "EXPIRED"].includes(b.status)) {
      continue;
    }
    if (
      b.status === "PENDING_PAYMENT" &&
      !b.depositDeclared &&
      b.holdExpiresAt &&
      new Date(b.holdExpiresAt).getTime() < currentTimeMs
    ) {
      continue;
    }
    if (!isValidTimeString(b.startTime) || !isValidTimeString(b.endTime)) {
      continue;
    }

    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    if (doIntervalsOverlap(startMin, endMin, bStart, bEnd)) {
      const clientLabel = [b.customer?.firstName, b.customer?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return {
        conflict: true,
        type: "booking",
        booking: b,
        reason: `Ce créneau chevauche le rendez-vous${clientLabel ? ` de ${clientLabel}` : ""} (${b.startTime} - ${b.endTime}).`,
      };
    }
  }

  return { conflict: false };
}

/**
 * Formate Code Postal & Ville pour l'affichage initial dans un champ texte libre.
 */
export function formatPostalCityValue(homeAddress) {
  if (
    !homeAddress ||
    (homeAddress.postalCode === undefined && homeAddress.city === undefined)
  ) {
    return "85000 La Roche-sur-Yon";
  }
  const cp = String(homeAddress.postalCode ?? "").trim();
  const city = String(homeAddress.city ?? "").trim();
  if (cp && city) return `${cp} ${city}`;
  return cp || city || "";
}

/**
 * Extrait code postal et ville à partir d'une saisie libre (n'efface jamais les espaces pendant la frappe).
 */
export function parsePostalCityInput(rawInput) {
  const trimmed = String(rawInput ?? "").trim();
  if (!trimmed) {
    return { postalCode: "", city: "" };
  }
  const match = trimmed.match(/^(\S+)(?:\s+([\s\S]*))?$/);
  if (!match) {
    return { postalCode: trimmed, city: "" };
  }
  return {
    postalCode: match[1] || "",
    city: (match[2] || "").trim(),
  };
}

/**
 * Retourne le libellé français d'un statut de réservation.
 */
export function getBookingStatusLabel(status) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmé";
    case "PENDING_APPROVAL":
      return "À valider";
    case "PENDING_PAYMENT":
      return "En attente de paiement";
    case "REJECTED":
      return "Refusé";
    case "CANCELLED":
      return "Annulé";
    case "EXPIRED":
      return "Expiré";
    case "COMPLETED":
      return "Terminé";
    default:
      return status || "Inconnu";
  }
}

/**
 * Filtre les réservations selon l'onglet sélectionné dans l'administration.
 * L'onglet "Annulées / Refusées" (id: "CANCELLED") regroupe CANCELLED, REJECTED et EXPIRED.
 */
export function matchesBookingStatusFilter(bookingStatus, filterTab) {
  if (!filterTab || filterTab === "ALL") return true;
  if (filterTab === "CANCELLED") {
    return ["CANCELLED", "REJECTED", "EXPIRED"].includes(bookingStatus);
  }
  return bookingStatus === filterTab;
}

/**
 * Garantit un slug unique pour éviter les erreurs Mongo E11000 lors de créations/renommages.
 */
export function ensureUniqueServiceSlug(
  baseSlug,
  existingServices = [],
  excludeServiceId = null
) {
  const cleanBase = String(baseSlug || "prestation").trim() || "prestation";
  const taken = new Set(
    existingServices
      .filter((s) => {
        const sId = s?._id ? s._id.toString() : s?.id;
        return !excludeServiceId || sId !== String(excludeServiceId);
      })
      .map((s) => String(s?.slug || "").toLowerCase())
      .filter(Boolean)
  );

  if (!taken.has(cleanBase.toLowerCase())) {
    return cleanBase;
  }

  let suffix = 2;
  while (taken.has(`${cleanBase}-${suffix}`.toLowerCase())) {
    suffix += 1;
  }
  return `${cleanBase}-${suffix}`;
}

/**
 * Valide les options soumises par une cliente contre la définition réelle en base de données
 * et calcule les montants/durées autoritatifs (empêche la manipulation côté client).
 */
export function resolveValidatedBookingOptions(service, selectedOptions = []) {
  const serviceOptions = Array.isArray(service?.options) ? service.options : [];
  const matchedByOptionName = new Map();
  let hairColorOption = null;
  let studentDiscountApplied = false;

  const list = Array.isArray(selectedOptions) ? selectedOptions : [];
  for (const rawOpt of list) {
    if (!rawOpt || typeof rawOpt !== "object") continue;
    const optName = String(rawOpt.name || "").trim();
    const optChoice = String(rawOpt.choice || "").trim();

    if (!optName) {
      return { error: "Option de prestation invalide." };
    }

    if (optName === "Couleur des mèches") {
      if (!service?.includesHair) {
        return {
          error:
            "La sélection de couleur des mèches n'est pas proposée pour cette prestation.",
        };
      }
      hairColorOption = {
        name: "Couleur des mèches",
        choice: optChoice.slice(0, 140) || "À convenir avec Maydie",
        priceDiff: 0,
        durationDiff: 0,
      };
      continue;
    }

    if (optName === "Réduction Étudiante") {
      if (!service?.includesHair) {
        return {
          error:
            "La réduction étudiante s'applique uniquement aux prestations avec mèches incluses.",
        };
      }
      studentDiscountApplied = true;
      continue;
    }

    const matchingDef = serviceOptions.find(
      (o) => String(o?.name || "").trim() === optName
    );
    if (!matchingDef) {
      return {
        error: `L'option "${optName}" n'est plus proposée pour cette prestation. Veuillez actualiser la page.`,
      };
    }

    const choices = Array.isArray(matchingDef.choices) ? matchingDef.choices : [];
    const matchingChoice = choices.find((c) => {
      if (String(c?.label || "").trim() === optChoice) return true;
      if (isLengthOption(matchingDef)) {
        return (
          formatOptionChoiceDisplayLabel(c, service?.price, true) === optChoice
        );
      }
      return false;
    });
    if (!matchingChoice) {
      return {
        error: `Le choix "${optChoice || optName}" n'est plus valide pour cette prestation. Veuillez actualiser la page.`,
      };
    }

    const storedChoiceLabel = isLengthOption(matchingDef)
      ? formatOptionChoiceDisplayLabel(matchingChoice, service?.price, true)
      : String(matchingChoice.label || "").trim();

    matchedByOptionName.set(matchingDef.name, {
      name: matchingDef.name,
      choice: storedChoiceLabel,
      priceDiff: Number(matchingChoice.priceDiff) || 0,
      durationDiff: Number(matchingChoice.durationDiff) || 0,
    });
  }

  for (const def of serviceOptions) {
    if (
      def?.required &&
      Array.isArray(def.choices) &&
      def.choices.length > 0 &&
      !matchedByOptionName.has(def.name)
    ) {
      return {
        error: `Veuillez sélectionner une option pour « ${def.name} ».`,
      };
    }
  }

  const validatedOptions = [];
  for (const def of serviceOptions) {
    if (matchedByOptionName.has(def.name)) {
      validatedOptions.push(matchedByOptionName.get(def.name));
    }
  }
  if (hairColorOption) {
    validatedOptions.push(hairColorOption);
  }
  if (studentDiscountApplied) {
    validatedOptions.push({
      name: "Réduction Étudiante",
      choice: "-5 € (justificatif requis)",
      priceDiff: -5,
      durationDiff: 0,
    });
  }

  const basePrice = Number(service?.price) || 0;
  const baseDuration = Number(service?.duration) || 60;
  const priceDiffSum = validatedOptions.reduce(
    (sum, opt) => sum + (Number(opt.priceDiff) || 0),
    0
  );
  const durationDiffSum = validatedOptions.reduce(
    (sum, opt) => sum + (Number(opt.durationDiff) || 0),
    0
  );

  return {
    validatedOptions,
    totalPrice: Math.max(0, basePrice + priceDiffSum),
    totalDuration: Math.max(15, baseDuration + durationDiffSum),
  };
}

export const DEFAULT_PAYMENT_ACCOUNTS = {
  revolutEnabled: true,
  revolutTag: "@ydmcoiffure",
  paypalEnabled: true,
  paypalHandle: "ydmcoiffure",
  weroEnabled: true,
  weroPhone: "07 67 66 38 69",
};

/**
 * Normalise les comptes directs d'acompte (Revolut, PayPal, Wero) pour
 * l'affichage public et la page de suivi sans risque de lien cassé.
 */
export function resolvePaymentAccounts(settings = {}) {
  const raw = settings?.paymentAccounts || {};

  // 1. Revolut
  const rawRevolut =
    raw.revolutTag !== undefined && raw.revolutTag !== null
      ? String(raw.revolutTag).trim()
      : DEFAULT_PAYMENT_ACCOUNTS.revolutTag;

  let revolutTag = "";
  let revolutUrl = "";
  if (rawRevolut) {
    const revMeMatch = rawRevolut.match(
      /^https?:\/\/(?:www\.)?revolut\.me\/([^/?#]+)/i
    );
    if (revMeMatch) {
      const clean = revMeMatch[1].replace(/^@+/, "");
      revolutTag = `@${clean}`;
      revolutUrl = `https://revolut.me/${clean}`;
    } else if (/^https?:\/\//i.test(rawRevolut)) {
      revolutUrl = rawRevolut;
      const lastSegment = rawRevolut.split("/").filter(Boolean).pop() || "revolut";
      revolutTag = lastSegment.startsWith("@") ? lastSegment : `@${lastSegment}`;
    } else {
      const clean = rawRevolut
        .replace(/^(?:www\.)?revolut\.me\//i, "")
        .replace(/^@+/, "")
        .replace(/\/+$/, "")
        .trim();
      if (clean) {
        revolutTag = `@${clean}`;
        revolutUrl = `https://revolut.me/${clean}`;
      }
    }
  }

  // 2. PayPal
  const rawPaypal =
    raw.paypalHandle !== undefined && raw.paypalHandle !== null
      ? String(raw.paypalHandle).trim()
      : DEFAULT_PAYMENT_ACCOUNTS.paypalHandle;

  let paypalHandle = "";
  let paypalDisplayTag = "";
  let paypalBaseUrl = "";
  if (rawPaypal) {
    const ppMeMatch = rawPaypal.match(
      /^https?:\/\/(?:www\.)?paypal\.me\/([^/?#]+)/i
    );
    if (ppMeMatch) {
      const clean = ppMeMatch[1].replace(/^@+/, "");
      paypalHandle = clean;
      paypalDisplayTag = `@${clean}`;
      paypalBaseUrl = `https://paypal.me/${clean}`;
    } else if (/^https?:\/\//i.test(rawPaypal)) {
      paypalBaseUrl = rawPaypal.replace(/\/+$/, "");
      const lastSegment = rawPaypal.split("/").filter(Boolean).pop() || "paypal";
      paypalHandle = lastSegment.replace(/^@+/, "");
      paypalDisplayTag = `@${paypalHandle}`;
    } else {
      const clean = rawPaypal
        .replace(/^(?:www\.)?paypal\.me\//i, "")
        .replace(/\/\d+(?:[.,]\d+)?\s*EUR$/i, "")
        .replace(/^@+/, "")
        .replace(/\/+$/, "")
        .trim();
      if (clean) {
        paypalHandle = clean;
        paypalDisplayTag = `@${clean}`;
        paypalBaseUrl = `https://paypal.me/${clean}`;
      }
    }
  }

  // 3. Wero / Paylib
  const rawWero =
    raw.weroPhone !== undefined && raw.weroPhone !== null
      ? String(raw.weroPhone).trim()
      : DEFAULT_PAYMENT_ACCOUNTS.weroPhone;
  const weroDigits = rawWero.replace(/[^\d+]/g, "");

  return {
    revolutEnabled: raw.revolutEnabled !== false && Boolean(revolutUrl),
    revolutTag,
    revolutUrl,
    paypalEnabled: raw.paypalEnabled !== false && Boolean(paypalBaseUrl),
    paypalHandle,
    paypalDisplayTag,
    paypalBaseUrl,
    weroEnabled: raw.weroEnabled !== false && Boolean(weroDigits),
    weroPhone: rawWero,
    weroDigits,
  };
}

