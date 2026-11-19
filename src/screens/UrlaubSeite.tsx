// ═══ Version 251: Urlaubsmodus (Menü → Urlaub) ═══
// Freiwillig: Wer Urlaub einträgt, verliert in der Zeit seine Lern-Serie nicht, es wird kein Serien-Schutz verbraucht
// und Teigi wird nicht schlapp. Höchstens 6 Wochen pro Jahr. Gespeichert nur im eigenen Fortschritt (_urlaub).
import { useState } from 'react';
import { TH, cardStyle, btnPrimary, PageHead } from '../ui/basis';
import { CloudPayload } from '../types';
import { urlaubeVon, urlaubHeute, urlaubImJahr, urlaubPruefen, urlaubEintragen, urlaubBeenden, URLAUB_MAX_TAGE } from '../hilfen/urlaub';

const dk = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const schoen = (k: string) => { const [y, m, d] = k.split('-'); return `${Number(d)}.${Number(m)}.${y}`; };

export function UrlaubSeite({ cloudData, username, mutateCloudData, setToast }: {
  cloudData: CloudPayload; username: string; mutateCloudData: (u: (c: CloudPayload) => CloudPayload) => void; setToast: (t: string) => void;
}) {
  const me = (username || '').toLowerCase();
  const pr: any = (cloudData.progress || {})[me] || {};
  const heute = dk(new Date());
  const jahr = new Date().getFullYear();
  const [von, setVon] = useState(heute);
  const [bis, setBis] = useState('');
  const [fehler, setFehler] = useState('');
  const jetzt = urlaubHeute(pr);
  const liste = urlaubeVon(pr).filter((u) => u.bis >= heute);
  const frei = Math.max(0, URLAUB_MAX_TAGE - urlaubImJahr(pr, jahr));
  const feld = { minHeight: '50px', padding: '0 12px', borderRadius: '14px', border: `2px solid ${TH.line}`, fontSize: '17px', backgroundColor: TH.white, color: TH.ink, fontFamily: 'inherit' };

  const eintragen = () => {
    const f = urlaubPruefen(pr, von, bis);
    if (f) { setFehler(f); return; }
    mutateCloudData((curr) => { const p = curr.progress[me] || (curr.progress[me] = { _displayName: username }); urlaubEintragen(p, von, bis); return curr; });
    setFehler(''); setBis('');
    setToast(`Urlaub eingetragen: ${schoen(von)} bis ${schoen(bis)}. Schöne Zeit!`);
  };
  const zurueck = () => {
    mutateCloudData((curr) => { const p = curr.progress[me]; if (p) urlaubBeenden(p); return curr; });
    setToast('Willkommen zurück! Der Urlaub ist beendet.');
  };

  return (
    <div className="lt-themed lt-urlaub" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: TH.ink, textAlign: 'left' }}>
      <PageHead title="Urlaub" subtitle="Trag deinen Urlaub ein. Dann pausieren deine Lern-Serie und Teigi, und du verlierst nichts." />
      {jetzt && (
        <div className="lt-urlaub-jetzt" style={{ ...cardStyle, backgroundColor: TH.tintSage, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong style={{ fontSize: '20px' }}>Du bist im Urlaub bis {schoen(jetzt.bis)}.</strong>
          <span style={{ fontSize: '16px' }}>Deine Serie und Teigi warten auf dich. Lernen darfst du natürlich trotzdem.</span>
          <button type="button" onClick={zurueck} style={{ ...btnPrimary, alignSelf: 'flex-start' }}>Ich bin schon zurück</button>
        </div>
      )}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <strong style={{ fontSize: '19px' }}>Urlaub eintragen</strong>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 700, fontSize: '15px', flex: '1 1 150px' }}>Erster Urlaubstag
            <input type="date" value={von} min={heute} onChange={(e) => { setVon(e.target.value); setFehler(''); }} aria-label="Erster Urlaubstag" style={feld} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 700, fontSize: '15px', flex: '1 1 150px' }}>Letzter Urlaubstag
            <input type="date" value={bis} min={von || heute} onChange={(e) => { setBis(e.target.value); setFehler(''); }} aria-label="Letzter Urlaubstag" style={feld} />
          </label>
        </div>
        {fehler && <div role="alert" style={{ color: TH.red, fontWeight: 700, fontSize: '16px' }}>{fehler}</div>}
        <button type="button" onClick={eintragen} disabled={!von || !bis} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: von && bis ? 1 : 0.5 }}>Urlaub eintragen</button>
        <span style={{ fontSize: '15px', color: TH.muted }}>Höchstens 6 Wochen im Jahr. {jahr} sind noch {frei} {frei === 1 ? 'Tag' : 'Tage'} frei.</span>
      </div>
      {liste.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <strong style={{ fontSize: '19px' }}>Eingetragen</strong>
          {liste.map((u) => <div key={u.von} style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: TH.cream, fontSize: '17px' }}>{schoen(u.von)} bis {schoen(u.bis)}{u.von > heute ? ' · kommt noch' : ' · gerade'}</div>)}
          {!jetzt && <button type="button" onClick={zurueck} style={{ alignSelf: 'flex-start', minHeight: '46px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Kommenden Urlaub löschen</button>}
        </div>
      )}
    </div>
  );
}
