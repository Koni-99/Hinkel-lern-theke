export const BAKERY_DICTIONARY = [
  { de: "Vollkornbrot", en: "Whole grain bread", cat: "Brot & Getreide" },
  {
    de: "Roggenmischbrot",
    en: "Mixed rye bread (Rye and wheat)",
    cat: "Brot & Getreide",
  },
  {
    de: "Weizenmischbrot",
    en: "Mixed wheat bread (Wheat and rye)",
    cat: "Brot & Getreide",
  },
  {
    de: "Schwarzbrot (Rheinisches Vollkornschwarzbrot)",
    en: "Rhenish dark whole grain rye bread (Cracked rye)",
    cat: "Brot & Getreide",
  },
  {
    de: "Reines Roggenbrot",
    en: "100% Pure rye bread (Sourdough, yeast-free)",
    cat: "Brot & Getreide",
  },
  {
    de: "Buchweizenbrot (Glutenfrei)",
    en: "100% Buckwheat bread (Gluten-free)",
    cat: "Spezialbrot",
  },
  {
    de: "Abendschnitte (Mehl- & hefefrei)",
    en: "Evening slice bread (Flour-free & yeast-free, with seeds & pulses)",
    cat: "Spezialbrot",
  },
  {
    de: "Innsbrucker Roggenlaib",
    en: "Innsbruck rye loaf (with caraway & coriander)",
    cat: "Spezialbrot",
  },
  { de: "Sauerteig", en: "Sourdough", cat: "Zutaten & Teig" },
  { de: "Bäckerhefe", en: "Baker's yeast", cat: "Zutaten & Teig" },
  {
    de: "Gluten (Eiweißkleber)",
    en: "Gluten (Natural wheat/rye/spelt protein)",
    cat: "Zutaten & Teig",
  },
  {
    de: "Vollkornschrot",
    en: "Whole grain grits / Cracked grain",
    cat: "Zutaten & Teig",
  },
  {
    de: "Auszugsmehl (Weizenmehl Type 550 / 405)",
    en: "White wheat flour / Fine flour",
    cat: "Mehlarten",
  },
  { de: "Roggenmehl", en: "Rye flour", cat: "Mehlarten" },
  { de: "Dinkelmehl", en: "Spelt flour", cat: "Mehlarten" },
  { de: "Kruste", en: "Crust", cat: "Fachbegriffe" },
  { de: "Krume", en: "Crumb (Soft inner part)", cat: "Fachbegriffe" },
  {
    de: "Ausbund (Rissbildung)",
    en: "Oven spring / Crust burst",
    cat: "Fachbegriffe",
  },
  {
    de: "Brötchen / Pipken",
    en: "Bread roll / Hand-rounded roll",
    cat: "Brötchen",
  },
  {
    de: "Röggelchen (Rheinisches Doppelbrötchen)",
    en: "Rhenish double rye-wheat roll",
    cat: "Brötchen",
  },
  { de: "Laugenbrezel", en: "Lye pretzel / Bavarian pretzel", cat: "Brötchen" },
  { de: "Mohnbrötchen", en: "Poppy seed roll", cat: "Brötchen" },
  { de: "Sesambrötchen", en: "Sesame seed roll", cat: "Brötchen" },
  { de: "Mehrkornbrötchen", en: "Multi-grain roll", cat: "Brötchen" },
  {
    de: "Mürbchen (Süßes Weizenbrötchen)",
    en: "Sweet soft wheat pastry roll",
    cat: "Brötchen & Süßes",
  },
  {
    de: "Stuten (Weizen- / Brioche-Stuten)",
    en: "Rich sweet bread / Brioche loaf",
    cat: "Stuten & Süßes",
  },
  { de: "Rosinenstuten", en: "Raisin sweet bread", cat: "Stuten & Süßes" },
  {
    de: "Wunderzopf (Brioche mit karamellisierten Mandeln)",
    en: "Braided brioche with caramelized almonds",
    cat: "Stuten & Süßes",
  },
  {
    de: "Butter-Croissant",
    en: "Butter croissant (Laminated flaky pastry)",
    cat: "Feingebäck",
  },
  { de: "Schoko-Croissant", en: "Chocolate croissant", cat: "Feingebäck" },
  {
    de: "Marzipancroissant",
    en: "Marzipan almond croissant",
    cat: "Feingebäck",
  },
  {
    de: "Quarkbällchen",
    en: "Sweet quark dough fritter / Quark ball",
    cat: "Feingebäck",
  },
  {
    de: "Berliner (mit Konfitüre)",
    en: "Jam-filled doughnut / Berliner",
    cat: "Feingebäck",
  },
  {
    de: "Krapfen (mit Rosinen)",
    en: "Traditional choux/fried pastry with raisins",
    cat: "Feingebäck",
  },
  { de: "Apfelring", en: "Apple ring in batter", cat: "Feingebäck" },
  { de: "Geschnitten", en: "Sliced", cat: "Bedienung" },
  {
    de: "Am Stück / Ungeschnitten",
    en: "Whole loaf / Uncut",
    cat: "Bedienung",
  },
  {
    de: "Zum Mitnehmen (Außer Haus)",
    en: "To go / For takeaway",
    cat: "Bedienung",
  },
  {
    de: "Traditionelles Handwerk",
    en: "Traditional artisan baking",
    cat: "Bedienung",
  },
];

