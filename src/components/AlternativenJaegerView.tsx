import { useState, useEffect, useRef, useMemo } from 'react';
import { dc, ALT_MAP } from '../daten/data';
import { focusShuffle, noteResult } from '../focus';
import { GameProgress, AnswerFx, AnswerFxState } from '../ui/antwortFx';
import { useFeedbackState, ConfettiOverlay, TH, cardStyle, PageHead, StatChip, GameIntro, GameResult } from '../ui/basis';
import { ReportContext } from '../ui/melden';
import { scrollToPlay } from '../ui/belohnungen';
import { LearnHint, OnLearn, OnlyNewToggle, KnownMap, OnKnown, SpeakButton } from '../games/spielBasis';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { fixedAltProducts } from '../utils';


interface ScenarioOption {
  text: string;
  isBest: boolean;
  explanation: string;
}

interface Scenario {
  missing: string;
  customerWish: string;
  options: ScenarioOption[];
}

const HAND_SCENARIOS: Scenario[] = [
  {
    missing: "Münsterländer",
    customerWish: "„Ich hätte gerne das Münsterländer, schön mild, das mögen meine Kinder.“",
    options: [
      { text: "Das Schweizer empfehlen", isBest: true, explanation: "Volltreffer! Gleicher Teig: 60 % Weizen, 40 % Roggen mit Quark, genauso mild." },
      { text: "Das Spezialbrot empfehlen", isBest: false, explanation: "Das Spezialbrot ist doppelt gebacken und kräftig, das Gegenteil von mild." },
      { text: "Das Vollkornschwarzbrot anbieten", isBest: false, explanation: "Schwarzbrot aus 100 % Roggenschrot ist herzhaft und kräftig, nicht mild." },
      { text: "Sagen, dass es heute nichts mehr gibt, und den Kunden gehen lassen", isBest: false, explanation: "Unfreundlich! An der Theke bieten wir immer aktiv eine passende Alternative an." }
    ]
  },
  {
    missing: "Reines Roggen",
    customerWish: "„Ich vertrage keine Hefe, haben Sie noch das Reine Roggen?“",
    options: [
      { text: "Den Kartäuser empfehlen", isBest: true, explanation: "Perfekt! Der Kartäuser ist 100 % Roggenvollkorn und wird, wie das Reine Roggen, ganz ohne Hefe gebacken." },
      { text: "Das Buchweizenbrot anbieten", isBest: false, explanation: "Das Buchweizenbrot hat zwar eine glutenfreie Rezeptur, enthält aber Hefe." },
      { text: "Das Kleine Schwarzwälder anbieten", isBest: false, explanation: "Das Schwarzwälder enthält Hefe, für diese Kundin ungeeignet." },
      { text: "Kommentarlos etwas anderes einpacken", isBest: false, explanation: "Niemals einfach etwas anderes einpacken, immer kurz erklären und nachfragen!" }
    ]
  },
  {
    missing: "Weinstock",
    customerWish: "„Einen Weinstock bitte, den tunken wir heute Abend in Olivenöl.“",
    options: [
      { text: "Die Olivenstange empfehlen", isBest: true, explanation: "Super! Die Olivenstange hat denselben Teig wie der Weinstock, dazu schwarze Oliven, ideal zum Dippen." },
      { text: "Das Toastbrot anbieten", isBest: false, explanation: "Toastbrot ist weich und fein, zum Dippen in Olivenöl ungeeignet." },
      { text: "Den Rosinenstuten anbieten", isBest: false, explanation: "Süßer Stuten passt nicht zu Olivenöl und Balsamico." },
      { text: "Sagen, dass es heute nichts mehr gibt, und den Kunden gehen lassen", isBest: false, explanation: "Unfreundlich! An der Theke bieten wir immer aktiv eine passende Alternative an." }
    ]
  },
  {
    missing: "Großes Schwarzwälder",
    customerWish: "„Ein großes Schwarzwälder bitte, wir sind heute viele zum Abendbrot.“",
    options: [
      { text: "Zwei Kleine Schwarzwälder anbieten", isBest: true, explanation: "Klasse! Gleicher Teig (70 % Roggen, 30 % Weizen), zwei kleine à 500 g ersetzen ein großes à 1000 g." },
      { text: "Ein Sternchen anbieten", isBest: false, explanation: "Das Sternchen hat zwar denselben Teig, ist mit 250 g aber viel zu klein für viele Leute." },
      { text: "Das Holzkohlebrot anbieten", isBest: false, explanation: "Ein mildes Weizenbrot, geschmacklich ganz anders als das kräftige Schwarzwälder." },
      { text: "Kommentarlos etwas anderes einpacken", isBest: false, explanation: "Niemals einfach etwas anderes einpacken, immer kurz erklären und nachfragen!" }
    ]
  },
  {
    missing: "Schoko-Croissant",
    customerWish: "„Zwei Schoko-Croissants für unterwegs, bitte!“",
    options: [
      { text: "Butter-Croissants oder Schokomürbchen anbieten", isBest: true, explanation: "Top! Gleicher Croissant-Teig ohne Schokolade, oder ein weiches Mürbchen mit Schokostückchen." },
      { text: "Ein Roggenbrötchen anbieten", isBest: false, explanation: "Herzhaftes Brötchen statt süßem Gebäck, passt nicht zum Wunsch." },
      { text: "Eine Laugenstange anbieten", isBest: false, explanation: "Laugengebäck ist salzig, der Kunde möchte etwas Süßes mit Schokolade." },
      { text: "Sagen, dass es heute nichts mehr gibt, und den Kunden gehen lassen", isBest: false, explanation: "Unfreundlich! An der Theke bieten wir immer aktiv eine passende Alternative an." }
    ]
  },
  {
    missing: "Mohnbrötchen",
    customerWish: "„Vier Mohnbrötchen fürs Frühstück, bitte.“",
    options: [
      { text: "Sesambrötchen empfehlen", isBest: true, explanation: "Genau! Gleiches Spitzbrötchen, nur mit Sesam statt Mohn. Achtung: Sesam ist ein Allergen, kurz nachfragen!" },
      { text: "Hinkelsteine anbieten", isBest: false, explanation: "Hinkelsteine sind kräftige Roggen-Sauerteigbrötchen, ganz anderer Geschmack als ein mildes Weizenbrötchen." },
      { text: "Krautling anbieten", isBest: false, explanation: "Der Krautling enthält Sauerkraut und Kümmel, sehr speziell als Ersatz." },
      { text: "Kommentarlos etwas anderes einpacken", isBest: false, explanation: "Niemals einfach etwas anderes einpacken, immer kurz erklären und nachfragen!" }
    ]
  },
  {
    missing: "Laugenbrezel",
    customerWish: "„Eine Brezel für meinen Sohn, bitte!“",
    options: [
      { text: "Eine Laugenstange anbieten", isBest: true, explanation: "Volltreffer! Gleicher Laugenteig mit Brezelsalz, nur als Stange." },
      { text: "Ein Mohnbrötchen anbieten", isBest: false, explanation: "Kein Laugengebäck, das Kind wollte gezielt Lauge." },
      { text: "Ein Stück Butterkuchen anbieten", isBest: false, explanation: "Süßer Kuchen statt herzhafter Brezel, passt nicht." },
      { text: "Sagen, dass es heute nichts mehr gibt, und den Kunden gehen lassen", isBest: false, explanation: "Unfreundlich! An der Theke bieten wir immer aktiv eine passende Alternative an." }
    ]
  },
  {
    missing: "Burgunderstuten",
    customerWish: "„Es ist Freitag, ich möchte meinen Burgunderstuten!“",
    options: [
      { text: "Den Wunderzopf empfehlen", isBest: true, explanation: "Super gerettet! Auch Brioche mit viel Butter und Ei, dazu karamellisierte Mandeln. Gibt es freitags und samstags." },
      { text: "Den Jan-Wellem Stuten anbieten", isBest: false, explanation: "Den gibt es nur donnerstags, freitags ist er nicht im Regal." },
      { text: "Das Französische Landbrot anbieten", isBest: false, explanation: "Ein Weizenbrot ohne Butter und Ei, kein Ersatz für eine Brioche." },
      { text: "Kommentarlos etwas anderes einpacken", isBest: false, explanation: "Niemals einfach etwas anderes einpacken, immer kurz erklären und nachfragen!" }
    ]
  },
  {
    missing: "Dinkeltraum",
    customerWish: "„Ich esse keinen Weizen, haben Sie noch den Dinkeltraum?“",
    options: [
      { text: "Das Dinkel-Sprösschen empfehlen", isBest: true, explanation: "Perfekt! Auch 100 % Dinkel, ohne Weizen und Roggen." },
      { text: "Das Münsterländer anbieten", isBest: false, explanation: "Enthält 60 % Weizen, für diese Kundin ungeeignet." },
      { text: "Das Mehrkornbrot anbieten", isBest: false, explanation: "Roggenmischbrot mit 30 % Weizen, ungeeignet ohne Weizen." },
      { text: "Sagen, dass es heute nichts mehr gibt, und den Kunden gehen lassen", isBest: false, explanation: "Unfreundlich! An der Theke bieten wir immer aktiv eine passende Alternative an." }
    ]
  },
  {
    missing: "Zeusstange",
    customerWish: "„Ich grille heute, haben Sie noch die Zeusstange mit Feta?“",
    options: [
      { text: "Das Feurige oder die Olivenstange empfehlen", isBest: true, explanation: "Klasse! Beides würzig-mediterran und perfekt zum Grillen." },
      { text: "Den Burgunderstuten anbieten", isBest: false, explanation: "Süße Brioche passt nicht zum Grillabend." },
      { text: "Das Vollkornschwarzbrot anbieten", isBest: false, explanation: "Schwarzbrot ist kein typisches Grillbrot." },
      { text: "Kommentarlos etwas anderes einpacken", isBest: false, explanation: "Niemals einfach etwas anderes einpacken, immer kurz erklären und nachfragen!" }
    ]
  },
  {
    missing: "Vollkornschwarzbrot (Kasten)",
    customerWish: "„Ein Schwarzbrot aus dem Kasten bitte, geschnitten.“",
    options: [
      { text: "Das Große Vollkornschwarzbrot anbieten (5,5 mm geschnitten)", isBest: true, explanation: "Genau richtig! Gleiches Schwarzbrot aus 100 % Roggenschrot, nur freigeschoben statt im Kasten." },
      { text: "Das Feinbrot anbieten", isBest: false, explanation: "Das Feinbrot ist ein mildes Roggenmischbrot, kein Schwarzbrot." },
      { text: "Das Toastbrot anbieten", isBest: false, explanation: "Weißbrot statt Vollkornschwarzbrot, völlig anderer Geschmack." },
      { text: "Sagen, dass es heute nichts mehr gibt, und den Kunden gehen lassen", isBest: false, explanation: "Unfreundlich! An der Theke bieten wir immer aktiv eine passende Alternative an." }
    ]
  },
  {
    missing: "Florentinertaler",
    customerWish: "„Einen großen Florentinertaler zum Kaffee, bitte!“",
    options: [
      { text: "Florentiner (die kleinen Kekse) anbieten", isBest: true, explanation: "Super! Gleiche Mandel-Honig-Masse mit Zartbitter-Boden, nur als kleine Kekse." },
      { text: "Heidesand anbieten", isBest: false, explanation: "Heidesand ist ein Butter-Mürbeteig ohne Mandelkaramell, geschmacklich ganz anders." },
      { text: "Spritzgebäck anbieten", isBest: false, explanation: "Spritzgebäck hat weder Mandeln noch Honigkaramell." },
      { text: "Kommentarlos etwas anderes einpacken", isBest: false, explanation: "Niemals einfach etwas anderes einpacken, immer kurz erklären und nachfragen!" }
    ]
  }
];

