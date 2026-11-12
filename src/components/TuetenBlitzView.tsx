import { useState, useEffect, useRef } from 'react';
import { dc } from '../data';
import { GameProgress, useFeedbackState, ConfettiOverlay, TH, cardStyle, PageHead, StatChip, GameIntro, GameResult, AnswerFx, AnswerFxState, ReportLink, ReportList, ReportContext, scrollToPlay } from './minigameUtils';
import { SHOP_PRODUCTS } from '../shopProducts';

interface PackItem {
  name: string;
  category: 'heavy' | 'light';
  group: string;
  icon: string;
}

/** Echtes Hinkel-Sortiment: Brote & Laibe nach unten, Brötchen, Gebäck & Kuchen nach oben */
const ONLY_PRODUCTS: PackItem[] = SHOP_PRODUCTS
  // Stollen kommt nicht in die Tüte, sondern in die Blechdose
  .filter(p => !['Sonstiges', 'Backmischung'].includes(p.group) && !/stollen/i.test(p.name))
  .map(p => {
    const heavy = !!p.breadType;
    const icon = heavy ? '🍞'
      : p.group === 'Brötchen' ? (/laugen|brezel/i.test(p.name) ? '🥨' : '🥯')
      : p.group === 'Kuchen' ? '🍰'
      : p.group === 'Kleingebäck' || p.group === 'Weihnachtsgebäck' ? (p.name.includes('Stollen') ? '🍰' : '🍪')
      : p.group === 'Herzhafte Snacks' ? '🥪'
      : /croissant/i.test(p.name) ? '🥐' : /berliner|krapfen|quarkbällchen|apfelring/i.test(p.name) ? '🍩' : '🥐';
    return { name: p.name, category: heavy ? 'heavy' : 'light', group: p.group, icon } as PackItem;
  });

const TB_TIME = 30;

