"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  Check,
} from "lucide-react";
import { resolvePaymentAccounts } from "@/lib/adminHelpers";

export default function DepositPaymentOptions({
  bookingReference,
  customerName,
  depositAmount = 10,
  holdHours = 2,
  initialDeclared = false,
  initialMethod = "",
  paymentAccounts = null,
}) {
  const safeDeposit = Number.isFinite(Number(depositAmount))
    ? Number(depositAmount)
    : 10;
  const safeHoldHours = Number.isFinite(Number(holdHours)) && Number(holdHours) > 0
    ? Number(holdHours)
    : 2;
  const holdLong = `${safeHoldHours} heure${safeHoldHours > 1 ? "s" : ""}`;
  const formattedDeposit = `${safeDeposit} €`;
  const formattedDecimalDeposit = `${safeDeposit.toFixed(2).replace(".", ",")} €`;
  const accounts = resolvePaymentAccounts(
    paymentAccounts ? { paymentAccounts } : {}
  );
  const paypalUrl = accounts.paypalBaseUrl
    ? accounts.paypalBaseUrl.toLowerCase().includes("paypal.me/")
      ? `${accounts.paypalBaseUrl}/${safeDeposit}EUR`
      : accounts.paypalBaseUrl
    : "";
  const hasAnyMethod =
    accounts.revolutEnabled || accounts.paypalEnabled || accounts.weroEnabled;
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
            <span>
              Acompte de {formattedDeposit} déclaré via {declaredMethod || "virement externe"}
            </span>
          </div>
          <p className="text-xs text-stone-600 font-light leading-relaxed">
            Votre déclaration de règlement externe a bien été transmise à l&apos;administrateur (Maydie). L&apos;expiration automatique de {holdLong} est suspendue le temps de la vérification. Dès que l&apos;administrateur confirme avoir bien reçu votre versement sur {declaredMethod || "son compte"}, votre rendez-vous passe en confirmé et l&apos;adresse exacte du salon à La Roche-sur-Yon vous est envoyée par e-mail et SMS.
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
                {formattedDecimalDeposit}
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

          {/* LISTE DES PLATEFORMES DIRECTES */}
          <div className="grid grid-cols-1 gap-3.5">
            {!hasAnyMethod && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 leading-relaxed">
                Aucun compte d&apos;acompte direct n&apos;est activé pour le moment. Merci de contacter directement YDM Coiffure pour finaliser votre versement.
              </div>
            )}

            {/* 1. REVOLUT */}
            {accounts.revolutEnabled && (
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
                        Vers le compte {accounts.revolutTag} • Gratuit &amp; instantané
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accounts.revolutTag, "Le Revtag")}
                    className="text-[11px] font-mono text-stone-500 hover:text-brun inline-flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded border border-stone-200"
                  >
                    <span>{accounts.revolutTag}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={accounts.revolutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-stone-900 hover:bg-black text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Ouvrir Revolut &amp; verser {formattedDeposit}</span>
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
                        ? "Envoi..."
                        : "J'ai payé sur Revolut"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. PAYPAL */}
            {accounts.paypalEnabled && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-blue-300 transition-all shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      P
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">
                        PayPal (Lien profil &amp; {formattedDeposit})
                      </h4>
                      <span className="text-[11px] text-stone-500 font-light block">
                        Profil direct {accounts.paypalDisplayTag} • Choisir &quot;Entre proches&quot;
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paypalUrl, "Le lien PayPal")}
                    className="text-[11px] font-mono text-stone-500 hover:text-brun inline-flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded border border-stone-200"
                  >
                    <span>Copier lien</span>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={paypalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Ouvrir PayPal &amp; verser {formattedDeposit}</span>
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
                        ? "Envoi..."
                        : "J'ai payé sur PayPal"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. WERO / PAYLIB */}
            {accounts.weroEnabled && (
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
                    onClick={() => copyToClipboard(accounts.weroDigits, "Le numéro Wero")}
                    className="text-[11px] font-mono font-bold text-brun bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded border border-stone-200 inline-flex items-center space-x-1"
                  >
                    <span>{accounts.weroPhone}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        accounts.weroDigits,
                        `Le numéro ${accounts.weroPhone}`
                      )
                    }
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le {accounts.weroPhone}</span>
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
                        ? "Envoi..."
                        : "J'ai envoyé via Wero"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DELAI DE 2 HEURES REMINDER */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center space-x-2 text-[11px] text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Délai strict de {holdLong} :</strong> Après votre virement externe, cliquez sur «&nbsp;J&apos;ai payé&nbsp;» pour prévenir l&apos;administrateur et maintenir votre créneau réservé jusqu&apos;à ce qu&apos;il valide avoir bien reçu l&apos;acompte.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
