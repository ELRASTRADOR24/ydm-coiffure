"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, Play, Film, Image as ImageIcon } from "lucide-react";
import LightboxModal from "./LightboxModal";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import {
  resolveGalleryPosterUrl,
  canUseNextImageUrl,
  extractGalleryFilterCategories,
} from "@/lib/uploadMedia";

export default function GalleryGrid({ initialItems, galleryTouched = false }) {
  const [rawItems, setRawItems] = useState(
    Array.isArray(initialItems) && (initialItems.length > 0 || galleryTouched)
      ? initialItems
      : DEFAULT_SALON_SETTINGS.galleryItems
  );

  const [activeMedia, setActiveMedia] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("ALL");

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

  const mediaItems = rawItems.filter((item) => item && item.visible !== false);

  const categories = extractGalleryFilterCategories(mediaItems);

  const filteredMedia = mediaItems.filter((item) => {
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "VIDEO") return item.type === "video";
    if (selectedFilter === "PHOTO") return item.type !== "video";
    return (item.category || "").trim() === selectedFilter;
  });

  return (
    <div>
      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10 max-w-4xl mx-auto">
        {categories.map((cat) => {
          const isSelected = selectedFilter === cat.key;

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedFilter(cat.key)}
              className={`min-h-[44px] inline-flex items-center space-x-1.5 text-xs sm:text-sm px-3.5 py-2 rounded-xl font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-brun text-creme shadow-sm font-semibold scale-102"
                  : "bg-white text-stone-600 hover:text-brun hover:border-champagne/60 border border-beige"
              }`}
            >
              {cat.key === "VIDEO" && (
                <Film className="w-3.5 h-3.5 text-champagne-dark" />
              )}
              {cat.key === "PHOTO" && (
                <ImageIcon className="w-3.5 h-3.5 text-champagne-dark" />
              )}
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-champagne text-brun" : "bg-beige text-stone-600"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredMedia.map((item) => {
          const posterSrc = resolveGalleryPosterUrl(item);
          const videoSrc = item.videoUrl || item.video || "";
          return (
            <div
              key={item.id || item._id}
              onClick={() => setActiveMedia(item)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-beige-light border border-beige shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-900">
                {posterSrc ? (
                  canUseNextImageUrl(posterSrc) ? (
                    <Image
                      src={posterSrc}
                      alt={item.title || "Réalisation YDM Coiffure"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={posterSrc}
                      alt={item.title || "Réalisation YDM Coiffure"}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
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
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}

                {item.type === "video" && (
                  <div className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-brun/85 backdrop-blur-md flex items-center justify-center text-champagne border border-champagne/40 shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-champagne ml-0.5" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-brun-dark/90 via-brun-dark/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-transform">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-champagne block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-creme leading-snug drop-shadow-sm">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center space-x-1.5 text-xs text-stone-300 opacity-90">
                    {item.type === "video" ? (
                      <>
                        <Film className="w-3.5 h-3.5 text-champagne" />
                        <span>Regarder la vidéo</span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-3.5 h-3.5 text-champagne" />
                        <span>Agrandir la photo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeMedia && (
        <LightboxModal
          item={activeMedia}
          onClose={() => setActiveMedia(null)}
        />
      )}
    </div>
  );
}
