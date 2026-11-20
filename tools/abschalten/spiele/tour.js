// ═══ Lieferwagen-Tour: Draufsicht auf eine Stadtstraße, drei Spuren, Ware zur nächsten Filiale bringen ═══
const TOUR_SPUR = [108, 180, 252];
const TOUR_Y = 384;            // Mitte des Lieferwagens auf dem Bildschirm
const TOUR_KACHEL = 960;       // Höhe der Straßen-Kachel (nahtlos)
const TOUR_AUTOFARBEN = ['#3E6FB5', '#C2453A', '#3F9A63', '#7C5CB8', '#ECE6DA', '#36424F', '#E08A2E'];

// ── kleine Zeichenhilfen für eigene Leinwände (Kontext g) ──
function tour_leinwand(w, h, malen){ const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2; const g = cv.getContext('2d'); g.scale(2, 2); malen(g); return cv; }
function tour_rr(g, px, py, w, h, r){ r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(px + r, py); g.arcTo(px + w, py, px + w, py + h, r); g.arcTo(px + w, py + h, px, py + h, r); g.arcTo(px, py + h, px, py, r); g.arcTo(px, py, px + w, py, r); g.closePath(); }
function tour_lin(g, x1, y1, x2, y2, st){ const v = g.createLinearGradient(x1, y1, x2, y2); st.forEach(([o, f]) => v.addColorStop(o, f)); return v; }
function tour_rad(g, px, py, r0, r1, st, ox, oy){ const v = g.createRadialGradient(ox ?? px, oy ?? py, r0, px, py, r1); st.forEach(([o, f]) => v.addColorStop(o, f)); return v; }
const tour_zf = (i) => { const s = Math.sin(i * 91.17 + 7.31) * 43758.5453; return s - Math.floor(s); };
function tour_schatten(g, blur, ox, oy, a){ g.shadowColor = `rgba(30,18,8,${a ?? .4})`; g.shadowBlur = blur * 2; g.shadowOffsetX = ox * 2; g.shadowOffsetY = oy * 2; }
function tour_ohne(g){ g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; }
function tour_hell(hex, k){ const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255; const f = (v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)); return `rgb(${f(r)},${f(gg)},${f(b)})`; }
/** Höhen-Verschiebung (Parallax): hohe Dinge am Rand wandern nach außen */
const tour_proj = (px, py, h) => [180 + (px - 180) * (1 + h), 300 + (py - 300) * (1 + h)];

// ── Hintergrund: Straße mit Gehwegen und Hausdächern, einmal gezeichnet ──
function tour_strasse(){
  return tour_leinwand(360, TOUR_KACHEL, (g) => {
    const K = TOUR_KACHEL;
    // Grund hinter den Häusern (Gärten, Höfe)
    g.fillStyle = '#8FB56C'; g.fillRect(0, 0, 360, K);
    for (let i = 0; i < 160; i++) { g.fillStyle = tour_zf(i) < .5 ? 'rgba(60,110,40,.25)' : 'rgba(200,230,150,.22)'; g.beginPath(); g.arc(tour_zf(i + 1) < .5 ? tour_zf(i + 2) * 44 : 316 + tour_zf(i + 2) * 44, tour_zf(i + 3) * K, 2 + tour_zf(i + 4) * 4, 0, 7); g.fill(); }
    // Häuser
    const dach = ['#B4513A', '#9C4431', '#5E6470', '#C0683F', '#7A4B35', '#A65A3E', '#6B717C'];
    for (const seite of [0, 1]) {
      let y = 4, i = seite * 31;
      while (y < K - 20) {
        let hh = 96 + Math.floor(tour_zf(i) * 80);
        const lueke = 8 + Math.floor(tour_zf(i + 5) * 14);
        if (K - (y + hh + lueke) < 90) hh = K - 4 - y - lueke;
        const farbe = dach[Math.floor(tour_zf(i + 9) * dach.length)];
        const x0 = seite ? 318 : -24, w = 66;
        // Hof in der Lücke
        if (tour_zf(i + 11) < .5) { g.fillStyle = '#B9AE9C'; g.fillRect(seite ? 318 : 0, y + hh, 42, lueke); }
        // Schatten des Hauses (Licht von oben links)
        tour_schatten(g, 6, 5, 6, .45); g.fillStyle = farbe; g.fillRect(x0, y, w, hh); tour_ohne(g);
        // Dach: zwei Flächen, First längs der Straße
        const first = seite ? 348 : 12;
        g.fillStyle = tour_lin(g, x0, 0, first, 0, [[0, tour_hell(farbe, .22)], [1, tour_hell(farbe, .08)]]); g.fillRect(x0, y, first - x0, hh);
        g.fillStyle = tour_lin(g, first, 0, x0 + w, 0, [[0, tour_hell(farbe, -.12)], [1, tour_hell(farbe, -.32)]]); g.fillRect(first, y, x0 + w - first, hh);
        // Ziegelreihen
        g.strokeStyle = 'rgba(40,15,5,.18)'; g.lineWidth = 1;
        for (let lx = x0 + 3; lx < x0 + w; lx += 4.5) { g.beginPath(); g.moveTo(lx, y); g.lineTo(lx, y + hh); g.stroke(); }
        g.fillStyle = 'rgba(40,15,5,.14)';
        for (let ly = y + 3, r = 0; ly < y + hh; ly += 6, r++) for (let lx = x0 + (r % 2) * 2.2; lx < x0 + w; lx += 4.5) g.fillRect(lx, ly, 3.2, 1);
        // First und Traufe
        g.fillStyle = 'rgba(255,240,220,.35)'; g.fillRect(first - 1, y, 2, hh);
        g.fillStyle = 'rgba(30,10,0,.35)'; g.fillRect(seite ? x0 : x0 + w - 2, y, 2, hh);
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x0, y, w, 1.5);
        // Schornstein oder Dachfenster
        if (tour_zf(i + 13) < .6) {
          const cy = y + 14 + tour_zf(i + 14) * (hh - 40), cx = seite ? 326 + tour_zf(i + 2) * 12 : 20 + tour_zf(i + 2) * 10;
          tour_schatten(g, 3, 3, 3, .45); g.fillStyle = '#8E5B45'; g.fillRect(cx, cy, 9, 9); tour_ohne(g);
          g.fillStyle = '#5A3526'; g.fillRect(cx + 2, cy + 2, 5, 5); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(cx, cy, 9, 1.5);
        } else {
          const cy = y + 18 + tour_zf(i + 15) * (hh - 46), cx = seite ? 324 : 22;
          g.fillStyle = tour_lin(g, cx, cy, cx + 12, cy + 16, [[0, '#BFD8EA'], [1, '#5F7F99']]); tour_rr(g, cx, cy, 12, 16, 2); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1; g.stroke();
        }
        y += hh + lueke; i += 3;
      }
    }
    // Gehwege
    for (const [gx, gw] of [[42, 26], [292, 26]]) {
      g.fillStyle = tour_lin(g, gx, 0, gx + gw, 0, [[0, '#D3C7B1'], [1, '#E2D8C5']]); g.fillRect(gx, 0, gw, K);
      for (let yy = 0; yy < K; yy += 13) for (let k = 0; k < 2; k++) { g.fillStyle = `rgba(${tour_zf(yy + k) < .5 ? '255,255,255' : '90,70,40'},${.05 + tour_zf(yy * 3 + k) * .07})`; g.fillRect(gx + k * 13 + .5, yy + .5, 12, 12); }
      g.strokeStyle = 'rgba(110,90,60,.28)'; g.lineWidth = .8;
      for (let yy = 0; yy < K; yy += 13) { g.beginPath(); g.moveTo(gx, yy); g.lineTo(gx + gw, yy); g.stroke(); }
      g.beginPath(); g.moveTo(gx + 13, 0); g.lineTo(gx + 13, K); g.stroke();
      // Schatten der Häuser auf dem Gehweg
      g.fillStyle = tour_lin(g, gx === 42 ? 42 : 292, 0, gx === 42 ? 52 : 302, 0, gx === 42 ? [[0, 'rgba(40,20,5,.22)'], [1, 'rgba(40,20,5,0)']] : [[0, 'rgba(40,20,5,0)'], [1, 'rgba(40,20,5,0)']]); g.fillRect(gx, 0, 10, K);
    }
    // Bordsteine
    for (const bx of [68, 288]) { g.fillStyle = '#F1EBDF'; g.fillRect(bx, 0, 4, K); g.fillStyle = 'rgba(60,40,20,.35)'; g.fillRect(bx === 68 ? 71 : 288, 0, 1, K); for (let yy = 0; yy < K; yy += 24) { g.fillStyle = 'rgba(90,70,40,.25)'; g.fillRect(bx, yy, 4, 1); } }
    // Asphalt
    g.fillStyle = tour_lin(g, 72, 0, 288, 0, [[0, '#4A4B52'], [.12, '#56575E'], [.5, '#5A5B62'], [.88, '#56575E'], [1, '#48494F']]); g.fillRect(72, 0, 216, K);
    for (let i = 0; i < 2600; i++) { const v = tour_zf(i * 7); g.fillStyle = v < .5 ? `rgba(255,255,255,${.04 + v * .08})` : `rgba(0,0,0,${.05 + (v - .5) * .12})`; g.fillRect(72 + tour_zf(i * 7 + 1) * 216, tour_zf(i * 7 + 2) * K, 1.2, 1.2); }
    // Fahrspuren (leicht dunkler, wo die Reifen rollen)
    for (const sx of TOUR_SPUR) for (const o of [-15, 15]) { g.fillStyle = 'rgba(20,20,25,.10)'; g.fillRect(sx + o - 4, 0, 8, K); }
    // Flicken und Gullys
    
    for (let i = 0; i < 4; i++) { const py = 60 + i * 240, px = i % 2 ? 279 : 76; g.fillStyle = '#3A3A40'; tour_rr(g, px, py, 6, 16, 1.5); g.fill(); g.fillStyle = '#6A6A70'; for (let k = 0; k < 4; k++) g.fillRect(px + 1, py + 2 + k * 3.6, 4, 1.4); }
    // Randlinien und Mittelstriche
    g.fillStyle = 'rgba(245,242,232,.9)'; g.fillRect(77, 0, 3, K); g.fillRect(280, 0, 3, K);
    for (const lx of [144, 216]) for (let yy = 0; yy < K; yy += 64) { g.fillStyle = 'rgba(245,242,232,.88)'; tour_rr(g, lx - 2, yy + 8, 4, 34, 1.5); g.fill(); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(lx - 2, yy + 26, 4, 3); }
  });
}

