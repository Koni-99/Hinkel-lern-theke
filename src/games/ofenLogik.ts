// ═══ Ofen-Kette: Logik (ohne Bildschirm, darum im Test prüfbar) ═══
// Teile aus 4 Produktfotos fallen in den Ofen. Volle Reihe = fertig gebacken, 4 gleiche nebeneinander = goldbraun.
// Dazu: Bestellung nach Namen, Allergen-Frage, goldenes Brötchen, verbrannte Bilder, Gruppen-Tag, ruhiger Modus.
import { SHOP_PRODUCTS, allergeneUnsicher } from '../daten/shopProducts';
import { sortiment } from './telefonLogik';

export const COLS = 7;
export const ROWS = 12;
export const BEDARF = 6; // so viele Bilder braucht eine Bestellung
export const BESTELL_ZEIT = 60000;
export const VERBRANNT_AB = 30; // nach so vielen abgelegten Teilen wird ein liegendes Bild dunkel
export const MAX_PUNKTE = 250; // höchstens so viele Punkte pro Runde für die Bestenliste (vor ×1,5)

export type Kachel = { p: number; glut: number; alter: number; gold?: boolean };
export type Raster = (Kachel | null)[][];
export type Zelle = { x: number; y: number; p: number; gold?: boolean; frage?: boolean };
export type Teil = { zellen: Zelle[]; x: number; y: number };

export const FORMEN: [number, number][][] = [
  [[0, 0], [1, 0], [2, 0], [3, 0]], // Stange
  [[0, 0], [1, 0], [0, 1], [1, 1]], // Blech
  [[0, 0], [1, 0], [2, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[2, 0], [0, 1], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
];

const OHNE_GRUPPE = new Set(['Backmischung', 'Sonstiges']);
export const gruppeVon = (name: string) => (SHOP_PRODUCTS.find((p) => p.name === name) || { group: '' }).group;

/** Alles, was diesen Monat im Ofen vorkommen darf (Saisonware nur in der Saison) */
export function ofenSortiment(monat = new Date().getMonth()): string[] {
  return sortiment(monat).filter((a) => !OHNE_GRUPPE.has(a.group)).map((a) => a.name);
}

const zufallMit = (seed: number) => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const tagesZahl = (d: Date) => d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();

/** Jeden Tag andere Produkte (für alle gleich), aus möglichst vielen Gruppen */
export function tagesAuswahl(namen: string[], d = new Date(), n = 10): string[] {
  const rnd = zufallMit(tagesZahl(d));
  const gemischt = namen.slice();
  for (let i = gemischt.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]]; }
  // abwechselnd aus den Gruppen ziehen, damit nicht nur Brot dran ist
  const nachGruppe = new Map<string, string[]>();
  gemischt.forEach((x) => { const g = gruppeVon(x); nachGruppe.set(g, [...(nachGruppe.get(g) || []), x]); });
  const aus: string[] = [];
  while (aus.length < Math.min(n, gemischt.length)) {
    for (const liste of nachGruppe.values()) { const x = liste.shift(); if (x && aus.length < n) aus.push(x); }
  }
  // Reihenfolge noch einmal mischen, sonst kommen am Anfang (4 Produkte) nur die ersten Gruppen
  for (let i = aus.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [aus[i], aus[j]] = [aus[j], aus[i]]; }
  return aus;
}

/** Gruppen-Tag: mittwochs und samstags zählt die Produktgruppe statt des Produkts */
export const istGruppenTag = (d = new Date()) => d.getDay() === 3 || d.getDay() === 6;

export const leeresRaster = (): Raster => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

/** Neues Teil: immer 2 verschiedene Produkte (2+2 oder 3+1), nie 4 gleiche, die sofort weg wären */
export function neuesTeil(aktiv: number, zufall = Math.random): Teil {
  const form = FORMEN[Math.floor(zufall() * FORMEN.length)];
  const a = Math.floor(zufall() * aktiv);
  let b = Math.floor(zufall() * (aktiv - 1)); if (b >= a) b++;
  const mix = zufall() < 0.5 ? [a, a, b, b] : [a, a, a, b];
  for (let i = mix.length - 1; i > 0; i--) { const j = Math.floor(zufall() * (i + 1)); [mix[i], mix[j]] = [mix[j], mix[i]]; }
  return { zellen: form.map(([x, y], i) => ({ x, y, p: mix[i] })), x: Math.floor((COLS - 3) / 2), y: -1 };
}

/** Goldenes Brötchen: ein einzelnes Feld */
export const goldTeil = (): Teil => ({ zellen: [{ x: 0, y: 0, p: -1, gold: true }], x: Math.floor(COLS / 2), y: -1 });

export const istVerbrannt = (k: Kachel | null) => !!k && !k.gold && k.alter >= VERBRANNT_AB;

