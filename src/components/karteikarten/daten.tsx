// ═══ Karteikarten: Daten (Englisch-Wörterbuch, Schlagworte, Brotgruppen, Fachwissen-Abschnitte) ═══
// Vorher in components/FlashcardView.tsx. Inhalt unverändert übernommen.
import { BAKERY_DICTIONARY, DICTIONARY_EXTRA } from '../../daten/data';
import { SHOP_PRODUCTS, ShopProduct } from '../../daten/shopProducts';

// ───────── Englisch-Wörterbuch: Produkte automatisch aus dem Sortiment ─────────
export const EN_BREAD: Record<string, string> = { schwarzbrot: "dark wholegrain rye bread", roggen: "rye bread", roggenmisch: "rye and wheat bread", weizenmisch: "wheat and rye bread", weizen: "light wheat bread", stuten: "sweet milk loaf", dinkel: "spelt bread", spezial: "special bread" };

export const EN_GROUP: Record<string, string> = { "Brot": "bread", "Brötchen": "bread roll", "Kleingebäck": "small sweet bake", "Feingebäck": "sweet pastry", "Kuchen": "cake", "Stuten & Brioche": "sweet loaf", "Weihnachtsgebäck": "Christmas treat", "Saisongebäck": "seasonal pastry", "Herzhafte Snacks": "savoury snack", "Backmischung": "baking mix", "Sonstiges": "bakery product" };

export const EN_WORDS: [RegExp, string][] = [[/walnu/i, "walnuts"], [/haselnu/i, "hazelnuts"], [/mandel/i, "almonds"], [/pistazie/i, "pistachios"], [/sonnenblumen/i, "sunflower seeds"], [/kürbiskern/i, "pumpkin seeds"], [/leinsa/i, "linseed"], [/chia/i, "chia seeds"], [/sesam/i, "sesame"], [/mohn/i, "poppy seeds"], [/kümmel/i, "caraway"], [/rosine/i, "raisins"], [/cranberr/i, "cranberries"], [/marzipan/i, "marzipan"], [/zimt/i, "cinnamon"], [/honig/i, "honey"], [/schoko|kuvertüre|kakao/i, "chocolate"], [/quark/i, "quark"], [/käse|gouda/i, "cheese"], [/zwiebel/i, "onion"], [/olive/i, "olives"], [/tomate/i, "tomatoes"], [/speck|schinken/i, "bacon"], [/spinat/i, "spinach"], [/senf/i, "mustard"], [/peperoni|chili/i, "chili"], [/apfel/i, "apple"], [/himbeer/i, "raspberries"], [/kirsch/i, "cherries"], [/kokos/i, "coconut"], [/pudding/i, "custard"], [/konfitüre|marmelade/i, "jam"], [/hafer/i, "oats"], [/buchweizen/i, "buckwheat"], [/kartoffel/i, "potato"], [/lakritz/i, "liquorice"], [/ananas/i, "pineapple"], [/nuss|nüsse/i, "nuts"], [/butter/i, "butter"]];