// ── Lieferwagen (von oben, Fahrtrichtung nach oben) ──
function tour_wagenBild(){
  return tour_leinwand(72, 124, (g) => {
    g.translate(36, 62);
    const W2 = 25, L = 49;
    // Schatten und Räder
    tour_schatten(g, 7, 5, 7, .5); g.fillStyle = '#C08A00'; tour_rr(g, -W2, -L, W2 * 2, L * 2, 9); g.fill(); tour_ohne(g);
    g.fillStyle = '#1E1C1C'; for (const [rx, ry] of [[-W2 - 2, -33], [W2 - 3, -33], [-W2 - 2, 24], [W2 - 3, 24]]) { tour_rr(g, rx, ry, 5, 15, 2); g.fill(); }
    // Karosserie unten (Seiten sichtbar)
    g.fillStyle = tour_lin(g, -W2, 0, W2, 0, [[0, '#F2B200'], [.5, '#E0A100'], [1, '#B98200']]); tour_rr(g, -W2, -L, W2 * 2, L * 2, 9); g.fill();
    // Motorhaube
    g.fillStyle = tour_lin(g, 0, -L, 0, -L + 14, [[0, '#FFE58A'], [1, '#FFC72C']]); tour_rr(g, -W2 + 2, -L + 1, W2 * 2 - 4, 16, 8); g.fill();
    // Scheinwerfer
    for (const s of [-1, 1]) { g.fillStyle = tour_rad(g, s * 15, -L + 3, 0, 5, [[0, '#FFFFFF'], [.6, '#FFF3C4'], [1, '#E7C35A']]); g.beginPath(); g.ellipse(s * 15, -L + 3.5, 5, 2.6, 0, 0, 7); g.fill(); }
    g.fillStyle = '#3A2A18'; tour_rr(g, -8, -L + 1, 16, 3, 1.5); g.fill();
    // Spiegel
    for (const s of [-1, 1]) { g.fillStyle = '#2C2C30'; tour_rr(g, s > 0 ? W2 - 1 : -W2 - 6, -28, 7, 5, 2); g.fill(); g.fillStyle = '#8FB3CC'; tour_rr(g, s > 0 ? W2 + 1 : -W2 - 5, -27, 4, 3, 1); g.fill(); }
    // Frontscheibe
    g.fillStyle = tour_lin(g, -W2, -34, W2, -22, [[0, '#9FC4DE'], [.45, '#3F6684'], [1, '#22384C']]);
    g.beginPath(); g.moveTo(-W2 + 4, -33); g.lineTo(W2 - 4, -33); g.lineTo(W2 - 2, -22); g.lineTo(-W2 + 2, -22); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-W2 + 9, -24); g.lineTo(-W2 + 15, -32); g.moveTo(-W2 + 15, -24); g.lineTo(-W2 + 19, -30); g.stroke();
    // Kabinendach
    g.fillStyle = tour_lin(g, -W2, 0, W2, 0, [[0, '#FFE27A'], [.6, '#FFC72C'], [1, '#E2A40A']]); tour_rr(g, -W2 + 2, -22, W2 * 2 - 4, 12, 3); g.fill();
    // Kofferaufbau
    tour_schatten(g, 3, 0, 2, .35);
    g.fillStyle = tour_lin(g, -W2, 0, W2, 0, [[0, '#FFF0B0'], [.25, '#FFD84E'], [.75, '#FFC72C'], [1, '#E9AE12']]); tour_rr(g, -W2 + 1, -10, W2 * 2 - 2, L + 9, 5); g.fill(); tour_ohne(g);
    g.strokeStyle = 'rgba(150,100,0,.28)'; g.lineWidth = 1; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-W2 + 4, -2 + k * 10); g.lineTo(W2 - 4, -2 + k * 10); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.4)'; tour_rr(g, -W2 + 3, -8, 4, L + 4, 2); g.fill();
    // Schriftzug längs, darunter kleine Ähre quer
    g.save(); g.rotate(-Math.PI / 2); g.font = '800 14px "Plus Jakarta Sans", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,.45)'; g.fillText('HINKEL', -20, 1.5); g.fillStyle = '#4B2A14'; g.fillText('HINKEL', -20, 0); g.restore();
    g.save(); g.translate(0, -12); g.strokeStyle = '#4B2A14'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-9, -4); g.lineTo(9, -4); g.stroke();
    g.fillStyle = '#4B2A14'; for (let k = 0; k < 3; k++) for (const s of [-1, 1]) { g.beginPath(); g.ellipse(-4 + k * 4, -4 + s * 2.4, 2.4, 1.3, s * -.5, 0, 7); g.fill(); } g.restore();
    // Rücklichter
    for (const s of [-1, 1]) { g.fillStyle = '#C62A1E'; tour_rr(g, s * 16 - 5, L - 3, 10, 3, 1.5); g.fill(); }
  });
}

