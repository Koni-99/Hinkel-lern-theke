// ═══ Ausbildungsplan und Ausbildungs-Ansicht ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, CSSProperties, ReactNode } from 'react';
import { UEBEN, wochenKey, BerichtNotiz } from '../hilfen/azubi';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead } from './basis';

// ───────────────────────── Ausbildung (für alle sichtbar, Abhaken nur für Azubis) ─────────────────────────

export type PlanItem = { id: string; text: string; lehrgang?: boolean };

export const AUSBILDUNGSPLAN: { jahr: 1 | 2 | 3; title: string; items: PlanItem[] }[] = [
  { jahr: 1, title: '1. Lehrjahr: Ankommen und Grundlagen', items: [
    { id: 'j1_betrieb', text: 'Betrieb kennenlernen: Geschäfte, Backstube, Ansprechpartner' },
    { id: 'j1_hygiene', text: 'Hygieneregeln, Gesundheitsbelehrung und Arbeitsschutz' },
    { id: 'j1_kleidung', text: 'Arbeitskleidung und gepflegtes Erscheinungsbild' },
    { id: 'j1_ware', text: 'Ware annehmen, kontrollieren und richtig lagern' },
    { id: 'j1_brote', text: 'Unsere Brotsorten, Mehlarten und Geschmacksrichtungen kennen' },
    { id: 'j1_schneiden', text: 'Brot schneiden: Schnittstärken und sicherer Umgang mit der Maschine' },
    { id: 'j1_theke', text: 'Theke einräumen und Ware ansprechend präsentieren' },
    { id: 'j1_bedienen', text: 'Kunden begrüßen, bedienen und verabschieden' },
    { id: 'j1_kasse', text: 'Kassieren: Bargeld, Rückgeld und Kartenzahlung' },
    { id: 'j1_packen', text: 'Ware richtig einpacken' },
  ] },
  { jahr: 2, title: '2. Lehrjahr: Beraten und Verkaufen', items: [
    { id: 'j2_gespraech', text: 'Verkaufsgespräche führen und Kunden beraten' },
    { id: 'j2_allergene', text: 'Zutaten und Allergene sicher erklären' },
    { id: 'j2_zusatz', text: 'Zusatzverkauf und passende Empfehlungen' },
    { id: 'j2_alternativ', text: 'Alternativen anbieten, wenn etwas ausverkauft ist' },
    { id: 'j2_reklamation', text: 'Reklamationen freundlich bearbeiten' },
    { id: 'j2_snacks', text: 'Ware vorbereiten und Theke auffüllen' }, // Version 252: Hinkel verkauft keine belegten Sachen (id bleibt, damit Haken bleiben)
    { id: 'j2_feingebaeck', text: 'Feingebäck, Kuchen und Saisonware kennen und verkaufen' },
    { id: 'j2_bestellung', text: 'Vorbestellungen annehmen und richtig aufschreiben' },
    { id: 'j2_abrechnung', text: 'Kassenabrechnung am Tagesende' },
    { id: 'j2_zp', text: 'Zwischenprüfung vorbereiten' },
  ] },
  { jahr: 3, title: '3. Lehrjahr: Verantwortung übernehmen', items: [
    { id: 'j3_bestellen', text: 'Ware bestellen und den Bedarf planen' },
    { id: 'j3_kalkulation', text: 'Preise, Kalkulation und Grundpreise verstehen' },
    { id: 'j3_deko', text: 'Dekoration, Schaufenster und Saisonaktionen gestalten' },
    { id: 'j3_platten', text: 'Platten und Geschenkkörbe zusammenstellen' },
    { id: 'j3_recht', text: 'Lebensmittelrecht und Kennzeichnung' },
    { id: 'j3_qualitaet', text: 'Qualität sichern: Kühlkette, Haltbarkeit, Kontrollen' },
    { id: 'j3_einarbeiten', text: 'Neue Kolleginnen und Kollegen einarbeiten' },
    { id: 'j3_ap', text: 'Abschlussprüfung vorbereiten' },
  ] },
];

export const AUSBILDUNG_LEHRGAENGE: PlanItem[] = [
  { id: 'lg_verkauf', text: 'Überbetrieblicher Lehrgang: Verkaufstraining und Warenpräsentation', lehrgang: true },
  { id: 'lg_snack', text: 'Überbetrieblicher Lehrgang: Snacks und belegte Backwaren', lehrgang: true },
  { id: 'lg_recht', text: 'Überbetrieblicher Lehrgang: Lebensmittelrecht und Hygiene', lehrgang: true },
];

