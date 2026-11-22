// ═══ Rubbellos, Abzeichen-Album, Profil, Jahresrückblick ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState, useRef, useEffect } from 'react';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead, ConfettiOverlay } from './basis';
import type { Badge } from './lernstand';

// ───────── Rubbellos ─────────
export type LosPrize = { id: 'niete' | 'p50' | 'p150' | 'tip' | 'joker' | 'p5000'; icon: string; label: string };

export function drawLosPrize(): LosPrize {
  const r = Math.random();
  if (r < 0.05) return { id: 'p5000', icon: '💎', label: 'JACKPOT! +5.000 Punkte!' };
  if (r < 0.37) return { id: 'niete', icon: '🥖', label: 'Leider eine Niete. Nächstes Mal!' };
  if (r < 0.60) return { id: 'p50', icon: '⭐', label: '+50 Punkte' };
  if (r < 0.70) return { id: 'p150', icon: '🌟', label: '+150 Punkte' };
  if (r < 0.85) return { id: 'tip', icon: '💶', label: '2,00 € Trinkgeld' };
  return { id: 'joker', icon: '🃏', label: 'Ein Joker' };
}

/** 3D-Gewinne fürs Rubbellos */
export function LosIcon3D({ id }: { id: string }) {
  const star = (x: number, y: number, r: number) => <g><polygon points={Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`; }).join(' ')} fill="url(#lsGold)" stroke="#A87A0E" strokeWidth="1.2" strokeLinejoin="round" /><ellipse cx={x - r * 0.25} cy={y - r * 0.32} rx={r * 0.3} ry={r * 0.15} fill="rgba(255,255,255,.75)" /></g>;
  return (
    <svg width="72" height="72" viewBox="-30 -30 60 60" aria-hidden="true" style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 8px 8px rgba(31,20,12,.3))' }}>
      <defs>
        <radialGradient id="lsGold" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFF6C8" /><stop offset=".55" stopColor="#FFC72C" /><stop offset="1" stopColor="#C98A00" /></radialGradient>
        <linearGradient id="lsCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EADCC3" /></linearGradient>
        <linearGradient id="lsGem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F3E0FF" /><stop offset=".5" stopColor="#B26BFF" /><stop offset="1" stopColor="#5A1FB8" /></linearGradient>
        <linearGradient id="lsNote" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E6F6E0" /><stop offset="1" stopColor="#7DBE6E" /></linearGradient>
      </defs>
      {id === 'p50' && star(0, 0, 24)}
      {id === 'p150' && <g>{star(-9, 6, 15)}{star(9, -6, 19)}</g>}
      {id === 'tip' && <g><rect x="-26" y="-12" width="40" height="24" rx="3" fill="url(#lsNote)" stroke="#4E8A42" strokeWidth="1.2" transform="rotate(-8)" /><circle cx="-6" cy="-1" r="6" fill="none" stroke="#4E8A42" strokeWidth="1.4" transform="rotate(-8)" /><circle cx="9" cy="8" r="13" fill="#A87A0E" /><circle cx="9" cy="6" r="13" fill="url(#lsGold)" stroke="#A87A0E" strokeWidth="1.2" /><text x="9" y="7" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="900" fill="#7A5300" fontFamily="Arial, sans-serif">€</text></g>}
      {id === 'joker' && <g><rect x="-17" y="-22" width="28" height="38" rx="5" fill="url(#lsCard)" stroke="#8A6A3A" strokeWidth="1.2" transform="rotate(-12)" /><rect x="-10" y="-21" width="28" height="38" rx="5" fill="url(#lsCard)" stroke="#8A6A3A" strokeWidth="1.2" transform="rotate(10)" /><text x="4" y="-1" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="900" fill="#D92D20" fontFamily="Arial, sans-serif" transform="rotate(10)">50:50</text></g>}
      {id === 'p5000' && <g><path d="M-24-8l10-13h28l10 13-24 30z" fill="url(#lsGem)" stroke="#5A1FB8" strokeWidth="1.4" strokeLinejoin="round" /><path d="M-24-8h48M-14-21l6 13 8 30M14-21l-6 13-8 30M-8-8l8-13 8 13" stroke="rgba(255,255,255,.6)" strokeWidth="1.1" fill="none" /><path d="M-16-15l4-4" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" /></g>}
    </svg>
  );
}

// Version 263: Rubbellos mit drei Feldern (Nutzer wählte Vorschlag C): drei runde Goldfelder freirubbeln,
// drei gleiche Bilder = Gewinn. Sind die ersten zwei gleich, leuchtet das dritte Feld. Bei einer Niete sind die Bilder
// nicht alle gleich. Der Gewinn ist vorher gezogen und schon gutgeschrieben (wie bisher). Krümel beim Rubbeln,
// die Folie bröckelt ab, Strahlen und Funken bei Gewinn. Farben stehen als Klassen im <style> (mit lt-papier),
// damit sie im dunklen Design echt bleiben.
const LOS_CSS = `
.lt-papier.lt-los3{position:relative;overflow:hidden;width:100%;max-width:330px;aspect-ratio:330/200;border-radius:14px;background:#FFFDF6;color:#2B170A;box-shadow:0 1px 2px rgba(31,20,12,.06),0 14px 28px -14px rgba(31,20,12,.5)}
.lt-papier.lt-los3 .lt-los3-rand{position:absolute;inset:0;border-radius:14px;overflow:hidden;pointer-events:none}
.lt-papier.lt-los3 .lt-los3-kopf{position:absolute;left:0;right:0;top:0;height:34px;display:flex;align-items:center;justify-content:center;gap:8px;background:#FFC72C;font-weight:800;font-size:13px;letter-spacing:2.5px;color:#4B2A14}
.lt-papier.lt-los3 .lt-los3-kopf i{font-style:normal;font-weight:600;letter-spacing:0}
.lt-papier.lt-los3.lt-los3-rare .lt-los3-kopf{background:linear-gradient(90deg,#6A1FD1,#C21E8E);color:#FFFFFF}
.lt-papier.lt-los3 .lt-los3-felder{position:absolute;left:12px;right:12px;top:44px;bottom:10px;display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:8px;align-items:center}
.lt-papier.lt-los3 .lt-los3-feld{position:relative;border-radius:50%;background:#FFF4D8;aspect-ratio:1}
.lt-papier.lt-los3 .lt-los3-bild{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.lt-papier.lt-los3 .lt-los3-bild svg{width:58px;height:58px}
.lt-papier.lt-los3 .lt-los3-feld canvas.lt-los3-folie{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;touch-action:none;cursor:grab}
.lt-papier.lt-los3 .lt-los3-glanz{position:absolute;inset:0;border-radius:50%;pointer-events:none;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.55) 45%,transparent 60%) -150% 0/200% 100% no-repeat;animation:ltLosGlanz 2.6s ease-in-out infinite}
.lt-papier.lt-los3 .lt-los3-feld:nth-child(2) .lt-los3-glanz{animation-delay:.25s}.lt-papier.lt-los3 .lt-los3-feld:nth-child(3) .lt-los3-glanz{animation-delay:.5s}
.lt-papier.lt-los3 .lt-los3-strahlen{position:absolute;left:50%;top:50%;width:190px;height:190px;margin:-95px 0 0 -95px;border-radius:50%;background:repeating-conic-gradient(rgba(255,199,44,.4) 0 10deg,transparent 10deg 20deg);-webkit-mask:radial-gradient(circle,#000 22%,transparent 66%);mask:radial-gradient(circle,#000 22%,transparent 66%);opacity:0;pointer-events:none}
.lt-papier.lt-los3.lt-los3-rare .lt-los3-strahlen{background:repeating-conic-gradient(rgba(178,107,255,.42) 0 10deg,transparent 10deg 20deg)}
.lt-papier.lt-los3 .lt-los3-strahlen.an{animation:ltLosStrahlen .5s ease forwards,ltLosDreh 9s linear infinite}
.lt-papier.lt-los3 .lt-los3-bild.pop{animation:ltLosPop .7s cubic-bezier(.2,1.6,.4,1) both}
.lt-papier.lt-los3 .lt-los3-bild.wackel{animation:ltLosWackel .6s ease both}
.lt-papier.lt-los3 .lt-los3-feld.spannend{animation:ltLosSpannend .7s ease-in-out infinite}
.lt-los3-kruemel{position:absolute;left:-40px;right:-40px;top:-30px;bottom:-150px;width:calc(100% + 80px);height:calc(100% + 180px);pointer-events:none;z-index:8}
@keyframes ltLosGlanz{0%{background-position:-150% 0}60%,100%{background-position:150% 0}}
@keyframes ltLosStrahlen{to{opacity:1}}@keyframes ltLosDreh{to{transform:rotate(360deg)}}
@keyframes ltLosPop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1)}}
@keyframes ltLosWackel{0%,100%{transform:none}20%{transform:rotate(-8deg)}40%{transform:rotate(6deg)}60%{transform:rotate(-4deg)}80%{transform:rotate(2deg)}}
@keyframes ltLosSpannend{0%,100%{box-shadow:0 0 0 0 rgba(255,199,44,0)}50%{box-shadow:0 0 0 7px rgba(255,199,44,.6)}}
@media (prefers-reduced-motion:reduce){.lt-papier.lt-los3 .lt-los3-glanz,.lt-papier.lt-los3 .lt-los3-feld.spannend{animation:none}.lt-papier.lt-los3 .lt-los3-strahlen.an{animation:none;opacity:1}}
`;
const LOS_ALLE: LosPrize['id'][] = ['p50', 'p150', 'tip', 'joker', 'p5000'];
/** Bilder der drei Felder: Gewinn = dreimal dasselbe, Niete = zwei gleiche und eins anders (oder alle verschieden) */
export function losBilder(id: LosPrize['id'], zufall = Math.random): LosPrize['id'][] {
  if (id !== 'niete') return [id, id, id];
  const mix = [...LOS_ALLE].sort(() => zufall() - 0.5);
  const zwei = zufall() < 0.7;
  const b = zwei ? [mix[0], mix[0], mix[1]] : [mix[0], mix[1], mix[2]];
  return b.sort(() => zufall() - 0.5);
}

const ohneBewegung = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('lt-noanim'); } catch { return false; } };

type Teil = { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; a: number; f: number; farbe?: string; bild?: HTMLCanvasElement; sx?: number; sy?: number; sw?: number; sh?: number };
/** Krümel, abbröckelnde Folie und Funken auf einer Leinwand über dem Los */
function kruemelMaler(c: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr);
  const x = c.getContext('2d')!; const teile: Teil[] = []; let laeuft = false; let aus = false;
  const tick = () => {
    if (aus) return;
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, c.clientWidth, c.clientHeight);
    for (let i = teile.length - 1; i >= 0; i--) {
      const p = teile[i]; p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.a -= p.f;
      if (p.a <= 0 || p.y > c.clientHeight + 20) { teile.splice(i, 1); continue; }
      x.save(); x.globalAlpha = Math.max(0, p.a); x.translate(p.x, p.y); x.rotate(p.r);
      if (p.bild) x.drawImage(p.bild, p.sx!, p.sy!, p.sw!, p.sh!, -p.w / 2, -p.h / 2, p.w, p.h); else { x.fillStyle = p.farbe || '#F5C531'; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      x.restore();
    }
    if (teile.length) requestAnimationFrame(tick); else laeuft = false;
  };
  const start = () => { if (!laeuft) { laeuft = true; requestAnimationFrame(tick); } };
  const ruhig = ohneBewegung();
  return {
    stopp() { aus = true; },
    streuen(px: number, py: number, rare: boolean) { if (ruhig) return; for (let i = 0; i < 3; i++) teile.push({ x: px + (Math.random() - 0.5) * 16, y: py + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2.5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, w: 2 + Math.random() * 4, h: 2 + Math.random() * 3, a: 1, f: 0.025, farbe: rare ? (Math.random() < 0.5 ? '#C99BFF' : '#7B2FF7') : (Math.random() < 0.5 ? '#F5C531' : '#C98A00') }); start(); },
    abbroeckeln(fc: HTMLCanvasElement, ox: number, oy: number, fdpr: number) {
      if (ruhig) return;
      const w = fc.width / fdpr, h = fc.height / fdpr, n = 5, m = 5, tw = w / n, th = h / m;
      const d = fc.getContext('2d')!.getImageData(0, 0, fc.width, fc.height).data;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
        const cx = Math.floor((i + 0.5) * tw * fdpr), cy = Math.floor((j + 0.5) * th * fdpr);
        if (d[(cy * fc.width + cx) * 4 + 3] < 30) continue;
        const kopie = document.createElement('canvas'); kopie.width = Math.max(1, Math.round(tw * fdpr)); kopie.height = Math.max(1, Math.round(th * fdpr));
        kopie.getContext('2d')!.drawImage(fc, i * tw * fdpr, j * th * fdpr, tw * fdpr, th * fdpr, 0, 0, kopie.width, kopie.height);
        teile.push({ bild: kopie, sx: 0, sy: 0, sw: kopie.width, sh: kopie.height, w: tw, h: th, x: ox + (i + 0.5) * tw, y: oy + (j + 0.5) * th, vx: (Math.random() - 0.5) * 4, vy: -1 - Math.random() * 3, r: 0, vr: (Math.random() - 0.5) * 0.25, a: 1, f: 0.014 });
      }
      start();
    },
    funken(px: number, py: number, rare: boolean) { if (ruhig) return; for (let i = 0; i < 46; i++) { const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6; teile.push({ x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, r: 0, vr: 0.3, w: 3 + Math.random() * 4, h: 3 + Math.random() * 4, a: 1, f: 0.015, farbe: rare ? ['#B26BFF', '#FFE27A', '#FFFFFF', '#C21E8E'][i % 4] : ['#FFC72C', '#FFF1B8', '#E8534F', '#7DBE6E'][i % 4] }); } start(); },
  };
}

/** Goldfolie mit eingeprägten Ähren auf ein rundes Feld malen */
function maleFolie(c: HTMLCanvasElement, rare: boolean) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = c.clientWidth || 90, h = c.clientHeight || 90;
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  const x = c.getContext('2d', { willReadFrequently: true })!; x.scale(dpr, dpr);
  const g = x.createLinearGradient(0, 0, w, h);
  if (rare) { g.addColorStop(0, '#5B1BB8'); g.addColorStop(0.45, '#C99BFF'); g.addColorStop(0.55, '#E9D2FF'); g.addColorStop(1, '#8E1A72'); }
  else { g.addColorStop(0, '#C98A00'); g.addColorStop(0.4, '#FFD95A'); g.addColorStop(0.52, '#FFF1B8'); g.addColorStop(0.64, '#F5C531'); g.addColorStop(1, '#B57B00'); }
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = rare ? 'rgba(255,255,255,.28)' : 'rgba(120,80,0,.22)'; x.lineWidth = 1.3; x.lineCap = 'round';
  for (let yy = 8; yy < h; yy += 26) for (let xx = ((yy / 26) % 2) * 14 + 6; xx < w; xx += 28) {
    x.beginPath(); x.moveTo(xx, yy + 10); x.lineTo(xx, yy - 2); x.stroke();
    for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(xx - 2.6, yy + 5 - k * 4, 1.6, 3, -0.5, 0, 7); x.stroke(); x.beginPath(); x.ellipse(xx + 2.6, yy + 5 - k * 4, 1.6, 3, 0.5, 0, 7); x.stroke(); }
  }
  return { x, w, h, dpr };
}

export function ScratchCard({ prize, onRevealed }: { prize: LosPrize; onRevealed: () => void }) {
  const rare = prize.id === 'p5000';
  const [bilder] = useState(() => losBilder(prize.id));
  const losRef = useRef<HTMLDivElement | null>(null);
  const kruemelRef = useRef<HTMLCanvasElement | null>(null);
  const malerRef = useRef<ReturnType<typeof kruemelMaler> | null>(null);
  const [offen, setOffen] = useState<number[]>([]);
  const [info, setInfo] = useState(rare ? 'Ein seltenes Goldlos! Rubbel alle drei Felder frei.' : 'Rubbel alle drei Felder mit dem Finger frei.');
  const fertig = offen.length === 3;
  useEffect(() => {
    const los = losRef.current, kc = kruemelRef.current; if (!los || !kc) return;
    const kr = kruemelMaler(kc); malerRef.current = kr;
    const geoeffnet: number[] = [];
    const aufraeumen: (() => void)[] = [];
    [...los.querySelectorAll<HTMLCanvasElement>('canvas.lt-los3-folie')].forEach((c, nr) => {
      const f = maleFolie(c, rare);
      let an = false, letzter: { x: number; y: number } | null = null, zug = 0, vorbei = false;
      const pos = (e: PointerEvent) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (f.w / r.width), y: (e.clientY - r.top) * (f.h / r.height), bx: e.clientX, by: e.clientY }; };
      const pruefe = () => {
        const d = f.x.getImageData(0, 0, c.width, c.height).data; let frei = 0, alle = 0;
        for (let i = 3; i < d.length; i += 4 * 9) { alle++; if (d[i] === 0) frei++; }
        // Ecken außerhalb des Kreises zählen mit, darum ab 50 % aller Punkte (gut 60 % der Kreisfläche)
        if (vorbei || frei / alle < 0.5) return;
        vorbei = true;
        const kb = kc.getBoundingClientRect(), cb = c.getBoundingClientRect();
        kr.abbroeckeln(c, cb.left - kb.left, cb.top - kb.top, f.dpr);
        f.x.setTransform(1, 0, 0, 1, 0, 0); f.x.clearRect(0, 0, c.width, c.height); c.style.pointerEvents = 'none';
        geoeffnet.push(nr); setOffen([...geoeffnet]);
      };
      const zeichne = (p: { x: number; y: number; bx: number; by: number }) => {
        f.x.globalCompositeOperation = 'destination-out'; f.x.strokeStyle = '#000'; f.x.lineCap = 'round'; f.x.lineJoin = 'round'; f.x.lineWidth = 28;
        f.x.beginPath(); const a = letzter || p; f.x.moveTo(a.x, a.y); f.x.lineTo(p.x + 0.1, p.y); f.x.stroke(); letzter = p;
        const kb = kc.getBoundingClientRect(); kr.streuen(p.bx - kb.left, p.by - kb.top, rare);
        if (++zug % 4 === 0) pruefe();
      };
      const runter = (e: PointerEvent) => { if (vorbei) return; an = true; letzter = null; try { c.setPointerCapture(e.pointerId); } catch { /* egal */ } c.parentElement?.querySelector('.lt-los3-glanz')?.remove(); zeichne(pos(e)); };
      const bewegt = (e: PointerEvent) => { if (an && !vorbei) zeichne(pos(e)); };
      const hoch = () => { an = false; letzter = null; if (!vorbei) pruefe(); };
      c.addEventListener('pointerdown', runter); c.addEventListener('pointermove', bewegt); c.addEventListener('pointerup', hoch); c.addEventListener('pointercancel', hoch);
      aufraeumen.push(() => { c.removeEventListener('pointerdown', runter); c.removeEventListener('pointermove', bewegt); c.removeEventListener('pointerup', hoch); c.removeEventListener('pointercancel', hoch); });
    });
    return () => { aufraeumen.forEach((f) => f()); kr.stopp(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Nach jedem freigerubbelten Feld: Spannung beim dritten, am Ende Auswertung
  useEffect(() => {
    if (offen.length === 2) { const [a, b] = offen; if (bilder[a] === bilder[b]) setInfo('Zwei gleiche! Jetzt das letzte Feld ...'); }
    if (offen.length !== 3) return;
    if (prize.id === 'niete') { setInfo('Leider keine drei gleichen. Viel Glück beim nächsten Los.'); onRevealed(); return; }
    setInfo(rare ? 'Wahnsinn! Das gibt es nur etwa bei jedem 20. Los. Schon gutgeschrieben.' : 'Gewonnen! Ist schon gutgeschrieben.');
    const kc = kruemelRef.current, los = losRef.current, kr = malerRef.current;
    if (kc && los && kr) {
      const kb = kc.getBoundingClientRect(), lb = los.getBoundingClientRect();
      kr.funken(lb.left - kb.left + lb.width / 2, lb.top - kb.top + lb.height / 2, rare);
      if (rare) window.setTimeout(() => { kr.funken(lb.left - kb.left + 40, lb.top - kb.top + 30, true); kr.funken(lb.left - kb.left + lb.width - 40, lb.top - kb.top + 30, true); }, 450);
    }
    onRevealed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offen.length]);
  const zweiGleich = offen.length === 2 && bilder[offen[0]] === bilder[offen[1]];
  const ergebnis = !fertig ? '' : prize.id === 'niete' ? 'Leider eine Niete' : `Drei gleiche: ${prize.label}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <style>{LOS_CSS}</style>
      <div style={{ position: 'relative', width: '100%', maxWidth: '330px', display: 'flex', justifyContent: 'center' }}>
        <div ref={losRef} className={`lt-papier lt-los3${rare ? ' lt-los3-rare' : ''}`}>
          <div className="lt-los3-rand" aria-hidden="true"><div className="lt-los3-kopf">{rare ? 'GOLDLOS' : 'HINKEL'} <i>3 gleiche gewinnen</i></div></div>
          <div className="lt-los3-felder">
            {bilder.map((b, i) => (
              <div key={i} className={`lt-los3-feld${zweiGleich && !offen.includes(i) ? ' spannend' : ''}`}>
                <div className={`lt-los3-strahlen${fertig && prize.id !== 'niete' ? ' an' : ''}`} />
                <div className={`lt-los3-bild${offen.includes(i) ? (fertig && prize.id === 'niete' ? ' wackel' : ' pop') : ''}`}><LosIcon3D id={b} /></div>
                <canvas className="lt-los3-folie" aria-label={`Feld ${i + 1} freirubbeln`} />
                <div className="lt-los3-glanz" />
              </div>
            ))}
          </div>
        </div>
        <canvas ref={kruemelRef} className="lt-los3-kruemel" aria-hidden="true" />
      </div>
      <div className="lt-los3-ergebnis" role="status" style={{ fontFamily: TH.serif, fontSize: '22px', lineHeight: 1.2, minHeight: '27px', color: rare ? '#7B2FF7' : TH.ink }}>{ergebnis}</div>
      {fertig && prize.id !== 'niete' && <ConfettiOverlay active />}
      <span className="lt-los3-info" style={{ fontSize: '15px', color: TH.muted }}>{info}</span>
    </div>
  );
}

// ───────── Abzeichen-Album (Buch zum Blättern) ─────────
/** Abzeichen als Stickerheft: Papierseiten mit Spiralbindung, Blättern wie im Buch, neue Sticker werden „eingeklebt“.
 *  Welche Sticker man im Heft schon gesehen hat, merkt sich das Gerät (nur für die Einklebe-Animation). */
const STICKER_CSS = `
.lt-heft{position:relative;perspective:1600px}
.lt-heft-seite{position:relative;min-height:100%;padding:18px 16px 14px 34px;border-radius:6px 18px 18px 6px;background:#FFFCF4;
  background-image:repeating-linear-gradient(0deg,rgba(75,42,20,.045) 0 1px,transparent 1px 28px),linear-gradient(90deg,rgba(75,42,20,.10),rgba(75,42,20,0) 22px);
  box-shadow:0 1px 2px rgba(31,20,12,.06),0 14px 26px -16px rgba(31,20,12,.45),inset -6px 0 10px -8px rgba(75,42,20,.25)}
.lt-heft-spirale{position:absolute;left:8px;top:14px;bottom:14px;width:14px;display:flex;flex-direction:column;justify-content:space-around;pointer-events:none}
.lt-heft-spirale i{display:block;width:14px;height:8px;border-radius:5px;background:linear-gradient(180deg,#9AA3AD,#5E6670);box-shadow:inset 0 1px 0 rgba(255,255,255,.6)}
.lt-heft-blatt{position:absolute;inset:0;z-index:5;transform-style:preserve-3d;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform-origin:left center}
.lt-heft-blatt.vor{animation:ltBlattVor .7s cubic-bezier(.45,.05,.3,1) forwards}
.lt-heft-blatt.zurueck{animation:ltBlattZurueck .7s cubic-bezier(.45,.05,.3,1) forwards}
.lt-heft-blatt::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.18));animation:ltBlattSchatten .7s ease forwards}
@keyframes ltBlattVor{from{transform:rotateY(0)}to{transform:rotateY(-178deg)}}
@keyframes ltBlattZurueck{from{transform:rotateY(-178deg)}to{transform:rotateY(0)}}
@keyframes ltBlattSchatten{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
.lt-heft-raster{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:16px 12px}
.lt-sticker{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.lt-sticker-bild{position:relative;width:74px;height:74px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:38px;line-height:1;
  background:radial-gradient(circle at 35% 30%,#FFF6D6,#FFC72C 70%,#E0A400);border:5px solid #FFFFFF;box-shadow:0 3px 0 rgba(0,0,0,.06),0 8px 14px -6px rgba(31,20,12,.45);overflow:hidden}
.lt-sticker-bild::after{content:"";position:absolute;top:-30%;left:-60%;width:45%;height:160%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.65),rgba(255,255,255,0));transform:rotate(20deg);animation:ltStickerGlanz 4.5s ease-in-out infinite;animation-delay:var(--gd,0s)}
@keyframes ltStickerGlanz{0%,70%{left:-60%}100%{left:130%}}
.lt-sticker-leer .lt-sticker-bild{background:transparent;border:3px dashed #D9C4A0;box-shadow:none;filter:grayscale(1);opacity:.45}
.lt-sticker-leer .lt-sticker-bild::after{display:none}
.lt-sticker-neu .lt-sticker-bild{animation:ltEinkleben .95s cubic-bezier(.2,1.2,.3,1) both;animation-delay:var(--nd,0s)}
.lt-sticker-neu .lt-sticker-bild::before{content:"";position:absolute;right:-2px;top:-2px;width:24px;height:24px;background:linear-gradient(225deg,#FFFFFF 50%,rgba(0,0,0,.12) 50%);border-radius:0 50% 0 0;animation:ltEcke .9s ease both;animation-delay:calc(var(--nd,0s) + .7s)}
@keyframes ltEinkleben{0%{transform:translate(40px,-120px) rotate(-35deg) scale(1.35);opacity:0;box-shadow:0 30px 30px -10px rgba(31,20,12,.35)}
  55%{transform:translate(0,-6px) rotate(6deg) scale(1.12);opacity:1}75%{transform:translate(0,2px) rotate(var(--rot)) scale(.94)}100%{transform:rotate(var(--rot)) scale(1)}}
@keyframes ltEcke{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.2)}}
@media (prefers-reduced-motion: reduce){.lt-heft-blatt,.lt-sticker-neu .lt-sticker-bild,.lt-sticker-bild::after{animation:none !important}.lt-heft-blatt{display:none}}
html.lt-noanim .lt-heft-blatt{display:none}
`;

export function BadgeAlbumView({ badges, perPage = 6, eigen = true }: { badges: Badge[]; perPage?: number; eigen?: boolean }) {
  const pages = Math.max(1, Math.ceil(badges.length / perPage));
  const [page, setPage] = useState(0);
  const [blatt, setBlatt] = useState<{ von: number; dir: 'vor' | 'zurueck'; k: number } | null>(null);
  const startX = useRef<number | null>(null);
  const SCHLUESSEL = 'lt_heft_gesehen';
  const [gesehen, setGesehen] = useState<string[]>(() => { if (!eigen) return badges.map((b) => b.id); try { return JSON.parse(localStorage.getItem(SCHLUESSEL) || '[]'); } catch { return []; } });
  const go = (d: number) => {
    const n = page + d; if (n < 0 || n >= pages || blatt) return;
    setBlatt({ von: page, dir: d > 0 ? 'vor' : 'zurueck', k: Date.now() }); setPage(n);
    window.setTimeout(() => setBlatt(null), 720);
  };
  // Neu verdiente Sticker der sichtbaren Seite nach dem Einkleben als „gesehen“ merken
  useEffect(() => {
    if (!eigen || blatt) return;
    const neu = badges.slice(page * perPage, page * perPage + perPage).filter((b) => b.ok && !gesehen.includes(b.id)).map((b) => b.id);
    if (!neu.length) return;
    const t = window.setTimeout(() => { const g = [...gesehen, ...neu]; setGesehen(g); try { localStorage.setItem(SCHLUESSEL, JSON.stringify(g)); } catch { /* egal */ } }, 2600);
    return () => window.clearTimeout(t);
  }, [page, blatt, badges.map((b) => b.id + (b.ok ? 1 : 0)).join()]);
  const drehung = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return ((h % 13) - 6); };
  const seite = (n: number, animiert: boolean) => {
    const items = badges.slice(n * perPage, n * perPage + perPage);
    let neuIdx = 0;
    return (
      <div className="lt-heft-seite lt-papier">
        <span className="lt-heft-spirale" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</span>
        <div className="lt-heft-raster">
          {items.map((b, i) => {
            const neu = animiert && eigen && b.ok && !gesehen.includes(b.id);
            const st: any = { ['--rot']: `${drehung(b.id)}deg`, ['--gd']: `${i * 0.7}s`, ['--nd']: `${(neu ? neuIdx++ : 0) * 0.35}s` };
            return (
              <div key={b.id} title={b.desc} className={`lt-sticker${b.ok ? '' : ' lt-sticker-leer'}${neu ? ' lt-sticker-neu' : ''}`} style={st}>
                <span className="lt-sticker-bild" style={{ transform: b.ok && !neu ? `rotate(${drehung(b.id)}deg)` : undefined }} aria-hidden="true">{b.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: b.ok ? '#2B170A' : TH.muted }}>{b.title}</span>
                <span style={{ fontSize: '13px', color: TH.muted, lineHeight: 1.3 }}>{b.desc}</span>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '13px', color: TH.muted, fontFamily: "'Courier Prime', ui-monospace, monospace" }}>Seite {n + 1} von {pages}</div>
      </div>
    );
  };
  return (
    <div className="lt-heft">
      <style>{STICKER_CSS}</style>
      <div style={{ position: 'relative' }}
        onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (startX.current == null) return; const dx = e.changedTouches[0].clientX - startX.current; startX.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
        {/* Unten liegt immer die Seite, die man am Ende sieht; das umblätternde Blatt liegt darüber */}
        {blatt && blatt.dir === 'zurueck' ? seite(blatt.von, false) : seite(page, !blatt)}
        {blatt && <div key={blatt.k} className={`lt-heft-blatt ${blatt.dir}`} aria-hidden="true">{seite(blatt.dir === 'vor' ? blatt.von : page, false)}</div>}
      </div>
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
          <button onClick={() => go(-1)} disabled={page === 0} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: 'none', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '16px', fontWeight: 700, cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.35 : 1 }}>‹ Zurückblättern</button>
          <button onClick={() => go(1)} disabled={page >= pages - 1} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: 'none', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '16px', fontWeight: 700, cursor: page >= pages - 1 ? 'default' : 'pointer', opacity: page >= pages - 1 ? 0.35 : 1 }}>Umblättern ›</button>
        </div>
      )}
    </div>
  );
}

