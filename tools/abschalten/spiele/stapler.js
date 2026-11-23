// ═══ Brot-Stapler: Brote schwingen oben, Tippen lässt sie fallen, Überstand bricht ab ═══
const STAP_BRETT = 410;             // Oberkante des Brotbretts (Welt-y)
/** Jede Brotsorte stapelt sich anders: Höhe, Breite (Faktor), Spielraum für „Perfekt“, Schwung, Abbröseln beim Überstand */
const STAP_TYP = {
  laib: { name: 'Laib', h: 38, breite: 1, tol: 7, schwung: 1, broesel: 0 },
  stuten: { name: 'Stuten', h: 40, breite: 1, tol: 9, schwung: .9, broesel: 0 },
  baguette: { name: 'Baguette', h: 24, breite: 1.24, tol: 5, schwung: 1.18, broesel: 0 },
  brezel: { name: 'Brezel', h: 30, breite: 1, tol: 6, schwung: 1.06, broesel: 4 },
};
const STAP_SCHWER = { baguette: true, brezel: true };
const STAP_MAX = 136;
const STAP_BG = { bild: null, breite: 0, hoehe: 0 };

function stap_rekordHoehe(){ try { return Number(localStorage.getItem('lt_abschalten_stapler_hoehe')) || 0; } catch { return 0; } }
function stap_rekordHoeheSetzen(n){ try { if (n > stap_rekordHoehe()) localStorage.setItem('lt_abschalten_stapler_hoehe', String(n)); } catch {} }

/** Hintergrund (hohes Bäckerei-Regal) einmal zeichnen und als eigene Leinwand merken; senkrecht endlos wiederholbar */
function stap_backen(){
  x.save(); x.setTransform(c.width / W, 0, 0, c.height / H, 0, 0); x.clearRect(0, 0, W, H);
  // Rückwand aus dunklem Holz, senkrechte Bretter
  x.fillStyle = linear(0, 0, W, 0, [[0, '#4A2A14'], [.5, '#6A4022'], [1, '#4A2A14']]); x.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) {
    const bx = i * 40;
    x.fillStyle = `rgba(${i % 2 ? '255,220,170' : '30,12,2'},.05)`; x.fillRect(bx, 0, 40, H);
    x.fillStyle = 'rgba(20,8,0,.35)'; x.fillRect(bx, 0, 1.5, H);
    x.strokeStyle = 'rgba(30,12,2,.12)'; x.lineWidth = 1;
    for (let k = 0; k < 4; k++) { x.beginPath(); const sx = bx + 8 + k * 8; x.moveTo(sx, 0); for (let yy = 0; yy <= H; yy += 30) x.lineTo(sx + Math.sin((yy + i * 70 + k * 20) * .03) * 2, yy); x.stroke(); }
  }
  // Regalböden alle 160 px mit Broten in Körben
  const reihe = (ry, variante) => {
    // Inhalt
    const korb = (kx, kw, kh) => {
      x.beginPath(); x.moveTo(kx, ry - kh); x.lineTo(kx + kw, ry - kh); x.lineTo(kx + kw - 6, ry); x.lineTo(kx + 6, ry); x.closePath();
      x.fillStyle = linear(0, ry - kh, 0, ry, [[0, '#C98E4A'], [1, '#7C4E1E']]); x.fill();
      x.save(); x.clip(); x.strokeStyle = 'rgba(60,30,8,.4)'; x.lineWidth = 1;
      for (let r = 0; r < kh / 7; r++) for (let k = 0; k < kw / 9 + 1; k++) { x.beginPath(); x.ellipse(kx + k * 9 + (r % 2) * 4.5, ry - kh + 4 + r * 7, 4, 2.4, 0, 0, 7); x.stroke(); }
      x.restore();
      holz(kx - 2, ry - kh - 3, kw + 4, 5, 2.5, '#D9A35C', '#8E5A26');
    };
    if (variante === 0) {
      brot('baguette', 70, ry - 44, 70, 14, { rot: -1.2, schatten: false }); brot('baguette', 84, ry - 40, 66, 13, { rot: -1.0, schatten: false }); korb(46, 64, 24);
      brot('laib', 165, ry - 20, 58, 38, { schatten: false }); brot('laib', 222, ry - 19, 54, 36, { schatten: false });
      brot('broetchen', 280, ry - 32, 30, 20, { schatten: false }); brot('broetchen', 304, ry - 30, 30, 20, { schatten: false, mohn: true }); korb(264, 66, 20);
    } else if (variante === 1) {
      brot('stuten', 72, ry - 19, 70, 38, { schatten: false }); brot('krusti', 150, ry - 16, 64, 32, { schatten: false });
      brot('brezel', 222, ry - 22, 46, 34, { schatten: false }); brot('brezel', 262, ry - 22, 46, 34, { schatten: false }); brot('brezel', 302, ry - 22, 46, 34, { schatten: false });
    } else {
      brot('krusti', 64, ry - 16, 64, 32, { schatten: false }); brot('krusti', 128, ry - 16, 60, 30, { schatten: false });
      brot('broetchen', 196, ry - 30, 30, 20, { schatten: false }); brot('broetchen', 222, ry - 31, 30, 20, { schatten: false }); korb(180, 62, 20);
      brot('stuten', 290, ry - 19, 70, 38, { schatten: false });
    }
    // Brett mit Kante und Schatten
    x.fillStyle = 'rgba(20,8,0,.35)'; x.fillRect(14, ry + 10, W - 28, 10);
    holz(10, ry, W - 20, 11, 2, '#B98450', '#7C5128');
    x.fillStyle = 'rgba(255,235,200,.35)'; x.fillRect(10, ry, W - 20, 1.5);
  };
  reihe(150, 0); reihe(310, 1); reihe(470, 2);
  // Seitenpfosten
  [0, W - 16].forEach((px) => { x.fillStyle = linear(px, 0, px + 16, 0, [[0, '#5E3A1C'], [.4, '#A06C3C'], [1, '#4A2A14']]); x.fillRect(px, 0, 16, H); });
  // Dunst: Regal nach hinten schieben
  x.fillStyle = 'rgba(34,16,6,.52)'; x.fillRect(0, 0, W, H);
  x.restore();
  const l = document.createElement('canvas'); l.width = c.width; l.height = c.height; const lc = l.getContext('2d');
  // leicht unscharf = Tiefe (wo der Browser es kann)
  if ('filter' in lc) lc.filter = `blur(${(1.6 * c.width / W).toFixed(1)}px)`;
  lc.drawImage(c, 0, 0); lc.filter = 'none';
  STAP_BG.bild = l; STAP_BG.breite = c.width; STAP_BG.hoehe = c.height;
}

