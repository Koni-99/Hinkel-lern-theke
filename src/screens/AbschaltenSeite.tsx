// ═══ Version 266: Spielen → Zum Abschalten ═══
// Sechs Spiele zum Entspannen (Teigi-Lauf, Backstuben-Chaos, Lieferwagen-Tour, Schädlinge abwehren, Teig-Schleuder, Brot-Stapler).
// Die Spiele laufen als eigene Seite im iframe (public/abschalten/index.html, Quelle tools/abschalten). Die App schickt leichte
// Quizfragen und den eigenen Rekord hinein und bekommt am Rundenende die Punkte zurück. Keine Punkte für die Gesamtwertung.
import { useEffect, useMemo, useRef, useState } from 'react';
import { TH, cardStyle, PageHead } from '../ui/basis';
import { dc } from '../daten/data';
import { ABSCHALTEN_SPIELE, abschaltenSpiel, bestenliste, leichteFragen, meineRekorde, kollegenZiele, MEDAILLEN, medaille, MEDAILLE_NAMEN, goldSchon, heuteKey, herausforderungText, wochenliste, meineGeschlagenen, geschlagenText, GOLD_SACHEN, aufgabenSerie, type Geschlagen } from '../hilfen/abschalten';
import { HERAUSFORDERN_MAX } from '../hilfen/nachrichten';
import { TeigiGlas } from '../basis/laden';

const BASIS = (import.meta as any).env?.BASE_URL || '/';
const MERKER = 'lt_abschalten';

