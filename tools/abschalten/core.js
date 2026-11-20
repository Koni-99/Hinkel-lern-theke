// ═══ Zum Abschalten: gemeinsame Grundlage (Leinwand, Schleife, Effekte, hochwertige Zeichnungen) ═══
// Logische Fläche 360 × 480, wird scharf auf die echte Größe skaliert.
const W = 360, H = 480;
const c = document.getElementById('c'), x = c.getContext('2d');
const feld = document.getElementById('feld'), hud = document.getElementById('hud'), ueber = document.getElementById('ueber');
let SKAL = 1;
function groesse(){ const dpr = Math.min(2.5, devicePixelRatio || 1); c.width = Math.round(feld.clientWidth * dpr); c.height = Math.round(feld.clientHeight * dpr); SKAL = c.width / W; x.setTransform(SKAL, 0, 0, c.height / H, 0, 0); x.imageSmoothingQuality = 'high'; }
addEventListener('resize', groesse);
const ohneBewegung = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Farben der Bäckerei ──
const F = {
  gold: '#FFC72C', goldDunkel: '#C98A00', creme: '#FFF6E4', papier: '#FFFBF2', braun: '#4B2A14', ink: '#2B170A',
  kruste: '#B8742E', krusteDunkel: '#7A4418', krume: '#F4D9A6', roggen: '#6E3F1E', mehl: 'rgba(255,250,240,.85)',
  gruen: '#2F9A47', rot: '#D0402A', holz: '#B07A45', holzDunkel: '#7C5128', stahl: '#9AA6B2'
};

