// ═══ Thema „Backstube bei Nacht“: rechnet die hellen Farben der App in den dunklen Look um ═══
// Die App hat hunderte Farben direkt im Code. Statt jede einzeln anzufassen, wird hier an EINER Stelle umgerechnet:
//  • helle Flächen (Weiß, Creme, Pastell) werden dunkle Flächen
//  • dunkle Schrift wird helle Schrift – aber nur, wenn sie auf einer dunklen Fläche steht.
//    Auf Gelb oder auf Papier (Lern-Bon, Lernkarten) bleibt sie dunkel. Das regelt --auf-hell (siehe artisan.ts).
//  • Gelb und Braun der Marke bleiben unverändert (darauf bauen auch die gekauften Sorten im Laden auf).

type Farbe = [number, number, number, number];
export type Kontext = '' | 'hell' | 'tief';

const FARB_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z])|rgba?\([^()]*\)/g;
/** Seiten-Hintergründe: werden zum tiefsten Ton */
const SEITE = new Set(['255,251,242', '250,246,240', '255,248,234']);
/** CSS-Regeln der gekauften Sorten und Markisen bleiben, wie sie sind. Ebenso alles „Papier“ (Kassenbons, Lern-Bon, Tageskarte, Version 189) */
export const PAPIER_RE = /(?:^|[\s.])(?:lt-th-|lt-mk-|lt-pt_mk|lt-receipt|lt-rc-|lt-bon(?:-|(?![\w-]))|lt-menu(?:-row|(?![\w-]))|lt-shopbon|lt-papier)/;

function lese(s: string): Farbe | null {
  s = s.trim().toLowerCase();
  if (s === 'white') return [255, 255, 255, 1];
  if (s === 'black') return [0, 0, 0, 1];
  if (s[0] === '#') {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if ((h.length !== 6 && h.length !== 8) || /[^0-9a-f]/.test(h)) return null;
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
  }
  const m = s.match(/^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return [+m[1], +m[2], +m[3], a];
}
function hsl([r, g, b]: Farbe): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, Math.min(1, s), l];
}
function ausHsl(h: number, s: number, l: number, a: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const v = [r, g, b].map((k) => Math.round((k + m) * 255));
  return a >= 0.995 ? '#' + v.map((k) => k.toString(16).padStart(2, '0')).join('') : `rgba(${v[0]},${v[1]},${v[2]},${+a.toFixed(3)})`;
}
const hell = (f: Farbe) => (0.299 * f[0] + 0.587 * f[1] + 0.114 * f[2]) / 255;

/** Fläche: hell wird dunkel. Gibt auch zurück, ob die Fläche danach hell oder dunkel ist. */
function flaeche(f: Farbe): { c: string | null; k: Kontext } {
  if (f[3] < 0.2) return { c: null, k: '' };
  const [h, s, l] = hsl(f);
  if (l >= 0.8) {
    if (f[3] >= 0.995 && SEITE.has(`${f[0]},${f[1]},${f[2]}`)) return { c: '#14100c', k: 'tief' };
    // Version 241: Karten hellbraun wie „Heute dran“ (vorher fast schwarz #201B15, hoben sich kaum vom Hintergrund ab)
    const warm = s < 0.12 || (h >= 20 && h <= 62);
    const nh = s < 0.12 ? 26 : warm ? 26 + (h - 26) * 0.4 : h;
    const ns = warm ? Math.min(Math.max(s * 0.4, 0.4), 0.48) : Math.min(s, 0.36);
    const nl = l >= 0.985 ? 0.2 : 0.21 + (0.985 - l) * 0.35;
    return { c: ausHsl(nh, ns, nl, f[3]), k: f[3] >= 0.5 ? 'tief' : '' };
  }
  if (f[3] < 0.5) return { c: null, k: '' };
  if (l < 0.3) return { c: null, k: 'tief' };
  return { c: null, k: hell(f) > 0.55 ? 'hell' : '' };
}
/** Schrift: dunkel wird hell (null = bleibt) */
function schrift(f: Farbe): string | null {
  if (f[3] < 0.3) return null;
  const [h, s, l] = hsl(f);
  if (l >= 0.5) return null;
  const braun = s < 0.15 || (h >= 18 && h <= 50 && s < 0.7);
  const nl = Math.min(0.95, Math.max(0.68, 1.02 - l * 1.05));
  return ausHsl(braun ? 36 : h, braun ? (l > 0.25 ? 0.3 : 0.42) : Math.min(s, 0.6), nl, f[3]);
}
/** Linien und Kanten: hell wird eine dunkle, warme Linie */
function linie(f: Farbe): string | null {
  if (f[3] < 0.5) return null;
  const [, , l] = hsl(f);
  return l >= 0.8 ? ausHsl(34, 0.28, 0.2, f[3]) : null;
}
const istDunkel = (f: Farbe) => f[3] >= 0.5 && hsl(f)[2] < 0.35;

