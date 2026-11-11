"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { cloneValue } from "@/lib/siteContent";
import {
  DEFAULT_EMAIL_SETTINGS,
  getResolvedEmailSettings,
} from "@/lib/emailTemplates";
import EmailEditorTab from "./admin/EmailEditorTab";

export default function AdminEmailsStudioPage({ initialSettings = {} }) {
  const router = useRouter();
  const [currentSettings, setCurrentSettings] = useState(initialSettings || {});
  const [emailSettings, setEmailSettings] = useState(() =>
    getResolvedEmailSettings(initialSettings)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (hasUnsavedChanges || !initialSettings) return;
    setCurrentSettings(initialSettings);
    setEmailSettings(getResolvedEmailSettings(initialSettings));
  }, [initialSettings, hasUnsavedChanges]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4200);
  };

  const handleChangeEmails = (next) => {
    setEmailSettings(next);
    setHasUnsavedChanges(true);
  };

  const handleResetAll = () => {
    if (
      !confirm(
        "Rétablir toutes les cartes mail (couleurs, logo, textes et blocs) aux modèles d'origine ?"
      )
    ) {
      return;
    }
    setEmailSettings(cloneValue(DEFAULT_EMAIL_SETTINGS));
    setHasUnsavedChanges(true);
    showToast("Cartes mail rétablies (cliquez sur Enregistrer pour appliquer).");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailSettings }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) setCurrentSettings(data.settings);
        setEmailSettings(getResolvedEmailSettings(data.settings));
        setHasUnsavedChanges(false);
        showToast("Cartes mail enregistrées ! Les prochains e-mails utiliseront ce design.");
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
    <div className="space-y-6 max-w-7xl pb-28">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brun text-creme px-5 py-3.5 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2.5 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-stone-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
            Cartes Mail &amp; Modèles Gmail
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Modifiez vos e-mails comme sur Google Docs : polices, couleurs, logo, cadres et boutons, avec aperçu réel en direct.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/site-editor"
            className="inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-brun border border-stone-300 text-sm font-semibold transition-colors"
          >
            <span>Éditeur du site</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md cursor-pointer ${
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
                ? "Enregistrer les cartes mail"
                : "Enregistrer"}
            </span>
          </button>
        </div>
      </div>

      <EmailEditorTab
        emailSettings={emailSettings}
        salonSettings={currentSettings}
        onChangeEmailSettings={handleChangeEmails}
        onResetEmails={handleResetAll}
        onToast={showToast}
      />

      {hasUnsavedChanges && (
        <div className="fixed bottom-4 left-4 right-4 md:left-72 z-40">
          <div className="max-w-5xl mx-auto bg-brun text-creme rounded-2xl p-4 sm:px-6 shadow-2xl border-2 border-champagne flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-semibold">
              Modifications sur vos cartes e-mail prêtes à être enregistrées.
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-champagne hover:bg-champagne-light text-brun-dark px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Enregistrement..." : "Enregistrer maintenant"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
