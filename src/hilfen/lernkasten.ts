// ═══ Lernkasten für die Produkt-Lernkarten (Version 238) ═══
// Wie ein echter Karteikasten mit 5 Fächern: „Wusste ich“ schiebt die Karte ein Fach weiter nach hinten,
// „Nochmal“ legt sie zurück in Fach 1. Neue Karten liegen in Fach 1.
// Gespeichert nur im eigenen Fortschritt: progress/<name>/_lernkasten { <schlüssel>: fach }.
import { CloudPayload } from '../types';

type Upd = (curr: CloudPayload) => CloudPayload;
export const FAECHER = 5;
/** Schlüssel für die Datenbank (nur Buchstaben und Zahlen, Produktnamen haben Sonderzeichen) */
export const kastenKey = (name: string) => name.toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const lernkastenVon = (progress: CloudPayload['progress'] | undefined, userKey: string): Record<string, number> =>
  (((progress || {})[userKey] as any)?._lernkasten) || {};

export const fachVon = (kasten: Record<string, number>, name: string) => Math.max(1, Math.min(FAECHER, Number(kasten[kastenKey(name)]) || 1));

export const karteBewerten = (userKey: string, name: string, produkt: string, gewusst: boolean): Upd => (curr) => {
  const pr: any = curr.progress[userKey] || (curr.progress[userKey] = { _displayName: name });
  const k = kastenKey(produkt);
  const alt = Math.max(1, Math.min(FAECHER, Number((pr._lernkasten || {})[k]) || 1));
  pr._lernkasten = { ...(pr._lernkasten || {}), [k]: gewusst ? Math.min(FAECHER, alt + 1) : 1 };
  return curr;
};

/** Wie viele Karten liegen in welchem Fach? (für die Anzeige) */
export const faecherZaehlen = (namen: string[], kasten: Record<string, number>) => {
  const z = Array(FAECHER).fill(0) as number[];
  namen.forEach((n) => { z[fachVon(kasten, n) - 1]++; });
  return z;
};
