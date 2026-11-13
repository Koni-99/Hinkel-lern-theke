// ═══ Kundenfragen und Verkaufstipps von Kollegen ═══
// Gespeichert im eigenen Fortschritt jedes Mitarbeiters (progress/<name>/_kfragen und /_tipps),
// genau wie der „Spruch des Tages“. Dort dürfen Mitarbeiter schon schreiben, die Firebase-Regeln
// müssen deshalb nicht geändert werden. Der Ausbilder beantwortet bzw. gibt frei.
import { CloudPayload } from '../types';

/** Eine Frage, die ein Kunde an der Theke gestellt hat */
export type KFrage = { q: string; ts: number; a?: string; aTs?: number; seen?: boolean };
/** Ein Verkaufstipp zu einem Produkt. status: pending = wartet, ok = freigegeben, no = abgelehnt */
export type Tipp = { p: string; t: string; ts: number; status: 'pending' | 'ok' | 'no' };

export type KFrageEintrag = KFrage & { id: string; user: string; name: string };
export type TippEintrag = Tipp & { id: string; user: string; name: string };

export const KFRAGE_MAX = 300;
export const TIPP_MAX = 280;

const nameOf = (k: string, pr: any) => (pr && pr._displayName) || k;

/** Alle Kundenfragen aller Mitarbeiter, neueste zuerst */
export function alleKundenfragen(progress: CloudPayload['progress'] | undefined): KFrageEintrag[] {
  const out: KFrageEintrag[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    const m = pr && pr._kfragen;
    if (!m || typeof m !== 'object') return;
    Object.entries(m).forEach(([id, f]: [string, any]) => {
      if (f && typeof f.q === 'string' && f.q.trim()) out.push({ ...f, id, user: k, name: nameOf(k, pr) });
    });
  });
  return out.sort((a, b) => (b.aTs || b.ts) - (a.aTs || a.ts));
}

/** Alle Verkaufstipps aller Mitarbeiter, neueste zuerst (optional nur ein Produkt / ein Status) */
export function alleTipps(progress: CloudPayload['progress'] | undefined, produkt?: string, status?: Tipp['status']): TippEintrag[] {
  const out: TippEintrag[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    const m = pr && pr._tipps;
    if (!m || typeof m !== 'object') return;
    Object.entries(m).forEach(([id, t]: [string, any]) => {
      if (!t || typeof t.t !== 'string' || !t.t.trim() || typeof t.p !== 'string') return;
      if (produkt && t.p !== produkt) return;
      if (status && t.status !== status) return;
      out.push({ ...t, id, user: k, name: nameOf(k, pr) });
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
}

// ── Änderungen (als Funktionen für mutateCloudData) ──
type Upd = (curr: CloudPayload) => CloudPayload;
const prOf = (curr: CloudPayload, k: string, name: string): any => curr.progress[k] || (curr.progress[k] = { _displayName: name });

export const kfrageStellen = (userKey: string, name: string, text: string, now = Date.now()): Upd => (curr) => {
  const q = text.trim().slice(0, KFRAGE_MAX);
  if (!q) return curr;
  const pr = prOf(curr, userKey, name);
  pr._kfragen = { ...(pr._kfragen || {}), [`k${now}`]: { q, ts: now } };
  return curr;
};
export const kfrageBeantworten = (userKey: string, id: string, antwort: string, now = Date.now()): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  const f = pr && pr._kfragen && pr._kfragen[id];
  if (!f) return curr;
  pr._kfragen = { ...pr._kfragen, [id]: { ...f, a: antwort.trim().slice(0, 1000), aTs: now, seen: false } };
  return curr;
};
export const kfrageLoeschen = (userKey: string, id: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._kfragen || !pr._kfragen[id]) return curr;
  const next = { ...pr._kfragen }; delete next[id];
  pr._kfragen = next;
  return curr;
};
/** Mitarbeiter hat die Antworten auf seine Fragen gesehen */
export const kfragenGesehen = (userKey: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._kfragen) return curr;
  let changed = false;
  const next: Record<string, KFrage> = {};
  Object.entries(pr._kfragen).forEach(([id, f]: [string, any]) => { if (f && f.a && !f.seen) { changed = true; next[id] = { ...f, seen: true }; } else next[id] = f; });
  if (changed) pr._kfragen = next;
  return curr;
};

export const tippGeben = (userKey: string, name: string, produkt: string, text: string, now = Date.now()): Upd => (curr) => {
  const t = text.trim().slice(0, TIPP_MAX);
  if (!t || !produkt) return curr;
  const pr = prOf(curr, userKey, name);
  pr._tipps = { ...(pr._tipps || {}), [`t${now}`]: { p: produkt, t, ts: now, status: 'pending' } };
  return curr;
};
export const tippEntscheiden = (userKey: string, id: string, ok: boolean): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  const t = pr && pr._tipps && pr._tipps[id];
  if (!t) return curr;
  pr._tipps = { ...pr._tipps, [id]: { ...t, status: ok ? 'ok' : 'no' } };
  return curr;
};
export const tippLoeschen = (userKey: string, id: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._tipps || !pr._tipps[id]) return curr;
  const next = { ...pr._tipps }; delete next[id];
  pr._tipps = next;
  return curr;
};
