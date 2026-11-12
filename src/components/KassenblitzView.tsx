import { useState, useEffect, useRef } from 'react';
import { dc } from '../data';
import { shuffleArray } from '../utils';
import { focusShuffle, noteResult } from '../focus';
import { SHOP_PRODUCTS } from '../shopProducts';
import { ALT_MAP } from '../data';
import { GameProgress, TH, cardStyle, btnPrimary, PageHead, StatChip, GameIntro, GameResult, productImageKey, ProductImages, AnswerFx, AnswerFxState, ConfettiOverlay, ReportLink, ReportList, ReportContext, scrollToPlay, starsFor } from './minigameUtils';

/** Versionsnummer dieser Datei, muss zur App.tsx passen (wird unten in der App angezeigt) */
export const GAMES_VERSION: number = 65;

/** Nach „Weiter“: zur Spielkarte (Foto) scrollen statt ganz nach oben */
const scrollToCard = () => window.setTimeout(() => {
  const el = document.getElementById('lt-game-card');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}, 60);

// ───────── Spielen zählt fürs Lernen: Spiel-Antworten haken die passenden Katalog-Fragen ab ─────────
export type LearnKind = 'inhalt' | 'preis' | 'mehl' | 'schnitt' | 'alternative' | 'allergene' | 'beschreibung' | 'gruppe';
export type LearnItem = { product: string; kind: LearnKind };
/** Gibt zurück, wie viele Fragen dadurch NEU gemeistert wurden */
export type OnLearn = (items: LearnItem[]) => number;
export const LEARN_PATTERNS: Record<LearnKind, RegExp> = {
  inhalt: /^Ein Kunde fragt, was in „/,
  preis: /^Was kostet „/,
  mehl: /^Wie setzt sich das Mehl/,
  schnitt: /^Mit welcher Schnittstärke/,
  alternative: /ausverkauft\. Welche Alternative/,
  allergene: /^Welche Allergene sind bei „/,
  beschreibung: /^Welche Beschreibung passt zu „/,
  gruppe: /^Zu welcher Warengruppe gehört „/,
};

/** Kleiner Hinweis im Spiel: „Zählt fürs Lernen“ */
export function LearnHint({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', borderRadius: '16px', backgroundColor: TH.tintBlue, fontSize: '16px', lineHeight: 1.45, color: TH.ink }}>
      <span style={{ fontSize: '22px', lineHeight: 1 }} aria-hidden="true">📚</span>
      <span><strong>Zählt fürs Lernen:</strong> {text}</span>
    </div>
  );
}
// ───────── Vorlesen (Sprachausgabe des Geräts, funktioniert ohne Internet) ─────────
const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof (window as any).SpeechSynthesisUtterance !== 'undefined';
// Beste deutsche Stimme des Geräts wählen: natürliche/Premium-Stimmen zuerst
let cachedVoice: SpeechSynthesisVoice | null = null;
const VOICE_PREFS = [/natural|neural|online/i, /premium/i, /enhanced|erweitert|verbessert/i, /google/i, /anna|helena|petra|katja|vicki|marlene|conrad|markus|yannick/i];
function bestGermanVoice(): SpeechSynthesisVoice | null {
  if (!canSpeak()) return null;
  const all = window.speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('de'));
  if (!all.length) return null;
  const score = (v: SpeechSynthesisVoice) => {
    let sc = 0;
    VOICE_PREFS.forEach((re, i) => { if (re.test(v.name)) sc += (VOICE_PREFS.length - i) * 10; });
    if (/de-de/i.test(v.lang.replace('_', '-'))) sc += 3;
    if (/compact|eloquence|grandma|grandpa|oma|opa/i.test(v.name)) sc -= 40;
    return sc;
  };
  return [...all].sort((a, b) => score(b) - score(a))[0];
}
if (canSpeak()) {
  try { window.speechSynthesis.addEventListener('voiceschanged', () => { cachedVoice = bestGermanVoice(); }); } catch {}
}
export function speakText(text: string, onEnd?: () => void) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  if (!cachedVoice) cachedVoice = bestGermanVoice();
  const u = new SpeechSynthesisUtterance(text.replace(/[„“"]/g, '').replace(/·/g, ',').replace(/\s+/g, ' ').trim());
  u.lang = 'de-DE';
  // Wie ein freundlicher Verkäufer: zügig, etwas heller und lebendig statt langsam und müde
  u.rate = 1.15;
  u.pitch = 1.1;
  u.volume = 1;
  if (cachedVoice) u.voice = cachedVoice;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
}
export function stopSpeaking() { if (canSpeak()) window.speechSynthesis.cancel(); }

/** Knopf „Vorlesen“ – liest den Text vor, zweiter Tipp stoppt */
export function SpeakButton({ text, label = 'Vorlesen', small }: { text: string; label?: string; small?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => () => { stopSpeaking(); }, []);
  useEffect(() => { setOn(false); stopSpeaking(); }, [text]);
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      onClick={() => { if (on) { stopSpeaking(); setOn(false); } else { setOn(true); speakText(text, () => setOn(false)); } }}
      aria-pressed={on}
      title={on ? 'Vorlesen stoppen' : 'Vorlesen'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: small ? '38px' : '44px', padding: small ? '0 10px' : '0 14px', borderRadius: '12px', border: `2px solid ${on ? TH.brown : TH.line}`, backgroundColor: on ? TH.tintYellow : TH.white, color: TH.ink, fontSize: small ? '14px' : '16px', fontWeight: 700, cursor: 'pointer', flex: '0 0 auto' }}
    >
      <span aria-hidden="true">{on ? '⏹' : '🔊'}</span>{on ? 'Stopp' : label}
    </button>
  );
}

// ───────── „Nur neue …“: schon richtig Gelöstes kommt nicht nochmal ─────────
/** Pro Spiel gespeicherte Schlüssel (in der Cloud unter progress[user]._known) */
export type KnownMap = Record<string, string[]>;
export type OnKnown = (game: string, keys: string[]) => void;

/** Schalter wird pro Gerät und Spiel gemerkt, Standard: an */
function useOnlyNew(game: string): [boolean, () => void] {
  const key = `hinkel_only_new_${game}`;
  const [on, setOn] = useState<boolean>(() => { try { return localStorage.getItem(key) !== '0'; } catch { return true; } });
  const toggle = () => setOn(v => { const n = !v; try { localStorage.setItem(key, n ? '1' : '0'); } catch {} return n; });
  return [on, toggle];
}

