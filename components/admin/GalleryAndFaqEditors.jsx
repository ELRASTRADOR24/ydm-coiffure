"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  Info,
  Play,
  Link2,
  Wand2,
  X,
  Check,
  Save,
} from "lucide-react";
import {
  uploadMediaClient,
  buildCloudinaryVideoThumbnail,
  cleanMediaTitleFromFilename,
  resolveGalleryPosterUrl,
  canUseNextImageUrl,
  isVideoFilenameOrUrl,
} from "@/lib/uploadMedia";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import CustomVideoPlayer from "../CustomVideoPlayer";
import {
  ToggleVisibilityButton,
  SectionCard,
  TextField,
  RichArticleListEditor,
} from "./CmsControls";
import { AdminLocationIllustration } from "./AdminVisualGuide";

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
        zone="faq"
        defaultOpen={true}
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
            label="Petit titre au-dessus"
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
                  key={faq._id || faq.id || index}
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
                        className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span>Monter</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === faqList.length - 1}
                        onClick={() => moveFaq(index, "down")}
                        className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
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
                        className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
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

const GALLERY_CATEGORY_PRESETS = [
  "Knotless",
  "French Curls",
  "Fulani",
  "Boho Braids",
  "Vanilles",
  "Nattes collées",
  "Cornrows",
  "Soft Locs",
  "Sur-Mesure",
];

