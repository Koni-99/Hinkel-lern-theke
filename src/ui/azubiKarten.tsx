// ═══ Version 256: Karten im Azubi-Bereich ═══
// Frage an den Ausbilder (privat), Mein Wochenziel, Lehrjahr-Rückblick (Sommerferien), Fragen-Liste für den Ausbilder.
import { useState } from 'react';
import { TH, cardStyle, btnPrimary } from './basis';
import { dc } from '../daten/data';
import { LtIcon, ICON } from '../basis/symbole';
import { AzubiFrage, FRAGE_MAX, ZIEL_MAX, Wochenziel, Rueckblick } from '../hilfen/azubiExtras';

const datum = (ts: number) => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: '2-digit' });
const feld = { width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '16px', fontFamily: 'inherit', backgroundColor: TH.white, color: TH.ink };
const titel = (t: string, icon: string[]) => <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: TH.serif, fontSize: '28px', lineHeight: 1.1 }}><LtIcon paths={icon} size={26} />{t}</div>;

/** Azubi: eine Frage an den Ausbilder, nur er sieht sie */
export function FrageAnAusbilder({ fragen, onFrage, onLoeschen }: { fragen: AzubiFrage[]; onFrage: (t: string) => void; onLoeschen: (id: string) => void }) {
  const [t, setT] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <section className="lt-azubi-frage" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {titel('Frage an den Ausbilder', ICON.chat)}
      <div style={{ fontSize: '16px', color: TH.brown, lineHeight: 1.45 }}>Etwas nicht verstanden? Frag einfach. Nur dein Ausbilder sieht die Frage, keiner sonst.</div>
      <textarea value={t} onChange={(e) => setT(e.target.value.slice(0, FRAGE_MAX))} rows={3} placeholder="z. B. Warum braucht Roggenbrot Sauerteig?" aria-label="Deine Frage an den Ausbilder" style={feld} />
      <button type="button" disabled={!t.trim()} onClick={() => { onFrage(t); setT(''); setMsg('Deine Frage ist beim Ausbilder. Die Antwort steht dann hier.'); }} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: t.trim() ? 1 : 0.5 }}>Frage schicken</button>
      {msg && <div role="status" style={{ fontSize: '15px', fontWeight: 700, color: TH.green }}>{msg}</div>}
      {fragen.map((f) => (
        <div key={f.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: f.a ? TH.tintSage : TH.cream, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '16px', lineHeight: 1.45 }}>
          <div><strong>„{f.q}“</strong> <span style={{ fontSize: '14px', color: TH.muted }}>· {datum(f.ts)}</span></div>
          {f.a ? <div><strong>Antwort:</strong> {f.a}{!f.gesehen && <span style={{ marginLeft: '8px', padding: '1px 8px', borderRadius: '999px', backgroundColor: TH.yellow, fontSize: '13px', fontWeight: 800 }}>neu</span>}</div> : <div style={{ color: TH.muted }}>Wartet auf die Antwort</div>}
          {!f.a && <button type="button" onClick={() => onLoeschen(f.id)} style={{ alignSelf: 'flex-start', minHeight: '38px', padding: '0 12px', borderRadius: '999px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Zurückziehen</button>}
        </div>
      ))}
    </section>
  );
}

/** Ausbilder: Fragen der Azubis beantworten */
export function AzubiFragenAntworten({ fragen, onAntwort }: { fragen: AzubiFrage[]; onAntwort: (user: string, id: string, text: string) => void }) {
  const [a, setA] = useState<Record<string, string>>({});
  const offen = fragen.filter((f) => !f.a);
  if (!fragen.length) return null;
  return (
    <section className="lt-azubi-fragen-admin" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {titel(`Fragen deiner Azubis${offen.length ? ` (${offen.length} neu)` : ''}`, ICON.chat)}
      <div style={{ fontSize: '15px', color: TH.muted }}>Nur du siehst diese Fragen. Deine Antwort sieht nur der Azubi, der gefragt hat.</div>
      {offen.map((f) => (
        <div key={f.user + f.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.tintYellow, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '16px' }}>
          <div style={{ fontSize: '14px', color: TH.muted }}>{f.name} · {datum(f.ts)}</div>
          <strong>„{f.q}“</strong>
          <textarea value={a[f.id] || ''} onChange={(e) => setA((x) => ({ ...x, [f.id]: e.target.value.slice(0, FRAGE_MAX) }))} rows={2} placeholder="Deine Antwort" aria-label={`Antwort an ${f.name}`} style={feld} />
          <button type="button" disabled={!(a[f.id] || '').trim()} onClick={() => { onAntwort(f.user, f.id, a[f.id] || ''); setA((x) => ({ ...x, [f.id]: '' })); }} style={{ ...btnPrimary, alignSelf: 'flex-start', minHeight: '46px', opacity: (a[f.id] || '').trim() ? 1 : 0.5 }}>Antworten</button>
        </div>
      ))}
      {fragen.filter((f) => f.a).length > 0 && (
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '16px', minHeight: '32px' }}>Beantwortet ({fragen.filter((f) => f.a).length})</summary>
          {fragen.filter((f) => f.a).map((f) => <div key={f.user + f.id} style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '12px', backgroundColor: TH.cream, fontSize: '15px', lineHeight: 1.45 }}><span style={{ color: TH.muted }}>{f.name}:</span> „{f.q}“<br /><strong>Antwort:</strong> {f.a}</div>)}
        </details>
      )}
    </section>
  );
}

