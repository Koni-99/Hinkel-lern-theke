// ═══ Anleitung: App auf den Startbildschirm ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { LT } from '../../basis/marke';
import { LtIcon, ICON } from '../../basis/symbole';

export type InstallHilfeProps = {
  setShowInstallHelp: Dispatch<SetStateAction<boolean>>;
  hideInstall: () => void;
  canInstallDirect: boolean;
  isAppleDevice: boolean;
  installDirect: () => Promise<void>;
};

export function InstallHilfe({ setShowInstallHelp, hideInstall, canInstallDirect, isAppleDevice, installDirect }: InstallHilfeProps) {
  return (
    <div className="lt-overlay" onClick={() => setShowInstallHelp(false)} style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="App auf den Startbildschirm legen" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ backgroundColor: LT.yellow, padding: '22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span aria-hidden="true" style={{ display: 'inline-flex', lineHeight: 1 }}><LtIcon paths={ICON.phone} size={30} /></span></span>
          <div>
            <div style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1 }}>Hinkel-App aufs Handy</div>
            <div style={{ fontSize: '16px' }}>Dann startet sie wie eine echte App mit einem Fingertipp.</div>
          </div>
        </div>
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '18px', lineHeight: 1.45 }}>
          <button onClick={hideInstall} style={{ minHeight: '50px', borderRadius: '14px', border: `2px solid ${LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.brown, fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>✓ Schon erledigt, Knopf oben ausblenden</button>
          {canInstallDirect && (
            <button onClick={installDirect} style={{ minHeight: '60px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}>Jetzt installieren</button>
          )}
          {[
            {
              key: 'apple', title: 'iPhone & iPad (Safari)', steps: [
                { icon: ICON.share, text: 'Unten (am iPad oben) auf „Teilen“ tippen, das Viereck mit dem Pfeil nach oben.' },
                { icon: ICON.plus, text: 'Nach unten scrollen und „Zum Home-Bildschirm“ wählen.' },
                { icon: ICON.chevron, text: 'Oben rechts auf „Hinzufügen“ tippen, fertig!' }
              ]
            },
            {
              key: 'android', title: 'Android (Chrome)', steps: [
                { icon: ICON.dots, text: 'Oben rechts auf die drei Punkte tippen.' },
                { icon: ICON.plus, text: '„Zum Startbildschirm hinzufügen“ oder „App installieren“ wählen.' },
                { icon: ICON.chevron, text: 'Mit „Hinzufügen“ bestätigen, fertig!' }
              ]
            }
          ].sort((a, b) => (a.key === 'apple') === isAppleDevice ? -1 : (b.key === 'apple') === isAppleDevice ? 1 : 0).map(group => (
            <div key={group.key} style={{ backgroundColor: dc('#FFFFFF'), border: `2px solid ${LT.line}`, borderRadius: '20px', padding: '18px' }}>
              <div style={{ fontWeight: 700, fontSize: '19px', marginBottom: '12px' }}>{group.title}</div>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {group.steps.map((st, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ flex: '0 0 36px', height: '36px', borderRadius: '50%', backgroundColor: dc('#FFF0C2'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ flex: 1, paddingTop: '5px' }}>{st.text}</span>
                    <span style={{ paddingTop: '6px', color: LT.muted }}><LtIcon paths={st.icon} size={22} /></span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <button onClick={() => setShowInstallHelp(false)} style={{ minHeight: '56px', borderRadius: '16px', border: `2px solid ${LT.line}`, backgroundColor: 'transparent', color: LT.ink, fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>Schließen</button>
        </div>
      </div>
    </div>
  );
}
