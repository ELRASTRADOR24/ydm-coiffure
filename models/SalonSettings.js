import mongoose from "mongoose";

const SalonSettingsSchema = new mongoose.Schema(
  {
    salonName: { type: String, default: "YDM Coiffure" },
    braiderName: { type: String, default: "Yasmine D." },
    tagline: { type: String, default: "Coiffeuse Afro à La Roche-sur-Yon" },
    bio: {
      type: String,
      default:
        "Coiffeuse afro à La Roche-sur-Yon. Prestations soignées, finitions nettes et respect du cheveu naturel.",
    },
    phone: { type: String, default: "+33 6 49 82 17 30" },
    email: { type: String, default: "contact@ydm-coiffure.fr" },
    instagram: { type: String, default: "@ydm_coiffure" },
    tiktok: { type: String, default: "@ydm_coiffure" },
    // ADRESSE CONFIDENTIELLE: Ne JAMAIS afficher sur les pages publiques!
    // Transmise UNIQUEMENT dans l'e-mail de confirmation après paiement d'acompte.
    homeAddress: {
      street: { type: String, default: "Quartier Centre-Gare" },
      postalCode: { type: String, default: "85000" },
      city: { type: String, default: "La Roche-sur-Yon" },
      accessNotes: {
        type: String,
        default:
          "Adresse exacte et consignes d'accès transmises par e-mail dès confirmation de l'acompte.",
      },
    },
    // Adresse publique générale (zone géographique sans numéro de rue)
    publicCity: {
      type: String,
      default: "La Roche-sur-Yon (adresse exacte communiquée après confirmation)",
    },
    timezone: { type: String, default: "Europe/Paris" },
    minNoticeHours: { type: Number, default: 24 },
    maxDaysInAdvance: { type: Number, default: 60 },
    paymentHoldHours: { type: Number, default: 2 }, // 2h pour régler l'acompte de 10 €
    depositAmount: { type: Number, default: 10 },
    cancellationPolicyText: {
      type: String,
      default:
        "Acompte obligatoire de 10 euros non remboursable sous 2 heures après acceptation. Modification possible jusqu'à 48 heures avant. Retards tolérés jusqu'à 20 min (+5 € entre 20-30 min, +10 € à partir de 30 min, 1h = annulé).",
    },
    depositPolicyText: {
      type: String,
      default:
        "Acompte de 10 euros exigé sous 2 heures suivant la validation de votre demande pour bloquer le créneau. Passé ce délai, le créneau est automatiquement libéré.",
    },
    preparationGuidelinesText: {
      type: String,
      default:
        "Venir les cheveux propres et démêlés. 1 seul accompagnateur autorisé sur préavis. Règlements acceptés : Wero, Revolut, PayPal, virement ou espèces.",
    },
    // Comptes de paiement directs (aucun Stripe sur le site)
    paymentAccounts: {
      revolutEnabled: { type: Boolean, default: true },
      revolutTag: { type: String, default: "@ydmcoiffure" },
      paypalEnabled: { type: Boolean, default: true },
      paypalHandle: { type: String, default: "ydmcoiffure" },
      weroEnabled: { type: Boolean, default: true },
      weroPhone: { type: String, default: "07 67 66 38 69" },
    },
    // Page Visibility Toggles
    pageVisibility: {
      galerie: { type: Boolean, default: true },
      aPropos: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      prestations: { type: Boolean, default: true },
      reglement: { type: Boolean, default: true },
      mentionsLegales: { type: Boolean, default: true },
      confidentialite: { type: Boolean, default: true },
      reserver: { type: Boolean, default: true },
    },
    // Mode Maintenance (bouton de secours)
    maintenance: {
      enabled: { type: Boolean, default: false },
      badge: { type: String, default: "Maintenance en cours" },
      title: { type: String, default: "Site temporairement en maintenance" },
      subtitle: {
        type: String,
        default:
          "Nous effectuons actuellement une mise à jour pour améliorer votre expérience.",
      },
      message: {
        type: String,
        default:
          "L'accès aux pages publiques et à la prise de rendez-vous en ligne est momentanément suspendu le temps de notre intervention. Merci pour votre patience et votre compréhension.",
      },
      estimatedReturn: {
        type: String,
        default: "Le site sera de nouveau accessible très prochainement.",
      },
      showInstagram: { type: Boolean, default: true },
      instagramHandle: { type: String, default: "@ydm_coiffure" },
      instagramLabel: {
        type: String,
        default: "Contacter YDM Coiffure sur Instagram",
      },
      ctaNote: {
        type: String,
        default:
          "Une question urgente ou un rendez-vous déjà confirmé ? Écrivez-nous directement en message privé sur Instagram.",
      },
      showAdminLink: { type: Boolean, default: true },
    },
    // Contenu complet du site (Accueil, Prestations, Galerie, À propos, Contact, Règlement, Mentions légales, Confidentialité, Header, Footer)
    siteContent: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // FAQ & Règlements personnalisables
    faqItems: {
      type: [
        {
          question: { type: String, default: "" },
          answer: { type: String, default: "" },
          visible: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],
      default: [
        {
          question: "Comment se déroule la réservation en ligne ?",
          answer:
            "Vous choisissez votre coiffure et vos options en quelques clics. La coiffeuse valide manuellement votre demande selon son planning. Dès validation, vous recevez un lien pour verser l'acompte de 10 € sous 2 heures pour bloquer définitivement le créneau.",
          order: 1,
        },
        {
          question: "Mèches fournies ou mèches apportées : quelle différence ?",
          answer:
            "Pour les coiffures avec mèches incluses, la coiffeuse s'occupe de l'achat des mèches professionnelles et du déplacement (réservation demandée au moins 1 semaine à l'avance). Pour les coiffures sans mèches incluses, vous venez avec vos propres mèches.",
          order: 2,
        },
        {
          question: "Pourquoi un délai strict de 2 heures pour l'acompte de 10 € ?",
          answer:
            "L'acompte de 10 € (non remboursable) confirme votre engagement. Passé ce délai strict de 2 heures, le créneau est automatiquement libéré et remis à disposition d'autres clientes.",
          order: 3,
        },
        {
          question: "Comment fonctionne la réduction étudiante de -5 € ?",
          answer:
            "Une réduction de 5 € est offerte sur toutes les coiffures avec mèches incluses, sur simple présentation d'une carte étudiante en cours de validité le jour du rendez-vous.",
          order: 4,
        },
        {
          question: "Quelles sont les consignes de préparation et d'accueil ?",
          answer:
            "Merci d'arriver les cheveux propres, lavés et soigneusement démêlés des racines aux pointes. Un seul accompagnateur est autorisé lors du rendez-vous sur préavis.",
          order: 5,
        },
      ],
    },
    // Footer & Textes clés personnalisables
    footerConditions: {
      type: [String],
      default: [
        "Acompte : 10 € obligatoire sous 2h pour confirmer",
        "Paiements : Wero, Revolut, PayPal, virement ou espèces",
        "Retard max : 20 min (1h = rdv annulé)",
        "Mèches incluses : prévenir 1 semaine à l'avance",
        "Réduction étudiante : -5 € avec mèches incluses",
      ],
    },
    footerNoticeText: {
      type: String,
      default:
        "Atelier privé de coiffure afro à La Roche-sur-Yon. Rendez-vous sur validation manuelle pour garantir un service sur-mesure d'exception.",
    },
    // En-tête & textes d'accueil
    homeContent: {
      heroTitle: {
        type: String,
        default: "L'art des tresses afro & finitions haute précision",
      },
      heroSubtitle: {
        type: String,
        default:
          "Knotless Braids, Fulani, Boho, nattes et créations sur-mesure à La Roche-sur-Yon. Atelier chaleureux et gestes experts pour sublimer vos cheveux.",
      },
      studentPromoText: {
        type: String,
        default:
          "Bénéficiez de -5 € de réduction sur toutes les coiffures avec mèches incluses (sur présentation d'un justificatif étudiant en cours de validité).",
      },
    },
    // Galerie & Portfolio de réalisations (ordonnables, modifiables)
    galleryItems: {
      type: [
        {
          id: { type: mongoose.Schema.Types.Mixed },
          type: { type: String, default: "photo" },
          title: { type: String },
          category: { type: String },
          image: { type: String },
          videoUrl: { type: String },
          aspect: { type: String, default: "tall" },
          visible: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    // Modèles d'e-mails & Carte Mail personnalisable (éditeur riche type Google Docs)
    emailSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, minimize: false }
);

if (mongoose.models.SalonSettings) {
  mongoose.deleteModel("SalonSettings");
}

export default mongoose.model("SalonSettings", SalonSettingsSchema);