/** Goldlaib: ganz seltenes Goldstück im Brot-Stapler */
function stap_goldLaib(cx, cy, w, h){
  x.save(); x.translate(cx, cy);
  x.beginPath(); x.ellipse(0, 0, w / 2, h / 2, 0, 0, 7);
  x.fillStyle = radial(0, h * .1, 2, Math.max(w, h) * .62, [[0, '#FFF1B8'], [.5, '#FFC72C'], [1, '#C98A00']], -w * .18, -h * .3); x.fill();
  x.strokeStyle = '#8C5A00'; x.lineWidth = 1.6; x.stroke();
  x.save(); x.clip();
  x.fillStyle = linear(0, -h / 2, 0, h / 2, [[0, 'rgba(255,255,230,.45)'], [.5, 'rgba(255,255,230,0)'], [1, 'rgba(120,70,0,.35)']]); x.fillRect(-w / 2, -h / 2, w, h);
  x.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const px = -w * .28 + i * w * .28;
    x.strokeStyle = 'rgba(150,95,0,.6)'; x.lineWidth = Math.max(2.4, h * .14); x.beginPath(); x.moveTo(px - w * .06, h * .2 + 1); x.quadraticCurveTo(px, -2, px + w * .06, -h * .2 + 1); x.stroke();
    x.strokeStyle = 'rgba(255,248,210,.95)'; x.lineWidth = Math.max(1.2, h * .07); x.beginPath(); x.moveTo(px - w * .06, h * .2); x.quadraticCurveTo(px, -3, px + w * .06, -h * .2); x.stroke();
  }
  x.fillStyle = radial(-w * .2, -h * .25, 0, w * .3, [[0, 'rgba(255,255,255,.6)'], [1, 'rgba(255,255,255,0)']]); x.fillRect(-w / 2, -h / 2, w, h);
  x.restore(); x.restore();
}
/** Geist: blasse Markierung, wie hoch der beste Versuch zur gleichen Zeit war */
function stap_geistSchild(px, py, txt, pfeil){
  x.font = '800 11.5px "Plus Jakarta Sans", system-ui, sans-serif'; const w = x.measureText(txt).width + (pfeil ? 30 : 20);
  rr(px - w, py - 11, w, 22, 11); x.fillStyle = 'rgba(52,72,110,.82)'; x.fill();
  x.strokeStyle = 'rgba(205,228,255,.75)'; x.lineWidth = 1; x.stroke();
  if (pfeil) { const ax = px - w + 12, d = pfeil; x.fillStyle = '#DDEBFF'; x.beginPath(); x.moveTo(ax, py - 6 * d); x.lineTo(ax - 5, py + 3 * d); x.lineTo(ax + 5, py + 3 * d); x.closePath(); x.fill(); }
  text(txt, px - w / 2 + (pfeil ? 5 : 0), py + .5, { gr: 11.5, farbe: '#EEF5FF', schat: false });
}

/** Ein (evtl. abgeschnittenes) Brot zeichnen: volles Brot bei fx mit Breite fw, sichtbar nur zwischen l und r */
function stap_stueck(s, cy, { glanz = 0 } = {}){
  const h = s.h;
  x.save();
  x.beginPath(); x.rect(s.l, cy - h, s.r - s.l, h * 2); x.clip();
  if (s.gold) stap_goldLaib(s.fx, cy, s.fw, h);
  else if (s.art === 'brezel') {
    // Brezeln aneinander: luftig, mit Lücken
    const n = Math.max(1, Math.round(s.fw / 44)), pw = s.fw / n;
    for (let i = 0; i < n; i++) { const bx = s.fx - s.fw / 2 + pw * (i + .5); x.save(); x.translate(bx, cy + 1); x.scale(1, h / (pw * .66)); brot('brezel', 0, 0, pw * 1.02, h, { schatten: false }); x.restore(); }
  }
  else brot(s.art, s.fx, cy, s.fw, h, { schatten: false, ton: s.ton ?? 1, mohn: s.mohn });
  if (s.art === 'stuten' && !s.gold) {
    // aufgerissene Oberseite wie beim echten Stuten, dazu Backform-Kante
    const ky = cy - h * .2, a = s.fw * .36;
    x.lineCap = 'round';
    x.strokeStyle = 'rgba(110,55,15,.5)'; x.lineWidth = 4; x.beginPath(); x.moveTo(s.fx - a, ky + 1); x.bezierCurveTo(s.fx - a * .4, ky - 3, s.fx + a * .4, ky + 3, s.fx + a, ky - 1); x.stroke();
    x.strokeStyle = 'rgba(255,226,170,.9)'; x.lineWidth = 2; x.beginPath(); x.moveTo(s.fx - a, ky); x.bezierCurveTo(s.fx - a * .4, ky - 4, s.fx + a * .4, ky + 2, s.fx + a, ky - 2); x.stroke();
    x.fillStyle = 'rgba(70,30,5,.22)'; x.fillRect(s.fx - s.fw / 2, cy + h * .3, s.fw, h * .2);
  }
  x.restore();
  // Schnittflächen mit heller Krume
  const flaeche = (kx, seite) => {
    const u = klemm((kx - s.fx) / (s.fw / 2), -1, 1);
    const rund = s.art === 'laib' || s.art === 'krusti';
    const hh = rund ? h / 2 * Math.sqrt(Math.max(0, 1 - u * u)) : s.art === 'baguette' ? h / 2 * (Math.abs(u) > .8 ? Math.sqrt(Math.max(0, 1 - Math.pow((Math.abs(u) - .8) / .2, 2))) : 1) : h * .41;
    if (hh < 2) return;
    const my = s.art === 'stuten' ? cy + h * .09 : cy;
    const fx = kx - seite * 2.6;
    x.fillStyle = linear(fx - 3, my - hh, fx + 3, my + hh, s.art === 'laib' ? [[0, '#D8B48A'], [1, '#A9825A']] : [[0, '#FFF1D2'], [1, '#E5C48C']]);
    x.beginPath(); x.ellipse(fx, my, 3.4, hh * .94, 0, 0, 7); x.fill();
    x.fillStyle = 'rgba(150,100,50,.35)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(fx + (i % 2 - .5), my - hh * .5 + i * hh * .32, .8, 0, 7); x.fill(); }
  };
  if (s.art !== 'brezel' && s.l > s.fx - s.fw / 2 + .8) flaeche(s.l, -1);
  if (s.art !== 'brezel' && s.r < s.fx + s.fw / 2 - .8) flaeche(s.r, 1);
  if (glanz > 0) {
    x.save(); x.globalAlpha = glanz;
    x.fillStyle = radial((s.l + s.r) / 2, cy, 4, (s.r - s.l) * .7, [[0, 'rgba(255,236,150,.85)'], [1, 'rgba(255,200,60,0)']]);
    x.fillRect(s.l - 40, cy - h * 1.6, s.r - s.l + 80, h * 3.2);
    x.restore();
  }
}

