// ═══ Teig-Schleuder: Teigkugeln in Backformen schießen (Seitenansicht einer Backstube) ═══
const SCHL_A = { x: 84, y: 338 };        // Ruhepunkt der Kugel im Gummiband
const SCHL_BODEN = 440, SCHL_R = 10, SCHL_G = 880, SCHL_K = 8.4, SCHL_MAX = 84;
const SCHL_FORM = { kasten: { w: 60, h: 26 }, korb: { w: 64, h: 28 } };

function schl_leinwand(w, h, malen){ const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2; const g = cv.getContext('2d'); g.scale(2, 2); malen(g); return cv; }
function schl_rr(g, px, py, w, h, r){ r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(px + r, py); g.arcTo(px + w, py, px + w, py + h, r); g.arcTo(px + w, py + h, px, py + h, r); g.arcTo(px, py + h, px, py, r); g.arcTo(px, py, px + w, py, r); g.closePath(); }
function schl_lin(g, x1, y1, x2, y2, st){ const v = g.createLinearGradient(x1, y1, x2, y2); st.forEach(([o, f]) => v.addColorStop(o, f)); return v; }
function schl_rad(g, px, py, r0, r1, st, ox, oy){ const v = g.createRadialGradient(ox ?? px, oy ?? py, r0, px, py, r1); st.forEach(([o, f]) => v.addColorStop(o, f)); return v; }
const schl_zf = (i) => { const s = Math.sin(i * 57.31 + 3.7) * 43758.5453; return s - Math.floor(s); };

