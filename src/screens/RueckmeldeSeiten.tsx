// ═══ Ideen-Box, Kundenstimmen, Mein Geburtstag (Seiten für Mitarbeiter) und Geburtstags-Karte ═══
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary, PageHead } from '../ui/basis';
import { LT } from '../basis/marke';
import { LtIcon, ICON } from '../basis/symbole';
import { CloudPayload } from '../types';
import {
  alleIdeen, ideeEinreichen, ideenGesehen, IDEE_MAX,
  alleKundenstimmen, stimmeNotieren, KSTIMME_MAX, KSTIMME_ARTEN, KStimmeArt,
  meinGeburtstag, geburtstagSetzen, MONATE, geburtstageHeute, gratulieren, habeGratuliert, gratulanten,
} from '../hilfen/rueckmeldungen';

type Basis = { cloudData: CloudPayload; username: string; mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void; setToast: (t: string) => void };
const datum = (ts: number) => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
const feld = { width: '100%', boxSizing: 'border-box' as const, padding: '12px 14px', borderRadius: '14px', border: `2px solid ${TH.line}`, fontSize: '17px', fontFamily: 'inherit', backgroundColor: dc('#FFFFFF'), color: TH.ink };
const chip = (aktiv: boolean) => ({ minHeight: '46px', padding: '0 16px', borderRadius: '999px', border: aktiv ? 'none' : `2px solid ${TH.line}`, backgroundColor: aktiv ? TH.brown : dc('#FFFFFF'), color: aktiv ? dc('#FFF6E0') : TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } as const);
const Wrap = ({ children }: { children: ReactNode }) => <div className="lt-themed" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: TH.ink, textAlign: 'left' }}>{children}</div>;

// ── Ideen-Box ──
export function IdeenSeite({ cloudData, username, mutateCloudData, setToast }: Basis) {
  const me = (username || '').toLowerCase();
  const [text, setText] = useState('');
  const [anonym, setAnonym] = useState(false);
  const meine = alleIdeen(cloudData.progress).filter((i) => i.user === me);
  const neu = meine.filter((i) => i.a && !i.seen).length;
  useEffect(() => { if (me && neu > 0) mutateCloudData(ideenGesehen(me)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [neu]);
  const senden = () => {
    if (!text.trim() || !me) return;
    mutateCloudData(ideeEinreichen(me, username, text, anonym));
    setText(''); setAnonym(false);
    setToast('Danke für deine Idee! Der Ausbilder liest sie und antwortet hier.');
  };
  return (
    <Wrap>
      <PageHead title="Ideen-Box" subtitle="Du hast eine Idee für den Laden, die Abläufe oder die App? Schreib sie auf." />
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, IDEE_MAX))} rows={4} placeholder="z. B. Wir könnten die Brötchentüten näher an die Kasse stellen, dann geht es morgens schneller." aria-label="Deine Idee" style={{ ...feld, resize: 'vertical' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px' }}>
          <input type="checkbox" checked={anonym} onChange={(e) => setAnonym(e.target.checked)} style={{ width: '22px', height: '22px', accentColor: TH.brown }} />
          Anonym einreichen (der Ausbilder sieht deinen Namen nicht)
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={senden} disabled={!text.trim()} style={{ ...btnPrimary, opacity: text.trim() ? 1 : 0.5 }}>Idee einreichen</button>
          <span style={{ fontSize: '14px', color: TH.muted }}>{text.length}/{IDEE_MAX}</span>
        </div>
      </div>
      {meine.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong style={{ fontSize: '19px' }}>Deine Ideen ({meine.length})</strong>
          {meine.map((i) => (
            <div key={i.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: i.a ? TH.tintSage : TH.cream, fontSize: '16px', lineHeight: 1.45 }}>
              <div><strong>„{i.t}“</strong> <span style={{ color: TH.muted, fontSize: '14px' }}>· {datum(i.ts)}{i.anonym ? ', anonym' : ''}</span></div>
              {i.a ? <div style={{ marginTop: '6px' }}><strong>Antwort:</strong> {i.a}</div> : <div style={{ marginTop: '6px', color: TH.muted }}>Der Ausbilder hat sie noch nicht beantwortet.</div>}
            </div>
          ))}
        </div>
      )}
    </Wrap>
  );
}

