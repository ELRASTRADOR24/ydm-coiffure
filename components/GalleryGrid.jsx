"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, Play, Film, Image as ImageIcon } from "lucide-react";
import LightboxModal from "./LightboxModal";

const DEFAULT_MEDIA_ITEMS = [
  {
    id: 1,
    type: "video",
    title: "Réel • Savoir-faire YDM Coiffure",
    category: "Démonstration & Réalisation",
    videoUrl: "/videos/reel-ydm.mp4",
    image: "/images/realisations/reel-ydm-thumb.jpg",
    aspect: "tall",
    order: 1,
  },
  {
    id: 2,
    type: "photo",
    title: "Knotless Braids • Traçage carré net & finitions",
    category: "Knotless Braids",
    image: "/images/realisations/IMG_3401_still.jpeg",
    aspect: "tall",
    order: 2,
  },
  {
    id: 3,
    type: "photo",
    title: "Knotless Braids • Vue de dos & précision des séparations",
    category: "Knotless Braids",
    image: "/images/realisations/IMG_3403_still.jpeg",
    aspect: "tall",
    order: 3,
  },
  {
    id: 4,
    type: "photo",
    title: "Fulani Braids • Mèches bordeaux & pointes ondulées",
    category: "Fulani Braids",
    image: "/images/realisations/IMG_3475_still.jpeg",
    aspect: "tall",
    order: 4,
  },
  {
    id: 5,
    type: "photo",
    title: "Nattes collées & Vanilles • Motifs géométriques croisés",
    category: "Création Géométrique",
    image: "/images/realisations/IMG_3729.jpeg",
    aspect: "tall",
    order: 5,
  },
  {
    id: 6,
    type: "photo",
    title: "Boho Braids • Ondulations caramel & longueur spectaculaire",
    category: "Boho Braids",
    image: "/images/realisations/FE8CAC4A-8B5A-4FDF-A6AF-67D0E81C5151_still.jpeg",
    aspect: "tall",
    order: 6,
  },
  {
    id: 7,
    type: "photo",
    title: "Nattes géométriques • Vue rapprochée du tracé",
    category: "Création Géométrique",
    image: "/images/realisations/IMG_3730.jpeg",
    aspect: "tall",
    order: 7,
  },
  {
    id: 8,
    type: "photo",
    title: "Nattes collées homme • Lignes ondulées sans rajouts",
    category: "Sans rajouts",
    image: "/images/realisations/IMG_4027_still.jpeg",
    aspect: "tall",
    order: 8,
  },
  {
    id: 9,
    type: "photo",
    title: "Nattes collées homme • Vue de dessus & symétrie",
    category: "Sans rajouts",
    image: "/images/realisations/IMG_4031_still.jpeg",
    aspect: "tall",
    order: 9,
  },
  {
    id: 10,
    type: "photo",
    title: "Knotless Braids • Gros plan sur les départs plats sans nœud",
    category: "Knotless Braids",
    image: "/images/realisations/IMG_3406_still.jpeg",
    aspect: "tall",
    order: 10,
  },
  {
    id: 11,
    type: "photo",
    title: "Vanilles & Nattes • Profil et mise en valeur",
    category: "Vanilles",
    image: "/images/realisations/IMG_3738_still.jpeg",
    aspect: "tall",
    order: 11,
  },
  {
    id: 12,
    type: "photo",
    title: "Soft Locs • Séparations carrées & texture naturelle fluide",
    category: "Soft Locs",
    image: "/images/realisations/soft-locs-realisation.jpg",
    aspect: "tall",
    order: 12,
  },
  {
    id: 13,
    type: "photo",
    title: "Vanilles (Twists) • Tracé net, brillance & finitions rebondies",
    category: "Vanilles",
    image: "/images/realisations/vanilles-realisation.jpg",
    aspect: "tall",
    order: 13,
  },
  {
    id: 14,
    type: "photo",
    title: "Knotless Braids Longues • Tombé fluide & baby hairs délicats",
    category: "Knotless Braids",
    image: "/images/realisations/knotless-longues-realisation.jpg",
    aspect: "tall",
    order: 14,
  },
  {
    id: 15,
    type: "photo",
    title: "Cornrows • Nattes collées droites & traçages parallèles nets",
    category: "Cornrows",
    image: "/images/realisations/cornrows-realisation.jpg",
    aspect: "tall",
    order: 15,
  },
  {
    id: 16,
    type: "photo",
    title: "Création Sur-Mesure • Motifs freestyle artistiques & bijoux dorés",
    category: "Sur-Mesure",
    image: "/images/realisations/creation-sur-mesure-realisation.jpg",
    aspect: "tall",
    order: 16,
  },
  {
    id: 17,
    type: "photo",
    title: "Fulani Braids & Boucles Wavy • Tracés précis & cascade de boucles",
    category: "Fulani Braids",
    image: "/images/realisations/fulani-boucles-realisation.jpg",
    aspect: "tall",
    order: 17,
  },
  {
    id: 18,
    type: "photo",
    title: "French Curls Medium • Tresses Knotless & finitions bouclées soyeuses",
    category: "Knotless Braids",
    image: "/images/realisations/french-curls-medium-realisation.jpg",
    aspect: "tall",
    order: 18,
  },
];

