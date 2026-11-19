// ═══ Täglicher Selbsttest der Online-App (Version 260) ═══
// Läuft jede Nacht auf GitHub (.github/workflows/selbsttest.yml) und prüft die echte Seite:
// Seite geht auf, Anmeldeseite erscheint, keine Fehler im Browser, Service Worker, Fotos und Stimmen sind erreichbar.
// Meldet sich NICHT an und schreibt nichts in die Datenbank.
// Aufruf: node tests/selbsttest.js [Adresse]   (Standard: https://koni-99.github.io/Hinkel-lern-theke/)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASIS = (process.argv[2] || 'https://koni-99.github.io/Hinkel-lern-theke/').replace(/\/?$/, '/');
const OEFFENTLICH = path.join(__dirname, '..', 'public');
const fehler = [];
const ok = (t) => console.log('  ok   ' + t);
const schlecht = (t) => { console.log('  FEHLER ' + t); fehler.push(t); };

/** Ein paar zufällige Dateien aus einem Ordner im Repo, die online auch da sein müssen */
const stichprobe = (ordner, n, endung) => {
  const d = path.join(OEFFENTLICH, ordner);
  if (!fs.existsSync(d)) return [];
  const alle = fs.readdirSync(d).filter((f) => f.endsWith(endung));
  return Array.from({ length: Math.min(n, alle.length) }, () => `${ordner}/${alle[Math.floor(Math.random() * alle.length)]}`);
};

async function erreichbar(datei) {
  for (let versuch = 1; versuch <= 3; versuch++) {
    try {
      const res = await fetch(BASIS + datei, { method: 'GET' });
      if (res.ok) { ok(`${datei} (${res.status})`); return; }
      if (versuch === 3) schlecht(`${datei} gibt ${res.status}`);
    } catch (e) { if (versuch === 3) schlecht(`${datei} nicht erreichbar: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 3000 * versuch));
  }
}

(async () => {
  console.log(`Selbsttest von ${BASIS}`);
  console.log('Dateien:');
  for (const f of ['index.html', 'sw.js', 'manifest.json', 'icon-192.png', 'start-kueken.png', 'stimme/teile/index.json',
    ...stichprobe('fotos', 3, '.jpg'), ...stichprobe('fotos/klein', 2, '.jpg'),
    ...stichprobe('stimme', 2, '.mp3'), ...stichprobe('stimme/saetze', 2, '.mp3'), ...stichprobe('stimme/teile', 2, '.mp3')]) await erreichbar(f);

  console.log('Browser:');
  const browser = await chromium.launch();
  for (const [name, viewport] of [['Handy', { width: 390, height: 844 }], ['PC', { width: 1280, height: 900 }]]) {
    const page = await browser.newPage({ viewport });
    const browserFehler = [];
    page.on('pageerror', (e) => browserFehler.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/firebase|googleapis|Failed to load resource|net::/i.test(m.text())) browserFehler.push(m.text()); });
    try {
      await page.goto(BASIS, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('#lt-name', { timeout: 45000 });
      ok(`${name}: Anmeldeseite erscheint`);
      const sw = await page.evaluate(async () => { try { const r = await Promise.race([navigator.serviceWorker.ready, new Promise((x) => setTimeout(() => x(null), 20000))]); return !!r; } catch { return false; } });
      sw ? ok(`${name}: Service Worker läuft (App geht ohne Internet auf)`) : schlecht(`${name}: Service Worker startet nicht`);
      const breit = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      breit <= 2 ? ok(`${name}: nichts steht seitlich über`) : schlecht(`${name}: Seite ist ${breit}px zu breit`);
    } catch (e) { schlecht(`${name}: Seite geht nicht auf (${e.message.split('\n')[0]})`); }
    if (browserFehler.length) browserFehler.slice(0, 5).forEach((t) => schlecht(`${name}: Fehler im Browser: ${t}`));
    else ok(`${name}: keine Fehler im Browser`);
    await page.close();
  }
  await browser.close();

  console.log(fehler.length ? `\n${fehler.length} Problem(e) gefunden.` : '\nAlles in Ordnung.');
  process.exit(fehler.length ? 1 : 0);
})();
