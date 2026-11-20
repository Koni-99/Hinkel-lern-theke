// ═══ Service Worker der Lern-Theke ═══
// Speichert die App-Dateien auf dem Gerät, damit die App auch ohne Internet aufgeht.
// Wird beim Bauen erzeugt (vite.config.ts): Versionsnummer und Dateiliste werden dabei eingesetzt.
// Regeln:
// - Seite (index.html): zuerst aus dem Netz (immer die neueste Version), ohne Netz die gespeicherte.
// - App-Dateien (assets/…): aus dem Speicher, sie haben eindeutige Namen und ändern sich nie.
// - Tondateien (stimme/…): NICHT anfassen, der Browser lädt sie stückweise. Ohne Netz liest die Handy-Stimme.
// - Firebase, Wetter und alles von anderen Adressen: wird NICHT angefasst.
const VERSION = '__VERSION__';
const FOTOS = 'lern-theke-fotos-1';
const FILES = __FILES__;
const CACHE = 'lern-theke-' + VERSION;
const SCOPE = new URL(self.registration.scope);
const INDEX = new URL('index.html', SCOPE).href;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // App-Dateien (assets/…) ändern sich nie: schon gespeicherte aus der alten Version übernehmen, nur Neues laden
      .then((c) => Promise.all(FILES.map((f) => {
        const u = new URL(f, SCOPE).href;
        return (f.startsWith('assets/') ? caches.match(u) : Promise.resolve(undefined))
          .then((alt) => (alt ? c.put(u, alt) : c.add(u)));
      })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('lern-theke-') && k !== CACHE && k !== FOTOS).map((k) => caches.delete(k))))
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
    // Version 266: auch die Spiele „Zum Abschalten“ (abschalten/index.html, im iframe) sind eine eigene Seite.
    // Nur die App-Seite selbst wird als INDEX gespeichert, andere Seiten unter ihrer eigenen Adresse.
    const unterseite = url.pathname.includes('/abschalten/');
    const schluessel = unterseite ? new URL('abschalten/index.html', SCOPE).href : INDEX;
    e.respondWith(
      fetchMitZeitlimit(req, 5000)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(schluessel, copy)); }
          return res;
        })
        .catch(() => caches.match(schluessel).then((hit) => hit || Response.error()))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && url.pathname.includes('/assets/')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      // Produktfotos (public/fotos) in einem eigenen Speicher, der bei neuen Versionen bleibt
      else if (res.ok && url.pathname.includes('/fotos/')) { const copy = res.clone(); caches.open(FOTOS).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
