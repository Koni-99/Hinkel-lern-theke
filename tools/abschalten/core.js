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
  const G = groesse * TEIGI_SKALA; x.drawImage(TEIGI_BILD, -G / 2, -G * .93, G, G);
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

// ── Version 267: Vibration, Gemütlich-Modus, Pause, Kollegen-Ziel, Medaillen, Teigi mit Laden-Sachen ──
/** Kurz brummen (Handy), z. B. brumm(25) bei Treffer, brumm(70) bei Fehler. Nicht bei „weniger Bewegung“. */
function brumm(ms = 30){ try { if (!ohneBewegung && navigator.vibrate) navigator.vibrate(ms); } catch {} }
/** Gemütlich: langsamer, ohne Zeitdruck (jedes Spiel liest GEMUETLICH in start/tick). Zählt nicht für Rekord und Bestenliste. */
let GEMUETLICH = (() => { try { return localStorage.getItem('lt_abschalten_gemuetlich') === '1'; } catch { return false; } })();
let rundeGemuetlich = false;
/** Kollegen-Rekorde je Spiel (von der App): { lauf: [{ name, punkte }], … }, ohne mich selbst */
let ZIELE = {};
/** Medaillen-Grenzen je Spiel [Bronze, Silber, Gold]; Standard aus dem Spiel (spiel.medaillen), die App darf überschreiben */
let MEDAILLEN = {};
const medaillenVon = (k) => MEDAILLEN[k] || (SPIELE[k] && SPIELE[k].medaillen) || null;
const MEDAILLE_NAME = ['', 'Bronze', 'Silber', 'Gold'], MEDAILLE_FARBE = ['', '#C07A3A', '#9FA7B2', '#E0A526'];
function medailleFuer(k, p){ const m = medaillenVon(k); if (!m) return 0; return p >= m[2] ? 3 : p >= m[1] ? 2 : p >= m[0] ? 1 : 0; }
function medailleSvg(stufe, gr = 26){ const f = MEDAILLE_FARBE[stufe] || '#CBBBA4'; return `<svg viewBox="0 0 24 24" width="${gr}" height="${gr}" aria-hidden="true"><path d="M7 2h4l1 5-3 1zM17 2h-4l-1 5 3 1z" fill="#C0392B"/><circle cx="12" cy="15" r="7" fill="${f}" stroke="rgba(60,30,5,.45)" stroke-width="1.2"/><circle cx="12" cy="15" r="4.6" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/><path d="M10 12.5a3 3 0 0 1 4-0.4" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".8"/></svg>`; }
/** Teigi mit Hut und Glas aus dem Laden (die App schickt die passende Grafik) */
/** skala: wie viel größer die Bildfläche der neuen Grafik ist (Platz für Hüte über dem Deckel) */
let TEIGI_SKALA = 1;
function setTeigiSvg(svg, skala = 1){ if (!svg || typeof svg !== 'string' || svg.length > 60000) return; const b = new Image(); b.onload = () => { TEIGI_BILD.src = b.src; TEIGI_SKALA = klemm(Number(skala) || 1, 1, 1.6); }; b.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

// Kollegen-Ziel während der Runde: nächster Kollege über mir, beim Überholen eine Meldung
let zielStand = { schon: new Set() };
function naechstesZiel(p){ return (ZIELE[spiel.key] || []).filter((z) => z.punkte > p).sort((a, b) => a.punkte - b.punkte)[0] || null; }
function zielTick(p){
  if (rundeGemuetlich) return;
  for (const z of ZIELE[spiel.key] || []) {
    if (p > z.punkte && z.punkte > 0 && !zielStand.schon.has(z.name) && zielStand.start <= z.punkte) {
      zielStand.schon.add(z.name);
      schwebText(`${z.name} überholt!`, W / 2, 110, '#B8860B', 20); teilchen(W / 2, 110, { n: 22, form: 'stern', farben: ['#FFC72C', '#FFF1B8', '#FFFFFF'], tempo: 200 }); brumm(40);
    }
  }
}
function zielMalen(){
  if (!laeuft || rundeGemuetlich || !spiel.aktuellePunkte) return;
  const z = naechstesZiel(spiel.aktuellePunkte()); if (!z) return;
  const t = `Nächstes Ziel: ${z.name} ${z.punkte.toLocaleString('de-DE')}`;
  x.font = '700 11.5px "Plus Jakarta Sans", system-ui, sans-serif'; const w = x.measureText(t).width + 18;
  x.globalAlpha = .9; rr(W / 2 - w / 2, 46, w, 20, 10); x.fillStyle = 'rgba(43,23,10,.62)'; x.fill(); x.globalAlpha = 1;
  x.fillStyle = '#FFE9B0'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, W / 2, 56.5);
}

