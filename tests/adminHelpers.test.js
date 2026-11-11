import test from "node:test";
import assert from "node:assert/strict";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import {
  getParisDateString,
  isValidDateString,
  isValidTimeString,
  expandDateRangeInclusive,
  findManualBookingConflict,
  formatPostalCityValue,
  parsePostalCityInput,
  getBookingStatusLabel,
  matchesBookingStatusFilter,
  ensureUniqueServiceSlug,
  resolveValidatedBookingOptions,
  resolvePaymentAccounts,
} from "../lib/adminHelpers.js";

test("getParisDateString uses Europe/Paris timezone across UTC midnight", () => {
  // 2026-07-15T22:30:00Z is 2026-07-16 00:30 CEST in Paris
  const summerLateUtc = new Date("2026-07-15T22:30:00.000Z");
  assert.equal(getParisDateString(summerLateUtc), "2026-07-16");

  // 2026-01-15T23:30:00Z is 2026-01-16 00:30 CET in Paris
  const winterLateUtc = new Date("2026-01-15T23:30:00.000Z");
  assert.equal(getParisDateString(winterLateUtc), "2026-01-16");
});

test("isValidDateString and isValidTimeString validate calendar dates and HH:mm", () => {
  assert.equal(isValidDateString("2026-03-29"), true);
  assert.equal(isValidDateString("2026-02-30"), false);
  assert.equal(isValidDateString("2026-13-01"), false);
  assert.equal(isValidDateString("invalid"), false);

  assert.equal(isValidTimeString("09:30"), true);
  assert.equal(isValidTimeString("23:59"), true);
  assert.equal(isValidTimeString("24:00"), false);
  assert.equal(isValidTimeString("9:30"), false);
});

test("expandDateRangeInclusive handles DST transitions cleanly without skipping or duplicating days", () => {
  // March spring-forward DST in Europe/Paris (last Sunday of March: 2026-03-29)
  const marchRange = expandDateRangeInclusive("2026-03-28", "2026-03-31");
  assert.deepEqual(marchRange.dates, [
    "2026-03-28",
    "2026-03-29",
    "2026-03-30",
    "2026-03-31",
  ]);

  // October fall-back DST in Europe/Paris (last Sunday of October: 2026-10-25)
  const octRange = expandDateRangeInclusive("2026-10-24", "2026-10-27");
  assert.deepEqual(octRange.dates, [
    "2026-10-24",
    "2026-10-25",
    "2026-10-26",
    "2026-10-27",
  ]);

  // Inverted range returns explicit French error
  const invalidOrder = expandDateRangeInclusive("2026-10-27", "2026-10-24");
  assert.ok(invalidOrder.error);
});

test("findManualBookingConflict permits same-day & arbitrary HH:mm slots and blocks only real overlaps", () => {
  const existingBookings = [
    {
      _id: "b1",
      date: "2026-11-11",
      startTime: "10:00",
      endTime: "13:00",
      status: "CONFIRMED",
      customer: { firstName: "Sarah", lastName: "B." },
    },
    {
      _id: "b2",
      date: "2026-11-11",
      startTime: "14:00",
      endTime: "16:00",
      status: "CANCELLED",
      customer: { firstName: "Annulée", lastName: "" },
    },
    {
      _id: "b3",
      date: "2026-11-11",
      startTime: "16:30",
      endTime: "18:00",
      status: "PENDING_PAYMENT",
      holdExpiresAt: "2026-11-10T10:00:00.000Z", // expired
      customer: { firstName: "Expirée", lastName: "" },
    },
  ];
  const unavailabilities = [
    {
      date: "2026-11-11",
      isAllDay: false,
      startTime: "18:30",
      endTime: "20:00",
    },
  ];

  // Same-day non-30-min start time (09:15 for 45 min ending right at 10:00) -> Allowed!
  assert.equal(
    findManualBookingConflict({
      date: "2026-11-11",
      startTime: "09:15",
      duration: 45,
      existingBookings,
      unavailabilities,
      now: new Date("2026-11-11T08:00:00.000Z"),
    }).conflict,
    false
  );

  // Over Cancelled booking -> Allowed!
  assert.equal(
    findManualBookingConflict({
      date: "2026-11-11",
      startTime: "14:15",
      duration: 90,
      existingBookings,
      unavailabilities,
      now: new Date("2026-11-11T08:00:00.000Z"),
    }).conflict,
    false
  );

  // Over Expired PENDING_PAYMENT hold -> Allowed!
  assert.equal(
    findManualBookingConflict({
      date: "2026-11-11",
      startTime: "16:30",
      duration: 60,
      existingBookings,
      unavailabilities,
      now: new Date("2026-11-11T08:00:00.000Z"),
    }).conflict,
    false
  );

  // Overlaps confirmed b1 -> Conflict!
  const hitBooking = findManualBookingConflict({
    date: "2026-11-11",
    startTime: "12:00",
    duration: 90,
    existingBookings,
    unavailabilities,
    now: new Date("2026-11-11T08:00:00.000Z"),
  });
  assert.equal(hitBooking.conflict, true);
  assert.equal(hitBooking.type, "booking");

  // Overlaps partial unavailability -> Conflict!
  const hitUnav = findManualBookingConflict({
    date: "2026-11-11",
    startTime: "18:00",
    duration: 60,
    existingBookings,
    unavailabilities,
    now: new Date("2026-11-11T08:00:00.000Z"),
  });
  assert.equal(hitUnav.conflict, true);
  assert.equal(hitUnav.type, "unavailability");
});

