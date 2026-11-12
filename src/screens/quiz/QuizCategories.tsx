// ═══ Quiz: Bereich wählen ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../data';
import { CATS } from '../../questions';
import { CloudPayload } from '../../types';
import { todayLocal } from '../../utils';
import { cardStyle, PageHead } from '../../components/minigameUtils';
import { LT, LtIcon, ICON, CAT_STYLE } from '../../appBasis';
import type { OnboardingItem } from '../../components/minigameUtils';
import type { Question } from '../../questions';

export type QuizCategoriesProps = {
  username: string;
  fetchCloudData: (customUrl?: string | undefined) => Promise<CloudPayload | null>;
  questions: Question[];
  isAdmin: boolean;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setPfadMsg: Dispatch<SetStateAction<string>>;
  setCurrentQuizCategory: Dispatch<SetStateAction<string | null>>;
  setSelectedSubfilter: Dispatch<SetStateAction<string>>;
  setSelectedLevel: Dispatch<SetStateAction<string | null>>;
  setBattleState: Dispatch<SetStateAction<"menu" | "playing" | "waiting">>;
  EXPERT_MIN: 25;
  launchMeisterRunde: () => void;
  launchExpertQuiz: () => void;
  launchDailyChallenge: () => void;
  launchPersonalWeaknessQuiz: () => void;
  launchSonderverkaufTrainer: () => void;
  getCategoryProgress: (cat: string) => { totalAnswered: number; total: number; };
  overallPercent: number;
  myWrongCount: number;
  fehlerDue: number;
  isDailyDone: boolean;
  isMeister: boolean;
  meisterLeft: number;
  myProg: Record<string, any>;
  onboarding: { items: (OnboardingItem & { done: boolean; self?: boolean | undefined; })[]; done: number; total: number; };
  showErsteWoche: boolean;
  appWeek: { items: (OnboardingItem & { done: boolean; self?: boolean | undefined; })[]; done: number; total: number; };
  showAppWeek: boolean;
  nowMonth: number;
  learnableCount: number;
  examSection: JSX.Element;
};

