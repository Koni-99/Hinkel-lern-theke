// ═══ Version 251: Suche überall (Lupe oben) ═══
// Sucht in Produkten (Steckbriefe), Quizfragen, Hilfe-Themen und Seiten. Alles im Gerät, nichts wird gespeichert.

export const suchNorm = (s: string) => String(s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();

/** Passt der Text zu allen Suchwörtern? Ergebnis: 0 = nein, sonst je höher, desto besser */
export function treffer(text: string, suche: string, titel = ''): number {
  const w = suchNorm(suche).split(' ').filter(Boolean);
  if (!w.length) return 0;
  const t = ' ' + suchNorm(titel + ' ' + text) + ' ', ti = ' ' + suchNorm(titel) + ' ';
  if (!w.every((x) => t.includes(x))) return 0;
  let p = 1;
  w.forEach((x) => { if (ti.includes(' ' + x)) p += 3; else if (ti.includes(x)) p += 2; if (t.includes(' ' + x)) p += 1; });
  if (ti.trim() === suchNorm(suche)) p += 10;
  return p;
}

/** Die besten Funde (höchstens max) */
export function suchen<T>(liste: T[], suche: string, text: (x: T) => string, titel: (x: T) => string, max = 8): T[] {
  return liste.map((wert) => ({ wert, punkte: treffer(text(wert), suche, titel(wert)) })).filter((f) => f.punkte > 0)
    .sort((a, b) => b.punkte - a.punkte).slice(0, max).map((f) => f.wert);
}
