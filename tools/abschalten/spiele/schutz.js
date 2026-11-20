// ───────── Schädlinge abwehren ─────────
// Draufsicht auf ein Mehllager. Mäuse und Motten folgen der Mehlspur zum Tor unten.
const SZ_WEG = [[-26, 98], [292, 98], [292, 202], [68, 202], [68, 306], [292, 306], [292, 394], [180, 394], [180, 470]];
const SZ_PLAETZE = [[62, 150], [142, 150], [222, 150], [334, 254], [140, 254], [222, 254], [116, 350], [214, 350], [96, 440], [264, 440]];
const SZ_ARTEN = {
  falle: { n: 'Mausefalle', kurz: 'Mäuse', preis: 30, reich: [66, 74, 84], schaden: [5, 8.5, 13], cd: [1.2, 1.1, 1], ziel: 'maus' },
  licht: { n: 'Lockstoff-Leuchte', kurz: 'Motten', preis: 40, reich: [82, 92, 104], schaden: [1.6, 2.5, 3.8], cd: [.42, .38, .34], ziel: 'motte' },
  minz: { n: 'Minz-Duft', kurz: 'Bremst', preis: 25, reich: [58, 66, 76], bremse: [.35, .45, .55], ziel: 'alle' },
};
const SZ_REIHE = ['falle', 'licht', 'minz'];
const sz_upPreis = (art, st) => Math.round(SZ_ARTEN[art].preis * (st === 1 ? 1.2 : 1.7));
let sz_bg = null;
const SZ_LAENGE = (() => { let l = 0; for (let i = 1; i < SZ_WEG.length; i++) l += Math.hypot(SZ_WEG[i][0] - SZ_WEG[i - 1][0], SZ_WEG[i][1] - SZ_WEG[i - 1][1]); return l; })();
function sz_punktAuf(d){
  let rest = d;
  for (let i = 1; i < SZ_WEG.length; i++) { const [ax, ay] = SZ_WEG[i - 1], [bx, by] = SZ_WEG[i]; const l = Math.hypot(bx - ax, by - ay); if (rest <= l) return { x: ax + (bx - ax) * rest / l, y: ay + (by - ay) * rest / l, w: Math.atan2(by - ay, bx - ax) }; rest -= l; }
  return null;
}
function sz_wegPfad(){ x.beginPath(); SZ_WEG.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); }

