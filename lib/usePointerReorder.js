"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { findDropTargetIndex } from "@/lib/reorderUtils";

const DRAG_MOVE_THRESHOLD_PX = 6;
const AUTO_SCROLL_EDGE_PX = 96;
const AUTO_SCROLL_MAX_STEP_PX = 16;

function isInteractiveChild(target, boundaryEl) {
  if (!target || typeof target.closest !== "function") return false;
  const hit = target.closest(
    "button, a, input, select, textarea, label, [data-no-drag]"
  );
  if (!hit) return false;
  // Si la cible interactive est la carte/poignée elle-même, ce n'est pas un bouton enfant à ignorer
  if (boundaryEl && hit === boundaryEl) return false;
  return true;
}

/**
 * Hook unifié de glisser-déposer (Souris, Stylet & Doigt tactile) pour listes et grilles 2D.
 * Fonctionne sans HTML5 `draggable` (inopérant sur iPadOS/iOS Safari).
 *
 * - Sur poignée explicite (`getHandleProps`) avec `.touch-drag-handle` (`touch-action: none`),
 *   le glissement démarre dès `DRAG_MOVE_THRESHOLD_PX` pour la souris ET le tactile.
 * - Sur corps d'une tuile compacte (`getItemProps`), le glissement démarre après `DRAG_MOVE_THRESHOLD_PX`
 *   à la souris, ou après `longPressMs` (220 ms) au doigt (annulé si l'utilisateur fait défiler).
 */
