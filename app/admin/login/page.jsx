"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Identifiants invalides.");
        setLoading(false);
      }
    } catch (err) {
      setError("Erreur de connexion.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell min-h-[100dvh] bg-brun-dark text-creme flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-brun rounded-3xl p-7 sm:p-10 border border-brun-light/60 shadow-2xl space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group space-y-2">
            <div className="relative w-16 h-16 mx-auto shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Logo YDM Coiffure"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-serif text-3xl font-bold tracking-wider text-champagne block">
                YDM COIFFURE
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-beige font-light mt-0.5">
                Espace Salon & Administration
              </span>
            </div>
          </Link>
          <p className="text-sm text-beige-light/70 font-light pt-2">
            Connectez-vous pour gérer vos rendez-vous, vos disponibilités et votre activité.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs sm:text-sm text-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="text-sm font-semibold text-beige block mb-1.5">
              Adresse e-mail
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ydm-coiffure.fr"
                className="w-full bg-brun-dark/80 border border-brun-light rounded-xl pl-4 pr-11 py-3 min-h-[48px] text-base text-creme placeholder:text-beige-light/40 focus:outline-none focus:border-champagne"
              />
              <Mail className="w-4 h-4 text-beige-light/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="text-sm font-semibold text-beige block mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-brun-dark/80 border border-brun-light rounded-xl pl-4 pr-12 py-3 min-h-[48px] text-base text-creme placeholder:text-beige-light/40 focus:outline-none focus:border-champagne"
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-beige-light/70 hover:text-champagne hover:bg-brun-light/40 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-champagne hover:bg-champagne-dark text-brun-dark min-h-[48px] py-3.5 rounded-full font-semibold text-base transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 text-brun-dark animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Accéder à mon espace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-4 text-sm text-beige-light/60 hover:text-champagne transition-colors"
          >
            ← Retourner sur le site public
          </Link>
        </div>
      </div>
    </div>
  );
}
