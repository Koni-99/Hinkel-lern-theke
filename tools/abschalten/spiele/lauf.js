// ═══ Teigi-Lauf: Teigi rennt durch Backstube, Verkaufsraum und vor die Filiale und springt über Hindernisse ═══
const LAUF_BODEN = 420;      // Fußlinie von Teigi und den Hindernissen
const LAUF_TX = 88;          // Teigis feste x-Position
const LAUF_GR = 74;          // Teigis Größe
const LAUF_EBENEN = { orte: null, breite: 0, hoehe: 0 };

// ── Orte: Backstube, Verkaufsraum, vor der Filiale (wechseln nach Strecke) ──
const LAUF_ORTE = ['backstube', 'laden', 'strasse'];
const LAUF_ORT_NAME = { backstube: 'Backstube', laden: 'Verkaufsraum', strasse: 'Vor der Filiale' };
/** Grenze i (ab 1) in px Strecke: 250 m, 550 m, dann alle 300 m */
const lauf_grenze = (i) => (i <= 0 ? 0 : (250 + (i - 1) * 300) * 32);
function lauf_ortIndex(weg){ const m = weg / 32; return m < 250 ? 0 : 1 + Math.floor((m - 250) / 300); }
const lauf_ortBei = (weg) => LAUF_ORTE[lauf_ortIndex(weg) % 3];

/** Zieht eine Ebene (Zeilen y0 bis y1) einmal auf die echte Leinwand und kopiert sie in eine eigene, höchstens doppelt aufgelöste Leinwand */
function lauf_ebene(zeichnen, y0 = 0, y1 = H){
  const s = Math.min(1, (W * 2) / c.width), ky = c.height / H;
  const l = document.createElement('canvas'); l.width = Math.round(c.width * s); l.height = Math.max(1, Math.round((y1 - y0) * ky * s));
  x.save(); x.setTransform(c.width / W, 0, 0, ky, 0, 0); x.clearRect(0, 0, W, H);
  zeichnen(); ohneSchatten(); x.restore();
  l.getContext('2d').drawImage(c, 0, y0 * ky, c.width, (y1 - y0) * ky, 0, 0, l.width, l.height);
  l.y0 = y0; l.y1 = y1;
  return l;
}
/** Eine Ebene waagrecht endlos wiederholt (Periode 360 bzw. 720 bei zwei Teilen) */
function lauf_band(teile, versatz){
  const n = teile.length, P = W * n, o = ((versatz % P) + P) % P, idx = Math.floor(o / W), lokal = o - idx * W;
  for (let k = 0; k < 2; k++) {
    const t = teile[(idx + k) % n];
    x.drawImage(t, k * W - lokal, t.y0, W + .6, t.y1 - t.y0);
  }
}

