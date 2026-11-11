import bcrypt from "bcryptjs";
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
} from "./sessionToken.js";

const COOKIE_NAME = ADMIN_COOKIE_NAME;

export { createSessionToken, verifySessionToken };

export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 12);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function getAdminSession() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch (e) {
    return null;
  }
}

async function shouldUseSecureCookie() {
  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    const proto = (headerList.get("x-forwarded-proto") || "").toLowerCase();
    if (proto === "https") return true;
    const host = (headerList.get("host") || "").toLowerCase();
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
      return false;
    }
    const origin = (headerList.get("origin") || "").toLowerCase();
    if (origin.startsWith("https://")) return true;
    return process.env.NODE_ENV === "production";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export async function setAdminSessionCookie(payload) {
  const token = await createSessionToken(payload);
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const isSecure = await shouldUseSecureCookie();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
  return token;
}

export async function clearAdminSessionCookie() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const isSecure = await shouldUseSecureCookie();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