// ── Kundenstimmen ──
export function KundenstimmenSeite({ cloudData, username, mutateCloudData, setToast, produkte }: Basis & { produkte: string[] }) {
  const me = (username || '').toLowerCase();
  const [art, setArt] = useState<KStimmeArt>('lob');
  const [produkt, setProdukt] = useState('');
  const [text, setText] = useState('');
  const meine = alleKundenstimmen(cloudData.progress).filter((s) => s.user === me).slice(0, 10);
  const senden = () => {
    if (!text.trim() || !me) return;
    mutateCloudData(stimmeNotieren(me, username, art, produkt, text));
    setText(''); setProdukt('');
    setToast('Danke! Die Kundenstimme ist beim Ausbilder.');
  };
  return (
    <Wrap>
      <PageHead title="Kundenstimmen" subtitle="Was sagen die Kunden? Lob, Kritik oder Wünsche, damit der Ausbilder und die Backstube es erfahren." />
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <strong style={{ fontSize: '18px' }}>Was hat der Kunde gesagt?</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {KSTIMME_ARTEN.map((a) => <button key={a.id} type="button" onClick={() => setArt(a.id)} style={chip(art === a.id)}>{a.label}</button>)}
        </div>
        <input list="lt-produkte" value={produkt} onChange={(e) => setProdukt(e.target.value)} placeholder="Produkt (freiwillig), z. B. Dinkelbrot" aria-label="Produkt" style={feld} />
        <datalist id="lt-produkte">{produkte.map((p) => <option key={p} value={p} />)}</datalist>
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, KSTIMME_MAX))} rows={3} placeholder={art === 'lob' ? 'z. B. Das Dinkelbrot ist das beste in der Stadt!' : art === 'kritik' ? 'z. B. Das Brot war heute etwas trocken.' : 'z. B. Gibt es das Brot auch in klein?'} aria-label="Was hat der Kunde gesagt?" style={{ ...feld, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={senden} disabled={!text.trim()} style={{ ...btnPrimary, opacity: text.trim() ? 1 : 0.5 }}>Kundenstimme schicken</button>
          <span style={{ fontSize: '14px', color: TH.muted }}>{text.length}/{KSTIMME_MAX}</span>
        </div>
      </div>
      {meine.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <strong style={{ fontSize: '19px' }}>Von dir zuletzt notiert</strong>
          {meine.map((s) => (
            <div key={s.id} style={{ padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.cream, fontSize: '16px' }}>
              <strong>{KSTIMME_ARTEN.find((a) => a.id === s.art)?.label}</strong>{s.p ? ` · ${s.p}` : ''}: „{s.t}“ <span style={{ color: TH.muted, fontSize: '14px' }}>· {datum(s.ts)}</span>
            </div>
          ))}
        </div>
      )}
    </Wrap>
  );
}

// ── Mein Geburtstag (freiwillig) ──
export function GeburtstagSeite({ cloudData, username, mutateCloudData, setToast }: Basis) {
  const me = (username || '').toLowerCase();
  const gespeichert = meinGeburtstag(cloudData.progress, me);
  const [tag, setTag] = useState(gespeichert ? Number(gespeichert.slice(3)) : 0);
  const [monat, setMonat] = useState(gespeichert ? Number(gespeichert.slice(0, 2)) : 0);
  const speichern = () => {
    if (!tag || !monat) return;
    mutateCloudData(geburtstagSetzen(me, username, `${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`));
    setToast(`Gespeichert: ${tag}. ${MONATE[monat - 1]}. An dem Tag sehen deine Kollegen einen Hinweis.`);
  };
  const loeschen = () => { mutateCloudData(geburtstagSetzen(me, username, null)); setTag(0); setMonat(0); setToast('Dein Geburtstag ist gelöscht.'); };
  const tageImMonat = monat ? new Date(2024, monat, 0).getDate() : 31;
  return (
    <Wrap>
      <PageHead title="Mein Geburtstag" subtitle="Ganz freiwillig. Nur Tag und Monat, kein Jahr. An deinem Geburtstag sehen deine Kollegen auf der Startseite einen Hinweis und können dir gratulieren." />
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={tag} onChange={(e) => setTag(Number(e.target.value))} aria-label="Tag" style={{ ...feld, width: 'auto', minWidth: '110px' }}>
            <option value={0}>Tag</option>
            {Array.from({ length: tageImMonat }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}.</option>)}
          </select>
          <select value={monat} onChange={(e) => { const m = Number(e.target.value); setMonat(m); if (m && tag > new Date(2024, m, 0).getDate()) setTag(0); }} aria-label="Monat" style={{ ...feld, width: 'auto', minWidth: '170px' }}>
            <option value={0}>Monat</option>
            {MONATE.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={speichern} disabled={!tag || !monat} style={{ ...btnPrimary, opacity: tag && monat ? 1 : 0.5 }}>Speichern</button>
          {gespeichert && <button type="button" onClick={loeschen} style={chip(false)}>Geburtstag löschen</button>}
        </div>
        {gespeichert && <span style={{ fontSize: '15px', color: TH.muted }}>Gespeichert: {Number(gespeichert.slice(3))}. {MONATE[Number(gespeichert.slice(0, 2)) - 1]}</span>}
      </div>
    </Wrap>
  );
}

// ── Startseite: Geburtstags-Karte ──
export function GeburtstagsKarte({ cloudData, username, mutateCloudData, setToast }: Basis) {
  const me = (username || '').toLowerCase();
  const heute = geburtstageHeute(cloudData.progress);
  if (!me || !heute.length) return null;
  return (
    <>
      {heute.map((g) => {
        const ich = g.user === me;
        const gratuliert = habeGratuliert(cloudData.progress, me, g.user);
        const wer = gratulanten(cloudData.progress, g.user);
        return (
          <section key={g.user} aria-label="Geburtstag" style={{ padding: '22px', borderRadius: '24px', backgroundColor: LT.yellow, display: 'flex', flexDirection: 'column', gap: '10px', color: LT.ink }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span aria-hidden="true" style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><LtIcon paths={ICON.cake} size={24} width={1.9} /></span>
              <span style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1 }}>{ich ? `Alles Gute zum Geburtstag, ${username}!` : `Heute hat ${g.name} Geburtstag`}</span>
            </div>
            {wer.length > 0 && <span style={{ fontSize: '16px' }}>{ich ? 'Gratuliert haben: ' : 'Schon gratuliert: '}{wer.join(', ')}</span>}
            {!ich && (gratuliert
              ? <span style={{ fontSize: '16px', fontWeight: 700 }}>Du hast gratuliert.</span>
              : <button type="button" onClick={() => { mutateCloudData(gratulieren(me, username, g.user)); setToast(`Du hast ${g.name} gratuliert.`); }} style={{ alignSelf: 'flex-start', minHeight: '50px', padding: '0 20px', borderRadius: '14px', border: 'none', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '17px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Gratulieren</button>)}
          </section>
        );
      })}
    </>
  );
}
