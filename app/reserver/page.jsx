import { Suspense } from "react";
import { getServices } from "@/lib/store";
import BookingWizard from "@/components/BookingWizard";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Réservation en Ligne | YDM Coiffure",
  description:
    "Réservez votre séance de tresses africaines en ligne en quelques étapes simples. Validation personnalisée et paiement d'acompte sécurisé.",
};

export default async function ReserverPage() {
  const services = await getServices(true);

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="max-w-md mx-auto text-center py-20">
              <Sparkles className="w-8 h-8 text-champagne mx-auto animate-spin mb-4" />
              <div className="font-serif text-lg text-brun">
                Chargement de l'espace de réservation...
              </div>
            </div>
          }
        >
          <BookingWizard initialServices={services} />
        </Suspense>
      </div>
    </div>
  );
}
