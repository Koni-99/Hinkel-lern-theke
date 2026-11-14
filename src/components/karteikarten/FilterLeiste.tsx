// ═══ Karteikarten: Such- und Filterleiste ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { CATS } from '../../daten/questions';
import { QUICK_TAGS, Profile } from './daten';

export type FilterLeisteProps = {
  questions: any[];
  favorites: number[];
  setFilterMode: Dispatch<SetStateAction<"all" | "fav">>;
  filterMode: "all" | "fav";
  area: "fach" | "produkt";
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setFiltersOpen: Dispatch<SetStateAction<boolean>>;
  filtersOpen: boolean;
  isPhone: boolean;
  activeTag: string | null;
  setActiveTag: Dispatch<SetStateAction<string | null>>;
  displayStyle: "profiles" | "dictionary" | "guides" | "lexicon" | "cards" | "fach" | "pcards";
  setDisplayStyle: Dispatch<SetStateAction<"profiles" | "dictionary" | "guides" | "lexicon" | "cards" | "fach" | "pcards">>;
  filteredProfiles: Profile[];
  filteredCards: any[];
};

export function FilterLeiste({ questions, favorites, setFilterMode, filterMode, area, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, setFiltersOpen, filtersOpen, isPhone, activeTag, setActiveTag, displayStyle, setDisplayStyle, filteredProfiles, filteredCards }: FilterLeisteProps) {
  return (
    <>
          <div
            style={{
              backgroundColor: dc('#ffffff'),
              padding: "18px 20px",
              borderRadius: "18px",
              border: `2px solid ${dc('#F1E3C8')}`,
              boxShadow: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={displayStyle === "dictionary" ? "Deutsch oder englisch suchen, z. B. Nüsse, Rückgeld, Monday" : area === "fach" ? "Fachwissen durchsuchen, z. B. Sauerteig, Gluten, mild …" : "Brotsorte, Zutat oder Allergen suchen …"}
                style={{
                  flex: "1 1 240px",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: `2px solid ${dc('#F1E3C8')}`,
                  backgroundColor: dc('#FFFBF2'),
                  fontSize: "17px",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    backgroundColor: dc('#FCE1D2'),
                    color: dc('#9A3412'),
                    border: "none",
                    borderRadius: "12px",
                    padding: "0 14px",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  ✕ Reset
                </button>
              )}
              {(displayStyle === "lexicon" || displayStyle === "cards") && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: `2px solid ${dc('#F1E3C8')}`,
                      fontSize: "17px",
                      fontWeight: "700",
                      color: dc('#2B170A'),
                      backgroundColor: dc('#FFFBF2'),
                    }}
                  >
                    <option value="Alle">Alle Bereiche ({questions.length})</option>
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    {questions.some((q: any) => q.examGroup) && (
                      <>
                        <option value="Zwischenprüfungen">
                          Zwischenprüfungen ({questions.filter((q: any) => q.examGroup === "ZP").length})
                        </option>
                        <option value="Abschlussprüfungen">
                          Abschlussprüfungen ({questions.filter((q: any) => q.examGroup === "AP").length})
                        </option>
                      </>
                    )}
                  </select>
                )}
            </div>
    
            {/* SCHNELLFILTER-TAGS (auf dem Handy eingeklappt) */}
            {area === "produkt" && isPhone && (
              <button onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} style={{ marginBottom: "10px", minHeight: "42px", padding: "0 14px", borderRadius: "999px", border: `2px solid ${dc('#F1E3C8')}`, backgroundColor: activeTag ? dc('#4B2A14') : dc('#FFFBF2'), color: activeTag ? dc('#FFFFFF') : dc('#6B4A30'), fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                {filtersOpen ? "Filter ▴" : activeTag ? `Filter ▾ · ${(QUICK_TAGS.find((t: any) => t.id === activeTag) || { label: "" }).label}` : "Filter ▾"}
              </button>
            )}
            {area === "produkt" && (!isPhone || filtersOpen) && <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              {QUICK_TAGS.map((tag) => {
                const active = activeTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setActiveTag(active ? null : tag.id);
                      setDisplayStyle("profiles");
                    }}
                    style={{
                      backgroundColor: active ? dc('#4B2A14') : dc('#FFFBF2'),
                      color: active ? dc('#ffffff') : dc('#6B4A30'),
                      border: active ? `1px solid ${dc('#4B2A14')}` : `2px solid ${dc('#F1E3C8')}`,
                      padding: "5px 12px",
                      borderRadius: "999px",
                      fontSize: "15px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>}
    
            {/* ANSICHTS-UMSCHALTER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                borderTop: `2px solid ${dc('#F1E3C8')}`,
                paddingTop: "12px",
              }}
            >
              {displayStyle !== "fach" && displayStyle !== "dictionary" && displayStyle !== "guides" && displayStyle !== "pcards" ? <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setFilterMode("all")}
                  style={{
                    backgroundColor: filterMode === "all" ? dc('#2B170A') : dc('#FFFBF2'),
                    color: filterMode === "all" ? dc('#fff') : dc('#6B4A30'),
                    border: `2px solid ${dc('#F1E3C8')}`,
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Alle
                </button>
                <button
                  onClick={() => setFilterMode("fav")}
                  style={{
                    backgroundColor: filterMode === "fav" ? dc('#2B170A') : dc('#FFFBF2'),
                    color: filterMode === "fav" ? dc('#fff') : dc('#6B4A30'),
                    border: `2px solid ${dc('#F1E3C8')}`,
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Gemerkt ({favorites.length})
                </button>
              </div> : <span />}
    
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(area === "produkt"
                  ? [
                      { id: "profiles", label: `Steckbriefe (${filteredProfiles.length})` },
                      { id: "guides", label: "Schnitt & Allergene" },
                      { id: "pcards", label: "Lernkarten" },
                    ]
                  : [
                      { id: "fach", label: "Wissen kompakt" },
                      { id: "dictionary", label: "Wörterbuch Englisch" },
                      { id: "lexicon", label: `Fragen (${filteredCards.length})` },
                      { id: "cards", label: "Lernkarten" },
                    ]
                ).map((tab) => {
                  const active = displayStyle === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDisplayStyle(tab.id as any)}
                      style={{
                        background: active
                          ? dc('#4B2A14')
                          : dc('#FFFBF2'),
                        color: active ? dc('#ffffff') : dc('#2B170A'),
                        border: active ? "none" : `2px solid ${dc('#F1E3C8')}`,
                        padding: "7px 12px",
                        borderRadius: "10px",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
    </>
  );
}
