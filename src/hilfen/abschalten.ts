// ═══ Version 266: Spiele „Zum Abschalten“ (Spielen → ganz unten) ═══
// Die Spiele selbst liegen als eigene Seite in public/abschalten/index.html (gebaut aus tools/abschalten, läuft im iframe).
// Keine Punkte für die Gesamtwertung (Wunsch des Nutzers), nur eigener Rekord und eine kleine Bestenliste je Spiel.
// Rekord im eigenen Fortschritt: progress/<name>/_abschalten { lauf: 123, … }
import { alleNachrichten, postfachKey } from './nachrichten';
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

// ═══ Version 268: Goldstücke, Tagesaufgabe, Kollegen herausfordern ═══
/** Goldstück je Spiel → Teigi-Sache (gibt es nur so, nicht im Laden). Namen gleich wie GOLD in tools/abschalten/core.js */
export const GOLD_SACHEN: Record<string, { ding: string; id: string; sache: string }> = {
  lauf: { ding: 'Goldkorn', id: 'tz_g_stirnband', sache: 'Stirnband' },
  chaos: { ding: 'Goldbrezel', id: 'tz_g_haarreif', sache: 'Brezel-Haarreif' },
  tour: { ding: 'Goldpaket', id: 'tz_g_kappe', sache: 'Fahrermütze' },
  schutz: { ding: 'Goldähre', id: 'tz_g_ritter', sache: 'Ritterhelm' },
  schleuder: { ding: 'Goldform', id: 'tz_g_flieger', sache: 'Fliegerbrille' },
  stapler: { ding: 'Goldlaib', id: 'tz_g_bauhelm', sache: 'Bauhelm' },
};
/** Für das Spiel: welche Goldstücke habe ich schon? { lauf: true, … } */
export function goldSchon(pr: any): Record<string, boolean> {
  const owned: string[] = Array.isArray(pr?._shopOwned) ? pr._shopOwned : [];
  const out: Record<string, boolean> = {};
  Object.entries(GOLD_SACHEN).forEach(([k, g]) => { if (owned.includes(g.id)) out[k] = true; });
  return out;
}
/** Goldstück gefangen: Zähler hoch, Teigi-Sache freischalten. Gibt true, wenn die Sache neu ist. */
export function goldGutschreiben(pr: any, key: string): boolean {
  const g = GOLD_SACHEN[key]; if (!g) return false;
  pr._abGold = { ...(pr._abGold || {}), [key]: (Number(pr._abGold?.[key]) || 0) + 1 };
  const owned: string[] = Array.isArray(pr._shopOwned) ? pr._shopOwned : [];
  if (owned.includes(g.id)) return false;
  pr._shopOwned = [...owned, g.id];
  return true;
}
export const goldAnzahl = (pr: any) => Object.keys(GOLD_SACHEN).filter((k) => Number(pr?._abGold?.[k]) > 0).length;

/** Tagesaufgabe geschafft: _abAufgaben { 'JJJJ-MM-TT': aufgabenId }, höchstens ein Eintrag pro Tag (älteste fallen nach 400 Tagen raus) */
export function aufgabeMerken(pr: any, tag: string, id: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tag) || !id) return false;
  const alt = pr._abAufgaben || {};
  if (alt[tag]) return false;
  const tage = Object.keys(alt).sort().slice(-399);
  pr._abAufgaben = { ...Object.fromEntries(tage.map((t) => [t, alt[t]])), [tag]: String(id).slice(0, 40) };
  return true;
}
export const aufgabenAnzahl = (pr: any) => Object.keys(pr?._abAufgaben || {}).length;
export const heuteKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Text der Herausforderung (fester Text, darum darf jeder sie schicken) */
export const herausforderungText = (key: string, punkte: number) => `Schlag meine ${Math.floor(punkte).toLocaleString('de-DE')} Punkte bei „${abschaltenSpiel(key)?.titel || 'Zum Abschalten'}“!`;