test("formatPostalCityValue and parsePostalCityInput preserve spacing & parse reliably", () => {
  assert.equal(formatPostalCityValue(undefined), "85000 La Roche-sur-Yon");
  assert.equal(
    formatPostalCityValue({ postalCode: "85000", city: "La Roche-sur-Yon" }),
    "85000 La Roche-sur-Yon"
  );
  assert.equal(formatPostalCityValue({ postalCode: "", city: "" }), "");

  assert.deepEqual(parsePostalCityInput("85000 La Roche-sur-Yon"), {
    postalCode: "85000",
    city: "La Roche-sur-Yon",
  });
  assert.deepEqual(parsePostalCityInput("85000   "), {
    postalCode: "85000",
    city: "",
  });
  assert.deepEqual(parsePostalCityInput(""), { postalCode: "", city: "" });
});

test("matchesBookingStatusFilter and getBookingStatusLabel handle CANCELLED/REJECTED/EXPIRED group", () => {
  assert.equal(matchesBookingStatusFilter("REJECTED", "CANCELLED"), true);
  assert.equal(matchesBookingStatusFilter("EXPIRED", "CANCELLED"), true);
  assert.equal(matchesBookingStatusFilter("CANCELLED", "CANCELLED"), true);
  assert.equal(matchesBookingStatusFilter("CONFIRMED", "CANCELLED"), false);
  assert.equal(matchesBookingStatusFilter("REJECTED", "ALL"), true);

  assert.equal(getBookingStatusLabel("PENDING_APPROVAL"), "À valider");
  assert.equal(getBookingStatusLabel("PENDING_PAYMENT"), "En attente de paiement");
  assert.equal(getBookingStatusLabel("CONFIRMED"), "Confirmé");
});

test("ensureUniqueServiceSlug avoids duplicate slugs on creation or rename", () => {
  const existing = [
    { _id: "1", slug: "knotless-sans-meches" },
    { _id: "2", slug: "knotless-sans-meches-2" },
  ];
  assert.equal(
    ensureUniqueServiceSlug("knotless-sans-meches", existing),
    "knotless-sans-meches-3"
  );
  // Updating service _id "1" keeping its own slug keeps original slug
  assert.equal(
    ensureUniqueServiceSlug("knotless-sans-meches", existing, "1"),
    "knotless-sans-meches"
  );
});

test("Booking & Customer schemas accept manual bookings without lastName/email and persist depositDeclared", () => {
  const manualBooking = new Booking({
    bookingReference: "YDM-2026-9999",
    customer: {
      firstName: "Aminata",
      lastName: "",
      email: "",
      phone: "0600000000",
    },
    service: {
      id: "srv_1",
      name: "Knotless",
      price: 35,
      duration: 180,
      depositAmount: 10,
    },
    date: "2026-11-11",
    startTime: "10:00",
    endTime: "13:00",
    totalDuration: 180,
    totalPrice: 35,
    depositAmount: 10,
    remainingBalance: 25,
    status: "CONFIRMED",
    depositDeclared: true,
    depositDeclaredMethod: "Wero",
    depositDeclaredAt: new Date("2026-11-11T09:00:00Z"),
  });

  assert.equal(manualBooking.validateSync(), undefined);
  assert.equal(manualBooking.depositDeclared, true);
  assert.equal(manualBooking.depositDeclaredMethod, "Wero");

  const manualCustomer = new Customer({
    firstName: "Aminata",
    lastName: "",
    email: "",
    phone: "0600000000",
  });
  assert.equal(manualCustomer.validateSync(), undefined);
});

test("findManualBookingConflict keeps declared PENDING_PAYMENT holds blocked past holdExpiresAt", () => {
  const existingBookings = [
    {
      _id: "b_declared",
      date: "2026-11-15",
      startTime: "10:00",
      endTime: "13:00",
      status: "PENDING_PAYMENT",
      depositDeclared: true,
      holdExpiresAt: "2026-11-14T08:00:00.000Z", // expired timestamp, but deposit was declared!
      customer: { firstName: "Maya", lastName: "D." },
    },
  ];
  const hit = findManualBookingConflict({
    date: "2026-11-15",
    startTime: "10:30",
    duration: 90,
    existingBookings,
    now: new Date("2026-11-14T15:00:00.000Z"),
  });
  assert.equal(hit.conflict, true);
  assert.equal(hit.type, "booking");
});

