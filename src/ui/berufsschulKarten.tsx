// ═══ Version 254: Berufsschul-Lernkarten im Ausbildungs-Bereich ═══
// Fachbegriffe als Karteikarte (Begriff vorne, Erklärung hinten) mit Lernkasten (gleicher _lernkasten wie die anderen Karten).
// Dazu eigene Karten der Azubis: erst nach Bestätigung durch den Ausbilder für alle sichtbar.
import { useState, useMemo } from 'react';
import { TH, cardStyle, btnPrimary } from './basis';
import { dc } from '../daten/data';
import { BERUFSSCHUL_KARTEN, BS_FAECHER } from '../daten/berufsschule';
import { fachVon, FAECHER } from '../hilfen/lernkasten';
import type { EigeneKarte } from '../hilfen/eigeneKarten';
import { BEGRIFF_MAX, ERKLAERUNG_MAX } from '../hilfen/eigeneKarten';

type Karte = { key: string; fach: string; begriff: string; erklaerung: string; von?: string; warte?: boolean };

export function BerufsschulKarten({ meKey, lernkasten = {}, onBewerten, eigene = [], onSchreiben, onLoeschen }: {
  meKey: string; lernkasten?: Record<string, number>; onBewerten?: (key: string, gewusst: boolean) => void;
  eigene?: EigeneKarte[]; onSchreiben?: (begriff: string, erklaerung: string, fach: string) => void; onLoeschen?: (id: string) => void;
}) {
  const [fach, setFach] = useState('Alle');
  const [nr, setNr] = useState(0);
  const [umgedreht, setUmgedreht] = useState(false);
  const [start] = useState(() => ({ ...lernkasten })); // Reihenfolge nach Fach beim Öffnen, damit Karten nicht springen
  const [schreiben, setSchreiben] = useState(false);
  const [b, setB] = useState(''); const [e, setE] = useState(''); const [f, setF] = useState<string>(BS_FAECHER[0]);
  const [msg, setMsg] = useState('');
  const alle: Karte[] = useMemo(() => [
    ...BERUFSSCHUL_KARTEN.map((k) => ({ key: 'bs-' + k.id, fach: k.fach, begriff: k.begriff, erklaerung: k.erklaerung })),
    ...eigene.filter((k) => k.s === 'ok' || (k.user === meKey && k.s === 'warte')).map((k) => ({ key: `ek-${k.user}-${k.id}`, fach: k.f, begriff: k.b, erklaerung: k.e, von: k.name, warte: k.s === 'warte' })),
  ], [eigene, meKey]);
  const stapel = alle.filter((k) => fach === 'Alle' || (fach === 'Eigene Karten' ? !!k.von : k.fach === fach)).sort((x, y) => fachVon(start, x.key) - fachVon(start, y.key));
  const k = stapel[Math.min(nr, Math.max(0, stapel.length - 1))];
  const geh = (n: number) => { setNr(((n % stapel.length) + stapel.length) % stapel.length); setUmgedreht(false); };
  const bewerten = (gewusst: boolean) => { if (k && onBewerten) onBewerten(k.key, gewusst); geh(nr + 1); };
  const meine = eigene.filter((x) => x.user === meKey);
  const chip = (an: boolean) => ({ minHeight: '40px', padding: '0 14px', borderRadius: '999px', border: an ? 'none' : `2px solid ${TH.line}`, backgroundColor: an ? TH.brown : TH.white, color: an ? dc('#FFF6E0') : TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer' });
  const feld = { width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '16px', fontFamily: 'inherit', backgroundColor: TH.white, color: TH.ink };

  return (
    <section className="lt-bs-karten" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.1 }}>Berufsschule: Lernkarten</div>
      <div style={{ fontSize: '16px', color: TH.brown, lineHeight: 1.45 }}>Fachbegriffe für Schule und Prüfung. Tippe auf die Karte, dann siehst du die Erklärung. „Wusste ich“ legt sie im Lernkasten nach hinten.</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['Alle', ...BS_FAECHER, ...(alle.some((x) => x.von) ? ['Eigene Karten'] : [])].map((x) => <button key={x} type="button" onClick={() => { setFach(x); setNr(0); setUmgedreht(false); }} style={chip(fach === x)}>{x}</button>)}
      </div>
      {k ? (<>
        <button type="button" className="lt-papier lt-bs-karte" onClick={() => setUmgedreht(!umgedreht)} aria-label={umgedreht ? 'Karte umdrehen: Begriff' : 'Karte umdrehen: Erklärung'}
          style={{ position: 'relative', minHeight: '220px', padding: '22px 22px 22px 34px', borderRadius: '16px', border: `2px solid ${dc('#E6D6B6')}`, backgroundColor: '#FFFDF7', color: '#2A1A0E', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px', backgroundImage: 'repeating-linear-gradient(#FFFDF7 0 31px, #D6E4F5 31px 32px)', boxShadow: '0 6px 0 -2px #F1E3C8, 0 12px 0 -4px #E9D7B5' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '22px', top: 0, bottom: 0, width: '2px', backgroundColor: '#E8A0A0' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#8A6A50' }}>{k.fach}{k.von ? ` · Karte von ${k.von}` : ''}{k.warte ? ' · wartet auf Bestätigung' : ''}</span>
          {!umgedreht
            ? <span className="lt-bs-begriff" style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.2 }}>{k.begriff}</span>
            : <span className="lt-bs-erklaerung" style={{ fontSize: '19px', lineHeight: 1.5 }}>{k.erklaerung}</span>}
          <span style={{ fontSize: '13px', color: '#8A6A50' }}>{umgedreht ? 'Tippen: zurück zum Begriff' : 'Tippen: Erklärung zeigen'} · Fach {fachVon(lernkasten, k.key)} von {FAECHER}</span>
        </button>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {umgedreht && onBewerten ? (<>
            <button type="button" onClick={() => bewerten(false)} style={{ ...chip(false), minHeight: '50px', flex: '1 1 120px' }}>Nochmal</button>
            <button type="button" onClick={() => bewerten(true)} style={{ ...chip(true), minHeight: '50px', flex: '1 1 120px', backgroundColor: TH.green }}>Wusste ich</button>
          </>) : (<>
            <button type="button" onClick={() => geh(nr - 1)} style={chip(false)} aria-label="Vorherige Karte">‹ Zurück</button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '15px', color: TH.muted }}>Karte {Math.min(nr, stapel.length - 1) + 1} von {stapel.length}</span>
            <button type="button" onClick={() => geh(nr + 1)} style={chip(false)} aria-label="Nächste Karte">Weiter ›</button>
          </>)}
        </div>
      </>) : <div style={{ fontSize: '16px', color: TH.muted }}>Keine Karten in diesem Fach.</div>}

      {onSchreiben && (
        <div className="lt-eigene-karte" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', backgroundColor: TH.tintYellow }}>
          {!schreiben ? (
            <button type="button" onClick={() => { setSchreiben(true); setMsg(''); }} style={{ ...chip(false), alignSelf: 'flex-start', minHeight: '46px' }}>Eigene Karte schreiben</button>
          ) : (<>
            <strong style={{ fontSize: '17px' }}>Eigene Karte aus dem Unterricht</strong>
            <input value={b} onChange={(x) => setB(x.target.value.slice(0, BEGRIFF_MAX))} placeholder="Begriff, z. B. Teigausbeute" aria-label="Begriff" style={feld} />
            <textarea value={e} onChange={(x) => setE(x.target.value.slice(0, ERKLAERUNG_MAX))} rows={3} placeholder="Erklärung in eigenen Worten" aria-label="Erklärung" style={feld} />
            <select value={f} onChange={(x) => setF(x.target.value)} aria-label="Fach" style={{ ...feld, minHeight: '46px' }}>{BS_FAECHER.map((x) => <option key={x} value={x}>{x}</option>)}</select>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" disabled={!b.trim() || !e.trim()} onClick={() => { onSchreiben(b, e, f); setB(''); setE(''); setSchreiben(false); setMsg('Danke! Deine Karte ist beim Ausbilder. Sobald er sie bestätigt, lernen alle Azubis damit.'); }} style={{ ...btnPrimary, opacity: b.trim() && e.trim() ? 1 : 0.5 }}>Zum Bestätigen schicken</button>
              <button type="button" onClick={() => setSchreiben(false)} style={chip(false)}>Abbrechen</button>
            </div>
          </>)}
          {msg && <div role="status" style={{ fontSize: '15px', fontWeight: 700, color: TH.green }}>{msg}</div>}
          {meine.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: TH.brown }}>Deine Karten</span>
              {meine.map((x) => (
                <div key={x.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', padding: '8px 10px', borderRadius: '12px', backgroundColor: TH.white, fontSize: '15px' }}>
                  <span style={{ flex: '1 1 160px' }}><strong>{x.b}</strong> · {x.s === 'ok' ? <span style={{ color: TH.green }}>bestätigt</span> : x.s === 'nein' ? <span style={{ color: TH.red }}>nicht übernommen</span> : 'wartet auf Bestätigung'}</span>
                  {onLoeschen && <button type="button" onClick={() => onLoeschen(x.id)} style={{ ...chip(false), minHeight: '36px' }}>Löschen</button>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Ausbilder: eigene Karten der Azubis bestätigen oder ablehnen */
export function KartenBestaetigen({ karten, onEntscheiden }: { karten: EigeneKarte[]; onEntscheiden: (user: string, id: string, ok: boolean) => void }) {
  const offen = karten.filter((k) => k.s === 'warte');
  if (!offen.length) return null;
  return (
    <section className="lt-karten-bestaetigen" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontFamily: TH.serif, fontSize: '26px', lineHeight: 1.1 }}>Neue Lernkarten zum Bestätigen ({offen.length})</div>
      <div style={{ fontSize: '15px', color: TH.muted }}>Von deinen Azubis aus dem Unterricht. Bestätigte Karten sehen alle Azubis unter „Berufsschule: Lernkarten“.</div>
      {offen.map((k) => (
        <div key={k.user + k.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', lineHeight: 1.45 }}>
          <div style={{ fontSize: '14px', color: TH.muted }}>{k.name} · {k.f}</div>
          <strong style={{ fontSize: '18px' }}>{k.b}</strong>
          <span>{k.e}</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onEntscheiden(k.user, k.id, true)} style={{ minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: 'none', backgroundColor: TH.green, color: dc('#FFFFFF'), fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Bestätigen</button>
            <button type="button" onClick={() => onEntscheiden(k.user, k.id, false)} style={{ minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Nicht übernehmen</button>
          </div>
        </div>
      ))}
    </section>
  );
}
