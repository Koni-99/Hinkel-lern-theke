// ───────── Schädlinge abwehren ─────────
// Draufsicht auf ein Mehllager. Mäuse, Motten, Käfer und Ratten folgen der Mehlspur zum Tor unten.
// Version 282: drei Lager (alle 5 Wellen ein neues, ab Welle 11 mit zwei Mauselöchern), Fallen bis Stufe 5,
// Klebefalle (ab Welle 3) und Bäckerei-Katze (ab Welle 6), neue Schädlinge (Käfer, Ratte, Motten-Schwarm, Riesenratte).
// Die Knöpfe zum Bauen gehen immer zur Mitte hin auf (vorher am rechten Rand zusammengequetscht).
const SZ_KARTEN = [
  { name: 'Mehllager', boden: [[232, 220, 196], [222, 208, 182]],
    wege: [[[-26, 98], [292, 98], [292, 202], [68, 202], [68, 306], [292, 306], [292, 394], [180, 394], [180, 470]]],
    plaetze: [[62, 150], [142, 150], [222, 150], [334, 254], [140, 254], [222, 254], [116, 350], [214, 350], [96, 440], [264, 440]],
    saecke: [[330, 150, 30, 26, .2], [334, 172, 28, 24, -.15], [30, 254, 30, 26, -.2], [330, 352, 30, 26, .15], [40, 350, 26, 22, .1]] },
  { name: 'Kellerlager', boden: [[214, 212, 204], [200, 197, 188]],
    wege: [[[386, 110], [60, 110], [60, 230], [300, 230], [300, 340], [100, 340], [100, 404], [180, 404], [180, 470]]],
    plaetze: [[120, 170], [200, 170], [280, 170], [40, 290], [150, 285], [230, 285], [336, 285], [250, 388], [72, 452], [282, 446]],
    saecke: [[330, 168, 28, 24, .2], [26, 170, 26, 22, -.2], [334, 400, 28, 24, .1], [30, 388, 26, 22, -.1]] },
  { name: 'Großes Lager', boden: [[236, 212, 190], [224, 196, 172]],
    wege: [[[-26, 98], [120, 98], [120, 210], [60, 210], [60, 330], [150, 330], [150, 400], [180, 400], [180, 470]],
           [[386, 98], [240, 98], [240, 210], [300, 210], [300, 330], [210, 330], [210, 400], [180, 400], [180, 470]]],
    plaetze: [[60, 152], [180, 150], [300, 152], [115, 270], [180, 262], [245, 270], [95, 388], [265, 388], [80, 452], [280, 452]],
    saecke: [[180, 205, 30, 26, .1], [26, 400, 26, 22, -.2], [334, 400, 26, 22, .2]] },
];
// Länge jeder Spur einmal ausrechnen
for (const k of SZ_KARTEN) k.laengen = k.wege.map((w) => { let l = 0; for (let i = 1; i < w.length; i++) l += Math.hypot(w[i][0] - w[i - 1][0], w[i][1] - w[i - 1][1]); return l; });
let SZ_K = SZ_KARTEN[0];
const sz_karteFuer = (welle) => SZ_KARTEN[Math.min(SZ_KARTEN.length - 1, Math.floor(Math.max(0, welle - 1) / 5))];
// Fallen: 5 Stufen. ziel: boden (Mäuse, Ratten, Käfer), luft (Motten), alle
const SZ_ARTEN = {
  falle: { n: 'Mausefalle', kurz: 'Mäuse', preis: 30, ab: 1, reich: [66, 72, 78, 86, 96], schaden: [5, 7.5, 11, 16, 23], cd: [1.2, 1.1, 1, .9, .8], ziel: 'boden' },
  licht: { n: 'Lockstoff-Leuchte', kurz: 'Motten', preis: 40, ab: 1, reich: [82, 90, 98, 108, 120], schaden: [1.6, 2.3, 3.3, 4.8, 7], cd: [.42, .39, .36, .33, .3], ziel: 'luft' },
  minz: { n: 'Minz-Duft', kurz: 'Bremst', preis: 25, ab: 1, reich: [58, 64, 72, 80, 90], bremse: [.3, .37, .44, .5, .56], ziel: 'alle' },
  kleber: { n: 'Klebefalle', kurz: 'Klebt', preis: 45, ab: 3, reich: [62, 68, 74, 82, 92], schaden: [1, 1.5, 2, 3, 4], halt: [1, 1.3, 1.6, 2, 2.5], cd: [2.6, 2.4, 2.2, 2, 1.8], ziel: 'boden' },
  katze: { n: 'Bäckerei-Katze', kurz: 'Katze', preis: 90, ab: 6, reich: [70, 76, 84, 92, 100], schaden: [8, 12, 17, 24, 33], cd: [1.8, 1.7, 1.6, 1.5, 1.4], ziel: 'alle' },
};
const SZ_REIHE = ['falle', 'licht', 'minz', 'kleber', 'katze'];
const SZ_MAX = 5;
const SZ_UP = [0, 1.2, 1.7, 2.5, 3.6];
const sz_upPreis = (art, st) => Math.round(SZ_ARTEN[art].preis * SZ_UP[st]);
// Schädlinge: Leben, Tempo, Körner, Punkte, Schaden am Lager
const SZ_TIERE = {
  maus: { hp: 7, v: 44, geld: 4, pkt: 10, schaden: 1, name: 'Maus' },
  motte: { hp: 5, v: 56, geld: 4, pkt: 12, schaden: 1, name: 'Motte' },
  dick: { hp: 26, v: 28, geld: 10, pkt: 30, schaden: 2, name: 'Dicke Maus' },
  kaefer: { hp: 10, v: 32, geld: 6, pkt: 22, schaden: 1, name: 'Käfer' },
  ratte: { hp: 11, v: 78, geld: 5, pkt: 20, schaden: 1, name: 'Ratte' },
  boss: { hp: 110, v: 21, geld: 45, pkt: 200, schaden: 3, name: 'Riesenratte' },
};
const sz_boden = (t) => t.art !== 'motte';
let sz_bg = null, sz_bgKarte = null;
function sz_punktAuf(d, wi = 0){
  const weg = SZ_K.wege[wi] || SZ_K.wege[0];
  let rest = d;
  for (let i = 1; i < weg.length; i++) { const [ax, ay] = weg[i - 1], [bx, by] = weg[i]; const l = Math.hypot(bx - ax, by - ay); if (rest <= l) return { x: ax + (bx - ax) * rest / l, y: ay + (by - ay) * rest / l, w: Math.atan2(by - ay, bx - ax) }; rest -= l; }
  return null;
}
function sz_wegPfad(wi){ x.beginPath(); SZ_K.wege[wi].forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); }

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

