import { MapPin, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import Link from "next/link";
import { getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import HiddenPageNotice from "@/components/HiddenPageNotice";
import CustomContentBlocks from "@/components/CustomContentBlocks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact & Informations Pratiques | YDM Coiffure",
  description:
    "Coordonnées, horaires, règlements et consignes d'arrivée chez YDM Coiffure à La Roche-sur-Yon.",
};

export default async function ContactPage() {
  const rawSettings = await getSettings();
  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility } = publicSettings;

  if (pageVisibility.contact === false) {
    return <HiddenPageNotice notice={siteContent.global.hiddenPageNotice} />;
  }

  const contact = siteContent.contactPage;
  const header = contact.header;
  const loc = contact.locationCard;
  const coords = contact.coordinatesCard;
  const rulesCard = contact.rulesCard;

  const visibleRules = Array.isArray(rulesCard.rules)
    ? rulesCard.rules.filter((r) => r && r.visible !== false)
    : [];

  const igHandle = (coords.instagramHandle || "@ydm_coiffure").trim();
  const igClean = igHandle.replace(/^@/, "");

  const showLeftCol = loc.visible !== false || coords.visible !== false;
  const showRightCol = rulesCard.visible !== false;

  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        {header.visible !== false && (
          <div className="text-center max-w-xl mx-auto space-y-2">
            {header.eyebrow && (
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-champagne-dark">
                {header.eyebrow}
              </span>
            )}
            {header.title && (
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
                {header.title}
              </h1>
            )}
            {header.subtitle && (
              <p className="text-brun-muted text-xs sm:text-sm font-light">
                {header.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          {showLeftCol && (
            <div
              className={`${
                showRightCol ? "lg:col-span-5" : "lg:col-span-12"
              } space-y-5`}
            >
              {/* Localisation (jamais l'adresse privée) */}
              {loc.visible !== false && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-beige space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-creme flex items-center justify-center text-champagne-dark">
                    <MapPin className="w-5 h-5" />
                  </div>
                  {loc.title && (
                    <h2 className="font-serif text-xl font-bold text-brun">
                      {loc.title}
                    </h2>
                  )}
                  {loc.cityText && (
                    <p className="text-xs text-brun-muted leading-relaxed font-light">
                      {loc.cityText}
                    </p>
                  )}
                  {loc.confidentialityVisible !== false &&
                    (loc.confidentialityTitle || loc.confidentialityText) && (
                      <div className="p-3.5 bg-creme rounded-xl border border-beige text-[11px] text-stone-600 leading-relaxed">
                        {loc.confidentialityTitle && (
                          <span className="font-semibold text-brun block mb-1">
                            {loc.confidentialityTitle}
                          </span>
                        )}
                        {loc.confidentialityText}
                      </div>
                    )}
                </div>
              )}

              {/* Coordinates */}
              {coords.visible !== false && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-beige space-y-4">
                  {coords.title && (
                    <h3 className="font-serif text-lg font-bold text-brun">
                      {coords.title}
                    </h3>
                  )}

                  <div className="space-y-4 text-xs">
                    {coords.hoursVisible !== false && (
                      <div className="flex items-start space-x-2.5 text-brun-muted">
                        <Clock className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
                        <div>
                          {coords.hoursTitle && (
                            <span className="font-medium text-brun">
                              {coords.hoursTitle}
                            </span>
                          )}
                          {coords.hoursSchedule && (
                            <div className="font-light">{coords.hoursSchedule}</div>
                          )}
                          {coords.hoursNote && (
                            <div className="text-[11px] text-stone-500 font-light mt-0.5">
                              {coords.hoursNote}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {coords.supportVisible !== false && (
                      <div className="flex items-center space-x-2.5 text-brun-muted">
                        <InstagramIcon className="w-4 h-4 text-champagne-dark shrink-0" />
                        <div>
                          {coords.supportTitle && (
                            <span className="font-medium text-brun">
                              {coords.supportTitle}
                            </span>
                          )}
                          <div>
                            {igHandle && (
                              <a
                                href={`https://instagram.com/${igClean}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-champagne font-mono font-bold text-brun transition-colors"
                              >
                                {igHandle}
                              </a>
                            )}
                            {coords.supportNote && (
                              <div className="text-[11px] text-stone-500 font-light mt-0.5">
                                {coords.supportNote}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {coords.privacyNoteVisible !== false &&
                      (coords.privacyNoteTitle || coords.privacyNoteText) && (
                        <div className="p-3.5 rounded-xl bg-champagne-light/40 border border-champagne/30 text-[11px] text-stone-600 leading-relaxed space-y-1">
                          {coords.privacyNoteTitle && (
                            <span className="font-bold text-brun block">
                              {coords.privacyNoteTitle}
                            </span>
                          )}
                          {coords.privacyNoteText && <p>{coords.privacyNoteText}</p>}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column: House Rules & Requirements */}
          {showRightCol && (
            <div className={showLeftCol ? "lg:col-span-7" : "lg:col-span-12"}>
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige space-y-5">
                {rulesCard.title && (
                  <h2 className="font-serif text-xl font-bold text-brun">
                    {rulesCard.title}
                  </h2>
                )}

                {visibleRules.length > 0 && (
                  <div className="space-y-3 text-xs">
                    {visibleRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-creme border border-beige/60 space-y-1"
                      >
                        {rule.title && (
                          <span className="font-semibold text-brun block">
                            {rule.title}
                          </span>
                        )}
                        {rule.text && (
                          <p className="text-brun-muted font-light leading-relaxed">
                            {rule.text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageVisibility.reserver !== false &&
                  rulesCard.ctaVisible !== false &&
                  rulesCard.ctaText && (
                    <div className="pt-2 flex justify-end">
                      <Link
                        href="/reserver"
                        className="inline-flex items-center space-x-1.5 bg-nude hover:bg-nude-dark text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                      >
                        <span>{rulesCard.ctaText}</span>
                      </Link>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <CustomContentBlocks blocks={contact.customBlocks} />
      </div>
    </div>
  );
}
