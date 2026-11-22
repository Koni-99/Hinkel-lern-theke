// ═══ Natürliche Stimme aus Bausteinen (Theken-Simulator, Telefon-Bestellung) ═══
// Die Sätze dort werden jedes Mal neu zusammengewürfelt, ganze Sätze vorher zu erzeugen wäre zu viel.
// Darum zerlegen wir jeden Satz in Bausteine: feste Satzteile, „Menge + Produkt“ und Euro-Beträge.
// Jeder Baustein liegt einmal pro Stimme als Tondatei unter public/stimme/teile/<code>.mp3
// (erzeugt mit tools/stimme/bausteine.mjs, einmalig, danach keine Kosten). Die App spielt die Bausteine
// hintereinander. Fehlt auch nur einer, liest für diesen Satz die Handy-Stimme (keine gemischten Stimmen).
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { stimmeKey } from './stimme';
import { mehrzahl } from '../games/telefonLogik';

/** Die beiden Stimmen für Kunden: Frau 4 (Achernar) und Mann 10 (Iapetus) */
export const KUNDEN_STIMMEN = { frau: 'de-DE-Chirp3-HD-Achernar', mann: 'de-DE-Chirp3-HD-Iapetus' } as const;
export type KundenStimme = keyof typeof KUNDEN_STIMMEN;

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Einzahl, Mehrzahl (wie die Kunden sie sagen) und Namen ohne Klammer-Zusatz
const NAMEN = [...new Set(SHOP_PRODUCTS.flatMap((p) => { const kurz = p.name.replace(/\s*\([^)]*\)\s*$/, ''); return [p.name, kurz, mehrzahl(p.name), mehrzahl(kurz)]; }))].sort((a, b) => b.length - a.length);
const MENGE = '(?:\\d+ (?:Stück |Packungen? )?|ein(?:e|en)? (?:Stück |Packung |halbes Dutzend |Dutzend )?|einmal |zweimal |zwei |drei |vier |fünf |sechs |eine Packung |zwei Packungen |drei Packungen |ein Dutzend |ein halbes Dutzend |noch \\d+ )?';
const PRODUKT = `(?:${NAMEN.map(esc).join('|')})(?:n|en|e|s)?(?![A-Za-zÄÖÜäöüß-])`;
const SLOT = new RegExp(`(${MENGE}${PRODUKT})|(\\d+,\\d\\d ?€)|(\\d+ Euro)`, 'g');

/** Regieanweisungen in Klammern weg, Leerzeichen glätten */
export const gesprochenerText = (t: string) => t.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();

/** Satz in Bausteine zerlegen (dieselbe Regel beim Erzeugen und beim Abspielen) */
export function zerlege(text: string): string[] {
  const teile: string[] = [];
  const dazu = (s: string) => { const t = s.trim().replace(/^[,;]\s*/, ''); if (/[A-Za-zÄÖÜäöüß0-9]/.test(t)) teile.push(t); };
  for (const satz of gesprochenerText(text).split(/(?<=[.!?])\s+/)) {
    let zuletzt = 0;
    satz.replace(SLOT, (m: string, _a: string, _b: string, _c: string, pos: number) => { dazu(satz.slice(zuletzt, pos)); dazu(m); zuletzt = pos + m.length; return m; });
    dazu(satz.slice(zuletzt));
  }
  return teile;
}

/** Theken-Simulator, Knopf „Vorlesen“ (Version 282): wer spricht und die Antworten in der Erzählstimme (Frau 10),
 *  der Kunde in seiner eigenen Stimme. Alles als Bausteine, die tools/stimme/bausteine.mjs vorab erzeugt. */
export const ERZAEHL_STIMME = 'de-DE-Chirp3-HD-Laomedeia'; // Frau 10, anders als die Kundenstimmen
export function simulatorVorlesenTeile(wer: string, kunde: string[], antworten: string[], kundenStimme: string): [string, string][] {
  const out: [string, string][] = [];
  const k = zerlege(kunde.join(' '));
  if (k.length) { out.push([`${wer} sagt`, ERZAEHL_STIMME]); k.forEach((t) => out.push([t, kundenStimme])); }
  if (antworten.length) out.push(['Deine Antworten', ERZAEHL_STIMME]);
  antworten.forEach((a, i) => { out.push([String.fromCharCode(65 + i), ERZAEHL_STIMME]); zerlege(a).forEach((t) => out.push([t, ERZAEHL_STIMME])); });
  return out;
}

/** Dateiname eines Bausteins in einer Stimme */
export const teilKey = (stimme: string, teil: string) => stimmeKey(`${stimme}|${teil}`);