// ── Backstube als Hintergrund (einmal gezeichnet) ──
function schl_hintergrund(){
  return schl_leinwand(360, 480, (g) => {
    // Wand: warme Fliesen oben
    g.fillStyle = schl_lin(g, 0, 0, 0, 330, [[0, '#E9D9BC'], [1, '#F6EAD3']]); g.fillRect(0, 0, 360, 330);
    for (let r = 0; r < 14; r++) for (let k = 0; k < 16; k++) { const px = k * 24 + (r % 2) * 12 - 12, py = 14 + r * 22; g.fillStyle = `rgba(${schl_zf(r * 20 + k) < .5 ? '255,255,255' : '160,120,70'},${.05 + schl_zf(r * 31 + k) * .08})`; schl_rr(g, px + 1, py + 1, 22, 20, 3); g.fill(); }
    g.strokeStyle = 'rgba(150,115,70,.22)'; g.lineWidth = 1;
    for (let r = 0; r < 15; r++) { g.beginPath(); g.moveTo(0, 14 + r * 22); g.lineTo(360, 14 + r * 22); g.stroke(); for (let k = 0; k < 17; k++) { const px = k * 24 + (r % 2) * 12 - 12; g.beginPath(); g.moveTo(px, 14 + r * 22); g.lineTo(px, 36 + r * 22); g.stroke(); } }
    // Fenster mit Morgenlicht
    g.save(); schl_rr(g, 250, 40, 86, 112, 43); g.fillStyle = '#7A5230'; g.fill();
    schl_rr(g, 256, 46, 74, 100, 37); g.fillStyle = schl_lin(g, 0, 46, 0, 146, [[0, '#BFE0F2'], [.6, '#F6E7C6'], [1, '#FFD98F']]); g.fill();
    g.clip(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(262, 146); g.lineTo(300, 46); g.lineTo(312, 46); g.lineTo(274, 146); g.fill();
    g.fillStyle = 'rgba(120,160,110,.6)'; g.beginPath(); g.ellipse(270, 150, 30, 22, 0, 0, 7); g.ellipse(318, 154, 28, 24, 0, 0, 7); g.fill(); g.restore();
    g.strokeStyle = '#7A5230'; g.lineWidth = 4; g.beginPath(); g.moveTo(293, 46); g.lineTo(293, 146); g.moveTo(256, 100); g.lineTo(330, 100); g.stroke();
    g.fillStyle = schl_lin(g, 0, 150, 0, 160, [[0, '#9C6B3E'], [1, '#6E4524']]); schl_rr(g, 244, 150, 98, 9, 3); g.fill();
    // Lichtbahn vom Fenster schräg über die Wand
    g.fillStyle = schl_lin(g, 300, 100, 160, 360, [[0, 'rgba(255,236,190,.28)'], [1, 'rgba(255,236,190,0)']]);
    g.beginPath(); g.moveTo(256, 60); g.lineTo(330, 60); g.lineTo(220, 380); g.lineTo(110, 380); g.closePath(); g.fill();
    // Holzvertäfelung unten
    g.fillStyle = schl_lin(g, 0, 330, 0, 440, [[0, '#A97447'], [1, '#7C5128']]); g.fillRect(0, 330, 360, 110);
    for (let k = 0; k < 9; k++) { const px = k * 42 - 6; g.fillStyle = 'rgba(60,30,10,.25)'; g.fillRect(px, 338, 2, 98); g.fillStyle = 'rgba(255,220,170,.12)'; g.fillRect(px + 2, 338, 1, 98); }
    g.strokeStyle = 'rgba(70,40,15,.14)'; for (let i = 0; i < 26; i++) { const yy = 336 + i * 4; g.beginPath(); g.moveTo(0, yy); for (let k = 0; k <= 360; k += 18) g.lineTo(k, yy + Math.sin((k + i * 41) * .05) * 1.3); g.stroke(); }
    g.fillStyle = schl_lin(g, 0, 326, 0, 338, [[0, '#C79560'], [1, '#8A5A2C']]); g.fillRect(0, 326, 360, 10); g.fillStyle = 'rgba(255,240,210,.35)'; g.fillRect(0, 326, 360, 1.5);
    // Deckenbalken
    g.fillStyle = schl_lin(g, 0, 0, 0, 16, [[0, '#5E3A1C'], [1, '#7C5128']]); g.fillRect(0, 0, 360, 16); g.fillStyle = 'rgba(30,15,5,.3)'; g.fillRect(0, 16, 360, 4);
    // Boden: Holzdielen
    g.fillStyle = schl_lin(g, 0, 440, 0, 480, [[0, '#C08A55'], [1, '#8E5E30']]); g.fillRect(0, 440, 360, 40);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const px = k * 70 + (r % 2) * 35 - 35, py = 440 + r * 14; g.fillStyle = `rgba(${schl_zf(r * 9 + k) < .5 ? '255,230,190' : '70,35,10'},${.06 + schl_zf(r * 5 + k) * .08})`; g.fillRect(px + 1, py + 1, 68, 12); g.fillStyle = 'rgba(60,30,10,.3)'; g.fillRect(px, py, 1, 14); }
    g.fillStyle = 'rgba(60,30,10,.3)'; for (let r = 1; r < 3; r++) g.fillRect(0, 440 + r * 14, 360, 1);
    g.fillStyle = 'rgba(40,20,5,.35)'; g.fillRect(0, 440, 360, 3); g.fillStyle = 'rgba(255,235,200,.3)'; g.fillRect(0, 443, 360, 1);
    // Wanduhr
    g.save(); g.translate(62, 142);
    g.shadowColor = 'rgba(40,20,5,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 6; g.fillStyle = '#7A5230'; g.beginPath(); g.arc(0, 0, 27, 0, 7); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = schl_lin(g, -27, -27, 27, 27, [[0, '#B98A55'], [1, '#6E4524']]); g.beginPath(); g.arc(0, 0, 27, 0, 7); g.fill();
    g.fillStyle = schl_rad(g, 0, 0, 2, 22, [[0, '#FFFDF6'], [1, '#EFE3CC']], -6, -8); g.beginPath(); g.arc(0, 0, 21.5, 0, 7); g.fill();
    g.fillStyle = '#4B2A14'; for (let k = 0; k < 12; k++) { const w = k * Math.PI / 6; g.beginPath(); g.arc(Math.cos(w) * 17.5, Math.sin(w) * 17.5, k % 3 ? .9 : 1.7, 0, 7); g.fill(); }
    g.strokeStyle = '#4B2A14'; g.lineCap = 'round'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(-7, -8); g.stroke(); g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(11, -9); g.stroke();
    g.fillStyle = '#C98A00'; g.beginPath(); g.arc(0, 0, 2.2, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-8, -10, 9, 4, -.6, 0, 7); g.fill();
    g.restore();
    // Brezel-Schild an der Wand
    g.save(); g.translate(62, 232); g.strokeStyle = '#6E4524'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-14, -26); g.lineTo(0, -38); g.lineTo(14, -26); g.stroke();
    g.shadowColor = 'rgba(40,20,5,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 5; g.fillStyle = '#8A5A2C'; schl_rr(g, -30, -26, 60, 40, 8); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = schl_lin(g, 0, -26, 0, 14, [[0, '#C68A52'], [1, '#8A5A2C']]); schl_rr(g, -30, -26, 60, 40, 8); g.fill();
    g.strokeStyle = 'rgba(255,230,190,.35)'; g.lineWidth = 1; schl_rr(g, -27, -23, 54, 34, 6); g.stroke();
    g.restore();
    // Mehlstaub an der Wand
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,252,244,${.15 + schl_zf(i) * .25})`; g.beginPath(); g.arc(schl_zf(i + 3) * 360, 30 + schl_zf(i + 7) * 290, .8 + schl_zf(i + 9) * 1.6, 0, 7); g.fill(); }
    // Mehlsäcke unten links
    for (const [sx, sy, s] of [[344, 440, 1], [322, 440, .82]]) {
      g.save(); g.translate(sx, sy); g.scale(s, s);
      g.fillStyle = schl_lin(g, -16, 0, 16, 0, [[0, '#F4EBDA'], [1, '#CDBF9F']]); g.beginPath(); g.moveTo(-15, 0); g.quadraticCurveTo(-19, -26, -10, -44); g.lineTo(10, -44); g.quadraticCurveTo(19, -26, 15, 0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(120,95,60,.4)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#A68A5C'; g.fillRect(-10, -48, 20, 5); g.fillStyle = 'rgba(160,60,40,.75)'; g.fillRect(-9, -26, 18, 2); g.fillRect(-9, -20, 18, 2);
      g.restore();
    }
  });
}

/** Zufall mit Startwert: gleiche Level-Nummer = gleicher Aufbau */
function schl_gen(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SCHL_STERNE_KEY = 'lt_abschalten_schleuder_sterne';
const schl_sterneLesen = () => { try { const o = JSON.parse(localStorage.getItem(SCHL_STERNE_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch { return {}; } };
const schl_sterneSetzen = (lv, n) => { try { const o = schl_sterneLesen(); if (!(o[lv] >= n)) { o[lv] = n; localStorage.setItem(SCHL_STERNE_KEY, JSON.stringify(o)); } } catch {} };
const schl_frei = (o) => { let m = 0; for (const k in o) if (o[k] > 0 && Number(k) > m) m = Number(k); return m + 1; }; // höchstes spielbares Level

/** Ein Spielfeld-Objekt in Kollisions-Rechtecke umwandeln */
function schl_rechtecke(lv){
  const r = [];
  for (const p of lv.plattformen) {
    if (p.art === 'wippe') { r.push({ x: p.cx - 3.5, y: p.cy + 6, w: 7, h: SCHL_BODEN - p.cy - 6 }); continue; }
    r.push({ x: p.x, y: p.y, w: p.w, h: 10 });
    if (p.art === 'wagen') { r.push({ x: p.x + 4, y: p.y + 10, w: 5, h: SCHL_BODEN - p.y - 10 }); r.push({ x: p.x + p.w - 9, y: p.y + 10, w: 5, h: SCHL_BODEN - p.y - 10 }); }
  }
  for (const o of lv.hindernisse) {
    if (o.art === 'stikken') { r.push({ x: o.x, y: o.y, w: 6, h: SCHL_BODEN - o.y }); r.push({ x: o.x + o.w - 6, y: o.y, w: 6, h: SCHL_BODEN - o.y }); for (let yy = o.y; yy < SCHL_BODEN - 30; yy += 36) r.push({ x: o.x, y: yy, w: o.w, h: 5 }); }
    if (o.art === 'haenge') { r.push({ x: o.x, y: o.y, w: o.w, h: 9 }); r.push({ x: o.x + 6, y: 16, w: 2, h: o.y - 16 }); r.push({ x: o.x + o.w - 8, y: 16, w: 2, h: o.y - 16 }); }
  }
  for (const l of lv.luefter || []) for (const k of schl_luefterKoerper(l)) r.push(k);
  return r;
}

/** Kugel gegen Rechteck (prallt ab) */
function schl_kiste(b, rx, ry, rw, rh, e){
  {
    const cx = klemm(b.x, rx, rx + rw), cy = klemm(b.y, ry, ry + rh); let dx = b.x - cx, dy = b.y - cy; const d2 = dx * dx + dy * dy;
    if (d2 >= SCHL_R * SCHL_R) return;
    let d = Math.sqrt(d2), nx, ny;
    if (d < .001) { const l = b.x - rx, rgt = rx + rw - b.x, o = b.y - ry, u = ry + rh - b.y, m = Math.min(l, rgt, o, u); nx = m === l ? -1 : m === rgt ? 1 : 0; ny = m === o ? -1 : m === u ? 1 : 0; if (!nx && !ny) ny = -1; d = 0; }
    else { nx = dx / d; ny = dy / d; }
    const pen = SCHL_R - d; b.x += nx * pen; b.y += ny * pen;
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) { const tx = b.vx - vn * nx, ty = b.vy - vn * ny; b.vx = tx * .9 - vn * nx * e; b.vy = ty * .9 - vn * ny * e; if (-vn > 120) { b.stoss = Math.max(b.stoss || 0, Math.min(1, -vn / 600)); b.stossN = [nx, ny]; b.abprall = (b.abprall || 0) + 1; } }
    b.kontakt = true;
  }
}
/** Kugel gegen gedrehtes Rechteck: Rechteck in Koordinaten um (ox, oy), um rot gedreht */
function schl_kisteRot(b, ox, oy, rot, rx, ry, rw, rh, e){
  const c = Math.cos(rot), sn = Math.sin(rot), dx = b.x - ox, dy = b.y - oy;
  const L = { x: c * dx + sn * dy, y: -sn * dx + c * dy, vx: c * b.vx + sn * b.vy, vy: -sn * b.vx + c * b.vy };
  schl_kiste(L, rx, ry, rw, rh, e);
  if (!L.kontakt) return;
  b.x = ox + c * L.x - sn * L.y; b.y = oy + sn * L.x + c * L.y; b.vx = c * L.vx - sn * L.vy; b.vy = sn * L.vx + c * L.vy;
  b.kontakt = true; if (L.stoss) { b.stoss = Math.max(b.stoss || 0, L.stoss); b.stossN = [c * L.stossN[0] - sn * L.stossN[1], sn * L.stossN[0] + c * L.stossN[1]]; b.abprall = (b.abprall || 0) + 1; }
}
// ── Neue Hindernisse ab Level 13: wackelndes Blech (Wippe) und Ventilator ──
const SCHL_WIPPE_LEN = 84;
/** Erster gelungener Versuch je neuem Level (mit dem Prüfskript ermittelt; bei Änderungen am Aufbau neu ermitteln) */
let SCHL_NEU_START = { 13: 5, 14: 6, 15: 5, 16: 1, 17: 3, 18: 5, 19: 0, 20: 20, 21: 16, 22: 3, 23: 1, 24: 0, 25: 1, 26: 10, 27: 3, 28: 0, 29: 5, 30: 6, 31: 3, 32: 9, 33: 3, 34: 6, 35: 0, 36: 4, 37: 19, 38: 6, 39: 0, 40: 3 };
/** Lüfter an/aus im Takt: weiches Hoch- und Runterfahren */
function schl_luefterStaerke(l, t){
  if (!l.takt) return 1;
  const u = ((t + l.ph) % l.per + l.per) % l.per, an = l.per * .58, r = .45;
  if (u < r) return u / r; if (u < an) return 1; if (u < an + r) return 1 - (u - an) / r; return 0;
}
/** Feste Teile eines Lüfters (Gehäuse und Ständer) */
function schl_luefterKoerper(l){
  if (l.art === 'boden') return [{ x: l.x - 34, y: SCHL_BODEN - 24, w: 68, h: 24 }];
  return [{ x: l.x - 9, y: l.y - 27, w: 18, h: 54 }];
}
/** Windfeld eines Lüfters: Rechteck und Beschleunigung bei voller Stärke */
function schl_wind(l){
  if (l.art === 'boden') return { x: l.x - 30, y: l.hoch, w: 60, h: SCHL_BODEN - 24 - l.hoch, ax: 0, ay: -1500 };
  return l.dir < 0 ? { x: l.x - 12 - l.weite, y: l.y - 30, w: l.weite, h: 60, ax: -l.kraft, ay: 0 } : { x: l.x + 12, y: l.y - 30, w: l.weite, h: 60, ax: l.kraft, ay: 0 };
}
/** Alles, was sich bewegt, auf Zeit t stellen (Schienen, Wippen, Lüfter) */
function schl_dyn(lv, t){
  for (const f of lv.formen) if (f.bahn && !f.voll) f.x = f.x0 + Math.sin(t * Math.PI * 2 / f.bahn.per + f.bahn.ph) * f.bahn.a;
  for (const p of lv.plattformen) if (p.art === 'wippe') {
    const f = lv.formen[p.form], w = t * Math.PI * 2 / p.per + p.ph;
    p.rot = p.amp * Math.sin(w); p.s = p.rutsch * Math.sin(w - .8);
    const c = Math.cos(p.rot), sn = Math.sin(p.rot), ly = -6 - f.h;
    f.x = p.cx + c * p.s - sn * ly; f.y = p.cy + sn * p.s + c * ly; f.rot = p.rot; f.wippe = p;
  }
  for (const l of lv.luefter || []) l.s = schl_luefterStaerke(l, t);
}

/** Ein Physik-Schritt für die Kugel. Rückgabe: getroffene Form oder null */
function schl_schritt(b, rechtecke, formen, dt, lv){
  if (lv && lv.luefter) for (const l of lv.luefter) if (l.s > .01) { const z = schl_wind(l); if (b.x > z.x && b.x < z.x + z.w && b.y > z.y && b.y < z.y + z.h) { const nah = z.ax < 0 ? (b.x - z.x) / z.w : z.ax > 0 ? 1 - (b.x - z.x) / z.w : (b.y - z.y) / z.h; const k = l.s * (.45 + .55 * nah); b.vx += z.ax * k * dt; b.vy += z.ay * k * dt; b.wind = 1; } }
  b.vy += SCHL_G * dt; const vorUnten = b.y + SCHL_R; b.x += b.vx * dt; b.y += b.vy * dt;
  for (const f of formen) {
    if (f.voll) continue;
    if (f.wippe) { // gedrehte Form: im eigenen Koordinatensystem prüfen
      const c = Math.cos(f.rot), sn = Math.sin(f.rot), dx = b.x - f.x, dy = b.y - f.y, ly = -sn * dx + c * dy, lx = c * dx + sn * dy, lvy = -sn * b.vx + c * b.vy;
      if (lvy > 0 && ly - lvy * dt + SCHL_R <= 1 && ly + SCHL_R > 1 && Math.abs(lx) < f.w / 2 + 3) return f;
      continue;
    }
    if (b.vy > 0 && vorUnten <= f.y + 1 && b.y + SCHL_R > f.y + 1 && Math.abs(b.x - f.x) < f.w / 2 + 3) return f;
  }
  b.kontakt = false;
  for (const r of rechtecke) schl_kiste(b, r.x, r.y, r.w, r.h, .5);
  for (const f of formen) {
    const l = f.x - f.w / 2;
    if (f.wippe) {
      const p = f.wippe, hw = f.w / 2;
      if (f.voll) schl_kisteRot(b, f.x, f.y, f.rot, -hw, -10, f.w, f.h + 10, .35);
      else { schl_kisteRot(b, f.x, f.y, f.rot, -hw - 2, -2, 5, f.h + 2, .35); schl_kisteRot(b, f.x, f.y, f.rot, hw - 3, -2, 5, f.h + 2, .35); schl_kisteRot(b, f.x, f.y, f.rot, -hw, f.h - 5, f.w, 5, .35); }
      schl_kisteRot(b, p.cx, p.cy, p.rot, -SCHL_WIPPE_LEN / 2, -6, SCHL_WIPPE_LEN, 6, .45);
    }
    else if (f.voll) schl_kiste(b, l, f.y - 10, f.w, f.h + 10, .35);
    else { schl_kiste(b, l - 2, f.y - 2, 5, f.h + 2, .35); schl_kiste(b, l + f.w - 3, f.y - 2, 5, f.h + 2, .35); schl_kiste(b, l, f.y + f.h - 5, f.w, 5, .35); }
  }
  if (b.y + SCHL_R > SCHL_BODEN) { b.y = SCHL_BODEN - SCHL_R; if (b.vy > 120) { b.stoss = Math.min(1, b.vy / 600); b.stossN = [0, -1]; } b.vy = -b.vy * .35; b.vx *= .82; b.kontakt = true; }
  if (b.x < SCHL_R) { b.x = SCHL_R; b.vx = Math.abs(b.vx) * .5; }
  return null;
}

/** Zugweite begrenzen: höchstens SCHL_MAX, nicht aus dem Bild und nicht durch den Boden */
function schl_klemmZug(dx, dy){
  const l = Math.hypot(dx, dy); if (l > SCHL_MAX) { dx *= SCHL_MAX / l; dy *= SCHL_MAX / l; }
  return [klemm(dx, -74, 20), Math.min(dy, SCHL_BODEN - SCHL_R - 4 - SCHL_A.y)];
}

/** Prüft, welche Formen mit welchen Schüssen erreichbar sind (für faire Level und für den Test) */
function schl_pruefe(lv, formen, t0, genug){
  const rechtecke = schl_rechtecke(lv), treffer = formen.map(() => []);
  for (let a = -10; a <= 82; a += 3.5) for (let s = 28; s <= SCHL_MAX; s += 4) {
    if (genug && treffer.every((l, i) => l.length >= genug || formen[i].voll)) return treffer;
    const w = a * Math.PI / 180, [dx, dy] = schl_klemmZug(-Math.cos(w) * s, Math.sin(w) * s);
    if (Math.abs(Math.hypot(dx, dy) - s) > 2) continue;
    const b = { x: SCHL_A.x + dx, y: SCHL_A.y + dy, vx: -dx * SCHL_K, vy: -dy * SCHL_K };
    for (let t = 0; t < 3.4; t += 1 / 120) {
      if (t0 !== undefined) schl_dyn(lv, t0 + t);
      const f = schl_schritt(b, rechtecke, formen, 1 / 120, lv);
      if (f) { treffer[formen.indexOf(f)].push({ dx, dy }); break; }
      if (b.x > W + 20 || (b.y > SCHL_BODEN - SCHL_R - 1 && Math.abs(b.vy) < 40)) break;
    }
  }
  return treffer;
}

SPIELE.schleuder = {
  key: 'schleuder', name: 'Teig-Schleuder', kurz: 'Zielen', medaillen: [500, 1300, 2600],
  anleitung: 'Zieh die Teigkugel nach hinten und lass los. Triff alle drei Backformen mit höchstens 5 Kugeln. Übrige Kugeln geben Bonus.',
  bilder(){ if (!this.bild) this.bild = { hg: schl_hintergrund() }; return this.bild; },
  start(){
    this.gemuetlich = typeof GEMUETLICH !== 'undefined' && GEMUETLICH;
    this.einzel = this.nochmalEinzel || 0; this.nochmalEinzel = 0;
    this.level = this.einzel ? this.einzel - 1 : 0; this.punkteN = 0; this.sterne = 0; this.zeit = 0; this.ball = null; this.ziehen = null; this.zustand = 'spiel'; this.lauf = 0; this.naechstes = null; this.naechstesV = 0; this.endeGerufen = false;
    this.gold = null; this.goldZeit = zufall(15, 40); this.hinweisNeu = null;
    this.neuesLevel();
  },
  aktuellePunkte(){ return this.punkteN || 0; },
  kugelnProLevel(){ return this.gemuetlich ? 8 : 5; },
  /** Ein gewähltes Level als eigene kleine Runde spielen (n = 0: ganze Runde ab Level 1) */
  levelWaehlen(n){
    this.nochmalEinzel = n; this.start(); this.nochmalEinzel = n; // „Nochmal“ spielt dasselbe Level wieder
    if (!n) this.nochmalEinzel = 0;
  },
  /** Plan der neuen Level 13 bis 22 (danach gemischt): Wippen, Lüfter (s = Seite, b = Boden, t = im Takt), Hindernisse, Schienen */
  NEU_PLAN: {
    13: { wippen: 1, amp: .2 }, 14: { luefter: ['s'] }, 15: { wippen: 1, amp: .28, hind: 1 }, 16: { luefter: ['b'] }, 17: { luefter: ['st'] },
    18: { wippen: 2, amp: .3 }, 19: { wippen: 1, amp: .3, luefter: ['st'] }, 20: { wippen: 1, amp: .32, luefter: ['bt'], hind: 1 },
    21: { wippen: 1, amp: .34, luefter: ['s', 'b'] }, 22: { wippen: 2, amp: .36, luefter: ['st'], hind: 1 },
  },
  NEU_HINWEIS: { 13: 'Neu: Das Blech wackelt. Pass den Moment ab!', 14: 'Neu: Der Ventilator pustet den Teig weg.', 16: 'Neu: Der Lüfter pustet nach oben.', 17: 'Der Ventilator geht an und aus.' },
  neuPlan(lvNr, R){
    if (this.NEU_PLAN[lvNr]) return this.NEU_PLAN[lvNr];
    const z = (a, b) => a + Math.floor(R() * (b - a + 1));
    return { wippen: z(0, 2), amp: .3 + R() * .08, luefter: ['s', 'st', 'b', 'bt'].filter(() => R() < .35).slice(0, 2), hind: z(0, 1), beweg: z(0, 1) };
  },
  /** Level ab 13: wie die alten, dazu Wippen und Lüfter. Jede Form muss zu irgendeinem Zeitpunkt sicher erreichbar sein. */
  baueNeu(lvNr, stufe, versuch){
    // bekannte Level: erster gelungener Versuch ist schon geprüft (spart Rechenzeit, ergibt genau denselben Aufbau)
    const bekannt = SCHL_NEU_START[lvNr];
    if (bekannt !== undefined && versuch < bekannt) return null;
    const ohnePruefung = bekannt === versuch;
    const R = schl_gen(lvNr * 7000003 + versuch * 104729 + 91), rz = (a, b) => a + R() * (b - a);
    const plan = this.neuPlan(lvNr, R);
    const leichter = (n) => Math.max(0, (n || 0) - (stufe >= 2 ? 1 : 0));
    const formen = [], plattformen = [], hindernisse = [], luefter = [];
    const unten = (q) => q.art === 'wagen' || q.art === 'wippe' ? SCHL_BODEN : q.y + 10;
    // belegte Flächen je Plattform (mit Platz für die Form darüber und dem Schwenk der Wippe)
    const flaechen = (q) => q.art === 'wippe' ? [{ x: q.cx - 48, y: q.cy - 52, w: 96, h: 72 }, { x: q.cx - 6, y: q.cy, w: 12, h: SCHL_BODEN - q.cy }]
      : q.art === 'wagen' ? [{ x: q.x, y: q.y - 40, w: q.w, h: SCHL_BODEN - q.y + 40 }] : [{ x: q.x, y: q.y - 40, w: q.w, h: 50 }];
    const stoesst = (p, ohne) => plattformen.some((c, i) => i !== ohne && flaechen(p).some((a) => flaechen(c).some((b) => a.x < b.x + b.w + 6 && b.x < a.x + a.w + 6 && a.y < b.y + b.h + 4 && b.y < a.y + a.h + 4)));
    const nW = Math.min(stufe >= 2 ? 1 : 2, plan.wippen || 0);
    for (let v = 0; v < 400 && formen.length < 3; v++) {
      const wip = formen.length < nW, art = R() < .5 ? 'kasten' : 'korb', { w, h } = SCHL_FORM[art];
      const f = { art, x: nW === 2 && wip ? (formen.length ? rz(262, 326) : rz(160, 200)) : rz(wip ? 168 : 160, wip ? 326 : 338), y: rz(wip ? 232 : 190, (wip ? 352 : 398) - h), w, h, voll: false, fuell: 0 }; f.x0 = f.x;
      if (formen.some((o) => { const dx = Math.abs(o.x - f.x); return dx < 64 && !(dx >= 40 && Math.abs(o.y - f.y) >= 110); })) continue;
      const py = f.y + f.h;
      const p = wip ? { art: 'wippe', x: f.x - SCHL_WIPPE_LEN / 2 - 6, y: py - 22, w: SCHL_WIPPE_LEN + 12, cx: f.x, cy: py + 6, amp: plan.amp, per: rz(2.6, 3.6), ph: R() * 6.28, rutsch: 9, form: formen.length, rot: 0, s: 0 }
        : { art: py > 362 ? 'wagen' : 'regal', x: f.x - (f.w + 18) / 2, y: py, w: f.w + 18 };
      if (stoesst(p, -1)) continue;
      formen.push(f); plattformen.push(p);
    }
    if (formen.length < 3) return null;
    // Schiene (nur bei gemischten Leveln)
    if (leichter(plan.beweg)) for (let i = 0; i < 3; i++) { const f = formen[i], p = plattformen[i]; if (p.art === 'wippe') continue; for (let a = Math.min(f.x - 158, 328 - f.x, 26); a >= 16; a -= 4) { const bw = f.w + 18 + a * 2, q = { art: 'schiene', x: f.x - bw / 2, y: f.y + f.h, w: bw }; if (!stoesst(q, i)) { f.bahn = { a, per: rz(3.6, 5), ph: R() * 6.28 }; plattformen[i] = q; break; } } break; }
    const frei = (rx, ry, rw, rh) => formen.every((f, i) => { const p = plattformen[i], a = f.bahn ? f.bahn.a : 0, hw = p.art === 'wippe' ? SCHL_WIPPE_LEN / 2 + 6 : f.w / 2 + a; return rx + rw < f.x - hw - 10 || rx > f.x + hw + 10 || ry + rh < f.y - 74 || ry > (p.art === 'wippe' ? SCHL_BODEN : f.y + f.h + 12); })
      && plattformen.every((p) => rx + rw < p.x - 8 || rx > p.x + p.w + 8 || ry + rh < p.y - 8 || ry > unten(p) + 8);
    const getrennt = (rx, rw) => hindernisse.every((o) => rx + rw < o.x - 16 || rx > o.x + o.w + 16) && luefter.every((l) => rx + rw < l.x - 50 || rx > l.x + 50);
    // Lüfter
    for (const code of (stufe >= 3 ? [] : plan.luefter || []).slice(0, stufe >= 2 ? 1 : 2)) {
      const takt = code.length > 1, per = rz(3.6, 4.6), ph = R() * per;
      for (let v = 0; v < 60; v++) {
        let l;
        if (code[0] === 'b') { l = { art: 'boden', x: rz(150, 318), hoch: rz(110, 170), takt, per, ph, s: 1 }; if (!frei(l.x - 36, SCHL_BODEN - 26, 72, 26) || !getrennt(l.x - 36, 72)) continue; }
        else { const dir = R() < .5 ? -1 : 1; l = { art: 'seite', dir, x: dir < 0 ? rz(330, 342) : rz(122, 140), y: dir < 0 ? rz(130, 330) : rz(150, 270), weite: rz(150, 190), kraft: rz(620, 760), takt, per, ph, s: 1 }; if (!frei(l.x - 12, l.y - 30, 24, 60) || !getrennt(l.x - 12, 24)) continue; }
        luefter.push(l); break;
      }
    }
    if (stufe < 2 && luefter.length < (plan.luefter || []).length) return null;
    const nH = Math.max(0, (plan.hind || 0) - (stufe >= 1 ? 1 : 0));
    for (let v = 0; v < 60 && hindernisse.length < nH; v++) {
      if (R() < .5) { const w = 52, h = rz(90, 170), ox = rz(120, 300), oy = SCHL_BODEN - h; if (frei(ox, oy, w, h) && getrennt(ox, w)) hindernisse.push({ art: 'stikken', x: ox, y: oy, w }); }
      else { const w = rz(66, 88), ox = rz(120, 330 - w), oy = rz(70, 200); if (frei(ox, 16, w, oy - 16 + 12) && getrennt(ox, w)) hindernisse.push({ art: 'haenge', x: ox, y: oy, w }); }
    }
    const lv = { formen, plattformen, hindernisse, luefter, neu: true, art: [nW ? 'wippe' : '', luefter.length ? 'luefter' : ''].filter(Boolean) };
    if (stufe >= 3 && (nW === 0) && !luefter.length) return null;
    if (ohnePruefung) { schl_dyn(lv, 0); return lv; }
    // Prüfen über mehrere Zeitpunkte: jede Form braucht zu einem Zeitpunkt mindestens 3 Treffer-Schüsse
    const ok = formen.map(() => false);
    for (const t0 of [0, .7, 1.4, 2.1, 2.8, 3.5, 4.2]) {
      const t = schl_pruefe(lv, formen, t0, 3);
      t.forEach((l, i) => { if (l.length >= 3) ok[i] = true; });
      if (ok.every(Boolean)) break;
    }
    schl_dyn(lv, 0); for (const f of formen) if (f.bahn) f.x = f.x0;
    return ok.every(Boolean) ? lv : null;
  },
  baueLevel(lvNr, stufe, versuch = 0){
    if (lvNr >= 13) return this.baueNeu(lvNr, stufe, versuch);
    const R = schl_gen(lvNr * 1000003 + versuch * 7919 + 17), rz = (a, b) => a + R() * (b - a);
    const n = 3, formen = [], plattformen = [], hindernisse = [];
    const yMin = lvNr === 1 ? 250 : lvNr === 2 ? 190 : 140;
    const plattform = (f, a) => { const bw = f.w + 18 + a * 2, py = f.y + f.h; return { art: a ? 'schiene' : py > 362 ? 'wagen' : 'regal', x: f.x - bw / 2, y: py, w: bw }; };
    const unten = (q) => q.art === 'wagen' ? SCHL_BODEN : q.y + 10;
    const stoesst = (p, ohne) => plattformen.some((c, i) => i !== ohne && p.x < c.x + c.w + 6 && c.x < p.x + p.w + 6 && p.y - 36 < unten(c) && c.y - 36 < unten(p));
    for (let v = 0; v < 200 && formen.length < n; v++) {
      const art = R() < .5 ? 'kasten' : 'korb', { w, h } = SCHL_FORM[art];
      const f = { art, x: rz(162, 320), y: rz(yMin, 398 - h), w, h, voll: false, fuell: 0 }; f.x0 = f.x;
      if (formen.some((o) => Math.abs(o.x - f.x) < 70 && !(Math.abs(o.x - f.x) >= 40 && Math.abs(o.y - f.y) >= 110))) continue;
      const p = plattform(f, 0); if (stoesst(p, -1)) continue;
      formen.push(f); plattformen.push(p);
    }
    if (formen.length < n) return null;
    // Bewegliche Form ab Level 4 (auf einer Schiene)
    const beweglich = lvNr >= 4 ? Math.max(0, Math.min(2, Math.floor((lvNr - 1) / 3)) - (stufe >= 2 ? 1 : 0) - (stufe >= 3 ? 1 : 0)) : 0;
    const reihe = [0, 1, 2].sort(() => R() - .5);
    let bew = 0;
    for (const i of reihe) {
      if (bew >= beweglich) break;
      const f = formen[i];
      for (let a = Math.min(f.x - 158, 328 - f.x, 30); a >= 16; a -= 4) { const p = plattform(f, a); if (!stoesst(p, i)) { f.bahn = { a, per: rz(3.6, 5), ph: R() * 6.28 }; plattformen[i] = p; bew++; break; } }
    }
    // Hindernisse ab Level 3
    const nH = lvNr < 3 ? 0 : Math.max(0, Math.min(2, 1 + Math.floor((lvNr - 3) / 3)) - stufe);
    const frei = (rx, ry, rw, rh) => formen.every((f) => { const a = f.bahn ? f.bahn.a : 0; return rx + rw < f.x - f.w / 2 - a - 10 || rx > f.x + f.w / 2 + a + 10 || ry + rh < f.y - 74 || ry > f.y + f.h + 12; }) && plattformen.every((p) => rx + rw < p.x - 8 || rx > p.x + p.w + 8 || ry + rh < p.y - 8 || ry > p.y + 18);
    for (let v = 0; v < 60 && hindernisse.length < nH; v++) {
      if (R() < .5) { const w = 52, h = rz(90, 190), ox = rz(120, 300), oy = SCHL_BODEN - h; if (frei(ox, oy, w, h) && hindernisse.every((o) => ox + w < o.x - 20 || ox > o.x + o.w + 20)) hindernisse.push({ art: 'stikken', x: ox, y: oy, w }); }
      else { const w = rz(66, 92), ox = rz(120, 330 - w), oy = rz(70, 210); if (frei(ox, 16, w, oy - 16 + 12) && hindernisse.every((o) => ox + w < o.x - 20 || ox > o.x + o.w + 20)) hindernisse.push({ art: 'haenge', x: ox, y: oy, w }); }
    }
    if (hindernisse.length < nH) return null;
    const lv = { formen, plattformen, hindernisse };
    // Prüfen: jede Form muss mit mehreren Schüssen erreichbar sein (bewegliche an beiden Enden und in der Mitte)
    const proben = [0];
    if (formen.some((f) => f.bahn)) proben.push(-1, 1);
    for (const p of proben) {
      for (const f of formen) f.x = f.x0 + (f.bahn ? f.bahn.a * p : 0);
      const t = schl_pruefe(lv, formen);
      if (t.some((liste) => liste.length < (p === 0 ? 3 : 1))) { for (const f of formen) f.x = f.x0; return null; }
      if (p === 0) lv.schuesse = t;
    }
    for (const f of formen) f.x = f.x0;
    return lv;
  },
  neuesLevel(){
    this.level++; this.kugeln = this.kugelnProLevel(); this.ball = null; this.ziehen = null; this.zustand = 'spiel'; this.einflug = 0; this.geschossen = 0; this.laden = 1;
    let lv = this.naechstes && this.naechstes.nr === this.level ? this.naechstes.lv : null; this.naechstesV = this.naechstes && this.naechstes.nr === this.level && !lv ? this.naechstes.v : 0; this.naechstes = null;
    for (let v = this.naechstesV || 0; v < 60 && !lv; v++) lv = this.baueLevel(this.level, Math.floor(v / 15), v);
    this.naechstesV = 0;
    for (let v = 0; v < 30 && !lv; v++) lv = this.baueLevel(1, 3, 100 + v);
    if (!lv) lv = { formen: [{ art: 'kasten', x: 180, x0: 180, y: 374, w: 60, h: 26, voll: false, fuell: 0 }, { art: 'korb', x: 256, x0: 256, y: 290, w: 64, h: 28, voll: false, fuell: 0 }, { art: 'kasten', x: 320, x0: 320, y: 220, w: 60, h: 26, voll: false, fuell: 0 }], plattformen: [{ art: 'wagen', x: 139, y: 400, w: 82 }, { art: 'regal', x: 213, y: 318, w: 86 }, { art: 'regal', x: 279, y: 246, w: 82 }], hindernisse: [] };
    this.lv = lv; this.rechtecke = schl_rechtecke(lv); this.gold = null;
    this.hinweisNeu = this.NEU_HINWEIS[this.level] ? { t: this.NEU_HINWEIS[this.level], z: 3.4 } : null;
  },
  formenBewegen(){ schl_dyn(this.lv, this.zeit); },
  // ── Level-Auswahl ──
  knopfRect: { x: 10, y: 72, w: 104, h: 30 },
  auswahlFrei(){ return Math.max(schl_frei(schl_sterneLesen()), this.einzel ? 0 : this.level); },
  auswahlSeiten(){ return Math.ceil((this.auswahlFrei() + 1) / 16); },
  auswahlKacheln(){
    const sterne = schl_sterneLesen(), frei = this.auswahlFrei(), seite = klemm(this.auswahlSeite || 0, 0, this.auswahlSeiten() - 1), von = 1 + seite * 16, liste = [];
    for (let i = 0; i < 16 && von + i <= frei + 1; i++) { const n = von + i, sp = i % 4, ze = Math.floor(i / 4); liste.push({ n, x: 33 + sp * 76, y: 146 + ze * 70, w: 66, h: 60, offen: n <= frei, st: sterne[n] || 0 }); }
    return liste;
  },
  /** Kennzeichen der Level ab 13 (für die Auswahl): Wippe und/oder Lüfter */
  levelZeichen(n){
    if (n < 13) return [];
    const p = this.NEU_PLAN[n]; if (!p) return ['mix'];
    return [p.wippen ? 'wippe' : '', (p.luefter || []).length ? 'luefter' : ''].filter(Boolean);
  },
  auswahlOeffnen(){ this.vorAuswahl = this.zustand; this.zustand = 'auswahl'; this.auswahlZeit = 0; this.ziehen = null; this.auswahlSeite = Math.floor((Math.max(1, this.level) - 1) / 16); },
  auswahlTipp(p){
    const in_ = (r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
    const seiten = this.auswahlSeiten(), sei = klemm(this.auswahlSeite || 0, 0, seiten - 1);
    if (seiten > 1 && in_({ x: 22, y: 88, w: 46, h: 42 })) { if (sei > 0) { this.auswahlSeite = sei - 1; brumm(15); } return; }
    if (seiten > 1 && in_({ x: 292, y: 88, w: 46, h: 42 })) { if (sei < seiten - 1) { this.auswahlSeite = sei + 1; brumm(15); } return; }
    for (const k of this.auswahlKacheln()) if (in_(k)) { if (k.offen) { brumm(20); this.levelWaehlen(k.n); } else { wackeln(3); brumm(40); } return; }
    if (in_({ x: 33, y: 432, w: 140, h: 30 })) { this.levelWaehlen(0); return; }
    if (in_({ x: 187, y: 432, w: 140, h: 30 }) || p.y < 76 || p.y > 470) this.zustand = this.vorAuswahl || 'spiel';
  },
  malKnopf(){
    const r = this.knopfRect;
    x.fillStyle = 'rgba(255,251,242,.92)'; rr(r.x, r.y, r.w, r.h, 15); x.fill(); x.strokeStyle = 'rgba(75,42,20,.18)'; x.lineWidth = 1; x.stroke();
    x.fillStyle = F.braun; for (let i = 0; i < 4; i++) { rr(r.x + 10 + (i % 2) * 7, r.y + 8 + Math.floor(i / 2) * 7, 5.5, 5.5, 1.5); x.fill(); }
    text(`Level ${this.level}`, r.x + 60, r.y + r.h / 2 + .5, { gr: 13, farbe: F.braun, schat: false });
    x.strokeStyle = F.braun; x.lineWidth = 1.8; x.lineCap = 'round'; x.beginPath(); x.moveTo(r.x + r.w - 15, r.y + 13); x.lineTo(r.x + r.w - 11, r.y + 17); x.lineTo(r.x + r.w - 7, r.y + 13); x.stroke();
  },
  /** Kleine Zeichen für neue Hindernisse in der Level-Auswahl */
  malZeichen(z, px, py){
    x.save(); x.translate(px, py);
    x.fillStyle = '#EAF2FA'; x.strokeStyle = '#7FA6C8'; x.lineWidth = 1; x.beginPath(); x.arc(0, 0, 7, 0, 7); x.fill(); x.stroke();
    x.strokeStyle = '#3F6E96'; x.fillStyle = '#3F6E96'; x.lineWidth = 1.5; x.lineCap = 'round';
    if (z === 'luefter') { for (let i = 0; i < 3; i++) { x.save(); x.rotate(i * 2.094); x.beginPath(); x.ellipse(0, -2.6, 1.6, 2.8, .5, 0, 7); x.fill(); x.restore(); } x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); }
    else if (z === 'wippe') { x.beginPath(); x.moveTo(-4.5, 1.8); x.lineTo(4.5, -1.8); x.stroke(); x.beginPath(); x.moveTo(0, 0); x.lineTo(-2, 4); x.lineTo(2, 4); x.closePath(); x.fill(); }
    else { x.beginPath(); x.arc(-2, 0, 1.3, 0, 7); x.arc(2.4, 0, 1.3, 0, 7); x.fill(); }
    x.restore();
  },
  malStern(px, py, r, an){
    x.beginPath(); for (let k = 0; k < 10; k++) { const rr2 = k % 2 ? r * .45 : r; x.lineTo(px + Math.cos(k * Math.PI / 5 - Math.PI / 2) * rr2, py + Math.sin(k * Math.PI / 5 - Math.PI / 2) * rr2); } x.closePath();
    x.fillStyle = an ? '#FFC72C' : '#E3D6BF'; x.fill(); x.strokeStyle = an ? '#A8740A' : '#C9B89A'; x.lineWidth = 1; x.lineJoin = 'round'; x.stroke();
  },
  malAuswahl(zeit){
    const t = ease.aus(Math.min(1, (this.auswahlZeit || 0) / .3));
    x.fillStyle = `rgba(30,15,5,${.5 * t})`; x.fillRect(0, 0, W, H);
    x.save(); x.translate(0, (1 - t) * 30); x.globalAlpha = t;
    schatten(18, 8); x.fillStyle = linear(0, 76, 0, 470, [[0, '#FFFBF2'], [1, '#FFEFD0']]); rr(18, 78, 324, 392, 24); x.fill(); ohneSchatten();
    x.strokeStyle = F.gold; x.lineWidth = 3; x.stroke();
    text('Level wählen', 180, 106, { gr: 22, farbe: F.braun, schrift: 'Fraunces' });
    const seiten = this.auswahlSeiten(), sei = klemm(this.auswahlSeite || 0, 0, seiten - 1);
    if (seiten > 1) for (const [bx, r2, an] of [[45, -1, sei > 0], [315, 1, sei < seiten - 1]]) {
      x.fillStyle = an ? linear(0, 92, 0, 122, [[0, '#FFD95A'], [1, '#F2B400']]) : '#EFE5D3'; x.beginPath(); x.arc(bx, 107, 16, 0, 7); x.fill();
      x.strokeStyle = an ? '#B98200' : '#DCCDB4'; x.lineWidth = 1.5; x.stroke();
      x.strokeStyle = an ? F.braun : '#B9A98F'; x.lineWidth = 2.6; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(bx - r2 * 3, 100); x.lineTo(bx + r2 * 4, 107); x.lineTo(bx - r2 * 3, 114); x.stroke();
    }
    const st = schl_sterneLesen(); let summe = 0; for (const k in st) summe += st[k];
    { const t3 = `${summe} ${summe === 1 ? 'Stern' : 'Sterne'} gesammelt`; x.font = '800 12.5px "Plus Jakarta Sans", system-ui, sans-serif'; const w3 = x.measureText(t3).width; this.malStern(180 - w3 / 2 - 4, 130, 7, true); text(t3, 180 + 8, 130.5, { gr: 12.5, farbe: F.goldDunkel, schat: false }); }
    for (const k of this.auswahlKacheln()) {
      const aktiv = k.n === this.level;
      if (k.offen) {
        x.fillStyle = aktiv ? '#FFF1C2' : '#FFFFFF'; rr(k.x, k.y, k.w, k.h, 14); x.fill();
        x.strokeStyle = aktiv ? '#E0A526' : '#EADBC0'; x.lineWidth = aktiv ? 3 : 2; x.stroke();
        text(String(k.n), k.x + k.w / 2, k.y + 23, { gr: 20, farbe: F.braun, schrift: 'Fraunces', schat: false });
        { const zs = this.levelZeichen(k.n); zs.forEach((z, i) => this.malZeichen(z, zs.length > 1 && i === 0 ? k.x + 11 : k.x + k.w - 11, k.y + 11)); }
        for (let i = 0; i < 3; i++) this.malStern(k.x + k.w / 2 + (i - 1) * 15, k.y + 45 - (i === 1 ? 2 : 0), 6, i < k.st);
      } else {
        x.fillStyle = '#EDE3D2'; rr(k.x, k.y, k.w, k.h, 14); x.fill(); x.strokeStyle = '#DCCDB4'; x.lineWidth = 2; x.stroke();
        { // Schloss
          const cx = k.x + k.w / 2, cy = k.y + 32;
          x.strokeStyle = '#9C8A70'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy - 6, 7, Math.PI, 0); x.stroke();
          x.fillStyle = '#B5A387'; rr(cx - 10, cy - 6, 20, 16, 4); x.fill(); x.fillStyle = '#7D6C55'; x.beginPath(); x.arc(cx, cy + 1, 2.4, 0, 7); x.fill();
        }
      }
    }
    for (const [bx, t2, gold] of [[33, 'Alle ab Level 1', false], [187, 'Zurück', true]]) {
      x.fillStyle = gold ? linear(0, 432, 0, 462, [[0, '#FFD95A'], [1, '#F2B400']]) : '#FFFFFF'; rr(bx, 432, 140, 30, 15); x.fill();
      x.strokeStyle = gold ? '#B98200' : '#EADBC0'; x.lineWidth = 1.5; x.stroke();
      text(t2, bx + 70, 447.5, { gr: 13, farbe: F.braun, schat: false });
    }
    x.restore();
  },
  runter(p){
    if (this.zustand === 'auswahl') { this.auswahlTipp(p); return; }
    const r = this.knopfRect;
    if (p.x >= r.x - 4 && p.x <= r.x + r.w + 4 && p.y >= r.y - 4 && p.y <= r.y + r.h + 4 && !this.ball && (this.zustand === 'spiel')) { this.auswahlOeffnen(); return; }
    if (this.ball || this.kugeln <= 0 || this.zustand !== 'spiel' || this.einflug < 1 || this.laden < 1) return;
    const nah = Math.hypot(p.x - SCHL_A.x, p.y - SCHL_A.y) < 62;
    this.ziehen = { start: { x: p.x, y: p.y }, nah, dx: 0, dy: 0 };
  },
  zieh(p){
    const z = this.ziehen; if (!z) return;
    let dx = z.nah ? p.x - SCHL_A.x : p.x - z.start.x, dy = z.nah ? p.y - SCHL_A.y : p.y - z.start.y;
    [z.dx, z.dy] = schl_klemmZug(dx, dy);
  },
  hoch(p){
    const z = this.ziehen; if (!z) return; this.zieh(p); this.ziehen = null;
    if (Math.hypot(z.dx, z.dy) < 16) return;
    this.ball = { x: SCHL_A.x + z.dx, y: SCHL_A.y + z.dy, vx: -z.dx * SCHL_K, vy: -z.dy * SCHL_K, t: 0, ruhe: 0, stoss: 0, quetsch: 0, spur: 0 };
    this.kugeln--; this.geschossen++; this.schnapp = 1;
    mehlWolke(SCHL_A.x, SCHL_A.y, 5);
  },
  taste(){},
  tick(dt){
    if (this.zustand === 'auswahl') { this.auswahlZeit = (this.auswahlZeit || 0) + dt; return; }
    this.zeit += dt; this.einflug = Math.min(1, this.einflug + dt * 1.8); this.laden = Math.min(1, this.laden + dt * 2.6); this.schnapp = Math.max(0, (this.schnapp || 0) - dt * 3);
    this.formenBewegen();
    for (const f of this.lv.formen) if (f.voll) f.fuell = Math.min(1, f.fuell + dt * 1.4);
    if (this.hinweisNeu) { this.hinweisNeu.z -= dt; if (this.hinweisNeu.z <= 0) this.hinweisNeu = null; }
    if (goldKommt() && this.zeit > this.goldZeit && this.zustand === 'spiel' && !this.ball && this.einflug >= 1 && this.lv.formen.filter((f) => !f.voll).length >= 2) this.goldSetzen();
    if (this.gold) { const g = this.gold; g.rest -= dt; g.y = g.y0 + Math.sin(this.zeit * 2.2) * 5; if (g.rest <= 0 && !(this.ball && g.rest > -1.5)) { mehlWolke(g.x, g.y, 6); this.gold = null; } }
    const b = this.ball;
    if (b) {
      // feste Schrittweite wie in der Prüfung, damit jeder Schuss genau so fliegt wie berechnet
      b.acc = (b.acc || 0) + dt;
      while (b.acc >= 1 / 120 && this.ball) {
        b.acc -= 1 / 120; b.px = b.x; b.py = b.y;
        schl_dyn(this.lv, this.zeit - b.acc); const f = schl_schritt(b, this.rechtecke, this.lv.formen, 1 / 120, this.lv);
        if (b.stoss > 0) { b.quetsch = Math.max(b.quetsch, b.stoss); b.qN = b.stossN; if (b.stoss > .3) mehlWolke(b.x, b.y, 3); b.stoss = 0; }
        if (f) this.treffer(f, b);
        // Goldform: reicht, sie im Flug zu treffen
        else if (this.ball && this.gold && Math.hypot(b.x - this.gold.x, b.y - this.gold.y - this.gold.h / 2) < 32) this.treffer(this.gold, b);
      }
      if (this.ball) {
        b.t += dt; b.quetsch = Math.max(0, b.quetsch - dt * 4);
        b.spur += dt; if (b.spur > .05 && Math.hypot(b.vx, b.vy) > 200) { b.spur = 0; teilchen(b.x, b.y, { n: 1, farben: ['rgba(255,250,238,.8)'], tempo: 10, groesse: [2, 4], schwer: -20, leben: [.3, .5] }); }
        const langsam = Math.hypot(b.vx, b.vy) < 30 && b.kontakt;
        b.ruhe = langsam ? b.ruhe + dt : 0;
        if (b.x > W + 30 || b.ruhe > .4 || b.t > 6) this.daneben(b);
      }
    }
    if (this.zustand === 'spiel') {
      if (this.lv.formen.every((f) => f.voll) && !this.ball) this.geschafft();
      else if (!this.ball && this.kugeln <= 0) { this.zustand = 'aus'; this.uhr = 0; brumm(70); }
    } else if (this.zustand === 'fertig') {
      this.uhr += dt;
      // nächstes Level schon während der Feier bauen (ein Versuch pro Bild, damit nichts ruckelt)
      if (!this.naechstes && !this.einzel) this.naechstes = { nr: this.level + 1, v: 0, lv: null };
      if (this.naechstes && !this.naechstes.lv && this.naechstes.v < 60) { const v = this.naechstes.v++; this.naechstes.lv = this.baueLevel(this.level + 1, Math.floor(v / 15), v); }
      if (this.restBonus > 0 && this.uhr > .9 + (this.restGezaehlt || 0) * .22) { this.restGezaehlt = (this.restGezaehlt || 0) + 1; this.restBonus--; this.punkteN += 30; schwebText('+30', 300 - this.restGezaehlt * 18, 300, F.goldDunkel, 18); teilchen(300 - this.restGezaehlt * 18, 300, { n: 8, form: 'stern' }); }
      if (this.uhr > 2.6 + (this.restGezaehlt || 0) * .22) {
        if (this.einzel) { if (!this.endeGerufen) { this.endeGerufen = true; this.zustand = 'ende'; ende(this.punkteN, `Level ${this.level} geschafft mit ${this.levelSterne} ${this.levelSterne === 1 ? 'Stern' : 'Sternen'}.`); } return; }
        const weiter = () => this.neuesLevel();
        if (this.level % 3 === 0) { this.neuesLevel(); frage((ok) => { if (ok) { this.punkteN += 80; schwebText('+80 Bonus', 180, 220, F.gruen, 24); teilchen(180, 220, { n: 26, form: 'stern', oben: 100 }); } }); }
        else weiter();
      }
    } else if (this.zustand === 'aus') {
      this.uhr += dt;
      if (this.uhr > .9 && !this.endeGerufen) { this.endeGerufen = true; ende(this.punkteN, this.einzel ? `Level ${this.level} nicht geschafft. Versuch es gleich nochmal.` : `Level ${this.level} erreicht und ${this.sterne} ${this.sterne === 1 ? 'Stern' : 'Sterne'} gesammelt.`); }
    }
    const k = this.kugeln + (this.ball ? 1 : 0);
    setHud([{ icon: 'punkte', text: this.punkteN.toLocaleString('de-DE') }, { icon: 'korn', text: `${k} ${k === 1 ? 'Kugel' : 'Kugeln'}` }]);
  },
  /** Goldform: schwebt an einer freien Stelle, bleibt 7 s; im Flug treffen genügt */
  goldSetzen(){
    // Raster freier Stellen (die festen Plätze lagen oft zu nah an den Formen)
    const kandidaten = [];
    for (let gx = 140; gx <= 320; gx += 30) for (let gy = 110; gy <= 290; gy += 30) kandidaten.push([gx, gy]);
    kandidaten.sort(() => Math.random() - .5);
    for (const [gx, gy] of kandidaten) {
      const g = { art: 'kasten', gold: true, x: gx, x0: gx, y: gy, y0: gy, w: 54, h: 22, voll: false, fuell: 0, rest: 7 };
      const r = { x: gx - 40, y: gy - 50, w: 80, h: 90 };
      const stoert = this.lv.formen.some((f) => Math.abs(f.x - gx) < 70 && Math.abs(f.y - gy) < 80) || this.rechtecke.some((q) => q.x < r.x + r.w && r.x < q.x + q.w && q.y < r.y + r.h && r.y < q.y + q.h);
      if (stoert) continue;
      this.gold = g; goldErschienen(); return;
    }
    this.goldZeit = this.zeit + 4; // später nochmal versuchen
  },
  goldForm(f, zeit){
    const a = f.rest < 1 ? Math.max(0, f.rest) : 1, l = f.x - f.w / 2, o = f.y;
    x.globalAlpha = a;
    goldGlanz(f.x, o + f.h / 2, 24, zeit);
    // kleine Flügel aus Teig, damit sie schwebt
    for (const s2 of [-1, 1]) { x.save(); x.translate(f.x + s2 * (f.w / 2 + 4), o + 6); x.rotate(s2 * (.3 + Math.sin(zeit * 14) * .35)); x.fillStyle = 'rgba(255,248,226,.95)'; x.strokeStyle = 'rgba(160,110,30,.55)'; x.lineWidth = 1; x.beginPath(); x.ellipse(s2 * 9, -4, 11, 5, s2 * -.4, 0, 7); x.fill(); x.stroke(); x.restore(); }
    x.beginPath(); x.moveTo(l, o); x.lineTo(l + f.w, o); x.lineTo(l + f.w - 6, o + f.h); x.lineTo(l + 6, o + f.h); x.closePath();
    x.fillStyle = linear(l, 0, l + f.w, 0, [[0, '#C98A00'], [.22, '#FFF1B8'], [.45, '#FFC72C'], [.75, '#E0A526'], [1, '#8A5A0A']]); x.fill();
    x.strokeStyle = '#7A4E06'; x.lineWidth = 1.4; x.stroke();
    x.fillStyle = linear(0, o - 3, 0, o + 3, [[0, '#FFF6D0'], [1, '#C98A00']]); rr(l - 2, o - 3, f.w + 4, 6, 3); x.fill();
    x.fillStyle = '#6B4400'; x.beginPath(); x.ellipse(f.x, o, f.w / 2 - 3, 2, 0, 0, 7); x.fill();
    // Restzeit als Ring
    x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 3; x.beginPath(); x.arc(f.x, o - 22, 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * klemm(f.rest / 7, 0, 1)); x.stroke();
    x.strokeStyle = 'rgba(122,78,6,.6)'; x.lineWidth = 1; x.beginPath(); x.arc(f.x, o - 22, 9, 0, 7); x.stroke();
    x.globalAlpha = 1;
  },
  treffer(f, b){
    if (f.gold) { // Goldform: Kugel kommt zurück, kleine Extra-Punkte
      this.ball = null; this.gold = null; this.kugeln++; this.geschossen--; this.punkteN += 50;
      goldGefangen(f.x, f.y); schwebText('+50', f.x, f.y - 30, F.goldDunkel, 22); schwebText('Kugel zurück', f.x, f.y - 54, F.braun, 14); return;
    }
    statPlus('formen');
    f.voll = true; f.fuell = 0; f.trefferZeit = this.zeit; this.ball = null; brumm(25);
    this.lauf++;
    let p = 50; const bande = (b.abprall || 0) > 0;
    if (bande) p += 25;
    this.punkteN += p;
    teilchen(f.x, f.y - 4, { n: 22, form: 'stern', oben: 140, tempo: 170 }); mehlWolke(f.x, f.y, 8);
    schwebText(`+${p}`, f.x, f.y - 30, F.goldDunkel, 22);
    if (bande) schwebText('Bande!', f.x, f.y - 56, F.braun, 15);
    else if (this.lauf >= 2) schwebText(this.lauf >= 3 ? 'Perfekt!' : 'Super!', f.x, f.y - 56, F.braun, 15);
    blitz(.12, '255,240,200');
  },
  daneben(b){
    this.ball = null; this.lauf = 0;
    mehlWolke(klemm(b.x, 10, W - 10), b.y, 6);
  },
  geschafft(){
    this.zustand = 'fertig'; this.uhr = 0; this.restGezaehlt = 0; this.restBonus = this.kugeln;
    const n = this.geschossen <= 3 ? 3 : this.geschossen === 4 ? 2 : 1; this.levelSterne = n; this.sterne += n;
    schl_sterneSetzen(this.level, this.gemuetlich ? 1 : n); brumm(30); statPlus('sterne', n);
    for (let i = 0; i < 3; i++) setTimeout(() => { if (i < n && this.zustand === 'fertig') teilchen(180 + (i - 1) * 50, 200, { n: 14, form: 'stern', tempo: 160 }); }, 250 + i * 220);
  },
  testZug(){
    if (this.zustand !== 'spiel' || this.ball || this.einflug < 1 || this.laden < 1) return { x: 20, y: 30, warte: 300 };
    const formen = this.lv.formen;
    const t = schl_pruefe(this.lv, formen, this.zeit + .3); schl_dyn(this.lv, this.zeit);
    let wahl = null;
    for (let i = 0; i < formen.length; i++) if (!formen[i].voll && t[i].length) { wahl = t[i][Math.floor(t[i].length / 2)]; if (!formen[i].bahn && !formen[i].wippe) break; }
    if (!wahl && this.lv.neu) return { x: 20, y: 30, warte: 250 }; // auf einen besseren Moment warten
    if (!wahl) wahl = { dx: -60, dy: 40 };
    return { zieh: true, x: SCHL_A.x, y: SCHL_A.y, zx: SCHL_A.x + wahl.dx, zy: SCHL_A.y + wahl.dy, warte: 2200 };
  },

  // ── Zeichnen ──
  kugel(px, py, { sx = 1, sy = 1, rot = 0, a = 1 } = {}){
    x.save(); x.translate(px, py); x.rotate(rot); x.scale(sx, sy); x.globalAlpha = a;
    x.fillStyle = 'rgba(120,80,30,.25)'; x.beginPath(); x.arc(.8, 1.4, SCHL_R, 0, 7); x.fill();
    x.fillStyle = radial(0, 0, 1, SCHL_R + 1, [[0, '#FFF8E6'], [.55, '#F6E1B2'], [1, '#D9B373']], -3.5, -4); x.beginPath(); x.arc(0, 0, SCHL_R, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.ellipse(-3.6, -4.4, 3.2, 2, -.6, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.55)'; for (const [a, c] of [[3, -2], [-1, 4], [5, 3], [-5, 1]]) { x.beginPath(); x.arc(a, c, .9, 0, 7); x.fill(); }
    x.restore();
  },
  form(f, zeit, aufWippe){
    const { w, h } = f, l = f.x - w / 2, o = f.y;
    if (f.gold) { this.goldForm(f, zeit); return; }
    // Schatten auf dem Brett
    if (!aufWippe) bodenSchatten(f.x + 3, o + h + 1, w * .55, 4, .35);
    if (f.voll) {
      const t = ease.feder(Math.min(1, f.fuell * 1.4)), back = klemm((f.fuell - .35) / .65, 0, 1);
      const hoch = 4 + t * 14;
      // aufgegangener Teig, der langsam goldbraun wird
      x.save(); x.beginPath(); x.ellipse(f.x, o + 2, w / 2 - 1, hoch, 0, Math.PI, 0); x.closePath();
      x.fillStyle = radial(f.x, o + 2, 2, w / 2, [[0, '#FFF6DE'], [.7, '#F4DCA8'], [1, '#E2BC78']], f.x - w * .15, o - hoch * .6); x.fill();
      x.globalAlpha = back; x.fillStyle = radial(f.x, o + 2, 2, w / 2, [[0, '#EBB66C'], [.6, '#C98438'], [1, '#93561F']], f.x - w * .15, o - hoch * .6); x.fill();
      if (back > .5) { x.strokeStyle = `rgba(255,226,170,${(back - .5) * 1.6})`; x.lineWidth = 2.4; x.lineCap = 'round'; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(f.x + i * 12 - 5, o - hoch * .35); x.quadraticCurveTo(f.x + i * 12, o - hoch * .7, f.x + i * 12 + 5, o - hoch * .4); x.stroke(); } }
      x.globalAlpha = 1; x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(f.x - w * .16, o - hoch * .55, w * .12, hoch * .2, -.3, 0, 7); x.fill();
      x.restore();
    }
    if (f.art === 'kasten') {
      // Kastenform aus Blech
      x.beginPath(); x.moveTo(l, o); x.lineTo(l + w, o); x.lineTo(l + w - 6, o + h); x.lineTo(l + 6, o + h); x.closePath();
      x.fillStyle = linear(l, 0, l + w, 0, [[0, '#6E7782'], [.18, '#C9D1D9'], [.32, '#9AA6B2'], [.7, '#7D8894'], [.86, '#B7C0C9'], [1, '#59626C']]); x.fill();
      x.fillStyle = linear(0, o, 0, o + h, [[0, 'rgba(255,255,255,.12)'], [1, 'rgba(0,0,0,.22)']]); x.fill();
      x.strokeStyle = 'rgba(40,45,55,.5)'; x.lineWidth = 1; x.stroke();
      x.fillStyle = linear(0, o - 3, 0, o + 3, [[0, '#EEF2F5'], [1, '#8C97A3']]); rr(l - 2, o - 3, w + 4, 6, 3); x.fill();
      if (!f.voll) { x.fillStyle = '#3B424B'; x.beginPath(); x.ellipse(f.x, o, w / 2 - 3, 2, 0, 0, 7); x.fill(); }
    } else {
      // Brotkorb aus Weide mit Leinentuch
      x.save(); x.beginPath(); x.moveTo(l, o); x.lineTo(l + w, o); x.quadraticCurveTo(l + w - 2, o + h, l + w - 10, o + h); x.lineTo(l + 10, o + h); x.quadraticCurveTo(l + 2, o + h, l, o); x.closePath();
      x.fillStyle = linear(0, o, 0, o + h, [[0, '#C98E4E'], [1, '#8A5524']]); x.fill(); x.clip();
      for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) { const px = l + k * 8 + (r % 2) * 4 - 2, py = o + 3 + r * 6.5; x.fillStyle = 'rgba(255,220,160,.35)'; x.beginPath(); x.ellipse(px + 3, py + 2, 3.4, 2.2, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(80,40,10,.3)'; x.fillRect(px, py + 4, 7, 1); }
      x.restore();
      x.fillStyle = linear(0, o - 4, 0, o + 4, [[0, '#E0AE6E'], [1, '#9A6430']]); rr(l - 2, o - 3, w + 4, 7, 3.5); x.fill();
      for (let k = 0; k < 8; k++) { x.strokeStyle = 'rgba(90,50,15,.45)'; x.lineWidth = 1; x.beginPath(); x.moveTo(l + 2 + k * 8, o - 3); x.lineTo(l + 6 + k * 8, o + 4); x.stroke(); }
      if (!f.voll) { x.fillStyle = '#5A3216'; x.beginPath(); x.ellipse(f.x, o, w / 2 - 4, 2, 0, 0, 7); x.fill(); }
      // Leinentuch mit rotem Streifen hängt vorne über
      x.fillStyle = '#FBF5E8'; x.beginPath(); x.moveTo(l + 8, o + 2); x.lineTo(l + 26, o + 2); x.lineTo(l + 20, o + 15); x.quadraticCurveTo(l + 14, o + 18, l + 10, o + 12); x.closePath(); x.fill();
      x.fillStyle = '#C8453A'; x.fillRect(l + 10, o + 6, 13, 1.6);
    }
    // Ziel-Hinweis über offenen Formen
    if (!f.voll && !aufWippe) {
      const hb = Math.sin(zeit * 4 + f.x) * 3, py = o - 22 + hb;
      x.fillStyle = radial(f.x, o - 2, 2, w * .6, [[0, `rgba(255,214,90,${.28 + Math.sin(zeit * 4) * .08})`], [1, 'rgba(255,214,90,0)']]); x.beginPath(); x.ellipse(f.x, o - 2, w * .6, 14, 0, 0, 7); x.fill();
      x.fillStyle = F.gold; x.strokeStyle = F.braun; x.lineWidth = 1.6; x.beginPath(); x.moveTo(f.x - 7, py - 5); x.lineTo(f.x + 7, py - 5); x.lineTo(f.x, py + 3); x.closePath(); x.fill(); x.stroke();
    } else if (this.zeit - f.trefferZeit < 1.2) {
      const a = 1 - (this.zeit - f.trefferZeit) / 1.2; x.fillStyle = `rgba(255,248,220,${a})`;
      for (let i = 0; i < 5; i++) { const w2 = this.zeit * 3 + i * 1.26, r = 22 + (1 - a) * 14; x.save(); x.translate(f.x + Math.cos(w2) * r, o - 8 + Math.sin(w2) * r * .5); x.rotate(w2); x.beginPath(); for (let k = 0; k < 8; k++) { const rr2 = k % 2 ? 1.2 : 4; x.lineTo(Math.cos(k * Math.PI / 4) * rr2, Math.sin(k * Math.PI / 4) * rr2); } x.fill(); x.restore(); }
    }
  },
  plattform(p, f){
    if (p.art === 'wippe') {
      // Ständer aus Edelstahl mit Fuß
      const fx = p.cx, top = p.cy + 2;
      bodenSchatten(fx + 3, SCHL_BODEN, 26, 4, .35);
      x.fillStyle = linear(fx - 4, 0, fx + 4, 0, [[0, '#EEF2F5'], [.5, '#B5BEC7'], [1, '#6E7984']]); rr(fx - 3.5, top, 7, SCHL_BODEN - top - 8, 2); x.fill();
      x.strokeStyle = '#7E8994'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(fx, SCHL_BODEN - 16); x.lineTo(fx - 20, SCHL_BODEN - 3); x.moveTo(fx, SCHL_BODEN - 16); x.lineTo(fx + 20, SCHL_BODEN - 3); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(fx - 1, SCHL_BODEN - 17); x.lineTo(fx - 20, SCHL_BODEN - 5); x.stroke();
      for (const s2 of [-1, 1]) { x.fillStyle = '#2E2B29'; rr(fx + s2 * 20 - 4, SCHL_BODEN - 4, 8, 4, 2); x.fill(); }
      return;
    }
    if (p.art === 'wagen') {
      // Rollwagen aus Edelstahl
      for (const lx of [p.x + 4, p.x + p.w - 9]) { x.fillStyle = linear(lx, 0, lx + 5, 0, [[0, '#E6EBEF'], [1, '#7E8994']]); x.fillRect(lx, p.y + 8, 5, SCHL_BODEN - p.y - 14); }
      x.fillStyle = linear(0, 0, 0, 1, [[0, '#9AA6B2'], [1, '#6F7A86']]); x.fillRect(p.x + 4, SCHL_BODEN - 26, p.w - 8, 3);
      for (const lx of [p.x + 6.5, p.x + p.w - 6.5]) { x.fillStyle = '#2E2B29'; x.beginPath(); x.arc(lx, SCHL_BODEN - 5, 5, 0, 7); x.fill(); x.fillStyle = '#8B8F93'; x.beginPath(); x.arc(lx, SCHL_BODEN - 5, 2, 0, 7); x.fill(); }
      x.fillStyle = linear(0, p.y, 0, p.y + 10, [[0, '#F2F5F7'], [.4, '#B9C2CA'], [1, '#76818C']]); rr(p.x, p.y, p.w, 10, 3); x.fill();
      x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(p.x + 3, p.y + 1, p.w - 6, 1.2);
      return;
    }
    if (p.art === 'schiene') {
      holz(p.x, p.y, p.w, 10, 4);
      x.fillStyle = '#5E6873'; x.fillRect(p.x + 6, p.y - 2, p.w - 12, 2.4); x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(p.x + 6, p.y - 2, p.w - 12, .8);
      for (const ex of [p.x + 6, p.x + p.w - 10]) { x.fillStyle = '#4B2A14'; rr(ex, p.y - 6, 4, 6, 1.5); x.fill(); }
    } else holz(p.x, p.y, p.w, 10, 4);
    // Winkel an der Wand
    for (const ex of [p.x + 10, p.x + p.w - 18]) { x.fillStyle = 'rgba(40,30,25,.18)'; x.beginPath(); x.moveTo(ex + 2, p.y + 12); x.lineTo(ex + 10, p.y + 12); x.lineTo(ex + 2, p.y + 28); x.closePath(); x.fill(); x.fillStyle = '#4A4440'; x.beginPath(); x.moveTo(ex, p.y + 10); x.lineTo(ex + 8, p.y + 10); x.lineTo(ex, p.y + 25); x.closePath(); x.fill(); }
  },
  /** Wackelndes Blech mit Form darauf (gedreht um den Drehpunkt) */
  wippe(p, zeit){
    const f = this.lv.formen[p.form];
    x.save(); x.translate(p.cx, p.cy); x.rotate(p.rot || 0);
    // Blech
    x.fillStyle = 'rgba(40,30,20,.18)'; rr(-SCHL_WIPPE_LEN / 2 + 2, 1, SCHL_WIPPE_LEN, 4, 2); x.fill();
    x.fillStyle = linear(0, -6, 0, 0, [[0, '#F2F5F7'], [.45, '#B9C2CA'], [1, '#6E7984']]); rr(-SCHL_WIPPE_LEN / 2, -6, SCHL_WIPPE_LEN, 6, 2); x.fill();
    for (const s2 of [-1, 1]) { x.fillStyle = linear(0, -11, 0, 0, [[0, '#E6EBEF'], [1, '#7E8994']]); rr(s2 * SCHL_WIPPE_LEN / 2 - (s2 > 0 ? 3 : 0), -11, 3, 11, 1.2); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(-SCHL_WIPPE_LEN / 2 + 3, -5.5, SCHL_WIPPE_LEN - 6, 1);
    x.restore();
    // Form mit dem Blech gedreht
    x.save(); x.translate(f.x, f.y); x.rotate(f.rot || 0); x.translate(-f.x, -f.y); this.form(f, zeit, true); x.restore();
    // Drehpunkt
    x.fillStyle = radial(p.cx, p.cy, 1, 7, [[0, '#FFF1B8'], [.6, '#E0A526'], [1, '#8A5A0A']], p.cx - 2, p.cy - 2); x.beginPath(); x.arc(p.cx, p.cy, 6, 0, 7); x.fill();
    x.fillStyle = '#5A3A0A'; x.beginPath(); x.arc(p.cx, p.cy, 1.8, 0, 7); x.fill();
    // Zielpfeil bleibt aufrecht über der Form
    if (!f.voll) { const hb = Math.sin(zeit * 4 + f.x) * 3, py = f.y - 24 + hb; x.fillStyle = F.gold; x.strokeStyle = F.braun; x.lineWidth = 1.6; x.beginPath(); x.moveTo(f.x - 7, py - 5); x.lineTo(f.x + 7, py - 5); x.lineTo(f.x, py + 3); x.closePath(); x.fill(); x.stroke(); }
  },
  /** Ventilator: Seite (an der Wand) oder Boden-Gebläse, Rotor dreht nach Stärke */
  luefter(l, zeit){
    l.dreh = (l.dreh || 0) + (l.s || 0) * .55 + .01;
    const an = (l.s || 0) > .5;
    if (l.art === 'boden') {
      const bx = l.x - 34, by = SCHL_BODEN - 24;
      bodenSchatten(l.x + 3, SCHL_BODEN, 38, 5, .4);
      x.fillStyle = linear(0, by, 0, by + 24, [[0, '#E9EDF0'], [.5, '#A7B1BA'], [1, '#6E7984']]); rr(bx, by, 68, 22, 5); x.fill();
      x.save(); rr(bx + 6, by + 3, 56, 10, 3); x.clip(); x.fillStyle = '#2A2F35'; x.fillRect(bx, by, 68, 16);
      for (let i = 0; i < 4; i++) { const a = l.dreh + i * Math.PI / 2, w2 = Math.cos(a) * 24; x.fillStyle = 'rgba(160,170,180,.85)'; x.beginPath(); x.ellipse(l.x + w2 * .5, by + 8, Math.abs(w2) * .5 + 1.5, 4, 0, 0, 7); x.fill(); }
      x.restore();
      x.strokeStyle = 'rgba(230,236,240,.95)'; x.lineWidth = 1.4; for (let k = 0; k < 9; k++) { x.beginPath(); x.moveTo(bx + 8 + k * 6.5, by + 3); x.lineTo(bx + 8 + k * 6.5, by + 13); x.stroke(); }
      x.fillStyle = an ? '#5BD46A' : '#B4433A'; x.beginPath(); x.arc(bx + 60, by + 17.5, 2.2, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(bx + 4, by + 1, 60, 1.2);
      return;
    }
    const d = l.dir, cx = l.x, cy = l.y;
    // Halter an der Wand
    x.fillStyle = '#5E5650'; rr(cx - d * 16 - 5, cy - 9, 10, 18, 3); x.fill();
    x.strokeStyle = '#7E8994'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - d * 14, cy); x.lineTo(cx - d * 6, cy); x.stroke();
    // Motor
    x.fillStyle = linear(0, cy - 10, 0, cy + 10, [[0, '#F0F3F6'], [1, '#7E8994']]); rr(cx - d * 8 - 6, cy - 9, 12, 18, 5); x.fill();
    // Rotor (von der Seite: Blätter wandern auf und ab)
    for (let i = 0; i < 3; i++) { const a = l.dreh + i * 2.094, yy = Math.sin(a) * 19, tief = Math.cos(a); x.fillStyle = tief > 0 ? 'rgba(98,150,200,.95)' : 'rgba(70,112,155,.9)'; x.beginPath(); x.ellipse(cx + d * 1, cy + yy, 3.6, 7 + 3.5 * Math.abs(tief), 0, 0, 7); x.fill(); }
    x.fillStyle = '#E0A526'; x.beginPath(); x.ellipse(cx + d * 2, cy, 2.6, 4.5, 0, 0, 7); x.fill();
    if ((l.s || 0) > .4) { x.fillStyle = `rgba(200,210,220,${.25 * l.s})`; x.beginPath(); x.ellipse(cx + d, cy, 4, 24, 0, 0, 7); x.fill(); }
    // Schutzgitter
    x.strokeStyle = 'rgba(60,66,76,.95)'; x.lineWidth = 2.4; x.beginPath(); x.ellipse(cx, cy, 10, 28, 0, 0, 7); x.stroke();
    x.strokeStyle = 'rgba(120,130,140,.7)'; x.lineWidth = 1; for (const k of [-4.5, 0, 4.5]) { x.beginPath(); x.ellipse(cx + k * .3, cy, Math.max(1, 9 - Math.abs(k) * 1.3), 27, 0, 0, 7); x.stroke(); }
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(cx - 1, cy, 8, 26, 0, Math.PI * 1.1, Math.PI * 1.6); x.stroke();
    x.fillStyle = an ? '#5BD46A' : '#B4433A'; x.beginPath(); x.arc(cx - d * 8, cy + 6, 2, 0, 7); x.fill();
  },
  /** Luftlinien und Mehlstaub zeigen Richtung und Stärke */
  wind(l, zeit){
    const s2 = l.s || 0; if (s2 < .03) return;
    const z = schl_wind(l), hor = l.art !== 'boden';
    x.fillStyle = hor ? linear(z.x, 0, z.x + z.w, 0, z.ax < 0 ? [[0, 'rgba(120,170,220,0)'], [1, `rgba(120,170,220,${.3 * s2})`]] : [[0, `rgba(120,170,220,${.3 * s2})`], [1, 'rgba(120,170,220,0)']])
      : linear(0, z.y, 0, z.y + z.h, [[0, 'rgba(120,170,220,0)'], [1, `rgba(120,170,220,${.3 * s2})`]]);
    rr(z.x, z.y, z.w, z.h, 16); x.fill();
    const len = hor ? z.w : z.h, quer = hor ? z.h : z.w, tempo = 230 * s2 + 20;
    x.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const u = ((zeit * tempo + i * 53) % (len + 30)) - 15, q = (i + .5) / 9 * quer, wel = Math.sin(zeit * 6 + i) * 2.5, lg = 18 + (i % 3) * 7;
      const a = s2 * Math.min(1, u / 30, (len - u) / 30 + .2) * .8; if (a <= 0) continue;
      let x1, y1, x2, y2;
      if (hor) { const ux = z.ax < 0 ? z.x + z.w - u : z.x + u; x1 = ux; x2 = ux + (z.ax < 0 ? lg : -lg); y1 = y2 = z.y + q + wel; }
      else { const uy = z.y + z.h - u; y1 = uy; y2 = uy + lg; x1 = x2 = z.x + q + wel; }
      x.strokeStyle = `rgba(60,100,150,${a * .75})`; x.lineWidth = 4; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
      x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 1.8; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const u = ((zeit * tempo * 1.3 + i * 71) % len), q = schl_zf(i + l.x) * quer + Math.sin(zeit * 4 + i * 2) * 4;
      const px = hor ? (z.ax < 0 ? z.x + z.w - u : z.x + u) : z.x + q, py = hor ? z.y + q : z.y + z.h - u;
      x.globalAlpha = s2 * .9; x.fillStyle = '#FFFDF6'; x.beginPath(); x.arc(px, py, 1.8, 0, 7); x.fill(); x.strokeStyle = 'rgba(140,110,70,.35)'; x.lineWidth = .8; x.stroke(); x.globalAlpha = 1;
    }
  },
  hindernis(o){
    if (o.art === 'stikken') {
      // hoher Backwagen mit Blechen voller Brötchen
      const hh = SCHL_BODEN - o.y;
      bodenSchatten(o.x + o.w / 2 + 4, SCHL_BODEN, o.w * .6, 5, .35);
      for (let yy = o.y + 36; yy < SCHL_BODEN - 30; yy += 36) { for (let k = 0; k < 3; k++) brot('broetchen', o.x + 12 + k * 15, yy - 5, 13, 9, { schatten: false }); }
      for (let yy = o.y; yy < SCHL_BODEN - 30; yy += 36) { x.fillStyle = linear(0, yy, 0, yy + 5, [[0, '#EEF2F5'], [1, '#7E8994']]); rr(o.x, yy, o.w, 5, 2); x.fill(); }
      for (const lx of [o.x, o.x + o.w - 6]) { x.fillStyle = linear(lx, 0, lx + 6, 0, [[0, '#F0F3F6'], [.5, '#B5BEC7'], [1, '#6E7984']]); rr(lx, o.y - 2, 6, hh - 6, 2); x.fill(); }
      for (const lx of [o.x + 3, o.x + o.w - 3]) { x.fillStyle = '#2E2B29'; x.beginPath(); x.arc(lx, SCHL_BODEN - 5, 5, 0, 7); x.fill(); }
      return;
    }
    // hängendes Brett an Ketten mit Blechen
    x.strokeStyle = '#5B5450'; x.lineWidth = 2; x.setLineDash([3, 2]);
    for (const lx of [o.x + 7, o.x + o.w - 7]) { x.beginPath(); x.moveTo(lx, 16); x.lineTo(lx, o.y); x.stroke(); }
    x.setLineDash([]);
    for (let k = 0; k < 3; k++) { x.fillStyle = linear(0, o.y - 4 - k * 3, 0, o.y - k * 3, [[0, '#D9DFE4'], [1, '#7E8994']]); rr(o.x + 6 + k * 2, o.y - 3 - k * 3, o.w - 12 - k * 4, 3, 1); x.fill(); }
    holz(o.x, o.y, o.w, 9, 3);
  },
  schleuder(teil){
    const gx = SCHL_A.x;
    if (teil === 'hinten') {
      bodenSchatten(gx + 4, SCHL_BODEN, 30, 6, .4);
      // Ständer
      holz(gx - 22, SCHL_BODEN - 14, 44, 14, 4, '#8E5A2E', '#5E3A1C');
      x.lineCap = 'round';
      const ast = (x1, y1, x2, y2, br) => { x.strokeStyle = '#5E3A1C'; x.lineWidth = br + 2; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); x.strokeStyle = linear(x1 - br, 0, x1 + br, 0, [[0, '#C68A52'], [1, '#7C5128']]); x.lineWidth = br; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); x.strokeStyle = 'rgba(255,225,180,.45)'; x.lineWidth = 2; x.beginPath(); x.moveTo(x1 - br * .25, y1); x.lineTo(x2 - br * .25, y2); x.stroke(); };
      ast(gx, SCHL_BODEN - 12, gx, SCHL_A.y + 40, 11);
      ast(gx, SCHL_A.y + 42, gx - 15, SCHL_A.y - 8, 9);
      x.fillStyle = '#7C5128'; x.beginPath(); x.arc(gx, SCHL_A.y + 40, 8, 0, 7); x.fill();
      // hinteres Band
      const k = this.bandPunkt();
      this.band(gx - 15, SCHL_A.y - 4, k.x, k.y);
    } else {
      const k = this.bandPunkt();
      x.lineCap = 'round';
      x.strokeStyle = '#5E3A1C'; x.lineWidth = 11; x.beginPath(); x.moveTo(gx, SCHL_A.y + 42); x.lineTo(gx + 15, SCHL_A.y - 8); x.stroke();
      x.strokeStyle = linear(gx, 0, gx + 15, 0, [[0, '#C68A52'], [1, '#8A5A2E']]); x.lineWidth = 9; x.beginPath(); x.moveTo(gx, SCHL_A.y + 42); x.lineTo(gx + 15, SCHL_A.y - 8); x.stroke();
      x.strokeStyle = 'rgba(255,225,180,.45)'; x.lineWidth = 2; x.beginPath(); x.moveTo(gx - 2, SCHL_A.y + 40); x.lineTo(gx + 13, SCHL_A.y - 8); x.stroke();
      // Umwicklung an den Spitzen
      for (const [sx, sy] of [[gx - 15, SCHL_A.y - 4], [gx + 15, SCHL_A.y - 4]]) { x.fillStyle = '#6B2A1E'; rr(sx - 6, sy - 7, 12, 10, 3); x.fill(); x.strokeStyle = 'rgba(255,200,170,.35)'; x.lineWidth = 1; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(sx - 6, sy - 5 + i * 3); x.lineTo(sx + 6, sy - 4 + i * 3); x.stroke(); } }
      this.band(gx + 15, SCHL_A.y - 4, k.x, k.y);
      // Leder-Schlaufe
      if (this.ziehen || (!this.ball && this.kugeln > 0)) { x.fillStyle = '#5A2E18'; rr(k.x - 6, k.y - 3, 12, 7, 3); x.fill(); }
    }
  },
  bandPunkt(){
    const z = this.ziehen;
    if (z) return { x: SCHL_A.x + z.dx - 6, y: SCHL_A.y + z.dy + 2 };
    const s = this.schnapp || 0; // nach dem Schuss schwingt das Band nach
    return { x: SCHL_A.x + 8 + Math.sin(s * 18) * s * 14 - 6, y: SCHL_A.y + 2 };
  },
  band(x1, y1, x2, y2){
    x.lineCap = 'round'; x.strokeStyle = '#7A2318'; x.lineWidth = 4.5; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
    x.strokeStyle = 'rgba(255,150,120,.45)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(x1, y1 - 1); x.lineTo(x2, y2 - 1); x.stroke();
  },
  malen(zeit){
    const bild = this.bilder();
    x.drawImage(bild.hg, 0, 0, W, H);
    lampe(170, 16, 120, .16);
    // Hängelampe
    x.strokeStyle = '#3A2A1C'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(170, 16); x.lineTo(170, 34); x.stroke();
    x.fillStyle = linear(150, 0, 190, 0, [[0, '#3E4A3A'], [.4, '#6E7F66'], [1, '#2E382B']]); x.beginPath(); x.moveTo(160, 34); x.lineTo(180, 34); x.lineTo(192, 48); x.lineTo(148, 48); x.closePath(); x.fill();
    x.fillStyle = '#FFF1C2'; x.beginPath(); x.ellipse(170, 48, 12, 3, 0, 0, 7); x.fill();
    brot('brezel', 62, 224, 40, 28, { schatten: false });
    if (!this.lv) return;
    const ein = ease.aus(this.einflug ?? 1), dy = (1 - ein) * -36;
    x.save(); x.globalAlpha = ein; x.translate(0, dy);
    for (const o of this.lv.hindernisse) this.hindernis(o);
    for (const l of this.lv.luefter || []) this.luefter(l, zeit);
    for (const p of this.lv.plattformen) this.plattform(p);
    for (const f of this.lv.formen) if (!f.wippe) this.form(f, zeit);
    for (const p of this.lv.plattformen) if (p.art === 'wippe') this.wippe(p, zeit);
    for (const l of this.lv.luefter || []) this.wind(l, zeit);
    x.restore();
    if (this.gold) this.form(this.gold, zeit);
    // Schüssel mit den übrigen Kugeln
    const bx = 34, by = SCHL_BODEN;
    bodenSchatten(bx + 3, by, 30, 5, .35);
    const rest = Math.max(0, (this.kugeln || 0) - (this.ball || this.ziehen ? 0 : 1));
    for (let i = 0; i < Math.min(4, rest); i++) this.kugel(bx - 12 + (i % 3) * 12 + (i >= 3 ? 6 : 0), by - 22 - (i >= 3 ? 9 : 0), { sx: .9, sy: .9 });
    x.fillStyle = linear(bx - 26, 0, bx + 26, 0, [[0, '#E8E2D6'], [.35, '#FFFFFF'], [1, '#B5ADA0']]);
    x.beginPath(); x.moveTo(bx - 26, by - 20); x.lineTo(bx + 26, by - 20); x.quadraticCurveTo(bx + 24, by - 1, bx + 12, by - 1); x.lineTo(bx - 12, by - 1); x.quadraticCurveTo(bx - 24, by - 1, bx - 26, by - 20); x.closePath(); x.fill();
    x.fillStyle = '#5C86A8'; x.fillRect(bx - 24, by - 15, 48, 2.2);
    x.fillStyle = linear(0, by - 23, 0, by - 17, [[0, '#FFFFFF'], [1, '#CFC8BB']]); rr(bx - 28, by - 23, 56, 5, 2.5); x.fill();
    // Schleuder, Kugel, Vorschau
    this.schleuder('hinten');
    const z = this.ziehen;
    if (z) {
      const k = { x: SCHL_A.x + z.dx, y: SCHL_A.y + z.dy }, st = Math.hypot(z.dx, z.dy) / SCHL_MAX;
      this.kugel(k.x, k.y, { sx: 1 + st * .12, sy: 1 - st * .1, rot: Math.atan2(z.dy, z.dx) });
      if (st > .19) {
        const b = { x: k.x, y: k.y, vx: -z.dx * SCHL_K, vy: -z.dy * SCHL_K };
        const nP = this.gemuetlich ? 34 : 16; for (let i = 1; i <= nP; i++) { for (let s = 0; s < 4; s++) { b.vy += SCHL_G / 120; b.x += b.vx / 120; b.y += b.vy / 120; } if (i < 2) continue; const a = 1 - i / (nP + 1); x.fillStyle = `rgba(255,251,242,${.95 * a + .05})`; x.beginPath(); x.arc(b.x, b.y, Math.max(1.6, 4.4 - i * (2.6 / nP)), 0, 7); x.fill(); x.strokeStyle = `rgba(75,42,20,${.6 * a})`; x.lineWidth = 1.4; x.stroke(); }
      }
    } else if (!this.ball && (this.kugeln || 0) > 0 && this.zustand === 'spiel') {
      const l = ease.feder(this.laden ?? 1), atem = Math.sin(zeit * 3) * .03;
      this.kugel(SCHL_A.x, SCHL_A.y + (1 - l) * 18, { sx: (1 + atem) * l, sy: (1 - atem) * l });
    }
    this.schleuder('vorne');
    const b = this.ball;
    if (b) {
      const v = Math.hypot(b.vx, b.vy), st = Math.min(.28, v / 2400);
      let sx = 1 + st, sy = 1 - st * .8, rot = Math.atan2(b.vy, b.vx);
      if (b.quetsch > 0 && b.qN) { const q = b.quetsch * .35; rot = Math.atan2(b.qN[1], b.qN[0]); sx = 1 - q; sy = 1 + q * .8; }
      const a = klemm((b.acc || 0) * 120, 0, 1); this.kugel(lerp(b.px ?? b.x, b.x, a), lerp(b.py ?? b.y, b.y, a), { sx, sy, rot });
    }
    // Anleitung beim ersten Schuss
    if (this.level === 1 && this.geschossen === 0 && !z && this.zustand === 'spiel') {
      const t = (zeit % 1.8) / 1.8, e = ease.aus(Math.min(1, t / .6));
      const hx = SCHL_A.x - e * 46, hy = SCHL_A.y + e * 30;
      x.globalAlpha = t > .8 ? (1 - t) / .2 : 1;
      x.strokeStyle = 'rgba(255,251,242,.9)'; x.lineWidth = 2; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(SCHL_A.x, SCHL_A.y); x.lineTo(hx, hy); x.stroke(); x.setLineDash([]);
      x.fillStyle = '#FFFBF2'; x.strokeStyle = F.braun; x.lineWidth = 2; x.beginPath(); x.arc(hx, hy, 9, 0, 7); x.fill(); x.stroke();
      x.globalAlpha = 1;
      x.fillStyle = 'rgba(43,23,10,.75)'; rr(96, 252, 176, 34, 17); x.fill();
      text('Nach hinten ziehen', 184, 269, { gr: 14, farbe: '#FFF1C2', schat: false });
    }
    vignette(.24);
    if (this.zustand !== 'auswahl' && this.zustand !== 'ende') this.malKnopf();
    // Level-Anzeige beim Start eines Levels
    if (this.zustand === 'spiel' && this.einflug < 1 && this.level > 0) {
      const a = Math.sin(this.einflug * Math.PI);
      x.globalAlpha = a; x.fillStyle = 'rgba(43,23,10,.7)'; rr(120, 90, 120, 40, 20); x.fill(); text(`Level ${this.level}`, 180, 110, { gr: 20, farbe: '#FFE08A', schrift: 'Fraunces', schat: false }); x.globalAlpha = 1;
    }
    if (this.hinweisNeu && this.zustand === 'spiel') {
      const h2 = this.hinweisNeu, a = Math.min(1, h2.z / .4, (3.4 - h2.z) / .3);
      x.globalAlpha = klemm(a, 0, 1); x.font = '800 13.5px "Plus Jakarta Sans", system-ui, sans-serif'; const w = Math.min(330, x.measureText(h2.t).width + 30);
      x.fillStyle = 'rgba(43,23,10,.78)'; rr(180 - w / 2, 136, w, 30, 15); x.fill(); text(h2.t, 180, 151.5, { gr: 13.5, farbe: '#FFF1C2', schat: false }); x.globalAlpha = 1;
    }
    if (this.zustand === 'fertig') {
      const t = this.uhr, sk = t < .45 ? ease.feder(t / .45) : 1;
      x.save(); x.translate(180, 196); x.scale(sk, sk);
      schatten(16, 6); x.fillStyle = linear(0, -56, 0, 56, [[0, '#FFFBF2'], [1, '#FFEBC0']]); rr(-124, -58, 248, 116, 24); x.fill(); ohneSchatten();
      x.strokeStyle = F.gold; x.lineWidth = 3; x.stroke();
      text('Alle Formen voll!', 0, -32, { gr: 22, farbe: F.braun, schrift: 'Fraunces' });
      for (let i = 0; i < 3; i++) {
        const st = klemm((t - .25 - i * .22) / .3, 0, 1), an = i < this.levelSterne && st > 0, s = an ? ease.feder(st) : 1;
        x.save(); x.translate((i - 1) * 50, 10 - (i === 1 ? 6 : 0)); x.scale(s, s);
        x.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 8.5 : 20; x.lineTo(Math.cos(k * Math.PI / 5 - Math.PI / 2) * r, Math.sin(k * Math.PI / 5 - Math.PI / 2) * r); } x.closePath();
        x.fillStyle = an ? radial(0, 0, 2, 22, [[0, '#FFF3B0'], [.5, '#FFC72C'], [1, '#D99A00']], -5, -7) : '#E8DCC6'; x.fill();
        x.strokeStyle = an ? '#A8740A' : '#CDBDA0'; x.lineWidth = 2; x.lineJoin = 'round'; x.stroke();
        x.restore();
      }
      text(this.restBonus + (this.restGezaehlt || 0) > 0 ? `Übrige Kugeln: +${((this.restGezaehlt || 0) + this.restBonus) * 30}` : 'Keine Kugel übrig', 0, 42, { gr: 13, farbe: F.goldDunkel, schat: false });
      x.restore();
    }
    if (this.zustand === 'auswahl') this.malAuswahl(zeit);
  }
};
