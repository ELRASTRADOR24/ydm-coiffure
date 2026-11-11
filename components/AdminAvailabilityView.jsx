"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getParisDateString,
  isValidTimeString,
  expandDateRangeInclusive,
} from "@/lib/adminHelpers";
import { timeToMinutes } from "@/lib/availabilityEngine";
import { AdminLocationIllustration } from "./admin/AdminVisualGuide";

export default function AdminAvailabilityView({
  initialAvailabilities = [],
  initialUnavailabilities = [],
}) {
  const router = useRouter();
  const [availabilities, setAvailabilities] = useState(initialAvailabilities);
  const [unavailabilities, setUnavailabilities] = useState(
    initialUnavailabilities
  );
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

  // Mode de blocage : "single" (jour unique), "range" (plusieurs jours), "hours" (plage horaire)
  const [unavMode, setUnavMode] = useState("single");
  const [newUnav, setNewUnav] = useState({
    date: getParisDateString(),
    startDate: getParisDateString(),
    endDate: getParisDateString(new Date(Date.now() + 86400000 * 2)),
    isAllDay: true,
    startTime: "12:00",
    endTime: "18:00",
    reason: "Congé / Repos exceptionnel",
  });
  const [addingUnav, setAddingUnav] = useState(false);

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

  const handleAddUnavailability = async (e) => {
    e.preventDefault();
    if (unavMode === "range") {
      const check = expandDateRangeInclusive(newUnav.startDate, newUnav.endDate);
      if (check.error) {
        showToast(check.error);
        return;
      }
    } else if (unavMode === "hours") {
      if (!isValidTimeString(newUnav.startTime) || !isValidTimeString(newUnav.endTime)) {
        showToast("Veuillez renseigner une plage horaire valide.");
        return;
      }
      if (timeToMinutes(newUnav.startTime) >= timeToMinutes(newUnav.endTime)) {
        showToast("L'heure de fin doit être postérieure à l'heure de début.");
        return;
      }
    }

    setAddingUnav(true);
    try {
      let payload = {
        reason: newUnav.reason || "Indisponibilité exceptionnelle",
      };

      if (unavMode === "range") {
        payload.startDate = newUnav.startDate;
        payload.endDate = newUnav.endDate;
        payload.isAllDay = true;
      } else if (unavMode === "hours") {
        payload.date = newUnav.date;
        payload.isAllDay = false;
        payload.startTime = newUnav.startTime;
        payload.endTime = newUnav.endTime;
      } else {
        // "single"
        payload.date = newUnav.date;
        payload.isAllDay = true;
      }

      const res = await fetch("/api/admin/unavailability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const created =
          data.unavailabilities ||
          (data.unavailability ? [data.unavailability] : []);
        setUnavailabilities((prev) => [...prev, ...created]);
        router.refresh();
        showToast(
          unavMode === "range"
            ? `${created.length} jours bloqués avec succès !`
            : "Indisponibilité ajoutée et calendrier mis à jour !"
        );
        setNewUnav((prev) => ({
          ...prev,
          reason: "Congé / Repos exceptionnel",
        }));
      } else {
        showToast(data.error || "Impossible d'ajouter cette indisponibilité.");
      }
    } catch (e) {
      showToast("Une erreur est survenue lors de l'enregistrement de l'indisponibilité.");
    } finally {
      setAddingUnav(false);
    }
  };

  const handleDeleteUnavailability = async (id) => {
    if (!confirm("Voulez-vous supprimer cette fermeture exceptionnelle ?")) return;
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
        showToast("Indisponibilité retirée avec succès.");
      } else {
        showToast(data.error || "Impossible de supprimer cette fermeture pour le moment.");
      }
    } catch (e) {
      showToast("Impossible de retirer cette fermeture.");
    }
  };

  // Sort: Monday (1) to Sunday (0)
  const sortedDays = [...availabilities].sort((a, b) => {
    const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return orderA - orderB;
  });

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brun text-creme px-5 py-3 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs font-medium animate-fadeIn">
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
            Réglez vos horaires d&apos;ouverture, votre pause déjeuner et vos jours de congé.
          </p>
        </div>
        <AdminLocationIllustration zone="availability" compact />
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
                    className={`font-serif font-bold text-base lg:text-sm ${
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
                        className="min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm font-medium text-brun"
                      />
                      <span>à</span>
                      <input
                        type="time"
                        value={day.endTime ?? ""}
                        onChange={(e) =>
                          handleDayChange(day.dayOfWeek, "endTime", e.target.value)
                        }
                        className="min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm font-medium text-brun"
                      />
                    </div>

                    {/* Pause déjeuner */}
                    <div className="flex flex-wrap items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                      <label className="min-h-[36px] inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-brun">
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
                            className="min-h-[36px] bg-white border border-stone-200 rounded-lg px-2 py-1 text-sm font-medium text-brun"
                          />
                          <span>–</span>
                          <input
                            type="time"
                            aria-label={`Fin pause ${day.dayName}`}
                            value={lunchBreak.end || "13:30"}
                            onChange={(e) =>
                              handleLunchBreakTime(day.dayOfWeek, "end", e.target.value)
                            }
                            className="min-h-[36px] bg-white border border-stone-200 rounded-lg px-2 py-1 text-sm font-medium text-brun"
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
                        className="min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm text-stone-700"
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

      {/* BLACKOUT DATES & HOLIDAYS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
        <h2 className="font-serif text-xl font-bold text-brun">
          Indisponibilités Ponctuelles & Congés
        </h2>
        <p className="text-xs text-stone-500 font-light">
          Bloquez une date précise (ou une plage horaire) pour vos congés ou imprévus. Le calendrier public fermera instantanément ces créneaux.
        </p>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setUnavMode("single")}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              unavMode === "single"
                ? "bg-brun text-creme shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Bloquer 1 jour
          </button>
          <button
            type="button"
            onClick={() => setUnavMode("range")}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              unavMode === "range"
                ? "bg-brun text-creme shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Bloquer plusieurs jours (Période / Congés)
          </button>
          <button
            type="button"
            onClick={() => setUnavMode("hours")}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              unavMode === "hours"
                ? "bg-brun text-creme shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Bloquer des heures précises
          </button>
        </div>

        {/* Add Unavailability Form */}
        <form
          onSubmit={handleAddUnavailability}
          className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            {unavMode === "range" ? (
              <>
                <div>
                  <label className="font-semibold text-brun block mb-1.5">Date de début *</label>
                  <input
                    type="date"
                    required
                    value={newUnav.startDate}
                    onChange={(e) => setNewUnav({ ...newUnav, startDate: e.target.value })}
                    className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brun block mb-1.5">Date de fin *</label>
                  <input
                    type="date"
                    required
                    value={newUnav.endDate}
                    onChange={(e) => setNewUnav({ ...newUnav, endDate: e.target.value })}
                    className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="font-semibold text-brun block mb-1.5">Date concernée *</label>
                <input
                  type="date"
                  required
                  value={newUnav.date}
                  onChange={(e) => setNewUnav({ ...newUnav, date: e.target.value })}
                  className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
                />
              </div>
            )}

            {unavMode === "hours" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-brun block mb-1.5">De *</label>
                  <input
                    type="time"
                    required
                    value={newUnav.startTime}
                    onChange={(e) => setNewUnav({ ...newUnav, startTime: e.target.value })}
                    className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brun block mb-1.5">À *</label>
                  <input
                    type="time"
                    required
                    value={newUnav.endTime}
                    onChange={(e) => setNewUnav({ ...newUnav, endTime: e.target.value })}
                    className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-brun block mb-1.5">Motif de fermeture</label>
              <input
                type="text"
                value={newUnav.reason}
                onChange={(e) => setNewUnav({ ...newUnav, reason: e.target.value })}
                placeholder="Ex : Formation, Vacances, Déplacement..."
                className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={addingUnav}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>
                {addingUnav
                  ? "Enregistrement..."
                  : unavMode === "range"
                  ? "Bloquer toute cette période"
                  : unavMode === "hours"
                  ? "Bloquer cette plage horaire"
                  : "Bloquer cette journée"}
              </span>
            </button>
          </div>
        </form>

        {/* List of blocked dates */}
        <div className="space-y-2">
          {unavailabilities.length > 0 ? (
            unavailabilities.map((unav) => {
              const id = unav.id || unav._id;
              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <Calendar className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-brun">{unav.date}</span>
                      <span className="text-stone-600 ml-2">
                        {unav.isAllDay
                          ? "(Journée entière bloquée)"
                          : `(De ${unav.startTime} à ${unav.endTime})`}
                      </span>
                      <span className="text-stone-500 italic ml-2 break-words">
                        — {unav.reason}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnavailability(id)}
                    aria-label="Supprimer le blocage"
                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    title="Supprimer le blocage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-stone-500 font-light text-center py-4">
              Aucune fermeture exceptionnelle programmée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
