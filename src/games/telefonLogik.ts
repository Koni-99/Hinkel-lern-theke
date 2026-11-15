// ═══ Telefon-Bestellung: Logik ═══
// Ein Kunde ruft an und bestellt für einen Abholtag. Es kommt das ganze Sortiment dran:
// Was noch nie bestellt wurde, kommt zuerst (im Gerät gemerkt), bis jeder Artikel mindestens einmal dran war.
// Backtage, Uhrzeiten (Weinstock ab 10, Landbaguette ab 11 Uhr) und Saisonware werden beachtet.
// Vier Stufen: einfach, mittel, schwer, kompliziert (Korrekturen, Dutzend, halb/halb, streichen, tauschen).
import { SHOP_PRODUCTS } from '../daten/shopProducts';

export const TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
export type Stufe = 'einfach' | 'mittel' | 'schwer' | 'kompliziert';
export const STUFEN_RUNDE: Stufe[] = ['einfach', 'mittel', 'mittel', 'schwer', 'kompliziert'];

const ALLE_TAGE = [0, 1, 2, 3, 4, 5];
/** Feste Backtage (0 = Montag … 5 = Samstag), aus den Fragen zu den Backtagen */
const BACKTAGE: Record<string, number[]> = {
  'Burgunderstuten': [4], 'Jan-Wellem Stuten': [3], 'Chia-Brot': [0], 'Harzer Nuss-Stange': [4, 5],
  'Innsbrucker Roggenlaib': [0, 2, 4], 'Kartäuser': [0, 2, 4], 'Casanova': [0, 2, 4], 'Abendschnitte': [0, 2, 4],
  'Toastbrot': [0, 4, 5], 'Reines Roggen': [1, 3], 'Buchweizenbrot': [1, 3], 'Wochenendstuten': [4, 5], 'Wunderzopf': [4, 5],
  'Kleines Vollkornschwarzbrot': [0, 1, 2, 3, 4], 'Kürbiskern-Schwarzbrot': [0, 1, 2, 3, 4],
  'Mandelhörnchen': [0, 2, 4], 'Heidesand': [0], 'Schwarz-Weiß Gebäck': [0], 'Kokosmakronen': [1, 3], 'Spritzgebäck': [1, 2, 3, 4, 5],
  'Schokoladen-Printen': [1, 3], 'Muzenmandeln': [1, 3, 5], 'Vollmilch-Nuss-Printen': [0, 2, 4],
};
/** Frühestens ab dieser Uhrzeit (Minuten) frisch */
const AB_ZEIT: Record<string, number> = { 'Weinstock': 10 * 60, 'Landbaguette': 11 * 60 };
/** Saisonware: nur in diesen Monaten (0 = Januar) */
const SAISON_GRUPPE: Record<string, number[]> = { 'Weihnachtsgebäck': [10, 11], 'Saisongebäck': [9, 10] };
const SAISON_NAME: Record<string, number[]> = { 'Grünschnabel': [9, 10], 'Kappeskopp': [9, 10] };

const PACKUNG = new Set(['Backmischung Abendschnitte', 'Butterspekulatius', 'Gewürzprinten', 'Gewürzspekulatius', 'Granola', 'Heidesand', 'Hüftgold', 'Knäckebrot', 'Kokosmakronen', 'Mandelsplitter Vollmilch', 'Mandelsplitter Zartbitter', 'Muzenmandeln', 'Paniermehl', 'Pistazien Kekse', 'Printenbruch', 'Schokoladen-Printen', 'Schwarz-Weiß Gebäck', 'Spritzgebäck', 'Stollen-Konfekt', 'Vollmilch-Nuss-Printen', 'Zimtsterne', 'Zimtmonde', 'Dinkel Hafer Cookies', 'Spitzkuchen']);
const STUECK = new Set(['Monte Christo', 'Tarte Depart', 'Spuntino Mediterano', 'Prasselkuchen', 'Düsselhappen', 'Große Schokoladenprinte', 'Nuss-Kuss']);