export const BERICHT_TIPPS = [
  'Jede Woche ausfüllen, am besten am Freitag, dann ist noch alles im Kopf.',
  'Schreib auf, was du gemacht hast und was du dabei gelernt hast.',
  'Berufsschultage und Lehrgänge gehören auch hinein.',
  'Zeig das Berichtsheft regelmäßig deinem Ausbilder und lass es unterschreiben.',
  'Ohne vollständiges Berichtsheft keine Zulassung zur Abschlussprüfung.',
];

export type AzubiBadge = { id: string; icon: string; title: string; how: string };

export function azubiBadges(plan: Record<string, boolean>, exam: { ZP?: { best?: number }; AP?: { best?: number } } = {}): (AzubiBadge & { got: boolean })[] {
  const yearDone = (j: number) => AUSBILDUNGSPLAN.find(y => y.jahr === j)!.items.every(i => plan[i.id]);
  const any = Object.keys(plan).some(k => plan[k]);
  return [
    { id: 'start', icon: '🌱', title: 'Erster Haken', how: 'Den ersten Punkt im Plan abhaken', got: any },
    { id: 'j1', icon: '🥉', title: '1. Lehrjahr geschafft', how: 'Alle Punkte im 1. Lehrjahr abhaken', got: yearDone(1) },
    { id: 'j2', icon: '🥈', title: '2. Lehrjahr geschafft', how: 'Alle Punkte im 2. Lehrjahr abhaken', got: yearDone(2) },
    { id: 'j3', icon: '🥇', title: '3. Lehrjahr geschafft', how: 'Alle Punkte im 3. Lehrjahr abhaken', got: yearDone(3) },
    { id: 'lg', icon: '🏫', title: 'Lehrgangs-Profi', how: 'Alle Lehrgänge besucht', got: AUSBILDUNG_LEHRGAENGE.every(l => plan[l.id]) },
    { id: 'zp', icon: '📝', title: 'Zwischenprüfung geübt', how: 'Simulation mit mindestens 50 %', got: (Number(exam.ZP?.best) || 0) >= 50 },
    { id: 'ap', icon: '🎓', title: 'Abschlussprüfung geübt', how: 'Simulation mit mindestens 50 %', got: (Number(exam.AP?.best) || 0) >= 50 },
  ];
}

export function mondayOf(d: Date) { const x = new Date(d); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); x.setHours(0, 0, 0, 0); return x; }

