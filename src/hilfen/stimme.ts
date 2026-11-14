// ═══ Natürliche Stimme für Hör-Lernen ═══
// Fragen und Antworten liegen als fertige Tondateien unter public/stimme/<code>.mp3.
// Der Code wird aus dem gesprochenen Text berechnet: ändert sich ein Text, gibt es eine neue Datei,
// und bis dahin liest die Handy-Stimme vor. Erzeugt werden die Dateien mit tools/stimme/erzeugen.mjs,
// das genau diese Funktionen benutzt (damit App und Erzeuger dieselben Texte haben).
import { getRightAnswerText } from './allgemein';

export const sauber = (t: string) => String(t || '').replace(/[„“"]/g, '').replace(/·/g, ',').replace(/\s+/g, ' ').trim();

/** Was bei einer Frage gesprochen wird: erst die Frage, nach der Denkpause die Antwort */
export function hoerTexte(q: any): { frage: string; antwort: string } {
  const richtig = getRightAnswerText(q);
  const erkl = q.explanation && sauber(q.explanation) !== sauber(richtig) ? ` ${q.explanation}` : '';
  return { frage: sauber(q.question), antwort: sauber(`Antwort: ${richtig}.${erkl}`) };
}

/** Kurzer, fester Code für einen Text (zwei FNV-1a-Prüfsummen, 16 Zeichen) */
export function stimmeKey(text: string): string {
  const t = sauber(text);
  let a = 0x811c9dc5, b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}
