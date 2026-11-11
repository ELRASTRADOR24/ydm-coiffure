import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDecimalInput,
  stripPriceFromChoiceLabel,
  formatLengthChoiceLabel,
  formatOptionChoiceDisplayLabel,
  normalizeServiceReadData,
  createServiceFormDraft,
  updateDraftBasePrice,
  updateDraftLengthPrice,
  updateDraftLengthName,
  activateDraftLengthOptions,
  addDraftLengthChoice,
  removeDraftLengthChoice,
  buildServicePayloadFromDraft,
  normalizeServiceServerPayload,
} from "../lib/servicePricing.js";

test("parseDecimalInput handles free typing empty, integers, dots and French commas", () => {
  assert.equal(parseDecimalInput(""), null);
  assert.equal(parseDecimalInput("   "), null);
  assert.equal(parseDecimalInput("35."), null);
  assert.equal(parseDecimalInput("35"), 35);
  assert.equal(parseDecimalInput("0"), 0);
  assert.equal(parseDecimalInput("42.5"), 42.5);
  assert.equal(parseDecimalInput("42,50"), 42.5);
  assert.equal(parseDecimalInput("-5"), null);
  assert.equal(parseDecimalInput("abc"), null);
});

test("allow full deletion and arbitrary number entry on length prices without snapping back", () => {
  const service = {
    name: "Boho / Island Braid (Sans mèches fournies)",
    category: "Sans mèches incluses",
    price: 35,
    depositAmount: 10,
    options: [
      {
        name: "Longueur souhaitée",
        required: true,
        choices: [
          { label: "Court (35 €)", priceDiff: 0, durationDiff: 0 },
          { label: "Mi-long (45 €)", priceDiff: 10, durationDiff: 30 },
          { label: "Long (55 €)", priceDiff: 20, durationDiff: 60 },
          { label: "Extra long (65 €)", priceDiff: 30, durationDiff: 90 },
        ],
      },
    ],
  };

  let draft = createServiceFormDraft(service);
  assert.equal(draft.priceInput, "35");
  assert.equal(draft.lengthOption.choices[0].priceInput, "35");

  // User erases "35" one digit at a time until completely empty
  draft = updateDraftLengthPrice(draft, 0, "3");
  assert.equal(draft.lengthOption.choices[0].priceInput, "3");

  draft = updateDraftLengthPrice(draft, 0, "");
  assert.equal(draft.lengthOption.choices[0].priceInput, "");
  // Other rows stay untouched!
  assert.equal(draft.lengthOption.choices[1].priceInput, "45");

  // User types a value LOWER than the previous base (e.g. 28)
  draft = updateDraftLengthPrice(draft, 0, "28");
  assert.equal(draft.lengthOption.choices[0].priceInput, "28");
  assert.equal(draft.priceInput, "28");

  // Or raises Court above old base (e.g. 40) -> card base price syncs to 40!
  draft = updateDraftLengthPrice(draft, 0, "40");
  assert.equal(draft.priceInput, "40");

  const { payload, error } = buildServicePayloadFromDraft(draft);
  assert.equal(error, undefined);
  assert.equal(payload.price, 40);
  assert.deepEqual(
    payload.options[0].choices.map((c) => [c.label, c.priceDiff]),
    [
      ["Court (40 €)", 0],
      ["Mi-long (45 €)", 5],
      ["Long (55 €)", 15],
      ["Extra long (65 €)", 25],
    ]
  );
});

test("updating Prix de base updates all length prices and labels cleanly even after clearing to empty", () => {
  const service = {
    name: "Knotless (Sans mèches fournies)",
    category: "Sans mèches incluses",
    price: 30,
    depositAmount: 10,
    options: [
      {
        name: "Longueur souhaitée",
        required: true,
        choices: [
          { label: "Court (30 €)", priceDiff: 0, durationDiff: 0 },
          { label: "Mi-long (40 €)", priceDiff: 10, durationDiff: 30 },
          { label: "Long (50 €)", priceDiff: 20, durationDiff: 60 },
          { label: "Extra long (60 €)", priceDiff: 30, durationDiff: 90 },
        ],
      },
    ],
  };

  let draft = createServiceFormDraft(service);
  draft = updateDraftBasePrice(draft, "");
  assert.equal(draft.priceInput, "");

  draft = updateDraftBasePrice(draft, "35");
  assert.equal(draft.priceInput, "35");
  assert.deepEqual(
    draft.lengthOption.choices.map((c) => c.priceInput),
    ["35", "45", "55", "65"]
  );

  const { payload } = buildServicePayloadFromDraft(draft);
  assert.equal(payload.price, 35);
  assert.deepEqual(
    payload.options[0].choices.map((c) => c.label),
    ["Court (35 €)", "Mi-long (45 €)", "Long (55 €)", "Extra long (65 €)"]
  );
});