// ───────── Profilseite (aus der Bestenliste) ─────────
export type ProfileData = {
  name: string; avatar?: string; avatarClass?: string; nameClass?: string; title?: string;
  levelNo: number; levelTitle: string; levelIcon?: string; points: number; mastery: number;
  badges: Badge[]; favGame?: string; streak: number; bestStreak: number; crowns: number;
  battles: { w: number; l: number; d: number }; isMe: boolean;
};

export const PRAISE_TEXTS = ['Super gemacht!', 'Weiter so, ich bin stolz auf dich!', 'Klasse Fortschritt diese Woche!', 'Du bist auf einem richtig guten Weg!', 'Spitze, du gehörst zu den Besten!'];

export function ProfileView({ d, onBack, onPraise }: { d: ProfileData; onBack: () => void; onPraise?: (text: string) => void }) {
  const [sent, setSent] = useState('');
  const earned = d.badges.filter(b => b.ok);
  const total = d.battles.w + d.battles.l + d.battles.d;
  const PIC: Record<string, string[]> = {
    star: ['M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z'],
    book: ['M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z', 'M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'],
    flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
    game: ['M6 6h12a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z', 'M6 12h4', 'M8 10v4', 'M15 13h.01', 'M18 11h.01'],
    crown: ['M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 10H4.8z', 'M5 21h14'],
    swords: ['M14.5 17.5 3 6V3h3l11.5 11.5', 'm13 19 6-6', 'm16 16 4 4', 'M14.5 6.5 18 3h3v3l-3.5 3.5', 'm5 14 4 4', 'm7 17-3 3'],
  };
  const tile = (icon: string, label: string, value: string, i = 0) => (
    <div className="lt-tile" style={{ animationDelay: `${i * 0.06}s`, display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', borderRadius: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)' }}>
      <span aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{(PIC[icon] || PIC.star).map((p, k) => <path key={k} d={p} />)}</svg>
      </span>
      <span style={{ fontSize: '14px', color: TH.muted }}>{label}</span>
      <strong style={{ fontFamily: TH.serif, fontSize: '22px', lineHeight: 1.15 }}>{value}</strong>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <PageHead title={d.isMe ? 'Dein Profil' : 'Profil'} onBack={onBack} backLabel="Zur Bestenliste" />
      <div className="lt-pop-in" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', padding: '24px', borderRadius: '28px', backgroundColor: '#4B2A14', backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1.4px), radial-gradient(ellipse 80% 60% at 100% 0, rgba(255,199,44,.2), rgba(255,199,44,0) 60%)', backgroundSize: '6px 6px, auto', color: '#FFF6E0', boxShadow: '0 18px 32px -16px rgba(75,42,20,.7)' }}>
        <span className={d.levelNo >= 13 ? 'lt-frame-gold' : d.levelNo >= 9 ? 'lt-frame-silver' : d.levelNo >= 5 ? 'lt-frame-bronze' : undefined} style={d.levelNo >= 5 ? { width: '104px', height: '104px', padding: 0 } : undefined}><span className={d.avatarClass || 'lt-emo-bob'} style={{ fontSize: d.levelNo >= 5 ? '58px' : '72px', lineHeight: 1, display: 'inline-block' }}>{d.avatar || '🥨'}</span></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.12em', color: '#FFC72C' }}>{d.isMe ? 'DEIN PROFIL' : 'PROFIL'}</span>
          <span className={d.nameClass} style={{ fontFamily: TH.serif, fontSize: '36px', fontWeight: 800, lineHeight: 1.05, color: d.nameClass ? undefined : '#FFF6E0' }}>{d.name}</span>
          {d.title && <span style={{ alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '999px', backgroundColor: '#FFC72C', color: '#2B170A', fontSize: '14px', fontWeight: 800 }}>{d.title}</span>}
          <span style={{ fontSize: '16px', color: '#F0D9AE' }}>{d.levelIcon || '⭐'} Stufe {d.levelNo} · {d.levelTitle}</span>
        </div>
      </div>
      {onPraise && !d.isMe && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong style={{ fontSize: '18px' }}>Lob schicken</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRAISE_TEXTS.map(t => (
              <button key={t} onClick={() => { onPraise(t); setSent(t); }} style={{ minHeight: '44px', padding: '0 14px', borderRadius: '999px', border: `2px solid ${sent === t ? TH.green : TH.line}`, backgroundColor: sent === t ? TH.tintSage : TH.white, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
          {sent && <span style={{ fontSize: '15px', color: TH.green, fontWeight: 700 }}>✓ Gesendet. {d.name} sieht es beim nächsten Öffnen der App.</span>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        {tile('star', 'Punkte', d.points.toLocaleString('de-DE'), 0)}
        {tile('book', 'Gemeistert', `${d.mastery} %`, 1)}
        {tile('flame', 'Lern-Serie', `${d.streak} ${d.streak === 1 ? 'Tag' : 'Tage'} (Rekord ${d.bestStreak})`, 2)}
        {tile('game', 'Lieblingsspiel', d.favGame || 'Noch keins', 3)}
        {tile('crown', 'Monats-Kronen', String(d.crowns), 4)}
        {tile('swords', 'Battles', total ? `${d.battles.w} Siege · ${d.battles.l} Niederl. · ${d.battles.d} Unent.` : 'Noch keine', 5)}
      </div>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ margin: 0, fontFamily: TH.serif, fontSize: '28px' }}>Abzeichen <span style={{ fontSize: '18px', color: TH.muted, fontWeight: 600 }}>{earned.length} von {d.badges.length}</span></h2>
        <BadgeAlbumView badges={d.badges} eigen={false} />
      </section>
    </div>
  );
}

/** Handy: beim Spielstart die Überschrift wegscrollen, damit Aufgabe und Knöpfe sofort sichtbar sind */
export function scrollToPlay() {
  if (typeof window === 'undefined' || window.innerWidth >= 700) return;
  window.setTimeout(() => {
    const h = document.querySelector('main h1');
    if (!h) return;
    const box = (h.parentElement || h) as HTMLElement;
    window.scrollTo({ top: Math.max(0, box.getBoundingClientRect().bottom + window.scrollY - 6), behavior: 'smooth' });
  }, 120);
}

// ───────── Jahresrückblick (Dezember) ─────────
export type YearData = { year: number; name: string; points: number; rounds: number; days: number; favGame?: string; bestStreak: number; badges: number; badgesTotal: number; crowns: number; battlesWon: number; mastery: number; topCat?: string };

export function YearReviewView({ d, onBack }: { d: YearData; onBack: () => void }) {
  const slides: { bg: string; icon: string; over: string; big: string; text: string }[] = [
    { bg: 'linear-gradient(160deg,#FFC72C,#F28C1B)', icon: '🥨', over: `Dein Jahr ${d.year}`, big: `Hallo ${d.name}!`, text: 'Schauen wir zurück, was du dieses Jahr in der Lern-Theke geschafft hast.' },
    { bg: 'linear-gradient(160deg,#4B2A14,#8A5A2B)', icon: '⭐', over: 'Gesammelte Punkte', big: d.points.toLocaleString('de-DE'), text: `in ${d.rounds.toLocaleString('de-DE')} Runden aus Quiz und Spielen.` },
    { bg: 'linear-gradient(160deg,#3E7C59,#7FB685)', icon: '📅', over: 'Lerntage', big: String(d.days), text: d.days >= 100 ? 'Wahnsinn, du warst fast jeden Arbeitstag dabei!' : d.days >= 30 ? 'Richtig fleißig, das merkt man an der Theke.' : 'Jeder Tag zählt, nächstes Jahr wird es noch mehr.' },
    { bg: 'linear-gradient(160deg,#C2410C,#F59E0B)', icon: '🔥', over: 'Deine längste Serie', big: `${d.bestStreak} ${d.bestStreak === 1 ? 'Tag' : 'Tage'}`, text: 'am Stück gelernt.' },
    { bg: 'linear-gradient(160deg,#2B4C7E,#5B8DD6)', icon: '🎮', over: 'Dein Lieblingsspiel', big: d.favGame || 'Das Quiz', text: d.topCat ? `Und dein stärkstes Thema: ${d.topCat}.` : 'Da warst du am liebsten unterwegs.' },
    { bg: 'linear-gradient(160deg,#7A4A00,#C9A227)', icon: '🏅', over: 'Abzeichen & Erfolge', big: `${d.badges} von ${d.badgesTotal}`, text: `${d.crowns > 0 ? `${d.crowns} ${d.crowns === 1 ? 'Monatskrone' : 'Monatskronen'} 👑 · ` : ''}${d.battlesWon > 0 ? `${d.battlesWon} Battles gewonnen ⚔️ · ` : ''}${d.mastery} % aller Fragen gemeistert.` },
    { bg: 'linear-gradient(160deg,#FFC72C,#FFE58A)', icon: '🎉', over: 'Danke!', big: 'Frohe Weihnachten!', text: `Schön, dass du dabei bist. Auf ein tolles ${d.year + 1} an der Theke!` },
  ];
  const [i, setI] = useState(0);
  const s = slides[i];
  const dark = i > 0 && i < slides.length - 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <PageHead title={`Dein Jahr ${d.year}`} onBack={onBack} backLabel="Zur Startseite" />
      <div onClick={() => setI(Math.min(slides.length - 1, i + 1))} role="button" aria-label="Weiter" style={{ position: 'relative', minHeight: '420px', borderRadius: '28px', backgroundImage: s.bg, color: dark ? '#FFFFFF' : '#2B170A', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '12px', cursor: 'pointer', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '12px', left: '16px', right: '16px', display: 'flex', gap: '4px' }}>
          {slides.map((_, k) => <span key={k} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: k <= i ? (dark ? '#FFFFFF' : '#2B170A') : (dark ? 'rgba(255,255,255,.35)' : 'rgba(43,23,10,.25)') }} />)}
        </div>
        <ConfettiOverlay active={i === slides.length - 1} />
        <span key={'i' + i} className="lt-pop-in" style={{ fontSize: '72px', lineHeight: 1 }}>{s.icon}</span>
        <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.85 }}>{s.over}</span>
        <span key={'b' + i} className="lt-pop-in" style={{ fontFamily: TH.serif, fontSize: 'clamp(38px, 9vw, 64px)', lineHeight: 1.05 }}>{s.big}</span>
        <span style={{ fontSize: '19px', lineHeight: 1.45, maxWidth: '420px' }}>{s.text}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} style={{ ...btnSecondary, opacity: i === 0 ? 0.4 : 1 }}>◀ Zurück</button>
        {i < slides.length - 1 ? <button onClick={() => setI(i + 1)} style={btnPrimary}>Weiter ▶</button> : <button onClick={onBack} style={btnPrimary}>Fertig</button>}
      </div>
    </div>
  );
}
