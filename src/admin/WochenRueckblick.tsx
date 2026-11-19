// ═══ Version 260: Wochen-Rückblick (letzte Woche auf einen Blick) ═══
// Oben im Ausbilder-Bereich ab Montag, bis „Gelesen“ getippt wird (Merker im Gerät). In der Auswertung immer.
import { useState } from 'react';
import { TH, cardStyle, btnPrimary } from '../ui/basis';
import { LtIcon, ICON } from '../basis/symbole';
import { wochenRueckblick, rueckblickText, fleissText } from '../hilfen/teamStart';

const GELESEN = 'lt_rueckblick_gelesen';
const kurz = (t: string) => t.split('-').reverse().slice(0, 2).join('.') + '.';

export function WochenRueckblick({ progress, scores, keys, nameOf, oben }: { progress: Record<string, any>; scores: any[]; keys: string[]; nameOf: (k: string) => string; oben?: boolean }) {
  const r = wochenRueckblick(progress || {}, scores || [], keys);
  const [gelesen, setGelesen] = useState<string>(() => { try { return localStorage.getItem(GELESEN) || ''; } catch { return ''; } });
  if (oben && (gelesen === r.woche || keys.length === 0)) return null;
  const fertig = () => { try { localStorage.setItem(GELESEN, r.woche); } catch { /* egal */ } setGelesen(r.woche); };
  const kopieren = async () => {
    const txt = rueckblickText(r, nameOf, keys.length);
    try { await navigator.clipboard.writeText(txt); alert('Rückblick kopiert, z. B. für WhatsApp oder die Teambesprechung.'); } catch { window.prompt('Rückblick zum Kopieren:', txt); }
  };
  const zeile = (titel: string, inhalt: string) => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '17px' }}><strong style={{ minWidth: '150px' }}>{titel}</strong><span style={{ flex: '1 1 200px' }}>{inhalt}</span></div>
  );
  return (
    <section className="lt-wochen-rueckblick" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px', border: `2px solid ${TH.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span aria-hidden="true" style={{ display: 'inline-flex', color: TH.brown }}><LtIcon paths={ICON.calendar} size={26} /></span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.1 }}>Rückblick auf letzte Woche</span>
          <span style={{ display: 'block', fontSize: '17px', color: TH.muted }}>{kurz(r.von)} bis {kurz(r.bis)}</span>
        </span>
      </div>
      <div style={{ fontSize: '19px', fontWeight: 700 }}>{r.gelernt.length} von {keys.length} haben gelernt, zusammen {r.punkte.toLocaleString('de-DE')} Punkte an {r.lerntage} Lerntagen.</div>
      {r.top.length > 0 && zeile('Am fleißigsten', r.top.map((t) => `${nameOf(t.key)} (${fleissText(t)})`).join(', '))}
      {r.neu.length > 0 && zeile('Neu dabei', r.neu.map(nameOf).join(', '))}
      {zeile('Nicht gelernt', r.nicht.length ? r.nicht.map(nameOf).join(', ') : 'alle waren dabei')}
      {r.urlaub.length > 0 && zeile('Im Urlaub', r.urlaub.map(nameOf).join(', '))}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button type="button" onClick={kopieren} style={{ ...btnPrimary, minHeight: '48px', fontSize: '16px' }}>Rückblick kopieren</button>
        {oben && <button type="button" className="lt-rueckblick-gelesen" onClick={fertig} style={{ minHeight: '48px', padding: '0 18px', borderRadius: '14px', border: `2px solid ${TH.line}`, background: 'transparent', color: TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Gelesen</button>}
      </div>
    </section>
  );
}