const speicher = new Map<string, any>();
function merk<T>(key: string, rechne: () => T): T {
  if (speicher.has(key)) return speicher.get(key);
  const v = rechne();
  if (speicher.size > 6000) speicher.clear();
  speicher.set(key, v);
  return v;
}

export function flaecheWert(v: string): { c: string; k: Kontext } {
  return merk('f' + v, () => {
    let k: Kontext = '', erste = true;
    const c = v.replace(FARB_RE, (t) => { const f = lese(t); if (!f) return t; const r = flaeche(f); if (erste && r.k) { k = r.k; } if (f[3] >= 0.5) erste = false; return r.c || t; });
    return { c, k };
  });
}
export function linieWert(v: string): string {
  return merk('l' + v, () => v.replace(FARB_RE, (t) => { const f = lese(t); return (f && linie(f)) || t; }));
}
/** Dunkle Schrift: gibt Original und helle Fassung zurück (null = nichts zu tun) */
export function schriftWert(v: string): { orig: string; licht: string } | null {
  return merk('s' + v, () => { const f = lese(v); const n = f && schrift(f); return n ? { orig: v.trim(), licht: n } : null; });
}
/** Dunkle Rahmenfarbe in einem Rahmen-Wert finden */
function rahmenDunkel(v: string): { wert: string; orig: string } | null {
  return merk('r' + v, () => {
    let orig = '';
    const wert = v.replace(FARB_RE, (t) => { const f = lese(t); if (!f || !istDunkel(f) || orig) return t; const n = schrift(f); if (!n) return t; orig = t; return `var(--tb, ${n})`; });
    return orig ? { wert, orig } : null;
  });
}
export const schriftArt = (v: string) => v.replace(/'?Bricolage Grotesque'?/g, "'Plus Jakarta Sans'").replace(/'?Atkinson Hyperlegible'?/g, "'Plus Jakarta Sans'");

const FLAECHE = new Set(['background', 'backgroundColor', 'backgroundImage']);
const istRahmen = (k: string) => k.startsWith('border') && !/Radius|Width|Style|Collapse|Spacing/.test(k) || k === 'outline' || k === 'outlineColor';

/** Helles Design: nur die Schrift tauschen (Plus Jakarta Sans statt Bricolage/Atkinson), Farben bleiben */
export function schriftProps(props: any): any {
  const st = props.style;
  if (!st || typeof st !== 'object' || typeof st.fontFamily !== 'string') return props;
  const n = schriftArt(st.fontFamily);
  return n === st.fontFamily ? props : { ...props, style: { ...st, fontFamily: n } };
}

