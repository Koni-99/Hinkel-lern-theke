// ═══ Wertungen der Bestenliste (gemeinsam für Bestenliste und „Du wurdest überholt“) ═══
import { isLeaderboardExcludedCategory } from './allgemein';
import { monthTotals, monthKeyOf } from '../ui/kalender';

/** Emojis am Ende von Kategorienamen entfernen ("Kassenblitz ⚡" → "Kassenblitz") */
export const cleanLabel = (cat: string) => cat.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[☀-➿️‍]/g, '').trim();

// Wertungen bündeln: echte Spiele einzeln, alle Quiz-Runden zusammen, Glücksspiele gar nicht
export const GAME_NAMES = ['Theken-Simulator', 'Theken-Ansturm', 'Kassenblitz', 'Bilderquiz', 'Allergene-Training', 'Teurer oder billiger', 'Schneide-Profi', 'Tüten-Blitz', 'Alternativen-Jäger', 'Adventskalender', 'Telefon-Bestellung'];
export const QUIZ_KEY = 'Lernen & Quiz';
export const scoreGroup = (cat: string): string | null => {
  const c = cleanLabel(cat || '');
  if (!c || /^Quiz Battle|^Regal einräumen|^Bonus vom Ausbilder|^Glücksrad|^Rubbellos|^Stempelkarte/.test(c)) return null;
  const g = GAME_NAMES.find((n) => c.startsWith(n));
  return g || QUIZ_KEY;
};

type Score = { username?: string; score?: number | string; category?: string; date?: string };

/** Alle Ranglisten: Gesamt, Monat und jede Spiel-Kategorie, jeweils Namen (klein) von Platz 1 abwärts */
export function alleRanglisten(scores: Score[], progress: Record<string, any> = {}): Record<string, { label: string; liste: string[] }> {
  const out: Record<string, { label: string; liste: string[] }> = {};
  const sortiert = (m: Record<string, number>) => Object.entries(m).filter(([k, v]) => k !== 'admin' && v > 0).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const gesamt: Record<string, number> = {};
  const kat: Record<string, Record<string, number>> = {};
  for (const s of scores || []) {
    if (!s?.username) continue;
    const k = s.username.toLowerCase(); const v = Number(s.score) || 0;
    gesamt[k] = (gesamt[k] || 0) + v;
    if (s.category && !isLeaderboardExcludedCategory(s.category)) {
      const g = scoreGroup(s.category);
      if (g) { kat[g] = kat[g] || {}; kat[g][k] = (kat[g][k] || 0) + v; }
    }
  }
  Object.keys(gesamt).forEach((k) => { gesamt[k] -= Number(progress[k]?._ptsSpent) || 0; });
  out.total = { label: 'in der Gesamtwertung', liste: sortiert(gesamt) };
  const monat = monthTotals(scores as any)[monthKeyOf()] || {};
  out.month = { label: 'in der Monatswertung', liste: sortiert(monat) };
  for (const [g, m] of Object.entries(kat)) out[`cat:${g}`] = { label: g === QUIZ_KEY ? 'bei Lernen & Quiz' : `bei „${cleanLabel(g)}“`, liste: sortiert(m) };
  return out;
}
