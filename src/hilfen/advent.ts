// ═══ Version 265: Adventskalender-Belohnungen (Wunsch des Nutzers) ═══
// Jedes Türchen: Überraschungstüte + eine zufällige Advents-Belohnung (immer), 100 Punkte bei richtiger Antwort.
// Die Advents-Sachen (Zeichen, Titel, Teigi-Wintersachen, Bon-Rahmen, Markise) gibt es nur hier, nicht im Laden.
// Wer alle 24 Türchen geöffnet hat, bekommt den Goldenen Stern für Teigi und den Titel „Weihnachtsstern“.
// Gespeichert wird alles im eigenen Fortschritt: _shopOwned / _ptsOwned wie gekaufte Sachen, Joker in den Joker-Feldern.
import { TIP_SHOP, PT_SHOP, JOKER_FIELD, type ShopItem, type PtItem } from '../basis/laden';

export const ADVENT_PUNKTE = 100;
/** Nur für alle 24 Türchen, nicht zufällig */
export const ADVENT_FINALE = ['tz_stern', 'ad_t_stern'];

export type AdventBelohnung =
  | { art: 'teil'; it: ShopItem }
  | { art: 'pt'; it: PtItem }
  | { art: 'joker'; it: ShopItem }
  | { art: 'geld'; cents: number };

export const adventTeile = () => TIP_SHOP.filter((i) => i.advent && !ADVENT_FINALE.includes(i.id));
export const adventPt = () => PT_SHOP.filter((i) => i.advent);

/** Zufällige Belohnung: erst die Advents-Sachen, die man noch nicht hat. Hat man alle, gibt es einen Joker oder Trinkgeld. */
export function adventBelohnung(shopOwned: string[], ptsOwned: string[], zufall = Math.random): AdventBelohnung {
  const teile: AdventBelohnung[] = [
    ...adventTeile().filter((i) => !shopOwned.includes(i.id)).map((it) => ({ art: 'teil' as const, it })),
    ...adventPt().filter((i) => !ptsOwned.includes(i.id)).map((it) => ({ art: 'pt' as const, it })),
  ];
  if (teile.length) return teile[Math.floor(zufall() * teile.length)];
  const joker = TIP_SHOP.filter((i) => i.kind === 'joker' && JOKER_FIELD[i.id] && i.id !== 'j_tuete');
  return zufall() < 0.6 ? { art: 'joker', it: joker[Math.floor(zufall() * joker.length)] } : { art: 'geld', cents: [100, 150, 200][Math.floor(zufall() * 3)] };
}

/** Belohnung im eigenen Fortschritt gutschreiben */
export function belohnungGutschreiben(pr: any, b: AdventBelohnung) {
  if (b.art === 'geld') { pr._tipCents = (Number(pr._tipCents) || 0) + b.cents; return; }
  if (b.art === 'joker') { const f = JOKER_FIELD[b.it.id]; if (f) pr[f] = (Number(pr[f]) || 0) + 1; return; }
  const feld = b.art === 'pt' ? '_ptsOwned' : '_shopOwned';
  const owned: string[] = Array.isArray(pr[feld]) ? pr[feld] : [];
  if (!owned.includes(b.it.id)) pr[feld] = [...owned, b.it.id];
}

/** Alle 24 Türchen geöffnet (richtig oder falsch)? Dann Goldener Stern + Titel, genau einmal. Gibt die neuen Teile zurück. */
export function finaleGutschreiben(pr: any, jahr: string): ShopItem[] {
  const tage = Object.keys(((pr._advent || {})[jahr]) || {}).filter((d) => Number(d) >= 1 && Number(d) <= 24);
  if (tage.length < 24) return [];
  const owned: string[] = Array.isArray(pr._shopOwned) ? pr._shopOwned : [];
  const neu = ADVENT_FINALE.filter((id) => !owned.includes(id));
  if (!neu.length) return [];
  pr._shopOwned = [...owned, ...neu];
  return neu.map((id) => TIP_SHOP.find((i) => i.id === id)!).filter(Boolean);
}
