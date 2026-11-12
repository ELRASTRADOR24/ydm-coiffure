"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, AlertCircle, Send, X } from "lucide-react";
import { formatDateFrench, formatDuration } from "@/lib/utils";
import { getParisDateString } from "@/lib/adminHelpers";

const QUICK_TIMES = ["09:30", "10:00", "11:00", "13:30", "14:00", "15:00", "16:00", "17:00"];
const QUICK_NOTES = [
  "Je ne suis malheureusement pas disponible sur votre créneau initial, voici celui que je peux vous proposer.",
  "Un créneau vient de se libérer à cet horaire si cela vous arrange !",
];

function computeEndTime(startTime, totalDuration) {
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) return "";
  const [h, m] = startTime.split(":").map(Number);
  const endMin = h * 60 + m + (Number(totalDuration) || 60);
  if (endMin > 24 * 60) return "Après minuit";
  const eh = Math.floor(endMin / 60);
  const em = endMin % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

export default function ProposeDateModal({
  booking,
  onClose,
  onSuccess,
}) {
  const [date, setDate] = useState(() => booking?.date || getParisDateString());
  const [startTime, setStartTime] = useState(() => booking?.startTime || "10:00");
  const [message, setMessage] = useState(() => booking?.proposalMessage || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!booking) return;
    setDate(booking.date || getParisDateString());
    setStartTime(booking.startTime || "10:00");
    setMessage(booking.proposalMessage || "");
    setError("");
  }, [booking]);

  useEffect(() => {
    if (!booking) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [booking, onClose]);

  const totalDuration = Number(booking?.totalDuration || booking?.service?.duration) || 60;
  const computedEndTime = useMemo(
    () => computeEndTime(startTime, totalDuration),
    [startTime, totalDuration]
  );

  if (!booking) return null;

  const bookingId = booking.id || booking._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/propose-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          startTime,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess?.(data.booking, data.message);
      } else {
        setError(data.error || "Impossible d'envoyer cette proposition.");
      }
    } catch (_) {
      setError("Erreur réseau lors de l'envoi de la proposition.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden border border-stone-300 shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-start justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] font-mono font-bold text-champagne-dark uppercase tracking-wider block">
              {booking.bookingReference}
            </span>
            <h3 className="font-serif text-xl font-bold text-brun">
              Proposer une autre date à {booking.customer?.firstName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-stone-100 hover:bg-stone-200 inline-flex items-center justify-center text-brun cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          id="admin-propose-date-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4"
        >
          {/* Current booking recap */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
            <div className="font-semibold text-brun">
              {booking.service?.name} ({formatDuration(totalDuration)})
            </div>
            <div className="text-stone-600">
              Créneau actuel :{" "}
              <strong>
                {formatDateFrench(booking.date)} de {booking.startTime} à {booking.endTime}
              </strong>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            La cliente recevra un e-mail et un SMS avec votre nouvelle date : elle pourra l&apos;accepter en 1 clic (et régler son acompte) ou choisir un autre créneau qui vous sera soumis.
          </p>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Time inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="propose-date-input"
                className="text-xs font-bold text-brun flex items-center gap-1.5 mb-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-champagne-dark" />
                <span>Nouvelle date *</span>
              </label>
              <input
                id="propose-date-input"
                type="date"
                required
                min={getParisDateString()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError("");
                }}
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
              />
            </div>

            <div>
              <label
                htmlFor="propose-time-input"
                className="text-xs font-bold text-brun flex items-center gap-1.5 mb-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-champagne-dark" />
                <span>Heure de début *</span>
              </label>
              <input
                id="propose-time-input"
                type="time"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError("");
                }}
                className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Quick time chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-500 block">
              Horaires rapides :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setStartTime(t);
                    setError("");
                  }}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    startTime === t
                      ? "bg-brun text-creme border-brun"
                      : "bg-white text-brun border-stone-200 hover:border-champagne"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {date && startTime && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex flex-wrap items-center justify-between gap-2">
              <span>Créneau proposé :</span>
              <span className="font-bold capitalize">
                {formatDateFrench(date)} • {startTime} – {computedEndTime}
              </span>
            </div>
          )}

          {/* Optional note */}
          <div className="space-y-2">
            <label
              htmlFor="propose-note-input"
              className="text-xs font-bold text-brun block"
            >
              Petit mot pour la cliente (optionnel) :
            </label>
            <textarea
              id="propose-note-input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex : Je ne suis pas disponible sur le créneau initial, mais ce nouvel horaire vient de se libérer..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(preset)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-left transition-colors cursor-pointer"
                >
                  + &quot;{preset.slice(0, 48)}…&quot;
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200 cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="admin-propose-date-form"
            disabled={submitting}
            className="min-h-[44px] inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Envoi en cours..." : "Envoyer la proposition"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
