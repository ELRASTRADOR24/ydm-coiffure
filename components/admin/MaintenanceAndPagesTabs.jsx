"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Power,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { DEFAULT_MAINTENANCE } from "@/lib/siteContent";
import {
  ToggleVisibilityButton,
  SectionCard,
  TextField,
} from "./CmsControls";

export function MaintenanceTab({
  maintenance,
  onChangeMaintenance,
  onToggleEmergency,
  togglingEmergency,
  onResetDefaults,
}) {
  const isEnabled = Boolean(maintenance.enabled);

  return (
    <div className="space-y-6">
      {/* Carte Bouton de Secours Instantané */}
      <div
        className={`rounded-2xl border-2 p-6 sm:p-8 shadow-sm transition-all ${
          isEnabled
            ? "bg-red-50 border-red-400"
            : "bg-white border-stone-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-sm font-bold ${
                  isEnabled
                    ? "bg-red-600 text-white"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                {isEnabled ? (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>MODE MAINTENANCE ACTIF (Site bloqué au public)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>SITE EN LIGNE (Mode normal)</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-brun pt-1">
              Bouton de Secours : Page de Maintenance
            </h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
              Activez ce mode en un clic si vous rencontrez un gros bug ou devez effectuer une grosse mise à jour. Toutes les pages publiques et les réservations seront immédiatement remplacées par l&apos;écran de maintenance ci-dessous, mais{" "}
              <strong>vous gardez toujours accès à votre espace d&apos;administration</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              disabled={togglingEmergency}
              onClick={() => onToggleEmergency(!isEnabled)}
              className={`inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl text-sm sm:text-base font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 ${
                isEnabled
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {togglingEmergency ? (
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              ) : (
                <Power className="w-5 h-5 shrink-0" />
              )}
              <span>
                {togglingEmergency
                  ? "Mise à jour..."
                  : isEnabled
                  ? "Désactiver la maintenance (Remettre en ligne)"
                  : "Activer la maintenance maintenant"}
              </span>
            </button>

            <a
              href="/?preview_maintenance=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-brun border border-stone-300 text-sm font-semibold transition-colors"
            >
              <span>Prévisualiser l&apos;écran de maintenance</span>
              <ExternalLink className="w-4 h-4 text-champagne-dark shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Personnalisation des textes de maintenance */}
      <SectionCard
        title="Personnaliser le message de maintenance"
        description="Modifiez les textes affichés aux visiteuses lorsque le mode maintenance est activé (n'oubliez pas d'enregistrer en haut ou en bas si vous modifiez ces textes)."
        visible={true}
        onReset={onResetDefaults}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Badge d'état (en haut de la carte)"
            value={maintenance.badge}
            onChange={(val) =>
              onChangeMaintenance({ ...maintenance, badge: val })
            }
          />
          <TextField
            label="Information sur le retour"
            value={maintenance.estimatedReturn}
            onChange={(val) =>
              onChangeMaintenance({ ...maintenance, estimatedReturn: val })
            }
          />
        </div>

        <TextField
          label="Grand titre principal"
          value={maintenance.title}
          onChange={(val) => onChangeMaintenance({ ...maintenance, title: val })}
        />

        <TextField
          label="Sous-titre"
          value={maintenance.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeMaintenance({ ...maintenance, subtitle: val })
          }
        />

        <TextField
          label="Message d'explication pour vos clientes"
          value={maintenance.message}
          multiline
          rows={3}
          onChange={(val) =>
            onChangeMaintenance({ ...maintenance, message: val })
          }
        />

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-bold text-brun">
                Bouton de contact Instagram sur l&apos;écran de maintenance
              </h4>
              <p className="text-sm text-stone-600">
                Permet aux clientes qui ont une urgence de vous écrire sur Instagram même pendant la maintenance.
              </p>
            </div>
            <ToggleVisibilityButton
              visible={maintenance.showInstagram}
              visibleLabel="Bouton Instagram affiché"
              hiddenLabel="Bouton Instagram masqué"
              onToggle={() =>
                onChangeMaintenance({
                  ...maintenance,
                  showInstagram: maintenance.showInstagram === false ? true : false,
                })
              }
            />
          </div>

          <TextField
            label="Note au-dessus du bouton Instagram"
            value={maintenance.ctaNote}
            multiline
            rows={2}
            onChange={(val) =>
              onChangeMaintenance({ ...maintenance, ctaNote: val })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Identifiant Instagram (avec ou sans @)"
              value={maintenance.instagramHandle}
              onChange={(val) =>
                onChangeMaintenance({ ...maintenance, instagramHandle: val })
              }
            />
            <TextField
              label="Texte du bouton Instagram"
              value={maintenance.instagramLabel}
              onChange={(val) =>
                onChangeMaintenance({ ...maintenance, instagramLabel: val })
              }
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-brun">
              Lien discret &laquo; Espace Administrateur &raquo; en bas de la page
            </h4>
            <p className="text-sm text-stone-600">
              Vous pouvez masquer ce lien pour encore plus de discrétion (l&apos;adresse /admin/login fonctionnera toujours).
            </p>
          </div>
          <ToggleVisibilityButton
            visible={maintenance.showAdminLink}
            visibleLabel="Lien affiché"
            hiddenLabel="Lien masqué"
            onToggle={() =>
              onChangeMaintenance({
                ...maintenance,
                showAdminLink: maintenance.showAdminLink === false ? true : false,
              })
            }
          />
        </div>
      </SectionCard>
    </div>
  );
}

const PAGE_ENTRIES = [
  {
    key: "prestations",
    title: "Prestations & Tarifs",
    route: "/prestations",
    tabId: "services",
    description:
      "Liste des coiffures, tarifs par longueur, réduction étudiante et guide des longueurs.",
  },
  {
    key: "galerie",
    title: "Galerie de Réalisations",
    route: "/galerie",
    tabId: "gallery",
    description:
      "Portfolio des photos et vidéos de coiffures. Si masquée, disparaît aussi du menu.",
  },
  {
    key: "aPropos",
    title: "À propos de moi",
    route: "/a-propos",
    tabId: "about",
    description:
      "Votre histoire personnelle, portrait photo et vos engagements qualité.",
  },
  {
    key: "contact",
    title: "Contact & Informations",
    route: "/contact",
    tabId: "contact",
    description:
      "Ville de La Roche-sur-Yon, disponibilités, support Instagram et résumé des règles.",
  },
  {
    key: "reglement",
    title: "Règlement Intérieur & Conditions",
    route: "/conditions-reservation",
    tabId: "rules",
    description:
      "Acompte de 10 €, retards, annulation, préparation des cheveux et paiements.",
  },
  {
    key: "mentionsLegales",
    title: "Mentions Légales",
    route: "/mentions-legales",
    tabId: "legal",
    description: "Informations légales de l'entreprise, responsable et hébergeur.",
  },
  {
    key: "confidentialite",
    title: "Politique de Confidentialité (RGPD)",
    route: "/politique-confidentialite",
    tabId: "privacy",
    description: "Utilisation des données personnelles des clientes et paiements Stripe.",
  },
  {
    key: "reserver",
    title: "Prise de Rendez-vous en ligne",
    route: "/reserver",
    tabId: "booking",
    description:
      "Tunnel de réservation en ligne. Si masquée, les boutons Réserver sont aussi retirés des menus.",
  },
];

export function PagesVisibilityTab({
  pageVis,
  onChangePageVis,
  hiddenPageNotice,
  onChangeHiddenPageNotice,
  onNavigateTab,
  onResetNotice,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
            Afficher ou Masquer chaque page du site
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Lorsqu&apos;une page est masquée, ses liens disparaissent automatiquement du menu et du pied de page, et ses visiteuses voient un message d&apos;information courtois à la place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAGE_ENTRIES.map((page) => {
            const isShown = pageVis[page.key] !== false;
            return (
              <div
                key={page.key}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 transition-all ${
                  isShown
                    ? "bg-stone-50 border-stone-200"
                    : "bg-stone-100 border-stone-300 opacity-85"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-brun">
                      {page.title}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-600">
                      {page.route}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {page.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-stone-200">
                  <ToggleVisibilityButton
                    visible={isShown}
                    visibleLabel="Page active"
                    hiddenLabel="Page masquée"
                    onToggle={() =>
                      onChangePageVis({
                        ...pageVis,
                        [page.key]: !isShown,
                      })
                    }
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab(page.tabId)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-champagne-light text-brun border border-stone-300 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-champagne-dark" />
                      <span>Modifier</span>
                    </button>

                    <a
                      href={page.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-sm font-semibold transition-colors"
                      title={`Ouvrir ${page.route} dans un nouvel onglet`}
                    >
                      <span>Voir</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message affiché lorsqu'une page est masquée */}
      <SectionCard
        title="Message affiché quand une page est masquée"
        description="Si une cliente ouvre directement l'adresse d'une page que vous avez masquée, voici le message qu'elle verra."
        visible={true}
        onReset={onResetNotice}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Sur-titre"
            value={hiddenPageNotice.eyebrow}
            onChange={(val) =>
              onChangeHiddenPageNotice({ ...hiddenPageNotice, eyebrow: val })
            }
          />
          <TextField
            label="Texte du bouton de retour"
            value={hiddenPageNotice.buttonText}
            onChange={(val) =>
              onChangeHiddenPageNotice({ ...hiddenPageNotice, buttonText: val })
            }
          />
        </div>
        <TextField
          label="Titre du message"
          value={hiddenPageNotice.title}
          onChange={(val) =>
            onChangeHiddenPageNotice({ ...hiddenPageNotice, title: val })
          }
        />
        <TextField
          label="Texte d'explication"
          value={hiddenPageNotice.message}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeHiddenPageNotice({ ...hiddenPageNotice, message: val })
          }
        />
      </SectionCard>
    </div>
  );
}
