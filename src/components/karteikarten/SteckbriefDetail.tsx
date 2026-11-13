// ═══ Karteikarten: Steckbrief-Detail (aufgeklappte Karte) ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { TH, productImageKey, ProductImages } from '../../ui/basis';
import { ReportContext } from '../../ui/melden';
import { SpeakButton } from '../../games/spielBasis';
import { getProductEmoji, Profile } from './daten';
import { KollegenTipps } from './KollegenTipps';
import { MeineNotiz } from './MeineNotiz';
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
};

export function SteckbriefDetail({ favorites, toggleFavorite, images, setOpenProfileKey, filteredProfiles, openProfile, kollegenTipps = [], meineTipps = [], onTipp, meineNotizen = {}, onNotiz }: SteckbriefDetailProps) {
  if (!openProfile) return null; // wie die Bedingung in components/FlashcardView.tsx
  const prod = openProfile;
  const idx = filteredProfiles.indexOf(prod);
  const prev = idx > 0 ? filteredProfiles[idx - 1] : null;
  const next = idx >= 0 && idx < filteredProfiles.length - 1 ? filteredProfiles[idx + 1] : null;
  const fav = favorites.includes(prod.ids[0]);
  const sp = prod.shop;
  const facts: { label: string; value: string }[] = [
    ...(sp?.price ? [{ label: "Preis", value: sp.price + (sp.pricePerKg ? ` (${sp.pricePerKg})` : "") }] : []),
    ...(sp?.weight ? [{ label: "Gewicht", value: sp.weight }] : []),
    ...(prod.slice ? [{ label: "Schnitt", value: prod.slice }] : []),
  ];
  const goTo = (p: Profile | null) => p && setOpenProfileKey(`${p.name}_${p.ids[0]}`);
  return (
    <div className="fc-overlay" onClick={() => setOpenProfileKey(null)} style={{ position: "fixed", inset: 0, zIndex: 120, backgroundColor: "rgba(43,23,10,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="fc-sheet" role="dialog" aria-modal="true" aria-label={`Steckbrief ${prod.name}`} onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", backgroundColor: TH.cream, borderRadius: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", textAlign: "left", color: TH.ink }}>
        <div style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: TH.yellow, padding: "20px 22px", display: "flex", alignItems: "center", gap: "14px" }}>
          <span aria-hidden="true" style={{ flex: "0 0 64px", height: "64px", borderRadius: "18px", backgroundColor: TH.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>{getProductEmoji(prod.name, prod.group)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: TH.serif, fontSize: "32px", lineHeight: 1.1 }}>{prod.name}</div>
            <div style={{ fontSize: "17px", marginTop: "2px" }}>{prod.group}</div>
          </div>
          <button onClick={() => setOpenProfileKey(null)} aria-label="Schließen" style={{ flex: "0 0 48px", height: "48px", borderRadius: "50%", border: "none", backgroundColor: TH.white, color: TH.ink, fontSize: "24px", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {images[productImageKey(prod.name)] && (
            <img src={images[productImageKey(prod.name)]} alt={prod.name} style={{ width: "100%", maxWidth: "320px", alignSelf: "center", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "22px", border: `2px solid ${TH.line}` }} />
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
                <div style={{ flex: "1 1 120px", padding: "10px 14px", borderRadius: "16px", backgroundColor: TH.tintSage, color: TH.green, display: "flex", alignItems: "center", fontSize: "19px", fontWeight: 700 }}>🌱 Vegan</div>
              )}
            </div>
          )}

          {sp && (
            <>
              <div style={{ alignSelf: "flex-start" }}><SpeakButton text={`${sp.name}. ${sp.description || ""} Im Verkauf sagen: ${sp.shortIngredients}. Allergene: ${sp.allergens.join(", ") || "keine"}.${sp.price ? ` Preis: ${sp.price}.` : ""}`} label="Steckbrief vorlesen" /></div>
              {sp.description && <p style={{ margin: 0, fontSize: "18px", lineHeight: 1.55 }}>{sp.description}</p>}
              <div style={{ padding: "16px 18px", borderRadius: "18px", backgroundColor: TH.tintYellow }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: TH.muted, textTransform: "uppercase", letterSpacing: "1px" }}>Im Verkauf sagen</div>
                <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.45, marginTop: "4px" }}>{sp.shortIngredients}</div>
              </div>
              <div style={{ padding: "16px 18px", borderRadius: "18px", backgroundColor: TH.tintPeach }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: TH.red, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Allergene</div>
                {sp.allergens.length > 0 ? (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {sp.allergens.map((a) => (
                      <span key={a} style={{ fontSize: "17px", fontWeight: 700, color: TH.red, backgroundColor: TH.white, padding: "4px 12px", borderRadius: "999px" }}>{a}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "18px", fontWeight: 700, color: TH.green }}>{sp.allergenNote ? "Keine Allergene enthalten" : "Keine Allergene"}</div>
                )}
                {sp.allergenNote && <div style={{ fontSize: "16px", color: TH.red, marginTop: "8px", lineHeight: 1.45 }}>{sp.allergenNote}</div>}
              </div>
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

          <ReportContext report={{ game: "Steckbrief", product: sp ? sp.name : prod.name, text: `Steckbrief ${sp ? sp.name : prod.name}`, detail: sp ? `Preis: ${sp.price || "–"}${prod.slice ? `, Schnitt: ${prod.slice}` : ""}\nIm Verkauf sagen: ${sp.shortIngredients}\nAllergene: ${sp.allergens.join(", ") || "keine angegeben"}` : `${prod.name}\n${prod.facts.join("\n")}` }} />
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
