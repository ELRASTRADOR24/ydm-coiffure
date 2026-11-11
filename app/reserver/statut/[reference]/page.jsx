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
import { resolvePaymentAccounts } from "@/lib/adminHelpers";
import DepositPaymentOptions from "@/components/DepositPaymentOptions";
import BookingRefPersister from "@/components/BookingRefPersister";

export const dynamic = "force-dynamic";

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
  const paymentAccounts = resolvePaymentAccounts(settings);
  const enabledMethodLabels = [
    paymentAccounts.weroEnabled ? "Wero / Paylib" : null,
    paymentAccounts.revolutEnabled ? "Revolut" : null,
    paymentAccounts.paypalEnabled ? "PayPal" : null,
  ].filter(Boolean);
  const enabledMethodsSummary =
    enabledMethodLabels.length > 1
      ? `${enabledMethodLabels.slice(0, -1).join(", ")} ou ${enabledMethodLabels[enabledMethodLabels.length - 1]}`
      : enabledMethodLabels[0] || "Wero, Revolut ou PayPal";
  const formattedDeposit = formatPrice(booking.depositAmount ?? 10);
  const holdHours = settings?.paymentHoldHours || 2;
  const holdShort = `${holdHours}h`;
  const holdLong = `${holdHours} heure${holdHours > 1 ? "s" : ""}`;
  const isHoldTimedOut =
    booking.status === "PENDING_PAYMENT" &&
    !booking.depositDeclared &&
    Boolean(booking.holdExpiresAt) &&
    new Date(booking.holdExpiresAt).getTime() < Date.now();
  const effectiveStatus = isHoldTimedOut ? "EXPIRED" : booking.status;

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
          label: booking.depositDeclared
            ? `Acompte de ${formattedDeposit} déclaré • Vérification admin`
            : `Approuvée - Acompte de ${formattedDeposit} sous ${holdShort}`,
          color: booking.depositDeclared
            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
            : "bg-amber-50 text-amber-900 border-amber-300",
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
          label: `Délai de ${holdShort} expiré`,
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

  const badge = getStatusBadge(effectiveStatus);

  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <BookingRefPersister booking={booking} />
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
          {effectiveStatus === "PENDING_APPROVAL" && (
            <div className="p-4 rounded-xl bg-creme border border-beige text-xs text-stone-700 space-y-2">
              <span className="font-semibold text-brun block">
                Examen manuel par la coiffeuse en cours
              </span>
              <p className="font-light leading-relaxed">
                Votre demande a bien été transmise. Dès que Maydie valide le créneau, vous disposerez d&apos;un <strong>délai strict de {holdLong}</strong> pour régler l&apos;acompte obligatoire de {formattedDeposit} et finaliser votre réservation.
              </p>
              <div className="pt-2 border-t border-beige text-[11px] text-stone-500 flex flex-wrap gap-2 items-center">
                <span className="font-medium text-brun">Moyens acceptés :</span>
                {(enabledMethodLabels.length > 0
                  ? enabledMethodLabels
                  : ["Wero / Paylib", "Revolut", "PayPal"]
                ).map((label) => (
                  <span
                    key={label}
                    className="bg-white px-2 py-0.5 rounded border border-beige"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {effectiveStatus === "PENDING_PAYMENT" && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-3">
              <span className="font-bold text-sm block">
                Demande validée : versez votre acompte de {formattedDeposit}
              </span>
              <p className="font-light leading-relaxed">
                Votre créneau est pré-réservé. <strong>Il n&apos;y a aucun paiement par carte en ligne sur le site</strong> : réglez l&apos;acompte de {formattedDeposit} en direct via {enabledMethodsSummary} dans un <strong>délai strict de {holdLong}</strong>, puis prévenez YDM Coiffure pour confirmation immédiate.
              </p>

              <DepositPaymentOptions
                bookingReference={booking.bookingReference}
                customerName={booking.customer.firstName}
                depositAmount={booking.depositAmount ?? 10}
                holdHours={holdHours}
                initialDeclared={Boolean(booking.depositDeclared)}
                initialMethod={booking.depositDeclaredMethod || ""}
                initialRejectionReason={booking.depositRejectionReason || ""}
                paymentAccounts={paymentAccounts}
                salonPhone={settings?.phone || paymentAccounts.weroPhone || "07 67 66 38 69"}
                salonInstagram={settings?.instagram || "@ydm_coiffure"}
                appointmentDate={formatDateFrench(booking.date)}
                appointmentTime={booking.startTime}
              />
            </div>
          )}

          {effectiveStatus === "EXPIRED" && (
            <div className="p-5 rounded-2xl bg-stone-100 border border-stone-300 text-xs text-stone-800 space-y-2.5">
              <span className="font-bold text-sm block text-brun">
                Délai de {holdLong} expiré
              </span>
              <p className="font-light leading-relaxed text-stone-600">
                L&apos;acompte n&apos;ayant pas été versé ni déclaré dans le délai imparti, ce créneau a été automatiquement remis en ligne. Vous pouvez sélectionner une nouvelle disponibilité directement depuis notre agenda.
              </p>
              <Link
                href="/reserver"
                className="inline-flex items-center space-x-1.5 bg-brun text-creme px-4 py-2 rounded-full font-semibold text-xs hover:bg-brun-dark transition-colors"
              >
                <span>Choisir un autre créneau</span>
                <ArrowRight className="w-3.5 h-3.5 text-champagne" />
              </Link>
            </div>
          )}

          {effectiveStatus === "REJECTED" && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950 space-y-2.5">
              <span className="font-bold text-sm block">
                Demande non retenue
              </span>
              <p className="font-light leading-relaxed">
                {booking.rejectionReason ||
                  "Ce créneau n'a pas pu être validé. Vous êtes invitée à choisir une autre date disponible."}
              </p>
              <Link
                href="/reserver"
                className="inline-flex items-center space-x-1.5 bg-brun text-creme px-4 py-2 rounded-full font-semibold text-xs hover:bg-brun-dark transition-colors"
              >
                <span>Voir d&apos;autres créneaux</span>
                <ArrowRight className="w-3.5 h-3.5 text-champagne" />
              </Link>
            </div>
          )}

          {effectiveStatus === "CANCELLED" && (
            <div className="p-5 rounded-2xl bg-stone-100 border border-stone-300 text-xs text-stone-800 space-y-2.5">
              <span className="font-bold text-sm block text-brun">
                Rendez-vous annulé
              </span>
              <p className="font-light leading-relaxed text-stone-600">
                {booking.cancellationReason ||
                  "Ce rendez-vous a été annulé et le créneau a été libéré."}
              </p>
              <Link
                href="/reserver"
                className="inline-flex items-center space-x-1.5 bg-brun text-creme px-4 py-2 rounded-full font-semibold text-xs hover:bg-brun-dark transition-colors"
              >
                <span>Prendre un nouveau rendez-vous</span>
                <ArrowRight className="w-3.5 h-3.5 text-champagne" />
              </Link>
            </div>
          )}

          {effectiveStatus === "CONFIRMED" && (
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
                  {formattedDeposit}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Solde restant sur place :</span>
                <span className="font-semibold text-brun">
                  {formatPrice(booking.remainingBalance)} (Wero, Revolut, PayPal, virement, espèces)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-stone-500 hover:text-brun underline"
              >
                Retour à l&apos;accueil
              </Link>
              <Link
                href="/suivi"
                className="text-stone-500 hover:text-brun underline"
              >
                Mes réservations
              </Link>
            </div>
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
