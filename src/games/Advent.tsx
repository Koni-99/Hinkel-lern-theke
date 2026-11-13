// ═══ Adventskalender ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, useRef } from 'react';
import { dc } from '../daten/data';
import { shuffleArray } from '../utils';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { TH, cardStyle, btnPrimary, StatChip } from '../ui/basis';
import { AnswerFx, AnswerFxState } from '../ui/antwortFx';
import { ReportContext } from '../ui/melden';
import { SpeakButton, seededShuffle } from './spielBasis';
import { scrollToNext } from './BilderQuiz';

// ═════════════════════════ Adventskalender ═════════════════════════

export type AdventDone = Record<string, { ok: boolean; d?: string; qid?: number }>;

export const XMAS_NAMES = new Set(SHOP_PRODUCTS.filter(p => p.group === 'Weihnachtsgebäck').flatMap(p => [p.name, ...(p.aliases || [])]));

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