// ── Version 290: Powerups (Karten bei 5, 15, 25 … Broten, besondere Brote zum Stapeln) ──
const STAP_VERB = {
  ruhig: { n: 'Ruhige Hand', z: ['Brot schwingt', '12 % langsamer'], max: 2, sym: () => SYM.uhr() },
  genau: { n: 'Gutes Auge', z: ['Perfekt klappt', 'etwas leichter'], max: 2, sym: () => SYM.ziel() },
  netz: { n: 'Auffangnetz', z: ['Einmal daneben', 'wird gerettet'], max: 2, sym: () => SYM.netz() },
  bonus: { n: 'Goldene Kruste', z: ['+50 % Bonus', 'für Perfekt'], max: 2, sym: () => SYM.stern() },
  hefe: { n: 'Mehr Hefe', z: ['Geht schon nach', '2× Perfekt auf'], max: 1, sym: () => SYM.breit() },
  glueck: { n: 'Glückstüte', z: ['Besondere Brote', 'kommen öfter'], max: 2, sym: () => SYM.blitz() },
};
const STAP_POWER = { breit: { k: 'Hefeteig: macht breiter', sym: () => SYM.breit() }, langsam: { k: 'Zeitlupe: 3 Brote langsam', sym: () => SYM.uhr() }, guss: { k: 'Zuckerguss: klebt perfekt', sym: () => SYM.stern() } };

