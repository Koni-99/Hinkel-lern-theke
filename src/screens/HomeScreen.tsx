// ═══ Startseite ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import type { Badge, OnboardingItem } from '../ui/lernstand';
import type { PinboardMessage, ScoreEntry } from '../types';
import type { Question } from '../daten/questions';
import type { Season } from '../basis/serie';
import { dc } from '../daten/data';
import { CloudPayload } from '../types';
import { getRightAnswerText } from '../hilfen/allgemein';
import { productOfTheDay } from '../games/produktDesTages';
import { SpeakButton } from '../games/spielBasis';
import { BadgeAlbumView } from '../ui/belohnungen';
import { productImageKey, TH, cardStyle, ProductImages } from '../ui/basis';
import { ONBOARDING_DAYS, APP_WEEK_DAYS } from '../ui/lernstand';
import { OSTER_TABS, monthLabel } from '../ui/kalender';
import { LT } from '../basis/marke';
import { LtIcon, ICON, MENU_ICON } from '../basis/symbole';
import { KuekenFact } from '../basis/fakten';
import { BonLine, TEAM_REWARD, weekIdNow, dayKey, streakMultFor, mondayOf, parseBonDate, BON_DIVIDER } from '../basis/serie';
import { nameClassOf } from '../basis/laden';

export type HomeScreenProps = {
  username: string;
  fetchCloudData: (customUrl?: string | undefined) => Promise<CloudPayload | null>;
  todayDayNum: number;
  selectedBakeDay: number;
  setSelectedBakeDay: Dispatch<SetStateAction<number>>;
  setShowBakingCalendar: Dispatch<SetStateAction<boolean>>;
  showBakingCalendar: boolean;
  productImages: ProductImages;
  questions: Question[];
  azubiArea: boolean;
  examAllowed: true;
  isAdmin: boolean;
  team: { week: string; goal: number; points: number; reached: boolean; players: Set<string>; daysLeft: number; lastWeek: string; lastGoal: number; lastPoints: number; lastReached: boolean; lastPlayers: Set<string>; };
  setActiveTab: Dispatch<SetStateAction<string>>;
  setSpickArea: Dispatch<SetStateAction<"produkt" | "fach">>;
  setSpickView: Dispatch<SetStateAction<"dictionary" | undefined>>;
  setShowTipShop: Dispatch<SetStateAction<boolean>>;
  setShowWheel: Dispatch<SetStateAction<boolean>>;
  setCurrentQuizCategory: Dispatch<SetStateAction<string | null>>;
  setSelectedSubfilter: Dispatch<SetStateAction<string>>;
  setSelectedLevel: Dispatch<SetStateAction<string | null>>;
  openLos: () => void;
  weekProduct: string | null;
  weekProductDone: boolean;
  freshProducts: string[];
  launchNewProducts: () => void;
  launchWeekProduct: () => void;
  launchDailyChallenge: () => void;
  seasonNow: Season | null;
  seasonPool: Question[];
  launchSeasonQuiz: () => void;
  heuteDone: boolean;
  launchHeuteDran: () => void;
  bakeImg: (name: string) => string;
  launchPersonalWeaknessQuiz: () => void;
  handleResetMyProgress: () => void;
  setToast: Dispatch<SetStateAction<string>>;
  setAdventPreview: Dispatch<SetStateAction<boolean>>;
  overallPercent: number;
  myRank: { title: string; emoji: string; color: string; bg: string; border: string; min: number; nextAt: number; next: number; };
  myTotalScore: number;
  activePinboard: PinboardMessage | null;
  cloudScores: ScoreEntry[];
  cloudProgress: Record<string, Record<string, any>>;
  cloudLastSeen: Record<string, { displayName: string; time: string; timestamp: number; }>;
  myWrongCount: number;
  fehlerDue: number;
  fullBakingSchedule: any;
  userKeyLower: string;
  greeting: "Hallo" | "Guten Morgen" | "Guten Abend";
  todayLong: string;
  isDailyDone: boolean;
  heroKey: "" | "daily" | "heute" | "fehler" | "nochmal";
  allProgress: { totalAnswered: number; total: number; };
  catPercent: (cat: string) => number;
  myDays: string[];
  streak: { current: number; best: number; learnedToday: boolean; };
  weekDots: { label: string; done: boolean; isToday: boolean; future: boolean; }[];
  nextMilestone: number | null;
  isMeister: boolean;
  meisterLeft: number;
  streakToday: number;
  streakMult: number;
  goLernen: () => void;
  myProg: Record<string, any>;
  reviewYear: number;
  lastChamp: { month: string; key: string; points: number; } | null;
  osterAktiv: boolean;
  osterFound: string[];
  wheelReady: boolean;
  onboarding: { items: (OnboardingItem & { done: boolean; self?: boolean | undefined; })[]; done: number; total: number; };
  onboardingComplete: boolean;
  simpleStart: boolean;
  showFullStart: () => void;
  showErsteWoche: boolean;
  appWeek: { items: (OnboardingItem & { done: boolean; self?: boolean | undefined; })[]; done: number; total: number; };
  showAppWeek: boolean;
  badges: Badge[];
  earnedBadges: Badge[];
  myLevel: { next: { min: number; title: string; icon: string; }; pct: number; toNext: number; min: number; title: string; icon: string; no: number; };
  shownLevel: { next: { min: number; title: string; icon: string; }; pct: number; toNext: number; min: number; title: string; icon: string; no: number; };
  nowMonth: number;
  adventOpenNow: number;
  showAdventCard: boolean;
  masteredNow: number;
};

