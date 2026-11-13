// ═══ Lern-Serie, Stufen, Team-Woche, Gerätespeicher, Kassenbon-Zeile, Jahreszeiten ═══
// Vorher in appBasis.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, useRef } from 'react';
import { dc } from '../daten/data';
import { CloudPayload } from '../types';
import { LT } from './marke';

/** Eine Zeile auf dem Lern-Bon */
export function BonLine({ left, right, strong, size }: { left: string; right: string; strong?: boolean; size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontWeight: strong ? 700 : 400, fontSize: size ? `${size}px` : undefined }}>
      <span style={{ whiteSpace: 'nowrap' }}>{left}</span><span style={{ textAlign: 'right' }}>{right}</span>
    </div>
  );
}

/** Lern-Serie: Datum als JJJJ-MM-TT (lokale Zeit) */
// ── Kleiner Speicher im Browser (IndexedDB) für die Produktfotos, hat viel mehr Platz als localStorage ──
export const idbOpen = () => new Promise<IDBDatabase>((resolve, reject) => {
  const r = indexedDB.open('hinkel', 1);
  r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('kv')) r.result.createObjectStore('kv'); };
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});

export const idbGet = async (key: string): Promise<any> => {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction('kv', 'readonly').objectStore('kv').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const idbSet = async (key: string, value: any): Promise<void> => {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const shiftDayKey = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); };

export const TEAM_CAT = 'Team-Challenge 🤝';

export const TEAM_REWARD = 50;

export const weekIdNow = () => { const d = new Date(); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return dayKey(d); };

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Stempelkarte starten: alle bisherigen Lerntage zählen, alte volle Karten (ohne den heutigen Tag) gelten als erledigt */
export function stampInit(prog: any, days: string[]) {
  const today = dayKey(new Date());
  const prev = days.filter(d => d !== today).length;
  prog._stamps = days.length;
  prog._stampClaimed = Math.floor(prev / 10);
  prog._stampBase = prog._stampClaimed;
  prog._stampV2 = 1;
}

/** Trägt den heutigen Tag als Lerntag ein (die letzten 90 Tage werden gemerkt) */
export function markLearnDay(curr: CloudPayload, userKey: string, displayName: string) {
  if (!userKey || userKey === 'admin') return;
  if (!curr.progress[userKey]) curr.progress[userKey] = { _displayName: displayName };
  const prog = curr.progress[userKey];
  const days: string[] = Array.isArray(prog._days) ? prog._days.filter((d: any) => typeof d === 'string') : [];
  const today = dayKey(new Date());
  // Stempelkarte beim ersten Mal aus den bisherigen Lerntagen starten (auch wenn heute schon gezählt ist)
  if (!prog._stampV2) stampInit(prog, days);
  if (!days.includes(today)) {
    days.push(today);
    prog._stamps = (Number(prog._stamps) || 0) + 1;
    // Monats-Held: an 15 Tagen in einem Monat gelernt
    const ym = today.slice(0, 7);
    if (days.filter(d => d.startsWith(ym)).length >= 15) prog._monthHero = { ...(prog._monthHero || {}), [ym]: 1 };
  }
  prog._days = days.sort().slice(-90);
  // Geheime Abzeichen nach Uhrzeit und Wochentag
  const now = new Date(); const hr = now.getHours();
  const sec = { ...(prog._secret || {}) };
  if (hr >= 22 || hr < 4) sec.eule = 1;
  if (hr >= 4 && hr < 6) sec.frueh = 1;
  if (now.getDay() === 0) sec.sonntag = 1;
  if (Object.keys(sec).length !== Object.keys(prog._secret || {}).length) prog._secret = sec;
}

/** Aktuelle Serie (zählt ab heute oder gestern rückwärts) und längste Serie */
/** Serien-Bonus: ab Tag 2 jeden Tag +10 % auf alle Punkte, höchstens ×1,5 (ab Tag 6) */
export const streakMultFor = (n: number) => 1 + 0.1 * Math.min(5, Math.max(0, n - 1));

export function computeStreak(days: string[]): { current: number; best: number; learnedToday: boolean } {
  const set = new Set(days);
  const d = new Date();
  const learnedToday = set.has(dayKey(d));
  if (!learnedToday) d.setDate(d.getDate() - 1);
  // Sonntags ist die Bäckerei zu: ein Sonntag ohne Lernen unterbricht die Serie nicht
  const skipSunday = () => { if (d.getDay() === 0 && !set.has(dayKey(d))) d.setDate(d.getDate() - 1); };
  skipSunday();
  let current = 0;
  while (set.has(dayKey(d))) { current++; d.setDate(d.getDate() - 1); skipSunday(); }
  let best = 0, run = 0, prev: Date | null = null;
  Array.from(set).sort().forEach(k => {
    const [y, m, dd] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, dd);
    const gap = prev ? Math.round((cur.getTime() - prev.getTime()) / 86400000) : 0;
    const sundayBetween = gap === 2 && prev ? new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1).getDay() === 0 : false;
    run = prev && (gap === 1 || sundayBetween) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  });
  return { current, best: Math.max(best, current), learnedToday };
}

