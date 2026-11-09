"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Calendar, Volume2, VolumeX } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(true);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 pb-6 sm:pb-6 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      {/* Conteneur adaptatif calibré mobile & desktop (hauteur max 80dvh pour dégager entièrement les boutons et la barre basse sur mobile) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full cursor-default ${
          activeVideo
            ? isPortraitVideo
              ? "max-w-[min(90vw,380px)]"
              : "max-w-4xl"
            : "max-w-2xl sm:max-w-3xl"
        } max-h-[80dvh] sm:max-h-[85vh] bg-stone-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 transition-all duration-300 ease-out transform flex flex-col`}
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

        {/* Media Container flex-1 : la vidéo ou photo s'adapte sans jamais pousser le bas hors écran */}
        <div className="relative w-full flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
          {activeVideo ? (
            <CustomVideoPlayer
              src={activeVideo}
              poster={activeImage}
              title={activeTitle}
              autoPlay={true}
              initialPortrait={isPortraitVideo}
              onOrientationChange={(portrait) => setIsPortraitVideo(portrait)}
              isMuted={isMuted}
              onMuteChange={(m) => setIsMuted(m)}
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

        {/* Footer info & carte basse sobre, compacte & 100% visible sur mobile avec bouton son dédié */}
        <div className="p-3 sm:p-4 bg-stone-950/95 backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-3 border-t border-stone-800 shrink-0">
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

          {/* Bouton Son direct sur la carte */}
          {activeVideo && (
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shrink-0 ${
                isMuted
                  ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  : "bg-champagne/25 hover:bg-champagne/35 text-champagne border-champagne/60 shadow-xs"
              }`}
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-champagne" />
              )}
              <span className="text-[11px] font-medium hidden xs:inline sm:inline">
                {isMuted ? "Son" : "Actif"}
              </span>
            </button>
          )}

          <Link
            href={reserveUrl || "/reserver"}
            onClick={onClose}
            className="inline-flex items-center justify-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-brun shrink-0" />
            <span>Réserver</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
