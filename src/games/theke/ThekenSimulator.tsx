// ═══ Spiel: Theken-Simulator ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, useRef } from 'react';
import { dc } from '../../daten/data';
import { GameProgress, AnswerFx, AnswerFxState } from '../../ui/antwortFx';
import { TH, cardStyle, btnPrimary, PageHead, StatChip, GameIntro, ConfettiOverlay } from '../../ui/basis';
import { ReportLink, ReportContext } from '../../ui/melden';
import { scrollToPlay } from '../../ui/belohnungen';
import { OnLearn, LearnHint, SpeakButton, KnownMap, OnKnown, useOnlyNew, OnlyNewToggle, learnedText } from '../spielBasis';
import { euro } from '../Kassenblitz';
import { SimOpt, Conversation, ChatMsg, pick } from './basis';
import { buildConversation } from './gespraech';

export type ThekeStats = Record<string, { ok: number; bad: number }>;

export type ThekeResult = { topic: string; ok: boolean };

/** Themen sortiert nach Fehlerquote (nur Themen mit mindestens 2 Versuchen) */
export function weakThekeTopics(stats: ThekeStats | undefined, limit = 3) {
  return Object.entries(stats || {})
    .map(([topic, v]) => ({ topic, ok: Number(v?.ok) || 0, bad: Number(v?.bad) || 0 }))
    .filter(t => t.ok + t.bad >= 2)
    .map(t => ({ ...t, rate: t.bad / (t.ok + t.bad) }))
    .sort((a, b) => b.rate - a.rate || b.bad - a.bad)
    .slice(0, limit);
}

export type ThekeReview = { topic: string; ok: boolean; why?: string; better?: string; q?: string; a?: string; product?: string };

/** Lob für die Bewertung am Ende, pro Gesprächsschritt */
export const THEKE_PRAISE: Record<string, string> = {
  'Smalltalk': 'freundlich und persönlich auf den Kunden eingegangen',
  'Großbestellung': 'die große Bestellung sorgfältig gepackt',
  'Taschengeld': 'dem Kind etwas Passendes für sein Taschengeld gezeigt',
  'Englisch sprechen': 'auf Englisch freundlich beraten',
  'Unhöflicher Kunde': 'trotz schlechter Laune des Kunden ruhig und freundlich geblieben',
  'Rabatt verlangen': 'freundlich bei den festen Preisen geblieben',
  'Ware anfassen': 'freundlich auf die Hygiene geachtet',
  'Großer Geldschein': 'den großen Schein geprüft und ans Wechselgeld gedacht',
  'Kunde blockiert die Schlange': 'die Schlange im Blick behalten und höflich gelöst',
  'Begrüßung': 'freundlich begrüßt und nach dem Wunsch gefragt',
  'Allergie': 'bei der Allergie sicher beraten',
  'Vegan': 'die vegane Auswahl richtig empfohlen',
  'Ausverkauft': 'eine passende Alternative angeboten',
  'Zutaten': 'die Zutaten richtig erklärt',
  'Mehl': 'die Mehlsorte richtig genannt',
  'Preis': 'den Preis richtig genannt',
  'Allergene prüfen': 'die Allergene richtig geprüft',
  'Alternative ohne Allergen': 'eine sichere Alternative gefunden',
  'Süßes ohne Nüsse': 'etwas Süßes ohne Nüsse gefunden',
  'Reklamation': 'die Reklamation freundlich und kulant gelöst',
  'Vorbestellung': 'die Bestellung richtig aufgenommen',
  'Anlass-Beratung': 'passend zum Anlass beraten',
  'Preis-Einwand': 'den Preis mit Qualität begründet',
  'Kinder an der Theke': 'an das Mürbchen für das Kind gedacht',
  'Aufbewahrung': 'richtig erklärt, wie man Brot aufbewahrt',
  'Frische-Beratung': 'ein Brot empfohlen, das lange frisch bleibt',
  'Glutenfrei': 'ehrlich zu glutenfrei und möglichen Spuren beraten',
  'Größe beraten': 'die passende Brotgröße gefunden',
  'Eiliger Kunde': 'den eiligen Kunden zügig bedient',
  'Vordrängeln': 'fair und höflich die Reihenfolge eingehalten',
  'Wechselgeld-Reklamation': 'die Wechselgeld-Frage ruhig geklärt',
  'Lob vom Kunden': 'sich herzlich für das Lob bedankt',
  'Kartenzahlung': 'die Kartenzahlung freundlich abgewickelt',
  'Trinkgeld': 'sich für das Trinkgeld bedankt',
  'Schnitt': 'die richtige Schnittstärke gewählt',
  'Zusatzverkauf': 'aktiv nach weiteren Wünschen gefragt',
  'Summe': 'richtig zusammengerechnet',
  'Rückgeld': 'das Rückgeld stimmt',
  'Verabschiedung': 'freundlich verabschiedet',
};

