// ═══ Spiel: Allergene-Training ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState } from 'react';
import { dc } from '../daten/data';
import { shuffleArray } from '../utils';
import { focusShuffle, noteResult } from '../focus';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { GameProgress, AnswerFx, AnswerFxState } from '../ui/antwortFx';
import { TH, cardStyle, btnPrimary, PageHead, StatChip, GameIntro, GameResult, productImageKey, ProductImages, starsFor } from '../ui/basis';
import { ReportContext } from '../ui/melden';
import { scrollToPlay } from '../ui/belohnungen';
import { scrollToCard, OnLearn, LearnHint, SpeakButton, KnownMap, OnKnown, useOnlyNew, OnlyNewToggle, AllAtOnceButton, FinishEarlyButton, learnedText } from './spielBasis';
import { scrollToNext, ShopProduct } from './BilderQuiz';

// ═════════════════════════ Allergene-Training ═════════════════════════

export type AllergenTest = { id: string; label: string; kein: string; tag: RegExp; ing: RegExp; safeRounds: boolean };

export const ALLERGEN_TESTS: AllergenTest[] = [
  { id: 'milch', label: 'Milch', kein: 'keine Milch', tag: /^milch/i, ing: /milch|butter|sahne|quark|käse|joghurt|molke|laktose|gouda|feta/i, safeRounds: true },
  { id: 'eier', label: 'Eier', kein: 'keine Eier', tag: /^eier?$/i, ing: /\beier?\b|vollei|hühnerei|eigelb|eiweiß|eiklar/i, safeRounds: true },
  { id: 'nuesse', label: 'Nüsse', kein: 'keine Nüsse', tag: /schalenfrüchte|mandel|pistazie|haselnu|walnu/i, ing: /nuss|nüsse|mandel|haselnu|walnu|pistazie|cashew|pekan|macadamia/i, safeRounds: true },
  { id: 'sesam', label: 'Sesam', kein: 'keinen Sesam', tag: /sesam/i, ing: /sesam/i, safeRounds: false },
  { id: 'senf', label: 'Senf', kein: 'keinen Senf', tag: /^senf/i, ing: /senf/i, safeRounds: false },
  { id: 'sellerie', label: 'Sellerie', kein: 'keinen Sellerie', tag: /sellerie/i, ing: /sellerie/i, safeRounds: false },
];

export type AllergenRound = { test: AllergenTest; mode: 'safe' | 'contains'; options: ShopProduct[]; answer: ShopProduct };

export function splitByAllergen(t: AllergenTest) {
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
export const ALLERGEN_KEYS: string[] = (() => {
  const keys = new Set<string>();
  ALLERGEN_TESTS.forEach(t => {
    const { withIt, without } = splitByAllergen(t);
    if (without.length >= 3) withIt.forEach(p => keys.add(`${t.id}|${p.name}`));
    if (t.safeRounds && withIt.length >= 3) without.forEach(p => keys.add(`${t.id}|${p.name}`));
  });
  return Array.from(keys);
})();

export function buildAllergenRounds(count = 10, skip: string[] = []): AllergenRound[] {
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
