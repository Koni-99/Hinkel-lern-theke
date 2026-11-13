// ═══ Symbole: Duell, LtIcon, ICON, Spiel- und Menü-Symbole, Bereichsfarben ═══
// Vorher in appBasis.tsx. Inhalt unverändert übernommen.
import { dc } from '../daten/data';

/** Zwei Schwerter, die gegeneinander schlagen: Einladung zum Duell */
export function DuelSwords({ size = 26 }: { size?: number }) {
  return (
    <span className="lt-sw3d" style={{ display: 'inline-flex', perspective: '120px' }}>
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.45))' }}>
      <defs>
        <linearGradient id="swBlade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#C9D2DC" /><stop offset="1" stopColor="#6B7685" /></linearGradient>
        <linearGradient id="swGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF0A8" /><stop offset=".5" stopColor="#FFC72C" /><stop offset="1" stopColor="#A87A0E" /></linearGradient>
        <radialGradient id="swPommel" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#FFF6C8" /><stop offset=".55" stopColor="#FFC72C" /><stop offset="1" stopColor="#8A6200" /></radialGradient>
        <radialGradient id="swSpark"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#FFE38A" /><stop offset="1" stopColor="rgba(255,199,44,0)" /></radialGradient>
      </defs>
      <g className="lt-sw3-l">
        <path d="M8.50 20.50 L27.00 5.00 L11.50 23.50 Z" fill="url(#swBlade)" stroke="#4E5A68" strokeWidth=".6" strokeLinejoin="round" />
        <path d="M10.4 21.6 L24.6 7.4" stroke="rgba(255,255,255,.85)" strokeWidth=".8" />
        <path d="M6.4 18.4 L13.6 25.6" stroke="#FFC72C" strokeWidth="4" />
        <path d="M9.3 22.7 L5.9 26.1" stroke="#5A2E12" strokeWidth="4" />
        <path d="M8.6 24.5 L7.4 23.3 M7.4 25.7 L6.2 24.5" stroke="#8A4F22" strokeWidth=".7" />
        <circle cx="4.9" cy="27.1" r="2.2" fill="url(#swPommel)" />
      </g>
      <g className="lt-sw3-r">
        <path d="M23.50 20.50 L5.00 5.00 L20.50 23.50 Z" fill="url(#swBlade)" stroke="#4E5A68" strokeWidth=".6" strokeLinejoin="round" />
        <path d="M21.6 21.6 L7.399999999999999 7.4" stroke="rgba(255,255,255,.85)" strokeWidth=".8" />
        <path d="M25.6 18.4 L18.4 25.6" stroke="#FFC72C" strokeWidth="4" />
        <path d="M22.7 22.7 L26.1 26.1" stroke="#5A2E12" strokeWidth="4" />
        <path d="M23.4 24.5 L24.6 23.3 M24.6 25.7 L25.8 24.5" stroke="#8A4F22" strokeWidth=".7" />
        <circle cx="27.1" cy="27.1" r="2.2" fill="url(#swPommel)" />
      </g>
      <circle className="lt-spark3" cx="16" cy="13.5" r="8" fill="url(#swSpark)" />
      <path className="lt-spark3" d="M16 7 L17.2 12.3 L22.5 13.5 L17.2 14.7 L16 20 L14.8 14.7 L9.5 13.5 L14.8 12.3 Z" fill="#FFFFFF" />
    </svg>
    </span>
  );
}

