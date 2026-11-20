// ═══ Version 266: Spiele „Zum Abschalten“ (Spielen → ganz unten) ═══
// Die Spiele selbst liegen als eigene Seite in public/abschalten/index.html (gebaut aus tools/abschalten, läuft im iframe).
// Keine Punkte für die Gesamtwertung (Wunsch des Nutzers), nur eigener Rekord und eine kleine Bestenliste je Spiel.
// Rekord im eigenen Fortschritt: progress/<name>/_abschalten { lauf: 123, … }
export const ABSCHALTEN_SPIELE: { key: string; titel: string; kurz: string }[] = [
  { key: 'lauf', titel: 'Teigi-Lauf', kurz: 'Springen und Körner sammeln' },
  { key: 'chaos', titel: 'Backstuben-Chaos', kurz: 'Backen, bevor die Kunden gehen' },
  { key: 'tour', titel: 'Lieferwagen-Tour', kurz: 'Ausweichen und Filialen beliefern' },
  { key: 'schutz', titel: 'Schädlinge abwehren', kurz: 'Fallen stellen, Mehllager schützen' },
  { key: 'schleuder', titel: 'Teig-Schleuder', kurz: 'Zielen und Backformen füllen' },
  { key: 'stapler', titel: 'Brot-Stapler', kurz: 'Brote möglichst hoch stapeln' },
];
export const abschaltenSpiel = (k: string) => ABSCHALTEN_SPIELE.find((s) => s.key === k);

/** Version 267: Medaillen je Spiel [Bronze, Silber, Gold] (gleiche Werte wie `medaillen` in tools/abschalten/spiele/*.js) */
export const MEDAILLEN: Record<string, [number, number, number]> = {
  lauf: [250, 900, 2500], chaos: [600, 1800, 4000], tour: [800, 2000, 4000], schutz: [800, 2400, 5000], schleuder: [500, 1300, 2600], stapler: [150, 500, 1200],
};
export const MEDAILLE_NAMEN = ['', 'Bronze', 'Silber', 'Gold'];
/** 0 = keine, 1 Bronze, 2 Silber, 3 Gold */
export function medaille(key: string, punkte: number): number {
  const m = MEDAILLEN[key]; if (!m || !m[0]) return 0;
  return punkte >= m[2] ? 3 : punkte >= m[1] ? 2 : punkte >= m[0] ? 1 : 0;
}
/** Rekorde der Kollegen (ohne mich und den Ausbilder) je Spiel, für „Nächstes Ziel: Ben 310“ im Spiel */
export function kollegenZiele(progress: Record<string, any> | undefined, ich: string): Record<string, { name: string; punkte: number }[]> {
  const out: Record<string, { name: string; punkte: number }[]> = {};
  ABSCHALTEN_SPIELE.forEach((sp) => {
    out[sp.key] = Object.entries(progress || {})
      .filter(([k, pr]) => k !== 'admin' && k !== ich && Number(pr?._abschalten?.[sp.key]) > 0)
      .map(([k, pr]) => ({ name: String(pr?._displayName || k), punkte: Math.floor(Number(pr._abschalten[sp.key])) }))
      .sort((a, b) => b.punkte - a.punkte).slice(0, 30);
  });
  return out;
}

/** Eigene Rekorde aus dem Fortschritt */
export function meineRekorde(pr: any): Record<string, number> {
  const r = (pr && pr._abschalten) || {};
  const out: Record<string, number> = {};
  ABSCHALTEN_SPIELE.forEach((s) => { const v = Math.floor(Number(r[s.key]) || 0); if (v > 0) out[s.key] = v; });
  return out;
}

/** Rekord speichern, nur wenn er höher ist (Höchstwert gegen Ausreißer begrenzt) */
export function rekordMerken(pr: any, key: string, punkte: number): boolean {
  if (!abschaltenSpiel(key)) return false;
  const p = Math.max(0, Math.min(1_000_000, Math.floor(Number(punkte) || 0)));
  const alt = Math.floor(Number(pr?._abschalten?.[key]) || 0);
  if (p <= alt) return false;
  pr._abschalten = { ...(pr._abschalten || {}), [key]: p };
  return true;
}

/** Kleine Bestenliste eines Spiels (Top n) aus allen Fortschritten */
export function bestenliste(progress: Record<string, any> | undefined, key: string, n = 5): { k: string; name: string; punkte: number }[] {
  return Object.entries(progress || {})
    .filter(([k, pr]) => k !== 'admin' && Number(pr?._abschalten?.[key]) > 0)
    .map(([k, pr]) => ({ k, name: String(pr?._displayName || k), punkte: Math.floor(Number(pr._abschalten[key])) }))
    .sort((a, b) => b.punkte - a.punkte || a.name.localeCompare(b.name, 'de'))
    .slice(0, n);
}

/** Leichte Quizfragen für die Bonus-Fragen in den Spielen: [Frage, Antworten, richtige Nummer], kurz genug fürs Spielfeld */
export function leichteFragen(fragen: any[], anzahl = 40, zufall = Math.random): [string, string[], number][] {
  const passend = (fragen || []).filter((q) => q && (q.level === 'easy' || !q.level) && Array.isArray(q.options) && q.options.length >= 3 && q.options.length <= 4
    && String(q.question || '').length <= 110 && q.options.every((o: any) => String(o).length <= 60) && typeof q.correct === 'number' && q.correct < q.options.length);
  const gemischt = [...passend].sort(() => zufall() - 0.5).slice(0, anzahl);
  return gemischt.map((q) => [String(q.question), q.options.map(String), q.correct]);
}
