// ───────── Backstuben-Chaos ─────────
// Oben die Theke mit Kunden, in der Mitte drei Öfen, unten die Teig-Kisten.
const CH_SORTEN = [
  { n: 'Brot', art: 'krusti', g0: 6.2, g1: 9.4, w: 70, h: 38, bw: 34, bh: 19 },
  { n: 'Brötchen', art: 'broetchen', g0: 3.6, g1: 6.2, w: 40, h: 29, bw: 24, bh: 18 },
  { n: 'Brezel', art: 'brezel', g0: 4.6, g1: 7.6, w: 58, h: 44, bw: 34, bh: 26 },
];
const CH_BLASE_Y = 76, CH_OFEN_Y = 202, CH_OFEN_H = 134, CH_OFEN_W = 108, CH_KISTE_Y = 346, CH_KISTE_H = 82;
let ch_anz = 3, ch_ablN = 4;
const ch_ofenW = () => (ch_anz === 4 ? 81 : 108);
const ch_ofenX = (i) => (ch_anz === 4 ? 9 + i * 87 : 10 + i * 116);
const ch_kisteX = (i) => 10 + i * 116;
const ch_slotX = (i) => 64 + i * 116;
const ch_ablageX = (j) => (ch_ablN === 6 ? 40 + j * 56 : 66 + j * 76);
const ch_blaseX = (slot) => ch_slotX(slot) + (slot === 2 ? -36 : 36);
const CH_HAUT = ['#F6D3B6', '#EDBB94', '#D69A6C', '#A86B45', '#7A4A2E', '#F3C7A2'];
const CH_HAAR = ['#3B2416', '#6B3E1F', '#C98A3E', '#1E1A18', '#9C9C9C', '#B4502A', '#E8C36A'];
const CH_HEMD = [['#E7714F', '#B84A2E'], ['#4F8FC9', '#2E5E8E'], ['#68A866', '#3E7A3C'], ['#C57BB8', '#8E4D84'], ['#F0B43C', '#B9811A'], ['#5BA6A0', '#337A74'], ['#8A6BD1', '#5B42A0']];
let ch_bg = null, ch_bgSchl = '';
const CH_VERB = {
  schnell: { n: 'Schnellerer Ofen', k: 'Turbo', z: ['Alle Öfen backen', '20 % schneller'] },
  fenster: { n: 'Gutes Gespür', k: 'Grün', z: ['Der grüne Bereich', 'wird breiter'] },
  geduld: { n: 'Geduldige Kunden', k: 'Geduld', z: ['Kunden warten', '25 % länger'] },
  ofen4: { n: 'Vierter Ofen', k: '4 Öfen', z: ['Ein Ofen mehr', 'in der Backstube'] },
  auslage: { n: 'Größere Auslage', k: 'Vitrine', z: ['6 statt 4 Plätze', 'in der Vitrine'] },
  leben: { n: 'Extra-Herz', k: 'Herz', z: ['Ein Herz mehr,', 'gleich aufgefüllt'] },
};
/** Kleines Symbol je Verbesserung, Mitte bei (0, 0), etwa 40 px */
function ch_verbIcon(k){
  x.lineCap = 'round'; x.lineJoin = 'round';
  if (k === 'schnell') { x.fillStyle = linear(0, -18, 0, 18, [[0, '#FFE27A'], [.5, '#FF9A2E'], [1, '#E0452E']]); x.beginPath(); x.moveTo(0, -20); x.bezierCurveTo(14, -6, 16, 6, 10, 14); x.quadraticCurveTo(0, 22, -10, 14); x.bezierCurveTo(-16, 4, -8, -4, -4, -8); x.quadraticCurveTo(-2, 0, 2, 2); x.quadraticCurveTo(4, -10, 0, -20); x.fill(); x.fillStyle = '#FFF4C8'; x.beginPath(); x.ellipse(1, 10, 4, 6, 0, 0, 7); x.fill(); }
  else if (k === 'fenster') { rr(-20, -6, 40, 12, 6); x.fillStyle = '#F2C66B'; x.fill(); x.fillStyle = '#3DBA5A'; rr(-12, -6, 24, 12, 3); x.fill(); x.strokeStyle = '#FFFFFF'; x.lineWidth = 2; x.beginPath(); x.moveTo(-16, -12); x.lineTo(-20, -12); x.moveTo(16, -12); x.lineTo(20, -12); x.stroke(); x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(0, -4); x.lineTo(-6, -14); x.lineTo(6, -14); x.closePath(); x.fill(); x.strokeStyle = '#FFE08A'; x.beginPath(); x.moveTo(-10, 12); x.lineTo(-18, 12); x.moveTo(10, 12); x.lineTo(18, 12); x.stroke(); }
  else if (k === 'geduld') { x.fillStyle = '#F6D3B6'; x.beginPath(); x.arc(0, 0, 16, 0, 7); x.fill(); x.fillStyle = '#2B170A'; x.strokeStyle = '#2B170A'; x.lineWidth = 2.2; x.beginPath(); x.arc(-6, -2, 3.5, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); x.beginPath(); x.arc(6, -2, 3.5, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); x.beginPath(); x.arc(0, 4, 6, .2, Math.PI - .2); x.stroke(); x.strokeStyle = '#3DAA55'; x.lineWidth = 3; x.beginPath(); x.arc(0, 0, 19, -Math.PI / 2, Math.PI * 1.3); x.stroke(); }
  else if (k === 'ofen4') { rr(-17, -18, 34, 36, 6); x.fillStyle = linear(-17, 0, 17, 0, [[0, '#8E99A4'], [.3, '#DCE3E9'], [1, '#6E7884']]); x.fill(); rr(-12, -9, 24, 16, 4); x.fillStyle = radial(0, 4, 1, 16, [[0, '#FFC060'], [1, '#B4501A']]); x.fill(); x.fillStyle = '#2A2E34'; rr(-12, -15, 24, 4, 2); x.fill(); x.fillStyle = '#3DAA55'; x.beginPath(); x.arc(14, 14, 8, 0, 7); x.fill(); x.strokeStyle = '#FFFFFF'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(10, 14); x.lineTo(18, 14); x.moveTo(14, 10); x.lineTo(14, 18); x.stroke(); }
  else if (k === 'auslage') { rr(-20, -12, 40, 24, 4); x.fillStyle = 'rgba(200,230,240,.75)'; x.fill(); x.strokeStyle = '#C08A52'; x.lineWidth = 3; x.stroke(); brot('broetchen', -9, 2, 14, 10, { schatten: false }); brot('brezel', 8, 1, 16, 12, { schatten: false }); x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(-16, -10, 6, 20); }
  else if (k === 'leben') { x.fillStyle = linear(0, -16, 0, 16, [[0, '#FF6B55'], [1, '#B42318']]); x.beginPath(); x.moveTo(0, 16); x.bezierCurveTo(-24, 0, -14, -20, 0, -8); x.bezierCurveTo(14, -20, 24, 0, 0, 16); x.fill(); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-7, -6, 4, 2.5, -.6, 0, 7); x.fill(); }
}

/** Gebäck zeichnen, ton fließend 0 … 2 (überblendet zwischen roh, perfekt, verbrannt) */
function ch_ware(s, cx, cy, sk, ton, schat){
  const d = CH_SORTEN[s], w = d.w * sk, h = d.h * sk;
  const male = (t, alpha, mitSchatten) => {
    x.globalAlpha = alpha;
    if (s === 1) { brot('broetchen', cx - w * .32, cy + h * .05, w * .78, h * .82, { ton: t, schatten: mitSchatten }); brot('broetchen', cx + w * .32, cy - h * .02, w * .78, h * .82, { ton: t, schatten: mitSchatten, mohn: true }); }
    else brot(d.art, cx, cy, w, h, { ton: t, schatten: mitSchatten });
    x.globalAlpha = 1;
  };
  const unten = Math.min(1, Math.floor(ton)), anteil = ton - unten;
  male(unten, 1, schat !== false);
  if (anteil > .02 && unten < 2) male(unten + 1, Math.min(1, anteil), false);
}

