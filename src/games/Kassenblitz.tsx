// ═══ Spiel: Kassenblitz ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils';
import { SHOP_PRODUCTS } from '../shopProducts';
import { TH, cardStyle, PageHead, StatChip, GameIntro, GameResult, AnswerFx, AnswerFxState, ReportList, ReportContext, scrollToPlay } from '../components/minigameUtils';

/** Artikel mit festem Stückpreis aus dem Shop (in Cent), ohne „ab …“-Preise und sehr teure Artikel */
export const kassenArtikel = () => SHOP_PRODUCTS
  .filter(p => p.price && !p.price.startsWith('ab') && !p.price.includes('('))
  .map(p => {
    const m = (p.price || '').match(/(\d+),(\d\d)/);
    return { name: p.name, cents: m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 0, small: p.group === 'Brötchen' || p.group === 'Feingebäck' };
  })
  .filter(a => a.cents > 0 && a.cents <= 1500);

export type KassenPosten = { name: string; qty: number; cents: number };

export const euro = (cents: number) => (cents / 100).toFixed(2).replace('.', ',') + ' €';

export function KassenblitzView({ onSaveScore }: { onSaveScore: (points: number, category: string) => void }) {
  const [kbState, setKbState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [kbTotal, setKbTotal] = useState<number>(0);
  const [kbGiven, setKbGiven] = useState<number>(0);
  const [kbOptions, setKbOptions] = useState<number[]>([]);
  const [kbBasket, setKbBasket] = useState<KassenPosten[]>([]);
  const [kbCorrectAns, setKbCorrectAns] = useState<number>(0);
  const [kbScore, setKbScore] = useState<number>(0);
  const [kbStreak, setKbStreak] = useState<number>(0);
  const [kbTimer, setKbTimer] = useState<number>(45);
  const [kbFx, setKbFx] = useState<AnswerFxState>(null);
  const [kbHistory, setKbHistory] = useState<{ basket: KassenPosten[]; total: number; given: number; right: number }[]>([]);
  // Aktuelle Werte für den Timer, so muss der Timer nach jeder Antwort nicht neu gestartet werden
  const kbScoreRef = useRef(0);
  // Falsche Antwort: kurz anhalten und zeigen, wie das Rückgeld richtig gerechnet wird (die Zeit läuft solange nicht weiter)
  const [kbMiss, setKbMiss] = useState<{ chosen: number; right: number; given: number; total: number } | null>(null);
  const kbMissRef = useRef(false);
  const kbMissTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(kbMissTimerRef.current), []);
  const onSaveScoreRef = useRef(onSaveScore);
  useEffect(() => { onSaveScoreRef.current = onSaveScore; }, [onSaveScore]);

  // Sekundentakt: läuft genau einmal pro Spiel
  useEffect(() => {
    if (kbState !== 'playing') return;
    const timer = window.setInterval(() => setKbTimer((prev) => (kbMissRef.current ? prev : Math.max(0, prev - 1))), 1000);
    return () => window.clearInterval(timer);
  }, [kbState]);

  // Zeit um → Ergebnis zeigen und Punkte genau einmal speichern
  useEffect(() => {
    if (kbState === 'playing' && kbTimer === 0) {
      setKbState('result');
      if (kbScoreRef.current >= 3) {
        onSaveScoreRef.current(kbScoreRef.current * 5, 'Kassenblitz ⚡');
      }
    }
  }, [kbState, kbTimer]);

  const generateKassenblitzRound = () => {
    // 1–3 verschiedene echte Artikel, Brötchen & Feingebäck auch mehrfach
    const count = 1 + Math.floor(Math.random() * 3);
    const picked = shuffleArray(kassenArtikel()).slice(0, count);
    const basket: KassenPosten[] = picked.map(a => ({ name: a.name, cents: a.cents, qty: a.small ? 1 + Math.floor(Math.random() * 4) : 1 }));
    const totalCents = basket.reduce((sum, b) => sum + b.cents * b.qty, 0);

    // Kunde zahlt mit dem nächsten passenden Schein, manchmal mit „krummem“ Betrag, damit das Wechselgeld glatt wird
    const notes = [500, 1000, 2000, 5000];
    let givenCents = notes.find(n => n > totalCents) || Math.ceil(totalCents / 1000) * 1000 + 1000;
    if (Math.random() > 0.65) {
      const rest = totalCents % 100;
      givenCents = rest === 0 ? totalCents + 100 : totalCents - rest + 100 + (Math.random() > 0.5 ? (rest > 50 ? 0 : 50) : 0);
      if (givenCents <= totalCents) givenCents = Math.ceil(totalCents / 100) * 100 + 100;
    }

    const correctCents = givenCents - totalCents;
    const opts = [correctCents];
    const tweaks = [-100, 100, -50, 50, -10, 10, -20, 20, -500, 500, -5, 5];
    for (const t of shuffleArray(tweaks)) {
      if (opts.length >= 4) break;
      const fake = correctCents + t;
      if (fake > 0 && !opts.includes(fake)) opts.push(fake);
    }
    setKbBasket(basket);
    setKbTotal(totalCents / 100);
    setKbGiven(givenCents / 100);
    setKbCorrectAns(correctCents / 100);
    setKbOptions(shuffleArray(opts.map(c => c / 100)));
  };

  const startKassenblitz = () => {
    kbScoreRef.current = 0;
    window.clearTimeout(kbMissTimerRef.current); kbMissRef.current = false; setKbMiss(null);
    setKbHistory([]);
    setKbFx(null);
    setKbScore(0);
    setKbStreak(0);
    setKbTimer(45);
    setKbState('playing'); scrollToPlay();
    generateKassenblitzRound();
  };

  const nextAfterMiss = () => {
    window.clearTimeout(kbMissTimerRef.current);
    kbMissRef.current = false; setKbMiss(null);
    generateKassenblitzRound();
  };

  const handleKassenblitzAnswer = (chosenOpt: number) => {
    if (kbState !== 'playing' || kbMissRef.current) return;
    const isCorrect = Math.abs(chosenOpt - kbCorrectAns) < 0.001;
    setKbHistory(h => [...h, { basket: kbBasket, total: kbTotal, given: kbGiven, right: kbCorrectAns }]);
    if (isCorrect) {
      kbScoreRef.current += 1;
      setKbScore(prev => prev + 1);
      setKbStreak(prev => prev + 1);
    } else {
      setKbStreak(0);
    }
    setKbFx({ k: Date.now(), ok: isCorrect, text: isCorrect ? '💶 Stimmt!' : '✗ Daneben', streak: isCorrect ? kbStreak + 1 : 0 });
    if (isCorrect) { generateKassenblitzRound(); return; }
    kbMissRef.current = true;
    setKbMiss({ chosen: chosenOpt, right: kbCorrectAns, given: kbGiven, total: kbTotal });
    kbMissTimerRef.current = window.setTimeout(nextAfterMiss, 2600);
  };

  const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <PageHead title="Kassenblitz" subtitle="Echte Hinkel-Artikel, echte Preise: Wie viel Rückgeld bekommt der Kunde? Schaffe so viele Kunden wie möglich in 45 Sekunden." />

      {kbState === 'menu' && (
        <GameIntro
          title="Bereit für die Kasse?"
          text="Du siehst einen Einkauf und den Betrag, den der Kunde gibt. Tippe so schnell wie möglich auf das richtige Rückgeld."
          hint="Ab 3 richtigen Kunden gibt es Punkte für die Bestenliste."
          startLabel="Kassenblitz starten (45 Sek.)"
          onStart={startKassenblitz}
        />
      )}

      {kbState === 'playing' && (
        <>
          <ReportContext report={{ game: 'Kassenblitz', product: kbBasket[0]?.name, text: `${kbBasket.map(b => `${b.qty} × ${b.name} (${euro(b.cents)})`).join(', ')}, zu zahlen ${fmt(kbTotal)}, Kunde gibt ${fmt(kbGiven)}`, detail: `Rückgeld laut App: ${fmt(kbCorrectAns)}` }} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatChip label="Richtig" value={kbScore} />
            {(() => { const f = kbTimer / 45; const col = kbTimer <= 10 ? '#C0392B' : kbTimer <= 20 ? '#E07B00' : '#C9971C'; const R = 26, C = 2 * Math.PI * R; return (
              <div role="timer" aria-label={`Noch ${kbTimer} Sekunden`} className={kbTimer <= 10 ? 'lt-wrong' : undefined} key={kbTimer <= 10 ? kbTimer : 'r'} style={{ position: 'relative', width: '64px', height: '64px', flex: '0 0 auto' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(75,42,20,.13)" strokeWidth="7" />
                  <circle cx="32" cy="32" r={R} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - f)} style={{ transition: 'stroke-dashoffset 1s linear, stroke .4s ease' }} />
                </svg>
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '19px', color: kbTimer <= 10 ? col : 'inherit', fontVariantNumeric: 'tabular-nums' }}>{kbTimer}</span>
              </div>
            ); })()}
            <StatChip label="Serie" value={kbStreak} />
          </div>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
            <AnswerFx fx={kbFx} streakIcon="⚡" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 18px', borderRadius: '16px', backgroundColor: TH.cream, border: `1px solid ${TH.line}`, fontSize: '18px' }}>
              {kbBasket.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span>{b.qty} × {b.name}</span>
                  <span style={{ color: TH.muted, whiteSpace: 'nowrap' }}>{b.qty > 1 ? `je ${euro(b.cents)}` : euro(b.cents)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.tintYellow, textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Zu zahlen</div>
                <div style={{ fontFamily: TH.serif, fontSize: '42px', lineHeight: 1.1 }}>{fmt(kbTotal)}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.tintSage, textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Kunde gibt</div>
                <div style={{ fontFamily: TH.serif, fontSize: '42px', lineHeight: 1.1, color: TH.green }}>{fmt(kbGiven)}</div>
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>Wie viel Rückgeld bekommt der Kunde?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {kbOptions.map((opt, idx) => {
                const isRight = !!kbMiss && Math.abs(opt - kbMiss.right) < 0.001;
                const isChosen = !!kbMiss && Math.abs(opt - kbMiss.chosen) < 0.001;
                return (
                  <button key={idx} onClick={() => handleKassenblitzAnswer(opt)} disabled={!!kbMiss} style={{ minHeight: '76px', borderRadius: '18px', border: `3px solid ${isRight ? TH.green : isChosen ? TH.red : TH.line}`, backgroundColor: isRight ? TH.tintSage : isChosen ? TH.tintPeach : TH.white, color: TH.ink, fontFamily: TH.serif, fontSize: '30px', cursor: kbMiss ? 'default' : 'pointer', opacity: kbMiss && !isRight && !isChosen ? 0.45 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    {fmt(opt)}
                    {isChosen && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, color: TH.red }}>Deine Antwort</span>}
                    {isRight && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, color: TH.green }}>Richtig</span>}
                  </button>
                );
              })}
            </div>
            {kbMiss && (
              <div role="status" className="lt-pop-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintYellow, fontSize: '18px', lineHeight: 1.4 }}>
                <span style={{ flex: '1 1 220px' }}>Rückgeld wäre <strong>{fmt(kbMiss.right)}</strong> gewesen: {fmt(kbMiss.given)} − {fmt(kbMiss.total)} = {fmt(kbMiss.right)}. Die Zeit steht so lange.</span>
                <button onClick={nextAfterMiss} style={{ minHeight: '48px', padding: '0 18px', borderRadius: '14px', border: 'none', backgroundColor: TH.ink, color: TH.white, fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>Weiter →</button>
              </div>
            )}
          </div>
        </>
      )}

      {kbState === 'result' && (
        <GameResult
          title="Kassenblitz beendet"
          big={`${kbScore} Kunden`}
          text="in 45 Sekunden richtig abkassiert."
          reward={kbScore >= 3 ? `+${kbScore * 5} Punkte für die Bestenliste` : null}
          celebrate={kbScore >= 8}
          stars={kbScore >= 10 ? 3 : kbScore >= 6 ? 2 : kbScore >= 3 ? 1 : 0}
          againLabel={kbScore >= 3 ? 'Noch eine Runde' : 'Nochmal versuchen, ab 3 Kunden gibt es Punkte'}
          onAgain={startKassenblitz}
        />
      )}
      {kbState === 'result' && <ReportList title="Alle Kunden dieser Runde ansehen (Fehler melden)" items={kbHistory.map(h => {
        const list = h.basket.map(b => `${b.qty} × ${b.name} (${euro(b.cents)})`).join(', ');
        return { label: <span>{list}<br />Zu zahlen {fmt(h.total)} · Kunde gibt {fmt(h.given)} · Rückgeld <strong>{fmt(h.right)}</strong></span>, report: { game: 'Kassenblitz', product: h.basket[0]?.name, text: `${list}\nZu zahlen: ${fmt(h.total)}, Kunde gibt: ${fmt(h.given)}, Rückgeld laut App: ${fmt(h.right)}` } };
      })} />}
    </div>
  );
}
