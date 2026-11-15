// ═══ Produkte: Korrekturen des Ausbilders, neue Produkte als Fragen ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.
import { CloudPayload } from '../types';
import type { Question } from '../daten/questions';
import { refixAlternativeQuestion, neutralDescription } from '../daten/questions';
import type { ShopProduct } from '../daten/shopProducts';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { ALT_MAP } from '../daten/data';

// Originaldaten merken, damit Korrekturen zurückgenommen werden können
export type ProductOriginal = { price?: string; shortIngredients: string; allergens: string[]; pricePerKg?: string; allergenNote?: string; fullIngredients: string; description: string; vegan?: boolean; weight?: string };

export const PRODUCT_ORIGINALS = new Map<string, ProductOriginal>();

export const ALT_ORIGINALS = new Map<string, string[] | undefined>();

export let activeProductFixes: NonNullable<CloudPayload['productFixes']> = {};

/** Korrekturen des Ausbilders auf Sortiment und Alternativen anwenden (wirkt in allen Spielen) */
export function applyProductFixes(fixes?: CloudPayload['productFixes']) {
  // erst alles auf Original zurück …
  PRODUCT_ORIGINALS.forEach((orig, name) => {
    const p = SHOP_PRODUCTS.find(x => x.name === name);
    if (p) { p.price = orig.price; p.shortIngredients = orig.shortIngredients; p.allergens = [...orig.allergens]; p.pricePerKg = orig.pricePerKg; p.allergenNote = orig.allergenNote; p.fullIngredients = orig.fullIngredients; p.description = orig.description; p.vegan = orig.vegan; p.weight = orig.weight; }
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
      if (!PRODUCT_ORIGINALS.has(name)) PRODUCT_ORIGINALS.set(name, { price: p.price, shortIngredients: p.shortIngredients, allergens: [...p.allergens], pricePerKg: p.pricePerKg, allergenNote: p.allergenNote, fullIngredients: p.fullIngredients, description: p.description, vegan: p.vegan, weight: p.weight });
      if (typeof f.price === 'string' && f.price.trim()) p.price = f.price.trim();
      if (typeof f.shortIngredients === 'string' && f.shortIngredients.trim()) p.shortIngredients = f.shortIngredients.trim();
      if (Array.isArray(f.allergens)) p.allergens = [...f.allergens];
      // Felder aus der Excel-Produktliste
      if (typeof f.pricePerKg === 'string' && f.pricePerKg.trim()) p.pricePerKg = f.pricePerKg.trim();
      if (typeof f.allergenNote === 'string') p.allergenNote = f.allergenNote.trim() || undefined;
      if (typeof f.fullIngredients === 'string' && f.fullIngredients.trim()) p.fullIngredients = f.fullIngredients.trim();
      if (typeof f.description === 'string' && f.description.trim()) p.description = f.description.trim();
      if (typeof f.vegan === 'boolean') p.vegan = f.vegan;
      if (typeof f.weight === 'string' && f.weight.trim()) p.weight = f.weight.trim();
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

export const priceText = (cents: number) => (cents / 100).toFixed(2).replace('.', ',') + ' €';

export const centsOf = (s?: string) => { const m = (s || '').match(/(\d+),(\d\d)/); return m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 0; };

/** Tipp für den Zusatzverkauf im Steckbrief (Überschrift setzt der Steckbrief): aus der Beschreibung („perfekt zu …“),
 *  sonst passend zur Gruppe, was man dem Kunden noch anbieten kann. Ohne Gedankenstriche (Wunsch des Nutzers) */
export function getSalesTip(product: ShopProduct): string {
  const desc = product.description || '';
  const m = desc.match(/\b((?:perfekt|ideal|besonders gut geeignet|passt (?:wunderbar|hervorragend|gut|prima)) (?:zu|für|als) [^.!]+)[.!]/i);
  if (m) return `${m[1].charAt(0).toUpperCase()}${m[1].slice(1)}. Das kannst du dem Kunden gleich mit anbieten.`;
  const groupTips: Record<string, string> = {
    'Brot': 'Frag, ob noch frische Brötchen fürs Frühstück dazu sollen.',
    'Brötchen': 'Frag, ob noch etwas Süßes dazu darf, zum Beispiel ein Croissant.',
    'Kleingebäck': 'Frag, ob noch ein Kaffee oder ein süßes Teilchen dazu darf.',
    'Feingebäck': 'Frag, ob noch ein Kaffee dazu darf.',
    'Kuchen': 'Frag, ob es für die Kaffeetafel noch ein Stück mehr sein darf.',
    'Stuten & Brioche': 'Zum Sonntagsfrühstück passen noch frische Brötchen dazu.',
    'Herzhafte Snacks': 'Frag, ob noch ein Getränk oder etwas Süßes für danach dazu darf.',
    'Weihnachtsgebäck': 'Ein schönes Mitbringsel. Frag, ob es zum Verschenken noch eine zweite Packung sein darf.',
    'Saisongebäck': 'Gibt es nur eine Zeit lang. Frag, ob gleich eins mehr für die Familie mit soll.',
  };
  return groupTips[product.group] || 'Frag, ob noch etwas dazu darf, zum Beispiel ein Brötchen oder ein süßes Teilchen.';
}

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

// ───────────────────────── Neue Produkte vom Ausbilder ─────────────────────────
export const ADDED_PRODUCT_NAMES = new Set<string>();

export const hashName = (t: string) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };

export const SUBGROUP_OF = (group: string, breadType?: string): string => {
  if (group === 'Brot') return breadType === 'schwarzbrot' || breadType === 'roggen' ? 'schwarzbrot' : breadType === 'roggenmisch' ? 'roggenmisch' : breadType === 'weizen' || breadType === 'weizenmisch' ? 'weizen' : 'stuten';
  if (group === 'Stuten & Brioche') return 'stuten';
  if (['Kuchen', 'Saisongebäck', 'Weihnachtsgebäck'].includes(group)) return 'kuchen';
  return 'broetchen';
};

export const SLICE_OF: Record<string, string> = { schwarzbrot: '5,5 mm', roggen: '9 mm', roggenmisch: '9 mm', weizenmisch: '9 mm', dinkel: '9 mm', spezial: '9 mm', weizen: '12 mm', stuten: '12 mm' };

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
