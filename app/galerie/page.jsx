import GalleryGrid from "@/components/GalleryGrid";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { getSettings } from "@/lib/store";

export const metadata = {
  title: "Galerie de Réalisations | YDM Coiffure",
  description:
    "Explorez nos réalisations de tresses et coiffures afro : Knotless Braids, Fulani Braids, Passion Twists, Box Braids et poses soignées à La Roche-sur-Yon.",
};

export default async function GaleriePage() {
  const settings = await getSettings();

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête épuré et typographique */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-champagne-dark">
            Réalisations &amp; Coiffures
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brun">
            Nos Réalisations
          </h1>
          <p className="text-brun-muted text-base font-light leading-relaxed">
            Chaque photo et vidéo reflète le soin apporté à chaque tête : netteté des traçages, légèreté de la pose et mise en valeur de votre beauté naturelle.
          </p>
        </div>

        {/* Gallery */}
        <GalleryGrid initialItems={settings?.galleryItems} />

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-white border border-beige rounded-3xl p-10 max-w-3xl mx-auto space-y-4">
          <h3 className="font-serif text-2xl font-bold text-brun">
            Un style en particulier vous fait envie ?
          </h3>
          <p className="text-sm text-brun-muted font-light max-w-md mx-auto">
            Consultez les créneaux disponibles et réservez directement votre séance en ligne.
          </p>
          <div className="pt-2">
            <Link
              href="/reserver"
              className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-8 py-3.5 rounded-full text-sm font-medium transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4 text-champagne" />
              <span>Demander un créneau</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
