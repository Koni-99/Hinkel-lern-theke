// ═══ Quiz: eine Frage ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../data';
import { CloudPayload } from '../../types';
import { getRightAnswerText } from '../../utils';
import { SpeakButton } from '../../components/KassenblitzView';
import { TH, cardStyle, btnPrimary, AnswerFx, GameProgress, ReportContext } from '../../components/minigameUtils';
import { HINKEL_KUEKEN, LT, BTN_YELLOW, LtIcon } from '../../appBasis';

export type QuizQuestionProps = {
  username: string;
  mutateCloudData: (updater: (current: CloudPayload) => CloudPayload) => void;
  isAdmin: boolean;
  doubleOn: boolean;
  setDoubleOn: Dispatch<SetStateAction<boolean>>;
  jokerHide: { key: string; idx: number[]; } | null;
  currentQuizCategory: string | null;
  setCurrentQuizCategory: Dispatch<SetStateAction<string | null>>;
  setSelectedLevel: Dispatch<SetStateAction<string | null>>;
  quizList: any[];
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  selectedAnswer: number | null;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  selectedMulti: number[];
  setSelectedMulti: Dispatch<SetStateAction<number[]>>;
  isAnswered: boolean;
  setIsAnswered: Dispatch<SetStateAction<boolean>>;
  score: number;
  correctCount: number;
  wrongQuestions: any[];
  setQuizFinished: Dispatch<SetStateAction<boolean>>;
  lastDelta: number | null;
  quizRun: number;
  examTimerEnabled: boolean;
  examSecondsLeft: number;
  isExamMode: boolean;
  examSim: boolean;
  saveScoreToLeaderboard: (finalScore: number, customCat?: string | undefined, allowZero?: boolean) => void;
  applyJoker: (key: string, wrong: number[]) => void;
  spendJoker: (field: string) => void;
  applySwapJoker: () => void;
  finishPfad: (right: number) => void;
  handleOptionClick: (index: number) => void;
  examSimNext: () => void;
  submitMultiAnswer: () => void;
  setToast: Dispatch<SetStateAction<string>>;
  myProg: Record<string, any>;
};

