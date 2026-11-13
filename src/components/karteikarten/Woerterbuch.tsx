// ═══ Karteikarten: Wörterbuch ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { DICT_ALL, DICT_CATS, speakEnglish } from './daten';

export type WoerterbuchProps = {
  dictCat: string;
  setDictCat: Dispatch<SetStateAction<string>>;
  filteredDictionary: { de: string; en: string; cat: string; say?: string | undefined; }[];
  dictLetterOf: (t: string) => string;
  dictLetters: string[];
};

export function Woerterbuch({ dictCat, setDictCat, filteredDictionary, dictLetterOf, dictLetters }: WoerterbuchProps) {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: dc('#ffffff'),
        padding: "22px",
        borderRadius: "18px",
        border: `2px solid ${dc('#F1E3C8')}`,
        boxShadow: "none",
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      <h3
        style={{
          margin: "0 0 6px 0",
          color: dc('#2B170A'),
          fontSize: "22px",
          fontWeight: "700",
        }}
      >
        🇬🇧 Englisch für die Theke
      </h3>
      <p style={{ fontSize: "16px", color: dc('#6B4A30'), margin: "0 0 14px" }}>
        {DICT_ALL.length} Begriffe und Sätze für Gäste aus aller Welt, dazu alle unsere Produkte. Tippe auf 🔊, dann wird es auf Englisch vorgelesen.
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {DICT_CATS.map((c) => {
          const on = dictCat === c;
          const n = c === "Alle" ? DICT_ALL.length : DICT_ALL.filter(d => d.cat === c).length;
          return <button key={c} onClick={() => setDictCat(c)} style={{ minHeight: "44px", padding: "0 14px", borderRadius: "999px", border: on ? "none" : `2px solid ${dc('#F1E3C8')}`, backgroundColor: on ? dc('#4B2A14') : dc('#FFFFFF'), color: on ? dc('#FFF6E0') : dc('#2B170A'), fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>{c} ({n})</button>;
        })}
      </div>
      {dictLetters.length > 6 && (
        <nav style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }} aria-label="Springe zum Buchstaben">
          {dictLetters.map((l) => <button key={l} aria-label={`Zu ${l} springen`} onClick={() => document.getElementById(`dict-${l}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ minWidth: "44px", minHeight: "44px", fontSize: "17px", borderRadius: "12px", border: `2px solid ${dc('#F1E3C8')}`, backgroundColor: dc('#FFFBF2'), color: dc('#4B2A14'), fontWeight: 800, cursor: "pointer" }}>{l}</button>)}
        </nav>
      )}
      <div style={{ fontSize: "15px", color: dc('#6B4A30'), marginBottom: "8px" }}>{filteredDictionary.length} Treffer</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
        {filteredDictionary.map((item, idx) => {
          const first = idx === 0 || dictLetterOf(filteredDictionary[idx - 1].de) !== dictLetterOf(item.de);
          return (
            <div key={`${idx}-${item.de}`} id={first ? `dict-${dictLetterOf(item.de)}` : undefined} className="fc-item lt-tilt" style={{ animationDelay: `${Math.min(idx, 14) * 0.03}s`, scrollMarginTop: "12px", backgroundColor: dc('#FFFBF2'), padding: "12px 14px", borderRadius: "12px", border: `2px solid ${dc('#F1E3C8')}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "17px", fontWeight: 700, color: dc('#2B170A') }}>{item.de}</div>
                <div style={{ fontSize: "17px", color: dc('#2F4F8A'), fontWeight: 700, marginTop: "3px" }}>🇬🇧 {item.en}</div>
                <span style={{ display: "inline-block", marginTop: "6px", fontSize: "13px", backgroundColor: dc('#FFF0C2'), color: dc('#8A5A00'), padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>{item.cat}</span>
              </div>
              <button onClick={() => speakEnglish(item.say || item.en)} aria-label={`Auf Englisch vorlesen: ${item.en}`} className="lt-speak" style={{ flex: "0 0 auto", width: "48px", height: "48px", borderRadius: "50%", border: `2px solid ${dc('#F1E3C8')}`, backgroundColor: dc('#FFFFFF'), fontSize: "20px", cursor: "pointer" }}>🔊</button>
            </div>
          );
        })}
      </div>
      {filteredDictionary.length === 0 && <div style={{ fontSize: "17px", color: dc('#6B4A30'), padding: "12px 0" }}>Nichts gefunden. Versuch ein anderes Wort.</div>}
    </div>
  );
}