// ── Hintergrund: Wand mit Fliesen, Fenster, Regal, Tafel ──
function lauf_wand(teil){
  // Putz mit warmem Verlauf
  x.fillStyle = linear(0, 0, 0, 300, [[0, '#E9D2AA'], [.5, '#F3E3C4'], [1, '#EFD9B2']]); x.fillRect(0, 0, W, 392);
  for (let i = 0; i < 520; i++) { x.fillStyle = `rgba(${i % 2 ? '120,80,40' : '255,255,255'},${zufall(.03, .07)})`; x.fillRect(zufall(0, W), zufall(0, 270), zufall(1, 3), zufall(1, 2)); }
  x.fillStyle = linear(0, 0, 0, 120, [[0, 'rgba(90,50,20,.28)'], [1, 'rgba(90,50,20,0)']]); x.fillRect(0, 0, W, 120);
  // Deckenbalken (fern)
  holz(-10, 0, W + 20, 26, 0, '#8C5A30', '#5E3A1C');
  x.fillStyle = 'rgba(40,20,5,.25)'; x.fillRect(0, 26, W, 5);
  // Fliesenspiegel unten
  const fy = 276, fh = 108;
  x.fillStyle = '#D8C29C'; x.fillRect(0, fy, W, fh);
  for (let r = 0; r * 18 < fh; r++) {
    const ver = r % 2 ? 15 : 0;
    for (let s = -1; s * 30 < W + 30; s++) {
      const px = s * 30 + ver + 1, py = fy + r * 18 + 1;
      rr(px, py, 28, 16, 3); x.fillStyle = linear(0, py, 0, py + 16, [[0, '#FFFDF6'], [.6, '#F7EEDC'], [1, '#EADCC0']]); x.fill();
      x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(px + 3, py + 2, 12, 2);
    }
  }
  // Zierleiste mit goldbraunen Fliesen
  for (let s = 0; s * 20 < W + 20; s++) { rr(s * 20 + 1, fy - 12, 18, 11, 2); x.fillStyle = linear(0, fy - 12, 0, fy, [[0, s % 2 ? '#D9A24A' : '#B9772F'], [1, s % 2 ? '#B57A28' : '#8E5520']]); x.fill(); }
  x.fillStyle = 'rgba(40,20,5,.18)'; x.fillRect(0, fy, W, 3);
  // Sockelleiste
  holz(-4, 380, W + 8, 14, 2, '#9C6A3C', '#6A4220');
  x.fillStyle = 'rgba(40,20,5,.35)'; x.fillRect(0, 392, W, 4);

  const fenster = (fx, fy2, fw, fh2) => {
    // Lichtfleck auf der Wand
    x.fillStyle = linear(fx, fy2, fx + 60, fy2 + 260, [[0, 'rgba(255,236,190,.55)'], [1, 'rgba(255,236,190,0)']]);
    x.beginPath(); x.moveTo(fx, fy2 + fh2); x.lineTo(fx + fw, fy2 + fh2); x.lineTo(fx + fw + 70, fy2 + fh2 + 150); x.lineTo(fx + 50, fy2 + fh2 + 150); x.closePath(); x.fill();
    schatten(8, 3, 'rgba(60,30,10,.35)');
    x.beginPath(); x.moveTo(fx - 8, fy2 + fh2 + 8); x.lineTo(fx - 8, fy2 + fw / 2); x.arc(fx + fw / 2, fy2 + fw / 2, fw / 2 + 8, Math.PI, 0); x.lineTo(fx + fw + 8, fy2 + fh2 + 8); x.closePath();
    x.fillStyle = linear(0, fy2, 0, fy2 + fh2, [[0, '#8E5C32'], [1, '#6A4020']]); x.fill(); ohneSchatten();
    x.save(); x.beginPath(); x.moveTo(fx, fy2 + fh2); x.lineTo(fx, fy2 + fw / 2); x.arc(fx + fw / 2, fy2 + fw / 2, fw / 2, Math.PI, 0); x.lineTo(fx + fw, fy2 + fh2); x.closePath(); x.clip();
    x.fillStyle = linear(0, fy2, 0, fy2 + fh2, [[0, '#9CC8E8'], [.55, '#FFE3AE'], [1, '#FFC98A']]); x.fillRect(fx, fy2, fw, fh2);
    x.fillStyle = radial(fx + fw * .7, fy2 + fh2 * .78, 0, 40, [[0, 'rgba(255,250,220,.95)'], [1, 'rgba(255,230,160,0)']]); x.fillRect(fx, fy2, fw, fh2);
    // Dächer der Stadt
    x.fillStyle = '#C08A68'; x.beginPath(); x.moveTo(fx, fy2 + fh2);
    [[0, 30], [14, 30], [22, 20], [30, 30], [46, 26], [46, 16], [52, 16], [52, 26], [70, 24], [80, 32], [fw, 28]].forEach(([a, b]) => x.lineTo(fx + a, fy2 + fh2 - b));
    x.lineTo(fx + fw, fy2 + fh2); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.moveTo(fx + 8, fy2 + fh2); x.lineTo(fx + 30, fy2 + 10); x.lineTo(fx + 42, fy2 + 10); x.lineTo(fx + 20, fy2 + fh2); x.fill();
    x.restore();
    x.strokeStyle = '#6A4020'; x.lineWidth = 5; x.beginPath(); x.moveTo(fx + fw / 2, fy2); x.lineTo(fx + fw / 2, fy2 + fh2); x.moveTo(fx, fy2 + fh2 * .55); x.lineTo(fx + fw, fy2 + fh2 * .55); x.stroke();
    // Fensterbank
    holz(fx - 14, fy2 + fh2 + 4, fw + 28, 10, 3, '#B07A45', '#7C5128');
  };
  const regal = (rx, ry, rw, inhalt) => {
    // Konsolen
    x.fillStyle = '#5E3A1C'; [rx + 12, rx + rw - 18].forEach((kx) => { x.beginPath(); x.moveTo(kx, ry + 10); x.lineTo(kx + 6, ry + 10); x.lineTo(kx + 6, ry + 30); x.closePath(); x.fill(); });
    inhalt.forEach(([art, bx, bw, bh, o]) => brot(art, rx + bx, ry - bh / 2 + 2, bw, bh, o || {}));
    schatten(6, 3, 'rgba(60,30,10,.35)'); holz(rx, ry, rw, 10, 2, '#B98450', '#7C5128'); ohneSchatten();
  };
  if (teil === 0) {
    fenster(36, 74, 92, 126);
    regal(176, 140, 168, [['laib', 30, 46, 30], ['krusti', 82, 50, 26], ['laib', 134, 44, 28]]);
    regal(176, 220, 168, [['baguette', 46, 82, 16, { rot: -.05 }], ['stuten', 120, 56, 30]]);
  } else {
    regal(16, 132, 170, [['stuten', 34, 52, 28], ['broetchen', 82, 30, 20], ['broetchen', 108, 30, 20, { mohn: true }], ['krusti', 148, 40, 22]]);
    regal(16, 218, 170, [['brezel', 34, 42, 30], ['brezel', 78, 42, 30], ['laib', 136, 50, 30]]);
    // Kreidetafel
    schatten(10, 4, 'rgba(50,25,8,.4)'); rr(214, 82, 116, 92, 8); x.fillStyle = '#7C5128'; x.fill(); ohneSchatten();
    rr(221, 89, 102, 78, 4); x.fillStyle = linear(0, 89, 0, 167, [[0, '#3C463F'], [1, '#2C342F']]); x.fill();
    x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) x.fillRect(zufall(224, 318), zufall(92, 162), zufall(4, 14), 1);
    text('Heute frisch', 272, 108, { gr: 13, farbe: '#F4EFE3', art: '700', schrift: 'Fraunces', schat: false });
    x.strokeStyle = 'rgba(244,239,227,.7)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(236, 119); x.quadraticCurveTo(272, 116, 308, 119); x.stroke();
    text('Dinkelkruste', 272, 134, { gr: 11, farbe: '#FFE7A8', art: '700', schat: false });
    text('Roggenlaib', 272, 151, { gr: 11, farbe: '#F4EFE3', art: '700', schat: false });
    // Brotschieber an der Wand
    x.save(); x.translate(300, 194); x.rotate(.18);
    holz(-4, 0, 8, 70, 3, '#B07A45', '#7C5128'); x.beginPath(); x.ellipse(0, 82, 18, 22, 0, 0, 7); x.fillStyle = linear(-18, 0, 18, 0, [[0, '#9C6A3C'], [.5, '#C8955E'], [1, '#8A5A30']]); x.fill();
    x.restore();
  }
}
// ── Mittlere Ebene: Lampen mit Lichtkegel ──
function lauf_mitte(){
  [92, 272].forEach((lx) => {
    x.fillStyle = radial(lx, 150, 0, 150, [[0, 'rgba(255,232,170,.28)'], [1, 'rgba(255,232,170,0)']]); x.fillRect(lx - 150, 0, 300, 330);
    lampe(lx, 62, 130, .3);
    x.strokeStyle = '#3A2614'; x.lineWidth = 2; x.beginPath(); x.moveTo(lx, 0); x.lineTo(lx, 40); x.stroke();
    schatten(8, 4, 'rgba(40,20,5,.4)');
    x.beginPath(); x.moveTo(lx - 30, 64); x.quadraticCurveTo(lx - 26, 38, lx, 38); x.quadraticCurveTo(lx + 26, 38, lx + 30, 64); x.closePath();
    x.fillStyle = linear(lx - 30, 0, lx + 30, 0, [[0, '#8A5A12'], [.3, '#F2C14E'], [.5, '#FFE7A0'], [.75, '#D99A1E'], [1, '#7A4C0C']]); x.fill(); ohneSchatten();
    x.fillStyle = radial(lx, 64, 0, 26, [[0, 'rgba(255,250,220,1)'], [.5, 'rgba(255,230,150,.6)'], [1, 'rgba(255,220,120,0)']]); x.beginPath(); x.ellipse(lx, 64, 26, 9, 0, 0, 7); x.fill();
    x.fillStyle = '#FFF8DC'; x.beginPath(); x.ellipse(lx, 64, 14, 4, 0, 0, 7); x.fill();
    rr(lx - 5, 34, 10, 6, 2); x.fillStyle = '#6A4A1C'; x.fill();
  });
}
// ── Boden aus Holzdielen ──
function lauf_dielen(){
  const y0 = 392; let yy = y0, r = 0;
  const hoehen = [10, 13, 16, 19, 23, 28];
  while (yy < H) {
    const h = hoehen[Math.min(r, hoehen.length - 1)], ton = r % 2;
    x.fillStyle = linear(0, yy, 0, yy + h, ton ? [[0, '#C79560'], [1, '#A9743F']] : [[0, '#BD8853'], [1, '#9C6634']]); x.fillRect(0, yy, W, h);
    x.strokeStyle = 'rgba(80,45,15,.16)'; x.lineWidth = 1;
    for (let k = 0; k < h / 4; k++) { const ly = yy + 2 + k * 4; x.beginPath(); x.moveTo(0, ly); for (let px = 0; px <= W; px += 24) x.lineTo(px, ly + Math.sin((px + r * 53 + k * 31) * .045) * 1.2); x.stroke(); }
    // Fugen (versetzt)
    const laenge = 120 + r * 10;
    for (let px = (r * 47) % laenge; px < W; px += laenge) { x.fillStyle = 'rgba(60,30,10,.45)'; x.fillRect(px, yy, 2, h); x.fillStyle = 'rgba(255,230,190,.25)'; x.fillRect(px + 2, yy, 1, h); }
    x.fillStyle = 'rgba(50,25,8,.4)'; x.fillRect(0, yy + h - 1.2, W, 1.2);
    x.fillStyle = 'rgba(255,235,200,.22)'; x.fillRect(0, yy, W, 1);
    yy += h; r++;
  }
  // Mehlstaub auf dem Boden
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,250,235,${zufall(.08, .22)})`; x.beginPath(); x.ellipse(zufall(0, W), zufall(398, 470), zufall(2, 7), zufall(.8, 2), 0, 0, 7); x.fill(); }
  // Schattenkante an der Wand
  x.fillStyle = linear(0, y0, 0, y0 + 18, [[0, 'rgba(40,20,5,.35)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(0, y0, W, 18);
}
// ── Verkaufsraum ──
function lauf_ladenWand(teil){
  x.fillStyle = linear(0, 0, 0, 330, [[0, '#EFDDB6'], [.5, '#F8EBCF'], [1, '#F1DDB5']]); x.fillRect(0, 0, W, 396);
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(${i % 2 ? '150,110,60' : '255,255,255'},${zufall(.03, .06)})`; x.fillRect(zufall(0, W), zufall(30, 280), zufall(1, 3), zufall(1, 2)); }
  holz(-10, 0, W + 20, 22, 0, '#9C6A3C', '#6A4220'); x.fillStyle = 'rgba(40,20,5,.22)'; x.fillRect(0, 22, W, 6);
  if (teil === 0) {
    // Großes Brotregal hinter der Theke
    schatten(10, 4, 'rgba(60,30,10,.35)'); rr(24, 52, 312, 240, 8); x.fillStyle = '#7C5128'; x.fill(); ohneSchatten();
    rr(32, 60, 296, 226, 4); x.fillStyle = linear(0, 60, 0, 286, [[0, '#C9955E'], [1, '#A9743F']]); x.fill();
    for (let k = 1; k < 4; k++) { x.fillStyle = 'rgba(70,40,15,.35)'; x.fillRect(32 + k * 74, 60, 2, 226); }
    const reihen = [[118, [['laib', 44, 26], ['laib', 44, 26], ['krusti', 48, 24], ['laib', 44, 26], ['krusti', 48, 24], ['laib', 44, 26]]],
      [186, [['stuten', 52, 28], ['broetchen', 26, 18], ['broetchen', 26, 18], ['stuten', 52, 28], ['krusti', 50, 24], ['broetchen', 26, 18]]],
      [252, [['baguette', 66, 14], ['baguette', 66, 14], ['brezel', 34, 26], ['brezel', 34, 26], ['laib', 46, 28]]]];
    for (const [ry, inhalt] of reihen) {
      let px = 44; for (const [art, w, h] of inhalt) { brot(art, px + w / 2, ry - h / 2 + 1, w, h, { schatten: false }); px += w + 6; }
      holz(30, ry, 300, 9, 2, '#B98450', '#7C5128');
      for (let k = 0; k < 5; k++) { rr(48 + k * 60, ry + 10, 24, 10, 2); x.fillStyle = '#FFFBF2'; x.fill(); x.fillStyle = '#B03A26'; x.fillRect(52 + k * 60, ry + 14, 14, 2); }
    }
  } else {
    // Schaufenster mit Blick auf die Straße
    schatten(8, 3, 'rgba(60,30,10,.3)'); rr(20, 54, 210, 232, 6); x.fillStyle = '#5E3A1C'; x.fill(); ohneSchatten();
    x.save(); rr(28, 62, 194, 216, 3); x.clip();
    x.fillStyle = linear(0, 62, 0, 278, [[0, '#A9D2EE'], [.7, '#EAF4F8'], [1, '#F6F1E4']]); x.fillRect(28, 62, 194, 216);
    [['#E2C49C', 30, 150, 60], ['#D7A585', 92, 130, 54], ['#EADDB8', 148, 160, 70]].forEach(([f, hx, hy, hw]) => { x.fillStyle = f; x.fillRect(hx, hy, hw, 130); x.fillStyle = 'rgba(80,110,140,.35)'; for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) x.fillRect(hx + 10 + k * (hw / 2), hy + 14 + r * 34, 12, 18); });
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(40, 278); x.lineTo(110, 62); x.lineTo(140, 62); x.lineTo(70, 278); x.fill();
    x.restore();
    x.fillStyle = '#5E3A1C'; x.fillRect(122, 62, 6, 216);
    holz(24, 244, 202, 10, 2, '#B98450', '#7C5128');
    [['brezel', 60, 228, 40, 30], ['laib', 120, 230, 46, 28], ['stuten', 182, 228, 50, 28]].forEach(([a, bx, by, bw, bh]) => brot(a, bx, by, bw, bh, { schatten: false }));
    // Wanduhr
    schatten(6, 3, 'rgba(60,30,10,.35)'); x.fillStyle = '#7C5128'; x.beginPath(); x.arc(292, 120, 30, 0, 7); x.fill(); ohneSchatten();
    x.fillStyle = radial(286, 112, 2, 26, [[0, '#FFFFFF'], [1, '#EFE3CC']]); x.beginPath(); x.arc(292, 120, 25, 0, 7); x.fill();
    x.strokeStyle = '#4B2A14'; x.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.lineWidth = i % 3 ? 1 : 2; x.beginPath(); x.moveTo(292 + Math.cos(a) * 20, 120 + Math.sin(a) * 20); x.lineTo(292 + Math.cos(a) * 23, 120 + Math.sin(a) * 23); x.stroke(); }
    x.lineWidth = 2.6; x.beginPath(); x.moveTo(292, 120); x.lineTo(292, 106); x.stroke(); x.lineWidth = 1.8; x.beginPath(); x.moveTo(292, 120); x.lineTo(304, 126); x.stroke();
    // Preistafel
    rr(256, 166, 76, 92, 6); x.fillStyle = '#7C5128'; x.fill(); rr(261, 171, 66, 82, 3); x.fillStyle = '#33403A'; x.fill();
    text('Heute', 294, 184, { gr: 11, farbe: '#F4EFE3', art: '700', schrift: 'Fraunces', schat: false });
    x.fillStyle = 'rgba(244,239,227,.65)'; for (let r = 0; r < 4; r++) { x.fillRect(268, 198 + r * 13, 30, 2); x.fillRect(306, 198 + r * 13, 12, 2); }
  }
  // Theke mit gläserner Auslage
  const ay = 284;
  if (teil === 0) {
    // Kasse auf der Theke
    schatten(6, 3, 'rgba(40,20,5,.35)'); rr(286, 296, 54, 30, 5); x.fillStyle = linear(0, 296, 0, 326, [[0, '#5A5F66'], [1, '#30343A']]); x.fill(); ohneSchatten();
    rr(292, 300, 26, 10, 2); x.fillStyle = '#9FD9A8'; x.fill(); text('4,80', 305, 305.5, { gr: 7.5, farbe: '#1E4D2A', schat: false });
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { rr(292 + k * 9, 313 + r * 6, 7, 4, 1); x.fillStyle = '#D9DDE2'; x.fill(); }
    rr(310, 278, 22, 20, 3); x.fillStyle = '#3A3F45'; x.fill(); rr(313, 281, 16, 12, 2); x.fillStyle = '#7FB6E0'; x.fill();
  }
  const glasBis = teil === 0 ? 270 : W;
  x.fillStyle = linear(0, ay, 0, 326, [[0, 'rgba(230,245,250,.55)'], [1, 'rgba(200,225,235,.35)']]); x.fillRect(0, ay, glasBis, 42);
  const auslage = teil === 0 ? [['brezel', 26, 30, 24], ['brezel', 62, 30, 24], ['broetchen', 104, 26, 18], ['broetchen', 132, 26, 18], ['krusti', 176, 40, 20], ['broetchen', 222, 26, 18], ['broetchen', 248, 24, 17]]
    : [['krusti', 30, 40, 20], ['brezel', 78, 30, 24], ['brezel', 112, 30, 24], ['broetchen', 156, 26, 18], ['broetchen', 184, 26, 18], ['stuten', 236, 44, 22], ['broetchen', 290, 26, 18], ['brezel', 330, 30, 24]];
  auslage.forEach(([a, bx, bw, bh]) => brot(a, bx, 322 - bh / 2, bw, bh, { schatten: false }));
  x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(0, ay, glasBis, 2); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, ay + 4, glasBis, 6);
  x.fillStyle = linear(0, 324, 0, 332, [[0, '#F6F0E6'], [1, '#CFC4B4']]); x.fillRect(0, 324, W, 8);
  holz(-2, 332, W + 4, 52, 0, '#B98450', '#7C5128');
  for (let k = 0; k < 4; k++) { rr(10 + k * 90, 340, 80, 36, 4); x.strokeStyle = 'rgba(50,25,8,.35)'; x.lineWidth = 1.6; x.stroke(); x.strokeStyle = 'rgba(255,230,190,.2)'; x.lineWidth = 1; rr(11 + k * 90, 341, 80, 36, 4); x.stroke(); }
  x.fillStyle = '#4B2A14'; x.fillRect(0, 384, W, 10);
  x.fillStyle = 'rgba(40,20,5,.35)'; x.fillRect(0, 392, W, 4);
}
function lauf_ladenBoden(){
  const y0 = 392; let yy = y0, r = 0; const hoehen = [10, 13, 16, 19, 23, 28];
  while (yy < H) {
    const h = hoehen[Math.min(r, hoehen.length - 1)], bw = 26 + r * 6;
    for (let k = -1, px = -(r % 2) * bw / 2; px < W; px += bw, k++) {
      const hell = (k + r) % 2 === 0;
      x.fillStyle = linear(0, yy, 0, yy + h, hell ? [[0, '#F7EEDC'], [1, '#E6D6B8']] : [[0, '#C98458'], [1, '#A9653C']]); x.fillRect(px, yy, bw, h);
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(px + 2, yy + 1, bw - 4, 1.2);
    }
    x.fillStyle = 'rgba(90,60,35,.35)'; x.fillRect(0, yy + h - 1, W, 1);
    yy += h; r++;
  }
  x.fillStyle = linear(0, y0, 0, y0 + 18, [[0, 'rgba(40,20,5,.35)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(0, y0, W, 18);
}
// ── Vor der Filiale ──
function lauf_strasseWand(teil){
  x.fillStyle = linear(0, 0, 0, 300, [[0, '#7FB8E6'], [.6, '#BFE0F4'], [1, '#EAF4F8']]); x.fillRect(0, 0, W, 396);
  const wolke = (wx, wy, s) => { x.fillStyle = 'rgba(255,255,255,.85)'; [[0, 0, 26], [22, -8, 20], [40, 2, 18], [-20, 4, 16]].forEach(([a, b, r]) => { x.beginPath(); x.arc(wx + a * s, wy + b * s, r * s, 0, 7); x.fill(); }); };
  if (teil === 0) { wolke(60, 40, .9); wolke(250, 66, .7); } else { wolke(150, 34, 1); wolke(320, 74, .6); }
  const haus = (hx, hw, top, farbe, dach) => {
    x.fillStyle = linear(hx, 0, hx + hw, 0, [[0, farbe], [1, 'rgba(0,0,0,0)']]);
    x.fillStyle = farbe; x.fillRect(hx, top, hw, 392 - top);
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(hx, top, 6, 392 - top); x.fillStyle = 'rgba(60,30,10,.12)'; x.fillRect(hx + hw - 8, top, 8, 392 - top);
    if (dach === 'spitz') { x.fillStyle = '#9A4A32'; x.beginPath(); x.moveTo(hx - 6, top + 2); x.lineTo(hx + hw / 2, top - 46); x.lineTo(hx + hw + 6, top + 2); x.closePath(); x.fill(); x.fillStyle = 'rgba(255,255,255,.15)'; x.beginPath(); x.moveTo(hx - 6, top + 2); x.lineTo(hx + hw / 2, top - 46); x.lineTo(hx + hw / 2, top - 38); x.lineTo(hx + 4, top + 2); x.fill(); }
    else { x.fillStyle = '#E8DCC4'; x.fillRect(hx - 4, top - 8, hw + 8, 10); x.fillStyle = 'rgba(60,30,10,.2)'; x.fillRect(hx - 4, top + 1, hw + 8, 2); }
  };
  const fenster = (fx, fy, fw, fh) => {
    rr(fx - 3, fy - 3, fw + 6, fh + 6, 3); x.fillStyle = '#FFFFFF'; x.fill();
    x.fillStyle = linear(0, fy, 0, fy + fh, [[0, '#6F96B8'], [1, '#B9D3E6']]); x.fillRect(fx, fy, fw, fh);
    x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.moveTo(fx + 3, fy + fh); x.lineTo(fx + fw * .5, fy); x.lineTo(fx + fw * .7, fy); x.lineTo(fx + fw * .2, fy + fh); x.fill();
    x.fillStyle = '#FFFFFF'; x.fillRect(fx + fw / 2 - 1, fy, 2, fh); x.fillRect(fx, fy + fh * .45, fw, 2);
  };
  const blumenkasten = (fx, fy, fw) => { rr(fx - 2, fy, fw + 4, 7, 2); x.fillStyle = '#8A4A2A'; x.fill(); for (let k = 0; k < fw / 6; k++) { x.fillStyle = k % 2 ? '#3F8F4E' : '#E0574A'; x.beginPath(); x.arc(fx + 3 + k * 6, fy - 2, 3.2, 0, 7); x.fill(); } };
  if (teil === 0) {
    // Die Filiale mit Markise
    haus(14, 220, 96, '#F3E3C1', 'flach');
    for (let k = 0; k < 3; k++) { fenster(36 + k * 66, 118, 40, 54); blumenkasten(36 + k * 66, 176, 40); }
    rr(40, 196, 168, 26, 5); x.fillStyle = '#4B2A14'; x.fill(); text('Bäckerei', 124, 209.5, { gr: 15, farbe: '#FFC72C', art: '800', schrift: 'Fraunces', schat: false });
    // Markise: gelb und weiß gestreift, mit Bogenkante
    const my = 230, mh = 34;
    x.save(); x.beginPath(); x.moveTo(20, my); x.lineTo(228, my); x.lineTo(236, my + mh); for (let k = 0; k <= 12; k++) x.quadraticCurveTo(236 - k * 18.6 + 9.3, my + mh + 9, 236 - (k + 1) * 18.6 + 18.6, my + mh); x.lineTo(12, my + mh); x.closePath(); x.clip();
    for (let k = 0; k < 14; k++) { x.fillStyle = k % 2 ? '#FFFFFF' : '#FFC72C'; x.fillRect(12 + k * 18.6, my, 18.6, mh + 10); }
    x.fillStyle = linear(0, my, 0, my + mh + 10, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(120,70,0,.25)']]); x.fillRect(12, my, 230, mh + 10);
    x.restore();
    x.fillStyle = 'rgba(40,20,5,.18)'; x.fillRect(22, my + mh + 6, 210, 8);
    // Schaufenster und Tür
    rr(30, 280, 130, 104, 3); x.fillStyle = '#4B2A14'; x.fill();
    x.fillStyle = linear(0, 284, 0, 380, [[0, '#FFE9B8'], [1, '#F2C98A']]); x.fillRect(34, 284, 122, 96);
    [['brezel', 60, 352, 34, 26], ['laib', 104, 354, 42, 26], ['brezel', 140, 352, 30, 24], ['krusti', 80, 322, 40, 20], ['stuten', 128, 320, 40, 22]].forEach(([a, bx, by, bw, bh]) => brot(a, bx, by, bw, bh, { schatten: false }));
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(40, 380); x.lineTo(84, 284); x.lineTo(100, 284); x.lineTo(56, 380); x.fill();
    rr(172, 278, 50, 108, 3); x.fillStyle = '#4B2A14'; x.fill(); x.fillStyle = linear(0, 282, 0, 382, [[0, '#BFD9EA'], [1, '#E8F0F2']]); x.fillRect(177, 284, 40, 98);
    x.fillStyle = '#C98A00'; x.fillRect(208, 330, 4, 16);
    // Nachbarhaus
    haus(246, 120, 70, '#D9A585', 'spitz'); fenster(262, 96, 34, 46); fenster(312, 96, 34, 46); fenster(262, 168, 34, 46); fenster(312, 168, 34, 46); fenster(262, 250, 34, 46); fenster(312, 250, 34, 46);
    rr(286, 318, 36, 66, 3); x.fillStyle = '#6A4022'; x.fill();
  } else {
    haus(0, 120, 60, '#EADDB8', 'spitz'); for (let r = 0; r < 3; r++) { fenster(16, 92 + r * 80, 34, 48); fenster(70, 92 + r * 80, 34, 48); } blumenkasten(16, 146, 34); blumenkasten(70, 146, 34);
    haus(126, 116, 100, '#C9B79A', 'flach'); for (let r = 0; r < 3; r++) { fenster(142, 120 + r * 74, 30, 44); fenster(196, 120 + r * 74, 30, 44); }
    rr(166, 330, 34, 56, 3); x.fillStyle = '#4A5A3A'; x.fill();
    haus(248, 112, 80, '#E9C9A0', 'spitz'); for (let r = 0; r < 3; r++) { fenster(262, 104 + r * 80, 32, 48); fenster(310, 104 + r * 80, 32, 48); } blumenkasten(262, 158, 32);
  }
  // Sockel der Häuser
  x.fillStyle = linear(0, 384, 0, 394, [[0, '#9A8E80'], [1, '#6E645A']]); x.fillRect(0, 384, W, 10);
  x.fillStyle = 'rgba(40,20,5,.25)'; x.fillRect(0, 392, W, 4);
}
function lauf_strasseMitte(){
  [60, 240].forEach((lx) => {
    x.fillStyle = linear(lx - 4, 0, lx + 4, 0, [[0, '#2A2D30'], [.5, '#5A6066'], [1, '#2A2D30']]); x.fillRect(lx - 3.5, 120, 7, 272);
    rr(lx - 8, 380, 16, 12, 3); x.fillStyle = '#2E3236'; x.fill();
    x.strokeStyle = '#2E3236'; x.lineWidth = 3; x.beginPath(); x.moveTo(lx, 128); x.quadraticCurveTo(lx + 4, 108, lx + 22, 110); x.stroke();
    x.fillStyle = '#2E3236'; x.beginPath(); x.moveTo(lx + 12, 112); x.lineTo(lx + 32, 112); x.lineTo(lx + 28, 136); x.lineTo(lx + 16, 136); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,240,190,.9)'; x.fillRect(lx + 17, 116, 10, 16);
    x.fillStyle = '#2E3236'; x.beginPath(); x.moveTo(lx + 10, 112); x.lineTo(lx + 22, 102); x.lineTo(lx + 34, 112); x.closePath(); x.fill();
    // kleiner Baum im Kübel daneben
    const bx = lx + 100;
    rr(bx - 14, 360, 28, 32, 4); x.fillStyle = linear(0, 360, 0, 392, [[0, '#B5653A'], [1, '#7E3E1E']]); x.fill();
    x.fillStyle = '#6A4022'; x.fillRect(bx - 2, 300, 4, 62);
    [[0, -8, 30], [-18, 4, 22], [18, 4, 22], [0, 16, 22]].forEach(([a, b, r], i) => { x.fillStyle = i % 2 ? '#4E9A52' : '#3F8445'; x.beginPath(); x.arc(bx + a, 296 + b, r, 0, 7); x.fill(); });
    x.fillStyle = 'rgba(255,255,255,.15)'; x.beginPath(); x.arc(bx - 8, 282, 12, 0, 7); x.fill();
  });
}
function lauf_strasseBoden(){
  const y0 = 392; let yy = y0, r = 0; const hoehen = [10, 12, 14, 16, 18];
  while (yy < 452) {
    const h = Math.min(hoehen[Math.min(r, hoehen.length - 1)], 452 - yy), bw = 30 + r * 7;
    for (let k = 0, px = -(r % 2) * bw / 2; px < W; px += bw, k++) {
      x.fillStyle = linear(0, yy, 0, yy + h, (k * 7 + r * 3) % 5 === 0 ? [[0, '#D8CFC2'], [1, '#BEB3A4']] : [[0, '#CEC4B6'], [1, '#B2A796']]); rr(px + .8, yy + .6, bw - 1.6, h - 1.2, 2); x.fill();
      x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(px + 2, yy + 1, bw - 4, 1);
    }
    yy += h; r++;
  }
  // Bordstein und Straße
  x.fillStyle = linear(0, 452, 0, 462, [[0, '#E4DED4'], [1, '#A49A8C']]); x.fillRect(0, 452, W, 10);
  x.fillStyle = linear(0, 462, 0, H, [[0, '#4C4D50'], [1, '#3A3B3E']]); x.fillRect(0, 462, W, 18);
  for (let k = 0; k < 3; k++) { x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(20 + k * 120, 472, 60, 3); }
  x.fillStyle = linear(0, y0, 0, y0 + 12, [[0, 'rgba(40,20,5,.25)'], [1, 'rgba(40,20,5,0)']]); x.fillRect(0, y0, W, 12);
}
function lauf_ladenMitte(){
  [92, 272].forEach((lx) => {
    x.fillStyle = radial(lx, 140, 0, 140, [[0, 'rgba(255,236,180,.24)'], [1, 'rgba(255,236,180,0)']]); x.fillRect(lx - 140, 0, 280, 300);
    x.strokeStyle = '#3A2614'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(lx, 22); x.lineTo(lx, 52); x.stroke();
    x.fillStyle = radial(lx - 5, 60, 2, 18, [[0, '#FFFFFF'], [.6, '#FFF3D0'], [1, '#F0D9A0']]); x.beginPath(); x.arc(lx, 66, 15, 0, 7); x.fill();
    x.fillStyle = radial(lx, 66, 0, 40, [[0, 'rgba(255,240,200,.5)'], [1, 'rgba(255,240,200,0)']]); x.beginPath(); x.arc(lx, 66, 40, 0, 7); x.fill();
    rr(lx - 6, 50, 12, 6, 2); x.fillStyle = '#C98A00'; x.fill();
  });
}
function lauf_backen(){
  const e = LAUF_EBENEN;
  e.orte = {
    backstube: { wand: [lauf_ebene(() => lauf_wand(0), 0, 396), lauf_ebene(() => lauf_wand(1), 0, 396)], mitte: lauf_ebene(lauf_mitte, 0, 392), boden: lauf_ebene(lauf_dielen, 392, H) },
    laden: { wand: [lauf_ebene(() => lauf_ladenWand(0), 0, 396), lauf_ebene(() => lauf_ladenWand(1), 0, 396)], mitte: lauf_ebene(lauf_ladenMitte, 0, 392), boden: lauf_ebene(lauf_ladenBoden, 392, H) },
    strasse: { wand: [lauf_ebene(() => lauf_strasseWand(0), 0, 396), lauf_ebene(() => lauf_strasseWand(1), 0, 396)], mitte: lauf_ebene(lauf_strasseMitte, 0, 392), boden: lauf_ebene(lauf_strasseBoden, 392, H) },
  };
  e.breite = c.width; e.hoehe = c.height;
}
/** Hintergrund eines Ortes, beschnitten auf x0 bis x1 */
function lauf_ortMalen(ort, weg, x0, x1){
  if (x1 <= x0) return;
  const o = LAUF_EBENEN.orte[ort];
  x.save(); x.beginPath(); x.rect(x0, 0, x1 - x0, H); x.clip();
  lauf_band(o.wand, weg * (ort === 'strasse' ? .15 : .22));
  lauf_band([o.mitte], weg * .5);
  lauf_band([o.boden], weg);
  x.restore();
}
/** Torbogen zwischen zwei Orten, mit Schild des neuen Ortes */
function lauf_portal(px, ziel){
  const farbe = ziel === 'laden' ? ['#B98450', '#6A4220'] : ziel === 'strasse' ? ['#3F6E54', '#24432F'] : ['#C2643A', '#7E3218'];
  const pf = (bx) => { x.fillStyle = linear(bx, 0, bx + 22, 0, [[0, farbe[1]], [.4, farbe[0]], [1, farbe[1]]]); x.fillRect(bx, 176, 22, 216); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(bx + 4, 176, 2, 216); };
  bodenSchatten(px, 394, 80, 6, .35);
  pf(px - 66); pf(px + 44);
  x.lineWidth = 22; x.strokeStyle = linear(px - 66, 0, px + 66, 0, [[0, farbe[1]], [.5, farbe[0]], [1, farbe[1]]]);
  x.beginPath(); x.arc(px, 182, 55, Math.PI, 0); x.stroke();
  if (ziel === 'backstube') { x.strokeStyle = 'rgba(255,220,190,.35)'; x.lineWidth = 1; for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; x.beginPath(); x.moveTo(px + Math.cos(a) * 44, 182 + Math.sin(a) * 44); x.lineTo(px + Math.cos(a) * 66, 182 + Math.sin(a) * 66); x.stroke(); } }
  // Schild
  const name = LAUF_ORT_NAME[ziel];
  x.font = '800 13px "Plus Jakarta Sans", system-ui, sans-serif'; const w = x.measureText(name).width + 26;
  x.strokeStyle = '#3A2010'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px - w / 3, 128); x.lineTo(px - w / 3, 140); x.moveTo(px + w / 3, 128); x.lineTo(px + w / 3, 140); x.stroke();
  rr(px - w / 2, 140, w, 26, 8); x.fillStyle = linear(0, 140, 0, 166, [[0, '#FFE070'], [1, '#E8A500']]); x.fill();
  x.strokeStyle = 'rgba(120,70,0,.6)'; x.lineWidth = 1.2; x.stroke();
  text(name, px, 153.5, { gr: 13, farbe: F.braun });
  // Fußmatte
  rr(px - 40, 404, 80, 10, 4); x.fillStyle = 'rgba(90,60,35,.75)'; x.fill();
}
// ── Hindernisse im Verkaufsraum und auf der Straße ──
function lauf_kundenkorb(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 6, .4);
  brot('baguette', px + w * .6, by - h - 4, 54, 12, { rot: -.8, schatten: false });
  x.strokeStyle = '#2B2B2E'; x.lineWidth = 3.4; x.beginPath(); x.moveTo(px + 6, by - h + 4); x.quadraticCurveTo(px + w / 2, by - h - 26, px + w - 6, by - h + 4); x.stroke();
  x.beginPath(); x.moveTo(px, by - h); x.lineTo(px + w, by - h); x.lineTo(px + w - 6, by); x.lineTo(px + 6, by); x.closePath();
  x.fillStyle = linear(0, by - h, 0, by, [[0, '#E8574A'], [1, '#A82A1E']]); x.fill();
  x.fillStyle = 'rgba(90,10,5,.45)'; for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { rr(px + 8 + k * (w - 16) / 5, by - h + 8 + r * 10, (w - 16) / 5 - 4, 5, 2); x.fill(); }
  x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(px + 2, by - h, w - 4, 3);
}
function lauf_brotkiste(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 6, .42);
  brot('laib', px + w * .32, by - h - 8, 30, 20, { schatten: false }); brot('krusti', px + w * .68, by - h - 7, 30, 17, { schatten: false });
  holz(px, by - h, w, h, 3, '#C9955E', '#8E5A2C');
  x.fillStyle = 'rgba(50,25,8,.4)'; for (let k = 1; k < 3; k++) x.fillRect(px, by - h + k * h / 3, w, 2);
  rr(px + w / 2 - 9, by - h + 6, 18, 6, 3); x.fillStyle = 'rgba(40,20,5,.6)'; x.fill();
}
function lauf_aufsteller(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 6, .4);
  x.fillStyle = '#6A4220'; x.beginPath(); x.moveTo(px + w / 2, by - h); x.lineTo(px + w - 2, by); x.lineTo(px + w - 8, by); x.lineTo(px + w / 2, by - h + 8); x.fill();
  x.beginPath(); x.moveTo(px + w / 2 - 2, by - h); x.lineTo(px + w / 2 + 2, by - h); x.lineTo(px + 6, by); x.lineTo(px, by); x.closePath(); x.fillStyle = '#8E5A2C'; x.fill();
  x.save(); x.translate(px + w * .32, by - h * .5); x.rotate(-.18);
  rr(-w * .34, -h * .42, w * .68, h * .7, 4); x.fillStyle = '#7C5128'; x.fill(); rr(-w * .34 + 3, -h * .42 + 3, w * .68 - 6, h * .7 - 6, 2); x.fillStyle = '#33403A'; x.fill();
  text('Frisch', 0, -h * .22, { gr: 9.5, farbe: '#FFE7A8', art: '800', schat: false }); text('Brezeln', 0, -h * .06, { gr: 8, farbe: '#F4EFE3', art: '700', schat: false });
  x.strokeStyle = 'rgba(244,239,227,.6)'; x.lineWidth = 1; x.beginPath(); x.moveTo(-10, h * .07); x.lineTo(10, h * .07); x.stroke();
  x.restore();
}
function lauf_pfuetze(px, by, w, t){
  x.fillStyle = radial(px + w / 2, by - 3, 4, w * .55, [[0, 'rgba(150,190,220,.85)'], [.8, 'rgba(110,150,185,.8)'], [1, 'rgba(90,120,150,.0)']]);
  x.beginPath(); x.ellipse(px + w / 2, by - 3, w / 2, 7, 0, 0, 7); x.fill();
  x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.ellipse(px + w * .35, by - 5, w * .14, 1.5, 0, 0, 7); x.fill();
  const r = (t * 1.2) % 1; x.strokeStyle = `rgba(255,255,255,${.5 * (1 - r)})`; x.lineWidth = 1; x.beginPath(); x.ellipse(px + w * .62, by - 3, 4 + r * 14, 1 + r * 3, 0, 0, 7); x.stroke();
}
function lauf_kuebel(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 6, .42);
  const kh = h * .5;
  [[0, -h + 14, 20], [-13, -h + 24, 15], [13, -h + 24, 15], [-6, -h + 32, 13], [8, -h + 34, 13]].forEach(([a, b, r], i) => { x.fillStyle = i % 2 ? '#4E9A52' : '#3B8040'; x.beginPath(); x.arc(px + w / 2 + a, by + b, r, 0, 7); x.fill(); });
  [[-8, -h + 12], [10, -h + 18], [0, -h + 28], [-14, -h + 30]].forEach(([a, b]) => { x.fillStyle = '#FFC72C'; x.beginPath(); x.arc(px + w / 2 + a, by + b, 3, 0, 7); x.fill(); x.fillStyle = '#E0574A'; x.beginPath(); x.arc(px + w / 2 + a, by + b, 1.3, 0, 7); x.fill(); });
  x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(px + w / 2 - 6, by - h + 8, 9, 0, 7); x.fill();
  x.beginPath(); x.moveTo(px, by - kh); x.lineTo(px + w, by - kh); x.lineTo(px + w - 6, by); x.lineTo(px + 6, by); x.closePath();
  x.fillStyle = linear(px, 0, px + w, 0, [[0, '#D27A48'], [.4, '#E8925E'], [1, '#93451F']]); x.fill();
  rr(px - 3, by - kh - 4, w + 6, 7, 3); x.fillStyle = '#B5602F'; x.fill();
}
function lauf_fahrrad(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 6, .35);
  const r = 15, a = px + r + 1, b = px + w - r - 1, ay = by - r;
  [a, b].forEach((rx) => { x.strokeStyle = '#2B2B2E'; x.lineWidth = 3.4; x.beginPath(); x.arc(rx, ay, r, 0, 7); x.stroke(); x.strokeStyle = 'rgba(160,165,170,.8)'; x.lineWidth = .8; for (let i = 0; i < 6; i++) { const q = i * Math.PI / 3; x.beginPath(); x.moveTo(rx, ay); x.lineTo(rx + Math.cos(q) * r, ay + Math.sin(q) * r); x.stroke(); } });
  const sattel = [px + w * .42, by - h + 14], lenker = [px + w * .74, by - h + 6], tret = [px + w * .48, ay];
  x.strokeStyle = '#2F7A6A'; x.lineWidth = 3.6; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(a, ay); x.lineTo(tret[0], tret[1]); x.lineTo(lenker[0] - 4, lenker[1] + 10); x.lineTo(b, ay); x.moveTo(a, ay); x.lineTo(sattel[0], sattel[1] + 4); x.lineTo(tret[0], tret[1]); x.moveTo(sattel[0], sattel[1] + 4); x.lineTo(lenker[0] - 4, lenker[1] + 10); x.stroke();
  x.strokeStyle = '#2B2B2E'; x.lineWidth = 3; x.beginPath(); x.moveTo(lenker[0] - 4, lenker[1] + 10); x.lineTo(lenker[0], lenker[1]); x.lineTo(lenker[0] + 8, lenker[1] - 2); x.stroke();
  rr(sattel[0] - 9, sattel[1] - 1, 18, 5, 2.5); x.fillStyle = '#2B2B2E'; x.fill();
  // Korb vorne mit Baguette
  rr(lenker[0] + 2, lenker[1] + 2, 16, 12, 3); x.fillStyle = '#B07A45'; x.fill();
  brot('baguette', lenker[0] + 12, lenker[1] - 4, 30, 8, { rot: -1.1, schatten: false });
}
function lauf_kisten(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 6, .42);
  const n = 3, kh = h / n;
  for (let i = 0; i < n; i++) {
    const ky = by - (i + 1) * kh, dx = i % 2 ? 2 : -1;
    rr(px + dx, ky, w, kh - 1, 4); x.fillStyle = linear(0, ky, 0, ky + kh, [[0, '#FFD95A'], [1, '#E0A500']]); x.fill();
    x.strokeStyle = 'rgba(120,80,0,.5)'; x.lineWidth = 1; x.stroke();
    rr(px + dx + w / 2 - 8, ky + 5, 16, 5, 2.5); x.fillStyle = 'rgba(80,50,0,.55)'; x.fill();
    x.fillStyle = 'rgba(120,80,0,.25)'; for (let k = 0; k < 4; k++) x.fillRect(px + dx + 6 + k * (w - 12) / 4, ky + 14, (w - 12) / 4 - 4, kh - 19);
  }
}
/** Bonus-Tafel (Verkaufsraum und Straße) statt Ofen */
function lauf_bonusTafel(px, by, t){
  const sx = px + 50, sy = by - 150 + Math.sin(t * 2.2) * 2;
  bodenSchatten(sx, by, 50, 7, .4);
  x.strokeStyle = '#6A4220'; x.lineWidth = 5; x.lineCap = 'round';
  x.beginPath(); x.moveTo(sx - 30, by); x.lineTo(sx - 6, sy + 30); x.moveTo(sx + 30, by); x.lineTo(sx + 6, sy + 30); x.stroke();
  schatten(8, 4, 'rgba(40,20,5,.4)'); rr(sx - 46, sy + 20, 92, 70, 6); x.fillStyle = '#7C5128'; x.fill(); ohneSchatten();
  rr(sx - 41, sy + 25, 82, 60, 3); x.fillStyle = '#33403A'; x.fill();
  text('Bonus', sx, sy + 44, { gr: 14, farbe: '#FFE7A8', art: '800', schat: false });
  text('Frage', sx, sy + 64, { gr: 14, farbe: '#F4EFE3', art: '800', schat: false });
  x.fillStyle = F.gold; x.beginPath(); x.arc(sx, sy + 4, 13, 0, 7); x.fill(); x.strokeStyle = '#8C5A00'; x.lineWidth = 1.5; x.stroke();
  text('?', sx, sy + 5, { gr: 16, farbe: F.braun, art: '800', schat: false });
}

