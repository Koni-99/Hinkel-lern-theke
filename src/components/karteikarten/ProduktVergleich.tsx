// ═══ Version 248: Zwei Produkte nebeneinander vergleichen (aus dem Steckbrief) ═══
// Hilft bei Kundenfragen wie „Was ist der Unterschied zwischen Schweizer und Münsterländer?“.
// Vorschläge oben: die Alternativen aus ALT_MAP (ähnliche Produkte), darunter alle Produkte nach Gruppe.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { dc, ALT_MAP } from '../../daten/data';
import { SHOP_PRODUCTS } from '../../daten/shopProducts';
import { SLICE_OF } from '../../hilfen/produkte';
import { TH, productImageKey, ProductImages } from '../../ui/basis';
import { kleinesFoto } from '../../daten/fotos';
import { LtIcon, ICON } from '../../basis/symbole';
import { useZurueckSchliesst } from '../../hilfen/zurueck';

type SP = (typeof SHOP_PRODUCTS)[number];

/** Vorschläge zum Vergleichen: zuerst ähnliche Produkte (Alternativen), dann gleiche Gruppe */
export function vergleichsVorschlaege(name: string): string[] {
  const p = SHOP_PRODUCTS.find((x) => x.name === name);
  const alt = (ALT_MAP[name] || []).filter((n) => n !== name && SHOP_PRODUCTS.some((x) => x.name === n));
  const gruppe = p ? SHOP_PRODUCTS.filter((x) => x.group === p.group && x.name !== name && !alt.includes(x.name)).map((x) => x.name) : [];
  return [...alt, ...gruppe];
}

/** Allergene ohne Klammer-Teil zum Vergleichen („Gluten (Weizen)“ → „Gluten“) */
const kopf = (a: string) => a.replace(/\s*\(.*\)\s*$/, '').trim();

export function ProduktVergleich({ a, images, onClose }: { a: SP; images: ProductImages; onClose: () => void }) {
  useZurueckSchliesst(true, onClose);
  const vorschlaege = vergleichsVorschlaege(a.name);
  const [bName, setBName] = useState(vorschlaege[0] || '');
  const b = SHOP_PRODUCTS.find((x) => x.name === bName);
  const gruppen = Array.from(new Set(SHOP_PRODUCTS.map((x) => x.group)));
  const foto = (p: SP) => kleinesFoto(images[productImageKey(p.name)]) || images[productImageKey(p.name)];
  const zeile = (label: string, wert: (p: SP) => ReactNode, gleich?: boolean) => (
    <div className="lt-vergleich-zeile" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: TH.muted }}>{label}{gleich ? ' · gleich' : ''}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
        {[a, b].map((p, i) => <div key={i} className={gleich ? undefined : 'lt-vergleich-anders'} style={{ padding: '10px 12px', borderRadius: '14px', backgroundColor: gleich ? TH.white : TH.tintYellow, border: `2px solid ${TH.line}`, fontSize: '16px', lineHeight: 1.4, minWidth: 0, overflowWrap: 'anywhere' }}>{p ? wert(p) : ''}</div>)}
      </div>
    </div>
  );
  const allergenListe = (p: SP, andere?: SP) => {
    if (!p.allergens.length) return <span style={{ color: TH.green, fontWeight: 700 }}>Keine</span>;
    const andereKoepfe = new Set((andere?.allergens || []).map(kopf));
    return <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{p.allergens.map((x) => {
      const nurHier = !!andere && !andereKoepfe.has(kopf(x));
      return <span key={x} style={{ fontWeight: nurHier ? 800 : 600, color: nurHier ? TH.red : TH.ink }}>{x}{nurHier ? ' (nur hier)' : ''}</span>;
    })}</span>;
  };
  const text = (v?: string | boolean) => (typeof v === 'boolean' ? (v ? 'Ja' : 'Nein') : v || 'keine Angabe');
  const schnitt = (p: SP) => (p.breadType ? SLICE_OF[p.breadType] : '') || 'keine Angabe';
  return (
    <div className="fc-overlay lt-vergleich" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 130, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div className="fc-sheet" role="dialog" aria-modal="true" aria-label={`${a.name} vergleichen`} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', backgroundColor: TH.cream, borderRadius: '26px', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
        <div className="lt-papier" style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: TH.yellow, color: TH.ink, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LtIcon paths={ICON.swap} size={26} />
          <div style={{ flex: 1, fontFamily: TH.serif, fontSize: '26px', lineHeight: 1.1 }}>Vergleichen</div>
          <button onClick={onClose} aria-label="Schließen" style={{ flex: '0 0 44px', height: '44px', borderRadius: '50%', border: 'none', backgroundColor: TH.white, color: TH.ink, fontSize: '22px', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '16px 18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '15px', fontWeight: 700 }}>
            {a.name} vergleichen mit:
            <select value={bName} onChange={(e) => setBName(e.target.value)} aria-label="Produkt zum Vergleichen" style={{ minHeight: '50px', padding: '0 12px', borderRadius: '14px', border: `2px solid ${TH.line}`, fontSize: '17px', backgroundColor: TH.white, color: TH.ink }}>
              {vorschlaege.length > 0 && <optgroup label="Ähnliche Produkte">{vorschlaege.slice(0, 8).map((n) => <option key={'v' + n} value={n}>{n}</option>)}</optgroup>}
              {gruppen.map((g) => <optgroup key={g} label={g}>{SHOP_PRODUCTS.filter((x) => x.group === g && x.name !== a.name).map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}</optgroup>)}
            </select>
          </label>
          {b && <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              {[a, b].map((p) => (
                <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                  {foto(p) ? <img src={foto(p)} alt={p.name} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: '16px', border: `2px solid ${TH.line}` }} /> : null}
                  <div style={{ fontFamily: TH.serif, fontSize: '20px', lineHeight: 1.15, overflowWrap: 'anywhere' }}>{p.name}</div>
                </div>
              ))}
            </div>
            {zeile('Preis', (p) => text(p.price), a.price === b.price)}
            {(a.weight || b.weight) && zeile('Gewicht', (p) => text(p.weight), a.weight === b.weight)}
            {(a.breadType || b.breadType) && zeile('Schnitt', schnitt, schnitt(a) === schnitt(b))}
            {(a.flour || b.flour) && zeile('Mehl', (p) => text(p.flour), a.flour === b.flour)}
            {zeile('Vegan', (p) => text(!!p.vegan), !!a.vegan === !!b.vegan)}
            {zeile('Im Verkauf sagen', (p) => p.shortIngredients, a.shortIngredients === b.shortIngredients)}
            {zeile('Allergene', (p) => allergenListe(p, p === a ? b : a), a.allergens.join() === b.allergens.join())}
            {(a.note || b.note) && zeile('Besonderheit', (p) => text(p.note))}
          </>}
          <button onClick={onClose} style={{ minHeight: '52px', borderRadius: '16px', border: 'none', backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>Zurück zum Steckbrief</button>
        </div>
      </div>
    </div>
  );
}
