"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BookmarkCheck,
  Scissors,
  Clock,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  FileText,
  AlertTriangle,
  Mail,
} from "lucide-react";

export default function AdminSidebar({
  user,
  maintenanceEnabled = false,
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  // Si page de connexion, afficher le contenu plein écran sans barre
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const links = [
    { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { label: "Contenu & Textes", href: "/admin/site-editor", icon: FileText },
    { label: "Cartes Mail & Gmail", href: "/admin/emails", icon: Mail },
    { label: "Calendrier", href: "/admin/calendar", icon: CalendarDays },
    { label: "Réservations", href: "/admin/bookings", icon: BookmarkCheck },
    { label: "Prestations", href: "/admin/services", icon: Scissors },
    { label: "Horaires & Dispos", href: "/admin/availability", icon: Clock },
    { label: "Fichier Clientes", href: "/admin/customers", icon: Users },
    { label: "Paramètres", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-100 text-brun font-sans">
      {/* ============================================================ */}
      {/* 1. BARRE MOBILE DU HAUT (3 TRAITS HAMBURGER)                */}
      {/* ============================================================ */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brun text-creme px-4 flex items-center justify-between border-b border-brun-light/40 z-40 shadow-md">
        <Link href="/admin" className="flex items-center space-x-2.5">
          <div className="relative w-8 h-8 shrink-0">
            <Image
              src="/logo.png"
              alt="Logo YDM Coiffure"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-wider text-champagne block leading-tight">
              YDM COIFFURE
            </span>
            <span className="text-[11px] uppercase tracking-wider text-stone-300 block">
              Administration
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          {maintenanceEnabled && (
            <Link
              href="/admin/site-editor?tab=maintenance"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Maintenance</span>
            </Link>
          )}
          {/* Bouton Hamburger 3 traits */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-creme hover:text-champagne hover:bg-brun-light/40 transition-colors focus:outline-none focus:ring-2 focus:ring-champagne"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. TIROIR MOBILE RÉTRACTABLE (DRAWER AVEC BACKDROP)         */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop sombre */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tiroir coulissant */}
          <div className="relative w-72 max-w-[85vw] bg-brun text-creme z-50 p-6 flex flex-col justify-between shadow-2xl border-r border-brun-light/50 h-full overflow-y-auto">
            <div className="space-y-6">
              {/* En-tête du tiroir avec Logo et bouton Fermer */}
              <div className="flex items-center justify-between pb-4 border-b border-brun-light/40">
                <div className="flex items-center space-x-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-champagne/40 bg-white shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Logo YDM Coiffure"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-serif text-lg font-bold tracking-wider text-champagne block leading-tight">
                      YDM COIFFURE
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-stone-300 block">
                      Espace Pro
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full text-stone-300 hover:text-creme hover:bg-brun-light/40 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {user && (
                <div className="p-3 rounded-xl bg-brun-light/30 border border-brun-light/40 text-xs text-beige-light">
                  Connectée : <strong className="text-creme">{user.name || "Yasmine D."}</strong>
                </div>
              )}

              {/* Liens de navigation mobile */}
              <nav className="space-y-1.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                        isActive
                          ? "bg-champagne text-brun-dark font-bold shadow-xs"
                          : "text-beige-light hover:text-creme hover:bg-brun-light/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-brun-dark" : "text-champagne"}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Actions en bas du tiroir mobile */}
            <div className="space-y-2 pt-6 border-t border-brun-light/40 text-sm">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 text-beige-light/90 hover:text-champagne rounded-xl hover:bg-brun-light/30 transition-colors font-medium"
              >
                <span>Voir le site public</span>
                <ExternalLink className="w-4 h-4 text-champagne" />
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3.5 py-3 text-red-300 hover:text-red-100 hover:bg-red-950/40 rounded-xl transition-colors text-left font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. BARRE FIXE SUR ORDINATEUR (STATIQUE AU DÉFILEMENT)        */}
      {/* ============================================================ */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 h-screen bg-brun text-creme z-40 border-r border-brun-light/50 flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-8">
          {/* Logo Salon */}
          <div className="space-y-3">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="relative w-11 h-11 shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Logo YDM Coiffure"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-wider text-champagne block leading-tight">
                  YDM COIFFURE
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-beige-light/70 font-light">
                  Espace Administrateur
                </span>
              </div>
            </Link>

            {user && (
              <div className="text-xs text-beige-light/80 pt-3 border-t border-brun-light/40">
                Connectée : <strong>{user.name || "Yasmine D."}</strong>
              </div>
            )}

            {maintenanceEnabled && (
              <Link
                href="/admin/site-editor?tab=maintenance"
                className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>MODE MAINTENANCE ACTIF</span>
              </Link>
            )}
          </div>

          {/* Navigation Links Desktop */}
          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                    isActive
                      ? "bg-champagne text-brun-dark font-bold shadow-xs"
                      : "text-beige-light/90 hover:text-creme hover:bg-brun-light/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brun-dark" : "text-champagne"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions en bas Desktop */}
        <div className="space-y-2 pt-6 border-t border-brun-light/40 text-sm">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 text-beige-light/90 hover:text-champagne rounded-xl hover:bg-brun-light/30 transition-colors font-medium"
          >
            <span>Voir le site public</span>
            <ExternalLink className="w-4 h-4 text-champagne" />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-red-300 hover:text-red-200 hover:bg-red-950/40 rounded-xl transition-colors text-left font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 4. CONTENU PRINCIPAL (DÉCALÉ À GAUCHE SUR DESKTOP, TOPBAR SUR MOBILE) */}
      {/* ============================================================ */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 md:p-10 pt-20 md:pt-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
