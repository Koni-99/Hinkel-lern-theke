// ───────────── Cloud: Live-Verbindung zu Firebase ─────────────
// Firebase kann Änderungen über eine offene Verbindung schicken (REST-Streaming, „EventSource“).
// Beim Verbinden kommt einmal der ganze Stand („put“ auf „/“), danach nur noch die geänderten Stellen.
// Kein zusätzliches npm-Paket nötig, der Browser kann das von sich aus.
import { withAuth } from '../hilfen/anmeldung';

export type LiveFail = 'error' | 'cancel' | 'auth';
export type LiveHandle = { close: () => void };

/** Schreibt einen Wert an eine Stelle wie „/progress/anna“ in den Datenbaum (null = löschen). */
export function setAtPath(tree: any, path: string, value: any): any {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return value;
  const root = tree && typeof tree === 'object' ? tree : {};
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!node[p] || typeof node[p] !== 'object') {
      if (value === null) return root; // Löschen von etwas, das es nicht gibt
      node[p] = {};
    }
    node = node[p];
  }
  const last = parts[parts.length - 1];
  if (value === null) {
    if (Array.isArray(node) && /^\d+$/.test(last)) node[Number(last)] = undefined;
    else delete node[last];
  } else if (Array.isArray(node) && /^\d+$/.test(last)) node[Number(last)] = value;
  else node[last] = value;
  return root;
}

/** Live-Verbindung öffnen. onData bekommt nach jeder Änderung den ganzen aktuellen Stand (als eigene Kopie). */
export async function openLive(url: string, h: { onData: (raw: any) => void; onFail: (why: LiveFail) => void }): Promise<LiveHandle | null> {
  if (typeof EventSource === 'undefined') return null;
  let es: EventSource;
  try { es = new EventSource(await withAuth(url)); } catch { return null; }
  let tree: any = null;
  let closed = false;
  let timer = 0;
  const close = () => {
    if (closed) return;
    closed = true;
    window.clearTimeout(timer);
    try { es.close(); } catch {}
  };
  const fail = (why: LiveFail) => { if (closed) return; close(); h.onFail(why); };
  // Mehrere Änderungen im selben Moment nur einmal an die App geben
  const emit = () => {
    if (timer) return;
    timer = window.setTimeout(() => {
      timer = 0;
      if (!closed) h.onData(tree === null || tree === undefined ? {} : JSON.parse(JSON.stringify(tree)));
    }, 40);
  };
  const read = (e: Event): { path: string; data: any } | null => {
    try { const d = JSON.parse((e as MessageEvent).data); return d && typeof d.path === 'string' ? d : null; } catch { return null; }
  };
  es.addEventListener('put', (e) => {
    const d = read(e); if (!d) return;
    tree = setAtPath(tree, d.path, d.data);
    emit();
  });
  es.addEventListener('patch', (e) => {
    const d = read(e); if (!d || !d.data || typeof d.data !== 'object') return;
    const base = d.path.replace(/\/$/, '');
    Object.keys(d.data).forEach((k) => { tree = setAtPath(tree, `${base}/${k}`, d.data[k]); });
    emit();
  });
  // Firebase beendet die Verbindung: keine Leserechte mehr (cancel) oder Anmeldung abgelaufen (auth_revoked)
  es.addEventListener('cancel', () => fail('cancel'));
  es.addEventListener('auth_revoked', () => fail('auth'));
  // Verbindung abgerissen oder blockiert. Der Browser würde es selbst mit dem alten Anmelde-Schlüssel
  // neu versuchen, darum schließen wir und bauen sie selbst mit frischem Schlüssel neu auf.
  es.onerror = () => fail('error');
  return { close };
}
