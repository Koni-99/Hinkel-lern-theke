// ═══ Version 260: Produkt aus dem Sortiment nehmen (und wieder zurückholen) ═══
// Gespeichert als productFixes[name].aus (Bereich, in den nur der Ausbilder schreibt).
import { useState } from 'react';
import { TH, cardStyle } from '../ui/basis';
import { dc } from '../daten/data';
import { LtIcon, ICON } from '../basis/symbole';
import { alleProduktNamen } from '../hilfen/produkte';
import { suchNorm } from '../hilfen/suche';
import type { CloudPayload } from '../types';

export function SortimentAus({ cloudData, mutateCloudData }: { cloudData: CloudPayload; mutateCloudData: (u: (c: CloudPayload) => CloudPayload) => void }) {
  const [suche, setSuche] = useState('');
  const fixes = cloudData.productFixes || {};
  const raus = Object.keys(fixes).filter((n) => fixes[n]?.aus).sort((a, b) => a.localeCompare(b, 'de'));
  const q = suchNorm(suche);
  const treffer = q.length < 2 ? [] : alleProduktNamen().filter((n) => !raus.includes(n) && suchNorm(n).includes(q)).slice(0, 8);
  const setze = (name: string, aus: boolean) => {
    if (aus && !window.confirm(`„${name}“ aus dem Sortiment nehmen? Steckbrief, Spiele und Quizfragen dazu sind dann für alle ausgeblendet. Du kannst es jederzeit zurückholen.`)) return;
    mutateCloudData((curr) => {
      const pf = curr.productFixes || (curr.productFixes = {});
      pf[name] = { ...(pf[name] || {}), aus, ts: Date.now() } as any;
      return curr;
    });
    setSuche('');
  };
  const knopf = (rot: boolean) => ({ minHeight: '44px', padding: '0 14px', borderRadius: '12px', border: 'none', backgroundColor: rot ? TH.red : TH.green, color: dc('#FFFFFF'), fontSize: '15px', fontWeight: 700, cursor: 'pointer' });
  return (
    <section className="lt-sortiment-aus" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.15 }}>Nicht mehr im Sortiment</div>
        <div style={{ fontSize: '17px', color: TH.muted }}>Fällt ein Produkt weg, nimm es hier raus. Dann verschwinden sein Steckbrief, seine Quizfragen und es kommt in keinem Spiel mehr dran. Kommt es zurück, hol es wieder rein. Alle Punkte und Fortschritte bleiben.</div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRadius: '12px', border: `2px solid ${TH.line}`, backgroundColor: TH.white }}>
        <span aria-hidden="true" style={{ flex: "0 0 auto", display: "inline-flex", color: TH.muted }}><LtIcon paths={ICON.search} size={20} /></span>
        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Produkt suchen, z. B. Kappeskopp" aria-label="Produkt suchen" style={{ flex: 1, minHeight: '48px', border: 'none', outline: 'none', background: 'transparent', fontSize: '17px', color: TH.ink }} />
      </label>
      {treffer.map((n) => (
        <div key={n} className="lt-sortiment-treffer" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ flex: '1 1 200px', fontSize: '17px', fontWeight: 700 }}>{n}</span>
          <button type="button" onClick={() => setze(n, true)} style={knopf(true)}>Aus dem Sortiment nehmen</button>
        </div>
      ))}
      {q.length >= 2 && treffer.length === 0 && <div style={{ fontSize: '16px', color: TH.muted }}>Kein Produkt gefunden.</div>}
      <div style={{ fontWeight: 800, fontSize: '18px' }}>Gerade herausgenommen ({raus.length})</div>
      {raus.length === 0 ? <div style={{ fontSize: '16px', color: TH.muted }}>Keins. Alle Produkte sind im Sortiment.</div> : raus.map((n) => (
        <div key={n} className="lt-sortiment-raus" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '8px 12px', borderRadius: '12px', backgroundColor: TH.tintPeach }}>
          <span style={{ flex: '1 1 200px', fontSize: '17px', fontWeight: 700 }}>{n}</span>
          <button type="button" onClick={() => setze(n, false)} style={knopf(false)}>Wieder ins Sortiment</button>
        </div>
      ))}
      <div style={{ fontSize: '14px', color: TH.muted }}>Bei den Mitarbeitern wirkt es sofort, in einzelnen Spielen spätestens beim nächsten Öffnen der App.</div>
    </section>
  );
}
