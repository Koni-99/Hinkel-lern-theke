// ═══ Laden: Trinkgeld-Laden, Schatzkammer, Preise, Namensfarben ═══
// Vorher in appBasis.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, useId } from 'react';
import { TH } from '../ui/basis';
import { LT } from './marke';
import { LtIcon, ICON } from './symbole';
import { useCountUp } from './serie';

/** Einfaches Linien-Symbol (statt Emojis) */
// ── Trinkgeld-Laden: Preise in Cent ──
export type ShopItem = { id: string; kind: 'avatar' | 'title' | 'joker' | 'theme' | 'effect' | 'schrift' | 'jubel' | 'haustier' | 'teigihut' | 'teigiglas' | 'teigitanz'; label: string; icon: string; price: number; desc?: string; months?: number[]; woche?: boolean };
export type AnlegeArt = 'avatar' | 'title' | 'theme' | 'effect' | 'schrift' | 'jubel' | 'teigihut' | 'teigiglas' | 'teigitanz';

export const TIP_DAY_CAP = 600;

 // höchstens 6 € Trinkgeld pro Tag, damit niemand alles auf einmal kauft
export const TIP_SHOP: ShopItem[] = [
  { id: 'a_brot', kind: 'avatar', icon: '🍞', label: 'Brotlaib', price: 250 },
  { id: 'a_brezel', kind: 'avatar', icon: '🥨', label: 'Brezel', price: 250 },
  { id: 'a_croissant', kind: 'avatar', icon: '🥐', label: 'Croissant', price: 400 },
  { id: 'a_baguette', kind: 'avatar', icon: '🥖', label: 'Baguette', price: 400 },
  { id: 'a_keks', kind: 'avatar', icon: '🍪', label: 'Keks', price: 500 },
  { id: 'a_muffin', kind: 'avatar', icon: '🧁', label: 'Muffin', price: 500 },
  { id: 'a_kuchen', kind: 'avatar', icon: '🍰', label: 'Kuchenstück', price: 750 },
  { id: 'a_kaffee', kind: 'avatar', icon: '🥧', label: 'Obstkuchen', price: 750 },
  // Version 226: Torte ersetzt (Hinkel verkauft keine Torten). Wer sie gekauft hat, behält sein altes Zeichen.
  { id: 'a_torte', kind: 'avatar', icon: '🍩', label: 'Berliner', price: 1250 },
  { id: 'a_aehre', kind: 'avatar', icon: '🌾', label: 'Ähre', price: 300 },
  { id: 'a_apfel', kind: 'avatar', icon: '🍎', label: 'Apfel', price: 300 },
  { id: 'a_butter', kind: 'avatar', icon: '🧈', label: 'Butter', price: 350 },
  { id: 'a_kirsche', kind: 'avatar', icon: '🍒', label: 'Kirsche', price: 350 },
  { id: 'a_nuss', kind: 'avatar', icon: '🌰', label: 'Haselnuss', price: 400 },
  { id: 'a_honig', kind: 'avatar', icon: '🍯', label: 'Honig', price: 450 },
  { id: 'a_schoko', kind: 'avatar', icon: '🍫', label: 'Schokolade', price: 450 },
  { id: 'a_kueken', kind: 'avatar', icon: '🐥', label: 'Hinkel-Küken', price: 1800 },
  { id: 'a_koch', kind: 'avatar', icon: '🧑‍🍳', label: 'Bäckermütze', price: 1500 },
  { id: 'a_stern', kind: 'avatar', icon: '🌟', label: 'Goldstern', price: 2000 },
  { id: 'a_krone', kind: 'avatar', icon: '👑', label: 'Krone', price: 2500 },
  { id: 's_schnee', kind: 'avatar', icon: '⛄', label: 'Schneemann', price: 600, months: [1, 2] },
  { id: 's_hase', kind: 'avatar', icon: '🐰', label: 'Osterhase', price: 600, months: [3, 4] },
  { id: 's_erdbeere', kind: 'avatar', icon: '🍓', label: 'Erdbeere', price: 600, months: [5, 6] },
  { id: 's_sonne', kind: 'avatar', icon: '☀️', label: 'Sommersonne', price: 600, months: [7, 8] },
  { id: 's_blatt', kind: 'avatar', icon: '🍂', label: 'Herbstblatt', price: 600, months: [9] },
  { id: 's_kuerbis', kind: 'avatar', icon: '🎃', label: 'Kürbis', price: 600, months: [10] },
  { id: 's_laterne', kind: 'avatar', icon: '🏮', label: 'Laterne', price: 600, months: [11] },
  { id: 's_baum', kind: 'avatar', icon: '🎄', label: 'Tannenbaum', price: 600, months: [12] },
  { id: 's_feuerwerk', kind: 'avatar', icon: '🎆', label: 'Silvester', price: 600, months: [12, 1] },
  { id: 's_herz', kind: 'avatar', icon: '💝', label: 'Herzchen', price: 600, months: [2] },
  { id: 's_klee', kind: 'avatar', icon: '🍀', label: 'Glücksklee', price: 600, months: [3] },
  { id: 's_tulpe', kind: 'avatar', icon: '🌷', label: 'Tulpe', price: 600, months: [4, 5] },
  { id: 's_sonnenblume', kind: 'avatar', icon: '🌻', label: 'Sonnenblume', price: 600, months: [6, 7, 8] },
  { id: 's_zimtstern', kind: 'avatar', icon: '⭐', label: 'Zimtstern', price: 600, months: [11, 12] },
  { id: 's_nikolaus', kind: 'avatar', icon: '🎅', label: 'Nikolaus', price: 600, months: [12] },
  { id: 't_bote', kind: 'title', icon: '🏷️', label: 'Brötchen-Bote', price: 400 },
  { id: 't_talent', kind: 'title', icon: '🏷️', label: 'Theken-Talent', price: 600 },
  { id: 't_brezel', kind: 'title', icon: '🏷️', label: 'Brezel-Profi', price: 1000 },
  { id: 't_kasse', kind: 'title', icon: '🏷️', label: 'Kassen-Ass', price: 1250 },
  { id: 't_liebling', kind: 'title', icon: '🏷️', label: 'Kundenliebling', price: 2000 },
  { id: 't_legende', kind: 'title', icon: '🏷️', label: 'Theken-Legende', price: 3000 },
  { id: 't_frueh', kind: 'title', icon: '🏷️', label: 'Frühaufsteher', price: 500 },
  { id: 't_team', kind: 'title', icon: '🏷️', label: 'Teamplayer', price: 700 },
  { id: 't_allergen', kind: 'title', icon: '🏷️', label: 'Allergen-Profi', price: 800 },
  { id: 't_telefon', kind: 'title', icon: '🏷️', label: 'Telefon-Ass', price: 800 },
  { id: 't_stollen', kind: 'title', icon: '🏷️', label: 'Stollen-Kenner', price: 900 },
  { id: 't_sauerteig', kind: 'title', icon: '🏷️', label: 'Sauerteig-Held', price: 1000 },
  { id: 'th_schoko', kind: 'theme', icon: '🍫', label: 'Schokolade', price: 1000, desc: 'Warme Karamell- und Schokotöne' },
  { id: 'th_pistazie', kind: 'theme', icon: '🟢', label: 'Pistazie', price: 1000, desc: 'Frisches Pistaziengrün' },
  { id: 'th_erdbeere', kind: 'theme', icon: '🍓', label: 'Erdbeere', price: 1000, desc: 'Fruchtiges Erdbeerrosa' },
  { id: 'th_blaubeere', kind: 'theme', icon: '🫐', label: 'Blaubeere', price: 1000, desc: 'Kühles Blaubeerblau' },
  { id: 'th_vanille', kind: 'theme', icon: '🍦', label: 'Vanille', price: 1000, desc: 'Sanftes Vanillegelb' },
  { id: 'th_karamell', kind: 'theme', icon: '🍮', label: 'Karamell', price: 1000, desc: 'Goldbraunes Karamell' },
  { id: 'th_himbeere', kind: 'theme', icon: '🍇', label: 'Himbeere', price: 1000, desc: 'Kräftiges Himbeerrot' },
  { id: 'th_minze', kind: 'theme', icon: '🌿', label: 'Minze', price: 1000, desc: 'Frisches Minzgrün' },
  { id: 'th_lavendel', kind: 'theme', icon: '💜', label: 'Lavendel', price: 1000, desc: 'Ruhiges Lavendellila' },
  { id: 'th_zitrone', kind: 'theme', icon: '🍋', label: 'Zitrone', price: 1000, desc: 'Spritziges Zitronengelb' },
  { id: 'fx_glitzer', kind: 'effect', icon: '✨', label: 'Glitzern', price: 600, desc: 'Dein Zeichen funkelt.' },
  { id: 'fx_dreh', kind: 'effect', icon: '🌀', label: 'Drehen', price: 600, desc: 'Dein Zeichen dreht sich.' },
  { id: 'fx_hupf', kind: 'effect', icon: '🦘', label: 'Hüpfen', price: 500, desc: 'Dein Zeichen hüpft.' },
  { id: 'fx_puls', kind: 'effect', icon: '💓', label: 'Pulsieren', price: 500, desc: 'Dein Zeichen schlägt wie ein Herz.' },
  { id: 'fx_schein', kind: 'effect', icon: '🌈', label: 'Regenbogen', price: 900, desc: 'Dein Zeichen leuchtet bunt.' },
  { id: 'fx_wackel', kind: 'effect', icon: '〰️', label: 'Wackeln', price: 400, desc: 'Dein Zeichen wackelt fröhlich.' },
  { id: 'fx_schaukel', kind: 'effect', icon: '🎠', label: 'Schaukeln', price: 500, desc: 'Dein Zeichen schaukelt hin und her.' },
  { id: 'fx_schweben', kind: 'effect', icon: '🎈', label: 'Schweben', price: 700, desc: 'Dein Zeichen schwebt sanft auf und ab.' },
  { id: 'fx_flip', kind: 'effect', icon: '🔃', label: 'Umdrehen', price: 700, desc: 'Dein Zeichen dreht sich wie eine Münze.' },
  { id: 'j_5050', kind: 'joker', icon: '🃏', label: '50:50-Joker', price: 200, desc: 'Lernen-Quiz: zwei falsche Antworten verschwinden.' },
  { id: 'j_swap', kind: 'joker', icon: '🔄', label: 'Tausch-Joker', price: 150, desc: 'Lernen-Quiz: die Frage gegen eine andere tauschen.' },
  { id: 'j_time', kind: 'joker', icon: '⏱️', label: 'Zeit-Joker', price: 150, desc: 'Quiz Battle: 10 Sekunden mehr für eine Frage.' },
  { id: 'j_double', kind: 'joker', icon: '✖️', label: 'Doppel-Joker', price: 400, desc: 'Lernen-Quiz: die Punkte für ein ganzes Quiz verdoppeln.' },
  { id: 'j_spin', kind: 'joker', icon: '🎟️', label: 'Extra-Dreh', price: 300, desc: 'Glücksrad: einmal zusätzlich drehen.' },
  // Version 229: neue Joker, Überraschungstüte, Schriften, Jubel, Sauerteig-Haustier, Wochen-Teile
  { id: 'j_hinweis', kind: 'joker', icon: '💡', label: 'Hinweis-Joker', price: 80, desc: 'Lernen-Quiz: eine falsche Antwort verschwindet.' },
  { id: 'j_chance', kind: 'joker', icon: '🔁', label: 'Zweite Chance', price: 200, desc: 'Lernen-Quiz: einmal einschalten. Bei deiner nächsten falschen Antwort darfst du nochmal, ohne Abzug.' },
  { id: 'j_magnet', kind: 'joker', icon: '🧲', label: 'Punkte-Magnet', price: 150, desc: 'Dein nächstes Spiel oder Quiz bringt 25 % mehr Punkte. Wird automatisch eingesetzt.' },
  { id: 'j_tuete', kind: 'joker', icon: '🛍️', label: 'Überraschungstüte', price: 150, desc: 'Was ist drin? Ein Teil aus dem Laden, ein Joker oder Trinkgeld zurück.' },
  { id: 'sf_kreide', kind: 'schrift', icon: 'Aa', label: 'Kreide', price: 800, desc: 'Dein Name in Kreideschrift wie auf der Tafel.' },
  { id: 'sf_schreib', kind: 'schrift', icon: 'Aa', label: 'Schreibschrift', price: 800, desc: 'Dein Name in geschwungener Schreibschrift.' },
  { id: 'sf_zucker', kind: 'schrift', icon: 'Aa', label: 'Zuckerguss', price: 1000, desc: 'Dein Name rund und glänzend wie Zuckerguss.' },
  { id: 'sf_kasse', kind: 'schrift', icon: 'Aa', label: 'Kassenbon', price: 600, desc: 'Dein Name wie gedruckt auf dem Kassenbon.' },
  { id: 'jb_brezel', kind: 'jubel', icon: '🥨', label: 'Brezelregen', price: 700, desc: 'Am Ende eines guten Quiz regnet es Brezeln.' },
  { id: 'jb_mehl', kind: 'jubel', icon: '☁️', label: 'Mehlwolke', price: 700, desc: 'Am Ende eines guten Quiz staubt eine Mehlwolke auf.' },
  { id: 'jb_sterne', kind: 'jubel', icon: '⭐', label: 'Sternenregen', price: 900, desc: 'Am Ende eines guten Quiz fallen goldene Sterne.' },
  // Version 233: Teigi hat jetzt jeder. Im Laden gibt es Sachen für ihn.
  { id: 'tz_schleife', kind: 'teigihut', icon: '🎀', label: 'Schleife', price: 400, desc: 'Eine Schleife für Teigis Deckel.' },
  { id: 'tz_blume', kind: 'teigihut', icon: '🌼', label: 'Blümchen', price: 400, desc: 'Ein Blümchen auf dem Deckel.' },
  { id: 'tz_muetze', kind: 'teigihut', icon: '👨‍🍳', label: 'Bäckermütze', price: 600, desc: 'Teigi wird zum echten Bäcker.' },
  { id: 'tz_brille', kind: 'teigihut', icon: '🕶️', label: 'Sonnenbrille', price: 600, desc: 'Ganz schön lässig, der Teigi.' },
  { id: 'tz_weihnacht', kind: 'teigihut', icon: '🎅', label: 'Weihnachtsmütze', price: 600, months: [11, 12, 1], desc: 'Nur in der Weihnachtszeit zu haben.' },
  { id: 'tz_krone', kind: 'teigihut', icon: '👑', label: 'Krone', price: 1200, desc: 'Für den König unter den Sauerteigen.' },
  { id: 'tg_bernstein', kind: 'teigiglas', icon: '🫙', label: 'Glas Bernstein', price: 600, desc: 'Teigi wohnt in einem bernsteinfarbenen Glas.' },
  { id: 'tg_rose', kind: 'teigiglas', icon: '🫙', label: 'Glas Rosé', price: 600, desc: 'Teigi wohnt in einem rosa Glas.' },
  { id: 'tg_mint', kind: 'teigiglas', icon: '🫙', label: 'Glas Minze', price: 600, desc: 'Teigi wohnt in einem mintgrünen Glas.' },
  { id: 'tg_gold', kind: 'teigiglas', icon: '🫙', label: 'Goldglas', price: 1000, desc: 'Ein glänzendes Goldglas mit goldenem Deckel.' },
  { id: 'tt_dreh', kind: 'teigitanz', icon: '🌀', label: 'Pirouette', price: 500, desc: 'Bei richtigen Antworten dreht sich Teigi einmal im Kreis.' },
  { id: 'tt_tanz', kind: 'teigitanz', icon: '💃', label: 'Freudentanz', price: 600, desc: 'Bei richtigen Antworten tanzt Teigi hin und her.' },
  { id: 'tt_salto', kind: 'teigitanz', icon: '🤸', label: 'Salto', price: 800, desc: 'Bei richtigen Antworten macht Teigi einen Salto.' },
  { id: 'h_teigi', kind: 'haustier', icon: '🫙', label: 'Sauerteig Teigi', price: 1500, desc: 'Dein eigener Sauerteig im Brotkorb. Jeder Lerntag füttert ihn, er wächst mit. Lernst du lange nicht, wird er schlapp.' },
  { id: 'w_igel', kind: 'avatar', icon: '🦔', label: 'Igel', price: 900, woche: true },
  { id: 'w_eichhorn', kind: 'avatar', icon: '🐿️', label: 'Eichhörnchen', price: 900, woche: true },
  { id: 'w_kaefer', kind: 'avatar', icon: '🐞', label: 'Marienkäfer', price: 900, woche: true },
  { id: 'w_falter', kind: 'avatar', icon: '🦋', label: 'Schmetterling', price: 900, woche: true },
  { id: 'w_mond', kind: 'avatar', icon: '🌙', label: 'Mond', price: 900, woche: true },
  { id: 'w_blitz', kind: 'avatar', icon: '⚡', label: 'Blitz', price: 900, woche: true },
  { id: 'w_zylinder', kind: 'avatar', icon: '🎩', label: 'Zylinder', price: 900, woche: true },
  { id: 'w_teddy', kind: 'avatar', icon: '🧸', label: 'Teddy', price: 900, woche: true },
  { id: 'w_pilz', kind: 'avatar', icon: '🍄', label: 'Pilz', price: 900, woche: true },
  { id: 'w_kaktus', kind: 'avatar', icon: '🌵', label: 'Kaktus', price: 900, woche: true },
  { id: 'w_regenbogen', kind: 'avatar', icon: '🌈', label: 'Regenbogen', price: 900, woche: true },
  { id: 'w_fuchs', kind: 'avatar', icon: '🦊', label: 'Fuchs', price: 900, woche: true },
  { id: 'j_schutz', kind: 'joker', icon: '🛡️', label: 'Serien-Schutz', price: 250, desc: 'Lern-Serie: Wenn du einen Tag nicht lernst, bleibt deine Serie trotzdem erhalten. Wird automatisch eingesetzt.' },
  { id: 'j_los', kind: 'joker', icon: '🎫', label: 'Rubbellos', price: 50, desc: 'Frei rubbeln und gewinnen: Punkte, Trinkgeld oder ein Joker. Mit etwas Glück ein seltenes Goldlos mit 5.000 Punkten! Startseite unter „Heute für dich“.' },
];

