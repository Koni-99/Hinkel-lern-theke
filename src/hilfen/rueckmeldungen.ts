// ═══ Ideen-Box, Kundenstimmen und Geburtstage ═══
// Alles im eigenen Fortschritt der Mitarbeiter (progress/<name>/…), wie Kundenfragen und Tipps.
// Keine Änderung an den Firebase-Regeln nötig. Der Ausbilder beantwortet bzw. löscht.
import { CloudPayload } from '../types';

type Upd = (curr: CloudPayload) => CloudPayload;
const prOf = (curr: CloudPayload, k: string, name: string): any => curr.progress[k] || (curr.progress[k] = { _displayName: name });
const nameOf = (k: string, pr: any) => (pr && pr._displayName) || k;
function sammeln<T>(progress: CloudPayload['progress'] | undefined, feld: string, gueltig: (x: any) => boolean): (T & { id: string; user: string; name: string })[] {
  const out: any[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    if (k === 'admin') return;
    const m = pr && pr[feld];
    if (!m || typeof m !== 'object') return;
    Object.entries(m).forEach(([id, x]: [string, any]) => { if (x && gueltig(x)) out.push({ ...x, id, user: k, name: nameOf(k, pr) }); });
  });
  return out.sort((a, b) => b.ts - a.ts);
}
function eintragLoeschen(curr: CloudPayload, userKey: string, feld: string, id: string) {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr[feld] || !pr[feld][id]) return curr;
  const next = { ...pr[feld] }; delete next[id];
  pr[feld] = next;
  return curr;
}

// ── Ideen-Box ──
export type Idee = { t: string; ts: number; anonym: boolean; a?: string; aTs?: number; seen?: boolean };
export const IDEE_MAX = 500;
export const alleIdeen = (progress: CloudPayload['progress'] | undefined) => sammeln<Idee>(progress, '_ideen', (x) => typeof x.t === 'string' && x.t.trim().length > 0);
export const ideeEinreichen = (userKey: string, name: string, text: string, anonym: boolean, now = Date.now()): Upd => (curr) => {
  const t = text.trim().slice(0, IDEE_MAX);
  if (!t) return curr;
  const pr = prOf(curr, userKey, name);
  pr._ideen = { ...(pr._ideen || {}), [`i${now}`]: { t, ts: now, anonym } };
  return curr;
};
export const ideeBeantworten = (userKey: string, id: string, antwort: string, now = Date.now()): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  const x = pr && pr._ideen && pr._ideen[id];
  if (!x) return curr;
  pr._ideen = { ...pr._ideen, [id]: { ...x, a: antwort.trim().slice(0, 1000), aTs: now, seen: false } };
  return curr;
};
export const ideeLoeschen = (userKey: string, id: string): Upd => (curr) => eintragLoeschen(curr, userKey, '_ideen', id);
export const ideenGesehen = (userKey: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._ideen) return curr;
  let changed = false;
  const next: Record<string, Idee> = {};
  Object.entries(pr._ideen).forEach(([id, x]: [string, any]) => { if (x && x.a && !x.seen) { changed = true; next[id] = { ...x, seen: true }; } else next[id] = x; });
  if (changed) pr._ideen = next;
  return curr;
};

// ── Kundenstimmen ──
export type KStimmeArt = 'lob' | 'kritik' | 'wunsch';
export type KStimme = { art: KStimmeArt; p?: string; t: string; ts: number };
export const KSTIMME_MAX = 300;
export const KSTIMME_ARTEN: { id: KStimmeArt; label: string }[] = [{ id: 'lob', label: 'Lob' }, { id: 'kritik', label: 'Kritik' }, { id: 'wunsch', label: 'Wunsch' }];
export const alleKundenstimmen = (progress: CloudPayload['progress'] | undefined) =>
  sammeln<KStimme>(progress, '_kundenstimmen', (x) => typeof x.t === 'string' && x.t.trim().length > 0 && ['lob', 'kritik', 'wunsch'].includes(x.art));
export const stimmeNotieren = (userKey: string, name: string, art: KStimmeArt, produkt: string, text: string, now = Date.now()): Upd => (curr) => {
  const t = text.trim().slice(0, KSTIMME_MAX);
  if (!t) return curr;
  const pr = prOf(curr, userKey, name);
  // nur die letzten 50 eigenen behalten
  const alt = Object.entries(pr._kundenstimmen || {}).sort((a: any, b: any) => (b[1].ts || 0) - (a[1].ts || 0)).slice(0, 49);
  pr._kundenstimmen = { ...Object.fromEntries(alt), [`s${now}`]: { art, t, ts: now, ...(produkt.trim() ? { p: produkt.trim().slice(0, 80) } : {}) } };
  return curr;
};
export const stimmeLoeschen = (userKey: string, id: string): Upd => (curr) => eintragLoeschen(curr, userKey, '_kundenstimmen', id);

// ── Geburtstage (freiwillig, nur Tag und Monat) ──
export const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const mmdd = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const meinGeburtstag = (progress: CloudPayload['progress'] | undefined, userKey: string): string => {
  const g = progress && progress[userKey] && (progress[userKey] as any)._geburtstag;
  return typeof g === 'string' && /^\d\d-\d\d$/.test(g) ? g : '';
};
export const geburtstagSetzen = (userKey: string, name: string, wert: string | null): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  if (wert && /^\d\d-\d\d$/.test(wert)) pr._geburtstag = wert; else delete pr._geburtstag;
  return curr;
};
/** Wer hat heute Geburtstag? (29. Februar wird in anderen Jahren am 28. gefeiert) */
export function geburtstageHeute(progress: CloudPayload['progress'] | undefined, heute = new Date()): { user: string; name: string }[] {
  const k = mmdd(heute);
  const schalt = new Date(heute.getFullYear(), 1, 29).getMonth() === 1;
  return Object.entries(progress || {})
    .filter(([key, pr]: [string, any]) => key !== 'admin' && pr && typeof pr._geburtstag === 'string' && (pr._geburtstag === k || (!schalt && pr._geburtstag === '02-29' && k === '02-28')))
    .map(([key, pr]: [string, any]) => ({ user: key, name: nameOf(key, pr) }));
}
const gratKey = (an: string, jahr: number) => `${an}_${jahr}`;
export const gratulieren = (userKey: string, name: string, an: string, jahr = new Date().getFullYear(), now = Date.now()): Upd => (curr) => {
  if (an === userKey) return curr;
  const pr = prOf(curr, userKey, name);
  pr._gratuliert = { ...(pr._gratuliert || {}), [gratKey(an, jahr)]: now };
  return curr;
};
export const habeGratuliert = (progress: CloudPayload['progress'] | undefined, userKey: string, an: string, jahr = new Date().getFullYear()) =>
  !!(progress && progress[userKey] && (progress[userKey] as any)._gratuliert && (progress[userKey] as any)._gratuliert[gratKey(an, jahr)]);
export function gratulanten(progress: CloudPayload['progress'] | undefined, an: string, jahr = new Date().getFullYear()): string[] {
  return Object.entries(progress || {})
    .filter(([k, pr]: [string, any]) => k !== an && pr && pr._gratuliert && pr._gratuliert[gratKey(an, jahr)])
    .map(([k, pr]: [string, any]) => nameOf(k, pr));
}
