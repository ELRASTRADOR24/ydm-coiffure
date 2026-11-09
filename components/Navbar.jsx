"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageVisibility, setPageVisibility] = useState({
    prestations: true,
    galerie: true,
    contact: true,
  });
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.pageVisibility) {
          setPageVisibility(data.settings.pageVisibility);
        }
      })
      .catch(() => {});
  }, []);

  if (isAdmin) return null;

  const navLinks = [
    { label: "Accueil", href: "/" },
    ...(pageVisibility.prestations !== false
      ? [{ label: "Prestations & Tarifs", href: "/prestations" }]
      : []),
    ...(pageVisibility.galerie !== false
      ? [{ label: "Galerie", href: "/galerie" }]
      : []),
    ...(pageVisibility.contact !== false
      ? [{ label: "Conditions & Contact", href: "/contact" }]
      : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-creme/95 backdrop-blur-md shadow-xs border-b border-beige py-3"
          : "bg-creme/90 backdrop-blur-md border-b border-beige/60 py-3.5 sm:py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3 shrink-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Logo YDM Coiffure"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col items-start justify-center">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-brun group-hover:text-champagne-dark transition-colors leading-none">
                YDM COIFFURE
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium mt-1">
                La Roche-sur-Yon
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-9">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs tracking-wider uppercase transition-colors relative py-1.5 ${
                    isActive
                      ? "text-brun font-bold"
                      : "text-stone-600 hover:text-brun font-medium"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-champagne rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            <Link
              href="/reserver"
              className="inline-flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-xs hover:shadow transition-all active:scale-[0.98]"
            >
              <Calendar className="w-3.5 h-3.5 text-champagne" />
              <span>Demander un rdv</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-brun hover:bg-beige-light transition-colors"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-creme border-b border-beige px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm ${
                pathname === link.href
                  ? "bg-beige-soft text-brun font-bold"
                  : "text-brun-muted hover:text-brun hover:bg-beige-light font-medium"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/reserver"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-brun hover:bg-brun-dark text-white py-3 rounded-full text-xs font-semibold tracking-wider uppercase shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-champagne" />
              <span>Demander un rendez-vous</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
