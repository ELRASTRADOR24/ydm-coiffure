export const BOOKING_REF_COOKIE = "ydm_last_booking_ref";
export const BOOKING_STORAGE_KEY = "ydm_tracked_bookings";
export const BOOKING_TRACKED_EVENT = "ydm-booking-tracked";
export const MAX_TRACKED_BOOKINGS = 5;

export function normalizeBookingReference(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
}

export function isValidBookingReference(raw) {
  const ref = normalizeBookingReference(raw);
  return /^YDM-\d{4}-[A-Z0-9-]{2,16}$/.test(ref);
}

function defaultReadStorage(storage) {
  if (storage) return storage;
  if (typeof window !== "undefined") {
    try {
      return window.localStorage;
    } catch (_) {
      return null;
    }
  }
  return null;
}

export function getCookieBookingRef(cookieString) {
  const src =
    typeof cookieString === "string"
      ? cookieString
      : typeof document !== "undefined"
      ? document.cookie || ""
      : "";
  if (!src) return "";
  const pairs = src.split(";").map((part) => part.trim());
  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = pair.slice(0, eqIndex).trim();
    if (key === BOOKING_REF_COOKIE) {
      const val = decodeURIComponent(pair.slice(eqIndex + 1).trim());
      return isValidBookingReference(val) ? normalizeBookingReference(val) : "";
    }
  }
  return "";
}

function writeCookieBookingRef(ref, setCookieFn) {
  const encoded = ref ? encodeURIComponent(ref) : "";
  const cookieLine = ref
    ? `${BOOKING_REF_COOKIE}=${encoded}; path=/; max-age=2592000; SameSite=Lax`
    : `${BOOKING_REF_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  if (typeof setCookieFn === "function") {
    setCookieFn(cookieLine);
    return;
  }
  if (typeof document !== "undefined") {
    document.cookie = cookieLine;
  }
}

export function sanitizeTrackedBookingEntry(entry = {}) {
  const ref = normalizeBookingReference(entry?.bookingReference || entry);
  if (!isValidBookingReference(ref)) return null;
  return {
    bookingReference: ref,
    status: String(entry?.status || "").trim(),
    date: String(entry?.date || "").trim(),
    startTime: String(entry?.startTime || "").trim(),
    serviceName: String(entry?.serviceName || entry?.service?.name || "").trim(),
    firstName: String(entry?.firstName || entry?.customer?.firstName || entry?.customerName || "").trim(),
    savedAt: String(entry?.savedAt || new Date().toISOString()),
  };
}

export function getTrackedBookings(options = {}) {
  const store = defaultReadStorage(options.storage);
  let items = [];
  if (store) {
    try {
      const raw = store.getItem(BOOKING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          items = parsed
            .map((item) => sanitizeTrackedBookingEntry(item))
            .filter(Boolean);
        }
      }
    } catch (_) {
      items = [];
    }
  }

  const cookieRef = getCookieBookingRef(options.cookieString);
  if (
    cookieRef &&
    !items.some((item) => item.bookingReference === cookieRef)
  ) {
    const fromCookie = sanitizeTrackedBookingEntry({
      bookingReference: cookieRef,
    });
    if (fromCookie) items = [fromCookie, ...items];
  }

  return items.slice(0, MAX_TRACKED_BOOKINGS);
}

export function getLatestTrackedBookingRef(options = {}) {
  const items = getTrackedBookings(options);
  return items[0]?.bookingReference || "";
}

export function saveTrackedBooking(bookingOrRef, options = {}) {
  const clean = sanitizeTrackedBookingEntry(bookingOrRef);
  if (!clean) return [];

  const existing = getTrackedBookings(options).filter(
    (item) => item.bookingReference !== clean.bookingReference
  );
  const next = [clean, ...existing].slice(0, MAX_TRACKED_BOOKINGS);

  const store = defaultReadStorage(options.storage);
  if (store) {
    try {
      store.setItem(BOOKING_STORAGE_KEY, JSON.stringify(next));
    } catch (_) {
      // Ignore storage quota / private mode failures gracefully
    }
  }

  writeCookieBookingRef(clean.bookingReference, options.setCookieFn);

  if (typeof window !== "undefined" && !options.silent) {
    window.dispatchEvent(new Event(BOOKING_TRACKED_EVENT));
  }
  return next;
}

export function removeTrackedBooking(ref, options = {}) {
  const cleanRef = normalizeBookingReference(ref);
  const next = getTrackedBookings(options).filter(
    (item) => item.bookingReference !== cleanRef
  );

  const store = defaultReadStorage(options.storage);
  if (store) {
    try {
      store.setItem(BOOKING_STORAGE_KEY, JSON.stringify(next));
    } catch (_) {
      // Ignore storage failures
    }
  }

  const nextLatest = next[0]?.bookingReference || "";
  writeCookieBookingRef(nextLatest, options.setCookieFn);

  if (typeof window !== "undefined" && !options.silent) {
    window.dispatchEvent(new Event(BOOKING_TRACKED_EVENT));
  }
  return next;
}
