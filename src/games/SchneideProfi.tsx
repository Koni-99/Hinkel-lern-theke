// ═══ Spiel: Schneide-Profi ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState } from 'react';
import { dc } from '../daten/data';
import { shuffleArray } from '../hilfen/allgemein';
import { focusShuffle, noteResult } from '../focus';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { GameProgress, AnswerFx, AnswerFxState } from '../ui/antwortFx';
import { TH, cardStyle, btnPrimary, PageHead, StatChip, GameResult, ProductImages, starsFor } from '../ui/basis';
import { ReportContext } from '../ui/melden';
import { scrollToPlay } from '../ui/belohnungen';
import { scrollToCard, OnLearn, LearnHint, SpeakButton, KnownMap, OnKnown, useOnlyNew, OnlyNewToggle, AllAtOnceButton, FinishEarlyButton, learnedText, imgOf } from './spielBasis';
import { SLICE, TYPE_LABEL } from './theke/basis';
import { scrollToNext, ShopProduct } from './BilderQuiz';

// ═════════════════════════ Schneide-Profi ═════════════════════════

export const SLICE_OPTIONS = [
  { mm: '5,5 mm', label: 'dünn', w: 5.5 },
  { mm: '9 mm', label: 'mittel', w: 9 },
  { mm: '12 mm', label: 'dick', w: 12 },
];

/** Im Schneide-Profi nur echte Schnittbrote – diese Produkte kommen dort nicht vor */
export const SLICE_EXCLUDE = ['Wunderzopf'];

export const SLICE_POOL = SHOP_PRODUCTS.filter(p => !!p.breadType && !!SLICE[p.breadType] && ['Brot', 'Stuten & Brioche'].includes(p.group) && !SLICE_EXCLUDE.includes(p.name));

export function buildSliceRounds(count = 10, skip: string[] = []): ShopProduct[] {
  const by = (mm: string) => focusShuffle(SLICE_POOL.filter(p => SLICE[p.breadType!] === mm && !skip.includes(p.name)), p => p.name, 3);
  const thin = by('5,5 mm'), mid = by('9 mm'), thick = by('12 mm');
  let picked = [...thin.slice(0, 3), ...thick.slice(0, 3), ...mid.slice(0, count - Math.min(3, thin.length) - Math.min(3, thick.length))];
  if (picked.length < count) picked = [...picked, ...shuffleArray([...thin.slice(3), ...thick.slice(3), ...mid].filter(p => !picked.includes(p)))].slice(0, count);
  return shuffleArray(picked).slice(0, count);
}

/** Kleines Brot mit Scheiben im richtigen Abstand */
export function SliceLoaf({ mm, highlight }: { mm: number; highlight?: boolean }) {
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
