// ═══ Lernpfad und Glücksrad ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState } from 'react';
import { dc } from '../data';
import { TH, cardStyle, btnPrimary, PageHead, PrizeBag, ConfettiOverlay } from './basis';

// ───────────────────────── Lernpfad (Brettspiel) ─────────────────────────
export type PfadFeld = { no: number; cat: string; level: 'easy' | 'mixed' | 'hard'; milestone?: { icon: string; title: string } };

export function buildPfad(cats: string[]): PfadFeld[] {
  const ms: Record<number, { icon: string; title: string }> = { 6: { icon: '🥨', title: 'Teigling geschafft' }, 12: { icon: '🥐', title: 'Brötchen-Profi' }, 18: { icon: '🍞', title: 'Brot-Kenner' }, 24: { icon: '👑', title: 'Brotmeister' } };
  return Array.from({ length: 24 }, (_, i) => ({ no: i + 1, cat: cats[i % cats.length], level: i < 8 ? 'easy' : i < 16 ? 'mixed' : 'hard', milestone: ms[i + 1] }));
}

export const catIcon = (c: string) => /fach/i.test(c) ? '📚' : /sortiment|ware/i.test(c) ? '🥖' : /service|verkauf/i.test(c) ? '🤝' : /hygiene|sicher|recht/i.test(c) ? '🧼' : '❓';

