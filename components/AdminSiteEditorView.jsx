"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  ExternalLink,
  Power,
  Layers,
  Home,
  Scissors,
  Image as ImageIcon,
  UserCheck,
  Phone,
  Scale,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Layout,
  CalendarCheck,
  AlertTriangle,
  Loader2,
  Mail,
} from "lucide-react";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_MAINTENANCE,
  DEFAULT_FAQ_ITEMS,
  cloneValue,
  getResolvedSiteContent,
  getResolvedPageVisibility,
  getResolvedMaintenance,
  getResolvedFaqItems,
} from "@/lib/siteContent";
import {
  DEFAULT_EMAIL_SETTINGS,
  getResolvedEmailSettings,
} from "@/lib/emailTemplates";
import { MaintenanceTab, PagesVisibilityTab } from "./admin/MaintenanceAndPagesTabs";
import {
  HomeEditorTab,
  ServicesEditorTab,
  AboutEditorTab,
  ContactEditorTab,
} from "./admin/PublicPagesEditors";
import {
  RulesEditorTab,
  LegalEditorTab,
  PrivacyEditorTab,
  GlobalEditorTab,
  BookingEditorTab,
} from "./admin/RulesLegalGlobalEditors";
import { FaqEditorTab, GalleryEditorTab } from "./admin/GalleryAndFaqEditors";
import EmailEditorTab from "./admin/EmailEditorTab";
import { useVirtualKeyboard } from "@/lib/useVirtualKeyboard";

const TABS = [
  { id: "pages", label: "👁️ Pages", icon: Layers },
  { id: "maintenance", label: "🚧 Maintenance", icon: Power },
  { id: "home", label: "🏡 Accueil", icon: Home },
  { id: "services", label: "✂️ Prestations", icon: Scissors },
  { id: "gallery", label: "📸 Galerie", icon: ImageIcon },
  { id: "about", label: "👋 À propos", icon: UserCheck },
  { id: "contact", label: "📞 Contact", icon: Phone },
  { id: "rules", label: "📜 Règlement", icon: FileCheck },
  { id: "legal", label: "⚖️ Mentions", icon: Scale },
  { id: "privacy", label: "🔒 RGPD", icon: ShieldCheck },
  { id: "faq", label: "❓ FAQ", icon: HelpCircle },
  { id: "global", label: "🧭 Menu & Pied", icon: Layout },
  { id: "booking", label: "🗓️ Réservation", icon: CalendarCheck },
  { id: "emails", label: "✉️ E-mails", icon: Mail },
];

const TAB_PREVIEW_PATH = {
  home: "/",
  services: "/prestations",
  gallery: "/galerie",
  about: "/a-propos",
  contact: "/contact",
  rules: "/conditions-reservation",
  legal: "/mentions-legales",
  privacy: "/politique-confidentialite",
  booking: "/reserver",
  maintenance: "/?preview_maintenance=1",
};

