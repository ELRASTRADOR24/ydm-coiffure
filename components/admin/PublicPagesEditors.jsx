"use client";

import Link from "next/link";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  ArrowRight,
  Scissors,
} from "lucide-react";
import {
  ToggleVisibilityButton,
  SectionCard,
  TextField,
  ImageSelectorField,
  RichArticleListEditor,
} from "./CmsControls";

/* ============================================================================
 * 1. PAGE D'ACCUEIL
 * ============================================================================ */
export function HomeEditorTab({
  home,
  onChangeHome,
  onNavigateTab,
  onResetPage,
  onToast,
}) {
  const hero = home.hero;
  const popular = home.popularServices;
  const lengthSec = home.lengthGuideSection;
  const gallerySec = home.galleryPreviewSection;
  const faqSec = home.faqSection;
  const finalCta = home.finalCta;

  const updateHero = (patch) =>
    onChangeHome({ ...home, hero: { ...hero, ...patch } });

  const reassurance = Array.isArray(hero.reassuranceItems)
    ? hero.reassuranceItems
    : [];

  return (
    <div className="space-y-6">
      {/* HERO */}
      <SectionCard
        title="1. Bannière Principale (Haut de la page d'Accueil)"
        description="Premier bloc visible à l'arrivée sur le site : grand titre, description, photo principale et boutons."
        visible={hero.visible}
        zone="hero"
        defaultOpen={true}
        onToggleVisible={() => updateHero({ visible: hero.visible === false })}
        onReset={onResetPage}
      >
        <TextField
          label="Petit titre au-dessus (texte doré)"
          value={hero.eyebrow}
          onChange={(val) => updateHero({ eyebrow: val })}
        />
        <TextField
          label="Grand titre principal"
          value={hero.title}
          onChange={(val) => updateHero({ title: val })}
        />
        <TextField
          label="Texte de présentation sous le titre"
          value={hero.subtitle}
          multiline
          rows={3}
          onChange={(val) => updateHero({ subtitle: val })}
        />

        {/* Boutons CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-brun">
                Bouton principal (Réserver)
              </span>
              <ToggleVisibilityButton
                visible={hero.primaryCtaVisible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() =>
                  updateHero({
                    primaryCtaVisible: hero.primaryCtaVisible === false,
                  })
                }
              />
            </div>
            <TextField
              label="Texte du bouton"
              value={hero.primaryCtaText}
              onChange={(val) => updateHero({ primaryCtaText: val })}
            />
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-brun">
                Bouton secondaire (Prestations)
              </span>
              <ToggleVisibilityButton
                visible={hero.secondaryCtaVisible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() =>
                  updateHero({
                    secondaryCtaVisible: hero.secondaryCtaVisible === false,
                  })
                }
              />
            </div>
            <TextField
              label="Texte du bouton"
              value={hero.secondaryCtaText}
              onChange={(val) => updateHero({ secondaryCtaText: val })}
            />
          </div>
        </div>

        {/* Photo principale */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-brun">
              Photo principale de l&apos;accueil
            </span>
            <ToggleVisibilityButton
              visible={hero.imageVisible}
              visibleLabel="Photo affichée"
              hiddenLabel="Photo masquée"
              onToggle={() =>
                updateHero({ imageVisible: hero.imageVisible === false })
              }
            />
          </div>
          <ImageSelectorField
            label="Choisir ou importer la photo principale"
            imageUrl={hero.imageUrl}
            onChangeUrl={(val) => updateHero({ imageUrl: val })}
            onToast={onToast}
          />
          <TextField
            label="Description de l'image"
            value={hero.imageAlt}
            onChange={(val) => updateHero({ imageAlt: val })}
          />
        </div>

        {/* Repères de réassurance */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-brun">
                Petits repères sous les boutons (ex : La Roche-sur-Yon, Validation manuelle...)
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleVisibilityButton
                visible={hero.reassuranceVisible}
                visibleLabel="Ligne affichée"
                hiddenLabel="Ligne masquée"
                onToggle={() =>
                  updateHero({
                    reassuranceVisible: hero.reassuranceVisible === false,
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  updateHero({
                    reassuranceItems: [
                      ...reassurance,
                      { text: "Nouveau repère", visible: true },
                    ],
                  })
                }
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4 text-champagne" />
                <span>Ajouter un repère</span>
              </button>
            </div>
          </div>

          {reassurance.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-3 rounded-xl border border-stone-200"
            >
              <input
                type="text"
                value={item.text || ""}
                onChange={(e) => {
                  const next = reassurance.map((it, i) =>
                    i === idx ? { ...it, text: e.target.value } : it
                  );
                  updateHero({ reassuranceItems: next });
                }}
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-brun"
              />
              <ToggleVisibilityButton
                visible={item.visible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() => {
                  const next = reassurance.map((it, i) =>
                    i === idx ? { ...it, visible: it.visible === false } : it
                  );
                  updateHero({ reassuranceItems: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  updateHero({
                    reassuranceItems: reassurance.filter((_, i) => i !== idx),
                  })
                }
                className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* COIFFURES PHARES */}
      <SectionCard
        title="2. Section Nos Coiffures Phares"
        description="Affiche vos 3 premières prestations actives sur la page d'accueil."
        visible={popular.visible}
        zone="popularServices"
        onToggleVisible={() =>
          onChangeHome({
            ...home,
            popularServices: { ...popular, visible: popular.visible === false },
          })
        }
      >
        <div className="p-3.5 rounded-xl bg-champagne-light/40 border border-champagne/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-brun">
          <span>
            Les cartes coiffures affichées ici proviennent de votre catalogue Prestations.
          </span>
          <Link
            href="/admin/services"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 font-bold text-brun hover:bg-stone-50 shrink-0"
          >
            <Scissors className="w-4 h-4 text-champagne-dark" />
            <span>Modifier les coiffures &amp; prix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Petit titre au-dessus"
            value={popular.eyebrow}
            onChange={(val) =>
              onChangeHome({
                ...home,
                popularServices: { ...popular, eyebrow: val },
              })
            }
          />
          <TextField
            label="Grand titre"
            value={popular.title}
            onChange={(val) =>
              onChangeHome({
                ...home,
                popularServices: { ...popular, title: val },
              })
            }
          />
        </div>
        <TextField
          label="Sous-titre"
          value={popular.subtitle}
          onChange={(val) =>
            onChangeHome({
              ...home,
              popularServices: { ...popular, subtitle: val },
            })
          }
        />

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <TextField
              label="Texte du bouton sous les coiffures phares"
              value={popular.ctaText}
              onChange={(val) =>
                onChangeHome({
                  ...home,
                  popularServices: { ...popular, ctaText: val },
                })
              }
            />
          </div>
          <ToggleVisibilityButton
            visible={popular.ctaVisible}
            visibleLabel="Bouton affiché"
            hiddenLabel="Bouton masqué"
            onToggle={() =>
              onChangeHome({
                ...home,
                popularServices: {
                  ...popular,
                  ctaVisible: popular.ctaVisible === false,
                },
              })
            }
          />
        </div>
      </SectionCard>

      {/* GUIDE DES LONGUEURS SUR L'ACCUEIL */}
      <SectionCard
        title="3. Section Guide des Longueurs sur l'Accueil"
        description="Activez ou masquez le Guide des Longueurs sur la page d'accueil."
        visible={lengthSec.visible}
        zone="lengthGuide"
        onToggleVisible={() =>
          onChangeHome({
            ...home,
            lengthGuideSection: {
              ...lengthSec,
              visible: lengthSec.visible === false,
            },
          })
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-sm text-stone-700">
            Les textes et photos des 4 cartes (Court, Mi-long, Long, Extra-long) se modifient dans l&apos;onglet Prestations &amp; Longueurs.
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("services")}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brun text-creme text-sm font-semibold shrink-0 cursor-pointer"
          >
            <span>Modifier le Guide des Longueurs</span>
            <ArrowRight className="w-4 h-4 text-champagne" />
          </button>
        </div>
      </SectionCard>

      {/* APERCU GALERIE SUR L'ACCUEIL */}
      <SectionCard
        title="4. Section Aperçu de la Galerie sur l'Accueil"
        description="Présente vos réalisations récentes avec lien vers la galerie complète."
        visible={gallerySec.visible}
        zone="galleryPreview"
        onToggleVisible={() =>
          onChangeHome({
            ...home,
            galleryPreviewSection: {
              ...gallerySec,
              visible: gallerySec.visible === false,
            },
          })
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Petit titre au-dessus"
            value={gallerySec.eyebrow}
            onChange={(val) =>
              onChangeHome({
                ...home,
                galleryPreviewSection: { ...gallerySec, eyebrow: val },
              })
            }
          />
          <TextField
            label="Grand titre"
            value={gallerySec.title}
            onChange={(val) =>
              onChangeHome({
                ...home,
                galleryPreviewSection: { ...gallerySec, title: val },
              })
            }
          />
        </div>
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <TextField
              label="Texte du bouton vers la galerie complète"
              value={gallerySec.ctaText}
              onChange={(val) =>
                onChangeHome({
                  ...home,
                  galleryPreviewSection: { ...gallerySec, ctaText: val },
                })
              }
            />
          </div>
          <ToggleVisibilityButton
            visible={gallerySec.ctaVisible}
            visibleLabel="Bouton affiché"
            hiddenLabel="Bouton masqué"
            onToggle={() =>
              onChangeHome({
                ...home,
                galleryPreviewSection: {
                  ...gallerySec,
                  ctaVisible: gallerySec.ctaVisible === false,
                },
              })
            }
          />
        </div>
      </SectionCard>

      {/* RACCOURCI FAQ */}
      <SectionCard
        title="5. Section Questions & FAQ sur l'Accueil"
        description="Affiche vos questions/réponses sur l'accueil."
        visible={faqSec.visible}
        zone="faq"
        onToggleVisible={() =>
          onChangeHome({
            ...home,
            faqSection: { ...faqSec, visible: faqSec.visible === false },
          })
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-sm text-stone-700">
            Modifiez le titre, ajoutez, masquez ou supprimez les questions dans l&apos;onglet Questions &amp; FAQ.
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("faq")}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brun text-creme text-sm font-semibold shrink-0 cursor-pointer"
          >
            <span>Ouvrir l&apos;éditeur FAQ</span>
            <ArrowRight className="w-4 h-4 text-champagne" />
          </button>
        </div>
      </SectionCard>

      {/* BANDEAU FINAL */}
      <SectionCard
        title="6. Bandeau Final (Bas de la page d'Accueil)"
        description="Bandeau brun tout en bas de la page d'accueil invitant à prendre rendez-vous."
        visible={finalCta.visible}
        zone="finalCta"
        onToggleVisible={() =>
          onChangeHome({
            ...home,
            finalCta: { ...finalCta, visible: finalCta.visible === false },
          })
        }
      >
        <TextField
          label="Grand titre"
          value={finalCta.title}
          onChange={(val) =>
            onChangeHome({
              ...home,
              finalCta: { ...finalCta, title: val },
            })
          }
        />
        <TextField
          label="Texte descriptif"
          value={finalCta.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeHome({
              ...home,
              finalCta: { ...finalCta, subtitle: val },
            })
          }
        />
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <TextField
              label="Texte du bouton"
              value={finalCta.buttonText}
              onChange={(val) =>
                onChangeHome({
                  ...home,
                  finalCta: { ...finalCta, buttonText: val },
                })
              }
            />
          </div>
          <ToggleVisibilityButton
            visible={finalCta.buttonVisible}
            visibleLabel="Bouton affiché"
            hiddenLabel="Bouton masqué"
            onToggle={() =>
              onChangeHome({
                ...home,
                finalCta: {
                  ...finalCta,
                  buttonVisible: finalCta.buttonVisible === false,
                },
              })
            }
          />
        </div>
      </SectionCard>

      {/* BLOCS LIBRES */}
      <SectionCard
        title="7. Blocs de texte supplémentaires sur l'Accueil"
        description="Ajoutez librement autant d'encadrés d'information ou d'annonces que vous souhaitez sur votre page d'accueil."
        visible={true}
        zone="legal"
      >
        <RichArticleListEditor
          articles={home.customBlocks || []}
          onChange={(blocks) => onChangeHome({ ...home, customBlocks: blocks })}
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc sur l'Accueil"
        />
      </SectionCard>
    </div>
  );
}

/* ============================================================================
 * 2. PAGE PRESTATIONS & GUIDE DES LONGUEURS
 * ============================================================================ */
export function ServicesEditorTab({
  servicesPage,
  onChangeServicesPage,
  lengthGuide,
  onChangeLengthGuide,
  onResetPage,
  onToast,
}) {
  const header = servicesPage.header;
  const banner = servicesPage.keyRulesBanner;
  const promo = servicesPage.studentPromo;
  const bannerItems = Array.isArray(banner.items) ? banner.items : [];
  const lengthItems = Array.isArray(lengthGuide.items) ? lengthGuide.items : [];

  const moveBannerItem = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= bannerItems.length) return;
    const next = [...bannerItems];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onChangeServicesPage({
      ...servicesPage,
      keyRulesBanner: { ...banner, items: next },
    });
  };

  const moveLengthItem = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= lengthItems.length) return;
    const next = [...lengthItems];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onChangeLengthGuide({ ...lengthGuide, items: next });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-champagne-light/40 border border-champagne/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-brun font-medium">
          Pour ajouter, supprimer ou changer le tarif de chaque coiffure (Knotless, Fulani, Boho...), rendez-vous dans la page Prestations du menu de gauche.
        </p>
        <Link
          href="/admin/services"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brun text-creme text-sm font-bold shrink-0"
        >
          <Scissors className="w-4 h-4 text-champagne" />
          <span>Gérer les coiffures &amp; prix</span>
        </Link>
      </div>

      {/* Header */}
      <SectionCard
        title="En-tête de la page Prestations & Tarifs (/prestations)"
        description="Titre et présentation en haut de la carte des prestations."
        visible={header.visible}
        zone="pageHeader"
        defaultOpen={true}
        onToggleVisible={() =>
          onChangeServicesPage({
            ...servicesPage,
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
              onChangeServicesPage({
                ...servicesPage,
                header: { ...header, eyebrow: val },
              })
            }
          />
          <TextField
            label="Grand titre"
            value={header.title}
            onChange={(val) =>
              onChangeServicesPage({
                ...servicesPage,
                header: { ...header, title: val },
              })
            }
          />
        </div>
        <TextField
          label="Sous-titre explicatif"
          value={header.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeServicesPage({
              ...servicesPage,
              header: { ...header, subtitle: val },
            })
          }
        />
      </SectionCard>

      {/* Bannière des règles clés */}
      <SectionCard
        title="Bannière des règles clés (3 points en haut de page)"
        description="Bandeau blanc mettant en avant les informations principales avant les tarifs."
        visible={banner.visible}
        zone="legal"
        onToggleVisible={() =>
          onChangeServicesPage({
            ...servicesPage,
            keyRulesBanner: { ...banner, visible: banner.visible === false },
          })
        }
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onChangeServicesPage({
                ...servicesPage,
                keyRulesBanner: {
                  ...banner,
                  items: [
                    ...bannerItems,
                    { text: "Nouvelle information clé", visible: true },
                  ],
                },
              })
            }
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter un point clé</span>
          </button>
        </div>

        <div className="space-y-3">
          {bannerItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row md:items-center gap-3"
            >
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveBannerItem(idx, "up")}
                  className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 text-brun disabled:opacity-35 cursor-pointer"
                  title="Monter"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === bannerItems.length - 1}
                  onClick={() => moveBannerItem(idx, "down")}
                  className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 text-brun disabled:opacity-35 cursor-pointer"
                  title="Descendre"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.text || ""}
                onChange={(e) => {
                  const next = bannerItems.map((it, i) =>
                    i === idx ? { ...it, text: e.target.value } : it
                  );
                  onChangeServicesPage({
                    ...servicesPage,
                    keyRulesBanner: { ...banner, items: next },
                  });
                }}
                className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-brun"
              />
              <div className="flex items-center gap-2 shrink-0">
                <ToggleVisibilityButton
                  visible={item.visible}
                  visibleLabel="Affiché"
                  hiddenLabel="Masqué"
                  onToggle={() => {
                    const next = bannerItems.map((it, i) =>
                      i === idx ? { ...it, visible: it.visible === false } : it
                    );
                    onChangeServicesPage({
                      ...servicesPage,
                      keyRulesBanner: { ...banner, items: next },
                    });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    onChangeServicesPage({
                      ...servicesPage,
                      keyRulesBanner: {
                        ...banner,
                        items: bannerItems.filter((_, i) => i !== idx),
                      },
                    })
                  }
                  className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Offre Étudiante */}
      <SectionCard
        title="Encadré Tarif Étudiant (-5 €)"
        description="Bandeau promotionnel affiché au-dessus de la liste des prestations."
        visible={promo.visible}
        zone="popularServices"
        onToggleVisible={() =>
          onChangeServicesPage({
            ...servicesPage,
            studentPromo: { ...promo, visible: promo.visible === false },
          })
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Libellé en gras (ex : Tarif étudiante :)"
            value={promo.label}
            onChange={(val) =>
              onChangeServicesPage({
                ...servicesPage,
                studentPromo: { ...promo, label: val },
              })
            }
          />
          <TextField
            label="Badge à droite (ex : -5 € avec mèches)"
            value={promo.badge}
            onChange={(val) =>
              onChangeServicesPage({
                ...servicesPage,
                studentPromo: { ...promo, badge: val },
              })
            }
          />
        </div>
        <TextField
          label="Phrase complète de l'offre"
          value={promo.text}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeServicesPage({
              ...servicesPage,
              studentPromo: { ...promo, text: val },
            })
          }
        />
      </SectionCard>

      {/* Guide des Longueurs */}
      <SectionCard
        title="Guide des Longueurs (Repères visuels Court / Mi-long / Long / Extra-long)"
        description="Ce bloc apparaît sur l'Accueil et en bas de la page Prestations. Vous pouvez tout modifier, masquer ou supprimer."
        visible={lengthGuide.visible}
        zone="lengthGuide"
        onToggleVisible={() =>
          onChangeLengthGuide({
            ...lengthGuide,
            visible: lengthGuide.visible === false,
          })
        }
      >
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-semibold text-brun">
            Afficher ce Guide sur la page Prestations &amp; Tarifs :
          </span>
          <ToggleVisibilityButton
            visible={servicesPage.lengthGuideVisible}
            visibleLabel="Affiché sur /prestations"
            hiddenLabel="Masqué sur /prestations"
            onToggle={() =>
              onChangeServicesPage({
                ...servicesPage,
                lengthGuideVisible: servicesPage.lengthGuideVisible === false,
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Petit titre au-dessus"
            value={lengthGuide.eyebrow}
            onChange={(val) =>
              onChangeLengthGuide({ ...lengthGuide, eyebrow: val })
            }
          />
          <TextField
            label="Titre du Guide"
            value={lengthGuide.title}
            onChange={(val) =>
              onChangeLengthGuide({ ...lengthGuide, title: val })
            }
          />
        </div>
        <TextField
          label="Sous-titre du Guide"
          value={lengthGuide.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeLengthGuide({ ...lengthGuide, subtitle: val })
          }
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-bold text-brun">
            Cartes de longueur ({lengthItems.length})
          </span>
          <button
            type="button"
            onClick={() =>
              onChangeLengthGuide({
                ...lengthGuide,
                items: [
                  ...lengthItems,
                  {
                    id: `len_${Date.now()}`,
                    visible: true,
                    level: "Nouvelle longueur",
                    placement: "Zone du corps",
                    description: "Description de la longueur...",
                    tag: "Repère visuel",
                    image: "/guide-longueur-mi-long.jpg",
                    progress: "50%",
                    slug: "knotless-avec-meches",
                  },
                ],
              })
            }
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter une carte longueur</span>
          </button>
        </div>

        <div className="space-y-4">
          {lengthItems.map((card, idx) => (
            <div
              key={card.id || idx}
              className={`p-5 rounded-2xl border-2 space-y-4 ${
                card.visible !== false
                  ? "bg-stone-50 border-stone-200"
                  : "bg-stone-100 border-stone-300 opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-white border border-stone-300 text-sm font-bold text-brun">
                    Niveau #{idx + 1} : {card.level || "Sans nom"}
                  </span>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveLengthItem(idx, "up")}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>Monter</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === lengthItems.length - 1}
                    onClick={() => moveLengthItem(idx, "down")}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                    <span>Descendre</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ToggleVisibilityButton
                    visible={card.visible}
                    onToggle={() => {
                      const next = lengthItems.map((it, i) =>
                        i === idx ? { ...it, visible: it.visible === false } : it
                      );
                      onChangeLengthGuide({ ...lengthGuide, items: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChangeLengthGuide({
                        ...lengthGuide,
                        items: lengthItems.filter((_, i) => i !== idx),
                      })
                    }
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField
                  label="Nom (ex : Court, Mi-long)"
                  value={card.level}
                  onChange={(val) => {
                    const next = lengthItems.map((it, i) =>
                      i === idx ? { ...it, level: val } : it
                    );
                    onChangeLengthGuide({ ...lengthGuide, items: next });
                  }}
                />
                <TextField
                  label="Repère sur le corps"
                  value={card.placement}
                  onChange={(val) => {
                    const next = lengthItems.map((it, i) =>
                      i === idx ? { ...it, placement: val } : it
                    );
                    onChangeLengthGuide({ ...lengthGuide, items: next });
                  }}
                />
                <TextField
                  label="Badge sur l'image"
                  value={card.tag}
                  onChange={(val) => {
                    const next = lengthItems.map((it, i) =>
                      i === idx ? { ...it, tag: val } : it
                    );
                    onChangeLengthGuide({ ...lengthGuide, items: next });
                  }}
                />
              </div>

              <TextField
                label="Description"
                value={card.description}
                multiline
                rows={2}
                onChange={(val) => {
                  const next = lengthItems.map((it, i) =>
                    i === idx ? { ...it, description: val } : it
                  );
                  onChangeLengthGuide({ ...lengthGuide, items: next });
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Barre d'échelle (ex : 25%, 50%, 75%, 100%)"
                  value={card.progress}
                  onChange={(val) => {
                    const next = lengthItems.map((it, i) =>
                      i === idx ? { ...it, progress: val } : it
                    );
                    onChangeLengthGuide({ ...lengthGuide, items: next });
                  }}
                />
                <TextField
                  label="Prestation pré-sélectionnée au clic (slug)"
                  value={card.slug}
                  onChange={(val) => {
                    const next = lengthItems.map((it, i) =>
                      i === idx ? { ...it, slug: val } : it
                    );
                    onChangeLengthGuide({ ...lengthGuide, items: next });
                  }}
                />
              </div>

              <ImageSelectorField
                label="Illustration de cette longueur"
                imageUrl={card.image}
                onChangeUrl={(val) => {
                  const next = lengthItems.map((it, i) =>
                    i === idx ? { ...it, image: val } : it
                  );
                  onChangeLengthGuide({ ...lengthGuide, items: next });
                }}
                onToast={onToast}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Blocs libres */}
      <SectionCard
        title="Blocs de texte supplémentaires sur /prestations"
        description="Ajoutez des explications, conditions spéciales mèches ou annonces sur votre page tarifs."
        visible={true}
        zone="legal"
      >
        <RichArticleListEditor
          articles={servicesPage.customBlocks || []}
          onChange={(blocks) =>
            onChangeServicesPage({ ...servicesPage, customBlocks: blocks })
          }
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc sur /prestations"
        />
      </SectionCard>
    </div>
  );
}

/* ============================================================================
 * 3. PAGE À PROPOS DE MOI
 * ============================================================================ */
export function AboutEditorTab({ about, onChangeAbout, onResetPage, onToast }) {
  const header = about.header;
  const story = about.storyCard;
  const values = about.values;
  const paragraphs = Array.isArray(story.paragraphs) ? story.paragraphs : [];
  const cards = Array.isArray(values.cards) ? values.cards : [];

  const updateStory = (patch) =>
    onChangeAbout({ ...about, storyCard: { ...story, ...patch } });

  const moveParagraph = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= paragraphs.length) return;
    const next = [...paragraphs];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    updateStory({ paragraphs: next });
  };

  const moveCard = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onChangeAbout({ ...about, values: { ...values, cards: next } });
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="En-tête de la page À propos de moi (/a-propos)"
        description="Petit titre au-dessus, grand titre et phrase d'introduction."
        visible={header.visible}
        zone="pageHeader"
        defaultOpen={true}
        onToggleVisible={() =>
          onChangeAbout({
            ...about,
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
              onChangeAbout({ ...about, header: { ...header, eyebrow: val } })
            }
          />
          <TextField
            label="Grand titre"
            value={header.title}
            onChange={(val) =>
              onChangeAbout({ ...about, header: { ...header, title: val } })
            }
          />
        </div>
        <TextField
          label="Phrase d'accroche sous le titre"
          value={header.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeAbout({ ...about, header: { ...header, subtitle: val } })
          }
        />
      </SectionCard>

      <SectionCard
        title="Votre Photo Portrait & Récit Personnel"
        description="Modifiez votre photo, ajoutez/masquez/supprimez vos paragraphes et boutons."
        visible={story.visible}
        zone="hero"
        onToggleVisible={() =>
          updateStory({ visible: story.visible === false })
        }
      >
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-brun">Photo portrait</span>
            <ToggleVisibilityButton
              visible={story.imageVisible}
              visibleLabel="Photo affichée"
              hiddenLabel="Photo masquée"
              onToggle={() =>
                updateStory({ imageVisible: story.imageVisible === false })
              }
            />
          </div>
          <ImageSelectorField
            label="Image sur la page À propos"
            imageUrl={story.imageUrl}
            onChangeUrl={(val) => updateStory({ imageUrl: val })}
            onToast={onToast}
          />
          <TextField
            label="Description de la photo"
            value={story.imageAlt}
            onChange={(val) => updateStory({ imageAlt: val })}
          />
        </div>

        {/* Paragraphes */}
        <div className="space-y-3 pt-2 border-t border-stone-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-brun">
              Paragraphes de votre présentation ({paragraphs.length})
            </span>
            <button
              type="button"
              onClick={() =>
                updateStory({
                  paragraphs: [
                    ...paragraphs,
                    { visible: true, text: "Nouveau paragraphe..." },
                  ],
                })
              }
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-champagne" />
              <span>Ajouter un paragraphe</span>
            </button>
          </div>

          {paragraphs.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-brun">
                    Paragraphe #{idx + 1}
                  </span>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveParagraph(idx, "up")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 disabled:opacity-35 cursor-pointer"
                    title="Monter"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === paragraphs.length - 1}
                    onClick={() => moveParagraph(idx, "down")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 disabled:opacity-35 cursor-pointer"
                    title="Descendre"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleVisibilityButton
                    visible={p.visible}
                    onToggle={() => {
                      const next = paragraphs.map((it, i) =>
                        i === idx ? { ...it, visible: it.visible === false } : it
                      );
                      updateStory({ paragraphs: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateStory({
                        paragraphs: paragraphs.filter((_, i) => i !== idx),
                      })
                    }
                    className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>

              <TextField
                label="Texte du paragraphe"
                value={p.text}
                multiline
                rows={3}
                onChange={(val) => {
                  const next = paragraphs.map((it, i) =>
                    i === idx ? { ...it, text: val } : it
                  );
                  updateStory({ paragraphs: next });
                }}
              />
            </div>
          ))}
        </div>

        {/* Encadré mis en valeur */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-brun">
              Encadré crème mis en avant (organisation étudiante / créneaux)
            </span>
            <ToggleVisibilityButton
              visible={story.highlightBoxVisible}
              onToggle={() =>
                updateStory({
                  highlightBoxVisible: story.highlightBoxVisible === false,
                })
              }
            />
          </div>
          <TextField
            label="Texte de l'encadré"
            value={story.highlightText}
            multiline
            rows={2}
            onChange={(val) => updateStory({ highlightText: val })}
          />
        </div>

        {/* Boutons d'action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brun">
                Bouton 1 (Réservation)
              </span>
              <ToggleVisibilityButton
                visible={story.primaryCtaVisible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() =>
                  updateStory({
                    primaryCtaVisible: story.primaryCtaVisible === false,
                  })
                }
              />
            </div>
            <TextField
              label="Texte du bouton"
              value={story.primaryCtaText}
              onChange={(val) => updateStory({ primaryCtaText: val })}
            />
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brun">
                Bouton 2 (Prestations)
              </span>
              <ToggleVisibilityButton
                visible={story.secondaryCtaVisible}
                visibleLabel="Affiché"
                hiddenLabel="Masqué"
                onToggle={() =>
                  updateStory({
                    secondaryCtaVisible: story.secondaryCtaVisible === false,
                  })
                }
              />
            </div>
            <TextField
              label="Texte du bouton"
              value={story.secondaryCtaText}
              onChange={(val) => updateStory({ secondaryCtaText: val })}
            />
          </div>
        </div>
      </SectionCard>

      {/* Valeurs */}
      <SectionCard
        title="Cartes Valeurs & Engagements"
        description="Les 3 petites cartes (Cadre privé, Tarif étudiante, Finitions nettes...)."
        visible={values.visible}
        zone="popularServices"
        onToggleVisible={() =>
          onChangeAbout({
            ...about,
            values: { ...values, visible: values.visible === false },
          })
        }
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onChangeAbout({
                ...about,
                values: {
                  ...values,
                  cards: [
                    ...cards,
                    {
                      visible: true,
                      title: "Nouvel engagement",
                      description: "Description courte...",
                    },
                  ],
                },
              })
            }
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter une carte</span>
          </button>
        </div>

        <div className="space-y-4">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-brun">
                    Carte #{idx + 1}
                  </span>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveCard(idx, "up")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === cards.length - 1}
                    onClick={() => moveCard(idx, "down")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleVisibilityButton
                    visible={card.visible}
                    onToggle={() => {
                      const next = cards.map((c, i) =>
                        i === idx ? { ...c, visible: c.visible === false } : c
                      );
                      onChangeAbout({ ...about, values: { ...values, cards: next } });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChangeAbout({
                        ...about,
                        values: {
                          ...values,
                          cards: cards.filter((_, i) => i !== idx),
                        },
                      })
                    }
                    className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Titre"
                  value={card.title}
                  onChange={(val) => {
                    const next = cards.map((c, i) =>
                      i === idx ? { ...c, title: val } : c
                    );
                    onChangeAbout({ ...about, values: { ...values, cards: next } });
                  }}
                />
                <TextField
                  label="Description"
                  value={card.description}
                  onChange={(val) => {
                    const next = cards.map((c, i) =>
                      i === idx ? { ...c, description: val } : c
                    );
                    onChangeAbout({ ...about, values: { ...values, cards: next } });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Blocs libres */}
      <SectionCard
        title="Blocs de texte supplémentaires sur /a-propos"
        description="Ajoutez de nouvelles sections libres sous votre présentation."
        visible={true}
        zone="legal"
      >
        <RichArticleListEditor
          articles={about.customBlocks || []}
          onChange={(blocks) => onChangeAbout({ ...about, customBlocks: blocks })}
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc sur /a-propos"
        />
      </SectionCard>
    </div>
  );
}

/* ============================================================================
 * 4. PAGE CONTACT & INFORMATIONS
 * ============================================================================ */
export function ContactEditorTab({ contact, onChangeContact, onResetPage }) {
  const header = contact.header;
  const loc = contact.locationCard;
  const coords = contact.coordinatesCard;
  const rulesCard = contact.rulesCard;
  const rulesList = Array.isArray(rulesCard.rules) ? rulesCard.rules : [];

  const moveRule = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= rulesList.length) return;
    const next = [...rulesList];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onChangeContact({ ...contact, rulesCard: { ...rulesCard, rules: next } });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-sm text-amber-950">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Confidentialité :</strong> Votre vraie adresse (rue, numéro, digicode) reste protégée dans Paramètres et n&apos;est jamais affichée ici publiquement.
        </span>
      </div>

      {/* Header */}
      <SectionCard
        title="En-tête de la page Contact (/contact)"
        description="Titre et sous-titre en haut de la page Contact & Informations."
        visible={header.visible}
        zone="pageHeader"
        defaultOpen={true}
        onToggleVisible={() =>
          onChangeContact({
            ...contact,
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
              onChangeContact({ ...contact, header: { ...header, eyebrow: val } })
            }
          />
          <TextField
            label="Grand titre"
            value={header.title}
            onChange={(val) =>
              onChangeContact({ ...contact, header: { ...header, title: val } })
            }
          />
        </div>
        <TextField
          label="Sous-titre"
          value={header.subtitle}
          onChange={(val) =>
            onChangeContact({ ...contact, header: { ...header, subtitle: val } })
          }
        />
      </SectionCard>

      {/* Carte Localisation */}
      <SectionCard
        title="Carte Localisation (Colonne de gauche - haut)"
        description="Ville d'exercice et message sur la confidentialité de l'adresse."
        visible={loc.visible}
        zone="addressPrivate"
        onToggleVisible={() =>
          onChangeContact({
            ...contact,
            locationCard: { ...loc, visible: loc.visible === false },
          })
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Titre de la carte"
            value={loc.title}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                locationCard: { ...loc, title: val },
              })
            }
          />
          <TextField
            label="Ville affichée publiquement"
            value={loc.cityText}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                locationCard: { ...loc, cityText: val },
              })
            }
          />
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-brun">
              Encadré &laquo; Adresse confidentielle &raquo;
            </span>
            <ToggleVisibilityButton
              visible={loc.confidentialityVisible}
              onToggle={() =>
                onChangeContact({
                  ...contact,
                  locationCard: {
                    ...loc,
                    confidentialityVisible: loc.confidentialityVisible === false,
                  },
                })
              }
            />
          </div>
          <TextField
            label="Titre de l'encadré"
            value={loc.confidentialityTitle}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                locationCard: { ...loc, confidentialityTitle: val },
              })
            }
          />
          <TextField
            label="Message de l'encadré"
            value={loc.confidentialityText}
            multiline
            rows={2}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                locationCard: { ...loc, confidentialityText: val },
              })
            }
          />
        </div>
      </SectionCard>

      {/* Carte Coordonnées */}
      <SectionCard
        title="Carte Coordonnées & Horaires (Colonne de gauche - bas)"
        description="Horaires d'ouverture, Instagram officiel et rappel confidentialité."
        visible={coords.visible}
        zone="availability"
        onToggleVisible={() =>
          onChangeContact({
            ...contact,
            coordinatesCard: { ...coords, visible: coords.visible === false },
          })
        }
      >
        <TextField
          label="Titre de la carte"
          value={coords.title}
          onChange={(val) =>
            onChangeContact({
              ...contact,
              coordinatesCard: { ...coords, title: val },
            })
          }
        />

        {/* Bloc Horaires */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-brun">
              Bloc Disponibilités &amp; Horaires
            </span>
            <ToggleVisibilityButton
              visible={coords.hoursVisible}
              onToggle={() =>
                onChangeContact({
                  ...contact,
                  coordinatesCard: {
                    ...coords,
                    hoursVisible: coords.hoursVisible === false,
                  },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Titre"
              value={coords.hoursTitle}
              onChange={(val) =>
                onChangeContact({
                  ...contact,
                  coordinatesCard: { ...coords, hoursTitle: val },
                })
              }
            />
            <TextField
              label="Ligne horaires"
              value={coords.hoursSchedule}
              onChange={(val) =>
                onChangeContact({
                  ...contact,
                  coordinatesCard: { ...coords, hoursSchedule: val },
                })
              }
            />
          </div>
          <TextField
            label="Précision sous les horaires"
            value={coords.hoursNote}
            multiline
            rows={2}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                coordinatesCard: { ...coords, hoursNote: val },
              })
            }
          />
        </div>

        {/* Bloc Instagram Support */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-brun">
              Bloc Support Instagram
            </span>
            <ToggleVisibilityButton
              visible={coords.supportVisible}
              onToggle={() =>
                onChangeContact({
                  ...contact,
                  coordinatesCard: {
                    ...coords,
                    supportVisible: coords.supportVisible === false,
                  },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Titre du support"
              value={coords.supportTitle}
              onChange={(val) =>
                onChangeContact({
                  ...contact,
                  coordinatesCard: { ...coords, supportTitle: val },
                })
              }
            />
            <TextField
              label="Compte Instagram"
              value={coords.instagramHandle}
              onChange={(val) =>
                onChangeContact({
                  ...contact,
                  coordinatesCard: { ...coords, instagramHandle: val },
                })
              }
            />
          </div>
          <TextField
            label="Note d'explication"
            value={coords.supportNote}
            multiline
            rows={2}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                coordinatesCard: { ...coords, supportNote: val },
              })
            }
          />
        </div>

        {/* Encadré champagnisé */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-brun">
              Encadré champagnisé Confidentialité du salon
            </span>
            <ToggleVisibilityButton
              visible={coords.privacyNoteVisible}
              onToggle={() =>
                onChangeContact({
                  ...contact,
                  coordinatesCard: {
                    ...coords,
                    privacyNoteVisible: coords.privacyNoteVisible === false,
                  },
                })
              }
            />
          </div>
          <TextField
            label="Titre"
            value={coords.privacyNoteTitle}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                coordinatesCard: { ...coords, privacyNoteTitle: val },
              })
            }
          />
          <TextField
            label="Message"
            value={coords.privacyNoteText}
            multiline
            rows={2}
            onChange={(val) =>
              onChangeContact({
                ...contact,
                coordinatesCard: { ...coords, privacyNoteText: val },
              })
            }
          />
        </div>
      </SectionCard>

      {/* Carte Règlement */}
      <SectionCard
        title="Carte Règlement Intérieur & Préparation (Colonne de droite)"
        description="Liste des règles affichées à droite sur la page Contact."
        visible={rulesCard.visible}
        zone="legal"
        onToggleVisible={() =>
          onChangeContact({
            ...contact,
            rulesCard: { ...rulesCard, visible: rulesCard.visible === false },
          })
        }
      >
        <TextField
          label="Titre de la carte"
          value={rulesCard.title}
          onChange={(val) =>
            onChangeContact({
              ...contact,
              rulesCard: { ...rulesCard, title: val },
            })
          }
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onChangeContact({
                ...contact,
                rulesCard: {
                  ...rulesCard,
                  rules: [
                    ...rulesList,
                    {
                      visible: true,
                      title: `${rulesList.length + 1}. Nouvelle règle`,
                      text: "Détail de la consigne...",
                    },
                  ],
                },
              })
            }
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter une règle</span>
          </button>
        </div>

        <div className="space-y-4">
          {rulesList.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-brun">
                    Règle #{idx + 1}
                  </span>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveRule(idx, "up")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === rulesList.length - 1}
                    onClick={() => moveRule(idx, "down")}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleVisibilityButton
                    visible={rule.visible}
                    onToggle={() => {
                      const next = rulesList.map((r, i) =>
                        i === idx ? { ...r, visible: r.visible === false } : r
                      );
                      onChangeContact({
                        ...contact,
                        rulesCard: { ...rulesCard, rules: next },
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChangeContact({
                        ...contact,
                        rulesCard: {
                          ...rulesCard,
                          rules: rulesList.filter((_, i) => i !== idx),
                        },
                      })
                    }
                    className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>

              <TextField
                label="Titre de la règle"
                value={rule.title}
                onChange={(val) => {
                  const next = rulesList.map((r, i) =>
                    i === idx ? { ...r, title: val } : r
                  );
                  onChangeContact({
                    ...contact,
                    rulesCard: { ...rulesCard, rules: next },
                  });
                }}
              />
              <TextField
                label="Contenu de la règle"
                value={rule.text}
                multiline
                rows={2}
                onChange={(val) => {
                  const next = rulesList.map((r, i) =>
                    i === idx ? { ...r, text: val } : r
                  );
                  onChangeContact({
                    ...contact,
                    rulesCard: { ...rulesCard, rules: next },
                  });
                }}
              />
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <TextField
              label="Texte du bouton en bas de la carte"
              value={rulesCard.ctaText}
              onChange={(val) =>
                onChangeContact({
                  ...contact,
                  rulesCard: { ...rulesCard, ctaText: val },
                })
              }
            />
          </div>
          <ToggleVisibilityButton
            visible={rulesCard.ctaVisible}
            visibleLabel="Bouton affiché"
            hiddenLabel="Bouton masqué"
            onToggle={() =>
              onChangeContact({
                ...contact,
                rulesCard: {
                  ...rulesCard,
                  ctaVisible: rulesCard.ctaVisible === false,
                },
              })
            }
          />
        </div>
      </SectionCard>

      {/* Blocs libres */}
      <SectionCard
        title="Blocs de texte supplémentaires sur /contact"
        description="Ajoutez librement des encadrés supplémentaires sur la page Contact."
        visible={true}
        zone="legal"
      >
        <RichArticleListEditor
          articles={contact.customBlocks || []}
          onChange={(blocks) =>
            onChangeContact({ ...contact, customBlocks: blocks })
          }
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc sur /contact"
        />
      </SectionCard>
    </div>
  );
}
