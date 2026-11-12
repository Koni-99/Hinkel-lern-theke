// ═══ Gemeinsame Spiel-Bausteine (Vorlesen, Lern-Hinweise, „Nur neue“, Zufall mit festem Startwert) ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState, useEffect } from 'react';
import { dc } from '../data';
import { TH, btnPrimary, productImageKey, ProductImages } from '../components/minigameUtils';
import type { ShopProduct } from './BilderQuiz';

/** Nach „Weiter“: zur Spielkarte (Foto) scrollen statt ganz nach oben */
export const scrollToCard = () => window.setTimeout(() => {
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
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof (window as any).SpeechSynthesisUtterance !== 'undefined';

// Beste deutsche Stimme des Geräts wählen: natürliche/Premium-Stimmen zuerst
export let cachedVoice: SpeechSynthesisVoice | null = null;

export const VOICE_PREFS = [/natural|neural|online/i, /premium/i, /enhanced|erweitert|verbessert/i, /google/i, /anna|helena|petra|katja|vicki|marlene|conrad|markus|yannick/i];

export function bestGermanVoice(): SpeechSynthesisVoice | null {
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
export function useOnlyNew(game: string): [boolean, () => void] {
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
export function AllAtOnceButton({ count, onClick, unit }: { count: number; onClick: () => void; unit: string }) {
  if (count <= 10) return null;
  return (
    <button onClick={onClick} style={{ ...btnPrimary, backgroundColor: TH.white, color: TH.ink, border: `2px solid ${TH.brown}` }}>
      Alle {count} {unit} am Stück
    </button>
  );
}

/** „Beenden“ während einer langen Runde */
export function FinishEarlyButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ minHeight: '52px', padding: '0 16px', borderRadius: '16px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.muted, fontSize: '16px', fontWeight: 700, cursor: 'pointer', alignSelf: 'stretch' }}>
      Beenden & Auswertung
    </button>
  );
}

export const learnedText = (n: number) => `📚 ${n} ${n === 1 ? 'Frage' : 'Fragen'} im Lernbereich abgehakt`;

// ═════════════════════════ Kleine Helfer für die neuen Spiele ═════════════════════════

/** Zufallszahlen, die jedes Mal gleich herauskommen (für Kalender und „Produkt des Tages“) */
export const seededRandom = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rnd = seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export const imgOf = (images: ProductImages, p: ShopProduct) => images[productImageKey(p.name)] || '';

export const centsText = (c: number) => (c / 100).toFixed(2).replace('.', ',') + ' €';