export default function AdminSiteEditorView({
  initialSettings = {},
  services = [],
  initialTab = "pages",
}) {
  const router = useRouter();
  const validInitialTab = useMemo(
    () => (TABS.some((t) => t.id === initialTab) ? initialTab : "pages"),
    [initialTab]
  );

  const [activeTab, setActiveTab] = useState(validInitialTab);

  useEffect(() => {
    if (TABS.some((t) => t.id === initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [saving, setSaving] = useState(false);
  const [togglingEmergency, setTogglingEmergency] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const isKeyboardOpen = useVirtualKeyboard();

  const [currentSettings, setCurrentSettings] = useState(initialSettings || {});

  const resolveGalleryItems = (settingsObj) => {
    const galleryTouched = Boolean(
      settingsObj?.siteContent?.flags?.galleryTouched
    );
    if (
      Array.isArray(settingsObj?.galleryItems) &&
      (settingsObj.galleryItems.length > 0 || galleryTouched)
    ) {
      return settingsObj.galleryItems;
    }
    return cloneValue(DEFAULT_SALON_SETTINGS.galleryItems);
  };

  const resolvePolicies = (settingsObj) => ({
    cancellationPolicyText:
      settingsObj?.cancellationPolicyText ??
      DEFAULT_SALON_SETTINGS.cancellationPolicyText ??
      "",
    depositPolicyText:
      settingsObj?.depositPolicyText ??
      DEFAULT_SALON_SETTINGS.depositPolicyText ??
      "",
    preparationGuidelinesText:
      settingsObj?.preparationGuidelinesText ??
      DEFAULT_SALON_SETTINGS.preparationGuidelinesText ??
      "",
  });

  // États structurés du CMS
  const [maintenance, setMaintenance] = useState(() =>
    getResolvedMaintenance(initialSettings)
  );
  const [pageVis, setPageVis] = useState(() =>
    getResolvedPageVisibility(initialSettings)
  );
  const [siteContent, setSiteContent] = useState(() =>
    getResolvedSiteContent(initialSettings)
  );
  const [emailSettings, setEmailSettings] = useState(() =>
    getResolvedEmailSettings(initialSettings)
  );
  const [faqList, setFaqList] = useState(() =>
    getResolvedFaqItems(initialSettings)
  );
  const [galleryList, setGalleryList] = useState(() =>
    resolveGalleryItems(initialSettings)
  );
  const [policies, setPolicies] = useState(() =>
    resolvePolicies(initialSettings)
  );

  useEffect(() => {
    if (hasUnsavedChanges || !initialSettings) return;
    setCurrentSettings(initialSettings);
    setMaintenance(getResolvedMaintenance(initialSettings));
    setPageVis(getResolvedPageVisibility(initialSettings));
    setSiteContent(getResolvedSiteContent(initialSettings));
    setEmailSettings(getResolvedEmailSettings(initialSettings));
    setFaqList(getResolvedFaqItems(initialSettings));
    setGalleryList(resolveGalleryItems(initialSettings));
    setPolicies(resolvePolicies(initialSettings));
  }, [initialSettings, hasUnsavedChanges]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4200);
  };

  const markChanged = () => setHasUnsavedChanges(true);

  const updateSiteContentSection = (key, nextVal) => {
    setSiteContent((prev) => ({
      ...prev,
      [key]: nextVal,
    }));
    markChanged();
  };

  // Bascule d'urgence 1-clic du mode Maintenance
  const handleToggleEmergency = async (nextEnabled) => {
    setTogglingEmergency(true);
    const nextMaintenance = { ...maintenance, enabled: nextEnabled };
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance: nextMaintenance }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) setCurrentSettings(data.settings);
        setMaintenance(getResolvedMaintenance(data.settings));
        showToast(
          nextEnabled
            ? "Mode maintenance activé : le site public est maintenant protégé."
            : "Mode maintenance désactivé : le site est de nouveau accessible à tous !"
        );
        router.refresh();
      } else {
        showToast(data.error || "Impossible de modifier le mode maintenance.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de la mise à jour du mode maintenance.");
    } finally {
      setTogglingEmergency(false);
    }
  };

  // Réinitialiser une section aux valeurs par défaut (en local, avant clic sur Enregistrer)
  const confirmResetSection = (sectionName, updater) => {
    if (
      !confirm(
        `Voulez-vous rétablir « ${sectionName} » aux textes d'origine ? Cliquez ensuite sur Enregistrer pour publier.`
      )
    ) {
      return;
    }
    updater();
    markChanged();
    showToast(`Section « ${sectionName} » rétablie (pensez à enregistrer).`);
  };

  // Enregistrement global du CMS
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const visibleFooterCondStrings = (
        siteContent?.global?.footer?.conditionsItems || []
      )
        .filter(
          (c) => c && c.visible !== false && typeof c.text === "string" && c.text.trim() !== ""
        )
        .map((c) => c.text.trim());

      const payload = {
        maintenance,
        pageVisibility: pageVis,
        siteContent: {
          ...siteContent,
          flags: {
            faqTouched: true,
            galleryTouched: true,
            footerConditionsTouched: true,
          },
        },
        faqItems: faqList,
        galleryItems: galleryList,
        footerConditions: visibleFooterCondStrings,
        footerNoticeText: siteContent?.global?.footer?.noticeText ?? "",
        homeContent: {
          heroTitle: siteContent?.home?.hero?.title ?? "",
          heroSubtitle: siteContent?.home?.hero?.subtitle ?? "",
          studentPromoText: siteContent?.servicesPage?.studentPromo?.text ?? "",
        },
        cancellationPolicyText: policies.cancellationPolicyText,
        depositPolicyText: policies.depositPolicyText,
        preparationGuidelinesText: policies.preparationGuidelinesText,
        emailSettings,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) setCurrentSettings(data.settings);
        setMaintenance(getResolvedMaintenance(data.settings));
        setPageVis(getResolvedPageVisibility(data.settings));
        setSiteContent(getResolvedSiteContent(data.settings));
        setFaqList(getResolvedFaqItems(data.settings));
        setGalleryList(resolveGalleryItems(data.settings));
        setPolicies(resolvePolicies(data.settings));
        setEmailSettings(getResolvedEmailSettings(data.settings));
        setHasUnsavedChanges(false);
        showToast("Modifications enregistrées et publiées en direct !");
        router.refresh();
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch (_) {
      showToast("Erreur de connexion lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Notification toast */}
      {toastMessage && (
        <div className="fixed top-20 lg:top-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] bg-brun text-creme px-5 py-3.5 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2.5 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Alerte permanente si le Mode Maintenance est activé */}
      {maintenance.enabled && (
        <div className="rounded-2xl bg-red-600 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start sm:items-center space-x-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-base">
                Attention : le Mode Maintenance est actuellement ACTIVÉ
              </p>
              <p className="text-sm text-red-100">
                Les clientes voient la page de maintenance sur tout le site public et ne peuvent plus réserver.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={togglingEmergency}
            onClick={() => handleToggleEmergency(false)}
            className="min-h-[44px] inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 text-sm font-bold shrink-0 cursor-pointer"
          >
            <Power className="w-4 h-4" />
            <span>Remettre le site en ligne</span>
          </button>
        </div>
      )}

      {/* En-tête de l'éditeur */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-stone-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                maintenance.enabled
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  maintenance.enabled ? "bg-red-600" : "bg-emerald-600"
                }`}
              />
              <span>
                {maintenance.enabled ? "Maintenance active" : "Site public en ligne"}
              </span>
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
            Contenu du site
          </h1>
          <p className="text-sm text-stone-600">
            Choisissez une page ci-dessous, puis ouvrez le bloc que vous souhaitez modifier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={TAB_PREVIEW_PATH[activeTab] || "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-brun border border-stone-300 text-sm font-semibold transition-colors"
          >
            <span>Voir cette page</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className={`min-h-[44px] inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md cursor-pointer ${
              hasUnsavedChanges
                ? "bg-champagne-dark hover:bg-brun text-white ring-4 ring-champagne/40"
                : "bg-brun hover:bg-brun-dark text-creme"
            } disabled:opacity-50`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>
              {saving
                ? "Enregistrement..."
                : hasUnsavedChanges
                ? "Enregistrer & Publier maintenant"
                : "Enregistrer & Publier"}
            </span>
          </button>
        </div>
      </div>

      {/* Menu des onglets : Navigation tactile rapide sur tablette (< xl) + Grille complète sur desktop (>= xl) */}
      <div className="bg-white rounded-2xl p-3 border-2 border-stone-200 shadow-2xs space-y-2.5">
        <div className="xl:hidden space-y-2.5">
          <div>
            <label htmlFor="site-editor-section-select" className="sr-only">
              Section du site à modifier
            </label>
            <select
              id="site-editor-section-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base font-semibold text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
            >
              {TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          <div
            role="tablist"
            aria-label="Sections du site"
            className="flex overflow-x-auto no-scrollbar snap-x gap-2 pb-1"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isMaintTab = tab.id === "maintenance";
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none snap-start min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? isMaintTab && maintenance.enabled
                        ? "bg-red-600 text-white border-red-700 shadow-sm"
                        : "bg-brun text-creme border-brun shadow-sm"
                      : isMaintTab && maintenance.enabled
                      ? "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                      : "bg-stone-50 text-brun border-stone-200 hover:bg-champagne-light/50 hover:border-champagne"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-champagne"
                        : isMaintTab && maintenance.enabled
                        ? "text-red-600"
                        : "text-champagne-dark"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden xl:grid xl:grid-cols-5 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isMaintTab = tab.id === "maintenance";
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] flex items-center space-x-2.5 px-3.5 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? isMaintTab && maintenance.enabled
                      ? "bg-red-600 text-white border-red-700 shadow-sm"
                      : "bg-brun text-creme border-brun shadow-sm"
                    : isMaintTab && maintenance.enabled
                    ? "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                    : "bg-stone-50 text-brun border-stone-200 hover:bg-champagne-light/50 hover:border-champagne"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-champagne"
                      : isMaintTab && maintenance.enabled
                      ? "text-red-600"
                      : "text-champagne-dark"
                  }`}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      {activeTab === "pages" && (
        <PagesVisibilityTab
          pageVis={pageVis}
          onChangePageVis={(next) => {
            setPageVis(next);
            markChanged();
          }}
          hiddenPageNotice={siteContent.global.hiddenPageNotice}
          onChangeHiddenPageNotice={(notice) => {
            updateSiteContentSection("global", {
              ...siteContent.global,
              hiddenPageNotice: notice,
            });
          }}
          onNavigateTab={(tabId) => setActiveTab(tabId)}
          onResetNotice={() =>
            confirmResetSection("Message de page masquée", () => {
              updateSiteContentSection("global", {
                ...siteContent.global,
                hiddenPageNotice: cloneValue(
                  DEFAULT_SITE_CONTENT.global.hiddenPageNotice
                ),
              });
            })
          }
        />
      )}

      {activeTab === "maintenance" && (
        <MaintenanceTab
          maintenance={maintenance}
          onChangeMaintenance={(next) => {
            setMaintenance(next);
            markChanged();
          }}
          onToggleEmergency={handleToggleEmergency}
          togglingEmergency={togglingEmergency}
          onResetDefaults={() =>
            confirmResetSection("Textes de maintenance", () => {
              setMaintenance((prev) => ({
                ...cloneValue(DEFAULT_MAINTENANCE),
                enabled: prev.enabled,
              }));
            })
          }
        />
      )}

      {activeTab === "home" && (
        <HomeEditorTab
          home={siteContent.home}
          onChangeHome={(nextHome) => updateSiteContentSection("home", nextHome)}
          onNavigateTab={(tabId) => setActiveTab(tabId)}
          onToast={showToast}
          onResetPage={() =>
            confirmResetSection("Page d'Accueil", () =>
              updateSiteContentSection(
                "home",
                cloneValue(DEFAULT_SITE_CONTENT.home)
              )
            )
          }
        />
      )}

      {activeTab === "services" && (
        <ServicesEditorTab
          servicesPage={siteContent.servicesPage}
          onChangeServicesPage={(nextSp) =>
            updateSiteContentSection("servicesPage", nextSp)
          }
          lengthGuide={siteContent.lengthGuide}
          onChangeLengthGuide={(nextLg) =>
            updateSiteContentSection("lengthGuide", nextLg)
          }
          onToast={showToast}
          onResetPage={() =>
            confirmResetSection("Page Prestations & Guide des Longueurs", () => {
              setSiteContent((prev) => ({
                ...prev,
                servicesPage: cloneValue(DEFAULT_SITE_CONTENT.servicesPage),
                lengthGuide: cloneValue(DEFAULT_SITE_CONTENT.lengthGuide),
              }));
            })
          }
        />
      )}

      {activeTab === "gallery" && (
        <GalleryEditorTab
          galleryPage={siteContent.galleryPage}
          onChangeGalleryPage={(nextGp) =>
            updateSiteContentSection("galleryPage", nextGp)
          }
          galleryList={galleryList}
          setGalleryList={(next) => {
            setGalleryList(next);
            markChanged();
          }}
          markChanged={markChanged}
          showToast={showToast}
          availableServices={services}
          onSaveNow={handleSaveAll}
          hasUnsavedChanges={hasUnsavedChanges}
          savingNow={saving}
          onResetPage={() =>
            confirmResetSection("En-tête & Bas de page Galerie", () =>
              updateSiteContentSection(
                "galleryPage",
                cloneValue(DEFAULT_SITE_CONTENT.galleryPage)
              )
            )
          }
        />
      )}

      {activeTab === "about" && (
        <AboutEditorTab
          about={siteContent.aboutPage}
          onChangeAbout={(nextAbout) =>
            updateSiteContentSection("aboutPage", nextAbout)
          }
          onToast={showToast}
          onResetPage={() =>
            confirmResetSection("Page À propos de moi", () =>
              updateSiteContentSection(
                "aboutPage",
                cloneValue(DEFAULT_SITE_CONTENT.aboutPage)
              )
            )
          }
        />
      )}

      {activeTab === "contact" && (
        <ContactEditorTab
          contact={siteContent.contactPage}
          onChangeContact={(nextContact) =>
            updateSiteContentSection("contactPage", nextContact)
          }
          onResetPage={() =>
            confirmResetSection("Page Contact & Informations", () =>
              updateSiteContentSection(
                "contactPage",
                cloneValue(DEFAULT_SITE_CONTENT.contactPage)
              )
            )
          }
        />
      )}

      {activeTab === "rules" && (
        <RulesEditorTab
          rulesPage={siteContent.rulesPage}
          onChangeRulesPage={(nextRules) =>
            updateSiteContentSection("rulesPage", nextRules)
          }
          policies={policies}
          onChangePolicies={(nextPol) => {
            setPolicies(nextPol);
            markChanged();
          }}
          onResetPage={() =>
            confirmResetSection("Page Règlement Intérieur", () =>
              updateSiteContentSection(
                "rulesPage",
                cloneValue(DEFAULT_SITE_CONTENT.rulesPage)
              )
            )
          }
        />
      )}

      {activeTab === "legal" && (
        <LegalEditorTab
          legalPage={siteContent.legalPage}
          onChangeLegalPage={(nextLegal) =>
            updateSiteContentSection("legalPage", nextLegal)
          }
          onResetPage={() =>
            confirmResetSection("Page Mentions Légales", () =>
              updateSiteContentSection(
                "legalPage",
                cloneValue(DEFAULT_SITE_CONTENT.legalPage)
              )
            )
          }
        />
      )}

      {activeTab === "privacy" && (
        <PrivacyEditorTab
          privacyPage={siteContent.privacyPage}
          onChangePrivacyPage={(nextPrivacy) =>
            updateSiteContentSection("privacyPage", nextPrivacy)
          }
          onResetPage={() =>
            confirmResetSection("Page Confidentialité & RGPD", () =>
              updateSiteContentSection(
                "privacyPage",
                cloneValue(DEFAULT_SITE_CONTENT.privacyPage)
              )
            )
          }
        />
      )}

      {activeTab === "faq" && (
        <FaqEditorTab
          faqList={faqList}
          setFaqList={setFaqList}
          homeFaqSection={siteContent.home.faqSection}
          onChangeHomeFaqSection={(nextFaqSec) =>
            updateSiteContentSection("home", {
              ...siteContent.home,
              faqSection: nextFaqSec,
            })
          }
          markChanged={markChanged}
          onResetDefaults={() =>
            confirmResetSection("Questions FAQ par défaut", () => {
              setFaqList(cloneValue(DEFAULT_FAQ_ITEMS));
              updateSiteContentSection("home", {
                ...siteContent.home,
                faqSection: cloneValue(DEFAULT_SITE_CONTENT.home.faqSection),
              });
            })
          }
        />
      )}

      {activeTab === "global" && (
        <GlobalEditorTab
          globalContent={siteContent.global}
          onChangeGlobal={(nextGlobal) =>
            updateSiteContentSection("global", nextGlobal)
          }
          onResetGlobal={() =>
            confirmResetSection("Menu du haut & Pied de page", () =>
              updateSiteContentSection(
                "global",
                cloneValue(DEFAULT_SITE_CONTENT.global)
              )
            )
          }
        />
      )}

      {activeTab === "booking" && (
        <BookingEditorTab
          bookingPage={siteContent.bookingPage}
          onChangeBookingPage={(nextBk) =>
            updateSiteContentSection("bookingPage", nextBk)
          }
          isReserverVisible={pageVis.reserver !== false}
          onToggleReserverVisible={() => {
            setPageVis((prev) => ({
              ...prev,
              reserver: prev.reserver === false,
            }));
            markChanged();
          }}
          onResetBooking={() =>
            confirmResetSection("En-tête Page Réservation", () =>
              updateSiteContentSection(
                "bookingPage",
                cloneValue(DEFAULT_SITE_CONTENT.bookingPage)
              )
            )
          }
        />
      )}

      {activeTab === "emails" && (
        <EmailEditorTab
          emailSettings={emailSettings}
          salonSettings={currentSettings}
          onChangeEmailSettings={(nextEmails) => {
            setEmailSettings(nextEmails);
            markChanged();
          }}
          onResetEmails={() =>
            confirmResetSection("Cartes Mail & Modèles Gmail", () =>
              setEmailSettings(cloneValue(DEFAULT_EMAIL_SETTINGS))
            )
          }
          onToast={showToast}
        />
      )}

      {/* Barre flottante sticky en bas dès qu'il y a des modifications non enregistrées */}
      {hasUnsavedChanges && (
        <div
          className={
            isKeyboardOpen
              ? "relative z-10"
              : "sticky bottom-3 z-40 pb-[env(safe-area-inset-bottom)]"
          }
        >
          <div className="bg-brun text-creme rounded-2xl p-4 sm:px-6 shadow-2xl border-2 border-champagne flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-semibold">
              Vous avez des modifications non publiées sur le site.
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAll}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center space-x-2 bg-champagne hover:bg-champagne-light text-brun-dark px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {saving ? "Enregistrement..." : "Enregistrer & Publier maintenant"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