// ── Schleife, Start, Ende ──
const SPIELE = {};
let spiel = null, laeuft = false, last = 0, startZeit = 0, runde = 0, pausiert = false, spielZeit = 0;
function schleife(t){
  const dt = Math.min(0.04, (t - last) / 1000 || 0); last = t;
  if (laeuft && !frageOffen && !pausiert) { spielZeit += dt; spiel.tick(dt * sanftFaktor()); if (laeuft && spiel.aktuellePunkte) zielTick(spiel.aktuellePunkte()); }
  if (!frageOffen && !pausiert) fxTick(dt);
  x.save(); if (FX.wackel > 0 && !pausiert) x.translate(zufall(-FX.wackel, FX.wackel), zufall(-FX.wackel, FX.wackel));
  spiel.malen(t / 1000); saisonMalen(t / 1000, frageOffen || pausiert ? 0 : dt); fxMalen(); zielMalen(); x.restore();
  pauseKnopf.hidden = !laeuft || frageOffen || pausiert;
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

// Pause-Knopf (oben in der Mitte, unter der Anzeige)
const pauseKnopf = document.createElement('button');
pauseKnopf.className = 'pause-knopf'; pauseKnopf.type = 'button'; pauseKnopf.setAttribute('aria-label', 'Pause'); pauseKnopf.hidden = true;
pauseKnopf.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';
feld.appendChild(pauseKnopf);
const pauseStil = document.createElement('style');
pauseStil.textContent = '.pause-knopf{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:3;width:36px;height:36px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;background:rgba(43,23,10,.55);color:#FFE9B0;cursor:pointer;box-shadow:0 4px 10px -4px rgba(0,0,0,.5)}.pause-knopf:active{transform:translateX(-50%) scale(.92)}'
  + '.schalter{display:flex;align-items:center;gap:10px;width:100%;padding:5px 12px;border-radius:12px;border:2px solid #EADBC0;background:#FFFFFF;cursor:pointer;text-align:left;font:700 14px var(--text);color:#2B170A}.schalter .spur{flex:0 0 42px;height:24px;border-radius:999px;background:#D9CBB2;position:relative;transition:background .2s}.schalter .spur::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .2s}.schalter[aria-pressed="true"] .spur{background:#2F9A47}.schalter[aria-pressed="true"] .spur::after{left:21px}.schalter small{display:block;font-weight:600;font-size:12px;color:#8A6A3A}'
  + '.medaillen{display:flex;gap:10px;justify-content:center;align-items:flex-end}.medaillen span{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;font-weight:800;color:#8A6A3A}.medaillen span.weg{opacity:.35;filter:grayscale(1)}'
  + '.ueber .zeile{font-size:13.5px;font-weight:700;color:#8A6A3A}';
document.head.appendChild(pauseStil);
function pausieren(){
  if (!laeuft || pausiert || frageOffen) return;
  pausiert = true; ueber.hidden = false; ueber.className = 'ueber start';
  ueber.innerHTML = `<div class="karte"><span class="marke">Pause</span><h2>${spiel.name}</h2><p>Kurz durchatmen. Es geht genau da weiter, wo du aufgehört hast.</p><button class="los">Weiter</button><button class="neu" style="border:none;background:transparent;color:#8A6A3A;font:700 14px var(--text);text-decoration:underline;min-height:40px;cursor:pointer">Runde neu starten</button></div>`;
  ueber.querySelector('.los').addEventListener('click', () => { ueber.hidden = true; pausiert = false; last = performance.now(); });
  ueber.querySelector('.neu').addEventListener('click', () => { pausiert = false; starten(); });
}
pauseKnopf.addEventListener('click', pausieren);
addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'p') pausieren(); });

