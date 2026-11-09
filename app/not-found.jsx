import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-40 pb-28 bg-creme min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        <span className="font-serif text-6xl sm:text-7xl font-bold text-champagne-dark">
          404
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
          Page introuvable
        </h1>
        <p className="text-sm text-brun-muted font-light leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-7 py-3 rounded-full text-xs font-medium transition-colors"
          >
            <span>Retour à l'accueil</span>
            <ArrowRight className="w-4 h-4 text-champagne" />
          </Link>
        </div>
      </div>
    </div>
  );
}
