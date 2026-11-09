"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

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
    category: "Knotless Braids",
    price: 35,
    duration: 180, // Valeur par défaut conservée en arrière-plan sans affichage
    depositAmount: 10,
    description: "",
    imageUrl: "/images/realisations/knotless-still.jpeg",
    isActive: true,
    isPopular: false,
  });

  // Custom Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    const matchedVideo = form.videoUrl || VIDEO_MAP[form.imageUrl] || editingService?.videoUrl;

    const payload = {
      ...form,
      category: finalCategory,
      images: [form.imageUrl || "/images/realisations/knotless-still.jpeg"],
      ...(matchedVideo ? { videoUrl: matchedVideo } : {}),
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

              {/* Visuel / Photo - Pas de type="url" pour éviter le bug de validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-brun">
                    Photo de la prestation
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="text-[11px] text-champagne-dark hover:underline font-semibold flex items-center space-x-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>
                      {showImagePicker
                        ? "Masquer la sélection rapide"
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
