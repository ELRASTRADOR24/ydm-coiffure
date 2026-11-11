import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBookingByReference } from "@/lib/store";
import {
  BOOKING_REF_COOKIE,
  isValidBookingReference,
  normalizeBookingReference,
} from "@/lib/bookingPersistence";
import BookingLookupClient from "@/components/BookingLookupClient";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suivi de Réservation | YDM Coiffure",
  description:
    "Retrouvez facilement l'état de votre rendez-vous, versez votre acompte et consultez l'adresse privée du salon sans créer de compte.",
};

export default async function SuiviPage({ searchParams }) {
  const params = await searchParams;
  const queryRef = normalizeBookingReference(params?.ref || "");
  if (queryRef && isValidBookingReference(queryRef)) {
    redirect(`/reserver/statut/${encodeURIComponent(queryRef)}`);
  }

  const cookieStore = await cookies();
  const cookieRef = normalizeBookingReference(
    cookieStore.get(BOOKING_REF_COOKIE)?.value || ""
  );

  let initialBooking = null;
  if (cookieRef && isValidBookingReference(cookieRef)) {
    initialBooking = await getBookingByReference(cookieRef).catch(() => null);
  }

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-beige shadow-sm space-y-6">
          <div className="space-y-2 border-b border-beige pb-5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-champagne-dark block">
              Espace cliente sans compte
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
              Suivi de votre rendez-vous
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              Votre dossier reste mémorisé automatiquement sur votre téléphone ou navigateur même si vous actualisez la page. Vous pouvez aussi saisir votre référence reçue par SMS ou e-mail.
            </p>
          </div>

          <BookingLookupClient initialBooking={initialBooking} />

          <div className="pt-4 border-t border-beige flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <Link href="/" className="min-h-[44px] inline-flex items-center text-stone-500 hover:text-brun underline">
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/reserver"
              className="min-h-[44px] inline-flex items-center space-x-1.5 text-brun font-semibold hover:text-champagne-dark transition-colors"
            >
              <span>Prendre un autre rendez-vous</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
