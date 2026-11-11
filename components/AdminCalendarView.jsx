"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";
import { getParisDateString, getBookingStatusLabel } from "@/lib/adminHelpers";

export default function AdminCalendarView({ initialBookings = [], services = [] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(() => getParisDateString());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual booking form state
  const [manualForm, setManualForm] = useState({
    serviceId: services[0]?.id || services[0]?._id || "",
    customerFirstName: "",
    customerLastName: "",
    customerEmail: "",
    customerPhone: "",
    date: getParisDateString(),
    startTime: "10:00",
    notes: "",
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState("");
  const [modalActionLoading, setModalActionLoading] = useState(false);

  useEffect(() => {
    if (!selectedBooking && !showManualModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedBooking(null);
        setShowManualModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedBooking, showManualModal]);

  const openManualModalForDate = (dateStr) => {
    setManualError("");
    setManualForm((prev) => ({
      ...prev,
      date: dateStr || selectedDayStr || getParisDateString(),
    }));
    setShowManualModal(true);
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
        setBookings((prev) =>
          prev.map((item) => ((item.id || item._id) === bId ? data.booking : item))
        );
        if (selectedBooking && (selectedBooking.id || selectedBooking._id) === bId) {
          setSelectedBooking(data.booking);
        }
        router.refresh();
      }
    } catch (_) {
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
        setBookings((prev) =>
          prev.map((item) => ((item.id || item._id) === bId ? data.booking : item))
        );
        if (selectedBooking && (selectedBooking.id || selectedBooking._id) === bId) {
          setSelectedBooking(data.booking);
        }
        router.refresh();
      }
    } catch (_) {
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleDepositNotReceivedFromCalendar = async (booking) => {
    const bId = booking.id || booking._id;
    setModalActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bId}/deposit-not-received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((item) => ((item.id || item._id) === bId ? data.booking : item))
        );
        if (selectedBooking && (selectedBooking.id || selectedBooking._id) === bId) {
          setSelectedBooking(data.booking);
        }
        router.refresh();
      }
    } catch (_) {
    } finally {
      setModalActionLoading(false);
    }
  };

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  useEffect(() => {
    if (!manualForm.serviceId && services.length > 0) {
      setManualForm((prev) => ({
        ...prev,
        serviceId: services[0].id || services[0]._id || "",
      }));
    }
  }, [services, manualForm.serviceId]);

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
      const res = await fetch("/api/admin/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) => [...prev, data.booking]);
        router.refresh();
        setShowManualModal(false);
        setManualForm({
          serviceId: services[0]?.id || services[0]?._id || "",
          customerFirstName: "",
          customerLastName: "",
          customerEmail: "",
          customerPhone: "",
          date: getParisDateString(),
          startTime: "10:00",
          notes: "",
        });
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
      case "PENDING_PAYMENT":
        return "bg-blue-100 text-blue-900 border-blue-300";
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
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
            Planning & Calendrier
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
            Touchez un jour pour consulter son agenda détaillé, valider un créneau ou ajouter un rendez-vous.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => openManualModalForDate(selectedDayStr)}
            className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
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
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 border-t border-b border-stone-100 py-2.5">
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
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Paiement en attente</span>
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

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDayStr(cell.dateStr)}
                className={`min-h-20 sm:min-h-28 rounded-2xl border p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-brun border-brun bg-champagne-light/30 shadow-xs"
                    : isToday
                    ? "bg-amber-50/40 border-champagne"
                    : "bg-white border-stone-200 hover:border-champagne"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
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
                  {cell.bookings.length > 0 && (
                    <span className="text-[10px] text-stone-500 font-semibold">
                      {cell.bookings.length} rdv
                    </span>
                  )}
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
            className="inline-flex items-center justify-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
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
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs font-semibold text-brun cursor-pointer"
                    >
                      Voir détails
                    </button>
                    {b.status === "PENDING_APPROVAL" && (
                      <button
                        type="button"
                        disabled={modalActionLoading}
                        onClick={() => handleApproveFromCalendar(b)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Valider demande
                      </button>
                    )}
                    {b.status === "PENDING_PAYMENT" && (
                      <>
                        <button
                          type="button"
                          disabled={modalActionLoading}
                          onClick={() => handleMarkPaidFromCalendar(b)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          Valider acompte ({formatPrice(b.depositAmount ?? 10)})
                        </button>
                        {b.depositDeclared && (
                          <button
                            type="button"
                            disabled={modalActionLoading}
                            onClick={() => handleDepositNotReceivedFromCalendar(b)}
                            className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            Acompte non reçu
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs sm:text-sm text-stone-500 font-light">
            Aucun rendez-vous prévu le {formatDateFrench(selectedDayStr)}.
          </div>
        )}
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
                <div className="flex justify-between gap-2 py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Date & Horaires :</span>
                  <span className="font-bold text-brun text-right">
                    {formatDateFrench(selectedBooking.date)} de {selectedBooking.startTime} à {selectedBooking.endTime}
                  </span>
                </div>
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

              {selectedBooking.customer.notes && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-600">
                  <strong>Notes :</strong> {selectedBooking.customer.notes}
                </div>
              )}
            </div>

            <div className="px-6 py-4 sm:px-8 border-t border-stone-100 bg-stone-50/90 flex flex-wrap items-center justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {selectedBooking.status === "PENDING_APPROVAL" && (
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() => handleApproveFromCalendar(selectedBooking)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {modalActionLoading ? "Validation..." : "Valider demande"}
                </button>
              )}
              {selectedBooking.status === "PENDING_PAYMENT" && (
                <>
                  {selectedBooking.depositDeclared && (
                    <button
                      type="button"
                      disabled={modalActionLoading}
                      onClick={() =>
                        handleDepositNotReceivedFromCalendar(selectedBooking)
                      }
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {modalActionLoading ? "Envoi..." : "Acompte non reçu"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={modalActionLoading}
                    onClick={() => handleMarkPaidFromCalendar(selectedBooking)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {modalActionLoading
                      ? "Confirmation..."
                      : `Valider acompte reçu (${formatPrice(selectedBooking.depositAmount ?? 10)})`}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="bg-brun hover:bg-brun-dark text-creme px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Fermer
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
                  onChange={(e) =>
                    setManualForm({ ...manualForm, serviceId: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:border-champagne"
                >
                  {services.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name} ({formatPrice(s.price)} - {formatDuration(s.duration)})
                    </option>
                  ))}
                </select>
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
                />
              </div>
            </form>

            <div className="px-6 py-4 sm:px-8 border-t border-stone-100 bg-stone-50/90 flex items-center justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200/70 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="admin-manual-booking-form"
                disabled={manualSubmitting}
                className="bg-brun hover:bg-brun-dark text-creme px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {manualSubmitting ? "Ajout..." : "Enregistrer dans le planning"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