function ch_statisch(){
  // ── Ladenwand ──
  x.fillStyle = linear(0, 0, 0, 150, [[0, '#F4E2C3'], [1, '#E6CB9D']]); x.fillRect(0, 0, W, 150);
  x.strokeStyle = 'rgba(150,105,55,.16)'; x.lineWidth = 1;
  for (let r = 0; r < 11; r++) { const yy = r * 14; x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); for (let k = (r % 2) * 14; k < W; k += 28) { x.beginPath(); x.moveTo(k, yy); x.lineTo(k, yy + 14); x.stroke(); } }
  x.fillStyle = 'rgba(255,255,255,.22)'; for (let r = 0; r < 11; r++) x.fillRect(0, r * 14 + 1, W, 1);
  // Schaufenster mit Straße (Tiefe)
  const fx = 22, fy = 42, fw = 316, fh = 78;
  rr(fx - 6, fy - 6, fw + 12, fh + 12, 10); x.fillStyle = linear(0, fy, 0, fy + fh, [[0, '#8A5A30'], [1, '#5E3A1C']]); x.fill();
  rr(fx, fy, fw, fh, 6); x.fillStyle = linear(0, fy, 0, fy + fh, [[0, '#BFE3F2'], [.6, '#E8F3EC'], [1, '#F4E9CF']]); x.fill();
  x.save(); rr(fx, fy, fw, fh, 6); x.clip();
  // Häuser gegenüber
  const haus = [[fx - 10, 60, '#E9B48A'], [fx + 50, 46, '#D98C6A'], [fx + 104, 66, '#F0D29A'], [fx + 160, 50, '#C9A6D6'], [fx + 214, 58, '#9FC7B0'], [fx + 268, 48, '#E7A486']];
  for (const [hx, hh, hf] of haus) { x.fillStyle = hf; x.fillRect(hx, fy + fh - hh, 56, hh); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(hx + 46, fy + fh - hh, 10, hh); x.fillStyle = 'rgba(255,255,255,.55)'; for (let a = 0; a < 3; a++) for (let b = 0; b < Math.floor(hh / 18); b++) x.fillRect(hx + 7 + a * 15, fy + fh - hh + 8 + b * 18, 8, 10); }
  x.fillStyle = '#B9A88E'; x.fillRect(fx, fy + fh - 10, fw, 10);
  x.fillStyle = linear(0, fy, 0, fy + fh, [[0, 'rgba(255,255,255,.28)'], [1, 'rgba(255,255,255,0)']]); x.fillRect(fx, fy, fw, fh);
  x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(fx + 30, fy); x.lineTo(fx + 70, fy); x.lineTo(fx + 20, fy + fh); x.lineTo(fx - 20, fy + fh); x.fill();
  x.beginPath(); x.moveTo(fx + 200, fy); x.lineTo(fx + 214, fy); x.lineTo(fx + 170, fy + fh); x.lineTo(fx + 156, fy + fh); x.fill();
  x.restore();
  x.fillStyle = '#6E4423'; x.fillRect(fx + fw / 3 - 2, fy, 4, fh); x.fillRect(fx + fw * 2 / 3 - 2, fy, 4, fh);
  // Markise über dem Fenster
  for (let i = 0; i < 12; i++) { const mx = fx - 6 + i * (fw + 12) / 12, mw = (fw + 12) / 12; x.fillStyle = i % 2 ? '#FFFFFF' : '#FFC72C'; x.beginPath(); x.moveTo(mx, 30); x.lineTo(mx + mw, 30); x.lineTo(mx + mw, 40); x.arc(mx + mw / 2, 40, mw / 2, 0, Math.PI); x.closePath(); x.fill(); }
  x.fillStyle = 'rgba(80,40,10,.18)'; x.fillRect(fx - 6, 30, fw + 12, 3);
  // Lampen
  for (const lx of [122, 238]) { x.strokeStyle = '#4B2A14'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(lx, 0); x.lineTo(lx, 12); x.stroke(); x.fillStyle = linear(lx - 12, 0, lx + 12, 0, [[0, '#7A4418'], [.4, '#C98A3E'], [1, '#5E3418']]); x.beginPath(); x.moveTo(lx - 5, 12); x.lineTo(lx + 5, 12); x.lineTo(lx + 13, 22); x.lineTo(lx - 13, 22); x.closePath(); x.fill(); x.fillStyle = radial(lx, 24, 0, 40, [[0, 'rgba(255,226,140,.55)'], [1, 'rgba(255,226,140,0)']]); x.beginPath(); x.arc(lx, 24, 40, 0, 7); x.fill(); x.fillStyle = '#FFF4C8'; x.beginPath(); x.ellipse(lx, 22, 9, 2.5, 0, 0, 7); x.fill(); }
  // ── Backstube: Ziegelwand ──
  x.fillStyle = linear(0, 186, 0, 440, [[0, '#9C5A3A'], [1, '#7E4428']]); x.fillRect(0, 186, W, 260);
  for (let r = 0; r < 19; r++) { const yy = 188 + r * 14; for (let k = -((r % 2) * 16); k < W; k += 32) { const z = zufallFest(r * 31 + k); x.fillStyle = `rgb(${158 + z * 30 | 0},${88 + z * 18 | 0},${58 + z * 12 | 0})`; rr(k + 1.5, yy + 1.5, 29, 11, 2.5); x.fill(); x.fillStyle = 'rgba(255,220,180,.12)'; x.fillRect(k + 3, yy + 2, 26, 2); } }
  x.fillStyle = linear(0, 186, 0, 230, [[0, 'rgba(40,15,5,.45)'], [1, 'rgba(40,15,5,0)']]); x.fillRect(0, 186, W, 44);
  // ── Öfen (Gehäuse) ──
  for (let i = 0; i < ch_anz; i++) ch_ofenGehaeuse(ch_ofenX(i), CH_OFEN_Y, i);
  // ── Werkbank und Boden ──
  x.fillStyle = linear(0, 436, 0, 480, [[0, '#D9C2A0'], [1, '#BFA27A']]); x.fillRect(0, 436, W, 44);
  x.strokeStyle = 'rgba(110,75,35,.22)'; x.lineWidth = 1; for (let k = 0; k <= W; k += 40) { x.beginPath(); x.moveTo(k, 436); x.lineTo(k + (k - 180) * .3, 480); x.stroke(); } x.beginPath(); x.moveTo(0, 456); x.lineTo(W, 456); x.stroke();
  holz(0, 424, W, 16, 3, '#C08A52', '#8A5A2C');
  x.fillStyle = 'rgba(40,20,5,.3)'; x.fillRect(0, 440, W, 4);
  for (let i = 0; i < 3; i++) ch_kiste(ch_kisteX(i), CH_KISTE_Y, i);
  // ── Theke (vorne über den Kunden) ──
  x.fillStyle = 'rgba(40,20,5,.25)'; x.fillRect(0, 186, W, 8);
  x.fillStyle = linear(0, 156, 0, 186, [[0, '#F7EBD6'], [1, '#EBD7B4']]); x.fillRect(0, 156, W, 30); x.fillStyle = 'rgba(150,200,215,.22)'; x.fillRect(0, 156, W, 30); x.fillStyle = linear(0, 156, 0, 164, [[0, 'rgba(60,40,20,.25)'], [1, 'rgba(60,40,20,0)']]); x.fillRect(0, 158, W, 8); for (let j = 0; j < ch_ablN; j++) { x.fillStyle = 'rgba(255,255,255,.55)'; rr(ch_ablageX(j) - (ch_ablN === 6 ? 22 : 26), 179, ch_ablN === 6 ? 44 : 52, 5, 2.5); x.fill(); }
  
  holz(-4, 146, W + 8, 12, 4, '#D6A36A', '#9A6434');
  x.fillStyle = linear(0, 184, 0, 194, [[0, '#6E4423'], [1, '#4B2A14']]); x.fillRect(0, 184, W, 8);
}

