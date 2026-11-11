"use client";

export const ADMIN_SECTION_GUIDE = {
  hero: {
    emoji: "🏡",
    whereLabel: "Tout en haut de l'Accueil",
    shortHint: "Premier écran vu par les visiteuses",
  },
  popularServices: {
    emoji: "⭐",
    whereLabel: "Milieu de l'Accueil (3 cartes)",
    shortHint: "Met en avant vos 3 prestations phares",
  },
  lengthGuide: {
    emoji: "📏",
    whereLabel: "Bloc Longueurs (Accueil & Tarifs)",
    shortHint: "Repère Épaules, Mi-dos, Fesses, Genoux",
  },
  galleryPreview: {
    emoji: "📸",
    whereLabel: "Aperçu Galerie sur l'Accueil",
    shortHint: "Extrait photos & vidéos avant le bas de page",
  },
  faq: {
    emoji: "❓",
    whereLabel: "Questions fréquentes (Accueil)",
    shortHint: "Réponses déroulantes avant de réserver",
  },
  finalCta: {
    emoji: "📅",
    whereLabel: "Bandeau final en bas de page",
    shortHint: "Dernier bouton vers la réservation",
  },
  navbar: {
    emoji: "🧭",
    whereLabel: "Barre du haut (toutes les pages)",
    shortHint: "Logo et liens du menu principal",
  },
  footer: {
    emoji: "📌",
    whereLabel: "Bas de page (toutes les pages)",
    shortHint: "Coordonnées, règles courtes et Instagram",
  },
  pageHeader: {
    emoji: "🏷️",
    whereLabel: "Titre tout en haut de la page",
    shortHint: "Texte d'accueil visible dès l'ouverture",
  },
  form: {
    emoji: "📝",
    whereLabel: "Formulaire envoyé par la cliente",
    shortHint: "Champs remplis avant validation",
  },
  legal: {
    emoji: "📜",
    whereLabel: "Articles & Conditions du salon",
    shortHint: "Paragraphes numérotés et règles",
  },
  maintenance: {
    emoji: "🚧",
    whereLabel: "Écran affiché si site en pause",
    shortHint: "Remplace le site public temporairement",
  },
  visibility: {
    emoji: "👁️",
    whereLabel: "Visibilité des pages dans le menu",
    shortHint: "Afficher ou masquer une page en 1 clic",
  },
  email: {
    emoji: "✉️",
    whereLabel: "Carte reçue dans la boîte mail",
    shortHint: "Logo, texte, encadré récap et bouton",
  },
  paymentAccounts: {
    emoji: "💳",
    whereLabel: "Page de suivi client (Acompte)",
    shortHint: "Coordonnées affichées après votre validation",
  },
  addressPrivate: {
    emoji: "🔒",
    whereLabel: "Débloquée après réception d'acompte",
    shortHint: "Restée confidentielle jusque-là",
  },
  availability: {
    emoji: "⏰",
    whereLabel: "Créneaux ouverts à la réservation",
    shortHint: "Ouverture, pause déjeuner et fermeture",
  },
  bookingFlow: {
    emoji: "🗓️",
    whereLabel: "Parcours d'un rendez-vous",
    shortHint: "Validation → Acompte 10 € → Confirmation",
  },
  serviceCard: {
    emoji: "✂️",
    whereLabel: "Fiche prestation (Catalogue & Réserver)",
    shortHint: "Photo, durée, tarif de base et longueurs",
  },
};

