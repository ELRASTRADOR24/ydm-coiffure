/**
 * Configuration par défaut et fusion sécurisée de l'ensemble du contenu éditable du site (CMS).
 * Chaque texte, bloc, carte, article et page peut être modifié, masqué ou supprimé depuis l'administration.
 */

export const DEFAULT_PAGE_VISIBILITY = {
  prestations: true,
  galerie: true,
  aPropos: true,
  contact: true,
  reglement: true,
  mentionsLegales: true,
  confidentialite: true,
  reserver: true,
};

export const DEFAULT_MAINTENANCE = {
  enabled: false,
  badge: "Maintenance en cours",
  title: "Site temporairement en maintenance",
  subtitle:
    "Nous effectuons actuellement une mise à jour pour améliorer votre expérience.",
  message:
    "L'accès aux pages publiques et à la prise de rendez-vous en ligne est momentanément suspendu le temps de notre intervention. Merci pour votre patience et votre compréhension.",
  estimatedReturn: "Le site sera de nouveau accessible très prochainement.",
  showInstagram: true,
  instagramHandle: "@ydm_coiffure",
  instagramLabel: "Contacter YDM Coiffure sur Instagram",
  ctaNote:
    "Une question urgente ou un rendez-vous déjà confirmé ? Écrivez-nous directement en message privé sur Instagram.",
  showAdminLink: true,
};

export const DEFAULT_FAQ_ITEMS = [
  {
    visible: true,
    order: 1,
    question: "Comment se déroule la réservation en ligne ?",
    answer:
      "Vous choisissez votre coiffure et vos options en quelques clics. La coiffeuse valide manuellement votre demande selon son planning. Dès validation, vous recevez un lien pour verser l'acompte de 10 € sous 2 heures pour bloquer définitivement le créneau.",
  },
  {
    visible: true,
    order: 2,
    question: "Mèches fournies ou mèches apportées : quelle différence ?",
    answer:
      "Pour les coiffures avec mèches incluses, la coiffeuse s'occupe de l'achat des mèches professionnelles et du déplacement (réservation demandée au moins 1 semaine à l'avance). Pour les coiffures sans mèches incluses, vous venez avec vos propres mèches.",
  },
  {
    visible: true,
    order: 3,
    question: "Pourquoi un délai strict de 2 heures pour l'acompte de 10 € ?",
    answer:
      "L'acompte de 10 € (non remboursable) confirme votre engagement. Passé ce délai strict de 2 heures, le créneau est automatiquement libéré et remis à disposition d'autres clientes.",
  },
  {
    visible: true,
    order: 4,
    question: "Comment fonctionne la réduction étudiante de -5 € ?",
    answer:
      "Une réduction de 5 € est offerte sur toutes les coiffures avec mèches incluses, sur simple présentation d'une carte étudiante en cours de validité le jour du rendez-vous.",
  },
  {
    visible: true,
    order: 5,
    question: "Quelles sont les consignes de préparation et d'accueil ?",
    answer:
      "Merci d'arriver les cheveux propres, lavés et soigneusement démêlés des racines aux pointes. Un seul accompagnateur est autorisé lors du rendez-vous sur préavis.",
  },
  {
    visible: true,
    order: 6,
    question: "Quelle est la tolérance en cas de retard ?",
    answer:
      "Une tolérance de 20 minutes est accordée sans supplément. De 20 à 30 minutes de retard : supplément de +5 €. À partir de 30 minutes : supplément de +10 €. Au-delà d'une heure de retard, le rendez-vous est annulé et l'acompte est perdu.",
  },
  {
    visible: true,
    order: 7,
    question: "Quels sont les moyens de paiement acceptés pour le solde ?",
    answer:
      "L'acompte de 10 € est réglé en ligne via le lien de paiement. Le solde restant dû sur place le jour de votre venue peut être réglé par Wero, PayPal, virement instantané ou en espèces.",
  },
];

