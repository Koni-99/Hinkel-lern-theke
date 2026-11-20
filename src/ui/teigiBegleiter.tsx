// ═══ Teigi als Begleiter beim Lernen und Spielen (Version 231) ═══
// Seit Version 233 hat jeder Teigi (ausschaltbar unten in der App, _teigiAus). Seit Version 237 auf allen Seiten (außer Ausbilder-Bereich), unter den Pop-ups.
// Er reagiert auf jede Antwort: AnswerFx (ui/antwortFx.tsx) schickt das Ereignis „lt-teigi“ mit { ok, lauf }.
// Antippen lässt ihn hüpfen und etwas sagen. Ausschalten nur ganz unten in der App (Version 234).
import { sprichtGerade } from '../hilfen/sprechen';
import { useEffect, useRef, useState } from 'react';
import { TeigiGlas } from '../basis/laden';

export const TEIGI_EVENT = 'lt-teigi';
export type TeigiMeldung = { ok: boolean; lauf: number };

// Zufälliger Spruch, aber nie zweimal derselbe hintereinander
let letzter = '';
const zufall = (liste: string[]) => {
  const auswahl = liste.length > 1 ? liste.filter((t) => t !== letzter) : liste;
  letzter = auswahl[Math.floor(Math.random() * auswahl.length)];
  return letzter;
};
/** Version 270: zur Zeit nicht benutzt (Teigi redet nur bei Serien), bleibt für später */
export const RICHTIG = [
  'Lecker!', 'Genau so!', 'Stark!', 'Das sitzt!', 'Mmh, richtig!', 'Super gemacht!', 'Ich blubber vor Freude!',
  'Knusprig gelöst!', 'Goldbraun, perfekt!', 'Frisch aus dem Ofen: richtig!', 'Da geht mir der Teig auf!',
  'Volltreffer!', 'Du weißt Bescheid!', 'Wie aus dem Bilderbuch!', 'Das hätte ich nicht besser gewusst!',
  'Bravo, Brotfreund!', 'Ein echter Profi an der Theke!', 'Die Kunden werden dich lieben!', 'Butterweich gelöst!',
  'Krümelfrei richtig!', 'Wie eine frische Brezel: perfekt!', 'Yeah, richtig!', 'Du bist ja ein Fuchs!',
  'Das merkt man, du lernst fleißig!', 'Weiter so, ich bin stolz!', 'Ofenfrisch und richtig!', 'Ganz meine Meinung!',
  'Da klatsche ich mit meinem Deckel!', 'Sauber!', 'Spitze!', 'Klasse!', 'Richtig gut!', 'Wow!',
];
export const FALSCH = [
  'Nicht schlimm, nächstes Mal!', 'Lies dir die Erklärung durch.', 'Auch Teig braucht Zeit.', 'Kopf hoch, weiter geht’s!',
  'Das merken wir uns.', 'Fehler machen schlau!', 'Knapp daneben ist auch vorbei, aber egal!', 'Beim nächsten Mal sitzt es!',
  'Auch der beste Bäcker hat mal ein Brot verbrannt.', 'Gleich nochmal, du schaffst das!', 'Hmm, das war knifflig.',
  'Keine Sorge, ich glaub an dich!', 'Rom wurde auch nicht an einem Tag gebacken.', 'Das kommt in den Fehler-Stapel, dann übst du es nochmal.',
  'Durchatmen und weiter!', 'Upps! Passiert den Besten.', 'Schau dir die richtige Antwort gut an.', 'Daraus lernen wir!',
  'Nicht aufgeben, ich blubber für dich!', 'Kleiner Ausrutscher, weiter geht’s!',
];
const SERIE: Record<number, string[]> = {
  3: ['3 in Folge, weiter so!', 'Drei richtig, du bist warm!', 'Drei am Stück, der Ofen läuft heiß!', 'Hattrick!'],
  5: ['5 in Folge! Ich geh auf wie ein Hefeteig!', 'Fünf am Stück, toll!', 'Fünf richtig! Du bist nicht zu bremsen!', 'Fünfer-Serie! Ich hüpf vor Freude!'],
  10: ['10 in Folge! Du bist ein Profi!', 'Zehn! Ich platze gleich vor Stolz!', 'Zehn am Stück! Hinkel-Meister in Sicht!'],
  15: ['15 in Folge! Unglaublich!', '15! Du bist ja ein Lexikon auf zwei Beinen!'],
  20: ['20 in Folge! Meister-Niveau!', '20! Das gibt’s doch nicht!'],
};
const ANGETIPPT = [
  'Hihi, das kitzelt!', 'Hallo! Ich bin Teigi.', 'Blubb!', 'Weiter geht’s!', 'Ich pass auf dich auf!', 'Füttern geht mit Lernen!',
  'Psst, ich bin ein Sauerteig!', 'Nicht schütteln, ich bin empfindlich!', 'Jeder Lerntag macht mich größer!', 'Blubb blubb!',
  'Hast du heute schon gelernt?', 'Ich mag am liebsten Roggenmehl!', 'Im Laden gibt es Hüte für mich!', 'Hey, das bin ja ich!',
  'Zusammen sind wir ein starkes Team!', 'Ich bin älter, als du denkst!', 'Gib mir eine Bäckermütze, bitte!',
];
const START = [
  'Ich bin dabei! Viel Erfolg!', 'Los geht’s, ich drück dir die Daumen!', 'Zusammen schaffen wir das!', 'Auf geht’s, Brotfreund!',
  'Ich hab schon Hunger aufs Lernen!', 'Konzentration, ich schau zu!', 'Lass uns loslegen!', 'Heute knacken wir die Fragen!',
];

