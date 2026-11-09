import Link from "next/link";
import { XCircle, ArrowRight, Calendar } from "lucide-react";

export const metadata = {
  title: "Paiement non finalisé | YDM Coiffure",
};

export default async function PaymentCancelPage({ searchParams }) {
  const { ref } = await searchParams;

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 border border-beige shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-brun">
              Paiement non finalisé
            </h1>
            <p className="text-xs text-brun-muted leading-relaxed font-light">
              La transaction d'acompte a été interrompue. Aucun montant n'a été débité de votre compte.
            </p>
          </div>

          {ref && (
            <div className="p-4 bg-creme rounded-2xl border border-beige text-xs text-brun-muted">
              Votre créneau pour la référence <strong>{ref}</strong> reste réservé temporairement. Vous pouvez réessayer le règlement.
            </div>
          )}

          <div className="pt-2 flex flex-col space-y-3">
            {ref ? (
              <Link
                href={`/reserver/statut/${ref}`}
                className="w-full inline-flex items-center justify-center space-x-2 bg-nude hover:bg-nude-dark text-white py-3.5 rounded-full text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Reprendre le paiement (acompte 10 €)</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            ) : (
              <Link
                href="/reserver"
                className="w-full inline-flex items-center justify-center space-x-2 bg-nude hover:bg-nude-dark text-white py-3.5 rounded-full text-xs font-semibold transition-colors shadow-xs"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Nouvelle réservation</span>
              </Link>
            )}

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center py-3 text-xs text-brun-muted hover:text-brun underline"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
