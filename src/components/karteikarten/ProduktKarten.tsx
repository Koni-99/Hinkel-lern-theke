// ═══ Karteikarten: Produkt-Lernkarten (Foto vorne, Infos hinten) ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { TH, cardStyle, productImageKey, ProductImages } from '../../ui/basis';
import { ReportContext } from '../../ui/melden';
import { SpeakButton } from '../../games/spielBasis';
import { groupColor, getProductEmoji, Profile } from './daten';

export type ProduktKartenProps = {
  images: ProductImages;
  pcGroup: string;
  setPcGroup: Dispatch<SetStateAction<string>>;
  setPcIndex: Dispatch<SetStateAction<number>>;
  pcIndex: number;
  setPcFlipped: Dispatch<SetStateAction<boolean>>;
  pcFlipped: boolean;
  setAskMode: Dispatch<SetStateAction<boolean>>;
  askMode: boolean;
  pcMode: "foto" | "name";
  setPcMode: Dispatch<SetStateAction<"foto" | "name">>;
  setPcOrder: Dispatch<SetStateAction<string[]>>;
  cardProducts: Profile[];
  pcGroups: string[];
  pcList: Profile[];
  pcCurrent: Profile | null;
  pcGo: (delta: number) => void;
  pcShuffle: () => void;
};

