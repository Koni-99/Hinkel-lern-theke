// ═══ Spiel: Telefon-Bestellung ═══
// Ein Kunde ruft an (Handy-Stimme) und bestellt für einen Abholtag. Du füllst den Bestellzettel aus:
// Name, Abholtag, Uhrzeit, Mengen und ob das Brot geschnitten wird. 5 Anrufe pro Runde, von einfach bis kompliziert.
// Nach und nach kommt jeder Artikel aus dem Sortiment dran (im Gerät gemerkt).
import { ReportContext } from '../ui/melden';
import { useState, useEffect } from 'react';
import { TH, cardStyle, btnPrimary, PageHead, StatChip, GameIntro, GameResult } from '../ui/basis';
import { scrollToPlay } from '../ui/belohnungen';
import { LtIcon, ICON } from '../basis/symbole';
import { canSpeak, sprichKunde, stopSpeaking } from './spielBasis';
import { neueBestellung, pruefe, schneidbar, TAGE, ZEITEN, zeitText, Bestellung, Zettel, Pruefung, STUFEN_RUNDE, gesehenLesen, gesehenMerken, sortiment } from './telefonLogik';

const ANRUFE = STUFEN_RUNDE.length;
const TEMPO = 0.95; // etwas ruhiger, am Telefon versteht man schlechter
const STUFE_NAME = { einfach: 'Einfach', mittel: 'Mittel', schwer: 'Schwer', kompliziert: 'Kompliziert' } as const;
const leer = (): Zettel => ({ name: '', tag: null, zeit: null, mengen: {}, geschnitten: {} });

