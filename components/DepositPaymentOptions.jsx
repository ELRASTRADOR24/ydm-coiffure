"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  Check,
  MessageCircle,
  Send,
  Phone,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  resolvePaymentAccounts,
  buildDepositConfirmationMessage,
  buildSalonSmsHref,
  buildInstagramProfileUrl,
} from "@/lib/adminHelpers";

export default function DepositPaymentOptions({
  bookingReference,
  customerName,
  depositAmount = 10,
  holdHours = 2,
  initialDeclared = false,
  initialMethod = "",
  initialRejectionReason = "",
  paymentAccounts = null,
  salonPhone = "07 67 66 38 69",
  salonInstagram = "@ydm_coiffure",
  appointmentDate = "",
  appointmentTime = "",
}) {
  const router = useRouter();
  const safeDeposit = Number.isFinite(Number(depositAmount))
    ? Number(depositAmount)
    : 10;
  const safeHoldHours =
    Number.isFinite(Number(holdHours)) && Number(holdHours) > 0
      ? Number(holdHours)
      : 2;
  const holdLong = `${safeHoldHours} heure${safeHoldHours > 1 ? "s" : ""}`;
  const formattedDeposit = `${safeDeposit} €`;
  const formattedDecimalDeposit = `${safeDeposit.toFixed(2).replace(".", ",")} €`;
  const accounts = resolvePaymentAccounts(
    paymentAccounts ? { paymentAccounts } : {}
  );
  const transferPhone = accounts.weroPhone || salonPhone || "07 67 66 38 69";
  const transferPhoneDigits =
    accounts.weroDigits || String(transferPhone).replace(/[^\d+]/g, "");
  const paypalUrl = accounts.paypalBaseUrl
    ? accounts.paypalBaseUrl.toLowerCase().includes("paypal.me/")
      ? `${accounts.paypalBaseUrl}/${safeDeposit}EUR`
      : accounts.paypalBaseUrl
    : "";
  const hasAnyMethod =
    accounts.weroEnabled || accounts.revolutEnabled || accounts.paypalEnabled;
  const [declared, setDeclared] = useState(initialDeclared);
  const [declaredMethod, setDeclaredMethod] = useState(initialMethod);
  const [rejectionReason, setRejectionReason] = useState(initialRejectionReason);
  const [loadingMethod, setLoadingMethod] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const quickMessage = buildDepositConfirmationMessage({
    bookingReference,
    customerName,
    depositAmount: safeDeposit,
    method: declaredMethod || (accounts.weroEnabled ? "Wero / Paylib" : "virement"),
    appointmentDate,
    appointmentTime,
  });
  const smsHref = buildSalonSmsHref(
    salonPhone || accounts.weroPhone || "07 67 66 38 69",
    quickMessage
  );
  const instagramHref = buildInstagramProfileUrl(salonInstagram || "@ydm_coiffure");
  const cleanInstaHandle = String(salonInstagram || "@ydm_coiffure").startsWith("@")
    ? String(salonInstagram || "@ydm_coiffure")
    : `@${salonInstagram}`;

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2500);
    } catch (_) {
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2500);
    }
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
        setRejectionReason("");
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

  const renderQuickMessageCard = (title, subtitle) => (
    <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 text-xs">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-champagne-light/70 text-brun flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4 text-champagne-dark" />
        </div>
        <div>
          <h4 className="font-bold text-brun text-xs sm:text-sm">{title}</h4>
          <p className="text-[11px] text-stone-600 font-light leading-relaxed mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-creme border border-beige text-[11px] text-stone-700 leading-relaxed italic">
        &laquo;&nbsp;{quickMessage}&nbsp;&raquo;
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {smsHref && (
          <a
            href={smsHref}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 bg-brun hover:bg-brun-dark text-creme py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-champagne shrink-0" />
            <span>Envoyer un SMS rapide</span>
          </a>
        )}
        <a
          href={instagramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
        >
          <span>Message Instagram ({cleanInstaHandle})</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
        <button
          type="button"
          onClick={() => copyToClipboard(quickMessage, "Le message")}
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-brun py-2.5 px-3.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-champagne-dark" />
          <span>Copier texte</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pt-1">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          {errorMessage}
        </div>
      )}

      {!declared && rejectionReason && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1.5 text-xs">
          <div className="flex items-center space-x-2 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Acompte non encore reçu sur notre compte</span>
          </div>
          <p className="font-light leading-relaxed text-rose-900/90">
            {rejectionReason}
          </p>
          <p className="text-[11px] font-medium text-rose-800">
            Vérifiez votre virement ci-dessous puis cliquez à nouveau sur «&nbsp;J&apos;ai payé mon acompte&nbsp;».
          </p>
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
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Acompte de {formattedDeposit} signalé ({declaredMethod || "Virement direct"})
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Actualiser le statut</span>
              </button>
            </div>
            <p className="text-xs text-stone-700 font-light leading-relaxed">
              La coiffeuse vient de recevoir un <strong>e-mail et un SMS</strong> indiquant que vous avez versé l&apos;acompte. Le compte à rebours automatique de {holdLong} est suspendu le temps qu&apos;elle vérifie son compte. Dès qu&apos;elle confirme la réception depuis son espace administrateur, votre fiche complète (avec <strong>l&apos;adresse privée du salon, la date et l&apos;heure</strong>) apparaîtra ici et vous sera envoyée par e-mail et SMS.
            </p>
          </div>

          {renderQuickMessageCard(
            "Pour être sûre qu'elle le voie tout de suite : envoyez-lui un message",
            "Envoyez un petit SMS ou message Instagram indiquant que vous avez payé votre acompte afin qu'elle vérifie et valide immédiatement :"
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Explication claire en 3 étapes : tout est externe au site */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200/80 text-xs text-stone-700 space-y-2.5">
            <div className="font-bold text-brun text-xs sm:text-sm">
              Comment régler l&apos;acompte (virement externe au site) :
            </div>
            <ol className="space-y-1.5 list-decimal list-inside font-light leading-relaxed text-stone-700">
              <li>
                Envoyez <strong>{formattedDeposit}</strong> en instantané via{" "}
                <strong>Wero / Paylib</strong>, <strong>Revolut</strong> ou{" "}
                <strong>PayPal</strong> avec son numéro{" "}
                <strong className="font-mono text-brun">{transferPhone}</strong>{" "}
                (ou les liens ci-dessous) et le motif{" "}
                <strong className="font-mono text-brun">{bookingReference}</strong>.
              </li>
              <li>
                Cliquez sur <strong>« J&apos;ai payé »</strong> ci-dessous pour que la coiffeuse reçoive aussitôt un{" "}
                <strong>e-mail et un SMS d&apos;alerte</strong> (et envoyez-lui un court message si vous voulez qu&apos;elle vérifie tout de suite).
              </li>
              <li>
                Dès qu&apos;elle vérifie son compte et <strong>valide dans l&apos;administrateur</strong>, vous recevez la fiche de confirmation avec{" "}
                <strong>l&apos;adresse privée, la date et l&apos;heure</strong>.
              </li>
            </ol>
          </div>

          {/* Rappel du montant, téléphone unique de virement et motif obligatoire */}
          <div className="p-4 rounded-2xl bg-creme border border-beige space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Montant strict de l&apos;acompte
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
                  className="font-mono text-sm font-bold text-brun bg-white border border-beige hover:border-champagne px-2.5 py-1 rounded-lg inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Cliquer pour copier la référence"
                >
                  <span>{bookingReference}</span>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            </div>

            {transferPhoneDigits && (
              <div className="pt-3 border-t border-beige/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                      Numéro unique (Wero, Revolut ou PayPal)
                    </span>
                    <span className="text-[11px] text-stone-600 font-light">
                      Utilisez ce numéro dans l&apos;appli de votre choix pour envoyer {formattedDeposit} en instantané
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(transferPhoneDigits, `Le numéro ${transferPhone}`)
                  }
                  className="min-h-[40px] font-mono text-sm font-bold text-brun bg-white border border-champagne/60 hover:border-brun px-3 py-1.5 rounded-xl inline-flex items-center justify-center space-x-2 transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  <span>{transferPhone}</span>
                  <Copy className="w-3.5 h-3.5 text-champagne-dark" />
                </button>
              </div>
            )}
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-brun">
            1. Choisissez votre compte de virement &amp; validez « J&apos;ai payé » :
          </div>

          {/* LISTE DES PLATEFORMES DIRECTES */}
          <div className="grid grid-cols-1 gap-3.5">
            {!hasAnyMethod && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 space-y-3 leading-relaxed">
                <p>
                  Effectuez un virement direct de <strong>{formattedDeposit}</strong> au numéro{" "}
                  <strong className="font-mono text-brun">{transferPhone}</strong> puis confirmez votre envoi ci-dessous.
                </p>
                <button
                  type="button"
                  disabled={Boolean(loadingMethod)}
                  onClick={() => handleDeclarePayment("Virement direct")}
                  className="w-full min-h-[44px] inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-creme py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 text-champagne" />
                  <span>
                    {loadingMethod
                      ? "Notification en cours..."
                      : "J'ai payé l'acompte (prévenir la coiffeuse)"}
                  </span>
                </button>
              </div>
            )}

            {/* 1. WERO / PAYLIB */}
            {accounts.weroEnabled && (
              <div className="p-4 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-400 transition-all shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                      W
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-bold text-xs text-stone-900">
                          Wero / Paylib (Virement bancaire direct)
                        </h4>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Recommandé
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-light block">
                        Depuis votre appli bancaire vers le {accounts.weroPhone}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accounts.weroDigits, "Le numéro Wero")}
                    className="text-[11px] font-mono font-bold text-brun bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded border border-stone-200 inline-flex items-center space-x-1 shrink-0 cursor-pointer"
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
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le {accounts.weroPhone}</span>
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(loadingMethod)}
                    onClick={() => handleDeclarePayment("Wero / Paylib")}
                    className="min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-creme hover:bg-champagne-light/70 text-brun border-2 border-champagne py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {loadingMethod === "Wero / Paylib"
                        ? "Envoi..."
                        : "J'ai payé mon acompte (Wero)"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. REVOLUT */}
            {accounts.revolutEnabled && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-brun/40 transition-all shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-stone-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      R
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">
                        Revolut (Par numéro ou lien direct)
                      </h4>
                      <span className="text-[11px] text-stone-500 font-light block">
                        Vers le {transferPhone} ou le compte {accounts.revolutTag} • Instantané
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accounts.revolutTag, "Le Revtag")}
                    className="text-[11px] font-mono text-stone-500 hover:text-brun inline-flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded border border-stone-200 shrink-0 cursor-pointer"
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
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center space-x-2 bg-stone-900 hover:bg-black text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Ouvrir Revolut &amp; verser {formattedDeposit}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    disabled={Boolean(loadingMethod)}
                    onClick={() => handleDeclarePayment("Revolut")}
                    className="min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-creme hover:bg-champagne-light/70 text-brun border-2 border-champagne py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {loadingMethod === "Revolut"
                        ? "Envoi..."
                        : "J'ai payé mon acompte (Revolut)"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. PAYPAL */}
            {accounts.paypalEnabled && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-blue-300 transition-all shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                      P
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">
                        PayPal (Par numéro ou lien direct &amp; {formattedDeposit})
                      </h4>
                      <span className="text-[11px] text-stone-500 font-light block">
                        Vers le {transferPhone} ou {accounts.paypalDisplayTag} • Choisir &quot;Entre proches&quot;
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paypalUrl, "Le lien PayPal")}
                    className="text-[11px] font-mono text-stone-500 hover:text-brun inline-flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded border border-stone-200 shrink-0 cursor-pointer"
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
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Ouvrir PayPal &amp; verser {formattedDeposit}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    disabled={Boolean(loadingMethod)}
                    onClick={() => handleDeclarePayment("PayPal")}
                    className="min-h-[44px] inline-flex items-center justify-center space-x-1.5 bg-creme hover:bg-champagne-light/70 text-brun border-2 border-champagne py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {loadingMethod === "PayPal"
                        ? "Envoi..."
                        : "J'ai payé mon acompte (PayPal)"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-brun pt-1">
            2. Prévenez la coiffeuse pour vérification rapide (optionnel si urgent) :
          </div>

          {renderQuickMessageCard(
            "Envoyer un message après votre virement",
            "Pour être sûre qu'elle le remarque tout de suite, vous pouvez aussi lui envoyer un court SMS ou message Instagram (en plus de cliquer sur « J'ai payé »)."
          )}

          {/* DELAI DE 2 HEURES REMINDER */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center space-x-2 text-[11px] text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Délai strict de {holdLong} :</strong> Après votre virement direct, cliquez sur «&nbsp;J&apos;ai payé&nbsp;» pour lui envoyer l&apos;e-mail de notification et bloquer votre créneau le temps de sa vérification.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
