"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn, ArrowRight } from "lucide-react";
import LightboxModal from "./LightboxModal";

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

export default function GalleryPreview({ initialItems }) {
  const [activeItem, setActiveItem] = useState(null);
  const [items, setItems] = useState(
    Array.isArray(initialItems) && initialItems.length > 0
      ? initialItems.slice(0, 6)
      : DEFAULT_PREVIEW_ITEMS
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
            setItems(data.settings.galleryItems.slice(0, 6));
          }
        })
        .catch(() => {});
    }
  }, [initialItems]);

  const galleryItems = items;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-stone-900 border border-beige"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-brun-dark/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-creme">
              <span className="text-xs uppercase tracking-wider text-champagne font-semibold mb-1">
                {item.category}
              </span>
              <h4 className="font-serif text-lg font-bold leading-tight">{item.title}</h4>
              <div className="mt-3 flex items-center space-x-1 text-xs text-champagne-light">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Agrandir</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/galerie"
          className="inline-flex items-center space-x-2 text-brun hover:text-champagne-dark font-medium text-sm group"
        >
          <span>Découvrir l'ensemble des réalisations</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {activeItem && (
        <LightboxModal
          image={activeItem.image}
          title={activeItem.title}
          category={activeItem.category}
          onClose={() => setActiveItem(null)}
        />
      )}
    </>
  );
}
