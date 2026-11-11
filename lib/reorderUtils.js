/**
 * Fonctions pures utilitaires pour la réorganisation (glisser-déposer tactile & souris).
 */

/**
 * Déplace immuablement un élément d'un tableau de `fromIndex` vers `toIndex`.
 * Retourne la référence d'origine si le déplacement est invalide ou sans effet.
 */
export function moveArrayItem(list, fromIndex, toIndex) {
  if (!Array.isArray(list)) return [];
  const len = list.length;
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= len ||
    toIndex >= len ||
    fromIndex === toIndex
  ) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Détermine l'index de la carte cible sous le pointeur (x, y).
 * Vérifie d'abord une collision directe à l'intérieur d'un rectangle, puis autorise
 * une tolérance de proximité (gap entre cartes d'une grille) jusqu'à `maxGapDistance` px.
 *
 * @param {number} clientX
 * @param {number} clientY
 * @param {Array<{ index: number, rect: { left: number, right: number, top: number, bottom: number } }>} rects
 * @param {number} [maxGapDistance=48]
 * @returns {number | null}
 */
export function findDropTargetIndex(
  clientX,
  clientY,
  rects,
  maxGapDistance = 48
) {
  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY) ||
    !Array.isArray(rects) ||
    rects.length === 0
  ) {
    return null;
  }

  // 1. Collision directe à l'intérieur d'un élément
  for (let i = 0; i < rects.length; i += 1) {
    const entry = rects[i];
    if (!entry || !entry.rect || !Number.isInteger(entry.index)) continue;
    const { left, right, top, bottom } = entry.rect;
    if (
      clientX >= left &&
      clientX <= right &&
      clientY >= top &&
      clientY <= bottom
    ) {
      return entry.index;
    }
  }

  // 2. Proximité immédiate dans la gouttière (gap entre tuiles)
  let bestIndex = null;
  let bestDist = Infinity;

  for (let i = 0; i < rects.length; i += 1) {
    const entry = rects[i];
    if (!entry || !entry.rect || !Number.isInteger(entry.index)) continue;
    const { left, right, top, bottom } = entry.rect;
    const dx = Math.max(0, left - clientX, clientX - right);
    const dy = Math.max(0, top - clientY, clientY - bottom);
    const dist = Math.hypot(dx, dy);
    if (dist <= maxGapDistance && dist < bestDist) {
      bestDist = dist;
      bestIndex = entry.index;
    }
  }

  return bestIndex;
}
