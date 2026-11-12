// src/components/minigameUtils.tsx
import { useState, useRef, useEffect, CSSProperties, ReactNode } from 'react';
import { dc, SORTIMENT_SUBFILTERS } from '../data';

/** Versionsnummer dieser Datei – wird unten in der App geprüft */
export const UTILS_VERSION: number = 88;

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
let BAG_LOGO = '';
export function registerBagLogo(src: string) { BAG_LOGO = src; }
let KUEKEN_IMG = '';
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

// ───────────────────────── Lernstand: Einarbeitung & Abzeichen ─────────────────────────

/** Zusätzliche Zähler pro Mitarbeiter (in der Cloud unter progress[user]._stats) */
export type LearnStats = { bilderBest?: number; bilderRight?: number; allergenBest?: number; fehlerDone?: number; examBest?: number; priceBest?: number; sliceBest?: number; ansturmBest?: number };

/** Alle IDs, die jemand schon einmal richtig beantwortet hat */
export function correctIdSet(prog: any): Set<number> {
  const s = new Set<number>();
  Object.keys(prog || {}).forEach(k => {
    if (/_(easy|hard)$/.test(k) && Array.isArray(prog[k])) prog[k].forEach((id: any) => { const n = Number(id); if (!isNaN(n)) s.add(n); });
  });
  return s;
}

/** Längste Lern-Serie (Tage am Stück) aus den gespeicherten Lerntagen */
export function bestStreakOf(days: string[]): number {
  const sorted = Array.from(new Set((days || []).filter(Boolean))).sort();
  let best = 0, run = 0, prev: number | null = null;
  sorted.forEach(d => {
    const t = new Date(d + 'T12:00:00').getTime();
    const gap = prev !== null ? Math.round((t - prev) / 86400000) : 0;
    const sundayBetween = gap === 2 && prev !== null && new Date(prev + 86400000).getDay() === 0;
    run = prev !== null && (gap === 1 || sundayBetween) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  });
  return best;
}

export function thekeTotals(prog: any): { ok: number; bad: number } {
  const st = (prog && prog._theke) || {};
  return Object.keys(st).reduce((a, k) => ({ ok: a.ok + (Number(st[k]?.ok) || 0), bad: a.bad + (Number(st[k]?.bad) || 0) }), { ok: 0, bad: 0 });
}

export type OnboardingItem = { id: string; title: string; desc: string; manual?: boolean; go?: 'fach' | 'bilder' | 'theke' | 'allergene' | 'lernen' | 'steckbriefe' | 'bestenliste' | 'daily' | 'spielen' };

export const ONBOARDING_ITEMS: OnboardingItem[] = [
  { id: 'gesund', title: 'Gesundheitszeugnis abgegeben', desc: 'Bei der Filialleitung vorgelegt, Kosten nur mit Quittung erstattet.', manual: true },
  { id: 'hygiene', title: 'Hygienebelehrung gemacht', desc: 'Erstbelehrung (auch online möglich) und Unterweisung im Betrieb.', manual: true },
  { id: 'regeln', title: 'Regeln für Mitarbeiter gelesen', desc: 'Krankmeldung, Urlaub, Kleidung, Haare & Nägel, steht im Spickzettel Fachwissen.', manual: true, go: 'fach' },
  { id: 'schnitt', title: 'Schnittgrößen sitzen', desc: 'Alle drei Fragen zu den Schnittgrößen (5,5 / 9 / 12 mm) richtig beantwortet.', go: 'lernen' },
  { id: 'geschmack', title: 'Geschmackstabelle kennen', desc: 'Mindestens 5 Fragen zu den Geschmacksvokabeln richtig beantwortet.', go: 'lernen' },
  { id: 'bilder', title: '20 Produkte am Foto erkannt', desc: 'Im Spiel „Welches Brot ist das?“ insgesamt 20 richtige Antworten.', go: 'bilder' },
  { id: 'theke', title: 'Erste Verkaufsgespräche geführt', desc: 'Mindestens 5 Antworten im Theken-Simulator gegeben.', go: 'theke' },
  { id: 'allergene', title: 'Allergene geübt', desc: 'Im Allergene-Training einmal mindestens 7 von 10 geschafft.', go: 'allergene' },
  { id: 'fragen', title: '50 Fragen gemeistert', desc: 'Egal in welchem Bereich, 50 verschiedene Fragen richtig.', go: 'lernen' },
  { id: 'serie', title: '3 Tage am Stück gelernt', desc: 'Drei Tage hintereinander mindestens eine Runde.' },
];

/** „Meine erste Woche“ in 5 Tagen, jeder Tag mit einem Thema */
export const ONBOARDING_DAYS: { no: number; icon: string; title: string; text: string; ids: string[] }[] = [
  { no: 1, icon: '👋', title: 'Ankommen', text: 'Die wichtigsten Formalitäten und unsere Regeln im Team.', ids: ['gesund', 'hygiene', 'regeln'] },
  { no: 2, icon: '🍞', title: 'Unsere Brote', text: 'Schnittstärken und die Brote auf einen Blick erkennen.', ids: ['schnitt', 'bilder'] },
  { no: 3, icon: '💬', title: 'Beraten', text: 'Wie schmeckt was, und wie läuft ein Verkaufsgespräch?', ids: ['geschmack', 'theke'] },
  { no: 4, icon: '🛡️', title: 'Allergien', text: 'Sicher beraten, wenn ein Kunde eine Allergie hat.', ids: ['allergene'] },
  { no: 5, icon: '🏁', title: 'Fit für die Theke', text: 'Dranbleiben, dann gibt es den Theken-Führerschein.', ids: ['fragen', 'serie'] },
];

/** „Meine erste Woche mit der App“ – für alle, die schon bei Hinkel sind: die App in Ruhe kennenlernen */
export const APP_WEEK_ITEMS: OnboardingItem[] = [
  { id: 'quiz', title: '10 Quizfragen richtig', desc: 'Im Bereich „Lernen“ ein paar Runden gespielt.', go: 'lernen' },
  { id: 'daily', title: 'Tages-Challenge gemacht', desc: 'Einmal die 5 Fragen des Tages beantwortet.', go: 'daily' },
  { id: 'steckbrief', title: 'Steckbriefe angeschaut', desc: 'Unter „Nachschlagen“ ein paar Produkte geöffnet.', manual: true, go: 'steckbriefe' },
  { id: 'bestenliste', title: 'Bestenliste angeschaut', desc: 'Wer liegt vorne, und welche Abzeichen gibt es?', manual: true, go: 'bestenliste' },
  { id: 'bilder', title: '10 Produkte am Foto erkannt', desc: 'Im Bilderquiz insgesamt 10 richtige Antworten.', go: 'bilder' },
  { id: 'theke', title: 'Theken-Simulator ausprobiert', desc: 'Mindestens 5 Antworten im Verkaufsgespräch gegeben.', go: 'theke' },
  { id: 'allergene', title: 'Allergene-Training gespielt', desc: 'Einmal eine Runde im Allergene-Training.', go: 'allergene' },
  { id: 'fragen', title: '50 Fragen gemeistert', desc: 'Egal in welchem Bereich, 50 verschiedene Fragen richtig.', go: 'lernen' },
  { id: 'serie', title: '3 Tage am Stück dabei', desc: 'Drei Tage hintereinander mindestens eine Runde.' },
];
export const APP_WEEK_DAYS: { no: number; icon: string; title: string; text: string; ids: string[] }[] = [
  { no: 1, icon: '📚', title: 'Lernen', text: 'So funktionieren Quiz und Tages-Challenge.', ids: ['quiz', 'daily'] },
  { no: 2, icon: '🔎', title: 'Nachschlagen', text: 'Alles über unsere Produkte und das Team.', ids: ['steckbrief', 'bestenliste'] },
  { no: 3, icon: '🎮', title: 'Spielen', text: 'Lernen mit Spaß: Fotos, Verkaufsgespräche und Allergien.', ids: ['bilder', 'theke', 'allergene'] },
  { no: 4, icon: '🏁', title: 'Dranbleiben', text: 'Ein paar Tage dranbleiben, dann kennst du die App.', ids: ['fragen', 'serie'] },
];
/** Welche Punkte von „Meine erste Woche mit der App“ sind erledigt? */
export function appWeekStatus(prog: any, dailyDone: boolean): { items: (OnboardingItem & { done: boolean; self?: boolean })[]; done: number; total: number } {
  const p = prog || {};
  const ok = correctIdSet(p);
  const st: LearnStats = p._stats || {};
  const manual = p._appWeek || {};
  const th = thekeTotals(p);
  const auto: Record<string, boolean> = {
    quiz: ok.size >= 10,
    daily: dailyDone,
    bilder: (Number(st.bilderRight) || 0) >= 10,
    theke: th.ok + th.bad >= 5,
    allergene: (Number(st.allergenBest) || 0) > 0,
    fragen: ok.size >= 50,
    serie: bestStreakOf(Array.isArray(p._days) ? p._days : []) >= 3,
  };
  const items = APP_WEEK_ITEMS.map(it => ({ ...it, done: !!manual[it.id] || (!it.manual && !!auto[it.id]), self: !it.manual && !!manual[it.id] && !auto[it.id] }));
  return { items, done: items.filter(i => i.done).length, total: items.length };
}

/** Wer ist man bei Hinkel? Wird beim ersten Anmelden gefragt */
export type StaffRole = 'neu' | 'erfahren' | 'azubi';
export const ROLE_INFO: Record<StaffRole, { icon: string; title: string; desc: string }> = {
  neu: { icon: '🌱', title: 'Neu bei Hinkel', desc: 'Ich fange gerade an. Mit Plan für die erste Woche.' },
  erfahren: { icon: '🥖', title: 'Schon länger dabei', desc: 'Ich kenne mich aus und will mein Wissen auffrischen.' },
  azubi: { icon: '🎓', title: 'Azubi', desc: 'Ich mache eine Ausbildung bei Hinkel.' },
};

const SCHNITT_IDS = [60, 61, 62];
const GESCHMACK_IDS = [70, 71, 72, 73, 74, 503, 504, 505, 506, 5001, 5002, 5003];

/** Welche Punkte der Einarbeitungs-Checkliste sind erledigt? */
export function onboardingStatus(prog: any): { items: (OnboardingItem & { done: boolean; self?: boolean })[]; done: number; total: number } {
  const p = prog || {};
  const ok = correctIdSet(p);
  const st: LearnStats = p._stats || {};
  const manual = p._onboarding || {};
  const th = thekeTotals(p);
  const auto: Record<string, boolean> = {
    schnitt: SCHNITT_IDS.every(id => ok.has(id)),
    geschmack: GESCHMACK_IDS.filter(id => ok.has(id)).length >= 5,
    bilder: (Number(st.bilderRight) || 0) >= 20,
    theke: th.ok + th.bad >= 5,
    allergene: (Number(st.allergenBest) || 0) >= 7,
    fragen: ok.size >= 50,
    serie: bestStreakOf(Array.isArray(p._days) ? p._days : []) >= 3,
  };
  // Selbst abgehakt („Kann ich schon“) zählt auch bei den Übungs-Punkten
  const items = ONBOARDING_ITEMS.map(it => ({ ...it, done: !!manual[it.id] || (!it.manual && !!auto[it.id]), self: !it.manual && !!manual[it.id] && !auto[it.id] }));
  return { items, done: items.filter(i => i.done).length, total: items.length };
}

export type Badge = { id: string; icon: string; title: string; desc: string; ok: boolean };

