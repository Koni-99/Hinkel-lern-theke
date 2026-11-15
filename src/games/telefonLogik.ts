// ═══ Telefon-Bestellung: Logik ═══
// Ein Kunde ruft an und bestellt für einen Abholtag. Nur Ware, die es jeden Tag gibt
// (keine Saisonware, keine Brote mit festen Backtagen), damit die Bestellung immer möglich ist.
import { SHOP_PRODUCTS } from '../daten/shopProducts';

export const TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

/** Brote, die es an allen Tagen gibt (Brote mit festen Backtagen bewusst nicht) */
const BROT_NAMEN = ['Münsterländer', 'Schweizer', 'Großes Schwarzwälder', 'Kleines Schwarzwälder', 'Feinbrot', 'Mehrkornbrot', 'Sonnenblumenbrot', 'Französisches Landbrot', 'Dinkeltraum', 'Spezialbrot', 'Elsässer', 'Oberländer'];
const GEBAECK_NAMEN = ['Berliner', 'Butter-Croissant', 'Schoko-Croissant', 'Apfeltasche', 'Puddingbrezel', 'Mohnschnecke', 'Rosinenschnecke', 'Butterkuchen', 'Streuselkuchen'];
const da = (n: string) => SHOP_PRODUCTS.some((p) => p.name === n);
export const BROTE = BROT_NAMEN.filter(da);
export const BROETCHEN = SHOP_PRODUCTS.filter((p) => p.group === 'Brötchen').map((p) => p.name);
export const GEBAECK = GEBAECK_NAMEN.filter(da);
const istKuchen = (n: string) => /kuchen$/i.test(n);
export const istBrot = (n: string) => BROTE.includes(n);

const NAMEN = ['Schmitz', 'Müller', 'Hoffmann', 'Becker', 'Wagner', 'Schulz', 'Weber', 'Klein', 'Lange', 'Krüger', 'Jansen', 'Peters', 'Kaiser', 'Hartmann', 'Vogel', 'Busch'];
const BUCHSTABIERT: Record<string, string> = { Schmitz: 'Schmitz, mit t z am Ende.', Müller: 'Müller, mit ü.', Krüger: 'Krüger, mit ü.', Jansen: 'Jansen, mit J.', Hartmann: 'Hartmann, mit zwei n.' };

const zufall = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const mischen = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Mehrzahl, wie man sie am Telefon sagt */
export function mehrzahl(name: string, n: number): string {
  if (name === 'Brötchen (Piepken)') return n === 1 ? 'Brötchen' : 'Brötchen';
  if (n === 1) return name;
  if (/(stange|tasche|schnecke|brezel)$/i.test(name)) return name + 'n';
  if (/ling$/i.test(name)) return name + 'e';
  if (/croissant$/i.test(name)) return name + 's';
  return name;
}
const zahlwort = (n: number) => (n === 1 ? 'ein' : n === 2 ? 'zwei' : String(n));
function posText(name: string, n: number, geschnitten?: boolean): string {
  if (istKuchen(name)) return `${zahlwort(n) === 'ein' ? 'ein' : zahlwort(n)} Stück ${name}`;
  if (istBrot(name)) return `${n === 1 ? 'ein' : zahlwort(n)} ${name}${geschnitten === undefined ? '' : geschnitten ? (n === 1 ? ', das bitte geschnitten' : ', bitte geschnitten') : ', am Stück'}`;
  return `${zahlwort(n)} ${mehrzahl(name, n)}`;
}

