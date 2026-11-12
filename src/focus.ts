// ───────── Schwachstellen-Training ─────────
// Die Spiele melden pro Produkt, ob richtig oder falsch geantwortet wurde. Produkte, bei denen jemand
// oft danebenliegt, kommen in den Spielen öfter dran (höchstens etwa 4 von 10 Runden), bis sie sitzen.
// Dazu zählen auch falsch beantwortete Quizfragen zu einem Produkt (aus dem Fehler-Stapel).

import { shuffleArray } from './utils';

/** Schwäche pro Produktname: 0 = sicher, bis 6 = oft falsch */
export type WeakMap = Record<string, number>;
export const WEAK_MAX = 6;
/** Anteil der Runden, die aus Schwachstellen kommen dürfen */
const WEAK_SHARE = 0.4;

let weak: WeakMap = {};
let pending: Record<string, number> = {};
let saver: ((delta: Record<string, number>) => void) | null = null;
let timer: number | undefined;

/** Von der App gesetzt: aktuelle Schwächen des angemeldeten Mitarbeiters */
export function setFocusData(w: WeakMap) { weak = w || {}; }
/** Von der App gesetzt: speichert gesammelte Änderungen (gebündelt, nicht nach jeder Antwort) */
export function setFocusSaver(fn: ((delta: Record<string, number>) => void) | null) { saver = fn; }

export function weaknessOf(name: string): number {
  return Math.max(0, Math.min(WEAK_MAX, (weak[name] || 0) + (pending[name] || 0)));
}

/** Ein Spiel meldet ein Ergebnis zu einem Produkt. Falsch zählt doppelt so viel wie richtig. */
export function noteResult(product: string | undefined | null, ok: boolean) {
  if (!product || !saver) return;
  pending[product] = (pending[product] || 0) + (ok ? -1 : 2);
  window.clearTimeout(timer);
  timer = window.setTimeout(flushFocus, 5000);
}

export function flushFocus() {
  window.clearTimeout(timer);
  const keys = Object.keys(pending).filter((k) => pending[k] !== 0);
  if (!saver || keys.length === 0) { pending = {}; return; }
  const delta: Record<string, number> = {};
  keys.forEach((k) => { delta[k] = pending[k]; });
  // erst lokal übernehmen, damit die nächste Runde die neuen Werte schon kennt
  keys.forEach((k) => {
    const v = Math.max(0, Math.min(WEAK_MAX, (weak[k] || 0) + delta[k]));
    weak = { ...weak, [k]: v };
  });
  pending = {};
  saver(delta);
}

/** Wendet gebündelte Änderungen auf gespeicherte Schwächen an (für die Cloud) */
export function applyWeakDelta(cur: WeakMap | undefined, delta: Record<string, number>): WeakMap {
  const out: WeakMap = { ...(cur || {}) };
  Object.keys(delta).forEach((k) => {
    const v = Math.max(0, Math.min(WEAK_MAX, (Number(out[k]) || 0) + delta[k]));
    if (v > 0) out[k] = v; else delete out[k];
  });
  return out;
}

/**
 * Mischt wie shuffleArray, legt aber Schwachstellen bevorzugt nach vorne:
 * Unter den ersten `count` Einträgen sind im Schnitt höchstens 40 % Schwachstellen (stärkste zuerst, mit Zufall).
 */
export function focusShuffle<T>(arr: T[], nameOf: (x: T) => string, count = 10): T[] {
  const all = shuffleArray([...arr]);
  const weakOnes = all
    .filter((x) => weaknessOf(nameOf(x)) > 0)
    .map((x) => ({ x, k: Math.random() / (1 + weaknessOf(nameOf(x))) }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.x);
  if (weakOnes.length === 0) return all;
  const exp = Math.max(0, count) * WEAK_SHARE;
  const take = Math.min(weakOnes.length, Math.floor(exp) + (Math.random() < exp - Math.floor(exp) ? 1 : 0));
  if (take === 0) return all;
  const chosen = weakOnes.slice(0, take);
  const rest = all.filter((x) => !chosen.includes(x));
  const head = shuffleArray([...chosen, ...rest.slice(0, Math.max(0, count - take))]);
  return [...head, ...rest.slice(Math.max(0, count - take))];
}

/** Stärkste Schwachstellen, für die Anzeige */
export function topWeak(limit = 5): { name: string; level: number }[] {
  const names = new Set([...Object.keys(weak), ...Object.keys(pending)]);
  return Array.from(names)
    .map((name) => ({ name, level: weaknessOf(name) }))
    .filter((x) => x.level > 0)
    .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name, 'de'))
    .slice(0, limit);
}