test("resolveValidatedBookingOptions prevents client price/duration tampering and enforces service rules", () => {
  const hairIncludedService = {
    price: 50,
    duration: 180,
    includesHair: true,
    options: [
      {
        name: "Longueur souhaitée",
        required: true,
        choices: [
          { label: "Court (50 €)", priceDiff: 0, durationDiff: 0 },
          { label: "Extra long (80 €)", priceDiff: 30, durationDiff: 90 },
        ],
      },
    ],
  };

  // Even if client tampers priceDiff: -999 and durationDiff: -150 and tries to duplicate student discount:
  const valid = resolveValidatedBookingOptions(hairIncludedService, [
    { name: "Longueur souhaitée", choice: "Extra long (80 €)", priceDiff: -999, durationDiff: -150 },
    { name: "Couleur des mèches", choice: "Marron caramel", priceDiff: -20, durationDiff: 0 },
    { name: "Réduction Étudiante", choice: "-5 €", priceDiff: -50, durationDiff: 0 },
    { name: "Réduction Étudiante", choice: "-5 €", priceDiff: -50, durationDiff: 0 },
  ]);

  assert.equal(valid.error, undefined);
  assert.equal(valid.totalPrice, 75); // 50 + 30 - 5 (single student discount)
  assert.equal(valid.totalDuration, 270); // 180 + 90
  assert.equal(valid.validatedOptions.length, 3);

  // Non-hair service must reject student discount and unknown option
  const noHairService = {
    price: 30,
    duration: 180,
    includesHair: false,
    options: [],
  };
  const studentOnNoHair = resolveValidatedBookingOptions(noHairService, [
    { name: "Réduction Étudiante", choice: "-5 €", priceDiff: -5 },
  ]);
  assert.ok(studentOnNoHair.error);

  const missingRequired = resolveValidatedBookingOptions(hairIncludedService, []);
  assert.ok(missingRequired.error);

  // Also accepts healed display label when raw DB document still carries stale Court (3 €) label
  const staleDbService = {
    price: 35,
    duration: 180,
    includesHair: false,
    options: [
      {
        name: "Longueur souhaitée",
        required: true,
        choices: [
          { label: "Court (3 €)", priceDiff: 0, durationDiff: 0 },
          { label: "Mi-long (45 €)", priceDiff: 10, durationDiff: 30 },
        ],
      },
    ],
  };
  const healedRes = resolveValidatedBookingOptions(staleDbService, [
    { name: "Longueur souhaitée", choice: "Court (35 €)" },
  ]);
  assert.equal(healedRes.error, undefined);
  assert.equal(healedRes.totalPrice, 35);
  assert.equal(healedRes.validatedOptions[0].choice, "Court (35 €)");
});

test("resolvePaymentAccounts normalizes Revolut, PayPal and Wero accounts cleanly", () => {
  const defaults = resolvePaymentAccounts({});
  assert.equal(defaults.revolutEnabled, true);
  assert.equal(defaults.revolutTag, "@ydmcoiffure");
  assert.equal(defaults.revolutUrl, "https://revolut.me/ydmcoiffure");
  assert.equal(defaults.paypalEnabled, true);
  assert.equal(defaults.paypalBaseUrl, "https://paypal.me/ydmcoiffure");
  assert.equal(defaults.weroEnabled, true);
  assert.equal(defaults.weroPhone, "07 67 66 38 69");
  assert.equal(defaults.weroDigits, "0767663869");

  const normalizedFromUrls = resolvePaymentAccounts({
    paymentAccounts: {
      revolutEnabled: true,
      revolutTag: "https://revolut.me/maydiehair",
      paypalEnabled: true,
      paypalHandle: "https://www.paypal.me/maydiehair/10EUR",
      weroEnabled: false,
      weroPhone: "+33 6 12 34 56 78",
    },
  });
  assert.equal(normalizedFromUrls.revolutTag, "@maydiehair");
  assert.equal(normalizedFromUrls.revolutUrl, "https://revolut.me/maydiehair");
  assert.equal(normalizedFromUrls.paypalHandle, "maydiehair");
  assert.equal(normalizedFromUrls.paypalDisplayTag, "@maydiehair");
  assert.equal(normalizedFromUrls.paypalBaseUrl, "https://paypal.me/maydiehair");
  assert.equal(normalizedFromUrls.weroEnabled, false);
  assert.equal(normalizedFromUrls.weroDigits, "+33612345678");

  const emptyHandle = resolvePaymentAccounts({
    paymentAccounts: {
      revolutEnabled: true,
      revolutTag: "",
      paypalEnabled: true,
      paypalHandle: "  ",
      weroEnabled: true,
      weroPhone: "",
    },
  });
  assert.equal(emptyHandle.revolutEnabled, false);
  assert.equal(emptyHandle.paypalEnabled, false);
  assert.equal(emptyHandle.weroEnabled, false);
});
