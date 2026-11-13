// ═══ Pop-up: neue Nachricht vom Ausbilder (Pinnwand) ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { dc } from '../../daten/data';
import { SpeakButton } from '../../games/spielBasis';
import { LT } from '../../basis/marke';
import type { PinboardMessage } from '../../types';

export type AusbilderNachrichtProps = {
  activePinboard: PinboardMessage | null;
  markPinSeen: () => void;
};

export function AusbilderNachricht({ activePinboard, markPinSeen }: AusbilderNachrichtProps) {
  if (!activePinboard) return null; // wie die Bedingung in App.tsx
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Neue Nachricht vom Ausbilder" style={{ width: '100%', maxWidth: '460px', maxHeight: '92vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ backgroundColor: LT.yellow, padding: '22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span aria-hidden="true" style={{ fontSize: '30px', lineHeight: 1 }}>📣</span></span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Neu vom Ausbilder</div>
            <div style={{ fontSize: '16px' }}>{activePinboard.author} · {activePinboard.updatedAt}</div>
          </div>
        </div>
        <div style={{ padding: '24px 22px 22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activePinboard.image && <img src={activePinboard.image} alt="Foto vom Ausbilder" style={{ width: '100%', maxHeight: '40vh', objectFit: 'contain', borderRadius: '16px' }} />}
          <div style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.2, whiteSpace: 'pre-line', maxHeight: '50vh', overflowY: 'auto' }}>„{activePinboard.text}“</div>
          <div><SpeakButton small text={`Nachricht vom Ausbilder: ${activePinboard.text}`} /></div>
          <button onClick={markPinSeen} autoFocus style={{ minHeight: '60px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}>Gelesen, danke!</button>
        </div>
      </div>
    </div>
  );
}