export function TuetenBlitzView({
  onSaveScore
}: {
  onSaveScore: (points: number, category: string) => void;
  [key: string]: any;
}) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [currentItem, setCurrentItem] = useState<PackItem | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [fx, setFx] = useState<AnswerFxState>(null);
  // Falsch einsortierte Artikel: am Ende anzeigen (mit „Fehler melden“, falls die App sich irrt)
  const [misses, setMisses] = useState<PackItem[]>([]);
  const [seen, setSeen] = useState<PackItem[]>([]);
  const timerRef = useRef<any>(null);
  const { triggerFeedback } = useFeedbackState(350);

  // Aktuelle Werte für den Timer, Punkte werden genau einmal gespeichert
  const scoreRef = useRef(0);
  const onSaveScoreRef = useRef(onSaveScore);
  useEffect(() => { onSaveScoreRef.current = onSaveScore; }, [onSaveScore]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = window.setInterval(() => setTimer(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timer === 0) {
      setGameState('result');
      if (scoreRef.current > 0) onSaveScoreRef.current(scoreRef.current * 3, 'Tüten-Blitz 🛍️');
    }
  }, [gameState, timer]);

  const nextRandomItem = () => {
    const random = ONLY_PRODUCTS[Math.floor(Math.random() * ONLY_PRODUCTS.length)];
    setCurrentItem(random);
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimer(30);
    setGameState('playing'); scrollToPlay();
    setFeedback(null);
    setFx(null);
    setMisses([]);
    setSeen([]);
    nextRandomItem();
  };

  const handleChoice = (chosenCategory: 'heavy' | 'light') => {
    if (!currentItem || gameState !== 'playing' || feedback !== null) return;

    const isCorrect = currentItem.category === chosenCategory;
    if (isCorrect) setSeen(m => (m.some(x => x.name === currentItem.name) ? m : [...m, currentItem]));

    setFx({ k: Date.now(), ok: isCorrect, pts: isCorrect ? 10 + streak * 2 : undefined, text: isCorrect ? `🛍️ +${10 + streak * 2}` : (chosenCategory === 'heavy' ? '✗ Gehört nach oben' : '✗ Gehört nach unten'), streak: isCorrect ? streak + 1 : 0 });
    if (isCorrect) {
      setScore(prev => prev + 10 + (streak * 2));
      setStreak(prev => prev + 1);
      setFeedback('correct');
      triggerFeedback('correct');
    } else {
      setStreak(0);
      setMisses(m => (m.some(x => x.name === currentItem.name) ? m : [...m, currentItem]));
      setFeedback('wrong');
      triggerFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      nextRandomItem();
    }, 350);
  };

  const fbBg = feedback === 'correct' ? TH.tintSage : feedback === 'wrong' ? TH.tintPeach : TH.white;
  const fbBorder = feedback === 'correct' ? TH.green : feedback === 'wrong' ? TH.red : TH.line;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', position: 'relative' }}>
      <ConfettiOverlay active={gameState === 'result'} />
      <PageHead title="Tüten-Blitz" subtitle="Pack die Tüte richtig: Schwere Brote und Laibe nach unten, Brötchen, Gebäck und Kuchen nach oben." />

      {gameState === 'menu' && (
        <GameIntro
          title="Bereit zum Einpacken?"
          text="Du siehst einen Artikel aus unserem Sortiment. Tippe so schnell wie möglich: nach unten oder nach oben in die Tüte?"
          hint="30 Sekunden, jede richtige Antwort in Folge gibt mehr Punkte."
          startLabel="Tüten-Blitz starten (30 Sek.)"
          onStart={startGame}
        />
      )}

      {gameState === 'playing' && currentItem && (
        <>
          <GameProgress left="Zeit" right={`noch ${timer} s`} value={TB_TIME - timer} max={TB_TIME} warn={timer <= 10} />
          <ReportContext report={{ game: 'Tüten-Blitz', product: currentItem.name, text: `Wohin gehört ${currentItem.name} in der Tüte?`, detail: `Laut App: ${currentItem.category === 'heavy' ? 'nach unten' : 'nach oben'}` }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatChip label="Punkte" value={score} />
            <StatChip label="Zeit" value={`${timer} s`} tone={timer <= 10 ? 'warn' : 'yellow'} />
            <StatChip label="Serie" value={streak} />
          </div>
          <div className={feedback === 'correct' ? 'lt-correct' : feedback === 'wrong' ? 'lt-wrong' : undefined} style={{ ...cardStyle, backgroundColor: fbBg, border: `3px solid ${fbBorder}`, padding: '36px 24px', textAlign: 'center', transition: 'background-color .2s ease, border-color .2s ease', position: 'relative' }}>
            <AnswerFx fx={fx} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Wohin damit?</div>
            <div style={{ fontFamily: TH.serif, fontSize: '44px', lineHeight: 1.1, margin: '10px 0 12px' }}>{currentItem.name}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            <button onClick={() => handleChoice('heavy')} style={{ minHeight: '96px', borderRadius: '20px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>↓ Nach unten</span>
              <span style={{ fontSize: '16px', opacity: 0.85 }}>Brote & Laibe</span>
            </button>
            <button onClick={() => handleChoice('light')} style={{ minHeight: '96px', borderRadius: '20px', border: 'none', backgroundColor: TH.yellow, color: TH.ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>↑ Nach oben</span>
              <span style={{ fontSize: '16px' }}>Brötchen, Gebäck & Kuchen</span>
            </button>
          </div>
        </>
      )}

      {gameState === 'result' && (
        <GameResult
          title="Tüte fertig gepackt"
          big={`${score} Punkte`}
          text="So viele Punkte hast du beim Tüten-Blitz geholt."
          reward={score > 0 ? `+${score * 3} Punkte für die Bestenliste` : null}
          againLabel="Noch eine Runde"
          onAgain={startGame}
        />
      )}
      {gameState === 'result' && misses.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '26px' }}>Das gehörte woanders hin</div>
          {misses.map(m => (
            <div key={m.name} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream, fontSize: '17px' }}>
              {m.icon} <strong>{m.name}</strong> gehört {m.category === 'heavy' ? 'nach unten (Brote & Laibe)' : 'nach oben (Brötchen, Gebäck & Kuchen)'}.
              <ReportLink report={{ game: 'Tüten-Blitz', product: m.name, text: `${m.name} gehört laut App ${m.category === 'heavy' ? 'nach unten' : 'nach oben'}.` }} />
            </div>
          ))}
        </div>
      )}
      {gameState === 'result' && <ReportList title="Alle richtig gepackten Artikel ansehen (Fehler melden)" items={seen.filter(x => !misses.some(m => m.name === x.name)).map(m => ({ label: <span>{m.icon} <strong>{m.name}</strong> gehört {m.category === 'heavy' ? 'nach unten' : 'nach oben'}.</span>, report: { game: 'Tüten-Blitz', product: m.name, text: `${m.name} gehört laut App ${m.category === 'heavy' ? 'nach unten' : 'nach oben'}.` } }))} />}
    </div>
  );
}

export default TuetenBlitzView;