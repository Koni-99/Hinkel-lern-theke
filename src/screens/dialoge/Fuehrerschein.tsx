// ═══ Pop-up: Theken-Führerschein ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { btnPrimary, ConfettiOverlay } from '../../ui/basis';
import { LT } from '../../basis/marke';

export type FuehrerscheinProps = {
  username: string;
  finishErsteWoche: () => void;
};

export function Fuehrerschein({ username, finishErsteWoche }: FuehrerscheinProps) {
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1350, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Theken-Führerschein" style={{ position: 'relative', overflow: 'hidden', width: '100%', maxWidth: '460px', maxHeight: '92vh', overflowY: 'auto', padding: '28px 24px', borderRadius: '28px', backgroundColor: LT.yellow, border: `3px dashed ${LT.brown}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <ConfettiOverlay active />
        <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Bäckerei Hinkel</div>
        <div style={{ fontFamily: LT.serif, fontSize: '38px', lineHeight: 1.05 }}>Theken-Führerschein</div>
        <div style={{ fontSize: '19px' }}>für <strong>{username}</strong></div>
        <div style={{ fontSize: '16px' }}>hat die erste Woche geschafft: Brote, Beratung und Allergien sitzen. Herzlich willkommen im Team der Brotfreunde!</div>
        <div style={{ fontSize: '15px', marginTop: '4px' }}>{new Date().toLocaleDateString('de-DE')}</div>
        <button onClick={finishErsteWoche} autoFocus style={{ ...btnPrimary, marginTop: '8px' }}>Danke! 🎉</button>
      </div>
    </div>
  );
}
