"use client";

import { useState, useEffect } from "react";

const TEXT_INPUT_TYPES = new Set([
  "text",
  "email",
  "tel",
  "url",
  "search",
  "password",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
]);

function isEditableKeyboardTarget(el) {
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName.toUpperCase();
  if (tag === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  if (tag === "INPUT") {
    const type = (el.getAttribute("type") || "text").toLowerCase();
    return TEXT_INPUT_TYPES.has(type);
  }
  return false;
}

/**
 * Détecte l'ouverture probable du clavier virtuel sur tablette/smartphone
 * (< 1280px) afin de désancrer les barres sticky basses sans causer de saut de mise en page.
 */
export function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let blurTimer = null;

    const evaluate = () => {
      const isCompactViewport = window.innerWidth < 1280;
      if (!isCompactViewport) {
        setIsKeyboardOpen(false);
        return;
      }

      const vv = window.visualViewport;
      const viewportShrunk =
        Boolean(vv) && window.innerHeight - vv.height > 120;
      const focusedEditable = isEditableKeyboardTarget(document.activeElement);

      setIsKeyboardOpen(focusedEditable || viewportShrunk);
    };

    const handleFocusIn = () => {
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
      evaluate();
    };

    const handleFocusOut = () => {
      if (blurTimer) clearTimeout(blurTimer);
      blurTimer = setTimeout(evaluate, 90);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    window.addEventListener("resize", evaluate);

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", evaluate);
    }

    evaluate();

    return () => {
      if (blurTimer) clearTimeout(blurTimer);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("resize", evaluate);
      if (vv) {
        vv.removeEventListener("resize", evaluate);
      }
    };
  }, []);

  return isKeyboardOpen;
}
