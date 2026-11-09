"use client";

import { useState } from "react";
import ServiceCard from "./ServiceCard";
import { Search } from "lucide-react";

export default function ServicesList({ initialServices = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "ALL", label: "Toutes les prestations" },
    { id: "Sur-Mesure", label: "Sur-Mesure & Création Spéciale" },
    { id: "Sans rajouts", label: "Sans rajouts (25 €)" },
    { id: "Sans mèches incluses", label: "Sans mèches (vous apportez)" },
    { id: "Avec mèches incluses", label: "Avec mèches incluses" },
  ];

  const filteredServices = initialServices.filter((service) => {
    const matchesCategory =
      selectedCategory === "ALL" || service.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Note discrète réduction étudiante - Style salon haut de gamme */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-white border border-beige rounded-xl text-xs text-stone-600 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-champagne-dark shrink-0" />
          <span>
            <strong className="text-brun font-semibold">Tarif étudiante :</strong> -5 € de réduction sur toutes les coiffures avec mèches incluses (sur présentation de votre carte).
          </span>
        </div>
        <span className="text-[11px] font-mono text-champagne-dark font-semibold shrink-0">
          -5 € avec mèches
        </span>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-brun text-white shadow-xs font-semibold"
                    : "bg-white text-stone-600 hover:text-brun border border-beige hover:border-champagne/60"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Rechercher une coiffure..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-beige rounded-full pl-9 pr-4 py-2 text-xs text-brun placeholder:text-stone-400 focus:outline-none focus:border-champagne"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Grid of Services */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <ServiceCard key={service.id || service._id} service={service} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-beige p-6 max-w-sm mx-auto">
          <h3 className="font-serif text-base font-bold text-brun mb-1">
            Aucune coiffure trouvée
          </h3>
          <p className="text-xs text-stone-500 mb-4 font-light">
            Aucun modèle ne correspond à votre recherche actuelle. Réinitialisez les filtres pour découvrir tout le menu.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
            className="text-xs font-semibold text-brun bg-creme hover:bg-beige border border-beige px-4 py-2 rounded-full transition-colors"
          >
            Afficher toutes les prestations
          </button>
        </div>
      )}
    </div>
  );
}
