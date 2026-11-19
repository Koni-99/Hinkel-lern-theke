// ═══ Version 254: eigene Lernkarten der Azubis (der Ausbilder bestätigt) ═══
// Gespeichert im Fortschritt des Azubis: _eigeneKarten { k<ts>: { b: Begriff, e: Erklärung, f: Fach, ts, s: 'warte' | 'ok' | 'nein' } }.
// Der Azubi sieht seine Karten sofort (mit „wartet“), nach der Bestätigung sehen sie alle Azubis.
// Nur der Ausbilder schreibt s = 'ok' / 'nein' in den fremden Fortschritt.
import { CloudPayload } from '../types';

type Upd = (curr: CloudPayload) => CloudPayload;
export type EigeneKarte = { id: string; user: string; name: string; b: string; e: string; f: string; ts: number; s: 'warte' | 'ok' | 'nein' };
export const BEGRIFF_MAX = 80;
export const ERKLAERUNG_MAX = 400;

export function alleEigenenKarten(progress: CloudPayload['progress'] | undefined): EigeneKarte[] {
  const out: EigeneKarte[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    const m = pr && pr._eigeneKarten;
    if (!m || typeof m !== 'object' || k === 'admin') return;
    Object.entries(m).forEach(([id, x]: [string, any]) => {
      if (x && typeof x.b === 'string' && x.b.trim() && typeof x.e === 'string') out.push({ id, user: k, name: pr._displayName || k, b: x.b, e: x.e, f: x.f || 'Eigene Karten', ts: Number(x.ts) || 0, s: x.s === 'ok' || x.s === 'nein' ? x.s : 'warte' });
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
}

export const karteSchreiben = (userKey: string, name: string, begriff: string, erklaerung: string, fach: string, now = Date.now()): Upd => (curr) => {
  const b = begriff.trim().slice(0, BEGRIFF_MAX), e = erklaerung.trim().slice(0, ERKLAERUNG_MAX);
  if (!b || !e || !userKey || userKey === 'admin') return curr;
  const pr: any = curr.progress[userKey] || (curr.progress[userKey] = { _displayName: name });
  pr._eigeneKarten = { ...(pr._eigeneKarten || {}), [`k${now}`]: { b, e, f: fach, ts: now, s: 'warte' } };
  return curr;
};
export const karteEntscheiden = (userKey: string, id: string, ok: boolean): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._eigeneKarten || !pr._eigeneKarten[id]) return curr;
  pr._eigeneKarten = { ...pr._eigeneKarten, [id]: { ...pr._eigeneKarten[id], s: ok ? 'ok' : 'nein' } };
  return curr;
};
export const karteLoeschen = (userKey: string, id: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._eigeneKarten || !pr._eigeneKarten[id]) return curr;
  const n = { ...pr._eigeneKarten }; delete n[id]; pr._eigeneKarten = n;
  return curr;
};
