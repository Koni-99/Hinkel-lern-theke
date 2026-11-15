// ═══ Pop-up „Aussehen“ (Menü, Version 187) ═══
// Pro Gerät wählbar: Design hell (Standard) oder „Backstube bei Nacht“ (dunkel, von Claude Fable)
// und der Kopf der Seite: Markise mit Wetter (Standard), Markise mit goldenen Ähren, oder dunkle Bühne mit Ähren.
// Das Design braucht einen Neustart der Seite (alle Farben werden beim Zeichnen umgerechnet), der Kopf wechselt sofort.
import { dc } from '../../daten/data';
import { LT } from '../../basis/marke';
import { LtIcon, ICON } from '../../basis/symbole';
import { NACHT, designSetzen, type Kopf } from '../../thema/modus';

export type AussehenProps = { kopf: Kopf; setKopf: (k: Kopf) => void; schliessen: () => void };

function Wahl({ an, titel, text, vorschau, onClick }: { an: boolean; titel: string; text: string; vorschau: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={an} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', minHeight: '76px', padding: '10px 14px', borderRadius: '18px', border: `3px solid ${an ? LT.brown : LT.line}`, backgroundColor: an ? dc('#FFF4D6') : dc('#FFFFFF'), color: LT.ink, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
      <span aria-hidden="true" style={{ flex: '0 0 64px', height: '48px', borderRadius: '12px', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }}>{vorschau}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', fontSize: '17px' }}>{titel}</strong>
        <span style={{ display: 'block', fontSize: '15px', color: LT.muted, lineHeight: 1.35 }}>{text}</span>
      </span>
      {an && <span aria-hidden="true" style={{ color: LT.brown, display: 'inline-flex' }}><LtIcon paths={ICON.checklist} size={22} /></span>}
    </button>
  );
}

// Vorschau-Farben als Klassen: so bleiben sie auch im dunklen Design echt (Inline-Farben würden umgerechnet)
const VORSCHAU_CSS = `.lt-vs{display:block;width:100%;height:100%;position:relative}.lt-vs-hell{background:linear-gradient(180deg,#FFC72C 0 40%,#FAF6F0 40%)}.lt-vs-nacht{background:linear-gradient(180deg,#0C0906 0 40%,#1E1812 40%)}.lt-vs-gelb{background:#FFC72C}.lt-vs-buehne{background:radial-gradient(70% 150% at 50% 125%,rgba(234,179,8,.5),#0C0906 70%)}`;
const fl = (art: string, extra?: React.ReactNode) => <span className={`lt-vs lt-vs-${art}`}>{extra}</span>;
const aehren = (farbe: string) => (
  <svg viewBox="0 0 64 48" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {[12, 32, 52].map((x, i) => <g key={x} stroke={farbe} strokeWidth="2" fill={farbe} strokeLinecap="round"><path d={`M${x} 48V${22 + i % 2 * 4}`} fill="none" /><ellipse cx={x - 3} cy={30 + i % 2 * 4} rx="2.4" ry="4.5" transform={`rotate(-24 ${x - 3} ${30 + i % 2 * 4})`} /><ellipse cx={x + 3} cy={26 + i % 2 * 4} rx="2.4" ry="4.5" transform={`rotate(24 ${x + 3} ${26 + i % 2 * 4})`} /></g>)}
  </svg>
);

export function Aussehen({ kopf, setKopf, schliessen }: AussehenProps) {
  const ueber = (t: string) => <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: LT.muted, marginTop: '4px' }}>{t}</div>;
  return (
    <div className="lt-overlay" onClick={schliessen} style={{ position: 'fixed', inset: 0, zIndex: 125, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog lt-aussehen" role="dialog" aria-modal="true" aria-label="Aussehen" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <style>{VORSCHAU_CSS}</style>
        <div style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1 }}>Aussehen</div>
        <div style={{ fontSize: '16px', color: LT.muted }}>Gilt nur auf diesem Gerät. Punkte und Fortschritt bleiben gleich.</div>
        {ueber('Farben')}
        <Wahl an={!NACHT} titel="Hell" text="Das gewohnte Aussehen (Standard)." vorschau={fl('hell')} onClick={() => { if (NACHT) designSetzen('hell'); }} />
        <Wahl an={NACHT} titel="Backstube bei Nacht" text="Dunkel mit Gold. Die Seite lädt kurz neu." vorschau={fl('nacht')} onClick={() => { if (!NACHT) designSetzen('nacht'); }} />
        {ueber('Kopf der Seite')}
        <Wahl an={kopf === 'markise'} titel="Markise" text="Gelbe Markise, zeigt auf Wunsch das Wetter." vorschau={fl('gelb')} onClick={() => setKopf('markise')} />
        <Wahl an={kopf === 'mitaehren'} titel="Markise mit Ähren" text="Markise und Wetter, dazu goldene Ähren." vorschau={fl('gelb', aehren('#A8741A'))} onClick={() => setKopf('mitaehren')} />
        <Wahl an={kopf === 'aehren'} titel="Goldene Ähren" text="Dunkle Bühne mit leuchtenden Ähren." vorschau={fl('buehne', aehren('#EAB308'))} onClick={() => setKopf('aehren')} />
        <button onClick={schliessen} style={{ marginTop: '6px', minHeight: '54px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '18px', fontWeight: 800, cursor: 'pointer' }}>Fertig</button>
      </div>
    </div>
  );
}
