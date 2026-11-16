"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Lock,
  Unlock,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getParisDateString, isValidDateString } from "@/lib/adminHelpers";
import { getCalendarDayUnavailabilitySummary } from "@/lib/slotMasking";

const MONTH_NAMES_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function MonthlyScheduleCalendar({
  availabilities = [],
  unavailabilities = [],
  bookings = [],
  onUnavailabilitiesChange,
  onToast,
  selectedDayStr,
  onSelectDay,
}) {
  const todayParis = getParisDateString();
  const [initialYear, initialMonth] = todayParis.split("-").map(Number);

  const [currentYear, setCurrentYear] = useState(initialYear || 2026);
  const [currentMonth, setCurrentMonth] = useState((initialMonth || 1) - 1); // 0-indexed
  const [clickMode, setClickMode] = useState("toggle"); // "toggle" (1-clic) ou "select" (agenda)
  const [loadingDate, setLoadingDate] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const [y, m] = todayParis.split("-").map(Number);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
    if (onSelectDay) onSelectDay(todayParis);
  };

  // Build grid days
  const firstDayOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
  const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
  // Monday = 0, Sunday = 6
  const firstDayWeekday = (firstDayOfMonth.getUTCDay() + 6) % 7;

  const prevMonthDaysCount = new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate();

  // Padding days from prev month
  const paddingDays = [];
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const dNum = prevMonthDaysCount - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const isoDate = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
    paddingDays.push({ dayNumber: dNum, isoDate, isCurrentMonth: false });
  }

  // Days in current month
  const monthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const isoDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const daySummary = getCalendarDayUnavailabilitySummary({
      dateStr: isoDate,
      availabilities,
      unavailabilities,
    });

    const isClosed = daySummary.isAllDayBlocked || daySummary.isWeeklyClosed;
    const isPast = isoDate < todayParis;
    const dayBookings = bookings.filter(
      (b) => b.date === isoDate && b.status !== "CANCELLED" && b.status !== "REFUSED"
    );

    monthDays.push({
      dayNumber: d,
      isoDate,
      isCurrentMonth: true,
      isPast,
      isToday: isoDate === todayParis,
      isSelected: isoDate === selectedDayStr,
      isClosed,
      daySummary,
      bookingsCount: dayBookings.length,
      dayBookings,
    });
  }

  // Toggle single date (1 clic)
  const handleToggleDay = async (isoDate, isCurrentlyClosed) => {
    if (loadingDate || batchLoading) return;
    setLoadingDate(isoDate);

    try {
      if (isCurrentlyClosed) {
        // Open the day
        const res = await fetch("/api/admin/unavailability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: isoDate, isAllDay: false, ranges: [] }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (onUnavailabilitiesChange) onUnavailabilitiesChange(data.unavailabilities);
          if (onToast) onToast(`Journée du ${isoDate} réouverte aux réservations.`);
        } else {
          if (onToast) onToast(data.error || "Erreur lors de la réouverture.");
        }
      } else {
        // Close the day
        const res = await fetch("/api/admin/unavailability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: isoDate,
            isAllDay: true,
            reason: "Journée fermée",
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (onUnavailabilitiesChange) onUnavailabilitiesChange(data.unavailabilities);
          if (onToast) onToast(`Journée du ${isoDate} fermée aux réservations.`);
        } else {
          if (onToast) onToast(data.error || "Erreur lors de la fermeture.");
        }
      }
    } catch (err) {
      if (onToast) onToast("Erreur réseau lors de la mise à jour.");
    } finally {
      setLoadingDate(null);
    }
  };

  // Close entire month
  const handleCloseEntireMonth = async () => {
    if (batchLoading) return;
    const confirmClose = window.confirm(
      `Confirmez-vous la fermeture complète de tous les jours de ${MONTH_NAMES_FR[currentMonth]} ${currentYear} ?`
    );
    if (!confirmClose) return;

    setBatchLoading(true);
    try {
      const datesToBlock = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        datesToBlock.push(iso);
      }

      const res = await fetch("/api/admin/unavailability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: datesToBlock,
          isAllDay: true,
          reason: `Fermeture mensuelle (${MONTH_NAMES_FR[currentMonth]} ${currentYear})`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onUnavailabilitiesChange) {
          // Re-fetch fresh unavailabilities
          const getRes = await fetch("/api/admin/unavailability");
          const freshData = await getRes.json();
          if (freshData.success) onUnavailabilitiesChange(freshData.unavailabilities);
        }
        if (onToast) onToast(`Tout le mois de ${MONTH_NAMES_FR[currentMonth]} a été fermé.`);
      } else {
        if (onToast) onToast(data.error || "Impossible de fermer le mois.");
      }
    } catch (err) {
      if (onToast) onToast("Erreur réseau lors de la fermeture du mois.");
    } finally {
      setBatchLoading(false);
    }
  };

  // Reopen entire month
  const handleReopenEntireMonth = async () => {
    if (batchLoading) return;
    const confirmOpen = window.confirm(
      `Confirmez-vous la réouverture de tous les jours de ${MONTH_NAMES_FR[currentMonth]} ${currentYear} ?`
    );
    if (!confirmOpen) return;

    setBatchLoading(true);
    try {
      const datesToOpen = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        datesToOpen.push(iso);
      }

      const res = await fetch("/api/admin/unavailability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: datesToOpen }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onUnavailabilitiesChange) onUnavailabilitiesChange(data.unavailabilities);
        if (onToast) onToast(`Tout le mois de ${MONTH_NAMES_FR[currentMonth]} a été réouvert.`);
      } else {
        if (onToast) onToast(data.error || "Impossible de réouvrir le mois.");
      }
    } catch (err) {
      if (onToast) onToast("Erreur réseau lors de la réouverture du mois.");
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-5">
      {/* HEADER: TITLE, MONTH / YEAR NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-champagne-light text-brun flex items-center justify-center shrink-0 border border-champagne/40">
            <CalendarIcon className="w-5 h-5 text-brun" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
              {MONTH_NAMES_FR[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-stone-500">
              Gestion visuelle rapide des ouvertures &amp; fermetures du studio.
            </p>
          </div>
        </div>

        {/* SELECTEURS DIRECTS MOIS / ANNEE & BOUTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="min-h-[40px] px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Aujourd&apos;hui
          </button>

          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="min-h-[40px] border border-stone-200 bg-stone-50 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-brun cursor-pointer hover:border-champagne"
          >
            {MONTH_NAMES_FR.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="min-h-[40px] border border-stone-200 bg-stone-50 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-brun cursor-pointer hover:border-champagne"
          >
            {[2026, 2027, 2028, 2029].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-0.5">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 rounded-lg hover:bg-white text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="w-9 h-9 rounded-lg hover:bg-white text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ACTION BAR: MODE 1-CLIC & ACTIONS GLOBALES DU MOIS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/80 p-3 sm:p-4 rounded-2xl border border-stone-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-700">Mode d&apos;action :</span>
          <div className="inline-flex rounded-xl border border-stone-200 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setClickMode("toggle")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                clickMode === "toggle"
                  ? "bg-brun text-creme shadow-2xs"
                  : "text-stone-600 hover:text-brun"
              }`}
            >
              ⚡ 1-Clic : Fermer / Réouvrir
            </button>
            <button
              type="button"
              onClick={() => setClickMode("select")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                clickMode === "select"
                  ? "bg-brun text-creme shadow-2xs"
                  : "text-stone-600 hover:text-brun"
              }`}
            >
              📋 Sélectionner / Voir agenda
            </button>
          </div>
        </div>

        {/* BATCH MONTH ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={batchLoading}
            onClick={handleCloseEntireMonth}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-900 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {batchLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-red-700" />
            )}
            <span>Fermer tout le mois</span>
          </button>

          <button
            type="button"
            disabled={batchLoading}
            onClick={handleReopenEntireMonth}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {batchLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>Réouvrir tout le mois</span>
          </button>
        </div>
      </div>

      {/* WEEKDAY HEADER */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider">
        {WEEKDAY_NAMES.map((name) => (
          <div key={name} className="py-1">
            {name}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* PADDING DAYS */}
        {paddingDays.map((p, idx) => (
          <div
            key={`pad-${idx}`}
            className="min-h-[70px] sm:min-h-[85px] rounded-2xl bg-stone-50/40 border border-transparent p-2 text-stone-300 text-xs font-medium"
          >
            {p.dayNumber}
          </div>
        ))}

        {/* MONTH DAYS */}
        {monthDays.map((d) => {
          const isTogglingThis = loadingDate === d.isoDate;

          const handleClickCell = () => {
            if (clickMode === "toggle") {
              handleToggleDay(d.isoDate, d.isClosed);
            }
            if (onSelectDay) {
              onSelectDay(d.isoDate);
            }
          };

          return (
            <div
              key={d.isoDate}
              onClick={handleClickCell}
              title={
                d.isClosed
                  ? `${d.isoDate} : FERMÉ (Touchez pour réouvrir)`
                  : `${d.isoDate} : OUVERT (Touchez pour fermer)`
              }
              className={`group relative min-h-[75px] sm:min-h-[92px] rounded-2xl border p-2 flex flex-col justify-between transition-all cursor-pointer select-none ${
                d.isSelected
                  ? "ring-2 ring-brun border-brun bg-champagne-light/40 shadow-xs"
                  : d.isClosed
                  ? "bg-red-50/75 border-red-200 text-red-950 hover:bg-red-100/90"
                  : d.isToday
                  ? "bg-amber-50/50 border-champagne text-brun hover:border-champagne-dark"
                  : "bg-white border-stone-200 text-brun hover:border-champagne hover:bg-stone-50/60"
              }`}
            >
              {/* TOP ROW: DAY NUMBER + STATUS ICON / QUICK TOGGLE */}
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-xs sm:text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    d.isToday
                      ? "bg-brun text-champagne"
                      : d.isSelected
                      ? "bg-champagne text-brun-dark"
                      : "text-stone-700"
                  }`}
                >
                  {d.dayNumber}
                </span>

                {/* QUICK 1-CLIC TOGGLE ICON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleDay(d.isoDate, d.isClosed);
                  }}
                  title={d.isClosed ? "Réouvrir cette journée" : "Fermer cette journée"}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    d.isClosed
                      ? "bg-red-200 text-red-900 hover:bg-red-300"
                      : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  }`}
                >
                  {isTogglingThis ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : d.isClosed ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </button>
              </div>

              {/* BOTTOM ROW: STATUS BADGE & BOOKINGS COUNT */}
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span
                  className={`font-semibold uppercase tracking-wider truncate ${
                    d.isClosed ? "text-red-800" : "text-stone-500"
                  }`}
                >
                  {d.isClosed ? "Fermé" : "Ouvert"}
                </span>

                {d.bookingsCount > 0 && (
                  <span className="rounded-full bg-brun text-creme px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    {d.bookingsCount} RDV
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER LEGEND */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Journée ouverte</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-red-700" />
          <span>Journée fermée</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="rounded-full bg-brun text-creme px-1.5 py-0.2 text-[9px] font-bold">
            1 RDV
          </span>
          <span>Réservations enregistrées</span>
        </div>
        <div className="ml-auto text-[11px] text-stone-400">
          💡 En mode 1-clic, un simple tap sur une case bascule son état immédiatement.
        </div>
      </div>
    </div>
  );
}