// ═══ Pop-up: PIN festlegen (nach dem Anmelden) ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { MutableRefObject } from 'react';
import { dc } from '../../daten/data';
import { CloudPayload, PinEntry } from '../../types';
import { LT } from '../../basis/marke';
import { PinSetupForm } from '../../basis/pinForm';

export type PinFestlegenProps = {
  username: string;
  cloudDataRef: MutableRefObject<CloudPayload>;
  savePin: (key: string, entry: PinEntry, knownTs: number) => void;
};

export function PinFestlegen({ username, cloudDataRef, savePin }: PinFestlegenProps) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="lt-pinsetup-h" style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(31,20,12,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '440px', maxHeight: '100%', overflowY: 'auto', backgroundColor: dc('#FFFFFF'), color: LT.ink, borderRadius: '24px', padding: '24px 20px', boxSizing: 'border-box' }}>
        <h2 id="lt-pinsetup-h" style={{ margin: '0 0 12px', fontFamily: LT.serif, fontWeight: 400, fontSize: '28px' }}>Neu: deine persönliche PIN</h2>
        <PinSetupForm
          userKey={username.toLowerCase()}
          intro={`Damit sich niemand unter deinem Namen anmelden kann, braucht jeder jetzt eine eigene PIN. Du gibst sie nur beim Anmelden ein, ${username}.`}
          onSave={(entry) => savePin(username.toLowerCase(), entry, ((cloudDataRef.current.pins || {})[username.toLowerCase()]?.ts) || 0)}
        />
      </div>
    </div>
  );
}