export default function GalleryGrid({ initialItems }) {
  const [filterType, setFilterType] = useState("ALL"); // ALL, PHOTO, VIDEO
  const [activeMedia, setActiveMedia] = useState(null);
  const [mediaItems, setMediaItems] = useState(
    Array.isArray(initialItems) && initialItems.length > 0
      ? initialItems
      : DEFAULT_MEDIA_ITEMS
  );

  useEffect(() => {
    if (!initialItems || initialItems.length === 0) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (
            data.success &&
            Array.isArray(data.settings?.galleryItems) &&
            data.settings.galleryItems.length > 0
          ) {
            setMediaItems(data.settings.galleryItems);
          }
        })
        .catch(() => {});
    }
  }, [initialItems]);

  const filteredMedia = mediaItems.filter((item) => {
    if (filterType === "PHOTO") return item.type === "photo";
    if (filterType === "VIDEO") return item.type === "video";
    return true;
  });

  return (
    <div>
      {/* Type Filter Tabs (Photos / Vidéos Réels) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setFilterType("ALL")}
          className={`text-xs sm:text-sm px-5 py-2 rounded-full font-semibold uppercase tracking-wider transition-all ${
            filterType === "ALL"
              ? "bg-brun text-creme shadow-xs"
              : "bg-white text-stone-600 hover:text-brun border border-beige"
          }`}
        >
          Tout voir ({mediaItems.length})
        </button>
        <button
          onClick={() => setFilterType("VIDEO")}
          className={`inline-flex items-center space-x-2 text-xs sm:text-sm px-5 py-2 rounded-full font-semibold uppercase tracking-wider transition-all ${
            filterType === "VIDEO"
              ? "bg-brun text-creme shadow-xs"
              : "bg-white text-stone-600 hover:text-brun border border-beige"
          }`}
        >
          <Film className="w-3.5 h-3.5 text-champagne-dark" />
          <span>Vidéos & Réels (1)</span>
        </button>
        <button
          onClick={() => setFilterType("PHOTO")}
          className={`inline-flex items-center space-x-2 text-xs sm:text-sm px-5 py-2 rounded-full font-semibold uppercase tracking-wider transition-all ${
            filterType === "PHOTO"
              ? "bg-brun text-creme shadow-xs"
              : "bg-white text-stone-600 hover:text-brun border border-beige"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-champagne-dark" />
          <span>Photos Réelles (16)</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredMedia.map((item) => {
          const isTall = item.aspect === "tall";

          return (
            <div
              key={item.id}
              onClick={() => setActiveMedia(item)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-beige-light border border-beige shadow-xs hover:shadow-lg transition-all duration-300"
            >
              {/* Media Container - Ratio 3/4 portrait harmonisé sans espace blanc */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-900">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Video Play Badge overlay */}
                {item.type === "video" && (
                  <div className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-brun/85 backdrop-blur-md flex items-center justify-center text-champagne border border-champagne/40 shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-champagne ml-0.5" />
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-brun-dark/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Content info on hover / bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-transform">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-champagne block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-creme leading-snug drop-shadow-sm">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center space-x-1.5 text-xs text-stone-300 opacity-90">
                    <ZoomIn className="w-3.5 h-3.5 text-champagne" />
                    <span>{item.type === "video" ? "Regarder la vidéo" : "Agrandir la photo"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Video Modal */}
      {activeMedia && (
        <LightboxModal
          item={activeMedia}
          onClose={() => setActiveMedia(null)}
        />
      )}
    </div>
  );
}