const knownCount = (p: any, game: string) => (p && p._known && Array.isArray(p._known[game]) ? p._known[game].length : 0);
const adventMax = (p: any) => Math.max(0, ...Object.values((p && p._advent) || {}).map((y: any) => Object.keys(y || {}).length));

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTH_ICONS = ['❄️', '💝', '🌱', '🌷', '🌼', '☀️', '🍓', '🌻', '🍎', '🎃', '🏮', '🎄'];
const monthHeroCount = (p: any, mi: number) => Object.keys((p && p._monthHero) || {}).filter(k => Number(k.slice(5, 7)) === mi + 1).length;
const SECRETS = [
  { id: 'eule', icon: '🦉', title: 'Nachteule', desc: 'Nach 22 Uhr noch gelernt' },
  { id: 'frueh', icon: '🐓', title: 'Frühaufsteher', desc: 'Vor 6 Uhr morgens gelernt' },
  { id: 'sonntag', icon: '🛋️', title: 'Sonntagslerner', desc: 'Am freien Sonntag gelernt' },
  { id: 'perfekt', icon: '💯', title: 'Fehlerlos', desc: '5 Quizrunden hintereinander alles richtig' },
  { id: 'glueck', icon: '🍀', title: 'Glückstreffer', desc: 'Das seltene Goldlos gezogen' },
];

/** Abzeichen, werden aus dem Lernstand berechnet, nichts muss extra gespeichert werden */
export function computeBadges(prog: any, masteryPct: number, fachPct: number, allProducts = false, allPhotos = false): Badge[] {
  const p = prog || {};
  const ok = correctIdSet(p);
  const st: LearnStats = p._stats || {};
  const best = bestStreakOf(Array.isArray(p._days) ? p._days : []);
  const th = thekeTotals(p);
  const ob = onboardingStatus(p);
  return [
    { id: 'start', icon: '🥨', title: 'Erste Schritte', desc: '10 Fragen gemeistert', ok: ok.size >= 10 },
    { id: 'fleiss', icon: '📚', title: 'Fleißige Biene', desc: '100 Fragen gemeistert', ok: ok.size >= 100 },
    { id: 'halb', icon: '🏅', title: 'Halbzeit', desc: '50 % aller Fragen gemeistert', ok: masteryPct >= 50 },
    { id: 'meister100', icon: '🎖️', title: 'Hinkel-Meister', desc: '100 % aller Fragen gemeistert', ok: masteryPct >= 100 },
    { id: 'serie7', icon: '🔥', title: 'Eine Woche dran', desc: '7 Tage Lern-Serie', ok: best >= 7 },
    { id: 'serie30', icon: '🌟', title: 'Dauerbrenner', desc: '30 Tage Lern-Serie', ok: best >= 30 },
    { id: 'auge', icon: '👀', title: 'Brot-Kenner', desc: 'Bilderquiz mit 10 von 10', ok: (Number(st.bilderBest) || 0) >= 10 },
    { id: 'allergie', icon: '🛡️', title: 'Allergie-Profi', desc: 'Allergene-Training mit 10 von 10', ok: (Number(st.allergenBest) || 0) >= 10 },
    { id: 'theke', icon: '💬', title: 'Theken-Talent', desc: '25 richtige Antworten im Theken-Simulator', ok: th.ok >= 25 },
    { id: 'fehler', icon: '🔁', title: 'Fehler-Killer', desc: '10 Fragen aus dem Fehler-Stapel endgültig gelernt', ok: (Number(st.fehlerDone) || 0) >= 10 },
    { id: 'pruefung', icon: '🎓', title: 'Prüfungsreif', desc: 'Prüfungssimulation mit Note 2 oder besser', ok: (Number(st.examBest) || 0) >= 81 },
    { id: 'angekommen', icon: '✅', title: 'Angekommen', desc: 'Checkliste „Meine erste Woche“ komplett', ok: ob.done === ob.total },
    { id: 'fach', icon: '🧠', title: 'Fachwissen-Meister', desc: 'Alle Fachwissen-Fragen gemeistert', ok: fachPct >= 100 },
    // Abzeichen für die neuen Spiele
    { id: 'preis', icon: '💶', title: 'Preis-Profi', desc: 'Teurer oder billiger: 10 in Folge richtig', ok: (Number(st.priceBest) || 0) >= 10 },
    { id: 'schneide', icon: '🔪', title: 'Schneide-Meister', desc: 'Schneide-Profi mit 10 von 10', ok: (Number(st.sliceBest) || 0) >= 10 },
    { id: 'brote', icon: '🍞', title: 'Brot-Experte', desc: '50 verschiedene Brote richtig geschnitten', ok: knownCount(p, 'schnitt') >= 50 },
    { id: 'alternativen', icon: '🤝', title: 'Alternativen-Ass', desc: '30 Ausverkauft-Situationen gemeistert', ok: knownCount(p, 'alternativen') >= 30 },
    { id: 'beratung', icon: '🛎️', title: 'Beratungs-Profi', desc: '20 verschiedene Beratungen im Theken-Simulator gemeistert', ok: knownCount(p, 'theke') >= 20 },
    { id: 'advent', icon: '🎄', title: 'Adventsheld', desc: 'Alle 24 Türchen im Adventskalender geöffnet', ok: adventMax(p) >= 24 },
    // Neue Abzeichen
    { id: 'wissen300', icon: '🧠', title: 'Wissensriese', desc: '300 Fragen gemeistert', ok: ok.size >= 300 },
    { id: 'alles', icon: '🏰', title: 'Hinkel-Legende', desc: 'Alle Fragen, alle Produkte und alle Fotos geschafft', ok: masteryPct >= 100 && allProducts && allPhotos },
    { id: 'pfad1', icon: '🎲', title: 'Losgelaufen', desc: 'Erstes Feld im Lernpfad geschafft', ok: (Number(p._pfad) || 0) >= 1 },
    { id: 'pfad12', icon: '🥐', title: 'Halber Weg', desc: '12 Felder im Lernpfad', ok: (Number(p._pfad) || 0) >= 12 },
    { id: 'pfad24', icon: '👑', title: 'Brotmeister', desc: 'Lernpfad bis zum Ziel', ok: (Number(p._pfad) || 0) >= 24 },
    { id: 'album25', icon: '📒', title: 'Foto-Sammler', desc: '25 Produkte im Bilderquiz erkannt', ok: (Array.isArray(p._bilderOk) ? p._bilderOk.length : 0) >= 25 },
    { id: 'album80', icon: '🖼️', title: 'Foto-Held', desc: '80 Produkte im Bilderquiz erkannt', ok: (Array.isArray(p._bilderOk) ? p._bilderOk.length : 0) >= 80 },
    { id: 'sortiment', icon: '🧺', title: 'Sortiments-Profi', desc: 'Zu jedem Produkt mindestens eine Frage gemeistert', ok: allProducts },
    { id: 'fotoprofi', icon: '📸', title: 'Foto-Profi', desc: 'Alle Produkte im Bilderquiz erkannt', ok: allPhotos },
    { id: 'ansturm', icon: '🏃', title: 'Ruhe im Ansturm', desc: 'Im Theken-Ansturm 10 Kunden in einer Runde bedient', ok: (Number(st.ansturmBest) || 0) >= 10 },
    { id: 'heute7', icon: '🗓️', title: 'Planvoll', desc: '7-mal „Heute dran“ gespielt', ok: (Number(p._heuteCount) || 0) >= 7 },
    { id: 'los', icon: '🎫', title: 'Glückslos', desc: 'Ein Rubbellos freigerubbelt', ok: (Number(p._losCount) || 0) >= 1 },
    { id: 'schatz', icon: '💎', title: 'Schatzsucher', desc: 'Etwas in der Schatzkammer gekauft', ok: Array.isArray(p._ptsOwned) && p._ptsOwned.length > 0 },
    { id: 'rad', icon: '🎡', title: 'Glückspilz', desc: 'Am Glücksrad gedreht', ok: !!p._wheel },
    { id: 'spar10', icon: '🫙', title: 'Sparschwein', desc: '10 € Trinkgeld verdient', ok: (Number(p._tipCents) || 0) >= 1000 },
    { id: 'spar50', icon: '💰', title: 'Trinkgeld-König', desc: '50 € Trinkgeld verdient', ok: (Number(p._tipCents) || 0) >= 5000 },
    { id: 'laden', icon: '🛍️', title: 'Stammkunde', desc: '5 Sachen im Trinkgeld-Laden gekauft', ok: (Array.isArray(p._shopOwned) ? p._shopOwned.length : 0) >= 5 },
    { id: 'serie14', icon: '⚡', title: 'Zwei Wochen dran', desc: '14 Tage Lern-Serie', ok: best >= 14 },
    { id: 'theke100', icon: '🛎️', title: 'Theken-Profi', desc: '100 richtige Antworten im Theken-Simulator', ok: th.ok >= 100 },
    { id: 'login7', icon: '🎁', title: 'Treue Seele', desc: '7 Tage am Stück die Anmelde-Belohnung abgeholt', ok: (Number(p._loginBest) || 0) >= 7 },
    { id: 'ostern', icon: '🐣', title: 'Eier-Detektiv', desc: osterZeit() ? 'Finde zu Ostern alle versteckten Eier in der App' : 'Nur in der Osterzeit zu finden', ok: Array.isArray(p._osternDone) && p._osternDone.length > 0 },
    { id: 'meister', icon: '👑', title: 'Monatsmeister', desc: 'Einen Monat die meisten Punkte gesammelt', ok: Array.isArray(p._meister) && p._meister.length > 0 },
    { id: 'geheim', icon: '🥨', title: 'Geheimnis entdeckt', desc: p._egg ? 'Du hast das Geheimnis gefunden!' : 'Irgendwo in der App versteckt sich etwas …', ok: !!p._egg },
    // Monats-Abzeichen: an 15 Tagen in einem Monat gelernt, zählt jedes Jahr weiter
    ...MONTHS.map((m, mi) => { const n = monthHeroCount(p, mi); return { id: `monat${mi + 1}`, icon: MONTH_ICONS[mi], title: `${m}-Held${n > 1 ? ` ×${n}` : ''}`, desc: n > 1 ? `In ${n} Jahren an 15 Tagen im ${m} gelernt` : `An 15 Tagen im ${m} gelernt`, ok: n > 0 }; }),
    { id: 'jahresheld', icon: '🏆', title: 'Jahres-Held', desc: 'Alle 12 Monats-Abzeichen gesammelt', ok: MONTHS.every((_, mi) => monthHeroCount(p, mi) > 0) },
    // Geheime Abzeichen: erst sichtbar, wenn gefunden
    ...SECRETS.map(sb => { const got = !!(p._secret && p._secret[sb.id]); return got ? { id: 'g_' + sb.id, icon: sb.icon, title: sb.title, desc: sb.desc, ok: true } : { id: 'g_' + sb.id, icon: '❔', title: 'Geheimes Abzeichen', desc: 'Wird erst verraten, wenn du es findest …', ok: false }; }),
  ];
}

/** Notenschlüssel der Kammer (100-Punkte-Schlüssel) */
export function ihkGrade(pct: number): { note: number; text: string; passed: boolean } {
  if (pct >= 92) return { note: 1, text: 'sehr gut', passed: true };
  if (pct >= 81) return { note: 2, text: 'gut', passed: true };
  if (pct >= 67) return { note: 3, text: 'befriedigend', passed: true };
  if (pct >= 50) return { note: 4, text: 'ausreichend', passed: true };
  if (pct >= 30) return { note: 5, text: 'mangelhaft', passed: false };
  return { note: 6, text: 'ungenügend', passed: false };
}


// ───────────────────────── Rückmeldung nach einer Antwort ─────────────────────────

/** Was nach einer Antwort kurz eingeblendet wird */
export type AnswerFxState = { k: number; ok: boolean; text: string; streak?: number; pts?: number } | null;

/**
 * Kleine schwebende Plakette nach einer Antwort (z. B. „💶 Stimmt!“ oder „🔥 3 in Folge!“).
 * Der Container drumherum braucht position: relative. Mit k wird die Animation bei jeder Antwort neu gestartet.
 */
const FX_CSS = `
@keyframes ltFxFloat{0%{opacity:0;transform:translateY(14px) scale(.7)}10%{opacity:1;transform:translateY(0) scale(1.12)}18%{transform:scale(1)}82%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-18px)}}
.lt-fx{position:fixed;top:calc(env(safe-area-inset-top, 0px) + 72px);left:50%;transform:translateX(-50%);z-index:1150;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;width:max-content;max-width:92vw}
.lt-fx>span{animation:ltFxFloat 3.2s ease forwards}
@media (prefers-reduced-motion:reduce){.lt-fx>span{animation:ltFxFade 3.2s ease forwards}}
@keyframes ltFxFade{0%,85%{opacity:1}100%{opacity:0}}
`;

