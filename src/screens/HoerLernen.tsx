// ═══ Hör-Lernen: Fragen und Antworten werden nacheinander vorgelesen, wie ein Hörbuch ═══
// Ablauf je Frage: Frage vorlesen → Denkpause → richtige Antwort (+ Erklärung) vorlesen → kurze Pause → nächste.
// Solange vorgelesen wird, bleibt der Bildschirm an (wenn das Handy das erlaubt).
import { useState, useEffect, useRef } from 'react';
import { dc } from '../daten/data';
import { LT } from '../basis/marke';
import { LtIcon, ICON } from '../basis/symbole';
import { canSpeak, bestGermanVoice } from '../games/spielBasis';
import { getRightAnswerText, shuffleArray } from '../hilfen/allgemein';

type Phase = 'frage' | 'denken' | 'antwort' | 'pause';
const TEMPO: Record<string, { label: string; rate: number }> = { langsam: { label: 'Langsam', rate: 0.9 }, normal: { label: 'Normal', rate: 1.05 }, schnell: { label: 'Schnell', rate: 1.25 } };
const DENKEN: Record<string, { label: string; ms: number }> = { kurz: { label: '2 Sek.', ms: 2000 }, mittel: { label: '4 Sek.', ms: 4000 }, lang: { label: '7 Sek.', ms: 7000 } };
const sauber = (t: string) => String(t || '').replace(/[„“"]/g, '').replace(/·/g, ',').replace(/\s+/g, ' ').trim();

export function HoerLernen({ fragen, bereiche, fehlerIds, onZurueck }: { fragen: any[]; bereiche: string[]; fehlerIds: number[]; onZurueck: () => void }) {
  const [auswahl, setAuswahl] = useState<string>('alle');
  const [liste, setListe] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [laeuft, setLaeuft] = useState(false);
  const [phase, setPhase] = useState<Phase>('frage');
  const [tempo, setTempo] = useState('normal');
  const [denken, setDenken] = useState('mittel');
  const [mitOptionen, setMitOptionen] = useState(false);
  const lauf = useRef(0); // Nummer des aktuellen Vorlesens; ändert sich bei Stopp/Weiter, alte Rückrufe werden ignoriert
  const timer = useRef(0);
  const wake = useRef<any>(null);
  const einst = useRef({ tempo, denken, mitOptionen });
  einst.current = { tempo, denken, mitOptionen };

  const pool = (a: string) => {
    if (a === 'fehler') { const s = new Set(fehlerIds); return fragen.filter((q) => s.has(Number(q.id))); }
    if (a === 'alle') return fragen;
    return fragen.filter((q) => q.category === a);
  };
  const anzahl = (a: string) => pool(a).length;

  const halt = () => {
    lauf.current++;
    window.clearTimeout(timer.current);
    if (canSpeak()) window.speechSynthesis.cancel();
    setLaeuft(false);
    if (wake.current) { try { wake.current.release(); } catch {} wake.current = null; }
  };
  useEffect(() => () => halt(), []); // beim Verlassen der Seite aufhören

  const sprich = (text: string, fertig: () => void) => {
    const my = lauf.current;
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(sauber(text));
    u.lang = 'de-DE'; u.rate = TEMPO[einst.current.tempo].rate; u.pitch = 1.05;
    const v = bestGermanVoice(); if (v) u.voice = v;
    u.onend = () => { if (my === lauf.current) fertig(); };
    u.onerror = () => { if (my === lauf.current) fertig(); };
    synth.speak(u);
  };
  const warte = (ms: number, weiter: () => void) => { const my = lauf.current; timer.current = window.setTimeout(() => { if (my === lauf.current) weiter(); }, ms); };

  const spiele = (l: any[], i: number) => {
    if (!l.length) return;
    const q = l[i % l.length];
    setIdx(i % l.length); setPhase('frage');
    const optionen = einst.current.mitOptionen && Array.isArray(q.options) && q.options.length ? ` Möglich sind: ${q.options.join(', ')}.` : '';
    sprich(`Frage ${(i % l.length) + 1}. ${q.question}${optionen}`, () => {
      setPhase('denken');
      warte(DENKEN[einst.current.denken].ms, () => {
        setPhase('antwort');
        const erkl = q.explanation && sauber(q.explanation) !== sauber(getRightAnswerText(q)) ? ` ${q.explanation}` : '';
        sprich(`Antwort: ${getRightAnswerText(q)}.${erkl}`, () => {
          setPhase('pause');
          warte(1500, () => spiele(l, i + 1));
        });
      });
    });
  };

  const start = async (neu: boolean) => {
    if (!canSpeak()) return;
    halt();
    lauf.current++;
    const l = neu || !liste.length ? shuffleArray(pool(auswahl)) : liste;
    if (!l.length) return;
    if (neu || !liste.length) setListe(l);
    setLaeuft(true);
    try { if ((navigator as any).wakeLock) wake.current = await (navigator as any).wakeLock.request('screen'); } catch {}
    spiele(l, neu || !liste.length ? 0 : idx);
  };
  const springe = (d: number) => {
    if (!liste.length) return;
    const n = (idx + d + liste.length) % liste.length;
    if (laeuft) { lauf.current++; window.clearTimeout(timer.current); window.speechSynthesis.cancel(); spiele(liste, n); }
    else { setIdx(n); setPhase('frage'); }
  };

  const q = liste[idx];
  const chip = (aktiv: boolean) => ({ minHeight: '44px', padding: '0 14px', borderRadius: '999px', border: aktiv ? 'none' : `2px solid ${LT.line}`, backgroundColor: aktiv ? LT.brown : dc('#FFFFFF'), color: aktiv ? dc('#FFF6E0') : LT.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } as const);
  const rund = (gross = false) => ({ width: gross ? '76px' : '56px', height: gross ? '76px' : '56px', borderRadius: '50%', border: 'none', backgroundColor: gross ? LT.brown : dc('#FFFFFF'), color: gross ? '#FFD86B' : LT.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.5)' } as const);

  if (!canSpeak()) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '44px' }}>Hör-Lernen</h1>
        <p style={{ fontSize: '18px' }}>Dieses Gerät kann leider nicht vorlesen. Probier es in Chrome oder Safari.</p>
        <button type="button" onClick={onZurueck} style={chip(false)}>Zurück</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: LT.ink }}>
      <div>
        <button type="button" onClick={() => { halt(); onZurueck(); }} style={{ ...chip(false), marginBottom: '12px' }}>‹ Zurück zu Lernen</button>
        <h1 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '44px' }}>Hör-Lernen</h1>
        <p style={{ margin: '6px 0 0', fontSize: '19px', color: LT.brown }}>Die App liest Fragen und Antworten vor. Zum Lernen mit Kopfhörer, z. B. beim Putzen oder auf dem Weg.</p>
      </div>


      <section aria-live="polite" style={{ padding: '26px', borderRadius: '24px', backgroundColor: '#1F140C', color: '#FFF6E0', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '180px' }}>
        {q ? (
          <>
            <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#FFD86B' }}>Frage {idx + 1} von {liste.length}{q.category ? ` · ${q.category}` : ''}</span>
            <span style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.2 }}>{q.question}</span>
            {(phase === 'antwort' || phase === 'pause') ? (
              <span style={{ fontSize: '19px', lineHeight: 1.45 }}><strong style={{ color: '#FFD86B' }}>Antwort:</strong> {getRightAnswerText(q)}</span>
            ) : laeuft && phase === 'denken' ? (
              <span style={{ fontSize: '17px', color: '#E8D8BE' }}>Überleg kurz …</span>
            ) : null}
          </>
        ) : (
          <span style={{ fontSize: '19px', lineHeight: 1.45 }}>Tippe auf den Abspiel-Knopf unten. Die Fragen kommen in zufälliger Reihenfolge, bis du stoppst.</span>
        )}
      </section>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
        <button type="button" onClick={() => springe(-1)} disabled={!liste.length} aria-label="Vorherige Frage" style={{ ...rund(), opacity: liste.length ? 1 : 0.4 }}><LtIcon paths={ICON.skipBack} size={24} width={2} /></button>
        {laeuft
          ? <button type="button" onClick={halt} aria-label="Vorlesen anhalten" style={rund(true)}><LtIcon paths={ICON.pause} size={30} width={2} /></button>
          : <button type="button" onClick={() => start(false)} aria-label={liste.length ? 'Weiter vorlesen' : 'Vorlesen starten'} style={rund(true)}><LtIcon paths={ICON.play} size={30} width={2} /></button>}
        <button type="button" onClick={() => springe(1)} disabled={!liste.length} aria-label="Nächste Frage" style={{ ...rund(), opacity: liste.length ? 1 : 0.4 }}><LtIcon paths={ICON.skipFwd} size={24} width={2} /></button>
      </div>
      {liste.length > 0 && !laeuft && <button type="button" onClick={() => start(true)} style={{ ...chip(false), alignSelf: 'center' }}>Neu mischen und von vorne</button>}
      <section style={{ padding: '22px', borderRadius: '24px', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <strong style={{ fontSize: '18px' }}>Was möchtest du hören?</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['alle', ...bereiche, 'fehler'].filter((a) => anzahl(a) > 0).map((a) => (
            <button key={a} type="button" onClick={() => { halt(); setAuswahl(a); setListe([]); setIdx(0); }} style={chip(auswahl === a)}>
              {a === 'alle' ? 'Alles' : a === 'fehler' ? 'Mein Fehler-Stapel' : a} ({anzahl(a)})
            </button>
          ))}
        </div>
        <strong style={{ fontSize: '18px' }}>Tempo</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(TEMPO).map(([k, v]) => <button key={k} type="button" onClick={() => setTempo(k)} style={chip(tempo === k)}>{v.label}</button>)}
        </div>
        <strong style={{ fontSize: '18px' }}>Denkpause vor der Antwort</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(DENKEN).map(([k, v]) => <button key={k} type="button" onClick={() => setDenken(k)} style={chip(denken === k)}>{v.label}</button>)}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px' }}>
          <input type="checkbox" checked={mitOptionen} onChange={(e) => setMitOptionen(e.target.checked)} style={{ width: '22px', height: '22px', accentColor: LT.brown }} />
          Antwortmöglichkeiten mit vorlesen
        </label>
      </section>
      <p style={{ margin: 0, fontSize: '15px', color: LT.muted, textAlign: 'center' }}>Tipp: Bildschirm anlassen. Wenn das Handy sperrt, hören manche Handys auf vorzulesen.</p>
    </div>
  );
}
