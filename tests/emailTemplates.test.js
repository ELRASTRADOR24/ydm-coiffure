import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_EMAIL_SETTINGS,
  EMAIL_TEMPLATE_META,
  buildEmailVariables,
  buildSamplePreviewVariables,
  renderEmailFromTemplate,
  sanitizeEmailHtml,
} from "../lib/emailTemplates.js";
import {
  optimizeCloudinaryMediaUrl,
  buildCloudinaryVideoThumbnail,
} from "../lib/uploadMedia.js";
import { buildPublicSettings, cloneValue } from "../lib/siteContent.js";

test("renderEmailFromTemplate renders all 7 transactional email templates cleanly", () => {
  assert.equal(EMAIL_TEMPLATE_META.length, 7);
  const vars = buildSamplePreviewVariables({ paymentHoldHours: 2 });

  for (const meta of EMAIL_TEMPLATE_META) {
    const out = renderEmailFromTemplate({
      templateKey: meta.key,
      emailSettings: DEFAULT_EMAIL_SETTINGS,
      variables: vars,
    });
    assert.ok(out.subject.length > 5, `Subject missing for ${meta.key}`);
    assert.ok(out.html.includes("<!DOCTYPE html>"), `HTML root missing for ${meta.key}`);
    assert.ok(out.html.includes("Sarah"), `Variable substitution missing for ${meta.key}`);
    assert.ok(!out.html.includes("{prenom}"), `Unreplaced token for ${meta.key}`);
    assert.ok(!out.html.includes("{ancienne_date}"), `Unreplaced token for ${meta.key}`);
    assert.ok(!out.html.includes("{lien_accepter_proposition}"), `Unreplaced token for ${meta.key}`);
    assert.ok(!out.html.includes("{lien_refuser_proposition}"), `Unreplaced token for ${meta.key}`);
  }

  const propOut = renderEmailFromTemplate({
    templateKey: "rescheduleProposed",
    emailSettings: DEFAULT_EMAIL_SETTINGS,
    variables: vars,
  });
  assert.ok(propOut.html.includes("?proposition=accepter"));
  assert.ok(propOut.html.includes("?proposition=refuser"));
  assert.ok(propOut.html.includes("16/11/2026"));
  assert.ok(propOut.html.includes("18/11/2026"));
});

test("Email card supports removing frames, custom fonts, colors, and hiding/resizing logo", () => {
  const custom = cloneValue(DEFAULT_EMAIL_SETTINGS);
  custom.design.cardBorderEnabled = false;
  custom.design.fontFamily = "'Courier New', Courier, monospace";
  custom.design.cardBgColor = "#111111";
  custom.design.textColor = "#F5EFE6";
  custom.header.showLogo = false;
  custom.header.brandTitleVisible = true;
  custom.header.brandTitle = "STUDIO PRIVÉ";
  custom.header.logoAlign = "left";
  custom.templates.requested.blocks = custom.templates.requested.blocks.map((b) => ({
    ...b,
    boxed: false,
  }));

  const vars = buildSamplePreviewVariables();
  const out = renderEmailFromTemplate({
    templateKey: "requested",
    emailSettings: custom,
    variables: vars,
  });

  assert.ok(out.html.includes("border:none;"));
  assert.ok(out.html.includes("background-color:#111111"));
  assert.ok(out.html.includes("'Courier New', Courier, monospace"));
  assert.ok(out.html.includes("STUDIO PRIVÉ"));
  assert.ok(!out.html.includes(DEFAULT_EMAIL_SETTINGS.header.logoUrl));
});

test("sanitizeEmailHtml strips unsafe tags/handlers and converts legacy <font> tags to inline CSS", () => {
  const dirty =
    '<p><font size="4" face="Georgia" color="#8C7B70">Texte Chic</font></p>' +
    '<script>alert(1)</script>' +
    '<img src="https://example.com/a.jpg" onerror="alert(2)" />' +
    '<a href="javascript:alert(3)">Lien</a>';

  const clean = sanitizeEmailHtml(dirty);

  assert.ok(!clean.includes("<script>"));
  assert.ok(!clean.includes("onerror="));
  assert.ok(!clean.includes("javascript:"));
  assert.ok(clean.includes("font-size:18px"));
  assert.ok(clean.includes("font-family:Georgia"));
  assert.ok(clean.includes("color:#8C7B70"));
  assert.ok(clean.includes("Texte Chic"));
});

test("renderEmailFromTemplate escapes XSS payloads injected via booking fields", () => {
  const vars = buildEmailVariables({
    booking: {
      bookingReference: "YDM-2026-XSS",
      customer: {
        firstName: '<script>alert("xss")</script>',
        lastName: 'D."onerror="x',
        notes: "<img src=x onerror=alert(1)>",
      },
      service: { name: "<b>Knotless</b>" },
      date: "2026-11-20",
      startTime: "14:00",
      totalPrice: 50,
      depositAmount: 10,
      remainingBalance: 40,
    },
    reason: "<script>bad</script>",
  });

  const out = renderEmailFromTemplate({
    templateKey: "rejected",
    emailSettings: DEFAULT_EMAIL_SETTINGS,
    variables: vars,
  });

  assert.ok(!out.html.includes('<script>alert("xss")</script>'));
  assert.ok(out.html.includes("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"));
  assert.ok(!out.html.includes("<script>bad</script>"));
  assert.ok(out.html.includes("&lt;script&gt;bad&lt;/script&gt;"));
});

test("reasonCard hides automatically when motif is empty and onlyIfReason is true", () => {
  const vars = buildEmailVariables({
    booking: { customer: { firstName: "Lina" } },
    reason: "",
  });

  const out = renderEmailFromTemplate({
    templateKey: "rejected",
    emailSettings: DEFAULT_EMAIL_SETTINGS,
    variables: vars,
  });

  assert.ok(!out.html.includes("Précision :"));
});

test("buildPublicSettings never leaks emailSettings", () => {
  const pub = buildPublicSettings({
    salonName: "YDM Coiffure",
    emailSettings: DEFAULT_EMAIL_SETTINGS,
  });
  assert.equal(Object.prototype.hasOwnProperty.call(pub, "emailSettings"), false);
});

test("Cloudinary URL optimization applies light video/image transforms without duplicating", () => {
  const rawMov =
    "https://res.cloudinary.com/dvecpg1tz/video/upload/v1799999999/ydm-coiffure/tresses.mov";
  const optVid = optimizeCloudinaryMediaUrl(rawMov, true);
  assert.equal(
    optVid,
    "https://res.cloudinary.com/dvecpg1tz/video/upload/c_limit,w_1080/q_auto:good,vc_auto/v1799999999/ydm-coiffure/tresses.mp4"
  );

  // Idempotent on already transformed URLs
  assert.equal(optimizeCloudinaryMediaUrl(optVid, true), optVid);

  const thumb = buildCloudinaryVideoThumbnail(optVid);
  assert.equal(
    thumb,
    "https://res.cloudinary.com/dvecpg1tz/video/upload/c_limit,q_auto,so_0,w_900/v1799999999/ydm-coiffure/tresses.jpg"
  );

  const rawImg =
    "https://res.cloudinary.com/dvecpg1tz/image/upload/v1799999999/ydm-coiffure/photo.png";
  const optImg = optimizeCloudinaryMediaUrl(rawImg, false);
  assert.equal(
    optImg,
    "https://res.cloudinary.com/dvecpg1tz/image/upload/c_limit,w_1600/f_auto,q_auto:good/v1799999999/ydm-coiffure/photo.png"
  );
  assert.equal(optimizeCloudinaryMediaUrl(optImg, false), optImg);
});
