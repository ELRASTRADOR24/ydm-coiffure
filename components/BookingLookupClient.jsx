"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  XCircle,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  getTrackedBookings,
  saveTrackedBooking,
  removeTrackedBooking,
  normalizeBookingReference,
  isValidBookingReference,
} from "@/lib/bookingPersistence";
import { getBookingStatusLabel } from "@/lib/adminHelpers";
import { formatDateFrench, formatPrice } from "@/lib/utils";

function getBadgeVisual(status, depositDeclared) {
  switch (status) {
    case "PENDING_APPROVAL":
      return {
        label: "En attente de validation coiffeuse",
        style: "bg-stone-100 text-stone-800 border-stone-300",
        icon: <Clock className="w-3.5 h-3.5 text-stone-600" />,
      };
    case "PENDING_PAYMENT":
      return {
        label: depositDeclared
          ? "Acompte déclaré • Vérification en cours"
          : "Acompte à régler",
        style: depositDeclared
          ? "bg-emerald-50 text-emerald-900 border-emerald-300"
          : "bg-amber-50 text-amber-900 border-amber-300",
        icon: <CreditCard className="w-3.5 h-3.5 text-amber-700" />,
      };
    case "CONFIRMED":
      return {
        label: "Rendez-vous Confirmé",
        style: "bg-emerald-50 text-emerald-900 border-emerald-300",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
      };
    case "REJECTED":
      return {
        label: "Demande refusée",
        style: "bg-red-50 text-red-900 border-red-300",
        icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
      };
    case "EXPIRED":
      return {
        label: "Délai expiré",
        style: "bg-stone-100 text-stone-600 border-stone-300",
        icon: <AlertCircle className="w-3.5 h-3.5 text-stone-500" />,
      };
    default:
      return {
        label: getBookingStatusLabel(status),
        style: "bg-stone-100 text-stone-700 border-stone-200",
        icon: <AlertCircle className="w-3.5 h-3.5 text-stone-500" />,
      };
  }
}

