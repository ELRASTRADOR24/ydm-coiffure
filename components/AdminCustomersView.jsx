"use client";

import { useState, useEffect } from "react";
import { Search, Phone, Mail, X } from "lucide-react";
import { formatPrice, formatShortDateFrench } from "@/lib/utils";

export default function AdminCustomersView({ initialCustomers = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    const instagram = (c.instagram || "").toLowerCase();
    const query = search.trim().toLowerCase();
    return (
      query === "" ||
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      instagram.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brun">
          Fichier Clientes
        </h1>
        <p className="text-xs text-stone-500 font-light mt-1">
          Historique, coordonnées et fidélité de votre clientèle.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Rechercher une cliente par nom, e-mail ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-10 py-2.5 text-base lg:text-sm text-brun placeholder:text-stone-400 focus:outline-none focus:border-champagne"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Effacer la recherche"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 compact-chip inline-flex items-center justify-center rounded-lg text-stone-400 hover:text-brun cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customers Cards (< lg / iPad Portrait) + Table (>= lg) */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="lg:hidden divide-y divide-stone-100">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((cust) => (
              <div key={cust.id || cust._id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-champagne-light/60 flex items-center justify-center text-brun font-serif font-bold text-sm shrink-0">
                      {cust.firstName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-base text-brun truncate">
                        {cust.firstName} {cust.lastName}
                      </h3>
                      {cust.instagram && (
                        <span className="text-xs font-mono text-champagne-dark block">
                          {cust.instagram}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-serif font-bold text-sm text-brun">
                      {formatPrice(cust.totalSpent || 0)}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {cust.totalBookings || 1} rdv
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-600">
                  {cust.phone && (
                    <a
                      href={`tel:${cust.phone}`}
                      className="inline-flex items-center gap-1.5 underline decoration-stone-300 hover:text-brun font-mono"
                    >
                      <Phone className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                      <span>{cust.phone}</span>
                    </a>
                  )}
                  {cust.email && (
                    <a
                      href={`mailto:${cust.email}`}
                      className="inline-flex items-center gap-1.5 min-w-0 break-all underline decoration-stone-300 hover:text-brun"
                    >
                      <Mail className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                      <span>{cust.email}</span>
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-stone-400">
                  Dernière séance :{" "}
                  {cust.lastBookingAt
                    ? formatShortDateFrench(cust.lastBookingAt)
                    : "Récemment"}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 px-4 text-center text-sm text-stone-500 font-light">
              Aucune fiche cliente pour le moment. Elles apparaîtront automatiquement lors de vos premières réservations.
            </div>
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Cliente</th>
                <th className="py-3.5 px-5">Téléphone</th>
                <th className="py-3.5 px-5">E-mail</th>
                <th className="py-3.5 px-5">Réservations</th>
                <th className="py-3.5 px-5">Total Dépensé</th>
                <th className="py-3.5 px-5">Dernière séance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id || cust._id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-champagne-light/50 flex items-center justify-center text-brun font-serif font-bold text-xs">
                          {cust.firstName?.charAt(0)}
                        </div>
                        <div className="font-semibold text-brun">
                          {cust.firstName} {cust.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-stone-600 font-mono">
                      {cust.phone ? (
                        <a
                          href={`tel:${cust.phone}`}
                          className="underline decoration-stone-300 hover:text-brun"
                        >
                          {cust.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4 px-5 text-stone-600">
                      {cust.email ? (
                        <a
                          href={`mailto:${cust.email}`}
                          className="underline decoration-stone-300 hover:text-brun"
                        >
                          {cust.email}
                        </a>
                      ) : (
                        "Non renseigné"
                      )}
                    </td>
                    <td className="py-4 px-5 font-semibold text-brun">
                      {cust.totalBookings || 1}
                    </td>
                    <td className="py-4 px-5 font-serif font-bold text-brun">
                      {formatPrice(cust.totalSpent || 0)}
                    </td>
                    <td className="py-4 px-5 text-stone-500">
                      {cust.lastBookingAt
                        ? formatShortDateFrench(cust.lastBookingAt)
                        : "Récemment"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-light">
                    Aucune fiche cliente pour le moment. Elles apparaîtront automatiquement lors de vos premières réservations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
