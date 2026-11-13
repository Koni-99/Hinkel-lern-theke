// ═══ Laden: Trinkgeld-Laden, Schatzkammer, Preise, Namensfarben ═══
// Vorher in appBasis.tsx. Inhalt unverändert übernommen.
import { useState, useEffect } from 'react';
import { TH } from '../ui/basis';
import { LT } from './marke';
import { LtIcon, ICON } from './symbole';
import { useCountUp } from './serie';

/** Einfaches Linien-Symbol (statt Emojis) */
// ── Trinkgeld-Laden: Preise in Cent ──
export type ShopItem = { id: string; kind: 'avatar' | 'title' | 'joker' | 'theme' | 'effect'; label: string; icon: string; price: number; desc?: string; months?: number[] };

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
  { id: 'a_torte', kind: 'avatar', icon: '🎂', label: 'Torte', price: 1250 },
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
  { id: 't_bote', kind: 'title', icon: '🏷️', label: 'Brötchen-Bote', price: 400 },
  { id: 't_talent', kind: 'title', icon: '🏷️', label: 'Theken-Talent', price: 600 },
  { id: 't_brezel', kind: 'title', icon: '🏷️', label: 'Brezel-Profi', price: 1000 },
  { id: 't_kasse', kind: 'title', icon: '🏷️', label: 'Kassen-Ass', price: 1250 },
  { id: 't_liebling', kind: 'title', icon: '🏷️', label: 'Kundenliebling', price: 2000 },
  { id: 't_legende', kind: 'title', icon: '🏷️', label: 'Theken-Legende', price: 3000 },
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
  { id: 'j_5050', kind: 'joker', icon: '🃏', label: '50:50-Joker', price: 200, desc: 'Lernen-Quiz: zwei falsche Antworten verschwinden.' },
  { id: 'j_swap', kind: 'joker', icon: '🔄', label: 'Tausch-Joker', price: 150, desc: 'Lernen-Quiz: die Frage gegen eine andere tauschen.' },
  { id: 'j_time', kind: 'joker', icon: '⏱️', label: 'Zeit-Joker', price: 150, desc: 'Quiz Battle: 10 Sekunden mehr für eine Frage.' },
  { id: 'j_double', kind: 'joker', icon: '✖️', label: 'Doppel-Joker', price: 400, desc: 'Lernen-Quiz: die Punkte für ein ganzes Quiz verdoppeln.' },
  { id: 'j_spin', kind: 'joker', icon: '🎟️', label: 'Extra-Dreh', price: 300, desc: 'Glücksrad: einmal zusätzlich drehen.' },
  { id: 'j_los', kind: 'joker', icon: '🎫', label: 'Rubbellos', price: 50, desc: 'Frei rubbeln und gewinnen: Punkte, Trinkgeld oder ein Joker. Mit etwas Glück ein seltenes Goldlos mit 5.000 Punkten! Startseite unter „Heute für dich“.' },
];

export const JOKER_FIELD: Record<string, string> = { j_5050: '_jokers', j_swap: '_jokersSwap', j_time: '_jokersTime', j_double: '_jokersDouble', j_spin: '_jokersSpin', j_los: '_jokersLos' };

/** Tagesangebot: jeden Tag ein anderes Teil zum halben Preis */
export const dealOfDay = (d = new Date()): ShopItem => {
  const pool = TIP_SHOP.filter(i => inSeason(i, d));
  const k = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  return pool[(k * 7919) % pool.length];
};

export const shopPrice = (it: ShopItem, d = new Date()) => (dealOfDay(d).id === it.id ? Math.max(50, Math.round(it.price / 100) * 50) : it.price);

