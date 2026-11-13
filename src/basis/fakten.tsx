// ═══ „Wusstest du?“-Küken und Wetter-Symbole ═══
// Vorher in appBasis.tsx. Inhalt unverändert übernommen.
import { useState, useEffect } from 'react';
import { HINKEL_KUEKEN } from './marke';
import { LtIcon, ICON } from './symbole';

/** Wusstest du? Kleine Fakten rund um Bäckerei und Theke */
export const DAILY_FACTS = [
  'Brezeln bekommen ihre braune Farbe und den typischen Geschmack durch ein kurzes Bad in Natronlauge vor dem Backen.',
  'Roggenteig braucht Sauerteig, sonst bleibt das Brot klebrig und lässt sich kaum schneiden.',
  'Unser süßes Gebäck wird aprikotiert und dann mit Fondant überzogen, die Aprikosenschicht hält den Fondant schön fest.',
  'Dinkel ist eine alte Weizenart, er enthält also auch Gluten.',
  'Ein Croissant hat durch das Tourieren viele hauchdünne Butterschichten.',
  'Vollkornbrot muss zu mindestens 90 Prozent aus Vollkornmehl oder Schrot bestehen.',
  'Brot bleibt am längsten frisch in einem Brotkasten, nicht im Kühlschrank. Dort wird es schneller altbacken.',
  'Bei Allergien zählt jedes Wort: lieber einmal mehr in der Allergenliste nachschauen als raten.',
  'Ein freundliches Lächeln an der Theke ist oft der Grund, warum Kunden wiederkommen.',
  'Kann Spuren enthalten bedeutet: die Zutat ist nicht im Rezept, kann aber durch Mehlstaub oder Maschinen hineingeraten.',
  'Der Duft von frischem Brot entsteht vor allem in der Kruste, beim Backen bräunen Zucker und Eiweiß.',
  'Stollen schmeckt nach ein paar Tagen Ruhe noch besser, weil sich die Aromen verbinden.',
  'Sauerteig ist ein lebendiger Teig aus Mehl, Wasser und natürlichen Milchsäurebakterien und Hefen.',
  'Schnittbrot sollte man an der Theke frisch schneiden, so trocknet es nicht aus.',
  'Brötchen werden mit Dampf gebacken, so wird die Kruste schön dünn und knusprig.',
  'Hefe arbeitet am liebsten bei etwa 30 Grad, zu heiß und sie stirbt ab.',
  'Laugengebäck darf nicht auf Alu-Blechen liegen, die Lauge greift das Metall an.',
  'Viele Kunden fragen nach dem Brot des Tages: wer die Tagesprodukte kennt, berät einfach besser.',
  'Gutes Rausgeben heißt: Betrag nennen, Geld sichtbar hinlegen, Wechselgeld vorzählen.',
  'Weizenmehl Type 550 ist heller als Type 1050, die Zahl zeigt den Mineralstoffgehalt.',
];

/** Das Küken erzählt bei jedem Öffnen der App einen anderen Fakt */
export let FACT_SESSION_I: number | null = null;

export function KuekenFact() {
  const [i, setI] = useState<number>(() => {
    if (FACT_SESSION_I === null) {
      let n = Math.floor(Math.random() * DAILY_FACTS.length);
      try { const p = parseInt(localStorage.getItem('lt_fact_i') || '', 10); if (!isNaN(p)) n = (p + 1) % DAILY_FACTS.length; localStorage.setItem('lt_fact_i', String(n)); } catch { /* egal */ }
      FACT_SESSION_I = n;
    }
    return FACT_SESSION_I;
  });
  const text = DAILY_FACTS[i];
  const [shown, setShown] = useState('');
  const [talk, setTalk] = useState(false);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(text); return; }
    let k = 0; let t: any; setShown(''); setTalk(true);
    const start = setTimeout(function step() { k++; setShown(text.slice(0, k)); if (k < text.length) t = setTimeout(step, 26); else setTalk(false); }, 500);
    return () => { clearTimeout(start); clearTimeout(t); };
  }, [text]);
  const next = () => { const n = (i + 1) % DAILY_FACTS.length; FACT_SESSION_I = n; try { localStorage.setItem('lt_fact_i', String(n)); } catch { /* egal */ } setI(n); };
  return (
    <section className="lt-fact" aria-label="Wusstest du?">
      <img src={HINKEL_KUEKEN} alt="Küken: tippen für noch einen Fakt" onClick={next} className={`lt-loaded lt-fact-kueken${talk ? ' lt-talk' : ''}`} />
      <div className="lt-fact-bubble">
        <div className="lt-fact-from"><LtIcon paths={ICON.bulb} size={15} width={2.2} />Wusstest du?</div>
        <div className="lt-fact-text" aria-live="polite">{shown}<span style={{ visibility: 'hidden' }}>{text.slice(shown.length)}</span></div>
        <button className="lt-fact-more" onClick={next}>Noch einer</button>
      </div>
    </section>
  );
}

/** Wettersymbole im 3D-Look (Verläufe, Glanz, weicher Schatten) */
export type WxKind = 'sun' | 'moon' | 'dusk' | 'partly' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';

