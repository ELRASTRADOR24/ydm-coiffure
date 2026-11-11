export const ADMIN_COOKIE_NAME = "ydm_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 jours

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function getJwtSecretBytes() {
  const secretString =
    process.env.AUTH_SECRET ||
    "ydm_coiffure_super_secret_jwt_key_2026_luxury_braids_salon_paris_default";
  return encoder.encode(secretString);
}

function toBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  if (typeof str !== "string" || !/^[A-Za-z0-9_-]+$/.test(str)) {
    throw new Error("Invalid base64url");
  }
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(str.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(usage) {
  return await crypto.subtle.importKey(
    "raw",
    getJwtSecretBytes(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

export async function createSessionToken(payload) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const headerB64 = toBase64Url(encoder.encode(JSON.stringify({ alg: "HS256" })));
  const fullPayload = {
    ...payload,
    iat: nowSeconds,
    exp: nowSeconds + SESSION_DURATION_SECONDS,
  };
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(fullPayload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importHmacKey(["sign"]);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput)
  );
  const signatureB64 = toBase64Url(new Uint8Array(signature));
  return `${signingInput}.${signatureB64}`;
}

export function buildAdminLoginRedirectUrl(request) {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protoHeader = (request.headers.get("x-forwarded-proto") || "")
    .split(",")[0]
    .trim();
  const protocol =
    protoHeader || request.nextUrl?.protocol?.replace(/:$/, "") || "http";

  if (host) {
    return new URL("/admin/login", `${protocol}://${host}`);
  }
  return new URL("/admin/login", request.url);
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = JSON.parse(decoder.decode(fromBase64Url(headerB64)));
    if (!header || header.alg !== "HS256") return null;

    const key = await importHmacKey(["verify"]);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signatureB64),
      encoder.encode(`${headerB64}.${payloadB64}`)
    );
    if (!isValid) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
    if (!payload || typeof payload !== "object") return null;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= nowSeconds) {
      return null;
    }
    if (typeof payload.nbf === "number" && payload.nbf > nowSeconds) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
