// ───────────── Cloud: alles zusammen (Laden, Speichern, Live-Updates) ─────────────
// Vorher alle 20 Sekunden die ganze Datenbank abgefragt. Jetzt hält die App eine Live-Verbindung:
// Änderungen von Kollegen sind sofort da, und in Ruhe fließen keine Daten.
// Klappt die Live-Verbindung nicht (z. B. Firmen-WLAN blockiert sie), wird wie bisher regelmäßig abgefragt.
import { useState, useEffect, useRef } from 'react';
import { CloudPayload } from '../types';
import { applyTombstones, mergePayloads, formatEndpointUrl, isFirebaseUrl, hasAdminSession, stripAdminOnly, forceTokenRefresh } from '../utils';
import { normalizePayload, cloneData, getRemote, patchRemote, buildPatch } from './remote';
import { openLive, LiveHandle, LiveFail } from './live';

/** Notschalter (und für Tests): localStorage „hinkel_no_live“ = „1“ schaltet die Live-Verbindung ab */
const liveDisabled = () => { try { return localStorage.getItem('hinkel_no_live') === '1'; } catch { return false; } };

export function useCloud(cloudUrl: string, emptyCloud: CloudPayload, isFast: () => boolean) {
  const [cloudData, setCloudData] = useState<CloudPayload>(() => {
    try {
      const cached = localStorage.getItem('hinkel_cloud_backup');
      return cached ? { ...emptyCloud, ...JSON.parse(cached) } : emptyCloud;
    } catch { return emptyCloud; }
  });

  const cloudDataRef = useRef<CloudPayload>(cloudData);
  useEffect(() => { cloudDataRef.current = cloudData; }, [cloudData]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [liveOn, setLiveOn] = useState(false);
  const syncQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const isFastRef = useRef(isFast);
  isFastRef.current = isFast;

  // Alle Cloud-Zugriffe laufen nacheinander. So überholen sich Abrufen und Speichern nicht.
  function enqueueSync<T>(task: () => Promise<T>): Promise<T> {
    const run = syncQueueRef.current.then(task, task);
    syncQueueRef.current = run.catch(() => undefined);
    return run;
  }

  // Zähler für Änderungen, die noch nicht in der Cloud sind, und Merker für fehlgeschlagenes Speichern (offline)
  const pendingWritesRef = useRef(0);
  const unsyncedRef = useRef<boolean>((() => { try { return localStorage.getItem('hinkel_unsynced') === '1'; } catch { return false; } })());
  const setUnsynced = (v: boolean) => {
    unsyncedRef.current = v;
    try { if (v) localStorage.setItem('hinkel_unsynced', '1'); else localStorage.removeItem('hinkel_unsynced'); } catch {}
  };

  const persistLocally = (payload: CloudPayload) => {
    cloudDataRef.current = payload;
    setCloudData(payload);
    try { localStorage.setItem('hinkel_cloud_backup', JSON.stringify(payload)); } catch {}
  };

  // Live-Stand, der während des Speicherns ankam (wird danach übernommen, siehe settleLive)
  const lastLiveRef = useRef<any>(null);
  const liveDirtyRef = useRef(false);

  // Abrufen: Die Cloud ist die Wahrheit. So kommen gelöschte Einträge (Nutzer, Bestenliste, Artikel …) nicht wieder zurück.
  // Nur wenn vorher offline gespeichert wurde, wird der lokale Stand einmal zusammengeführt und hochgeladen.
  const fetchCloudData = (customUrl?: string): Promise<CloudPayload | null> => {
    const targetUrl = formatEndpointUrl(customUrl !== undefined ? customUrl : cloudUrl);
    if (!targetUrl) { setCloudConnected(false); return Promise.resolve(null); }
    return enqueueSync(async () => {
      if (pendingWritesRef.current > 0) return cloudDataRef.current; // gleich wird sowieso gespeichert
      try {
        const remote = await getRemote(targetUrl);
        if (!remote) throw new Error('Nicht erreichbar');
        let next = remote;
        if (unsyncedRef.current) {
          next = mergePayloads(cloudDataRef.current, remote);
          if (await patchRemote(targetUrl, remote, next)) setUnsynced(false);
        }
        persistLocally(next);
        setCloudConnected(true);
        return next;
      } catch {
        setCloudConnected(false);
        return null;
      }
    });
  };

  // Nach dem Speichern: Kam währenddessen etwas live an und steckt die eigene Änderung schon darin,
  // wird dieser Stand übernommen. Sonst kommt die eigene Änderung gleich als Live-Meldung zurück.
  const settleLive = () => {
    if (!liveDirtyRef.current || !lastLiveRef.current) return;
    liveDirtyRef.current = false;
    if (unsyncedRef.current) return;
    const live = normalizePayload(JSON.parse(JSON.stringify(lastLiveRef.current)));
    const diff = buildPatch(live, cloudDataRef.current);
    const left = hasAdminSession() ? diff : stripAdminOnly(diff);
    if (Object.keys(left).length === 0) persistLocally(live);
  };

  // Speichern: Die Änderung wird sofort lokal angezeigt und danach auf den frischen Cloud-Stand angewendet.
  // So gehen weder Änderungen von Kollegen verloren noch kommen Löschungen zurück.
  const mutateCloudData = (updater: (current: CloudPayload) => CloudPayload) => {
    persistLocally(updater(cloneData(cloudDataRef.current)));
    const targetUrl = formatEndpointUrl(cloudUrl);
    if (!targetUrl) return;
    pendingWritesRef.current += 1;
    enqueueSync(async () => {
      setIsSyncing(true);
      try {
        let finalPayload = cloudDataRef.current;
        let gotRemote = false;
        let baseRemote: CloudPayload | null = null;
        try {
          const remote = await getRemote(targetUrl);
          if (remote) {
            baseRemote = cloneData(remote);
            finalPayload = applyTombstones(unsyncedRef.current
              ? updater(mergePayloads(cloudDataRef.current, remote))
              : updater(remote));
            gotRemote = true;
          }
        } catch {}
        const ok = gotRemote && !!baseRemote && await patchRemote(targetUrl, baseRemote, finalPayload);
        if (ok) { setUnsynced(false); persistLocally(finalPayload); }
        else setUnsynced(true);
        setCloudConnected(ok);
      } catch {
        setUnsynced(true);
        setCloudConnected(false);
      } finally {
        pendingWritesRef.current = Math.max(0, pendingWritesRef.current - 1);
        setIsSyncing(false);
        if (pendingWritesRef.current === 0) settleLive();
      }
    });
  };

  // Neuer Live-Stand von Firebase
  const applyLive = (raw: any) => {
    lastLiveRef.current = raw;
    if (pendingWritesRef.current > 0) { liveDirtyRef.current = true; return; } // nach dem Speichern übernehmen
    if (unsyncedRef.current) { fetchCloudData(); return; } // offline Gespeichertes erst zusammenführen und hochladen
    persistLocally(normalizePayload(raw));
    setCloudConnected(true);
  };
  const applyLiveRef = useRef(applyLive);
  applyLiveRef.current = applyLive;
  const fetchRef = useRef(fetchCloudData);
  fetchRef.current = fetchCloudData;

  useEffect(() => {
    if (!cloudUrl) return;
    const target = formatEndpointUrl(cloudUrl);
    const fetchNow = () => fetchRef.current();
    const canLive = !!target && isFirebaseUrl(target) && typeof EventSource !== 'undefined' && !liveDisabled();
    let disposed = false;
    let live: LiveHandle | null = null;
    let liveOk = false;       // Live-Verbindung hat Daten geliefert
    let connecting = false;
    let gen = 0;              // Nummer der aktuellen Verbindung (alte Meldungen ignorieren)
    let failures = 0;
    let lastAuthRetry = 0;
    let retryTimer = 0, openTimer = 0;
    let lastPoll = Date.now();

    const markLive = (on: boolean) => {
      liveOk = on; setLiveOn(on);
      try { document.documentElement.dataset.cloudLive = on ? '1' : '0'; } catch {}
    };
    const closeLive = () => {
      gen++;
      window.clearTimeout(openTimer);
      if (live) live.close();
      live = null; connecting = false;
      markLive(false);
    };
    const fail = (why: LiveFail) => {
      closeLive();
      if (disposed) return;
      window.clearTimeout(retryTimer);
      // Anmeldung abgelaufen (nach einer Stunde): frischen Schlüssel holen und gleich neu verbinden
      if (why === 'auth' && Date.now() - lastAuthRetry > 15000) {
        lastAuthRetry = Date.now();
        forceTokenRefresh();
        connect();
        return;
      }
      // Sofort wie bisher laden, damit nichts fehlt, und die Live-Verbindung später nochmal versuchen
      lastPoll = Date.now(); fetchNow();
      failures++;
      const wait = why === 'cancel' ? 60000 : Math.min(60000, 5000 * 2 ** Math.min(failures - 1, 4));
      retryTimer = window.setTimeout(connect, wait);
    };
    async function connect() {
      if (!canLive || disposed || live || connecting || document.hidden) return;
      connecting = true;
      const my = ++gen;
      const h = await openLive(target, {
        onData: (raw) => {
          if (my !== gen) return;
          if (!liveOk) { markLive(true); failures = 0; window.clearTimeout(openTimer); }
          applyLiveRef.current(raw);
        },
        onFail: (why) => { if (my === gen) fail(why); },
      });
      if (my !== gen || disposed || document.hidden) { if (h) h.close(); if (my === gen) connecting = false; return; }
      connecting = false;
      if (!h) { fail('error'); return; }
      live = h;
      // Kommt nicht schnell genug etwas an: wie bisher abrufen, damit die Daten sofort da sind
      openTimer = window.setTimeout(() => { if (!liveOk && my === gen) { lastPoll = Date.now(); fetchNow(); } }, 4000);
    }

    if (canLive) connect();
    else fetchNow();

    // Ersatzweg ohne Live-Verbindung: nur abfragen, solange die App sichtbar ist (spart Datenvolumen und Akku).
    // Alle 20 Sekunden, im Quiz Battle alle 5 Sekunden, und sofort beim Zurückkehren in die App.
    const interval = window.setInterval(() => {
      if (document.hidden || liveOk) return;
      const fast = isFastRef.current();
      if (Date.now() - lastPoll < (fast ? 5000 : 20000)) return;
      lastPoll = Date.now(); fetchNow();
    }, 2500);
    const onVisible = () => {
      // App im Hintergrund: Verbindung trennen (Akku). Beim Zurückkehren neu aufbauen, dabei kommt der ganze Stand.
      if (document.hidden) { if (canLive) { closeLive(); window.clearTimeout(retryTimer); } return; }
      if (canLive) { if (!live && !connecting) { failures = 0; connect(); } }
      else { lastPoll = Date.now(); fetchNow(); }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    // Sobald das Gerät wieder Netz hat: sofort abgleichen, offline Gespeichertes wird dabei nachgeschickt
    const onOnline = () => {
      if (!canLive || unsyncedRef.current) fetchNow();
      if (canLive && !live && !connecting) { window.clearTimeout(retryTimer); failures = 0; connect(); }
    };
    window.addEventListener('online', onOnline);
    return () => {
      disposed = true;
      closeLive();
      window.clearTimeout(retryTimer);
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('online', onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudUrl]);

  return { cloudData, cloudDataRef, isSyncing, cloudConnected, setCloudConnected, liveOn, unsyncedRef, fetchCloudData, mutateCloudData };
}