function ch_ofenGehaeuse(ox, oy, i){
  const w = ch_ofenW(), h = CH_OFEN_H;
  bodenSchatten(ox + w / 2, oy + h + 2, w * .55, 7, .45);
  rr(ox, oy, w, h, 14); x.fillStyle = linear(ox, 0, ox + w, 0, [[0, '#8E99A4'], [.18, '#DCE3E9'], [.5, '#B4BEC8'], [.85, '#8B96A1'], [1, '#6E7884']]); x.fill();
  x.strokeStyle = 'rgba(40,50,60,.55)'; x.lineWidth = 1.5; x.stroke();
  // gebürstete Linien
  x.save(); rr(ox, oy, w, h, 14); x.clip(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; for (let k = 0; k < h; k += 3) { x.beginPath(); x.moveTo(ox, oy + k); x.lineTo(ox + w, oy + k + 1); x.stroke(); } x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(ox, oy, w, 2); x.restore();
  // Bedienleiste
  rr(ox + 8, oy + 7, w - 16, 16, 6); x.fillStyle = linear(0, oy + 7, 0, oy + 23, [[0, '#3A4048'], [1, '#22262C']]); x.fill();
  for (const kx of [ox + 20, ox + w - 20]) { x.fillStyle = radial(kx, oy + 15, 0, 7, [[0, '#F2F4F6'], [.7, '#A8B0B8'], [1, '#5E6670']], kx - 2, oy + 12); x.beginPath(); x.arc(kx, oy + 15, 6, 0, 7); x.fill(); x.strokeStyle = '#3A4048'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(kx, oy + 15); x.lineTo(kx + 3, oy + 11); x.stroke(); }
  // Tür mit Fenster
  rr(ox + 8, oy + 27, w - 16, 66, 10); x.fillStyle = linear(0, oy + 27, 0, oy + 93, [[0, '#59626C'], [1, '#3A4048']]); x.fill();
  rr(ox + 14, oy + 32, w - 28, 54, 7); x.fillStyle = '#1C1410'; x.fill();
  // Griff
  rr(ox + 18, oy + 95, w - 36, 7, 3.5); x.fillStyle = linear(0, oy + 95, 0, oy + 102, [[0, '#FFFFFF'], [.5, '#B8C0C8'], [1, '#6E7884']]); x.fill();
  // Skala-Rahmen
  rr(ox + 10, oy + 106, w - 20, 12, 6); x.fillStyle = '#2A2E34'; x.fill();
  // Glutfach
  rr(ox + 12, oy + 121, w - 24, 9, 4); x.fillStyle = '#2A1A12'; x.fill();
  for (let k = 0; k < Math.floor((w - 28) / 10); k++) { x.fillStyle = '#3A2418'; x.fillRect(ox + 16 + k * 10, oy + 122, 4, 7); }
}

function ch_kiste(kx, ky, s){
  const w = CH_OFEN_W, h = CH_KISTE_H;
  bodenSchatten(kx + w / 2, ky + h, w * .5, 6, .4);
  holz(kx, ky + 18, w, h - 18, 8, '#C98E52', '#8E5A2A');
  // Innenraum
  rr(kx + 6, ky + 10, w - 12, 24, 7); x.fillStyle = linear(0, ky + 10, 0, ky + 34, [[0, '#4A2C14'], [1, '#6E4423']]); x.fill();
  // Teiglinge (roh)
  const d = CH_SORTEN[s];
  const pos = [[-26, 14], [0, 8], [26, 14]];
  for (const [dx, dy] of pos) { if (s === 1) brot('broetchen', kx + w / 2 + dx, ky + dy + 10, 30, 22, { ton: 0 }); else if (s === 2) brot('brezel', kx + w / 2 + dx, ky + dy + 8, 36, 28, { ton: 0 }); else brot('krusti', kx + w / 2 + dx, ky + dy + 10, 40, 22, { ton: 0 }); }
  // Vorderwand der Kiste
  holz(kx, ky + 30, w, h - 30, 8, '#D49A5C', '#94602F');
  x.strokeStyle = 'rgba(70,40,15,.35)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(kx + 4, ky + 52); x.lineTo(kx + w - 4, ky + 52); x.stroke();
  // Schild
  rr(kx + 18, ky + 48, w - 36, 22, 7); x.fillStyle = linear(0, ky + 48, 0, ky + 70, [[0, '#FFFBF2'], [1, '#F2E2C2']]); x.fill(); x.strokeStyle = 'rgba(120,80,30,.4)'; x.lineWidth = 1; x.stroke();
  for (const nx of [kx + 23, kx + w - 23]) { x.fillStyle = '#8A6A3A'; x.beginPath(); x.arc(nx, ky + 59, 1.6, 0, 7); x.fill(); }
  void d;
}

function ch_kundeMalen(k, zeit){
  const ein = ease.aus(Math.min(1, k.ein)), side = k.slot === 0 ? -1 : 1;
  let cx = ch_slotX(k.slot) + (1 - ein) * side * 90, by = 0;
  if (k.zust === 'froh') { const t = k.wegT; by = -Math.abs(Math.sin(t * 9)) * 6 * (1 - Math.min(1, t)); cx += ease.ein(Math.min(1, t / .9)) * side * 120; }
  if (k.zust === 'sauer') cx += ease.ein(Math.min(1, k.wegT / .8)) * side * 130 + Math.sin(k.wegT * 40) * 2;
  const atm = Math.sin(zeit * 2.2 + k.seed * 3) * 1.2;
  const a = k.zust ? Math.max(0, 1 - k.wegT * .9) : Math.min(1, k.ein * 2);
  x.save(); x.globalAlpha = a; x.translate(cx, by); x.translate(0, 100); x.scale(1.14, 1.14); x.translate(0, -100);
  const hy = 100 + atm * .4;
  // Körper
  const [h1, h2] = CH_HEMD[k.hemd];
  rr(-36, 121 + atm, 72, 50, 24); x.fillStyle = linear(-36, 121, 36, 171, [[0, h1], [1, h2]]); x.fill();
  x.fillStyle = 'rgba(255,255,255,.18)'; rr(-26, 126 + atm, 30, 8, 4); x.fill();
  x.fillStyle = CH_HAUT[k.haut]; x.beginPath(); x.moveTo(-8, 122 + atm); x.lineTo(8, 122 + atm); x.lineTo(0, 134 + atm); x.closePath(); x.fill();
  x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(-6, 117, 12, 7);
  // Haare hinten
  const haar = CH_HAAR[k.haarF];
  x.fillStyle = haar;
  if (k.stil === 2) { rr(-22, hy - 14, 44, 44, 16); x.fill(); }
  if (k.stil === 1) { x.beginPath(); x.arc(0, hy - 22, 10, 0, 7); x.fill(); }
  // Kopf
  x.fillStyle = CH_HAUT[k.haut]; x.beginPath(); x.arc(-19, hy + 2, 4.5, 0, 7); x.arc(19, hy + 2, 4.5, 0, 7); x.fill();
  x.fillStyle = radial(0, hy, 2, 22, [[0, '#FFF3E6'], [.25, CH_HAUT[k.haut]], [1, CH_HAUT[k.haut]]], -7, hy - 8); x.beginPath(); x.arc(0, hy, 19, 0, 7); x.fill();
  x.fillStyle = 'rgba(80,30,10,.12)'; x.beginPath(); x.arc(0, hy, 19, .2, Math.PI - .2); x.arc(0, hy - 5, 17, Math.PI - .2, .2, true); x.fill();
  // Haare vorne
  x.fillStyle = haar;
  if (k.stil === 0 || k.stil === 1 || k.stil === 2) { x.beginPath(); x.arc(0, hy - 2, 19.5, Math.PI * 1.02, Math.PI * 1.98); x.quadraticCurveTo(8, hy - 14, -4, hy - 12); x.quadraticCurveTo(-14, hy - 10, -19.3, hy - 4); x.fill(); }
  if (k.stil === 3) { for (let i = 0; i < 9; i++) { const w = Math.PI * (1.05 + i * .11); x.beginPath(); x.arc(Math.cos(w) * 17, hy - 2 + Math.sin(w) * 17, 7, 0, 7); x.fill(); } }
  if (k.stil === 4) { x.fillStyle = h2; x.beginPath(); x.arc(0, hy - 6, 20, Math.PI, 0); x.fill(); rr(-24, hy - 8, 48, 6, 3); x.fill(); x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(-6, hy - 16, 6, Math.PI, 0); x.fill(); }
  if (k.stil === 5) { x.beginPath(); x.ellipse(0, hy - 17, 15, 5, 0, Math.PI, 0); x.fill(); x.fillStyle = haar; rr(-12, hy + 9, 24, 12, 6); x.fill(); }
  x.fillStyle = 'rgba(255,255,255,.2)'; x.beginPath(); x.ellipse(-7, hy - 14, 5, 2, -.4, 0, 7); x.fill();
  // Gesicht
  const geduld = k.zust === 'froh' ? 1 : k.zust === 'sauer' ? 0 : 1 - k.t / k.max;
  const blinz = (zeit + k.seed * 5) % 3.6 < .12;
  const froh = k.zust === 'froh';
  x.fillStyle = '#2B170A'; x.strokeStyle = '#2B170A'; x.lineCap = 'round';
  for (const ex of [-7, 7]) {
    if (froh) { x.lineWidth = 2.2; x.beginPath(); x.arc(ex, hy + 1, 3.5, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
    else if (blinz) { x.lineWidth = 2; x.beginPath(); x.moveTo(ex - 3, hy); x.lineTo(ex + 3, hy); x.stroke(); }
    else { x.beginPath(); x.ellipse(ex, hy, 2.6, 3.3, 0, 0, 7); x.fill(); x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(ex - .9, hy - 1.2, 1, 0, 7); x.fill(); x.fillStyle = '#2B170A'; }
  }
  if (geduld < .3 && !froh) { x.lineWidth = 2; x.beginPath(); x.moveTo(-11, hy - 8); x.lineTo(-4, hy - 5.5); x.moveTo(11, hy - 8); x.lineTo(4, hy - 5.5); x.stroke(); }
  else { x.lineWidth = 1.6; x.strokeStyle = 'rgba(43,23,10,.6)'; x.beginPath(); x.moveTo(-10, hy - 7); x.lineTo(-4, hy - 8); x.moveTo(10, hy - 7); x.lineTo(4, hy - 8); x.stroke(); x.strokeStyle = '#2B170A'; }
  if (k.brille) { x.strokeStyle = '#3A2A20'; x.lineWidth = 1.6; x.beginPath(); x.arc(-7, hy, 5.5, 0, 7); x.moveTo(12.5, hy); x.arc(7, hy, 5.5, 0, 7); x.moveTo(-1.5, hy); x.lineTo(1.5, hy); x.stroke(); }
  x.fillStyle = geduld < .3 && !froh ? 'rgba(230,70,50,.45)' : 'rgba(240,110,100,.35)'; x.beginPath(); x.ellipse(-11, hy + 7, 3.6, 2.3, 0, 0, 7); x.ellipse(11, hy + 7, 3.6, 2.3, 0, 0, 7); x.fill();
  x.lineWidth = 2; x.strokeStyle = '#7A2E1A';
  if (froh) { x.fillStyle = '#7A2E1A'; x.beginPath(); x.arc(0, hy + 7, 5.5, 0, Math.PI); x.closePath(); x.fill(); x.fillStyle = '#F07C6A'; x.beginPath(); x.arc(0, hy + 10, 2.6, 0, Math.PI); x.fill(); }
  else if (geduld > .55) { x.beginPath(); x.arc(0, hy + 6, 4.5, .25, Math.PI - .25); x.stroke(); }
  else if (geduld > .3) { x.beginPath(); x.moveTo(-3.5, hy + 10); x.lineTo(3.5, hy + 10); x.stroke(); }
  else { x.beginPath(); x.arc(0, hy + 13, 4.5, Math.PI + .35, -.35); x.stroke(); }
  x.restore();
}

function ch_blase(k, zeit){
  if (k.zust || k.ein < .7) return;
  const geduld = 1 - k.t / k.max;
  const dir = k.slot === 2 ? -1 : 1; let cx = ch_blaseX(k.slot), cy = CH_BLASE_Y;
  if (geduld < .25) cx += Math.sin(zeit * 30) * 1.2;
  const pop = ease.feder(Math.min(1, (k.ein - .7) / .3));
  x.save(); x.translate(cx, cy); x.scale(pop, pop);
  // Schwanz zur Figur
  x.save(); x.scale(dir, 1); x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(-14, 14); x.quadraticCurveTo(-20, 26, -26, 30); x.quadraticCurveTo(-10, 26, -4, 18); x.closePath(); x.fill(); x.restore();
  bodenSchatten(0, 4, 26, 24, .18);
  x.fillStyle = radial(0, 0, 2, 24, [[0, '#FFFFFF'], [1, '#FFF4DE']], -6, -8); x.beginPath(); x.arc(0, 0, 22, 0, 7); x.fill();
  // Geduldsring
  x.lineCap = 'round'; x.lineWidth = 4.5; x.strokeStyle = 'rgba(75,42,20,.15)'; x.beginPath(); x.arc(0, 0, 22, 0, 7); x.stroke();
  const farbe = geduld > .5 ? '#3DAA55' : geduld > .25 ? '#F2A516' : '#E0452E';
  x.strokeStyle = farbe; x.beginPath(); x.arc(0, 0, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * geduld); x.stroke();
  ch_ware(k.s, 0, 0, CH_SORTEN[k.s].bw / CH_SORTEN[k.s].w, 1, false);
  const rest = k.n - k.da;
  if (k.n > 1 && rest > 0) { x.fillStyle = linear(0, -26, 0, -8, [[0, '#FFD95A'], [1, '#E6A800']]); rr(dir * -31 - 13, -9, 26, 18, 9); x.fill(); x.strokeStyle = '#8A5A10'; x.lineWidth = 1; x.stroke(); text(rest + '×', dir * -31, 0, { gr: 12, farbe: F.braun, schat: false }); }
  if (k.unter >= k.n) { x.fillStyle = 'rgba(61,170,85,.9)'; x.beginPath(); x.arc(15, -15, 7, 0, 7); x.fill(); x.strokeStyle = '#FFFFFF'; x.lineWidth = 2; x.beginPath(); x.moveTo(11.5, -15); x.lineTo(14, -12.5); x.lineTo(18.5, -17.5); x.stroke(); }
  x.restore();
}

/** Goldbrezel: Mitte (0, 0), Breite etwa 60 * s */
function ch_goldBrezel(s){
  x.save(); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round';
  const pfad = () => { x.beginPath(); x.moveTo(-14, 16); x.bezierCurveTo(-34, 6, -30, -22, -10, -20); x.bezierCurveTo(4, -18, 6, -2, 0, 6); x.bezierCurveTo(-6, -2, -4, -18, 10, -20); x.bezierCurveTo(30, -22, 34, 6, 14, 16); x.moveTo(-10, 2); x.lineTo(12, 18); x.moveTo(10, 2); x.lineTo(-12, 18); };
  pfad(); x.strokeStyle = '#7A4F00'; x.lineWidth = 12.5; x.stroke();
  pfad(); x.strokeStyle = linear(-30, -22, 30, 18, [[0, '#FFF1B8'], [.45, '#FFC72C'], [1, '#C98A00']]); x.lineWidth = 9.5; x.stroke();
  x.translate(-1.2, -2.2); pfad(); x.strokeStyle = 'rgba(255,250,220,.75)'; x.lineWidth = 2.6; x.stroke();
  x.fillStyle = '#FFFFFF'; [[-22, -8], [-13, -17], [16, -15], [23, -3], [-4, 13], [6, 11]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.3, 0, 7); x.fill(); });
  x.restore();
}
SPIELE.chaos = {
  medaillen: [600, 1800, 4000],
  key: 'chaos', name: 'Backstuben-Chaos', kurz: 'Backen',
  anleitung: 'Tippe eine Teig-Kiste, dann einen freien Ofen. Hol die Ware raus, wenn der Zeiger im Grünen ist. Sie geht von selbst zum passenden Kunden.',
  start(){
    this.oefen = [null, null, null]; this.kunden = []; this.flug = []; this.ablage = []; this.wahl = null; this.wahlT = 0;
    this.punkte = 0; this.leben = 3; this.zeit = 0; this.naechst = 1.2; this.tag = 1; this.tagDauer = 50; this.tagZeit = 50;
    this.serviert = 0; this.tagServiert = 0; this.perfekt = 0; this.tagPerfekt = 0; this.combo = 0; this.letzte = -99;
    this.phase = 'spiel'; this.phaseT = 0; this.banner = 1.8; this.ersteKunden = 0; this.lernSchritte = 0; this.vorbei = 0; this.rauch = 0; this.ofenWackel = [0, 0, 0, 0]; this.kisteHuepf = [0, 0, 0];
    this.gem = !!GEMUETLICH; this.maxLeben = 3; this.verb = { schnell: 0, geduld: 0, fenster: 0, ofen4: 0, auslage: 0, leben: 0 }; this.karten = null; this.frageGestellt = false; ch_anz = 3; ch_ablN = 4; this.gold = null; this.goldZeit = zufall(15, 45);
  },
  aktuellePunkte(){ return this.punkte || 0; },
  fenster(s){ const d = CH_SORTEN[s], extra = this.tag === 1 ? .8 : 0, eng = Math.max(.62, 1 - (this.tag - 1) * .08); const mitte = (d.g0 + d.g1) / 2, halb = ((d.g1 - d.g0) / 2 * eng + extra) * (1 + .25 * (this.verb ? this.verb.fenster : 0)); return [mitte - halb, mitte + halb]; },
  ofenRect(i){ return { x: ch_ofenX(i), y: CH_OFEN_Y, w: ch_ofenW(), h: CH_OFEN_H }; },
  kisteRect(i){ return { x: ch_kisteX(i), y: CH_KISTE_Y, w: CH_OFEN_W, h: CH_KISTE_H + 8 }; },
  in(p, r){ return p.x > r.x - 4 && p.x < r.x + r.w + 4 && p.y > r.y - 4 && p.y < r.y + r.h + 4; },
  runter(p){
    if (this.gold && !this.gold.weg && this.phase === 'spiel' && Math.hypot(p.x - this.gold.x, p.y - this.gold.y) < 34) { this.gold.weg = true; this.punkte += 50; schwebText('+50', this.gold.x, this.gold.y - 26, '#B8860B', 20); goldGefangen(this.gold.x, this.gold.y); return; }
    if (this.phase === 'verbessern' && this.karten && this.phaseT > .5) { this.karten.forEach((k, j) => { const r = this.kartenRect(j); if (this.in(p, r)) this.waehleKarte(k); }); return; }
    if (this.phase !== 'spiel' || this.vorbei) return;
    for (let i = 0; i < 3; i++) if (this.in(p, this.kisteRect(i))) { this.wahl = this.wahl === i ? null : i; this.wahlT = 0; this.kisteHuepf[i] = 1; mehlWolke(ch_kisteX(i) + 54, CH_KISTE_Y + 20, 5); return; }
    for (let i = 0; i < ch_anz; i++) if (this.in(p, this.ofenRect(i))) { this.ofenTipp(i); return; }
  },
  ofenTipp(i){
    const o = this.oefen[i], r = this.ofenRect(i), mx = r.x + r.w / 2, my = r.y + 59;
    if (!o) {
      if (this.wahl === null) { this.ofenWackel[i] = 1; schwebText('Erst Teig wählen', mx, my, '#8A5A20', 14); this.kisteHuepf = [1, 1, 1]; return; }
      this.oefen[i] = { s: this.wahl, t: 0, f: this.fenster(this.wahl), ein: 0 }; this.wahl = null; this.lernSchritte = Math.max(this.lernSchritte, 1);
      mehlWolke(mx, my, 8); return;
    }
    this.oefen[i] = null;
    const [g0, g1] = o.f;
    if (o.t < g0) { schwebText('Noch zu blass', mx, my - 10, '#B07A1A', 16); brumm(60); teilchen(mx, my, { n: 10, farben: ['#F3DDB0', '#E9CC97'], form: 'krume', tempo: 120 }); this.combo = 0; this.ofenWackel[i] = 1; return; }
    if (o.t > g1) { schwebText('Verbrannt', mx, my - 10, F.rot, 17); brumm(70); teilchen(mx, my, { n: 12, farben: ['rgba(70,65,60,.7)', 'rgba(120,115,110,.6)'], tempo: 70, groesse: [5, 11], schwer: -60, leben: [.7, 1.3] }); this.combo = 0; wackeln(4); this.ofenWackel[i] = 1; return; }
    const mitte = (g0 + g1) / 2, perfekt = Math.abs(o.t - mitte) < (g1 - g0) * .18;
    if (perfekt) { brumm(25); this.perfekt++; this.tagPerfekt++; this.punkte += 5; schwebText('Perfekt! +5', mx, my - 18, '#C98A00', 17); teilchen(mx, my, { n: 16, form: 'stern', tempo: 150 }); }
    else teilchen(mx, my, { n: 8, tempo: 110 });
    this.lernSchritte = Math.max(this.lernSchritte, 2);
    this.schicken(o.s, mx, my);
  },
  schicken(s, sx, sy){
    const ziel = this.kunden.filter((k) => !k.zust && k.unter < k.n && k.s === s && k.ein >= 1).sort((a, b) => (b.t / b.max) - (a.t / a.max))[0];
    if (ziel) { ziel.unter++; this.flug.push({ s, x0: sx, y0: sy, x1: ch_blaseX(ziel.slot), y1: CH_BLASE_Y, t: 0, d: .6, k: ziel }); return; }
    if (this.ablage.length < ch_ablN) { const j = this.ablage.length; this.ablage.push({ s, da: false }); this.flug.push({ s, x0: sx, y0: sy, x1: ch_ablageX(j), y1: 172, t: 0, d: .5, ab: this.ablage[j] }); return; }
    this.punkte += 2; schwebText('+2 verkauft', sx, sy - 20, '#7A6450', 14); statPlus('verkauft', 1);
  },
  bedienen(k){
    k.zust = 'froh'; k.wegT = 0;
    const geduld = 1 - k.t / k.max;
    this.combo = this.zeit - this.letzte < 6 ? Math.min(6, this.combo + 1) : 1; this.letzte = this.zeit;
    const p = (10 + Math.round(geduld * 10)) * k.n + (this.combo - 1) * 5; this.punkte += p; this.serviert++; this.tagServiert++; brumm(20); statPlus('verkauft', k.n);
    const kx = ch_slotX(k.slot);
    schwebText('+' + p, kx, 70, F.gruen, 22);
    if (this.combo > 1) schwebText('Combo ×' + this.combo, kx, 100, '#C98A00', 16);
    teilchen(ch_blaseX(k.slot), CH_BLASE_Y, { n: 14, farben: ['#FFC72C', '#FFF1B8', '#7DBE6E'], form: 'stern', tempo: 140 });
  },
  neuerKunde(){
    const frei = [0, 1, 2].filter((sl) => !this.kunden.some((k) => k.slot === sl));
    if (!frei.length) return;
    const slot = frei[ganz(0, frei.length - 1)];
    let s = ganz(0, 2);
    if (this.ersteKunden === 0) s = 1; else if (this.ersteKunden === 1) s = 2;
    this.ersteKunden++;
    const n = this.tag >= 3 && Math.random() < Math.min(.5, .2 + (this.tag - 3) * .08) ? 2 : 1;
    const max = (this.tag === 1 ? 34 : Math.max(7, 26 - (this.tag - 2) * 2.1)) * (n > 1 ? 1.45 : 1) * (1 + .25 * this.verb.geduld);
    this.kunden.push({ s, t: 0, max, slot, ein: 0, seed: Math.random(), haut: ganz(0, CH_HAUT.length - 1), haarF: ganz(0, CH_HAAR.length - 1), hemd: ganz(0, CH_HEMD.length - 1), stil: ganz(0, 5), brille: Math.random() < .25, zust: null, wegT: 0, n, unter: 0, da: 0 });
  },
  tick(dt){
    this.zeit += dt; this.wahlT += dt;
    for (let i = 0; i < 4; i++) this.ofenWackel[i] = Math.max(0, this.ofenWackel[i] - dt * 2.5);
    for (let i = 0; i < 3; i++) { this.kisteHuepf[i] = Math.max(0, this.kisteHuepf[i] - dt * 3); }
    if (this.banner > 0) this.banner -= dt;
    if (this.gold) { const g = this.gold; g.t += dt; const u = g.t / g.dauer; g.x = g.dir > 0 ? lerp(-30, W + 30, u) : lerp(W + 30, -30, u); g.y = 126 + Math.sin(g.t * 3.2) * 16; if (u >= 1) g.weg = true; }
    // Flüge
    for (const f of this.flug) { f.t += dt / f.d; if (f.t >= 1 && !f.fertig) { f.fertig = true; if (f.k) { if (!f.k.zust) { f.k.da++; if (f.k.da >= f.k.n) this.bedienen(f.k); else { schwebText('Noch 1', ch_blaseX(f.k.slot), 108, F.braun, 14); teilchen(ch_blaseX(f.k.slot), CH_BLASE_Y, { n: 6, tempo: 80 }); } } } else if (f.ab) { f.ab.da = true; } } }
    this.flug = this.flug.filter((f) => !f.fertig);
    // Kunden
    for (const k of this.kunden) {
      k.ein = Math.min(1, k.ein + dt * 1.8);
      if (k.zust) { k.wegT += dt; continue; }
      if (this.phase === 'spiel' && k.ein >= 1 && !this.gem) k.t += dt;
      if (k.t >= k.max && k.unter < k.n) { k.zust = 'sauer'; k.wegT = 0; this.leben--; brumm(80); this.combo = 0; wackeln(7); blitz(.25, '224,69,46'); schwebText('Zu lange gewartet', ch_slotX(k.slot), 120, F.rot, 15); }
    }
    this.kunden = this.kunden.filter((k) => !(k.zust && k.wegT > 1.1));
    // Auslage an wartende Kunden
    for (const k of this.kunden) if (!k.zust && k.unter < k.n && k.ein >= 1) {
      const j = this.ablage.findIndex((a) => a.da && a.s === k.s);
      if (j >= 0) { this.ablage.splice(j, 1); k.unter++; this.flug.push({ s: k.s, x0: ch_ablageX(j), y0: 172, x1: ch_blaseX(k.slot), y1: CH_BLASE_Y, t: 0, d: .45, k }); }
    }
    if (this.vorbei) { this.vorbei += dt; if (this.vorbei > 1.1 && laeuft) ende(this.punkte, `Bis Tag ${this.tag} gebacken und ${this.serviert} Kunden bedient.`); return; }
    if (this.phase === 'spiel') {
      // Öfen
      for (let i = 0; i < ch_anz; i++) { const o = this.oefen[i]; if (!o) continue; o.t += dt * (1 + .2 * this.verb.schnell) * (this.gem && o.t > o.f[1] - .3 ? .3 : 1); o.ein = Math.min(1, o.ein + dt * 4);
        if (o.t > o.f[1]) { this.rauch -= dt; if (this.rauch <= 0) { this.rauch = .12; const r = this.ofenRect(i); teilchen(r.x + zufall(30, 78), r.y + 34, { n: 1, farben: ['rgba(80,75,70,.55)', 'rgba(130,125,120,.45)'], tempo: 18, groesse: [6, 11], schwer: -70, leben: [.9, 1.5] }); } } }
      this.tagZeit -= dt; this.naechst -= dt;
      if (!this.gold && goldKommt() && this.zeit > this.goldZeit && this.tagZeit > 7) { const dir = Math.random() < .5 ? 1 : -1; this.gold = { t: 0, dauer: 4.8, dir, x: dir > 0 ? -30 : W + 30, y: 128, weg: false }; goldErschienen(); }
      if (this.naechst <= 0) { this.neuerKunde(); const basis = this.tag === 1 ? 4.6 : Math.max(.9, 5.2 - (this.tag - 2) * .42); this.naechst = zufall(basis, basis + 2.2) * (this.gem ? 1.4 : 1); if (this.kunden.filter((k) => !k.zust).length === 0) this.naechst = 1; }
      if (this.leben <= 0) { this.vorbei = .01; return; }
      if (this.tagZeit <= 0) { statMax('tage', this.tag); this.phase = 'abschluss'; this.phaseT = 0; this.tagBonus = this.tagServiert * 5; this.punkte += this.tagBonus;
        for (const k of this.kunden) if (!k.zust) { k.zust = 'froh'; k.wegT = .4; }
        this.oefen = Array(ch_anz).fill(null); this.ablage = []; this.wahl = null; }
    } else if (this.phase === 'abschluss') {
      this.phaseT += dt;
      if (this.phaseT > 2.6) { this.phase = 'verbessern'; this.phaseT = 0; this.karten = this.kartenZiehen(); if (!this.karten.length) { this.gewaehlt = 'keins'; this.gewaehltT = .7; } }
    } else if (this.phase === 'verbessern') {
      this.phaseT += dt;
      if (this.gewaehlt && !this.frageGestellt) { this.gewaehltT = (this.gewaehltT || 0) + dt; if (this.gewaehltT > .7) { this.frageGestellt = true; frage((ok) => { if (ok) { this.punkte += 30; schwebText('+30 Bonus', W / 2, 240, F.gruen, 24); teilchen(W / 2, 240, { n: 24, form: 'stern' }); } this.naechsterTag(); }); } }
    }
    const sek = Math.max(0, Math.ceil(this.tagZeit));
    setHud([{ icon: 'uhr', text: `Tag ${this.tag}  ${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}` }, { icon: 'punkte', text: this.punkte.toLocaleString('de-DE') + (this.gem ? '' : `<span style="display:inline-flex;margin-left:7px">${herzen(Math.max(0, this.leben), this.maxLeben).text}</span>`) }]);
  },
  naechsterTag(){ this.tag++; this.tagZeit = this.tagDauer; this.tagServiert = 0; this.tagPerfekt = 0; this.phase = 'spiel'; this.frageGestellt = false; this.gewaehlt = null; this.gewaehltT = 0; this.karten = null; this.banner = 1.8; this.naechst = 1; this.leben = Math.min(this.maxLeben, this.leben + 1); },
  kartenZiehen(){
    const v = this.verb, moegl = [];
    if (v.schnell < 2) moegl.push('schnell'); if (v.geduld < 2 && !this.gem) moegl.push('geduld'); if (v.fenster < 2) moegl.push('fenster');
    if (!v.ofen4) moegl.push('ofen4'); if (!v.auslage) moegl.push('auslage'); if (this.maxLeben < 5 && !this.gem) moegl.push('leben');
    if (this.tag === 1) { const i = moegl.indexOf('ofen4'); if (i >= 0) moegl.splice(i, 1); }
    for (let i = moegl.length - 1; i > 0; i--) { const j = ganz(0, i); [moegl[i], moegl[j]] = [moegl[j], moegl[i]]; }
    return moegl.slice(0, 3);
  },
  kartenRect(j){ const n = this.karten.length, w = 110, gap = 6, x0 = (W - (n * w + (n - 1) * gap)) / 2; return { x: x0 + j * (w + gap), y: 176, w, h: 168 }; },
  waehleKarte(k){
    if (this.gewaehlt) return;
    this.gewaehlt = k; this.gewaehltT = 0; brumm(25);
    const v = this.verb; v[k]++;
    if (k === 'ofen4') { ch_anz = 4; this.oefen = [null, null, null, null]; }
    if (k === 'auslage') ch_ablN = 6;
    if (k === 'leben') { this.maxLeben++; this.leben = Math.min(this.maxLeben, this.leben + 1); }
    const j = this.karten.indexOf(k), r = this.kartenRect(j);
    teilchen(r.x + r.w / 2, r.y + 60, { n: 26, form: 'stern', tempo: 200 });
  },

  malen(zeit){
    const schl = ch_anz + '/' + ch_ablN;
    if (!ch_bg || ch_bg.width !== c.width || ch_bg.height !== c.height || ch_bgSchl !== schl) {
      ch_statisch();
      if (FX.wackel === 0) { ch_bg = document.createElement('canvas'); ch_bg.width = c.width; ch_bg.height = c.height; ch_bg.getContext('2d').drawImage(c, 0, 0); ch_bgSchl = schl; }
    } else x.drawImage(ch_bg, 0, 0, W, H);
    const kunden = this.kunden || [], oefen = this.oefen || [null, null, null, null];
    // Kunden hinter der Theke
    x.save(); x.beginPath(); x.rect(0, 0, W, 148); x.clip();
    for (const k of kunden) ch_kundeMalen(k, zeit);
    x.restore();
    // Auslage in der Glasvitrine
    (this.ablage || []).forEach((a, j) => { if (a.da) ch_ware(a.s, ch_ablageX(j), 172, ch_ablN === 6 ? .52 : .62, 1); });
    x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.moveTo(40, 158); x.lineTo(70, 158); x.lineTo(52, 184); x.lineTo(22, 184); x.fill(); x.beginPath(); x.moveTo(210, 158); x.lineTo(224, 158); x.lineTo(206, 184); x.lineTo(192, 184); x.fill();
    if (!(this.ablage || []).length) text('Auslage', 330, 172, { gr: 10, farbe: 'rgba(90,60,30,.55)', art: '800', ausr: 'right', schat: false });
    // Sprechblasen über allem
    for (const k of kunden) ch_blase(k, zeit);
    // Öfen
    for (let i = 0; i < ch_anz; i++) this.ofenMalen(i, oefen[i], zeit);
    // Kisten (Auswahl)
    for (let i = 0; i < 3; i++) {
      const kx = ch_kisteX(i), ky = CH_KISTE_Y, gew = this.wahl === i;
      const hu = this.kisteHuepf ? this.kisteHuepf[i] : 0;
      if (gew) { const pu = .5 + .5 * Math.sin(zeit * 6); x.strokeStyle = `rgba(255,199,44,${.6 + pu * .4})`; x.lineWidth = 4; rr(kx - 3, ky + 5, CH_OFEN_W + 6, CH_KISTE_H - 2, 11); x.stroke(); x.fillStyle = `rgba(255,220,120,${.12 + pu * .1})`; x.fill(); }
      text(CH_SORTEN[i].n, kx + 54, ky + 59 - hu * 3, { gr: 13, farbe: F.braun, schat: false });
      if (hu > 0) { x.fillStyle = `rgba(255,240,200,${hu * .35})`; rr(kx, ky + 8, CH_OFEN_W, 30, 8); x.fill(); }
    }
    // Fliegende Ware
    for (const f of this.flug || []) { const t = ease.aus(Math.min(1, f.t)); const mx = (f.x0 + f.x1) / 2, my = Math.min(f.y0, f.y1) - 50; const px = (1 - t) * (1 - t) * f.x0 + 2 * (1 - t) * t * mx + t * t * f.x1, py = (1 - t) * (1 - t) * f.y0 + 2 * (1 - t) * t * my + t * t * f.y1; ch_ware(f.s, px, py, lerp(.95, f.k ? .5 : .62, t), 1); }
    // Hinweise für Tag 1
    if (this.phase === 'spiel' && this.tag === 1 && this.serviert < 2 && !this.vorbei && laeuft) this.hinweis(zeit);
    // Tagesbanner
    if (this.banner > 0 && laeuft) { const a = Math.min(1, this.banner * 2), s = ease.feder(Math.min(1, (1.8 - this.banner) * 3)); x.save(); x.globalAlpha = a; x.translate(W / 2, 272); x.scale(s, s); rr(-90, -26, 180, 52, 18); x.fillStyle = linear(0, -26, 0, 26, [[0, '#5A3820'], [1, '#3A2010']]); x.fill(); x.strokeStyle = '#FFC72C'; x.lineWidth = 2; x.stroke(); text(`Tag ${this.tag || 1}`, 0, -6, { gr: 22, farbe: '#FFE08A', schrift: 'Fraunces' }); text(this.tag === 1 ? 'Die ersten Kunden kommen' : 'Mehr Kunden, weniger Geduld', 0, 14, { gr: 11, farbe: '#F5E6C8', art: '700', schat: false }); x.restore(); }
    if (this.phase === 'spiel' && !(this.tag === 1 && this.serviert < 2)) this.verbLeiste();
    if (this.gem && laeuft && this.phase === 'spiel') text('Gemütlich', 8, 470, { gr: 10, farbe: 'rgba(75,42,20,.6)', ausr: 'left', schat: false });
    if (this.gold && !this.gold.weg) { const g = this.gold; goldGlanz(g.x, g.y, 22, zeit); x.save(); x.translate(g.x, g.y); x.rotate(Math.sin(zeit * 4) * .25); ch_goldBrezel(.95 + Math.sin(zeit * 6) * .05); x.restore(); }
    if (this.phase === 'abschluss') this.abschlussMalen();
    if (this.phase === 'verbessern') this.kartenMalen(zeit);
  },
  verbLeiste(){
    const v = this.verb; if (!v) return;
    const liste = []; for (const k of ['schnell', 'fenster', 'geduld', 'ofen4', 'auslage', 'leben']) if (v[k]) liste.push(k);
    if (!liste.length) return;
    const bw = 54, x0 = W - 6 - liste.length * (bw + 3) + 3;
    liste.forEach((k, j) => { const bx = x0 + j * (bw + 3); rr(bx, 451, bw, 24, 12); x.fillStyle = 'rgba(43,23,10,.78)'; x.fill(); x.save(); x.translate(bx + 12, 463); x.scale(.42, .42); ch_verbIcon(k); x.restore(); text(v[k] > 1 ? CH_VERB[k].k.slice(0, 5) + ' ×' + v[k] : CH_VERB[k].k, bx + 38, 463.5, { gr: v[k] > 1 ? 7.5 : 8.5, farbe: '#FFE08A', schat: false }); });
  },
  kartenMalen(zeit){
    const a = Math.min(1, this.phaseT * 4);
    x.fillStyle = `rgba(30,15,5,${.55 * a})`; x.fillRect(0, 0, W, H);
    x.globalAlpha = a;
    text('Feierabend-Bonus', W / 2, 128, { gr: 22, farbe: '#FFE08A', schrift: 'Fraunces' });
    text('Wähle eine Verbesserung für den Rest der Runde', W / 2, 152, { gr: 11.5, farbe: '#F5E6C8', art: '700' });
    x.globalAlpha = 1;
    (this.karten || []).forEach((k, j) => {
      const r = this.kartenRect(j), d = CH_VERB[k], t = klemm((this.phaseT - j * .12) * 3, 0, 1), s = ease.feder(t);
      const gew = this.gewaehlt === k, weg = this.gewaehlt && !gew;
      x.save(); x.translate(r.x + r.w / 2, r.y + r.h / 2 + (1 - t) * 60 - (gew ? Math.min(1, this.gewaehltT * 3) * 10 : 0)); x.scale(s * (gew ? 1.06 : 1), s * (gew ? 1.06 : 1)); x.globalAlpha = weg ? .35 : t;
      bodenSchatten(0, r.h / 2 + 4, r.w * .5, 8, .5);
      rr(-r.w / 2, -r.h / 2, r.w, r.h, 16); x.fillStyle = linear(0, -r.h / 2, 0, r.h / 2, [[0, '#FFFBF2'], [1, '#FFE7B8']]); x.fill();
      x.strokeStyle = gew ? '#3DAA55' : '#E0B54A'; x.lineWidth = gew ? 4 : 2; x.stroke();
      rr(-r.w / 2 + 8, -r.h / 2 + 8, r.w - 16, 66, 11); x.fillStyle = radial(0, -r.h / 2 + 38, 4, 50, [[0, '#6A4426'], [1, '#3A2010']]); x.fill();
      const glanz = .5 + .5 * Math.sin(zeit * 3 + j); x.fillStyle = `rgba(255,210,100,${.15 + glanz * .15})`; x.beginPath(); x.arc(0, -r.h / 2 + 41, 26, 0, 7); x.fill();
      x.save(); x.translate(0, -r.h / 2 + 41); ch_verbIcon(k); x.restore();
      const teile = d.n.split(' '); if (teile.length > 1) { text(teile[0], 0, -r.h / 2 + 88, { gr: 13, farbe: F.braun, schat: false }); text(teile.slice(1).join(' '), 0, -r.h / 2 + 104, { gr: 13, farbe: F.braun, schat: false }); } else text(d.n, 0, -r.h / 2 + 96, { gr: 13, farbe: F.braun, schat: false });
      d.z.forEach((z, i) => text(z, 0, -r.h / 2 + 126 + i * 15, { gr: 10.5, farbe: '#6B5640', art: '700', schat: false }));
      if (gew) { x.fillStyle = '#3DAA55'; x.beginPath(); x.arc(r.w / 2 - 12, -r.h / 2 + 12, 11, 0, 7); x.fill(); x.strokeStyle = '#FFFFFF'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(r.w / 2 - 17, -r.h / 2 + 12); x.lineTo(r.w / 2 - 13, -r.h / 2 + 16); x.lineTo(r.w / 2 - 7, -r.h / 2 + 8); x.stroke(); }
      x.restore();
    });
  },
  ofenMalen(i, o, zeit){
    const r = this.ofenRect(i), wa = this.ofenWackel ? this.ofenWackel[i] : 0;
    const dx = wa > 0 ? Math.sin(wa * 40) * 3 * wa : 0;
    x.save(); x.translate(dx, 0);
    const fx = r.x + 14, fy = r.y + 32, fw = r.w - 28, fh = 54;
    const status = !o ? 'leer' : o.t < o.f[0] ? 'roh' : o.t <= o.f[1] ? 'gut' : 'weg';
    // Glühen im Fenster
    x.save(); rr(fx, fy, fw, fh, 7); x.clip();
    if (o) {
      const fl = .85 + Math.sin(zeit * 9 + i) * .05 + Math.sin(zeit * 23 + i * 2) * .04;
      x.fillStyle = radial(fx + fw / 2, fy + fh, 4, fw * .8, [[0, `rgba(255,190,80,${fl})`], [.5, `rgba(235,110,30,${fl * .85})`], [1, 'rgba(90,30,10,.9)']]); x.fillRect(fx, fy, fw, fh);
      x.strokeStyle = 'rgba(60,20,5,.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(fx, fy + fh - 12); x.lineTo(fx + fw, fy + fh - 12); x.stroke();
      const d = CH_SORTEN[o.s];
      const ton = o.t < o.f[0] ? Math.pow(o.t / o.f[0], 1.3) * .92 : o.t <= o.f[1] ? 1 : 1 + Math.min(1, (o.t - o.f[1]) / 2.5);
      const auf = 1 + .08 * Math.min(1, o.t / o.f[0]);
      ch_ware(o.s, fx + fw / 2, fy + fh - 14 - d.h * .25 * r.w / 108, .82 * (r.w / 108) * auf * (.6 + .4 * ease.feder(o.ein)), ton);
      x.fillStyle = `rgba(255,140,40,${.12 + Math.sin(zeit * 5) * .05})`; x.fillRect(fx, fy, fw, fh);
    } else { x.fillStyle = radial(fx + fw / 2, fy + fh, 2, fw * .7, [[0, 'rgba(120,50,20,.55)'], [1, 'rgba(20,12,8,0)']]); x.fillRect(fx, fy, fw, fh); }
    // Glas-Spiegelung
    x.fillStyle = 'rgba(255,255,255,.16)'; x.beginPath(); x.moveTo(fx + 8, fy); x.lineTo(fx + 30, fy); x.lineTo(fx + 8, fy + fh); x.lineTo(fx - 14, fy + fh); x.fill();
    x.restore();
    rr(fx, fy, fw, fh, 7); x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 2; x.stroke();
    // Statuslampe
    const lc = status === 'gut' ? '#4CD964' : status === 'weg' ? '#FF4B3A' : status === 'roh' ? '#FFB020' : '#55606B';
    x.fillStyle = radial(r.x + r.w / 2, r.y + 15, 0, 9, [[0, lc], [.5, lc], [1, 'rgba(0,0,0,0)']]); x.beginPath(); x.arc(r.x + r.w / 2, r.y + 15, status === 'leer' ? 4 : 7, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(r.x + r.w / 2 - 1.2, r.y + 13.6, 1.4, 0, 7); x.fill();
    // Skala
    const gx = r.x + 13, gy = r.y + 108, gw = r.w - 26, gh = 8;
    if (o) {
      const max = o.f[1] + 2.5, a = o.f[0] / max, b = o.f[1] / max;
      rr(gx, gy, gw, gh, 4); x.fillStyle = '#F2C66B'; x.fill();
      x.save(); rr(gx, gy, gw, gh, 4); x.clip(); x.fillStyle = '#3DBA5A'; x.fillRect(gx + gw * a, gy, gw * (b - a), gh); x.fillStyle = '#E0452E'; x.fillRect(gx + gw * b, gy, gw * (1 - b), gh); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(gx, gy, gw, 3); x.restore();
      const nx = gx + gw * Math.min(1, o.t / max);
      x.fillStyle = '#FFFFFF'; x.strokeStyle = '#2B170A'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(nx, gy + 2); x.lineTo(nx - 5, gy - 6); x.lineTo(nx + 5, gy - 6); x.closePath(); x.fill(); x.stroke(); rr(nx - 1.5, gy - 1, 3, gh + 2, 1.5); x.fill(); x.stroke();
      // Glut
      for (let k = 0; k < Math.floor((r.w - 28) / 10); k++) { const g = .5 + .5 * Math.sin(zeit * 6 + k * 1.7 + i); x.fillStyle = `rgba(255,${110 + g * 80 | 0},30,${.55 + g * .45})`; x.fillRect(r.x + 16 + k * 10, r.y + 123, 4, 5); }
    } else { text('frei', r.x + r.w / 2, gy + 4, { gr: 9.5, farbe: 'rgba(255,255,255,.55)', art: '800', schat: false }); }
    // Fertig-Ring und Schild
    if (status === 'gut') {
      const pu = .5 + .5 * Math.sin(zeit * 8);
      x.strokeStyle = `rgba(76,217,100,${.55 + pu * .45})`; x.lineWidth = 3 + pu * 2; rr(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 16); x.stroke();
      x.save(); x.translate(r.x + r.w / 2, r.y - 4 - pu * 2); rr(-30, -11, 60, 20, 10); x.fillStyle = linear(0, -11, 0, 9, [[0, '#5BD46E'], [1, '#2F9A47']]); x.fill(); text('Fertig!', 0, -1, { gr: 12, farbe: '#FFFFFF' }); x.restore();
    } else if (status === 'weg') {
      x.save(); x.translate(r.x + r.w / 2, r.y - 4); rr(-36, -11, 72, 20, 10); x.fillStyle = '#B42318'; x.fill(); text('Raus damit', 0, -1, { gr: 11, farbe: '#FFFFFF' }); x.restore();
    }
    x.restore();
  },
  hinweis(zeit){
    let t, ziel;
    const offen = this.kunden.find((k) => !k.zust && k.unter < k.n && k.ein >= 1);
    const fertigI = (this.oefen || []).findIndex((o) => o && o.t >= o.f[0] && o.t <= o.f[1]);
    const backtI = (this.oefen || []).findIndex((o) => o);
    if (fertigI >= 0) { t = 'Jetzt den Ofen antippen'; ziel = [ch_ofenX(fertigI) + ch_ofenW() / 2, CH_OFEN_Y + 60]; }
    else if (this.wahl !== null) { const fr = this.oefen.findIndex((o) => !o); t = 'Jetzt einen freien Ofen antippen'; if (fr >= 0) ziel = [ch_ofenX(fr) + ch_ofenW() / 2, CH_OFEN_Y + 60]; }
    else if (backtI >= 0 && !offen) { t = 'Warte, bis der Zeiger im Grünen ist'; }
    else if (offen) { const im = this.oefen.some((o) => o && o.s === offen.s); if (im) t = 'Warte, bis der Zeiger im Grünen ist'; else { t = `Tippe die Kiste „${CH_SORTEN[offen.s].n}“`; ziel = [ch_kisteX(offen.s) + 54, CH_KISTE_Y + 30]; } }
    else t = this.serviert || this.flug.length ? 'Super! Die Ware geht zum Kunden' : 'Gleich kommt der erste Kunde';
    x.save(); x.font = '800 13px "Plus Jakarta Sans", system-ui, sans-serif'; const bw = x.measureText(t).width + 30; x.restore();
    rr(W / 2 - bw / 2, 446, bw, 28, 14); x.fillStyle = 'rgba(43,23,10,.86)'; x.fill(); x.strokeStyle = 'rgba(255,199,44,.8)'; x.lineWidth = 1.5; x.stroke();
    text(t, W / 2, 460, { gr: 13, farbe: '#FFE08A', schat: false });
    if (ziel) { const b = Math.abs(Math.sin(zeit * 5)) * 8; x.save(); x.translate(ziel[0], ziel[1] - 34 - b); x.fillStyle = '#FFC72C'; x.strokeStyle = '#4B2A14'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 16); x.lineTo(-12, 2); x.lineTo(-5, 2); x.lineTo(-5, -12); x.lineTo(5, -12); x.lineTo(5, 2); x.lineTo(12, 2); x.closePath(); x.stroke(); x.fill(); x.restore(); }
  },
  abschlussMalen(){
    const a = Math.min(1, this.phaseT * 3), s = ease.feder(Math.min(1, this.phaseT * 2.2));
    x.fillStyle = `rgba(30,15,5,${.45 * a})`; x.fillRect(0, 0, W, H);
    x.save(); x.translate(W / 2, 250); x.scale(s, s); x.globalAlpha = a;
    bodenSchatten(0, 92, 120, 14, .5);
    rr(-125, -88, 250, 176, 22); x.fillStyle = linear(0, -88, 0, 88, [[0, '#FFFBF2'], [1, '#FFEBC4']]); x.fill(); x.strokeStyle = '#E0B54A'; x.lineWidth = 2; x.stroke();
    rr(-60, -100, 120, 26, 13); x.fillStyle = linear(0, -100, 0, -74, [[0, '#FFD95A'], [1, '#F2B400']]); x.fill(); text('Feierabend', 0, -87, { gr: 13, farbe: F.braun, schat: false });
    text(`Tag ${this.tag} geschafft`, 0, -50, { gr: 24, farbe: F.braun, schrift: 'Fraunces' });
    const zeilen = [['Kunden bedient', this.tagServiert], ['Perfekt gebacken', this.tagPerfekt], ['Tagesbonus', '+' + (this.tagBonus || 0)]];
    zeilen.forEach(([l, v], j) => { const yy = -12 + j * 28; x.strokeStyle = 'rgba(120,80,30,.2)'; x.lineWidth = 1; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(-95, yy + 13); x.lineTo(95, yy + 13); x.stroke(); x.setLineDash([]); text(l, -95, yy, { gr: 14, farbe: '#6B5640', art: '700', ausr: 'left', schat: false }); text(String(v), 95, yy, { gr: 16, farbe: j === 2 ? F.gruen : F.braun, ausr: 'right', schat: false }); });
    x.restore();
  },
  testZug(){
    if (this.gold && !this.gold.weg && this.gold.t > 1.2) return { x: this.gold.x, y: this.gold.y, warte: 250 };
    if (this.phase === 'verbessern' && this.karten && !this.gewaehlt && this.phaseT > .6) { const r = this.kartenRect(0); return { x: r.x + r.w / 2, y: r.y + r.h / 2, warte: 400 }; }
    if (this.phase !== 'spiel' || this.vorbei) return { x: 180, y: 470, warte: 400 };
    for (let i = 0; i < ch_anz; i++) { const o = this.oefen[i]; if (o && (o.t > o.f[1] || o.t >= o.f[0] + (o.f[1] - o.f[0]) * .35)) return { x: ch_ofenX(i) + ch_ofenW() / 2, y: CH_OFEN_Y + 60, warte: 200 }; }
    const brauch = [0, 0, 0];
    for (const k of this.kunden) if (!k.zust) brauch[k.s] += k.n - k.unter;
    for (const o of this.oefen) if (o) brauch[o.s]--;
    for (const a of this.ablage) brauch[a.s]--;
    const frei = this.oefen.findIndex((o) => !o);
    const s = brauch.findIndex((b) => b > 0);
    if (frei >= 0 && s >= 0) { if (this.wahl === s) return { x: ch_ofenX(frei) + ch_ofenW() / 2, y: CH_OFEN_Y + 60, warte: 250 }; return { x: ch_kisteX(s) + 54, y: CH_KISTE_Y + 40, warte: 250 }; }
    return { x: 180, y: 470, warte: 300 };
  },
};