export type AbschaltenAktionen = { onGold: (key: string) => void; onAufgabe: (tag: string, id: string) => void; onHerausfordern: (an: Record<string, string>, text: string, key: string, punkte: number) => void };
export function AbschaltenSeite({ progress, userKey, fragen, onRekord, onBack, aktionen, wunsch }: { progress: Record<string, any>; userKey: string; fragen: any[]; onRekord: (key: string, punkte: number) => void; onBack: () => void; aktionen?: AbschaltenAktionen; wunsch?: { key: string; n: number } | null }) {
  const teigiRef = useRef<HTMLDivElement | null>(null);
  const meinPr = progress?.[userKey] || {};
  const [key, setKey] = useState<string>(() => { try { const k = sessionStorage.getItem(MERKER) || ''; return abschaltenSpiel(k) ? k : 'lauf'; } catch { return 'lauf'; } });
  const rahmen = useRef<HTMLIFrameElement | null>(null);
  const meine = meineRekorde(progress?.[userKey]);
  const frageListe = useMemo(() => leichteFragen(fragen), [fragen.length]);
  // Version 267: Kollegen-Rekorde als Ziel, Medaillen-Grenzen und Teigi mit Hut und Glas aus dem Laden
  const teigiSvg = () => { const svg = teigiRef.current?.querySelector('svg'); if (!svg) return ''; const k = svg.cloneNode(true) as SVGElement; k.removeAttribute('class'); k.removeAttribute('style'); k.setAttribute('width', '292'); k.setAttribute('height', '292'); k.setAttribute('viewBox', '-13 -22 146 146'); k.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); return k.outerHTML; };
  const daten = useRef<any>({});
  daten.current = { fragen: frageListe, rekord: meine, ziele: kollegenZiele(progress, userKey), medaillen: MEDAILLEN, goldSchon: goldSchon(meinPr), aufgabeErledigt: meinPr._abAufgaben?.[heuteKey()] ? heuteKey() : '' };
  const onRekordRef = useRef(onRekord); onRekordRef.current = onRekord;
  const aktionenRef = useRef(aktionen); aktionenRef.current = aktionen;
  // Version 268: Kollegen herausfordern (Auswahl der Kollegen)
  const [fordern, setFordern] = useState<{ key: string; punkte: number } | null>(null);
  const [gewaehlt, setGewaehlt] = useState<Record<string, string>>({});
  const kollegen = Object.entries(progress || {}).filter(([k, pr]) => k !== 'admin' && k !== userKey && pr && typeof pr === 'object')
    .map(([k, pr]: [string, any]) => ({ k, name: String(pr._displayName || k) })).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  useEffect(() => { if (wunsch && abschaltenSpiel(wunsch.key)) setKey(wunsch.key); }, [wunsch?.n]);
  // Version 269: Bestenliste „Diese Woche“ oder „Für immer“, Kollegen haben meine Herausforderung geschlagen
  const [woche, setWoche] = useState(true);
  const [gross, setGross] = useState(false);
  useEffect(() => { setGross(false); }, [key]);
  const okKey = `lt_abgeschlagen_ok_${userKey}`;
  const [okIds, setOkIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(okKey) || '[]'); } catch { return []; } });
  const geschlagen = meineGeschlagenen(progress, userKey).filter((g) => !okIds.includes(g.id)).slice(0, 3);
  const erledigt = (g: Geschlagen) => { const n = [...okIds, g.id].slice(-200); setOkIds(n); try { localStorage.setItem(okKey, JSON.stringify(n)); } catch { /* egal */ } };
  useEffect(() => { try { sessionStorage.setItem(MERKER, key); } catch { /* egal */ } }, [key]);
  // Spielfeld ganz ins Bild holen (am Handy liegt sonst die Leiste unten darüber)
  useEffect(() => { const t = window.setTimeout(() => rahmen.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350); return () => window.clearTimeout(t); }, [key]);
  useEffect(() => {
    // Teigi-Begleiter ausblenden, er säße auf den Knöpfen der Spiele
    document.body.classList.add('lt-abschalten-offen');
    const nachricht = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== rahmen.current?.contentWindow) return;
      const d: any = e.data || {};
      if (d.typ === 'lt-abschalten-bereit') rahmen.current?.contentWindow?.postMessage({ typ: 'lt-abschalten-daten', ...daten.current, teigiSvg: teigiSvg(), teigiSkala: 146 / 116 }, location.origin);
      if (d.typ === 'lt-abschalten-ende' && abschaltenSpiel(d.key)) onRekordRef.current(d.key, Number(d.punkte) || 0);
      if (d.typ === 'lt-abschalten-gold' && abschaltenSpiel(d.key)) aktionenRef.current?.onGold(d.key);
      if (d.typ === 'lt-abschalten-aufgabe' && typeof d.tag === 'string' && typeof d.id === 'string') aktionenRef.current?.onAufgabe(d.tag, d.id);
      // Version 282: während der Runde liegt das Spielfeld groß und mittig über allem (im Spiel kann man die Seite nicht schieben)
      if (d.typ === 'lt-abschalten-start') setGross(true);
      if (d.typ === 'lt-abschalten-stopp') { setGross(false); window.setTimeout(() => rahmen.current?.scrollIntoView({ block: 'center' }), 30); }
      if (d.typ === 'lt-abschalten-wechsel' && abschaltenSpiel(d.key)) setKey(d.key);
      if (d.typ === 'lt-abschalten-herausfordern' && abschaltenSpiel(d.key) && Number(d.punkte) > 0) { setGewaehlt({}); setFordern({ key: d.key, punkte: Math.floor(Number(d.punkte)) }); }
    };
    addEventListener('message', nachricht);
    return () => { removeEventListener('message', nachricht); document.body.classList.remove('lt-abschalten-offen'); };
  }, []);
  const spiel = abschaltenSpiel(key)!;
  const liste = woche ? wochenliste(progress, key, 5) : bestenliste(progress, key, 5);
  const ich = meine[key] || 0;
  return (
    <div className="lt-abschalten" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <style>{`body.lt-abschalten-offen .lt-teigi-begleiter{display:none !important}
.lt-abschalten-wahl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
@media (min-width:700px){.lt-abschalten-wahl{grid-template-columns:repeat(6,minmax(0,1fr))}}
.lt-abschalten-rahmen{display:block;width:min(100%, 420px, calc((100dvh - 150px) * .75));min-width:min(100%, 300px);aspect-ratio:3/4;margin:0 auto;border:none;border-radius:24px;background:#2A1A10;box-shadow:0 24px 50px -24px rgba(31,20,12,.75),0 0 0 4px #3A2010,0 0 0 6px #C98A00}
@media (min-width:700px){.lt-abschalten-rahmen{width:min(100%, 660px, calc((100dvh - 120px) * .75))}}
.lt-abschalten-rahmen.gross{position:fixed;z-index:1201;left:50%;top:50%;transform:translate(-50%,-50%);width:min(100vw, calc(100dvh * .75), 760px);min-width:0;margin:0;border-radius:16px;box-shadow:0 0 0 3px #3A2010}
.lt-abschalten-dunkel{position:fixed;inset:0;z-index:1200;background:#1A0F08}
.lt-abschalten-umschalter{display:inline-flex;gap:4px;padding:4px;border-radius:999px;background:rgba(75,42,20,.08);align-self:flex-start}
.lt-abschalten-umschalter button{min-height:36px;padding:0 14px;border-radius:999px;border:none;background:transparent;font-weight:700;font-size:14px;cursor:pointer;color:inherit}
.lt-abschalten-umschalter button[aria-pressed="true"]{background:#4B2A14;color:#FFE9B0}
.lt-sammlung-raster{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}`}</style>
      <PageHead title="Zum Abschalten" subtitle="Spielen und den Kopf frei bekommen. Keine Punkte für die Bestenliste, nur dein eigener Rekord." onBack={onBack} backLabel="Zu den Spielen" />
      <div className="lt-abschalten-wahl" role="tablist" aria-label="Spiel auswählen">
        {ABSCHALTEN_SPIELE.map((s) => {
          const an = s.key === key;
          return (
            <button key={s.key} role="tab" aria-selected={an} onClick={() => setKey(s.key)} style={{ minHeight: '50px', padding: '6px 6px', borderRadius: '14px', border: 'none', cursor: 'pointer', textAlign: 'center', fontWeight: 800, fontSize: '14px', lineHeight: 1.15, background: an ? 'linear-gradient(160deg,#5A3820,#3A2010)' : dc('#FFFFFF'), color: an ? '#FFE9B0' : TH.ink, boxShadow: '0 1px 2px rgba(31,20,12,.06), 0 8px 18px -12px rgba(31,20,12,.45)' }}>
              {s.titel}
              {meine[s.key] ? <span style={{ display: 'block', marginTop: '3px', fontSize: '11.5px', fontWeight: 700, color: an ? '#FFD86B' : '#A8740A' }}>{medaille(s.key, meine[s.key]) ? `${MEDAILLE_NAMEN[medaille(s.key, meine[s.key])]} · ` : ''}Rekord {meine[s.key].toLocaleString('de-DE')}</span> : null}
            </button>
          );
        })}
      </div>
      {/* unsichtbar: daraus wird Teigis Grafik mit Hut und Glas für die Spiele */}
      <div ref={teigiRef} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}><TeigiGlas stufe={2} laune="froh" size={72} hut={meinPr._teigiHut || null} glas={meinPr._teigiGlas || null} /></div>
      {geschlagen.map((g) => (
        <div key={g.id} className="lt-geschlagen" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '6px solid #C98A00' }}>
          <div style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.4 }}>{geschlagenText(g)}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="lt-zurueckschlagen" onClick={() => { erledigt(g); setKey(g.key); }} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: 'none', backgroundColor: TH.brown, color: '#FFF6E0', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>Zurückschlagen</button>
            <button type="button" onClick={() => erledigt(g)} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: `2px solid ${TH.line || '#E5D6BC'}`, backgroundColor: 'transparent', color: TH.ink, fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      ))}
      {gross && <div className="lt-abschalten-dunkel" aria-hidden="true" />}
      <iframe ref={rahmen} className={`lt-abschalten-rahmen${gross ? ' gross' : ''}`} title={spiel.titel} src={`${BASIS}abschalten/index.html#${key}`} />
      {fordern && (
        <div className="lt-overlay" onClick={() => setFordern(null)} style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="lt-dialog lt-pop-in lt-fordern" role="dialog" aria-modal="true" aria-label="Kollegen herausfordern" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', maxHeight: '88vh', overflowY: 'auto', backgroundColor: dc('#FFFBF2'), borderRadius: '24px', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '12px', color: TH.ink }}>
            <div style={{ fontFamily: TH.serif, fontSize: '26px', lineHeight: 1.15 }}>Kollegen herausfordern</div>
            <div style={{ fontSize: '16px', color: TH.muted }}>Sie bekommen eine persönliche Nachricht: „{herausforderungText(fordern.key, fordern.punkte)}“</div>
            {kollegen.length === 0 ? <div style={{ fontSize: '16px' }}>Noch keine Kollegen in der App.</div> : (
              <div className="lt-fordern-wer" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {kollegen.map((p) => { const an = !!gewaehlt[p.k]; return (
                  <button key={p.k} type="button" aria-pressed={an} onClick={() => setGewaehlt((g) => { const n = { ...g }; if (n[p.k]) delete n[p.k]; else if (Object.keys(n).length < HERAUSFORDERN_MAX) n[p.k] = p.name; return n; })} style={{ minHeight: '44px', padding: '0 14px', borderRadius: '999px', border: `2px solid ${an ? '#2F9A47' : '#E5D6BC'}`, backgroundColor: an ? '#EAF6E4' : dc('#FFFFFF'), color: TH.ink, fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>{an ? '✓ ' : ''}{p.name}</button>
                ); })}
              </div>
            )}
            <div style={{ fontSize: '14px', color: TH.muted }}>Höchstens {HERAUSFORDERN_MAX} auf einmal.</div>
            <button type="button" className="lt-fordern-los" disabled={!Object.keys(gewaehlt).length} onClick={() => { aktionenRef.current?.onHerausfordern(gewaehlt, herausforderungText(fordern.key, fordern.punkte), fordern.key, fordern.punkte); setFordern(null); }} style={{ minHeight: '54px', border: 'none', borderRadius: '16px', backgroundColor: Object.keys(gewaehlt).length ? TH.brown : '#CBBBA4', color: '#FFF6E0', fontSize: '18px', fontWeight: 800, cursor: Object.keys(gewaehlt).length ? 'pointer' : 'default' }}>{Object.keys(gewaehlt).length === 1 ? 'Herausforderung schicken' : Object.keys(gewaehlt).length ? `An ${Object.keys(gewaehlt).length} Kollegen schicken` : 'Kollegen auswählen'}</button>
            <button type="button" onClick={() => setFordern(null)} style={{ minHeight: '44px', border: 'none', background: 'transparent', color: TH.muted, fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Abbrechen</button>
          </div>
        </div>
      )}
      <section className="lt-abschalten-liste" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontFamily: TH.serif, fontSize: '24px', lineHeight: 1.15 }}>Bestenliste: {spiel.titel}</div>
        <div className="lt-abschalten-umschalter" role="group" aria-label="Zeitraum"><button type="button" aria-pressed={woche} onClick={() => setWoche(true)}>Diese Woche</button><button type="button" aria-pressed={!woche} onClick={() => setWoche(false)}>Für immer</button></div>
        <div style={{ fontSize: '15px', color: TH.muted }}>{spiel.kurz}. {ich ? `Dein Rekord: ${ich.toLocaleString('de-DE')}.` : 'Spiel eine Runde, dann stehst du hier.'}</div>
        {liste.length === 0 ? <div style={{ fontSize: '16px', color: TH.muted }}>{woche ? 'Diese Woche hat hier noch niemand gespielt. Die Liste startet jeden Montag neu.' : 'Noch niemand hat hier gespielt.'}</div> : liste.map((z, i) => (
          <div key={z.k} className="lt-abschalten-zeile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '12px', backgroundColor: z.k === userKey ? TH.tintYellow : 'transparent' }}>
            <span style={{ flex: '0 0 26px', fontWeight: 800, color: i === 0 ? '#A8740A' : TH.muted }}>{i + 1}.</span>
            <span style={{ flex: 1, minWidth: 0, fontWeight: z.k === userKey ? 800 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.name}{z.k === userKey ? ' (du)' : ''}</span>
            <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{z.punkte.toLocaleString('de-DE')}</span>
          </div>
        ))}
      </section>
      <details className="lt-sammlung" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <summary style={{ cursor: 'pointer', fontFamily: TH.serif, fontSize: '22px', lineHeight: 1.2 }}>Meine Sammlung <span style={{ fontFamily: 'inherit', fontSize: '15px', color: TH.muted }}>({Object.keys(GOLD_SACHEN).filter((k) => Number(meinPr._abGold?.[k]) > 0).length} von 6 Goldstücken, {Object.keys(meinPr._abAufgaben || {}).length} Tagesaufgaben)</span></summary>
        <div style={{ fontSize: '15px', color: TH.muted, marginTop: '8px' }}>Medaillen und Goldstücke je Spiel.{aufgabenSerie(meinPr) > 1 ? ` Tagesaufgaben ${aufgabenSerie(meinPr)} Tage in Folge geschafft.` : ''}</div>
        <div className="lt-sammlung-raster" style={{ marginTop: '8px' }}>
          {ABSCHALTEN_SPIELE.map((sp) => { const r = meine[sp.key] || 0, m = medaille(sp.key, r), g = GOLD_SACHEN[sp.key], hat = Number(meinPr._abGold?.[sp.key]) > 0; return (
            <div key={sp.key} className="lt-sammlung-feld" style={{ padding: '10px 12px', borderRadius: '14px', backgroundColor: dc('#FFFBF2'), border: '1.5px solid #EADBC0', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              <strong style={{ fontSize: '15px' }}>{sp.titel}</strong>
              <span style={{ color: m ? '#8A5A0A' : TH.muted, fontWeight: 700 }}>{m ? `${MEDAILLE_NAMEN[m]}-Medaille` : 'Noch keine Medaille'}</span>
              <span style={{ color: hat ? '#2F7A3A' : TH.muted }}>{hat ? `${g.ding} gefunden: ${g.sache}` : `${g.ding}: noch nicht gefunden`}</span>
            </div>
          ); })}
        </div>
      </details>
    </div>
  );
}
