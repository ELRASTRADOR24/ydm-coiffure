"use client";

import { useState } from "react";
import {
  Smartphone,
  CreditCard,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";

export default function DepositPaymentOptions({
  bookingReference,
  customerName,
  initialDeclared = false,
  initialMethod = "",
  stripeUrl = null,
}) {
  const [declared, setDeclared] = useState(initialDeclared);
  const [declaredMethod, setDeclaredMethod] = useState(initialMethod);
  const [loadingMethod, setLoadingMethod] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2500);
  };

  const handleDeclarePayment = async (method) => {
    setLoadingMethod(method);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/bookings/${bookingReference}/declare-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (data.success) {
        setDeclared(true);
        setDeclaredMethod(method);
      } else {
        setErrorMessage(
          data.error ||
            "Nous n'avons pas pu enregistrer votre confirmation pour l'instant. Vous pouvez réessayer dans quelques instants."
        );
      }
    } catch (e) {
      setErrorMessage(
        "La connexion a été interrompue. Merci de vérifier votre accès internet et de retenter."
      );
    } finally {
      setLoadingMethod("");
    }
  };

  return (
    <div className="space-y-4 pt-1">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* Toast de copie */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-brun text-creme text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-champagne/40 animate-fadeIn">
          {copiedText} copié dans le presse-papier !
        </div>
      )}

      {/* Confirmation si déjà déclaré */}
      {declared ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2.5">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Acompte de 10 € déclaré via {declaredMethod || "Virement"}</span>
          </div>
          <p className="text-xs text-stone-600 font-light leading-relaxed">
            Votre versement a bien été notifié à Maydie. Votre créneau est réservé et le compte à rebours de 2 heures est suspendu. Dès vérification bancaire, l'adresse exacte et privée du salon à La Roche-sur-Yon vous sera transmise par e-mail et SMS.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rappel du montant et du motif obligatoire */}
          <div className="p-4 rounded-2xl bg-creme border border-beige flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                Montant strict de l'acompte
              </span>
              <span className="font-serif text-xl font-bold text-champagne-dark">
                10,00 €
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                Motif obligatoire à indiquer
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(bookingReference, "Le motif")}
                className="font-mono text-sm font-bold text-brun bg-white border border-beige hover:border-champagne px-2.5 py-1 rounded-lg inline-flex items-center space-x-1.5 transition-colors"
                title="Cliquer pour copier la référence"
              >
                <span>{bookingReference}</span>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-brun">
            Choisissez votre moyen de versement immédiat :
          </div>

          {/* LISTE DES 3 PLATEFORMES DIRECTES */}
          <div className="grid grid-cols-1 gap-3.5">
            {/* 1. REVOLUT */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-brun/40 transition-all shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    R
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">
                      Revolut (Lien direct)
                    </h4>
                    <span className="text-[11px] text-stone-500 font-light block">
                      Vers le compte @ydmcoiffure • Gratuit & instantané
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("@ydmcoiffure", "Le Revtag")}
                  className="text-[11px] font-mono text-stone-500 hover:text-brun inline-flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded border border-stone-200"
                >
                  <span>@ydmcoiffure</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href="https://revolut.me/ydmcoiffure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-stone-900 hover:bg-black text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <span>Ouvrir Revolut & verser 10 €</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  disabled={Boolean(loadingMethod)}
                  onClick={() => handleDeclarePayment("Revolut")}
                  className="inline-flex items-center justify-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-3.5 rounded-xl text-xs font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {loadingMethod === "Revolut"
                      ? "Validation..."
                      : "J'ai payé sur Revolut"}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. PAYPAL */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-blue-300 transition-all shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    P
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">
                      PayPal (Lien profil & 10 €)
                    </h4>
                    <span className="text-[11px] text-stone-500 font-light block">
                      Profil direct @ydmcoiffure • Choisir &quot;Entre proches&quot;
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("https://paypal.me/ydmcoiffure/10EUR", "Le lien PayPal")}
                  className="text-[11px] font-mono text-stone-500 hover:text-brun inline-flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded border border-stone-200"
                >
                  <span>Copier lien</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href="https://paypal.me/ydmcoiffure/10EUR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <span>Ouvrir PayPal & verser 10 €</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  disabled={Boolean(loadingMethod)}
                  onClick={() => handleDeclarePayment("PayPal")}
                  className="inline-flex items-center justify-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-3.5 rounded-xl text-xs font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {loadingMethod === "PayPal"
                      ? "Validation..."
                      : "J'ai payé sur PayPal"}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. WERO / PAYLIB */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 transition-all shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    W
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">
                      Wero / Paylib (Par numéro de téléphone)
                    </h4>
                    <span className="text-[11px] text-stone-500 font-light block">
                      Depuis votre appli bancaire (Crédit Agricole, Bourso, BNP, SG...)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("0767663869", "Le numéro Wero")}
                  className="text-[11px] font-mono font-bold text-brun bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded border border-stone-200 inline-flex items-center space-x-1"
                >
                  <span>07 67 66 38 69</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard("0767663869", "Le numéro 07 67 66 38 69")}
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le 07 67 66 38 69</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(loadingMethod)}
                  onClick={() => handleDeclarePayment("Wero / Paylib")}
                  className="inline-flex items-center justify-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-3.5 rounded-xl text-xs font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {loadingMethod === "Wero / Paylib"
                      ? "Validation..."
                      : "J'ai envoyé via Wero"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* DELAI DE 2 HEURES REMINDER */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center space-x-2 text-[11px] text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Délai strict de 2 heures :</strong> Dès votre versement effectué, cliquez sur le bouton correspondant pour protéger votre créneau et bloquer l'heure dans l'agenda.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
