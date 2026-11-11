"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  ArrowUp,
  ArrowDown,
  GripVertical,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  Upload,
  Film,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { uploadMediaClient } from "@/lib/uploadMedia";
import { AdminLocationIllustration } from "./admin/AdminVisualGuide";
import {
  createServiceFormDraft,
  updateDraftBasePrice,
  updateDraftLengthPrice,
  updateDraftLengthName,
  activateDraftLengthOptions,
  deactivateDraftLengthOptions,
  addDraftLengthChoice,
  removeDraftLengthChoice,
  buildServicePayloadFromDraft,
  inferIncludesHairFromCategory,
  parseDecimalInput,
  formatEuroAmount,
  roundPrice,
} from "@/lib/servicePricing";

// Liste des visuels disponibles au salon pour sélection rapide en 1 clic
const AVAILABLE_SALON_IMAGES = [
  { label: "Knotless classique", path: "/images/realisations/knotless-still.jpeg" },
  { label: "Small Knotless", path: "/images/realisations/small-knotless-still.jpeg" },
  { label: "Knotless Large", path: "/images/realisations/knotless-large-still.jpeg" },
  { label: "French curls Medium", path: "/images/realisations/french-curl-medium-still.jpeg" },
  { label: "Knotless Bicolore", path: "/images/realisations/knotless-melange-couleur-still.jpeg" },
  { label: "Knotless Traçage net", path: "/images/realisations/IMG_3401_still.jpeg" },
  { label: "Fulani classique", path: "/images/realisations/fulani-still.jpeg" },
  { label: "Fulani Sup boucle", path: "/images/realisations/fulani-sup-boucle-still.jpeg" },
  { label: "Fulani Sup boucle 2", path: "/images/realisations/fulani-sup-boucle-2-still.jpeg" },
  { label: "Fulani Sans rajout", path: "/images/realisations/fulani-sans-rajout-still.jpeg" },
  { label: "Fulani Sur-mesure", path: "/images/realisations/fulani-sur-mesure-still.jpeg" },
  { label: "Fulani Bordeaux", path: "/images/realisations/IMG_3475_still.jpeg" },
  { label: "Fulani 7 (Détail)", path: "/images/realisations/fulani-7.png" },
  { label: "Fulani 8 (Pose)", path: "/images/realisations/fulani-8.jpeg" },
  { label: "Boho Braids", path: "/images/realisations/boho-braids-still.jpeg" },
  { label: "Boho Braids 2", path: "/images/realisations/boho-braids-2-still.jpeg" },
  { label: "Boho Braids Caramel", path: "/images/realisations/FE8CAC4A-8B5A-4FDF-A6AF-67D0E81C5151_still.jpeg" },
  { label: "Vanille avec mèches", path: "/images/realisations/vanille-2-still.jpeg" },
  { label: "Vanille naturelle", path: "/images/realisations/vanille-still.jpeg" },
  { label: "Vanille sans rajout", path: "/images/realisations/vanille-sans-rajout-still.jpeg" },
  { label: "Vanilles profil", path: "/images/realisations/IMG_3738_still.jpeg" },
  { label: "Natte collée sans rajout", path: "/images/realisations/natte-collee-sans-rajout-still.jpeg" },
  { label: "Natte collée sans rajout 2", path: "/images/realisations/natte-collee-sans-rajout-2-still.jpeg" },
  { label: "Natte collée homme", path: "/images/realisations/IMG_4027_still.jpeg" },
  { label: "Cornrows 2", path: "/images/realisations/cornrows-2-still.jpeg" },
  { label: "Cornrow Rouge", path: "/images/realisations/cornrow-rouge-still.jpeg" },
  { label: "Soft Locs", path: "/images/realisations/soft-locs-still.jpeg" },
  { label: "Soft Locs Partie 2", path: "/images/realisations/soft-locks-part-2-still.jpeg" },
];