// ── Stufen: aus den gesammelten Punkten ──
export const LEVELS = [
  { min: 0, title: 'Neuling', icon: '🌱' },
  { min: 150, title: 'Mehlstaub', icon: '🌾' },
  { min: 400, title: 'Teigling', icon: '🥨' },
  { min: 800, title: 'Brötchen-Profi', icon: '🥐' },
  { min: 1300, title: 'Kassen-Kenner', icon: '💶' },
  { min: 2000, title: 'Theken-Talent', icon: '🥖' },
  { min: 2800, title: 'Krusten-Kenner', icon: '🍞' },
  { min: 3800, title: 'Brotfreund', icon: '🤎' },
  { min: 5000, title: 'Verkaufs-Ass', icon: '🌟' },
  { min: 6500, title: 'Sauerteig-Profi', icon: '🫙' },
  { min: 8200, title: 'Theken-Star', icon: '🏅' },
  { min: 10000, title: 'Brot-Sommelier', icon: '🎖️' },
  { min: 12500, title: 'Zopf-Künstler', icon: '🥯' },
  { min: 15000, title: 'Konditor-Herz', icon: '🍰' },
  { min: 18000, title: 'Brotmeister', icon: '👑' },
  { min: 21500, title: 'Backstuben-Legende', icon: '🔥' },
  { min: 25000, title: 'Hinkel-Held', icon: '💎' },
  { min: 29000, title: 'Goldene Brezel', icon: '🏆' },
  { min: 34000, title: 'Brot-Botschafter', icon: '🌍' },
  { min: 40000, title: 'Hinkel-Stern', icon: '🌠' },
  { min: 47000, title: 'Ehren-Bäcker', icon: '🎓' },
  { min: 55000, title: 'Meister der Theke', icon: '🛎️' },
  { min: 65000, title: 'Brot-Philosoph', icon: '📜' },
  { min: 80000, title: 'Lebende Legende', icon: '⭐' },
  { min: 100000, title: 'Hinkel-Ikone', icon: '🏰' },
];

