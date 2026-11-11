import { deepMergePreserveEmpty, cloneValue } from "./siteContent.js";
import {
  CANONICAL_PRODUCTION_URL,
  resolvePublicAppUrl,
  buildBookingStatusUrl,
  normalizeBookingPaymentUrl,
} from "./appUrl.js";

export const DEFAULT_EMAIL_LOGO_URL =
  "https://res.cloudinary.com/dvecpg1tz/image/upload/v1794179815/ydm-coiffure/ydm-logo-header-tight.png";

export const EMAIL_VARIABLES = [
  { token: "{prenom}", label: "Prénom", sample: "Sarah" },
  { token: "{nom}", label: "Nom", sample: "B." },
  { token: "{reference}", label: "Référence", sample: "YDM-2026-9482" },
  { token: "{coiffure}", label: "Coiffure", sample: "Knotless (Sans mèches) • Mi-long" },
  { token: "{date}", label: "Date", sample: "18/11/2026" },
  { token: "{heure}", label: "Heure", sample: "10:00" },
  { token: "{prix}", label: "Tarif total", sample: "40 €" },
  { token: "{acompte}", label: "Acompte", sample: "10 €" },
  { token: "{solde}", label: "Solde sur place", sample: "30 €" },
  { token: "{delai_heures}", label: "Délai (h)", sample: "2" },
  { token: "{telephone}", label: "Téléphone", sample: "06 12 34 56 78" },
  { token: "{instagram}", label: "Instagram", sample: "@sarah_b" },
  { token: "{notes}", label: "Remarques", sample: "Cheveux lavés et démêlés." },
  { token: "{motif}", label: "Motif refus", sample: "Créneau déjà complet sur cette plage horaire." },
  { token: "{adresse_rue}", label: "Rue (privée)", sample: "33 rue Marcellin Berthelot" },
  { token: "{adresse_cp_ville}", label: "CP & Ville", sample: "85000 La Roche-sur-Yon" },
  {
    token: "{adresse_acces}",
    label: "Consignes d'accès",
    sample: "Merci de vous présenter à l'heure exacte, les cheveux lavés et démêlés.",
  },
  {
    token: "{lien_paiement}",
    label: "Lien acompte",
    sample: `${CANONICAL_PRODUCTION_URL}/reserver/statut/YDM-2026-9482`,
  },
  {
    token: "{lien_suivi}",
    label: "Lien suivi",
    sample: `${CANONICAL_PRODUCTION_URL}/reserver/statut/YDM-2026-9482`,
  },
  {
    token: "{lien_reservation}",
    label: "Lien réserver",
    sample: `${CANONICAL_PRODUCTION_URL}/reserver`,
  },
  {
    token: "{lien_admin}",
    label: "Lien Admin",
    sample: `${CANONICAL_PRODUCTION_URL}/admin/bookings`,
  },
];

