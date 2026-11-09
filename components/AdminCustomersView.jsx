"use client";

import { useState } from "react";
import { Search, User, Phone, Mail, Calendar, Sparkles } from "lucide-react";
import { formatPrice, formatShortDateFrench } from "@/lib/utils";

export default function AdminCustomersView({ initialCustomers = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || email.includes(query) || phone.includes(query);
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
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-brun placeholder:text-stone-400 focus:outline-none focus:border-champagne"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
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
                      {cust.phone}
                    </td>
                    <td className="py-4 px-5 text-stone-600">
                      {cust.email}
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
