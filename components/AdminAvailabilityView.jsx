"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Save,
  Trash2,
  CheckCircle2,
  Loader2,
  CalendarOff,
  EyeOff,
} from "lucide-react";
import { formatDateFrench } from "@/lib/utils";
import {
  getParisDateString,
  isValidDateString,
  isValidTimeString,
  expandDateRangeInclusive,
} from "@/lib/adminHelpers";
import { timeToMinutes } from "@/lib/availabilityEngine";
import { AdminLocationIllustration } from "./admin/AdminVisualGuide";
import QuickSlotMasker from "./admin/QuickSlotMasker";

function addDaysToDateStr(baseDateStr, offsetDays) {
  if (!isValidDateString(baseDateStr)) return getParisDateString();
  const [y, m, d] = baseDateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return dt.toISOString().slice(0, 10);
}

export default function AdminAvailabilityView({
  initialAvailabilities = [],
  initialUnavailabilities = [],
  initialBookings = [],
}) {
  const router = useRouter();
  const [availabilities, setAvailabilities] = useState(initialAvailabilities);
  const [unavailabilities, setUnavailabilities] = useState(
    initialUnavailabilities
  );
  const [bookings, setBookings] = useState(initialBookings || []);
  const [toastMessage, setToastMessage] = useState("");
  const [savingDay, setSavingDay] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [dirtyDays, setDirtyDays] = useState(() => new Set());

  useEffect(() => {
    setAvailabilities(initialAvailabilities);
    setDirtyDays(new Set());
  }, [initialAvailabilities]);

  useEffect(() => {
    setUnavailabilities(initialUnavailabilities);
  }, [initialUnavailabilities]);

  useEffect(() => {
    setBookings(initialBookings || []);
  }, [initialBookings]);

  const todayStr = getParisDateString();
  const tomorrowStr = addDaysToDateStr(todayStr, 1);
  const dayAfterStr = addDaysToDateStr(todayStr, 2);

  // Onglet simplifié : "day" (cocher en 1 tap) ou "range" (congés multi-jours)
  const [maskTab, setMaskTab] = useState("day");
  const [selectedMaskDate, setSelectedMaskDate] = useState(todayStr);
  const [vacationRange, setVacationRange] = useState({
    startDate: todayStr,
    endDate: dayAfterStr,
    reason: "Congé / Repos exceptionnel",
  });
  const [addingRange, setAddingRange] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const markDayDirty = (dayOfWeek) => {
    setDirtyDays((prev) => {
      const next = new Set(prev);
      next.add(dayOfWeek);
      return next;
    });
  };

  const handleDayChange = (dayOfWeek, field, value) => {
    setAvailabilities((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );
    markDayDirty(dayOfWeek);
  };

  const handleToggleLunchBreak = (dayOfWeek, enabled) => {
    setAvailabilities((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        return {
          ...day,
          breaks: enabled
            ? [{ start: "12:30", end: "13:30", label: "Pause déjeuner" }]
            : [],
        };
      })
    );
    markDayDirty(dayOfWeek);
  };

  const handleLunchBreakTime = (dayOfWeek, field, value) => {
    setAvailabilities((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        const current = Array.isArray(day.breaks) && day.breaks.length > 0
          ? day.breaks[0]
          : { start: "12:30", end: "13:30", label: "Pause déjeuner" };
        return {
          ...day,
          breaks: [{ ...current, [field]: value, label: current.label || "Pause déjeuner" }],
        };
      })
    );
    markDayDirty(dayOfWeek);
  };

  const validateDaySchedule = (day) => {
    if (!day.isOpen) return null;
    if (!isValidTimeString(day.startTime) || !isValidTimeString(day.endTime)) {
      return `${day.dayName} : veuillez renseigner des heures d'ouverture et de fermeture valides.`;
    }
    if (timeToMinutes(day.startTime) >= timeToMinutes(day.endTime)) {
      return `${day.dayName} : l'heure de fermeture doit être postérieure à l'ouverture.`;
    }
    const lunch = Array.isArray(day.breaks) && day.breaks.length > 0 ? day.breaks[0] : null;
    if (lunch) {
      if (!isValidTimeString(lunch.start) || !isValidTimeString(lunch.end)) {
        return `${day.dayName} : veuillez saisir des horaires de pause valides.`;
      }
      if (timeToMinutes(lunch.start) >= timeToMinutes(lunch.end)) {
        return `${day.dayName} : l'heure de fin de pause doit suivre le début.`;
      }
      if (
        timeToMinutes(lunch.start) < timeToMinutes(day.startTime) ||
        timeToMinutes(lunch.end) > timeToMinutes(day.endTime)
      ) {
        return `${day.dayName} : la pause déjeuner doit rester comprise dans vos horaires d'ouverture.`;
      }
    }
    return null;
  };

  const handleSaveDay = async (day) => {
    const err = validateDaySchedule(day);
    if (err) {
      showToast(err);
      return;
    }

    setSavingDay(day.dayOfWeek);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(day),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.availability) {
          setAvailabilities((prev) =>
            prev.map((d) =>
              d.dayOfWeek === day.dayOfWeek ? data.availability : d
            )
          );
        }
        setDirtyDays((prev) => {
          const next = new Set(prev);
          next.delete(day.dayOfWeek);
          return next;
        });
        router.refresh();
        showToast(`Horaires du ${day.dayName} sauvegardés !`);
      } else {
        showToast(data.error || "Impossible de sauvegarder les horaires.");
      }
    } catch (e) {
      showToast("Erreur lors de la sauvegarde des horaires.");
    } finally {
      setSavingDay(null);
    }
  };

  const handleSaveAllDays = async () => {
    const daysToSave =
      dirtyDays.size > 0
        ? availabilities.filter((d) => dirtyDays.has(d.dayOfWeek))
        : availabilities;

    for (const day of daysToSave) {
      const err = validateDaySchedule(day);
      if (err) {
        showToast(err);
        return;
      }
    }

    setSavingAll(true);
    try {
      const results = await Promise.all(
        daysToSave.map(async (day) => {
          const res = await fetch("/api/admin/availability", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(day),
          });
          const data = await res.json();
          return { ok: res.ok && data.success, availability: data.availability, error: data.error };
        })
      );

      const failed = results.find((r) => !r.ok);
      if (failed) {
        showToast(failed.error || "Une erreur est survenue lors de l'enregistrement.");
        return;
      }

      const updatedByDay = new Map(
        results
          .filter((r) => r.availability)
          .map((r) => [r.availability.dayOfWeek, r.availability])
      );
      setAvailabilities((prev) =>
        prev.map((d) => updatedByDay.get(d.dayOfWeek) || d)
      );
      setDirtyDays(new Set());
      router.refresh();
      showToast("Tous vos horaires hebdomadaires ont été enregistrés !");
    } catch (_) {
      showToast("Erreur réseau lors de l'enregistrement des horaires.");
    } finally {
      setSavingAll(false);
    }
  };

  const handleAddVacationRange = async (e) => {
    e.preventDefault();
    const check = expandDateRangeInclusive(
      vacationRange.startDate,
      vacationRange.endDate
    );
    if (check.error) {
      showToast(check.error);
      return;
    }

    setAddingRange(true);
    try {
      const res = await fetch("/api/admin/unavailability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: vacationRange.startDate,
          endDate: vacationRange.endDate,
          isAllDay: true,
          reason: vacationRange.reason || "Congé / Vacances",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const created =
          data.unavailabilities ||
          (data.unavailability ? [data.unavailability] : []);
        setUnavailabilities((prev) => [...prev, ...created]);
        router.refresh();
        showToast(`${created.length} jour(s) bloqué(s) avec succès !`);
      } else {
        showToast(data.error || "Impossible de bloquer cette période.");
      }
    } catch (e) {
      showToast("Erreur lors de l'enregistrement des congés.");
    } finally {
      setAddingRange(false);
    }
  };

  const handleDeleteUnavailability = async (id) => {
    try {
      const res = await fetch(`/api/admin/unavailability/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUnavailabilities((prev) =>
          prev.filter((u) => (u.id || u._id) !== id)
        );
        router.refresh();
        showToast("Créneau rouvert avec succès !");
      } else {
        showToast(data.error || "Impossible de rouvrir ce créneau.");
      }
    } catch (e) {
      showToast("Erreur réseau lors de la réouverture.");
    }
  };

  const sortedUnavailabilities = [...unavailabilities].sort((a, b) => {
    const dCmp = String(a?.date || "").localeCompare(String(b?.date || ""));
    if (dCmp !== 0) return dCmp;
    return String(a?.startTime || "").localeCompare(String(b?.startTime || ""));
  });

  // Sort: Monday (1) to Sunday (0)
  const sortedDays = [...availabilities].sort((a, b) => {
    const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return orderA - orderB;
  });

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="fixed top-20 lg:top-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs sm:text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brun">
            Horaires &amp; Pauses
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Masquez des créneaux en 1 clic, programmez vos congés ou ajustez vos horaires habituels.
          </p>
        </div>
        <AdminLocationIllustration zone="availability" compact />
      </div>

      {/* SECTION 1 (PRIORITAIRE) : MASQUAGE ULTRA-SIMPLE EN 1 CLIC */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-brun flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-champagne-dark shrink-0" />
              <span>Masquer un créneau ou un jour</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Cochez directement les heures à rendre indisponibles aux clientes. Sauvegarde immédiate.
            </p>
          </div>

          {/* 2 modes seulement : Cocher 1 jour vs Congés multi-jours */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMaskTab("day")}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                maskTab === "day"
                  ? "bg-brun text-creme shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Cocher des créneaux (1 jour)
            </button>
            <button
              type="button"
              onClick={() => setMaskTab("range")}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                maskTab === "range"
                  ? "bg-brun text-creme shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Bloquer des vacances
            </button>
          </div>
        </div>

        {maskTab === "day" ? (
          <div className="space-y-4">
            {/* Sélecteur rapide de jour */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Aujourd'hui", value: todayStr },
                { label: "Demain", value: tomorrowStr },
                { label: "Après-demain", value: dayAfterStr },
              ].map((shortcut) => (
                <button
                  key={shortcut.value}
                  type="button"
                  onClick={() => setSelectedMaskDate(shortcut.value)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                    selectedMaskDate === shortcut.value
                      ? "bg-champagne border-champagne-dark text-brun-dark shadow-2xs"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:border-champagne"
                  }`}
                >
                  {shortcut.label}
                </button>
              ))}

              <div className="flex items-center gap-2">
                <label htmlFor="quick-mask-date" className="text-xs font-semibold text-stone-500">
                  Autre date :
                </label>
                <input
                  id="quick-mask-date"
                  type="date"
                  value={selectedMaskDate}
                  onChange={(e) => {
                    if (isValidDateString(e.target.value)) {
                      setSelectedMaskDate(e.target.value);
                    }
                  }}
                  className="min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm font-medium text-brun"
                />
              </div>
            </div>

            <QuickSlotMasker
              dateStr={selectedMaskDate}
              availabilities={availabilities}
              unavailabilities={unavailabilities}
              bookings={bookings}
              onUnavailabilitiesChange={setUnavailabilities}
              onToast={showToast}
              showAvailabilityLink={false}
            />
          </div>
        ) : (
          <form
            onSubmit={handleAddVacationRange}
            className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="font-semibold text-brun block mb-1.5">
                  Date de début *
                </label>
                <input
                  type="date"
                  required
                  value={vacationRange.startDate}
                  onChange={(e) =>
                    setVacationRange({ ...vacationRange, startDate: e.target.value })
                  }
                  className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm text-brun"
                />
              </div>
              <div>
                <label className="font-semibold text-brun block mb-1.5">
                  Date de fin *
                </label>
                <input
                  type="date"
                  required
                  value={vacationRange.endDate}
                  onChange={(e) =>
                    setVacationRange({ ...vacationRange, endDate: e.target.value })
                  }
                  className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm text-brun"
                />
              </div>
              <div>
                <label className="font-semibold text-brun block mb-1.5">
                  Motif (optionnel)
                </label>
                <input
                  type="text"
                  value={vacationRange.reason}
                  onChange={(e) =>
                    setVacationRange({ ...vacationRange, reason: e.target.value })
                  }
                  placeholder="Ex : Vacances, Formation..."
                  className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm text-brun"
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={addingRange}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CalendarOff className="w-4 h-4 shrink-0" />
                <span>
                  {addingRange ? "Enregistrement..." : "Bloquer toute cette période"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Liste claire des fermetures et créneaux masqués enregistrés (déblocage 1 clic sans alerte) */}
        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-brun">
              Jours et créneaux actuellement masqués ({sortedUnavailabilities.length})
            </h3>
          </div>

          {sortedUnavailabilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {sortedUnavailabilities.map((unav) => {
                const id = unav.id || unav._id;
                const niceDate = formatDateFrench(unav.date) || unav.date;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isValidDateString(unav.date)) {
                          setSelectedMaskDate(unav.date);
                          setMaskTab("day");
                        }
                      }}
                      className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer hover:opacity-80 flex-1"
                      title="Modifier les créneaux de ce jour"
                    >
                      <Calendar className="w-4 h-4 text-champagne-dark shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-brun capitalize truncate">
                          {niceDate}
                        </div>
                        <div className="text-xs text-stone-600 truncate">
                          {unav.isAllDay
                            ? "Journée fermée"
                            : `${unav.startTime} – ${unav.endTime}`}
                          {unav.reason ? ` • ${unav.reason}` : ""}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnavailability(id)}
                      aria-label={`Rouvrir ${niceDate}`}
                      title="Rouvrir en 1 clic"
                      className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-stone-500 font-light py-2">
              Aucun créneau ni jour fermé pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* WEEKLY SCHEDULE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-brun">
              Semaine type d&apos;ouverture
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Cochez « Pause déjeuner » si vous bloquez un créneau repas dans la journée.
            </p>
          </div>
          <button
            type="button"
            disabled={savingAll}
            onClick={handleSaveAllDays}
            className={`min-h-[44px] inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
              dirtyDays.size > 0
                ? "bg-champagne-dark hover:bg-brun text-white ring-2 ring-champagne/40"
                : "bg-brun hover:bg-brun-dark text-creme"
            }`}
          >
            {savingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-champagne" />
            )}
            <span>
              {savingAll
                ? "Enregistrement..."
                : dirtyDays.size > 0
                ? `Tout enregistrer (${dirtyDays.size})`
                : "Tout enregistrer"}
            </span>
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {sortedDays.map((day) => {
            const isSaving = savingDay === day.dayOfWeek;
            const isDirty = dirtyDays.has(day.dayOfWeek);
            const lunchBreak =
              Array.isArray(day.breaks) && day.breaks.length > 0
                ? day.breaks[0]
                : null;
            return (
              <div
                key={day.dayOfWeek}
                className="py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 text-xs"
              >
                {/* Day name & Open toggle */}
                <div className="w-full sm:w-44 flex items-center gap-3 shrink-0">
                  <label className="min-h-[44px] inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={day.isOpen}
                      onChange={(e) =>
                        handleDayChange(day.dayOfWeek, "isOpen", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                  <span
                    className={`font-serif font-bold text-base xl:text-sm ${
                      day.isOpen ? "text-brun" : "text-stone-400 line-through"
                    }`}
                  >
                    {day.dayName}
                  </span>
                </div>

                {/* Hours inputs (if open) */}
                {day.isOpen ? (
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-stone-500 font-medium">Heures :</span>
                      <input
                        type="time"
                        value={day.startTime ?? ""}
                        onChange={(e) =>
                          handleDayChange(day.dayOfWeek, "startTime", e.target.value)
                        }
                        className="min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm font-medium text-brun"
                      />
                      <span>à</span>
                      <input
                        type="time"
                        value={day.endTime ?? ""}
                        onChange={(e) =>
                          handleDayChange(day.dayOfWeek, "endTime", e.target.value)
                        }
                        className="min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm font-medium text-brun"
                      />
                    </div>

                    {/* Pause déjeuner */}
                    <div className="flex flex-wrap items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                      <label className="min-h-[44px] inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-brun">
                        <input
                          type="checkbox"
                          checked={Boolean(lunchBreak)}
                          onChange={(e) =>
                            handleToggleLunchBreak(day.dayOfWeek, e.target.checked)
                          }
                          className="w-4 h-4 accent-brun rounded border-stone-300"
                        />
                        <span>Pause déjeuner</span>
                      </label>
                      {lunchBreak && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            aria-label={`Début pause ${day.dayName}`}
                            value={lunchBreak.start || "12:30"}
                            onChange={(e) =>
                              handleLunchBreakTime(day.dayOfWeek, "start", e.target.value)
                            }
                            className="min-h-[44px] bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-base xl:text-sm font-medium text-brun"
                          />
                          <span>–</span>
                          <input
                            type="time"
                            aria-label={`Fin pause ${day.dayName}`}
                            value={lunchBreak.end || "13:30"}
                            onChange={(e) =>
                              handleLunchBreakTime(day.dayOfWeek, "end", e.target.value)
                            }
                            className="min-h-[44px] bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-base xl:text-sm font-medium text-brun"
                          />
                        </div>
                      )}
                    </div>

                    {/* Battement */}
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-medium">Battement :</span>
                      <select
                        value={day.bufferTimeMinutes ?? 15}
                        onChange={(e) =>
                          handleDayChange(
                            day.dayOfWeek,
                            "bufferTimeMinutes",
                            Number(e.target.value)
                          )
                        }
                        className="min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm text-stone-700"
                      >
                        <option value={0}>0 min</option>
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-stone-400 italic py-2">
                    Journée de repos (aucun créneau réservable)
                  </div>
                )}

                {/* Save button per day */}
                <div>
                  <button
                    type="button"
                    disabled={isSaving || savingAll}
                    onClick={() => handleSaveDay(day)}
                    className={`w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                      isDirty
                        ? "bg-champagne hover:bg-champagne-dark text-brun-dark"
                        : "bg-stone-100 hover:bg-brun hover:text-creme text-stone-700"
                    }`}
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span>{isSaving ? "Sauvegarde..." : "Enregistrer"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