const VIDEO_MAP = {
  "/images/realisations/knotless-still.jpeg": "/videos/realisations/knotless.mp4",
  "/images/realisations/small-knotless-still.jpeg": "/videos/realisations/small-knotless.mp4",
  "/images/realisations/knotless-large-still.jpeg": "/videos/realisations/knotless-large.mp4",
  "/images/realisations/knotless-melange-couleur-still.jpeg": "/videos/realisations/knotless-melange-couleur.mp4",
  "/images/realisations/fulani-still.jpeg": "/videos/realisations/fulani.mp4",
  "/images/realisations/fulani-sup-boucle-still.jpeg": "/videos/realisations/fulani-sup-boucle.mp4",
  "/images/realisations/fulani-sup-boucle-2-still.jpeg": "/videos/realisations/fulani-sup-boucle-2.mp4",
  "/images/realisations/fulani-sans-rajout-still.jpeg": "/videos/realisations/fulani-sans-rajout.mp4",
  "/images/realisations/fulani-sur-mesure-still.jpeg": "/videos/realisations/fulani-sur-mesure.mp4",
  "/images/realisations/boho-braids-still.jpeg": "/videos/realisations/boho-braids.mp4",
  "/images/realisations/boho-braids-2-still.jpeg": "/videos/realisations/boho-braids-2.mp4",
  "/images/realisations/vanille-still.jpeg": "/videos/realisations/vanille.mp4",
  "/images/realisations/vanille-2-still.jpeg": "/videos/realisations/vanille-2.mp4",
  "/images/realisations/vanille-sans-rajout-still.jpeg": "/videos/realisations/vanille-sans-rajout.mp4",
  "/images/realisations/natte-collee-sans-rajout-still.jpeg": "/videos/realisations/natte-collee-sans-rajout.mp4",
  "/images/realisations/cornrows-2-still.jpeg": "/videos/realisations/cornrows-2.mp4",
  "/images/realisations/cornrow-rouge-still.jpeg": "/videos/realisations/cornrow-rouge.mp4",
  "/images/realisations/soft-locs-still.jpeg": "/videos/realisations/soft-locs.mp4",
  "/images/realisations/soft-locks-part-2-still.jpeg": "/videos/realisations/soft-locks-part-2.mp4",
  "/images/realisations/french-curl-medium-still.jpeg": "/videos/realisations/french-curl-medium.mp4",
};