export function LernpfadView({ felder, done, avatar, onPlay, lastResult }: { felder: PfadFeld[]; done: number; avatar: string; onPlay: (i: number) => void; lastResult?: string }) {
  const perRow = 4;
  const rows: PfadFeld[][] = [];
  for (let i = 0; i < felder.length; i += perRow) rows.push(felder.slice(i, i + perRow));
  const finished = done >= felder.length;
  const [roll, setRoll] = useState<number | null>(null);
  const play = (i: number) => {
    if (roll !== null) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { onPlay(i); return; }
    setRoll(1 + Math.floor(Math.random() * 6));
    window.setTimeout(() => { setRoll(null); onPlay(i); }, 950);
  };
  const success = !!lastResult && /^(✓|👑|🏁|⭐|🎓|🥖|🏆|🧁|🥐)|Meilenstein/.test(lastResult);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ConfettiOverlay active={success} />
      {roll !== null && (
        <div aria-live="polite" style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(43,23,10,0.35)', pointerEvents: 'none' }}>
          <div className="lt-dice" style={{ width: '130px', height: '130px', borderRadius: '28px', backgroundColor: TH.white, boxShadow: '0 20px 50px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '76px' }}>{['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][roll - 1]}</div>
        </div>
      )}
      <PageHead title="Lernpfad" subtitle="Feld für Feld zum Brotmeister. Pro Feld 5 Fragen, ab 4 richtigen darfst du weiterziehen." />
      {lastResult && <div className="lt-pop-in" style={{ padding: '14px 18px', borderRadius: '16px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '18px', fontWeight: 700 }}>{lastResult}</div>}
      <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
        <span className="lt-emo-bob" style={{ fontSize: '40px' }} aria-hidden="true">{avatar}</span>
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <div style={{ fontFamily: TH.serif, fontSize: '24px', lineHeight: 1.15 }}>{finished ? 'Ziel erreicht, du bist Brotmeister!' : `Du stehst auf Feld ${done + 1} von ${felder.length}`}</div>
          <div style={{ height: '10px', borderRadius: '999px', backgroundColor: '#F3EBDB', overflow: 'hidden', marginTop: '8px' }}><div className="lt-fill" style={{ width: `${Math.round(done / felder.length * 100)}%`, height: '100%', backgroundColor: '#FFC72C', borderRadius: '999px' }} /></div>
        </div>
        {!finished && <button onClick={() => play(done)} style={{ ...btnPrimary, flex: '1 1 140px' }}>Würfeln</button>}
      </div>
      <div style={{ ...cardStyle, padding: '26px 16px 22px', backgroundImage: `radial-gradient(${dc('#F1E3C8')} 1.5px, transparent 1.5px)`, backgroundSize: '18px 18px' }}>
        {rows.map((row, ri) => {
          const items = ri % 2 ? [...row].reverse() : row;
          return (
            <div key={ri} style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${perRow}, 1fr)`, gap: '10px', position: 'relative' }}>
                {items.map(f => {
                  const i = f.no - 1; const isDone = i < done; const isCur = i === done; const locked = i > done;
                  return (
                    <button key={f.no} onClick={() => isCur && play(i)} disabled={!isCur} className={isCur ? 'lt-tilt lt-pfad-cur' : isDone ? 'lt-pfad-done' : undefined}
                      style={{ animationDelay: isDone ? `${Math.min(i, 20) * 0.04}s` : undefined, position: 'relative', aspectRatio: '1 / 1', borderRadius: f.milestone ? '24px' : '50%', border: `3px solid ${isDone ? TH.green : isCur ? dc('#E8B500') : TH.line}`, backgroundColor: isDone ? TH.tintSage : isCur ? TH.yellow : f.milestone ? TH.tintPeach : TH.white, color: TH.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', cursor: isCur ? 'pointer' : 'default', opacity: locked && !f.milestone ? 0.75 : 1, boxShadow: isCur ? '0 10px 24px -8px rgba(232,181,0,.8)' : 'none' }}>
                      {isCur && <span className="lt-pfad-fig" aria-hidden="true" style={{ position: 'absolute', top: '-18px', fontSize: '30px' }}>{avatar}</span>}
                      <span style={{ fontSize: f.milestone ? '30px' : '24px', lineHeight: 1 }} aria-hidden="true">{isDone ? (f.milestone ? f.milestone.icon : '✓') : f.milestone ? f.milestone.icon : catIcon(f.cat)}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>{f.milestone && isDone ? f.milestone.title : `Feld ${f.no}`}</span>
                    </button>
                  );
                })}
              </div>
              {ri < rows.length - 1 && <div aria-hidden="true" style={{ display: 'flex', justifyContent: ri % 2 ? 'flex-start' : 'flex-end', padding: '2px 10%' }}><span className={(ri + 1) * perRow <= done ? 'lt-march lt-march-done' : 'lt-march'} style={{ display: 'block', width: '5px', height: '24px', borderRadius: '3px' }} /></div>}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '15px', color: TH.muted, textAlign: 'center' }}>📚 Fachwissen · 🥖 Sortiment · 🤝 Service · 🧼 Hygiene. Ab Feld 9 wird es gemischt, ab Feld 17 schwer.</div>
    </div>
  );
}

// ───────────────────────── Glücksrad (einmal pro Woche) ─────────────────────────
export const WHEEL: { label: string; icon: string; color: string; k: string }[] = [
  { label: '50:50-Joker', icon: '🃏', color: '#FFC72C', k: 'joker' }, { label: '+1 € Trinkgeld', icon: '💰', color: '#FFF6E0', k: 'coin' },
  { label: '+50 Punkte', icon: '⭐', color: '#FFC72C', k: 'star' }, { label: 'Tausch-Joker', icon: '🔄', color: '#FFF6E0', k: 'swap' },
  { label: '+2 € Trinkgeld', icon: '💰', color: '#FFC72C', k: 'coins' }, { label: '+100 Punkte', icon: '⭐', color: '#FFF6E0', k: 'stars' },
  { label: 'Zeit-Joker', icon: '⏱️', color: '#FFC72C', k: 'clock' }, { label: '+30 Punkte', icon: '🍀', color: '#FFF6E0', k: 'clover' },
];

/** Gewinne als kleine 3D-Symbole (Verläufe und Glanz), Mitte bei 0,0, etwa 30 breit */
export function WheelIcon({ k }: { k: string }) {
  const star = (x: number, y: number, r: number) => { const pts = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`; }).join(' '); return <g><polygon points={pts} fill="url(#wiGold)" stroke="#A87A0E" strokeWidth="1" strokeLinejoin="round" /><ellipse cx={x - r * 0.25} cy={y - r * 0.3} rx={r * 0.3} ry={r * 0.16} fill="rgba(255,255,255,.75)" /></g>; };
  const coin = (x: number, y: number, r: number) => <g><ellipse cx={x} cy={y + 2} rx={r} ry={r * 0.95} fill="#A87A0E" /><circle cx={x} cy={y} r={r} fill="url(#wiGold)" stroke="#A87A0E" strokeWidth="1" /><circle cx={x} cy={y} r={r * 0.7} fill="none" stroke="rgba(168,122,14,.6)" strokeWidth="1.2" /><text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={r * 1.05} fontWeight="800" fill="#8A6200" fontFamily="Arial, sans-serif">€</text><ellipse cx={x - r * 0.35} cy={y - r * 0.45} rx={r * 0.35} ry={r * 0.18} fill="rgba(255,255,255,.7)" /></g>;
  if (k === 'joker') return <g><rect x="-10" y="-13" width="20" height="26" rx="4" fill="url(#wiCard)" stroke="#8A6A3A" strokeWidth="1" transform="rotate(-10)" /><rect x="-7" y="-14" width="20" height="26" rx="4" fill="url(#wiCard)" stroke="#8A6A3A" strokeWidth="1" transform="rotate(8)" /><text x="4" y="0" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="800" fill="#D92D20" fontFamily="Arial, sans-serif" transform="rotate(8)">50</text></g>;
  if (k === 'coin') return coin(0, 0, 11);
  if (k === 'coins') return <g>{coin(-5, 4, 9)}{coin(5, -3, 10)}</g>;
  if (k === 'star') return star(0, 0, 13);
  if (k === 'stars') return <g>{star(-6, 4, 9)}{star(6, -4, 11)}</g>;
  if (k === 'swap') return <g><circle r="13" fill="url(#wiBlue)" /><path d="M-6 -2a7 7 0 0 1 12-3M6 2a7 7 0 0 1-12 3" stroke="#FFFFFF" strokeWidth="2.6" fill="none" strokeLinecap="round" /><path d="M7-9l0 5-5 0M-7 9l0-5 5 0" stroke="#FFFFFF" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx="-4" cy="-8" rx="5" ry="2.4" fill="rgba(255,255,255,.45)" /></g>;
  if (k === 'clock') return <g><rect x="-3" y="-16" width="6" height="4" rx="1.5" fill="#6B7685" /><circle r="12" fill="url(#wiSilver)" stroke="#6B7685" strokeWidth="1.2" /><circle r="9" fill="#FFFFFF" /><path d="M0 0V-6M0 0l4 3" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" /><ellipse cx="-4" cy="-6" rx="4" ry="2" fill="rgba(255,255,255,.8)" /></g>;
  if (k === 'clover') return <g><path d="M0 4q1 7 5 10" stroke="#2F7A3E" strokeWidth="2.2" fill="none" strokeLinecap="round" />{[[0, -6], [6, 0], [0, 6], [-6, 0]].map(([x, y], i) => <circle key={i} cx={x} cy={y - 2} r="6" fill="url(#wiGreen)" />)}<ellipse cx="-2" cy="-10" rx="3" ry="1.6" fill="rgba(255,255,255,.6)" /></g>;
  return null;
}

export function GluecksradCard({ canSpin, onSpin, extraSpins = 0, plain = false }: { canSpin: boolean; onSpin: (extra: boolean) => number; extraSpins?: number; plain?: boolean }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<number | null>(null);
  const n = WHEEL.length, seg = 360 / n, R = 100;
  const ready = canSpin || extraSpins > 0;
  const spin = () => {
    if (!ready || spinning) return;
    const idx = onSpin(!canSpin);
    if (idx < 0) return;
    const base = angle - (angle % 360);
    const target = base + 360 * 6 + (360 - (idx * seg + seg / 2));
    setSpinning(true); setWon(null); setAngle(target);
    window.setTimeout(() => { setSpinning(false); setWon(idx); }, 4300);
  };
  const path = (i: number) => { const a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180; return `M0 0 L${R * Math.cos(a0)} ${R * Math.sin(a0)} A${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`; };
  return (
    <section style={plain ? { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' } : { ...cardStyle, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
      <ConfettiOverlay active={won !== null} />
      <div className={ready && !spinning && won === null ? 'lt-wheel-idle' : ''} style={{ position: 'relative', width: '240px', height: '254px', flex: '0 0 240px', margin: '0 auto' }}>
        <svg className={spinning ? 'lt-wheel-tick' : ''} aria-hidden="true" width="34" height="40" viewBox="0 0 34 40" style={{ position: 'absolute', top: 0, left: '50%', marginLeft: '-17px', zIndex: 2, transformOrigin: '50% 20%', animation: spinning ? undefined : 'none', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.35))' }}>
          <defs><linearGradient id="wiPtr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF0A8" /><stop offset=".5" stopColor="#FFC72C" /><stop offset="1" stopColor="#A87A0E" /></linearGradient></defs>
          <path d="M17 38 L4 10 a13 13 0 1 1 26 0 Z" fill="url(#wiPtr)" stroke="#1F140C" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="17" cy="12" r="4.5" fill="#1F140C" /><ellipse cx="12" cy="7" rx="4" ry="2" fill="rgba(255,255,255,.7)" />
        </svg>
        <svg className={spinning ? 'lt-wheel-spin' : undefined} viewBox="-110 -110 220 220" width="240" height="240" style={{ position: 'absolute', top: '14px', left: 0, transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 4.2s cubic-bezier(.15,.85,.2,1)' : 'none', filter: 'drop-shadow(0 12px 18px rgba(31,20,12,.35))' }} aria-hidden="true">
          <defs>
            <radialGradient id="wiGold" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFF6C8" /><stop offset=".55" stopColor="#FFC72C" /><stop offset="1" stopColor="#C98A00" /></radialGradient>
            <linearGradient id="wiCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#F1E3C8" /></linearGradient>
            <radialGradient id="wiBlue" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#9FD3FF" /><stop offset="1" stopColor="#2F6FD6" /></radialGradient>
            <radialGradient id="wiSilver" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#AEB8C4" /></radialGradient>
            <radialGradient id="wiGreen" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#A8E39A" /><stop offset="1" stopColor="#2F7A3E" /></radialGradient>
            <radialGradient id="wiShine" cx="40%" cy="30%" r="70%"><stop offset="0" stopColor="rgba(255,255,255,.35)" /><stop offset=".6" stopColor="rgba(255,255,255,0)" /><stop offset="1" stopColor="rgba(0,0,0,.12)" /></radialGradient>
            <radialGradient id="wiHub" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#5A3A22" /><stop offset="1" stopColor="#1F140C" /></radialGradient>
          </defs>
          <circle r="109" fill="#1F140C" />
          <circle r="104" fill="#3A2412" />
          {WHEEL.map((w, i) => {
            const mid = ((i + 0.5) * seg - 90) * Math.PI / 180;
            const x = 64 * Math.cos(mid), y = 64 * Math.sin(mid);
            return (
              <g key={i}>
                <path d={path(i)} fill={w.color} stroke="#1F140C" strokeWidth="1.5" />
                <g transform={`translate(${x} ${y}) rotate(${(i + 0.5) * seg}) scale(1.3)`}><WheelIcon k={w.k} /></g>
              </g>
            );
          })}
          <circle r="100" fill="url(#wiShine)" />
          {Array.from({ length: 16 }, (_, i) => { const a = (i * 22.5 - 90) * Math.PI / 180; return <circle key={'l' + i} className={i % 2 ? 'lt-bulb lt-bulb-b' : 'lt-bulb'} cx={104.5 * Math.cos(a)} cy={104.5 * Math.sin(a)} r="3.2" fill="#FFE27A" />; })}
          <circle r="19" fill="url(#wiGold)" stroke="#1F140C" strokeWidth="3" />
          <circle r="11" fill="url(#wiHub)" />
          <ellipse cx="-6" cy="-9" rx="6" ry="3" fill="rgba(255,255,255,.55)" />
        </svg>
      </div>
      <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.12em', color: '#9A7206' }}>EINMAL PRO WOCHE</div>
        <div style={{ fontFamily: TH.serif, fontSize: '32px', lineHeight: 1.05 }}>Glücksrad</div>
        <div style={{ fontSize: '17px', color: TH.brown }}>Einmal pro Woche drehen und gewinnen: Joker, Trinkgeld oder Extra-Punkte.{extraSpins > 0 ? ` Du hast ${extraSpins} Extra-${extraSpins === 1 ? 'Dreh' : 'Drehs'}.` : ''}</div>
        {won !== null && <div key={'pb' + angle}><PrizeBag icon={WHEEL[won].icon} /></div>}
        {won !== null && <div className="lt-pb-text" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '16px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', fontSize: '19px', fontWeight: 800 }}><svg width="40" height="40" viewBox="-20 -20 40 40" aria-hidden="true" style={{ flex: '0 0 auto' }}><defs><radialGradient id="wiGold" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFF6C8" /><stop offset=".55" stopColor="#FFC72C" /><stop offset="1" stopColor="#C98A00" /></radialGradient><linearGradient id="wiCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#F1E3C8" /></linearGradient><radialGradient id="wiBlue" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#9FD3FF" /><stop offset="1" stopColor="#2F6FD6" /></radialGradient><radialGradient id="wiSilver" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#AEB8C4" /></radialGradient><radialGradient id="wiGreen" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#A8E39A" /><stop offset="1" stopColor="#2F7A3E" /></radialGradient></defs><WheelIcon k={WHEEL[won].k} /></svg><span>Gewonnen: {WHEEL[won].label}!</span></div>}
        <button onClick={spin} disabled={!ready || spinning} style={{ ...btnPrimary, opacity: !ready || spinning ? 0.55 : 1 }}>{spinning ? 'Dreht …' : canSpin ? 'Rad drehen' : extraSpins > 0 ? 'Extra-Dreh nutzen' : 'Nächste Drehung ab Montag'}</button>
      </div>
    </section>
  );
}