// ── Hindernisse und Sammelsachen ──
function lauf_sack(px, by, w, h, wackel){
  bodenSchatten(px + w / 2, by, w * .62, 7, .4);
  x.save(); x.translate(px + w / 2, by); x.scale(1 + wackel * .08, 1 - wackel * .08);
  const hw = w / 2;
  x.beginPath(); x.moveTo(-hw * .55, -h); x.quadraticCurveTo(-hw * 1.05, -h * .7, -hw, -h * .2); x.quadraticCurveTo(-hw, 0, -hw * .6, 0); x.lineTo(hw * .6, 0); x.quadraticCurveTo(hw, 0, hw, -h * .2); x.quadraticCurveTo(hw * 1.05, -h * .7, hw * .55, -h); x.closePath();
  x.fillStyle = radial(-hw * .2, -h * .55, 2, h * .9, [[0, '#FFF8E8'], [.6, '#EAD9B4'], [1, '#C8AE80']], -hw * .45, -h * .8); x.fill();
  x.save(); x.clip();
  x.strokeStyle = 'rgba(140,105,60,.16)'; x.lineWidth = 1; for (let i = -h; i < 0; i += 3) { x.beginPath(); x.moveTo(-hw, i); x.lineTo(hw, i); x.stroke(); }
  x.fillStyle = 'rgba(70,40,10,.18)'; x.fillRect(hw * .55, -h, hw, h);
  // Aufdruck
  rr(-hw * .62, -h * .66, hw * 1.24, h * .38, 4); x.fillStyle = 'rgba(176,60,40,.12)'; x.fill();
  text('MEHL', 0, -h * .48, { gr: Math.round(w * .24), farbe: '#A43A26', art: '800', schat: false });
  x.strokeStyle = '#A43A26'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(-hw * .5, -h * .33); x.lineTo(hw * .5, -h * .33); x.stroke();
  text('Type 550', 0, -h * .22, { gr: 7, farbe: '#7A5A30', art: '700', schat: false });
  x.restore();
  // Abgebundener Hals
  x.fillStyle = linear(-hw * .5, 0, hw * .5, 0, [[0, '#D9C49A'], [.5, '#FFF4DC'], [1, '#C8AE80']]);
  x.beginPath(); x.moveTo(-hw * .55, -h); x.lineTo(-hw * .42, -h - 9); x.lineTo(-hw * .1, -h - 5); x.lineTo(hw * .12, -h - 10); x.lineTo(hw * .45, -h - 6); x.lineTo(hw * .55, -h); x.closePath(); x.fill();
  x.strokeStyle = '#8A5A30'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-hw * .5, -h + 1); x.quadraticCurveTo(0, -h + 4, hw * .5, -h + 1); x.stroke();
  // Mehl oben drauf
  x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.ellipse(-hw * .2, -h * .9, hw * .3, 2.5, -.2, 0, 7); x.fill();
  x.restore();
}
function lauf_wagen(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 7, .45);
  const pfosten = (kx) => { x.fillStyle = linear(kx, 0, kx + 5, 0, [[0, '#6E7984'], [.4, '#E4EAF0'], [1, '#7D8894']]); rr(kx, by - h, 5, h - 6, 2); x.fill(); };
  pfosten(px + 2); pfosten(px + w - 7);
  for (let i = 0; i < 3; i++) {
    const ty = by - h + 8 + i * ((h - 20) / 3);
    if (i < 2) { const n = 3; for (let k = 0; k < n; k++) brot('broetchen', px + 15 + k * ((w - 30) / (n - 1)), ty - 6, 18, 13, { schatten: false, mohn: i === 1 }); }
    else brot('baguette', px + w / 2, ty - 5, w - 22, 11, { schatten: false });
    x.fillStyle = linear(0, ty, 0, ty + 5, [[0, '#F0F4F8'], [1, '#8C98A4']]); rr(px, ty, w, 5, 2); x.fill();
  }
  x.fillStyle = linear(0, by - 12, 0, by - 6, [[0, '#B8C2CC'], [1, '#6E7984']]); rr(px - 1, by - 12, w + 2, 6, 2); x.fill();
  [px + 9, px + w - 9].forEach((rx) => { x.fillStyle = '#2E2A28'; x.beginPath(); x.arc(rx, by - 4, 5.5, 0, 7); x.fill(); x.fillStyle = '#B8C2CC'; x.beginPath(); x.arc(rx, by - 4, 2, 0, 7); x.fill(); });
  x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(px + 3, by - h + 2, 1.5, h - 12);
}
function lauf_korb(px, by, w, h){
  bodenSchatten(px + w / 2, by, w * .62, 6, .4);
  // Baguettes und Brötchen schauen heraus
  brot('baguette', px + w * .36, by - h - 4, 66, 14, { rot: -.7, schatten: false });
  brot('baguette', px + w * .64, by - h - 2, 60, 13, { rot: .6, schatten: false });
  brot('broetchen', px + w * .5, by - h + 3, 26, 18, { schatten: false });
  const kb = by - h + 6;
  x.beginPath(); x.moveTo(px, kb); x.lineTo(px + w, kb); x.lineTo(px + w - 7, by); x.lineTo(px + 7, by); x.closePath();
  x.fillStyle = linear(0, kb, 0, by, [[0, '#D9A35C'], [1, '#8E5A26']]); x.fill();
  x.save(); x.clip();
  for (let r = 0; r < 4; r++) for (let k = 0; k < w / 10 + 1; k++) {
    const qx = px + k * 10 + (r % 2) * 5, qy = kb + 4 + r * 8;
    x.fillStyle = 'rgba(255,225,160,.35)'; x.beginPath(); x.ellipse(qx, qy, 4.5, 2.6, 0, 0, 7); x.fill();
    x.strokeStyle = 'rgba(90,50,15,.45)'; x.lineWidth = .8; x.stroke();
  }
  x.fillStyle = 'rgba(60,30,8,.22)'; x.fillRect(px + w * .62, kb, w, h);
  x.restore();
  holz(px - 3, kb - 4, w + 6, 7, 3.5, '#E1AE68', '#9C6634');
}
function lauf_korn(kx, ky, t, phase){
  const s = Math.max(.3, Math.abs(Math.cos(t * 3.2 + phase)));
  x.fillStyle = radial(kx, ky, 0, 16, [[0, 'rgba(255,215,90,.45)'], [1, 'rgba(255,215,90,0)']]); x.fillRect(kx - 16, ky - 16, 32, 32);
  x.save(); x.translate(kx, ky); x.rotate(.35); x.scale(s, 1);
  x.beginPath(); x.ellipse(0, 0, 6, 9.5, 0, 0, 7);
  x.fillStyle = linear(-6, -9, 6, 9, [[0, '#FFF2B0'], [.35, '#FFCD3A'], [1, '#B47A06']]); x.fill();
  x.strokeStyle = 'rgba(120,75,0,.6)'; x.lineWidth = 1; x.stroke();
  x.strokeStyle = 'rgba(150,95,0,.5)'; x.beginPath(); x.moveTo(0, -7); x.quadraticCurveTo(1.6, 0, 0, 7); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.ellipse(-2.2, -3.5, 1.4, 3, .2, 0, 7); x.fill();
  x.restore();
}
function lauf_brezel(bx, by, t){
  const sk = 1 + Math.sin(t * 5) * .06;
  x.fillStyle = radial(bx, by, 0, 46, [[0, 'rgba(255,250,220,.95)'], [.45, 'rgba(255,215,90,.55)'], [1, 'rgba(255,215,90,0)']]); x.fillRect(bx - 46, by - 46, 92, 92);
  x.strokeStyle = `rgba(255,255,255,${.5 + Math.sin(t * 4) * .25})`; x.lineWidth = 2; x.beginPath(); x.arc(bx, by, 30 + Math.sin(t * 4) * 2, 0, 7); x.stroke();
  x.save(); x.translate(bx, by); x.rotate(Math.sin(t * 2.4) * .15); x.scale(sk * .78, sk * .78);
  const pfad = () => { x.beginPath(); x.moveTo(-14, 16); x.bezierCurveTo(-34, 6, -30, -22, -10, -20); x.bezierCurveTo(4, -18, 6, -2, 0, 6); x.bezierCurveTo(-6, -2, -4, -18, 10, -20); x.bezierCurveTo(30, -22, 34, 6, 14, 16); x.moveTo(-10, 2); x.lineTo(12, 18); x.moveTo(10, 2); x.lineTo(-12, 18); };
  x.lineCap = 'round'; x.lineJoin = 'round';
  pfad(); x.strokeStyle = '#8C5A00'; x.lineWidth = 12; x.stroke();
  pfad(); x.strokeStyle = linear(-30, -20, 30, 20, [[0, '#FFF0A8'], [.45, '#FFC72C'], [1, '#D99400']]); x.lineWidth = 8.5; x.stroke();
  x.translate(-1.2, -2); pfad(); x.strokeStyle = 'rgba(255,255,240,.7)'; x.lineWidth = 2.4; x.stroke();
  x.restore();
  // Funkeln
  const f = (t * 1.3) % 1, a = Math.sin(f * Math.PI);
  x.save(); x.translate(bx + 16, by - 14); x.rotate(t); x.globalAlpha = a; x.fillStyle = '#FFFFFF';
  x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 1.6 : 7; x.lineTo(Math.cos(i * Math.PI / 4) * r, Math.sin(i * Math.PI / 4) * r); } x.fill(); x.restore();
}
function lauf_ofen(px, by, t){
  // Gemauerter Ofen mit Glut, darüber das Schild
  bodenSchatten(px + 50, by, 64, 9, .45);
  x.save();
  x.beginPath(); x.moveTo(px, by); x.lineTo(px, by - 60); x.arc(px + 50, by - 60, 50, Math.PI, 0); x.lineTo(px + 100, by); x.closePath();
  x.fillStyle = linear(0, by - 110, 0, by, [[0, '#C9623A'], [1, '#8E3A1E']]); x.fill();
  x.clip();
  for (let r = 0; r < 12; r++) for (let k = -1; k < 6; k++) {
    const sx = px + k * 22 + (r % 2) * 11, sy = by - 10 - r * 10;
    rr(sx + 1, sy + 1, 20, 8, 2); x.fillStyle = (r + k) % 3 ? 'rgba(255,170,120,.18)' : 'rgba(90,30,10,.18)'; x.fill();
  }
  x.fillStyle = radial(px + 30, by - 90, 0, 70, [[0, 'rgba(255,230,190,.35)'], [1, 'rgba(255,230,190,0)']]); x.fillRect(px, by - 120, 100, 120);
  x.restore();
  // Ofenloch
  const g = .75 + Math.sin(t * 7) * .1 + Math.sin(t * 13) * .05;
  x.beginPath(); x.moveTo(px + 26, by - 8); x.lineTo(px + 26, by - 34); x.arc(px + 50, by - 34, 24, Math.PI, 0); x.lineTo(px + 74, by - 8); x.closePath();
  x.fillStyle = '#2A1208'; x.fill();
  x.fillStyle = radial(px + 50, by - 14, 2, 34, [[0, `rgba(255,236,150,${g})`], [.45, `rgba(255,140,40,${g * .8})`], [1, 'rgba(160,40,10,0)']]); x.fill();
  holz(px + 20, by - 10, 60, 6, 2, '#5E3A1C', '#3A2010');
  x.fillStyle = radial(px + 50, by - 30, 0, 70, [[0, `rgba(255,170,70,${.25 * g})`], [1, 'rgba(255,170,70,0)']]); x.fillRect(px - 20, by - 100, 140, 110);
  // Schild an einer Stange
  const sx = px + 50, sy = by - 150 + Math.sin(t * 2.2) * 2;
  x.strokeStyle = '#3A2010'; x.lineWidth = 2; x.beginPath(); x.moveTo(sx - 30, sy - 30); x.lineTo(sx - 30, sy); x.moveTo(sx + 30, sy - 30); x.lineTo(sx + 30, sy); x.stroke();
  schatten(8, 4, 'rgba(40,20,5,.4)'); rr(sx - 54, sy - 4, 108, 38, 10);
  x.fillStyle = linear(0, sy - 4, 0, sy + 34, [[0, '#FFE070'], [1, '#E8A500']]); x.fill(); ohneSchatten();
  rr(sx - 50, sy, 100, 30, 8); x.strokeStyle = 'rgba(120,70,0,.5)'; x.lineWidth = 1.5; x.stroke();
  x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(sx - 44, sy + 2, 88, 3);
  text('Bonus-Frage', sx, sy + 16, { gr: 14, farbe: F.braun, art: '800' });
  // Kreis mit Fragezeichen
  x.fillStyle = F.braun; x.beginPath(); x.arc(sx, sy - 22, 11, 0, 7); x.fill();
  text('?', sx, sy - 21, { gr: 15, farbe: F.gold, art: '800', schat: false });
}

