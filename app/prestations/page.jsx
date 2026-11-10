import { getServices, getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import ServicesList from "@/components/ServicesList";
import LengthGuide from "@/components/LengthGuide";
import HiddenPageNotice from "@/components/HiddenPageNotice";
import CustomContentBlocks from "@/components/CustomContentBlocks";
import { Shield, Clock, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prestations & Tarifs Officiels | YDM Coiffure",
  description:
    "Menu officiel des coiffures afro et tarifs à La Roche-sur-Yon. Knotless, Fulani, Boho Braids, vanilles et nattes sans rajouts.",
};

const BANNER_ICONS = [Shield, Clock, Check];

export default async function PrestationsPage() {
  const [services, rawSettings] = await Promise.all([
    getServices(true),
    getSettings(),
  ]);

  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility } = publicSettings;

  if (pageVisibility.prestations === false) {
    return <HiddenPageNotice notice={siteContent.global.hiddenPageNotice} />;
  }

  const sp = siteContent.servicesPage;
  const header = sp.header;
  const banner = sp.keyRulesBanner;
  const visibleBannerItems = Array.isArray(banner.items)
    ? banner.items.filter((i) => i && i.visible !== false && i.text)
    : [];

  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        {header.visible !== false && (
          <div className="text-center max-w-2xl mx-auto space-y-2">
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
              <p className="text-brun-muted text-xs sm:text-sm font-light leading-relaxed">
                {header.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Key rules banner */}
        {banner.visible !== false && visibleBannerItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-beige p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {visibleBannerItems.map((item, idx) => {
              const IconComp = BANNER_ICONS[idx % BANNER_ICONS.length];
              return (
                <div key={idx} className="flex items-center space-x-2.5">
                  <IconComp className="w-4 h-4 text-champagne-dark shrink-0" />
                  <span className="text-brun font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Services List with Filter */}
        <ServicesList
          initialServices={services}
          studentPromo={sp.studentPromo}
        />

        {/* Length Guide */}
        {sp.lengthGuideVisible !== false &&
          siteContent.lengthGuide?.visible !== false && (
            <div className="pt-8">
              <LengthGuide content={siteContent.lengthGuide} />
            </div>
          )}

        <CustomContentBlocks blocks={sp.customBlocks} />
      </div>
    </div>
  );
}
