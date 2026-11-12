import {
  BattleEntry,
  CloudPayload,
  CustomProductItem,
  ScoreEntry,
  Tombstones,
  PinEntry,
} from "./types";
import type { Question } from "./questions";
import { refixAlternativeQuestion, neutralDescription } from "./questions";
import type { ShopProduct } from "./shopProducts";
import { SHOP_PRODUCTS } from "./shopProducts";
import { ALT_MAP } from "./data";

/** Punkte für Sieg/Niederlage im Quiz Battle */
export const BATTLE_POINTS = 25;

/**
 * Repariert alte, kaputte Fehler-Zähler aus der Cloud (z. B. Riesenzahlen).
 * Gibt immer eine kleine, ganze Zahl >= 0 zurück.
 */
export function cleanStatNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  const n = Number(val);
  if (isNaN(n) || n <= 0) return 0;
  if (n > 500) return Math.min(15, Math.max(1, Math.round(Math.log10(n) / 20)));
  return Math.round(n);
}

/** Gleichmäßiges Mischen (Fisher-Yates). `sort(() => 0.5 - Math.random())` mischt ungleichmäßig. */
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Heutiges Datum in lokaler Zeit (YYYY-MM-DD). `toISOString()` liefert UTC und kippt nachts um 1–2 Uhr. */
export function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Firebase erlaubt in Schlüsseln kein . $ # [ ] /, Namen mit diesen Zeichen würden die ganze Synchronisation blockieren. */
export function sanitizeUsername(name: string): string {
  return name.replace(/[.$#[\]/]/g, "").trim();
}

/** Richtige Antwort(en) einer Frage als Text. */
export function getRightAnswerText(q: any): string {
  const indices: number[] = q.correctMulti || [q.correct];
  return indices.map((idx: number) => q.options[idx]).join(" + ");
}

/** Diese Kategorien (Prüfungen, Wiederholungen …) kommen NICHT in die Bestenliste. */
export function isLeaderboardExcludedCategory(cat?: string): boolean {
  if (!cat) return false;
  return (
    cat.startsWith("ZP ") ||
    cat.startsWith("AP ") ||
    cat.includes("Zwischenprüfung") ||
    cat.includes("Abschlussprüfung") ||
    cat.includes("Stolpersteine") ||
    cat.includes("Alternativen &") ||
    cat.includes("Wiederholung")
  );
}

export function getRankByPercentage(pct: number) {
  const safePct = Number.isFinite(pct) ? pct : 0;

  if (safePct >= 98) {
    return {
      title: 'Hinkel-Legende (100%-Club)',
      emoji: '💎',
      color: '#581c87', // Edles Königspurpur
      bg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
      border: '#c084fc',
      min: 98, nextAt: 100, next: 100
    };
  }
  if (safePct >= 90) {
    return {
      title: 'Hinkel-Warenkunde-Meister',
      emoji: '👑',
      color: '#92400e', // Tiefes Meister-Gold
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '#f59e0b',
      min: 90, nextAt: 98, next: 98
    };
  }
  if (safePct >= 80) {
    return {
      title: 'Erster Theken-Profi',
      emoji: '🏆',
      color: '#065f46', // Sattes Smaragdgrün
      bg: '#d1fae5',
      border: '#34d399',
      min: 80, nextAt: 90, next: 90
    };
  }
  if (safePct >= 70) {
    return {
      title: 'Krusten-Virtuose',
      emoji: '🥖',
      color: '#115e59', // Edles Petrol-Grün
      bg: '#ccfbf1',
      border: '#5eead4',
      min: 70, nextAt: 80, next: 80
    };
  }
  if (safePct >= 60) {
    return {
      title: 'Krusten-Kenner',
      emoji: '🥨',
      color: '#7c2d12', // Dunkles Kastanien-/Laugenbraun
      bg: '#ffedd5',
      border: '#fb923c',
      min: 60, nextAt: 70, next: 70
    };
  }
  if (safePct >= 50) {
    return {
      title: 'Warenkunde-Ass (Bergfest!)',
      emoji: '⭐',
      color: '#1e40af', // Kräftiges Königsblau (Bergfest-Highlight)
      bg: '#dbeafe',
      border: '#60a5fa',
      min: 50, nextAt: 60, next: 60
    };
  }
  if (safePct >= 40) {
    return {
      title: 'Sauerteig-Spezialist',
      emoji: '🌾',
      color: '#9a3412', // Kräftiges Kupfer / Roggenkruste
      bg: '#ffedd5',
      border: '#fdba74',
      min: 40, nextAt: 50, next: 50
    };
  }
  if (safePct >= 30) {
    return {
      title: 'Ofenfrisch-Berater',
      emoji: '🔥',
      color: '#c2410c', // Leuchtendes Ofen-Orange
      bg: '#fff7ed',
      border: '#fed7aa',
      min: 30, nextAt: 40, next: 40
    };
  }
  if (safePct >= 20) {
    return {
      title: 'Brötchen-Bändiger',
      emoji: '🥐',
      color: '#b45309', // Goldgelb / Croissant-Ton
      bg: '#fef3c7',
      border: '#fcd34d',
      min: 20, nextAt: 30, next: 30
    };
  }
  if (safePct >= 12) {
    return {
      title: 'Theken-Talent',
      emoji: '🛍️',
      color: '#a16207', // Warmer Honig-/Mürbchen-Ton
      bg: '#fef9c3',
      border: '#fde047',
      min: 12, nextAt: 20, next: 20
    };
  }
  if (safePct >= 5) {
    return {
      title: 'Mehl-Entdecker',
      emoji: '🥄',
      color: '#3f6212', // Frisches Saaten-/Olivgrün
      bg: '#ecfccb',
      border: '#bef264',
      min: 5, nextAt: 12, next: 12
    };
  }
  if (safePct >= 1) {
    return {
      title: 'Frischling an der Theke',
      emoji: '🌱',
      color: '#15803d', // Helles Keimlings-Grün
      bg: '#dcfce7',
      border: '#86efac',
      min: 1, nextAt: 5, next: 5
    };
  }
  return {
    title: 'Backstuben-Neuling',
    emoji: '🥚',
    color: '#78716c', // Sanfter Mehl-/Naturstein-Ton
    bg: '#f5f5f4',
    border: '#d6d3d1',
    min: 0, nextAt: 1, next: 1
  };
}

export function formatEndpointUrl(url: string): string {
  const clean = url.trim();
  if (!clean) return "";
  if (
    (clean.includes("firebaseio.com") ||
      clean.includes("firebasedatabase.app")) &&
    !clean.endsWith(".json")
  ) {
    return clean.replace(/\/$/, "") + "/hinkel_app.json";
  }
  return clean;
}

export function matchesSortimentSubfilter(q: any, subId: string): boolean {
  if (subId === "all") return true;
  if (subId === "backtage") {
    const text = (q.question + " " + q.explanation).toLowerCase();
    return [
      "wochentag",
      "montag",
      "dienstag",
      "mittwoch",
      "donnerstag",
      "freitag",
      "samstag",
    ].some((w) => text.includes(w));
  }
  return q.subgroup === subId;
}

// ───────────────────────── Quiz Battle ─────────────────────────

/** Gesamtzeit eines Spielers im Battle in Millisekunden (null = nicht gemessen, z. B. alte Duelle) */
export function battleTimeOf(b: BattleEntry, side: "challenger" | "opponent"): number | null {
  const v = (b as any)[side === "challenger" ? "challengerTime" : "opponentTime"];
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}
/** Zeit lesbar, auf Zehntelsekunden: 23,4 s */
export function formatBattleTime(ms: number | null | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return "";
  return (Math.round(ms / 100) / 10).toFixed(1).replace(".", ",") + " s";
}
/** Wer hat gewonnen? Mehr richtige Antworten, bei Gleichstand die schnellere Zeit (auf Zehntelsekunden). */
export function battleWinnerSide(b: BattleEntry): "challenger" | "opponent" | "tie" | null {
  if (b.challengerScore === null || b.challengerScore === undefined || b.opponentScore === null || b.opponentScore === undefined) return null;
  if (b.challengerScore > b.opponentScore) return "challenger";
  if (b.opponentScore > b.challengerScore) return "opponent";
  const ct = battleTimeOf(b, "challenger"), ot = battleTimeOf(b, "opponent");
  if (ct === null || ot === null) return "tie";
  const c10 = Math.round(ct / 100), o10 = Math.round(ot / 100);
  return c10 < o10 ? "challenger" : o10 < c10 ? "opponent" : "tie";
}

/** Leitet Status und Sieger aus den beiden Punktzahlen ab (so kann sich ein Stand nie „verklemmen“). */
export function settleBattle(b: BattleEntry): BattleEntry {
  const c = b.challengerScore !== null && b.challengerScore !== undefined;
  const o = b.opponentScore !== null && b.opponentScore !== undefined;
  if (c && o) {
    b.status = "finished";
    const w = battleWinnerSide(b);
    b.winner = w === "challenger" ? b.challenger : w === "opponent" ? b.opponent : "Unentschieden";
  } else if (c) {
    b.status = "waiting_opponent";
    b.winner = null;
  } else if (o) {
    b.status = "waiting_challenger";
    b.winner = null;
  } else {
    b.status = "pending";
    b.winner = null;
  }
  return b;
}

/** Ergebnis eines beendeten Battles aus Sicht eines Spielers (userKey = Kleinschreibung des Namens). */
export function getBattleOutcome(
  b: BattleEntry,
  userKey: string
): "won" | "lost" | "tie" | null {
  if (b.status !== "finished") return null;
  if (b.challengerScore === null || b.challengerScore === undefined)
    return null;
  if (b.opponentScore === null || b.opponentScore === undefined) return null;
  const isChallenger = b.challengerKey === userKey;
  const isOpponent = b.opponentKey === userKey;
  if (!isChallenger && !isOpponent) return null;
  const w = battleWinnerSide(b);
  if (w === "tie" || w === null) return "tie";
  return isChallenger === (w === "challenger") ? "won" : "lost";
}

/** Zeitpunkt eines Battles aus seiner ID (battle_1730000000000_abcde) */
export function battleTime(b: BattleEntry): number {
  const m = String(b?.id || "").match(/_(\d{12,})_/);
  return m ? Number(m[1]) : 0;
}

/** Wann wurden die Punkte dieses Spielers zuletzt gelöscht (einzeln, ganze Bestenliste oder Spieler gelöscht)? */
export function pointsResetFor(t: Tombstones | undefined, userKey: string): number {
  return Math.max(t?.pointsReset?._all || 0, t?.pointsReset?.[userKey] || 0, t?.users?.[userKey] || 0);
}

/** Wie getBattleOutcome, aber Battles von vor dem Löschen der Punkte zählen nicht mehr */
export function battleOutcomeSinceReset(b: BattleEntry, userKey: string, t?: Tombstones): "won" | "lost" | "tie" | null {
  const reset = pointsResetFor(t, userKey);
  if (reset && battleTime(b) <= reset) return null;
  return getBattleOutcome(b, userKey);
}

/** Schreibt Sieger +25 / Verlierer −25 Punkte in die Bestenliste (genau einmal pro Battle). */
export function awardBattlePoints(curr: CloudPayload, b: BattleEntry): void {
  if (b.status !== "finished" || b.winner === "Unentschieden") return;
  if (!Array.isArray(curr.scores)) curr.scores = [];
  const nowStr = new Date().toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const players = [
    { key: b.challengerKey, name: b.challenger },
    { key: b.opponentKey, name: b.opponent },
  ];
  players.forEach(({ key, name }) => {
    const outcome = getBattleOutcome(b, key);
    if (outcome !== "won" && outcome !== "lost") return;
    const id = `battle_${b.id}_${key}`;
    if (curr.scores.some((s) => s.id === id)) return;
    curr.scores.push({
      id,
      username: name,
      score: (outcome === "won" ? 1 : -1) * (BATTLE_POINTS + (Number((b as any).stake) || 0)),
      date: nowStr,
      category: "Quiz Battle",
    });
  });
}

/** Führt zwei Stände desselben Battles zusammen: Punktzahlen, die einer schon hat, gehen nicht verloren. */
function mergeBattleEntry(a: BattleEntry, b: BattleEntry): BattleEntry {
  const merged: BattleEntry = {
    ...b,
    ...a,
    questions: a.questions || b.questions,
    challengerScore: a.challengerScore ?? b.challengerScore ?? null,
    opponentScore: a.opponentScore ?? b.opponentScore ?? null,
  };
  const at = a as any, bt = b as any;
  (merged as any).challengerTime = at.challengerTime ?? bt.challengerTime ?? null;
  (merged as any).opponentTime = at.opponentTime ?? bt.opponentTime ?? null;
  return settleBattle(merged);
}

// ───────────────────────── Cloud-Abgleich ─────────────────────────

// ───────────── Gelöschtes bleibt gelöscht (Tombstones) ─────────────

/** Eindeutiger Schlüssel eines Bestenlisten-Eintrags */
export function scoreKey(s: ScoreEntry): string {
  return s.id || `${s.username}_${s.score}_${s.date}_${s.category || ""}`;
}

/** Doppelte Einträge (gleiche ID) entfernen. Bis Version 149 konnte ein neuer Eintrag beim Nachprüfen
 *  mehrfach angehängt werden; so verschwinden diese Kopien beim nächsten Laden und Speichern. */
export function dedupeScores(list: ScoreEntry[]): ScoreEntry[] {
  const seen = new Set<string>();
  return (list || []).filter((s) => {
    if (!s) return false;
    const k = scoreKey(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Zeitpunkt eines Eintrags: aus der ID (name_1730000000000) oder aus dem Datum „02.11.26, 07:34“ */
function scoreTime(s: ScoreEntry): number {
  const m = String(s.id || "").match(/_(\d{12,})$/);
  if (m) return Number(m[1]);
  const d = String(s.date || "").match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:,?\s*(\d{1,2}):(\d{2}))?/);
  if (!d) return 0;
  const y = Number(d[3]) < 100 ? 2000 + Number(d[3]) : Number(d[3]);
  return new Date(y, Number(d[2]) - 1, Number(d[1]), Number(d[4] || 0), Number(d[5] || 0)).getTime();
}

const MAX_TOMBSTONE_AGE = 1000 * 60 * 60 * 24 * 180; // nach einem halben Jahr vergessen

function mergeStampMaps(a?: Record<string, number>, b?: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  const now = Date.now();
  [a || {}, b || {}].forEach((m) =>
    Object.keys(m).forEach((k) => {
      const v = Number(m[k]) || 0;
      if (v > 0 && now - v < MAX_TOMBSTONE_AGE) out[k] = Math.max(out[k] || 0, v);
    })
  );
  return out;
}

export function mergeTombstones(a?: Tombstones, b?: Tombstones): Tombstones {
  const keys: (keyof Tombstones)[] = ["scores", "pointsReset", "users", "progressReset", "wrongReset", "products", "questions"];
  const out: Tombstones = {};
  keys.forEach((k) => {
    const m = mergeStampMaps(a?.[k], b?.[k]);
    if (Object.keys(m).length) out[k] = m;
  });
  return out;
}

/** Entfernt alles, was der Ausbilder gelöscht hat, egal, welches Gerät es wieder mitbringt */
export function applyTombstones(p: CloudPayload): CloudPayload {
  const t = p.tombstones || {};
  const sc = t.scores || {};
  const pr = t.pointsReset || {};
  const us = t.users || {};
  const cu = Number(p.compactedUntil) || 0;
  p.scores = (p.scores || []).filter((s) => {
    if (!s || !s.username) return false;
    // schon zusammengefasst: alte Einzelrunde nicht doppelt zählen
    if (cu && !s.n) { const t = scoreTime(s); if (t && t < cu) return false; }
    if (sc[scoreKey(s)]) return false;
    const u = s.username.toLowerCase();
    const reset = Math.max(pr[u] || 0, pr._all || 0, us[u] || 0);
    return !(reset && scoreTime(s) <= reset);
  });
  Object.keys(us).forEach((u) => {
    const seen = p.lastSeen?.[u];
    // Nur entfernen, wenn sich der Mitarbeiter seit der Löschung nicht neu angemeldet hat
    if (!seen || (seen.timestamp || 0) <= us[u]) {
      if (p.progress) delete p.progress[u];
      if (p.lastSeen) delete p.lastSeen[u];
    }
    // PIN eines gelöschten Mitarbeiters gilt nicht mehr (außer er hat danach eine neue festgelegt)
    const pin = p.pins?.[u];
    if (pin && (pin.ts || 0) <= us[u]) delete p.pins![u];
  });
  if (t.products) p.customProducts = (p.customProducts || []).filter((x) => !t.products![x.id]);
  if (t.questions) p.customQuestions = (p.customQuestions || []).filter((q) => !t.questions![String(q.id)]);
  return p;
}

/** PINs: pro Mitarbeiter gewinnt die neueste Änderung (auch ein Zurücksetzen durch den Ausbilder) */
export function mergePins(a?: CloudPayload['pins'], b?: CloudPayload['pins']): NonNullable<CloudPayload['pins']> {
  const out: NonNullable<CloudPayload['pins']> = { ...(a || {}) };
  Object.keys(b || {}).forEach((u) => {
    const e = (b || {})[u];
    if (e && (!out[u] || (Number(e.ts) || 0) > (Number(out[u].ts) || 0))) out[u] = e;
  });
  return out;
}

// ── Persönliche PIN ──
// Gespeichert wird nur ein Hash. Hinweis: Solange die Datenbank für alle lesbar ist, schützt die PIN
// vor dem Anmelden unter fremdem Namen in der App, nicht vor jemandem, der die Datenbank direkt ausliest.
export const PIN_MIN = 4;
export const PIN_MAX = 6;
export function pinFormatError(pin: string): string {
  if (!/^\d+$/.test(pin)) return 'Die PIN darf nur Ziffern enthalten.';
  if (pin.length < PIN_MIN || pin.length > PIN_MAX) return `Die PIN braucht ${PIN_MIN} bis ${PIN_MAX} Ziffern.`;
  if (/^(\d)\1+$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin)) return 'Diese PIN ist zu leicht zu erraten. Bitte nimm eine andere.';
  return '';
}
async function sha256Hex(text: string): Promise<string> {
  if (!window.crypto?.subtle) throw new Error('Kein sicherer Browser-Kontext');
  const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function makePinEntry(userKey: string, pin: string): Promise<PinEntry> {
  const saltBytes = new Uint8Array(8);
  window.crypto.getRandomValues(saltBytes);
  const s = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return { h: await sha256Hex(`hinkel-pin|${s}|${userKey}|${pin}`), s, ts: Date.now() };
}
export async function checkPin(userKey: string, pin: string, entry?: PinEntry | null): Promise<boolean> {
  if (!entry?.h || !entry.s) return false;
  return (await sha256Hex(`hinkel-pin|${entry.s}|${userKey}|${pin}`)) === entry.h;
}

/** Korrigierte Fragen: pro Frage gewinnt die neueste Änderung */
export function mergeQuestionEdits(a?: CloudPayload['questionEdits'], b?: CloudPayload['questionEdits']): NonNullable<CloudPayload['questionEdits']> {
  const out: NonNullable<CloudPayload['questionEdits']> = { ...(a || {}) };
  Object.keys(b || {}).forEach((id) => {
    const e = (b || {})[id];
    if (e && (!out[id] || (Number(e.ts) || 0) > (Number(out[id].ts) || 0))) out[id] = e;
  });
  return out;
}

/** Korrigierte Produktdaten: pro Produkt gewinnt die neueste Änderung */
export function mergeProductFixes(a?: CloudPayload['productFixes'], b?: CloudPayload['productFixes']): NonNullable<CloudPayload['productFixes']> {
  const out: NonNullable<CloudPayload['productFixes']> = { ...(a || {}) };
  Object.keys(b || {}).forEach((name) => {
    const e = (b || {})[name];
    if (e && (!out[name] || (Number(e.ts) || 0) > (Number(out[name].ts) || 0))) out[name] = e;
  });
  return out;
}

// Originaldaten merken, damit Korrekturen zurückgenommen werden können
type ProductOriginal = { price?: string; shortIngredients: string; allergens: string[] };
const PRODUCT_ORIGINALS = new Map<string, ProductOriginal>();
const ALT_ORIGINALS = new Map<string, string[] | undefined>();
let activeProductFixes: NonNullable<CloudPayload['productFixes']> = {};

/** Korrekturen des Ausbilders auf Sortiment und Alternativen anwenden (wirkt in allen Spielen) */
export function applyProductFixes(fixes?: CloudPayload['productFixes']) {
  // erst alles auf Original zurück …
  PRODUCT_ORIGINALS.forEach((orig, name) => {
    const p = SHOP_PRODUCTS.find(x => x.name === name);
    if (p) { p.price = orig.price; p.shortIngredients = orig.shortIngredients; p.allergens = [...orig.allergens]; }
  });
  ALT_ORIGINALS.forEach((orig, name) => {
    if (orig) ALT_MAP[name] = [...orig]; else delete ALT_MAP[name];
  });
  activeProductFixes = {};
  // … dann die aktuellen Korrekturen drüberlegen
  Object.keys(fixes || {}).forEach((name) => {
    const f = (fixes || {})[name];
    if (!f || f.restored) return;
    const p = SHOP_PRODUCTS.find(x => x.name === name);
    if (p) {
      if (!PRODUCT_ORIGINALS.has(name)) PRODUCT_ORIGINALS.set(name, { price: p.price, shortIngredients: p.shortIngredients, allergens: [...p.allergens] });
      if (typeof f.price === 'string' && f.price.trim()) p.price = f.price.trim();
      if (typeof f.shortIngredients === 'string' && f.shortIngredients.trim()) p.shortIngredients = f.shortIngredients.trim();
      if (Array.isArray(f.allergens)) p.allergens = [...f.allergens];
    }
    if (Array.isArray(f.alts)) {
      if (!ALT_ORIGINALS.has(name)) ALT_ORIGINALS.set(name, ALT_MAP[name] ? [...ALT_MAP[name]] : undefined);
      if (f.alts.length) ALT_MAP[name] = [...f.alts]; else delete ALT_MAP[name];
    }
    activeProductFixes[name] = f;
  });
}

/** Originaldaten eines Produkts (vor der Korrektur des Ausbilders) */
export function originalProductData(name: string): { price?: string; shortIngredients: string; allergens: string[]; alts: string[] } | null {
  const p = SHOP_PRODUCTS.find(x => x.name === name);
  if (!p) return null;
  const o = PRODUCT_ORIGINALS.get(name);
  const a = ALT_ORIGINALS.has(name) ? ALT_ORIGINALS.get(name) : ALT_MAP[name];
  return { price: o ? o.price : p.price, shortIngredients: o ? o.shortIngredients : p.shortIngredients, allergens: [...(o ? o.allergens : p.allergens)], alts: [...(a || [])] };
}

/** Produkte, deren Alternativen der Ausbilder geändert hat */
export const fixedAltProducts = (): string[] => Object.keys(activeProductFixes).filter(n => Array.isArray(activeProductFixes[n].alts));

const priceText = (cents: number) => (cents / 100).toFixed(2).replace('.', ',') + ' €';
const centsOf = (s?: string) => { const m = (s || '').match(/(\d+),(\d\d)/); return m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 0; };

/** Quizfragen zu korrigierten Produkten anpassen (Preis, Kurz-Zutaten, Allergene, Alternativen) */
export function patchProductQuestion<T extends Question>(q: T): T {
  const name = q.product;
  if (!name) return q;
  const f = activeProductFixes[name];
  if (!f) return q;
  const p = SHOP_PRODUCTS.find(x => x.name === name);
  const setRight = (text: string, expl: string): T => {
    const options = [...q.options];
    options[q.correct] = text;
    // Falls eine falsche Antwort jetzt genauso lautet: leicht abändern
    options.forEach((o, i) => {
      if (i === q.correct || o !== text) return;
      const c = centsOf(o);
      options[i] = c ? priceText(c + 30) : o + ' (alt)';
    });
    return { ...q, options, explanation: expl };
  };
  if (/^Was kostet „/.test(q.question) && f.price && p?.price) return setRight(p.price, `${name}: ${p.price}.`);
  if (/^Ein Kunde fragt, was in „/.test(q.question) && f.shortIngredients && p) return setRight(p.shortIngredients, `${name}: ${p.shortIngredients}.`);
  if (/^Welche Allergene sind bei „/.test(q.question) && Array.isArray(f.allergens) && p) {
    const txt = p.allergens.length ? p.allergens.join(', ') : 'Keine angegeben';
    return setRight(txt, `${name} enthält: ${txt}.`);
  }
  if (/ausverkauft\. Welche Alternative/.test(q.question) && Array.isArray(f.alts) && f.alts.length) return refixAlternativeQuestion(q) as T;
  return q;
}

export function mergePayloads(
  local: CloudPayload,
  remote: CloudPayload
): CloudPayload {
  const scoreMap = new Map<string, ScoreEntry>();
  [...(remote.scores || []), ...(local.scores || [])].forEach((s) => {
    if (!s || !s.username) return;
    const key =
      s.id || `${s.username}_${s.score}_${s.date}_${s.category || ""}`;
    scoreMap.set(key, s);
  });
  const mergedScores = Array.from(scoreMap.values()).sort(
    (a, b) => b.score - a.score
  );

  const tR = remote.tombstones || {};
  const tL = local.tombstones || {};
  const unseen = (kind: keyof Tombstones, userKey: string) =>
    (tR[kind]?.[userKey] || 0) > (tL[kind]?.[userKey] || 0);

  const mergedProgress: Record<string, Record<string, any>> = {
    ...(remote.progress || {}),
  };
  Object.keys(local.progress || {}).forEach((userKey) => {
    // Gerät kennt die Löschung / das Zurücksetzen noch nicht → seine alten Daten nicht zurückholen
    if (unseen("users", userKey) || unseen("progressReset", userKey)) return;
    const skipWrong = unseen("wrongReset", userKey);
    if (!mergedProgress[userKey]) {
      mergedProgress[userKey] = { ...local.progress[userKey] };
    } else {
      Object.keys(local.progress[userKey] || {}).forEach((catKey) => {
        if (skipWrong && (catKey === "wrongStats" || catKey === "_fehler")) return;
        if (catKey.startsWith("_")) {
          mergedProgress[userKey][catKey] = local.progress[userKey][catKey];
        } else if (catKey === "wrongStats") {
          const statsA = mergedProgress[userKey].wrongStats || {};
          const statsB = local.progress[userKey].wrongStats || {};
          const mergedStats: Record<string, number> = {};
          new Set([...Object.keys(statsA), ...Object.keys(statsB)]).forEach(
            (qId) => {
              const val = Math.max(
                cleanStatNumber(statsA[qId]),
                cleanStatNumber(statsB[qId])
              );
              if (val > 0) mergedStats[qId] = val;
            }
          );
          mergedProgress[userKey].wrongStats = mergedStats;
        } else {
          const arrA = Array.isArray(mergedProgress[userKey][catKey])
            ? mergedProgress[userKey][catKey]
            : [];
          const arrB = Array.isArray(local.progress[userKey][catKey])
            ? local.progress[userKey][catKey]
            : [];
          mergedProgress[userKey][catKey] = Array.from(
            new Set(
              [...arrA, ...arrB].filter((x) => x !== null && x !== undefined)
            )
          );
        }
      });
    }
  });

  // Battles einzeln zusammenführen, sonst überschreibt der veraltete lokale Stand das Ergebnis des Gegners
  const mergedBattles: Record<string, BattleEntry> = {
    ...(remote.battles || {}),
  };
  Object.keys(local.battles || {}).forEach((id) => {
    const l = (local.battles || {})[id];
    if (!l) return;
    mergedBattles[id] = mergedBattles[id]
      ? mergeBattleEntry(l, mergedBattles[id])
      : l;
  });

  const mergedLastSeen = { ...(remote.lastSeen || {}) };
  Object.keys(local.lastSeen || {}).forEach((userKey) => {
    const loc = local.lastSeen[userKey];
    const rem = mergedLastSeen[userKey];
    if (!rem || (loc?.timestamp || 0) >= (rem?.timestamp || 0)) {
      mergedLastSeen[userKey] = loc;
    }
  });

  const mergedWrongStats: Record<string, number> = {};
  const remWrong = remote.wrongStats || {};
  const locWrong = local.wrongStats || {};
  new Set([...Object.keys(remWrong), ...Object.keys(locWrong)]).forEach(
    (qId) => {
      const val = Math.max(
        cleanStatNumber(remWrong[qId]),
        cleanStatNumber(locWrong[qId])
      );
      if (val > 0) mergedWrongStats[qId] = val;
    }
  );

  let mergedPinboard =
    remote.pinboard !== undefined ? remote.pinboard : local.pinboard;
  if (local.pinboard && remote.pinboard) {
    mergedPinboard =
      (local.pinboard.timestamp || 0) >= (remote.pinboard.timestamp || 0)
        ? local.pinboard
        : remote.pinboard;
  }

  const uniqueProdsMap = new Map<string, CustomProductItem>();
  [...(remote.customProducts || []), ...(local.customProducts || [])].forEach(
    (p) => {
      if (p && p.id) uniqueProdsMap.set(p.id, p);
    }
  );

  const uniqueQuestionsMap = new Map<number, Question>();
  [...(remote.customQuestions || []), ...(local.customQuestions || [])].forEach(
    (q) => {
      if (q && q.id !== undefined && q.id !== null)
        uniqueQuestionsMap.set(q.id, q);
    }
  );

  return applyTombstones({
    scores: mergedScores,
    progress: mergedProgress,
    lastSeen: mergedLastSeen,
    battles: mergedBattles,
    wrongStats: mergedWrongStats,
    pinboard: mergedPinboard || null,
    customProducts: Array.from(uniqueProdsMap.values()),
    customQuestions: Array.from(uniqueQuestionsMap.values()),
    tombstones: mergeTombstones(remote.tombstones, local.tombstones),
    questionEdits: mergeQuestionEdits(remote.questionEdits, local.questionEdits),
    productFixes: mergeProductFixes(remote.productFixes, local.productFixes),
    pins: mergePins(remote.pins, local.pins),
    compactedUntil: Math.max(Number(remote.compactedUntil) || 0, Number(local.compactedUntil) || 0) || undefined,
  });
}

export function getExamEvaluation(points: number, total: number) {
  const pct = total > 0 ? Math.round((points / total) * 100) : 0;
  if (pct >= 92)
    return {
      grade: "Note 1 (Sehr gut)",
      pct,
      title: `${pct}%, Note 1 (Sehr gut) 🌟`,
      desc: "Herausragende Prüfungsleistung! (ab 92%)",
      passed: true,
      color: "#065f46",
      bg: "#d1fae5",
    };
  if (pct >= 81)
    return {
      grade: "Note 2 (Gut)",
      pct,
      title: `${pct}%, Note 2 (Gut) 👏`,
      desc: "Sehr sicheres Fachwissen! (81% bis 91%)",
      passed: true,
      color: "#065f46",
      bg: "#d1fae5",
    };
  if (pct >= 67)
    return {
      grade: "Note 3 (Befriedigend)",
      pct,
      title: `${pct}%, Note 3 (Befriedigend) 👍`,
      desc: "Solide Leistung, Prüfung sicher bestanden! (67% bis 80%)",
      passed: true,
      color: "#065f46",
      bg: "#ecfdf5",
    };
  if (pct >= 50)
    return {
      grade: "Note 4 (Ausreichend)",
      pct,
      title: `${pct}%, Note 4 (Ausreichend) ⚠️`,
      desc: "Prüfung bestanden (ab 50%), aber noch Lernpotenzial.",
      passed: true,
      color: "#b45309",
      bg: "#fef3c7",
    };
  if (pct >= 30)
    return {
      grade: "Note 5 (Mangelhaft)",
      pct,
      title: `${pct}%, Note 5 (Mangelhaft) ❌`,
      desc: "Leider nicht bestanden (unter 50%). Grundlagen wiederholen!",
      passed: false,
      color: "#9f1239",
      bg: "#ffe4e6",
    };
  return {
    grade: "Note 6 (Ungenügend)",
    pct,
    title: `${pct}%, Note 6 (Ungenügend) 📚`,
    desc: "Nicht bestanden. Bitte Lernkarten wiederholen!",
    passed: false,
    color: "#9f1239",
    bg: "#ffe4e6",
  };
}

export function shuffleQuestionOptions(q: any) {
  const originalOptions = q.options;
  const originalCorrectMulti: number[] = q.correctMulti || [
    q.correct !== undefined ? q.correct : 0,
  ];
  const indexedOptions = shuffleArray(
    originalOptions.map((opt: string, idx: number) => ({
      text: opt,
      isCorrect: originalCorrectMulti.includes(idx),
    }))
  );

  const newOptions = indexedOptions.map((item: any) => item.text);
  const newCorrectMulti: number[] = [];
  indexedOptions.forEach((item: any, idx: number) => {
    if (item.isCorrect) newCorrectMulti.push(idx);
  });

  return {
    ...q,
    options: newOptions,
    correct: newCorrectMulti[0] ?? 0,
    correctMulti: newCorrectMulti,
  };
}


// ───────────────────────── Neue Produkte vom Ausbilder ─────────────────────────
const ADDED_PRODUCT_NAMES = new Set<string>();
const hashName = (t: string) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };
const SUBGROUP_OF = (group: string, breadType?: string): string => {
  if (group === 'Brot') return breadType === 'schwarzbrot' || breadType === 'roggen' ? 'schwarzbrot' : breadType === 'roggenmisch' ? 'roggenmisch' : breadType === 'weizen' || breadType === 'weizenmisch' ? 'weizen' : 'stuten';
  if (group === 'Stuten & Brioche') return 'stuten';
  if (['Kuchen', 'Saisongebäck', 'Weihnachtsgebäck'].includes(group)) return 'kuchen';
  return 'broetchen';
};
const SLICE_OF: Record<string, string> = { schwarzbrot: '5,5 mm', roggen: '9 mm', roggenmisch: '9 mm', weizenmisch: '9 mm', dinkel: '9 mm', spezial: '9 mm', weizen: '12 mm', stuten: '12 mm' };
/** Allergene wie im Shop zusammenfassen: „Gluten (Weizen)“ + „Gluten (Roggen)“ → „Gluten (Weizen, Roggen)“ */
export function combineAllergens(list: string[]): string[] {
  const order: string[] = []; const subs: Record<string, string[]> = {};
  list.forEach(a => { const m = /^([^(]+?)\s*\(([^)]+)\)$/.exec(a.trim()); const head = m ? m[1].trim() : a.trim(); if (!subs[head]) { subs[head] = []; order.push(head); } if (m) m[2].split(',').map(x => x.trim()).forEach(x => { if (!subs[head].includes(x)) subs[head].push(x); }); });
  return order.map(h => (subs[h].length ? `${h} (${subs[h].join(', ')})` : h));
}

/** Neue Produkte ins Sortiment eintragen (Steckbriefe, Spiele) und Quizfragen dazu erzeugen */
export function registerNewProducts(list: any[]): Question[] {
  for (let i = SHOP_PRODUCTS.length - 1; i >= 0; i--) if (ADDED_PRODUCT_NAMES.has(SHOP_PRODUCTS[i].name)) SHOP_PRODUCTS.splice(i, 1);
  ADDED_PRODUCT_NAMES.clear();
  const base = SHOP_PRODUCTS.slice();
  const added: ShopProduct[] = [];
  (list || []).filter(p => p && p.targetArea === 'sortiment' && String(p.name || '').trim()).forEach(p => {
    const name = String(p.name).trim();
    if (SHOP_PRODUCTS.some(x => x.name.toLowerCase() === name.toLowerCase())) return;
    const traces: string[] = Array.isArray(p.traces) ? p.traces : [];
    const sp: ShopProduct = {
      name, group: p.group || 'Feingebäck', description: String(p.info || '').trim(), weight: p.weight || undefined, price: p.price || undefined,
      shortIngredients: String(p.shortIngredients || '').trim(), fullIngredients: String(p.fullIngredients || p.shortIngredients || '').trim(),
      allergens: combineAllergens(Array.isArray(p.allergens) ? p.allergens : []),
      allergenNote: traces.length ? `Kann Spuren enthalten: ${combineAllergens(traces).join(', ')}.` : undefined,
      breadType: p.breadType || undefined,
    } as ShopProduct;
    SHOP_PRODUCTS.push(sp); ADDED_PRODUCT_NAMES.add(name); added.push(sp);
  });
  const qs: Question[] = [];
  added.forEach(sp => {
    const h = hashName(sp.name);
    const idBase = 800000 + (h % 19000) * 10;
    const pick = <T,>(arr: T[], n: number, k = 0): T[] => { const out: T[] = []; const start = (h + k * 13) % Math.max(1, arr.length); for (let i = 0; i < arr.length && out.length < n; i++) { const v = arr[(start + i) % arr.length]; if (!out.includes(v)) out.push(v); } return out; };
    const sameGroup = base.filter(x => x.group === sp.group);
    const noSoja = (x: ShopProduct) => !/soja/i.test(x.allergens.join(' ') + ' ' + x.shortIngredients);
    const pool = (sameGroup.filter(noSoja).length >= 4 ? sameGroup : base).filter(noSoja);
    const sub = SUBGROUP_OF(sp.group, sp.breadType);
    const mk = (k: number, level: 'easy' | 'hard', question: string, right: string, wrong: string[], explanation: string) => {
      const opts = [right, ...wrong.filter(w => w && w !== right)].slice(0, 4);
      if (opts.length < 4) return;
      const pos = (h + k) % 4; const arr = opts.slice(1); arr.splice(pos, 0, right);
      qs.push({ id: idBase + k, category: 'Sortiment & Warenkunde', level, question, options: arr, correct: pos, explanation, product: sp.name, subgroup: sub } as Question);
    };
    if (sp.shortIngredients) mk(0, 'easy', `Ein Kunde fragt, was in „${sp.name}“ steckt. Was sagst du?`, sp.shortIngredients, pick(pool.map(x => x.shortIngredients).filter(t => t && t !== sp.shortIngredients), 3, 1), `${sp.name}: ${sp.shortIngredients}.`);
    const allTxt = sp.allergens.length ? sp.allergens.join(', ') : 'Keine angegeben';
    const allKey = (t: string) => t.split(/,\s*(?![^()]*\))/).map(x => x.trim()).sort().join('|');
    const allPool = Array.from(new Set(pool.concat(base.filter(noSoja)).map(x => (x.allergens.length ? x.allergens.join(', ') : 'Keine angegeben')))).filter(t => allKey(t) !== allKey(allTxt) && !/^Gluten, /.test(t));
    mk(1, 'hard', `Welche Allergene sind bei „${sp.name}“ angegeben?`, allTxt, pick(allPool, 3, 2), `${sp.name} enthält: ${allTxt}.${sp.allergenNote ? ' ' + sp.allergenNote : ''}`);
    if (sp.price && /\d+,\d\d/.test(sp.price)) { const c = centsOf(sp.price); mk(2, 'hard', `Was kostet „${sp.name}“?`, priceText(c), [priceText(c + 30), priceText(Math.max(10, c - 40)), priceText(c + 70)], `${sp.name}: ${priceText(c)}.`); }
    const groups = Array.from(new Set(base.map(x => x.group))).filter(g => g !== sp.group && g !== 'Sonstiges' && g !== 'Backmischung');
    mk(3, 'easy', `Zu welcher Warengruppe gehört „${sp.name}“?`, sp.group, pick(groups, 3, 3), `${sp.name} gehört zur Gruppe „${sp.group}“.`);
    if (sp.description) {
      const first = (sp.description.match(/[^.!?]+[.!?]/) || [sp.description])[0].trim();
      const own = first.split(sp.name).join('…').replace(/^(Unser|Unsere|Unseren)\s+…\S*/, 'Dieses Produkt');
      const others = pick(pool.filter(x => x.description && x.name !== sp.name), 6, 4).map(x => neutralDescription(((x.description.match(/[^.!?]+[.!?]/) || [x.description])[0]).split(x.name).join('…'))).filter(t => t !== own);
      mk(4, 'easy', `Welche Beschreibung passt zu „${sp.name}“?`, own, others.slice(0, 3), `${sp.name}: ${first}`);
    }
    if (sp.breadType && SLICE_OF[sp.breadType]) mk(5, 'easy', `Mit welcher Schnittstärke wird „${sp.name}“ an der Brotschneidemaschine geschnitten?`, SLICE_OF[sp.breadType], ['5,5 mm', '9 mm', '12 mm', '15 mm'].filter(x => x !== SLICE_OF[sp.breadType!]), `${sp.name} wird mit ${SLICE_OF[sp.breadType]} geschnitten.`);
  });
  return qs;
}
// ───────────── Ausbilder-Anmeldung über Firebase Authentication (E-Mail + Passwort) ─────────────
// Ohne zusätzliches npm-Paket: Die App spricht die offizielle REST-Schnittstelle von Firebase an.
// Der Web-API-Schlüssel ist kein Geheimnis (er steht in jeder Firebase-Web-App). Geschützt wird über
// die Datenbankregeln: Nur das Ausbilder-Konto darf Fragen, Artikel, Pinnwand, Fotos und Löschungen schreiben.
export const FIREBASE_API_KEY = 'AIzaSyBsLXL3DOgG6qITKtPHbw3I0azA4ztjTco';

type AdminSession = { idToken: string; refreshToken: string; exp: number; uid: string; email: string };
const ADMIN_AUTH_KEY = 'hinkel_admin_auth';
export const ADMIN_EXPIRED_EVENT = 'hinkel-admin-expired';

function readAdminSession(): AdminSession | null {
  try {
    const s = JSON.parse(localStorage.getItem(ADMIN_AUTH_KEY) || 'null');
    return s && s.refreshToken && s.uid ? s : null;
  } catch { return null; }
}
function writeAdminSession(s: AdminSession | null) {
  try { if (s) localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(s)); else localStorage.removeItem(ADMIN_AUTH_KEY); } catch {}
}
export function hasAdminSession(): boolean { return !!readAdminSession(); }
export function adminSignOut() { writeAdminSession(null); }

export async function adminSignIn(email: string, password: string): Promise<string> {
  if (!FIREBASE_API_KEY) return 'Die Ausbilder-Anmeldung ist noch nicht eingerichtet (API-Schlüssel fehlt in utils.ts).';
  let res: Response;
  try {
    res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
    });
  } catch { return 'Keine Verbindung. Bitte Internet prüfen und nochmal versuchen.'; }
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = String(data?.error?.message || '');
    if (code.startsWith('TOO_MANY_ATTEMPTS')) return 'Zu viele Versuche. Bitte in ein paar Minuten nochmal probieren.';
    if (code.startsWith('USER_DISABLED')) return 'Dieses Konto ist gesperrt.';
    if (code.startsWith('INVALID_EMAIL')) return 'Die E-Mail-Adresse ist ungültig.';
    if (code.startsWith('API_KEY') || code.includes('API key')) return 'Der API-Schlüssel in utils.ts stimmt nicht.';
    if (code.startsWith('OPERATION_NOT_ALLOWED')) return 'In Firebase ist die Anmeldung mit E-Mail/Passwort noch nicht eingeschaltet.';
    return 'E-Mail oder Passwort stimmt nicht.';
  }
  writeAdminSession({ idToken: data.idToken, refreshToken: data.refreshToken, exp: Date.now() + (Number(data.expiresIn) || 3600) * 1000, uid: data.localId, email: data.email });
  return '';
}