function sz_maus(t, zeit){
  const p = t.p; if (!p) return;
  const dick = t.art === 'dick' || t.art === 'boss', sk = { dick: 1.45, ratte: 1.2, boss: 2.1 }[t.art] || 1;
  const lauf = t.klebt > 0 ? 0 : zeit * (dick ? 14 : t.art === 'ratte' ? 26 : 20) + t.seed * 10;
  if (t.klebt > 0) sz_kleberFleck(p.x, p.y, 15 * sk);
  bodenSchatten(p.x, p.y + 6 * sk, 13 * sk, 5 * sk, .3);
  x.save(); x.translate(p.x, p.y); x.rotate(p.w); x.scale(sk * (1 + (t.treffer > 0 ? t.treffer * .3 : 0)), sk * (1 - (t.treffer > 0 ? t.treffer * .2 : 0)));
  // Schwanz
  x.strokeStyle = '#D9A1A0'; x.lineWidth = 2.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-11, 0); x.bezierCurveTo(-18, Math.sin(lauf * .5) * 6, -24, -Math.sin(lauf * .5) * 6, -30, Math.sin(lauf * .5 + 1) * 4); x.stroke();
  // Füße
  x.fillStyle = '#F2B8B5'; const f = Math.sin(lauf) * 3;
  for (const [fx, fy] of [[6 + f, 7], [6 - f, -7], [-6 - f, 7], [-6 + f, -7]]) { x.beginPath(); x.ellipse(fx, fy, 2.4, 1.6, 0, 0, 7); x.fill(); }
  // Körper
  const grau = t.art === 'boss' ? ['#8A7A70', '#5A4C44', '#2E2620'] : t.art === 'ratte' ? ['#A8866A', '#765A44', '#4A3628'] : dick ? ['#B9AFA8', '#8A7E76', '#5E544E'] : ['#C8C4CC', '#9A96A2', '#6E6A78'];
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
  if (t.art === 'boss') { x.fillStyle = '#FFC72C'; x.strokeStyle = '#8A5A00'; x.lineWidth = .8; x.beginPath(); x.moveTo(0, -5); x.lineTo(4, -5); x.lineTo(2, -2.5); x.lineTo(4, 0); x.lineTo(2, 2.5); x.lineTo(4, 5); x.lineTo(0, 5); x.closePath(); x.fill(); x.stroke(); }
  if (t.treffer > 0) { x.globalAlpha = t.treffer; x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(-1, 0, 12.5, 8, 0, 0, 7); x.fill(); x.globalAlpha = 1; }
  x.restore();
}
function sz_kleberFleck(px, py, r){ x.fillStyle = 'rgba(240,200,60,.45)'; x.beginPath(); x.ellipse(px, py + 2, r * 1.2, r * .8, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(255,240,170,.6)'; x.beginPath(); x.arc(px - r * .4, py - r * .1, r * .22, 0, 7); x.arc(px + r * .5, py + r * .3, r * .15, 0, 7); x.fill(); }
function sz_kaefer(t, zeit){
  const p = t.p; if (!p) return;
  if (t.klebt > 0) sz_kleberFleck(p.x, p.y, 14);
  bodenSchatten(p.x, p.y + 6, 12, 5, .3);
  const lauf = t.klebt > 0 ? 0 : zeit * 22 + t.seed * 10;
  x.save(); x.translate(p.x, p.y); x.rotate(p.w); const sk = 1 + (t.treffer > 0 ? t.treffer * .2 : 0); x.scale(sk, sk);
  // Beine
  x.strokeStyle = '#2A1A10'; x.lineWidth = 1.6; x.lineCap = 'round';
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const bx = -5 + i * 5, w = Math.sin(lauf + i * 2 + (s > 0 ? 1 : 0)) * 2.5; x.beginPath(); x.moveTo(bx, s * 4); x.lineTo(bx + w + (i - 1) * 3, s * 11); x.stroke(); }
  // Panzer
  x.fillStyle = radial(-2, -3, 1, 12, [[0, '#9A6A3A'], [.5, '#5E3A1C'], [1, '#2E1A0C']], -3, -4); x.beginPath(); x.ellipse(-2, 0, 10, 8, 0, 0, 7); x.fill();
  x.strokeStyle = 'rgba(20,10,5,.7)'; x.lineWidth = 1; x.beginPath(); x.moveTo(-12, 0); x.lineTo(7, 0); x.stroke();
  x.fillStyle = 'rgba(255,230,190,.35)'; x.beginPath(); x.ellipse(-4, -4, 4, 1.6, -.2, 0, 7); x.fill();
  // Kopf, Fühler
  x.fillStyle = '#2E1A0C'; x.beginPath(); x.arc(9, 0, 4, 0, 7); x.fill();
  x.strokeStyle = '#2E1A0C'; x.lineWidth = 1; x.beginPath(); x.moveTo(11, -2); x.quadraticCurveTo(16, -4, 18, -8); x.moveTo(11, 2); x.quadraticCurveTo(16, 4, 18, 8); x.stroke();
  if (t.treffer > 0) { x.globalAlpha = t.treffer * .8; x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(-2, 0, 10, 8, 0, 0, 7); x.fill(); x.globalAlpha = 1; }
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
  } else if (f.art === 'kleber') {
    // Klebefalle: gelbes Brett mit glänzendem Leim
    rr(-17, -13, 34, 26, 4); x.fillStyle = linear(0, -13, 0, 13, [[0, '#FFE27A'], [1, '#E0A800']]); x.fill(); x.strokeStyle = 'rgba(140,90,0,.6)'; x.lineWidth = 1.2; x.stroke();
    x.fillStyle = 'rgba(255,250,210,.75)'; for (const [a, b, r] of [[-8, -5, 3.2], [5, -6, 2.4], [-3, 5, 2.8], [9, 4, 2]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(160,110,0,.4)'; x.beginPath(); x.moveTo(-14, 0); x.quadraticCurveTo(0, 4, 14, -1); x.stroke();
  } else if (f.art === 'katze') {
    // Bäckerei-Katze (von oben): Kopf mit Ohren, Schwanz wedelt
    const sw = Math.sin(zeit * 3 + px) * .5;
    x.strokeStyle = '#C8742E'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, 8); x.quadraticCurveTo(10 + sw * 8, 14, 12 + sw * 10, 4); x.stroke();
    x.fillStyle = radial(0, 4, 1, 14, [[0, '#F7B26A'], [1, '#C8742E']]); x.beginPath(); x.ellipse(0, 4, 11, 9, 0, 0, 7); x.fill();
    x.fillStyle = '#E08A3E'; x.beginPath(); x.moveTo(-10, -6); x.lineTo(-8, -17); x.lineTo(-2, -9); x.closePath(); x.moveTo(10, -6); x.lineTo(8, -17); x.lineTo(2, -9); x.closePath(); x.fill();
    x.fillStyle = radial(0, -4, 1, 12, [[0, '#FFC88A'], [1, '#E08A3E']]); x.beginPath(); x.arc(0, -5, 10, 0, 7); x.fill();
    x.fillStyle = '#2E1A0C'; const zu = Math.sin(zeit * .7 + px) > .96; if (zu) { x.fillRect(-6, -7, 4, 1.2); x.fillRect(2, -7, 4, 1.2); } else { x.beginPath(); x.ellipse(-4, -6.5, 1.6, 2.4, 0, 0, 7); x.ellipse(4, -6.5, 1.6, 2.4, 0, 0, 7); x.fill(); }
    x.fillStyle = '#E2737A'; x.beginPath(); x.moveTo(-1.6, -2.5); x.lineTo(1.6, -2.5); x.lineTo(0, -1); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(60,30,10,.5)'; x.lineWidth = .7; x.beginPath(); x.moveTo(-3, -1.5); x.lineTo(-11, -3); x.moveTo(-3, -1); x.lineTo(-11, 1); x.moveTo(3, -1.5); x.lineTo(11, -3); x.moveTo(3, -1); x.lineTo(11, 1); x.stroke();
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
  for (let i = 0; i < st; i++) { const sx = (i - (st - 1) / 2) * 8, sy = 22; x.fillStyle = '#FFC72C'; x.strokeStyle = '#8A5A00'; x.lineWidth = 1; x.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.7 : 3.8; x.lineTo(sx + Math.cos(k * Math.PI / 5 - Math.PI / 2) * r, sy + Math.sin(k * Math.PI / 5 - Math.PI / 2) * r); } x.closePath(); x.fill(); x.stroke(); }
  x.restore();
  if (ausw === true) { x.strokeStyle = '#FFC72C'; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 25, 0, 7); x.stroke(); }
}

