"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn, ArrowRight, Play, Film, Image as ImageIcon } from "lucide-react";
import LightboxModal from "./LightboxModal";
import { resolveGalleryPosterUrl, canUseNextImageUrl } from "@/lib/uploadMedia";

const DEFAULT_PREVIEW_ITEMS = [
  {
    id: 1,
    title: "Knotless Braids Mi-Dos",
    category: "Knotless Braids",
    image: "/images/realisations/IMG_3401_still.jpeg",
  },
  {
    id: 2,
    title: "Fulani Braids & Mèches Bordeaux",
    category: "Fulani Braids",
    image: "/images/realisations/IMG_3475_still.jpeg",
  },
  {
    id: 3,
    title: "Boho Braids Ondulations Caramel",
    category: "Boho Braids",
    image: "/images/realisations/FE8CAC4A-8B5A-4FDF-A6AF-67D0E81C5151_still.jpeg",
  },
  {
    id: 4,
    title: "Nattes Plaquées Freestyle Géométrique",
    category: "Cornrows",
    image: "/images/realisations/IMG_3729.jpeg",
  },
  {
    id: 5,
    title: "Nattes Collées Homme sans Rajouts",
    category: "Cornrows Homme",
    image: "/images/realisations/IMG_4027_still.jpeg",
  },
  {
    id: 6,
    title: "Knotless Braids Longues Finitions Parfaites",
    category: "Knotless Braids",
    image: "/images/realisations/IMG_3403_still.jpeg",
  },
];

export default function GalleryPreview({
  initialItems,
  galleryTouched = false,
  ctaVisible = true,
  ctaText = "Découvrir l'ensemble des réalisations",
}) {
  const [activeItem, setActiveItem] = useState(null);
  const [rawItems, setRawItems] = useState(
    Array.isArray(initialItems) && (initialItems.length > 0 || galleryTouched)
      ? initialItems
      : DEFAULT_PREVIEW_ITEMS
  );

  useEffect(() => {
    if (!galleryTouched && (!initialItems || initialItems.length === 0)) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.settings?.galleryItems)) {
            setRawItems(data.settings.galleryItems);
          }
        })
        .catch(() => {});
    }
  }, [initialItems, galleryTouched]);

  const galleryItems = rawItems
    .filter((item) => item && item.visible !== false)
    .slice(0, 6);

  return (
    <>
      {galleryItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {galleryItems.map((item, idx) => {
            const posterSrc = resolveGalleryPosterUrl(item);
            const videoSrc = item.videoUrl || item.video || "";
            return (
              <div
                key={item.id || item._id || idx}
                onClick={() => setActiveItem(item)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-stone-900 border border-beige"
              >
                {posterSrc ? (
                  canUseNextImageUrl(posterSrc) ? (
                    <Image
                      src={posterSrc}
                      alt={item.title || "Réalisation"}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={posterSrc}
                      alt={item.title || "Réalisation"}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  )
                ) : videoSrc ? (
                  <video
                    src={`${videoSrc}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              {item.type === "video" && (
                <div className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-brun/85 backdrop-blur-md flex items-center justify-center text-champagne border border-champagne/40 shadow-md">
                  <Play className="w-4 h-4 fill-champagne ml-0.5" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brun-dark/85 via-brun-dark/25 to-transparent lg:bg-none lg:bg-brun-dark/50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5 text-creme">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider text-champagne font-semibold mb-1">
                  {item.category}
                </span>
                <h4 className="font-serif text-sm sm:text-lg font-bold leading-tight">
                  {item.title}
                </h4>
                <div className="mt-2 sm:mt-3 flex items-center space-x-1 text-xs text-champagne-light">
                  {item.type === "video" ? (
                    <>
                      <Film className="w-3.5 h-3.5" />
                      <span>Regarder la vidéo</span>
                    </>
                  ) : (
                    <>
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Agrandir</span>
                    </>
                  )}
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {ctaVisible && ctaText && (
        <div className="mt-10 text-center">
          <Link
            href="/galerie"
            className="min-h-[44px] inline-flex items-center space-x-2 text-brun hover:text-champagne-dark font-medium text-sm px-4 py-2 group"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {activeItem && (
        <LightboxModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      )}
    </>
  );
}