// ═══ Version 269: Wochen-Bestenliste, Herausforderung geschlagen, Sammlung ═══
/** Montag der Woche als 'JJJJ-MM-TT' */
export function wocheKey(d = new Date()): string {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return heuteKey(m);
}
/** Beste Punkte der Woche je Spiel: _abWoche { lauf: { w: Montag, p } } */
export function wocheMerken(pr: any, key: string, punkte: number, d = new Date()): boolean {
  if (!abschaltenSpiel(key)) return false;
  const p = Math.max(0, Math.min(1_000_000, Math.floor(Number(punkte) || 0))), w = wocheKey(d);
  const alt = pr._abWoche?.[key];
  if (p <= 0 || (alt && alt.w === w && Number(alt.p) >= p)) return false;
  pr._abWoche = { ...(pr._abWoche || {}), [key]: { w, p } };
  return true;
}
export function wochenliste(progress: Record<string, any> | undefined, key: string, n = 5, d = new Date()): { k: string; name: string; punkte: number }[] {
  const w = wocheKey(d);
  return Object.entries(progress || {})
    .filter(([k, pr]) => k !== 'admin' && pr?._abWoche?.[key]?.w === w && Number(pr._abWoche[key].p) > 0)
    .map(([k, pr]) => ({ k, name: String(pr?._displayName || k), punkte: Math.floor(Number(pr._abWoche[key].p)) }))
    .sort((a, b) => b.punkte - a.punkte || a.name.localeCompare(b.name, 'de'))
    .slice(0, n);
}

/** Nach einer Runde: Herausforderungen an mich in diesem Spiel, die ich jetzt geschlagen habe, im eigenen Fortschritt merken
 *  (_abGeschlagen { postfachKey: { p, ts } }). Gibt die Namen der Absender zurück. */
export function geschlageneMerken(progress: Record<string, any> | undefined, ich: string, pr: any, key: string, punkte: number, now = Date.now()): string[] {
  const p = Math.floor(Number(punkte) || 0); if (p <= 0) return [];
  const namen: string[] = [];
  alleNachrichten(progress as any).forEach((n) => {
    if (!n.ab || n.ab.k !== key || n.von === ich || !n.an?.[ich] || p <= Number(n.ab.p)) return;
    const pk = postfachKey(n.von, n.id);
    if (pr._abGeschlagen?.[pk]) return;
    pr._abGeschlagen = { ...(pr._abGeschlagen || {}), [pk]: { p, ts: now } };
    namen.push(n.vonName);
  });
  return namen;
}
/** Für den Absender: welche Kollegen haben meine Herausforderungen geschlagen? (neueste zuerst) */
export type Geschlagen = { id: string; wer: string; werName: string; key: string; meine: number; deine: number; ts: number };
export function meineGeschlagenen(progress: Record<string, any> | undefined, ich: string): Geschlagen[] {
  const out: Geschlagen[] = [];
  alleNachrichten(progress as any).forEach((n) => {
    if (n.von !== ich || !n.ab || !abschaltenSpiel(n.ab.k)) return;
    const pk = postfachKey(n.von, n.id);
    Object.keys(n.an || {}).forEach((k) => {
      const e = (progress as any)?.[k]?._abGeschlagen?.[pk];
      if (e) out.push({ id: `${pk}_${k}`, wer: k, werName: String((progress as any)?.[k]?._displayName || n.an[k] || k), key: n.ab!.k, meine: Number(n.ab!.p) || 0, deine: Number(e.p) || 0, ts: Number(e.ts) || 0 });
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
}
export const geschlagenText = (g: Geschlagen) => `${g.werName} hat deine ${g.meine.toLocaleString('de-DE')} bei „${abschaltenSpiel(g.key)?.titel || ''}“ geschlagen: ${g.deine.toLocaleString('de-DE')}!`;

/** Tagesaufgaben in Folge (bis heute oder gestern) */
export function aufgabenSerie(pr: any, d = new Date()): number {
  const tage = new Set(Object.keys(pr?._abAufgaben || {}));
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (!tage.has(heuteKey(t))) t.setDate(t.getDate() - 1);
  let n = 0;
  while (tage.has(heuteKey(t)) && n < 1000) { n++; t.setDate(t.getDate() - 1); }
  return n;
}
