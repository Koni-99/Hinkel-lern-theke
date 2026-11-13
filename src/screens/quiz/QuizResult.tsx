// ═══ Quiz: Auswertung nach der Runde ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { CloudPayload } from '../../types';
import { getExamEvaluation } from '../../hilfen/pruefung';
import { getRightAnswerText } from '../../hilfen/allgemein';
import { StarRating, starsFor, ReceiptHead, ReceiptFoot, TH, cardStyle, btnPrimary, btnSecondary, ConfettiOverlay } from '../../ui/basis';
import { ihkGrade } from '../../ui/lernstand';
import { ReportLink } from '../../ui/melden';
import { LT, BTN_YELLOW } from '../../basis/marke';
import type { Question } from '../../daten/questions';

export type QuizResultProps = {
  fetchCloudData: (customUrl?: string | undefined) => Promise<CloudPayload | null>;
  questions: Question[];
  isAdmin: boolean;
  setActiveTab: Dispatch<SetStateAction<string>>;
  pfadMsg: string;
  lastComboExtra: number;
  masteryStart: { ids: number; products: number; } | null;
  currentQuizCategory: string | null;
  setCurrentQuizCategory: Dispatch<SetStateAction<string | null>>;
  setSelectedLevel: Dispatch<SetStateAction<string | null>>;
  quizList: any[];
  score: number;
  correctCount: number;
  wrongQuestions: any[];
  quizRun: number;
  isExamMode: boolean;
  examSim: boolean;
  examPrev: { last: number | null; best: number | null; hist: number[]; };
  launchProductQuiz: (names: string[]) => void;
  retryWrongQuestions: () => void;
  albumNames: Set<string>;
  productTotal: number;
  masteredState: () => { ids: Set<number>; products: Set<string>; };
  resOpen: number | null;
  setResOpen: Dispatch<SetStateAction<number | null>>;
  streakMult: number;
  isNewcomer: boolean;
};

