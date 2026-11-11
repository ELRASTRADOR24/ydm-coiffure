import { Resend } from "resend";
import { getSettings } from "./store.js";
import { resolvePublicAppUrl, buildBookingStatusUrl } from "./appUrl.js";
import {
  getResolvedEmailSettings,
  buildEmailVariables,
  renderEmailFromTemplate,
} from "./emailTemplates.js";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  "YDM Coiffure <contact@xn--dynaceglobalsant-top-q2b.com>";
export const getAdminNotificationEmail = () =>
  process.env.ADMIN_NOTIFICATION_EMAIL || "maydientary@gmail.com";

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!to || !String(to).trim()) {
    return { success: true, skipped: true };
  }
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log(`[SIMULATION EMAIL] Vers: ${to} | Sujet: ${subject}`);
      return { success: true, simulated: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo: replyTo || FROM_EMAIL,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Exception email:", error);
    return { success: false, error: error.message };
  }
}

async function resolveDynamicEmail(templateKey, options = {}) {
  const settings = options.salonSettings || (await getSettings());
  const emailSettings =
    options.emailSettingsOverride || getResolvedEmailSettings(settings);
  const resolvedAppUrl = resolvePublicAppUrl(options.request, options.appUrl);
  const variables = buildEmailVariables({
    booking: options.booking,
    salonSettings: settings,
    paymentUrl: options.paymentUrl,
    expiryHours: options.expiryHours,
    reason: options.reason,
    appUrl: resolvedAppUrl,
    request: options.request,
  });

  return {
    settings,
    rendered: renderEmailFromTemplate({
      templateKey,
      emailSettings,
      variables,
    }),
  };
}

// 1. Accusé de réception de la demande cliente
export async function sendBookingRequestedCustomerEmail(
  booking,
  salonSettings,
  options = {}
) {
  const { rendered } = await resolveDynamicEmail("requested", {
    booking,
    salonSettings,
    request: options?.request,
    appUrl: options?.appUrl,
  });

  return sendEmail({
    to: booking.customer.email,
    subject: rendered.subject,
    html: rendered.html,
  });
}

// 2. Notification nouvelle demande pour la coiffeuse
export async function sendNewBookingAdminNotification(
  booking,
  salonSettings,
  options = {}
) {
  const { rendered } = await resolveDynamicEmail("adminNotice", {
    booking,
    salonSettings,
    request: options?.request,
    appUrl: options?.appUrl,
  });

  return sendEmail({
    to: getAdminNotificationEmail(),
    subject: rendered.subject,
    html: rendered.html,
  });
}

// 3. Demande acceptée — Lien de versement d'acompte (2h)
export async function sendBookingApprovedPaymentEmail(
  booking,
  paymentUrl,
  expiryHours = 2,
  salonSettings,
  options = {}
) {
  const { rendered } = await resolveDynamicEmail("approved", {
    booking,
    paymentUrl,
    expiryHours,
    salonSettings,
    request: options?.request,
    appUrl: options?.appUrl,
  });

  return sendEmail({
    to: booking.customer.email,
    subject: rendered.subject,
    html: rendered.html,
  });
}

// 4. Confirmation finale après validation de l'acompte (avec adresse privée)
export async function sendBookingConfirmedEmail(
  booking,
  salonSettings,
  options = {}
) {
  const { rendered } = await resolveDynamicEmail("confirmed", {
    booking,
    salonSettings,
    request: options?.request,
    appUrl: options?.appUrl,
  });

  return sendEmail({
    to: booking.customer.email,
    subject: rendered.subject,
    html: rendered.html,
  });
}

// 5. Demande refusée
export async function sendBookingRejectedEmail(
  booking,
  reason,
  salonSettings,
  options = {}
) {
  const { rendered } = await resolveDynamicEmail("rejected", {
    booking,
    reason,
    salonSettings,
    request: options?.request,
    appUrl: options?.appUrl,
  });

  return sendEmail({
    to: booking.customer.email,
    subject: rendered.subject,
    html: rendered.html,
  });
}

// 6. Demande expirée (délai de 2h pour l'acompte dépassé)
export async function sendBookingExpiredEmail(
  booking,
  salonSettings,
  options = {}
) {
  const { rendered } = await resolveDynamicEmail("expired", {
    booking,
    salonSettings,
    request: options?.request,
    appUrl: options?.appUrl,
  });

  return sendEmail({
    to: booking.customer.email,
    subject: rendered.subject,
    html: rendered.html,
  });
}

function escapeSimpleHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 7. Alerte admin immédiate quand une cliente déclare avoir réglé l'acompte
export async function sendDepositDeclaredAdminEmail(
  booking,
  method = "Wero / Revolut / PayPal",
  salonSettings,
  options = {}
) {
  const appUrl = resolvePublicAppUrl(options?.request, options?.appUrl);
  const adminBookingsUrl = `${appUrl}/admin/bookings`;
  const ref = booking?.bookingReference || "";
  const fullName =
    `${booking?.customer?.firstName || ""} ${booking?.customer?.lastName || ""}`.trim() ||
    "Une cliente";
  const deposit = booking?.depositAmount ?? 10;
  const serviceName = booking?.service?.name || "Coiffure";
  const date = booking?.date || "";
  const time = booking?.startTime || "";
  const phone = booking?.customer?.phone || "";
  const instagram = booking?.customer?.instagram || "";

  const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:24px;background:#F6F5F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1A1A1A;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #ECE7E1;border-radius:16px;padding:28px;">
    <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#8C7B70;text-align:center;">Acompte déclaré par la cliente</p>
    <h2 style="margin:0 0 14px 0;font-family:Georgia,serif;font-size:21px;font-weight:normal;text-align:center;color:#2C1D14;">${escapeSimpleHtml(fullName)} indique avoir payé (${escapeSimpleHtml(deposit)} €)</h2>
    <p style="margin:0 0 18px 0;font-size:13px;line-height:1.5;color:#555555;text-align:center;">Vérifiez la réception sur <strong>${escapeSimpleHtml(method)}</strong> puis validez le rendez-vous dans votre panneau d'administration.</p>
    <div style="background:#FAF8F5;border:1px solid #ECE7E1;border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;line-height:1.7;">
      <div><strong>Référence :</strong> ${escapeSimpleHtml(ref)}</div>
      <div><strong>Moyen déclaré :</strong> ${escapeSimpleHtml(method)}</div>
      <div><strong>Montant attendu :</strong> ${escapeSimpleHtml(deposit)} €</div>
      <div><strong>Prestation :</strong> ${escapeSimpleHtml(serviceName)}</div>
      <div><strong>Créneau :</strong> ${escapeSimpleHtml(date)} à ${escapeSimpleHtml(time)}</div>
      ${phone ? `<div><strong>Téléphone :</strong> ${escapeSimpleHtml(phone)}</div>` : ""}
      ${instagram ? `<div><strong>Instagram :</strong> ${escapeSimpleHtml(instagram)}</div>` : ""}
    </div>
    <div style="text-align:center;">
      <a href="${escapeSimpleHtml(adminBookingsUrl)}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:13px 24px;border-radius:50px;">Vérifier &amp; valider l'acompte</a>
    </div>
  </div>
</body></html>`;

  return sendEmail({
    to: getAdminNotificationEmail(),
    subject: `Acompte déclaré (${deposit} € via ${method}) • ${ref}`,
    html,
  });
}

// 8. Notification cliente si la coiffeuse n'a pas encore retrouvé le virement d'acompte
export async function sendDepositNotReceivedCustomerEmail(
  booking,
  reason = "",
  salonSettings,
  options = {}
) {
  const statusUrl = buildBookingStatusUrl(
    booking?.bookingReference,
    options?.request,
    options?.appUrl
  );
  const firstName = booking?.customer?.firstName || "Bonjour";
  const ref = booking?.bookingReference || "";
  const deposit = booking?.depositAmount ?? 10;
  const phone = salonSettings?.phone || booking?.paymentPhone || "07 67 66 38 69";
  const safeReason = String(reason || "").trim();

  const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:24px;background:#F6F5F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1A1A1A;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #ECE7E1;border-radius:16px;padding:28px;">
    <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#B45309;text-align:center;">Vérification d&apos;acompte</p>
    <h2 style="margin:0 0 14px 0;font-family:Georgia,serif;font-size:21px;font-weight:normal;text-align:center;color:#2C1D14;">Bonjour ${escapeSimpleHtml(firstName)}, virement non encore reçu</h2>
    <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#555555;text-align:center;">Nous avons bien reçu votre confirmation sur le site pour le dossier <strong>${escapeSimpleHtml(ref)}</strong>, mais l&apos;acompte de <strong>${escapeSimpleHtml(deposit)} €</strong> n&apos;apparaît pas encore sur notre compte.</p>
    ${safeReason ? `<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:14px;margin-bottom:16px;font-size:12px;color:#78350F;text-align:center;"><strong>Note de la coiffeuse :</strong> ${escapeSimpleHtml(safeReason)}</div>` : ""}
    <div style="background:#FAF8F5;border:1px solid #ECE7E1;border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;line-height:1.7;">
      <div><strong>Numéro (Wero / Revolut / PayPal) :</strong> ${escapeSimpleHtml(phone)}</div>
      <div><strong>Montant attendu :</strong> ${escapeSimpleHtml(deposit)} €</div>
      <div><strong>Motif à indiquer :</strong> ${escapeSimpleHtml(ref)}</div>
    </div>
    <p style="margin:0 0 18px 0;font-size:12px;line-height:1.5;color:#666666;text-align:center;">Merci de vérifier votre virement puis de cliquer à nouveau sur «&nbsp;J&apos;ai payé mon acompte&nbsp;» depuis votre page de suivi :</p>
    <div style="text-align:center;">
      <a href="${escapeSimpleHtml(statusUrl)}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:13px 24px;border-radius:50px;">Accéder à mon suivi &amp; re-valider</a>
    </div>
  </div>
</body></html>`;

  return sendEmail({
    to: booking?.customer?.email,
    subject: `Acompte de ${deposit} € non encore reçu • ${ref}`,
    html,
  });
}
