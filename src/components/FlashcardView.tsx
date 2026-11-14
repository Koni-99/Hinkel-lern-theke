import React, { useState, useEffect } from "react";
import { dc } from '../daten/data';
import { SHOP_PRODUCTS } from "../daten/shopProducts";
import { CustomProductItem } from "../types";
import type { TippEintrag } from '../hilfen/kollegen';
import { getRightAnswerText } from '../hilfen/allgemein';
import { ProductImages } from '../ui/basis';
import { DICT_ALL, speakGerman, QUICK_TAGS, customProductNumericId, BREAD_TYPES, Profile, FachSection, FACH_SECTIONS, normName } from './karteikarten/daten';
import { SteckbriefDetail } from './karteikarten/SteckbriefDetail';
import { Lernkarten } from './karteikarten/Lernkarten';
import { Fragenkatalog } from './karteikarten/Fragenkatalog';
import { Leitfaeden } from './karteikarten/Leitfaeden';
import { Woerterbuch } from './karteikarten/Woerterbuch';
import { FachKompakt } from './karteikarten/FachKompakt';
import { SteckbriefListe } from './karteikarten/SteckbriefListe';
import { ProduktKarten } from './karteikarten/ProduktKarten';
import { FilterLeiste } from './karteikarten/FilterLeiste';

