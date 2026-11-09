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
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      {/* Conteneur adaptatif parfaitement calibré mobile & desktop (hauteur max 90dvh pour ne jamais déborder) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full cursor-default ${
          activeVideo
            ? isPortraitVideo
              ? "max-w-[min(92vw,410px)]"
              : "max-w-4xl"
            : "max-w-2xl sm:max-w-3xl"
        } max-h-[92dvh] sm:max-h-[88vh] bg-stone-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 transition-all duration-300 ease-out transform flex flex-col`}
      >
        {/* Close Button - positionné avec z-40 et dégagé de tout autre élément */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/85 text-creme hover:text-champagne hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-champagne"
          aria-label="Fermer la vue agrandie"
          title="Fermer (Échap)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Container flex-1 : la vidéo ou photo s'adapte sans jamais pousser le bouton hors écran */}
        <div className="relative w-full flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
          {activeVideo ? (
            <CustomVideoPlayer
              src={activeVideo}
              poster={activeImage}
              title={activeTitle}
              autoPlay={true}
              initialPortrait={isPortraitVideo}
              onOrientationChange={(portrait) => setIsPortraitVideo(portrait)}
              className="rounded-none w-full h-full"
            />
          ) : (
            <div className="relative w-full h-full min-h-[50vh] sm:min-h-[60vh]">
              <Image
                src={activeImage}
                alt={activeTitle || "Réalisation YDM Coiffure"}
                fill
                className="object-contain object-center"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>
          )}
        </div>

        {/* Footer info sobre, compact & 100% visible sur mobile */}
        <div className="p-3 sm:p-4 bg-stone-950/95 backdrop-blur-md flex items-center justify-between gap-3 border-t border-stone-800 shrink-0">
          <div className="min-w-0 flex-1">
            {activeCategory && (
              <span className="text-[10px] uppercase tracking-wider text-champagne font-semibold block truncate">
                {activeCategory}
              </span>
            )}
            <h4 className="font-serif text-xs sm:text-base font-bold text-creme truncate">
              {activeTitle || "Création YDM Coiffure"}
            </h4>
          </div>
          <Link
            href={reserveUrl || "/reserver"}
            onClick={onClose}
            className="inline-flex items-center justify-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-brun shrink-0" />
            <span>Réserver</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
