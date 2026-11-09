import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  Check,
  MapPin,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import FAQAccordion from "@/components/FAQAccordion";
import GalleryPreview from "@/components/GalleryPreview";
import LengthGuide from "@/components/LengthGuide";
import { getServices, getSettings } from "@/lib/store";

export const metadata = {
  title: "YDM Coiffure (@ydm_coiffure) | Coiffeuse Afro à La Roche-sur-Yon",
  description:
    "YDM Coiffure (@ydm_coiffure) à La Roche-sur-Yon. Salon de tresses et coiffures protectrices sur-mesure : Knotless Braids, Fulani, Boho, vanilles et nattes collées. Prise de rendez-vous simple et sans paiement en ligne sur le site, validation sous 24h.",
  alternates: {
    canonical: "https://ydmcoiffure.com",
  },
};

export default async function HomePage() {
  const [allServices, settings] = await Promise.all([
    getServices(true),
    getSettings(),
  ]);

  // Pick 3 popular styles for the homepage
  const popularServices = allServices.slice(0, 3);

  const defaultFaq = [
    {
      question: "Comment se déroule la réservation en ligne ?",
      answer:
        "Vous choisissez votre coiffure et vos options en quelques clics. La coiffeuse valide manuellement votre demande selon son planning. Dès validation, vous recevez un lien pour verser l'acompte de 10 € sous 2 heures pour bloquer définitivement le créneau.",
    },
    {
      question: "Mèches fournies ou mèches apportées : quelle différence ?",
      answer:
        "Pour les coiffures avec mèches incluses, la coiffeuse s'occupe de l'achat des mèches professionnelles et du déplacement (réservation demandée au moins 1 semaine à l'avance). Pour les coiffures sans mèches incluses, vous venez avec vos propres mèches.",
    },
    {
      question: "Pourquoi un délai strict de 2 heures pour l'acompte de 10 € ?",
      answer:
        "L'acompte de 10 € (non remboursable) confirme votre engagement. Passé ce délai strict de 2 heures, le créneau est automatiquement libéré et remis à disposition d'autres clientes.",
    },
    {
      question: "Comment fonctionne la réduction étudiante de -5 € ?",
      answer:
        "Une réduction de 5 € est offerte sur toutes les coiffures avec mèches incluses, sur simple présentation d'une carte étudiante en cours de validité le jour du rendez-vous.",
    },
    {
      question: "Quelles sont les consignes de préparation et d'accueil ?",
      answer:
        "Merci d'arriver les cheveux propres, lavés et soigneusement démêlés des racines aux pointes. Un seul accompagnateur est autorisé lors du rendez-vous sur préavis.",
    },
    {
      question: "Quelle est la tolérance en cas de retard ?",
      answer:
        "Une tolérance de 20 minutes est accordée sans supplément. De 20 à 30 minutes de retard : supplément de +5 €. À partir de 30 minutes : supplément de +10 €. Au-delà d'une heure de retard, le rendez-vous est annulé et l'acompte est perdu.",
    },
    {
      question: "Quels sont les moyens de paiement acceptés pour le solde ?",
      answer:
        "L'acompte de 10 € est réglé en ligne via le lien de paiement. Le solde restant dû sur place le jour de votre venue peut être réglé par Wero, PayPal, virement instantané ou en espèces.",
    },
  ];

  const faqItems =
    Array.isArray(settings?.faqItems) && settings.faqItems.length > 0
      ? settings.faqItems
      : defaultFaq;

  const heroTitle =
    settings?.homeContent?.heroTitle ||
    "Tresses nettes, finitions soignées & coiffures protectrices.";
  const heroSubtitle =
    settings?.homeContent?.heroSubtitle ||
    "Knotless, Fulani, Boho Braids, vanilles et créations sur-mesure à La Roche-sur-Yon. Traçage net, tension respectueuse et finitions impeccables.";
  const showGallery = settings?.pageVisibility?.galerie !== false;

  return (
    <div className="flex flex-col">
      {/* HERO SECTION ÉPURÉE & LUXE */}
      <section className="relative min-h-[85vh] flex items-center pt-28 pb-16 bg-creme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-champagne-dark">
                Coiffeuse Afro &bull; La Roche-sur-Yon
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brun leading-[1.12] tracking-tight">
                {heroTitle}
              </h1>

              <p className="text-stone-700 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                {heroSubtitle}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/reserver"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-brun hover:bg-brun-dark text-white px-8 py-4 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
                >
                  <Calendar className="w-5 h-5 text-champagne" />
                  <span>Prendre rendez-vous</span>
                </Link>

                <Link
                  href="/prestations"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-beige-light text-brun border border-beige px-7 py-4 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                >
                  <span>Nos Prestations</span>
                  <ArrowRight className="w-4 h-4 text-champagne-dark" />
                </Link>
              </div>

              {/* Reassurance Épurée */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-stone-600 font-medium">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-champagne-dark" />
                  <span>La Roche-sur-Yon (85000)</span>
                </span>
                <span>•</span>
                <span>Sur rendez-vous uniquement</span>
                <span>•</span>
                <span>Validation manuelle</span>
              </div>
            </div>

            {/* Right Column: Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-beige bg-beige-light shadow-md">
                <Image
                  src="/images/realisations/IMG_3401_still.jpeg"
                  alt="Coiffure Knotless YDM Coiffure"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 450px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES (Directement cliquable vers la réservation) */}
      <section className="py-20 bg-white border-t border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-champagne-dark">
              Sélection & Créations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
              Nos Coiffures Phares
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-normal">
              Touchez une coiffure pour réserver et personnaliser votre séance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularServices.map((service, index) => (
              <ServiceCard key={service.id || service._id} service={service} priority={index === 0} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/prestations"
              className="inline-flex items-center space-x-2 bg-creme hover:bg-beige text-brun border border-beige px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors shadow-2xs"
            >
              <span>Consulter toutes les prestations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* LENGTH GUIDE */}
      <section className="py-20 bg-creme border-t border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LengthGuide />
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {showGallery && (
        <section className="py-20 bg-white border-t border-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-champagne-dark">
                Portfolio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
                Réalisations Récentes
              </h2>
            </div>
            <GalleryPreview />
          </div>
        </section>
      )}

      {/* FAQ & INFORMATIONS PRATIQUES (Centralise tous les détails & règlements) */}
      <section className="py-20 bg-creme border-t border-beige">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-champagne-dark">
              Informations & FAQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
              Questions & Règlements
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-normal">
              Tout ce qu'il faut savoir avant de réserver votre créneau.
            </p>
          </div>
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-brun-dark text-creme text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-champagne">
            Prise de Rendez-vous en Ligne
          </h2>
          <p className="text-stone-300 text-sm sm:text-base font-normal max-w-lg mx-auto">
            Sélectionnez votre style et vos options. Chaque demande est validée manuellement par la coiffeuse.
          </p>
          <div className="pt-3">
            <Link
              href="/reserver"
              className="inline-flex items-center space-x-2.5 bg-champagne hover:bg-champagne-dark text-brun px-8 py-4 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Calendar className="w-5 h-5 text-brun" />
              <span>Prendre rendez-vous</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
