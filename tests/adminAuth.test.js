import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import {
  ADMIN_COOKIE_NAME,
  buildAdminLoginRedirectUrl,
  createSessionToken,
  verifySessionToken,
} from "../lib/sessionToken.js";

test("Admin session token creation and verification guards against tampering and expiry", async () => {
  assert.equal(ADMIN_COOKIE_NAME, "ydm_admin_session");

  const token = await createSessionToken({
    userId: "usr_admin",
    email: "admin@ydm-coiffure.fr",
    name: "Yasmine D. (Coiffeuse & Fondatrice)",
    role: "ADMIN",
  });
  assert.ok(token && token.split(".").length === 3);

  const verified = await verifySessionToken(token);
  assert.equal(verified?.email, "admin@ydm-coiffure.fr");
  assert.equal(verified?.role, "ADMIN");
  assert.equal(verified?.name, "Yasmine D. (Coiffeuse & Fondatrice)");

  // Interop with legacy jose HS256 cookies already stored in admin browsers
  const secretBytes = new TextEncoder().encode(
    process.env.AUTH_SECRET ||
      "ydm_coiffure_super_secret_jwt_key_2026_luxury_braids_salon_paris_default"
  );
  const joseToken = await new SignJWT({
    userId: "usr_admin",
    email: "admin@ydm-coiffure.fr",
    role: "ADMIN",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretBytes);
  const verifiedJose = await verifySessionToken(joseToken);
  assert.equal(verifiedJose?.role, "ADMIN");

  const expiredToken = await new SignJWT({ userId: "usr_admin", role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(1000)
    .setExpirationTime(1001)
    .sign(secretBytes);
  assert.equal(await verifySessionToken(expiredToken), null);

  assert.equal(await verifySessionToken(""), null);
  assert.equal(await verifySessionToken(null), null);
  assert.equal(await verifySessionToken(`${token}tamper`), null);
});

test("buildAdminLoginRedirectUrl preserves forwarded production and LAN origins", () => {
  const prodUrl = buildAdminLoginRedirectUrl({
    headers: new Headers({
      "x-forwarded-host": "www.ydmcoiffure.com",
      "x-forwarded-proto": "https",
    }),
    url: "http://localhost:3000/admin/bookings",
  });
  assert.equal(prodUrl.toString(), "https://www.ydmcoiffure.com/admin/login");

  const lanUrl = buildAdminLoginRedirectUrl({
    headers: new Headers({ host: "192.168.1.42:3001" }),
    nextUrl: { protocol: "http:" },
    url: "http://localhost:3001/admin",
  });
  assert.equal(lanUrl.toString(), "http://192.168.1.42:3001/admin/login");
});
