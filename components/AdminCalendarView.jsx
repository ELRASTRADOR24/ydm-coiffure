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
        setSelectedBooking(data.booking);
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
  const goToToday = () => setCurrentDate(new Date());

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

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brun">
            Planning & Calendrier
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Visualisez vos journées de travail, gérez vos clientes et ajoutez des rendez-vous.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>Ajouter un rendez-vous direct</span>
          </button>
        </div>
      </div>

      {/* Month Navigation & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="font-serif text-2xl font-bold text-brun">
              {monthNamesFr[month]} {year}
            </h2>
            <button
              onClick={goToToday}
              className="text-xs font-semibold px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>

          <div className="flex items-center space-x-1 border border-stone-200 rounded-xl p-1 bg-stone-50">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-stone-600 transition-colors"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-stone-600 transition-colors"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
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
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mer</div>
          <div>Jeu</div>
          <div>Ven</div>
          <div>Sam</div>
          <div>Dim</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => {
            if (cell.blank) {
              return (
                <div
                  key={`blank-${idx}`}
                  className="min-h-24 rounded-2xl bg-stone-50/50 border border-transparent p-2"
                />
              );
            }

            const todayStr = getParisDateString();
            const isToday = cell.dateStr === todayStr;

            return (
              <div
                key={cell.dateStr}
                className={`min-h-24 sm:min-h-28 rounded-2xl border p-2 flex flex-col justify-between transition-colors ${
                  isToday
                    ? "bg-amber-50/40 border-champagne"
                    : "bg-white border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? "bg-brun text-champagne"
                        : "text-stone-700"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  {cell.bookings.length > 0 && (
                    <span className="text-[10px] text-stone-400 font-medium">
                      {cell.bookings.length} rdv
                    </span>
                  )}
                </div>

                {/* Day Bookings Chips */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-18 scrollbar-none">
                  {cell.bookings.map((b) => (
                    <button
                      key={b.id || b._id}
                      onClick={() => setSelectedBooking(b)}
                      className={`w-full text-left px-1.5 py-1 rounded-md text-[10px] font-semibold truncate border transition-all ${getStatusColor(
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

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-300 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-champagne-dark">
                  Réf : {selectedBooking.bookingReference}
                </span>
                <h3 className="font-serif text-2xl font-bold text-brun">
                  {selectedBooking.customer.firstName} {selectedBooking.customer.lastName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Statut :</span>
                <span className="font-bold text-brun">
                  {getBookingStatusLabel(selectedBooking.status)}
                  {selectedBooking.depositDeclared && selectedBooking.status === "PENDING_PAYMENT"
                    ? ` (Déclaré • ${selectedBooking.depositDeclaredMethod || "Direct"})`
                    : ""}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Prestation :</span>
                <span className="font-bold text-brun">{selectedBooking.service.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Date & Horaires :</span>
                <span className="font-bold text-brun">
                  {formatDateFrench(selectedBooking.date)} de {selectedBooking.startTime} à {selectedBooking.endTime}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Durée :</span>
                <span className="font-bold text-brun">
                  {formatDuration(selectedBooking.totalDuration)}
                </span>
              </div>
              {selectedBooking.customer.instagram && (
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Instagram :</span>
                  <span className="font-mono font-bold text-champagne-dark">{selectedBooking.customer.instagram}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Téléphone :</span>
                <span className="font-bold text-brun">{selectedBooking.customer.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">E-mail :</span>
                <span className="font-bold text-brun">
                  {selectedBooking.customer.email || "Non renseigné"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Montant total :</span>
                <span className="font-serif font-bold text-brun text-sm">
                  {formatPrice(selectedBooking.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Acompte :</span>
                <span className="font-bold text-champagne-dark">
                  {formatPrice(selectedBooking.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">Solde restant :</span>
                <span className="font-bold text-brun">
                  {formatPrice(selectedBooking.remainingBalance)}
                </span>
              </div>
            </div>

            {selectedBooking.customer.notes && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                <strong>Notes :</strong> {selectedBooking.customer.notes}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
              {selectedBooking.status === "PENDING_PAYMENT" && (
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() => handleMarkPaidFromCalendar(selectedBooking)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {modalActionLoading
                    ? "Confirmation..."
                    : `Valider acompte reçu (${formatPrice(selectedBooking.depositAmount ?? 10)})`}
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-brun hover:bg-brun-dark text-creme px-6 py-2 rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL BOOKING MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-300 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-serif text-2xl font-bold text-brun">
                Ajouter un rendez-vous manuel
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <form onSubmit={handleCreateManualBooking} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brun block mb-1">
                  Prestation *
                </label>
                <select
                  value={manualForm.serviceId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, serviceId: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun focus:outline-none focus:border-champagne"
                >
                  {services.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name} ({formatPrice(s.price)} - {formatDuration(s.duration)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brun block mb-1">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brun block mb-1">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brun block mb-1">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brun block mb-1">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brun block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, date: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brun block mb-1">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brun block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, notes: e.target.value })
                  }
                  placeholder="Rdv pris par Instagram ou téléphone..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-brun"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="bg-brun hover:bg-brun-dark text-creme px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {manualSubmitting ? "Ajout..." : "Enregistrer dans le planning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