export function QuizCategories({ username, fetchCloudData, questions, isAdmin, setActiveTab, setPfadMsg, setCurrentQuizCategory, setSelectedSubfilter, setSelectedLevel, setBattleState, EXPERT_MIN, launchMeisterRunde, launchExpertQuiz, launchDailyChallenge, launchPersonalWeaknessQuiz, launchSonderverkaufTrainer, getCategoryProgress, overallPercent, myWrongCount, fehlerDue, isDailyDone, isMeister, meisterLeft, myProg, onboarding, showErsteWoche, appWeek, showAppWeek, nowMonth, learnableCount, examSection }: QuizCategoriesProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <PageHead title="Lernen" subtitle="Such dir einen Bereich aus und leg los. Nach jeder Antwort siehst du die Erklärung." />
    
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '32px' }}>Hier lernst du</h2>
          <span style={{ fontSize: '17px', color: LT.muted }}>{questions.length} Fragen</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {['Alle', ...CATS].map((cat, ci) => {
            const prog = getCategoryProgress(cat);
            const pct = prog.total > 0 ? Math.round((prog.totalAnswered / prog.total) * 100) : 0;
            return (
              <button key={cat} onClick={() => { setCurrentQuizCategory(cat); setSelectedSubfilter('all'); setSelectedLevel(null); }} className="lt-card" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', cursor: 'pointer', color: LT.ink, padding: '20px', backgroundColor: dc('#FFFFFF'), borderColor: cat === 'Alle' ? '#FFC72C' : LT.line, borderWidth: cat === 'Alle' ? '2px' : '1px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ flex: '0 0 auto', width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={(CAT_STYLE[cat] || CAT_STYLE.Alle).icon} size={22} width={1.9} /></span><span style={{ fontWeight: 700, fontSize: '19px' }}>{cat === 'Alle' ? 'Alle Bereiche mischen' : cat}</span></span>
                <div style={{ height: '10px', backgroundColor: dc('#F4EADB'), borderRadius: '999px', overflow: 'hidden' }}>
                  <div className="lt-fill" style={{ width: `${pct}%`, height: '100%', backgroundColor: LT.brown, borderRadius: '999px', animationDelay: `${0.15 + ci * 0.08}s` }} />
                </div>
                <span style={{ fontSize: '16px', color: LT.muted }}>{prog.totalAnswered} von {prog.total} gemeistert · {pct} %</span>
              </button>
            );
          })}
        </div>
      </section>
    
    
      <h2 style={{ margin: '4px 0 -10px', fontFamily: LT.serif, fontWeight: 400, fontSize: '30px' }}>Mehr zum Üben</h2>
      <div className="lt-uebung" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <button disabled={isDailyDone} onClick={launchDailyChallenge} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: isDailyDone ? 'default' : 'pointer', opacity: isDailyDone ? 0.7 : 1 }}>
          <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.bolt} size={22} width={1.9} /></span>
          <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Tages-Challenge</span>
          <span style={{ fontSize: '17px' }}>{isDailyDone ? 'Heute erledigt, bis morgen!' : '5 Fragen, Extra-Punkte'}</span>
        </button>
        <button onClick={launchPersonalWeaknessQuiz} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.repeat} size={24} /></span>
          <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Fehler-Stapel</span>
          <span style={{ fontSize: '17px' }}>{myWrongCount === 0 ? 'Leer, prima!' : fehlerDue > 0 ? `${fehlerDue} heute fällig · ${myWrongCount} im Stapel` : `${myWrongCount} im Stapel · heute nichts fällig`}</span>
        </button>
        {showErsteWoche && (
          <button onClick={() => setActiveTab('einarbeitung')} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.checklist} size={24} /></span>
            <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Erste Woche bei Hinkel</span>
            <span style={{ fontSize: '17px' }}>{onboarding.done} von {onboarding.total} erledigt</span>
          </button>
        )}
        {showAppWeek && (
          <button onClick={() => setActiveTab('appwoche')} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.phone} size={24} /></span>
            <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Erste Woche mit der App</span>
            <span style={{ fontSize: '17px' }}>{appWeek.done} von {appWeek.total} erledigt</span>
          </button>
        )}
        {(() => {
          const open = overallPercent >= EXPERT_MIN;
          const doneToday = localStorage.getItem(`hinkel_expert_${username.toLowerCase()}`) === todayLocal();
          return (
            <button onClick={launchExpertQuiz} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: open ? LT.ink : LT.muted, textAlign: 'left', cursor: 'pointer', opacity: doneToday ? 0.6 : 1 }}>
              <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={open ? ICON.medal : ICON.lock} size={24} /></span>
              <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Experten-Ecke</span>
              <span style={{ fontSize: '17px' }}>{!open ? `Beantworte Fragen richtig: ab ${EXPERT_MIN} % gemeistert geht sie auf (du hast ${overallPercent} %)` : doneToday ? 'Heute geschafft, morgen geht es weiter' : '10 knifflige Fragen, doppelte Punkte'}</span>
            </button>
          );
        })()}
        {!isAdmin && (overallPercent >= 90) && (
          <button onClick={launchMeisterRunde} disabled={!isMeister} className={isMeister ? 'lt-card lt-meister-card' : 'lt-card'} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: isMeister ? dc('#FFF4C7') : dc('#EFE6D8'), color: isMeister ? LT.ink : LT.muted, textAlign: 'left', cursor: isMeister ? 'pointer' : 'default' }}>
            <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={isMeister ? ICON.medal : ICON.lock} size={24} /></span>
            <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Meister-Runde</span>
            <span style={{ fontSize: '17px' }}>{isMeister ? '15 schwere Fragen, dreifache Punkte, so oft du willst' : `Für alle mit 100 % gemeistert, noch ${meisterLeft} ${meisterLeft === 1 ? 'Frage' : 'Fragen'}`}</span>
          </button>
        )}
        {!isAdmin && (
          <button onClick={() => { setPfadMsg(''); setActiveTab('pfad'); }} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.dice} size={24} /></span>
            <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Lernpfad</span>
            <span style={{ fontSize: '17px' }}>{(Number(myProg._pfad) || 0) >= 24 ? 'Ziel erreicht, Brotmeister!' : `Feld ${(Number(myProg._pfad) || 0) + 1} von 24 · Feld für Feld zum Brotmeister`}</span>
          </button>
        )}
        <button onClick={launchSonderverkaufTrainer} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.swap} size={24} /></span>
          <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>Alternativen-Trainer</span>
          <span style={{ fontSize: '17px' }}>Sonderverkauf & Kundenberatung</span>
        </button>
      </div>
    
      {/* Spielen zählt fürs Lernen */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 22px', borderRadius: '22px', backgroundColor: '#F6EFE2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span aria-hidden="true" style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.game} size={24} width={1.9} /></span>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{ fontFamily: LT.serif, fontSize: '26px', lineHeight: 1.1 }}>Keine Lust auf Quiz? Spielen zählt auch!</div>
            <div style={{ fontSize: '17px', color: LT.brown, marginTop: '4px' }}>{learnableCount} Fragen kannst du auch nebenbei in Spielen abhaken, richtig beantwortet ist richtig beantwortet.</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          {[
            { t: 'Theken-Simulator', d: 'Zutaten, Preise, Mehl und Schnitt im Kundengespräch', tab: 'theke' },
            { t: 'Schneide-Profi', d: 'Alle Fragen zur Schnittstärke', tab: 'schneiden' },
            { t: 'Alternativen-Jäger', d: 'Fragen „ausverkauft, welche Alternative?“', tab: 'alternativen' },
            { t: 'Welches Brot ist das?', d: 'Beschreibung und Warengruppe der erkannten Produkte', tab: 'bilderquiz' },
            { t: 'Allergene-Training', d: 'Allergen-Fragen zu den richtig beratenen Produkten', tab: 'allergene' },
            { t: 'Teurer oder billiger?', d: 'Preis-Fragen zu den aufgedeckten Produkten', tab: 'preisduell' },
            { t: 'Quiz Battle', d: 'Jede Battle-Frage zählt wie im Quiz', tab: 'battle' },
            ...(nowMonth === 11 ? [{ t: 'Adventskalender', d: 'Jedes Türchen ist eine Quizfrage', tab: 'advent' }] : []),
          ].map(g => (
            <button key={g.t} onClick={() => { if (g.tab === 'battle') { setBattleState('menu'); fetchCloudData(); } setActiveTab(g.tab); }} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 14px', borderRadius: '14px', border: 'none', backgroundColor: dc('#FFFFFF'), color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ fontWeight: 700, fontSize: '17px' }}>{g.t} ›</span>
              <span style={{ fontSize: '15px', color: LT.muted }}>{g.d}</span>
            </button>
          ))}
        </div>
      </section>
    
      <details className="lt-fold" style={{ ...cardStyle, padding: 0 }}>
        <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 22px', minHeight: '60px' }}>
          <span aria-hidden="true" style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.cap} size={24} width={1.9} /></span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: LT.serif, fontSize: '26px', lineHeight: 1.1 }}>Prüfungen</span>
            <span style={{ display: 'block', fontSize: '15px', color: LT.muted }}>Für Azubis und alle, die es genau wissen wollen</span>
          </span>
          <span className="lt-fold-arrow" aria-hidden="true" style={{ fontSize: '20px' }}>▾</span>
        </summary>
        <div style={{ padding: '0 12px 12px' }}>{examSection}</div>
      </details>
    </div>
  );
}
