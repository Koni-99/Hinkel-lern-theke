// ═══ Ausbilder-Bereich: Team-Umfragen anlegen und auswerten (im Reiter Nachricht) ═══
import { useState, CSSProperties } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary } from '../ui/basis';
import { CloudPayload } from '../types';
import { alleUmfragen, stimmen, umfrageStarten, umfrageBeenden, umfrageLoeschen } from '../hilfen/team';

const feld: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: '48px', padding: '10px 14px', borderRadius: '14px', border: `2px solid ${TH.line}`, fontSize: '17px', fontFamily: 'inherit' };
const klein = (tone: 'plain' | 'danger' = 'plain'): CSSProperties => ({ minHeight: '44px', padding: '0 14px', borderRadius: '12px', border: tone === 'plain' ? `2px solid ${TH.line}` : 'none', backgroundColor: tone === 'danger' ? dc('#FCE1D2') : TH.white, color: tone === 'danger' ? TH.red : TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' });

export function UmfragenVerwaltung({ cloudData, mutateCloudData }: { cloudData: CloudPayload; mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void }) {
  const [frage, setFrage] = useState('');
  const [optionen, setOptionen] = useState<string[]>(['', '']);
  const [anonym, setAnonym] = useState(true);
  const umfragen = alleUmfragen(cloudData.progress);
  const gueltig = frage.trim() && optionen.filter((o) => o.trim()).length >= 2;
  const starten = () => {
    if (!gueltig) return;
    mutateCloudData(umfrageStarten(frage, optionen, anonym));
    setFrage(''); setOptionen(['', '']); setAnonym(true);
  };
  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '30px', lineHeight: 1.1 }}>Team-Umfrage</h2>
        <div style={{ fontSize: '17px', color: TH.muted, marginTop: '4px' }}>Eine kurze Frage an alle, mit Antworten zum Antippen. Erscheint auf der Startseite.</div>
      </div>
      <input value={frage} onChange={(e) => setFrage(e.target.value.slice(0, 200))} placeholder="z. B. Welche neue Sorte sollen wir testen?" aria-label="Frage der Umfrage" style={feld} />
      {optionen.map((o, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px' }}>
          <input value={o} onChange={(e) => setOptionen(optionen.map((x, j) => (j === i ? e.target.value.slice(0, 80) : x)))} placeholder={`Antwort ${i + 1}`} aria-label={`Antwort ${i + 1}`} style={feld} />
          {optionen.length > 2 && <button type="button" onClick={() => setOptionen(optionen.filter((_, j) => j !== i))} aria-label={`Antwort ${i + 1} entfernen`} style={klein()}>✕</button>}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {optionen.length < 5 && <button type="button" onClick={() => setOptionen([...optionen, ''])} style={klein()}>+ Weitere Antwort</button>}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700 }}>
          <input type="checkbox" checked={anonym} onChange={(e) => setAnonym(e.target.checked)} style={{ width: '22px', height: '22px', accentColor: TH.brown }} />
          Anonym (du siehst nur, wie viele was gewählt haben)
        </label>
      </div>
      <button type="button" onClick={starten} disabled={!gueltig} style={{ ...btnPrimary, opacity: gueltig ? 1 : 0.5, alignSelf: 'flex-start' }}>Umfrage starten</button>

      {umfragen.map((u) => {
        const st = stimmen(cloudData.progress, u);
        return (
          <div key={u.id} style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: u.offen ? TH.tintYellow : TH.cream, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '16px' }}>
            <div><strong style={{ fontSize: '18px' }}>{u.frage}</strong> <span style={{ color: TH.muted, fontSize: '14px' }}>· {u.offen ? 'läuft' : 'beendet'}{u.anonym ? ', anonym' : ''} · {new Date(u.ts).toLocaleDateString('de-DE')} · {st.gesamt} {st.gesamt === 1 ? 'Stimme' : 'Stimmen'}</span></div>
            {u.optionen.map((o, i) => {
              const pct = st.gesamt ? Math.round((st.anzahl[i] / st.gesamt) * 100) : 0;
              const namen = u.anonym ? '' : st.wer.filter((w) => w.wahl === i).map((w) => w.name).join(', ');
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span>{o}</span><strong>{st.anzahl[i]} ({pct} %)</strong></div>
                  <div style={{ height: '10px', borderRadius: '999px', backgroundColor: dc('#FFFFFF'), overflow: 'hidden', marginTop: '4px' }}><div style={{ width: `${pct}%`, height: '100%', backgroundColor: TH.brown }} /></div>
                  {namen && <div style={{ fontSize: '14px', color: TH.muted, marginTop: '2px' }}>{namen}</div>}
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => mutateCloudData(umfrageBeenden(u.id, !u.offen))} style={klein()}>{u.offen ? 'Umfrage beenden' : 'Wieder öffnen'}</button>
              <button type="button" onClick={() => { if (confirm('Umfrage löschen?')) mutateCloudData(umfrageLoeschen(u.id)); }} style={klein('danger')}>Löschen</button>
            </div>
          </div>
        );
      })}
      {umfragen.some((u) => u.anonym) && <span style={{ fontSize: '14px', color: TH.muted }}>Hinweis: „Anonym“ heißt, die App zeigt keine Namen an. Technisch ist die Stimme beim Mitarbeiter gespeichert.</span>}
    </div>
  );
}
