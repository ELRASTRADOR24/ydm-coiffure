"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  Check,
  X,
  Ban,
  Power,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Copy,
  FileText,
  RotateCcw,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";
import { DEFAULT_MAINTENANCE } from "@/lib/siteContent";
import {
  getParisDateString,
  normalizeBookingStatus,
  getPendingApprovalConflictContext,
} from "@/lib/adminHelpers";
import { normalizeBookingPaymentUrl } from "@/lib/appUrl";
import { AdminWorkflowGuideBar } from "./admin/AdminVisualGuide";
import ProposeDateModal from "./admin/ProposeDateModal";

export default function AdminDashboardView({
  initialStats,
  initialBookings,
  initialMaintenance = DEFAULT_MAINTENANCE,
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(() =>
    (initialBookings || []).map((b) => normalizeBookingStatus(b))
  );
  const [maintenance, setMaintenance] = useState(
    initialMaintenance || DEFAULT_MAINTENANCE
  );
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [depositNotReceivedBooking, setDepositNotReceivedBooking] = useState(null);
  const [depositNotReceivedNote, setDepositNotReceivedNote] = useState("");
  const [proposeDateBooking, setProposeDateBooking] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setBookings((initialBookings || []).map((b) => normalizeBookingStatus(b)));
  }, [initialBookings]);

  useEffect(() => {
    setMaintenance(initialMaintenance || DEFAULT_MAINTENANCE);
  }, [initialMaintenance]);

  useEffect(() => {
    if (!rejectModalBooking && !depositNotReceivedBooking) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setRejectModalBooking(null);
        setDepositNotReceivedBooking(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rejectModalBooking, depositNotReceivedBooking]);

  const pendingApprovals = bookings.filter(
    (b) => b.status === "PENDING_APPROVAL"
  );
  const rescheduleProposals = bookings.filter(
    (b) => b.status === "RESCHEDULE_PROPOSED"
  );
  const pendingPayments = bookings.filter(
    (b) => b.status === "PENDING_PAYMENT"
  );
  const declaredPendingCount = pendingPayments.filter((b) => b.depositDeclared).length;
  const sortedPendingPayments = [...pendingPayments].sort(
    (a, b) => Number(Boolean(b.depositDeclared)) - Number(Boolean(a.depositDeclared))
  );
  const confirmedBookings = bookings.filter(
    (b) => b.status === "CONFIRMED"
  );

  const todayStr = getParisDateString();
  const todayCount = confirmedBookings.filter((b) => b.date === todayStr).length;

  const totalDeposits = confirmedBookings.reduce(
    (acc, b) => acc + (b.depositAmount || 0),
    0
  );
  const totalRevenue = confirmedBookings.reduce(
    (acc, b) => acc + (b.totalPrice || 0),
    0
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleToggleMaintenance = async () => {
    const nextEnabled = !maintenance.enabled;
    setTogglingMaintenance(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance: { ...maintenance, enabled: nextEnabled },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMaintenance(data.settings?.maintenance || { ...maintenance, enabled: nextEnabled });
        showToast(
          nextEnabled
            ? "Mode maintenance activé ! Le site public affiche la page de maintenance."
            : "Mode maintenance désactivé ! Le site est de nouveau en ligne."
        );
        router.refresh();
      } else {
        showToast(data.error || "Impossible de modifier le mode maintenance.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de la mise à jour du mode maintenance.");
    } finally {
      setTogglingMaintenance(false);
    }
  };

  // 1-Click Approve Booking
  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === bookingId ? data.booking : b
          )
        );
        router.refresh();
        showToast("Demande acceptée ! Lien d'acompte (Wero / Revolut / PayPal) transmis.");
      } else {
        showToast(data.error || "Impossible d'approuver cette demande.");
      }
    } catch (e) {
      showToast("Problème de connexion lors de la confirmation.");
    } finally {
      setActionLoading(null);
    }
  };

  // 1-Click Confirm Direct Deposit Payment
  const handleMarkPaid = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/mark-paid`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === bookingId ? data.booking : b
          )
        );
        router.refresh();
        showToast("Acompte validé ! Rendez-vous confirmé et adresse privée envoyée.");
      } else {
        showToast(data.error || "Impossible de valider cet acompte.");
      }
    } catch (e) {
      showToast("Problème de connexion lors de la validation de l'acompte.");
    } finally {
      setActionLoading(null);
    }
  };

  // Signal Deposit Not Received Yet
  const handleConfirmDepositNotReceived = async () => {
    if (!depositNotReceivedBooking) return;
    const bookingId = depositNotReceivedBooking.id || depositNotReceivedBooking._id;
    setActionLoading(bookingId);

    try {
      const res = await fetch(
        `/api/admin/bookings/${bookingId}/deposit-not-received`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: depositNotReceivedNote }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === bookingId ? data.booking : b
          )
        );
        router.refresh();
        showToast("Relance envoyée à la cliente par e-mail et SMS !");
        setDepositNotReceivedBooking(null);
        setDepositNotReceivedNote("");
      } else {
        showToast(data.error || "Erreur lors de l'envoi de la relance.");
      }
    } catch (e) {
      showToast("Erreur réseau.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Booking with Reason
  const handleConfirmReject = async () => {
    if (!rejectModalBooking) return;
    const bookingId = rejectModalBooking.id || rejectModalBooking._id;
    setActionLoading(bookingId);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === bookingId ? data.booking : b
          )
        );
        router.refresh();
        showToast("Demande refusée. Le créneau a été libéré.");
        setRejectModalBooking(null);
        setRejectionReason("");
      } else {
        showToast(data.error || "Impossible d'enregistrer le refus.");
      }
    } catch (e) {
      showToast("Problème de connexion lors du refus de la demande.");
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel Booking
  const handleCancel = async (bookingId) => {
    if (!confirm("Voulez-vous vraiment annuler cette demande ?")) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === bookingId ? data.booking : b
          )
        );
        router.refresh();
        showToast("Demande annulée et créneau libéré.");
      } else {
        showToast(data.error || "Impossible d'annuler cette demande.");
      }
    } catch (_) {
      showToast("Problème de connexion lors de l'annulation.");
    } finally {
      setActionLoading(null);
    }
  };

  // Unvalidate Booking (revert step backwards)
  const handleUnvalidate = async (bookingId, currentStatus) => {
    const confirmMsg =
      currentStatus === "CONFIRMED"
        ? "Annuler la confirmation de l'acompte et remettre ce rendez-vous en attente de paiement ?"
        : "Dévalider cette demande et la remettre « À valider » ?";
    if (!confirm(confirmMsg)) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/unvalidate`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === bookingId
              ? normalizeBookingStatus(data.booking)
              : b
          )
        );
        router.refresh();
        showToast(data.message || "Réservation dévalidée.");
      } else {
        showToast(data.error || "Impossible de dévalider cette réservation.");
      }
    } catch (_) {
      showToast("Problème de connexion lors de la dévalidation.");
    } finally {
      setActionLoading(null);
    }
  };

  // Prochains rendez-vous confirmés
  const upcomingConfirmed = confirmedBookings
    .filter((b) => b.date >= todayStr)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 lg:top-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs sm:text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brun">
            Tableau de Bord
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Vos demandes à valider, acomptes à vérifier et prochains rendez-vous.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/calendar"
            className="min-h-[44px] inline-flex items-center space-x-2 bg-white border border-stone-300 hover:border-champagne text-brun px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-champagne-dark" />
            <span>Calendrier</span>
          </Link>
          <Link
            href="/admin/site-editor"
            className="min-h-[44px] inline-flex items-center space-x-2 bg-white border border-stone-300 hover:border-champagne text-brun px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-champagne-dark" />
            <span>Textes du site</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="min-h-[44px] inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors"
          >
            <span>Réservations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Repère visuel du parcours client */}
      <AdminWorkflowGuideBar />

      {/* Statut du site / Mode Maintenance */}
      {maintenance.enabled ? (
        <div className="rounded-2xl p-5 border-2 bg-red-50 border-red-400 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-600 text-white">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>MODE MAINTENANCE ACTIF</span>
            </span>
            <h2 className="font-serif text-lg font-bold text-brun pt-1">
              Le site public est actuellement en pause
            </h2>
            <p className="text-xs sm:text-sm text-stone-700">
              Les visiteuses voient l&apos;écran de maintenance. Cliquez pour rouvrir les réservations dès que vous êtes prête.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={togglingMaintenance}
              onClick={handleToggleMaintenance}
              className="min-h-[44px] inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60 bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {togglingMaintenance ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              <span>
                {togglingMaintenance ? "Mise à jour..." : "Remettre le site en ligne"}
              </span>
            </button>
            <Link
              href="/admin/site-editor?tab=maintenance"
              className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-brun border border-stone-300 text-sm font-semibold transition-colors"
            >
              Modifier le message
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl px-4 py-3 border border-stone-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SITE EN LIGNE</span>
            </span>
            <span className="text-stone-600">
              Mode maintenance désactivé — les réservations sont ouvertes.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/admin/site-editor?tab=maintenance"
              className="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-brun text-xs font-semibold transition-colors"
            >
              Message maintenance
            </Link>
            <a
              href="/?preview_maintenance=1"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-semibold transition-colors"
            >
              <span>Aperçu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              disabled={togglingMaintenance}
              onClick={handleToggleMaintenance}
              className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              {togglingMaintenance ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Power className="w-3.5 h-3.5" />
              )}
              <span>{togglingMaintenance ? "Mise à jour..." : "Mettre en pause"}</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Today */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-stone-500 font-medium">Aujourd'hui</div>
          <div className="text-2xl font-serif font-bold text-brun">{todayCount}</div>
          <div className="text-[10px] text-stone-400">Rdv confirmés</div>
        </div>

        {/* Card 2: Pending Approval */}
        <div
          className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${
            pendingApprovals.length > 0
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-200"
              : "bg-white border-stone-200"
          }`}
        >
          <div className="text-[11px] font-semibold text-amber-900">À Valider</div>
          <div className="text-2xl font-serif font-bold text-amber-900">
            {pendingApprovals.length}
          </div>
          <div className="text-[10px] text-amber-700">Demandes en attente</div>
        </div>

        {/* Card 3: Pending Payment */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-blue-700 font-medium">Acompte en attente</div>
          <div className="text-2xl font-serif font-bold text-blue-900">
            {pendingPayments.length}
          </div>
          <div className="text-[10px] text-blue-600">
            {declaredPendingCount > 0
              ? `${declaredPendingCount} déclaré(s) à vérifier`
              : "Wero, Revolut ou PayPal"}
          </div>
        </div>

        {/* Card 4: Confirmed Total */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-emerald-700 font-medium">Confirmés</div>
          <div className="text-2xl font-serif font-bold text-emerald-900">
            {confirmedBookings.length}
          </div>
          <div className="text-[10px] text-emerald-600">Acomptes perçus</div>
        </div>

        {/* Card 5: Deposits Collected */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-stone-500 font-medium">Acomptes reçus</div>
          <div className="text-xl font-serif font-bold text-champagne-dark">
            {formatPrice(totalDeposits)}
          </div>
          <div className="text-[10px] text-stone-400">Wero, Revolut, PayPal</div>
        </div>

        {/* Card 6: Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-stone-500 font-medium">C.A. Prévisionnel</div>
          <div className="text-xl font-serif font-bold text-brun">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-[10px] text-stone-400">Total des réservations</div>
        </div>
      </div>

      {/* URGENT: PENDING APPROVAL REQUESTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-serif text-xl font-bold text-brun">
              Demandes de rendez-vous à valider
            </h2>
            {pendingApprovals.length > 0 && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {pendingApprovals.length} en attente
              </span>
            )}
          </div>
        </div>

        {pendingApprovals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingApprovals.map((b) => {
              const bId = b.id || b._id;
              const isLoading = actionLoading === bId;
              const conflictCtx = getPendingApprovalConflictContext(b, bookings);

              return (
                <div
                  key={bId}
                  className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-champagne-dark uppercase tracking-wider">
                          Réf : {b.bookingReference}
                        </span>
                        {b.proposalResponse === "COUNTER_PROPOSED" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                            <CalendarClock className="w-3 h-3" />
                            <span>Nouvelle date choisie par la cliente</span>
                          </span>
                        )}
                        {conflictCtx.overlappingValidatedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Créneau déjà occupé</span>
                          </span>
                        ) : conflictCtx.dayValidatedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span>{conflictCtx.dayValidatedCount} rdv déjà validé ce jour</span>
                          </span>
                        ) : null}
                        {conflictCtx.competingPendingCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-brun border border-stone-300">
                            <span>{conflictCtx.competingPendingCount + 1} demandes sur ce créneau</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-brun truncate">
                        {b.customer.firstName} {b.customer.lastName}
                      </h3>
                      <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        {b.customer.phone && (
                          <a
                            href={`tel:${b.customer.phone}`}
                            className="inline-flex items-center gap-1 underline decoration-stone-300 hover:text-brun"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{b.customer.phone}</span>
                          </a>
                        )}
                        {b.customer.email && (
                          <a
                            href={`mailto:${b.customer.email}`}
                            className="inline-flex items-center gap-1 min-w-0 break-all underline decoration-stone-300 hover:text-brun"
                          >
                            <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{b.customer.email}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold font-serif text-brun">
                        {formatPrice(b.totalPrice)}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Acompte : {formatPrice(b.depositAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                    <div className="font-semibold text-brun">
                      {b.service.name} ({formatDuration(b.totalDuration)})
                    </div>
                    <div className="text-stone-600">
                      Date souhaitée : <strong>{formatDateFrench(b.date)}</strong> de{" "}
                      <strong>{b.startTime}</strong> à <strong>{b.endTime}</strong>
                    </div>
                    {b.proposalResponse === "COUNTER_PROPOSED" && b.previousDate && (
                      <div className="text-indigo-800 text-[11px]">
                        Créneau proposé refusé :{" "}
                        <span className="line-through">
                          {formatDateFrench(b.previousDate)} à {b.previousStartTime}
                        </span>
                      </div>
                    )}
                    {b.proposalDeclineReason && (
                      <div className="text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 italic">
                        Note cliente : &quot;{b.proposalDeclineReason}&quot;
                      </div>
                    )}
                    {b.customer.notes && (
                      <div className="text-stone-500 italic pt-1 border-t border-stone-200/60">
                        &quot;{b.customer.notes}&quot;
                      </div>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleApprove(bId)}
                      className="flex-1 min-w-[200px] min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{isLoading ? "Traitement..." : "Accepter & Envoyer lien acompte"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setProposeDateBooking(b)}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CalendarClock className="w-4 h-4 shrink-0" />
                      <span>Proposer date</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setRejectModalBooking(b)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-xs text-stone-500 font-light">
            Aucune demande en attente. Votre planning est parfaitement à jour.
          </div>
        )}
      </div>

      {/* RESCHEDULE PROPOSALS WAITING FOR CLIENT */}
      {rescheduleProposals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="font-serif text-xl font-bold text-brun">
                Nouvelles dates proposées (en attente client)
              </h2>
              <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {rescheduleProposals.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rescheduleProposals.map((b) => {
              const bId = b.id || b._id;
              const isLoading = actionLoading === bId;

              return (
                <div
                  key={bId}
                  className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-champagne-dark uppercase tracking-wider">
                        Réf : {b.bookingReference}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-brun truncate">
                        {b.customer.firstName} {b.customer.lastName}
                      </h3>
                      {b.customer.phone && (
                        <div className="text-xs text-stone-600 mt-0.5">
                          <a
                            href={`tel:${b.customer.phone}`}
                            className="inline-flex items-center gap-1 underline decoration-stone-300 hover:text-brun"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{b.customer.phone}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <CalendarClock className="w-3.5 h-3.5 text-indigo-700" />
                        <span>En attente réponse cliente</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1">
                    <div className="font-semibold text-brun">
                      {b.service.name} ({formatDuration(b.totalDuration)})
                    </div>
                    {b.previousDate && (
                      <div className="text-stone-500 line-through">
                        Créneau précédent : {formatDateFrench(b.previousDate)} à {b.previousStartTime}
                      </div>
                    )}
                    <div className="text-indigo-950 font-medium">
                      Date proposée : <strong>{formatDateFrench(b.date)}</strong> de{" "}
                      <strong>{b.startTime}</strong> à <strong>{b.endTime}</strong>
                    </div>
                    {b.proposalMessage && (
                      <div className="text-stone-600 italic pt-1 border-t border-indigo-100">
                        Message envoyé : &quot;{b.proposalMessage}&quot;
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-1 gap-2.5">
                    <Link
                      href={`/reserver/statut/${b.bookingReference}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] inline-flex items-center text-xs font-medium text-stone-600 hover:text-brun underline"
                    >
                      Voir fiche cliente
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setProposeDateBooking(b)}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <CalendarClock className="w-4 h-4 shrink-0" />
                        <span>Modifier la date</span>
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleCancel(bId)}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 border border-stone-200 text-stone-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Ban className="w-4 h-4 shrink-0" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DIRECT DEPOSITS TO VERIFY / MARK PAID */}
      {sortedPendingPayments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="font-serif text-xl font-bold text-brun">
                Acomptes directs à vérifier (Wero, Revolut, PayPal)
              </h2>
              <span className="bg-blue-100 text-blue-900 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {sortedPendingPayments.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedPendingPayments.map((b) => {
              const bId = b.id || b._id;
              const isLoading = actionLoading === bId;

              return (
                <div
                  key={bId}
                  className={`bg-white rounded-2xl p-5 border shadow-sm space-y-3 ${
                    b.depositDeclared ? "border-emerald-300 ring-1 ring-emerald-200" : "border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-champagne-dark uppercase tracking-wider">
                          Réf : {b.bookingReference}
                        </span>
                        {b.proposalResponse === "COUNTER_PROPOSED" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                            <CalendarClock className="w-3 h-3" />
                            <span>Nouvelle date choisie par la cliente</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-brun truncate">
                        {b.customer.firstName} {b.customer.lastName}
                      </h3>
                      {b.customer.phone && (
                        <div className="text-xs text-stone-600 mt-0.5">
                          <a
                            href={`tel:${b.customer.phone}`}
                            className="inline-flex items-center gap-1 underline decoration-stone-300 hover:text-brun"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{b.customer.phone}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {b.depositDeclared ? (
                        <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          Déclaré • {b.depositDeclaredMethod || "Direct"}
                        </span>
                      ) : (
                        <span className="inline-block bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          En attente d&apos;envoi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                    <div className="font-semibold text-brun">
                      {b.service.name} ({formatDuration(b.totalDuration)})
                    </div>
                    <div className="text-stone-600">
                      Créneau : <strong>{formatDateFrench(b.date)}</strong> de{" "}
                      <strong>{b.startTime}</strong> à <strong>{b.endTime}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-1 gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/reserver/statut/${b.bookingReference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] inline-flex items-center text-xs font-medium text-stone-600 hover:text-brun underline"
                      >
                        Voir fiche cliente
                      </Link>
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
                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-brun cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-champagne-dark" />
                        <span>Copier lien acompte</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUnvalidate(bId, b.status)}
                        title="Annuler la validation et remettre la demande « À valider »"
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>Dévalider</span>
                      </button>
                      {b.depositDeclared && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setDepositNotReceivedBooking(b);
                            setDepositNotReceivedNote("");
                          }}
                          className="min-h-[44px] inline-flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Acompte non reçu
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleMarkPaid(bId)}
                        className="min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {isLoading
                            ? "Confirmation..."
                            : `Valider acompte reçu (${formatPrice(b.depositAmount ?? 10)})`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UPCOMING CONFIRMED APPOINTMENTS */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-brun">
          Prochains rendez-vous confirmés
        </h2>

        {upcomingConfirmed.length > 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="divide-y divide-stone-100">
              {upcomingConfirmed.map((b) => {
                const bId = b.id || b._id;
                const isLoading = actionLoading === bId;
                return (
                <div
                  key={bId}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-champagne-light/50 flex flex-col items-center justify-center text-brun shrink-0">
                      <span className="text-[10px] uppercase font-bold text-champagne-dark">
                        {b.date ? b.date.slice(5) : ""}
                      </span>
                      <span className="font-serif font-bold text-sm">
                        {b.startTime}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-serif font-bold text-brun text-base">
                          {b.customer.firstName} {b.customer.lastName}
                        </h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          Confirmé
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5">
                        {b.service.name} • {formatDuration(b.totalDuration)}
                      </div>
                      {b.customer.phone && (
                        <div className="text-xs text-stone-500 mt-0.5">
                          <a
                            href={`tel:${b.customer.phone}`}
                            className="underline decoration-stone-300 hover:text-brun"
                          >
                            Tél : {b.customer.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:self-center">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-bold font-serif text-brun">
                        Solde restant : {formatPrice(b.remainingBalance)}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Acompte de {formatPrice(b.depositAmount)} réglé
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleUnvalidate(bId, b.status)}
                      title="Annuler la confirmation de l'acompte et remettre en attente de paiement"
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>Dévalider</span>
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-xs text-stone-500 font-light">
            Aucun rendez-vous confirmé à venir pour le moment.
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectModalBooking && (
        <div
          onClick={() => setRejectModalBooking(null)}
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
                Refuser {rejectModalBooking.customer.firstName}
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                aria-label="Fermer"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 inline-flex items-center justify-center text-brun cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4">
              <p className="text-sm text-stone-600 font-light">
                Le créneau du {formatDateFrench(rejectModalBooking.date)} à {rejectModalBooking.startTime} sera libéré et la cliente sera notifiée poliment par e-mail.
              </p>

              <div>
                <label className="text-sm font-semibold text-brun block mb-1.5">
                  Motif du refus (optionnel) :
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex : Indisponibilité exceptionnelle ce jour-là, ou créneau déjà réservé en direct."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading === (rejectModalBooking.id || rejectModalBooking._id)}
                className="min-h-[44px] bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer"
              >
                {actionLoading === (rejectModalBooking.id || rejectModalBooking._id)
                  ? "Enregistrement..."
                  : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPOSIT NOT RECEIVED MODAL */}
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
                Acompte non reçu ({depositNotReceivedBooking.customer.firstName})
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
                Un e-mail et un SMS seront envoyés à la cliente pour l&apos;informer que le virement n&apos;apparaît pas encore sur votre compte afin qu&apos;elle vérifie et re-valide.
              </p>

              <div>
                <label className="text-sm font-semibold text-brun block mb-1.5">
                  Message complémentaire (optionnel) :
                </label>
                <textarea
                  rows={3}
                  value={depositNotReceivedNote}
                  onChange={(e) => setDepositNotReceivedNote(e.target.value)}
                  placeholder="Ex : Aucun virement reçu sur Wero/Revolut/PayPal. Merci de vérifier le 07 67 66 38 69."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-end gap-3 shrink-0">
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
      <ProposeDateModal
        booking={proposeDateBooking}
        onClose={() => setProposeDateBooking(null)}
        onSuccess={(updatedBooking, msg) => {
          if (updatedBooking) {
            setBookings((prev) =>
              prev.map((b) =>
                (b.id || b._id) === (updatedBooking.id || updatedBooking._id)
                  ? normalizeBookingStatus(updatedBooking)
                  : b
              )
            );
          }
          setProposeDateBooking(null);
          router.refresh();
          showToast(
            msg || "Nouvelle date proposée et envoyée à la cliente par e-mail et SMS !"
          );
        }}
      />
    </div>
  );
}
