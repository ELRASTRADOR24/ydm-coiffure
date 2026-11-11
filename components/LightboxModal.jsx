"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Calendar } from "lucide-react";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { canUseNextImageUrl, resolveGalleryPosterUrl } from "@/lib/uploadMedia";

export default function LightboxModal({
  item,
  image,
  video,
  title,
  category,
  reserveUrl = "/reserver",
  onClose,
}) {
  const activeImage = image || item?.image;
  const videoPoster = resolveGalleryPosterUrl(item) || activeImage || undefined;
  const activeVideo = video || item?.videoUrl || item?.video;
  const activeTitle = title || item?.title;
  const activeCategory = category || item?.category;

  const [isPortraitVideo, setIsPortraitVideo] = useState(true);
  const handleOrientationChange = useCallback((portrait) => {
    setIsPortraitVideo(portrait);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!activeImage && !activeVideo) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      {/* Conteneur adaptatif calibré mobile & desktop sans aucun rognage haut/bas */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full cursor-default ${
          activeVideo
            ? isPortraitVideo
              ? "max-w-[min(92vw,390px)]"
              : "max-w-4xl"
            : "max-w-2xl sm:max-w-3xl"
        } max-h-[82dvh] sm:max-h-[86vh] bg-stone-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 transition-all duration-300 ease-out transform flex flex-col`}
      >
        {/* Close Button - unique bouton supérieur, parfaitement dégagé */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-40 w-11 h-11 rounded-full bg-black/80 text-creme hover:text-champagne hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-champagne cursor-pointer"
          aria-label="Fermer la vue agrandie"
          title="Fermer (Échap)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Container : dimensionné exactement sur le média sans débordement ni rognage */}
        <div className="relative w-full bg-black overflow-hidden">
          {activeVideo ? (
            <CustomVideoPlayer
              src={activeVideo}
              poster={videoPoster}
              title={activeTitle}
              autoPlay={true}
              hideTitleOverlay={true}
              onOrientationChange={handleOrientationChange}
              videoMaxHeightClass="max-h-[calc(82dvh-5.5rem)] sm:max-h-[calc(86vh-6rem)]"
              className="rounded-none w-full"
            />
          ) : (
            <div className="relative w-full h-[55dvh] sm:h-[65vh]">
              {canUseNextImageUrl(activeImage) ? (
                <Image
                  src={activeImage}
                  alt={activeTitle || "Réalisation YDM Coiffure"}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage}
                  alt={activeTitle || "Réalisation YDM Coiffure"}
                  className="w-full h-full object-contain object-center"
                />
              )}
            </div>
          )}
        </div>

        {/* Footer info & carte basse sobre, épurée et 100% lisible sur mobile */}
        <div className="p-3 sm:p-4 bg-stone-950/95 backdrop-blur-md flex items-center justify-between gap-3 border-t border-stone-800 shrink-0">
          <div className="min-w-0 flex-1">
            {activeCategory && (
              <span className="text-[10px] uppercase tracking-wider text-champagne font-semibold block truncate">
                {activeCategory}
              </span>
            )}
            <h4 className="font-serif text-sm sm:text-base font-bold text-creme truncate">
              {activeTitle || "Création YDM Coiffure"}
            </h4>
          </div>

          <Link
            href={reserveUrl || "/reserver"}
            onClick={onClose}
            className="min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2.5 sm:px-5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-brun shrink-0" />
            <span>Réserver</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
