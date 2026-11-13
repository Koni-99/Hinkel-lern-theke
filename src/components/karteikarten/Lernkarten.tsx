// ═══ Karteikarten: interaktive Lernkarten ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { getRightAnswerText } from '../../hilfen/allgemein';
import { TH } from '../../ui/basis';
import { ReportContext } from '../../ui/melden';
import { SpeakButton } from '../../games/spielBasis';

export type LernkartenProps = {
  toggleFavorite: (id: number) => void;
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  flipped: boolean;
  setFlipped: Dispatch<SetStateAction<boolean>>;
  setAskMode: Dispatch<SetStateAction<boolean>>;
  askMode: boolean;
  filteredCards: any[];
  current: any;
  isFav: boolean;
};

export function Lernkarten({ toggleFavorite, currentIndex, setCurrentIndex, flipped, setFlipped, setAskMode, askMode, filteredCards, current, isFav }: LernkartenProps) {
  return (
    <>
      {/* Lernkarte mit echter 3D-Dreh-Animation */}
      {typeof window !== "undefined" && "speechSynthesis" in window && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <button onClick={() => setAskMode(!askMode)} aria-pressed={askMode} style={{ minHeight: "42px", padding: "0 16px", borderRadius: "999px", border: `2px solid ${askMode ? TH.green : TH.line}`, backgroundColor: askMode ? TH.tintSage : TH.white, color: askMode ? TH.green : TH.brown, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>🎧 Frag mich ab{askMode ? ": an" : ""}</button>
              {askMode && <span style={{ fontSize: "14px", color: TH.muted, textAlign: "center" }}>Ich lese die Karte vor. Sag die Antwort laut, dann dreh die Karte um.</span>}
            </div>
          )}
      <div key={current.id} className="fc-flip-in" style={{ width: "100%", maxWidth: "520px", height: "340px", perspective: "1400px" }}>
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Karte zurückdrehen" : "Karte umdrehen"}
          onClick={() => setFlipped(!flipped)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped(!flipped); } }}
          style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform .6s cubic-bezier(.2,.8,.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", cursor: "pointer" }}
        >
          {[false, true].map((back) => (
            <div
              key={back ? "back" : "front"}
              aria-hidden={back ? !flipped : flipped}
              className="lt-paper" style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : "none", backgroundColor: back ? dc('#F3F8F1') : dc('#ffffff'), padding: "22px 24px", borderRadius: "22px", border: back ? `2px solid ${dc('#CFE3C9')}` : `2px solid ${dc('#F1E3C8')}`, boxShadow: "0 14px 30px -10px rgba(69, 26, 3, 0.18)", display: "flex", flexDirection: "column", gap: "10px", textAlign: "center", boxSizing: "border-box", overflow: "hidden" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: 700, color: dc('#8A5A00') }}>
                <span style={{ backgroundColor: dc('#FFF0C2'), padding: "4px 10px", borderRadius: "999px" }}>{current.category}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: dc('#6B4A30') }}>
                  Karte {currentIndex + 1} / {filteredCards.length}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(current.id); }}
                    aria-label={isFav ? "Nicht mehr merken" : "Karte merken"}
                    style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer", padding: 0, minHeight: "auto", lineHeight: 1 }}
                  >
                    {isFav ? "⭐" : "☆"}
                  </button>
                </span>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {!back ? (
                  <h3 style={{ fontSize: "24px", fontWeight: 700, color: dc('#2B170A'), margin: 0, lineHeight: 1.4 }}>{current.question}</h3>
                ) : (
                  <div>
                    <span style={{ fontSize: "15px", color: dc('#2F5D3A'), fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Antwort & Erklärung</span>
                    <p style={{ fontSize: "20px", fontWeight: 700, color: dc('#2F5D3A'), margin: "0 0 8px 0" }}>{getRightAnswerText(current)}</p>
                    <p style={{ fontSize: "17px", color: dc('#6B4A30'), margin: 0, lineHeight: 1.45 }}>{current.explanation}</p>
                    <span onClick={(e) => e.stopPropagation()} style={{ display: "inline-block", marginTop: "8px" }}><SpeakButton small text={`${getRightAnswerText(current)}. ${current.explanation || ""}`} /></span>
                    {typeof current.id === "number" && <ReportContext report={{ game: "Lernkarten", qid: current.id, product: (current as any).product, text: current.question }} />}
                  </div>
                )}
              </div>
              <div style={{ fontSize: "16px", color: dc('#8A5A00'), fontWeight: 700 }}>{back ? "↺ Antippen, zurück zur Frage" : "↻ Antippen zum Umdrehen"}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => {
            setFlipped(false);
            setCurrentIndex(
              (prev) =>
                (prev - 1 + filteredCards.length) % filteredCards.length
            );
          }}
          style={{
            backgroundColor: dc('#ffffff'),
            color: dc('#2B170A'),
            padding: "11px 22px",
            borderRadius: "12px",
            border: `2px solid ${dc('#F1E3C8')}`,
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          ← Vorherige
        </button>
        <button
          onClick={() => {
            setFlipped(false);
            setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
          }}
          style={{
            background: dc('#4B2A14'),
            color: dc('#fff'),
            padding: "11px 22px",
            borderRadius: "12px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(120, 53, 15, 0.2)",
          }}
        >
          Nächste Karte →
        </button>
      </div>
    </>
  );
}
