// ═══ Version 252: Azubi-Bereich ausgebaut ═══
// Lehrjahr aus dem Ausbildungsbeginn, „Üben“ zu jedem Planpunkt, Wochen-Notizzettel fürs Berichtsheft
// mit Vorschlägen aus der App, Bestätigung der Planpunkte durch den Ausbilder.
// Gespeichert im Fortschritt des Azubis: _ausbildungStart 'JJJJ-MM', _berichtNotiz { 'JJJJ-MM-TT' (Montag): {...} },
// _azubiOk { planpunkt: Zeit } (schreibt nur der Ausbilder).

/** Lehrjahr aus dem Ausbildungsbeginn ('JJJJ-MM'): 1 bis 3, 0 = unbekannt */
export function lehrjahrAus(start: string | undefined, heute = new Date()): number {
  const m = /^(\d{4})-(\d{2})$/.exec(String(start || ''));
  if (!m) return 0;
  const monate = (heute.getFullYear() - Number(m[1])) * 12 + (heute.getMonth() + 1 - Number(m[2]));
  if (monate < 0) return 1;
  return Math.min(3, Math.floor(monate / 12) + 1);
}

/** Was passt zum Üben zu einem Punkt im Ausbildungsplan? Quiz (Bereich und/oder Stichwörter) und ein Spiel */
export const UEBEN: Record<string, { kat?: string; re?: RegExp; spiel?: [string, string] }> = {
  j1_hygiene: { kat: 'Arbeit & Hygiene' },
  j1_kleidung: { kat: 'Arbeit & Hygiene', re: /kleidung|schmuck|haare|hände|händ|nägel|kopfbedeckung/i },
  j1_ware: { re: /lager|kühl|haltbar|mhd|wareneingang|temperatur/i },
  j1_brote: { kat: 'Sortiment & Warenkunde', re: /brot|mehl|roggen|weizen|dinkel|sauerteig/i, spiel: ['bilderquiz', 'Welches Brot ist das?'] },
  j1_schneiden: { re: /schnittstärke|brotschneide|schneidemaschine|geschnitten|\bmm\b/i, spiel: ['schneiden', 'Schneide-Profi'] },
  j1_theke: { re: /theke|warenpräsent|auslage|einräum|schaufenster/i, spiel: ['ofen', 'Ofen-Kette'] },
  j1_bedienen: { kat: 'Service & Verkauf', re: /begrüß|freundlich|verabschied|blickkontakt|lächeln/i, spiel: ['theke', 'Theken-Simulator'] },
  j1_kasse: { re: /rückgeld|wechselgeld|bargeld|kartenzahlung|kassier|bezahl/i, spiel: ['kassenblitz', 'Kassenblitz'] },
  j1_packen: { re: /einpack|tüte|verpack/i, spiel: ['tueten', 'Tüten-Blitz'] },
  j2_gespraech: { kat: 'Service & Verkauf', spiel: ['theke-pruefung', 'Prüfungsgespräch'] },
  j2_allergene: { re: /allergen|enthält|gluten|nüsse|schalenfr|sesam|laktose|milch/i, spiel: ['allergene', 'Allergene-Training'] },
  j2_zusatz: { re: /zusatzverkauf|empfehl|anbieten|dazu passt/i, spiel: ['theke', 'Theken-Simulator'] },
  j2_alternativ: { re: /alternative|ausverkauft|stattdessen|ähnlich/i, spiel: ['alternativen', 'Alternativen-Jäger'] },
  j2_reklamation: { re: /reklam|beschwer|umtausch|unzufrieden/i, spiel: ['theke', 'Theken-Simulator'] },
  j2_snacks: { re: /auffüll|nachleg|theke|auslage/i, spiel: ['ansturm', 'Theken-Ansturm'] },
  j2_feingebaeck: { kat: 'Sortiment & Warenkunde', re: /kuchen|feingebäck|stollen|plunder|blätterteig|saison|berliner|croissant|schnecke/i },
  j2_bestellung: { re: /bestell|vorbestell|abhol/i, spiel: ['telefon', 'Telefon-Bestellung'] },
  j2_abrechnung: { re: /abrechn|kassenbestand|tagesabschluss|kassensturz|bargeld/i, spiel: ['rechnen', 'Rechen-Trainer'] },
  j3_kalkulation: { re: /grundpreis|kalkul|prozent|mehrwert|mwst|rabatt|kilopreis|pro kilo/i, spiel: ['rechnen', 'Rechen-Trainer'] },
  j3_recht: { re: /kennzeichn|lebensmittel|recht|verordnung|lmiv|zusatzstoff|deklar/i },
  j3_qualitaet: { re: /kühlkette|kühl|haltbar|qualität|kontroll|temperatur|schimmel|mhd/i },
};

/** Fragen, die zu einem Planpunkt passen */
export function fragenZuPunkt(id: string, fragen: { category?: string; question?: string; options?: string[]; correctMulti?: number[] }[]) {
  const u = UEBEN[id];
  if (!u || (!u.kat && !u.re)) return [];
  return fragen.filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2 && !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1)
    && (!u.kat || q.category === u.kat) && (!u.re || u.re.test(String(q.question))));
}

/** Schlüssel einer Woche = Montag als 'JJJJ-MM-TT' */
export const wochenKey = (montag: Date) => `${montag.getFullYear()}-${String(montag.getMonth() + 1).padStart(2, '0')}-${String(montag.getDate()).padStart(2, '0')}`;

export type BerichtNotiz = { p?: string[]; e?: string; s?: string; n?: string };

/** Was hat der Azubi in dieser Woche in der App geübt? (aus den eigenen Einträgen der Bestenliste) */
export function geuebtInWoche(scores: { id?: string; username?: string; category?: string }[], userKey: string, montag: Date): string[] {
  const von = montag.getTime(), bis = von + 7 * 86400000;
  const zaehl = new Map<string, number>();
  (scores || []).forEach((s) => {
    if (!s || String(s.username || '').toLowerCase() !== userKey) return;
    const ts = Number(String(s.id || '').split('_').pop()) || 0;
    if (ts < von || ts >= bis) return;
    const k = String(s.category || '').replace(/\s*\p{Extended_Pictographic}+/gu, '').replace(/\s*\(.*\)\s*$/, '').trim();
    if (!k || /^(Rubbellos|Glücksrad|Bonus vom Ausbilder|Lob von Kollegen|Team-Challenge)/.test(k)) return;
    zaehl.set(k, (zaehl.get(k) || 0) + 1);
  });
  return [...zaehl.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} in der Lern-Theke geübt (${n}×)`);
}
