"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  Ban,
  CalendarClock,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";
import {
  getParisDateString,
  getBookingStatusLabel,
  normalizeBookingStatus,
} from "@/lib/adminHelpers";
import {
  isLengthOption,
  formatOptionChoiceDisplayLabel,
} from "@/lib/servicePricing";
import { getCalendarDayUnavailabilitySummary } from "@/lib/slotMasking";
import QuickSlotMasker from "./admin/QuickSlotMasker";
import ProposeDateModal from "./admin/ProposeDateModal";

function buildManualFormDefaults(services, dateStr = getParisDateString()) {
  const svc = services[0] || null;
  const lenOpt = Array.isArray(svc?.options)
    ? svc.options.find((o) => isLengthOption(o))
    : null;
  const firstChoice = lenOpt?.choices?.[0] || null;
  const basePrice = Number(svc?.price) || 0;
  const baseDur = Number(svc?.duration) || 180;
  return {
    serviceId: svc?.id || svc?._id || "",
    lengthChoice: firstChoice?.label || "",
    totalPrice: String(basePrice + (Number(firstChoice?.priceDiff) || 0)),
    duration: String(baseDur + (Number(firstChoice?.durationDiff) || 0)),
    status: "CONFIRMED",
    customerFirstName: "",
    customerLastName: "",
    customerEmail: "",
    customerPhone: "",
    date: dateStr,
    startTime: "10:00",
    notes: "",
  };
}

