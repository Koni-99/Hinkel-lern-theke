// ═══ Karteikarten: Produkt-Lernkarten (Foto vorne, Infos hinten) ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { produktKarteText, produktKarteVorne, karteStimme } from '../../hilfen/vorlesen';
import { dc } from '../../daten/data';
import { TH, cardStyle, productImageKey, ProductImages } from '../../ui/basis';
import { ReportContext } from '../../ui/melden';
import { SpeakButton, sprichSaetze, stopSpeaking } from '../../games/spielBasis';
import { Profile } from './daten';
import { fachVon, faecherZaehlen } from '../../hilfen/lernkasten';

/** Fakten auf der Rückseite (auch fürs Vorlesen) */
const faktenVon = (p: Profile) => {
  const sp = p.shop!;
  return [sp.flour ? ['Mehl', sp.flour] : null, p.slice ? ['Schnitt', p.slice] : null, sp.weight ? ['Gewicht', sp.weight] : null, sp.price ? ['Preis', sp.price] : null].filter((x): x is string[] => !!x);
};

export type ProduktKartenProps = {
  lernkasten: Record<string, number>;
  pcBewerten: (gewusst: boolean) => void;
  kannBewerten: boolean;
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

export function ProduktKarten({ lernkasten, pcBewerten, kannBewerten, images, pcGroup, setPcGroup, setPcIndex, pcIndex, setPcFlipped, pcFlipped, setAskMode, askMode, setPcOrder, cardProducts, pcGroups, pcList, pcCurrent, pcGo, pcShuffle }: ProduktKartenProps) {
  // „Vorlesen“ (Version 237): natürliche Stimme. Vorne Name und Frage, hinten die Infos der Karte
  useEffect(() => {
    if (!askMode || !pcCurrent || !pcCurrent.shop) { if (!askMode) stopSpeaking(); return; }
    const t = window.setTimeout(() => sprichSaetze(pcFlipped ? produktKarteText(pcCurrent.name, faktenVon(pcCurrent), pcCurrent.shop!) : produktKarteVorne(pcCurrent.name), undefined, karteStimme(pcCurrent.name)), 650);
    return () => window.clearTimeout(t);
  }, [askMode, pcFlipped, pcCurrent]);
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "100%", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={pcGroup} onChange={(e) => { setPcGroup(e.target.value); setPcIndex(0); setPcFlipped(false); setPcOrder([]); }} aria-label="Kategorie" style={{ flex: "1 1 220px", padding: "10px 14px", borderRadius: "12px", border: `2px solid ${TH.line}`, fontSize: "17px", fontWeight: 700, color: TH.ink, backgroundColor: TH.white }}>
          <option value="Alle">Alle Kategorien ({cardProducts.length})</option>
          {pcGroups.map((g) => <option key={g} value={g}>{g} ({cardProducts.filter((p) => p.group === g).length})</option>)}
        </select>
        <button onClick={pcShuffle} style={{ padding: "0 16px", borderRadius: "12px", border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>Mischen</button>
      </div>
    
      {!pcCurrent ? (
        <div style={{ ...cardStyle, width: "100%", textAlign: "center", fontSize: "18px", color: TH.muted }}>Keine Produkte gefunden.</div>
      ) : (() => {
        const p = pcCurrent;
        const sp = p.shop!;
        const img = images[productImageKey(p.name)];
        const facts = faktenVon(p);
        return (<>
          {typeof window !== "undefined" && "speechSynthesis" in window && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <button onClick={() => setAskMode(!askMode)} aria-pressed={askMode} style={{ minHeight: "42px", padding: "0 16px", borderRadius: "999px", border: `2px solid ${askMode ? TH.green : TH.line}`, backgroundColor: askMode ? TH.tintSage : TH.white, color: askMode ? TH.green : TH.brown, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>Frag mich ab{askMode ? ": an" : ""}</button>
              {askMode && <span style={{ fontSize: "14px", color: TH.muted, textAlign: "center" }}>Ich lese die Karte vor. Sag die Antwort laut, dann dreh die Karte um.</span>}
            </div>
          )}
          <div key={p.name} className="fc-flip-in lt-papier lt-kk-stapel" style={{ width: "100%", maxWidth: "540px", height: "440px", perspective: "1400px" }}>
            <div
              role="button"
              tabIndex={0}
              aria-label={pcFlipped ? "Karte zurückdrehen" : "Karte umdrehen"}
              onClick={() => setPcFlipped(!pcFlipped)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPcFlipped(!pcFlipped); } }}
              style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform .8s cubic-bezier(.34,1.42,.5,1)", transform: pcFlipped ? "rotateY(180deg)" : "rotateY(0deg)", cursor: "pointer" }}
            >
              {/* Vorderseite: Karteikarte mit rotem Rand und Linien, nur der Name */}
              <div aria-hidden={pcFlipped} className="lt-papier lt-kk lt-kk-vorne">
                <div className="lt-kk-kopf"><span className="lt-kk-gruppe">{p.group}</span><span>Fach {fachVon(lernkasten, p.name)} · Karte {Math.min(pcIndex, pcList.length - 1) + 1} / {pcList.length}</span></div>
                <div className="lt-kk-mitte">
                  <div className="lt-kk-name">{p.name}</div>
                  <div className="lt-kk-frage">Was weißt du darüber? Mehl, Zutaten, Allergene und Schnitt.</div>
                </div>
                <div className="lt-kk-fuss">Antippen zum Umdrehen</div>
              </div>
              {/* Rückseite: Antwort in Handschrift als Stichpunkte */}
              <div aria-hidden={!pcFlipped} className="lt-papier lt-kk lt-kk-hinten">
                <div className="lt-kk-kopf"><span className="lt-kk-gruppe">{p.name}</span><span>{p.group}{sp.vegan ? " · vegan" : ""}</span></div>
                <ul className="lt-kk-liste">
                  {facts.map(([l, v]) => <li key={l}><b>{l}:</b> {v}</li>)}
                  <li><b>Im Verkauf sagen:</b> {sp.shortIngredients}</li>
                  <li><b>Allergene:</b> {sp.allergens.length ? sp.allergens.join(", ") : "keine angegeben"}</li>
                  {sp.allergenNote && <li className="lt-kk-warn">{sp.allergenNote}</li>}
                </ul>
                <div className="lt-kk-werkzeug" onClick={(e) => e.stopPropagation()}>
                  {img && <img src={img} alt="" className="lt-kk-foto" />}
                  <SpeakButton small natuerlich stimme={karteStimme(p.name)} text={produktKarteText(p.name, facts, sp)} />
                  <ReportContext report={{ game: "Produktkarten", product: p.name, text: `Produktkarte ${p.name}`, detail: `${facts.map(([l, v]) => `${l}: ${v}`).join(", ")}\nIm Verkauf sagen: ${sp.shortIngredients}\nAllergene: ${sp.allergens.join(", ") || "keine angegeben"}` }} />
                </div>
              </div>
            </div>
          </div>
          {kannBewerten && pcFlipped && (
            <div className="lt-kk-bewerten" style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "540px" }}>
              <button type="button" className="lt-kk-nochmal" onClick={() => pcBewerten(false)}>Nochmal</button>
              <button type="button" className="lt-kk-gewusst" onClick={() => pcBewerten(true)}>Wusste ich</button>
            </div>
          )}
          {kannBewerten && (() => {
            const z = faecherZaehlen(pcList.map((x) => x.name), lernkasten);
            const max = Math.max(1, ...z);
            return (
              <div className="lt-kk-kasten" aria-label="Lernkasten">
                <span className="lt-kk-kasten-titel">Dein Lernkasten</span>
                <div className="lt-kk-faecher">
                  {z.map((n, i) => (
                    <div key={i} className={`lt-kk-fach${fachVon(lernkasten, p.name) === i + 1 ? " lt-kk-fach-an" : ""}`} title={`Fach ${i + 1}: ${n} Karten`}>
                      <span className="lt-kk-fach-stapel" style={{ height: `${Math.round((n / max) * 100)}%` }} />
                      <b>{n}</b><small>Fach {i + 1}</small>
                    </div>
                  ))}
                </div>
                <span className="lt-kk-kasten-hilfe">Fach 1 = noch üben, Fach 5 = sitzt. Gewusste Karten wandern nach hinten.</span>
              </div>
            );
          })()}
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
