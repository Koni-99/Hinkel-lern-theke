// ═══ Karteikarten: Steckbrief-Detail (aufgeklappte Karte) ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { useState, useRef } from 'react';
import { steckbriefText } from '../../hilfen/vorlesen';
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { TH, productImageKey, ProductImages } from '../../ui/basis';
import { ReportContext } from '../../ui/melden';
import { SpeakButton } from '../../games/spielBasis';
import { getProductEmoji, Profile } from './daten';
import { KollegenTipps } from './KollegenTipps';
import { MeineNotiz } from './MeineNotiz';
import { LtIcon, ICON } from '../../basis/symbole';
import { alleFotos } from '../../daten/fotos';
import { ProduktVergleich } from './ProduktVergleich';
import { FotoVollbild } from './FotoVollbild';
import { backtageVon, preisGeaendert } from '../../hilfen/steckbriefExtras';


// Mehrere Fotos pro Produkt (Version 193): zum Wischen, Punkte zeigen, welches Foto gerade da ist
function FotoGalerie({ fotos, name, randlos }: { fotos: string[]; name: string; randlos?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [nr, setNr] = useState(0);
  const [gross, setGross] = useState(false);
  const geh = (i: number) => { const el = ref.current; if (!el) return; const z = Math.max(0, Math.min(fotos.length - 1, i)); el.scrollTo({ left: z * el.clientWidth, behavior: 'smooth' }); };
  const pfeil = (links: boolean) => (
    <button className="lt-galerie-pfeil" aria-label={links ? 'Vorheriges Foto' : 'Nächstes Foto'} onClick={() => geh(nr + (links ? -1 : 1))} disabled={links ? nr === 0 : nr === fotos.length - 1}
      style={{ position: 'absolute', top: '50%', [links ? 'left' : 'right']: '10px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,.85)', color: TH.ink, fontSize: '22px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.18)' } as any}>{links ? '‹' : '›'}</button>
  );
  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} className="lt-galerie" onScroll={(e) => { const el = e.currentTarget; setNr(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); }}
        style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', borderRadius: randlos ? 0 : '22px', border: randlos ? 'none' : `2px solid ${TH.line}`, scrollbarWidth: 'none' }}>
        {fotos.map((f, i) => <img key={f} src={f} alt={`${name}, Foto ${i + 1} von ${fotos.length}`} loading={i ? 'lazy' : 'eager'} className="lt-loaded lt-foto-gross" onClick={() => setGross(true)} style={{ flex: '0 0 100%', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', scrollSnapAlign: 'center', display: 'block', cursor: 'zoom-in' }} />)}
      </div>
      {gross && <FotoVollbild fotos={fotos} start={nr} name={name} onClose={() => setGross(false)} />}
      {pfeil(true)}{pfeil(false)}
      <div style={randlos ? { position: 'absolute', left: 0, right: 0, bottom: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', height: '12px' } : { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '10px', height: '12px' }}>
        {fotos.map((_, i) => <button key={i} aria-label={`Foto ${i + 1}`} onClick={() => geh(i)} style={{ width: i === nr ? '22px' : '9px', height: '9px', minHeight: 0, minWidth: 0, borderRadius: '999px', border: 'none', padding: 0, flex: '0 0 auto', backgroundColor: i === nr ? (randlos ? '#FFFFFF' : TH.yellow) : (randlos ? 'rgba(255,255,255,.55)' : TH.line), boxShadow: randlos ? '0 1px 3px rgba(0,0,0,.4)' : 'none', cursor: 'pointer', transition: 'width .2s' }} />)}
      </div>
    </div>
  );
}

// Allergene als farbige Kästchen: jede Allergen-Gruppe hat ihre eigene Farbe, damit man sie an der Theke sofort erkennt
const ALLERGEN_STIL: Record<string, { bg: string; ink: string; icon?: string[] }> = {
  Gluten: { bg: '#FCE9C2', ink: '#7A4A00', icon: ICON.leaf }, Milch: { bg: '#DDE6F7', ink: '#2F4F8A', icon: ICON.drop }, Eier: { bg: '#FFF0B3', ink: '#6E5200', icon: ICON.egg },
  'Schalenfrüchte': { bg: '#EADBCB', ink: '#6B3F1D' }, Erdnüsse: { bg: '#EADBCB', ink: '#6B3F1D' }, Soja: { bg: '#E1EEDC', ink: '#2F5D3A' }, Sesam: { bg: '#F3E6D0', ink: '#7A5530' },
  Senf: { bg: '#FFF3B0', ink: '#6E5F00' }, Sellerie: { bg: '#DDEFD9', ink: '#2F6A3A' }, Lupinen: { bg: '#EDE3F3', ink: '#5B3A75' },
};
const teileAllergen = (a: string) => { const m = /^([^(]+?)\s*(?:\((.*)\))?$/.exec(a.trim()); return { kopf: (m ? m[1] : a).trim(), teil: m && m[2] ? m[2] : '' }; };
import type { TippEintrag } from '../../hilfen/kollegen';

export type SteckbriefDetailProps = {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  images: ProductImages;
  setOpenProfileKey: Dispatch<SetStateAction<string | null>>;
  filteredProfiles: Profile[];
  openProfile: Profile | null;
  kollegenTipps?: TippEintrag[];
  meineTipps?: TippEintrag[];
  onTipp?: (produkt: string, text: string) => void;
  meineNotizen?: Record<string, string>;
  onNotiz?: (produkt: string, text: string) => void;
  onFoto?: (name: string, file: File) => Promise<string>;
  /** Version 250: Steckbrief an einen Kollegen schicken */
  kollegen?: { k: string; name: string }[];
  onSchicken?: (anKey: string, anName: string, produkt: string) => void;
};

export function SteckbriefDetail({ favorites, toggleFavorite, images, setOpenProfileKey, filteredProfiles, openProfile, kollegenTipps = [], meineTipps = [], onTipp, meineNotizen = {}, onNotiz, onFoto, kollegen = [], onSchicken }: SteckbriefDetailProps) {
  const [fotoMsg, setFotoMsg] = useState('');
  const [einzelGross, setEinzelGross] = useState(false);
  const [schickenAuf, setSchickenAuf] = useState(false);
  const [schickenAn, setSchickenAn] = useState('');
  const [geschickt, setGeschickt] = useState('');
  const [fotoBusy, setFotoBusy] = useState(false);
  const [vergleich, setVergleich] = useState(false);
  if (!openProfile) return null; // wie die Bedingung in components/FlashcardView.tsx
  const prod = openProfile;
  const idx = filteredProfiles.indexOf(prod);
  const prev = idx > 0 ? filteredProfiles[idx - 1] : null;
  const next = idx >= 0 && idx < filteredProfiles.length - 1 ? filteredProfiles[idx + 1] : null;
  const fav = favorites.includes(prod.ids[0]);
  const sp = prod.shop;
  const facts: { label: string; value: string }[] = [
    ...(sp?.pricePerKg ? [{ label: "Kilopreis", value: sp.pricePerKg }] : []),
    ...(sp?.weight ? [{ label: "Gewicht", value: sp.weight }] : []),
    ...(prod.slice ? [{ label: "Schnitt", value: prod.slice }] : []),
  ];
  const goTo = (p: Profile | null) => { if (p) { setSchickenAuf(false); setGeschickt(''); setOpenProfileKey(`${p.name}_${p.ids[0]}`); } };
  const pName = sp ? sp.name : prod.name;
  const backtage = backtageVon(pName);
  const preisNeu = sp ? preisGeaendert(sp.name) : null;
  const datumKurz = (ts: number) => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' });
  return (
    <div className="fc-overlay" onClick={() => setOpenProfileKey(null)} style={{ position: "fixed", inset: 0, zIndex: 120, backgroundColor: "rgba(43,23,10,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="fc-sheet" role="dialog" aria-modal="true" aria-label={`Steckbrief ${prod.name}`} onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", backgroundColor: TH.cream, borderRadius: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", textAlign: "left", color: TH.ink }}>
        {/* Version 285: Foto über die ganze Breite, Preisschild darauf, Schließen bleibt beim Scrollen sichtbar */}
        <div style={{ position: "sticky", top: 0, height: 0, zIndex: 5 }}>
          <button onClick={() => setOpenProfileKey(null)} aria-label="Schließen" style={{ position: "absolute", top: "12px", right: "12px", width: "46px", height: "46px", borderRadius: "50%", border: "none", backgroundColor: "rgba(30,14,4,.62)", color: "#FFF3D6", fontSize: "26px", lineHeight: 1, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,.25)" }}>×</button>
        </div>
        <div className="lt-sb-foto" style={{ position: "relative" }}>
          {alleFotos(productImageKey(prod.name)).length > 1
            ? <FotoGalerie key={prod.name} fotos={alleFotos(productImageKey(prod.name))} name={prod.name} randlos />
            : images[productImageKey(prod.name)]
              ? <img src={images[productImageKey(prod.name)]} alt={prod.name} className="lt-foto-gross" onClick={() => setEinzelGross(true)} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
              : <div className="lt-papier" aria-hidden="true" style={{ height: "150px", backgroundColor: TH.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>{getProductEmoji(prod.name, prod.group)}</div>}
          {sp?.price && (
            <span className="lt-preisschild lt-papier" style={{ position: "absolute", right: "16px", bottom: "-18px", zIndex: 2, padding: "9px 14px 8px 26px", backgroundColor: "#FFFCF5", color: "#2B170A", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "26px", lineHeight: 1, clipPath: "polygon(16px 0,100% 0,100% 100%,16px 100%,0 50%)", borderRadius: "0 10px 10px 0", boxShadow: "0 6px 14px rgba(0,0,0,.3)", transform: "rotate(-4deg)" }}>
              {sp.price}{sp.weight && <span style={{ display: "block", fontFamily: "'Atkinson Hyperlegible', sans-serif", fontSize: "12px", fontWeight: 700, color: "#7A5A3E", marginTop: "3px" }}>{sp.weight}</span>}
            </span>
          )}
        </div>
        <div className="lt-sb-kopf" style={{ padding: "22px 22px 0" }}>
          <div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "34px", lineHeight: 1.02, letterSpacing: "-.8px", paddingRight: sp?.price ? "96px" : 0 }}>{prod.name}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
            {[prod.group, sp?.flour].filter(Boolean).map((t) => <span key={t} style={{ fontSize: "14px", fontWeight: 700, padding: "6px 11px", borderRadius: "999px", backgroundColor: dc('#F3EADA'), color: TH.ink }}>{t}</span>)}
            {sp?.vegan && <span style={{ fontSize: "14px", fontWeight: 700, padding: "6px 11px", borderRadius: "999px", backgroundColor: TH.tintSage, color: TH.green }}>vegan</span>}
            {sp && sp.allergens.map((a) => teileAllergen(a).kopf).filter((x, n, arr) => arr.indexOf(x) === n).map((a) => <span key={a} style={{ fontSize: "14px", fontWeight: 700, padding: "6px 11px", borderRadius: "999px", backgroundColor: dc('#FCE3D5'), color: TH.red }}>{a}</span>)}
          </div>
          {preisNeu && <div className="lt-preis-neu" style={{ marginTop: "10px", fontSize: "15px", fontWeight: 700, color: TH.red }}>Preis geändert am {datumKurz(preisNeu.am)}{preisNeu.vorher ? `, vorher ${preisNeu.vorher}` : ''}</div>}
        </div>

        <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {einzelGross && images[productImageKey(prod.name)] && <FotoVollbild fotos={[images[productImageKey(prod.name)]]} start={0} name={prod.name} onClose={() => setEinzelGross(false)} />}
          {onFoto && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "10px 12px", borderRadius: "14px", backgroundColor: TH.tintYellow }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "46px", padding: "0 16px", borderRadius: "999px", backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: "16px", fontWeight: 700, cursor: fotoBusy ? "wait" : "pointer" }}>
                <LtIcon paths={ICON.camera} size={20} />{fotoBusy ? "Lädt …" : images[productImageKey(prod.name)] ? "Foto austauschen" : "Foto hinzufügen"}
                <input type="file" accept="image/*" disabled={fotoBusy} aria-label={`Foto für ${prod.name}`} style={{ display: "none" }} onChange={async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return; setFotoBusy(true); setFotoMsg(""); setFotoMsg(await onFoto(sp ? sp.name : prod.name, f)); setFotoBusy(false); }} />
              </label>
              <span style={{ fontSize: "14px", color: TH.brown }}>{fotoMsg || "Nur für Ausbilder sichtbar. Am Handy kannst du direkt fotografieren."}</span>
            </div>
          )}
          {backtage && (
            <div className="lt-backtage" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ width: "100%", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "20px" }}>Backtage</span>
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((t) => <span key={t} className={backtage.tage.includes(t) ? "lt-papier" : undefined} style={{ flex: '1 1 0', textAlign: 'center', padding: '8px 0', borderRadius: '10px', fontWeight: 800, fontSize: '15px', backgroundColor: backtage.tage.includes(t) ? '#FFC72C' : dc('#F3EADA'), color: backtage.tage.includes(t) ? '#2B170A' : TH.muted }}>{t}</span>)}
              </div>
              {backtage.info && <div style={{ fontSize: "15px", lineHeight: 1.4, color: TH.brown }}>{backtage.info}</div>}
            </div>
          )}
          {(facts.length > 0 || sp?.vegan) && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {facts.map((f) => (
                <div key={f.label} style={{ flex: "1 1 120px", padding: "10px 14px", borderRadius: "16px", backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: TH.muted, textTransform: "uppercase", letterSpacing: "1px" }}>{f.label}</div>
                  <div style={{ fontSize: "19px", fontWeight: 700 }}>{f.value}</div>
                </div>
              ))}
              {sp?.vegan && (
                <div style={{ flex: "1 1 120px", padding: "10px 14px", borderRadius: "16px", backgroundColor: TH.tintSage, color: TH.green, display: "flex", alignItems: "center", fontSize: "19px", fontWeight: 700 }}>Vegan</div>
              )}
            </div>
          )}

          {sp && (
            <>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <SpeakButton natuerlich text={steckbriefText(sp)} label="Steckbrief vorlesen" />
                <button type="button" className="lt-vergleich-knopf" onClick={() => setVergleich(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "46px", padding: "0 16px", borderRadius: "999px", border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}><LtIcon paths={ICON.swap} size={20} />Vergleichen</button>
              </div>
              {vergleich && <ProduktVergleich a={sp} images={images} onClose={() => setVergleich(false)} />}
              <div className="lt-verkauf-sagen lt-papier" style={{ padding: "16px 18px", borderRadius: "20px", backgroundColor: '#3A1F0E', color: '#FFF1D2' }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "16px", fontWeight: 700, color: '#FFC72C' }}>Im Verkauf sagen</div>
                <div style={{ fontSize: "19px", fontWeight: 700, lineHeight: 1.45, marginTop: "6px" }}>{sp.shortIngredients}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: TH.red, textTransform: "uppercase", letterSpacing: "1px" }}>Allergene</div>
                {sp.allergens.length > 0 ? (
                  <div className="lt-allergen-raster" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 175px), 1fr))", gap: "8px" }}>
                    {sp.allergens.map((a) => { const { kopf, teil } = teileAllergen(a); const st = ALLERGEN_STIL[kopf] || { bg: TH.tintPeach, ink: TH.red }; return (
                      <div key={a} lang="de" className="lt-allergen lt-papier" style={{ minWidth: 0, overflowWrap: "anywhere", hyphens: "auto", display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px 14px", borderRadius: "16px", backgroundColor: dc(st.bg), color: st.ink, border: `2px solid ${st.ink}22` }}>
                        {st.icon && <span aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "1px" }}><LtIcon paths={st.icon} size={20} /></span>}
                        <span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: "18px", fontWeight: 800, lineHeight: 1.2 }}>{kopf}</span>{teil && <span style={{ display: "block", fontSize: "15px", fontWeight: 700, marginTop: "2px" }}>{teil}</span>}</span>
                      </div>
                    ); })}
                  </div>
                ) : (
                  <div style={{ padding: "12px 14px", borderRadius: "16px", backgroundColor: TH.tintSage, fontSize: "18px", fontWeight: 700, color: TH.green }}>{sp.allergenNote ? "Keine Allergene enthalten" : "Keine Allergene"}</div>
                )}
                {sp.allergenNote && <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 14px", borderRadius: "14px", backgroundColor: TH.tintPeach, fontSize: "16px", color: TH.red, lineHeight: 1.45 }}><LtIcon paths={ICON.flag} size={18} />{sp.allergenNote}</div>}
              </div>
              {sp.description && <p style={{ margin: 0, fontSize: "18px", lineHeight: 1.55 }}>{sp.description}</p>}
              {sp.flour && <div style={{ fontSize: "17px", lineHeight: 1.45 }}><strong>Mehl:</strong> {sp.flour}</div>}
              {sp.note && <div style={{ fontSize: "17px", lineHeight: 1.45, color: TH.brown }}>{sp.note}</div>}
              <details style={{ backgroundColor: TH.white, border: `2px solid ${TH.line}`, borderRadius: "16px", padding: "12px 16px" }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "17px", minHeight: "32px" }}>Vollständige Zutatenliste</summary>
                <div style={{ fontSize: "16px", lineHeight: 1.55, color: TH.brown, marginTop: "8px" }}>{sp.fullIngredients}</div>
              </details>
            </>
          )}

          {!sp && prod.facts.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: "22px", fontSize: "18px", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: "6px" }}>
              {prod.facts.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}

          <KollegenTipps key={sp ? sp.name : prod.name} produkt={sp ? sp.name : prod.name} tipps={kollegenTipps} meine={meineTipps} onTipp={onTipp} />
          {onNotiz && <MeineNotiz key={`notiz-${sp ? sp.name : prod.name}`} produkt={sp ? sp.name : prod.name} notiz={meineNotizen[sp ? sp.name : prod.name] || ''} onNotiz={onNotiz} />}

          {onSchicken && kollegen.length > 0 && (
            <div className="lt-sb-schicken" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: schickenAuf ? "12px 14px" : 0, borderRadius: "16px", backgroundColor: schickenAuf ? TH.tintYellow : "transparent" }}>
              {!schickenAuf ? (
                <button type="button" onClick={() => { setSchickenAuf(true); setGeschickt(''); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "50px", borderRadius: "16px", border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: "17px", fontWeight: 700, cursor: "pointer" }}><LtIcon paths={ICON.mail} size={20} />An Kollegen schicken</button>
              ) : geschickt ? (
                <div style={{ fontSize: "16px", fontWeight: 700, color: TH.green }}>Steckbrief an {geschickt} geschickt.</div>
              ) : (<>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "15px", fontWeight: 700 }}>An wen soll der Steckbrief „{pName}“?
                  <select value={schickenAn} onChange={(e) => setSchickenAn(e.target.value)} aria-label="Kollege" style={{ minHeight: "48px", padding: "0 12px", borderRadius: "14px", border: `2px solid ${TH.line}`, fontSize: "17px", backgroundColor: TH.white, color: TH.ink }}>
                    <option value="">Bitte wählen</option>
                    {kollegen.map((k) => <option key={k.k} value={k.k}>{k.name}</option>)}
                  </select>
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" disabled={!schickenAn} onClick={() => { const k = kollegen.find((x) => x.k === schickenAn); if (!k) return; onSchicken(k.k, k.name, pName); setGeschickt(k.name); setSchickenAn(''); }} style={{ flex: 1, minHeight: "48px", borderRadius: "14px", border: "none", backgroundColor: schickenAn ? TH.brown : TH.line, color: dc('#FFF6E0'), fontSize: "16px", fontWeight: 700, cursor: schickenAn ? "pointer" : "default" }}>Schicken</button>
                  <button type="button" onClick={() => setSchickenAuf(false)} style={{ minHeight: "48px", padding: "0 16px", borderRadius: "14px", border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>Abbrechen</button>
                </div>
                <div style={{ fontSize: "14px", color: TH.brown }}>Dein Kollege bekommt eine Nachricht mit dem Steckbrief.</div>
              </>)}
            </div>
          )}
          <ReportContext report={{ game: "Steckbrief", product: sp ? sp.name : prod.name, text: `Steckbrief ${sp ? sp.name : prod.name}`, detail: sp ? `Preis: ${sp.price || "unbekannt"}${prod.slice ? `, Schnitt: ${prod.slice}` : ""}\nIm Verkauf sagen: ${sp.shortIngredients}\nAllergene: ${sp.allergens.join(", ") || "keine angegeben"}` : `${prod.name}\n${prod.facts.join("\n")}` }} />
          <button onClick={() => toggleFavorite(prod.ids[0])} style={{ minHeight: "54px", borderRadius: "16px", border: fav ? "none" : `2px solid ${TH.line}`, backgroundColor: fav ? TH.tintYellow : TH.white, color: TH.ink, fontSize: "18px", fontWeight: 700, cursor: "pointer" }}>
            {fav ? "★ Gemerkt, nochmal tippen zum Entfernen" : "☆ Merken"}
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button disabled={!prev} onClick={() => goTo(prev)} style={{ flex: 1, minHeight: "54px", borderRadius: "16px", border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: "17px", fontWeight: 700, cursor: prev ? "pointer" : "default", opacity: prev ? 1 : 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 12px" }}>‹ {prev ? prev.name : "Anfang"}</button>
            <button disabled={!next} onClick={() => goTo(next)} style={{ flex: 1, minHeight: "54px", borderRadius: "16px", border: "none", backgroundColor: TH.brown, color: dc('#FFF6E0'), fontSize: "17px", fontWeight: 700, cursor: next ? "pointer" : "default", opacity: next ? 1 : 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 12px" }}>{next ? next.name : "Ende"} ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