export const DEFAULT_FOOTER_CONDITIONS = [
  "Acompte : 10 € obligatoire sous 2h pour confirmer",
  "Paiements : Wero, PayPal, virement ou espèces",
  "Retard max : 20 min (1h = rdv annulé)",
  "Mèches incluses : prévenir 1 semaine à l'avance",
  "Réduction étudiante : -5 € avec mèches incluses",
];

export const DEFAULT_SITE_CONTENT = {
  flags: {
    faqTouched: false,
    galleryTouched: false,
    footerConditionsTouched: false,
  },
  global: {
    header: {
      visible: true,
      brandTitle: "YDM COIFFURE",
      brandSubtitle: "La Roche-sur-Yon",
      brandSubtitleVisible: true,
      ctaVisible: true,
      ctaText: "Demander un rdv",
      mobileCtaText: "Demander un rendez-vous",
      showAProposInNav: false,
      navLabels: {
        accueil: "Accueil",
        prestations: "Prestations & Tarifs",
        galerie: "Galerie",
        aPropos: "À propos",
        contact: "Conditions & Contact",
      },
    },
    footer: {
      visible: true,
      brandVisible: true,
      brandTitle: "YDM COIFFURE",
      noticeVisible: true,
      noticeText:
        "Atelier privé de coiffure afro à La Roche-sur-Yon. Rendez-vous sur validation manuelle pour garantir un service sur-mesure d'exception.",
      instagramVisible: true,
      instagramHandle: "@ydm_coiffure",
      locationVisible: true,
      locationTitle: "Localisation",
      locationCity: "La Roche-sur-Yon (85000)",
      privacyBoxVisible: true,
      privacyBoxTitle: "Adresse privée",
      privacyBoxText:
        "L'adresse exacte et les consignes d'accès sont transmises par e-mail immédiatement après validation de l'acompte.",
      conditionsVisible: true,
      conditionsTitle: "Conditions Clés",
      conditionsItems: DEFAULT_FOOTER_CONDITIONS.map((text) => ({
        text,
        visible: true,
      })),
      contactVisible: true,
      contactTitle: "Salon & Support Client",
      hoursText: "Lun - Dim (7j/7) : selon créneaux au planning",
      supportLabel: "@ydm_coiffure (Support officiel)",
      supportNote:
        "Salon privé à La Roche-sur-Yon. Adresse exacte et accès transmis exclusivement par e-mail après validation de l'acompte.",
      bottomBarVisible: true,
      copyrightText: "YDM Coiffure. La Roche-sur-Yon.",
      adminLinkVisible: true,
      linksLabels: {
        aPropos: "À propos de moi",
        mentionsLegales: "Mentions Légales",
        confidentialite: "Confidentialité",
        reglement: "Règlement Intérieur",
        admin: "Espace Pro",
      },
      creatorSignatureVisible: true,
      creatorPrefix: "Site créé et designé par",
      creatorName: "Johanson Nzoda",
      creatorUrl: "https://johansonweb.vercel.app/",
    },
    hiddenPageNotice: {
      eyebrow: "Information",
      title: "Cette page est actuellement masquée",
      message:
        "Ce contenu n'est pas affiché pour le moment. Vous pouvez revenir à l'accueil ou consulter nos créneaux disponibles.",
      buttonText: "Retour à l'accueil",
    },
  },

  home: {
    hero: {
      visible: true,
      eyebrow: "Coiffeuse Afro • La Roche-sur-Yon",
      title: "L'art des tresses afro & finitions haute précision",
      subtitle:
        "Knotless Braids, Fulani, Boho, nattes et créations sur-mesure à La Roche-sur-Yon. Atelier chaleureux et gestes experts pour sublimer vos cheveux.",
      primaryCtaVisible: true,
      primaryCtaText: "Prendre rendez-vous",
      secondaryCtaVisible: true,
      secondaryCtaText: "Nos Prestations",
      imageVisible: true,
      imageUrl: "/images/realisations/IMG_3401_still.jpeg",
      imageAlt: "Coiffure Knotless YDM Coiffure",
      reassuranceVisible: true,
      reassuranceItems: [
        { text: "La Roche-sur-Yon (85000)", visible: true },
        { text: "Sur rendez-vous uniquement", visible: true },
        { text: "Validation manuelle", visible: true },
      ],
    },
    popularServices: {
      visible: true,
      eyebrow: "Sélection & Créations",
      title: "Nos Coiffures Phares",
      subtitle:
        "Touchez une coiffure pour réserver et personnaliser votre séance.",
      ctaVisible: true,
      ctaText: "Consulter toutes les prestations",
    },
    lengthGuideSection: {
      visible: true,
    },
    galleryPreviewSection: {
      visible: true,
      eyebrow: "Portfolio",
      title: "Réalisations Récentes",
      ctaVisible: true,
      ctaText: "Découvrir l'ensemble des réalisations",
    },
    faqSection: {
      visible: true,
      eyebrow: "Informations & FAQ",
      title: "Questions & Règlements",
      subtitle: "Tout ce qu'il faut savoir avant de réserver votre créneau.",
    },
    finalCta: {
      visible: true,
      title: "Prise de Rendez-vous en Ligne",
      subtitle:
        "Sélectionnez votre style et vos options. Chaque demande est validée manuellement par la coiffeuse.",
      buttonVisible: true,
      buttonText: "Prendre rendez-vous",
    },
    customBlocks: [],
  },

  lengthGuide: {
    visible: true,
    eyebrow: "Repères Visuels Officiels",
    title: "Guide des Longueurs",
    subtitle:
      "Pour choisir précisément votre prestation et visualiser le tombé des tresses sur votre silhouette.",
    items: [
      {
        id: "len_court",
        visible: true,
        level: "Court",
        placement: "Nuque à épaules",
        description:
          "Léger, dynamique et rapide à réaliser. Idéal pour un style protecteur pratique au quotidien.",
        tag: "Épaules / Clavicules",
        image: "/guide-longueur-court.jpg",
        progress: "25%",
        slug: "knotless-sans-meches",
      },
      {
        id: "len_milong",
        visible: true,
        level: "Mi-long",
        placement: "Milieu du dos",
        description:
          "Longueur classique et polyvalente, facile à coiffer en chignon haut, demi-queue ou queue de cheval.",
        tag: "Omoplates / Mi-dos",
        image: "/guide-longueur-mi-long.jpg",
        progress: "50%",
        slug: "knotless-avec-meches",
      },
      {
        id: "len_long",
        visible: true,
        level: "Long",
        placement: "Bas du dos",
        description:
          "Allure élancée et très élégante avec une belle fluidité de mouvement et de cascade sur la silhouette.",
        tag: "Bas du dos / Taille",
        image: "/guide-longueur-long.jpg",
        progress: "75%",
        slug: "knotless-avec-meches",
      },
      {
        id: "len_extralong",
        visible: true,
        level: "Extra-long",
        placement: "Hanches à fesses",
        description:
          "Impact visuel maximal, présence remarquable et tombé majestueux jusqu'aux hanches.",
        tag: "Hanches / Fesses",
        image: "/guide-longueur-extra-long.jpg",
        progress: "100%",
        slug: "knotless-avec-meches",
      },
    ],
  },

  servicesPage: {
    header: {
      visible: true,
      eyebrow: "Menu Officiel • La Roche-sur-Yon",
      title: "Prestations & Tarifs",
      subtitle:
        "Coiffures sans rajouts, sans mèches fournies ou avec mèches incluses. Acompte obligatoire de 10 € sous 2 heures pour bloquer votre créneau.",
    },
    keyRulesBanner: {
      visible: true,
      items: [
        {
          text: "Acompte de 10 € (délai 2h max après validation)",
          visible: true,
        },
        {
          text: "Mèches incluses : prévenir 1 semaine à l'avance",
          visible: true,
        },
        { text: "Réduction étudiante : -5 € avec mèches", visible: true },
      ],
    },
    studentPromo: {
      visible: true,
      label: "Tarif étudiante :",
      text: "Bénéficiez de -5 € de réduction sur toutes les coiffures avec mèches incluses (sur présentation d'un justificatif étudiant en cours de validité).",
      badge: "-5 € avec mèches",
    },
    lengthGuideVisible: true,
    customBlocks: [],
  },

  galleryPage: {
    header: {
      visible: true,
      eyebrow: "Réalisations & Coiffures",
      title: "Nos Réalisations",
      subtitle:
        "Chaque photo et vidéo reflète le soin apporté à chaque tête : netteté des traçages, légèreté de la pose et mise en valeur de votre beauté naturelle.",
    },
    bottomCta: {
      visible: true,
      title: "Un style en particulier vous fait envie ?",
      subtitle:
        "Consultez les créneaux disponibles et réservez directement votre séance en ligne.",
      buttonVisible: true,
      buttonText: "Demander un créneau",
    },
    customBlocks: [],
  },

  aboutPage: {
    header: {
      visible: true,
      eyebrow: "Mon parcours • La Roche-sur-Yon",
      title: "À propos de moi",
      subtitle:
        "Moi, c'est Maydie. Étudiante à La Roche-sur-Yon et passionnée par la coiffure afro.",
    },
    storyCard: {
      visible: true,
      imageVisible: true,
      imageUrl: "/images/realisations/IMG_3401_still.jpeg",
      imageAlt: "Coiffure et tresses afro YDM Coiffure à La Roche-sur-Yon",
      paragraphs: [
        {
          visible: true,
          text: "Moi, c'est Maydie. Je suis étudiante ici à La Roche-sur-Yon, et la coiffure, c'est ce qui me fait vibrer depuis toujours.",
        },
        {
          visible: true,
          text: "Je me suis lancée là-dedans tout simplement par passion pour le cheveu texturé : j'ai toujours aimé tresser, sublimer chaque personne, créer des séparations nettes et soigner chaque détail. En parallèle de mes études, coiffer sur mes temps libres me permet de vivre pleinement cette passion tout en finançant mon quotidien d'étudiante en toute indépendance.",
        },
        {
          visible: true,
          text: "Ici, vous n'êtes pas dans un grand salon impersonnel ni dans un travail à la chaîne : je vous accueille directement chez moi, en toute simplicité et en toute tranquillité. Quand vous venez, je prends le temps nécessaire pour vous : des tracés propres, des finitions impeccables, et surtout une attention constante pour préserver vos longueurs et respecter votre cuir chevelu, sans douleur ni tiraillement excessif.",
        },
      ],
      highlightBoxVisible: true,
      highlightText:
        "Comme je m'organise autour de mes cours et de mes révisions, mes créneaux sont volontairement limités pour être 100 % disponible et attentive pour chacune de mes clientes.",
      primaryCtaVisible: true,
      primaryCtaText: "Demander un créneau",
      secondaryCtaVisible: true,
      secondaryCtaText: "Voir mes prestations",
    },
    values: {
      visible: true,
      cards: [
        {
          visible: true,
          title: "Cadre privé",
          description: "Accueil calme et convivial à domicile, sur rendez-vous.",
        },
        {
          visible: true,
          title: "Tarif étudiante",
          description: "Réduction de -5 € sur présentation de votre carte.",
        },
        {
          visible: true,
          title: "Finitions nettes",
          description: "Traçage soigné et respect absolu de votre cuir chevelu.",
        },
      ],
    },
    customBlocks: [],
  },

  contactPage: {
    header: {
      visible: true,
      eyebrow: "La Roche-sur-Yon",
      title: "Contact & Informations",
      subtitle: "Consignes d'accès, horaires et règles d'accueil.",
    },
    locationCard: {
      visible: true,
      title: "Localisation",
      cityText: "La Roche-sur-Yon (85000), Vendée.",
      confidentialityVisible: true,
      confidentialityTitle: "Adresse confidentielle",
      confidentialityText:
        "Le numéro exact et les instructions d'arrivée vous sont délivrés automatiquement par e-mail après validation et versement de l'acompte de 10 €.",
    },
    coordinatesCard: {
      visible: true,
      title: "Coordonnées",
      hoursVisible: true,
      hoursTitle: "Disponibilités & Créneaux",
      hoursSchedule: "Lundi au Dimanche (7j/7) : selon planning en ligne",
      hoursNote:
        "Horaires flexibles adaptés au planning de la coiffeuse étudiante. Chaque demande est validée manuellement.",
      supportVisible: true,
      supportTitle: "Support Client & Doutes",
      instagramHandle: "@ydm_coiffure",
      supportNote:
        "Pour toute question ou information sur une prestation, contactez-nous directement en message privé sur Instagram.",
      privacyNoteVisible: true,
      privacyNoteTitle: "Confidentialité du salon :",
      privacyNoteText:
        "L'adresse exacte à La Roche-sur-Yon et les consignes d'accès sont strictement privées et vous seront transmises par e-mail officiel dès validation de votre acompte de réservation.",
    },
    rulesCard: {
      visible: true,
      title: "Règlement Intérieur & Préparation",
      ctaVisible: true,
      ctaText: "Prendre rendez-vous",
      rules: [
        {
          visible: true,
          title: "1. Acompte & Délai strict de 2 heures",
          text: "Un acompte de 10 € (non remboursable) est exigé dans les 2 heures suivant la validation de votre demande pour confirmer le créneau. Passé ce délai, le créneau est automatiquement libéré.",
        },
        {
          visible: true,
          title: "2. Retards & Tolérance",
          text: "Tolérance de 20 minutes maximum. De 20 à 30 minutes de retard : supplément de +5 €. À partir de 30 minutes : supplément de +10 €. Au-delà d'1 heure de retard : le rendez-vous est annulé et l'acompte est perdu.",
        },
        {
          visible: true,
          title: "3. Préparation le jour J",
          text: "Merci d'arriver les cheveux propres, lavés et soigneusement démêlés des racines aux pointes.",
        },
        {
          visible: true,
          title: "4. Accompagnateur",
          text: "Un seul accompagnateur est autorisé lors de votre rendez-vous, sous réserve de prévenir en amont.",
        },
        {
          visible: true,
          title: "5. Moyens de paiement acceptés",
          text: "Le solde restant sur place est accepté en Wero, PayPal, virement bancaire ou espèces.",
        },
      ],
    },
    customBlocks: [],
  },

  rulesPage: {
    header: {
      visible: true,
      eyebrow: "Règlement Officiel • YDM Coiffure (@ydm_coiffure)",
      title: "Conditions de Réservation & Règlement Intérieur",
    },
    sections: [
      {
        id: "rule_1",
        visible: true,
        title: "1. Acompte et délai strict de 2 heures",
        paragraphs: [
          "Toute demande soumise sur le site est examinée manuellement par la coiffeuse. Dès validation, un lien de paiement sécurisé est transmis à la cliente.",
          "La cliente dispose d'un délai strict de 2 heures maximum pour verser l'acompte obligatoire de 10 € (non remboursable, sauf en cas d'annulation de la part de la coiffeuse).",
          "Si l'acompte n'est pas réglé avant l'expiration de ces 2 heures, le créneau est automatiquement libéré et remis en ligne.",
        ],
        bullets: [],
      },
      {
        id: "rule_2",
        visible: true,
        title: "2. Anticipation pour les mèches incluses",
        paragraphs: [
          "Pour toute prestation avec mèches incluses (fournies par la coiffeuse, comprenant l'achat et le déplacement), il est exigé de réserver au moins 1 semaine à l'avance. Une confirmation est demandée la veille du rendez-vous.",
        ],
        bullets: [],
      },
      {
        id: "rule_3",
        visible: true,
        title: "3. Modification et annulation",
        paragraphs: [
          "Une modification de créneau est possible jusqu'à 48 heures avant le rendez-vous. En cas d'annulation par la cliente ou de non-présentation, l'acompte de 10 € reste acquis et ne pourra donner lieu à aucun remboursement.",
        ],
        bullets: [],
      },
      {
        id: "rule_4",
        visible: true,
        title: "4. Retards et tolérance",
        paragraphs: [],
        bullets: [
          "Jusqu'à 20 minutes de retard : toléré sans pénalité.",
          "De 20 à 30 minutes de retard : supplément de +5 €.",
          "À partir de 30 minutes de retard : supplément de +10 €.",
          "À partir d'1 heure de retard : le rendez-vous est automatiquement annulé et l'acompte est perdu.",
        ],
      },
      {
        id: "rule_5",
        visible: true,
        title: "5. Préparation des cheveux et accompagnateur",
        paragraphs: [
          "La cliente doit impérativement venir les cheveux propres, lavés et soigneusement démêlés des racines aux pointes.",
          "Pour préserver la tranquillité du lieu, 1 seul accompagnateur est autorisé lors de la séance, sous condition de prévenir la coiffeuse en amont.",
        ],
        bullets: [],
      },
      {
        id: "rule_6",
        visible: true,
        title: "6. Moyens de paiement acceptés",
        paragraphs: [
          "L'acompte de 10 € est réglé en ligne via la plateforme sécurisée. Le solde restant dû le jour de la prestation peut être réglé par :",
        ],
        bullets: ["Wero", "PayPal", "Virement instantané", "Espèces"],
      },
      {
        id: "rule_7",
        visible: true,
        title: "7. Offre étudiante",
        paragraphs: [
          "Une réduction de 5 € est accordée sur les coiffures avec mèches incluses, valable exclusivement sur présentation d'une carte étudiante en cours de validité le jour du rendez-vous.",
        ],
        bullets: [],
      },
    ],
    customBlocks: [],
  },

  legalPage: {
    header: {
      visible: true,
      title: "Mentions Légales",
      updatedLabel: "Dernière mise à jour : Février 2026",
    },
    sections: [
      {
        id: "legal_1",
        visible: true,
        title: "1. Éditeur de l'application et du site",
        paragraphs: [
          "Le site YDM Coiffure est édité par l'entreprise individuelle YDM Coiffure, immatriculée au Registre du Commerce et des Sociétés sous le régime de l'auto-entreprise.",
        ],
        bullets: [
          "Responsable de la publication : Yasmine D.",
          "Contact & Support : Instagram @ydm_coiffure",
          "Siège d'exercice : La Roche-sur-Yon (85000), France (adresse privée communiquée après validation de réservation)",
        ],
      },
      {
        id: "legal_2",
        visible: true,
        title: "2. Hébergement",
        paragraphs: [
          "Le site est hébergé par la société Vercel Inc., située au 340 S Lemon Ave #4133 Walnut, CA 91789, USA.",
        ],
        bullets: [],
      },
      {
        id: "legal_3",
        visible: true,
        title: "3. Propriété intellectuelle",
        paragraphs: [
          "L'ensemble des contenus graphiques, photographies, textes, identité visuelle et éléments techniques composant ce site sont la propriété exclusive de YDM Coiffure. Toute reproduction, distribution ou diffusion sans autorisation préalable écrite est strictement interdite.",
        ],
        bullets: [],
      },
    ],
    customBlocks: [],
  },

  privacyPage: {
    header: {
      visible: true,
      title: "Politique de Confidentialité & RGPD",
      subtitleLabel:
        "Conformité Règlement Général sur la Protection des Données (RGPD)",
    },
    sections: [
      {
        id: "privacy_1",
        visible: true,
        title: "1. Collecte minimale des données",
        paragraphs: [
          "Dans le cadre de la prise de rendez-vous en ligne, nous collectons exclusivement les données strictement nécessaires au bon déroulement de votre prestation :",
        ],
        bullets: [
          "Prénom et Nom",
          "Adresse e-mail (pour l'envoi des confirmations et du lien de paiement)",
          "Numéro de téléphone (pour les rappels et instructions d'arrivée)",
          "Notes éventuelles relatives à votre cuir chevelu ou texture",
        ],
        closingParagraph:
          "Nous ne créons aucun profilage publicitaire et ne revendons jamais vos informations à des tiers.",
      },
      {
        id: "privacy_2",
        visible: true,
        title: "2. Traitement des paiements",
        paragraphs: [
          "Les règlements d'acomptes sont entièrement traités par notre partenaire certifié PCI-DSS Stripe. YDM Coiffure n'a aucun accès et ne conserve aucune coordonnée bancaire (numéro de carte, cryptogramme ou date d'expiration).",
        ],
        bullets: [],
      },
      {
        id: "privacy_3",
        visible: true,
        title: "3. Durée de conservation & Vos droits",
        paragraphs: [
          "Conformément à la réglementation européenne, vous disposez d'un droit d'accès, de rectification et de suppression totale de vos données. Pour toute demande, il vous suffit de nous adresser un message privé sur notre compte Instagram officiel @ydm_coiffure.",
        ],
        bullets: [],
      },
    ],
    customBlocks: [],
  },

  bookingPage: {
    intro: {
      visible: false,
      eyebrow: "Réservation en ligne • YDM Coiffure",
      title: "Demande de Rendez-vous",
      subtitle:
        "Sélectionnez votre coiffure, personnalisez vos options puis choisissez votre créneau souhaité.",
    },
  },
};

