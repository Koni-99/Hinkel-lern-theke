// ═══ Karteikarten: interaktive Lernkarten ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { hoerTexte, stimmeKey } from '../../hilfen/stimme';
import { dc } from '../../daten/data';
import { getRightAnswerText } from '../../hilfen/allgemein';
import { TH } from '../../ui/basis';
import { ReportContext } from '../../ui/melden';
import { SpeakButton, sprichHoerDatei, stopSpeaking } from '../../games/spielBasis';
import { fachVon, faecherZaehlen } from '../../hilfen/lernkasten';

export type LernkartenProps = {
  lernkasten: Record<string, number>;
  onBewerten?: (karte: string, gewusst: boolean) => void;
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

export function Lernkarten({ lernkasten, onBewerten, toggleFavorite, currentIndex, setCurrentIndex, flipped, setFlipped, setAskMode, askMode, filteredCards, current, isFav }: LernkartenProps) {
  // „Vorlesen“ (Version 237): natürliche Stimme aus dem Hör-Lernen (vorne Frage, hinten Antwort)
  useEffect(() => {
    if (!askMode || !current) { if (!askMode) stopSpeaking(); return; }
    const t = hoerTexte(current);
    const z = window.setTimeout(() => sprichHoerDatei(stimmeKey(flipped ? t.antwort : t.frage), flipped ? t.antwort : t.frage), 650);
    return () => window.clearTimeout(z);
  }, [askMode, flipped, current]);
  return (
    <>
      {/* Lernkarte mit echter 3D-Dreh-Animation */}
      {typeof window !== "undefined" && "speechSynthesis" in window && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <button onClick={() => setAskMode(!askMode)} aria-pressed={askMode} style={{ minHeight: "42px", padding: "0 16px", borderRadius: "999px", border: `2px solid ${askMode ? TH.green : TH.line}`, backgroundColor: askMode ? TH.tintSage : TH.white, color: askMode ? TH.green : TH.brown, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>Frag mich ab{askMode ? ": an" : ""}</button>
              {askMode && <span style={{ fontSize: "14px", color: TH.muted, textAlign: "center" }}>Ich lese die Karte vor. Sag die Antwort laut, dann dreh die Karte um.</span>}
            </div>
          )}
      <div key={current.id} className="fc-flip-in lt-papier lt-kk-stapel" style={{ width: "100%", maxWidth: "540px", height: "400px", perspective: "1400px" }}>
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Karte zurückdrehen" : "Karte umdrehen"}
          onClick={() => setFlipped(!flipped)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped(!flipped); } }}
          style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform .8s cubic-bezier(.34,1.42,.5,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", cursor: "pointer" }}
        >
          {/* Vorderseite: die Frage */}
          <div aria-hidden={flipped} className="lt-papier lt-kk lt-kk-vorne">
            <div className="lt-kk-kopf">
              <span className="lt-kk-gruppe">{current.category}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Fach {fachVon(lernkasten, `frage-${current.id}`)} · Karte {currentIndex + 1} / {filteredCards.length}
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(current.id); }} aria-label={isFav ? "Nicht mehr merken" : "Karte merken"} className="lt-kk-stern">{isFav ? "★" : "☆"}</button>
              </span>
            </div>
            <div className="lt-kk-mitte"><div className="lt-kk-fragetext">{current.question}</div></div>
            <div className="lt-kk-fuss">Antippen zum Umdrehen</div>
          </div>
          {/* Rückseite: Antwort in Handschrift */}
          <div aria-hidden={!flipped} className="lt-papier lt-kk lt-kk-hinten">
            <div className="lt-kk-kopf"><span className="lt-kk-gruppe">Antwort</span><span>{current.category}</span></div>
            <ul className="lt-kk-liste">
              <li><b>{getRightAnswerText(current)}</b></li>
              {current.explanation && <li>{current.explanation}</li>}
            </ul>
            <div className="lt-kk-werkzeug" onClick={(e) => e.stopPropagation()}>
              <SpeakButton small hoerKey={stimmeKey(hoerTexte(current).antwort)} text={`${getRightAnswerText(current)}. ${current.explanation || ""}`} />
              {typeof current.id === "number" && <ReportContext report={{ game: "Lernkarten", qid: current.id, product: (current as any).product, text: current.question }} />}
            </div>
          </div>
        </div>
      </div>
      {onBewerten && flipped && (
        <div className="lt-kk-bewerten" style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "540px" }}>
          <button type="button" className="lt-kk-nochmal" onClick={() => { onBewerten(`frage-${current.id}`, false); setFlipped(false); setCurrentIndex((prev) => (prev + 1) % filteredCards.length); }}>Nochmal</button>
          <button type="button" className="lt-kk-gewusst" onClick={() => { onBewerten(`frage-${current.id}`, true); setFlipped(false); setCurrentIndex((prev) => (prev + 1) % filteredCards.length); }}>Wusste ich</button>
        </div>
      )}
      {onBewerten && (() => {
        const z = faecherZaehlen(filteredCards.map((q: any) => `frage-${q.id}`), lernkasten);
        const max = Math.max(1, ...z);
        return (
          <div className="lt-kk-kasten" aria-label="Lernkasten">
            <span className="lt-kk-kasten-titel">Dein Lernkasten</span>
            <div className="lt-kk-faecher">
              {z.map((n, i) => (
                <div key={i} className={`lt-kk-fach${fachVon(lernkasten, `frage-${current.id}`) === i + 1 ? " lt-kk-fach-an" : ""}`} title={`Fach ${i + 1}: ${n} Karten`}>
                  <span className="lt-kk-fach-stapel" style={{ height: `${Math.round((n / max) * 100)}%` }} />
                  <b>{n}</b><small>Fach {i + 1}</small>
                </div>
              ))}
            </div>
            <span className="lt-kk-kasten-hilfe">Fach 1 = noch üben, Fach 5 = sitzt. Gewusste Karten wandern nach hinten.</span>
          </div>
        );
      })()}
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