function medaillenHtml(k, rek){
  const m = medaillenVon(k); if (!m) return '';
  return '<div class="medaillen">' + [1, 2, 3].map((i) => `<span class="${rek >= m[i - 1] ? '' : 'weg'}">${medailleSvg(i, 26)}${m[i - 1].toLocaleString('de-DE')}</span>`).join('') + '</div>';
}
function zeigeStart(){
  runde++; laeuft = false; pausiert = false; ueber.hidden = false; ueber.className = 'ueber start';
  const r = rekordLesen(spiel.key);
  const ziel = naechstesZiel(r);
  ueber.innerHTML = `<div class="karte"><h2>${spiel.name}</h2><p>${spiel.anleitung}</p>${medaillenHtml(spiel.key, r)}${r ? `<span class="rekord">${ICON.punkte}Dein Rekord: ${r.toLocaleString('de-DE')}</span>` : ''}${ziel ? `<span class="zeile">Nächstes Ziel: ${ziel.name} mit ${ziel.punkte.toLocaleString('de-DE')}</span>` : ''}${aufgabeHtml()}<button class="schalter" type="button" aria-pressed="${GEMUETLICH}"><span class="spur"></span><span>Gemütlich spielen<small>Zählt nicht für den Rekord.</small></span></button><button class="los">Los geht's</button></div>`;
  const sch = ueber.querySelector('.schalter');
  sch.addEventListener('click', () => { GEMUETLICH = !GEMUETLICH; sch.setAttribute('aria-pressed', String(GEMUETLICH)); try { localStorage.setItem('lt_abschalten_gemuetlich', GEMUETLICH ? '1' : '0'); } catch {} });
  ueber.querySelector('.los').addEventListener('click', starten);
  aufgabeKnopf();
}
function starten(){ runde++; pausiert = false; rundeGemuetlich = GEMUETLICH; zielStand = { schon: new Set(), start: rekordLesen(spiel.key) }; ueber.hidden = true; FX.teile = []; FX.texte = []; rundeVorbereiten(); spiel.start(); laeuft = true; startZeit = performance.now(); spielZeit = 0; if (rundeSanft) setTimeout(() => { if (laeuft) schwebText('Sanfter Start', W / 2, 150, '#2F7A3A', 20); }, 300); }
function ende(punkte, zeile){
  laeuft = false; pausiert = false; brumm(rundeGemuetlich ? 30 : 80);
  sanftMerken(spielZeit);
  const alt = rekordLesen(spiel.key);
  if (!rundeGemuetlich) rekordSetzen(spiel.key, punkte);
  const neu = !rundeGemuetlich && punkte > alt && punkte > 0;
  const medAlt = medailleFuer(spiel.key, alt), medNeu = rundeGemuetlich ? 0 : medailleFuer(spiel.key, punkte);
  const m = medaillenVon(spiel.key), naechste = m ? m.find((g) => g > Math.max(alt, punkte)) : null;
  const meineRunde = runde, meinSpiel = spiel;
  if (neu && spiel.geistDaten) geistSchreiben(spiel.key, spiel.geistDaten());
  const goldZeile = goldEndZeile();
  setTimeout(() => {
    if (meineRunde !== runde || meinSpiel !== spiel) return; // inzwischen neu gestartet oder anderes Spiel gewählt
    ueber.hidden = false; ueber.className = 'ueber ende';
    const medZeile = medNeu > medAlt ? `<span class="marke gold" style="display:inline-flex;align-items:center;gap:6px">${medailleSvg(medNeu, 20)}${MEDAILLE_NAME[medNeu]} geschafft!</span>` : '';
    const nochZeile = !rundeGemuetlich && naechste ? `<span class="zeile">Noch ${(naechste - Math.max(alt, punkte)).toLocaleString('de-DE')} bis ${MEDAILLE_NAME[m.indexOf(naechste) + 1]}</span>` : '';
    ueber.innerHTML = `<div class="karte">${rundeGemuetlich ? '<span class="marke">Gemütliche Runde</span>' : neu ? '<span class="marke gold">Neuer Rekord</span>' : '<span class="marke">Runde vorbei</span>'}${medZeile}<div class="zahl">${punkte.toLocaleString('de-DE')}</div><p>${zeile}</p>${rundeGemuetlich ? '<span class="zeile">Gemütlich zählt nicht für den Rekord.</span>' : `<span class="rekord">${ICON.punkte}Rekord: ${Math.max(alt, punkte).toLocaleString('de-DE')}</span>`}${nochZeile}${goldZeile}<button class="los">Nochmal</button>${!rundeGemuetlich && punkte > 0 && imRahmen ? '<button class="fordern" type="button">Kollegen herausfordern</button>' : ''}</div>`;
    ueber.querySelector('.los').addEventListener('click', starten);
    ueber.querySelector('.fordern')?.addEventListener('click', () => nachAussen({ typ: 'lt-abschalten-herausfordern', key: meinSpiel.key, punkte }));
    if (neu || medNeu > medAlt) { brumm(60); for (let i = 0; i < 4; i++) setTimeout(() => teilchen(zufall(60, 300), zufall(80, 200), { n: 26, farben: ['#FFC72C', '#FFF1B8', '#E8534F', '#7DBE6E', '#FFFFFF'], tempo: 260, form: 'stern', groesse: [3, 6], leben: [.8, 1.4] }), i * 180); }
  }, 450);
}