/** Zusammenhängende gleiche Bilder (mind. 4). schluessel: Produkt oder (am Gruppen-Tag) Gruppe */
export function findeGruppen(r: Raster, schluessel: (p: number) => string | number) {
  const weg = new Set<number>(), gesehen = new Set<number>(), gruppen: { p: number; ks: number[] }[] = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const k = r[y][x];
    if (!k || k.gold || istVerbrannt(k) || gesehen.has(y * COLS + x)) continue;
    const s = schluessel(k.p), stapel = [[x, y]], ks: number[] = [];
    gesehen.add(y * COLS + x);
    while (stapel.length) {
      const [cx, cy] = stapel.pop()!; ks.push(cy * COLS + cx);
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const qx = cx + ax, qy = cy + ay, q = qy * COLS + qx;
        if (qx < 0 || qx >= COLS || qy < 0 || qy >= ROWS || gesehen.has(q)) continue;
        const n = r[qy][qx];
        if (!n || n.gold || istVerbrannt(n) || schluessel(n.p) !== s) continue;
        gesehen.add(q); stapel.push([qx, qy]);
      }
    }
    if (ks.length >= 4) { ks.forEach((q) => weg.add(q)); gruppen.push({ p: k.p, ks }); }
  }
  return { weg, gruppen };
}

export const volleReihen = (r: Raster) => r.map((z, y) => (z.every(Boolean) ? y : -1)).filter((y) => y >= 0);

/** Alles fällt nach unten (jede Spalte für sich) */
export function nachRutschen(r: Raster) {
  for (let x = 0; x < COLS; x++) {
    const spalte: Kachel[] = [];
    for (let y = ROWS - 1; y >= 0; y--) if (r[y][x]) spalte.push(r[y][x]!);
    for (let y = ROWS - 1, i = 0; y >= 0; y--, i++) r[y][x] = spalte[i] || null;
  }
}

/** Was backt das goldene Brötchen weg? Das Produkt darunter, sonst links/rechts daneben */
export function goldZiel(r: Raster, x: number, y: number, schluessel: (p: number) => string | number): Set<number> {
  const weg = new Set<number>([y * COLS + x]);
  const nachbar = [[x, y + 1], [x - 1, y], [x + 1, y]].map(([a, b]) => (a >= 0 && a < COLS && b < ROWS ? r[b][a] : null)).find((k) => k && !k.gold && !istVerbrannt(k));
  if (!nachbar) return weg;
  const s = schluessel(nachbar.p);
  for (let b = 0; b < ROWS; b++) for (let a = 0; a < COLS; a++) { const k = r[b][a]; if (k && !k.gold && !istVerbrannt(k) && schluessel(k.p) === s) weg.add(b * COLS + a); }
  return weg;
}

/** Allergen ohne Klammer: „Gluten (Weizen)“ → „Gluten“ */
export const allergenKopf = (a: string) => a.replace(/\s*\(.*\)\s*$/, '').trim();
const ALLE_ALLERGENE = Array.from(new Set(SHOP_PRODUCTS.flatMap((p) => p.allergens.map(allergenKopf)))).filter((a) => a && a !== 'Soja');

/** Allergen-Frage zu einem Produkt: 1 richtige + 2 falsche Antworten. Soja wird (wie im Quiz) ausgelassen. */
export function allergenFrage(name: string, zufall = Math.random): { richtig: string; optionen: string[]; drin: string[] } | null {
  const p = SHOP_PRODUCTS.find((x) => x.name === name);
  if (!p || allergeneUnsicher(p)) return null; // Version 276: unvollständige Angabe → keine Allergen-Frage
  const drin = Array.from(new Set(p.allergens.map(allergenKopf))).filter((a) => a && a !== 'Soja');
  if (!drin.length || p.allergens.some((a) => allergenKopf(a) === 'Soja')) return null;
  const richtig = drin[Math.floor(zufall() * drin.length)];
  const falsch = ALLE_ALLERGENE.filter((a) => !drin.includes(a));
  if (falsch.length < 2) return null;
  const f = falsch.slice().sort(() => zufall() - 0.5).slice(0, 2);
  const optionen = [richtig, ...f].sort(() => zufall() - 0.5);
  return { richtig, optionen, drin };
}

/** Punkte für die Bestenliste: höchstens MAX_PUNKTE, im ruhigen Modus die Hälfte */
export const bestenlistenPunkte = (roh: number, ruhig: boolean) => Math.min(ruhig ? MAX_PUNKTE / 2 : MAX_PUNKTE, Math.round(ruhig ? roh / 2 : roh));

/** Fallgeschwindigkeit in ms pro Feld */
export const takt = (stufe: number, ruhig: boolean) => (ruhig ? 900 : Math.max(180, 850 - (stufe - 1) * 60));
