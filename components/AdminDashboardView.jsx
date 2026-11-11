"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  TrendingUp,
  User,
  Phone,
  Mail,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Power,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";
import { DEFAULT_MAINTENANCE } from "@/lib/siteContent";
import { getParisDateString } from "@/lib/adminHelpers";

export default function AdminDashboardView({
  initialStats,
  initialBookings,
  initialMaintenance = DEFAULT_MAINTENANCE,
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings || []);
  const [maintenance, setMaintenance] = useState(
    initialMaintenance || DEFAULT_MAINTENANCE
  );
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setBookings(initialBookings || []);
  }, [initialBookings]);

  useEffect(() => {
    setMaintenance(initialMaintenance || DEFAULT_MAINTENANCE);
  }, [initialMaintenance]);

  const pendingApprovals = bookings.filter(
    (b) => b.status === "PENDING_APPROVAL"
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

  // Prochains rendez-vous confirmés
  const upcomingConfirmed = confirmedBookings
    .filter((b) => b.date >= todayStr)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
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
            Tableau de Bord
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Aperçu en temps réel de votre activité, de vos encaissements et de votre planning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/site-editor"
            className="inline-flex items-center space-x-2 bg-champagne hover:bg-champagne-light text-brun-dark px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-brun" />
            <span>Modifier tout le site</span>
          </Link>
          <Link
            href="/admin/emails"
            className="inline-flex items-center space-x-2 bg-white border border-stone-300 hover:border-champagne text-brun px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors"
          >
            <Mail className="w-4 h-4 text-champagne-dark" />
            <span>Cartes Mail &amp; Gmail</span>
          </Link>
          <Link
            href="/admin/calendar"
            className="inline-flex items-center space-x-2 bg-white border border-stone-300 hover:border-champagne text-brun px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-champagne-dark" />
            <span>Ouvrir le calendrier</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors"
          >
            <span>Toutes les réservations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bouton de Secours Instantané : Mode Maintenance */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border-2 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all ${
          maintenance.enabled
            ? "bg-red-50 border-red-400"
            : "bg-white border-stone-200"
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                maintenance.enabled
                  ? "bg-red-600 text-white"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              {maintenance.enabled ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>MODE MAINTENANCE ACTIF</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SITE EN LIGNE</span>
                </>
              )}
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-brun">
            Bouton de Secours : Page de Maintenance
          </h2>
          <p className="text-sm text-stone-600 max-w-2xl">
            En cas de problème technique ou de grosse mise à jour, passez le site public en mode maintenance en 1 clic tout en gardant accès à votre administration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={togglingMaintenance}
            onClick={handleToggleMaintenance}
            className={`inline-flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60 ${
              maintenance.enabled
                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {togglingMaintenance ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>
              {togglingMaintenance
                ? "Mise à jour..."
                : maintenance.enabled
                ? "Désactiver la maintenance"
                : "Activer la maintenance"}
            </span>
          </button>

          <Link
            href="/admin/site-editor?tab=maintenance"
            className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-brun border border-stone-300 text-sm font-semibold transition-colors"
          >
            <span>Personnaliser le message</span>
          </Link>

          <a
            href="/?preview_maintenance=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-sm font-semibold transition-colors"
          >
            <span>Aperçu</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Banner Site Editor */}
      <div className="bg-gradient-to-r from-brun via-brun-dark to-stone-900 text-creme rounded-3xl p-5 sm:p-6 border border-champagne/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-champagne animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-champagne">
              Contrôle Complet du Site
            </span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-creme">
            Modifiez chaque page, texte, photo, FAQ et règlement en direct
          </h2>
          <p className="text-sm text-stone-300 font-light max-w-2xl">
            Accueil, Prestations, Galerie, À propos de moi, Contact, Règlement Intérieur, Mentions Légales, Confidentialité, Menu et Pied de page.
          </p>
        </div>
        <Link
          href="/admin/site-editor"
          className="inline-flex items-center space-x-2 bg-champagne hover:bg-champagne-light text-brun-dark px-5 py-3 rounded-2xl text-sm font-bold shadow-md transition-all shrink-0 hover:scale-[1.02]"
        >
          <span>Ouvrir l&apos;éditeur complet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((b) => {
              const bId = b.id || b._id;
              const isLoading = actionLoading === bId;

              return (
                <div
                  key={bId}
                  className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-champagne-dark uppercase tracking-wider">
                        Réf : {b.bookingReference}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-brun">
                        {b.customer.firstName} {b.customer.lastName}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center space-x-3 mt-1">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{b.customer.phone}</span>
                        </span>
                        {b.customer.email && (
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{b.customer.email}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
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
                    {b.customer.notes && (
                      <div className="text-stone-500 italic pt-1 border-t border-stone-200/60">
                        "{b.customer.notes}"
                      </div>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center space-x-3 pt-1">
                    <button
                      disabled={isLoading}
                      onClick={() => handleApprove(bId)}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isLoading ? "Traitement..." : "Accepter & Envoyer lien acompte"}</span>
                    </button>

                    <button
                      disabled={isLoading}
                      onClick={() => setRejectModalBooking(b)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <span className="text-[10px] font-bold text-champagne-dark uppercase tracking-wider">
                        Réf : {b.bookingReference}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-brun">
                        {b.customer.firstName} {b.customer.lastName}
                      </h3>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Tél : {b.customer.phone}
                      </div>
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

                  <div className="flex items-center justify-between pt-1 gap-3">
                    <Link
                      href={`/reserver/statut/${b.bookingReference}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-600 hover:text-brun underline"
                    >
                      Voir fiche cliente
                    </Link>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleMarkPaid(bId)}
                      className="inline-flex items-center justify-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {isLoading
                          ? "Confirmation..."
                          : `Valider acompte reçu (${formatPrice(b.depositAmount ?? 10)})`}
                      </span>
                    </button>
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
              {upcomingConfirmed.map((b) => (
                <div
                  key={b.id || b._id}
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
                      <div className="text-[11px] text-stone-400">
                        Tél : {b.customer.phone}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <div className="text-sm font-bold font-serif text-brun">
                      Solde restant : {formatPrice(b.remainingBalance)}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Acompte de {formatPrice(b.depositAmount)} réglé
                    </div>
                  </div>
                </div>
              ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-300 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-brun">
              Refuser la demande de {rejectModalBooking.customer.firstName}
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Le créneau du {rejectModalBooking.date} à {rejectModalBooking.startTime} sera libéré et la cliente sera notifiée poliment par e-mail.
            </p>

            <div>
              <label className="text-xs font-semibold text-brun block mb-1">
                Motif du refus (optionnel) :
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex : Indisponibilité exceptionnelle ce jour-là, ou créneau déjà réservé en direct."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-brun focus:outline-none focus:border-champagne"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setRejectModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading === (rejectModalBooking.id || rejectModalBooking._id)}
                className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading === (rejectModalBooking.id || rejectModalBooking._id)
                  ? "Enregistrement..."
                  : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