export function QuizQuestion({ username, mutateCloudData, isAdmin, doubleOn, setDoubleOn, jokerHide, currentQuizCategory, setCurrentQuizCategory, setSelectedLevel, quizList, currentIndex, setCurrentIndex, selectedAnswer, setSelectedAnswer, selectedMulti, setSelectedMulti, isAnswered, setIsAnswered, score, correctCount, wrongQuestions, setQuizFinished, lastDelta, quizRun, examTimerEnabled, examSecondsLeft, isExamMode, examSim, saveScoreToLeaderboard, applyJoker, spendJoker, applySwapJoker, finishPfad, handleOptionClick, examSimNext, submitMultiAnswer, setToast, myProg }: QuizQuestionProps) {
  const currentQ = quizList[currentIndex];
  const requiredIndices: number[] = currentQ.correctMulti || [currentQ.correct];
  const isMulti = requiredIndices.length > 1;
  const jokerKey = `${currentQuizCategory}|${currentIndex}|${currentQ.id}`;
  const hiddenOpts: number[] = jokerHide && jokerHide.key === jokerKey ? jokerHide.idx : [];
  const myJokers = Number(myProg._jokers) || 0;
  const canJoker = !isAnswered && !isExamMode && !examSim && !isMulti && !isAdmin && myJokers > 0 && hiddenOpts.length === 0 && currentQ.options.length >= 3;
  const mins = Math.floor(examSecondsLeft / 60);
  const secs = examSecondsLeft % 60;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div id="lt-quiz-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', scrollMarginTop: '12px' }}>
        <button onClick={() => { setCurrentQuizCategory(null); setSelectedLevel(null); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 14px 0 10px', borderRadius: '999px', border: '1px solid #E8DCC6', backgroundColor: dc('#FFFFFF'), color: LT.brown, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}><LtIcon paths={['M6 6l12 12', 'M18 6 6 18']} size={16} width={2.6} />Abbrechen</button>
        <span style={{ fontSize: '17px', fontWeight: 700, color: LT.muted }}>{currentQuizCategory}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isExamMode && (examTimerEnabled || examSim) && (
            <span style={{ padding: '8px 14px', borderRadius: '12px', backgroundColor: examSecondsLeft <= 60 ? TH.tintPeach : TH.tintYellow, color: examSecondsLeft <= 60 ? TH.red : LT.ink, fontSize: '17px', fontWeight: 700 }}>{mins}:{secs < 10 ? `0${secs}` : secs}</span>
          )}
        </div>
      </div>
      <GameProgress label="Frage" index={currentIndex} answered={isAnswered} total={quizList.length} />

      <div key={currentIndex} className={`lt-qcard ${isAnswered && !examSim ? ((lastDelta !== null ? lastDelta > 0 : wrongQuestions.every(w => w.id !== currentQ.id)) ? 'lt-ans-ok' : 'lt-ans-bad') : 'lt-pop-in'}`} style={{ ...cardStyle, padding: '26px 22px 22px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
        {isAnswered && !examSim && (() => {
          const ok = (lastDelta !== null ? lastDelta > 0 : wrongQuestions.every(w => w.id !== currentQ.id));
          const text = lastDelta !== null ? `${lastDelta > 0 ? '+' : ''}${lastDelta} Punkte` : ok ? '✓ richtig' : '✗ falsch';
          return <AnswerFx fx={{ k: currentIndex + 1, ok, text, streak: quizRun, pts: lastDelta !== null && lastDelta > 0 ? lastDelta : ok ? 0 : undefined }} />;
        })()}
        {isMulti && (
          <div style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: '12px', backgroundColor: TH.tintBlue, fontSize: '16px', fontWeight: 700 }}>Mehrere Antworten richtig, alle antippen, dann „Antwort prüfen“</div>
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, flex: '1 1 240px', minWidth: 0, fontFamily: LT.serif, fontSize: '25px', lineHeight: 1.22, color: LT.ink, overflowWrap: 'break-word', textWrap: 'balance' as any }}>{currentQ.question}</h2>
          <SpeakButton small text={isAnswered && !examSim ? `Richtig ist: ${getRightAnswerText(currentQ)}. ${currentQ.explanation || ''}` : `${currentQ.question} ${currentQ.options.map((o: string, i: number) => `${String.fromCharCode(65 + i)}: ${o}`).join('. ')}`} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentIndex === 0 && !isAnswered && !isExamMode && !examSim && !isAdmin && !doubleOn && (Number(myProg._jokersDouble) || 0) > 0 && (
            <button onClick={() => { setDoubleOn(true); spendJoker('_jokersDouble'); setToast('✖️ Doppel-Joker aktiv: Punkte für dieses Quiz zählen doppelt!'); }} style={{ alignSelf: 'flex-start', minHeight: '46px', padding: '0 16px', borderRadius: '12px', border: `2px dashed ${LT.brown}`, backgroundColor: TH.tintPeach, color: LT.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>✖️ Doppel-Joker einsetzen ({Number(myProg._jokersDouble) || 0} übrig)</button>
          )}
          {doubleOn && !isAnswered && <span className="lt-deal" style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '999px', backgroundColor: TH.tintPeach, fontWeight: 800, fontSize: '15px' }}>✖️ Doppelte Punkte aktiv</span>}
          {!isAnswered && !isExamMode && !examSim && !isAdmin && (Number(myProg._jokersSwap) || 0) > 0 && (
            <button onClick={applySwapJoker} style={{ alignSelf: 'flex-start', minHeight: '46px', padding: '0 16px', borderRadius: '12px', border: `2px dashed ${LT.brown}`, backgroundColor: TH.tintBlue, color: LT.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>🔄 Frage tauschen ({Number(myProg._jokersSwap) || 0} übrig)</button>
          )}
          {canJoker && (
            <button onClick={() => applyJoker(jokerKey, currentQ.options.map((_: string, i: number) => i).filter((i: number) => !requiredIndices.includes(i)))} style={{ alignSelf: 'flex-start', minHeight: '46px', padding: '0 16px', borderRadius: '12px', border: `2px dashed ${LT.brown}`, backgroundColor: TH.tintYellow, color: LT.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>🃏 50:50-Joker einsetzen ({myJokers} übrig)</button>
          )}
          {currentQ.options.map((opt: string, idx: number) => {
            if (hiddenOpts.includes(idx) && !isAnswered) return null;
            const isCorrectOption = requiredIndices.includes(idx);
            const isSelected = isMulti ? selectedMulti.includes(idx) : selectedAnswer === idx;
            let bg = isSelected ? '#FFF3CF' : '#FFFDF6';
            let border = isSelected ? '#1F140C' : '#EADCC3';
            let badgeBg = isSelected ? '#1F140C' : dc('#FFFFFF');
            let badgeColor = isSelected ? '#FFD86B' : LT.ink;
            let dim = false;
            if (isAnswered) {
              if (isCorrectOption) { bg = '#E3F2E1'; border = '#2F7A3E'; badgeBg = '#2F7A3E'; badgeColor = dc('#FFFFFF'); }
              else if (isSelected) { bg = '#FCE4DE'; border = '#D92D20'; badgeBg = '#D92D20'; badgeColor = dc('#FFFFFF'); }
              else { bg = dc('#FFFFFF'); border = '#EADCC3'; badgeBg = dc('#FFFFFF'); badgeColor = LT.muted; dim = true; }
            }
            return (
              <button key={idx} className={`lt-qopt${dim ? ' lt-qopt-dim' : ''}${isAnswered ? (isCorrectOption ? (isSelected ? ' lt-correct lt-glow' : ' lt-correct') : isSelected ? ' lt-wrong' : '') : ''}`} onClick={() => handleOptionClick(idx)} disabled={isAnswered} style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '62px', padding: '10px 14px', borderRadius: '16px', border: `2px solid ${border}`, boxShadow: `0 3px 0 ${border}`, backgroundColor: bg, color: LT.ink, textAlign: 'left', fontSize: '18px', lineHeight: 1.35, cursor: isAnswered ? 'default' : 'pointer' }}>
                <span style={{ flex: '0 0 36px', height: '36px', borderRadius: isMulti ? '10px' : '50%', backgroundColor: badgeBg, color: badgeColor, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '17px', boxSizing: 'border-box' }}>
                  {isMulti ? (isSelected ? '✓' : '') : String.fromCharCode(65 + idx)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isAnswered && isCorrectOption && <span style={{ fontWeight: 700, fontSize: '14px', color: '#2F7A3E', whiteSpace: 'nowrap' }}>richtig</span>}
                {isAnswered && !isCorrectOption && isSelected && <span style={{ fontWeight: 700, fontSize: '14px', color: '#D92D20', whiteSpace: 'nowrap' }}>deine Antwort</span>}
              </button>
            );
          })}
        </div>
        {examSim && (
          <>
            <div style={{ fontSize: '16px', color: LT.muted }}>Prüfungssimulation: Die Lösungen siehst du erst am Ende.</div>
            <button onClick={examSimNext} className="lt-sticky-next" style={btnPrimary}>
              {(isMulti ? selectedMulti.length === 0 : selectedAnswer === null) ? 'Überspringen' : currentIndex + 1 < quizList.length ? 'Weiter →' : 'Prüfung abgeben'}
            </button>
          </>
        )}
        {typeof currentQ.id === 'number' && <ReportContext report={{ game: examSim ? 'Prüfung' : 'Quiz', qid: currentQ.id, product: currentQ.product, text: currentQ.question }} />}
        {isMulti && !isAnswered && !examSim && (
          <button onClick={submitMultiAnswer} disabled={selectedMulti.length === 0} style={{ ...btnPrimary, opacity: selectedMulti.length === 0 ? 0.45 : 1 }}>Antwort prüfen ({selectedMulti.length} gewählt)</button>
        )}
        {isAnswered && (
          <>
            {(() => { const okNow = lastDelta !== null ? lastDelta > 0 : wrongQuestions.every(w => w.id !== currentQ.id); return (
            <div className="lt-expl lt-qnote" style={{ marginTop: '14px' }}>
              <img src={HINKEL_KUEKEN} alt="" aria-hidden="true" className={`lt-loaded lt-qnote-kueken${okNow ? ' lt-happy' : ''}`} />
              <span className="lt-qnote-lbl">{okNow ? 'Richtig! Gut zu wissen' : 'Nicht ganz. Merk dir das'}</span>
              {currentQ.explanation}
            </div>); })()}
            <button onClick={() => {
              if (currentIndex + 1 < quizList.length) { setCurrentIndex(currentIndex + 1); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); }
              else { setQuizFinished(true); if (!isAdmin && username && quizList.length >= 5) { const allOk = correctCount === quizList.length; const k = username.toLowerCase(); mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._perfRun = allOk ? (Number(pr._perfRun) || 0) + 1 : 0; if (pr._perfRun >= 5) pr._secret = { ...(pr._secret || {}), perfekt: 1 }; return curr; }); } const isPfad = String(currentQuizCategory || '').startsWith('Lernpfad'); saveScoreToLeaderboard(Math.max(0, doubleOn ? score * 2 : score), isPfad ? 'Lernpfad' : undefined, true); if (doubleOn && score > 0) { setDoubleOn(false); setToast(`✖️ Doppel-Joker: ${score * 2} statt ${score} Punkte!`); } if (isPfad) finishPfad(correctCount); }
            }} className="lt-sticky-next" style={BTN_YELLOW}>
              {currentIndex + 1 < quizList.length ? 'Nächste Frage' : 'Kassenbon zeigen'}<LtIcon paths={['M5 12h14', 'm13 6 6 6-6 6']} size={22} width={2.6} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
