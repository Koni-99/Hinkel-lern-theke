// ═══ Einführung, Hilfe-Seite ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, ReactNode } from 'react';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead, KUEKEN_IMG } from './basis';
import { LtIcon, ICON } from '../basis/symbole';

const bigIcon = (paths: string[]) => <LtIcon paths={paths} size={72} width={1.6} />;
const boxIcon = (paths: string[]) => <LtIcon paths={paths} size={28} />;

// ───────────────────────── Kurze Einführung für Neue ─────────────────────────
export const INTRO_SLIDES = [
  { icon: bigIcon(ICON.bread), anim: 'lt-emo-shake', title: 'Willkommen in der Lern-Theke!', text: 'Hier lernst du alles, was du an der Theke brauchst: unsere Produkte, Allergene, Beratung und Hygiene. In kleinen Häppchen, wann immer du Zeit hast.', bg: '#FFF0C2' },
  { icon: bigIcon(ICON.home), anim: 'lt-emo-bob', title: 'Wo finde ich was?', text: 'Unten am Handy und Tablet (am Computer links) sind die Hauptseiten: Start, Lernen, Spielen, Nachschlagen und die Bestenliste. Oben rechts hinter den drei Strichen ist das Menü: dort findest du deine Statistik, „Mein Monat“, die Ideen-Box, Kundenstimmen, deinen Geburtstag, das Aussehen der App und die Hilfe „So funktioniert die Lern-Theke“.', bg: '#F6E7C8' },
  { icon: bigIcon(ICON.book), anim: 'lt-emo-bob', title: 'Lernen', text: 'Du beantwortest Fragen und siehst nach jeder Antwort die Erklärung. Was du falsch hattest, kommt in deinen Fehler-Stapel und taucht später noch einmal auf. So bleibt es hängen.', bg: '#DDE6F7' },
  { icon: bigIcon(ICON.game), anim: 'lt-dice-idle', title: 'Spielen', text: 'Theken-Simulator, Bilderquiz, Quiz Battle und mehr. Viele Spiele zählen auch fürs Lernen: richtig beantwortet ist richtig beantwortet.', bg: '#E1EEDC' },
  { icon: bigIcon(ICON.sparkle), anim: 'lt-emo-twinkle', title: 'Punkte und Stufen', text: 'Für richtige Antworten gibt es Punkte, dazu einen Punkte-Bonus ×1,5 auf alles. Damit steigst du Stufe für Stufe auf, vom Neuling bis zur Hinkel-Ikone. In deiner ersten Woche gibt es keine Minuspunkte.', bg: '#FCE1D2' },
  { icon: bigIcon(ICON.coins), anim: 'lt-coin', title: 'Trinkgeld und Laden', text: 'Trinkgeld bekommst du im Theken-Simulator, jeden Tag fürs Vorbeischauen und am Glücksrad. Oben rechts beim Trinkgeld (z. B. „0,00 €“) öffnest du den Laden und kaufst dir Zeichen, Farben und Joker.', bg: '#FFF0C2' },
  { icon: bigIcon(ICON.users), anim: 'lt-emo-bob', title: 'Gemeinsam im Team', text: 'Die Lern-Theke ist auch für den Austausch da: Kundenfragen und Verkaufstipps teilen, einmal am Tag einen Kollegen loben (auch anonym), bei Umfragen abstimmen und Ideen einreichen. Alles Wichtige dazu steht im Menü unter „So funktioniert die Lern-Theke“.', bg: '#E1EEDC' },
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
            <button autoFocus onClick={() => (last ? onDone() : setI(i + 1))} style={{ ...btnPrimary, flex: 1 }}>{last ? 'Los geht’s!' : 'Weiter'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Hilfe: So funktioniert die Lern-Theke ─────────────────────────
export function HilfeView({ levels, jokers, onTour, onBack, onInstall, thema }: { thema?: string; levels: { min: number; title: string; icon: string }[]; jokers: { icon: string; label: string; desc?: string }[]; onTour: () => void; onBack: () => void; onInstall: () => void }) {
  // Version 251: aus der Suche direkt ein Thema öffnen
  useEffect(() => { if (!thema) return; const t = window.setTimeout(() => { const el = [...document.querySelectorAll('main details[data-thema]')].find((d) => d.getAttribute('data-thema') === thema); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250); return () => window.clearTimeout(t); }, [thema]);
  const box = (icon: ReactNode, title: string, body: ReactNode, i: number, open = false) => (
    <details key={title} className="lt-fold lt-tile" data-thema={title} open={open || title === thema} style={{ ...cardStyle, padding: 0, animationDelay: `${i * 0.04}s` }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', minHeight: '60px' }}>
        <span className="lt-cat-emo" style={{ fontSize: '30px', lineHeight: 1, animationDelay: `${-i * 0.4}s` }} aria-hidden="true">{icon}</span>
        <span style={{ flex: 1, fontFamily: TH.serif, fontSize: '24px', lineHeight: 1.1 }}>{title}</span>
        <span className="lt-fold-arrow" aria-hidden="true" style={{ fontSize: '20px' }}>▾</span>
      </summary>
      <div style={{ padding: '0 20px 18px', fontSize: '17px', lineHeight: 1.55, color: TH.ink, display: 'flex', flexDirection: 'column', gap: '10px' }}>{body}</div>
    </details>
  );
  const row = (a: string, b: string) => <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4px 12px', padding: '10px 14px', borderRadius: '12px', backgroundColor: '#FBF6EC' }}><span style={{ minWidth: 0 }}>{a}</span><strong style={{ marginLeft: 'auto', textAlign: 'right', whiteSpace: b.length <= 18 ? 'nowrap' : 'normal', minWidth: 0 }}>{b}</strong></div>;
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
        {ort('Hauptseiten', 'am Handy und Tablet unten, am Computer als Leiste links')}
        {ort('Start', 'Tages-Challenge, Team-Challenge, Lob der Woche, Umfragen, Geburtstage. Ganz unten zum Aufklappen: „Deine Zahlen“ mit Statistik, Lern-Bon, Serie und Abzeichen')}
        {ort('Lernen', 'Quiz nach Themen, Fehler-Stapel, Lieblingsfragen, Hör-Lernen, Lernpfad')}
        {ort('Spielen', 'Theken-Simulator, Telefon-Bestellung, Bilderquiz, Ofen-Kette, Rechen-Trainer, Quiz Battle und mehr; ganz unten „Zum Abschalten“ mit sechs Spielen zum Entspannen')}
        {ort('Lupe oben', 'Sucht überall: Produkte, Fragen aus dem Quiz, Hilfe-Themen und Seiten. Mit dem Mikrofon kannst du auch sprechen, das geht auch im Suchfeld unter Nachschlagen.')}
        {ort('Nachschlagen', 'Steckbriefe der Produkte, Fachwissen, Englisch, Kundenfragen, Gute Sätze für die Theke, Kundenstimmen')}
        {ort('Bestenliste', 'Punkte im Team, Monatsmeister')}
        {ort('Zurück-Taste am Handy', 'geht eine Seite zurück und schließt offene Steckbriefe, statt die App zu beenden')}
        {ort('Neu laden', 'du bleibst auf der Seite, auf der du gerade warst')}
        {ort('Menü (oben rechts, drei Striche)', 'Für mich: Nachrichten, Statistik, Mein Monat, Geburtstag, Urlaub. Mitmachen: Idee einreichen, Kundenstimme. Einstellungen: Schrift, Aussehen, Für ohne Internet laden, Hilfe')}
        <div>Azubis haben zusätzlich die Seite <strong>Ausbildung</strong>: Ausbildungsplan, Wochenziel, Frage an den Ausbilder, Notizen fürs Berichtsheft, Berufsschul-Lernkarten und Prüfungen.</div>
      </>, 0, true)}
      {box(boxIcon(ICON.bulb), 'Was ist was? Kurz erklärt', <>
        {ort('Punkte', 'für die Bestenliste und deine Stufe')}
        {ort('Stufe', 'steigt mit deinen Punkten, vom Neuling an')}
        {ort('Rang', 'zeigt, wie viel Prozent aller Fragen du gemeistert hast')}
        {ort('Brotkorb', 'füllt sich mit gemeisterten Quizfragen')}
        {ort('Trinkgeld', 'Geld für den Laden: Zeichen, Farben, Joker')}
        {ort('Schatzkammer', 'dort bezahlst du mit Punkten statt mit Trinkgeld')}
        {ort('Joker', 'helfen im Quiz oder im Battle, kaufst du im Laden')}
        {ort('Rubbellos', 'im Laden kaufen, auf der Startseite drei Felder freirubbeln: drei gleiche Bilder gewinnen')}
        {ort('Abzeichen', 'für besondere Erfolge, als Sticker in deinem Stickerheft')}
        {ort('Krone', 'für die meisten Punkte in einem Monat')}
        {ort('Glücksfrage', 'kommt nach 5 richtigen in Folge, zählt dreifach, kein Abzug')}
        {ort('Punkte-Bonus ×1,5', 'auf alle Punkte, steht auf dem Kassenbon')}
        {ort('Küken-Geheimnis', 'Küken neben „Wusstest du?“ antippen')}
      </>, 0)}
      {box(boxIcon(ICON.sparkle), 'Punkte', <>
        <div>Für jede richtige Antwort gibt es Punkte, schwere Fragen bringen mehr:</div>
        {row('Quiz, leichte / schwere Frage', '+10 / +20')}
        {row('Tages-Challenge und Saison-Quiz', '+15 / +30')}
        {row('Experten-Ecke und Produkt der Woche', '+20 / +40')}
        {row('Falsche Antwort (ab der zweiten Woche)', '−10 / −15')}
        <div>Eine Runde fällt nie unter 0 Punkte. Auch Spiele bringen Punkte für die Bestenliste.</div>
        <div><strong>Punkte-Bonus ×1,5:</strong> Auf alle Punkte aus Quiz und Spielen kommt noch die Hälfte obendrauf. Aus 100 Punkten werden 150. Ein Sieg im Quiz Battle bringt 38 Punkte, ein Lob 15.</div>
        <div><strong>Team-Challenge:</strong> Schafft das Team das Wochenziel, bekommt jeder, der in der Woche mitgespielt hat, 500 Punkte, eine Überraschungstüte (geht sofort auf) und ein Rubbellos.</div>
        <div><strong>Combo-Bonus:</strong> In jedem Spiel und Quiz zählt, wie viele richtige Antworten du am Stück hast. Alle 5 richtigen in Folge gibt es mehr: ab 5 ×1,2, ab 10 ×1,4, ab 15 ×1,6, ab 20 ×1,8, ab 25 höchstens ×2,0. Jede Antwort zählt einzeln mit dem Faktor, den du gerade hast. Eine falsche Antwort setzt die Combo zurück.</div>
      </>, 0)}
      {box(boxIcon(ICON.trophy), 'Stufen', <>
        <div>Mit deinen Punkten steigst du auf, jeder Aufstieg wird mit einer kleinen Feier begrüßt. Es gibt {levels.length} Stufen:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
          {levels.map((l, i) => <div key={l.title} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px', backgroundColor: i % 2 ? TH.white : TH.tintYellow, fontSize: '15px' }}><span style={{ flex: 1 }}>{i + 1}. {l.title}</span><span style={{ color: TH.muted }}>{l.min.toLocaleString('de-DE')}</span></div>)}
        </div>
      </>, 1)}
      {box(boxIcon(ICON.coins), 'Trinkgeld und Laden', <>
        <div>Trinkgeld kommt so in deine Kasse:</div>
        {row('Theken-Simulator: freundlich, richtig rausgeben, gut beraten', 'bis 6,00 € am Tag')}
        {row('Anmelde-Belohnung, 7 Tage hintereinander', '0,30 € bis 1,50 €')}
        {row('Glücksrad, einmal pro Woche', 'mit Glück')}
        <div>Oben rechts beim Trinkgeld (z. B. „0,00 €“) öffnest du den <strong>Trinkgeld-Laden</strong>. Dort kaufst du Zeichen für deinen Namen, Bewegungen, Titel, Farben und Joker. Antippen zeigt dir zuerst oben eine Vorschau, wie es an deinem Namen aussieht, gekauft wird erst mit „Kaufen“. Jeden Tag gibt es ein Angebot zum halben Preis. Gekauftes gehört dir für immer.</div>
        <div><strong>Serien-Schutz</strong> (Joker): Wenn du einen Tag nicht lernst, bleibt deine Lern-Serie trotzdem erhalten. Der Schutz wird beim nächsten Öffnen der App automatisch eingesetzt. Sonntags musst du nie lernen, der Sonntag unterbricht die Serie sowieso nicht.</div>
        <div><strong>Verschenken:</strong> Unter „Joker“ kannst du Kollegen Rubbellose oder Joker schenken: erst aussuchen was, dann mit + und − wie viele pro Kollege, dann einen oder mehrere Kollegen antippen. Bezahlt wird alles auf einmal mit deinem Trinkgeld, bis zu 10 Joker am Tag. Jeder bekommt beim nächsten Öffnen ein Pop-up mit deinem Geschenk.</div>
        <div><strong>Neue Joker:</strong> Hinweis-Joker (eine falsche Antwort verschwindet), Zweite Chance (einschalten, bei der nächsten falschen Antwort darfst du nochmal, ohne Abzug) und Punkte-Magnet (dein nächstes Spiel oder Quiz bringt 25 % mehr Punkte, wird automatisch eingesetzt).</div>
        <div><strong>Überraschungstüte:</strong> Unter „Joker“. Drin ist ein Teil aus dem Laden, das du noch nicht hast, ein Joker oder Trinkgeld zurück. Unter „Zeichen“ gibt es außerdem jede Woche 2 seltene Teile, die nur diese Woche zu haben sind.</div>
        <div><strong>Schriften und Jubel:</strong> Unter „Farben“ gibt es Schriften für deinen Namen (Kreide, Schreibschrift, Zuckerguss, Kassenbon), unter „Bewegung“ einen Jubel-Effekt für das Ende eines guten Quiz (Brezelregen, Mehlwolke, Sternenregen).</div>
        <div><strong>Teigi, dein Begleiter:</strong> Jeder hat Teigi, ein kleines Sauerteig-Glas mit goldenem Deckel. Er wohnt in deinem Brotkorb auf der Startseite. Jeder Lerntag füttert ihn und er wächst: Baby-Teigi am Anfang, ab 5 Lerntagen Junger Teigi, ab 15 Kräftiger Teigi (der Teig drückt den Deckel hoch), ab 40 Meister-Teigi (der Teig quillt aus dem Glas und glitzert). Lernst du ein paar Tage nicht, wird er schlapp, ein Lerntag macht ihn wieder munter. Er begleitet dich überall in der App unten am Rand. Im Quiz und in den Spielen reagiert er auf deine Antworten: Bei richtigen Antworten hüpft er, bei falschen ist er traurig und muntert dich auf, bei Serien wie 3, 5 oder 10 richtigen in Folge jubelt er. Tippst du ihn an, hüpft er und sagt etwas. Liest eine Stimme etwas vor (Quiz, Steckbrief, Lernkarten, Hör-Lernen, Theken-Simulator), bewegt Teigi den Mund, als würde er es erzählen. Das macht er auch, wenn er selbst in seiner Sprechblase etwas sagt. Aus- und wieder einschalten kannst du ihn ganz unten in der App („Teigi ausschalten“). Wer mag, gibt Teigi im Brotkorb einen eigenen Namen („Teigi einen Namen geben“). Im Laden unter „Teigi“ gibt es Hüte und Zubehör, neue Gläser und Tänze für ihn.</div>
        <div><strong>Sammel-Sets:</strong> Unter „Titel“ siehst du Reihen wie „Brotkorb“ oder „Alle Farben“. Hast du alle Teile einer Reihe, bekommst du einen seltenen Bonus-Titel, den man nicht kaufen kann.</div>
      </>, 2)}
      {box(boxIcon(ICON.calendar), 'Adventskalender', <div>Vom 1. bis 24. Dezember gibt es jeden Tag ein Türchen mit einer Frage zum Weihnachtsgebäck. Jedes Türchen bringt eine Überraschungstüte und ein Geschenk, das es nur im Adventskalender gibt: Zeichen wie Rentier oder Schneeflocke, Titel wie „Adventsbäcker“, Wintersachen für Teigi (Rentiergeweih, Elfenmütze, Schal, Ohrenschützer), den Bon-Rahmen Tannen und die Markise Winterzauber. Richtig beantwortet gibt es dazu 100 Punkte. Wer alle 24 Türchen öffnet, bekommt den Goldenen Stern für Teigi und den Titel „Weihnachtsstern“. Verpasste Türchen kannst du nachholen.</div>, 3)}
      {box(boxIcon(ICON.gift), 'Schatzkammer', <><div>Im Laden gibt es die Schatzkammer. Dort bezahlst du mit <strong>Punkten</strong>, nicht mit Trinkgeld: goldener Name, Bon-Rahmen, seltene Zeichen, eigene Markise und der „Spruch des Tages“, den der Ausbilder vorher freigibt.</div><div>Ausgegebene Punkte fehlen in der Gesamtwertung der Bestenliste. Deine Stufe, die Monatswertung und die Hall of Fame bleiben. Lohnt es sich, dafür ein paar Plätze abzurutschen? Das entscheidest du.</div><div>Im Quiz Battle kannst du außerdem einen <strong>Einsatz</strong> von 50, 100 oder 250 Punkten setzen: Wer gewinnt, bekommt ihn vom anderen.</div></>, 3)}
      {box(boxIcon(ICON.dice), 'Joker', <>
        <div>Joker helfen dir einmal im Quiz oder Spiel. Du bekommst sie im Laden, am Glücksrad und an Tag 7 der Anmelde-Belohnung.</div>
        {jokers.map(j => <div key={j.label}><strong>{j.label}:</strong> {j.desc}</div>)}
      </>, 3)}
      {box(boxIcon(ICON.wheel), 'Glücksrad', <div>Einmal pro Woche (ab Montag) darfst du drehen. Zu gewinnen gibt es Joker, Trinkgeld und Extra-Punkte. Mit dem Joker „Extra-Dreh“ drehst du zusätzlich.</div>, 4)}
      {box(boxIcon(ICON.repeat), 'Fehler-Stapel', <div>Jede Frage, die du falsch beantwortest, landet hier. Sie kommt am nächsten Tag wieder, danach nach 3, nach 7 und nach 14 Tagen. Hast du sie dabei jedes Mal richtig, ist sie gelernt und raus. So lernst du genau das, was noch nicht sitzt.</div>, 5)}
      {box(boxIcon(ICON.flame), 'Lern-Serie und Serien-Bonus', <><div>Jeder Tag, an dem du etwas lernst oder spielst, verlängert deine Serie. Sonntags ist die Bäckerei zu, ein Sonntag ohne Lernen unterbricht die Serie deshalb nicht. Lässt du einen anderen Tag aus, fängt sie wieder bei 1 an.</div><div>Auf alle Punkte gibt es einen <strong>Punkte-Bonus ×1,5</strong> (steht auf dem Kassenbon). Und je länger deine Serie, desto mehr kommt noch dazu:</div>{row('Tag 1', '×1,0')}{row('Tag 2', '×1,1')}{row('Tag 3', '×1,2')}{row('Tag 4', '×1,3')}{row('Tag 5', '×1,4')}{row('ab Tag 6', '×1,5')}</>, 6)}
      {box(boxIcon(ICON.medal), 'Abzeichen', <div>Für besondere Leistungen gibt es Abzeichen, zum Beispiel für Serien, viele richtige Antworten oder alle Produkte im Bilderquiz. Ein paar sind geheim. Sie kommen als Sticker in dein Stickerheft (Startseite → „Dein Fortschritt“): Neue Sticker werden beim Öffnen eingeklebt, mit den Knöpfen oder durch Wischen blätterst du um.</div>, 7)}
      {box(boxIcon(ICON.dice), 'Lernpfad', <div>Unter Lernen → „Lernpfad“ gehst du Feld für Feld einen Weg mit 24 Feldern entlang. Fertige Felder sind braun mit Haken, dein aktuelles Feld leuchtet gold. Unten steht, welcher Bereich dran ist, mit „Spielen“ geht es los. Pro Feld 5 Fragen, ab 4 richtigen geht es weiter. Jedes 6. Feld ist ein Brot-Meilenstein, am Ende wirst du Brotmeister.</div>, 7)}
      {box(boxIcon(ICON.shield), 'Hinkel-Meister', <div>Wer 100 % aller Fragen gemeistert hat, wird Hinkel-Meister: goldener Rahmen um die Punktekarte, ein Meister-Zeichen vor dem Namen in der Bestenliste und die Meister-Runde unter Lernen mit 15 schweren Fragen und dreifachen Punkten, so oft man will. Ab 90 % zeigt die App, wie viele Fragen noch fehlen.</div>, 8)}
      {box(boxIcon(ICON.plus), 'Neu im Sortiment', <div>Legt der Ausbilder ein neues Produkt an, erscheint es sofort in den Steckbriefen und in den Spielen. Drei Wochen lang gibt es auf der Startseite die Kachel „Neu im Sortiment“ mit einem kurzen Quiz dazu.</div>, 8)}
      {box(boxIcon(ICON.crown), 'Bestenliste und Monatsmeister', <><div>In der Bestenliste siehst du Gesamtpunkte, den aktuellen Monat und mehr. Wer am Monatsende vorne liegt, wird Monatsmeister, bekommt eine Krone, 2,00 € Trinkgeld und kommt in die Hall of Fame.</div><div>Überholt dich jemand, egal ob in den Gesamtpunkten, in der Monatswertung oder in einem einzelnen Spiel, bekommst du beim nächsten Öffnen der App eine kurze Meldung.</div><div>Stehst du weiter unten, bringt dich der Knopf „Zu mir springen“ oben auf dem Bon direkt zu deinem Platz.</div><div><strong>Neustart:</strong> Der Ausbilder kann die Bestenliste neu starten, zum Beispiel nach der Testphase. Dann fangen dort alle bei 0 Punkten an, oben auf dem Bon steht „Wertung seit …“. Deine Stufe, dein Trinkgeld, gekaufte Sachen und alles Gelernte bleiben.</div></>, 8)}
      {box(boxIcon(ICON.checklist), 'Erste Woche', <div>Neue Kolleginnen und Kollegen bekommen einen Plan für die ersten 5 Tage. Vieles hakt sich beim Üben von selbst ab, den Rest hakst du selbst ab.</div>, 9)}
      {box(boxIcon(ICON.flag), 'Fehler gefunden?', <div>Unter jeder Frage gibt es „Fehler melden“. Dein Ausbilder sieht die Meldung und korrigiert die Frage.</div>, 10)}
      {box(boxIcon(ICON.bread), 'Steckbriefe der Produkte', <div>Unter Nachschlagen → Produktkenntnis siehst du alle Produkte als Fotos nebeneinander. Antippen öffnet den Steckbrief: großes Foto, Preis, was du im Verkauf sagst und die Allergene. Die Allergene stehen als farbige Kästchen da, damit du sie an der Theke sofort siehst: Gluten gelb, Milch blau, Eier hellgelb, Nüsse braun. Viele Produkte haben mehrere Fotos aus unserem Online-Shop: zur Seite wischen oder die Pfeile antippen. <strong>Foto antippen</strong> zeigt es im Vollbild, dort wischst du wie in der Handy-Galerie von Foto zu Foto, doppelt tippen vergrößert eine Stelle. Hat der Ausbilder selbst ein Foto gemacht, wird seins gezeigt. Mit „Vergleichen“ siehst du zwei Produkte nebeneinander, zum Beispiel Schweizer und Münsterländer: Preis, Schnitt, Mehl, was du im Verkauf sagst und die Allergene. Allergene, die nur eins der beiden hat, stehen rot da. In den Spielen kommt zur Abwechslung mal das eine, mal das andere Foto. Steht ein roter Hinweis darunter, bitte bei Allergikern besonders vorsichtig sein. Ganz unten steht die vollständige Zutatenliste. Mit „Steckbrief vorlesen“ liest dir eine natürliche Stimme alles vor, genauso im Quiz, in den Lernkarten und in den Spielen. Die Produkt-Lernkarten sehen aus wie echte Karteikarten: vorne der Name, hinten die Antwort in Stichpunkten. Nach dem Umdrehen tippst du „Wusste ich“ oder „Nochmal“. Darunter steht dein Lernkasten mit 5 Fächern: Gewusste Karten wandern ein Fach weiter nach hinten, bei „Nochmal“ kommt die Karte zurück in Fach 1 und taucht ein paar Karten später wieder auf. Karten aus Fach 1 kommen zuerst dran. Mit „Frag mich ab“ hörst du vorne den Namen und die Frage, nach dem Umdrehen die Antwort. Die Fachwissen-Lernkarten funktionieren genauso: vorne die Frage, hinten die Antwort in Handschrift, mit eigenem Lernkasten. Beim Vorlesen wechseln sich verschiedene natürliche Stimmen ab, Frauen- und Männerstimmen. <strong>Backtage:</strong> Gibt es ein Produkt nur an bestimmten Tagen, steht im Steckbrief, an welchen. <strong>Preis geändert:</strong> Hat sich der Preis geändert, steht zwei Wochen lang das Datum und der alte Preis dabei. <strong>Zuletzt angesehen:</strong> Oben in der Liste stehen die Steckbriefe, die du zuletzt geöffnet hast, zum schnellen Nachsehen an der Theke. <strong>An Kollegen schicken:</strong> Unten im Steckbrief wählst du einen Kollegen aus. Er bekommt eine Nachricht und kann den Steckbrief mit einem Tipp öffnen.</div>, 11)}
      {box(boxIcon(ICON.chat), 'Kundenfragen und Verkaufstipps', <>
        <div><strong>Kundenfragen:</strong> Unter Nachschlagen → „Das hat ein Kunde gefragt“. Wenn dich ein Kunde etwas fragt, das du nicht wusstest, schreib es dort hinein. Der Ausbilder antwortet, danach sehen alle Frage und Antwort und lernen mit. Geht es um ein Produkt, führt ein Knopf direkt zu seinem Steckbrief.</div>
        <div><strong>Gute Sätze für die Theke:</strong> Unter Nachschlagen. Formulierungen fürs Begrüßen, Beraten, Zusatzverkauf, Allergien, Reklamation, Kassieren und Verabschieden. Mit Vorlesen hörst du, wie es klingt.</div>
        <div><strong>Verkaufstipps:</strong> In jedem Produkt-Steckbrief kannst du einen Tipp für die Kollegen hinterlassen, zum Beispiel „passt super zu Frischkäse“.</div>
      </>, 11)}
      {box(boxIcon(ICON.heart), 'Lob, Umfragen und wichtige Nachrichten', <>
        <div><strong>Lob der Woche:</strong> Auf der Startseite kannst du einmal am Tag einen Kollegen loben. Er bekommt dafür 15 Punkte. Mit dem Haken „Anonym danken“ steht statt deinem Namen „Ein Kollege“. Ein anonymes Danke schaut sich vorher der Ausbilder an (er sieht, von wem es ist). Erst nach seiner Freigabe erscheint es und der Kollege bekommt die Punkte.</div>
        <div><strong>Wer heute gelernt hat:</strong> Auf der Startseite siehst du, welche Kollegen heute schon gelernt haben. Sind es mehr als zwei, tippst du die Zeile an und siehst alle Namen.</div>
        <div><strong>Umfragen:</strong> Stellt der Ausbilder eine Frage ans Team, erscheint sie auf der Startseite. Einfach antippen und abstimmen.</div>
        <div><strong>Wichtige Nachrichten:</strong> Manche Nachrichten vom Ausbilder bestätigst du mit „Gelesen und verstanden“. So weiß er, dass es angekommen ist.</div>
      </>, 12)}
      {box(boxIcon(ICON.headphones), 'Hör-Lernen und eigene Notizen', <>
        <div><strong>Hör-Lernen:</strong> Unter Lernen → „Hör-Lernen“. Die App liest dir eine Frage vor, lässt dir kurz Zeit zum Nachdenken und sagt dann die Antwort. Gut für unterwegs, mit Kopfhörern. Tempo und Thema kannst du einstellen. Gesprochen wird mit natürlichen Stimmen, zwei Frauen und zwei Männer im Wechsel. Nur bei Fragen, die der Ausbilder neu angelegt hat, liest die Handy-Stimme. Unter „Prüfungsfragen“ hörst du auch die Fragen aus Zwischen- und Abschlussprüfung.</div>
        <div><strong>Eigene Notiz:</strong> In jedem Produkt-Steckbrief kannst du dir eine Notiz schreiben, zum Beispiel eine Eselsbrücke. Sie ist nur für dich gedacht.</div>
      </>, 13)}
      {box(boxIcon(ICON.pencil), 'Ideen-Box, Kundenstimmen, Geburtstag', <>
        <div><strong>Idee einreichen</strong> (Menü): Du hast eine Idee für den Laden oder die App? Schreib sie hinein, auch ohne deinen Namen. Der Ausbilder antwortet dir.</div>
        <div><strong>Kundenstimme notieren</strong> (Menü oder Nachschlagen): Lob, Kritik oder Wünsche von Kunden kurz festhalten. So erfahren der Ausbilder und die Backstube davon.</div>
        <div><strong>Mein Geburtstag</strong> (Menü): Wenn du magst, trägst du deinen Geburtstag ein. Dann sieht das Team ihn auf der Startseite und kann gratulieren. Das ist freiwillig.</div>
      </>, 14)}
      {box(boxIcon(ICON.mail), 'Persönliche Nachrichten', <>
        <div><strong>Meine Nachrichten</strong> (Menü): Hier landen Nachrichten, die nur an dich gehen. Neue Nachrichten kommen beim Öffnen der App als Pop-up. Du tippst „Gelesen“ oder schreibst kurz eine Antwort (freiwillig). Danach kannst du sie im Postfach jederzeit nochmal lesen. Eine rote Zahl im Menü zeigt, dass etwas Neues da ist.</div>
        <div><strong>Wer schreibt?</strong> Der Ausbilder und Koni, und wem der Ausbilder das Recht gibt. Sie wählen einzelne Personen aus und sehen, wer gelesen und was geantwortet hat. Die anderen im Team sehen die Nachricht nicht. Neue Antworten erkennt man an einer Zahl: im Ausbilder-Bereich am Reiter „Nachricht & Umfrage“, sonst rot im Menü.</div>
        <div><strong>Steckbrief schicken:</strong> Einen Steckbrief darf jeder an einen Kollegen schicken (im Steckbrief unten). Der Kollege bekommt eine Nachricht mit dem Knopf „Steckbrief ansehen“.</div>
      </>, 14)}
      {box(boxIcon(ICON.globe), 'Englisch für die Theke', <div>Unter Nachschlagen → Fachwissen → „Wörterbuch Englisch“ findest du Sätze für Gäste aus aller Welt: Bedienung, Bezahlen, Zahlen und Mengen, Allergene und alle unsere Produkte. Unter „Das sagen Kunden“ steht, was Gäste oft fragen, mit der deutschen Bedeutung. Tippe auf den Lautsprecher, dann wird es auf Englisch vorgelesen.</div>, 15)}
      {box(boxIcon(ICON.calendar), 'Mein Monat', <div>Im Menü unter „Mein Monat“ siehst du, wie dein Monat lief: Punkte (auch im Vergleich zum Vormonat), dein Platz im Team, an wie vielen Tagen du gelernt hast, wie viele Fragen du neu gemeistert hast und was du am liebsten gemacht hast. Dazu gibt es einen Tipp, was du als Nächstes üben kannst. Das siehst nur du.</div>, 15)}
      {box(boxIcon(ICON.sun), 'Aussehen: hell oder dunkel', <div>Im Menü unter „Aussehen“ suchst du dir aus, wie die Lern-Theke bei dir aussieht. <strong>Farben:</strong> „Hell“ ist das gewohnte Aussehen. „Backstube bei Nacht“ ist dunkel mit Gold, beim Umschalten lädt die Seite kurz neu. Die Karten auf der Startseite sind dann hellbraun, damit man sie gut erkennt. Kassenbons, Lern-Bon und Bestenliste bleiben helles Papier, damit man alles gut lesen kann. <strong>Kopf der Seite:</strong> „Goldene Ähren“ (dunkle Bühne mit leuchtenden Ähren, so startet die App), die gelbe Markise (zeigt auf Wunsch das Wetter) oder die Markise mit goldenen Ähren. Das gilt nur auf deinem Gerät, Punkte und Fortschritt bleiben gleich. Hast du im Laden eine eigene Markise oder Farbe gekauft, bleibt die.</div>, 15)}
      {box(boxIcon(ICON.sparkle), 'Extras im Quiz', <>
        <div><strong>Glücksfrage:</strong> Hast du 5 Fragen hintereinander richtig, wird die nächste eine Glücksfrage. Sie zählt dreifach, und falsch gibt es keinen Abzug.</div>
        <div><strong>Comeback-Bonus:</strong> Schaffst du eine Frage, die in deinem Fehler-Stapel fällig war, gibt es doppelte Punkte.</div>
        <div><strong>Wissens-Pause:</strong> Auf dem Kassenbon nach jeder Runde steht ein kurzer Fakt aus der Backstube.</div>
        <div><strong>Lieblingsfragen:</strong> Tippe im Quiz auf den Stern neben der Frage. Unter Lernen → „Lieblingsfragen“ übst du alle gemerkten Fragen am Stück. Nochmal tippen nimmt den Stern wieder weg.</div>
        <div><strong>Willkommen zurück:</strong> Hast du 7 Tage oder länger nicht gelernt, gibt es am ersten Tag zurück für alles doppelte Punkte.</div>
        <div><strong>Küken-Geheimnis:</strong> Tipp auf der Startseite auf das Küken neben „Wusstest du?“. Es verrät dir einen Profi-Kniff aus Backstube und Verkauf.</div>
      </>, 15)}
      {box(boxIcon(ICON.chat), 'Theken-Simulator', <>
        <div>Unter Spielen → „Theken-Simulator“ bedienst du einen Kunden von der Begrüßung bis zum Abschied. Die Gespräche sind wie an der echten Theke: Die meisten Kunden kennst du nicht, nur Stammkunden haben einen Namen. „Sonst noch was?“ und der Preis kommen in jedem Gespräch.</div>
        <div>Es gibt viele Situationen, zum Beispiel Allergien, Reklamation, Kartenzahlung, eine Vorbestellung abholen, falsche Ware in der Tüte oder Fragen zu Saisongebäck.</div>
        <div><strong>Zuhören:</strong> Schaltest du vor dem Start „Zuhören“ ein, spricht der Kunde laut. Seinen Satz siehst du erst, wenn du antippst oder antwortest. Mit „Nochmal hören“ wiederholt er ihn. Ton am Handy einschalten! Die Kunden sprechen mit natürlichen Stimmen (Kundinnen mit einer Frauen-, Kunden mit einer Männerstimme). Ohne Internet liest die Handy-Stimme.</div>
        <div><strong>Prüfungsgespräch:</strong> Im Theken-Simulator unter „Prüfungsgespräch üben“ (und für Azubis im Ausbildungsplan). Ein langes Gespräch wie in der praktischen Prüfung, ohne Hinweise zwischendurch. Am Ende gibt es einen Bewertungsbogen mit Note: Kontakt und Begrüßung, Beratung, Zusatzverkauf, Kassieren, Gesprächsführung.</div>
        <div><strong>Telefon-Bestellung:</strong> Unter Spielen ruft ein Kunde an und bestellt vor. Du füllst den Bestellzettel aus: Name, Abholtag, Uhrzeit, Mengen und ob das Brot geschnitten wird. Pro Runde gibt es 5 Anrufe, von einfach bis kompliziert (der Kunde korrigiert sich, streicht etwas oder sagt „ein Dutzend“). Nach und nach kommt jeder Artikel aus dem Sortiment einmal dran. Wer nur zuhört und den Text nicht liest, bekommt einen Extra-Bonus. Am Telefon sprechen abwechselnd eine Frau und ein Mann mit natürlicher Stimme.</div>
      </>, 2)}
      {box(boxIcon(ICON.calc), 'Rechen-Trainer und Prüfung', <>
        <div><strong>Rechen-Trainer:</strong> Unter Spielen → „Schnell an der Kasse“. 8 Aufgaben wie in der Prüfung mit echten Hinkel-Preisen: zusammenrechnen, Rückgeld, Preis pro Kilo, Rabatt, Mehrwertsteuer herausrechnen und Dreisatz. Ohne Zeitdruck, nach jeder Aufgabe steht der Rechenweg da.</div>
        <div><strong>Prüfung auswerten:</strong> Nach einer Prüfung oder Prüfungs-Simulation zeigt die App, wie gut du in jedem Thema warst (Warenkunde, Verkauf, Hygiene und Recht, Rechnen, Arbeit und Wirtschaft). Mit „Hier noch üben“ übst du genau die Themen, die noch wackeln.</div>
      </>, 3)}
      {box(boxIcon(ICON.flag), 'Zum Abschalten', <><div>Ganz unten auf der Spiele-Seite gibt es sechs Spiele, um zwischendurch den Kopf frei zu bekommen: <strong>Teigi-Lauf</strong> (tippen zum Springen, Körner sammeln), <strong>Backstuben-Chaos</strong> (Teig in den Ofen, rechtzeitig raus, Kunden bedienen), <strong>Lieferwagen-Tour</strong> (Spur wechseln, ausweichen, Filialen beliefern), <strong>Schädlinge abwehren</strong> (Fallen stellen, damit Mäuse und Motten nicht ins Mehllager kommen), <strong>Teig-Schleuder</strong> (zielen und Backformen füllen) und <strong>Brot-Stapler</strong> (Brote möglichst hoch stapeln).</div><div>Hier gibt es keine Punkte für die Bestenliste, nur deinen eigenen Rekord und eine kleine Bestenliste pro Spiel. Ab und zu kommt eine leichte Bonus-Frage, die du auch überspringen kannst.</div><div>Für jedes Spiel gibt es <strong>Medaillen</strong> (Bronze, Silber, Gold), sie stehen auf der Spiele-Karte. Im Spiel zeigt „Nächstes Ziel“, welchen Kollegen du als Nächstes überholen kannst. Oben in der Mitte ist der <strong>Pause-Knopf</strong>. Mit „Gemütlich spielen“ geht alles langsamer und ohne Zeitdruck, das zählt dann aber nicht für den Rekord. Teigi trägt im Spiel deinen Hut und dein Glas aus dem Laden, das Handy brummt kurz bei Treffern. Extras: im Teigi-Lauf Körner-Magnet und Schutzschild, im Backstuben-Chaos nach jedem Tag eine Verbesserung zur Wahl (zum Beispiel ein vierter Ofen), in der Lieferwagen-Tour wechseln Tageszeit und Wetter, in der Teig-Schleuder kannst du über „Level“ jedes freigespielte Level nochmal spielen, ab Level 11 mit wackelndem Blech und Ventilator.</div><div><strong>Tagesaufgabe:</strong> Jeden Tag gibt es eine kleine Aufgabe für eines der Spiele (für alle gleich), sie steht auf der Startkarte. Geschafft zählt sie für Sticker im Stickerheft. <strong>Goldstück:</strong> Ganz selten taucht in einer Runde etwas Goldenes auf, zum Beispiel ein Goldkorn im Teigi-Lauf. Wer es fängt, bekommt eine Sache für Teigi, die es nicht im Laden gibt (Stirnband, Brezel-Haarreif, Fahrermütze, Ritterhelm, Fliegerbrille, Bauhelm), anziehen im Laden unter „Teigi“. <strong>Geister-Lauf:</strong> Im Teigi-Lauf und beim Brot-Stapler läuft dein bester Versuch als blasser Schatten mit. <strong>Herausfordern:</strong> Nach einer Runde schickst du Kollegen mit „Kollegen herausfordern“ eine Nachricht mit deinen Punkten, sie öffnen das Spiel mit „Herausforderung annehmen“. Je nach Jahreszeit schneit es, hängt eine Lichterkette, fliegt Konfetti oder scheint die Sonne.</div></>, 6)}
      {box(boxIcon(ICON.flame), 'Ofen-Kette', <>
        <div>Unter Spielen → „Ofen-Kette“ fallen Teile aus Produktfotos in den Ofen. Schieben, drehen, fallen lassen: mit den Knöpfen oder am Spielfeld (wischen schiebt, tippen dreht, schnell nach unten wischen lässt fallen).</div>
        <div><strong>Goldbraun:</strong> 4 gleiche Produkte nebeneinander verschwinden, ihr Name leuchtet kurz auf. Eine volle Reihe ist fertig gebacken. Was nachrutscht, kann eine Kette auslösen, die zählt mehrfach.</div>
        <div><strong>Bestellung:</strong> Oben steht nur der Name, zum Beispiel „6× Laugenbrezel“. Erkennst du das Produkt am Foto und backst es weg, zählt es doppelt. Du hast 60 Sekunden.</div>
        <div><strong>Allergen-Frage:</strong> Ein Bild mit rotem Rand fragt, was drin ist. Antworte, bevor das Teil landet. <strong>Goldenes Brötchen:</strong> Es backt alle gleichen Produkte weg, auf denen es landet. <strong>Verbrannt:</strong> Bleibt ein Bild zu lange liegen, wird es dunkel. Dann holt es nur noch eine volle Reihe raus.</div>
        <div><strong>Name vergessen?</strong> Finger auf ein Bild halten. <strong>Ablage:</strong> Antippen legt das fallende Teil zur Seite, nochmal antippen holt es zurück.</div>
        <div>Jeden Tag kommen andere Produkte in den Ofen. Mittwochs und samstags ist <strong>Gruppen-Tag</strong>: Dann zählen alle Produkte einer Gruppe als gleich, zum Beispiel alle Brötchen. <strong>Ruhig backen</strong> geht ohne Zeit und ohne Bestellung, zählt aber nur halb. Pro Runde gibt es höchstens 250 Punkte (vor dem Bonus ×1,5). Am Ende kommt ein Kassenbon mit allem, was du gebacken hast.</div>
      </>, 3)}
      {box(boxIcon(ICON.cap), 'Ausbildung (für Azubis)', <>
        <div><strong>Ausbildungsplan:</strong> Trag einmal ein, wann deine Ausbildung begonnen hat. Dann weiß die App dein Lehrjahr von selbst. Hake ab, was du kannst. Der Ausbilder bestätigt es, dann wird der Punkt grün. Unter vielen Punkten gibt es „Üben“: ein Quiz nur zu diesem Thema oder das passende Spiel.</div>
        <div><strong>Berichtsheft:</strong> Unter „Notizen der Woche“ notierst du, was du gemacht hast. Alles wird gespeichert, du kannst später zurückblättern und es ins Heft abschreiben. Die App zeigt auch, was du in der Woche in der Lern-Theke geübt hast, mit einem Tipp übernimmst du es in deine Notizen.</div>
        <div><strong>Wochenziel und Fragen:</strong> Setz dir jede Woche ein Ziel, in der nächsten Woche fragt die App, ob du es geschafft hast. Mit „Frage an den Ausbilder“ fragst du etwas, das nur er sieht. Seine Antwort steht dann dort. „Quiz zu meinem Lehrjahr“ mischt Fragen zu allem, was in deinem Lehrjahr dran ist. In den Sommerferien gibt es einen Rückblick auf dein Lehrjahr.</div>
        <div><strong>Berufsschule: Lernkarten:</strong> Fachbegriffe aus Warenkunde, Verkauf, Hygiene und Recht, Rechnen und Ausbildung als Karteikarten mit Lernkasten. Mit „Eigene Karte schreiben“ legst du Karten aus dem Unterricht an. Der Ausbilder bestätigt sie, danach lernen alle Azubis damit.</div>
      </>, 3)}
      {box(boxIcon(ICON.calendar), 'Urlaub', <div>Im Menü unter „Urlaub“ trägst du freiwillig ein, wann du im Urlaub bist. In der Zeit reißt deine Lern-Serie nicht, es wird kein Serien-Schutz verbraucht und Teigi wird nicht schlapp. Höchstens 6 Wochen im Jahr. Bist du früher zurück, tippst du auf „Ich bin schon zurück“. Der Ausbilder sieht nur, dass du im Urlaub bist.</div>, 3)}
      {box(boxIcon(ICON.bell), 'Für den Ausbilder: Zu erledigen', <div>Der Ausbilder sieht oben im Ausbilder-Bereich alles, was auf ihn wartet: Fehler-Meldungen, Kundenfragen, Ideen, Verkaufstipps und Sprüche zur Freigabe, anonymes Lob, neue Kundenstimmen, Antworten auf Nachrichten, Fragen und Lernkarten der Azubis und die Sicherung. Eine rote Zahl am Knopf „Ausbilder“ zeigt, wie viel offen ist, und beim Öffnen der App kommt eine Meldung, wenn etwas Neues dazugekommen ist.</div>, 3)}
      {box(boxIcon(ICON.flag), 'Für den Ausbilder: Start-Übersicht, Rückblick und Sortiment', <><div><strong>Start-Übersicht</strong> (Ausbilder → Mitarbeiter, ganz oben): Wer hat sich schon angemeldet, eine Rolle gewählt, die Einführung gesehen, eine PIN festgelegt, die App aufs Handy geholt und schon gelernt? Wer noch nicht richtig losgelegt hat, steht oben.</div><div><strong>Rückblick auf letzte Woche:</strong> Ab Montag steht oben im Ausbilder-Bereich, wie viele gelernt haben, wie viele Punkte zusammenkamen, wer am fleißigsten war, wer neu dabei ist und wer nicht gelernt hat. „Gelesen“ blendet ihn bis zur nächsten Woche aus, unter Auswertung steht er immer. Mit „Rückblick kopieren“ geht er schnell in WhatsApp oder die Teambesprechung.</div><div><strong>Nicht mehr im Sortiment</strong> (Ausbilder → Inhalte): Fällt ein Produkt weg, nimmst du es dort heraus. Dann verschwinden sein Steckbrief, seine Quizfragen und es kommt in keinem Spiel mehr dran. Kommt es zurück, holst du es mit einem Tipp wieder rein.</div><div><strong>Neustart der Bestenliste</strong> (Ausbilder → Einstellungen): Für den echten Start nach der Testphase. In der Bestenliste fangen alle bei 0 an, Stufe, Trinkgeld und Lernstand bleiben. Gelöscht wird nichts, der Neustart lässt sich zurücknehmen.</div></>, 3)}
      {box(boxIcon(ICON.lock), 'Was die App speichert', <>
        <div>Die Lern-Theke speichert deinen Namen, deine Punkte, deinen Lernstand (welche Fragen du richtig oder falsch hattest und welche falsche Antwort du gewählt hast), Abzeichen, Trinkgeld und was du selbst einträgst, zum Beispiel Notizen, Ideen oder Lob. Dein Geburtstag ist freiwillig.</div>
        <div>Der Ausbilder sieht deinen Lernstand, damit er dir gezielt helfen kann. Bei falschen Antworten sieht er auch, was du gewählt hast. So kann er erklären, wo die Verwechslung liegt. Außerdem zählt die App, wie oft Seiten und Spiele geöffnet werden. Der Ausbilder sieht davon nur die Summe für das ganze Team, ohne Namen. So weiß er, was ihr wirklich nutzt.</div>
        <div>Der Ausbilder sichert die Daten regelmäßig, damit nichts verloren geht.</div>
      </>, 4)}
      {box(boxIcon(ICON.globe), 'Ohne Internet', <><div>Die Lern-Theke geht auch ohne Internet auf, zum Beispiel im Keller oder bei schlechtem Empfang. Punkte werden gespeichert und hochgeladen, sobald du wieder Netz hast. Solange steht oben neben deinen Punkten ein kleines „Offline“ (am Handy ein orangener Punkt). Antippen erklärt es.</div><div><strong>Fotos fürs Handy:</strong> Im Menü unter „Für ohne Internet laden“ holst du dir alle Produktfotos aufs Handy (etwa 45 MB, am besten im WLAN). Dann zeigen Steckbriefe und Spiele auch ohne Netz Fotos. Die natürlichen Stimmen brauchen weiter Internet, ohne Netz liest die Handy-Stimme vor.</div></>, 15)}
      {box(boxIcon(ICON.phone), 'App aufs Handy und größere Schrift', <><div>So legst du die Lern-Theke wie eine App auf dein Handy oder Tablet. Sie bekommt dann ein eigenes Hinkel-Symbol auf dem Startbildschirm. Im Menü (oben rechts, drei Striche) machst du mit „Größere Schrift“ alles größer.</div><button onClick={onInstall} style={{ ...btnSecondary, alignSelf: 'flex-start' }}>Anleitung zeigen</button></>, 11)}
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