export const inSeason = (it: ShopItem, d = new Date()) => !it.months || it.months.includes(d.getMonth() + 1);

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
      {k === 'diamond' && <g><path d="M-18-6l8-10h20l8 10-18 22z" fill="url(#shGem)" stroke="#1E6FB8" strokeWidth="1.2" strokeLinejoin="round" /><path d="M-18-6h36M-10-16l4 10 6 22M10-16l-4 10-6 22M-6-6l6-10 6 10" stroke="rgba(255,255,255,.65)" strokeWidth="1" fill="none" /><path d="M-12-12l3-3" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" /></g>}
      {k === 'coin' && <g><circle cy="3" r="18" fill="#A87A0E" /><circle r="18" fill="url(#shGold)" stroke="#A87A0E" strokeWidth="1.4" /><text y="1" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="900" fill="#7A5300" fontFamily="Arial, sans-serif">€</text><ellipse cx="-6" cy="-9" rx="6" ry="3" fill="rgba(255,255,255,.7)" /></g>}
      {k === 'star' && <g><polygon points={Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 9 : 20; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(' ')} fill="url(#shGold)" stroke="#A87A0E" strokeWidth="1.2" strokeLinejoin="round" /><ellipse cx="-5" cy="-7" rx="5" ry="2.6" fill="rgba(255,255,255,.75)" /></g>}
    </svg>
  );
}

/** ── Trinkgeld-Laden: wie eine kleine Bäckerei mit Markise, Regalen, Preisschildern und Kasse ── */
/** CSS-Klasse für die gekaufte Namensfarbe */
export const nameClassOf = (pr: any): string | undefined => (pr && pr._nameColor ? `lt-nc lt-nc-${String(pr._nameColor).replace('pt_nc_', '')}` : pr && pr._gold ? 'lt-goldname' : undefined);

export type ShopTab = 'zeichen' | 'bewegung' | 'titel' | 'farben' | 'joker' | 'schatz';

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
  { id: 'pt_av_krone', kind: 'avatar', icon: '👑', label: 'Krone', price: 6000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_einhorn', kind: 'avatar', icon: '🦄', label: 'Einhorn', price: 6000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_drache', kind: 'avatar', icon: '🐉', label: 'Drache', price: 8000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_phoenix', kind: 'avatar', icon: '🦚', label: 'Pfau', price: 8000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_rakete', kind: 'avatar', icon: '🚀', label: 'Rakete', price: 7000, desc: 'Seltenes Zeichen, gibt es nur hier.' },
  { id: 'pt_av_diamant', kind: 'avatar', icon: '💎', label: 'Diamant', price: 12000, desc: 'Das seltenste Zeichen.' },
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
  { id: 'pt_spruch', kind: 'spruch', icon: '💬', label: 'Spruch des Tages', price: 15000, desc: 'Dein Satz steht einen Tag lang bei allen auf der Startseite. Der Ausbilder gibt ihn vorher frei.' },
];

