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
  Film,
  AlertTriangle,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function AdminSidebar({
  user,
  maintenanceEnabled = false,
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Prevent background scroll when drawer is open (without breaking layout width)
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overscrollBehavior = "contain";
    } else {
      document.body.style.overscrollBehavior = "";
    }
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, [mobileOpen]);

  // Si page de connexion, afficher le contenu plein écran sans barre
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const links = [
    { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { label: "Galerie & Vidéos", href: "/admin/gallery", icon: Film },
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
    <div className="admin-shell min-h-[100dvh] bg-stone-100 text-brun font-sans">
      {/* ============================================================ */}
      {/* 2. TIROIR TABLETTE PORTRAIT & MOBILE (DRAWER AVEC BACKDROP)  */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex overscroll-contain">
          {/* Backdrop sombre */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity overscroll-contain"
            aria-hidden="true"
          />

          {/* Tiroir coulissant */}
          <div className="relative w-80 max-w-[85vw] bg-brun text-creme z-50 p-5 sm:p-6 flex flex-col justify-between shadow-2xl border-r border-brun-light/50 h-[100dvh] overflow-y-auto overscroll-contain">
            <div className="space-y-5">
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
                    <span className="text-[10px] uppercase tracking-wider text-stone-300 block">
                      Espace Pro
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-stone-300 hover:text-creme hover:bg-brun-light/50 transition-colors cursor-pointer"
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

              {/* Liens de navigation tablette / mobile */}
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
                      className={`flex items-center space-x-3 px-4 min-h-[46px] rounded-xl text-sm font-medium tracking-wide transition-all ${
                        isActive
                          ? "bg-champagne text-brun-dark font-bold shadow-xs"
                          : "text-beige-light hover:text-creme hover:bg-brun-light/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brun-dark" : "text-champagne"}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Actions en bas du tiroir */}
            <div className="space-y-2 pt-6 border-t border-brun-light/40 text-sm pb-[env(safe-area-inset-bottom)]">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 min-h-[46px] text-beige-light/90 hover:text-champagne rounded-xl hover:bg-brun-light/30 transition-colors font-medium"
              >
                <span>Voir le site public</span>
                <ExternalLink className="w-4 h-4 text-champagne" />
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-4 min-h-[46px] text-red-300 hover:text-red-100 hover:bg-red-950/40 rounded-xl transition-colors text-left font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. BARRE FIXE SUR IPAD PAYSAGE & ORDINATEUR (>= 1024px)      */}
      {/* ============================================================ */}
      {desktopCollapsed ? (
        <div className="hidden lg:flex fixed top-4 left-4 z-40">
          <button
            type="button"
            onClick={() => setDesktopCollapsed(false)}
            className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 min-h-[44px] rounded-2xl shadow-lg border border-champagne/40 text-xs font-bold transition-all cursor-pointer"
            title="Afficher le menu latéral"
          >
            <PanelLeftOpen className="w-4 h-4 text-champagne" />
            <span>Menu</span>
          </button>
        </div>
      ) : (
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 h-[100dvh] bg-brun text-creme z-40 border-r border-brun-light/50 flex-col justify-between p-5 overflow-y-auto overscroll-contain">
          <div className="space-y-6">
            {/* Logo Salon + Bouton Replier pour iPad Paysage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Link href="/admin" className="flex items-center space-x-2.5 group min-w-0">
                  <div className="relative w-10 h-10 shrink-0 group-hover:scale-105 transition-transform">
                    <Image
                      src="/logo.png"
                      alt="Logo YDM Coiffure"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-serif text-lg font-bold tracking-wider text-champagne block leading-tight truncate">
                      YDM COIFFURE
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-beige-light/70 font-light">
                      Administration
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setDesktopCollapsed(true)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-beige-light/70 hover:text-champagne hover:bg-brun-light/50 transition-colors shrink-0 cursor-pointer"
                  title="Replier le menu pour avoir plus d'espace"
                  aria-label="Replier le menu latéral"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

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

            {/* Navigation Links */}
            <nav className="space-y-1">
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
                    className={`flex items-center space-x-3 px-3.5 min-h-[44px] rounded-xl text-sm font-medium tracking-wide transition-all ${
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

          {/* Actions en bas */}
          <div className="space-y-1.5 pt-5 border-t border-brun-light/40 text-sm">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 min-h-[44px] text-beige-light/90 hover:text-champagne rounded-xl hover:bg-brun-light/30 transition-colors font-medium"
            >
              <span>Voir le site public</span>
              <ExternalLink className="w-4 h-4 text-champagne" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3.5 min-h-[44px] text-red-300 hover:text-red-200 hover:bg-red-950/40 rounded-xl transition-colors text-left font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* 4. CONTENU PRINCIPAL (PLEINE LARGEUR SUR IPAD PORTRAIT)      */}
      {/* ============================================================ */}
      <div
        className={`${
          desktopCollapsed ? "lg:pl-0" : "lg:pl-64"
        } flex flex-col min-h-[100dvh] transition-[padding] duration-200`}
      >
        {/* Barre haute collante (< 1024px) : reste au-dessus sans jamais masquer le haut de page */}
        <header className="lg:hidden sticky top-0 left-0 right-0 min-h-16 shrink-0 bg-brun text-creme px-4 sm:px-6 flex items-center justify-between border-b border-brun-light/40 z-40 shadow-md pt-[env(safe-area-inset-top)]">
          <Link href="/admin" className="flex items-center space-x-2.5 min-h-[44px]">
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
              <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-champagne block leading-tight">
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
                className="inline-flex items-center space-x-1 px-3 min-h-[40px] rounded-full bg-red-600 text-white text-xs font-bold"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Maintenance</span>
              </Link>
            )}
            {/* Bouton Hamburger grand format tactile iPad / Mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 min-h-[44px] min-w-[44px] rounded-xl text-creme hover:text-champagne bg-brun-light/40 hover:bg-brun-light/70 border border-brun-light/60 transition-colors focus:outline-none focus:ring-2 focus:ring-champagne cursor-pointer"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline text-sm font-semibold">Menu</span>
            </button>
          </div>
        </header>

        <main
          className={`flex-1 px-4 sm:px-6 lg:px-8 pt-6 ${
            desktopCollapsed ? "lg:pt-16" : "lg:pt-8"
          } pb-12`}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