// ── Eingabe ──
let zeiger = null;
const pos = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
c.addEventListener('pointerdown', (e) => { if (!laeuft || frageOffen || pausiert) return; e.preventDefault(); c.setPointerCapture?.(e.pointerId); zeiger = pos(e); spiel.runter?.(zeiger); });
c.addEventListener('pointermove', (e) => { if (!zeiger || !laeuft) return; spiel.zieh?.(pos(e)); });
const loslassen = (e) => { if (!zeiger) return; const p = pos(e); const s = zeiger; zeiger = null; if (laeuft) spiel.hoch?.(p, s); };
c.addEventListener('pointerup', loslassen); c.addEventListener('pointercancel', loslassen);
addEventListener('keydown', (e) => { if (laeuft && !frageOffen && !pausiert && spiel.taste) { if ([' ', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)) e.preventDefault(); spiel.taste(e.key); } });

// ── Version 268: Saison-Deko, Goldstücke, Tagesaufgabe, Geister-Lauf, Kollegen herausfordern ──
const imRahmen = (() => { try { return parent !== window; } catch { return true; } })();
function nachAussen(d){ try { if (imRahmen) parent.postMessage(d, location.origin); } catch {} }

// Saison-Deko: kommt von selbst nach Datum. Liegt über dem Spiel, aber nur leicht (stört nicht beim Spielen).
// Ein Spiel kann sie ausschalten (spiel.saisonAus = true) oder eigenes Wetter melden (spiel.eigenesWetter() → kein Schnee).
let SAISON_TEST = null;
function osterSonntag(j){ const a = j % 19, b = Math.floor(j / 100), cc = j % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(cc / 4), k = cc % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), ta = ((h + l - 7 * m + 114) % 31) + 1; return new Date(j, mo - 1, ta); }
function saisonHeute(d = new Date()){
  const mo = d.getMonth() + 1, ta = d.getDate(), tag = new Date(d.getFullYear(), d.getMonth(), ta);
  const os = osterSonntag(d.getFullYear()), weiber = new Date(os); weiber.setDate(os.getDate() - 52); const veilchen = new Date(os); veilchen.setDate(os.getDate() - 47);
  if ((mo === 11 && ta === 11) || (tag >= weiber && tag <= veilchen)) return 'karneval';
  if (mo === 12 && ta <= 24) return 'advent';
  if ((mo === 12 && ta > 24) || (mo === 1 && ta <= 6)) return 'weihnacht';
  if (mo <= 2) return 'winter';
  if (mo <= 5) return 'fruehling';
  if (mo <= 8) return 'sommer';
  return 'herbst';
}
const SAISON_NAME = { advent: 'Adventszeit', weihnacht: 'Weihnachtszeit', winter: 'Winter', karneval: 'Karneval', fruehling: 'Frühling', sommer: 'Sommer', herbst: 'Herbst' };
const SAISON = { art: null, teile: [], fuer: null };
const LICHT_FARBEN = ['#FF5A4E', '#FFC72C', '#5BD46A', '#58B4FF', '#FF9AD0'];
const lichtSprite = {};
function lichtGlanz(f){
  if (lichtSprite[f]) return lichtSprite[f];
  const k = document.createElement('canvas'); k.width = k.height = 64; const g = k.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, f + 'CC'); r.addColorStop(.35, f + '55'); r.addColorStop(1, f + '00');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); return (lichtSprite[f] = k);
}
function saisonTeil(art, oben){
  const t = { x: zufall(0, W), y: oben ? zufall(-H, 0) : zufall(0, H), ph: zufall(0, 7), rot: zufall(0, 6), vr: zufall(-2, 2) };
  if (art === 'schnee') Object.assign(t, { r: zufall(1.2, 3.4), vy: zufall(18, 42), a: zufall(.5, .9) });
  if (art === 'konfetti') Object.assign(t, { r: zufall(3, 5.5), vy: zufall(40, 75), f: ['#FF5A4E', '#FFC72C', '#5BD46A', '#58B4FF', '#C77DFF', '#FF9AD0'][ganz(0, 5)], vr: zufall(-6, 6) });
  if (art === 'bluete') Object.assign(t, { r: zufall(3.5, 6), vy: zufall(22, 40), f: ['#FFD3E2', '#FFFFFF', '#FFB8D0'][ganz(0, 2)] });
  if (art === 'blatt') Object.assign(t, { r: zufall(5, 8), vy: zufall(26, 46), f: ['#E07B22', '#C9461E', '#D9A126', '#9A5A1E'][ganz(0, 3)] });
  if (art === 'funkel') Object.assign(t, { r: zufall(1, 2.4), vy: zufall(-6, 6), y: zufall(20, H * .55) });
  t.art = art; return t;
}
function saisonVorbereiten(){
  const art = SAISON_TEST || saisonHeute(); SAISON.art = art; SAISON.fuer = spiel && spiel.key; SAISON.teile = [];
  const mach = (a, n) => { for (let i = 0; i < (ohneBewegung ? Math.ceil(n / 3) : n); i++) SAISON.teile.push(saisonTeil(a, false)); };
  if (art === 'advent' || art === 'weihnacht') mach('schnee', 26);
  if (art === 'winter') mach('schnee', 18);
  if (art === 'karneval') mach('konfetti', 26);
  if (art === 'fruehling') mach('bluete', 12);
  if (art === 'herbst') mach('blatt', 10);
  if (art === 'sommer') mach('funkel', 10);
}
function saisonMalen(t, dt){
  if (!spiel || spiel.saisonAus) return;
  if (SAISON.fuer !== spiel.key || !SAISON.art) saisonVorbereiten();
  const art = SAISON.art, ohneSchnee = !!(spiel.eigenesWetter && spiel.eigenesWetter());
  x.save();
  if (art === 'sommer') {
    // Sonne oben links: weicher Schein und langsam drehende Strahlen
    const g = x.createRadialGradient(10, 10, 0, 10, 10, 170); g.addColorStop(0, 'rgba(255,236,150,.6)'); g.addColorStop(.45, 'rgba(255,214,90,.2)'); g.addColorStop(1, 'rgba(255,214,90,0)');
    x.fillStyle = g; x.fillRect(0, 0, 200, 200);
    x.translate(10, 10); x.rotate(t * .05); x.fillStyle = 'rgba(255,236,160,.16)';
    for (let i = 0; i < 9; i++) { x.rotate(Math.PI * 2 / 9); x.beginPath(); x.moveTo(0, 0); x.lineTo(230, -16); x.lineTo(230, 16); x.closePath(); x.fill(); }
    x.setTransform(SKAL, 0, 0, c.height / H, 0, 0);
  }
  for (const p of SAISON.teile) {
    if (p.art === 'schnee' && ohneSchnee) continue;
    p.y += p.vy * dt; p.ph += dt; p.rot += p.vr * dt;
    const wx = p.x + Math.sin(p.ph * (p.art === 'blatt' ? 1.3 : .9)) * (p.art === 'blatt' ? 16 : 8);
    if (p.art !== 'funkel' && p.y > H + 10) { Object.assign(p, saisonTeil(p.art, true)); p.y = -10; }
    if (p.art === 'schnee') { x.globalAlpha = p.a * .5; x.fillStyle = '#8FA3BE'; x.beginPath(); x.arc(wx + .5, p.y + .8, p.r + .7, 0, 7); x.fill(); x.globalAlpha = p.a; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(wx, p.y, p.r, 0, 7); x.fill(); }
    else if (p.art === 'konfetti') { x.globalAlpha = .85; x.save(); x.translate(wx, p.y); x.rotate(p.rot); x.scale(1, Math.abs(Math.cos(p.ph * 3)) * .8 + .2); x.fillStyle = p.f; x.fillRect(-p.r, -p.r * .55, p.r * 2, p.r * 1.1); x.restore(); }
    else if (p.art === 'bluete' || p.art === 'blatt') {
      x.globalAlpha = p.art === 'blatt' ? .82 : .75; x.save(); x.translate(wx, p.y); x.rotate(p.rot); x.fillStyle = p.f; x.beginPath();
      if (p.art === 'bluete') x.ellipse(0, 0, p.r, p.r * .6, 0, 0, 7); else { x.moveTo(-p.r, 0); x.quadraticCurveTo(0, -p.r * .9, p.r, 0); x.quadraticCurveTo(0, p.r * .9, -p.r, 0); }
      x.fill(); if (p.art === 'blatt') { x.strokeStyle = 'rgba(80,40,10,.45)'; x.lineWidth = .8; x.beginPath(); x.moveTo(-p.r, 0); x.lineTo(p.r, 0); x.stroke(); } x.restore();
    } else if (p.art === 'funkel') { const a = (Math.sin(p.ph * 2.2) + 1) / 2; x.globalAlpha = a * .7; x.fillStyle = '#FFF6C8'; x.save(); x.translate(wx, p.y); x.rotate(Math.PI / 4); x.fillRect(-p.r * 2.4, -p.r * .35, p.r * 4.8, p.r * .7); x.fillRect(-p.r * .35, -p.r * 2.4, p.r * .7, p.r * 4.8); x.restore(); }
  }
  x.globalAlpha = 1;
  if (art === 'advent' || art === 'weihnacht') {
    // Lichterkette oben: Kabel hängt in zwei Bögen durch, Birnen leuchten abwechselnd
    const y0 = 3, durch = 14, pkt = (px) => y0 + Math.abs(Math.sin(px / W * Math.PI * 2)) * durch;
    x.strokeStyle = 'rgba(40,60,30,.85)'; x.lineWidth = 1.6; x.beginPath(); for (let px = 0; px <= W; px += 6) x.lineTo(px, pkt(px)); x.stroke();
    for (let i = 0, px = 12; px < W; px += 24, i++) {
      const f = LICHT_FARBEN[i % LICHT_FARBEN.length], py = pkt(px) + 5, an = .55 + .45 * Math.sin(t * 2.2 + i * 1.7);
      x.globalAlpha = an; x.drawImage(lichtGlanz(f), px - 13, py - 11, 26, 26); x.globalAlpha = 1;
      x.fillStyle = '#3B4A2E'; x.fillRect(px - 2, py - 6, 4, 3.5);
      x.fillStyle = f; x.beginPath(); x.ellipse(px, py, 3.2, 4.6, 0, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(px - 1, py - 1.5, 1.1, 0, 7); x.fill();
    }
  }
  if (art === 'karneval') {
    // Luftschlangen in den oberen Ecken
    const schlange = (sx, f, dir) => { x.strokeStyle = f; x.lineWidth = 2.4; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; x.lineTo(sx + dir * (u * 60 + Math.sin(u * 14 + t * 1.5) * 7), u * 95 + Math.cos(u * 14) * 6); } x.stroke(); };
    schlange(4, '#FF5A4E', 1); schlange(18, '#FFC72C', 1); schlange(W - 4, '#58B4FF', -1); schlange(W - 18, '#5BD46A', -1);
  }
  x.restore();
}

