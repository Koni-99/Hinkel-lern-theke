// ═══ Startseite: „Lob der Woche“ unter Kollegen ═══
// Zeigt die Lobe der letzten 7 Tage. Jeder kann einmal am Tag einen Kollegen loben (+10 Punkte für den Gelobten).
import { useState } from 'react';
import { dc } from '../daten/data';
import { LT } from '../basis/marke';
import { LtIcon, ICON } from '../basis/symbole';
import { CloudPayload } from '../types';
import { alleLobs, heuteSchonGelobt, lobSchicken, LOB_MAX, LOB_PUNKTE } from '../hilfen/team';

export function LobKarte({ cloudData, username, kollegen, mutateCloudData, setToast }: {
  cloudData: CloudPayload; username: string; kollegen: { key: string; name: string }[];
  mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void; setToast: (t: string) => void;
}) {
  const me = (username || '').toLowerCase();
  const [offen, setOffen] = useState(false);
  const [an, setAn] = useState('');
  const [text, setText] = useState('');
  const woche = Date.now() - 7 * 86400000;
  const lobs = alleLobs(cloudData.progress).filter((l) => l.ts >= woche);
  const schonHeute = heuteSchonGelobt(cloudData.progress, me);
  const andere = kollegen.filter((k) => k.key !== me);
  if (!me) return null;
  const senden = () => {
    const ziel = andere.find((k) => k.key === an);
    if (!ziel || !text.trim()) return;
    mutateCloudData(lobSchicken(me, username, ziel.key, ziel.name, text));
    setToast(`Dein Lob an ${ziel.name} ist verschickt. ${ziel.name} bekommt ${LOB_PUNKTE} Punkte.`);
    setText(''); setAn(''); setOffen(false);
  };
  const feld = { width: '100%', boxSizing: 'border-box' as const, minHeight: '50px', padding: '10px 14px', borderRadius: '14px', border: `2px solid ${LT.line}`, fontSize: '17px', fontFamily: 'inherit', backgroundColor: dc('#FFFFFF'), color: LT.ink };
  return (
    <section aria-label="Lob der Woche" style={{ padding: '22px', borderRadius: '24px', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', display: 'flex', flexDirection: 'column', gap: '12px', color: LT.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span aria-hidden="true" style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><LtIcon paths={ICON.sparkle} size={24} width={1.9} /></span>
        <span style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1 }}>Lob der Woche</span>
      </div>
      {lobs.length === 0 ? (
        <span style={{ fontSize: '17px', color: LT.muted }}>Diese Woche noch kein Lob. Wer hat dir geholfen? Sag Danke!</span>
      ) : lobs.slice(0, 6).map((l) => (
        <div key={`${l.von}_${l.id}`} style={{ padding: '12px 14px', borderRadius: '16px', backgroundColor: LT.cream, fontSize: '17px', lineHeight: 1.45 }}>
          <strong>{l.vonName}</strong> an <strong>{l.anName}</strong>: „{l.t}“
        </div>
      ))}
      {lobs.length > 6 && <span style={{ fontSize: '15px', color: LT.muted }}>… und {lobs.length - 6} weitere diese Woche</span>}
      {schonHeute ? (
        <span style={{ fontSize: '15px', color: LT.muted }}>Du hast heute schon jemanden gelobt. Morgen wieder!</span>
      ) : andere.length === 0 ? null : offen ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select value={an} onChange={(e) => setAn(e.target.value)} aria-label="Wen möchtest du loben?" style={feld}>
            <option value="">Wen möchtest du loben?</option>
            {andere.map((k) => <option key={k.key} value={k.key}>{k.name}</option>)}
          </select>
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, LOB_MAX))} rows={2} placeholder="z. B. Danke, dass du heute für mich eingesprungen bist!" aria-label="Dein Lob" style={{ ...feld, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={senden} disabled={!an || !text.trim()} style={{ minHeight: '50px', padding: '0 20px', borderRadius: '14px', border: 'none', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '17px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: an && text.trim() ? 1 : 0.5 }}>Lob verschicken</button>
            <button type="button" onClick={() => setOffen(false)} style={{ minHeight: '50px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${LT.line}`, backgroundColor: 'transparent', color: LT.ink, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}>Abbrechen</button>
            <span style={{ fontSize: '14px', color: LT.muted }}>{text.length}/{LOB_MAX} · einmal am Tag</span>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOffen(true)} style={{ alignSelf: 'flex-start', minHeight: '50px', padding: '0 20px', borderRadius: '14px', border: 'none', backgroundColor: LT.yellow, color: LT.ink, fontSize: '17px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kollegen loben</button>
      )}
    </section>
  );
}
