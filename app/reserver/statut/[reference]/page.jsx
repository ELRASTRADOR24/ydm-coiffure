import { getBookingByReference, getSettings } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";
import DepositPaymentOptions from "@/components/DepositPaymentOptions";

export async function generateMetadata({ params }) {
  const { reference } = await params;
  return {
    title: `Suivi du dossier ${reference} | YDM Coiffure`,
  };
}

export default async function BookingStatusPage({ params }) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);

  if (!booking) {
    notFound();
  }

  const settings = await getSettings();

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return {
          label: "En attente de validation manuelle",
          color: "bg-stone-100 text-stone-800 border-stone-300",
          icon: <Clock className="w-3.5 h-3.5 text-stone-600" />,
        };
      case "PENDING_PAYMENT":
        return {
          label: "Approuvée - Acompte de 10 € sous 2h",
          color: "bg-amber-50 text-amber-900 border-amber-300",
          icon: <CreditCard className="w-3.5 h-3.5 text-amber-700" />,
        };
      case "CONFIRMED":
        return {
          label: "Rendez-vous Confirmé",
          color: "bg-emerald-50 text-emerald-900 border-emerald-300",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
        };
      case "REJECTED":
        return {
          label: "Demande refusée",
          color: "bg-red-50 text-red-900 border-red-300",
          icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
        };
      case "EXPIRED":
        return {
          label: "Délai de 2h expiré",
          color: "bg-stone-100 text-stone-600 border-stone-300",
          icon: <AlertCircle className="w-3.5 h-3.5 text-stone-500" />,
        };
      case "CANCELLED":
        return {
          label: "Rendez-vous annulé",
          color: "bg-stone-100 text-stone-600 border-stone-300",
          icon: <XCircle className="w-3.5 h-3.5 text-stone-500" />,
        };
      default:
        return {
          label: status,
          color: "bg-stone-100 text-stone-700 border-stone-200",
          icon: null,
        };
    }
  };

  const badge = getStatusBadge(booking.status);

  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-beige pb-4">
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                Suivi de réservation
              </div>
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-brun">
                {booking.bookingReference}
              </h1>
            </div>
            <div
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </div>
          </div>

          {/* STATUS NOTICES */}
          {booking.status === "PENDING_APPROVAL" && (
            <div className="p-4 rounded-xl bg-creme border border-beige text-xs text-stone-700 space-y-2">
              <span className="font-semibold text-brun block">
                Examen manuel par la coiffeuse en cours
              </span>
              <p className="font-light leading-relaxed">
                Votre demande a bien été transmise. Dès que Maydie valide le créneau, vous disposerez d'un <strong>délai strict de 2 heures</strong> pour régler l'acompte obligatoire de 10 € et finaliser votre réservation.
              </p>
              <div className="pt-2 border-t border-beige text-[11px] text-stone-500 flex flex-wrap gap-2 items-center">
                <span className="font-medium text-brun">Moyens acceptés :</span>
                <span className="bg-white px-2 py-0.5 rounded border border-beige">Revolut</span>
                <span className="bg-white px-2 py-0.5 rounded border border-beige">PayPal</span>
                <span className="bg-white px-2 py-0.5 rounded border border-beige">Wero / Paylib</span>
              </div>
            </div>
          )}

          {booking.status === "PENDING_PAYMENT" && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-3">
              <span className="font-bold text-sm block">
                Demande validée : versez votre acompte de 10 €
              </span>
              <p className="font-light leading-relaxed">
                Votre créneau est pré-réservé. Pour le bloquer définitivement, versez votre acompte de 10 € dans un <strong>délai strict de 2 heures</strong> via Revolut, PayPal ou Wero.
              </p>

              <DepositPaymentOptions
                bookingReference={booking.bookingReference}
                customerName={booking.customer.firstName}
                initialDeclared={Boolean(booking.depositDeclared)}
                initialMethod={booking.depositDeclaredMethod || ""}
                stripeUrl={booking.stripePaymentUrl}
              />
            </div>
          )}

          {booking.status === "CONFIRMED" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <span className="font-bold block">
                  Rendez-vous confirmé • Acompte réglé
                </span>
                <p className="font-light leading-relaxed">
                  Votre séance est officiellement réservée dans notre planning à La Roche-sur-Yon.
                </p>
              </div>

              {/* Confidential Address */}
              <div className="p-4 rounded-xl bg-creme border border-beige space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-brun font-bold">
                  <MapPin className="w-4 h-4 text-champagne-dark" />
                  <span>Adresse Privée du Salon</span>
                </div>
                <div className="text-stone-700">
                  {settings?.homeAddress?.street || "Quartier Centre-Gare"}<br />
                  {settings?.homeAddress?.postalCode || "85000"} {settings?.homeAddress?.city || "La Roche-sur-Yon"}
                </div>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-beige/60">
                  {settings?.homeAddress?.accessNotes ||
                    "Accès et précisions communiqués avant votre venue."}
                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-brun block uppercase tracking-wider text-[10px]">
              Détails du dossier
            </span>

            <div className="p-4 rounded-xl bg-creme border border-beige space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-beige/60">
                <span className="text-stone-500">Prestation :</span>
                <span className="font-semibold text-brun">{booking.service.name}</span>
              </div>
              {booking.selectedOptions && booking.selectedOptions.length > 0 && (
                <div className="py-1.5 border-b border-beige/60 space-y-1">
                  {booking.selectedOptions.map((opt, i) => (
                    <div key={i} className="flex justify-between text-stone-600">
                      <span>{opt.name} :</span>
                      <span className="font-medium text-brun">{opt.choice}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-beige/60">
                <span className="text-stone-500">Date :</span>
                <span className="font-semibold text-brun">
                  {formatDateFrench(booking.date)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-beige/60">
                <span className="text-stone-500">Heure de début :</span>
                <span className="font-semibold text-brun">
                  {booking.startTime}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-beige/60">
                <span className="text-stone-500">Prix total :</span>
                <span className="font-serif font-bold text-brun">
                  {formatPrice(booking.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-beige/60">
                <span className="text-stone-500">Acompte :</span>
                <span className="font-bold text-champagne-dark">
                  10 €
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Solde restant sur place :</span>
                <span className="font-semibold text-brun">
                  {formatPrice(booking.remainingBalance)} (Wero, PayPal, virement, espèces)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-stone-500 hover:text-brun underline"
            >
              Retour à l'accueil
            </Link>
            <Link
              href="/reserver"
              className="bg-stone-100 hover:bg-stone-200 text-brun px-4 py-2 rounded-full font-medium transition-colors"
            >
              Nouveau rendez-vous
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