function renderZoneWireframeSvg(zone) {
  switch (zone) {
    case "hero":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="4" y="4" width="112" height="10" rx="4" fill="#F2ECE4" />
          {/* Highlighted Hero */}
          <rect x="10" y="18" width="100" height="28" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="15" y="23" width="44" height="4" rx="2" fill="#2C1D14" />
          <rect x="15" y="30" width="34" height="3" rx="1.5" fill="#7D685A" />
          <rect x="15" y="37" width="24" height="5" rx="2.5" fill="#2C1D14" />
          <rect x="68" y="22" width="36" height="20" rx="3" fill="#C2A696" />
          {/* Faint lower blocks */}
          <rect x="10" y="51" width="30" height="14" rx="2" fill="#EFECE8" />
          <rect x="45" y="51" width="30" height="14" rx="2" fill="#EFECE8" />
          <rect x="80" y="51" width="30" height="14" rx="2" fill="#EFECE8" />
        </svg>
      );

    case "popularServices":
    case "serviceCard":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="10" y="10" width="100" height="14" rx="3" fill="#EFECE8" />
          {/* 3 Highlighted Cards */}
          <rect x="10" y="29" width="30" height="34" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="13" y="32" width="24" height="14" rx="2" fill="#C2A696" />
          <rect x="13" y="49" width="18" height="3" rx="1.5" fill="#2C1D14" />
          <rect x="13" y="54" width="12" height="3" rx="1.5" fill="#9A7459" />

          <rect x="45" y="29" width="30" height="34" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="48" y="32" width="24" height="14" rx="2" fill="#C2A696" />
          <rect x="48" y="49" width="18" height="3" rx="1.5" fill="#2C1D14" />
          <rect x="48" y="54" width="12" height="3" rx="1.5" fill="#9A7459" />

          <rect x="80" y="29" width="30" height="34" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="83" y="32" width="24" height="14" rx="2" fill="#C2A696" />
          <rect x="83" y="49" width="18" height="3" rx="1.5" fill="#2C1D14" />
          <rect x="83" y="54" width="12" height="3" rx="1.5" fill="#9A7459" />
        </svg>
      );

    case "lengthGuide":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="10" y="10" width="52" height="5" rx="2" fill="#2C1D14" />
          <rect x="10" y="21" width="100" height="42" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="16" y="28" width="18" height="18" rx="3" fill="#C2A696" />
          <rect x="39" y="28" width="18" height="22" rx="3" fill="#B5937F" />
          <rect x="62" y="28" width="18" height="26" rx="3" fill="#9A7459" />
          <rect x="85" y="28" width="18" height="30" rx="3" fill="#2C1D14" />
        </svg>
      );

    case "galleryPreview":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="10" y="10" width="100" height="10" rx="2" fill="#EFECE8" />
          <rect x="10" y="25" width="22" height="38" rx="3" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="36" y="25" width="22" height="38" rx="3" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="62" y="25" width="22" height="38" rx="3" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="88" y="25" width="22" height="38" rx="3" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <circle cx="47" cy="44" r="5" fill="#2C1D14" />
          <polygon points="45.5,41.5 45.5,46.5 50,44" fill="#FFFFFF" />
        </svg>
      );

    case "faq":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="12" y="11" width="96" height="15" rx="3" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.4" />
          <rect x="17" y="17" width="46" height="3.5" rx="1.5" fill="#2C1D14" />
          <rect x="12" y="30" width="96" height="14" rx="3" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.4" />
          <rect x="17" y="35.5" width="54" height="3.5" rx="1.5" fill="#2C1D14" />
          <rect x="12" y="48" width="96" height="14" rx="3" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.4" />
          <rect x="17" y="53.5" width="40" height="3.5" rx="1.5" fill="#2C1D14" />
        </svg>
      );

    case "finalCta":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="10" y="10" width="100" height="24" rx="3" fill="#EFECE8" />
          <rect x="10" y="39" width="100" height="20" rx="4" fill="#2C1D14" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="24" y="44" width="72" height="3.5" rx="1.5" fill="#FAF7F2" />
          <rect x="42" y="50" width="36" height="5" rx="2.5" fill="#C2A696" />
          <rect x="4" y="63" width="112" height="9" rx="2" fill="#EFECE8" />
        </svg>
      );

    case "navbar":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="6" y="6" width="108" height="14" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <circle cx="15" cy="13" r="4" fill="#2C1D14" />
          <rect x="42" y="11" width="14" height="3.5" rx="1.5" fill="#2C1D14" />
          <rect x="60" y="11" width="14" height="3.5" rx="1.5" fill="#2C1D14" />
          <rect x="78" y="11" width="14" height="3.5" rx="1.5" fill="#2C1D14" />
          <rect x="96" y="10" width="14" height="6" rx="3" fill="#2C1D14" />
          <rect x="12" y="26" width="96" height="40" rx="3" fill="#F3F0EC" />
        </svg>
      );

    case "footer":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="12" y="10" width="96" height="34" rx="3" fill="#F3F0EC" />
          <rect x="6" y="48" width="108" height="22" rx="4" fill="#2C1D14" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="14" y="54" width="24" height="3.5" rx="1.5" fill="#C2A696" />
          <rect x="48" y="54" width="24" height="3.5" rx="1.5" fill="#FAF7F2" />
          <rect x="82" y="54" width="24" height="3.5" rx="1.5" fill="#FAF7F2" />
          <rect x="14" y="61" width="40" height="2.5" rx="1" fill="#A89A8E" />
        </svg>
      );

    case "pageHeader":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="12" y="12" width="96" height="24" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="42" y="16" width="36" height="3" rx="1.5" fill="#9A7459" />
          <rect x="28" y="22" width="64" height="5" rx="2" fill="#2C1D14" />
          <rect x="34" y="30" width="52" height="2.5" rx="1" fill="#7D685A" />
          <rect x="12" y="42" width="96" height="24" rx="3" fill="#F3F0EC" />
        </svg>
      );

    case "form":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="18" y="10" width="84" height="56" rx="5" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="24" y="17" width="34" height="8" rx="2" fill="#FFFFFF" stroke="#D6CFC7" />
          <rect x="62" y="17" width="34" height="8" rx="2" fill="#FFFFFF" stroke="#D6CFC7" />
          <rect x="24" y="29" width="72" height="16" rx="2" fill="#FFFFFF" stroke="#D6CFC7" />
          <rect x="38" y="50" width="44" height="9" rx="4.5" fill="#2C1D14" />
        </svg>
      );

    case "legal":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="16" y="11" width="88" height="24" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.4" />
          <rect x="22" y="16" width="38" height="4" rx="1.5" fill="#2C1D14" />
          <rect x="22" y="23" width="72" height="2.5" rx="1" fill="#7D685A" />
          <rect x="22" y="28" width="58" height="2.5" rx="1" fill="#7D685A" />
          <rect x="16" y="41" width="88" height="24" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.4" />
          <rect x="22" y="46" width="34" height="4" rx="1.5" fill="#2C1D14" />
          <rect x="22" y="53" width="68" height="2.5" rx="1" fill="#7D685A" />
        </svg>
      );

    case "maintenance":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FAF7F2" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="22" y="12" width="76" height="52" rx="6" fill="#FFFFFF" stroke="#B91C1C" strokeWidth="1.5" />
          <circle cx="60" cy="27" r="7" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
          <rect x="59" y="23" width="2" height="5" rx="1" fill="#DC2626" />
          <rect x="59" y="30" width="2" height="2" rx="1" fill="#DC2626" />
          <rect x="34" y="39" width="52" height="4.5" rx="2" fill="#2C1D14" />
          <rect x="40" y="47" width="40" height="3" rx="1.5" fill="#7D685A" />
        </svg>
      );

    case "visibility":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="12" y="13" width="96" height="13" rx="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1.2" />
          <rect x="18" y="18" width="44" height="3.5" rx="1.5" fill="#065F46" />
          <rect x="84" y="16" width="18" height="7" rx="3.5" fill="#059669" />
          <rect x="12" y="31" width="96" height="13" rx="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1.2" />
          <rect x="18" y="36" width="38" height="3.5" rx="1.5" fill="#065F46" />
          <rect x="84" y="34" width="18" height="7" rx="3.5" fill="#059669" />
          <rect x="12" y="49" width="96" height="13" rx="3" fill="#F5F5F4" stroke="#A8A29E" strokeWidth="1.2" />
          <rect x="18" y="54" width="40" height="3.5" rx="1.5" fill="#78716C" />
          <rect x="84" y="52" width="18" height="7" rx="3.5" fill="#A8A29E" />
        </svg>
      );

    case "paymentAccounts":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="10" y="14" width="30" height="30" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="45" y="14" width="30" height="30" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="80" y="14" width="30" height="30" rx="4" fill="#F5E9DD" stroke="#9A7459" strokeWidth="1.5" />
          <rect x="16" y="26" width="18" height="4" rx="1.5" fill="#2C1D14" />
          <rect x="51" y="26" width="18" height="4" rx="1.5" fill="#2C1D14" />
          <rect x="86" y="26" width="18" height="4" rx="1.5" fill="#2C1D14" />
          <rect x="22" y="52" width="76" height="11" rx="5.5" fill="#2C1D14" />
        </svg>
      );

    case "addressPrivate":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="14" y="14" width="92" height="48" rx="5" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
          <circle cx="32" cy="38" r="9" fill="#059669" />
          <path d="M32 33 A3 3 0 0 1 32 39 A3 3 0 0 1 32 33" fill="#FFFFFF" />
          <rect x="48" y="28" width="46" height="4.5" rx="2" fill="#065F46" />
          <rect x="48" y="37" width="38" height="3" rx="1.5" fill="#047857" />
          <rect x="48" y="44" width="30" height="3" rx="1.5" fill="#047857" />
        </svg>
      );

    case "availability":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="12" y="16" width="96" height="14" rx="4" fill="#FAF7F2" stroke="#D6CFC7" />
          <rect x="16" y="19" width="34" height="8" rx="2" fill="#059669" />
          <rect x="52" y="19" width="14" height="8" rx="2" fill="#FDE68A" stroke="#D97706" />
          <rect x="68" y="19" width="36" height="8" rx="2" fill="#059669" />
          <rect x="12" y="38" width="96" height="10" rx="3" fill="#F3F0EC" />
          <rect x="12" y="54" width="96" height="10" rx="3" fill="#FEE2E2" />
        </svg>
      );

    case "bookingFlow":
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#FFFFFF" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="10" y="22" width="28" height="32" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.4" />
          <rect x="46" y="22" width="28" height="32" rx="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.4" />
          <rect x="82" y="22" width="28" height="32" rx="4" fill="#D1FAE5" stroke="#059669" strokeWidth="1.4" />
          <rect x="15" y="35" width="18" height="4" rx="1.5" fill="#92400E" />
          <rect x="51" y="35" width="18" height="4" rx="1.5" fill="#1E40AF" />
          <rect x="87" y="35" width="18" height="4" rx="1.5" fill="#065F46" />
        </svg>
      );

    case "email":
    default:
      return (
        <svg viewBox="0 0 120 76" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="112" height="68" rx="6" fill="#F6F5F3" stroke="#D6CFC7" strokeWidth="1.5" />
          <rect x="26" y="8" width="68" height="60" rx="5" fill="#FFFFFF" stroke="#9A7459" strokeWidth="1.4" />
          <circle cx="60" cy="18" r="5" fill="#C2A696" />
          <rect x="34" y="27" width="52" height="4" rx="1.5" fill="#2C1D14" />
          <rect x="34" y="35" width="52" height="14" rx="3" fill="#F5E9DD" />
          <rect x="44" y="53" width="32" height="6" rx="3" fill="#2C1D14" />
        </svg>
      );
  }
}

