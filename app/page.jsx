import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, MapPin } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import FAQAccordion from "@/components/FAQAccordion";
import GalleryPreview from "@/components/GalleryPreview";
import LengthGuide from "@/components/LengthGuide";
import CustomContentBlocks from "@/components/CustomContentBlocks";
import { getServices, getSettings } from "@/lib/store";
import { selectFeaturedServices } from "@/lib/adminHelpers";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "YDM Coiffure (@ydm_coiffure) | Coiffeuse Afro à La Roche-sur-Yon",
  description:
    "YDM Coiffure (@ydm_coiffure) à La Roche-sur-Yon. Salon de tresses et coiffures protectrices sur-mesure : Knotless Braids, Fulani, Boho, vanilles et nattes collées. Prise de rendez-vous simple et sans paiement en ligne sur le site, validation sous 24h.",
  alternates: {
    canonical: "https://www.ydmcoiffure.com",
  },
};

export default async function HomePage() {
  const [allServices, rawSettings] = await Promise.all([
    getServices(true),
    getSettings(),
  ]);

  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility, faqItems, galleryItems } = publicSettings;
  const home = siteContent.home;
  const hero = home.hero;
  const popularCfg = home.popularServices;
  const gallerySectionCfg = home.galleryPreviewSection;
  const faqSectionCfg = home.faqSection;
  const finalCtaCfg = home.finalCta;

  const popularServices = selectFeaturedServices(allServices, 3);
  const visibleFaqItems = Array.isArray(faqItems)
    ? faqItems.filter((item) => item && item.visible !== false)
    : [];

  const visibleReassurance = Array.isArray(hero.reassuranceItems)
    ? hero.reassuranceItems.filter((it) => it && it.visible !== false && it.text)
    : [];

  const showGallery =
    pageVisibility.galerie !== false && gallerySectionCfg.visible !== false;
  const showBooking = pageVisibility.reserver !== false;
  const showPrestations = pageVisibility.prestations !== false;

  return (
    <div className="flex flex-col">
      {/* HERO SECTION ÉPURÉE & LUXE */}
      {hero.visible !== false && (
        <section className="relative min-h-[85vh] flex items-center pt-28 pb-16 bg-creme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column */}
              <div
                className={`${
                  hero.imageVisible !== false && hero.imageUrl
                    ? "lg:col-span-7"
                    : "lg:col-span-12 max-w-3xl mx-auto"
                } space-y-7 text-center lg:text-left`}
              >
                {hero.eyebrow && (
                  <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-champagne-dark">
                    {hero.eyebrow}
                  </p>
                )}

                {hero.title && (
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brun leading-[1.12] tracking-tight">
                    {hero.title}
                  </h1>
                )}

                {hero.subtitle && (
                  <p className="text-stone-700 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                    {hero.subtitle}
                  </p>
                )}

                {/* CTAs */}
                {((showBooking && hero.primaryCtaVisible !== false && hero.primaryCtaText) ||
                  (showPrestations &&
                    hero.secondaryCtaVisible !== false &&
                    hero.secondaryCtaText)) && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    {showBooking &&
                      hero.primaryCtaVisible !== false &&
                      hero.primaryCtaText && (
                        <Link
                          href="/reserver"
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-brun hover:bg-brun-dark text-white px-8 py-4 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
                        >
                          <Calendar className="w-5 h-5 text-champagne" />
                          <span>{hero.primaryCtaText}</span>
                        </Link>
                      )}

                    {showPrestations &&
                      hero.secondaryCtaVisible !== false &&
                      hero.secondaryCtaText && (
                        <Link
                          href="/prestations"
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-beige-light text-brun border border-beige px-7 py-4 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                        >
                          <span>{hero.secondaryCtaText}</span>
                          <ArrowRight className="w-4 h-4 text-champagne-dark" />
                        </Link>
                      )}
                  </div>
                )}

                {/* Reassurance */}
                {hero.reassuranceVisible !== false &&
                  visibleReassurance.length > 0 && (
                    <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-stone-600 font-medium">
                      {visibleReassurance.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 sm:gap-6">
                          <span className="flex items-center space-x-1.5">
                            {idx === 0 && (
                              <MapPin className="w-4 h-4 text-champagne-dark shrink-0" />
                            )}
                            <span>{item.text}</span>
                          </span>
                          {idx < visibleReassurance.length - 1 && <span>•</span>}
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Right Column: Visual */}
              {hero.imageVisible !== false && hero.imageUrl && (
                <div className="lg:col-span-5 relative">
                  <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-beige bg-beige-light shadow-md">
                    <Image
                      src={hero.imageUrl}
                      alt={hero.imageAlt || "Coiffure Knotless YDM Coiffure"}
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 450px"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* POPULAR SERVICES */}
      {popularCfg.visible !== false && (
        <section className="py-20 bg-white border-t border-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(popularCfg.eyebrow || popularCfg.title || popularCfg.subtitle) && (
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                {popularCfg.eyebrow && (
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-champagne-dark">
                    {popularCfg.eyebrow}
                  </span>
                )}
                {popularCfg.title && (
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
                    {popularCfg.title}
                  </h2>
                )}
                {popularCfg.subtitle && (
                  <p className="text-stone-600 text-sm sm:text-base font-normal">
                    {popularCfg.subtitle}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularServices.map((service, index) => (
                <ServiceCard
                  key={service.id || service._id}
                  service={service}
                  priority={index === 0}
                />
              ))}
            </div>

            {showPrestations &&
              popularCfg.ctaVisible !== false &&
              popularCfg.ctaText && (
                <div className="mt-12 text-center">
                  <Link
                    href="/prestations"
                    className="inline-flex items-center space-x-2 bg-creme hover:bg-beige text-brun border border-beige px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    <span>{popularCfg.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
          </div>
        </section>
      )}

      {/* LENGTH GUIDE */}
      {home.lengthGuideSection?.visible !== false &&
        siteContent.lengthGuide?.visible !== false && (
          <section className="py-20 bg-creme border-t border-beige">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <LengthGuide content={siteContent.lengthGuide} />
            </div>
          </section>
        )}

      {/* GALLERY PREVIEW */}
      {showGallery && (
        <section className="py-20 bg-white border-t border-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(gallerySectionCfg.eyebrow || gallerySectionCfg.title) && (
              <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                {gallerySectionCfg.eyebrow && (
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-champagne-dark">
                    {gallerySectionCfg.eyebrow}
                  </span>
                )}
                {gallerySectionCfg.title && (
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
                    {gallerySectionCfg.title}
                  </h2>
                )}
              </div>
            )}
            <GalleryPreview
              initialItems={galleryItems}
              galleryTouched={Boolean(siteContent?.flags?.galleryTouched)}
              ctaVisible={gallerySectionCfg.ctaVisible !== false}
              ctaText={gallerySectionCfg.ctaText}
            />
          </div>
        </section>
      )}

      {/* CUSTOM BLOCKS SUR L'ACCUEIL */}
      {Array.isArray(home.customBlocks) &&
        home.customBlocks.some((b) => b && b.visible !== false) && (
          <section className="py-16 bg-creme border-t border-beige">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <CustomContentBlocks blocks={home.customBlocks} />
            </div>
          </section>
        )}

      {/* FAQ & INFORMATIONS PRATIQUES */}
      {faqSectionCfg.visible !== false && (
        <section className="py-20 bg-creme border-t border-beige">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {(faqSectionCfg.eyebrow ||
              faqSectionCfg.title ||
              faqSectionCfg.subtitle) && (
              <div className="text-center mb-12 space-y-2">
                {faqSectionCfg.eyebrow && (
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-champagne-dark">
                    {faqSectionCfg.eyebrow}
                  </span>
                )}
                {faqSectionCfg.title && (
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
                    {faqSectionCfg.title}
                  </h2>
                )}
                {faqSectionCfg.subtitle && (
                  <p className="text-stone-600 text-sm sm:text-base font-normal">
                    {faqSectionCfg.subtitle}
                  </p>
                )}
              </div>
            )}
            <FAQAccordion items={visibleFaqItems} />
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      {finalCtaCfg.visible !== false && (
        <section className="py-20 bg-brun-dark text-creme text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-5">
            {finalCtaCfg.title && (
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-champagne">
                {finalCtaCfg.title}
              </h2>
            )}
            {finalCtaCfg.subtitle && (
              <p className="text-stone-300 text-sm sm:text-base font-normal max-w-lg mx-auto">
                {finalCtaCfg.subtitle}
              </p>
            )}
            {showBooking &&
              finalCtaCfg.buttonVisible !== false &&
              finalCtaCfg.buttonText && (
                <div className="pt-3">
                  <Link
                    href="/reserver"
                    className="inline-flex items-center space-x-2.5 bg-champagne hover:bg-champagne-dark text-brun px-8 py-4 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <Calendar className="w-5 h-5 text-brun" />
                    <span>{finalCtaCfg.buttonText}</span>
                  </Link>
                </div>
              )}
          </div>
        </section>
      )}
    </div>
  );
}
