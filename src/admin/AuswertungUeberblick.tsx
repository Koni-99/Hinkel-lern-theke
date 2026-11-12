// ═══ Ausbilder-Bereich: Auswertung, auf einen Blick ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { CSSProperties } from 'react';
import { TH, cardStyle } from '../components/minigameUtils';
import { getRightAnswerText } from '../utils';

export type AuswertungUeberblickProps = {
  allKnownUserKeys: string[];
  allQById: Map<number, any>;
  startFix: (id: number) => void;
  renderFixEditor: () => false | JSX.Element;
  hiddenMap: Record<string, number>;
  hideQuestion: (qid: string) => void;
  qStats: Record<number, { r: number; w: number; users: number; }>;
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  sectionTitle: (title: string, sub?: string | undefined) => JSX.Element;
  weekInfo: (userKey: string) => { days: string[]; learnDays: string[]; weekPoints: number; streak: number; weakestCat: { cat: string; pct: number; }; thekeWeak: { rate: number; topic: string; ok: number; bad: number; }[]; };
  nameOf: (userKey: string) => any;
};

export function AuswertungUeberblick({ allKnownUserKeys, allQById, startFix, renderFixEditor, hiddenMap, hideQuestion, qStats, smallBtn, sectionTitle, weekInfo, nameOf }: AuswertungUeberblickProps) {
  const active = allKnownUserKeys.filter(k => weekInfo(k).learnDays.length > 0);
  const lastDay = (k: string) => { const d = weekInfo(k).days; return d.length ? [...d].sort().slice(-1)[0] : ''; };
  const twoWeeks = new Date(); twoWeeks.setDate(twoWeeks.getDate() - 7);
  const limit = `${twoWeeks.getFullYear()}-${String(twoWeeks.getMonth() + 1).padStart(2, '0')}-${String(twoWeeks.getDate()).padStart(2, '0')}`;
  const behind = allKnownUserKeys.filter(k => { const l = lastDay(k); return !l || l < limit; });
  const check = Object.keys(qStats).map(Number).filter(id => { const st = qStats[id]; const n = st.r + st.w; return n >= 5 && st.w / n >= 0.6 && allQById.has(id) && !hiddenMap[String(id)]; })
    .sort((x, y) => (qStats[y].w / (qStats[y].r + qStats[y].w)) - (qStats[x].w / (qStats[x].r + qStats[x].w)));
  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {sectionTitle('Auf einen Blick', 'Wer ist dabei, wer braucht einen Schubs, welche Fragen solltest du prüfen?')}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.tintSage }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>Diese Woche aktiv</div>
          <div style={{ fontFamily: TH.serif, fontSize: '34px', lineHeight: 1.1 }}>{active.length} von {allKnownUserKeys.length}</div>
        </div>
        <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: behind.length ? TH.tintPeach : TH.cream }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>Seit über einer Woche nicht gelernt</div>
          {behind.length === 0 ? <div style={{ fontSize: '17px', fontWeight: 700, color: TH.green, marginTop: '4px' }}>Niemand, super!</div> : behind.map(k => (
            <div key={k} style={{ fontSize: '16px', marginTop: '4px' }}><strong>{nameOf(k)}</strong> · {lastDay(k) ? `zuletzt ${lastDay(k).split('-').reverse().join('.')}` : 'noch nie'}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontWeight: 700, fontSize: '19px' }}>Fragen zum Prüfen {check.length > 0 ? `(${check.length})` : ''}</div>
        <div style={{ fontSize: '15px', color: TH.muted }}>Mindestens 5 Antworten und über 60 % falsch. Oft ist die Frage unklar oder die Antwort stimmt nicht mehr.</div>
        {check.length === 0 ? <div style={{ fontSize: '17px', color: TH.green, fontWeight: 700 }}>Gerade keine auffälligen Fragen.</div> : check.slice(0, 15).map(id => {
          const q = allQById.get(id); const st = qStats[id]; const rate = Math.round(st.w / (st.r + st.w) * 100);
          return (
            <div key={id} style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintPeach, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '17px', lineHeight: 1.4 }}>{q.question}</div>
              <div style={{ fontSize: '15px', color: TH.green }}>Richtig laut App: <strong>{getRightAnswerText(q)}</strong></div>
              <div style={{ fontSize: '15px', color: TH.red, fontWeight: 700 }}>{rate} % falsch · {st.r + st.w} Antworten von {st.users} {st.users === 1 ? 'Person' : 'Personen'}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => startFix(id)} style={smallBtn('warn')}>✏️ Korrigieren</button>
                <button onClick={() => hideQuestion(String(id))} style={smallBtn('danger')}>Ausblenden</button>
              </div>
            </div>
          );
        })}
        {renderFixEditor()}
      </div>
    </div>
  );
}