/** Für jedes Element mit eigenem style: Farben umrechnen. Gibt neue props zurück (oder dieselben, wenn nichts zu tun war). */
export function themaProps(props: any): any {
  const st = props.style;
  if (!st || typeof st !== 'object') return props;
  const cls = props.className;
  let neu: any = null, k: Kontext = '', rand = false, fertigSchatten = false;
  const setz = (key: string, v: string) => { if (!neu) neu = { ...st }; neu[key] = v; };
  for (const key in st) {
    const v = st[key];
    if (typeof v !== 'string' || !FLAECHE.has(key)) continue;
    const r = flaecheWert(v);
    if (r.k) k = r.k;
    // Auf Papier (.lt-papier setzt --papier) bleibt die Original-Farbe, sonst gilt die dunkle
    if (r.c !== v) { setz(`--pf-${key}`, `var(--papier) ${v}`); setz(key, `var(--pf-${key}, ${r.c})`); if (r.k === 'tief' && key !== 'backgroundImage') rand = true; }
  }
  // Umgerechnete Flächen mit runden Ecken bekommen einen feinen Goldrand, damit sie sich vom Grund abheben
  if (rand && st.borderRadius && st.borderRadius !== '50%' && !st.border && !st.borderBottom && !st.borderTop) {
    const bs = typeof st.boxShadow === 'string' && st.boxShadow !== 'none' ? linieWert(st.boxShadow) + ', ' : '';
    setz('boxShadow', bs + 'inset 0 0 0 1px rgba(253,230,138,.1)');
    fertigSchatten = true;
  }
  for (const key in st) {
    const v = st[key];
    if (typeof v !== 'string') continue;
    if (key === 'color') { const s = schriftWert(v); if (s) { setz('--tc', `var(--auf-hell) ${s.orig}`); setz('color', `var(--tc, ${s.licht})`); } }
    else if (key === 'boxShadow') { if (fertigSchatten) continue; const n = linieWert(v); if (n !== v) setz(key, n); }
    else if (istRahmen(key)) {
      let n = linieWert(v);
      if (k !== 'tief') { const d = rahmenDunkel(n); if (d) { n = d.wert; setz('--tb', `var(--auf-hell) ${d.orig}`); } }
      if (n !== v) setz(key, n);
    } else if (key === 'fontFamily') { const n = schriftArt(v); if (n !== v) setz(key, n); }
  }
  if (!neu && !k) return props;
  const out = neu ? { ...props, style: neu } : { ...props };
  if (k) out.className = (typeof cls === 'string' && cls ? cls + ' ' : '') + (k === 'hell' ? 'lt-hell' : 'lt-tief');
  return out;
}

/** Dasselbe für CSS-Text (theke-design.ts und die .css-Dateien) */
export function themaCss(css: string): string {
  const lager: string[] = [];
  const sicher = css.replace(/url\((?:"[^"]*"|'[^']*'|[^)]*)\)|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, (t) => { lager.push(t); return `\u0001${lager.length - 1}\u0001`; });
  const fertig = sicher.replace(/([^{}]*)\{([^{}]*)\}/g, (_g, sel: string, body: string) => {
    const zeigSel = sel.replace(/\u0001(\d+)\u0001/g, (_m, i) => lager[+i]);
    if (PAPIER_RE.test(zeigSel)) return `${sel}{${body}}`;
    const bild = /^\s*(?:from|to|[\d.]+%)(?:\s*,\s*(?:from|to|[\d.]+%))*\s*$/.test(sel.slice(sel.lastIndexOf('}') + 1).slice(sel.lastIndexOf(';') + 1));
    const teile = body.split(';').map((d) => { const i = d.indexOf(':'); return i < 0 ? null : { p: d.slice(0, i).trim().toLowerCase(), v: d.slice(i + 1).trim(), roh: d }; });
    let k: Kontext = '';
    const aus: string[] = [];
    for (const t of teile) if (t && (t.p === 'background' || t.p === 'background-color' || t.p === 'background-image')) { const r = flaecheWert(t.v); if (r.k) k = r.k; t.v = r.c; t.roh = `${t.p}:${t.v}`; }
    for (const t of teile) {
      if (!t) continue;
      if (t.p === 'color') {
        const wichtig = /!important/.test(t.v) ? ' !important' : '';
        const s = schriftWert(t.v.replace(/\s*!important/, ''));
        if (s) { aus.push(bild ? `color:${s.licht}` : `--tc:var(--auf-hell) ${s.orig};color:var(--tc,${s.licht})${wichtig}`); continue; }
      } else if (t.p === 'box-shadow') t.roh = `${t.p}:${linieWert(t.v)}`;
      else if (/^(border|outline)/.test(t.p) && !/radius|width|style|collapse|spacing|offset/.test(t.p)) {
        let n = linieWert(t.v);
        if (k !== 'tief' && !bild) { const d = rahmenDunkel(n); if (d) { n = d.wert; aus.push(`--tb:var(--auf-hell) ${d.orig}`); } }
        t.roh = `${t.p}:${n}`;
      } else if (t.p === 'font-family') t.roh = `${t.p}:${schriftArt(t.v)}`;
      aus.push(t.roh);
    }
    if (k && !bild) aus.push(k === 'hell' ? '--auf-hell: ' : '--auf-hell:initial');
    return `${sel}{${aus.join(';')}}`;
  });
  return schriftArt(fertig.replace(/\u0001(\d+)\u0001/g, (_m, i) => lager[+i]));
}