export function TipShop({ prog, onBuy, onEquip, onClose, ptsBalance = 0, onBuyPts, onEquipPts }: { prog: any; onBuy: (it: ShopItem) => void; onEquip: (kind: 'avatar' | 'title' | 'theme' | 'effect', value: string | null) => void; onClose: () => void; ptsBalance?: number; onBuyPts?: (it: PtItem, text?: string) => void; onEquipPts?: (it: PtItem, on: boolean) => void }) {
  const [spruch, setSpruch] = useState('');
  const balance = (Number(prog._tipCents) || 0) - (Number(prog._tipSpent) || 0);
  const owned: string[] = Array.isArray(prog._shopOwned) ? prog._shopOwned : [];
  const [tab, setTab] = useState<ShopTab>('zeichen');
  const [bon, setBon] = useState<{ it: ShopItem; price: number; k: number } | null>(null);
  const [ring, setRing] = useState(0);
  const shown = useCountUp(balance, 700);
  const deal = dealOfDay();
  useEffect(() => { if (!bon) return; const t = window.setTimeout(() => setBon(null), 3200); return () => window.clearTimeout(t); }, [bon]);
  const tabs: { id: ShopTab; icon: string; label: string }[] = [
    { id: 'zeichen', icon: '🥐', label: 'Zeichen' }, { id: 'bewegung', icon: '✨', label: 'Bewegung' }, { id: 'titel', icon: '🏷️', label: 'Titel' }, { id: 'farben', icon: '🎨', label: 'Farben' }, { id: 'joker', icon: '🃏', label: 'Joker' }, { id: 'schatz', icon: '💎', label: 'Schatzkammer' },
  ];
  const list = (t: ShopTab) => TIP_SHOP.filter(i =>
    t === 'zeichen' ? i.kind === 'avatar' && (!i.months || inSeason(i) || owned.includes(i.id))
      : t === 'bewegung' ? i.kind === 'effect' : t === 'titel' ? i.kind === 'title' : t === 'farben' ? i.kind === 'theme' : i.kind === 'joker');
  const themeSwatch: Record<string, string> = { th_schoko: '#6B3E1F', th_pistazie: '#9BC27A', th_erdbeere: '#F2667A', th_blaubeere: '#5B7FD6', th_vanille: '#F7E3A1', th_karamell: '#E0A458', th_himbeere: '#E8577A', th_minze: '#9FE0C9', th_lavendel: '#C7B4EC', th_zitrone: '#FFF07A' };
  const item = (it: ShopItem, i: number) => {
    const has = it.kind !== 'joker' && owned.includes(it.id);
    const active = (it.kind === 'avatar' && prog._avatar === it.icon) || (it.kind === 'title' && prog._title === it.label) || (it.kind === 'theme' && prog._theme === it.id) || (it.kind === 'effect' && prog._effect === it.id);
    const price = shopPrice(it); const isDeal = price < it.price; const afford = balance >= price;
    const count = it.kind === 'joker' ? Number(prog[JOKER_FIELD[it.id]]) || 0 : 0;
    const click = () => {
      if (has) { onEquip(it.kind as 'avatar' | 'title' | 'theme' | 'effect', active ? null : (it.kind === 'avatar' ? it.icon : it.kind === 'theme' || it.kind === 'effect' ? it.id : it.label)); return; }
      if (!afford) return;
      onBuy(it); setBon({ it, price, k: Date.now() }); setRing(r => r + 1);
    };
    const wide = it.kind === 'title' || it.kind === 'joker';
    return (
      <button key={it.id} onClick={click} disabled={!has && !afford} className={!has && !afford ? 'lt-shop-item lt-shop-off' : 'lt-shop-item'} title={it.desc}
        style={{ animationDelay: `${i * 0.04}s`, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '16px 8px 12px', minHeight: wide ? '150px' : '150px', border: 'none', borderRadius: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', outline: active ? '2.5px solid #FFC72C' : 'none', outlineOffset: '-2.5px', cursor: has || afford ? 'pointer' : 'not-allowed', color: LT.ink, gridColumn: wide ? 'span 2' : undefined }}>
        {isDeal && !has && <span className="lt-deal" style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2, padding: '3px 8px', borderRadius: '999px', backgroundColor: '#D92D20', color: '#FFFFFF', fontSize: '12px', fontWeight: 800 }}>-50 %</span>}
        {count > 0 && <span style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, minWidth: '26px', height: '26px', padding: '0 6px', borderRadius: '13px', backgroundColor: TH.green, color: '#FFFFFF', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×{count}</span>}
        <span className="lt-shop-goods lt-shop-pedestal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '64px' }}>
          {it.kind === 'theme'
            ? <span className="lt-shop-ball" style={{ ['--c' as any]: themeSwatch[it.id] || LT.yellow }} />
            : it.kind === 'title'
              ? <span style={{ padding: '8px 14px', borderRadius: '999px', backgroundColor: '#FFC72C', color: '#2B170A', fontSize: '15px', fontWeight: 800, boxShadow: '0 3px 0 #B98A0A, 0 8px 14px -8px rgba(31,20,12,.5)' }}>{it.icon} {it.label}</span>
              : it.kind === 'joker' ? <ShopIcon3D k={it.id} size={56} /> : <span className={`lt-shop-emo ${it.kind === 'effect' ? `lt-fx-${it.id.replace('fx_', '')}` : 'lt-emo-bob'}`} style={{ fontSize: '46px', lineHeight: 1, animationDelay: `${-(i % 5) * 0.4}s` }}>{it.kind === 'effect' ? (prog._avatar || '🥨') : it.icon}</span>}
        </span>
        {it.kind !== 'title' && <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{it.label}</span>}
        <span className="lt-pricetag" style={{ backgroundColor: active ? '#2F7A3E' : has ? '#FFFFFF' : '#1F140C', color: active ? '#FFFFFF' : has ? LT.ink : '#FFD86B', border: has && !active ? '1.5px solid #E3D6BE' : 'none' }}>
          {active ? '✓ an' : has ? 'anlegen' : isDeal ? <><s style={{ opacity: 0.55, fontWeight: 400 }}>{tipEuro(it.price)}</s> {tipEuro(price)}</> : tipEuro(price)}
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
          {/* Tafel: Angebot des Tages */}
          <button className="lt-chalk" onClick={() => setTab(deal.kind === 'avatar' ? 'zeichen' : deal.kind === 'effect' ? 'bewegung' : deal.kind === 'title' ? 'titel' : deal.kind === 'theme' ? 'farben' : 'joker')}>
            <span className="lt-shop-pedestal" aria-hidden="true">{deal.kind === 'joker' ? <ShopIcon3D k={deal.id} size={50} /> : deal.kind === 'theme' ? <span className="lt-shop-ball" style={{ ['--c' as any]: '#FFC72C', width: '44px', height: '44px' }} /> : <span className="lt-shop-emo lt-emo-bob" style={{ fontSize: '42px' }}>{deal.icon}</span>}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>Heute im Angebot</span>
              <span style={{ display: 'block', fontSize: '22px', fontWeight: 700 }}>{deal.label}: {owned.includes(deal.id) && deal.kind !== 'joker' ? 'hast du schon' : `${tipEuro(shopPrice(deal))} statt ${tipEuro(deal.price)}`}</span>
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
            {tab === 'schatz' ? 'Besondere Sachen, die es nur für Punkte gibt. Lohnt es sich, dafür in der Bestenliste ein paar Plätze abzurutschen?' : tab === 'zeichen' ? 'Steht vor deinem Namen, auf der Startseite und in der Bestenliste. Saison-Zeichen gibt es nur eine Zeit lang.' : tab === 'bewegung' ? 'Lässt dein Zeichen tanzen. Immer ein Effekt gleichzeitig.' : tab === 'titel' ? 'Steht unter deinem Namen auf der Startseite.' : tab === 'farben' ? 'Färbt Knöpfe, Balken und die Markise in deiner App. Nur du siehst es.' : 'Jeder Joker hilft einmal. Du kannst mehrere sammeln.'}
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
                        <button disabled={(!has && !afford) || (it.kind === 'spruch' && (pending || spruch.trim().length < 3))}
                          onClick={() => { if (has) { onEquipPts?.(it, !on); return; } if (it.kind === 'spruch') { onBuyPts?.(it, spruch.trim()); setSpruch(''); } else onBuyPts?.(it); setRing(r => r + 1); }}
                          style={{ minHeight: '44px', borderRadius: '999px', border: 'none', backgroundColor: on ? '#2F7A3E' : has ? '#FFFFFF' : '#1F140C', color: on ? '#FFFFFF' : has ? LT.ink : '#FFD86B', fontSize: '15px', fontWeight: 800, cursor: 'pointer', opacity: (!has && !afford) || (it.kind === 'spruch' && (pending || spruch.trim().length < 3)) ? 0.45 : 1, boxShadow: has ? 'inset 0 0 0 1.5px #E3D6BE' : 'none' }}>
                          {on ? '✓ an (antippen zum Ablegen)' : has ? 'anlegen' : `${it.price.toLocaleString('de-DE')} Punkte`}
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
          <div key={bon.k} className="lt-shopbon" role="status">
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