// Goldstücke: ganz selten taucht in einer Runde ein goldenes Ding auf. Wer es fängt, schaltet eine Teigi-Sache frei
// (gibt es nicht im Laden). Das Spiel fragt goldKommt() und ruft goldErschienen() und goldGefangen(px, py).
const GOLD = {
  lauf: { ding: 'Goldkorn', sache: 'Stirnband' }, chaos: { ding: 'Goldbrezel', sache: 'Brezel-Haarreif' }, tour: { ding: 'Goldpaket', sache: 'Fahrermütze' },
  schutz: { ding: 'Goldähre', sache: 'Ritterhelm' }, schleuder: { ding: 'Goldform', sache: 'Fliegerbrille' }, stapler: { ding: 'Goldlaib', sache: 'Bauhelm' },
};
let GOLD_SCHON = {}, GOLD_TEST = false;
const GOLD_RUNDE = { kommt: false, da: false, gefangen: false };
/** true: in dieser Runde soll das Goldstück noch erscheinen (das Spiel wählt den Moment, z. B. nach 20 s) */
const goldKommt = () => GOLD_RUNDE.kommt && !GOLD_RUNDE.da;
function goldErschienen(){ GOLD_RUNDE.da = true; const g = GOLD[spiel.key]; if (g) { schwebText(`${g.ding}! Schnell!`, W / 2, 140, '#B8860B', 21); brumm(20); } }
function goldGefangen(px, py){
  if (GOLD_RUNDE.gefangen) return; GOLD_RUNDE.gefangen = true;
  const g = GOLD[spiel.key] || { ding: 'Gold', sache: '' };
  blitz(.45, '255,230,140'); brumm(90);
  teilchen(px, py, { n: 40, form: 'stern', farben: ['#FFC72C', '#FFF1B8', '#FFFFFF', '#E0A526'], tempo: 280, groesse: [3, 7], leben: [.8, 1.5] });
  schwebText(GOLD_SCHON[spiel.key] ? `${g.ding} gefangen!` : `Neu für Teigi: ${g.sache}`, W / 2, 150, '#B8860B', 21);
  nachAussen({ typ: 'lt-abschalten-gold', key: spiel.key });
  GOLD_SCHON[spiel.key] = GOLD_SCHON[spiel.key] || 'neu';
}
/** Goldener Schein um ein Goldstück (das Spiel malt das Ding selbst darüber) */
function goldGlanz(px, py, r = 20, t = 0){
  const g = x.createRadialGradient(px, py, 0, px, py, r * 2.2); g.addColorStop(0, 'rgba(255,230,120,.75)'); g.addColorStop(.5, 'rgba(255,200,40,.28)'); g.addColorStop(1, 'rgba(255,200,40,0)');
  x.fillStyle = g; x.beginPath(); x.arc(px, py, r * 2.2, 0, 7); x.fill();
  x.save(); x.translate(px, py); x.rotate(t * 1.6); x.fillStyle = 'rgba(255,246,200,.55)';
  for (let i = 0; i < 6; i++) { x.rotate(Math.PI / 3); x.beginPath(); x.moveTo(0, -2); x.lineTo(r * 2, 0); x.lineTo(0, 2); x.fill(); }
  x.restore();
  const a = (Math.sin(t * 5) + 1) / 2; x.globalAlpha = a; x.fillStyle = '#FFFFFF'; x.save(); x.translate(px + r * .6, py - r * .6); x.rotate(Math.PI / 4); x.fillRect(-4, -.8, 8, 1.6); x.fillRect(-.8, -4, 1.6, 8); x.restore(); x.globalAlpha = 1;
}
function goldEndZeile(){
  if (!GOLD_RUNDE.gefangen) return '';
  const g = GOLD[spiel.key]; if (!g) return '';
  return `<span class="marke gold" style="display:inline-flex;margin-top:2px">${GOLD_SCHON[spiel.key] === 'neu' ? `${g.ding} gefunden! Neu für Teigi: ${g.sache}` : `${g.ding} gefunden!`}</span>`;
}

