"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Check,
  X,
  Ban,
  Clock,
  CheckCircle2,
  Phone,
  Calendar,
  Copy,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";
import {
  matchesBookingStatusFilter,
  normalizeBookingStatus,
} from "@/lib/adminHelpers";
import { normalizeBookingPaymentUrl } from "@/lib/appUrl";
import { AdminWorkflowGuideBar } from "./admin/AdminVisualGuide";

export default function AdminBookingsView({ initialBookings = [] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(() =>
    (initialBookings || []).map((b) => normalizeBookingStatus(b))
  );
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Reject modal
  const [rejectBooking, setRejectBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  // Deposit not received modal
  const [depositNotReceivedBooking, setDepositNotReceivedBooking] = useState(null);
  const [depositNotReceivedNote, setDepositNotReceivedNote] = useState("");

  useEffect(() => {
    setBookings((initialBookings || []).map((b) => normalizeBookingStatus(b)));
  }, [initialBookings]);

  useEffect(() => {
    if (!rejectBooking && !depositNotReceivedBooking) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setRejectBooking(null);
        setDepositNotReceivedBooking(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rejectBooking, depositNotReceivedBooking]);

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
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        router.refresh();
        showToast("Demande acceptée ! SMS & e-mail transmis à la cliente.");
      } else {
        showToast(data.error || "Impossible d'approuver cette réservation.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de la validation de la demande.");
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
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        router.refresh();
        showToast("Acompte validé ! Confirmation transmise à la cliente.");
      } else {
        showToast(data.error || "Impossible de valider le paiement.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de la validation de l'acompte.");
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
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        router.refresh();
        showToast("Réservation annulée.");
      } else {
        showToast(data.error || "Impossible d'annuler le rendez-vous.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de l'annulation du rendez-vous.");
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
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        router.refresh();
        showToast("Demande refusée et créneau libéré.");
        setRejectBooking(null);
        setRejectReason("");
      } else {
        showToast(data.error || "Impossible d'enregistrer le refus.");
      }
    } catch (_) {
      showToast("Erreur réseau lors du refus de la demande.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDepositNotReceived = async () => {
    if (!depositNotReceivedBooking) return;
    const id = depositNotReceivedBooking.id || depositNotReceivedBooking._id;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/bookings/${id}/deposit-not-received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: depositNotReceivedNote }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => ((b.id || b._id) === id ? data.booking : b))
        );
        router.refresh();
        showToast("Relance envoyée ! La cliente est prévenue par e-mail et SMS.");
        setDepositNotReceivedBooking(null);
        setDepositNotReceivedNote("");
      } else {
        showToast(data.error || "Impossible d'envoyer la relance.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de l'envoi de la relance.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = matchesBookingStatusFilter(b.status, statusFilter);
    const matchesDate = !dateFilter || b.date === dateFilter;
    const fullName = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.toLowerCase();
    const ref = (b.bookingReference || "").toLowerCase();
    const phone = (b.customer?.phone || "").toLowerCase();
    const email = (b.customer?.email || "").toLowerCase();
    const insta = (b.customer?.instagram || "").toLowerCase();
    const serviceName = (b.service?.name || "").toLowerCase();
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      fullName.includes(query) ||
      ref.includes(query) ||
      phone.includes(query) ||
      email.includes(query) ||
      insta.includes(query) ||
      serviceName.includes(query);
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
          <CheckCircle2 className="w-4 h-4 text-champagne" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brun">
          Gestion des Réservations
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Consultez, filtrez et validez vos rendez-vous étape par étape.
        </p>
      </div>

      <AdminWorkflowGuideBar />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs space-y-4">
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
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`min-h-[44px] text-xs sm:text-sm px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou référence (ex: YDM-2026-9482)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-10 py-2.5 text-base lg:text-sm text-brun placeholder:text-stone-400 focus:outline-none focus:border-champagne"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Effacer la recherche"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 compact-chip inline-flex items-center justify-center rounded-lg text-stone-400 hover:text-brun cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 sm:flex-none min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:border-champagne"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs sm:text-sm font-medium text-stone-700 cursor-pointer shrink-0"
              >
                Effacer date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Cards (< lg / iPad Portrait) + Table (>= lg) */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        {/* Version Cartes Tactiles sur Tablette Portrait / Mobile */}
        <div className="lg:hidden divide-y divide-stone-100">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((b) => {
              const bId = b.id || b._id;
              const badge = getStatusBadge(b.status);
              const isLoading = actionLoading === bId;

              return (
                <div key={bId} className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] font-mono font-bold text-champagne-dark uppercase tracking-wider block">
                        {b.bookingReference}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-brun truncate">
                        {b.customer.firstName} {b.customer.lastName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 mt-1">
                        {b.customer.phone && (
                          <a
                            href={`tel:${b.customer.phone}`}
                            className="inline-flex items-center gap-1 underline decoration-stone-300 hover:text-brun"
                          >
                            <Phone className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                            <span>{b.customer.phone}</span>
                          </a>
                        )}
                        {b.customer.instagram && (
                          <span className="font-mono text-champagne-dark font-medium">
                            {b.customer.instagram}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <div className="font-serif font-bold text-sm text-brun">
                        {formatPrice(b.totalPrice)}
                      </div>
                      <div className="text-[11px] text-champagne-dark font-medium">
                        Acompte : {formatPrice(b.depositAmount)}
                      </div>
                    </div>
                  </div>

                  {b.depositDeclared && b.status === "PENDING_PAYMENT" && (
                    <div className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                      Acompte reçu déclaré ({b.depositDeclaredMethod || "Virement"})
                    </div>
                  )}

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-brun text-sm">
                        {b.service.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-stone-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(b.totalDuration)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                      <span>
                        {formatDateFrench(b.date)} &bull; {b.startTime} - {b.endTime}
                      </span>
                    </div>

                    {b.selectedOptions && b.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {b.selectedOptions.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className={`text-[11px] px-2 py-0.5 rounded-lg ${
                              opt.name === "Couleur des mèches"
                                ? "font-semibold text-champagne-dark bg-champagne-light/70"
                                : "text-stone-600 bg-white border border-stone-200"
                            }`}
                          >
                            {opt.name} : {opt.choice}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {["PENDING_APPROVAL", "PENDING_PAYMENT", "CONFIRMED"].includes(b.status) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {b.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleApprove(bId)}
                            className="flex-1 min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>Valider la demande</span>
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => setRejectBooking(b)}
                            className="min-h-[44px] bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Refuser</span>
                          </button>
                        </>
                      )}

                      {b.status === "PENDING_PAYMENT" && (
                        <>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleMarkPaid(bId)}
                            className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            Valider acompte reçu ({formatPrice(b.depositAmount ?? 10)})
                          </button>
                          {b.depositDeclared && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => {
                                setDepositNotReceivedBooking(b);
                                setDepositNotReceivedNote("");
                              }}
                              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Acompte non reçu
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              const liveUrl = normalizeBookingPaymentUrl(
                                b.stripePaymentUrl,
                                b.bookingReference,
                                null,
                                typeof window !== "undefined" ? window.location.origin : ""
                              );
                              try {
                                await navigator.clipboard.writeText(liveUrl);
                                showToast("Lien d'acompte en ligne copié !");
                              } catch (_) {
                                showToast(liveUrl);
                              }
                            }}
                            title="Copier le lien d'acompte en ligne"
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-brun text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-champagne-dark" />
                            <span>Copier lien</span>
                          </button>
                        </>
                      )}

                      {["CONFIRMED", "PENDING_PAYMENT"].includes(b.status) && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleCancel(bId)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Annuler</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center text-sm text-stone-500 font-light">
              Aucune réservation ne correspond à vos critères de recherche.
            </div>
          )}
        </div>

        {/* Version Tableau sur Grand Écran / iPad Paysage */}
        <div className="hidden lg:block overflow-x-auto">
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
                        {b.customer.phone && (
                          <a
                            href={`tel:${b.customer.phone}`}
                            className="text-[11px] text-stone-500 hover:text-brun underline decoration-stone-300"
                          >
                            {b.customer.phone}
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-brun">{b.service.name}</div>
                        {b.selectedOptions && b.selectedOptions.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {b.selectedOptions.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`text-[10px] leading-tight ${
                                  opt.name === "Couleur des mèches"
                                    ? "font-semibold text-champagne-dark bg-champagne-light/60 px-1.5 py-0.5 rounded inline-block"
                                    : "text-stone-500"
                                }`}
                              >
                                {opt.name} : {opt.choice}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-[11px] text-stone-500 mt-0.5">
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve (if PENDING_APPROVAL) */}
                          {b.status === "PENDING_APPROVAL" && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleApprove(bId)}
                              title="Valider et envoyer SMS/email d'acompte"
                              className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>
                          )}

                          {/* Reject (if PENDING_APPROVAL) */}
                          {b.status === "PENDING_APPROVAL" && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => setRejectBooking(b)}
                              title="Refuser et notifier la cliente par SMS/email"
                              className="min-h-[44px] bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Refuser</span>
                            </button>
                          )}

                          {/* Mark Paid (if PENDING_PAYMENT) */}
                          {b.status === "PENDING_PAYMENT" && (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  const liveUrl = normalizeBookingPaymentUrl(
                                    b.stripePaymentUrl,
                                    b.bookingReference,
                                    null,
                                    typeof window !== "undefined" ? window.location.origin : ""
                                  );
                                  try {
                                    await navigator.clipboard.writeText(liveUrl);
                                    showToast("Lien d'acompte en ligne copié !");
                                  } catch (_) {
                                    showToast(liveUrl);
                                  }
                                }}
                                title="Copier le lien d'acompte en ligne"
                                className="min-h-[44px] px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-brun text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-champagne-dark" />
                                <span>Lien</span>
                              </button>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleMarkPaid(bId)}
                                title={`Confirmer avoir bien reçu les ${formatPrice(b.depositAmount ?? 10)} d'acompte (Wero, Revolut, PayPal)`}
                                className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                              >
                                Valider acompte reçu ({formatPrice(b.depositAmount ?? 10)})
                              </button>
                              {b.depositDeclared && (
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => {
                                    setDepositNotReceivedBooking(b);
                                    setDepositNotReceivedNote("");
                                  }}
                                  title="Signaler que le virement n'est pas encore arrivé sur le compte et renvoyer à la cliente"
                                  className="min-h-[44px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Non reçu
                                </button>
                              )}
                            </>
                          )}

                          {/* Cancel (if CONFIRMED or PENDING_PAYMENT) */}
                          {["CONFIRMED", "PENDING_PAYMENT"].includes(b.status) && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleCancel(bId)}
                              title="Annuler le rendez-vous"
                              aria-label="Annuler le rendez-vous"
                              className="w-11 h-11 inline-flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Ban className="w-4 h-4" />
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
        <div
          onClick={() => setRejectBooking(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full max-h-[88dvh] flex flex-col overflow-hidden border border-stone-300 shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <h3 className="font-serif text-xl font-bold text-brun">
                Refuser {rejectBooking.bookingReference}
              </h3>
              <button
                type="button"
                onClick={() => setRejectBooking(null)}
                aria-label="Fermer"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 inline-flex items-center justify-center text-brun cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4">
              <p className="text-sm text-stone-600 font-light">
                La cliente recevra un e-mail d&apos;information et le créneau sera immédiatement libéré.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motif (ex: indisponibilité de dernière minute)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-base lg:text-sm text-brun focus:outline-none focus:border-champagne"
              />
            </div>

            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex flex-wrap justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setRejectBooking(null)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading === (rejectBooking.id || rejectBooking._id)}
                className="min-h-[44px] bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer"
              >
                {actionLoading === (rejectBooking.id || rejectBooking._id)
                  ? "Enregistrement..."
                  : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Not Received Modal */}
      {depositNotReceivedBooking && (
        <div
          onClick={() => setDepositNotReceivedBooking(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full max-h-[88dvh] flex flex-col overflow-hidden border border-stone-300 shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <h3 className="font-serif text-xl font-bold text-brun">
                Acompte non reçu ({depositNotReceivedBooking.bookingReference})
              </h3>
              <button
                type="button"
                onClick={() => setDepositNotReceivedBooking(null)}
                aria-label="Fermer"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 inline-flex items-center justify-center text-brun cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4">
              <p className="text-sm text-stone-600 font-light">
                La cliente sera prévenue par e-mail et SMS que son virement n&apos;a pas encore été retrouvé sur votre compte, et pourra revérifier puis re-valider son paiement.
              </p>
              <textarea
                rows={3}
                value={depositNotReceivedNote}
                onChange={(e) => setDepositNotReceivedNote(e.target.value)}
                placeholder="Note optionnelle (ex: Vérifiez le numéro 07 67 66 38 69 ou envoyez une capture sur Instagram)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-base lg:text-sm text-brun focus:outline-none focus:border-champagne"
              />
            </div>

            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex flex-wrap justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDepositNotReceivedBooking(null)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDepositNotReceived}
                disabled={
                  actionLoading ===
                  (depositNotReceivedBooking.id || depositNotReceivedBooking._id)
                }
                className="min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ===
                (depositNotReceivedBooking.id || depositNotReceivedBooking._id)
                  ? "Envoi..."
                  : "Renvoyer à la cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
