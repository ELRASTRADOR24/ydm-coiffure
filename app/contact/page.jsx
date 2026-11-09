import {
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import Link from "next/link";

export const metadata = {
  title: "Contact & Informations Pratiques | YDM Coiffure",
  description:
    "Coordonnées, horaires, règlements et consignes d'arrivée chez YDM Coiffure à La Roche-sur-Yon.",
};

export default function ContactPage() {
  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-champagne-dark">
            La Roche-sur-Yon
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
            Contact & Informations
          </h1>
          <p className="text-brun-muted text-xs sm:text-sm font-light">
            Consignes d'accès, horaires et règles d'accueil.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5">
            {/* Confidential Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-beige space-y-3">
              <div className="w-10 h-10 rounded-xl bg-creme flex items-center justify-center text-champagne-dark">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-brun">
                Localisation
              </h2>
              <p className="text-xs text-brun-muted leading-relaxed font-light">
                La Roche-sur-Yon (85000), Vendée.
              </p>
              <div className="p-3.5 bg-creme rounded-xl border border-beige text-[11px] text-stone-600 leading-relaxed">
                <span className="font-semibold text-brun block mb-1">
                  Adresse confidentielle
                </span>
                Le numéro exact et les instructions d'arrivée vous sont délivrés automatiquement par e-mail après validation et versement de l'acompte de 10 €.
              </div>
            </div>

            {/* Coordinates */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-beige space-y-4">
              <h3 className="font-serif text-lg font-bold text-brun">
                Coordonnées
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-2.5 text-brun-muted">
                  <Clock className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-brun">Disponibilités & Créneaux</span>
                    <div className="font-light">Lundi au Dimanche (7j/7) : selon planning en ligne</div>
                    <div className="text-[11px] text-stone-500 font-light mt-0.5">
                      Horaires flexibles adaptés au planning de la coiffeuse étudiante. Chaque demande est validée manuellement.
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-brun-muted">
                  <InstagramIcon className="w-4 h-4 text-champagne-dark shrink-0" />
                  <div>
                    <span className="font-medium text-brun">Support Client & Doutes</span>
                    <div>
                      <a
                        href="https://instagram.com/ydm_coiffure"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-champagne font-mono font-bold text-brun transition-colors"
                      >
                        @ydm_coiffure
                      </a>
                      <div className="text-[11px] text-stone-500 font-light mt-0.5">
                        Pour toute question ou information sur une prestation, contactez-nous directement en message privé sur Instagram.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-champagne-light/40 border border-champagne/30 text-[11px] text-stone-600 leading-relaxed space-y-1">
                  <span className="font-bold text-brun block">Confidentialité du salon :</span>
                  <p>
                    L'adresse exacte à La Roche-sur-Yon et les consignes d'accès sont strictement privées et vous seront transmises par e-mail officiel dès validation de votre acompte de réservation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: House Rules & Requirements */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige space-y-5">
              <h2 className="font-serif text-xl font-bold text-brun">
                Règlement Intérieur & Préparation
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-creme border border-beige/60 space-y-1">
                  <span className="font-semibold text-brun block">
                    1. Acompte & Délai strict de 2 heures
                  </span>
                  <p className="text-brun-muted font-light leading-relaxed">
                    Un acompte de 10 € (non remboursable) est exigé dans les 2 heures suivant la validation de votre demande pour confirmer le créneau. Passé ce délai, le créneau est automatiquement libéré.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-creme border border-beige/60 space-y-1">
                  <span className="font-semibold text-brun block">
                    2. Retards & Tolérance
                  </span>
                  <p className="text-brun-muted font-light leading-relaxed">
                    Tolérance de 20 minutes maximum. De 20 à 30 minutes de retard : supplément de +5 €. À partir de 30 minutes : supplément de +10 €. Au-delà d'1 heure de retard : le rendez-vous est annulé et l'acompte est perdu.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-creme border border-beige/60 space-y-1">
                  <span className="font-semibold text-brun block">
                    3. Préparation le jour J
                  </span>
                  <p className="text-brun-muted font-light leading-relaxed">
                    Merci d'arriver les cheveux propres, lavés et soigneusement démêlés des racines aux pointes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-creme border border-beige/60 space-y-1">
                  <span className="font-semibold text-brun block">
                    4. Accompagnateur
                  </span>
                  <p className="text-brun-muted font-light leading-relaxed">
                    Un seul accompagnateur est autorisé lors de votre rendez-vous, sous réserve de prévenir en amont.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-creme border border-beige/60 space-y-1">
                  <span className="font-semibold text-brun block">
                    5. Moyens de paiement acceptés
                  </span>
                  <p className="text-brun-muted font-light leading-relaxed">
                    Le solde restant sur place est accepté en Wero, PayPal, virement bancaire ou espèces.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href="/reserver"
                  className="inline-flex items-center space-x-1.5 bg-nude hover:bg-nude-dark text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                >
                  <span>Prendre rendez-vous</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
