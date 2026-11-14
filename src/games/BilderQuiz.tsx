// ═══ Spiel: Bilderquiz ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState, useRef } from 'react';
import { dc } from '../daten/data';
import { shuffleArray } from '../hilfen/allgemein';
import { focusShuffle, noteResult } from '../focus';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { GameProgress, AnswerFx, AnswerFxState } from '../ui/antwortFx';
import { TH, cardStyle, btnPrimary, PageHead, StatChip, GameResult, productImageKey, ProductImages, starsFor } from '../ui/basis';
import { ReportContext } from '../ui/melden';
import { scrollToPlay } from '../ui/belohnungen';
import { scrollToCard, OnLearn, LearnHint, SpeakButton, AllAtOnceButton, FinishEarlyButton, learnedText } from './spielBasis';

// ═════════════════════════ Bilderquiz „Welches Brot ist das?“ ═════════════════════════

/** Nach dem Antworten: Erklärung und „Weiter“-Knopf sanft ins Bild holen */
export const scrollToNext = () => window.setTimeout(() => {
  const el = document.querySelector('.lt-expl');
  if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'end' });
}, 80);

export type ShopProduct = (typeof SHOP_PRODUCTS)[number];

export type BqCat = 'brot' | 'broetchen' | 'suess';

export type BqRound = { answer: ShopProduct; options: ShopProduct[]; img: string };

/** Verpackte Artikel (Name steht auf der Tüte) und Sorten, die auf dem Foto gleich aussehen, lassen wir weg */
export const BQ_EXCLUDE = new Set(['Backmischung Abendschnitte', 'Granola', 'Knäckebrot', 'Paniermehl', 'Mandelsplitter Zartbitter', 'Florentinertaler', 'Schweineohr mit Schokolade']);

export const bqName = (n: string) => n.replace(/^(Kleines|Großes) /, '');

export const bqCat = (p: ShopProduct): BqCat => (p.breadType && p.breadType !== 'stuten' ? 'brot' : ['Brötchen', 'Herzhafte Snacks'].includes(p.group) ? 'broetchen' : 'suess');

export const BQ_FILTERS: { id: 'alle' | BqCat; label: string }[] = [
  { id: 'alle', label: 'Alles gemischt' },
  { id: 'brot', label: 'Nur Brot' },
  { id: 'broetchen', label: 'Brötchen & Snacks' },
  { id: 'suess', label: 'Süßes & Stuten' },
];

export const firstSentence = (s: string) => {
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

export function buildBilderRounds(pool: ShopProduct[], images: ProductImages, filter: 'alle' | BqCat, count = 10, skip?: Set<string>): BqRound[] {
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
                  {learnedNow > 0 && <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 700, color: dc('#2F4F8A') }}>{learnedNow === 1 ? 'Eine Quizfrage' : `${learnedNow} Quizfragen`} zu „{bqName(r.answer.name)}“ jetzt in deinem Lernbereich abgehakt.</div>}
                  {learnedNow === 0 && chosen === r.answer.name && onLearn && <div style={{ marginTop: '8px', fontSize: '15px', color: dc('#2F4F8A') }}>Die Quizfragen zu diesem Produkt hattest du schon gemeistert.</div>}
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
