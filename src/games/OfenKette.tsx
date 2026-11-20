// ═══ Spiel: Ofen-Kette (Version 249) ═══
// Teile aus Produktfotos fallen in den Ofen: schieben, drehen, fallen lassen. Volle Reihe = fertig gebacken,
// 4 gleiche nebeneinander = goldbraun, was nachrutscht, kann eine Kette auslösen.
// Bestellung nach Namen (60 s), Allergen-Frage, goldenes Brötchen, verbrannte Bilder, Ablage,
// Name nachsehen (Finger halten), Tagesauswahl, Gruppen-Tag (Mi/Sa), ruhiger Modus, Ergebnis als Kassenbon.
// Regeln/Zahlen stehen in ofenLogik.ts (im Test geprüft). Spielfeld = Canvas, damit es auch auf alten Handys flüssig läuft.
import { useState, useEffect, useRef, useMemo } from 'react';
import type { PointerEvent as ZeigerEreignis, KeyboardEvent as TastenEreignis } from 'react';
import { kleinesFoto } from '../daten/fotos';
import { TH, cardStyle, btnPrimary, PageHead, GameIntro, productImageKey, ProductImages, ReceiptHead, ReceiptFoot } from '../ui/basis';
import { scrollToPlay } from '../ui/belohnungen';
import { LtIcon, ICON } from '../basis/symbole';
import { FinishEarlyButton } from './spielBasis';
import {
  COLS, ROWS, BEDARF, BESTELL_ZEIT, VERBRANNT_AB, MAX_PUNKTE, Raster, Teil, leeresRaster, neuesTeil, goldTeil, istVerbrannt,
  findeGruppen, volleReihen, nachRutschen, goldZiel, allergenFrage, bestenlistenPunkte, takt, ofenSortiment, tagesAuswahl, istGruppenTag, gruppeVon,
} from './ofenLogik';

export const OFEN_KATEGORIE = 'Ofen-Kette';

type Frage = { zelle: number; name: string; richtig: string; optionen: string[]; drin: string[]; antwort?: string };
type Bon = { roh: number; liste: [string, number][]; reihen: number; bestellungen: number; fragen: number; fragenRichtig: number; gold: number; kette: number; ruhig: boolean; fuerListe: number };
type Etikett = { text: string; x: number; y: number };

const GRUPPEN_FARBE = ['#E8741C', '#2F7D4F', '#2F5D9A', '#9A2F6D', '#B98900', '#5A3A9A', '#2F8A8A', '#A0522D'];

