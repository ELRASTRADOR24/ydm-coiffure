"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  if (isAdmin) return null;

  const defaultConditions = [
    "Acompte : 10 € obligatoire sous 2h pour confirmer",
    "Paiements : Wero, PayPal, virement ou espèces",
    "Retard max : 20 min (1h = rdv annulé)",
    "Mèches incluses : prévenir 1 semaine à l'avance",
    "Réduction étudiante : -5 € avec mèches incluses",
  ];

  const footerConditions =
    Array.isArray(settings?.footerConditions) && settings.footerConditions.length > 0
      ? settings.footerConditions
      : defaultConditions;

  const footerNotice =
    settings?.footerNoticeText ||
    "Coiffeuse afro à La Roche-sur-Yon. Nattes, vanilles, knotless et coiffures protectrices sur mesure.";

  const showAPropos = settings?.pageVisibility?.aPropos !== false;

  return (
    <footer className="bg-brun-dark text-creme border-t border-brun-light pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo YDM Coiffure"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif text-2xl font-bold tracking-wider text-champagne">
                YDM COIFFURE
              </h3>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed font-normal">
              {footerNotice}
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a
                href="https://instagram.com/ydm_coiffure"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-brun flex items-center justify-center text-champagne hover:bg-champagne hover:text-brun transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <span className="text-xs text-stone-300 font-mono">@ydm_coiffure</span>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-champagne">
              Localisation
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                <span>La Roche-sur-Yon (85000)</span>
              </div>
              <div className="p-3 rounded-xl bg-brun border border-brun-light text-stone-300 text-[11px] leading-relaxed">
                <span className="font-semibold text-champagne block mb-1">
                  Adresse privée
                </span>
                L'adresse exacte et les consignes d'accès sont transmises par e-mail immédiatement après validation de l'acompte.
              </div>
            </div>
          </div>

          {/* Règle Acompte & Retards */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-champagne">
              Conditions Clés
            </h4>
            <ul className="space-y-2 text-xs text-stone-300 font-light">
              {footerConditions.map((condition, idx) => (
                <li key={idx}>{condition}</li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-champagne">
              Salon & Support Client
            </h4>
            <div className="space-y-2 text-xs text-stone-300 font-light">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-champagne shrink-0" />
                <span>Lun - Dim (7j/7) : selon créneaux au planning</span>
              </div>
              <div className="flex items-center space-x-2">
                <InstagramIcon className="w-3.5 h-3.5 text-champagne shrink-0" />
                <a
                  href="https://instagram.com/ydm_coiffure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne font-mono transition-colors"
                >
                  @ydm_coiffure (Support officiel)
                </a>
              </div>
              <p className="text-[11px] text-stone-400 pt-1 leading-relaxed">
                Salon privé à La Roche-sur-Yon. Adresse exacte et accès transmis exclusivement par e-mail après validation de l'acompte.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-brun-light flex flex-col md:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} YDM Coiffure. La Roche-sur-Yon.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {showAPropos && (
              <Link
                href="/a-propos"
                className="hover:text-champagne transition-colors"
              >
                À propos de moi
              </Link>
            )}
            <Link
              href="/mentions-legales"
              className="hover:text-champagne transition-colors"
            >
              Mentions Légales
            </Link>
            <Link
              href="/politique-confidentialite"
              className="hover:text-champagne transition-colors"
            >
              Confidentialité
            </Link>
            <Link
              href="/conditions-reservation"
              className="hover:text-champagne transition-colors"
            >
              Règlement Intérieur
            </Link>
            <Link
              href="/admin/login"
              className="text-champagne hover:underline font-medium border-l border-brun-light pl-4"
            >
              Espace Pro
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
