// ═══ Einarbeitung „Meine erste Woche“ und App-Woche ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead } from '../ui/basis';
import { ONBOARDING_DAYS, APP_WEEK_DAYS } from '../ui/lernstand';
import { LT } from '../basis/marke';
import type { OnboardingItem } from '../ui/lernstand';

export type EinarbeitungSeiteProps = {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  obDay: number | null;
  setObDay: Dispatch<SetStateAction<number | null>>;
  toggleOnboarding: (id: string, field?: "_onboarding" | "_appWeek") => void;
  onboarding: { items: (OnboardingItem & { done: boolean; self?: boolean | undefined; })[]; done: number; total: number; };
  appWeek: { items: (OnboardingItem & { done: boolean; self?: boolean | undefined; })[]; done: number; total: number; };
  goOnboardingTarget: (go?: string | undefined) => void;
};

export function EinarbeitungSeite({ activeTab, setActiveTab, obDay, setObDay, toggleOnboarding, onboarding, appWeek, goOnboardingTarget }: EinarbeitungSeiteProps) {
  const isApp = activeTab === 'appwoche';
  const wk = isApp ? appWeek : onboarding;
  const DAYS = isApp ? APP_WEEK_DAYS : ONBOARDING_DAYS;
  const wkComplete = wk.done === wk.total;
  const toggleWk = (id: string) => toggleOnboarding(id, isApp ? '_appWeek' : '_onboarding');
  const itemById = (id: string) => wk.items.find(i => i.id === id)!;
  const dayDone = (d: typeof DAYS[number]) => d.ids.every(id => itemById(id)?.done);
  const firstOpen = DAYS.find(d => !dayDone(d)) || DAYS[DAYS.length - 1];
  const day = DAYS.find(d => d.no === obDay) || firstOpen;
  const pct = Math.round((wk.done / wk.total) * 100);
  const R = 34, C = 2 * Math.PI * R;
  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
    <PageHead title={isApp ? 'Meine erste Woche mit der App' : 'Meine erste Woche bei Hinkel'} subtitle={isApp ? 'Lerne die App in Ruhe kennen. Vieles hakt sich beim Ausprobieren von allein ab. Wenn alles erledigt ist, verschwindet diese Liste.' : 'In 5 Tagen fit für die Theke. Vieles hakt sich beim Üben von allein ab, was du schon kannst, hakst du selbst ab.'} onBack={() => setActiveTab('home')} backLabel="Zur Startseite" />
    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', background: `linear-gradient(135deg, ${TH.tintYellow}, ${dc('#FFFFFF')})` }}>
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true" style={{ flex: '0 0 auto' }}>
        <circle cx="44" cy="44" r={R} fill="none" stroke={dc('#F4EADB')} strokeWidth="10" />
        <circle cx="44" cy="44" r={R} fill="none" stroke={wkComplete ? TH.green : LT.yellow} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(pct / 100) * C} ${C}`} transform="rotate(-90 44 44)" style={{ transition: 'stroke-dasharray .6s ease' }} />
        <text x="44" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill={LT.ink}>{pct}%</text>
      </svg>
      <div style={{ flex: '1 1 220px' }}>
        <div style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.1 }}>{wkComplete ? 'Geschafft, willkommen im Team!' : `Tag ${firstOpen.no}: ${firstOpen.title}`}</div>
        <div style={{ fontSize: '17px', color: LT.brown, marginTop: '4px' }}>{wk.done} von {wk.total} Schritten erledigt</div>
      </div>
    </div>

    {/* Tage als Weg */}
    <div style={{ ...cardStyle, padding: '18px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: '10%', right: '10%', top: '27px', height: '4px', backgroundColor: dc('#F4EADB'), borderRadius: '4px' }} />
        {DAYS.map(d => {
          const done = dayDone(d); const on = d.no === day.no;
          return (
            <button key={d.no} onClick={() => setObDay(d.no)} aria-pressed={on} style={{ position: 'relative', flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 0 }}>
              <span style={{ width: '58px', height: '58px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', backgroundColor: done ? TH.green : on ? LT.yellow : dc('#FFFFFF'), border: `3px solid ${done ? TH.green : on ? LT.brown : LT.line}`, boxShadow: on ? '0 6px 16px rgba(75,42,20,.22)' : 'none', transform: on ? 'scale(1.08)' : 'none', transition: 'transform .2s ease' }}>{done ? <span style={{ color: dc('#FFFFFF'), fontWeight: 700 }}>✓</span> : d.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: on ? LT.ink : LT.muted }}>Tag {d.no}</span>
              <span className="lt-hide-mobile" style={{ fontSize: '13px', color: LT.muted, textAlign: 'center', lineHeight: 1.2 }}>{d.title}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Aufgaben des gewählten Tages */}
    <div key={day.no} className="lt-pop-in" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '40px' }} aria-hidden="true">{day.icon}</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: LT.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Tag {day.no} von {DAYS.length}</div>
          <div style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1 }}>{day.title}</div>
        </div>
      </div>
      <div style={{ fontSize: '17px', color: LT.brown }}>{day.text}</div>
      {day.ids.map(id => {
        const it = itemById(id);
        if (!it) return null;
        return (
          <div key={it.id} style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: it.done ? TH.tintSage : LT.cream, border: `2px solid ${it.done ? TH.green : LT.line}`, display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span aria-hidden="true" style={{ flex: '0 0 40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: it.done ? TH.green : dc('#FFFFFF'), border: `2px solid ${it.done ? TH.green : LT.line}`, color: dc('#FFFFFF'), fontWeight: 700, fontSize: '20px' }}>{it.done ? '✓' : ''}</span>
            <div style={{ flex: '1 1 220px' }}>
              <div style={{ fontSize: '19px', fontWeight: 700 }}>{it.title}</div>
              <div style={{ fontSize: '16px', color: LT.muted, marginTop: '2px' }}>{it.desc}{it.self ? ' · selbst abgehakt' : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {it.go && !it.done && <button onClick={() => goOnboardingTarget(it.go)} style={{ ...btnPrimary, minHeight: '48px', fontSize: '16px' }}>{it.go === 'fach' ? 'Lesen ›' : 'Üben ›'}</button>}
              {it.manual && <button onClick={() => toggleWk(it.id)} style={{ ...(it.done ? btnSecondary : btnPrimary), minHeight: '48px', fontSize: '16px' }}>{it.done ? 'Rückgängig' : 'Erledigt ✓'}</button>}
              {!it.manual && !it.done && <button onClick={() => toggleWk(it.id)} style={{ ...btnSecondary, minHeight: '48px', fontSize: '16px' }}>Kann ich schon ✓</button>}
              {!it.manual && it.self && <button onClick={() => toggleWk(it.id)} style={{ ...btnSecondary, minHeight: '48px', fontSize: '16px' }}>Rückgängig</button>}
            </div>
          </div>
        );
      })}
      {day.no < DAYS.length && dayDone(day) && <button onClick={() => setObDay(day.no + 1)} style={{ ...btnPrimary, alignSelf: 'flex-start' }}>Weiter zu Tag {day.no + 1} ›</button>}
    </div>

  </div>
  );
}