/** Bild für ein Produkt laden; Shop-Fotos liegen unten in der Mitte, darum dort ausschneiden */
function ladeBild(src: string) {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img;
}
function ausschnitt(img: HTMLImageElement): [number, number, number, number] {
  const w = img.naturalWidth || 1, h = img.naturalHeight || 1;
  if (/\/fotos\//.test(img.src) && w > h) { const s = h * 0.52, cy = Math.min(h - s / 2, h * 0.74); return [w / 2 - s / 2, cy - s / 2, s, s]; }
  const s = Math.min(w, h); return [(w - s) / 2, (h - s) / 2, s, s];
}

export function OfenKetteView({ images, scores, userKey, onSaveScore }: { images: ProductImages; scores: any[]; userKey: string; onSaveScore: (points: number, category: string) => void }) {
  const heute = new Date();
  const gruppenTag = istGruppenTag(heute);
  const namen = useMemo(() => tagesAuswahl(ofenSortiment(heute.getMonth()).filter((n) => images[productImageKey(n)]), heute), [images]); // eslint-disable-line react-hooks/exhaustive-deps
  const bilder = useMemo(() => namen.map((n) => ladeBild(kleinesFoto(images[productImageKey(n)]) || images[productImageKey(n)])), [namen, images]);
  const gruppen = useMemo(() => Array.from(new Set(namen.map(gruppeVon))), [namen]);

  const [phase, setPhase] = useState<'menu' | 'spiel' | 'ende'>('menu');
  const [ruhig, setRuhig] = useState(false);
  const [ui, setUi] = useState({ punkte: 0, stufe: 1, bestellung: '', geliefert: 0, rest: 1, ablageZu: false });
  const [frage, setFrage] = useState<Frage | null>(null);
  const [bon, setBon] = useState<Bon | null>(null);
  const feldRef = useRef<HTMLCanvasElement>(null);
  const nxRef = useRef<HTMLCanvasElement>(null);
  const abRef = useRef<HTMLCanvasElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const zelleRef = useRef(40);

  // Kollegen-Rekord: wer hat heute die meisten Punkte in der Ofen-Kette?
  const heuteVorn = useMemo(() => {
    let best: { name: string; score: number } | null = null, meins = 0;
    const tag = heute.toDateString();
    (scores || []).forEach((s: any) => {
      if (!s || s.category !== OFEN_KATEGORIE) return;
      const ts = Number(String(s.id || '').split('_').pop()) || 0;
      if (new Date(ts).toDateString() !== tag) return;
      if (String(s.username || '').toLowerCase() === userKey) { meins = Math.max(meins, Number(s.score) || 0); return; }
      if (!best || s.score > best.score) best = { name: String(s.username), score: Number(s.score) || 0 };
    });
    return { best: best as { name: string; score: number } | null, meins };
  }, [scores, userKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Spielzustand (veränderlich, außerhalb von React, damit es flüssig bleibt) ──
  const g = useRef<any>(null);
  const schluessel = (p: number) => (gruppenTag ? gruppeVon(namen[p]) : p);
  const nameVon = (p: number) => (gruppenTag ? gruppeVon(namen[p]) : namen[p]);
  const aktiv = () => Math.min(namen.length, 3 + g.current.stufe);

  const sync = () => {
    const s = g.current; if (!s) return;
    setUi({ punkte: s.punkte, stufe: s.stufe, bestellung: s.bestellung >= 0 ? nameVon(s.bestellung) : '', geliefert: s.geliefert, rest: Math.max(0, s.rest / BESTELL_ZEIT), ablageZu: s.ablageBenutzt });
  };
  const toast = (t: string) => {
    const el = toastRef.current; if (!el) return;
    el.textContent = t; el.classList.remove('lt-ok-zeig'); void el.offsetWidth; el.classList.add('lt-ok-zeig');
  };
  const teigi = (ok: boolean, lauf = 0) => { try { window.dispatchEvent(new CustomEvent('lt-teigi', { detail: { ok, lauf } })); } catch { /* egal */ } };
  const brumm = (m: number | number[]) => { try { navigator.vibrate && navigator.vibrate(m); } catch { /* egal */ } };

  const neueBestellung = () => {
    const s = g.current; if (s.ruhig) { s.bestellung = -1; return; }
    let n = 0, i = 0;
    do { n = Math.floor(Math.random() * aktiv()); i++; } while (s.bestellung >= 0 && schluessel(n) === schluessel(s.bestellung) && i < 20);
    s.bestellung = n; s.geliefert = 0; s.rest = BESTELL_ZEIT;
  };
  const naechstesErzeugen = (): Teil => {
    const s = g.current;
    return s.teileZahl > 5 && Math.random() < 0.04 ? goldTeil() : neuesTeil(aktiv());
  };
  const teilAktivieren = (t: Teil) => {
    const s = g.current;
    s.teil = t; s.teileZahl++; s.fallZeit = 0;
    // Allergen-Frage: ab dem 4. Teil ungefähr jedes 6. Teil
    if (!t.zellen[0].gold && s.teileZahl > 3 && !s.frage && Math.random() < 0.17) {
      const kandidaten = t.zellen.map((z, i) => ({ i, f: allergenFrage(namen[z.p]) })).filter((x) => x.f);
      if (kandidaten.length) {
        const k = kandidaten[Math.floor(Math.random() * kandidaten.length)];
        t.zellen.forEach((z, i) => { z.frage = i === k.i; });
        s.frage = { zelle: k.i, name: namen[t.zellen[k.i].p], ...k.f! };
        setFrage(s.frage);
      }
    }
  };

  const frei = (x: number, y: number) => { const r: Raster = g.current.raster; return x >= 0 && x < COLS && y < ROWS && (y < 0 || !r[y][x]); };
  const passt = (t: Teil, dx: number, dy: number, zellen = t.zellen) => zellen.every((z) => frei(t.x + z.x + dx, t.y + z.y + dy));
  const bereit = () => { const s = g.current; return s && s.laeuft && !s.pause && !s.beschaeftigt && s.teil; };

  // ── Zeichnen ──
  const kachel = (c: CanvasRenderingContext2D, x: number, y: number, sz: number, p: number, opt: { glut?: number; geist?: boolean; gold?: boolean; frage?: boolean; verbrannt?: boolean } = {}) => {
    let s = sz;
    const glut = opt.glut || 0;
    if (glut) { const d = s * 0.08 * Math.sin(glut * Math.PI); x -= d; y -= d; s += 2 * d; }
    const r = Math.max(4, s * 0.2), pad = Math.max(1, s * 0.03), X = x + pad, Y = y + pad, S = s - pad * 2;
    c.save(); c.beginPath(); c.roundRect(X, Y, S, S, r);
    if (opt.geist) { c.strokeStyle = 'rgba(255,226,122,.45)'; c.lineWidth = 2; c.setLineDash([4, 3]); c.stroke(); c.restore(); return; }
    c.clip();
    if (opt.gold) {
      const gg = c.createRadialGradient(X + S * 0.35, Y + S * 0.3, 1, X + S / 2, Y + S / 2, S * 0.75);
      gg.addColorStop(0, '#FFF7C8'); gg.addColorStop(0.35, '#FFD23A'); gg.addColorStop(0.8, '#D99A00'); gg.addColorStop(1, '#8A5A00');
      c.fillStyle = gg; c.fillRect(X, Y, S, S);
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(X + S * 0.36, Y + S * 0.3, S * 0.18, S * 0.09, -0.5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(120,70,0,.55)'; c.lineWidth = Math.max(1.5, S * 0.05);
      c.beginPath(); c.moveTo(X + S * 0.3, Y + S * 0.62); c.quadraticCurveTo(X + S * 0.5, Y + S * 0.48, X + S * 0.7, Y + S * 0.62); c.stroke();
    } else {
      const img = bilder[p];
      if (img && img.complete && img.naturalWidth) { const [sx, sy, sw, sh] = ausschnitt(img); c.drawImage(img, sx, sy, sw, sh, X, Y, S, S); }
      else { c.fillStyle = '#C9A36B'; c.fillRect(X, Y, S, S); }
      const gr = c.createLinearGradient(0, Y, 0, Y + S); gr.addColorStop(0, 'rgba(255,255,255,.2)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(60,25,0,.26)');
      c.fillStyle = gr; c.fillRect(X, Y, S, S);
      if (opt.verbrannt) { c.fillStyle = 'rgba(25,12,4,.72)'; c.fillRect(X, Y, S, S); c.strokeStyle = 'rgba(255,140,60,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X + S * 0.2, Y + S * 0.3); c.lineTo(X + S * 0.45, Y + S * 0.55); c.lineTo(X + S * 0.4, Y + S * 0.8); c.stroke(); }
    }
    if (glut) { c.fillStyle = `rgba(242,183,5,${0.25 + glut * 0.6})`; c.fillRect(X, Y, S, S); }
    c.restore();
    c.save(); c.beginPath(); c.roundRect(X, Y, S, S, r);
    if (opt.frage) { c.lineWidth = 4; c.strokeStyle = '#E5301C'; c.shadowColor = '#E5301C'; c.shadowBlur = 10; }
    else if (glut || opt.gold) { c.lineWidth = 3; c.strokeStyle = '#FFE27A'; c.shadowColor = '#F2B705'; c.shadowBlur = 22 * (glut || 0.6); }
    else if (gruppenTag && p >= 0) { c.lineWidth = 3; c.strokeStyle = GRUPPEN_FARBE[gruppen.indexOf(gruppeVon(namen[p])) % GRUPPEN_FARBE.length]; }
    else { c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,240,210,.35)'; }
    c.stroke(); c.restore();
    if (opt.frage) { // kleines Fragezeichen oben rechts
      const rr = Math.max(7, s * 0.17); c.save(); c.fillStyle = '#E5301C'; c.beginPath(); c.arc(X + S - rr * 0.6, Y + rr * 0.6, rr, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(rr * 1.4)}px system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', X + S - rr * 0.6, Y + rr * 0.68); c.restore();
    }
  };
  const etikett = (c: CanvasRenderingContext2D, text: string, cx: number, cy: number, gross: boolean) => {
    const z = zelleRef.current;
    c.save(); c.font = `800 ${gross ? 17 : 15}px Fraunces, Georgia, serif`;
    const w = c.measureText(text).width + 18, h = gross ? 30 : 27;
    const x = Math.max(4, Math.min(COLS * z - w - 4, cx - w / 2)), y = Math.max(4, Math.min(ROWS * z - h - 4, cy - h / 2));
    c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10;
    c.fillStyle = gross ? '#F2B705' : '#FFFDF7'; c.beginPath(); c.roundRect(x, y, w, h, h / 2); c.fill();
    c.shadowBlur = 0; c.fillStyle = '#2A1A0E'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x + w / 2, y + h / 2 + 1);
    c.restore();
  };
  const zeichnen = () => {
    const cv = feldRef.current, s = g.current; if (!cv || !s) return;
    const c = cv.getContext('2d'); if (!c) return;
    const z = zelleRef.current, dpr = s.dpr, W = COLS * z, H = ROWS * z;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#3D2616'); bg.addColorStop(1, '#22140B'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const glow = c.createRadialGradient(W / 2, H, 0, W / 2, H, H * 0.7); glow.addColorStop(0, 'rgba(232,116,28,.28)'); glow.addColorStop(1, 'rgba(232,116,28,0)'); c.fillStyle = glow; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,220,170,.05)'; c.lineWidth = 1;
    for (let x = 1; x < COLS; x++) { c.beginPath(); c.moveTo(x * z + 0.5, 0); c.lineTo(x * z + 0.5, H); c.stroke(); }
    for (let y = 1; y < ROWS; y++) { c.beginPath(); c.moveTo(0, y * z + 0.5); c.lineTo(W, y * z + 0.5); c.stroke(); }
    const r: Raster = s.raster;
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const k = r[y][x]; if (k) kachel(c, x * z, y * z, z, k.p, { glut: k.glut, gold: k.gold, verbrannt: istVerbrannt(k) }); }
    const t: Teil | null = s.teil;
    if (t) {
      let gy = 0; while (passt(t, 0, gy + 1)) gy++;
      if (gy > 0) t.zellen.forEach((q) => { const y = t.y + q.y + gy; if (y >= 0) kachel(c, (t.x + q.x) * z, y * z, z, q.p, { geist: true }); });
      t.zellen.forEach((q) => { const y = t.y + q.y; if (y >= 0) kachel(c, (t.x + q.x) * z, y * z, z, q.p, { gold: q.gold, frage: q.frage && !!s.frage }); });
    }
    (s.etiketten as Etikett[]).forEach((e) => etikett(c, e.text, e.x * z, e.y * z, true));
    if (s.zeigName) { if (performance.now() > s.zeigName.bis) s.zeigName = null; else etikett(c, s.zeigName.text, s.zeigName.x, s.zeigName.y - z * 0.8, false); }
  };
  const klein = (cv: HTMLCanvasElement | null, t: Teil | null, leer: boolean) => {
    const s = g.current; if (!cv || !s) return;
    const w = 40, dpr = s.dpr; cv.width = w * dpr; cv.height = w * dpr; cv.style.width = cv.style.height = w + 'px';
    const c = cv.getContext('2d'); if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, w);
    if (!t) { if (leer) { c.strokeStyle = '#D9C39A'; c.setLineDash([4, 3]); c.lineWidth = 2; c.beginPath(); c.roundRect(8, 8, w - 16, w - 16, 8); c.stroke(); } return; }
    const mx = Math.max(...t.zellen.map((q) => q.x)) + 1, my = Math.max(...t.zellen.map((q) => q.y)) + 1;
    const sz = Math.min(w / 4, w / mx), ox = (w - mx * sz) / 2, oy = (w - my * sz) / 2;
    t.zellen.forEach((q) => kachel(c, ox + q.x * sz, oy + q.y * sz, sz, q.p, { gold: q.gold }));
  };
  const kleineBilder = () => { klein(nxRef.current, g.current?.naechstes, false); klein(abRef.current, g.current?.ablage, true); };

  // ── Spielzüge ──
  const drehen = () => {
    if (!bereit()) return; const s = g.current, t: Teil = s.teil;
    const maxX = Math.max(...t.zellen.map((q) => q.x)), maxY = Math.max(...t.zellen.map((q) => q.y));
    if (maxX === 0 && maxY === 0) return;
    if (maxX === 1 && maxY === 1) { // Blech: Bilder im Kreis tauschen
      const o: Record<string, number> = { '0,0': 0, '1,0': 1, '1,1': 2, '0,1': 3 }, alt = t.zellen.map((q) => ({ ...q }));
      t.zellen.forEach((q) => { const ziel = (o[q.x + ',' + q.y] + 3) % 4; const von = alt.find((a) => o[a.x + ',' + a.y] === ziel)!; q.p = von.p; q.frage = von.frage; });
      zeichnen(); return;
    }
    const neu = t.zellen.map((q) => ({ ...q, x: maxY - q.y, y: q.x }));
    for (const dx of [0, -1, 1, -2, 2]) if (passt(t, dx, 0, neu)) { t.zellen = neu; t.x += dx; zeichnen(); return; }
  };
  const schieben = (dx: number) => { if (bereit() && passt(g.current.teil, dx, 0)) { g.current.teil.x += dx; zeichnen(); } };
  const runter = () => { if (!bereit()) return; const s = g.current; if (passt(s.teil, 0, 1)) { s.teil.y++; s.fallZeit = 0; zeichnen(); } else ablegen(); };
  const fallen = () => { if (!bereit()) return; const s = g.current; while (passt(s.teil, 0, 1)) s.teil.y++; ablegen(); };
  const ablageTauschen = () => {
    if (!bereit()) return; const s = g.current;
    if (s.ablageBenutzt || s.teil.zellen[0].gold) return;
    const alt: Teil | null = s.ablage;
    s.ablage = { zellen: s.teil.zellen.map((q: any) => ({ ...q, frage: false })), x: 0, y: 0 };
    if (s.frage) { s.frage = null; setFrage(null); } // Frage gilt nur für das fallende Teil
    if (alt) { s.teil = { zellen: alt.zellen, x: Math.floor((COLS - 3) / 2), y: -1 }; s.fallZeit = 0; }
    else { teilAktivieren(s.naechstes); s.naechstes = naechstesErzeugen(); }
    s.ablageBenutzt = true; kleineBilder(); sync(); zeichnen();
  };

  const warte = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
  const gluehen = async (weg: Set<number>) => {
    const s = g.current, t0 = performance.now();
    while (performance.now() - t0 < 650) {
      const f = Math.min(1, (performance.now() - t0) / 380);
      weg.forEach((k) => { const q = s.raster[Math.floor(k / COLS)][k % COLS]; if (q) q.glut = f; });
      zeichnen(); await new Promise((r) => requestAnimationFrame(r));
    }
    weg.forEach((k) => { s.raster[Math.floor(k / COLS)][k % COLS] = null; });
    s.etiketten = [];
  };
  const zaehlen = (weg: Set<number>) => {
    const s = g.current;
    weg.forEach((k) => { const q = s.raster[Math.floor(k / COLS)][k % COLS]; if (q && !q.gold) s.stats.prod[q.p] = (s.stats.prod[q.p] || 0) + 1; });
  };
  const bestellungZaehlen = async (anzahl: number) => {
    const s = g.current; if (s.ruhig || !anzahl) return;
    s.geliefert += anzahl;
    if (s.geliefert >= BEDARF) {
      const bonus = 20 + Math.round(s.rest / 6000);
      s.punkte += bonus; s.stats.bestellungen++;
      await warte(150); toast(`Bestellung fertig! +${bonus}`); teigi(true, 3); brumm([30, 30, 30]);
      neueBestellung();
    }
  };

  const ablegen = async () => {
    const s = g.current, t: Teil = s.teil;
    if (s.frage) { s.stats.fragen++; toast('Allergen-Frage verpasst'); s.frage = null; setFrage(null); teigi(false); }
    // alles, was schon liegt, wird älter (im ruhigen Modus verbrennt nichts)
    let neuVerbrannt = false;
    if (!s.ruhig) s.raster.forEach((z: any[]) => z.forEach((k) => { if (k && !k.gold) { k.alter++; if (k.alter === VERBRANNT_AB) neuVerbrannt = true; } }));
    for (const q of t.zellen) {
      const y = t.y + q.y, x = t.x + q.x;
      if (y < 0) return ende();
      s.raster[y][x] = { p: q.p, glut: 0, alter: 0, gold: q.gold };
    }
    s.teil = null; s.beschaeftigt = true;
    if (neuVerbrannt && !s.verbranntGesagt) { s.verbranntGesagt = true; toast('Verbrannt! Nur eine volle Reihe holt es raus'); }
    if (t.zellen[0].gold) {
      const x = t.x, y = t.y;
      const weg = goldZiel(s.raster, x, y, schluessel);
      const ziel = [...weg].map((k) => s.raster[Math.floor(k / COLS)][k % COLS]).find((k: any) => k && !k.gold);
      s.stats.gold++;
      const plus = 5 + weg.size - 1;
      s.punkte += plus; s.gebacken += weg.size - 1;
      if (ziel) {
        s.etiketten = [{ text: 'Alle ' + nameVon(ziel.p), x: COLS / 2, y: y + 0.5 }];
        zaehlen(weg);
        const fuerBestellung = s.bestellung >= 0 ? [...weg].filter((k) => { const q = s.raster[Math.floor(k / COLS)][k % COLS]; return q && !q.gold && schluessel(q.p) === schluessel(s.bestellung); }).length : 0;
        toast(`Goldenes Brötchen! +${plus}`); brumm([40, 30, 80]);
        await gluehen(weg); await bestellungZaehlen(fuerBestellung);
      } else { toast(`Goldenes Brötchen +${plus}`); await gluehen(weg); }
      nachRutschen(s.raster); zeichnen(); await warte(200);
    }
    await aufloesen();
    if (!s.laeuft) return;
    s.beschaeftigt = false; s.ablageBenutzt = false;
    teilAktivieren(s.naechstes); s.naechstes = naechstesErzeugen(); kleineBilder();
    if (!passt(s.teil, 0, 0)) return ende();
    sync(); zeichnen();
  };

  const aufloesen = async () => {
    const s = g.current; let kette = 0;
    for (;;) {
      const { weg, gruppen: gr } = findeGruppen(s.raster, schluessel);
      const reihen = volleReihen(s.raster);
      reihen.forEach((y) => { for (let x = 0; x < COLS; x++) weg.add(y * COLS + x); });
      if (!weg.size) break;
      kette++;
      let fuerBestellung = 0;
      weg.forEach((k) => { const q = s.raster[Math.floor(k / COLS)][k % COLS]; if (q && !q.gold && s.bestellung >= 0 && schluessel(q.p) === schluessel(s.bestellung)) fuerBestellung++; });
      const gewinn = (weg.size + reihen.length * 10 + (s.ruhig ? 0 : fuerBestellung)) * kette;
      s.punkte += gewinn; s.gebacken += weg.size; s.stats.reihen += reihen.length; s.stats.kette = Math.max(s.stats.kette, kette);
      zaehlen(weg);
      s.etiketten = gr.map((q: { p: number; ks: number[] }) => {
        const xs = q.ks.map((k) => k % COLS), ys = q.ks.map((k) => Math.floor(k / COLS));
        return { text: nameVon(q.p), x: (Math.min(...xs) + Math.max(...xs) + 1) / 2, y: (Math.min(...ys) + Math.max(...ys) + 1) / 2 };
      });
      toast((reihen.length ? (reihen.length > 1 ? `${reihen.length} Reihen fertig` : 'Reihe fertig') : 'Goldbraun!') + (kette > 1 ? ` Kette ×${kette}` : '') + ` +${gewinn}`);
      brumm(kette > 1 ? [40, 40, 60] : 40);
      await gluehen(weg);
      await bestellungZaehlen(fuerBestellung);
      nachRutschen(s.raster);
      s.stufe = 1 + Math.floor(s.gebacken / 40);
      sync(); zeichnen(); await warte(200);
    }
  };

  const ende = () => {
    const s = g.current; if (!s || !s.laeuft) return;
    s.laeuft = false; s.teil = null; zeichnen();
    if (s.frage) { s.frage = null; setFrage(null); }
    const fuerListe = bestenlistenPunkte(s.punkte, s.ruhig);
    const liste = Object.entries(s.stats.prod as Record<string, number>).map(([p, n]) => [namen[Number(p)], n] as [string, number]).sort((a, b) => b[1] - a[1]);
    setBon({ roh: s.punkte, liste, reihen: s.stats.reihen, bestellungen: s.stats.bestellungen, fragen: s.stats.fragen, fragenRichtig: s.stats.fragenRichtig, gold: s.stats.gold, kette: s.stats.kette, ruhig: s.ruhig, fuerListe });
    if (fuerListe > 0) onSaveScore(fuerListe, OFEN_KATEGORIE);
    setPhase('ende');
  };

  const antworten = (a: string) => {
    const s = g.current; if (!s || !s.frage || s.frage.antwort) return;
    const ok = a === s.frage.richtig;
    s.stats.fragen++; if (ok) { s.stats.fragenRichtig++; s.punkte += 10; }
    toast(ok ? `Richtig! ${a} ist drin. +10` : `Leider nein. Drin: ${s.frage.drin.join(', ')}`);
    teigi(ok, ok ? s.stats.fragenRichtig : 0);
    const f = { ...s.frage, antwort: a };
    s.frage = null; if (s.teil) s.teil.zellen.forEach((q: any) => { q.frage = false; });
    setFrage(f); window.setTimeout(() => setFrage((x) => (x === f ? null : x)), 1400);
    sync(); zeichnen();
  };

  const start = (leise: boolean) => {
    setRuhig(leise); setBon(null); setFrage(null);
    g.current = {
      raster: leeresRaster(), teil: null, naechstes: null, ablage: null, ablageBenutzt: false, punkte: 0, stufe: 1, gebacken: 0,
      bestellung: -1, geliefert: 0, rest: BESTELL_ZEIT, beschaeftigt: false, fallZeit: 0, etiketten: [], zeigName: null, teileZahl: 0,
      frage: null, laeuft: true, pause: false, ruhig: leise, verbranntGesagt: false, dpr: Math.max(1, Math.min(3, window.devicePixelRatio || 1)),
      stats: { prod: {}, reihen: 0, bestellungen: 0, fragen: 0, fragenRichtig: 0, gold: 0, kette: 0 },
    };
    neueBestellung();
    teilAktivieren(neuesTeil(aktiv())); g.current.naechstes = neuesTeil(aktiv());
    setPhase('spiel'); scrollToPlay();
  };

  // Größe: so groß wie möglich, das ganze Spiel passt auf den Bildschirm
  useEffect(() => {
    if (phase !== 'spiel') return;
    const groesse = () => {
      const box = boxRef.current, cv = feldRef.current, s = g.current; if (!box || !cv || !s) return;
      const breit = box.clientWidth - 12;
      const hoch = window.innerHeight - (window.innerWidth < 700 ? 372 : 300);
      const z = Math.max(22, Math.min(58, Math.floor(Math.min(breit / COLS, hoch / ROWS))));
      zelleRef.current = z;
      cv.width = COLS * z * s.dpr; cv.height = ROWS * z * s.dpr; cv.style.width = COLS * z + 'px'; cv.style.height = ROWS * z + 'px';
      zeichnen();
    };
    groesse(); kleineBilder(); sync();
    const ro = new ResizeObserver(groesse); if (boxRef.current) ro.observe(boxRef.current);
    window.addEventListener('resize', groesse);
    bilder.forEach((b) => { if (!b.complete) b.addEventListener('load', zeichnen, { once: true }); });
    return () => { ro.disconnect(); window.removeEventListener('resize', groesse); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Spielschleife
  useEffect(() => {
    if (phase !== 'spiel') return;
    let raf = 0, letzte = performance.now(), uiZeit = 0;
    const schleife = (t: number) => {
      const s = g.current, dt = Math.min(100, t - letzte); letzte = t;
      if (s && s.laeuft && !s.pause) {
        if (!s.ruhig && !s.frage) {
          s.rest -= dt;
          if (s.rest <= 0 && !s.beschaeftigt) { toast('Bestellung verpasst'); neueBestellung(); sync(); }
        }
        uiZeit += dt; if (uiZeit > 250) { uiZeit = 0; sync(); }
        if (s.zeigName && !s.beschaeftigt) zeichnen();
        if (bereit()) {
          s.fallZeit += dt;
          const tk = takt(s.stufe, s.ruhig) * (s.frage ? 1.6 : 1); // bei Allergen-Frage etwas langsamer
          if (s.fallZeit >= tk) { s.fallZeit = 0; if (passt(s.teil, 0, 1)) { s.teil.y++; zeichnen(); } else ablegen(); }
        }
      }
      raf = requestAnimationFrame(schleife);
    };
    raf = requestAnimationFrame(schleife);
    const sicht = () => { if (g.current) g.current.pause = document.hidden; };
    const taste = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      const f: Record<string, () => void> = { ArrowLeft: () => schieben(-1), ArrowRight: () => schieben(1), ArrowUp: drehen, ArrowDown: runter, ' ': fallen, c: ablageTauschen };
      if (f[e.key]) { e.preventDefault(); f[e.key](); }
    };
    document.addEventListener('visibilitychange', sicht); document.addEventListener('keydown', taste);
    document.body.classList.add('lt-ok-spielt');
    return () => { document.body.classList.remove('lt-ok-spielt'); cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', sicht); document.removeEventListener('keydown', taste); if (g.current) g.current.laeuft = false; };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wischen und Tippen auf dem Spielfeld; Finger halten zeigt den Namen
  const wisch = useRef<{ x: number; y: number; t: number; bewegt: boolean; gehalten: boolean; timer: number } | null>(null);
  const nameZeigen = (cx: number, cy: number) => {
    const cv = feldRef.current, s = g.current; if (!cv || !s) return false;
    const r = cv.getBoundingClientRect(), z = zelleRef.current, x = Math.floor((cx - r.left) / z), y = Math.floor((cy - r.top) / z);
    let p: number | null = s.raster[y] && s.raster[y][x] && !s.raster[y][x].gold ? s.raster[y][x].p : null;
    if (p == null && s.teil) { const q = s.teil.zellen.find((q: any) => s.teil.x + q.x === x && s.teil.y + q.y === y && !q.gold); if (q) p = q.p; }
    if (p == null) return false;
    s.zeigName = { text: namen[p], x: (x + 0.5) * z, y: (y + 0.5) * z, bis: performance.now() + 1600 }; zeichnen(); return true;
  };
  const zeigerRunter = (e: ZeigerEreignis) => {
    const cx = e.clientX, cy = e.clientY;
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch { /* egal */ }
    const w = { x: cx, y: cy, t: performance.now(), bewegt: false, gehalten: false, timer: 0 };
    w.timer = window.setTimeout(() => { if (!w.bewegt && nameZeigen(cx, cy)) w.gehalten = true; }, 420);
    wisch.current = w;
  };
  const zeigerBewegt = (e: ZeigerEreignis) => {
    const w = wisch.current; if (!w) return; const z = zelleRef.current;
    if (Math.abs(e.clientX - w.x) > z * 0.8) { schieben(Math.sign(e.clientX - w.x)); w.x = e.clientX; w.bewegt = true; }
    if (e.clientY - w.y > z * 1.2 && !w.bewegt) { runter(); w.y = e.clientY; w.bewegt = true; }
  };
  const zeigerHoch = (e: ZeigerEreignis) => {
    const w = wisch.current; if (!w) return; clearTimeout(w.timer); wisch.current = null;
    if (w.gehalten) return;
    const dy = e.clientY - w.y, z = zelleRef.current;
    if (!w.bewegt && Math.abs(e.clientX - w.x) < 10 && Math.abs(dy) < 10) drehen();
    else if (dy > z * 2 && performance.now() - w.t < 260) fallen();
  };

  // Knöpfe: gedrückt halten wiederholt (links, rechts, runter)
  // Zeitgeber in einer Ref: die Anzeige wird 4-mal pro Sekunde neu gezeichnet, sonst ginge das Loslassen verloren
  const wdhRef = useRef({ t1: 0, t2: 0 });
  const halten = (fn: () => void, wdh = true) => {
    const stopp = () => { clearTimeout(wdhRef.current.t1); clearInterval(wdhRef.current.t2); };
    return {
      onPointerDown: (e: ZeigerEreignis) => { e.preventDefault(); stopp(); fn(); if (wdh) wdhRef.current.t1 = window.setTimeout(() => { wdhRef.current.t2 = window.setInterval(fn, 70); }, 220); },
      onPointerUp: stopp, onPointerLeave: stopp, onPointerCancel: stopp,
      onKeyDown: (e: TastenEreignis) => { if (e.key === 'Enter') fn(); },
    };
  };
  const pfeil = (d: string) => <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
  const fotoVon = (n: string) => kleinesFoto(images[productImageKey(n)]) || images[productImageKey(n)];

  const kopfKarte = (
    <div className="lt-ok-vorn" style={{ fontSize: '15px', color: TH.muted }}>
      {heuteVorn.best ? <>Heute vorn: <strong style={{ color: TH.ink }}>{heuteVorn.best.name}</strong> mit {heuteVorn.best.score.toLocaleString('de-DE')} Punkten{heuteVorn.meins > heuteVorn.best.score ? ', du hast mehr!' : ''}</>
        : heuteVorn.meins ? <>Du bist heute vorn mit {heuteVorn.meins.toLocaleString('de-DE')} Punkten.</> : <>Heute hat noch keiner gebacken. Sei der Erste!</>}
    </div>
  );

  return (
    <div className="lt-ofen-kette" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      <style>{`
        .lt-papier.lt-ok-ofen{position:relative;align-self:center;border-radius:16px;padding:6px;background:linear-gradient(#5A3820,#2B1A10);box-shadow:0 10px 24px rgba(60,30,10,.35),inset 0 0 0 2px #7A4E2A;touch-action:none}
        .lt-papier.lt-ok-ofen canvas{display:block;border-radius:10px;background:#2B1A10;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
        .lt-papier.lt-ok-toast{position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);pointer-events:none;font:800 21px/1.15 Fraunces,Georgia,serif;color:#FFE27A;text-shadow:0 2px 8px rgba(0,0,0,.7);text-align:center;opacity:0;width:92%}
        .lt-papier.lt-ok-toast.lt-ok-zeig{animation:ltOkHoch 1.3s ease-out}
        @keyframes ltOkHoch{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-90%)}}
        body.lt-ok-spielt .lt-teigi-begleiter.lt-papier{display:none}
        .lt-ok-leiste{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
        .lt-ok-kasten{background:#FFFDF7;border:2px solid #E6D6B6;border-radius:12px;padding:4px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;color:#2A1A0E}
        .lt-ok-kasten span{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#7A6550;white-space:nowrap}
        .lt-ok-kasten b{font-size:19px;font-variant-numeric:tabular-nums}
        .lt-ok-zettel{position:relative;overflow:hidden;min-height:76px;box-sizing:border-box;background:#FFFDF7;border:2px dashed #D9C39A;border-radius:14px;padding:8px 12px;display:flex;flex-direction:column;justify-content:center;gap:6px;color:#2A1A0E}
        .lt-ok-zettel.lt-ok-frage{border:2px solid #E5301C;background:#FFF1EE}
        .lt-ok-uhr{position:absolute;left:0;bottom:0;height:5px;background:#E8741C;transition:width .25s linear}
        .lt-ok-uhr.lt-ok-knapp{background:#D93A1C}
        .lt-ok-punkte{display:flex;gap:3px}.lt-ok-punkte i{width:9px;height:9px;border-radius:50%;background:#E6D6B6}.lt-ok-punkte i.lt-ok-an{background:#E8741C}
        .lt-ok-antworten{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
        .lt-ok-antworten button{min-height:40px;border-radius:12px;border:2px solid #E6D6B6;background:#fff;color:#2A1A0E;font-weight:800;font-size:15px;cursor:pointer;padding:0 4px;overflow-wrap:anywhere}
        .lt-ok-antworten button.lt-ok-richtig{background:#DDF2E3;border-color:#2F7D4F}
        .lt-ok-antworten button.lt-ok-falsch{background:#FCE1DC;border-color:#E5301C}
        .lt-ok-knoepfe{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
        .lt-ok-knoepfe button{height:58px;border-radius:16px;border:none;background:#F4E3C3;color:#2A1A0E;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 #D9C39A;cursor:pointer;touch-action:manipulation}
        .lt-ok-knoepfe button:active{transform:translateY(2px);box-shadow:0 1px 0 #D9C39A}
        .lt-ok-knoepfe button.lt-ok-gold{background:#F2B705;box-shadow:0 3px 0 #B98900}
        .lt-ok-heute{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:10px}
        .lt-ok-heute img{width:100%;aspect-ratio:1;object-fit:cover;object-position:50% 78%;border-radius:12px;border:2px solid #E6D6B6;display:block}
        .lt-ok-bonzeile{display:flex;justify-content:space-between;gap:12px;width:100%;font-size:15px;text-align:left}
        .lt-ok-bonzeile span:first-child{min-width:0;overflow-wrap:anywhere}
      `}</style>
      <PageHead title="Ofen-Kette" subtitle="Teile aus Produktfotos fallen in den Ofen. 4 gleiche nebeneinander werden goldbraun, volle Reihen sind fertig gebacken." />

      {phase === 'menu' && (<>
        <GameIntro
          title="Ofen an!"
          text={`Schieben, drehen, fallen lassen. Volle Reihen und 4 gleiche Produkte nebeneinander sind fertig gebacken. Die Bestellung oben zählt doppelt.`}
          hint="Rot umrandet heißt Allergen-Frage. Finger auf ein Bild halten zeigt den Namen."
          startLabel="Ofen an"
          onStart={() => start(false)}
        />
        <button onClick={() => start(true)} style={{ minHeight: '52px', borderRadius: '16px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>
          Ruhig backen (ohne Zeit und Bestellung, halbe Punkte)
        </button>
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: TH.serif, fontSize: '22px' }}><LtIcon paths={ICON.flame} size={24} /> Heute im Ofen</div>
          {gruppenTag && <div className="lt-ok-gruppentag" style={{ padding: '10px 12px', borderRadius: '12px', backgroundColor: TH.tintYellow, fontSize: '16px', lineHeight: 1.4 }}><strong>Heute ist Gruppen-Tag:</strong> Alle Produkte einer Gruppe zählen als gleich, zum Beispiel alle Brötchen. Die Farbe am Rand zeigt die Gruppe.</div>}
          <div className="lt-ok-heute">
            {namen.map((n) => <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{fotoVon(n) ? <img src={fotoVon(n)} alt="" /> : null}<span>{n}</span>{gruppenTag && <span style={{ color: TH.muted, fontWeight: 600 }}>{gruppeVon(n)}</span>}</div>)}
          </div>
          <div style={{ fontSize: '15px', color: TH.muted }}>Jeden Tag kommen andere Produkte in den Ofen. Höchstens {MAX_PUNKTE} Punkte pro Runde für die Bestenliste.</div>
          {kopfKarte}
        </div>
      </>)}

      {phase === 'spiel' && g.current && (
        <div ref={boxRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="lt-ok-leiste">
            <div className="lt-ok-kasten"><span>Punkte</span><b className="lt-ok-punktzahl">{ui.punkte.toLocaleString('de-DE')}</b></div>
            <div className="lt-ok-kasten"><span>Stufe</span><b>{ui.stufe}</b></div>
            <div className="lt-ok-kasten"><span>Nächstes</span><canvas ref={nxRef} width={40} height={40} /></div>
            <button className="lt-ok-kasten lt-ok-ablage" onClick={ablageTauschen} aria-label="Teil zur Seite legen oder zurückholen" style={{ cursor: 'pointer', opacity: ui.ablageZu ? 0.5 : 1, font: 'inherit' }}><span>Ablage</span><canvas ref={abRef} width={40} height={40} /></button>
          </div>
          {frage ? (
            <div className="lt-ok-zettel lt-ok-frage" role="group" aria-label="Allergen-Frage">
              <div style={{ fontSize: '15px', lineHeight: 1.3 }}><strong style={{ color: '#B42318' }}>Allergen-Frage:</strong> Was ist in <strong>{frage.name}</strong> drin?</div>
              <div className="lt-ok-antworten">
                {frage.optionen.map((o) => <button key={o} onClick={() => antworten(o)} disabled={!!frage.antwort} className={frage.antwort ? (o === frage.richtig ? 'lt-ok-richtig' : o === frage.antwort ? 'lt-ok-falsch' : '') : ''}>{o}</button>)}
              </div>
            </div>
          ) : ruhig ? (
            <div className="lt-ok-zettel" style={{ fontSize: '16px' }}><strong>Ruhig backen</strong><span style={{ color: '#7A6550', fontSize: '14px' }}>Ohne Zeit und ohne Bestellung. Finger auf ein Bild halten zeigt den Namen.</span></div>
          ) : (
            <div className="lt-ok-zettel" aria-live="polite">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#8A4B1C' }}>Bestellung</span>
                <span className="lt-ok-bestellung" lang="de" style={{ fontFamily: TH.serif, fontWeight: 700, fontSize: '18px', lineHeight: 1.15, flex: 1, minWidth: 0, overflowWrap: 'break-word', hyphens: 'auto' }}>{BEDARF}× {ui.bestellung}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span className="lt-ok-punkte">{Array.from({ length: BEDARF }, (_, i) => <i key={i} className={i < ui.geliefert ? 'lt-ok-an' : ''} />)}</span>
                <span style={{ fontSize: '13px', color: '#7A6550' }}>{heuteVorn.best ? `Heute vorn: ${heuteVorn.best.name} ${heuteVorn.best.score}` : ''}</span>
              </div>
              <span className={'lt-ok-uhr' + (ui.rest < 0.25 ? ' lt-ok-knapp' : '')} style={{ width: `${ui.rest * 100}%` }} />
            </div>
          )}
          <div className="lt-papier lt-ok-ofen">
            <canvas ref={feldRef} aria-label="Spielfeld: tippen dreht, wischen schiebt, Finger halten zeigt den Namen" onPointerDown={zeigerRunter} onPointerMove={zeigerBewegt} onPointerUp={zeigerHoch} onPointerCancel={() => { wisch.current = null; }} onContextMenu={(e) => e.preventDefault()} />
            <div ref={toastRef} className="lt-papier lt-ok-toast" aria-live="polite" />
          </div>
          <div className="lt-ok-knoepfe">
            <button aria-label="Nach links" {...halten(() => schieben(-1))}>{pfeil('M15 5l-7 7 7 7')}</button>
            <button aria-label="Drehen" {...halten(drehen, false)}><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.4-5.7" /><path d="M20 4v5h-5" /></svg></button>
            <button aria-label="Nach rechts" {...halten(() => schieben(1))}>{pfeil('M9 5l7 7-7 7')}</button>
            <button aria-label="Schneller" {...halten(runter)}>{pfeil('M12 5v14M6 13l6 6 6-6')}</button>
            <button aria-label="Fallen lassen" className="lt-ok-gold" {...halten(fallen, false)}>{pfeil('M7 4l5 5 5-5M7 10l5 5 5-5M5 20h14')}</button>
          </div>
          <FinishEarlyButton onClick={ende} />
        </div>
      )}

      {phase === 'ende' && bon && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="lt-receipt lt-papier lt-ok-bon" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', textAlign: 'center', padding: '26px 22px 40px' }}>
            <ReceiptHead />
            <div style={{ fontSize: '16px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Ofen-Kette{bon.ruhig ? ' (ruhig)' : ''}</div>
            <div className="lt-rc-mono" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', color: TH.ink }}>
              {bon.liste.length ? bon.liste.slice(0, 10).map(([n, k]) => <div key={n} className="lt-ok-bonzeile"><span>{n}</span><span>{k}×</span></div>) : <div className="lt-ok-bonzeile"><span>Noch nichts gebacken</span><span /></div>}
              <div className="lt-rc-line" />
              <div className="lt-ok-bonzeile"><span>Volle Reihen</span><span>{bon.reihen}</span></div>
              {!bon.ruhig && <div className="lt-ok-bonzeile"><span>Bestellungen fertig</span><span>{bon.bestellungen}</span></div>}
              {bon.fragen > 0 && <div className="lt-ok-bonzeile"><span>Allergen-Fragen richtig</span><span>{bon.fragenRichtig} von {bon.fragen}</span></div>}
              {bon.gold > 0 && <div className="lt-ok-bonzeile"><span>Goldene Brötchen</span><span>{bon.gold}</span></div>}
              <div className="lt-ok-bonzeile"><span>Längste Kette</span><span>×{bon.kette}</span></div>
              <div className="lt-rc-line" />
              <div className="lt-ok-bonzeile" style={{ fontWeight: 800, fontSize: '18px' }}><span>SUMME</span><span>{bon.roh.toLocaleString('de-DE')} Punkte</span></div>
            </div>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.45, color: TH.brown }}>
              {bon.fuerListe > 0 ? `Für die Bestenliste: ${bon.fuerListe} Punkte${bon.fuerListe < bon.roh ? (bon.ruhig ? ' (ruhig zählt halb' + (bon.fuerListe >= MAX_PUNKTE / 2 ? `, höchstens ${MAX_PUNKTE / 2})` : ')') : ` (höchstens ${MAX_PUNKTE} pro Runde)`) : ''}.` : 'Diesmal keine Punkte für die Bestenliste.'}
            </p>
            <ReceiptFoot />
          </div>
          <button onClick={() => start(bon.ruhig)} style={{ ...btnPrimary, alignSelf: 'center', minWidth: '240px' }}>Nochmal backen</button>
          <button onClick={() => setPhase('menu')} style={{ alignSelf: 'center', minHeight: '48px', padding: '0 20px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Zur Übersicht</button>
        </div>
      )}
    </div>
  );
}

export default OfenKetteView;
