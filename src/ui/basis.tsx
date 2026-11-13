// ═══ Grundbausteine: Farben (TH), Knöpfe, Karten, Kopfzeilen, Bon, Konfetti, Produktfotos, Sterne ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState, useRef, CSSProperties, ReactNode } from 'react';
import { dc } from '../daten/data';

// ───────────────────────── Lern-Theke: gemeinsames Design ─────────────────────────

export const TH = {
  yellow: dc('#FFC72C'),
  brown: dc('#4B2A14'),
  ink: dc('#2B170A'),
  muted: dc('#6B4A30'),
  cream: dc('#FFFBF2'),
  line: dc('#F1E3C8'),
  white: dc('#FFFFFF'),
  tintYellow: dc('#FFF3CF'),
  tintPeach: dc('#FCE6DD'),
  tintSage: dc('#E6F2E3'),
  tintBlue: dc('#F6EFE2'),
  green: dc('#2F5D3A'),
  red: dc('#9A3412'),
  serif: "'Fredoka', Georgia, serif",
};

/** Weiße Karte mit hellem Rand */
export const cardStyle: CSSProperties = {
  backgroundColor: TH.white,
  border: `1px solid ${TH.line}`,
  boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)',
  borderRadius: '24px',
  padding: '24px',
  boxSizing: 'border-box',
};

/** Großer brauner Hauptknopf */
export const btnPrimary: CSSProperties = {
  minHeight: '58px',
  padding: '0 26px',
  borderRadius: '16px',
  border: 'none',
  backgroundColor: TH.yellow,
  color: '#2B170A',
  boxShadow: '0 5px 0 #B98A0A, 0 14px 24px -14px rgba(43,23,10,.45)',
  fontSize: '19px',
  fontWeight: 800,
  cursor: 'pointer',
};

/** Heller Nebenknopf */
export const btnSecondary: CSSProperties = {
  minHeight: '54px',
  padding: '0 20px',
  borderRadius: '16px',
  border: `2px solid ${TH.line}`,
  backgroundColor: TH.white,
  color: TH.ink,
  fontSize: '18px',
  fontWeight: 700,
  cursor: 'pointer',
};

/** Überschrift einer Seite, optional mit „Zurück“ */
export function PageHead({ title, subtitle, onBack, backLabel = 'Zurück' }: { title: string; subtitle?: string; onBack?: () => void; backLabel?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
      {onBack && (
        <button onClick={onBack} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 16px 0 10px', borderRadius: '999px', border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)', color: TH.brown, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>{backLabel}
        </button>
      )}
      <h1 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '42px', lineHeight: 1.05, color: TH.ink }}>{title}</h1>
      {subtitle && <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.5, color: TH.brown }}>{subtitle}</p>}
    </div>
  );
}

/** Kleine Anzeige im Spiel: z. B. „Richtig 3“, „Zeit 0:42“ */
export function StatChip({ label, value, tone = 'plain' }: { label: string; value: ReactNode; tone?: 'plain' | 'warn' | 'yellow' }) {
  const bg = tone === 'warn' ? '#FCE6DD' : tone === 'yellow' ? '#FFF3CF' : '#FFFFFF';
  const color = tone === 'warn' ? '#B42318' : TH.ink;
  return (
    <div className="lt-statchip" style={{ flex: '1 1 0', minWidth: '96px', padding: '10px 14px', borderRadius: '18px', backgroundColor: bg, border: 'none', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)', textAlign: 'center' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: TH.muted }}>{label}</div>
      <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1, color }}>{value}</div>
    </div>
  );
}

/** Start-Bildschirm eines Spiels */
export function GameIntro({ title, text, hint, startLabel, onStart }: { title: string; text: string; hint?: string; startLabel: string; onStart: () => void }) {
  return (
    <div className="lt-pop-in" style={{ ...cardStyle, position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', textAlign: 'left', padding: '26px 24px 24px' }}>
      {KUEKEN_IMG && <img src={KUEKEN_IMG} alt="" aria-hidden="true" className="lt-loaded lt-intro-kueken" style={{ position: 'absolute', right: '16px', top: '14px', width: '58px', height: 'auto', background: 'none' }} />}
      <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.12em', color: '#9A7206', paddingRight: '70px' }}>SO GEHT'S</div>
      <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1, marginTop: '-8px', paddingRight: '70px' }}>{title}</div>
      <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.5, color: TH.brown }}>{text}</p>
      {hint && <div className="lt-qnote" style={{ alignSelf: 'stretch', marginTop: '6px', fontSize: '17px', fontWeight: 700 }}>{hint}</div>}
      <button onClick={onStart} style={btnPrimary}>{startLabel}</button>
    </div>
  );
}

