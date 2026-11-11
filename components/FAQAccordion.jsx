"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const visibleItems = Array.isArray(items)
    ? items.filter(
        (item) =>
          item &&
          item.visible !== false &&
          ((item.question && item.question.trim() !== "") ||
            (item.answer && item.answer.trim() !== ""))
      )
    : [];

  if (visibleItems.length === 0) return null;

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="space-y-4">
      {visibleItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-white border-champagne shadow-sm"
                : "bg-white/60 border-beige hover:border-beige-soft"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full min-h-[56px] py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between gap-3 text-left group cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="flex-1 min-w-0 pr-2 font-serif text-base sm:text-lg font-medium text-brun group-hover:text-champagne-dark transition-colors">
                {item.question}
              </span>
              <div
                className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-beige-light transition-transform duration-300 ${
                  isOpen ? "rotate-180 bg-champagne text-brun-dark" : "text-brun-muted"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 pt-1 text-sm text-brun-muted leading-relaxed font-light border-t border-beige/40 animate-fadeIn">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