// ── Autos im Gegenverkehr (Front nach unten) ──
function tour_autoBild(farbe, lang){
  const L = lang ? 46 : 37, Wd = lang ? 24 : 21;
  return tour_leinwand(64, 110, (g) => {
    g.translate(32, 55);
    tour_schatten(g, 6, 5, 6, .5); g.fillStyle = tour_hell(farbe, -.3); tour_rr(g, -Wd, -L, Wd * 2, L * 2, 10); g.fill(); tour_ohne(g);
    g.fillStyle = '#1C1C1E'; for (const [rx, ry] of [[-Wd - 2, -L + 10], [Wd - 3, -L + 10], [-Wd - 2, L - 24], [Wd - 3, L - 24]]) { tour_rr(g, rx, ry, 5, 13, 2); g.fill(); }
    g.fillStyle = tour_lin(g, -Wd, 0, Wd, 0, [[0, tour_hell(farbe, .25)], [.5, farbe], [1, tour_hell(farbe, -.25)]]); tour_rr(g, -Wd, -L, Wd * 2, L * 2, 10); g.fill();
    // Front unten: Haube, Scheinwerfer
    g.fillStyle = tour_lin(g, 0, L - 18, 0, L, [[0, tour_hell(farbe, .12)], [1, tour_hell(farbe, .3)]]); tour_rr(g, -Wd + 3, L - 18, Wd * 2 - 6, 16, 6); g.fill();
    for (const s of [-1, 1]) { g.fillStyle = '#FFF8DC'; g.beginPath(); g.ellipse(s * (Wd - 6), L - 3, 4.5, 2.2, 0, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(20,20,20,.55)'; tour_rr(g, -7, L - 3, 14, 2.5, 1); g.fill();
    // Frontscheibe (unten), Dach, Heckscheibe (oben)
    const glas = (y1, y2, breit) => { g.fillStyle = tour_lin(g, -Wd, y1, Wd, y2, [[0, '#A9CBE2'], [.5, '#3C5F7C'], [1, '#1F3344']]); g.beginPath(); g.moveTo(-Wd + breit, y1); g.lineTo(Wd - breit, y1); g.lineTo(Wd - 3, y2); g.lineTo(-Wd + 3, y2); g.closePath(); g.fill(); };
    glas(L - 32, L - 19, 3); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-Wd + 7, L - 21); g.lineTo(-Wd + 12, L - 30); g.stroke();
    g.fillStyle = tour_lin(g, -Wd, 0, Wd, 0, [[0, tour_hell(farbe, .35)], [.6, tour_hell(farbe, .1)], [1, tour_hell(farbe, -.15)]]); tour_rr(g, -Wd + 3, -L + 18, Wd * 2 - 6, L * 2 - 50, 5); g.fill();
    g.fillStyle = 'rgba(255,255,255,.22)'; tour_rr(g, -Wd + 5, -L + 20, 5, L * 2 - 54, 2); g.fill();
    g.fillStyle = tour_lin(g, 0, -L + 7, 0, -L + 18, [[0, '#1F3344'], [1, '#4C7090']]); tour_rr(g, -Wd + 4, -L + 7, Wd * 2 - 8, 10, 3); g.fill();
    if (lang) { g.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 3; k++) g.fillRect(-Wd + 4, -L + 30 + k * 12, Wd * 2 - 8, 1); }
    // Rücklichter oben, Spiegel
    for (const s of [-1, 1]) { g.fillStyle = '#B8241A'; tour_rr(g, s * (Wd - 6) - 4, -L + 1, 8, 3, 1.5); g.fill(); g.fillStyle = '#242428'; tour_rr(g, s > 0 ? Wd - 1 : -Wd - 5, L - 30, 6, 4, 2); g.fill(); }
  });
}

// ── Baustelle: Baken und Absperrschranke ──
function tour_bauBild(){
  return tour_leinwand(76, 56, (g) => {
    g.translate(38, 28);
    // Schranke
    tour_schatten(g, 4, 4, 5, .45); g.fillStyle = '#FFFFFF'; tour_rr(g, -32, -6, 64, 9, 3); g.fill(); tour_ohne(g);
    g.save(); tour_rr(g, -32, -6, 64, 9, 3); g.clip(); g.fillStyle = '#D9372A'; for (let k = -40; k < 40; k += 12) { g.beginPath(); g.moveTo(k, -6); g.lineTo(k + 6, -6); g.lineTo(k + 15, 3); g.lineTo(k + 9, 3); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-32, -6, 64, 2); g.restore();
    // Baken (Kegel von oben)
    for (const bx of [-24, 0, 24]) {
      tour_schatten(g, 3, 3, 4, .45); g.fillStyle = '#2B2B2E'; tour_rr(g, bx - 8, 6, 16, 14, 3); g.fill(); tour_ohne(g);
      g.fillStyle = tour_rad(g, bx, 12, 1, 9, [[0, '#FFB25A'], [.5, '#F07E1E'], [1, '#B8520C']], bx - 2, 10); g.beginPath(); g.arc(bx, 13, 7.5, 0, 7); g.fill();
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.beginPath(); g.arc(bx, 13, 4.6, 0, 7); g.stroke();
      g.fillStyle = '#E86A12'; g.beginPath(); g.arc(bx, 13, 2.2, 0, 7); g.fill();
    }
    // Warnlampe
    g.fillStyle = '#3A3A3A'; tour_rr(g, -5, -15, 10, 9, 2); g.fill();
  });
}

// ── Baum (Krone von oben) ──
function tour_baumBild(){
  return tour_leinwand(64, 64, (g) => {
    g.translate(32, 32);
    const teile = [[0, 0, 19], [-10, -8, 12], [10, -7, 12], [-11, 8, 12], [9, 10, 12], [0, -13, 10], [0, 13, 10]];
    tour_schatten(g, 6, 5, 6, .45); g.fillStyle = '#2E6B2E'; g.beginPath(); for (const [a, b, r] of teile) { g.moveTo(a + r, b); g.arc(a, b, r, 0, 7); } g.fill(); tour_ohne(g);
    for (const [a, b, r] of teile) { g.fillStyle = tour_rad(g, a, b, 1, r, [[0, '#8FCB5E'], [.55, '#4E9A3C'], [1, '#2F6E2C']], a - r * .4, b - r * .45); g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,220,.22)'; for (let k = 0; k < 14; k++) { g.beginPath(); g.arc(-14 + tour_zf(k) * 22, -14 + tour_zf(k + 20) * 20, 1.6, 0, 7); g.fill(); }
  });
}

// ── Schnee am Rand: durchsichtige Kachel, liegt über der Straße, wenn es schneit ──
function tour_schneeKachel(){
  return tour_leinwand(360, TOUR_KACHEL, (g) => {
    const K = TOUR_KACHEL;
    const flocke = (px, py, r, a) => { g.fillStyle = tour_rad(g, px, py, 0, r, [[0, `rgba(255,255,255,${a})`], [.7, `rgba(246,250,255,${a * .85})`], [1, 'rgba(240,246,255,0)']]); g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); };
    // Dächer und Höfe fast ganz weiß
    for (const [x0, x1] of [[0, 42], [318, 360]]) {
      g.fillStyle = 'rgba(250,252,255,.72)'; g.fillRect(x0, 0, x1 - x0, K);
      for (let i = 0; i < 90; i++) flocke(x0 + tour_zf(i + x0) * (x1 - x0), tour_zf(i * 3 + x0) * K, 6 + tour_zf(i + 7) * 8, .5);
      g.fillStyle = 'rgba(150,170,200,.16)'; for (let i = 0; i < 40; i++) g.fillRect(x0 + tour_zf(i + 99) * (x1 - x0), tour_zf(i + 300) * K, 1.4, 6);
    }
    // Gehwege fleckig, am Bordstein ein Schneewall
    for (const [gx, gw] of [[42, 26], [292, 26]]) for (let i = 0; i < 70; i++) flocke(gx + tour_zf(i + gx) * gw, tour_zf(i * 5 + gx) * K, 5 + tour_zf(i + 11) * 7, .55);
    for (const [bx, r] of [[70, 1], [290, -1]]) for (let yy = 0; yy < K; yy += 7) flocke(bx + r * tour_zf(yy) * 3, yy, 5 + tour_zf(yy + 5) * 3, .9);
    // etwas Schneematsch am Fahrbahnrand
    for (let yy = 0; yy < K; yy += 9) { flocke(79 + tour_zf(yy + 1) * 4, yy, 3 + tour_zf(yy + 2) * 3, .45); flocke(281 - tour_zf(yy + 3) * 4, yy, 3 + tour_zf(yy + 4) * 3, .45); }
  });
}
function tour_baumSchneeBild(){
  return tour_leinwand(64, 64, (g) => {
    g.translate(32, 32);
    for (const [a, b, r] of [[-6, -6, 10], [6, -9, 8], [-11, 2, 7], [3, 3, 9], [10, 6, 6], [-3, 12, 6]]) { g.fillStyle = tour_rad(g, a, b, 0, r, [[0, 'rgba(255,255,255,.95)'], [.75, 'rgba(240,246,255,.8)'], [1, 'rgba(240,246,255,0)']], a - 2, b - 2); g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); }
  });
}

