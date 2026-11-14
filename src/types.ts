import type { Question } from "./daten/questions";

export interface ScoreEntry {
  id?: string;
  username: string;
  score: number;
  date: string;
  category?: string;
  /** Nur bei Monats-Zusammenfassungen: Anzahl der zusammengefassten Runden */
  n?: number;
  /** Nur bei Monats-Zusammenfassungen: bester Einzelwert dieser Runden */
  best?: number;
}

export interface PinboardMessage {
  text: string;
  /** Optionales Foto (verkleinert, als Daten-Adresse) – wird nur gezeigt, wenn eins eingefügt wurde */
  image?: string;
  author: string;
  updatedAt: string;
  timestamp: number;
  /** Wichtig: jeder Mitarbeiter muss „Gelesen“ bestätigen */
  pflicht?: boolean;
}

export interface CustomProductItem {
  id: string;
  name: string;
  group: string;
  slice: string;
  info: string;
  targetArea: "profile" | "bake_day" | "seasonal" | "sortiment";
  dayOfWeek?: number;
  seasonKey?: string;
  /** Nur bei „sortiment“: neues Produkt mit allen Daten, daraus entstehen automatisch Quizfragen */
  price?: string;
  weight?: string;
  shortIngredients?: string;
  fullIngredients?: string;
  allergens?: string[];
  traces?: string[];
  breadType?: string;
  createdAt?: number;
}

export interface BattleEntry {
  id: string;
  challenger: string;
  challengerKey: string;
  opponent: string;
  opponentKey: string;
  questions: any[];
  challengerScore: number | null;
  opponentScore: number | null;
  status: "pending" | "waiting_opponent" | "waiting_challenger" | "finished";
  winner?: string | null;
}

/** Merker für Gelöschtes, damit veraltete Geräte gelöschte Einträge nicht wieder hochladen (Wert = Zeitpunkt der Löschung) */
export interface Tombstones {
  /** einzelne gelöschte Bestenlisten-Einträge */
  scores?: Record<string, number>;
  /** „Alle Punkte löschen“ pro Mitarbeiter, "_all" = ganze Bestenliste */
  pointsReset?: Record<string, number>;
  /** komplett gelöschte Mitarbeiter */
  users?: Record<string, number>;
  /** zurückgesetzter Lernfortschritt */
  progressReset?: Record<string, number>;
  /** geleerte Stolpersteine / Fehler-Stapel */
  wrongReset?: Record<string, number>;
  /** gelöschte eigene Artikel und Fragen */
  products?: Record<string, number>;
  questions?: Record<string, number>;
}

export interface CloudPayload {
  scores: ScoreEntry[];
  progress: Record<string, Record<string, any>>;
  lastSeen: Record<
    string,
    { displayName: string; time: string; timestamp: number }
  >;
  battles?: Record<string, BattleEntry>;
  wrongStats: Record<string, number>;
  pinboard?: PinboardMessage | null;
  customProducts?: CustomProductItem[];
  customQuestions?: Question[];
  tombstones?: Tombstones;
  /** Vom Ausbilder korrigierte Katalogfragen (Schlüssel = Fragen-ID). restored = Original wieder aktiv */
  questionEdits?: Record<string, QuestionEdit>;
  /** Vom Ausbilder korrigierte Produktdaten (Schlüssel = Produktname) – gelten in allen Spielen */
  productFixes?: Record<string, ProductFix>;
  /** Persönliche PIN pro Mitarbeiter (Schlüssel = Name klein). Nur der Hash wird gespeichert. Ohne h = keine PIN gesetzt/zurückgesetzt */
  pins?: Record<string, PinEntry>;
  /** Einzelrunden vor diesem Zeitpunkt sind zu Monats-Einträgen zusammengefasst (Millisekunden) */
  compactedUntil?: number;
}

export interface PinEntry {
  /** SHA-256 aus Salz, Name und PIN */
  h?: string;
  /** Zufälliges Salz */
  s?: string;
  ts: number;
}

export interface ProductFix {
  price?: string;
  shortIngredients?: string;
  allergens?: string[];
  /** Aus der Excel-Produktliste übernommen (Ausbilder → Inhalte → Produktliste) */
  pricePerKg?: string;
  allergenNote?: string;
  fullIngredients?: string;
  description?: string;
  vegan?: boolean;
  weight?: string;
  alts?: string[];
  restored?: boolean;
  ts: number;
}

export interface QuestionEdit {
  question?: string;
  options?: string[];
  correct?: number;
  explanation?: string;
  restored?: boolean;
  ts: number;
}