function sz_sack(px, py, w, h, dreh, beschr){
  x.save(); x.translate(px, py); x.rotate(dreh || 0);
  bodenSchatten(2, h * .42, w * .55, h * .18, .35);
  x.beginPath(); x.moveTo(-w * .42, -h * .3); x.quadraticCurveTo(-w * .55, h * .1, -w * .44, h * .42); x.quadraticCurveTo(0, h * .55, w * .44, h * .42); x.quadraticCurveTo(w * .55, h * .1, w * .42, -h * .3); x.quadraticCurveTo(w * .2, -h * .42, 0, -h * .36); x.quadraticCurveTo(-w * .2, -h * .42, -w * .42, -h * .3); x.closePath();
  x.fillStyle = radial(-w * .1, -h * .05, 2, w * .7, [[0, '#FFFBF0'], [.6, '#EFE2C8'], [1, '#C9B48E']], -w * .2, -h * .2); x.fill();
  x.strokeStyle = 'rgba(120,90,50,.35)'; x.lineWidth = 1; x.stroke();
  // Zipfel und Band
  x.fillStyle = '#E6D6B6'; x.beginPath(); x.moveTo(-w * .14, -h * .36); x.lineTo(-w * .2, -h * .56); x.lineTo(0, -h * .48); x.lineTo(w * .2, -h * .56); x.lineTo(w * .14, -h * .36); x.fill();
  x.fillStyle = '#B5432C'; rr(-w * .17, -h * .42, w * .34, h * .08, 2); x.fill();
  if (beschr !== false) { x.fillStyle = 'rgba(181,67,44,.75)'; rr(-w * .22, -h * .05, w * .44, h * .22, 2); x.fill(); x.fillStyle = 'rgba(255,245,225,.9)'; x.font = `800 ${Math.max(6, w * .14)}px "Plus Jakarta Sans", system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MEHL', 0, h * .06); }
  x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.ellipse(-w * .2, -h * .12, w * .08, h * .16, .3, 0, 7); x.fill();
  x.restore();
}

function sz_statisch(){
  // Fliesenboden
  x.fillStyle = '#E6D8BE'; x.fillRect(0, 0, W, H);
  const t = 30;
  for (let r = 0; r < H / t + 1; r++) for (let k = 0; k < W / t + 1; k++) { const z = zufallFest(r * 17 + k * 7); x.fillStyle = (r + k) % 2 ? `rgb(${232 + z * 8 | 0},${220 + z * 8 | 0},${196 + z * 8 | 0})` : `rgb(${222 + z * 8 | 0},${208 + z * 8 | 0},${182 + z * 8 | 0})`; rr(k * t + 1, r * t + 1, t - 2, t - 2, 3); x.fill(); x.fillStyle = 'rgba(255,255,255,.28)'; x.fillRect(k * t + 3, r * t + 2, t - 6, 1.5); }
  x.fillStyle = linear(0, 0, W, H, [[0, 'rgba(255,245,220,.25)'], [1, 'rgba(90,60,30,.18)']]); x.fillRect(0, 0, W, H);
  // Mehlspur
  x.lineCap = 'round'; x.lineJoin = 'round';
  sz_wegPfad(); x.strokeStyle = 'rgba(140,105,60,.13)'; x.lineWidth = 44; x.stroke();
  sz_wegPfad(); x.strokeStyle = 'rgba(255,251,240,.38)'; x.lineWidth = 38; x.stroke();
  sz_wegPfad(); x.strokeStyle = 'rgba(255,252,244,.42)'; x.lineWidth = 26; x.stroke();
  sz_wegPfad(); x.strokeStyle = 'rgba(255,255,252,.35)'; x.lineWidth = 12; x.stroke();
  for (let i = 0; i < 1400; i++) { const p = sz_punktAuf(zufallFest(i) * SZ_LAENGE); if (!p) continue; const g = (zufallFest(i + 900) + zufallFest(i + 1900) + zufallFest(i + 2900)) / 3 - .5; const o = g * 62; const r = .7 + zufallFest(i + 3) * (Math.abs(g) < .15 ? 3.4 : 1.8); x.fillStyle = `rgba(255,255,250,${.3 + zufallFest(i + 77) * .5})`; x.beginPath(); x.arc(p.x - Math.sin(p.w) * o, p.y + Math.cos(p.w) * o, r, 0, 7); x.fill(); }
  // Pfotenspuren
  for (let i = 0; i < 60; i++) { const p = sz_punktAuf(20 + i * (SZ_LAENGE / 60)); if (!p) continue; const s = i % 2 ? 5 : -5; x.fillStyle = 'rgba(160,130,90,.22)'; x.beginPath(); x.arc(p.x - Math.sin(p.w) * s, p.y + Math.cos(p.w) * s, 1.6, 0, 7); x.fill(); }
  // Mauern
  const mauer = (px, py, w, h) => { x.fillStyle = linear(px, py, px + w, py + h, [[0, '#9A6B45'], [1, '#6E4428']]); x.fillRect(px, py, w, h); x.fillStyle = 'rgba(255,230,200,.12)'; for (let yy = py; yy < py + h; yy += 10) x.fillRect(px, yy, w, 1); };
  mauer(0, 0, W, 76); mauer(0, 76, 10, 6); mauer(350, 76, 10, H - 76);
  mauer(0, 118, 10, H - 118);
  x.fillStyle = linear(0, 76, 0, 92, [[0, 'rgba(40,20,5,.4)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(0, 76, W, 16);
  x.fillStyle = linear(10, 0, 22, 0, [[0, 'rgba(40,20,5,.35)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(10, 76, 12, H);
  x.fillStyle = linear(350, 0, 338, 0, [[0, 'rgba(40,20,5,.3)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(338, 76, 12, H);
  // Mauseloch links
  x.fillStyle = '#1E120A'; x.beginPath(); x.moveTo(0, 118); x.lineTo(0, 78); x.lineTo(8, 78); x.arc(8, 98, 20, -Math.PI / 2, Math.PI / 2); x.closePath(); x.fill();
  // Regal oben mit Säcken
  holz(8, 60, 344, 12, 3, '#C08A52', '#7E5028');
  for (let i = 0; i < 8; i++) sz_sack(30 + i * 43, 44, 40, 34, (zufallFest(i) - .5) * .15, i % 2 === 0);
  // Säcke am Rand (Deko)
  sz_sack(330, 150, 30, 26, .2, false); sz_sack(334, 172, 28, 24, -.15, false);
  sz_sack(30, 254, 30, 26, -.2, false);
  sz_sack(330, 352, 30, 26, .15, false);
  sz_sack(40, 350, 26, 22, .1, false);
  // Bauplätze (leer)
  for (const [px, py] of SZ_PLAETZE) { x.fillStyle = 'rgba(120,85,45,.14)'; x.beginPath(); x.arc(px, py + 2, 23, 0, 7); x.fill(); x.fillStyle = radial(px, py, 4, 22, [[0, 'rgba(255,250,235,.85)'], [1, 'rgba(236,222,195,.85)']], px - 6, py - 6); x.beginPath(); x.arc(px, py, 21, 0, 7); x.fill(); x.strokeStyle = 'rgba(150,110,60,.55)'; x.setLineDash([4, 4]); x.lineWidth = 2; x.stroke(); x.setLineDash([]); x.strokeStyle = 'rgba(150,110,60,.45)'; x.lineWidth = 2.5; x.lineCap = 'round'; x.beginPath(); x.moveTo(px - 6, py); x.lineTo(px + 6, py); x.moveTo(px, py - 6); x.lineTo(px, py + 6); x.stroke(); }
  x.fillStyle = radial(150, 230, 40, 300, [[0, 'rgba(255,240,200,.18)'], [1, 'rgba(255,240,200,0)']]); x.fillRect(0, 0, W, H); vignette(.22);
  // Lagertor unten
  const tx = 134, ty = 438;
  x.fillStyle = '#5E3A1E'; rr(tx - 10, ty - 8, 112, 60, 10); x.fill();
  x.fillStyle = linear(0, ty, 0, ty + 50, [[0, '#2A1A10'], [1, '#4A2E18']]); rr(tx, ty, 92, 50, 6); x.fill();
  sz_sack(tx + 22, ty + 30, 28, 24, -.1, false); sz_sack(tx + 46, ty + 26, 30, 26, .05, false); sz_sack(tx + 70, ty + 31, 28, 24, .12, false);
  x.fillStyle = 'rgba(30,15,5,.35)'; x.fillRect(tx, ty, 92, 12);
  rr(tx + 18, ty - 20, 56, 16, 8); x.fillStyle = linear(0, ty - 20, 0, ty - 4, [[0, '#FFD95A'], [1, '#E6A800']]); x.fill(); x.strokeStyle = '#8A5A10'; x.lineWidth = 1; x.stroke();
}

function sz_maus(t, zeit){
  const p = t.p; if (!p) return;
  const dick = t.art === 'dick', sk = dick ? 1.45 : 1;
  const lauf = zeit * (dick ? 14 : 20) + t.seed * 10;
  bodenSchatten(p.x, p.y + 6 * sk, 13 * sk, 5 * sk, .3);
  x.save(); x.translate(p.x, p.y); x.rotate(p.w); x.scale(sk * (1 + (t.treffer > 0 ? t.treffer * .3 : 0)), sk * (1 - (t.treffer > 0 ? t.treffer * .2 : 0)));
  // Schwanz
  x.strokeStyle = '#D9A1A0'; x.lineWidth = 2.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-11, 0); x.bezierCurveTo(-18, Math.sin(lauf * .5) * 6, -24, -Math.sin(lauf * .5) * 6, -30, Math.sin(lauf * .5 + 1) * 4); x.stroke();
  // Füße
  x.fillStyle = '#F2B8B5'; const f = Math.sin(lauf) * 3;
  for (const [fx, fy] of [[6 + f, 7], [6 - f, -7], [-6 - f, 7], [-6 + f, -7]]) { x.beginPath(); x.ellipse(fx, fy, 2.4, 1.6, 0, 0, 7); x.fill(); }
  // Körper
  const grau = dick ? ['#B9AFA8', '#8A7E76', '#5E544E'] : ['#C8C4CC', '#9A96A2', '#6E6A78'];
  x.fillStyle = radial(0, 0, 1, 14, [[0, grau[0]], [.6, grau[1]], [1, grau[2]]], -3, -4); x.beginPath(); x.ellipse(-1, 0, 12.5, 8, 0, 0, 7); x.fill();
  // Kopf
  x.beginPath(); x.moveTo(6, -6.5); x.quadraticCurveTo(19, -2, 18, 0); x.quadraticCurveTo(19, 2, 6, 6.5); x.closePath(); x.fill();
  // Ohren
  for (const s of [-1, 1]) { x.fillStyle = grau[1]; x.beginPath(); x.arc(5, s * 8, 5, 0, 7); x.fill(); x.fillStyle = '#F4B6B4'; x.beginPath(); x.arc(5.4, s * 8.2, 3.2, 0, 7); x.fill(); }
  // Augen, Nase
  x.fillStyle = '#1E1418'; x.beginPath(); x.arc(11.5, -3, 1.6, 0, 7); x.arc(11.5, 3, 1.6, 0, 7); x.fill();
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(12, -3.5, .6, 0, 7); x.arc(12, 2.5, .6, 0, 7); x.fill();
  x.fillStyle = '#E2737A'; x.beginPath(); x.arc(18.4, 0, 2, 0, 7); x.fill();
  x.strokeStyle = 'rgba(60,50,60,.45)'; x.lineWidth = .7; x.beginPath(); x.moveTo(16, -1); x.lineTo(22, -5); x.moveTo(16, 1); x.lineTo(22, 5); x.moveTo(16, 0); x.lineTo(23, 0); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.ellipse(-3, -3.5, 6, 2.2, 0, 0, 7); x.fill();
  if (t.treffer > 0) { x.globalAlpha = t.treffer; x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(-1, 0, 12.5, 8, 0, 0, 7); x.fill(); x.globalAlpha = 1; }
  x.restore();
}
function sz_motte(t, zeit){
  const p = t.p; if (!p) return;
  const fl = Math.sin(zeit * 26 + t.seed * 9), hoch = 10 + Math.sin(zeit * 3 + t.seed * 5) * 3;
  const ox = Math.sin(p.w + Math.PI / 2) * Math.sin(t.d * .05) * 9, oy = -Math.cos(p.w + Math.PI / 2) * Math.sin(t.d * .05) * 9;
  bodenSchatten(p.x + ox + 4, p.y + oy + 6, 11, 4, .22);
  x.save(); x.translate(p.x + ox, p.y + oy - hoch); x.rotate(p.w + Math.PI / 2);
  const sk = 1 + (t.treffer > 0 ? t.treffer * .25 : 0); x.scale(sk, sk);
  // Leuchten, wenn angelockt
  if (t.gelockt > 0) { x.fillStyle = radial(0, 0, 0, 20, [[0, `rgba(255,236,150,${t.gelockt * .5})`], [1, 'rgba(255,236,150,0)']]); x.beginPath(); x.arc(0, 0, 20, 0, 7); x.fill(); }
  for (const s of [-1, 1]) {
    x.save(); x.scale(s * (.55 + .45 * Math.abs(fl)), 1);
    x.fillStyle = radial(8, -2, 1, 13, [[0, '#E8DCC6'], [.7, '#B8A588'], [1, '#8E7A5E']]); x.beginPath(); x.ellipse(8, -3, 10, 7, -.35, 0, 7); x.fill();
    x.fillStyle = radial(6, 6, 1, 8, [[0, '#DCCDB2'], [1, '#9C8868']]); x.beginPath(); x.ellipse(6, 5, 6.5, 5, .4, 0, 7); x.fill();
    x.fillStyle = 'rgba(110,85,55,.5)'; x.beginPath(); x.arc(10, -3, 2, 0, 7); x.fill();
    x.restore();
  }
  x.fillStyle = linear(0, -8, 0, 9, [[0, '#7A6248'], [1, '#4E3C2A']]); x.beginPath(); x.ellipse(0, 1, 3, 8, 0, 0, 7); x.fill();
  x.fillStyle = '#5E4A34'; x.beginPath(); x.arc(0, -7, 3.4, 0, 7); x.fill();
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(-1.4, -8, 1.1, 0, 7); x.arc(1.4, -8, 1.1, 0, 7); x.fill();
  x.fillStyle = '#1E1418'; x.beginPath(); x.arc(-1.4, -8.2, .6, 0, 7); x.arc(1.4, -8.2, .6, 0, 7); x.fill();
  x.strokeStyle = '#5E4A34'; x.lineWidth = .9; x.beginPath(); x.moveTo(-1, -9.5); x.quadraticCurveTo(-4, -15, -6, -15); x.moveTo(1, -9.5); x.quadraticCurveTo(4, -15, 6, -15); x.stroke();
  if (t.treffer > 0) { x.globalAlpha = t.treffer * .8; x.fillStyle = '#FFF6C8'; x.beginPath(); x.arc(0, 0, 12, 0, 7); x.fill(); x.globalAlpha = 1; }
  x.restore();
}

function sz_falleMalen(f, zeit, ausw){
  const { x: px, y: py, st } = f;
  const auf = ease.feder(Math.min(1, f.ein));
  x.save(); x.translate(px, py); x.scale(auf * 1.12, auf * 1.12);
  bodenSchatten(1, 14, 22, 6, .38);
  if (ausw !== 'icon') { x.fillStyle = radial(0, 0, 4, 22, [[0, 'rgba(255,250,235,.95)'], [1, 'rgba(230,214,185,.95)']], -6, -6); x.beginPath(); x.arc(0, 0, 21, 0, 7); x.fill(); }
  if (f.art === 'falle') {
    // Holzbrett
    rr(-18, -12, 36, 26, 5); x.fillStyle = linear(0, -12, 0, 14, [[0, '#E2B47A'], [1, '#A9733D']]); x.fill(); x.strokeStyle = 'rgba(90,55,20,.55)'; x.lineWidth = 1.2; x.stroke();
    x.strokeStyle = 'rgba(110,70,30,.25)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-16, -7 + i * 6); x.lineTo(16, -6 + i * 6); x.stroke(); }
    // Käse-Köder
    x.fillStyle = '#FFD24A'; x.beginPath(); x.moveTo(-4, 6); x.lineTo(7, 2); x.lineTo(7, 9); x.closePath(); x.fill(); x.fillStyle = '#E0A800'; x.beginPath(); x.arc(2, 6, 1.2, 0, 7); x.fill();
    // Bügel (schnappt)
    const sn = f.schnapp > 0 ? f.schnapp : 0, by = lerp(-10, 8, sn);
    x.strokeStyle = '#E8EDF2'; x.lineWidth = 2.6; x.lineJoin = 'round'; x.beginPath(); x.moveTo(-14, 0); x.lineTo(-14, by); x.lineTo(14, by); x.lineTo(14, 0); x.stroke();
    x.strokeStyle = '#7A848E'; x.lineWidth = 1; x.stroke();
    x.fillStyle = '#9AA6B2'; rr(-15, -2, 30, 4, 2); x.fill();
  } else if (f.art === 'licht') {
    // Leuchte: Sockel, Glaskugel
    x.fillStyle = linear(-10, 0, 10, 0, [[0, '#5E3A1E'], [.5, '#9A6438'], [1, '#4B2A14']]); rr(-12, 4, 24, 10, 4); x.fill();
    x.fillStyle = '#C98A00'; rr(-7, -2, 14, 7, 2); x.fill();
    const pu = .75 + .25 * Math.sin(zeit * 4 + px);
    x.fillStyle = radial(0, -10, 0, 26, [[0, `rgba(255,236,140,${.55 * pu})`], [1, 'rgba(255,236,140,0)']]); x.beginPath(); x.arc(0, -10, 26, 0, 7); x.fill();
    x.fillStyle = radial(0, -10, 1, 12, [[0, '#FFFDE6'], [.5, '#FFE27A'], [1, '#F2B400']], -3, -14); x.beginPath(); x.arc(0, -10, 11, 0, 7); x.fill();
    x.strokeStyle = 'rgba(150,100,0,.6)'; x.lineWidth = 1.2; x.stroke();
    x.strokeStyle = 'rgba(120,80,0,.45)'; x.beginPath(); x.moveTo(-11, -10); x.lineTo(11, -10); x.moveTo(0, -21); x.lineTo(0, 1); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.ellipse(-4, -14, 3, 2, -.6, 0, 7); x.fill();
  } else {
    // Minz-Topf
    const pu = (zeit * .8 + px * .01) % 1;
    x.strokeStyle = `rgba(80,190,140,${.45 * (1 - pu)})`; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 10 + pu * 26, 0, 7); x.stroke();
    x.fillStyle = linear(-12, 0, 12, 0, [[0, '#B5562E'], [.4, '#E0875A'], [1, '#8E3E1C']]); x.beginPath(); x.moveTo(-12, -1); x.lineTo(12, -1); x.lineTo(9, 13); x.lineTo(-9, 13); x.closePath(); x.fill();
    rr(-14, -4, 28, 6, 3); x.fillStyle = '#C8653A'; x.fill();
    const blatt = (bx, by, w) => { x.save(); x.translate(bx, by); x.rotate(w); x.fillStyle = linear(0, -8, 0, 8, [[0, '#7FD49A'], [1, '#2E8A50']]); x.beginPath(); x.ellipse(0, -6, 5, 8, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(20,80,40,.5)'; x.lineWidth = .8; x.beginPath(); x.moveTo(0, 1); x.lineTo(0, -12); x.stroke(); x.restore(); };
    const wi = Math.sin(zeit * 2 + px) * .08;
    blatt(-6, -4, -.6 + wi); blatt(6, -4, .6 - wi); blatt(0, -6, wi); blatt(-2, -2, -1.2 + wi); blatt(3, -2, 1.2 - wi);
  }
  // Stufen-Sterne
  for (let i = 0; i < st; i++) { const sx = -10 + i * 10, sy = 22; x.fillStyle = '#FFC72C'; x.strokeStyle = '#8A5A00'; x.lineWidth = 1; x.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 2 : 4.4; x.lineTo(sx + Math.cos(k * Math.PI / 5 - Math.PI / 2) * r, sy + Math.sin(k * Math.PI / 5 - Math.PI / 2) * r); } x.closePath(); x.fill(); x.stroke(); }
  x.restore();
  if (ausw === true) { x.strokeStyle = '#FFC72C'; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 25, 0, 7); x.stroke(); }
}

function sz_kornIcon(px, py, s){ x.save(); x.translate(px, py); x.rotate(.45); x.fillStyle = linear(-4, -7, 4, 7, [[0, '#F7C64A'], [1, '#B9800E']]); x.beginPath(); x.ellipse(0, 0, 4.2 * s, 7 * s, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,245,200,.85)'; x.lineWidth = 1.1 * s; x.beginPath(); x.moveTo(-1 * s, -4 * s); x.quadraticCurveTo(1 * s, 0, 0, 4 * s); x.stroke(); x.restore(); }

SPIELE.schutz = {
  key: 'schutz', name: 'Schädlinge abwehren', kurz: 'Verteidigen',
  anleitung: 'Mäuse und Motten wollen ins Mehllager. Tippe einen Platz und wähle eine Falle: Mausefalle gegen Mäuse, Leuchte gegen Motten, Minz-Duft bremst alle. Nochmal tippen verbessert sie.',
  start(){
    this.geld = 75; this.lager = 5; this.welle = 0; this.tiere = []; this.fallen = []; this.schuesse = []; this.koerner = [];
    this.pause = 6; this.spawnRest = 0; this.spawnT = 0; this.punkte = 0; this.menu = null; this.zeit = 0; this.banner = 0; this.bannerText = ''; this.bannerSub = '';
    this.vorbei = 0; this.besiegt = 0; this.reichZeig = null; this.lagerWackel = 0; this.frageNach = false;
  },
  falleAuf(i){ return this.fallen.find((f) => f.platz === i); },
  menuKnoepfe(){
    const m = this.menu; if (!m) return [];
    const [px, py] = SZ_PLAETZE[m.platz], f = this.falleAuf(m.platz);
    const oben = py > 130, dy = oben ? -1 : 1;
    let k;
    if (!f) k = SZ_REIHE.map((art, j) => ({ art, typ: 'bau', preis: SZ_ARTEN[art].preis, x: px + (j - 1) * 56, y: py + dy * (j === 1 ? 62 : 52) }));
    else { k = []; if (f.st < 3) k.push({ typ: 'up', art: f.art, preis: sz_upPreis(f.art, f.st), x: px - 30, y: py + dy * 58 }); k.push({ typ: 'weg', art: f.art, preis: -Math.round(f.wert * .6), x: px + (f.st < 3 ? 30 : 0), y: py + dy * 58 }); }
    for (const b of k) b.x = klemm(b.x, 30, W - 30);
    return k;
  },
  runter(p){
    if (this.vorbei) return;
    if (this.menu) {
      for (const b of this.menuKnoepfe()) if (Math.hypot(p.x - b.x, p.y - b.y) < 27) { this.knopf(b); return; }
    }
    for (let i = 0; i < SZ_PLAETZE.length; i++) { const [px, py] = SZ_PLAETZE[i]; if (Math.hypot(p.x - px, p.y - py) < 26) { this.menu = this.menu && this.menu.platz === i ? null : { platz: i, t: 0 }; return; } }
    this.menu = null;
  },
  knopf(b){
    const i = this.menu.platz, [px, py] = SZ_PLAETZE[i];
    if (b.typ === 'weg') { const f = this.falleAuf(i); this.fallen = this.fallen.filter((ff) => ff !== f); this.geld += -b.preis; schwebText('+' + (-b.preis), px, py - 20, '#C98A00', 16); mehlWolke(px, py, 8); this.menu = null; return; }
    if (this.geld < b.preis) { schwebText('Zu wenig Körner', b.x, b.y - 30, F.rot, 14); wackeln(2); return; }
    this.geld -= b.preis;
    if (b.typ === 'bau') { this.fallen.push({ platz: i, x: px, y: py, art: b.art, st: 1, cd: .3, ein: 0, schnapp: 0, wert: b.preis }); schwebText(SZ_ARTEN[b.art].n, px, py - 30, F.braun, 14); }
    else { const f = this.falleAuf(i); f.st++; f.ein = .35; f.wert += b.preis; schwebText('Stufe ' + f.st, px, py - 30, '#C98A00', 16); teilchen(px, py, { n: 14, form: 'stern' }); }
    mehlWolke(px, py + 6, 8); this.reichZeig = { platz: i, t: 2 }; this.menu = null;
  },
  neueWelle(){
    this.welle++; const w = this.welle;
    const liste = [];
    const n = 6 + w * 2;
    for (let i = 0; i < n; i++) liste.push(w >= 2 && (w === 2 ? i % 5 === 2 : i % 3 === 1 || (w >= 5 && i % 4 === 0)) ? 'motte' : 'maus');
    if (w >= 4) { for (let i = 0; i < Math.min(3, w - 3); i++) liste.splice(ganz(2, liste.length), 0, 'dick'); }
    if (w === 2) liste.sort((a, b) => (a === 'motte') - (b === 'motte'));
    this.warteschlange = liste; this.spawnT = 0;
    this.banner = 2.2; this.bannerText = `Welle ${w}`;
    this.bannerSub = w === 1 ? 'Mäuse kommen durchs Loch' : w === 2 ? 'Motten! Baue eine Leuchte' : w === 4 ? 'Dicke Mäuse sind zäh' : 'Sie werden mehr';
  },
  tick(dt){
    this.zeit += dt;
    if (this.banner > 0) this.banner -= dt;
    if (this.menu) this.menu.t += dt;
    if (this.reichZeig) { this.reichZeig.t -= dt; if (this.reichZeig.t <= 0) this.reichZeig = null; }
    this.lagerWackel = Math.max(0, this.lagerWackel - dt * 2);
    for (const k of this.koerner) k.t += dt / .7; this.koerner = this.koerner.filter((k) => k.t < 1);
    if (this.vorbei) { this.vorbei += dt; if (this.vorbei > 1 && laeuft) ende(this.punkte + this.welle * 25, `Bis Welle ${this.welle} das Mehl verteidigt, ${this.besiegt} Schädlinge vertrieben.`); return; }
    // Wellen
    if (this.pause > 0) { this.pause -= dt; if (this.pause <= 0) this.neueWelle(); }
    else if (this.warteschlange && this.warteschlange.length) {
      this.spawnT -= dt;
      if (this.spawnT <= 0) { const art = this.warteschlange.shift(), w = this.welle; const f = Math.pow(1.2, w - 1); const hp = art === 'maus' ? 7 * f : art === 'motte' ? 5 * f : 26 * f; const v = art === 'maus' ? (w === 1 ? 38 : 44 + w) : art === 'motte' ? 54 + w : 28; this.tiere.push({ art, d: 0, hp, max: hp, v, seed: Math.random(), treffer: 0, gelockt: 0 }); this.spawnT = w === 1 ? 1.7 : Math.max(.55, 1.25 - w * .06); }
    } else if (!this.tiere.length && this.welle > 0) {
      const bonus = 10 + this.welle * 2; this.geld += bonus; this.punkte += this.welle * 25;
      this.banner = 2; this.bannerText = 'Welle geschafft'; this.bannerSub = `+${bonus} Körner`;
      this.pause = 4.5; this.warteschlange = null;
      if (this.welle % 2 === 0) setTimeout(() => { if (laeuft && !this.vorbei) frage((ok) => { if (ok) { this.geld += 40; schwebText('+40 Körner', W / 2, 240, '#C98A00', 22); teilchen(W / 2, 240, { n: 20, form: 'stern' }); } }); }, 900);
    }
    // Tiere bewegen
    for (const t of this.tiere) {
      let bremse = 0;
      for (const f of this.fallen) if (f.art === 'minz' && t.p && Math.hypot(t.p.x - f.x, t.p.y - f.y) < SZ_ARTEN.minz.reich[f.st - 1]) bremse = Math.max(bremse, SZ_ARTEN.minz.bremse[f.st - 1]);
      t.gebremst = bremse; t.d += t.v * (1 - bremse) * dt; t.p = sz_punktAuf(t.d);
      t.treffer = Math.max(0, t.treffer - dt * 5); t.gelockt = Math.max(0, t.gelockt - dt * 2);
      if (!t.p || t.p.y > 452) { t.weg = true; const schaden = t.art === 'dick' ? 2 : 1; this.lager -= schaden; this.lagerWackel = 1; wackeln(6); blitz(.22, '224,69,46'); schwebText(t.art === 'motte' ? 'Motte im Mehl' : 'Maus im Mehl', 180, 420, F.rot, 15); }
    }
    // Fallen
    for (const f of this.fallen) {
      f.ein = Math.min(1, f.ein + dt * 3); f.schnapp = Math.max(0, f.schnapp - dt * 3); f.cd -= dt;
      if (f.art === 'minz' || f.cd > 0) continue;
      const a = SZ_ARTEN[f.art], reich = a.reich[f.st - 1];
      const ziel = this.tiere.filter((t) => t.p && !t.weg && (a.ziel === 'maus' ? t.art !== 'motte' : t.art === 'motte') && Math.hypot(t.p.x - f.x, t.p.y - f.y) < reich).sort((u, v) => v.d - u.d)[0];
      if (!ziel) continue;
      f.cd = a.cd[f.st - 1]; ziel.hp -= a.schaden[f.st - 1]; ziel.treffer = 1;
      const zx = ziel.p.x, zy = ziel.p.y - (ziel.art === 'motte' ? 10 : 0);
      this.schuesse.push({ art: f.art, x1: f.x, y1: f.y - (f.art === 'licht' ? 10 : 0), x2: zx, y2: zy, t: 0 });
      if (f.art === 'falle') { f.schnapp = 1; teilchen(zx, zy, { n: 6, farben: ['#FFFFFF', '#FFE08A'], form: 'stern', tempo: 90, groesse: [2, 4], leben: [.2, .4] }); }
      else { ziel.gelockt = 1; teilchen(zx, zy, { n: 3, farben: ['#FFF6C8', '#FFE08A'], tempo: 50, groesse: [1.5, 3], schwer: 0, leben: [.2, .4] }); }
      if (ziel.hp <= 0) {
        ziel.weg = true; this.besiegt++;
        const geld = ziel.art === 'dick' ? 12 : ziel.art === 'motte' ? 5 : 4; this.geld += geld; this.punkte += ziel.art === 'dick' ? 30 : ziel.art === 'motte' ? 12 : 10;
        mehlWolke(zx, zy, 10); teilchen(zx, zy, { n: 8, farben: ['#E3A928', '#F7C64A', '#FFF1B8'], form: 'krume', tempo: 110 });
        schwebText('+' + geld, zx, zy - 14, '#B9800E', 16);
        this.koerner.push({ x0: zx, y0: zy, t: 0 });
      }
    }
    for (const s of this.schuesse) s.t += dt / (s.art === 'falle' ? .22 : .16); this.schuesse = this.schuesse.filter((s) => s.t < 1);
    this.tiere = this.tiere.filter((t) => !t.weg);
    if (this.lager <= 0) { this.lager = 0; this.vorbei = .01; }
    setHud([{ icon: 'flagge', text: `Welle ${Math.max(1, this.welle)}` }, { icon: 'korn', text: String(this.geld) }, herzen(Math.max(0, this.lager), 5)]);
  },
  malen(zeit){
    if (!sz_bg || sz_bg.width !== c.width || sz_bg.height !== c.height) {
      sz_statisch();
      if (FX.wackel === 0) { sz_bg = document.createElement('canvas'); sz_bg.width = c.width; sz_bg.height = c.height; sz_bg.getContext('2d').drawImage(c, 0, 0); }
    } else x.drawImage(sz_bg, 0, 0, W, H);
    // Lagertor-Warnung
    if (this.lagerWackel > 0) { x.fillStyle = `rgba(224,69,46,${this.lagerWackel * .35})`; rr(124, 430, 112, 60, 10); x.fill(); }
    text('LAGER', 180, 426, { gr: 10, farbe: F.braun, schat: false });
    // Reichweite
    const zeigR = this.menu ? this.menu.platz : this.reichZeig ? this.reichZeig.platz : null;
    if (zeigR !== null) { const f = this.falleAuf(zeigR); if (f) { const r = SZ_ARTEN[f.art].reich[f.st - 1], a = this.menu ? 1 : Math.min(1, this.reichZeig.t); const fa = f.art === 'falle' ? '201,138,0' : f.art === 'licht' ? '255,200,40' : '60,170,110'; x.fillStyle = `rgba(${fa},${.12 * a})`; x.beginPath(); x.arc(f.x, f.y, r, 0, 7); x.fill(); x.strokeStyle = `rgba(${fa},${.7 * a})`; x.lineWidth = 2; x.setLineDash([6, 5]); x.stroke(); x.setLineDash([]); } }
    // Minz-Wolken
    for (const f of this.fallen || []) if (f.art === 'minz') { const r = SZ_ARTEN.minz.reich[f.st - 1]; x.fillStyle = radial(f.x, f.y, r * .2, r, [[0, 'rgba(110,210,160,.16)'], [1, 'rgba(110,210,160,0)']]); x.beginPath(); x.arc(f.x, f.y, r, 0, 7); x.fill(); }
    // Fallen
    for (const f of this.fallen || []) sz_falleMalen(f, zeit, this.menu && this.menu.platz === f.platz);
    // Tiere (Mäuse unten, Motten oben)
    const tiere = this.tiere || [];
    for (const t of tiere) if (t.art !== 'motte') { sz_maus(t, zeit); if (t.gebremst) this.minzKringel(t, zeit); }
    for (const t of tiere) if (t.art === 'motte') sz_motte(t, zeit);
    for (const t of tiere) if (t.p && t.hp < t.max) { const yy = t.p.y - (t.art === 'motte' ? 34 : t.art === 'dick' ? 22 : 17); rr(t.p.x - 12, yy, 24, 5, 2.5); x.fillStyle = 'rgba(40,20,5,.55)'; x.fill(); rr(t.p.x - 11, yy + 1, 22 * Math.max(0, t.hp / t.max), 3, 1.5); x.fillStyle = t.hp / t.max > .5 ? '#5BD46E' : t.hp / t.max > .25 ? '#F2B400' : '#E0452E'; x.fill(); }
    // Treffer
    for (const s of this.schuesse || []) {
      const a = 1 - s.t;
      if (s.art === 'licht') { x.strokeStyle = `rgba(255,226,120,${a * .8})`; x.lineWidth = 6 * a + 1; x.lineCap = 'round'; x.beginPath(); x.moveTo(s.x1, s.y1); x.lineTo(s.x2, s.y2); x.stroke(); x.strokeStyle = `rgba(255,255,240,${a})`; x.lineWidth = 2; x.stroke(); }
      else { const t = ease.aus(s.t); const mx = (s.x1 + s.x2) / 2, my = Math.min(s.y1, s.y2) - 24; const px = (1 - t) * (1 - t) * s.x1 + 2 * (1 - t) * t * mx + t * t * s.x2, py = (1 - t) * (1 - t) * s.y1 + 2 * (1 - t) * t * my + t * t * s.y2; x.fillStyle = '#FFD24A'; x.strokeStyle = '#B98200'; x.lineWidth = 1; x.beginPath(); x.moveTo(px - 4, py + 3); x.lineTo(px + 5, py); x.lineTo(px - 3, py - 4); x.closePath(); x.fill(); x.stroke(); }
    }
    // Körner fliegen nach oben
    for (const k of this.koerner || []) { const t = ease.ein(k.t); sz_kornIcon(lerp(k.x0, 180, t), lerp(k.y0, 22, t) - Math.sin(t * Math.PI) * 30, 1 - t * .3); }
    // Menü
    if (this.menu) this.menuMalen(zeit);
    // Hinweis am Anfang
    if (laeuft && !this.fallen.length && !this.menu && !this.vorbei) { const b = Math.abs(Math.sin(zeit * 4)) * 6; const [hx, hy] = SZ_PLAETZE[5]; x.save(); x.translate(hx, hy - 30 - b); x.fillStyle = '#FFC72C'; x.strokeStyle = '#4B2A14'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 14); x.lineTo(-11, 1); x.lineTo(-4.5, 1); x.lineTo(-4.5, -12); x.lineTo(4.5, -12); x.lineTo(4.5, 1); x.lineTo(11, 1); x.closePath(); x.stroke(); x.fill(); x.restore(); this.zettel('Tippe einen Platz und baue eine Falle', 404); }
    else if (laeuft && this.menu && this.fallen.length === 0) this.zettel('Mausefalle gegen Mäuse wählen', 404);
    else if (laeuft && !this.vorbei && this.welle === 1 && this.pause > 0 && !this.fallen.some((f) => f.art === 'licht')) this.zettel(this.menu ? 'Die Leuchte lockt Motten an' : 'Gleich kommen Motten: baue eine Leuchte', 404);
    // Countdown bis zur nächsten Welle
    if (laeuft && this.pause > 0 && this.banner <= 0 && !this.vorbei) { const s = Math.ceil(this.pause); rr(W / 2 - 74, 84, 148, 26, 13); x.fillStyle = 'rgba(43,23,10,.82)'; x.fill(); text(`Welle ${this.welle + 1} in ${s}`, W / 2, 97, { gr: 13, farbe: '#FFE08A', schat: false }); }
    // Banner
    if (this.banner > 0 && laeuft) { const dauer = 2.2, t = dauer - this.banner, a = Math.min(1, this.banner * 2.5, t * 6), s = ease.feder(Math.min(1, t * 3)); x.save(); x.globalAlpha = a; x.translate(W / 2, 236); x.scale(s, s); bodenSchatten(0, 34, 110, 10, .4); rr(-110, -30, 220, 60, 20); x.fillStyle = linear(0, -30, 0, 30, [[0, '#5A3820'], [1, '#3A2010']]); x.fill(); x.strokeStyle = '#FFC72C'; x.lineWidth = 2.5; x.stroke(); text(this.bannerText, 0, -7, { gr: 24, farbe: '#FFE08A', schrift: 'Fraunces' }); text(this.bannerSub, 0, 16, { gr: 12, farbe: '#F5E6C8', art: '700', schat: false }); x.restore(); }
  },
  minzKringel(t, zeit){ const p = t.p; x.strokeStyle = 'rgba(70,180,120,.7)'; x.lineWidth = 1.5; for (let i = 0; i < 2; i++) { const w = zeit * 4 + i * Math.PI; x.beginPath(); x.arc(p.x + Math.cos(w) * 12, p.y - 12 + Math.sin(w) * 4, 3, 0, 5); x.stroke(); } },
  zettel(t, yy){ x.save(); x.font = '800 13px "Plus Jakarta Sans", system-ui, sans-serif'; const bw = x.measureText(t).width + 28; x.restore(); rr(W / 2 - bw / 2, yy - 14, bw, 28, 14); x.fillStyle = 'rgba(43,23,10,.88)'; x.fill(); x.strokeStyle = 'rgba(255,199,44,.8)'; x.lineWidth = 1.5; x.stroke(); text(t, W / 2, yy, { gr: 13, farbe: '#FFE08A', schat: false }); },
  menuMalen(zeit){
    const k = this.menuKnoepfe(), [px, py] = SZ_PLAETZE[this.menu.platz], auf = ease.feder(Math.min(1, this.menu.t * 4));
    x.strokeStyle = 'rgba(255,199,44,.9)'; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 24, 0, 7); x.stroke();
    for (const b of k) {
      const bx = lerp(px, b.x, auf), by = lerp(py, b.y, auf), geht = b.typ === 'weg' || this.geld >= b.preis;
      x.strokeStyle = 'rgba(75,42,20,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px, py); x.lineTo(bx, by); x.stroke();
      bodenSchatten(bx, by + 22, 22, 6, .35);
      x.fillStyle = b.typ === 'weg' ? linear(0, by - 24, 0, by + 24, [[0, '#FFF2EC'], [1, '#F4D2C6']]) : linear(0, by - 24, 0, by + 24, [[0, '#FFFBF2'], [1, '#F2DDB4']]); x.beginPath(); x.arc(bx, by, 24, 0, 7); x.fill();
      x.strokeStyle = geht ? (b.typ === 'up' ? '#3DAA55' : b.typ === 'weg' ? '#C0563E' : '#C98A00') : '#B9A98F'; x.lineWidth = 2.5; x.stroke();
      x.save(); x.globalAlpha = geht ? 1 : .45;
      if (b.typ === 'weg') { x.strokeStyle = '#C0563E'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx - 7, by - 9); x.lineTo(bx + 7, by + 3); x.moveTo(bx + 7, by - 9); x.lineTo(bx - 7, by + 3); x.stroke(); }
      else if (b.typ === 'up') { x.fillStyle = '#3DAA55'; x.beginPath(); x.moveTo(bx, by - 14); x.lineTo(bx + 10, by - 3); x.lineTo(bx + 4, by - 3); x.lineTo(bx + 4, by + 4); x.lineTo(bx - 4, by + 4); x.lineTo(bx - 4, by - 3); x.lineTo(bx - 10, by - 3); x.closePath(); x.fill(); }
      else { x.save(); x.translate(bx, by - 2); x.scale(.62, .62); sz_falleMalen({ x: 0, y: 0, st: 0, art: b.art, ein: 1, schnapp: 0 }, zeit, 'icon'); x.restore(); }
      x.restore();
      // Preis
      const pt = b.typ === 'weg' ? '+' + (-b.preis) : String(b.preis);
      rr(bx - 19, by + 12, 38, 15, 7.5); x.fillStyle = geht ? (b.typ === 'weg' ? '#C0563E' : '#4B2A14') : '#9A8A72'; x.fill();
      sz_kornIcon(bx - 10, by + 19.5, .6); text(pt, bx + 4, by + 19.5, { gr: 10.5, farbe: '#FFE9B0', schat: false });
      const lbl = b.typ === 'bau' ? SZ_ARTEN[b.art].kurz : b.typ === 'up' ? 'Besser' : 'Weg';
      rr(bx - 24, by - 38, 48, 15, 7.5); x.fillStyle = 'rgba(255,251,242,.95)'; x.fill(); text(lbl, bx, by - 30.5, { gr: 10, farbe: F.braun, schat: false });
    }
  },
  testZug(){
    if (this.vorbei) return { x: 180, y: 120, warte: 300 };
    const plan = [[5, 'falle'], [1, 'falle'], [2, 'licht'], [4, 'minz'], [7, 'licht'], [6, 'falle'], [3, 'falle'], [0, 'licht']];
    if (this.menu) { const b = this.menuKnoepfe().find((k) => (k.typ === 'bau' && plan.some(([pi, a]) => pi === this.menu.platz && a === k.art)) || k.typ === 'up'); if (b && this.geld >= b.preis) return { x: b.x, y: b.y, warte: 300 }; return { x: 180, y: 120, warte: 300 }; }
    for (const [pi, art] of plan) { if (!this.falleAuf(pi)) { if (this.geld >= SZ_ARTEN[art].preis) return { x: SZ_PLAETZE[pi][0], y: SZ_PLAETZE[pi][1], warte: 300 }; return { x: 180, y: 120, warte: 400 }; } }
    const f = this.fallen.find((ff) => ff.st < 3 && this.geld >= sz_upPreis(ff.art, ff.st));
    if (f) return { x: f.x, y: f.y, warte: 300 };
    return { x: 180, y: 120, warte: 400 };
  },
};