export const dmy = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function AusbildungView({ isAzubi, isAdmin, plan, lehrjahr, onToggle, onSetLehrjahr, examSection, azubis, exam = {}, ok = {}, start = '', onSetStart, uebenZahl, onUeben, onSpiel, notizen = {}, onNotiz, geuebt, onBestaetigen, lernkarten, kartenPruefen, oben, azubiExtra, onLehrjahrQuiz, lehrjahrQuizZahl = 0 }: {
  exam?: { ZP?: { best?: number }; AP?: { best?: number } };
  isAzubi: boolean; isAdmin: boolean; plan: Record<string, boolean>; lehrjahr: number;
  onToggle: (id: string) => void; onSetLehrjahr: (n: number) => void; examSection: ReactNode;
  azubis: { key?: string; name: string; plan: Record<string, boolean>; lehrjahr: number; ok?: Record<string, number>; exam?: { ZP?: { best?: number }; AP?: { best?: number } } }[];
  /** Version 252: vom Ausbilder bestätigte Planpunkte, Ausbildungsbeginn, Üben, Wochen-Notizen */
  ok?: Record<string, number>; start?: string; onSetStart?: (s: string) => void;
  uebenZahl?: (id: string) => number; onUeben?: (id: string) => void; onSpiel?: (tab: string) => void;
  notizen?: Record<string, BerichtNotiz>; onNotiz?: (woche: string, n: BerichtNotiz) => void; geuebt?: (montag: Date) => string[];
  onBestaetigen?: (azubiKey: string, id: string, an: boolean) => void;
  /** Version 254: Berufsschul-Lernkarten (Azubi) und Karten zum Bestätigen (Ausbilder) */
  lernkarten?: ReactNode; kartenPruefen?: ReactNode;
  /** Version 256: Rückblick/Fragen oben, Wochenziel + Frage an den Ausbilder, Lehrjahr-Quiz */
  oben?: ReactNode; azubiExtra?: ReactNode; onLehrjahrQuiz?: () => void; lehrjahrQuizZahl?: number;
}) {
  const [openYear, setOpenYear] = useState<number>(lehrjahr || 1);
  const [week, setWeek] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [schule, setSchule] = useState('');
  const [extra, setExtra] = useState('');
  const [notiz, setNotiz] = useState('');
  const [copied, setCopied] = useState(false);
  const canTick = isAzubi && !isAdmin;
  const allItems = [...AUSBILDUNGSPLAN.flatMap(y => y.items), ...AUSBILDUNG_LEHRGAENGE];
  const yearPct = (p: Record<string, boolean>, jahr: number) => { const its = AUSBILDUNGSPLAN.find(y => y.jahr === jahr)!.items; return Math.round(its.filter(i => p[i.id]).length / its.length * 100); };
  const mon = mondayOf(new Date()); mon.setDate(mon.getDate() - week * 7); const sat = new Date(mon); sat.setDate(sat.getDate() + 5);
  // Notizen der gewählten Woche laden (gespeichert im eigenen Fortschritt)
  const wk = wochenKey(mon);
  useEffect(() => { const n = notizen[wk] || {}; setPicked(Array.isArray(n.p) ? n.p : []); setExtra(n.e || ''); setSchule(n.s || ''); setNotiz(n.n || ''); }, [wk]); // eslint-disable-line react-hooks/exhaustive-deps
  const speichern = (aend: Partial<BerichtNotiz>) => { if (!onNotiz || !canTick) return; onNotiz(wk, { p: picked, e: extra, s: schule, n: notiz, ...aend }); };
  const ausApp = geuebt ? geuebt(mon) : [];
  const status = (id: string): 'offen' | 'wartet' | 'ok' => (plan[id] && ok[id] ? 'ok' : plan[id] ? 'wartet' : 'offen');
  const reportText = [
    `Woche vom ${dmy(mon)} bis ${dmy(sat)}`,
    '',
    'Betriebliche Tätigkeiten:',
    ...(picked.length ? picked.map(id => `• ${allItems.find(i => i.id === id)?.text || id}`) : ['• (noch nichts ausgewählt)']),
    ...(extra.trim() ? [`• ${extra.trim()}`] : []),
    ...(schule.trim() ? ['', 'Berufsschule:', ...schule.split('\n').filter(s => s.trim()).map(s => `• ${s.trim()}`)] : []),
    ...(notiz.trim() ? ['', 'Notizen:', ...notiz.split('\n').filter(s => s.trim()).map(s => `• ${s.trim()}`)] : []),
  ].join('\n');
  const copy = () => {
    const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); };
    try { navigator.clipboard.writeText(reportText).then(done, () => {}); } catch { /* ohne Zwischenablage */ }
  };
  const chip = (on: boolean): CSSProperties => ({ minHeight: '44px', padding: '8px 14px', borderRadius: '999px', border: on ? 'none' : `2px solid ${TH.line}`, backgroundColor: on ? TH.brown : TH.white, color: on ? dc('#FFF6E0') : TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageHead title="Ausbildung" subtitle="Dein Ausbildungsplan zum Abhaken, Hilfe fürs Berichtsheft und die Prüfungen." />
      {oben}

      {isAdmin && (
        <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.1 }}>Deine Azubis</div>
          {azubis.length === 0 ? <div style={{ fontSize: '17px', color: TH.muted }}>Noch niemand hat sich als Azubi angemeldet.</div> : azubis.map(a => (
            <div key={a.name} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{a.name}{a.lehrjahr ? ` · ${a.lehrjahr}. Lehrjahr` : ''} <span style={{ letterSpacing: '2px' }}>{azubiBadges(a.plan, a.exam).filter(b => b.got).map(b => b.icon).join('')}</span></div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '15px' }}>
                {[1, 2, 3].map(j => <span key={j} style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>{j}. Jahr: {yearPct(a.plan, j)} %</span>)}
                <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>Lehrgänge: {AUSBILDUNG_LEHRGAENGE.filter(l => a.plan[l.id]).length} von {AUSBILDUNG_LEHRGAENGE.length}</span>
                <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>Bestätigt: {Object.keys(a.ok || {}).filter(id => a.plan[id]).length}</span>
              </div>
              {onBestaetigen && a.key && (() => {
                const offen = AUSBILDUNGSPLAN.flatMap(y => y.items).filter(it => a.plan[it.id] && !(a.ok || {})[it.id]);
                if (!offen.length) return null;
                return (
                  <div className="lt-azubi-bestaetigen" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: TH.brown }}>Wartet auf deine Bestätigung ({offen.length}):</div>
                    {offen.map(it => (
                      <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '8px 10px', borderRadius: '12px', backgroundColor: TH.white }}>
                        <span style={{ flex: '1 1 200px', fontSize: '16px' }}>{it.text}</span>
                        <button type="button" onClick={() => onBestaetigen(a.key!, it.id, true)} style={{ minHeight: '42px', padding: '0 14px', borderRadius: '999px', border: 'none', backgroundColor: TH.green, color: dc('#FFFFFF'), fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Kann {a.name.split(' ')[0]} wirklich</button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ))}
        </section>
      )}

      {kartenPruefen}


      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>Ausbildungsplan</div>
          {canTick && (
            <div className="lt-azubi-start" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {onSetStart && <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: TH.muted }}>Ausbildung begonnen im
                <input type="month" value={start} onChange={(e) => { onSetStart(e.target.value); }} aria-label="Ausbildungsbeginn" style={{ minHeight: '44px', padding: '0 10px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '16px', backgroundColor: TH.white, color: TH.ink }} />
              </label>}
              {start ? <span style={{ fontWeight: 800, fontSize: '16px' }}>Du bist im {lehrjahr}. Lehrjahr</span> : <>
                <span style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>oder: Ich bin im</span>
                {[1, 2, 3].map(j => <button key={j} onClick={() => { onSetLehrjahr(j); setOpenYear(j); }} style={chip(lehrjahr === j)}>{j}. Lehrjahr</button>)}
              </>}
            </div>
          )}
        </div>
        <div style={{ fontSize: '16px', color: TH.brown, lineHeight: 1.45 }}>{canTick ? 'Hake ab, was du schon kannst. Dein Ausbilder bestätigt es, dann wird der Punkt grün. Mit „Üben“ trainierst du genau dieses Thema.' : 'So sieht der Plan für die Azubis aus. Abhaken können nur die Azubis selbst, bestätigen kannst du oben bei „Deine Azubis“.'}</div>
        {canTick && onLehrjahrQuiz && lehrjahrQuizZahl >= 5 && <button type="button" className="lt-lehrjahr-quiz" onClick={onLehrjahrQuiz} style={{ ...btnPrimary, alignSelf: 'flex-start' }}>Quiz zu meinem Lehrjahr ({Math.min(15, lehrjahrQuizZahl)} Fragen)</button>}
        {AUSBILDUNGSPLAN.map(y => {
          const pct = yearPct(plan, y.jahr); const open = openYear === y.jahr;
          return (
            <div key={y.jahr} style={{ borderRadius: '18px', border: `2px solid ${open ? TH.brown : TH.line}`, overflow: 'hidden' }}>
              <button onClick={() => setOpenYear(open ? 0 : y.jahr)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: 'none', backgroundColor: open ? TH.tintYellow : TH.white, color: TH.ink, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '18px' }}>{y.title}</span>
                  {canTick && <span style={{ display: 'block', marginTop: '6px', height: '8px', borderRadius: '999px', backgroundColor: dc('#F4EADB'), overflow: 'hidden' }}><span style={{ display: 'block', width: `${pct}%`, height: '100%', backgroundColor: TH.green, borderRadius: '999px', transition: 'width .4s ease' }} /></span>}
                </span>
                {canTick && <span style={{ fontWeight: 700, color: pct === 100 ? TH.green : TH.muted }}>{pct === 100 ? '✓ fertig' : `${pct} %`}</span>}
                <span aria-hidden="true" style={{ fontSize: '18px' }}>{open ? '▴' : '▾'}</span>
              </button>
              {open && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px 16px' }}>
                  {y.items.map(it => {
                    const on = !!plan[it.id]; const st = status(it.id);
                    const u = UEBEN[it.id]; const n = uebenZahl ? uebenZahl(it.id) : 0;
                    return (
                      <div key={it.id} className="lt-planpunkt" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', borderRadius: '16px', backgroundColor: st === 'ok' ? TH.tintSage : st === 'wartet' ? TH.tintYellow : TH.white, border: `2px solid ${st === 'ok' ? TH.green : TH.line}` }}>
                        <button onClick={() => canTick && onToggle(it.id)} disabled={!canTick} role="checkbox" aria-checked={on} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '46px', padding: '4px 6px', border: 'none', background: 'transparent', color: TH.ink, fontSize: '16px', textAlign: 'left', cursor: canTick ? 'pointer' : 'default' }}>
                          <span aria-hidden="true" style={{ flex: '0 0 28px', height: '28px', borderRadius: '8px', border: `2px solid ${on ? TH.green : TH.line}`, backgroundColor: on ? TH.green : TH.white, color: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{on ? '✓' : ''}</span>
                          <span style={{ flex: 1 }}>{it.text}{st !== 'offen' && <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: st === 'ok' ? TH.green : TH.brown }}>{st === 'ok' ? 'Vom Ausbilder bestätigt' : 'Wartet auf Bestätigung vom Ausbilder'}</span>}</span>
                        </button>
                        {canTick && ((onUeben && n >= 3) || (onSpiel && u?.spiel)) && (
                          <div className="lt-ueben" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingLeft: '46px' }}>
                            {onUeben && n >= 3 && <button type="button" onClick={() => onUeben(it.id)} style={{ minHeight: '38px', padding: '0 12px', borderRadius: '999px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Üben: Quiz ({Math.min(15, n)} Fragen)</button>}
                            {onSpiel && u?.spiel && <button type="button" onClick={() => onSpiel(u.spiel![0])} style={{ minHeight: '38px', padding: '0 12px', borderRadius: '999px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Spiel: {u.spiel[1]}</button>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: TH.tintBlue, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>Lehrgänge außerhalb des Betriebs</div>
          <div style={{ fontSize: '15px', color: TH.muted }}>Das lernst du nicht bei uns im Geschäft, sondern in Lehrgängen. Die Termine bekommst du vom Ausbilder.</div>
          {AUSBILDUNG_LEHRGAENGE.map(it => {
            const on = !!plan[it.id];
            return (
              <button key={it.id} onClick={() => canTick && onToggle(it.id)} disabled={!canTick} role="checkbox" aria-checked={on} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '52px', padding: '10px 14px', borderRadius: '14px', border: `2px solid ${on ? TH.green : TH.line}`, backgroundColor: on ? TH.tintSage : TH.white, color: TH.ink, fontSize: '16px', textAlign: 'left', cursor: canTick ? 'pointer' : 'default' }}>
                <span aria-hidden="true" style={{ flex: '0 0 28px', height: '28px', borderRadius: '8px', border: `2px solid ${on ? TH.green : TH.line}`, backgroundColor: on ? TH.green : TH.white, color: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{on ? '✓' : ''}</span>
                <span style={{ flex: 1 }}>{it.text}{on ? ' (besucht)' : ''}</span>
              </button>
            );
          })}
        </div>
      </section>

      {azubiExtra}
      {canTick && (() => {
        const bs = azubiBadges(plan, exam);
        return (
          <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.1 }}>Deine Abzeichen <span style={{ fontSize: '18px', color: TH.muted, fontFamily: 'inherit' }}>{bs.filter(b => b.got).length} von {bs.length}</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {bs.map(b => (
                <div key={b.id} className={b.got ? 'lt-tilt lt-pop-in' : undefined} style={{ padding: '14px 10px', borderRadius: '18px', textAlign: 'center', backgroundColor: b.got ? TH.tintYellow : TH.cream, border: `2px solid ${b.got ? dc('#E8B500') : TH.line}`, opacity: b.got ? 1 : 0.55, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span className={b.got ? 'lt-emo-bob' : undefined} style={{ fontSize: '38px', lineHeight: 1, filter: b.got ? 'none' : 'grayscale(1)' }} aria-hidden="true">{b.got ? b.icon : '🔒'}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700 }}>{b.title}</span>
                  <span style={{ fontSize: '13px', color: TH.muted }}>{b.got ? 'Geschafft!' : b.how}</span>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>Berichtsheft: Notizen der Woche</div>
        <div style={{ fontSize: '16px', color: TH.brown, lineHeight: 1.45 }}>Notier dir die Woche über, was du gemacht hast. Alles wird gespeichert. Am Ende schreibst du es ins Berichtsheft ab.</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setWeek(week + 1)} style={chip(false)}>‹ Woche davor</button>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>{dmy(mon)} bis {dmy(sat)}</span>
          {week > 0 && <button onClick={() => setWeek(week - 1)} style={chip(false)}>Woche danach ›</button>}
        </div>
        {AUSBILDUNGSPLAN.filter(y => !lehrjahr || y.jahr <= Math.max(lehrjahr, 1)).map(y => (
          <div key={y.jahr} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>{y.jahr}. Lehrjahr</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {y.items.map(it => { const on = picked.includes(it.id); return <button key={it.id} onClick={() => { const np = on ? picked.filter(p => p !== it.id) : [...picked, it.id]; setPicked(np); speichern({ p: np }); }} style={chip(on)}>{on ? '✓ ' : ''}{it.text}</button>; })}
            </div>
          </div>
        ))}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', fontWeight: 700 }}>
          Sonst noch etwas im Betrieb?
          <input value={extra} onChange={e => setExtra(e.target.value)} onBlur={() => speichern({})} placeholder="z. B. Weihnachtsdeko im Schaufenster aufgebaut" style={{ minHeight: '50px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '17px', backgroundColor: TH.white, color: TH.ink }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', fontWeight: 700 }}>
          Berufsschule (ein Thema pro Zeile)
          <textarea value={schule} onChange={e => setSchule(e.target.value)} onBlur={() => speichern({})} rows={3} placeholder={'z. B. Warenkunde Getreide\nKalkulation Grundpreis'} style={{ padding: '12px 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '17px', fontFamily: 'inherit', backgroundColor: TH.white, color: TH.ink }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', fontWeight: 700 }}>
          Meine Notizen (nur für dich)
          <textarea className="lt-bericht-notiz" value={notiz} onChange={e => setNotiz(e.target.value)} onBlur={() => speichern({})} rows={4} aria-label="Meine Notizen der Woche" placeholder={'z. B. Kundin wollte Brot ohne Kümmel, Innsbrucker empfohlen'} style={{ padding: '12px 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '17px', fontFamily: 'inherit', backgroundColor: TH.white, color: TH.ink }} />
        </label>
        {canTick && ausApp.length > 0 && (
          <div className="lt-aus-app" style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.tintBlue, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Diese Woche in der App geübt</div>
            {ausApp.map(t => { const drin = notiz.includes(t); return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '15px' }}>
                <span style={{ flex: '1 1 200px' }}>{t}</span>
                <button type="button" disabled={drin} onClick={() => { const nn = (notiz.trim() ? notiz.trim() + '\n' : '') + t; setNotiz(nn); speichern({ n: nn }); }} style={{ minHeight: '38px', padding: '0 12px', borderRadius: '999px', border: 'none', backgroundColor: drin ? TH.line : TH.brown, color: dc('#FFF6E0'), fontSize: '14px', fontWeight: 700, cursor: drin ? 'default' : 'pointer' }}>{drin ? 'Übernommen' : 'In Notizen übernehmen'}</button>
              </div>
            ); })}
          </div>
        )}
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '17px', lineHeight: 1.5, padding: '16px', borderRadius: '16px', backgroundColor: TH.cream, border: `2px dashed ${TH.line}` }}>{reportText}</pre>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={copy} style={btnPrimary}>{copied ? '✓ Kopiert' : 'Bericht kopieren'}</button>
          {(picked.length > 0 || schule || extra || notiz) && <button onClick={() => { setPicked([]); setSchule(''); setExtra(''); setNotiz(''); speichern({ p: [], e: '', s: '', n: '' }); }} style={btnSecondary}>Leeren</button>}
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintYellow, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontWeight: 700, fontSize: '17px' }}>Tipps fürs Berichtsheft</div>
          {BERICHT_TIPPS.map((t, i) => <div key={i} style={{ fontSize: '16px', lineHeight: 1.4 }}>• {t}</div>)}
        </div>
      </section>

      {lernkarten}
      {(isAzubi || isAdmin) ? examSection : (
        <section style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span aria-hidden="true" style={{ fontSize: '36px' }}>🔒</span>
          <div>
            <div style={{ fontFamily: TH.serif, fontSize: '26px', lineHeight: 1.1 }}>Prüfungen</div>
            <div style={{ fontSize: '16px', color: TH.muted }}>Die Prüfungsfragen und die Prüfungssimulation sind nur für Azubis freigeschaltet.</div>
          </div>
        </section>
      )}
    </div>
  );
}
