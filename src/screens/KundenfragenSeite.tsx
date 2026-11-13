// ═══ „Das hat ein Kunde gefragt“ ═══
// Mitarbeiter tragen Fragen ein, die sie an der Theke nicht beantworten konnten.
// Der Ausbilder antwortet im Ausbilder-Bereich, danach sehen alle Frage und Antwort.
import { useState, useEffect } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary, PageHead } from '../ui/basis';
import { CloudPayload } from '../types';
import { alleKundenfragen, kfrageStellen, kfragenGesehen, KFRAGE_MAX } from '../hilfen/kollegen';

export type KundenfragenSeiteProps = {
  cloudData: CloudPayload;
  username: string;
  isAdmin: boolean;
  mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void;
  setToast: (t: string) => void;
};

const datum = (ts: number) => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

export function KundenfragenSeite({ cloudData, username, isAdmin, mutateCloudData, setToast }: KundenfragenSeiteProps) {
  const [text, setText] = useState('');
  const [suche, setSuche] = useState('');
  const me = (username || '').toLowerCase();
  const alle = alleKundenfragen(cloudData.progress);
  const meine = alle.filter((f) => f.user === me);
  const beantwortet = alle.filter((f) => f.a);
  const q = suche.trim().toLowerCase();
  const gefiltert = q ? beantwortet.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)) : beantwortet;
  const neueAntworten = meine.filter((f) => f.a && !f.seen).length;

  // Antworten auf eigene Fragen gelten als gesehen, sobald die Seite offen ist
  useEffect(() => {
    if (!isAdmin && me && neueAntworten > 0) mutateCloudData(kfragenGesehen(me));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neueAntworten]);

  const senden = () => {
    if (!text.trim() || isAdmin || !me) return;
    mutateCloudData(kfrageStellen(me, username, text));
    setText('');
    setToast('🙋 Danke! Deine Frage ist beim Ausbilder. Sobald die Antwort da ist, steht sie hier.');
  };

  return (
    <div className="lt-themed" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: TH.ink, textAlign: 'left' }}>
      <PageHead title="Das hat ein Kunde gefragt" subtitle="Fragen von der Theke, die wir nicht sofort beantworten konnten, mit der Antwort vom Ausbilder." />

      {!isAdmin && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <strong style={{ fontSize: '19px' }}>Ein Kunde hat etwas gefragt, und du wusstest es nicht?</strong>
          <span style={{ fontSize: '16px', color: TH.muted }}>Schreib die Frage hier rein. Der Ausbilder antwortet, und beim nächsten Mal weißt du es (und alle anderen auch).</span>
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, KFRAGE_MAX))} rows={3} placeholder="z. B. Ist im Dinkelbrot auch Weizen drin?" aria-label="Frage des Kunden"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '14px', border: `2px solid ${TH.line}`, fontSize: '17px', fontFamily: 'inherit', resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={senden} disabled={!text.trim()} style={{ ...btnPrimary, opacity: text.trim() ? 1 : 0.5 }}>🙋 Frage an den Ausbilder schicken</button>
            <span style={{ fontSize: '14px', color: TH.muted }}>{text.length}/{KFRAGE_MAX}</span>
          </div>
        </div>
      )}

      {!isAdmin && meine.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong style={{ fontSize: '19px' }}>Deine Fragen ({meine.length})</strong>
          {meine.map((f) => (
            <div key={f.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: f.a ? TH.tintSage : TH.cream, fontSize: '16px', lineHeight: 1.45 }}>
              <div><strong>„{f.q}“</strong> <span style={{ color: TH.muted, fontSize: '14px' }}>· {datum(f.ts)}</span></div>
              {f.a ? <div style={{ marginTop: '6px' }}>💬 {f.a}</div> : <div style={{ marginTop: '6px', color: TH.muted }}>⏳ Wartet auf die Antwort vom Ausbilder</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '19px' }}>Fragen und Antworten ({beantwortet.length})</strong>
          {beantwortet.length > 3 && (
            <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Suchen …" aria-label="Fragen durchsuchen"
              style={{ minHeight: '44px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '16px', fontFamily: 'inherit' }} />
          )}
        </div>
        {gefiltert.length === 0 ? (
          <span style={{ fontSize: '16px', color: TH.muted }}>{beantwortet.length ? 'Nichts gefunden.' : 'Noch keine beantworteten Fragen. Die erste kann von dir kommen!'}</span>
        ) : gefiltert.map((f) => (
          <div key={`${f.user}_${f.id}`} style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: dc('#FFFBF2'), border: `2px solid ${TH.line}`, fontSize: '16px', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, fontSize: '17px' }}>🙋 {f.q}</div>
            <div style={{ marginTop: '6px' }}>💬 {f.a}</div>
            <div style={{ marginTop: '6px', fontSize: '14px', color: TH.muted }}>gefragt von {f.name} · {datum(f.ts)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
