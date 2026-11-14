// ═══ Anmeldung (Name, PIN, Ausbilder-Login) ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';
import { dc } from '../daten/data';
import { CloudPayload, PinEntry } from '../types';
import { formatEndpointUrl, sanitizeUsername } from '../hilfen/allgemein';
import { checkPin, PIN_MAX } from '../hilfen/pin';
import { adminSignIn } from '../hilfen/anmeldung';
import { HINKEL_LOGO, LT, LT_CSS } from '../basis/marke';
import { PinSetupForm } from '../basis/pinForm';

export type LoginScreenProps = {
  tempUsername: string;
  setTempUsername: Dispatch<SetStateAction<string>>;
  adminPinInput: string;
  setAdminPinInput: Dispatch<SetStateAction<string>>;
  adminEmail: string;
  setAdminEmail: Dispatch<SetStateAction<string>>;
  setAdminLoginMsg: Dispatch<SetStateAction<string>>;
  adminLoginMsg: string;
  setPinError: Dispatch<SetStateAction<boolean>>;
  pinError: boolean;
  loginStep: "name" | "pin" | "setpin";
  setLoginStep: Dispatch<SetStateAction<"name" | "pin" | "setpin">>;
  loginPin: string;
  setLoginPin: Dispatch<SetStateAction<string>>;
  loginBusy: boolean;
  setLoginBusy: Dispatch<SetStateAction<boolean>>;
  setLoginMsg: Dispatch<SetStateAction<string>>;
  loginMsg: string;
  resetLogin: () => void;
  cloudUrl: string;
  fetchCloudData: (customUrl?: string | undefined) => Promise<CloudPayload | null>;
  cloudDataRef: MutableRefObject<CloudPayload>;
  savePin: (key: string, entry: PinEntry, knownTs: number) => void;
  finishLogin: (clean: string) => void;
  bigFont: boolean;
  toggleBigFont: () => void;
};

