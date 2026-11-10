import Image from "next/image";
import { Wrench, Clock, Lock } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";

export default function MaintenanceView({ maintenance = {}, salonName = "YDM COIFFURE" }) {
  const badge = maintenance?.badge ?? "Maintenance en cours";
  const title = maintenance?.title ?? "Site temporairement en maintenance";
  const subtitle =
    maintenance?.subtitle ??
    "Nous effectuons actuellement une mise à jour pour améliorer votre expérience.";
  const message =
    maintenance?.message ??
    "L'accès aux pages publiques et à la prise de rendez-vous en ligne est momentanément suspendu le temps de notre intervention. Merci pour votre patience et votre compréhension.";
  const estimatedReturn = maintenance?.estimatedReturn ?? "";
  const showInstagram = maintenance?.showInstagram !== false;
  const rawHandle = (maintenance?.instagramHandle || "@ydm_coiffure").trim();
  const cleanHandle = rawHandle.replace(/^@/, "");
  const instagramLabel =
    maintenance?.instagramLabel || "Contacter YDM Coiffure sur Instagram";
  const ctaNote = maintenance?.ctaNote ?? "";
  const showAdminLink = maintenance?.showAdminLink !== false;

  return (
    <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-beige shadow-md p-8 sm:p-12 text-center space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-16 h-16">
            <Image
              src="/logo.png"
              alt={salonName}
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif text-xl font-bold tracking-wider text-brun">
            {salonName}
          </span>
        </div>

        {/* Badge */}
        {badge && (
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-champagne-light border border-champagne/60 text-brun-dark text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 text-champagne-dark" />
            <span>{badge}</span>
          </div>
        )}

        {/* Titre & Sous-titre */}
        <div className="space-y-3">
          {title && (
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-champagne-dark font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Message principal */}
        {message && (
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
            {message}
          </p>
        )}

        {/* Retour estimé */}
        {estimatedReturn && (
          <div className="inline-flex items-center space-x-2 bg-creme px-4 py-2.5 rounded-2xl border border-beige text-xs sm:text-sm text-brun font-medium">
            <Clock className="w-4 h-4 text-champagne-dark shrink-0" />
            <span>{estimatedReturn}</span>
          </div>
        )}

        {/* Instagram CTA */}
        {showInstagram && cleanHandle && (
          <div className="pt-4 border-t border-beige space-y-3">
            {ctaNote && (
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                {ctaNote}
              </p>
            )}
            <a
              href={`https://instagram.com/${cleanHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2.5 bg-brun hover:bg-brun-dark text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-sm transition-colors"
            >
              <InstagramIcon className="w-4 h-4 text-champagne" />
              <span>{instagramLabel}</span>
            </a>
          </div>
        )}

        {/* Accès Administrateur */}
        {showAdminLink && (
          <div className="pt-4">
            <a
              href="/admin/login"
              className="inline-flex items-center space-x-1.5 text-xs text-stone-400 hover:text-brun transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Espace Administrateur</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
