"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import DepositPaymentOptions from "@/components/DepositPaymentOptions";

function PaymentSimulationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("ref");
  const amount = 10; // Acompte officiel strict de 10 €

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSimulatePayment = async () => {
    if (!ref) {
      setError("Référence de réservation manquante.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/paiement/succes?ref=${ref}&simulated=true`);
      } else {
        setError(data.error || "Erreur lors de la simulation.");
        setProcessing(false);
      }
    } catch (e) {
      setError("Erreur réseau.");
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige shadow-xs max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-full bg-champagne-light flex items-center justify-center text-champagne-dark mx-auto mb-2">
          <CreditCard className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-dark">
          Règlement Sécurisé de l'Acompte
        </span>
        <h1 className="font-serif text-2xl font-bold text-brun">
          Versement de l'acompte (10 €)
        </h1>
        <p className="text-xs text-stone-500 font-light leading-relaxed">
          Délai strict de 2 heures après approbation pour valider votre créneau à La Roche-sur-Yon.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BOUTONS DIRECTS REVOLUT, PAYPAL, WERO */}
      <DepositPaymentOptions
        bookingReference={ref || "DEMO-YDM"}
        customerName="Cliente"
      />

      {/* OPTION ALTERNATIVE : SIMULATION CARTE BANCAIRE DIRECTE */}
      <div className="pt-4 border-t border-beige">
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
          <div className="text-[11px] text-stone-500 font-medium">
            Ou valider par Carte Bancaire (Paiement immédiat 10 €) :
          </div>
          <button
            type="button"
            disabled={processing || !ref}
            onClick={handleSimulatePayment}
            className="w-full inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-white py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs"
          >
            {processing ? (
              <span>Traitement sécurisé en cours...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-champagne" />
                <span>Payer par Carte Bancaire (10 €)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          href={`/reserver/statut/${ref || ""}`}
          className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-brun transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retourner au suivi de mon dossier</span>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSimulationPage() {
  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="text-center py-20 text-xs text-stone-500">
              Chargement...
            </div>
          }
        >
          <PaymentSimulationContent />
        </Suspense>
      </div>
    </div>
  );
}