export function AdminLocationIllustration({ zone, compact = false }) {
  const meta = ADMIN_SECTION_GUIDE[zone] || ADMIN_SECTION_GUIDE.pageHeader;

  if (compact) {
    return (
      <div className="hidden sm:flex items-center gap-2.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 shrink-0">
        <div className="w-16 h-10 shrink-0">{renderZoneWireframeSvg(zone)}</div>
        <div className="text-left leading-tight">
          <div className="text-[11px] font-bold text-brun flex items-center gap-1">
            <span>{meta.emoji}</span>
            <span>{meta.whereLabel}</span>
          </div>
          <div className="text-[11px] text-stone-500">{meta.shortHint}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center gap-4">
      <div className="w-28 h-[72px] shrink-0">{renderZoneWireframeSvg(zone)}</div>
      <div className="min-w-0 space-y-1">
        <div className="text-xs font-bold text-brun flex items-center gap-1.5">
          <span className="text-base leading-none">{meta.emoji}</span>
          <span>Où cela apparaît : {meta.whereLabel}</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">{meta.shortHint}</p>
      </div>
    </div>
  );
}

export function AdminWorkflowGuideBar() {
  const steps = [
    {
      num: "1",
      emoji: "📥",
      title: "Demande reçue",
      desc: "Vous acceptez ou refusez le créneau.",
      tone: "bg-amber-50 border-amber-200 text-amber-950",
    },
    {
      num: "2",
      emoji: "💳",
      title: "Acompte 10 €",
      desc: "Wero / Revolut / PayPal puis validation.",
      tone: "bg-blue-50 border-blue-200 text-blue-950",
    },
    {
      num: "3",
      emoji: "🔒",
      title: "Confirmé + Adresse",
      desc: "Adresse envoyée automatiquement.",
      tone: "bg-emerald-50 border-emerald-200 text-emerald-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {steps.map((step) => (
        <div
          key={step.num}
          className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${step.tone}`}
        >
          <span className="w-9 h-9 rounded-xl bg-white/90 border border-black/10 flex items-center justify-center text-lg shrink-0">
            {step.emoji}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold">
              {step.num}. {step.title}
            </div>
            <div className="text-[11px] opacity-80 leading-snug">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
