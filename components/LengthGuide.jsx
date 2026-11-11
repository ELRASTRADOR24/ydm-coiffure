"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEFAULT_SITE_CONTENT } from "@/lib/siteContent";

export default function LengthGuide({ content = null }) {
  const guide = content || DEFAULT_SITE_CONTENT.lengthGuide;
  if (guide.visible === false) return null;

  const lengths = Array.isArray(guide.items)
    ? guide.items.filter((item) => item && item.visible !== false)
    : DEFAULT_SITE_CONTENT.lengthGuide.items;

  if (lengths.length === 0 && !guide.title && !guide.subtitle) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-beige shadow-xs">
      {(guide.eyebrow || guide.title || guide.subtitle) && (
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          {guide.eyebrow && (
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-champagne-dark block mb-1.5">
              {guide.eyebrow}
            </span>
          )}
          {guide.title && (
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
              {guide.title}
            </h3>
          )}
          {guide.subtitle && (
            <p className="text-xs sm:text-sm text-brun-muted font-light mt-2 leading-relaxed">
              {guide.subtitle}
            </p>
          )}
        </div>
      )}

      {lengths.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lengths.map((item, index) => (
            <div
              key={item.id || item.level || index}
              className="group p-4 sm:p-5 rounded-2xl bg-creme border border-beige/90 flex flex-col justify-between hover:border-champagne/80 hover:shadow-md transition-all duration-300"
            >
              <div>
                {/* Illustrated Card */}
                {item.image && (
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-white border border-beige/80 mb-4 shadow-2xs group-hover:shadow-xs transition-shadow">
                    <Image
                      src={item.image}
                      alt={`Illustration Guide Longueur ${item.level} - YDM Coiffure`}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs border border-beige text-[10px] font-mono font-bold text-brun shadow-2xs">
                      0{index + 1}
                    </div>

                    {item.tag && (
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-brun/85 backdrop-blur-xs text-[10px] font-medium text-creme shadow-2xs">
                        {item.tag}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Meta */}
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-serif text-lg font-bold text-brun">
                    {item.level}
                  </h4>
                  <span className="text-[10px] font-semibold text-champagne-dark uppercase tracking-wider">
                    Niveau {index + 1}
                  </span>
                </div>

                {item.placement && (
                  <p className="text-xs text-champagne-dark font-medium mb-2">
                    Repère : {item.placement}
                  </p>
                )}

                {item.description && (
                  <p className="text-xs text-brun-muted leading-relaxed font-light mb-4">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Visual length progress indicator */}
              <div className="pt-3 border-t border-beige/60">
                <div className="flex justify-between text-[10px] text-stone-500 mb-1.5">
                  <span>Échelle</span>
                  <span className="font-semibold text-brun">{item.progress || "50%"}</span>
                </div>
                <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-nude to-champagne-dark h-full rounded-full transition-all duration-500"
                    style={{ width: item.progress || "50%" }}
                  />
                </div>

                {/* Direct Booking Link */}
                <div className="mt-3.5">
                  <Link
                    href={`/reserver?service=${item.slug || "knotless-avec-meches"}`}
                    className="w-full min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-brun hover:text-creme text-brun border border-beige/90 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span>Réserver en {item.level}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
