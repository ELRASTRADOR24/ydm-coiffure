"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Mail,
  ArrowRight,
  Wallet,
} from "lucide-react";
import {
  DEFAULT_PAYMENT_ACCOUNTS,
  formatPostalCityValue,
  parsePostalCityInput,
  resolvePaymentAccounts,
} from "@/lib/adminHelpers";
import { AdminLocationIllustration } from "./admin/AdminVisualGuide";
import { useVirtualKeyboard } from "@/lib/useVirtualKeyboard";

function getInitialPaymentAccounts(initialSettings) {
  return {
    revolutEnabled:
      initialSettings?.paymentAccounts?.revolutEnabled !== undefined
        ? initialSettings.paymentAccounts.revolutEnabled
        : DEFAULT_PAYMENT_ACCOUNTS.revolutEnabled,
    revolutTag:
      initialSettings?.paymentAccounts?.revolutTag ??
      DEFAULT_PAYMENT_ACCOUNTS.revolutTag,
    paypalEnabled:
      initialSettings?.paymentAccounts?.paypalEnabled !== undefined
        ? initialSettings.paymentAccounts.paypalEnabled
        : DEFAULT_PAYMENT_ACCOUNTS.paypalEnabled,
    paypalHandle:
      initialSettings?.paymentAccounts?.paypalHandle ??
      DEFAULT_PAYMENT_ACCOUNTS.paypalHandle,
    weroEnabled:
      initialSettings?.paymentAccounts?.weroEnabled !== undefined
        ? initialSettings.paymentAccounts.weroEnabled
        : DEFAULT_PAYMENT_ACCOUNTS.weroEnabled,
    weroPhone:
      initialSettings?.paymentAccounts?.weroPhone ??
      DEFAULT_PAYMENT_ACCOUNTS.weroPhone,
  };
}

