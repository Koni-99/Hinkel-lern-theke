// ═══ Produktliste aus Excel übernehmen (Ausbilder) ═══
// Liest die Shop-Produktliste (z. B. „Hinkel_Produktliste_Shopify_korrigiert.xlsx“), sucht in allen Blättern die Spalten
// Produktname, Preis, Allergene, Zutaten, Beschreibung, Vegan, Gewicht und vergleicht sie mit den Produkten der App.
// Der Ausbilder wählt, welche Felder übernommen werden. Gespeichert wird als Korrektur unter `productFixes`
// (wie die Korrekturen aus den Fehlermeldungen), die Original-Daten der App bleiben erhalten.

export type ImportFeld = 'preis' | 'allergene' | 'zutaten' | 'beschreibung' | 'vegan' | 'gewicht';
export const IMPORT_FELDER: { id: ImportFeld; label: string }[] = [
  { id: 'preis', label: 'Preis' },
  { id: 'allergene', label: 'Allergene' },
  { id: 'zutaten', label: 'Vollständige Zutaten' },
  { id: 'beschreibung', label: 'Beschreibung' },
  { id: 'vegan', label: 'Vegan ja/nein' },
  { id: 'gewicht', label: 'Gewicht' },
];

export type AppProdukt = { name: string; aliases?: string[]; price?: string; pricePerKg?: string; allergens: string[]; allergenNote?: string; fullIngredients: string; description: string; vegan?: boolean; weight?: string };
export type Aenderung = { produkt: string; feld: ImportFeld; alt: string; neu: string; wert: Record<string, unknown> };
export type ImportVergleich = { aenderungen: Aenderung[]; gefunden: number; unbekannt: string[]; spalten: ImportFeld[] };

const key = (n: unknown) => String(n ?? '').toLowerCase().replace(/[^a-zäöüß0-9]/g, '');
const txt = (v: unknown) => (v === null || v === undefined ? '' : String(v)).replace(/\s+/g, ' ').trim();
const leer = (v: string) => !v || v === 'None' || v === '-' || v === '–';

/** Spaltennamen der Excel-Liste → Feld (erste passende Spalte gewinnt, genauere Namen zuerst) */
const SPALTEN: [ImportFeld | 'name', RegExp][] = [
  ['name', /^produktname$|^produkt$|^artikel$|^name$/i],
  ['preis', /^preis filiale/i], ['preis', /^preis$/i],
  ['allergene', /^allergene$/i],
  ['zutaten', /^zutaten$|^vollständige zutaten/i],
  ['beschreibung', /^vollständige beschreibung$/i], ['beschreibung', /^beschreibung$/i],
  ['vegan', /^vegan$/i],
  ['gewicht', /^produktgewicht|^gewicht/i],
];

/** Alle Blätter lesen und pro Produkt die Werte sammeln */
export function zeilenSammeln(blaetter: { data: unknown[][] }[]): { werte: Map<string, { name: string } & Partial<Record<ImportFeld, string>>>; spalten: Set<ImportFeld> } {
  const werte = new Map<string, { name: string } & Partial<Record<ImportFeld, string>>>();
  const spalten = new Set<ImportFeld>();
  blaetter.forEach(({ data }) => {
    const kopfIdx = data.findIndex((r) => Array.isArray(r) && r.some((c) => /^produktname$|^produkt$/i.test(txt(c))));
    if (kopfIdx < 0) return;
    const kopf = data[kopfIdx].map(txt);
    const map: Partial<Record<ImportFeld | 'name', number>> = {};
    SPALTEN.forEach(([feld, rx]) => { if (map[feld] !== undefined) return; const i = kopf.findIndex((k) => rx.test(k)); if (i >= 0) map[feld] = i; });
    if (map.name === undefined) return;
    (Object.keys(map) as (ImportFeld | 'name')[]).forEach((f) => { if (f !== 'name') spalten.add(f); });
    data.slice(kopfIdx + 1).forEach((r) => {
      if (!Array.isArray(r)) return;
      const name = txt(r[map.name as number]);
      if (leer(name)) return;
      const k = key(name);
      const e = werte.get(k) || { name };
      (Object.keys(map) as (ImportFeld | 'name')[]).forEach((f) => {
        if (f === 'name') return;
        const raw = r[map[f] as number];
        const v = f === 'zutaten' || f === 'beschreibung' ? String(raw ?? '').replace(/\r/g, '').replace(/[ \t]*\n[ \t]*/g, ' ').replace(/ {2,}/g, ' ').trim() : txt(raw);
        if (!leer(v) && !e[f]) e[f] = v;
      });
      werte.set(k, e);
    });
  });
  return { werte, spalten };
}

