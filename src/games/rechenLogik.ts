// ═══ Rechen-Trainer (Version 253): Aufgaben wie in der Prüfung, mit echten Hinkel-Preisen ═══
// Summe, Rückgeld, Grundpreis pro Kilo, Rabatt, Mehrwertsteuer herausrechnen, Dreisatz.
// Jede Aufgabe hat einen Rechenweg, der nach der Antwort gezeigt wird.
import { SHOP_PRODUCTS } from '../daten/shopProducts';

export type RechenArt = 'summe' | 'rueckgeld' | 'grundpreis' | 'rabatt' | 'mwst' | 'dreisatz';
export type Aufgabe = { art: RechenArt; titel: string; text: string; cent: number; weg: string[] };

export const RUNDE = 8;
export const PUNKTE_PRO_AUFGABE = 10;
export const ART_NAME: Record<RechenArt, string> = { summe: 'Zusammenrechnen', rueckgeld: 'Rückgeld', grundpreis: 'Preis pro Kilo', rabatt: 'Rabatt', mwst: 'Mehrwertsteuer', dreisatz: 'Dreisatz' };

const centVon = (s?: string) => { const m = (s || '').match(/(\d+),(\d\d)/); return m ? Number(m[1]) * 100 + Number(m[2]) : 0; };
const grammVon = (s?: string) => { const m = (s || '').replace('.', '').match(/(\d+)\s*g\b/); return m ? Number(m[1]) : 0; };
export const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',') + ' €';
const zufall = <T,>(a: T[], r: () => number): T => a[Math.floor(r() * a.length)];

/** Artikel mit festem Preis (kein „ab“, keine Klammer) */
function artikel() {
  return SHOP_PRODUCTS.filter((p) => p.price && !/^ab|\(/.test(p.price)).map((p) => ({ name: p.name, cent: centVon(p.price), gramm: grammVon(p.weight), group: p.group }))
    .filter((a) => a.cent > 0 && a.cent <= 2500);
}

export function neueAufgabe(art: RechenArt, r: () => number = Math.random): Aufgabe {
  const alle = artikel();
  const klein = alle.filter((a) => a.cent <= 400);
  if (art === 'summe' || art === 'rueckgeld') {
    const n = 2 + Math.floor(r() * 2);
    const posten: { name: string; menge: number; cent: number }[] = [];
    while (posten.length < n) { const a = zufall(posten.length ? klein : alle, r); if (!posten.some((p) => p.name === a.name)) posten.push({ name: a.name, menge: a.cent < 150 ? 2 + Math.floor(r() * 5) : 1, cent: a.cent }); }
    const summe = posten.reduce((s, p) => s + p.menge * p.cent, 0);
    const liste = posten.map((p) => `${p.menge} × ${p.name} (je ${euro(p.cent)})`).join(', ');
    const wegSumme = posten.map((p) => `${p.menge} × ${euro(p.cent)} = ${euro(p.menge * p.cent)}`).concat([`Zusammen: ${euro(summe)}`]);
    if (art === 'summe') return { art, titel: ART_NAME[art], text: `Ein Kunde kauft ${liste}. Was macht das zusammen?`, cent: summe, weg: wegSumme };
    const schein = [500, 1000, 2000, 5000].find((s) => s > summe) || 10000;
    return { art, titel: ART_NAME[art], text: `Ein Kunde kauft ${liste} und zahlt mit ${euro(schein).replace(',00', '')}. Wie viel Rückgeld bekommt er?`, cent: schein - summe, weg: [...wegSumme, `${euro(schein)} − ${euro(summe)} = ${euro(schein - summe)}`] };
  }
  if (art === 'grundpreis') {
    const a = zufall(alle.filter((x) => x.gramm >= 100 && x.gramm !== 1000), r);
    const kg = Math.round((a.cent * 1000) / a.gramm);
    return { art, titel: ART_NAME[art], text: `${a.name} wiegt ${a.gramm} g und kostet ${euro(a.cent)}. Was kostet 1 kg? (auf den Cent gerundet)`, cent: kg,
      weg: [`1 kg = 1000 g`, `${euro(a.cent)} : ${a.gramm} g × 1000 g`, `= ${euro(kg)} pro kg`] };
  }
  if (art === 'rabatt') {
    const a = zufall(alle.filter((x) => x.cent >= 200), r);
    const p = zufall([10, 20, 25, 30, 50], r);
    const neu = Math.round(a.cent * (100 - p) / 100);
    return { art, titel: ART_NAME[art], text: `Auf ${a.name} (${euro(a.cent)}) gibt es ${p} % Rabatt. Was kostet es dann? (auf den Cent gerundet)`, cent: neu,
      weg: [`${p} % von ${euro(a.cent)} = ${euro(Math.round(a.cent * p / 100))}`, `${euro(a.cent)} − ${euro(Math.round(a.cent * p / 100))} = ${euro(neu)}`] };
  }
  if (art === 'mwst') {
    const a = zufall(alle.filter((x) => x.cent >= 150), r);
    const vorOrt = r() < 0.3;
    const satz = vorOrt ? 19 : 7;
    const steuer = a.cent - Math.round((a.cent * 100) / (100 + satz));
    return { art, titel: ART_NAME[art], text: `${a.name} kostet ${euro(a.cent)}${vorOrt ? ' und wird im Café vor Ort gegessen (19 %)' : ' zum Mitnehmen (7 %)'}. Wie viel Mehrwertsteuer steckt im Preis? (auf den Cent gerundet)`, cent: steuer,
      weg: [`Netto = ${euro(a.cent)} : ${(1 + satz / 100).toFixed(2).replace('.', ',')}`, `= ${euro(a.cent - steuer)}`, `Steuer = ${euro(a.cent)} − ${euro(a.cent - steuer)} = ${euro(steuer)}`] };
  }
  // Dreisatz: Brötchen, Stückpreis
  const a = zufall(klein.filter((x) => x.cent <= 250), r);
  const n1 = zufall([3, 4, 5, 6], r), n2 = zufall([7, 8, 9, 10, 12, 15], r);
  return { art: 'dreisatz', titel: ART_NAME.dreisatz, text: `${n1} × ${a.name} kosten ${euro(n1 * a.cent)}. Was kosten ${n2} Stück?`, cent: n2 * a.cent,
    weg: [`1 Stück: ${euro(n1 * a.cent)} : ${n1} = ${euro(a.cent)}`, `${n2} Stück: ${n2} × ${euro(a.cent)} = ${euro(n2 * a.cent)}`] };
}

/** Eine Runde: jede Art mindestens einmal, dann gemischt */
export function neueRunde(r: () => number = Math.random): Aufgabe[] {
  const arten: RechenArt[] = ['summe', 'rueckgeld', 'grundpreis', 'rabatt', 'mwst', 'dreisatz'];
  const liste = [...arten, zufall(arten, r), zufall(arten, r)].slice(0, RUNDE);
  for (let i = liste.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [liste[i], liste[j]] = [liste[j], liste[i]]; }
  return liste.map((a) => neueAufgabe(a, r));
}
