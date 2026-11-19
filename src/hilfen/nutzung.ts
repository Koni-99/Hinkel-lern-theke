// ═══ Was wird genutzt? ═══
// Das Handy zählt still mit, welche Seiten und Spiele geöffnet werden (ohne Inhalte, nur Anzahl).
// Gezählt wird zuerst im Gerät, hochgeladen wird gesammelt höchstens alle 10 Minuten
// in den eigenen Fortschritt: progress/<name>/_nutzung = { '2026-11': { quiz: 12, theke: 3 } }.
// Der Ausbilder sieht nur die Summe des ganzen Teams, keine Namen.

export type NutzungMonat = Record<string, number>;
export type Nutzung = Record<string, NutzungMonat>;

const SPEICHER = 'lt_nutzung_offen';

/** Lesbare Namen der Seiten (was nicht hier steht, wird nicht gezählt) */
export const SEITEN: Record<string, string> = {
  home: 'Startseite', quiz: 'Quiz', pfad: 'Lernpfad', hoeren: 'Hör-Lernen', ausbildung: 'Ausbildung', einarbeitung: 'Erste Woche',
  nachschlagen: 'Nachschlagen', flashcards: 'Karteikarten', kundenfragen: 'Kundenfragen', kundenstimmen: 'Kundenstimmen', nachrichten: 'Meine Nachrichten',
  spielen: 'Spiele-Auswahl', theke: 'Theken-Simulator', telefon: 'Telefon-Bestellung', ofen: 'Ofen-Kette', kassenblitz: 'Kassenblitz', tueten: 'Tüten-Blitz', ansturm: 'Theken-Ansturm',
  preisduell: 'Teurer oder billiger?', bilderquiz: 'Welches Brot ist das?', schneiden: 'Schneide-Profi', allergene: 'Allergene-Training',
  alternativen: 'Alternativen-Jäger', battle: 'Quiz Battle', advent: 'Adventskalender',
  scoreboard: 'Bestenliste', profil: 'Profil', statistik: 'Statistik', monat: 'Mein Monat', jahr: 'Mein Jahr', appwoche: 'Wochenrückblick',
  hilfe: 'Hilfe', ideen: 'Ideen-Box', geburtstag: 'Mein Geburtstag', urlaub: 'Urlaub',
};

export const monatJetzt = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const lies = (): Nutzung => { try { const v = JSON.parse(localStorage.getItem(SPEICHER) || '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };

/** Eine geöffnete Seite im Gerät mitzählen */
export function zaehleSeite(seite: string) {
  if (!SEITEN[seite]) return;
  try {
    const n = lies(); const m = monatJetzt();
    n[m] = n[m] || {}; n[m][seite] = (n[m][seite] || 0) + 1;
    localStorage.setItem(SPEICHER, JSON.stringify(n));
  } catch {}
}

/** Noch nicht hochgeladene Zählungen */
export const offeneNutzung = (): Nutzung => lies();
export const hatOffeneNutzung = () => Object.keys(lies()).length > 0;
export function leereNutzung(hochgeladen: Nutzung) {
  // nur das abziehen, was hochgeladen wurde (inzwischen Gezähltes bleibt)
  try {
    const n = lies();
    for (const m of Object.keys(hochgeladen)) for (const s of Object.keys(hochgeladen[m])) {
      if (!n[m]) continue;
      n[m][s] = (n[m][s] || 0) - hochgeladen[m][s];
      if (n[m][s] <= 0) delete n[m][s];
      if (!Object.keys(n[m]).length) delete n[m];
    }
    localStorage.setItem(SPEICHER, JSON.stringify(n));
  } catch {}
}

/** Zählungen zum gespeicherten Stand dazurechnen (nur die letzten 13 Monate behalten) */
export function addiereNutzung(alt: Nutzung | undefined, dazu: Nutzung): Nutzung {
  const neu: Nutzung = JSON.parse(JSON.stringify(alt && typeof alt === 'object' ? alt : {}));
  for (const m of Object.keys(dazu)) {
    neu[m] = neu[m] || {};
    for (const s of Object.keys(dazu[m])) neu[m][s] = (Number(neu[m][s]) || 0) + dazu[m][s];
  }
  Object.keys(neu).sort().slice(0, -13).forEach((m) => delete neu[m]);
  return neu;
}

/** Summe des ganzen Teams für einen Monat: [Seite, Anzahl, Personen] absteigend */
export function teamNutzung(progress: Record<string, any> | undefined, monat: string): { seite: string; name: string; mal: number; personen: number }[] {
  const sum: Record<string, { mal: number; personen: number }> = {};
  for (const [k, p] of Object.entries(progress || {})) {
    if (k === 'admin' || !p || typeof p !== 'object') continue;
    const m = (p._nutzung || {})[monat];
    if (!m || typeof m !== 'object') continue;
    for (const [s, n] of Object.entries(m)) {
      const z = Number(n) || 0; if (z <= 0 || !SEITEN[s]) continue;
      sum[s] = sum[s] || { mal: 0, personen: 0 }; sum[s].mal += z; sum[s].personen += 1;
    }
  }
  return Object.entries(sum).map(([seite, v]) => ({ seite, name: SEITEN[seite], ...v })).sort((a, b) => b.mal - a.mal);
}
