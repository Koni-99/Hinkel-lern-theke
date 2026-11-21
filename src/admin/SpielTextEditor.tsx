// ═══ Version 274: Spieltext korrigieren (Theken-Simulator) und Korrekturen zurücknehmen ═══
import { useState, CSSProperties } from 'react';
import type { JSX } from 'react';
import { TH, cardStyle } from '../ui/basis';
import type { CloudPayload } from '../types';
import { textKey, alleKorrekturen, FELD } from '../hilfen/spielKorrektur';
import { GENERAL_TOPICS } from '../games/theke/gespraech';

export type ThekeDaten = { k: 'theke'; thema: string; kunde: string; opts: { t: string; ok: boolean }[] };
type Mutate = (fn: (curr: CloudPayload) => CloudPayload) => void;

const adminVon = (curr: CloudPayload): any => (curr.progress.admin || (curr.progress.admin = { _displayName: 'admin' } as any));

export function SpielTextEditor({ daten, mutateCloudData, onFertig, onAbbrechen, smallBtn, inputStyle }: {
  daten: ThekeDaten; mutateCloudData: Mutate; onFertig: () => void; onAbbrechen: () => void;
  smallBtn: (tone?: 'plain' | 'danger' | 'warn') => CSSProperties; inputStyle: CSSProperties;
}) {
  const [kunde, setKunde] = useState(daten.kunde);
  const [opts, setOpts] = useState(daten.opts.map((o) => ({ orig: o.t, t: o.t, aus: false })));
  const [richtig, setRichtig] = useState(Math.max(0, daten.opts.findIndex((o) => o.ok)));
  const [fehler, setFehler] = useState('');
  const darfThemaAus = !GENERAL_TOPICS.includes(daten.thema);

  const speichern = () => {
    if (!kunde.trim() || opts.some((o) => !o.t.trim())) { setFehler('Bitte keinen Text leer lassen.'); return; }
    if (opts[richtig]?.aus) { setFehler('Die richtige Antwort kann nicht ausgeblendet werden.'); return; }
    if (opts.filter((o) => !o.aus).length < 2) { setFehler('Es müssen mindestens 2 Antworten übrig bleiben.'); return; }
    const ts = Date.now();
    mutateCloudData((curr) => {
      const pa = adminVon(curr);
      const texte = { ...(pa._spielTexte || {}) }, aus = { ...(pa._spielAus || {}) }, ri = { ...(pa._spielRichtig || {}) };
      if (kunde.trim() !== daten.kunde) texte[textKey(daten.kunde)] = { a: daten.kunde, n: kunde.trim(), ts };
      opts.forEach((o) => {
        if (o.t.trim() !== o.orig) texte[textKey(o.orig)] = { a: o.orig, n: o.t.trim(), ts };
        if (o.aus) aus[textKey(o.orig)] = { a: o.orig, ts };
      });
      const vorher = daten.opts.findIndex((o) => o.ok);
      if (richtig !== vorher) ri[textKey(daten.kunde)] = { k: daten.kunde, r: opts[richtig].orig, ts };
      pa._spielTexte = texte; pa._spielAus = aus; pa._spielRichtig = ri;
      return curr;
    });
    onFertig();
  };
  const themaAus = () => {
    if (!confirm(`Die ganze Situation „${daten.thema}“ im Theken-Simulator ausblenden? Du kannst das unten unter „Korrekturen in Spielen“ jederzeit zurücknehmen.`)) return;
    mutateCloudData((curr) => { const pa = adminVon(curr); pa._themenAus = { ...(pa._themenAus || {}), [textKey(daten.thema)]: { t: daten.thema, ts: Date.now() } }; return curr; });
    onFertig();
  };

  return (
    <div className="lt-spieltext-editor" style={{ padding: '14px', borderRadius: '14px', border: `2px solid ${TH.yellow}`, backgroundColor: TH.cream, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <strong style={{ fontSize: '18px' }}>Spieltext korrigieren · {daten.thema}</strong>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '15px', fontWeight: 700 }}>Das sagt der Kunde
        <textarea aria-label="Satz des Kunden" value={kunde} onChange={(e) => setKunde(e.target.value)} rows={2} style={{ ...inputStyle, minHeight: '60px', fontWeight: 400 }} />
      </label>
      <div style={{ fontSize: '15px', fontWeight: 700 }}>Antworten (Punkt = richtige Antwort)</div>
      {opts.map((o, i) => (
        <div key={i} className="lt-spieltext-antwort" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', opacity: o.aus ? 0.55 : 1 }}>
          <input type="radio" name="lt-richtig" aria-label={`Antwort ${i + 1} ist richtig`} checked={richtig === i} onChange={() => setRichtig(i)} style={{ width: '22px', height: '22px' }} />
          <input aria-label={`Antwort ${i + 1}`} value={o.t} onChange={(e) => setOpts((l) => l.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)))} style={{ ...inputStyle, flex: '1 1 220px', width: 'auto' }} />
          <label style={{ fontSize: '15px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input type="checkbox" aria-label={`Antwort ${i + 1} ausblenden`} checked={o.aus} onChange={(e) => setOpts((l) => l.map((x, j) => (j === i ? { ...x, aus: e.target.checked } : x)))} /> ausblenden
          </label>
        </div>
      ))}
      <div style={{ fontSize: '14px', color: TH.muted }}>Gilt sofort bei allen. Hinweis: Steht ein Produktname oder Preis im Satz, gilt die Korrektur nur für genau diesen Satz. Ist ein Preis oder eine Zutat falsch, lieber „Produkt korrigieren“ nehmen.</div>
      {fehler && <div style={{ color: TH.red, fontWeight: 700 }}>{fehler}</div>}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" onClick={speichern} style={smallBtn('warn')}>Speichern</button>
        <button type="button" onClick={onAbbrechen} style={smallBtn()}>Abbrechen</button>
        {darfThemaAus && <button type="button" onClick={themaAus} style={smallBtn('danger')}>Ganze Situation ausblenden</button>}
      </div>
    </div>
  );
}

/** Liste aller Korrekturen mit „Zurücknehmen“ */
export function SpielKorrekturenListe({ admin, mutateCloudData, smallBtn, sectionTitle }: {
  admin: any; mutateCloudData: Mutate; smallBtn: (tone?: 'plain' | 'danger' | 'warn') => CSSProperties; sectionTitle: (t: string, s?: string) => JSX.Element;
}) {
  const liste = alleKorrekturen(admin);
  if (!liste.length) return null;
  const zurueck = (art: keyof typeof FELD, key: string) => mutateCloudData((curr) => {
    const pa = adminVon(curr); const f = FELD[art]; const m = { ...(pa[f] || {}) }; delete m[key]; pa[f] = m; return curr;
  });
  return (
    <div className="lt-spiel-korrekturen" style={cardStyle}>
      {sectionTitle(`Korrekturen in Spielen (${liste.length})`, 'Geänderte Texte, ausgeblendete Antworten und Situationen im Theken-Simulator. Mit „Zurücknehmen“ gilt wieder der ursprüngliche Stand.')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {liste.map((k) => (
          <div key={k.art + k.key} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '12px', backgroundColor: TH.tintYellow }}>
            <span style={{ flex: '1 1 260px', fontSize: '16px' }}>{k.text}</span>
            <button type="button" onClick={() => zurueck(k.art, k.key)} style={smallBtn()}>Zurücknehmen</button>
          </div>
        ))}
      </div>
    </div>
  );
}