// ── Weitere Situationen: aus der Alternativen-Liste des Ausbilders (ALT_MAP in data.ts) ──
// Mehrere Antworten können richtig sein.
type ShopP = (typeof SHOP_PRODUCTS)[number];
const TYPE_NAME: Record<string, string> = { schwarzbrot: 'Vollkornschwarzbrot', roggen: 'Roggenbrot', roggenmisch: 'Roggenmischbrot', weizenmisch: 'Weizenmischbrot', dinkel: 'Dinkelbrot', spezial: 'Spezialbrot', weizen: 'Weizenbrot', stuten: 'Stuten' };
const shopByName = new Map<string, ShopP>(SHOP_PRODUCTS.map(p => [p.name, p]));
const typeText = (p?: ShopP) => (p && p.breadType ? `${TYPE_NAME[p.breadType]}${p.flour ? ` (${p.flour})` : ''}` : (p ? p.group : ''));
const WISHES = [
  (x: string) => `„Ein ${x}, bitte!“`,
  (x: string) => `„Haben Sie noch ${x}? Das nehme ich sonst immer.“`,
  (x: string) => `„Ich bräuchte ${x} für heute.“`,
  (x: string) => `„Ich hätte gern ${x}, meine Familie liebt das.“`,
  (x: string) => `„Ist ${x} noch da? Ich bin extra deswegen gekommen.“`,
];
const pickN = <T,>(arr: T[], n: number) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const list = (names: string[]) => names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} oder ${names[names.length - 1]}`;

// Handgeschriebene Situationen, deren Antworten nicht mehr zur Liste passen, fallen weg
const HAND_OUTDATED = ['Schoko-Croissant', 'Burgunderstuten'];
const HAND_WISH: Record<string, string> = {};
HAND_SCENARIOS.forEach(sc => { HAND_WISH[sc.missing] = sc.customerWish; });

// Wird beim Öffnen neu gebaut, damit Korrekturen des Ausbilders (Admin → Produkt korrigieren) sofort gelten
function buildScenarios(): Scenario[] {
  const changed = fixedAltProducts();
  const HAND_KEEP = HAND_SCENARIOS.filter(sc => !HAND_OUTDATED.includes(sc.missing) && !changed.includes(sc.missing));
  const HAND_MISSING = new Set(HAND_KEEP.map(sc => sc.missing));
  const MAP_SCENARIOS: Scenario[] = Object.keys(ALT_MAP).filter(m => !HAND_MISSING.has(m) && shopByName.has(m) && ALT_MAP[m].some(n => shopByName.has(n))).map((missing, i) => {
  const allowed = ALT_MAP[missing].filter(n => shopByName.has(n));
  const me = shopByName.get(missing)!;
  const right = pickN(allowed, Math.min(2, allowed.length));
  const notAllowed = (p: ShopP) => p.name !== missing && !allowed.includes(p.name);
  let pool = SHOP_PRODUCTS.filter(p => notAllowed(p) && p.group === me.group && (!me.breadType || p.breadType !== me.breadType));
  if (pool.length < 3) pool = SHOP_PRODUCTS.filter(p => notAllowed(p) && p.group === me.group);
  if (pool.length < 3) pool = SHOP_PRODUCTS.filter(notAllowed);
  const wrong = pickN(pool, 4 - right.length);
  const okText = `Für ${missing} passen: ${list(allowed)}.`;
  return {
    missing,
    customerWish: HAND_WISH[missing] || WISHES[i % WISHES.length](missing),
    options: [
      ...right.map(n => ({ text: `${n} empfehlen`, isBest: true, explanation: `Richtig! ${okText}` })),
      ...wrong.map(w => ({ text: `${w.name} empfehlen`, isBest: false, explanation: `${w.name} ist ${me.breadType && w.breadType ? `ein ${typeText(w)}, ganz anders als ${missing}` : `nicht die beste Wahl`}. ${okText}` })),
    ],
  };
});

  return [...HAND_KEEP, ...MAP_SCENARIOS];
}

export function AlternativenJaegerView({ onSaveScore, onLearn, known = {}, onKnown }: { onSaveScore: (score: number, category: string) => void; onLearn?: OnLearn; known?: KnownMap; onKnown?: OnKnown }) {
  const [onlyNew, setOnlyNew] = useState<boolean>(() => { try { return localStorage.getItem('hinkel_only_new_alternativen') !== '0'; } catch { return true; } });
  const toggleOnlyNew = () => setOnlyNew(v => { const n = !v; try { localStorage.setItem('hinkel_only_new_alternativen', n ? '1' : '0'); } catch {} return n; });
  const SCENARIOS = useMemo(() => buildScenarios(), []);
  const knownAlt = known.alternativen || [];
  const altDone = SCENARIOS.filter(sc => knownAlt.includes(sc.missing)).length;
  const altLeft = SCENARIOS.length - altDone;
  const [learned, setLearned] = useState(0);
  const [learnedNow, setLearnedNow] = useState(false);
  const [alreadyNow, setAlreadyNow] = useState(false);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledScenarios, setShuffledScenarios] = useState<Scenario[]>([]);
  const [fx, setFx] = useState<AnswerFxState>(null);
  const [run, setRun] = useState(0);
  const timerRef = useRef<any>(null);
  const savedRef = useRef(false);
  const { feedback, triggerFeedback } = useFeedbackState(350);

  // Sekundentakt pro Szenario
  useEffect(() => {
    if (gameState === 'playing' && !isAnswered) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameState, currentIndex, isAnswered]);

  // Zeit abgelaufen → zählt als falsch (außerhalb des Timers, damit es nur einmal passiert)
  useEffect(() => {
    if (gameState === 'playing' && !isAnswered && timeLeft === 0) handleChoice(-1);
  }, [timeLeft, gameState, isAnswered]);

  const startTraining = (count = 6) => {
    // 6 zufällige Szenarien pro Runde auswählen und die Antwortoptionen jedes Mal neu mischen
    const source = onlyNew && altLeft > 0 ? SCENARIOS.filter(sc => !knownAlt.includes(sc.missing)) : SCENARIOS;
    const picked = focusShuffle(source, sc => sc.missing, count)
      .slice(0, count)
      .map(scen => ({
        ...scen,
        options: [...scen.options].sort(() => 0.5 - Math.random())
      }));

    savedRef.current = false;
    setLearned(0);
    setLearnedNow(false);
    setFx(null);
    setRun(0);
    setTimeLeft(20);
    setShuffledScenarios(picked);
    setCurrentIndex(0);
    setScore(0);
    setGameState('playing'); scrollToPlay();
    setSelectedOpt(null);
    setIsAnswered(false);
  };

  const handleChoice = (optIdx: number) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    setSelectedOpt(optIdx);
    setIsAnswered(true);

    const currentScen = shuffledScenarios[currentIndex];
    const chosen = optIdx >= 0 ? currentScen.options[optIdx] : null;
    let earned = 0;

    if (chosen && chosen.isBest) {
      earned = 30 + (timeLeft * 2);
      setScore(prev => prev + earned);
      triggerFeedback('correct');
    } else {
      triggerFeedback('wrong');
    }
    const ok = !!(chosen && chosen.isBest);
    noteResult(currentScen.missing, ok);
    const n = ok && onLearn ? onLearn([{ product: currentScen.missing, kind: 'alternative' }]) : 0;
    if (ok) onKnown?.('alternativen', [currentScen.missing]);
    setLearnedNow(n > 0); setAlreadyNow(n === 0);
    if (n > 0) setLearned(v => v + n);
    const nr = ok ? run + 1 : 0;
    setRun(nr);
    setFx({ k: Date.now(), ok, text: ok ? `🤝 +${earned} Punkte` : optIdx < 0 ? '⏱️ Zeit um' : '✗ Nicht die beste Wahl', streak: nr, pts: ok ? earned : undefined });

    setTimeout(() => {
      if (currentIndex + 1 < shuffledScenarios.length) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(20);
        setSelectedOpt(null);
        setIsAnswered(false);
      } else {
        setGameState('result');
        const finalScore = score + (chosen?.isBest ? earned : 0);
        if (finalScore > 0 && !savedRef.current) {
          savedRef.current = true;
          onSaveScore(finalScore, 'Alternativen-Jäger 🤝');
        }
      }
    }, 2400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', position: 'relative' }}>
      <ConfettiOverlay active={gameState === 'result'} />
      <PageHead title="Alternativen-Jäger" subtitle={`Ein Artikel ist ausverkauft! Finde in ${SCENARIOS.length} echten Hinkel-Situationen die beste Empfehlung für den Kunden.`} />

      {gameState === 'menu' && (
        <GameIntro
          title="Bereit für die Beratung?"
          text="Pro Runde kommen 6 Kunden. Du hast jeweils 20 Sekunden, um die passendste Alternative zu wählen. Je schneller, desto mehr Punkte."
          startLabel="6er-Runde starten"
          onStart={() => startTraining(6)}
        />
      )}
      {gameState === 'menu' && <OnlyNewToggle on={onlyNew} onToggle={toggleOnlyNew} label="Nur neue Situationen" done={altDone} total={SCENARIOS.length} unit="Situationen" />}
      {gameState === 'menu' && (onlyNew ? altLeft : SCENARIOS.length) > 6 && (
        <button onClick={() => startTraining(99)} style={{ minHeight: '58px', padding: '0 26px', borderRadius: '16px', border: `2px solid ${TH.brown}`, backgroundColor: TH.white, color: TH.ink, fontSize: '19px', fontWeight: 700, cursor: 'pointer' }}>
          Alle {onlyNew ? altLeft : SCENARIOS.length} Situationen am Stück
        </button>
      )}
      {gameState === 'menu' && onlyNew && altLeft === 0 && <div style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '17px', fontWeight: 700 }}>Alle Situationen geschafft! Mit „Nur neue Situationen“ aus kannst du alles wiederholen.</div>}
      {gameState === 'menu' && onLearn && <LearnHint text="Jede beste Empfehlung hakt die passende Frage „… ist ausverkauft, welche Alternative empfiehlst du?“ im Bereich „Service & Verkauf“ ab." />}

      {gameState === 'playing' && shuffledScenarios.length > 0 && (() => {
        const scen = shuffledScenarios[currentIndex];
        return (
          <>
            <GameProgress label="Kunde" index={currentIndex} answered={isAnswered} total={shuffledScenarios.length} />
            <ReportContext report={{ game: 'Alternativen-Jäger', product: scen.missing, text: `${scen.missing} ist ausverkauft. ${scen.customerWish}`, detail: `Richtig laut App: ${scen.options.filter(o => o.isBest).map(o => o.text.replace(/ (empfehlen|anbieten)$/, '')).join(', ')}\nFalsch laut App: ${scen.options.filter(o => !o.isBest).map(o => o.text.replace(/ (empfehlen|anbieten)$/, '')).join(', ')}` }} />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <StatChip label="Kunde" value={`${currentIndex + 1} / ${shuffledScenarios.length}`} />
              <StatChip label="Zeit" value={`${timeLeft} s`} tone={timeLeft <= 5 ? 'warn' : 'yellow'} />
              <StatChip label="Punkte" value={score} />
            </div>
            <div key={currentIndex} className="lt-pop-in" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', border: `3px solid ${feedback === 'correct' ? TH.green : feedback === 'wrong' ? TH.red : TH.line}` }}>
              <AnswerFx fx={isAnswered ? fx : null} />
              <div style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: '12px', backgroundColor: TH.tintPeach, color: TH.red, fontSize: '17px', fontWeight: 700 }}>Ausverkauft: {scen.missing}</div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.3 }}>{scen.customerWish}</div>
                <SpeakButton small text={isAnswered ? `${selectedOpt !== null && selectedOpt >= 0 ? scen.options[selectedOpt].explanation : (scen.options.find(o => o.isBest)?.explanation || '')}` : `${scen.missing} ist ausverkauft. Der Kunde sagt: ${scen.customerWish} ${scen.options.map((o, i) => `${i + 1}: ${o.text}`).join('. ')}`} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scen.options.map((opt, idx) => {
                  let bg = TH.cream;
                  let border = TH.line;
                  let tag = '';
                  if (isAnswered) {
                    if (opt.isBest) { bg = TH.tintSage; border = TH.green; tag = 'beste Wahl'; }
                    else if (idx === selectedOpt) { bg = TH.tintPeach; border = TH.red; tag = 'nicht ideal'; }
                    else { bg = TH.white; }
                  }
                  return (
                    <button key={idx} className={isAnswered ? (opt.isBest ? 'lt-correct' : idx === selectedOpt ? 'lt-wrong' : undefined) : undefined} onClick={() => handleChoice(idx)} disabled={isAnswered} style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '62px', padding: '12px 16px', borderRadius: '16px', border: `3px solid ${border}`, backgroundColor: bg, color: TH.ink, fontSize: '19px', lineHeight: 1.35, textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer' }}>
                      <span style={{ flex: '0 0 38px', height: '38px', borderRadius: '50%', backgroundColor: TH.white, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxSizing: 'border-box' }}>{String.fromCharCode(65 + idx)}</span>
                      <span style={{ flex: 1 }}>{opt.text}</span>
                      {tag && <span style={{ fontWeight: 700, fontSize: '16px', color: opt.isBest ? TH.green : TH.red, whiteSpace: 'nowrap' }}>{tag}</span>}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div style={{ padding: '16px 18px', borderRadius: '16px', backgroundColor: TH.tintYellow, fontSize: '18px', lineHeight: 1.5 }}>
                  <strong>Beratungstipp: </strong>
                  {selectedOpt !== null && selectedOpt >= 0 ? scen.options[selectedOpt].explanation : `Zeit abgelaufen. ${scen.options.find(o => o.isBest)?.explanation || ''}`}
                  {learnedNow && <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 700, color: dc('#2F4F8A') }}>📚 Die Quizfrage „{scen.missing} ist ausverkauft“ ist jetzt in deinem Lernbereich abgehakt.</div>}
                  {alreadyNow && selectedOpt !== null && selectedOpt >= 0 && scen.options[selectedOpt].isBest && onLearn && <div style={{ marginTop: '8px', fontSize: '15px', color: dc('#2F4F8A') }}>📚 Diese Quizfrage hattest du schon gemeistert.</div>}
                </div>
              )}
            </div>
          </>
        );
      })()}

      {gameState === 'result' && (
        <GameResult
          title="Verkaufstraining beendet"
          big={`${score} Punkte`}
          text="Stark beraten! Je schneller die richtige Empfehlung, desto mehr Punkte."
          reward={[score > 0 ? 'Punkte in der Bestenliste gespeichert' : '', learned > 0 ? `📚 ${learned} ${learned === 1 ? 'Frage' : 'Fragen'} im Lernbereich abgehakt` : ''].filter(Boolean).join(' · ') || null}
          againLabel="Neue 6er-Runde"
          onAgain={() => startTraining(6)}
        />
      )}
    </div>
  );
}

export default AlternativenJaegerView;