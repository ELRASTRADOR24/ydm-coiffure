export const metadata = {
  title: "Conditions Générales & Règlement Intérieur | YDM Coiffure",
  description:
    "Modalités d'acompte, de retard, de modification et d'annulation chez YDM Coiffure (@ydm_coiffure) à La Roche-sur-Yon.",
};

export default function ConditionsReservationPage() {
  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-beige space-y-6">
          <div className="border-b border-beige pb-4">
            <span className="text-[10px] uppercase tracking-wider text-champagne-dark font-bold">
              Règlement Officiel • YDM Coiffure (@ydm_coiffure)
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun mt-1">
              Conditions de Réservation & Règlement Intérieur
            </h1>
          </div>

          <div className="space-y-5 text-xs text-stone-700 leading-relaxed font-light">
            <section className="space-y-1.5">
              <h2 className="font-serif text-base font-bold text-brun">
                1. Acompte et délai strict de 2 heures
              </h2>
              <p>
                Toute demande soumise sur le site est examinée manuellement par la coiffeuse.
                Dès validation, un lien de paiement sécurisé est transmis à la cliente.
              </p>
              <p className="font-medium text-brun">
                La cliente dispose d'un délai strict de 2 heures maximum pour verser l'acompte obligatoire de 10 € (non remboursable, sauf en cas d'annulation de la part de la coiffeuse).
              </p>
              <p>
                Si l'acompte n'est pas réglé avant l'expiration de ces 2 heures, le créneau est automatiquement libéré et remis en ligne.
              </p>
            </section>

            <section className="space-y-1.5 pt-3 border-t border-beige">
              <h2 className="font-serif text-base font-bold text-brun">
                2. Anticipation pour les mèches incluses
              </h2>
              <p>
                Pour toute prestation avec mèches incluses (fournies par la coiffeuse, comprenant l'achat et le déplacement), il est exigé de réserver au moins 1 semaine à l'avance. Une confirmation est demandée la veille du rendez-vous.
              </p>
            </section>

            <section className="space-y-1.5 pt-3 border-t border-beige">
              <h2 className="font-serif text-base font-bold text-brun">
                3. Modification et annulation
              </h2>
              <p>
                Une modification de créneau est possible jusqu'à 48 heures avant le rendez-vous. En cas d'annulation par la cliente ou de non-présentation, l'acompte de 10 € reste acquis et ne pourra donner lieu à aucun remboursement.
              </p>
            </section>

            <section className="space-y-1.5 pt-3 border-t border-beige">
              <h2 className="font-serif text-base font-bold text-brun">
                4. Retards et tolérance
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Jusqu'à 20 minutes de retard : toléré sans pénalité.</li>
                <li>De 20 à 30 minutes de retard : supplément de +5 €.</li>
                <li>À partir de 30 minutes de retard : supplément de +10 €.</li>
                <li>À partir d'1 heure de retard : le rendez-vous est automatiquement annulé et l'acompte est perdu.</li>
              </ul>
            </section>

            <section className="space-y-1.5 pt-3 border-t border-beige">
              <h2 className="font-serif text-base font-bold text-brun">
                5. Préparation des cheveux et accompagnateur
              </h2>
              <p>
                La cliente doit impérativement venir les cheveux propres, lavés et soigneusement démêlés des racines aux pointes.
              </p>
              <p>
                Pour préserver la tranquillité du lieu, 1 seul accompagnateur est autorisé lors de la séance, sous condition de prévenir la coiffeuse en amont.
              </p>
            </section>

            <section className="space-y-1.5 pt-3 border-t border-beige">
              <h2 className="font-serif text-base font-bold text-brun">
                6. Moyens de paiement acceptés
              </h2>
              <p>
                L'acompte de 10 € est réglé en ligne via la plateforme sécurisée. Le solde restant dû le jour de la prestation peut être réglé par :
              </p>
              <ul className="list-disc pl-5 space-y-0.5 font-medium text-brun">
                <li>Wero</li>
                <li>PayPal</li>
                <li>Virement instantané</li>
                <li>Espèces</li>
              </ul>
            </section>

            <section className="space-y-1.5 pt-3 border-t border-beige">
              <h2 className="font-serif text-base font-bold text-brun">
                7. Offre étudiante
              </h2>
              <p>
                Une réduction de 5 € est accordée sur les coiffures avec mèches incluses, valable exclusivement sur présentation d'une carte étudiante en cours de validité le jour du rendez-vous.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
