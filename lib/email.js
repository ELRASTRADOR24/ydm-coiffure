import { Resend } from "resend";
import { getSettings } from "./store.js";
import { resolvePublicAppUrl } from "./appUrl.js";
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