export const wxKindOf = (code: number, hour: number): WxKind => {
  const day = hour >= 7 && hour < 17.5, dusk = hour >= 17.5 && hour < 20.5;
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return 'cloud';
  if (code === 1 || code === 2) return day ? 'partly' : 'cloud';
  return day ? 'sun' : dusk ? 'dusk' : 'moon';
};

export function WxIcon({ kind, size = 32 }: { kind: WxKind; size?: number }) {
  const cloud = (dark: boolean, dx = 0, dy = 0, sc = 1) => (
    <g transform={`translate(${dx} ${dy}) scale(${sc})`}>
      <ellipse cx="33" cy="54" rx="22" ry="3.5" fill="rgba(20,30,50,.18)" />
      <path d="M16 50h34a10 10 0 0 0 1-20 14 14 0 0 0-27-3 11 11 0 0 0-8 23z" fill={dark ? 'url(#wxCloudD)' : 'url(#wxCloud)'} />
      <path d="M20 33a8 8 0 0 1 7-5" stroke="rgba(255,255,255,.9)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </g>
  );
  const sun = (cx: number, cy: number, r: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r + 7} fill="url(#wxGlow)" />
      {Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return <path key={i} d={`M${cx + Math.cos(a) * (r + 3)} ${cy + Math.sin(a) * (r + 3)}L${cx + Math.cos(a) * (r + 7.5)} ${cy + Math.sin(a) * (r + 7.5)}`} stroke="#FFB300" strokeWidth="3" strokeLinecap="round" />; })}
      <circle cx={cx} cy={cy} r={r} fill="url(#wxSun)" />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.38} ry={r * 0.24} fill="rgba(255,255,255,.65)" transform={`rotate(-30 ${cx - r * 0.35} ${cy - r * 0.4})`} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id="wxSun" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#FFF6B0" /><stop offset=".55" stopColor="#FFC93C" /><stop offset="1" stopColor="#F28C00" /></radialGradient>
        <radialGradient id="wxGlow"><stop offset=".5" stopColor="rgba(255,214,90,.55)" /><stop offset="1" stopColor="rgba(255,214,90,0)" /></radialGradient>
        <linearGradient id="wxCloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".7" stopColor="#E9EEF6" /><stop offset="1" stopColor="#C9D3E2" /></linearGradient>
        <linearGradient id="wxCloudD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9C2D0" /><stop offset="1" stopColor="#6E7A8E" /></linearGradient>
        <radialGradient id="wxMoon" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#FFFBE6" /><stop offset=".6" stopColor="#F3E3A6" /><stop offset="1" stopColor="#C9B26A" /></radialGradient>
        <linearGradient id="wxDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9FD3FF" /><stop offset="1" stopColor="#2F80ED" /></linearGradient>
        <linearGradient id="wxBolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF07A" /><stop offset="1" stopColor="#FFB300" /></linearGradient>
      </defs>
      {kind === 'sun' && sun(32, 32, 14)}
      {kind === 'dusk' && <g>{sun(32, 38, 13)}<rect x="6" y="40" width="52" height="20" fill="url(#wxCloud)" opacity="0" /><path d="M8 44h48" stroke="#E86A3A" strokeWidth="3" strokeLinecap="round" opacity=".7" /><path d="M14 50h36" stroke="#E86A3A" strokeWidth="3" strokeLinecap="round" opacity=".45" /></g>}
      {kind === 'moon' && <g><circle cx="32" cy="32" r="20" fill="rgba(255,240,180,.18)" /><path d="M42 44A16 16 0 0 1 26 14a16 16 0 1 0 16 30z" fill="url(#wxMoon)" /><circle cx="28" cy="38" r="2.4" fill="rgba(160,130,60,.35)" /><circle cx="22" cy="28" r="1.6" fill="rgba(160,130,60,.3)" /><path d="M48 16l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="#FFF3B0" /></g>}
      {kind === 'partly' && <g>{sun(40, 22, 11)}{cloud(false, -4, 6, 0.95)}</g>}
      {kind === 'cloud' && <g>{cloud(false, 8, -6, 0.7)}{cloud(false, -2, 4, 1)}</g>}
      {kind === 'fog' && <g>{cloud(false, 0, -4, 1)}<path d="M10 52h40M16 58h34" stroke="#C9D3E2" strokeWidth="3.5" strokeLinecap="round" /></g>}
      {kind === 'rain' && <g>{cloud(true, 0, -6, 1)}{[18, 30, 42].map((x, i) => <path key={x} d={`M${x} ${50 + (i % 2) * 3}c-2 4-3 6 0 8 3-2 2-4 0-8z`} fill="url(#wxDrop)" />)}</g>}
      {kind === 'snow' && <g>{cloud(false, 0, -6, 1)}{[18, 31, 44].map((x, i) => <g key={x} stroke="#9FC4FF" strokeWidth="2" strokeLinecap="round" transform={`translate(${x} ${54 + (i % 2) * 3})`}><path d="M0-4v8M-3.5-2l7 4M-3.5 2l7-4" /></g>)}</g>}
      {kind === 'storm' && <g>{cloud(true, 0, -6, 1)}<path d="M33 44l-7 11h6l-3 9 10-13h-6l3-7z" fill="url(#wxBolt)" stroke="#C77700" strokeWidth="1" strokeLinejoin="round" /></g>}
    </svg>
  );
}
