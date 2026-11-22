// ═══ Gemeinsame Spiel-Bausteine (Vorlesen, Lern-Hinweise, „Nur neue“, Zufall mit festem Startwert) ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { merkeAudio } from '../hilfen/sprechen';
import { useState, useEffect } from 'react';
import { dc } from '../daten/data';
import { TH, btnPrimary, productImageKey, ProductImages } from '../ui/basis';
import { LtIcon, ICON } from '../basis/symbole';
import type { ShopProduct } from './BilderQuiz';
import { zerlege, teilKey, KUNDEN_STIMMEN, KundenStimme } from '../hilfen/bausteine';
import { saetze, satzKey, englischKey } from '../hilfen/vorlesen';

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
      <span style={{ display: 'inline-flex', lineHeight: 1 }} aria-hidden="true"><LtIcon paths={ICON.book} size={22} /></span>
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

export function speakText(text: string, onEnd?: () => void, tempo = 1.15) {
  stopTeile();
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  if (!cachedVoice) cachedVoice = bestGermanVoice();
  const u = new SpeechSynthesisUtterance(text.replace(/[„“"]/g, '').replace(/·/g, ',').replace(/\s+/g, ' ').trim());
  u.lang = 'de-DE';
  // Wie ein freundlicher Verkäufer: zügig, etwas heller und lebendig statt langsam und müde
  u.rate = tempo;
  u.pitch = 1.1;
  u.volume = 1;
  if (cachedVoice) u.voice = cachedVoice;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
}

export function stopSpeaking() { stopTeile(); if (canSpeak()) window.speechSynthesis.cancel(); }

// ───────── Natürliche Stimmen aus fertigen Tondateien (einmalig erzeugt, danach keine Kosten) ─────────
// Kundenstimme aus Bausteinen (src/hilfen/bausteine.ts), Vorlesen Satz für Satz (src/hilfen/vorlesen.ts),
// Lernkarten mit den Hör-Lernen-Dateien. Fehlt eine Datei oder gibt es kein Internet, liest die Handy-Stimme.
const indexe: Record<string, Promise<Set<string>>> = {};
const ladeIndex = (url: string) => indexe[url] || (indexe[url] = fetch(url).then((r) => (r.ok ? r.json() : [])).then((a: string[]) => new Set(Array.isArray(a) ? a : [])).catch(() => { delete indexe[url]; return new Set<string>(); }));
const mitZeitlimit = (p: Promise<Set<string>>) => Promise.race([p, new Promise<Set<string>>((r) => window.setTimeout(() => r(new Set()), 2000))]);
let teilAudio: HTMLAudioElement | null = null;
let teilLauf = 0;
export function stopTeile() { teilLauf++; if (teilAudio) { try { teilAudio.pause(); } catch {} } }
/** Lädt eine Tondatei vorab (Version 279), damit zwischen zwei Stücken nicht aufs Internet gewartet wird.
 *  Klappt das nicht, wird die Datei beim Abspielen ganz normal geladen. */
// Nie darauf warten (Version 281): auf dem iPhone verfällt sonst die Erlaubnis zum Abspielen und die Handy-Stimme
// springt ein. Ist das Stück schon geladen, wird die geladene Kopie gespielt, sonst ganz normal die Adresse.
const vorgeladen = new Map<string, string>();
const laedt = new Set<string>();
function vorladen(url: string) {
  if (vorgeladen.has(url) || laedt.has(url) || typeof fetch === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return;
  laedt.add(url);
  fetch(url).then((r) => (r.ok ? r.blob() : Promise.reject(new Error('fehlt')))).then((b) => {
    vorgeladen.set(url, URL.createObjectURL(b));
    if (vorgeladen.size > 120) { const [alt, altU] = vorgeladen.entries().next().value as [string, string]; vorgeladen.delete(alt); window.setTimeout(() => { try { URL.revokeObjectURL(altU); } catch {} }, 60000); }
  }).catch(() => {}).finally(() => laedt.delete(url));
}
/** Spielt Tondateien nacheinander. Klappt eine nicht, liest die Handy-Stimme den Rest (stuecke = Text je Datei).
 *  luecke: Pause in ms zwischen zwei Dateien (Sätze 220, Bausteine eines Kundensatzes 0). */
function spieleFolge(lauf: number, urls: string[], stuecke: string[], tempo: number, handyTempo: number, onEnd?: () => void, ersatz?: (rest: string) => void, luecke = 0) {
  const handy = (rest: string) => { if (lauf === teilLauf) { if (ersatz) ersatz(rest); else speakText(rest, onEnd, handyTempo); } };
  const a = teilAudio || (teilAudio = merkeAudio(new Audio()));
  urls.slice(1, 4).forEach(vorladen);
  let i = 0;
  const weiter = () => {
    if (lauf !== teilLauf) return;
    if (i >= urls.length) { onEnd?.(); return; }
    const nr = i++;
    urls.slice(nr + 1, nr + 4).forEach(vorladen);
    a.onended = () => { if (luecke > 0) window.setTimeout(weiter, luecke); else weiter(); };
    a.onerror = () => handy(stuecke.slice(nr).join(' '));
    a.src = vorgeladen.get(urls[nr]) || urls[nr];
    a.playbackRate = tempo;
    a.play().catch(() => handy(stuecke.slice(nr).join(' ')));
  };
  weiter();
}
/** Liest einen Kundensatz mit natürlicher Stimme (Frau oder Mann) vor, sonst mit der Handy-Stimme */
export async function sprichKunde(text: string, stimme: KundenStimme, tempo = 1.0, onEnd?: () => void) {
  stopSpeaking();
  const lauf = ++teilLauf;
  const index = await mitZeitlimit(ladeIndex('stimme/teile/index.json'));
  if (lauf !== teilLauf) return;
  const teile = zerlege(text);
  const keys = teile.map((t) => teilKey(KUNDEN_STIMMEN[stimme], t));
  if (!keys.length || typeof Audio === 'undefined' || !keys.every((k) => index.has(k))) { speakText(text, onEnd, tempo * 1.15); return; }
  spieleFolge(lauf, keys.map((k) => `stimme/teile/${k}.mp3`), teile, tempo, tempo * 1.15, onEnd);
}
/** Liest einen festen Text Satz für Satz mit natürlicher Stimme (Frau 4) vor, sonst mit der Handy-Stimme */
export async function sprichSaetze(text: string, onEnd?: () => void, stimme?: string) {
  stopSpeaking();
  const lauf = ++teilLauf;
  const index = await mitZeitlimit(ladeIndex('stimme/saetze/index.json'));
  if (lauf !== teilLauf) return;
  const s = saetze(text);
  const keys = s.map((x) => satzKey(x, stimme));
  if (!keys.length || typeof Audio === 'undefined' || !keys.every((k) => index.has(k))) { speakText(text, onEnd); return; }
  spieleFolge(lauf, keys.map((k) => `stimme/saetze/${k}.mp3`), s, 1.0, 1.15, onEnd, undefined, 220);
}
/** Wörterbuch Englisch: natürliche britische Stimme, sonst die englische Handy-Stimme (ersatz) */
export async function sprichEnglisch(text: string, ersatz: (text: string) => void) {
  stopSpeaking();
  const lauf = ++teilLauf;
  const index = await mitZeitlimit(ladeIndex('stimme/saetze/index.json'));
  if (lauf !== teilLauf) return;
  const key = englischKey(text);
  if (typeof Audio === 'undefined' || !index.has(key)) { ersatz(text); return; }
  spieleFolge(lauf, [`stimme/saetze/${key}.mp3`], [text], 1.0, 1.0, undefined, ersatz);
}
/** Spielt eine Datei aus dem Hör-Lernen (z. B. die Antwort einer Lernkarte), sonst liest die Handy-Stimme den Text */
export async function sprichHoerDatei(key: string, text: string, onEnd?: () => void) {
  stopSpeaking();
  const lauf = ++teilLauf;
  const index = await mitZeitlimit(ladeIndex('stimme/index.json'));
  if (lauf !== teilLauf) return;
  if (typeof Audio === 'undefined' || !index.has(key)) { speakText(text, onEnd); return; }
  spieleFolge(lauf, [`stimme/${key}.mp3`], [text], 1.0, 1.15, onEnd);
}

/** Knopf „Vorlesen“ – liest den Text vor, zweiter Tipp stoppt */
/** natuerlich: Satz für Satz mit natürlicher Stimme. hoerKey: fertige Hör-Lernen-Datei abspielen. */
export function SpeakButton({ text, label = 'Vorlesen', small, natuerlich, hoerKey, stimme }: { text: string; label?: string; small?: boolean; natuerlich?: boolean; hoerKey?: string; stimme?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => () => { stopSpeaking(); }, []);
  useEffect(() => { setOn(false); stopSpeaking(); }, [text]);
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      onClick={() => { if (on) { stopSpeaking(); setOn(false); } else { setOn(true); const fertig = () => setOn(false); if (hoerKey) sprichHoerDatei(hoerKey, text, fertig); else if (natuerlich) sprichSaetze(text, fertig, stimme); else speakText(text, fertig); } }}
      aria-pressed={on}
      title={on ? 'Vorlesen stoppen' : 'Vorlesen'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: small ? '38px' : '44px', padding: small ? '0 10px' : '0 14px', borderRadius: '12px', border: `2px solid ${on ? TH.brown : TH.line}`, backgroundColor: on ? TH.tintYellow : TH.white, color: TH.ink, fontSize: small ? '14px' : '16px', fontWeight: 700, cursor: 'pointer', flex: '0 0 auto' }}
    >
      <span aria-hidden="true" style={{ display: 'inline-flex' }}><LtIcon paths={on ? ICON.pause : ICON.speaker} size={18} /></span>{on ? 'Stopp' : label}
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

export const learnedText = (n: number) => `${n} ${n === 1 ? 'Frage' : 'Fragen'} im Lernbereich abgehakt`;

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
