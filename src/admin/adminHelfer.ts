// ═══ Ausbilder-Bereich: gemeinsame Helfer ═══
// Vorher oben in components/AdminView.tsx. Inhalt unverändert übernommen.

// ── Hilfen für die Wochenübersicht ──
export const dayKeyA = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const weekStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
export const weekDayKeys = () => { const m = weekStart(); return Array.from({ length: 7 }, (_, i) => { const d = new Date(m); d.setDate(m.getDate() + i); return dayKeyA(d); }); };
/** Datum aus „02.11.26, 07:34“ lesen */
export const parseScoreDate = (txt?: string): Date | null => {
  const m = (txt || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!m) return null;
  const y = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
  return new Date(y, Number(m[2]) - 1, Number(m[1]));
};
export const streakOf = (days: string[]) => {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(dayKeyA(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKeyA(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
};

/** Eine Meldung zu einer Frage oder einem Spieltext (vorher als Typ in AdminView) */
export type ReportItem = { user: string; r: string; t: string; d: string; ts: number; g?: string };
