// ═══ Anmeldung bei Firebase (Ausbilder und unsichtbar für alle) ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.

// ───────────── Ausbilder-Anmeldung über Firebase Authentication (E-Mail + Passwort) ─────────────
// Ohne zusätzliches npm-Paket: Die App spricht die offizielle REST-Schnittstelle von Firebase an.
// Der Web-API-Schlüssel ist kein Geheimnis (er steht in jeder Firebase-Web-App). Geschützt wird über
// die Datenbankregeln: Nur das Ausbilder-Konto darf Fragen, Artikel, Pinnwand, Fotos und Löschungen schreiben.
export const FIREBASE_API_KEY = 'AIzaSyBsLXL3DOgG6qITKtPHbw3I0azA4ztjTco';

export type AdminSession = { idToken: string; refreshToken: string; exp: number; uid: string; email: string };

export const ADMIN_AUTH_KEY = 'hinkel_admin_auth';

export const ADMIN_EXPIRED_EVENT = 'hinkel-admin-expired';

export function readAdminSession(): AdminSession | null {
  try {
    const s = JSON.parse(localStorage.getItem(ADMIN_AUTH_KEY) || 'null');
    return s && s.refreshToken && s.uid ? s : null;
  } catch { return null; }
}

export function writeAdminSession(s: AdminSession | null) {
  try { if (s) localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(s)); else localStorage.removeItem(ADMIN_AUTH_KEY); } catch {}
}

export function hasAdminSession(): boolean { return !!readAdminSession(); }

export function adminSignOut() { writeAdminSession(null); }

export async function adminSignIn(email: string, password: string): Promise<string> {
  if (!FIREBASE_API_KEY) return 'Die Ausbilder-Anmeldung ist noch nicht eingerichtet (API-Schlüssel fehlt in utils.ts).';
  let res: Response;
  try {
    res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
    });
  } catch { return 'Keine Verbindung. Bitte Internet prüfen und nochmal versuchen.'; }
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = String(data?.error?.message || '');
    if (code.startsWith('TOO_MANY_ATTEMPTS')) return 'Zu viele Versuche. Bitte in ein paar Minuten nochmal probieren.';
    if (code.startsWith('USER_DISABLED')) return 'Dieses Konto ist gesperrt.';
    if (code.startsWith('INVALID_EMAIL')) return 'Die E-Mail-Adresse ist ungültig.';
    if (code.startsWith('API_KEY') || code.includes('API key')) return 'Der API-Schlüssel in utils.ts stimmt nicht.';
    if (code.startsWith('OPERATION_NOT_ALLOWED')) return 'In Firebase ist die Anmeldung mit E-Mail/Passwort noch nicht eingeschaltet.';
    return 'E-Mail oder Passwort stimmt nicht.';
  }
  writeAdminSession({ idToken: data.idToken, refreshToken: data.refreshToken, exp: Date.now() + (Number(data.expiresIn) || 3600) * 1000, uid: data.localId, email: data.email });
  return '';
}

