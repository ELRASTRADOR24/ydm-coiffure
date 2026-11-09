"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Calendar } from "lucide-react";
import CustomVideoPlayer from "./CustomVideoPlayer";

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
  const activeVideo = video || item?.videoUrl || item?.video;
  const activeTitle = title || item?.title;
  const activeCategory = category || item?.category;

  const [isPortraitVideo, setIsPortraitVideo] = useState(true);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      {/* Conteneur adaptatif sans coupure : format téléphone étroit pour vidéo verticale, plus large pour photos ou format couché */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full cursor-default ${
          activeVideo
            ? isPortraitVideo
              ? "max-w-[min(92vw,430px)]"
              : "max-w-4xl"
            : "max-w-2xl sm:max-w-3xl"
        } bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 transition-all duration-300 ease-out transform flex flex-col`}
      >
        {/* Close Button - positionné avec z-40 et dégagé de tout autre élément */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-40 w-10 h-10 rounded-full bg-black/85 text-creme hover:text-champagne hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-champagne"
          aria-label="Fermer la vue agrandie"
          title="Fermer (Échap)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Container (100% visible, sans coupure et sans bordure blanche) */}
        <div
          className={`relative w-full ${
            activeVideo
              ? isPortraitVideo
                ? "aspect-[9/16] max-h-[78vh]"
                : "aspect-[16/9] max-h-[72vh]"
              : "aspect-[3/4] sm:aspect-[4/5] max-h-[75vh]"
          } bg-black flex items-center justify-center overflow-hidden`}
        >
          {activeVideo ? (
            <CustomVideoPlayer
              src={activeVideo}
              poster={activeImage}
              title={activeTitle}
              autoPlay={true}
              initialPortrait={isPortraitVideo}
              onOrientationChange={(portrait) => setIsPortraitVideo(portrait)}
              className="rounded-none"
            />
          ) : (
            <Image
              src={activeImage}
              alt={activeTitle || "Réalisation YDM Coiffure"}
              fill
              className="object-contain object-center"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          )}
        </div>

        {/* Footer info sobre & chic */}
        <div className="p-4 sm:p-5 bg-stone-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-stone-800">
          <div className="min-w-0 pr-2">
            {activeCategory && (
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-champagne font-semibold block">
                {activeCategory}
              </span>
            )}
            <h4 className="font-serif text-sm sm:text-base font-bold text-creme line-clamp-1">
              {activeTitle || "Création YDM Coiffure"}
            </h4>
          </div>
          <Link
            href={reserveUrl || "/reserver"}
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-champagne hover:bg-champagne-dark text-brun-dark px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-brun" />
            <span>Demander un créneau</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
