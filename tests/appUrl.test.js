import test from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_PRODUCTION_URL,
  isLocalAppUrl,
  resolvePublicAppUrl,
  buildBookingStatusUrl,
  normalizeBookingPaymentUrl,
} from "../lib/appUrl.js";
import { createDepositCheckoutSession } from "../lib/stripe.js";
import {
  EMAIL_VARIABLES,
  buildEmailVariables,
  buildSamplePreviewVariables,
} from "../lib/emailTemplates.js";
import {
  sendNewBookingAdminSms,
  sendDepositDeclaredAdminSms,
  sendBookingApprovedPaymentSms,
} from "../lib/sms.js";

function withEnv(vars, fn) {
  const previous = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    if (vars[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = vars[key];
    }
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const key of Object.keys(vars)) {
        if (previous[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous[key];
        }
      }
    });
}

test("isLocalAppUrl identifies localhost, loopback, .local and RFC1918 origins", () => {
  assert.equal(isLocalAppUrl("http://localhost:3000"), true);
  assert.equal(isLocalAppUrl("http://127.0.0.1:3001"), true);
  assert.equal(isLocalAppUrl("http://192.168.1.45:3001"), true);
  assert.equal(isLocalAppUrl("http://10.0.0.8:3000"), true);
  assert.equal(isLocalAppUrl("https://www.ydmcoiffure.com"), false);
  assert.equal(isLocalAppUrl("https://ydmcoiffure.com"), false);
  assert.equal(isLocalAppUrl("https://ydm-preview.vercel.app"), false);
});

test("resolvePublicAppUrl ignores localhost env poisoning and falls back to live domain", async () => {
  await withEnv(
    {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      APP_URL: undefined,
      SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      VERCEL_URL: undefined,
    },
    () => {
      assert.equal(resolvePublicAppUrl(), CANONICAL_PRODUCTION_URL);

      const localReq = {
        headers: new Headers({ host: "localhost:3001" }),
        url: "http://localhost:3001/api/admin/bookings/123/approve",
      };
      assert.equal(resolvePublicAppUrl(localReq), CANONICAL_PRODUCTION_URL);
    }
  );
});

test("resolvePublicAppUrl uses live request host and canonicalizes apex domain", async () => {
  await withEnv(
    {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      VERCEL_URL: undefined,
    },
    () => {
      const wwwReq = {
        headers: new Headers({
          "x-forwarded-proto": "https",
          "x-forwarded-host": "www.ydmcoiffure.com",
        }),
        url: "https://www.ydmcoiffure.com/api/bookings",
      };
      assert.equal(resolvePublicAppUrl(wwwReq), "https://www.ydmcoiffure.com");

      const apexReq = {
        headers: new Headers({
          "x-forwarded-proto": "https",
          "x-forwarded-host": "ydmcoiffure.com",
        }),
        url: "https://ydmcoiffure.com/api/bookings",
      };
      assert.equal(resolvePublicAppUrl(apexReq), "https://www.ydmcoiffure.com");

      const previewReq = {
        headers: new Headers({
          "x-forwarded-proto": "https",
          "x-forwarded-host": "ydm-coiffure-git-main.vercel.app",
        }),
        url: "https://ydm-coiffure-git-main.vercel.app/api/bookings",
      };
      assert.equal(
        resolvePublicAppUrl(previewReq),
        "https://ydm-coiffure-git-main.vercel.app"
      );
    }
  );
});

test("normalizeBookingPaymentUrl heals stored localhost or legacy domain URLs", async () => {
  await withEnv({ NEXT_PUBLIC_APP_URL: "http://localhost:3000" }, () => {
    assert.equal(
      normalizeBookingPaymentUrl(
        "http://localhost:3000/reserver/statut/YDM-2026-9999",
        "YDM-2026-9999"
      ),
      "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-9999"
    );

    assert.equal(
      normalizeBookingPaymentUrl(
        "https://ydm-coiffure.fr/reserver/statut/YDM-2026-9999",
        "YDM-2026-9999"
      ),
      "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-9999"
    );

    assert.equal(
      normalizeBookingPaymentUrl("", "YDM-2026-9999"),
      "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-9999"
    );
  });
});

test("createDepositCheckoutSession and email template variables never leak localhost", async () => {
  await withEnv({ NEXT_PUBLIC_APP_URL: "http://localhost:3000" }, async () => {
    const req = {
      headers: new Headers({
        "x-forwarded-proto": "https",
        "x-forwarded-host": "www.ydmcoiffure.com",
      }),
      url: "https://www.ydmcoiffure.com/api/admin/bookings/1/approve",
    };

    const session = await createDepositCheckoutSession({
      booking: { bookingReference: "YDM-2026-5555" },
      request: req,
    });
    assert.equal(
      session.url,
      "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-5555"
    );

    const vars = buildEmailVariables({
      booking: { bookingReference: "YDM-2026-5555" },
      paymentUrl: "http://localhost:3000/reserver/statut/YDM-2026-5555",
      request: req,
    });
    assert.equal(
      vars["{lien_paiement}"],
      "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-5555"
    );
    assert.equal(
      vars["{lien_suivi}"],
      "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-5555"
    );
    assert.equal(
      vars["{lien_reservation}"],
      "https://www.ydmcoiffure.com/reserver"
    );
    assert.equal(
      vars["{lien_admin}"],
      "https://www.ydmcoiffure.com/admin/bookings"
    );

    const sampleVars = buildSamplePreviewVariables({});
    assert.ok(!sampleVars["{lien_paiement}"].includes("localhost"));
    assert.ok(!sampleVars["{lien_paiement}"].includes("ydm-coiffure.fr"));

    for (const entry of EMAIL_VARIABLES) {
      if (entry.token.startsWith("{lien_")) {
        assert.ok(entry.sample.startsWith("https://www.ydmcoiffure.com/"));
      }
    }

    assert.equal(
      buildBookingStatusUrl("YDM-2026-7777"),
      "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-7777"
    );
  });
});

test("SMS helpers emit live production URLs even when NEXT_PUBLIC_APP_URL is localhost", async () => {
  await withEnv({ NEXT_PUBLIC_APP_URL: "http://localhost:3000" }, async () => {
    const captured = [];
    const origLog = console.log;
    console.log = (...args) => captured.push(args.join(" "));
    try {
      const sampleBooking = {
        bookingReference: "YDM-2026-8888",
        date: "2026-12-01",
        startTime: "10:00",
        depositAmount: 10,
        service: { name: "Knotless Braids" },
        customer: { firstName: "Nadia", lastName: "K.", phone: "06 11 22 33 44" },
      };

      await sendNewBookingAdminSms(sampleBooking, "0767663869");
      await sendDepositDeclaredAdminSms(sampleBooking, "Revolut", "0767663869");
      await sendBookingApprovedPaymentSms(
        sampleBooking,
        "http://localhost:3000/reserver/statut/YDM-2026-8888",
        2
      );
    } finally {
      console.log = origLog;
    }

    assert.equal(captured.length, 3);
    assert.ok(captured[0].includes("https://www.ydmcoiffure.com/admin/bookings"));
    assert.ok(captured[1].includes("https://www.ydmcoiffure.com/admin/bookings"));
    assert.ok(
      captured[2].includes(
        "https://www.ydmcoiffure.com/reserver/statut/YDM-2026-8888"
      )
    );
    for (const line of captured) {
      assert.equal(line.includes("localhost"), false);
    }
  });
});
