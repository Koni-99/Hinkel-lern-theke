// ═══ Pop-up: Stempelkarte voll ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { PrizeBag, TH, ConfettiOverlay } from '../../ui/basis';
import { LT } from '../../basis/marke';

export type StempelkarteVollProps = {
  username: string;
  claimStampCard: () => void;
  stampPrize: { icon: string; text: string; } | null;
  setStampPrize: Dispatch<SetStateAction<{ icon: string; text: string; } | null>>;
};

export function StempelkarteVoll({ username, claimStampCard, stampPrize, setStampPrize }: StempelkarteVollProps) {
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1300, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Stempelkarte voll" style={{ position: 'relative', overflow: 'hidden', width: '100%', maxWidth: '420px', padding: '28px 24px', borderRadius: '28px', backgroundColor: LT.cream, border: '3px dashed #C9971C', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
        <ConfettiOverlay active />
        {!stampPrize ? (
          <>
            <span className="lt-emo-bob" style={{ fontSize: '64px', lineHeight: 1 }} aria-hidden="true">🎟️</span>
            <div style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.1 }}>Stempelkarte voll!</div>
            <div style={{ fontSize: '18px', color: LT.brown }}>10 Lerntage geschafft, {username}. Dafür bekommst du:</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontWeight: 800, fontSize: '18px' }}>+500 Punkte</span>
              <span style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: dc('#FFF0C2'), color: LT.brown, fontWeight: 800, fontSize: '18px' }}>🪙 3,00 €</span>
            </div>
            <button onClick={claimStampCard} autoFocus style={{ width: '100%', minHeight: '58px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '19px', fontWeight: 700, cursor: 'pointer' }}>Einlösen</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: LT.brown }}>Moment, da ist noch was …</div>
            <PrizeBag icon={stampPrize.icon} />
            <div className="lt-pb-text" style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.15 }}>Überraschung: {stampPrize.text}</div>
            <div style={{ fontSize: '16px', color: LT.muted }}>Die neue Stempelkarte liegt schon bereit.</div>
            <button onClick={() => setStampPrize(null)} autoFocus style={{ width: '100%', minHeight: '58px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '19px', fontWeight: 700, cursor: 'pointer' }}>Super, danke!</button>
          </>
        )}
      </div>
    </div>
  );
}
