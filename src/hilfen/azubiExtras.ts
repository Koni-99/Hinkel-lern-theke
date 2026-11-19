// ═══ Version 256: Azubi-Bereich, weitere Teile ═══
// Frage an den Ausbilder (privat), Mein Wochenziel, Lehrjahr-Rückblick (immer zu den Sommerferien).
// Gespeichert im Fortschritt des Azubis:
//   _azubiFragen { f<ts>: { q, ts, a?, aTs?, gesehen? } }   (Antwort schreibt nur der Ausbilder)
//   _wochenziel  { 'JJJJ-MM-TT' (Montag): { t, ok?: true | false } }
//   _rueckblick  'JJJJ' (Jahr, in dem der Rückblick schon gezeigt wurde)
import { CloudPayload } from '../types';

type Upd = (curr: CloudPayload) => CloudPayload;
const prOf = (curr: CloudPayload, k: string, name: string): any => curr.progress[k] || (curr.progress[k] = { _displayName: name });

// ── Frage an den Ausbilder ──
export const FRAGE_MAX = 400;
export type AzubiFrage = { id: string; user: string; name: string; q: string; ts: number; a?: string; aTs?: number; gesehen?: boolean };

export function alleAzubiFragen(progress: CloudPayload['progress'] | undefined): AzubiFrage[] {
  const out: AzubiFrage[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    if (k === 'admin' || !pr || !pr._azubiFragen) return;
    Object.entries(pr._azubiFragen).forEach(([id, x]: [string, any]) => {
      if (x && typeof x.q === 'string' && x.q.trim()) out.push({ id, user: k, name: pr._displayName || k, q: x.q, ts: Number(x.ts) || 0, a: x.a, aTs: x.aTs, gesehen: !!x.gesehen });
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
}
export const frageStellen = (userKey: string, name: string, text: string, now = Date.now()): Upd => (curr) => {
  const q = text.trim().slice(0, FRAGE_MAX);
  if (!q || !userKey || userKey === 'admin') return curr;
  const pr = prOf(curr, userKey, name);
  pr._azubiFragen = { ...(pr._azubiFragen || {}), [`f${now}`]: { q, ts: now } };
  return curr;
};
export const frageBeantworten = (userKey: string, id: string, antwort: string, now = Date.now()): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  const a = antwort.trim().slice(0, FRAGE_MAX);
  if (!pr || !pr._azubiFragen || !pr._azubiFragen[id] || !a) return curr;
  pr._azubiFragen = { ...pr._azubiFragen, [id]: { ...pr._azubiFragen[id], a, aTs: now, gesehen: false } };
  return curr;
};
export const antwortenGelesen = (userKey: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._azubiFragen) return curr;
  pr._azubiFragen = Object.fromEntries(Object.entries(pr._azubiFragen).map(([id, x]: [string, any]) => [id, x && x.a ? { ...x, gesehen: true } : x]));
  return curr;
};
export const frageLoeschen = (userKey: string, id: string): Upd => (curr) => {
  const pr: any = curr.progress[userKey];
  if (!pr || !pr._azubiFragen || !pr._azubiFragen[id]) return curr;
  const n = { ...pr._azubiFragen }; delete n[id]; pr._azubiFragen = n;
  return curr;
};

// ── Mein Wochenziel ──
export const ZIEL_MAX = 120;
export type Wochenziel = { t: string; ok?: boolean };
export const zieleVon = (pr: any): Record<string, Wochenziel> => (pr && pr._wochenziel && typeof pr._wochenziel === 'object' ? pr._wochenziel : {});
export const zielSetzen = (userKey: string, name: string, woche: string, text: string): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  const t = text.trim().slice(0, ZIEL_MAX);
  const alt = { ...zieleVon(pr) };
  if (t) alt[woche] = { ...(alt[woche] || {}), t }; else delete alt[woche];
  pr._wochenziel = Object.fromEntries(Object.entries(alt).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 52));
  return curr;
};
export const zielBewerten = (userKey: string, name: string, woche: string, ok: boolean): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  const alt = zieleVon(pr);
  if (!alt[woche]) return curr;
  pr._wochenziel = { ...alt, [woche]: { ...alt[woche], ok } };
  return curr;
};

// ── Lehrjahr-Rückblick: in den Sommerferien (NRW, ungefähr Juli und August) ──
export const istRueckblickZeit = (d = new Date()) => d.getMonth() === 6 || d.getMonth() === 7;
/** Beginn des Ausbildungsjahres, auf das zurückgeblickt wird (1. August des Vorjahres) */
export const lehrjahrBeginn = (d = new Date()) => new Date(d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1, 7, 1);

export type Rueckblick = { lerntage: number; planOk: number; planGesamt: number; zieleGeschafft: number; zieleGesamt: number; zpBest: number; apBest: number; kartenGelernt: number; eigeneKarten: number };
export function rueckblick(pr: any, planIds: string[], d = new Date()): Rueckblick {
  const ab = lehrjahrBeginn(d);
  const abK = `${ab.getFullYear()}-${String(ab.getMonth() + 1).padStart(2, '0')}-01`;
  const days: string[] = Array.isArray(pr?._days) ? pr._days : [];
  const ziele = Object.entries(zieleVon(pr)).filter(([w]) => w >= abK).map(([, z]) => z);
  const kasten = pr?._lernkasten || {};
  return {
    lerntage: days.filter((x) => typeof x === 'string' && x >= abK).length,
    planOk: planIds.filter((id) => (pr?._azubiPlan || {})[id] && (pr?._azubiOk || {})[id]).length,
    planGesamt: planIds.length,
    zieleGeschafft: ziele.filter((z) => z.ok === true).length,
    zieleGesamt: ziele.length,
    zpBest: Number(pr?._exam?.ZP?.best) || 0,
    apBest: Number(pr?._exam?.AP?.best) || 0,
    kartenGelernt: Object.entries(kasten).filter(([k, f]) => k.startsWith('bs') && Number(f) >= 4).length,
    eigeneKarten: Object.values(pr?._eigeneKarten || {}).filter((x: any) => x && x.s === 'ok').length,
  };
}