export default function AdminCalendarView({
  initialBookings = [],
  services = [],
  initialAvailabilities = [],
  initialUnavailabilities = [],
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(() =>
    (initialBookings || []).map((b) => normalizeBookingStatus(b))
  );
  const [availabilities, setAvailabilities] = useState(initialAvailabilities || []);
  const [unavailabilities, setUnavailabilities] = useState(
    initialUnavailabilities || []
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(() => getParisDateString());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // Toast + Action Modals
  const [toastMessage, setToastMessage] = useState("");
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [depositNotReceivedBooking, setDepositNotReceivedBooking] = useState(null);
  const [depositNotReceivedNote, setDepositNotReceivedNote] = useState("");
  const [proposeDateBooking, setProposeDateBooking] = useState(null);

  // Manual booking form state
  const [manualForm, setManualForm] = useState(() =>
    buildManualFormDefaults(services)
  );
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState("");
  const [modalActionLoading, setModalActionLoading] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  useEffect(() => {
    if (
      !selectedBooking &&
      !showManualModal &&
      !rejectModalBooking &&
      !depositNotReceivedBooking
    )
      return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedBooking(null);
        setShowManualModal(false);
        setRejectModalBooking(null);
        setDepositNotReceivedBooking(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedBooking,
    showManualModal,
    rejectModalBooking,
    depositNotReceivedBooking,
  ]);

  const openManualModalForDate = (dateStr) => {
    setManualError("");
    setManualForm((prev) => {
      const targetDate = dateStr || selectedDayStr || getParisDateString();
      if (!prev.serviceId && services.length > 0) {
        return buildManualFormDefaults(services, targetDate);
      }
      return {
        ...prev,
        date: targetDate,
      };
    });
    setShowManualModal(true);
  };

  const selectedManualService =
    services.find((s) => (s.id || s._id) === manualForm.serviceId) || null;
  const manualLengthOption = Array.isArray(selectedManualService?.options)
    ? selectedManualService.options.find((o) => isLengthOption(o))
    : null;

  const handleSelectManualService = (nextServiceId) => {
    const svc = services.find((s) => (s.id || s._id) === nextServiceId) || null;
    const lenOpt = Array.isArray(svc?.options)
      ? svc.options.find((o) => isLengthOption(o))
      : null;
    const firstChoice = lenOpt?.choices?.[0] || null;
    const basePrice = Number(svc?.price) || 0;
    const baseDur = Number(svc?.duration) || 180;
    setManualForm((prev) => ({
      ...prev,
      serviceId: nextServiceId,
      lengthChoice: firstChoice?.label || "",
      totalPrice: String(basePrice + (Number(firstChoice?.priceDiff) || 0)),
      duration: String(baseDur + (Number(firstChoice?.durationDiff) || 0)),
    }));
  };

  const handleSelectManualLength = (choiceLabel) => {
    if (!selectedManualService || !manualLengthOption) {
      setManualForm((prev) => ({ ...prev, lengthChoice: choiceLabel }));
      return;
    }
    const found = (manualLengthOption.choices || []).find(
      (c) => c.label === choiceLabel
    );
    const basePrice = Number(selectedManualService.price) || 0;
    const baseDur = Number(selectedManualService.duration) || 180;
    setManualForm((prev) => ({
      ...prev,
      lengthChoice: choiceLabel,
      totalPrice: String(basePrice + (Number(found?.priceDiff) || 0)),
      duration: String(baseDur + (Number(found?.durationDiff) || 0)),
    }));
  };

  const syncUpdatedBooking = (updated) => {
    if (!updated) return;
    const normalized = normalizeBookingStatus(updated);
    const id = normalized.id || normalized._id;
    setBookings((prev) =>
      prev.map((item) => ((item.id || item._id) === id ? normalized : item))
    );
    if (selectedBooking && (selectedBooking.id || selectedBooking._id) === id) {
      setSelectedBooking(normalized);
    }
  };

  const handleApproveFromCalendar = async (booking) => {
    const bId = booking?.id || booking?._id;
    if (!bId) return;
    setModalActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        syncUpdatedBooking(data.booking);
        router.refresh();
        showToast("Demande acceptée ! Lien d'acompte envoyé à la cliente.");
      } else {
        showToast(data.error || "Impossible d'approuver cette demande.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de la validation de la demande.");
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleMarkPaidFromCalendar = async (booking) => {
    const bId = booking?.id || booking?._id;
    if (!bId) return;
    setModalActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bId}/mark-paid`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        syncUpdatedBooking(data.booking);
        router.refresh();
        showToast("Acompte validé ! Rendez-vous confirmé et adresse envoyée.");
      } else {
        showToast(data.error || "Impossible de valider cet acompte.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de la validation de l'acompte.");
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleConfirmRejectFromCalendar = async () => {
    if (!rejectModalBooking) return;
    const bId = rejectModalBooking.id || rejectModalBooking._id;
    setModalActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        syncUpdatedBooking(data.booking);
        router.refresh();
        showToast("Demande refusée et créneau libéré.");
        setRejectModalBooking(null);
        setRejectionReason("");
      } else {
        showToast(data.error || "Impossible d'enregistrer le refus.");
      }
    } catch (_) {
      showToast("Erreur réseau lors du refus de la demande.");
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleConfirmDepositNotReceivedFromCalendar = async () => {
    if (!depositNotReceivedBooking) return;
    const bId = depositNotReceivedBooking.id || depositNotReceivedBooking._id;
    setModalActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bId}/deposit-not-received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: depositNotReceivedNote }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        syncUpdatedBooking(data.booking);
        router.refresh();
        showToast("Relance envoyée à la cliente par e-mail et SMS.");
        setDepositNotReceivedBooking(null);
        setDepositNotReceivedNote("");
      } else {
        showToast(data.error || "Impossible d'envoyer la relance.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de l'envoi de la relance.");
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleCancelFromCalendar = async (booking) => {
    const bId = booking?.id || booking?._id;
    if (!bId) return;
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    setModalActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        syncUpdatedBooking(data.booking);
        router.refresh();
        showToast("Rendez-vous annulé et créneau libéré.");
      } else {
        showToast(data.error || "Impossible d'annuler ce rendez-vous.");
      }
    } catch (_) {
      showToast("Erreur réseau lors de l'annulation.");
    } finally {
      setModalActionLoading(false);
    }
  };

  useEffect(() => {
    setBookings((initialBookings || []).map((b) => normalizeBookingStatus(b)));
  }, [initialBookings]);

  useEffect(() => {
    setAvailabilities(initialAvailabilities || []);
  }, [initialAvailabilities]);

  useEffect(() => {
    setUnavailabilities(initialUnavailabilities || []);
  }, [initialUnavailabilities]);

  useEffect(() => {
    if (!manualForm.serviceId && services.length > 0) {
      setManualForm(buildManualFormDefaults(services, selectedDayStr));
    }
  }, [services, manualForm.serviceId, selectedDayStr]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDayStr(getParisDateString());
  };

  const monthNamesFr = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  // Map bookings by date string YYYY-MM-DD
  const bookingsByDate = {};
  bookings.forEach((b) => {
    if (!bookingsByDate[b.date]) {
      bookingsByDate[b.date] = [];
    }
    bookingsByDate[b.date].push(b);
  });

  // Handle Manual Booking Submission
  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    setManualSubmitting(true);
    setManualError("");

    try {
      let selectedOptions = [];
      if (manualLengthOption && manualForm.lengthChoice) {
        const found = (manualLengthOption.choices || []).find(
          (c) => c.label === manualForm.lengthChoice
        );
        if (found) {
          selectedOptions = [
            {
              name: manualLengthOption.name,
              choice: formatOptionChoiceDisplayLabel(
                found,
                selectedManualService?.price,
                true
              ),
              priceDiff: Number(found.priceDiff) || 0,
              durationDiff: Number(found.durationDiff) || 0,
            },
          ];
        }
      }

      const parsedDuration = Number(manualForm.duration);
      const parsedPrice = Number(manualForm.totalPrice);

      const res = await fetch("/api/admin/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: manualForm.serviceId,
          customerFirstName: manualForm.customerFirstName,
          customerLastName: manualForm.customerLastName,
          customerEmail: manualForm.customerEmail,
          customerPhone: manualForm.customerPhone,
          date: manualForm.date,
          startTime: manualForm.startTime,
          notes: manualForm.notes,
          status: manualForm.status || "CONFIRMED",
          duration: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : undefined,
          totalPrice:
            manualForm.totalPrice !== "" && Number.isFinite(parsedPrice) && parsedPrice >= 0
              ? parsedPrice
              : undefined,
          selectedOptions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const normalized = normalizeBookingStatus(data.booking);
        setBookings((prev) => [...prev, normalized]);
        setSelectedDayStr(normalized.date || manualForm.date);
        router.refresh();
        setShowManualModal(false);
        setManualForm(buildManualFormDefaults(services, normalized.date || getParisDateString()));
        showToast("Rendez-vous ajouté au calendrier !");
      } else {
        setManualError(data.error || "Erreur lors de l'ajout.");
      }
    } catch (err) {
      setManualError("Erreur réseau.");
    } finally {
      setManualSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "PENDING_APPROVAL":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "RESCHEDULE_PROPOSED":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case "PENDING_PAYMENT":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "EXPIRED":
        return "bg-stone-200 text-stone-600 border-stone-300";
      case "CANCELLED":
      case "REJECTED":
        return "bg-stone-200 text-stone-700 border-stone-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  // Calendar matrix calculation
  // Offset: Monday = 0, Sunday = 6
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const calendarCells = [];

  // Blank slots for previous month
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarCells.push({ blank: true, dayNumber: null });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    const dayBookings = bookingsByDate[dateStr] || [];
    calendarCells.push({
      blank: false,
      dayNumber: d,
      dateStr,
      bookings: dayBookings,
    });
  }

  const selectedDayBookings = (bookingsByDate[selectedDayStr] || [])
    .slice()
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-20 lg:top-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs sm:text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
            Planning & Calendrier
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Touchez un jour pour voir ses rendez-vous, cocher des créneaux à masquer en 1 clic ou ajouter un rendez-vous.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => openManualModalForDate(selectedDayStr)}
            className="min-h-[44px] inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter un rendez-vous direct</span>
          </button>
        </div>
      </div>

      {/* Month Navigation & Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
              {monthNamesFr[month]} {year}
            </h2>
            <button
              type="button"
              onClick={goToToday}
              className="text-xs sm:text-sm font-semibold px-3.5 min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              Aujourd&apos;hui
            </button>
          </div>

          <div className="flex items-center space-x-1 border border-stone-200 rounded-2xl p-1 bg-stone-50">
            <button
              type="button"
              onClick={prevMonth}
              className="w-11 h-11 rounded-xl hover:bg-white text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="w-11 h-11 rounded-xl hover:bg-white text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600 border-t border-b border-stone-100 py-2.5">
          <span className="font-semibold text-stone-500">Légende :</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Confirmé</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>À valider</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Date proposée</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Paiement en attente</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span>Jour fermé</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 border border-amber-500" />
            <span>Créneaux masqués</span>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mer</div>
          <div>Jeu</div>
          <div>Ven</div>
          <div>Sam</div>
          <div>Dim</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarCells.map((cell, idx) => {
            if (cell.blank) {
              return (
                <div
                  key={`blank-${idx}`}
                  className="min-h-20 sm:min-h-24 rounded-2xl bg-stone-50/50 border border-transparent p-1.5 sm:p-2"
                />
              );
            }

            const todayStr = getParisDateString();
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDayStr;
            const daySummary = getCalendarDayUnavailabilitySummary({
              dateStr: cell.dateStr,
              availabilities,
              unavailabilities,
            });

            return (
              <div
                key={cell.dateStr}
                data-date={cell.dateStr}
                onClick={() => setSelectedDayStr(cell.dateStr)}
                className={`min-h-20 sm:min-h-28 rounded-2xl border p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? "ring-2 ring-brun border-brun bg-champagne-light/30 shadow-xs"
                    : daySummary.isAllDayBlocked
                    ? "bg-red-50/75 border-red-200 hover:border-red-300"
                    : daySummary.isWeeklyClosed
                    ? "bg-stone-100/80 border-stone-200 text-stone-500 hover:border-stone-300"
                    : isToday
                    ? "bg-amber-50/40 border-champagne"
                    : "bg-white border-stone-200 hover:border-champagne"
                }`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isToday
                        ? "bg-brun text-champagne"
                        : isSelected
                        ? "bg-champagne text-brun-dark"
                        : "text-stone-700"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  <div className="flex items-center gap-1 min-w-0">
                    {daySummary.isAllDayBlocked ? (
                      <>
                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold truncate">
                          Fermé
                        </span>
                        <span className="sm:hidden w-2 h-2 rounded-full bg-red-500 shrink-0" aria-label="Fermé" />
                      </>
                    ) : daySummary.partialRanges.length > 0 ? (
                      <>
                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold truncate">
                          {daySummary.partialRanges.length} masq.
                        </span>
                        <span className="sm:hidden w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-label="Créneaux masqués" />
                      </>
                    ) : daySummary.isWeeklyClosed ? (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 text-[10px] font-semibold truncate">
                        Repos
                      </span>
                    ) : null}

                    {cell.bookings.length > 0 && (
                      <span className="hidden md:inline text-[10px] text-stone-500 font-semibold shrink-0">
                        {cell.bookings.length} rdv
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Bookings Chips */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-18 scrollbar-none">
                  {cell.bookings.map((b) => (
                    <button
                      type="button"
                      key={b.id || b._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayStr(cell.dateStr);
                        setSelectedBooking(b);
                      }}
                      className={`compact-chip w-full text-left px-1.5 py-1 rounded-md text-[10px] font-semibold truncate border transition-all cursor-pointer ${getStatusColor(
                        b.status
                      )}`}
                    >
                      {b.startTime} • {b.customer.firstName}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AGENDA DU JOUR SÉLECTIONNÉ (PANNEAU TACTILE IPAD) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-champagne-dark block">
              Journée sélectionnée
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun capitalize">
              Agenda du {formatDateFrench(selectedDayStr)} ({selectedDayBookings.length} rdv)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => openManualModalForDate(selectedDayStr)}
            className="min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un rdv ce jour</span>
          </button>
        </div>

        {selectedDayBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {selectedDayBookings.map((b) => {
              const bId = b.id || b._id;
              return (
                <div
                  key={bId}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-brun text-base">
                          {b.startTime} – {b.endTime}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(b.status)}`}>
                          {getBookingStatusLabel(b.status)}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-brun text-lg mt-1">
                        {b.customer.firstName} {b.customer.lastName}
                      </h3>
                      <div className="text-xs text-stone-600 mt-0.5">
                        {b.service.name} ({formatDuration(b.totalDuration)}) •{" "}
                        <strong>{formatPrice(b.totalPrice)}</strong>
                      </div>
                      {b.previousDate && (b.previousDate !== b.date || b.previousStartTime !== b.startTime) && (
                        <div className="text-[11px] text-stone-500 line-through mt-0.5">
                          Ancien créneau : {formatDateFrench(b.previousDate)} à {b.previousStartTime}
                        </div>
                      )}
                      {b.status === "RESCHEDULE_PROPOSED" && b.proposalMessage && (
                        <div className="text-[11px] text-indigo-900 italic mt-1">
                          Note envoyée : &quot;{b.proposalMessage}&quot;
                        </div>
                      )}
                      {b.proposalDeclineReason && (
                        <div className="text-[11px] text-indigo-900 italic mt-1">
                          Note cliente : &quot;{b.proposalDeclineReason}&quot;
                        </div>
                      )}
                      {b.customer.phone && (
                        <a
                          href={`tel:${b.customer.phone}`}
                          className="inline-flex items-center space-x-1.5 text-xs font-medium text-champagne-dark hover:underline mt-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{b.customer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200/80">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs font-semibold text-brun cursor-pointer"
                    >
                      Voir détails
                    </button>
                    {b.status === "PENDING_APPROVAL" && (
                      <>
                        <button
                          type="button"
                          disabled={modalActionLoading}
                          onClick={() => handleApproveFromCalendar(b)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          Valider demande
                        </button>
                        <button
                          type="button"
                          disabled={modalActionLoading}
                          onClick={() => {
                            setRejectModalBooking(b);
                            setRejectionReason("");
                          }}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {b.status === "PENDING_PAYMENT" && (
                      <>
                        <button
                          type="button"
                          disabled={modalActionLoading}
                          onClick={() => handleMarkPaidFromCalendar(b)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          Valider acompte ({formatPrice(b.depositAmount ?? 10)})
                        </button>
                        {b.depositDeclared && (
                          <button
                            type="button"
                            disabled={modalActionLoading}
                            onClick={() => {
                              setDepositNotReceivedBooking(b);
                              setDepositNotReceivedNote("");
                            }}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            Acompte non reçu
                          </button>
                        )}
                      </>
                    )}
                    {(b.status === "PENDING_APPROVAL" ||
                      b.status === "RESCHEDULE_PROPOSED" ||
                      (b.status === "PENDING_PAYMENT" && !b.depositDeclared)) && (
                      <button
                        type="button"
                        disabled={modalActionLoading}
                        onClick={() => setProposeDateBooking(b)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>
                          {b.status === "RESCHEDULE_PROPOSED"
                            ? "Modifier date"
                            : "Proposer autre date"}
                        </span>
                      </button>
                    )}
                    {["PENDING_PAYMENT", "CONFIRMED", "RESCHEDULE_PROPOSED"].includes(b.status) && (
                      <button
                        type="button"
                        disabled={modalActionLoading}
                        onClick={() => handleCancelFromCalendar(b)}
                        className="min-h-[44px] px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Annuler</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 px-4 rounded-2xl bg-stone-50 border border-stone-100 text-center text-xs sm:text-sm text-stone-500 font-light">
            Aucun rendez-vous prévu le {formatDateFrench(selectedDayStr)}.
          </div>
        )}

        {/* Masquage rapide des créneaux de la journée en 1 tap */}
        <div className="pt-2">
          <QuickSlotMasker
            dateStr={selectedDayStr}
            availabilities={availabilities}
            unavailabilities={unavailabilities}
            bookings={bookings}
            onUnavailabilitiesChange={setUnavailabilities}
            onToast={showToast}
            showAvailabilityLink={true}
          />
        </div>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div
          onClick={() => setSelectedBooking(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full border border-stone-300 shadow-2xl max-h-[88dvh] flex flex-col overflow-hidden overscroll-contain"
          >
            <div className="px-6 py-4 sm:px-8 sm:py-5 flex items-start justify-between border-b border-stone-100 shrink-0">
              <div>
                <span className="text-[11px] uppercase font-bold text-champagne-dark">
                  Réf : {selectedBooking.bookingReference}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-brun">
                  {selectedBooking.customer.firstName} {selectedBooking.customer.lastName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Fermer la fenêtre"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 overscroll-contain">
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Statut :</span>
                  <span className="font-bold text-brun text-right">
                    {getBookingStatusLabel(selectedBooking.status)}
                    {selectedBooking.depositDeclared && selectedBooking.status === "PENDING_PAYMENT"
                      ? ` (Déclaré • ${selectedBooking.depositDeclaredMethod || "Direct"})`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Prestation :</span>
                  <span className="font-bold text-brun text-right">{selectedBooking.service.name}</span>
                </div>
                {Array.isArray(selectedBooking.selectedOptions) &&
                  selectedBooking.selectedOptions.length > 0 && (
                    <div className="py-1.5 border-b border-stone-100 flex flex-wrap justify-between items-start gap-2">
                      <span className="text-stone-500">Options / Longueur :</span>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {selectedBooking.selectedOptions.map((opt, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-brun font-medium"
                          >
                            {opt.name} : {opt.choice}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Date & Horaires :</span>
                  <span className="font-bold text-brun text-right">
                    {formatDateFrench(selectedBooking.date)} de {selectedBooking.startTime} à {selectedBooking.endTime}
                  </span>
                </div>
                {selectedBooking.previousDate &&
                  (selectedBooking.previousDate !== selectedBooking.date ||
                    selectedBooking.previousStartTime !== selectedBooking.startTime) && (
                    <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">Ancien créneau :</span>
                      <span className="text-stone-400 line-through text-right">
                        {formatDateFrench(selectedBooking.previousDate)} à {selectedBooking.previousStartTime}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Durée :</span>
                  <span className="font-bold text-brun">
                    {formatDuration(selectedBooking.totalDuration)}
                  </span>
                </div>
                {selectedBooking.customer.instagram && (
                  <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Instagram :</span>
                    <span className="font-mono font-bold text-champagne-dark">{selectedBooking.customer.instagram}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Téléphone :</span>
                  <a
                    href={`tel:${selectedBooking.customer.phone}`}
                    className="font-bold text-brun hover:text-champagne-dark underline"
                  >
                    {selectedBooking.customer.phone}
                  </a>
                </div>
                <div className="flex justify-between items-center gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 shrink-0">E-mail :</span>
                  {selectedBooking.customer.email ? (
                    <a
                      href={`mailto:${selectedBooking.customer.email}`}
                      className="font-bold text-brun hover:text-champagne-dark underline break-all text-right"
                    >
                      {selectedBooking.customer.email}
                    </a>
                  ) : (
                    <span className="font-bold text-stone-400">Non renseigné</span>
                  )}
                </div>
                <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Montant total :</span>
                  <span className="font-serif font-bold text-brun text-base">
                    {formatPrice(selectedBooking.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Acompte :</span>
                  <span className="font-bold text-champagne-dark">
                    {formatPrice(selectedBooking.depositAmount)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1.5">
                  <span className="text-stone-500">Solde restant :</span>
                  <span className="font-bold text-brun">
                    {formatPrice(selectedBooking.remainingBalance)}
                  </span>
                </div>
              </div>

              {selectedBooking.proposalMessage && (
                <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 text-xs sm:text-sm text-indigo-950">
                  <strong>Proposition envoyée :</strong> {selectedBooking.proposalMessage}
                </div>
              )}

              {selectedBooking.proposalDeclineReason && (
                <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 text-xs sm:text-sm text-indigo-950">
                  <strong>Note cliente (contre-proposition) :</strong> {selectedBooking.proposalDeclineReason}
                </div>
              )}

              {selectedBooking.customer.notes && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-600">
                  <strong>Notes :</strong> {selectedBooking.customer.notes}
                </div>
              )}
            </div>

            <div className="px-6 py-4 sm:px-8 border-t border-stone-100 bg-stone-50/90 flex flex-wrap items-center justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {selectedBooking.status === "PENDING_APPROVAL" && (
                <>
                  <button
                    type="button"
                    disabled={modalActionLoading}
                    onClick={() => {
                      setRejectModalBooking(selectedBooking);
                      setRejectionReason("");
                    }}
                    className="min-h-[44px] bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    disabled={modalActionLoading}
                    onClick={() => handleApproveFromCalendar(selectedBooking)}
                    className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {modalActionLoading ? "Validation..." : "Valider demande"}
                  </button>
                </>
              )}
              {selectedBooking.status === "PENDING_PAYMENT" && (
                <>
                  {selectedBooking.depositDeclared && (
                    <button
                      type="button"
                      disabled={modalActionLoading}
                      onClick={() => {
                        setDepositNotReceivedBooking(selectedBooking);
                        setDepositNotReceivedNote("");
                      }}
                      className="min-h-[44px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Acompte non reçu
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={modalActionLoading}
                    onClick={() => handleMarkPaidFromCalendar(selectedBooking)}
                    className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {modalActionLoading
                      ? "Confirmation..."
                      : `Valider acompte reçu (${formatPrice(selectedBooking.depositAmount ?? 10)})`}
                  </button>
                </>
              )}
              {(selectedBooking.status === "PENDING_APPROVAL" ||
                selectedBooking.status === "RESCHEDULE_PROPOSED" ||
                (selectedBooking.status === "PENDING_PAYMENT" && !selectedBooking.depositDeclared)) && (
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() => setProposeDateBooking(selectedBooking)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>
                    {selectedBooking.status === "RESCHEDULE_PROPOSED"
                      ? "Modifier date proposée"
                      : "Proposer autre date"}
                  </span>
                </button>
              )}
              {["PENDING_PAYMENT", "CONFIRMED", "RESCHEDULE_PROPOSED"].includes(selectedBooking.status) && (
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() => handleCancelFromCalendar(selectedBooking)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Annuler ce rdv
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="min-h-[44px] bg-brun hover:bg-brun-dark text-creme px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalBooking && (
        <div
          onClick={() => setRejectModalBooking(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full border border-stone-300 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-brun">
                  Refuser la demande
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  La cliente ({rejectModalBooking.customer.firstName}) sera notifiée par e-mail et SMS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                aria-label="Fermer la fenêtre"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-brun block mb-1.5">
                Motif ou message personnalisé (optionnel)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex : Indisponibilité exceptionnelle sur cet horaire, n'hésitez pas à choisir un autre créneau..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-base xl:text-xs text-brun"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={modalActionLoading}
                onClick={handleConfirmRejectFromCalendar}
                className="min-h-[44px] bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {modalActionLoading ? "Envoi..." : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPOSIT NOT RECEIVED MODAL */}
      {depositNotReceivedBooking && (
        <div
          onClick={() => setDepositNotReceivedBooking(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full border border-stone-300 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-brun">
                  Acompte non reçu
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  La cliente ({depositNotReceivedBooking.customer.firstName}) recevra un message lui indiquant que son acompte n&apos;a pas encore été reçu et pourra vérifier son virement (délai +2h).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDepositNotReceivedBooking(null)}
                aria-label="Fermer la fenêtre"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-brun block mb-1.5">
                Note à inclure dans l&apos;e-mail (optionnel)
              </label>
              <textarea
                rows={3}
                value={depositNotReceivedNote}
                onChange={(e) => setDepositNotReceivedNote(e.target.value)}
                placeholder="Ex : Aucun virement reçu sur Wero ou Revolut pour le moment. Pensez à vérifier le libellé ou le destinataire..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-base xl:text-xs text-brun"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDepositNotReceivedBooking(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={modalActionLoading}
                onClick={handleConfirmDepositNotReceivedFromCalendar}
                className="min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {modalActionLoading ? "Envoi..." : "Envoyer la relance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL BOOKING MODAL */}
      {showManualModal && (
        <div
          onClick={() => setShowManualModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full border border-stone-300 shadow-2xl max-h-[88dvh] flex flex-col overflow-hidden overscroll-contain"
          >
            <div className="px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between border-b border-stone-100 shrink-0">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brun">
                Ajouter un rendez-vous manuel
              </h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                aria-label="Fermer la fenêtre"
                className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="admin-manual-booking-form"
              onSubmit={handleCreateManualBooking}
              className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 overscroll-contain"
            >
              {manualError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              <div>
                <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                  Prestation *
                </label>
                <select
                  value={manualForm.serviceId}
                  onChange={(e) => handleSelectManualService(e.target.value)}
                  className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
                >
                  {services.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name} ({formatPrice(s.price)} - {formatDuration(s.duration)})
                    </option>
                  ))}
                </select>
              </div>

              {manualLengthOption &&
                Array.isArray(manualLengthOption.choices) &&
                manualLengthOption.choices.length > 0 && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                      {manualLengthOption.name || "Longueur des tresses"}
                    </label>
                    <select
                      value={manualForm.lengthChoice}
                      onChange={(e) => handleSelectManualLength(e.target.value)}
                      className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
                    >
                      {manualLengthOption.choices.map((c) => (
                        <option key={c.label} value={c.label}>
                          {formatOptionChoiceDisplayLabel(
                            c,
                            selectedManualService?.price,
                            true
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Prix total (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={manualForm.totalPrice}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, totalPrice: e.target.value })
                    }
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Durée (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={manualForm.duration}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, duration: e.target.value })
                    }
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Statut initial
                  </label>
                  <select
                    value={manualForm.status}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, status: e.target.value })
                    }
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-base xl:text-sm text-brun"
                  >
                    <option value="CONFIRMED">Confirmé (déjà réglé)</option>
                    <option value="PENDING_PAYMENT">Acompte en attente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Prénom cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.customerFirstName}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        customerFirstName: e.target.value,
                      })
                    }
                    placeholder="Aminata"
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Nom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={manualForm.customerLastName}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        customerLastName: e.target.value,
                      })
                    }
                    placeholder="Diallo"
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualForm.customerPhone}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        customerPhone: e.target.value,
                      })
                    }
                    placeholder="06 12 34 56 78"
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    E-mail (optionnel)
                  </label>
                  <input
                    type="email"
                    value={manualForm.customerEmail}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        customerEmail: e.target.value,
                      })
                    }
                    placeholder="client@exemple.com"
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, date: e.target.value })
                    }
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    required
                    value={manualForm.startTime}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-brun block mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, notes: e.target.value })
                  }
                  placeholder="Rdv pris par Instagram ou téléphone..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun"
                />
              </div>
            </form>

            <div className="px-6 py-4 sm:px-8 border-t border-stone-100 bg-stone-50/90 flex items-center justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200/70 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="admin-manual-booking-form"
                disabled={manualSubmitting}
                className="min-h-[44px] bg-brun hover:bg-brun-dark text-creme px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {manualSubmitting ? "Ajout..." : "Enregistrer dans le planning"}
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
            syncUpdatedBooking(updatedBooking);
            setSelectedDayStr(updatedBooking.date || selectedDayStr);
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