SPIELE.stapler = {
  key: 'stapler', name: 'Brot-Stapler', kurz: 'Stapeln',
  anleitung: 'Das Brot schwingt oben hin und her. Tippe, damit es fällt. Was übersteht, bricht ab. Stuten liegt stabil, das Baguette ist lang, aber flink, die Brezel wackelt. Oben links siehst du, was als Nächstes kommt.',
  start(){
    this.stapel = [{ art: 'brett', typ: 'stuten', l: 112, r: 248, fx: 180, fw: 136, h: 0, y: STAP_BRETT, sq: 0, glanz: 0 }];
    this.oben = STAP_BRETT; this.kamera = 0; this.zeit = 0;
    this.perfekt = 0; this.bonus = 0; this.anzahl = 0; this.stuecke = []; this.tot = -1; this.fertig = false; this.frageIn = -1;
    this.rekordH = stap_rekordHoehe(); this.rekordGezeigt = false;
    this.gem = typeof rundeGemuetlich !== 'undefined' ? rundeGemuetlich : (typeof GEMUETLICH !== 'undefined' && GEMUETLICH);
    this.zielZeile = null; this.zielSchaetzen();
    // Geister-Lauf: Zeitpunkte (Zehntelsekunden), zu denen im besten Versuch ein Brot lag
    this.landeZeiten = [];
    const gd = !this.gem && typeof geistLesen === 'function' ? geistLesen('stapler') : null;
    this.geist = gd && Array.isArray(gd.t) && gd.t.length > 1 ? { t: gd.t, e: gd.e || gd.t[gd.t.length - 1] + 20, aus: false } : null;
    this.goldZeit = zufall(15, 40);
    this.folge = []; this.naechste = null; this.verb = {}; this.netzRest = 0; this.langsamN = 0; this.kartenIn = 0;
    this.neuesBrot(STAP_MAX);
  },
  /** Faire Reihenfolge: erst nur Laib und Stuten, nie zwei schwierige direkt hintereinander am Anfang */
  sorteWaehlen(i){
    if (i < 4) return Math.random() < .5 ? 'laib' : 'stuten';
    const f = this.folge, l1 = f[f.length - 1], l2 = f[f.length - 2];
    const ohneSchwer = (STAP_SCHWER[l1] && (i < 14 || STAP_SCHWER[l2]));
    const topf = ohneSchwer ? ['laib', 'laib', 'stuten', 'stuten'] : ['laib', 'laib', 'stuten', 'stuten', 'baguette', 'baguette', 'brezel', 'brezel'];
    return topf[ganz(0, topf.length - 1)];
  },
  neuesBrot(w){
    const n = this.anzahl;
    const typ = this.naechste || this.sorteWaehlen(n);
    this.folge.push(typ); this.naechste = this.sorteWaehlen(n + 1); this.vorschauT = 0;
    const T = STAP_TYP[typ], art = typ === 'laib' ? (Math.random() < .5 ? 'laib' : 'krusti') : typ;
    const bw = typ === 'baguette' ? Math.min(STAP_MAX + 24, w * T.breite + 6) : w;
    const links = n % 2 === 0;
    const omega = (this.gem ? 1.3 : Math.min(4.1, 1.85 + n * .075)) * (this.gem ? 1 : T.schwung) * (1 - .12 * ((this.verb && this.verb.ruhig) || 0)) * (this.langsamN > 0 ? .6 : 1);
    if (this.langsamN > 0) this.langsamN--;
    this.akt = { typ, art, w: bw, h: T.h, ph: links ? -Math.PI / 2 : Math.PI / 2, omega, zustand: 'haengt', sperre: .32, ein: 0, y: 0, vy: 0, mohn: art === 'krusti' && Math.random() < .3 };
    this.akt.x = this.pendelX(this.akt);
    // besonderes Brot (Powerup), nicht am Anfang
    if (n >= 5 && Math.random() < .1 * (1 + .6 * ((this.verb && this.verb.glueck) || 0))) { const arten = Object.keys(STAP_POWER); this.akt.pw = arten[ganz(0, arten.length - 1)]; }
  },
  pendelX(a){ const amp = Math.max(40, W / 2 - a.w / 2 - 14); return W / 2 + Math.sin(a.ph) * amp; },
  hangY(){ return this.oben - 96 - this.akt.h / 2; },
  ganzesBrot(a){ return { typ: a.typ, gold: a.gold, art: a.art, l: a.x - a.w / 2 - 1, r: a.x + a.w / 2 + 1, fx: a.x, fw: a.w, h: a.h, mohn: a.mohn }; },
  top(){ return this.stapel[this.stapel.length - 1]; },
  punkte(){ return this.anzahl * 10 + this.bonus; },
  aktuellePunkte(){ return this.punkte(); },
  geistDaten(){ return this.landeZeiten && this.landeZeiten.length > 1 ? { v: 1, t: this.landeZeiten, e: Math.round(this.zeit * 10) } : null; },
  /** Wie viele Brote lagen im besten Versuch nach der gleichen Zeit? */
  geistBrote(){ const g = this.geist; if (!g || g.aus) return -1; const z = this.zeit * 10; let n = 0; while (n < g.t.length && g.t[n] <= z) n++; return n; },
  medaillen: [150, 500, 1200],
  /** Höhe (in Broten) grob schätzen, bei der der nächste Kollegen-Rekord erreicht wäre */
  zielSchaetzen(){
    const z = !this.gem && typeof naechstesZiel === 'function' && typeof spiel !== 'undefined' && spiel === this ? naechstesZiel(this.punkte()) : null;
    if (!z) { this.zielZeile = null; return; }
    const rate = this.anzahl > 3 ? Math.max(10, this.punkte() / this.anzahl) : 14;
    this.zielZeile = { name: z.name, n: this.anzahl + Math.max(1, Math.ceil((z.punkte - this.punkte()) / rate)) };
  },

  runter(){
    const a = this.akt;
    if (this.tot >= 0 || !a || a.zustand !== 'haengt' || a.sperre > 0) return; // gerade erst erschienen: Doppeltippen zählt nicht
    a.zustand = 'faellt'; a.y = this.hangY(); a.vy = 260;
    this.seilWeg = 1;
  },
  taste(k){ if (k === ' ' || k === 'ArrowDown' || k === 'Enter') this.runter(); },

  landen(){
    const a = this.akt, t = this.top(), cy = this.oben - a.h / 2;
    const al = a.x - a.w / 2, ar = a.x + a.w / 2;
    const tm = (t.l + t.r) / 2;
    let l = Math.max(al, t.l), r = Math.min(ar, t.r);
    if (r - l < 4 && this.netzRest > 0) { this.netzRest--; a.x = tm; schwebText('Auffangnetz!', W / 2, cy + this.kamera - 60, '#3E6FB5', 22); return this.landen(); }
    if (r - l < 4) {
      // Daneben: Brot kippt herunter
      const kippt = a.x < tm ? -1 : 1;
      this.stuecke.push({ typ: a.typ, gold: a.gold, art: a.art, l: al, r: ar, fx: a.x, fw: a.w, h: a.h, mohn: a.mohn, px: a.x, py: cy, vx: kippt * 90, vy: -60, rot: 0, vr: kippt * 3.2 });
      this.tot = 0; wackeln(8); blitz(.25, '255,200,180'); brumm(70);
      schwebText('Daneben!', W / 2, cy + this.kamera - 60, F.rot, 24);
      stap_rekordHoeheSetzen(this.anzahl);
      return;
    }
    const neu = { typ: a.typ, art: a.art, h: a.h, mohn: a.mohn, y: cy, sq: 1, glanz: 0, wackel: a.typ === 'brezel' ? 1 : 0 };
    const dx = a.x - tm, T = STAP_TYP[a.typ] || STAP_TYP.laib;
    // Spielraum: Sorte selbst, dazu die Fläche darunter (Stuten eben, Brezel uneben)
    let tol = Math.max(3, T.tol + (t.typ === 'stuten' ? 2 : t.typ === 'brezel' ? -2 : 0)) + 2 * (this.verb.genau || 0);
    if (a.pw === 'guss') tol = Math.max(tol, 20);
    if (Math.abs(dx) < tol) {
      // Perfekt: einrasten, nichts bricht ab
      this.perfekt++; if (typeof statMax === 'function') statMax('perfektFolge', this.perfekt);
      neu.fx = tm; neu.fw = a.w; neu.l = Math.max(tm - a.w / 2, t.l); neu.r = Math.min(tm + a.w / 2, t.r);
      if (neu.r - neu.l < a.w - 1) { // langes Baguette: Enden brechen sauber ab
        const sy0 = cy + this.kamera;
        this.stuecke.push({ typ: a.typ, art: a.art, l: tm - a.w / 2, r: neu.l, fx: tm, fw: a.w, h: a.h, px: (tm - a.w / 2 + neu.l) / 2, py: cy, vx: -60, vy: -90, rot: 0, vr: -3 });
        this.stuecke.push({ typ: a.typ, art: a.art, l: neu.r, r: tm + a.w / 2, fx: tm, fw: a.w, h: a.h, px: (neu.r + tm + a.w / 2) / 2, py: cy, vx: 60, vy: -90, rot: 0, vr: 3 });
        teilchen(neu.l, sy0, { n: 6, form: 'krume', farben: ['#F4D9A6', '#C27F36'], tempo: 100, schwer: 700, groesse: [2, 3.5] }); teilchen(neu.r, sy0, { n: 6, form: 'krume', farben: ['#F4D9A6', '#C27F36'], tempo: 100, schwer: 700, groesse: [2, 3.5] });
      }
      neu.glanz = 1;
      const bon = Math.round(Math.min(25, this.perfekt * 5) * (1 + .5 * (this.verb.bonus || 0))); this.bonus += bon;
      const sy = cy + this.kamera;
      blitz(.18, '255,225,140'); brumm(25);
      teilchen(tm, sy, { n: 22, form: 'stern', tempo: 190, groesse: [2.5, 5.5], leben: [.5, .9], schwer: 260 });
      schwebText(this.perfekt > 1 ? `Perfekt ×${this.perfekt}  +${10 + bon}` : `Perfekt! +${10 + bon}`, W / 2, sy - 56, '#B07A00', 22);
      if (this.perfekt % (this.verb.hefe ? 2 : 3) === 0) {
        // Brot geht auf: wird breiter
        const nw = Math.min(STAP_MAX, a.w + 16);
        if (nw > a.w) { neu.fw = nw; neu.l = tm - nw / 2; neu.r = tm + nw / 2; neu.auf = 1; mehlWolke(tm, sy - 10, 12); setTimeout(() => { schwebText('Geht auf! Breiter', W / 2, sy - 92, F.braun, 20); brumm(30); }, 260); }
      }
    } else {
      this.perfekt = 0;
      // Brezel ist luftig: an der Bruchstelle bröselt noch etwas mehr ab
      if (T.broesel) { if (al < l - .5) l = Math.min(r - 6, l + T.broesel); if (ar > r + .5) r = Math.max(l + 6, r - T.broesel); }
      neu.fx = a.x; neu.fw = a.w; neu.l = l; neu.r = r;
      const sy = cy + this.kamera;
      // Überstand bricht ab
      if (al < l - .5) { this.stuecke.push({ typ: a.typ, gold: a.gold, art: a.art, l: al, r: l, fx: a.x, fw: a.w, h: a.h, mohn: a.mohn, px: (al + l) / 2, py: cy, vx: -50 - (l - al) * .6, vy: -80, rot: 0, vr: -zufall(2.5, 4.5) }); teilchen(l, sy, { n: 9, form: 'krume', farben: ['#F4D9A6', '#C27F36', '#E3AE68'], tempo: 120, schwer: 700, groesse: [2, 4] }); }
      if (ar > r + .5) { this.stuecke.push({ typ: a.typ, gold: a.gold, art: a.art, l: r, r: ar, fx: a.x, fw: a.w, h: a.h, mohn: a.mohn, px: (r + ar) / 2, py: cy, vx: 50 + (ar - r) * .6, vy: -80, rot: 0, vr: zufall(2.5, 4.5) }); teilchen(r, sy, { n: 9, form: 'krume', farben: ['#F4D9A6', '#C27F36', '#E3AE68'], tempo: 120, schwer: 700, groesse: [2, 4] }); }
      schwebText('+10', a.x, sy - 40, F.gruen, 18);
    }
    if (a.gold) {
      neu.gold = true; this.bonus += 50;
      if (typeof goldGefangen === 'function') goldGefangen(a.x, cy + this.kamera);
      schwebText('+50', a.x, cy + this.kamera - 70, '#B07A00', 20);
    }
    if (a.pw === 'breit') { const m = (neu.l + neu.r) / 2, nw = Math.min(STAP_MAX, neu.r - neu.l + 26); neu.l = m - nw / 2; neu.r = m + nw / 2; neu.fx = m; neu.fw = Math.max(neu.fw, nw); neu.auf = 1; schwebText('Hefeteig: breiter!', W / 2, cy + this.kamera - 92, F.gruen, 18); }
    if (a.pw === 'langsam') { this.langsamN = 3; schwebText('Zeitlupe für 3 Brote', W / 2, cy + this.kamera - 92, '#3E6FB5', 18); }
    if (a.pw) { teilchen(a.x, cy + this.kamera, { n: 20, form: 'stern', tempo: 180, farben: ['#FFC72C', '#FFF1B8', '#FFFFFF'] }); brumm(25); }
    this.stapel.push(neu); this.anzahl++;
    this.landeZeiten.push(Math.round(this.zeit * 10));
    if (typeof statPlus === 'function') statPlus('brote', 1);
    this.oben = cy - a.h / 2;
    if (this.rekordH && this.anzahl === this.rekordH + 1 && !this.rekordGezeigt) { this.rekordGezeigt = true; setTimeout(() => schwebText('Neue Bestmarke!', W / 2, 150, '#B07A00', 22), 400); }
    if (this.anzahl % 10 === 0) this.frageIn = .55;
    if (this.anzahl % 10 === 5 && !this.gem) this.kartenIn = .5;
    this.zielSchaetzen();
    this.neuesBrot(neu.r - neu.l);
    // Goldlaib: ganz selten, nicht am Anfang
    if (this.anzahl >= 4 && this.zeit > this.goldZeit && typeof goldKommt === 'function' && goldKommt()) {
      Object.assign(this.akt, { gold: true, goldT: 5.5, typ: 'laib', art: 'laib', h: STAP_TYP.laib.h, mohn: false });
      if (this.akt.w > this.top().r - this.top().l) { this.akt.w = this.top().r - this.top().l; this.akt.x = this.pendelX(this.akt); }
      goldErschienen();
    }
  },

  tick(dt){
    this.zeit += dt;
    const a = this.akt;
    // Kamera fährt mit
    const ziel = Math.max(0, 300 - this.oben);
    this.kamera += (ziel - this.kamera) * Math.min(1, dt * 3.5);
    for (const s of this.stapel) { if (s.wackel) s.wackel = Math.max(0, s.wackel - dt * 1.4); s.sq = Math.max(0, s.sq - dt * 3); s.glanz = Math.max(0, s.glanz - dt * 1.1); if (s.auf) s.auf = Math.max(0, s.auf - dt * 2.5); }
    for (const p of this.stuecke) { p.vy += 1500 * dt; p.px += p.vx * dt; p.py += p.vy * dt; p.rot += p.vr * dt; }
    this.stuecke = this.stuecke.filter((p) => p.py + this.kamera < H + 120);
    this.seilWeg = Math.max(0, (this.seilWeg || 0) - dt * 3);
    if (this.kartenIn > 0 && this.tot < 0) { this.kartenIn -= dt; if (this.kartenIn <= 0) karten(kartenAuswahl(STAP_VERB, this.verb), 'Powerup für den Stapel', (k) => { this.verb[k] = (this.verb[k] || 0) + 1; if (k === 'netz') this.netzRest++; this.akt.sperre = .4; }); }

    if (this.tot >= 0) {
      this.tot += dt;
      if (this.tot > 1.1 && !this.fertig) { this.fertig = true; const n = this.anzahl; ende(this.punkte(), n === 0 ? 'Kein Brot gestapelt. Gleich nochmal!' : `${n} ${n === 1 ? 'Brot' : 'Brote'} hoch gestapelt.`); }
      this.hud(); return;
    }
    if (this.frageIn > 0) {
      this.frageIn -= dt;
      if (this.frageIn <= 0) {
        this.frageIn = -1;
        frage((ok) => {
          if (ok) {
            this.bonus += 50;
            const t = this.top(), m = (t.l + t.r) / 2, nw = Math.min(STAP_MAX, t.r - t.l + 20);
            t.fx = m; t.fw = nw; t.l = m - nw / 2; t.r = m + nw / 2; t.auf = 1; t.sq = 1;
            this.akt.w = nw; this.akt.x = this.pendelX(this.akt); this.akt.sperre = .4;
            schwebText('Richtig! +50, breiteres Brot', W / 2, 170, F.gruen, 18);
            teilchen(m, this.oben + this.kamera, { n: 20, form: 'stern', tempo: 180, groesse: [3, 6] });
          } else schwebText('Weiter geht\'s', W / 2, 170, F.braun, 20);
        });
      }
    }
    if (this.geist && !this.geist.aus && this.zeit * 10 > this.geist.e) {
      this.geist.aus = true;
      const n = this.geist.t.length, st = this.stapel, sy = (st[n] ? st[n].y - st[n].h / 2 : this.oben - (n - this.anzahl) * 32) + this.kamera;
      if (sy > 60 && sy < H) { teilchen(W - 60, sy, { n: 14, farben: ['rgba(220,235,255,.9)', 'rgba(255,255,255,.8)'], tempo: 80, groesse: [3, 7], schwer: -30, leben: [.5, .9] }); schwebText('Bester Versuch vorbei', W - 110, sy - 22, '#9DB8E0', 14); }
    }
    if (a.zustand === 'haengt' && a.gold) {
      a.goldT -= dt;
      if (a.goldT <= 0) {
        const hy = this.hangY() + this.kamera;
        teilchen(a.x, hy, { n: 18, form: 'stern', farben: ['#FFC72C', '#FFF1B8'], tempo: 140, groesse: [2, 4], schwer: -60 });
        schwebText('Goldlaib ist weg', a.x, hy - 30, '#B07A00', 16);
        const w = a.w; this.neuesBrot(w); this.akt.sperre = .5;
      }
    }
    this.vorschauT = (this.vorschauT || 0) + dt;
    if (a.zustand === 'haengt') {
      a.sperre = Math.max(0, a.sperre - dt); a.ein = Math.min(1, a.ein + dt * 4);
      a.ph += a.omega * dt; a.x = this.pendelX(a);
    } else if (a.zustand === 'faellt') {
      a.vy += 2600 * dt; a.y += a.vy * dt;
      if (a.y + a.h / 2 >= this.oben) { a.y = this.oben - a.h / 2; this.landen(); }
    }
    this.hud();
  },
  hud(){
    // nur zwei Pillen: in der Mitte sitzt der Pause-Knopf; die Perfekt-Serie steht im Bild
    setHud([{ icon: 'flagge', text: `${this.anzahl} hoch` }, { icon: 'punkte', text: this.punkte().toLocaleString('de-DE') }]);
  },

  malen(t){
    if (!STAP_BG.bild || STAP_BG.breite !== c.width || STAP_BG.hoehe !== c.height) stap_backen();
    const kam = this.kamera || 0;
    // Regal mit Parallaxe (senkrecht endlos)
    const ky = c.height / H, o = ((kam * .45) % H + H) % H;
    x.drawImage(STAP_BG.bild, 0, 0, STAP_BG.bild.width, STAP_BG.bild.height, 0, o - H, W, H + .5);
    x.drawImage(STAP_BG.bild, 0, 0, STAP_BG.bild.width, STAP_BG.bild.height, 0, o, W, H);
    void ky;
    // Warmes Licht auf den Stapel
    x.fillStyle = radial(W / 2, 250, 20, 300, [[0, 'rgba(255,214,140,.38)'], [.6, 'rgba(255,190,110,.12)'], [1, 'rgba(255,190,110,0)']]); x.fillRect(0, 0, W, H);

    for (let i = 0; i < 18; i++) { const px = (zufallFest(i) * W + t * (6 + i % 5 * 3)) % W, py = ((zufallFest(i + 30) * H - t * (4 + i % 3 * 2) + kam * .7) % H + H) % H; x.globalAlpha = .25 + .2 * Math.sin(t * 2 + i); x.fillStyle = '#FFF3D6'; x.beginPath(); x.arc(px, py, 1 + (i % 3) * .5, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    x.save(); x.translate(0, kam);
    // Theke unten
    const ty = STAP_BRETT + 14;
    if (ty + kam < H + 10) {
      x.fillStyle = linear(0, ty, 0, ty + 14, [[0, '#E8D3B0'], [1, '#C7A97C']]); x.fillRect(0, ty, W, 14);
      x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, ty, W, 1.5);
      holz(0, ty + 14, W, 120, 0, '#9C6A3C', '#5E3A1C');
      for (let i = 0; i < 4; i++) { rr(14 + i * 86, ty + 28, 74, 80, 6); x.strokeStyle = 'rgba(40,20,5,.35)'; x.lineWidth = 2; x.stroke(); x.strokeStyle = 'rgba(255,230,190,.15)'; x.lineWidth = 1; rr(15 + i * 86, ty + 29, 74, 80, 6); x.stroke(); }
      // Brotbrett
      bodenSchatten(180, ty + 2, 96, 8, .45);
      holz(98, STAP_BRETT, 164, 14, 7, '#D7A266', '#8E5A2C');
      x.fillStyle = '#5E3A1C'; x.beginPath(); x.ellipse(250, STAP_BRETT + 7, 4, 2.6, 0, 0, 7); x.fill();
    }
    // Höhenmarken links
    const st = this.stapel || [];
    for (let i = 5; i < st.length; i += 5) {
      const sy = st[i].y - st[i].h / 2;
      if (sy + kam < -20 || sy + kam > H + 20) continue;
      x.strokeStyle = 'rgba(255,230,180,.35)'; x.setLineDash([4, 5]); x.lineWidth = 1.2; x.beginPath(); x.moveTo(20, sy); x.lineTo(70, sy); x.stroke(); x.setLineDash([]);
      rr(20, sy - 11, 30, 18, 9); x.fillStyle = 'rgba(43,23,10,.8)'; x.fill();
      text(String(i), 35, sy - 2, { gr: 11, farbe: '#FFE7A0', schat: false });
    }
    const gn = laeuft && this.tot < 0 ? this.geistBrote() : -1;
    // Bestmarke
    if (this.rekordH > 0 && st.length > this.rekordH) {
      const s = st[this.rekordH], sy = s.y - s.h / 2;
      if (sy + kam > -20 && sy + kam < H + 20) { x.strokeStyle = 'rgba(255,199,44,.85)'; x.setLineDash([7, 5]); x.lineWidth = 2; x.beginPath(); x.moveTo(16, sy); x.lineTo(W - 16, sy); x.stroke(); x.setLineDash([]); if (gn !== this.rekordH) text('Bestmarke', W - 56, sy - 10, { gr: 11, farbe: '#FFD86B' }); }
    } else if (this.rekordH > 0 && laeuft) {
      // Bestmarke liegt noch höher: Abstand schätzen
      const sy = this.oben - (this.rekordH - this.anzahl) * 30;
      if (sy + kam > 50 && sy + kam < H) { x.strokeStyle = 'rgba(255,199,44,.75)'; x.setLineDash([7, 5]); x.lineWidth = 2; x.beginPath(); x.moveTo(16, sy); x.lineTo(W - 16, sy); x.stroke(); x.setLineDash([]); text('Bestmarke', W - 56, sy - 10, { gr: 11, farbe: '#FFD86B' }); }
    }
    // Geist: wie hoch war der beste Versuch zur gleichen Zeit
    if (gn >= 0) {
      const sy = gn === 0 ? STAP_BRETT : st[gn] ? st[gn].y - st[gn].h / 2 : this.oben - (gn - this.anzahl) * 32;
      const diff = gn - this.anzahl;
      if (sy + kam < 100) stap_geistSchild(W - 12, 100 - kam, `Bester Versuch +${diff}`, 1);
      else if (sy + kam > H - 20) stap_geistSchild(W - 12, H - 30 - kam, `Bester Versuch ${diff}`, -1);
      else {
        x.strokeStyle = 'rgba(205,228,255,.8)'; x.setLineDash([4, 4]); x.lineWidth = 2; x.beginPath(); x.moveTo(W * .52, sy); x.lineTo(W - 16, sy); x.stroke(); x.setLineDash([]);
        x.fillStyle = 'rgba(205,228,255,.9)'; x.beginPath(); x.arc(W * .52, sy, 3, 0, 7); x.fill();
        stap_geistSchild(W - 12, sy - 15, diff === 0 ? 'Bester Versuch: gleichauf' : 'Bester Versuch', 0);
      }
    }
    // Kollegen-Ziel
    if (this.zielZeile && laeuft) {
      const zn = this.zielZeile.n, sy = st[zn] ? st[zn].y - st[zn].h / 2 : this.oben - (zn - this.anzahl) * 32;
      if (sy + kam > 70 && sy + kam < H) {
        x.strokeStyle = 'rgba(125,190,110,.9)'; x.setLineDash([10, 6]); x.lineWidth = 2.2; x.beginPath(); x.moveTo(16, sy); x.lineTo(W - 16, sy); x.stroke(); x.setLineDash([]);
        x.font = '800 12px "Plus Jakarta Sans", system-ui, sans-serif'; const tw = x.measureText(this.zielZeile.name).width + 34;
        rr(64, sy - 12, tw, 24, 12); x.fillStyle = linear(0, sy - 12, 0, sy + 12, [[0, '#3F8F4E'], [1, '#2A6A36']]); x.fill();
        x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(74, sy + 6); x.lineTo(74, sy - 7); x.lineTo(84, sy - 4); x.lineTo(74, sy - 1); x.fill();
        text(this.zielZeile.name, 64 + 22 + (tw - 30) / 2, sy, { gr: 12, farbe: '#FFFFFF', schat: false });
      }
    }
    // Stapel (nur sichtbare Brote), mit Kontaktschatten
    for (let i = 1; i < st.length; i++) {
      const s = st[i];
      if (s.y + kam < -60 || s.y + kam > H + 60) continue;
      x.fillStyle = 'rgba(30,12,2,.28)'; x.beginPath(); x.ellipse((s.l + s.r) / 2, s.y + s.h / 2 - 1, (s.r - s.l) * .46, 3.5, 0, 0, 7); x.fill();
      const q = s.sq ? Math.sin(s.sq * Math.PI) * s.sq : 0, auf = s.auf ? ease.feder(1 - s.auf) : 1;
      x.save(); const mx = (s.l + s.r) / 2, by = s.y + s.h / 2;
      x.translate(mx, by); if (s.wackel) x.rotate(Math.sin(t * 22) * .05 * s.wackel); x.scale((1 + q * .07) * (s.auf ? .9 + .1 * auf : 1), 1 - q * .14); x.translate(-mx, -by);
      stap_stueck(s, s.y, { glanz: s.glanz });
      x.restore();
    }
    // Abgebrochene Stücke fallen mit Drehung
    for (const p of this.stuecke || []) {
      x.save(); x.translate(p.px, p.py); x.rotate(p.rot); x.translate(-p.px, -p.py);
      stap_stueck(p, p.py); x.restore();
    }
    // Aktuelles Brot an der Schiene
    const a = this.akt;
    if (a && this.tot < 0) {
      const hy = this.hangY(), rail = hy - 58;
      if (a.zustand === 'haengt') {
        const e = ease.feder(Math.min(1, a.ein));
        // Fallhilfe: gestrichelte Linien zur Landestelle
        x.strokeStyle = 'rgba(255,240,210,.28)'; x.setLineDash([3, 6]); x.lineWidth = 1.4;
        x.beginPath(); x.moveTo(a.x - a.w / 2 + 3, hy + a.h / 2); x.lineTo(a.x - a.w / 2 + 3, this.oben); x.moveTo(a.x + a.w / 2 - 3, hy + a.h / 2); x.lineTo(a.x + a.w / 2 - 3, this.oben); x.stroke(); x.setLineDash([]);
        x.fillStyle = 'rgba(20,8,0,.22)'; x.beginPath(); x.ellipse(a.x, this.oben - 1, a.w * .42, 4, 0, 0, 7); x.fill();
        // Seile
        x.strokeStyle = '#E8D7B4'; x.lineWidth = 1.6;
        x.beginPath(); x.moveTo(a.x - 6, rail + 8); x.lineTo(a.x - a.w * .3, hy - a.h * .3); x.moveTo(a.x + 6, rail + 8); x.lineTo(a.x + a.w * .3, hy - a.h * .3); x.stroke();
        if (a.gold && typeof goldGlanz === 'function') goldGlanz(a.x, hy, Math.max(18, a.w * .3), t);
        x.save(); x.translate(a.x, hy); x.scale(e, e); x.rotate(-Math.cos(a.ph) * .06 * Math.min(1, a.omega / 3)); x.translate(-a.x, -hy);
        x.globalAlpha = Math.min(1, a.ein * 2);
        stap_stueck(this.ganzesBrot(a), hy + Math.sin(t * 3) * 1.5);
        x.globalAlpha = 1; x.restore();
        if (a.pw) { const py = hy - a.h / 2 - 24, txt = STAP_POWER[a.pw].k; x.font = '800 11px "Plus Jakarta Sans", system-ui, sans-serif'; const bw = x.measureText(txt).width + 34, lx = klemm(a.x, bw / 2 + 6, W - bw / 2 - 6); rr(lx - bw / 2, py - 12, bw, 24, 12); x.fillStyle = 'rgba(43,23,10,.85)'; x.fill(); x.strokeStyle = '#FFC72C'; x.lineWidth = 1.5; x.stroke(); x.save(); x.translate(lx - bw / 2 + 13, py); x.scale(.42, .42); STAP_POWER[a.pw].sym(); x.restore(); text(txt, lx + 8, py + .5, { gr: 11, farbe: '#FFE08A', schat: false }); }
        if (a.gold) {
          x.strokeStyle = 'rgba(43,23,10,.55)'; x.lineWidth = 5; x.beginPath(); x.arc(a.x, hy - a.h / 2 - 22, 10, 0, 7); x.stroke();
          x.strokeStyle = '#FFC72C'; x.lineWidth = 3.4; x.lineCap = 'round'; x.beginPath(); x.arc(a.x, hy - a.h / 2 - 22, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * klemm(a.goldT / 5.5, 0, 1)); x.stroke();
        }
        // kleine Klammern
        [-1, 1].forEach((sg) => { x.fillStyle = linear(0, hy - a.h * .4, 0, hy - a.h * .2, [[0, '#FFE7A0'], [1, '#B98200']]); rr(a.x + sg * a.w * .3 - 4, hy - a.h * .42, 8, 7, 2); x.fill(); });
      } else {
        // Seile schnellen hoch
        const s = this.seilWeg || 0;
        if (s > 0) { x.strokeStyle = `rgba(232,215,180,${s})`; x.lineWidth = 1.6; x.beginPath(); x.moveTo(a.x - 6, rail + 8); x.lineTo(a.x - a.w * .3 * s, rail + 8 + (hy - rail) * s * .6); x.moveTo(a.x + 6, rail + 8); x.lineTo(a.x + a.w * .3 * s, rail + 8 + (hy - rail) * s * .6); x.stroke(); }
        stap_stueck(this.ganzesBrot(a), a.y);
      }
      // Messingschiene mit Laufkatze
      x.fillStyle = 'rgba(20,8,0,.3)'; x.fillRect(0, rail + 5, W, 4);
      x.fillStyle = linear(0, rail - 4, 0, rail + 5, [[0, '#FFE9A8'], [.45, '#D9A22A'], [1, '#7A5208']]); x.fillRect(0, rail - 4, W, 9);
      x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(0, rail - 3, W, 1.2);
      rr(a.x - 15, rail - 10, 30, 20, 6); x.fillStyle = linear(0, rail - 10, 0, rail + 10, [[0, '#7A4A22'], [1, '#3A2010']]); x.fill();
      [-8, 8].forEach((d) => { x.fillStyle = '#2B170A'; x.beginPath(); x.arc(a.x + d, rail - 4, 4, 0, 7); x.fill(); x.fillStyle = '#D9A22A'; x.beginPath(); x.arc(a.x + d, rail - 4, 1.6, 0, 7); x.fill(); });
    }
    x.restore();
    vignette(.4);
    if (laeuft && this.perfekt >= 2 && this.tot < 0) {
      const tx = `Perfekt ×${this.perfekt}`; x.font = '800 12.5px "Plus Jakarta Sans", system-ui, sans-serif'; const w = x.measureText(tx).width + 22;
      const puls = 1 + Math.max(0, Math.sin(t * 6)) * .04;
      x.save(); x.translate(W - 12 - w / 2, 86); x.scale(puls, puls);
      rr(-w / 2, -12, w, 24, 12); x.fillStyle = linear(0, -12, 0, 12, [[0, '#FFE58A'], [1, '#F2B400']]); x.fill();
      x.strokeStyle = 'rgba(150,100,0,.6)'; x.lineWidth = 1; x.stroke();
      text(tx, 0, .5, { gr: 12.5, farbe: F.braun, schat: false }); x.restore();
    }
    // Vorschau: welches Brot kommt als Nächstes
    if (laeuft && this.tot < 0 && this.naechste) {
      const typ = this.naechste, T = STAP_TYP[typ], ein = Math.min(1, (this.vorschauT || 0) * 4);
      x.save(); x.globalAlpha = .4 + .6 * ein;
      rr(10, 50, 100, 34, 12); x.fillStyle = 'rgba(43,23,10,.78)'; x.fill(); x.strokeStyle = STAP_SCHWER[typ] ? 'rgba(255,170,120,.8)' : 'rgba(255,231,160,.5)'; x.lineWidth = 1.2; x.stroke();
      text('Als Nächstes', 72, 59, { gr: 8.5, farbe: '#D9C6A3', art: '700', schat: false });
      const mw = typ === 'baguette' ? 34 : 26, mh = T.h * .34;
      const mini = { typ, art: typ, l: 28 - mw / 2 - 1, r: 28 + mw / 2 + 1, fx: 28, fw: mw, h: mh };
      stap_stueck(mini, 67);
      text(T.name, 72, 73, { gr: 11, farbe: STAP_SCHWER[typ] ? '#FFC4A0' : '#FFE7A0', schat: false });
      x.restore();
    }
    // Hinweis am Anfang
    if (laeuft && this.anzahl === 0 && this.tot < 0) {
      const al = .8 + Math.sin(t * 5) * .2;
      x.globalAlpha = al; rr(110, 392, 140, 32, 16); x.fillStyle = 'rgba(43,23,10,.78)'; x.fill();
      text('Tippen = fallen lassen', 180, 408, { gr: 12.5, farbe: '#FFE7A0', schat: false }); x.globalAlpha = 1;
    }
    this.leiste();
  },

  // Für das Prüfskript: tippen, wenn das Brot (fast) über dem Stapel ist; manchmal absichtlich ungenau
  /** gewählte Karten unten rechts (wird von malen am Ende aufgerufen) */
  leiste(){ kartenLeiste(STAP_VERB, this.verb); if (this.netzRest > 0) text(`Netz ×${this.netzRest}`, 40, 466, { gr: 11, farbe: '#FFE08A' }); },
  testZug(i){
    const weg = { x: 180, y: 530, warte: 6 };
    const a = this.akt;
    if (!a || this.tot >= 0 || a.zustand !== 'haengt' || a.sperre > 0 || this.frageIn > 0) return weg;
    const t = this.top(), m = (t.l + t.r) / 2;
    const vorher = { ...a, ph: a.ph + a.omega * .03 };
    const dx = this.pendelX(vorher) - m;
    const toleranz = this.anzahl % 4 === 3 ? 24 : Math.max(3, (STAP_TYP[a.typ] || STAP_TYP.laib).tol - 3);
    return Math.abs(dx) < toleranz ? { x: 180, y: 260, warte: 60 } : weg;
  }
};
