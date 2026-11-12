// ═══ Theken-Simulator: Grundlagen (Typen, Produktlisten, Kunden-Typen) ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { shuffleArray } from '../../utils';
import { SHOP_PRODUCTS } from '../../shopProducts';
import { LearnItem } from '../spielBasis';

// ═══════════════════════════════════════════════════════════════════════════
//  THEKEN-SIMULATOR, Verkaufsgespräche im Chat, alles aus den echten Produktdaten
// ═══════════════════════════════════════════════════════════════════════════

export type ShopItem = (typeof SHOP_PRODUCTS)[number];

export type SimOpt = { text: string; correct: boolean; why?: string; noPad?: boolean };

export type SimStep = { customer: string[]; options: SimOpt[]; topic: string; afterWrong?: string; prices?: BasketLine[]; learn?: LearnItem; tipStep?: boolean };

export type BasketLine = { name: string; qty: number; cents: number };

export type Persona = { name: string; title: string; who: string };

export type Conversation = { persona: Persona; steps: SimStep[]; endLines: string[]; tipCents?: number; coreKey?: string; coreTopics?: string[] };

export type ChatMsg = { from: 'customer' | 'seller' | 'note-ok' | 'note-bad'; text: string };

export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const sample = <T,>(arr: T[], n: number): T[] => shuffleArray([...arr]).slice(0, n);

export const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** n Ablenker, deren Namen ähnlich lang sind wie der richtige, so verrät die Länge nichts */
export const closeByName = (list: ShopItem[], right: ShopItem, n: number): ShopItem[] =>
  sample(shuffleArray([...list]).sort((a, b) => Math.abs(a.name.length - right.name.length) - Math.abs(b.name.length - right.name.length)).slice(0, Math.max(n + 2, 5)), n);

export const parseCents = (price?: string) => {
  if (!price || price.startsWith('ab') || price.includes('(')) return 0;
  const m = price.match(/(\d+),(\d\d)/);
  return m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 0;
};

export const NOT_FOR_SALE = ['Sonstiges', 'Backmischung', 'Weihnachtsgebäck', 'Saisongebäck'];

export const BUYABLE = SHOP_PRODUCTS.filter(p => !NOT_FOR_SALE.includes(p.group) && parseCents(p.price) > 0 && parseCents(p.price) <= 2000);

export const BREADS = BUYABLE.filter(p => !!p.breadType);

export const SWEETS = BUYABLE.filter(p => p.group === 'Feingebäck');

export const ROLLS = BUYABLE.filter(p => p.group === 'Brötchen');

export const SLICE: Record<string, string> = { schwarzbrot: '5,5 mm', roggen: '9 mm', roggenmisch: '9 mm', weizenmisch: '9 mm', dinkel: '9 mm', spezial: '9 mm', weizen: '12 mm', stuten: '12 mm' };

export const TYPE_LABEL: Record<string, string> = { schwarzbrot: 'Vollkornschwarzbrot', roggen: 'Roggenbrot', roggenmisch: 'Roggenmischbrot', weizenmisch: 'Weizenmischbrot', dinkel: 'Dinkelbrot', spezial: 'Spezialbrot', weizen: 'Weizenbrot', stuten: 'Stuten & Brioche' };

export const isNut = (a: string) => /^schalenfrüchte|mandel|pistazie|haselnu|walnu/i.test(a);

export const ALLERGY_TARGETS: { key: string; label: string; verb: 'ist' | 'sind'; neg: string; says: string[] }[] = [
  { key: 'Milch', label: 'Milch', verb: 'ist', neg: 'keine Milch', says: ['Ich vertrage leider keine Milch.', 'Mein Sohn hat eine Milchallergie.', 'Bei mir darf keine Milch rein, Laktose und Milcheiweiß vertrage ich nicht.'] },
  { key: 'Nüsse', label: 'Nüsse', verb: 'sind', neg: 'keine Nüsse', says: ['Meine Tochter hat eine Nussallergie.', 'Ich bin allergisch gegen Nüsse und Mandeln.', 'Mein Mann verträgt überhaupt keine Nüsse.'] },
  { key: 'Sesamsamen', label: 'Sesam', verb: 'ist', neg: 'kein Sesam', says: ['Ich habe eine Sesam-Allergie.', 'Mein Enkel verträgt keinen Sesam.'] },
  { key: 'Eier', label: 'Ei', verb: 'ist', neg: 'kein Ei', says: ['Ich darf keine Eier essen.', 'Mein Sohn hat eine Ei-Allergie.'] },
];

export const hasAllergen = (p: ShopItem, key: string) => key === 'Nüsse' ? p.allergens.some(isNut) : key === 'Sesamsamen' ? p.allergens.some(a => /^sesam/i.test(a)) : p.allergens.some(a => a === key || a.startsWith(key + ' '));

