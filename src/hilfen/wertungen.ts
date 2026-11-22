// ═══ Wertungen der Bestenliste (gemeinsam für Bestenliste und „Du wurdest überholt“) ═══
import { isLeaderboardExcludedCategory } from './allgemein';
import { monthTotals, monthKeyOf } from '../ui/kalender';

/** Emojis am Ende von Kategorienamen entfernen ("Kassenblitz ⚡" → "Kassenblitz") */
export const cleanLabel = (cat: string) => cat.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[☀-➿️‍]/g, '').trim();

// Wertungen bündeln: echte Spiele einzeln, alle Quiz-Runden zusammen, Glücksspiele gar nicht
export const GAME_NAMES = ['Theken-Simulator', 'Theken-Ansturm', 'Kassenblitz', 'Bilderquiz', 'Allergene-Training', 'Teurer oder billiger', 'Schneide-Profi', 'Tüten-Blitz', 'Alternativen-Jäger', 'Adventskalender', 'Telefon-Bestellung', 'Ofen-Kette', 'Rechen-Trainer'];
export const QUIZ_KEY = 'Lernen & Quiz';
export const scoreGroup = (cat: string): string | null => {
  const c = cleanLabel(cat || '');
  if (!c || /^Quiz Battle|^Regal einräumen|^Bonus vom Ausbilder|^Glücksrad|^Rubbellos|^Stempelkarte/.test(c)) return null;
  const g = GAME_NAMES.find((n) => c.startsWith(n));
  return g || QUIZ_KEY;
};

type Score = { id?: string; username?: string; score?: number | string; category?: string; date?: string };

// ── Version 262: Neustart der Bestenliste (Knopf im Ausbilder-Bereich) ──
// Gespeichert unter progress/admin/_bestenlisteNeu = { ts, ausgaben: { name: _ptsSpent beim Neustart } }.
// Nichts wird gelöscht: Die Bestenliste zählt nur Einträge ab ts, Schatzkammer-Ausgaben nur, was danach dazukam.
// Stufe, Punkte-Guthaben, Trinkgeld, Lernstand und Abzeichen bleiben wie sie sind.
export type Neustart = { ts: number; ausgaben?: Record<string, number> };
export const neustartVon = (progress?: Record<string, any>): Neustart | null => {
  const n = progress?.admin?._bestenlisteNeu;
  return n && Number(n.ts) > 0 ? { ts: Number(n.ts), ausgaben: n.ausgaben || {} } : null;
};
/** Zeitpunkt eines Eintrags: aus der id (13-stellige Zeit), sonst aus dem Datum „19.11.26, 08:00“ */
export function scoreZeit(s: { id?: string; date?: string }): number {
  const m = String(s?.id || '').match(/(\d{13})/);
  if (m) return Number(m[1]);
  const d = String(s?.date || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:,?\s*(\d{1,2}):(\d{2}))?/);
  if (!d) return 0;
  const y = Number(d[3]) < 100 ? 2000 + Number(d[3]) : Number(d[3]);
  return new Date(y, Number(d[2]) - 1, Number(d[1]), Number(d[4] || 0), Number(d[5] || 0)).getTime();
}
/** Nur die Einträge, die in der Bestenliste zählen (seit dem Neustart) */
export function abNeustart<T extends { id?: string; date?: string }>(scores: T[], progress?: Record<string, any>): T[] {
  const n = neustartVon(progress);
  if (!n) return scores || [];
  // Einträge ohne genaue Zeit in der id haben nur Minuten: dieselbe Minute zählt noch mit
  return (scores || []).filter((s) => scoreZeit(s) >= (/\d{13}/.test(String(s?.id || '')) ? n.ts : n.ts - 59999));
}
/** In der Schatzkammer ausgegebene Punkte, die in der Bestenliste abgezogen werden (seit dem Neustart) */
export function ausgabenInWertung(progress: Record<string, any> | undefined, k: string): number {
  const sp = Number(progress?.[k]?._ptsSpent) || 0;
  const n = neustartVon(progress);
  return n ? Math.max(0, sp - (Number(n.ausgaben?.[k]) || 0)) : sp;
}

/** Alle Ranglisten: Gesamt, Monat und jede Spiel-Kategorie, jeweils Namen (klein) von Platz 1 abwärts */
export function alleRanglisten(scores: Score[], progress: Record<string, any> = {}): Record<string, { label: string; liste: string[] }> {
  const out: Record<string, { label: string; liste: string[] }> = {};
  const sortiert = (m: Record<string, number>) => Object.entries(m).filter(([k, v]) => k !== 'admin' && v > 0).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const gesamt: Record<string, number> = {};
  const kat: Record<string, Record<string, number>> = {};
  for (const s of abNeustart(scores || [], progress)) {
    if (!s?.username) continue;
    const k = s.username.toLowerCase(); const v = Number(s.score) || 0;
    gesamt[k] = (gesamt[k] || 0) + v;
    if (s.category && !isLeaderboardExcludedCategory(s.category)) {
      const g = scoreGroup(s.category);
      if (g) { kat[g] = kat[g] || {}; kat[g][k] = (kat[g][k] || 0) + v; }
    }
  }
  Object.keys(gesamt).forEach((k) => { gesamt[k] -= ausgabenInWertung(progress, k); });
  out.total = { label: 'in der Gesamtwertung', liste: sortiert(gesamt) };
  const monat = monthTotals(abNeustart(scores || [], progress) as any)[monthKeyOf()] || {};
  out.month = { label: 'in der Monatswertung', liste: sortiert(monat) };
  for (const [g, m] of Object.entries(kat)) out[`cat:${g}`] = { label: g === QUIZ_KEY ? 'bei Lernen & Quiz' : `bei „${cleanLabel(g)}“`, liste: sortiert(m) };
  return out;
}

/** Version 284 (Wunsch des Nutzers): Koni bekommt immer doppelte Punkte, ohne Hinweis in der App */
export const PUNKTE_SONDERFAKTOR: Record<string, number> = { koni: 2 };
export const sonderPunkte = (userKey: string, punkte: number) => (punkte > 0 ? Math.round(punkte * (PUNKTE_SONDERFAKTOR[(userKey || '').toLowerCase()] || 1)) : punkte);
