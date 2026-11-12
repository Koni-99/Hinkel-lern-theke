// ═══ Ausbilder-Bereich: Auswertung, Wochenbericht ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { CSSProperties } from 'react';
import { TH, cardStyle } from '../components/minigameUtils';

export type AuswertungWocheProps = {
  allKnownUserKeys: string[];
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  sectionTitle: (title: string, sub?: string | undefined) => JSX.Element;
  wStart: Date;
  weekInfo: (userKey: string) => { days: string[]; learnDays: string[]; weekPoints: number; streak: number; weakestCat: { cat: string; pct: number; }; thekeWeak: { rate: number; topic: string; ok: number; bad: number; }[]; };
  nameOf: (userKey: string) => any;
  copyReport: () => Promise<void>;
};

export function AuswertungWoche({ allKnownUserKeys, smallBtn, sectionTitle, wStart, weekInfo, nameOf, copyReport }: AuswertungWocheProps) {
  return (
    <div style={{ ...cardStyle, marginBottom: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
        {sectionTitle('Wochenbericht', `Woche ab ${wStart.toLocaleDateString('de-DE')}, wer war wie aktiv?`)}
        {allKnownUserKeys.length > 0 && <button onClick={copyReport} style={smallBtn()}>Bericht kopieren</button>}
      </div>
      {allKnownUserKeys.length === 0 ? (
        <p style={{ margin: 0, fontSize: '18px', color: TH.muted }}>Noch keine Mitarbeiter angemeldet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px', minWidth: '640px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: TH.muted }}>
                {['Name', 'Lerntage', 'Punkte', 'Serie', 'Schwächster Bereich', 'Theke üben'].map(h => <th key={h} style={{ padding: '8px 10px', borderBottom: `2px solid ${TH.line}`, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...allKnownUserKeys].sort((a, b) => weekInfo(b).learnDays.length - weekInfo(a).learnDays.length).map(k => {
                const w = weekInfo(k);
                return (
                  <tr key={k} style={{ backgroundColor: w.learnDays.length === 0 ? TH.tintPeach : 'transparent' }}>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}`, fontWeight: 700 }}>{nameOf(k)}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.learnDays.length} / 7</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.weekPoints.toLocaleString('de-DE')}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.streak}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.weakestCat ? `${w.weakestCat.cat} (${w.weakestCat.pct} %)` : '–'}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.thekeWeak.length ? w.thekeWeak.map(t => t.topic).join(', ') : '–'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: '15px', color: TH.muted, marginTop: '8px' }}>Rot markiert: diese Woche noch nicht gelernt.</div>
        </div>
      )}
    </div>
  );
}