type Art = { name: string; group: string };
const gruppeVon = (n: string) => (SHOP_PRODUCTS.find((p) => p.name === n) || { group: '' }).group;
export const istBrot = (n: string) => ['Brot', 'Stuten & Brioche'].includes(gruppeVon(n));
const istBroetchen = (n: string) => gruppeVon(n) === 'Brötchen';

/** Alles, was man heute (in diesem Monat) bestellen kann */
export function sortiment(monat = new Date().getMonth()): Art[] {
  return SHOP_PRODUCTS.filter((p) => {
    const s = SAISON_NAME[p.name] || SAISON_GRUPPE[p.group];
    return !s || s.includes(monat);
  }).map((p) => ({ name: p.name, group: p.group }));
}
const tageVon = (n: string) => BACKTAGE[n] || ALLE_TAGE;

const zufall = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const mischen = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const zw = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** Mehrzahl, wie man sie am Telefon sagt */
export function mehrzahl(name: string): string {
  const m = name.match(/^(.*?)( (mit|ohne) .*)$/);
  if (m) return mehrzahl(m[1]) + m[2];
  if (name === 'Brötchen (Piepken)') return 'Brötchen';
  const adj = name.match(/^(Groß|Klein|Rein)es (.+)$/);
  if (adj) return `${adj[1]}e ${adj[2] === 'Roggen' ? 'Roggen' : mehrzahl(adj[2])}`;
  if (name === 'Feuriges') return 'Feurige';
  if (/(Mambolito|Casanova)$/.test(name)) return name + 's';
  if (/weckmann$/i.test(name)) return name.replace(/mann$/i, 'männer');
  if (/brezel$/i.test(name)) return name + 'n';
  if (/(ohr|laib)$/i.test(name)) return name + (/ohr$/i.test(name) ? 'en' : 'e');
  if (/brot$/i.test(name)) return name + 'e';
  if (/e$/.test(name)) return name + 'n';
  if (/(ling|ring)$/.test(name)) return name + 'e';
  if (/croissant$/i.test(name)) return name + 's';
  return name; // -chen, -er, -el, -en, Römer, Krapfen …
}
const ZAHL = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];

/** So sagt der Kunde eine Position */
function posText(name: string, n: number, opt: { geschnitten?: boolean; dutzend?: boolean } = {}): string {
  const schnitt = opt.geschnitten === undefined ? '' : opt.geschnitten ? ', geschnitten' : ', am Stück';
  if (PACKUNG.has(name)) return `${n === 1 ? 'eine Packung' : `${ZAHL[n] || n} Packungen`} ${name}`;
  if (STUECK.has(name) || gruppeVon(name) === 'Kuchen') return `${n === 1 ? 'ein Stück' : `${n} Stück`} ${name}`;
  if (n === 1) return `einmal ${name}${schnitt}`;
  if (opt.dutzend && n === 12) return `ein Dutzend ${mehrzahl(name)}${schnitt}`;
  if (opt.dutzend && n === 6) return `ein halbes Dutzend ${mehrzahl(name)}${schnitt}`;
  return `${n} ${mehrzahl(name)}${schnitt}`;
}

