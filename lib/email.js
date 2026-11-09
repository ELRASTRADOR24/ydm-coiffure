import { Resend } from "resend";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "YDM Coiffure <contact@xn--dynaceglobalsant-top-q2b.com>";
const getAdminEmail = () => process.env.ADMIN_NOTIFICATION_EMAIL || "maydientary@gmail.com";

const LOGO_HEADER_URL = "https://res.cloudinary.com/dvecpg1tz/image/upload/v1794179815/ydm-coiffure/ydm-logo-header-tight.png";

// Gabarit minimaliste haute couture pour YDM Coiffure
function emailWrapper({ title, preheader, content }) {
  return `
<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; background-color: #F6F5F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A; }
    .email-container { max-width: 520px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #ECE7E1; }
    .email-body { padding: 32px 30px; }
    .btn-primary { display: inline-block; background-color: #1A1A1A; color: #FFFFFF !important; text-decoration: none; padding: 14px 34px; border-radius: 50px; font-weight: 600; font-size: 12px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; }
    @media screen and (max-width: 600px) {
      .email-container { margin: 12px auto !important; width: 100% !important; border-radius: 12px !important; }
      .email-body { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#F6F5F3;">
  <!-- Preheader -->
  <div style="display:none; font-size:1px; color:#F6F5F3; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${preheader || title}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F6F5F3; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width:520px; background-color:#FFFFFF; border-radius:16px; border:1px solid #ECE7E1;">
          
          <!-- En-tête avec Logo officiel hébergé (aucune pièce jointe = aucun fichier écrasé en bas de mail) -->
          <tr>
            <td align="center" style="padding: 34px 20px 16px 20px; text-align:center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="width:130px;">
                    <img 
                      src="${LOGO_HEADER_URL}" 
                      width="130" 
                      height="96" 
                      alt="YDM Coiffure" 
                      style="display:block; width:130px; height:96px; max-width:130px; border:0; margin:0 auto; object-fit:contain;" 
                    />
                  </td>
                </tr>
              </table>
              <div style="width: 36px; height: 1px; background-color: #C2A696; margin: 16px auto 0 auto;"></div>
            </td>
          </tr>

          <!-- Contenu de la Carte -->
          <tr>
            <td class="email-body" style="padding: 16px 32px 32px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Pied de page minimaliste -->
          <tr>
            <td style="background-color: #FAF8F5; padding: 20px; text-align: center; border-top: 1px solid #ECE7E1; font-size: 11px; color: #777777; line-height: 1.5;">
              <p style="margin: 0 0 3px 0; font-weight: 600; color: #1A1A1A;">
                YDM Coiffure &bull; La Roche-sur-Yon (85000)
              </p>
              <p style="margin: 0; color: #888888;">
                Support client en message privé sur Instagram : 
                <a href="https://instagram.com/ydm_coiffure" style="color: #1A1A1A; font-weight: 600; text-decoration: none;">@ydm_coiffure</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendEmail({ to, subject, html, replyTo }) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log(`[SIMULATION EMAIL] Vers: ${to} | Sujet: ${subject}`);
      return { success: true, simulated: true };
    }

    // Pas d'attachements de logo pour éviter l'encart laid en bas de mail dans Gmail
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

// 1. Accusé de réception de la demande cliente
export async function sendBookingRequestedCustomerEmail(booking) {
  const content = `
    <div style="text-align: center; margin-bottom: 22px;">
      <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 8px 0; color: #1A1A1A; font-weight: normal;">
        Bonjour ${booking.customer.firstName},
      </h2>
      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">
        Votre demande a bien été transmise à la coiffeuse. Chaque séance fait l'objet d'une validation manuelle.
      </p>
    </div>

    <div style="background-color: #FAF8F5; border: 1px solid #ECE7E1; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; line-height: 2; color: #1A1A1A;">
        <tr><td style="color:#777;">Dossier</td><td style="text-align:right; font-weight:700; color:#8C7B70;">${booking.bookingReference}</td></tr>
        <tr><td style="color:#777;">Coiffure</td><td style="text-align:right; font-weight:600;">${booking.service.name}</td></tr>
        <tr><td style="color:#777;">Date souhaitée</td><td style="text-align:right; font-weight:600;">${booking.date}</td></tr>
        <tr><td style="color:#777;">Heure</td><td style="text-align:right; font-weight:600;">${booking.startTime}</td></tr>
        <tr><td style="color:#777;">Tarif estimé</td><td style="text-align:right; font-weight:700;">${booking.totalPrice} €</td></tr>
        <tr><td style="color:#777;">Acompte obligatoire</td><td style="text-align:right; font-weight:700; color:#8C7B70;">10 € (délai 2h dès validation)</td></tr>
        <tr><td style="color:#777;">Solde le jour J</td><td style="text-align:right; font-weight:600;">${booking.remainingBalance} €</td></tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #888888; text-align: center; margin: 18px 0 0 0; line-height: 1.5;">
      Dès validation par la coiffeuse, vous recevrez un lien pour verser votre acompte de 10 € sous 2h pour bloquer définitivement votre heure.
    </p>
  `;

  return sendEmail({
    to: booking.customer.email,
    subject: `Demande reçue [${booking.bookingReference}] • YDM Coiffure`,
    html: emailWrapper({
      title: "Demande de rendez-vous reçue",
      preheader: `Votre demande pour ${booking.service.name} a été transmise.`,
      content,
    }),
  });
}

// 2. Notification nouvelle demande pour la coiffeuse
export async function sendNewBookingAdminNotification(booking) {
  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 6px 0; color: #1A1A1A;">
        Demande de ${booking.customer.firstName} ${booking.customer.lastName}
      </h2>
      <p style="margin: 0; font-size: 13px; color: #666666;">
        Un créneau attend votre approbation dans votre espace.
      </p>
    </div>

    <div style="background-color: #FAF8F5; border: 1px solid #ECE7E1; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; line-height: 2; color: #1A1A1A;">
        <tr><td style="color:#777;">Cliente</td><td style="text-align:right; font-weight:600;">${booking.customer.firstName} ${booking.customer.lastName}</td></tr>
        ${booking.customer.instagram ? `<tr><td style="color:#777;">Instagram</td><td style="text-align:right; font-weight:700; color:#8C7B70;">${booking.customer.instagram}</td></tr>` : ""}
        <tr><td style="color:#777;">Téléphone</td><td style="text-align:right; font-weight:600;">${booking.customer.phone}</td></tr>
        <tr><td style="color:#777;">Coiffure</td><td style="text-align:right; font-weight:600;">${booking.service.name}</td></tr>
        <tr><td style="color:#777;">Date & Heure</td><td style="text-align:right; font-weight:700;">${booking.date} à ${booking.startTime}</td></tr>
        <tr><td style="color:#777;">Acompte à percevoir</td><td style="text-align:right; font-weight:700; color:#8C7B70;">10 €</td></tr>
        ${booking.customer.notes ? `<tr><td style="color:#777;">Remarques</td><td style="text-align:right; color:#555;">${booking.customer.notes}</td></tr>` : ""}
      </table>
    </div>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/bookings" class="btn-primary">
        Voir la demande
      </a>
    </div>
  `;

  return sendEmail({
    to: getAdminEmail(),
    subject: `Nouvelle demande : ${booking.customer.firstName} ${booking.customer.lastName} • ${booking.date}`,
    html: emailWrapper({
      title: "Nouvelle demande de réservation",
      preheader: `Demande de ${booking.customer.firstName} pour ${booking.service.name}`,
      content,
    }),
  });
}