test("clearing length Intitulé and depositAmount works freely while editing", () => {
  let draft = createServiceFormDraft(null);
  draft = activateDraftLengthOptions({ ...draft, priceInput: "40" });
  draft = updateDraftLengthName(draft, 0, "");
  assert.equal(draft.lengthOption.choices[0].name, "");

  draft = updateDraftLengthName(draft, 0, "Carré");
  draft.depositInput = "";
  assert.equal(draft.depositInput, "");

  // Validation stops empty deposit with helpful French error
  const invalid = buildServicePayloadFromDraft({ ...draft, name: "Test" });
  assert.ok(invalid.error);

  draft.depositInput = "15";
  const valid = buildServicePayloadFromDraft({ ...draft, name: "Test" });
  assert.equal(valid.payload.depositAmount, 15);
  assert.equal(valid.payload.options[0].choices[0].label, "Carré (40 €)");
});

test("add & remove length choices keep base price equal to minimum length price", () => {
  let draft = createServiceFormDraft({ name: "S", price: 50, depositAmount: 10 });
  draft = activateDraftLengthOptions(draft);
  draft = addDraftLengthChoice(draft);
  assert.equal(draft.lengthOption.choices.length, 5);
  assert.equal(draft.lengthOption.choices[4].priceInput, "90");

  // Removing cheapest row updates base price to new minimum
  draft = removeDraftLengthChoice(draft, 0);
  assert.equal(draft.priceInput, "60");
});

test("normalizeServiceServerPayload heals desynced price/diff/label combinations", () => {
  // Case A: base price raised (30 -> 35) without touching labels
  const fixedA = normalizeServiceServerPayload(
    {
      price: 35,
      options: [
        {
          name: "Longueur souhaitée",
          required: true,
          choices: [
            { label: "Court (30 €)", priceDiff: 0, durationDiff: 0 },
            { label: "Mi-long (40 €)", priceDiff: 10, durationDiff: 30 },
          ],
        },
      ],
    },
    null
  );
  assert.equal(fixedA.price, 35);
  assert.deepEqual(fixedA.options[0].choices, [
    { label: "Court (35 €)", priceDiff: 0, durationDiff: 0 },
    { label: "Mi-long (45 €)", priceDiff: 10, durationDiff: 30 },
  ]);

  // Case B: choice prices raised (50 -> 55) leaving old base price at 50
  const fixedB = normalizeServiceServerPayload(
    {
      price: 50,
      options: [
        {
          name: "Longueur souhaitée",
          required: true,
          choices: [
            { label: "Court (55 €)", priceDiff: 5, durationDiff: 0 },
            { label: "Mi-long (65 €)", priceDiff: 15, durationDiff: 30 },
          ],
        },
      ],
    },
    null
  );
  assert.equal(fixedB.price, 55);
  assert.deepEqual(fixedB.options[0].choices, [
    { label: "Court (55 €)", priceDiff: 0, durationDiff: 0 },
    { label: "Mi-long (65 €)", priceDiff: 10, durationDiff: 30 },
  ]);
});

test("stripPriceFromChoiceLabel & formatLengthChoiceLabel preserve custom names and strip old euro badges", () => {
  assert.equal(stripPriceFromChoiceLabel("Court (35 €)"), "Court");
  assert.equal(stripPriceFromChoiceLabel("Mi-long (45,5 €)"), "Mi-long");
  assert.equal(stripPriceFromChoiceLabel("Tracé classique (inclus)"), "Tracé classique (inclus)");
  assert.equal(formatLengthChoiceLabel("Extra long", 85), "Extra long (85 €)");
});

test("formatOptionChoiceDisplayLabel and normalizeServiceReadData heal corrupted labels like Court (3 €)", () => {
  const corruptedService = {
    _id: "srv_knotless",
    name: "Knotless (Sans mèches fournies)",
    price: 35,
    options: [
      {
        name: "Longueur souhaitée",
        required: true,
        choices: [
          { label: "Court (3 €)", priceDiff: 0, durationDiff: 0 },
          { label: "Mi-long (45 €)", priceDiff: 10, durationDiff: 30 },
          { label: "Long (55 €)", priceDiff: 20, durationDiff: 60 },
          { label: "Extra long (65 €)", priceDiff: 30, durationDiff: 90 },
        ],
      },
      {
        name: "Finition / Motif",
        required: false,
        choices: [
          { label: "Tracé classique simple (inclus)", priceDiff: 0, durationDiff: 0 },
        ],
      },
    ],
  };

  assert.equal(
    formatOptionChoiceDisplayLabel(
      corruptedService.options[0].choices[0],
      corruptedService.price,
      true
    ),
    "Court (35 €)"
  );
  assert.equal(
    formatOptionChoiceDisplayLabel(
      corruptedService.options[1].choices[0],
      corruptedService.price,
      false
    ),
    "Tracé classique simple (inclus)"
  );

  const healed = normalizeServiceReadData(corruptedService);
  assert.deepEqual(
    healed.options[0].choices.map((c) => c.label),
    ["Court (35 €)", "Mi-long (45 €)", "Long (55 €)", "Extra long (65 €)"]
  );
  assert.equal(
    healed.options[1].choices[0].label,
    "Tracé classique simple (inclus)"
  );
});
