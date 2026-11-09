import { getBookingByReference, getSettings } from "@/lib/store";
import Link from "next/link";
import { CheckCircle2, MapPin, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { formatPrice, formatDateFrench, formatDuration } from "@/lib/utils";

export const metadata = {
  title: "Paiement Réussi & Réservation Confirmée | YDM Coiffure",
};

export default async function PaymentSuccessPage({ searchParams }) {
  const { ref } = await searchParams;
  const booking = ref ? await getBookingByReference(ref) : null;
  const settings = await getSettings();

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-champagne shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-block bg-creme border border-champagne text-brun-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Paiement confirmé avec succès
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
              Votre rendez-vous est bloqué !
            </h1>
            <p className="text-brun-muted text-sm sm:text-base font-light leading-relaxed">
              Nous avons bien reçu votre acompte. Votre créneau est désormais officiellement confirmé dans notre planning.
            </p>
          </div>

          {booking && (
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
                <span className="text-brun-muted">Date & Heure :</span>
                <span className="font-semibold text-brun">
                  {formatDateFrench(booking.date)} à {booking.startTime}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-beige">
                <span className="text-brun-muted">Acompte payé :</span>
                <span className="font-bold text-emerald-700">
                  {formatPrice(booking.depositAmount)} (Reçu Stripe envoyé)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brun-muted">Solde restant sur place :</span>
                <span className="font-bold text-brun">
                  {formatPrice(booking.remainingBalance)}
                </span>
              </div>
            </div>
          )}

          {/* CONFIDENTIAL ADDRESS CARD */}
          <div className="bg-beige-soft/60 rounded-2xl p-6 border border-champagne text-left space-y-3">
            <div className="flex items-center space-x-2 text-brun font-serif font-bold text-base">
              <MapPin className="w-5 h-5 text-champagne-dark" />
              <span>Adresse & Accès au Cocon Privé</span>
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
            {booking && (
              <Link
                href={`/reserver/statut/${booking.bookingReference}`}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-7 py-3 rounded-full text-sm font-medium transition-colors"
              >
                <span>Voir ma réservation</span>
                <ArrowRight className="w-4 h-4 text-champagne" />
              </Link>
            )}
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-brun hover:bg-beige-light transition-colors border border-beige"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
