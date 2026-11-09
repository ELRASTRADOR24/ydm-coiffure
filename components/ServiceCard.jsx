import Link from "next/link";
import Image from "next/image";
import { Clock, Shield, ArrowRight, Sparkles } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";

export default function ServiceCard({ service, priority = false }) {
  const hasPhoto = Boolean(service.images && service.images.length > 0 && service.images[0]);
  const imageUrl = hasPhoto ? service.images[0] : null;

  return (
    <Link
      href={`/reserver?service=${service.slug}`}
      className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-beige shadow-xs hover:border-champagne hover:shadow-xl active:scale-[0.99] transition-all duration-300 flex flex-col h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-champagne text-left"
    >
      {/* Image Container - Calibré mobile (4:3) et desktop (3:4) */}
      <div className="relative aspect-[4/3] sm:aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-[#F5F1EB] via-[#EFE8DF] to-[#E5DACD] flex items-center justify-center">
        {hasPhoto ? (
          <>
            <Image
              src={imageUrl}
              alt={service.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brun-dark/65 via-transparent to-transparent opacity-75" />
          </>
        ) : (
          <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            {/* Arrière-plan motif géométrique discret */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-champagne/40 flex items-center justify-center text-champagne-dark shadow-xs group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-champagne-dark" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brun-light">
              Illustration &amp; Guide
            </span>
            <span className="text-xs text-stone-600 max-w-[180px] leading-relaxed font-light">
              Visuel en cours de création
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 flex flex-wrap gap-1.5 sm:gap-2 z-10">
          <span className="bg-white/95 backdrop-blur-md text-brun text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider border border-beige shadow-xs">
            {service.category}
          </span>
          {service.includesHair ? (
            <span className="bg-champagne text-brun-dark text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-champagne-dark/30">
              Mèches Incluses
            </span>
          ) : service.category === "Sans mèches incluses" ? (
            <span className="bg-stone-900/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Mèches non fournies
            </span>
          ) : null}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3.5 sm:right-3.5 bg-brun-dark/95 backdrop-blur-md text-creme px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-champagne/50 text-right shadow-sm z-10">
          <div className="text-[10px] sm:text-xs text-stone-300 uppercase tracking-wider font-medium">
            {service.options && service.options.length > 0 ? "À partir de" : "Tarif"}
          </div>
          <div className="text-base sm:text-2xl font-bold font-serif text-champagne">
            {formatPrice(service.price)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between space-y-3 sm:space-y-4">
        <div className="space-y-2.5">
          <h3 className="font-serif text-lg sm:text-2xl font-bold text-brun group-hover:text-champagne-dark transition-colors leading-snug">
            {service.name}
          </h3>

          {/* Rappel Visuel Mèches Incluses vs Non fournies (Typographique et épuré, zéro icône) */}
          {service.includesHair ? (
            <div className="inline-block bg-champagne/20 text-brun-dark border border-champagne/60 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold">
              Formule Complète : Mèches fournies par Maydie
            </div>
          ) : service.category === "Sans mèches incluses" ? (
            <div className="inline-block bg-stone-100 text-stone-600 border border-stone-200 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-medium">
              Mèches non fournies : à apporter le jour du rendez-vous
            </div>
          ) : null}

          <div className="flex items-center space-x-3 text-xs sm:text-sm text-stone-700 pt-1">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-champagne-dark shrink-0" />
              <span className="font-medium">Acompte 10 € (sous 2h)</span>
            </div>
          </div>

          <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-normal">
            {service.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1 sm:pt-2">
          <div className="w-full flex items-center justify-center space-x-2 bg-brun group-hover:bg-brun-dark text-white py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-xs">
            <span>Réserver cette prestation</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-champagne group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