// 3. Demande acceptée — Lien de versement d'acompte (2h)
export async function sendBookingApprovedPaymentEmail(booking, paymentUrl, expiryHours = 2) {
  const targetUrl = paymentUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reserver/statut/${booking.bookingReference}`;

  const content = `
    <div style="text-align: center; margin-bottom: 22px;">
      <h2 style="font-family: Georgia, serif; font-size: 21px; margin: 0 0 8px 0; color: #1A1A1A; font-weight: normal;">
        Votre séance est validée !
      </h2>
      <p style="margin: 0; font-size: 13px; color: #555555; line-height: 1.5;">
        Bonjour ${booking.customer.firstName}, votre créneau pour le <strong>${booking.date} à ${booking.startTime}</strong> (${booking.service.name}) est pré-réservé.
      </p>
    </div>

    <!-- Carte détails sobre et aérée -->
    <div style="background-color: #FAF8F5; border: 1px solid #ECE7E1; border-radius: 12px; padding: 22px; margin: 22px 0;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; line-height: 2; color: #1A1A1A;">
        <tr>
          <td style="color:#777;">Coiffure</td>
          <td style="text-align:right; font-weight:600;">${booking.service.name}</td>
        </tr>
        <tr>
          <td style="color:#777;">Date & heure</td>
          <td style="text-align:right; font-weight:600;">${booking.date} à ${booking.startTime}</td>
        </tr>
        <tr>
          <td style="color:#777;">Acompte obligatoire</td>
          <td style="text-align:right; font-weight:700; color:#8C7B70;">10 € (délai 2h)</td>
        </tr>
        <tr>
          <td style="color:#777;">Moyens de paiement</td>
          <td style="text-align:right; font-weight:600;">Revolut, PayPal ou Wero</td>
        </tr>
        <tr>
          <td style="color:#777;">Motif du virement</td>
          <td style="text-align:right; font-weight:700; color:#8C7B70;">${booking.bookingReference}</td>
        </tr>
        <tr>
          <td style="color:#777;">Solde restant sur place</td>
          <td style="text-align:right; font-weight:600;">${booking.remainingBalance} €</td>
        </tr>
      </table>

      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #DDD8D3; font-size: 11px; color: #8C7B70; text-align: center;">
        Délai strict de ${expiryHours}h pour verser l'acompte afin de bloquer définitivement l'heure.
      </div>
    </div>

    <!-- Bouton d'action -->
    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${targetUrl}" class="btn-primary">
        Verser mon acompte de 10 €
      </a>
    </div>

    <p style="font-size: 12px; color: #888888; text-align: center; line-height: 1.5; margin: 16px 0 0 0;">
      L'adresse de votre prestation à La Roche-sur-Yon vous sera transmise dès confirmation de l'acompte.
    </p>
  `;

  return sendEmail({
    to: booking.customer.email,
    subject: `Rendez-vous validé : réglez votre acompte sous 2h [${booking.bookingReference}]`,
    html: emailWrapper({
      title: "Rendez-vous validé",
      preheader: `Réglez votre acompte de 10 € sous 2h pour bloquer votre créneau.`,
      content,
    }),
  });
}

// 4. Confirmation finale après validation de l'acompte (avec adresse)
export async function sendBookingConfirmedEmail(booking, salonSettings) {
  const address = salonSettings?.homeAddress || {
    street: "33 rue Marcellin Berthelot",
    postalCode: "85000",
    city: "La Roche-sur-Yon",
    accessNotes: "Merci de vous présenter à l'heure exacte, les cheveux lavés et soigneusement démêlés. En cas d'imprévu, écrivez-moi sur Instagram @ydm_coiffure.",
  };

  const content = `
    <div style="text-align: center; margin-bottom: 22px;">
      <h2 style="font-family: Georgia, serif; font-size: 21px; margin: 0 0 8px 0; color: #1A1A1A; font-weight: normal;">
        Séance confirmée !
      </h2>
      <p style="margin: 0; font-size: 13px; color: #555555; line-height: 1.5;">
        Bonjour ${booking.customer.firstName}, votre acompte de 10 € a bien été reçu. Votre rendez-vous est bloqué dans mon planning.
      </p>
    </div>

    <!-- Récapitulatif -->
    <div style="background-color: #FAF8F5; border: 1px solid #ECE7E1; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; line-height: 2; color: #1A1A1A;">
        <tr><td style="color:#777;">Dossier</td><td style="text-align:right; font-weight:700; color:#8C7B70;">${booking.bookingReference}</td></tr>
        <tr><td style="color:#777;">Coiffure</td><td style="text-align:right; font-weight:600;">${booking.service.name}</td></tr>
        <tr><td style="color:#777;">Date & heure</td><td style="text-align:right; font-weight:600;">${booking.date} à ${booking.startTime}</td></tr>
        <tr><td style="color:#777;">Acompte reçu</td><td style="text-align:right; font-weight:700; color:#2B7A4B;">10 € (Reçu)</td></tr>
        <tr><td style="color:#777;">Solde restant sur place</td><td style="text-align:right; font-weight:700;">${booking.remainingBalance} €</td></tr>
      </table>
    </div>

    <!-- Adresse de la prestation -->
    <div style="background-color: #FAF5F0; border: 1px solid #E4D8CE; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <div style="font-size: 10px; font-weight: 700; color: #8C7B70; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
        Adresse de la prestation
      </div>
      <div style="font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: #1A1A1A; margin-bottom: 4px;">
        ${address.street}
      </div>
      <div style="font-size: 13px; color: #555555; margin-bottom: 8px;">
        ${address.postalCode} ${address.city}
      </div>
      <div style="font-size: 11px; color: #777777; line-height: 1.5; font-style: italic;">
        ${address.accessNotes}
      </div>
    </div>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reserver/statut/${booking.bookingReference}" class="btn-primary">
        Voir mon suivi en ligne
      </a>
    </div>
  `;

  return sendEmail({
    to: booking.customer.email,
    subject: `Séance confirmée [${booking.bookingReference}] • YDM Coiffure`,
    html: emailWrapper({
      title: "Séance confirmée",
      preheader: `Votre créneau pour ${booking.service.name} est officiellement validé.`,
      content,
    }),
  });
}

// 5. Demande refusée
export async function sendBookingRejectedEmail(booking, reason) {
  const content = `
    <div style="text-align: center; margin-bottom: 22px;">
      <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 6px 0; color: #1A1A1A; font-weight: normal;">
        Bonjour ${booking.customer.firstName},
      </h2>
      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">
        Je ne peux malheureusement pas donner suite à votre demande pour le <strong>${booking.date} à ${booking.startTime}</strong>.
      </p>
    </div>

    ${reason ? `
    <div style="background-color: #FAF8F5; border: 1px solid #ECE7E1; border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 12px; color: #555555; text-align: center;">
      <strong>Précision :</strong> ${reason}
    </div>` : ""}

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reserver" class="btn-primary">
        Choisir un autre créneau
      </a>
    </div>
  `;

  return sendEmail({
    to: booking.customer.email,
    subject: `Information concernant votre demande [${booking.bookingReference}]`,
    html: emailWrapper({
      title: "Créneau non disponible",
      preheader: `Mise à jour concernant votre demande du ${booking.date}`,
      content,
    }),
  });
}

// 6. Demande expirée (délai de 2h pour l'acompte dépassé)
export async function sendBookingExpiredEmail(booking) {
  const content = `
    <div style="text-align: center; margin-bottom: 22px;">
      <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 6px 0; color: #1A1A1A; font-weight: normal;">
        Bonjour ${booking.customer?.firstName || ""},
      </h2>
      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">
        Le délai de 2 heures pour le règlement de l'acompte de 10 € est expiré. Le créneau du <strong>${booking.date} à ${booking.startTime}</strong> a donc été automatiquement libéré.
      </p>
    </div>

    <div style="background-color: #FAF8F5; border: 1px solid #ECE7E1; border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 12px; color: #555555; text-align: center;">
      Si vous souhaitez toujours réaliser votre coiffure, vous êtes invitée à sélectionner un nouveau créneau disponible.
    </div>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reserver" class="btn-primary">
        Choisir un autre créneau
      </a>
    </div>
  `;

  return sendEmail({
    to: booking.customer.email,
    subject: `Délai d'acompte expiré [${booking.bookingReference}]`,
    html: emailWrapper({
      title: "Créneau libéré",
      preheader: `Votre réservation du ${booking.date} a expiré`,
      content,
    }),
  });
}