// Tagesaufgabe: eine pro Tag, für alle gleich. Spiele zählen mit statPlus(name) bzw. statMax(name, wert).
let RUNDE_STAT = {};
function statPlus(n, v = 1){ RUNDE_STAT[n] = (RUNDE_STAT[n] || 0) + v; aufgabePruefen(); }
function statMax(n, v){ if (v > (RUNDE_STAT[n] || 0)) { RUNDE_STAT[n] = v; aufgabePruefen(); } }
const AUFGABEN = [
  { id: 'lauf-koerner', spiel: 'lauf', stat: 'koerner', ziel: 40, text: 'Sammle 40 Körner in einer Runde' },
  { id: 'stapler-brote', spiel: 'stapler', stat: 'brote', ziel: 15, text: 'Staple 15 Brote in einer Runde' },
  { id: 'tour-filialen', spiel: 'tour', stat: 'filialen', ziel: 5, text: 'Beliefere 5 Filialen in einer Runde' },
  { id: 'chaos-verkauft', spiel: 'chaos', stat: 'verkauft', ziel: 15, text: 'Verkaufe 15 Backwaren in einer Runde' },
  { id: 'schutz-gefangen', spiel: 'schutz', stat: 'gefangen', ziel: 25, text: 'Fange 25 Schädlinge in einer Runde' },
  { id: 'schleuder-formen', spiel: 'schleuder', stat: 'formen', ziel: 8, text: 'Fülle 8 Backformen in einer Runde' },
  { id: 'lauf-meter', spiel: 'lauf', stat: 'meter', ziel: 400, text: 'Lauf 400 Meter weit' },
  { id: 'stapler-perfekt', spiel: 'stapler', stat: 'perfektFolge', ziel: 3, text: 'Setze 3 Brote perfekt hintereinander' },
  { id: 'tour-folge', spiel: 'tour', stat: 'ohneUnfall', ziel: 3, text: 'Beliefere 3 Filialen ohne Unfall hintereinander' },
  { id: 'chaos-tage', spiel: 'chaos', stat: 'tage', ziel: 3, text: 'Schaffe 3 Tage in der Backstube' },
  { id: 'schutz-wellen', spiel: 'schutz', stat: 'wellen', ziel: 4, text: 'Halte 4 Wellen durch' },
  { id: 'schleuder-sterne', spiel: 'schleuder', stat: 'sterne', ziel: 6, text: 'Hol 6 Sterne in einer Runde' },
];
let AUFGABE_TEST = null, AUFGABE_ERLEDIGT = '';
const tagKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function aufgabeHeute(d = new Date()){
  if (AUFGABE_TEST) return AUFGABEN.find((a) => a.id === AUFGABE_TEST) || AUFGABEN[0];
  const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  return AUFGABEN[(n * 5) % AUFGABEN.length];
}
const aufgabeErledigt = () => { try { return AUFGABE_ERLEDIGT === tagKey() || localStorage.getItem('lt_abschalten_aufgabe') === tagKey(); } catch { return AUFGABE_ERLEDIGT === tagKey(); } };
function aufgabePruefen(){
  if (!laeuft || rundeGemuetlich || aufgabeErledigt()) return;
  const a = aufgabeHeute(); if (a.spiel !== spiel.key || (RUNDE_STAT[a.stat] || 0) < a.ziel) return;
  AUFGABE_ERLEDIGT = tagKey(); try { localStorage.setItem('lt_abschalten_aufgabe', tagKey()); } catch {}
  schwebText('Tagesaufgabe geschafft!', W / 2, 180, '#2F9A47', 22); brumm(60);
  teilchen(W / 2, 180, { n: 30, form: 'stern', farben: ['#7DBE6E', '#FFC72C', '#FFFFFF'], tempo: 240 });
  nachAussen({ typ: 'lt-abschalten-aufgabe', tag: tagKey(), id: a.id });
}
function aufgabeHtml(){
  const a = aufgabeHeute(), sp = SPIELE[a.spiel]; if (!sp) return '';
  const ok = aufgabeErledigt();
  return `<div class="aufgabe${ok ? ' ok' : ''}"><span><b>${ok ? 'Tagesaufgabe geschafft' : 'Tagesaufgabe'}:</b> ${a.text}${a.spiel !== spiel.key ? ` (${sp.name})` : ''}.</span>${!ok && a.spiel !== spiel.key ? `<button type="button" class="zur-aufgabe" data-k="${a.spiel}" aria-label="Zum ${sp.name}">Hin</button>` : ''}</div>`;
}
function aufgabeKnopf(){
  ueber.querySelector('.zur-aufgabe')?.addEventListener('click', (e) => {
    const k = e.currentTarget.dataset.k;
    if (imRahmen) nachAussen({ typ: 'lt-abschalten-wechsel', key: k }); else if (typeof waehle === 'function') waehle(k);
  });
}
const aufgabeStil = document.createElement('style');
aufgabeStil.textContent = '.aufgabe{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px 6px 12px;border-radius:12px;background:#F3FAEF;border:1.5px solid #CFE6C6;text-align:left;font-size:12.5px;line-height:1.3;color:#2B170A}.aufgabe span{flex:1}.aufgabe b{color:#2F7A3A}.aufgabe.ok{background:#EAF6E4}.aufgabe .zur-aufgabe{flex:0 0 auto;padding:0 12px;border-radius:999px;border:none;background:#2F9A47;color:#fff;font:800 13px var(--text);cursor:pointer;min-height:32px}'
  + '.ueber .fordern{margin-top:2px;border:2px solid #E0A526;background:#FFF8E1;color:#4B2A14;font:800 15px var(--text);border-radius:999px;min-height:44px;padding:0 18px;cursor:pointer}';
