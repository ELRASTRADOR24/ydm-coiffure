/**
 * Service d'envoi de SMS transactionnels via Twilio
 * YDM Coiffure - La Roche-sur-Yon
 */

import {
  resolvePublicAppUrl,
  normalizeBookingPaymentUrl,
  buildBookingStatusUrl,
} from "./appUrl.js";
import { formatShortDateFrench } from "./utils.js";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * Normalise un numéro de téléphone français ou international au format E.164 (+33...)
 */
export function formatPhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/[\s.\-_()]/g, "");

  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    cleaned = "+33" + cleaned.slice(1);
  } else if (cleaned.startsWith("33") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+33" + cleaned;
  }

  return cleaned;
}

/**
 * Envoie un SMS brut via l'API Twilio
 */
export async function sendSms({ to, message }) {
  const recipient = formatPhoneNumber(to);

  if (!recipient) {
    console.warn("[SMS] Numéro de destinataire manquant ou invalide.");
    return { success: false, error: "Numéro de téléphone invalide." };
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`[SMS SIMULATION] Vers ${recipient} : "${message}"`);
    return { success: true, simulated: true };
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const authHeader = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    const params = new URLSearchParams({
      To: recipient,
      From: TWILIO_PHONE_NUMBER,
      Body: message,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Twilio Error]", data);
      return { success: false, error: data.message || "Erreur Twilio", code: data.code };
    }

    console.log(`[SMS Envoyé] SID: ${data.sid} vers ${recipient}`);
    return { success: true, sid: data.sid, status: data.status };
  } catch (err) {
    console.error("[SMS Exception]", err);
    return { success: false, error: err.message };
  }
}

/**
 * SMS 1 : Accusé de réception de la demande cliente
 */
export async function sendBookingRequestedSms(booking) {
  if (!booking?.customer?.phone) return;
  const name = booking.customer.firstName || "Bonjour";
  const date = booking.date || "";
  const service = booking.service?.name || "coiffure";
  const ref = booking.bookingReference || "";

  const msg = `YDM Coiffure : ${name}, votre demande (${ref}) pour "${service}" le ${date} a bien ete enregistree. Nous validons le creneau sous peu !`;
  return sendSms({ to: booking.customer.phone, message: msg });
}

/**
 * SMS 1b : Notification instantanée à la coiffeuse (Admin) pour nouvelle demande
 */
export async function sendNewBookingAdminSms(
  booking,
  adminPhone,
  options = {}
) {
  const targetPhone = adminPhone || process.env.ADMIN_PHONE_NUMBER || "0649821730";
  const name = `${booking?.customer?.firstName || ""} ${booking?.customer?.lastName || ""}`.trim() || "Cliente";
  const date = booking?.date || "";
  const time = booking?.startTime || "";
  const service = booking?.service?.name || "coiffure";
  const ref = booking?.bookingReference || "";
  const appUrl = resolvePublicAppUrl(options?.request, options?.appUrl);

  const msg = `YDM Coiffure [ADMIN] : Nouvelle demande de ${name} pour "${service}" le ${date} a ${time} (Ref: ${ref}). Rendez-vous sur votre espace admin pour accepter ou refuser : ${appUrl}/admin/bookings`;
  return sendSms({ to: targetPhone, message: msg });
}

/**
 * SMS 1c : Notification à la coiffeuse quand une cliente déclare avoir réglé l'acompte en direct (Wero, Revolut, PayPal)
 */
export async function sendDepositDeclaredAdminSms(
  booking,
  method,
  adminPhone,
  options = {}
) {
  const targetPhone = adminPhone || process.env.ADMIN_PHONE_NUMBER || "0649821730";
  const name = `${booking?.customer?.firstName || ""} ${booking?.customer?.lastName || ""}`.trim() || "Cliente";
  const ref = booking?.bookingReference || "";
  const appUrl = resolvePublicAppUrl(options?.request, options?.appUrl);

  const deposit = booking?.depositAmount ?? 10;
  const msg = `YDM Coiffure [ADMIN] : Acompte de ${deposit}E declare par ${name} via ${method || "Virement"} (Ref: ${ref}). Verifiez votre compte et validez le rdv : ${appUrl}/admin/bookings`;
  return sendSms({ to: targetPhone, message: msg });
}

/**
 * SMS 2 : Approbation avec instructions d'acompte (2h)
 */
export async function sendBookingApprovedPaymentSms(
  booking,
  paymentUrl,
  holdHours = 2,
  options = {}
) {
  if (!booking?.customer?.phone) return;
  const name = booking.customer.firstName || "Bonjour";
  const date = booking.date || "";
  const time = booking.startTime || "";
  const ref = booking.bookingReference || "";
  const targetUrl = normalizeBookingPaymentUrl(
    paymentUrl,
    ref,
    options?.request,
    options?.appUrl
  );
  const deposit = booking?.depositAmount ?? 10;
  const safeHoldHours = Number.isFinite(Number(holdHours)) && Number(holdHours) > 0
    ? Number(holdHours)
    : 2;

  const msg = `YDM Coiffure : Bonne nouvelle ${name} ! Votre rdv du ${date} a ${time} est valide. Merci de verser l'acompte de ${deposit}E sous ${safeHoldHours}h pour bloquer definitivement le creneau : ${targetUrl}`;
  return sendSms({ to: booking.customer.phone, message: msg });
}

/**
 * SMS 3 : Confirmation définitive dès validation de l'acompte
 */
