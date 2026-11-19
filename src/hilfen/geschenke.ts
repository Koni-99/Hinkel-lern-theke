// ═══ Laden-Extras (Version 226): Geschenke an Kollegen und Serien-Schutz ═══
// Wie Kollegen-Lob: jeder schreibt nur in seinen eigenen Fortschritt.
//   Schenkender:  progress/<name>/_geschenke        { g<ts>: { an, anName, j (Joker), ts } }  + bezahlt über _tipSpent
//   Beschenkter:  progress/<name>/_geschenkeErhalten { <code>: ts }  + schreibt sich den Joker selbst gut
//   Serien-Schutz: progress/<name>/_jokersSchutz (Anzahl), _schutzTage (geschützte Tage)
import { CloudPayload } from '../types';
import { TIP_SHOP, JOKER_FIELD } from '../basis/laden';
import { verpassteTage } from '../basis/serie';
import { urlaubsTage } from './urlaub';

type Upd = (curr: CloudPayload) => CloudPayload;
const prOf = (curr: CloudPayload, k: string, name: string): any => curr.progress[k] || (curr.progress[k] = { _displayName: name });

/** Diese Joker kann man verschenken (zum normalen Preis, kein Tagesangebot) */
export const GESCHENK_JOKER = ['j_los', 'j_5050', 'j_swap', 'j_time', 'j_spin', 'j_schutz', 'j_double'];
export const GESCHENKE_PRO_TAG = 3;
export type Geschenk = { an: string; anName: string; j: string; ts: number };
export type GeschenkEintrag = Geschenk & { id: string; von: string; vonName: string };

const tagVon = (ts: number) => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
export const geschenkKey = (von: string, id: string) => {
  const s = `${von}|${id}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `g${h.toString(36)}${id.replace(/[^a-z0-9]/gi, '')}`;
};
export const jokerVon = (id: string) => TIP_SHOP.find((i) => i.id === id && i.kind === 'joker');

export function alleGeschenke(progress: CloudPayload['progress'] | undefined): GeschenkEintrag[] {
  const out: GeschenkEintrag[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    const m = pr && pr._geschenke;
    if (!m || typeof m !== 'object') return;
    Object.entries(m).forEach(([id, g]: [string, any]) => {
      if (g && typeof g.an === 'string' && g.an !== k && GESCHENK_JOKER.includes(g.j)) out.push({ ...g, id, von: k, vonName: (pr && pr._displayName) || k });
    });
  });
  return out.sort((a, b) => a.ts - b.ts);
}
export const geschenkeHeute = (progress: CloudPayload['progress'] | undefined, userKey: string, now = Date.now()) =>
  alleGeschenke(progress).filter((g) => g.von === userKey && tagVon(g.ts) === tagVon(now)).length;

/** Noch nicht angenommene Geschenke an mich (älteste zuerst) */
export function offeneGeschenke(progress: CloudPayload['progress'] | undefined, userKey: string): GeschenkEintrag[] {
  const erhalten = (((progress || {})[userKey] as any)?._geschenkeErhalten) || {};
  return alleGeschenke(progress).filter((g) => g.an === userKey && !erhalten[geschenkKey(g.von, g.id)]);
}

export const geschenkSchicken = (userKey: string, name: string, an: string, anName: string, jokerId: string, now = Date.now()): Upd => (curr) => {
  const j = jokerVon(jokerId);
  if (!j || !GESCHENK_JOKER.includes(jokerId) || !an || an === userKey || an === 'admin') return curr;
  if (geschenkeHeute(curr.progress, userKey, now) >= GESCHENKE_PRO_TAG) return curr;
  const pr = prOf(curr, userKey, name);
  const balance = (Number(pr._tipCents) || 0) - (Number(pr._tipSpent) || 0);
  if (balance < j.price) return curr;
  pr._tipSpent = (Number(pr._tipSpent) || 0) + j.price;
  // nur die letzten 30 eigenen Geschenke behalten
  const alt = Object.entries(pr._geschenke || {}).sort((a: any, b: any) => (b[1].ts || 0) - (a[1].ts || 0)).slice(0, 29);
  pr._geschenke = { ...Object.fromEntries(alt), [`g${now}`]: { an, anName, j: jokerId, ts: now } };
  return curr;
};

/** Beschenkter nimmt an: Joker wird im eigenen Fortschritt gutgeschrieben (genau einmal) */
export const geschenkAnnehmen = (userKey: string, name: string, g: GeschenkEintrag, now = Date.now()): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  const key = geschenkKey(g.von, g.id);
  if ((pr._geschenkeErhalten || {})[key]) return curr;
  const f = JOKER_FIELD[g.j];
  if (!f) return curr;
  pr[f] = (Number(pr[f]) || 0) + 1;
  pr._geschenkeErhalten = { ...(pr._geschenkeErhalten || {}), [key]: now };
  return curr;
};

/** Serien-Schutz automatisch einsetzen: verpasste Tage schützen, wenn genug Joker da sind. Gibt die Anzahl zurück. */
export function schutzNoetig(pr: any, now = new Date()): string[] {
  const days: string[] = Array.isArray(pr?._days) ? pr._days : [];
  // Urlaubstage (Version 251) zählen wie geschützt, dafür wird kein Joker verbraucht
  const schutz: string[] = [...(Array.isArray(pr?._schutzTage) ? pr._schutzTage : []), ...urlaubsTage(pr)];
  const fehlt = verpassteTage(days, schutz, now);
  const joker = Number(pr?._jokersSchutz) || 0;
  return fehlt.length > 0 && fehlt.length <= joker ? fehlt : [];
}
export const schutzEinsetzen = (userKey: string, name: string, now = new Date()): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  const tage = schutzNoetig(pr, now);
  if (!tage.length) return curr;
  pr._jokersSchutz = (Number(pr._jokersSchutz) || 0) - tage.length;
  pr._schutzTage = [...new Set([...(Array.isArray(pr._schutzTage) ? pr._schutzTage : []), ...tage])].sort().slice(-60);
  return curr;
};
