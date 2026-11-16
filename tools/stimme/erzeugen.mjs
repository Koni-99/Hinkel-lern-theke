// ═══ Tondateien für Hör-Lernen erzeugen (Google Text-to-Speech) ═══
// Liest alle Fragen der App, erzeugt für jede Frage und jede Antwort eine MP3-Datei unter public/stimme/
// und schreibt public/stimme/index.json (Liste der vorhandenen Dateien). Schon vorhandene Dateien werden
// übersprungen, ein zweiter Lauf erzeugt also nur neue oder geänderte Texte.
//
//   node tools/stimme/erzeugen.mjs                  alle fehlenden Dateien erzeugen
//   node tools/stimme/erzeugen.mjs --nur 20         nur 20 Stück (zum Ausprobieren)
//   node tools/stimme/erzeugen.mjs --muster <ordner> Hörproben mehrerer Stimmen in <ordner>
//   --stimme de-DE-Chirp3-HD-Aoede                  andere Stimme wählen
//
// Schlüssel: Umgebungsvariable GOOGLE_TTS_KEY, oder er wird vom Netzwerk-Proxy eingefügt (Claude-Umgebung).
import { execFileSync, spawnSync } from 'node:child_process';

// In der Claude-Umgebung fügt der Netzwerk-Vermittler den Schlüssel ein. Node schickt fetch() nur mit
// NODE_USE_ENV_PROXY=1 über ihn, darum das Werkzeug in diesem Fall einmal mit dieser Einstellung neu starten.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY && !process.env.GOOGLE_TTS_KEY) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}
import { mkdirSync, existsSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ZIEL = path.join(ROOT, 'public/stimme');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
// Gemischt (Wunsch des Nutzers): Frau 4 Achernar, Mann 10 Iapetus, Frau 10 Laomedeia, Mann 18 Studio-B.
// Jede Frage bekommt der Reihe nach eine der Stimmen, Frage und Antwort in derselben Stimme.
const STIMMEN = opt('--stimme', 'de-DE-Chirp3-HD-Achernar,de-DE-Chirp3-HD-Iapetus,de-DE-Chirp3-HD-Laomedeia,de-DE-Studio-B').split(',');
const STIMME = STIMMEN[0];
const NUR = Number(opt('--nur', '0')) || 0;
const MUSTER = opt('--muster', '');

// App-Code (Fragen + Text-Regeln) einmal übersetzen, damit die Texte genau gleich sind wie in der App
const tmp = path.join(os.tmpdir(), `lt-stimme-${process.pid}`);
execFileSync(path.join(ROOT, 'node_modules/.bin/tsc'), [
  'src/daten/questions.ts', 'src/daten/data.ts', 'src/daten/shopProducts.ts', 'src/hilfen/stimme.ts', 'src/hilfen/allgemein.ts',
  '--ignoreConfig', '--outDir', tmp, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--esModuleInterop', '--rootDir', 'src',
], { cwd: ROOT, stdio: 'inherit' });
const req = createRequire(import.meta.url);
const Q = req(path.join(tmp, 'daten/questions.js'));
const { hoerTexte, stimmeKey } = req(path.join(tmp, 'hilfen/stimme.js'));
rmSync(tmp, { recursive: true, force: true });

async function sprechen(text, stimme = STIMME) {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_TTS_KEY) headers['X-Goog-Api-Key'] = process.env.GOOGLE_TTS_KEY;
  for (let versuch = 1; versuch <= 4; versuch++) {
    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST', headers,
      body: JSON.stringify({ input: { text }, voice: { languageCode: 'de-DE', name: stimme }, audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 } }),
    });
    if (res.ok) return Buffer.from((await res.json()).audioContent, 'base64');
    const msg = await res.text();
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2000 * versuch)); continue; }
    throw new Error(`Google antwortet ${res.status}: ${msg.slice(0, 300)}`);
  }
  throw new Error('Google antwortet nach 4 Versuchen nicht.');
}

if (MUSTER) {
  mkdirSync(MUSTER, { recursive: true });
  const probe = 'Auf welche Schnittstärke werden unsere Schwarzbrote an der Brotschneidemaschine geschnitten? ... Die Antwort: auf fünfeinhalb Millimeter. Schwarzbrot schneiden wir besonders dünn, weil es so saftig und kompakt ist.';
  for (const s of ['de-DE-Chirp3-HD-Aoede', 'de-DE-Chirp3-HD-Kore', 'de-DE-Chirp3-HD-Leda', 'de-DE-Chirp3-HD-Achernar', 'de-DE-Chirp3-HD-Charon', 'de-DE-Chirp3-HD-Puck', 'de-DE-Chirp3-HD-Orus', 'de-DE-Chirp3-HD-Enceladus']) {
    try { writeFileSync(path.join(MUSTER, `${s}.mp3`), await sprechen(probe, s)); console.log('Hörprobe:', s); }
    catch (e) { console.log('Nicht verfügbar:', s, String(e.message).slice(0, 120)); }
  }
  process.exit(0);
}

const texte = new Map(); // code → [Text, Stimme]
[...(Q.questions || []), ...(Q.examQuestions || [])].forEach((q, i) => {
  const t = hoerTexte(q); const stimme = STIMMEN[i % STIMMEN.length];
  [t.frage, t.antwort].forEach((x) => { if (x && !texte.has(stimmeKey(x))) texte.set(stimmeKey(x), [x, stimme]); });
});
// --aufraeumen: Dateien löschen, die zu keiner Frage mehr gehören (z. B. nach geänderten Fragen), ohne Google
if (args.includes('--aufraeumen')) {
  const ziel = path.join(ROOT, 'public/stimme');
  const weg = readdirSync(ziel).filter((f) => f.endsWith('.mp3') && !texte.has(f.slice(0, -4)));
  weg.forEach((f) => rmSync(path.join(ziel, f)));
  console.log(`${weg.length} alte Dateien gelöscht, ${texte.size} Texte gehören dazu.`);
  process.exit(0);
}
if (args.includes('--zaehlen')) {
  const z = {}; for (const [, [t, st]] of texte) z[st] = (z[st] || 0) + t.length;
  console.log(texte.size, 'Texte, Zeichen je Stimme:', z, 'zusammen', Object.values(z).reduce((a, b) => a + b, 0));
  process.exit(0);
}
mkdirSync(ZIEL, { recursive: true });
const fehlend = [...texte].filter(([k]) => !existsSync(path.join(ZIEL, `${k}.mp3`)));
const auftrag = NUR ? fehlend.slice(0, NUR) : fehlend;
console.log(`${texte.size} Texte, ${texte.size - fehlend.length} schon vorhanden, erzeuge jetzt ${auftrag.length} (Stimmen ${STIMMEN.join(', ')})`);
let fertig = 0, zeichen = 0;
const arbeiter = Array.from({ length: 4 }, async () => {
  while (auftrag.length) {
    const [k, [t, stimme]] = auftrag.shift();
    writeFileSync(path.join(ZIEL, `${k}.mp3`), await sprechen(t, stimme));
    fertig++; zeichen += t.length;
    if (fertig % 50 === 0) console.log(`  ${fertig} fertig …`);
  }
});
await Promise.all(arbeiter);
const vorhanden = readdirSync(ZIEL).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).filter((k) => texte.has(k)).sort();
writeFileSync(path.join(ZIEL, 'index.json'), JSON.stringify(vorhanden));
console.log(`Fertig: ${fertig} neue Dateien (${zeichen} Zeichen), ${vorhanden.length} insgesamt in public/stimme/`);
