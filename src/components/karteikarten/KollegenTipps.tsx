// ═══ Karteikarten: Verkaufstipps von Kollegen im Steckbrief ═══
// Freigegebene Tipps sehen alle. Mitarbeiter können einen eigenen Tipp schicken,
// der Ausbilder gibt ihn im Ausbilder-Bereich frei (Reiter „Fragen & Tipps“).
import { useState } from 'react';
import { dc } from '../../daten/data';
import { TH } from '../../ui/basis';
import { TippEintrag, TIPP_MAX } from '../../hilfen/kollegen';

export function KollegenTipps({ produkt, tipps, meine, onTipp }: { produkt: string; tipps: TippEintrag[]; meine: TippEintrag[]; onTipp?: (produkt: string, text: string) => void }) {
  const [offen, setOffen] = useState(false);
  const [text, setText] = useState('');
  const freigegeben = tipps.filter((t) => t.p === produkt);
  const wartet = meine.some((t) => t.p === produkt && t.status === 'pending');
  if (!freigegeben.length && !onTipp) return null;
  const senden = () => {
    if (!onTipp || !text.trim()) return;
    onTipp(produkt, text);
    setText(''); setOffen(false);
  };
  return (
    <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.tintYellow, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>💡 Tipps von Kollegen</div>
      {freigegeben.length === 0 && <div style={{ fontSize: '16px', color: TH.muted }}>Noch kein Tipp. Wie verkaufst du {produkt}?</div>}
      {freigegeben.map((t) => (
        <div key={`${t.user}_${t.id}`} style={{ padding: '10px 12px', borderRadius: '12px', backgroundColor: dc('#FFFFFF'), fontSize: '17px', lineHeight: 1.45 }}>
          „{t.t}“ <span style={{ fontSize: '14px', color: TH.muted }}>· {t.name}</span>
        </div>
      ))}
      {onTipp && (wartet ? (
        <div style={{ fontSize: '15px', color: TH.muted }}>⏳ Dein Tipp wartet auf die Freigabe vom Ausbilder.</div>
      ) : offen ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, TIPP_MAX))} rows={3} autoFocus aria-label="Dein Verkaufstipp"
            placeholder={`z. B. Fragt jemand nach etwas Saftigem, empfehle ich ${produkt}, weil …`}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={senden} disabled={!text.trim()} style={{ minHeight: '48px', padding: '0 18px', borderRadius: '14px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '16px', fontWeight: 700, cursor: 'pointer', opacity: text.trim() ? 1 : 0.5 }}>Tipp schicken</button>
            <button type="button" onClick={() => setOffen(false)} style={{ minHeight: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: 'transparent', color: TH.ink, fontSize: '16px', cursor: 'pointer' }}>Abbrechen</button>
            <span style={{ fontSize: '13px', color: TH.muted }}>{text.length}/{TIPP_MAX}</span>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOffen(true)} style={{ alignSelf: 'flex-start', minHeight: '46px', padding: '0 16px', borderRadius: '14px', border: `2px dashed ${TH.brown}`, backgroundColor: 'transparent', color: TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>+ Eigenen Tipp geben</button>
      ))}
    </div>
  );
}
