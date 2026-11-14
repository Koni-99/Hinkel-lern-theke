// ═══ Einführung, Hilfe-Seite ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState, ReactNode } from 'react';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead, KUEKEN_IMG } from './basis';
import { LtIcon, ICON } from '../basis/symbole';

const bigIcon = (paths: string[]) => <LtIcon paths={paths} size={72} width={1.6} />;
const boxIcon = (paths: string[]) => <LtIcon paths={paths} size={28} />;

// ───────────────────────── Kurze Einführung für Neue ─────────────────────────
export const INTRO_SLIDES = [
  { icon: '👋', anim: 'lt-emo-shake', title: 'Willkommen in der Lern-Theke!', text: 'Hier lernst du alles, was du an der Theke brauchst: unsere Produkte, Allergene, Beratung und Hygiene. In kleinen Häppchen, wann immer du Zeit hast.', bg: '#FFF0C2' },
  { icon: bigIcon(ICON.home), anim: 'lt-emo-bob', title: 'Wo finde ich was?', text: 'Unten am Handy (am Computer oben) sind die Hauptseiten: Start, Lernen, Spielen, Nachschlagen und die Bestenliste. Oben rechts hinter den drei Strichen ist das Menü: dort findest du deine Statistik, die Ideen-Box, Kundenstimmen, deinen Geburtstag und die Hilfe „So funktioniert die Lern-Theke“.', bg: '#F6E7C8' },
  { icon: '📚', anim: 'lt-emo-bob', title: 'Lernen', text: 'Du beantwortest Fragen und siehst nach jeder Antwort die Erklärung. Was du falsch hattest, kommt in deinen Fehler-Stapel und taucht später noch einmal auf. So bleibt es hängen.', bg: '#DDE6F7' },
  { icon: '🎮', anim: 'lt-dice-idle', title: 'Spielen', text: 'Theken-Simulator, Bilderquiz, Quiz Battle und mehr. Viele Spiele zählen auch fürs Lernen: richtig beantwortet ist richtig beantwortet.', bg: '#E1EEDC' },
  { icon: '⭐', anim: 'lt-emo-twinkle', title: 'Punkte und Stufen', text: 'Für richtige Antworten gibt es Punkte. Damit steigst du Stufe für Stufe auf, vom Neuling bis zur Hinkel-Ikone. In deiner ersten Woche gibt es keine Minuspunkte.', bg: '#FCE1D2' },
  { icon: '🪙', anim: 'lt-coin', title: 'Trinkgeld und Laden', text: 'Trinkgeld bekommst du im Theken-Simulator, jeden Tag fürs Vorbeischauen und am Glücksrad. Oben beim 🪙 öffnest du den Laden und kaufst dir Zeichen, Farben und Joker.', bg: '#FFF0C2' },
  { icon: bigIcon(ICON.users), anim: 'lt-emo-bob', title: 'Gemeinsam im Team', text: 'Die Lern-Theke ist auch für den Austausch da: Kundenfragen und Verkaufstipps teilen, einmal am Tag einen Kollegen loben, bei Umfragen abstimmen und Ideen einreichen. Alles Wichtige dazu steht im Menü unter „So funktioniert die Lern-Theke“.', bg: '#E1EEDC' },
];

