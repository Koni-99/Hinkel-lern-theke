// Ausbilder → Auswertung: Was wird in der App wirklich genutzt? (nur Summen des Teams, keine Namen)
import { useState } from 'react';
import type { JSX } from 'react';
import { TH, cardStyle } from '../ui/basis';
import { teamNutzung, monatJetzt } from '../hilfen/nutzung';

interface Props {
  progress: Record<string, any> | undefined;
  sectionTitle: (title: string, sub?: string) => JSX.Element;
}

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const monatName = (m: string) => { const [j, mo] = m.split('-').map(Number); return `${MONATE[mo - 1]} ${j}`; };
const vormonat = (m: string) => { const [j, mo] = m.split('-').map(Number); return mo === 1 ? `${j - 1}-12` : `${j}-${String(mo - 1).padStart(2, '0')}`; };

export function AuswertungNutzung({ progress, sectionTitle }: Props) {
  const jetzt = monatJetzt();
  const [monat, setMonat] = useState(jetzt);
  const liste = teamNutzung(progress, monat);
  const max = Math.max(1, ...liste.map((x) => x.mal));
  const knopf = (m: string, text: string) => (
    <button type="button" onClick={() => setMonat(m)} aria-pressed={monat === m} style={{ minHeight: '40px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${monat === m ? TH.brown : TH.line}`, backgroundColor: monat === m ? TH.tintYellow : TH.white, color: TH.ink, fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>{text}</button>
  );
  return (
    <div className="lt-nutzung" style={{ ...cardStyle, marginBottom: '0' }}>
      <style>{'@media(max-width:520px){.lt-nutzung-zeile{grid-template-columns:1fr auto!important}.lt-nutzung-zeile>span:nth-child(2){grid-column:1/-1;grid-row:2}}'}</style>
      {sectionTitle('Was wird genutzt?', 'Wie oft das Team welche Seite oder welches Spiel geöffnet hat. Nur Summen, keine Namen. Hilft beim Entscheiden, was in der App bleiben soll.')}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0 14px' }}>
        {knopf(jetzt, 'Dieser Monat')}
        {knopf(vormonat(jetzt), monatName(vormonat(jetzt)))}
      </div>
      {liste.length === 0 ? (
        <p style={{ margin: 0, fontSize: '17px', color: TH.muted }}>Für {monatName(monat)} gibt es noch keine Zahlen. Die App zählt seit Version 212, die Zahlen kommen nach und nach dazu.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {liste.map((x) => (
            <div key={x.seite} className="lt-nutzung-zeile" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 190px) 1fr auto', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
              <span style={{ fontWeight: 700 }}>{x.name}</span>
              <span style={{ height: '12px', borderRadius: '999px', backgroundColor: TH.cream, overflow: 'hidden' }}><span style={{ display: 'block', width: `${Math.max(3, (x.mal / max) * 100)}%`, height: '100%', backgroundColor: TH.brown }} /></span>
              <span style={{ color: TH.muted, whiteSpace: 'nowrap' }}>{x.mal} mal · {x.personen} {x.personen === 1 ? 'Person' : 'Personen'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