export function cloneValue(val) {
  return JSON.parse(JSON.stringify(val));
}

function isPlainObject(val) {
  return Boolean(val) && typeof val === "object" && !Array.isArray(val);
}

/**
 * Fusionne récursivement les défauts et les données enregistrées,
 * tout en respectant strictement "", false et [] explicitement enregistrés par l'admin.
 */
export function deepMergePreserveEmpty(defaults, saved) {
  if (saved === undefined || saved === null) {
    return cloneValue(defaults);
  }
  if (Array.isArray(defaults)) {
    return Array.isArray(saved) ? cloneValue(saved) : cloneValue(defaults);
  }
  if (isPlainObject(defaults) && isPlainObject(saved)) {
    const result = {};
    const keys = new Set([...Object.keys(defaults), ...Object.keys(saved)]);
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(saved, key) && saved[key] !== undefined && saved[key] !== null) {
        if (isPlainObject(defaults[key]) && isPlainObject(saved[key])) {
          result[key] = deepMergePreserveEmpty(defaults[key], saved[key]);
        } else {
          result[key] = cloneValue(saved[key]);
        }
      } else if (Object.prototype.hasOwnProperty.call(defaults, key)) {
        result[key] = cloneValue(defaults[key]);
      }
    }
    return result;
  }
  return cloneValue(saved);
}

