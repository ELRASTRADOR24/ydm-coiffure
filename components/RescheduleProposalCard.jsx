"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Loader2,
  CalendarClock,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";
import { formatDateFrench, formatDuration } from "@/lib/utils";
import { saveTrackedBooking } from "@/lib/bookingPersistence";

function computeSlotEndTime(startTime, totalDuration) {
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) return "";
  const [h, m] = startTime.split(":").map(Number);
  const endMin = h * 60 + m + (Number(totalDuration) || 60);
  const eh = Math.floor(endMin / 60);
  const em = endMin % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

export default function RescheduleProposalCard({
  booking,
  initialIntent = "",
  holdLong = "2 heures",
  formattedDeposit = "10 €",
}) {
  const router = useRouter();
  const cleanIntent = String(initialIntent || "").trim().toLowerCase();

  const [showCounterPicker, setShowCounterPicker] = useState(
    cleanIntent === "refuser"
  );
  const [confirmDeclineOpen, setConfirmDeclineOpen] = useState(false);

  // Availability state for counter-proposal
  const [blockedDates, setBlockedDates] = useState([]);
  const [closedDayOfWeeks, setClosedDayOfWeeks] = useState([]);
  const [maxDaysInAdvance, setMaxDaysInAdvance] = useState(60);
  const [minNoticeHours, setMinNoticeHours] = useState(24);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  // Optional note & submission state
  const [note, setNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const totalDuration =
    Number(booking?.totalDuration || booking?.service?.duration) || 60;
  const proposedDate = booking?.proposedDate || booking?.date || "";
  const proposedStartTime = booking?.proposedStartTime || booking?.startTime || "";
  const proposedEndTime =
    booking?.proposedEndTime ||
    booking?.endTime ||
    computeSlotEndTime(proposedStartTime, totalDuration);
  const previousDate = booking?.previousDate || booking?.originalDate || "";
  const previousStartTime =
    booking?.previousStartTime || booking?.originalStartTime || "";

  // Fetch salon availability rules when counter-picker is opened
  useEffect(() => {
    if (!showCounterPicker) return;
    let isMounted = true;
    fetch("/api/availability?mode=blocked", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.success) return;
        if (Array.isArray(data.blockedDates)) setBlockedDates(data.blockedDates);
        if (Array.isArray(data.closedDayOfWeeks)) {
          setClosedDayOfWeeks(data.closedDayOfWeeks);
        }
        if (Number.isFinite(Number(data.maxDaysInAdvance))) {
          setMaxDaysInAdvance(Number(data.maxDaysInAdvance));
        }
        if (Number.isFinite(Number(data.minNoticeHours))) {
          setMinNoticeHours(Number(data.minNoticeHours));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [showCounterPicker]);

  const availableDateOptions = useMemo(() => {
    const parisTodayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const [py, pm, pd] = parisTodayStr.split("-").map(Number);
    const safeMaxDays = Math.max(
      1,
      Math.min(180, Number(maxDaysInAdvance) || 60)
    );
    const noticeHours = Number(minNoticeHours);
    const startOffset =
      Number.isFinite(noticeHours) && noticeHours >= 24
        ? Math.floor(noticeHours / 24)
        : 0;

    const dates = [];
    for (let i = startOffset; i <= safeMaxDays; i++) {
      const d = new Date(Date.UTC(py, pm - 1, pd + i, 12, 0, 0));
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getUTCDay();
      const dayName = new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        timeZone: "UTC",
      }).format(d);
      const dayNumber = d.getUTCDate();
      const monthName = new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        timeZone: "UTC",
      }).format(d);
      const isBlocked = blockedDates.includes(dateStr);
      const isClosedDay = closedDayOfWeeks.includes(dayOfWeek);

      dates.push({
        dateStr,
        dayName,
        dayNumber,
        monthName,
        isClosedDay,
        isBlocked,
      });
    }
    return dates;
  }, [blockedDates, closedDayOfWeeks, maxDaysInAdvance, minNoticeHours]);

  // Auto-select the first open date when opening the counter-picker
  useEffect(() => {
    if (!showCounterPicker || selectedDate) return;
    const firstOpen = availableDateOptions.find(
      (item) => !item.isClosedDay && !item.isBlocked
    );
    if (firstOpen) {
      setSelectedDate(firstOpen.dateStr);
    }
  }, [showCounterPicker, selectedDate, availableDateOptions]);

  // Fetch available time slots for selected counter-proposal date
  useEffect(() => {
    if (!showCounterPicker || !selectedDate || !totalDuration) return;
    let isMounted = true;
    setLoadingSlots(true);
    setSlotError("");
    setSelectedTime("");

    fetch(
      `/api/availability?date=${encodeURIComponent(selectedDate)}&duration=${totalDuration}`,
      { cache: "no-store" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          const rawSlots = Array.isArray(data.slots) ? data.slots : [];
          // Exclude the exact proposed slot so the client picks a genuinely different time
          const filteredSlots =
            selectedDate === proposedDate
              ? rawSlots.filter((s) => s !== proposedStartTime)
              : rawSlots;
          setAvailableSlots(filteredSlots);
          if (!data.isOpen) {
            setSlotError("Le salon est fermé à cette date. Choisissez un autre jour.");
          } else if (filteredSlots.length === 0) {
            setSlotError(
              "Aucun autre horaire disponible ce jour-là. Essayez une autre date ci-dessus."
            );
          }
        } else {
          setSlotError(
            data.error || "Impossible de charger les disponibilités pour cette date."
          );
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSlotError("Erreur réseau lors du chargement des horaires.");
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    showCounterPicker,
    selectedDate,
    totalDuration,
    proposedDate,
    proposedStartTime,
  ]);

  const handleAccept = async () => {
    if (submittingAction) return;
    setErrorMsg("");
    setSuccessMsg("");
    setSubmittingAction("accept");

    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(booking.bookingReference)}/respond-proposal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.booking) saveTrackedBooking(data.booking);
        setSuccessMsg(
          data.message ||
            "Nouvelle date validée ! Préparation de votre espace d'acompte..."
        );
        router.refresh();
      } else {
        setErrorMsg(
          data.error ||
            "Ce créneau n'a pas pu être validé. Choisissez une autre date ci-dessous."
        );
        if (res.status === 409) {
          setShowCounterPicker(true);
        }
      }
    } catch (_) {
      setErrorMsg("Erreur réseau lors de la validation. Merci de réessayer.");
    } finally {
      setSubmittingAction("");
    }
  };

  const handleSendCounter = async (e) => {
    e.preventDefault();
    if (submittingAction || !selectedDate || !selectedTime) return;
    setErrorMsg("");
    setSuccessMsg("");
    setSubmittingAction("counter");

    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(booking.bookingReference)}/respond-proposal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "counter",
            date: selectedDate,
            startTime: selectedTime,
            note,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.booking) saveTrackedBooking(data.booking);
        setSuccessMsg(
          data.message ||
            "Votre nouveau créneau a été transmis à la coiffeuse pour validation."
        );
        router.refresh();
      } else {
        setErrorMsg(
          data.error || "Impossible d'envoyer ce créneau. Veuillez en choisir un autre."
        );
      }
    } catch (_) {
      setErrorMsg("Erreur réseau lors de l'envoi. Merci de réessayer.");
    } finally {
      setSubmittingAction("");
    }
  };

  const handleDecline = async () => {
    if (submittingAction) return;
    setErrorMsg("");
    setSuccessMsg("");
    setSubmittingAction("decline");

    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(booking.bookingReference)}/respond-proposal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "decline",
            note,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.booking) saveTrackedBooking(data.booking);
        setSuccessMsg(data.message || "Votre demande a bien été annulée.");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Impossible d'annuler la demande.");
      }
    } catch (_) {
      setErrorMsg("Erreur réseau lors de l'annulation.");
    } finally {
      setSubmittingAction("");
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/75 border border-indigo-200 text-xs text-indigo-950 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center space-x-2 text-indigo-900 font-bold text-sm">
          <CalendarClock className="w-4 h-4 text-indigo-700 shrink-0" />
          <span>La coiffeuse vous propose une nouvelle date</span>
        </div>
        {cleanIntent === "accepter" && !successMsg && (
          <span className="text-[11px] font-semibold bg-white text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            Confirmez ci-dessous en 1 clic
          </span>
        )}
      </div>

      <p className="font-light leading-relaxed text-stone-700">
        Votre créneau initial n&apos;étant pas disponible, Maydie vous propose de décaler votre rendez-vous de <strong>{booking.service?.name}</strong> ({formatDuration(totalDuration)}). Si vous acceptez, le créneau sera aussitôt validé et vous pourrez régler votre acompte de {formattedDeposit} (délai de {holdLong}).
      </p>

      {/* Old vs Proposed date comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {previousDate && (
          <div className="p-3.5 rounded-xl bg-white/80 border border-stone-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Créneau précédent
            </span>
            <div className="text-stone-500 line-through font-medium capitalize">
              {formatDateFrench(previousDate)}
            </div>
            {previousStartTime && (
              <div className="text-stone-400 line-through">
                à {previousStartTime}
              </div>
            )}
          </div>
        )}

        <div
          className={`p-3.5 rounded-xl bg-white border-2 border-indigo-300 shadow-2xs space-y-1 ${
            previousDate ? "" : "sm:col-span-2"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
            Nouvelle date proposée
          </span>
          <div className="text-sm font-serif font-bold text-brun capitalize">
            {formatDateFrench(proposedDate)}
          </div>
          <div className="font-semibold text-indigo-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              {proposedStartTime} – {proposedEndTime}
            </span>
          </div>
        </div>
      </div>

      {booking.proposalMessage && (
        <div className="p-3.5 rounded-xl bg-white border border-indigo-200 text-xs text-stone-700 flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-brun block mb-0.5">
              Message de Maydie :
            </span>
            <p className="italic leading-relaxed">&quot;{booking.proposalMessage}&quot;</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          disabled={Boolean(submittingAction)}
          onClick={handleAccept}
          className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
        >
          {submittingAction === "accept" ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span>
            {submittingAction === "accept"
              ? "Validation en cours..."
              : "Oui, cette date me convient"}
          </span>
        </button>

        <button
          type="button"
          disabled={Boolean(submittingAction)}
          onClick={() => {
            setShowCounterPicker((prev) => !prev);
            setConfirmDeclineOpen(false);
            setErrorMsg("");
          }}
          className={`flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors disabled:opacity-60 cursor-pointer ${
            showCounterPicker
              ? "bg-brun text-creme border-brun"
              : "bg-white hover:bg-indigo-100/70 text-brun border-indigo-300"
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>
            {showCounterPicker
              ? "Masquer le choix d'une autre date"
              : "Non, choisir une autre date"}
          </span>
        </button>
      </div>

      {/* Interactive Counter-Proposal Availability Picker */}
      {showCounterPicker && (
        <form
          onSubmit={handleSendCounter}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-indigo-200 space-y-4 animate-fadeIn"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-brun">
              Choisissez une autre date disponible
            </h3>
            <p className="text-[11px] text-stone-500 font-light">
              Sélectionnez le jour et l&apos;heure qui vous arrangent pour <strong>{booking.service?.name}</strong>. Maydie recevra directement votre choix pour validation.
            </p>
          </div>

          {/* Horizontal Date Strip */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-brun block">
              1. Choisissez un jour :
            </span>
            <div className="flex space-x-2 overflow-x-auto pb-2 snap-x">
              {availableDateOptions.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                const isDisabled = item.isClosedDay || item.isBlocked;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`snap-start shrink-0 min-w-14 min-h-[66px] py-2 px-2.5 rounded-xl flex flex-col items-center justify-center text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brun text-creme shadow-xs ring-2 ring-champagne"
                        : isDisabled
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200 opacity-60"
                        : "bg-creme text-brun border border-beige hover:border-champagne"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">
                      {item.dayName}
                    </span>
                    <span className="text-base font-serif font-bold mt-0.5">
                      {item.dayNumber}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {isDisabled ? "Fermé" : item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Time Slots */}
          {selectedDate && (
            <div className="space-y-2 pt-2 border-t border-beige">
              <span className="text-xs font-semibold text-brun block">
                2. Choisissez un horaire pour le {formatDateFrench(selectedDate)} :
              </span>

              {loadingSlots ? (
                <div className="py-5 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-champagne-dark" />
                  <span>Chargement des créneaux disponibles...</span>
                </div>
              ) : slotError ? (
                <div className="p-3 rounded-xl bg-creme border border-beige text-xs text-stone-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-champagne-dark shrink-0" />
                  <span>{slotError}</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                          isSelected
                            ? "bg-champagne text-brun-dark ring-2 ring-champagne-dark"
                            : "bg-creme text-brun border border-beige hover:border-champagne"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {/* Optional client note */}
          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="counter-proposal-note"
              className="text-xs font-semibold text-brun block"
            >
              Petit mot pour Maydie (optionnel) :
            </label>
            <textarea
              id="counter-proposal-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex : Cet après-midi-là m'arrange beaucoup mieux, merci !"
              className="w-full bg-creme/60 border border-beige rounded-xl p-3 text-base xl:text-sm text-brun focus:outline-none focus:border-champagne"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedDate || !selectedTime || Boolean(submittingAction)}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-brun hover:bg-brun-dark disabled:opacity-40 disabled:cursor-not-allowed text-creme px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            {submittingAction === "counter" ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Send className="w-4 h-4 text-champagne shrink-0" />
            )}
            <span>
              {submittingAction === "counter"
                ? "Envoi en cours..."
                : selectedDate && selectedTime
                ? `Envoyer ce créneau (${formatDateFrench(selectedDate)} à ${selectedTime})`
                : "Sélectionnez un jour et un horaire"}
            </span>
          </button>
        </form>
      )}

      {/* Subtle tertiary cancel option */}
      <div className="pt-2 border-t border-indigo-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {!confirmDeclineOpen ? (
          <button
            type="button"
            disabled={Boolean(submittingAction)}
            onClick={() => setConfirmDeclineOpen(true)}
            className="min-h-[36px] inline-flex items-center gap-1.5 text-stone-500 hover:text-red-700 underline cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Annuler définitivement ma demande</span>
          </button>
        ) : (
          <div className="w-full p-3 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-red-900 font-medium">
              Confirmer l&apos;annulation définitive de cette demande ?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={Boolean(submittingAction)}
                onClick={() => setConfirmDeclineOpen(false)}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold cursor-pointer"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={Boolean(submittingAction)}
                onClick={handleDecline}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold cursor-pointer disabled:opacity-50"
              >
                {submittingAction === "decline"
                  ? "Annulation..."
                  : "Oui, annuler"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
