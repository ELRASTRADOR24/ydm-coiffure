"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  EyeOff,
  Lock,
  Unlock,
  Coffee,
  CalendarCheck,
  RotateCcw,
  Loader2,
  Sun,
  Sunset,
  CalendarOff,
} from "lucide-react";
import { formatDateFrench } from "@/lib/utils";
import {
  buildDayMaskingModel,
  computeToggledDaySlots,
  getDayOfWeekFromDateStr,
  AFTERNOON_SPLIT_MINUTES,
} from "@/lib/slotMasking";

export default function QuickSlotMasker({
  dateStr,
  availabilities = [],
  unavailabilities = [],
  bookings = [],
  onUnavailabilitiesChange,
  onToast,
  showAvailabilityLink = true,
}) {
  const [syncing, setSyncing] = useState(false);
  const requestChainRef = useRef(Promise.resolve());
  const pendingCountRef = useRef(0);
  const rollbackListRef = useRef(unavailabilities);

  if (pendingCountRef.current === 0) {
    rollbackListRef.current = unavailabilities;
  }

  const weeklyAvailability = useMemo(() => {
    const dow = getDayOfWeekFromDateStr(dateStr);
    if (dow === null) return null;
    return (availabilities || []).find((a) => a.dayOfWeek === dow) || null;
  }, [availabilities, dateStr]);

  const model = useMemo(
    () =>
      buildDayMaskingModel({
        dateStr,
        weeklyAvailability,
        unavailabilities,
        bookings,
      }),
    [dateStr, weeklyAvailability, unavailabilities, bookings]
  );

  const periodStats = useMemo(() => {
    const selectable = model.slots.filter((s) => !s.isBreak && !s.booking);
    const morning = selectable.filter((s) => s.minutes < AFTERNOON_SPLIT_MINUTES);
    const afternoon = selectable.filter((s) => s.minutes >= AFTERNOON_SPLIT_MINUTES);
    return {
      hasMorning: morning.length > 0,
      allMorningMasked: morning.length > 0 && morning.every((s) => s.isMasked),
      hasAfternoon: afternoon.length > 0,
      allAfternoonMasked: afternoon.length > 0 && afternoon.every((s) => s.isMasked),
    };
  }, [model.slots]);

  const applyOptimisticAndPersist = ({ isAllDay, ranges, reason, toastText }) => {
    // 1. Mise à jour optimiste instantanée pour la fluidité tactile sur tablette
    const otherDays = (unavailabilities || []).filter((u) => u && u.date !== dateStr);
    const optimisticDayEntries = isAllDay
      ? [
          {
            id: `opt_${Date.now()}_all`,
            date: dateStr,
            isAllDay: true,
            startTime: null,
            endTime: null,
            reason: reason || "Journée fermée",
          },
        ]
      : (ranges || []).map((r, idx) => ({
          id: `opt_${Date.now()}_${idx}`,
          date: dateStr,
          isAllDay: false,
          startTime: r.startTime,
          endTime: r.endTime,
          reason: reason || "Créneau masqué",
        }));

    onUnavailabilitiesChange?.([...otherDays, ...optimisticDayEntries]);

    // 2. Exécution séquentielle stricte vers l'API (supporte les taps rapides en série)
    pendingCountRef.current += 1;
    setSyncing(true);

    requestChainRef.current = requestChainRef.current
      .then(async () => {
        const res = await fetch("/api/admin/unavailability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateStr,
            isAllDay: Boolean(isAllDay),
            ranges: ranges || [],
            reason,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Impossible de mettre à jour ce créneau.");
        }
        // On synchronise la liste finale seulement quand aucun autre tap n'est en attente
        if (pendingCountRef.current <= 1 && Array.isArray(data.unavailabilities)) {
          rollbackListRef.current = data.unavailabilities;
          onUnavailabilitiesChange?.(data.unavailabilities);
        }
        if (toastText && pendingCountRef.current <= 1) {
          onToast?.(toastText);
        }
      })
      .catch((err) => {
        if (pendingCountRef.current <= 1) {
          onUnavailabilitiesChange?.(rollbackListRef.current);
        }
        onToast?.(err?.message || "Erreur réseau lors de la mise à jour.");
      })
      .finally(() => {
        pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
        if (pendingCountRef.current === 0) {
          setSyncing(false);
        }
      });
  };

  const handleToggleAllDay = () => {
    const nextAllDay = !model.isAllDayBlocked;
    applyOptimisticAndPersist({
      isAllDay: nextAllDay,
      ranges: [],
      reason: nextAllDay ? "Fermeture exceptionnelle" : "Créneau masqué",
      toastText: nextAllDay
        ? `Journée du ${formatDateFrench(dateStr)} fermée.`
        : `Journée du ${formatDateFrench(dateStr)} rouverte !`,
    });
  };

  const handleToggleSlot = (slotTime) => {
    const { ranges } = computeToggledDaySlots({
      slots: model.slots,
      mode: "toggle-slot",
      slotTime,
    });
    const wasMasked = model.slots.find((s) => s.time === slotTime)?.isMasked;
    applyOptimisticAndPersist({
      isAllDay: false,
      ranges,
      reason: "Créneau masqué",
      toastText: wasMasked
        ? `Créneau ${slotTime} rouvert.`
        : `Créneau ${slotTime} masqué aux clientes.`,
    });
  };

  const handleQuickPreset = (mode) => {
    const { ranges } = computeToggledDaySlots({
      slots: model.slots,
      mode,
    });
    const labelMap = {
      morning: periodStats.allMorningMasked
        ? "Matinée rouverte."
        : "Toute la matinée masquée.",
      afternoon: periodStats.allAfternoonMasked
        ? "Après-midi rouvert."
        : "Tout l'après-midi masqué.",
      clear: "Tous les créneaux de la journée sont ouverts.",
    };
    applyOptimisticAndPersist({
      isAllDay: false,
      ranges,
      reason: "Créneau masqué",
      toastText: labelMap[mode] || "Disponibilités mises à jour.",
    });
  };

  if (!dateStr) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5 space-y-4">
      {/* En-tête : Date + Statut + Toggle Journée entière en 1 tap */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-bold text-brun text-base sm:text-lg capitalize">
              Créneaux du {formatDateFrench(dateStr)}
            </span>

            {syncing ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-champagne-light text-brun text-[11px] font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Enregistrement...</span>
              </span>
            ) : model.isWeeklyClosed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[11px] font-bold">
                <CalendarOff className="w-3 h-3" />
                <span>Repos hebdomadaire</span>
              </span>
            ) : model.isAllDayBlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold">
                <Lock className="w-3 h-3" />
                <span>Journée fermée</span>
              </span>
            ) : model.maskedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold">
                <EyeOff className="w-3 h-3" />
                <span>
                  {model.maskedCount} créneau{model.maskedCount > 1 ? "x" : ""} masqué
                  {model.maskedCount > 1 ? "s" : ""}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                <span>Journée ouverte</span>
              </span>
            )}
          </div>

          <p className="text-xs text-stone-600">
            {model.isWeeklyClosed
              ? "Ce jour est fermé dans vos horaires hebdomadaires."
              : model.isAllDayBlocked
              ? "Aucune cliente ne peut réserver sur cette date."
              : "Cochez simplement un créneau pour le masquer aux clientes (sauvegarde instantanée)."}
          </p>
        </div>

        {!model.isWeeklyClosed && (
          <button
            type="button"
            onClick={handleToggleAllDay}
            className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all shrink-0 cursor-pointer ${
              model.isAllDayBlocked
                ? "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 shadow-xs"
                : "bg-white hover:bg-red-50 text-red-700 border-red-200 hover:border-red-300"
            }`}
          >
            {model.isAllDayBlocked ? (
              <>
                <Unlock className="w-4 h-4 shrink-0" />
                <span>Rouvrir cette journée</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 shrink-0" />
                <span>Fermer toute la journée</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Corps selon l'état du jour */}
      {model.isWeeklyClosed ? (
        <div className="p-4 rounded-xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-stone-600">
          <span>
            Les réservations sont désactivées ce jour chaque semaine.
          </span>
          {showAvailabilityLink && (
            <Link
              href="/admin/availability"
              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-brun font-semibold shrink-0"
            >
              Ouvrir dans Semaine type
            </Link>
          )}
        </div>
      ) : model.isAllDayBlocked ? (
        <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-red-900">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              Toute la journée est bloquée ({model.allDayReason}).
            </span>
          </div>
          <span className="text-xs text-red-700">
            Touchez « Rouvrir cette journée » pour gérer des heures précises.
          </span>
        </div>
      ) : (
        <>
          {/* Raccourcis 1-tap Matin / Après-midi / Tout libérer */}
          <div className="flex flex-wrap items-center gap-2">
            {periodStats.hasMorning && (
              <button
                type="button"
                onClick={() => handleQuickPreset("morning")}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  periodStats.allMorningMasked
                    ? "bg-brun text-creme border-brun shadow-2xs"
                    : "bg-white hover:bg-champagne-light/50 text-brun border-stone-200 hover:border-champagne"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                <span>
                  {periodStats.allMorningMasked ? "Rouvrir le matin" : "Masquer le matin (→ 13h)"}
                </span>
              </button>
            )}

            {periodStats.hasAfternoon && (
              <button
                type="button"
                onClick={() => handleQuickPreset("afternoon")}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  periodStats.allAfternoonMasked
                    ? "bg-brun text-creme border-brun shadow-2xs"
                    : "bg-white hover:bg-champagne-light/50 text-brun border-stone-200 hover:border-champagne"
                }`}
              >
                <Sunset className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                <span>
                  {periodStats.allAfternoonMasked
                    ? "Rouvrir l'après-midi"
                    : "Masquer l'après-midi (13h →)"}
                </span>
              </button>
            )}

            {model.maskedCount > 0 && (
              <button
                type="button"
                onClick={() => handleQuickPreset("clear")}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Tout débloquer</span>
              </button>
            )}
          </div>

          {/* Grille tactile de cases à cocher par créneau */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2">
            {model.slots.map((slot) => {
              if (slot.booking) {
                return (
                  <div
                    key={slot.time}
                    title={`Réservé par ${slot.booking.customerName} (${slot.booking.startTime} - ${slot.booking.endTime})`}
                    className="min-h-[48px] px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col justify-center select-none"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-xs sm:text-sm">
                        {slot.time}
                      </span>
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <span className="text-[10px] font-semibold truncate text-emerald-700">
                      RDV
                    </span>
                  </div>
                );
              }

              if (slot.isBreak) {
                return (
                  <div
                    key={slot.time}
                    title="Pause déjeuner hebdomadaire"
                    className="min-h-[48px] px-2.5 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-400 flex flex-col justify-center select-none"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-semibold text-xs sm:text-sm">
                        {slot.time}
                      </span>
                      <Coffee className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span className="text-[10px] font-medium">Pause</span>
                  </div>
                );
              }

              return (
                <button
                  key={slot.time}
                  type="button"
                  role="checkbox"
                  aria-checked={slot.isMasked}
                  aria-label={`${slot.isMasked ? "Rouvrir" : "Masquer"} le créneau ${slot.time}`}
                  onClick={() => handleToggleSlot(slot.time)}
                  className={`min-h-[48px] px-2.5 py-2 rounded-xl border text-left flex flex-col justify-center transition-all cursor-pointer active:scale-[0.97] ${
                    slot.isMasked
                      ? "bg-brun text-creme border-brun shadow-xs"
                      : "bg-white hover:bg-champagne-light/40 text-brun border-stone-200 hover:border-champagne"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`font-mono font-bold text-xs sm:text-sm ${
                        slot.isMasked ? "line-through text-creme/90" : "text-brun"
                      }`}
                    >
                      {slot.time}
                    </span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        slot.isMasked
                          ? "bg-champagne border-champagne text-brun-dark"
                          : "bg-stone-50 border-stone-300"
                      }`}
                    >
                      {slot.isMasked && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-medium mt-0.5 ${
                      slot.isMasked ? "text-champagne" : "text-stone-400"
                    }`}
                  >
                    {slot.isMasked ? "Masqué" : "Libre"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Résumé clair des plages fusionnées */}
          {model.maskedRanges.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
              <span className="font-semibold text-brun">Plages masquées :</span>
              {model.maskedRanges.map((r, i) => (
                <span
                  key={`${r.startTime}-${r.endTime}-${i}`}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 font-mono text-[11px] font-semibold text-brun"
                >
                  {r.startTime} – {r.endTime}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
