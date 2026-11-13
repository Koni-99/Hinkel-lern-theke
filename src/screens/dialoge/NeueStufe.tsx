// ═══ Pop-up: neue Stufe erreicht ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { dc } from '../../daten/data';
import { ConfettiOverlay } from '../../ui/basis';
import { LT } from '../../basis/marke';
import { LEVELS } from '../../basis/serie';

export type NeueStufeProps = {
  username: string;
  myTotalScore: number;
  myLevel: { next: { min: number; title: string; icon: string; }; pct: number; toNext: number; min: number; title: string; icon: string; no: number; };
  markLevelSeen: () => void;
};

export function NeueStufe({ username, myTotalScore, myLevel, markLevelSeen }: NeueStufeProps) {
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1300, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Neue Stufe erreicht" style={{ position: 'relative', width: '100%', maxWidth: '420px', backgroundColor: LT.cream, borderRadius: '28px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', textAlign: 'center' }}>
        <ConfettiOverlay active />
        <div style={{ backgroundColor: LT.yellow, padding: '26px 22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Neue Stufe erreicht</div>
          <div className="lt-levelup" style={{ width: '104px', height: '104px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '58px', boxShadow: '0 10px 24px -8px rgba(75,42,20,.45)' }}>{myLevel.icon}</div>
          <div style={{ fontFamily: LT.serif, fontSize: '34px', lineHeight: 1.05 }}>{myLevel.title}</div>
          <div style={{ fontSize: '17px' }}>Stufe {myLevel.no} von {LEVELS.length}</div>
        </div>
        <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '18px', color: LT.brown, lineHeight: 1.45 }}>
            Glückwunsch, {username}! Du hast {myTotalScore.toLocaleString('de-DE')} Punkte gesammelt.
            {myLevel.next ? ` Nächste Stufe: ${myLevel.next.icon} ${myLevel.next.title} ab ${myLevel.next.min.toLocaleString('de-DE')} Punkten.` : ' Das ist die höchste Stufe!'}
          </div>
          <button onClick={markLevelSeen} autoFocus style={{ minHeight: '60px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}>Weiter so!</button>
        </div>
      </div>
    </div>
  );
}