// ── Extras: Körner-Magnet und Schutzschild ──
function lauf_blase(bx, by, r, t, gold){
  x.fillStyle = radial(bx, by, r * .2, r, gold ? [[0, 'rgba(255,240,180,.15)'], [.75, 'rgba(255,205,70,.35)'], [1, 'rgba(230,160,20,.75)']] : [[0, 'rgba(255,255,255,.12)'], [.75, 'rgba(220,235,255,.35)'], [1, 'rgba(160,190,230,.75)']]);
  x.beginPath(); x.arc(bx, by, r, 0, 7); x.fill();
  x.strokeStyle = gold ? 'rgba(200,130,0,.8)' : 'rgba(120,150,200,.8)'; x.lineWidth = 1.4; x.stroke();
  x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.ellipse(bx - r * .4, by - r * .45, r * .28, r * .14, -.6, 0, 7); x.fill();
}
function lauf_magnetBild(bx, by, s){
  x.save(); x.translate(bx, by); x.scale(s, s); x.rotate(-.5);
  x.lineCap = 'butt'; x.lineWidth = 7;
  x.strokeStyle = '#7A1E10'; x.beginPath(); x.arc(0, -1, 8.5, Math.PI, 0); x.lineTo(8.5, 8); x.moveTo(-8.5, 8); x.lineTo(-8.5, -1); x.stroke();
  x.strokeStyle = linear(-10, -10, 10, 10, [[0, '#FF8A6A'], [.5, '#D0402A'], [1, '#9E2414']]); x.lineWidth = 5.4; x.beginPath(); x.arc(0, -1, 8.5, Math.PI, 0); x.lineTo(8.5, 6); x.moveTo(-8.5, 6); x.lineTo(-8.5, -1); x.stroke();
  x.fillStyle = linear(0, 5, 0, 11, [[0, '#FFFFFF'], [1, '#9AA6B2']]); x.fillRect(-11.2, 5, 5.4, 5.5); x.fillRect(5.8, 5, 5.4, 5.5);
  x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1.3; x.beginPath(); x.arc(0, -1, 8.5, Math.PI * 1.15, Math.PI * 1.55); x.stroke();
  x.restore();
}
function lauf_schildBild(bx, by, s){
  x.save(); x.translate(bx, by); x.scale(s, s);
  x.beginPath(); x.moveTo(0, -11); x.quadraticCurveTo(7, -8, 10, -8); x.quadraticCurveTo(10, 4, 0, 11); x.quadraticCurveTo(-10, 4, -10, -8); x.quadraticCurveTo(-7, -8, 0, -11); x.closePath();
  x.fillStyle = linear(-10, -11, 10, 11, [[0, '#FFF2B0'], [.45, '#FFC72C'], [1, '#B47A06']]); x.fill();
  x.strokeStyle = '#8C5A00'; x.lineWidth = 1.3; x.stroke();
  // Ähre im Wappen
  x.strokeStyle = '#8C5A00'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, 7); x.lineTo(0, -6); x.stroke();
  x.fillStyle = '#8C5A00'; for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(-2.2, -3 + i * 3.2, 1.6, 2.6, -.6, 0, 7); x.fill(); x.beginPath(); x.ellipse(2.2, -3 + i * 3.2, 1.6, 2.6, .6, 0, 7); x.fill(); }
  x.restore();
}
function lauf_extra(e, t){
  const by = e.y + Math.sin(t * 3 + e.x * .02) * 4;
  x.fillStyle = radial(e.x, by, 0, 34, [[0, e.art === 'schild' ? 'rgba(255,220,100,.5)' : 'rgba(255,170,150,.45)'], [1, 'rgba(255,220,100,0)']]); x.fillRect(e.x - 34, by - 34, 68, 68);
  lauf_blase(e.x, by, 19, t, e.art === 'schild');
  if (e.art === 'schild') lauf_schildBild(e.x, by + 1, 1); else lauf_magnetBild(e.x, by + 1, .95);
}
/** Kleine Uhr über Teigi: wie lange das Extra noch hält */
function lauf_restUhr(bx, by, anteil, art){
  x.fillStyle = 'rgba(43,23,10,.7)'; x.beginPath(); x.arc(bx, by, 13, 0, 7); x.fill();
  x.strokeStyle = art === 'schild' ? '#FFC72C' : '#FF8A6A'; x.lineWidth = 3; x.lineCap = 'round';
  x.beginPath(); x.arc(bx, by, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * klemm(anteil, 0, 1)); x.stroke();
  if (art === 'schild') lauf_schildBild(bx, by, .62); else lauf_magnetBild(bx, by, .55);
}
/** Zielfahne für den nächsten Kollegen-Rekord */
function lauf_zielFahne(fx, t, name){
  const by = LAUF_BODEN - 6;
  // Linie quer über den Boden (Karomuster)
  for (let i = 0; i < 8; i++) { const yy = 394 + i * 11; x.fillStyle = i % 2 ? 'rgba(255,255,255,.55)' : 'rgba(43,23,10,.4)'; x.fillRect(fx - 3 + (yy - 394) * .12, yy, 6, 11); }
  // Stange
  x.fillStyle = linear(fx - 2, 0, fx + 2, 0, [[0, '#8A5A12'], [.5, '#FFE7A0'], [1, '#8A5A12']]); rr(fx - 2, by - 150, 4, 150, 2); x.fill();
  x.fillStyle = '#FFC72C'; x.beginPath(); x.arc(fx, by - 152, 4, 0, 7); x.fill();
  // Wehendes Band mit Namen
  x.font = '800 12px "Plus Jakarta Sans", system-ui, sans-serif';
  const w = Math.max(60, x.measureText(name).width + 22), top = by - 146, h = 26;
  x.beginPath(); x.moveTo(fx + 2, top);
  for (let k = 0; k <= 10; k++) x.lineTo(fx + 2 + w * k / 10, top + Math.sin(t * 5 + k * .7) * 2.5 * k / 10);
  x.lineTo(fx + 2 + w - 8, top + h / 2 + Math.sin(t * 5 + 7) * 2.5);
  for (let k = 10; k >= 0; k--) x.lineTo(fx + 2 + w * k / 10, top + h + Math.sin(t * 5 + k * .7) * 2.5 * k / 10);
  x.closePath(); x.fillStyle = linear(0, top, 0, top + h, [[0, '#3F8F4E'], [1, '#2A6A36']]); x.fill();
  x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1; x.stroke();
  text(name, fx + 2 + (w - 8) / 2, top + h / 2 + Math.sin(t * 5 + 3.5) * 1.2, { gr: 12, farbe: '#FFFFFF', schat: false });
}

