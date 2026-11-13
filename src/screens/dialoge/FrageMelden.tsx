// ═══ Pop-up: Frage melden ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';
import { dc } from '../../daten/data';
import { btnPrimary, btnSecondary } from '../../ui/basis';
import { LT } from '../../basis/marke';

export type FrageMeldenProps = {
  submitReport: (q: any, reason: string, text: string) => void;
  setReportQ: Dispatch<any>;
  reportQ: any;
  reportReason: string;
  setReportReason: Dispatch<SetStateAction<string>>;
  reportText: string;
  setReportText: Dispatch<SetStateAction<string>>;
  reportSentRef: MutableRefObject<(() => void) | null>;
  setToast: Dispatch<SetStateAction<string>>;
};

export function FrageMelden({ submitReport, setReportQ, reportQ, reportReason, setReportReason, reportText, setReportText, reportSentRef, setToast }: FrageMeldenProps) {
  if (!reportQ) return null; // wie die Bedingung in App.tsx
  return (
    <div className="lt-overlay" onClick={() => setReportQ(null)} style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Frage melden" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ backgroundColor: LT.yellow, padding: '20px 22px' }}>
          <div style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1 }}>⚑ {reportQ.__g ? 'Fehler melden' : 'Frage melden'}</div>
          <div style={{ fontSize: '16px', marginTop: '4px' }}>Der Ausbilder sieht deine Meldung und kümmert sich darum.</div>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reportQ.__g && <div style={{ fontSize: '15px', fontWeight: 700, color: LT.muted }}>{reportQ.__g.game}{reportQ.__g.product ? ` · ${reportQ.__g.product}` : ''}</div>}
          <div style={{ fontSize: '16px', color: LT.muted, lineHeight: 1.45, whiteSpace: 'pre-line' }}>„{reportQ.question}“</div>
          <div style={{ fontSize: '17px', fontWeight: 700 }}>Was stimmt nicht?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Antwort ist falsch', 'Frage ist unklar', 'Tippfehler', 'Stimmt nicht mehr (z. B. Preis)', 'Sonstiges'].map(r => {
              const on = reportReason === r;
              return <button key={r} onClick={() => setReportReason(r)} style={{ minHeight: '46px', padding: '0 14px', borderRadius: '999px', border: on ? 'none' : `2px solid ${LT.line}`, backgroundColor: on ? LT.brown : dc('#FFFFFF'), color: on ? dc('#FFF6E0') : LT.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>{r}</button>;
            })}
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', fontWeight: 700 }}>
            Was wäre richtig? Dein Verbesserungsvorschlag (freiwillig)
            <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} maxLength={300} rows={3} placeholder="z. B. „Der Preis ist inzwischen 3,20 €“" style={{ padding: '12px 14px', borderRadius: '14px', border: `2px solid ${LT.line}`, fontSize: '17px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button disabled={!reportReason} onClick={() => { submitReport(reportQ, reportReason, reportText); if (reportSentRef.current) { reportSentRef.current(); reportSentRef.current = null; } setReportQ(null); setToast('Danke! Deine Meldung ist beim Ausbilder angekommen.'); }} style={{ ...btnPrimary, flex: '1 1 200px', opacity: reportReason ? 1 : 0.45 }}>Meldung senden</button>
            <button onClick={() => setReportQ(null)} style={{ ...btnSecondary, flex: '0 1 auto' }}>Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  );
}
