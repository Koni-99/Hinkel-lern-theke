// ═══ Allgemeine Helfer: Zahlen, Mischen, Datum, Namen, Rang, Adressen, Sortiment-Filter ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.

/** Punkte für Sieg/Niederlage im Quiz Battle */
export const BATTLE_POINTS = 25;

/**
 * Repariert alte, kaputte Fehler-Zähler aus der Cloud (z. B. Riesenzahlen).
 * Gibt immer eine kleine, ganze Zahl >= 0 zurück.
 */
export function cleanStatNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  const n = Number(val);
  if (isNaN(n) || n <= 0) return 0;
  if (n > 500) return Math.min(15, Math.max(1, Math.round(Math.log10(n) / 20)));
  return Math.round(n);
}

/** Gleichmäßiges Mischen (Fisher-Yates). `sort(() => 0.5 - Math.random())` mischt ungleichmäßig. */
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Heutiges Datum in lokaler Zeit (YYYY-MM-DD). `toISOString()` liefert UTC und kippt nachts um 1–2 Uhr. */
export function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Firebase erlaubt in Schlüsseln kein . $ # [ ] /, Namen mit diesen Zeichen würden die ganze Synchronisation blockieren. */
export function sanitizeUsername(name: string): string {
  return name.replace(/[.$#[\]/]/g, "").trim();
}

/** Richtige Antwort(en) einer Frage als Text. */
export function getRightAnswerText(q: any): string {
  const indices: number[] = q.correctMulti || [q.correct];
  return indices.map((idx: number) => q.options[idx]).join(" + ");
}

/** Diese Kategorien (Prüfungen, Wiederholungen …) kommen NICHT in die Bestenliste. */
export function isLeaderboardExcludedCategory(cat?: string): boolean {
  if (!cat) return false;
  return (
    cat.startsWith("ZP ") ||
    cat.startsWith("AP ") ||
    cat.includes("Zwischenprüfung") ||
    cat.includes("Abschlussprüfung") ||
    cat.includes("Stolpersteine") ||
    cat.includes("Alternativen &") ||
    cat.includes("Wiederholung")
  );
}

export function getRankByPercentage(pct: number) {
  const safePct = Number.isFinite(pct) ? pct : 0;

  if (safePct >= 98) {
    return {
      title: 'Hinkel-Legende (100%-Club)',
      emoji: '💎',
      color: '#581c87', // Edles Königspurpur
      bg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
      border: '#c084fc',
      min: 98, nextAt: 100, next: 100
    };
  }
  if (safePct >= 90) {
    return {
      title: 'Hinkel-Warenkunde-Meister',
      emoji: '👑',
      color: '#92400e', // Tiefes Meister-Gold
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '#f59e0b',
      min: 90, nextAt: 98, next: 98
    };
  }
  if (safePct >= 80) {
    return {
      title: 'Erster Theken-Profi',
      emoji: '🏆',
      color: '#065f46', // Sattes Smaragdgrün
      bg: '#d1fae5',
      border: '#34d399',
      min: 80, nextAt: 90, next: 90
    };
  }
  if (safePct >= 70) {
    return {
      title: 'Krusten-Virtuose',
      emoji: '🥖',
      color: '#115e59', // Edles Petrol-Grün
      bg: '#ccfbf1',
      border: '#5eead4',
      min: 70, nextAt: 80, next: 80
    };
  }
  if (safePct >= 60) {
    return {
      title: 'Krusten-Kenner',
      emoji: '🥨',
      color: '#7c2d12', // Dunkles Kastanien-/Laugenbraun
      bg: '#ffedd5',
      border: '#fb923c',
      min: 60, nextAt: 70, next: 70
    };
  }
  if (safePct >= 50) {
    return {
      title: 'Warenkunde-Ass (Bergfest!)',
      emoji: '⭐',
      color: '#1e40af', // Kräftiges Königsblau (Bergfest-Highlight)
      bg: '#dbeafe',
      border: '#60a5fa',
      min: 50, nextAt: 60, next: 60
    };
  }
  if (safePct >= 40) {
    return {
      title: 'Sauerteig-Spezialist',
      emoji: '🌾',
      color: '#9a3412', // Kräftiges Kupfer / Roggenkruste
      bg: '#ffedd5',
      border: '#fdba74',
      min: 40, nextAt: 50, next: 50
    };
  }
  if (safePct >= 30) {
    return {
      title: 'Ofenfrisch-Berater',
      emoji: '🔥',
      color: '#c2410c', // Leuchtendes Ofen-Orange
      bg: '#fff7ed',
      border: '#fed7aa',
      min: 30, nextAt: 40, next: 40
    };
  }
  if (safePct >= 20) {
    return {
      title: 'Brötchen-Bändiger',
      emoji: '🥐',
      color: '#b45309', // Goldgelb / Croissant-Ton
      bg: '#fef3c7',
      border: '#fcd34d',
      min: 20, nextAt: 30, next: 30
    };
  }
  if (safePct >= 12) {
    return {
      title: 'Theken-Talent',
      emoji: '🛍️',
      color: '#a16207', // Warmer Honig-/Mürbchen-Ton
      bg: '#fef9c3',
      border: '#fde047',
      min: 12, nextAt: 20, next: 20
    };
  }
  if (safePct >= 5) {
    return {
      title: 'Mehl-Entdecker',
      emoji: '🥄',
      color: '#3f6212', // Frisches Saaten-/Olivgrün
      bg: '#ecfccb',
      border: '#bef264',
      min: 5, nextAt: 12, next: 12
    };
  }
  if (safePct >= 1) {
    return {
      title: 'Frischling an der Theke',
      emoji: '🌱',
      color: '#15803d', // Helles Keimlings-Grün
      bg: '#dcfce7',
      border: '#86efac',
      min: 1, nextAt: 5, next: 5
    };
  }
  return {
    title: 'Backstuben-Neuling',
    emoji: '🥚',
    color: '#78716c', // Sanfter Mehl-/Naturstein-Ton
    bg: '#f5f5f4',
    border: '#d6d3d1',
    min: 0, nextAt: 1, next: 1
  };
}

export function formatEndpointUrl(url: string): string {
  const clean = url.trim();
  if (!clean) return "";
  if (
    (clean.includes("firebaseio.com") ||
      clean.includes("firebasedatabase.app")) &&
    !clean.endsWith(".json")
  ) {
    return clean.replace(/\/$/, "") + "/hinkel_app.json";
  }
  return clean;
}

export function matchesSortimentSubfilter(q: any, subId: string): boolean {
  if (subId === "all") return true;
  if (subId === "backtage") {
    const text = (q.question + " " + q.explanation).toLowerCase();
    return [
      "wochentag",
      "montag",
      "dienstag",
      "mittwoch",
      "donnerstag",
      "freitag",
      "samstag",
    ].some((w) => text.includes(w));
  }
  return q.subgroup === subId;
}
