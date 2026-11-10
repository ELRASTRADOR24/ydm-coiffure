import Link from "next/link";
import { ArrowLeft, EyeOff } from "lucide-react";

export default function HiddenPageNotice({ notice = {} }) {
  const eyebrow = notice?.eyebrow ?? "Information";
  const title = notice?.title ?? "Cette page est actuellement masquée";
  const message =
    notice?.message ??
    "Ce contenu n'est pas affiché pour le moment. Vous pouvez revenir à l'accueil ou consulter nos créneaux disponibles.";
  const buttonText = notice?.buttonText ?? "Retour à l'accueil";

  return (
    <div className="pt-36 pb-24 bg-creme min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-beige p-8 sm:p-10 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-creme border border-beige flex items-center justify-center mx-auto text-champagne-dark">
          <EyeOff className="w-5 h-5" />
        </div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-champagne-dark">
            {eyebrow}
          </p>
        )}
        {title && (
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
            {title}
          </h1>
        )}
        {message && (
          <p className="text-sm text-stone-600 leading-relaxed">{message}</p>
        )}
        {buttonText && (
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-white px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-champagne" />
              <span>{buttonText}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