/** Goldähre: Mitte (0, 0), etwa 46 px hoch */
function sz_goldAehre(){
  x.lineCap = 'round';
  x.strokeStyle = '#7A4F00'; x.lineWidth = 4; x.beginPath(); x.moveTo(2, 24); x.quadraticCurveTo(0, 8, 0, -16); x.stroke();
  x.strokeStyle = '#E0A526'; x.lineWidth = 2.2; x.stroke();
  const korn = (kx, ky, w) => { x.save(); x.translate(kx, ky); x.rotate(w); x.fillStyle = linear(-4, -7, 4, 7, [[0, '#FFF1B8'], [.5, '#FFC72C'], [1, '#C98A00']]); x.strokeStyle = '#7A4F00'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, 0, 4, 7, 0, 0, 7); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,255,240,.8)'; x.beginPath(); x.ellipse(-1.2, -2.5, 1.2, 2.4, 0, 0, 7); x.fill(); x.restore(); };
  for (let i = 0; i < 4; i++) { const ky = 8 - i * 7.5; korn(-5, ky, -.45); korn(5, ky, .45); }
  korn(0, -22, 0);
  x.strokeStyle = 'rgba(201,138,0,.8)'; x.lineWidth = 1; for (let i = 0; i < 4; i++) { const ky = 4 - i * 7.5; x.beginPath(); x.moveTo(-7, ky - 6); x.lineTo(-12, ky - 14); x.moveTo(7, ky - 6); x.lineTo(12, ky - 14); x.stroke(); }
}

