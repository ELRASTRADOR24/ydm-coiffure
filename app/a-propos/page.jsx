import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import HiddenPageNotice from "@/components/HiddenPageNotice";
import CustomContentBlocks from "@/components/CustomContentBlocks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "À propos | YDM Coiffure",
  description:
    "Moi c'est Maydie, coiffeuse passionnée par le cheveu texturé à La Roche-sur-Yon. Étudiante, je tresse sur mes temps libres pour exprimer mon savoir-faire et financer mes études.",
};

const VALUE_ICONS = [Heart, GraduationCap, ShieldCheck];

export default async function AProposPage() {
  const rawSettings = await getSettings();
  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility } = publicSettings;

  if (pageVisibility.aPropos === false) {
    return <HiddenPageNotice notice={siteContent.global.hiddenPageNotice} />;
  }

  const about = siteContent.aboutPage;
  const header = about.header;
  const story = about.storyCard;
  const values = about.values;

  const visibleParagraphs = Array.isArray(story.paragraphs)
    ? story.paragraphs.filter((p) => p && p.visible !== false && p.text)
    : [];
  const visibleCards = Array.isArray(values.cards)
    ? values.cards.filter((c) => c && c.visible !== false)
    : [];

  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* En-tête typographique */}
        {header.visible !== false && (
          <div className="text-center max-w-2xl mx-auto space-y-2">
            {header.eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-champagne-dark">
                {header.eyebrow}
              </p>
            )}
            {header.title && (
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brun leading-tight">
                {header.title}
              </h1>
            )}
            {header.subtitle && (
              <p className="text-stone-600 text-sm sm:text-base font-normal">
                {header.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Bloc Principal Portrait & Récit */}
        {story.visible !== false && (
          <div className="bg-white rounded-3xl border border-beige p-6 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Colonne Visuel */}
              {story.imageVisible !== false && story.imageUrl && (
                <div className="lg:col-span-5">
                  <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-beige bg-beige-light shadow-sm">
                    <Image
                      src={story.imageUrl}
                      alt={
                        story.imageAlt ||
                        "Coiffure et tresses afro YDM Coiffure à La Roche-sur-Yon"
                      }
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                  </div>
                </div>
              )}

              {/* Colonne Récit */}
              <div
                className={`${
                  story.imageVisible !== false && story.imageUrl
                    ? "lg:col-span-7"
                    : "lg:col-span-12"
                } space-y-5`}
              >
                {(visibleParagraphs.length > 0 ||
                  (story.highlightBoxVisible !== false && story.highlightText)) && (
                  <div className="space-y-4 text-stone-700 text-base leading-relaxed font-normal">
                    {visibleParagraphs.map((para, idx) => (
                      <p key={idx}>{para.text}</p>
                    ))}
                    {story.highlightBoxVisible !== false && story.highlightText && (
                      <p className="text-stone-600 text-sm italic bg-creme p-4 rounded-2xl border border-beige">
                        {story.highlightText}
                      </p>
                    )}
                  </div>
                )}

                {/* Engagements & Valeurs */}
                {values.visible !== false && visibleCards.length > 0 && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {visibleCards.map((card, idx) => {
                      const IconComponent = VALUE_ICONS[idx % VALUE_ICONS.length];
                      return (
                        <div
                          key={idx}
                          className="p-3.5 bg-creme rounded-2xl border border-beige space-y-1"
                        >
                          <div className="font-bold text-brun flex items-center space-x-1.5">
                            <IconComponent className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                            <span>{card.title}</span>
                          </div>
                          {card.description && (
                            <div className="text-stone-500 font-light">
                              {card.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Liens d'action */}
                {((story.primaryCtaVisible !== false && story.primaryCtaText) ||
                  (story.secondaryCtaVisible !== false &&
                    story.secondaryCtaText)) && (
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                    {pageVisibility.reserver !== false &&
                      story.primaryCtaVisible !== false &&
                      story.primaryCtaText && (
                        <Link
                          href="/reserver"
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-white px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
                        >
                          <Calendar className="w-4 h-4 text-champagne" />
                          <span>{story.primaryCtaText}</span>
                        </Link>
                      )}

                    {pageVisibility.prestations !== false &&
                      story.secondaryCtaVisible !== false &&
                      story.secondaryCtaText && (
                        <Link
                          href="/prestations"
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-creme hover:bg-beige text-brun border border-beige px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          <span>{story.secondaryCtaText}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-champagne-dark" />
                        </Link>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Blocs libres supplémentaires */}
        <CustomContentBlocks blocks={about.customBlocks} />
      </div>
    </div>
  );
}