export function ProduktKarten({ images, pcGroup, setPcGroup, setPcIndex, pcIndex, setPcFlipped, pcFlipped, setAskMode, askMode, pcMode, setPcMode, setPcOrder, cardProducts, pcGroups, pcList, pcCurrent, pcGo, pcShuffle }: ProduktKartenProps) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "100%", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={pcGroup} onChange={(e) => { setPcGroup(e.target.value); setPcIndex(0); setPcFlipped(false); setPcOrder([]); }} aria-label="Kategorie" style={{ flex: "1 1 220px", padding: "10px 14px", borderRadius: "12px", border: `2px solid ${TH.line}`, fontSize: "17px", fontWeight: 700, color: TH.ink, backgroundColor: TH.white }}>
          <option value="Alle">Alle Kategorien ({cardProducts.length})</option>
          {pcGroups.map((g) => <option key={g} value={g}>{g} ({cardProducts.filter((p) => p.group === g).length})</option>)}
        </select>
        <div role="tablist" aria-label="Vorderseite" style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "14px", backgroundColor: TH.cream, border: `2px solid ${TH.line}` }}>
          {([["foto", "📷 Foto vorne"], ["name", "🏷️ Name vorne"]] as const).map(([m, l]) => (
            <button key={m} role="tab" aria-selected={pcMode === m} onClick={() => { setPcMode(m); setPcFlipped(false); }} style={{ padding: "0 14px", borderRadius: "10px", border: "none", backgroundColor: pcMode === m ? TH.brown : "transparent", color: pcMode === m ? dc('#FFF6E0') : TH.ink, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <button onClick={pcShuffle} style={{ padding: "0 16px", borderRadius: "12px", border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>🔀 Mischen</button>
      </div>
    
      {!pcCurrent ? (
        <div style={{ ...cardStyle, width: "100%", textAlign: "center", fontSize: "18px", color: TH.muted }}>Keine Produkte gefunden.</div>
      ) : (() => {
        const p = pcCurrent;
        const sp = p.shop!;
        const img = images[productImageKey(p.name)];
        const showPhoto = pcMode === "foto" && !!img;
        const facts = [
          sp.flour ? ["Mehl", sp.flour] : null,
          p.slice ? ["Schnitt", p.slice] : null,
          sp.weight ? ["Gewicht", sp.weight] : null,
          sp.price ? ["Preis", sp.price] : null,
        ].filter((x): x is string[] => !!x);
        return (<>
          {typeof window !== "undefined" && "speechSynthesis" in window && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <button onClick={() => setAskMode(!askMode)} aria-pressed={askMode} style={{ minHeight: "42px", padding: "0 16px", borderRadius: "999px", border: `2px solid ${askMode ? TH.green : TH.line}`, backgroundColor: askMode ? TH.tintSage : TH.white, color: askMode ? TH.green : TH.brown, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>🎧 Frag mich ab{askMode ? ": an" : ""}</button>
              {askMode && <span style={{ fontSize: "14px", color: TH.muted, textAlign: "center" }}>Ich lese die Karte vor. Sag die Antwort laut, dann dreh die Karte um.</span>}
            </div>
          )}
          <div key={p.name + pcMode} className="fc-flip-in" style={{ width: "100%", maxWidth: "540px", height: "460px", perspective: "1400px" }}>
            <div
              role="button"
              tabIndex={0}
              aria-label={pcFlipped ? "Karte zurückdrehen" : "Karte umdrehen"}
              onClick={() => setPcFlipped(!pcFlipped)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPcFlipped(!pcFlipped); } }}
              style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform .6s cubic-bezier(.2,.8,.2,1)", transform: pcFlipped ? "rotateY(180deg)" : "rotateY(0deg)", cursor: "pointer" }}
            >
              {/* Vorderseite */}
              <div aria-hidden={pcFlipped} className="lt-paper" style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", backgroundColor: TH.white, borderRadius: "24px", border: `2px solid ${TH.line}`, boxShadow: "0 14px 30px -10px rgba(69,26,3,.18)", padding: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", boxSizing: "border-box", textAlign: "center" }}>
                <div style={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, color: dc('#8A5A00') }}>
                  <span style={{ backgroundColor: groupColor(p.group), color: "#fff", padding: "4px 10px", borderRadius: "999px" }}>{p.group}</span>
                  <span style={{ color: TH.muted }}>Karte {Math.min(pcIndex, pcList.length - 1) + 1} / {pcList.length}</span>
                </div>
                {showPhoto ? (
                  <>
                    <img src={img} alt="Welches Produkt ist das?" style={{ width: "100%", maxWidth: "300px", flex: "1 1 auto", minHeight: 0, objectFit: "cover", aspectRatio: "1 / 1", borderRadius: "18px" }} />
                    <div style={{ fontFamily: TH.serif, fontSize: "26px" }}>Welches Produkt ist das?</div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "64px" }}>{getProductEmoji(p.name, p.group)}</span>
                    <div style={{ fontFamily: TH.serif, fontSize: "36px", lineHeight: 1.1 }}>{p.name}</div>
                    <div style={{ fontSize: "18px", color: TH.muted }}>Was weißt du darüber? Mehl, Zutaten, Allergene, Schnitt …</div>
                  </div>
                )}
                <div style={{ fontSize: "16px", color: dc('#8A5A00'), fontWeight: 700 }}>↻ Antippen zum Umdrehen</div>
              </div>
              {/* Rückseite */}
              <div aria-hidden={!pcFlipped} className="lt-paper" style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundColor: dc('#F3F8F1'), borderRadius: "24px", border: `2px solid ${dc('#CFE3C9')}`, boxShadow: "0 14px 30px -10px rgba(69,26,3,.18)", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", boxSizing: "border-box", textAlign: "left", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {img && <img src={img} alt="" style={{ flex: "0 0 64px", width: "64px", height: "64px", objectFit: "cover", borderRadius: "14px" }} />}
                  <div>
                    <div style={{ fontFamily: TH.serif, fontSize: "28px", lineHeight: 1.1 }}>{p.name}</div>
                    <div style={{ fontSize: "15px", color: TH.muted }}>{p.group}{sp.vegan ? " · 🌱 vegan" : ""}</div>
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {facts.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px" }}>
                      {facts.map(([l, v]) => (
                        <div key={l} style={{ padding: "6px 10px", borderRadius: "12px", backgroundColor: TH.white }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: TH.muted, textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
                          <div style={{ fontSize: "16px", fontWeight: 700 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: TH.tintYellow }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: TH.muted, textTransform: "uppercase", letterSpacing: "1px" }}>Im Verkauf sagen</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, lineHeight: 1.4 }}>{sp.shortIngredients}</div>
                  </div>
                  <div style={{ fontSize: "16px", lineHeight: 1.45 }}><strong>Allergene:</strong> {sp.allergens.length ? sp.allergens.join(", ") : "keine angegeben"}{sp.allergenNote ? ` · ${sp.allergenNote}` : ""}</div>
                  <span onClick={(e) => e.stopPropagation()} style={{ alignSelf: "flex-start" }}><SpeakButton small text={`${p.name}. ${facts.map(([l, v]) => `${l}: ${v}`).join(". ")}. Im Verkauf sagen: ${sp.shortIngredients}. Allergene: ${sp.allergens.join(", ") || "keine angegeben"}.`} /></span>
                  <ReportContext report={{ game: "Produktkarten", product: p.name, text: `Produktkarte ${p.name}`, detail: `${facts.map(([l, v]) => `${l}: ${v}`).join(", ")}\nIm Verkauf sagen: ${sp.shortIngredients}\nAllergene: ${sp.allergens.join(", ") || "keine angegeben"}` }} />
                </div>
                <div style={{ fontSize: "16px", color: TH.green, fontWeight: 700, textAlign: "center" }}>↺ Antippen, zurück</div>
              </div>
            </div>
          </div>
        </>);
      })()}
    
      {pcCurrent && (
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => pcGo(-1)} style={{ backgroundColor: TH.white, color: TH.ink, padding: "11px 22px", borderRadius: "12px", border: `2px solid ${TH.line}`, fontWeight: 700, cursor: "pointer", fontSize: "17px" }}>← Vorherige</button>
          <button onClick={() => pcGo(1)} style={{ backgroundColor: TH.brown, color: dc('#fff'), padding: "11px 22px", borderRadius: "12px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "17px" }}>Nächste Karte →</button>
        </div>
      )}
    </div>
  );
}
