"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Shield,
  Sparkles,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";

export default function AdminServicesView({ initialServices = [] }) {
  const [services, setServices] = useState(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Form State
  const [form, setForm] = useState({
    name: "",
    category: "Knotless Braids",
    price: 120,
    duration: 180,
    depositAmount: 30,
    description: "",
    imageUrl: "",
    isActive: true,
    isPopular: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setForm({
      name: "",
      category: "Knotless Braids",
      price: 120,
      duration: 180,
      depositAmount: 30,
      description: "",
      imageUrl:
        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1200&auto=format&fit=crop",
      isActive: true,
      isPopular: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      category: service.category || "Knotless Braids",
      price: service.price,
      duration: service.duration,
      depositAmount: service.depositAmount || 30,
      description: service.description,
      imageUrl: service.images?.[0] || "",
      isActive: service.isActive ?? true,
      isPopular: service.isPopular ?? false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      images: [form.imageUrl],
    };

    try {
      if (editingService) {
        // Update
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
          showToast("Prestation mise à jour !");
          setModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) => [...prev, data.service]);
          showToast("Nouvelle prestation créée !");
          setModalOpen(false);
        }
      }
    } catch (err) {
      showToast("Impossible d'enregistrer la prestation pour le moment. Veuillez réessayer.");
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
        showToast(newStatus ? "Prestation rendue visible aux clientes." : "Prestation masquée du catalogue.");
      }
    } catch (e) {
      showToast("Impossible de modifier la visibilité de cette prestation.");
    }
  };

  const handleMoveService = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newServices = [...services];
    const temp = newServices[index];
    newServices[index] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    const updated = newServices.map((s, idx) => ({ ...s, order: idx + 1 }));
    setServices(updated);

    try {
      const s1 = updated[index];
      const s2 = updated[targetIndex];
      await Promise.all([
        fetch(`/api/admin/services/${s1.id || s1._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: s1.order }),
        }),
        fetch(`/api/admin/services/${s2.id || s2._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: s2.order }),
        }),
      ]);
      showToast("Ordre d'affichage des prestations mis à jour !");
    } catch (_) {
      showToast("Erreur lors de la mise à jour de l'ordre.");
    }
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
            Ajoutez, ajustez les prix, durées, acomptes et photos de votre carte de coiffures.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-champagne" />
          <span>Ajouter une prestation</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const id = service.id || service._id;
          return (
            <div
              key={id}
              className={`bg-white rounded-2xl overflow-hidden border transition-all ${
                service.isActive
                  ? "border-stone-200 shadow-2xs"
                  : "border-stone-300 opacity-60 bg-stone-50"
              }`}
            >
              <div className="relative aspect-[3/4] w-full bg-stone-100">
                <Image
                  src={
                    service.images?.[0] ||
                    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt={service.name}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
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
                    <div className="text-[11px] text-stone-400">
                      {formatDuration(service.duration)} • Acompte {formatPrice(service.depositAmount)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
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

      {/* CREATE / EDIT MODAL */}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-brun block mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                  >
                    <option value="Knotless Braids">Knotless Braids</option>
                    <option value="Box Braids">Box Braids</option>
                    <option value="Fulani & Nattes">Fulani & Nattes</option>
                    <option value="Twists & Locs">Twists & Locs</option>
                    <option value="Prestations Express">Prestations Express</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-brun block mb-1">
                    Prix de base (€) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-brun block mb-1">
                    Durée estimée (minutes) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                  />
                  <span className="text-[10px] text-stone-400">
                    Soit {formatDuration(form.duration)}
                  </span>
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

              <div>
                <label className="font-semibold text-brun block mb-1">
                  URL de la photographie
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-brun"
                />
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
                  <span>Visible et réservable</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brun hover:bg-brun-dark text-creme px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer la prestation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
