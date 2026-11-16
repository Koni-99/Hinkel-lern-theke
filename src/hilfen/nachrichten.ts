// ═══ Einzel-Nachrichten: Admin, Koni (und wem der Admin das Recht gibt) schreiben an ausgewählte Mitarbeiter ═══
// Wie Kollegen-Lob und Kundenfragen: jeder speichert nur im eigenen Fortschritt.
//   Absender:   progress/<absender>/_nachrichten  { m<ts>: { an: {schlüssel: name}, t, ts } }
//   Empfänger:  progress/<empfänger>/_postfach    { <code>: { g: gelesen-am, a?: antwort, aTs? } }
//   Recht:      progress/admin/_nachrichtRecht    { schlüssel: true }  (nur der Admin schreibt dort)
// Der Admin schreibt seine Nachrichten unter progress/admin (taucht in keiner Mitarbeiter-Liste auf).
import { CloudPayload } from '../types';

type Upd = (curr: CloudPayload) => CloudPayload;
const prOf = (curr: CloudPayload, k: string, name: string): any => curr.progress[k] || (curr.progress[k] = { _displayName: name });

export const NACHRICHT_MAX = 500;
export const ANTWORT_MAX = 300;
/** Diese Konten dürfen immer schreiben */
export const IMMER_SCHREIBEN = ['admin', 'koni'];

export type Nachricht = { an: Record<string, string>; t: string; ts: number };
export type NachrichtEintrag = Nachricht & { id: string; von: string; vonName: string };
export type PostfachEintrag = { g?: number; a?: string; aTs?: number };

/** Kurzer, für die Datenbank sicherer Schlüssel pro Nachricht (Absender + Nummer) */
export const postfachKey = (von: string, id: string) => {
  const s = `${von}|${id}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `p${h.toString(36)}${id.replace(/[^a-z0-9]/gi, '')}`;
};

export const absenderName = (k: string, pr: any) => (k === 'admin' ? 'Ausbilder' : (pr && pr._displayName) || k);

/** Wem hat der Admin das Recht gegeben? (ohne Admin und Koni, die dürfen immer) */
export const rechteListe = (progress: CloudPayload['progress'] | undefined): string[] =>
  Object.entries(((progress || {}).admin as any)?._nachrichtRecht || {}).filter(([, v]) => v === true).map(([k]) => k);

export const darfSchreiben = (progress: CloudPayload['progress'] | undefined, userKey: string) =>
  !!userKey && (IMMER_SCHREIBEN.includes(userKey) || rechteListe(progress).includes(userKey));

export const rechtSetzen = (userKey: string, an: boolean): Upd => (curr) => {
  const pr = prOf(curr, 'admin', 'admin');
  const next = { ...(pr._nachrichtRecht || {}) };
  if (an) next[userKey] = true; else delete next[userKey];
  pr._nachrichtRecht = next;
  return curr;
};

/** Alle Einzel-Nachrichten aus allen Fortschritten (neueste zuerst) */
export function alleNachrichten(progress: CloudPayload['progress'] | undefined): NachrichtEintrag[] {
  const out: NachrichtEintrag[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    const m = pr && pr._nachrichten;
    if (!m || typeof m !== 'object') return;
    Object.entries(m).forEach(([id, x]: [string, any]) => {
      if (x && typeof x.t === 'string' && x.t.trim() && x.an && typeof x.an === 'object') out.push({ ...x, id, von: k, vonName: absenderName(k, pr) });
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
}

const postfachVon = (progress: CloudPayload['progress'] | undefined, userKey: string): Record<string, PostfachEintrag> =>
  (((progress || {})[userKey] as any)?._postfach) || {};

/** Nachrichten an mich, mit meinem Lese-Stand und meiner Antwort */
export function meinePost(progress: CloudPayload['progress'] | undefined, userKey: string) {
  const pf = postfachVon(progress, userKey);
  return alleNachrichten(progress).filter((n) => n.von !== userKey && Object.prototype.hasOwnProperty.call(n.an, userKey))
    .map((n) => ({ ...n, mein: pf[postfachKey(n.von, n.id)] || {} }));
}
export const ungelesen = (progress: CloudPayload['progress'] | undefined, userKey: string) => meinePost(progress, userKey).filter((n) => !n.mein.g);

/** Meine gesendeten Nachrichten, mit Stand pro Empfänger */
export function meineGesendeten(progress: CloudPayload['progress'] | undefined, userKey: string) {
  return alleNachrichten(progress).filter((n) => n.von === userKey).map((n) => ({
    ...n,
    status: Object.entries(n.an).map(([k, name]) => ({ k, name: (((progress || {})[k] as any)?._displayName) || name, ...(postfachVon(progress, k)[postfachKey(n.von, n.id)] || {}) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
/** Neue Antworten auf meine Nachrichten, die ich noch nicht gesehen habe */
export function neueAntworten(progress: CloudPayload['progress'] | undefined, userKey: string) {
  const gesehen = Number(((progress || {})[userKey] as any)?._antwortenGesehen) || 0;
  return meineGesendeten(progress, userKey).flatMap((n) => n.status.filter((s) => s.a && (s.aTs || 0) > gesehen)).length;
}
export const antwortenGesehen = (userKey: string, name: string, now = Date.now()): Upd => (curr) => {
  prOf(curr, userKey, name)._antwortenGesehen = now;
  return curr;
};

export const nachrichtSchicken = (userKey: string, name: string, an: Record<string, string>, text: string, now = Date.now()): Upd => (curr) => {
  const t = text.trim().slice(0, NACHRICHT_MAX);
  const empf = Object.fromEntries(Object.entries(an).filter(([k]) => k && k !== userKey && k !== 'admin'));
  if (!t || Object.keys(empf).length === 0 || !darfSchreiben(curr.progress, userKey)) return curr;
  const pr = prOf(curr, userKey, name);
  // nur die letzten 50 eigenen Nachrichten behalten
  const alt = Object.entries(pr._nachrichten || {}).sort((a: any, b: any) => (b[1].ts || 0) - (a[1].ts || 0)).slice(0, 49);
  pr._nachrichten = { ...Object.fromEntries(alt), [`m${now}`]: { an: empf, t, ts: now } };
  return curr;
};
export const nachrichtLoeschen = (userKey: string, id: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._nachrichten || !pr._nachrichten[id]) return curr;
  const next = { ...pr._nachrichten }; delete next[id];
  pr._nachrichten = next;
  return curr;
};

/** Empfänger: gelesen (und freiwillig kurz antworten) */
export const nachrichtGelesen = (userKey: string, name: string, von: string, id: string, antwort = '', now = Date.now()): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  const key = postfachKey(von, id);
  const alt: PostfachEintrag = (pr._postfach || {})[key] || {};
  const a = antwort.trim().slice(0, ANTWORT_MAX);
  pr._postfach = { ...(pr._postfach || {}), [key]: { ...alt, g: alt.g || now, ...(a && !alt.a ? { a, aTs: now } : {}) } };
  return curr;
};