// Der Anmelde-Schlüssel (idToken) gilt 1 Stunde und wird bei Bedarf still erneuert.
async function refreshSession(s: AdminSession, save: (x: AdminSession | null) => void, onDead: () => void): Promise<string | null> {
  try {
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(s.refreshToken)}`,
    });
    if (res.status === 400 || res.status === 401 || res.status === 403) { save(null); onDead(); return null; }
    if (!res.ok) return null;
    const d: any = await res.json();
    save({ ...s, idToken: d.id_token, refreshToken: d.refresh_token || s.refreshToken, exp: Date.now() + (Number(d.expires_in) || 3600) * 1000 });
    return d.id_token as string;
  } catch { return null; }
}

let refreshing: Promise<string | null> | null = null;
export async function getAdminToken(): Promise<string | null> {
  const s = readAdminSession();
  if (!s) return null;
  if (s.idToken && s.exp - Date.now() > 60000) return s.idToken;
  if (refreshing) return refreshing;
  refreshing = refreshSession(s, writeAdminSession, () => {
    // Konto gelöscht/gesperrt oder Passwort geändert: neu anmelden
    try { window.dispatchEvent(new Event(ADMIN_EXPIRED_EVENT)); } catch {}
  }).finally(() => { refreshing = null; });
  return refreshing;
}

// ── Unsichtbare Anmeldung für alle Mitarbeiter (Firebase „Anonym“) ──
// Damit kann die Datenbank Zugriffe ohne App ablehnen. Für die Kollegen ändert sich nichts.
const ANON_AUTH_KEY = 'hinkel_anon_auth';
function readAnon(): AdminSession | null {
  try { const s = JSON.parse(localStorage.getItem(ANON_AUTH_KEY) || 'null'); return s && s.refreshToken ? s : null; } catch { return null; }
}
function writeAnon(s: AdminSession | null) {
  try { if (s) localStorage.setItem(ANON_AUTH_KEY, JSON.stringify(s)); else localStorage.removeItem(ANON_AUTH_KEY); } catch {}
}
let anonPending: Promise<string | null> | null = null;
let anonRetryAt = 0;
async function anonSignUp(): Promise<string | null> {
  if (Date.now() < anonRetryAt) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }),
    });
    if (!res.ok) { anonRetryAt = Date.now() + 60000; return null; }
    const d: any = await res.json();
    writeAnon({ idToken: d.idToken, refreshToken: d.refreshToken, exp: Date.now() + (Number(d.expiresIn) || 3600) * 1000, uid: d.localId, email: '' });
    return d.idToken as string;
  } catch { anonRetryAt = Date.now() + 15000; return null; }
}
async function getAnonToken(): Promise<string | null> {
  if (!FIREBASE_API_KEY) return null;
  const s = readAnon();
  if (s && s.idToken && s.exp - Date.now() > 60000) return s.idToken;
  if (anonPending) return anonPending;
  anonPending = (async () => {
    if (s) {
      const t = await refreshSession(s, writeAnon, () => {});
      if (t) return t;
      if (readAnon()) return null; // nur Netzproblem: später nochmal
    }
    return anonSignUp();
  })().finally(() => { anonPending = null; });
  return anonPending;
}

/** Hängt den Anmelde-Schlüssel an eine Firebase-Datenbank-Adresse an (Ausbilder oder unsichtbare Anmeldung) */
export async function withAuth(url: string): Promise<string> {
  if (!/firebaseio\.com|firebasedatabase\.app/.test(url)) return url;
  const t = hasAdminSession() ? await getAdminToken() : await getAnonToken();
  return t ? `${url}${url.includes('?') ? '&' : '?'}auth=${encodeURIComponent(t)}` : url;
}
/** Alter Name, gleiche Funktion */
export const withAdminAuth = withAuth;

/** Bereiche, die nur der Ausbilder schreiben darf (müssen zu den Datenbankregeln passen) */
const ADMIN_ONLY_KEYS = ['customQuestions', 'customProducts', 'questionEdits', 'productFixes', 'pinboard', 'compactedUntil'];
/** Entfernt aus einer Änderung alles, was ein Mitarbeiter nicht schreiben darf.
 *  Sonst würde Firebase die ganze Änderung ablehnen und die Punkte kämen nie an. */
export function stripAdminOnly(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  Object.keys(patch).forEach((k) => {
    const [top, sub] = k.split('/');
    if (ADMIN_ONLY_KEYS.includes(top)) return;
    if (top === 'tombstones') {
      // Mitarbeiter dürfen nur „eigenen Fortschritt zurückgesetzt“ vermerken
      if (sub === 'progressReset') out[k] = patch[k];
      else if (!sub && patch[k] && patch[k].progressReset) out['tombstones/progressReset'] = patch[k].progressReset;
      return;
    }
    out[k] = patch[k];
  });
  return out;
}

// ───────────── Bestenliste aufräumen ─────────────
// Einzelrunden vor dem Stichtag werden pro Person, Spiel und Monat zu einem Eintrag zusammengefasst.
// Summe, Anzahl der Runden (n) und Bestwert (best) bleiben erhalten. So stimmen Gesamtpunkte, Level,
// Monatskronen, Runden und Bestwerte weiter, nur die Tages-Details alter Monate entfallen.
export function compactCutoff(now = new Date(), keepMonths = 3): number {
  return new Date(now.getFullYear(), now.getMonth() - keepMonths, 1).getTime();
}
export function compactScores(scores: ScoreEntry[], cutoff: number): { scores: ScoreEntry[]; before: number; after: number; merged: number } {
  const keep: ScoreEntry[] = [];
  const groups = new Map<string, ScoreEntry & { _t: number }>();
  let merged = 0;
  (scores || []).forEach((s) => {
    if (!s || !s.username) return;
    const t = scoreTime(s);
    if (!t || t >= cutoff) { keep.push(s); return; }
    const d = new Date(t);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const uk = s.username.toLowerCase();
    const cat = s.category || "";
    const key = `${uk}|${cat}|${ym}`;
    const n = Number(s.n) || 1;
    const v = Number(s.score) || 0;
    const best = s.n ? Number(s.best ?? v) : v;
    const g = groups.get(key);
    if (!g) {
      let h = 0; for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
      groups.set(key, {
        id: `sum-${uk}-${ym}-${h.toString(36)}`, username: s.username, score: v,
        date: `01.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear()).slice(2)}`,
        ...(cat ? { category: cat } : {}), n, best, _t: t,
      });
    } else {
      g.score += v; g.n = (g.n || 0) + n; g.best = Math.max(Number(g.best) || 0, best);
      if (t > g._t) { g._t = t; g.username = s.username; } // neueste Schreibweise des Namens
    }
    if (!s.n) merged++;
  });
  const sums = Array.from(groups.values()).map(({ _t, ...rest }) => rest as ScoreEntry);
  const out = [...keep, ...sums];
  return { scores: out, before: (scores || []).length, after: out.length, merged };
}
