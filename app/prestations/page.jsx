import { getServices } from "@/lib/store";
import ServicesList from "@/components/ServicesList";
import LengthGuide from "@/components/LengthGuide";
import { Shield, Clock, Check } from "lucide-react";

export const metadata = {
  title: "Prestations & Tarifs Officiels | YDM Coiffure",
  description:
    "Menu officiel des coiffures afro et tarifs à La Roche-sur-Yon. Knotless, Fulani, Boho Braids, vanilles et nattes sans rajouts.",
};

export default async function PrestationsPage() {
  const services = await getServices(true);

  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-champagne-dark">
            Menu Officiel • La Roche-sur-Yon
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
            Prestations & Tarifs
          </h1>
          <p className="text-brun-muted text-xs sm:text-sm font-light leading-relaxed">
            Coiffures sans rajouts, sans mèches fournies ou avec mèches incluses.
            Acompte obligatoire de 10 € sous 2 heures pour bloquer votre créneau.
          </p>
        </div>

        {/* Key rules banner */}
        <div className="bg-white rounded-2xl border border-beige p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-champagne-dark shrink-0" />
            <span className="text-brun font-medium">Acompte de 10 € (délai 2h max après validation)</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-champagne-dark shrink-0" />
            <span className="text-brun font-medium">Mèches incluses : prévenir 1 semaine à l'avance</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Check className="w-4 h-4 text-champagne-dark shrink-0" />
            <span className="text-brun font-medium">Réduction étudiante : -5 € avec mèches</span>
          </div>
        </div>

        {/* Services List with Filter */}
        <ServicesList initialServices={services} />

        {/* Length Guide */}
        <div className="pt-8">
          <LengthGuide />
        </div>
      </div>
    </div>
  );
}