/** Ergebnis-Bildschirm eines Spiels */
export function GameResult({ title, big, text, reward, againLabel, onAgain, celebrate, stars }: { title: string; big: string; text: string; reward?: string | null; againLabel: string; onAgain: () => void; stars?: number; celebrate?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div className="lt-receipt" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center', padding: '26px 24px 44px', position: 'relative', overflow: 'hidden' }}>
      <PretzelRain active={!!celebrate} />
      <ReceiptHead />
      <div style={{ fontSize: '16px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>{title}</div>
      {typeof stars === 'number' && <StarRating n={stars} />}
      <div className="lt-count" style={{ fontFamily: TH.serif, fontSize: '64px', lineHeight: 1 }}>{big}</div>
      <p style={{ margin: 0, fontSize: '19px', lineHeight: 1.5, color: TH.brown }}>{text}</p>
      {reward && <div style={{ padding: '12px 18px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '18px', fontWeight: 700 }}>{reward}</div>}
      <ReceiptFoot />
    </div>
    <button onClick={onAgain} style={{ ...btnPrimary, alignSelf: 'center', minWidth: '240px' }}>{againLabel}</button>
    </div>
  );
}

/** Hinkel-Logo für die Brötchentüte (wird von App gesetzt) */
export let BAG_LOGO = '';

export function registerBagLogo(src: string) { BAG_LOGO = src; }

export let KUEKEN_IMG = '';

export function registerKueken(src: string) { KUEKEN_IMG = src; }

/** Kleine gelbe Hinkel-Brötchentüte, aus der ein Gewinn herausspringt */
export function PrizeBag({ icon, delay = 0 }: { icon: string; delay?: number }) {
  const zz = Array.from({ length: 24 }, (_, i) => `${8 + i * 8} ${i % 2 ? 36 : 30}`).join(' L');
  return (
    <div className="lt-pb" aria-hidden="true" style={{ ['--pbd' as any]: `${delay}s` }}>
      <div className="lt-pb-rays" />
      <span className="lt-pb-prize">{icon}</span>
      {[[-40, -40], [40, -36], [-24, -62], [26, -60], [0, -72]].map(([x, y], i) => <span key={i} className="lt-pb-sp" style={{ ['--x' as any]: x + 'px', ['--y' as any]: y + 'px', animationDelay: `calc(var(--pbd) + ${2.1 + i * 0.05}s)` }}>{i % 2 ? '⭐' : '✨'}</span>)}
      <div className="lt-pb-shadow" />
      <div className="lt-pb-bag">
        <svg viewBox="0 0 200 330" width="64" height="106" style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id="pbFront" x1="0" x2="1"><stop offset="0" stopColor="#E9AE00" /><stop offset=".12" stopColor="#FFC80A" /><stop offset=".45" stopColor="#FFD83A" /><stop offset=".7" stopColor="#FFCD12" /><stop offset="1" stopColor="#DDA200" /></linearGradient>
            <linearGradient id="pbShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".16" /><stop offset=".12" stopColor="#000" stopOpacity="0" /><stop offset=".85" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".18" /></linearGradient>
          </defs>
          <path className="lt-pb-back" d="M14 30 L188 30 L190 60 L12 60 Z" fill="#C98F00" />
          <path d={`M${zz} C194 120 196 220 194 318 Q100 328 6 318 C4 220 6 120 8 36 Z`} fill="url(#pbFront)" stroke="#B88400" strokeOpacity=".5" />
          <path d={`M${zz} C194 120 196 220 194 318 Q100 328 6 318 C4 220 6 120 8 36 Z`} fill="url(#pbShade)" />
          <path d="M8 292 L192 292" stroke="#000" strokeOpacity=".12" strokeWidth="2" strokeDasharray="5 4" />
          <rect x="60" y="34" width="40" height="290" fill="#fff" opacity=".1" />
          {BAG_LOGO && <image href={BAG_LOGO} x="44" y="96" width="112" height="119" />}
        </svg>
      </div>
    </div>
  );
}

/** Kopf eines Hinkel-Kassenbons */
export function ReceiptHead() {
  const now = new Date();
  return (
    <div className="lt-rc-mono" aria-hidden="true" style={{ width: '100%', textAlign: 'center', color: TH.brown }}>
      <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '3px' }}>BÄCKEREI HINKEL</div>
      <div style={{ fontSize: '13px' }}>Die Bäckerei der Brotfreunde</div>
      <div style={{ fontSize: '13px', marginTop: '4px' }}>{now.toLocaleDateString('de-DE')}  {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
      <div className="lt-rc-line" />
    </div>
  );
}

/** Fuß eines Hinkel-Kassenbons */
export function ReceiptFoot() {
  const nr = useRef(String(1000 + Math.floor(Math.random() * 9000))).current;
  return (
    <div className="lt-rc-mono" aria-hidden="true" style={{ width: '100%', textAlign: 'center', color: TH.brown, fontSize: '13px' }}>
      <div className="lt-rc-line" />
      <div style={{ fontSize: '15px', fontWeight: 700 }}>Vielen Dank für deinen Einsatz!</div>
      <div className="lt-rc-barcode" />
      <div>Bon-Nr. {nr}</div>
    </div>
  );
}

/** Brezel-Regen bei neuem Rekord */
export function PretzelRain({ active }: { active: boolean }) {
  const drops = useRef([...Array(22)].map((_, i) => ({ l: Math.random() * 96, d: 1.6 + Math.random() * 1.4, w: Math.random() * 0.9, s: 22 + Math.random() * 16, r: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360), e: ['🥨', '🥨', '🥨', '🥐', '🍞'][i % 5] }))).current;
  if (!active) return null;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {drops.map((x, i) => <span key={i} className="lt-pretzel" style={{ left: x.l + '%', fontSize: x.s + 'px', animationDuration: x.d + 's', animationDelay: x.w + 's', ['--pr' as any]: x.r + 'deg' }}>{x.e}</span>)}
    </div>
  );
}

// Typ für das Feedback
export type FeedbackType = 'correct' | 'wrong' | 'idle';

// Ein einfacher Hook für das Feedback-Timeout
export const useFeedbackState = (duration = 350) => {
  const [feedback, setFeedback] = useState<FeedbackType>('idle');
  const timeoutRef = useRef<any>(null);

  const triggerFeedback = (type: FeedbackType) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFeedback(type);
    timeoutRef.current = setTimeout(() => setFeedback('idle'), duration);
  };

  return { feedback, triggerFeedback };
};

// Eine kleine Konfetti-Komponente für das Runden-Ende
export const ConfettiOverlay = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 100, overflow: 'hidden'
    }}>
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: Math.random() * 100 + '%',
          top: -10 - Math.random() * 20 + 'px',
          width: '10px', height: '10px',
          backgroundColor: [TH.yellow, TH.brown, dc('#E8A317'), TH.green][i % 4],
          borderRadius: i % 2 === 0 ? '50%' : '0px',
          animation: `fall ${1 + Math.random() * 1.5}s linear forwards`,
          animationDelay: Math.random() * 0.5 + 's'
        }} />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(400px) rotate(${Math.random() * 360}deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ───────────────────────── Produktfotos ─────────────────────────

/** Schlüssel für ein Produktfoto (gleich in App, Spickzettel und Spielen) */
export const productImageKey = (name: string) =>
  name.toLowerCase().replace(/\u00DF/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

export type ProductImages = Record<string, string>;

/** 1 bis 3 Sterne, die nacheinander aufploppen (Ergebnis-Seiten) */
export function StarRating({ n }: { n: number }) {
  return (
    <div aria-label={`${n} von 3 Sternen`} style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
      {[0, 1, 2].map(i => (
        <span key={i} className={i < n ? 'lt-star-pop' : undefined} style={{ fontSize: i === 1 ? '54px' : '42px', lineHeight: 1, filter: i < n ? 'drop-shadow(0 3px 0 rgba(122,74,0,.35))' : 'grayscale(1)', opacity: i < n ? 1 : 0.25, animationDelay: `${0.15 + i * 0.22}s` }}>⭐</span>
      ))}
    </div>
  );
}

export const starsFor = (ratio: number) => ratio >= 1 ? 3 : ratio >= 0.75 ? 2 : ratio >= 0.4 ? 1 : 0;