export default function BookingLookupClient({ initialBooking = null }) {
  const router = useRouter();
  const [trackedList, setTrackedList] = useState(() =>
    initialBooking
      ? [
          {
            bookingReference: initialBooking.bookingReference,
            status: initialBooking.status,
            date: initialBooking.date,
            startTime: initialBooking.startTime,
            serviceName: initialBooking.service?.name || "",
            depositDeclared: Boolean(initialBooking.depositDeclared),
            depositAmount: initialBooking.depositAmount ?? 10,
            depositRejectionReason: initialBooking.depositRejectionReason || "",
          },
        ]
      : []
  );
  const [refInput, setRefInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [hydrated, setHydrated] = useState(Boolean(initialBooking));

  useEffect(() => {
    if (initialBooking?.bookingReference) {
      saveTrackedBooking(initialBooking);
    }

    const stored = getTrackedBookings();
    if (stored.length === 0 && !initialBooking) {
      setHydrated(true);
      return;
    }

    const refsToFetch = Array.from(
      new Set([
        ...(initialBooking ? [initialBooking.bookingReference] : []),
        ...stored.map((item) => item.bookingReference),
      ])
    ).slice(0, 5);

    Promise.all(
      refsToFetch.map(async (ref) => {
        try {
          const res = await fetch(`/api/bookings/${encodeURIComponent(ref)}`, {
            cache: "no-store",
          });
          const data = await res.json();
          if (res.ok && data.success && data.booking) {
            return {
              bookingReference: data.booking.bookingReference,
              status: data.booking.status,
              date: data.booking.date,
              startTime: data.booking.startTime,
              serviceName: data.booking.service?.name || "",
              firstName: data.booking.customerName || "",
              depositDeclared: Boolean(data.booking.depositDeclared),
              depositAmount: data.booking.depositAmount ?? 10,
              depositRejectionReason: data.booking.depositRejectionReason || "",
            };
          }
        } catch (_) {
          // Keep cached stub below if network fails temporarily
        }
        return (
          stored.find((s) => s.bookingReference === ref) ||
          (initialBooking?.bookingReference === ref
            ? {
                bookingReference: initialBooking.bookingReference,
                status: initialBooking.status,
                date: initialBooking.date,
                startTime: initialBooking.startTime,
                serviceName: initialBooking.service?.name || "",
                depositDeclared: Boolean(initialBooking.depositDeclared),
                depositAmount: initialBooking.depositAmount ?? 10,
                depositRejectionReason: initialBooking.depositRejectionReason || "",
              }
            : null)
        );
      })
    )
      .then((results) => {
        const cleanResults = results.filter(Boolean);
        setTrackedList(cleanResults);
      })
      .finally(() => {
        setHydrated(true);
      });
  }, [initialBooking]);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    setLookupError("");
    const normalized = normalizeBookingReference(refInput);
    if (!isValidBookingReference(normalized)) {
      setLookupError(
        "Format de référence invalide (exemple : YDM-2026-1234)."
      );
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(normalized)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        saveTrackedBooking(data.booking);
        router.push(`/reserver/statut/${encodeURIComponent(normalized)}`);
      } else {
        setLookupError(
          data.error ||
            "Aucune réservation trouvée avec cette référence. Vérifiez votre SMS ou e-mail."
        );
      }
    } catch (_) {
      setLookupError(
        "Impossible de contacter le serveur. Vérifiez votre connexion."
      );
    } finally {
      setSearching(false);
    }
  };

  const handleForgetBooking = (ref) => {
    removeTrackedBooking(ref);
    setTrackedList((prev) => prev.filter((item) => item.bookingReference !== ref));
  };

  return (
    <div className="space-y-6">
      {/* Persisted bookings on this device */}
      {trackedList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brun">
              Vos réservations enregistrées sur cet appareil
            </h2>
            <span className="text-[11px] text-stone-400">
              Conservées même après actualisation
            </span>
          </div>

          <div className="space-y-3">
            {trackedList.map((item) => {
              const visual = getBadgeVisual(item.status, item.depositDeclared);
              return (
                <div
                  key={item.bookingReference}
                  className="bg-creme rounded-2xl p-4 sm:p-5 border border-beige space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-base font-bold text-brun block">
                        {item.bookingReference}
                      </span>
                      {item.serviceName && (
                        <span className="text-xs font-semibold text-stone-700 block mt-0.5">
                          {item.serviceName}
                        </span>
                      )}
                      {item.date && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-champagne-dark" />
                          <span>
                            {formatDateFrench(item.date)}
                            {item.startTime ? ` à ${item.startTime}` : ""}
                          </span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${visual.style}`}
                    >
                      {visual.icon}
                      <span>{visual.label}</span>
                    </span>
                  </div>

                  {item.status === "PENDING_PAYMENT" && item.depositRejectionReason && !item.depositDeclared && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      <strong>Note coiffeuse :</strong> {item.depositRejectionReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      href={`/reserver/statut/${item.bookingReference}`}
                      className="flex-1 sm:flex-initial min-h-[42px] inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-5 py-2 rounded-full text-xs font-semibold transition-colors"
                    >
                      <span>
                        {item.status === "PENDING_PAYMENT" && !item.depositDeclared
                          ? `Payer & valider l'acompte (${formatPrice(item.depositAmount ?? 10)})`
                          : "Ouvrir mon suivi complet"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-champagne" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleForgetBooking(item.bookingReference)}
                      title="Retirer de cet appareil"
                      aria-label={`Retirer ${item.bookingReference} de cet appareil`}
                      className="p-2 rounded-full text-stone-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hydrated && trackedList.length === 0 && (
        <div className="p-4 rounded-2xl bg-creme border border-beige text-xs text-stone-600 leading-relaxed">
          Aucune demande récente enregistrée dans ce navigateur. Saisissez votre référence reçue par SMS ou e-mail ci-dessous pour retrouver votre suivi à tout moment sans créer de compte.
        </div>
      )}

      {/* Manual reference lookup */}
      <form
        onSubmit={handleLookupSubmit}
        className="pt-4 border-t border-beige space-y-3"
      >
        <label
          htmlFor="booking-reference-lookup"
          className="text-xs font-semibold text-brun block"
        >
          Retrouver un dossier avec sa référence
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="booking-reference-lookup"
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Ex : YDM-2026-1234"
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-beige bg-creme/50 focus:bg-white focus:border-champagne focus:outline-none text-sm font-mono uppercase text-brun"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="min-h-[44px] inline-flex items-center justify-center space-x-2 bg-champagne hover:bg-champagne-dark text-brun-dark px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>{searching ? "Recherche..." : "Accéder au suivi"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {lookupError && (
          <p className="text-xs text-red-600 font-medium">{lookupError}</p>
        )}
      </form>
    </div>
  );
}
