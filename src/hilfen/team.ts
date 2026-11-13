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

// ── Lob unter Kollegen ──
// Der Absender speichert das Lob in seinem Fortschritt (_kollegenLob). Der Gelobte schreibt sich die
// Punkte selbst gut, sobald seine App das Lob sieht (_lobGutgeschrieben). So schreibt niemand für andere.
// (Nicht verwechseln mit _lob: das ist das Lob vom Ausbilder, das als Pop-up erscheint.)
export type KLob = { an: string; anName: string; t: string; ts: number };
export type KLobEintrag = KLob & { id: string; von: string; vonName: string };
export const LOB_PUNKTE = 10;
export const LOB_MAX = 140;
const tagVon = (ts: number) => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

export function alleLobs(progress: CloudPayload['progress'] | undefined): KLobEintrag[] {
  const out: KLobEintrag[] = [];
  Object.entries(progress || {}).forEach(([k, pr]: [string, any]) => {
    const m = pr && pr._kollegenLob;
    if (!m || typeof m !== 'object') return;
    Object.entries(m).forEach(([id, l]: [string, any]) => {
      if (l && typeof l.t === 'string' && l.t.trim() && typeof l.an === 'string' && l.an !== k) out.push({ ...l, id, von: k, vonName: (pr && pr._displayName) || k });
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
}
/** Hat dieser Mitarbeiter heute schon jemanden gelobt? */
export const heuteSchonGelobt = (progress: CloudPayload['progress'] | undefined, userKey: string, now = Date.now()) =>
  alleLobs(progress).some((l) => l.von === userKey && tagVon(l.ts) === tagVon(now));

export const lobSchicken = (userKey: string, name: string, an: string, anName: string, text: string, now = Date.now()): Upd => (curr) => {
  const t = text.trim().slice(0, LOB_MAX);
  if (!t || !an || an === userKey || heuteSchonGelobt(curr.progress, userKey, now)) return curr;
  const pr = prOf(curr, userKey, name);
  // nur die letzten 30 eigenen Lobe behalten
  const alt = Object.entries(pr._kollegenLob || {}).sort((a: any, b: any) => (b[1].ts || 0) - (a[1].ts || 0)).slice(0, 29);
  pr._kollegenLob = { ...Object.fromEntries(alt), [`l${now}`]: { an, anName, t, ts: now } };
  return curr;
};
/** Noch nicht gutgeschriebene Lobe an mich */
export function offeneLobPunkte(progress: CloudPayload['progress'] | undefined, userKey: string): KLobEintrag[] {
  const done = (progress && progress[userKey] && (progress[userKey] as any)._lobGutgeschrieben) || {};
  return alleLobs(progress).filter((l) => l.an === userKey && !done[`${l.von}_${l.id}`]);
}
export const lobPunkteGutschreiben = (userKey: string, name: string, lobs: KLobEintrag[], now = Date.now()): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  const done: Record<string, number> = { ...(pr._lobGutgeschrieben || {}) };
  const datum = new Date(now).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  lobs.forEach((l, i) => {
    const k = `${l.von}_${l.id}`;
    if (done[k]) return;
    done[k] = now;
    curr.scores.push({ id: `${userKey}_lob_${now + i}`, username: name, score: LOB_PUNKTE, date: datum, category: 'Lob von Kollegen' });
  });
  pr._lobGutgeschrieben = done;
  return curr;
};
export const lobLoeschen = (vonKey: string, id: string): Upd => (curr) => {
  const pr: any = curr.progress[vonKey];
  if (!pr || !pr._kollegenLob || !pr._kollegenLob[id]) return curr;
  const next = { ...pr._kollegenLob }; delete next[id];
  pr._kollegenLob = next;
  return curr;
};

// ── Eigene Notiz im Steckbrief (nur für einen selbst) ──
// Produktnamen können Zeichen enthalten, die Firebase als Schlüssel nicht erlaubt. Darum ein kurzer Code als Schlüssel.
export const NOTIZ_MAX = 300;
export const notizKey = (produkt: string) => { let h = 0; for (let i = 0; i < produkt.length; i++) h = (h * 31 + produkt.charCodeAt(i)) >>> 0; return `n${h.toString(36)}`; };
export function meineNotizen(progress: CloudPayload['progress'] | undefined, userKey: string): Record<string, string> {
  const m = progress && progress[userKey] && (progress[userKey] as any)._notizen;
  const out: Record<string, string> = {};
  if (m && typeof m === 'object') Object.values(m).forEach((n: any) => { if (n && typeof n.p === 'string' && typeof n.t === 'string' && n.t.trim()) out[n.p] = n.t; });
  return out;
}
export const notizSpeichern = (userKey: string, name: string, produkt: string, text: string, now = Date.now()): Upd => (curr) => {
  const pr = prOf(curr, userKey, name);
  const next = { ...(pr._notizen || {}) };
  const t = text.trim().slice(0, NOTIZ_MAX);
  if (t) next[notizKey(produkt)] = { p: produkt, t, ts: now }; else delete next[notizKey(produkt)];
  pr._notizen = next;
  return curr;
};
