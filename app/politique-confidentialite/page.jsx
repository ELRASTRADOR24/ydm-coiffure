export const metadata = {
  title: "Politique de Confidentialité (RGPD) | YDM Coiffure",
  description: "Politique de protection des données personnelles de YDM Coiffure.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-beige shadow-sm space-y-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
            Politique de Confidentialité & RGPD
          </h1>
          <p className="text-xs text-champagne-dark font-semibold uppercase tracking-wider">
            Conformité Règlement Général sur la Protection des Données (RGPD)
          </p>

          <section className="space-y-3 text-sm text-brun-muted leading-relaxed font-light">
            <h2 className="font-serif text-xl font-bold text-brun">
              1. Collecte minimale des données
            </h2>
            <p>
              Dans le cadre de la prise de rendez-vous en ligne, nous collectons exclusivement les données strictement nécessaires au bon déroulement de votre prestation :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prénom et Nom</li>
              <li>Adresse e-mail (pour l'envoi des confirmations et du lien de paiement)</li>
              <li>Numéro de téléphone (pour les rappels et instructions d'arrivée)</li>
              <li>Notes éventuelles relatives à votre cuir chevelu ou texture</li>
            </ul>
            <p>
              Nous ne créons aucun profilage publicitaire et ne revendons jamais vos informations à des tiers.
            </p>
          </section>

          <section className="space-y-3 text-sm text-brun-muted leading-relaxed font-light">
            <h2 className="font-serif text-xl font-bold text-brun">
              2. Traitement des paiements
            </h2>
            <p>
              Les règlements d'acomptes sont entièrement traités par notre partenaire certifié PCI-DSS <strong>Stripe</strong>. YDM Coiffure n'a aucun accès et ne conserve aucune coordonnée bancaire (numéro de carte, cryptogramme ou date d'expiration).
            </p>
          </section>

          <section className="space-y-3 text-sm text-brun-muted leading-relaxed font-light">
            <h2 className="font-serif text-xl font-bold text-brun">
              3. Durée de conservation & Vos droits
            </h2>
            <p>
              Conformément à la réglementation européenne, vous disposez d'un droit d'accès, de rectification et de suppression totale de vos données. Pour toute demande, il vous suffit de nous adresser un message privé sur notre compte Instagram officiel <strong>@ydm_coiffure</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
