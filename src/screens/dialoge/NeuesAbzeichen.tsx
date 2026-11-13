// ═══ Pop-up: neues Abzeichen ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { dc } from '../../daten/data';
import { LT } from '../../basis/marke';
import type { Badge } from '../../ui/lernstand';

export type NeuesAbzeichenProps = {
  username: string;
  newBadges: Badge[];
  markBadgesSeen: () => void;
};

export function NeuesAbzeichen({ username, newBadges, markBadgesSeen }: NeuesAbzeichenProps) {
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1300, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Neues Abzeichen" style={{ width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', overflow: 'visible', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', textAlign: 'center' }}>
        <div style={{ backgroundColor: LT.yellow, padding: '22px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{newBadges.length === 1 ? 'Neues Abzeichen' : `${newBadges.length} neue Abzeichen`}</div>
          <div style={{ fontFamily: LT.serif, fontSize: '32px', lineHeight: 1.1, marginTop: '4px' }}>Glückwunsch, {username}!</div>
        </div>
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {newBadges.slice(0, 6).map((b, bi) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '18px', backgroundColor: dc('#FFFFFF'), border: `3px solid ${LT.yellow}`, textAlign: 'left', position: 'relative', zIndex: 6 - bi }}>
              <span className="lt-badge-spin" style={{ fontSize: '40px', lineHeight: 1, animationDelay: `${bi * 0.5}s` }}>{b.icon}</span>
              <span><span style={{ display: 'block', fontSize: '19px', fontWeight: 700 }}>{b.title}</span><span style={{ display: 'block', fontSize: '15px', color: LT.muted }}>{b.desc}</span></span>
            </div>
          ))}
          {newBadges.length > 6 && <div style={{ fontSize: '16px', color: LT.muted }}>… und {newBadges.length - 6} weitere</div>}
          <button onClick={markBadgesSeen} autoFocus style={{ minHeight: '60px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}>Super, danke!</button>
        </div>
      </div>
    </div>
  );
}