export function DuelBadge({ n }: { n: number }) {
  return <span className="lt-duel-badge" style={{ position: 'absolute', top: '-9px', right: '-18px', minWidth: '20px', height: '20px', padding: '0 5px', borderRadius: '999px', backgroundColor: '#D92D20', color: '#FFFFFF', fontSize: '12px', fontWeight: 800, lineHeight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF', boxSizing: 'border-box' }}>{n}</span>;
}

export function LtIcon({ paths, size = 24, color = 'currentColor', width = 2 }: { paths: string[]; size?: number; color?: string; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export const ICON = {
  home: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  book: ['M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z', 'M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'],
  game: ['M6 6h12a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z', 'M6 12h4', 'M8 10v4', 'M15 13h.01', 'M18 11h.01'],
  search: ['M18 11a7 7 0 1 1-14 0a7 7 0 0 1 14 0z', 'm21 21-4.3-4.3'],
  trophy: ['M6 9H4.5a2.5 2.5 0 0 1 0-5H6', 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18', 'M4 22h16', 'M18 2H6v7a6 6 0 0 0 12 0V2Z', 'M12 15v7'],
  sliders: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  calendar: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  sun: ['M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z', 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  chevron: ['m9 18 6-6-6-6'],
  chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z', 'M8 12h.01', 'M12 12h.01', 'M16 12h.01'],
  flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
  flag: ['M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', 'M4 22v-7'],
  phone: ['M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', 'M12 18h.01'],
  share: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'm16 6-4-4-4 4', 'M12 2v13'],
  plus: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M12 8v8', 'M8 12h8'],
  dots: ['M12 5h.01', 'M12 12h.01', 'M12 19h.01'],
  leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
  cap: ['M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z', 'M22 10v6', 'M6 12.5V16a6 3 0 0 0 12 0v-3.5'],
  swords: ['M14.5 17.5 3 6V3h3l11.5 11.5', 'm13 19 6-6', 'm16 16 4 4', 'M14.5 6.5 18 3h3v3l-3.5 3.5', 'm5 14 4 4', 'm7 17-3 3'],
  calc: ['M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', 'M8 6h8', 'M8 10h.01', 'M12 10h.01', 'M16 10h.01', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01', 'M16 18h.01'],
  bag: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  camera: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z', 'M12 17a4 4 0 1 0 0-8a4 4 0 0 0 0 8z'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4'],
  medal: ['M12 15a6 6 0 1 0 0-12a6 6 0 0 0 0 12z', 'M8.2 13.9 7 22l5-3 5 3-1.2-8.1'],
  checklist: ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'],
  repeat: ['m17 2 4 4-4 4', 'M3 11v-1a4 4 0 0 1 4-4h14', 'm7 22-4-4 4-4', 'M21 13v1a4 4 0 0 1-4 4H3'],
  swap: ['m17 2 4 4-4 4', 'M3 11v-1a4 4 0 0 1 4-4h14', 'm7 22-4-4 4-4', 'M21 13v1a4 4 0 0 1-4 4H3'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  bread: ['M5 11a4 4 0 0 1 1.5-7.3A5.5 5.5 0 0 1 12 3a5.5 5.5 0 0 1 5.5.7A4 4 0 0 1 19 11v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z', 'M9.5 8.5l1.5 2', 'M13.5 8.5l1.5 2'],
  basket: ['M3 10h18l-2 10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z', 'M7.5 10 11 4', 'M16.5 10 13 4', 'M9 14v3', 'M12 14v3', 'M15 14v3'],
  drop: ['M12 2.7 17.7 8.4a8 8 0 1 1-11.3 0z', 'M9 14a3 3 0 0 0 3 3'],
  scale: ['M12 3v18', 'M7 21h10', 'M4 7h16', 'M7 7l-3 7a3 3 0 0 0 6 0z', 'M17 7l-3 7a3 3 0 0 0 6 0z'],
  knife: ['M20 4c-5.5 1.5-10 6-13.5 12l3 3c4.5-2 8.5-6.5 10.5-15z', 'M6.5 16 3 21'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  coins: ['M9 14A6 6 0 1 0 9 2a6 6 0 0 0 0 12z', 'M18.1 10.4A6 6 0 1 1 10.4 18', 'M7 6h1v4', 'm16.7 13.9.7.7-2.8 2.8'],
  ticket: ['M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z', 'M13 5v2', 'M13 11v2', 'M13 17v2'],
  wheel: ['M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18z', 'M12 3v18', 'M3 12h18', 'm5.6 5.6 12.8 12.8', 'M18.4 5.6 5.6 18.4'],
  sparkle: ['M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z'],
  gift: ['M3 8h18v4H3z', 'M5 12v9h14v-9', 'M12 8v13', 'M12 8C10.5 4.5 7 4 7 6.2 7 7.5 9 8 12 8z', 'M12 8c1.5-3.5 5-4 5-1.8C17 7.5 15 8 12 8z'],
  egg: ['M12 22c4 0 7-3 7-8S15.5 2 12 2 5 9 5 14s3 8 7 8z'],
  bulb: ['M9 18h6', 'M10 22h4', 'M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z'],
  lock: ['M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  bolt: ['M13 2.5 5 13.5h6l-1 8 8-11h-6z'],
  crown: ['M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 10H4.8z', 'M5 21h14'],
  weckmann: ['M12 2.5a3.3 3.3 0 0 1 1.9 6c1.1.2 2 .6 2.6 1.1l3.2 1.7c1 .6.5 2.1-.6 1.8l-3.2-1 .6 5.6 2.3 2.2c.8.8-.2 2-1.1 1.5L12 18.4l-5.7 3c-.9.5-1.9-.7-1.1-1.5l2.3-2.2.6-5.6-3.2 1c-1.1.3-1.6-1.2-.6-1.8l3.2-1.7c.6-.5 1.5-.9 2.6-1.1a3.3 3.3 0 0 1 1.9-6z', 'M12 12.6h.01', 'M12 15.4h.01'],
  globe: ['M12 22a10 10 0 1 0 0-20a10 10 0 0 0 0 20z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  dice: ['M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z', 'M8 8h.01', 'M16 8h.01', 'M12 12h.01', 'M8 16h.01', 'M16 16h.01'],
  headphones: ['M3 14v-2a9 9 0 0 1 18 0v2', 'M21 14h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2z', 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
  play: ['M7 4v16l13-8z'],
  cake: ['M4 21h16', 'M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7', 'M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0', 'M12 12V8', 'M12 5.5a1.5 1.5 0 0 1-1.5-1.5c0-1 1.5-2 1.5-2s1.5 1 1.5 2a1.5 1.5 0 0 1-1.5 1.5z'],
  pencil: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
  heart: ['M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'],
  pause: ['M7 4h3v16H7z', 'M14 4h3v16h-3z'],
  skipBack: ['M19 20 9 12l10-8z', 'M5 19V5'],
  skipFwd: ['M5 4l10 8-10 8z', 'M19 5v14'],
};

/** Eigene Linien-Symbole für Spiele, Tageskarte und Lernbereiche (statt Emojis, sehen auf jedem Handy gleich aus) */
export const GAME_ICON: Record<string, string[]> = {
  'Theken-Simulator': ICON.bell, 'Welches Brot ist das?': ICON.camera, 'Allergene-Training': ICON.shield, 'Quiz Battle': ICON.swords,
  Kassenblitz: ICON.coins, 'Theken-Ansturm': ICON.users, 'Tüten-Blitz': ICON.bag, 'Alternativen-Jäger': ICON.swap,
  'Teurer oder billiger?': ICON.scale, 'Schneide-Profi': ICON.knife, Adventskalender: ICON.calendar,
};

export const MENU_ICON: Record<string, string[]> = {
  daily: ICON.bolt, heute: ICON.calendar, fehler: ICON.repeat, los: ICON.ticket, rad: ICON.wheel, neu: ICON.sparkle,
  woche: ICON.crown, saison: ICON.weckmann, jahr: ICON.gift, advent: ICON.calendar, ostern: ICON.egg, fakt: ICON.bulb,
};

/** Jeder Lernbereich hat seine Farbe, überall gleich */
export const CAT_STYLE: Record<string, { icon: string[]; bg: string; ink: string }> = {
  Alle: { icon: ICON.basket, bg: dc('#FFF0C2'), ink: dc('#4B2A14') },
  'Arbeit & Hygiene': { icon: ICON.drop, bg: dc('#DDE6F7'), ink: dc('#2F4F8A') },
  Fachwissen: { icon: ICON.book, bg: dc('#FFF0C2'), ink: dc('#7A4A00') },
  'Sortiment & Warenkunde': { icon: ICON.bread, bg: dc('#E1EEDC'), ink: dc('#2F5D3A') },
  'Service & Verkauf': { icon: ICON.chat, bg: dc('#FCE1D2'), ink: dc('#9A3412') },
};