/** Azubi: Ziel für diese Woche, Rückfrage zur letzten Woche */
export function WochenzielKarte({ dieseWoche, letzteWoche, ziele, onSetzen, onBewerten }: {
  dieseWoche: string; letzteWoche: string; ziele: Record<string, Wochenziel>;
  onSetzen: (woche: string, t: string) => void; onBewerten: (woche: string, ok: boolean) => void;
}) {
  const jetzt = ziele[dieseWoche];
  const [t, setT] = useState(jetzt?.t || '');
  const [bearbeiten, setBearbeiten] = useState(!jetzt);
  const alt = ziele[letzteWoche];
  const verlauf = Object.entries(ziele).filter(([w]) => w < dieseWoche).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 4);
  return (
    <section className="lt-wochenziel" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {titel('Mein Wochenziel', ICON.flag)}
      {alt && alt.ok === undefined && (
        <div className="lt-ziel-frage" style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.tintBlue, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>Letzte Woche wolltest du: <strong>„{alt.t}“</strong>. Geschafft?</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onBewerten(letzteWoche, true)} style={{ minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: 'none', backgroundColor: TH.green, color: dc('#FFFFFF'), fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Ja, geschafft</button>
            <button type="button" onClick={() => onBewerten(letzteWoche, false)} style={{ minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Noch nicht ganz</button>
          </div>
        </div>
      )}
      {!bearbeiten && jetzt ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.tintYellow }}>
          <span style={{ flex: '1 1 200px', fontSize: '18px', fontWeight: 700 }}>„{jetzt.t}“</span>
          <button type="button" onClick={() => setBearbeiten(true)} style={{ minHeight: '40px', padding: '0 14px', borderRadius: '999px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Ändern</button>
        </div>
      ) : (<>
        <div style={{ fontSize: '16px', color: TH.brown }}>Was willst du diese Woche lernen oder schaffen?</div>
        <input value={t} onChange={(e) => setT(e.target.value.slice(0, ZIEL_MAX))} placeholder="z. B. Kassenabrechnung alleine machen" aria-label="Mein Wochenziel" style={{ ...feld, minHeight: '48px' }} />
        <button type="button" disabled={!t.trim()} onClick={() => { onSetzen(dieseWoche, t); setBearbeiten(false); }} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: t.trim() ? 1 : 0.5 }}>Ziel speichern</button>
      </>)}
      {verlauf.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '15px' }}>
          <span style={{ fontWeight: 700, color: TH.muted }}>Deine letzten Ziele</span>
          {verlauf.map(([w, z]) => <span key={w}>{z.ok === true ? '✓' : z.ok === false ? '·' : '?'} {z.t} <span style={{ color: TH.muted }}>(Woche ab {w.split('-').reverse().slice(0, 2).join('.')}.)</span></span>)}
        </div>
      )}
    </section>
  );
}

/** Lehrjahr-Rückblick (Sommerferien) */
export function RueckblickKarte({ r, lehrjahr }: { r: Rueckblick; lehrjahr: number }) {
  const zeile = (l: string, w: string) => <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '17px' }}><span>{l}</span><strong style={{ whiteSpace: 'nowrap' }}>{w}</strong></div>;
  return (
    <section className="lt-papier lt-rueckblick" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#FFF6D8', color: '#2A1A0E', border: '2px solid #F2D27A' }}>
      {titel('Rückblick auf dein Lehrjahr', ICON.sun)}
      <div style={{ fontSize: '16px', color: '#6B4A30' }}>Schöne Sommerferien! Das hast du {lehrjahr ? `im ${lehrjahr}. Lehrjahr ` : 'in diesem Ausbildungsjahr '}geschafft:</div>
      {zeile('Tage mit Lernen in der App', String(r.lerntage))}
      {zeile('Ausbildungsplan bestätigt', `${r.planOk} von ${r.planGesamt}`)}
      {r.zieleGesamt > 0 && zeile('Wochenziele geschafft', `${r.zieleGeschafft} von ${r.zieleGesamt}`)}
      {(r.zpBest > 0 || r.apBest > 0) && zeile('Bestwert Prüfung', [r.zpBest ? `ZP ${r.zpBest} %` : '', r.apBest ? `AP ${r.apBest} %` : ''].filter(Boolean).join(', '))}
      {zeile('Berufsschul-Karten sicher gelernt', String(r.kartenGelernt))}
      {r.eigeneKarten > 0 && zeile('Eigene Lernkarten für alle', String(r.eigeneKarten))}
      <div style={{ fontSize: '15px', color: '#6B4A30' }}>Erhol dich gut. Nach den Ferien geht es weiter, Schritt für Schritt.</div>
    </section>
  );
}