// ── Filiale am Straßenrand (rechts) ──
function tour_filialeBild(){
  return tour_leinwand(110, 180, (g) => {
    // Gebäude mit Flachdach (Kies), goldener Rand, großes Schild auf dem Dach, Markise zur Straße
    tour_schatten(g, 9, 5, 8, .5); g.fillStyle = '#E9E2D4'; tour_rr(g, 38, 6, 72, 168, 4); g.fill(); tour_ohne(g);
    g.fillStyle = tour_lin(g, 38, 0, 110, 0, [[0, '#EFE7D6'], [1, '#D6CBB6']]); tour_rr(g, 38, 6, 72, 168, 4); g.fill();
    for (let i = 0; i < 380; i++) { g.fillStyle = tour_zf(i) < .5 ? 'rgba(255,255,255,.35)' : 'rgba(90,70,40,.18)'; g.fillRect(40 + tour_zf(i + 400) * 68, 8 + tour_zf(i + 800) * 164, 1.3, 1.3); }
    g.strokeStyle = '#C98A00'; g.lineWidth = 3; tour_rr(g, 40, 8, 68, 164, 3); g.stroke();
    g.strokeStyle = 'rgba(255,240,190,.7)'; g.lineWidth = 1; tour_rr(g, 42.5, 10.5, 63, 159, 2); g.stroke();
    // Lüfter
    g.fillStyle = '#A7A096'; g.beginPath(); g.arc(92, 150, 7, 0, 7); g.fill(); g.strokeStyle = '#7E776C'; g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(92, 150, 2 + k * 2, 0, 7); g.stroke(); }
    // Schild auf dem Dach
    tour_schatten(g, 4, 3, 4, .4); g.fillStyle = tour_lin(g, 0, 60, 0, 120, [[0, '#FFD95A'], [1, '#F2B400']]); tour_rr(g, 48, 58, 54, 64, 8); g.fill(); tour_ohne(g);
    g.strokeStyle = '#4B2A14'; g.lineWidth = 2; tour_rr(g, 51, 61, 48, 58, 6); g.stroke();
    g.save(); g.translate(75, 90); g.rotate(-Math.PI / 2); g.font = '800 14px "Plus Jakarta Sans", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#4B2A14'; g.fillText('HINKEL', 0, 1); g.restore();
    // Markise mit Streifen (ragt über den Gehweg)
    const mk = () => { g.beginPath(); g.moveTo(40, 26); g.lineTo(14, 34); g.lineTo(14, 146); g.lineTo(40, 154); g.closePath(); };
    tour_schatten(g, 6, 5, 7, .45); g.fillStyle = '#FFC72C'; mk(); g.fill(); tour_ohne(g);
    g.save(); mk(); g.clip();
    for (let k = 0; k < 13; k++) { g.fillStyle = k % 2 ? '#FFFBF2' : '#FFC72C'; g.fillRect(0, 26 + k * 10, 44, 10); }
    g.fillStyle = tour_lin(g, 14, 0, 40, 0, [[0, 'rgba(60,30,0,.28)'], [.6, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,.3)']]); g.fillRect(0, 20, 44, 140); g.restore();
    for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? '#EDE2CC' : '#E0A30A'; g.beginPath(); g.arc(14, 34 + k * 9.33 + 4.66, 4.6, Math.PI / 2, Math.PI * 1.5); g.fill(); }
    // Tür-Matte
    g.fillStyle = '#6B4A2E'; tour_rr(g, 41, 82, 4, 16, 1); g.fill();
  });
}

