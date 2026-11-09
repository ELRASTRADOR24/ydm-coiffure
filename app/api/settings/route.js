import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();

    // Filtre de sécurité : ne jamais renvoyer l'adresse privée confidentielle
    const publicSettings = {
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
      pageVisibility: settings?.pageVisibility || {
        galerie: true,
        aPropos: true,
        contact: true,
        prestations: true,
      },
      footerConditions: settings?.footerConditions || [
        "Acompte : 10 € obligatoire sous 2h pour confirmer",
        "Paiements : Wero, PayPal, virement ou espèces",
        "Retard max : 20 min (1h = rdv annulé)",
        "Mèches incluses : prévenir 1 semaine à l'avance",
        "Réduction étudiante : -5 € avec mèches incluses",
      ],
      footerNoticeText:
        settings?.footerNoticeText ||
        "Coiffeuse afro à La Roche-sur-Yon. Nattes, vanilles, knotless et coiffures protectrices sur mesure.",
      homeContent: settings?.homeContent || {
        heroTitle: "L'art des tresses afro & finitions haute précision",
        heroSubtitle:
          "Knotless Braids, Fulani, Boho, nattes et créations sur-mesure à La Roche-sur-Yon. Atelier chaleureux et gestes experts pour sublimer vos cheveux.",
        studentPromoText:
          "Bénéficiez de -5 € de réduction sur toutes les coiffures avec mèches incluses (sur présentation d'un justificatif étudiant en cours de validité).",
      },
      faqItems: settings?.faqItems || [],
      galleryItems: settings?.galleryItems || [],
    };

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