const euro = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
/** „2,9“, 2.9, „2,90 €“, „15,00 € / kg“ → { price } oder { pricePerKg } */
export function preisWert(v: string): { price?: string; pricePerKg?: string } | null {
  const m = /(\d+)(?:[,.](\d{1,2}))?/.exec(v);
  if (!m) return null;
  const n = Number(`${m[1]}.${(m[2] || '0').padEnd(2, '0')}`);
  if (!(n > 0)) return null;
  return /\/\s*kg/i.test(v) ? { pricePerKg: `${euro(n)} / kg` } : { price: euro(n) };
}

/** „Gluten (Weizen), Milch · Kann Spuren enthalten: Soja“ → Liste + Hinweis */
export function allergenWert(v: string): { allergens: string[]; allergenNote?: string } {
  const [haupt, spur] = v.split(/kann spuren enthalten:?/i);
  const allergens = haupt.replace(/·/g, ',').split(/,\s*(?![^()]*\))/).map((s) => s.trim()).filter((s) => s && !/^keine?$/i.test(s));
  return spur && spur.trim() ? { allergens, allergenNote: `Kann Spuren enthalten: ${spur.trim().replace(/\.$/, '')}.` } : { allergens };
}

export function vergleichen(blaetter: { data: unknown[][] }[], produkte: AppProdukt[], felder: ImportFeld[]): ImportVergleich {
  const { werte, spalten } = zeilenSammeln(blaetter);
  const appBy = new Map<string, AppProdukt>();
  produkte.forEach((p) => [p.name, ...(p.aliases || [])].forEach((n) => appBy.set(key(n), p)));
  const aenderungen: Aenderung[] = [];
  const unbekannt: string[] = [];
  let gefunden = 0;
  werte.forEach((e, k) => {
    const p = appBy.get(k);
    if (!p) { unbekannt.push(e.name); return; }
    gefunden++;
    const add = (feld: ImportFeld, alt: string, neu: string, wert: Record<string, unknown>) => { if (txt(alt) !== txt(neu)) aenderungen.push({ produkt: p.name, feld, alt, neu, wert }); };
    felder.forEach((f) => {
      const v = e[f];
      if (!v) return;
      if (f === 'preis') {
        const w = preisWert(v); if (!w) return;
        if (w.pricePerKg) add('preis', p.pricePerKg || '–', w.pricePerKg, w); else add('preis', p.price || '–', w.price!, w);
      } else if (f === 'allergene') {
        const w = allergenWert(v);
        const zeig = (a: string[], n?: string) => `${a.join(', ') || 'keine'}${n ? ` · ${n}` : ''}`;
        add('allergene', zeig(p.allergens, p.allergenNote), zeig(w.allergens, w.allergenNote), { allergens: w.allergens, allergenNote: w.allergenNote || '' });
      } else if (f === 'zutaten') {
        if (/^siehe /i.test(v)) return;
        add('zutaten', p.fullIngredients, v, { fullIngredients: v });
      } else if (f === 'beschreibung') {
        add('beschreibung', p.description, v, { description: v });
      } else if (f === 'vegan') {
        const ja = /^ja$/i.test(v), nein = /^nein$/i.test(v); if (!ja && !nein) return;
        add('vegan', p.vegan ? 'Ja' : 'Nein', ja ? 'Ja' : 'Nein', { vegan: ja });
      } else if (f === 'gewicht') {
        const n = Number(String(v).replace(',', '.')); if (!(n > 0)) return;
        add('gewicht', p.weight || '–', `${Math.round(n)} g`, { weight: `${Math.round(n)} g` });
      }
    });
  });
  return { aenderungen, gefunden, unbekannt, spalten: [...spalten] };
}