const STUNDE = ['zwölf', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf'];
const sw = (h: number) => STUNDE[h % 12];
/** Uhrzeit so, wie man sie sagt. Nachmittags immer eindeutig („16 Uhr“ oder „vier Uhr nachmittags“) */
export function zeitGesprochen(min: number, genau = false): string {
  const h = Math.floor(min / 60), m = min % 60;
  const tag = h >= 12 ? (h < 13 && m < 30 ? ' mittags' : ' nachmittags') : '';
  if (genau) return `um ${h} Uhr${m ? ` ${m}` : ''}`;
  if (m === 0) return h > 12 ? `um ${sw(h) === 'eins' ? 'ein' : sw(h)} Uhr${tag}` : `um ${sw(h)}${h === 12 ? ' Uhr mittags' : ''}`;
  if (m === 15) return `um Viertel nach ${sw(h)}${tag}`;
  const nach = h + 1 === 13 ? ' mittags' : h + 1 > 13 ? ' nachmittags' : '';
  if (m === 30) return `um halb ${sw(h + 1)}${nach}`;
  return `um Viertel vor ${sw(h + 1)}${nach}`;
}
export const zeitText = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')} Uhr`;
/** Auswahl auf dem Bestellzettel: 6:00 bis 18:00 Uhr in Viertelstunden */
export const ZEITEN = Array.from({ length: 49 }, (_, i) => 360 + i * 15);

export type Position = { name: string; menge: number; geschnitten?: boolean };
export type Bestellung = { name: string; tag: number; zeit: number; positionen: Position[]; text: string[]; auswahl: string[]; stufe: Stufe };

const NAMEN = ['Schmitz', 'Müller', 'Hoffmann', 'Becker', 'Wagner', 'Schulz', 'Weber', 'Klein', 'Lange', 'Krüger', 'Jansen', 'Peters', 'Kaiser', 'Hartmann', 'Vogel', 'Busch', 'Meyer', 'Schröder', 'Neumann', 'Braun', 'Zimmermann', 'Krause', 'Lehmann', 'Köhler', 'Wolff', 'Scholz', 'Möller', 'Thelen', 'Esser', 'Kremer'];
const BUCHSTABIERT: Record<string, string> = { Schmitz: 'Schmitz, mit t z am Ende.', Müller: 'Müller, mit ü.', Krüger: 'Krüger, mit ü.', Jansen: 'Jansen, mit J.', Hartmann: 'Hartmann, mit zwei n.', Meyer: 'Meyer, mit e y.', Wolff: 'Wolff, mit zwei f.', Möller: 'Möller, mit ö.', Köhler: 'Köhler, mit ö und h.', Thelen: 'Thelen, mit t h.' };

function menge(name: string, stufe: Stufe): number {
  if (PACKUNG.has(name)) return zw(1, stufe === 'einfach' || /paniermehl|knäckebrot|granola|backmischung/i.test(name) ? 2 : 3);
  if (/stollen$/i.test(name) && !/mini/i.test(name)) return zw(1, 2);
  if (istBrot(name)) return Math.random() < 0.8 ? 1 : 2;
  if (istBroetchen(name)) return zufall(stufe === 'einfach' ? [4, 5, 6, 8, 10] : [4, 5, 6, 8, 10, 12, 15, 20, 24, 30]);
  return zw(2, stufe === 'einfach' ? 4 : 8);
}

/** Nächster Artikel: zuerst noch nie bestellte, passend zu den möglichen Tagen */
function waehle(pool: Art[], schon: string[], tage: number[], gesehen: Set<string>, nur?: (a: Art) => boolean): Art | null {
  const passt = pool.filter((a) => !schon.includes(a.name) && tageVon(a.name).some((t) => tage.includes(t)) && (!nur || nur(a)));
  const neu = passt.filter((a) => !gesehen.has(a.name));
  return (neu.length ? zufall(neu) : passt.length ? zufall(passt) : null);
}

export function neueBestellung(stufe: Stufe = 'mittel', gesehen: Set<string> = new Set(), monat = new Date().getMonth()): Bestellung {
  const pool = sortiment(monat);
  const anzahl = { einfach: zw(1, 2), mittel: zw(2, 3), schwer: zw(3, 4), kompliziert: zw(4, 5) }[stufe];
  const positionen: Position[] = [];
  let tage = [...ALLE_TAGE];
  const nimm = (a: Art | null) => {
    if (!a) return;
    tage = tage.filter((t) => tageVon(a.name).includes(t));
    positionen.push({ name: a.name, menge: menge(a.name, stufe), ...(istBrot(a.name) && stufe !== 'einfach' ? { geschnitten: Math.random() < 0.6 } : {}) });
  };
  while (positionen.length < anzahl) {
    const vorher = positionen.length;
    // höchstens 2 Brote pro Bestellung, sonst wird es unrealistisch
    const brote = positionen.filter((p) => istBrot(p.name)).length;
    nimm(waehle(pool, positionen.map((p) => p.name), tage, gesehen, (a) => brote < 2 || !istBrot(a.name)));
    if (positionen.length === vorher) break;
  }
  const name = zufall(NAMEN);
  let tag = zufall(tage.length ? tage : ALLE_TAGE);
  const frueh = Math.max(7 * 60, ...positionen.map((p) => AB_ZEIT[p.name] || 0));
  const spaet = tag === 5 ? 15 * 60 : 17 * 60 + 30;
  const zeiten = ZEITEN.filter((z) => z >= frueh && z <= spaet && (stufe !== 'einfach' || z % 60 === 0));
  const zeit = zufall(zeiten.length ? zeiten : [frueh]);

  // ── Was der Kunde sagt ──
  const nebenbei: string[] = []; // genannt, aber am Ende nicht bestellt (für den Zettel)
  const liste: string[] = positionen.map((p) => posText(p.name, p.menge, { geschnitten: p.geschnitten, dutzend: stufe === 'kompliziert' }));
  const extra: string[] = [];
  let tagGesagt = tag;
  if (stufe === 'schwer' || stufe === 'kompliziert') {
    const moeglich = ['menge', ...(stufe === 'kompliziert' ? ['tag', 'streichen', 'tauschen', 'halb'] : [])];
    let tricks = mischen(moeglich).slice(0, stufe === 'kompliziert' ? 2 : 1);
    // Menge ändern und Sorte tauschen nicht zusammen (sonst passt der Satz nicht mehr)
    if (tricks.includes('menge') && tricks.includes('tauschen')) tricks = tricks.map((t) => (t === 'tauschen' ? 'tag' : t));
    for (const t of tricks) {
      if (t === 'menge') {
        const i = positionen.findIndex((p) => istBroetchen(p.name) || (!istBrot(p.name) && !PACKUNG.has(p.name) && p.menge > 1));
        if (i < 0) continue;
        const p = positionen[i], alt = p.menge;
        p.menge = alt + zufall([-2, 2, 4, 6].filter((d) => alt + d > 0));
        liste[i] = posText(p.name, alt, { geschnitten: p.geschnitten });
        extra.push(`Ach nee, warten Sie, bei ${STUECK.has(p.name) || gruppeVon(p.name) === 'Kuchen' ? `dem ${p.name}` : `den ${mehrzahl(p.name)}`}: machen Sie lieber ${p.menge}.`);
      } else if (t === 'tag') {
        const andere = tage.filter((x) => x !== tag);
        if (!andere.length) continue;
        tagGesagt = zufall(andere); // erst falscher Tag, dann korrigiert auf „tag“
        extra.push(`Oh, Moment, ich hab mich vertan: nicht ${TAGE[tagGesagt]}, sondern ${TAGE[tag]}.`);
      } else if (t === 'streichen') {
        const a = waehle(pool, [...positionen.map((p) => p.name), ...nebenbei], [tag], gesehen, (x) => !istBrot(x.name));
        if (!a) continue;
        nebenbei.push(a.name);
        liste.push(posText(a.name, menge(a.name, stufe)));
        extra.push(`Und ${PACKUNG.has(a.name) ? `die ${a.name}` : STUECK.has(a.name) || gruppeVon(a.name) === 'Kuchen' ? `den ${a.name}` : `die ${mehrzahl(a.name)}`} streichen Sie bitte wieder, die brauchen wir doch nicht.`);
      } else if (t === 'tauschen') {
        const i = positionen.findIndex((p) => istBroetchen(p.name));
        if (i < 0) continue;
        const neu = waehle(pool, [...positionen.map((p) => p.name), ...nebenbei], [tag], gesehen, (x) => istBroetchen(x.name));
        if (!neu) continue;
        const alt = positionen[i].name;
        nebenbei.push(alt);
        positionen[i] = { ...positionen[i], name: neu.name };
        extra.push(`Ach, statt der ${mehrzahl(alt)} nehm ich doch lieber ${mehrzahl(neu.name)}, gleiche Menge.`);
      } else if (t === 'halb') {
        const sorten = pool.filter((a) => /brötchen$/i.test(a.name) && a.name !== 'Brötchen (Piepken)' && !positionen.some((p) => p.name === a.name) && !nebenbei.includes(a.name));
        if (sorten.length < 2) continue;
        const [a, b] = mischen(sorten).slice(0, 2);
        const n = zufall([6, 8, 10, 12, 20]);
        positionen.push({ name: a.name, menge: n / 2 }, { name: b.name, menge: n / 2 });
        const kurz = (x: string) => x.replace(/brötchen$/i, '');
        liste.push(`${n} Brötchen, halb ${kurz(a.name)}, halb ${kurz(b.name)}`);
      }
    }
  }
  const und = (a: string[]) => (a.length > 1 ? `${a.slice(0, -1).join(', ')}${a[a.length - 2].includes(',') ? ',' : ''} und ${a[a.length - 1]}` : a[0]);
  const fuer = zufall([`für ${TAGE[tagGesagt]}`, `für ${TAGE[tagGesagt]}, bitte`, `für diesen ${TAGE[tagGesagt]}`]);
  const zeitSatz = zeitGesprochen(zeit, stufe === 'einfach' && Math.random() < 0.5);
  const text = [
    zufall([`Ja, hallo, hier ist ${name}.`, `Guten Tag, ${name} hier.`, `Hallo, mein Name ist ${name}.`, `Guten Morgen, hier spricht ${name}.`]) + ' ' + zufall([`Ich würde gern was bestellen, ${fuer}.`, `Ich möchte was vorbestellen, ${fuer}.`, `Kann ich bei Ihnen was vorbestellen? ${fuer.charAt(0).toUpperCase() + fuer.slice(1)}.`]),
    stufe === 'einfach' ? `Ich hätte gern ${und(liste)}.` : `Und zwar ${und(liste)}.`,
    ...extra,
    zufall([`Ich hol das dann ${zeitSatz} ab.`, `Abholen komm ich so ${zeitSatz}.`, `Ich bin dann ${zeitSatz} da.`]),
    ...(BUCHSTABIERT[name] && stufe !== 'einfach' && Math.random() < 0.7 ? [`Der Name war ${BUCHSTABIERT[name]}`] : []),
    zufall(['Danke, bis dann!', 'Super, vielen Dank. Tschüss!', 'Danke schön, auf Wiederhören!', 'Prima, danke, bis dann!']),
  ];
  // Auf dem Zettel: bestellte Ware, genannte, aber nicht bestellte, und ähnliche Ware
  const bestellt = positionen.map((p) => p.name);
  const gruppen = new Set(positionen.map((p) => gruppeVon(p.name)));
  const ziel = Math.max(8, bestellt.length + nebenbei.length + 3);
  const aehnlich = mischen(pool.filter((a) => !bestellt.includes(a.name) && !nebenbei.includes(a.name) && gruppen.has(a.group)));
  const sonst = mischen(pool.filter((a) => !bestellt.includes(a.name) && !nebenbei.includes(a.name) && !gruppen.has(a.group)));
  const andere = [...aehnlich, ...sonst].slice(0, ziel - bestellt.length - nebenbei.length).map((a) => a.name);
  return { name, tag, zeit, positionen, text, auswahl: mischen([...bestellt, ...nebenbei, ...andere]), stufe };
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

// ── Welche Artikel schon einmal bestellt wurden (im Gerät) ──
const GESEHEN = 'lt_telefon_gesehen';
export function gesehenLesen(): Set<string> { try { return new Set(JSON.parse(localStorage.getItem(GESEHEN) || '[]')); } catch { return new Set(); } }
export function gesehenMerken(namen: string[]): Set<string> {
  const s = gesehenLesen(); namen.forEach((n) => s.add(n));
  // Alles einmal dran gewesen? Dann von vorn, damit es weiter abwechslungsreich bleibt
  const alle = sortiment().map((a) => a.name);
  const fertig = alle.every((n) => s.has(n));
  const neu = fertig ? new Set<string>() : s;
  try { localStorage.setItem(GESEHEN, JSON.stringify([...neu])); } catch {}
  return neu;
}
