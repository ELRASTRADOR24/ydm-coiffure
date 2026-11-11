import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SITE_CONTENT,
  deepMergePreserveEmpty,
  getResolvedSiteContent,
  getResolvedPageVisibility,
  getResolvedMaintenance,
  getResolvedFaqItems,
  buildPublicSettings,
} from "../lib/siteContent.js";

test("deepMergePreserveEmpty respects empty string, false and empty arrays", () => {
  const defaults = {
    visible: true,
    title: "Titre initial",
    items: ["a", "b"],
    nested: { label: "Bouton", active: true },
  };
  const saved = {
    visible: false,
    title: "",
    items: [],
    nested: { active: false },
  };

  const result = deepMergePreserveEmpty(defaults, saved);
  assert.equal(result.visible, false);
  assert.equal(result.title, "");
  assert.deepEqual(result.items, []);
  assert.equal(result.nested.active, false);
  assert.equal(result.nested.label, "Bouton");
});

test("buildPublicSettings never leaks confidential homeAddress", () => {
  const rawSettings = {
    salonName: "YDM Coiffure",
    homeAddress: {
      street: "12 Rue Secrete",
      postalCode: "85000",
      city: "La Roche-sur-Yon",
      accessNotes: "Code 1234",
    },
    maintenance: { enabled: true, title: "En pause" },
  };

  const publicSettings = buildPublicSettings(rawSettings, [
    { id: 1, title: "Photo 1" },
  ]);

  assert.equal(Object.prototype.hasOwnProperty.call(publicSettings, "homeAddress"), false);
  assert.equal(publicSettings.maintenance.enabled, true);
  assert.equal(publicSettings.maintenance.title, "En pause");
  assert.equal(publicSettings.maintenance.showInstagram, true);
});

test("deleted FAQ and gallery items remain empty when touched flags are true", () => {
  const settings = {
    siteContent: {
      flags: {
        faqTouched: true,
        galleryTouched: true,
      },
    },
    faqItems: [],
    galleryItems: [],
  };

  const resolvedFaq = getResolvedFaqItems(settings);
  assert.deepEqual(resolvedFaq, []);

  const publicSettings = buildPublicSettings(settings, [{ id: 99, title: "Fallback" }]);
  assert.deepEqual(publicSettings.faqItems, []);
  assert.deepEqual(publicSettings.galleryItems, []);
});

test("getResolvedPageVisibility includes new legal and rules pages", () => {
  const vis = getResolvedPageVisibility({
    pageVisibility: { aPropos: false, reglement: false },
  });

  assert.equal(vis.aPropos, false);
  assert.equal(vis.reglement, false);
  assert.equal(vis.mentionsLegales, true);
  assert.equal(vis.confidentialite, true);
  assert.equal(vis.reserver, true);
});

test("getResolvedSiteContent merges partial page edits while preserving sibling sections", () => {
  const resolved = getResolvedSiteContent({
    siteContent: {
      aboutPage: {
        header: {
          title: "Mon Parcours Modifié",
        },
      },
    },
  });

  assert.equal(resolved.aboutPage.header.title, "Mon Parcours Modifié");
  assert.equal(
    resolved.aboutPage.header.eyebrow,
    DEFAULT_SITE_CONTENT.aboutPage.header.eyebrow
  );
  assert.ok(resolved.aboutPage.storyCard.paragraphs.length >= 3);
  assert.ok(resolved.legalPage.sections.length >= 3);
  assert.ok(resolved.privacyPage.sections.length >= 3);
  assert.ok(resolved.rulesPage.sections.length >= 7);
});

test("buildPublicSettings exposes normalized paymentAccounts and privacyPage describes direct Wero/Revolut/PayPal settlements without Stripe", () => {
  const pub = buildPublicSettings({
    homeAddress: { street: "Secret" },
    paymentAccounts: {
      revolutEnabled: true,
      revolutTag: "maydie_rev",
      paypalEnabled: true,
      paypalHandle: "maydie_pp",
      weroEnabled: true,
      weroPhone: "06 11 22 33 44",
    },
  });

  assert.equal(pub.paymentAccounts.revolutUrl, "https://revolut.me/maydie_rev");
  assert.equal(pub.paymentAccounts.paypalBaseUrl, "https://paypal.me/maydie_pp");
  assert.equal(pub.paymentAccounts.weroDigits, "0611223344");
  const privacySerialized = JSON.stringify(DEFAULT_SITE_CONTENT.privacyPage).toLowerCase();
  assert.equal(privacySerialized.includes("stripe"), false);
  assert.equal(privacySerialized.includes("wero"), true);
  assert.equal(privacySerialized.includes("revolut"), true);
  assert.equal(privacySerialized.includes("paypal"), true);
});