export function IntroTour({ name, onDone }: { name: string; onDone: () => void }) {
  const [i, setI] = useState(0);
  const sl = INTRO_SLIDES[i]; const last = i === INTRO_SLIDES.length - 1;
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 106, backgroundColor: 'rgba(43,23,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Kurze Einführung" style={{ width: '100%', maxWidth: '520px', backgroundColor: TH.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
        <div key={'h' + i} className="lt-intro-head" style={{ backgroundColor: sl.bg, padding: '30px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span className={sl.anim} style={{ fontSize: '72px', lineHeight: 1, display: 'inline-block' }} aria-hidden="true">{sl.icon}</span>
        </div>
        <div key={'b' + i} className="lt-intro-body" style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>{i === 0 ? `Hallo ${name}!` : sl.title}</div>
          {i === 0 && <div style={{ fontWeight: 800, fontSize: '18px', color: TH.brown }}>{sl.title}</div>}
          <div style={{ fontSize: '18px', lineHeight: 1.5, color: TH.ink }}>{sl.text}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '6px 0' }} aria-hidden="true">
            {INTRO_SLIDES.map((_, k) => <span key={k} style={{ width: k === i ? '26px' : '10px', height: '10px', borderRadius: '999px', backgroundColor: k === i ? TH.brown : TH.line, transition: 'width .3s' }} />)}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {i > 0 ? <button onClick={() => setI(i - 1)} style={{ ...btnSecondary, flex: '0 0 auto' }}>Zurück</button> : <button onClick={onDone} style={{ ...btnSecondary, flex: '0 0 auto' }}>Überspringen</button>}
            <button autoFocus onClick={() => (last ? onDone() : setI(i + 1))} style={{ ...btnPrimary, flex: 1 }}>{last ? 'Los geht’s! 🚀' : 'Weiter'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Hilfe: So funktioniert die Lern-Theke ─────────────────────────
export function HilfeView({ levels, jokers, onTour, onBack, onInstall }: { levels: { min: number; title: string; icon: string }[]; jokers: { icon: string; label: string; desc?: string }[]; onTour: () => void; onBack: () => void; onInstall: () => void }) {
  const box = (icon: ReactNode, title: string, body: ReactNode, i: number, open = false) => (
    <details key={title} className="lt-fold lt-tile" open={open} style={{ ...cardStyle, padding: 0, animationDelay: `${i * 0.04}s` }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', minHeight: '60px' }}>
        <span className="lt-cat-emo" style={{ fontSize: '30px', lineHeight: 1, animationDelay: `${-i * 0.4}s` }} aria-hidden="true">{icon}</span>
        <span style={{ flex: 1, fontFamily: TH.serif, fontSize: '24px', lineHeight: 1.1 }}>{title}</span>
        <span className="lt-fold-arrow" aria-hidden="true" style={{ fontSize: '20px' }}>▾</span>
      </summary>
      <div style={{ padding: '0 20px 18px', fontSize: '17px', lineHeight: 1.55, color: TH.ink, display: 'flex', flexDirection: 'column', gap: '10px' }}>{body}</div>
    </details>
  );
  const row = (a: string, b: string) => <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '12px', backgroundColor: '#FBF6EC' }}><span>{a}</span><strong style={{ whiteSpace: 'nowrap' }}>{b}</strong></div>;
  const ort = (a: string, b: string) => <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#FBF6EC' }}><strong style={{ display: 'block' }}>{a}</strong><span>{b}</span></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 16px 0 10px', borderRadius: '999px', border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)', color: TH.brown, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Zurück</button>
      <PageHead title="So funktioniert die Lern-Theke" subtitle="Alles Wichtige zum Nachlesen. Tippe auf ein Thema." />
      <button onClick={onTour} className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
        {KUEKEN_IMG ? <img src={KUEKEN_IMG} alt="" aria-hidden="true" className="lt-loaded" style={{ width: '44px', height: 'auto', background: 'none', animation: 'none' }} /> : null}
        <span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 800, fontSize: '18px' }}>Einführung noch einmal ansehen</span><span style={{ display: 'block', fontSize: '15px', color: TH.brown }}>7 kurze Seiten, eine Minute</span></span>
        <span aria-hidden="true" style={{ fontSize: '22px' }}>›</span>
      </button>
      {box(boxIcon(ICON.home), 'Wo finde ich was?', <>
        {ort('Start', 'Tages-Challenge, Lob der Woche, Umfragen, Geburtstage')}
        {ort('Lernen', 'Quiz nach Themen, Fehler-Stapel, Hör-Lernen')}
        {ort('Spielen', 'Theken-Simulator, Bilderquiz, Quiz Battle und mehr')}
        {ort('Nachschlagen', 'Steckbriefe der Produkte, Kundenfragen, Kundenstimmen')}
        {ort('Bestenliste', 'Punkte im Team, Monatsmeister')}
        {ort('Menü (oben rechts, drei Striche)', 'Statistik, Idee einreichen, Kundenstimme, Geburtstag, Hilfe, größere Schrift')}
        <div>Azubis haben zusätzlich die Seite <strong>Ausbildung</strong>.</div>
      </>, 0, true)}
      {box('🧭', 'Was ist was? Kurz erklärt', <>
        {row('⭐ Punkte', 'für die Bestenliste und deine Stufe')}
        {row('🪜 Stufe', 'steigt mit deinen Punkten, vom Neuling an')}
        {row('🎖️ Rang', 'zeigt, wie viel Prozent aller Fragen du gemeistert hast')}
        {row('🧺 Brotkorb', 'füllt sich mit gemeisterten Quizfragen')}
        {row('🪙 Trinkgeld', 'Geld für den Laden: Zeichen, Farben, Joker')}
        {row('💎 Schatzkammer', 'dort bezahlst du mit Punkten statt mit Trinkgeld')}
        {row('🃏 Joker', 'helfen im Quiz oder im Battle, kaufst du im Laden')}
        {row('🎫 Rubbellos', 'im Laden kaufen, auf der Startseite freirubbeln')}
        {row('🏅 Abzeichen', 'für besondere Erfolge, siehst du im Abzeichen-Album')}
        {row('👑 Krone', 'für die meisten Punkte in einem Monat')}
      </>, 0)}
      {box('⭐', 'Punkte', <>
        <div>Für jede richtige Antwort gibt es Punkte, schwere Fragen bringen mehr:</div>
        {row('Quiz, leichte / schwere Frage', '+10 / +20')}
        {row('Tages-Challenge und Saison-Quiz', '+15 / +30')}
        {row('Experten-Ecke und Produkt der Woche', '+20 / +40')}
        {row('Falsche Antwort (ab der zweiten Woche)', '−10 / −15')}
        <div>Eine Runde fällt nie unter 0 Punkte. Auch Spiele bringen Punkte für die Bestenliste.</div>
        <div><strong>⚡ Combo-Bonus:</strong> In jedem Spiel und Quiz zählt, wie viele richtige Antworten du am Stück hast. Alle 5 richtigen in Folge gibt es mehr: ab 5 ×1,2, ab 10 ×1,4, ab 15 ×1,6, ab 20 ×1,8, ab 25 höchstens ×2,0. Jede Antwort zählt einzeln mit dem Faktor, den du gerade hast. Eine falsche Antwort setzt die Combo zurück.</div>
      </>, 0)}
      {box('🪜', 'Stufen', <>
        <div>Mit deinen Punkten steigst du auf. Es gibt {levels.length} Stufen:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
          {levels.map((l, i) => <div key={l.title} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px', backgroundColor: i % 2 ? TH.white : TH.tintYellow, fontSize: '15px' }}><span aria-hidden="true">{l.icon}</span><span style={{ flex: 1 }}>{i + 1}. {l.title}</span><span style={{ color: TH.muted }}>{l.min.toLocaleString('de-DE')}</span></div>)}
        </div>
      </>, 1)}
      {box('🪙', 'Trinkgeld und Laden', <>
        <div>Trinkgeld kommt so in deine Kasse:</div>
        {row('Theken-Simulator: freundlich, richtig rausgeben, gut beraten', 'bis 6,00 € am Tag')}
        {row('Anmelde-Belohnung, 7 Tage hintereinander', '0,20 € bis 1,00 €')}
        {row('Glücksrad, einmal pro Woche', 'mit Glück')}
        <div>Oben beim 🪙 öffnest du den <strong>Trinkgeld-Laden</strong>. Dort kaufst du Zeichen für deinen Namen, Bewegungen, Titel, Farben und Joker. Jeden Tag gibt es ein Angebot zum halben Preis. Gekauftes gehört dir für immer.</div>
      </>, 2)}
      {box('💎', 'Schatzkammer', <><div>Im Laden gibt es die Schatzkammer. Dort bezahlst du mit <strong>Punkten</strong>, nicht mit Trinkgeld: goldener Name, Bon-Rahmen, seltene Zeichen, eigene Markise und der „Spruch des Tages“, den der Ausbilder vorher freigibt.</div><div>Ausgegebene Punkte fehlen in der Gesamtwertung der Bestenliste. Deine Stufe, die Monatswertung und die Hall of Fame bleiben. Lohnt es sich, dafür ein paar Plätze abzurutschen? Das entscheidest du.</div><div>Im Quiz Battle kannst du außerdem einen <strong>Einsatz</strong> von 50, 100 oder 250 Punkten setzen: Wer gewinnt, bekommt ihn vom anderen.</div></>, 3)}
      {box('🃏', 'Joker', <>
        <div>Joker helfen dir einmal im Quiz oder Spiel. Du bekommst sie im Laden, am Glücksrad und an Tag 7 der Anmelde-Belohnung.</div>
        {jokers.map(j => <div key={j.label}><strong>{j.icon} {j.label}:</strong> {j.desc}</div>)}
      </>, 3)}
      {box('🎡', 'Glücksrad', <div>Einmal pro Woche (ab Montag) darfst du drehen. Zu gewinnen gibt es Joker, Trinkgeld und Extra-Punkte. Mit dem Joker „Extra-Dreh“ drehst du zusätzlich.</div>, 4)}
      {box('🔁', 'Fehler-Stapel', <div>Jede Frage, die du falsch beantwortest, landet hier. Sie kommt am nächsten Tag wieder, danach nach 3, nach 7 und nach 14 Tagen. Hast du sie dabei jedes Mal richtig, ist sie gelernt und raus. So lernst du genau das, was noch nicht sitzt.</div>, 5)}
      {box('🔥', 'Lern-Serie und Serien-Bonus', <><div>Jeder Tag, an dem du etwas lernst oder spielst, verlängert deine Serie. Sonntags ist die Bäckerei zu, ein Sonntag ohne Lernen unterbricht die Serie deshalb nicht. Lässt du einen anderen Tag aus, fängt sie wieder bei 1 an.</div><div>Je länger deine Serie, desto mehr Punkte bekommst du:</div>{row('Tag 1', '×1,0')}{row('Tag 2', '×1,1')}{row('Tag 3', '×1,2')}{row('Tag 4', '×1,3')}{row('Tag 5', '×1,4')}{row('ab Tag 6', '×1,5')}</>, 6)}
      {box('🏅', 'Abzeichen', <div>Für besondere Leistungen gibt es Abzeichen, zum Beispiel für Serien, viele richtige Antworten oder alle Produkte im Bilderquiz. Ein paar sind geheim. Alle siehst du im Abzeichen-Album unter „Dein Fortschritt“ auf der Startseite.</div>, 7)}
      {box('🎖️', 'Hinkel-Meister', <div>Wer 100 % aller Fragen gemeistert hat, wird Hinkel-Meister: goldener Rahmen um die Punktekarte, 🎖️ vor dem Namen in der Bestenliste und die Meister-Runde unter Lernen mit 15 schweren Fragen und dreifachen Punkten, so oft man will. Ab 90 % zeigt die App, wie viele Fragen noch fehlen.</div>, 8)}
      {box('🆕', 'Neu im Sortiment', <div>Legt der Ausbilder ein neues Produkt an, erscheint es sofort in den Steckbriefen und in den Spielen. Drei Wochen lang gibt es auf der Startseite die Kachel „Neu im Sortiment“ mit einem kurzen Quiz dazu.</div>, 8)}
      {box('👑', 'Bestenliste und Monatsmeister', <div>In der Bestenliste siehst du Gesamtpunkte, den aktuellen Monat und mehr. Wer am Monatsende vorne liegt, wird Monatsmeister, bekommt eine Krone, 2,00 € Trinkgeld und kommt in die Hall of Fame.</div>, 8)}
      {box('📋', 'Erste Woche', <div>Neue Kolleginnen und Kollegen bekommen einen Plan für die ersten 5 Tage. Vieles hakt sich beim Üben von selbst ab, den Rest hakst du selbst ab.</div>, 9)}
      {box('⚑', 'Fehler gefunden?', <div>Unter jeder Frage gibt es „Fehler melden“. Dein Ausbilder sieht die Meldung und korrigiert die Frage.</div>, 10)}
      {box(boxIcon(ICON.chat), 'Kundenfragen und Verkaufstipps', <>
        <div><strong>Kundenfragen:</strong> Unter Nachschlagen → „Das hat ein Kunde gefragt“. Wenn dich ein Kunde etwas fragt, das du nicht wusstest, schreib es dort hinein. Der Ausbilder antwortet, danach sehen alle Frage und Antwort und lernen mit.</div>
        <div><strong>Verkaufstipps:</strong> In jedem Produkt-Steckbrief kannst du einen Tipp für die Kollegen hinterlassen, zum Beispiel „passt super zu Frischkäse“.</div>
      </>, 11)}
      {box(boxIcon(ICON.heart), 'Lob, Umfragen und wichtige Nachrichten', <>
        <div><strong>Lob der Woche:</strong> Auf der Startseite kannst du einmal am Tag einen Kollegen loben. Er bekommt dafür 10 Punkte.</div>
        <div><strong>Umfragen:</strong> Stellt der Ausbilder eine Frage ans Team, erscheint sie auf der Startseite. Einfach antippen und abstimmen.</div>
        <div><strong>Wichtige Nachrichten:</strong> Manche Nachrichten vom Ausbilder bestätigst du mit „Gelesen und verstanden“. So weiß er, dass es angekommen ist.</div>
      </>, 12)}
      {box(boxIcon(ICON.headphones), 'Hör-Lernen und eigene Notizen', <>
        <div><strong>Hör-Lernen:</strong> Unter Lernen → „Hör-Lernen“. Die App liest dir eine Frage vor, lässt dir kurz Zeit zum Nachdenken und sagt dann die Antwort. Gut für unterwegs, mit Kopfhörern. Tempo und Thema kannst du einstellen.</div>
        <div><strong>Eigene Notiz:</strong> In jedem Produkt-Steckbrief kannst du dir eine Notiz schreiben, zum Beispiel eine Eselsbrücke. Sie ist nur für dich gedacht.</div>
      </>, 13)}
      {box(boxIcon(ICON.pencil), 'Ideen-Box, Kundenstimmen, Geburtstag', <>
        <div><strong>Idee einreichen</strong> (Menü): Du hast eine Idee für den Laden oder die App? Schreib sie hinein, auch ohne deinen Namen. Der Ausbilder antwortet dir.</div>
        <div><strong>Kundenstimme notieren</strong> (Menü oder Nachschlagen): Lob, Kritik oder Wünsche von Kunden kurz festhalten. So erfahren der Ausbilder und die Backstube davon.</div>
        <div><strong>Mein Geburtstag</strong> (Menü): Wenn du magst, trägst du deinen Geburtstag ein. Dann sieht das Team ihn auf der Startseite und kann gratulieren. Das ist freiwillig.</div>
      </>, 14)}
      {box(boxIcon(ICON.globe), 'Ohne Internet', <div>Die Lern-Theke geht auch ohne Internet auf, zum Beispiel im Keller oder bei schlechtem Empfang. Punkte werden gespeichert, sobald du wieder Netz hast.</div>, 15)}
      {box('📱', 'App aufs Handy und größere Schrift', <><div>So legst du die Lern-Theke wie eine App auf dein Handy oder Tablet. Mit „A+“ oben wird die Schrift größer.</div><button onClick={onInstall} style={{ ...btnSecondary, alignSelf: 'flex-start' }}>📱 Anleitung zeigen</button></>, 11)}
    </div>
  );
}

