// ═══ Aussehen wählen (pro Gerät, im Menü) ═══
// Design: „hell“ (Standard) oder „nacht“ (Backstube bei Nacht, von Claude Fable, Version 179/187).
// Kopf: „aehren“ (Standard seit 195, dunkle Bühne mit Ähren), „markise“ (gelbe Markise mit Wetter), „mitaehren“ (Markise + goldene Ähren).
// Das Design wird beim Start gelesen (alle Farben werden beim Zeichnen umgerechnet), deshalb lädt die App beim Umschalten neu.
export type Design = 'hell' | 'nacht';
export type Kopf = 'markise' | 'mitaehren' | 'aehren';

const lies = (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
export const NACHT: boolean = lies('lt_design') === 'nacht';
if (NACHT && typeof document !== 'undefined') document.documentElement.classList.add('lt-nacht');

// Standard seit Version 195 (Wunsch des Nutzers): helles Design mit Kopf „Goldene Ähren“
export const kopfGespeichert = (): Kopf => { const k = lies('lt_kopf'); return k === 'markise' || k === 'mitaehren' ? k : 'aehren'; };
export function designSetzen(d: Design) { try { localStorage.setItem('lt_design', d); } catch { /* egal */ } window.location.reload(); }
export function kopfSetzen(k: Kopf) { try { localStorage.setItem('lt_kopf', k); } catch { /* egal */ } }
/** Klassen für die Wurzel der App */
export const modusKlassen = (kopf: Kopf) => `${NACHT ? ' lt-dark' : ''}${kopf !== 'markise' ? ` lt-kopf-${kopf}` : ''}`;
