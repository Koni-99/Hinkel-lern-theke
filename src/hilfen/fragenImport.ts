// ═══ Quizfragen aus einer Excel-Tabelle übernehmen ═══
// Spalten (Überschriften in Zeile 1, Reihenfolge egal):
//   Bereich | Stufe | Frage | Richtige Antwort | Falsche Antwort 1 | Falsche Antwort 2 | Falsche Antwort 3 | Erklärung
// Fehlt die Überschriftenzeile, gilt genau diese Reihenfolge.

export type ImportFrage = { category: string; level: 'easy' | 'hard'; question: string; options: string[]; correct: number; explanation: string };
export type ImportErgebnis = { fragen: ImportFrage[]; fehler: { zeile: number; grund: string }[]; doppelt: number; leer: number };

export const VORLAGE_SPALTEN = ['Bereich', 'Stufe', 'Frage', 'Richtige Antwort', 'Falsche Antwort 1', 'Falsche Antwort 2', 'Falsche Antwort 3', 'Erklärung'];

type Feld = 'bereich' | 'stufe' | 'frage' | 'richtig' | 'falsch' | 'erklaerung';
const norm = (v: unknown) => (v === null || v === undefined ? '' : String(v)).replace(/\s+/g, ' ').trim();
const key = (v: string) => v.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');

function feldVon(ueberschrift: string): Feld | null {
  const k = key(ueberschrift);
  if (!k) return null;
  if (k.startsWith('bereich') || k.startsWith('kategorie')) return 'bereich';
  if (k.startsWith('stufe') || k.startsWith('level') || k.startsWith('schwierig')) return 'stufe';
  if (k.startsWith('falsch')) return 'falsch';
  if (k.startsWith('richtig') || k === 'antwort' || k === 'loesung' || k === 'lösung') return 'richtig';
  if (k.startsWith('erkl') || k.startsWith('hinweis') || k.startsWith('begr')) return 'erklaerung';
  if (k.startsWith('frage')) return 'frage';
  return null;
}

/** Zeilen einer Tabelle in Quizfragen umwandeln. bereiche = erlaubte Bereiche, vorhanden = schon existierende Fragetexte */
export function fragenAusTabelle(rows: unknown[][], bereiche: string[], vorhanden: string[], zufall: () => number = Math.random): ImportErgebnis {
  const ergebnis: ImportErgebnis = { fragen: [], fehler: [], doppelt: 0, leer: 0 };
  if (!rows.length) return ergebnis;
  const kopf = rows[0].map((c) => feldVon(norm(c)));
  const hatKopf = kopf.includes('frage') && kopf.includes('richtig');
  const spalten: (Feld | null)[] = hatKopf ? kopf : ['bereich', 'stufe', 'frage', 'richtig', 'falsch', 'falsch', 'falsch', 'erklaerung'];
  const bekannt = new Set(vorhanden.map((q) => key(q)));
  const bereichVon = new Map(bereiche.map((b) => [key(b), b]));
  (hatKopf ? rows.slice(1) : rows).forEach((row, i) => {
    const zeile = i + (hatKopf ? 2 : 1);
    const z: Record<Feld, string[]> = { bereich: [], stufe: [], frage: [], richtig: [], falsch: [], erklaerung: [] };
    row.forEach((c, j) => { const f = spalten[j]; const v = norm(c); if (f && v) z[f].push(v); });
    const frage = z.frage[0] || '';
    if (!frage && !z.richtig.length && !z.falsch.length) { ergebnis.leer++; return; }
    if (!frage) { ergebnis.fehler.push({ zeile, grund: 'Die Frage fehlt.' }); return; }
    const richtig = z.richtig[0] || '';
    if (!richtig) { ergebnis.fehler.push({ zeile, grund: 'Die richtige Antwort fehlt.' }); return; }
    const falsch = Array.from(new Set(z.falsch.filter((f) => key(f) !== key(richtig)))).slice(0, 3);
    if (!falsch.length) { ergebnis.fehler.push({ zeile, grund: 'Mindestens eine falsche Antwort wird gebraucht.' }); return; }
    const bereich = z.bereich[0] ? bereichVon.get(key(z.bereich[0])) : bereiche[0];
    if (!bereich) { ergebnis.fehler.push({ zeile, grund: `Unbekannter Bereich „${z.bereich[0]}“. Erlaubt: ${bereiche.join(', ')}.` }); return; }
    const s = key(z.stufe[0] || '');
    const level: 'easy' | 'hard' = s.startsWith('schw') || s.startsWith('hard') || s === '2' ? 'hard' : 'easy';
    if (bekannt.has(key(frage))) { ergebnis.doppelt++; return; }
    bekannt.add(key(frage));
    // Richtige Antwort an zufällige Stelle (das Quiz mischt zusätzlich)
    const pos = Math.floor(zufall() * (falsch.length + 1));
    const options = [...falsch]; options.splice(pos, 0, richtig);
    ergebnis.fragen.push({ category: bereich, level, question: frage, options, correct: pos, explanation: z.erklaerung[0] || `Richtig ist: ${richtig}${/[.!?]$/.test(richtig) ? '' : '.'}` });
  });
  return ergebnis;
}
