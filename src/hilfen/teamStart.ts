// ═══ Version 260: Start-Übersicht und Wochen-Rückblick für den Ausbilder ═══
// Nur Lesen aus vorhandenen Daten. Neu gespeichert wird nur im eigenen Fortschritt der Mitarbeiter:
// _seit (Tag der ersten Anmeldung) und _handy (App läuft als App auf dem Handy).

import { urlaubsTage } from './urlaub';

type Prog = Record<string, any>;

const tagKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const tageVon = (p: Prog | undefined): string[] => (Array.isArray(p?._days) ? p!._days.filter((x: any) => typeof x === 'string') : []);

export type StartZeile = {
  key: string;
  /** Tag der ersten Anmeldung (oder erster Lerntag bei alten Konten), '' = unbekannt */
  seit: string;
  rolle: boolean;
  einfuehrung: boolean;
  pin: boolean;
  handy: boolean;
  lerntage: number;
  /** Noch gar nicht richtig losgelegt: keine Rolle oder kein Lerntag */
  offen: boolean;
};

/** Stand jedes Mitarbeiters beim Start: angemeldet seit, Rolle, Einführung, PIN, App aufs Handy, gelernt */
export function startStand(progress: Record<string, Prog>, pins: Record<string, any> | undefined, keys: string[]): StartZeile[] {
  return keys.map((key) => {
    const p = progress[key] || {};
    const tage = tageVon(p);
    const seit = typeof p._seit === 'string' ? p._seit : ([...tage].sort()[0] || '');
    const z: StartZeile = {
      key, seit,
      rolle: !!p._role,
      einfuehrung: !!p._intro || tage.length >= 3,
      pin: !!(pins && pins[key] && pins[key].h),
      handy: !!p._handy,
      lerntage: tage.length,
      offen: false,
    };
    z.offen = !z.rolle || z.lerntage === 0;
    return z;
  }).sort((a, b) => Number(b.offen) - Number(a.offen) || (b.seit || '0').localeCompare(a.seit || '0'));
}

/** Montag der Woche, in der „jetzt“ liegt (0 Uhr) */
export const montagVon = (jetzt: Date) => { const d = new Date(jetzt); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };

/** Datum aus „02.11.26, 07:34“ */
const scoreTag = (txt?: string): string => {
  const m = (txt || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!m) return '';
  const y = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
  return tagKey(new Date(y, Number(m[2]) - 1, Number(m[1])));
};

export type Rueckblick = {
  /** Montag der letzten Woche als 'JJJJ-MM-TT' (dient auch als Merker) */
  woche: string;
  von: string;
  bis: string;
  gelernt: string[];
  nicht: string[];
  punkte: number;
  lerntage: number;
  top: { key: string; tage: number; punkte: number }[];
  neu: string[];
  /** Nicht gelernt, aber in der Woche im Urlaub */
  urlaub: string[];
};

/** Rückblick auf die letzte ganze Woche (Montag bis Sonntag vor der aktuellen Woche) */
export function wochenRueckblick(progress: Record<string, Prog>, scores: any[], keys: string[], jetzt = new Date()): Rueckblick {
  const mo = montagVon(jetzt); mo.setDate(mo.getDate() - 7);
  const tage = Array.from({ length: 7 }, (_, i) => { const d = new Date(mo); d.setDate(mo.getDate() + i); return tagKey(d); });
  const inWoche = new Set(tage);
  const punkteVon: Record<string, number> = {};
  (scores || []).forEach((s) => {
    const k = String(s?.username || '').toLowerCase();
    if (!k || !inWoche.has(scoreTag(s?.date))) return;
    punkteVon[k] = (punkteVon[k] || 0) + (Number(s.score) || 0);
  });
  const zeilen = keys.map((key) => ({ key, tage: tageVon(progress[key]).filter((t) => inWoche.has(t)).length, punkte: punkteVon[key] || 0 }));
  const imUrlaub = (key: string) => urlaubsTage(progress[key]).some((t) => inWoche.has(t));
  const gelernt = zeilen.filter((z) => z.tage > 0 || z.punkte > 0);
  const neu = keys.filter((key) => { const p = progress[key] || {}; const s = typeof p._seit === 'string' ? p._seit : ''; return s && inWoche.has(s); });
  return {
    woche: tage[0],
    von: tage[0],
    bis: tage[6],
    gelernt: gelernt.map((z) => z.key),
    nicht: zeilen.filter((z) => z.tage === 0 && z.punkte === 0 && !imUrlaub(z.key)).map((z) => z.key),
    urlaub: zeilen.filter((z) => z.tage === 0 && z.punkte === 0 && imUrlaub(z.key)).map((z) => z.key),
    punkte: zeilen.reduce((s, z) => s + z.punkte, 0),
    lerntage: zeilen.reduce((s, z) => s + z.tage, 0),
    top: [...gelernt].sort((a, b) => b.tage - a.tage || b.punkte - a.punkte).slice(0, 3),
    neu,
  };
}

/** „2 Tage, 340 Punkte“ (ohne Lerntag nur die Punkte) */
export const fleissText = (t: { tage: number; punkte: number }) => [t.tage ? `${t.tage} ${t.tage === 1 ? 'Tag' : 'Tage'}` : '', t.punkte ? `${t.punkte.toLocaleString('de-DE')} Punkte` : ''].filter(Boolean).join(', ');

/** Text zum Kopieren (z. B. für WhatsApp oder die Teambesprechung) */
export function rueckblickText(r: Rueckblick, nameOf: (k: string) => string, alle: number): string {
  const d = (t: string) => t.split('-').reverse().slice(0, 2).join('.') + '.';
  const zeilen = [
    `Lern-Theke: Rückblick ${d(r.von)} bis ${d(r.bis)}`,
    `${r.gelernt.length} von ${alle} haben gelernt, zusammen ${r.punkte.toLocaleString('de-DE')} Punkte an ${r.lerntage} Lerntagen.`,
  ];
  if (r.top.length) zeilen.push(`Am fleißigsten: ${r.top.map((t) => `${nameOf(t.key)} (${fleissText(t)})`).join(', ')}`);
  if (r.neu.length) zeilen.push(`Neu dabei: ${r.neu.map(nameOf).join(', ')}`);
  if (r.nicht.length) zeilen.push(`Nicht gelernt: ${r.nicht.map(nameOf).join(', ')}`);
  if (r.urlaub.length) zeilen.push(`Im Urlaub: ${r.urlaub.map(nameOf).join(', ')}`);
  return zeilen.join('\n');
}

export const heuteKey = () => tagKey(new Date());
