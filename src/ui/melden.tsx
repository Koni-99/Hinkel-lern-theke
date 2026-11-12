// ═══ „Frage melden“: Meldungen aus Spielen und Quiz ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, CSSProperties, ReactNode } from 'react';
import { dc } from '../data';
import { TH, cardStyle } from './basis';

// ───────────────────────── Fehler melden (in allen Spielen) ─────────────────────────
/** Was in einem Spiel gemeldet wird: Spielname, was angezeigt wurde, ggf. Produkt oder Quizfrage */
export type GameReport = { game: string; text: string; detail?: string; product?: string; qid?: number };

export type Reporter = (r: GameReport, onSent: () => void) => void;

export let gameReporter: Reporter | null = null;

export let reportedKeys: Record<string, boolean> = {};

/** Wird von der App gesetzt (für den Ausbilder: null = kein Melden-Knopf) */
export function setGameReporter(fn: Reporter | null, alreadyReported: Record<string, any> = {}) {
  gameReporter = fn;
  reportedKeys = {};
  Object.keys(alreadyReported || {}).forEach(k => { reportedKeys[k] = true; });
}

export const hashText = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

/** Schlüssel einer Meldung: Quizfragen über ihre Nummer, Spiele über Spiel + Text */
export const reportKeyOf = (r: GameReport) => (typeof r.qid === 'number' ? String(r.qid) : `g_${hashText(r.game + '|' + r.text + (r.detail ? '|' + r.detail : ''))}`);

// Aktuelle Frage/Aufgabe, die gerade auf dem Bildschirm ist → schwebender Knopf „⚑ Fehler melden“ (überall gleich)
export let currentReport: GameReport | null = null;

export const reportListeners: Array<() => void> = [];

export const notifyReport = () => reportListeners.slice().forEach(f => f());

/** In jedes Spiel einbauen: meldet, welche Frage gerade angezeigt wird */
export function ReportContext({ report }: { report: GameReport | null }) {
  const key = report ? `${report.game}|${report.qid ?? ''}|${report.text}|${report.detail || ''}` : '';
  useEffect(() => {
    currentReport = report;
    notifyReport();
    return () => { if (currentReport === report) { currentReport = null; notifyReport(); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

/** Schwebender Knopf am rechten Rand: immer da, wenn eine Frage angezeigt wird */
export function FloatingReportButton() {
  const [, force] = useState(0);
  const [sentKey, setSentKey] = useState('');
  useEffect(() => {
    const f = () => force(x => x + 1);
    reportListeners.push(f);
    return () => { const i = reportListeners.indexOf(f); if (i >= 0) reportListeners.splice(i, 1); };
  }, []);
  const r = currentReport;
  if (!gameReporter || !r) return null;
  const key = reportKeyOf(r);
  const done = sentKey === key || !!reportedKeys[key];
  return (
    <button
      className="lt-float-report"
      disabled={done}
      onClick={() => gameReporter && gameReporter(r, () => { reportedKeys[key] = true; setSentKey(key); })}
      aria-label={done ? 'Schon gemeldet' : 'Fehler bei dieser Frage melden'}
      style={{ position: 'fixed', right: 0, top: '46%', zIndex: 950, writingMode: 'vertical-rl', transform: 'rotate(180deg)', padding: '14px 9px', borderRadius: '0 14px 14px 0', border: `2px solid ${TH.line}`, borderLeft: 'none', backgroundColor: done ? TH.tintSage : dc('#FFFFFF'), color: done ? TH.green : TH.brown, fontSize: '15px', fontWeight: 700, cursor: done ? 'default' : 'pointer', boxShadow: '0 6px 18px rgba(43,23,10,.18)', letterSpacing: '.5px' }}
    >{done ? '✓ Gemeldet' : '⚑ Fehler melden'}</button>
  );
}

export function ReportLink({ report, align = 'right' }: { report: GameReport; align?: 'left' | 'right' | 'center' }) {
  const [sent, setSent] = useState(false);
  if (!gameReporter) return null;
  const key = reportKeyOf(report);
  const wrap: CSSProperties = { display: 'flex', justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end', marginTop: '10px' };
  if (sent || reportedKeys[key]) return <div style={wrap}><span style={{ fontSize: '15px', color: TH.muted, fontWeight: 700 }}>⚑ Gemeldet, danke!</span></div>;
  return (
    <div style={wrap}>
      <button
        onClick={(e) => { e.stopPropagation(); gameReporter && gameReporter(report, () => { reportedKeys[key] = true; setSent(true); }); }}
        style={{ minHeight: '40px', padding: '0 12px', borderRadius: '10px', border: `2px solid ${TH.line}`, backgroundColor: dc('#FFFFFF'), color: TH.muted, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
      >⚑ Fehler melden</button>
    </div>
  );
}

/** Aufklappbare Liste „Aufgaben dieser Runde ansehen“ – jede Aufgabe kann gemeldet werden */
export function ReportList({ items, title = 'Alle Aufgaben dieser Runde ansehen (Fehler melden)' }: { items: { label: ReactNode; report: GameReport }[]; title?: string }) {
  if (!gameReporter || items.length === 0) return null;
  return (
    <details style={{ ...cardStyle, padding: '16px 20px' }}>
      <summary style={{ cursor: 'pointer', fontSize: '17px', fontWeight: 700, color: TH.muted, minHeight: '44px', display: 'flex', alignItems: 'center' }}>{title}</summary>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
        {items.map((it, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream, fontSize: '16px', lineHeight: 1.45 }}>
            {it.label}
            <ReportLink report={it.report} />
          </div>
        ))}
      </div>
    </details>
  );
}