export function FlashcardView({
  questions,
  customProducts,
  favorites,
  toggleFavorite,
  initialArea = "produkt",
  initialView,
  images = {},
  kollegenTipps = [],
  meineTipps = [],
  onTipp,
  meineNotizen = {},
  onNotiz,
}: {
  meineNotizen?: Record<string, string>;
  onNotiz?: (produkt: string, text: string) => void;
  kollegenTipps?: TippEintrag[];
  meineTipps?: TippEintrag[];
  onTipp?: (produkt: string, text: string) => void;
  initialArea?: "produkt" | "fach";
  initialView?: "dictionary";
  images?: ProductImages;
  questions: any[];
  customProducts: CustomProductItem[];
  favorites: number[];
  toggleFavorite: (id: number) => void;
}) {
  const [filterMode, setFilterMode] = useState<"all" | "fav">("all");
  const [area, setArea] = useState<"produkt" | "fach">(initialArea);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialArea === "fach" ? "Fachwissen" : "Alle");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const isPhone = typeof window !== "undefined" && window.innerWidth < 700;
  const [dictCat, setDictCat] = useState<string>("Alle");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [displayStyle, setDisplayStyle] = useState<
    "profiles" | "dictionary" | "guides" | "lexicon" | "cards" | "fach" | "pcards"
  >(initialView === "dictionary" ? "dictionary" : initialArea === "fach" ? "fach" : "profiles");
  const switchArea = (a: "produkt" | "fach") => {
    setArea(a);
    setDisplayStyle(a === "fach" ? "fach" : "profiles");
    setActiveTag(null);
    setSelectedCategory(a === "fach" ? "Fachwissen" : "Alle");
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [openProfileKey, setOpenProfileKey] = useState<string | null>(null);
  const [pcGroup, setPcGroup] = useState<string>("Alle");
  const [pcIndex, setPcIndex] = useState(0);
  const [pcFlipped, setPcFlipped] = useState(false);
  const [askMode, setAskMode] = useState(false);
  const [pcMode, setPcMode] = useState<"foto" | "name">("foto");
  useEffect(() => {
    if (!askMode) { try { window.speechSynthesis?.cancel(); } catch { /* egal */ } return; }
    const t = window.setTimeout(() => {
      const face = document.querySelector('[role="button"][aria-label*="Karte"] > div[aria-hidden="false"]') as HTMLElement | null;
      if (face) speakGerman(face.innerText || '');
    }, 650);
    return () => window.clearTimeout(t);
  }, [askMode, pcFlipped, pcIndex, pcMode, flipped, currentIndex]);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* egal */ } }, []);
  const [pcOrder, setPcOrder] = useState<string[]>([]);

  // Steckbrief-Detail mit der Esc-Taste schließen
  useEffect(() => {
    if (!openProfileKey) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenProfileKey(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openProfileKey]);

  const productProfiles = React.useMemo(() => {
    const sortimentQs = questions.filter((q) => q.id >= 82 && q.id <= 297);
    const profilesMap = new Map<string, Profile>();

    sortimentQs.forEach((q) => {
      const match = q.question.match(/'([^']+)'/);
      let prodName = match ? match[1] : "";
      if (!prodName) {
        if (q.id >= 196 && q.id <= 198) prodName = "Toastbrot";
        else if (q.id >= 214 && q.id <= 216) prodName = "Mürbestuten";
        else if (q.id >= 240 && q.id <= 242) prodName = "Mohnbrötchen";
        else if (q.id >= 243 && q.id <= 245) prodName = "Sesambrötchen";
        else prodName = `Produkt #${q.id}`;
      }

      let group = "Brötchen & Feingebäck";
      let slice = "";
      if (q.id >= 82 && q.id <= 87) {
        group = "Roggenvollkornbrot";
        slice = "9 mm";
      } else if (q.id >= 88 && q.id <= 108) {
        group = "Vollkornschwarzbrot";
        slice = "5,5 mm";
      } else if (q.id >= 109 && q.id <= 168) {
        group = "Roggen & Roggenmischbrot";
        slice = "9 mm";
      } else if (q.id >= 169 && q.id <= 177) {
        group = "Weizenmischbrot";
        slice = "9 mm";
      } else if (q.id >= 178 && q.id <= 204) {
        group = "Weizenbrot & Baguette";
        slice = "12 mm";
      } else if (q.id >= 205 && q.id <= 221) {
        group = "Süße Stuten & Brioche";
        slice = "12 mm";
      } else if (q.id >= 222 && q.id <= 227) {
        group = "Alternative Getreide / Spezial";
        slice = "9 mm";
      }

      if (!profilesMap.has(prodName)) {
        profilesMap.set(prodName, {
          name: prodName,
          group,
          slice,
          facts: [],
          ids: [],
        });
      }
      const entry = profilesMap.get(prodName)!;
      entry.ids.push(q.id);
      const ans = getRightAnswerText(q);
      if (!entry.facts.includes(ans)) entry.facts.push(ans);
    });

    const baseArr = Array.from(profilesMap.values());
    const customFormatted: Profile[] = customProducts
      .filter((cp) => cp.targetArea === "profile")
      .map((cp) => ({
        name: cp.name,
        group: cp.group,
        slice: cp.slice,
        facts: [cp.info],
        ids: [customProductNumericId(cp.id)],
      }));

    // Jeder Shop-Artikel bekommt genau EINEN Steckbrief. Ältere Steckbriefe aus den Quizfragen
    // (auch Schreibvarianten wie „Reine Roggen“ / „Reines Roggen“) werden daran angehängt und nicht doppelt gezeigt.
    const stem = (n: string) => normName(n).replace(/s$/, "");
    const usedBase = new Set<Profile>();
    const shopProfiles: Profile[] = SHOP_PRODUCTS.map((sp) => {
      const keys = [sp.name, ...(sp.aliases || [])].map(stem);
      const hits = baseArr.filter((b) => keys.includes(stem(b.name)));
      hits.forEach((h) => usedBase.add(h));
      const typeInfo = sp.breadType ? BREAD_TYPES[sp.breadType] : null;
      return {
        name: sp.name,
        group: typeInfo ? typeInfo.group : hits[0]?.group || sp.group,
        slice: sp.name === "Wunderzopf" ? "wird nicht geschnitten" : typeInfo ? typeInfo.slice : "",
        facts: [],
        ids:
          hits.length > 0
            ? hits.flatMap((h) => h.ids)
            : [customProductNumericId("shop_" + sp.name) + 1000000],
        shop: sp,
      };
    });
    const leftoverBase = baseArr.filter((b) => !usedBase.has(b));

    return [...customFormatted, ...shopProfiles, ...leftoverBase];
  }, [questions, customProducts]);

  const filteredProfiles = productProfiles.filter((p) => {
    if (filterMode === "fav" && !favorites.includes(p.ids[0])) return false;
    if (activeTag) {
      const tag = QUICK_TAGS.find((t) => t.id === activeTag);
      if (tag && !tag.test(p)) return false;
    }
    if (searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.group.toLowerCase().includes(term) ||
        p.facts.some((f) => f.toLowerCase().includes(term)) ||
        (!!p.shop &&
          [
            p.shop.description,
            p.shop.shortIngredients,
            p.shop.fullIngredients,
            p.shop.allergens.join(" "),
          ].some((t) => t.toLowerCase().includes(term)))
      );
    }
    return true;
  });

  // ── Produkt-Lernkarten ──
  const cardProducts = productProfiles.filter((p) => !!p.shop);
  const pcGroups = Array.from(new Set<string>(cardProducts.map((p) => String(p.group)))).sort((a, b) => a.localeCompare(b, "de"));
  const pcPool = cardProducts.filter((p) => (pcGroup === "Alle" || p.group === pcGroup) && (!searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())));
  const pcOrdered = pcOrder.length ? pcOrder.map((k) => pcPool.find((p) => p.name === k)).filter((p): p is Profile => !!p) : pcPool;
  const pcList = pcOrdered.length === pcPool.length ? pcOrdered : pcPool;
  const pcCurrent = pcList.length ? pcList[Math.min(pcIndex, pcList.length - 1)] : null;
  const pcGo = (delta: number) => { setPcFlipped(false); setPcIndex((i) => (pcList.length ? (Math.min(i, pcList.length - 1) + delta + pcList.length) % pcList.length : 0)); };
  const pcShuffle = () => { const names = pcPool.map((p) => p.name); for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; } setPcOrder(names); setPcIndex(0); setPcFlipped(false); };

  const filteredDictionary = DICT_ALL.filter((d) => {
    if (dictCat !== "Alle" && d.cat !== dictCat) return false;
    if (searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase();
      return d.de.toLowerCase().includes(term) || d.en.toLowerCase().includes(term) || d.cat.toLowerCase().includes(term);
    }
    return true;
  });
  const dictLetterOf = (t: string) => { const c = t.charAt(0).toUpperCase(); return /[A-ZÄÖÜ]/.test(c) ? c : '#'; };
  const dictLetters = Array.from(new Set(filteredDictionary.map(d => dictLetterOf(d.de)))).sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'de')));

  const fachTerm = searchQuery.trim().toLowerCase();
  const filteredFach: FachSection[] = FACH_SECTIONS.map((sec) => {
    if (!fachTerm || sec.title.toLowerCase().includes(fachTerm)) return sec;
    const items = sec.items.filter((it) => (it.term || "").toLowerCase().includes(fachTerm) || it.text.toLowerCase().includes(fachTerm));
    const colHit = !!sec.columns && sec.columns.some((c) => c.breads.some((b) => b.toLowerCase().includes(fachTerm)));
    if (!items.length && !colHit) return null;
    return { ...sec, items };
  }).filter((x): x is FachSection => x !== null);

  const filteredCards = questions.filter((q) => {
    if (filterMode === "fav" && !favorites.includes(q.id)) return false;
    if (selectedCategory === "Zwischenprüfungen" && q.examGroup !== "ZP")
      return false;
    if (selectedCategory === "Abschlussprüfungen" && q.examGroup !== "AP")
      return false;
    if (
      selectedCategory !== "Alle" &&
      selectedCategory !== "Zwischenprüfungen" &&
      selectedCategory !== "Abschlussprüfungen" &&
      q.category !== selectedCategory
    )
      return false;
    if (searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase();
      const rightAns = getRightAnswerText(q).toLowerCase();
      return (
        q.question.toLowerCase().includes(term) ||
        q.explanation.toLowerCase().includes(term) ||
        rightAns.includes(term)
      );
    }
    return true;
  });

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
  }, [filterMode, selectedCategory, searchQuery]);

  const current = filteredCards[currentIndex];
  const openProfile = openProfileKey ? productProfiles.find((p) => `${p.name}_${p.ids[0]}` === openProfileKey) || null : null;
  const isFav = current ? favorites.includes(current.id) : false;

  return (
    <div
      className="lt-themed fc-root"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
      }}
    >
      <style>{`
        .fc-flip-in { animation: fcIn .35s cubic-bezier(.2,.8,.2,1); }
        @keyframes fcIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
        .fc-overlay { animation: ltFade .2s ease; }
        .fc-sheet { animation: ltSheet .32s cubic-bezier(.2,.8,.2,1); }
        @keyframes ltFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ltSheet { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: none; } }
        .fc-item { animation: fcItem .38s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes fcItem { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .fc-flip-in, .fc-overlay, .fc-sheet, .fc-item { animation: none !important; } }
        @media (max-width: 700px) {
          .fc-overlay { padding: 0 !important; align-items: flex-end !important; }
          .fc-sheet { max-height: 94vh !important; border-radius: 28px 28px 0 0 !important; }
          .fc-grid { grid-template-columns: 1fr !important; }
          .fc-area { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* BEREICHS-UMSCHALTER: PRODUKTKENNTNIS / FACHWISSEN */}
      <div className="fc-area" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
        {([
          { id: "produkt", title: "Produktkenntnis", sub: "Steckbriefe, Zutaten, Allergene" },
          { id: "fach", title: "Fachwissen", sub: "Geschmack, Sauerteig, Mehl & mehr" },
        ] as const).map((a) => {
          const on = area === a.id;
          return (
            <button
              key={a.id}
              onClick={() => switchArea(a.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "3px",
                padding: "14px 18px", borderRadius: "18px", cursor: "pointer", textAlign: "left",
                border: on ? `2px solid ${dc('#4B2A14')}` : `2px solid ${dc('#F1E3C8')}`,
                backgroundColor: on ? dc('#4B2A14') : dc('#FFFFFF'),
                color: on ? dc('#FFFFFF') : dc('#2B170A'),
              }}
            >
              <span style={{ fontSize: "20px", fontWeight: 800 }}>{a.title}</span>
              <span style={{ fontSize: "15px", opacity: on ? 0.85 : 1, color: on ? dc('#FFE7A3') : dc('#6B4A30') }}>{a.sub}</span>
            </button>
          );
        })}
      </div>
      {/* SUCH- & FILTERLEISTE IM MODERNEN CARD-LOOK */}
      <FilterLeiste {...{ questions, favorites, setFilterMode, filterMode, area, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, setFiltersOpen, filtersOpen, isPhone, activeTag, setActiveTag, displayStyle, setDisplayStyle, filteredProfiles, filteredCards }} />

      {/* 0. FACHWISSEN KOMPAKT (aus der Verkaufsmappe) */}
      {displayStyle === "pcards" ? (
        /* PRODUKT-LERNKARTEN: Foto/Name vorne, alle Infos hinten */
        <ProduktKarten {...{ images, pcGroup, setPcGroup, setPcIndex, pcIndex, setPcFlipped, pcFlipped, setAskMode, askMode, pcMode, setPcMode, setPcOrder, cardProducts, pcGroups, pcList, pcCurrent, pcGo, pcShuffle }} />
      ) : displayStyle === "fach" ? (
        <FachKompakt {...{ searchQuery, fachTerm, filteredFach }} />
      ) : displayStyle === "dictionary" ? (
        <Woerterbuch {...{ dictCat, setDictCat, filteredDictionary, dictLetterOf, dictLetters }} />
      ) : displayStyle === "guides" ? (
        /* 2. SCHNITTSTÄRKEN & VOLLSTÄNDIGER ALLERGEN-CHECK */
        <Leitfaeden {...{  }} />
      ) : displayStyle === "profiles" ? (
        /* 3. PRODUKT-STECKBRIEFE, kompakte Liste, Details als Karte zum Aufklappen */
        <SteckbriefListe {...{ favorites, images, setOpenProfileKey, filteredProfiles }} />
      ) : displayStyle === "lexicon" ? (
        /* 4. FRAGEN-KATALOG */
        <Fragenkatalog {...{ favorites, toggleFavorite, filteredCards }} />
      ) : /* 5. INTERAKTIVE LERNKARTEN */
      !current ? (
        <div
          style={{
            backgroundColor: dc('#ffffff'),
            padding: "30px",
            borderRadius: "18px",
            border: `2px solid ${dc('#F1E3C8')}`,
            textAlign: "center",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <p style={{ color: dc('#6B4A30'), fontSize: "18px", margin: 0 }}>
            {filterMode === "fav"
              ? "Du hast noch keine Karten mit ★ gemerkt."
              : "Keine passende Lernkarte gefunden."}
          </p>
        </div>
      ) : (
        <Lernkarten {...{ toggleFavorite, currentIndex, setCurrentIndex, flipped, setFlipped, setAskMode, askMode, filteredCards, current, isFav }} />
      )}

      {/* ── Steckbrief-Detail ── */}
      {openProfile && <SteckbriefDetail {...{ favorites, toggleFavorite, images, setOpenProfileKey, filteredProfiles, openProfile, kollegenTipps, meineTipps, onTipp, meineNotizen, onNotiz }} />}
    </div>
  );
}
