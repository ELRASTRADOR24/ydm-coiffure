"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Save,
  ShieldAlert,
  Sparkles,
  MapPin,
  Clock,
  Settings,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

export default function AdminSettingsView({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
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
    <div className="space-y-8 max-w-4xl">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs font-medium animate-fadeIn">
          <Sparkles className="w-4 h-4 text-champagne" />
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
            Éditeur Complet, Cartes Mail &amp; Mode Maintenance
          </span>
          <h3 className="font-serif text-lg font-bold text-brun">
            Modifier les textes du site ou la carte des e-mails Gmail ?
          </h3>
          <p className="text-sm text-stone-600">
            Tout le contenu du site et le Studio Cartes Mail (couleurs, polices, logo, cadres style Google Docs) sont accessibles en 1 clic.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/admin/emails"
            className="inline-flex items-center space-x-2 bg-white hover:bg-champagne-light text-brun border-2 border-stone-300 hover:border-champagne px-4 py-3 rounded-xl text-sm font-bold shrink-0 transition-colors"
          >
            <Mail className="w-4 h-4 text-champagne-dark" />
            <span>Modifier les cartes Mail</span>
          </Link>
          <Link
            href="/admin/site-editor"
            className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-5 py-3 rounded-xl text-sm font-bold shrink-0 transition-colors"
          >
            <span>Ouvrir l&apos;éditeur du site</span>
            <ArrowRight className="w-4 h-4 text-champagne" />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: PUBLIC IDENTITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-brun">
            Profil & Coordonnées Publiques
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-brun block mb-1">
                Nom du Salon
              </label>
              <input
                type="text"
                value={settings.salonName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, salonName: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Nom de la Coiffeuse
              </label>
              <input
                type="text"
                value={settings.braiderName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, braiderName: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Téléphone professionnel
              </label>
              <input
                type="text"
                value={settings.phone || ""}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                E-mail de contact
              </label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-brun block mb-1">
              Description / Bio de présentation
            </label>
            <textarea
              rows={3}
              value={settings.bio || ""}
              onChange={(e) =>
                setSettings({ ...settings, bio: e.target.value })
              }
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
            />
          </div>
        </div>

        {/* SECTION 2: CONFIDENTIAL ADDRESS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 text-brun">
            <MapPin className="w-5 h-5 text-champagne-dark" />
            <h2 className="font-serif text-xl font-bold">
              Adresse Personnelle Confidentielle
            </h2>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Sécurité & Confidentialité :</strong> Ces informations ne sont JAMAIS affichées publiquement sur le site. Elles sont transmises uniquement dans l'e-mail de confirmation après réception effective du paiement de l'acompte.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-brun block mb-1">
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
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Code Postal & Ville
              </label>
              <input
                type="text"
                value={`${settings.homeAddress?.postalCode || "85000"} ${settings.homeAddress?.city || "La Roche-sur-Yon"}`}
                onChange={(e) => {
                  const parts = e.target.value.split(" ");
                  const cp = parts[0] || "";
                  const city = parts.slice(1).join(" ") || "";
                  setSettings({
                    ...settings,
                    homeAddress: {
                      ...settings.homeAddress,
                      postalCode: cp,
                      city: city,
                    },
                  });
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-brun block mb-1">
              Instructions détaillées d'accès (Interphone, étage, digicode...)
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
            />
          </div>
        </div>

        {/* SECTION 3: BOOKING RULES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5 text-xs">
          <h2 className="font-serif text-xl font-bold text-brun">
            Règles de Réservation & Délais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-brun block mb-1">
                Délai minimum avant rdv (heures)
              </label>
              <input
                type="number"
                min="0"
                value={settings.minNoticeHours ?? 24}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minNoticeHours: Number(e.target.value),
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
              <span className="text-[10px] text-stone-400">
                Pas de réservation à moins de X heures
              </span>
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Horizon de réservation (jours)
              </label>
              <input
                type="number"
                min="7"
                max="120"
                value={settings.maxDaysInAdvance ?? 60}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxDaysInAdvance: Number(e.target.value),
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
              <span className="text-[10px] text-stone-400">
                Planning ouvert sur X jours dans le futur
              </span>
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Délai de paiement d'acompte (heures)
              </label>
              <input
                type="number"
                min="1"
                max="72"
                value={settings.paymentHoldHours ?? 5}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paymentHoldHours: Number(e.target.value),
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
              />
              <span className="text-[10px] text-stone-400">
                Temps accordé pour régler l'acompte
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-brun block mb-1">
              Texte de la politique d'annulation
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-8 py-3.5 rounded-full font-semibold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-champagne" />
            <span>{submitting ? "Enregistrement..." : "Enregistrer tous les paramètres"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
