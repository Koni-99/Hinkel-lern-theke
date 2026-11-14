// ═══ „Mein Monat“: persönliche Monatsübersicht ═══
// Rechnet nur aus Daten, die es schon gibt: Punkte (scores), Lerntage (_days) und einem Monats-Stand
// der gemeisterten Fragen (_monatSnap im eigenen Fortschritt, wird am Monatsanfang gemerkt).
import { scoreMonth, monthTotals, monthKeyOf, prevMonthKey } from '../ui/kalender';
import { scoreDay } from '../ui/kalender';
import { cleanCat } from '../basis/serie';

export type MonatSnap = { mo: string; m: number; vorher?: { mo: string; von: number; bis: number } };

/** Monats-Stand neu setzen, wenn ein neuer Monat begonnen hat (sonst null = nichts zu tun) */
export function neuerMonatSnap(alt: MonatSnap | undefined, gemeistert: number, jetzt = new Date()): MonatSnap | null {
  const mo = monthKeyOf(jetzt);
  if (alt && alt.mo === mo) return null;
  const snap: MonatSnap = { mo, m: gemeistert };
  // Nur wenn der alte Stand genau vom Vormonat ist, kann man „im letzten Monat gemeistert“ ausrechnen
  if (alt && typeof alt.m === 'number' && alt.mo === prevMonthKey(jetzt)) snap.vorher = { mo: alt.mo, von: alt.m, bis: gemeistert };
  return snap;
}

export type MonatsDaten = {
  mo: string;
  punkte: number;
  punkteVormonat: number;
  platz: number | null;
  mitspieler: number;
  lerntage: number;
  runden: number;
  lieblingsSpiel: string;
  besterTag: { tag: string; punkte: number } | null;
  neuGemeistert: number | null;
};

export function monatsDaten(opts: {
  mo: string; ich: string; scores: any[]; tage: string[]; snap?: MonatSnap; gemeistertJetzt: number;
}): MonatsDaten {
  const { mo, ich, scores, tage, snap, gemeistertJetzt } = opts;
  const summen = monthTotals(scores as any);
  const imMonat = summen[mo] || {};
  const vorMo = (() => { const [y, m] = mo.split('-').map(Number); return monthKeyOf(new Date(y, m - 2, 1)); })();
  const liste = Object.entries(imMonat).sort((a, b) => b[1] - a[1]);
  const idx = liste.findIndex(([k]) => k === ich);
  const meine = (scores || []).filter((s) => s && s.username?.toLowerCase() === ich && scoreMonth(s.date) === mo);
  const runden: Record<string, number> = {};
  const proTag: Record<string, number> = {};
  meine.forEach((s) => {
    const c = cleanCat(String(s.category || 'Quiz').replace(/:.*$/, '')) || 'Quiz';
    if (s.category === 'Bonus vom Ausbilder') return; // geschenkte Punkte zählen hier nicht (wie bei der Monatswertung)
    runden[c] = (runden[c] || 0) + (Number(s.n) || 1);
    const t = scoreDay(s.date); if (t) proTag[t] = (proTag[t] || 0) + (Number(s.score) || 0);
  });
  const lieblings = Object.entries(runden).sort((a, b) => b[1] - a[1])[0];
  const bester = Object.entries(proTag).sort((a, b) => b[1] - a[1])[0];
  let neu: number | null = null;
  if (snap && snap.mo === mo) neu = Math.max(0, gemeistertJetzt - snap.m);
  else if (snap?.vorher && snap.vorher.mo === mo) neu = Math.max(0, snap.vorher.bis - snap.vorher.von);
  return {
    mo,
    punkte: imMonat[ich] || 0,
    punkteVormonat: (summen[vorMo] || {})[ich] || 0,
    platz: idx >= 0 ? idx + 1 : null,
    mitspieler: liste.length,
    lerntage: (tage || []).filter((d) => String(d).startsWith(mo)).length,
    runden: Object.values(runden).reduce((a, b) => a + b, 0),
    lieblingsSpiel: lieblings ? lieblings[0] : '',
    besterTag: bester && bester[1] > 0 ? { tag: bester[0], punkte: bester[1] } : null,
    neuGemeistert: neu,
  };
}