export function levelFor(points: number) {
  const p = Math.max(0, Number(points) || 0);
  let i = 0;
  LEVELS.forEach((l, idx) => { if (p >= l.min) i = idx; });
  const cur = LEVELS[i], next = LEVELS[i + 1] || null;
  const pct = next ? Math.round(((p - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { no: i + 1, ...cur, next, pct, toNext: next ? next.min - p : 0 };
}

/** Ausbilder: einem Mitarbeiter Punkte und Trinkgeld schenken (z. B. zum Testen oder als Belohnung) */
export function AdminGift({ users, onGive }: { users: { key: string; name: string }[]; onGive: (key: string, pts: number, cents: number) => void }) {
  const [key, setKey] = useState('');
  const [pts, setPts] = useState('');
  const [eur, setEur] = useState('');
  const [msg, setMsg] = useState('');
  const p = Math.round(Number(pts.replace(',', '.')) || 0), c = Math.round((Number(eur.replace(',', '.')) || 0) * 100);
  const field: any = { minHeight: '48px', padding: '0 12px', borderRadius: '12px', border: `2px solid ${LT.line}`, fontSize: '17px', backgroundColor: dc('#FFFFFF'), color: LT.ink };
  return (
    <details style={{ marginBottom: '18px', backgroundColor: dc('#FFFFFF'), border: `2px solid ${LT.line}`, borderRadius: '18px', padding: '14px 18px' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: '19px' }}>Punkte & Trinkgeld schenken</summary>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        <select value={key} onChange={e => { setKey(e.target.value); setMsg(''); }} style={field}>
          <option value="">Mitarbeiter auswählen …</option>
          {users.map(u => <option key={u.key} value={u.key}>{u.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input inputMode="numeric" placeholder="Punkte, z. B. 5000" value={pts} onChange={e => setPts(e.target.value)} style={{ ...field, flex: '1 1 160px' }} />
          <input inputMode="decimal" placeholder="Trinkgeld in €, z. B. 20" value={eur} onChange={e => setEur(e.target.value)} style={{ ...field, flex: '1 1 160px' }} />
        </div>
        <button disabled={!key || (!p && !c)} onClick={() => { onGive(key, p, c); setMsg(`✓ ${users.find(u => u.key === key)?.name}: ${p ? `${p > 0 ? '+' : ''}${p.toLocaleString('de-DE')} Punkte` : ''}${p && c ? ', ' : ''}${c ? `${c > 0 ? '+' : ''}${(c / 100).toFixed(2).replace('.', ',')} € Trinkgeld` : ''}`); setPts(''); setEur(''); }}
          style={{ minHeight: '50px', borderRadius: '14px', border: 'none', backgroundColor: LT.ink, color: dc('#FFFFFF'), fontSize: '17px', fontWeight: 800, cursor: !key || (!p && !c) ? 'default' : 'pointer', opacity: !key || (!p && !c) ? 0.45 : 1 }}>Schenken</button>
        {msg && <div style={{ fontWeight: 700, color: dc('#2F5D3A') }}>{msg}</div>}
        <div style={{ fontSize: '14px', color: LT.muted }}>Mit Minus (z. B. -500) kannst du auch wieder abziehen. Geschenkte Punkte zählen zu den Gesamtpunkten in der Bestenliste.</div>
      </div>
    </details>
  );
}

/** Zahl zählt weich hoch/runter, wenn sich der Wert ändert. delta = letzte Änderung (für das „+20“) */
export function useCountUp(target: number, ms = 900) {
  const [value, setValue] = useState(target);
  const [delta, setDelta] = useState<{ k: number; v: number } | null>(null);
  const valueRef = useRef(target);
  const firstRef = useRef(true);
  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;
    if (!firstRef.current && target > from) setDelta({ k: Date.now(), v: target - from });
    firstRef.current = false;
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const v = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      valueRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return { value, delta };
}

// ── Saison-Themen: passendes Aussehen und Bonusfragen je nach Datum ──
export type Season = { id: string; title: string; text: string; deco: string[]; products: string[]; tint: string; ink: string };

/** Ostersonntag (Gauß’sche Osterformel) */
export function easterSunday(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

export function seasonFor(now: Date): Season | null {
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  const today = new Date(y, m, d).getTime();
  const easter = easterSunday(y);
  const shift = (n: number) => { const x = new Date(easter); x.setDate(x.getDate() + n); return x.getTime(); };
  if (m === 10 && d === 11) return { id: 'karneval', title: 'Helau! Die Session beginnt', text: 'Heute um 11:11 Uhr erwacht der Hoppeditz, die fünfte Jahreszeit startet. Und morgen gehen wieder die Weckmänner über die Theke.', deco: ['🎭', '🎉', '🤡', '🎊'], products: ['Berliner', 'Krapfen', 'Weckmann', 'Weckmann mit Mandeln'], tint: dc('#FCE1D2'), ink: dc('#9A3412') };
  if (m === 10 && d <= 10) return { id: 'martin', title: 'St. Martin & Weckmann-Zeit', text: 'Laternen, Martinszüge und unser Weckmann mit Tonpfeife, jetzt fragen die Kunden besonders oft danach.', deco: ['🏮', '🕯️', '🐴', '🏮'], products: ['Weckmann', 'Weckmann mit Mandeln'], tint: dc('#FFF0C2'), ink: dc('#7A4A00') };
  if (m === 11 && d <= 24) return { id: 'advent', title: 'Frohe Adventszeit', text: 'Printen, Stollen und Spekulatius haben Saison, vergiss dein Türchen im Adventskalender nicht.', deco: ['⭐', '🎄', '❄️', '🎁'], products: [], tint: dc('#E1EEDC'), ink: dc('#2F5D3A') };
  if (today >= shift(-66) && today <= shift(-47)) return { id: 'karneval', title: 'Karneval in Düsseldorf', text: 'Helau! Jetzt haben Berliner und Krapfen Hochsaison, an den tollen Tagen ist an der Theke viel los.', deco: ['🎭', '🎉', '🤡', '🎊'], products: ['Berliner', 'Krapfen'], tint: dc('#FCE1D2'), ink: dc('#9A3412') };
  if (today >= shift(-14) && today <= shift(1)) return { id: 'ostern', title: 'Frohe Ostern', text: 'Ostern steht vor der Tür, viele Familien kaufen jetzt fürs Osterfrühstück: Stuten, Zopf und frische Brötchen.', deco: ['🐣', '🌷', '🥚', '🐰'], products: [], tint: dc('#DDE6F7'), ink: dc('#2F4F8A') };
  return null;
}

// ── Wochenrückblick: Woche beginnt montags ──
export const mondayOf = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };

export const parseBonDate = (txt?: string): Date | null => {
  const mm = (txt || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!mm) return null;
  const yy = Number(mm[3]) < 100 ? 2000 + Number(mm[3]) : Number(mm[3]);
  return new Date(yy, Number(mm[2]) - 1, Number(mm[1]));
};

export const cleanCat = (c: string) => c.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[☀-➿️‍]/g, '').trim();

export const BON_DIVIDER = <div style={{ borderTop: `2px dashed ${LT.ink}`, margin: '8px 0' }} />;
