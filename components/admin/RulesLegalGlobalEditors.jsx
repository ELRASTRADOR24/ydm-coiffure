"use client";

import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  ToggleVisibilityButton,
  SectionCard,
  TextField,
  RichArticleListEditor,
} from "./CmsControls";

/* ============================================================================
 * 1. PAGE RÈGLEMENT INTÉRIEUR (/conditions-reservation)
 * ============================================================================ */
export function RulesEditorTab({
  rulesPage,
  onChangeRulesPage,
  policies,
  onChangePolicies,
  onResetPage,
}) {
  const header = rulesPage.header;

  return (
    <div className="space-y-6">
      <SectionCard
        title="En-tête de la page Règlement Intérieur (/conditions-reservation)"
        description="Petit titre au-dessus et titre principal affichés tout en haut de la page Règlement."
        visible={header.visible}
        zone="pageHeader"
        defaultOpen={true}
        onToggleVisible={() =>
          onChangeRulesPage({
            ...rulesPage,
            header: { ...header, visible: header.visible === false },
          })
        }
        onReset={onResetPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Petit titre au-dessus"
            value={header.eyebrow}
            onChange={(val) =>
              onChangeRulesPage({
                ...rulesPage,
                header: { ...header, eyebrow: val },
              })
            }
          />
          <TextField
            label="Grand titre"
            value={header.title}
            onChange={(val) =>
              onChangeRulesPage({
                ...rulesPage,
                header: { ...header, title: val },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Articles du Règlement Intérieur"
        description="Ajoutez, modifiez, réorganisez, masquez ou supprimez chaque article du règlement."
        visible={true}
        zone="legal"
        defaultOpen={true}
      >
        <RichArticleListEditor
          articles={rulesPage.sections || []}
          onChange={(sections) =>
            onChangeRulesPage({ ...rulesPage, sections })
          }
          itemLabel="Article"
          addLabel="Ajouter un article au règlement"
        />
      </SectionCard>

      <SectionCard
        title="Blocs de texte supplémentaires sur /conditions-reservation"
        description="Ajoutez librement des encadrés complémentaires sous le règlement."
        visible={true}
        zone="legal"
      >
        <RichArticleListEditor
          articles={rulesPage.customBlocks || []}
          onChange={(blocks) =>
            onChangeRulesPage({ ...rulesPage, customBlocks: blocks })
          }
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc sur la page Règlement"
        />
      </SectionCard>

      <SectionCard
        title="Textes de rappel du tunnel de réservation"
        description="Ces 3 textes apparaissent dans les résumés de réservation, pages de suivi et rappels clients."
        visible={true}
        zone="bookingFlow"
      >
        <TextField
          label="Politique d'acompte (rappel 10 € / 2h)"
          value={policies.depositPolicyText}
          multiline
          rows={3}
          onChange={(val) =>
            onChangePolicies({ ...policies, depositPolicyText: val })
          }
        />
        <TextField
          label="Politique de retards et d'annulation"
          value={policies.cancellationPolicyText}
          multiline
          rows={3}
          onChange={(val) =>
            onChangePolicies({ ...policies, cancellationPolicyText: val })
          }
        />
        <TextField
          label="Consignes de préparation avant rendez-vous"
          value={policies.preparationGuidelinesText}
          multiline
          rows={3}
          onChange={(val) =>
            onChangePolicies({ ...policies, preparationGuidelinesText: val })
          }
        />
      </SectionCard>
    </div>
  );
}

/* ============================================================================
 * 2. PAGE MENTIONS LÉGALES (/mentions-legales)
 * ============================================================================ */
export function LegalEditorTab({ legalPage, onChangeLegalPage, onResetPage }) {
  const header = legalPage.header;

  return (
    <div className="space-y-6">
      <SectionCard
        title="En-tête des Mentions Légales (/mentions-legales)"
        description="Titre principal et mention de date de mise à jour."
        visible={header.visible}
        zone="pageHeader"
        defaultOpen={true}
        onToggleVisible={() =>
          onChangeLegalPage({
            ...legalPage,
            header: { ...header, visible: header.visible === false },
          })
        }
        onReset={onResetPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Grand titre"
            value={header.title}
            onChange={(val) =>
              onChangeLegalPage({
                ...legalPage,
                header: { ...header, title: val },
              })
            }
          />
          <TextField
            label="Sous-titre (Date de mise à jour)"
            value={header.updatedLabel}
            onChange={(val) =>
              onChangeLegalPage({
                ...legalPage,
                header: { ...header, updatedLabel: val },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Articles des Mentions Légales"
        description="Modifiez, masquez ou supprimez n'importe quel paragraphe ou liste des mentions légales."
        visible={true}
        zone="legal"
        defaultOpen={true}
      >
        <RichArticleListEditor
          articles={legalPage.sections || []}
          onChange={(sections) =>
            onChangeLegalPage({ ...legalPage, sections })
          }
          itemLabel="Section légale"
          addLabel="Ajouter une section aux Mentions Légales"
        />
      </SectionCard>

      <SectionCard
        title="Blocs de texte supplémentaires sur /mentions-legales"
        description="Ajoutez librement des informations complémentaires."
        visible={true}
        zone="legal"
      >
        <RichArticleListEditor
          articles={legalPage.customBlocks || []}
          onChange={(blocks) =>
            onChangeLegalPage({ ...legalPage, customBlocks: blocks })
          }
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc sur /mentions-legales"
        />
      </SectionCard>
    </div>
  );
}

/* ============================================================================
 * 3. PAGE CONFIDENTIALITÉ & RGPD (/politique-confidentialite)
 * ============================================================================ */
export function PrivacyEditorTab({
  privacyPage,
  onChangePrivacyPage,
  onResetPage,
}) {
  const header = privacyPage.header;

  return (
    <div className="space-y-6">
      <SectionCard
        title="En-tête Politique de Confidentialité (/politique-confidentialite)"
        description="Titre principal et mention de conformité RGPD."
        visible={header.visible}
        zone="pageHeader"
        defaultOpen={true}
        onToggleVisible={() =>
          onChangePrivacyPage({
            ...privacyPage,
            header: { ...header, visible: header.visible === false },
          })
        }
        onReset={onResetPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Grand titre"
            value={header.title}
            onChange={(val) =>
              onChangePrivacyPage({
                ...privacyPage,
                header: { ...header, title: val },
              })
            }
          />
          <TextField
            label="Sous-titre (RGPD)"
            value={header.subtitleLabel}
            onChange={(val) =>
              onChangePrivacyPage({
                ...privacyPage,
                header: { ...header, subtitleLabel: val },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Articles Politique de Confidentialité & RGPD"
        description="Modifiez, masquez ou supprimez chaque section sur la gestion des données."
        visible={true}
        zone="legal"
        defaultOpen={true}
      >
        <RichArticleListEditor
          articles={privacyPage.sections || []}
          onChange={(sections) =>
            onChangePrivacyPage({ ...privacyPage, sections })
          }
          itemLabel="Section RGPD"
          addLabel="Ajouter une section RGPD"
          allowClosingParagraph={true}
        />
      </SectionCard>

      <SectionCard
        title="Blocs de texte supplémentaires sur /politique-confidentialite"
        description="Ajoutez librement d'autres clauses ou précisions."
        visible={true}
        zone="legal"
      >
        <RichArticleListEditor
          articles={privacyPage.customBlocks || []}
          onChange={(blocks) =>
            onChangePrivacyPage({ ...privacyPage, customBlocks: blocks })
          }
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc sur /politique-confidentialite"
        />
      </SectionCard>
    </div>
  );
}

/* ============================================================================
 * 4. MENU DU HAUT & PIED DE PAGE (Éléments communs à tout le site)
 * ============================================================================ */
export function GlobalEditorTab({
  globalContent,
  onChangeGlobal,
  onResetGlobal,
}) {
  const header = globalContent.header;
  const footer = globalContent.footer;
  const navLabels = header.navLabels || {};
  const condItems = Array.isArray(footer.conditionsItems)
    ? footer.conditionsItems
    : [];
  const linksLabels = footer.linksLabels || {};

  const updateHeader = (patch) =>
    onChangeGlobal({ ...globalContent, header: { ...header, ...patch } });
  const updateFooter = (patch) =>
    onChangeGlobal({ ...globalContent, footer: { ...footer, ...patch } });

  const moveCondition = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= condItems.length) return;
    const next = [...condItems];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    updateFooter({ conditionsItems: next });
  };

  return (
    <div className="space-y-6">
      {/* MENU DU HAUT */}
      <SectionCard
        title="Barre de Navigation du Haut (Menu & Logo)"
        description="Présente sur toutes les pages du site public."
        visible={header.visible}
        zone="navbar"
        defaultOpen={true}
        onToggleVisible={() =>
          updateHeader({ visible: header.visible === false })
        }
        onReset={onResetGlobal}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Nom principal à côté du logo"
            value={header.brandTitle}
            onChange={(val) => updateHeader({ brandTitle: val })}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brun">
                Sous-titre (Ville)
              </span>
              <ToggleVisibilityButton
                visible={header.brandSubtitleVisible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() =>
                  updateHeader({
                    brandSubtitleVisible: header.brandSubtitleVisible === false,
                  })
                }
              />
            </div>
            <TextField
              label="Texte du sous-titre"
              value={header.brandSubtitle}
              onChange={(val) => updateHeader({ brandSubtitle: val })}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-brun">
              Noms des liens dans le menu (effacez un nom pour retirer le lien)
            </span>
            <ToggleVisibilityButton
              visible={Boolean(header.showAProposInNav)}
              visibleLabel="À propos dans le menu du haut"
              hiddenLabel="À propos uniquement en bas"
              onToggle={() =>
                updateHeader({ showAProposInNav: !header.showAProposInNav })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              label="Lien Accueil"
              value={navLabels.accueil}
              onChange={(val) =>
                updateHeader({ navLabels: { ...navLabels, accueil: val } })
              }
            />
            <TextField
              label="Lien Prestations"
              value={navLabels.prestations}
              onChange={(val) =>
                updateHeader({
                  navLabels: { ...navLabels, prestations: val },
                })
              }
            />
            <TextField
              label="Lien Galerie"
              value={navLabels.galerie}
              onChange={(val) =>
                updateHeader({ navLabels: { ...navLabels, galerie: val } })
              }
            />
            <TextField
              label="Lien À propos (si activé)"
              value={navLabels.aPropos}
              onChange={(val) =>
                updateHeader({ navLabels: { ...navLabels, aPropos: val } })
              }
            />
            <TextField
              label="Lien Contact"
              value={navLabels.contact}
              onChange={(val) =>
                updateHeader({ navLabels: { ...navLabels, contact: val } })
              }
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-brun">
              Bouton &laquo; Demander un rdv &raquo; dans le menu
            </span>
            <ToggleVisibilityButton
              visible={header.ctaVisible}
              visibleLabel="Bouton affiché"
              hiddenLabel="Bouton masqué"
              onToggle={() =>
                updateHeader({ ctaVisible: header.ctaVisible === false })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Texte sur ordinateur"
              value={header.ctaText}
              onChange={(val) => updateHeader({ ctaText: val })}
            />
            <TextField
              label="Texte dans le menu mobile"
              value={header.mobileCtaText}
              onChange={(val) => updateHeader({ mobileCtaText: val })}
            />
          </div>
        </div>
      </SectionCard>

      {/* PIED DE PAGE */}
      <SectionCard
        title="Pied de Page (Footer en bas de toutes les pages)"
        description="Colonnes d'informations, conditions clés, liens légaux et signature."
        visible={footer.visible}
        zone="footer"
        onToggleVisible={() =>
          updateFooter({ visible: footer.visible === false })
        }
      >
        {/* Colonne 1 : Marque */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <h4 className="font-serif text-lg font-bold text-brun">
              Colonne 1 : Présentation du salon &amp; Instagram
            </h4>
            <ToggleVisibilityButton
              visible={footer.brandVisible}
              onToggle={() =>
                updateFooter({ brandVisible: footer.brandVisible === false })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Titre de marque"
              value={footer.brandTitle}
              onChange={(val) => updateFooter({ brandTitle: val })}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brun">Instagram</span>
                <ToggleVisibilityButton
                  visible={footer.instagramVisible}
                  visibleLabel="Affiché"
                  hiddenLabel="Masqué"
                  onToggle={() =>
                    updateFooter({
                      instagramVisible: footer.instagramVisible === false,
                    })
                  }
                />
              </div>
              <TextField
                label="Compte Instagram"
                value={footer.instagramHandle}
                onChange={(val) => updateFooter({ instagramHandle: val })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brun">
                Phrase de présentation (Notice)
              </span>
              <ToggleVisibilityButton
                visible={footer.noticeVisible}
                visibleLabel="Affichée"
                hiddenLabel="Masquée"
                onToggle={() =>
                  updateFooter({
                    noticeVisible: footer.noticeVisible === false,
                  })
                }
              />
            </div>
            <TextField
              label="Texte sous le logo"
              value={footer.noticeText}
              multiline
              rows={2}
              onChange={(val) => updateFooter({ noticeText: val })}
            />
          </div>
        </div>

        {/* Colonne 2 : Localisation */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <h4 className="font-serif text-lg font-bold text-brun">
              Colonne 2 : Localisation &amp; Confidentialité
            </h4>
            <ToggleVisibilityButton
              visible={footer.locationVisible}
              onToggle={() =>
                updateFooter({
                  locationVisible: footer.locationVisible === false,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Titre de la colonne"
              value={footer.locationTitle}
              onChange={(val) => updateFooter({ locationTitle: val })}
            />
            <TextField
              label="Ville affichée"
              value={footer.locationCity}
              onChange={(val) => updateFooter({ locationCity: val })}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brun">
                Encadré &laquo; Adresse privée &raquo;
              </span>
              <ToggleVisibilityButton
                visible={footer.privacyBoxVisible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() =>
                  updateFooter({
                    privacyBoxVisible: footer.privacyBoxVisible === false,
                  })
                }
              />
            </div>
            <TextField
              label="Titre de l'encadré"
              value={footer.privacyBoxTitle}
              onChange={(val) => updateFooter({ privacyBoxTitle: val })}
            />
            <TextField
              label="Texte de l'encadré"
              value={footer.privacyBoxText}
              multiline
              rows={2}
              onChange={(val) => updateFooter({ privacyBoxText: val })}
            />
          </div>
        </div>

        {/* Colonne 3 : Conditions Clés */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <h4 className="font-serif text-lg font-bold text-brun">
              Colonne 3 : Liste des Conditions Clés
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleVisibilityButton
                visible={footer.conditionsVisible}
                onToggle={() =>
                  updateFooter({
                    conditionsVisible: footer.conditionsVisible === false,
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  updateFooter({
                    conditionsItems: [
                      ...condItems,
                      { text: "Nouvelle condition", visible: true },
                    ],
                  })
                }
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4 text-champagne" />
                <span>Ajouter une ligne</span>
              </button>
            </div>
          </div>

          <TextField
            label="Titre de la colonne"
            value={footer.conditionsTitle}
            onChange={(val) => updateFooter({ conditionsTitle: val })}
          />

          <div className="space-y-3">
            {condItems.map((cond, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-stone-200 flex flex-col md:flex-row md:items-center gap-2.5"
              >
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveCondition(idx, "up")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-stone-50 border border-stone-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === condItems.length - 1}
                    onClick={() => moveCondition(idx, "down")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-stone-50 border border-stone-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={cond.text || ""}
                  onChange={(e) => {
                    const next = condItems.map((it, i) =>
                      i === idx ? { ...it, text: e.target.value } : it
                    );
                    updateFooter({ conditionsItems: next });
                  }}
                  className="flex-1 min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-base xl:text-sm text-brun"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <ToggleVisibilityButton
                    visible={cond.visible}
                    visibleLabel="Affichée"
                    hiddenLabel="Masquée"
                    onToggle={() => {
                      const next = condItems.map((it, i) =>
                        i === idx ? { ...it, visible: it.visible === false } : it
                      );
                      updateFooter({ conditionsItems: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateFooter({
                        conditionsItems: condItems.filter((_, i) => i !== idx),
                      })
                    }
                    className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne 4 : Salon & Support */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <h4 className="font-serif text-lg font-bold text-brun">
              Colonne 4 : Salon &amp; Support Client
            </h4>
            <ToggleVisibilityButton
              visible={footer.contactVisible}
              onToggle={() =>
                updateFooter({
                  contactVisible: footer.contactVisible === false,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Titre de la colonne"
              value={footer.contactTitle}
              onChange={(val) => updateFooter({ contactTitle: val })}
            />
            <TextField
              label="Ligne horaires"
              value={footer.hoursText}
              onChange={(val) => updateFooter({ hoursText: val })}
            />
          </div>
          <TextField
            label="Libellé lien support Instagram"
            value={footer.supportLabel}
            onChange={(val) => updateFooter({ supportLabel: val })}
          />
          <TextField
            label="Note d'information sous le support"
            value={footer.supportNote}
            multiline
            rows={2}
            onChange={(val) => updateFooter({ supportNote: val })}
          />
        </div>

        {/* Barre tout en bas + Liens légaux + Signature */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <h4 className="font-serif text-lg font-bold text-brun">
              Barre tout en bas (Copyright &amp; Liens des pages)
            </h4>
            <ToggleVisibilityButton
              visible={footer.bottomBarVisible}
              onToggle={() =>
                updateFooter({
                  bottomBarVisible: footer.bottomBarVisible === false,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Texte Copyright (après © année)"
              value={footer.copyrightText}
              onChange={(val) => updateFooter({ copyrightText: val })}
            />
            <div className="flex items-end justify-between p-3.5 rounded-xl bg-white border border-stone-200">
              <span className="text-sm font-bold text-brun">
                Lien &laquo; Espace Pro &raquo;
              </span>
              <ToggleVisibilityButton
                visible={footer.adminLinkVisible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() =>
                  updateFooter({
                    adminLinkVisible: footer.adminLinkVisible === false,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              label="Nom lien À propos"
              value={linksLabels.aPropos}
              onChange={(val) =>
                updateFooter({ linksLabels: { ...linksLabels, aPropos: val } })
              }
            />
            <TextField
              label="Nom lien Mentions Légales"
              value={linksLabels.mentionsLegales}
              onChange={(val) =>
                updateFooter({
                  linksLabels: { ...linksLabels, mentionsLegales: val },
                })
              }
            />
            <TextField
              label="Nom lien Confidentialité"
              value={linksLabels.confidentialite}
              onChange={(val) =>
                updateFooter({
                  linksLabels: { ...linksLabels, confidentialite: val },
                })
              }
            />
            <TextField
              label="Nom lien Règlement Intérieur"
              value={linksLabels.reglement}
              onChange={(val) =>
                updateFooter({
                  linksLabels: { ...linksLabels, reglement: val },
                })
              }
            />
            <TextField
              label="Nom lien Espace Pro"
              value={linksLabels.admin}
              onChange={(val) =>
                updateFooter({ linksLabels: { ...linksLabels, admin: val } })
              }
            />
          </div>

          {/* Signature créateur */}
          <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brun">
                Ligne signature tout en bas du pied de page
              </span>
              <ToggleVisibilityButton
                visible={footer.creatorSignatureVisible}
                visibleLabel="Affichée"
                hiddenLabel="Masquée"
                onToggle={() =>
                  updateFooter({
                    creatorSignatureVisible:
                      footer.creatorSignatureVisible === false,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextField
                label="Préfixe (ex : Site créé par)"
                value={footer.creatorPrefix}
                onChange={(val) => updateFooter({ creatorPrefix: val })}
              />
              <TextField
                label="Nom"
                value={footer.creatorName}
                onChange={(val) => updateFooter({ creatorName: val })}
              />
              <TextField
                label="Lien portfolio (optionnel)"
                value={footer.creatorUrl}
                onChange={(val) => updateFooter({ creatorUrl: val })}
              />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ============================================================================
 * 5. PAGE RÉSERVATION (/reserver)
 * ============================================================================ */
export function BookingEditorTab({
  bookingPage,
  onChangeBookingPage,
  isReserverVisible,
  onToggleReserverVisible,
  onResetBooking,
}) {
  const intro = bookingPage.intro || {};

  return (
    <div className="space-y-6">
      <SectionCard
        title="Accès au Tunnel de Réservation en Ligne (/reserver)"
        description="Contrôlez si les clientes peuvent réserver en ligne ou si la page est temporairement masquée."
        visible={isReserverVisible}
        zone="bookingFlow"
        defaultOpen={true}
        onToggleVisible={onToggleReserverVisible}
      >
        <p className="text-sm text-stone-700 leading-relaxed">
          Si vous masquez cette page, tous les boutons &laquo; Réserver &raquo; et &laquo; Demander un rdv &raquo; du menu et des pages publiques sont automatiquement retirés.
        </p>
      </SectionCard>

      <SectionCard
        title="Bannière d'introduction au-dessus de l'assistant de réservation"
        description="Par défaut masquée pour garder l'écran épuré ; activez-la si vous souhaitez ajouter une annonce ou des consignes tout en haut de /reserver."
        visible={Boolean(intro.visible)}
        zone="pageHeader"
        onToggleVisible={() =>
          onChangeBookingPage({
            ...bookingPage,
            intro: { ...intro, visible: !intro.visible },
          })
        }
        onReset={onResetBooking}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Petit titre au-dessus"
            value={intro.eyebrow}
            onChange={(val) =>
              onChangeBookingPage({
                ...bookingPage,
                intro: { ...intro, eyebrow: val },
              })
            }
          />
          <TextField
            label="Titre principal"
            value={intro.title}
            onChange={(val) =>
              onChangeBookingPage({
                ...bookingPage,
                intro: { ...intro, title: val },
              })
            }
          />
        </div>
        <TextField
          label="Texte descriptif / Annonce importante"
          value={intro.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeBookingPage({
              ...bookingPage,
              intro: { ...intro, subtitle: val },
            })
          }
        />
      </SectionCard>
    </div>
  );
}
