// ═══ Bausteine für Theken-Simulator und Telefon-Bestellung erzeugen (Google Text-to-Speech) ═══
// Spielt sehr viele Probe-Gespräche und -Anrufe durch, zerlegt jeden Kundensatz mit derselben Regel wie die App
// (src/hilfen/bausteine.ts) und erzeugt jeden Baustein einmal pro Kundenstimme als MP3 unter public/stimme/teile/.
// Schon vorhandene Dateien werden übersprungen. Am Ende: public/stimme/teile/index.json (Liste der Codes).
//
//   node tools/stimme/bausteine.mjs --zaehlen       nur zählen (wie viele Bausteine, Zeichen)
//   node tools/stimme/bausteine.mjs                  fehlende Bausteine erzeugen
//   --gespraeche 150000 --anrufe 150000              wie viele Proben (mehr = vollständiger)
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY && !process.env.GOOGLE_TTS_KEY) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ZIEL = path.join(ROOT, 'public/stimme/teile');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const N_GESPR = Number(opt('--gespraeche', '150000'));
const N_ANRUF = Number(opt('--anrufe', '150000'));

// App-Code übersetzen (im Projekt, damit react gefunden wird)
const tmp = path.join(ROOT, 'node_modules', `.lt-bausteine-${process.pid}`);
execFileSync(path.join(ROOT, 'node_modules/.bin/tsc'), [
  'src/games/theke/gespraech.tsx', 'src/games/telefonLogik.ts', 'src/hilfen/bausteine.ts',
  '--ignoreConfig', '--outDir', tmp, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--esModuleInterop', '--jsx', 'react-jsx', '--rootDir', 'src',
], { cwd: ROOT, stdio: 'inherit' });
const req = createRequire(import.meta.url);
const G = req(path.join(tmp, 'games/theke/gespraech.js'));
const T = req(path.join(tmp, 'games/telefonLogik.js'));
const B = req(path.join(tmp, 'hilfen/bausteine.js'));
rmSync(tmp, { recursive: true, force: true });

// Manche Sätze hängen von Uhrzeit, Wochentag oder Monat ab (z. B. „Guten Morgen“): darum die Uhr der Probe-Gespräche
// der Reihe nach über alle Stunden, Wochentage und Monate drehen
const EchtesDatum = Date;
let probeZeit = EchtesDatum.now();
globalThis.Date = class extends EchtesDatum {
  constructor(...a) { if (a.length) super(...a); else super(probeZeit); }
  static now() { return probeZeit; }
};
const stelleUhr = (i) => { const d = new EchtesDatum(2026, i % 12, 1 + (i % 28), 5 + (i % 17), (i * 7) % 60); probeZeit = d.getTime(); };
const teile = new Set();
const sammle = (text) => B.zerlege(text).forEach((t) => teile.add(t));
for (let i = 0; i < N_GESPR; i++) {
  stelleUhr(i);
  const c = G.buildConversation();
  c.steps.forEach((s) => { s.customer.forEach(sammle); if (s.afterWrong) sammle(s.afterWrong); });
  c.endLines.forEach(sammle);
  // Trinkgeld-Satz (steht im Simulator selbst)
  if (i % 50 === 0) [20, 30, 50, 100].forEach((ct) => ['Danke, war nett!', 'Sehr nett, danke!', 'Für Sie.'].forEach((s) => sammle(`${(ct / 100).toFixed(2).replace('.', ',')} € ${s}`)));
}
const nachGespr = teile.size;
globalThis.Date = EchtesDatum;
for (let i = 0; i < N_ANRUF; i++) {
  const b = T.neueBestellung(T.STUFEN_RUNDE[i % T.STUFEN_RUNDE.length], new Set(), i % 12);
  sammle(b.text.join(' '));
}
const zeichen = [...teile].reduce((a, t) => a + t.length, 0);
const stimmen = Object.values(B.KUNDEN_STIMMEN);
console.log(`${teile.size} Bausteine (Simulator ${nachGespr}, Telefon ${teile.size - nachGespr}), ${zeichen} Zeichen je Stimme, ${stimmen.length} Stimmen = ${zeichen * stimmen.length} Zeichen`);
if (args.includes('--zaehlen')) process.exit(0);

async function sprechen(text, stimme) {
  for (let versuch = 1; versuch <= 10; versuch++) {
    let res;
    try {
      res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { text }, voice: { languageCode: 'de-DE', name: stimme }, audioConfig: { audioEncoding: 'MP3' } }),
      });
    } catch { await new Promise((r) => setTimeout(r, 5000 * versuch)); continue; } // Verbindung kurz weg: nochmal
    if (res.ok) return Buffer.from((await res.json()).audioContent, 'base64');
    // Google erlaubt nur eine gewisse Zahl Anfragen pro Minute: dann geduldig warten
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 8000 * versuch)); continue; }
    throw new Error(`Google antwortet ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  throw new Error('Google antwortet nach 10 Versuchen nicht.');
}

mkdirSync(ZIEL, { recursive: true });
const auftrag = [];
for (const st of stimmen) for (const t of teile) { const k = B.teilKey(st, t); if (!existsSync(path.join(ZIEL, `${k}.mp3`))) auftrag.push([k, t, st]); }
console.log(`Erzeuge ${auftrag.length} neue Dateien …`);
let fertig = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (auftrag.length) {
    const [k, t, st] = auftrag.shift();
    await new Promise((r) => setTimeout(r, 600)); // höchstens etwa 250 Anfragen pro Minute
    try { writeFileSync(path.join(ZIEL, `${k}.mp3`), await sprechen(t, st)); }
    catch (e) { console.log('Übersprungen:', t, String(e.message).slice(0, 120)); continue; }
    if (++fertig % 200 === 0) console.log(`  ${fertig} fertig …`);
  }
}));
const gueltig = new Set(stimmen.flatMap((st) => [...teile].map((t) => B.teilKey(st, t))));
// Alle erzeugten Bausteine in die Liste (auch seltene aus früheren Durchläufen)
const vorhanden = readdirSync(ZIEL).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();
void gueltig;
writeFileSync(path.join(ZIEL, 'index.json'), JSON.stringify(vorhanden));
console.log(`Fertig: ${fertig} neue, ${vorhanden.length} Bausteine insgesamt in public/stimme/teile/`);