export default function AdminSettingsView({ initialSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings || {});
  const [paymentAccounts, setPaymentAccounts] = useState(() =>
    getInitialPaymentAccounts(initialSettings)
  );
  const [postalCityInput, setPostalCityInput] = useState(() =>
    formatPostalCityValue(initialSettings?.homeAddress)
  );
  const [numInputs, setNumInputs] = useState({
    minNoticeHours: String(initialSettings?.minNoticeHours ?? 24),
    maxDaysInAdvance: String(initialSettings?.maxDaysInAdvance ?? 60),
    paymentHoldHours: String(initialSettings?.paymentHoldHours ?? 2),
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const isKeyboardOpen = useVirtualKeyboard();

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setPaymentAccounts(getInitialPaymentAccounts(initialSettings));
      setPostalCityInput(formatPostalCityValue(initialSettings.homeAddress));
      setNumInputs({
        minNoticeHours: String(initialSettings.minNoticeHours ?? 24),
        maxDaysInAdvance: String(initialSettings.maxDaysInAdvance ?? 60),
        paymentHoldHours: String(initialSettings.paymentHoldHours ?? 2),
      });
      setHasUnsavedChanges(false);
    }
  }, [initialSettings]);

  const previewPaymentAccounts = resolvePaymentAccounts({ paymentAccounts });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const minNotice = Number(numInputs.minNoticeHours);
    const maxDays = Number(numInputs.maxDaysInAdvance);
    const holdHours = Number(numInputs.paymentHoldHours);

    if (
      numInputs.minNoticeHours.trim() === "" ||
      !Number.isFinite(minNotice) ||
      minNotice < 0
    ) {
      showToast("Veuillez saisir un délai minimum avant rendez-vous valide.");
      return;
    }
    if (
      numInputs.maxDaysInAdvance.trim() === "" ||
      !Number.isFinite(maxDays) ||
      maxDays < 1
    ) {
      showToast("Veuillez saisir un horizon de réservation valide.");
      return;
    }
    if (
      numInputs.paymentHoldHours.trim() === "" ||
      !Number.isFinite(holdHours) ||
      holdHours < 1
    ) {
      showToast("Veuillez saisir un délai de paiement d'acompte valide.");
      return;
    }

    if (paymentAccounts.weroEnabled && !String(paymentAccounts.weroPhone || "").trim()) {
      showToast("Veuillez saisir votre numéro Wero ou décocher Wero.");
      return;
    }
    if (paymentAccounts.revolutEnabled && !String(paymentAccounts.revolutTag || "").trim()) {
      showToast("Veuillez saisir votre identifiant Revolut (@Revtag) ou décocher Revolut.");
      return;
    }
    if (paymentAccounts.paypalEnabled && !String(paymentAccounts.paypalHandle || "").trim()) {
      showToast("Veuillez saisir votre identifiant PayPal ou décocher PayPal.");
      return;
    }

    setSubmitting(true);

    try {
      const { postalCode, city } = parsePostalCityInput(postalCityInput);
      const payload = {
        ...settings,
        paymentAccounts: {
          weroEnabled: Boolean(paymentAccounts.weroEnabled),
          weroPhone: String(paymentAccounts.weroPhone || "").trim(),
          revolutEnabled: Boolean(paymentAccounts.revolutEnabled),
          revolutTag: String(paymentAccounts.revolutTag || "").trim(),
          paypalEnabled: Boolean(paymentAccounts.paypalEnabled),
          paypalHandle: String(paymentAccounts.paypalHandle || "").trim(),
        },
        homeAddress: {
          ...settings.homeAddress,
          postalCode,
          city,
        },
        minNoticeHours: Math.round(minNotice),
        maxDaysInAdvance: Math.round(maxDays),
        paymentHoldHours: Math.round(holdHours),
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setPaymentAccounts(getInitialPaymentAccounts(data.settings));
        setPostalCityInput(formatPostalCityValue(data.settings?.homeAddress));
        setNumInputs({
          minNoticeHours: String(data.settings.minNoticeHours ?? Math.round(minNotice)),
          maxDaysInAdvance: String(data.settings.maxDaysInAdvance ?? Math.round(maxDays)),
          paymentHoldHours: String(data.settings.paymentHoldHours ?? Math.round(holdHours)),
        });
        router.refresh();
        setHasUnsavedChanges(false);
        showToast("Paramètres du salon enregistrés avec succès !");
      } else {
        showToast(data.error || "Impossible d'enregistrer les paramètres. Merci de vérifier la saisie.");
      }
    } catch (err) {
      showToast("La connexion a échoué. Veuillez vérifier votre réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-24">
      {toastMessage && (
        <div className="fixed top-20 lg:top-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs sm:text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brun">
          Paramètres du Salon
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Gérez votre profil public, votre adresse privée confidentielle et vos règles de réservation.
        </p>
      </div>

      {/* Raccourcis vers l'Éditeur de Site & Cartes Mail */}
      <div className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-champagne-dark block">
            Textes du site, Cartes Mail &amp; Maintenance
          </span>
          <h3 className="font-serif text-lg font-bold text-brun">
            Modifier les textes des pages ou les modèles d&apos;e-mails ?
          </h3>
          <p className="text-sm text-stone-600">
            Modifiez vos pages publiques ou personnalisez vos cartes mail (logo, textes, couleurs, boutons).
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/admin/emails"
            className="min-h-[44px] inline-flex items-center space-x-2 bg-white hover:bg-champagne-light text-brun border-2 border-stone-300 hover:border-champagne px-4 py-3 rounded-xl text-sm font-bold shrink-0 transition-colors"
          >
            <Mail className="w-4 h-4 text-champagne-dark" />
            <span>Modifier les cartes Mail</span>
          </Link>
          <Link
            href="/admin/site-editor"
            className="min-h-[44px] inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-5 py-3 rounded-xl text-sm font-bold shrink-0 transition-colors"
          >
            <span>Ouvrir l&apos;éditeur du site</span>
            <ArrowRight className="w-4 h-4 text-champagne" />
          </Link>
        </div>
      </div>

      <form
        id="admin-settings-form"
        onChange={() => setHasUnsavedChanges(true)}
        onSubmit={handleSave}
        className="space-y-8"
      >
        {/* SECTION 1: PUBLIC IDENTITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-brun">
            Profil & Coordonnées Publiques
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="font-semibold text-brun block mb-1.5">
                Nom du Salon
              </label>
              <input
                type="text"
                value={settings.salonName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, salonName: e.target.value })
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1.5">
                Nom de la Coiffeuse
              </label>
              <input
                type="text"
                value={settings.braiderName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, braiderName: e.target.value })
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1.5">
                Téléphone professionnel
              </label>
              <input
                type="tel"
                value={settings.phone || ""}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1.5">
                E-mail de contact
              </label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm">
            <label className="font-semibold text-brun block mb-1.5">
              Description / Bio de présentation
            </label>
            <textarea
              rows={3}
              value={settings.bio || ""}
              onChange={(e) =>
                setSettings({ ...settings, bio: e.target.value })
              }
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-base xl:text-sm text-brun"
            />
          </div>
        </div>

        {/* SECTION 2: DIRECT DEPOSIT ACCOUNTS (WERO, REVOLUT, PAYPAL) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-brun">
              <Wallet className="w-5 h-5 text-champagne-dark shrink-0" />
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Comptes d&apos;Acompte Directs (Wero, Revolut, PayPal)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Règlement en direct entre la cliente et vous (sans intermédiaire) depuis sa page de suivi.
                </p>
              </div>
            </div>
            <AdminLocationIllustration zone="paymentAccounts" compact />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs sm:text-sm">
            {/* Wero */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-brun text-sm">Wero / Paylib</span>
                <label className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white border border-stone-200 inline-flex items-center space-x-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={Boolean(paymentAccounts.weroEnabled)}
                    onChange={(e) =>
                      setPaymentAccounts((prev) => ({
                        ...prev,
                        weroEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-champagne"
                  />
                  <span>Actif</span>
                </label>
              </div>
              <div>
                <label className="font-semibold text-brun block mb-1.5 text-xs">
                  Numéro de téléphone Wero
                </label>
                <input
                  type="text"
                  name="weroPhone"
                  value={paymentAccounts.weroPhone}
                  onChange={(e) =>
                    setPaymentAccounts((prev) => ({
                      ...prev,
                      weroPhone: e.target.value,
                    }))
                  }
                  placeholder="07 67 66 38 69"
                  className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                />
                <span className="text-[11px] text-stone-500 block mt-1.5">
                  Copié par les clientes :{" "}
                  <strong className="font-mono">
                    {previewPaymentAccounts.weroDigits || "—"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Revolut */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-brun text-sm">Revolut</span>
                <label className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white border border-stone-200 inline-flex items-center space-x-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={Boolean(paymentAccounts.revolutEnabled)}
                    onChange={(e) =>
                      setPaymentAccounts((prev) => ({
                        ...prev,
                        revolutEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-champagne"
                  />
                  <span>Actif</span>
                </label>
              </div>
              <div>
                <label className="font-semibold text-brun block mb-1.5 text-xs">
                  Revtag ou lien revolut.me
                </label>
                <input
                  type="text"
                  name="revolutTag"
                  value={paymentAccounts.revolutTag}
                  onChange={(e) =>
                    setPaymentAccounts((prev) => ({
                      ...prev,
                      revolutTag: e.target.value,
                    }))
                  }
                  placeholder="@ydmcoiffure"
                  className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                />
                <span className="text-[11px] text-stone-500 block mt-1.5 break-all">
                  Lien affiché :{" "}
                  <strong className="font-mono">
                    {previewPaymentAccounts.revolutUrl || "—"}
                  </strong>
                </span>
              </div>
            </div>

            {/* PayPal */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 md:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-brun text-sm">PayPal</span>
                <label className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white border border-stone-200 inline-flex items-center space-x-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={Boolean(paymentAccounts.paypalEnabled)}
                    onChange={(e) =>
                      setPaymentAccounts((prev) => ({
                        ...prev,
                        paypalEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-champagne"
                  />
                  <span>Actif</span>
                </label>
              </div>
              <div>
                <label className="font-semibold text-brun block mb-1.5 text-xs">
                  Identifiant ou lien paypal.me
                </label>
                <input
                  type="text"
                  name="paypalHandle"
                  value={paymentAccounts.paypalHandle}
                  onChange={(e) =>
                    setPaymentAccounts((prev) => ({
                      ...prev,
                      paypalHandle: e.target.value,
                    }))
                  }
                  placeholder="ydmcoiffure"
                  className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                />
                <span className="text-[11px] text-stone-500 block mt-1.5 break-all">
                  Lien affiché :{" "}
                  <strong className="font-mono">
                    {previewPaymentAccounts.paypalBaseUrl
                      ? `${previewPaymentAccounts.paypalBaseUrl}/${settings.depositAmount ?? 10}EUR`
                      : "—"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONFIDENTIAL ADDRESS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-brun">
              <MapPin className="w-5 h-5 text-champagne-dark shrink-0" />
              <h2 className="font-serif text-xl font-bold">
                Adresse Personnelle Confidentielle
              </h2>
            </div>
            <AdminLocationIllustration zone="addressPrivate" compact />
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Sécurité & Confidentialité :</strong> Ces informations ne sont JAMAIS affichées publiquement sur le site. Elles sont transmises uniquement dans l&apos;e-mail de confirmation après réception effective du paiement de l&apos;acompte.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="sm:col-span-2">
              <label className="font-semibold text-brun block mb-1.5">
                Rue & Numéro
              </label>
              <input
                type="text"
                value={settings.homeAddress?.street || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homeAddress: {
                      ...settings.homeAddress,
                      street: e.target.value,
                    },
                  })
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1.5">
                Code Postal & Ville
              </label>
              <input
                type="text"
                value={postalCityInput}
                onChange={(e) => setPostalCityInput(e.target.value)}
                placeholder="85000 La Roche-sur-Yon"
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm">
            <label className="font-semibold text-brun block mb-1.5">
              Instructions détaillées d&apos;accès (Interphone, étage, digicode...)
            </label>
            <textarea
              rows={2}
              value={settings.homeAddress?.accessNotes || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homeAddress: {
                    ...settings.homeAddress,
                    accessNotes: e.target.value,
                  },
                })
              }
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-base xl:text-sm text-brun"
            />
          </div>
        </div>

        {/* SECTION 3: BOOKING RULES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5 text-xs sm:text-sm">
          <h2 className="font-serif text-xl font-bold text-brun">
            Règles de Réservation & Délais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-brun block mb-1.5">
                Délai minimum avant rdv (heures)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={numInputs.minNoticeHours}
                onChange={(e) =>
                  setNumInputs((prev) => ({
                    ...prev,
                    minNoticeHours: e.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne"
              />
              <span className="text-[11px] text-stone-400 block mt-1">
                Pas de réservation à moins de X heures
              </span>
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1.5">
                Horizon de réservation (jours)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={numInputs.maxDaysInAdvance}
                onChange={(e) =>
                  setNumInputs((prev) => ({
                    ...prev,
                    maxDaysInAdvance: e.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne"
              />
              <span className="text-[11px] text-stone-400 block mt-1">
                Planning ouvert sur X jours dans le futur
              </span>
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1.5">
                Délai de paiement d&apos;acompte (heures)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={numInputs.paymentHoldHours}
                onChange={(e) =>
                  setNumInputs((prev) => ({
                    ...prev,
                    paymentHoldHours: e.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne"
              />
              <span className="text-[11px] text-stone-400 block mt-1">
                Temps accordé pour régler l&apos;acompte
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-brun block mb-1.5">
              Texte de la politique d&apos;annulation
            </label>
            <textarea
              rows={3}
              value={settings.cancellationPolicyText || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cancellationPolicyText: e.target.value,
                })
              }
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-base xl:text-sm text-brun"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-8 py-3.5 rounded-full font-semibold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-champagne" />
            <span>{submitting ? "Enregistrement..." : "Enregistrer tous les paramètres"}</span>
          </button>
        </div>
      </form>

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
              Modifications des paramètres non enregistrées.
            </span>
            <button
              type="submit"
              form="admin-settings-form"
              disabled={submitting}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center space-x-2 bg-champagne hover:bg-champagne-light text-brun-dark px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Enregistrement..." : "Enregistrer maintenant"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