// ── Hilfen ──
const zufall = (a, b) => a + Math.random() * (b - a);
const ganz = (a, b) => Math.floor(zufall(a, b + 1));
const klemm = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = { aus: (t) => 1 - Math.pow(1 - t, 3), ein: (t) => t * t * t, feder: (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2), huepf: (t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; } };
/** Weg mit runden Ecken */
function rr(px, py, w, h, r){ r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
function linear(x1, y1, x2, y2, stops){ const g = x.createLinearGradient(x1, y1, x2, y2); stops.forEach(([o, f]) => g.addColorStop(o, f)); return g; }
function radial(px, py, r0, r1, stops, ox, oy){ const g = x.createRadialGradient(ox ?? px, oy ?? py, r0, px, py, r1); stops.forEach(([o, f]) => g.addColorStop(o, f)); return g; }
/** Weicher Schatten für das nächste Füllen */
function schatten(blur, oy, farbe){ x.shadowColor = farbe || 'rgba(40,20,5,.35)'; x.shadowBlur = blur * SKAL; x.shadowOffsetY = (oy || 0) * SKAL; x.shadowOffsetX = 0; }
function ohneSchatten(){ x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0; }
/** Bodenschatten (Ellipse) */
function bodenSchatten(px, py, rx, ry, a){ x.fillStyle = radial(px, py, 0, rx, [[0, `rgba(40,20,5,${a ?? .35})`], [1, 'rgba(40,20,5,0)']]); x.beginPath(); x.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2); x.fill(); }
/** Text mit leichtem Schatten */
function text(t, px, py, { gr = 16, farbe = F.ink, art = '800', schrift = 'Plus Jakarta Sans', ausr = 'center', schat = true } = {}){
  x.font = `${art} ${gr}px "${schrift}", system-ui, sans-serif`; x.textAlign = ausr; x.textBaseline = 'middle';
  if (schat) { x.fillStyle = 'rgba(40,20,5,.25)'; x.fillText(t, px, py + 1.5); }
  x.fillStyle = farbe; x.fillText(t, px, py);
}
/** Holz mit Maserung */
function holz(px, py, w, h, r = 6, hell = F.holz, dunkel = F.holzDunkel){
  rr(px, py, w, h, r); x.fillStyle = linear(0, py, 0, py + h, [[0, hell], [1, dunkel]]); x.fill();
  x.save(); rr(px, py, w, h, r); x.clip(); x.strokeStyle = 'rgba(70,40,15,.18)'; x.lineWidth = 1;
  for (let i = 0; i < h / 5; i++) { const yy = py + 3 + i * 5; x.beginPath(); x.moveTo(px, yy); for (let k = 0; k <= w; k += 20) x.lineTo(px + k, yy + Math.sin((k + i * 37) * .05) * 1.5); x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(px, py, w, 2); x.restore();
}
/** Weiche Vignette über das ganze Bild */
function vignette(a = .28){ x.fillStyle = radial(W / 2, H / 2, H * .35, H * .8, [[0, 'rgba(30,15,5,0)'], [1, `rgba(30,15,5,${a})`]]); x.fillRect(0, 0, W, H); }
/** Lichtkegel von oben (Backstuben-Lampe) */
function lampe(px, py, breite, a = .22){ x.fillStyle = linear(0, py, 0, py + 260, [[0, `rgba(255,236,180,${a})`], [1, 'rgba(255,236,180,0)']]); x.beginPath(); x.moveTo(px - 14, py); x.lineTo(px + 14, py); x.lineTo(px + breite, py + 260); x.lineTo(px - breite, py + 260); x.closePath(); x.fill(); }

// ── Brote, hochwertig gezeichnet ──
// art: 'laib' (dunkles rundes Roggenbrot), 'krusti' (helles ovales mit Schnitten), 'broetchen', 'brezel', 'baguette', 'stuten'
// opt.ton: 0 = roh/blass, 1 = perfekt, 2 = verbrannt; opt.rot: Drehung
function brot(art, cx, cy, w, h, opt = {}){
  const ton = opt.ton ?? 1;
  x.save(); x.translate(cx, cy); if (opt.rot) x.rotate(opt.rot);
  if (opt.schatten !== false) bodenSchatten(0, h * .48, w * .55, h * .16, .3);
  if (art === 'brezel') { brezelForm(w, ton); x.restore(); return; }
  const basis = ton === 0 ? ['#F7E6C4', '#E9CC97', '#D9B57A'] : ton === 2 ? ['#6B4A33', '#3A2516', '#1E130B']
    : art === 'laib' ? ['#A8693A', '#7A4418', '#4F2A10'] : art === 'baguette' ? ['#E6B064', '#C27F36', '#8E5520'] : art === 'stuten' ? ['#E9A85C', '#C2742E', '#8A4C1C'] : ['#E3AE68', '#BE7B37', '#8A5223'];
  // Grundform
  x.beginPath();
  if (art === 'baguette') rr(-w / 2, -h / 2, w, h, h / 2);
  else if (art === 'stuten') { rr(-w / 2, -h / 2 + h * .18, w, h * .82, 6); x.moveTo(-w / 2 + 3, -h / 2 + h * .25); x.quadraticCurveTo(0, -h / 2 - h * .15, w / 2 - 3, -h / 2 + h * .25); }
  else x.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  x.fillStyle = radial(0, h * .1, 2, Math.max(w, h) * .62, [[0, basis[0]], [.55, basis[1]], [1, basis[2]]], -w * .18, -h * .28);
  x.fill();
  x.save(); x.clip();
  // Lichtkante oben, dunkler Rand unten
  x.fillStyle = linear(0, -h / 2, 0, h / 2, [[0, 'rgba(255,240,200,.35)'], [.45, 'rgba(255,240,200,0)'], [1, 'rgba(40,15,0,.35)']]); x.fillRect(-w / 2, -h / 2 - 10, w, h + 20);
  // Einschnitte
  x.strokeStyle = ton === 2 ? 'rgba(10,5,0,.6)' : 'rgba(255,226,170,.85)'; x.lineCap = 'round';
  const schnitt = (x1, y1, x2, y2, br) => { x.lineWidth = br; x.strokeStyle = ton === 2 ? 'rgba(10,5,0,.6)' : 'rgba(120,60,20,.55)'; x.beginPath(); x.moveTo(x1, y1 + 1); x.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - 3, x2, y2 + 1); x.stroke(); x.lineWidth = br * .5; x.strokeStyle = ton === 2 ? 'rgba(80,50,30,.5)' : 'rgba(255,226,170,.9)'; x.beginPath(); x.moveTo(x1, y1); x.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - 3, x2, y2); x.stroke(); };
  if (art === 'krusti' || art === 'baguette') { const n = art === 'baguette' ? 4 : 3; for (let i = 0; i < n; i++) { const px = -w / 2 + w * (i + .7) / (n + .4); schnitt(px - w * .07, h * .22, px + w * .07, -h * .22, Math.max(2.2, h * .14)); } }
  if (art === 'broetchen') schnitt(-w * .26, h * .02, w * .26, -h * .02, Math.max(2, h * .16));
  if (art === 'stuten') { x.fillStyle = 'rgba(255,255,255,.16)'; x.fillRect(-w / 2, -h * .2, w, 3); }
  if (art === 'laib') { // Mehl und Rissmuster
    x.fillStyle = ton === 2 ? 'rgba(200,190,180,.15)' : F.mehl; for (let i = 0; i < 26; i++) { const a = i * 2.39, r = Math.sqrt(i / 26) * w * .42; x.globalAlpha = .55; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r * h / w - h * .05, 1.2 + (i % 3) * .6, 0, 7); x.fill(); }
    x.globalAlpha = 1; x.strokeStyle = 'rgba(40,15,0,.45)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(-w * .28, -h * .12); x.lineTo(w * .3, h * .12); x.moveTo(-w * .28, h * .12); x.lineTo(w * .3, -h * .12); x.stroke();
  }
  if (opt.mohn) { x.fillStyle = '#2B2B33'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(zufallFest(i) * w - w / 2, zufallFest(i + 50) * h * .6 - h * .4, .9, 0, 7); x.fill(); } }
  // Glanzpunkt
  x.fillStyle = radial(-w * .2, -h * .25, 0, w * .3, [[0, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]); x.fillRect(-w / 2, -h / 2, w, h);
  x.restore();
  if (ton === 2) { x.fillStyle = 'rgba(80,80,80,.35)'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(-w * .2 + i * w * .2, -h * .7 - i * 4, 4 + i * 2, 0, 7); x.fill(); } }
  x.restore();
}
const zufallFest = (i) => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s); };
function brezelForm(w, ton){
  const s = w / 60;
  x.save(); x.scale(s, s);
  const farbe = ton === 0 ? ['#F3DDB0', '#D9B57A'] : ton === 2 ? ['#3A2516', '#120A05'] : ['#B96A2A', '#5E2E0E'];
  const pfad = () => { x.beginPath(); x.moveTo(-14, 16); x.bezierCurveTo(-34, 6, -30, -22, -10, -20); x.bezierCurveTo(4, -18, 6, -2, 0, 6); x.bezierCurveTo(-6, -2, -4, -18, 10, -20); x.bezierCurveTo(30, -22, 34, 6, 14, 16); x.moveTo(-10, 2); x.lineTo(12, 18); x.moveTo(10, 2); x.lineTo(-12, 18); };
  x.lineCap = 'round'; x.lineJoin = 'round';
  pfad(); x.strokeStyle = farbe[1]; x.lineWidth = 11; x.stroke();
  pfad(); x.strokeStyle = farbe[0]; x.lineWidth = 8; x.stroke();
  pfad(); x.strokeStyle = 'rgba(255,230,190,.45)'; x.lineWidth = 2.4; x.translate(-1, -2); x.stroke();
  if (ton !== 2) { x.fillStyle = '#FFFFFF'; [[-22, -6], [-14, -16], [16, -14], [22, -2], [0, 2], [-4, 14], [6, 12], [-26, 4]].forEach(([a, b]) => { x.fillRect(a, b, 2.2, 2.2); }); }
  x.restore();
}

