// ═══ Spiel: Preis-Duell ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, useRef } from 'react';
import { dc } from '../data';
import { focusShuffle, noteResult } from '../focus';
import { SHOP_PRODUCTS } from '../shopProducts';
import { TH, cardStyle, btnPrimary, PageHead, StatChip, GameIntro, GameResult, ProductImages, AnswerFx, AnswerFxState, ReportList, ReportContext, scrollToPlay } from '../components/minigameUtils';
import { OnLearn, LearnHint, KnownMap, OnKnown, useOnlyNew, OnlyNewToggle, learnedText, imgOf, centsText } from './spielBasis';
import { pick, parseCents } from './theke/basis';
import { ShopProduct, bqName } from './BilderQuiz';

/** Zählt eine Zahl kurz hoch (für aufgedeckte Preise) */
export function CountUpPrice({ cents }: { cents: number }) {
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

export const PRICE_POOL = SHOP_PRODUCTS.filter(p => parseCents(p.price) > 0 && !['Sonstiges', 'Backmischung'].includes(p.group));

/** Nächstes Produkt: anderer Preis (mind. 10 Cent Unterschied), je länger die Serie, desto knapper die Preise */
export function nextPriceProduct(current: ShopProduct, used: string[], streak: number, avoid: string[] = []): ShopProduct {
  const cur = parseCents(current.price);
  let cands = PRICE_POOL.filter(p => p.name !== current.name && bqName(p.name) !== bqName(current.name) && !used.includes(p.name) && !avoid.includes(p.name) && Math.abs(parseCents(p.price) - cur) >= 10);
  if (cands.length < 4 && avoid.length) cands = PRICE_POOL.filter(p => p.name !== current.name && bqName(p.name) !== bqName(current.name) && !used.includes(p.name) && Math.abs(parseCents(p.price) - cur) >= 10);
  if (cands.length < 4) cands = PRICE_POOL.filter(p => p.name !== current.name && Math.abs(parseCents(p.price) - cur) >= 10);
  const sorted = [...cands].sort((a, b) => Math.abs(parseCents(a.price) - cur) - Math.abs(parseCents(b.price) - cur));
  const share = streak >= 8 ? 0.25 : streak >= 3 ? 0.5 : 1;
  return focusShuffle(sorted.slice(0, Math.max(3, Math.ceil(sorted.length * share))), p => p.name, 1)[0];
}

export function PriceCard({ p, images, reveal, hidden, tone }: { p: ShopProduct; images: ProductImages; reveal?: boolean; hidden?: boolean; tone?: 'ok' | 'bad' }) {
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