export function QuizResult({ fetchCloudData, questions, isAdmin, setActiveTab, pfadMsg, lastComboExtra, masteryStart, currentQuizCategory, setCurrentQuizCategory, setSelectedLevel, quizList, score, correctCount, wrongQuestions, quizRun, isExamMode, examSim, examPrev, launchProductQuiz, retryWrongQuestions, albumNames, productTotal, masteredState, resOpen, setResOpen, streakMult, isNewcomer }: QuizResultProps) {
  if (currentQuizCategory === null) return null; // wie die Bedingung in App.tsx
  const evalInfo = getExamEvaluation(correctCount, quizList.length);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="lt-receipt" style={{ ...cardStyle, padding: '26px 24px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <ConfettiOverlay active={quizList.length > 0 && correctCount / quizList.length >= 0.75} />
        <ReceiptHead />
        <div style={{ fontSize: '16px', fontWeight: 700, color: LT.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>{currentQuizCategory} {correctCount === 0 ? 'beendet' : correctCount === quizList.length ? 'perfekt geschafft' : 'geschafft'}</div>
        <StarRating n={starsFor(quizList.length ? correctCount / quizList.length : 0)} />
        <div className="lt-count" style={{ fontFamily: LT.serif, fontSize: '66px', lineHeight: 1 }}>{correctCount} / {quizList.length}</div>
        <div style={{ fontSize: '19px', color: LT.brown }}>Fragen richtig</div>
        {(() => {
          const n = quizList.length; const pct = n ? Math.round((correctCount / n) * 100) : 0;
          const combo = !isExamMode && !isAdmin && score > 0 ? lastComboExtra : 0;
          const summe = !isExamMode && !isAdmin && score > 0 ? Math.round((score + combo) * streakMult) : Math.max(0, score);
          const serie = Math.max(0, summe - Math.max(0, score) - combo);
          const stamp = correctCount === n && n > 0 ? 'PERFEKT' : pct >= 75 ? 'SPITZE' : pct >= 50 ? 'GESCHAFFT' : 'WEITER ÜBEN';
          return (
            <>
              <span className={`lt-rc-stamp${pct >= 50 ? ' ok' : ''}`} aria-hidden="true">{stamp}</span>
              <div className="lt-rc-mono lt-rc-lines">
                <div><span>Bereich</span><span style={{ textAlign: 'right' }}>{String(currentQuizCategory).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim()}</span></div>
                <div><span>Richtig</span><span>{correctCount}</span></div>
                <div><span>Falsch</span><span>{n - correctCount}</span></div>
                <div><span>Trefferquote</span><span>{pct} %</span></div>
                {quizRun > 1 && <div><span>Serie im Quiz</span><span>{quizRun}</span></div>}
                {!isExamMode && <div><span>Punkte</span><span>{score > 0 ? `+${score}` : '0'}</span></div>}
                {combo > 0 && <div><span>Combo-Bonus</span><span>+{combo}</span></div>}
                {serie > 0 && <div><span>Serien-Bonus</span><span>+{serie}</span></div>}
                {!isExamMode && <div className="lt-rc-sum"><span>SUMME</span><span>{summe.toLocaleString('de-DE')} PKT</span></div>}
              </div>
            </>
          );
        })()}
        {!isExamMode && score <= 0 && (
          <div style={{ marginTop: '6px', padding: '10px 18px', borderRadius: '14px', backgroundColor: score > 0 ? TH.tintSage : TH.tintPeach, color: score > 0 ? TH.green : LT.brown, fontSize: '19px', fontWeight: 700 }}>
            {score > 0 ? `+${score} Punkte für die Bestenliste` : 'Diesmal 0 Punkte. Schau dir die Erklärungen an, beim nächsten Mal klappt es!'}
          </div>
        )}
        {!isExamMode && !isAdmin && score > 0 && lastComboExtra > 0 && (
          <div className="lt-deal" style={{ padding: '6px 14px', borderRadius: '999px', background: 'linear-gradient(90deg,#C9971C,#FFE27A,#C9971C)', fontSize: '16px', fontWeight: 800 }}>⚡ Combo-Bonus: +{lastComboExtra} Punkte</div>
        )}
        {!isExamMode && !isAdmin && score > 0 && streakMult > 1 && (
          <div className="lt-deal" style={{ padding: '6px 14px', borderRadius: '999px', backgroundColor: dc('#FFE0B2'), fontSize: '16px', fontWeight: 800 }}>🔥 Serien-Bonus ×{streakMult.toFixed(1).replace('.', ',')}: +{Math.round(score * streakMult) - score} Punkte extra</div>
        )}
        {!isExamMode && !isAdmin && isNewcomer && (
          <div style={{ fontSize: '15px', color: LT.muted }}>🌱 In deiner ersten Woche gibt es für falsche Antworten keine Minuspunkte.</div>
        )}
        {!isExamMode && !isAdmin && masteryStart && (() => {
          const now = masteredState();
          const plus = Math.max(0, now.ids.size - masteryStart.ids);
          const prodPlus = Math.max(0, now.products.size - masteryStart.products);
          return (
            <div className="lt-levelup" style={{ marginTop: '6px', width: '100%', maxWidth: '520px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: TH.tintBlue }}>
                <div style={{ fontSize: '26px' }} aria-hidden="true">📈</div>
                <div style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1 }}>{plus > 0 ? `+${plus}` : '±0'}</div>
                <div style={{ fontSize: '14px', color: LT.brown }}>Fragen neu gemeistert · jetzt {now.ids.size} von {questions.length}</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: TH.tintSage }}>
                <div style={{ fontSize: '26px' }} aria-hidden="true">🥖</div>
                <div style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1 }}>{now.products.size} <span style={{ fontSize: '18px' }}>von {productTotal}</span></div>
                <div style={{ fontSize: '14px', color: LT.brown }}>Produkten kennst du schon{prodPlus > 0 ? ` (+${prodPlus} neu)` : ''}</div>
                {(() => { const miss = Array.from(albumNames).filter(n => !now.products.has(n)); return miss.length > 0 && miss.length <= 8 ? <>
                  <div style={{ fontSize: '13px', color: LT.brown, marginTop: '6px' }}>Noch offen: {miss.join(', ')}</div>
                  <button onClick={() => launchProductQuiz(miss)} style={{ marginTop: '8px', minHeight: '40px', padding: '0 12px', borderRadius: '10px', border: 'none', backgroundColor: dc('#2F5D3A'), color: dc('#FFFFFF'), fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Diese Produkte üben</button>
                </> : null; })()}
              </div>
            </div>
          );
        })()}

        {examSim && (() => {
          const pct = quizList.length ? Math.round((correctCount / quizList.length) * 100) : 0;
          const g = ihkGrade(pct);
          return (
            <div style={{ marginTop: '6px', padding: '16px 22px', borderRadius: '18px', backgroundColor: g.passed ? TH.tintSage : TH.tintPeach, maxWidth: '520px' }}>
              <div style={{ fontFamily: LT.serif, fontSize: '40px', lineHeight: 1.05, color: g.passed ? TH.green : TH.red }}>Note {g.note}, {g.text}</div>
              <div style={{ fontSize: '18px', marginTop: '6px', color: LT.brown }}>{pct} % richtig · {g.passed ? 'bestanden' : 'leider nicht bestanden (ab 50 %)'}</div>
              {examPrev.last !== null && (() => { const d = pct - (examPrev.last as number); return (
                <div style={{ marginTop: '10px', fontSize: '17px', fontWeight: 700, color: d > 0 ? TH.green : d < 0 ? TH.red : LT.brown }}>
                  {d > 0 ? `📈 ${d} % besser als beim letzten Mal (${examPrev.last} %)` : d < 0 ? `📉 ${-d} % weniger als beim letzten Mal (${examPrev.last} %)` : `Genauso gut wie beim letzten Mal (${examPrev.last} %)`}
                  {examPrev.best !== null && pct > (examPrev.best as number) ? ' · 🏆 Neuer Bestwert!' : examPrev.best !== null ? ` · Bestwert ${examPrev.best} %` : ''}
                </div>); })()}
              {examPrev.hist.length > 1 && (
                <div aria-label="Deine letzten Versuche" style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '70px', marginTop: '12px' }}>
                  {examPrev.hist.map((h, i) => (
                    <div key={i} title={`${h} %`} style={{ flex: '1 1 0', maxWidth: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '11px', color: LT.brown }}>{h}</span>
                      <span style={{ width: '100%', height: `${Math.max(4, h * 0.5)}px`, borderRadius: '6px 6px 2px 2px', backgroundColor: i === examPrev.hist.length - 1 ? (g.passed ? TH.green : TH.red) : dc('#D9C9AE') }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
        {isExamMode && !examSim && (
          <div style={{ marginTop: '6px', padding: '14px 18px', borderRadius: '16px', backgroundColor: TH.tintYellow, maxWidth: '520px' }}>
            <div style={{ fontWeight: 700, fontSize: '19px' }}>{evalInfo.title}</div>
            <div style={{ fontSize: '17px', marginTop: '4px', color: LT.brown }}>{evalInfo.desc}</div>
          </div>
        )}
        <ReceiptFoot />
      </div>

      {quizList.length > 0 && (() => {
        const isWrong = (q: any) => wrongQuestions.some(w => w.id === q.id);
        const firstWrong = quizList.findIndex(isWrong);
        const open = resOpen !== null && resOpen < quizList.length ? resOpen : firstWrong;
        const oq: any = open >= 0 ? quizList[open] : null;
        return (
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '28px' }}>Deine Antworten</h2>
            <div style={{ fontSize: '15px', color: LT.muted }}>Tippe auf eine Frage, um sie dir anzusehen.{firstWrong >= 0 ? ' Rot sind die falschen.' : ''}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quizList.map((q: any, k: number) => { const bad = isWrong(q); return (
                <button key={k} onClick={() => setResOpen(k)} aria-label={`Frage ${k + 1}, ${bad ? 'falsch' : 'richtig'}`} className="lt-res-chip lt-pop-in" style={{ animationDelay: `${Math.min(k, 20) * 0.04}s`, animationFillMode: 'both', backgroundColor: bad ? TH.tintPeach : TH.tintSage, color: bad ? TH.red : TH.green, borderColor: k === open ? LT.brown : 'transparent' }}>{bad ? '✗' : '✓'}<span style={{ fontSize: '13px', color: LT.brown }}>{k + 1}</span></button>
              ); })}
            </div>
            {oq && (
              <div key={open} className="lt-pop-in" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: LT.cream, border: `2px solid ${isWrong(oq) ? TH.red : TH.green}`, fontSize: '17px', lineHeight: 1.45 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: isWrong(oq) ? TH.red : TH.green, textTransform: 'uppercase', letterSpacing: '1px' }}>Frage {open + 1} · {isWrong(oq) ? 'falsch' : 'richtig'}</div>
                <div style={{ fontWeight: 700, marginTop: '4px' }}>{oq.question}</div>
                <div style={{ color: TH.green, marginTop: '6px' }}>Richtig: <strong>{getRightAnswerText(oq)}</strong></div>
                {oq.explanation && <div style={{ color: LT.muted, marginTop: '4px', fontSize: '16px' }}>{oq.explanation}</div>}
                {typeof oq.id === 'number' && <ReportLink report={{ game: isExamMode ? 'Prüfung' : 'Quiz', qid: oq.id, product: oq.product, text: `${oq.question}\nRichtig laut App: ${getRightAnswerText(oq)}` }} />}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {wrongQuestions.length > 0 && (
          <button onClick={retryWrongQuestions} style={{ ...btnPrimary, backgroundColor: TH.red, color: dc('#FFFFFF'), boxShadow: '0 5px 0 #6E2410' }}>Falsche Fragen direkt üben ({wrongQuestions.length})</button>
        )}
        {String(currentQuizCategory || '').startsWith('Lernpfad') ? (
          <>
            {pfadMsg && <div className="lt-levelup" style={{ padding: '14px 18px', borderRadius: '16px', backgroundColor: correctCount >= 4 ? TH.tintSage : TH.tintPeach, color: correctCount >= 4 ? TH.green : TH.red, fontSize: '18px', fontWeight: 800, textAlign: 'center' }}>{pfadMsg}</div>}
            <button onClick={() => { setCurrentQuizCategory(null); setSelectedLevel(null); setActiveTab('pfad'); }} style={btnPrimary}>🎲 Zurück zum Lernpfad</button>
          </>
        ) : <button onClick={() => { setCurrentQuizCategory(null); setSelectedLevel(null); }} style={BTN_YELLOW}>Zurück zu Lernen</button>}
        <button onClick={() => { setActiveTab('scoreboard'); fetchCloudData(); }} style={btnSecondary}>Zur Bestenliste</button>
      </div>
    </div>
  );
}
