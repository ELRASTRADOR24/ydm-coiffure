"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Film,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";
import { uploadMediaClient } from "@/lib/uploadMedia";
import {
  ToggleVisibilityButton,
  SectionCard,
  TextField,
  RichArticleListEditor,
} from "./CmsControls";

export function FaqEditorTab({
  faqList,
  setFaqList,
  homeFaqSection,
  onChangeHomeFaqSection,
  markChanged,
  onResetDefaults,
}) {
  const handleFaqChange = (index, field, value) => {
    const updated = faqList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFaqList(updated);
    markChanged();
  };

  const handleAddFaq = () => {
    setFaqList([
      ...faqList,
      {
        visible: true,
        question: "Nouvelle question",
        answer: "Écrivez votre réponse ici...",
        order: faqList.length + 1,
      },
    ]);
    markChanged();
  };

  const handleRemoveFaq = (index) => {
    setFaqList(faqList.filter((_, i) => i !== index));
    markChanged();
  };

  const moveFaq = (index, direction) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= faqList.length) return;
    const updated = [...faqList];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setFaqList(updated.map((it, idx) => ({ ...it, order: idx + 1 })));
    markChanged();
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="En-tête du bloc Questions & FAQ (Page d'Accueil)"
        description="Choisissez d'afficher ou de masquer toute la section FAQ sur l'accueil, et personnalisez son titre."
        visible={homeFaqSection.visible}
        onToggleVisible={() => {
          onChangeHomeFaqSection({
            ...homeFaqSection,
            visible: homeFaqSection.visible === false ? true : false,
          });
        }}
        onReset={onResetDefaults}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Sur-titre"
            value={homeFaqSection.eyebrow}
            onChange={(val) =>
              onChangeHomeFaqSection({ ...homeFaqSection, eyebrow: val })
            }
          />
          <TextField
            label="Grand titre"
            value={homeFaqSection.title}
            onChange={(val) =>
              onChangeHomeFaqSection({ ...homeFaqSection, title: val })
            }
          />
        </div>
        <TextField
          label="Sous-titre descriptif"
          value={homeFaqSection.subtitle}
          onChange={(val) =>
            onChangeHomeFaqSection({ ...homeFaqSection, subtitle: val })
          }
        />
      </SectionCard>

      <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h3 className="font-serif text-xl font-bold text-brun">
              Liste des Questions & Réponses ({faqList.length})
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Modifiez, masquez temporairement ou supprimez chaque question individuellement.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddFaq}
            className="inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-5 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter une question</span>
          </button>
        </div>

        {faqList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-3">
            <p className="text-sm text-stone-600">
              Aucune question dans la FAQ actuellement. Aucun accordéon ne sera affiché aux visiteuses.
            </p>
            <button
              type="button"
              onClick={handleAddFaq}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brun text-creme text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-champagne" />
              <span>Ajouter une première question</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqList.map((faq, index) => {
              const isShown = faq.visible !== false;
              return (
                <div
                  key={index}
                  className={`p-5 rounded-2xl border-2 space-y-4 transition-colors ${
                    isShown
                      ? "bg-stone-50 border-stone-200"
                      : "bg-stone-100 border-stone-300 opacity-75"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-white border border-stone-300 text-sm font-bold text-brun">
                        Question #{index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveFaq(index, "up")}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span>Monter</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === faqList.length - 1}
                        onClick={() => moveFaq(index, "down")}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span>Descendre</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <ToggleVisibilityButton
                        visible={isShown}
                        onToggle={() => handleFaqChange(index, "visible", !isShown)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>

                  <TextField
                    label="Titre de la question"
                    value={faq.question || ""}
                    onChange={(val) => handleFaqChange(index, "question", val)}
                  />

                  <TextField
                    label="Réponse affichée aux clientes"
                    value={faq.answer || ""}
                    multiline
                    rows={3}
                    onChange={(val) => handleFaqChange(index, "answer", val)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function GalleryEditorTab({
  galleryPage,
  onChangeGalleryPage,
  galleryList,
  setGalleryList,
  markChanged,
  showToast,
  onResetPage,
}) {
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState(null);
  const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState(null);
  const [isCompactGallery, setIsCompactGallery] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const galleryFileInputRef = useRef(null);

  const handleGalleryChange = (index, field, value) => {
    const updated = galleryList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setGalleryList(updated);
    markChanged();
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    setUploadProgress(0);
    try {
      showToast("Téléversement vers Cloudinary en cours...");
      const res = await uploadMediaClient(file, {
        onProgress: (pct) => setUploadProgress(pct),
      });
      if (res.success) {
        const isVid =
          res.resourceType === "video" || file.type.startsWith("video/");
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]/g, " ");
        const newItem = {
          id: Date.now(),
          visible: true,
          type: isVid ? "video" : "photo",
          title: cleanName || "Nouvelle réalisation",
          category: "Knotless",
          image: isVid ? res.thumbnailUrl || res.url : res.url,
          videoUrl: isVid ? res.url : "",
          aspect: "tall",
          order: 1,
        };
        const updated = [newItem, ...galleryList].map((it, idx) => ({
          ...it,
          order: idx + 1,
        }));
        setGalleryList(updated);
        markChanged();
        showToast(
          isVid
            ? "Vidéo téléversée sur Cloudinary avec succès !"
            : "Photo téléversée sur Cloudinary avec succès !"
        );
      } else {
        showToast(res.error || "Erreur lors du téléversement du média.");
      }
    } catch (_) {
      showToast("Échec de l'envoi vers Cloudinary.");
    } finally {
      setUploadingGallery(false);
      setUploadProgress(0);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const handleAddGalleryItem = () => {
    const newItem = {
      id: Date.now(),
      visible: true,
      type: "photo",
      title: "Nouvelle réalisation",
      category: "Knotless",
      image: "/images/realisations/IMG_3401_still.jpeg",
      aspect: "tall",
      order: 1,
    };
    const updated = [newItem, ...galleryList].map((it, idx) => ({
      ...it,
      order: idx + 1,
    }));
    setGalleryList(updated);
    markChanged();
  };

  const handleRemoveGalleryItem = (index) => {
    if (!confirm("Voulez-vous supprimer définitivement cette réalisation de la galerie ?")) {
      return;
    }
    setGalleryList(
      galleryList
        .filter((_, i) => i !== index)
        .map((it, idx) => ({ ...it, order: idx + 1 }))
    );
    markChanged();
  };

  const moveGalleryItem = (index, direction) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= galleryList.length) return;
    const updated = [...galleryList];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setGalleryList(updated.map((it, idx) => ({ ...it, order: idx + 1 })));
    markChanged();
  };

  const handleDragStartGallery = (e, index) => {
    setDraggedGalleryIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOverGallery = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverGalleryIndex !== index) {
      setDragOverGalleryIndex(index);
    }
  };

  const handleDropGallery = (e, targetIndex) => {
    e.preventDefault();
    if (draggedGalleryIndex === null || draggedGalleryIndex === targetIndex) {
      setDraggedGalleryIndex(null);
      setDragOverGalleryIndex(null);
      return;
    }
    const updated = [...galleryList];
    const [movedItem] = updated.splice(draggedGalleryIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setGalleryList(reordered);
    setDraggedGalleryIndex(null);
    setDragOverGalleryIndex(null);
    markChanged();
  };

  const handleDragEndGallery = () => {
    setDraggedGalleryIndex(null);
    setDragOverGalleryIndex(null);
  };

  const header = galleryPage.header;
  const bottomCta = galleryPage.bottomCta;

  return (
    <div className="space-y-6">
      <SectionCard
        title="En-tête de la page Galerie"
        description="Textes affichés tout en haut de la page Galerie (/galerie)."
        visible={header.visible}
        onToggleVisible={() =>
          onChangeGalleryPage({
            ...galleryPage,
            header: { ...header, visible: header.visible === false ? true : false },
          })
        }
        onReset={onResetPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Sur-titre"
            value={header.eyebrow}
            onChange={(val) =>
              onChangeGalleryPage({
                ...galleryPage,
                header: { ...header, eyebrow: val },
              })
            }
          />
          <TextField
            label="Grand titre"
            value={header.title}
            onChange={(val) =>
              onChangeGalleryPage({
                ...galleryPage,
                header: { ...header, title: val },
              })
            }
          />
        </div>
        <TextField
          label="Texte d'introduction"
          value={header.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeGalleryPage({
              ...galleryPage,
              header: { ...header, subtitle: val },
            })
          }
        />
      </SectionCard>

      <SectionCard
        title="Encadré en bas de page Galerie"
        description="Bloc d'appel à l'action affiché sous les photos et vidéos de réalisations."
        visible={bottomCta.visible}
        onToggleVisible={() =>
          onChangeGalleryPage({
            ...galleryPage,
            bottomCta: {
              ...bottomCta,
              visible: bottomCta.visible === false ? true : false,
            },
          })
        }
      >
        <TextField
          label="Titre de l'encadré"
          value={bottomCta.title}
          onChange={(val) =>
            onChangeGalleryPage({
              ...galleryPage,
              bottomCta: { ...bottomCta, title: val },
            })
          }
        />
        <TextField
          label="Sous-titre"
          value={bottomCta.subtitle}
          multiline
          rows={2}
          onChange={(val) =>
            onChangeGalleryPage({
              ...galleryPage,
              bottomCta: { ...bottomCta, subtitle: val },
            })
          }
        />
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <TextField
              label="Texte du bouton"
              value={bottomCta.buttonText}
              onChange={(val) =>
                onChangeGalleryPage({
                  ...galleryPage,
                  bottomCta: { ...bottomCta, buttonText: val },
                })
              }
            />
          </div>
          <ToggleVisibilityButton
            visible={bottomCta.buttonVisible}
            visibleLabel="Bouton affiché"
            hiddenLabel="Bouton masqué"
            onToggle={() =>
              onChangeGalleryPage({
                ...galleryPage,
                bottomCta: {
                  ...bottomCta,
                  buttonVisible: bottomCta.buttonVisible === false ? true : false,
                },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Blocs de texte libres sur la page Galerie"
        description="Ajoutez un paragraphe ou un encadré supplémentaire n'importe où sous la galerie."
        visible={true}
      >
        <RichArticleListEditor
          articles={galleryPage.customBlocks || []}
          onChange={(blocks) =>
            onChangeGalleryPage({ ...galleryPage, customBlocks: blocks })
          }
          itemLabel="Bloc libre"
          addLabel="Ajouter un bloc de texte sur la page Galerie"
        />
      </SectionCard>

      {/* Portfolio Photos & Vidéos */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-stone-200 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <h3 className="font-serif text-xl font-bold text-brun">
              Photos & Vidéos de la Galerie ({galleryList.length})
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Modifiez les titres, masquez une photo sans l&apos;effacer, changez l&apos;ordre ou importez une vidéo/photo depuis votre appareil.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCompactGallery(!isCompactGallery)}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                isCompactGallery
                  ? "bg-champagne text-brun-dark border-champagne-dark shadow-xs"
                  : "bg-white text-brun border-stone-300 hover:bg-stone-50"
              }`}
            >
              {isCompactGallery ? (
                <>
                  <ZoomIn className="w-4 h-4" />
                  <span>Vue détaillée</span>
                </>
              ) : (
                <>
                  <ZoomOut className="w-4 h-4 text-champagne-dark" />
                  <span>Vue d&apos;ensemble (Dézoomer)</span>
                </>
              )}
            </button>

            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploadingGallery}
              onClick={() => galleryFileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploadingGallery ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-champagne" />
                  <span>
                    Envoi Cloudinary{uploadProgress > 0 ? ` (${uploadProgress}%)` : "..."}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-champagne" />
                  <span>Envoyer vidéo / photo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleAddGalleryItem}
              className="inline-flex items-center space-x-2 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter par lien</span>
            </button>
          </div>
        </div>

        {isCompactGallery && (
          <div className="p-4 rounded-2xl bg-champagne-light/50 border border-champagne/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-brun">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-champagne-dark shrink-0" />
              <span className="font-medium">
                Mode dézoomé : glissez-déposez n&apos;importe quelle carte pour changer sa position dans la galerie.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCompactGallery(false)}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-sm font-bold text-brun hover:bg-stone-50 shrink-0 cursor-pointer"
            >
              Revenir à l&apos;édition détaillée
            </button>
          </div>
        )}

        {galleryList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-3">
            <p className="text-sm text-stone-600">
              La galerie est vide. Ajoutez une photo ou une vidéo ci-dessus.
            </p>
          </div>
        ) : isCompactGallery ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {galleryList.map((item, index) => (
              <div
                key={item.id || index}
                draggable
                onDragStart={(e) => handleDragStartGallery(e, index)}
                onDragOver={(e) => handleDragOverGallery(e, index)}
                onDrop={(e) => handleDropGallery(e, index)}
                onDragEnd={handleDragEndGallery}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all select-none shadow-xs bg-stone-900 ${
                  item.visible === false ? "opacity-45" : ""
                } ${
                  draggedGalleryIndex === index
                    ? "opacity-30 scale-90 border-dashed border-champagne"
                    : dragOverGalleryIndex === index && draggedGalleryIndex !== index
                    ? "ring-4 ring-champagne border-champagne scale-105 z-20"
                    : "border-stone-200 hover:border-champagne"
                }`}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title || "Réalisation"}
                    fill
                    className="object-cover object-center pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 bg-brun/90 text-creme text-xs font-bold px-2 py-0.5 rounded-full border border-champagne/40">
                  <GripVertical className="w-3.5 h-3.5 text-champagne" />
                  <span>#{index + 1}</span>
                </div>
                {item.type === "video" && (
                  <div className="absolute top-2 right-2 z-10 bg-black/75 rounded p-1 text-white">
                    <Film className="w-3.5 h-3.5 text-champagne" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                  <span className="text-[11px] uppercase tracking-wider text-stone-300 block truncate">
                    {item.visible === false ? "MASQUÉE" : item.category}
                  </span>
                  <h4 className="font-serif font-bold text-xs leading-tight line-clamp-1">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {galleryList.map((item, index) => {
              const isShown = item.visible !== false;
              return (
                <div
                  key={item.id || index}
                  draggable
                  onDragStart={(e) => handleDragStartGallery(e, index)}
                  onDragOver={(e) => handleDragOverGallery(e, index)}
                  onDrop={(e) => handleDropGallery(e, index)}
                  onDragEnd={handleDragEndGallery}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                    draggedGalleryIndex === index
                      ? "opacity-40 border-dashed border-champagne"
                      : dragOverGalleryIndex === index && draggedGalleryIndex !== index
                      ? "border-champagne-dark ring-2 ring-champagne/40 bg-champagne/10"
                      : isShown
                      ? "bg-stone-50 border-stone-200"
                      : "bg-stone-100 border-stone-300 opacity-75"
                  }`}
                >
                  {/* Barre actions en haut de la carte */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-white border border-stone-300 text-sm font-bold text-brun cursor-grab">
                        <GripVertical className="w-4 h-4 text-stone-400" />
                        <span>Réalisation #{index + 1}</span>
                      </span>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveGalleryItem(index, "up")}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span>Monter</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === galleryList.length - 1}
                        onClick={() => moveGalleryItem(index, "down")}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span>Descendre</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <ToggleVisibilityButton
                        visible={isShown}
                        onToggle={() => handleGalleryChange(index, "visible", !isShown)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(index)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-5">
                    <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-300">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || "Réalisation"}
                          fill
                          className="object-cover object-center pointer-events-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      {item.type === "video" && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/75 rounded p-1 text-white">
                          <Film className="w-3.5 h-3.5 text-champagne" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-sm font-bold text-brun block mb-1">
                            Titre de la réalisation
                          </label>
                          <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) =>
                              handleGalleryChange(index, "title", e.target.value)
                            }
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-brun block mb-1">
                            Format
                          </label>
                          <select
                            value={item.type || "photo"}
                            onChange={(e) =>
                              handleGalleryChange(index, "type", e.target.value)
                            }
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                          >
                            <option value="photo">Photo</option>
                            <option value="video">Vidéo</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-bold text-brun block mb-1">
                            Catégorie
                          </label>
                          <input
                            type="text"
                            value={item.category || ""}
                            onChange={(e) =>
                              handleGalleryChange(index, "category", e.target.value)
                            }
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                            placeholder="Ex: Knotless, Fulani, Boho Braids..."
                          />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-brun block mb-1">
                            Lien image / miniature
                          </label>
                          <input
                            type="text"
                            value={item.image || ""}
                            onChange={(e) =>
                              handleGalleryChange(index, "image", e.target.value)
                            }
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                          />
                        </div>
                      </div>

                      {item.type === "video" && (
                        <div>
                          <label className="text-sm font-bold text-brun block mb-1">
                            Lien vidéo (Cloudinary / MP4)
                          </label>
                          <input
                            type="text"
                            value={item.videoUrl || ""}
                            onChange={(e) =>
                              handleGalleryChange(index, "videoUrl", e.target.value)
                            }
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                            placeholder="https://res.cloudinary.com/.../video.mp4"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
