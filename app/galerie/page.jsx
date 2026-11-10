import GalleryGrid from "@/components/GalleryGrid";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import HiddenPageNotice from "@/components/HiddenPageNotice";
import CustomContentBlocks from "@/components/CustomContentBlocks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galerie de Réalisations | YDM Coiffure",
  description:
    "Explorez nos réalisations de tresses et coiffures afro : Knotless Braids, Fulani Braids, Passion Twists, Box Braids et poses soignées à La Roche-sur-Yon.",
};

export default async function GaleriePage() {
  const rawSettings = await getSettings();
  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility, galleryItems } = publicSettings;

  if (pageVisibility.galerie === false) {
    return <HiddenPageNotice notice={siteContent.global.hiddenPageNotice} />;
  }

  const gp = siteContent.galleryPage;
  const header = gp.header;
  const bottomCta = gp.bottomCta;

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        {header.visible !== false && (
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            {header.eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-champagne-dark">
                {header.eyebrow}
              </p>
            )}
            {header.title && (
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brun">
                {header.title}
              </h1>
            )}
            {header.subtitle && (
              <p className="text-brun-muted text-base font-light leading-relaxed">
                {header.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Gallery */}
        <GalleryGrid
          initialItems={galleryItems}
          galleryTouched={Boolean(siteContent?.flags?.galleryTouched)}
        />

        {/* Custom blocks */}
        <div className="mt-14">
          <CustomContentBlocks blocks={gp.customBlocks} />
        </div>

        {/* Bottom CTA */}
        {bottomCta.visible !== false && (
          <div className="mt-20 text-center bg-white border border-beige rounded-3xl p-10 max-w-3xl mx-auto space-y-4">
            {bottomCta.title && (
              <h3 className="font-serif text-2xl font-bold text-brun">
                {bottomCta.title}
              </h3>
            )}
            {bottomCta.subtitle && (
              <p className="text-sm text-brun-muted font-light max-w-md mx-auto">
                {bottomCta.subtitle}
              </p>
            )}
            {pageVisibility.reserver !== false &&
              bottomCta.buttonVisible !== false &&
              bottomCta.buttonText && (
                <div className="pt-2">
                  <Link
                    href="/reserver"
                    className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-8 py-3.5 rounded-full text-sm font-medium transition-all shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-champagne" />
                    <span>{bottomCta.buttonText}</span>
                  </Link>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
