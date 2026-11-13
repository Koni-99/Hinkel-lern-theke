// ───────────── Cloud: Laden und Speichern (Firebase-REST) ─────────────
// Reine Funktionen ohne React. Vorher lag dieser Teil mitten in App.tsx.
import { CloudPayload } from '../types';
import { applyTombstones, dedupeScores, scoreKey } from '../hilfen/zusammenfuehren';
import { hasAdminSession, stripAdminOnly, withAdminAuth, isFirebaseUrl } from '../hilfen/anmeldung';

/** Firebase speichert Listen als Objekt mit Zahlen-Schlüsseln, wenn Lücken entstehen. Beides wird zur Liste. */
const toList = (v: any): any[] => {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (v && typeof v === 'object') return Object.keys(v).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b)).map(k => v[k]).filter(Boolean);
  return [];
};

// Bringt die Rohdaten aus der Cloud in eine saubere Form (leere Datenbank → leere Struktur)
export const normalizePayload = (data: any): CloudPayload => applyTombstones({
  scores: dedupeScores(toList(data?.scores)),
  progress: data?.progress || {},
  lastSeen: data?.lastSeen || {},
  battles: data?.battles || {},
  wrongStats: data?.wrongStats || {},
  pinboard: data?.pinboard || null,
  customProducts: toList(data?.customProducts),
  customQuestions: toList(data?.customQuestions),
  tombstones: data?.tombstones || {},
  questionEdits: data?.questionEdits || {},
  productFixes: data?.productFixes || {},
  pins: data?.pins || {},
  ...(Number(data?.compactedUntil) > 0 ? { compactedUntil: Number(data.compactedUntil) } : {})
});

export const cloneData = (d: CloudPayload): CloudPayload => JSON.parse(JSON.stringify(d));

export const getRemote = async (targetUrl: string): Promise<CloudPayload | null> => {
  const sep = targetUrl.includes('?') ? '&' : '?';
  const res = await fetch(await withAdminAuth(`${targetUrl}${sep}t=${Date.now()}`), { method: 'GET', headers: { 'Accept': 'application/json' } });
  if (!res.ok) return null;
  return normalizePayload(await res.json());
};

export const putRemote = async (targetUrl: string, payload: CloudPayload): Promise<boolean> => {
  const usePut = isFirebaseUrl(targetUrl) || /\.json($|\?)/.test(targetUrl);
  const res = await fetch(await withAdminAuth(targetUrl), { method: usePut ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.ok;
};

// Nur die geänderten Stellen schreiben. Vorher wurde immer die ganze Datenbank überschrieben:
// Wenn zwei Kollegen gleichzeitig speicherten, war die Änderung des einen weg.
// Pro Person (progress/anna, lastSeen/anna …) wird jetzt einzeln geschrieben.
const PER_KEY = ['progress', 'lastSeen', 'battles', 'wrongStats', 'tombstones', 'questionEdits', 'productFixes', 'pins'];
export const buildPatch = (base: any, next: any): Record<string, any> => {
  const out: Record<string, any> = {};
  const same = (a: any, b: any) => JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
  const isObj = (v: any) => !!v && typeof v === 'object' && !Array.isArray(v);
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(next || {})]);
  keys.forEach(k => {
    const a = base ? base[k] : undefined, b = next ? next[k] : undefined;
    if (same(a, b)) return;
    if (PER_KEY.includes(k) && isObj(a) && isObj(b)) {
      new Set([...Object.keys(a), ...Object.keys(b)]).forEach(ck => { if (!same(a[ck], b[ck])) out[`${k}/${ck}`] = b[ck] === undefined ? null : b[ck]; });
    } else out[k] = b === undefined ? null : b;
  });
  return out;
};

export const patchRemote = async (targetUrl: string, base: CloudPayload, next: CloudPayload): Promise<boolean> => {
  const fullPatch = buildPatch(base, next);
  // Mitarbeiter schreiben keine Ausbilder-Bereiche (die Datenbankregeln würden sonst die ganze Änderung ablehnen)
  const patch = hasAdminSession() ? fullPatch : stripAdminOnly(fullPatch);
  if (Object.keys(patch).length === 0) return true;
  if (isFirebaseUrl(targetUrl)) {
    try {
      const res = await fetch(await withAdminAuth(targetUrl), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      if (res.ok) {
        // Bestenliste ist eine Liste: speichern zwei Leute im selben Moment, kann ein neuer Eintrag überschrieben werden.
        // Darum kurz nachsehen, ob die eigenen neuen Einträge angekommen sind, sonst noch einmal anhängen.
        const added = (next.scores || []).slice((base.scores || []).length);
        const onlyAppended = 'scores' in patch && added.length > 0 && JSON.stringify((next.scores || []).slice(0, (base.scores || []).length)) === JSON.stringify(base.scores || []);
        for (let tries = 0; onlyAppended && tries < 6; tries++) {
          // kurz und zufällig warten, damit zwei Geräte nicht wieder genau gleichzeitig schreiben
          await new Promise(r => window.setTimeout(r, 250 + Math.random() * 650));
          const fresh = await getRemote(targetUrl);
          if (!fresh) break;
          // Vergleich über die Eintrags-ID: Firebase liefert die Felder alphabetisch sortiert zurück,
          // ein Vergleich des ganzen Textes hätte jeden Eintrag fälschlich als „fehlt“ erkannt.
          const have = new Set((fresh.scores || []).map(x => scoreKey(x)));
          const missing = added.filter(x => !have.has(scoreKey(x)));
          if (missing.length === 0) break;
          const fix = await fetch(await withAdminAuth(targetUrl), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scores: [...(fresh.scores || []), ...missing] }) });
          if (!fix.ok) break;
        }
        return true;
      }
    } catch { /* unten mit PUT versuchen */ }
  }
  return putRemote(targetUrl, next);
};