export default function AdminServicesView({ initialServices = [] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  // Drag and Drop & iPad 2-Tap Reorder state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [movingIndex, setMovingIndex] = useState(null);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  // Form State (stocke des chaînes libres pour permettre l'effacement complet au clavier)
  const [form, setForm] = useState(() => createServiceFormDraft(null));

  // Custom Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showManualUrls, setShowManualUrls] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Media Upload State (Vidéos et Photos vers Cloudinary)
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const serviceFileInputRef = useRef(null);

  const currentLengthOption = form.lengthOption;

  const lengthPricePreviewBase = useMemo(() => {
    if (!currentLengthOption || !Array.isArray(currentLengthOption.choices)) {
      return null;
    }
    const validTotals = currentLengthOption.choices
      .map((c) => parseDecimalInput(c.priceInput))
      .filter((v) => v !== null);
    if (validTotals.length === 0) return null;
    return Math.min(...validTotals);
  }, [currentLengthOption]);

  const handleActivateLengthOptions = () => {
    setForm((prev) => activateDraftLengthOptions(prev));
  };

  const handleUpdateChoice = (cIdx, field, val) => {
    if (field === "totalPrice") {
      setForm((prev) => updateDraftLengthPrice(prev, cIdx, val));
    } else if (field === "name") {
      setForm((prev) => updateDraftLengthName(prev, cIdx, val));
    }
  };

  const handleAddLengthChoice = () => {
    setForm((prev) => addDraftLengthChoice(prev));
  };

  const handleRemoveLengthChoice = (cIdx) => {
    setForm((prev) => removeDraftLengthChoice(prev, cIdx));
  };

  const handleRemoveAllLengths = () => {
    setForm((prev) => deactivateDraftLengthOptions(prev));
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    setUploadProgress(0);
    try {
      const res = await uploadMediaClient(file, {
        onProgress: (pct) => setUploadProgress(pct),
      });
      if (res.isVideo) {
        setForm((prev) => ({
          ...prev,
          videoUrl: res.url,
          imageUrl: res.thumbnailUrl || prev.imageUrl,
        }));
        showToast("Vidéo Cloudinary envoyée et enregistrée avec succès !");
      } else {
        setForm((prev) => ({
          ...prev,
          imageUrl: res.url,
        }));
        showToast("Photo Cloudinary envoyée et enregistrée avec succès !");
      }
    } catch (err) {
      showToast("Erreur lors de l'envoi sur Cloudinary : " + err.message);
    } finally {
      setUploadingMedia(false);
      setUploadProgress(0);
      if (e.target) e.target.value = "";
    }
  };

  // Unique existing categories list
  const existingCategories = useMemo(() => {
    const defaultList = [
      "Sans rajouts",
      "Sans mèches incluses",
      "Avec mèches incluses",
      "Knotless Braids",
      "Fulani Braids",
      "Boho Braids",
      "Vanilles",
      "Nattes collées",
      "Cornrows",
      "Soft Locs",
      "Sur-Mesure",
    ];
    const fromServices = services.map((s) => s.category).filter(Boolean);
    return Array.from(new Set([...defaultList, ...fromServices]));
  }, [services]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setIsCreatingCategory(false);
    setNewCategoryName("");
    setShowImagePicker(false);
    setShowManualUrls(false);
    setForm(
      createServiceFormDraft(null, {
        defaultCategory: existingCategories[0] || "Sans mèches incluses",
        videoMap: VIDEO_MAP,
      })
    );
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setIsCreatingCategory(false);
    setNewCategoryName("");
    setShowImagePicker(false);
    setShowManualUrls(false);
    setForm(
      createServiceFormDraft(service, {
        defaultCategory: "Sans mèches incluses",
        videoMap: VIDEO_MAP,
      })
    );
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (isCreatingCategory && !newCategoryName.trim()) {
      showToast("Veuillez saisir le nom de la nouvelle catégorie.");
      return;
    }

    const finalCategory = isCreatingCategory
      ? newCategoryName.trim()
      : form.category;

    const matchedVideo =
      form.videoUrl || VIDEO_MAP[form.imageUrl] || editingService?.videoUrl || "";

    const { payload, error } = buildServicePayloadFromDraft(form, {
      categoryOverride: finalCategory,
      videoUrlOverride: matchedVideo,
    });

    if (error) {
      showToast(error);
      return;
    }

    setSubmitting(true);

    try {
      if (editingService) {
        const id = editingService.id || editingService._id;
        const res = await fetch(`/api/admin/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setServices((prev) =>
            prev.map((s) => ((s.id || s._id) === id ? data.service : s))
          );
          router.refresh();
          showToast("Prestation mise à jour avec succès !");
          setModalOpen(false);
        } else {
          showToast(data.error || "Erreur lors de la modification.");
        }
      } else {
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setServices((prev) => [...prev, data.service]);
          router.refresh();
          showToast("Nouvelle prestation créée avec succès !");
          setModalOpen(false);
        } else {
          showToast(data.error || "Erreur lors de la création.");
        }
      }
    } catch (err) {
      showToast("Impossible d'enregistrer la prestation pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette prestation du catalogue ?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices((prev) => prev.filter((s) => (s.id || s._id) !== id));
        router.refresh();
        showToast("Prestation retirée avec succès.");
      } else {
        showToast(data.error || "Impossible de supprimer cette prestation.");
      }
    } catch (e) {
      showToast("Impossible de supprimer cette prestation pour le moment.");
    }
  };

  const handleToggleActive = async (service) => {
    const id = service.id || service._id;
    const newStatus = !service.isActive;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices((prev) =>
          prev.map((s) => ((s.id || s._id) === id ? data.service : s))
        );
        router.refresh();
        showToast(
          newStatus
            ? "Prestation rendue visible aux clientes."
            : "Prestation masquée du catalogue."
        );
      } else {
        showToast(data.error || "Impossible de modifier la visibilité.");
      }
    } catch (e) {
      showToast("Impossible de modifier la visibilité de cette prestation.");
    }
  };

  // Drag and drop & iPad tap reordering
  const handleDropService = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex === null || toIndex === null) return;
    const newServices = [...services];
    const [moved] = newServices.splice(fromIndex, 1);
    newServices.splice(toIndex, 0, moved);

    const updated = newServices.map((s, idx) => ({ ...s, order: idx + 1 }));
    setServices(updated);
    setMovingIndex(null);

    try {
      const responses = await Promise.all(
        updated.map((s) =>
          fetch(`/api/admin/services/${s.id || s._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: s.order }),
          })
        )
      );
      if (responses.some((r) => !r.ok)) {
        showToast("Une erreur est survenue lors de l'enregistrement de l'ordre.");
        return;
      }
      router.refresh();
      showToast("Emplacement des prestations réorganisé avec succès !");
    } catch (_) {
      showToast("Erreur lors de la mise à jour de l'ordre.");
    }
  };

  const handleMoveService = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;
    await handleDropService(index, targetIndex);
  };

  const handleCompactCardTap = (index) => {
    if (movingIndex === null) {
      setMovingIndex(index);
    } else if (movingIndex === index) {
      setMovingIndex(null);
    } else {
      handleDropService(movingIndex, index);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-20 lg:top-6 right-4 lg:right-6 z-50 bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs sm:text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 flex-1">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
              Coiffures &amp; Tarifs
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Modifiez vos prix, longueurs, photos et l&apos;ordre d&apos;affichage sur le site.
            </p>
          </div>
          <AdminLocationIllustration zone="serviceCard" compact />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Bouton pour réorganiser facilement l'ordre */}
          <button
            type="button"
            onClick={() => {
              setIsCompactMode(!isCompactMode);
              setMovingIndex(null);
            }}
            className={`min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              isCompactMode
                ? "bg-champagne text-brun-dark border-champagne-dark shadow-xs ring-2 ring-champagne/40"
                : "bg-white text-stone-700 border-stone-200 hover:border-champagne hover:bg-stone-50"
            }`}
            title={isCompactMode ? "Revenir à la vue détaillée" : "Réorganiser l'ordre des coiffures"}
          >
            {isCompactMode ? (
              <>
                <ZoomIn className="w-4 h-4 text-brun" />
                <span>Vue détaillée</span>
              </>
            ) : (
              <>
                <ZoomOut className="w-4 h-4 text-champagne-dark" />
                <span>Réorganiser l&apos;ordre</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[44px] inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter une coiffure</span>
          </button>
        </div>
      </div>

      {/* Message d'aide + Contrôles 2-taps iPad en mode réorganisation */}
      {isCompactMode && (
        <div className="p-4 rounded-2xl bg-champagne-light/60 border-2 border-champagne/60 space-y-3 text-xs sm:text-sm text-brun animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5 sm:mt-0" />
              <span className="font-medium">
                {movingIndex !== null && services[movingIndex]
                  ? `Déplacement de « ${services[movingIndex].name} » (#${movingIndex + 1}) : touchez une autre carte pour l'y placer, ou utilisez les boutons ci-dessous.`
                  : "Touchez une coiffure puis touchez l'emplacement où la placer (ou glissez-déposez à la souris)."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCompactMode(false);
                setMovingIndex(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-bold text-brun hover:bg-stone-50 shrink-0 cursor-pointer"
            >
              Retour vue détaillée
            </button>
          </div>

          {movingIndex !== null && services[movingIndex] && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-champagne/40">
              <button
                type="button"
                disabled={movingIndex === 0}
                onClick={() => handleDropService(movingIndex, movingIndex - 1)}
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-bold text-brun disabled:opacity-40 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4 -rotate-90" />
                <span>Reculer</span>
              </button>
              <button
                type="button"
                disabled={movingIndex === services.length - 1}
                onClick={() => handleDropService(movingIndex, movingIndex + 1)}
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-bold text-brun disabled:opacity-40 cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 -rotate-90" />
                <span>Avancer</span>
              </button>
              <button
                type="button"
                disabled={movingIndex === 0}
                onClick={() => handleDropService(movingIndex, 0)}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-bold text-brun disabled:opacity-40 cursor-pointer"
              >
                Mettre en #1
              </button>
              <button
                type="button"
                onClick={() => openEditModal(services[movingIndex])}
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-brun text-creme text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-champagne" />
                <span>Modifier cette coiffure</span>
              </button>
              <button
                type="button"
                onClick={() => setMovingIndex(null)}
                className="px-3.5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs sm:text-sm font-semibold cursor-pointer ml-auto"
              >
                Annuler sélection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Services Grid avec Drag & Drop + 2-Tap iPad Reordering */}
      {isCompactMode ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {services.map((service, index) => {
            const id = service.id || service._id;
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;
            const isSelectedForMove = movingIndex === index;
            const isDropTargetCandidate = movingIndex !== null && movingIndex !== index;

            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                aria-label={`${service.name}, position ${index + 1}`}
                onClick={() => handleCompactCardTap(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCompactCardTap(index);
                  }
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", index.toString());
                  setDraggedIndex(index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverIndex !== index) setDragOverIndex(index);
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) setDragOverIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                  if (!isNaN(fromIdx)) {
                    handleDropService(fromIdx, index);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 select-none shadow-xs ${
                  isSelectedForMove
                    ? "ring-4 ring-champagne border-champagne scale-[1.03] shadow-2xl z-20"
                    : isDragging
                    ? "opacity-30 scale-90 border-dashed border-champagne shadow-inner"
                    : isOver
                    ? "ring-4 ring-champagne border-champagne scale-105 shadow-2xl z-20"
                    : isDropTargetCandidate
                    ? "border-dashed border-champagne/80 hover:border-champagne bg-stone-900"
                    : "border-stone-200 hover:border-champagne hover:scale-[1.02] hover:shadow-md bg-stone-900"
                }`}
                title={`${service.name} (#${index + 1}) - Toucher pour déplacer`}
              >
                <Image
                  src={
                    service.images?.[0] ||
                    "/images/realisations/knotless-still.jpeg"
                  }
                  alt={service.name || "Prestation YDM"}
                  fill
                  className="object-cover object-center pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                {/* Badge numéro */}
                <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 bg-brun/90 backdrop-blur-md text-creme text-[10px] font-bold px-2 py-0.5 rounded-full border border-champagne/40 shadow-xs">
                  <GripVertical className="w-3 h-3 text-champagne" />
                  <span>#{index + 1}</span>
                </div>

                {/* Prix */}
                <div className="absolute top-2 right-2 z-10 bg-black/75 backdrop-blur-xs text-champagne font-serif font-bold text-[11px] px-2 py-0.5 rounded-md border border-white/10">
                  {formatPrice(service.price)}
                </div>

                {isDropTargetCandidate && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
                    <span className="inline-block bg-brun/90 text-champagne border border-champagne/70 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      Placer ici (#{index + 1})
                    </span>
                  </div>
                )}

                {isSelectedForMove && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
                    <span className="inline-block bg-champagne text-brun-dark text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      Sélectionnée
                    </span>
                  </div>
                )}

                {/* Titre et catégorie */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                  <span className="text-[9px] uppercase tracking-wider text-stone-300 block truncate">
                    {service.category}
                  </span>
                  <h4 className="font-serif font-bold text-xs leading-tight line-clamp-1 drop-shadow-sm">
                    {service.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const id = service.id || service._id;
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", index.toString());
                setDraggedIndex(index);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverIndex !== index) setDragOverIndex(index);
              }}
              onDragLeave={() => {
                if (dragOverIndex === index) setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                if (!isNaN(fromIdx)) {
                  handleDropService(fromIdx, index);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 relative select-none flex flex-col ${
                isDragging
                  ? "opacity-40 scale-95 border-dashed border-stone-400"
                  : isOver
                  ? "ring-2 ring-champagne border-champagne scale-[1.02] shadow-xl"
                  : service.isActive
                  ? "border-stone-200 shadow-2xs hover:shadow-md"
                  : "border-stone-300 opacity-75 bg-stone-50"
              }`}
            >
              {/* Drag Handle Top Bar */}
              <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 bg-brun/85 backdrop-blur-md text-creme text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md border border-white/20">
                <GripVertical className="w-3.5 h-3.5 text-champagne" />
                <span>#{index + 1}</span>
              </div>

              <div className="relative aspect-[3/4] w-full bg-stone-100">
                <Image
                  src={
                    service.images?.[0] ||
                    "/images/realisations/knotless-still.jpeg"
                  }
                  alt={service.name || "Prestation YDM"}
                  fill
                  className="object-cover object-center pointer-events-none"
                />
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {service.category}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-brun text-base sm:text-lg leading-snug">
                      {service.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(service)}
                      title={service.isActive ? "Masquer du site public" : "Activer sur le site"}
                      aria-label={service.isActive ? "Masquer du site public" : "Activer sur le site"}
                      className="w-11 h-11 -mr-2 -mt-2 rounded-xl flex items-center justify-center text-stone-400 hover:text-brun hover:bg-stone-100 shrink-0 cursor-pointer"
                    >
                      {service.isActive ? (
                        <ToggleRight className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-stone-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 font-light">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-serif font-bold text-brun text-lg">
                      {formatPrice(service.price)}
                    </span>
                    <div className="text-xs text-stone-500 font-medium">
                      Acompte : {formatPrice(service.depositAmount ?? 10)}
                    </div>
                  </div>

                  {/* Contrôles tactiles iPad : Position directe, Monter/Descendre, Modifier, Supprimer */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <select
                        aria-label={`Position de ${service.name}`}
                        value={index}
                        onChange={(e) => handleDropService(index, Number(e.target.value))}
                        className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-brun cursor-pointer focus:outline-none focus:ring-2 focus:ring-champagne"
                        title="Choisir la position directement"
                      >
                        {services.map((_, posIdx) => (
                          <option key={posIdx} value={posIdx}>
                            Pos. #{posIdx + 1}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveService(index, "up")}
                        className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                        title="Monter d'une place"
                        aria-label="Monter"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === services.length - 1}
                        onClick={() => handleMoveService(index, "down")}
                        className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                        title="Descendre d'une place"
                        aria-label="Descendre"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="inline-flex items-center space-x-1.5 px-3.5 min-h-[44px] rounded-xl bg-champagne-light/80 hover:bg-champagne text-brun-dark font-semibold text-xs transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(id)}
                        className="w-11 h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Supprimer"
                        aria-label="Supprimer cette prestation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* CREATE / EDIT MODAL SANS BUG D'URL ET OPTIMISÉ CLAVIER IPAD */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full border border-stone-300 shadow-2xl max-h-[88dvh] flex flex-col overflow-hidden overscroll-contain"
          >
            {/* Sticky Header */}
            <div className="px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between border-b border-stone-100 shrink-0 bg-white">
              <h3 className="font-serif text-xl font-bold text-brun">
                {editingService ? "Modifier la prestation" : "Nouvelle prestation"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fermer la fenêtre"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="admin-service-form"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 text-sm overscroll-contain"
            >
              <div>
                <label className="font-semibold text-brun block mb-1.5">
                  Nom de la prestation *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Knotless Braids Medium"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
                />
              </div>

              {/* Catégorie dynamique avec création de nouvelle catégorie */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="font-semibold text-brun">
                    Catégorie *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(!isCreatingCategory);
                      setNewCategoryName("");
                    }}
                    className="text-xs text-champagne-dark hover:underline font-semibold cursor-pointer px-2 py-1"
                  >
                    {isCreatingCategory
                      ? "Choisir une catégorie existante"
                      : "+ Créer une nouvelle catégorie"}
                  </button>
                </div>

                {isCreatingCategory ? (
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Tapez le nom de la nouvelle catégorie..."
                    className="w-full bg-stone-50 border border-champagne rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                    autoFocus
                  />
                ) : (
                  <select
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === "__NEW__") {
                        setIsCreatingCategory(true);
                        setNewCategoryName("");
                      } else {
                        const nextCategory = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          category: nextCategory,
                          includesHair: inferIncludesHairFromCategory(
                            nextCategory,
                            prev.includesHair
                          ),
                        }));
                      }
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
                  >
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__NEW__">+ Créer une nouvelle catégorie...</option>
                  </select>
                )}
              </div>

              {/* Tarifs (Prix et Acompte uniquement, sans champ d'heures) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-brun block mb-1.5">
                    Prix de base (€) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={form.priceInput}
                    onChange={(e) =>
                      setForm((prev) => updateDraftBasePrice(prev, e.target.value))
                    }
                    placeholder="Ex: 35"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base font-semibold text-brun focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brun block mb-1.5">
                    Montant de l'acompte (€) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={form.depositInput}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, depositInput: e.target.value }))
                    }
                    placeholder="Ex: 10"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base font-semibold text-brun focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>
              </div>

              {/* Longueurs & Options Tarifaires (Court, Mi-long, Long, Extra long...) */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-serif font-bold text-base text-brun block">
                      Options de longueurs & tarifs
                    </span>
                    <span className="text-xs text-stone-500 font-light">
                      Le tarif affiché sur la fiche (« Dès ... € ») suit automatiquement la longueur la moins chère.
                    </span>
                  </div>
                  {currentLengthOption && (
                    <button
                      type="button"
                      onClick={handleRemoveAllLengths}
                      className="text-xs text-stone-600 hover:text-red-600 font-semibold px-3 py-1.5 rounded-lg bg-white border border-stone-200 transition-colors shrink-0 cursor-pointer"
                    >
                      Désactiver (tarif unique)
                    </button>
                  )}
                </div>

                {!currentLengthOption ? (
                  <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-center space-y-2.5">
                    <p className="text-xs sm:text-sm text-stone-600">
                      Prestation actuellement en tarif unique (
                      <strong>
                        {parseDecimalInput(form.priceInput) !== null
                          ? `${formatEuroAmount(parseDecimalInput(form.priceInput))} €`
                          : "à saisir"}
                      </strong>
                      ).
                    </p>
                    <button
                      type="button"
                      onClick={handleActivateLengthOptions}
                      className="inline-flex items-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-brun" />
                      <span>Activer les choix de longueurs (Court, Mi-long, Long...)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="space-y-2.5">
                      {currentLengthOption.choices.map((choice, cIdx) => {
                        const parsedTotal = parseDecimalInput(choice.priceInput);
                        const diff =
                          parsedTotal !== null && lengthPricePreviewBase !== null
                            ? roundPrice(parsedTotal - lengthPricePreviewBase)
                            : null;

                        return (
                          <div
                            key={cIdx}
                            className="p-3 bg-white border border-stone-200 rounded-xl flex flex-wrap sm:flex-nowrap items-end gap-2.5 text-sm"
                          >
                            <div className="flex-1 min-w-[140px]">
                              <label className="text-[11px] text-stone-500 block font-medium mb-1">
                                Intitulé
                              </label>
                              <input
                                type="text"
                                value={choice.name}
                                onChange={(e) => handleUpdateChoice(cIdx, "name", e.target.value)}
                                placeholder="Nom (ex: Mi-long)"
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm font-medium text-brun focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne"
                              />
                            </div>

                            <div className="w-28">
                              <label className="text-[11px] text-stone-500 block font-medium mb-1 text-right">
                                Prix client
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={choice.priceInput}
                                  onChange={(e) => handleUpdateChoice(cIdx, "totalPrice", e.target.value)}
                                  placeholder="0"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-base lg:text-sm font-bold text-brun text-right pr-7 focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-xs pointer-events-none">
                                  €
                                </span>
                              </div>
                            </div>

                            <div className="w-16 text-right pb-2.5 font-mono text-xs text-stone-500 shrink-0">
                              {diff === null
                                ? "—"
                                : diff > 0
                                ? `+${formatEuroAmount(diff)}€`
                                : "Base"}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLengthChoice(cIdx)}
                              className="w-11 h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                              title="Supprimer cette longueur"
                              aria-label="Supprimer cette longueur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLengthChoice}
                      className="w-full py-2.5 border border-dashed border-stone-300 hover:border-champagne rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:text-brun flex items-center justify-center space-x-1.5 transition-colors bg-white/60 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter une longueur supplémentaire</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Visuel, Vidéo & Téléversement Cloudinary */}
              <div className="space-y-3">
                {/* Bloc téléversement direct depuis appareil */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-brun flex items-center space-x-1.5">
                      <Upload className="w-4 h-4 text-champagne-dark" />
                      <span>Ajouter une vidéo ou photo depuis cet appareil</span>
                    </span>
                    {uploadingMedia && (
                      <span className="text-xs text-champagne-dark font-semibold flex items-center space-x-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>
                          Envoi Cloudinary{uploadProgress > 0 ? ` (${uploadProgress}%)` : "..."}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Téléversez vos fichiers vidéo (MOV, MP4) ou photos directement depuis votre iPad, téléphone ou ordinateur.
                  </p>

                  <input
                    ref={serviceFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={uploadingMedia}
                      onClick={() => serviceFileInputRef.current?.click()}
                      className="inline-flex items-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-brun" />
                      <span>Choisir un fichier sur mon appareil</span>
                    </button>

                    {form.videoUrl && (
                      <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl font-medium">
                        <Film className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Vidéo Cloudinary liée</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Aperçu visuel + Photo / Vidéo */}
                <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-brun text-xs sm:text-sm">
                      Aperçu de la photo principale
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(!showImagePicker)}
                        className="text-xs text-champagne-dark hover:underline font-semibold flex items-center space-x-1 px-2 py-1 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>
                          {showImagePicker
                            ? "Masquer les photos du salon"
                            : "Choisir parmi les photos du salon"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManualUrls(!showManualUrls)}
                        className="text-xs text-stone-500 hover:text-brun underline font-medium px-2 py-1 cursor-pointer"
                      >
                        {showManualUrls
                          ? "Masquer les liens"
                          : "Modifier les liens manuellement"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                      <Image
                        src={
                          form.imageUrl ||
                          "/images/realisations/knotless-still.jpeg"
                        }
                        alt={form.name || "Aperçu prestation"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5 text-xs text-stone-600">
                      <div>
                        {form.imageUrl ? (
                          <span className="inline-block font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Photo prête à l&apos;affichage
                          </span>
                        ) : (
                          <span className="text-stone-400">
                            Aucune photo sélectionnée (image par défaut utilisée).
                          </span>
                        )}
                      </div>
                      {form.videoUrl && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                            <Film className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Vidéo attachée</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, videoUrl: "" })}
                            className="text-xs text-red-600 hover:underline px-1.5 py-0.5 cursor-pointer"
                          >
                            Retirer la vidéo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Champs avancés cachés par défaut */}
                  {showManualUrls && (
                    <div className="space-y-3 pt-3 border-t border-stone-200">
                      <div>
                        <label className="font-semibold text-brun text-xs block mb-1">
                          Lien de la photo
                        </label>
                        <input
                          type="text"
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                          placeholder="/images/realisations/... ou https://..."
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-brun font-mono text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-brun text-xs block mb-1">
                          Lien de la vidéo (optionnel)
                        </label>
                        <input
                          type="text"
                          value={form.videoUrl}
                          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                          placeholder="https://res.cloudinary.com/.../video.mp4"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-brun font-mono text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sélecteur visuel en 1 clic */}
                  {showImagePicker && (
                    <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200 rounded-2xl max-h-56 overflow-y-auto space-y-2">
                      <p className="text-xs text-stone-500 font-medium">
                        Touchez une photo pour l'assigner directement :
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {AVAILABLE_SALON_IMAGES.map((img) => (
                          <button
                            type="button"
                            key={img.path}
                            onClick={() => {
                              setForm({ ...form, imageUrl: img.path });
                              setShowImagePicker(false);
                            }}
                            className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              form.imageUrl === img.path
                                ? "ring-2 ring-champagne border-champagne"
                                : "border-stone-200"
                            }`}
                            title={img.label}
                          >
                            <Image
                              src={img.path}
                              alt={img.label}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-brun block mb-1.5">
                  Description détaillée
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Technique, rendu, confort, tenue..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <label className="inline-flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer min-h-[44px] text-xs sm:text-sm font-medium text-brun">
                  <input
                    type="checkbox"
                    checked={Boolean(form.includesHair)}
                    onChange={(e) =>
                      setForm({ ...form, includesHair: e.target.checked })
                    }
                    className="w-4 h-4 accent-brun rounded border-stone-300 text-brun"
                  />
                  <span>Mèches incluses (couleurs + tarif étudiant)</span>
                </label>

                <label className="inline-flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer min-h-[44px] text-xs sm:text-sm font-medium text-brun">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) =>
                      setForm({ ...form, isPopular: e.target.checked })
                    }
                    className="w-4 h-4 accent-brun rounded border-stone-300 text-brun"
                  />
                  <span>Mettre en avant sur l'accueil</span>
                </label>

                <label className="inline-flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer min-h-[44px] text-xs sm:text-sm font-medium text-brun">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-brun rounded border-stone-300 text-brun"
                  />
                  <span>Visible sur le site</span>
                </label>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="px-6 py-4 sm:px-8 border-t border-stone-100 bg-stone-50/90 flex items-center justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-200/70 font-medium transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="admin-service-form"
                disabled={submitting}
                className="inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4 text-champagne" />
                <span>{submitting ? "Enregistrement..." : "Enregistrer la prestation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
