"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_PAGE_VISIBILITY,
} from "@/lib/siteContent";

export default function Footer({ initialSettings = null }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    if (isAdmin) return;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, [isAdmin, pathname]);

  if (isAdmin) return null;

  const footerCfg =
    settings?.siteContent?.global?.footer ||
    DEFAULT_SITE_CONTENT.global.footer;

  if (footerCfg.visible === false) return null;

  const pageVis = settings?.pageVisibility || DEFAULT_PAGE_VISIBILITY;

  const rawConditions = Array.isArray(footerCfg.conditionsItems)
    ? footerCfg.conditionsItems
        .filter((c) => c && c.visible !== false && typeof c.text === "string" && c.text.trim() !== "")
        .map((c) => c.text)
    : Array.isArray(settings?.footerConditions)
    ? settings.footerConditions
    : DEFAULT_SITE_CONTENT.global.footer.conditionsItems.map((c) => c.text);

  const footerNotice =
    footerCfg.noticeText ??
    settings?.footerNoticeText ??
    DEFAULT_SITE_CONTENT.global.footer.noticeText;

  const igHandle = (footerCfg.instagramHandle || settings?.instagram || "@ydm_coiffure").trim();
  const igClean = igHandle.replace(/^@/, "");
  const linksLabels = footerCfg.linksLabels || DEFAULT_SITE_CONTENT.global.footer.linksLabels;

  const showAPropos = pageVis.aPropos !== false && Boolean(linksLabels.aPropos);
  const showMentions = pageVis.mentionsLegales !== false && Boolean(linksLabels.mentionsLegales);
  const showConfidentialite = pageVis.confidentialite !== false && Boolean(linksLabels.confidentialite);
  const showReglement = pageVis.reglement !== false && Boolean(linksLabels.reglement);
  const showAdminLink = footerCfg.adminLinkVisible !== false && Boolean(linksLabels.admin);

  return (
    <footer className="bg-brun-dark text-creme border-t border-brun-light pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          {footerCfg.brandVisible !== false && (
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
                {footerCfg.brandTitle && (
                  <h3 className="font-serif text-2xl font-bold tracking-wider text-champagne">
                    {footerCfg.brandTitle}
                  </h3>
                )}
              </div>
              {footerCfg.noticeVisible !== false && footerNotice && (
                <p className="text-stone-300 text-sm leading-relaxed font-normal">
                  {footerNotice}
                </p>
              )}
              {footerCfg.instagramVisible !== false && igHandle && (
                <div className="flex items-center space-x-3 pt-1">
                  <a
                    href={`https://instagram.com/${igClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-brun flex items-center justify-center text-champagne hover:bg-champagne hover:text-brun transition-all"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <span className="text-xs text-stone-300 font-mono">{igHandle}</span>
                </div>
              )}
            </div>
          )}

          {/* Localisation */}
          {footerCfg.locationVisible !== false && (
            <div className="space-y-4">
              {footerCfg.locationTitle && (
                <h4 className="text-xs font-semibold tracking-wider uppercase text-champagne">
                  {footerCfg.locationTitle}
                </h4>
              )}
              <div className="space-y-2 text-xs text-stone-300">
                {footerCfg.locationCity && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                    <span>{footerCfg.locationCity}</span>
                  </div>
                )}
                {footerCfg.privacyBoxVisible !== false &&
                  (footerCfg.privacyBoxTitle || footerCfg.privacyBoxText) && (
                    <div className="p-3 rounded-xl bg-brun border border-brun-light text-stone-300 text-[11px] leading-relaxed">
                      {footerCfg.privacyBoxTitle && (
                        <span className="font-semibold text-champagne block mb-1">
                          {footerCfg.privacyBoxTitle}
                        </span>
                      )}
                      {footerCfg.privacyBoxText}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Conditions Clés */}
          {footerCfg.conditionsVisible !== false && (
            <div className="space-y-4">
              {footerCfg.conditionsTitle && (
                <h4 className="text-xs font-semibold tracking-wider uppercase text-champagne">
                  {footerCfg.conditionsTitle}
                </h4>
              )}
              {rawConditions.length > 0 && (
                <ul className="space-y-2 text-xs text-stone-300 font-light">
                  {rawConditions.map((condition, idx) => (
                    <li key={idx}>{condition}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Contact & Support */}
          {footerCfg.contactVisible !== false && (
            <div className="space-y-4">
              {footerCfg.contactTitle && (
                <h4 className="text-xs font-semibold tracking-wider uppercase text-champagne">
                  {footerCfg.contactTitle}
                </h4>
              )}
              <div className="space-y-2 text-xs text-stone-300 font-light">
                {footerCfg.hoursText && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-champagne shrink-0" />
                    <span>{footerCfg.hoursText}</span>
                  </div>
                )}
                {footerCfg.supportLabel && (
                  <div className="flex items-center space-x-2">
                    <InstagramIcon className="w-3.5 h-3.5 text-champagne shrink-0" />
                    <a
                      href={`https://instagram.com/${igClean}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-champagne font-mono transition-colors"
                    >
                      {footerCfg.supportLabel}
                    </a>
                  </div>
                )}
                {footerCfg.supportNote && (
                  <p className="text-[11px] text-stone-400 pt-1 leading-relaxed">
                    {footerCfg.supportNote}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        {footerCfg.bottomBarVisible !== false && (
          <div className="pt-8 mt-8 border-t border-brun-light flex flex-col md:flex-row items-center justify-between text-xs text-stone-400 gap-4">
            {footerCfg.copyrightText ? (
              <p>
                © {new Date().getFullYear()} {footerCfg.copyrightText}
              </p>
            ) : (
              <div />
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
              <Link
                href="/suivi"
                className="min-h-[44px] inline-flex items-center hover:text-champagne transition-colors"
              >
                Suivre ma réservation
              </Link>
              {showAPropos && (
                <Link
                  href="/a-propos"
                  className="min-h-[44px] inline-flex items-center hover:text-champagne transition-colors"
                >
                  {linksLabels.aPropos}
                </Link>
              )}
              {showMentions && (
                <Link
                  href="/mentions-legales"
                  className="min-h-[44px] inline-flex items-center hover:text-champagne transition-colors"
                >
                  {linksLabels.mentionsLegales}
                </Link>
              )}
              {showConfidentialite && (
                <Link
                  href="/politique-confidentialite"
                  className="min-h-[44px] inline-flex items-center hover:text-champagne transition-colors"
                >
                  {linksLabels.confidentialite}
                </Link>
              )}
              {showReglement && (
                <Link
                  href="/conditions-reservation"
                  className="min-h-[44px] inline-flex items-center hover:text-champagne transition-colors"
                >
                  {linksLabels.reglement}
                </Link>
              )}
              {showAdminLink && (
                <a
                  href="/admin/login"
                  className="min-h-[44px] inline-flex items-center text-champagne hover:underline font-medium md:border-l md:border-brun-light md:pl-4"
                >
                  {linksLabels.admin}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Signature Créateur & Portfolio */}
        {footerCfg.creatorSignatureVisible !== false &&
          (footerCfg.creatorPrefix || footerCfg.creatorName) && (
            <div className="pt-6 mt-4 text-center">
              <p className="text-[10px] text-stone-500 tracking-wide">
                {footerCfg.creatorPrefix}{" "}
                {footerCfg.creatorUrl ? (
                  <a
                    href={footerCfg.creatorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-champagne transition-colors underline decoration-stone-600 underline-offset-2 font-medium"
                  >
                    {footerCfg.creatorName}
                  </a>
                ) : (
                  <span className="text-stone-400 font-medium">
                    {footerCfg.creatorName}
                  </span>
                )}
              </p>
            </div>
          )}
      </div>
    </footer>
  );
}