export function getResolvedSiteContent(settings = {}) {
  const savedSite = settings?.siteContent || {};
  const merged = deepMergePreserveEmpty(DEFAULT_SITE_CONTENT, savedSite);

  // Rétrocompatibilité avec les anciens champs enregistrés avant cette version
  const hasSavedHeroTitle =
    savedSite?.home?.hero &&
    Object.prototype.hasOwnProperty.call(savedSite.home.hero, "title");
  if (!hasSavedHeroTitle && settings?.homeContent?.heroTitle !== undefined) {
    merged.home.hero.title = settings.homeContent.heroTitle;
  }

  const hasSavedHeroSub =
    savedSite?.home?.hero &&
    Object.prototype.hasOwnProperty.call(savedSite.home.hero, "subtitle");
  if (!hasSavedHeroSub && settings?.homeContent?.heroSubtitle !== undefined) {
    merged.home.hero.subtitle = settings.homeContent.heroSubtitle;
  }

  const hasSavedPromo =
    savedSite?.servicesPage?.studentPromo &&
    Object.prototype.hasOwnProperty.call(savedSite.servicesPage.studentPromo, "text");
  if (!hasSavedPromo && settings?.homeContent?.studentPromoText !== undefined) {
    merged.servicesPage.studentPromo.text = settings.homeContent.studentPromoText;
  }

  const hasSavedFooterNotice =
    savedSite?.global?.footer &&
    Object.prototype.hasOwnProperty.call(savedSite.global.footer, "noticeText");
  if (!hasSavedFooterNotice && settings?.footerNoticeText !== undefined) {
    merged.global.footer.noticeText = settings.footerNoticeText;
  }

  const hasSavedFooterConds =
    savedSite?.global?.footer &&
    Array.isArray(savedSite.global.footer.conditionsItems);
  if (
    !hasSavedFooterConds &&
    Array.isArray(settings?.footerConditions) &&
    settings.footerConditions.length > 0
  ) {
    merged.global.footer.conditionsItems = settings.footerConditions.map((text) => ({
      text,
      visible: true,
    }));
  }

  return merged;
}

