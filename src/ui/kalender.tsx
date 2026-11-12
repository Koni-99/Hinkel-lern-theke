// ═══ Monate, Monatssieger, Ostern, Anmelde-Belohnungen ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState, CSSProperties } from 'react';
import { TH, btnPrimary, ConfettiOverlay } from './basis';

// ───────────────────────── Monatsmeister ─────────────────────────
export const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** Monat eines Bestenlisten-Eintrags als "2026-11" (Datum steht als "08.11.26, 04:46" drin) */
export function scoreMonth(date: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/.exec(String(date || ''));
  if (m) { const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]); return `${y}-${String(Number(m[2])).padStart(2, '0')}`; }
  const t = Date.parse(String(date || ''));
  if (!Number.isFinite(t)) return '';
  const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function scoreDay(date: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/.exec(String(date || ''));
  if (!m) return '';
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return `${y}-${String(Number(m[2])).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`;
}

export const monthLabel = (mk: string) => { const [y, m] = mk.split('-'); return `${MONTHS_DE[Number(m) - 1] || ''} ${y}`; };

export const monthKeyOf = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const prevMonthKey = (d = new Date()) => monthKeyOf(new Date(d.getFullYear(), d.getMonth() - 1, 1));

/** Punkte pro Person und Monat */
export function monthTotals(scores: { username: string; score: number; date: string }[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  (scores || []).forEach(s => {
    if (!s || !s.username) return;
    const k = s.username.toLowerCase(); if (k === 'admin') return;
    if ((s as any).category === 'Bonus vom Ausbilder') return; // geschenkte Punkte zählen nicht für die Monatskrone
    const mk = scoreMonth(s.date); if (!mk) return;
    (out[mk] = out[mk] || {})[k] = (out[mk][k] || 0) + (Number(s.score) || 0);
  });
  return out;
}

/** Sieger jedes abgeschlossenen Monats, neuester zuerst */
export function monthChampions(scores: { username: string; score: number; date: string }[], now = new Date()): { month: string; key: string; points: number }[] {
  const tot = monthTotals(scores); const cur = monthKeyOf(now);
  return Object.keys(tot).filter(mk => mk < cur).sort().reverse().map(mk => {
    const best = Object.entries(tot[mk]).sort((a, b) => b[1] - a[1])[0];
    return best ? { month: mk, key: best[0], points: best[1] } : null;
  }).filter(Boolean) as { month: string; key: string; points: number }[];
}

// ───────────────────────── Osterzeit ─────────────────────────
export function easterSunday(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

/** Von Palmsonntag bis eine Woche nach Ostern */
export function osterZeit(d = new Date()): boolean {
  const e = easterSunday(d.getFullYear());
  const from = new Date(e.getFullYear(), e.getMonth(), e.getDate() - 7);
  const to = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 8);
  return d >= from && d < to;
}

export const OSTER_TABS: { id: string; label: string }[] = [
  { id: 'home', label: 'Start' }, { id: 'quiz', label: 'Lernen' }, { id: 'spielen', label: 'Spielen' }, { id: 'nachschlagen', label: 'Nachschlagen' }, { id: 'scoreboard', label: 'Bestenliste' }, { id: 'statistik', label: 'Meine Statistik' },
];

export const EGG_SPOTS: Record<string, CSSProperties> = {
  home: { right: '6%', top: '420px' }, quiz: { left: '3%', top: '260px' }, spielen: { right: '4%', top: '520px' },
  nachschlagen: { left: '45%', top: '180px' }, scoreboard: { left: '2%', top: '640px' }, statistik: { right: '8%', top: '300px' },
};

export const EGG_COLORS = ['#F28CB1', '#8FD3F4', '#B8E986', '#FFD36E', '#C7A6F2', '#FFA36C'];

export function OsterEi({ tab, onFind }: { tab: string; onFind: (tab: string) => void }) {
  const i = Math.max(0, OSTER_TABS.findIndex(t => t.id === tab));
  const col = EGG_COLORS[i % EGG_COLORS.length];
  return (
    <button onClick={() => onFind(tab)} aria-label="Osterei einsammeln" className="lt-osterei" style={{ position: 'absolute', zIndex: 4, width: '46px', height: '58px', border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', ...EGG_SPOTS[tab] }}>
      <svg viewBox="0 0 46 58" width="46" height="58" aria-hidden="true">
        <ellipse cx="23" cy="32" rx="19" ry="24" fill={col} stroke="#FFFFFF" strokeWidth="2" />
        <path d="M5 30 Q11 24 17 30 T29 30 T41 30" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="15" cy="42" r="2.6" fill="#FFFFFF" /><circle cx="23" cy="45" r="2.6" fill="#FFFFFF" /><circle cx="31" cy="42" r="2.6" fill="#FFFFFF" />
        <circle cx="17" cy="18" r="2" fill="#FFFFFF" opacity=".8" /><circle cx="28" cy="16" r="2" fill="#FFFFFF" opacity=".8" />
      </svg>
    </button>
  );
}

// ───────────────────────── Anmelde-Belohnung ─────────────────────────
export const LOGIN_REWARDS = [20, 30, 40, 50, 60, 80, 100];

export function LoginRewardDialog({ day, onClaim, onClose, claimedAlready = false }: { day: number; onClaim: () => void; onClose: () => void; claimedAlready?: boolean }) {
  const [claimed, setClaimed] = useState(claimedAlready);
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 105, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <ConfettiOverlay active={claimed} />
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Anmelde-Belohnung" style={{ width: '100%', maxWidth: '560px', backgroundColor: TH.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <div className="lt-emo-bob" style={{ fontSize: '54px', lineHeight: 1 }} aria-hidden="true">🎁</div>
        <div style={{ fontFamily: TH.serif, fontSize: '32px', lineHeight: 1.1 }}>Schön, dass du da bist!</div>
        <div style={{ fontSize: '17px', color: TH.brown }}>Jeden Tag gibt es eine Belohnung. Komm an 7 Arbeitstagen hintereinander (sonntags ist zu, das zählt nicht), dann wartet am 7. Tag ein Joker.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {LOGIN_REWARDS.map((c, i) => {
            const n = i + 1, past = n < day, today = n === day;
            return (
              <div key={n} className={today ? (claimed ? 'lt-login-got' : 'lt-login-today') : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 2px', borderRadius: '14px', backgroundColor: past || (today && claimed) ? TH.tintSage : today ? TH.yellow : TH.white, border: `2px solid ${today ? TH.brown : TH.line}`, opacity: n > day ? 0.7 : 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: TH.muted }}>Tag {n}</span>
                <span style={{ fontSize: '22px', lineHeight: 1.2 }} aria-hidden="true">{past || (today && claimed) ? '✅' : n === 7 ? '🃏' : '🪙'}</span>
                <span style={{ fontSize: '12px', fontWeight: 800 }}>{(c / 100).toFixed(2).replace('.', ',')} €</span>
              </div>
            );
          })}
        </div>
        {claimed ? (
          <div className="lt-levelup" style={{ fontSize: '19px', fontWeight: 800, color: TH.green }}>+{(LOGIN_REWARDS[day - 1] / 100).toFixed(2).replace('.', ',')} € Trinkgeld{day === 7 ? ' und ein Joker 🃏' : ''}!</div>
        ) : null}
        <button autoFocus onClick={() => { if (!claimed) { setClaimed(true); onClaim(); } else onClose(); }} style={btnPrimary}>{claimed ? 'Weiter geht’s' : `Tag ${day} abholen`}</button>
      </div>
    </div>
  );
}
