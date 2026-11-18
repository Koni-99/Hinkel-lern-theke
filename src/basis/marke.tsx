// ═══ Marke: Cloud-Adresse, Logo, Küken, Farben (LT), Design ═══
// Vorher in appBasis.tsx. Inhalt unverändert übernommen.
import { dc } from '../daten/data';
import { KUEKEN_3D } from './kuekenBild';
import { themaCss, schriftArt } from '../thema/farben';
import { NACHT } from '../thema/modus';
import { ARTISAN_CSS } from '../thema/artisan';
import { CloudPayload } from '../types';
import { buildLtCss } from '../theke-design';
import { registerBagLogo, registerKueken } from '../ui/basis';

export const DEFAULT_CLOUD_URL = 'https://hinkel-lern-app-default-rtdb.europe-west1.firebasedatabase.app/';

export const emptyCloud: CloudPayload = {
  scores: [], progress: {}, lastSeen: {}, battles: {}, wrongStats: {}, pinboard: null, customProducts: [], customQuestions: [], pins: {}
};

// ───────────────────────── Lern-Theke: Design-Bausteine ─────────────────────────

// Hinkel-Logo direkt im Code (keine extra Bilddatei nötig)
export const HINKEL_LOGO = 'data:image/png;base64,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';

/** Küken aus dem Logo, hüpft beim Laden von Bildern */
export const HINKEL_KUEKEN = KUEKEN_3D; // Version 244: 3D-Küken (vorher kleines PNG)

 // Küken als scharfe Vektorgrafik

export const LT = {
  yellow: dc('#FFC72C'),
  brown: dc('#4B2A14'),
  ink: dc('#2B170A'),
  muted: dc('#6B4A30'),
  cream: dc('#FFFBF2'),
  line: dc('#F1E3C8'),
  serif: "'Fraunces', 'Plus Jakarta Sans', Georgia, serif",
};

/** Gelber Hauptknopf wie „Weiter lernen“ (mit Kante unten) */
export const BTN_YELLOW: any = { minHeight: '58px', padding: '0 24px', borderRadius: '16px', border: 'none', backgroundColor: '#FFC72C', color: '#2B170A', fontFamily: "'Bricolage Grotesque', 'Atkinson Hyperlegible', sans-serif", fontSize: '20px', fontWeight: 750, cursor: 'pointer', boxShadow: '0 5px 0 #B98A0A, 0 14px 24px -12px rgba(43,23,10,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };

// Stylesheet für Hover-Effekte und die automatische Handy-Ansicht
registerBagLogo(HINKEL_LOGO);

registerKueken(HINKEL_KUEKEN);

// Design steht in src/theke-design.ts
export const LT_CSS = (NACHT ? themaCss(buildLtCss(HINKEL_KUEKEN)) : schriftArt(buildLtCss(HINKEL_KUEKEN))) + ARTISAN_CSS;

export const TAB_ORDER = (t: string) => t === 'home' ? 0 : t === 'quiz' ? 1 : (t === 'nachschlagen' || t === 'flashcards') ? 3 : t === 'scoreboard' ? 4 : t === 'admin' ? 5 : t === 'einarbeitung' ? 0.5 : 2;
