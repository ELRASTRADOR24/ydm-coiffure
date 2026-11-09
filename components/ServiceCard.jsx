"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowRight, Sparkles, Play, Film, ZoomIn } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import LightboxModal from "./LightboxModal";

// Correspondance automatique des photos vers leurs vidéos authentiques du salon
const VIDEO_MAP = {
  "/images/realisations/knotless-still.jpeg": "/videos/realisations/knotless.mp4",
  "/images/realisations/small-knotless-still.jpeg": "/videos/realisations/small-knotless.mp4",
  "/images/realisations/knotless-large-still.jpeg": "/videos/realisations/knotless-large.mp4",
  "/images/realisations/knotless-melange-couleur-still.jpeg": "/videos/realisations/knotless-melange-couleur.mp4",
  "/images/realisations/fulani-still.jpeg": "/videos/realisations/fulani.mp4",
  "/images/realisations/fulani-sup-boucle-still.jpeg": "/videos/realisations/fulani-sup-boucle.mp4",
  "/images/realisations/fulani-sup-boucle-2-still.jpeg": "/videos/realisations/fulani-sup-boucle-2.mp4",
  "/images/realisations/fulani-sans-rajout-still.jpeg": "/videos/realisations/fulani-sans-rajout.mp4",
  "/images/realisations/fulani-sur-mesure-still.jpeg": "/videos/realisations/fulani-sur-mesure.mp4",
  "/images/realisations/boho-braids-still.jpeg": "/videos/realisations/boho-braids.mp4",
  "/images/realisations/boho-braids-2-still.jpeg": "/videos/realisations/boho-braids-2.mp4",
  "/images/realisations/vanille-still.jpeg": "/videos/realisations/vanille.mp4",
  "/images/realisations/vanille-2-still.jpeg": "/videos/realisations/vanille-2.mp4",
  "/images/realisations/vanille-sans-rajout-still.jpeg": "/videos/realisations/vanille-sans-rajout.mp4",
  "/images/realisations/natte-collee-sans-rajout-still.jpeg": "/videos/realisations/natte-collee-sans-rajout.mp4",
  "/images/realisations/cornrows-2-still.jpeg": "/videos/realisations/cornrows-2.mp4",
  "/images/realisations/cornrow-rouge-still.jpeg": "/videos/realisations/cornrow-rouge.mp4",
  "/images/realisations/soft-locs-still.jpeg": "/videos/realisations/soft-locs.mp4",
  "/images/realisations/soft-locks-part-2-still.jpeg": "/videos/realisations/soft-locks-part-2.mp4",
  "/images/realisations/french-curl-medium-still.jpeg": "/videos/realisations/french-curl-medium.mp4",
};

export default function ServiceCard({ service, priority = false }) {
  const [showLightbox, setShowLightbox] = useState(false);

  const hasPhoto = Boolean(service.images && service.images.length > 0 && service.images[0]);
  const imageUrl = hasPhoto ? service.images[0] : null;

  // Détection de la vidéo associée
  const videoUrl = service.videoUrl || (imageUrl ? VIDEO_MAP[imageUrl] : null);

  const handleMediaClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLightbox(true);
  };

  return (
    <>
      <Link
        href={`/reserver?service=${service.slug}`}
        className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-beige shadow-xs hover:border-champagne hover:shadow-xl active:scale-[0.99] transition-all duration-300 flex flex-col h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-champagne text-left"
      >
        {/* Image Container - Calibré mobile (4:3) et desktop (3:4) */}
        <div
          onClick={handleMediaClick}
          className="relative aspect-[4/3] sm:aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-[#F5F1EB] via-[#EFE8DF] to-[#E5DACD] flex items-center justify-center cursor-pointer group/img"
          title={
            videoUrl
              ? "Cliquer pour regarder la vidéo de cette coiffure"
              : "Cliquer pour agrandir la photo"
          }
        >
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
              <div className="absolute inset-0 bg-gradient-to-t from-brun-dark/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            </>
          ) : (
            <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
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

          {/* Bouton Play vidéo en haut à droite */}
          {videoUrl && (
            <div
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-brun/90 backdrop-blur-md flex items-center justify-center text-champagne border border-champagne/50 shadow-md group-hover/img:scale-110 group-hover/img:bg-brun-dark transition-all duration-300"
              title="Regarder la vidéo"
            >
              <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-champagne ml-0.5" />
            </div>
          )}

          {/* Badges catégorie en haut à gauche */}
          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 flex flex-wrap gap-1.5 z-10 max-w-[calc(100%-52px)]">
            <span className="bg-white/95 backdrop-blur-md text-brun text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-xl uppercase tracking-wider border border-beige shadow-xs">
              {service.category}
            </span>
            {service.includesHair ? (
              <span className="bg-champagne text-brun-dark text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-sm border border-champagne-dark/30">
                Mèches Incluses
              </span>
            ) : service.category === "Sans mèches incluses" ? (
              <span className="bg-stone-900/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-xs">
                Mèches non fournies
              </span>
            ) : null}
          </div>

          {/* Rangée basse : Pastille média + Tarif alignés sans chevauchement */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 z-20 flex items-end justify-between gap-2 pointer-events-none">
            {hasPhoto && (
              <div className="pointer-events-auto flex items-center space-x-1.5 bg-brun/90 backdrop-blur-md text-creme text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-xl border border-champagne/40 shadow-xs group-hover/img:bg-brun group-hover/img:scale-105 transition-all">
                {videoUrl ? (
                  <>
                    <Film className="w-3 h-3 text-champagne shrink-0" />
                    <span>Voir la vidéo</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3 h-3 text-champagne shrink-0" />
                    <span>Agrandir</span>
                  </>
                )}
              </div>
            )}

            <div className="pointer-events-auto ml-auto bg-brun-dark/95 backdrop-blur-md text-creme px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border border-champagne/50 text-right shadow-sm">
              <div className="text-[9px] sm:text-[10px] text-stone-300 uppercase tracking-wider font-medium leading-none mb-0.5">
                {service.options && service.options.length > 0 ? "Dès" : "Tarif"}
              </div>
              <div className="text-sm sm:text-xl font-bold font-serif text-champagne leading-none">
                {formatPrice(service.price)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between space-y-3 sm:space-y-4">
          <div className="space-y-2.5">
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-brun group-hover:text-champagne-dark transition-colors leading-snug">
              {service.name}
            </h3>

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
            <div className="w-full flex items-center justify-center space-x-2 bg-brun group-hover:bg-brun-dark text-white py-2.5 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-xs">
              <span>Réserver cette prestation</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-champagne group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>

      {/* Modal Lightbox / Lecteur Vidéo plein écran comme dans la galerie */}
      {showLightbox && (
        <LightboxModal
          image={imageUrl}
          video={videoUrl}
          title={service.name}
          category={service.category}
          reserveUrl={`/reserver?service=${service.slug}`}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}
