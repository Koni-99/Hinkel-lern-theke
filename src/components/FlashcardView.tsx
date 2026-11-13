import React, { useState, useEffect } from "react";
import { dc, BAKERY_DICTIONARY, DICTIONARY_EXTRA } from '../daten/data';
import { CATS } from "../daten/questions";
import { SHOP_PRODUCTS, ShopProduct } from "../daten/shopProducts";
import { CustomProductItem } from "../types";
import { getRightAnswerText } from '../hilfen/allgemein';
import { TH, cardStyle, productImageKey, ProductImages } from '../ui/basis';
import { ReportContext } from '../ui/melden';
import { SpeakButton } from '../games/spielBasis';

// ───────── Englisch-Wörterbuch: Produkte automatisch aus dem Sortiment ─────────
const EN_BREAD: Record<string, string> = { schwarzbrot: "dark wholegrain rye bread", roggen: "rye bread", roggenmisch: "rye bread with some wheat", weizenmisch: "wheat bread with some rye", weizen: "light wheat bread", stuten: "sweet milk loaf", dinkel: "spelt bread", spezial: "special bread" };
const EN_GROUP: Record<string, string> = { "Brot": "bread", "Brötchen": "bread roll", "Kleingebäck": "small savoury bake", "Feingebäck": "sweet pastry", "Kuchen": "cake", "Stuten & Brioche": "sweet loaf", "Weihnachtsgebäck": "Christmas treat", "Saisongebäck": "seasonal pastry", "Herzhafte Snacks": "savoury snack", "Backmischung": "baking mix", "Sonstiges": "bakery product" };
const EN_WORDS: [RegExp, string][] = [[/walnu/i, "walnuts"], [/haselnu/i, "hazelnuts"], [/mandel/i, "almonds"], [/pistazie/i, "pistachios"], [/sonnenblumen/i, "sunflower seeds"], [/kürbiskern/i, "pumpkin seeds"], [/leinsa/i, "linseed"], [/chia/i, "chia seeds"], [/sesam/i, "sesame"], [/mohn/i, "poppy seeds"], [/kümmel/i, "caraway"], [/rosine/i, "raisins"], [/cranberr/i, "cranberries"], [/marzipan/i, "marzipan"], [/zimt/i, "cinnamon"], [/honig/i, "honey"], [/schoko|kuvertüre|kakao/i, "chocolate"], [/quark/i, "quark"], [/käse|gouda/i, "cheese"], [/zwiebel/i, "onion"], [/olive/i, "olives"], [/tomate/i, "tomatoes"], [/speck|schinken/i, "bacon"], [/spinat/i, "spinach"], [/senf/i, "mustard"], [/peperoni|chili/i, "chili"], [/apfel/i, "apple"], [/himbeer/i, "raspberries"], [/kirsch/i, "cherries"], [/kokos/i, "coconut"], [/pudding/i, "custard"], [/hafer/i, "oats"], [/buchweizen/i, "buckwheat"], [/kartoffel/i, "potato"], [/lakritz/i, "liquorice"], [/ananas/i, "pineapple"], [/butter/i, "butter"]];
function productEnglish(p: ShopProduct): string {
  const base = p.breadType ? EN_BREAD[p.breadType] : EN_GROUP[p.group] || "bakery product";
  const src = `${p.name} ${p.shortIngredients || ""}`;
  const extras: string[] = [];
  EN_WORDS.forEach(([re, w]) => { if (re.test(src) && !extras.includes(w) && extras.length < 3 && !base.includes(w)) extras.push(w); });
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}${extras.length ? ` with ${extras.length > 1 ? `${extras.slice(0, -1).join(", ")} and ${extras[extras.length - 1]}` : extras[0]}` : ""}${p.vegan ? " (vegan)" : ""}`;
}
const DICT_ALL: { de: string; en: string; cat: string; say?: string }[] = (() => {
  const seen = new Set<string>(); const out: { de: string; en: string; cat: string; say?: string }[] = [];
  const add = (e: { de: string; en: string; cat: string; say?: string }) => { const k = e.de.toLowerCase(); if (seen.has(k)) return; seen.add(k); out.push(e); };
  const CAT_MAP: Record<string, string> = { "Spezialbrot": "Brot & Mehl", "Brot & Getreide": "Brot & Mehl", "Mehlarten": "Brot & Mehl", "Feingebäck": "Brötchen & Gebäck", "Brötchen": "Brötchen & Gebäck", "Brötchen & Süßes": "Brötchen & Gebäck", "Stuten & Süßes": "Brötchen & Gebäck" };
  [...BAKERY_DICTIONARY, ...DICTIONARY_EXTRA].forEach(e => add({ ...e, cat: CAT_MAP[e.cat] || e.cat }));
  SHOP_PRODUCTS.filter(p => !["Sonstiges"].includes(p.group)).forEach(p => add({ de: p.name, en: `${p.name}: ${productEnglish(p)}`, cat: "Unsere Produkte", say: `This is ${p.name}, a ${productEnglish(p).toLowerCase().replace(" (vegan)", ", it is vegan")}.` }));
  return out.sort((a, b) => a.de.localeCompare(b.de, "de"));
})();
const DICT_ORDER = ["Bedienung", "Unsere Produkte", "Allergene", "Fachbegriffe", "Zutaten & Teig", "Brot & Mehl", "Brötchen & Gebäck", "Tage & Zeiten"];
const DICT_CATS = ["Alle", ...Array.from(new Set(DICT_ALL.map(d => d.cat))).sort((a, b) => { const r = (x: string) => { const i = DICT_ORDER.indexOf(x); return i < 0 ? 99 : i; }; return r(a) - r(b); })];
let deVoice: SpeechSynthesisVoice | null = null;
/** Deutsch vorlesen (für „Frag mich ab“) */
function speakGerman(text: string) {
  try {
    const synth = window.speechSynthesis; if (!synth) return;
    synth.cancel();
    if (!deVoice) { const vs = synth.getVoices().filter(v => /^de/i.test(v.lang)); deVoice = vs.find(v => /google|natural|premium|anna|katja/i.test(v.name)) || vs[0] || null; }
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ').replace(/\s+/g, ' ').trim());
    u.lang = deVoice ? deVoice.lang : 'de-DE'; if (deVoice) u.voice = deVoice; u.rate = 0.95;
    synth.speak(u);
  } catch { /* ohne Sprachausgabe */ }
}
let enVoice: SpeechSynthesisVoice | null = null;
function speakEnglish(text: string) {
  try {
    const synth = window.speechSynthesis; if (!synth) return;
    synth.cancel();
    if (!enVoice) {
      const vs = synth.getVoices().filter(v => /^en(-|_)?(gb|us)?/i.test(v.lang));
      enVoice = vs.find(v => /en.?gb/i.test(v.lang) && /google|natural|premium|daniel|serena/i.test(v.name)) || vs.find(v => /en.?gb/i.test(v.lang)) || vs[0] || null;
    }
    const u = new SpeechSynthesisUtterance(text.replace(/…/g, ", "));
    u.lang = enVoice ? enVoice.lang : "en-GB"; if (enVoice) u.voice = enVoice; u.rate = 0.95;
    synth.speak(u);
  } catch { /* ohne Sprachausgabe */ }
}

/** Schnellfilter für die Steckbriefe, jeder Filter prüft die echten Produktdaten (Zutaten, Allergene, Brotsorte). */
type TagProduct = { group: string; shop?: ShopProduct };
const ing = (p: TagProduct) => (p.shop?.fullIngredients || "").toLowerCase();
const QUICK_TAGS: {
  id: string;
  label: string;
  test: (p: TagProduct) => boolean;
}[] = [
  {
    id: "glutenfrei",
    label: "🌾 Glutenfreie Rezeptur",
    test: (p) =>
      !!p.shop &&
      (p.shop.name === "Buchweizenbrot" ||
        !p.shop.allergens.some((a) => /^gluten|weizen|roggen|hafer|dinkel|gerste/i.test(a))),
  },
  {
    id: "ohnehefe",
    label: "🚫 Brot ohne Hefe",
    test: (p) =>
      !!p.shop &&
      (!!p.shop.breadType ||
        p.shop.group === "Brötchen" ||
        ["Knäckebrot", "Backmischung Abendschnitte"].includes(p.shop.name)) &&
      !ing(p).startsWith("vollständige") &&
      !ing(p).includes("hefe"),
  },
  {
    id: "quark",
    label: "🥣 Quark im Teig",
    test: (p) => ing(p).includes("quark"),
  },
  {
    id: "pikant",
    label: "🌶️ Pikant & Käse",
    test: (p) =>
      /gouda|feta|käse|peperoni|chili|speck|schinken|oliven/.test(ing(p)),
  },
  {
    id: "nuss",
    label: "🌰 Nüsse & Mandeln",
    test: (p) =>
      !!p.shop &&
      p.shop.allergens.some((a) => /^schalenfrüchte|mandel|pistazie|haselnu|walnu/i.test(a)),
  },
  {
    id: "stuten",
    label: "🍯 Brioche & Stuten",
    test: (p) => p.shop?.breadType === "stuten",
  },
  { id: "vegan", label: "🌱 Vegan", test: (p) => !!p.shop?.vegan },
];

/** Eigene Artikel brauchen eine eigene Zahl als „Merken“-Schlüssel, sonst würde ein Stern alle eigenen Artikel markieren. */
function customProductNumericId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) % 1000000007;
  return 1000000 + hash;
}

/**
 * Emoji für die Steckbriefe:
 * 🍞 alle Brote · 🍪 alle Kekse & Dauergebäck · 🍰 alle Kuchen.
 * Alles andere (Brötchen, Feingebäck, Snacks …) bekommt ein passendes eigenes Emoji.
 */
const BREAD_GROUPS = [
  "brot",
  "stuten",
  "brioche",
  "baguette",
  "alternative getreide",
];
const COOKIE_NAMES = [
  "printe",
  "spekulatius",
  "zimtstern",
  "spitzkuchen",
  "mandelsplitter",
  "cookie",
  "keks",
  "makronen",
];

const OTHER_RULES: [string[], string][] = [
  [["croissant"], "🥐"],
  [["brezel", "laugen"], "🥨"],
  [["berliner", "krapfen", "quarkbällchen", "apfelring"], "🍩"],
  [
    [
      "schnecke",
      "schleife",
      "tasche",
      "schweineohr",
      "bärentatze",
      "mürbchen",
      "monte christo",
      "striezel",
      "tarte",
      "weckmann",
    ],
    "🥐",
  ],
  [["speck", "spinat", "mambolito", "spuntino", "vesper"], "🥪"],
  [["granola"], "🥣"],
  [["paniermehl"], "🥄"],
  [["backmischung"], "📦"],
];


/** Farbe je Produktgruppe (Streifen an Karten) */
function groupColor(g: string): string {
  const x = (g || '').toLowerCase();
  if (x.includes('brötchen')) return '#E0A800';
  if (x.includes('kleingebäck')) return '#E07B00';
  if (x.includes('feingebäck')) return '#D9668A';
  if (x.includes('kuchen')) return '#B8426B';
  if (x.includes('stuten') || x.includes('brioche')) return '#E8A15A';
  if (x.includes('weihnacht') || x.includes('saison')) return '#2F7D4A';
  if (x.includes('snack') || x.includes('herzhaft')) return '#5B8C3A';
  if (x.includes('sonstig') || x.includes('backmischung')) return '#9C8C7A';
  return '#8B5A2B';
}
function getProductEmoji(name: string, group: string): string {
  const n = name.toLowerCase();
  const g = group.toLowerCase();
  if (n.includes("stollen")) return "🍰";
  if (g.includes("kleingebäck") || COOKIE_NAMES.some((k) => n.includes(k)))
    return "🍪";
  if (g.includes("kuchen") || n.includes("kuchen") || n.includes("düsselwelle"))
    return "🍰";
  if (n.includes("knäckebrot") || n.includes("abendschnitte")) return "🍞";
  if (!g.includes("brötchen") && BREAD_GROUPS.some((k) => g.includes(k)))
    return "🍞";
  for (const [keys, emoji] of OTHER_RULES) {
    if (keys.some((k) => n.includes(k))) return emoji;
  }
  if (g.includes("weihnacht")) return "🍪";
  if (g.includes("brötchen")) return "🥯";
  if (g.includes("feingebäck")) return "🥐";
  if (g.includes("snack")) return "🥪";
  return "🍞";
}

const BREAD_TYPES: Record<
  NonNullable<ShopProduct["breadType"]>,
  { group: string; slice: string }
> = {
  schwarzbrot: { group: "Vollkornschwarzbrot", slice: "5,5 mm" },
  roggen: { group: "Roggenbrot", slice: "9 mm" },
  roggenmisch: { group: "Roggenmischbrot", slice: "9 mm" },
  weizenmisch: { group: "Weizenmischbrot", slice: "9 mm" },
  dinkel: { group: "Dinkelbrot", slice: "9 mm" },
  spezial: { group: "Spezialbrot", slice: "9 mm" },
  weizen: { group: "Weizenbrot", slice: "12 mm" },
  stuten: { group: "Stuten & Brioche", slice: "12 mm" },
};

type Profile = {
  name: string;
  group: string;
  slice: string;
  facts: string[];
  ids: number[];
  shop?: ShopProduct;
};

/** Fachwissen aus der Verkaufsmappe, für den Spickzettel-Bereich „Fachwissen“ */
type FachItem = { term?: string; text: string };
type FachSection = { id: string; icon: string; title: string; intro?: string; items: FachItem[]; columns?: { title: string; breads: string[] }[] };
const FACH_SECTIONS: FachSection[] = [
  {
    id: "geschmack", icon: "👅", title: "Geschmacksvokabeln",
    intro: "So beschreiben wir den Geschmack im Verkaufsgespräch.",
    items: [
      { term: "Mild", text: "angenehm mild und bekömmlich, z. B. Münsterländer, Schweizer, Feinbrot" },
      { term: "Aromatisch", text: "fein bis dezent, oft mit nussiger oder fruchtiger Note" },
      { term: "Würzig", text: "dezent bis intensiv, oft mit nussiger oder fruchtiger Note" },
      { term: "Pikant", text: "pikant, würzig, herb" },
      { term: "Kräftig", text: "herb, vollmundig, würzig oder zart schmelzend" },
    ],
    columns: [
      { title: "Mild", breads: ["Walnuss-Brot", "Toastbrot", "Dinkeltraum", "Dinkel-Sprösschen", "Münsterländer", "Schweizer", "Feinbrot", "Oberländer", "Campaillette", "Französisches Landbrot", "Französische Landbrotstange"] },
      { title: "Aromatisch", breads: ["Walnuss-Brot", "Vinschgauer", "Mehrkornbrot", "Dinkeltraum", "Dinkel-Sprösschen", "Chia-Brot", "Abendschnitte", "Elsässer", "Landbaguette", "Weinstock", "Schwarzwälder", "Oberländer", "Müslibrot", "Holzkohlebrot", "Sonnenblumenbrot"] },
      { title: "Würzig", breads: ["Walnuss-Brot", "Vinschgauer", "Senfkruste", "Kümmelstange", "Innsbrucker Roggenlaib", "Zwiebelstange", "Feuriges", "Harzer Nuss-Stange", "Harzer", "Sonnenblumenbrot", "Olivenstange", "Zeusstange", "Casanova"] },
      { title: "Pikant", breads: ["Feuriges", "Olivenstange", "Zeusstange"] },
      { title: "Kräftig", breads: ["Vinschgauer", "Sternchen", "Senfkruste", "Reines Roggen", "Mehrkornbrot", "Kümmelstange", "Kartäuser", "Innsbrucker Roggenlaib", "Chia-Brot", "Buchweizenbrot", "Spezialbrot", "Schlesisches Bauernbrot", "Elsässer", "Schwarzwälder", "Harzer Nuss-Stange", "Harzer Brot", "Sonnenblumenbrot", "Schwarzbrot"] },
    ],
  },
  {
    id: "sonderverkauf", icon: "🤝", title: "Sonderverkauf",
    items: [
      { text: "Ist ein Produkt, das ein Kunde wünscht, nicht mehr da, verkaufen wir ein ähnliches Produkt." },
      { text: "Dabei orientieren wir uns an der Geschmackstabelle: z. B. Münsterländer aus → Schweizer (beide mild)." },
    ],
  },
  {
    id: "begriffe", icon: "📚", title: "Fachbegriffe",
    items: [
      { term: "Kruste", text: "die Gebäckoberfläche" },
      { term: "Krume", text: "das Innere der Gebäcke, unterhalb der Kruste" },
      { term: "Ausbund", text: "Rissbildung an der Gebäckoberfläche" },
      { term: "Porung", text: "die vielen kleinen Hohlräume in der Krume" },
    ],
  },
  {
    id: "frische", icon: "🍞", title: "Frischhaltung & Aufbacken",
    items: [
      { term: "Lagern", text: "bei Raumtemperatur in einer Brotdose mit Luftlöchern, so kann Feuchtigkeit entweichen" },
      { term: "Kühlschrank", text: "Kunden davon abraten, Brot schimmelt dort schneller" },
      { term: "Einfrieren", text: "luftdicht und scheibenweise" },
      { term: "Aufbacken", text: "Baguette, Brötchen und Brote leicht mit Wasser befeuchten, bei 100 °C für 10–15 Minuten in den Ofen" },
    ],
  },
  {
    id: "mehl", icon: "🌾", title: "Mehl, Schrot & Gluten",
    items: [
      { term: "Mehlarten", text: "Weizen-, Roggen- und Dinkelmehl" },
      { term: "Mehl (Auszugsmehl)", text: "fein gemahlen, ohne Schalenteile und ohne Keimling" },
      { term: "Vollkornmehl", text: "das ganze Korn inklusive Schale und Keimling, reich an Ballaststoffen, Vitaminen und Mineralstoffen" },
      { term: "Schrot", text: "grob zerkleinertes ganzes Korn ohne Keimling, hält länger frisch, hat aber weniger Vitamine und Ballaststoffe als Vollkornmehl" },
      { term: "Gluten", text: "Eiweißkleber, sorgt beim Backen für Elastizität und Volumen, steckt in Weizen-, Roggen- und Dinkelmehl" },
      { term: "Glutenfrei?", text: "Buchweizenbrot ist von der Rezeptur her glutenfrei, kann aber durch Mehlstaub in der Backstube Spuren von Roggen und Weizen enthalten (gebacken Di. und Do.)" },
    ],
  },
  {
    id: "sauerteig", icon: "🫙", title: "Sauerteig",
    items: [
      { term: "Was passiert?", text: "Ein Teil des Mehls wird gesäuert, dabei entstehen Milch- und Essigsäuren" },
      { term: "Vorteile", text: "aromatischer Geschmack und längere Frische" },
      { term: "Ohne Hefe", text: "Sauerteig bildet natürliche Hefen, manche Brote brauchen keine zusätzliche Hefe (z. B. Reines Roggen)" },
      { term: "Irrglaube", text: "„Sauerteig schmeckt bitter“, mit viel Wasser bilden sich milde Milchsäurebakterien, das Brot schmeckt mild" },
      { term: "Unsere Sauerteige", text: "Roggen-, Dinkel-, Weizen- und Buchweizensauerteig" },
      { term: "Roggenbrot", text: "muss mit Sauerteig gebacken werden: Roggenmehl enthält Enzyme, die die Stärke abbauen, der Sauerteig hemmt sie, sonst entsteht keine stabile Brotstruktur" },
    ],
  },
  {
    id: "schnitt", icon: "🔪", title: "Schnittgrößen",
    items: [
      { term: "5,5 mm", text: "Schwarzbrote" },
      { term: "9 mm", text: "Roggenmisch & Dinkel (auch Roggen- und Weizenmischbrote)" },
      { term: "12 mm", text: "Stuten & Weizenbrote" },
    ],
  },
  {
    id: "gutzuwissen", icon: "💛", title: "Gut zu wissen",
    items: [
      { term: "Brot vom Vortag", text: "Obdachlose und Bedürftige bekommen es bei uns umsonst, die Kiste steht auf der kleinen Seite unter der Theke" },
      { term: "Kinder", text: "bekommen bei uns ein kleines Mürbchen geschenkt, ein Lächeln gibt es gratis dazu!" },
    ],
  },
  {
    id: "geschichte", icon: "🏛️", title: "Unsere Geschichte",
    items: [
      { term: "1891", text: "Jean Hinkel legt den Grundstein, Backstube auf der Gladbacher Straße" },
      { term: "1928", text: "Johannes Hinkel gründet die Bäckerei am Burgplatz in der Altstadt" },
      { term: "1944", text: "die Backstube wird im Krieg durch eine Bombe zerstört, und wieder aufgebaut" },
      { term: "1956", text: "Karl Josef Hinkel übernimmt die Notbackstube auf der Mittelstraße, heute unser großes Geschäft" },
      { term: "1965", text: "die Produktion zieht auf die Hohe Straße, dort wird bis heute gebacken" },
      { term: "1988", text: "Josef Hinkel übernimmt und vergrößert Backstube und Geschäfte" },
      { term: "2022", text: "Sophie Hinkel übernimmt die Traditionsbäckerei ihres Vaters Josef in der 5. Generation" },
    ],
  },
  {
    id: "geschaefte", icon: "📍", title: "Unsere Geschäfte",
    items: [
      { term: "Hohe Straße", text: "Hohe Str. 31, Carlstadt · Tel. 0211 86 20 34 13 · Mo–Fr 6–18 Uhr, Sa 6–16 Uhr" },
      { term: "Mittelstraße", text: "Mittelstraße 25, Altstadt · Tel. 0211 86 20 34 21 · Mo–Fr 7–18:30 Uhr, Sa 6–16 Uhr" },
      { term: "Verkaufswagen", text: "Dienstag 8-13 Uhr Oberkassel, Mittwoch 8-11 Uhr AOK am Flughafen, Donnerstag 8-13 Uhr Gerresheim" },
    ],
  },
  {
    id: "mitarbeiter", icon: "🧾", title: "Für Mitarbeiter",
    items: [
      { term: "Krankmeldung", text: "so früh wie möglich telefonisch oder per WhatsApp bei Frau Azhari (Personalleitung) und in deiner Filiale" },
      { term: "Urlaub", text: "Urlaubsanträge bei Frau Azhari einreichen, Formular nach den Betriebsferien oder bei der Filialleitung" },
      { term: "Kleidung", text: "ordentliche Kleidung unter der Arbeitskleidung, keine Jogginghose, festes Schuhwerk (keine offenen Schuhe)" },
      { term: "Haare & Nägel", text: "Haare zum Dutt oder ordentlich frisiert; kein Nagellack, keine künstlichen Nägel, Nägel kurz und sauber" },
      { term: "Gesundheit", text: "vor dem Start Gesundheits-/Hygienebelehrung (Erstbelehrung online möglich) und Gesundheitszeugnis vorlegen, Kosten nur mit Quittung erstattet" },
      { term: "Schulung", text: "jährliche, gesetzlich vorgeschriebene Unterweisung in Hygiene und Arbeitssicherheit" },
    ],
  },
];

const normName = (n: string) => n.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");

export function FlashcardView({
  questions,
  customProducts,
  favorites,
  toggleFavorite,
  initialArea = "produkt",
  initialView,
  images = {},
}: {
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
          { id: "produkt", title: "🥖 Produktkenntnis", sub: "Steckbriefe, Zutaten, Allergene" },
          { id: "fach", title: "📚 Fachwissen", sub: "Geschmack, Sauerteig, Mehl & mehr" },
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
            placeholder={displayStyle === "dictionary" ? "🔍 Deutsch oder englisch suchen, z. B. Nüsse, Rückgeld, Monday" : area === "fach" ? "🔍 Fachwissen durchsuchen, z. B. Sauerteig, Gluten, mild …" : "🔍 Brotsorte, Zutat oder Allergen suchen …"}
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
                      🎓 Zwischenprüfungen ({questions.filter((q: any) => q.examGroup === "ZP").length})
                    </option>
                    <option value="Abschlussprüfungen">
                      🏆 Abschlussprüfungen ({questions.filter((q: any) => q.examGroup === "AP").length})
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
              ⭐ Gemerkt ({favorites.length})
            </button>
          </div> : <span />}

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(area === "produkt"
              ? [
                  { id: "profiles", label: `🥖 Steckbriefe (${filteredProfiles.length})` },
                  { id: "guides", label: "🔪 Schnitt & Allergene" },
                  { id: "pcards", label: "📇 Lernkarten" },
                ]
              : [
                  { id: "fach", label: "📚 Wissen kompakt" },
                  { id: "dictionary", label: "📖 Wörterbuch 🇬🇧" },
                  { id: "lexicon", label: `❓ Fragen (${filteredCards.length})` },
                  { id: "cards", label: "📇 Lernkarten" },
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

      {/* 0. FACHWISSEN KOMPAKT (aus der Verkaufsmappe) */}
      {displayStyle === "pcards" ? (
        /* PRODUKT-LERNKARTEN: Foto/Name vorne, alle Infos hinten */
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
      ) : displayStyle === "fach" ? (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredFach.length === 0 && (
            <div style={{ backgroundColor: dc('#FFFFFF'), border: `2px solid ${dc('#F1E3C8')}`, borderRadius: "18px", padding: "24px", fontSize: "18px", color: dc('#6B4A30'), textAlign: "center" }}>
              Nichts gefunden zu „{searchQuery}“.
            </div>
          )}
          {filteredFach.map((sec, si) => (
            <section key={sec.id} className="fc-item" style={{ animationDelay: `${Math.min(si, 8) * 0.05}s`, backgroundColor: dc('#FFFFFF'), border: `2px solid ${dc('#F1E3C8')}`, borderRadius: "20px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Fredoka', Georgia, serif", fontWeight: 400, fontSize: "28px", color: dc('#2B170A') }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: dc('#FFF0C2'), display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{sec.icon}</span>
                {sec.title}
              </h3>
              {sec.intro && <p style={{ margin: 0, fontSize: "17px", color: dc('#6B4A30') }}>{sec.intro}</p>}
              {sec.items.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {sec.items.map((it, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", alignItems: "baseline", backgroundColor: dc('#FFFBF2'), border: `1px solid ${dc('#F1E3C8')}`, borderRadius: "12px", padding: "10px 14px", flexWrap: "wrap" }}>
                      {it.term && <strong style={{ fontSize: "17px", color: dc('#4B2A14'), minWidth: "130px" }}>{it.term}</strong>}
                      <span style={{ fontSize: "17px", lineHeight: 1.45, color: dc('#2B170A'), flex: "1 1 220px" }}>{it.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {sec.columns && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                  {sec.columns.map((col) => (
                    <div key={col.title} style={{ borderRadius: "14px", border: `2px solid ${dc('#F1E3C8')}`, overflow: "hidden" }}>
                      <div style={{ backgroundColor: dc('#FFC72C'), color: dc('#2B170A'), fontWeight: 800, fontSize: "17px", padding: "8px 12px" }}>{col.title}</div>
                      <ul style={{ margin: 0, padding: "8px 10px 10px 24px", fontSize: "16px", lineHeight: 1.6, color: dc('#2B170A'), overflowWrap: "anywhere" }}>
                        {col.breads.map((b) => {
                          const hit = !!fachTerm && b.toLowerCase().includes(fachTerm);
                          return <li key={b} style={hit ? { fontWeight: 800, backgroundColor: dc('#FFF0C2') } : undefined}>{b}</li>;
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
          <p style={{ margin: "4px 0 0", fontSize: "15px", color: dc('#6B4A30'), textAlign: "center" }}>Quelle: Verkaufsmappe Bäckerei Hinkel</p>
        </div>
      ) : displayStyle === "dictionary" ? (
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
      ) : displayStyle === "guides" ? (
        /* 2. SCHNITTSTÄRKEN & VOLLSTÄNDIGER ALLERGEN-CHECK */
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
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
                margin: "0 0 14px 0",
                color: dc('#2B170A'),
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              🔪 Offizielle Schnittstärken an der Brotschneidemaschine
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  backgroundColor: dc('#FFFBF2'),
                  padding: "16px",
                  borderRadius: "14px",
                  border: `1.5px solid ${dc('#E8A317')}`,
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: dc('#4B2A14'),
                  }}
                >
                  5,5 mm
                </div>
                <strong style={{ fontSize: "18px", color: dc('#2B170A') }}>
                  Alle Schwarzbrote
                </strong>
                <p
                  style={{
                    fontSize: "16px",
                    color: dc('#6B4A30'),
                    margin: "6px 0 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  Vollkornschwarzbrot, Sonnenblumenschwarzbrot,
                  Kürbiskern-Schwarzbrot, Casanova & Schwarzbrotstangen.
                </p>
              </div>
              <div
                style={{
                  backgroundColor: dc('#E1EEDC'),
                  padding: "16px",
                  borderRadius: "14px",
                  border: `1.5px solid ${dc('#2F5D3A')}`,
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: dc('#2F5D3A'),
                  }}
                >
                  9,0 mm
                </div>
                <strong style={{ fontSize: "18px", color: dc('#2F5D3A') }}>
                  Roggen / Roggenmisch, Weizenmisch & Dinkel
                </strong>
                <p
                  style={{
                    fontSize: "16px",
                    color: dc('#6B4A30'),
                    margin: "6px 0 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  Roggen & Roggenmisch: Schwarzwälder, Oberländer, Feinbrot,
                  Spezialbrot, Harzer, Elsässer, Müslibrot, Mehrkornbrot,
                  Schlesisches Bauernbrot, Reines Roggen, Kartäuser &
                  Innsbrucker. Weizenmisch: Münsterländer, Schweizer & Feuriges.
                  Dinkel: Dinkeltraum & Dinkel-Sprösschen.
                </p>
              </div>
              <div
                style={{
                  backgroundColor: dc('#DDE6F7'),
                  padding: "16px",
                  borderRadius: "14px",
                  border: `1.5px solid ${dc('#2F4F8A')}`,
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: dc('#2F4F8A'),
                  }}
                >
                  12,0 mm
                </div>
                <strong style={{ fontSize: "18px", color: dc('#2F4F8A') }}>
                  Stuten & Weizenbrote
                </strong>
                <p
                  style={{
                    fontSize: "16px",
                    color: dc('#6B4A30'),
                    margin: "6px 0 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  Mürbestuten, Rosinenstuten, Mandelstuten, Burgunderstuten,
                  Jan-Wellem-Stuten, Wochenend-Stuten, Franz. Landbrot,
                  Toastbrot & Holzkohlebrot.
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
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
                margin: "0 0 14px 0",
                color: dc('#2B170A'),
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              🌾 1-Klick Allergen- & Spezial-Check für Kundengespräche
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "17px",
              }}
            >
              <div
                style={{
                  backgroundColor: dc('#E1EEDC'),
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${dc('#CFE3C9')}`,
                }}
              >
                <strong
                  style={{
                    color: dc('#2F5D3A'),
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  ✅ 100 % Glutenfreie Rezeptur (ohne Weizen/Roggen/Dinkel):
                </strong>
                <span>
                  • <strong>Buchweizenbrot</strong> (100% Buchweizenvollkornmehl
                  mit Leinsamen & Apfelessig, gebacken Di. & Do., zu kaufen Di. bis Sa.)
                  <br />• <strong>Düsselhappen</strong> (Dauergebäck aus
                  Haselnüssen, Zucker, Vollei & Zartbitterkuvertüre komplett
                  ohne Mehl)
                  <br />⚠️ Beim Buchweizenbrot können durch Mehlstaub in der Backstube Spuren von Roggen und Weizen enthalten sein. Bei Zöliakie immer darauf hinweisen.
                </span>
              </div>
              <div
                style={{
                  backgroundColor: dc('#FFFBF2'),
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `2px solid ${dc('#F1E3C8')}`,
                }}
              >
                <strong
                  style={{
                    color: dc('#4B2A14'),
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  🚫 Komplett ohne Bäckerhefe gebacken:
                </strong>
                <span>
                  • <strong>Reines Roggen</strong> (100 % Roggen, nur mit
                  Natursauerteig, gebacken Di. & Do., zu kaufen Di. bis Sa.)
                  <br />• <strong>
                    Kartäuser & Innsbrucker Roggenlaib
                  </strong>{" "}
                  (100 % Roggenvollkorn, nur mit Sauerteig)
                  <br />• <strong>Abendschnitte</strong> (komplett ohne Mehl &
                  ohne Hefe, gebacken Mo., Mi. & Fr., zu kaufen täglich)
                  <br />• <strong>Knäckebrot</strong> (Roggenmehl, Saaten &
                  Olivenöl)
                </span>
              </div>
              <div
                style={{
                  backgroundColor: dc('#DDE6F7'),
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${dc('#C9D6EE')}`,
                }}
              >
                <strong
                  style={{
                    color: dc('#2F4F8A'),
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  🥛 Mit Milchprodukten (Laktose / Milcheiweiß beachten!):
                </strong>
                <span>
                  • <strong>Quark im Teig:</strong> Münsterländer, Schweizer,
                  Feuriges, Jan-Wellem-Stuten, Quarkbällchen, Quarkschnecke
                  <br />• <strong>Butter/Milch/Ei:</strong> Toastbrot, alle
                  Stuten & Brioche, Croissants, Monte Christo, Wunderzopf
                  <br />• <strong>Käse:</strong> Zeusstange (Feta), Hellasstange
                  (Schafskäse), Senfkruste & Käsebrötchen (Gouda),
                  Käselaugenstangen, Vesperstangen, Mambolito & Spuntino
                </span>
              </div>
              <div
                style={{
                  backgroundColor: dc('#FCE1D2'),
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${dc('#F5C6AE')}`,
                }}
              >
                <strong
                  style={{
                    color: dc('#9A3412'),
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  🌶️ Pikante Stangen, Mit vs. Ohne Käse:
                </strong>
                <span>
                  • <strong>Feuriges (250 g):</strong> Mit Paprika, Peperoni &
                  getrockneten Tomaten, ohne Käse, aber mit Quark im Teig
                  <br />• <strong>Zeusstange:</strong> Gefüllt mit Feta-Käse,
                  eingelegter Peperoni & Paprika
                </span>
              </div>
              <div
                style={{
                  backgroundColor: dc('#FFFBF2'),
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `2px solid ${dc('#F1E3C8')}`,
                }}
              >
                <strong
                  style={{
                    color: dc('#2B170A'),
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  🌭 Mit Düsseldorfer ABB-Senf (Allergen Senf):
                </strong>
                <span>
                  • <strong>Senfkrustenbrot</strong> (mit Gouda im Teig) &{" "}
                  <strong>Grünschnabel</strong> (Monatsbrot Okt./Nov. mit
                  Grünkohl & Mettenden)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : displayStyle === "profiles" ? (
        /* 3. PRODUKT-STECKBRIEFE, kompakte Liste, Details als Karte zum Aufklappen */
        filteredProfiles.length === 0 ? (
          <div style={{ ...cardStyle, width: "100%", textAlign: "center" }}>
            <p style={{ color: TH.muted, fontSize: "18px", margin: 0 }}>Kein passender Steckbrief gefunden.</p>
          </div>
        ) : (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "17px", color: TH.muted, textAlign: "left" }}>
              {(() => { const extra = filteredProfiles.filter((p: any) => ['Sonstiges', 'Backmischung'].includes(p.shop?.group || p.group)).length; const prod = filteredProfiles.length - extra; return `${prod} ${prod === 1 ? 'Produkt' : 'Produkte'}${extra ? ` und ${extra} ${extra === 1 ? 'Backmischung oder Sonstiges' : 'Backmischungen und Sonstiges'}` : ''}, tippe auf einen Steckbrief für alle Infos.`; })()}
            </div>
            <div className="fc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
              {filteredProfiles.map((prod, pi) => {
                const key = `${prod.name}_${prod.ids[0]}`;
                const fav = favorites.includes(prod.ids[0]);
                const sub = [prod.group, prod.shop?.price].filter(Boolean).join(" · ");
                return (
                  <button key={key} onClick={() => setOpenProfileKey(key)} className="lt-card fc-item" style={{ animationDelay: `${Math.min(pi, 14) * 0.035}s`, display: "flex", alignItems: "center", gap: "14px", minHeight: "84px", padding: "12px 16px", borderRadius: "20px", border: `2px solid ${TH.line}`, borderLeft: `8px solid ${groupColor(prod.shop?.group || prod.group)}`, backgroundColor: TH.white, color: TH.ink, textAlign: "left", cursor: "pointer" }}>
                    {images[productImageKey(prod.name)] ? (
                      <img src={images[productImageKey(prod.name)]} alt="" style={{ flex: "0 0 64px", width: "64px", height: "64px", objectFit: "cover", borderRadius: "16px" }} />
                    ) : (
                      <span aria-hidden="true" style={{ flex: "0 0 56px", height: "56px", borderRadius: "16px", backgroundColor: TH.tintYellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>
                        {getProductEmoji(prod.name, prod.group)}
                      </span>
                    )}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: TH.serif, fontSize: "23px", lineHeight: 1.15 }}>{prod.name}</span>
                      <span style={{ display: "block", fontSize: "16px", color: TH.muted, marginTop: "2px" }}>{sub}</span>
                      <span style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                        {prod.slice && <span style={{ fontSize: "14px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", backgroundColor: TH.cream, border: `1px solid ${TH.line}` }}>Schnitt {prod.slice}</span>}
                        {prod.shop?.vegan && <span style={{ fontSize: "14px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", backgroundColor: TH.tintSage, color: TH.green }}>vegan</span>}
                        {prod.shop && prod.shop.allergens.length === 0 && !prod.shop.allergenNote && <span style={{ fontSize: "14px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", backgroundColor: TH.tintSage, color: TH.green }}>keine Allergene</span>}
                      </span>
                    </span>
                    {fav && <span aria-label="gemerkt" style={{ fontSize: "22px", color: dc('#B87A00') }}>★</span>}
                    <span aria-hidden="true" style={{ fontSize: "22px", color: TH.muted }}>›</span>
                  </button>
                );
              })}
            </div>
          </div>
        )
      ) : displayStyle === "lexicon" ? (
        /* 4. FRAGEN-KATALOG */
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {filteredCards.map((item, ci) => (
            <div
              key={item.id}
              className="fc-item"
              style={{
                animationDelay: `${Math.min(ci, 14) * 0.03}s`,
                backgroundColor: dc('#ffffff'),
                padding: "16px 18px",
                borderRadius: "16px",
                border: `2px solid ${dc('#F1E3C8')}`,
                boxShadow: "none",
                textAlign: "left",
                position: "relative",
              }}
            >
              <button
                onClick={() => toggleFavorite(item.id)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                {favorites.includes(item.id) ? "⭐" : "☆"}
              </button>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: dc('#8A5A00'),
                  backgroundColor: dc('#FFF0C2'),
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                {item.category}
              </span>
              <h4
                style={{
                  margin: "10px 0 6px 0",
                  fontSize: "19px",
                  fontWeight: "700",
                  color: dc('#2B170A'),
                  paddingRight: "28px",
                }}
              >
                {item.question}
              </h4>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: dc('#2F5D3A'),
                  marginBottom: "4px",
                }}
              >
                ✓ {getRightAnswerText(item)}
              </div>
              <div
                style={{ fontSize: "16px", color: dc('#6B4A30'), lineHeight: 1.4 }}
              >
                💡 {item.explanation}
              </div>
            </div>
          ))}
        </div>
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
              ? "Du hast noch keine Karten mit ⭐ gemerkt."
              : "Keine passende Lernkarte gefunden."}
          </p>
        </div>
      ) : (
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
      )}

      {/* ── Steckbrief-Detail ── */}
      {openProfile && (() => {
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
      })()}
    </div>
  );
}