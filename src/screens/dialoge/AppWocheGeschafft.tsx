// ═══ Pop-up: App-Woche geschafft ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { TH, btnPrimary, ConfettiOverlay } from '../../ui/basis';
import { LtIcon, ICON } from '../../basis/symbole';
import { LT } from '../../basis/marke';

export type AppWocheGeschafftProps = {
  username: string;
  finishAppWeek: () => void;
};

export function AppWocheGeschafft({ username, finishAppWeek }: AppWocheGeschafftProps) {
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1350, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Erste Woche mit der App geschafft" style={{ position: 'relative', overflow: 'hidden', width: '100%', maxWidth: '440px', padding: '28px 24px', borderRadius: '28px', backgroundColor: LT.cream, border: `3px solid ${TH.green}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <ConfettiOverlay active />
        <div aria-hidden="true" style={{ color: LT.brown }}><LtIcon paths={ICON.sparkle} size={54} width={1.6} /></div>
        <div style={{ fontFamily: LT.serif, fontSize: '32px', lineHeight: 1.1 }}>Du kennst jetzt die App!</div>
        <div style={{ fontSize: '17px', color: LT.brown }}>Alle Schritte von „Meine erste Woche mit der App“ sind erledigt, {username}. Die Liste verschwindet jetzt von der Startseite. Viel Spaß beim Weiterlernen!</div>
        <button onClick={finishAppWeek} autoFocus style={{ ...btnPrimary, marginTop: '8px' }}>Super, weiter geht’s</button>
      </div>
    </div>
  );
}