// Der Anmelde-Schlüssel (idToken) gilt 1 Stunde und wird bei Bedarf still erneuert.
export async function refreshSession(s: AdminSession, save: (x: AdminSession | null) => void, onDead: () => void): Promise<string | null> {
  try {
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(s.refreshToken)}`,
    });
    if (res.status === 400 || res.status === 401 || res.status === 403) { save(null); onDead(); return null; }
    if (!res.ok) return null;
    const d: any = await res.json();
    save({ ...s, idToken: d.id_token, refreshToken: d.refresh_token || s.refreshToken, exp: Date.now() + (Number(d.expires_in) || 3600) * 1000 });
    return d.id_token as string;
  } catch { return null; }
}

export let refreshing: Promise<string | null> | null = null;

export async function getAdminToken(): Promise<string | null> {
  const s = readAdminSession();
  if (!s) return null;
  if (s.idToken && s.exp - Date.now() > 60000) return s.idToken;
  if (refreshing) return refreshing;
  refreshing = refreshSession(s, writeAdminSession, () => {
    // Konto gelöscht/gesperrt oder Passwort geändert: neu anmelden
    try { window.dispatchEvent(new Event(ADMIN_EXPIRED_EVENT)); } catch {}
  }).finally(() => { refreshing = null; });
  return refreshing;
}

// ── Unsichtbare Anmeldung für alle Mitarbeiter (Firebase „Anonym“) ──
// Damit kann die Datenbank Zugriffe ohne App ablehnen. Für die Kollegen ändert sich nichts.
export const ANON_AUTH_KEY = 'hinkel_anon_auth';

export function readAnon(): AdminSession | null {
  try { const s = JSON.parse(localStorage.getItem(ANON_AUTH_KEY) || 'null'); return s && s.refreshToken ? s : null; } catch { return null; }
}

export function writeAnon(s: AdminSession | null) {
  try { if (s) localStorage.setItem(ANON_AUTH_KEY, JSON.stringify(s)); else localStorage.removeItem(ANON_AUTH_KEY); } catch {}
}

export let anonPending: Promise<string | null> | null = null;

export let anonRetryAt = 0;

export async function anonSignUp(): Promise<string | null> {
  if (Date.now() < anonRetryAt) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }),
    });
    if (!res.ok) { anonRetryAt = Date.now() + 60000; return null; }
    const d: any = await res.json();
    writeAnon({ idToken: d.idToken, refreshToken: d.refreshToken, exp: Date.now() + (Number(d.expiresIn) || 3600) * 1000, uid: d.localId, email: '' });
    return d.idToken as string;
  } catch { anonRetryAt = Date.now() + 15000; return null; }
}

export async function getAnonToken(): Promise<string | null> {
  if (!FIREBASE_API_KEY) return null;
  const s = readAnon();
  if (s && s.idToken && s.exp - Date.now() > 60000) return s.idToken;
  if (anonPending) return anonPending;
  anonPending = (async () => {
    if (s) {
      const t = await refreshSession(s, writeAnon, () => {});
      if (t) return t;
      if (readAnon()) return null; // nur Netzproblem: später nochmal
    }
    return anonSignUp();
  })().finally(() => { anonPending = null; });
  return anonPending;
}

/** Hängt den Anmelde-Schlüssel an eine Firebase-Datenbank-Adresse an (Ausbilder oder unsichtbare Anmeldung) */
/** Firebase meldet „Anmeldung abgelaufen“: beim nächsten Zugriff einen frischen Anmelde-Schlüssel holen */
export function forceTokenRefresh() {
  const a = readAdminSession(); if (a) writeAdminSession({ ...a, exp: 0 });
  const b = readAnon(); if (b) writeAnon({ ...b, exp: 0 });
}

/** Firebase-Datenbank-Adresse? Auch der lokale Firebase-Emulator (…?ns=projekt) für Tests zählt dazu. */
export function isFirebaseUrl(url: string): boolean {
  return /firebaseio\.com|firebasedatabase\.app/.test(url) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/[^?]*\?(.*&)?ns=/.test(url);
}

export async function withAuth(url: string): Promise<string> {
  if (!isFirebaseUrl(url)) return url;
  const t = hasAdminSession() ? await getAdminToken() : await getAnonToken();
  return t ? `${url}${url.includes('?') ? '&' : '?'}auth=${encodeURIComponent(t)}` : url;
}

/** Alter Name, gleiche Funktion */
export const withAdminAuth = withAuth;

/** Bereiche, die nur der Ausbilder schreiben darf (müssen zu den Datenbankregeln passen) */
export const ADMIN_ONLY_KEYS = ['customQuestions', 'customProducts', 'questionEdits', 'productFixes', 'pinboard', 'compactedUntil'];

/** Entfernt aus einer Änderung alles, was ein Mitarbeiter nicht schreiben darf.
 *  Sonst würde Firebase die ganze Änderung ablehnen und die Punkte kämen nie an. */
export function stripAdminOnly(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  Object.keys(patch).forEach((k) => {
    const [top, sub] = k.split('/');
    if (ADMIN_ONLY_KEYS.includes(top)) return;
    if (top === 'tombstones') {
      // Mitarbeiter dürfen nur „eigenen Fortschritt zurückgesetzt“ vermerken
      if (sub === 'progressReset') out[k] = patch[k];
      else if (!sub && patch[k] && patch[k].progressReset) out['tombstones/progressReset'] = patch[k].progressReset;
      return;
    }
    out[k] = patch[k];
  });
  return out;
}