// ── Goldkorn (ganz selten) ──
function lauf_goldKorn(gx, gy, t){
  if (typeof goldGlanz === 'function') goldGlanz(gx, gy, 18, t);
  const s = Math.max(.45, Math.abs(Math.cos(t * 2.6)));
  x.save(); x.translate(gx, gy); x.rotate(.35); x.scale(s * 1.7, 1.7);
  x.beginPath(); x.ellipse(0, 0, 6, 9.5, 0, 0, 7);
  x.fillStyle = linear(-6, -9, 6, 9, [[0, '#FFF1B8'], [.45, '#FFC72C'], [1, '#C98A00']]); x.fill();
  x.strokeStyle = '#8C5A00'; x.lineWidth = 1.1; x.stroke();
  x.strokeStyle = 'rgba(150,95,0,.6)'; x.lineWidth = .9; x.beginPath(); x.moveTo(0, -7); x.quadraticCurveTo(1.6, 0, 0, 7); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.ellipse(-2.2, -3.5, 1.4, 3, .2, 0, 7); x.fill();
  x.restore();
}
// ── Teigi selbst (ohne mitwandernden Bodenschatten) ──
function lauf_figur(px, fussY, g, { sx = 1, sy = 1, rot = 0, schritt = 0, amBoden = true, blink = false, fuss } = {}){
  const fy0 = fuss ?? fussY;
  if (blink) x.globalAlpha = .45;
  if (!teigiBereit) { teigi(px, fussY, g); x.globalAlpha = 1; return; }
  const mitteY = fussY - g * .45;
  x.save(); x.translate(px, fussY); x.scale(sx, sy); x.translate(0, -g * .45); x.rotate(rot); x.translate(0, g * .45);
  x.drawImage(TEIGI_BILD, -g / 2, -g * .93, g, g);
  x.restore();
  void mitteY;
  // kleine Teigfüße vor dem Glasboden
  if (amBoden) {
    const a = Math.sin(schritt) * 6, b = Math.max(0, Math.cos(schritt)) * 5, b2 = Math.max(0, -Math.cos(schritt)) * 5;
    [[px - 10 + a, b], [px + 10 - a, b2]].forEach(([fx, fb]) => {
      x.fillStyle = linear(0, fy0 - 6 - fb, 0, fy0 + 2 - fb, [[0, '#FFF1CC'], [1, '#E0AE55']]);
      x.beginPath(); x.ellipse(fx, fy0 - 1 - fb, 7.5, 4.2, 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(150,95,30,.45)'; x.lineWidth = 1; x.stroke();
    });
  }
  x.globalAlpha = 1;
}

const LAUF_ARTEN = {
  backstube: { klein: 'korb', mittel: 'sack', gross: 'wagen', hoch: 'stapel' },
  laden: { klein: 'kundenkorb', mittel: 'brotkiste', gross: 'aufsteller', hoch: 'kistenstapel' },
  strasse: { klein: 'pfuetze', mittel: 'kuebel', gross: 'rad', hoch: 'kisten' },
};
const LAUF_MASSE = { korb: [58, 40], sack: [46, 52], wagen: [74, 72], stapel: [48, 88], kundenkorb: [54, 38], brotkiste: [56, 50], aufsteller: [52, 72], kistenstapel: [52, 88], pfuetze: [72, 14], kuebel: [48, 56], rad: [80, 60], kisten: [50, 88] };
const lauf_statPlus = (n, v) => { if (typeof statPlus === 'function') statPlus(n, v); };
const lauf_statMax = (n, v) => { if (typeof statMax === 'function') statMax(n, v); };

SPIELE.lauf = {
  key: 'lauf', name: 'Teigi-Lauf', kurz: 'Springen',
  anleitung: 'Tippen zum Springen, in der Luft nochmal tippen für einen Doppelsprung. Spring über Mehlsäcke, Blechwagen und Brotkörbe und sammle goldene Körner. Am Ofen wartet eine Bonus-Frage.',
  start(){
    this.zeit = 0; this.weg = 0; this.rollen = 0; this.fertig = false; this.tempo = 215; this.y = 0; this.vy = 0; this.spr = 0; this.amBoden = true; this.kojote = 0; this.puffer = 0;
    this.sx = 1; this.sy = 1; this.dreh = 0; this.schritt = 0; this.staubIn = 0;
    this.hind = []; this.koerner = []; this.brezeln = []; this.ofen = null;
    this.naechstAb = 620; this.korbGruppe = 0; this.gruppen = {};
    this.k = 0; this.extra = 0; this.ofenIn = 22; this.brezelIn = 16; this.marke = 100; this.schutz = 0; this.tot = -1; this.trefferArt = '';
    this.gem = typeof rundeGemuetlich !== 'undefined' ? rundeGemuetlich : (typeof GEMUETLICH !== 'undefined' && GEMUETLICH);
    this.herz = this.gem ? 3 : 1; this.magnet = 0; this.schild = 0; this.extras = []; this.extraIn = zufall(12, 18); this.extraArt = Math.random() < .5 ? 'magnet' : 'schild'; this.flagge = null;
    // Goldkorn (Version 282: Geister-Lauf entfernt, Wunsch des Nutzers)
    this.goldZeit = zufall(15, 40); this.gold = null; this.ortIdx = 0; this.ortBanner = null;
    this.staub = Array.from({ length: 22 }, () => ({ x: zufall(0, W), y: zufall(60, 380), r: zufall(.8, 2.2), v: zufall(.15, .5), p: zufall(0, 6) }));
  },
  meter(){ return Math.floor(this.weg / 32); },
  punkte(){ return this.meter() + this.k * 5 + this.extra; },
  aktuellePunkte(){ return this.punkte(); },
  medaillen: [250, 900, 2500],
  springen(){
    if (this.tot >= 0) return;
    if (this.amBoden || this.kojote > 0) {
      this.vy = -770; this.amBoden = false; this.kojote = 0; this.spr = 1; this.sx = .78; this.sy = 1.24;
      mehlWolke(LAUF_TX, LAUF_BODEN - 2, 7);
    } else if (this.spr < 2) {
      this.vy = -650; this.spr = 2; this.dreh = 0.0001; this.sx = .85; this.sy = 1.16;
      teilchen(LAUF_TX, LAUF_BODEN + this.y - 10, { n: 12, tempo: 120, farben: ['#FFF6E4', '#FFE7A0', '#FFFFFF'], groesse: [2, 4], schwer: 200, leben: [.3, .6] });
    } else this.puffer = .14;
  },
  runter(){ this.springen(); },
  taste(k){ if (k === ' ' || k === 'ArrowUp') this.springen(); },

  // Neues Hindernis (Muster wird mit der Zeit schwieriger)
  erzeugen(){
    const t = this.zeit, sx = W + 40;
    // Nicht direkt am Torbogen zwischen zwei Orten
    const p = this.weg + sx - LAUF_TX, oi = lauf_ortIndex(p), bVor = lauf_grenze(oi), bNach = lauf_grenze(oi + 1);
    if (oi > 0 && p - bVor < 170) { this.naechstAb = this.weg + (bVor + 170 - p); return; }
    if (bNach - p < 280) { this.naechstAb = this.weg + (bNach + 170 - p); return; }
    const ort = LAUF_ORTE[oi % 3];
    const groessen = this.gem && t < 60 ? ['klein', 'mittel', 'mittel', 'gross'] : t < 9 ? ['klein', 'mittel'] : t < 22 ? ['klein', 'mittel', 'mittel', 'gross'] : ['klein', 'mittel', 'gross', 'gross', 'hoch', 'doppel'];
    const gr = groessen[ganz(0, groessen.length - 1)];
    const neu = (g, px) => {
      const a = LAUF_ARTEN[ort][g], m = LAUF_MASSE[a];
      const h = { art: a, x: px, w: m[0], h: m[1], wackel: 0 }; this.hind.push(h); return h;
    };
    const art = gr;
    let ende = sx;
    if (art === 'doppel') { const a = neu('klein', sx); const b = neu('mittel', sx + a.w + 120); ende = b.x + b.w; this.koernerBogen(a.x - 30, b.x + b.w + 30, 150); }
    else {
      const h = neu(gr, sx); ende = h.x + h.w;
      if (Math.random() < .55) this.koernerBogen(h.x - 46, h.x + h.w + 46, h.h + 70);
    }
    // Abstand: anfangs großzügig, später enger
    const leicht = this.gem ? 1.45 : t < 10 ? 1.5 : t < 20 ? 1.2 : 1;
    const abstand = (zufall(300, 470) * leicht + this.tempo * .35);
    this.naechstAb = this.weg + (ende - sx) + abstand;
    // Körnerreihe am Boden in der Lücke
    if (Math.random() < .5) { const von = ende + 70, n = ganz(4, 6); this.koernerReihe(von, n); }
  },
  koernerBogen(von, bis, hoch){
    const g = ++this.korbGruppe, n = 6; this.gruppen[g] = n;
    for (let i = 0; i < n; i++) { const f = i / (n - 1); this.koerner.push({ x: lerp(von, bis, f), y: LAUF_BODEN - 30 - Math.sin(f * Math.PI) * hoch, g, p: i * .5 }); }
  },
  koernerReihe(von, n){
    const g = ++this.korbGruppe; this.gruppen[g] = n;
    for (let i = 0; i < n; i++) this.koerner.push({ x: von + i * 26, y: LAUF_BODEN - 30, g, p: i * .5 });
  },

  tick(dt){
    // Sturz-Animation, danach Ende
    if (this.tot >= 0) {
      this.tot += dt; this.tempo *= Math.pow(.02, dt); this.rollen = (this.rollen || 0) + this.tempo * dt;
      const v = this.tempo * dt; for (const h of this.hind) h.x -= v; for (const k of this.koerner) k.x -= v; if (this.ofen) this.ofen.x -= v;
      this.vy += 2000 * dt; this.y = Math.min(0, this.y + this.vy * dt); if (this.y === 0 && this.vy > 0) this.vy = -this.vy * .3;
      this.dreh -= dt * 4 * Math.max(0, 1 - this.tot);
      this.hud();
      if (this.tot > .95 && !this.fertig) { this.fertig = true; ende(this.punkte(), `${this.meter()} m gelaufen und ${this.k === 1 ? 'ein goldenes Korn' : `${this.k} goldene Körner`} gesammelt.`); }
      return;
    }
    this.zeit += dt;
    this.tempo = this.gem ? 180 + Math.min(30, this.zeit * .5) : 215 + Math.min(230, this.zeit * 4.2);
    const v = this.tempo * dt; this.weg += v;
    this.schutz = Math.max(0, this.schutz - dt);

    // Springen und Landen
    const warAmBoden = this.amBoden;
    this.vy += 2200 * dt; this.y += this.vy * dt;
    if (this.y >= 0) {
      this.y = 0;
      if (!warAmBoden) { this.amBoden = true; this.spr = 0; this.dreh = 0; this.sx = 1.3; this.sy = .74; mehlWolke(LAUF_TX, LAUF_BODEN - 2, 9); if (this.puffer > 0) { this.puffer = 0; this.springen(); } }
      this.vy = 0;
    } else if (warAmBoden && this.vy > 0) { this.amBoden = false; this.kojote = .08; }
    this.kojote = Math.max(0, this.kojote - dt); this.puffer = Math.max(0, this.puffer - dt);
    this.sx += (1 - this.sx) * Math.min(1, dt * 11); this.sy += (1 - this.sy) * Math.min(1, dt * 11);
    if (this.dreh) { this.dreh -= dt * Math.PI * 2 / .55; if (this.dreh < -Math.PI * 2) this.dreh = 0; }
    this.schritt += dt * this.tempo * .055;
    if (this.amBoden) { this.staubIn -= dt; if (this.staubIn <= 0) { this.staubIn = .22; teilchen(LAUF_TX - 14, LAUF_BODEN - 3, { n: 2, farben: ['rgba(255,248,232,.8)'], tempo: 40, groesse: [2, 4], schwer: -40, leben: [.3, .5] }); } }

    // Welt bewegen
    for (const h of this.hind) { h.x -= v; h.wackel = Math.max(0, h.wackel - dt * 3); }
    for (const k of this.koerner) k.x -= v;
    for (const b of this.brezeln) b.x -= v;
    if (this.ofen) this.ofen.x -= v;
    this.hind = this.hind.filter((h) => h.x + h.w > -40);
    this.koerner = this.koerner.filter((k) => k.x > -20 && !k.weg);
    this.brezeln = this.brezeln.filter((b) => b.x > -40 && !b.weg);
    for (const s of this.staub) { s.x -= v * s.v * .3; s.y += Math.sin(this.zeit + s.p) * .1; if (s.x < -4) { s.x = W + 4; s.y = zufall(60, 380); } }

    // Neuer Ort: kurz einblenden
    const oiJetzt = lauf_ortIndex(this.weg);
    if (oiJetzt !== this.ortIdx) { this.ortIdx = oiJetzt; this.ortBanner = { name: LAUF_ORT_NAME[LAUF_ORTE[oiJetzt % 3]], t: 0 }; teilchen(180, 118, { n: 16, form: 'stern', tempo: 150, groesse: [2, 4] }); brumm(20); }
    if (this.ortBanner) { this.ortBanner.t += dt; if (this.ortBanner.t > 2.4) this.ortBanner = null; }
    lauf_statMax('meter', this.meter());
    // Goldkorn: schwebt langsam heran, auf und ab, nach ein paar Sekunden ist es weg
    if (!this.gold && this.zeit > this.goldZeit && typeof goldKommt === 'function' && goldKommt()) {
      const frei = this.hind.every((h) => h.x + h.w < W - 40 || h.x > W + 120);
      if (frei) { this.gold = { x: W + 24, y: LAUF_BODEN - 120, t: 0 }; goldErschienen(); }
    }
    if (this.gold) {
      const g = this.gold; g.t += dt; g.x -= dt * (this.tempo * .3 + 20); g.y = LAUF_BODEN - 120 + Math.sin(g.t * 2.3) * 55;
      if (Math.abs(g.x - LAUF_TX) < 32 && Math.abs(g.y - (LAUF_BODEN + this.y - 32)) < 40) {
        if (typeof goldGefangen === 'function') goldGefangen(g.x, g.y);
        this.extra += 50; schwebText('+50', g.x, g.y - 30, '#B07A00', 20); this.gold = null;
      } else if (g.x < -30) this.gold = null;
    }

    // Nachschub
    if (this.weg >= this.naechstAb && !this.ofenSperre) this.erzeugen();
    this.ofenIn -= dt; this.brezelIn -= dt;
    if (this.ofenIn <= 0 && !this.ofen) {
      // Ofen erscheint in einer freien Lücke
      const frei = this.hind.every((h) => h.x + h.w < W - 60);
      const op = this.weg + W + 30 - LAUF_TX, oi = lauf_ortIndex(op);
      const amTor = (oi > 0 && op - lauf_grenze(oi) < 200) || lauf_grenze(oi + 1) - op < 260;
      if (frei && !amTor) { this.ofen = { x: W + 30, ort: LAUF_ORTE[oi % 3] }; this.naechstAb = Math.max(this.naechstAb, this.weg + 300); this.ofenIn = zufall(30, 40); }
    }
    if (this.brezelIn <= 0) {
      const frei = this.hind.every((h) => h.x + h.w < W - 30 || h.x > W + 200);
      if (frei) { this.brezeln.push({ x: W + 60, y: LAUF_BODEN - 205 }); this.brezelIn = zufall(22, 34); this.naechstAb = Math.max(this.naechstAb, this.weg + 240); }
    }

    // Einsammeln
    const ty = LAUF_BODEN + this.y, mitte = ty - 32;
    this.magnet = Math.max(0, this.magnet - dt); this.schild = Math.max(0, this.schild - dt);
    if (this.magnet > 0) for (const k of this.koerner) { const dx = k.x - LAUF_TX; if (dx < 230 && dx > -30) { const f = Math.min(1, dt * (dx < 120 ? 9 : 4)); k.x += (LAUF_TX - k.x) * f; k.y += (mitte - k.y) * f; } }
    // Extras: auftauchen, mitlaufen, einsammeln
    this.extraIn -= dt;
    if (this.extraIn <= 0 && this.magnet <= 0 && this.schild <= 0 && !this.extras.length) {
      const frei = this.hind.every((h) => h.x + h.w < W - 40 || h.x > W + 160);
      if (frei) { this.extras.push({ art: this.extraArt, x: W + 40, y: LAUF_BODEN - 92 }); this.extraArt = this.extraArt === 'magnet' ? 'schild' : 'magnet'; this.extraIn = zufall(22, 32); }
    }
    for (const e of this.extras) {
      e.x -= v;
      if (!e.weg && Math.abs(e.x - LAUF_TX) < 36 && Math.abs(e.y - mitte) < 50) {
        e.weg = true; brumm(25); blitz(.18, '255,230,160');
        teilchen(e.x, e.y, { n: 20, form: 'stern', tempo: 170, groesse: [2.5, 5], leben: [.4, .8] });
        if (e.art === 'magnet') { this.magnet = 8; schwebText('Körner-Magnet!', 190, 200, '#C0392B', 20); }
        else { this.schild = 20; schwebText('Schutzschild!', 190, 200, '#B07A00', 20); }
      }
    }
    this.extras = this.extras.filter((e) => !e.weg && e.x > -40);
    // Zielfahne: Strecke grob aus Punkten je Meter geschätzt
    const ziel = !this.gem && typeof naechstesZiel === 'function' ? naechstesZiel(this.punkte()) : null;
    if (!ziel) this.flagge = null;
    else if (!this.flagge || this.flagge.name !== ziel.name || this.flagge.weg < this.weg - 60) {
      const m = this.meter(), rate = m > 20 ? Math.max(1.5, this.punkte() / m) : 2.6;
      this.flagge = { name: ziel.name, weg: this.weg + Math.max(5, (ziel.punkte - this.punkte()) / rate) * 32 };
    }
    for (const k of this.koerner) if (!k.weg && Math.abs(k.x - LAUF_TX) < 26 && Math.abs(k.y - mitte) < 38) {
      k.weg = true; this.k++; lauf_statPlus('koerner', 1);
      teilchen(k.x, k.y, { n: 6, tempo: 90, groesse: [1.5, 3], leben: [.25, .45], schwer: 0 });
      if (--this.gruppen[k.g] === 0) { this.extra += 10; brumm(25); schwebText('Alle! +10', k.x + 10, k.y - 22, '#B07A00', 18); }
    }
    for (const b of this.brezeln) if (!b.weg && Math.abs(b.x - LAUF_TX) < 34 && Math.abs(b.y - mitte) < 44) {
      b.weg = true; this.extra += 50; blitz(.25, '255,220,120'); brumm(30);
      teilchen(b.x, b.y, { n: 26, tempo: 220, form: 'stern', groesse: [3, 6], leben: [.6, 1] });
      schwebText('Goldene Brezel +50', 190, b.y + 10, '#B07A00', 20);
    }
    // Meter-Marken
    if (this.meter() >= this.marke) { schwebText(`${this.marke} m`, 200, 140, F.braun, 26); teilchen(200, 140, { n: 14, tempo: 140, groesse: [2, 4] }); this.marke += 100; }

    // Ofen erreicht: Bonus-Frage
    if (this.ofen && this.ofen.x + 50 < LAUF_TX && !this.ofen.gefragt) {
      this.ofen.gefragt = true;
      frage((ok) => {
        this.schutz = 1.4;
        if (ok) { this.extra += 100; schwebText('Richtig! +100', 190, 180, F.gruen, 24); teilchen(LAUF_TX, LAUF_BODEN - 50, { n: 24, form: 'stern', tempo: 200, groesse: [3, 6] }); }
        else schwebText('Weiter geht\'s', 190, 180, F.braun, 20);
      });
    }
    if (this.ofen && this.ofen.x < -160) this.ofen = null;

    // Zusammenstoß (großzügige Trefferflächen)
    if (this.schutz <= 0) {
      const l = LAUF_TX - 14, r = LAUF_TX + 14, oben = ty - 50, unten = ty - 4;
      for (const h of this.hind) {
        const ein = h.art === 'wagen' || h.art === 'rad' ? 9 : h.art === 'pfuetze' ? 10 : 7;
        if (r > h.x + ein && l < h.x + h.w - ein && unten > LAUF_BODEN - h.h + 7 && oben < LAUF_BODEN) {
          h.wackel = 1;
          if (this.schild > 0) {
            // Schild fängt den Zusammenstoß ab
            this.schild = 0; this.schutz = 1.2; brumm(45); blitz(.3, '255,230,150');
            teilchen(LAUF_TX, ty - 34, { n: 26, farben: ['#FFC72C', '#FFF1B8', '#FFFFFF'], tempo: 230, groesse: [2.5, 5], leben: [.4, .8] });
            schwebText('Schild hat gehalten!', 190, 200, '#B07A00', 20);
            break;
          }
          this.herz--; brumm(70);
          if (this.herz > 0) {
            this.schutz = 1.6; this.vy = -420; this.amBoden = false; this.spr = 2; wackeln(6); blitz(.25, '255,210,190');
            schwebText(`Autsch! Noch ${this.herz}`, LAUF_TX + 30, LAUF_BODEN - 100, F.rot, 20);
            mehlWolke(LAUF_TX + 14, LAUF_BODEN - 30, 14);
            break;
          }
          this.tot = 0; this.vy = -420; this.dreh = 0; this.trefferArt = h.art;
          wackeln(9); blitz(.3, '255,210,190');
          if (h.art === 'pfuetze') teilchen(h.x + h.w / 2, LAUF_BODEN - 4, { n: 22, farben: ['rgba(150,190,225,.9)', 'rgba(255,255,255,.85)'], tempo: 220, groesse: [2, 4], schwer: 700, oben: 120 });
          else if (h.art === 'sack' || h.art === 'stapel') { mehlWolke(h.x + h.w / 2, LAUF_BODEN - h.h * .6, 26); teilchen(h.x + h.w / 2, LAUF_BODEN - h.h * .6, { n: 18, farben: ['#FFFFFF', '#FFF6E4'], tempo: 200, groesse: [3, 7], schwer: 120 }); }
          else teilchen(h.x + 10, LAUF_BODEN - h.h * .6, { n: 14, form: 'krume', farben: ['#C27F36', '#E3AE68', '#8A5223'], tempo: 200, schwer: 600 });
          schwebText('Autsch!', LAUF_TX + 20, LAUF_BODEN - 100, F.rot, 22);
          break;
        }
      }
    }
    this.hud();
  },
  hud(){
    // nur zwei Pillen: in der Mitte sitzt der Pause-Knopf
    const links = { icon: 'flagge', text: `${this.meter()} m<i style="margin-left:8px">${ICON.korn}</i>${this.k}` };
    const p = this.punkte().toLocaleString('de-DE');
    setHud([links, this.gem ? { text: `${herzen(this.herz, 3).text}<i style="margin-left:6px">${ICON.punkte}</i>${p}` } : { icon: 'punkte', text: p }]);
  },

  malen(t){
    if (!LAUF_EBENEN.orte || LAUF_EBENEN.breite !== c.width || LAUF_EBENEN.hoehe !== c.height) lauf_backen();
    const weg = (this.weg || 0) + (this.rollen || 0);
    // Orte mit Parallaxe; am Torbogen geteilt
    const oi = lauf_ortIndex(weg), cur = LAUF_ORTE[oi % 3], vor = LAUF_ORTE[(oi + 2) % 3], nach = LAUF_ORTE[(oi + 1) % 3];
    const pxVor = oi > 0 ? LAUF_TX + lauf_grenze(oi) - weg : -9999, pxNach = LAUF_TX + lauf_grenze(oi + 1) - weg;
    if (pxVor > 0) lauf_ortMalen(vor, weg, 0, Math.min(W, pxVor));
    lauf_ortMalen(cur, weg, Math.max(0, pxVor), Math.min(W, pxNach));
    if (pxNach < W) lauf_ortMalen(nach, weg, Math.max(0, pxNach), W);
    // Staub im Licht
    for (const s of this.staub || []) { x.globalAlpha = .35 + Math.sin(t * 1.5 + s.p) * .2; x.fillStyle = '#FFF8E6'; x.beginPath(); x.arc(s.x, s.y, s.r * .8, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    if (pxVor > -90) lauf_portal(pxVor, cur);
    if (pxNach < W + 90) lauf_portal(pxNach, nach);

    if (this.ofen) { if ((this.ofen.ort || 'backstube') === 'backstube') lauf_ofen(this.ofen.x, LAUF_BODEN + 4, t); else lauf_bonusTafel(this.ofen.x, LAUF_BODEN + 4, t); }
    if (this.flagge && laeuft) { const fx = LAUF_TX + (this.flagge.weg - (this.weg || 0)); if (fx > -20 && fx < W + 20) lauf_zielFahne(fx, t, this.flagge.name); }
    for (const e of this.extras || []) if (e.x < W + 40) lauf_extra(e, t);
    for (const k of this.koerner || []) if (k.x < W + 20) lauf_korn(k.x, k.y, t, k.p);
    for (const b of this.brezeln || []) lauf_brezel(b.x, b.y, t);
    for (const h of this.hind || []) {
      if (h.x > W + 10) continue;
      if (h.art === 'sack') lauf_sack(h.x, LAUF_BODEN, h.w, h.h, h.wackel);
      else if (h.art === 'stapel') { lauf_sack(h.x - 2, LAUF_BODEN, h.w + 4, h.h * .52, h.wackel); lauf_sack(h.x + 3, LAUF_BODEN - h.h * .5, h.w - 6, h.h * .5, h.wackel); }
      else if (h.art === 'wagen') lauf_wagen(h.x, LAUF_BODEN, h.w, h.h);
      else if (h.art === 'korb') lauf_korb(h.x, LAUF_BODEN, h.w, h.h);
      else if (h.art === 'kundenkorb') lauf_kundenkorb(h.x, LAUF_BODEN, h.w, h.h);
      else if (h.art === 'brotkiste') lauf_brotkiste(h.x, LAUF_BODEN, h.w, h.h);
      else if (h.art === 'kistenstapel') { lauf_brotkiste(h.x, LAUF_BODEN, h.w, h.h * .5); lauf_brotkiste(h.x + 2, LAUF_BODEN - h.h * .5, h.w - 4, h.h * .44); }
      else if (h.art === 'aufsteller') lauf_aufsteller(h.x, LAUF_BODEN, h.w, h.h);
      else if (h.art === 'pfuetze') lauf_pfuetze(h.x, LAUF_BODEN, h.w, t);
      else if (h.art === 'kuebel') lauf_kuebel(h.x, LAUF_BODEN, h.w, h.h);
      else if (h.art === 'rad') lauf_fahrrad(h.x, LAUF_BODEN, h.w, h.h);
      else lauf_kisten(h.x, LAUF_BODEN, h.w, h.h);
    }
    if (this.gold) lauf_goldKorn(this.gold.x, this.gold.y, t);
    // Teigi
    const y = this.y || 0, hoehe = -y;
    bodenSchatten(LAUF_TX, LAUF_BODEN, 24 * Math.max(.45, 1 - hoehe / 260), 6 * Math.max(.45, 1 - hoehe / 260), .38 * Math.max(.35, 1 - hoehe / 220));
    const lauf = laeuft && this.amBoden && this.tot < 0;
    const hops = lauf ? 3 + Math.abs(Math.sin(this.schritt)) * 4 : 0;
    const neig = this.tot >= 0 ? this.dreh : lauf ? .08 + Math.sin(this.schritt * 2) * .03 : this.amBoden ? 0 : (this.vy || 0) * .00012 + (this.dreh || 0);
    const blink = this.schutz > 0 && Math.floor(t * 12) % 2 === 0;
    const atem = !laeuft && this.tot < 0 ? 1 + Math.sin(t * 2.4) * .025 : 1;
    lauf_figur(LAUF_TX, LAUF_BODEN + y - hops, LAUF_GR, { sx: (this.sx || 1) / atem, sy: (this.sy || 1) * atem, rot: neig, schritt: this.schritt || 0, amBoden: this.amBoden !== false && this.tot < 0, blink, fuss: LAUF_BODEN });

    // Magnet-Schimmer und Schild-Blase um Teigi
    const fy = LAUF_BODEN + y - hops - 34;
    if (this.magnet > 0) {
      x.save(); x.translate(LAUF_TX, fy); x.rotate(t * 2.5);
      x.strokeStyle = `rgba(255,140,110,${.45 + Math.sin(t * 8) * .15})`; x.lineWidth = 2.5; x.setLineDash([6, 8]);
      x.beginPath(); x.ellipse(0, 0, 46, 46, 0, 0, 7); x.stroke(); x.setLineDash([]);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; x.fillStyle = '#FFE7A0'; x.beginPath(); x.arc(Math.cos(a) * 46, Math.sin(a) * 46, 2.4, 0, 7); x.fill(); }
      x.restore();
    }
    if (this.schild > 0 && !(this.schild < 3 && Math.floor(t * 8) % 2)) {
      const p = 1 + Math.sin(t * 4) * .03;
      x.fillStyle = radial(LAUF_TX, fy, 18, 46 * p, [[0, 'rgba(255,240,180,0)'], [.7, 'rgba(255,215,90,.18)'], [1, 'rgba(240,170,20,.55)']]);
      x.beginPath(); x.ellipse(LAUF_TX, fy, 42 * p, 48 * p, 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(230,160,20,.85)'; x.lineWidth = 2; x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.ellipse(LAUF_TX, fy, 34 * p, 40 * p, 0, Math.PI * 1.1, Math.PI * 1.45); x.stroke();
    }
    let uhrX = LAUF_TX - (this.magnet > 0 && this.schild > 0 ? 15 : 0);
    if (this.magnet > 0) { lauf_restUhr(uhrX, fy - 66, this.magnet / 8, 'magnet'); uhrX += 30; }
    if (this.schild > 0) lauf_restUhr(uhrX, fy - 66, this.schild / 20, 'schild');

    // Vordergrund: Licht und Vignette
    x.fillStyle = linear(0, 0, W, 0, [[0, 'rgba(255,240,200,.10)'], [.5, 'rgba(255,240,200,0)'], [1, 'rgba(60,30,10,.12)']]); x.fillRect(0, 0, W, H);
    vignette(.32);
    if (this.ortBanner) {
      const b = this.ortBanner, a = Math.min(1, b.t * 4, (2.4 - b.t) * 2.5), sk = b.t < .3 ? ease.feder(b.t / .3) : 1;
      x.save(); x.globalAlpha = Math.max(0, a); x.translate(W / 2, 112); x.scale(sk, sk);
      x.font = '800 18px "Fraunces", Georgia, serif'; const bw = x.measureText(b.name).width + 44;
      rr(-bw / 2, -19, bw, 38, 19); x.fillStyle = 'rgba(43,23,10,.78)'; x.fill(); x.strokeStyle = 'rgba(255,199,44,.8)'; x.lineWidth = 1.5; x.stroke();
      text(b.name, 0, 1, { gr: 18, farbe: '#FFE7A0', schrift: 'Fraunces', schat: false });
      x.restore();
    }
    // Vor dem Start: Hinweis
    if (laeuft && this.tot < 0 && this.zeit < 3.5) {
      const a = Math.min(1, (3.5 - this.zeit) * 2) * (.8 + Math.sin(t * 5) * .2);
      x.globalAlpha = a; rr(118, 300, 160, 34, 17); x.fillStyle = 'rgba(43,23,10,.72)'; x.fill();
      text('Tippen = Springen', 198, 317, { gr: 14, farbe: '#FFE7A0', art: '800', schat: false }); x.globalAlpha = 1;
    }
  },

  // Für das Prüfskript: springen, wenn ein Hindernis passend nah ist
  testZug(){
    const weg = { x: 180, y: 530, warte: 25 };
    if (this.tot >= 0) return weg;
    const h = this.hind.find((o) => o.x + o.w > LAUF_TX - 14);
    if (!h) return weg;
    const abst = h.x + h.w / 2 - LAUF_TX;
    if (this.amBoden && abst < this.tempo * .36 + 10 && abst > 0) return { x: 180, y: 240, warte: 25 };
    if (!this.amBoden && this.spr === 1 && (LAUF_MASSE[h.art][1] >= 60 || this.hind.length > 1) && this.vy > -150 && abst > -10 && abst < 120) return { x: 180, y: 240, warte: 25 };
    return weg;
  }
};
