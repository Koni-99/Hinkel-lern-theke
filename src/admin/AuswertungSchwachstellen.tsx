// ═══ Ausbilder-Bereich: Auswertung, Schwachstellen im Team ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { CSSProperties } from 'react';
import { TH, cardStyle } from '../components/minigameUtils';
import { CloudPayload } from '../types';
import { getRightAnswerText } from '../utils';

export type AuswertungSchwachstellenProps = {
  overwriteCloudDataDirectly: (updater: (curr: CloudPayload) => CloudPayload) => void;
  allQById: Map<number, any>;
  qStats: Record<number, { r: number; w: number; users: number; }>;
  catWeak: { rate: number; r: number; w: number; key: string; }[];
  productWeak: { rate: number; r: number; w: number; key: string; }[];
  thekeWeakTeam: { rate: number; ok: number; bad: number; key: string; }[];
  hardestQs: number[];
  rateBar: (rate: number) => JSX.Element;
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  sectionTitle: (title: string, sub?: string | undefined) => JSX.Element;
};

export function AuswertungSchwachstellen({ overwriteCloudDataDirectly, allQById, qStats, catWeak, productWeak, thekeWeakTeam, hardestQs, rateBar, smallBtn, sectionTitle }: AuswertungSchwachstellenProps) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
        {sectionTitle('Schwachstellen im Team', 'Wo passieren die meisten Fehler? Hier lohnt sich eine kurze Schulung.')}
        {hardestQs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirm('Die Fehler-Statistik des ganzen Teams auf 0 zurücksetzen? (Der Fehler-Stapel der Mitarbeiter bleibt.)')) return;
              overwriteCloudDataDirectly((curr) => {
                curr.wrongStats = {};
                Object.keys(curr.progress || {}).forEach(uKey => { if (curr.progress[uKey]) { curr.progress[uKey].wrongStats = {}; curr.progress[uKey]._qs = {}; } });
                return curr;
              });
            }}
            style={smallBtn('danger')}
          >
            Statistik zurücksetzen
          </button>
        )}
      </div>
      {hardestQs.length === 0 && thekeWeakTeam.length === 0 ? (
        <p style={{ margin: 0, fontSize: '18px', color: TH.muted }}>Noch keine Fehler aufgezeichnet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.cream, border: `2px solid ${TH.line}` }}>
              <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Fehlerquote je Bereich</div>
              {catWeak.length === 0 ? <div style={{ color: TH.muted }}>Noch keine Daten.</div> : catWeak.map(c => (
                <div key={c.key} style={{ marginBottom: '10px', fontSize: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><span>{c.key}</span><strong>{c.rate} %</strong></div>
                  {rateBar(c.rate)}
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.cream, border: `2px solid ${TH.line}` }}>
              <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Produkte mit den meisten Fehlern</div>
              {productWeak.length === 0 ? <div style={{ color: TH.muted }}>Noch keine Daten.</div> : productWeak.map(c => (
                <div key={c.key} style={{ marginBottom: '10px', fontSize: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><span>{c.key}</span><strong>{c.w}× falsch</strong></div>
                  {rateBar(c.rate)}
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.cream, border: `2px solid ${TH.line}` }}>
              <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Theken-Simulator: schwierigste Themen</div>
              {thekeWeakTeam.length === 0 ? <div style={{ color: TH.muted }}>Noch keine Daten.</div> : thekeWeakTeam.map(c => (
                <div key={c.key} style={{ marginBottom: '10px', fontSize: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><span>{c.key}</span><strong>{c.rate} % falsch</strong></div>
                  {rateBar(c.rate)}
                </div>
              ))}
            </div>
          </div>
          {hardestQs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '19px' }}>{hardestQs.length === 1 ? 'Die schwierigste Frage' : `Die ${hardestQs.length} schwierigsten Fragen`}</div>
              {hardestQs.map((qId, idx) => {
                const foundQ = allQById.get(qId);
                const st = qStats[qId];
                const rate = st.r + st.w ? Math.round((st.w / (st.r + st.w)) * 100) : 0;
                return (
                  <div key={qId} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', borderRadius: '16px', backgroundColor: idx < 3 ? TH.tintPeach : TH.cream, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1, minWidth: '32px' }}>{idx + 1}</span>
                    <div style={{ flex: '1 1 260px', fontSize: '17px', lineHeight: 1.45 }}>
                      <div style={{ fontWeight: 700 }}>{foundQ.question}</div>
                      <div style={{ color: TH.muted, fontSize: '15px' }}>{foundQ.category || (foundQ.examGroup === 'ZP' ? 'Zwischenprüfung' : 'Abschlussprüfung')}{foundQ.product ? ` · ${foundQ.product}` : ''}</div>
                      <div style={{ color: TH.green, marginTop: '4px' }}>Richtig: <strong>{getRightAnswerText(foundQ)}</strong></div>
                    </div>
                    <span style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: TH.white, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'right', fontSize: '15px', lineHeight: 1.4 }}>
                      {st.w}× falsch{st.r ? ` · ${rate} %` : ''}<br /><span style={{ fontWeight: 400, color: TH.muted }}>bei {st.users} {st.users === 1 ? 'Person' : 'Personen'}</span>
                    </span>
                  </div>
                );
              })}
              <div style={{ fontSize: '15px', color: TH.muted }}>Prozent = Anteil falscher Antworten. Richtige Antworten werden ab diesem Update mitgezählt, die Quote wird also mit der Zeit genauer.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