/** Trinkgeldkasse mit Knopf zum Trinkgeld-Laden */
export function TipJar({ balance, onOpenShop, big, todayLeft }: { balance: number; onOpenShop: () => void; big?: boolean; todayLeft?: number }) {
  return (
    <div style={{ ...(big ? cardStyle : {}), display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: big ? 'space-between' : 'center', padding: big ? '18px 22px' : 0, backgroundColor: big ? TH.tintYellow : undefined }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span aria-hidden="true" className="lt-emo-shake" style={{ fontSize: big ? '38px' : '28px' }}>🫙</span>
        <span>
          <span style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: TH.muted }}>Deine Trinkgeldkasse</span>
          <span className="lt-count" style={{ display: 'block', fontFamily: TH.serif, fontSize: big ? '30px' : '24px', lineHeight: 1.1 }}>{euro(balance)}</span>
          {todayLeft !== undefined && <span style={{ display: 'block', fontSize: '14px', color: TH.muted }}>{todayLeft > 0 ? `Heute noch bis ${euro(todayLeft)} möglich` : 'Für heute ist die Kasse voll, morgen geht es weiter'}</span>}
        </span>
      </span>
      <button onClick={onOpenShop} style={{ minHeight: '50px', padding: '0 20px', borderRadius: '14px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>Trinkgeld-Laden</button>
    </div>
  );
}

export function ThekenSimulatorView({ onSaveScore, onTopicResults, topicStats, onLearn, known = {}, onKnown, onTip, tipBalance, onOpenShop, tipTodayLeft }: { onTip?: (cents: number) => void; tipBalance?: number; onOpenShop?: () => void; tipTodayLeft?: number; onSaveScore: (points: number, category: string) => void; onTopicResults?: (results: ThekeResult[]) => void; topicStats?: ThekeStats; onLearn?: OnLearn; known?: KnownMap; onKnown?: OnKnown }) {
  const [onlyNew, toggleOnlyNew] = useOnlyNew('theke');
  const knownTheke = known.theke || [];
  const [learned, setLearned] = useState(0);
  const [tipTotal, setTipTotal] = useState(0);
  const [earnedTip, setEarnedTip] = useState(0);
  const [tipLost, setTipLost] = useState(false);
  const [tipCapped, setTipCapped] = useState(false);
  const tipLostRef = useRef(false);
  const [phase, setPhase] = useState<'menu' | 'chat' | 'done'>('menu');
  const [conv, setConv] = useState<Conversation | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [served, setServed] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const savedRef = useRef(false);
  const resultsRef = useRef<ThekeResult[]>([]);
  const [review, setReview] = useState<ThekeReview[]>([]);
  const [thFx, setThFx] = useState<AnswerFxState>(null);
  const [thRun, setThRun] = useState(0);
  const [focus, setFocus] = useState<string | undefined>(undefined);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy, phase]);

  const startConversation = (focusTopic?: string) => {
    const c = buildConversation(focusTopic, onlyNew ? knownTheke : []);
    setFocus(focusTopic);
    savedRef.current = false;
    resultsRef.current = [];
    setLearned(0);
    setReview([]);
    setThFx(null);
    setThRun(0);
    setEarnedTip(0); setTipLost(false); setTipCapped(false); tipLostRef.current = false;
    setConv(c);
    setStepIdx(0);
    setCorrect(0);
    setMessages(c.steps[0].customer.map(t => ({ from: 'customer' as const, text: t })));
    setBusy(false);
    setPhase('chat'); scrollToPlay();
  };

  const choose = (o: SimOpt) => {
    if (!conv || busy || phase !== 'chat') return;
    const step = conv.steps[stepIdx];
    const right = step.options.find(x => x.correct);
    const add: ChatMsg[] = [{ from: 'seller', text: o.text }];
    if (o.correct) {
      add.push({ from: 'note-ok', text: pick(['Richtig!', 'Sehr gut!', 'Genau so!', 'Perfekt!']) });
      if (step.learn && onLearn) {
        const n = onLearn([step.learn]);
        if (n > 0) { setLearned(v => v + n); add.push({ from: 'note-ok', text: `Frage abgehakt: ${step.topic} von „${step.learn.product}“ zählt jetzt auch in deinem Lernbereich.` }); }
        else if (n === 0) add.push({ from: 'note-ok', text: `${step.topic} von „${step.learn.product}“ hattest du schon gemeistert.` });
      }
    } else {
      add.push({ from: 'note-bad', text: `${o.why || 'Nicht ganz.'}${right ? ` Besser: „${right.text}“` : ''}` });
    }
    setMessages(m => [...m, ...add]);
    resultsRef.current.push({ topic: step.topic, ok: o.correct });
    if (step.tipStep && !o.correct) tipLostRef.current = true;
    setReview(r => [...r, { topic: step.topic, ok: o.correct, why: o.why, better: right && !o.correct ? right.text : undefined, q: step.customer.join(' '), a: right ? right.text : o.text, product: step.learn?.product }]);
    const run = o.correct ? thRun + 1 : 0;
    setThRun(run);
    setThFx({ k: Date.now(), ok: o.correct, text: o.correct ? '💬 +10 Punkte' : '✗ Nicht ganz', streak: run, pts: o.correct ? 10 : undefined });
    const newCorrect = correct + (o.correct ? 1 : 0);
    setCorrect(newCorrect);
    setBusy(true);

    window.setTimeout(() => {
      const next = stepIdx + 1;
      const extra: ChatMsg[] = [];
      if (!o.correct && step.afterWrong) extra.push({ from: 'customer', text: step.afterWrong });
      if (next < conv.steps.length) {
        conv.steps[next].customer.forEach(t => extra.push({ from: 'customer', text: t }));
        setMessages(m => [...m, ...extra]);
        setStepIdx(next);
        setBusy(false);
      } else {
        const total = conv.steps.length;
        // Trinkgeld: nur wenn die Trinkgeld-Antwort gestimmt hat, gute Beratung gibt öfter einen Bonus
        let tip = conv.tipCents && !tipLostRef.current ? conv.tipCents : 0;
        if (!conv.tipCents) {
          const quote = newCorrect / total;
          const bonus = quote === 1 ? (Math.random() < 0.5 ? pick([30, 50, 100]) : 0) : quote >= 0.75 ? (Math.random() < 0.2 ? pick([20, 30]) : 0) : 0;
          if (bonus) { tip = bonus; extra.push({ from: 'customer', text: `(${conv.persona.title} wirft ${euro(bonus)} in die Trinkgelddose. ${pick(['Für die tolle Beratung!', 'Das war richtig gut, danke!', 'So freundlich wird man selten bedient!'])}` }); }
        }
        conv.endLines.forEach(t => extra.push({ from: 'customer', text: t }));
        setMessages(m => [...m, ...extra]);
        setBusy(false);
        setPhase('done');
        setServed(s => s + 1);
        setEarnedTip(tip); setTipLost(!!conv.tipCents && tipLostRef.current); setTipCapped(!!tip && tipTodayLeft !== undefined && tip > tipTodayLeft);
        if (tip) { setTipTotal(t => t + tip); onTip?.(tip); }
        const points = newCorrect * 10 + (newCorrect === total ? 10 : 0);
        if (!savedRef.current) {
          savedRef.current = true;
          if (points > 0) onSaveScore(points, 'Theken-Simulator');
          if (onTopicResults && resultsRef.current.length) onTopicResults([...resultsRef.current]);
          const coreOk = (conv.coreTopics || []).every(t => resultsRef.current.filter(r => r.topic === t).every(r => r.ok));
          if (coreOk && conv.coreKey) onKnown?.('theke', [conv.coreKey]);
        }
      }
    }, o.correct ? 900 : 1600);
  };

  const total = conv ? conv.steps.length : 0;
  const step = conv && phase === 'chat' ? conv.steps[stepIdx] : null;
  const weak = weakThekeTopics(topicStats, 3);

  const topicPanel = (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontFamily: TH.serif, fontSize: '26px' }}>Deine Übungs-Themen</div>
      {weak.length === 0 ? (
        <div style={{ fontSize: '17px', color: TH.muted }}>Nach ein paar Beratungen siehst du hier, welche Themen du noch üben solltest.</div>
      ) : (
        weak.map(w => {
          const sum = w.ok + w.bad;
          const pct = Math.round((w.ok / sum) * 100);
          return (
            <div key={w.topic} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px 14px', borderRadius: '16px', backgroundColor: pct < 60 ? TH.tintPeach : TH.cream }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>{w.topic}</div>
                <div style={{ height: '8px', borderRadius: '999px', backgroundColor: dc('#F4EADB'), overflow: 'hidden', marginTop: '6px' }}><div className="lt-fill" style={{ width: pct + '%', height: '100%', backgroundColor: pct < 60 ? TH.red : TH.green }} /></div>
                <div style={{ fontSize: '15px', color: TH.muted, marginTop: '4px' }}>{w.ok} von {sum} richtig</div>
              </div>
              <button onClick={() => startConversation(w.topic)} style={{ minHeight: '48px', padding: '0 16px', borderRadius: '12px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Gezielt üben</button>
            </div>
          );
        })
      )}
    </div>
  );
  const isPerfect = phase === 'done' && correct === total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      <PageHead title="Theken-Simulator" subtitle="Ein Kunde kommt an die Theke, führe das ganze Verkaufsgespräch: begrüßen, beraten, schneiden, kassieren und verabschieden." />

      {phase === 'menu' && (
        <GameIntro
          title="Bereit für den ersten Kunden?"
          text="Jedes Gespräch ist anders: über 20 Situationen von Allergie und Zöliakie über Reklamation, Vordrängler und eilige Kunden bis zu Kartenzahlung und Trinkgeld. Über 20 verschiedene Kunden, alle Antworten kommen direkt aus unserem Sortiment."
          hint="10 Punkte pro richtiger Antwort, +10 Bonus für eine perfekte Beratung. Gute Beratung bringt öfter Trinkgeld, das bleibt in deiner Trinkgeldkasse."
          startLabel="Ersten Kunden bedienen"
          onStart={() => startConversation()}
        />
      )}
      {phase === 'menu' && <OnlyNewToggle on={onlyNew} onToggle={toggleOnlyNew} label="Nur neue Beratungen" done={knownTheke.length} unit="Beratungen gemeistert" />}
      {phase === 'menu' && onLearn && <LearnHint text="Fragt dich ein Kunde nach Zutaten, Preis oder Mehl oder willst du ein Brot schneiden, wird bei einer richtigen Antwort die passende Frage im Bereich „Sortiment & Warenkunde“ abgehakt, genau so, als hättest du sie im Quiz beantwortet." />}
      {phase === 'menu' && onOpenShop && <TipJar balance={tipBalance || 0} onOpenShop={onOpenShop} big todayLeft={tipTodayLeft} />}
      {phase === 'menu' && topicPanel}

      {phase !== 'menu' && conv && (
        <>
          <GameProgress label="Schritt" index={phase === 'done' ? total : stepIdx} answered={busy} total={total} right={phase === 'done' ? 'Gespräch fertig!' : undefined} />
          {step && <ReportContext report={{ game: 'Theken-Simulator', product: step.learn?.product || conv.steps.find(x => x.learn)?.learn?.product, text: `${step.topic}: ${step.customer.join(' ')}`, detail: `Richtig laut App: „${(step.options.find(o => o.correct) || step.options[0]).text}“` }} />}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ flex: '2 1 240px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '16px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>
              {(() => {
                const last = review[review.length - 1];
                const mood = phase === 'done' ? (isPerfect ? '🤩' : correct >= total - 2 ? '😊' : '😐') : !last ? '🙂' : last.ok ? '😊' : '😕';
                return <span key={`${mood}-${review.length}-${phase}`} className="lt-mood" title="So fühlt sich der Kunde gerade" style={{ flex: '0 0 46px', height: '46px', borderRadius: '50%', backgroundColor: TH.tintBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }} aria-label={`Stimmung: ${mood}`}>{mood}</span>;
              })()}
              <span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '18px' }}>{conv.persona.name}</span>
                <span style={{ display: 'block', fontSize: '15px', color: TH.muted }}>{conv.persona.who}{focus ? ` · Übung: ${focus}` : ''}</span>
              </span>
            </div>
            <StatChip label="Richtig" value={`${correct} / ${total}`} tone="yellow" />
            <StatChip label="Bedient" value={served} />
            {tipTotal > 0 && <StatChip label="Trinkgeld" value={euro(tipTotal)} />}
          </div>

          <div style={{ ...cardStyle, padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: TH.cream, position: 'relative' }}>
            <AnswerFx fx={thFx} streakIcon="⭐" pos="bottom" />
            {messages.map((m, i) => {
              if (m.from === 'note-ok' || m.from === 'note-bad') {
                const ok = m.from === 'note-ok';
                return (
                  <div key={i} className="lt-msg" style={{ alignSelf: 'center', maxWidth: '92%', padding: '8px 14px', borderRadius: '14px', backgroundColor: ok ? TH.tintSage : TH.tintPeach, color: ok ? TH.green : TH.red, fontSize: '16px', fontWeight: 700, lineHeight: 1.45, textAlign: 'center' }}>
                    {ok ? '✓ ' : '✗ '}{m.text}
                  </div>
                );
              }
              const isSeller = m.from === 'seller';
              const isStage = !isSeller && m.text.startsWith('(');
              if (isStage) {
                return <div key={i} className="lt-msg" style={{ alignSelf: 'center', fontSize: '15px', fontStyle: 'italic', color: TH.muted }}>{m.text.replace(/^\(|\)$/g, '')}</div>;
              }
              return (
                <div key={i} className="lt-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: isSeller ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: TH.muted, margin: isSeller ? '0 8px 3px 0' : '0 0 3px 8px' }}>{isSeller ? 'Du' : conv.persona.name}</span>
                  <div style={{ maxWidth: '82%', padding: '12px 16px', borderRadius: isSeller ? '20px 20px 6px 20px' : '20px 20px 20px 6px', backgroundColor: isSeller ? TH.yellow : TH.white, border: isSeller ? 'none' : `2px solid ${TH.line}`, fontSize: '18px', lineHeight: 1.45 }}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            {busy && (
              <div className="lt-msg" style={{ alignSelf: 'flex-start', padding: '10px 16px', borderRadius: '20px', backgroundColor: TH.white, border: `2px solid ${TH.line}`, fontSize: '20px', color: TH.muted }}><span className="lt-dots" aria-label="Kunde antwortet"><span /><span /><span /></span></div>
            )}
            <div ref={endRef} />
          </div>

          {phase === 'chat' && step && !busy && (
            <div key={stepIdx} className="lt-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {step.prices && step.prices.length > 0 && (
                <div className="lt-pop-in" style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintYellow, border: `2px dashed ${TH.brown}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Spickzettel · Preise</div>
                  {step.prices.map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '18px' }}>
                      <span>{b.qty > 1 ? <strong>{b.qty} × </strong> : null}{b.name}</span>
                      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{b.qty > 1 ? 'je ' : ''}{euro(b.cents)}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: '15px', color: TH.muted }}>Die Summe rechnest du selbst aus.</div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Deine Antwort · {step.topic}</div>
                <SpeakButton small text={`${conv.persona.title} sagt: ${step.customer.map(t => t.replace(/^\(|\)$/g, '')).join(' ')}. Deine Antworten: ${step.options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o.text}`).join('. ')}`} />
              </div>
              {step.options.map((o, i) => (
                <button key={i} onClick={() => choose(o)} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '60px', padding: '12px 16px', borderRadius: '16px', border: `3px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '18px', lineHeight: 1.4, textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ flex: '0 0 36px', height: '36px', borderRadius: '50%', border: `2px solid ${TH.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxSizing: 'border-box' }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ flex: 1 }}>{o.text}</span>
                </button>
              ))}
            </div>
          )}

          {phase === 'done' && (
            <div className="lt-pop-in" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <ConfettiOverlay active={isPerfect} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Beratung abgeschlossen</div>
              <div className="lt-count" style={{ fontFamily: TH.serif, fontSize: '56px', lineHeight: 1 }}>{correct} / {total}</div>
              <div style={{ fontSize: '19px', color: TH.brown }}>{isPerfect ? 'Perfekte Beratung, so geht Theke!' : correct >= total - 2 ? 'Gut gemacht! Deine Bewertung steht unten.' : 'Übung macht den Meister, unten siehst du, was du besser machen kannst.'}</div>
              {correct > 0 && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '18px', fontWeight: 700 }}>+{correct * 10 + (isPerfect ? 10 : 0)} Punkte für die Bestenliste</div>}
              {earnedTip > 0 && <div className="lt-count" style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintYellow, fontSize: '18px', fontWeight: 700 }}>+{euro(earnedTip)} Trinkgeld von {conv.persona.title}{tipTotal > earnedTip ? ` · in dieser Runde ${euro(tipTotal)}` : ''}</div>}
              {tipCapped && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.cream, color: TH.muted, fontSize: '16px', fontWeight: 700 }}>{tipTodayLeft ? `Nur ${euro(tipTodayLeft)} davon passen heute noch in die Kasse, Tageslimit erreicht.` : 'Deine Kasse ist für heute voll, das Trinkgeld zählt erst morgen wieder.'}</div>}
              {tipLost && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintPeach, color: TH.red, fontSize: '17px', fontWeight: 700 }}>Das Trinkgeld ist diesmal weg, weil die Antwort beim Bezahlen nicht gepasst hat.</div>}
              {onOpenShop && <TipJar balance={tipBalance || 0} onOpenShop={onOpenShop} todayLeft={tipTodayLeft} />}
              {learned > 0 && <div style={{ padding: '10px 16px', borderRadius: '14px', backgroundColor: TH.tintBlue, fontSize: '17px', fontWeight: 700 }}>{learnedText(learned)}</div>}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
                <button onClick={() => startConversation(focus)} style={btnPrimary}>{focus ? `Nächster Kunde: ${focus}` : 'Nächster Kunde'}</button>
                {focus && <button onClick={() => startConversation()} style={{ ...btnPrimary, backgroundColor: TH.white, color: TH.ink, border: `2px solid ${TH.line}` }}>Gemischt weiter</button>}
              </div>
            </div>
          )}
          {phase === 'done' && review.length > 0 && (() => {
            const good = review.filter(r => r.ok);
            const bad = review.filter(r => !r.ok);
            const stars = Math.max(1, Math.round((good.length / review.length) * 5));
            return (
              <div className="lt-pop-in" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>Deine Bewertung</div>
                  <div aria-label={`${stars} von 5 Sternen`} style={{ fontSize: '28px', letterSpacing: '2px', color: dc('#D49A00') }}>{'★'.repeat(stars)}<span style={{ color: dc('#E6D6B8') }}>{'★'.repeat(5 - stars)}</span></div>
                </div>
                {good.length > 0 && (
                  <div style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintSage, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: TH.green }}>Das hast du gut gemacht</div>
                    {good.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '17px', lineHeight: 1.4 }}>
                        <span style={{ color: TH.green, fontWeight: 700 }}>✓</span>
                        <span><strong>{r.topic}:</strong> {THEKE_PRAISE[r.topic] || 'richtig beantwortet'}
                          <ReportLink align="left" report={{ game: 'Theken-Simulator', product: r.product || conv.steps.find(x => x.learn)?.learn?.product, text: `Thema: ${r.topic}\nKunde: ${r.q || ''}\nRichtig laut App: „${r.a || ''}“` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {bad.length > 0 ? (
                  <div style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintPeach, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: TH.red }}>Das kannst du noch besser machen</div>
                    {bad.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '17px', lineHeight: 1.45 }}>
                        <span style={{ color: TH.red, fontWeight: 700 }}>✗</span>
                        <span>
                          <strong>{r.topic}:</strong> {r.why || 'Hier war eine andere Antwort richtig.'}
                          {r.better && <span style={{ display: 'block', marginTop: '4px', color: TH.brown }}>Besser so: „{r.better}“</span>}
                          <ReportLink align="left" report={{ game: 'Theken-Simulator', product: r.product || conv.steps.find(x => x.learn)?.learn?.product, text: `Thema: ${r.topic}\nKunde: ${r.q || ''}\n${r.why || ''}${r.better ? `\nRichtig laut App: „${r.better}“` : ''}` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '17px', color: TH.green, fontWeight: 700 }}>Keine Fehler, genau so läuft ein gutes Verkaufsgespräch!</div>
                )}
                <div style={{ fontSize: '15px', color: TH.muted }}>Stimmt etwas im Gespräch nicht? Dann melde es hier, der Ausbilder schaut es sich an.</div>
                <ReportLink align="left" report={{ game: 'Theken-Simulator', product: conv.steps.find(x => x.learn)?.learn?.product, text: messages.filter(m => m.from === 'customer' || m.from === 'seller').map(m => `${m.from === 'seller' ? 'Du' : 'Kunde'}: ${m.text}`).join('\n').slice(-600) }} />
              </div>
            );
          })()}
          {phase === 'done' && topicPanel}
        </>
      )}
    </div>
  );
}
