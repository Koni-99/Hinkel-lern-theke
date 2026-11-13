// ═══ Bestenliste aufräumen (alte Runden zusammenfassen) ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.
import { ScoreEntry } from '../types';
import { scoreTime } from './zusammenfuehren';

// ───────────── Bestenliste aufräumen ─────────────
// Einzelrunden vor dem Stichtag werden pro Person, Spiel und Monat zu einem Eintrag zusammengefasst.
// Summe, Anzahl der Runden (n) und Bestwert (best) bleiben erhalten. So stimmen Gesamtpunkte, Level,
// Monatskronen, Runden und Bestwerte weiter, nur die Tages-Details alter Monate entfallen.
export function compactCutoff(now = new Date(), keepMonths = 3): number {
  return new Date(now.getFullYear(), now.getMonth() - keepMonths, 1).getTime();
}

export function compactScores(scores: ScoreEntry[], cutoff: number): { scores: ScoreEntry[]; before: number; after: number; merged: number } {
  const keep: ScoreEntry[] = [];
  const groups = new Map<string, ScoreEntry & { _t: number }>();
  let merged = 0;
  (scores || []).forEach((s) => {
    if (!s || !s.username) return;
    const t = scoreTime(s);
    if (!t || t >= cutoff) { keep.push(s); return; }
    const d = new Date(t);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const uk = s.username.toLowerCase();
    const cat = s.category || "";
    const key = `${uk}|${cat}|${ym}`;
    const n = Number(s.n) || 1;
    const v = Number(s.score) || 0;
    const best = s.n ? Number(s.best ?? v) : v;
    const g = groups.get(key);
    if (!g) {
      let h = 0; for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
      groups.set(key, {
        id: `sum-${uk}-${ym}-${h.toString(36)}`, username: s.username, score: v,
        date: `01.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear()).slice(2)}`,
        ...(cat ? { category: cat } : {}), n, best, _t: t,
      });
    } else {
      g.score += v; g.n = (g.n || 0) + n; g.best = Math.max(Number(g.best) || 0, best);
      if (t > g._t) { g._t = t; g.username = s.username; } // neueste Schreibweise des Namens
    }
    if (!s.n) merged++;
  });
  const sums = Array.from(groups.values()).map(({ _t, ...rest }) => rest as ScoreEntry);
  const out = [...keep, ...sums];
  return { scores: out, before: (scores || []).length, after: out.length, merged };
}