export function OnlyNewToggle({ on, onToggle, label, done, total, unit }: { on: boolean; onToggle: () => void; label: string; done: number; total?: number; unit: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ padding: '12px 16px', borderRadius: '16px', backgroundColor: TH.cream, border: `2px solid ${TH.line}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '17px', fontWeight: 700 }}>Schon geschafft</span>
          <span style={{ fontFamily: TH.serif, fontSize: '24px' }}>{total ? `${done} von ${total}` : `${done} ${unit}`}</span>
        </div>
        {total ? (
          <>
            <div style={{ height: '10px', backgroundColor: dc('#F4EADB'), borderRadius: '999px', overflow: 'hidden' }}>
              <div className="lt-fill" style={{ width: `${pct}%`, height: '100%', backgroundColor: TH.green, borderRadius: '999px' }} />
            </div>
            <span style={{ fontSize: '15px', color: TH.muted }}>{done >= total ? `Alle ${unit} geschafft, stark!` : `Noch ${total - done} ${unit} offen.`}</span>
          </>
        ) : <span style={{ fontSize: '15px', color: TH.muted }}>Jede Beratung ist eine Kombination aus Situation und Produkt, es gibt sehr viele davon.</span>}
      </div>
      <button onClick={onToggle} role="switch" aria-checked={on} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '16px', border: `2px solid ${on ? TH.brown : TH.line}`, backgroundColor: on ? TH.tintYellow : TH.white, color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
        <span aria-hidden="true" style={{ flex: '0 0 54px', height: '30px', borderRadius: '999px', backgroundColor: on ? TH.brown : dc('#D9CBB5'), position: 'relative', transition: 'background-color .2s ease' }}>
          <span style={{ position: 'absolute', top: '3px', left: on ? '27px' : '3px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), transition: 'left .2s ease' }} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: '18px', fontWeight: 700 }}>{label}</span>
          <span style={{ display: 'block', fontSize: '15px', color: TH.muted }}>{on ? 'Was du schon richtig hattest, kommt nicht nochmal.' : 'Alles kommt dran, auch das, was du schon kannst.'}</span>
        </span>
      </button>
    </div>
  );
}

/** „Alle am Stück“-Knopf unter dem Start-Knopf */
function AllAtOnceButton({ count, onClick, unit }: { count: number; onClick: () => void; unit: string }) {
  if (count <= 10) return null;
  return (
    <button onClick={onClick} style={{ ...btnPrimary, backgroundColor: TH.white, color: TH.ink, border: `2px solid ${TH.brown}` }}>
      Alle {count} {unit} am Stück
    </button>
  );
}
/** „Beenden“ während einer langen Runde */
function FinishEarlyButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ minHeight: '52px', padding: '0 16px', borderRadius: '16px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.muted, fontSize: '16px', fontWeight: 700, cursor: 'pointer', alignSelf: 'stretch' }}>
      Beenden & Auswertung
    </button>
  );
}

const learnedText = (n: number) => `📚 ${n} ${n === 1 ? 'Frage' : 'Fragen'} im Lernbereich abgehakt`;

/** Artikel mit festem Stückpreis aus dem Shop (in Cent), ohne „ab …“-Preise und sehr teure Artikel */
const kassenArtikel = () => SHOP_PRODUCTS
  .filter(p => p.price && !p.price.startsWith('ab') && !p.price.includes('('))
  .map(p => {
    const m = (p.price || '').match(/(\d+),(\d\d)/);
    return { name: p.name, cents: m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 0, small: p.group === 'Brötchen' || p.group === 'Feingebäck' };
  })
  .filter(a => a.cents > 0 && a.cents <= 1500);

type KassenPosten = { name: string; qty: number; cents: number };
const euro = (cents: number) => (cents / 100).toFixed(2).replace('.', ',') + ' €';

export function KassenblitzView({ onSaveScore }: { onSaveScore: (points: number, category: string) => void }) {
  const [kbState, setKbState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [kbTotal, setKbTotal] = useState<number>(0);
  const [kbGiven, setKbGiven] = useState<number>(0);
  const [kbOptions, setKbOptions] = useState<number[]>([]);
  const [kbBasket, setKbBasket] = useState<KassenPosten[]>([]);
  const [kbCorrectAns, setKbCorrectAns] = useState<number>(0);
  const [kbScore, setKbScore] = useState<number>(0);
  const [kbStreak, setKbStreak] = useState<number>(0);
  const [kbTimer, setKbTimer] = useState<number>(45);
  const [kbFx, setKbFx] = useState<AnswerFxState>(null);
  const [kbHistory, setKbHistory] = useState<{ basket: KassenPosten[]; total: number; given: number; right: number }[]>([]);
  // Aktuelle Werte für den Timer, so muss der Timer nach jeder Antwort nicht neu gestartet werden
  const kbScoreRef = useRef(0);
  // Falsche Antwort: kurz anhalten und zeigen, wie das Rückgeld richtig gerechnet wird (die Zeit läuft solange nicht weiter)
  const [kbMiss, setKbMiss] = useState<{ chosen: number; right: number; given: number; total: number } | null>(null);
  const kbMissRef = useRef(false);
  const kbMissTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(kbMissTimerRef.current), []);
  const onSaveScoreRef = useRef(onSaveScore);
  useEffect(() => { onSaveScoreRef.current = onSaveScore; }, [onSaveScore]);

  // Sekundentakt: läuft genau einmal pro Spiel
  useEffect(() => {
    if (kbState !== 'playing') return;
    const timer = window.setInterval(() => setKbTimer((prev) => (kbMissRef.current ? prev : Math.max(0, prev - 1))), 1000);
    return () => window.clearInterval(timer);
  }, [kbState]);

  // Zeit um → Ergebnis zeigen und Punkte genau einmal speichern
  useEffect(() => {
    if (kbState === 'playing' && kbTimer === 0) {
      setKbState('result');
      if (kbScoreRef.current >= 3) {
        onSaveScoreRef.current(kbScoreRef.current * 5, 'Kassenblitz ⚡');
      }
    }
  }, [kbState, kbTimer]);

  const generateKassenblitzRound = () => {
    // 1–3 verschiedene echte Artikel, Brötchen & Feingebäck auch mehrfach
    const count = 1 + Math.floor(Math.random() * 3);
    const picked = shuffleArray(kassenArtikel()).slice(0, count);
    const basket: KassenPosten[] = picked.map(a => ({ name: a.name, cents: a.cents, qty: a.small ? 1 + Math.floor(Math.random() * 4) : 1 }));
    const totalCents = basket.reduce((sum, b) => sum + b.cents * b.qty, 0);

    // Kunde zahlt mit dem nächsten passenden Schein, manchmal mit „krummem“ Betrag, damit das Wechselgeld glatt wird
    const notes = [500, 1000, 2000, 5000];
    let givenCents = notes.find(n => n > totalCents) || Math.ceil(totalCents / 1000) * 1000 + 1000;
    if (Math.random() > 0.65) {
      const rest = totalCents % 100;
      givenCents = rest === 0 ? totalCents + 100 : totalCents - rest + 100 + (Math.random() > 0.5 ? (rest > 50 ? 0 : 50) : 0);
      if (givenCents <= totalCents) givenCents = Math.ceil(totalCents / 100) * 100 + 100;
    }

    const correctCents = givenCents - totalCents;
    const opts = [correctCents];
    const tweaks = [-100, 100, -50, 50, -10, 10, -20, 20, -500, 500, -5, 5];
    for (const t of shuffleArray(tweaks)) {
      if (opts.length >= 4) break;
      const fake = correctCents + t;
      if (fake > 0 && !opts.includes(fake)) opts.push(fake);
    }
    setKbBasket(basket);
    setKbTotal(totalCents / 100);
    setKbGiven(givenCents / 100);
    setKbCorrectAns(correctCents / 100);
    setKbOptions(shuffleArray(opts.map(c => c / 100)));
  };

  const startKassenblitz = () => {
    kbScoreRef.current = 0;
    window.clearTimeout(kbMissTimerRef.current); kbMissRef.current = false; setKbMiss(null);
    setKbHistory([]);
    setKbFx(null);
    setKbScore(0);
    setKbStreak(0);
    setKbTimer(45);
    setKbState('playing'); scrollToPlay();
    generateKassenblitzRound();
  };

  const nextAfterMiss = () => {
    window.clearTimeout(kbMissTimerRef.current);
    kbMissRef.current = false; setKbMiss(null);
    generateKassenblitzRound();
  };

  const handleKassenblitzAnswer = (chosenOpt: number) => {
    if (kbState !== 'playing' || kbMissRef.current) return;
    const isCorrect = Math.abs(chosenOpt - kbCorrectAns) < 0.001;
    setKbHistory(h => [...h, { basket: kbBasket, total: kbTotal, given: kbGiven, right: kbCorrectAns }]);
    if (isCorrect) {
      kbScoreRef.current += 1;
      setKbScore(prev => prev + 1);
      setKbStreak(prev => prev + 1);
    } else {
      setKbStreak(0);
    }
    setKbFx({ k: Date.now(), ok: isCorrect, text: isCorrect ? '💶 Stimmt!' : '✗ Daneben', streak: isCorrect ? kbStreak + 1 : 0 });
    if (isCorrect) { generateKassenblitzRound(); return; }
    kbMissRef.current = true;
    setKbMiss({ chosen: chosenOpt, right: kbCorrectAns, given: kbGiven, total: kbTotal });
    kbMissTimerRef.current = window.setTimeout(nextAfterMiss, 2600);
  };

  const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <PageHead title="Kassenblitz" subtitle="Echte Hinkel-Artikel, echte Preise: Wie viel Rückgeld bekommt der Kunde? Schaffe so viele Kunden wie möglich in 45 Sekunden." />

      {kbState === 'menu' && (
        <GameIntro
          title="Bereit für die Kasse?"
          text="Du siehst einen Einkauf und den Betrag, den der Kunde gibt. Tippe so schnell wie möglich auf das richtige Rückgeld."
          hint="Ab 3 richtigen Kunden gibt es Punkte für die Bestenliste."
          startLabel="Kassenblitz starten (45 Sek.)"
          onStart={startKassenblitz}
        />
      )}

      {kbState === 'playing' && (
        <>
          <ReportContext report={{ game: 'Kassenblitz', product: kbBasket[0]?.name, text: `${kbBasket.map(b => `${b.qty} × ${b.name} (${euro(b.cents)})`).join(', ')}, zu zahlen ${fmt(kbTotal)}, Kunde gibt ${fmt(kbGiven)}`, detail: `Rückgeld laut App: ${fmt(kbCorrectAns)}` }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatChip label="Richtig" value={kbScore} />
            {(() => { const f = kbTimer / 45; const col = kbTimer <= 10 ? '#C0392B' : kbTimer <= 20 ? '#E07B00' : '#C9971C'; const R = 26, C = 2 * Math.PI * R; return (
              <div role="timer" aria-label={`Noch ${kbTimer} Sekunden`} className={kbTimer <= 10 ? 'lt-wrong' : undefined} key={kbTimer <= 10 ? kbTimer : 'r'} style={{ position: 'relative', width: '64px', height: '64px', flex: '0 0 auto' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(75,42,20,.13)" strokeWidth="7" />
                  <circle cx="32" cy="32" r={R} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - f)} style={{ transition: 'stroke-dashoffset 1s linear, stroke .4s ease' }} />
                </svg>
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '19px', color: kbTimer <= 10 ? col : 'inherit', fontVariantNumeric: 'tabular-nums' }}>{kbTimer}</span>
              </div>
            ); })()}
            <StatChip label="Serie" value={kbStreak} />
          </div>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
            <AnswerFx fx={kbFx} streakIcon="⚡" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 18px', borderRadius: '16px', backgroundColor: TH.cream, border: `1px solid ${TH.line}`, fontSize: '18px' }}>
              {kbBasket.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span>{b.qty} × {b.name}</span>
                  <span style={{ color: TH.muted, whiteSpace: 'nowrap' }}>{b.qty > 1 ? `je ${euro(b.cents)}` : euro(b.cents)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.tintYellow, textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Zu zahlen</div>
                <div style={{ fontFamily: TH.serif, fontSize: '42px', lineHeight: 1.1 }}>{fmt(kbTotal)}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.tintSage, textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Kunde gibt</div>
                <div style={{ fontFamily: TH.serif, fontSize: '42px', lineHeight: 1.1, color: TH.green }}>{fmt(kbGiven)}</div>
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>Wie viel Rückgeld bekommt der Kunde?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {kbOptions.map((opt, idx) => {
                const isRight = !!kbMiss && Math.abs(opt - kbMiss.right) < 0.001;
                const isChosen = !!kbMiss && Math.abs(opt - kbMiss.chosen) < 0.001;
                return (
                  <button key={idx} onClick={() => handleKassenblitzAnswer(opt)} disabled={!!kbMiss} style={{ minHeight: '76px', borderRadius: '18px', border: `3px solid ${isRight ? TH.green : isChosen ? TH.red : TH.line}`, backgroundColor: isRight ? TH.tintSage : isChosen ? TH.tintPeach : TH.white, color: TH.ink, fontFamily: TH.serif, fontSize: '30px', cursor: kbMiss ? 'default' : 'pointer', opacity: kbMiss && !isRight && !isChosen ? 0.45 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    {fmt(opt)}
                    {isChosen && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, color: TH.red }}>Deine Antwort</span>}
                    {isRight && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, color: TH.green }}>Richtig</span>}
                  </button>
                );
              })}
            </div>
            {kbMiss && (
              <div role="status" className="lt-pop-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintYellow, fontSize: '18px', lineHeight: 1.4 }}>
                <span style={{ flex: '1 1 220px' }}>Rückgeld wäre <strong>{fmt(kbMiss.right)}</strong> gewesen: {fmt(kbMiss.given)} − {fmt(kbMiss.total)} = {fmt(kbMiss.right)}. Die Zeit steht so lange.</span>
                <button onClick={nextAfterMiss} style={{ minHeight: '48px', padding: '0 18px', borderRadius: '14px', border: 'none', backgroundColor: TH.ink, color: TH.white, fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>Weiter →</button>
              </div>
            )}
          </div>
        </>
      )}

      {kbState === 'result' && (
        <GameResult
          title="Kassenblitz beendet"
          big={`${kbScore} Kunden`}
          text="in 45 Sekunden richtig abkassiert."
          reward={kbScore >= 3 ? `+${kbScore * 5} Punkte für die Bestenliste` : null}
          celebrate={kbScore >= 8}
          stars={kbScore >= 10 ? 3 : kbScore >= 6 ? 2 : kbScore >= 3 ? 1 : 0}
          againLabel={kbScore >= 3 ? 'Noch eine Runde' : 'Nochmal versuchen, ab 3 Kunden gibt es Punkte'}
          onAgain={startKassenblitz}
        />
      )}
      {kbState === 'result' && <ReportList title="Alle Kunden dieser Runde ansehen (Fehler melden)" items={kbHistory.map(h => {
        const list = h.basket.map(b => `${b.qty} × ${b.name} (${euro(b.cents)})`).join(', ');
        return { label: <span>{list}<br />Zu zahlen {fmt(h.total)} · Kunde gibt {fmt(h.given)} · Rückgeld <strong>{fmt(h.right)}</strong></span>, report: { game: 'Kassenblitz', product: h.basket[0]?.name, text: `${list}\nZu zahlen: ${fmt(h.total)}, Kunde gibt: ${fmt(h.given)}, Rückgeld laut App: ${fmt(h.right)}` } };
      })} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  THEKEN-SIMULATOR, Verkaufsgespräche im Chat, alles aus den echten Produktdaten
// ═══════════════════════════════════════════════════════════════════════════

type ShopItem = (typeof SHOP_PRODUCTS)[number];
type SimOpt = { text: string; correct: boolean; why?: string; noPad?: boolean };
type SimStep = { customer: string[]; options: SimOpt[]; topic: string; afterWrong?: string; prices?: BasketLine[]; learn?: LearnItem; tipStep?: boolean };
type BasketLine = { name: string; qty: number; cents: number };
type Persona = { name: string; title: string; who: string };
type Conversation = { persona: Persona; steps: SimStep[]; endLines: string[]; tipCents?: number; coreKey?: string; coreTopics?: string[] };
type ChatMsg = { from: 'customer' | 'seller' | 'note-ok' | 'note-bad'; text: string };

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const sample = <T,>(arr: T[], n: number): T[] => shuffleArray([...arr]).slice(0, n);
const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
/** n Ablenker, deren Namen ähnlich lang sind wie der richtige, so verrät die Länge nichts */
const closeByName = (list: ShopItem[], right: ShopItem, n: number): ShopItem[] =>
  sample(shuffleArray([...list]).sort((a, b) => Math.abs(a.name.length - right.name.length) - Math.abs(b.name.length - right.name.length)).slice(0, Math.max(n + 2, 5)), n);
const parseCents = (price?: string) => {
  if (!price || price.startsWith('ab') || price.includes('(')) return 0;
  const m = price.match(/(\d+),(\d\d)/);
  return m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 0;
};

const NOT_FOR_SALE = ['Sonstiges', 'Backmischung', 'Weihnachtsgebäck', 'Saisongebäck'];
const BUYABLE = SHOP_PRODUCTS.filter(p => !NOT_FOR_SALE.includes(p.group) && parseCents(p.price) > 0 && parseCents(p.price) <= 2000);
const BREADS = BUYABLE.filter(p => !!p.breadType);
const SWEETS = BUYABLE.filter(p => p.group === 'Feingebäck');
const ROLLS = BUYABLE.filter(p => p.group === 'Brötchen');

const SLICE: Record<string, string> = { schwarzbrot: '5,5 mm', roggen: '9 mm', roggenmisch: '9 mm', weizenmisch: '9 mm', dinkel: '9 mm', spezial: '9 mm', weizen: '12 mm', stuten: '12 mm' };
const TYPE_LABEL: Record<string, string> = { schwarzbrot: 'Vollkornschwarzbrot', roggen: 'Roggenbrot', roggenmisch: 'Roggenmischbrot', weizenmisch: 'Weizenmischbrot', dinkel: 'Dinkelbrot', spezial: 'Spezialbrot', weizen: 'Weizenbrot', stuten: 'Stuten & Brioche' };

const isNut = (a: string) => /^schalenfrüchte|mandel|pistazie|haselnu|walnu/i.test(a);
const ALLERGY_TARGETS: { key: string; label: string; verb: 'ist' | 'sind'; neg: string; says: string[] }[] = [
  { key: 'Milch', label: 'Milch', verb: 'ist', neg: 'keine Milch', says: ['Ich vertrage leider keine Milch.', 'Mein Sohn hat eine Milchallergie.', 'Bei mir darf keine Milch rein, Laktose und Milcheiweiß vertrage ich nicht.'] },
  { key: 'Nüsse', label: 'Nüsse', verb: 'sind', neg: 'keine Nüsse', says: ['Meine Tochter hat eine Nussallergie.', 'Ich bin allergisch gegen Nüsse und Mandeln.', 'Mein Mann verträgt überhaupt keine Nüsse.'] },
  { key: 'Sesamsamen', label: 'Sesam', verb: 'ist', neg: 'kein Sesam', says: ['Ich habe eine Sesam-Allergie.', 'Mein Enkel verträgt keinen Sesam.'] },
  { key: 'Eier', label: 'Ei', verb: 'ist', neg: 'kein Ei', says: ['Ich darf keine Eier essen.', 'Mein Sohn hat eine Ei-Allergie.'] },
];
const hasAllergen = (p: ShopItem, key: string) => key === 'Nüsse' ? p.allergens.some(isNut) : key === 'Sesamsamen' ? p.allergens.some(a => /^sesam/i.test(a)) : p.allergens.some(a => a === key || a.startsWith(key + ' '));
const allergenText = (p: ShopItem) => p.allergens.length ? p.allergens.map(a => a === 'Sesamsamen' ? 'Sesam' : a).join(', ') : 'keine';

const PERSONAS: Persona[] = [
  { name: 'Frau Schmitz', title: 'Frau Schmitz', who: 'Stammkundin, kommt jeden Morgen' },
  { name: 'Herr Becker', title: 'Herr Becker', who: 'Handwerker in der Frühstückspause' },
  { name: 'Frau Yilmaz', title: 'Frau Yilmaz', who: 'Mutter mit zwei Kindern' },
  { name: 'Herr Hoffmann', title: 'Herr Hoffmann', who: 'Rentner, liebt kräftiges Brot' },
  { name: 'Frau Wagner', title: 'Frau Wagner', who: 'arbeitet im Büro nebenan' },
  { name: 'Herr Krämer', title: 'Herr Krämer', who: 'Neukunde, zum ersten Mal hier' },
  { name: 'Frau Nowak', title: 'Frau Nowak', who: 'achtet sehr auf Zutaten' },
  { name: 'Herr Peters', title: 'Herr Peters', who: 'hat es ein bisschen eilig' },
  { name: 'Frau Jansen', title: 'Frau Jansen', who: 'kauft fürs Familienfrühstück' },
  { name: 'Herr Schneider', title: 'Herr Schneider', who: 'Stammkunde seit vielen Jahren' },
  { name: 'Frau Kaya', title: 'Frau Kaya', who: 'Studentin, kommt nach der Vorlesung' },
  { name: 'Herr Lange', title: 'Herr Lange', who: 'besorgt Kuchen für die Kollegen' },
  { name: 'Frau Klein', title: 'Frau Klein', who: 'Seniorin, plaudert gern' },
  { name: 'Herr Schulz', title: 'Herr Schulz', who: 'Busfahrer auf dem Weg zur Schicht' },
  { name: 'Frau Meier', title: 'Frau Meier', who: 'Lehrerin, kauft für die Pause' },
  { name: 'Herr Özdemir', title: 'Herr Özdemir', who: 'kocht gern und fragt genau nach' },
  { name: 'Frau Braun', title: 'Frau Braun', who: 'joggt jeden Morgen vorbei' },
  { name: 'Herr Fischer', title: 'Herr Fischer', who: 'Stammkunde, immer gut gelaunt' },
  { name: 'Frau Wolf', title: 'Frau Wolf', who: 'Krankenschwester nach der Nachtschicht' },
  { name: 'Herr Richter', title: 'Herr Richter', who: 'Geschäftsmann, telefoniert viel' },
  { name: 'Frau Schröder', title: 'Frau Schröder', who: 'Oma, holt die Enkel ab' },
  { name: 'Herr Neumann', title: 'Herr Neumann', who: 'frisch zugezogen' },
];

/** Tageszeit-Gruß passend zur echten Uhrzeit */
function timeGreeting() {
  const h = new Date().getHours();
  if (h < 11) return { std: 'Guten Morgen', wrong: 'Guten Abend', customer: ['Guten Morgen!', 'Morgen!', 'Guten Morgen zusammen!', 'Tach!'] };
  if (h < 18) return { std: 'Guten Tag', wrong: 'Guten Morgen', customer: ['Guten Tag!', 'Hallo!', 'Tach zusammen!', 'Mahlzeit!'] };
  return { std: 'Guten Abend', wrong: 'Guten Morgen', customer: ['Guten Abend!', 'Hallo, noch geöffnet?', 'Abend!'] };
}

type Core = { steps: SimStep[]; basket: BasketLine[]; bread?: ShopItem; sliceIntro?: string[]; forceRoll?: boolean; extraWrongTotals?: number[]; persona?: Persona };

/** Antwort-Optionen mischen */
const opts = (list: SimOpt[]) => shuffleArray(list);

/** Gleicht die Länge an: Kurze Antworten bekommen einen neutralen Zusatz, damit man die richtige nicht an der Länge erkennt */
const FILLERS = [' Das kommt heute ganz frisch aus dem Ofen.', ' Das ist bei unseren Kunden sehr beliebt.', ' Das kann ich wirklich empfehlen.', ' Das nehmen viele Stammkunden.'];
const evenOpts = (list: SimOpt[]) => {
  const max = Math.max(...list.map(o => o.text.length));
  const fillers = shuffleArray([...FILLERS]);
  let f = 0;
  return opts(list.map(o => (!o.noPad && max - o.text.length > 14 ? { ...o, text: o.text + fillers[f++ % fillers.length] } : o)));
};

// ── Beratungs-Szenarien ──

function scAllergyBread(): Core | null {
  const t = pick(ALLERGY_TARGETS);
  const good = BREADS.filter(p => !hasAllergen(p, t.key));
  const bad = BREADS.filter(p => hasAllergen(p, t.key));
  if (good.length < 1 || bad.length < 3) return null;
  const right = pick(good);
  const wrong = closeByName(bad, right, 3);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Allergie',
      customer: [pick([`Ich suche ein Brot, aber: ${pick(t.says)} Was können Sie mir empfehlen?`, `${pick(t.says)} Welches Brot kann ich da bedenkenlos nehmen?`, `Ich bräuchte ein Brot ohne ${t.label}. ${pick(t.says)}`])],
      options: evenOpts([
        { text: `Da kann ich Ihnen ${right.name} empfehlen, da ${t.verb} ${t.neg} drin.`, correct: true },
        ...wrong.map(w => ({ text: `Da kann ich Ihnen ${w.name} empfehlen, da ${t.verb} ${t.neg} drin.`, correct: false, why: `${w.name} enthält ${t.label} (Allergene: ${allergenText(w)}).` })),
      ]),
      afterWrong: `Oh, warten Sie, ${t.verb} da wirklich ${t.neg} drin? … Dann nehme ich lieber ${right.name}.`,
    }],
  };
}

function scVeganBread(): Core | null {
  const good = BREADS.filter(p => p.vegan);
  const bad = BREADS.filter(p => !p.vegan && p.allergens.some(a => a === 'Milch' || a === 'Eier'));
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  const wrong = closeByName(bad, right, 3);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Vegan',
      customer: [pick(['Ich ernähre mich vegan. Welches Brot ist für mich geeignet?', 'Haben Sie auch veganes Brot? Meine Tochter isst keine tierischen Produkte.', 'Ich suche ein Brot ganz ohne Milch und Ei, also vegan.'])],
      options: evenOpts([
        { text: `${right.name} ist vegan, das kann ich Ihnen empfehlen.`, correct: true },
        ...wrong.map(w => ({ text: `${w.name} ist vegan, das kann ich Ihnen empfehlen.`, correct: false, why: `${w.name} ist nicht vegan (Allergene: ${allergenText(w)}).` })),
      ]),
      afterWrong: `Hm, ich glaube da ist doch Milch oder Ei drin … Dann nehme ich ${right.name}.`,
    }],
  };
}

function scTaste(): Core | null {
  const mild = Math.random() < 0.5;
  const goodTypes = mild ? ['weizen', 'stuten', 'dinkel'] : ['schwarzbrot', 'roggen'];
  const badTypes = mild ? ['schwarzbrot', 'roggen', 'roggenmisch'] : ['weizen', 'stuten'];
  const noRye = (p: ShopItem) => !/roggen/i.test(p.flour || '') && !/roggen/i.test(p.fullIngredients) && !p.allergens.some(a => /roggen/i.test(a));
  const good = BREADS.filter(p => goodTypes.includes(p.breadType || '') && (!mild || noRye(p)));
  const bad = BREADS.filter(p => badTypes.includes(p.breadType || ''));
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  const wrong = closeByName(bad, right, 3);
  const ask = mild
    ? pick(['Ich hätte gern ein mildes Brot, gerne ganz ohne Roggen. Was haben Sie da?', 'Meine Kinder mögen kein dunkles Brot, haben Sie etwas Helles, Mildes?', 'Ich suche ein leichtes, mildes Brot ohne Roggen fürs Frühstück.'])
    : pick(['Ich mag es richtig kräftig und herzhaft. Welches Brot empfehlen Sie?', 'Ich suche ein dunkles, kräftiges Brot, gerne mit viel Roggen.', 'Was haben Sie Herzhaftes für die Leberwurst?']);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: mild ? 'Mild & ohne Roggen' : 'Kräftig',
      customer: [ask],
      options: evenOpts([
        { text: `Da passt ${right.name}, das ist schön ${mild ? 'mild und ohne Roggen' : 'kräftig und herzhaft'}.`, correct: true },
        ...wrong.map(w => ({ text: `Da passt ${w.name}, das ist schön ${mild ? 'mild und ohne Roggen' : 'kräftig und herzhaft'}.`, correct: false, why: `${w.name} ist ein ${TYPE_LABEL[w.breadType || ''] || 'anderes Brot'} (${w.flour || 'andere Mehlmischung'}), nicht ${mild ? 'mild und ohne Roggen' : 'kräftig'}.` })),
      ]),
      afterWrong: `Hm, das klingt nicht ganz nach dem, was ich suche … Dann nehme ich ${right.name}.`,
    }],
  };
}

function scSoldOut(): Core | null {
  // Alternativen laut Liste des Ausbilders (ALT_MAP in data.ts)
  const priced = (n: string) => SHOP_PRODUCTS.find(p => p.name === n && parseCents(p.price) > 0);
  const keys = Object.keys(ALT_MAP).filter(k => priced(k) && ALT_MAP[k].some(a => priced(a)));
  if (!keys.length) return null;
  const missingName = pick(keys);
  const missing = priced(missingName)!;
  const allowed = ALT_MAP[missingName];
  const right = priced(pick(allowed.filter(a => priced(a))))!;
  let wrongPool = SHOP_PRODUCTS.filter(p => parseCents(p.price) > 0 && p.name !== missing.name && !allowed.includes(p.name) && p.group === missing.group && (!missing.breadType || p.breadType !== missing.breadType));
  if (wrongPool.length < 2) wrongPool = SHOP_PRODUCTS.filter(p => parseCents(p.price) > 0 && p.name !== missing.name && !allowed.includes(p.name) && p.group === missing.group);
  if (wrongPool.length < 2) return null;
  const wrong = closeByName(wrongPool, right, 2);
  const good = allowed.length > 1 ? `Für ${missing.name} passen ${allowed.slice(0, -1).join(', ')} oder ${allowed[allowed.length - 1]}.` : `Für ${missing.name} passt ${allowed[0]}.`;
  return {
    bread: right.breadType ? right : undefined,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Ausverkauft',
      customer: [pick([`Haben Sie noch ${missing.name}?`, `Ich hätte gern ${missing.name}, bitte.`, `Ist ${missing.name} heute noch da?`]), `(${missing.name} ist leider schon ausverkauft.)`],
      options: evenOpts([
        { text: `${missing.name} ist leider schon weg, aber ich kann Ihnen ${right.name} empfehlen, das passt sehr gut.`, correct: true },
        ...wrong.map(w => ({ text: `${missing.name} ist leider schon weg, aber ich kann Ihnen ${w.name} empfehlen, das passt sehr gut.`, correct: false, why: `${w.name} ist keine gute Alternative. ${good}` })),
        { text: `${missing.name} ist leider schon ausverkauft, kommen Sie doch morgen früh einfach noch mal vorbei.`, correct: false, noPad: true, why: `Biete immer aktiv eine passende Alternative an. ${good}` },
      ]),
      afterWrong: `Hm, ist das wirklich ähnlich? … Ich nehme lieber ${right.name}.`,
    }],
  };
}

function scIngredients(): Core | null {
  const right = pick(BREADS);
  const seen = new Set<string>([right.shortIngredients]);
  const len = right.shortIngredients.length;
  const others = shuffleArray(BREADS.filter(p => p.breadType !== right.breadType))
    .sort((a, b) => Math.abs(a.shortIngredients.length - len) - Math.abs(b.shortIngredients.length - len))
    .slice(0, 10)
    .filter(p => {
    if (seen.has(p.shortIngredients)) return false;
    seen.add(p.shortIngredients);
    return true;
  }).slice(0, 3);
  if (others.length < 3) return null;
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Zutaten',
      learn: { product: right.name, kind: 'inhalt' },
      customer: [pick([`Ich überlege, ${right.name} zu nehmen. Was ist da eigentlich drin?`, `Was ist denn in ${right.name} alles drin?`, `${right.name} sieht lecker aus, woraus ist das?`])],
      options: opts([
        { text: right.shortIngredients, correct: true },
        ...others.map(o => ({ text: o.shortIngredients, correct: false, why: `Das sind die Zutaten von ${o.name}.` })),
      ]),
      afterWrong: `Ach so? Ich dachte … na egal, ich nehme ${right.name} trotzdem.`,
    }],
  };
}

function scFlour(): Core | null {
  const withFlour = BREADS.filter(p => !!p.flour);
  const right = pick(withFlour);
  const flours = Array.from(new Set(withFlour.map(p => p.flour as string).filter(f => f !== right.flour)));
  if (flours.length < 3) return null;
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Mehl',
      learn: { product: right.name, kind: 'mehl' },
      customer: [pick([`Welches Mehl ist in ${right.name}?`, `Ist ${right.name} eher Weizen oder Roggen?`, `Ich achte aufs Mehl, woraus ist ${right.name} gebacken?`])],
      options: opts([
        { text: `${right.name}: ${right.flour}.`, correct: true },
        ...sample(flours, 3).map(f => ({ text: `${right.name}: ${f}.`, correct: false, why: `Richtig wäre: ${right.flour}.` })),
      ]),
      afterWrong: `Hm, da bin ich mir nicht sicher … ich nehme es trotzdem mal mit.`,
    }],
  };
}

function scPrice(): Core | null {
  const right = pick(BREADS);
  const rc = parseCents(right.price);
  const prices = Array.from(new Set(BREADS.map(p => p.price as string).filter(pr => pr !== right.price && Math.abs(parseCents(pr) - rc) <= 250)));
  if (prices.length < 3) return null;
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: rc }],
    steps: [{
      topic: 'Preis',
      learn: { product: right.name, kind: 'preis' },
      customer: [pick([`Was kostet ${right.name}?`, `Und was nehmen Sie für ${right.name}?`, `${right.name}, wie teuer ist das?`])],
      options: opts([
        { text: `${right.name} kostet ${right.price}.`, correct: true },
        ...sample(prices, 3).map(pr => ({ text: `${right.name} kostet ${pr}.`, correct: false, why: `${right.name} kostet ${right.price}.` })),
      ]),
      afterWrong: `Ah, ${right.price} steht da auf dem Schild. Gut, das nehme ich.`,
    }],
  };
}

function scAllergenCheck(): Core | null {
  const t = pick(ALLERGY_TARGETS);
  const p = pick(BREADS);
  const contains = hasAllergen(p, t.key);
  const steps: SimStep[] = [{
    topic: 'Allergene prüfen',
    customer: [pick([`Ist in ${p.name} ${t.label} drin? ${pick(t.says)}`, `${pick(t.says)} Kann ich ${p.name} nehmen?`])],
    options: opts(contains ? [
      { text: `Leider ja, in ${p.name} ${t.verb} ${t.label} enthalten, das kann ich Ihnen nicht empfehlen.`, correct: true },
      { text: `Nein, keine Sorge, in ${p.name} ${t.verb} ${t.neg} enthalten, das können Sie nehmen.`, correct: false, why: `${p.name} enthält ${t.label} (Allergene: ${allergenText(p)}).` },
      { text: `In ${p.name} ${t.verb} nur ganz wenig ${t.label} drin, das macht bei einer Allergie bestimmt nichts.`, correct: false, why: `Bei Allergien gibt es kein „ein bisschen“, ${p.name} enthält ${t.label}.` },
      { text: `Das weiß ich bei ${p.name} leider nicht genau, probieren Sie es doch einfach mal aus.`, correct: false, why: 'Bei Allergie-Fragen immer in den Spickzettel schauen, niemals raten!' },
    ] : [
      { text: `Nein, keine Sorge, in ${p.name} ${t.verb} ${t.neg} enthalten, das können Sie nehmen.`, correct: true },
      { text: `Leider ja, in ${p.name} ${t.verb} ${t.label} enthalten, das kann ich Ihnen nicht empfehlen.`, correct: false, why: `${p.name} ist ohne ${t.label} (Allergene: ${allergenText(p)}).` },
      { text: `In ${p.name} ${t.verb} nur ganz wenig ${t.label} drin, das macht bei einer Allergie bestimmt nichts.`, correct: false, why: `${p.name} enthält gar ${t.neg}, und „ein bisschen“ gibt es bei Allergien nicht.` },
      { text: `Das weiß ich bei ${p.name} leider nicht genau, probieren Sie es doch einfach mal aus.`, correct: false, why: 'Bei Allergie-Fragen immer in den Spickzettel schauen, niemals raten!' },
    ]),
  }];
  if (!contains) {
    return { bread: p, basket: [{ name: p.name, qty: 1, cents: parseCents(p.price) }], steps: [{ ...steps[0], afterWrong: `Gut, dass ich gefragt habe … dann nehme ich ${p.name}.` }] };
  }
  const good = BREADS.filter(b => !hasAllergen(b, t.key) && b.name !== p.name);
  const bad = BREADS.filter(b => hasAllergen(b, t.key) && b.name !== p.name);
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  steps.push({
    topic: 'Alternative ohne Allergen',
    customer: [`Schade. Was hätten Sie denn ohne ${t.label}?`],
    options: evenOpts([
      { text: `${right.name} ist ohne ${t.label}, das kann ich Ihnen empfehlen.`, correct: true },
      ...closeByName(bad, right, 3).map(w => ({ text: `${w.name} ist ohne ${t.label}, das kann ich Ihnen empfehlen.`, correct: false, why: `${w.name} enthält ${t.label} (Allergene: ${allergenText(w)}).` })),
    ]),
    afterWrong: `Moment … dann lieber ${right.name}, da bin ich auf der sicheren Seite.`,
  });
  return { bread: right, basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }], steps };
}

function scSweets(): Core | null {
  const good = SWEETS.filter(p => !hasAllergen(p, 'Nüsse'));
  const bad = SWEETS.filter(p => hasAllergen(p, 'Nüsse'));
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  const qty = rnd(3, 8);
  return {
    basket: [{ name: right.name, qty, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Süßes ohne Nüsse',
      customer: [pick([
        `Ich brauche ${qty} Stück Gebäck für die Kaffeepause, aber eine Kollegin verträgt keine Nüsse. Was nehme ich da?`,
        `Für den Geburtstag meiner Tochter hätte ich gern ${qty} süße Teilchen. Ein Kind hat eine Nussallergie.`,
        `Ich hätte gern ${qty} Teilchen zum Kaffee, aber bitte ohne Nüsse und Mandeln.`,
      ])],
      options: evenOpts([
        { text: `Da passt ${right.name}, ganz ohne Nüsse und Mandeln.`, correct: true },
        ...closeByName(bad, right, 3).map(w => ({ text: `Da passt ${w.name}, ganz ohne Nüsse und Mandeln.`, correct: false, why: `${w.name} enthält Nüsse oder Mandeln (Allergene: ${allergenText(w)}).` })),
      ]),
      afterWrong: `Hm, ich glaube da sind Nüsse drin … dann lieber ${qty}× ${right.name}.`,
    }],
  };
}


// ── Weitere Szenarien: Service-Situationen ──

const WEIZEN_BREADS = () => BREADS.filter(p => (p.breadType === 'weizen') && /weizen/i.test(p.flour || '') && !/roggen/i.test(p.flour || ''));

function scComplaint(): Core | null {
  const x = pick(BREADS.filter(p => p.breadType !== 'stuten'));
  const problem = pick(['war innen noch ganz feucht', 'war schon nach einem Tag steinhart', 'war an der Unterseite fast verbrannt', 'war beim Schneiden total krümelig']);
  return {
    bread: x,
    forceRoll: true,
    sliceIntro: [pick(['Das ist sehr nett, danke. Dann nehme ich ein frisches.', 'Oh, prima, dann nehme ich gern ein frisches mit.'])],
    basket: [{ name: `${x.name} (Ersatz, kostenlos)`, qty: 1, cents: 0 }],
    extraWrongTotals: [parseCents(x.price)],
    steps: [{
      topic: 'Reklamation',
      customer: [pick([`Ich muss mich leider beschweren: ${x.name} von gestern ${problem}.`, `Hören Sie mal, ${x.name}, das ich gestern gekauft habe, ${problem}. Das ärgert mich schon.`])],
      options: opts([
        { text: `Das tut mir leid! Ich gebe Ihnen gern ein frisches ${x.name}, und sage der Backstube Bescheid.`, correct: true },
        { text: `Das kann eigentlich nicht sein, bei uns ist ${x.name} immer gut, das war bestimmt nur Zufall.`, correct: false, why: 'Nie widersprechen: zuhören, Verständnis zeigen, entschuldigen und unkompliziert Ersatz anbieten.' },
        { text: `Haben Sie ${x.name} vielleicht falsch gelagert? Dann kann ich da leider auch nichts machen.`, correct: false, why: 'Gib dem Kunden nicht die Schuld, entschuldige dich und biete Ersatz an.' },
        { text: 'Da müssen Sie sich leider bei der Zentrale melden, ich darf hier vorne selbst überhaupt nichts entscheiden.', correct: false, why: 'Bei einer berechtigten Reklamation bieten wir direkt Ersatz an oder holen die Filialleitung dazu.' },
      ]),
      afterWrong: 'Hm, das finde ich jetzt nicht so toll … Na gut, geben Sie mir bitte einfach ein frisches.',
    }],
  };
}

function scPreorder(): Core | null {
  const x = pick(BREADS);
  const n = pick([10, 12, 15, 20, 25, 30]);
  const roll = pick(ROLLS);
  const when = pick(['morgen früh', 'Samstag früh', 'morgen um halb acht']);
  return {
    bread: x,
    sliceIntro: [pick([`Prima. Und für heute nehme ich noch ${x.name} mit.`, `Super, danke! Für jetzt hätte ich gern noch ${x.name}.`]), pick(['Schneiden Sie mir das bitte? Wie dünn machen Sie das?', 'Können Sie mir das schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Vorbestellung',
      customer: [pick([`Kann ich für ${when} ${n} ${roll.name} vorbestellen? Wir haben im Büro ein Frühstück.`, `Ich bräuchte ${when} ${n} ${roll.name} für unser Team, kann ich die vorbestellen?`])],
      options: opts([
        { text: 'Sehr gerne! Ich schreibe Ihnen alles auf, auf welchen Namen und um wie viel Uhr holen Sie es ab?', correct: true },
        { text: 'Vorbestellen geht bei uns leider nicht, kommen Sie einfach morgen ganz früh vorbei, dann klappt das.', correct: false, why: 'Bestellungen nehmen wir gern an, immer mit Name, Abholzeit und Menge notieren.' },
        { text: 'Klar, das merke ich mir einfach, sagen Sie morgen an der Theke nur kurz Ihren Namen, dann passt das.', correct: false, why: 'Bestellungen immer schriftlich festhalten: Name, Menge, Abholzeit, nicht „merken“.' },
        { text: `Dann packe ich Ihnen die ${n} ${roll.name} gleich jetzt schon ein, die halten bis morgen.`, correct: false, why: 'Vorbestellte Ware soll frisch sein, Bestellung notieren und morgen frisch bereitstellen.' },
      ]),
      afterWrong: 'Hm, ich hätte es lieber richtig aufgeschrieben … Schreiben Sie bitte auf: Name Becker, Abholung acht Uhr.',
    }],
  };
}

function scBrunch(): Core | null {
  const stuten = BREADS.filter(p => p.breadType === 'stuten');
  if (!stuten.length || !ROLLS.length) return null;
  const s = pick(stuten);
  const roll = pick(ROLLS);
  const people = pick([6, 8, 10]);
  return {
    bread: s,
    sliceIntro: [`Gute Idee! Dann nehme ich ${s.name} und ${people} ${roll.name}.`, pick(['Den Stuten schneiden Sie mir bitte auch, wie dünn wird der?', 'Können Sie den Stuten schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: s.name, qty: 1, cents: parseCents(s.price) }, { name: roll.name, qty: people, cents: parseCents(roll.price) }],
    steps: [{
      topic: 'Anlass-Beratung',
      customer: [pick([`Wir machen Sonntag einen Brunch für ${people} Personen. Was können Sie mir da empfehlen?`, `Ich habe am Wochenende ${people} Gäste zum Frühstück, was würden Sie mir einpacken?`])],
      options: opts([
        { text: 'Ich würde gemischte Brötchen nehmen und dazu einen Stuten, so haben Sie Herzhaftes und Süßes.', correct: true },
        { text: 'Für so viele Gäste reicht ein großes Schwarzbrot, das ist schön kräftig und hält auch lange.', correct: false, why: 'Bei Anlässen auf Abwechslung achten: Brötchen für alle und etwas Süßes wie Stuten.' },
        { text: `Nehmen Sie doch einfach ${people} Berliner mit, süße Teilchen passen zu jedem Brunch am besten.`, correct: false, why: 'Nur Süßes ist einseitig, empfiehl eine Mischung aus Brötchen und Süßem.' },
        { text: 'Für so viele Personen müssen Sie leider vorher bestellen, sonst kann ich Ihnen gar nichts geben.', correct: false, why: 'Der Kunde ist jetzt da, berate ihn und stelle eine passende Auswahl zusammen.' },
      ]),
      afterWrong: 'Hm, ich dachte eher an etwas Gemischtes … Ich nehme Brötchen und einen Stuten.',
    }],
  };
}

function scGrill(): Core | null {
  const good = WEIZEN_BREADS();
  const bad = BREADS.filter(p => p.breadType === 'schwarzbrot' || p.breadType === 'stuten');
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Anlass-Beratung',
      customer: [pick(['Wir grillen heute Abend. Welches Brot passt da am besten dazu?', 'Ich suche ein Brot für unseren Grillabend, was empfehlen Sie?'])],
      options: evenOpts([
        { text: `Zum Grillen empfehle ich ${right.name}, ein helles, lockeres Weizenbrot.`, correct: true },
        ...closeByName(bad, right, 3).map(w => ({ text: `Zum Grillen empfehle ich ${w.name}, ein helles, lockeres Weizenbrot.`, correct: false, why: `${w.name} ist ${w.breadType === 'stuten' ? 'ein süßer Stuten' : 'ein kräftiges Vollkornschwarzbrot'}, zum Grillen passt helles Weizenbrot.` })),
      ]),
      afterWrong: `Hm, das passt doch nicht so zum Grillen … Dann nehme ich ${right.name}.`,
    }],
  };
}

function scPriceObjection(): Core | null {
  const x = pick(BREADS.filter(p => parseCents(p.price) >= 350));
  return {
    bread: x,
    sliceIntro: [pick(['Na gut, da haben Sie recht, dann nehme ich es.', 'Okay, überzeugt. Dann probiere ich es mal.'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Preis-Einwand',
      customer: [pick([`Was, ${x.price} für ${x.name}? Im Discounter kostet Brot die Hälfte!`, `${x.price}? Das ist aber ganz schön teuer für ein Brot …`])],
      options: opts([
        { text: 'Ich verstehe Sie, bei uns wird alles von Hand mit langer Teigführung gebacken, dadurch bleibt es lange frisch.', correct: true },
        { text: 'Na gut, dann gebe ich Ihnen heute ausnahmsweise 20 Prozent Rabatt, aber sagen Sie es bitte bloß keinem weiter.', correct: false, why: 'Keine Rabatte verschenken, mit Qualität argumentieren: Handwerk, Zutaten, Frische.' },
        { text: 'Dann kaufen Sie Ihr Brot doch einfach beim Discounter, das ist ja letztendlich ganz allein Ihre Entscheidung.', correct: false, why: 'Nie patzig werden, Verständnis zeigen und den Wert unseres Brotes erklären.' },
        { text: 'Die Preise macht bei uns die Chefin, da kann ich Ihnen leider überhaupt gar nichts zu sagen, tut mir leid.', correct: false, why: 'Du kannst den Preis erklären: handwerkliche Herstellung, gute Zutaten, lange Frische.' },
      ]),
      afterWrong: 'Hm, so richtig überzeugt bin ich nicht … aber gut, ich nehme es trotzdem.',
    }],
  };
}

function scKids(): Core | null {
  const x = pick(BREADS);
  const kid = pick(['Sohn', 'Tochter']);
  return {
    bread: x,
    persona: pick([{ name: 'Frau Yilmaz', title: 'Frau Yilmaz', who: 'Mutter mit zwei Kindern' }, { name: 'Herr Jansen', title: 'Herr Jansen', who: 'Vater mit Kind an der Hand' }]),
    sliceIntro: [pick([`Oh, wie lieb, ja, das darf ${kid === 'Sohn' ? 'er' : 'sie'} gern haben!`, `Das ist ja nett, danke!`]), pick(['Schneiden Sie mir das bitte? Wie dünn machen Sie das?', 'Können Sie es mir schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Kinder an der Theke',
      customer: [pick([`Ich hätte gern ${x.name}, bitte.`, `Einmal ${x.name}, bitte.`, `Für mich bitte ${x.name}.`]), `(Während du das Brot holst, schaut ein Kind neugierig über die Theke.)`, pick([`Mein ${kid} guckt schon ganz gespannt in die Auslage …`, `Entschuldigung, mein ${kid} ist heute ganz aufgeregt.`])],
      options: opts([
        { text: `Darf ich Ihrem ${kid === 'Sohn' ? 'Sohn' : 'Kind'} ein kleines Mürbchen schenken? Das bekommen bei uns alle Kinder gratis.`, correct: true },
        { text: 'Hier, nimm dir einen Lolli und einen Luftballon, das bekommen bei uns alle Kinder geschenkt.', correct: false, why: 'Bei Hinkel bekommen Kinder ein kleines Mürbchen, und vorher die Eltern fragen (Allergien!).' },
        { text: 'Kinder müssen leider kurz draußen warten, die Theke ist wirklich zu eng für alle.', correct: false, why: 'Kinder sind willkommen! Bei uns gibt es für sie ein kleines Mürbchen.' },
        { text: 'Komm, such dir einfach irgendein Stück Kuchen aus der Theke aus, das geht heute aufs Haus.', correct: false, why: 'Erst die Eltern fragen, und bei Hinkel bekommen Kinder ein kleines Mürbchen geschenkt.' },
      ]),
      afterWrong: 'Oh … wir fragen lieber erst. Ein kleines Mürbchen wäre schön.',
    }],
  };
}


function scOfficeOrder(): Core | null {
  if (ROLLS.length < 2) return null;
  const [a, b] = sample(ROLLS, 2);
  const na = pick([10, 12, 15]), nb = pick([8, 10]);
  return {
    persona: pick([{ name: 'Frau Neumann', title: 'Frau Neumann', who: 'holt das Frühstück fürs Büro' }, { name: 'Herr Krüger', title: 'Herr Krüger', who: 'Azubi aus der Kanzlei nebenan' }]),
    basket: [{ name: a.name, qty: na, cents: parseCents(a.price) }, { name: b.name, qty: nb, cents: parseCents(b.price) }],
    steps: [{
      topic: 'Großbestellung',
      customer: [pick([`Ich brauche ${na} ${a.name} und ${nb} ${b.name} für unser Büro. Geht das jetzt sofort?`, `Für unsere Besprechung hätte ich gern ${na} ${a.name} und ${nb} ${b.name}, bitte.`])],
      options: opts([
        { text: 'Sehr gern! Ich packe die Sorten getrennt in Tüten, dann zerdrückt nichts und Sie finden alles schnell wieder.', correct: true },
        { text: 'So viel auf einmal geht nur mit Vorbestellung, kommen Sie lieber morgen nochmal wieder.', correct: false, why: 'Was da ist, verkaufen wir gern sofort. Vorbestellen ist nur für das, was nicht vorrätig ist.' },
        { text: 'Ich werfe einfach alles zusammen in eine große Tüte, das geht am schnellsten.', correct: false, why: 'Bei großen Mengen sorgfältig packen: Sorten getrennt, Schweres nach unten, nichts zerdrücken.' },
        { text: 'Puh, so viele? Dann müssen die anderen Kunden jetzt aber warten, das dauert.', correct: false, why: 'Große Bestellungen freundlich und zügig bedienen, ohne zu stöhnen.' },
      ]),
      afterWrong: 'Hm, ich hätte die Brötchen schon gern ordentlich verpackt, bitte.',
    }],
  };
}

function scPocketMoney(): Core | null {
  const cheap = SWEETS.filter(p => parseCents(p.price) > 0 && parseCents(p.price) <= 250);
  if (cheap.length < 3) return null;
  const x = pick(cheap);
  const kid = pick(['Sohn', 'Tochter']);
  const wrong = SWEETS.filter(p => parseCents(p.price) > 300);
  const w = wrong.length ? pick(wrong) : null;
  return {
    persona: pick([{ name: 'Herr Jansen', title: 'Herr Jansen', who: `Vater, der ${kid === 'Sohn' ? 'Sohn' : 'Tochter'} selbst bezahlen lässt` }, { name: 'Frau Wagner', title: 'Frau Wagner', who: 'Oma mit Enkelkind' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Taschengeld',
      customer: [`(Ein Kind legt Münzen auf die Theke.)`, pick(['Ich hab 2 Euro 50 Taschengeld. Was kann ich mir dafür kaufen?', 'Reicht mein Geld für was Süßes? Ich hab 2 Euro 50.'])],
      options: opts([
        { text: `Da hast du gut gespart! Für dein Geld bekommst du zum Beispiel ${x.name}, das kostet ${x.price}. Magst du das?`, correct: true },
        { text: 'Das ist zu wenig, da kann ich dir leider gar nichts verkaufen.', correct: false, why: 'Kinder ernst nehmen und zeigen, was es für ihr Geld gibt.' },
        ...(w ? [{ text: `Nimm doch ${w.name}, den Rest legt deine Begleitung bestimmt drauf.`, correct: false, why: `${w.name} kostet ${w.price}, das ist mehr als das Taschengeld. Etwas passendes zeigen.` }] : []),
        { text: '(Über das Kind hinweg nur mit dem Erwachsenen sprechen.)', correct: false, why: 'Wenn das Kind selbst einkauft, sprich es direkt und freundlich an.' },
        { text: 'Komm, das schenke ich dir, Geld brauchst du nicht.', correct: false, why: 'Lass das Kind ruhig selbst bezahlen, das ist für viele Kinder etwas Besonderes.' },
      ].slice(0, 4)),
      afterWrong: `(Das Kind schaut unsicher.) Ähm … dann vielleicht ${x.name}?`,
    }],
  };
}

const EN_TYPE: Record<string, string> = { schwarzbrot: 'dark wholegrain rye bread', roggen: 'rye bread', roggenmisch: 'rye bread with some wheat', weizenmisch: 'wheat bread with some rye', dinkel: 'spelt bread', spezial: 'special bread', weizen: 'light wheat bread', stuten: 'sweet milk bread' };
function scEnglish(): Core | null {
  const list = BREADS.filter(p => p.breadType && EN_TYPE[p.breadType]);
  if (list.length < 4) return null;
  const x = pick(list);
  return {
    bread: x,
    persona: pick([{ name: 'Mr. Smith', title: 'Mr. Smith', who: 'Tourist aus England' }, { name: 'Ms. Carter', title: 'Ms. Carter', who: 'Touristin aus den USA' }]),
    sliceIntro: [pick(['Great, I take it! Äh … schneiden, bitte?', 'Perfect, thank you! Can you cut it? Schneiden?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Englisch sprechen',
      customer: [pick([`Hello! Sorry, my German is not so good. What is this bread, the ${x.name}?`, `Hi! Ich spreche nur ein bisschen Deutsch. Can you tell me about the ${x.name}?`])],
      options: opts([
        { text: `No problem! This is ${x.name}, a ${EN_TYPE[x.breadType!]}. It is very popular here.`, correct: true },
        { text: `Das ist ${x.name}! (Lauter und langsamer:) DAS. IST. EIN. BROT.`, correct: false, why: 'Lauter sprechen hilft nicht. Ein paar einfache englische Worte und Zeigen helfen viel mehr.' },
        { text: 'Sorry, no English. Next customer, please!', correct: false, why: 'Gib dir Mühe, einfache Worte und Zeigen reichen völlig, jeder Kunde ist willkommen.' },
        { text: `This is ${x.name}, a sweet cake with chocolate.`, correct: false, why: `${x.name} ist ein ${TYPE_LABEL[x.breadType!] || 'Brot'}, auch auf Englisch richtig beschreiben.` },
      ]),
      afterWrong: `Hmm … okay. I just take the ${x.name}, please.`,
    }],
  };
}

// ── Noch mehr Situationen aus dem Theken-Alltag ──

function scStorage(): Core | null {
  const x = pick(BREADS);
  const freeze = Math.random() < 0.45;
  if (freeze) {
    return {
      bread: x,
      sliceIntro: [pick(['Gut zu wissen, danke! Dann nehme ich gleich zwei Hälften … nein, eins reicht.', 'Super Tipp! Dann nehme ich es mit.'])],
      basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
      steps: [{
        topic: 'Aufbewahrung',
        customer: [pick([`Ich nehme ${x.name}, kann ich das auch einfrieren?`, `Wir schaffen ${x.name} nie ganz. Kann man das einfrieren?`])],
        options: opts([
          { text: 'Ja, sehr gut sogar! Am besten luftdicht verpackt und schon in Scheiben, dann tauen Sie nur auf, was Sie brauchen.', correct: true },
          { text: 'Lieber nicht, Brot verliert beim Einfrieren seinen ganzen Geschmack und wird danach sofort hart.', correct: false, why: 'Brot lässt sich gut einfrieren: luftdicht verpackt, am besten scheibenweise.' },
          { text: 'Ja, einfach im Ganzen in der Papiertüte ins Gefrierfach legen, mehr müssen Sie nicht beachten.', correct: false, why: 'In der Papiertüte trocknet es aus, luftdicht verpacken und am besten in Scheiben einfrieren.' },
          { text: 'Einfrieren geht, aber nur höchstens zwei Tage, danach wird es ungenießbar.', correct: false, why: 'Luftdicht verpackt hält eingefrorenes Brot deutlich länger, Tipp: scheibenweise einfrieren.' },
        ]),
        afterWrong: 'Hm, ich habe gehört, man soll es in Scheiben einfrieren … mache ich so. Ich nehme es.',
      }],
    };
  }
  return {
    bread: x,
    sliceIntro: [pick(['Ah, gut zu wissen, das mache ich bisher falsch! Dann nehme ich es.', 'Danke für den Tipp! Dann nehme ich es mit.'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Aufbewahrung',
      customer: [pick([`Wie bewahre ich ${x.name} zu Hause am besten auf, damit es lange frisch bleibt?`, `Bei mir wird Brot immer so schnell schlecht. Wo lagere ich ${x.name} am besten?`])],
      options: opts([
        { text: 'Am besten bei Raumtemperatur in einer Brotdose mit ein paar Luftlöchern, bitte nicht in den Kühlschrank.', correct: true },
        { text: 'Am besten im Kühlschrank, die Kälte hält das Brot frisch und es schimmelt nicht so schnell.', correct: false, why: 'Im Kühlschrank wird Brot schneller altbacken, besser Raumtemperatur, Brotdose mit Luftlöchern.' },
        { text: 'In einer luftdichten Plastiktüte, gut verschlossen, dann kommt gar keine Luft dran.', correct: false, why: 'Ohne Luftaustausch staut sich Feuchtigkeit und es schimmelt schneller, Brotdose mit Luftlöchern.' },
        { text: 'Einfach offen auf die Arbeitsfläche legen, mit der Schnittfläche nach oben, so atmet es am besten.', correct: false, why: 'Offen trocknet es aus, besser in eine Brotdose mit Luftlöchern bei Raumtemperatur.' },
      ]),
      afterWrong: 'Wirklich? Ich habe gelesen, Brotdose mit Luftlöchern ist am besten … Ich nehme es jedenfalls.',
    }],
  };
}

function scLongFresh(): Core | null {
  const good = BREADS.filter(p => p.breadType === 'schwarzbrot');
  const bad = BREADS.filter(p => p.breadType === 'weizen');
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Frische-Beratung',
      customer: [pick(['Ich kaufe nur einmal die Woche ein. Welches Brot hält sich am längsten frisch?', 'Ich brauche ein Brot, das ein paar Tage durchhält, was nehme ich da?'])],
      options: evenOpts([
        { text: `Da nehmen Sie am besten ${right.name}, Roggenvollkornschrot bindet viel Wasser, so bleibt es lange saftig.`, correct: true },
        ...closeByName(bad, right, 3).map(w => ({ text: `Da nehmen Sie am besten ${w.name}, das bindet viel Wasser und bleibt so lange saftig.`, correct: false, why: `${w.name} ist ein Weizenbrot, das schmeckt frisch am besten. Lange frisch halten Vollkorn-Roggenbrote wie ${right.name}.` })),
      ]),
      afterWrong: `Hm, ein Weizenbrot hält doch nicht so lange … Ich nehme lieber ${right.name}.`,
    }],
  };
}

function scGlutenfree(): Core | null {
  const bw = BREADS.find(p => /buchweizen/i.test(p.name));
  if (!bw) return null;
  return {
    bread: bw,
    sliceIntro: [pick(['Danke, dass Sie das so ehrlich sagen. Spuren sind bei mir zum Glück okay, ich nehme es.', 'Gut zu wissen, danke! Dann probiere ich es.'])],
    basket: [{ name: bw.name, qty: 1, cents: parseCents(bw.price) }],
    steps: [{
      topic: 'Glutenfrei',
      customer: [pick(['Ich habe Zöliakie. Haben Sie ein glutenfreies Brot?', 'Haben Sie etwas ohne Gluten? Ich vertrage das nicht.'])],
      options: opts([
        { text: `Unser ${bw.name} hat eine glutenfreie Rezeptur, durch Mehlstaub in unserer Backstube können aber Spuren von Roggen und Weizen enthalten sein.`, correct: true },
        { text: 'Nehmen Sie unseren Dinkeltraum, Dinkel ist ein Urgetreide und enthält deshalb kein Gluten.', correct: false, why: 'Dinkel enthält Gluten! Glutenfreie Rezeptur hat nur das Buchweizenbrot, mit möglichen Spuren.' },
        { text: 'Das Reine Roggen ist glutenfrei, weil es nur mit Natursauerteig gebacken wird.', correct: false, why: 'Roggen enthält Gluten. Glutenfreie Rezeptur: Buchweizenbrot, mit Hinweis auf mögliche Spuren.' },
        { text: `${bw.name} ist garantiert zu 100 % glutenfrei, da müssen Sie sich keine Sorgen machen.`, correct: false, why: 'Nie „garantiert“ sagen: Die Rezeptur ist glutenfrei, aber durch die Backstube sind Spuren möglich.' },
      ]),
      afterWrong: `Hm, da bin ich vorsichtig … Ich nehme lieber ${bw.name} und lese die Zutaten nochmal nach.`,
    }],
  };
}

function scSmallLoaf(): Core | null {
  const smalls = BREADS.filter(p => p.name.startsWith('Kleines ') && BREADS.some(b => b.name === p.name.replace('Kleines ', 'Großes ')));
  if (!smalls.length) return null;
  const small = pick(smalls);
  const big = small.name.replace('Kleines ', 'Großes ');
  const otherSmall = BREADS.filter(p => p.name.startsWith('Kleines ') && p.name !== small.name);
  return {
    bread: small,
    basket: [{ name: small.name, qty: 1, cents: parseCents(small.price) }],
    steps: [{
      topic: 'Größe beraten',
      customer: [pick([`Ich wohne allein, das ${big} ist mir einfach zu viel. Gibt es das auch kleiner?`, `Das ${big} schaffe ich nie, bevor es trocken wird. Haben Sie das auch in klein?`])],
      options: evenOpts([
        { text: `Ja, nehmen Sie das ${small.name}, gleicher Teig, nur kleiner.`, correct: true },
        ...sample(otherSmall, 2).map(o => ({ text: `Ja, nehmen Sie das ${o.name}, gleicher Teig, nur kleiner.`, correct: false, why: `${o.name} ist ein anderes Brot, das kleine ${big.replace('Großes ', '')} heißt ${small.name}.` })),
        { text: `Nein, das ${big} gibt es leider nur in dieser Größe.`, correct: false, noPad: true, why: `Doch, es gibt das ${small.name}.` },
      ]),
      afterWrong: `Ach, ich glaube, es gibt doch das ${small.name}? Das nehme ich.`,
    }],
  };
}

function scHurry(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Peters', title: 'Herr Peters', who: 'hat es ein bisschen eilig' }, { name: 'Herr Schulz', title: 'Herr Schulz', who: 'Busfahrer auf dem Weg zur Schicht' }, { name: 'Frau Wolf', title: 'Frau Wolf', who: 'Krankenschwester nach der Nachtschicht' }]),
    sliceIntro: [pick(['Super, danke!', 'Perfekt, danke Ihnen!']), pick(['Und schnell geschnitten bitte, wie dünn?', 'Bitte noch schnell schneiden, auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Eiliger Kunde',
      customer: [pick([`Entschuldigung, ich hab’s furchtbar eilig, mein Bus kommt gleich! Ein ${x.name}, bitte.`, `Ganz schnell bitte, ich muss zur Arbeit: ${x.name}!`])],
      options: opts([
        { text: `Kommt sofort! Ein ${x.name}, ich beeile mich.`, correct: true },
        { text: `Oh, kennen Sie eigentlich schon unser ganzes Sortiment? Da gibt es neben ${x.name} noch ganz viel anderes …`, correct: false, why: 'Eilige Kunden zügig bedienen, keine langen Erklärungen jetzt.' },
        { text: 'Immer mit der Ruhe, hier geht alles der Reihe nach, Hektik bringt doch nichts.', correct: false, why: 'Verständnis zeigen und zügig bedienen statt belehren.' },
        { text: 'Dann hätten Sie halt früher kommen müssen, ich mache das jetzt trotzdem in meinem Tempo.', correct: false, why: 'Nie patzig, freundlich und schnell bedienen.' },
      ]),
      afterWrong: 'Bitte … ich muss wirklich los!',
    }],
  };
}

function scQueue(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    sliceIntro: [pick([`Danke, dass Sie das geklärt haben. Ich hätte gern ${x.name}.`, `Danke! Also, ich nehme ${x.name}.`]), pick(['Schneiden Sie mir das bitte? Wie dünn machen Sie das?', 'Bitte geschnitten, auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Vordrängeln',
      customer: ['(Mitten in der Bestellung drängelt sich ein Mann vor: „Ich will nur schnell zwei Brötchen, geht ganz fix!“)'],
      options: opts([
        { text: 'Einen kleinen Moment bitte, ich bediene gerade noch hier, dann sind Sie sofort dran.', correct: true },
        { text: 'Na gut, wenn es nur zwei Brötchen sind, Sie warten doch bestimmt kurz, oder?', correct: false, why: 'Fair bleiben: Wer dran ist, wird zuerst bedient. Freundlich auf die Reihenfolge hinweisen.' },
        { text: 'Hallo?! Hinten anstellen, aber zackig, Sie sehen doch, dass hier Leute warten!', correct: false, why: 'Auch beim Vordrängeln bleiben wir höflich: „Einen Moment bitte, Sie sind gleich dran.“' },
        { text: '(Den Mann einfach ignorieren und so tun, als hätte man nichts gehört.)', correct: false, why: 'Nicht ignorieren, freundlich sagen, dass er gleich dran ist.' },
      ]),
      afterWrong: 'Äh … ich war eigentlich zuerst dran.',
    }],
  };
}

function scChangeClaim(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    sliceIntro: [pick([`Danke, sehr freundlich. Wenn ich schon mal da bin: ${x.name}, bitte.`, `Prima, danke! Dann nehme ich noch ${x.name} mit.`]), pick(['Bitte auch geschnitten, wie dünn machen Sie das?', 'Können Sie es schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Wechselgeld-Reklamation',
      customer: [pick(['Entschuldigung, ich war vorhin schon da. Ich glaube, Sie haben mir einen Euro zu wenig rausgegeben.', 'Sie haben mir heute Morgen falsch rausgegeben, da fehlen 50 Cent.'])],
      options: opts([
        { text: 'Oh, das tut mir leid! Haben Sie den Bon noch? Dann prüfe ich das gleich und wir klären das sofort.', correct: true },
        { text: 'Das kann nicht sein, ich verzähle mich nie, da haben Sie sich bestimmt geirrt.', correct: false, why: 'Nicht abwimmeln: freundlich bleiben, Bon ansehen und in Ruhe prüfen (ggf. Filialleitung dazuholen).' },
        { text: 'Da kann ich jetzt leider nichts mehr machen, Sie hätten direkt an der Kasse nachzählen müssen.', correct: false, why: 'Wir nehmen Hinweise ernst: entschuldigen, Bon prüfen, Kasse kontrollieren.' },
        { text: 'Kein Problem, hier haben Sie einfach zwei Euro aus der Kasse, dann ist es auf jeden Fall erledigt.', correct: false, why: 'Nicht ohne Prüfung Geld herausgeben, erst den Bon ansehen und in Ruhe klären.' },
      ]),
      afterWrong: 'Hm. Ich habe den Bon hier, schauen Sie doch bitte einfach nach.',
    }],
  };
}

function scCompliment(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    sliceIntro: [pick([`Dann nehme ich heute wieder ${x.name}.`, `Und heute bitte wieder ${x.name}.`]), pick(['Wie immer geschnitten, wie dünn war das nochmal?', 'Schneiden Sie es mir? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Lob vom Kunden',
      customer: [pick([`Ich muss mal was loswerden: Ihr ${x.name} ist wirklich das beste Brot weit und breit!`, `Letzte Woche hatte ich ${x.name}, die ganze Familie war begeistert!`])],
      options: opts([
        { text: 'Oh, vielen Dank, das freut uns riesig! Das gebe ich gern an unsere Bäcker in der Backstube weiter.', correct: true },
        { text: 'Ach, das ist doch nur Brot, so besonders ist das jetzt auch nicht.', correct: false, why: 'Lob dankend annehmen und weitergeben, nicht kleinreden.' },
        { text: 'Ja, wir sind auch viel besser als die Bäckerei gegenüber, die backt ja nur auf.', correct: false, why: 'Nie über die Konkurrenz lästern, einfach bedanken und weitergeben.' },
        { text: 'Danke. Was darf’s sein? Hinter Ihnen ist es schon voll.', correct: false, why: 'Kurz innehalten und sich ehrlich bedanken, das gehört zum guten Service.' },
      ]),
      afterWrong: 'Na, ich fand es jedenfalls super …',
    }],
  };
}

/** Alle Szenarien mit ihren Themen (für „gezielt üben“) und Gewichtung */
// ───────── Schwierige Kunden ─────────
function scRude(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Krause', title: 'Herr Krause', who: 'hat schlechte Laune' }, { name: 'Frau Brandt', title: 'Frau Brandt', who: 'ist genervt vom Tag' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Unhöflicher Kunde',
      customer: [pick([`Na endlich! Ich stehe hier schon ewig. ${x.name}, aber zack zack!`, `Können Sie mal aufpassen? Ich will ein ${x.name}, und zwar jetzt!`])],
      options: opts([
        { text: `Entschuldigen Sie die Wartezeit! Ein ${x.name}, kommt sofort.`, correct: true },
        { text: 'So redet man aber nicht mit mir, dann warten Sie eben noch.', correct: false, why: 'Ruhig und freundlich bleiben, nicht auf den Ton einsteigen.' },
        { text: '(Augen verdrehen und langsam weitermachen.)', correct: false, why: 'Professionell bleiben, kurz entschuldigen und zügig bedienen.' },
        { text: 'Wenn Ihnen das nicht passt, gehen Sie doch woanders hin.', correct: false, why: 'Nie patzig, freundlich bleibt man auch bei schlechter Laune des Kunden.' },
      ]),
      afterWrong: 'Unglaublich, dieser Service hier …',
    }],
  };
}

function scHaggle(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Vogel', title: 'Herr Vogel', who: 'handelt gern' }, { name: 'Frau Kaya', title: 'Frau Kaya', who: 'sucht ein Schnäppchen' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Rabatt verlangen',
      customer: [`Ein ${x.name} bitte. Aber geben Sie mir das doch für die Hälfte, ist ja eh bald Feierabend, oder?`],
      options: opts([
        { text: 'Das darf ich leider nicht, unsere Preise sind fest. Dafür ist das Brot ganz frisch aus unserer Backstube.', correct: true },
        { text: 'Na gut, weil Sie es sind, aber nichts verraten.', correct: false, why: 'Eigenmächtig Rabatt geben ist nicht erlaubt. Freundlich bei den festen Preisen bleiben.' },
        { text: 'Nein. Wir sind doch kein Flohmarkt.', correct: false, why: 'Freundlich ablehnen und den Wert des Produkts erklären.' },
        { text: 'Dann kommen Sie halt kurz vor Ladenschluss wieder und hoffen.', correct: false, why: 'Nicht abwimmeln, freundlich die festen Preise erklären.' },
      ]),
      afterWrong: 'Ach kommen Sie, ein bisschen was geht doch immer …',
    }],
  };
}

function scTouch(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Lange', title: 'Herr Lange', who: 'will ganz genau prüfen' }, { name: 'Frau Roth', title: 'Frau Roth', who: 'ist sehr wählerisch' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Ware anfassen',
      customer: [`(Greift über die Theke.) Ich drück mal kurz, ob das ${x.name} auch wirklich frisch ist.`],
      options: opts([
        { text: `Moment, ich zeige es Ihnen gern! Aus Hygienegründen reiche ich die Ware mit Zange oder Handschuh. Das ${x.name} ist von heute.`, correct: true },
        { text: '(Nichts sagen, der Kunde wird schon wissen, was er tut.)', correct: false, why: 'Hygiene geht vor: Kunden fassen die Ware nicht an, freundlich darauf hinweisen.' },
        { text: 'Finger weg! Das ist doch eklig!', correct: false, why: 'Freundlich erklären statt anschreien.' },
        { text: 'Drücken Sie ruhig, ich verkaufe das dann dem Nächsten.', correct: false, why: 'Angefasste Ware darf nicht weiterverkauft werden. Freundlich auf Hygiene hinweisen.' },
      ]),
      afterWrong: 'Wieso, ich will doch nur schauen …',
    }],
  };
}

function scBigNote(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Engel', title: 'Herr Engel', who: 'hat nur einen großen Schein' }, { name: 'Frau Pohl', title: 'Frau Pohl', who: 'kommt gerade von der Bank' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Großer Geldschein',
      customer: [`Ein ${x.name}. Ich habe leider nur einen 200-Euro-Schein, geht das?`],
      options: opts([
        { text: 'Ich schaue kurz, ob ich genug Wechselgeld habe, und prüfe den Schein mit Fühlen, Sehen, Kippen. Einen Moment bitte.', correct: true },
        { text: 'Klar, her damit. (Ohne Prüfen in die Kasse legen.)', correct: false, why: 'Große Scheine immer prüfen: Fühlen, Sehen, Kippen. Und vorher ans Wechselgeld denken.' },
        { text: 'Nein, so große Scheine nehmen wir grundsätzlich nicht.', correct: false, why: 'Nicht pauschal ablehnen: Wechselgeld prüfen, Schein kontrollieren oder Kartenzahlung anbieten.' },
        { text: 'Dann zahlen Sie halt morgen.', correct: false, why: 'Lösung anbieten: Wechselgeld prüfen oder mit Karte zahlen lassen.' },
      ]),
      afterWrong: 'Und, geht das jetzt oder nicht?',
    }],
  };
}

function scDrunkLoud(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Meier', title: 'Herr Meier', who: 'telefoniert sehr laut' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Kunde blockiert die Schlange',
      customer: ['(Telefoniert laut, die Schlange hinter ihm wird lang.) … ja, Moment … was wollte ich hier noch mal?'],
      options: opts([
        { text: `Darf ich Ihnen kurz helfen? Wenn Sie noch überlegen, bediene ich gern schon die nächste Kundin und bin gleich wieder bei Ihnen.`, correct: true },
        { text: 'Legen Sie mal auf, hier wollen auch andere einkaufen!', correct: false, why: 'Freundlich bleiben und eine Lösung anbieten, statt den Kunden bloßzustellen.' },
        { text: '(Einfach warten, egal wie lang die Schlange wird.)', correct: false, why: 'Freundlich anbieten, schon den nächsten Kunden zu bedienen.' },
        { text: '(Über den Kunden hinweg mit den Wartenden schimpfen.)', correct: false, why: 'Nie über Kunden lästern, höflich eine Lösung anbieten.' },
      ]),
      afterWrong: 'Ähm … ja … Moment noch …',
    }],
  };
}

const SCENARIOS: { fn: () => Core | null; topics: string[]; weight: number }[] = [
  { fn: scAllergyBread, topics: ['Allergie'], weight: 3 },
  { fn: scAllergenCheck, topics: ['Allergene prüfen', 'Alternative ohne Allergen'], weight: 3 },
  { fn: scVeganBread, topics: ['Vegan'], weight: 2 },
  { fn: scTaste, topics: ['Mild & ohne Roggen', 'Kräftig'], weight: 2 },
  { fn: scSoldOut, topics: ['Ausverkauft'], weight: 2 },
  { fn: scIngredients, topics: ['Zutaten'], weight: 2 },
  { fn: scFlour, topics: ['Mehl'], weight: 2 },
  { fn: scPrice, topics: ['Preis'], weight: 1 },
  { fn: scSweets, topics: ['Süßes ohne Nüsse'], weight: 2 },
  { fn: scComplaint, topics: ['Reklamation'], weight: 2 },
  { fn: scPreorder, topics: ['Vorbestellung'], weight: 2 },
  { fn: scBrunch, topics: ['Anlass-Beratung'], weight: 1 },
  { fn: scGrill, topics: ['Anlass-Beratung'], weight: 1 },
  { fn: scPriceObjection, topics: ['Preis-Einwand'], weight: 2 },
  { fn: scKids, topics: ['Kinder an der Theke'], weight: 1 },
  { fn: scStorage, topics: ['Aufbewahrung'], weight: 2 },
  { fn: scLongFresh, topics: ['Frische-Beratung'], weight: 1 },
  { fn: scGlutenfree, topics: ['Glutenfrei'], weight: 1 },
  { fn: scSmallLoaf, topics: ['Größe beraten'], weight: 1 },
  { fn: scHurry, topics: ['Eiliger Kunde'], weight: 1 },
  { fn: scQueue, topics: ['Vordrängeln'], weight: 1 },
  { fn: scChangeClaim, topics: ['Wechselgeld-Reklamation'], weight: 1 },
  { fn: scCompliment, topics: ['Lob vom Kunden'], weight: 1 },
  { fn: scOfficeOrder, topics: ['Großbestellung'], weight: 1 },
  { fn: scPocketMoney, topics: ['Taschengeld'], weight: 1 },
  { fn: scEnglish, topics: ['Englisch sprechen'], weight: 1 },
  { fn: scRude, topics: ['Unhöflicher Kunde'], weight: 1 },
  { fn: scHaggle, topics: ['Rabatt verlangen'], weight: 1 },
  { fn: scTouch, topics: ['Ware anfassen'], weight: 1 },
  { fn: scBigNote, topics: ['Großer Geldschein'], weight: 1 },
  { fn: scDrunkLoud, topics: ['Kunde blockiert die Schlange'], weight: 1 },
];
const GENERAL_TOPICS = ['Begrüßung', 'Schnitt', 'Zusatzverkauf', 'Summe', 'Rückgeld', 'Verabschiedung', 'Kartenzahlung', 'Trinkgeld', 'Smalltalk'];

// Kleine Zwischenfragen für längere Gespräche
const SMALLTALK: ((p: Persona) => SimStep)[] = [
  () => ({ topic: 'Smalltalk', customer: [pick(['Ganz schön ungemütlich draußen heute, oder?', 'Was für ein schönes Wetter heute!', 'Puh, heute ist ja wieder was los in der Stadt.'])], options: opts([
    { text: pick(['Ja, wirklich! Da tut etwas Frisches vom Bäcker doch gut.', 'Stimmt, umso schöner, dass Sie bei uns vorbeischauen!', 'Absolut. Dann machen wir es Ihnen hier wenigstens gemütlich.']), correct: true },
    { text: '(Nicht reagieren und weiter einpacken.)', correct: false, why: 'Kurz und freundlich auf Smalltalk eingehen, das macht den Einkauf persönlich.' },
    { text: 'Ach, erzählen Sie mir nichts, mein Tag war auch furchtbar, ich bin seit fünf Uhr hier …', correct: false, why: 'Eigene Sorgen gehören nicht an die Theke, freundlich und positiv bleiben.' },
    { text: 'Hm. Was wollten Sie noch mal?', correct: false, why: 'Lieber kurz freundlich antworten, dann weiter bedienen.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: ['Ich habe meinen Einkaufsbeutel vergessen …'], options: opts([
    { text: pick(['Kein Problem, ich gebe Ihnen gern eine Tüte.', 'Macht nichts, dafür haben wir Tüten. Ich packe Ihnen alles ein.']), correct: true },
    { text: 'Dann müssen Sie das so tragen, Tüten haben wir nicht für jeden.', correct: false, why: 'Hilfsbereit sein: eine Tüte anbieten.' },
    { text: 'Selbst schuld, das nächste Mal denken Sie dran.', correct: false, why: 'Nie belehren, einfach freundlich helfen.' },
    { text: '(Die Ware lose auf die Theke legen.)', correct: false, why: 'Biete eine Tüte an und packe ordentlich ein.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: [pick(['Ist das Brot eigentlich von heute?', 'Backen Sie das hier selbst?'])], options: opts([
    { text: pick(['Ja, wir backen alles selbst in unserer Backstube auf der Hohen Straße, ganz frisch.', 'Ja, alles aus unserer eigenen Backstube, handwerklich gebacken.']), correct: true },
    { text: 'Keine Ahnung, das kommt morgens einfach mit dem Wagen.', correct: false, why: 'Wir backen selbst in unserer Backstube, darauf sind wir stolz.' },
    { text: 'Nein, das ist Fertigware, wie überall.', correct: false, why: 'Falsch: Hinkel backt handwerklich in der eigenen Backstube.' },
    { text: 'Ist doch egal, schmeckt doch.', correct: false, why: 'Kundenfragen ernst nehmen und stolz von unserer Backstube erzählen.' },
  ]) }),
  (p) => ({ topic: 'Smalltalk', customer: [`(${p.title} telefoniert noch kurz.)`, 'Moment … ja, ich bin gleich da … Entschuldigung!'], options: opts([
    { text: pick(['Kein Problem, lassen Sie sich Zeit!', '(Kurz lächeln und warten, dann weiter bedienen.)']), correct: true },
    { text: 'Hallo? Hier sind noch andere Kunden!', correct: false, why: 'Geduldig und freundlich bleiben, kurz warten.' },
    { text: '(Schon den nächsten Kunden bedienen.)', correct: false, why: 'Den Kunden nicht stehen lassen, kurz warten und dann weitermachen.' },
    { text: 'Telefonieren ist hier eigentlich nicht erlaubt.', correct: false, why: 'Kein Verbot, einfach freundlich warten.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: ['Ihre Kollegin hat mich letzte Woche so toll beraten!'], options: opts([
    { text: pick(['Oh, das freut mich sehr, das richte ich ihr gern aus!', 'Wie schön! Das sage ich ihr, darüber freut sie sich bestimmt.']), correct: true },
    { text: 'Ach, die? Na ja, die ist eigentlich eher langsam.', correct: false, why: 'Nie schlecht über Kollegen sprechen, Lob freundlich weitergeben.' },
    { text: 'Hm. Und, was wollen Sie heute?', correct: false, why: 'Lob annehmen und weitergeben, das freut alle.' },
    { text: 'Ich berate aber viel besser, glauben Sie mir.', correct: false, why: 'Teamgeist zeigen, Lob gern weitergeben.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: ['Bis wann haben Sie heute eigentlich geöffnet?'], options: opts([
    { text: 'Das schaue ich Ihnen gern nach. Die Öffnungszeiten hängen auch an der Tür und stehen auf unserer Internetseite.', correct: true },
    { text: 'Keine Ahnung, ich arbeite hier nur.', correct: false, why: 'Hilfsbereit sein: nachschauen oder auf Aushang und Internetseite verweisen.' },
    { text: 'Bis die Ware weg ist, dann machen wir zu.', correct: false, why: 'Lieber verlässlich auf die Öffnungszeiten an Tür und Internetseite verweisen.' },
    { text: 'Rund um die Uhr, wir sind ja eine Bäckerei.', correct: false, why: 'Nichts erfinden, nachschauen oder auf den Aushang verweisen.' },
  ]) }),
];

function pickScenario(focus?: string) {
  const pool = focus && !GENERAL_TOPICS.includes(focus) ? SCENARIOS.filter(x => x.topics.includes(focus)) : SCENARIOS;
  const list = (pool.length ? pool : SCENARIOS).flatMap(x => Array(x.weight).fill(x.fn) as (() => Core | null)[]);
  return pick(list);
}

/** Baut ein komplettes Verkaufsgespräch */
const coreKeyOf = (c: Core) => `${c.steps[0]?.topic || ''}|${c.bread?.name || c.basket[0]?.name || ''}`;

function buildConversation(focus?: string, skip: string[] = []): Conversation {
  const g = timeGreeting();
  let core: Core | null = null;
  for (let i = 0; i < 40 && !core; i++) {
    const c = pickScenario(focus)();
    if (c && focus === 'Schnitt' && !c.bread) continue;
    if (c && i < 35 && skip.includes(coreKeyOf(c))) continue;
    core = c;
  }
  if (!core) core = scPrice() as Core;
  const persona = core.persona || pick(PERSONAS);

  const steps: SimStep[] = [];
  // Mal kurz, mal ausführlich: nicht jedes Gespräch hat gleich viele Schritte
  const shape: 'kurz' | 'normal' | 'lang' = focus && GENERAL_TOPICS.includes(focus) ? 'normal' : pick(['kurz', 'kurz', 'normal', 'normal', 'normal', 'lang', 'lang']);
  const want = (t: string) => focus === t;

  // 1) Begrüßung
  const isRegular = /Stammkund/i.test(persona.who);
  steps.push({
    topic: 'Begrüßung',
    customer: [pick([...g.customer, ...(isRegular ? ['Na, da bin ich wieder!', 'Hallo, alles gut bei Ihnen?'] : []), '(Die Kundin lächelt und schaut in die Auslage.)'.replace('Die Kundin', persona.title.startsWith('Herr') ? 'Der Kunde' : 'Die Kundin')])],
    options: (() => {
      const phrase = pick(['Schön, dass Sie da sind, was darf es für Sie sein?', 'Was darf ich Ihnen heute Gutes einpacken?', 'Wie kann ich Ihnen heute weiterhelfen?', 'Was darf es heute sein?', 'Womit kann ich Ihnen eine Freude machen?', 'Was darf’s sein?', 'Was hätten Sie gern?', 'Na, worauf haben Sie heute Lust?', 'Herzlich willkommen bei Hinkel, was darf ich Ihnen anbieten?', 'Schön Sie zu sehen! Wie immer oder mal was Neues?'].filter(x => isRegular || !x.includes('Wie immer')));
      const greet = isRegular ? `${g.std}, ${persona.title}!` : `${g.std}!`;
      const wrongPool: SimOpt[] = [
        { text: `${g.wrong}! ${phrase}`, correct: false, why: `Achte auf die Tageszeit, jetzt passt „${g.std}“.` },
        { text: pick(['Ja, hallo, einen Moment, ich muss erst noch die Brötchen auffüllen.', 'Gleich, ich räume nur noch kurz das Blech hier weg, ja?', 'Moment, ich muss eben noch die Kasse zählen.']), correct: false, why: 'Der Kunde geht immer vor, erst begrüßen und bedienen.' },
        { text: pick(['Hallo! Na, was willst du denn heute haben? Sag einfach.', 'Hi! Was brauchst du? Sag einfach Bescheid, ich mach dir das.']), correct: false, why: 'Kunden siezen wir, freundlich mit Tagesgruß begrüßen.' },
        { text: '(Ohne aufzuschauen:) Ja bitte?', correct: false, why: 'Blickkontakt, Lächeln und ein freundlicher Tagesgruß gehören dazu.' },
        { text: 'Der Nächste! … Ach, Sie. Was soll es sein?', correct: false, why: 'Jeden Kunden persönlich und freundlich begrüßen, nicht abfertigen.' },
      ];
      return opts([{ text: `${greet} ${phrase}`, correct: true }, ...sample(wrongPool, 3)]);
    })(),
  });

  // 2) Beratung
  steps.push(...core.steps);
  const basket = [...core.basket];

  // 3) Schneiden (nur bei Brot)
  if (core.bread && core.bread.breadType && !SLICE_EXCLUDE.includes(core.bread.name) && (want('Schnitt') || shape !== 'kurz' || Math.random() < 0.4)) {
    const mm = SLICE[core.bread.breadType];
    const label = TYPE_LABEL[core.bread.breadType];
    const others = ['5,5 mm', '9 mm', '12 mm'].filter(x => x !== mm);
    steps.push({
      topic: 'Schnitt',
      learn: { product: core.bread.name, kind: 'schnitt' },
      customer: (() => {
        const ask = pick(['Können Sie mir das bitte schneiden? Wie dünn machen Sie das?', 'Schneiden Sie mir das? Auf wie viel Millimeter geht das?', 'Gerne geschnitten bitte, wie dick werden die Scheiben?']);
        if (core.sliceIntro && core.sliceIntro.length >= 2) return core.sliceIntro;
        if (core.sliceIntro && core.sliceIntro.length === 1) return [core.sliceIntro[0], ask];
        return [pick(['Ach super, das nehme ich!', 'Prima, dann nehme ich das.', 'Wunderbar, genau das hab ich gesucht.']), ask];
      })(),
      options: opts([
        ...(() => { const tpl = pick([(x: string) => `Gerne! Das schneide ich Ihnen auf ${x}, so schneiden wir ${label}.`, (x: string) => `Mach ich! ${label} kommt bei uns auf ${x}.`, (x: string) => `Selbstverständlich. Für ${label} nehmen wir ${x}, dann passt die Scheibe perfekt.`, (x: string) => `Klar, ${x} ist für ${label} genau richtig.`]); return [{ text: tpl(mm), correct: true }, ...others.map(o => ({ text: tpl(o), correct: false, why: `${label} schneiden wir auf ${mm}.` }))]; })(),
        { text: 'Ganze Brote schneiden wir leider nicht, das müssten Sie zuhause machen.', correct: false, why: `Natürlich schneiden wir, ${label} auf ${mm}.` },
      ]),
    });
  }

  // 4) Sonst noch etwas?
  const askMore = core.forceRoll || want('Zusatzverkauf') || shape === 'lang' || (shape === 'normal' && Math.random() < 0.75);
  const addRoll = askMore && (core.forceRoll || Math.random() < 0.55) && ROLLS.length > 0;
  const roll = pick(ROLLS);
  const rollQty = rnd(2, 6);
  if (askMore) steps.push({
    topic: 'Zusatzverkauf',
    customer: [pick(['Danke schön!', 'Super, danke.', 'Prima.', 'Toll, danke!', 'Wunderbar.'])],
    options: opts([
      { text: pick(['Sehr gerne! Darf es denn sonst noch etwas für Sie sein?', 'Gerne doch! Kann ich Ihnen sonst noch etwas Gutes einpacken?', 'Mach ich sofort! Darf es sonst noch etwas dazu sein?', `Gern! Darf es dazu vielleicht noch ein paar frische ${pick(ROLLS).name} sein?`, 'Gern! Noch was dazu?', 'Sehr gern. Darf ich Ihnen noch etwas anbieten, vielleicht etwas Süßes für den Nachmittag?', `Kommt sofort! Unsere ${pick(SWEETS.length ? SWEETS : ROLLS).name} sind heute übrigens besonders lecker, darf es eins dazu sein?`]), correct: true },
      ...sample([
        { text: 'Das war’s dann, oder? Hinter Ihnen warten schon Leute.', correct: false, why: 'Nie drängeln, freundlich nachfragen, ob noch etwas dazu soll.' },
        { text: 'Nehmen Sie doch noch Brötchen mit, die müssen heute weg.', correct: false, why: 'So verkauft man nicht, frag offen und freundlich nach weiteren Wünschen.' },
        { text: 'Alles klar, dann tippe ich das jetzt schon mal in die Kasse.', correct: false, why: 'Frag aktiv nach: „Darf es sonst noch etwas sein?“' },
        { text: 'So. Zahlen Sie bar?', correct: false, why: 'Erst nach weiteren Wünschen fragen, dann kassieren.' },
        { text: 'Mehr gibt’s heute eh nicht, das Beste ist schon weg.', correct: false, why: 'Positiv bleiben und aktiv anbieten: „Darf es sonst noch etwas sein?“' },
      ] as SimOpt[], 3),
    ]),
  });
  if (addRoll) basket.push({ name: roll.name, qty: rollQty, cents: parseCents(roll.price) });

  // Lange Gespräche: noch eine kleine Zwischenfrage oder etwas Smalltalk
  if (shape === 'lang') {
    const extras = sample(SMALLTALK, Math.random() < 0.35 ? 2 : 1).map(f => f(persona));
    steps.push(...extras);
  }

  // 5) Summe
  const total = basket.reduce((s, b) => s + b.cents * b.qty, 0);
  const listText = basket.map(b => `${b.qty > 1 ? b.qty + '× ' : ''}${b.name}`).join(' und ');
  const totalWrong = new Set<number>();
  const tweaks = shuffleArray([-100, 100, -50, 50, -10, 10, -20, 20]);
  if (addRoll) { totalWrong.add(total - parseCents(roll.price) * rollQty); totalWrong.add(total + parseCents(roll.price)); }
  (core.extraWrongTotals || []).forEach(v => totalWrong.add(total + v));
  for (const t of tweaks) { if (totalWrong.size >= 6) break; if (total + t > 0) totalWrong.add(total + t); }
  totalWrong.delete(total);
  Array.from(totalWrong).forEach(v => { if (v <= 0) totalWrong.delete(v); });
  const showSum = want('Summe') || shape !== 'kurz' || Math.random() < 0.4;
  if (showSum) steps.push({
    topic: 'Summe',
    prices: basket.map(b => ({ ...b })),
    customer: [addRoll ? `Ja, geben Sie mir noch ${rollQty} ${roll.name}, bitte.` : pick(['Nein danke, das wäre alles.', 'Das war’s für heute.', 'Nein, das reicht. Was macht das?']), addRoll ? 'Das wäre dann alles. Was bekommen Sie?' : 'Was bekommen Sie von mir?'],
    options: (() => {
      const tpl = pick([(v: number) => `${listText}, das macht zusammen ${euro(v)}.`, (v: number) => `Dann bekomme ich ${euro(v)} von Ihnen, bitte.`, (v: number) => `Das macht ${euro(v)}, bitte schön.`, (v: number) => `Zusammen sind das ${euro(v)}.`]);
      return opts([
        { text: tpl(total), correct: true },
        ...sample(Array.from(totalWrong), 3).map(w => ({ text: tpl(w), correct: false, why: `Richtig: ${basket.map(b => `${b.qty} × ${euro(b.cents)}`).join(' + ')} = ${euro(total)}.` })),
      ]);
    })(),
  });

  // 6) Bezahlen: bar, mit Karte, „Stimmt so“ oder „Machen Sie … draus“ (Trinkgeld)
  let tipCents = 0;
  const payIdx = steps.length;
  const payRoll = Math.random();
  const notes = [500, 1000, 2000, 5000];
  const nextNote = notes.find(n => n > total) || Math.ceil(total / 1000) * 1000 + 1000;
  const noteText = (c: number) => euro(c).replace(',00 €', ' Euro');
  const changeOpts = (change: number, given: number, base: number, prefix: string) => {
    const chWrong = new Set<number>();
    for (const t of shuffleArray([-100, 100, -50, 50, -10, 10, -20, 20, -500, 500])) { if (chWrong.size >= 5) break; if (change + t > 0) chWrong.add(change + t); }
    chWrong.delete(change);
    const pre = showSum ? prefix : `${prefix}das macht ${euro(base)}, `;
    return opts([
      { text: `${pre}${euro(change)} bekommen Sie zurück.`, correct: true },
      ...sample(Array.from(chWrong), 3).map(w => ({ text: `${pre}${euro(w)} bekommen Sie zurück.`, correct: false, why: `${euro(given)} − ${euro(base)} = ${euro(change)}.` })),
    ]);
  };
  if (payRoll < 0.15) {
    // Kartenzahlung
    steps.push({
      topic: 'Kartenzahlung',
      customer: [pick(['Ich zahle mit Karte.', 'Kann ich mit Karte zahlen?', 'Mit dem Handy geht auch, oder?'])],
      options: opts([
        { text: 'Sehr gerne, das Gerät ist bereit, halten Sie Karte oder Handy einfach dran.', correct: true },
        { text: 'Sagen Sie mir die PIN ruhig laut, dann tippe ich sie schnell für Sie ein.', correct: false, why: 'Die PIN gibt nur der Kunde selbst ein, niemals nachfragen oder mitlesen.' },
        { text: 'Karte? Na gut … aber nächstes Mal bitte bar, das ist für uns einfacher.', correct: false, why: 'Kartenzahlung freundlich annehmen, ohne Kommentar.' },
        { text: 'Halten Sie die Karte schon mal hin, ich bediene derweil den Nächsten.', correct: false, why: 'Den Bezahlvorgang in Ruhe zu Ende bringen, dann den nächsten Kunden bedienen.' },
      ]),
    });
  } else if (payRoll < 0.28 && nextNote - total < 150 && nextNote - total > 0) {
    // „Stimmt so!“, Rest ist Trinkgeld
    tipCents = nextNote - total;
    steps.push({
      topic: 'Trinkgeld', tipStep: true,
      customer: [pick([`Hier sind ${noteText(nextNote)}, stimmt so!`, `${noteText(nextNote)}, bitte. Der Rest ist für Sie!`])],
      options: opts([
        { text: 'Oh, vielen herzlichen Dank, das ist sehr lieb! Das kommt in unsere Trinkgeldkasse.', correct: true },
        { text: `Nein, nein, hier sind Ihre ${euro(tipCents)}, Trinkgeld nehmen wir grundsätzlich nicht an.`, correct: false, why: 'Trinkgeld darfst du freundlich und dankend annehmen.' },
        { text: '(Das Geld wortlos in die Kasse legen und den nächsten Kunden aufrufen.)', correct: false, why: 'Bedanke dich für das Trinkgeld, das ist eine nette Geste.' },
        { text: 'Danke! Das stecke ich mir gleich selbst ein, das merkt ja keiner.', correct: false, why: 'Trinkgeld kommt in die Trinkgeldkasse, und ein ehrliches Dankeschön gehört dazu.' },
      ]),
    });
  } else if (payRoll < 0.4) {
    // „Machen Sie … draus“
    const round = total < 500 ? Math.ceil((total + 20) / 50) * 50 : Math.ceil((total + 30) / 100) * 100;
    const given = notes.find(n => n >= round) || nextNote;
    if (given > round) {
      tipCents = round - total;
      steps.push({
        topic: 'Trinkgeld', tipStep: true,
        customer: [pick([`Hier sind ${noteText(given)}, machen Sie ${noteText(round)} draus.`, `Ich gebe Ihnen ${noteText(given)}. Machen Sie einfach ${noteText(round)}, der Rest ist für Sie.`])],
        options: changeOpts(given - round, given, round, 'Vielen Dank, das ist sehr nett! '),
      });
    } else {
      steps.push({ topic: 'Rückgeld', customer: [`Hier sind ${noteText(nextNote)}.`], options: changeOpts(nextNote - total, nextNote, total, 'Vielen Dank, ') });
    }
  } else {
    // Normal bar, manchmal mit passendem Kleingeld
    let given = nextNote;
    let givenText = noteText(given);
    if (Math.random() < 0.35) {
      const rest = total % 100;
      given = rest === 0 ? total + 100 : total - rest + 100 + (rest > 50 ? 0 : 50);
      if (given <= total) given = Math.ceil(total / 100) * 100 + 100;
      givenText = euro(given);
    }
    steps.push({
      topic: 'Rückgeld',
      customer: [pick([`Hier sind ${givenText}.`, `Ich gebe Ihnen ${givenText}.`, `Bitte schön, ${givenText}.`, `${givenText}, passt das?`])],
      options: changeOpts(given - total, given, total, 'Vielen Dank, '),
    });
    // Manchmal wandert danach etwas in die Trinkgelddose
    if (Math.random() < 0.15) {
      tipCents = pick([20, 30, 50]);
      steps.push({
        topic: 'Trinkgeld', tipStep: true,
        customer: [`(${persona.title} wirft ${euro(tipCents)} in die Trinkgelddose.)`, pick(['Für die Kaffeekasse!', 'Sie machen das immer so nett hier.'])],
        options: opts([
          { text: 'Oh, wie lieb, vielen Dank! Darüber freut sich das ganze Team.', correct: true },
          { text: 'Das müssen Sie aber wirklich nicht, nehmen Sie das ruhig wieder raus.', correct: false, why: 'Trinkgeld freundlich annehmen und sich bedanken.' },
          { text: '(Nichts sagen, man sieht ja, dass es in die Dose geht.)', correct: false, why: 'Ein kurzes, herzliches Dankeschön gehört dazu.' },
          { text: 'Nur 50 Cent? Na ja, besser als nichts.', correct: false, why: 'Jedes Trinkgeld ist eine nette Geste, herzlich bedanken.' },
        ].map(o => o.text.startsWith('Nur 50 Cent') ? { ...o, text: `Nur ${euro(tipCents)}? Na ja, besser als nichts.` } : o)),
      });
    }
  }

  if (!showSum && steps[payIdx]) steps[payIdx].prices = basket.map(b => ({ ...b }));

  // 7) Verabschiedung
  if (want('Verabschiedung') || shape !== 'kurz' || Math.random() < 0.6) steps.push({
    topic: 'Verabschiedung',
    customer: [pick(['Danke schön!', 'Super, danke.', 'Wunderbar, danke Ihnen!', 'Dann bis bald!', 'Schönen Tag noch!'])],
    options: opts([
      { text: pick([`Vielen Dank, ${persona.title}, ich wünsche Ihnen einen schönen Tag!`, `Ich danke Ihnen, ${persona.title}! Einen schönen Tag und bis bald!`, `Danke Ihnen, ${persona.title}, lassen Sie es sich schmecken!`, 'Vielen Dank und guten Appetit, bis zum nächsten Mal!']), correct: true },
      ...sample([
        { text: 'So, tschüss dann, und der Nächste bitte, hier geht’s weiter!', correct: false, why: 'Erst den Kunden freundlich verabschieden, dann den nächsten bedienen.' },
        { text: 'Den Kassenbon brauchen Sie ja bestimmt nicht, den werfe ich weg.', correct: false, why: 'Zum Schluss steht die freundliche Verabschiedung, den Bon bieten wir an, statt ihn wegzuwerfen.' },
        { text: 'Jo, danke, tschüss. Und Tür bitte hinter sich zumachen!', correct: false, why: 'Zu knapp und unhöflich, bedanken, schönen Tag wünschen, gern mit Namen.' },
        { text: '(Schon dem nächsten Kunden zuwenden, ohne etwas zu sagen.)', correct: false, why: 'Jeden Kunden freundlich verabschieden, mit Blickkontakt und einem guten Wunsch.' },
        { text: 'Ciao! Und morgen bitte etwas früher, dann ist mehr da.', correct: false, why: 'Freundlich bedanken und einen schönen Tag wünschen, keine Belehrungen.' },
      ] as SimOpt[], 3),
    ]),
  });

  const endLines = [pick(tipCents > 0
    ? ['Gern geschehen, Sie haben mich toll beraten. Bis bald!', 'Das haben Sie sich verdient. Tschüss!', 'Ihnen auch einen schönen Tag, bis zum nächsten Mal!']
    : ['Danke, Ihnen auch! Bis morgen!', 'Gleichfalls, bis zum nächsten Mal!', 'Danke, war wie immer super hier. Tschüss!', 'Ihnen auch einen schönen Tag!', 'Bis bald, und danke für die nette Beratung!', 'Tschüss, bis Samstag!'])];
  return { persona, steps, endLines, tipCents, coreKey: coreKeyOf(core), coreTopics: core.steps.map(st => st.topic) };
}

export type ThekeStats = Record<string, { ok: number; bad: number }>;
export type ThekeResult = { topic: string; ok: boolean };

/** Themen sortiert nach Fehlerquote (nur Themen mit mindestens 2 Versuchen) */
export function weakThekeTopics(stats: ThekeStats | undefined, limit = 3) {
  return Object.entries(stats || {})
    .map(([topic, v]) => ({ topic, ok: Number(v?.ok) || 0, bad: Number(v?.bad) || 0 }))
    .filter(t => t.ok + t.bad >= 2)
    .map(t => ({ ...t, rate: t.bad / (t.ok + t.bad) }))
    .sort((a, b) => b.rate - a.rate || b.bad - a.bad)
    .slice(0, limit);
}

type ThekeReview = { topic: string; ok: boolean; why?: string; better?: string; q?: string; a?: string; product?: string };

/** Lob für die Bewertung am Ende, pro Gesprächsschritt */
const THEKE_PRAISE: Record<string, string> = {
  'Smalltalk': 'freundlich und persönlich auf den Kunden eingegangen',
  'Großbestellung': 'die große Bestellung sorgfältig gepackt',
  'Taschengeld': 'dem Kind etwas Passendes für sein Taschengeld gezeigt',
  'Englisch sprechen': 'auf Englisch freundlich beraten',
  'Unhöflicher Kunde': 'trotz schlechter Laune des Kunden ruhig und freundlich geblieben',
  'Rabatt verlangen': 'freundlich bei den festen Preisen geblieben',
  'Ware anfassen': 'freundlich auf die Hygiene geachtet',
  'Großer Geldschein': 'den großen Schein geprüft und ans Wechselgeld gedacht',
  'Kunde blockiert die Schlange': 'die Schlange im Blick behalten und höflich gelöst',
  'Begrüßung': 'freundlich begrüßt und nach dem Wunsch gefragt',
  'Allergie': 'bei der Allergie sicher beraten',
  'Vegan': 'die vegane Auswahl richtig empfohlen',
  'Ausverkauft': 'eine passende Alternative angeboten',
  'Zutaten': 'die Zutaten richtig erklärt',
  'Mehl': 'die Mehlsorte richtig genannt',
  'Preis': 'den Preis richtig genannt',
  'Allergene prüfen': 'die Allergene richtig geprüft',
  'Alternative ohne Allergen': 'eine sichere Alternative gefunden',
  'Süßes ohne Nüsse': 'etwas Süßes ohne Nüsse gefunden',
  'Reklamation': 'die Reklamation freundlich und kulant gelöst',
  'Vorbestellung': 'die Bestellung richtig aufgenommen',
  'Anlass-Beratung': 'passend zum Anlass beraten',
  'Preis-Einwand': 'den Preis mit Qualität begründet',
  'Kinder an der Theke': 'an das Mürbchen für das Kind gedacht',
  'Aufbewahrung': 'richtig erklärt, wie man Brot aufbewahrt',
  'Frische-Beratung': 'ein Brot empfohlen, das lange frisch bleibt',
  'Glutenfrei': 'ehrlich zu glutenfrei und möglichen Spuren beraten',
  'Größe beraten': 'die passende Brotgröße gefunden',
  'Eiliger Kunde': 'den eiligen Kunden zügig bedient',
  'Vordrängeln': 'fair und höflich die Reihenfolge eingehalten',
  'Wechselgeld-Reklamation': 'die Wechselgeld-Frage ruhig geklärt',
  'Lob vom Kunden': 'sich herzlich für das Lob bedankt',
  'Kartenzahlung': 'die Kartenzahlung freundlich abgewickelt',
  'Trinkgeld': 'sich für das Trinkgeld bedankt',
  'Schnitt': 'die richtige Schnittstärke gewählt',
  'Zusatzverkauf': 'aktiv nach weiteren Wünschen gefragt',
  'Summe': 'richtig zusammengerechnet',
  'Rückgeld': 'das Rückgeld stimmt',
  'Verabschiedung': 'freundlich verabschiedet',
};

/** Trinkgeldkasse mit Knopf zum Trinkgeld-Laden */
function TipJar({ balance, onOpenShop, big, todayLeft }: { balance: number; onOpenShop: () => void; big?: boolean; todayLeft?: number }) {
  return (
    <div style={{ ...(big ? cardStyle : {}), display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: big ? 'space-between' : 'center', padding: big ? '18px 22px' : 0, backgroundColor: big ? TH.tintYellow : undefined }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span aria-hidden="true" className="lt-emo-shake" style={{ fontSize: big ? '38px' : '28px' }}>🫙</span>
        <span>
          <span style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: TH.muted }}>Deine Trinkgeldkasse</span>
          <span className="lt-count" style={{ display: 'block', fontFamily: TH.serif, fontSize: big ? '30px' : '24px', lineHeight: 1.1 }}>{euro(balance)}</span>
          {todayLeft !== undefined && <span style={{ display: 'block', fontSize: '14px', color: TH.muted }}>{todayLeft > 0 ? `Heute noch bis ${euro(todayLeft)} möglich` : 'Für heute ist die Kasse voll, morgen geht es weiter'}</span>}
        </span>
      </span>
      <button onClick={onOpenShop} style={{ minHeight: '50px', padding: '0 20px', borderRadius: '14px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>🛍️ Trinkgeld-Laden</button>
    </div>
  );
}

export function ThekenSimulatorView({ onSaveScore, onTopicResults, topicStats, onLearn, known = {}, onKnown, onTip, tipBalance, onOpenShop, tipTodayLeft }: { onTip?: (cents: number) => void; tipBalance?: number; onOpenShop?: () => void; tipTodayLeft?: number; onSaveScore: (points: number, category: string) => void; onTopicResults?: (results: ThekeResult[]) => void; topicStats?: ThekeStats; onLearn?: OnLearn; known?: KnownMap; onKnown?: OnKnown }) {
  const [onlyNew, toggleOnlyNew] = useOnlyNew('theke');
  const knownTheke = known.theke || [];
  const [learned, setLearned] = useState(0);
  const [tipTotal, setTipTotal] = useState(0);
  const [earnedTip, setEarnedTip] = useState(0);
  const [tipLost, setTipLost] = useState(false);
  const [tipCapped, setTipCapped] = useState(false);
  const tipLostRef = useRef(false);
  const [phase, setPhase] = useState<'menu' | 'chat' | 'done'>('menu');
  const [conv, setConv] = useState<Conversation | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [served, setServed] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const savedRef = useRef(false);
  const resultsRef = useRef<ThekeResult[]>([]);
  const [review, setReview] = useState<ThekeReview[]>([]);
  const [thFx, setThFx] = useState<AnswerFxState>(null);
  const [thRun, setThRun] = useState(0);
  const [focus, setFocus] = useState<string | undefined>(undefined);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy, phase]);

  const startConversation = (focusTopic?: string) => {
    const c = buildConversation(focusTopic, onlyNew ? knownTheke : []);
    setFocus(focusTopic);
    savedRef.current = false;
    resultsRef.current = [];
    setLearned(0);
    setReview([]);
    setThFx(null);
    setThRun(0);
    setEarnedTip(0); setTipLost(false); setTipCapped(false); tipLostRef.current = false;
    setConv(c);
    setStepIdx(0);
    setCorrect(0);
    setMessages(c.steps[0].customer.map(t => ({ from: 'customer' as const, text: t })));
    setBusy(false);
    setPhase('chat'); scrollToPlay();
  };

  const choose = (o: SimOpt) => {
    if (!conv || busy || phase !== 'chat') return;
    const step = conv.steps[stepIdx];
    const right = step.options.find(x => x.correct);
    const add: ChatMsg[] = [{ from: 'seller', text: o.text }];
    if (o.correct) {
      add.push({ from: 'note-ok', text: pick(['Richtig!', 'Sehr gut!', 'Genau so!', 'Perfekt!']) });
      if (step.learn && onLearn) {
        const n = onLearn([step.learn]);
        if (n > 0) { setLearned(v => v + n); add.push({ from: 'note-ok', text: `📚 Frage abgehakt: ${step.topic} von „${step.learn.product}“ zählt jetzt auch in deinem Lernbereich.` }); }
        else if (n === 0) add.push({ from: 'note-ok', text: `📚 ${step.topic} von „${step.learn.product}“ hattest du schon gemeistert.` });
      }
    } else {
      add.push({ from: 'note-bad', text: `${o.why || 'Nicht ganz.'}${right ? ` Besser: „${right.text}“` : ''}` });
    }
    setMessages(m => [...m, ...add]);
    resultsRef.current.push({ topic: step.topic, ok: o.correct });
    if (step.tipStep && !o.correct) tipLostRef.current = true;
    setReview(r => [...r, { topic: step.topic, ok: o.correct, why: o.why, better: right && !o.correct ? right.text : undefined, q: step.customer.join(' '), a: right ? right.text : o.text, product: step.learn?.product }]);
    const run = o.correct ? thRun + 1 : 0;
    setThRun(run);
    setThFx({ k: Date.now(), ok: o.correct, text: o.correct ? '💬 +10 Punkte' : '✗ Nicht ganz', streak: run, pts: o.correct ? 10 : undefined });
    const newCorrect = correct + (o.correct ? 1 : 0);
    setCorrect(newCorrect);
    setBusy(true);

    window.setTimeout(() => {
      const next = stepIdx + 1;
      const extra: ChatMsg[] = [];
      if (!o.correct && step.afterWrong) extra.push({ from: 'customer', text: step.afterWrong });
      if (next < conv.steps.length) {
        conv.steps[next].customer.forEach(t => extra.push({ from: 'customer', text: t }));
        setMessages(m => [...m, ...extra]);
        setStepIdx(next);
        setBusy(false);
      } else {
        const total = conv.steps.length;
        // Trinkgeld: nur wenn die Trinkgeld-Antwort gestimmt hat, gute Beratung gibt öfter einen Bonus
        let tip = conv.tipCents && !tipLostRef.current ? conv.tipCents : 0;
        if (!conv.tipCents) {
          const quote = newCorrect / total;
          const bonus = quote === 1 ? (Math.random() < 0.5 ? pick([30, 50, 100]) : 0) : quote >= 0.75 ? (Math.random() < 0.2 ? pick([20, 30]) : 0) : 0;
          if (bonus) { tip = bonus; extra.push({ from: 'customer', text: `(${conv.persona.title} wirft ${euro(bonus)} in die Trinkgelddose. ${pick(['Für die tolle Beratung!', 'Das war richtig gut, danke!', 'So freundlich wird man selten bedient!'])}` }); }
        }
        conv.endLines.forEach(t => extra.push({ from: 'customer', text: t }));
        setMessages(m => [...m, ...extra]);
        setBusy(false);
        setPhase('done');
        setServed(s => s + 1);
        setEarnedTip(tip); setTipLost(!!conv.tipCents && tipLostRef.current); setTipCapped(!!tip && tipTodayLeft !== undefined && tip > tipTodayLeft);
        if (tip) { setTipTotal(t => t + tip); onTip?.(tip); }
        const points = newCorrect * 10 + (newCorrect === total ? 10 : 0);
        if (!savedRef.current) {
          savedRef.current = true;
          if (points > 0) onSaveScore(points, 'Theken-Simulator');
          if (onTopicResults && resultsRef.current.length) onTopicResults([...resultsRef.current]);
          const coreOk = (conv.coreTopics || []).every(t => resultsRef.current.filter(r => r.topic === t).every(r => r.ok));
          if (coreOk && conv.coreKey) onKnown?.('theke', [conv.coreKey]);
        }
      }
    }, o.correct ? 900 : 1600);
  };

  const total = conv ? conv.steps.length : 0;
  const step = conv && phase === 'chat' ? conv.steps[stepIdx] : null;
  const weak = weakThekeTopics(topicStats, 3);

  const topicPanel = (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontFamily: TH.serif, fontSize: '26px' }}>Deine Übungs-Themen</div>
      {weak.length === 0 ? (
        <div style={{ fontSize: '17px', color: TH.muted }}>Nach ein paar Beratungen siehst du hier, welche Themen du noch üben solltest.</div>
      ) : (
        weak.map(w => {
          const sum = w.ok + w.bad;
          const pct = Math.round((w.ok / sum) * 100);
          return (
            <div key={w.topic} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px 14px', borderRadius: '16px', backgroundColor: pct < 60 ? TH.tintPeach : TH.cream }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>{w.topic}</div>
                <div style={{ height: '8px', borderRadius: '999px', backgroundColor: dc('#F4EADB'), overflow: 'hidden', marginTop: '6px' }}><div className="lt-fill" style={{ width: pct + '%', height: '100%', backgroundColor: pct < 60 ? TH.red : TH.green }} /></div>
                <div style={{ fontSize: '15px', color: TH.muted, marginTop: '4px' }}>{w.ok} von {sum} richtig</div>
              </div>
              <button onClick={() => startConversation(w.topic)} style={{ minHeight: '48px', padding: '0 16px', borderRadius: '12px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Gezielt üben</button>
            </div>
          );
        })
      )}
    </div>
  );
  const isPerfect = phase === 'done' && correct === total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      <PageHead title="Theken-Simulator" subtitle="Ein Kunde kommt an die Theke, führe das ganze Verkaufsgespräch: begrüßen, beraten, schneiden, kassieren und verabschieden." />

      {phase === 'menu' && (
        <GameIntro
          title="Bereit für den ersten Kunden?"
          text="Jedes Gespräch ist anders: über 20 Situationen von Allergie und Zöliakie über Reklamation, Vordrängler und eilige Kunden bis zu Kartenzahlung und Trinkgeld. Über 20 verschiedene Kunden, alle Antworten kommen direkt aus unserem Sortiment."
          hint="10 Punkte pro richtiger Antwort, +10 Bonus für eine perfekte Beratung. Gute Beratung bringt öfter Trinkgeld, das bleibt in deiner Trinkgeldkasse."
          startLabel="Ersten Kunden bedienen"
          onStart={() => startConversation()}
        />
      )}
      {phase === 'menu' && <OnlyNewToggle on={onlyNew} onToggle={toggleOnlyNew} label="Nur neue Beratungen" done={knownTheke.length} unit="Beratungen gemeistert" />}
      {phase === 'menu' && onLearn && <LearnHint text="Fragt dich ein Kunde nach Zutaten, Preis oder Mehl oder willst du ein Brot schneiden, wird bei einer richtigen Antwort die passende Frage im Bereich „Sortiment & Warenkunde“ abgehakt, genau so, als hättest du sie im Quiz beantwortet." />}
      {phase === 'menu' && onOpenShop && <TipJar balance={tipBalance || 0} onOpenShop={onOpenShop} big todayLeft={tipTodayLeft} />}
      {phase === 'menu' && topicPanel}

      {phase !== 'menu' && conv && (
        <>
          <GameProgress label="Schritt" index={phase === 'done' ? total : stepIdx} answered={busy} total={total} right={phase === 'done' ? 'Gespräch fertig!' : undefined} />
          {step && <ReportContext report={{ game: 'Theken-Simulator', product: step.learn?.product || conv.steps.find(x => x.learn)?.learn?.product, text: `${step.topic}: ${step.customer.join(' ')}`, detail: `Richtig laut App: „${(step.options.find(o => o.correct) || step.options[0]).text}“` }} />}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ flex: '2 1 240px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '16px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>
              {(() => {
                const last = review[review.length - 1];
                const mood = phase === 'done' ? (isPerfect ? '🤩' : correct >= total - 2 ? '😊' : '😐') : !last ? '🙂' : last.ok ? '😊' : '😕';
                return <span key={`${mood}-${review.length}-${phase}`} className="lt-mood" title="So fühlt sich der Kunde gerade" style={{ flex: '0 0 46px', height: '46px', borderRadius: '50%', backgroundColor: TH.tintBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }} aria-label={`Stimmung: ${mood}`}>{mood}</span>;
              })()}
              <span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '18px' }}>{conv.persona.name}</span>
                <span style={{ display: 'block', fontSize: '15px', color: TH.muted }}>{conv.persona.who}{focus ? ` · Übung: ${focus}` : ''}</span>
              </span>
            </div>
            <StatChip label="Richtig" value={`${correct} / ${total}`} tone="yellow" />
            <StatChip label="Bedient" value={served} />
            {tipTotal > 0 && <StatChip label="Trinkgeld" value={euro(tipTotal)} />}
          </div>

          <div style={{ ...cardStyle, padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: TH.cream, position: 'relative' }}>
            <AnswerFx fx={thFx} streakIcon="⭐" pos="bottom" />
            {messages.map((m, i) => {
              if (m.from === 'note-ok' || m.from === 'note-bad') {
                const ok = m.from === 'note-ok';
                return (
                  <div key={i} className="lt-msg" style={{ alignSelf: 'center', maxWidth: '92%', padding: '8px 14px', borderRadius: '14px', backgroundColor: ok ? TH.tintSage : TH.tintPeach, color: ok ? TH.green : TH.red, fontSize: '16px', fontWeight: 700, lineHeight: 1.45, textAlign: 'center' }}>
                    {ok ? '✓ ' : '✗ '}{m.text}
                  </div>
                );
              }
              const isSeller = m.from === 'seller';
              const isStage = !isSeller && m.text.startsWith('(');
              if (isStage) {
                return <div key={i} className="lt-msg" style={{ alignSelf: 'center', fontSize: '15px', fontStyle: 'italic', color: TH.muted }}>{m.text.replace(/^\(|\)$/g, '')}</div>;
              }
              return (
                <div key={i} className="lt-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: isSeller ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: TH.muted, margin: isSeller ? '0 8px 3px 0' : '0 0 3px 8px' }}>{isSeller ? 'Du' : conv.persona.name}</span>
                  <div style={{ maxWidth: '82%', padding: '12px 16px', borderRadius: isSeller ? '20px 20px 6px 20px' : '20px 20px 20px 6px', backgroundColor: isSeller ? TH.yellow : TH.white, border: isSeller ? 'none' : `2px solid ${TH.line}`, fontSize: '18px', lineHeight: 1.45 }}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            {busy && (
              <div className="lt-msg" style={{ alignSelf: 'flex-start', padding: '10px 16px', borderRadius: '20px', backgroundColor: TH.white, border: `2px solid ${TH.line}`, fontSize: '20px', color: TH.muted }}><span className="lt-dots" aria-label="Kunde antwortet"><span /><span /><span /></span></div>
            )}
            <div ref={endRef} />
          </div>

          {phase === 'chat' && step && !busy && (
            <div key={stepIdx} className="lt-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {step.prices && step.prices.length > 0 && (
                <div className="lt-pop-in" style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintYellow, border: `2px dashed ${TH.brown}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Spickzettel · Preise</div>
                  {step.prices.map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '18px' }}>
                      <span>{b.qty > 1 ? <strong>{b.qty} × </strong> : null}{b.name}</span>
                      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{b.qty > 1 ? 'je ' : ''}{euro(b.cents)}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: '15px', color: TH.muted }}>Die Summe rechnest du selbst aus.</div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Deine Antwort · {step.topic}</div>
                <SpeakButton small text={`${conv.persona.title} sagt: ${step.customer.map(t => t.replace(/^\(|\)$/g, '')).join(' ')}. Deine Antworten: ${step.options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o.text}`).join('. ')}`} />
              </div>
              {step.options.map((o, i) => (
                <button key={i} onClick={() => choose(o)} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '60px', padding: '12px 16px', borderRadius: '16px', border: `3px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '18px', lineHeight: 1.4, textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ flex: '0 0 36px', height: '36px', borderRadius: '50%', border: `2px solid ${TH.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxSizing: 'border-box' }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ flex: 1 }}>{o.text}</span>
                </button>
              ))}
            </div>
          )}

          {phase === 'done' && (
            <div className="lt-pop-in" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <ConfettiOverlay active={isPerfect} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Beratung abgeschlossen</div>
              <div className="lt-count" style={{ fontFamily: TH.serif, fontSize: '56px', lineHeight: 1 }}>{correct} / {total}</div>
              <div style={{ fontSize: '19px', color: TH.brown }}>{isPerfect ? 'Perfekte Beratung, so geht Theke!' : correct >= total - 2 ? 'Gut gemacht! Deine Bewertung steht unten.' : 'Übung macht den Meister, unten siehst du, was du besser machen kannst.'}</div>
              {correct > 0 && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '18px', fontWeight: 700 }}>+{correct * 10 + (isPerfect ? 10 : 0)} Punkte für die Bestenliste</div>}
              {earnedTip > 0 && <div className="lt-count" style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintYellow, fontSize: '18px', fontWeight: 700 }}>💰 +{euro(earnedTip)} Trinkgeld von {conv.persona.title}{tipTotal > earnedTip ? ` · in dieser Runde ${euro(tipTotal)}` : ''}</div>}
              {tipCapped && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.cream, color: TH.muted, fontSize: '16px', fontWeight: 700 }}>{tipTodayLeft ? `Nur ${euro(tipTodayLeft)} davon passen heute noch in die Kasse, Tageslimit erreicht.` : 'Deine Kasse ist für heute voll, das Trinkgeld zählt erst morgen wieder.'}</div>}
              {tipLost && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintPeach, color: TH.red, fontSize: '17px', fontWeight: 700 }}>Das Trinkgeld ist diesmal weg, weil die Antwort beim Bezahlen nicht gepasst hat.</div>}
              {onOpenShop && <TipJar balance={tipBalance || 0} onOpenShop={onOpenShop} todayLeft={tipTodayLeft} />}
              {learned > 0 && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintBlue, fontSize: '17px', fontWeight: 700 }}>{learnedText(learned)}</div>}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
                <button onClick={() => startConversation(focus)} style={btnPrimary}>{focus ? `Nächster Kunde: ${focus}` : 'Nächster Kunde'}</button>
                {focus && <button onClick={() => startConversation()} style={{ ...btnPrimary, backgroundColor: TH.white, color: TH.ink, border: `2px solid ${TH.line}` }}>Gemischt weiter</button>}
              </div>
            </div>
          )}
          {phase === 'done' && review.length > 0 && (() => {
            const good = review.filter(r => r.ok);
            const bad = review.filter(r => !r.ok);
            const stars = Math.max(1, Math.round((good.length / review.length) * 5));
            return (
              <div className="lt-pop-in" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>Deine Bewertung</div>
                  <div aria-label={`${stars} von 5 Sternen`} style={{ fontSize: '28px', letterSpacing: '2px', color: dc('#D49A00') }}>{'★'.repeat(stars)}<span style={{ color: dc('#E6D6B8') }}>{'★'.repeat(5 - stars)}</span></div>
                </div>
                {good.length > 0 && (
                  <div style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintSage, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: TH.green }}>Das hast du gut gemacht</div>
                    {good.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '17px', lineHeight: 1.4 }}>
                        <span style={{ color: TH.green, fontWeight: 700 }}>✓</span>
                        <span><strong>{r.topic}:</strong> {THEKE_PRAISE[r.topic] || 'richtig beantwortet'}
                          <ReportLink align="left" report={{ game: 'Theken-Simulator', product: r.product || conv.steps.find(x => x.learn)?.learn?.product, text: `Thema: ${r.topic}\nKunde: ${r.q || ''}\nRichtig laut App: „${r.a || ''}“` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {bad.length > 0 ? (
                  <div style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintPeach, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: TH.red }}>Das kannst du noch besser machen</div>
                    {bad.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '17px', lineHeight: 1.45 }}>
                        <span style={{ color: TH.red, fontWeight: 700 }}>✗</span>
                        <span>
                          <strong>{r.topic}:</strong> {r.why || 'Hier war eine andere Antwort richtig.'}
                          {r.better && <span style={{ display: 'block', marginTop: '4px', color: TH.brown }}>Besser so: „{r.better}“</span>}
                          <ReportLink align="left" report={{ game: 'Theken-Simulator', product: r.product || conv.steps.find(x => x.learn)?.learn?.product, text: `Thema: ${r.topic}\nKunde: ${r.q || ''}\n${r.why || ''}${r.better ? `\nRichtig laut App: „${r.better}“` : ''}` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '17px', color: TH.green, fontWeight: 700 }}>Keine Fehler, genau so läuft ein gutes Verkaufsgespräch!</div>
                )}
                <div style={{ fontSize: '15px', color: TH.muted }}>Stimmt etwas im Gespräch nicht? Dann melde es hier, der Ausbilder schaut es sich an.</div>
                <ReportLink align="left" report={{ game: 'Theken-Simulator', product: conv.steps.find(x => x.learn)?.learn?.product, text: messages.filter(m => m.from === 'customer' || m.from === 'seller').map(m => `${m.from === 'seller' ? 'Du' : 'Kunde'}: ${m.text}`).join('\n').slice(-600) }} />
              </div>
            );
          })()}
          {phase === 'done' && topicPanel}
        </>
      )}
    </div>
  );
}

// ═════════════════════════ Bilderquiz „Welches Brot ist das?“ ═════════════════════════

/** Nach dem Antworten: Erklärung und „Weiter“-Knopf sanft ins Bild holen */
const scrollToNext = () => window.setTimeout(() => {
  const el = document.querySelector('.lt-expl');
  if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'end' });
}, 80);

type ShopProduct = (typeof SHOP_PRODUCTS)[number];
type BqCat = 'brot' | 'broetchen' | 'suess';
type BqRound = { answer: ShopProduct; options: ShopProduct[]; img: string };

/** Verpackte Artikel (Name steht auf der Tüte) und Sorten, die auf dem Foto gleich aussehen, lassen wir weg */
const BQ_EXCLUDE = new Set(['Backmischung Abendschnitte', 'Granola', 'Knäckebrot', 'Paniermehl', 'Mandelsplitter Zartbitter', 'Florentinertaler', 'Schweineohr mit Schokolade']);
const bqName = (n: string) => n.replace(/^(Kleines|Großes) /, '');
const bqCat = (p: ShopProduct): BqCat => (p.breadType && p.breadType !== 'stuten' ? 'brot' : ['Brötchen', 'Herzhafte Snacks'].includes(p.group) ? 'broetchen' : 'suess');
const BQ_FILTERS: { id: 'alle' | BqCat; label: string }[] = [
  { id: 'alle', label: 'Alles gemischt' },
  { id: 'brot', label: 'Nur Brot' },
  { id: 'broetchen', label: 'Brötchen & Snacks' },
  { id: 'suess', label: 'Süßes & Stuten' },
];
const firstSentence = (s: string) => {
  const m = (s || '').match(/^(.+?[.!])(\s|$)/);
  return (m ? m[1] : s || '').replace(/^Unser(e)?\s+[^ ]+(\s+[^ ]+)?\s+ist\s+/, '').replace(/^./, c => c.toUpperCase());
};

export function buildBilderPool(images: ProductImages) {
  const seen = new Set<string>();
  return SHOP_PRODUCTS.filter(p => {
    if (BQ_EXCLUDE.has(p.name) || p.name.startsWith('Großes ') || !images[productImageKey(p.name)]) return false;
    const k = bqName(p.name);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function buildBilderRounds(pool: ShopProduct[], images: ProductImages, filter: 'alle' | BqCat, count = 10, skip?: Set<string>): BqRound[] {
  const answers = focusShuffle(pool.filter(p => (filter === 'alle' || bqCat(p) === filter) && !(skip && skip.has(productImageKey(p.name)))), p => p.name, count).slice(0, count);
  return answers.map(answer => {
    const others = pool.filter(p => p.name !== answer.name);
    const same = others.filter(p => (answer.breadType ? p.breadType === answer.breadType : p.group === answer.group));
    const sameCat = others.filter(p => bqCat(p) === bqCat(answer));
    const picks: ShopProduct[] = [];
    for (const list of [shuffleArray(same), shuffleArray(sameCat), shuffleArray(others)]) {
      for (const p of list) {
        if (picks.length >= 3) break;
        if (!picks.some(x => bqName(x.name) === bqName(p.name))) picks.push(p);
      }
    }
    return { answer, options: shuffleArray([answer, ...picks]), img: images[productImageKey(answer.name)] };
  });
}

/** Foto-Fragen für das Quiz Battle: nur der Bild-Schlüssel wird gespeichert, nicht das Bild selbst */
export function buildPhotoBattleQuestions(images: ProductImages, count: number) {
  const pool = buildBilderPool(images);
  if (pool.length < 8) return [];
  return buildBilderRounds(pool, images, 'alle', count).map((r, i) => ({
    id: `foto_${productImageKey(r.answer.name)}_${i}`,
    question: 'Welches Produkt ist das?',
    imageKey: productImageKey(r.answer.name),
    options: r.options.map(o => bqName(o.name)),
    correct: r.options.findIndex(o => o.name === r.answer.name),
    explanation: '',
  }));
}

export function BilderQuizView({ images, onSaveScore, onFinished, known = [], onLearn }: { images: ProductImages; onSaveScore: (points: number, category: string) => void; onFinished?: (right: number, total: number, recognized: string[]) => void; known?: string[]; onLearn?: OnLearn }) {
  const [learned, setLearned] = useState(0);
  const [learnedNow, setLearnedNow] = useState(0);
  const pool = buildBilderPool(images);
  const knownSet = new Set(known);
  // „Nur neue Fotos“: schon erkannte Produkte kommen nicht nochmal (pro Gerät gemerkt)
  const [onlyNew, setOnlyNew] = useState<boolean>(() => { try { return localStorage.getItem('hinkel_bq_only_new') !== '0'; } catch { return true; } });
  const toggleOnlyNew = () => setOnlyNew(v => { const n = !v; try { localStorage.setItem('hinkel_bq_only_new', n ? '1' : '0'); } catch {} return n; });
  const recognizedRef = useRef<string[]>([]);
  const [state, setState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [filter, setFilter] = useState<'alle' | BqCat>('alle');
  const [rounds, setRounds] = useState<BqRound[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [fx, setFx] = useState<AnswerFxState>(null);
  const [run, setRun] = useState(0);

  const start = (count = 10) => {
    const r = buildBilderRounds(pool, images, filter, count, onlyNew ? knownSet : undefined);
    if (r.length === 0) return;
    recognizedRef.current = [];
    setLearned(0); setLearnedNow(0);
    setRounds(r); setIdx(0); setChosen(null); setRight(0); setRun(0); setFx(null); setState('playing'); scrollToPlay();
  };
  const choose = (name: string) => {
    if (chosen) return;
    setChosen(name);
    const ok = name === rounds[idx].answer.name;
    if (ok) { setRight(v => v + 1); recognizedRef.current.push(productImageKey(rounds[idx].answer.name)); }
    const pname = rounds[idx].answer.name;
    noteResult(pname, ok);
    const n = ok && onLearn ? onLearn([{ product: pname, kind: 'beschreibung' }, { product: pname, kind: 'gruppe' }]) : 0;
    setLearnedNow(n);
    if (n > 0) setLearned(v => v + n);
    if (n < 0) setLearnedNow(-1);
    const nr = ok ? run + 1 : 0;
    setRun(nr);
    setFx({ k: Date.now(), ok, text: ok ? (n > 0 ? '📚 Frage abgehakt!' : '📷 Erkannt!') : 'Knapp daneben', streak: nr });
    scrollToNext();
  };
  const next = () => {
    if (idx + 1 < rounds.length) { setIdx(idx + 1); setChosen(null); scrollToCard(); return; }
    finishBq(rounds.length);
  };
  const finishBq = (total: number) => {
    if (total <= 0) { setState('menu'); return; }
    setRounds(prev => prev.slice(0, total));
    setState('result');
    onFinished?.(right, total, [...recognizedRef.current]);
    if (right >= 5) onSaveScore(right * 5, 'Bilderquiz 📷');
  };

  if (pool.length < 4) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <PageHead title="Welches Brot ist das?" subtitle="Erkenne unsere Produkte am Foto." />
        <div style={{ ...cardStyle, fontSize: '18px', lineHeight: 1.5 }}>
          Die Produktfotos sind noch nicht geladen. Der Ausbilder muss sie einmal im Ausbilder-Bereich unter <strong>Einstellungen → Produktfotos</strong> importieren. Danach geht es hier los.
        </div>
      </div>
    );
  }

  const r = rounds[idx];
  const inFilter = (f: 'alle' | BqCat) => pool.filter(p => f === 'alle' || bqCat(p) === f);
  const countFor = (f: 'alle' | BqCat) => inFilter(f).length;
  const knownIn = (f: 'alle' | BqCat) => inFilter(f).filter(p => knownSet.has(productImageKey(p.name))).length;
  const totalF = countFor(filter), knownF = knownIn(filter), leftF = totalF - knownF;
  const pctF = totalF ? Math.round((knownF / totalF) * 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <PageHead title="Welches Brot ist das?" subtitle="Du siehst ein Foto aus unserem Sortiment, tippe auf den richtigen Namen. So erkennst du an der Theke alles auf einen Blick." />

      {state === 'menu' && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>Was möchtest du üben?</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {BQ_FILTERS.map(f => {
              const on = filter === f.id;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{ minHeight: '50px', padding: '0 18px', borderRadius: '999px', border: on ? 'none' : `2px solid ${TH.line}`, backgroundColor: on ? TH.brown : TH.white, color: on ? dc('#FFF6E0') : TH.ink, fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>
                  {f.label} ({knownIn(f.id)}/{countFor(f.id)})
                </button>
              );
            })}
          </div>
          <div style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.cream, border: `2px solid ${TH.line}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>Schon erkannt</span>
              <span style={{ fontFamily: TH.serif, fontSize: '26px' }}>{knownF} von {totalF}</span>
            </div>
            <div style={{ height: '12px', backgroundColor: dc('#F4EADB'), borderRadius: '999px', overflow: 'hidden' }}>
              <div className="lt-fill" style={{ width: `${pctF}%`, height: '100%', backgroundColor: TH.green, borderRadius: '999px', transition: 'width .5s ease' }} />
            </div>
            <span style={{ fontSize: '15px', color: TH.muted }}>{leftF === 0 ? 'Alle Produkte in diesem Bereich erkannt, stark!' : `Noch ${leftF} ${leftF === 1 ? 'Produkt' : 'Produkte'} offen.`}</span>
          </div>
          <button onClick={toggleOnlyNew} role="switch" aria-checked={onlyNew} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '16px', border: `2px solid ${onlyNew ? TH.brown : TH.line}`, backgroundColor: onlyNew ? TH.tintYellow : TH.white, color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
            <span aria-hidden="true" style={{ flex: '0 0 54px', height: '30px', borderRadius: '999px', backgroundColor: onlyNew ? TH.brown : dc('#D9CBB5'), position: 'relative', transition: 'background-color .2s ease' }}>
              <span style={{ position: 'absolute', top: '3px', left: onlyNew ? '27px' : '3px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), transition: 'left .2s ease' }} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '18px', fontWeight: 700 }}>Nur neue Fotos</span>
              <span style={{ display: 'block', fontSize: '15px', color: TH.muted }}>{onlyNew ? 'Produkte, die du schon erkannt hast, kommen nicht nochmal.' : 'Alle Produkte kommen dran, auch die, die du schon kennst.'}</span>
            </span>
          </button>
          {onlyNew && leftF === 0 ? (
            <div style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '17px', fontWeight: 700 }}>Hier gibt es nichts Neues mehr. Schalte „Nur neue Fotos“ aus, um alles zu wiederholen, oder wähle einen anderen Bereich.</div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintYellow, fontSize: '17px', fontWeight: 700 }}>{Math.min(10, onlyNew ? leftF : totalF)} Fotos · ab 5 richtigen gibt es Punkte für die Bestenliste.</div>
              {onLearn && <LearnHint text="Erkennst du ein Produkt richtig, werden seine Quizfragen „Welche Beschreibung passt?“ und „Zu welcher Warengruppe gehört …?“ im Bereich „Sortiment & Warenkunde“ abgehakt." />}
              <button onClick={() => start(10)} style={btnPrimary}>Los geht’s</button>
              <AllAtOnceButton count={onlyNew ? leftF : totalF} unit="Fotos" onClick={() => start(9999)} />
            </>
          )}
        </div>
      )}

      {state === 'playing' && r && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GameProgress label="Foto" index={idx} answered={!!chosen} total={rounds.length} />
          <ReportContext report={{ game: 'Bilderquiz', product: r.answer.name, text: `Welches Produkt ist auf dem Foto? (${r.options.map(o => bqName(o.name)).join(', ')})`, detail: `Richtig laut App: ${r.answer.name}` }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatChip label="Foto" value={`${idx + 1} / ${rounds.length}`} />
            {rounds.length > 10 && <FinishEarlyButton onClick={() => finishBq(idx + (chosen ? 1 : 0))} />}
            <StatChip label="Richtig" value={right} tone="yellow" />
          </div>
          <div key={idx} id="lt-game-card" className="lt-pop-in" style={{ ...cardStyle, padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', position: 'relative', scrollMarginTop: '12px' }}>
            <AnswerFx fx={chosen ? fx : null} streakIcon="🔥" />
            <img src={r.img} alt="Welches Produkt ist das?" style={{ width: '100%', maxWidth: '340px', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '20px', border: `2px solid ${TH.line}` }} />
            <div className="bq-grid" style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
              {r.options.map(o => {
                const isRight = o.name === r.answer.name;
                const isChosen = chosen === o.name;
                let bg: string = TH.cream, border: string = TH.line;
                if (chosen) {
                  if (isRight) { bg = TH.tintSage; border = TH.green; }
                  else if (isChosen) { bg = TH.tintPeach; border = TH.red; }
                  else { bg = TH.white; }
                }
                return (
                  <button key={o.name} className={chosen ? (isRight ? 'lt-correct' : isChosen ? 'lt-wrong' : undefined) : undefined} onClick={() => choose(o.name)} disabled={!!chosen} style={{ minHeight: '64px', padding: '10px 14px', borderRadius: '16px', border: `3px solid ${border}`, backgroundColor: bg, color: TH.ink, fontSize: '18px', fontWeight: 700, lineHeight: 1.25, cursor: chosen ? 'default' : 'pointer' }}>
                    {bqName(o.name)}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="lt-expl" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: chosen === r.answer.name ? TH.tintSage : TH.tintPeach, fontSize: '18px', lineHeight: 1.5 }}>
                  <span style={{ float: 'right', marginLeft: '8px' }}><SpeakButton small text={`Das ist ${bqName(r.answer.name)}. ${firstSentence(r.answer.description)} Warengruppe: ${r.answer.group}.`} /></span>
                  <strong>{chosen === r.answer.name ? 'Richtig! ' : 'Leider nicht. '}Das ist {bqName(r.answer.name)}</strong>
                  {r.answer.flour ? ` · ${r.answer.flour}` : ''}
                  <div style={{ marginTop: '4px', color: TH.brown }}>{firstSentence(r.answer.description)}</div>
                  <div style={{ marginTop: '4px', color: TH.muted, fontSize: '16px' }}>Warengruppe: {r.answer.group}</div>
                  {learnedNow > 0 && <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 700, color: dc('#2F4F8A') }}>📚 {learnedNow === 1 ? 'Eine Quizfrage' : `${learnedNow} Quizfragen`} zu „{bqName(r.answer.name)}“ jetzt in deinem Lernbereich abgehakt.</div>}
                  {learnedNow === 0 && chosen === r.answer.name && onLearn && <div style={{ marginTop: '8px', fontSize: '15px', color: dc('#2F4F8A') }}>📚 Die Quizfragen zu diesem Produkt hattest du schon gemeistert.</div>}
                </div>
                <button onClick={next} className="lt-sticky-next" style={btnPrimary}>{idx + 1 < rounds.length ? 'Nächstes Foto →' : 'Auswertung'}</button>
              </div>
            )}
          </div>
          <style>{`@media (max-width: 420px) { .bq-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      )}

      {state === 'result' && (
        <GameResult
          title="Bilderquiz geschafft"
          big={`${right} / ${rounds.length}`}
          text={right === rounds.length ? 'Alles erkannt, du bist ein echter Brot-Kenner!' : right >= 7 ? 'Sehr gut, fast alles erkannt!' : 'Schau dir die Steckbriefe mit Fotos an und versuch es nochmal.'}
          reward={[right >= 5 ? `+${right * 5} Punkte für die Bestenliste` : '', learned > 0 ? learnedText(learned) : ''].filter(Boolean).join(' · ') || null}
          celebrate={right >= 8}
          stars={starsFor(rounds.length ? right / rounds.length : 0)}
          againLabel="Nochmal spielen"
          onAgain={() => setState('menu')}
        />
      )}
    </div>
  );
}

// ═════════════════════════ Allergene-Training ═════════════════════════

type AllergenTest = { id: string; label: string; kein: string; tag: RegExp; ing: RegExp; safeRounds: boolean };
const ALLERGEN_TESTS: AllergenTest[] = [
  { id: 'milch', label: 'Milch', kein: 'keine Milch', tag: /^milch/i, ing: /milch|butter|sahne|quark|käse|joghurt|molke|laktose|gouda|feta/i, safeRounds: true },
  { id: 'eier', label: 'Eier', kein: 'keine Eier', tag: /^eier?$/i, ing: /\beier?\b|vollei|hühnerei|eigelb|eiweiß|eiklar/i, safeRounds: true },
  { id: 'nuesse', label: 'Nüsse', kein: 'keine Nüsse', tag: /schalenfrüchte|mandel|pistazie|haselnu|walnu/i, ing: /nuss|nüsse|mandel|haselnu|walnu|pistazie|cashew|pekan|macadamia/i, safeRounds: true },
  { id: 'sesam', label: 'Sesam', kein: 'keinen Sesam', tag: /sesam/i, ing: /sesam/i, safeRounds: false },
  { id: 'senf', label: 'Senf', kein: 'keinen Senf', tag: /^senf/i, ing: /senf/i, safeRounds: false },
  { id: 'sellerie', label: 'Sellerie', kein: 'keinen Sellerie', tag: /sellerie/i, ing: /sellerie/i, safeRounds: false },
];
type AllergenRound = { test: AllergenTest; mode: 'safe' | 'contains'; options: ShopProduct[]; answer: ShopProduct };

function splitByAllergen(t: AllergenTest) {
  const withIt: ShopProduct[] = [], without: ShopProduct[] = [];
  SHOP_PRODUCTS.forEach(p => {
    if (p.allergens.length === 0) return; // ohne Angabe im Shop: lieber nicht verwenden
    const tagged = p.allergens.some(a => t.tag.test(a));
    const inIngredients = t.ing.test(p.fullIngredients || '');
    if (tagged) withIt.push(p);
    else if (!inIngredients) without.push(p); // Zutatenliste und Allergene passen nicht zusammen → weglassen
  });
  return { withIt, without };
}

/** Alle möglichen Situationen im Allergene-Training (Allergen + richtiges Produkt) */
const ALLERGEN_KEYS: string[] = (() => {
  const keys = new Set<string>();
  ALLERGEN_TESTS.forEach(t => {
    const { withIt, without } = splitByAllergen(t);
    if (without.length >= 3) withIt.forEach(p => keys.add(`${t.id}|${p.name}`));
    if (t.safeRounds && withIt.length >= 3) without.forEach(p => keys.add(`${t.id}|${p.name}`));
  });
  return Array.from(keys);
})();

function buildAllergenRounds(count = 10, skip: string[] = []): AllergenRound[] {
  const rounds: AllergenRound[] = [];
  let guard = 0;
  while (rounds.length < count && guard++ < Math.max(400, count * 40)) {
    const t = ALLERGEN_TESTS[Math.floor(Math.random() * ALLERGEN_TESTS.length)];
    const { withIt, without } = splitByAllergen(t);
    const mode: 'safe' | 'contains' = t.safeRounds && Math.random() < 0.6 ? 'safe' : 'contains';
    const answerPool = mode === 'safe' ? without : withIt;
    const wrongPool = mode === 'safe' ? withIt : without;
    if (answerPool.length < 1 || wrongPool.length < 3) continue;
    const answer = focusShuffle(answerPool, p => p.name, 1).find(p => (count > 10 ? !rounds.some(r => r.answer.name === p.name && r.test.id === t.id) : !rounds.some(r => r.answer.name === p.name)) && !skip.includes(`${t.id}|${p.name}`));
    if (!answer) continue;
    rounds.push({ test: t, mode, answer, options: shuffleArray([answer, ...shuffleArray(wrongPool).slice(0, 3)]) });
  }
  return rounds;
}

export function AllergenTrainerView({ images, onSaveScore, onFinished, onLearn, known = {}, onKnown }: { images: ProductImages; onSaveScore: (points: number, category: string) => void; onFinished?: (right: number, total: number) => void; onLearn?: OnLearn; known?: KnownMap; onKnown?: OnKnown }) {
  const [onlyNew, toggleOnlyNew] = useOnlyNew('allergene');
  const knownAl = known.allergene || [];
  const alDone = ALLERGEN_KEYS.filter(k => knownAl.includes(k)).length;
  const [learned, setLearned] = useState(0);
  const [learnedNow, setLearnedNow] = useState(false);
  const [alreadyNow, setAlreadyNow] = useState(false);
  const [state, setState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [rounds, setRounds] = useState<AllergenRound[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [fx, setFx] = useState<AnswerFxState>(null);
  const [run, setRun] = useState(0);

  const start = (count = 10) => { const r = buildAllergenRounds(count, onlyNew ? knownAl : []); if (!r.length) return; setRounds(r); setIdx(0); setChosen(null); setRight(0); setRun(0); setFx(null); setLearned(0); setLearnedNow(false); setState('playing'); scrollToPlay(); };
  const choose = (name: string) => {
    if (chosen) return;
    setChosen(name);
    const ok = name === rounds[idx].answer.name;
    if (ok) setRight(v => v + 1);
    noteResult(rounds[idx].answer.name, ok);
    const n = ok && onLearn ? onLearn([{ product: rounds[idx].answer.name, kind: 'allergene' }]) : 0;
    if (ok) onKnown?.('allergene', [`${rounds[idx].test.id}|${rounds[idx].answer.name}`]);
    setLearnedNow(n > 0); setAlreadyNow(n === 0);
    if (n > 0) setLearned(v => v + n);
    const nr = ok ? run + 1 : 0;
    setRun(nr);
    setFx({ k: Date.now(), ok, text: ok ? (n > 0 ? '📚 Frage abgehakt!' : '🛡️ Sicher beraten!') : '⚠️ Vorsicht!', streak: nr });
    scrollToNext();
  };
  const next = () => {
    if (idx + 1 < rounds.length) { setIdx(idx + 1); setChosen(null); scrollToCard(); return; }
    finishAl(rounds.length);
  };
  const finishAl = (total: number) => {
    if (total <= 0) { setState('menu'); return; }
    setRounds(prev => prev.slice(0, total));
    setState('result');
    onFinished?.(right, total);
    if (right >= 5) onSaveScore(right * 5, 'Allergene-Training 🛡️');
  };

  const r = rounds[idx];
  const question = r
    ? r.mode === 'safe'
      ? { who: 'Eine Kundin sagt:', quote: `„Ich habe eine Allergie gegen ${r.test.label}.“`, ask: `Welches dieser Produkte enthält laut Allergenliste ${r.test.kein}?` }
      : { who: 'Ein Kunde sagt:', quote: `„Ich vertrage ${r.test.kein}.“`, ask: 'Von welchem Produkt musst du ihm abraten?' }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <PageHead title="Allergene-Training" subtitle="Kunden mit Allergien richtig beraten, mit den echten Allergenangaben aus unserem Shop." />

      {state === 'menu' && (
        <GameIntro
          title="Sicher beraten bei Allergien"
          text="Ein Kunde nennt seine Allergie. Du wählst das passende Produkt, oder das, von dem du abraten musst. Nach jeder Antwort siehst du die Allergene aller Produkte."
          hint="Wichtig an der Theke: Nie raten! Im Zweifel immer die vollständige Zutatenliste prüfen oder in der Backstube nachfragen."
          startLabel="Training starten (10 Kunden)"
          onStart={() => start(10)}
        />
      )}
      {state === 'menu' && <OnlyNewToggle on={onlyNew} onToggle={toggleOnlyNew} label="Nur neue Kunden-Situationen" done={alDone} total={ALLERGEN_KEYS.length} unit="Situationen" />}
      {state === 'menu' && <AllAtOnceButton count={onlyNew ? ALLERGEN_KEYS.length - alDone : ALLERGEN_KEYS.length} unit="Situationen" onClick={() => start(onlyNew ? ALLERGEN_KEYS.length - alDone : ALLERGEN_KEYS.length)} />}
      {state === 'menu' && onLearn && <LearnHint text="Berätst du richtig, wird die Quizfrage „Welche Allergene sind bei … angegeben?“ zum richtigen Produkt im Bereich „Sortiment & Warenkunde“ abgehakt. Nach jeder Antwort siehst du dafür alle Allergene." />}

      {state === 'playing' && r && question && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GameProgress label="Kunde" index={idx} answered={!!chosen} total={rounds.length} />
          <ReportContext report={{ game: 'Allergene-Training', product: r.answer.name, text: `${question.quote} ${question.ask} (${r.options.map(o => o.name).join(', ')})`, detail: `Richtig laut App: ${r.answer.name}\n${r.options.map(o => `${o.name}: ${o.allergens.join(', ') || 'keine Angabe'}`).join('; ')}` }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatChip label="Kunde" value={`${idx + 1} / ${rounds.length}`} />
            <StatChip label="Richtig" value={right} tone="yellow" />
            {rounds.length > 10 && <FinishEarlyButton onClick={() => finishAl(idx + (chosen ? 1 : 0))} />}
          </div>
          <div key={idx} id="lt-game-card" className="lt-pop-in" style={{ ...cardStyle, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', scrollMarginTop: '12px' }}>
            <AnswerFx fx={chosen ? fx : null} streakIcon="🛡️" />
            <div style={{ padding: '14px 18px', borderRadius: '18px', backgroundColor: TH.tintBlue }}>
              <div style={{ fontSize: '16px', color: TH.muted, fontWeight: 700 }}>{question.who}</div>
              <div style={{ fontFamily: TH.serif, fontSize: '26px', lineHeight: 1.2, marginTop: '2px' }}>{question.quote}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.35 }}>{question.ask}</div>
              <SpeakButton small text={chosen ? (r.mode === 'safe' ? `${r.answer.name} enthält laut Liste ${r.test.kein}, die anderen schon.` : `${r.answer.name} enthält ${r.test.label}, davon musst du abraten.`) + ' ' + r.options.map(o => `${o.name}: ${o.allergens.join(', ')}`).join('. ') : `${question.who} ${question.quote} ${question.ask} ${r.options.map((o, i) => `${i + 1}: ${o.name}`).join('. ')}`} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {r.options.map(o => {
                const isRight = o.name === r.answer.name;
                const isChosen = chosen === o.name;
                let bg: string = TH.cream, border: string = TH.line;
                if (chosen) {
                  if (isRight) { bg = TH.tintSage; border = TH.green; }
                  else if (isChosen) { bg = TH.tintPeach; border = TH.red; }
                  else { bg = TH.white; }
                }
                const img = images[productImageKey(o.name)];
                return (
                  <button key={o.name} className={chosen ? (isRight ? 'lt-correct' : isChosen ? 'lt-wrong' : undefined) : undefined} onClick={() => choose(o.name)} disabled={!!chosen} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px', padding: '8px 14px', borderRadius: '16px', border: `3px solid ${border}`, backgroundColor: bg, color: TH.ink, textAlign: 'left', cursor: chosen ? 'default' : 'pointer' }}>
                    {img && <img src={img} alt="" style={{ flex: '0 0 48px', width: '48px', height: '48px', objectFit: 'cover', borderRadius: '12px' }} />}
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '19px', fontWeight: 700 }}>{o.name}</span>
                      {chosen && <span style={{ display: 'block', fontSize: '15px', color: TH.muted, marginTop: '2px' }}>Allergene: {o.allergens.join(', ')}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {chosen && (
              <>
                <div className="lt-expl" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: chosen === r.answer.name ? TH.tintSage : TH.tintPeach, fontSize: '18px', lineHeight: 1.5 }}>
                  <strong>{chosen === r.answer.name ? 'Richtig! ' : 'Vorsicht! '}</strong>
                  {r.mode === 'safe'
                    ? `${r.answer.name} enthält laut Liste ${r.test.kein}, die anderen schon.`
                    : `${r.answer.name} enthält ${r.test.label}, davon musst du abraten.`}
                  {learnedNow && <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 700, color: dc('#2F4F8A') }}>📚 Die Quizfrage „Welche Allergene sind bei {r.answer.name} angegeben?“ ist jetzt in deinem Lernbereich abgehakt.</div>}
                  {alreadyNow && chosen === r.answer.name && onLearn && <div style={{ marginTop: '8px', fontSize: '15px', color: dc('#2F4F8A') }}>📚 Die Allergen-Frage zu {r.answer.name} hattest du schon gemeistert.</div>}
                </div>
                <button onClick={next} className="lt-sticky-next" style={btnPrimary}>{idx + 1 < rounds.length ? 'Nächster Kunde →' : 'Auswertung'}</button>
              </>
            )}
          </div>
        </div>
      )}

      {state === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <GameResult
            title="Allergene-Training geschafft"
            big={`${right} / ${rounds.length}`}
            text={right === rounds.length ? 'Perfekt, bei dir sind Allergiker in guten Händen!' : right >= 7 ? 'Gut gemacht! Schau dir die Fehler im Spickzettel an.' : 'Das üben wir nochmal, Allergene sind an der Theke besonders wichtig.'}
            reward={[right >= 5 ? `+${right * 5} Punkte für die Bestenliste` : "", learned > 0 ? learnedText(learned) : ""].filter(Boolean).join(" · ") || null}
            celebrate={right >= 8}
            stars={starsFor(rounds.length ? right / rounds.length : 0)}
          againLabel="Nochmal trainieren"
            onAgain={start}
          />
          <div style={{ ...cardStyle, fontSize: '16px', color: TH.muted, lineHeight: 1.5 }}>
            Hinweis: Die Angaben stammen aus unserem Online-Shop. Spuren (z. B. Gluten im Buchweizenbrot) stehen nicht immer dabei, bei Allergien immer die vollständige Zutatenliste prüfen.
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════ Kleine Helfer für die neuen Spiele ═════════════════════════

/** Zufallszahlen, die jedes Mal gleich herauskommen (für Kalender und „Produkt des Tages“) */
const seededRandom = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rnd = seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const imgOf = (images: ProductImages, p: ShopProduct) => images[productImageKey(p.name)] || '';
const centsText = (c: number) => (c / 100).toFixed(2).replace('.', ',') + ' €';

/** Zählt eine Zahl kurz hoch (für aufgedeckte Preise) */
function CountUpPrice({ cents }: { cents: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 650);
      setV(Math.round(cents * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [cents]);
  return <>{centsText(v)}</>;
}

// ═════════════════════════ Teurer oder billiger? ═════════════════════════

const PRICE_POOL = SHOP_PRODUCTS.filter(p => parseCents(p.price) > 0 && !['Sonstiges', 'Backmischung'].includes(p.group));

/** Nächstes Produkt: anderer Preis (mind. 10 Cent Unterschied), je länger die Serie, desto knapper die Preise */
function nextPriceProduct(current: ShopProduct, used: string[], streak: number, avoid: string[] = []): ShopProduct {
  const cur = parseCents(current.price);
  let cands = PRICE_POOL.filter(p => p.name !== current.name && bqName(p.name) !== bqName(current.name) && !used.includes(p.name) && !avoid.includes(p.name) && Math.abs(parseCents(p.price) - cur) >= 10);
  if (cands.length < 4 && avoid.length) cands = PRICE_POOL.filter(p => p.name !== current.name && bqName(p.name) !== bqName(current.name) && !used.includes(p.name) && Math.abs(parseCents(p.price) - cur) >= 10);
  if (cands.length < 4) cands = PRICE_POOL.filter(p => p.name !== current.name && Math.abs(parseCents(p.price) - cur) >= 10);
  const sorted = [...cands].sort((a, b) => Math.abs(parseCents(a.price) - cur) - Math.abs(parseCents(b.price) - cur));
  const share = streak >= 8 ? 0.25 : streak >= 3 ? 0.5 : 1;
  return focusShuffle(sorted.slice(0, Math.max(3, Math.ceil(sorted.length * share))), p => p.name, 1)[0];
}

function PriceCard({ p, images, reveal, hidden, tone }: { p: ShopProduct; images: ProductImages; reveal?: boolean; hidden?: boolean; tone?: 'ok' | 'bad' }) {
  const img = imgOf(images, p);
  const border = tone === 'ok' ? TH.green : tone === 'bad' ? TH.red : TH.line;
  return (
    <div style={{ ...cardStyle, padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', textAlign: 'center', borderColor: border, borderWidth: tone ? '3px' : '2px', minWidth: 0 }}>
      {img
        ? <img src={img} alt="" style={{ width: '100%', maxWidth: '220px', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '16px' }} />
        : <div style={{ width: '100%', maxWidth: '220px', aspectRatio: '1 / 1', borderRadius: '16px', backgroundColor: TH.tintYellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>🥖</div>}
      <div style={{ fontSize: '19px', fontWeight: 700, lineHeight: 1.25 }}>{p.name}</div>
      <div style={{ fontSize: '15px', color: TH.muted, minHeight: '20px' }}>{[p.group, p.weight].filter(Boolean).join(' · ')}</div>
      <div className={reveal ? 'lt-count' : undefined} style={{ fontFamily: TH.serif, fontSize: '34px', lineHeight: 1, color: hidden ? TH.muted : TH.ink }}>
        {hidden ? '? €' : reveal ? <CountUpPrice cents={parseCents(p.price)} /> : centsText(parseCents(p.price))}
      </div>
    </div>
  );
}

export function PreisDuellView({ images, best = 0, onSaveScore, onFinished, onLearn, known = {}, onKnown }: { images: ProductImages; best?: number; onSaveScore: (points: number, category: string) => void; onFinished?: (streak: number) => void; onLearn?: OnLearn; known?: KnownMap; onKnown?: OnKnown }) {
  const [learned, setLearned] = useState(0);
  const [onlyNew, toggleOnlyNew] = useOnlyNew('preis');
  const knownPrices = known.preis || [];
  const avoid = onlyNew ? knownPrices : [];
  const [state, setState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [a, setA] = useState<ShopProduct | null>(null);
  const [b, setB] = useState<ShopProduct | null>(null);
  const [guess, setGuess] = useState<'up' | 'down' | null>(null);
  const [pdHistory, setPdHistory] = useState<{ a: string; ac: number; b: string; bc: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [fx, setFx] = useState<AnswerFxState>(null);
  const usedRef = useRef<string[]>([]);
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const start = () => {
    const first = pick(PRICE_POOL);
    usedRef.current = [first.name];
    const second = nextPriceProduct(first, usedRef.current, 0, avoid);
    usedRef.current.push(second.name);
    setA(first); setB(second); setGuess(null); setStreak(0); setRound(0); setFx(null); setLearned(0); setPdHistory([]); setState('playing'); scrollToPlay();
  };
  const answer = (g: 'up' | 'down') => {
    if (!a || !b || guess) return;
    setGuess(g);
    setPdHistory(h => [...h, { a: a.name, ac: parseCents(a.price), b: b.name, bc: parseCents(b.price) }]);
    const higher = parseCents(b.price) > parseCents(a.price);
    const ok = (g === 'up') === higher;
    noteResult(b.name, ok);
    if (ok) {
      const ns = streak + 1;
      setStreak(ns);
      const n = onLearn ? onLearn([{ product: b.name, kind: 'preis' }]) : 0;
      onKnown?.('preis', [b.name]);
      if (n > 0) setLearned(v => v + n);
      setFx({ k: Date.now(), ok: true, text: n > 0 ? '📚 Preis-Frage abgehakt!' : '💶 Richtig!', streak: ns });
      timerRef.current = window.setTimeout(() => {
        const nb = nextPriceProduct(b, usedRef.current.slice(-12), ns, [...avoid, b.name]);
        usedRef.current.push(nb.name);
        setA(b); setB(nb); setGuess(null); setRound(r => r + 1);
      }, 1300);
    } else {
      setFx({ k: Date.now(), ok: false, text: 'Daneben!' });
    }
  };
  const finish = () => {
    setState('result');
    onFinished?.(streak);
    if (streak >= 3) onSaveScore(streak * 10, 'Teurer oder billiger 💶');
  };

  const lost = !!(guess && a && b && ((guess === 'up') !== (parseCents(b.price) > parseCents(a.price))));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <PageHead title="Teurer oder billiger?" subtitle="Ist das zweite Produkt teurer oder billiger als das erste? Ein Fehler, und die Runde ist vorbei." />
      {state === 'menu' && (
        <GameIntro
          title="Wie gut kennst du unsere Preise?"
          text="Links siehst du ein Produkt mit Preis, rechts ein zweites ohne Preis. Tippe auf „Teurer“ oder „Billiger“. Liegst du richtig, rückt das Produkt nach links und das nächste kommt. Je länger deine Serie, desto knapper werden die Preise."
          hint={`Ab 3 richtigen am Stück gibt es Punkte (10 pro Treffer).${best > 0 ? ` Deine beste Serie: ${best}` : ''}`}
          startLabel="Los geht’s"
          onStart={start}
        />
      )}
      {state === 'menu' && <OnlyNewToggle on={onlyNew} onToggle={toggleOnlyNew} label="Nur neue Preise" done={PRICE_POOL.filter(p => knownPrices.includes(p.name)).length} total={PRICE_POOL.length} unit="Preise" />}
      {state === 'menu' && onLearn && <LearnHint text="Liegst du richtig, wird die Quizfrage „Was kostet …?“ zum aufgedeckten Produkt im Bereich „Sortiment & Warenkunde“ abgehakt, den Preis hast du ja gerade gesehen." />}
      {state === 'playing' && a && b && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ReportContext report={{ game: 'Teurer oder billiger', product: b.name, text: `Ist ${b.name} teurer oder billiger als ${a.name} (${centsText(parseCents(a.price))})?`, detail: `Preise laut App: ${b.name} ${centsText(parseCents(b.price))}, ${a.name} ${centsText(parseCents(a.price))}` }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatChip label="Serie" value={streak} tone="yellow" />
            <StatChip label="Bestwert" value={Math.max(best, streak)} />
          </div>
          <div key={round} className="lt-pop-in" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', alignItems: 'stretch' }}>
            <AnswerFx fx={guess ? fx : null} streakIcon="💶" />
            <PriceCard p={a} images={images} />
            <PriceCard p={b} images={images} hidden={!guess} reveal={!!guess} tone={guess ? (lost ? 'bad' : 'ok') : undefined} />
            <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%, -50%)', width: '46px', height: '46px', borderRadius: '50%', backgroundColor: TH.brown, color: dc('#FFF6E0'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', boxShadow: '0 6px 14px -4px rgba(0,0,0,.4)' }}>vs</span>
          </div>
          {!guess && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <button onClick={() => answer('up')} style={{ ...btnPrimary, minHeight: '70px', fontSize: '21px', backgroundColor: TH.green }}>▲ Teurer</button>
              <button onClick={() => answer('down')} style={{ ...btnPrimary, minHeight: '70px', fontSize: '21px', backgroundColor: TH.red }}>▼ Billiger</button>
            </div>
          )}
          {guess && !lost && <div style={{ textAlign: 'center', fontSize: '18px', color: TH.green, fontWeight: 700 }}>Richtig, {b.name} kostet {centsText(parseCents(b.price))}. Weiter geht’s …</div>}
          {lost && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="lt-expl" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintPeach, fontSize: '18px', lineHeight: 1.5 }}>
                <strong>{b.name}</strong> kostet {centsText(parseCents(b.price))}, das ist {parseCents(b.price) > parseCents(a.price) ? 'teurer' : 'billiger'} als {a.name} ({centsText(parseCents(a.price))}).
              </div>
              <button onClick={finish} className="lt-sticky-next" style={btnPrimary}>Auswertung</button>
            </div>
          )}
        </div>
      )}
      {state === 'result' && (
        <GameResult
          title="Teurer oder billiger"
          big={`${streak} in Folge`}
          text={streak > best && streak > 0 ? 'Neuer persönlicher Rekord, stark!' : streak >= 10 ? 'Du kennst unsere Preise richtig gut!' : streak >= 3 ? 'Gut gemacht, schaffst du noch mehr?' : 'Schau dir die Preise im Spickzettel an und versuch es nochmal.'}
          reward={[streak >= 3 ? `+${streak * 10} Punkte für die Bestenliste` : '', learned > 0 ? learnedText(learned) : ''].filter(Boolean).join(' · ') || null}
          celebrate={streak >= 10 || (streak > best && streak >= 5)}
          stars={streak >= 10 ? 3 : streak >= 6 ? 2 : streak >= 3 ? 1 : 0}
          againLabel="Nochmal spielen"
          onAgain={start}
        />
      )}
      {state === 'result' && <ReportList title="Alle Preise dieser Runde ansehen (Fehler melden)" items={pdHistory.map(h => ({ label: <span><strong>{h.b}</strong> {centsText(h.bc)} · {h.a} {centsText(h.ac)}</span>, report: { game: 'Teurer oder billiger', product: h.b, text: `${h.b}: ${centsText(h.bc)}\n${h.a}: ${centsText(h.ac)}` } }))} />}
    </div>
  );
}

// ═════════════════════════ Schneide-Profi ═════════════════════════

const SLICE_OPTIONS = [
  { mm: '5,5 mm', label: 'dünn', w: 5.5 },
  { mm: '9 mm', label: 'mittel', w: 9 },
  { mm: '12 mm', label: 'dick', w: 12 },
];
/** Im Schneide-Profi nur echte Schnittbrote – diese Produkte kommen dort nicht vor */
const SLICE_EXCLUDE = ['Wunderzopf'];
const SLICE_POOL = SHOP_PRODUCTS.filter(p => !!p.breadType && !!SLICE[p.breadType] && ['Brot', 'Stuten & Brioche'].includes(p.group) && !SLICE_EXCLUDE.includes(p.name));

function buildSliceRounds(count = 10, skip: string[] = []): ShopProduct[] {
  const by = (mm: string) => focusShuffle(SLICE_POOL.filter(p => SLICE[p.breadType!] === mm && !skip.includes(p.name)), p => p.name, 3);
  const thin = by('5,5 mm'), mid = by('9 mm'), thick = by('12 mm');
  let picked = [...thin.slice(0, 3), ...thick.slice(0, 3), ...mid.slice(0, count - Math.min(3, thin.length) - Math.min(3, thick.length))];
  if (picked.length < count) picked = [...picked, ...shuffleArray([...thin.slice(3), ...thick.slice(3), ...mid].filter(p => !picked.includes(p)))].slice(0, count);
  return shuffleArray(picked).slice(0, count);
}

/** Kleines Brot mit Scheiben im richtigen Abstand */
function SliceLoaf({ mm, highlight }: { mm: number; highlight?: boolean }) {
  const gap = mm * 3.2;
  const count = Math.floor(150 / gap) + 1;
  const lines = Array.from({ length: count }, (_, i) => 20 + i * gap + (150 - (count - 1) * gap) / 2);
  return (
    <svg viewBox="0 0 190 70" width="100%" style={{ maxWidth: '190px', display: 'block' }} aria-hidden="true">
      <path d="M8 62 Q8 14 60 10 L130 10 Q182 14 182 62 Z" fill={highlight ? dc('#E9B872') : dc('#D9B48A')} stroke={dc('#8A5A2B')} strokeWidth="2.5" />
      {lines.filter(x => x < 176).map((x, i) => <line key={i} x1={x} y1={14} x2={x} y2={60} stroke={dc('#FFF6E0')} strokeWidth="2.2" />)}
    </svg>
  );
}

export function SchneideProfiView({ images, best = 0, onSaveScore, onFinished, onLearn, known = {}, onKnown }: { images: ProductImages; best?: number; onSaveScore: (points: number, category: string) => void; onFinished?: (right: number, total: number) => void; onLearn?: OnLearn; known?: KnownMap; onKnown?: OnKnown }) {
  const [onlyNew, toggleOnlyNew] = useOnlyNew('schnitt');
  const knownSlice = known.schnitt || [];
  const sliceDone = SLICE_POOL.filter(p => knownSlice.includes(p.name)).length;
  const sliceLeft = SLICE_POOL.length - sliceDone;
  const [learned, setLearned] = useState(0);
  const [learnedNow, setLearnedNow] = useState(false);
  const [alreadyNow, setAlreadyNow] = useState(false);
  const [state, setState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [rounds, setRounds] = useState<ShopProduct[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [run, setRun] = useState(0);
  const [fx, setFx] = useState<AnswerFxState>(null);

  const start = (count = 10) => { const r = buildSliceRounds(count, onlyNew ? knownSlice : []); if (!r.length) return; setRounds(r); setIdx(0); setChosen(null); setRight(0); setRun(0); setFx(null); setLearned(0); setLearnedNow(false); setState('playing'); scrollToPlay(); };
  const p = rounds[idx];
  const correct = p ? SLICE[p.breadType!] : '';
  const choose = (mm: string) => {
    if (chosen || !p) return;
    setChosen(mm);
    const ok = mm === correct;
    if (ok) setRight(v => v + 1);
    noteResult(p.name, ok);
    const n = ok && onLearn ? onLearn([{ product: p.name, kind: 'schnitt' }]) : 0;
    if (ok) onKnown?.('schnitt', [p.name]);
    setLearnedNow(n > 0); setAlreadyNow(n === 0);
    if (n > 0) setLearned(v => v + n);
    const nr = ok ? run + 1 : 0;
    setRun(nr);
    setFx({ k: Date.now(), ok, text: ok ? (n > 0 ? '📚 Frage abgehakt!' : '🔪 Sauber geschnitten!') : 'Falsche Stärke', streak: nr });
    scrollToNext();
  };
  const next = () => {
    if (idx + 1 < rounds.length) { setIdx(idx + 1); setChosen(null); scrollToCard(); return; }
    finishSl(rounds.length);
  };
  const finishSl = (total: number) => {
    if (total <= 0) { setState('menu'); return; }
    setRounds(prev => prev.slice(0, total));
    setState('result');
    onFinished?.(right, total);
    if (right >= 5) onSaveScore(right * 5, 'Schneide-Profi 🔪');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <PageHead title="Schneide-Profi" subtitle="Der Kunde möchte das Brot geschnitten, welche Scheibenstärke stellst du an der Maschine ein?" />
      {state === 'menu' && (
        <div className="lt-pop-in" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>Merke dir die drei Stärken</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { mm: 5.5, t: '5,5 mm', d: 'Vollkornschwarzbrot' },
              { mm: 9, t: '9 mm', d: 'Roggen-, Misch-, Dinkel- und Spezialbrote' },
              { mm: 12, t: '12 mm', d: 'Weizenbrote und Stuten' },
            ].map(s => (
              <div key={s.t} style={{ padding: '14px', borderRadius: '16px', backgroundColor: TH.cream, border: `2px solid ${TH.line}`, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', textAlign: 'center' }}>
                <SliceLoaf mm={s.mm} />
                <div style={{ fontFamily: TH.serif, fontSize: '26px' }}>{s.t}</div>
                <div style={{ fontSize: '16px', color: TH.brown }}>{s.d}</div>
              </div>
            ))}
          </div>
          <OnlyNewToggle on={onlyNew} onToggle={toggleOnlyNew} label="Nur neue Brote" done={sliceDone} total={SLICE_POOL.length} unit="Brote" />
          <div style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintYellow, fontSize: '17px', fontWeight: 700 }}>{Math.min(10, onlyNew ? sliceLeft : SLICE_POOL.length)} Brote · ab 5 richtigen gibt es Punkte.{best > 0 ? ` Dein Bestwert: ${best} / 10` : ''}</div>
          {onLearn && <LearnHint text="Jedes richtig eingestellte Brot hakt die passende Frage „Mit welcher Schnittstärke wird … geschnitten?“ im Bereich „Sortiment & Warenkunde“ ab." />}
          {onlyNew && sliceLeft === 0
            ? <div style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '17px', fontWeight: 700 }}>Du hast alle Brote richtig geschnitten. Schalte „Nur neue Brote“ aus, um alles zu wiederholen.</div>
            : <>
                <button onClick={() => start(10)} style={btnPrimary}>Los geht’s</button>
                <AllAtOnceButton count={onlyNew ? sliceLeft : SLICE_POOL.length} unit="Brote" onClick={() => start(9999)} />
              </>}
        </div>
      )}
      {state === 'playing' && p && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GameProgress label="Brot" index={idx} answered={!!chosen} total={rounds.length} />
          <ReportContext report={{ game: 'Schneide-Profi', product: p.name, text: `Mit welcher Schnittstärke wird ${p.name} geschnitten?`, detail: `Richtig laut App: ${correct}` }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatChip label="Brot" value={`${idx + 1} / ${rounds.length}`} />
            {rounds.length > 10 && <FinishEarlyButton onClick={() => finishSl(idx + (chosen ? 1 : 0))} />}
            <StatChip label="Richtig" value={right} tone="yellow" />
          </div>
          <div key={idx} id="lt-game-card" className="lt-pop-in" style={{ ...cardStyle, padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', position: 'relative', scrollMarginTop: '12px' }}>
            <AnswerFx fx={chosen ? fx : null} streakIcon="🔪" />
            {imgOf(images, p)
              ? <img src={imgOf(images, p)} alt={p.name} style={{ width: '100%', maxWidth: '300px', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '20px', border: `2px solid ${TH.line}` }} />
              : <div style={{ width: '100%', maxWidth: '300px', aspectRatio: '4 / 3', borderRadius: '20px', backgroundColor: TH.tintYellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>🍞</div>}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>{p.name}</div>
              <div style={{ fontSize: '17px', color: TH.muted, marginTop: '4px' }}>„Einmal geschnitten, bitte!“</div>
            </div>
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
              {SLICE_OPTIONS.map(o => {
                const isRight = o.mm === correct;
                const isChosen = chosen === o.mm;
                let bg: string = TH.cream, border: string = TH.line;
                if (chosen) {
                  if (isRight) { bg = TH.tintSage; border = TH.green; }
                  else if (isChosen) { bg = TH.tintPeach; border = TH.red; }
                  else bg = TH.white;
                }
                return (
                  <button key={o.mm} className={chosen ? (isRight ? 'lt-correct' : isChosen ? 'lt-wrong' : undefined) : undefined} onClick={() => choose(o.mm)} disabled={!!chosen} style={{ minHeight: '96px', padding: '10px 6px', borderRadius: '16px', border: `3px solid ${border}`, backgroundColor: bg, color: TH.ink, cursor: chosen ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <SliceLoaf mm={o.w} highlight={chosen ? isRight : false} />
                    <span style={{ fontFamily: TH.serif, fontSize: '24px', lineHeight: 1 }}>{o.mm}</span>
                    <span style={{ fontSize: '14px', color: TH.muted }}>{o.label}</span>
                  </button>
                );
              })}
            </div>
            {chosen && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="lt-expl" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: chosen === correct ? TH.tintSage : TH.tintPeach, fontSize: '18px', lineHeight: 1.5 }}>
                  <span style={{ float: 'right', marginLeft: '8px' }}><SpeakButton small text={`${p.name} wird mit ${correct} geschnitten.`} /></span>
                  <strong>{chosen === correct ? 'Richtig! ' : 'Leider nicht. '}{p.name} wird mit {correct} geschnitten.</strong>
                  <div style={{ marginTop: '4px', color: TH.brown }}>{p.name} ist {TYPE_LABEL[p.breadType!] === 'Stuten & Brioche' ? 'ein Stuten' : `ein ${TYPE_LABEL[p.breadType!]}`}{p.flour ? ` (${p.flour})` : ''}.</div>
                  {learnedNow && <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 700, color: dc('#2F4F8A') }}>📚 Die Quizfrage zur Schnittstärke von „{p.name}“ ist jetzt in deinem Lernbereich abgehakt.</div>}
                  {alreadyNow && chosen === correct && onLearn && <div style={{ marginTop: '8px', fontSize: '15px', color: dc('#2F4F8A') }}>📚 Diese Quizfrage hattest du schon gemeistert.</div>}
                </div>
                <button onClick={next} className="lt-sticky-next" style={btnPrimary}>{idx + 1 < rounds.length ? 'Nächstes Brot →' : 'Auswertung'}</button>
              </div>
            )}
          </div>
        </div>
      )}
      {state === 'result' && (
        <GameResult
          title="Schneide-Profi"
          big={`${right} / ${rounds.length}`}
          text={right === rounds.length && rounds.length < 10 ? 'Alles richtig!' : right === rounds.length ? 'Jede Scheibe perfekt, du bist ein echter Schneide-Profi!' : right >= 7 ? 'Sehr gut, fast alles richtig eingestellt!' : 'Merk dir: Schwarzbrot dünn, Weizen & Stuten dick, alles andere 9 mm.'}
          reward={[right >= 5 ? `+${right * 5} Punkte für die Bestenliste` : '', learned > 0 ? learnedText(learned) : ''].filter(Boolean).join(' · ') || null}
          celebrate={right >= 9}
          stars={starsFor(rounds.length ? right / rounds.length : 0)}
          againLabel="Nochmal spielen"
          onAgain={() => setState('menu')}
        />
      )}
    </div>
  );
}

// ═════════════════════════ Produkt des Tages ═════════════════════════

/** Jeden Tag ein anderes Produkt, für alle gleich. Saisonware nur in ihrer Zeit. */
export function productOfTheDay(images: ProductImages, date = new Date()): ShopProduct | null {
  const month = date.getMonth();
  const hasImages = Object.keys(images).length > 0;
  const pool = SHOP_PRODUCTS.filter(p => {
    if (['Sonstiges', 'Backmischung'].includes(p.group)) return false;
    if (p.group === 'Weihnachtsgebäck' && month !== 10 && month !== 11) return false;
    if (p.group === 'Saisongebäck' && month !== 10) return false;
    return !hasImages || !!imgOf(images, p);
  });
  if (pool.length === 0) return null;
  const order = seededShuffle(pool, date.getFullYear() * 7 + 3);
  const start = new Date(date.getFullYear(), 0, 1);
  const dayNo = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start.getTime()) / 86400000);
  return order[dayNo % order.length];
}

export function ProductOfDayCard({ images, onOpen }: { images: ProductImages; onOpen?: () => void }) {
  const p = productOfTheDay(images);
  if (!p) return null;
  const img = imgOf(images, p);
  const price = parseCents(p.price) > 0 ? centsText(parseCents(p.price)) : p.price;
  return (
    <section className="lt-pop-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', padding: '20px', borderRadius: '26px', backgroundColor: dc('#FFFFFF'), border: `2px solid ${TH.line}` }}>
      {img
        ? <img src={img} alt={p.name} style={{ flex: '0 0 150px', width: '150px', height: '150px', objectFit: 'cover', borderRadius: '20px' }} />
        : <div style={{ flex: '0 0 150px', height: '150px', borderRadius: '20px', backgroundColor: TH.tintYellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>🥖</div>}
      <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1.5px' }}>⭐ Produkt des Tages</div>
        <div style={{ fontFamily: TH.serif, fontSize: '32px', lineHeight: 1.05 }}>{p.name}</div>
        <div style={{ fontSize: '16px', color: TH.muted }}>{[p.group, p.weight, price].filter(Boolean).join(' · ')}</div>
        <div style={{ fontSize: '17px', lineHeight: 1.45, color: TH.brown }}>{firstSentence(p.description)}</div>
        <div style={{ fontSize: '16px', lineHeight: 1.4, padding: '8px 12px', borderRadius: '12px', backgroundColor: TH.tintYellow }}><strong>Im Verkauf sagen:</strong> {p.shortIngredients}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', color: TH.muted }}>Allergene: {p.allergens.length ? p.allergens.join(', ') : 'keine angegeben'}</span>
          {onOpen && <button onClick={onOpen} style={{ minHeight: '44px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Alle Steckbriefe ›</button>}
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════ Adventskalender ═════════════════════════

export type AdventDone = Record<string, { ok: boolean; d?: string; qid?: number }>;
const XMAS_NAMES = new Set(SHOP_PRODUCTS.filter(p => p.group === 'Weihnachtsgebäck').flatMap(p => [p.name, ...(p.aliases || [])]));
export const adventPoints = (day: number) => (day === 6 || day === 24 ? 60 : 30);

/** 24 Fragen, für alle Mitarbeiter gleich, rund ums Weihnachtsgebäck */
export function adventQuestions(questions: any[], year: number): any[] {
  const pool = questions.filter(q => q && q.product && XMAS_NAMES.has(q.product));
  const byProduct: Record<string, any[]> = {};
  seededShuffle(pool, year * 13 + 1).forEach(q => { (byProduct[q.product] = byProduct[q.product] || []).push(q); });
  const products = seededShuffle(Object.keys(byProduct).sort(), year * 17 + 5);
  const list: any[] = [];
  let i = 0;
  while (list.length < 24 && products.some(p => byProduct[p].length > 0)) {
    const p = products[i % products.length];
    const q = byProduct[p].shift();
    if (q) list.push(q);
    i++;
  }
  if (list.length < 24) {
    const used = new Set(list.map(q => q.id));
    const extra = seededShuffle(questions.filter(q => q && q.category === 'Sortiment & Warenkunde' && !used.has(q.id)), year * 19 + 7);
    list.push(...extra.slice(0, 24 - list.length));
  }
  return list;
}

export function AdventView({ questions, done, onAnswer, preview = false }: { questions: any[]; done: AdventDone; onAnswer: (day: number, ok: boolean, q: any) => void; preview?: boolean }) {
  const now = new Date();
  const year = now.getFullYear();
  const inDecember = now.getMonth() === 11;
  const today = inDecember ? now.getDate() : 0;
  const qs = adventQuestions(questions, year);
  const layout = seededShuffle(Array.from({ length: 24 }, (_, i) => i + 1), year * 23 + 11);
  const [opening, setOpening] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [opts, setOpts] = useState<{ text: string; right: boolean }[]>([]);
  const [fx, setFx] = useState<AnswerFxState>(null);
  const [previewDone, setPreviewDone] = useState<AdventDone>({});
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const doneMap = preview ? previewDone : done;
  const isOpenable = (d: number) => preview || (inDecember && d <= today);
  const openedCount = Object.keys(doneMap).filter(k => Number(k) >= 1 && Number(k) <= 24).length;
  const rightCount = Object.keys(doneMap).filter(k => doneMap[k]?.ok).length;
  const pointsSum = Object.keys(doneMap).filter(k => doneMap[k]?.ok).reduce((s, k) => s + adventPoints(Number(k)), 0);
  const missed = inDecember ? Array.from({ length: Math.min(today, 24) }, (_, i) => i + 1).filter(d => !doneMap[d]).length : 0;
  const daysToStart = (() => {
    if (inDecember) return 0;
    const target = new Date(now.getMonth() === 0 ? year : year, 11, 1);
    return Math.max(0, Math.ceil((target.getTime() - new Date(year, now.getMonth(), now.getDate()).getTime()) / 86400000));
  })();

  const openDoor = (d: number) => {
    if (!isOpenable(d) || opening) return;
    const q = qs[d - 1];
    if (!q) return;
    if (doneMap[d]) { setActive(d); setChosen(null); setOpts([]); return; }
    setOpening(d);
    timerRef.current = window.setTimeout(() => {
      setOpening(null);
      setOpts(shuffleArray(q.options.map((t: string, i: number) => ({ text: t, right: i === q.correct }))));
      setChosen(null); setFx(null); setActive(d);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 650);
  };
  const choose = (i: number) => {
    if (chosen !== null || active === null) return;
    const q = qs[active - 1];
    const ok = !!opts[i]?.right;
    setChosen(i);
    setFx({ k: Date.now(), ok, text: ok ? `🎁 +${adventPoints(active)} Punkte` : 'Leider falsch', pts: ok ? adventPoints(active) : undefined });
    if (preview) setPreviewDone(prev => ({ ...prev, [active]: { ok } }));
    else onAnswer(active, ok, q);
    scrollToNext();
  };

  const doorColors = [dc('#4B2A14'), dc('#9A3412'), dc('#2F5D3A'), dc('#7A4A00')];
  const snow = Array.from({ length: 14 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <style>{`
        @keyframes ltSnow{0%{transform:translateY(-10px);opacity:0}10%{opacity:1}100%{transform:translateY(150px);opacity:0}}
        @keyframes ltDoorPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,199,44,.75)}50%{box-shadow:0 0 0 9px rgba(255,199,44,0)}}
        .lt-door{position:relative;aspect-ratio:1/1.08;perspective:700px;border-radius:16px}
        .lt-door-face{position:absolute;inset:0;border-radius:16px;transform-origin:left center;transition:transform .65s cubic-bezier(.3,.7,.3,1);backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:3px solid rgba(255,199,44,.85);box-sizing:border-box}
        .lt-door.lt-opening .lt-door-face{transform:rotateY(-112deg)}
        .lt-door-ready{animation:ltDoorPulse 1.8s ease-in-out infinite}
        .lt-advent-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
        @media (max-width:560px){.lt-advent-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
      `}</style>

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '26px', backgroundColor: dc('#3A2010'), color: dc('#FFF6E0'), padding: '26px 24px' }}>
        {snow.map(i => (
          <span key={i} aria-hidden="true" style={{ position: 'absolute', top: 0, left: `${(i * 7.3 + 3) % 100}%`, width: i % 3 === 0 ? '7px' : '5px', height: i % 3 === 0 ? '7px' : '5px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), opacity: 0, animation: `ltSnow ${4 + (i % 5)}s linear ${i * 0.45}s infinite` }} />
        ))}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: TH.yellow }}>Hinkel-Adventskalender {year}</div>
          <h1 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '42px', lineHeight: 1.05 }}>Jeden Tag ein Türchen</h1>
          <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.5, color: dc('#F0D9AE') }}>
            Hinter jedem Türchen wartet eine Frage rund ums Weihnachtsgebäck, einmal antworten, {adventPoints(1)} Punkte bei richtiger Antwort. Am Nikolaustag und an Heiligabend gibt es doppelte Punkte. Verpasste Türchen kannst du nachholen.
          </p>
        </div>
      </div>

      {preview && (
        <div style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintBlue, fontSize: '17px', fontWeight: 700 }}>Vorschau für den Ausbilder: Du kannst alle Türchen öffnen, es wird nichts gespeichert und es gibt keine Punkte.</div>
      )}

      {active !== null && qs[active - 1] && (() => {
        const q = qs[active - 1];
        const rec = doneMap[active];
        const review = chosen === null && !!rec;
        const rightText = q.options[q.correct];
        return (
          <div key={active} className="lt-pop-in" style={{ ...cardStyle, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', borderColor: TH.yellow, borderWidth: '3px' }}>
            <AnswerFx fx={chosen !== null ? fx : null} streakIcon="🎄" />
            {typeof q.id === 'number' && <ReportContext report={{ game: 'Adventskalender', qid: q.id, product: q.product, text: q.question }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '54px', height: '54px', borderRadius: '14px', backgroundColor: TH.brown, color: TH.yellow, fontFamily: TH.serif, fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{active}</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Türchen {active}{active === 6 ? ' · Nikolaus' : active === 24 ? ' · Heiligabend' : ''}</div>
                <div style={{ fontSize: '16px', color: TH.brown }}>{review ? (rec.ok ? `Schon richtig beantwortet ⭐ (+${adventPoints(active)})` : 'Schon geöffnet, leider war die Antwort falsch') : `${adventPoints(active)} Punkte bei richtiger Antwort`}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '23px', lineHeight: 1.4, fontWeight: 700 }}>{q.question}</h2>
              <SpeakButton small text={chosen !== null || review ? `Richtig ist: ${rightText}. ${q.explanation || ''}` : `${q.question} ${opts.map((o, i) => `${String.fromCharCode(65 + i)}: ${o.text}`).join('. ')}`} />
            </div>
            {review ? (
              <div className="lt-expl" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintSage, fontSize: '18px', lineHeight: 1.5 }}>
                <strong>Richtig ist: {rightText}</strong>
                {q.explanation && <div style={{ marginTop: '4px', color: TH.brown }}>{q.explanation}</div>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {opts.map((o, i) => {
                  let bg: string = TH.cream, border: string = TH.line;
                  if (chosen !== null) {
                    if (o.right) { bg = TH.tintSage; border = TH.green; }
                    else if (i === chosen) { bg = TH.tintPeach; border = TH.red; }
                    else bg = TH.white;
                  }
                  return (
                    <button key={i} className={chosen !== null ? (o.right ? 'lt-correct' : i === chosen ? 'lt-wrong' : undefined) : undefined} onClick={() => choose(i)} disabled={chosen !== null} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '60px', padding: '10px 14px', borderRadius: '16px', border: `3px solid ${border}`, backgroundColor: bg, color: TH.ink, textAlign: 'left', fontSize: '18px', lineHeight: 1.35, cursor: chosen !== null ? 'default' : 'pointer' }}>
                      <span style={{ flex: '0 0 36px', height: '36px', borderRadius: '50%', border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxSizing: 'border-box', backgroundColor: TH.white }}>{String.fromCharCode(65 + i)}</span>
                      <span style={{ flex: 1 }}>{o.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {chosen !== null && (
              <div className="lt-expl" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: opts[chosen]?.right ? TH.tintSage : TH.tintPeach, fontSize: '18px', lineHeight: 1.5 }}>
                <strong>{opts[chosen]?.right ? 'Richtig, frohe Weihnachten! ' : `Leider nicht. Richtig ist: ${rightText}. `}</strong>
                {q.explanation && !(String(q.explanation).includes(rightText) && !opts[chosen]?.right) ? q.explanation : ''}
              </div>
            )}
            <button onClick={() => { setActive(null); setChosen(null); }} className={chosen !== null || review ? 'lt-sticky-next' : undefined} style={chosen !== null || review ? btnPrimary : { ...btnPrimary, backgroundColor: TH.white, color: TH.ink, border: `2px solid ${TH.line}` }}>
              {chosen !== null || review ? 'Zurück zum Kalender' : 'Später beantworten'}
            </button>
          </div>
        );
      })()}

      {active === null && (
        <>
          {!inDecember && !preview ? (
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', backgroundColor: TH.tintYellow, borderColor: 'transparent' }}>
              <span style={{ fontSize: '46px' }}>🎄</span>
              <div style={{ flex: '1 1 220px' }}>
                <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>{daysToStart === 1 ? 'Morgen geht’s los!' : `Noch ${daysToStart} Tage`}</div>
                <div style={{ fontSize: '17px', color: TH.brown }}>Am 1. Dezember öffnet sich das erste Türchen.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <StatChip label="Geöffnet" value={`${openedCount} / 24`} />
              <StatChip label="Richtig" value={rightCount} tone="yellow" />
              <StatChip label="Punkte" value={pointsSum} />
            </div>
          )}
          {missed > 1 && !preview && <div style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintPeach, fontSize: '17px', fontWeight: 700 }}>{missed} Türchen warten noch auf dich, du kannst sie jetzt nachholen.</div>}
          <div className="lt-advent-grid" style={{ display: 'grid', gap: '12px' }}>
            {layout.map((d, i) => {
              const rec = doneMap[d];
              const can = isOpenable(d);
              const ready = can && !rec;
              const color = doorColors[i % doorColors.length];
              return (
                <button key={d} onClick={() => openDoor(d)} disabled={!can} aria-label={`Türchen ${d}${rec ? (rec.ok ? ', richtig beantwortet' : ', geöffnet') : can ? ', kann geöffnet werden' : ', noch verschlossen'}`} className={`lt-door${opening === d ? ' lt-opening' : ''}${ready ? ' lt-door-ready' : ''}`} style={{ padding: 0, border: 'none', background: rec ? (rec.ok ? TH.tintSage : dc('#F4EADB')) : dc('#FFF6E0'), cursor: can ? 'pointer' : 'default', opacity: can || rec ? 1 : 0.55 }}>
                  {/* Innenseite (hinter der Tür) */}
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', borderRadius: '16px', border: `3px solid ${rec ? (rec.ok ? TH.green : TH.line) : TH.yellow}`, boxSizing: 'border-box', color: TH.ink }}>
                    <span style={{ fontSize: '30px', lineHeight: 1 }}>{rec ? (rec.ok ? '⭐' : '🎁') : '🎁'}</span>
                    <span style={{ fontFamily: TH.serif, fontSize: '22px', lineHeight: 1 }}>{d}</span>
                    {rec && <span style={{ fontSize: '12px', fontWeight: 700, color: rec.ok ? TH.green : TH.muted }}>{rec.ok ? `+${adventPoints(d)}` : 'geöffnet'}</span>}
                  </span>
                  {/* Tür */}
                  {!rec && (
                    <span className="lt-door-face" style={{ backgroundColor: color, color: dc('#FFF6E0') }}>
                      <span style={{ fontFamily: TH.serif, fontSize: '36px', lineHeight: 1 }}>{d}</span>
                      <span style={{ fontSize: '15px', lineHeight: 1 }}>{d === 6 ? '🎅' : d === 24 ? '🎄' : can ? '✨' : '🔒'}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ───────── Theken-Ansturm ─────────
const ANSTURM_FACES = ['👩', '👨', '👵', '👴', '🧑', '👩‍🦰', '👨‍🦳', '🧔', '👱‍♀️', '👷'];

export function ThekenAnsturmView({ images, onSaveScore, onBest }: { images: ProductImages; onSaveScore: (points: number, category: string) => void; onBest?: (served: number) => void }) {
  const allPool = SHOP_PRODUCTS.filter(p => !['Sonstiges', 'Backmischung'].includes(p.group) && !/stollen/i.test(p.name));
  const withImg = allPool.filter(p => images[productImageKey(p.name)]);
  const pool = withImg.length >= 12 ? withImg : allPool;
  const [state, setState] = useState<'menu' | 'play' | 'result'>('menu');
  const [shelf, setShelf] = useState<any[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [packed, setPacked] = useState<string[]>([]);
  const [face, setFace] = useState('👩');
  const [served, setServed] = useState(0);
  const [lost, setLost] = useState(0);
  const [score, setScore] = useState(0);
  const [patience, setPatience] = useState(1);
  const [wrongName, setWrongName] = useState('');
  const startRef = useRef(0);
  const penaltyRef = useRef(0);
  const busyRef = useRef(false);
  const servedRef = useRef(0);
  const limitFor = (n: number) => Math.max(6000, 14000 - n * 500);

  const newCustomer = (n: number) => {
    const sh = shuffleArray(pool).slice(0, 8);
    const size = Math.min(4, 2 + Math.floor(n / 4));
    setShelf(sh);
    setOrder(shuffleArray(sh).slice(0, size).map((p: any) => p.name));
    setPacked([]);
    setFace(ANSTURM_FACES[Math.floor(Math.random() * ANSTURM_FACES.length)]);
    startRef.current = Date.now(); penaltyRef.current = 0; setPatience(1);
    busyRef.current = false;
  };
  const start = () => { setServed(0); servedRef.current = 0; setLost(0); setScore(0); setState('play'); newCustomer(0); scrollToPlay(); };
  const finish = (s: number) => { setState('result'); if (s > 0) onSaveScore(s, 'Theken-Ansturm 🏃'); onBest?.(servedRef.current); };

  const tap = (name: string) => {
    if (busyRef.current || packed.includes(name)) return;
    if (!order.includes(name)) { penaltyRef.current += 1500; setWrongName(name); window.setTimeout(() => setWrongName(''), 1200); return; }
    const np = [...packed, name];
    setPacked(np);
    if (np.length === order.length) {
      busyRef.current = true;
      const bonus = Math.round(patience * 10);
      const ns = score + order.length * 5 + bonus;
      const n = served + 1;
      setScore(ns); setServed(n); servedRef.current = n;
      window.setTimeout(() => newCustomer(n), 600);
    }
  };

  useEffect(() => {
    if (state !== 'play') return;
    const t = window.setInterval(() => {
      if (busyRef.current) return;
      const f = 1 - (Date.now() - startRef.current + penaltyRef.current) / limitFor(served);
      if (f > 0) { setPatience(f); return; }
      busyRef.current = true;
      const nl = lost + 1;
      setLost(nl); setPatience(0);
      window.setTimeout(() => { if (nl >= 3) finish(score); else newCustomer(served); }, 700);
    }, 100);
    return () => window.clearInterval(t);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <ConfettiOverlay active={state === 'result' && served >= 8} />
      <PageHead title="Theken-Ansturm" subtitle="Die Schlange wird länger. Pack jede Bestellung, bevor der Kunde ungeduldig wird." />
      {state === 'menu' && <GameIntro title="So geht's" text="Der Kunde sagt, was er möchte. Erkenne die Ware am Foto und tippe sie an, bis alles in der Tüte ist. Den Namen siehst du erst nach dem Antippen. Falsches Produkt kostet Geduld. Drei verärgerte Kunden und das Spiel ist vorbei." hint="Je schneller du bist, desto mehr Bonuspunkte." startLabel="Theke öffnen" onStart={start} />}
      {state === 'play' && (
        <div id="lt-game-card" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <StatChip label="Punkte" value={String(score)} />
            <StatChip label="Bedient" value={String(served)} />
            <StatChip label="Verärgert" value={`${lost} / 3`} />
          </div>
          <div className="lt-ansturm-order" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span key={served + '-' + lost} className="lt-pop-in" style={{ fontSize: '54px', lineHeight: 1 }}>{patience <= 0 ? '😠' : patience < 0.3 ? '😤' : face}</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '16px', backgroundColor: '#F4EADB', fontSize: '17px', lineHeight: 1.4 }}>
                Ich hätte gern: {order.map((o, i) => <span key={o} style={{ display: 'inline-block', marginRight: '6px' }}><b style={{ textDecoration: packed.includes(o) ? 'line-through' : 'none', opacity: packed.includes(o) ? 0.5 : 1 }}>{o}</b>{i < order.length - 2 ? ',' : i === order.length - 2 ? ' und' : '.'}</span>)}
              </div>
              <div style={{ height: '10px', borderRadius: '999px', backgroundColor: TH.line, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, patience) * 100}%`, height: '100%', backgroundColor: patience > 0.3 ? TH.green : TH.red }} />
              </div>
            </div>
          </div>
          <div className="lt-ansturm-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
            {shelf.map(p => {
              const done = packed.includes(p.name);
              return (
                <button key={p.name} onClick={() => tap(p.name)} disabled={done} style={{ padding: '6px', borderRadius: '14px', border: `3px solid ${wrongName === p.name ? TH.red : done ? TH.green : TH.line}`, backgroundColor: done ? TH.tintSage : TH.white, cursor: done ? 'default' : 'pointer', opacity: done ? 0.55 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  {images[productImageKey(p.name)] ? <img src={images[productImageKey(p.name)]} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px' }} /> : <span style={{ fontSize: '44px', lineHeight: 1.4 }}>🥖</span>}
                  {/* Name nur ohne Foto zeigen: so muss man die Ware am Bild erkennen */}
                  {(!images[productImageKey(p.name)] || done || wrongName === p.name) && <span style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2, color: wrongName === p.name ? TH.red : undefined }}>{p.name}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {state === 'result' && <GameResult title="Laden zu!" big={`${score} Punkte`} text={`Du hast ${served} Kunden bedient.`} againLabel="Nochmal" onAgain={start} celebrate={served >= 8} stars={served >= 10 ? 3 : served >= 6 ? 2 : served >= 3 ? 1 : 0} />}
    </div>
  );
}