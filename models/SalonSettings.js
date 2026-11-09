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
        "Venir les cheveux propres et démêlés. 1 seul accompagnateur autorisé sur préavis. Règlements acceptés : Wero, PayPal, virement ou espèces.",
    },
    // Page Visibility Toggles
    pageVisibility: {
      galerie: { type: Boolean, default: true },
      aPropos: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      prestations: { type: Boolean, default: true },
    },
    // FAQ & Règlements personnalisables
    faqItems: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
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
        "Paiements : Wero, PayPal, virement ou espèces",
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
          order: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    // Modèles d'e-mails & Pancartes personnalisables
    emailSettings: {
      logoUrl: {
        type: String,
        default:
          "https://res.cloudinary.com/dvecpg1tz/image/upload/v1794179815/ydm-coiffure/ydm-logo-header-tight.png",
      },
      showLogo: { type: Boolean, default: true },
      brandName: { type: String, default: "YDM COIFFURE" },
      footerText: {
        type: String,
        default: "YDM Coiffure • La Roche-sur-Yon (85000)",
      },
      footerSupportText: {
        type: String,
        default: "Support client en message privé sur Instagram : @ydm_coiffure",
      },
      requestedEmail: {
        title: { type: String, default: "Demande de rendez-vous reçue" },
        greeting: { type: String, default: "Bonjour {prenom}," },
        intro: {
          type: String,
          default:
            "Votre demande a bien été transmise à la coiffeuse. Chaque séance fait l'objet d'une validation manuelle.",
        },
        notice: {
          type: String,
          default:
            "Dès validation par la coiffeuse, vous recevrez un lien pour verser votre acompte de 10 € sous 2h pour bloquer définitivement votre heure.",
        },
      },
      approvedEmail: {
        title: { type: String, default: "Votre séance est validée !" },
        intro: {
          type: String,
          default:
            "Bonjour {prenom}, votre créneau pour le {date} à {heure} ({coiffure}) est pré-réservé.",
        },
        buttonText: { type: String, default: "Verser mon acompte de 10 €" },
        delayNotice: {
          type: String,
          default:
            "Délai strict de 2h pour verser l'acompte afin de bloquer définitivement l'heure.",
        },
        footerNotice: {
          type: String,
          default:
            "L'adresse de votre prestation à La Roche-sur-Yon vous sera transmise dès confirmation de l'acompte.",
        },
      },
      confirmedEmail: {
        title: { type: String, default: "Séance confirmée !" },
        intro: {
          type: String,
          default:
            "Bonjour {prenom}, votre acompte de 10 € a bien été reçu. Votre rendez-vous est bloqué dans mon planning.",
        },
        addressTitle: { type: String, default: "Adresse de la prestation" },
        buttonText: { type: String, default: "Voir mon suivi en ligne" },
      },
      rejectedEmail: {
        title: { type: String, default: "Information concernant votre demande" },
        greeting: { type: String, default: "Bonjour {prenom}," },
        intro: {
          type: String,
          default:
            "Je ne peux malheureusement pas donner suite à votre demande pour le {date} à {heure}.",
        },
        buttonText: { type: String, default: "Choisir un autre créneau" },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.SalonSettings ||
  mongoose.model("SalonSettings", SalonSettingsSchema);
