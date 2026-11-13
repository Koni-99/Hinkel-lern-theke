// ═══ Karteikarten: eigene Notiz im Steckbrief (sieht nur man selbst) ═══
import { useState } from 'react';
import { dc } from '../../daten/data';
import { TH } from '../../ui/basis';
import { NOTIZ_MAX } from '../../hilfen/team';

export function MeineNotiz({ produkt, notiz, onNotiz }: { produkt: string; notiz: string; onNotiz: (produkt: string, text: string) => void }) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [text, setText] = useState(notiz);
  const speichern = () => { onNotiz(produkt, text); setBearbeiten(false); };
  return (
    <div style={{ padding: '16px', borderRadius: '18px', border: `2px dashed ${TH.line}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Meine Notiz <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: TH.muted }}>· sieht nur du</span></div>
      {bearbeiten ? (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, NOTIZ_MAX))} rows={3} autoFocus aria-label="Meine Notiz" placeholder="z. B. Kürbiskern = grüne Tüte, wird oft mit Sonnenblume verwechselt"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={speichern} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '14px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Speichern</button>
            <button type="button" onClick={() => { setText(notiz); setBearbeiten(false); }} style={{ minHeight: '46px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: 'transparent', color: TH.ink, fontSize: '16px', cursor: 'pointer' }}>Abbrechen</button>
            <span style={{ fontSize: '13px', color: TH.muted }}>{text.length}/{NOTIZ_MAX}</span>
          </div>
        </>
      ) : notiz ? (
        <>
          <div style={{ fontSize: '17px', lineHeight: 1.45, whiteSpace: 'pre-line' }}>{notiz}</div>
          <button type="button" onClick={() => { setText(notiz); setBearbeiten(true); }} style={{ alignSelf: 'flex-start', minHeight: '40px', padding: '0 12px', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: TH.muted, fontSize: '15px', textDecoration: 'underline', cursor: 'pointer' }}>Notiz ändern</button>
        </>
      ) : (
        <button type="button" onClick={() => { setText(''); setBearbeiten(true); }} style={{ alignSelf: 'flex-start', minHeight: '46px', padding: '0 16px', borderRadius: '14px', border: `2px dashed ${TH.brown}`, backgroundColor: 'transparent', color: TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>+ Notiz schreiben</button>
      )}
    </div>
  );
}