SPIELE.tour = {
  key: 'tour', name: 'Lieferwagen-Tour', kurz: 'Fahren', medaillen: [800, 2000, 4000],
  anleitung: 'Tippe links oder rechts neben den Wagen, um die Spur zu wechseln. Weich Autos und Baustellen aus, sammle Brot-Kisten und bring die Ware zur nächsten Filiale.',
  bilder(){
    if (this.bild) return this.bild;
    this.bild = { schnee: tour_schneeKachel(), baumSchnee: tour_baumSchneeBild(), strasse: tour_strasse(), wagen: tour_wagenBild(), bau: tour_bauBild(), baum: tour_baumBild(), filiale: tour_filialeBild(), autos: TOUR_AUTOFARBEN.map((f, i) => tour_autoBild(f, false)), laster: ['#ECE6DA', '#5F8FB8', '#8A9AA8'].map((f) => tour_autoBild(f, true)) };
    if (document.fonts && !this.schriftDa) { this.schriftDa = true; document.fonts.ready.then(() => { this.bild = null; }); }
    return this.bild;
  },
  start(){
    this.spur = 1; this.xs = TOUR_SPUR[1]; this.vx = 0; this.dinge = []; this.weg = 0; this.tempo = 0; this.fahrzeit = 0;
    this.leben = 3; this.kisten = 0; this.kombi = 0; this.filialen = 0; this.bonus = 0; this.schutz = 0; this.rutsch = 0; this.wellenUhr = 1.0;
    this.freiVorher = [0, 1, 2]; this.strecke = 3000; this.letzteFrage = 0; this.ziel = this.strecke; this.abschnittStart = 0;
    this.modus = 'fahrt'; this.szene = 0; this.aus = 0; this.zeit = 0; this.fliegen = []; this.wackelRot = 0; this.tipp = null; this.hinweis = 3.2;
    this.gemuetlich = typeof GEMUETLICH !== 'undefined' && GEMUETLICH;
    const mo = new Date().getMonth(); this.winter = mo >= 10 || mo <= 1;
    this.himmel = this.stimmungZiel(0); this.niederY = 0;
  },
  aktuellePunkte(){ return this.punkte(); },
  /** Tageszeit und Wetter je Abschnitt: Morgen, Tag, Tag mit Regen (Winter: Schnee), Abend, Abend mit Regen/Schnee */
  stimmungZiel(n){
    const i = n % 5, nass = i === 2 || i === 4;
    return { morgen: i === 0 ? 1 : 0, dunkel: i >= 3 ? 1 : 0, regen: nass && !this.winter ? 1 : 0, schnee: nass && this.winter ? 1 : 0 };
  },
  stimmungName(){ const z = this.stimmungZiel(this.filialen); return z.schnee ? 'Schnee' : z.regen ? 'Regen' : z.dunkel ? 'Abend' : z.morgen ? 'Morgen' : 'Tag'; },
  zielTempo(){ if (this.gemuetlich) return 200; return Math.min(520, 235 + Math.min(this.fahrzeit, 50) * 3.6 + this.filialen * 18); },
  wechsel(r){ if (this.modus !== 'fahrt') return; const n = klemm(this.spur + r, 0, 2); if (n !== this.spur) { this.spur = n; this.hinweis = 0; } },
  runter(p){
    const r = p.x < this.xs - 20 ? -1 : p.x > this.xs + 20 ? 1 : 0;
    this.tipp = { x: p.x, y: p.y, r, wisch: false }; if (r) this.wechsel(r);
  },
  zieh(p){
    const t = this.tipp; if (!t || t.wisch) return;
    const dx = p.x - t.x; if (Math.abs(dx) > 34) { const r = Math.sign(dx); t.wisch = true; if (t.r === r) return; if (t.r === -r) this.wechsel(r); this.wechsel(r); }
  },
  hoch(){ this.tipp = null; },
  taste(k){ if (k === 'ArrowLeft') this.wechsel(-1); if (k === 'ArrowRight') this.wechsel(1); },
  rest(){ return this.ziel - this.weg; },
  welle(){
    // Alle Dinge einer Welle kommen gleichzeitig am Wagen an, darum ist immer eine Spur frei und erreichbar.
    const schwer = this.fahrzeit > 7 ? Math.min(.62, .12 + (this.fahrzeit - 7) / 60 + this.filialen * .07) : 0;
    let zu = !this.gemuetlich && Math.random() < schwer ? 2 : 1, frei;
    for (let v = 0; v < 20; v++) {
      const gesperrt = []; while (gesperrt.length < zu) { const s = ganz(0, 2); if (!gesperrt.includes(s)) gesperrt.push(s); }
      frei = [0, 1, 2].filter((s) => !gesperrt.includes(s));
      if (frei.some((f) => this.freiVorher.some((p) => Math.abs(p - f) <= 1))) break;
      if (v === 19) { zu = 1; frei = [0, 1, 2].filter((s) => s !== ganz(0, 2)); }
    }
    this.freiVorher = frei;
    const v = Math.max(this.tempo, 200), T = Math.max(2.1, 560 / v);
    const neu = (art, s, f, extra) => this.dinge.push({ art, s, f, y: TOUR_Y - T * v * f, weg: false, ...extra });
    for (const s of [0, 1, 2]) {
      if (frei.includes(s)) continue;
      if (this.fahrzeit > 5 && Math.random() < .36) neu('bau', s, 1);
      else { const lang = Math.random() < .25; neu('auto', s, lang ? 1.25 : 1.4, { lang, bild: ganz(0, lang ? 2 : TOUR_AUTOFARBEN.length - 1) }); }
    }
    const nass = this.himmel.regen + this.himmel.schnee;
    if (Math.random() < .42) neu('kiste', frei[ganz(0, frei.length - 1)], 1);
    else if ((this.fahrzeit > 14 || nass > .5) && Math.random() < .2 + nass * .28) neu('pfuetze', frei[ganz(0, frei.length - 1)], 1);
  },
  tick(dt){
    this.zeit += dt; this.schutz -= dt; if (this.wetterHinweis) this.wetterHinweis.z -= dt;
    // Tageszeit und Wetter gleiten weich zum Ziel des Abschnitts
    const sz = this.stimmungZiel(this.modus === 'abladen' && this.szene < 1.2 ? this.filialen - 1 : this.filialen);
    for (const k of ['morgen', 'dunkel', 'regen', 'schnee']) this.himmel[k] += klemm(sz[k] - this.himmel[k], -dt * .45, dt * .45);
    this.niederY += (this.himmel.schnee > this.himmel.regen ? 70 : 760) * dt + this.tempo * dt * .35; this.rutsch = Math.max(0, this.rutsch - dt); this.hinweis = Math.max(0, this.hinweis - dt);
    // Tempo je nach Abschnitt
    if (this.modus === 'fahrt') {
      this.fahrzeit += dt;
      this.tempo = Math.min(this.zielTempo(), this.tempo + (this.tempo < this.zielTempo() * .8 ? 260 : 60) * dt);
      if (this.rest() < 620) { this.modus = 'bremsen'; this.dinge = this.dinge.filter((d) => d.y > -30); this.spur = 2; }
    } else if (this.modus === 'bremsen') {
      this.tempo = Math.min(this.tempo, Math.sqrt(2 * 300 * Math.max(0, this.rest())) + 8);
      if (this.rest() <= 0.5) { this.weg = this.ziel; this.tempo = 0; this.modus = 'abladen'; this.szene = 0; this.filialen++; this.abladen(); brumm(30); }
    } else if (this.modus === 'abladen') {
      this.szene += dt; this.tempo = 0;
      if (this.szene > 2.1) {
        { const alt = this.stimmungName(); this.wetterHinweis = null; const neuN = (this.filialen % 5); const t = ['Guten Morgen!', 'Heller Tag', this.winter ? 'Es schneit! Vorsicht, glatt' : 'Es regnet! Vorsicht, Pfützen', 'Es wird Abend', this.winter ? 'Schnee am Abend' : 'Regen am Abend'][neuN]; if (t && neuN !== 0) this.wetterHinweis = { t, z: 2.6 }; void alt; }
        this.modus = 'fahrt'; this.strecke += 1600; this.abschnittStart = this.weg; this.ziel = this.weg + this.strecke; this.wellenUhr = 1.6; this.freiVorher = [0, 1, 2];
        if (this.zeit - this.letzteFrage > 22) { this.letzteFrage = this.zeit; frage((ok) => { if (ok) { this.bonus += 100; schwebText('+100 Bonus', 180, 250, F.gruen, 24); teilchen(180, 250, { n: 26, form: 'stern', oben: 120 }); } }); }
      }
    } else if (this.modus === 'aus') {
      this.aus += dt; this.tempo = Math.max(0, this.tempo - 500 * dt);
      if (this.aus > 1 && !this.endeGerufen) { this.endeGerufen = true; ende(this.punkte(), `${this.filialen} ${this.filialen === 1 ? 'Filiale' : 'Filialen'} beliefert und ${this.kisten} Brot-${this.kisten === 1 ? 'Kiste' : 'Kisten'} gesammelt.`); }
    }
    this.weg += this.tempo * dt;
    // Wellen
    if (this.modus === 'fahrt' && this.tempo > this.zielTempo() * .5) {
      this.wellenUhr -= dt;
      const abstand = this.gemuetlich ? 1.45 : Math.max(.5, 1.0 - this.fahrzeit * .009 - this.filialen * .04);
      if (this.wellenUhr <= 0 && this.rest() > 560 / Math.max(this.tempo, 200) * this.tempo + 700) { this.welle(); this.wellenUhr = abstand * zufall(.92, 1.12); }
    }
    // Wagen schwenkt weich in die Spur
    const ziel = TOUR_SPUR[this.spur], k = this.rutsch > 0 ? 60 : 210, d = this.rutsch > 0 ? 9 : 24;
    this.vx += ((ziel - this.xs) * k - this.vx * d) * dt; this.xs += this.vx * dt;
    this.wackelRot = this.rutsch > 0 ? Math.sin(this.zeit * 22) * .14 * (this.rutsch / 1) : 0;
    // Dinge bewegen, zusammenstoßen
    for (const d of this.dinge) {
      d.y += this.tempo * dt * d.f + (d.art === 'auto' && this.modus === 'abladen' ? 0 : 0);
      if (d.raus) { d.raus.t += dt; d.dx = (d.dx || 0) + d.raus.vx * dt; d.y += d.raus.vy * dt; d.rot = (d.rot || 0) + d.raus.vr * dt; continue; }
      if (d.weg) continue;
      const dx = Math.abs(TOUR_SPUR[d.s] - this.xs), dy = Math.abs(d.y - TOUR_Y);
      // Trefferflächen: Hindernisse etwas kleiner als gezeichnet (fair), Kisten etwas größer
      const grenzeX = d.art === 'auto' ? 32 : d.art === 'bau' ? 40 : d.art === 'pfuetze' ? 30 : 42;
      const grenzeY = d.art === 'auto' ? (d.lang ? 76 : 68) : d.art === 'bau' ? 46 : 58;
      if (dx < grenzeX && dy < grenzeY) this.treffer(d);
      else if (d.art === 'kiste' && d.y > TOUR_Y + 70 && !d.vorbei) { d.vorbei = true; this.kombi = 0; }
    }
    this.dinge = this.dinge.filter((d) => d.y < H + 120 && !(d.weg && d.art === 'kiste'));
    for (const f of this.fliegen) f.t += dt; this.fliegen = this.fliegen.filter((f) => f.t < 1);
    setHud([{ icon: 'punkte', text: this.punkte().toLocaleString('de-DE') }, this.gemuetlich ? { text: 'Gemütlich' } : herzen(Math.max(0, this.leben), 3)]);
  },
  treffer(d){
    const wx = this.xs, wy = TOUR_Y;
    if (d.art === 'kiste') {
      d.weg = true; this.kisten++; this.kombi = Math.min(5, this.kombi + 1);
      const p = 15 * this.kombi; this.bonus += p; brumm(22);
      teilchen(wx, wy - 40, { n: 18, form: 'stern', oben: 80, tempo: 180 }); teilchen(wx, wy - 40, { n: 8, farben: ['#C27F36', '#E3AE68', '#8A5223'], form: 'krume', tempo: 140 });
      schwebText(`+${p}`, wx, wy - 70, F.goldDunkel, 22);
      if (this.kombi >= 2) schwebText(`Kombi x${this.kombi}`, wx, wy - 100, F.braun, 15);
      return;
    }
    if (d.art === 'pfuetze') {
      d.weg = true; this.rutsch = 1; this.vx += (Math.random() < .5 ? -1 : 1) * 90;
      teilchen(wx, wy - 10, { n: 22, farben: ['rgba(190,215,240,.95)', 'rgba(140,175,210,.9)', '#FFFFFF'], tempo: 200, schwer: 400, oben: 60 });
      schwebText('Rutschig!', wx, wy - 70, '#3E6FB5', 18);
      return;
    }
    if (this.schutz > 0 || this.modus !== 'fahrt') return;
    if (this.gemuetlich) { // gemütlich: nur kurz wackeln, kein Leben weg
      d.weg = true; d.raus = { t: 0, vx: (TOUR_SPUR[d.s] >= this.xs ? 1 : -1) * 140, vy: -60, vr: (Math.random() < .5 ? -1 : 1) * 5 };
      this.schutz = .8; this.kombi = 0; wackeln(5); brumm(40); mehlWolke(wx, wy - 40, 5); schwebText('Hoppla', wx, wy - 80, F.braun, 18); return;
    }
    d.weg = true; brumm(70); d.raus = { t: 0, vx: (TOUR_SPUR[d.s] >= this.xs ? 1 : -1) * 140, vy: -60, vr: (Math.random() < .5 ? -1 : 1) * 5 };
    this.leben--; this.schutz = 1.6; this.kombi = 0; this.tempo *= .55;
    wackeln(9); blitz(.35, '255,90,40');
    teilchen(wx, wy - 46, { n: 26, farben: ['#FFE27A', '#FFB02E', '#FF7A1A', '#FFFFFF'], tempo: 260, groesse: [1.5, 3.5], schwer: 300, leben: [.25, .6] });
    mehlWolke(wx, wy - 40, 8);
    schwebText(d.art === 'bau' ? 'Baustelle!' : 'Rums!', wx, wy - 80, F.rot, 20);
    if (this.leben <= 0) { this.modus = 'aus'; this.aus = 0; this.endeGerufen = false; }
  },
  abladen(){
    teilchen(240, TOUR_Y - 30, { n: 34, farben: ['#FFC72C', '#FFF1B8', '#E8534F', '#7DBE6E', '#FFFFFF'], form: 'stern', tempo: 240, oben: 140, leben: [.8, 1.3] });
    for (let i = 0; i < 3; i++) this.fliegen.push({ t: -i * .22, art: ['laib', 'baguette', 'brezel'][i] });
  },
  punkte(){ return Math.round(this.weg / 25) + this.filialen * 150 + this.bonus; },
  testZug(){
    // Spur wählen, in der als Nächstes nichts Gefährliches kommt
    const gefahr = [0, 1, 2].map((s) => { let best = 9e9; for (const d of this.dinge) if (!d.weg && d.s === s && (d.art === 'auto' || d.art === 'bau')) { const t = (TOUR_Y + 80 - d.y) / Math.max(1, this.tempo * d.f); if (t > -.1 && t < best) best = t; } return best; });
    // nur in eine Nachbarspur wechseln, die gerade sicher ist
    let ziel = this.spur;
    if (gefahr[this.spur] < 1.6) for (const s of [this.spur - 1, this.spur + 1]) if (s >= 0 && s <= 2 && gefahr[s] > .55 && gefahr[s] > gefahr[ziel] + .1) ziel = s;
    if (ziel === this.spur && gefahr[this.spur] > 1.4) { const kiste = this.dinge.find((d) => d.art === 'kiste' && !d.weg && Math.abs(d.s - this.spur) === 1 && d.y > 120 && d.y < 330); if (kiste && gefahr[kiste.s] > 1.2) ziel = kiste.s; }
    if (ziel === this.spur) return { x: this.xs, y: TOUR_Y, warte: 140 };
    return { x: ziel < this.spur ? this.xs - 70 : this.xs + 70, y: 300, warte: 160 };
  },
  /** Tageszeit (Tönung, Dunkelheit mit Lichtern) und Regen/Schnee über die ganze Szene */
  lichtUndWetter(hm, deko, zeit){
    if (hm.morgen > .01) { x.fillStyle = linear(0, 0, 0, H, [[0, `rgba(255,150,90,${.2 * hm.morgen})`], [1, `rgba(255,205,150,${.06 * hm.morgen})`]]); x.fillRect(0, 0, W, H); }
    if (hm.dunkel > .01) {
      const d = hm.dunkel;
      x.fillStyle = `rgba(16,20,52,${.52 * d})`; x.fillRect(0, 0, W, H);
      x.save(); x.globalCompositeOperation = 'lighter';
      // Laternen: Lichtpunkt und Lichtfleck am Boden (bei Regen länger gezogen)
      for (const L of deko) if (L.art === 'lampe') {
        const [kx, ky] = tour_proj(L.px + (L.seite ? -22 : 22), L.py, .16), gx = L.px + (L.seite ? -22 : 22);
        x.fillStyle = radial(gx, L.py, 0, 46, [[0, `rgba(255,200,110,${.42 * d})`], [1, 'rgba(255,200,110,0)']]); x.beginPath(); x.ellipse(gx, L.py, 46, 46 + hm.regen * 30, 0, 0, 7); x.fill();
        x.fillStyle = radial(kx, ky, 0, 16, [[0, `rgba(255,240,190,${.95 * d})`], [1, 'rgba(255,220,140,0)']]); x.beginPath(); x.arc(kx, ky, 16, 0, 7); x.fill();
      }
      // Gegenverkehr: Scheinwerfer nach unten
      for (const o of this.dinge || []) if (o.art === 'auto' && !o.raus && o.y > -60 && o.y < H + 60) {
        const px = TOUR_SPUR[o.s], fy = o.y + (o.lang ? 44 : 36);
        x.fillStyle = linear(0, fy, 0, fy + 70, [[0, `rgba(255,245,200,${.34 * d})`], [1, 'rgba(255,245,200,0)']]); x.beginPath(); x.moveTo(px - 16, fy); x.lineTo(px + 16, fy); x.lineTo(px + 26, fy + 70); x.lineTo(px - 26, fy + 70); x.closePath(); x.fill();
      }
      // eigener Wagen: kräftiger Scheinwerferkegel und Rücklichter
      const rot = klemm(this.vx * .0016, -.22, .22);
      x.save(); x.translate(this.xs, TOUR_Y); x.rotate(rot);
      x.fillStyle = linear(0, -48, 0, -175, [[0, `rgba(255,236,170,${.5 * d})`], [1, 'rgba(255,236,170,0)']]);
      x.beginPath(); x.moveTo(-18, -48); x.lineTo(18, -48); x.lineTo(46, -175); x.lineTo(-46, -175); x.closePath(); x.fill();
      for (const sx of [-16, 16]) { x.fillStyle = radial(sx, 48, 0, 12, [[0, `rgba(255,60,40,${.55 * d})`], [1, 'rgba(255,60,40,0)']]); x.beginPath(); x.arc(sx, 48, 12, 0, 7); x.fill(); }
      x.restore();
      // Baustellen-Lampe
      for (const o of this.dinge || []) if (o.art === 'bau' && o.y > -40 && o.y < H + 40 && Math.floor(zeit * 3) % 2) { x.fillStyle = radial(TOUR_SPUR[o.s], o.y - 10, 0, 30, [[0, `rgba(255,200,60,${.6 * d})`], [1, 'rgba(255,200,60,0)']]); x.beginPath(); x.arc(TOUR_SPUR[o.s], o.y - 10, 30, 0, 7); x.fill(); }
      x.restore();
    }
    // Regen: schräge Striche in einem Pfad (spart Leistung)
    if (hm.regen > .01) {
      x.strokeStyle = `rgba(205,222,245,${.55 * hm.regen})`; x.lineWidth = 1.1; x.beginPath();
      const n = Math.round(70 * hm.regen);
      for (let i = 0; i < n; i++) { const px = (tour_zf(i) * (W + 40) + this.niederY * .12) % (W + 40) - 20, py = (tour_zf(i + 300) * (H + 40) + this.niederY * (.8 + tour_zf(i + 9) * .4)) % (H + 40) - 20; x.moveTo(px, py); x.lineTo(px - 3, py + 13); }
      x.stroke();
      // Tropfen springen auf der Straße
      x.strokeStyle = `rgba(220,232,250,${.35 * hm.regen})`; x.beginPath();
      for (let i = 0; i < 10; i++) { const t = (zeit * 2.2 + tour_zf(i + 40)) % 1, px = 80 + tour_zf(i + 41 + Math.floor(zeit * 2.2 + tour_zf(i + 40))) * 200, py = 40 + tour_zf(i + 60 + Math.floor(zeit * 2.2 + tour_zf(i + 40))) * 400; x.moveTo(px + 2 + t * 5, py); x.ellipse(px, py, 2 + t * 5, 1 + t * 2.5, 0, 0, 7); }
      x.stroke();
    }
    // Schnee: runde Flocken, große vorne schneller
    if (hm.schnee > .01) {
      x.fillStyle = `rgba(255,255,255,${.85 * hm.schnee})`; x.beginPath();
      const n = Math.round(70 * hm.schnee);
      for (let i = 0; i < n; i++) { const r = 1 + tour_zf(i + 7) * 2.2, px = (tour_zf(i) * W + Math.sin(zeit * .9 + i) * 14 + W) % W, py = (tour_zf(i + 300) * (H + 20) + this.niederY * (.6 + r * .25)) % (H + 20) - 10; x.moveTo(px + r, py); x.arc(px, py, r, 0, 7); }
      x.fill();
    }
  },
  malen(zeit){
    const b = this.bilder();
    const weg = this.weg || 0;
    // Straße (zweimal, nahtlos)
    const oy = weg % TOUR_KACHEL;
    x.drawImage(b.strasse, 0, oy - TOUR_KACHEL, W, TOUR_KACHEL); x.drawImage(b.strasse, 0, oy, W, TOUR_KACHEL);
    const hm = this.himmel || { morgen: 0, dunkel: 0, regen: 0, schnee: 0 };
    if (hm.regen > .01) { // nasser Asphalt: dunkler, leicht bläulich, mit Glanzstreifen
      x.fillStyle = `rgba(22,34,58,${.24 * hm.regen})`; x.fillRect(72, 0, 216, H);
      x.fillStyle = linear(0, 0, 0, H, [[0, `rgba(190,210,235,${.10 * hm.regen})`], [.5, 'rgba(190,210,235,0)'], [1, `rgba(190,210,235,${.08 * hm.regen})`]]); x.fillRect(72, 0, 216, H);
    }
    if (hm.schnee > .01) { x.globalAlpha = hm.schnee; x.drawImage(b.schnee, 0, oy - TOUR_KACHEL, W, TOUR_KACHEL); x.drawImage(b.schnee, 0, oy, W, TOUR_KACHEL); x.globalAlpha = 1; x.fillStyle = `rgba(235,242,252,${.1 * hm.schnee})`; x.fillRect(72, 0, 216, H); }
    const syW = (d) => TOUR_Y - (d - weg);
    // Filiale
    const fy = syW(this.ziel) - 6;
    if (fy > -200 && fy < H + 200) x.drawImage(b.filiale, 270, fy - 90, 110, 180);
    // Bäume und Laternen: Schatten am Boden
    const deko = [];
    const k0 = Math.floor((weg - (H - TOUR_Y) - 140) / 150), k1 = Math.ceil((weg + TOUR_Y + 140) / 150);
    for (let k = k0; k <= k1; k++) for (const seite of [0, 1]) {
      const d = k * 150 + seite * 75 + tour_zf(k * 2 + seite) * 50; const py = syW(d); if (py < -80 || py > H + 80) continue;
      if (seite === 1 && Math.abs(d - this.ziel) < 110) continue;
      deko.push({ art: tour_zf(k * 5 + seite + 3) < .62 ? 'baum' : 'lampe', px: seite ? 305 : 55, py, seite });
    }
    for (const d of deko) if (d.art === 'baum') { x.fillStyle = 'rgba(30,40,20,.22)'; x.beginPath(); x.ellipse(d.px + 8, d.py + 10, 22, 18, 0, 0, 7); x.fill(); } else { x.strokeStyle = 'rgba(30,20,10,.22)'; x.lineWidth = 3; x.beginPath(); x.moveTo(d.px + 3, d.py + 3); x.lineTo(d.px + (d.seite ? -20 : 20) + 8, d.py + 12); x.stroke(); }
    // Pfützen und Kisten am Boden
    for (const d of this.dinge || []) {
      if (d.y < -70 || d.y > H + 70) continue;
      const px = TOUR_SPUR[d.s];
      if (d.art === 'pfuetze') {
        x.fillStyle = radial(px, d.y, 4, 34, [[0, 'rgba(70,100,135,.75)'], [.7, 'rgba(80,110,140,.55)'], [1, 'rgba(80,110,140,0)']]);
        x.beginPath(); x.ellipse(px, d.y, 32, 20, 0, 0, 7); x.ellipse(px - 14, d.y + 8, 18, 12, 0, 0, 7); x.fill();
        x.strokeStyle = 'rgba(230,240,255,.55)'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(px - 12, d.y - 8); x.lineTo(px + 6, d.y - 11); x.moveTo(px + 10, d.y + 4); x.lineTo(px + 18, d.y + 2); x.stroke();
        const r = (zeit * 18) % 16; x.strokeStyle = `rgba(230,240,255,${.4 - r / 40})`; x.lineWidth = 1; x.beginPath(); x.ellipse(px + 4, d.y, r, r * .6, 0, 0, 7); x.stroke();
      }
    }
    for (const d of this.dinge || []) {
      if (d.y < -70 || d.y > H + 90 || d.art !== 'kiste' || d.weg) continue;
      const px = TOUR_SPUR[d.s], hb = Math.sin(zeit * 5 + d.s) * 2;
      x.fillStyle = radial(px, d.y, 6, 38, [[0, `rgba(255,214,90,${.45 + Math.sin(zeit * 6) * .12})`], [1, 'rgba(255,214,90,0)']]); x.beginPath(); x.arc(px, d.y, 38, 0, 7); x.fill();
      bodenSchatten(px + 4, d.y + 16, 24, 7, .4);
      x.save(); x.translate(px, d.y + hb);
      holz(-21, -17, 42, 34, 5, '#C98E52', '#8A5A2C');
      x.fillStyle = 'rgba(60,30,10,.55)'; rr(-17, -13, 34, 26, 3); x.fill();
      brot('baguette', -2, -5, 30, 9, { schatten: false, rot: -.15 }); brot('broetchen', -8, 5, 15, 11, { schatten: false }); brot('broetchen', 8, 5, 15, 11, { schatten: false, mohn: true });
      x.restore();
    }
    // Baustellen und Autos
    for (const d of this.dinge || []) {
      if (d.y < -80 || d.y > H + 120 || d.art === 'kiste' || d.art === 'pfuetze') continue;
      const px = TOUR_SPUR[d.s] + (d.dx || 0);
      x.save(); if (d.raus) x.globalAlpha = Math.max(0, 1 - d.raus.t * 1.2);
      x.translate(px, d.y); if (d.rot) x.rotate(d.rot);
      if (d.art === 'bau') { x.drawImage(b.bau, -38, -28, 76, 56); const an = Math.floor(zeit * 3) % 2; x.fillStyle = an ? '#FFD23A' : '#8A6A10'; x.beginPath(); x.arc(0, -10.5, 3.2, 0, 7); x.fill(); if (an) { x.fillStyle = radial(0, -10.5, 0, 16, [[0, 'rgba(255,220,80,.5)'], [1, 'rgba(255,220,80,0)']]); x.beginPath(); x.arc(0, -10.5, 16, 0, 7); x.fill(); } }
      else { const bild = d.lang ? b.laster[d.bild % b.laster.length] : b.autos[d.bild % b.autos.length]; x.drawImage(bild, -32, -55, 64, 110); }
      x.restore();
    }
    // Lieferwagen
    const blink = this.schutz > 0 && this.modus === 'fahrt' && Math.floor(this.schutz * 12) % 2 === 0;
    const rot = klemm(this.vx * .0016, -.22, .22) + this.wackelRot + (this.modus === 'aus' ? this.aus * 2.2 : 0);
    const ruckel = this.tempo > 0 ? Math.sin(zeit * 40) * .5 : 0;
    // Spiegelung des gelben Wagens auf nasser Straße
    if (hm.regen > .01) { x.fillStyle = linear(0, TOUR_Y + 40, 0, TOUR_Y + 110, [[0, `rgba(255,200,40,${.28 * hm.regen})`], [1, 'rgba(255,200,40,0)']]); x.fillRect(this.xs - 22, TOUR_Y + 40, 44, 70); }
    // Lichtkegel
    x.save(); x.translate(this.xs, TOUR_Y + ruckel); x.rotate(rot);
    x.fillStyle = linear(0, -50, 0, -130, [[0, 'rgba(255,240,180,.22)'], [1, 'rgba(255,240,180,0)']]);
    x.beginPath(); x.moveTo(-20, -48); x.lineTo(20, -48); x.lineTo(34, -128); x.lineTo(-34, -128); x.closePath(); x.fill();
    if (blink) x.globalAlpha = .4;
    x.drawImage(b.wagen, -36, -62, 72, 124);
    x.restore();
    // Fliegende Ware beim Abladen
    for (const f of this.fliegen) {
      if (f.t < 0) continue; const t = ease.aus(Math.min(1, f.t / .7)); const px = lerp(this.xs + 10, 318, t), py = lerp(TOUR_Y - 10, TOUR_Y - 8, t) - Math.sin(t * Math.PI) * 70;
      x.globalAlpha = f.t > .75 ? (1 - f.t) / .25 : 1; brot(f.art, px, py, f.art === 'baguette' ? 44 : 30, f.art === 'baguette' ? 12 : 22, { rot: t * 3 }); x.globalAlpha = 1;
    }
    // Baumkronen und Laternen (höher, darum mit Parallax)
    for (const d of deko) {
      if (d.art === 'baum') { const [px, py] = tour_proj(d.px, d.py, .1); x.drawImage(b.baum, px - 32, py - 32, 64, 64); if (hm.schnee > .01) { x.globalAlpha = hm.schnee; x.drawImage(b.baumSchnee, px - 32, py - 32, 64, 64); x.globalAlpha = 1; } }
      else {
        const [bx, by] = [d.px, d.py], [kx, ky] = tour_proj(d.px + (d.seite ? -22 : 22), d.py, .16);
        x.strokeStyle = '#3B3F45'; x.lineWidth = 3.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + (kx - bx) * .2, ky - 4, kx, ky); x.stroke();
        x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 1; x.beginPath(); x.moveTo(bx, by - 1); x.quadraticCurveTo(bx + (kx - bx) * .2, ky - 5, kx, ky - 1); x.stroke();
        x.fillStyle = '#2E3238'; rr(kx - 7, ky - 4.5, 14, 9, 4); x.fill(); x.fillStyle = '#FFF1BF'; rr(kx - 4.5, ky - 2, 9, 4, 2); x.fill();
        x.fillStyle = '#4A4F57'; x.beginPath(); x.arc(bx, by, 4, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(bx - 1, by - 1, 1.6, 0, 7); x.fill();
      }
    }
    this.lichtUndWetter(hm, deko, zeit);
    // Fahrtwind bei hohem Tempo
    if ((this.tempo || 0) > 330) { const a = Math.min(.35, (this.tempo - 330) / 500); x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const lx = 80 + tour_zf(i) * 200, ly = ((zeit * this.tempo * 1.6 + i * 97) % (H + 80)) - 40; x.beginPath(); x.moveTo(lx, ly); x.lineTo(lx, ly + 26); x.stroke(); } }
    vignette(.2);
    // Fortschritt zur nächsten Filiale
    const anteil = klemm(((this.weg || 0) - (this.abschnittStart || 0)) / Math.max(1, (this.ziel || 1) - (this.abschnittStart || 0)), 0, 1);
    x.fillStyle = 'rgba(255,251,242,.94)'; rr(40, H - 36, 280, 26, 13); x.fill();
    x.strokeStyle = 'rgba(75,42,20,.15)'; x.lineWidth = 1; x.stroke();
    text(`Filiale ${(this.filialen || 0) + (this.modus === 'abladen' ? 0 : 1)}`, 70, H - 23, { gr: 12, farbe: F.braun, schat: false });
    x.fillStyle = '#E8DCC6'; rr(100, H - 26, 180, 6, 3); x.fill();
    x.fillStyle = linear(100, 0, 280, 0, [[0, '#FFD95A'], [1, '#F2A900']]); rr(100, H - 26, 180 * anteil + 1, 6, 3); x.fill();
    // kleiner Wagen auf dem Balken
    const wxp = 100 + 180 * anteil; x.fillStyle = F.gold; rr(wxp - 9, H - 30, 18, 12, 3); x.fill(); x.strokeStyle = F.braun; x.lineWidth = 1.4; x.stroke(); x.fillStyle = '#5C86A8'; rr(wxp + 3, H - 28, 4, 5, 1); x.fill();
    // Ziel: kleine Markise
    x.save(); x.translate(298, H - 23); x.fillStyle = '#4B2A14'; rr(-9, -2, 18, 10, 2); x.fill(); for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#FFFBF2' : F.gold; x.fillRect(-10 + i * 5, -8, 5, 6); } x.restore();
    // Hinweis auf neues Wetter (unter dem Kollegen-Ziel)
    if (this.wetterHinweis && this.wetterHinweis.z > 0) {
      const a = Math.min(1, this.wetterHinweis.z / .5, (2.6 - this.wetterHinweis.z) / .3 + .01);
      x.globalAlpha = klemm(a, 0, 1); x.font = '800 14px "Plus Jakarta Sans", system-ui, sans-serif'; const w = x.measureText(this.wetterHinweis.t).width + 30;
      x.fillStyle = 'rgba(43,23,10,.72)'; rr(180 - w / 2, 76, w, 30, 15); x.fill(); text(this.wetterHinweis.t, 180, 91.5, { gr: 14, farbe: '#FFF1C2', schat: false }); x.globalAlpha = 1;
    }
    // Kurzer Hinweis am Anfang
    if (this.hinweis > 0 && this.modus === 'fahrt') {
      const a = Math.min(1, this.hinweis / .5); x.globalAlpha = a;
      x.fillStyle = 'rgba(43,23,10,.72)'; rr(60, 120, 240, 40, 20); x.fill();
      text('Tippe links oder rechts', 180, 140, { gr: 16, farbe: '#FFF1C2', schat: false });
      const pf = Math.sin(zeit * 6) * 4;
      x.fillStyle = '#FFF1C2'; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(180 + s * (150 + pf), 140); x.lineTo(180 + s * (136 + pf), 131); x.lineTo(180 + s * (136 + pf), 149); x.closePath(); x.fill(); }
      x.globalAlpha = 1;
    }
    // Ankunft: Banner
    if (this.modus === 'abladen') {
      const t = this.szene, sk = t < .4 ? ease.feder(t / .4) : 1, a = t > 1.8 ? Math.max(0, (2.1 - t) / .3) : 1;
      x.save(); x.globalAlpha = a; x.translate(180, 190); x.scale(sk, sk);
      schatten(14, 6, 'rgba(40,20,5,.4)'); x.fillStyle = linear(0, -34, 0, 34, [[0, '#FFFBF2'], [1, '#FFEBC0']]); rr(-120, -36, 240, 72, 22); x.fill(); ohneSchatten();
      x.strokeStyle = F.gold; x.lineWidth = 3; x.stroke();
      text('Geliefert!', 0, -6, { gr: 30, farbe: F.braun, schrift: 'Fraunces' });
      text(`Filiale ${this.filialen}  ·  +150`, 0, 22, { gr: 14, farbe: F.goldDunkel, schat: false });
      x.restore();
    }
  }
};
