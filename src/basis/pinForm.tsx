// ═══ PIN festlegen (Formular) ═══
// Vorher in appBasis.tsx. Inhalt unverändert übernommen.
import { useState } from 'react';
import { dc } from '../daten/data';
import { PinEntry } from '../types';
import { makePinEntry, pinFormatError, PIN_MAX } from '../hilfen/pin';
import { LT } from './marke';

// ── Persönliche PIN festlegen (beim ersten Anmelden oder nach Zurücksetzen durch den Ausbilder) ──
export function PinSetupForm({ userKey, intro, onSave, onCancel }: { userKey: string; intro: string; onSave: (entry: PinEntry) => void; onCancel?: () => void }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const field = (id: string, label: string, val: string, set: (v: string) => void, autoFocus?: boolean) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '17px', fontWeight: 700 }}>{label}</label>
      <input id={id} type="password" inputMode="numeric" autoComplete="new-password" maxLength={PIN_MAX} autoFocus={autoFocus} placeholder="4 bis 6 Ziffern" value={val}
        onChange={(e) => { set(e.target.value.replace(/\D/g, '')); setErr(''); }}
        style={{ minHeight: '56px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${err ? '#9A3412' : LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.ink, fontSize: '22px', letterSpacing: '6px', textAlign: 'center', boxSizing: 'border-box' }} />
    </div>
  );
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const fe = pinFormatError(p1);
      if (fe) { setErr(fe); return; }
      if (p1 !== p2) { setErr('Die beiden PINs sind nicht gleich.'); return; }
      setBusy(true);
      try { onSave(await makePinEntry(userKey, p1)); }
      catch { setErr('Dein Browser kann die PIN hier nicht sicher speichern. Bitte öffne die App über die normale https-Adresse.'); }
      finally { setBusy(false); }
    }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <p style={{ margin: 0, fontSize: '16px', color: LT.brown, lineHeight: 1.5 }}>{intro}</p>
      {field('lt-pin-new', 'Deine neue PIN', p1, setP1, true)}
      {field('lt-pin-new2', 'PIN wiederholen', p2, setP2)}
      {err && <div role="alert" style={{ color: dc('#9A3412'), fontSize: '16px', fontWeight: 700 }}>{err}</div>}
      <button type="submit" disabled={busy || !p1 || !p2} style={{ minHeight: '60px', borderRadius: '16px', border: 'none', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '20px', fontWeight: 700, cursor: 'pointer', opacity: busy || !p1 || !p2 ? 0.55 : 1 }}>PIN speichern</button>
      {onCancel && <button type="button" onClick={onCancel} style={{ minHeight: '48px', borderRadius: '14px', border: `2px solid ${LT.line}`, backgroundColor: 'transparent', color: LT.muted, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Anderer Name</button>}
    </form>
  );
}