// ── Teigi (echte Grafik aus der App) ──
const TEIGI_BILD = new Image(); let teigiBereit = false;
TEIGI_BILD.onload = () => { teigiBereit = true; }; TEIGI_BILD.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(TEIGI_SVG);
/** Teigi zeichnen: Mitte unten bei (px, py), Größe in px. squash > 1 = breit gedrückt, rot = Drehung */
function teigi(px, py, groesse = 64, { squash = 1, rot = 0, blink = false } = {}){
  bodenSchatten(px, py, groesse * .32 * squash, groesse * .07, .35);
  if (!teigiBereit) { rr(px - groesse * .25, py - groesse * .8, groesse * .5, groesse * .7, 10); x.fillStyle = '#FFF3DC'; x.fill(); return; }
  x.save(); x.translate(px, py); x.rotate(rot); x.scale(squash, 1 / squash);
  x.drawImage(TEIGI_BILD, -groesse / 2, -groesse * .93, groesse, groesse);
  x.restore();
}

// ── Effekte: Teilchen, schwebender Text, Wackeln, Blitz ──
const FX = { teile: [], texte: [], wackel: 0, blitz: 0, blitzFarbe: '255,255,255' };
function teilchen(px, py, { n = 14, farben = ['#FFC72C', '#FFF1B8', '#E0A526'], tempo = 160, groesse = [2, 5], schwer = 500, leben = [.5, 1], form = 'kreis', oben = 0 } = {}){
  if (ohneBewegung) n = Math.ceil(n / 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = tempo * zufall(.3, 1); FX.teile.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - oben, g: schwer, r: zufall(groesse[0], groesse[1]), f: farben[i % farben.length], t: 0, l: zufall(leben[0], leben[1]), rot: Math.random() * 6, vr: zufall(-8, 8), form }); }
}
function mehlWolke(px, py, n = 10){ teilchen(px, py, { n, farben: ['rgba(255,250,240,.9)', 'rgba(255,245,225,.7)'], tempo: 60, groesse: [4, 10], schwer: -30, leben: [.5, 1.1] }); }
function schwebText(t, px, py, farbe = F.gruen, gr = 20){ FX.texte.push({ t, x: px, y: py, f: farbe, gr, z: 0 }); }
function wackeln(m = 6){ if (!ohneBewegung) FX.wackel = Math.max(FX.wackel, m); }
function blitz(a = .5, farbe = '255,255,255'){ FX.blitz = a; FX.blitzFarbe = farbe; }
function fxTick(dt){
  for (const p of FX.teile) { p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
  FX.teile = FX.teile.filter((p) => p.t < p.l);
  for (const s of FX.texte) s.z += dt; FX.texte = FX.texte.filter((s) => s.z < 1);
  FX.wackel = Math.max(0, FX.wackel - dt * 30); FX.blitz = Math.max(0, FX.blitz - dt * 2.5);
}
function fxMalen(){
  for (const p of FX.teile) { const a = 1 - p.t / p.l; x.globalAlpha = a; x.fillStyle = p.f; if (p.form === 'stern') { x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? p.r * .45 : p.r; x.lineTo(Math.cos(i * Math.PI / 5) * r, Math.sin(i * Math.PI / 5) * r); } x.fill(); x.restore(); } else if (p.form === 'krume') { x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * .66); x.restore(); } else { x.beginPath(); x.arc(p.x, p.y, p.r * (.5 + a * .5), 0, 7); x.fill(); } }
  x.globalAlpha = 1;
  for (const s of FX.texte) { const t = s.z, sk = t < .15 ? ease.feder(t / .15) : 1; x.save(); x.globalAlpha = t > .7 ? (1 - t) / .3 : 1; x.translate(s.x, s.y - ease.aus(t) * 40); x.scale(sk, sk); x.font = `800 ${s.gr}px "Plus Jakarta Sans", system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 4; x.strokeStyle = 'rgba(255,251,242,.95)'; x.strokeText(s.t, 0, 0); x.fillStyle = s.f; x.fillText(s.t, 0, 0); x.restore(); }
  if (FX.blitz > 0) { x.fillStyle = `rgba(${FX.blitzFarbe},${FX.blitz})`; x.fillRect(0, 0, W, H); }
}

// ── Leichte Fragen (in der App: zufällig aus den leichten Quizfragen) ──
let FRAGEN = [
  ['Woraus ist ein Roggenbrot hauptsächlich?', ['Roggenmehl', 'Reismehl', 'Maisgrieß'], 0],
  ['Was gibt der Laugenbrezel ihre braune Farbe?', ['Natronlauge', 'Kakao', 'Zuckercouleur'], 0],
  ['Welche Schuhe trägt man im Verkauf?', ['Feste, geschlossene Schuhe', 'Sandalen', 'Hausschuhe'], 0],
  ['Was macht man vor dem Anfassen von Backwaren?', ['Hände waschen oder Handschuhe nehmen', 'Nichts', 'Kurz pusten'], 0],
  ['Dinkel ist verwandt mit ...', ['Weizen', 'Kartoffel', 'Reis'], 0],
  ['Was enthält ein veganes Gebäck nicht?', ['Tierische Zutaten', 'Mehl', 'Wasser'], 0],
  ['Was muss man Kunden mit Allergie sagen können?', ['Welche Allergene drin sind', 'Wer das Brot gebacken hat', 'Den Einkaufspreis'], 0],
  ['Welche Zutat lässt Hefeteig aufgehen?', ['Hefe', 'Salz', 'Puderzucker'], 0],
  ['Wie gibt man Rückgeld am besten?', ['Laut mitzählen', 'Auf den Tresen legen, ohne zu zählen', 'Gar nicht nachzählen'], 0],
  ['Wo werden Mehl und Zutaten gelagert?', ['Trocken und verschlossen', 'Offen am Fenster', 'Neben dem Müll'], 0],
];
let frageOffen = false;
function frage(cb){
  frageOffen = true;
  const [q, opts, ok] = FRAGEN[Math.floor(Math.random() * FRAGEN.length)];
  const reihe = opts.map((t, i) => ({ t, ok: i === ok })).sort(() => Math.random() - .5);
  const d = document.createElement('div'); d.className = 'frage';
  d.innerHTML = `<div class="frage-kopf"><span class="frage-marke">Bonus-Frage</span><span class="frage-hinweis">richtig = Extra-Punkte</span></div><p>${q}</p>` + reihe.map((o, i) => `<button class="opt" data-i="${i}">${o.t}</button>`).join('') + '<button class="weg">Überspringen und weiterspielen</button>';
  feld.appendChild(d);
  const fertig = (r) => { d.classList.add('raus'); setTimeout(() => { d.remove(); frageOffen = false; cb(r); }, 220); };
  d.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
    const o = reihe[Number(b.dataset.i)];
    d.querySelectorAll('.opt').forEach((bb, i) => { bb.disabled = true; if (reihe[i].ok) bb.classList.add('ok'); });
    if (!o.ok) b.classList.add('nein');
    setTimeout(() => fertig(o.ok), 750);
  }));
  d.querySelector('.weg').addEventListener('click', () => fertig(false));
}

// ── Rekord ──
const rekordLesen = (k) => { try { return Number(localStorage.getItem('lt_abschalten_' + k)) || 0; } catch { return 0; } };
const rekordSetzen = (k, v) => { try { if (v > rekordLesen(k)) localStorage.setItem('lt_abschalten_' + k, String(v)); } catch {} };

// ── Schleife, Start, Ende ──
const SPIELE = {};
let spiel = null, laeuft = false, last = 0, startZeit = 0, runde = 0;
function schleife(t){
  const dt = Math.min(0.04, (t - last) / 1000 || 0); last = t;
  if (laeuft && !frageOffen) spiel.tick(dt);
  if (!frageOffen) fxTick(dt);
  x.save(); if (FX.wackel > 0) x.translate(zufall(-FX.wackel, FX.wackel), zufall(-FX.wackel, FX.wackel));
  spiel.malen(t / 1000); fxMalen(); x.restore();
  requestAnimationFrame(schleife);
}
const ICON = {
  punkte: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#FFC72C" stroke="#A8740A" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  herz: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.1-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.9 12 21 12 21z" fill="#E0452E" stroke="#9E2414" stroke-width="1.2"/></svg>',
  leer: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.1-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.9 12 21 12 21z" fill="rgba(255,255,255,.35)" stroke="#B9A98F" stroke-width="1.2"/></svg>',
  korn: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="5.5" ry="8.5" transform="rotate(25 12 12)" fill="#E3A928" stroke="#9A6A0A" stroke-width="1.3"/><path d="M10 7.5q2 4 1 9" stroke="#FFF1B8" stroke-width="1.4" fill="none"/></svg>',
  flagge: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h12l-2.5 4L17 12H5" fill="#2F9A47" stroke="#1D6A2E" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  uhr: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="#FFF6E4" stroke="#4B2A14" stroke-width="1.6"/><path d="M12 7v5l3 2" stroke="#4B2A14" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
};
/** HUD: Liste von {icon, text} oder Text */
function setHud(teile){ const neu = teile.map((t) => typeof t === 'string' ? `<span class="pille">${t}</span>` : `<span class="pille">${t.icon ? `<i>${ICON[t.icon] || ''}</i>` : ''}${t.text}</span>`).join(''); if (hud.innerHTML !== neu) hud.innerHTML = neu; }
function herzen(n, max = 3){ return { text: Array.from({ length: max }, (_, i) => `<i class="herz">${i < n ? ICON.herz : ICON.leer}</i>`).join('') }; }
function zeigeStart(){
  runde++; laeuft = false; ueber.hidden = false; ueber.className = 'ueber start';
  const r = rekordLesen(spiel.key);
  ueber.innerHTML = `<div class="karte"><span class="marke">Zum Abschalten</span><h2>${spiel.name}</h2><p>${spiel.anleitung}</p>${r ? `<span class="rekord">${ICON.punkte}Dein Rekord: ${r.toLocaleString('de-DE')}</span>` : ''}<button class="los">Los geht's</button></div>`;
  ueber.querySelector('.los').addEventListener('click', starten);
}
function starten(){ runde++; ueber.hidden = true; FX.teile = []; FX.texte = []; spiel.start(); laeuft = true; startZeit = performance.now(); }
function ende(punkte, zeile){
  laeuft = false;
  const alt = rekordLesen(spiel.key); rekordSetzen(spiel.key, punkte); const neu = punkte > alt && punkte > 0;
  const meineRunde = runde, meinSpiel = spiel;
  setTimeout(() => {
    if (meineRunde !== runde || meinSpiel !== spiel) return; // inzwischen neu gestartet oder anderes Spiel gewählt
    ueber.hidden = false; ueber.className = 'ueber ende';
    ueber.innerHTML = `<div class="karte">${neu ? '<span class="marke gold">Neuer Rekord</span>' : '<span class="marke">Runde vorbei</span>'}<div class="zahl">${punkte.toLocaleString('de-DE')}</div><p>${zeile}</p><span class="rekord">${ICON.punkte}Rekord: ${Math.max(alt, punkte).toLocaleString('de-DE')}</span><button class="los">Nochmal</button></div>`;
    ueber.querySelector('.los').addEventListener('click', starten);
    if (neu) { for (let i = 0; i < 4; i++) setTimeout(() => teilchen(zufall(60, 300), zufall(80, 200), { n: 26, farben: ['#FFC72C', '#FFF1B8', '#E8534F', '#7DBE6E', '#FFFFFF'], tempo: 260, form: 'stern', groesse: [3, 6], leben: [.8, 1.4] }), i * 180); }
  }, 450);
}

// ── Eingabe ──
let zeiger = null;
const pos = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
c.addEventListener('pointerdown', (e) => { if (!laeuft || frageOffen) return; e.preventDefault(); c.setPointerCapture?.(e.pointerId); zeiger = pos(e); spiel.runter?.(zeiger); });
c.addEventListener('pointermove', (e) => { if (!zeiger || !laeuft) return; spiel.zieh?.(pos(e)); });
const loslassen = (e) => { if (!zeiger) return; const p = pos(e); const s = zeiger; zeiger = null; if (laeuft) spiel.hoch?.(p, s); };
c.addEventListener('pointerup', loslassen); c.addEventListener('pointercancel', loslassen);
addEventListener('keydown', (e) => { if (laeuft && !frageOffen && spiel.taste) { if ([' ', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)) e.preventDefault(); spiel.taste(e.key); } });
