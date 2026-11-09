"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-brun-dark text-creme flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brun rounded-3xl p-8 sm:p-10 border border-brun-light/60 shadow-2xl space-y-8">
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
          <p className="text-xs text-beige-light/70 font-light pt-2">
            Connectez-vous pour gérer vos rendez-vous, vos disponibilités et votre activité.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-beige block mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ydm-coiffure.fr"
                className="w-full bg-brun-dark/80 border border-brun-light rounded-xl px-4 py-3 text-sm text-creme placeholder:text-beige-light/40 focus:outline-none focus:border-champagne"
              />
              <Mail className="w-4 h-4 text-beige-light/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-beige block mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-brun-dark/80 border border-brun-light rounded-xl px-4 py-3 text-sm text-creme placeholder:text-beige-light/40 focus:outline-none focus:border-champagne"
              />
              <Lock className="w-4 h-4 text-beige-light/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-champagne hover:bg-champagne-dark text-brun-dark py-3.5 rounded-full font-semibold text-sm transition-all shadow-md disabled:opacity-50"
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
            className="text-xs text-beige-light/60 hover:text-champagne transition-colors"
          >
            ← Retourner sur le site public
          </Link>
        </div>
      </div>
    </div>
  );
}
