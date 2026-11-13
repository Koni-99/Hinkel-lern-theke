// ═══ „Gelesen“-Bestätigung für wichtige Nachrichten und Team-Umfragen ═══
// Wie bei Kundenfragen: Mitarbeiter speichern nur im eigenen Fortschritt
// (progress/<name>/_gelesen, /_stimmen). Umfragen legt der Ausbilder unter progress/admin/_umfragen an
// ("admin" taucht in keiner Mitarbeiter-Liste auf). Keine Änderung an den Firebase-Regeln nötig.
import { CloudPayload, PinboardMessage } from '../types';

type Upd = (curr: CloudPayload) => CloudPayload;
const prOf = (curr: CloudPayload, k: string, name: string): any => curr.progress[k] || (curr.progress[k] = { _displayName: name });

// ── Gelesen ──
export const pinKey = (pin: PinboardMessage | null | undefined) => (pin ? String(pin.timestamp || 0) : '');

/** Wann hat dieser Mitarbeiter die Nachricht bestätigt? (0 = noch nicht) */
export function gelesenAm(progress: CloudPayload['progress'] | undefined, userKey: string, pin: PinboardMessage | null | undefined): number {
  const k = pinKey(pin);
  const g = k && progress && progress[userKey] && (progress[userKey] as any)._gelesen;
  return (g && Number(g[k])) || 0;
}
export const gelesenBestaetigen = (userKey: string, name: string, pin: PinboardMessage, now = Date.now()): Upd => (curr) => {
  const k = pinKey(pin);
  if (!k) return curr;
  const pr = prOf(curr, userKey, name);
  const alt: Record<string, number> = pr._gelesen || {};
  if (alt[k]) return curr;
  // nur die letzten 20 Bestätigungen behalten
  const behalten = Object.entries(alt).sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 19);
  pr._gelesen = { ...Object.fromEntries(behalten), [k]: now };
  return curr;
};

// ── Umfragen ──
export type Umfrage = { frage: string; optionen: string[]; anonym: boolean; ts: number; offen: boolean };
export type UmfrageEintrag = Umfrage & { id: string };
export const UMFRAGE_KEY = 'admin';

export function alleUmfragen(progress: CloudPayload['progress'] | undefined): UmfrageEintrag[] {
  const m = progress && progress[UMFRAGE_KEY] && (progress[UMFRAGE_KEY] as any)._umfragen;
  if (!m || typeof m !== 'object') return [];
  return Object.entries(m)
    .filter(([, u]: [string, any]) => u && typeof u.frage === 'string' && Array.isArray(u.optionen) && u.optionen.length >= 2)
    .map(([id, u]: [string, any]) => ({ ...u, id }))
    .sort((a, b) => b.ts - a.ts);
}

/** Stimmen einer Umfrage: Anzahl je Antwort und wer was gewählt hat */
export function stimmen(progress: CloudPayload['progress'] | undefined, u: UmfrageEintrag) {
  const anzahl = u.optionen.map(() => 0);
  const wer: { user: string; name: string; wahl: number }[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    if (k === UMFRAGE_KEY) return;
    const w = pr && pr._stimmen && pr._stimmen[u.id];
    if (typeof w === 'number' && w >= 0 && w < anzahl.length) { anzahl[w]++; wer.push({ user: k, name: (pr && pr._displayName) || k, wahl: w }); }
  });
  return { anzahl, gesamt: wer.length, wer };
}
export const meineStimme = (progress: CloudPayload['progress'] | undefined, userKey: string, id: string): number | null => {
  const w = progress && progress[userKey] && (progress[userKey] as any)._stimmen && (progress[userKey] as any)._stimmen[id];
  return typeof w === 'number' ? w : null;
};

export const umfrageStarten = (frage: string, optionen: string[], anonym: boolean, now = Date.now()): Upd => (curr) => {
  const opts = optionen.map((o) => o.trim()).filter(Boolean).slice(0, 5);
  if (!frage.trim() || opts.length < 2) return curr;
  const pr = prOf(curr, UMFRAGE_KEY, 'Ausbilder');
  pr._umfragen = { ...(pr._umfragen || {}), [`u${now}`]: { frage: frage.trim().slice(0, 200), optionen: opts.map((o) => o.slice(0, 80)), anonym, ts: now, offen: true } };
  return curr;
};
export const umfrageBeenden = (id: string, offen = false): Upd => (curr) => {
  const pr: any = curr.progress[UMFRAGE_KEY];
  if (!pr || !pr._umfragen || !pr._umfragen[id]) return curr;
  pr._umfragen = { ...pr._umfragen, [id]: { ...pr._umfragen[id], offen } };
  return curr;
};
export const umfrageLoeschen = (id: string): Upd => (curr) => {
  const pr: any = curr.progress[UMFRAGE_KEY];
  if (!pr || !pr._umfragen || !pr._umfragen[id]) return curr;
  const next = { ...pr._umfragen }; delete next[id];
  pr._umfragen = next;
  return curr;
};
export const abstimmen = (userKey: string, name: string, id: string, wahl: number): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  pr._stimmen = { ...(pr._stimmen || {}), [id]: wahl };
  return curr;
};
