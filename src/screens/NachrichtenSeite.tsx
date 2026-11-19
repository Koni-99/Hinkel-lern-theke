// ═══ Einzel-Nachrichten: Postfach, Nachricht schreiben (Admin, Koni, mit Recht) und Pop-up ═══
// Logik und Speicherorte: src/hilfen/nachrichten.ts
import { useState, useEffect } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary, PageHead } from '../ui/basis';
import { LT } from '../basis/marke';
import { LtIcon, ICON } from '../basis/symbole';
import { CloudPayload } from '../types';
import {
  NACHRICHT_MAX, ANTWORT_MAX, IMMER_SCHREIBEN, darfSchreiben, rechteListe, rechtSetzen, meinePost, meineGesendeten,
  neueAntworten, antwortenGesehen, nachrichtSchicken, nachrichtLoeschen, nachrichtGelesen,
} from '../hilfen/nachrichten';

type Mutate = (updater: (curr: CloudPayload) => CloudPayload) => void;
const datum = (ts: number) => new Date(ts).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const feld = { width: '100%', boxSizing: 'border-box' as const, padding: '12px 14px', borderRadius: '14px', border: `2px solid ${TH.line}`, fontSize: '17px', fontFamily: 'inherit', backgroundColor: dc('#FFFFFF'), color: TH.ink };
const chip = (aktiv: boolean) => ({ minHeight: '44px', padding: '0 14px', borderRadius: '999px', border: aktiv ? `2px solid ${TH.brown}` : `2px solid ${TH.line}`, backgroundColor: aktiv ? TH.brown : dc('#FFFFFF'), color: aktiv ? dc('#FFF6E0') : TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' });
const nameVon = (progress: CloudPayload['progress'] | undefined, k: string) => (((progress || {})[k] as any)?._displayName) || k;

// ── Nachricht schreiben + gesendete Nachrichten (auch im Ausbilder-Bereich) ──
export function NachrichtSchreiben({ cloudData, userKey, name, alleMitarbeiter, mutateCloudData, setToast, isAdmin }: {
  cloudData: CloudPayload; userKey: string; name: string; alleMitarbeiter: string[]; mutateCloudData: Mutate; setToast: (t: string) => void; isAdmin: boolean;
}) {
  const progress = cloudData.progress;
  const [an, setAn] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [suche, setSuche] = useState('');
  const leute = alleMitarbeiter.filter((k) => k !== userKey && k !== 'admin').map((k) => ({ k, name: nameVon(progress, k) })).sort((a, b) => a.name.localeCompare(b.name));
  const gefiltert = suche.trim() ? leute.filter((p) => p.name.toLowerCase().includes(suche.trim().toLowerCase())) : leute;
  const gesendet = meineGesendeten(progress, userKey);
  const neu = neueAntworten(progress, userKey);
  const rechte = rechteListe(progress);
  useEffect(() => { if (neu > 0) mutateCloudData(antwortenGesehen(userKey, name)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [neu]);
  const umschalten = (k: string) => setAn((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));
  const senden = () => {
    if (!text.trim() || an.length === 0) return;
    mutateCloudData(nachrichtSchicken(userKey, name, Object.fromEntries(an.map((k) => [k, nameVon(progress, k)])), text));
    setToast(an.length === 1 ? `Nachricht an ${nameVon(progress, an[0])} geschickt.` : `Nachricht an ${an.length} Personen geschickt.`);
    setText(''); setAn([]); setSuche('');
  };
  return (
    <>
      <div className="lt-einzel-schreiben" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <strong style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><LtIcon paths={ICON.mail} size={24} />Nachricht an einzelne</strong>
        <span style={{ fontSize: '16px', color: TH.muted }}>Nur die ausgewählten Personen sehen sie. Sie kommt beim nächsten Öffnen der App als Pop-up und bleibt im Postfach. Sie können kurz antworten.</span>
        {leute.length > 8 && <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Name suchen" aria-label="Name suchen" style={feld} />}
        <div className="lt-einzel-leute" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {gefiltert.map((p) => (
            <button key={p.k} type="button" aria-pressed={an.includes(p.k)} onClick={() => umschalten(p.k)} style={chip(an.includes(p.k))}>{p.name}</button>
          ))}
          {gefiltert.length === 0 && <span style={{ color: TH.muted }}>Niemand gefunden.</span>}
        </div>
        <div style={{ fontSize: '15px', color: TH.muted }}>
          {an.length === 0 ? 'Noch niemand ausgewählt.' : `Ausgewählt: ${an.map((k) => nameVon(progress, k)).join(', ')}`}
          {an.length > 0 && <button type="button" onClick={() => setAn([])} style={{ marginLeft: '10px', border: 'none', background: 'none', color: TH.brown, fontWeight: 700, fontSize: '15px', cursor: 'pointer', textDecoration: 'underline' }}>Auswahl leeren</button>}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, NACHRICHT_MAX))} rows={4} placeholder="z. B. Denk bitte daran, morgen die Stollen-Schulung zu machen." aria-label="Deine Nachricht" style={{ ...feld, minHeight: '110px' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={senden} disabled={!text.trim() || an.length === 0} style={{ ...btnPrimary, opacity: text.trim() && an.length ? 1 : 0.5 }}>Nachricht schicken</button>
          <span style={{ fontSize: '14px', color: TH.muted }}>{text.length}/{NACHRICHT_MAX}</span>
        </div>
      </div>
      {gesendet.length > 0 && (
        <div className="lt-einzel-gesendet" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <strong style={{ fontSize: '19px' }}>Deine gesendeten Nachrichten ({gesendet.length})</strong>
          {gesendet.map((n) => {
            const gelesen = n.status.filter((s) => s.g).length;
            return (
              <div key={n.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '16px', lineHeight: 1.45 }}>
                <div><strong>„{n.t}“</strong> <span style={{ color: TH.muted, fontSize: '14px' }}>· {datum(n.ts)}</span></div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>Gelesen: {gelesen} von {n.status.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {n.status.map((s) => (
                    <div key={s.k} style={{ fontSize: '15px' }}>
                      <span style={{ fontWeight: 700 }}>{s.name}</span>{' '}
                      <span style={{ color: s.g ? TH.green : TH.muted }}>{s.g ? `gelesen ${datum(s.g)}` : 'noch nicht gelesen'}</span>
                      {s.a && <div style={{ marginTop: '2px', padding: '6px 10px', borderRadius: '10px', backgroundColor: dc('#FFFFFF') }}><strong>Antwort:</strong> {s.a}</div>}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => { if (confirm('Diese Nachricht löschen? Die Empfänger sehen sie dann auch nicht mehr.')) mutateCloudData(nachrichtLoeschen(userKey, n.id)); }} style={{ alignSelf: 'flex-start', minHeight: '38px', padding: '0 12px', borderRadius: '10px', border: `2px solid ${TH.line}`, backgroundColor: dc('#FFFFFF'), color: TH.red, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Löschen</button>
              </div>
            );
          })}
        </div>
      )}
      {isAdmin && (
        <div className="lt-einzel-recht" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong style={{ fontSize: '19px' }}>Wer darf Einzel-Nachrichten schicken?</strong>
          <span style={{ fontSize: '15px', color: TH.muted }}>Der Ausbilder und Koni dürfen immer. Tippe weitere Personen an, um ihnen das Recht zu geben (z. B. Filialleitung). Sie finden es dann im Menü unter „Meine Nachrichten“.</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {alleMitarbeiter.filter((k) => !IMMER_SCHREIBEN.includes(k)).map((k) => ({ k, name: nameVon(progress, k) })).sort((a, b) => a.name.localeCompare(b.name)).map((p) => (
              <button key={p.k} type="button" aria-pressed={rechte.includes(p.k)} onClick={() => mutateCloudData(rechtSetzen(p.k, !rechte.includes(p.k)))} style={chip(rechte.includes(p.k))}>{p.name}</button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Seite „Meine Nachrichten“ (Menü) ──
export function NachrichtenSeite({ cloudData, username, alleMitarbeiter, mutateCloudData, setToast, onSteckbrief }: {
  cloudData: CloudPayload; username: string; alleMitarbeiter: string[]; mutateCloudData: Mutate; setToast: (t: string) => void; onSteckbrief?: (produkt: string) => void;
}) {
  const me = (username || '').toLowerCase();
  const post = meinePost(cloudData.progress, me);
  const darf = darfSchreiben(cloudData.progress, me);
  const [antwort, setAntwort] = useState<Record<string, string>>({});
  return (
    <div className="lt-themed" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: TH.ink, textAlign: 'left' }}>
      <PageHead title="Meine Nachrichten" subtitle={darf ? 'Nachrichten an dich, und du kannst selbst einzelnen Kollegen schreiben.' : 'Persönliche Nachrichten an dich. Du kannst kurz antworten.'} />
      <div className="lt-postfach" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <strong style={{ fontSize: '19px' }}>Postfach{post.length ? ` (${post.length})` : ''}</strong>
        {post.length === 0 && <span style={{ color: TH.muted, fontSize: '16px' }}>Noch keine Nachrichten an dich.</span>}
        {post.map((n) => (
          <div key={n.von + n.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: n.mein.g ? TH.cream : TH.tintYellow, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '16px', lineHeight: 1.45 }}>
            <div style={{ fontSize: '14px', color: TH.muted, fontWeight: 700 }}>Von {n.vonName} · {datum(n.ts)}{n.mein.g ? '' : ' · neu'}</div>
            <div style={{ fontFamily: TH.serif, fontSize: '21px', whiteSpace: 'pre-line' }}>„{n.t}“</div>
            {n.sb && onSteckbrief && <button type="button" className="lt-sb-ansehen" onClick={() => { if (!n.mein.g) mutateCloudData(nachrichtGelesen(me, username, n.von, n.id, '')); onSteckbrief(n.sb!); }} style={{ alignSelf: 'flex-start', minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Steckbrief ansehen</button>}
            {n.mein.a ? <div><strong>Deine Antwort:</strong> {n.mein.a}</div> : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input value={antwort[n.von + n.id] || ''} onChange={(e) => setAntwort((a) => ({ ...a, [n.von + n.id]: e.target.value.slice(0, ANTWORT_MAX) }))} placeholder="Kurz antworten (freiwillig)" aria-label={`Antwort an ${n.vonName}`} style={{ ...feld, flex: '1 1 220px', width: 'auto' }} />
                <button type="button" onClick={() => { const t = antwort[n.von + n.id] || ''; mutateCloudData(nachrichtGelesen(me, username, n.von, n.id, t)); if (t.trim()) setToast(`Antwort an ${n.vonName} geschickt.`); setAntwort((a) => ({ ...a, [n.von + n.id]: '' })); }} style={{ ...btnPrimary, minHeight: '48px' }}>{(antwort[n.von + n.id] || '').trim() ? 'Antworten' : n.mein.g ? 'OK' : 'Gelesen'}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {darf && <NachrichtSchreiben cloudData={cloudData} userKey={me} name={username} alleMitarbeiter={alleMitarbeiter} mutateCloudData={mutateCloudData} setToast={setToast} isAdmin={false} />}
    </div>
  );
}

// ── Pop-up beim Öffnen der App: neue Einzel-Nachricht ──
export function EinzelNachrichtPopup({ n, onFertig, onSteckbrief }: { n: { vonName: string; t: string; ts: number; sb?: string }; onFertig: (antwort: string) => void; onSteckbrief?: (produkt: string) => void }) {
  const [antwort, setAntwort] = useState('');
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 108, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="lt-dialog lt-pop-in lt-einzel-popup" role="dialog" aria-modal="true" aria-label={`Nachricht von ${n.vonName}`} style={{ width: '100%', maxWidth: '440px', maxHeight: '92vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '24px', overflow: 'hidden' }}>
        <div className="lt-papier" style={{ backgroundColor: LT.yellow, color: LT.ink, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: dc('#FFFFFF'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LtIcon paths={ICON.mail} size={26} /></span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Nachricht an dich</div>
            <div style={{ fontSize: '16px' }}>von {n.vonName} · {datum(n.ts)}</div>
          </div>
        </div>
        <div style={{ padding: '22px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontFamily: LT.serif, fontSize: '27px', lineHeight: 1.25, whiteSpace: 'pre-line', maxHeight: '45vh', overflowY: 'auto' }}>„{n.t}“</div>
          <input value={antwort} onChange={(e) => setAntwort(e.target.value.slice(0, ANTWORT_MAX))} placeholder="Kurz antworten (freiwillig)" aria-label={`Antwort an ${n.vonName}`} style={feld} />
          {n.sb && onSteckbrief && <button className="lt-sb-ansehen" onClick={() => { onFertig(antwort); onSteckbrief(n.sb!); }} style={{ minHeight: '56px', border: 'none', borderRadius: '16px', backgroundColor: LT.yellow, color: LT.ink, fontSize: '19px', fontWeight: 700, cursor: 'pointer' }}>Steckbrief ansehen</button>}
          <button onClick={() => onFertig(antwort)} style={{ minHeight: '56px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '19px', fontWeight: 700, cursor: 'pointer' }}>{antwort.trim() ? 'Antworten' : 'Gelesen'}</button>
        </div>
      </div>
    </div>
  );
}
