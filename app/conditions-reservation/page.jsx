import { getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import HiddenPageNotice from "@/components/HiddenPageNotice";
import CustomContentBlocks from "@/components/CustomContentBlocks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Conditions Générales & Règlement Intérieur | YDM Coiffure",
  description:
    "Modalités d'acompte, de retard, de modification et d'annulation chez YDM Coiffure (@ydm_coiffure) à La Roche-sur-Yon.",
};

export default async function ConditionsReservationPage() {
  const rawSettings = await getSettings();
  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility } = publicSettings;

  if (pageVisibility.reglement === false) {
    return <HiddenPageNotice notice={siteContent.global.hiddenPageNotice} />;
  }

  const rp = siteContent.rulesPage;
  const header = rp.header;
  const visibleSections = Array.isArray(rp.sections)
    ? rp.sections.filter((sec) => sec && sec.visible !== false)
    : [];

  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-beige space-y-6">
          {header.visible !== false && (header.eyebrow || header.title) && (
            <div className="border-b border-beige pb-4">
              {header.eyebrow && (
                <span className="text-[10px] uppercase tracking-wider text-champagne-dark font-bold">
                  {header.eyebrow}
                </span>
              )}
              {header.title && (
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun mt-1">
                  {header.title}
                </h1>
              )}
            </div>
          )}

          {visibleSections.length > 0 && (
            <div className="space-y-5 text-xs text-stone-700 leading-relaxed font-light">
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
                    className={`space-y-1.5 ${
                      idx > 0 ? "pt-3 border-t border-beige" : ""
                    }`}
                  >
                    {section.title && (
                      <h2 className="font-serif text-base font-bold text-brun">
                        {section.title}
                      </h2>
                    )}
                    {paragraphs.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                    {bullets.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1">
                        {bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <CustomContentBlocks blocks={rp.customBlocks} />
      </div>
    </div>
  );
}