export function TelefonBestellungView({ onSaveScore }: { onSaveScore: (points: number, category: string) => void }) {
  const [phase, setPhase] = useState<'menu' | 'anruf' | 'ergebnis' | 'fertig'>('menu');
  const [nr, setNr] = useState(0);
  const [b, setB] = useState<Bestellung | null>(null);
  const [z, setZ] = useState<Zettel>(leer());
  const [gelesen, setGelesen] = useState(false);
  const [pruefung, setPruefung] = useState<Pruefung>([]);
  const [punkte, setPunkte] = useState(0);
  const [runde, setRunde] = useState(0);
  const stimme = canSpeak();
  const [gesehen, setGesehen] = useState<Set<string>>(() => gesehenLesen());
  const alle = sortiment().length;
  useEffect(() => () => { stopSpeaking(); }, []);

  // Natürliche Stimme: abwechselnd eine Frau und ein Mann am Telefon
  const vorlesen = (x: Bestellung, n = nr) => sprichKunde(x.text.join(' '), n % 2 === 0 ? 'frau' : 'mann', TEMPO);
  const anruf = (i: number) => {
    const x = neueBestellung(STUFEN_RUNDE[i], gesehen);
    setB(x); setZ(leer()); setGelesen(!stimme); setPruefung([]); setNr(i); setPhase('anruf');
    if (stimme) window.setTimeout(() => vorlesen(x, i), 400);
    scrollToPlay();
  };
  const start = () => { setPunkte(0); setRunde(0); anruf(0); };
  const pruefen = () => {
    if (!b) return;
    stopSpeaking();
    const p = pruefe(b, z);
    const richtig = p.filter((r) => r.ok).length;
    const alles = p.every((r) => r.ok);
    const pts = richtig * 10 + (alles ? 10 : 0) + (alles && !gelesen ? 10 : 0);
    setPruefung(p); setRunde(pts); setPunkte((v) => v + pts); setPhase('ergebnis');
    setGesehen(gesehenMerken(b.positionen.map((x) => x.name)));
  };
  const weiter = () => {
    if (nr + 1 < ANRUFE) { anruf(nr + 1); return; }
    setPhase('fertig');
    if (punkte > 0) onSaveScore(punkte, 'Telefon-Bestellung');
  };

  const menge = (name: string, d: number) => setZ((v) => ({ ...v, mengen: { ...v.mengen, [name]: Math.max(0, Math.min(60, (v.mengen[name] || 0) + d)) } }));
  const knopfStil = (an: boolean) => ({ minHeight: '44px', padding: '0 12px', borderRadius: '12px', border: `2px solid ${an ? TH.brown : TH.line}`, backgroundColor: an ? TH.yellow : TH.white, color: TH.ink, fontWeight: 700, fontSize: '16px', cursor: 'pointer' });
  const rund = { width: '42px', height: '42px', borderRadius: '50%', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '22px', fontWeight: 700, cursor: 'pointer', flex: '0 0 auto' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      <PageHead title="Telefon-Bestellung" subtitle="Ein Kunde ruft an und bestellt vor. Hör gut zu und füll den Bestellzettel richtig aus." />
      {phase === 'menu' && (
        <GameIntro
          title="Das Telefon klingelt"
          text={`${ANRUFE} Kunden rufen an und bestellen. Schreib Name, Abholtag, Uhrzeit und Ware auf, manche korrigieren sich mittendrin.`}
          hint={stimme ? '10 Punkte für jedes richtige Feld, +10 wenn alles stimmt, +10 extra, wenn du nur zugehört hast, ohne den Text zu lesen. Ton am Handy einschalten!' : '10 Punkte für jedes richtige Feld, +10 wenn alles stimmt. Dein Gerät kann nicht vorlesen, deshalb siehst du den Text.'}
          startLabel="Anruf annehmen"
          onStart={start}
        />
      )}
      {phase === 'menu' && (
        <div className="lt-telefon-sortiment" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>Sortiment am Telefon: {Math.min(gesehen.size, alle)} von {alle} Artikeln schon bestellt</div>
          <div style={{ height: '10px', borderRadius: '999px', backgroundColor: TH.cream, overflow: 'hidden' }}><div style={{ width: `${Math.round((Math.min(gesehen.size, alle) / Math.max(1, alle)) * 100)}%`, height: '100%', backgroundColor: TH.green }} /></div>
          <div style={{ fontSize: '15px', color: TH.muted }}>Die Kunden bestellen zuerst, was bei dir noch nie dran war. So kommt nach und nach jeder Artikel einmal vor.</div>
        </div>
      )}

      {(phase === 'anruf' || phase === 'ergebnis') && b && <ReportContext report={{ game: 'Telefon-Bestellung', product: b.positionen[0]?.name, text: b.text.join(' '), detail: `Richtig laut App: ${b.name}, ${TAGE[b.tag] || b.tag}, ${zeitText(b.zeit)}, ${b.positionen.map((x) => `${x.menge} × ${x.name}${x.geschnitten ? ' (geschnitten)' : ''}`).join(', ')}` }} />}
      {(phase === 'anruf' || phase === 'ergebnis') && b && (
        <>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatChip label="Anruf" value={`${nr + 1} / ${ANRUFE}`} tone="yellow" />
            <StatChip label="Stufe" value={STUFE_NAME[b.stufe]} />
            <StatChip label="Punkte" value={punkte} />
          </div>
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: TH.tintSage, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TH.green }}><LtIcon paths={ICON.phone} size={26} /></span>
              <span style={{ flex: '1 1 150px', fontWeight: 700, fontSize: '18px' }}>{phase === 'anruf' ? 'Kunde am Telefon' : 'Das hat der Kunde gesagt'}</span>
              {stimme && <button type="button" onClick={() => vorlesen(b)} style={knopfStil(false)}><span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px' }}><LtIcon paths={ICON.repeat} size={18} /></span>Nochmal hören</button>}
              {stimme && !gelesen && phase === 'anruf' && <button type="button" onClick={() => setGelesen(true)} style={knopfStil(false)}>Text lesen</button>}
            </div>
            {(gelesen || phase === 'ergebnis') ? (
              <div className="lt-telefon-text" style={{ padding: '12px 16px', borderRadius: '16px', backgroundColor: TH.cream, fontSize: '18px', lineHeight: 1.5 }}>{b.text.join(' ')}</div>
            ) : (
              <div style={{ fontSize: '16px', color: TH.muted }}>Gut zuhören. Wenn du etwas nicht verstanden hast, tipp auf „Nochmal hören“. Lesen geht auch, dann gibt es aber keinen Zuhör-Bonus.</div>
            )}
          </div>

          <div className="lt-bestellzettel lt-papier" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFDF6', borderTop: `6px solid ${TH.yellow}` }}>
            <div style={{ fontFamily: TH.serif, fontSize: '26px' }}>Bestellzettel</div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 700 }}>Name
              <input value={z.name} disabled={phase !== 'anruf'} onChange={(e) => setZ({ ...z, name: e.target.value })} aria-label="Name des Kunden" autoComplete="off" style={{ minHeight: '48px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '18px', backgroundColor: TH.white, color: TH.ink }} />
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 700 }}>Abholtag</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {TAGE.map((t, i) => <button key={t} type="button" disabled={phase !== 'anruf'} aria-pressed={z.tag === i} onClick={() => setZ({ ...z, tag: i })} style={knopfStil(z.tag === i)}>{t.slice(0, 2)}</button>)}
              </div>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 700 }}>Uhrzeit
              <select value={z.zeit === null ? '' : String(z.zeit)} disabled={phase !== 'anruf'} onChange={(e) => setZ({ ...z, zeit: e.target.value === '' ? null : Number(e.target.value) })} aria-label="Abholzeit" style={{ minHeight: '48px', padding: '0 12px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '18px', backgroundColor: TH.white, color: TH.ink, maxWidth: '220px' }}>
                <option value="">bitte wählen</option>
                {ZEITEN.map((m) => <option key={m} value={m}>{zeitText(m)}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: 700 }}>Ware</span>
              {b.auswahl.map((name) => {
                const n = z.mengen[name] || 0;
                return (
                  <div key={name} className="lt-zettel-zeile" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px 0', borderBottom: `1px dashed ${TH.line}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ flex: '1 1 0', minWidth: 0, fontSize: '17px', fontWeight: n ? 700 : 400, overflowWrap: 'anywhere' }}>{name}</span>
                    <button type="button" aria-label={`${name} weniger`} disabled={phase !== 'anruf'} onClick={() => menge(name, -1)} style={rund}>−</button>
                    <span style={{ minWidth: '34px', textAlign: 'center', fontSize: '20px', fontWeight: 700 }} aria-label={`${name}: ${n}`}>{n}</span>
                    <button type="button" aria-label={`${name} mehr`} disabled={phase !== 'anruf'} onClick={() => menge(name, 1)} style={rund}>+</button>
                    </div>
                    {schneidbar(name) && n > 0 && (
                      <button type="button" disabled={phase !== 'anruf'} aria-pressed={!!z.geschnitten[name]} onClick={() => setZ({ ...z, geschnitten: { ...z.geschnitten, [name]: !z.geschnitten[name] } })} style={{ ...knopfStil(!!z.geschnitten[name]), alignSelf: 'flex-start' }}>{z.geschnitten[name] ? 'Brot: geschnitten' : 'Brot: am Stück (antippen = geschnitten)'}</button>
                    )}
                  </div>
                );
              })}
            </div>
            {phase === 'anruf' && <button type="button" onClick={pruefen} style={{ ...btnPrimary, alignSelf: 'stretch' }}>Bestellung prüfen</button>}
          </div>

          {phase === 'ergebnis' && (
            <div className="lt-pop-in lt-telefon-ergebnis" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: TH.serif, fontSize: '26px' }}>{pruefung.every((r) => r.ok) ? 'Alles richtig notiert!' : 'So war die Bestellung'}</div>
              {pruefung.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', flexWrap: 'wrap', padding: '6px 10px', borderRadius: '10px', backgroundColor: r.ok ? TH.tintSage : TH.tintPeach }}>
                  <strong style={{ color: r.ok ? TH.green : TH.red }}>{r.ok ? '✓' : '✗'}</strong>
                  <span style={{ flex: '1 1 160px', fontWeight: 700 }}>{r.zeile}</span>
                  <span>{r.ok ? r.richtig : `richtig: ${r.richtig} · deins: ${r.deins}`}</span>
                </div>
              ))}
              <div style={{ fontWeight: 700, fontSize: '18px', color: TH.green }}>+{runde} Punkte</div>
              <button type="button" onClick={weiter} style={btnPrimary}>{nr + 1 < ANRUFE ? 'Nächster Anruf' : 'Runde beenden'}</button>
            </div>
          )}
        </>
      )}

      {phase === 'fertig' && (
        <GameResult title="Telefon-Bestellung" big={`${punkte} Punkte`} text={`${ANRUFE} Anrufe angenommen. Im Laden zählt jedes Detail: Name, Tag, Uhrzeit und die richtige Menge.`} againLabel="Nochmal" onAgain={start} celebrate={punkte >= ANRUFE * 60} />
      )}
    </div>
  );
}
