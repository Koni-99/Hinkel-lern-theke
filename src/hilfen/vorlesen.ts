// ═══ Vorlesen mit natürlicher Stimme: Steckbrief, Produktkarte, Bilderquiz, Schneide-Profi, Allergene ═══
// Alle Texte werden hier gebaut (App und Erzeuger tools/stimme/saetze.mjs benutzen dieselben Funktionen).
// Gesprochen wird Satz für Satz: jeder Satz liegt einmal als Tondatei unter public/stimme/saetze/<code>.mp3
// (Stimme Frau 4, Achernar, einmalig erzeugt, danach keine Kosten). Fehlt ein Satz, liest die Handy-Stimme.
import { sauber, stimmeKey } from './stimme';

export const VORLESE_STIMME = 'de-DE-Chirp3-HD-Achernar';

type Prod = { name: string; description?: string; shortIngredients?: string; allergens?: string[]; price?: string; group?: string };

/** Text in Sätze zerlegen (Satzzeichen am Ende zählt nicht mit) */
export function saetze(text: string): string[] {
  return sauber(text).split(/(?<=[.!?])\s+/).map((s) => s.replace(/[.!?]+$/, '').trim()).filter((s) => /[A-Za-zÄÖÜäöüß0-9]/.test(s));
}
export const satzKey = (satz: string) => stimmeKey(`satz|${VORLESE_STIMME}|${satz}`);

export const steckbriefText = (sp: Prod) =>
  `${sp.name}. ${sp.description || ''} Im Verkauf sagen: ${sp.shortIngredients}. Allergene: ${(sp.allergens || []).join(', ') || 'keine'}.${sp.price ? ` Preis: ${sp.price}.` : ''}`;

export const produktKarteText = (name: string, facts: string[][], sp: Prod) =>
  `${name}. ${facts.map(([l, v]) => `${l}: ${v}`).join('. ')}. Im Verkauf sagen: ${sp.shortIngredients}. Allergene: ${(sp.allergens || []).join(', ') || 'keine angegeben'}.`;

export const schneideText = (name: string, mm: string) => `${name} wird mit ${mm} geschnitten.`;

export const bqName = (n: string) => n.replace(/^(Kleines|Großes) /, '');
export const firstSentence = (s: string) => {
  const m = (s || '').match(/^(.+?[.!])(\s|$)/);
  return (m ? m[1] : s || '').replace(/^Unser(e)?\s+[^ ]+(\s+[^ ]+)?\s+ist\s+/, '').replace(/^./, (c) => c.toUpperCase());
};
export const bilderText = (p: Prod) => `Das ist ${bqName(p.name)}. ${firstSentence(p.description || '')} Warengruppe: ${p.group}.`;

type ATest = { label: string; kein: string };
export const allergenFrage = (test: ATest, mode: 'safe' | 'contains') => (mode === 'safe'
  ? { who: 'Eine Kundin sagt:', quote: `„Ich habe eine Allergie gegen ${test.label}.“`, ask: `Welches dieser Produkte enthält laut Allergenliste ${test.kein}?` }
  : { who: 'Ein Kunde sagt:', quote: `„Ich vertrage ${test.kein}.“`, ask: 'Von welchem Produkt musst du ihm abraten?' });
export const allergenVorher = (test: ATest, mode: 'safe' | 'contains', options: Prod[]) => {
  const q = allergenFrage(test, mode);
  return `${q.who} ${q.quote} ${q.ask} ${options.map((o, i) => `${i + 1}: ${o.name}`).join('. ')}`;
};
export const allergenNachher = (test: ATest, mode: 'safe' | 'contains', answer: Prod, options: Prod[]) =>
  (mode === 'safe' ? `${answer.name} enthält laut Liste ${test.kein}, die anderen schon.` : `${answer.name} enthält ${test.label}, davon musst du abraten.`)
  + ' ' + options.map((o) => `${o.name}: ${(o.allergens || []).join(', ')}`).join('. ');
