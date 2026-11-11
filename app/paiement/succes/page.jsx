import { getBookingByReference, getSettings } from "@/lib/store";
import { getBookingStatusLabel } from "@/lib/adminHelpers";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  ArrowRight,
  AlertCircle,
  Clock,
} from "lucide-react";
import { formatPrice, formatDateFrench } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Confirmation de Réservation | YDM Coiffure",
};

export default async function PaymentSuccessPage({ searchParams }) {
  const { ref } = await searchParams;
  const booking = ref ? await getBookingByReference(String(ref)) : null;
  const isConfirmed = Boolean(booking && booking.status === "CONFIRMED");
  const settings = isConfirmed ? await getSettings() : null;

  if (!booking) {
    return (
      <div className="pt-32 pb-24 bg-creme min-h-screen">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-beige shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
                Dossier introuvable
              </h1>
              <p className="text-brun-muted text-sm font-light leading-relaxed">
                Aucune réservation confirmée n&apos;est associée à ce lien. L&apos;adresse exacte du salon est communiquée uniquement après validation et paiement de l&apos;acompte.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/reserver"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-7 py-3 rounded-full text-sm font-medium transition-colors"
              >
                <span>Prendre rendez-vous</span>
                <ArrowRight className="w-4 h-4 text-champagne" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-brun hover:bg-beige-light transition-colors border border-beige"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConfirmed) {
    return (
      <div className="pt-32 pb-24 bg-creme min-h-screen">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-200 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <div className="inline-block bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {getBookingStatusLabel(booking.status)}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
                Acompte non encore confirmé
              </h1>
              <p className="text-brun-muted text-sm font-light leading-relaxed">
                Le dossier <span className="font-mono font-bold text-brun">{booking.bookingReference}</span> n&apos;est pas encore au statut confirmé. Pour des raisons de confidentialité, l&apos;adresse privée du salon est débloquée uniquement une fois l&apos;acompte validé.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/reserver/statut/${booking.bookingReference}`}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-7 py-3 rounded-full text-sm font-medium transition-colors"
              >
                <span>Suivre &amp; régler mon dossier</span>
                <ArrowRight className="w-4 h-4 text-champagne" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-brun hover:bg-beige-light transition-colors border border-beige"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const depositMethodLabel = booking.depositDeclaredMethod
    ? `(${booking.depositDeclaredMethod})`
    : "(Wero, Revolut, PayPal ou espèces)";

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-champagne shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-block bg-creme border border-champagne text-brun-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Acompte validé avec succès
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
              Votre rendez-vous est bloqué !
            </h1>
            <p className="text-brun-muted text-sm sm:text-base font-light leading-relaxed">
              Nous avons bien reçu votre acompte. Votre créneau est désormais officiellement confirmé dans notre planning.
            </p>
          </div>

          <div className="bg-creme rounded-2xl p-6 border border-beige text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-beige">
              <span className="text-brun-muted">Référence :</span>
              <span className="font-bold text-brun">{booking.bookingReference}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-beige">
              <span className="text-brun-muted">Prestation :</span>
              <span className="font-semibold text-brun">{booking.service.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-beige">
              <span className="text-brun-muted">Date &amp; Heure :</span>
              <span className="font-semibold text-brun">
                {formatDateFrench(booking.date)} à {booking.startTime}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-beige">
              <span className="text-brun-muted">Acompte validé :</span>
              <span className="font-bold text-emerald-700">
                {formatPrice(booking.depositAmount)} {depositMethodLabel}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-brun-muted">Solde restant sur place :</span>
              <span className="font-bold text-brun">
                {formatPrice(booking.remainingBalance)}
              </span>
            </div>
          </div>

          {/* CONFIDENTIAL ADDRESS CARD — UNLOCKED ONLY WHEN CONFIRMED */}
          <div className="bg-beige-soft/60 rounded-2xl p-6 border border-champagne text-left space-y-3">
            <div className="flex items-center space-x-2 text-brun font-serif font-bold text-base">
              <MapPin className="w-5 h-5 text-champagne-dark" />
              <span>Adresse &amp; Accès au Cocon Privé</span>
            </div>
            <p className="text-sm font-semibold text-brun">
              {settings?.homeAddress?.street || "Quartier Centre-Gare"}<br />
              {settings?.homeAddress?.postalCode || "85000"} {settings?.homeAddress?.city || "La Roche-sur-Yon"}
            </p>
            <p className="text-xs text-brun-muted leading-relaxed font-light pt-1 border-t border-beige/60">
              {settings?.homeAddress?.accessNotes ||
                "L'adresse exacte et les consignes d'accès vous ont également été transmises par e-mail."}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/reserver/statut/${booking.bookingReference}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-7 py-3 rounded-full text-sm font-medium transition-colors"
            >
              <span>Voir ma réservation</span>
              <ArrowRight className="w-4 h-4 text-champagne" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-brun hover:bg-beige-light transition-colors border border-beige"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
