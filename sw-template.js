// ═══ Service Worker der Lern-Theke ═══
// Speichert die App-Dateien auf dem Gerät, damit die App auch ohne Internet aufgeht.
// Wird beim Bauen erzeugt (vite.config.ts): Versionsnummer und Dateiliste werden dabei eingesetzt.
// Regeln:
// - Seite (index.html): zuerst aus dem Netz (immer die neueste Version), ohne Netz die gespeicherte.
// - App-Dateien (assets/…): aus dem Speicher, sie haben eindeutige Namen und ändern sich nie.
// - Tondateien (stimme/…): NICHT anfassen, der Browser lädt sie stückweise. Ohne Netz liest die Handy-Stimme.
// - Firebase, Wetter und alles von anderen Adressen: wird NICHT angefasst.
const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = 'lern-theke-' + VERSION;
const SCOPE = new URL(self.registration.scope);
const INDEX = new URL('index.html', SCOPE).href;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new URL(f, SCOPE).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('lern-theke-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Netz mit Zeitlimit: bei sehr schlechtem Empfang nicht ewig warten
const fetchMitZeitlimit = (req, ms) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('Zeitlimit')), ms);
  fetch(req).then((r) => { clearTimeout(t); resolve(r); }, (err) => { clearTimeout(t); reject(err); });
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  if (url.pathname.includes('/stimme/')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetchMitZeitlimit(req, 5000)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(INDEX, copy)); }
          return res;
        })
        .catch(() => caches.match(INDEX).then((hit) => hit || Response.error()))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && url.pathname.includes('/assets/')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