export const teigiSpruch = (m: TeigiMeldung, zahl = Math.random()): string | null => {
  if (m.ok && SERIE[m.lauf]) return zufall(SERIE[m.lauf]);
  if (m.ok && m.lauf > 20 && m.lauf % 10 === 0) return `${m.lauf} in Folge! Wahnsinn!`;
  // Version 270: sonst still (Nutzer: im Spiel passierte zu viel auf einmal). Er hüpft oder schaut traurig, redet aber nicht.
  void zahl;
  return null;
};

export function TeigiBegleiter({ stufe, hut, glas, tanz }: { stufe: number; hut?: string | null; glas?: string | null; tanz?: string | null }) {
  const [laune, setLaune] = useState<'froh' | 'gut' | 'schlapp'>('gut');
  const [jubel, setJubel] = useState(0);
  const [spruch, setSpruch] = useState<{ t: string; k: number } | null>(null);
  const [spricht, setSpricht] = useState(false);
  // Version 261: liest eine Stimme vor, bewegt Teigi den Mund mit. Version 262: auch, solange seine Sprechblase etwas sagt
  useEffect(() => { const t = window.setInterval(() => { const s = sprichtGerade() || Date.now() < plapperBis.current; setSpricht((v) => (v === s ? v : s)); }, 150); return () => window.clearInterval(t); }, []);
  const timer = useRef(0);
  const plapperBis = useRef(0);
  const sag = (t: string | null) => { if (!t) return; plapperBis.current = Date.now() + Math.min(2600, 500 + t.length * 45); setSpruch({ t, k: Date.now() }); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setSpruch(null), 2800); };
  useEffect(() => {
    document.body.classList.add('lt-mit-teigi');
    sag(zufall(START));
    const auf = (e: Event) => {
      const m = (e as CustomEvent<TeigiMeldung>).detail; if (!m) return;
      setLaune(m.ok ? 'froh' : 'schlapp');
      if (m.ok) setJubel((j) => j + 1);
      sag(teigiSpruch(m));
    };
    window.addEventListener(TEIGI_EVENT, auf);
    return () => { window.removeEventListener(TEIGI_EVENT, auf); window.clearTimeout(timer.current); document.body.classList.remove('lt-mit-teigi'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={spricht ? "lt-teigi-begleiter lt-papier lt-teigi-spricht" : "lt-teigi-begleiter lt-papier"} role="status" aria-live="polite">
      {spruch && <span key={spruch.k} className="lt-teigi-sprech">{spruch.t}</span>}
      <button type="button" aria-label="Teigi antippen" title="Teigi" onClick={() => { setLaune('froh'); setJubel((j) => j + 1); sag(zufall(ANGETIPPT)); }}>
        <span key={jubel} className={laune === 'froh' ? (tanz ? `lt-teigi-${String(tanz).replace('tt_', '')}` : 'lt-teigi-hops') : laune === 'schlapp' ? 'lt-teigi-traurig' : ''} style={{ display: 'inline-block' }}>
          <TeigiGlas stufe={stufe} laune={laune} size={76} hut={hut} glas={glas} spricht={spricht} />
        </span>
      </button>
    </div>
  );
}