export function HomeScreen({ username, fetchCloudData, todayDayNum, selectedBakeDay, setSelectedBakeDay, setShowBakingCalendar, showBakingCalendar, productImages, questions, azubiArea, examAllowed, isAdmin, team, setActiveTab, setSpickArea, setSpickView, setShowTipShop, setShowWheel, setCurrentQuizCategory, setSelectedSubfilter, setSelectedLevel, openLos, weekProduct, weekProductDone, freshProducts, launchNewProducts, launchWeekProduct, launchDailyChallenge, seasonNow, seasonPool, launchSeasonQuiz, heuteDone, launchHeuteDran, bakeImg, launchPersonalWeaknessQuiz, handleResetMyProgress, setToast, setAdventPreview, overallPercent, myRank, myTotalScore, activePinboard, cloudScores, cloudProgress, cloudLastSeen, myWrongCount, fehlerDue, fullBakingSchedule, userKeyLower, greeting, todayLong, isDailyDone, heroKey, allProgress, catPercent, myDays, streak, weekDots, nextMilestone, isMeister, meisterLeft, streakToday, streakMult, goLernen, myProg, reviewYear, lastChamp, osterAktiv, osterFound, wheelReady, onboarding, onboardingComplete, simpleStart, showFullStart, showErsteWoche, appWeek, showAppWeek, badges, earnedBadges, myLevel, shownLevel, nowMonth, adventOpenNow, showAdventCard, masteredNow }: HomeScreenProps) {
  return (
    <div className="lt-home" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <section className="lt-home-greet" style={{ display: 'block', marginBottom: '-8px' }}>
        <div>
          <div style={{ fontSize: '18px', color: LT.muted }}>{todayLong}</div>
          <h1 className="lt-h1" style={{ margin: '6px 0 0', fontFamily: LT.serif, fontWeight: 400, lineHeight: 1.05 }}>{greeting}, {myProg._avatar ? <><span className={myLevel.no >= 13 ? 'lt-frame-gold' : myLevel.no >= 9 ? 'lt-frame-silver' : myLevel.no >= 5 ? 'lt-frame-bronze' : undefined} title={myLevel.no >= 5 ? 'Rahmen nach deiner Stufe' : undefined} style={myLevel.no >= 5 ? { width: '1.35em', height: '1.35em' } : undefined}><span className={myProg._effect ? `lt-fx-${String(myProg._effect).replace('fx_', '')}` : 'lt-emo-bob'} style={myLevel.no >= 5 ? { fontSize: '.8em' } : undefined}>{myProg._avatar}</span></span>{' '}</> : ''}<span className={nameClassOf(myProg)}>{username}</span>!</h1>
          {myProg._title && <div style={{ marginTop: '6px', display: 'inline-block', padding: '4px 12px', borderRadius: '999px', backgroundColor: LT.yellow, color: dc('#2B170A'), fontSize: '15px', fontWeight: 700 }}>{myProg._title}</div>}
          {isMeister && <div className="lt-meister-chip" style={{ marginTop: '8px', marginRight: '8px', display: 'inline-block', padding: '4px 12px', borderRadius: '999px', fontSize: '15px', fontWeight: 800 }}>Hinkel-Meister</div>}
          {lastChamp && lastChamp.key === userKeyLower && <div className="lt-deal" style={{ marginTop: '8px', marginLeft: myProg._title ? '8px' : 0, display: 'inline-block', padding: '4px 12px', borderRadius: '999px', backgroundColor: dc('#4B2A14'), color: '#FFE27A', fontSize: '15px', fontWeight: 800 }}>👑 Monatsmeister {monthLabel(lastChamp.month).split(' ')[0]}</div>}
          
        </div>
      </section>
    
      <KuekenFact />
    
      {(() => {
        const pct = Math.min(100, Math.round((team.points / Math.max(1, team.goal)) * 100));
        const mine = team.players.has(userKeyLower);
        return (
          <section aria-labelledby="lt-team-h" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', borderRadius: '22px', backgroundColor: team.reached ? dc('#E3F4EA') : dc('#FFFFFF'), border: `2px solid ${team.reached ? dc('#1F7A4D') : LT.line}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <h2 id="lt-team-h" style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '26px' }}>🤝 Team-Challenge</h2>
              <span style={{ fontSize: '15px', color: LT.muted, fontWeight: 700 }}>{team.reached ? 'Geschafft!' : team.daysLeft === 1 ? 'Noch heute' : `Noch ${team.daysLeft} Tage`}</span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', color: LT.brown, lineHeight: 1.45 }}>
              {team.reached
                ? `Das Team hat diese Woche ${team.points.toLocaleString('de-DE')} Punkte gesammelt. Alle, die mitgespielt haben, bekommen ${TEAM_REWARD} Extra-Punkte.`
                : `Sammelt diese Woche gemeinsam ${team.goal.toLocaleString('de-DE')} Punkte. Alle, die mitspielen, bekommen ${TEAM_REWARD} Extra-Punkte.`}
            </p>
            <div role="progressbar" aria-label="Fortschritt Team-Challenge" aria-valuemin={0} aria-valuemax={team.goal} aria-valuenow={Math.min(team.points, team.goal)} style={{ height: '16px', borderRadius: '999px', backgroundColor: dc('#F1E3C8'), overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', backgroundColor: team.reached ? dc('#1F7A4D') : LT.yellow, transition: 'width .6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', fontSize: '15px', fontVariantNumeric: 'tabular-nums' }}>
              <span><strong>{team.points.toLocaleString('de-DE')}</strong> von {team.goal.toLocaleString('de-DE')} Punkten · {team.players.size} {team.players.size === 1 ? 'Person spielt' : 'Personen spielen'} mit</span>
              {!isAdmin && <span style={{ color: mine ? dc('#1F7A4D') : LT.muted, fontWeight: 700 }}>{mine ? '✓ Du bist dabei' : 'Spiel eine Runde, dann bist du dabei'}</span>}
            </div>
            {team.lastPoints > 0 && <div style={{ fontSize: '14px', color: LT.muted }}>Letzte Woche: {team.lastPoints.toLocaleString('de-DE')} von {team.lastGoal.toLocaleString('de-DE')} Punkten {team.lastReached ? '✓ geschafft' : ''}</div>}
          </section>
        );
      })()}
    
      {(() => {
        const pd = productOfTheDay(productImages);
        if (!pd) return null;
        const img = productImages[productImageKey(pd.name)] || '';
        const line = String(pd.description || pd.shortIngredients || '').split(/(?<=[.!?])\s/)[0];
        return (
          <button className={heroKey ? 'lt-pod' : 'lt-pod lt-pod-solo'} onClick={() => { setSpickArea('produkt'); setSpickView(undefined); setActiveTab('flashcards'); }} aria-label={`Produkt des Tages: ${pd.name}. Steckbrief öffnen`}>
            {img ? <><img className="lt-pod-blur lt-loaded" src={img} alt="" aria-hidden="true" /><img className="lt-pod-img lt-loaded" src={img} alt={pd.name} /></> : <span className="lt-pod-bread" aria-hidden="true"><LtIcon paths={ICON.bread} size={220} width={1.2} /></span>}
            <span className="lt-pod-shade" aria-hidden="true" style={img ? undefined : { background: 'linear-gradient(180deg,rgba(20,10,4,.05) 20%,rgba(20,10,4,.7) 100%)' }} />
            <span className="lt-pod-tag">PRODUKT DES TAGES</span>
            <span className="lt-pod-txt" style={img ? undefined : { right: '20px' }}><b>{pd.name}</b>{line && <span>{line}</span>}</span>
          </button>
        );
      })()}
    
      {heroKey && (() => {
        const hero = heroKey === 'heute' ? { title: 'Weiter lernen', sub: '8 Fragen, genau für dich', time: 'ca. 5 Min.', cta: 'Los geht’s', n: 8, action: launchHeuteDran }
          : heroKey === 'fehler' ? { title: 'Fehler-Stapel üben', sub: `${fehlerDue} ${fehlerDue === 1 ? 'Frage ist' : 'Fragen sind'} wieder dran`, time: 'ca. 3 Min.', cta: 'Jetzt üben', n: Math.max(1, Math.min(10, fehlerDue)), action: () => { setActiveTab('quiz'); launchPersonalWeaknessQuiz(); } }
          : heroKey === 'daily' ? { title: 'Tages-Challenge', sub: '5 Fragen mit Extra-Punkten', time: 'ca. 2 Min.', cta: 'Starten', n: 5, action: () => { setActiveTab('quiz'); launchDailyChallenge(); } }
          : { title: 'Heute alles geschafft', sub: 'Noch eine Runde mit 8 Fragen?', time: 'ca. 5 Min.', cta: 'Noch eine Runde', n: 8, action: launchHeuteDran };
        return (
          <div className="lt-hero-wrap" style={{ position: 'relative' }}>
          <button onClick={hero.action} className="lt-hero-cta" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px', width: '100%', padding: '22px 20px 20px', borderRadius: '26px', border: 'none', backgroundColor: LT.brown, backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1.4px), radial-gradient(ellipse 80% 60% at 100% 0, rgba(255,199,44,.18), rgba(255,199,44,0) 60%)', backgroundSize: '6px 6px, auto', color: dc('#FFF6E0'), textAlign: 'left', cursor: 'pointer', boxShadow: '0 18px 32px -16px rgba(75,42,20,.7)' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.12em', color: LT.yellow }}>HEUTE DRAN</span>
            <span style={{ fontFamily: LT.serif, fontSize: '32px', lineHeight: 1.05, paddingRight: '70px' }}>{hero.title}</span>
            <span style={{ fontSize: '16px', lineHeight: 1.4, color: dc('#F0D9AE'), marginTop: '-4px' }}>{hero.sub}</span>
            <span aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: `repeat(${hero.n}, minmax(0, 1fr))`, gap: '5px' }}>{Array.from({ length: hero.n }, (_, i) => <span key={i} style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255,246,224,.22)' }} />)}</span>
            <span className="lt-cta-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minHeight: '58px', padding: '0 20px', borderRadius: '16px', backgroundColor: LT.yellow, color: dc('#2B170A'), boxShadow: '0 5px 0 #B98A0A', fontFamily: LT.serif, fontSize: '22px' }}>
              <span>{hero.cta}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', fontSize: '15px', fontWeight: 700 }}><span style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{hero.time}</span><LtIcon paths={['M5 12h14', 'm13 6 6 6-6 6']} size={22} width={2.6} /></span>
            </span>
          </button>
        </div>
        );
      })()}
    
      {/* Backkalender direkt unter „Weiter lernen“ */}
      {/* Backkalender */}
      <section className="lt-bake" style={{ backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', borderRadius: '22px', overflow: 'hidden' }}>
        <button onClick={() => setShowBakingCalendar(!showBakingCalendar)} aria-expanded={showBakingCalendar} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '70px', padding: '12px 18px', border: 'none', background: 'transparent', color: LT.ink, cursor: 'pointer', textAlign: 'left' }}>
          <span aria-hidden="true" style={{ flex: '0 0 42px', height: '42px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.calendar} size={22} width={1.9} /></span>
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', fontFamily: LT.serif, fontSize: '22px', lineHeight: 1.1 }}>Backkalender</span><span style={{ display: 'block', fontSize: '14px', color: LT.muted, marginTop: '2px' }}>{selectedBakeDay === todayDayNum ? 'Heute, ' : ''}{fullBakingSchedule[selectedBakeDay]?.dayName}{new Date().getDay() === 0 && selectedBakeDay === 1 ? ' (sonntags geschlossen)' : ''} · {(fullBakingSchedule[selectedBakeDay]?.items || []).length} Sachen im Ofen</span></span>
          <span aria-hidden="true" style={{ display: 'flex', color: LT.muted, transform: showBakingCalendar ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .25s ease' }}><LtIcon paths={ICON.chevron} size={22} width={2.4} /></span>
        </button>
        {showBakingCalendar && (
          <div style={{ padding: '0 18px 18px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5, 6].map(dayNum => (
                <button key={dayNum} onClick={() => setSelectedBakeDay(dayNum)} style={{ flex: '1 1 46px', minHeight: '44px', backgroundColor: selectedBakeDay === dayNum ? '#1F140C' : '#F6EFE2', color: selectedBakeDay === dayNum ? '#FFD86B' : LT.ink, border: 'none', boxShadow: todayDayNum === dayNum ? 'inset 0 0 0 2.5px #FFC72C' : 'none', borderRadius: '999px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', transition: 'background-color .2s' }}>
                  {fullBakingSchedule[dayNum].short}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {(fullBakingSchedule[selectedBakeDay]?.items || []).map((item: any, idx: number) => (
                <div key={idx} className="lt-bake-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FBF6EC', padding: '8px 12px 8px 8px', borderRadius: '14px', animationDelay: `${Math.min(idx, 10) * 0.04}s` }}>
                  {(() => { const img = bakeImg(String(item.name || '')); return img
                    ? <img src={img} alt="" loading="lazy" className="lt-loaded" style={{ flex: '0 0 56px', width: '56px', height: '56px', objectFit: 'cover', borderRadius: '12px', backgroundColor: dc('#FFFFFF') }} />
                    : <span aria-hidden="true" style={{ flex: '0 0 56px', height: '56px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.bread} size={26} width={1.8} /></span>; })()}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '17px' }}>{item.name}</strong>
                      <span style={{ fontSize: '13px', backgroundColor: '#FFFFFF', color: '#7A4A00', padding: '2px 9px', borderRadius: '999px', fontWeight: 800 }}>{item.type}</span>
                    </div>
                    {item.info && <div style={{ fontSize: '15px', color: LT.muted, marginTop: '4px' }}>{item.info}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    
      {(() => {
        const today = dayKey(new Date());
        const others = Object.entries(cloudProgress || {}).filter(([k, pr]: [string, any]) => k !== 'admin' && k !== userKeyLower && pr && Array.isArray(pr._days) && pr._days.includes(today)).map(([k, pr]: [string, any]) => String(cloudLastSeen[k]?.displayName || pr._displayName || k));
        if (!others.length) return null;
        const cols = [['#FCE1D2', '#9A3412'], ['#E1EEDC', '#2F5D3A'], ['#DDE6F7', '#2F4F8A']];
        const ini = (n: string) => n.trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
        const shown = others.slice(0, 2);
        const rest = others.length - shown.length;
        const text = others.length === 1 ? <><strong>{others[0]}</strong> hat heute schon gelernt.</> : others.length === 2 ? <><strong>{others[0]} und {others[1]}</strong> haben heute schon gelernt.</> : <><strong>{others[0]}, {others[1]} und {rest} weitere</strong> haben heute schon gelernt.</>;
        return (
          <section className="lt-team" aria-label="Wer heute schon gelernt hat">
            <span className="lt-team-av" aria-hidden="true">
              {shown.map((n, i) => <span key={n + i} style={{ backgroundColor: cols[i][0], color: cols[i][1], animationDelay: `${0.1 + i * 0.12}s` }}>{ini(n)}</span>)}
              {rest > 0 && <span style={{ backgroundColor: cols[2][0], color: cols[2][1], animationDelay: '.34s' }}>+{rest}</span>}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{text}</span>
          </section>
        );
      })()}
    
    
      {(() => {
        const today = dayKey(new Date());
        const sp = Object.entries(cloudProgress).map(([k, pr]: [string, any]) => ({ k, pr })).filter(({ pr }) => pr && pr._spruch && pr._spruch.status === 'ok' && pr._spruch.day === today).sort((a, b) => (b.pr._spruch.okTs || 0) - (a.pr._spruch.okTs || 0))[0];
        if (!sp) return null;
        const who = cloudLastSeen[sp.k]?.displayName || sp.pr._displayName || sp.k;
        return (
          <section className="lt-spruch" style={{ position: 'relative', overflow: 'hidden', padding: '18px 22px', borderRadius: '22px', background: 'linear-gradient(135deg,#2B170A,#5A3519)', color: '#FFF6E0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="lt-emo-bob" style={{ fontSize: '40px' }} aria-hidden="true">💬</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#FFE27A' }}>Spruch des Tages von {who}</span>
              <span style={{ display: 'block', fontFamily: LT.serif, fontSize: '26px', lineHeight: 1.2, marginTop: '4px' }}>„{sp.pr._spruch.text}“</span>
            </span>
            <span className="lt-emo-twinkle" style={{ fontSize: '26px' }} aria-hidden="true">💎</span>
          </section>
        );
      })()}
      {/* Heute für dich: kompakte Kacheln */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '30px' }}>Heute für dich</h2>
        {(() => { const menuItems = [
            { show: true, key: 'daily', prog: isDailyDone ? 1 : 0, icon: '☀️', anim: 'lt-emo-spin2', title: 'Tages-Challenge', sub: isDailyDone ? 'Heute erledigt ✓' : '5 Fragen, Extra-Punkte', bg: isDailyDone ? dc('#F4EADB') : LT.yellow, dot: !isDailyDone, action: () => { if (!isDailyDone) { setActiveTab('quiz'); launchDailyChallenge(); } } },
            { show: !isAdmin, key: 'heute', prog: heuteDone ? 1 : 0, icon: '🗓️', anim: heuteDone ? '' : 'lt-emo-bob', title: 'Heute dran', sub: heuteDone ? 'Heute erledigt ✓, gern nochmal' : '8 Fragen, genau für dich, ca. 5 Minuten', bg: heuteDone ? dc('#F4EADB') : TH.tintBlue, dot: !heuteDone, action: launchHeuteDran },
            { show: !isAdmin && fehlerDue > 0, key: 'fehler', icon: '🔁', anim: 'lt-emo-spin2', title: 'Fehler-Stapel', sub: `${fehlerDue} ${fehlerDue === 1 ? 'Frage' : 'Fragen'} fällig`, bg: TH.tintPeach, dot: true, action: () => { setActiveTab('quiz'); launchPersonalWeaknessQuiz(); } },
            { show: !isAdmin, key: 'los', icon: '🎫', anim: '', title: 'Rubbellos', sub: (Number(myProg._jokersLos) || 0) > 0 ? `${Number(myProg._jokersLos)} ${Number(myProg._jokersLos) === 1 ? 'Los' : 'Lose'} bereit, jetzt rubbeln!` : 'Noch kein Los. Gibt es im Trinkgeld-Laden unter Joker.', bg: dc('#FFF0C2'), dot: (Number(myProg._jokersLos) || 0) > 0, action: () => { if ((Number(myProg._jokersLos) || 0) > 0) openLos(); else setShowTipShop(true); } },
            { show: !isAdmin, key: 'rad', icon: '🎡', anim: wheelReady ? 'lt-emo-spin2' : '', title: 'Glücksrad', sub: wheelReady ? 'Jetzt drehen!' : (Number(myProg._jokersSpin) || 0) > 0 ? 'Extra-Dreh bereit' : 'Wieder ab Montag', bg: wheelReady ? TH.tintSage : dc('#F4EADB'), dot: wheelReady, action: () => setShowWheel(true) },
            { show: freshProducts.length > 0 && !isAdmin, key: 'neu', icon: '🆕', anim: 'lt-emo-twinkle', title: 'Neu im Sortiment', sub: freshProducts.length === 1 ? `${freshProducts[0]}: jetzt kennenlernen` : `${freshProducts.slice(0, 2).join(', ')}${freshProducts.length > 2 ? ' und mehr' : ''}: jetzt kennenlernen`, bg: dc('#E1EEDC'), dot: true, action: launchNewProducts },
            { show: !!weekProduct && !isAdmin, key: 'woche', prog: weekProductDone ? 1 : 0, icon: '🏆', anim: 'lt-emo-twinkle', title: 'Produkt der Woche', sub: weekProductDone ? 'Diese Woche geschafft ✓' : `${weekProduct}, doppelte Punkte`, bg: weekProductDone ? dc('#F4EADB') : dc('#FFF0C2'), dot: !weekProductDone, action: launchWeekProduct },
            { show: !!seasonNow && seasonPool.length >= 4, key: 'saison', icon: seasonNow ? seasonNow.deco[0] : '🍂', anim: 'lt-sway', title: seasonNow ? seasonNow.title : 'Saison', sub: 'Saison-Quiz, Extra-Punkte', bg: seasonNow ? seasonNow.tint : TH.cream, dot: false, action: launchSeasonQuiz },
            { show: !isAdmin && reviewYear > 0, key: 'jahr', icon: '🎁', anim: 'lt-emo-bob', title: `Dein Jahr ${reviewYear}`, sub: 'Dein persönlicher Jahresrückblick', bg: dc('#FFF0C2'), dot: true, action: () => { setActiveTab('jahr'); window.scrollTo(0, 0); } },
            { show: showAdventCard, key: 'advent', icon: '🎄', anim: 'lt-emo-bob', title: 'Adventskalender', sub: nowMonth === 10 ? 'Ab 1. Dezember' : adventOpenNow > 0 ? `${adventOpenNow} Türchen offen` : 'Bis morgen!', bg: dc('#F4EADB'), dot: nowMonth !== 10 && adventOpenNow > 0, action: () => { setAdventPreview(false); setActiveTab('advent'); } },
            { show: osterAktiv, key: 'ostern', prog: OSTER_TABS.length ? osterFound.length / OSTER_TABS.length : 0, icon: '🐣', anim: 'lt-emo-bob', title: 'Ostereiersuche', sub: osterFound.length >= OSTER_TABS.length ? 'Alle Eier gefunden ✓' : `${osterFound.length} von ${OSTER_TABS.length} Eiern, sie sind in der App versteckt`, bg: dc('#FCE4F0'), dot: osterFound.length < OSTER_TABS.length, action: () => setToast(osterFound.length >= OSTER_TABS.length ? '🐣 Super, du hast alle Eier gefunden!' : `🥚 Noch ${OSTER_TABS.length - osterFound.length} Eier versteckt. Schau auf allen Seiten genau hin!`) },
          ].filter(t => t.show && t.key !== heroKey && (!simpleStart || ['daily', 'heute', 'rad', 'fakt'].includes(t.key)));
          const priceOf = (t: any): string => {
            if (t.prog === 1) return '✓';
            switch (t.key) {
              case 'daily': return 'Extra-P.';
              case 'heute': return '5 Min.';
              case 'fehler': return `${fehlerDue}`;
              case 'los': return (Number(myProg._jokersLos) || 0) > 0 ? `${Number(myProg._jokersLos)} ×` : 'Laden';
              case 'rad': return wheelReady || (Number(myProg._jokersSpin) || 0) > 0 ? 'Drehen' : 'Mo.';
              case 'neu': return 'Neu';
              case 'woche': return '×2 P.';
              case 'saison': return 'Extra-P.';
              case 'ostern': return `${osterFound.length}/${OSTER_TABS.length}`;
              case 'advent': return adventOpenNow > 0 ? `${adventOpenNow}` : '…';
              default: return '›';
            }
          };
          return (
            <>
              <div className="lt-menu lt-tiles">
                <div className="lt-rc-mono" aria-hidden="true" style={{ textAlign: 'center', fontSize: '13px', letterSpacing: '3px', color: LT.muted, padding: '4px 0 6px' }}>~ TAGESKARTE ~</div>
                {menuItems.filter(t => t.key !== 'fakt').map(t => (
                  <button key={t.key} onClick={t.action} className="lt-menu-row lt-tile">
                    <span className="lt-gold-tile" style={{ flex: '0 0 auto', width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={MENU_ICON[t.key] || ICON.leaf} size={22} width={1.9} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 800, fontSize: '17px', lineHeight: 1.2 }}>{t.title}</span>
                        <span className="lt-menu-lead" aria-hidden="true" />
                        <span style={{ fontWeight: 800, fontSize: '16px', whiteSpace: 'nowrap', color: (t as any).prog === 1 ? TH.green : LT.brown, marginRight: t.dot ? '22px' : 0 }}>{priceOf(t)}</span>
                      </span>
                      <span style={{ display: 'block', fontSize: '15px', color: LT.muted, lineHeight: 1.35, marginTop: '2px' }}>{t.sub}</span>
                    </span>
                    {t.dot && <span className="lt-dot-pulse" aria-hidden="true" style={{ position: 'absolute', top: '19px', right: '12px', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#D92D20' }} />}
                  </button>
                ))}
              </div>
              {(() => {
                // Knifflige Frage der Woche: im Team am häufigsten falsch (ohne Namen)
                const tally: Record<string, number> = {};
                Object.entries(cloudProgress || {}).forEach(([k, pr]: [string, any]) => { if (k === 'admin' || !pr || !pr.wrongStats) return; Object.entries(pr.wrongStats).forEach(([qid, n]) => { tally[qid] = (tally[qid] || 0) + (Number(n) > 0 ? 1 : 0); }); });
                const top = Object.entries(tally).filter(([, n]) => n >= 2).sort((x, y) => y[1] - x[1]).slice(0, 5);
                if (!top.length) return null;
                const seed = weekIdNow().split('-').reduce((acc, x) => acc * 31 + Number(x), 7);
                const [qid, cnt] = top[seed % top.length];
                const q: any = questions.find((x: any) => String(x.id) === qid);
                if (!q) return null;
                return (
                  <details className="lt-card lt-tile" style={{ backgroundColor: dc('#FFF4F0'), border: `2px solid ${dc('#F3C9BC')}`, borderRadius: '18px', padding: '14px 16px' }}>
                    <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: TH.red }}>🧩 Knifflige Frage der Woche</div>
                      <div style={{ fontWeight: 700, fontSize: '17px', marginTop: '4px', lineHeight: 1.4 }}>{q.question}</div>
                      <div style={{ fontSize: '14px', color: LT.muted, marginTop: '4px' }}>{cnt} aus dem Team hatten sie schon mal falsch · Tippen für die Antwort</div>
                    </summary>
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px dashed ${dc('#F3C9BC')}`, fontSize: '16px', lineHeight: 1.45 }}>
                      <div style={{ color: TH.green }}>Richtig: <strong>{getRightAnswerText(q)}</strong></div>
                      {q.explanation && <div style={{ color: LT.muted, marginTop: '4px' }}>{q.explanation}</div>}
                    </div>
                  </details>
                );
              })()}
            </>
          );
        })()}
        {simpleStart && <button onClick={showFullStart} style={{ alignSelf: 'flex-start', minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: `2px solid ${LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.brown, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>Deine erste Woche: wir zeigen dir erst das Wichtigste. Alles anzeigen ›</button>}
      </section>
    
      {/* Brotkorb wie im Prototyp, darunter die Ausbilder-Tafel */}
      {!isAdmin && (() => {
        const n = Math.floor(masteredNow / 10);
        const rest = 10 - (masteredNow % 10);
        const breads = [
          { d: 'M22 26a12 9 0 1 0 24 0a12 9 0 1 0-24 0z', c: '#B9773A' },
          { d: 'M48 24a14 11 0 1 0 28 0a14 11 0 1 0-28 0z', c: '#D9A066' },
          { d: 'M36 30c2-12 22-12 24 0z', c: '#8A4F22' },
          { d: 'M64 30a10 7 0 1 0 20 0a10 7 0 1 0-20 0z', c: '#C98345' },
          { d: 'M14 32a9 6 0 1 0 18 0a9 6 0 1 0-18 0z', c: '#E7B271' },
        ].slice(0, Math.min(5, n));
        return (
          <section className="lt-basket" aria-label="Dein Brotkorb">
            <svg width="104" height="64" viewBox="0 0 104 64" aria-hidden="true" style={{ flex: '0 0 auto', overflow: 'visible' }}>
              {breads.map((b, i) => <path key={i} className="lt-bread" d={b.d} fill={b.c} style={{ animationDelay: `${0.25 + i * 0.18}s` }} />)}
              <path d="M6 30h92l-8 30a3 3 0 0 1-3 2H17a3 3 0 0 1-3-2z" fill="#C88A4A" />
              <path d="M6 30h92" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
              <path d="M18 38l4 20M32 38l2 20M46 38v20M60 38v20M74 38l-2 20M88 38l-4 20M12 46h80" stroke="#A26A33" strokeWidth="2.4" />
            </svg>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>Dein Brotkorb</b>
              <span>{n === 0 ? `Noch leer. Nach ${rest} gemeisterten ${rest === 1 ? 'Frage' : 'Fragen'} kommt das erste Gebäck rein.` : `${n} Gebäck im Korb · noch ${rest} ${rest === 1 ? 'Frage' : 'Fragen'} bis zum nächsten`}</span>
              <span className="lt-basket-lvl"><i style={{ width: `${shownLevel.next ? shownLevel.pct : 100}%` }} /></span>
              <span style={{ fontSize: '13px' }}>Stufe {shownLevel.no} · {shownLevel.title}{shownLevel.next ? ` · noch ${shownLevel.toNext.toLocaleString('de-DE')} P. bis ${shownLevel.next.title}` : ' · höchste Stufe'}</span>
              {isMeister && <span style={{ fontSize: '13px', fontWeight: 800, color: '#8A6A00' }}>Alles gemeistert! Die Meister-Runde wartet unter Lernen.</span>}
              {meisterLeft > 0 && <span style={{ fontSize: '13px', fontWeight: 700, color: '#8A6A00' }}>Noch {meisterLeft} {meisterLeft === 1 ? 'Frage' : 'Fragen'} bis zum Hinkel-Meister</span>}
            </span>
          </section>
        );
      })()}
    
      {activePinboard && activePinboard.text && (
        <section className="lt-board" aria-label="Nachricht von deinem Ausbilder">
          <span className="lt-board-pin" aria-hidden="true" />
          <div className="lt-board-frame">
            <span className="lt-board-ttl">Dein Ausbilder sagt</span>
            {activePinboard.image && <img src={activePinboard.image} alt="Foto vom Ausbilder" className="lt-board-img lt-loaded" />}
            <span className="lt-board-txt">{activePinboard.text}</span>
            <span className="lt-board-sig">– {activePinboard.author}{activePinboard.updatedAt ? <small> · {activePinboard.updatedAt}</small> : null}</span>
            <div className="lt-board-speak"><SpeakButton small text={`Nachricht vom Ausbilder: ${activePinboard.text}`} /></div>
            <span className="lt-board-ledge" aria-hidden="true"><span className="lt-board-sponge" /><span className="lt-board-piece" /></span>
          </div>
        </section>
      )}
    
      {/* Statistik und Lern-Bon, immer sichtbar */}
      {!isAdmin && (() => {
        const qs: Record<string, any> = myProg._qs || {};
        let rr = 0, ww = 0;
        Object.values(qs).forEach((v: any) => { if (Array.isArray(v)) { rr += Number(v[0]) || 0; ww += Number(v[1]) || 0; } });
        const quote = rr + ww > 0 ? Math.round((rr / (rr + ww)) * 100) : 0;
        const mon = mondayOf(new Date());
        const todayK = dayKey(new Date());
        const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((label, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); const k = dayKey(d); return { label, k, pts: 0, today: k === todayK }; });
        const idx = new Map(days.map((d, i) => [d.k, i]));
        const tot: Record<string, number> = {};
        let weekPts = 0;
        cloudScores.forEach(sc => {
          const d = parseBonDate(sc.date); if (!d || d < mon) return;
          const key = (sc.username || '').toLowerCase(); const pts = Number(sc.score) || 0;
          tot[key] = (tot[key] || 0) + pts;
          if (key === userKeyLower) { const i = idx.get(dayKey(d)); if (i !== undefined) days[i].pts += pts; weekPts += pts; }
        });
        const order = Object.keys(tot).filter(k => tot[k] > 0).sort((x, y) => tot[y] - tot[x]);
        const rank = order.indexOf(userKeyLower) + 1;
        const maxPts = Math.max(1, ...days.map(d => d.pts));
        const cats = [['Arbeit & Hygiene', 'Hygiene'], ['Fachwissen', 'Fachwissen'], ['Sortiment & Warenkunde', 'Sortiment'], ['Service & Verkauf', 'Service']].map(([c, l]) => ({ c, l, p: catPercent(c) }));
        const weakest = [...cats].sort((x, y) => x.p - y.p)[0];
        const now = new Date();
        const bonTime = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return (
          <>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '30px' }}>Deine Statistik</h2>
              <div className="lt-st">
                <div className="lt-st-kpis">
                  <div className="lt-st-kpi"><b>{quote}<small style={{ fontSize: '15px' }}>%</small></b><span>richtig beantwortet</span></div>
                  <div className="lt-st-kpi"><b>{streak.current}</b><span>{streak.current === 1 ? 'Tag' : 'Tage'} am Stück</span></div>
                  <div className="lt-st-kpi"><b>{rank > 0 ? `#${rank}` : '–'}</b><span>im Team diese Woche</span></div>
                </div>
                <div className="lt-st-h">Diese Woche <em>{weekPts.toLocaleString('de-DE')} Punkte</em></div>
                <div className="lt-st-week" role="img" aria-label={`Punkte pro Tag: ${days.map(d => `${d.label} ${d.pts}`).join(', ')}`}>
                  {days.map((d, i) => (
                    <div key={d.k}><i className={d.today ? 'today' : d.pts > 0 ? 'on' : ''} style={{ height: `${Math.max(8, Math.round((d.pts / maxPts) * 100))}%`, animationDelay: `${i * 0.05}s` }} /><span style={d.today ? { color: LT.ink } : undefined}>{d.label}</span></div>
                  ))}
                </div>
                <div className="lt-st-h">Deine Bereiche <em>{overallPercent} % gesamt</em></div>
                <div className="lt-st-cats">
                  {cats.map(c => (
                    <div key={c.c} className="lt-st-cat"><span>{c.l}</span><span className="lt-st-bar"><i style={{ width: `${Math.max(2, c.p)}%`, backgroundColor: c === weakest && c.p < 100 ? '#E8401C' : '#FFC72C' }} /></span><b>{c.p}%</b></div>
                  ))}
                </div>
                {weakest && weakest.p < 100 && (
                  <div className="lt-st-tip"><span><b>Tipp:</b> Bei {weakest.l} holst du gerade am meisten raus.</span><button className="lt-st-btn" onClick={() => { setCurrentQuizCategory(weakest.c); setSelectedSubfilter('all'); setSelectedLevel(null); setActiveTab('quiz'); }}>Jetzt üben</button></div>
                )}
                <button className="lt-st-more" onClick={() => setActiveTab('statistik')}>Alle Statistiken ansehen ›</button>
              </div>
            </section>
    
            <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div className="lt-bon" style={{ position: 'relative', width: '100%', maxWidth: '380px', transform: 'rotate(-1.2deg)', filter: 'drop-shadow(0 18px 24px rgba(75,42,20,0.22))' }}>
                <div aria-hidden="true" style={{ height: '14px', backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%), linear-gradient(225deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%)`, backgroundSize: '20px 14px', backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom left' }} />
                <div style={{ position: 'relative', backgroundColor: dc('#FFFFFF'), padding: '20px 22px 24px', fontFamily: "'Courier Prime', 'Courier New', monospace", lineHeight: 1.55, color: LT.ink, fontSize: '15px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.2em', letterSpacing: '2px' }}>BÄCKEREI HINKEL</div>
                  <div style={{ textAlign: 'center', fontSize: '0.8em', letterSpacing: '1px' }}>DÜSSELDORF · SEIT 1891</div>
                  {BON_DIVIDER}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em' }}><span>LERN-BON Nr. {String(masteredNow).padStart(4, '0')}</span><span>{bonTime}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', gap: '8px' }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>AZUBI: {username.toUpperCase()}</span><span>KASSE 1</span></div>
                  {BON_DIVIDER}
                  <BonLine left="Fragen gemeistert" right={`${allProgress.totalAnswered} / ${allProgress.total}`} />
                  <BonLine left="Trefferquote" right={`${quote} %`} />
                  <BonLine left="Punkte diese Woche" right={weekPts.toLocaleString('de-DE')} />
                  <BonLine left="Lerntage gesamt" right={String(myDays.length)} />
                  <BonLine left="Bester Lauf" right={`${streak.best} ${streak.best === 1 ? 'Tag' : 'Tage'}`} />
                  <BonLine left="Fehler-Stapel" right={String(myWrongCount)} />
                  <BonLine left="Abzeichen" right={`${earnedBadges.length} / ${badges.length}`} />
                  {BON_DIVIDER}
                  <BonLine left={`Stufe ${myLevel.no} · ${myLevel.title}`} right={myLevel.next ? `${myLevel.toNext.toLocaleString('de-DE')} bis ${myLevel.no + 1}` : 'MAX'} />
                  <div className="lt-bon-prog" aria-hidden="true"><i style={{ width: `${myLevel.next ? myLevel.pct : 100}%` }} /></div>
                  <BonLine left="Rang" right={myRank.title} />
                  {BON_DIVIDER}
                  <div style={{ fontSize: '1.3em' }}><BonLine left="SUMME" right={`${myTotalScore.toLocaleString('de-DE')} PKT`} strong /></div>
                  {streak.current >= 2 && <span className="lt-bon-stamp" aria-hidden="true">SERIE {streak.current}</span>}
                  <div aria-hidden="true" style={{ height: '40px', margin: '12px auto 0', width: '80%', backgroundImage: `repeating-linear-gradient(90deg, ${LT.ink} 0px, ${LT.ink} 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 5px, ${LT.ink} 5px, ${LT.ink} 6px, rgba(0,0,0,0) 6px, rgba(0,0,0,0) 10px)` }} />
                  <div style={{ textAlign: 'center', fontSize: '0.85em', marginTop: '8px' }}>VIELEN DANK · BIS MORGEN!</div>
                </div>
                <div aria-hidden="true" style={{ height: '14px', backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%), linear-gradient(-45deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%)`, backgroundSize: '20px 14px', backgroundRepeat: 'repeat-x', transform: 'rotate(180deg)' }} />
              </div>
              <button onClick={() => { setActiveTab('scoreboard'); fetchCloudData(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '50px', padding: '0 22px', borderRadius: '999px', border: 'none', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '17px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px -12px rgba(31,20,12,.7)' }}><LtIcon paths={ICON.trophy} size={20} width={2} />Zur Bestenliste</button>
            </section>
          </>
        );
      })()}
    
      {/* Einarbeitung „Meine erste Woche“ */}
      {showErsteWoche && (
        <button onClick={() => setActiveTab('einarbeitung')} className="lt-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', padding: '22px 26px', borderRadius: '26px', border: 'none', backgroundColor: TH.tintBlue, color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ flex: '0 0 64px', height: '64px', borderRadius: '20px', backgroundColor: '#1F140C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }}><span style={{ color: '#FFD86B', display: 'flex' }} aria-hidden="true"><LtIcon paths={ICON.checklist} size={30} width={1.9} /></span></span>
          <span style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.05 }}>Meine erste Woche bei Hinkel</span>
            <span style={{ fontSize: '17px', color: LT.brown }}>{onboardingComplete ? 'Alles geschafft, hol dir deinen Theken-Führerschein!' : `Tag ${(ONBOARDING_DAYS.find(d => d.ids.some(id => !onboarding.items.find(i => i.id === id)?.done)) || ONBOARDING_DAYS[4]).no} von 5 · ${onboarding.done} von ${onboarding.total} Schritten geschafft`}</span>
            <span style={{ height: '10px', backgroundColor: dc('#FFFFFF'), borderRadius: '999px', overflow: 'hidden' }}><span className="lt-fill" style={{ display: 'block', width: `${Math.round((onboarding.done / onboarding.total) * 100)}%`, height: '100%', backgroundColor: dc('#2F4F8A'), borderRadius: '999px', animationDelay: '.2s' }} /></span>
          </span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: dc('#2F4F8A') }}>Öffnen ›</span>
        </button>
      )}
      {showAppWeek && (
        <button onClick={() => setActiveTab('appwoche')} className="lt-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', padding: '22px 26px', borderRadius: '26px', border: 'none', backgroundColor: TH.tintSage, color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ flex: '0 0 64px', height: '64px', borderRadius: '20px', backgroundColor: '#1F140C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }}><span style={{ color: '#FFD86B', display: 'flex' }} aria-hidden="true"><LtIcon paths={ICON.phone} size={30} width={1.9} /></span></span>
          <span style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.05 }}>Meine erste Woche mit der App</span>
            <span style={{ fontSize: '17px', color: LT.brown }}>{`Tag ${(APP_WEEK_DAYS.find(d => d.ids.some(id => !appWeek.items.find(i => i.id === id)?.done)) || APP_WEEK_DAYS[3]).no} von 4 · ${appWeek.done} von ${appWeek.total} Schritten geschafft, lerne die App in Ruhe kennen`}</span>
            <span style={{ height: '10px', backgroundColor: dc('#FFFFFF'), borderRadius: '999px', overflow: 'hidden' }}><span className="lt-fill" style={{ display: 'block', width: `${Math.round((appWeek.done / appWeek.total) * 100)}%`, height: '100%', backgroundColor: dc('#2F5D3A'), borderRadius: '999px', animationDelay: '.2s' }} /></span>
          </span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: dc('#2F5D3A') }}>Öffnen ›</span>
        </button>
      )}
    
      {/* Drei Hauptkarten */}
      <div className="lt-maincards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {[
          { title: 'Lernen', desc: `Quiz in vier Bereichen${examAllowed ? ', Prüfungssimulation' : ''} und dein Fehler-Stapel (${myWrongCount} ${myWrongCount === 1 ? 'Frage' : 'Fragen'}).`, short: `Quiz${examAllowed ? ', Prüfungen' : ''} & Fehler-Stapel (${myWrongCount})`, button: 'Quiz starten', bg: dc('#FFF0C2'), accent: LT.brown, icon: ICON.book, action: goLernen },
          { title: 'Spielen', desc: 'Theken-Simulator, Bilderquiz, Allergene-Training, Quiz Battle und mehr.', short: `${10 + (showAdventCard ? 1 : 0)} Spiele für die Theke`, button: 'Spiel aussuchen', bg: dc('#FCE1D2'), accent: dc('#9A3412'), icon: ICON.game, action: () => setActiveTab('spielen') },
          { title: 'Nachschlagen', desc: 'Spickzettel mit allen Produkten, Zutaten und Allergenen, und der Saisonkalender.', short: 'Spickzettel & Saisonkalender', button: 'Nachschlagen', bg: dc('#E1EEDC'), accent: dc('#2F5D3A'), icon: ICON.search, action: () => setActiveTab('nachschlagen') },
          ...(azubiArea ? [{ title: 'Ausbildung', desc: 'Ausbildungsplan zum Abhaken, Berichtsheft-Hilfe und die Prüfungen.', short: 'Plan, Berichtsheft & Prüfungen', button: 'Zur Ausbildung', bg: dc('#DDE6F7'), accent: dc('#2F4F8A'), icon: ICON.cap, action: () => setActiveTab('ausbildung') }] : [])
        ].filter(card => !simpleStart || card.title === 'Lernen' || card.title === 'Ausbildung').map(card => (
          <button key={card.title} onClick={card.action} className={card.title === 'Ausbildung' ? 'lt-card lt-maincard' : 'lt-card lt-maincard lt-dupnav'} style={{ display: 'flex', gap: '14px', padding: '28px', borderRadius: '26px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
            <span className="lt-mc-icon" style={{ width: '70px', height: '70px', borderRadius: '20px', backgroundColor: '#1F140C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }}>
              <span style={{ color: '#FFD86B', display: 'flex' }} aria-hidden="true"><LtIcon paths={card.icon} size={32} width={1.9} /></span>
            </span>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="lt-mc-title" style={{ fontFamily: LT.serif, fontSize: '38px', lineHeight: 1 }}>{card.title}</span>
              <span className="lt-hide-mobile" style={{ fontSize: '18px', lineHeight: 1.45, color: LT.brown }}>{card.desc}</span>
              <span className="lt-only-mobile" style={{ fontSize: '17px', color: LT.brown }}>{card.short}</span>
            </span>
            <span className="lt-hide-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '56px', borderRadius: '16px', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '18px', fontWeight: 700, marginTop: '6px' }}>{card.button}</span>
            <span className="lt-only-mobile"><LtIcon paths={ICON.chevron} color={LT.brown} width={2.4} /></span>
          </button>
        ))}
      </div>
    
    
      <details className="lt-fold" style={{ ...cardStyle, padding: '0' }}>
        <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 22px', minHeight: '60px' }}>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: LT.serif, fontSize: '26px', lineHeight: 1.1 }}>Dein Fortschritt</span>
            <span style={{ display: 'block', fontSize: '15px', color: LT.muted }}>{isAdmin ? 'Lern-Bon und Übersicht' : `${streak.current} ${streak.current === 1 ? 'Tag' : 'Tage'} Serie · ${earnedBadges.length} von ${badges.length} Abzeichen`}</span>
          </span>
          <span className="lt-fold-arrow" aria-hidden="true" style={{ fontSize: '20px' }}>▾</span>
        </summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '0 16px 18px' }}>
      {!isAdmin && <button onClick={() => setActiveTab('statistik')} className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '20px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}><span aria-hidden="true" style={{ flex: '0 0 44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={['M3 3v18h18', 'M7 15l4-4 3 3 5-6']} size={24} /></span><span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 800, fontSize: '18px' }}>Meine Statistik</span><span style={{ display: 'block', fontSize: '15px', color: LT.brown }}>Stärken, Schwächen und deine letzten 14 Tage</span></span><span aria-hidden="true" style={{ fontSize: '22px' }}>›</span></button>}
      <button onClick={() => setActiveTab('hilfe')} className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '20px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}><span aria-hidden="true" style={{ flex: '0 0 44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={['M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18z', 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7', 'M12 17h.01']} size={24} /></span><span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 800, fontSize: '18px' }}>So funktioniert die Lern-Theke</span><span style={{ display: 'block', fontSize: '15px', color: LT.brown }}>Punkte, Stufen, Trinkgeld, Joker und Abzeichen erklärt</span></span><span aria-hidden="true" style={{ fontSize: '22px' }}>›</span></button>
      {/* Lern-Serie */}
      {!isAdmin && (
        <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '22px', padding: '22px 24px', borderRadius: '24px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 260px' }}>
            <span style={{ flex: '0 0 60px', height: '60px', borderRadius: '18px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: streak.current > 0 ? 1 : 0.45 }}>
              <span className={streak.current > 0 ? 'lt-emo-flicker' : undefined} title="Deine Serien-Flamme" style={{ display: 'flex' }} aria-hidden="true"><LtIcon paths={ICON.flame} size={30} width={1.9} /></span>
            </span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: LT.muted, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Deine Lern-Serie</div>
              <div style={{ fontFamily: LT.serif, fontSize: '34px', lineHeight: 1.05 }}>{streak.current} {streak.current === 1 ? 'Tag' : 'Tage'} am Stück</div>
              <div style={{ fontSize: '17px', color: LT.brown, marginTop: '2px' }}>
                {streak.learnedToday
                  ? (nextMilestone ? `Heute schon gelernt! Noch ${nextMilestone - streak.current} ${nextMilestone - streak.current === 1 ? 'Tag' : 'Tage'} bis zur ${nextMilestone}-Tage-Serie.` : 'Heute schon gelernt, Wahnsinn!')
                  : streak.current > 0 ? 'Lern heute eine Runde, sonst reißt die Serie.' : 'Starte heute deine Serie, eine Quizfrage reicht.'}
              </div>
              <div className="lt-deal" style={{ display: 'inline-block', marginTop: '8px', padding: '5px 12px', borderRadius: '999px', backgroundColor: streakMult > 1 ? dc('#FFE0B2') : dc('#F4EADB'), fontSize: '15px', fontWeight: 800 }}>Serien-Bonus: ×{streakMult.toFixed(1).replace('.', ',')} auf alle Punkte{streakMult < 1.5 ? ` · morgen ×${Math.min(1.5, streakMultFor(streakToday + 1)).toFixed(1).replace('.', ',')}` : ' · Maximum!'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 280px', minWidth: 0, maxWidth: '100%' }}>
            <div style={{ display: 'flex', gap: '6px', width: '100%' }} aria-label="Lerntage diese Woche">
              {weekDots.map(w => (
                <div key={w.label} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '100%', maxWidth: '38px', aspectRatio: '1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: w.done ? LT.yellow : w.future ? 'transparent' : dc('#F4EADB'), border: w.isToday ? '3px solid #1F140C' : w.future ? `2px dashed ${LT.line}` : '3px solid transparent', boxSizing: 'border-box', fontWeight: 700, fontSize: '16px' }}>
                    {w.done ? '✓' : ''}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: w.isToday ? 700 : 400, color: w.isToday ? LT.ink : LT.muted }}>{w.label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '15px', color: LT.muted, textAlign: 'center' }}>Bester Lauf: {streak.best} {streak.best === 1 ? 'Tag' : 'Tage'}</div>
          </div>
        </section>
      )}
    
      {/* Stempelkarte (kompakt, bei der Lern-Serie) */}
      {!isAdmin && (() => {
        const total = myProg._stampV2 ? (Number(myProg._stamps) || 0) : myDays.length;
        const claimed = myProg._stampV2 ? (Number(myProg._stampClaimed) || 0) : Math.floor(myDays.filter((d: string) => d !== dayKey(new Date())).length / 10);
        const earned = Math.max(0, claimed - (Number(myProg._stampBase) || 0));
        const n = total - claimed * 10 >= 10 ? 10 : total % 10;
        return (
          <section style={{ backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', borderRadius: '20px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '10px' }}><span aria-hidden="true" style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.ticket} size={18} width={1.9} /></span>Stempelkarte</strong>
              <span style={{ fontSize: '14px', color: LT.muted }}>{n >= 10 ? 'Voll! Belohnung wartet 🎉' : `Noch ${10 - n} Lerntage bis +500 Punkte und 3 €`}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px', maxWidth: '420px' }} aria-label={`${n} von 10 Stempeln`}>
              {[...Array(10)].map((_, i) => i < n ? (
                <span key={i} className={`lt-stamp lt-stamp-on${i === n - 1 && myDays.includes(dayKey(new Date())) ? ' lt-stamp-new' : ''}`} style={{ fontSize: '15px', ['--sr' as any]: `${((i * 37) % 40) - 20}deg`, transform: `rotate(${((i * 37) % 40) - 20}deg)` }}>🥨</span>
              ) : i === 9 ? (
                <span key={i} className="lt-stamp" style={{ border: '2px dashed #C9971C', fontSize: '14px' }}>🎁</span>
              ) : (
                <span key={i} className="lt-stamp" style={{ border: `2px dashed ${dc('#D8C4A0')}`, color: dc('#C8B48E'), fontWeight: 700, fontSize: '11px' }}>{i + 1}</span>
              ))}
            </div>
            {earned > 0 && <div style={{ fontSize: '13px', color: LT.muted }}>Volle Karten bisher: {earned} {'★'.repeat(Math.min(earned, 10))}</div>}
          </section>
        );
      })()}
      {/* Abzeichen */}
      {!isAdmin && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '36px' }}>Deine Abzeichen</h2>
            <span style={{ fontSize: '17px', color: LT.muted }}>{earnedBadges.length} von {badges.length} gesammelt</span>
          </div>
          <BadgeAlbumView badges={badges} />
        </section>
      )}
    
      {!isAdmin && (
        <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: `2px dashed ${LT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: LT.muted, maxWidth: '520px' }}>Neu anfangen? Damit löschst du deinen ganzen Lernstand. Das lässt sich nicht rückgängig machen.</span>
          <button onClick={handleResetMyProgress} style={{ minHeight: '44px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${LT.line}`, backgroundColor: 'transparent', color: LT.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>⚠️ Lernstand zurücksetzen</button>
        </div>
      )}
        </div>
      </details>
    
      <div className="lt-foot" aria-hidden="true">DIE BÄCKEREI DER BROTFREUNDE · SEIT 1891</div>
    </div>
  );
}
