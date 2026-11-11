"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Film,
  Image as ImageIcon,
  EyeOff,
} from "lucide-react";
import { cloneValue, DEFAULT_SITE_CONTENT, getResolvedSiteContent } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import { GalleryEditorTab } from "./admin/GalleryAndFaqEditors";
import { useVirtualKeyboard } from "@/lib/useVirtualKeyboard";

function resolveGalleryItems(settingsObj) {
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
}

export default function AdminGalleryStudioPage({
  initialSettings = {},
  services = [],
}) {
  const router = useRouter();
  const [currentSettings, setCurrentSettings] = useState(initialSettings || {});
  const [galleryPage, setGalleryPage] = useState(
    () => getResolvedSiteContent(initialSettings).galleryPage
  );
  const [galleryList, setGalleryList] = useState(() =>
    resolveGalleryItems(initialSettings)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const isKeyboardOpen = useVirtualKeyboard();

  useEffect(() => {
    if (hasUnsavedChanges || !initialSettings) return;
    setCurrentSettings(initialSettings);
    setGalleryPage(getResolvedSiteContent(initialSettings).galleryPage);
    setGalleryList(resolveGalleryItems(initialSettings));
  }, [initialSettings, hasUnsavedChanges]);

  const stats = useMemo(() => {
    const videos = galleryList.filter((item) => item?.type === "video").length;
    const photos = galleryList.length - videos;
    const hidden = galleryList.filter((item) => item?.visible === false).length;
    return { videos, photos, hidden };
  }, [galleryList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4200);
  };

  const markChanged = () => setHasUnsavedChanges(true);

  const handleResetPageText = () => {
    if (
      !confirm(
        "Voulez-vous rétablir « En-tête & Bas de page Galerie » aux textes d'origine ? Cliquez ensuite sur Enregistrer pour publier."
      )
    ) {
      return;
    }
    setGalleryPage(cloneValue(DEFAULT_SITE_CONTENT.galleryPage));
    setHasUnsavedChanges(true);
    showToast("Textes de la page Galerie rétablis (pensez à enregistrer).");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resolvedSiteContent = getResolvedSiteContent(currentSettings);
      const payload = {
        galleryItems: galleryList,
        siteContent: {
          ...resolvedSiteContent,
          galleryPage,
          flags: {
            ...(resolvedSiteContent.flags || {}),
            galleryTouched: true,
          },
        },
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) setCurrentSettings(data.settings);
        setGalleryPage(getResolvedSiteContent(data.settings).galleryPage);
        setGalleryList(resolveGalleryItems(data.settings));
        setHasUnsavedChanges(false);
        showToast(
          "Galerie enregistrée et publiée en direct sur la galerie publique !"
        );
        router.refresh();
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {toastMessage && (
        <div className="fixed top-20 lg:top-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] bg-brun text-creme px-5 py-3.5 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2.5 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête du Studio Galerie & Vidéos */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-stone-200 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brun text-champagne text-xs font-bold">
              <Film className="w-3.5 h-3.5" />
              <span>
                {stats.videos} vidéo{stats.videos > 1 ? "s" : ""}
              </span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-100 text-brun border border-stone-200 text-xs font-bold">
              <ImageIcon className="w-3.5 h-3.5 text-champagne-dark" />
              <span>
                {stats.photos} photo{stats.photos > 1 ? "s" : ""}
              </span>
            </span>
            {stats.hidden > 0 && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-xs font-semibold">
                <EyeOff className="w-3.5 h-3.5" />
                <span>
                  {stats.hidden} masquée{stats.hidden > 1 ? "s" : ""}
                </span>
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
            Galerie, Vidéos &amp; Réalisations
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
            Ajoutez directement vos vidéos (.MOV / .MP4 depuis iPad, téléphone ou par lien) et photos pour enrichir la galerie publique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <a
            href="/galerie"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-brun border border-stone-300 text-sm font-semibold transition-colors"
          >
            <span>Voir la galerie</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <Link
            href="/admin/site-editor?tab=gallery"
            className="min-h-[44px] inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white hover:bg-stone-50 text-brun border border-stone-300 text-sm font-semibold transition-colors"
          >
            <span>Éditeur du site</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
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

      <GalleryEditorTab
        galleryPage={galleryPage}
        onChangeGalleryPage={(nextGp) => {
          setGalleryPage(nextGp);
          markChanged();
        }}
        galleryList={galleryList}
        setGalleryList={(next) => {
          setGalleryList(next);
          markChanged();
        }}
        markChanged={markChanged}
        showToast={showToast}
        onResetPage={handleResetPageText}
        availableServices={services}
        onSaveNow={handleSave}
        hasUnsavedChanges={hasUnsavedChanges}
        savingNow={saving}
      />

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
              Vos nouvelles vidéos / modifications de galerie sont prêtes à être publiées.
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
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
