// ═══ Quiz: Stufe wählen ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc, SORTIMENT_SUBFILTERS } from '../../daten/data';
import { matchesSortimentSubfilter } from '../../hilfen/allgemein';
import { TH, btnSecondary, PageHead } from '../../ui/basis';
import { correctIdSet } from '../../ui/lernstand';
import { LT } from '../../basis/marke';
import type { Question } from '../../daten/questions';

export type QuizLevelsProps = {
  questions: Question[];
  isAdmin: boolean;
  currentQuizCategory: string | null;
  setCurrentQuizCategory: Dispatch<SetStateAction<string | null>>;
  selectedSubfilter: string;
  setSelectedSubfilter: Dispatch<SetStateAction<string>>;
  onlyNew: boolean;
  toggleOnlyNew: () => void;
  quizPool: (level: string, onlyNewQs: boolean) => Question[];
  launchQuizWithLevel: (level: string) => void;
  overallPercent: number;
  myProg: Record<string, any>;
};

export function QuizLevels({ questions, isAdmin, currentQuizCategory, setCurrentQuizCategory, selectedSubfilter, setSelectedSubfilter, onlyNew, toggleOnlyNew, quizPool, launchQuizWithLevel, overallPercent, myProg }: QuizLevelsProps) {
  if (currentQuizCategory === null) return null; // wie die Bedingung in App.tsx
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageHead title={currentQuizCategory === 'Alle' ? 'Alle Bereiche' : currentQuizCategory} subtitle="Wie schwer soll es sein?" onBack={() => setCurrentQuizCategory(null)} backLabel="Zurück zu Lernen" />
      {currentQuizCategory === 'Sortiment & Warenkunde' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SORTIMENT_SUBFILTERS.map(sub => {
            const active = selectedSubfilter === sub.id;
            const subQs = questions.filter((q: any) => q.category === 'Sortiment & Warenkunde' && (sub.id === 'all' || matchesSortimentSubfilter(q, sub.id)));
            const subOk = correctIdSet(myProg); const subDone = subQs.filter((q: any) => subOk.has(q.id)).length;
            return (
              <button key={sub.id} onClick={() => setSelectedSubfilter(sub.id)} style={{ minHeight: '48px', padding: '0 16px', borderRadius: '999px', border: active ? 'none' : `2px solid ${LT.line}`, backgroundColor: active ? LT.brown : dc('#FFFFFF'), color: active ? dc('#FFF6E0') : LT.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>{sub.label} <span style={{ fontWeight: 400, opacity: 0.8 }}>{subDone}/{subQs.length}</span></button>
            );
          })}
        </div>
      )}
      <button onClick={toggleOnlyNew} role="switch" aria-checked={onlyNew} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '18px', border: `2px solid ${onlyNew ? LT.brown : LT.line}`, backgroundColor: onlyNew ? TH.tintYellow : dc('#FFFFFF'), color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
        <span aria-hidden="true" style={{ flex: '0 0 54px', height: '30px', borderRadius: '999px', backgroundColor: onlyNew ? LT.brown : dc('#D9CBB5'), position: 'relative', transition: 'background-color .2s ease' }}>
          <span style={{ position: 'absolute', top: '3px', left: onlyNew ? '27px' : '3px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), transition: 'left .2s ease' }} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: '18px', fontWeight: 700 }}>Nur neue Fragen</span>
          <span style={{ display: 'block', fontSize: '16px', color: LT.muted }}>{onlyNew ? 'Fragen, die du schon richtig hattest, werden übersprungen.' : 'Alle Fragen kommen dran, auch die, die du schon kannst.'}</span>
        </span>
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { level: 'easy', title: 'Einfach', text: 'zum Einstieg', bg: TH.tintSage },
          { level: 'hard', title: 'Schwer', text: 'zum Knobeln', bg: TH.tintPeach },
          { level: 'mixed', title: 'Gemischt', text: 'bunt gemischt', bg: TH.tintYellow }
        ].map(l => {
          const left = quizPool(l.level, onlyNew).length;
          const done = onlyNew && left === 0;
          return (
            <button key={l.level} onClick={() => launchQuizWithLevel(l.level)} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: done ? dc('#F4EADB') : l.bg, color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ fontFamily: LT.serif, fontSize: '30px' }}>{l.title}</span>
              <span style={{ fontSize: '17px', color: LT.brown }}>{done ? 'Alles gemeistert ✓' : `${Math.min(8, left)} Fragen ${l.text}`}</span>
              {onlyNew && !done && <span style={{ fontSize: '15px', color: LT.muted }}>noch {left} neue</span>}
            </button>
          );
        })}
      </div>
      {(isAdmin || overallPercent >= 50) && <button onClick={() => launchQuizWithLevel('all_at_once')} style={{ ...btnSecondary, alignSelf: 'stretch' }}>{onlyNew ? `Alle neuen Fragen am Stück (${quizPool('all_at_once', true).length})` : 'Alle Fragen dieses Bereichs am Stück'}</button>}
    </div>
  );
}