export const allergenText = (p: ShopItem) => p.allergens.length ? p.allergens.map(a => a === 'Sesamsamen' ? 'Sesam' : a).join(', ') : 'keine';

export const PERSONAS: Persona[] = [
  { name: 'Frau Schmitz', title: 'Frau Schmitz', who: 'Stammkundin, kommt jeden Morgen' },
  { name: 'Herr Becker', title: 'Herr Becker', who: 'Handwerker in der Frühstückspause' },
  { name: 'Frau Yilmaz', title: 'Frau Yilmaz', who: 'Mutter mit zwei Kindern' },
  { name: 'Herr Hoffmann', title: 'Herr Hoffmann', who: 'Rentner, liebt kräftiges Brot' },
  { name: 'Frau Wagner', title: 'Frau Wagner', who: 'arbeitet im Büro nebenan' },
  { name: 'Herr Krämer', title: 'Herr Krämer', who: 'Neukunde, zum ersten Mal hier' },
  { name: 'Frau Nowak', title: 'Frau Nowak', who: 'achtet sehr auf Zutaten' },
  { name: 'Herr Peters', title: 'Herr Peters', who: 'hat es ein bisschen eilig' },
  { name: 'Frau Jansen', title: 'Frau Jansen', who: 'kauft fürs Familienfrühstück' },
  { name: 'Herr Schneider', title: 'Herr Schneider', who: 'Stammkunde seit vielen Jahren' },
  { name: 'Frau Kaya', title: 'Frau Kaya', who: 'Studentin, kommt nach der Vorlesung' },
  { name: 'Herr Lange', title: 'Herr Lange', who: 'besorgt Kuchen für die Kollegen' },
  { name: 'Frau Klein', title: 'Frau Klein', who: 'Seniorin, plaudert gern' },
  { name: 'Herr Schulz', title: 'Herr Schulz', who: 'Busfahrer auf dem Weg zur Schicht' },
  { name: 'Frau Meier', title: 'Frau Meier', who: 'Lehrerin, kauft für die Pause' },
  { name: 'Herr Özdemir', title: 'Herr Özdemir', who: 'kocht gern und fragt genau nach' },
  { name: 'Frau Braun', title: 'Frau Braun', who: 'joggt jeden Morgen vorbei' },
  { name: 'Herr Fischer', title: 'Herr Fischer', who: 'Stammkunde, immer gut gelaunt' },
  { name: 'Frau Wolf', title: 'Frau Wolf', who: 'Krankenschwester nach der Nachtschicht' },
  { name: 'Herr Richter', title: 'Herr Richter', who: 'Geschäftsmann, telefoniert viel' },
  { name: 'Frau Schröder', title: 'Frau Schröder', who: 'Oma, holt die Enkel ab' },
  { name: 'Herr Neumann', title: 'Herr Neumann', who: 'frisch zugezogen' },
];

/** Tageszeit-Gruß passend zur echten Uhrzeit */
export function timeGreeting() {
  const h = new Date().getHours();
  if (h < 11) return { std: 'Guten Morgen', wrong: 'Guten Abend', customer: ['Guten Morgen!', 'Morgen!', 'Guten Morgen zusammen!', 'Tach!'] };
  if (h < 18) return { std: 'Guten Tag', wrong: 'Guten Morgen', customer: ['Guten Tag!', 'Hallo!', 'Tach zusammen!', 'Mahlzeit!'] };
  return { std: 'Guten Abend', wrong: 'Guten Morgen', customer: ['Guten Abend!', 'Hallo, noch geöffnet?', 'Abend!'] };
}

export type Core = { steps: SimStep[]; basket: BasketLine[]; bread?: ShopItem; sliceIntro?: string[]; forceRoll?: boolean; extraWrongTotals?: number[]; persona?: Persona };

/** Antwort-Optionen mischen */
export const opts = (list: SimOpt[]) => shuffleArray(list);

/** Gleicht die Länge an: Kurze Antworten bekommen einen neutralen Zusatz, damit man die richtige nicht an der Länge erkennt */
export const FILLERS = [' Das kommt heute ganz frisch aus dem Ofen.', ' Das ist bei unseren Kunden sehr beliebt.', ' Das kann ich wirklich empfehlen.', ' Das nehmen viele Stammkunden.'];

export const evenOpts = (list: SimOpt[]) => {
  const max = Math.max(...list.map(o => o.text.length));
  const fillers = shuffleArray([...FILLERS]);
  let f = 0;
  return opts(list.map(o => (!o.noPad && max - o.text.length > 14 ? { ...o, text: o.text + fillers[f++ % fillers.length] } : o)));
};
