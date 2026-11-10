import { getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import HiddenPageNotice from "@/components/HiddenPageNotice";
import CustomContentBlocks from "@/components/CustomContentBlocks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Politique de Confidentialité (RGPD) | YDM Coiffure",
  description: "Politique de protection des données personnelles de YDM Coiffure.",
};

export default async function PolitiqueConfidentialitePage() {
  const rawSettings = await getSettings();
  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility } = publicSettings;

  if (pageVisibility.confidentialite === false) {
    return <HiddenPageNotice notice={siteContent.global.hiddenPageNotice} />;
  }

  const pp = siteContent.privacyPage;
  const header = pp.header;
  const visibleSections = Array.isArray(pp.sections)
    ? pp.sections.filter((sec) => sec && sec.visible !== false)
    : [];

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-beige shadow-sm space-y-8">
          {header.visible !== false && (header.title || header.subtitleLabel) && (
            <div className="space-y-2">
              {header.title && (
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
                  {header.title}
                </h1>
              )}
              {header.subtitleLabel && (
                <p className="text-xs text-champagne-dark font-semibold uppercase tracking-wider">
                  {header.subtitleLabel}
                </p>
              )}
            </div>
          )}

          {visibleSections.map((section, idx) => {
            const paragraphs = Array.isArray(section.paragraphs)
              ? section.paragraphs.filter((p) => typeof p === "string" && p.trim() !== "")
              : [];
            const bullets = Array.isArray(section.bullets)
              ? section.bullets.filter((b) => typeof b === "string" && b.trim() !== "")
              : [];

            return (
              <section
                key={section.id || idx}
                className="space-y-3 text-sm text-brun-muted leading-relaxed font-light"
              >
                {section.title && (
                  <h2 className="font-serif text-xl font-bold text-brun">
                    {section.title}
                  </h2>
                )}
                {paragraphs.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
                {bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {bullets.map((item, bIdx) => (
                      <li key={bIdx}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.closingParagraph && <p>{section.closingParagraph}</p>}
              </section>
            );
          })}
        </div>

        <CustomContentBlocks blocks={pp.customBlocks} />
      </div>
    </div>
  );
}
