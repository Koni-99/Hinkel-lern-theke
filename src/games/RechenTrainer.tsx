// ═══ Spiel: Rechen-Trainer (Version 253) ═══
// 8 Aufgaben wie in der Prüfung mit echten Hinkel-Preisen: Summe, Rückgeld, Preis pro Kilo, Rabatt, Mehrwertsteuer, Dreisatz.
// Ohne Zeitdruck. Nach jeder Antwort steht der Rechenweg da. Logik in rechenLogik.ts.
import { ReportContext } from '../ui/melden';
import { useState, useRef } from 'react';
import { TH, cardStyle, btnPrimary, PageHead, StatChip, GameIntro, GameResult } from '../ui/basis';
import { AnswerFx, AnswerFxState } from '../ui/antwortFx';
import { scrollToPlay } from '../ui/belohnungen';
import { neueRunde, Aufgabe, euro, RUNDE, PUNKTE_PRO_AUFGABE } from './rechenLogik';

export const RECHEN_KATEGORIE = 'Rechen-Trainer';

/** „12,3“, „12,30 €“, „12.30“ → Cent (null, wenn keine Zahl) */
export function centAusEingabe(s: string): number | null {
  const t = s.replace(/€|\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(t)) return null;
  return Math.round(parseFloat(t) * 100);
}

export function RechenTrainerView({ onSaveScore }: { onSaveScore: (points: number, category: string) => void }) {
  const [phase, setPhase] = useState<'menu' | 'spiel' | 'ende'>('menu');
  const [liste, setListe] = useState<Aufgabe[]>([]);
  const [nr, setNr] = useState(0);
  const [eingabe, setEingabe] = useState('');
  const [geprueft, setGeprueft] = useState<null | boolean>(null);
  const [richtig, setRichtig] = useState(0);
  const [fx, setFx] = useState<AnswerFxState>(null);
  const [lauf, setLauf] = useState(0);
  const feld = useRef<HTMLInputElement>(null);
  const a = liste[nr];

  const start = () => { setListe(neueRunde()); setNr(0); setEingabe(''); setGeprueft(null); setRichtig(0); setLauf(0); setPhase('spiel'); scrollToPlay(); window.setTimeout(() => feld.current?.focus(), 300); };
  const pruefen = () => {
    if (!a || geprueft !== null) return;
    const c = centAusEingabe(eingabe); if (c === null) return;
    const ok = c === a.cent;
    setGeprueft(ok); if (ok) setRichtig((x) => x + 1);
    const l = ok ? lauf + 1 : 0; setLauf(l);
    setFx({ k: Date.now(), ok, text: ok ? 'Richtig gerechnet!' : 'Daneben', streak: l, pts: ok ? PUNKTE_PRO_AUFGABE : 0 });
  };
  const weiter = () => {
    if (nr + 1 < liste.length) { setNr(nr + 1); setEingabe(''); setGeprueft(null); setFx(null); window.setTimeout(() => feld.current?.focus(), 100); return; }
    setPhase('ende');
    const pts = richtig * PUNKTE_PRO_AUFGABE;
    if (pts > 0) onSaveScore(pts, RECHEN_KATEGORIE);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      <PageHead title="Rechen-Trainer" subtitle="Rechnen wie in der Prüfung, mit echten Hinkel-Preisen. Ohne Zeitdruck, mit Rechenweg." />
      {phase === 'menu' && (
        <GameIntro title="Rechnen wie in der Prüfung" text={`${RUNDE} Aufgaben rund um die Kasse, ohne Zeitdruck. Tipp das Ergebnis in Euro ein, danach siehst du den Rechenweg.`}
          hint={`${PUNKTE_PRO_AUFGABE} Punkte pro richtiger Aufgabe. Ein Taschenrechner ist erlaubt, wie in der Prüfung.`} startLabel="Los geht's" onStart={start} />
      )}
      {phase === 'spiel' && a && <ReportContext report={{ game: 'Rechen-Trainer', text: `${a.titel}: ${a.text}`, detail: `Lösung laut App: ${a.weg.join(' | ')}` }} />}
      {phase === 'spiel' && a && (
        <div className="lt-rechnen" style={{ ...cardStyle, position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <AnswerFx fx={fx} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <StatChip label="Aufgabe" value={`${nr + 1} von ${liste.length}`} />
            <StatChip label="Richtig" value={richtig} tone="yellow" />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: TH.muted }}>{a.titel}</div>
          <div className="lt-rechen-aufgabe" style={{ fontFamily: TH.serif, fontSize: '23px', lineHeight: 1.3 }}>{a.text}</div>
          <form onSubmit={(e) => { e.preventDefault(); if (geprueft === null) pruefen(); else weiter(); }} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', minWidth: 0 }}>
              <input ref={feld} value={eingabe} onChange={(e) => setEingabe(e.target.value)} disabled={geprueft !== null} inputMode="decimal" enterKeyHint="done" aria-label="Ergebnis in Euro" placeholder="0,00"
                style={{ flex: 1, width: 0, minWidth: 0, minHeight: '58px', padding: '0 16px', borderRadius: '16px', border: `3px solid ${geprueft === null ? TH.line : geprueft ? TH.green : TH.red}`, fontSize: '26px', fontWeight: 800, textAlign: 'right', backgroundColor: TH.white, color: TH.ink, fontVariantNumeric: 'tabular-nums' }} />
              <span style={{ fontSize: '24px', fontWeight: 800 }}>€</span>
            </label>
            {geprueft === null
              ? <button type="submit" disabled={centAusEingabe(eingabe) === null} style={{ ...btnPrimary, opacity: centAusEingabe(eingabe) === null ? 0.5 : 1 }}>Prüfen</button>
              : <button type="submit" style={btnPrimary}>{nr + 1 < liste.length ? 'Weiter' : 'Auswertung'}</button>}
          </form>
          {geprueft !== null && (
            <div className="lt-rechenweg" style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: geprueft ? TH.tintSage : TH.tintPeach, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '17px', lineHeight: 1.45 }}>
              <strong style={{ color: geprueft ? TH.green : TH.red }}>{geprueft ? 'Richtig!' : `Richtig wäre: ${euro(a.cent)}`}</strong>
              <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: TH.muted }}>So rechnest du</span>
              {a.weg.map((w, i) => <span key={i} style={{ fontVariantNumeric: 'tabular-nums' }}>{w}</span>)}
            </div>
          )}
        </div>
      )}
      {phase === 'ende' && (
        <GameResult title="Rechen-Trainer" big={`${richtig}/${liste.length}`} text={richtig === liste.length ? 'Alles richtig gerechnet. Die Prüfung kann kommen!' : richtig >= liste.length / 2 ? 'Gut gerechnet! Schau dir die Rechenwege nochmal an.' : 'Übung macht den Meister. Probier es gleich nochmal.'}
          reward={richtig > 0 ? `+${richtig * PUNKTE_PRO_AUFGABE} Punkte` : null} againLabel="Neue Aufgaben" onAgain={start} celebrate={richtig === liste.length} />
      )}
    </div>
  );
}

export default RechenTrainerView;