function AdminThumb({ item, className = "object-cover object-center pointer-events-none" }) {
  const posterSrc = resolveGalleryPosterUrl(item);
  const videoSrc = item?.videoUrl || item?.video || "";

  if (posterSrc) {
    if (canUseNextImageUrl(posterSrc)) {
      return (
        <Image
          src={posterSrc}
          alt={item?.title || "Réalisation"}
          fill
          className={className}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={posterSrc}
        alt={item?.title || "Réalisation"}
        loading="lazy"
        className={`w-full h-full ${className}`}
      />
    );
  }

  if (videoSrc) {
    return (
      <video
        src={`${videoSrc}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className={`w-full h-full ${className}`}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-stone-400">
      <ImageIcon className="w-6 h-6" />
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
  availableServices = [],
  onSaveNow,
  hasUnsavedChanges = false,
  savingNow = false,
}) {
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState(null);
  const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState(null);
  const [isCompactGallery, setIsCompactGallery] = useState(false);
  const [movingGalleryIndex, setMovingGalleryIndex] = useState(null);
  const [mediaFilter, setMediaFilter] = useState("ALL");

  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cardUploadingIndex, setCardUploadingIndex] = useState(null);
  const [recentlyAddedCount, setRecentlyAddedCount] = useState(0);

  const [previewItem, setPreviewItem] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoCategory, setNewVideoCategory] = useState("Knotless");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoThumb, setNewVideoThumb] = useState("");

  const videoFileInputRef = useRef(null);
  const photoFileInputRef = useRef(null);
  const cardMediaInputRef = useRef(null);
  const cardThumbInputRef = useRef(null);
  const targetCardIndexRef = useRef(null);

  useEffect(() => {
    if (!previewItem && !showVideoModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setPreviewItem(null);
        setShowVideoModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewItem, showVideoModal]);

  const libraryVideos = useMemo(() => {
    const seen = new Set();
    const entries = [];

    for (const srv of availableServices || []) {
      const vid = (srv?.videoUrl || "").trim();
      if (!vid || seen.has(vid)) continue;
      seen.add(vid);
      entries.push({
        id: `srv-${srv.id || srv._id || vid}`,
        title: srv.name || "Vidéo prestation",
        category: srv.category || "Knotless",
        videoUrl: vid,
        image:
          srv.images?.[0] ||
          (vid.includes("res.cloudinary.com") ? buildCloudinaryVideoThumbnail(vid) : ""),
        sourceLabel: "Prestation du salon",
      });
    }

    for (const def of DEFAULT_SALON_SETTINGS.galleryItems || []) {
      const vid = (def?.videoUrl || "").trim();
      if (!vid || seen.has(vid)) continue;
      seen.add(vid);
      entries.push({
        id: `def-${def.id || vid}`,
        title: def.title || "Vidéo du salon",
        category: def.category || "Knotless",
        videoUrl: vid,
        image: def.image || "",
        sourceLabel: "Vidéo d'origine",
      });
    }

    return entries;
  }, [availableServices]);

  const handleGalleryChange = (index, field, value) => {
    const updated = galleryList.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, [field]: value };
      // Si l'admin colle un lien vidéo Cloudinary et qu'il n'y a pas encore de miniature, la générer automatiquement
      if (
        field === "videoUrl" &&
        typeof value === "string" &&
        value.includes("res.cloudinary.com") &&
        (!item.image || item.image === "/images/realisations/IMG_3401_still.jpeg")
      ) {
        next.image = buildCloudinaryVideoThumbnail(value.trim());
      }
      if (
        field === "videoUrl" &&
        typeof value === "string" &&
        value.trim() &&
        item.type !== "video"
      ) {
        next.type = "video";
      }
      return next;
    });
    setGalleryList(updated);
    markChanged();
  };

  // Téléversement simple ou multiple (vidéos / photos) directement depuis iPad / téléphone / ordinateur
  const handleBatchUpload = async (filesList, forcedKind = "auto") => {
    const files = Array.from(filesList || []).filter(Boolean);
    if (files.length === 0) return;

    setUploadingGallery(true);
    setUploadProgress(0);
    setMediaFilter("ALL");
    const createdItems = [];
    let failedCount = 0;
    let lastError = "";

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const prefixLabel =
          files.length > 1 ? ` (${i + 1}/${files.length})` : "";
        setUploadStatusText(`Envoi${prefixLabel} : ${file.name}`);
        setUploadProgress(0);

        try {
          const res = await uploadMediaClient(file, {
            onProgress: (pct) => setUploadProgress(pct),
          });
          if (res.success && res.url) {
            const isVid =
              forcedKind === "video" ||
              res.isVideo ||
              res.resourceType === "video" ||
              Boolean(file.type?.startsWith("video/")) ||
              isVideoFilenameOrUrl(file.name);

            createdItems.push({
              id: Date.now() + i,
              visible: true,
              type: isVid ? "video" : "photo",
              title: cleanMediaTitleFromFilename(
                file.name,
                isVid ? "Nouvelle vidéo" : "Nouvelle réalisation"
              ),
              category: "Knotless",
              image: isVid ? res.thumbnailUrl || "" : res.url,
              videoUrl: isVid ? res.url : "",
              aspect: "tall",
              order: 1,
            });
          } else {
            failedCount++;
            lastError = res.error || "Erreur lors du téléversement.";
          }
        } catch (err) {
          failedCount++;
          lastError = err?.message || "Échec de l'envoi vers Cloudinary.";
        }
      }

      if (createdItems.length > 0) {
        const updated = [...createdItems, ...galleryList].map((it, idx) => ({
          ...it,
          order: idx + 1,
        }));
        setGalleryList(updated);
        markChanged();
        setRecentlyAddedCount(createdItems.length);
        setIsCompactGallery(false);

        const vidCount = createdItems.filter((it) => it.type === "video").length;
        const photoCount = createdItems.length - vidCount;
        if (vidCount > 0 && photoCount === 0) {
          showToast(
            `${vidCount} vidéo${vidCount > 1 ? "s ajoutées" : " ajoutée"} ! Ajustez le titre ou cliquez sur « Enregistrer & Publier ».`
          );
        } else {
          showToast(
            `${createdItems.length} média${createdItems.length > 1 ? "s ajoutés" : " ajouté"} en haut de la galerie !`
          );
        }
      }

      if (failedCount > 0) {
        showToast(
          lastError || `Impossible d'envoyer ${failedCount} fichier(s) sur Cloudinary.`
        );
      }
    } finally {
      setUploadingGallery(false);
      setUploadProgress(0);
      setUploadStatusText("");
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
      if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    }
  };

  // Remplacer la vidéo / photo ou la miniature d'une carte précise
  const handleReplaceCardMedia = async (e, mode = "media") => {
    const file = e.target.files?.[0];
    const cardIdx = targetCardIndexRef.current;
    if (!file || cardIdx === null || cardIdx === undefined) return;

    setCardUploadingIndex(cardIdx);
    try {
      showToast(
        mode === "thumb"
          ? "Envoi de la miniature vers Cloudinary..."
          : "Envoi du nouveau média vers Cloudinary..."
      );
      const res = await uploadMediaClient(file);
      if (res.success && res.url) {
        const isVid =
          mode !== "thumb" &&
          (res.isVideo ||
            res.resourceType === "video" ||
            Boolean(file.type?.startsWith("video/")) ||
            isVideoFilenameOrUrl(file.name));

        const updated = galleryList.map((item, idx) => {
          if (idx !== cardIdx) return item;
          if (mode === "thumb") {
            return { ...item, image: res.url };
          }
          return {
            ...item,
            type: isVid ? "video" : "photo",
            videoUrl: isVid ? res.url : "",
            image: isVid ? res.thumbnailUrl || item.image || "" : res.url,
          };
        });
        setGalleryList(updated);
        markChanged();
        showToast(
          mode === "thumb"
            ? "Miniature mise à jour !"
            : isVid
            ? "Vidéo remplacée avec succès !"
            : "Photo remplacée avec succès !"
        );
      } else {
        showToast(res.error || "Erreur lors du téléversement.");
      }
    } catch (err) {
      showToast(err?.message || "Échec de l'envoi vers Cloudinary.");
    } finally {
      setCardUploadingIndex(null);
      targetCardIndexRef.current = null;
      if (cardMediaInputRef.current) cardMediaInputRef.current.value = "";
      if (cardThumbInputRef.current) cardThumbInputRef.current.value = "";
    }
  };

  const handleAddGalleryItem = (mediaType = "photo") => {
    const newItem = {
      id: Date.now(),
      visible: true,
      type: mediaType,
      title: mediaType === "video" ? "Nouvelle vidéo" : "Nouvelle réalisation",
      category: "Knotless",
      image: mediaType === "video" ? "" : "/images/realisations/IMG_3401_still.jpeg",
      videoUrl: mediaType === "video" ? "" : undefined,
      aspect: "tall",
      order: 1,
    };
    const updated = [newItem, ...galleryList].map((it, idx) => ({
      ...it,
      order: idx + 1,
    }));
    setGalleryList(updated);
    setMediaFilter("ALL");
    setIsCompactGallery(false);
    setRecentlyAddedCount(1);
    markChanged();
  };

  const handleAddVideoFromUrl = (e) => {
    e.preventDefault();
    const url = newVideoUrl.trim();
    if (!url) {
      showToast("Veuillez saisir ou coller un lien vidéo (MP4, MOV ou Cloudinary).");
      return;
    }
    const thumb =
      newVideoThumb.trim() ||
      (url.includes("res.cloudinary.com") ? buildCloudinaryVideoThumbnail(url) : "");
    const newItem = {
      id: Date.now(),
      visible: true,
      type: "video",
      title: newVideoTitle.trim() || "Nouvelle vidéo",
      category: newVideoCategory.trim() || "Knotless",
      image: thumb,
      videoUrl: url,
      aspect: "tall",
      order: 1,
    };
    const updated = [newItem, ...galleryList].map((it, idx) => ({
      ...it,
      order: idx + 1,
    }));
    setGalleryList(updated);
    markChanged();
    setShowVideoModal(false);
    setNewVideoTitle("");
    setNewVideoUrl("");
    setNewVideoThumb("");
    setMediaFilter("ALL");
    setIsCompactGallery(false);
    setRecentlyAddedCount(1);
    showToast("Vidéo ajoutée en haut de la galerie !");
  };

  const handleAddLibraryVideo = (entry) => {
    const newItem = {
      id: Date.now(),
      visible: true,
      type: "video",
      title: entry.title || "Réalisation vidéo",
      category: entry.category || "Knotless",
      image: entry.image || "",
      videoUrl: entry.videoUrl,
      aspect: "tall",
      order: 1,
    };
    const updated = [newItem, ...galleryList].map((it, idx) => ({
      ...it,
      order: idx + 1,
    }));
    setGalleryList(updated);
    markChanged();
    setShowVideoModal(false);
    setMediaFilter("ALL");
    setIsCompactGallery(false);
    setRecentlyAddedCount(1);
    showToast(`Vidéo « ${newItem.title} » ajoutée à la galerie !`);
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
    if (movingGalleryIndex === index) setMovingGalleryIndex(target);
    markChanged();
  };

  const moveGalleryItemTo = (fromIndex, targetIndex) => {
    if (
      fromIndex === null ||
      fromIndex === undefined ||
      targetIndex === null ||
      targetIndex === undefined ||
      fromIndex === targetIndex ||
      fromIndex < 0 ||
      targetIndex < 0 ||
      fromIndex >= galleryList.length ||
      targetIndex >= galleryList.length
    ) {
      return;
    }
    const updated = [...galleryList];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setGalleryList(updated.map((item, idx) => ({ ...item, order: idx + 1 })));
    setMovingGalleryIndex(null);
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

  const totalVideos = galleryList.filter((it) => it?.type === "video").length;
  const totalPhotos = galleryList.length - totalVideos;
  const totalHidden = galleryList.filter((it) => it?.visible === false).length;

  const filteredIndexedItems = galleryList
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (mediaFilter === "VIDEO") return item?.type === "video";
      if (mediaFilter === "PHOTO") return item?.type !== "video";
      if (mediaFilter === "HIDDEN") return item?.visible === false;
      return true;
    });

  const header = galleryPage.header;
  const bottomCta = galleryPage.bottomCta;

  return (
    <div className="space-y-6">
      {/* Inputs cachés pour l'envoi direct sur iPad / Ordinateur */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*,.mov,.mp4,.m4v,.webm"
        multiple
        onChange={(e) => handleBatchUpload(e.target.files, "video")}
        className="hidden"
      />
      <input
        ref={photoFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleBatchUpload(e.target.files, "photo")}
        className="hidden"
      />
      <input
        ref={cardMediaInputRef}
        type="file"
        accept="image/*,video/*,.mov,.mp4,.m4v"
        onChange={(e) => handleReplaceCardMedia(e, "media")}
        className="hidden"
      />
      <input
        ref={cardThumbInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleReplaceCardMedia(e, "thumb")}
        className="hidden"
      />
      <datalist id="gallery-category-suggestions">
        {GALLERY_CATEGORY_PRESETS.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      {/* 1. PORTFOLIO PHOTOS & VIDÉOS EN PRIORITÉ EN HAUT DE PAGE */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-stone-200 shadow-2xs space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="flex items-start sm:items-center gap-3">
            <AdminLocationIllustration zone="galleryPreview" compact />
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brun">
                Photos &amp; Vidéos de la Galerie ({galleryList.length})
              </h3>
              <p className="text-sm text-stone-600 mt-1">
                Importez directement vos vidéos (1 ou plusieurs à la fois depuis votre iPad), visionnez-les ou réorganisez-les.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={uploadingGallery}
              onClick={() => videoFileInputRef.current?.click()}
              className="min-h-[44px] inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploadingGallery ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-champagne" />
                  <span>
                    {uploadProgress > 0 ? `${uploadProgress}%` : "Envoi..."}
                  </span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-champagne" />
                  <span>Ajouter des vidéos</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={uploadingGallery}
              onClick={() => photoFileInputRef.current?.click()}
              className="min-h-[44px] inline-flex items-center space-x-2 bg-white hover:bg-stone-50 text-brun border border-stone-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-champagne-dark" />
              <span>Ajouter des photos</span>
            </button>

            <button
              type="button"
              onClick={() => setShowVideoModal(true)}
              className="min-h-[44px] inline-flex items-center space-x-2 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <Link2 className="w-4 h-4" />
              <span>Vidéo par lien / salon</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddGalleryItem("photo")}
              className="min-h-[44px] inline-flex items-center space-x-2 bg-stone-100 hover:bg-stone-200 text-brun px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Photo par lien</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMovingGalleryIndex(null);
                setIsCompactGallery(!isCompactGallery);
              }}
              className={`min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
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
                  <span>Réorganiser l&apos;ordre</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barre de progression Cloudinary pendant l'import multi-vidéo */}
        {uploadingGallery && (
          <div className="p-4 rounded-2xl bg-champagne-light/70 border border-champagne space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold text-brun">
              <div className="flex items-center space-x-2 min-w-0">
                <Loader2 className="w-4 h-4 animate-spin text-champagne-dark shrink-0" />
                <span className="truncate">
                  {uploadStatusText || "Envoi vers Cloudinary en cours..."}
                </span>
              </div>
              <span className="font-mono text-xs shrink-0">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-champagne/40">
              <div
                className="h-full bg-brun transition-all duration-150"
                style={{ width: `${Math.max(4, uploadProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Bannière d'action rapide juste après ajout d'une nouvelle vidéo */}
        {recentlyAddedCount > 0 && hasUnsavedChanges && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-emerald-950 font-medium">
              <strong>
                {recentlyAddedCount} {recentlyAddedCount > 1 ? "nouveaux médias ajoutés" : "nouveau média ajouté"}
              </strong>{" "}
              tout en haut (#1) — ajustez le titre ou la catégorie puis publiez !
            </div>
            {typeof onSaveNow === "function" && (
              <button
                type="button"
                disabled={savingNow}
                onClick={onSaveNow}
                className="min-h-[44px] inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {savingNow ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Publier maintenant</span>
              </button>
            )}
          </div>
        )}

        {/* Filtres rapides Vidéos / Photos (en vue détaillée) */}
        {!isCompactGallery && galleryList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "ALL", label: "Toutes", count: galleryList.length },
              { key: "VIDEO", label: "Vidéos", count: totalVideos },
              { key: "PHOTO", label: "Photos", count: totalPhotos },
              { key: "HIDDEN", label: "Masquées", count: totalHidden },
            ]
              .filter((f) => f.key === "ALL" || f.count > 0)
              .map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setMediaFilter(f.key)}
                  className={`min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                    mediaFilter === f.key
                      ? "bg-brun text-creme border-brun"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {f.key === "VIDEO" && <Film className="w-3.5 h-3.5 text-champagne" />}
                  {f.key === "PHOTO" && <ImageIcon className="w-3.5 h-3.5 text-champagne-dark" />}
                  <span>{f.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] ${
                      mediaFilter === f.key
                        ? "bg-champagne text-brun-dark"
                        : "bg-white text-stone-600 border border-stone-200"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
          </div>
        )}

        {isCompactGallery && (
          <div className="p-4 rounded-2xl bg-champagne-light/50 border border-champagne/50 space-y-3 text-sm text-brun">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-champagne-dark shrink-0" />
                <span className="font-medium">
                  Sur iPad ou ordinateur : touchez une photo ou vidéo pour la déplacer, puis touchez sa nouvelle place (ou glissez-déposez).
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMovingGalleryIndex(null);
                  setIsCompactGallery(false);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-stone-300 text-sm font-bold text-brun hover:bg-stone-50 shrink-0 cursor-pointer"
              >
                Revenir à l&apos;édition détaillée
              </button>
            </div>

            {movingGalleryIndex !== null && galleryList[movingGalleryIndex] && (
              <div className="p-3 rounded-xl bg-brun text-creme flex flex-wrap items-center justify-between gap-2.5">
                <div className="text-xs sm:text-sm font-semibold">
                  Déplacement :{" "}
                  <span className="text-champagne">
                    #{movingGalleryIndex + 1} — {galleryList[movingGalleryIndex].title || "Sans titre"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={movingGalleryIndex === 0}
                    onClick={() => moveGalleryItem(movingGalleryIndex, "up")}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold disabled:opacity-35 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>Reculer</span>
                  </button>
                  <button
                    type="button"
                    disabled={movingGalleryIndex === galleryList.length - 1}
                    onClick={() => moveGalleryItem(movingGalleryIndex, "down")}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold disabled:opacity-35 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                    <span>Avancer</span>
                  </button>
                  <button
                    type="button"
                    disabled={movingGalleryIndex === 0}
                    onClick={() => moveGalleryItemTo(movingGalleryIndex, 0)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-champagne text-brun-dark text-xs font-bold disabled:opacity-35 cursor-pointer"
                  >
                    Mettre en #1
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovingGalleryIndex(null)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {galleryList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-3">
            <p className="text-sm text-stone-600">
              La galerie est vide. Ajoutez vos premières vidéos ou photos ci-dessus.
            </p>
          </div>
        ) : isCompactGallery ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {galleryList.map((item, index) => {
              const isSelectedForMove = movingGalleryIndex === index;
              const canPlaceHere = movingGalleryIndex !== null && !isSelectedForMove;
              return (
                <div
                  key={item.id || index}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (movingGalleryIndex === null) {
                      setMovingGalleryIndex(index);
                    } else if (isSelectedForMove) {
                      setMovingGalleryIndex(null);
                    } else {
                      moveGalleryItemTo(movingGalleryIndex, index);
                    }
                  }}
                  draggable
                  onDragStart={(e) => handleDragStartGallery(e, index)}
                  onDragOver={(e) => handleDragOverGallery(e, index)}
                  onDrop={(e) => handleDropGallery(e, index)}
                  onDragEnd={handleDragEndGallery}
                  className={`compact-chip group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer sm:cursor-grab active:cursor-grabbing transition-all select-none shadow-xs bg-stone-900 ${
                    item.visible === false ? "opacity-45" : ""
                  } ${
                    isSelectedForMove
                      ? "ring-4 ring-champagne border-champagne scale-[1.03] z-20"
                      : canPlaceHere
                      ? "border-dashed border-champagne/80 hover:ring-2 hover:ring-champagne"
                      : draggedGalleryIndex === index
                      ? "opacity-30 scale-90 border-dashed border-champagne"
                      : dragOverGalleryIndex === index && draggedGalleryIndex !== index
                      ? "ring-4 ring-champagne border-champagne scale-105 z-20"
                      : "border-stone-200 hover:border-champagne"
                  }`}
                >
                  <AdminThumb item={item} />
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
                      {isSelectedForMove
                        ? "SÉLECTIONNÉE"
                        : canPlaceHere
                        ? `Placer ici (#${index + 1})`
                        : item.visible === false
                        ? "MASQUÉE"
                        : item.category}
                    </span>
                    <h4 className="font-serif font-bold text-xs leading-tight line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIndexedItems.map(({ item, index }) => {
              const isShown = item.visible !== false;
              const isVideo = item.type === "video";
              const isCardUploading = cardUploadingIndex === index;
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
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-sm font-bold text-brun cursor-grab">
                        <GripVertical className="w-4 h-4 text-stone-400" />
                        <span>Réalisation #{index + 1}</span>
                      </span>
                      {isVideo && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brun text-champagne text-xs font-bold">
                          <Film className="w-3.5 h-3.5" />
                          <span>Vidéo</span>
                        </span>
                      )}
                      <select
                        aria-label={`Position de la réalisation ${item.title || index + 1}`}
                        value={index}
                        onChange={(e) => moveGalleryItemTo(index, Number(e.target.value))}
                        className="min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-sm font-semibold text-brun cursor-pointer"
                      >
                        {galleryList.map((_, posIdx) => (
                          <option key={posIdx} value={posIdx}>
                            Pos. #{posIdx + 1}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveGalleryItem(index, "up")}
                        className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span>Monter</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === galleryList.length - 1}
                        onClick={() => moveGalleryItem(index, "down")}
                        className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
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
                        className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-5">
                    {/* Vignette cliquable pour lire la vidéo en direct */}
                    <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-300">
                      <AdminThumb item={item} />
                      {isVideo && item.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          aria-label={`Lire la vidéo ${item.title || ""}`}
                          className="absolute inset-0 bg-black/35 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="w-11 h-11 rounded-full bg-brun/90 border border-champagne text-champagne flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 fill-champagne ml-0.5" />
                          </span>
                        </button>
                      )}
                      {isVideo && !item.videoUrl && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/75 rounded p-1 text-white">
                          <Film className="w-3.5 h-3.5 text-champagne" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 w-full space-y-3">
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
                            className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm font-medium text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
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
                            className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
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
                            list="gallery-category-suggestions"
                            value={item.category || ""}
                            onChange={(e) =>
                              handleGalleryChange(index, "category", e.target.value)
                            }
                            className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                            placeholder="Ex: Knotless, Fulani, Boho Braids..."
                          />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-brun block mb-1">
                            Lien image / miniature {isVideo ? "(optionnel)" : ""}
                          </label>
                          <input
                            type="text"
                            value={item.image || ""}
                            onChange={(e) =>
                              handleGalleryChange(index, "image", e.target.value)
                            }
                            placeholder={isVideo ? "Générée automatiquement si Cloudinary" : "/images/realisations/..."}
                            className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm font-mono text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                          />
                        </div>
                      </div>

                      {isVideo && (
                        <div>
                          <label className="text-sm font-bold text-brun block mb-1">
                            Lien vidéo (Cloudinary / MP4 / MOV)
                          </label>
                          <input
                            type="text"
                            value={item.videoUrl || ""}
                            onChange={(e) =>
                              handleGalleryChange(index, "videoUrl", e.target.value)
                            }
                            className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm font-mono text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                            placeholder="https://res.cloudinary.com/.../video.mp4"
                          />
                        </div>
                      )}

                      {/* Boutons tactiles rapides par carte */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={uploadingGallery || isCardUploading}
                          onClick={() => {
                            targetCardIndexRef.current = index;
                            cardMediaInputRef.current?.click();
                          }}
                          className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs sm:text-sm font-semibold text-brun transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isCardUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-champagne-dark" />
                          ) : (
                            <Upload className="w-4 h-4 text-champagne-dark" />
                          )}
                          <span>
                            {isVideo ? "Remplacer la vidéo" : "Remplacer média (vidéo/photo)"}
                          </span>
                        </button>

                        {isVideo && item.videoUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-champagne-light hover:bg-champagne text-brun-dark border border-champagne text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-brun-dark" />
                            <span>Lire la vidéo</span>
                          </button>
                        )}

                        {isVideo && (
                          <button
                            type="button"
                            disabled={uploadingGallery || isCardUploading}
                            onClick={() => {
                              targetCardIndexRef.current = index;
                              cardThumbInputRef.current?.click();
                            }}
                            className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs sm:text-sm font-semibold text-brun transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-4 h-4 text-stone-600" />
                            <span>Changer miniature</span>
                          </button>
                        )}

                        {isVideo &&
                          item.videoUrl &&
                          item.videoUrl.includes("res.cloudinary.com") && (
                            <button
                              type="button"
                              onClick={() =>
                                handleGalleryChange(
                                  index,
                                  "image",
                                  buildCloudinaryVideoThumbnail(item.videoUrl)
                                )
                              }
                              className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs sm:text-sm font-semibold text-brun transition-colors cursor-pointer"
                            >
                              <Wand2 className="w-4 h-4 text-champagne-dark" />
                              <span>Miniature auto</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. TEXTES DE LA PAGE GALERIE */}
      <SectionCard
        title="En-tête de la page Galerie"
        description="Textes affichés tout en haut de la page Galerie (/galerie)."
        visible={header.visible}
        zone="pageHeader"
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
            label="Petit titre au-dessus"
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
        zone="finalCta"
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
        zone="legal"
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

      {/* Modale de lecture vidéo directe dans l'Admin */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overscroll-contain"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative bg-stone-950 rounded-3xl max-w-md w-full max-h-[88dvh] overflow-hidden border border-stone-700 shadow-2xl flex flex-col"
          >
            <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-champagne font-bold block truncate">
                  {previewItem.category || "Vidéo"}
                </span>
                <h4 className="font-serif text-base font-bold text-creme truncate">
                  {previewItem.title || "Aperçu vidéo"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                aria-label="Fermer l'aperçu vidéo"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-creme inline-flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black flex-1 overflow-hidden">
              <CustomVideoPlayer
                src={previewItem.videoUrl || previewItem.video}
                poster={resolveGalleryPosterUrl(previewItem)}
                title={previewItem.title}
                autoPlay={true}
                hideTitleOverlay={true}
                videoMaxHeightClass="max-h-[calc(88dvh-5rem)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modale d'ajout de vidéo par lien OU depuis les vidéos du salon / prestations */}
      {showVideoModal && (
        <div
          onClick={() => setShowVideoModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs overscroll-contain"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88dvh] flex flex-col overflow-hidden border border-stone-300 shadow-2xl"
          >
            <div className="px-5 sm:px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-brun">
                  Ajouter une vidéo par lien ou depuis le salon
                </h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Collez un lien vidéo (Cloudinary / MP4) ou choisissez une vidéo existante.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                aria-label="Fermer la fenêtre"
                className="w-11 h-11 rounded-full bg-stone-200/80 hover:bg-stone-300 text-brun inline-flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">
              <form onSubmit={handleAddVideoFromUrl} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-brun block mb-1">
                    Lien de la vidéo (MP4, MOV ou Cloudinary) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../video.mp4"
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm font-mono text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-brun block mb-1">
                      Titre affiché
                    </label>
                    <input
                      type="text"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      placeholder="Ex: Boho Braids été"
                      className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-brun block mb-1">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      list="gallery-category-suggestions"
                      value={newVideoCategory}
                      onChange={(e) => setNewVideoCategory(e.target.value)}
                      className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-brun block mb-1">
                    Lien miniature (optionnel — automatique si Cloudinary)
                  </label>
                  <input
                    type="text"
                    value={newVideoThumb}
                    onChange={(e) => setNewVideoThumb(e.target.value)}
                    placeholder="Laisser vide pour extraire la première image"
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm font-mono text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-5 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 text-champagne" />
                  <span>Ajouter cette vidéo à la galerie</span>
                </button>
              </form>

              {libraryVideos.length > 0 && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <h4 className="font-serif text-base font-bold text-brun">
                    Ou reprendre une vidéo existante du salon ({libraryVideos.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {libraryVideos.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleAddLibraryVideo(entry)}
                        className="p-2.5 rounded-2xl border border-stone-200 hover:border-champagne hover:bg-champagne-light/30 flex items-center gap-3 text-left transition-all cursor-pointer"
                      >
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-stone-900 shrink-0">
                          <AdminThumb item={entry} />
                          <span className="absolute bottom-1 right-1 bg-black/80 rounded p-0.5 text-champagne">
                            <Film className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] uppercase tracking-wider text-champagne-dark font-bold block truncate">
                            {entry.category}
                          </span>
                          <span className="text-sm font-bold text-brun block truncate">
                            {entry.title}
                          </span>
                          <span className="text-[11px] text-stone-500 block truncate">
                            {entry.sourceLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
