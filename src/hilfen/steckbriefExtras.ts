// ═══ Version 250: Extras im Steckbrief ═══
// Backtage (aus dem Backkalender), „Preis geändert am …“ (2 Wochen lang), zuletzt angesehene Steckbriefe (im Gerät).
import { BASE_BAKING_SCHEDULE } from '../daten/data';
import { activeProductFixes } from './produkte';
import { SHOP_PRODUCTS } from '../daten/shopProducts';

const norm = (s: string) => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z]/g, '');

/** Passt ein Eintrag im Backkalender (z. B. „Mandelhörnchen, Bärentatzen, Tigertatzen & Co.“) zum Produkt? */
export function kalenderPasst(eintrag: string, produkt: string): boolean {
  const p = norm(produkt);
  if (p.length < 4) return false;
  return eintrag.split(/,|&|\bund\b/).map((t) => norm(t.replace(/\bCo\.?/g, ''))).filter((t) => t.length >= 5)
    .some((t) => t === p || t.startsWith(p) || (p.startsWith(t) && t.length >= 6));
}

const TAGE_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Backtage eines Produkts laut Backkalender: Tage (Mo, Di, …) und der Hinweis dazu. null = jeden Tag / nicht im Kalender */
export function backtageVon(produkt: string, plan: typeof BASE_BAKING_SCHEDULE = BASE_BAKING_SCHEDULE): { tage: string[]; info: string } | null {
  const tage: string[] = []; let info = '';
  [1, 2, 3, 4, 5, 6, 0].forEach((d) => {
    const tag = plan[d]; if (!tag) return;
    const it = tag.items.find((x) => kalenderPasst(x.name, produkt));
    if (it) { tage.push(TAGE_KURZ[d]); if (!info && it.info) info = it.info; }
  });
  return tage.length ? { tage, info } : null;
}

export const PREIS_NEU_TAGE = 14;

/** Hat der Ausbilder den Preis in den letzten 2 Wochen geändert? */
export function preisGeaendert(produkt: string, jetzt = Date.now()): { am: number; vorher?: string } | null {
  const f: any = activeProductFixes[produkt];
  if (!f || !f.price || !f.priceTs) return null;
  if (jetzt - f.priceTs > PREIS_NEU_TAGE * 86400000) return null;
  return { am: f.priceTs, vorher: f.priceVorher || undefined };
}

/** Preis-Änderung in eine Korrektur schreiben (Ausbilder): merkt Datum und alten Preis, wenn der Preis neu ist */
export function preisMerken(fix: Record<string, any>, alterFix: Record<string, any> | undefined, preisVorher: string | undefined, jetzt = Date.now()) {
  const neu = typeof fix.price === 'string' ? fix.price.trim() : '';
  const vorher = (preisVorher || '').trim();
  if (neu && neu !== vorher) { fix.priceTs = jetzt; if (vorher) fix.priceVorher = vorher; }
  else if (neu && alterFix && alterFix.price === neu && alterFix.priceTs) { fix.priceTs = alterFix.priceTs; if (alterFix.priceVorher) fix.priceVorher = alterFix.priceVorher; }
  return fix;
}

// ── Zuletzt angesehene Steckbriefe (Spickzettel), nur in diesem Gerät ──
const ZULETZT_KEY = 'lt_zuletzt_sb';
export const ZULETZT_MAX = 8;
export function zuletztLesen(): string[] {
  try { const a = JSON.parse(localStorage.getItem(ZULETZT_KEY) || '[]'); return Array.isArray(a) ? a.filter((x) => typeof x === 'string').slice(0, ZULETZT_MAX) : []; } catch { return []; }
}
export function zuletztMerken(name: string): string[] {
  const neu = [name, ...zuletztLesen().filter((x) => x !== name)].slice(0, ZULETZT_MAX);
  try { localStorage.setItem(ZULETZT_KEY, JSON.stringify(neu)); } catch { /* egal */ }
  return neu;
}

/** Version 250: Welche Produkte kommen in einem Text vor? (z. B. Kundenfrage → passender Steckbrief) Längste Namen zuerst, höchstens 3. */
export function produkteImText(text: string, max = 3): string[] {
  const t = ' ' + text.toLowerCase().replace(/[^a-zäöüß0-9]+/g, ' ') + ' ';
  const namen = SHOP_PRODUCTS.flatMap((p) => [p.name, ...(p.aliases || [])].map((n) => ({ p: p.name, n: n.toLowerCase().replace(/[^a-zäöüß0-9]+/g, ' ').trim() })))
    .filter((x) => x.n.length >= 4).sort((a, b) => b.n.length - a.n.length);
  const treffer: string[] = []; let rest = t;
  for (const x of namen) {
    // auch Mehrzahl/Fälle: „Berlinern“, „Laugenbrezeln“
    const re = new RegExp(' ' + x.n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(n|e|en|s)? ');
    if (re.test(rest)) { if (!treffer.includes(x.p)) treffer.push(x.p); rest = rest.replace(re, ' # '); }
    if (treffer.length >= max) break;
  }
  return treffer;
}
