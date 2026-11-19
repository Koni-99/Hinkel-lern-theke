// ═══ Version 251: Urlaubsmodus und Willkommen-zurück-Bonus ═══
// Urlaub: progress/<name>/_urlaub = [{ von: 'JJJJ-MM-TT', bis: 'JJJJ-MM-TT' }, …] (eigener Fortschritt).
//   Urlaubstage zählen wie geschützte Tage: die Lern-Serie reißt nicht, es wird kein Serien-Schutz-Joker verbraucht,
//   Teigi wird nicht schlapp. Höchstens 6 Wochen (42 Tage) pro Kalenderjahr.
// Willkommen zurück: Wer 7 Tage oder länger nicht gelernt hat, bekommt am ersten Tag zurück doppelte Punkte.

export type Urlaub = { von: string; bis: string };
export const URLAUB_MAX_TAGE = 42;
export const PAUSE_TAGE = 7;

const dk = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const vonKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const gueltig = (k: unknown): k is string => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);

/** Alle Urlaubs-Einträge (aufgeräumt, sortiert) */
export function urlaubeVon(pr: any): Urlaub[] {
  const l = Array.isArray(pr?._urlaub) ? pr._urlaub : [];
  return l.filter((u: any) => u && gueltig(u.von) && gueltig(u.bis) && u.von <= u.bis).map((u: any) => ({ von: u.von, bis: u.bis })).sort((a: Urlaub, b: Urlaub) => a.von.localeCompare(b.von));
}

/** Alle Urlaubstage als Tages-Schlüssel (bis höchstens „bis“) */
export function urlaubsTage(pr: any, bis?: string): string[] {
  const out: string[] = [];
  urlaubeVon(pr).forEach((u) => {
    const d = vonKey(u.von), ende = bis && bis < u.bis ? bis : u.bis;
    for (let i = 0; i < 400 && dk(d) <= ende; i++) { out.push(dk(d)); d.setDate(d.getDate() + 1); }
  });
  return Array.from(new Set(out)).sort();
}

/** Wie viele Urlaubstage sind in diesem Jahr schon eingetragen? */
export const urlaubImJahr = (pr: any, jahr: number) => urlaubsTage(pr).filter((k) => k.startsWith(String(jahr))).length;

/** Ist heute Urlaub? Dann der Eintrag */
export const urlaubHeute = (pr: any, heute = new Date()): Urlaub | null => urlaubeVon(pr).find((u) => u.von <= dk(heute) && dk(heute) <= u.bis) || null;
/** Nächster Urlaub (heute oder später) */
export const urlaubKommend = (pr: any, heute = new Date()): Urlaub | null => urlaubeVon(pr).find((u) => u.bis >= dk(heute)) || null;

/** Prüft einen neuen Urlaub: Text mit dem Problem oder '' wenn alles passt */
export function urlaubPruefen(pr: any, von: string, bis: string, heute = new Date()): string {
  if (!gueltig(von) || !gueltig(bis)) return 'Bitte beide Tage auswählen.';
  if (bis < von) return 'Der letzte Urlaubstag liegt vor dem ersten.';
  if (bis < dk(heute)) return 'Der Urlaub liegt schon in der Vergangenheit.';
  if (urlaubeVon(pr).some((u) => !(bis < u.von || von > u.bis))) return 'In dieser Zeit ist schon Urlaub eingetragen.';
  const neu = urlaubsTage({ _urlaub: [{ von, bis }] });
  const jahre = Array.from(new Set(neu.map((k) => Number(k.slice(0, 4)))));
  for (const j of jahre) {
    const zusammen = urlaubImJahr(pr, j) + neu.filter((k) => k.startsWith(String(j))).length;
    if (zusammen > URLAUB_MAX_TAGE) return `Höchstens 6 Wochen (${URLAUB_MAX_TAGE} Tage) Urlaub pro Jahr. ${j} sind noch ${Math.max(0, URLAUB_MAX_TAGE - urlaubImJahr(pr, j))} Tage frei.`;
  }
  return '';
}

/** Neuen Urlaub eintragen (verändert den Fortschritt), vorher urlaubPruefen */
export function urlaubEintragen(pr: any, von: string, bis: string) {
  pr._urlaub = [...urlaubeVon(pr), { von, bis }].sort((a, b) => a.von.localeCompare(b.von)).slice(-20);
}

/** Urlaub vorzeitig beenden (zurück ab heute) oder einen kommenden Urlaub löschen */
export function urlaubBeenden(pr: any, heute = new Date()) {
  const h = dk(heute), gestern = new Date(heute); gestern.setDate(gestern.getDate() - 1);
  pr._urlaub = urlaubeVon(pr).flatMap((u) => {
    if (u.bis < h) return [u];            // vorbei: bleibt (zählt für die Serie und die 6 Wochen)
    if (u.von >= h) return [];            // kommt erst noch: weg
    return [{ von: u.von, bis: dk(gestern) }]; // läuft gerade: endet gestern
  });
}

/** Willkommen zurück: letzter Lerntag vor heute ist 7 oder mehr Tage her (nicht für ganz Neue) */
export function willkommenZurueck(days: string[], heute = new Date()): boolean {
  const h = dk(heute);
  const vorher = (days || []).filter((d) => gueltig(d) && d < h).sort().pop();
  if (!vorher) return false;
  const tage = Math.round((vonKey(h).getTime() - vonKey(vorher).getTime()) / 86400000);
  return tage >= PAUSE_TAGE;
}