/**
 * Schwebende Plakette nach einer Antwort (z. B. „+20 Punkte“, „🔥 3 in Folge!“).
 * Sie steht fest oben am Bildschirm, damit man sie auch sieht, wenn die Seite zur Erklärung scrollt.
 * Mit k wird die Animation bei jeder Antwort neu gestartet.
 */
// ── Combo-Bonus: alle 5 richtigen Antworten in Folge gibt es +0,2 auf die Punkte, höchstens ×2,0 (in allen Spielen) ──
let comboRun = 0, comboMultSum = 0, comboHits = 0, comboExact = 0, comboExactHits = 0;
export const comboMultFor = (run: number) => Math.min(2, 1 + 0.2 * Math.floor(run / 5));
/** Jede Antwort zählt einzeln: Punkte dieser Antwort × Combo-Faktor */
export function comboRegister(ok: boolean, pts?: number) {
  if (!ok) { comboRun = 0; return; }
  comboRun++; comboHits++;
  const m = comboMultFor(comboRun);
  comboMultSum += m;
  if (typeof pts === 'number' && Number.isFinite(pts) && pts >= 0) { comboExact += pts * (m - 1); comboExactHits++; }
}
/** Combo-Extrapunkte der Runde, exakt pro Antwort (sonst über den Durchschnitt) und zurücksetzen */
export function comboTake(roundScore: number): number {
  const exact = comboHits > 0 && comboExactHits === comboHits;
  const extra = exact ? comboExact : roundScore * ((comboHits ? comboMultSum / comboHits : 1) - 1);
  comboReset();
  return Math.max(0, Math.round(extra));
}
export function comboReset() { try { document.body.classList.remove('lt-hot'); } catch { /* egal */ } comboRun = 0; comboMultSum = 0; comboHits = 0; comboExact = 0; comboExactHits = 0; }

export function AnswerFx({ fx, streakIcon = '🔥' }: { fx: AnswerFxState; streakIcon?: string; pos?: 'top' | 'bottom' }) {
  const fxKey = fx ? `${fx.k}|${fx.ok}` : null;
  useEffect(() => { if (fx) { comboRegister(!!fx.ok, fx.pts); try { document.body.classList.toggle('lt-hot', comboRun >= 5); } catch { /* egal */ } } }, [fxKey]);
  if (!fx) return null;
  return (
    <div key={fx.k} className="lt-fx" aria-hidden="true">
      <style>{FX_CSS}</style>
      <span style={{ padding: '10px 20px', borderRadius: '999px', backgroundColor: fx.ok ? TH.green : TH.red, color: dc('#FFFFFF'), fontWeight: 700, fontSize: '20px', boxShadow: '0 10px 24px -6px rgba(0,0,0,.4)', whiteSpace: 'nowrap' }}>{fx.text}</span>
      {fx.ok && (fx.streak || 0) >= 3 && (
        <span style={{ padding: '8px 16px', borderRadius: '999px', backgroundColor: dc('#FCE1D2'), color: dc('#C2410C'), fontWeight: 700, fontSize: '18px', animationDelay: '.15s', opacity: 0, animationFillMode: 'forwards', boxShadow: '0 8px 18px -8px rgba(0,0,0,.3)' }}>{streakIcon} {fx.streak} in Folge!</span>
      )}
    </div>
  );
}


// ───────────────────────── Fortschrittsleiste – in allen Spielen gleich ─────────────────────────

/**
 * Zeigt, wie weit man in einer Runde ist („Foto 3 von 10 · noch 7“) – bleibt beim Scrollen oben stehen.
 * Für Spiele auf Zeit: left/right selbst setzen und value/max für den Balken.
 */
export function GameProgress({ label, index, total, answered, left, right, value, max, warn }: { label?: string; index?: number; total?: number; answered?: boolean; left?: string; right?: string; value?: number; max?: number; warn?: boolean }) {
  const t = Math.max(1, total || max || 1);
  const done = value !== undefined ? value : Math.min(t, (index || 0) + (answered ? 1 : 0));
  const pct = Math.max(0, Math.min(100, Math.round((done / t) * 100)));
  const leftText = left ?? `${label || 'Frage'} ${Math.min(t, (index || 0) + 1)} von ${t}`;
  const rest = t - done;
  const rightText = right ?? (rest <= 0 ? 'geschafft!' : `noch ${rest}`);
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 6, backgroundColor: TH.cream, padding: '8px 2px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', fontSize: '16px' }}>
        <strong style={{ color: TH.ink }}>{leftText}</strong>
        <span style={{ color: warn ? TH.red : TH.muted, fontWeight: 700 }}>{rightText}</span>
      </div>
      <div style={{ height: '12px', backgroundColor: dc('#F4EADB'), borderRadius: '999px', overflow: 'hidden', border: `1px solid ${TH.line}` }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: warn ? TH.red : TH.yellow, borderRadius: '999px', transition: 'width .45s cubic-bezier(.2,.8,.2,1)' }} />
      </div>
    </div>
  );
}

// ───────────────────────── Fehler melden (in allen Spielen) ─────────────────────────
/** Was in einem Spiel gemeldet wird: Spielname, was angezeigt wurde, ggf. Produkt oder Quizfrage */
export type GameReport = { game: string; text: string; detail?: string; product?: string; qid?: number };
type Reporter = (r: GameReport, onSent: () => void) => void;
let gameReporter: Reporter | null = null;
let reportedKeys: Record<string, boolean> = {};
/** Wird von der App gesetzt (für den Ausbilder: null = kein Melden-Knopf) */
export function setGameReporter(fn: Reporter | null, alreadyReported: Record<string, any> = {}) {
  gameReporter = fn;
  reportedKeys = {};
  Object.keys(alreadyReported || {}).forEach(k => { reportedKeys[k] = true; });
}
const hashText = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};
/** Schlüssel einer Meldung: Quizfragen über ihre Nummer, Spiele über Spiel + Text */
export const reportKeyOf = (r: GameReport) => (typeof r.qid === 'number' ? String(r.qid) : `g_${hashText(r.game + '|' + r.text + (r.detail ? '|' + r.detail : ''))}`);

