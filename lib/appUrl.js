export const CANONICAL_PRODUCTION_URL = "https://www.ydmcoiffure.com";

function firstHeaderValue(value) {
  if (!value || typeof value !== "string") return "";
  return value.split(",")[0].trim();
}

export function isLocalAppUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const withProto = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed.replace(/^\/+/, "")}`;
    const parsed = new URL(withProto);
    const host = parsed.hostname.toLowerCase();

    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".local")
    ) {
      return true;
    }

    if (/^10\./.test(host) || /^192\.168\./.test(host)) {
      return true;
    }

    const rfc172Match = host.match(/^172\.(\d{1,3})\./);
    if (rfc172Match) {
      const secondOctet = Number(rfc172Match[1]);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return true;
      }
    }

    return false;
  } catch {
    return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(trimmed);
  }
}

export function isLegacyDemoDomainUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const withProto = /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim().replace(/^\/+/, "")}`;
    const host = new URL(withProto).hostname.toLowerCase();
    return host === "ydm-coiffure.fr" || host === "www.ydm-coiffure.fr";
  } catch {
    return /ydm-coiffure\.fr/i.test(url);
  }
}

export function normalizePublicOrigin(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  if (!trimmed || trimmed.startsWith("/")) return "";

  try {
    const withProto = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProto);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    const host = parsed.hostname.toLowerCase();
    if (host === "ydmcoiffure.com" || host === "www.ydmcoiffure.com") {
      return CANONICAL_PRODUCTION_URL;
    }
    return parsed.origin;
  } catch {
    return "";
  }
}

export function extractRequestOrigin(request) {
  if (!request) return "";

  try {
    const headerSource =
      request.headers && typeof request.headers.get === "function"
        ? request.headers
        : typeof request.get === "function"
        ? request
        : null;

    if (headerSource) {
      const forwardedHost = firstHeaderValue(
        headerSource.get("x-forwarded-host")
      );
      const host = forwardedHost || firstHeaderValue(headerSource.get("host"));
      const protoHeader = firstHeaderValue(
        headerSource.get("x-forwarded-proto")
      );
      if (host) {
        const candidate = `${protoHeader || "https"}://${host}`;
        if (!isLocalAppUrl(candidate)) {
          return normalizePublicOrigin(candidate);
        }
        return "";
      }
    }

    if (typeof request.url === "string" && /^https?:\/\//i.test(request.url)) {
      const origin = new URL(request.url).origin;
      if (!isLocalAppUrl(origin)) {
        return normalizePublicOrigin(origin);
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function resolvePublicAppUrl(request = null, explicitUrl = "") {
  if (
    explicitUrl &&
    !isLocalAppUrl(explicitUrl) &&
    !isLegacyDemoDomainUrl(explicitUrl)
  ) {
    const normalizedExplicit = normalizePublicOrigin(explicitUrl);
    if (normalizedExplicit) {
      return normalizedExplicit;
    }
  }

  const requestOrigin = extractRequestOrigin(request);
  if (requestOrigin && !isLocalAppUrl(requestOrigin)) {
    return requestOrigin;
  }

  if (typeof process !== "undefined" && process.env) {
    const configuredCandidates = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.APP_URL,
      process.env.SITE_URL,
    ];
    for (const candidate of configuredCandidates) {
      if (
        candidate &&
        !isLocalAppUrl(candidate) &&
        !isLegacyDemoDomainUrl(candidate)
      ) {
        const normalized = normalizePublicOrigin(candidate);
        if (normalized) return normalized;
      }
    }

    const vercelCandidates = [
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_URL,
    ];
    for (const candidate of vercelCandidates) {
      if (candidate && !isLocalAppUrl(candidate)) {
        const normalized = normalizePublicOrigin(candidate);
        if (normalized) return normalized;
      }
    }
  }

  return CANONICAL_PRODUCTION_URL;
}

export function buildBookingStatusUrl(
  bookingReference,
  request = null,
  explicitUrl = ""
) {
  const baseUrl = resolvePublicAppUrl(request, explicitUrl);
  const cleanRef = String(bookingReference || "").trim();
  if (!cleanRef) {
    return `${baseUrl}/reserver`;
  }
  return `${baseUrl}/reserver/statut/${encodeURIComponent(cleanRef)}`;
}

export function normalizeBookingPaymentUrl(
  rawUrl,
  bookingReference = "",
  request = null,
  explicitUrl = ""
) {
  const baseUrl = resolvePublicAppUrl(request, explicitUrl);
  const fallback = buildBookingStatusUrl(bookingReference, request, explicitUrl);

  if (!rawUrl || typeof rawUrl !== "string") {
    return fallback;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith("/")) {
    return `${baseUrl}${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    const pathAndQuery = `${parsed.pathname || ""}${parsed.search || ""}${
      parsed.hash || ""
    }`;

    if (isLocalAppUrl(trimmed) || isLegacyDemoDomainUrl(trimmed)) {
      if (pathAndQuery && pathAndQuery !== "/") {
        return `${baseUrl}${pathAndQuery}`;
      }
      return fallback;
    }

    if (parsed.hostname.toLowerCase() === "ydmcoiffure.com") {
      return `${CANONICAL_PRODUCTION_URL}${pathAndQuery}`;
    }

    return parsed.toString();
  } catch {
    return fallback;
  }
}
