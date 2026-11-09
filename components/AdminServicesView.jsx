"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
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
  const [services, setServices] = useState(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    category: "Sans mèches incluses",
    price: 35,
    duration: 180, // Valeur par défaut conservée en arrière-plan sans affichage
    depositAmount: 10,
    description: "",
    imageUrl: "/images/realisations/knotless-still.jpeg",
    videoUrl: "",
    options: [],
    isActive: true,
    isPopular: false,
  });

  // Custom Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Media Upload State (Vidéos et Photos vers Cloudinary)
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const serviceFileInputRef = useRef(null);

  // Longueurs & Options Tarifaires
  const lengthOptionIndex = useMemo(() => {
    return Array.isArray(form.options)
      ? form.options.findIndex((opt) =>
          (opt.name || "").toLowerCase().includes("longueur")
        )
      : -1;
  }, [form.options]);

  const currentLengthOption =
    lengthOptionIndex >= 0 ? form.options[lengthOptionIndex] : null;

  const handleActivateLengthOptions = () => {
    const baseP = Number(form.price) || 35;
    const defaultOption = {
      name: "Longueur souhaitée",
      required: true,
      choices: [
        { label: `Court (${baseP} €)`, priceDiff: 0, durationDiff: 0 },
        { label: `Mi-long (${baseP + 10} €)`, priceDiff: 10, durationDiff: 30 },
        { label: `Long (${baseP + 20} €)`, priceDiff: 20, durationDiff: 60 },
        { label: `Extra long (${baseP + 30} €)`, priceDiff: 30, durationDiff: 90 },
      ],
    };
    setForm((prev) => ({
      ...prev,
      options: [defaultOption],
    }));
  };

  const handleUpdateChoice = (cIdx, field, val) => {
    if (lengthOptionIndex < 0) return;
    const updatedOptions = JSON.parse(JSON.stringify(form.options));
    const targetOpt = updatedOptions[lengthOptionIndex];
    const choices = targetOpt.choices;
    const baseP = Number(form.price) || 0;

    if (field === "totalPrice") {
      const newTotal = Math.max(0, Number(val) || 0);
      const diff = Math.max(0, newTotal - baseP);
      const currentName =
        choices[cIdx].label.replace(/\s*\(\d+\s*€\)/, "").trim() || "Longueur";
      choices[cIdx].priceDiff = diff;
      choices[cIdx].label = `${currentName} (${newTotal} €)`;
    } else if (field === "name") {
      const curPrice = baseP + (Number(choices[cIdx].priceDiff) || 0);
      choices[cIdx].label = `${val} (${curPrice} €)`;
    } else if (field === "durationDiff") {
      choices[cIdx].durationDiff = Number(val) || 0;
    }

    targetOpt.choices = choices;
    updatedOptions[lengthOptionIndex] = targetOpt;
    setForm((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleAddLengthChoice = () => {
    if (lengthOptionIndex < 0) return;
    const updatedOptions = JSON.parse(JSON.stringify(form.options));
    const targetOpt = updatedOptions[lengthOptionIndex];
    const baseP = Number(form.price) || 0;
    const nextDiff = targetOpt.choices.length * 10;
    targetOpt.choices.push({
      label: `Longueur ${targetOpt.choices.length + 1} (${baseP + nextDiff} €)`,
      priceDiff: nextDiff,
      durationDiff: 30,
    });
    updatedOptions[lengthOptionIndex] = targetOpt;
    setForm((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveLengthChoice = (cIdx) => {
    if (lengthOptionIndex < 0) return;
    const updatedOptions = JSON.parse(JSON.stringify(form.options));
    const targetOpt = updatedOptions[lengthOptionIndex];
    targetOpt.choices = targetOpt.choices.filter((_, idx) => idx !== cIdx);
    updatedOptions[lengthOptionIndex] = targetOpt;
    setForm((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveAllLengths = () => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== lengthOptionIndex),
    }));
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const res = await uploadMediaClient(file);
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
    setForm({
      name: "",
      category: existingCategories[0] || "Sans mèches incluses",
      price: 35,
      duration: 180,
      depositAmount: 10,
      description: "",
      imageUrl: "/images/realisations/knotless-still.jpeg",
      videoUrl: "",
      options: [],
      isActive: true,
      isPopular: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setIsCreatingCategory(false);
    setNewCategoryName("");
    setShowImagePicker(false);
    setForm({
      name: service.name || "",
      category: service.category || "Sans mèches incluses",
      price: service.price || 0,
      duration: service.duration || 180,
      depositAmount: service.depositAmount ?? 10,
      description: service.description || "",
      imageUrl: service.images?.[0] || "/images/realisations/knotless-still.jpeg",
      videoUrl: service.videoUrl || VIDEO_MAP[service.images?.[0]] || "",
      options: Array.isArray(service.options)
        ? JSON.parse(JSON.stringify(service.options))
        : [],
      isActive: service.isActive ?? true,
      isPopular: service.isPopular ?? false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const finalCategory = isCreatingCategory && newCategoryName.trim()
      ? newCategoryName.trim()
      : form.category;

    const matchedVideo = form.videoUrl || VIDEO_MAP[form.imageUrl] || editingService?.videoUrl || "";

    const payload = {
      ...form,
      category: finalCategory,
      images: [form.imageUrl || "/images/realisations/knotless-still.jpeg"],
      videoUrl: matchedVideo,
      options: form.options,
    };

    try {
      if (editingService) {
        const id = editingService.id || editingService._id;
        const res = await fetch(`/api/admin/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) =>
            prev.map((s) => ((s.id || s._id) === id ? data.service : s))
          );
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
        if (data.success) {
          setServices((prev) => [...prev, data.service]);
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
      if (data.success) {
        setServices((prev) => prev.filter((s) => (s.id || s._id) !== id));
        showToast("Prestation retirée avec succès.");
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
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => ((s.id || s._id) === id ? data.service : s))
        );
        showToast(
          newStatus
            ? "Prestation rendue visible aux clientes."
            : "Prestation masquée du catalogue."
        );
      }
    } catch (e) {
      showToast("Impossible de modifier la visibilité de cette prestation.");
    }
  };

  // Drag and drop reordering
  const handleDropService = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex === null || toIndex === null) return;
    const newServices = [...services];
    const [moved] = newServices.splice(fromIndex, 1);
    newServices.splice(toIndex, 0, moved);

    const updated = newServices.map((s, idx) => ({ ...s, order: idx + 1 }));
    setServices(updated);

    try {
      await Promise.all(
        updated.map((s) =>
          fetch(`/api/admin/services/${s.id || s._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: s.order }),
          })
        )
      );
      showToast("Emplacement des prestations réorganisé avec succès !");
    } catch (_) {
      showToast("Erreur lors de la mise à jour de l'ordre.");
    }
  };

  const handleMoveService = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;
    handleDropService(index, targetIndex);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs font-medium animate-fadeIn">
          <Sparkles className="w-4 h-4 text-champagne" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brun">
            Gestion des Prestations
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Glissez-déposez les cartes pour changer leur ordre comme sur Instagram, ou modifiez tarifs, photos et catégories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bouton de zoom / dézoom pour réorganisation facile */}
          <button
            type="button"
            onClick={() => setIsCompactMode(!isCompactMode)}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isCompactMode
                ? "bg-champagne text-brun-dark border-champagne-dark shadow-xs ring-2 ring-champagne/40"
                : "bg-white text-stone-700 border-stone-200 hover:border-champagne hover:bg-stone-50"
            }`}
            title={isCompactMode ? "Revenir à la vue détaillée" : "Dézoomer pour déplacer facilement les cartes"}
          >
            {isCompactMode ? (
              <>
                <ZoomIn className="w-4 h-4 text-brun" />
                <span>Vue détaillée</span>
              </>
            ) : (
              <>
                <ZoomOut className="w-4 h-4 text-champagne-dark" />
                <span>Dézoomer (Vue d'ensemble)</span>
              </>
            )}
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter une prestation</span>
          </button>
        </div>
      </div>

      {/* Message d'aide en mode dézoomé */}
      {isCompactMode && (
        <div className="p-3.5 rounded-2xl bg-champagne-light/50 border border-champagne/50 flex items-center justify-between text-xs text-brun animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-champagne-dark shrink-0" />
            <span className="font-medium">
              Mode dézoomé actif : toutes les prestations sont visibles d'un seul coup d'œil. Glissez-déposez n'importe quelle carte pour la placer rapidement où vous voulez.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCompactMode(false)}
            className="text-[11px] font-bold text-brun underline hover:text-champagne-dark shrink-0 ml-3"
          >
            Retour vue détaillée
          </button>
        </div>
      )}

      {/* Services Grid avec Drag & Drop (Mode Dézoomé ou Détaillé) */}
      {isCompactMode ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
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
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-grab active:cursor-grabbing transition-all duration-200 select-none shadow-xs ${
                  isDragging
                    ? "opacity-30 scale-90 border-dashed border-champagne shadow-inner"
                    : isOver
                    ? "ring-4 ring-champagne border-champagne scale-105 shadow-2xl z-20"
                    : "border-stone-200 hover:border-champagne hover:scale-[1.02] hover:shadow-md bg-stone-900"
                }`}
                title={`${service.name} (#${index + 1}) - Glisser pour déplacer`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 cursor-grab active:cursor-grabbing relative select-none ${
                isDragging
                  ? "opacity-40 scale-95 border-dashed border-stone-400"
                  : isOver
                  ? "ring-2 ring-champagne border-champagne scale-[1.02] shadow-xl"
                  : service.isActive
                  ? "border-stone-200 shadow-2xs hover:shadow-md"
                  : "border-stone-300 opacity-60 bg-stone-50"
              }`}
            >
              {/* Drag Handle Top Bar */}
              <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 bg-brun/85 backdrop-blur-md text-creme text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md border border-white/20">
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
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                  {service.category}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-serif font-bold text-brun text-base">
                    {service.name}
                  </h3>
                  <button
                    onClick={() => handleToggleActive(service)}
                    title={service.isActive ? "Masquer du site public" : "Activer sur le site"}
                    className="text-stone-400 hover:text-brun"
                  >
                    {service.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-stone-400" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-stone-500 line-clamp-2 font-light">
                  {service.description}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-serif font-bold text-brun text-base">
                      {formatPrice(service.price)}
                    </span>
                    <div className="text-[11px] text-stone-500 font-medium">
                      Acompte : {formatPrice(service.depositAmount ?? 10)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveService(index, "up")}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:hover:bg-stone-100 transition-colors"
                      title="Déplacer vers le haut"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === services.length - 1}
                      onClick={() => handleMoveService(index, "down")}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:hover:bg-stone-100 transition-colors"
                      title="Déplacer vers le bas"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* CREATE / EDIT MODAL SANS BUG D'URL ET SANS CHAMP D'HEURES */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-300 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-brun">
                {editingService ? "Modifier la prestation" : "Nouvelle prestation"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-brun block mb-1">
                  Nom de la prestation *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Knotless Braids Medium"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                />
              </div>

              {/* Catégorie dynamique avec création de nouvelle catégorie */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-brun">
                    Catégorie *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(!isCreatingCategory);
                      setNewCategoryName("");
                    }}
                    className="text-[11px] text-champagne-dark hover:underline font-semibold"
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
                    className="w-full bg-stone-50 border border-champagne rounded-xl p-2.5 text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
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
                        setForm({ ...form, category: e.target.value });
                      }
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-brun block mb-1">
                    Prix de base (€) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brun block mb-1">
                    Montant de l'acompte (€) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={form.depositAmount}
                    onChange={(e) =>
                      setForm({ ...form, depositAmount: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                  />
                </div>
              </div>

              {/* Longueurs & Options Tarifaires (Court, Mi-long, Long, Extra long...) */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-serif font-bold text-sm text-brun block">
                      Options de longueurs & tarifs
                    </span>
                    <span className="text-[11px] text-stone-500 font-light">
                      Ajustez les prix spécifiques à chaque longueur proposée.
                    </span>
                  </div>
                  {currentLengthOption && (
                    <button
                      type="button"
                      onClick={handleRemoveAllLengths}
                      className="text-[11px] text-stone-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Désactiver (tarif unique)
                    </button>
                  )}
                </div>

                {!currentLengthOption ? (
                  <div className="p-3 bg-white border border-stone-200 rounded-xl text-center space-y-2">
                    <p className="text-xs text-stone-600">
                      Prestation actuellement en tarif unique (<strong>{form.price} €</strong>).
                    </p>
                    <button
                      type="button"
                      onClick={handleActivateLengthOptions}
                      className="inline-flex items-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-brun" />
                      <span>Activer les choix de longueurs (Court, Mi-long, Long...)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="space-y-2">
                      {currentLengthOption.choices.map((choice, cIdx) => {
                        const cleanName = choice.label.replace(/\s*\(\d+\s*€\)/, "").trim() || "Longueur";
                        const baseP = Number(form.price) || 0;
                        const totalPrice = baseP + (Number(choice.priceDiff) || 0);

                        return (
                          <div
                            key={cIdx}
                            className="p-2.5 bg-white border border-stone-200 rounded-xl flex items-center gap-2 text-xs"
                          >
                            <div className="flex-1">
                              <label className="text-[10px] text-stone-400 block font-medium mb-0.5">
                                Intitulé
                              </label>
                              <input
                                type="text"
                                value={cleanName}
                                onChange={(e) => handleUpdateChoice(cIdx, "name", e.target.value)}
                                placeholder="Nom (ex: Mi-long)"
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 font-medium text-brun"
                              />
                            </div>

                            <div className="w-24">
                              <label className="text-[10px] text-stone-400 block font-medium mb-0.5 text-right">
                                Prix client
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  value={totalPrice}
                                  onChange={(e) => handleUpdateChoice(cIdx, "totalPrice", e.target.value)}
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 font-bold text-brun text-right pr-6"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-xs">
                                  €
                                </span>
                              </div>
                            </div>

                            <div className="w-14 text-right pt-3 font-mono text-[10px] text-stone-400">
                              {choice.priceDiff > 0 ? `+${choice.priceDiff}€` : "Base"}
                            </div>

                            <div className="pt-3">
                              <button
                                type="button"
                                onClick={() => handleRemoveLengthChoice(cIdx)}
                                className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors"
                                title="Supprimer cette longueur"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLengthChoice}
                      className="w-full py-2 border border-dashed border-stone-300 hover:border-champagne rounded-xl text-xs font-semibold text-stone-600 hover:text-brun flex items-center justify-center space-x-1.5 transition-colors bg-white/60"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une longueur supplémentaire</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Visuel, Vidéo & Téléversement Cloudinary */}
              <div className="space-y-3">
                {/* Bloc téléversement direct depuis appareil */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brun flex items-center space-x-1.5">
                      <Upload className="w-4 h-4 text-champagne-dark" />
                      <span>Ajouter une vidéo ou photo depuis cet appareil</span>
                    </span>
                    {uploadingMedia && (
                      <span className="text-xs text-champagne-dark font-semibold flex items-center space-x-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Envoi vers Cloudinary...</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                    Téléversez vos fichiers vidéo (MOV, MP4) ou photos directement depuis votre téléphone ou ordinateur. Ils sont hébergés et optimisés automatiquement sur Cloudinary.
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
                      className="inline-flex items-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-brun" />
                      <span>Choisir un fichier sur mon appareil</span>
                    </button>

                    {form.videoUrl && (
                      <span className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                        <Film className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Vidéo Cloudinary liée</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Champ Vidéo URL spécifique */}
                {form.videoUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-brun text-xs flex items-center space-x-1">
                        <Film className="w-3.5 h-3.5 text-champagne-dark" />
                        <span>Lien de la vidéo</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, videoUrl: "" })}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Retirer la vidéo
                      </button>
                    </div>
                    <input
                      type="text"
                      value={form.videoUrl}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/.../video.mp4"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-brun font-mono text-[11px]"
                    />
                  </div>
                )}

                {/* Champ Photo / Visuel */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-brun text-xs">
                      Photo principale / Vignette
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(!showImagePicker)}
                      className="text-[11px] text-champagne-dark hover:underline font-semibold flex items-center space-x-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>
                        {showImagePicker
                          ? "Masquer la sélection"
                          : "Choisir parmi les photos du salon"}
                      </span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="/images/realisations/... ou https://..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun font-mono text-[11px]"
                  />

                  {/* Sélecteur visuel en 1 clic */}
                  {showImagePicker && (
                    <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200 rounded-2xl max-h-48 overflow-y-auto space-y-2">
                      <p className="text-[10px] text-stone-500 font-medium">
                        Cliquez sur une photo pour l'assigner directement :
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {AVAILABLE_SALON_IMAGES.map((img) => (
                          <div
                            key={img.path}
                            onClick={() => {
                              setForm({ ...form, imageUrl: img.path });
                              setShowImagePicker(false);
                            }}
                            className={`relative aspect-[3/4] rounded-lg overflow-hidden border cursor-pointer transition-all hover:scale-105 ${
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-brun block mb-1">
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) =>
                      setForm({ ...form, isPopular: e.target.checked })
                    }
                    className="rounded border-stone-300 text-brun"
                  />
                  <span>Mettre en avant sur l'accueil</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="rounded border-stone-300 text-brun"
                  />
                  <span>Visible sur le site</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-champagne" />
                  <span>{submitting ? "Enregistrement..." : "Enregistrer la prestation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
