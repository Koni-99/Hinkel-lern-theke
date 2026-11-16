// ═══ Teigi als Begleiter beim Lernen und Spielen (Version 231) ═══
// Seit Version 233 hat jeder Teigi (ausschaltbar unten in der App, _teigiAus). Er sitzt im Quiz und in den Spielen unten links.
// Er reagiert auf jede Antwort: AnswerFx (ui/antwortFx.tsx) schickt das Ereignis „lt-teigi“ mit { ok, lauf }.
// Antippen lässt ihn hüpfen und etwas sagen. Ausschalten nur ganz unten in der App (Version 234).
import { useEffect, useRef, useState } from 'react';
import { TeigiGlas } from '../basis/laden';

export const TEIGI_EVENT = 'lt-teigi';
export type TeigiMeldung = { ok: boolean; lauf: number };

const zufall = <T,>(liste: T[]) => liste[Math.floor(Math.random() * liste.length)];
const RICHTIG = ['Lecker!', 'Genau so!', 'Stark!', 'Das sitzt!', 'Mmh, richtig!', 'Super gemacht!', 'Ich blubber vor Freude!'];
const FALSCH = ['Nicht schlimm, nächstes Mal!', 'Lies dir die Erklärung durch.', 'Auch Teig braucht Zeit.', 'Kopf hoch, weiter geht’s!', 'Das merken wir uns.', 'Fehler machen schlau!'];
const SERIE: Record<number, string[]> = {
  3: ['3 in Folge, weiter so!', 'Drei richtig, du bist warm!'],
  5: ['5 in Folge! Ich geh auf wie ein Hefeteig!', 'Fünf am Stück, toll!'],
  10: ['10 in Folge! Du bist ein Profi!', 'Zehn! Ich platze gleich vor Stolz!'],
  15: ['15 in Folge! Unglaublich!'],
  20: ['20 in Folge! Meister-Niveau!'],
};
const ANGETIPPT = ['Hihi, das kitzelt!', 'Hallo! Ich bin Teigi.', 'Blubb!', 'Weiter geht’s!', 'Ich pass auf dich auf!', 'Füttern geht mit Lernen!'];
const START = ['Ich bin dabei! Viel Erfolg!', 'Los geht’s, ich drück dir die Daumen!', 'Zusammen schaffen wir das!'];

export const teigiSpruch = (m: TeigiMeldung, zahl = Math.random()): string | null => {
  if (m.ok && SERIE[m.lauf]) return zufall(SERIE[m.lauf]);
  if (m.ok && m.lauf > 20 && m.lauf % 10 === 0) return `${m.lauf} in Folge! Wahnsinn!`;
  if (!m.ok) return zahl < 0.7 ? zufall(FALSCH) : null;
  return zahl < 0.35 ? zufall(RICHTIG) : null; // nicht bei jeder richtigen Antwort reden
};

export function TeigiBegleiter({ stufe, hut, glas, tanz }: { stufe: number; hut?: string | null; glas?: string | null; tanz?: string | null }) {
  const [laune, setLaune] = useState<'froh' | 'gut' | 'schlapp'>('gut');
  const [jubel, setJubel] = useState(0);
  const [spruch, setSpruch] = useState<{ t: string; k: number } | null>(null);
  const timer = useRef(0);
  const sag = (t: string | null) => { if (!t) return; setSpruch({ t, k: Date.now() }); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setSpruch(null), 2800); };
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
    <div className="lt-teigi-begleiter lt-papier" role="status" aria-live="polite">
      {spruch && <span key={spruch.k} className="lt-teigi-sprech">{spruch.t}</span>}
      <button type="button" aria-label="Teigi antippen" title="Teigi" onClick={() => { setLaune('froh'); setJubel((j) => j + 1); sag(zufall(ANGETIPPT)); }}>
        <span key={jubel} className={laune === 'froh' ? (tanz ? `lt-teigi-${String(tanz).replace('tt_', '')}` : 'lt-teigi-hops') : laune === 'schlapp' ? 'lt-teigi-traurig' : ''} style={{ display: 'inline-block' }}>
          <TeigiGlas stufe={stufe} laune={laune} size={64} hut={hut} glas={glas} />
        </span>
      </button>
    </div>
  );
}