export function LoginScreen({ tempUsername, setTempUsername, adminPinInput, setAdminPinInput, adminEmail, setAdminEmail, setAdminLoginMsg, adminLoginMsg, setPinError, pinError, loginStep, setLoginStep, loginPin, setLoginPin, loginBusy, setLoginBusy, setLoginMsg, loginMsg, resetLogin, cloudUrl, fetchCloudData, cloudDataRef, savePin, finishLogin, bigFont, toggleBigFont }: LoginScreenProps) {
  const isAdminLogin = tempUsername.trim().toLowerCase() === 'admin';
  return (
    <div className="lt-root" style={{ minHeight: '100vh', backgroundColor: LT.cream, color: LT.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', zoom: bigFont ? 1.15 : 1 }}>
      <style>{LT_CSS}</style>
      <div style={{ width: '100%' }}>
        <div className="lt-awning" style={{ backgroundColor: LT.yellow, backgroundImage: 'linear-gradient(180deg, rgba(75,42,20,0.16) 0px, rgba(75,42,20,0) 22px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img className="lt-logo" onClick={(e) => { const el = e.currentTarget; el.classList.remove('lt-spin'); void el.offsetWidth; el.classList.add('lt-spin'); }} src={HINKEL_LOGO} alt="Bäckerei Hinkel, Die Bäckerei der Brotfreunde" style={{ width: 'auto', display: 'block' }} />
        </div>
        <div aria-hidden="true" style={{ height: '20px', backgroundImage: `radial-gradient(circle at 20px 0px, ${LT.yellow} 20px, rgba(0,0,0,0) 20.5px)`, backgroundSize: '40px 20px', backgroundRepeat: 'repeat-x', filter: 'drop-shadow(0 4px 0 rgba(75,42,20,0.12))' }} />
      </div>

      <div style={{ width: '92%', maxWidth: '460px', marginTop: '36px', marginBottom: '40px', backgroundColor: dc('#FFFFFF'), border: `2px solid ${LT.line}`, borderRadius: '28px', padding: '32px 28px', boxSizing: 'border-box', boxShadow: '0 20px 40px -18px rgba(75,42,20,0.25)' }}>
        <h1 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '40px', lineHeight: 1.05, textAlign: 'center' }}>Willkommen in der Lern-Theke</h1>
        <p style={{ margin: '10px 0 24px', fontSize: '18px', color: LT.brown, textAlign: 'center', lineHeight: 1.5 }}>Lernen, spielen und Wissen auffrischen, für alle Brotfreunde.</p>
        {loginStep === 'name' && (
        <form onSubmit={async (e) => {
          e.preventDefault();
          const clean = sanitizeUsername(tempUsername);
          if (!clean || loginBusy) return;
          if (clean.toLowerCase() === 'admin') {
            // Ausbilder: echte Anmeldung bei Firebase (E-Mail + Passwort)
            if (!adminEmail.trim() || !adminPinInput) { setAdminLoginMsg('Bitte E-Mail und Passwort eingeben.'); setPinError(true); return; }
            setLoginBusy(true);
            const err = await adminSignIn(adminEmail, adminPinInput);
            setLoginBusy(false);
            if (err) { setAdminLoginMsg(err); setPinError(true); return; }
            try { localStorage.setItem('hinkel_admin_email', adminEmail.trim()); } catch {}
            setAdminPinInput('');
            finishLogin(clean);
            return;
          }
          // Ohne Cloud gibt es keine gemeinsamen Konten, also auch keine PIN
          if (!formatEndpointUrl(cloudUrl)) { finishLogin(clean); return; }
          setLoginBusy(true); setLoginMsg('');
          const fresh = await fetchCloudData();
          setLoginBusy(false);
          const entry = ((fresh || cloudDataRef.current).pins || {})[clean.toLowerCase()];
          if (entry?.h) { setLoginStep('pin'); return; }
          // Ohne Verbindung keine neue PIN festlegen: Vielleicht gibt es auf einem anderen Gerät schon eine
          if (!fresh) { setLoginMsg('Keine Verbindung zur Cloud. Zum ersten Anmelden brauchst du Internet, bitte gleich nochmal versuchen.'); return; }
          setLoginStep('setpin');
        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label htmlFor="lt-name" style={{ fontSize: '17px', fontWeight: 700 }}>Dein Vorname</label>
          <input id="lt-name" type="text" autoComplete="given-name" placeholder="z. B. Anna" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} style={{ minHeight: '60px', padding: '0 18px', borderRadius: '16px', border: `2px solid ${LT.line}`, backgroundColor: LT.cream, fontSize: '20px', color: LT.ink, outline: 'none', boxSizing: 'border-box' }} />

          {isAdminLogin && (
            <div style={{ backgroundColor: dc('#FFF0C2'), padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="lt-admin-mail" style={{ fontSize: '17px', fontWeight: 700 }}>Ausbilder-E-Mail</label>
              <input id="lt-admin-mail" type="email" autoComplete="username" inputMode="email" placeholder="name@beispiel.de" value={adminEmail}
                onChange={(e) => { setAdminEmail(e.target.value); setPinError(false); setAdminLoginMsg(''); }}
                style={{ minHeight: '56px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${pinError ? '#9A3412' : LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.ink, fontSize: '18px', boxSizing: 'border-box' }} />
              <label htmlFor="lt-pin" style={{ fontSize: '17px', fontWeight: 700 }}>Passwort</label>
              <input id="lt-pin" type="password" autoComplete="current-password" placeholder="Passwort" value={adminPinInput}
                onChange={(e) => { setAdminPinInput(e.target.value); setPinError(false); setAdminLoginMsg(''); }}
                style={{ minHeight: '56px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${pinError ? '#9A3412' : LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.ink, fontSize: '18px', boxSizing: 'border-box' }} />
              {pinError && <div role="alert" style={{ color: dc('#9A3412'), fontSize: '16px', fontWeight: 700 }}>{adminLoginMsg || 'E-Mail oder Passwort stimmt nicht.'}</div>}
            </div>
          )}

          {loginMsg && <div role="alert" style={{ color: dc('#9A3412'), fontSize: '16px', fontWeight: 700 }}>{loginMsg}</div>}
          <button type="submit" disabled={!tempUsername.trim() || loginBusy} style={{ minHeight: '60px', marginTop: '4px', borderRadius: '16px', border: 'none', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '20px', fontWeight: 700, cursor: 'pointer', opacity: tempUsername.trim() ? 1 : 0.5 }}>Los geht’s</button>
        </form>
        )}

        {loginStep === 'pin' && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (loginBusy || !loginPin) return;
            const clean = sanitizeUsername(tempUsername);
            const key = clean.toLowerCase();
            // Nach 5 falschen Versuchen 1 Minute warten
            let lock: { n: number; until: number } = { n: 0, until: 0 };
            try { lock = { ...lock, ...JSON.parse(localStorage.getItem('hinkel_pin_lock') || '{}') }; } catch {}
            if (Date.now() < lock.until) { setLoginMsg(`Zu viele Versuche. Bitte warte ${Math.ceil((lock.until - Date.now()) / 1000)} Sekunden.`); return; }
            setLoginBusy(true);
            let ok = false;
            try { ok = await checkPin(key, loginPin, (cloudDataRef.current.pins || {})[key]); } catch {}
            setLoginBusy(false);
            if (ok) {
              try { localStorage.removeItem('hinkel_pin_lock'); } catch {}
              finishLogin(clean);
              return;
            }
            lock.n += 1;
            if (lock.n >= 5) lock = { n: 0, until: Date.now() + 60000 };
            try { localStorage.setItem('hinkel_pin_lock', JSON.stringify(lock)); } catch {}
            setLoginPin('');
            setLoginMsg(lock.until > Date.now() ? 'Die PIN stimmt nicht. Zu viele Versuche, bitte warte 1 Minute.' : 'Die PIN stimmt nicht, bitte nochmal versuchen.');
          }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '18px', textAlign: 'center' }}>Hallo <strong>{sanitizeUsername(tempUsername)}</strong>!</p>
            <label htmlFor="lt-mypin" style={{ fontSize: '17px', fontWeight: 700 }}>Deine PIN</label>
            <input id="lt-mypin" type="password" inputMode="numeric" autoComplete="current-password" maxLength={PIN_MAX} autoFocus placeholder="PIN" value={loginPin}
              onChange={(e) => { setLoginPin(e.target.value.replace(/\D/g, '')); setLoginMsg(''); }}
              style={{ minHeight: '60px', padding: '0 16px', borderRadius: '16px', border: `2px solid ${loginMsg ? '#9A3412' : LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.ink, fontSize: '24px', letterSpacing: '8px', textAlign: 'center', boxSizing: 'border-box' }} />
            {loginMsg && <div role="alert" style={{ color: dc('#9A3412'), fontSize: '16px', fontWeight: 700 }}>{loginMsg}</div>}
            <button type="submit" disabled={!loginPin || loginBusy} style={{ minHeight: '60px', borderRadius: '16px', border: 'none', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '20px', fontWeight: 700, cursor: 'pointer', opacity: !loginPin || loginBusy ? 0.55 : 1 }}>Anmelden</button>
            <p style={{ margin: 0, fontSize: '15px', color: LT.muted, textAlign: 'center', lineHeight: 1.45 }}>PIN vergessen? Der Ausbilder kann sie im Ausbilder-Bereich zurücksetzen.</p>
            <button type="button" onClick={resetLogin} style={{ minHeight: '48px', borderRadius: '14px', border: `2px solid ${LT.line}`, backgroundColor: 'transparent', color: LT.muted, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Anderer Name</button>
          </form>
        )}

        {loginStep === 'setpin' && (
          <PinSetupForm
            userKey={sanitizeUsername(tempUsername).toLowerCase()}
            intro={`Hallo ${sanitizeUsername(tempUsername)}! Lege einmalig eine persönliche PIN fest. Damit kann sich niemand sonst unter deinem Namen anmelden.`}
            onSave={(entry) => { const clean = sanitizeUsername(tempUsername); savePin(clean.toLowerCase(), entry, ((cloudDataRef.current.pins || {})[clean.toLowerCase()]?.ts) || 0); finishLogin(clean); }}
            onCancel={resetLogin}
          />
        )}
        <button onClick={toggleBigFont} style={{ display: 'block', margin: '18px auto 0', minHeight: '46px', padding: '0 16px', borderRadius: '12px', border: `2px solid ${LT.line}`, backgroundColor: 'transparent', color: LT.muted, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
          {bigFont ? 'Normale Schrift' : 'A+ Größere Schrift'}
        </button>
      </div>
    </div>
  );
}
