// ═══ Stille vorne und hinten aus den Tondateien schneiden (Version 279) ═══
// Google setzt an jede Datei etwa 0,4 s Stille vorne und 0,1–0,2 s hinten. Werden mehrere Stücke hintereinander
// gespielt (Kundensätze aus Bausteinen, Vorlesen Satz für Satz), klingt das abgehackt. Übrig bleiben 30 ms vorne
// und 50 ms hinten. Braucht ffmpeg, kein Internet und keinen Google-Schlüssel.
//
//   node tools/stimme/stille.mjs          alle Dateien unter public/stimme/ einmalig kürzen
//   (die Erzeuger erzeugen.mjs, saetze.mjs, bausteine.mjs kürzen neue Dateien selbst über stilleWeg)
import { execFileSync, execFile } from 'node:child_process';
import { readdirSync, existsSync, writeFileSync, renameSync, statSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const FILTER = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,'
  + 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse';
const AUS = ['-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '40k', '-f', 'mp3'];

/** Nimmt eine MP3 (Buffer) von Google und gibt sie ohne Stille vorne/hinten zurück. Ohne ffmpeg unverändert. */
export function stilleWeg(mp3) {
  try {
    return execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', '-af', FILTER, ...AUS, 'pipe:1'], { input: mp3, maxBuffer: 64 * 1024 * 1024 });
  } catch { return mp3; }
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const MARKE = path.join(ROOT, 'tools/stimme/.stille-erledigt');

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (existsSync(MARKE) && !process.argv.includes('--nochmal')) {
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
  let fertig = 0, vorher = 0, nachher = 0, fehler = 0;
  const lauf = (f) => new Promise((ok) => {
    const tmp = `${f}.tmp`;
    execFile('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', f, '-af', FILTER, ...AUS, tmp], (err) => {
      if (err || !existsSync(tmp) || statSync(tmp).size < 500) { fehler++; rmSync(tmp, { force: true }); ok(); return; }
      vorher += statSync(f).size; nachher += statSync(tmp).size;
      renameSync(tmp, f);
      if (++fertig % 1000 === 0) console.log(`  ${fertig} fertig …`);
      ok();
    });
  });
  const warte = [...dateien];
  await Promise.all(Array.from({ length: Math.max(2, os.cpus().length) }, async () => { while (warte.length) await lauf(warte.shift()); }));
  writeFileSync(MARKE, `${new Date().toISOString()} ${fertig} Dateien\n`);
  console.log(`Fertig: ${fertig} gekürzt, ${fehler} unverändert, ${(vorher / 1e6).toFixed(0)} MB → ${(nachher / 1e6).toFixed(0)} MB`);
}
