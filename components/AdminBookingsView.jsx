"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  Ban,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";

export default function AdminBookingsView({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Reject modal
  const [rejectBooking, setRejectBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Actions
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        showToast("Demande acceptée ! SMS & e-mail transmis à la cliente.");
      } else {
        showToast(data.error || "Impossible d'approuver cette réservation.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/mark-paid`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        showToast("Acompte validé ! Confirmation transmise à la cliente.");
      } else {
        showToast(data.error || "Impossible de valider le paiement.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        showToast("Réservation annulée.");
      } else {
        showToast(data.error || "Impossible d'annuler le rendez-vous.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectBooking) return;
    const id = rejectBooking.id || rejectBooking._id;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/bookings/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        showToast("Demande refusée et créneau libéré.");
        setRejectBooking(null);
        setRejectReason("");
      } else {
        showToast(data.error || "Impossible d'enregistrer le refus.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === "ALL" || b.status === statusFilter;
    const matchesDate = !dateFilter || b.date === dateFilter;
    const fullName = `${b.customer?.firstName} ${b.customer?.lastName}`.toLowerCase();
    const ref = (b.bookingReference || "").toLowerCase();
    const phone = (b.customer?.phone || "").toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      fullName.includes(search.toLowerCase()) ||
      ref.includes(search.toLowerCase()) ||
      phone.includes(search.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return { label: "Confirmé", color: "bg-emerald-100 text-emerald-800" };
      case "PENDING_APPROVAL":
        return { label: "À valider", color: "bg-amber-100 text-amber-900 font-bold" };
      case "PENDING_PAYMENT":
        return { label: "Attente paiement", color: "bg-blue-100 text-blue-900" };
      case "REJECTED":
        return { label: "Refusé", color: "bg-red-100 text-red-800" };
      case "CANCELLED":
        return { label: "Annulé", color: "bg-stone-200 text-stone-700" };
      case "EXPIRED":
        return { label: "Expiré", color: "bg-stone-200 text-stone-600" };
      default:
        return { label: status, color: "bg-stone-100 text-stone-700" };
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
      <div>
        <h1 className="font-serif text-3xl font-bold text-brun">
          Gestion des Réservations
        </h1>
        <p className="text-xs text-stone-500 font-light mt-1">
          Consultez, filtrez et gérez l'ensemble des demandes de rendez-vous clientes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "Toutes" },
            { id: "PENDING_APPROVAL", label: "À valider" },
            { id: "PENDING_PAYMENT", label: "Paiement en attente" },
            { id: "CONFIRMED", label: "Confirmées" },
            { id: "CANCELLED", label: "Annulées / Refusées" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  isActive
                    ? "bg-brun text-creme shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Date Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou référence (ex: YDM-2026-9482)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-brun placeholder:text-stone-400 focus:outline-none focus:border-champagne"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="w-full sm:w-auto flex items-center space-x-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-brun focus:outline-none focus:border-champagne"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-xs text-stone-500 hover:underline"
              >
                Effacer date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Prestation</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Total / Acompte</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const bId = b.id || b._id;
                  const badge = getStatusBadge(b.status);
                  const isLoading = actionLoading === bId;

                  return (
                    <tr key={bId} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brun">
                        {b.bookingReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brun">
                          {b.customer.firstName} {b.customer.lastName}
                        </div>
                        {b.customer.instagram && (
                          <div className="text-[11px] font-mono text-champagne-dark font-medium">
                            {b.customer.instagram}
                          </div>
                        )}
                        <div className="text-[11px] text-stone-500">
                          {b.customer.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-brun">{b.service.name}</div>
                        <div className="text-[11px] text-stone-500">
                          {formatDuration(b.totalDuration)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-brun">{b.date}</div>
                        <div className="text-[11px] text-stone-500">
                          {b.startTime} - {b.endTime}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brun">
                          {formatPrice(b.totalPrice)}
                        </div>
                        <div className="text-[11px] text-champagne-dark font-medium">
                          Acompte : {formatPrice(b.depositAmount)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        {b.depositDeclared && b.status === "PENDING_PAYMENT" && (
                          <div className="text-[10px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-200">
                            Acompte reçu déclaré ({b.depositDeclaredMethod || "Virement"})
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Approve (if PENDING_APPROVAL) */}
                          {b.status === "PENDING_APPROVAL" && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleApprove(bId)}
                              title="Valider et envoyer SMS/email d'acompte"
                              className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>
                          )}

                          {/* Reject (if PENDING_APPROVAL) */}
                          {b.status === "PENDING_APPROVAL" && (
                            <button
                              disabled={isLoading}
                              onClick={() => setRejectBooking(b)}
                              title="Refuser et notifier la cliente par SMS/email"
                              className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              <X className="w-3.5 h-3.5 inline mr-0.5" />
                              <span>Refuser</span>
                            </button>
                          )}

                          {/* Mark Paid (if PENDING_PAYMENT) */}
                          {b.status === "PENDING_PAYMENT" && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleMarkPaid(bId)}
                              title="Valider la réception des 10 € d'acompte (Revolut, Wero, etc.)"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs"
                            >
                              Valider acompte (10 €)
                            </button>
                          )}

                          {/* Cancel (if CONFIRMED or PENDING_PAYMENT) */}
                          {["CONFIRMED", "PENDING_PAYMENT"].includes(b.status) && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleCancel(bId)}
                              title="Annuler le rendez-vous"
                              className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500 font-light">
                    Aucune réservation ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-300 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-brun">
              Refuser la réservation {rejectBooking.bookingReference}
            </h3>
            <p className="text-xs text-stone-500 font-light">
              La cliente recevra un e-mail d'information et le créneau sera immédiatement libéré.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif (ex: indisponibilité de dernière minute)..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-brun focus:outline-none"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectBooking(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReject}
                className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
