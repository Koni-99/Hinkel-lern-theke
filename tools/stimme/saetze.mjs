// ═══ Vorlese-Sätze erzeugen: Steckbrief, Produktkarte, Bilderquiz, Schneide-Profi, Allergene (Google Text-to-Speech) ═══
// Baut alle Vorlese-Texte mit denselben Funktionen wie die App (src/hilfen/vorlesen.ts), zerlegt sie in Sätze
// und erzeugt jeden Satz einmal mit Frau 4 (Achernar) als MP3 unter public/stimme/saetze/. Vorhandenes wird übersprungen.
//   node tools/stimme/saetze.mjs --zaehlen     nur zählen
//   node tools/stimme/saetze.mjs               fehlende Sätze erzeugen
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY && !process.env.GOOGLE_TTS_KEY) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ZIEL = path.join(ROOT, 'public/stimme/saetze');
const args = process.argv.slice(2);

const tmp = path.join(ROOT, 'node_modules', `.lt-saetze-${process.pid}`);
execFileSync(path.join(ROOT, 'node_modules/.bin/tsc'), [
  'src/hilfen/vorlesen.ts', 'src/games/allergenDaten.ts', 'src/components/karteikarten/daten.tsx', 'src/daten/questions.ts', 'src/components/AlternativenJaegerView.tsx',
  '--ignoreConfig', '--outDir', tmp, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--esModuleInterop', '--jsx', 'react-jsx', '--rootDir', 'src',
], { cwd: ROOT, stdio: 'inherit' });
const req = createRequire(import.meta.url);
const V = req(path.join(tmp, 'hilfen/vorlesen.js'));
const A = req(path.join(tmp, 'games/allergenDaten.js'));
const K = req(path.join(tmp, 'components/karteikarten/daten.js'));
const { SHOP_PRODUCTS } = req(path.join(tmp, 'daten/shopProducts.js'));
const Q = req(path.join(tmp, 'daten/questions.js'));
const ALT = req(path.join(tmp, 'components/AlternativenJaegerView.js'));
rmSync(tmp, { recursive: true, force: true });

const saetze = new Map(); // code → Satz
const dazu = (text, stimme = V.VORLESE_STIMME) => V.saetze(text).forEach((s) => saetze.set(V.satzKey(s, stimme), [s, stimme]));
const MM = ['5,5 mm', '9 mm', '12 mm'];
for (const sp of SHOP_PRODUCTS) {
  dazu(V.steckbriefText(sp));
  const slice = sp.breadType && K.BREAD_TYPES[sp.breadType] ? K.BREAD_TYPES[sp.breadType].slice : '';
  const facts = [sp.flour ? ['Mehl', sp.flour] : null, slice ? ['Schnitt', slice] : null, sp.weight ? ['Gewicht', sp.weight] : null, sp.price ? ['Preis', sp.price] : null].filter(Boolean);
  dazu(V.produktKarteText(sp.name, facts, sp));
  dazu(V.produktKarteVorne(sp.name));
  // Lernkarten sprechen abwechselnd (Version 239): dieselben Sätze zusätzlich in der Stimme der Karte
  dazu(V.produktKarteText(sp.name, facts, sp), V.karteStimme(sp.name));
  dazu(V.produktKarteVorne(sp.name), V.karteStimme(sp.name));
  dazu(V.bilderText(sp));
  if (sp.breadType) MM.forEach((mm) => dazu(V.schneideText(sp.name, mm)));
}
for (const t of A.ALLERGEN_TESTS) {
  const { withIt, without } = A.splitByAllergen(t);
  for (const mode of ['safe', 'contains']) {
    if (mode === 'safe' && !t.safeRounds) continue;
    const q = V.allergenFrage(t, mode); dazu(`${q.who} ${q.quote} ${q.ask}`);
    const antworten = mode === 'safe' ? without : withIt;
    antworten.forEach((p) => dazu(V.allergenNachher(t, mode, p, [p])));
  }
  [...withIt, ...without].forEach((p) => { [1, 2, 3, 4].forEach((i) => dazu(`${i}: ${p.name}`)); dazu(`${p.name}: ${p.allergens.join(', ')}`); });
}
// Quiz und Adventskalender vor der Antwort: Frage, Buchstaben, Antwort-Möglichkeiten
for (const q of [...(Q.questions || []), ...(Q.examQuestions || [])]) dazu(V.quizVorherText(q.question, q.options));
// Wörterbuch Englisch: ganzer Eintrag als eine Datei, britische Stimme
for (const d of K.DICT_ALL) { const t = d.say || d.en; saetze.set(V.englischKey(t), [t, V.ENGLISCH_STIMME]); }
// Alternativen-Jäger (mehrmals, weil die falschen Antworten zufällig gewählt werden)
for (let i = 0; i < 20; i++) ALT.alternativenTexte().forEach((t) => dazu(t));
const zeichen = [...saetze.values()].reduce((a, [s]) => a + s.length, 0);
console.log(`${saetze.size} Sätze, ${zeichen} Zeichen (Stimme ${V.VORLESE_STIMME})`);
if (args.includes('--zaehlen')) process.exit(0);

async function sprechen(text, stimme) {
  for (let versuch = 1; versuch <= 10; versuch++) {
    let res;
    try {
      res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { text: `${text}.` }, voice: { languageCode: stimme.slice(0, 5), name: stimme }, audioConfig: { audioEncoding: 'MP3' } }) });
    } catch { await new Promise((r) => setTimeout(r, 5000 * versuch)); continue; }
    if (res.ok) return Buffer.from((await res.json()).audioContent, 'base64');
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 8000 * versuch)); continue; }
    throw new Error(`Google antwortet ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  throw new Error('Google antwortet nach 10 Versuchen nicht.');
}
mkdirSync(ZIEL, { recursive: true });
const auftrag = [...saetze].filter(([k]) => !existsSync(path.join(ZIEL, `${k}.mp3`)));
console.log(`Erzeuge ${auftrag.length} neue Dateien …`);
let fertig = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (auftrag.length) {
    const [k, [s, st]] = auftrag.shift();
    await new Promise((r) => setTimeout(r, 600));
    try { writeFileSync(path.join(ZIEL, `${k}.mp3`), await sprechen(s, st)); } catch (e) { console.log('Übersprungen:', s.slice(0, 60), String(e.message).slice(0, 100)); continue; }
    if (++fertig % 200 === 0) console.log(`  ${fertig} fertig …`);
  }
}));
const vorhanden = readdirSync(ZIEL).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).filter((k) => saetze.has(k)).sort();
writeFileSync(path.join(ZIEL, 'index.json'), JSON.stringify(vorhanden));
console.log(`Fertig: ${fertig} neue, ${vorhanden.length} Sätze insgesamt in public/stimme/saetze/`);
