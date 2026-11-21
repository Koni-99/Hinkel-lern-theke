// ═══ Version 274: Spieltexte korrigieren und ausblenden (Theken-Simulator) ═══
// Der Ausbilder ändert gemeldete Sätze direkt im Ausbilder-Bereich (Meldungen → „Spieltext korrigieren“).
// Gespeichert im eigenen Fortschritt des Ausbilders: progress/admin/_spielTexte, _spielAus, _spielRichtig, _themenAus
// (Schlüssel = Prüfsumme des Originaltexts, Firebase erlaubt keine Punkte o. Ä. in Schlüsseln).
// Die App gibt die Werte bei jeder Änderung mit setzeSpielKorrekturen() hierher, das Spiel fragt sie beim Bauen ab.

export type SpielKorrekturen = {
  /** Satz ersetzen: Original → neuer Text */
  _spielTexte?: Record<string, { a: string; n: string; ts?: number }>;
  /** Antwort ausblenden */
  _spielAus?: Record<string, { a: string; ts?: number }>;
  /** Bei diesem Kundensatz ist diese Antwort richtig */
  _spielRichtig?: Record<string, { k: string; r: string; ts?: number }>;
  /** Ganze Situation (Thema) ausblenden */
  _themenAus?: Record<string, { t: string; ts?: number }>;
};

/** Kurze Prüfsumme eines Texts (als Schlüssel in Firebase) */
export const textKey = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return 'k' + h.toString(36) + s.length.toString(36);
};

import { FILLERS } from '../games/theke/basis';

let K: SpielKorrekturen = {};

/** Antworten bekommen manchmal einen zufälligen Zusatz („ Das ist sehr beliebt.“), der gehört nicht zum Text */
export function grundText(t: string): string {
  for (const f of FILLERS) if (t.endsWith(f) && t.length > f.length) return t.slice(0, -f.length);
  return t;
}

/** Von der App aufgerufen (Fortschritt „admin“) */
export function setzeSpielKorrekturen(admin: any) {
  const a = admin || {};
  K = { _spielTexte: a._spielTexte || {}, _spielAus: a._spielAus || {}, _spielRichtig: a._spielRichtig || {}, _themenAus: a._themenAus || {} };
}

/** Text mit Korrektur (auch mehrfach korrigiert: höchstens 5 Schritte) */
export function korrigierterText(t: string): string {
  const g = grundText(t), zusatz = t.slice(g.length);
  let x = g;
  for (let i = 0; i < 5; i++) {
    const f = (K._spielTexte || {})[textKey(x)];
    if (!f || typeof f.n !== 'string' || !f.n.trim() || f.n === x) break;
    x = f.n;
  }
  return x === g ? t : x + zusatz;
}

export const themaAus = (topic: string) => !!(K._themenAus || {})[textKey(topic)];

type Schritt = { customer: string[]; options: { text: string; correct: boolean; why?: string }[]; topic: string };

/** Korrekturen auf einen Gesprächsschritt anwenden. Bleibt etwas Unsinniges übrig (keine richtige Antwort,
 *  weniger als 2 Antworten), gilt der Schritt unverändert. */
export function korrigiereSchritt<T extends Schritt>(st: T): T {
  const kundeOrig = st.customer.join(' ');
  const R = K._spielRichtig || {}, A = K._spielAus || {};
  const richtig = R[textKey(kundeOrig)] || R[textKey(st.customer.map(korrigierterText).join(' '))];
  // Antworten werden im Ausbilder-Bereich so gemeldet, wie sie zu sehen waren (evtl. schon korrigiert): beides prüfen
  const gleich = (t: string, r: string) => grundText(t) === r || grundText(korrigierterText(t)) === r;
  const aus = (t: string) => !!(A[textKey(grundText(t))] || A[textKey(grundText(korrigierterText(t)))]);
  let options = st.options
    .filter((o) => !aus(o.text))
    .map((o) => ({ ...o, correct: richtig ? gleich(o.text, richtig.r) : o.correct }));
  if (options.filter((o) => o.correct).length !== 1 || options.length < 2) {
    // Ausblenden hätte die richtige Antwort entfernt o. Ä.: dann nur die richtige Antwort neu festlegen, nichts ausblenden
    options = st.options.map((o) => ({ ...o, correct: richtig && st.options.some((x) => gleich(x.text, richtig.r)) ? gleich(o.text, richtig.r) : o.correct }));
  }
  return {
    ...st,
    customer: st.customer.map(korrigierterText),
    options: options.map((o) => ({ ...o, text: korrigierterText(o.text) })),
  };
}

/** Alles, was der Ausbilder geändert hat (für die Liste mit „Zurücknehmen“) */
export function alleKorrekturen(admin: any): { art: 'text' | 'aus' | 'richtig' | 'thema'; key: string; text: string; ts: number }[] {
  const a = admin || {};
  const out: { art: 'text' | 'aus' | 'richtig' | 'thema'; key: string; text: string; ts: number }[] = [];
  Object.entries(a._spielTexte || {}).forEach(([key, v]: [string, any]) => v && out.push({ art: 'text', key, text: `„${v.a}“ → „${v.n}“`, ts: Number(v.ts) || 0 }));
  Object.entries(a._spielAus || {}).forEach(([key, v]: [string, any]) => v && out.push({ art: 'aus', key, text: `Antwort ausgeblendet: „${v.a}“`, ts: Number(v.ts) || 0 }));
  Object.entries(a._spielRichtig || {}).forEach(([key, v]: [string, any]) => v && out.push({ art: 'richtig', key, text: `Richtig ist jetzt: „${v.r}“ (bei „${v.k}“)`, ts: Number(v.ts) || 0 }));
  Object.entries(a._themenAus || {}).forEach(([key, v]: [string, any]) => v && out.push({ art: 'thema', key, text: `Situation ausgeblendet: ${v.t}`, ts: Number(v.ts) || 0 }));
  return out.sort((x, y) => y.ts - x.ts);
}

export const FELD: Record<'text' | 'aus' | 'richtig' | 'thema', keyof SpielKorrekturen> = { text: '_spielTexte', aus: '_spielAus', richtig: '_spielRichtig', thema: '_themenAus' };
