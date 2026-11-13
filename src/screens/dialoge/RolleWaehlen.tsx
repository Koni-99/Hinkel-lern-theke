// ═══ Pop-up: Rolle wählen (neu, erfahren, Azubi) ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { dc } from '../../daten/data';
import { ROLE_INFO, StaffRole } from '../../ui/lernstand';
import { LT } from '../../basis/marke';

export type RolleWaehlenProps = {
  username: string;
  setMyRole: (r: StaffRole) => void;
};

export function RolleWaehlen({ username, setMyRole }: RolleWaehlenProps) {
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1400, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Wer bist du?" style={{ width: '100%', maxWidth: '480px', maxHeight: '92vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ backgroundColor: LT.yellow, padding: '22px' }}>
          <div style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.1 }}>Willkommen, {username}!</div>
          <div style={{ fontSize: '17px', marginTop: '4px' }}>Damit die App gut zu dir passt: Was trifft auf dich zu?</div>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(['neu', 'erfahren', 'azubi'] as StaffRole[]).map(r => (
            <button key={r} onClick={() => setMyRole(r)} className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '20px', border: `2px solid ${LT.line}`, backgroundColor: dc('#FFFFFF'), cursor: 'pointer', textAlign: 'left', color: LT.ink }}>
              <span style={{ fontSize: '36px' }} aria-hidden="true">{ROLE_INFO[r].icon}</span>
              <span>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: 700 }}>{ROLE_INFO[r].title}</span>
                <span style={{ display: 'block', fontSize: '16px', color: LT.muted }}>{ROLE_INFO[r].desc}</span>
              </span>
            </button>
          ))}
          <div style={{ fontSize: '14px', color: LT.muted }}>Das kannst du später beim Ausbilder ändern lassen.</div>
        </div>
      </div>
    </div>
  );
}