export function productEnglish(p: ShopProduct): string {
  const base = p.breadType ? EN_BREAD[p.breadType] : EN_GROUP[p.group] || "bakery product";
  // Was im Namen steckt, zuerst (z. B. „Bratapfelkuchen“ → apple); „ohne Schokolade“ zählt nicht
  const ohne = (t: string) => t.replace(/ohne\s+\S+/gi, '');
  const extras: string[] = [];
  [ohne(p.name), ohne(p.shortIngredients || "")].forEach((src) => EN_WORDS.forEach(([re, w]) => {
    if (!re.test(src) || extras.includes(w) || extras.length >= 3 || base.includes(w)) return;
    if (w === "nuts" && extras.some((x) => x.endsWith("nuts"))) return; // schon eine bestimmte Nuss genannt
    extras.push(w);
  }));
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}${extras.length ? ` with ${extras.length > 1 ? `${extras.slice(0, -1).join(", ")} and ${extras[extras.length - 1]}` : extras[0]}` : ""}${p.vegan ? " (vegan)" : ""}`;
}

export const DICT_ALL: { de: string; en: string; cat: string; say?: string }[] = (() => {
  const seen = new Set<string>(); const out: { de: string; en: string; cat: string; say?: string }[] = [];
  const add = (e: { de: string; en: string; cat: string; say?: string }) => { const k = e.de.toLowerCase(); if (seen.has(k)) return; seen.add(k); out.push(e); };
  const CAT_MAP: Record<string, string> = { "Spezialbrot": "Brot & Mehl", "Brot & Getreide": "Brot & Mehl", "Mehlarten": "Brot & Mehl", "Feingebäck": "Brötchen & Gebäck", "Brötchen": "Brötchen & Gebäck", "Brötchen & Süßes": "Brötchen & Gebäck", "Stuten & Süßes": "Brötchen & Gebäck" };
  [...BAKERY_DICTIONARY, ...DICTIONARY_EXTRA].forEach(e => add({ ...e, cat: CAT_MAP[e.cat] || e.cat }));
  SHOP_PRODUCTS.filter(p => !["Sonstiges"].includes(p.group)).forEach(p => add({ de: p.name, en: `${p.name}: ${productEnglish(p)}`, cat: "Unsere Produkte", say: `This is ${p.name}, a ${productEnglish(p).toLowerCase().replace(" (vegan)", ", it is vegan")}.` }));
  return out.sort((a, b) => a.de.localeCompare(b.de, "de"));
})();

export const DICT_ORDER = ["Bedienung", "Das sagen Kunden", "Bezahlen", "Unsere Produkte", "Allergene", "Fachbegriffe", "Zutaten & Teig", "Brot & Mehl", "Brötchen & Gebäck", "Zahlen & Mengen", "Tage & Zeiten"];

export const DICT_CATS = ["Alle", ...Array.from(new Set(DICT_ALL.map(d => d.cat))).sort((a, b) => { const r = (x: string) => { const i = DICT_ORDER.indexOf(x); return i < 0 ? 99 : i; }; return r(a) - r(b); })];

export let deVoice: SpeechSynthesisVoice | null = null;

/** Deutsch vorlesen (für „Frag mich ab“) */
export function speakGerman(text: string) {
  try {
    const synth = window.speechSynthesis; if (!synth) return;
    synth.cancel();
    if (!deVoice) { const vs = synth.getVoices().filter(v => /^de/i.test(v.lang)); deVoice = vs.find(v => /google|natural|premium|anna|katja/i.test(v.name)) || vs[0] || null; }
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ').replace(/\s+/g, ' ').trim());
    u.lang = deVoice ? deVoice.lang : 'de-DE'; if (deVoice) u.voice = deVoice; u.rate = 0.95;
    synth.speak(u);
  } catch { /* ohne Sprachausgabe */ }
}

export let enVoice: SpeechSynthesisVoice | null = null;

export function speakEnglish(text: string) {
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
export type TagProduct = { group: string; shop?: ShopProduct };

export const ing = (p: TagProduct) => (p.shop?.fullIngredients || "").toLowerCase();

export const QUICK_TAGS: {
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
export function customProductNumericId(id: string): number {
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
export const BREAD_GROUPS = [
  "brot",
  "stuten",
  "brioche",
  "baguette",
  "alternative getreide",
];

export const COOKIE_NAMES = [
  "printe",
  "spekulatius",
  "zimtstern",
  "spitzkuchen",
  "mandelsplitter",
  "cookie",
  "keks",
  "makronen",
];

export const OTHER_RULES: [string[], string][] = [
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
export function groupColor(g: string): string {
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

export function getProductEmoji(name: string, group: string): string {
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

export const BREAD_TYPES: Record<
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

export type Profile = {
  name: string;
  group: string;
  slice: string;
  facts: string[];
  ids: number[];
  shop?: ShopProduct;
};

/** Fachwissen aus der Verkaufsmappe, für den Spickzettel-Bereich „Fachwissen“ */
export type FachItem = { term?: string; text: string };

export type FachSection = { id: string; icon: string; title: string; intro?: string; items: FachItem[]; columns?: { title: string; breads: string[] }[] };

export const FACH_SECTIONS: FachSection[] = [
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

export const normName = (n: string) => n.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");
