export const metadata = {
  title: "Mentions Légales | YDM Coiffure",
  description: "Mentions légales de l'entreprise YDM Coiffure.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-beige shadow-sm space-y-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
            Mentions Légales
          </h1>
          <p className="text-xs text-champagne-dark font-semibold uppercase tracking-wider">
            Dernière mise à jour : Février 2026
          </p>

          <section className="space-y-3 text-sm text-brun-muted leading-relaxed font-light">
            <h2 className="font-serif text-xl font-bold text-brun">
              1. Éditeur de l'application et du site
            </h2>
            <p>
              Le site <strong>YDM Coiffure</strong> est édité par l'entreprise individuelle YDM Coiffure, immatriculée au Registre du Commerce et des Sociétés sous le régime de l'auto-entreprise.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Responsable de la publication :</strong> Yasmine D.</li>
              <li><strong>Contact & Support :</strong> Instagram @ydm_coiffure</li>
              <li><strong>Siège d'exercice :</strong> La Roche-sur-Yon (85000), France (adresse privée communiquée après validation de réservation)</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-brun-muted leading-relaxed font-light">
            <h2 className="font-serif text-xl font-bold text-brun">
              2. Hébergement
            </h2>
            <p>
              Le site est hébergé par la société <strong>Vercel Inc.</strong>, située au 340 S Lemon Ave #4133 Walnut, CA 91789, USA.
            </p>
          </section>

          <section className="space-y-3 text-sm text-brun-muted leading-relaxed font-light">
            <h2 className="font-serif text-xl font-bold text-brun">
              3. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble des contenus graphiques, photographies, textes, identité visuelle et éléments techniques composant ce site sont la propriété exclusive de YDM Coiffure. Toute reproduction, distribution ou diffusion sans autorisation préalable écrite est strictement interdite.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