export const JOKER_FIELD: Record<string, string> = { j_5050: '_jokers', j_swap: '_jokersSwap', j_time: '_jokersTime', j_double: '_jokersDouble', j_spin: '_jokersSpin', j_los: '_jokersLos', j_schutz: '_jokersSchutz', j_hinweis: '_jokersHinweis', j_chance: '_jokersChance', j_magnet: '_jokersMagnet' };

/** Tagesangebot: jeden Tag ein anderes Teil zum halben Preis */
/** Diese Woche im Laden: 2 seltene Teile, die es nur eine Woche gibt (jede Woche andere, für alle gleich) */
export const wochenTeile = (d = new Date()): string[] => {
  const pool = TIP_SHOP.filter((i) => i.woche).map((i) => i.id);
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  const w = Math.floor(x.getTime() / (7 * 86400000));
  const a = (w * 5) % pool.length;
  return [pool[a], pool[(a + 1 + (w % (pool.length - 1))) % pool.length]];
};
export const imLaden = (it: ShopItem, d = new Date()) => it.kind !== 'haustier' && (!it.months || it.months.includes(d.getMonth() + 1)) && (!it.woche || wochenTeile(d).includes(it.id));

export const dealOfDay = (d = new Date()): ShopItem => {
  const pool = TIP_SHOP.filter(i => imLaden(i, d) && i.id !== 'j_tuete' && i.kind !== 'haustier');
  const k = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  return pool[(k * 7919) % pool.length];
};

export const shopPrice = (it: ShopItem, d = new Date()) => (dealOfDay(d).id === it.id ? Math.max(50, Math.round(it.price / 100) * 50) : it.price);

export const inSeason = (it: ShopItem, d = new Date()) => imLaden(it, d);

export const GAME_EMOJI: Record<string, string> = { 'Bonus vom Ausbilder': '🎁', 'Regal einräumen 🧺': '🧺', 'Theken-Ansturm 🏃': '🏃', 'Rubbellos': '🎫', 'Theken-Simulator': '🛎️', 'Welches Brot ist das?': '📸', 'Allergene-Training': '🛡️', 'Quiz Battle': '⚔️', Kassenblitz: '💶', 'Tüten-Blitz': '🛍️', 'Alternativen-Jäger': '🔄', 'Teurer oder billiger?': '⚖️', Sammelalbum: '📒', 'Schneide-Profi': '🔪', Adventskalender: '🎄' };

export const tipEuro = (c: number) => (c / 100).toFixed(2).replace('.', ',') + ' €';