export function usePointerReorder({
  groupId,
  itemCount = 0,
  disabled = false,
  onReorder,
  longPressMs = 220,
}) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [pointerPos, setPointerPos] = useState(null);
  const [ghostSize, setGhostSize] = useState({ width: 0, height: 0 });
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const itemCountRef = useRef(itemCount);
  itemCountRef.current = itemCount;

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const suppressNextClickRef = useRef(false);
  const sessionRef = useRef(null);
  const rafRef = useRef(null);
  const cleanupListenersRef = useRef(null);

  const shouldSuppressClick = useCallback(() => {
    return Boolean(suppressNextClickRef.current);
  }, []);

  const measureDropTarget = useCallback(
    (clientX, clientY) => {
      if (typeof document === "undefined" || !groupId) return null;
      const container = document.querySelector(
        `[data-reorder-group="${groupId}"]`
      );
      if (!container) return null;

      const nodes = container.querySelectorAll("[data-reorder-index]");
      const rects = [];
      nodes.forEach((node) => {
        const rawIdx = node.getAttribute("data-reorder-index");
        const parsedIdx = Number.parseInt(rawIdx, 10);
        if (Number.isInteger(parsedIdx)) {
          rects.push({ index: parsedIdx, rect: node.getBoundingClientRect() });
        }
      });

      return findDropTargetIndex(clientX, clientY, rects);
    },
    [groupId]
  );

  const stopSession = useCallback((commitDrop = false) => {
    const s = sessionRef.current;
    if (!s) return;

    if (s.longPressTimer) {
      clearTimeout(s.longPressTimer);
      s.longPressTimer = null;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (cleanupListenersRef.current) {
      cleanupListenersRef.current();
      cleanupListenersRef.current = null;
    }

    const wasActive = s.active;
    const fromIdx = s.fromIndex;
    const toIdx = s.currentOverIndex;

    sessionRef.current = null;

    setDraggingIndex(null);
    setOverIndex(null);
    setPointerPos(null);
    setGhostSize({ width: 0, height: 0 });
    setIsTouchDragging(false);

    if (wasActive) {
      suppressNextClickRef.current = true;
      setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 120);

      if (
        commitDrop &&
        Number.isInteger(fromIdx) &&
        Number.isInteger(toIdx) &&
        fromIdx !== toIdx &&
        fromIdx >= 0 &&
        toIdx >= 0 &&
        fromIdx < itemCountRef.current &&
        toIdx < itemCountRef.current
      ) {
        onReorderRef.current?.(fromIdx, toIdx);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSession(false);
    };
  }, [stopSession]);

  const startAutoScrollLoop = useCallback(() => {
    const tick = () => {
      const s = sessionRef.current;
      if (!s || !s.active || typeof window === "undefined") {
        rafRef.current = null;
        return;
      }

      const y = s.lastY;
      const vh = window.innerHeight || 0;
      let delta = 0;

      if (y < AUTO_SCROLL_EDGE_PX) {
        const ratio = Math.max(0, (AUTO_SCROLL_EDGE_PX - y) / AUTO_SCROLL_EDGE_PX);
        delta = -Math.ceil(ratio * AUTO_SCROLL_MAX_STEP_PX);
      } else if (vh > 0 && y > vh - AUTO_SCROLL_EDGE_PX) {
        const ratio = Math.max(
          0,
          (y - (vh - AUTO_SCROLL_EDGE_PX)) / AUTO_SCROLL_EDGE_PX
        );
        delta = Math.ceil(ratio * AUTO_SCROLL_MAX_STEP_PX);
      }

      if (delta !== 0) {
        window.scrollBy({ top: delta, behavior: "instant" });
        const hovered = measureDropTarget(s.lastX, s.lastY);
        if (hovered !== null && hovered !== s.currentOverIndex) {
          s.currentOverIndex = hovered;
          setOverIndex(hovered);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [measureDropTarget]);

  const activateDrag = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.active) return;

    s.active = true;
    s.currentOverIndex = s.fromIndex;

    let measured = { width: 180, height: 180 };
    if (typeof document !== "undefined" && groupId) {
      const cardEl = document.querySelector(
        `[data-reorder-group="${groupId}"] [data-reorder-index="${s.fromIndex}"]`
      );
      if (cardEl) {
        const r = cardEl.getBoundingClientRect();
        measured = {
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      }
    }

    if (
      s.isTouch &&
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    ) {
      try {
        navigator.vibrate(12);
      } catch (_) {}
    }

    setGhostSize(measured);
    setDraggingIndex(s.fromIndex);
    setOverIndex(s.fromIndex);
    setPointerPos({ x: s.lastX, y: s.lastY });
    setIsTouchDragging(s.isTouch);

    startAutoScrollLoop();
  }, [groupId, startAutoScrollLoop]);

  const beginSession = useCallback(
    (e, index, { fromHandle }) => {
      if (disabledRef.current || !Number.isInteger(index) || index < 0) return;
      if (sessionRef.current) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const isTouch = e.pointerType === "touch";

      const session = {
        pointerId: e.pointerId,
        fromIndex: index,
        fromHandle: Boolean(fromHandle),
        isTouch,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        active: false,
        currentOverIndex: index,
        longPressTimer: null,
      };
      sessionRef.current = session;

      const handlePointerMove = (ev) => {
        const s = sessionRef.current;
        if (!s || ev.pointerId !== s.pointerId) return;

        s.lastX = ev.clientX;
        s.lastY = ev.clientY;

        const dist = Math.hypot(ev.clientX - s.startX, ev.clientY - s.startY);

        if (!s.active) {
          if (s.fromHandle || !s.isTouch) {
            if (dist >= DRAG_MOVE_THRESHOLD_PX) {
              activateDrag();
            }
          } else if (dist >= DRAG_MOVE_THRESHOLD_PX) {
            // Doigt sur le corps de la carte avant la fin du long-press -> défilement normal
            stopSession(false);
          }
          return;
        }

        setPointerPos({ x: ev.clientX, y: ev.clientY });
        const nextOver = measureDropTarget(ev.clientX, ev.clientY);
        if (nextOver !== null && nextOver !== s.currentOverIndex) {
          s.currentOverIndex = nextOver;
          setOverIndex(nextOver);
        }
      };

      const handlePointerUp = (ev) => {
        const s = sessionRef.current;
        if (!s || ev.pointerId !== s.pointerId) return;
        if (s.active) {
          const finalOver = measureDropTarget(ev.clientX, ev.clientY);
          if (finalOver !== null) {
            s.currentOverIndex = finalOver;
          }
          stopSession(true);
        } else {
          stopSession(false);
        }
      };

      const handlePointerCancel = (ev) => {
        const s = sessionRef.current;
        if (!s || (ev?.pointerId !== undefined && ev.pointerId !== s.pointerId)) {
          return;
        }
        stopSession(false);
      };

      const handleTouchMove = (ev) => {
        const s = sessionRef.current;
        if (s && s.active) {
          // Bloque le scroll natif iOS/iPadOS uniquement pendant un glissement actif
          ev.preventDefault();
        }
      };

      const handleKeyDown = (ev) => {
        if (ev.key === "Escape") {
          stopSession(false);
        }
      };

      if (typeof window !== "undefined") {
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerCancel);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("blur", handlePointerCancel);

        cleanupListenersRef.current = () => {
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerup", handlePointerUp);
          window.removeEventListener("pointercancel", handlePointerCancel);
          window.removeEventListener("touchmove", handleTouchMove);
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("blur", handlePointerCancel);
        };
      }

      if (isTouch && !fromHandle) {
        session.longPressTimer = setTimeout(() => {
          if (sessionRef.current === session && !session.active) {
            activateDrag();
          }
        }, longPressMs);
      }
    },
    [activateDrag, longPressMs, measureDropTarget, stopSession]
  );

  const getHandleProps = useCallback(
    (index) => ({
      "data-reorder-handle": "true",
      onPointerDown: (e) => {
        e.stopPropagation();
        beginSession(e, index, { fromHandle: true });
      },
    }),
    [beginSession]
  );

  const getItemProps = useCallback(
    (index) => ({
      onPointerDown: (e) => {
        if (
          e.target?.closest?.('[data-reorder-handle="true"]') ||
          isInteractiveChild(e.target, e.currentTarget)
        ) {
          return;
        }
        beginSession(e, index, { fromHandle: false });
      },
      onContextMenu: (e) => {
        // Évite le menu contextuel natif iOS si un appui long tactile active le drag sur tuile compacte
        if (sessionRef.current?.active || draggingIndex !== null) {
          e.preventDefault();
        }
      },
    }),
    [beginSession, draggingIndex]
  );

  return {
    draggingIndex,
    overIndex,
    pointerPos,
    ghostSize,
    isTouchDragging,
    getHandleProps,
    getItemProps,
    shouldSuppressClick,
  };
}