export async function sendBookingConfirmedSms(booking) {
  if (!booking?.customer?.phone) return;
  const name = booking.customer.firstName || "Bonjour";
  const date = booking.date || "";
  const time = booking.startTime || "";
  const service = booking.service?.name || "coiffure";
  const deposit = booking?.depositAmount ?? 10;

  const msg = `YDM Coiffure : ${name}, votre acompte de ${deposit}E est valide ! Votre rdv pour "${service}" est confirme le ${date} a ${time} a La Roche-sur-Yon. A tres vite !`;
  return sendSms({ to: booking.customer.phone, message: msg });
}

/**
 * SMS 4 : Refus ou annulation
 */
export async function sendBookingRejectedSms(booking, reason) {
  if (!booking?.customer?.phone) return;
  const name = booking.customer.firstName || "Bonjour";
  const date = booking.date || "";
  const reasonText = reason ? ` (${reason})` : "";

  const msg = `YDM Coiffure : Bonjour ${name}, le creneau du ${date} n'est malheureusement plus disponible${reasonText}. N'hesitez pas a choisir une autre date sur notre site.`;
  return sendSms({ to: booking.customer.phone, message: msg });
}

/**
 * SMS 5 : Relance cliente si l'acompte déclaré n'a pas encore été reçu sur le compte
 */
export async function sendDepositNotReceivedCustomerSms(
  booking,
  reason = "",
  options = {}
) {
  if (!booking?.customer?.phone) return;
  const name = booking.customer.firstName || "Bonjour";
  const ref = booking.bookingReference || "";
  const deposit = booking?.depositAmount ?? 10;
  const statusUrl = normalizeBookingPaymentUrl(
    booking?.stripePaymentUrl,
    ref,
    options?.request,
    options?.appUrl
  );
  const notePart = reason ? ` (${String(reason).trim().slice(0, 80)})` : "";

  const msg = `YDM Coiffure : ${name}, votre acompte de ${deposit}E (${ref}) n'a pas encore ete recu sur notre compte${notePart}. Verifiez votre virement et revalidez ici : ${statusUrl}`;
  return sendSms({ to: booking.customer.phone, message: msg });
}

/**
 * SMS 6 : Notification d'annulation d'un rendez-vous
 */
export async function sendBookingCancelledSms(booking, reason = "") {
  if (!booking?.customer?.phone) return;
  const name = booking.customer.firstName || "Bonjour";
  const date = booking.date || "";
  const time = booking.startTime || "";
  const reasonText = reason ? ` (${String(reason).trim().slice(0, 90)})` : "";

  const msg = `YDM Coiffure : Bonjour ${name}, votre rendez-vous du ${date}${time ? ` a ${time}` : ""} a bien ete annule${reasonText}. Vous pouvez reprendre un creneau sur notre site.`;
  return sendSms({ to: booking.customer.phone, message: msg });
}

/**
 * SMS 7 : La coiffeuse propose une autre date à la cliente
 */
export async function sendBookingRescheduleProposedSms(
  booking,
  reason = "",
  options = {}
) {
  if (!booking?.customer?.phone) return;
  const name = booking.customer.firstName || "Bonjour";
  const dateLabel = formatShortDateFrench(booking.date) || booking.date || "";
  const time = booking.startTime || "";
  const ref = booking.bookingReference || "";
  const statusUrl = buildBookingStatusUrl(ref, options?.request, options?.appUrl);
  const notePart = reason ? ` (${String(reason).trim().slice(0, 80)})` : "";

  const msg = `YDM Coiffure : Bonjour ${name}, la coiffeuse vous propose une nouvelle date le ${dateLabel} a ${time}${notePart}. Est-ce que ca vous va ? Repondez en 1 clic ici : ${statusUrl}`;
  return sendSms({ to: booking.customer.phone, message: msg });
}

/**
 * SMS 8 : Alerte Admin lorsque la cliente accepte la date proposée
 */
export async function sendProposalAcceptedAdminSms(
  booking,
  adminPhone,
  options = {}
) {
  const targetPhone = adminPhone || process.env.ADMIN_PHONE_NUMBER || "0649821730";
  const name = `${booking?.customer?.firstName || ""} ${booking?.customer?.lastName || ""}`.trim() || "Cliente";
  const dateLabel = formatShortDateFrench(booking?.date) || booking?.date || "";
  const time = booking?.startTime || "";
  const ref = booking?.bookingReference || "";
  const appUrl = resolvePublicAppUrl(options?.request, options?.appUrl);

  const msg = `YDM Coiffure [ADMIN] : ${name} a accepte le ${dateLabel} a ${time} (Ref: ${ref}). Lien d'acompte envoye ! Suivi : ${appUrl}/admin/bookings`;
  return sendSms({ to: targetPhone, message: msg });
}

/**
 * SMS 9 : Alerte Admin lorsque la cliente soumet une autre date en retour
 */
export async function sendClientCounterProposalAdminSms(
  booking,
  adminPhone,
  options = {}
) {
  const targetPhone = adminPhone || process.env.ADMIN_PHONE_NUMBER || "0649821730";
  const name = `${booking?.customer?.firstName || ""} ${booking?.customer?.lastName || ""}`.trim() || "Cliente";
  const dateLabel = formatShortDateFrench(booking?.date) || booking?.date || "";
  const time = booking?.startTime || "";
  const ref = booking?.bookingReference || "";
  const appUrl = resolvePublicAppUrl(options?.request, options?.appUrl);

  const msg = `YDM Coiffure [ADMIN] : ${name} prefere une autre date (${dateLabel} a ${time}, Ref: ${ref}). Validez ou re-proposez ici : ${appUrl}/admin/bookings`;
  return sendSms({ to: targetPhone, message: msg });
}