export function getResolvedPageVisibility(settings = {}) {
  return deepMergePreserveEmpty(
    DEFAULT_PAGE_VISIBILITY,
    settings?.pageVisibility || {}
  );
}

export function getResolvedMaintenance(settings = {}) {
  return deepMergePreserveEmpty(
    DEFAULT_MAINTENANCE,
    settings?.maintenance || {}
  );
}

export function getResolvedFaqItems(settings = {}) {
  const faqTouched = Boolean(settings?.siteContent?.flags?.faqTouched);
  if (Array.isArray(settings?.faqItems)) {
    if (settings.faqItems.length > 0 || faqTouched) {
      return settings.faqItems;
    }
  }
  return cloneValue(DEFAULT_FAQ_ITEMS);
}

export function buildPublicSettings(settings = {}, fallbackGalleryItems = []) {
  const resolvedSiteContent = getResolvedSiteContent(settings);
  const resolvedPageVisibility = getResolvedPageVisibility(settings);
  const resolvedMaintenance = getResolvedMaintenance(settings);
  const resolvedFaqItems = getResolvedFaqItems(settings);
  const galleryTouched = Boolean(settings?.siteContent?.flags?.galleryTouched);

  const rawGallery =
    Array.isArray(settings?.galleryItems) &&
    (settings.galleryItems.length > 0 || galleryTouched)
      ? settings.galleryItems
      : fallbackGalleryItems;

  // Filtre de sécurité : ne jamais renvoyer l'adresse privée confidentielle (homeAddress)
  return {
    salonName: settings?.salonName || "YDM Coiffure",
    braiderName: settings?.braiderName || "Yasmine D.",
    tagline: settings?.tagline || "Coiffeuse Afro à La Roche-sur-Yon",
    bio: settings?.bio || "",
    phone: settings?.phone || "+33 6 49 82 17 30",
    email: settings?.email || "contact@ydm-coiffure.fr",
    instagram: settings?.instagram || "@ydm_coiffure",
    tiktok: settings?.tiktok || "@ydm_coiffure",
    publicCity: settings?.publicCity || "La Roche-sur-Yon (85000)",
    paymentHoldHours: settings?.paymentHoldHours || 2,
    depositAmount: settings?.depositAmount || 10,
    cancellationPolicyText: settings?.cancellationPolicyText,
    depositPolicyText: settings?.depositPolicyText,
    preparationGuidelinesText: settings?.preparationGuidelinesText,
    pageVisibility: resolvedPageVisibility,
    maintenance: resolvedMaintenance,
    siteContent: resolvedSiteContent,
    footerConditions: Array.isArray(settings?.footerConditions)
      ? settings.footerConditions
      : resolvedSiteContent.global.footer.conditionsItems
          .filter((item) => item.visible !== false)
          .map((item) => item.text),
    footerNoticeText:
      resolvedSiteContent.global.footer.noticeText ??
      settings?.footerNoticeText ??
      "Coiffeuse afro à La Roche-sur-Yon. Nattes, vanilles, knotless et coiffures protectrices sur mesure.",
    homeContent: settings?.homeContent || {
      heroTitle: resolvedSiteContent.home.hero.title,
      heroSubtitle: resolvedSiteContent.home.hero.subtitle,
      studentPromoText: resolvedSiteContent.servicesPage.studentPromo.text,
    },
    faqItems: resolvedFaqItems,
    galleryItems: Array.isArray(rawGallery) ? rawGallery : [],
  };
}

