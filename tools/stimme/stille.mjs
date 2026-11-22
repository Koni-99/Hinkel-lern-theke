// ═══ Stille vorne und hinten aus den Tondateien schneiden (Version 280) ═══
// Google setzt an jede Datei etwa 0,4 s Stille vorne und 0,1–0,2 s hinten. Werden mehrere Stücke hintereinander
// gespielt (Kundensätze aus Bausteinen, Vorlesen Satz für Satz), klingt das abgehackt.
// Version 279 hatte dafür den ffmpeg-Filter „silenceremove“ benutzt: der schnitt bei jeder fünften Datei auch
// leise Wortenden ab („gerne“ → „gerr“). Jetzt wird genau gemessen: erste und letzte Stelle, an der wirklich
// etwas zu hören ist (jeder Ausschlag über -46 dB), davor bleiben 150 ms, dahinter 200 ms. Sprache wird nie gekürzt,
// und die Datei wird nicht neu kodiert (Neu-Kodieren dämpft leise Laute).
// Braucht ffmpeg, kein Internet und keinen Google-Schlüssel.
//
//   node tools/stimme/stille.mjs          alle Dateien unter public/stimme/ einmalig kürzen
//   (die Erzeuger erzeugen.mjs, saetze.mjs, bausteine.mjs kürzen neue Dateien selbst über stilleWeg)
import { execFileSync, execFile } from 'node:child_process';
import { readdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const RATE = 24000;
const GRENZE = 0.005 * 32768; // -46 dB: jeder einzelne Ausschlag darüber zählt als hörbar (auch leise Wortenden)
const VORNE = 0.15, HINTEN = 0.2; // vorne 3 MP3-Stücke: das erste nach dem Schnitt bleibt beim Abspielen stumm
// Ohne Neu-Kodieren: die MP3-Stücke (je 48 ms) werden nur weggelassen, der Klang bleibt genau wie von Google
const AUS = ['-c', 'copy', '-f', 'mp3'];

/** Wo beginnt und endet hörbare Sprache? (Sekunden) */
function grenzen(pcm) {
  const x = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  let a = 0; while (a < x.length && Math.abs(x[a]) <= GRENZE) a++;
  let e = x.length - 1; while (e > a && Math.abs(x[e]) <= GRENZE) e--;
  return { start: a / RATE, ende: e / RATE, laenge: x.length / RATE };
}
const dekodiere = ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', '-f', 's16le', '-ac', '1', '-ar', String(RATE), 'pipe:1'];
function schnitt(g) {
  const von = Math.max(0, g.start - VORNE), bis = Math.min(g.laenge, g.ende + HINTEN);
  if (g.ende <= g.start || (von < 0.03 && g.laenge - bis < 0.03)) return null; // nichts zu kürzen
  return ['-ss', von.toFixed(3), '-to', bis.toFixed(3)];
}

/** Nimmt eine MP3 (Buffer) von Google und gibt sie ohne lange Stille vorne/hinten zurück. Ohne ffmpeg unverändert. */
export function stilleWeg(mp3) {
  try {
    const f = schnitt(grenzen(execFileSync('ffmpeg', dekodiere, { input: mp3, maxBuffer: 256 * 1024 * 1024 })));
    if (!f) return mp3;
    return execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', ...f, ...AUS, 'pipe:1'], { input: mp3, maxBuffer: 64 * 1024 * 1024 });
  } catch { return mp3; }
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const MARKE = path.join(ROOT, 'tools/stimme/.stille-erledigt');
const lauf = (args, input) => new Promise((ok, nein) => {
  const p = execFile('ffmpeg', args, { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 }, (err, out) => (err ? nein(err) : ok(out)));
  p.stdin.end(input);
});

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (existsSync(MARKE) && readFileSync(MARKE, 'utf8').includes('v2') && !process.argv.includes('--nochmal')) {
    console.log('Schon erledigt (alle Dateien sind gekürzt). Neue Dateien kürzen die Erzeuger selbst.');
    process.exit(0);
  }
  const dateien = [];
  const suche = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) suche(p); else if (e.name.endsWith('.mp3')) dateien.push(p);
  });
  suche(path.join(ROOT, 'public/stimme'));
  console.log(`${dateien.length} Dateien kürzen …`);
  let fertig = 0, gleich = 0, fehler = 0, gespart = 0;
  const eine = async (f) => {
    try {
      const mp3 = readFileSync(f);
      const g = grenzen(await lauf(dekodiere, mp3));
      const s = schnitt(g);
      if (!s) { gleich++; return; }
      const neu = await lauf(['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', ...s, ...AUS, 'pipe:1'], mp3);
      if (neu.length < 300) { fehler++; return; }
      writeFileSync(f, neu);
      gespart += g.laenge - (Math.min(g.laenge, g.ende + HINTEN) - Math.max(0, g.start - VORNE));
      if (++fertig % 1000 === 0) console.log(`  ${fertig} fertig …`);
    } catch { fehler++; }
  };
  const warte = [...dateien];
  await Promise.all(Array.from({ length: Math.max(2, os.cpus().length) }, async () => { while (warte.length) await eine(warte.shift()); }));
  writeFileSync(MARKE, `v2 ${new Date().toISOString()} ${fertig} Dateien\n`);
  console.log(`Fertig: ${fertig} gekürzt, ${gleich} ohne lange Stille, ${fehler} Fehler, im Schnitt ${(gespart / Math.max(1, fertig)).toFixed(2)} s Stille weniger je Datei`);
}
