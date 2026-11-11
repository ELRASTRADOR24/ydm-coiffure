import assert from "node:assert/strict";
import test from "node:test";
import { moveArrayItem, findDropTargetIndex } from "../lib/reorderUtils.js";

test("moveArrayItem déplace correctement un élément vers l'avant et vers l'arrière", () => {
  const items = ["a", "b", "c", "d"];

  assert.deepEqual(moveArrayItem(items, 0, 2), ["b", "c", "a", "d"]);
  assert.deepEqual(moveArrayItem(items, 3, 1), ["a", "d", "b", "c"]);
  // Immutabilité : tableau d'origine intact
  assert.deepEqual(items, ["a", "b", "c", "d"]);
});

test("moveArrayItem retourne la même référence si index identique ou hors bornes", () => {
  const items = ["x", "y", "z"];

  assert.equal(moveArrayItem(items, 1, 1), items);
  assert.equal(moveArrayItem(items, -1, 1), items);
  assert.equal(moveArrayItem(items, 0, 5), items);
  assert.equal(moveArrayItem(items, 1.5, 2), items);
  assert.deepEqual(moveArrayItem(null, 0, 1), []);
});

test("findDropTargetIndex détecte la tuile directement sous le doigt en grille 2D", () => {
  const gridRects = [
    { index: 0, rect: { left: 0, right: 100, top: 0, bottom: 120 } },
    { index: 1, rect: { left: 120, right: 220, top: 0, bottom: 120 } },
    { index: 2, rect: { left: 0, right: 100, top: 140, bottom: 260 } },
    { index: 3, rect: { left: 120, right: 220, top: 140, bottom: 260 } },
  ];

  assert.equal(findDropTargetIndex(50, 60, gridRects), 0);
  assert.equal(findDropTargetIndex(180, 50, gridRects), 1);
  assert.equal(findDropTargetIndex(40, 200, gridRects), 2);
  assert.equal(findDropTargetIndex(150, 220, gridRects), 3);
});

test("findDropTargetIndex résout la gouttière proche et rejette les dépôts trop éloignés", () => {
  const gridRects = [
    { index: 0, rect: { left: 0, right: 100, top: 0, bottom: 100 } },
    { index: 1, rect: { left: 130, right: 230, top: 0, bottom: 100 } },
  ];

  // Point dans l'espace (gap = 30px) plus proche de l'élément 1 (distance 10px vs 20px)
  assert.equal(findDropTargetIndex(120, 50, gridRects), 1);
  // Point nettement plus proche de l'élément 0 (distance 5px vs 25px)
  assert.equal(findDropTargetIndex(105, 50, gridRects), 0);
  // Point très loin en dehors de la grille
  assert.equal(findDropTargetIndex(500, 500, gridRects), null);
});