document.head.appendChild(aufgabeStil);

// Geister-Lauf: das Spiel liefert am Ende geistDaten() (klein halten), gespeichert nur bei neuem Rekord.
function geistLesen(k){ try { const v = localStorage.getItem('lt_abschalten_geist_' + k); return v ? JSON.parse(v) : null; } catch { return null; } }
function geistSchreiben(k, d){ try { if (d) { const s = JSON.stringify(d); if (s.length < 60000) localStorage.setItem('lt_abschalten_geist_' + k, s); } } catch {} }

function rundeVorbereiten(){
  RUNDE_STAT = {};
  const schon = !!GOLD_SCHON[spiel.key];
  Object.assign(GOLD_RUNDE, { kommt: GOLD_TEST || Math.random() < (schon ? .1 : .2), da: false, gefangen: false });
}
// Für Prüfungen: ?saison=advent&gold=1&aufgabe=stapler-brote
try { const q = new URLSearchParams(location.search); if (q.get('saison')) SAISON_TEST = q.get('saison'); if (q.get('gold')) GOLD_TEST = true; if (q.get('aufgabe')) AUFGABE_TEST = q.get('aufgabe'); } catch {}

// ── Version 269: sanfter Einstieg ──
// Wer dreimal hintereinander sehr früh verliert (unter 20 s Spielzeit), bekommt einen leichteren Start:
// die ersten 25 s läuft das Spiel langsamer (75 %), dann geht es in 5 s auf normales Tempo.
let rundeSanft = false;
const sanftKey = () => 'lt_abschalten_kurz_' + (spiel ? spiel.key : '');
function sanftZaehler(){ try { return Number(localStorage.getItem(sanftKey())) || 0; } catch { return 0; } }
function sanftMerken(sek){
  if (rundeGemuetlich) return;
  try { localStorage.setItem(sanftKey(), String(sek < 20 ? sanftZaehler() + 1 : 0)); } catch {}
}
function sanftFaktor(){
  if (!rundeSanft || rundeGemuetlich) return 1;
  if (spielZeit < 25) return .75;
  return Math.min(1, .75 + (spielZeit - 25) / 5 * .25);
}
const altVorbereiten = rundeVorbereiten;
rundeVorbereiten = function(){ altVorbereiten(); rundeSanft = !GEMUETLICH && sanftZaehler() >= 3; };
