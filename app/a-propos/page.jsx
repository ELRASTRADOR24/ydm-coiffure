import Image from "next/image";
import Link from "next/link";
import { Heart, GraduationCap, ShieldCheck, ArrowRight, Calendar } from "lucide-react";

export const metadata = {
  title: "À propos | YDM Coiffure",
  description:
    "Moi c'est Maydie, coiffeuse passionnée par le cheveu texturé à La Roche-sur-Yon. Étudiante, je tresse sur mes temps libres pour exprimer mon savoir-faire et financer mes études.",
};

export default function AProposPage() {
  return (
    <div className="pt-28 pb-20 bg-creme min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* En-tête typographique épuré */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-champagne-dark">
            Mon parcours &bull; La Roche-sur-Yon
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brun leading-tight">
            À propos de moi
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-normal">
            Moi, c&apos;est Maydie. Étudiante à La Roche-sur-Yon et passionnée par la coiffure afro.
          </p>
        </div>

        {/* Bloc Principal Portrait & Récit */}
        <div className="bg-white rounded-3xl border border-beige p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Colonne Visuel */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-beige bg-beige-light shadow-sm">
                <Image
                  src="/images/realisations/IMG_3401_still.jpeg"
                  alt="Coiffure et tresses afro YDM Coiffure à La Roche-sur-Yon"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>

            {/* Colonne Récit */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-4 text-stone-700 text-base leading-relaxed font-normal">
                <p>
                  Moi, c&apos;est Maydie. Je suis étudiante ici à La Roche-sur-Yon, et la coiffure, c&apos;est ce qui me fait vibrer depuis toujours.
                </p>
                <p>
                  Je me suis lancée là-dedans tout simplement par passion pour le cheveu texturé : j&apos;ai toujours aimé tresser, sublimer chaque personne, créer des séparations nettes et soigner chaque détail. En parallèle de mes études, coiffer sur mes temps libres me permet de vivre pleinement cette passion tout en finançant mon quotidien d&apos;étudiante en toute indépendance.
                </p>
                <p>
                  Ici, vous n&apos;êtes pas dans un grand salon impersonnel ni dans un travail à la chaîne : je vous accueille directement chez moi, en toute simplicité et en toute tranquillité. Quand vous venez, je prends le temps nécessaire pour vous : des tracés propres, des finitions impeccables, et surtout une attention constante pour préserver vos longueurs et respecter votre cuir chevelu, sans douleur ni tiraillement excessif.
                </p>
                <p className="text-stone-600 text-sm italic bg-creme p-4 rounded-2xl border border-beige">
                  Comme je m&apos;organise autour de mes cours et de mes révisions, mes créneaux sont volontairement limités pour être 100 % disponible et attentive pour chacune de mes clientes.
                </p>
              </div>

              {/* Engagements & Valeurs */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-creme rounded-2xl border border-beige space-y-1">
                  <div className="font-bold text-brun flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-champagne-dark" />
                    <span>Cadre privé</span>
                  </div>
                  <div className="text-stone-500 font-light">
                    Accueil calme et convivial à domicile, sur rendez-vous.
                  </div>
                </div>

                <div className="p-3.5 bg-creme rounded-2xl border border-beige space-y-1">
                  <div className="font-bold text-brun flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-champagne-dark" />
                    <span>Tarif étudiante</span>
                  </div>
                  <div className="text-stone-500 font-light">
                    Réduction de -5 € sur présentation de votre carte.
                  </div>
                </div>

                <div className="p-3.5 bg-creme rounded-2xl border border-beige space-y-1">
                  <div className="font-bold text-brun flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-champagne-dark" />
                    <span>Finitions nettes</span>
                  </div>
                  <div className="text-stone-500 font-light">
                    Traçage soigné et respect absolu de votre cuir chevelu.
                  </div>
                </div>
              </div>

              {/* Liens d'action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/reserver"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-white px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4 text-champagne" />
                  <span>Demander un créneau</span>
                </Link>

                <Link
                  href="/prestations"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-creme hover:bg-beige text-brun border border-beige px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Voir mes prestations</span>
                  <ArrowRight className="w-3.5 h-3.5 text-champagne-dark" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