export const EMAIL_FONT_CHOICES = [
  {
    id: "sans",
    label: "Sans-Serif Moderne (Gmail / Arial)",
    css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  {
    id: "georgia",
    label: "Georgia Luxe (Éditorial)",
    css: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "times",
    label: "Times New Roman (Classique)",
    css: "'Times New Roman', Times, serif",
  },
  {
    id: "trebuchet",
    label: "Trebuchet MS (Doux & Élégant)",
    css: "'Trebuchet MS', Helvetica, sans-serif",
  },
  {
    id: "verdana",
    label: "Verdana (Ultra lisible)",
    css: "Verdana, Geneva, sans-serif",
  },
  {
    id: "courier",
    label: "Courier New (Machine à écrire)",
    css: "'Courier New', Courier, monospace",
  },
];

export const EMAIL_TEMPLATE_META = [
  {
    key: "requested",
    shortLabel: "1. Demande reçue",
    description: "Envoyé automatiquement à la cliente dès qu'elle soumet une réservation.",
  },
  {
    key: "approved",
    shortLabel: "2. Validée + Acompte",
    description: "Envoyé quand vous acceptez le rendez-vous pour réclamer l'acompte de 10 €.",
  },
  {
    key: "confirmed",
    shortLabel: "3. Confirmée + Adresse",
    description: "Envoyé après paiement de l'acompte (transmet votre adresse privée).",
  },
  {
    key: "rejected",
    shortLabel: "4. Refusée",
    description: "Envoyé à la cliente lorsque vous refusez une demande de rendez-vous.",
  },
  {
    key: "expired",
    shortLabel: "5. Acompte expiré",
    description: "Envoyé si le délai de 2h pour régler l'acompte est dépassé.",
  },
  {
    key: "adminNotice",
    shortLabel: "6. Alerte Coiffeuse",
    description: "E-mail reçu sur votre boîte pro dès qu'une cliente demande un créneau.",
  },
];

export const EMAIL_STYLE_PRESETS = [
  {
    id: "hauteCouture",
    label: "Classique Blanc & Brun",
    description: "Carte blanche raffinée sur fond crème doux, cadres sobres.",
    design: {
      outerBgColor: "#F6F5F3",
      cardBgColor: "#FFFFFF",
      cardBorderEnabled: true,
      cardBorderColor: "#ECE7E1",
      cardBorderWidth: 1,
      cardBorderRadius: 16,
      cardShadow: false,
      textColor: "#1A1A1A",
      mutedTextColor: "#666666",
      accentColor: "#8C7B70",
      boxBgColor: "#FAF8F5",
      boxBorderEnabled: true,
      boxBorderColor: "#ECE7E1",
      boxBorderRadius: 12,
      buttonBgColor: "#1A1A1A",
      buttonTextColor: "#FFFFFF",
      buttonBorderRadius: 50,
      footerBgColor: "#FAF8F5",
      footerTextColor: "#777777",
      footerBorderEnabled: true,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      headingFontFamily: "Georgia, 'Times New Roman', serif",
    },
    applyBoxMode: null,
  },
  {
    id: "sansCadres",
    label: "Sans cadres (Lettre pure)",
    description: "Style lettre ouverte type Google Docs : supprime la bordure de carte et tous les encadrés.",
    design: {
      outerBgColor: "#FFFFFF",
      cardBgColor: "#FFFFFF",
      cardBorderEnabled: false,
      cardBorderColor: "#FFFFFF",
      cardBorderWidth: 0,
      cardBorderRadius: 0,
      cardShadow: false,
      textColor: "#1A1A1A",
      mutedTextColor: "#555555",
      accentColor: "#8C7B70",
      boxBgColor: "transparent",
      boxBorderEnabled: false,
      boxBorderColor: "transparent",
      boxBorderRadius: 0,
      buttonBgColor: "#2C1D14",
      buttonTextColor: "#FAF7F2",
      buttonBorderRadius: 8,
      footerBgColor: "#FFFFFF",
      footerTextColor: "#777777",
      footerBorderEnabled: true,
      fontFamily: "Georgia, 'Times New Roman', serif",
      headingFontFamily: "Georgia, 'Times New Roman', serif",
    },
    applyBoxMode: false,
  },
  {
    id: "champagneOr",
    label: "Champagne & Doré Doux",
    description: "Teintes chaleureuses beige champagne, police éditoriale chic.",
    design: {
      outerBgColor: "#F3EDE4",
      cardBgColor: "#FFFDF9",
      cardBorderEnabled: true,
      cardBorderColor: "#D8C3B3",
      cardBorderWidth: 2,
      cardBorderRadius: 20,
      cardShadow: true,
      textColor: "#2C1D14",
      mutedTextColor: "#6B5648",
      accentColor: "#9A7459",
      boxBgColor: "#F8F2EA",
      boxBorderEnabled: true,
      boxBorderColor: "#E0CFC0",
      boxBorderRadius: 14,
      buttonBgColor: "#C2A696",
      buttonTextColor: "#2C1D14",
      buttonBorderRadius: 50,
      footerBgColor: "#F5ECE2",
      footerTextColor: "#5C493C",
      footerBorderEnabled: true,
      fontFamily: "Georgia, 'Times New Roman', serif",
      headingFontFamily: "Georgia, 'Times New Roman', serif",
    },
    applyBoxMode: null,
  },
  {
    id: "noirEbene",
    label: "Ébène & Champagne",
    description: "Carte sombre haute couture façon studio privé luxe.",
    design: {
      outerBgColor: "#181310",
      cardBgColor: "#231B16",
      cardBorderEnabled: true,
      cardBorderColor: "#523F32",
      cardBorderWidth: 1,
      cardBorderRadius: 18,
      cardShadow: true,
      textColor: "#F7F3EE",
      mutedTextColor: "#D4C6BA",
      accentColor: "#D6B79E",
      boxBgColor: "#2F241D",
      boxBorderEnabled: true,
      boxBorderColor: "#4D3B30",
      boxBorderRadius: 12,
      buttonBgColor: "#D6B79E",
      buttonTextColor: "#1A120E",
      buttonBorderRadius: 50,
      footerBgColor: "#1B1511",
      footerTextColor: "#B7A89A",
      footerBorderEnabled: true,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      headingFontFamily: "Georgia, 'Times New Roman', serif",
    },
    applyBoxMode: null,
  },
];

export const DEFAULT_EMAIL_SETTINGS = {
  design: {
    outerBgColor: "#F6F5F3",
    cardBgColor: "#FFFFFF",
    cardMaxWidth: 520,
    cardBorderEnabled: true,
    cardBorderColor: "#ECE7E1",
    cardBorderWidth: 1,
    cardBorderRadius: 16,
    cardShadow: false,
    cardPaddingX: 30,
    cardPaddingY: 22,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    headingFontFamily: "Georgia, 'Times New Roman', serif",
    baseFontSize: 13,
    textColor: "#1A1A1A",
    mutedTextColor: "#666666",
    accentColor: "#8C7B70",
    boxBgColor: "#FAF8F5",
    boxBorderEnabled: true,
    boxBorderColor: "#ECE7E1",
    boxBorderRadius: 12,
    buttonBgColor: "#1A1A1A",
    buttonTextColor: "#FFFFFF",
    buttonBorderRadius: 50,
    footerBgColor: "#FAF8F5",
    footerTextColor: "#777777",
    footerBorderEnabled: true,
  },
  header: {
    visible: true,
    showLogo: true,
    logoUrl: DEFAULT_EMAIL_LOGO_URL,
    logoWidth: 130,
    logoAlign: "center",
    logoBorderRadius: 0,
    logoBgColor: "",
    logoPadding: 0,
    headerBgColor: "",
    brandTitleVisible: false,
    brandTitle: "YDM COIFFURE",
    brandTitleColor: "#1A1A1A",
    brandTitleSize: 16,
    showDivider: true,
    dividerColor: "#C2A696",
    dividerWidth: 36,
    paddingTop: 32,
    paddingBottom: 14,
  },
  footer: {
    visible: true,
    html: '<p style="margin:0 0 4px 0;text-align:center;"><strong>YDM Coiffure &bull; La Roche-sur-Yon (85000)</strong></p><p style="margin:0;text-align:center;color:#888888;">Support client en message privé sur Instagram : <a href="https://instagram.com/ydm_coiffure" style="color:#1A1A1A;font-weight:600;text-decoration:none;">@ydm_coiffure</a></p>',
  },
  templates: {
    requested: {
      subject: "Demande reçue [{reference}] • YDM Coiffure",
      preheader: "Votre demande pour {coiffure} a été transmise.",
      blocks: [
        {
          id: "req_intro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 8px 0;font-weight:normal;text-align:center;">Bonjour {prenom},</h2><p style="margin:0;font-size:13px;color:#666666;line-height:1.5;text-align:center;">Votre demande a bien été transmise à la coiffeuse. Chaque séance fait l\'objet d\'une validation manuelle.</p>',
        },
        {
          id: "req_summary",
          type: "summaryCard",
          visible: true,
          boxed: true,
          rows: [
            { id: "r1", label: "Dossier", value: "{reference}", visible: true, highlight: true },
            { id: "r2", label: "Coiffure", value: "{coiffure}", visible: true, highlight: false },
            { id: "r3", label: "Date souhaitée", value: "{date}", visible: true, highlight: false },
            { id: "r4", label: "Heure", value: "{heure}", visible: true, highlight: false },
            { id: "r5", label: "Tarif estimé", value: "{prix}", visible: true, highlight: false },
            {
              id: "r6",
              label: "Acompte obligatoire",
              value: "{acompte} (délai {delai_heures}h dès validation)",
              visible: true,
              highlight: true,
            },
            { id: "r7", label: "Solde le jour J", value: "{solde}", visible: true, highlight: false },
          ],
          showFooterNote: false,
          footerNoteHtml: "",
        },
        {
          id: "req_outro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<p style="font-size:12px;color:#888888;text-align:center;margin:0;line-height:1.5;">Dès validation par la coiffeuse, vous recevrez un lien pour verser votre acompte de 10 € sous {delai_heures}h pour bloquer définitivement votre heure.</p>',
        },
      ],
    },

    approved: {
      subject: "Rendez-vous validé : réglez votre acompte sous {delai_heures}h [{reference}]",
      preheader: "Réglez votre acompte de 10 € sous {delai_heures}h pour bloquer votre créneau.",
      blocks: [
        {
          id: "app_intro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<h2 style="font-family:Georgia,serif;font-size:21px;margin:0 0 8px 0;font-weight:normal;text-align:center;">Votre séance est validée !</h2><p style="margin:0;font-size:13px;color:#555555;line-height:1.5;text-align:center;">Bonjour {prenom}, votre créneau pour le <strong>{date} à {heure}</strong> ({coiffure}) est pré-réservé.</p>',
        },
        {
          id: "app_summary",
          type: "summaryCard",
          visible: true,
          boxed: true,
          rows: [
            { id: "a1", label: "Coiffure", value: "{coiffure}", visible: true, highlight: false },
            { id: "a2", label: "Date & heure", value: "{date} à {heure}", visible: true, highlight: false },
            {
              id: "a3",
              label: "Acompte obligatoire",
              value: "{acompte} (délai {delai_heures}h)",
              visible: true,
              highlight: true,
            },
            {
              id: "a4",
              label: "Moyens de paiement",
              value: "Revolut, PayPal ou Wero",
              visible: true,
              highlight: false,
            },
            { id: "a5", label: "Motif du virement", value: "{reference}", visible: true, highlight: true },
            { id: "a6", label: "Solde restant sur place", value: "{solde}", visible: true, highlight: false },
          ],
          showFooterNote: true,
          footerNoteHtml:
            "Délai strict de {delai_heures}h pour verser l'acompte afin de bloquer définitivement l'heure.",
        },
        {
          id: "app_btn",
          type: "button",
          visible: true,
          text: "Verser mon acompte de 10 €",
          urlToken: "{lien_paiement}",
          align: "center",
          bgColor: "",
          textColor: "",
          borderRadius: null,
          uppercase: true,
        },
        {
          id: "app_outro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<p style="font-size:12px;color:#888888;text-align:center;line-height:1.5;margin:0;">L\'adresse de votre prestation à La Roche-sur-Yon vous sera transmise dès confirmation de l\'acompte.</p>',
        },
      ],
    },

    confirmed: {
      subject: "Séance confirmée [{reference}] • YDM Coiffure",
      preheader: "Votre créneau pour {coiffure} est officiellement validé.",
      blocks: [
        {
          id: "conf_intro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<h2 style="font-family:Georgia,serif;font-size:21px;margin:0 0 8px 0;font-weight:normal;text-align:center;">Séance confirmée !</h2><p style="margin:0;font-size:13px;color:#555555;line-height:1.5;text-align:center;">Bonjour {prenom}, votre acompte de 10 € a bien été reçu. Votre rendez-vous est bloqué dans mon planning.</p>',
        },
        {
          id: "conf_summary",
          type: "summaryCard",
          visible: true,
          boxed: true,
          rows: [
            { id: "c1", label: "Dossier", value: "{reference}", visible: true, highlight: true },
            { id: "c2", label: "Coiffure", value: "{coiffure}", visible: true, highlight: false },
            { id: "c3", label: "Date & heure", value: "{date} à {heure}", visible: true, highlight: false },
            {
              id: "c4",
              label: "Acompte reçu",
              value: "{acompte} (Reçu)",
              visible: true,
              highlight: true,
              color: "#2B7A4B",
            },
            { id: "c5", label: "Solde restant sur place", value: "{solde}", visible: true, highlight: false },
          ],
          showFooterNote: false,
          footerNoteHtml: "",
        },
        {
          id: "conf_addr",
          type: "addressCard",
          visible: true,
          boxed: true,
          eyebrow: "Adresse de la prestation",
          html: '<div style="font-family:Georgia,serif;font-size:16px;font-weight:bold;margin-bottom:4px;text-align:center;">{adresse_rue}</div><div style="font-size:13px;color:#555555;margin-bottom:8px;text-align:center;">{adresse_cp_ville}</div><div style="font-size:11px;color:#777777;line-height:1.5;font-style:italic;text-align:center;">{adresse_acces}</div>',
        },
        {
          id: "conf_btn",
          type: "button",
          visible: true,
          text: "Voir mon suivi en ligne",
          urlToken: "{lien_suivi}",
          align: "center",
          bgColor: "",
          textColor: "",
          borderRadius: null,
          uppercase: true,
        },
      ],
    },

    rejected: {
      subject: "Information concernant votre demande [{reference}]",
      preheader: "Mise à jour concernant votre demande du {date}",
      blocks: [
        {
          id: "rej_intro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 6px 0;font-weight:normal;text-align:center;">Bonjour {prenom},</h2><p style="margin:0;font-size:13px;color:#666666;line-height:1.5;text-align:center;">Je ne peux malheureusement pas donner suite à votre demande pour le <strong>{date} à {heure}</strong>.</p>',
        },
        {
          id: "rej_reason",
          type: "reasonCard",
          visible: true,
          boxed: true,
          onlyIfReason: true,
          html: '<p style="margin:0;font-size:12px;color:#555555;text-align:center;"><strong>Précision :</strong> {motif}</p>',
        },
        {
          id: "rej_btn",
          type: "button",
          visible: true,
          text: "Choisir un autre créneau",
          urlToken: "{lien_reservation}",
          align: "center",
          bgColor: "",
          textColor: "",
          borderRadius: null,
          uppercase: true,
        },
      ],
    },

    expired: {
      subject: "Délai d'acompte expiré [{reference}]",
      preheader: "Votre réservation du {date} a expiré",
      blocks: [
        {
          id: "exp_intro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 6px 0;font-weight:normal;text-align:center;">Bonjour {prenom},</h2><p style="margin:0;font-size:13px;color:#666666;line-height:1.5;text-align:center;">Le délai de 2 heures pour le règlement de l\'acompte de 10 € est expiré. Le créneau du <strong>{date} à {heure}</strong> a donc été automatiquement libéré.</p>',
        },
        {
          id: "exp_note",
          type: "richtext",
          visible: true,
          boxed: true,
          html: '<p style="margin:0;font-size:12px;color:#555555;text-align:center;">Si vous souhaitez toujours réaliser votre coiffure, vous êtes invitée à sélectionner un nouveau créneau disponible.</p>',
        },
        {
          id: "exp_btn",
          type: "button",
          visible: true,
          text: "Choisir un autre créneau",
          urlToken: "{lien_reservation}",
          align: "center",
          bgColor: "",
          textColor: "",
          borderRadius: null,
          uppercase: true,
        },
      ],
    },

    adminNotice: {
      subject: "Nouvelle demande : {prenom} {nom} • {date}",
      preheader: "Demande de {prenom} pour {coiffure}",
      blocks: [
        {
          id: "adm_intro",
          type: "richtext",
          visible: true,
          boxed: false,
          html: '<h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 6px 0;font-weight:normal;text-align:center;">Demande de {prenom} {nom}</h2><p style="margin:0;font-size:13px;color:#666666;text-align:center;">Un créneau attend votre approbation dans votre espace.</p>',
        },
        {
          id: "adm_summary",
          type: "summaryCard",
          visible: true,
          boxed: true,
          rows: [
            { id: "m1", label: "Cliente", value: "{prenom} {nom}", visible: true, highlight: false },
            { id: "m2", label: "Instagram", value: "{instagram}", visible: true, highlight: true },
            { id: "m3", label: "Téléphone", value: "{telephone}", visible: true, highlight: false },
            { id: "m4", label: "Coiffure", value: "{coiffure}", visible: true, highlight: false },
            { id: "m5", label: "Date & Heure", value: "{date} à {heure}", visible: true, highlight: false },
            { id: "m6", label: "Acompte à percevoir", value: "{acompte}", visible: true, highlight: true },
            { id: "m7", label: "Remarques", value: "{notes}", visible: true, highlight: false },
          ],
          showFooterNote: false,
          footerNoteHtml: "",
        },
        {
          id: "adm_btn",
          type: "button",
          visible: true,
          text: "Voir la demande",
          urlToken: "{lien_admin}",
          align: "center",
          bgColor: "",
          textColor: "",
          borderRadius: null,
          uppercase: true,
        },
      ],
    },
  },
};

export function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FONT_SIZE_MAP = {
  1: "11px",
  2: "13px",
  3: "15px",
  4: "18px",
  5: "22px",
  6: "26px",
  7: "32px",
};

/**
 * Nettoie le HTML produit par l'éditeur Google Docs tout en gardant les styles en ligne
 * compatibles avec Gmail / Apple Mail / Outlook (couleurs, polices, alignements, cadres, images, liens).
 */
export function sanitizeEmailHtml(html) {
  if (!html || typeof html !== "string") return "";

  let cleaned = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<(iframe|object|embed|form|input|button|textarea|select|meta|link)[\s\S]*?>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|meta|link|input)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');

  // Convertit <font ...> hérités de document.execCommand en <span> à styles CSS explicites
  cleaned = cleaned.replace(/<font([^>]*)>/gi, (_, attrs) => {
    const styles = [];
    const colorMatch = attrs.match(/color\s*=\s*["']([^"']+)["']/i);
    const faceMatch = attrs.match(/face\s*=\s*["']([^"']+)["']/i);
    const sizeMatch = attrs.match(/size\s*=\s*["']?(\d+)["']?/i);

    if (colorMatch) styles.push(`color:${colorMatch[1]}`);
    if (faceMatch) styles.push(`font-family:${faceMatch[1]}`);
    if (sizeMatch) {
      const px = FONT_SIZE_MAP[Number(sizeMatch[1])] || "14px";
      styles.push(`font-size:${px}`);
    }
    return `<span${styles.length ? ` style="${styles.join(";")}"` : ""}>`;
  });
  cleaned = cleaned.replace(/<\/font>/gi, "</span>");

  return cleaned;
}

export function sanitizeUrl(rawUrl, fallback = "#") {
  if (!rawUrl || typeof rawUrl !== "string") return fallback;
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;
  if (/^javascript:/i.test(trimmed) || /^data:text\/html/i.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export function getResolvedEmailSettings(settings = {}) {
  const saved = settings?.emailSettings;
  if (!saved || typeof saved !== "object") {
    return cloneValue(DEFAULT_EMAIL_SETTINGS);
  }

  const merged = deepMergePreserveEmpty(DEFAULT_EMAIL_SETTINGS, saved);

  // Rétrocompatibilité éventuelle avec d'anciens champs plats
  if (typeof saved.logoUrl === "string" && saved.logoUrl.trim() && !saved.header?.logoUrl) {
    merged.header.logoUrl = saved.logoUrl;
  }
  if (typeof saved.showLogo === "boolean" && saved.header?.showLogo === undefined) {
    merged.header.showLogo = saved.showLogo;
  }
  if (typeof saved.brandName === "string" && saved.brandName && !saved.header?.brandTitle) {
    merged.header.brandTitle = saved.brandName;
  }

  return merged;
}

export function buildEmailVariables({
  booking = {},
  salonSettings = {},
  paymentUrl = "",
  expiryHours,
  reason = "",
  appUrl = "",
  request = null,
} = {}) {
  const baseUrl = resolvePublicAppUrl(request, appUrl);

  const firstName = booking?.customer?.firstName || "Sarah";
  const lastName = booking?.customer?.lastName || "";
  const ref = booking?.bookingReference || "YDM-2026-9482";
  const serviceName = booking?.service?.name || "Knotless Braids";
  const optionsSummary =
    Array.isArray(booking?.selectedOptions) && booking.selectedOptions.length > 0
      ? booking.selectedOptions.map((o) => o.choice).filter(Boolean).join(", ")
      : "";
  const fullCoiffure = optionsSummary
    ? `${serviceName} (${optionsSummary})`
    : serviceName;

  const totalPrice =
    booking?.totalPrice !== undefined ? `${booking.totalPrice} €` : "40 €";
  const depositAmount =
    booking?.depositAmount !== undefined ? `${booking.depositAmount} €` : "10 €";
  const remainingBalance =
    booking?.remainingBalance !== undefined
      ? `${booking.remainingBalance} €`
      : "30 €";
  const holdHours =
    expiryHours || salonSettings?.paymentHoldHours || 2;

  const address = salonSettings?.homeAddress || {
    street: "33 rue Marcellin Berthelot",
    postalCode: "85000",
    city: "La Roche-sur-Yon",
    accessNotes:
      "Merci de vous présenter à l'heure exacte, les cheveux lavés et soigneusement démêlés. En cas d'imprévu, écrivez-moi sur Instagram @ydm_coiffure.",
  };

  const trackUrl = buildBookingStatusUrl(ref, request, baseUrl);
  const targetPaymentUrl = normalizeBookingPaymentUrl(
    paymentUrl || trackUrl,
    ref,
    request,
    baseUrl
  );

  return {
    "{prenom}": firstName,
    "{nom}": lastName,
    "{reference}": ref,
    "{coiffure}": fullCoiffure,
    "{date}": booking?.date || "2026-11-18",
    "{heure}": booking?.startTime || "10:00",
    "{prix}": totalPrice,
    "{acompte}": depositAmount,
    "{solde}": remainingBalance,
    "{delai_heures}": String(holdHours),
    "{telephone}": booking?.customer?.phone || "",
    "{instagram}": booking?.customer?.instagram || "",
    "{notes}": booking?.customer?.notes || "",
    "{motif}": reason || "",
    "{adresse_rue}": address.street || "",
    "{adresse_cp_ville}": `${address.postalCode || ""} ${address.city || ""}`.trim(),
    "{adresse_acces}": address.accessNotes || "",
    "{lien_paiement}": targetPaymentUrl,
    "{lien_suivi}": trackUrl,
    "{lien_reservation}": `${baseUrl}/reserver`,
    "{lien_admin}": `${baseUrl}/admin/bookings`,
  };
}

export function buildSamplePreviewVariables(
  salonSettings = {},
  appUrl = "",
  request = null
) {
  const baseUrl = resolvePublicAppUrl(request, appUrl);
  return buildEmailVariables({
    booking: {
      bookingReference: "YDM-2026-9482",
      customer: {
        firstName: "Sarah",
        lastName: "B.",
        phone: "06 12 34 56 78",
        instagram: "@sarah_b",
        notes: "Cheveux lavés et démêlés.",
      },
      service: { name: "Knotless (Sans mèches fournies)" },
      selectedOptions: [{ choice: "Mi-long" }],
      date: "2026-11-18",
      startTime: "10:00",
      totalPrice: 40,
      depositAmount: 10,
      remainingBalance: 30,
    },
    salonSettings,
    paymentUrl: `${baseUrl}/reserver/statut/YDM-2026-9482`,
    expiryHours: salonSettings?.paymentHoldHours || 2,
    reason: "Créneau déjà réservé sur cette plage horaire.",
    appUrl: baseUrl,
    request,
  });
}

function replaceTokens(input, variables, { htmlEscape = false } = {}) {
  if (!input || typeof input !== "string") return "";
  let out = input;
  for (const [token, val] of Object.entries(variables || {})) {
    const safeVal = htmlEscape ? escapeHtml(val ?? "") : String(val ?? "");
    out = out.split(token).join(safeVal);
  }
  return out;
}

function buildBoxStyle(block, design) {
  const isBoxed = block?.boxed !== false;
  if (!isBoxed) {
    return "margin:16px 0;";
  }
  const bg = block.boxBgColor || design.boxBgColor || "#FAF8F5";
  const borderEnabled =
    block.boxBorderEnabled !== undefined
      ? block.boxBorderEnabled
      : design.boxBorderEnabled !== false;
  const borderColor = block.boxBorderColor || design.boxBorderColor || "#ECE7E1";
  const radius =
    block.boxBorderRadius !== undefined && block.boxBorderRadius !== null
      ? Number(block.boxBorderRadius)
      : Number(design.boxBorderRadius ?? 12);
  const padY = block.paddingY !== undefined ? Number(block.paddingY) : 18;
  const padX = block.paddingX !== undefined ? Number(block.paddingX) : 20;

  return [
    `background-color:${bg}`,
    borderEnabled && borderColor !== "transparent"
      ? `border:1px solid ${borderColor}`
      : "border:none",
    `border-radius:${radius}px`,
    `padding:${padY}px ${padX}px`,
    "margin:18px 0",
  ].join(";");
}

function renderBlockHtml(block, design, variables) {
  if (!block || block.visible === false) return "";

  if (block.type === "richtext") {
    const clean = sanitizeEmailHtml(block.html || "");
    const resolvedHtml = replaceTokens(clean, variables, { htmlEscape: true });
    if (!resolvedHtml.trim()) return "";
    const style = buildBoxStyle(block, design);
    return `<div style="${style}">${resolvedHtml}</div>`;
  }

  if (block.type === "summaryCard") {
    const visibleRows = (block.rows || []).filter((row) => {
      if (!row || row.visible === false) return false;
      const val = replaceTokens(row.value || "", variables, { htmlEscape: false }).trim();
      return val !== "";
    });
    if (visibleRows.length === 0) return "";

    const style = buildBoxStyle({ ...block, boxed: block.boxed !== false }, design);
    const rowsHtml = visibleRows
      .map((row) => {
        const label = escapeHtml(replaceTokens(row.label || "", variables));
        const val = escapeHtml(replaceTokens(row.value || "", variables));
        const valColor =
          row.color || (row.highlight ? design.accentColor || "#8C7B70" : design.textColor || "#1A1A1A");
        const valWeight = row.highlight ? "700" : "600";
        const labelColor = design.mutedTextColor || "#777777";
        return `<tr>
          <td style="color:${labelColor};padding:4px 8px 4px 0;vertical-align:top;">${label}</td>
          <td style="text-align:right;font-weight:${valWeight};color:${valColor};padding:4px 0 4px 8px;vertical-align:top;">${val}</td>
        </tr>`;
      })
      .join("");

    const footerNoteText = replaceTokens(block.footerNoteHtml || "", variables, {
      htmlEscape: true,
    }).trim();
    const noteHtml =
      block.showFooterNote && footerNoteText
        ? `<div style="margin-top:14px;padding-top:10px;border-top:1px dashed ${
            design.boxBorderColor && design.boxBorderColor !== "transparent"
              ? design.boxBorderColor
              : "#DDD8D3"
          };font-size:11px;color:${design.accentColor || "#8C7B70"};text-align:center;">${sanitizeEmailHtml(
            footerNoteText
          )}</div>`
        : "";

    return `
      <div style="${style}">
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:${
          Number(design.baseFontSize) || 13
        }px;line-height:1.6;color:${design.textColor || "#1A1A1A"};">
          ${rowsHtml}
        </table>
        ${noteHtml}
      </div>
    `;
  }

  if (block.type === "addressCard") {
    const clean = sanitizeEmailHtml(block.html || "");
    const resolvedHtml = replaceTokens(clean, variables, { htmlEscape: true });
    const eyebrow = escapeHtml(replaceTokens(block.eyebrow || "", variables));
    const style = buildBoxStyle(
      {
        ...block,
        boxBgColor: block.boxBgColor || design.boxBgColor || "#FAF5F0",
      },
      design
    );

    return `
      <div style="${style};text-align:center;">
        ${
          eyebrow
            ? `<div style="font-size:10px;font-weight:700;color:${
                design.accentColor || "#8C7B70"
              };text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">${eyebrow}</div>`
            : ""
        }
        ${resolvedHtml}
      </div>
    `;
  }

  if (block.type === "reasonCard") {
    const motifVal = (variables["{motif}"] || "").trim();
    if (block.onlyIfReason !== false && !motifVal) return "";
    const clean = sanitizeEmailHtml(block.html || "");
    const resolvedHtml = replaceTokens(clean, variables, { htmlEscape: true });
    const style = buildBoxStyle(block, design);
    return `<div style="${style}">${resolvedHtml}</div>`;
  }

  if (block.type === "button") {
    const text = escapeHtml(replaceTokens(block.text || "Cliquez ici", variables));
    const targetUrl = sanitizeUrl(
      replaceTokens(block.urlToken || "{lien_suivi}", variables, { htmlEscape: false }),
      "#"
    );
    const align = ["left", "center", "right"].includes(block.align)
      ? block.align
      : "center";
    const bg = block.bgColor || design.buttonBgColor || "#1A1A1A";
    const color = block.textColor || design.buttonTextColor || "#FFFFFF";
    const radius =
      block.borderRadius !== null && block.borderRadius !== undefined
        ? Number(block.borderRadius)
        : Number(design.buttonBorderRadius ?? 50);
    const transform = block.uppercase === false ? "none" : "uppercase";

    return `
      <div style="text-align:${align};margin:24px 0 14px 0;">
        <a href="${escapeHtml(
          targetUrl
        )}" style="display:inline-block;background-color:${bg};color:${color} !important;text-decoration:none;padding:14px 32px;border-radius:${radius}px;font-weight:600;font-size:12px;text-align:center;text-transform:${transform};letter-spacing:1.4px;font-family:${
      design.fontFamily
    };">${text}</a>
      </div>
    `;
  }

  if (block.type === "image") {
    const src = sanitizeUrl(replaceTokens(block.url || "", variables), "");
    if (!src) return "";
    const align = ["left", "center", "right"].includes(block.align)
      ? block.align
      : "center";
    const widthPct = Math.min(100, Math.max(20, Number(block.widthPercent || 100)));
    const radius = Number(block.borderRadius ?? 12);
    const alt = escapeHtml(block.alt || "YDM Coiffure");
    const boxWrap = block.boxed ? buildBoxStyle(block, design) : "margin:16px 0;";

    return `
      <div style="${boxWrap};text-align:${align};">
        <img src="${escapeHtml(src)}" alt="${alt}" style="display:${
      align === "center" ? "block;margin:0 auto" : "inline-block"
    };width:${widthPct}%;max-width:100%;height:auto;border-radius:${radius}px;border:0;" />
      </div>
    `;
  }

  if (block.type === "divider") {
    const color = block.color || design.cardBorderColor || "#ECE7E1";
    const thickness = Math.max(1, Math.min(8, Number(block.thickness || 1)));
    const widthPct = Math.min(100, Math.max(10, Number(block.widthPercent || 100)));
    return `
      <div style="margin:18px auto;width:${widthPct}%;height:${thickness}px;background-color:${color};line-height:1px;font-size:1px;">&nbsp;</div>
    `;
  }

  return "";
}

/**
 * Génère le HTML complet et les en-têtes (objet + preheader) d'un modèle d'e-mail,
 * partagé à l'identique entre l'aperçu en direct du studio admin et l'envoi réel via Resend.
 */
export function renderEmailFromTemplate({
  templateKey = "requested",
  emailSettings,
  variables = {},
} = {}) {
  const resolved = emailSettings?.templates
    ? deepMergePreserveEmpty(DEFAULT_EMAIL_SETTINGS, emailSettings)
    : cloneValue(DEFAULT_EMAIL_SETTINGS);

  const design = resolved.design || DEFAULT_EMAIL_SETTINGS.design;
  const header = resolved.header || DEFAULT_EMAIL_SETTINGS.header;
  const footer = resolved.footer || DEFAULT_EMAIL_SETTINGS.footer;
  const tpl =
    resolved.templates?.[templateKey] || DEFAULT_EMAIL_SETTINGS.templates.requested;

  const subject = replaceTokens(tpl.subject || "YDM Coiffure", variables, {
    htmlEscape: false,
  });
  const preheader = replaceTokens(tpl.preheader || subject, variables, {
    htmlEscape: true,
  });

  const bodyBlocksHtml = (tpl.blocks || [])
    .map((block) => renderBlockHtml(block, design, variables))
    .filter(Boolean)
    .join("\n");

  const cardBorder =
    design.cardBorderEnabled !== false
      ? `${Math.max(1, Number(design.cardBorderWidth || 1))}px solid ${
          design.cardBorderColor || "#ECE7E1"
        }`
      : "none";
  const cardShadow = design.cardShadow
    ? "box-shadow:0 12px 34px rgba(26,26,26,0.08);"
    : "";

  const headerAlign = ["left", "center", "right"].includes(header.logoAlign)
    ? header.logoAlign
    : "center";
  const logoMargin =
    headerAlign === "center"
      ? "0 auto"
      : headerAlign === "right"
      ? "0 0 0 auto"
      : "0 auto 0 0";
  const logoUrl = sanitizeUrl(header.logoUrl || DEFAULT_EMAIL_LOGO_URL, DEFAULT_EMAIL_LOGO_URL);
  const logoWidth = Math.min(280, Math.max(40, Number(header.logoWidth || 130)));

  const headerHtml =
    header.visible === false
      ? ""
      : `
        <tr>
          <td align="${headerAlign}" style="padding:${Number(
          header.paddingTop ?? 32
        )}px ${Number(design.cardPaddingX ?? 30)}px ${Number(
          header.paddingBottom ?? 14
        )}px ${Number(design.cardPaddingX ?? 30)}px;text-align:${headerAlign};${
          header.headerBgColor ? `background-color:${header.headerBgColor};` : ""
        }">
            ${
              header.showLogo !== false && logoUrl
                ? `<div style="text-align:${headerAlign};">
                    <img
                      src="${escapeHtml(logoUrl)}"
                      width="${logoWidth}"
                      alt="${escapeHtml(header.brandTitle || "YDM Coiffure")}"
                      style="display:block;width:${logoWidth}px;max-width:100%;height:auto;border:0;margin:${logoMargin};border-radius:${Number(
                    header.logoBorderRadius || 0
                  )}px;${
                    header.logoBgColor
                      ? `background-color:${header.logoBgColor};padding:${Number(
                          header.logoPadding || 10
                        )}px;`
                      : ""
                  }"
                    />
                  </div>`
                : ""
            }
            ${
              header.brandTitleVisible && header.brandTitle
                ? `<div style="margin-top:10px;font-family:${
                    design.headingFontFamily || "Georgia,serif"
                  };font-size:${Number(
                    header.brandTitleSize || 16
                  )}px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${
                    header.brandTitleColor || design.textColor || "#1A1A1A"
                  };text-align:${headerAlign};">${escapeHtml(header.brandTitle)}</div>`
                : ""
            }
            ${
              header.showDivider !== false
                ? `<div style="width:${Number(
                    header.dividerWidth || 36
                  )}px;height:1px;background-color:${
                    header.dividerColor || "#C2A696"
                  };margin:${logoMargin};margin-top:16px;"></div>`
                : ""
            }
          </td>
        </tr>
      `;

  const footerCleanHtml = replaceTokens(
    sanitizeEmailHtml(footer.html || ""),
    variables,
    { htmlEscape: true }
  );

  const footerHtml =
    footer.visible === false || !footerCleanHtml.trim()
      ? ""
      : `
        <tr>
          <td style="background-color:${
            design.footerBgColor || "#FAF8F5"
          };padding:20px ${Number(design.cardPaddingX ?? 30)}px;text-align:center;${
          design.footerBorderEnabled !== false
            ? `border-top:1px solid ${design.cardBorderColor || "#ECE7E1"};`
            : ""
        }font-size:11px;color:${
          design.footerTextColor || "#777777"
        };line-height:1.5;font-family:${design.fontFamily};">
            ${footerCleanHtml}
          </td>
        </tr>
      `;

  const html = `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; background-color: ${design.outerBgColor || "#F6F5F3"}; font-family: ${design.fontFamily}; color: ${design.textColor || "#1A1A1A"}; }
    @media screen and (max-width: 600px) {
      .email-container { margin: 8px auto !important; width: 100% !important; }
      .email-body { padding: 18px 18px 24px 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${design.outerBgColor || "#F6F5F3"};font-family:${design.fontFamily};color:${design.textColor || "#1A1A1A"};">
  <div style="display:none;font-size:1px;color:${design.outerBgColor || "#F6F5F3"};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${design.outerBgColor || "#F6F5F3"};padding:24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width:${Number(
          design.cardMaxWidth || 520
        )}px;background-color:${design.cardBgColor || "#FFFFFF"};border-radius:${Number(
    design.cardBorderRadius ?? 16
  )}px;border:${cardBorder};overflow:hidden;${cardShadow}">
          ${headerHtml}
          <tr>
            <td class="email-body" style="padding:${Number(
              design.cardPaddingY ?? 22
            )}px ${Number(design.cardPaddingX ?? 30)}px ${
    Number(design.cardPaddingY ?? 22) + 8
  }px ${Number(design.cardPaddingX ?? 30)}px;font-family:${
    design.fontFamily
  };font-size:${Number(design.baseFontSize || 13)}px;color:${
    design.textColor || "#1A1A1A"
  };line-height:1.55;">
              ${bodyBlocksHtml}
            </td>
          </tr>
          ${footerHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, preheader, html };
}