function sz_kornIcon(px, py, s){ x.save(); x.translate(px, py); x.rotate(.45); x.fillStyle = linear(-4, -7, 4, 7, [[0, '#F7C64A'], [1, '#B9800E']]); x.beginPath(); x.ellipse(0, 0, 4.2 * s, 7 * s, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,245,200,.85)'; x.lineWidth = 1.1 * s; x.beginPath(); x.moveTo(-1 * s, -4 * s); x.quadraticCurveTo(1 * s, 0, 0, 4 * s); x.stroke(); x.restore(); }

function sz_statisch(){
  const K = SZ_K, [hell, dunkel] = K.boden;
  // Fliesenboden (jedes Lager in eigener Farbe)
  x.fillStyle = `rgb(${dunkel.join(',')})`; x.fillRect(0, 0, W, H);
  const t = 30;
  for (let r = 0; r < H / t + 1; r++) for (let k = 0; k < W / t + 1; k++) { const z = zufallFest(r * 17 + k * 7) * 8 | 0, f = (r + k) % 2 ? hell : dunkel; x.fillStyle = `rgb(${f[0] + z},${f[1] + z},${f[2] + z})`; rr(k * t + 1, r * t + 1, t - 2, t - 2, 3); x.fill(); x.fillStyle = 'rgba(255,255,255,.28)'; x.fillRect(k * t + 3, r * t + 2, t - 6, 1.5); }
  x.fillStyle = linear(0, 0, W, H, [[0, 'rgba(255,245,220,.25)'], [1, 'rgba(90,60,30,.18)']]); x.fillRect(0, 0, W, H);
  // Mehlspur(en)
  x.lineCap = 'round'; x.lineJoin = 'round';
  K.wege.forEach((_, wi) => {
    sz_wegPfad(wi); x.strokeStyle = 'rgba(140,105,60,.13)'; x.lineWidth = 44; x.stroke();
    sz_wegPfad(wi); x.strokeStyle = 'rgba(255,251,240,.38)'; x.lineWidth = 38; x.stroke();
    sz_wegPfad(wi); x.strokeStyle = 'rgba(255,252,244,.42)'; x.lineWidth = 26; x.stroke();
    sz_wegPfad(wi); x.strokeStyle = 'rgba(255,255,252,.35)'; x.lineWidth = 12; x.stroke();
    const L = K.laengen[wi];
    for (let i = 0; i < 1400; i++) { const p = sz_punktAuf(zufallFest(i + wi * 5000) * L, wi); if (!p) continue; const g = (zufallFest(i + 900) + zufallFest(i + 1900) + zufallFest(i + 2900)) / 3 - .5; const o = g * 62; const r = .7 + zufallFest(i + 3) * (Math.abs(g) < .15 ? 3.4 : 1.8); x.fillStyle = `rgba(255,255,250,${.3 + zufallFest(i + 77) * .5})`; x.beginPath(); x.arc(p.x - Math.sin(p.w) * o, p.y + Math.cos(p.w) * o, r, 0, 7); x.fill(); }
    for (let i = 0; i < 60; i++) { const p = sz_punktAuf(20 + i * (L / 60), wi); if (!p) continue; const s = i % 2 ? 5 : -5; x.fillStyle = 'rgba(160,130,90,.22)'; x.beginPath(); x.arc(p.x - Math.sin(p.w) * s, p.y + Math.cos(p.w) * s, 1.6, 0, 7); x.fill(); }
  });
  // Mauern
  const mauer = (px, py, w, h) => { x.fillStyle = linear(px, py, px + w, py + h, [[0, '#9A6B45'], [1, '#6E4428']]); x.fillRect(px, py, w, h); x.fillStyle = 'rgba(255,230,200,.12)'; for (let yy = py; yy < py + h; yy += 10) x.fillRect(px, yy, w, 1); };
  mauer(0, 0, W, 76); mauer(0, 76, 10, H - 76); mauer(350, 76, 10, H - 76);
  x.fillStyle = linear(0, 76, 0, 92, [[0, 'rgba(40,20,5,.4)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(0, 76, W, 16);
  x.fillStyle = linear(10, 0, 22, 0, [[0, 'rgba(40,20,5,.35)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(10, 76, 12, H);
  x.fillStyle = linear(350, 0, 338, 0, [[0, 'rgba(40,20,5,.3)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(338, 76, 12, H);
  // Mauselöcher, wo eine Spur beginnt
  for (const w of K.wege) {
    const [sx, sy] = w[0];
    x.fillStyle = '#1E120A'; x.beginPath();
    if (sx < 0) { x.moveTo(0, sy + 20); x.lineTo(0, sy - 20); x.lineTo(8, sy - 20); x.arc(8, sy, 20, -Math.PI / 2, Math.PI / 2); }
    else { x.moveTo(W, sy + 20); x.lineTo(W, sy - 20); x.lineTo(W - 8, sy - 20); x.arc(W - 8, sy, 20, -Math.PI / 2, Math.PI / 2, true); }
    x.closePath(); x.fill();
  }
  // Regal oben mit Säcken
  holz(8, 60, 344, 12, 3, '#C08A52', '#7E5028');
  for (let i = 0; i < 8; i++) sz_sack(30 + i * 43, 44, 40, 34, (zufallFest(i) - .5) * .15, i % 2 === 0);
  for (const [px, py, w, h, d] of K.saecke) sz_sack(px, py, w, h, d, false);
  // Bauplätze (leer)
  for (const [px, py] of K.plaetze) { x.fillStyle = 'rgba(120,85,45,.14)'; x.beginPath(); x.arc(px, py + 2, 23, 0, 7); x.fill(); x.fillStyle = radial(px, py, 4, 22, [[0, 'rgba(255,250,235,.85)'], [1, 'rgba(236,222,195,.85)']], px - 6, py - 6); x.beginPath(); x.arc(px, py, 21, 0, 7); x.fill(); x.strokeStyle = 'rgba(150,110,60,.55)'; x.setLineDash([4, 4]); x.lineWidth = 2; x.stroke(); x.setLineDash([]); x.strokeStyle = 'rgba(150,110,60,.45)'; x.lineWidth = 2.5; x.lineCap = 'round'; x.beginPath(); x.moveTo(px - 6, py); x.lineTo(px + 6, py); x.moveTo(px, py - 6); x.lineTo(px, py + 6); x.stroke(); }
  x.fillStyle = radial(150, 230, 40, 300, [[0, 'rgba(255,240,200,.18)'], [1, 'rgba(255,240,200,0)']]); x.fillRect(0, 0, W, H); vignette(.22);
  // Lagertor unten
  const tx = 134, ty = 438;
  x.fillStyle = '#5E3A1E'; rr(tx - 10, ty - 8, 112, 60, 10); x.fill();
  x.fillStyle = linear(0, ty, 0, ty + 50, [[0, '#2A1A10'], [1, '#4A2E18']]); rr(tx, ty, 92, 50, 6); x.fill();
  sz_sack(tx + 22, ty + 30, 28, 24, -.1, false); sz_sack(tx + 46, ty + 26, 30, 26, .05, false); sz_sack(tx + 70, ty + 31, 28, 24, .12, false);
  x.fillStyle = 'rgba(30,15,5,.35)'; x.fillRect(tx, ty, 92, 12);
  rr(tx + 18, ty - 20, 56, 16, 8); x.fillStyle = linear(0, ty - 20, 0, ty - 4, [[0, '#FFD95A'], [1, '#E6A800']]); x.fill(); x.strokeStyle = '#8A5A10'; x.lineWidth = 1; x.stroke();
}

// Version 291: Karten nach jeder 3. Welle (gelten für die ganze Runde)
const SZ_VERB = {
  koerner: { n: 'Kornspeicher', z: ['+25 % Körner', 'pro Schädling'], max: 2, sym: () => SYM.korn() },
  lager: { n: 'Dicke Tür', z: ['+2 Herzen', 'fürs Lager'], max: 2, sym: () => SYM.herz() },
  rabatt: { n: 'Großeinkauf', z: ['Fallen 15 %', 'billiger'], max: 2, sym: () => SYM.kiste() },
  reich: { n: 'Weitblick', z: ['Alle Fallen', '+10 % Reichweite'], max: 2, sym: () => SYM.ziel() },
  tempo: { n: 'Flinke Fallen', z: ['Fallen treffen', '12 % schneller'], max: 2, sym: () => SYM.blitz() },
};

SPIELE.schutz = {
  medaillen: [800, 2400, 5000],
  key: 'schutz', name: 'Schädlinge abwehren', kurz: 'Verteidigen',
  anleitung: 'Mäuse, Motten und Käfer wollen ins Mehllager. Tippe einen Platz und wähle eine Falle: Mausefalle gegen Mäuse, Leuchte gegen Motten, Minz-Duft bremst alle. Später kommen Klebefalle und Katze dazu. Nochmal tippen verbessert sie (bis Stufe 5). Alle 5 Wellen zieht ihr in ein neues Lager.',
  start(){
    SZ_K = SZ_KARTEN[0]; sz_bg = null; this.verb = {};
    this.gem = !!GEMUETLICH; this.geld = this.gem ? 150 : 75; this.lager = this.gem ? 10 : 5; this.lagerMax = this.lager; this.welle = 0; this.tiere = []; this.fallen = []; this.schuesse = []; this.koerner = [];
    this.pause = 6; this.spawnT = 0; this.warteschlange = null; this.punkte = 0; this.menu = null; this.zeit = 0; this.banner = 0; this.bannerText = ''; this.bannerSub = '';
    this.vorbei = 0; this.besiegt = 0; this.reichZeig = null; this.lagerWackel = 0; this.gold = null; this.goldZeit = zufall(15, 45); this.neuHinweis = null;
  },
  aktuellePunkte(){ return (this.punkte || 0) + (this.welle || 0) * 25; },
  falleAuf(i){ return this.fallen.find((f) => f.platz === i); },
  /** Welche Fallen man schon bauen kann (in der Pause zählt schon die nächste Welle) */
  preis(p){ return Math.round(p * (1 - .15 * ((this.verb && this.verb.rabatt) || 0))); },
  reichF(){ return 1 + .1 * ((this.verb && this.verb.reich) || 0); },
  frei(art){ return this.gem || this.welle + (this.pause > 0 ? 1 : 0) >= SZ_ARTEN[art].ab; },
  menuKnoepfe(){
    const m = this.menu; if (!m) return [];
    const [px, py] = SZ_K.plaetze[m.platz], f = this.falleAuf(m.platz);
    let k;
    if (!f) k = SZ_REIHE.filter((art) => this.frei(art)).map((art) => ({ art, typ: 'bau', preis: this.preis(SZ_ARTEN[art].preis) }));
    else { k = []; if (f.st < SZ_MAX) k.push({ typ: 'up', art: f.art, preis: this.preis(sz_upPreis(f.art, f.st)) }); k.push({ typ: 'weg', art: f.art, preis: -Math.round(f.wert * .6) }); }
    // Leiste mit großen Knöpfen: unten, oder oben, wenn der Platz selbst unten liegt (nichts klebt am Rand)
    const n = k.length, bw = n > 2 ? Math.min(64, (W - 24 - (n - 1) * 6) / n) : 104, bh = 70, ges = n * bw + (n - 1) * 6, oben = py > 300;
    const y0 = oben ? 96 : H - bh - 8;
    k.forEach((b, j) => { b.rx = (W - ges) / 2 + j * (bw + 6); b.ry = y0; b.w = bw; b.h = bh; b.x = b.rx + bw / 2; b.y = b.ry + bh / 2; });
    return k;
  },
  runter(p){
    if (this.vorbei) return;
    if (this.menu) {
      for (const b of this.menuKnoepfe()) if (p.x > b.rx - 3 && p.x < b.rx + b.w + 3 && p.y > b.ry - 3 && p.y < b.ry + b.h + 3) { this.knopf(b); return; }
    }
    if (this.gold && !this.gold.weg && Math.hypot(p.x - this.gold.x, p.y - this.gold.y) < 32) { const g = this.gold; g.weg = true; this.punkte += 50; this.geld += 15; schwebText('+15', g.x, g.y - 28, '#B9800E', 18); goldGefangen(g.x, g.y); this.menu = null; return; }
    for (let i = 0; i < SZ_K.plaetze.length; i++) { const [px, py] = SZ_K.plaetze[i]; if (Math.hypot(p.x - px, p.y - py) < 26) { this.menu = this.menu && this.menu.platz === i ? null : { platz: i, t: 0 }; return; } }
    this.menu = null;
  },
  knopf(b){
    const i = this.menu.platz, [px, py] = SZ_K.plaetze[i];
    if (b.typ === 'weg') { const f = this.falleAuf(i); this.fallen = this.fallen.filter((ff) => ff !== f); this.geld += -b.preis; schwebText('+' + (-b.preis), px, py - 20, '#C98A00', 16); mehlWolke(px, py, 8); this.menu = null; return; }
    if (this.geld < b.preis) { schwebText('Zu wenig Körner', b.x, b.y - 30, F.rot, 14); wackeln(2); return; }
    this.geld -= b.preis;
    if (b.typ === 'bau') { this.fallen.push({ platz: i, x: px, y: py, art: b.art, st: 1, cd: .3, ein: 0, schnapp: 0, wert: b.preis }); schwebText(SZ_ARTEN[b.art].n, px, py - 30, F.braun, 14); }
    else { const f = this.falleAuf(i); f.st++; f.ein = .35; f.wert += b.preis; schwebText(f.st === SZ_MAX ? 'Meister-Stufe' : 'Stufe ' + f.st, px, py - 30, '#C98A00', 16); teilchen(px, py, { n: f.st === SZ_MAX ? 26 : 14, form: 'stern' }); }
    mehlWolke(px, py + 6, 8); this.reichZeig = { platz: i, t: 2 }; this.menu = null;
  },
  /** Alle 5 Wellen ein neues Lager: die Fallen ziehen auf die gleichen Plätze mit um */
  umzug(neu){
    SZ_K = neu; sz_bg = null; this.menu = null;
    for (const f of this.fallen) { const [px, py] = SZ_K.plaetze[f.platz]; f.x = px; f.y = py; f.ein = 0; }
    blitz(.35, '255,240,200'); brumm(40);
  },
  neueWelle(){
    this.welle++; const w = this.welle;
    const neu = sz_karteFuer(w), umgezogen = neu !== SZ_K;
    if (umgezogen) this.umzug(neu);
    const liste = [], n = 6 + w * 2;
    for (let i = 0; i < n; i++) {
      let a = 'maus';
      if (w >= 2 && (w === 2 ? i % 5 === 2 : i % 3 === 1 || (w >= 5 && i % 4 === 0))) a = 'motte';
      else if (w >= 3 && i % (w >= 9 ? 4 : 6) === 0) a = 'kaefer';
      else if (w >= 6 && i % 4 === 2) a = 'ratte';
      liste.push(a);
    }
    if (w >= 4) for (let i = 0; i < Math.min(6, Math.floor((w - 2) / 2)); i++) liste.splice(ganz(2, liste.length), 0, 'dick');
    if (w >= 7 && w % 2 === 1) for (let i = 0; i < Math.floor((w - 5) / 2); i++) liste.splice(ganz(3, liste.length), 0, 'schwarm');
    if (w >= 8 && w % 4 === 0) liste.push('boss');
    if (w === 2) liste.sort((a, b) => (a === 'motte') - (b === 'motte'));
    this.warteschlange = liste; this.spawnT = 0; this.spurNr = 0;
    this.banner = 2.6; this.bannerText = umgezogen ? SZ_K.name : `Welle ${w}`;
    const SUB = { 1: 'Mäuse kommen durchs Loch', 2: 'Motten! Baue eine Leuchte', 3: 'Käfer haben Panzer. Neu: Klebefalle', 4: 'Dicke Mäuse sind zäh', 6: `Welle 6: Ratten! Neu: Bäckerei-Katze`, 7: 'Ein Motten-Schwarm kommt', 8: 'Achtung: Riesenratte!', 11: 'Welle 11: zwei Mauselöcher' };
    this.bannerSub = SUB[w] || (w >= 8 && w % 4 === 0 ? 'Achtung: Riesenratte!' : umgezogen ? `Welle ${w}: Fallen sind mit umgezogen` : 'Sie werden mehr');
  },
  spawn(art){
    const w = this.welle, f = Math.pow(1.2, w - 1) * (w > 6 ? 1 + (w - 6) * .04 : 1), d = SZ_TIERE[art], tempo = Math.min(w, 20) * .8;
    const wi = this.spurNr++ % SZ_K.wege.length;
    const hp = d.hp * f, v = art === 'boss' || art === 'dick' || art === 'kaefer' ? d.v : (art === 'maus' && w === 1 ? 38 : d.v + tempo);
    return { art, d: 0, wi, hp, max: hp, v, seed: Math.random(), treffer: 0, gelockt: 0, klebt: 0 };
  },
  treffe(f, t, schaden){
    if (t.weg) return;
    t.hp -= schaden * (f.art === 'falle' && t.art === 'kaefer' ? .6 : 1); t.treffer = 1;
    if (t.hp > 0) return;
    t.weg = true; this.besiegt++; statPlus('gefangen', 1);
    const d = SZ_TIERE[t.art], zx = t.p.x, zy = t.p.y - (t.art === 'motte' ? 10 : 0);
    const g = Math.round(d.geld * (1 + .25 * ((this.verb && this.verb.koerner) || 0))); this.geld += g; this.punkte += d.pkt;
    mehlWolke(zx, zy, t.art === 'boss' ? 24 : 10); teilchen(zx, zy, { n: t.art === 'boss' ? 30 : 8, farben: ['#E3A928', '#F7C64A', '#FFF1B8'], form: 'krume', tempo: 110 });
    schwebText('+' + g, zx, zy - 14, '#B9800E', t.art === 'boss' ? 22 : 16);
    if (t.art === 'boss') { brumm(80); wackeln(5); schwebText('Riesenratte vertrieben!', W / 2, 200, '#B8860B', 20); }
    this.koerner.push({ x0: zx, y0: zy, t: 0 });
  },
  tick(dt){
    this.zeit += dt;
    if (this.banner > 0) this.banner -= dt;
    if (this.menu) this.menu.t += dt;
    if (this.reichZeig) { this.reichZeig.t -= dt; if (this.reichZeig.t <= 0) this.reichZeig = null; }
    this.lagerWackel = Math.max(0, this.lagerWackel - dt * 2);
    for (const k of this.koerner) k.t += dt / .7; this.koerner = this.koerner.filter((k) => k.t < 1);
    if (this.vorbei) { this.vorbei += dt; if (this.vorbei > 1 && laeuft) ende(this.aktuellePunkte(), `Bis Welle ${this.welle} das Mehl verteidigt, ${this.besiegt} Schädlinge vertrieben.`); return; }
    if (!this.gold && goldKommt() && this.zeit > this.goldZeit && this.welle >= 1) { const d = zufall(240, SZ_K.laengen[0] - 260), p = sz_punktAuf(d); this.gold = { d, t: 0, dauer: 5, x: p.x, y: p.y, weg: false }; goldErschienen(); }
    if (this.gold) { const g = this.gold; g.t += dt; g.d += 14 * dt; const p = sz_punktAuf(g.d); if (p) { g.x = p.x; g.y = p.y - 6 - Math.abs(Math.sin(g.t * 3)) * 8; } if (g.t > g.dauer) g.weg = true; }
    // Wellen
    if (this.pause > 0) { this.pause -= dt; if (this.pause <= 0) this.neueWelle(); }
    else if (this.warteschlange && this.warteschlange.length) {
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        const art = this.warteschlange.shift(), w = this.welle;
        if (art === 'schwarm') { for (let i = 0; i < 5; i++) { const t = this.spawn('motte'); t.d = -i * 16; t.wi = (this.spurNr - 1) % SZ_K.wege.length; this.tiere.push(t); } }
        else this.tiere.push(this.spawn(art));
        this.spawnT = w === 1 ? 1.7 : Math.max(.42, 1.25 - w * .06);
      }
    } else if (!this.tiere.length && this.welle > 0) {
      const bonus = 12 + this.welle; this.geld += bonus; this.punkte += this.welle * 25;
      this.banner = 2; this.bannerText = 'Welle geschafft'; brumm(25); statMax('wellen', this.welle); this.bannerSub = `+${bonus} Körner`;
      if (this.welle % 5 === 0 && this.welle < 11) { this.bannerSub = `+${bonus} Körner. Gleich: neues Lager`; }
      this.pause = 4.5; this.warteschlange = null;
      const mitKarten = this.welle % 3 === 0 && !this.gem && karten(kartenAuswahl(SZ_VERB, this.verb), 'Powerup fürs Lager', (k) => { this.verb[k] = (this.verb[k] || 0) + 1; if (k === 'lager') { this.lager += 2; this.lagerMax += 2; } });
      if (this.welle % 2 === 0 && !mitKarten) setTimeout(() => { if (laeuft && !this.vorbei) frage((ok) => { if (ok) { this.geld += 30; schwebText('+30 Körner', W / 2, 240, '#C98A00', 22); teilchen(W / 2, 240, { n: 20, form: 'stern' }); } }); }, 900);
    }
    // Tiere bewegen
    for (const t of this.tiere) {
      let bremse = 0;
      for (const f of this.fallen) if (f.art === 'minz' && t.p && Math.hypot(t.p.x - f.x, t.p.y - f.y) < SZ_ARTEN.minz.reich[f.st - 1] * this.reichF()) bremse = Math.max(bremse, SZ_ARTEN.minz.bremse[f.st - 1]);
      t.gebremst = bremse; t.klebt = Math.max(0, t.klebt - dt);
      if (!(t.klebt > 0)) t.d += t.v * (1 - bremse) * (this.gem ? .7 : 1) * dt;
      t.p = sz_punktAuf(t.d, t.wi);
      t.treffer = Math.max(0, t.treffer - dt * 5); t.gelockt = Math.max(0, t.gelockt - dt * 2);
      if (!t.p || t.p.y > 452) { t.weg = true; this.lager -= SZ_TIERE[t.art].schaden; this.lagerWackel = 1; brumm(70); wackeln(6); blitz(.22, '224,69,46'); schwebText(`${SZ_TIERE[t.art].name} im Mehl`, 180, 420, F.rot, 15); }
    }
    // Fallen
    const fortschritt = (t) => t.d / SZ_K.laengen[t.wi];
    for (const f of this.fallen) {
      f.ein = Math.min(1, f.ein + dt * 3); f.schnapp = Math.max(0, f.schnapp - dt * 3); f.cd -= dt;
      if (f.art === 'minz' || f.cd > 0) continue;
      const a = SZ_ARTEN[f.art], s = f.st - 1, reich = a.reich[s] * this.reichF();
      const passt = (t, r = reich, px = f.x, py = f.y) => t.p && !t.weg && t.p.y > 80 && (a.ziel === 'alle' || (a.ziel === 'boden') === sz_boden(t)) && Math.hypot(t.p.x - px, t.p.y - py) < r;
      let kand = this.tiere.filter((t) => passt(t));
      if (f.art === 'kleber') kand = kand.filter((t) => !(t.klebt > .2));
      if (!kand.length) continue;
      kand.sort((u, v) => fortschritt(v) - fortschritt(u));
      const ziele = kand.slice(0, f.st === SZ_MAX && (f.art === 'falle' || f.art === 'licht') ? 2 : 1);
      f.cd = a.cd[s] * (1 - .12 * ((this.verb && this.verb.tempo) || 0));
      for (const ziel of ziele) {
        const zx = ziel.p.x, zy = ziel.p.y - (ziel.art === 'motte' ? 10 : 0);
        this.schuesse.push({ art: f.art, x1: f.x, y1: f.y - (f.art === 'licht' ? 10 : 0), x2: zx, y2: zy, t: 0 });
        if (f.art === 'falle') { f.schnapp = 1; teilchen(zx, zy, { n: 6, farben: ['#FFFFFF', '#FFE08A'], form: 'stern', tempo: 90, groesse: [2, 4], leben: [.2, .4] }); }
        else if (f.art === 'licht') { ziel.gelockt = 1; teilchen(zx, zy, { n: 3, farben: ['#FFF6C8', '#FFE08A'], tempo: 50, groesse: [1.5, 3], schwer: 0, leben: [.2, .4] }); }
        if (f.art === 'katze') { // Pfotenhieb: trifft alle dicht beieinander
          f.schnapp = 1; for (const t of this.tiere.filter((t) => passt(t, 34, zx, ziel.p.y))) this.treffe(f, t, a.schaden[s]);
        } else if (f.art === 'kleber') { // klebt fest, auf Meister-Stufe alle in der Nähe
          for (const t of f.st === SZ_MAX ? this.tiere.filter((t) => passt(t, 30, zx, ziel.p.y)) : [ziel]) { t.klebt = a.halt[s] * (t.art === 'boss' ? .4 : 1); this.treffe(f, t, a.schaden[s]); }
        } else this.treffe(f, ziel, a.schaden[s]);
      }
    }
    for (const s of this.schuesse) s.t += dt / (s.art === 'falle' || s.art === 'kleber' ? .22 : s.art === 'katze' ? .3 : .16); this.schuesse = this.schuesse.filter((s) => s.t < 1);
    this.tiere = this.tiere.filter((t) => !t.weg);
    if (this.lager <= 0) { this.lager = 0; this.vorbei = .01; }
    setHud([{ icon: 'flagge', text: `Welle ${Math.max(1, this.welle)}` }, { icon: 'korn', text: `${this.geld}<span style="display:inline-flex;align-items:center;gap:3px;margin-left:9px"><i class="herz">${ICON.herz}</i>${Math.max(0, this.lager)}</span>` }]);
  },
  malen(zeit){
    if (!sz_bg || sz_bg.width !== c.width || sz_bg.height !== c.height || sz_bgKarte !== SZ_K) {
      sz_statisch();
      if (FX.wackel === 0) { sz_bg = document.createElement('canvas'); sz_bg.width = c.width; sz_bg.height = c.height; sz_bg.getContext('2d').drawImage(c, 0, 0); sz_bgKarte = SZ_K; }
    } else x.drawImage(sz_bg, 0, 0, W, H);
    // Lagertor-Warnung
    if (this.lagerWackel > 0) { x.fillStyle = `rgba(224,69,46,${this.lagerWackel * .35})`; rr(124, 430, 112, 60, 10); x.fill(); }
    text('LAGER', 180, 426, { gr: 10, farbe: F.braun, schat: false });
    // Reichweite
    const zeigR = this.menu ? this.menu.platz : this.reichZeig ? this.reichZeig.platz : null;
    if (zeigR !== null) { const f = this.falleAuf(zeigR); if (f) { const r = SZ_ARTEN[f.art].reich[f.st - 1] * this.reichF(), a = this.menu ? 1 : Math.min(1, this.reichZeig.t); const fa = { falle: '201,138,0', licht: '255,200,40', kleber: '230,170,0', katze: '220,110,40' }[f.art] || '60,170,110'; x.fillStyle = `rgba(${fa},${.12 * a})`; x.beginPath(); x.arc(f.x, f.y, r, 0, 7); x.fill(); x.strokeStyle = `rgba(${fa},${.7 * a})`; x.lineWidth = 2; x.setLineDash([6, 5]); x.stroke(); x.setLineDash([]); } }
    // Minz-Wolken
    for (const f of this.fallen || []) if (f.art === 'minz') { const r = SZ_ARTEN.minz.reich[f.st - 1] * this.reichF(); x.fillStyle = radial(f.x, f.y, r * .2, r, [[0, 'rgba(110,210,160,.16)'], [1, 'rgba(110,210,160,0)']]); x.beginPath(); x.arc(f.x, f.y, r, 0, 7); x.fill(); }
    // Fallen
    for (const f of this.fallen || []) sz_falleMalen(f, zeit, this.menu && this.menu.platz === f.platz);
    // Tiere (Mäuse und Käfer unten, Motten oben)
    const tiere = this.tiere || [];
    for (const t of tiere) if (t.art !== 'motte') { if (t.art === 'kaefer') sz_kaefer(t, zeit); else sz_maus(t, zeit); if (t.gebremst) this.minzKringel(t, zeit); }
    for (const t of tiere) if (t.art === 'motte') sz_motte(t, zeit);
    for (const t of tiere) if (t.p && t.hp < t.max) { const bw = t.art === 'boss' ? 40 : 24, yy = t.p.y - (t.art === 'motte' ? 34 : t.art === 'boss' ? 30 : t.art === 'dick' ? 22 : 17); rr(t.p.x - bw / 2, yy, bw, 5, 2.5); x.fillStyle = 'rgba(40,20,5,.55)'; x.fill(); rr(t.p.x - bw / 2 + 1, yy + 1, (bw - 2) * Math.max(0, t.hp / t.max), 3, 1.5); x.fillStyle = t.hp / t.max > .5 ? '#5BD46E' : t.hp / t.max > .25 ? '#F2B400' : '#E0452E'; x.fill(); }
    // Treffer
    for (const s of this.schuesse || []) {
      const a = 1 - s.t;
      if (s.art === 'licht') { x.strokeStyle = `rgba(255,226,120,${a * .8})`; x.lineWidth = 6 * a + 1; x.lineCap = 'round'; x.beginPath(); x.moveTo(s.x1, s.y1); x.lineTo(s.x2, s.y2); x.stroke(); x.strokeStyle = `rgba(255,255,240,${a})`; x.lineWidth = 2; x.stroke(); }
      else if (s.art === 'katze') { x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 2.4; x.lineCap = 'round'; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(s.x2 - 9 + i * 6, s.y2 - 10); x.lineTo(s.x2 + 5 + i * 6, s.y2 + 8); x.stroke(); } }
      else { const t = ease.aus(s.t); const mx = (s.x1 + s.x2) / 2, my = Math.min(s.y1, s.y2) - 24; const px = (1 - t) * (1 - t) * s.x1 + 2 * (1 - t) * t * mx + t * t * s.x2, py = (1 - t) * (1 - t) * s.y1 + 2 * (1 - t) * t * my + t * t * s.y2;
        if (s.art === 'kleber') { x.fillStyle = '#F2C230'; x.beginPath(); x.arc(px, py, 4.5, 0, 7); x.fill(); x.fillStyle = 'rgba(255,250,210,.8)'; x.beginPath(); x.arc(px - 1.5, py - 1.5, 1.5, 0, 7); x.fill(); }
        else { x.fillStyle = '#FFD24A'; x.strokeStyle = '#B98200'; x.lineWidth = 1; x.beginPath(); x.moveTo(px - 4, py + 3); x.lineTo(px + 5, py); x.lineTo(px - 3, py - 4); x.closePath(); x.fill(); x.stroke(); } }
    }
    // Körner fliegen nach oben
    for (const k of this.koerner || []) { const t = ease.ein(k.t); sz_kornIcon(lerp(k.x0, 180, t), lerp(k.y0, 22, t) - Math.sin(t * Math.PI) * 30, 1 - t * .3); }
    if (this.gem && laeuft) text('Gemütlich', 16, 472, { gr: 10, farbe: 'rgba(255,240,215,.75)', ausr: 'left', schat: false });
    if (this.gold && !this.gold.weg) { const g = this.gold, aus = Math.max(0, Math.min(1, (g.dauer - g.t) / .6)); x.globalAlpha = aus; bodenSchatten(g.x, g.y + 26, 14, 4, .3); goldGlanz(g.x, g.y, 20, zeit); x.save(); x.translate(g.x, g.y); x.rotate(Math.sin(zeit * 3) * .18); x.scale(1.05, 1.05); sz_goldAehre(); x.restore(); x.globalAlpha = 1; }
    // Menü
    kartenLeiste(SZ_VERB, this.verb, 62);
    if (this.menu) this.menuMalen(zeit);
    // Hinweis am Anfang
    if (laeuft && !this.fallen.length && !this.menu && !this.vorbei) { const b = Math.abs(Math.sin(zeit * 4)) * 6; const [hx, hy] = SZ_K.plaetze[5]; x.save(); x.translate(hx, hy - 30 - b); x.fillStyle = '#FFC72C'; x.strokeStyle = '#4B2A14'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 14); x.lineTo(-11, 1); x.lineTo(-4.5, 1); x.lineTo(-4.5, -12); x.lineTo(4.5, -12); x.lineTo(4.5, 1); x.lineTo(11, 1); x.closePath(); x.stroke(); x.fill(); x.restore(); this.zettel('Tippe einen Platz und baue eine Falle', 404); }
    else if (laeuft && this.menu && this.fallen.length === 0) this.zettel('Mausefalle gegen Mäuse wählen', 404);
    else if (laeuft && !this.vorbei && this.welle === 1 && this.pause > 0 && !this.fallen.some((f) => f.art === 'licht')) this.zettel(this.menu ? 'Die Leuchte lockt Motten an' : 'Gleich kommen Motten: baue eine Leuchte', 404);
    else if (laeuft && !this.vorbei && !this.gem && this.pause > 0 && (this.welle === 2 || this.welle === 5) && this.banner <= 0) this.zettel(this.welle === 2 ? 'Neu: Klebefalle hält Mäuse und Käfer fest' : 'Neu: Die Katze trifft alles', 404);
    // Countdown bis zur nächsten Welle
    if (laeuft && this.pause > 0 && this.banner <= 0 && !this.vorbei) { const s = Math.ceil(this.pause); rr(W / 2 - 74, 84, 148, 26, 13); x.fillStyle = 'rgba(43,23,10,.82)'; x.fill(); text(this.welle % 5 === 0 && this.welle < 11 ? `Umzug in ${s}` : `Welle ${this.welle + 1} in ${s}`, W / 2, 97, { gr: 13, farbe: '#FFE08A', schat: false }); }
    // Banner
    if (this.banner > 0 && laeuft) { const dauer = 2.2, t = dauer - this.banner, a = Math.min(1, this.banner * 2.5, t * 6), s = ease.feder(Math.min(1, Math.max(0, t) * 3)); x.save(); x.globalAlpha = Math.max(0, a); x.translate(W / 2, 236); x.scale(s, s); bodenSchatten(0, 34, 120, 10, .4); rr(-124, -30, 248, 60, 20); x.fillStyle = linear(0, -30, 0, 30, [[0, '#5A3820'], [1, '#3A2010']]); x.fill(); x.strokeStyle = '#FFC72C'; x.lineWidth = 2.5; x.stroke(); text(this.bannerText, 0, -7, { gr: 24, farbe: '#FFE08A', schrift: 'Fraunces' }); text(this.bannerSub, 0, 16, { gr: 12, farbe: '#F5E6C8', art: '700', schat: false }); x.restore(); }
  },
  minzKringel(t, zeit){ const p = t.p; x.strokeStyle = 'rgba(70,180,120,.7)'; x.lineWidth = 1.5; for (let i = 0; i < 2; i++) { const w = zeit * 4 + i * Math.PI; x.beginPath(); x.arc(p.x + Math.cos(w) * 12, p.y - 12 + Math.sin(w) * 4, 3, 0, 5); x.stroke(); } },
  zettel(t, yy){ x.save(); x.font = '800 13px "Plus Jakarta Sans", system-ui, sans-serif'; const bw = x.measureText(t).width + 28; x.restore(); rr(W / 2 - bw / 2, yy - 14, bw, 28, 14); x.fillStyle = 'rgba(43,23,10,.88)'; x.fill(); x.strokeStyle = 'rgba(255,199,44,.8)'; x.lineWidth = 1.5; x.stroke(); text(t, W / 2, yy, { gr: 13, farbe: '#FFE08A', schat: false }); },
  menuMalen(zeit){
    const k = this.menuKnoepfe(), [px, py] = SZ_K.plaetze[this.menu.platz], auf = Math.min(1, this.menu.t * 6);
    x.strokeStyle = 'rgba(255,199,44,.9)'; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 24, 0, 7); x.stroke();
    if (!k.length) return;
    const f = this.falleAuf(this.menu.platz), oben = k[0].ry < H / 2;
    // Leiste
    let lx = k[0].rx - 6, lw = k[k.length - 1].rx + k[k.length - 1].w + 6 - lx; if (f && lw < 250) { lw = 250; lx = (W - lw) / 2; }
    const ly = k[0].ry - (f ? 22 : 6), lh = k[0].h + (f ? 28 : 12);
    x.save(); x.globalAlpha = auf; x.translate(0, (1 - auf) * (oben ? -14 : 14));
    bodenSchatten(W / 2, ly + lh + 4, lw * .5, 8, .35);
    rr(lx, ly, lw, lh, 16); x.fillStyle = 'rgba(43,23,10,.9)'; x.fill(); x.strokeStyle = 'rgba(255,199,44,.75)'; x.lineWidth = 1.5; x.stroke();
    if (f) text(`${SZ_ARTEN[f.art].n}, ${f.st === SZ_MAX ? 'Meister-Stufe' : 'Stufe ' + f.st}`, W / 2, ly + 11, { gr: 11.5, farbe: '#FFE08A', schat: false });
    for (const b of k) {
      const geht = b.typ === 'weg' || this.geld >= b.preis, { rx, ry, w, h } = b, mx = rx + w / 2;
      rr(rx, ry, w, h, 12);
      x.fillStyle = b.typ === 'weg' ? linear(0, ry, 0, ry + h, [[0, '#FFF2EC'], [1, '#F4D2C6']]) : linear(0, ry, 0, ry + h, [[0, '#FFFBF2'], [1, '#F2DDB4']]); x.fill();
      x.strokeStyle = geht ? (b.typ === 'up' ? '#3DAA55' : b.typ === 'weg' ? '#C0563E' : '#C98A00') : '#B9A98F'; x.lineWidth = 2.5; x.stroke();
      x.save(); x.globalAlpha = geht ? 1 : .45;
      if (b.typ === 'weg') { x.strokeStyle = '#C0563E'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(mx - 7, ry + 12); x.lineTo(mx + 7, ry + 26); x.moveTo(mx + 7, ry + 12); x.lineTo(mx - 7, ry + 26); x.stroke(); }
      else if (b.typ === 'up') { x.fillStyle = '#3DAA55'; const cy = ry + 19; x.beginPath(); x.moveTo(mx, cy - 11); x.lineTo(mx + 10, cy); x.lineTo(mx + 4, cy); x.lineTo(mx + 4, cy + 8); x.lineTo(mx - 4, cy + 8); x.lineTo(mx - 4, cy); x.lineTo(mx - 10, cy); x.closePath(); x.fill(); }
      else { x.save(); x.translate(mx, ry + 22); x.scale(.58, .58); sz_falleMalen({ x: 0, y: 0, st: 0, art: b.art, ein: 1, schnapp: 0 }, zeit, 'icon'); x.restore(); }
      x.restore();
      const lbl = b.typ === 'bau' ? SZ_ARTEN[b.art].kurz : b.typ === 'up' ? (f && f.st + 1 === SZ_MAX ? 'Meister' : 'Stufe ' + (f ? f.st + 1 : '')) : 'Abbauen';
      text(lbl, mx, ry + 42, { gr: 11, farbe: F.braun, schat: false });
      const pt = b.typ === 'weg' ? '+' + (-b.preis) : String(b.preis);
      rr(mx - 20, ry + 51, 40, 15, 7.5); x.fillStyle = geht ? (b.typ === 'weg' ? '#C0563E' : '#4B2A14') : '#9A8A72'; x.fill();
      sz_kornIcon(mx - 11, ry + 58.5, .6); text(pt, mx + 4, ry + 58.5, { gr: 10.5, farbe: '#FFE9B0', schat: false });
    }
    x.restore();
  },
  /** Für Prüfungen und zum Ausbalancieren: Plätze nach Länge der Mehlspur in Reichweite */
  platzWert(i){ const [px, py] = SZ_K.plaetze[i]; let n = 0; SZ_K.wege.forEach((_, wi) => { for (let d = 0; d < SZ_K.laengen[wi]; d += 6) { const p = sz_punktAuf(d, wi); if (p && p.y > 80 && Math.hypot(p.x - px, p.y - py) < 80) n++; } }); return n; },
  testZug(){
    if (this.gold && !this.gold.weg && this.gold.t > 1.2) return { x: this.gold.x, y: this.gold.y, warte: 250 };
    if (this.vorbei) return { x: 180, y: 120, warte: 300 };
    const anz = (a) => this.fallen.filter((f) => f.art === a).length;
    const wunschArt = () => { const n = this.fallen.length; if (n >= 1 && anz('licht') < Math.ceil(n / 3)) return 'licht'; if (this.frei('katze') && anz('katze') < 2) return 'katze'; if (this.frei('kleber') && anz('kleber') < 1) return 'kleber'; if (n >= 3 && anz('minz') < 1) return 'minz'; return 'falle'; };
    const frei = SZ_K.plaetze.map((_, i) => i).filter((i) => !this.falleAuf(i)).sort((a, b) => this.platzWert(b) - this.platzWert(a));
    if (this.menu) { const b = this.menuKnoepfe().find((k) => (k.typ === 'bau' && k.art === wunschArt()) || k.typ === 'up'); if (b && this.geld >= b.preis) return { x: b.x, y: b.y, warte: 300 }; return { x: 180, y: 120, warte: 300 }; }
    if (frei.length && this.fallen.length < 6) { if (this.geld >= SZ_ARTEN[wunschArt()].preis) return { x: SZ_K.plaetze[frei[0]][0], y: SZ_K.plaetze[frei[0]][1], warte: 300 }; return { x: 180, y: 120, warte: 400 }; }
    const f = this.fallen.filter((ff) => ff.st < SZ_MAX).sort((a, b) => sz_upPreis(a.art, a.st) * (a.art === 'minz' ? 2.5 : 1) - sz_upPreis(b.art, b.st) * (b.art === 'minz' ? 2.5 : 1))[0];
    const baue = frei.length && (!f || SZ_ARTEN[wunschArt()].preis <= sz_upPreis(f.art, f.st));
    if (baue) { if (this.geld >= SZ_ARTEN[wunschArt()].preis) return { x: SZ_K.plaetze[frei[0]][0], y: SZ_K.plaetze[frei[0]][1], warte: 300 }; return { x: 180, y: 120, warte: 400 }; }
    if (f && this.geld >= sz_upPreis(f.art, f.st)) return { x: f.x, y: f.y, warte: 300 };
    return { x: 180, y: 120, warte: 400 };
  },
};