/** 3D-Symbole für den Trinkgeld-Laden (Joker, Schatzkammer, Münzen) */
export function ShopIcon3D({ k, size = 52 }: { k: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-26 -26 52 52" aria-hidden="true" style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 6px 6px rgba(31,20,12,.28))' }}>
      <defs>
        <radialGradient id="shGold" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFF6C8" /><stop offset=".55" stopColor="#FFC72C" /><stop offset="1" stopColor="#C98A00" /></radialGradient>
        <linearGradient id="shCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EADCC3" /></linearGradient>
        <radialGradient id="shBlue" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#A8DAFF" /><stop offset="1" stopColor="#2F6FD6" /></radialGradient>
        <radialGradient id="shSilver" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#A9B3C0" /></radialGradient>
        <radialGradient id="shRed" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FF9A8A" /><stop offset="1" stopColor="#C0261A" /></radialGradient>
        <linearGradient id="shGem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D9F6FF" /><stop offset=".5" stopColor="#5CC8F2" /><stop offset="1" stopColor="#1E6FB8" /></linearGradient>
        <linearGradient id="shTicket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E0A400" /></linearGradient>
      </defs>
      {k === 'j_5050' && <g><rect x="-15" y="-19" width="24" height="32" rx="5" fill="url(#shCard)" stroke="#8A6A3A" strokeWidth="1.2" transform="rotate(-12)" /><rect x="-9" y="-18" width="24" height="32" rx="5" fill="url(#shCard)" stroke="#8A6A3A" strokeWidth="1.2" transform="rotate(10)" /><text x="3" y="-1" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#D92D20" fontFamily="Arial, sans-serif" transform="rotate(10)">50:50</text></g>}
      {k === 'j_swap' && <g><circle r="20" fill="url(#shBlue)" /><path d="M-9-3a10 10 0 0 1 17-4M9 3a10 10 0 0 1-17 4" stroke="#FFFFFF" strokeWidth="3.6" fill="none" strokeLinecap="round" /><path d="M10-13v7h-7M-10 13v-7h7" stroke="#FFFFFF" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx="-7" cy="-12" rx="7" ry="3.4" fill="rgba(255,255,255,.45)" /></g>}
      {k === 'j_time' && <g><rect x="-4.5" y="-25" width="9" height="6" rx="2" fill="#6B7685" /><circle r="19" fill="url(#shSilver)" stroke="#6B7685" strokeWidth="1.6" /><circle r="14.5" fill="#FFFFFF" /><path d="M0 0V-10M0 0l7 5" stroke="#D92D20" strokeWidth="3" strokeLinecap="round" /><circle r="2.2" fill="#1F140C" /><ellipse cx="-7" cy="-10" rx="6" ry="3" fill="rgba(255,255,255,.85)" /></g>}
      {k === 'j_double' && <g><circle cy="3" r="20" fill="#A87A0E" /><circle r="20" fill="url(#shGold)" stroke="#A87A0E" strokeWidth="1.4" /><circle r="14" fill="none" stroke="rgba(168,122,14,.6)" strokeWidth="1.6" /><text y="1" textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="900" fill="#7A5300" fontFamily="Arial, sans-serif">×2</text><ellipse cx="-7" cy="-10" rx="7" ry="3.4" fill="rgba(255,255,255,.7)" /></g>}
      {k === 'j_spin' && <g><circle r="20" fill="#1F140C" />{Array.from({ length: 8 }, (_, i) => { const a0 = (i * 45 - 90) * Math.PI / 180, a1 = ((i + 1) * 45 - 90) * Math.PI / 180; return <path key={i} d={`M0 0L${17 * Math.cos(a0)} ${17 * Math.sin(a0)}A17 17 0 0 1 ${17 * Math.cos(a1)} ${17 * Math.sin(a1)}Z`} fill={i % 2 ? '#FFF6E0' : '#FFC72C'} />; })}<circle r="5" fill="url(#shGold)" stroke="#1F140C" strokeWidth="1.6" /><path d="M0-24l4 6h-8z" fill="#D92D20" /><ellipse cx="-7" cy="-9" rx="7" ry="3.4" fill="rgba(255,255,255,.35)" /></g>}
      {k === 'j_los' && <g transform="rotate(-8)"><path d="M-22-13h44v8a5 5 0 0 0 0 10v8h-44v-8a5 5 0 0 0 0-10z" fill="url(#shTicket)" stroke="#A87A0E" strokeWidth="1.2" /><rect x="-15" y="-7" width="30" height="14" rx="3" fill="url(#shSilver)" /><path d="M-11 0h22" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeDasharray="3 3" /><text x="0" y="-10.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#7A5300" fontFamily="Arial, sans-serif">RUBBELLOS</text></g>}
      {k === 'j_schutz' && <g><path d="M0-22l17 6v10c0 12-8 20-17 24-9-4-17-12-17-24v-10z" fill="url(#shBlue)" stroke="#1E4E9A" strokeWidth="1.4" strokeLinejoin="round" /><path d="M0-16l11 4v6c0 8-5 13-11 16z" fill="rgba(255,255,255,.28)" /><path d="M-7 1l5 5 9-10" stroke="#FFFFFF" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
      {k === 'j_hinweis' && <g><circle cy="-4" r="15" fill="url(#shGold)" stroke="#A87A0E" strokeWidth="1.4" /><path d="M-6 9h12v5a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z" fill="#8A97A6" stroke="#5C6773" strokeWidth="1.2" /><path d="M-6 13h12" stroke="#5C6773" strokeWidth="1.2" /><path d="M-4 0l4-8 4 8" stroke="#FFFFFF" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".9" /><circle cx="-6" cy="-10" r="3" fill="#FFFFFF" opacity=".6" /></g>}
      {k === 'j_chance' && <g><circle r="20" fill="#2F7A3E" /><circle r="20" fill="url(#shBlue)" opacity="0" /><path d="M-10 4a11 11 0 1 0 2-12" stroke="#FFFFFF" strokeWidth="3.6" fill="none" strokeLinecap="round" /><path d="M-12-14l4 6 6-4" stroke="#FFFFFF" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /><text y="5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#FFFFFF">2</text></g>}
      {k === 'j_magnet' && <g transform="rotate(-20)"><path d="M-16-6v6a16 16 0 0 0 32 0v-6h-10v6a6 6 0 0 1-12 0v-6z" fill="url(#shRed)" stroke="#8A1A10" strokeWidth="1.4" strokeLinejoin="round" /><rect x="-16" y="-16" width="10" height="10" fill="url(#shSilver)" stroke="#6B7685" strokeWidth="1.2" /><rect x="6" y="-16" width="10" height="10" fill="url(#shSilver)" stroke="#6B7685" strokeWidth="1.2" /><path d="M-22 18l-4 4M22 18l4 4M0 24v5" stroke="#FFC72C" strokeWidth="2.4" strokeLinecap="round" /></g>}
      {k === 'j_tuete' && <g><path d="M-16-12h32l3 32h-38z" fill="#E8C792" stroke="#9A6A2E" strokeWidth="1.4" strokeLinejoin="round" /><path d="M-16-12l-2-8h36l-2 8" fill="#D4AE72" stroke="#9A6A2E" strokeWidth="1.4" strokeLinejoin="round" /><path d="M-7-12a7 7 0 0 1 14 0" stroke="#9A6A2E" strokeWidth="2" fill="none" /><text y="10" textAnchor="middle" fontSize="18" fontWeight="900" fill="#7A4A10">?</text></g>}
      {k === 'diamond' && <g><path d="M-18-6l8-10h20l8 10-18 22z" fill="url(#shGem)" stroke="#1E6FB8" strokeWidth="1.2" strokeLinejoin="round" /><path d="M-18-6h36M-10-16l4 10 6 22M10-16l-4 10-6 22M-6-6l6-10 6 10" stroke="rgba(255,255,255,.65)" strokeWidth="1" fill="none" /><path d="M-12-12l3-3" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" /></g>}
      {k === 'coin' && <g><circle cy="3" r="18" fill="#A87A0E" /><circle r="18" fill="url(#shGold)" stroke="#A87A0E" strokeWidth="1.4" /><text y="1" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="900" fill="#7A5300" fontFamily="Arial, sans-serif">€</text><ellipse cx="-6" cy="-9" rx="6" ry="3" fill="rgba(255,255,255,.7)" /></g>}
      {k === 'star' && <g><polygon points={Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 9 : 20; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(' ')} fill="url(#shGold)" stroke="#A87A0E" strokeWidth="1.2" strokeLinejoin="round" /><ellipse cx="-5" cy="-7" rx="5" ry="2.6" fill="rgba(255,255,255,.75)" /></g>}
    </svg>
  );
}

/** ── Trinkgeld-Laden: wie eine kleine Bäckerei mit Markise, Regalen, Preisschildern und Kasse ── */
/** CSS-Klasse für die gekaufte Namensfarbe */
export const nameClassOf = (pr: any): string | undefined => {
  const farbe = pr && pr._nameColor ? `lt-nc lt-nc-${String(pr._nameColor).replace('pt_nc_', '')}` : pr && pr._gold ? 'lt-goldname' : '';
  const schrift = pr && pr._schrift ? `lt-sf-${String(pr._schrift).replace('sf_', '')}` : '';
  return `${farbe} ${schrift}`.trim() || undefined;
};

export type ShopTab = 'zeichen' | 'teigi' | 'bewegung' | 'titel' | 'farben' | 'joker' | 'schatz';

/** Schatzkammer: nur mit Punkten zu kaufen, die Punkte fehlen dann in der Gesamtwertung */
export type PtItem = { id: string; kind: 'gold' | 'namecolor' | 'frame' | 'avatar' | 'markise' | 'spruch'; icon: string; label: string; price: number; desc: string };

export const PT_SHOP: PtItem[] = [
  { id: 'pt_nc_gold', kind: 'namecolor', icon: '✨', label: 'Name in Gold', price: 8000, desc: 'Dein Name glänzt in Gold auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_nc_silber', kind: 'namecolor', icon: '🥈', label: 'Name in Silber', price: 6000, desc: 'Dein Name glänzt in Silber auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_nc_rose', kind: 'namecolor', icon: '🌸', label: 'Name in Roségold', price: 8000, desc: 'Dein Name glänzt in Roségold auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_nc_smaragd', kind: 'namecolor', icon: '💚', label: 'Name in Smaragd', price: 9000, desc: 'Dein Name glänzt in Smaragd auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_nc_saphir', kind: 'namecolor', icon: '💙', label: 'Name in Saphir', price: 9000, desc: 'Dein Name glänzt in Saphir auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_nc_feuer', kind: 'namecolor', icon: '🔥', label: 'Name in Feuer', price: 10000, desc: 'Dein Name glänzt in Feuer auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_nc_regenbogen', kind: 'namecolor', icon: '🌈', label: 'Name in Regenbogen', price: 12000, desc: 'Dein Name glänzt in Regenbogen auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_nc_schoko', kind: 'namecolor', icon: '🍫', label: 'Name in Schoko', price: 7000, desc: 'Dein Name glänzt in Schoko auf der Startseite und auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_sterne', kind: 'frame', icon: '✦', label: 'Bon-Rahmen Sterne', price: 4000, desc: 'Sterne um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_brezel', kind: 'frame', icon: '🥨', label: 'Bon-Rahmen Brezeln', price: 4000, desc: 'Brezeln um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_herz', kind: 'frame', icon: '♥', label: 'Bon-Rahmen Herzen', price: 4000, desc: 'Herzen um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_croissant', kind: 'frame', icon: '🥐', label: 'Bon-Rahmen Croissants', price: 4500, desc: 'Croissants um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_krone', kind: 'frame', icon: '👑', label: 'Bon-Rahmen Kronen', price: 6000, desc: 'Kronen um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_aehre', kind: 'frame', icon: '🌾', label: 'Bon-Rahmen Ähren', price: 4000, desc: 'Ähren um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_schnee', kind: 'frame', icon: '❄', label: 'Bon-Rahmen Schnee', price: 4500, desc: 'Schneeflocken um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_fr_kueken', kind: 'frame', icon: '🐥', label: 'Bon-Rahmen Küken', price: 5000, desc: 'Hinkel-Küken um deinen Namen auf dem Bestenlisten-Bon.' },
  { id: 'pt_av_krone', kind: 'avatar', icon: '👑', label: 'Krone', price: 6000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_einhorn', kind: 'avatar', icon: '🦄', label: 'Einhorn', price: 6000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_drache', kind: 'avatar', icon: '🐉', label: 'Drache', price: 8000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_phoenix', kind: 'avatar', icon: '🦚', label: 'Pfau', price: 8000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_rakete', kind: 'avatar', icon: '🚀', label: 'Rakete', price: 7000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_diamant', kind: 'avatar', icon: '💎', label: 'Diamant', price: 12000, desc: 'Das seltenste Zeichen.' },
  { id: 'pt_av_biene', kind: 'avatar', icon: '🐝', label: 'Biene', price: 6000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_eule', kind: 'avatar', icon: '🦉', label: 'Eule', price: 7000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_goldkueken', kind: 'avatar', icon: '🐤', label: 'Goldküken', price: 10000, desc: 'Das Küken von Hinkel, in seltener Gold-Ausgabe.' },
  { id: 'pt_mk_croissant', kind: 'markise', icon: '🥐', label: 'Markise Croissants', price: 8000, desc: 'Deine Markise oben auf der Startseite: Croissants.' },
  { id: 'pt_mk_keks', kind: 'markise', icon: '🍪', label: 'Markise Kekse', price: 8000, desc: 'Deine Markise oben auf der Startseite: Kekse.' },
  { id: 'pt_mk_brezel', kind: 'markise', icon: '🥨', label: 'Markise Brezeln', price: 8000, desc: 'Deine Markise oben auf der Startseite: Brezeln.' },
  { id: 'pt_mk_donut', kind: 'markise', icon: '🍩', label: 'Markise Krapfen', price: 8000, desc: 'Deine Markise oben auf der Startseite: Krapfen.' },
  { id: 'pt_mk_kuchen', kind: 'markise', icon: '🍰', label: 'Markise Kuchen', price: 8000, desc: 'Deine Markise oben auf der Startseite: Kuchen.' },
  { id: 'pt_mk_weizen', kind: 'markise', icon: '🌾', label: 'Markise Ähren', price: 7000, desc: 'Deine Markise oben auf der Startseite: Ähren.' },
  { id: 'pt_mk_herz', kind: 'markise', icon: '❤️', label: 'Markise Herzen', price: 8000, desc: 'Deine Markise oben auf der Startseite: Herzen.' },
  { id: 'pt_mk_schnee', kind: 'markise', icon: '❄️', label: 'Markise Schneeflocken', price: 8000, desc: 'Deine Markise oben auf der Startseite: Schneeflocken.' },
  { id: 'pt_mk_sterne', kind: 'markise', icon: '🌌', label: 'Markise Sternenhimmel', price: 9000, desc: 'Deine Markise oben auf der Startseite: Sternenhimmel.' },
  { id: 'pt_mk_karo', kind: 'markise', icon: '🟫', label: 'Markise Bäcker-Karo', price: 7000, desc: 'Deine Markise oben auf der Startseite: Bäcker-Karo.' },
  { id: 'pt_mk_schoko', kind: 'markise', icon: '🍫', label: 'Markise Schoko-Streifen', price: 7000, desc: 'Deine Markise oben auf der Startseite: Schoko-Streifen.' },
  { id: 'pt_mk_erdbeer', kind: 'markise', icon: '🍓', label: 'Markise Erdbeer-Streifen', price: 7000, desc: 'Deine Markise oben auf der Startseite: Erdbeer-Streifen.' },
  { id: 'pt_mk_minze', kind: 'markise', icon: '🌿', label: 'Markise Minz-Streifen', price: 7000, desc: 'Deine Markise oben auf der Startseite: Minz-Streifen.' },
  { id: 'pt_mk_lavendel', kind: 'markise', icon: '💜', label: 'Markise Lavendel-Streifen', price: 7000, desc: 'Deine Markise oben auf der Startseite: Lavendel-Streifen.' },
  { id: 'pt_mk_regenbogen', kind: 'markise', icon: '🌈', label: 'Markise Regenbogen', price: 12000, desc: 'Deine Markise oben auf der Startseite: Regenbogen.' },
  { id: 'pt_mk_nacht', kind: 'markise', icon: '🌙', label: 'Markise Mitternachtsblau', price: 9000, desc: 'Deine Markise oben auf der Startseite: Mitternachtsblau.' },
  { id: 'pt_mk_kueken', kind: 'markise', icon: '🐥', label: 'Markise Küken', price: 9000, desc: 'Deine Markise oben auf der Startseite: Hinkel-Küken.' },
  { id: 'pt_mk_sonnenblume', kind: 'markise', icon: '🌻', label: 'Markise Sonnenblumen', price: 8000, desc: 'Deine Markise oben auf der Startseite: Sonnenblumen.' },
  { id: 'pt_spruch', kind: 'spruch', icon: '💬', label: 'Spruch des Tages', price: 15000, desc: 'Dein Satz steht einen Tag lang bei allen auf der Startseite. Der Ausbilder gibt ihn vorher frei.' },
];

export function TipShop({ prog, onBuy, onEquip, onClose, ptsBalance = 0, onBuyPts, onEquipPts, kollegen = [], onSchenken, geschenkeHeute = 0 }: { kollegen?: { k: string; name: string }[]; onSchenken?: (jokerId: string, an: string, anName: string) => void; geschenkeHeute?: number; prog: any; onBuy: (it: ShopItem) => void; onEquip: (kind: AnlegeArt, value: string | null) => void; onClose: () => void; ptsBalance?: number; onBuyPts?: (it: PtItem, text?: string) => void; onEquipPts?: (it: PtItem, on: boolean) => void }) {
  const [spruch, setSpruch] = useState('');
  const [gJoker, setGJoker] = useState('j_los');
  const [gAn, setGAn] = useState('');
  const balance = (Number(prog._tipCents) || 0) - (Number(prog._tipSpent) || 0);
  const owned: string[] = Array.isArray(prog._shopOwned) ? prog._shopOwned : [];
  const [tab, setTab] = useState<ShopTab>('zeichen');
  const [bon, setBon] = useState<{ it: ShopItem; price: number; k: number } | null>(null);
  const [ring, setRing] = useState(0);
  // Anprobieren: erst antippen = Vorschau oben am Namen, dann „Kaufen“ (verhindert Käufe aus Versehen)
  const [vorschau, setVorschau] = useState<{ art: 'tip'; it: ShopItem } | { art: 'pts'; it: PtItem } | null>(null);
  const shown = useCountUp(balance, 700);
  const deal = dealOfDay();
  useEffect(() => { if (!bon) return; const t = window.setTimeout(() => setBon(null), 3200); return () => window.clearTimeout(t); }, [bon]);
  const tabs: { id: ShopTab; icon: string; label: string }[] = [
    { id: 'zeichen', icon: '🥐', label: 'Zeichen' }, { id: 'teigi', icon: '🫙', label: 'Teigi' }, { id: 'bewegung', icon: '✨', label: 'Bewegung' }, { id: 'titel', icon: '🏷️', label: 'Titel' }, { id: 'farben', icon: '🎨', label: 'Farben' }, { id: 'joker', icon: '🃏', label: 'Joker' }, { id: 'schatz', icon: '💎', label: 'Schatzkammer' },
  ];
  const list = (t: ShopTab) => TIP_SHOP.filter(i =>
    t === 'zeichen' ? i.kind === 'avatar' && (imLaden(i) || owned.includes(i.id))
      : t === 'teigi' ? ['teigihut', 'teigiglas', 'teigitanz'].includes(i.kind) && (imLaden(i) || owned.includes(i.id))
      : t === 'bewegung' ? i.kind === 'effect' || i.kind === 'jubel' : t === 'titel' ? i.kind === 'title' : t === 'farben' ? i.kind === 'theme' || i.kind === 'schrift' : i.kind === 'joker')
    .sort((a, b) => (t === 'zeichen' ? Number(!!b.woche && !owned.includes(b.id)) - Number(!!a.woche && !owned.includes(a.id)) || Number(b.kind === 'haustier') - Number(a.kind === 'haustier') : 0));
  const themeSwatch: Record<string, string> = { th_schoko: '#6B3E1F', th_pistazie: '#9BC27A', th_erdbeere: '#F2667A', th_blaubeere: '#5B7FD6', th_vanille: '#F7E3A1', th_karamell: '#E0A458', th_himbeere: '#E8577A', th_minze: '#9FE0C9', th_lavendel: '#C7B4EC', th_zitrone: '#FFF07A' };
  const item = (it: ShopItem, i: number) => {
    const has = it.kind !== 'joker' && owned.includes(it.id);
    const active = (it.kind === 'avatar' && prog._avatar === it.icon) || (it.kind === 'title' && prog._title === it.label) || (it.kind === 'theme' && prog._theme === it.id) || (it.kind === 'effect' && prog._effect === it.id) || (it.kind === 'schrift' && prog._schrift === it.id) || (it.kind === 'jubel' && prog._jubel === it.id) || (it.kind === 'haustier' && owned.includes(it.id)) || (it.kind === 'teigihut' && prog._teigiHut === it.id) || (it.kind === 'teigiglas' && prog._teigiGlas === it.id) || (it.kind === 'teigitanz' && prog._teigiTanz === it.id);
    const price = shopPrice(it); const isDeal = price < it.price; const afford = balance >= price;
    const count = it.kind === 'joker' ? Number(prog[JOKER_FIELD[it.id]]) || 0 : 0;
    const click = () => {
      if (has) { if (it.kind === 'haustier') return; onEquip(it.kind as AnlegeArt, active ? null : (it.kind === 'avatar' ? it.icon : it.kind === 'title' ? it.label : it.id)); return; }
      if (it.kind === 'joker') { if (!afford) return; onBuy(it); setBon({ it, price, k: Date.now() }); setRing(r => r + 1); return; } // Joker: keine Vorschau nötig
      setVorschau({ art: 'tip', it });
    };
    const wide = it.kind === 'title' || it.kind === 'joker';
    return (
      <button key={it.id} onClick={click} disabled={it.kind === 'joker' && !has && !afford} aria-pressed={vorschau?.it.id === it.id} className={`lt-shop-item${wide ? ' lt-shop-wide' : ''}${!has && !afford ? ' lt-shop-off' : ''}`} title={it.desc}
        style={{ animationDelay: `${i * 0.04}s`, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '16px 8px 12px', minHeight: wide ? '150px' : '150px', border: 'none', borderRadius: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', outline: active ? '2.5px solid #FFC72C' : 'none', outlineOffset: '-2.5px', cursor: has || afford ? 'pointer' : 'not-allowed', color: LT.ink }}>
        {isDeal && !has && <span className="lt-deal" style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2, padding: '3px 8px', borderRadius: '999px', backgroundColor: '#D92D20', color: '#FFFFFF', fontSize: '12px', fontWeight: 800 }}>-50 %</span>}
        {count > 0 && <span style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, minWidth: '26px', height: '26px', padding: '0 6px', borderRadius: '13px', backgroundColor: TH.green, color: '#FFFFFF', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×{count}</span>}
        <span className="lt-shop-goods lt-shop-pedestal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '64px' }}>
          {it.kind === 'theme'
            ? <span className="lt-shop-ball" style={{ ['--c' as any]: themeSwatch[it.id] || LT.yellow }} />
            : it.kind === 'title'
              ? <span style={{ maxWidth: '100%', textAlign: 'center', padding: '8px 12px', borderRadius: '999px', backgroundColor: '#FFC72C', color: '#2B170A', fontSize: '15px', fontWeight: 800, boxShadow: '0 3px 0 #B98A0A, 0 8px 14px -8px rgba(31,20,12,.5)' }}>{it.icon} {it.label}</span>
              : it.kind === 'joker' ? <ShopIcon3D k={it.id} size={56} />
              : it.kind === 'schrift' ? <span className={`lt-sf-${it.id.replace('sf_', '')}`} style={{ fontSize: '24px', lineHeight: 1.1, maxWidth: '100%', overflowWrap: 'anywhere' }}>{prog._displayName || 'Name'}</span>
              : it.kind === 'haustier' ? <TeigiGlas stufe={1} laune="froh" size={72} />
              : it.kind === 'teigihut' ? <TeigiGlas stufe={1} laune="froh" size={72} hut={it.id} glas={prog._teigiGlas} />
              : it.kind === 'teigiglas' ? <TeigiGlas stufe={1} laune="froh" size={72} glas={it.id} hut={prog._teigiHut} />
              : it.kind === 'teigitanz' ? <span className={`lt-teigi-vorfuehr lt-teigi-${it.id.replace('tt_', '')}`} style={{ display: 'inline-block', animationDelay: `${-(i % 3) * 0.5}s` }}><TeigiGlas stufe={1} laune="froh" size={72} hut={prog._teigiHut} glas={prog._teigiGlas} /></span> : <span className={`lt-shop-emo ${it.kind === 'effect' ? `lt-fx-${it.id.replace('fx_', '')}` : 'lt-emo-bob'}`} style={{ fontSize: '46px', lineHeight: 1, animationDelay: `${-(i % 5) * 0.4}s` }}>{it.kind === 'effect' ? (prog._avatar || '🥨') : it.icon}</span>}
        </span>
        {it.woche && !has && <span style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, padding: '3px 8px', borderRadius: '999px', backgroundColor: '#5B3A75', color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }}>nur diese Woche</span>}
        {it.kind !== 'title' && <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{it.label}</span>}
        <span className="lt-pricetag" style={{ backgroundColor: active ? '#2F7A3E' : has ? '#FFFFFF' : '#1F140C', color: active ? '#FFFFFF' : has ? LT.ink : '#FFD86B', border: has && !active ? '1.5px solid #E3D6BE' : 'none' }}>
          {it.kind === 'haustier' && has ? 'im Brotkorb' : active ? '✓ an' : has ? 'anlegen' : isDeal ? <><s style={{ opacity: 0.55, fontWeight: 400 }}>{tipEuro(it.price)}</s> {tipEuro(price)}</> : tipEuro(price)}
        </span>
      </button>
    );
  };
  return (
    <div className="lt-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(43,23,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Trinkgeld-Laden" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '760px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFBF2', borderRadius: '26px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        {/* Markise */}
        <div className="lt-shop-awning" aria-hidden="true" />
        {/* Ladenschild + Klingel + Kasse */}
        <div style={{ position: 'relative', padding: '4px 18px 12px', display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <span key={'b' + ring} className="lt-shop-bell" aria-hidden="true" style={{ marginTop: '24px', width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#1F140C', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.bell} size={22} width={1.9} /></span>
          <div className="lt-shop-sign" style={{ flex: '1 1 220px' }}>
            <div style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1, color: '#FFD86B' }}>Trinkgeld-Laden</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F0D9AE', marginTop: '6px' }}><span className="lt-dot-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5BD16A' }} />Geöffnet</div>
          </div>
          <div className="lt-register" key={'r' + ring}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#E8C27A' }}>IN DEINER KASSE</div>
            <div style={{ fontFamily: "'Courier Prime', ui-monospace, monospace", fontSize: '28px', fontWeight: 700, color: '#FFD86B', textShadow: '0 0 8px rgba(255,216,107,.45)' }}>{tipEuro(Math.max(0, shown.value))}</div>
          </div>
          <button onClick={onClose} aria-label="Laden verlassen" style={{ position: 'absolute', top: '-46px', right: '10px', zIndex: 3, width: '46px', height: '46px', borderRadius: '50%', border: 'none', backgroundColor: '#FFFFFF', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,.25)' }}>✕</button>
        </div>
        <div className="lt-shop-scroll" style={{ overflowY: 'auto', padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {vorschau && (() => {
            const v = vorschau; const it: any = v.it;
            const name = prog._displayName || 'Du';
            const avatar = it.kind === 'avatar' ? it.icon : prog._avatar;
            const fx = v.art === 'tip' && it.kind === 'effect' ? `lt-fx-${it.id.replace('fx_', '')}` : prog._effect ? `lt-fx-${String(prog._effect).replace('fx_', '')}` : 'lt-emo-bob';
            const titel = v.art === 'tip' && it.kind === 'title' ? it.label : prog._title;
            const nameKl0 = v.art === 'pts' && it.kind === 'namecolor' ? `lt-nc lt-nc-${it.id.replace('pt_nc_', '')}` : v.art === 'pts' && it.kind === 'gold' ? 'lt-goldname' : (nameClassOf({ ...prog, _schrift: null }) || '');
            const nameKl = `${nameKl0} ${v.art === 'tip' && it.kind === 'schrift' ? `lt-sf-${it.id.replace('sf_', '')}` : prog._schrift ? `lt-sf-${String(prog._schrift).replace('sf_', '')}` : ''}`.trim();
            const preis = v.art === 'tip' ? shopPrice(it) : it.price;
            const kannKaufen = v.art === 'tip' ? balance >= preis : ptsBalance >= preis;
            const kaufen = () => {
              if (!kannKaufen) return;
              if (v.art === 'tip') { onBuy(it); setBon({ it, price: preis, k: Date.now() }); } else onBuyPts?.(it);
              setRing(r => r + 1); setVorschau(null);
            };
            return (
              <div className="lt-anprobe" role="region" aria-label="Vorschau" style={{ position: 'sticky', top: 0, zIndex: 4, padding: '14px 16px', borderRadius: '20px', backgroundColor: '#FFFBF2', border: '2px solid #FFC72C', boxShadow: '0 10px 24px -14px rgba(31,20,12,.5)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: LT.brown }}>So sieht es bei dir aus</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1, display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    Hallo, {avatar && <span className={fx} style={{ display: 'inline-block', fontSize: '30px', lineHeight: 1 }}>{avatar}</span>}
                    <span><span className={nameKl}>{name}</span>!</span>
                  </span>
                  {titel && <span style={{ padding: '4px 12px', borderRadius: '999px', backgroundColor: '#FFC72C', color: '#2B170A', fontSize: '14px', fontWeight: 800 }}>{titel}</span>}
                  {v.art === 'tip' && it.kind === 'theme' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700 }}><span className="lt-shop-ball" style={{ ['--c' as any]: themeSwatch[it.id] || LT.yellow, width: '26px', height: '26px' }} />Farbe der App</span>}
                  {v.art === 'pts' && it.kind === 'frame' && <span className="lt-schatz-bon">{it.icon} {String(name).toUpperCase().slice(0, 10)} {it.icon}</span>}
                  {v.art === 'pts' && it.kind === 'markise' && <span className={`lt-mk-swatch lt-mk-sw-${it.id}`} style={{ width: '90px', height: '34px' }} />}
                  {v.art === 'tip' && ['teigihut', 'teigiglas', 'teigitanz'].includes(it.kind) && <span className={it.kind === 'teigitanz' ? `lt-teigi-vorfuehr lt-teigi-${it.id.replace('tt_', '')}` : ''} style={{ display: 'inline-block' }}><TeigiGlas stufe={2} laune="froh" size={84} hut={it.kind === 'teigihut' ? it.id : prog._teigiHut} glas={it.kind === 'teigiglas' ? it.id : prog._teigiGlas} /></span>}
                </div>
                <div style={{ fontSize: '14px', color: LT.muted }}>{it.label}{it.desc ? ` · ${it.desc}` : ''}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={kaufen} disabled={!kannKaufen} style={{ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: 'none', backgroundColor: kannKaufen ? '#1F140C' : '#CBBBA4', color: kannKaufen ? '#FFD86B' : '#FFFFFF', fontSize: '16px', fontWeight: 800, cursor: kannKaufen ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                    {kannKaufen ? `Kaufen für ${v.art === 'tip' ? tipEuro(preis) : `${preis.toLocaleString('de-DE')} Punkte`}` : `Noch ${v.art === 'tip' ? tipEuro(preis - balance) : `${(preis - ptsBalance).toLocaleString('de-DE')} Punkte`} sparen`}
                  </button>
                  <button type="button" onClick={() => setVorschau(null)} style={{ minHeight: '46px', padding: '0 16px', borderRadius: '999px', border: '2px solid #E3D6BE', backgroundColor: '#FFFFFF', color: LT.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Doch nicht</button>
                </div>
              </div>
            );
          })()}
          {/* Tafel: Angebot des Tages */}
          <button className="lt-chalk" onClick={() => setTab(deal.kind === 'avatar' ? 'zeichen' : deal.kind === 'effect' || deal.kind === 'jubel' ? 'bewegung' : deal.kind === 'title' ? 'titel' : deal.kind === 'theme' || deal.kind === 'schrift' ? 'farben' : 'joker')}>
            <span className="lt-shop-pedestal" aria-hidden="true">{deal.kind === 'joker' ? <ShopIcon3D k={deal.id} size={50} /> : deal.kind === 'theme' ? <span className="lt-shop-ball" style={{ ['--c' as any]: '#FFC72C', width: '44px', height: '44px' }} /> : <span className="lt-shop-emo lt-emo-bob" style={{ fontSize: '42px' }}>{deal.icon}</span>}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>Heute im Angebot</span>
              <span style={{ display: 'block', fontSize: '22px', fontWeight: 700 }}>{deal.label}: {owned.includes(deal.id) && deal.kind !== 'joker' ? 'hast du schon' : <span className="lt-preis-nowrap">{tipEuro(shopPrice(deal))} statt {tipEuro(deal.price)}</span>}</span>
              <span style={{ display: 'block', fontSize: '13px', opacity: 0.8 }}>Jeden Tag ein anderes Teil zum halben Preis</span>
            </span>
          </button>
          {/* Gänge */}
          <div role="tablist" aria-label="Abteilungen" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {tabs.map(t => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} style={{ flex: '0 0 auto', minHeight: '48px', padding: '0 16px', borderRadius: '999px', border: 'none', backgroundColor: tab === t.id ? '#1F140C' : '#FFFFFF', color: tab === t.id ? '#FFD86B' : LT.ink, fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: tab === t.id ? '0 4px 10px rgba(75,42,20,.3)' : 'none', transition: 'all .2s' }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '15px', color: LT.brown }}>
            {tab === 'schatz' ? 'Besondere Sachen, die es nur für Punkte gibt. Lohnt es sich, dafür in der Bestenliste ein paar Plätze abzurutschen?' : tab === 'teigi' ? 'Sachen für deinen Begleiter Teigi: Hüte und Zubehör, ein neues Glas und Tänze bei richtigen Antworten. Antippen zum Anprobieren.' : tab === 'zeichen' ? 'Steht vor deinem Namen, auf der Startseite und in der Bestenliste. Saison-Zeichen gibt es nur eine Zeit lang.' : tab === 'bewegung' ? 'Lässt dein Zeichen tanzen. Immer ein Effekt gleichzeitig.' : tab === 'titel' ? 'Steht unter deinem Namen auf der Startseite.' : tab === 'farben' ? 'Färbt Knöpfe, Balken und die Markise in deiner App. Nur du siehst es.' : 'Jeder Joker hilft einmal. Du kannst mehrere sammeln.'}
          </div>
          {tab === 'schatz' && (() => {
            const ptsOwned: string[] = Array.isArray(prog._ptsOwned) ? prog._ptsOwned : [];
            const isOn = (it: PtItem) => it.kind === 'gold' ? !!prog._gold : it.kind === 'namecolor' ? prog._nameColor === it.id : it.kind === 'frame' ? prog._frame === it.id : it.kind === 'avatar' ? prog._avatar === it.icon : it.kind === 'markise' ? prog._markise === it.id : false;
            const pending = prog._spruch && prog._spruch.status === 'pending';
            return (
              <div className="lt-shelf-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="lt-schatz-head" style={{ padding: '16px 18px', borderRadius: '20px', backgroundColor: '#1F140C', backgroundImage: 'radial-gradient(ellipse 70% 80% at 100% 0, rgba(92,200,242,.18), transparent 60%)', color: '#FFE27A', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span className="lt-emo-bob" aria-hidden="true" style={{ display: 'inline-flex' }}><ShopIcon3D k="diamond" size={50} /></span>
                  <span style={{ flex: 1, minWidth: '200px' }}>
                    <span style={{ display: 'block', fontFamily: LT.serif, fontSize: '24px' }}>Schatzkammer</span>
                    <span style={{ display: 'block', fontSize: '14px', color: '#F0D9AE' }}>Bezahlt wird mit <strong>Punkten</strong>, nicht mit Trinkgeld. Ausgegebene Punkte fehlen dir in der Gesamtwertung, deine Stufe und die Monatswertung bleiben.</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '999px', backgroundColor: 'rgba(255,216,107,.14)', color: '#FFD86B', fontWeight: 800, fontSize: '18px' }}><ShopIcon3D k="star" size={22} />{Math.max(0, ptsBalance).toLocaleString('de-DE')} Pkt</span>
                </div>
                {([[['namecolor'], 'Namensfarben', 'Dein Name glänzt in dieser Farbe'], [['avatar'], 'Seltene Zeichen', 'Gibt es nur hier'], [['markise'], 'Markisen', 'Deine eigene Markise oben in der App'], [['frame'], 'Bon-Rahmen', 'Verziert deinen Namen auf dem Bestenlisten-Bon'], [['spruch', 'gold'], 'Besonderes', 'Für alle sichtbar']] as [string[], string, string][]).map(([kinds, sec, sub]) => { const group = PT_SHOP.filter(x => kinds.includes(x.kind)); if (!group.length) return null; return (
                <div key={sec} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="lt-schatz-sec"><b>{sec}</b><span>{sub}</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
                  {group.map((it, i) => {
                    const has = it.kind !== 'spruch' && ptsOwned.includes(it.id);
                    const on = has && isOn(it);
                    const afford = ptsBalance >= it.price;
                    return (
                      <div key={it.id} className="lt-shop-item lt-schatz-item" style={{ animationDelay: `${i * 0.04}s`, padding: '16px', borderRadius: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', outline: on ? '2.5px solid #FFC72C' : 'none', outlineOffset: '-2.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="lt-schatz-show" aria-hidden="true">
                          {it.kind === 'namecolor' && <span className={`lt-nc lt-nc-${it.id.replace('pt_nc_', '')}`} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '28px', fontWeight: 800, lineHeight: 1.1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 6px' }}>{prog._displayName || 'Dein Name'}</span>}
                          {it.kind === 'avatar' && <span className="lt-schatz-rare"><span className="lt-shop-emo lt-emo-bob" style={{ fontSize: '46px', lineHeight: 1 }}>{it.icon}</span></span>}
                          {it.kind === 'markise' && <span className={`lt-mk-swatch lt-mk-sw-${it.id} lt-schatz-mk`} />}
                          {it.kind === 'frame' && <span className="lt-schatz-bon">{it.icon} {(prog._displayName || 'Name').toUpperCase().slice(0, 10)} {it.icon}</span>}
                          {it.kind === 'spruch' && <svg width="64" height="54" viewBox="0 0 64 54" style={{ filter: 'drop-shadow(0 6px 6px rgba(31,20,12,.25))' }}><defs><linearGradient id="spBub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EADCC3" /></linearGradient></defs><path d="M10 4h44a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8H28l-12 10v-10h-6a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8z" fill="url(#spBub)" stroke="#C9B48A" strokeWidth="1.2" /><text x="32" y="30" textAnchor="middle" fontSize="26" fontWeight="900" fill="#FFC72C" stroke="#A87A0E" strokeWidth=".8" fontFamily="Georgia, serif">„“</text></svg>}
                          {it.kind === 'gold' && <ShopIcon3D k="coin" size={54} />}
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '16px', lineHeight: 1.2 }}>{it.label}</span>
                        <span style={{ fontSize: '13px', color: LT.muted, lineHeight: 1.35, flex: 1 }}>{it.desc}</span>
                        {it.kind === 'spruch' && !pending && afford && (
                          <input value={spruch} maxLength={80} onChange={(e) => setSpruch(e.target.value)} placeholder="Dein Spruch (max. 80 Zeichen)" style={{ minHeight: '44px', padding: '0 12px', borderRadius: '12px', border: '1.5px solid #E3D6BE', fontSize: '15px' }} />
                        )}
                        {it.kind === 'spruch' && pending && <span style={{ fontSize: '14px', fontWeight: 700, color: '#8A6A00' }}>Dein Spruch wartet auf Freigabe: „{prog._spruch.text}“</span>}
                        {it.kind === 'spruch' && prog._spruch && prog._spruch.status === 'no' && <span style={{ fontSize: '14px', color: LT.brown }}>Dein letzter Spruch wurde nicht freigegeben, die Punkte hast du zurück.</span>}
                        <button disabled={(it.kind === 'spruch' && (!afford || pending || spruch.trim().length < 3))}
                          onClick={() => { if (has) { onEquipPts?.(it, !on); return; } if (it.kind === 'spruch') { onBuyPts?.(it, spruch.trim()); setSpruch(''); setRing(r => r + 1); } else setVorschau({ art: 'pts', it }); }}
                          style={{ minHeight: '44px', borderRadius: '999px', border: 'none', backgroundColor: on ? '#2F7A3E' : has ? '#FFFFFF' : '#1F140C', color: on ? '#FFFFFF' : has ? LT.ink : '#FFD86B', fontSize: '15px', fontWeight: 800, cursor: 'pointer', opacity: (!has && !afford) || (it.kind === 'spruch' && (pending || spruch.trim().length < 3)) ? 0.45 : 1, boxShadow: has ? 'inset 0 0 0 1.5px #E3D6BE' : 'none' }}>
                          {on ? '✓ an (antippen zum Ablegen)' : has ? 'anlegen' : it.kind === 'spruch' ? `${it.price.toLocaleString('de-DE')} Punkte` : `Anprobieren · ${it.price.toLocaleString('de-DE')} Punkte`}
                        </button>
                      </div>
                    );
                  })}
                </div>
                </div>
                ); })}
              </div>
            );
          })()}
          {/* Regal */}
          {tab !== 'schatz' && <div key={tab} className="lt-shelf-wrap">
            <div className="lt-shelf" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: '10px 8px' }}>
              {list(tab).map(item)}
            </div>
          </div>}
          {tab === 'titel' && (
            <div className="lt-sammelsets" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px 16px', borderRadius: '18px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)' }}>
              <div style={{ fontWeight: 800, fontSize: '17px' }}>Sammel-Sets</div>
              <div style={{ fontSize: '14px', color: LT.brown }}>Hast du alle Teile einer Reihe, bekommst du einen seltenen Bonus-Titel geschenkt. Den gibt es nicht zu kaufen.</div>
              {setStand(owned).map((st) => {
                const an = prog._title === st.titel;
                return (
                  <div key={st.id} className="lt-sammelset" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '14px', backgroundColor: st.voll ? '#FFF4C7' : '#FBF6EC' }}>
                    <span style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800 }}>{st.name} <span style={{ fontWeight: 600, color: LT.muted }}>· Bonus-Titel „{st.titel}“</span></span>
                      <span style={{ display: 'block', height: '8px', borderRadius: '4px', backgroundColor: '#EADCC3', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${Math.round((st.hat / st.teile.length) * 100)}%`, backgroundColor: st.voll ? '#2F7A3E' : '#FFC72C' }} /></span>
                      <span style={{ fontSize: '13px', color: LT.muted }}>{st.hat} von {st.teile.length} Teilen</span>
                    </span>
                    {st.voll && <button type="button" onClick={() => onEquip('title', an ? null : st.titel)} style={{ minHeight: '40px', padding: '0 14px', borderRadius: '999px', border: 'none', backgroundColor: an ? '#2F7A3E' : '#1F140C', color: an ? '#FFFFFF' : '#FFD86B', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>{an ? '✓ an' : 'anlegen'}</button>}
                  </div>
                );
              })}
            </div>
          )}
          {tab === 'joker' && onSchenken && kollegen.length > 0 && (() => {
            const j = TIP_SHOP.find((i) => i.id === gJoker);
            const wer = kollegen.find((x) => x.k === gAn);
            const frei = Math.max(0, 3 - geschenkeHeute);
            const geht = !!j && !!wer && frei > 0 && balance >= j.price;
            return (
              <div className="lt-schenken" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px 16px', borderRadius: '18px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)' }}>
                <div style={{ fontWeight: 800, fontSize: '17px' }}>Einem Kollegen etwas schenken</div>
                <div style={{ fontSize: '14px', color: LT.brown }}>Du bezahlst mit deinem Trinkgeld, dein Kollege bekommt beim nächsten Öffnen der App ein Pop-up mit deinem Geschenk. Bis zu 3 Geschenke am Tag{frei < 3 ? `, heute noch ${frei}` : ''}.</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['j_los', 'j_5050', 'j_swap', 'j_time', 'j_spin', 'j_schutz', 'j_double'].map((id) => { const it = TIP_SHOP.find((i) => i.id === id); if (!it) return null; const on = gJoker === id; return (
                    <button key={id} type="button" aria-pressed={on} onClick={() => setGJoker(id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 12px 0 6px', borderRadius: '999px', border: on ? '2px solid #1F140C' : '2px solid #E3D6BE', backgroundColor: on ? '#FFF4C7' : '#FFFFFF', fontWeight: 700, fontSize: '14px', cursor: 'pointer', color: LT.ink }}><ShopIcon3D k={id} size={26} />{it.label} · {tipEuro(it.price)}</button>
                  ); })}
                </div>
                <select value={gAn} onChange={(e) => setGAn(e.target.value)} aria-label="Kollege auswählen" style={{ minHeight: '46px', padding: '0 12px', borderRadius: '12px', border: '2px solid #E3D6BE', fontSize: '16px', backgroundColor: '#FFFFFF', color: LT.ink }}>
                  <option value="">Wem möchtest du etwas schenken?</option>
                  {kollegen.map((x) => <option key={x.k} value={x.k}>{x.name}</option>)}
                </select>
                <button type="button" disabled={!geht} onClick={() => { if (!geht || !j || !wer) return; onSchenken(j.id, wer.k, wer.name); setRing((r) => r + 1); setGAn(''); }} style={{ minHeight: '48px', borderRadius: '999px', border: 'none', backgroundColor: geht ? '#1F140C' : '#CBBBA4', color: geht ? '#FFD86B' : '#FFFFFF', fontWeight: 800, fontSize: '16px', cursor: geht ? 'pointer' : 'default' }}>
                  {!wer ? 'Erst einen Kollegen auswählen' : frei === 0 ? 'Heute schon 3 Geschenke verschickt' : j && balance < j.price ? `Noch ${tipEuro(j.price - balance)} Trinkgeld nötig` : `${j?.label} an ${wer.name} schenken (${tipEuro(j?.price || 0)})`}
                </button>
              </div>
            );
          })()}
          {tab === 'joker' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: LT.brown, padding: '14px 16px', borderRadius: '18px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)' }}>
              {list('joker').map(j => <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ flex: '0 0 auto' }}><ShopIcon3D k={j.id} size={30} /></span><span><strong>{j.label}:</strong> {j.desc}</span></div>)}
            </div>
          )}
          {/* So kommt Geld in die Kasse */}
          <div style={{ padding: '16px', borderRadius: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '16px' }}><ShopIcon3D k="coin" size={30} />So kommt Trinkgeld in deine Kasse</div>
            <div style={{ fontSize: '15px', color: LT.brown, lineHeight: 1.45 }}>Im Theken-Simulator freundlich beraten und richtig rausgeben (höchstens {tipEuro(TIP_DAY_CAP)} am Tag), jeden Tag die Anmelde-Belohnung abholen und am Glücksrad drehen. Gekauftes gehört dir für immer, antippen zum An- oder Ablegen.</div>
          </div>
        </div>
        {/* Kassenbon */}
        {bon && (
          <div key={bon.k} className="lt-shopbon lt-papier" role="status">
            <div style={{ textAlign: 'center', fontWeight: 800, letterSpacing: '2px' }}>BÄCKEREI HINKEL</div>
            <div style={{ textAlign: 'center', fontSize: '12px' }}>Trinkgeld-Laden · Kassenbon</div>
            <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span>1× {bon.it.icon} {bon.it.label}</span><span>{tipEuro(bon.price)}</span></div>
            <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>SUMME</span><span>{tipEuro(bon.price)}</span></div>
            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '13px' }}>Danke für deinen Einkauf!</div>
          </div>
        )}
        {bon && <span key={'kc' + bon.k} className="lt-kaching" aria-hidden="true">Ka-ching!</span>}
      </div>
    </div>
  );
}

/** Zeichen der Bon-Rahmen (Bestenliste) */
export const RAHMEN_ZEICHEN: Record<string, string> = Object.fromEntries(PT_SHOP.filter((i) => i.kind === 'frame').map((i) => [i.id, i.icon]));

// ── Sammel-Sets (Version 226): wer alle Teile einer Reihe hat, bekommt einen seltenen Bonus-Titel ──
export type SammelSet = { id: string; name: string; titel: string; teile: string[] };
const ids = (f: (i: ShopItem) => boolean) => TIP_SHOP.filter(f).map((i) => i.id);
export const SAMMEL_SETS: SammelSet[] = [
  { id: 'brot', name: 'Brotkorb', titel: 'Brotkorb-Meister', teile: ['a_brot', 'a_brezel', 'a_croissant', 'a_baguette', 'a_aehre'] },
  { id: 'suess', name: 'Süße Theke', titel: 'Naschkatze', teile: ['a_keks', 'a_muffin', 'a_kuchen', 'a_kaffee', 'a_torte', 'a_schoko'] },
  { id: 'zutaten', name: 'Gute Zutaten', titel: 'Rezept-Kenner', teile: ['a_butter', 'a_honig', 'a_apfel', 'a_nuss', 'a_kirsche'] },
  { id: 'bewegung', name: 'Alle Bewegungen', titel: 'Show-Talent', teile: ids((i) => i.kind === 'effect') },
  { id: 'farben', name: 'Alle Farben', titel: 'Farbkünstler', teile: ids((i) => i.kind === 'theme') },
  { id: 'jahr', name: 'Jahreszeiten', titel: 'Jahres-Sammler', teile: ids((i) => i.kind === 'avatar' && !!i.months) },
];
export const setStand = (owned: string[]) => SAMMEL_SETS.map((st) => {
  const hat = st.teile.filter((t) => owned.includes(t)).length;
  return { ...st, hat, voll: hat === st.teile.length };
});

/** Überraschungstüte (Version 229): vorher auslosen, dann speichern. Teile, die man schon hat, kommen nicht in die Tüte. */
export type TuetenInhalt = { art: 'teil'; it: ShopItem } | { art: 'joker'; it: ShopItem } | { art: 'geld'; cents: number };
export function tueteAuslosen(owned: string[], zufall = Math.random): TuetenInhalt {
  const teile = TIP_SHOP.filter((i) => ['avatar', 'effect', 'title', 'theme', 'schrift', 'jubel'].includes(i.kind) && !i.months && !i.woche && i.price <= 1000 && !owned.includes(i.id));
  const joker = TIP_SHOP.filter((i) => i.kind === 'joker' && JOKER_FIELD[i.id] && i.id !== 'j_tuete');
  const r = zufall();
  if (r < 0.45 && teile.length) return { art: 'teil', it: teile[Math.floor(zufall() * teile.length)] };
  if (r < 0.8) return { art: 'joker', it: joker[Math.floor(zufall() * joker.length)] };
  return { art: 'geld', cents: [50, 100, 100, 150, 200, 300][Math.floor(zufall() * 6)] };
}

/** Sauerteig Teigi (Version 229): Zustand aus den Lerntagen ausgerechnet, gespeichert wird nur der Kauf (_teigiSeit, _teigiStart) */
/** futter = Lerntage seit dem Kauf (aus dem Stempel-Zähler _stamps, der nie kleiner wird) */
export function teigiStand(days: string[], futter: number, heute = new Date()) {
  const dk = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const stufe = futter >= 40 ? 3 : futter >= 15 ? 2 : futter >= 5 ? 1 : 0;
  const letzter = (days || []).filter((d) => d <= dk(heute)).sort().pop();
  const ohne = letzter ? Math.round((new Date(dk(heute)).getTime() - new Date(letzter).getTime()) / 86400000) : 99;
  const laune: 'froh' | 'gut' | 'schlapp' = ohne === 0 ? 'froh' : ohne <= 2 ? 'gut' : 'schlapp';
  return { futter, stufe, laune, name: ['Baby-Teigi', 'Junger Teigi', 'Kräftiger Teigi', 'Meister-Teigi'][stufe], naechste: [5, 15, 40, 0][stufe] };
}

/** Das Sauerteig-Glas von Teigi: Stufe 0 bis 3 (Füllhöhe), Laune froh/gut/schlapp.
 *  Version 233: Gesicht immer mitten im Glas (nicht mehr an der Füllhöhe), Glasfarbe und Hut/Zubehör aus dem Laden */
export const TEIGI_GLAS: Record<string, { glas: string; rand: string; deckel: string }> = {
  klar: { glas: '#FFF3DC', rand: '#E7B65A', deckel: '#B98A0A' },
  tg_bernstein: { glas: '#F6D9A0', rand: '#B8741E', deckel: '#7A4A10' },
  tg_rose: { glas: '#F9D5DF', rand: '#C8708C', deckel: '#8A3E57' },
  tg_mint: { glas: '#D3F1E4', rand: '#4FA582', deckel: '#2F6A52' },
  tg_gold: { glas: '#FFE9A0', rand: '#D99A0A', deckel: '#E0A400' },
};
/** Version 243: Teigi als 3D-Figur (Entwurf 1 „Goldener Glas-Held“): bauchiges Glas mit Lichtbrechung, goldener Schraubdeckel,
 *  Teig mit Tiefe und Bläschen, glänzende Augen, Schatten am Boden. Bildfläche 116 × 116 ab (2|6) (Glas von x 28 bis 92, Deckel oben bei y 17). */
export function TeigiGlas({ stufe, laune, size = 56, hut, glas }: { stufe: number; laune: 'froh' | 'gut' | 'schlapp'; size?: number; hut?: string | null; glas?: string | null }) {
  const id = 'tg' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const u = (n: string) => `url(#${n}${id})`;
  const g = TEIGI_GLAS[glas || 'klar'] || TEIGI_GLAS.klar;
  const schlapp = laune === 'schlapp';
  // Version 247: Teigi wächst sichtbar. Stufe 0 Baby, 1 jung (Teig wölbt sich, mehr Bläschen), 2 kräftig (Teig drückt den Deckel schief),
  // 3 Meister (Teig quillt oben heraus, Deckel obenauf, goldener Schimmer)
  const st = Math.max(0, Math.min(3, stufe));
  const y = [92, 78, 58, 46][st];
  const wolbung = schlapp ? 1 : [-6, -9, -10, -10][st];
  const deckel = st === 3 ? 'translate(5 -13) rotate(-14 60 24)' : st === 2 ? 'translate(0 -3) rotate(-6 60 24)' : undefined;
  const glasForm = 'M28 40c0-7 4-10 11-10h42c7 0 11 3 11 10v62c0 12-7 18-19 18H47c-12 0-19-6-19-18z';
  const teigForm = `M31 ${y + 2}q8 ${wolbung} 15 -1t15 0 15 0 13 -1V102c0 10-5 15-15 15H47c-10 0-16-5-16-15z`;
  const auge = (x: number) => schlapp
    ? <g key={x}><ellipse className="lt-teigi-auge" cx={x} cy="83" rx="6" ry="3.6" fill={u('auge')} /><path d={`M${x - 7} 80q7 -3 14 0`} stroke="#5A3418" strokeWidth="2" fill="none" strokeLinecap="round" /></g>
    : <g key={x}><ellipse className="lt-teigi-auge" cx={x} cy="81" rx="6.2" ry="7.1" fill={u('auge')} /><ellipse cx={x - 1.8} cy="78.6" rx="2.4" ry="2.6" fill="#FFFFFF" /><circle cx={x + 2} cy="83.6" r="1" fill="#FFFFFF" opacity=".85" /></g>;
  const rillen = Array.from({ length: 18 }, (_, k) => <path key={k} d={`M${30 + (k + 1) * 3.2} 20v11`} stroke="#7A4A0A" strokeOpacity=".35" strokeWidth="1" />);
  return (
    <svg width={size} height={size} viewBox="2 6 116 116" aria-hidden="true" className={laune === 'froh' ? 'lt-papier lt-teigi lt-teigi-froh' : 'lt-papier lt-teigi'} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id={`weich${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id={`glow${id}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
        <linearGradient id={`gold${id}`} x1="0" x2="1"><stop offset="0" stopColor="#8C5A0A" /><stop offset=".18" stopColor="#E0A400" /><stop offset=".38" stopColor="#FFF4C2" /><stop offset=".55" stopColor="#FFC72C" /><stop offset=".8" stopColor="#B8860B" /><stop offset="1" stopColor="#6E440A" /></linearGradient>
        <linearGradient id={`goldTop${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF7D6" /><stop offset=".6" stopColor="#FFD24A" /><stop offset="1" stopColor="#C9901A" /></linearGradient>
        <linearGradient id={`glas${id}`} x1="0" x2="1"><stop offset="0" stopColor={g.rand} stopOpacity=".55" /><stop offset=".12" stopColor={g.glas} stopOpacity=".35" /><stop offset=".5" stopColor="#FFFFFF" stopOpacity=".08" /><stop offset=".86" stopColor={g.glas} stopOpacity=".3" /><stop offset="1" stopColor={g.rand} stopOpacity=".6" /></linearGradient>
        <radialGradient id={`teig${id}`} cx="45%" cy="25%" r="85%">{schlapp
          ? <><stop offset="0" stopColor="#F4EEE2" /><stop offset=".5" stopColor="#E2D6BE" /><stop offset="1" stopColor="#B9A27C" /></>
          : <><stop offset="0" stopColor="#FFF7E4" /><stop offset=".45" stopColor="#F7DFAE" /><stop offset=".8" stopColor="#E2B66E" /><stop offset="1" stopColor="#C38E44" /></>}</radialGradient>
        <radialGradient id={`blase${id}`} cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".55" stopColor="#FFF4DE" stopOpacity=".7" /><stop offset="1" stopColor="#C9954E" stopOpacity=".8" /></radialGradient>
        <radialGradient id={`auge${id}`} cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#5A3418" /><stop offset=".6" stopColor="#2B170A" /><stop offset="1" stopColor="#120904" /></radialGradient>
        <linearGradient id={`kante${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".95" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
        <radialGradient id={`boden${id}`}><stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id={`weiss${id}`} cx="35%" cy="25%" r="80%"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".7" stopColor="#F6F0E4" /><stop offset="1" stopColor="#D9CCB2" /></radialGradient>
        <linearGradient id={`rot${id}`} x1="0" x2="1"><stop offset="0" stopColor="#8E1B12" /><stop offset=".4" stopColor="#E0372A" /><stop offset="1" stopColor="#9A2015" /></linearGradient>
        <linearGradient id={`rosa${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFB3C7" /><stop offset=".6" stopColor="#E8577A" /><stop offset="1" stopColor="#A82A50" /></linearGradient>
        <linearGradient id={`linse${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A3A30" /><stop offset="1" stopColor="#0E0907" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="121" rx="40" ry="7" fill={u('boden')} />
      {!schlapp && <ellipse cx="60" cy={st === 3 ? 62 : 70} rx={st === 3 ? 52 : 44} ry={st === 3 ? 58 : 50} fill="#FFC72C" opacity={st === 3 ? '.42' : '.2'} filter={u('glow')} />}
      <path d={glasForm} fill={g.glas} opacity=".72" />
      <path d={teigForm} fill={u('teig')} />
      {!schlapp && <g>
        <circle className="lt-teigi-blase" cx="40" cy="96" r="3.4" fill={u('blase')} /><circle className="lt-teigi-blase lt-tb2" cx="80" cy="102" r="2.6" fill={u('blase')} />
        <circle className="lt-teigi-blase lt-tb3" cx="74" cy={Math.max(y + 10, 72)} r="2.1" fill={u('blase')} /><circle cx="62" cy="108" r="2" fill={u('blase')} />
        {st >= 1 && <><circle className="lt-teigi-blase lt-tb2" cx="50" cy="106" r="2.8" fill={u('blase')} /><circle className="lt-teigi-blase" cx="84" cy="88" r="1.8" fill={u('blase')} /><circle cx="36" cy="104" r="1.6" fill={u('blase')} /></>}
        {st >= 2 && <><circle className="lt-teigi-blase lt-tb3" cx="40" cy="68" r="2.4" fill={u('blase')} /><circle cx="70" cy="112" r="2.2" fill={u('blase')} /><circle className="lt-teigi-blase" cx="82" cy="70" r="1.6" fill={u('blase')} /></>}
      </g>}
      {!schlapp && <g filter={u('weich')} fill="#FF8C8C" opacity=".55"><ellipse cx="41" cy="92" rx="6" ry="3.6" /><ellipse cx="79" cy="92" rx="6" ry="3.6" /></g>}
      {[48, 72].map(auge)}
      {laune === 'froh' && <g><path d="M52.5 92q7.5 8.6 15 0q-7.5 2.6 -15 0z" fill="#3A1A0A" /><path d="M56.6 96.6q3.4 -2.8 6.8 0q-3.4 2.2 -6.8 0z" fill="#E86A6A" /></g>}
      {laune === 'gut' && <path d="M54 92.5q6 5 12 0" stroke="#3A1A0A" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      {schlapp && <path d="M54 97q6 -4 12 0" stroke="#3A1A0A" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      <path d={glasForm} fill={u('glas')} stroke={g.rand} strokeOpacity=".9" strokeWidth="2.2" />
      <path d="M35 40v58" stroke={u('kante')} strokeWidth="4.6" strokeLinecap="round" opacity=".9" />
      <path d="M42 42v12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <path d="M88 46v52" stroke="#FFE7A8" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      {hut === 'tz_brille' && <g>
        <path d="M37 76q0-5 5-5h12q4 0 4 4v4q0 7-8 7h-5q-8 0-8-6z" fill={u('linse')} stroke="#C9901A" strokeWidth="1.6" />
        <path d="M83 76q0-5-5-5H66q-4 0-4 4v4q0 7 8 7h5q8 0 8-6z" fill={u('linse')} stroke="#C9901A" strokeWidth="1.6" />
        <path d="M58 75q2-2 4 0M37 74l-8-4M83 74l8-4" stroke="#C9901A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M41 75l5-2M67 75l5-2" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      </g>}
      {/* Stufe 2: Teig drückt unter dem schiefen Deckel heraus */}
      {st === 2 && <path d="M60 31q12 -9 29 -5q2 3 1 5z" fill={u('teig')} />}
      {/* Stufe 3: Teig quillt oben aus dem Glas und läuft über den Rand */}
      {st === 3 && <g>
        <path d="M26 36C24 20 40 8 60 8S96 20 94 36C95 40 93 44 91 46C90 41 87 37 84 36C80 38 74 37 70 35C64 38 56 38 50 35C44 38 38 38 34 36C32 40 31 48 28 50C26 46 26 41 26 36Z" fill={u('teig')} />
        <ellipse cx="46" cy="18" rx="12" ry="5" fill="#FFFFFF" opacity=".55" filter={u('weich')} />
        <circle className="lt-teigi-blase" cx="70" cy="18" r="2.4" fill={u('blase')} /><circle className="lt-teigi-blase lt-tb2" cx="52" cy="26" r="1.8" fill={u('blase')} /><circle cx="80" cy="27" r="1.6" fill={u('blase')} />
        {!schlapp && [[16, 30, 1], [104, 22, .8], [100, 62, .7], [20, 70, .6]].map(([sx, sy, sk], k) => <path key={k} d={`M${sx} ${sy - 6 * sk}L${sx + 1.6 * sk} ${sy - 1.6 * sk}L${sx + 6 * sk} ${sy}L${sx + 1.6 * sk} ${sy + 1.6 * sk}L${sx} ${sy + 6 * sk}L${sx - 1.6 * sk} ${sy + 1.6 * sk}L${sx - 6 * sk} ${sy}L${sx - 1.6 * sk} ${sy - 1.6 * sk}Z`} fill="#FFE27A" opacity=".95" />)}
      </g>}
      {/* goldener Schraubdeckel (mit Hut), ab Stufe 2 vom Teig angehoben */}
      <g transform={deckel}>
      <rect x="30" y="17" width="60" height="14" rx="3" fill={u('gold')} />{rillen}
      <ellipse cx="60" cy="18" rx="30" ry="3.6" fill={u('goldTop')} />
      <path d="M35 16.6h44" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity=".85" />
      <rect x="30" y="29" width="60" height="2.2" fill="#6E440A" opacity=".45" />
      {/* Hüte und Zubehör aus dem Laden */}
      {hut === 'tz_muetze' && <g>
        <circle cx="46" cy="0" r="10" fill={u('weiss')} /><circle cx="74" cy="0" r="10" fill={u('weiss')} /><circle cx="60" cy="-5" r="12.5" fill={u('weiss')} />
        <path d="M42 4h36v10H42z" fill={u('weiss')} />
        <rect x="40" y="8" width="40" height="9" rx="2" fill={u('weiss')} stroke="#D9CCB2" strokeWidth="1" />
        <path d="M50 9v7M60 9v7M70 9v7" stroke="#D9CCB2" strokeWidth="1" />
        <ellipse cx="55" cy="-10" rx="5" ry="2.6" fill="#FFFFFF" opacity=".9" />
      </g>}
      {hut === 'tz_weihnacht' && <g>
        <path d="M36 14q6-28 30-30q16 2 20 18l-6 3q-4-10-12-10q-6 14-6 19z" fill={u('rot')} />
        <rect x="32" y="9" width="56" height="10" rx="5" fill={u('weiss')} />
        <circle cx="82" cy="8" r="6" fill={u('weiss')} />
        <path d="M46 -6q6-6 12-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity=".5" fill="none" />
      </g>}
      {hut === 'tz_schleife' && <g transform="translate(78 16)">
        <path d="M0 0l-14-9q-4 9 0 18z" fill={u('rosa')} /><path d="M0 0l14-9q4 9 0 18z" fill={u('rosa')} />
        <path d="M-2 2l-5 12h4l3-8 3 8h4l-5-12z" fill="#C83E66" />
        <circle cx="0" cy="0" r="4" fill="#B2345A" /><circle cx="-1.2" cy="-1.2" r="1.3" fill="#FFFFFF" opacity=".6" />
        <path d="M-11 -5l5 3M11 -5l-5 3" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      </g>}
      {hut === 'tz_blume' && <g transform="translate(78 12)">
        {[0, 72, 144, 216, 288].map((w) => <ellipse key={w} cx={Math.cos(w * Math.PI / 180) * 6.5} cy={Math.sin(w * Math.PI / 180) * 6.5} rx="5.4" ry="4.4" transform={`rotate(${w} ${Math.cos(w * Math.PI / 180) * 6.5} ${Math.sin(w * Math.PI / 180) * 6.5})`} fill={u('weiss')} />)}
        <circle cx="0" cy="0" r="4.6" fill={u('goldTop')} /><circle cx="-1.4" cy="-1.4" r="1.4" fill="#FFFFFF" opacity=".7" />
      </g>}
      {hut === 'tz_krone' && <g>
        <path d="M38 17l3-20 10 10 9-15 9 15 10-10 3 20z" fill={u('gold')} stroke="#8C5A0A" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="38" y="12" width="44" height="6" fill={u('goldTop')} />
        <circle cx="60" cy="6" r="3.2" fill="#D92D20" /><circle cx="59" cy="5" r="1" fill="#FFFFFF" opacity=".8" />
        <circle cx="45" cy="9" r="2" fill="#2E7DD7" /><circle cx="75" cy="9" r="2" fill="#2FA36B" />
        <circle cx="41" cy="-3" r="2" fill={u('goldTop')} /><circle cx="60" cy="-8" r="2.2" fill={u('goldTop')} /><circle cx="79" cy="-3" r="2" fill={u('goldTop')} />
      </g>}
      </g>
    </svg>
  );
}

/** Jubel-Effekt am Quiz-Ende (Version 229): Brezelregen, Mehlwolke oder Sternenregen */
export function JubelEffekt({ id }: { id?: string | null }) {
  if (!id) return null;
  const zeichen = id === 'jb_brezel' ? '🥨' : id === 'jb_sterne' ? '⭐' : '';
  return (
    <div className={`lt-jubel lt-jubel-${id.replace('jb_', '')}`} aria-hidden="true">
      {Array.from({ length: id === 'jb_mehl' ? 14 : 22 }, (_, i) => (
        <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.18}s`, fontSize: `${18 + (i % 4) * 6}px` }}>{zeichen}</span>
      ))}
    </div>
  );
}
