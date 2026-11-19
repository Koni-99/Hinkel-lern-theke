// ═══ Version 253: Prüfungs-Auswertung nach Themen ═══
// Prüfungsfragen haben kein Thema, darum ordnet die App sie über Stichwörter in der Frage zu (erste passende Gruppe gewinnt).

export const THEMEN: { name: string; re: RegExp }[] = [
  { name: 'Rechnen und Kalkulation', re: /fachrechn|dreisatz|mehrwert|mwst|umsatzsteuer|kalkul|rabatt|grundpreis|\d+[,.]\d\d\s*€|kilopreis|kosten|gewinn|umsatz/i },
  { name: 'Hygiene und Lebensmittelrecht', re: /hygien|laktose|unverträglich|haccp|infektion|kühl|mhd|haltbar|kennzeichn|allergen|lebensmittelverderb|verderb|keim|bakter|reinig|schädling|desinfekt|lmiv|zusatzstoff|preisangabe|verordnung/i },
  { name: 'Arbeit, Recht und Wirtschaft', re: /lohn|sicherheitszeichen|gebotszeichen|lösch|fettbrand|feuer|sozialversich|versicherung|steuer|vertrag|urlaub|kündig|arbeitszeit|ausbildung|berufsschul|jugendarbeitsschutz|betriebsrat|gewerkschaft|unfall|arbeitsschutz|probezeit/i },
  { name: 'Verkauf und Beratung', re: /kund|verkauf|beratung|reklam|gespräch|präsent|werbung|schaufenster|bedien|einwand|zusatzverkauf|kasse|geldschein|bon\b|retoure|filiale/i },
  { name: 'Warenkunde', re: /mehl|teig|brot|getreide|back|sauerteig|gebäck|hefe|zutat|roggen|weizen|dinkel|kuchen|stollen|lagerung|grünkern|masse|korn|marzipan|persipan|ölsaat|kakao|kuvertüre|schokolade|lebensmittel/i },
];
export const SONST = 'Weitere Themen';

export const pruefungsThema = (q: { question?: string }) => (THEMEN.find((t) => t.re.test(String(q.question || ''))) || { name: SONST }).name;

/** Richtig/gesamt pro Thema, schwächstes zuerst */
export function themenAuswertung(fragen: { id?: number; question?: string }[], falschIds: Set<number | undefined>) {
  const m = new Map<string, { richtig: number; gesamt: number }>();
  fragen.forEach((q) => { const t = pruefungsThema(q); const e = m.get(t) || { richtig: 0, gesamt: 0 }; e.gesamt++; if (!falschIds.has(q.id)) e.richtig++; m.set(t, e); });
  return [...m.entries()].map(([thema, e]) => ({ thema, ...e, pct: Math.round((e.richtig / e.gesamt) * 100) })).sort((a, b) => a.pct - b.pct || b.gesamt - a.gesamt);
}
