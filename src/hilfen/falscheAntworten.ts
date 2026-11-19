// ═══ Version 250: Welche falsche Antwort wurde gewählt? ═══
// Gespeichert im eigenen Fortschritt: progress/<name>/_falschGewaehlt { frageId: [[Antworttext, Anzahl, Zeit], …] }
// (Antworttexte als Liste, weil Firebase in Schlüsseln keine Punkte usw. erlaubt.) Höchstens 4 Antworten pro Frage.
// Der Ausbilder sieht damit nicht nur die richtige Antwort, sondern auch, was die Mitarbeiter stattdessen genommen haben.

export type FalschEintrag = [string, number, number];
export const MAX_PRO_FRAGE = 4;

/** Eine falsch gewählte Antwort merken (verändert den Fortschritt direkt) */
export function merkeFalsch(prog: Record<string, any>, frageId: number | string, text: string, jetzt = Date.now()) {
  const t = String(text || '').trim().slice(0, 300);
  if (!t) return;
  const alle: Record<string, FalschEintrag[]> = { ...(prog._falschGewaehlt || {}) };
  const liste: FalschEintrag[] = (Array.isArray(alle[frageId]) ? alle[frageId] : []).filter((e: any) => Array.isArray(e) && e[0]).map((e: any) => [String(e[0]), Number(e[1]) || 1, Number(e[2]) || 0]);
  const da = liste.find((e) => e[0] === t);
  if (da) { da[1]++; da[2] = jetzt; } else liste.push([t, 1, jetzt]);
  liste.sort((a, b) => b[2] - a[2]);
  alle[frageId] = liste.slice(0, MAX_PRO_FRAGE);
  prog._falschGewaehlt = alle;
}

/** Falsch gewählte Antworten einer Person zu einer Frage, häufigste zuerst */
export function falschVon(prog: Record<string, any> | undefined, frageId: number | string): { text: string; n: number }[] {
  const liste = ((prog || {})._falschGewaehlt || {})[frageId];
  if (!Array.isArray(liste)) return [];
  return liste.filter((e: any) => Array.isArray(e) && e[0]).map((e: any) => ({ text: String(e[0]), n: Number(e[1]) || 1 })).sort((a, b) => b.n - a.n);
}

/** Falsch gewählte Antworten im ganzen Team zu einer Frage: Text, wie oft, von wem */
export function falschImTeam(progress: Record<string, any>, nutzer: string[], frageId: number | string): { text: string; n: number; wer: string[] }[] {
  const m = new Map<string, { text: string; n: number; wer: string[] }>();
  nutzer.forEach((u) => falschVon(progress[u], frageId).forEach((e) => {
    const x = m.get(e.text) || { text: e.text, n: 0, wer: [] };
    x.n += e.n; if (!x.wer.includes(u)) x.wer.push(u);
    m.set(e.text, x);
  }));
  return [...m.values()].sort((a, b) => b.n - a.n);
}

/** Text der gewählten Antwort(en) einer Frage (bei Mehrfachauswahl mit „+“ verbunden) */
export function gewaehlterText(q: { options?: string[] } | undefined, auswahl: number | number[] | null | undefined): string {
  if (!q || !Array.isArray(q.options) || auswahl === null || auswahl === undefined) return '';
  const idx = Array.isArray(auswahl) ? [...auswahl].sort((a, b) => a - b) : [auswahl];
  return idx.map((i) => q.options![i]).filter(Boolean).join(' + ');
}