const STUNDE = ['zwölf', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf'];
const sw = (h: number) => STUNDE[h % 12];
/** Uhrzeit (Minuten seit Mitternacht) so, wie man sie sagt: „halb neun“, „Viertel nach zehn“ */
export function zeitGesprochen(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  if (m === 0) return `um ${sw(h)}`;
  if (m === 15) return `um Viertel nach ${sw(h)}`;
  if (m === 30) return `um halb ${sw(h + 1)}`;
  return `um Viertel vor ${sw(h + 1)}`;
}
export const zeitText = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')} Uhr`;
/** Auswahl auf dem Bestellzettel: 6:00 bis 18:00 Uhr in Viertelstunden */
export const ZEITEN = Array.from({ length: 49 }, (_, i) => 360 + i * 15);

export type Position = { name: string; menge: number; geschnitten?: boolean };
export type Bestellung = { name: string; tag: number; zeit: number; positionen: Position[]; text: string[]; auswahl: string[] };

export function neueBestellung(): Bestellung {
  const name = zufall(NAMEN);
  const tag = Math.floor(Math.random() * 6);
  const bis = tag === 5 ? 15 * 60 : 17 * 60; // samstags früher zu
  const zeit = zufall(ZEITEN.filter((z) => z >= 7 * 60 && z <= bis));
  const positionen: Position[] = [{ name: zufall(BROETCHEN), menge: zufall([6, 8, 10, 12, 15, 20, 24, 30]) }];
  if (Math.random() < 0.6) { const b = zufall(BROETCHEN.filter((x) => x !== positionen[0].name)); positionen.push({ name: b, menge: zufall([4, 5, 6, 8, 10]) }); }
  if (Math.random() < 0.7) positionen.push({ name: zufall(BROTE), menge: Math.random() < 0.8 ? 1 : 2, geschnitten: Math.random() < 0.6 });
  if (Math.random() < 0.4) positionen.push({ name: zufall(GEBAECK), menge: zufall([2, 3, 4, 5, 6]) });

  // Was der Kunde sagt (manchmal korrigiert er sich, wie am echten Telefon)
  const korrektur = Math.random() < 0.3 ? 0 : -1;
  let alteMenge = 0;
  if (korrektur === 0) { alteMenge = positionen[0].menge; positionen[0].menge = zufall([6, 8, 10, 12, 15, 20, 24, 30].filter((x) => x !== alteMenge)); }
  const liste = positionen.map((p, i) => posText(p.name, i === korrektur ? alteMenge : p.menge, p.geschnitten));
  const und = (a: string[]) => (a.length > 1 ? `${a.slice(0, -1).join(', ')}${a[a.length - 2].includes(',') ? ',' : ''} und ${a[a.length - 1]}` : a[0]);
  const tagSatz = zufall([`für ${TAGE[tag]}`, `für ${TAGE[tag]}, bitte`, `für diesen ${TAGE[tag]}`]);
  const text = [
    zufall([`Ja, hallo, hier ist ${name}.`, `Guten Tag, ${name} hier.`, `Hallo, mein Name ist ${name}.`]) + ' ' + zufall([`Ich würde gern was bestellen, ${tagSatz}.`, `Ich möchte was vorbestellen, ${tagSatz}.`]),
    `Und zwar ${und(liste)}.`,
    ...(korrektur === 0 ? [`Ach nee, warten Sie, bei den ${mehrzahl(positionen[0].name, 2)}: machen Sie lieber ${positionen[0].menge}.`] : []),
    zufall([`Ich hol das dann ${zeitGesprochen(zeit)} ab.`, `Abholen komm ich so ${zeitGesprochen(zeit)}.`, `Ich bin dann ${zeitGesprochen(zeit)} da.`]),
    ...(BUCHSTABIERT[name] && Math.random() < 0.7 ? [`Der Name war ${BUCHSTABIERT[name]}`] : []),
    zufall(['Danke, bis dann!', 'Super, vielen Dank. Tschüss!', 'Danke schön, auf Wiederhören!']),
  ];
  // Auf dem Bestellzettel: bestellte Ware plus ähnliche, nicht bestellte
  const bestellt = positionen.map((p) => p.name);
  const andere = mischen([...BROETCHEN, ...BROTE, ...GEBAECK].filter((n) => !bestellt.includes(n))).slice(0, 8 - bestellt.length);
  const auswahl = mischen([...bestellt, ...andere]);
  return { name, tag, zeit, positionen, text, auswahl };
}

/** Namen tolerant vergleichen: Groß/klein egal, ü = ue, ein Tippfehler erlaubt */
const normal = (s: string) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z]/g, '');
function abstand(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export const nameStimmt = (eingabe: string, richtig: string) => { const a = normal(eingabe), b = normal(richtig); return !!a && (a === b || abstand(a, b) <= 1); };

export type Zettel = { name: string; tag: number | null; zeit: number | null; mengen: Record<string, number>; geschnitten: Record<string, boolean> };
export type Pruefung = { zeile: string; richtig: string; deins: string; ok: boolean }[];

export function pruefe(b: Bestellung, z: Zettel): Pruefung {
  const out: Pruefung = [];
  out.push({ zeile: 'Name', richtig: b.name, deins: z.name.trim() || 'leer', ok: nameStimmt(z.name, b.name) });
  out.push({ zeile: 'Abholtag', richtig: TAGE[b.tag], deins: z.tag === null ? 'leer' : TAGE[z.tag], ok: z.tag === b.tag });
  out.push({ zeile: 'Uhrzeit', richtig: zeitText(b.zeit), deins: z.zeit === null ? 'leer' : zeitText(z.zeit), ok: z.zeit === b.zeit });
  for (const p of b.positionen) {
    const n = z.mengen[p.name] || 0;
    out.push({ zeile: p.name, richtig: `${p.menge}×`, deins: n ? `${n}×` : 'fehlt', ok: n === p.menge });
    if (p.geschnitten !== undefined) out.push({ zeile: `${p.name}: geschnitten?`, richtig: p.geschnitten ? 'ja' : 'nein, am Stück', deins: z.geschnitten[p.name] ? 'ja' : 'nein, am Stück', ok: !!z.geschnitten[p.name] === p.geschnitten });
  }
  for (const [name, n] of Object.entries(z.mengen)) {
    if (n > 0 && !b.positionen.some((p) => p.name === name)) out.push({ zeile: name, richtig: 'nicht bestellt', deins: `${n}×`, ok: false });
  }
  return out;
}