export const SORTIMENT_SUBFILTERS = [
  { id: "all", label: "🥖 Alle Sortimentsfragen" },
  { id: "schwarzbrot", label: "🍞 Vollkorn, Schwarzbrot & Roggen" },
  { id: "roggenmisch", label: "🌾 Roggenmisch" },
  { id: "weizen", label: "🥖 Weizen, Weizenmisch & Baguette" },
  { id: "stuten", label: "🍯 Stuten, Dinkel & Spezialbrote" },
  { id: "broetchen", label: "🥐 Brötchen, Feingebäck & Snacks" },
  { id: "kuchen", label: "🍰 Kuchen, Kekse & Weihnachtsgebäck" },
  { id: "backtage", label: "📅 Nur Backtage" },
];

export const BASE_BAKING_SCHEDULE: Record<
  number,
  {
    dayName: string;
    short: string;
    items: { name: string; type: string; info: string }[];
  }
> = {
  1: {
    dayName: "Montag",
    short: "Mo",
    items: [
      {
        name: "Chia-Brot",
        type: "Roggenmisch (70/30)",
        info: "Exklusiv nur montags! Saftig mit Chiasamen in Krume & Kruste",
      },
      {
        name: "Innsbrucker Roggenlaib",
        type: "100% Roggenvollkorn",
        info: "Mit Kümmel & Koriander (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
      {
        name: "Kartäuser",
        type: "100% Roggenvollkorn",
        info: "Kastenbrot 1.500 g, kräftig & saftig (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
      {
        name: "Casanova",
        type: "Schwarzbrot",
        info: "100% Roggenschrot mit Cranberrys & Lakritz (Mo, Mi, Fr)",
      },
      {
        name: "Abendschnitte",
        type: "Spezialbrot",
        info: "Komplett ohne Mehl & ohne Hefe, voller Saaten (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
      {
        name: "Toastbrot",
        type: "100% Weizenmehl",
        info: "Ungesüßtes Weißbrot mit echter Butter (Mo, Fr, Sa)",
      },
      {
        name: "Klassische Schwarzbrote & Stangen",
        type: "100% Roggenschrot",
        info: "Vollkorn-, Sonnenblumen-, Kürbiskernschwarzbrot & Stangen (gebacken Mo bis Fr, erhältlich täglich)",
      },
      {
        name: "Mandelhörnchen, Bärentatzen, Tigertatzen & Co.",
        type: "Teilchen & Gebäck",
        info: "Mit Schweineohren, Nuss-Kuss, Düsselhappen & Florentinern (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
      {
        name: "Schwarz-Weiß Gebäck & Heidesand",
        type: "Kekse",
        info: "Nur montags gebacken, erhältlich täglich",
      },
    ],
  },
  2: {
    dayName: "Dienstag",
    short: "Di",
    items: [
      {
        name: "Reines Roggen",
        type: "100% Roggenmehl",
        info: "Im Kasten, nur mit Natursauerteig komplett ohne Hefe (gebacken Di, Do, erhältlich Di bis Sa)",
      },
      {
        name: "Buchweizenbrot",
        type: "100% Buchweizen",
        info: "Glutenfreie Rezeptur, Spuren von Roggen & Weizen möglich, mit Leinsamen & Apfelessig (gebacken Di, Do, erhältlich Di bis Sa)",
      },
      {
        name: "Klassische Schwarzbrote & Stangen",
        type: "100% Roggenschrot",
        info: "Vollkorn-, Sonnenblumen-, Kürbiskernschwarzbrot & Stangen (gebacken Mo bis Fr, erhältlich täglich)",
      },
      {
        name: "Kokosmakronen, Cookies & Co.",
        type: "Kekse",
        info: "Mit Dinkel Hafer Cookies, Spritzgebäck, Hüftgold & Wölkchen (gebacken Di, Do, erhältlich Di bis Sa)",
      },
      {
        name: "Muzenmandeln",
        type: "Fettgebäck",
        info: "Gebacken Di, Do, Sa, erhältlich täglich",
      },
    ],
  },
  3: {
    dayName: "Mittwoch",
    short: "Mi",
    items: [
      {
        name: "Innsbrucker Roggenlaib",
        type: "100% Roggenvollkorn",
        info: "Mit Kümmel & Koriander (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
      {
        name: "Kartäuser",
        type: "100% Roggenvollkorn",
        info: "Kastenbrot 1.500 g, kräftig & saftig (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
      {
        name: "Casanova",
        type: "Schwarzbrot",
        info: "100% Roggenschrot mit Cranberrys & Lakritz (Mo, Mi, Fr)",
      },
      {
        name: "Abendschnitte",
        type: "Spezialbrot",
        info: "Komplett ohne Mehl & ohne Hefe, voller Saaten (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
      {
        name: "Klassische Schwarzbrote & Stangen",
        type: "100% Roggenschrot",
        info: "Vollkorn-, Sonnenblumen-, Kürbiskernschwarzbrot & Stangen (gebacken Mo bis Fr, erhältlich täglich)",
      },
      {
        name: "Mandelhörnchen, Bärentatzen, Tigertatzen & Co.",
        type: "Teilchen & Gebäck",
        info: "Mit Schweineohren, Nuss-Kuss, Düsselhappen & Florentinern (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
    ],
  },
  4: {
    dayName: "Donnerstag",
    short: "Do",
    items: [
      {
        name: "Jan-Wellem-Stuten",
        type: "Brioche-Stuten",
        info: "Exklusiv nur donnerstags! Mit Aprikosen, Rosinen & ganzen Mandeln",
      },
      {
        name: "Reines Roggen",
        type: "100% Roggenmehl",
        info: "Im Kasten, nur mit Natursauerteig komplett ohne Hefe (gebacken Di, Do, erhältlich Di bis Sa)",
      },
      {
        name: "Buchweizenbrot",
        type: "100% Buchweizen",
        info: "Glutenfreie Rezeptur, Spuren von Roggen & Weizen möglich, mit Leinsamen & Apfelessig (gebacken Di, Do, erhältlich Di bis Sa)",
      },
      {
        name: "Klassische Schwarzbrote & Stangen",
        type: "100% Roggenschrot",
        info: "Vollkorn-, Sonnenblumen-, Kürbiskernschwarzbrot & Stangen (gebacken Mo bis Fr, erhältlich täglich)",
      },
      {
        name: "Kokosmakronen, Cookies & Co.",
        type: "Kekse",
        info: "Mit Dinkel Hafer Cookies, Spritzgebäck, Hüftgold & Wölkchen (gebacken Di, Do, erhältlich Di bis Sa)",
      },
      {
        name: "Muzenmandeln",
        type: "Fettgebäck",
        info: "Gebacken Di, Do, Sa, erhältlich täglich",
      },
    ],
  },
  5: {
    dayName: "Freitag",
    short: "Fr",
    items: [
      {
        name: "Burgunderstuten",
        type: "Brioche-Stuten",
        info: "Exklusiv nur freitags! Reichhaltiger Brioche-Stuten mit viel Butter & Ei",
      },
      {
        name: "Wochenend-Stuten",
        type: "Weizenstuten",
        info: "Rosinen, gestiftete Mandeln, Zitronat & Orangeat (Fr, Sa)",
      },
      {
        name: "Wunderzopf",
        type: "Brioche-Spezialität",
        info: "Mit karamellisierten Mandeln, fein aprikotiert (Fr, Sa)",
      },
      {
        name: "Harzer Nuss-Stange",
        type: "Roggenmisch mit Schrot",
        info: "Kräftig-nussig mit vielen Walnüssen (Fr, Sa)",
      },
      {
        name: "Toastbrot",
        type: "100% Weizenmehl",
        info: "Ungesüßtes Weißbrot mit echter Butter (Mo, Fr, Sa)",
      },
      {
        name: "Innsbrucker, Kartäuser, Casanova & Abendschnitte",
        type: "Mo-Mi-Fr Spezialitäten",
        info: "Alle vier werden freitags frisch gebacken.",
      },
      {
        name: "Klassische Schwarzbrote & Stangen",
        type: "100% Roggenschrot",
        info: "Vollkorn-, Sonnenblumen-, Kürbiskernschwarzbrot & Stangen (gebacken Mo bis Fr, erhältlich täglich)",
      },
      {
        name: "Mandelhörnchen, Bärentatzen, Tigertatzen & Co.",
        type: "Teilchen & Gebäck",
        info: "Mit Schweineohren, Nuss-Kuss, Düsselhappen & Florentinern (gebacken Mo, Mi, Fr, erhältlich täglich)",
      },
    ],
  },
  6: {
    dayName: "Samstag",
    short: "Sa",
    items: [
      {
        name: "Wochenend-Stuten",
        type: "Weizenstuten",
        info: "Rosinen, gestiftete Mandeln, Zitronat & Orangeat (Fr, Sa)",
      },
      {
        name: "Wunderzopf",
        type: "Brioche-Spezialität",
        info: "Mit karamellisierten Mandeln, fein aprikotiert (Fr, Sa)",
      },
      {
        name: "Harzer Nuss-Stange",
        type: "Roggenmisch mit Schrot",
        info: "Kräftig-nussig mit vielen Walnüssen (Fr, Sa)",
      },
      {
        name: "Toastbrot",
        type: "100% Weizenmehl",
        info: "Ungesüßtes Weißbrot mit echter Butter (Mo, Fr, Sa)",
      },
      {
        name: "Muzenmandeln",
        type: "Fettgebäck",
        info: "Gebacken Di, Do, Sa, erhältlich täglich",
      },
    ],
  },
};

export const BASE_SEASONAL_MAP: Record<string, string[]> = {
  Frühling: ["Frühlingstraum: mit Lauchzwiebeln und Knoblauch"],
  Sommer: ["Hellasstange: mit Paprika, grünen Oliven und Schafskäse"],
  Herbst: ["Kappeskopp: mit Weißkohl, Rotkohl, Kartoffel und Muskatnuss", "Grünschnabel: Monatsbrot im Oktober & November, mit Grünkohl, Mettenden & ABB-Senf", "Weckmann: zu St. Martin, mit Marzipan im Teig, auch mit Mandelüberzug"],
  Winter: ["Wintertraum: mit Äpfeln, Rosinen, Zimt, Rum und Walnüssen", "Christstollen & Mini-Stollen: Mandeln in Altbier, Rosinen in Killepitsch, mit oder ohne Marzipan", "Printen: Gewürzprinten, Schokoladen-Printen, Vollmilch-Nuss-Printen, Große Schokoladenprinte & Printenbruch (ältestes Hinkel-Rezept)", "Weihnachtsplätzchen: Butter- & Gewürzspekulatius, Zimtsterne, Spitzkuchen, Mandelsplitter (Vollmilch & Zartbitter)"],
};
// ───────────────────────── Alternativen bei „ausverkauft“ (vom Ausbilder festgelegt) ─────────────────────────
// Gilt für Alternativen-Jäger, die Quizfragen „… ist ausverkauft – welche Alternative?“ und den Theken-Simulator.
// Mehrere Antworten können richtig sein.
const HEFETEILCHEN = ['Mohnschnecke', 'Nussschleife', 'Puddingbrezel', 'Quarkschnecke mit Himbeeren', 'Rosinenschnecke', 'Rosinenstriezel'];
const KEKSE = ['Heidesand', 'Spritzgebäck', 'Schwarz-Weiß Gebäck', 'Pistazien Kekse', 'Dinkel Hafer Cookies', 'Kokosmakronen', 'Hüftgold'];
const LAUGE = ['Laugenbrezel', 'Laugenstange', 'Käselaugenstange', 'Kürbiskern-Käselaugenstange'];
const CROISSANTS = ['Butter-Croissant', 'Schoko-Croissant', 'Marzipan-Croissant'];
const MUERBCHEN = ['Mürbchen', 'Rosinenmürbchen', 'Schokomürbchen', 'Monte Christo'];
const SCHOKOPRINTEN = ['Große Schokoladenprinte', 'Schokoladen-Printen', 'Vollmilch-Nuss-Printen'];
const SCHWARZBROT_SB = ['Sonnenblumenkern-Schwarzbrot (Kasten)', 'Großes Sonnenblumenkern-Schwarzbrot', 'Kleines Sonnenblumenkern-Schwarzbrot'];
const SCHWARZBROT_VK = ['Vollkornschwarzbrot (Kasten)', 'Großes Vollkornschwarzbrot', 'Kleines Vollkornschwarzbrot'];
const others = (list: string[], self: string) => list.filter(x => x !== self);

export const ALT_MAP: Record<string, string[]> = {
  'Abendschnitte': ['Buchweizenbrot'],
  'Brötchen (Piepken)': ['Fränzchen', 'Römer', 'Mohnbrötchen', 'Sesambrötchen'],
  'Buchweizenbrot': ['Abendschnitte'],
  'Burgunderstuten': ['Jan-Wellem Stuten', 'Mürbestuten'],
  'Apfelring': ['Krapfen', 'Berliner', 'Quarkbällchen'],
  'Krapfen': ['Apfelring', 'Berliner', 'Quarkbällchen'],
  'Berliner': ['Apfelring', 'Krapfen', 'Quarkbällchen'],
  'Quarkbällchen': ['Apfelring', 'Krapfen', 'Berliner'],
  'Apfeltasche': HEFETEILCHEN,
  'Bärentatze': KEKSE,
  'Bratapfelkuchen': ['Düsselwelle', 'Schokokuchen', 'Butterkuchen'],
  'Schokokuchen': ['Bratapfelkuchen', 'Düsselwelle'],
  'Butterkuchen': ['Streuselkuchen', 'Bratapfelkuchen'],
  'Butter-Croissant': others(CROISSANTS, 'Butter-Croissant'),
  'Schoko-Croissant': others(CROISSANTS, 'Schoko-Croissant'),
  'Marzipan-Croissant': others(CROISSANTS, 'Marzipan-Croissant'),
  'Butterspekulatius': ['Gewürzspekulatius'],
  'Gewürzspekulatius': ['Butterspekulatius'],
  'Campaillette': ['Landbaguette', 'Weinstock'],
  'Casanova': ['Schwarzbrotstange', 'Walnuss-Schwarzbrotstange'],
  'Chia-Brot': ['Elsässer', 'Kleines Schwarzwälder'],
  'Christstollen': ['Mini-Stollen'],
  'Mini-Stollen': ['Christstollen'],
  'Dinkel Hafer Cookies': others(KEKSE, 'Dinkel Hafer Cookies'),
  'Dinkel-Sprösschen': ['Sonnenblumenbrot', 'Dinkeltraum'],
  'Dinkelchen': ['Mehrkornbrötchen'],
  'Dinkeltraum': ['Elsässer', 'Dinkel-Sprösschen'],
  'Düsselhappen': ['Mandelhörnchen', 'Walnusshaube'],
  'Düsselwelle': ['Bratapfelkuchen', 'Schokokuchen'],
  'Elsässer': ['Dinkeltraum', 'Kleines Schwarzwälder'],
  'Feinbrot': ['Oberländer'],
  'Feuriges': ['Zeusstange', 'Mambolito', 'Schweizer'],
  'Florentiner': ['Florentinertaler'],
  'Florentinertaler': ['Florentiner'],
  'Fränzchen': ['Römer', 'Brötchen (Piepken)'],
  'Französisches Landbrot': ['Holzkohlebrot', 'Französische Landbrotstange'],
  'Französische Landbrotstange': ['Französisches Landbrot', 'Campaillette'],
  'Gewürzprinten': SCHOKOPRINTEN,
  'Großes Schwarzwälder': ['Schlesisches Bauernbrot', 'Kleines Schwarzwälder', 'Spezialbrot'],
  ...Object.fromEntries(SCHWARZBROT_SB.map(n => [n, [...others(SCHWARZBROT_SB, n), 'Kürbiskern-Schwarzbrot', ...SCHWARZBROT_VK]])),
  ...Object.fromEntries(SCHWARZBROT_VK.map(n => [n, [...others(SCHWARZBROT_VK, n), ...SCHWARZBROT_SB]])),
  'Kürbiskern-Schwarzbrot': [...SCHWARZBROT_SB],
  'Grünschnabel': ['Kleines Schwarzwälder'],
  'Harzer': ['Harzer Nuss-Stange', 'Sonnenblumenbrot'],
  'Harzer Nuss-Stange': ['Harzer', 'Sonnenblumenbrot'],
  'Heidesand': others(KEKSE, 'Heidesand'),
  'Holzkohlebrot': ['Französisches Landbrot'],
  'Innsbrucker Roggenlaib': ['Vinschgauer', 'Kartäuser'],
  'Jan-Wellem Stuten': ['Rosinenstuten', 'Mandelstuten'],
  'Kümmelstange': ['Vinschgauer', 'Zwiebelstange', 'Roggenstange'],
  'Vinschgauer': ['Kümmelstange'],
  'Zwiebelstange': ['Kümmelstange'],
  'Roggenstange': ['Kümmelstange', 'Sternchen'],
  'Landbaguette': ['Campaillette', 'Weinstock', 'Französische Landbrotstange'],
  ...Object.fromEntries(LAUGE.map(n => [n, others(LAUGE, n)])),
  'Mambolito': ['Käsebrötchen', 'Feuriges'],
  'Mandelhörnchen': ['Düsselhappen', 'Walnusshaube'],
  'Mandelstuten': ['Mürbestuten', 'Rosinenstuten'],
  'Mürbestuten': ['Mandelstuten'],
  'Rosinenstuten': ['Mandelstuten'],
  'Mehrkornbrot': ['Elsässer', 'Sonnenblumenbrot'],
  'Mohnstreusel': ['Streuselkuchen'],
  ...Object.fromEntries(MUERBCHEN.map(n => [n, others(MUERBCHEN, n)])),
  'Müslibrot': ['Mehrkornbrot'],
  'Olivenstange': ['Zeusstange'],
  'Reines Roggen': ['Kartäuser'],
  'Schlesisches Bauernbrot': ['Großes Schwarzwälder', 'Münsterländer'],
  'Schwarzbrotstange': ['Walnuss-Schwarzbrotstange'],
  'Walnuss-Schwarzbrotstange': ['Schwarzbrotstange'],
  'Schweizer': ['Münsterländer'],
  'Sonnenblumenbrot': ['Harzer Nuss-Stange', 'Harzer'],
  'Spezialbrot': ['Großes Schwarzwälder'],
  'Sternchen': ['Roggenstange', 'Vinschgauer', 'Kleines Schwarzwälder'],
  'Walnuss-Brot': ['Elsässer', 'Vinschgauer', 'Sternchen'],
  'Weinstock': ['Olivenstange', 'Landbaguette'],
  'Zeusstange': ['Olivenstange', 'Feuriges'],
};

// ───────────────────────── Dunkler Modus ─────────────────────────
// Wird beim Start aus dem Gerät gelesen (Schalter oben in der App, danach lädt die App neu)
let DARK_ON = false;
// Dunkelmodus ist abgeschaltet, alte Einstellung wird entfernt
try { if (typeof window !== 'undefined') window.localStorage.removeItem('lt_theme'); } catch { /* egal */ }
DARK_ON = false;
export const isDarkMode = () => DARK_ON;
// Mokka-Braun statt fast Schwarz: helle Farben werden zu warmen Brauntönen, dunkle Schrift wird hell
const DARK_MAP: Record<string, string> = {
  '#FFFFFF': '#6A4B36', '#FFFBF2': '#54392A', '#F1E3C8': '#86634A', '#2B170A': '#FFF4E4', '#6B4A30': '#EBD6BC', '#4B2A14': '#FFC72C', '#FFF6E0': '#2B170A',
  '#FFF0C2': '#7A5A2A', '#FCE1D2': '#7A4A3A', '#E1EEDC': '#3F5A3E', '#DDE6F7': '#3E4C66', '#2F5D3A': '#B9EBC2', '#9A3412': '#FFB89E', '#F4EADB': '#6F5240',
  '#7A4A00': '#FFD873', '#2F4F8A': '#C4D6FF', '#8A5A00': '#FFD873', '#F0D9AE': '#8A6A44', '#3A2010': '#FFF4E4', '#7A4A2B': '#F3DCC0', '#FAF6F0': '#54392A',
  '#D9CBB5': '#8A6E55', '#C9DAEC': '#4A5A74', '#9EC3EA': '#5A7398', '#D6E4F2': '#43536C', '#E6D6B8': '#8A6E55', '#CFE3C9': '#4F6E4E', '#C9D6EE': '#4E5D7A', '#F5C6AE': '#8A5A48',
};
/** Farbe für den aktuellen Modus (hell = unverändert) */
export const dc = (c: string): string => {
  if (!DARK_ON) return c;
  const k = c.toUpperCase();
  const full = k.length === 4 ? `#${k[1]}${k[1]}${k[2]}${k[2]}${k[3]}${k[3]}` : k;
  return DARK_MAP[full] || c;
};

// ───────── Englisch-Wörterbuch: weitere Begriffe (Produkte kommen automatisch aus dem Sortiment dazu) ─────────
export const DICTIONARY_EXTRA: { de: string; en: string; cat: string }[] = [
  // Bedienung an der Theke
  { de: 'Guten Morgen! Was darf es sein?', en: 'Good morning! What can I get you?', cat: 'Bedienung' },
  { de: 'Guten Tag! Kann ich Ihnen helfen?', en: 'Hello! Can I help you?', cat: 'Bedienung' },
  { de: 'Darf es sonst noch etwas sein?', en: 'Anything else?', cat: 'Bedienung' },
  { de: 'Möchten Sie das Brot geschnitten?', en: 'Would you like the bread sliced?', cat: 'Bedienung' },
  { de: 'Ganz oder halb?', en: 'Whole or half?', cat: 'Bedienung' },
  { de: 'Wie viele möchten Sie?', en: 'How many would you like?', cat: 'Bedienung' },
  { de: 'Zum Mitnehmen oder hier essen?', en: 'To take away or to eat in?', cat: 'Bedienung' },
  { de: 'Brauchen Sie eine Tüte?', en: 'Do you need a bag?', cat: 'Bedienung' },
  { de: 'Das macht … Euro, bitte.', en: 'That will be … euros, please.', cat: 'Bedienung' },
  { de: 'Zahlen Sie bar oder mit Karte?', en: 'Cash or card?', cat: 'Bedienung' },
  { de: 'Halten Sie die Karte bitte an das Gerät.', en: 'Please hold your card to the reader.', cat: 'Bedienung' },
  { de: 'Hier ist Ihr Rückgeld.', en: 'Here is your change.', cat: 'Bedienung' },
  { de: 'Möchten Sie den Kassenbon?', en: 'Would you like the receipt?', cat: 'Bedienung' },
  { de: 'Vielen Dank, schönen Tag noch!', en: 'Thank you, have a nice day!', cat: 'Bedienung' },
  { de: 'Das ist leider ausverkauft.', en: 'Sorry, that is sold out.', cat: 'Bedienung' },
  { de: 'Ich kann Ihnen … empfehlen.', en: 'I can recommend …', cat: 'Bedienung' },
  { de: 'Das ist heute ganz frisch.', en: 'This is very fresh today.', cat: 'Bedienung' },
  { de: 'Das gibt es nur an bestimmten Tagen.', en: 'We only have this on certain days.', cat: 'Bedienung' },
  { de: 'Ich frage kurz in der Backstube nach.', en: 'Let me quickly ask in the bakehouse.', cat: 'Bedienung' },
  { de: 'Einen Moment bitte.', en: 'One moment, please.', cat: 'Bedienung' },
  { de: 'Wer ist der Nächste, bitte?', en: 'Who is next, please?', cat: 'Bedienung' },
  { de: 'Möchten Sie etwas vorbestellen?', en: 'Would you like to pre-order something?', cat: 'Bedienung' },
  { de: 'Auf welchen Namen?', en: 'What name should I put it under?', cat: 'Bedienung' },
  { de: 'Wann möchten Sie es abholen?', en: 'When would you like to pick it up?', cat: 'Bedienung' },
  { de: 'Das Trinkgeld kommt in unsere Kasse, vielen Dank!', en: 'The tip goes into our tip jar, thank you very much!', cat: 'Bedienung' },
  { de: 'Entschuldigung, das tut mir leid.', en: 'I am sorry about that.', cat: 'Bedienung' },
  // Allergene und Ernährung
  { de: 'Allergene', en: 'Allergens', cat: 'Allergene' },
  { de: 'Gluten', en: 'Gluten', cat: 'Allergene' },
  { de: 'Weizen', en: 'Wheat', cat: 'Allergene' },
  { de: 'Roggen', en: 'Rye', cat: 'Allergene' },
  { de: 'Gerste', en: 'Barley', cat: 'Allergene' },
  { de: 'Hafer', en: 'Oats', cat: 'Allergene' },
  { de: 'Dinkel', en: 'Spelt', cat: 'Allergene' },
  { de: 'Milch (auch Laktose)', en: 'Milk (including lactose)', cat: 'Allergene' },
  { de: 'Eier', en: 'Eggs', cat: 'Allergene' },
  { de: 'Soja', en: 'Soy', cat: 'Allergene' },
  { de: 'Sesam', en: 'Sesame', cat: 'Allergene' },
  { de: 'Senf', en: 'Mustard', cat: 'Allergene' },
  { de: 'Sellerie', en: 'Celery', cat: 'Allergene' },
  { de: 'Schalenfrüchte (Nüsse)', en: 'Tree nuts', cat: 'Allergene' },
  { de: 'Mandeln', en: 'Almonds', cat: 'Allergene' },
  { de: 'Haselnüsse', en: 'Hazelnuts', cat: 'Allergene' },
  { de: 'Walnüsse', en: 'Walnuts', cat: 'Allergene' },
  { de: 'Pistazien', en: 'Pistachios', cat: 'Allergene' },
  { de: 'Erdnüsse', en: 'Peanuts', cat: 'Allergene' },
  { de: 'Lupinen', en: 'Lupin', cat: 'Allergene' },
  { de: 'Krebstiere', en: 'Crustaceans', cat: 'Allergene' },
  { de: 'Fisch', en: 'Fish', cat: 'Allergene' },
  { de: 'Weichtiere', en: 'Molluscs', cat: 'Allergene' },
  { de: 'Schwefeldioxid und Sulfite', en: 'Sulphur dioxide and sulphites', cat: 'Allergene' },
  { de: 'Kann Spuren von … enthalten.', en: 'May contain traces of …', cat: 'Allergene' },
  { de: 'Das enthält Nüsse.', en: 'This contains nuts.', cat: 'Allergene' },
  { de: 'Das ist ohne Milch und Ei.', en: 'This is free from milk and eggs.', cat: 'Allergene' },
  { de: 'Haben Sie eine Allergie?', en: 'Do you have an allergy?', cat: 'Allergene' },
  { de: 'vegan', en: 'vegan', cat: 'Allergene' },
  { de: 'vegetarisch', en: 'vegetarian', cat: 'Allergene' },
  { de: 'glutenfreie Rezeptur', en: 'gluten-free recipe', cat: 'Allergene' },
  { de: 'Durch Mehlstaub können Spuren enthalten sein.', en: 'Flour dust in the bakery may leave traces.', cat: 'Allergene' },
  // Fachbegriffe
  { de: 'Kruste', en: 'Crust', cat: 'Fachbegriffe' },
  { de: 'Krume', en: 'Crumb (inside of the bread)', cat: 'Fachbegriffe' },
  { de: 'Sauerteig', en: 'Sourdough', cat: 'Fachbegriffe' },
  { de: 'Vollkorn', en: 'Wholegrain', cat: 'Fachbegriffe' },
  { de: 'Schrot', en: 'Cracked grain', cat: 'Fachbegriffe' },
  { de: 'Hefe', en: 'Yeast', cat: 'Fachbegriffe' },
  { de: 'Teig', en: 'Dough', cat: 'Fachbegriffe' },
  { de: 'Backstube', en: 'Bakehouse', cat: 'Fachbegriffe' },
  { de: 'Brotschneidemaschine', en: 'Bread slicer', cat: 'Fachbegriffe' },
  { de: 'Schnittstärke', en: 'Slice thickness', cat: 'Fachbegriffe' },
  { de: 'aprikotiert', en: 'glazed with apricot jam', cat: 'Fachbegriffe' },
  { de: 'Fondant', en: 'Fondant icing', cat: 'Fachbegriffe' },
  { de: 'Streusel', en: 'Crumble topping', cat: 'Fachbegriffe' },
  { de: 'Plunderteig', en: 'Danish pastry dough', cat: 'Fachbegriffe' },
  { de: 'Blätterteig', en: 'Puff pastry', cat: 'Fachbegriffe' },
  { de: 'Mürbeteig', en: 'Shortcrust pastry', cat: 'Fachbegriffe' },
  { de: 'Hefeteig', en: 'Yeast dough', cat: 'Fachbegriffe' },
  { de: 'Brandteig', en: 'Choux pastry', cat: 'Fachbegriffe' },
  { de: 'Laugengebäck', en: 'Pretzel pastries', cat: 'Fachbegriffe' },
  { de: 'Kastenbrot', en: 'Tin loaf', cat: 'Fachbegriffe' },
  { de: 'Stuten', en: 'Sweet milk loaf', cat: 'Fachbegriffe' },
  { de: 'Grundpreis pro Kilo', en: 'Price per kilo', cat: 'Fachbegriffe' },
  { de: 'frisch gebacken', en: 'freshly baked', cat: 'Fachbegriffe' },
  { de: 'vom Vortag', en: 'from yesterday', cat: 'Fachbegriffe' },
  { de: 'Saisongebäck', en: 'Seasonal pastries', cat: 'Fachbegriffe' },
  { de: 'Weihnachtsgebäck', en: 'Christmas cookies and pastries', cat: 'Fachbegriffe' },
  // Zutaten
  { de: 'Mehl', en: 'Flour', cat: 'Zutaten & Teig' },
  { de: 'Butter', en: 'Butter', cat: 'Zutaten & Teig' },
  { de: 'Quark', en: 'Quark (fresh cheese)', cat: 'Zutaten & Teig' },
  { de: 'Sonnenblumenkerne', en: 'Sunflower seeds', cat: 'Zutaten & Teig' },
  { de: 'Kürbiskerne', en: 'Pumpkin seeds', cat: 'Zutaten & Teig' },
  { de: 'Leinsamen', en: 'Linseed', cat: 'Zutaten & Teig' },
  { de: 'Chiasamen', en: 'Chia seeds', cat: 'Zutaten & Teig' },
  { de: 'Mohn', en: 'Poppy seeds', cat: 'Zutaten & Teig' },
  { de: 'Kümmel', en: 'Caraway', cat: 'Zutaten & Teig' },
  { de: 'Rosinen', en: 'Raisins', cat: 'Zutaten & Teig' },
  { de: 'Marzipan', en: 'Marzipan', cat: 'Zutaten & Teig' },
  { de: 'Zimt', en: 'Cinnamon', cat: 'Zutaten & Teig' },
  { de: 'Honig', en: 'Honey', cat: 'Zutaten & Teig' },
  { de: 'Pudding', en: 'Custard', cat: 'Zutaten & Teig' },
  { de: 'Kuvertüre', en: 'Chocolate coating', cat: 'Zutaten & Teig' },
  { de: 'Zucker', en: 'Sugar', cat: 'Zutaten & Teig' },
  { de: 'Salz', en: 'Salt', cat: 'Zutaten & Teig' },
  // Zeiten und Zahlen
  { de: 'Montag', en: 'Monday', cat: 'Tage & Zeiten' },
  { de: 'Dienstag', en: 'Tuesday', cat: 'Tage & Zeiten' },
  { de: 'Mittwoch', en: 'Wednesday', cat: 'Tage & Zeiten' },
  { de: 'Donnerstag', en: 'Thursday', cat: 'Tage & Zeiten' },
  { de: 'Freitag', en: 'Friday', cat: 'Tage & Zeiten' },
  { de: 'Samstag', en: 'Saturday', cat: 'Tage & Zeiten' },
  { de: 'Sonntag', en: 'Sunday', cat: 'Tage & Zeiten' },
  { de: 'heute', en: 'today', cat: 'Tage & Zeiten' },
  { de: 'morgen', en: 'tomorrow', cat: 'Tage & Zeiten' },
  { de: 'Öffnungszeiten', en: 'Opening hours', cat: 'Tage & Zeiten' },
  { de: 'Wir haben geschlossen.', en: 'We are closed.', cat: 'Tage & Zeiten' },
  { de: 'ein Stück', en: 'one piece', cat: 'Tage & Zeiten' },
  { de: '500 Gramm', en: '500 grams', cat: 'Tage & Zeiten' },
  { de: 'ein Kilo', en: 'one kilo', cat: 'Tage & Zeiten' },
];