/** Gekreuzte Schwerter im 3D-Look (gleich wie unten in der Leiste) */
export function Swords3D({ size = 22 }: { size?: number }) {
  const one = (m: boolean) => { const X = (x: number) => (m ? 32 - x : x); const P = (pts: number[][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${p[1]}`).join(' ') + ' Z';
    return <g><path d={P([[8.5, 20.5], [27, 5], [11.5, 23.5]])} fill="url(#sw3Blade)" stroke="#4E5A68" strokeWidth=".6" strokeLinejoin="round" /><path d={`M${X(10.4)} 21.6 L${X(24.6)} 7.4`} stroke="rgba(255,255,255,.85)" strokeWidth=".8" /><path d={`M${X(6.4)} 18.4 L${X(13.6)} 25.6`} stroke="#FFC72C" strokeWidth="4" strokeLinecap="round" /><path d={`M${X(9.3)} 22.7 L${X(5.9)} 26.1`} stroke="#5A2E12" strokeWidth="4" strokeLinecap="round" /><circle cx={X(4.9)} cy="27.1" r="2.2" fill="url(#sw3Pommel)" /></g>; };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,.4))' }}>
      <defs>
        <linearGradient id="sw3Blade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#C9D2DC" /><stop offset="1" stopColor="#6B7685" /></linearGradient>
        <radialGradient id="sw3Pommel" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#FFF6C8" /><stop offset=".55" stopColor="#FFC72C" /><stop offset="1" stopColor="#8A6200" /></radialGradient>
      </defs>
      {one(false)}{one(true)}
    </svg>
  );
}