// Aktuelle Frage/Aufgabe, die gerade auf dem Bildschirm ist → schwebender Knopf „⚑ Fehler melden“ (überall gleich)
let currentReport: GameReport | null = null;
const reportListeners: Array<() => void> = [];
const notifyReport = () => reportListeners.slice().forEach(f => f());
/** In jedes Spiel einbauen: meldet, welche Frage gerade angezeigt wird */
export function ReportContext({ report }: { report: GameReport | null }) {
  const key = report ? `${report.game}|${report.qid ?? ''}|${report.text}|${report.detail || ''}` : '';
  useEffect(() => {
    currentReport = report;
    notifyReport();
    return () => { if (currentReport === report) { currentReport = null; notifyReport(); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
/** Schwebender Knopf am rechten Rand: immer da, wenn eine Frage angezeigt wird */
export function FloatingReportButton() {
  const [, force] = useState(0);
  const [sentKey, setSentKey] = useState('');
  useEffect(() => {
    const f = () => force(x => x + 1);
    reportListeners.push(f);
    return () => { const i = reportListeners.indexOf(f); if (i >= 0) reportListeners.splice(i, 1); };
  }, []);
  const r = currentReport;
  if (!gameReporter || !r) return null;
  const key = reportKeyOf(r);
  const done = sentKey === key || !!reportedKeys[key];
  return (
    <button
      className="lt-float-report"
      disabled={done}
      onClick={() => gameReporter && gameReporter(r, () => { reportedKeys[key] = true; setSentKey(key); })}
      aria-label={done ? 'Schon gemeldet' : 'Fehler bei dieser Frage melden'}
      style={{ position: 'fixed', right: 0, top: '46%', zIndex: 950, writingMode: 'vertical-rl', transform: 'rotate(180deg)', padding: '14px 9px', borderRadius: '0 14px 14px 0', border: `2px solid ${TH.line}`, borderLeft: 'none', backgroundColor: done ? TH.tintSage : dc('#FFFFFF'), color: done ? TH.green : TH.brown, fontSize: '15px', fontWeight: 700, cursor: done ? 'default' : 'pointer', boxShadow: '0 6px 18px rgba(43,23,10,.18)', letterSpacing: '.5px' }}
    >{done ? '✓ Gemeldet' : '⚑ Fehler melden'}</button>
  );
}

export function ReportLink({ report, align = 'right' }: { report: GameReport; align?: 'left' | 'right' | 'center' }) {
  const [sent, setSent] = useState(false);
  if (!gameReporter) return null;
  const key = reportKeyOf(report);
  const wrap: CSSProperties = { display: 'flex', justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end', marginTop: '10px' };
  if (sent || reportedKeys[key]) return <div style={wrap}><span style={{ fontSize: '15px', color: TH.muted, fontWeight: 700 }}>⚑ Gemeldet, danke!</span></div>;
  return (
    <div style={wrap}>
      <button
        onClick={(e) => { e.stopPropagation(); gameReporter && gameReporter(report, () => { reportedKeys[key] = true; setSent(true); }); }}
        style={{ minHeight: '40px', padding: '0 12px', borderRadius: '10px', border: `2px solid ${TH.line}`, backgroundColor: dc('#FFFFFF'), color: TH.muted, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
      >⚑ Fehler melden</button>
    </div>
  );
}

/** Aufklappbare Liste „Aufgaben dieser Runde ansehen“ – jede Aufgabe kann gemeldet werden */
export function ReportList({ items, title = 'Alle Aufgaben dieser Runde ansehen (Fehler melden)' }: { items: { label: ReactNode; report: GameReport }[]; title?: string }) {
  if (!gameReporter || items.length === 0) return null;
  return (
    <details style={{ ...cardStyle, padding: '16px 20px' }}>
      <summary style={{ cursor: 'pointer', fontSize: '17px', fontWeight: 700, color: TH.muted, minHeight: '44px', display: 'flex', alignItems: 'center' }}>{title}</summary>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
        {items.map((it, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream, fontSize: '16px', lineHeight: 1.45 }}>
            {it.label}
            <ReportLink report={it.report} />
          </div>
        ))}
      </div>
    </details>
  );
}

// ───────────────────────── Ausbildung (für alle sichtbar, Abhaken nur für Azubis) ─────────────────────────

export type PlanItem = { id: string; text: string; lehrgang?: boolean };
export const AUSBILDUNGSPLAN: { jahr: 1 | 2 | 3; title: string; items: PlanItem[] }[] = [
  { jahr: 1, title: '1. Lehrjahr: Ankommen und Grundlagen', items: [
    { id: 'j1_betrieb', text: 'Betrieb kennenlernen: Geschäfte, Backstube, Ansprechpartner' },
    { id: 'j1_hygiene', text: 'Hygieneregeln, Gesundheitsbelehrung und Arbeitsschutz' },
    { id: 'j1_kleidung', text: 'Arbeitskleidung und gepflegtes Erscheinungsbild' },
    { id: 'j1_ware', text: 'Ware annehmen, kontrollieren und richtig lagern' },
    { id: 'j1_brote', text: 'Unsere Brotsorten, Mehlarten und Geschmacksrichtungen kennen' },
    { id: 'j1_schneiden', text: 'Brot schneiden: Schnittstärken und sicherer Umgang mit der Maschine' },
    { id: 'j1_theke', text: 'Theke einräumen und Ware ansprechend präsentieren' },
    { id: 'j1_bedienen', text: 'Kunden begrüßen, bedienen und verabschieden' },
    { id: 'j1_kasse', text: 'Kassieren: Bargeld, Rückgeld und Kartenzahlung' },
    { id: 'j1_packen', text: 'Ware richtig einpacken' },
  ] },
  { jahr: 2, title: '2. Lehrjahr: Beraten und Verkaufen', items: [
    { id: 'j2_gespraech', text: 'Verkaufsgespräche führen und Kunden beraten' },
    { id: 'j2_allergene', text: 'Zutaten und Allergene sicher erklären' },
    { id: 'j2_zusatz', text: 'Zusatzverkauf und passende Empfehlungen' },
    { id: 'j2_alternativ', text: 'Alternativen anbieten, wenn etwas ausverkauft ist' },
    { id: 'j2_reklamation', text: 'Reklamationen freundlich bearbeiten' },
    { id: 'j2_snacks', text: 'Belegte Brötchen und Snacks zubereiten' },
    { id: 'j2_feingebaeck', text: 'Feingebäck, Kuchen und Saisonware kennen und verkaufen' },
    { id: 'j2_bestellung', text: 'Vorbestellungen annehmen und richtig aufschreiben' },
    { id: 'j2_abrechnung', text: 'Kassenabrechnung am Tagesende' },
    { id: 'j2_zp', text: 'Zwischenprüfung vorbereiten' },
  ] },
  { jahr: 3, title: '3. Lehrjahr: Verantwortung übernehmen', items: [
    { id: 'j3_bestellen', text: 'Ware bestellen und den Bedarf planen' },
    { id: 'j3_kalkulation', text: 'Preise, Kalkulation und Grundpreise verstehen' },
    { id: 'j3_deko', text: 'Dekoration, Schaufenster und Saisonaktionen gestalten' },
    { id: 'j3_platten', text: 'Platten und Geschenkkörbe zusammenstellen' },
    { id: 'j3_recht', text: 'Lebensmittelrecht und Kennzeichnung' },
    { id: 'j3_qualitaet', text: 'Qualität sichern: Kühlkette, Haltbarkeit, Kontrollen' },
    { id: 'j3_einarbeiten', text: 'Neue Kolleginnen und Kollegen einarbeiten' },
    { id: 'j3_ap', text: 'Abschlussprüfung vorbereiten' },
  ] },
];
export const AUSBILDUNG_LEHRGAENGE: PlanItem[] = [
  { id: 'lg_verkauf', text: 'Überbetrieblicher Lehrgang: Verkaufstraining und Warenpräsentation', lehrgang: true },
  { id: 'lg_snack', text: 'Überbetrieblicher Lehrgang: Snacks und belegte Backwaren', lehrgang: true },
  { id: 'lg_recht', text: 'Überbetrieblicher Lehrgang: Lebensmittelrecht und Hygiene', lehrgang: true },
];

const BERICHT_TIPPS = [
  'Jede Woche ausfüllen, am besten am Freitag, dann ist noch alles im Kopf.',
  'Schreib auf, was du gemacht hast und was du dabei gelernt hast.',
  'Berufsschultage und Lehrgänge gehören auch hinein.',
  'Zeig das Berichtsheft regelmäßig deinem Ausbilder und lass es unterschreiben.',
  'Ohne vollständiges Berichtsheft keine Zulassung zur Abschlussprüfung.',
];

export type AzubiBadge = { id: string; icon: string; title: string; how: string };
export function azubiBadges(plan: Record<string, boolean>, exam: { ZP?: { best?: number }; AP?: { best?: number } } = {}): (AzubiBadge & { got: boolean })[] {
  const yearDone = (j: number) => AUSBILDUNGSPLAN.find(y => y.jahr === j)!.items.every(i => plan[i.id]);
  const any = Object.keys(plan).some(k => plan[k]);
  return [
    { id: 'start', icon: '🌱', title: 'Erster Haken', how: 'Den ersten Punkt im Plan abhaken', got: any },
    { id: 'j1', icon: '🥉', title: '1. Lehrjahr geschafft', how: 'Alle Punkte im 1. Lehrjahr abhaken', got: yearDone(1) },
    { id: 'j2', icon: '🥈', title: '2. Lehrjahr geschafft', how: 'Alle Punkte im 2. Lehrjahr abhaken', got: yearDone(2) },
    { id: 'j3', icon: '🥇', title: '3. Lehrjahr geschafft', how: 'Alle Punkte im 3. Lehrjahr abhaken', got: yearDone(3) },
    { id: 'lg', icon: '🏫', title: 'Lehrgangs-Profi', how: 'Alle Lehrgänge besucht', got: AUSBILDUNG_LEHRGAENGE.every(l => plan[l.id]) },
    { id: 'zp', icon: '📝', title: 'Zwischenprüfung geübt', how: 'Simulation mit mindestens 50 %', got: (Number(exam.ZP?.best) || 0) >= 50 },
    { id: 'ap', icon: '🎓', title: 'Abschlussprüfung geübt', how: 'Simulation mit mindestens 50 %', got: (Number(exam.AP?.best) || 0) >= 50 },
  ];
}

function mondayOf(d: Date) { const x = new Date(d); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); x.setHours(0, 0, 0, 0); return x; }
const dmy = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function AusbildungView({ isAzubi, isAdmin, plan, lehrjahr, onToggle, onSetLehrjahr, examSection, azubis, exam = {} }: {
  exam?: { ZP?: { best?: number }; AP?: { best?: number } };
  isAzubi: boolean; isAdmin: boolean; plan: Record<string, boolean>; lehrjahr: number;
  onToggle: (id: string) => void; onSetLehrjahr: (n: number) => void; examSection: ReactNode;
  azubis: { name: string; plan: Record<string, boolean>; lehrjahr: number; exam?: { ZP?: { best?: number }; AP?: { best?: number } } }[];
}) {
  const [openYear, setOpenYear] = useState<number>(lehrjahr || 1);
  const [week, setWeek] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [schule, setSchule] = useState('');
  const [extra, setExtra] = useState('');
  const [copied, setCopied] = useState(false);
  const canTick = isAzubi && !isAdmin;
  const allItems = [...AUSBILDUNGSPLAN.flatMap(y => y.items), ...AUSBILDUNG_LEHRGAENGE];
  const yearPct = (p: Record<string, boolean>, jahr: number) => { const its = AUSBILDUNGSPLAN.find(y => y.jahr === jahr)!.items; return Math.round(its.filter(i => p[i.id]).length / its.length * 100); };
  const mon = mondayOf(new Date()); mon.setDate(mon.getDate() - week * 7); const sat = new Date(mon); sat.setDate(sat.getDate() + 5);
  const reportText = [
    `Woche vom ${dmy(mon)} bis ${dmy(sat)}`,
    '',
    'Betriebliche Tätigkeiten:',
    ...(picked.length ? picked.map(id => `• ${allItems.find(i => i.id === id)?.text || id}`) : ['• (noch nichts ausgewählt)']),
    ...(extra.trim() ? [`• ${extra.trim()}`] : []),
    ...(schule.trim() ? ['', 'Berufsschule:', ...schule.split('\n').filter(s => s.trim()).map(s => `• ${s.trim()}`)] : []),
  ].join('\n');
  const copy = () => {
    const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); };
    try { navigator.clipboard.writeText(reportText).then(done, () => {}); } catch { /* ohne Zwischenablage */ }
  };
  const chip = (on: boolean): CSSProperties => ({ minHeight: '44px', padding: '8px 14px', borderRadius: '999px', border: on ? 'none' : `2px solid ${TH.line}`, backgroundColor: on ? TH.brown : TH.white, color: on ? dc('#FFF6E0') : TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageHead title="Ausbildung" subtitle="Dein Ausbildungsplan zum Abhaken, Hilfe fürs Berichtsheft und die Prüfungen." />

      {isAdmin && (
        <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.1 }}>Deine Azubis</div>
          {azubis.length === 0 ? <div style={{ fontSize: '17px', color: TH.muted }}>Noch niemand hat sich als Azubi angemeldet.</div> : azubis.map(a => (
            <div key={a.name} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>🎓 {a.name}{a.lehrjahr ? ` · ${a.lehrjahr}. Lehrjahr` : ''} <span style={{ letterSpacing: '2px' }}>{azubiBadges(a.plan, a.exam).filter(b => b.got).map(b => b.icon).join('')}</span></div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '15px' }}>
                {[1, 2, 3].map(j => <span key={j} style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>{j}. Jahr: {yearPct(a.plan, j)} %</span>)}
                <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>Lehrgänge: {AUSBILDUNG_LEHRGAENGE.filter(l => a.plan[l.id]).length} von {AUSBILDUNG_LEHRGAENGE.length}</span>
              </div>
            </div>
          ))}
        </section>
      )}


      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}><span className="lt-emo-bob">📋</span> Ausbildungsplan</div>
          {canTick && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>Ich bin im</span>
              {[1, 2, 3].map(j => <button key={j} onClick={() => { onSetLehrjahr(j); setOpenYear(j); }} style={chip(lehrjahr === j)}>{j}. Lehrjahr</button>)}
            </div>
          )}
        </div>
        <div style={{ fontSize: '16px', color: TH.brown, lineHeight: 1.45 }}>{canTick ? 'Hake ab, was du schon kannst. Dein Ausbilder sieht deinen Stand.' : 'So sieht der Plan für die Azubis aus. Abhaken können nur die Azubis selbst.'}</div>
        {AUSBILDUNGSPLAN.map(y => {
          const pct = yearPct(plan, y.jahr); const open = openYear === y.jahr;
          return (
            <div key={y.jahr} style={{ borderRadius: '18px', border: `2px solid ${open ? TH.brown : TH.line}`, overflow: 'hidden' }}>
              <button onClick={() => setOpenYear(open ? 0 : y.jahr)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: 'none', backgroundColor: open ? TH.tintYellow : TH.white, color: TH.ink, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '18px' }}>{y.title}</span>
                  {canTick && <span style={{ display: 'block', marginTop: '6px', height: '8px', borderRadius: '999px', backgroundColor: dc('#F4EADB'), overflow: 'hidden' }}><span style={{ display: 'block', width: `${pct}%`, height: '100%', backgroundColor: TH.green, borderRadius: '999px', transition: 'width .4s ease' }} /></span>}
                </span>
                {canTick && <span style={{ fontWeight: 700, color: pct === 100 ? TH.green : TH.muted }}>{pct === 100 ? '✓ fertig' : `${pct} %`}</span>}
                <span aria-hidden="true" style={{ fontSize: '18px' }}>{open ? '▴' : '▾'}</span>
              </button>
              {open && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px 16px' }}>
                  {y.items.map(it => {
                    const on = !!plan[it.id];
                    return (
                      <button key={it.id} onClick={() => canTick && onToggle(it.id)} disabled={!canTick} role="checkbox" aria-checked={on} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '54px', padding: '10px 14px', borderRadius: '14px', border: `2px solid ${on ? TH.green : TH.line}`, backgroundColor: on ? TH.tintSage : TH.white, color: TH.ink, fontSize: '17px', textAlign: 'left', cursor: canTick ? 'pointer' : 'default' }}>
                        <span aria-hidden="true" style={{ flex: '0 0 28px', height: '28px', borderRadius: '8px', border: `2px solid ${on ? TH.green : TH.line}`, backgroundColor: on ? TH.green : TH.white, color: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{on ? '✓' : ''}</span>
                        <span style={{ flex: 1, textDecoration: on ? 'line-through' : 'none', opacity: on ? 0.75 : 1 }}>{it.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintBlue, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>🏫 Lehrgänge außerhalb des Betriebs</div>
          <div style={{ fontSize: '15px', color: TH.muted }}>Das lernst du nicht bei uns im Geschäft, sondern in Lehrgängen. Die Termine bekommst du vom Ausbilder.</div>
          {AUSBILDUNG_LEHRGAENGE.map(it => {
            const on = !!plan[it.id];
            return (
              <button key={it.id} onClick={() => canTick && onToggle(it.id)} disabled={!canTick} role="checkbox" aria-checked={on} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '52px', padding: '10px 14px', borderRadius: '14px', border: `2px solid ${on ? TH.green : TH.line}`, backgroundColor: on ? TH.tintSage : TH.white, color: TH.ink, fontSize: '16px', textAlign: 'left', cursor: canTick ? 'pointer' : 'default' }}>
                <span aria-hidden="true" style={{ flex: '0 0 28px', height: '28px', borderRadius: '8px', border: `2px solid ${on ? TH.green : TH.line}`, backgroundColor: on ? TH.green : TH.white, color: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{on ? '✓' : ''}</span>
                <span style={{ flex: 1 }}>{it.text}{on ? ' (besucht)' : ''}</span>
              </button>
            );
          })}
        </div>
      </section>

      {canTick && (() => {
        const bs = azubiBadges(plan, exam);
        return (
          <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.1 }}>🏅 Deine Abzeichen <span style={{ fontSize: '18px', color: TH.muted, fontFamily: 'inherit' }}>{bs.filter(b => b.got).length} von {bs.length}</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {bs.map(b => (
                <div key={b.id} className={b.got ? 'lt-tilt lt-pop-in' : undefined} style={{ padding: '14px 10px', borderRadius: '18px', textAlign: 'center', backgroundColor: b.got ? TH.tintYellow : TH.cream, border: `2px solid ${b.got ? dc('#E8B500') : TH.line}`, opacity: b.got ? 1 : 0.55, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span className={b.got ? 'lt-emo-bob' : undefined} style={{ fontSize: '38px', lineHeight: 1, filter: b.got ? 'none' : 'grayscale(1)' }} aria-hidden="true">{b.got ? b.icon : '🔒'}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700 }}>{b.title}</span>
                  <span style={{ fontSize: '13px', color: TH.muted }}>{b.got ? 'Geschafft!' : b.how}</span>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}><span className="lt-emo-bob">📒</span> Berichtsheft-Hilfe</div>
        <div style={{ fontSize: '16px', color: TH.brown, lineHeight: 1.45 }}>Wähle aus, was du diese Woche gemacht hast. Unten entsteht dein Wochenbericht zum Abschreiben oder Kopieren.</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setWeek(week + 1)} style={chip(false)}>‹ Woche davor</button>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>{dmy(mon)} bis {dmy(sat)}</span>
          {week > 0 && <button onClick={() => setWeek(week - 1)} style={chip(false)}>Woche danach ›</button>}
        </div>
        {AUSBILDUNGSPLAN.filter(y => !lehrjahr || y.jahr <= Math.max(lehrjahr, 1)).map(y => (
          <div key={y.jahr} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>{y.jahr}. Lehrjahr</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {y.items.map(it => { const on = picked.includes(it.id); return <button key={it.id} onClick={() => setPicked(on ? picked.filter(p => p !== it.id) : [...picked, it.id])} style={chip(on)}>{on ? '✓ ' : ''}{it.text}</button>; })}
            </div>
          </div>
        ))}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', fontWeight: 700 }}>
          Sonst noch etwas im Betrieb?
          <input value={extra} onChange={e => setExtra(e.target.value)} placeholder="z. B. Weihnachtsdeko im Schaufenster aufgebaut" style={{ minHeight: '50px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '17px', backgroundColor: TH.white, color: TH.ink }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', fontWeight: 700 }}>
          Berufsschule (ein Thema pro Zeile)
          <textarea value={schule} onChange={e => setSchule(e.target.value)} rows={3} placeholder={'z. B. Warenkunde Getreide\nKalkulation Grundpreis'} style={{ padding: '12px 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '17px', fontFamily: 'inherit', backgroundColor: TH.white, color: TH.ink }} />
        </label>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '17px', lineHeight: 1.5, padding: '16px', borderRadius: '16px', backgroundColor: TH.cream, border: `2px dashed ${TH.line}` }}>{reportText}</pre>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={copy} style={btnPrimary}>{copied ? '✓ Kopiert' : '📋 Bericht kopieren'}</button>
          {(picked.length > 0 || schule || extra) && <button onClick={() => { setPicked([]); setSchule(''); setExtra(''); }} style={btnSecondary}>Leeren</button>}
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintYellow, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontWeight: 700, fontSize: '17px' }}>Tipps fürs Berichtsheft</div>
          {BERICHT_TIPPS.map((t, i) => <div key={i} style={{ fontSize: '16px', lineHeight: 1.4 }}>• {t}</div>)}
        </div>
      </section>

      {(isAzubi || isAdmin) ? examSection : (
        <section style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span aria-hidden="true" style={{ fontSize: '36px' }}>🔒</span>
          <div>
            <div style={{ fontFamily: TH.serif, fontSize: '26px', lineHeight: 1.1 }}>Prüfungen</div>
            <div style={{ fontSize: '16px', color: TH.muted }}>Die Prüfungsfragen und die Prüfungssimulation sind nur für Azubis freigeschaltet.</div>
          </div>
        </section>
      )}
    </div>
  );
}


// ───────────────────────── Lernpfad (Brettspiel) ─────────────────────────
export type PfadFeld = { no: number; cat: string; level: 'easy' | 'mixed' | 'hard'; milestone?: { icon: string; title: string } };
export function buildPfad(cats: string[]): PfadFeld[] {
  const ms: Record<number, { icon: string; title: string }> = { 6: { icon: '🥨', title: 'Teigling geschafft' }, 12: { icon: '🥐', title: 'Brötchen-Profi' }, 18: { icon: '🍞', title: 'Brot-Kenner' }, 24: { icon: '👑', title: 'Brotmeister' } };
  return Array.from({ length: 24 }, (_, i) => ({ no: i + 1, cat: cats[i % cats.length], level: i < 8 ? 'easy' : i < 16 ? 'mixed' : 'hard', milestone: ms[i + 1] }));
}
const catIcon = (c: string) => /fach/i.test(c) ? '📚' : /sortiment|ware/i.test(c) ? '🥖' : /service|verkauf/i.test(c) ? '🤝' : /hygiene|sicher|recht/i.test(c) ? '🧼' : '❓';
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
function WheelIcon({ k }: { k: string }) {
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


// ───────────────────────── Monatsmeister ─────────────────────────
const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
/** Monat eines Bestenlisten-Eintrags als "2026-11" (Datum steht als "08.11.26, 04:46" drin) */
export function scoreMonth(date: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/.exec(String(date || ''));
  if (m) { const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]); return `${y}-${String(Number(m[2])).padStart(2, '0')}`; }
  const t = Date.parse(String(date || ''));
  if (!Number.isFinite(t)) return '';
  const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
export function scoreDay(date: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/.exec(String(date || ''));
  if (!m) return '';
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return `${y}-${String(Number(m[2])).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`;
}
export const monthLabel = (mk: string) => { const [y, m] = mk.split('-'); return `${MONTHS_DE[Number(m) - 1] || ''} ${y}`; };
export const monthKeyOf = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const prevMonthKey = (d = new Date()) => monthKeyOf(new Date(d.getFullYear(), d.getMonth() - 1, 1));
/** Punkte pro Person und Monat */
export function monthTotals(scores: { username: string; score: number; date: string }[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  (scores || []).forEach(s => {
    if (!s || !s.username) return;
    const k = s.username.toLowerCase(); if (k === 'admin') return;
    if ((s as any).category === 'Bonus vom Ausbilder') return; // geschenkte Punkte zählen nicht für die Monatskrone
    const mk = scoreMonth(s.date); if (!mk) return;
    (out[mk] = out[mk] || {})[k] = (out[mk][k] || 0) + (Number(s.score) || 0);
  });
  return out;
}
/** Sieger jedes abgeschlossenen Monats, neuester zuerst */
export function monthChampions(scores: { username: string; score: number; date: string }[], now = new Date()): { month: string; key: string; points: number }[] {
  const tot = monthTotals(scores); const cur = monthKeyOf(now);
  return Object.keys(tot).filter(mk => mk < cur).sort().reverse().map(mk => {
    const best = Object.entries(tot[mk]).sort((a, b) => b[1] - a[1])[0];
    return best ? { month: mk, key: best[0], points: best[1] } : null;
  }).filter(Boolean) as { month: string; key: string; points: number }[];
}

// ───────────────────────── Osterzeit ─────────────────────────
export function easterSunday(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}
/** Von Palmsonntag bis eine Woche nach Ostern */
export function osterZeit(d = new Date()): boolean {
  const e = easterSunday(d.getFullYear());
  const from = new Date(e.getFullYear(), e.getMonth(), e.getDate() - 7);
  const to = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 8);
  return d >= from && d < to;
}
export const OSTER_TABS: { id: string; label: string }[] = [
  { id: 'home', label: 'Start' }, { id: 'quiz', label: 'Lernen' }, { id: 'spielen', label: 'Spielen' }, { id: 'nachschlagen', label: 'Nachschlagen' }, { id: 'scoreboard', label: 'Bestenliste' }, { id: 'statistik', label: 'Meine Statistik' },
];
const EGG_SPOTS: Record<string, CSSProperties> = {
  home: { right: '6%', top: '420px' }, quiz: { left: '3%', top: '260px' }, spielen: { right: '4%', top: '520px' },
  nachschlagen: { left: '45%', top: '180px' }, scoreboard: { left: '2%', top: '640px' }, statistik: { right: '8%', top: '300px' },
};
const EGG_COLORS = ['#F28CB1', '#8FD3F4', '#B8E986', '#FFD36E', '#C7A6F2', '#FFA36C'];
export function OsterEi({ tab, onFind }: { tab: string; onFind: (tab: string) => void }) {
  const i = Math.max(0, OSTER_TABS.findIndex(t => t.id === tab));
  const col = EGG_COLORS[i % EGG_COLORS.length];
  return (
    <button onClick={() => onFind(tab)} aria-label="Osterei einsammeln" className="lt-osterei" style={{ position: 'absolute', zIndex: 4, width: '46px', height: '58px', border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', ...EGG_SPOTS[tab] }}>
      <svg viewBox="0 0 46 58" width="46" height="58" aria-hidden="true">
        <ellipse cx="23" cy="32" rx="19" ry="24" fill={col} stroke="#FFFFFF" strokeWidth="2" />
        <path d="M5 30 Q11 24 17 30 T29 30 T41 30" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="15" cy="42" r="2.6" fill="#FFFFFF" /><circle cx="23" cy="45" r="2.6" fill="#FFFFFF" /><circle cx="31" cy="42" r="2.6" fill="#FFFFFF" />
        <circle cx="17" cy="18" r="2" fill="#FFFFFF" opacity=".8" /><circle cx="28" cy="16" r="2" fill="#FFFFFF" opacity=".8" />
      </svg>
    </button>
  );
}

// ───────────────────────── Anmelde-Belohnung ─────────────────────────
export const LOGIN_REWARDS = [20, 30, 40, 50, 60, 80, 100];
export function LoginRewardDialog({ day, onClaim, onClose, claimedAlready = false }: { day: number; onClaim: () => void; onClose: () => void; claimedAlready?: boolean }) {
  const [claimed, setClaimed] = useState(claimedAlready);
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 105, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <ConfettiOverlay active={claimed} />
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Anmelde-Belohnung" style={{ width: '100%', maxWidth: '560px', backgroundColor: TH.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <div className="lt-emo-bob" style={{ fontSize: '54px', lineHeight: 1 }} aria-hidden="true">🎁</div>
        <div style={{ fontFamily: TH.serif, fontSize: '32px', lineHeight: 1.1 }}>Schön, dass du da bist!</div>
        <div style={{ fontSize: '17px', color: TH.brown }}>Jeden Tag gibt es eine Belohnung. Komm an 7 Arbeitstagen hintereinander (sonntags ist zu, das zählt nicht), dann wartet am 7. Tag ein Joker.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {LOGIN_REWARDS.map((c, i) => {
            const n = i + 1, past = n < day, today = n === day;
            return (
              <div key={n} className={today ? (claimed ? 'lt-login-got' : 'lt-login-today') : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 2px', borderRadius: '14px', backgroundColor: past || (today && claimed) ? TH.tintSage : today ? TH.yellow : TH.white, border: `2px solid ${today ? TH.brown : TH.line}`, opacity: n > day ? 0.7 : 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: TH.muted }}>Tag {n}</span>
                <span style={{ fontSize: '22px', lineHeight: 1.2 }} aria-hidden="true">{past || (today && claimed) ? '✅' : n === 7 ? '🃏' : '🪙'}</span>
                <span style={{ fontSize: '12px', fontWeight: 800 }}>{(c / 100).toFixed(2).replace('.', ',')} €</span>
              </div>
            );
          })}
        </div>
        {claimed ? (
          <div className="lt-levelup" style={{ fontSize: '19px', fontWeight: 800, color: TH.green }}>+{(LOGIN_REWARDS[day - 1] / 100).toFixed(2).replace('.', ',')} € Trinkgeld{day === 7 ? ' und ein Joker 🃏' : ''}!</div>
        ) : null}
        <button autoFocus onClick={() => { if (!claimed) { setClaimed(true); onClaim(); } else onClose(); }} style={btnPrimary}>{claimed ? 'Weiter geht’s' : `Tag ${day} abholen`}</button>
      </div>
    </div>
  );
}

// ───────────────────────── Meine Statistik ─────────────────────────
type StatQ = { id: number; category: string; subgroup?: string };
const pctColor = (p: number) => (p >= 80 ? '#2F7D4A' : p >= 60 ? '#8DB33A' : p >= 40 ? '#E9A23B' : '#D9572B');
function Ring({ pct, size = 150, stroke = 16, color, children }: { pct: number; size?: number; stroke?: number; color: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: `0 0 ${size}px` }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TH.line} strokeWidth={stroke} />
        <circle className="lt-ring-arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, pct)) / 100)} style={{ ['--lt-c' as any]: c }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
}
export function StatistikView({ name, avatar, avatarClass, levelTitle, levelIcon, levelPct, nextInfo, points, prog, questions, scores, badgesEarned, badgesTotal, streakNow, streakBest, onPractice, onBack }: {
  name: string; avatar?: string; avatarClass?: string; levelTitle: string; levelIcon: string; levelPct: number; nextInfo: string; points: number;
  prog: any; questions: StatQ[]; scores: { score: number; date: string; category?: string }[]; badgesEarned: number; badgesTotal: number; streakNow: number; streakBest: number;
  onPractice: (cat: string) => void; onBack: () => void;
}) {
  const qs: Record<string, number[]> = (prog && prog._qs) || {};
  const byId = new Map(questions.map(q => [String(q.id), q]));
  let right = 0, wrong = 0;
  const cat: Record<string, { r: number; w: number; seen: number; total: number; mastered: number }> = {};
  const sub: Record<string, { r: number; w: number }> = {};
  questions.forEach(q => { (cat[q.category] = cat[q.category] || { r: 0, w: 0, seen: 0, total: 0, mastered: 0 }).total++; });
  // Gemeistert wie auf der Lernen-Seite (richtig beantwortete Fragen pro Bereich)
  const masteredIds = new Set<string>();
  Object.keys(cat).forEach(c => { [...(Array.isArray(prog?.[`${c}_easy`]) ? prog[`${c}_easy`] : []), ...(Array.isArray(prog?.[`${c}_hard`]) ? prog[`${c}_hard`] : [])].forEach((id: any) => masteredIds.add(String(id))); });
  questions.forEach(q => { if (masteredIds.has(String(q.id))) cat[q.category].mastered++; });
  Object.keys(qs).forEach(id => {
    const v = qs[id]; const q = byId.get(id); if (!Array.isArray(v) || !q) return;
    const r = Number(v[0]) || 0, w = Number(v[1]) || 0; right += r; wrong += w;
    const c = cat[q.category]; if (c) { c.r += r; c.w += w; if (!masteredIds.has(id)) c.seen++; }
    if (q.subgroup) { const sg = (sub[q.subgroup] = sub[q.subgroup] || { r: 0, w: 0 }); sg.r += r; sg.w += w; }
  });
  const quote = right + wrong > 0 ? Math.round((right / (right + wrong)) * 100) : 0;
  const cats = Object.entries(cat).filter(([c]) => c !== 'Prüfung').map(([c, v]) => ({ c, pct: v.total ? Math.round((v.mastered / v.total) * 100) : 0, hit: v.r + v.w > 0 ? Math.round((v.r / (v.r + v.w)) * 100) : null, mastered: v.mastered, seen: v.seen + v.mastered, total: v.total, n: v.r + v.w }));
  const subLabel = (id: string) => (SORTIMENT_SUBFILTERS.find(f => f.id === id)?.label || id).replace(/^\S+\s/, '');
  const subs = Object.entries(sub).filter(([, v]) => v.r + v.w >= 3).map(([c, v]) => ({ c: subLabel(c), pct: Math.round((v.r / (v.r + v.w)) * 100), n: v.r + v.w })).sort((a, b) => b.pct - a.pct);
  const strong = subs.slice(0, 3), weak = subs.length > 3 ? subs.slice(-3).reverse() : [];
  // letzte 14 Tage
  const days: { k: string; label: string; pts: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; days.push({ k, label: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()], pts: 0 }); }
  const dayIdx = new Map(days.map((d, i) => [d.k, i]));
  const perCat: Record<string, number> = {};
  scores.forEach(s => { const k = scoreDay(s.date); const i = dayIdx.get(k); if (i !== undefined) days[i].pts += Number(s.score) || 0; const c = String(s.category || 'Quiz').replace(/:.*$/, ''); perCat[c] = (perCat[c] || 0) + (Number(s.score) || 0); });
  const learned = new Set(Array.isArray(prog?._days) ? prog._days : []);
  const maxPts = Math.max(1, ...days.map(d => d.pts));
  const topGames = Object.entries(perCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = Math.max(1, ...topGames.map(g => g[1]));
  const GOLD_IC: Record<string, string[]> = {
    ok: ['M20 6 9 17l-5-5'],
    target: ['M12 22a10 10 0 1 0 0-20a10 10 0 0 0 0 20z', 'M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12z', 'M12 14a2 2 0 1 0 0-4a2 2 0 0 0 0 4z'],
    flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
    medal: ['M12 15a6 6 0 1 0 0-12a6 6 0 0 0 0 12z', 'M8.2 13.9 7 22l5-3 5 3-1.2-8.1'],
  };
  const tile = (icon: string, value: string, label: string, _bg: string, i: number) => (
    <div className="lt-tile" style={{ animationDelay: `${i * 0.06}s`, padding: '16px', borderRadius: '20px', backgroundColor: TH.white, boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{(GOLD_IC[icon] || GOLD_IC.ok).map((d, k) => <path key={k} d={d} />)}</svg>
      </span>
      <span style={{ fontFamily: TH.serif, fontSize: '32px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: '14px', color: TH.muted }}>{label}</span>
    </div>
  );
  const h2 = (t: string) => <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '28px' }}>{t}</h2>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 16px 0 10px', borderRadius: '999px', border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)', color: TH.brown, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Zurück</button>
      {/* Kopf */}
      <section className="lt-stat-hero" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '22px', padding: '26px', borderRadius: '28px', backgroundColor: '#4B2A14', backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1.4px), radial-gradient(ellipse 80% 60% at 100% 0, rgba(255,199,44,.2), rgba(255,199,44,0) 60%)', backgroundSize: '6px 6px, auto', color: '#FFF6E0', boxShadow: '0 18px 32px -16px rgba(75,42,20,.7)' }}>
        <Ring pct={levelPct} color={TH.yellow} size={150}>
          <span className={avatarClass} style={{ fontSize: '48px', lineHeight: 1 }}>{avatar || levelIcon}</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#F0D9AE', maxWidth: '96px', lineHeight: 1.2, marginTop: '2px' }}>{levelPct} % zur nächsten Stufe</span>
        </Ring>
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: TH.yellow }}>Meine Statistik</span>
          <span style={{ fontFamily: TH.serif, fontSize: '40px', lineHeight: 1.05 }}>{name}</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>{levelIcon} {levelTitle} · {points.toLocaleString('de-DE')} Punkte</span>
          <span style={{ fontSize: '15px', color: '#F0D9AE' }}>{nextInfo}</span>
        </div>
      </section>
      {/* Kacheln */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        {tile('ok', right.toLocaleString('de-DE'), 'richtige Antworten', TH.tintSage, 0)}
        {tile('target', `${quote} %`, 'Trefferquote', TH.tintBlue, 1)}
        {tile('flame', String(streakNow), `${streakNow === 1 ? 'Tag' : 'Tage'} Serie (Rekord ${streakBest})`, TH.tintPeach, 2)}
        {tile('medal', `${badgesEarned}/${badgesTotal}`, 'Abzeichen', '#FFF0C2', 3)}
      </div>
      {/* Bereiche */}
      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {h2('Deine Lernbereiche')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
          {cats.map((c, i) => (
            <button key={c.c} onClick={() => onPractice(c.c)} className="lt-card lt-tile" style={{ animationDelay: `${i * 0.08}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 10px', borderRadius: '20px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, cursor: 'pointer', color: TH.ink }}>
              <Ring pct={c.pct} size={120} stroke={13} color={pctColor(c.pct)}>
                <span style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1 }}>{`${c.pct}%`}</span>
                <span style={{ fontSize: '11px', color: TH.muted, fontWeight: 700 }}>gemeistert</span>
              </Ring>
              <span style={{ fontWeight: 800, fontSize: '16px', textAlign: 'center' }}>{c.c}</span>
              <span style={{ fontSize: '13px', color: TH.muted }}>{c.mastered} von {c.total} gemeistert{c.hit !== null ? ` · ${c.hit} % Treffer` : ''}</span>
            </button>
          ))}
        </div>
        <span style={{ fontSize: '14px', color: TH.muted }}>Tipp: Antippen startet ein Quiz in diesem Bereich.</span>
      </section>
      {/* Stärken / Üben */}
      {(strong.length > 0 || weak.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[{ t: 'Da bist du stark', list: strong, bg: TH.tintSage }, { t: 'Hier lohnt sich Üben', list: weak, bg: TH.tintPeach }].filter(b => b.list.length).map(b => (
            <section key={b.t} style={{ padding: '20px', borderRadius: '24px', backgroundColor: b.bg, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '19px' }}>{b.t}</div>
              {b.list.map((x, i) => (
                <div key={x.c} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}><span>{x.c}</span><span>{x.pct} %</span></div>
                  <div style={{ height: '12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,.7)', overflow: 'hidden' }}>
                    <div className="lt-bar-grow" style={{ animationDelay: `${0.2 + i * 0.1}s`, width: `${Math.max(4, x.pct)}%`, height: '100%', borderRadius: '999px', backgroundColor: pctColor(x.pct) }} />
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
      {/* 14 Tage */}
      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {h2('Deine letzten 14 Tage')}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '170px', padding: '0 2px' }}>
          {days.map((d, i) => {
            const h = d.pts > 0 ? Math.max(8, Math.round((d.pts / maxPts) * 130)) : 4;
            const isToday = i === days.length - 1;
            return (
              <div key={d.k} title={`${d.pts} Punkte`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                {d.pts > 0 && <span style={{ fontSize: '11px', fontWeight: 700, color: TH.muted }}>{d.pts}</span>}
                <div className="lt-col-grow" style={{ animationDelay: `${i * 0.04}s`, width: '100%', maxWidth: '34px', height: `${h}px`, borderRadius: '8px 8px 4px 4px', backgroundColor: d.pts > 0 ? (isToday ? '#1F140C' : TH.yellow) : TH.line, boxShadow: d.pts > 0 && !isToday ? 'inset 0 -3px 0 rgba(185,138,10,.35)' : 'none' }} />
                <span style={{ fontSize: '12px', fontWeight: isToday ? 800 : 500, color: isToday ? TH.ink : TH.muted }}>{d.label}</span>
                <span aria-hidden="true" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: learned.has(d.k) ? TH.green : 'transparent' }} />
              </div>
            );
          })}
        </div>
        <span style={{ fontSize: '14px', color: TH.muted }}>Balken: Punkte pro Tag · grüner Punkt: an dem Tag gelernt</span>
      </section>
      {/* Lieblingsspiele */}
      {topGames.length > 0 && (
        <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {h2('Hier holst du deine Punkte')}
          {topGames.map(([g, v], i) => (
            <div key={g} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 38%) 1fr auto', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g}</span>
              <div style={{ height: '16px', borderRadius: '999px', backgroundColor: TH.line, overflow: 'hidden' }}>
                <div className="lt-bar-grow" style={{ animationDelay: `${0.1 + i * 0.08}s`, width: `${Math.max(4, Math.round((v / topMax) * 100))}%`, height: '100%', borderRadius: '999px', backgroundColor: TH.yellow }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800 }}>{v.toLocaleString('de-DE')}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}


// ───────────────────────── Kurze Einführung für Neue ─────────────────────────
const INTRO_SLIDES = [
  { icon: '👋', anim: 'lt-emo-shake', title: 'Willkommen in der Lern-Theke!', text: 'Hier lernst du alles, was du an der Theke brauchst: unsere Produkte, Allergene, Beratung und Hygiene. In kleinen Häppchen, wann immer du Zeit hast.', bg: '#FFF0C2' },
  { icon: '📚', anim: 'lt-emo-bob', title: 'Lernen', text: 'Du beantwortest Fragen und siehst nach jeder Antwort die Erklärung. Was du falsch hattest, kommt in deinen Fehler-Stapel und taucht später noch einmal auf. So bleibt es hängen.', bg: '#DDE6F7' },
  { icon: '🎮', anim: 'lt-dice-idle', title: 'Spielen', text: 'Theken-Simulator, Bilderquiz, Quiz Battle und mehr. Viele Spiele zählen auch fürs Lernen: richtig beantwortet ist richtig beantwortet.', bg: '#E1EEDC' },
  { icon: '⭐', anim: 'lt-emo-twinkle', title: 'Punkte und Stufen', text: 'Für richtige Antworten gibt es Punkte. Damit steigst du Stufe für Stufe auf, vom Neuling bis zur Hinkel-Ikone. In deiner ersten Woche gibt es keine Minuspunkte.', bg: '#FCE1D2' },
  { icon: '🪙', anim: 'lt-coin', title: 'Trinkgeld und Laden', text: 'Trinkgeld bekommst du im Theken-Simulator, jeden Tag fürs Vorbeischauen und am Glücksrad. Oben beim 🪙 öffnest du den Laden und kaufst dir Zeichen, Farben und Joker.', bg: '#FFF0C2' },
];
export function IntroTour({ name, onDone }: { name: string; onDone: () => void }) {
  const [i, setI] = useState(0);
  const sl = INTRO_SLIDES[i]; const last = i === INTRO_SLIDES.length - 1;
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 106, backgroundColor: 'rgba(43,23,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Kurze Einführung" style={{ width: '100%', maxWidth: '520px', backgroundColor: TH.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
        <div key={'h' + i} className="lt-intro-head" style={{ backgroundColor: sl.bg, padding: '30px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span className={sl.anim} style={{ fontSize: '72px', lineHeight: 1, display: 'inline-block' }} aria-hidden="true">{sl.icon}</span>
        </div>
        <div key={'b' + i} className="lt-intro-body" style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>{i === 0 ? `Hallo ${name}!` : sl.title}</div>
          {i === 0 && <div style={{ fontWeight: 800, fontSize: '18px', color: TH.brown }}>{sl.title}</div>}
          <div style={{ fontSize: '18px', lineHeight: 1.5, color: TH.ink }}>{sl.text}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '6px 0' }} aria-hidden="true">
            {INTRO_SLIDES.map((_, k) => <span key={k} style={{ width: k === i ? '26px' : '10px', height: '10px', borderRadius: '999px', backgroundColor: k === i ? TH.brown : TH.line, transition: 'width .3s' }} />)}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {i > 0 ? <button onClick={() => setI(i - 1)} style={{ ...btnSecondary, flex: '0 0 auto' }}>Zurück</button> : <button onClick={onDone} style={{ ...btnSecondary, flex: '0 0 auto' }}>Überspringen</button>}
            <button autoFocus onClick={() => (last ? onDone() : setI(i + 1))} style={{ ...btnPrimary, flex: 1 }}>{last ? 'Los geht’s! 🚀' : 'Weiter'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Hilfe: So funktioniert die Lern-Theke ─────────────────────────
export function HilfeView({ levels, jokers, onTour, onBack, onInstall }: { levels: { min: number; title: string; icon: string }[]; jokers: { icon: string; label: string; desc?: string }[]; onTour: () => void; onBack: () => void; onInstall: () => void }) {
  const box = (icon: string, title: string, body: ReactNode, i: number, open = false) => (
    <details key={title} className="lt-fold lt-tile" open={open} style={{ ...cardStyle, padding: 0, animationDelay: `${i * 0.04}s` }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', minHeight: '60px' }}>
        <span className="lt-cat-emo" style={{ fontSize: '30px', lineHeight: 1, animationDelay: `${-i * 0.4}s` }} aria-hidden="true">{icon}</span>
        <span style={{ flex: 1, fontFamily: TH.serif, fontSize: '24px', lineHeight: 1.1 }}>{title}</span>
        <span className="lt-fold-arrow" aria-hidden="true" style={{ fontSize: '20px' }}>▾</span>
      </summary>
      <div style={{ padding: '0 20px 18px', fontSize: '17px', lineHeight: 1.55, color: TH.ink, display: 'flex', flexDirection: 'column', gap: '10px' }}>{body}</div>
    </details>
  );
  const row = (a: string, b: string) => <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '12px', backgroundColor: '#FBF6EC' }}><span>{a}</span><strong style={{ whiteSpace: 'nowrap' }}>{b}</strong></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 16px 0 10px', borderRadius: '999px', border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)', color: TH.brown, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Zurück</button>
      <PageHead title="So funktioniert die Lern-Theke" subtitle="Alles Wichtige zum Nachlesen. Tippe auf ein Thema." />
      <button onClick={onTour} className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
        {KUEKEN_IMG ? <img src={KUEKEN_IMG} alt="" aria-hidden="true" className="lt-loaded" style={{ width: '44px', height: 'auto', background: 'none', animation: 'none' }} /> : null}
        <span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 800, fontSize: '18px' }}>Einführung noch einmal ansehen</span><span style={{ display: 'block', fontSize: '15px', color: TH.brown }}>5 kurze Seiten, eine Minute</span></span>
        <span aria-hidden="true" style={{ fontSize: '22px' }}>›</span>
      </button>
      {box('🧭', 'Was ist was? Kurz erklärt', <>
        {row('⭐ Punkte', 'für die Bestenliste und deine Stufe')}
        {row('🪜 Stufe', 'steigt mit deinen Punkten, vom Neuling an')}
        {row('🎖️ Rang', 'zeigt, wie viel Prozent aller Fragen du gemeistert hast')}
        {row('🧺 Brotkorb', 'füllt sich mit gemeisterten Quizfragen')}
        {row('🪙 Trinkgeld', 'Geld für den Laden: Zeichen, Farben, Joker')}
        {row('💎 Schatzkammer', 'dort bezahlst du mit Punkten statt mit Trinkgeld')}
        {row('🃏 Joker', 'helfen im Quiz oder im Battle, kaufst du im Laden')}
        {row('🎫 Rubbellos', 'im Laden kaufen, auf der Startseite freirubbeln')}
        {row('🏅 Abzeichen', 'für besondere Erfolge, siehst du im Abzeichen-Album')}
        {row('👑 Krone', 'für die meisten Punkte in einem Monat')}
      </>, 0, true)}
      {box('⭐', 'Punkte', <>
        <div>Für jede richtige Antwort gibt es Punkte, schwere Fragen bringen mehr:</div>
        {row('Quiz, leichte / schwere Frage', '+10 / +20')}
        {row('Tages-Challenge und Saison-Quiz', '+15 / +30')}
        {row('Experten-Ecke und Produkt der Woche', '+20 / +40')}
        {row('Falsche Antwort (ab der zweiten Woche)', '−10 / −15')}
        <div>Eine Runde fällt nie unter 0 Punkte. Auch Spiele bringen Punkte für die Bestenliste.</div>
        <div><strong>⚡ Combo-Bonus:</strong> In jedem Spiel und Quiz zählt, wie viele richtige Antworten du am Stück hast. Alle 5 richtigen in Folge gibt es mehr: ab 5 ×1,2, ab 10 ×1,4, ab 15 ×1,6, ab 20 ×1,8, ab 25 höchstens ×2,0. Jede Antwort zählt einzeln mit dem Faktor, den du gerade hast. Eine falsche Antwort setzt die Combo zurück.</div>
      </>, 0)}
      {box('🪜', 'Stufen', <>
        <div>Mit deinen Punkten steigst du auf. Es gibt {levels.length} Stufen:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
          {levels.map((l, i) => <div key={l.title} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px', backgroundColor: i % 2 ? TH.white : TH.tintYellow, fontSize: '15px' }}><span aria-hidden="true">{l.icon}</span><span style={{ flex: 1 }}>{i + 1}. {l.title}</span><span style={{ color: TH.muted }}>{l.min.toLocaleString('de-DE')}</span></div>)}
        </div>
      </>, 1)}
      {box('🪙', 'Trinkgeld und Laden', <>
        <div>Trinkgeld kommt so in deine Kasse:</div>
        {row('Theken-Simulator: freundlich, richtig rausgeben, gut beraten', 'bis 6,00 € am Tag')}
        {row('Anmelde-Belohnung, 7 Tage hintereinander', '0,20 € bis 1,00 €')}
        {row('Glücksrad, einmal pro Woche', 'mit Glück')}
        <div>Oben beim 🪙 öffnest du den <strong>Trinkgeld-Laden</strong>. Dort kaufst du Zeichen für deinen Namen, Bewegungen, Titel, Farben und Joker. Jeden Tag gibt es ein Angebot zum halben Preis. Gekauftes gehört dir für immer.</div>
      </>, 2)}
      {box('💎', 'Schatzkammer', <><div>Im Laden gibt es die Schatzkammer. Dort bezahlst du mit <strong>Punkten</strong>, nicht mit Trinkgeld: goldener Name, Bon-Rahmen, seltene Zeichen, eigene Markise und der „Spruch des Tages“, den der Ausbilder vorher freigibt.</div><div>Ausgegebene Punkte fehlen in der Gesamtwertung der Bestenliste. Deine Stufe, die Monatswertung und die Hall of Fame bleiben. Lohnt es sich, dafür ein paar Plätze abzurutschen? Das entscheidest du.</div><div>Im Quiz Battle kannst du außerdem einen <strong>Einsatz</strong> von 50, 100 oder 250 Punkten setzen: Wer gewinnt, bekommt ihn vom anderen.</div></>, 3)}
      {box('🃏', 'Joker', <>
        <div>Joker helfen dir einmal im Quiz oder Spiel. Du bekommst sie im Laden, am Glücksrad und an Tag 7 der Anmelde-Belohnung.</div>
        {jokers.map(j => <div key={j.label}><strong>{j.icon} {j.label}:</strong> {j.desc}</div>)}
      </>, 3)}
      {box('🎡', 'Glücksrad', <div>Einmal pro Woche (ab Montag) darfst du drehen. Zu gewinnen gibt es Joker, Trinkgeld und Extra-Punkte. Mit dem Joker „Extra-Dreh“ drehst du zusätzlich.</div>, 4)}
      {box('🔁', 'Fehler-Stapel', <div>Jede Frage, die du falsch beantwortest, landet hier. Sie kommt am nächsten Tag wieder, danach nach 3, nach 7 und nach 14 Tagen. Hast du sie dabei jedes Mal richtig, ist sie gelernt und raus. So lernst du genau das, was noch nicht sitzt.</div>, 5)}
      {box('🔥', 'Lern-Serie und Serien-Bonus', <><div>Jeder Tag, an dem du etwas lernst oder spielst, verlängert deine Serie. Sonntags ist die Bäckerei zu, ein Sonntag ohne Lernen unterbricht die Serie deshalb nicht. Lässt du einen anderen Tag aus, fängt sie wieder bei 1 an.</div><div>Je länger deine Serie, desto mehr Punkte bekommst du:</div>{row('Tag 1', '×1,0')}{row('Tag 2', '×1,1')}{row('Tag 3', '×1,2')}{row('Tag 4', '×1,3')}{row('Tag 5', '×1,4')}{row('ab Tag 6', '×1,5')}</>, 6)}
      {box('🏅', 'Abzeichen', <div>Für besondere Leistungen gibt es Abzeichen, zum Beispiel für Serien, viele richtige Antworten oder alle Produkte im Bilderquiz. Ein paar sind geheim. Alle siehst du im Abzeichen-Album unter „Dein Fortschritt“ auf der Startseite.</div>, 7)}
      {box('🎖️', 'Hinkel-Meister', <div>Wer 100 % aller Fragen gemeistert hat, wird Hinkel-Meister: goldener Rahmen um die Punktekarte, 🎖️ vor dem Namen in der Bestenliste und die Meister-Runde unter Lernen mit 15 schweren Fragen und dreifachen Punkten, so oft man will. Ab 90 % zeigt die App, wie viele Fragen noch fehlen.</div>, 8)}
      {box('🆕', 'Neu im Sortiment', <div>Legt der Ausbilder ein neues Produkt an, erscheint es sofort in den Steckbriefen und in den Spielen. Drei Wochen lang gibt es auf der Startseite die Kachel „Neu im Sortiment“ mit einem kurzen Quiz dazu.</div>, 8)}
      {box('👑', 'Bestenliste und Monatsmeister', <div>In der Bestenliste siehst du Gesamtpunkte, den aktuellen Monat und mehr. Wer am Monatsende vorne liegt, wird Monatsmeister, bekommt eine Krone, 2,00 € Trinkgeld und kommt in die Hall of Fame.</div>, 8)}
      {box('📋', 'Erste Woche', <div>Neue Kolleginnen und Kollegen bekommen einen Plan für die ersten 5 Tage. Vieles hakt sich beim Üben von selbst ab, den Rest hakst du selbst ab.</div>, 9)}
      {box('⚑', 'Fehler gefunden?', <div>Unter jeder Frage gibt es „Fehler melden“. Dein Ausbilder sieht die Meldung und korrigiert die Frage.</div>, 10)}
      {box('📱', 'App aufs Handy und größere Schrift', <><div>So legst du die Lern-Theke wie eine App auf dein Handy oder Tablet. Mit „A+“ oben wird die Schrift größer.</div><button onClick={onInstall} style={{ ...btnSecondary, alignSelf: 'flex-start' }}>📱 Anleitung zeigen</button></>, 11)}
    </div>
  );
}


/** Gekreuzte Schwerter im 3D-Look (gleich wie unten in der Leiste) */
export function Swords3D({ size = 22 }: { size?: number }) {
  const one = (m: boolean) => { const X = (x: number) => (m ? 32 - x : x); const P = (pts: number[][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${p[1]}`).join(' ') + ' Z';
    return <g><path d={P([[8.5, 20.5], [27, 5], [11.5, 23.5]])} fill="url(#sw3Blade)" stroke="#4E5A68" strokeWidth=".6" strokeLinejoin="round" /><path d={`M${X(10.4)} 21.6 L${X(24.6)} 7.4`} stroke="rgba(255,255,255,.85)" strokeWidth=".8" /><path d={`M${X(6.4)} 18.4 L${X(13.6)} 25.6`} stroke="#FFC72C" strokeWidth="4" strokeLinecap="round" /><path d={`M${X(9.3)} 22.7 L${X(5.9)} 26.1`} stroke="#5A2E12" strokeWidth="4" strokeLinecap="round" /><circle cx={X(4.9)} cy="27.1" r="2.2" fill="url(#sw3Pommel)" /></g>; };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,.4))' }}>
      <defs>
        <linearGradient id="sw3Blade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#C9D2DC" /><stop offset="1" stopColor="#6B7685" /></linearGradient>
        <radialGradient id="sw3Pommel" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#FFF6C8" /><stop offset=".55" stopColor="#FFC72C" /><stop offset="1" stopColor="#8A6200" /></radialGradient>
      </defs>
      {one(false)}{one(true)}
    </svg>
  );
}

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
function LosIcon3D({ id }: { id: string }) {
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
export function ScratchCard({ prize, onRevealed }: { prize: LosPrize; onRevealed: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);
  const [bag, setBag] = useState<'zu' | 'reisst' | 'offen'>('zu');
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = 300; c.height = 180;
    const rare = prize.id === 'p5000';
    const g = ctx.createLinearGradient(0, 0, 300, 180);
    if (rare) { g.addColorStop(0, '#6A1FD1'); g.addColorStop(0.5, '#E6B3FF'); g.addColorStop(1, '#A0187A'); }
    else { g.addColorStop(0, '#E0A400'); g.addColorStop(0.45, '#FFE58A'); g.addColorStop(0.55, '#FFF3C4'); g.addColorStop(1, '#C98A00'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, 300, 180);
    if (rare) { ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc((i * 73) % 300, (i * 47) % 180, 1.5 + (i % 3), 0, Math.PI * 2); ctx.fill(); } }
    ctx.fillStyle = rare ? 'rgba(255,255,255,.95)' : 'rgba(75,42,20,.8)'; ctx.font = '800 22px "Bricolage Grotesque", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(rare ? 'Goldlos: hier rubbeln' : 'Hier rubbeln', 150, 98);
  }, []);
  const scratch = (e: any) => {
    if (!drawing.current || doneRef.current) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 300, y = ((e.clientY - r.top) / r.height) * 180;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
    const data = ctx.getImageData(0, 0, 300, 180).data;
    let clear = 0; for (let i = 3; i < data.length; i += 64) if (data[i] === 0) clear++;
    if (clear / (data.length / 64) > 0.45) { doneRef.current = true; setDone(true); ctx.clearRect(0, 0, 300, 180); onRevealed(); }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '300px', aspectRatio: '300 / 180', borderRadius: '20px', overflow: bag === 'offen' ? 'hidden' : 'visible', backgroundColor: prize.id === 'p5000' ? '#FBF3FF' : '#FFFFFF', border: prize.id === 'p5000' ? '3px solid #9B30D9' : 'none', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 12px 26px -16px rgba(31,20,12,.45)' }}>
        {prize.id === 'p5000' && bag !== 'offen' && <span className="lt-rare-badge">SELTENES GOLDLOS</span>}
        {prize.id === 'p5000' && done && <ConfettiOverlay active />}
        {bag !== 'offen' && (
          <button onClick={() => { if (bag !== 'zu') return; setBag('reisst'); window.setTimeout(() => setBag('offen'), 900); }} aria-label="Tüte an der Ecke öffnen" className={`lt-bag${bag === 'reisst' ? ' lt-bag-open' : ''}${prize.id === 'p5000' ? ' lt-bag-rare' : ''}`}>
            <span className="lt-bag-top" aria-hidden="true" />
            <span className="lt-bag-body">{BAG_LOGO ? <img className="lt-logo" src={BAG_LOGO} alt="" style={{ width: '74px', height: 'auto', cursor: 'pointer' }} /> : <><span style={{ fontSize: '30px' }} aria-hidden="true">🥨</span><span style={{ fontWeight: 800, letterSpacing: '3px' }}>HINKEL</span></>}<span style={{ fontSize: '14px' }}>Ecke abziehen ↗</span></span>
          </button>
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', padding: '10px' }}>
          {prize.id === 'niete' && KUEKEN_IMG ? <img className="lt-logo lt-emo-bob" src={KUEKEN_IMG} alt="" style={{ width: '62px', height: 'auto', cursor: 'default' }} /> : <span className={done ? 'lt-pop-in' : undefined} style={{ display: 'inline-flex' }}><LosIcon3D id={prize.id} /></span>}
          <strong style={{ fontFamily: TH.serif, fontSize: prize.id === 'p5000' ? '24px' : '22px', color: prize.id === 'p5000' ? '#7B2FF7' : '#2B170A' }}>{prize.label}</strong>
        </div>
        <canvas ref={ref} onPointerDown={(e) => { drawing.current = true; (e.target as HTMLCanvasElement).setPointerCapture?.(e.pointerId); scratch(e); }} onPointerMove={scratch} onPointerUp={() => { drawing.current = false; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
      </div>
      <ConfettiOverlay active={done && prize.id !== 'niete'} />
      <span style={{ fontSize: '15px', color: TH.muted }}>{done ? (prize.id === 'niete' ? 'Schade! Viel Glück beim nächsten Los.' : prize.id === 'p5000' ? 'Wahnsinn! Das gibt es nur etwa bei jedem 20. Los. Schon gutgeschrieben.' : 'Gewonnen! Ist schon gutgeschrieben.') : prize.id === 'p5000' ? 'Ein seltenes Goldlos! Rubbel es frei.' : 'Mit dem Finger frei rubbeln.'}</span>
    </div>
  );
}

// ───────── Abzeichen-Album (Buch zum Blättern) ─────────
export function BadgeAlbumView({ badges, perPage = 6 }: { badges: Badge[]; perPage?: number }) {
  const pages = Math.max(1, Math.ceil(badges.length / perPage));
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<'l' | 'r'>('r');
  const [turns, setTurns] = useState(0);
  const go = (d: number) => { const n = page + d; if (n < 0 || n >= pages) return; setDir(d > 0 ? 'r' : 'l'); setPage(n); setTurns(t => t + 1); };
  const items = badges.slice(page * perPage, page * perPage + perPage);
  const startX = useRef<number | null>(null);
  return (
    <div style={{ perspective: '1400px' }}>
      <div key={page} className={`lt-flip-${dir}`} onTouchStart={(e) => { startX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (startX.current == null) return; const dx = e.changedTouches[0].clientX - startX.current; startX.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}
        style={{ position: 'relative', padding: '20px 18px 14px', borderRadius: '24px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', transformOrigin: dir === 'r' ? 'left center' : 'right center', transformStyle: 'preserve-3d' }}>
        {turns > 0 && <span key={'leaf' + turns} className={`lt-leaf lt-leaf-${dir}`} aria-hidden="true" />}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
          {items.map((b, i) => (
            <div key={b.id} title={b.desc} className={b.ok ? 'lt-shine' : undefined} style={{ ['--shd' as any]: `${i * 0.7}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 8px', borderRadius: '16px', textAlign: 'center', border: b.ok ? '1px solid #F1E3C8' : '1.5px dashed #E3D6BE', backgroundColor: b.ok ? '#FFFBF0' : 'transparent', transform: `rotate(${0 * i}deg)` }}>
              <span style={{ width: '62px', height: '62px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', lineHeight: 1, backgroundColor: b.ok ? '#1F140C' : '#F6EFE2', boxShadow: b.ok ? '0 0 0 3px #FFC72C, 0 8px 16px -8px rgba(31,20,12,.6)' : 'none', color: '#B8A68C' }}>{b.ok ? b.icon : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>}</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: b.ok ? '#2B170A' : TH.muted }}>{b.title}</span>
              <span style={{ fontSize: '13px', color: TH.muted, lineHeight: 1.3 }}>{b.desc}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }} aria-label={`Seite ${page + 1} von ${pages}`}>{Array.from({ length: pages }, (_, k) => <span key={k} style={{ width: k === page ? '22px' : '8px', height: '8px', borderRadius: '8px', backgroundColor: k === page ? '#1F140C' : '#E3D6BE', transition: 'width .3s ease' }} />)}</div>
      </div>
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
          <button onClick={() => go(-1)} disabled={page === 0} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: 'none', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '16px', fontWeight: 700, cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.3 : 1 }}>‹ Zurück</button>
          <button onClick={() => go(1)} disabled={page >= pages - 1} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: 'none', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '16px', fontWeight: 700, cursor: page >= pages - 1 ? 'default' : 'pointer', opacity: page >= pages - 1 ? 0.3 : 1 }}>Weiter ›</button>
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
export const PRAISE_TEXTS = ['👏 Super gemacht!', '🌟 Weiter so, ich bin stolz auf dich!', '🥨 Klasse Fortschritt diese Woche!', '💪 Du bist auf einem richtig guten Weg!', '🏆 Spitze, du gehörst zu den Besten!'];
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
        <BadgeAlbumView badges={d.badges} />
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
