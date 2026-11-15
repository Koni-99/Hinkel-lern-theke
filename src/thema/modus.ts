// ═══ Aussehen wählen (pro Gerät, im Menü) ═══
// Design: „hell“ (Standard) oder „nacht“ (Backstube bei Nacht, von Claude Fable, Version 179/187).
// Kopf: „markise“ (Standard, gelbe Markise mit Wetter), „mitaehren“ (Markise + goldene Ähren), „aehren“ (dunkle Bühne mit Ähren).
// Das Design wird beim Start gelesen (alle Farben werden beim Zeichnen umgerechnet), deshalb lädt die App beim Umschalten neu.
export type Design = 'hell' | 'nacht';
export type Kopf = 'markise' | 'mitaehren' | 'aehren';

const lies = (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
export const NACHT: boolean = lies('lt_design') === 'nacht';
if (NACHT && typeof document !== 'undefined') document.documentElement.classList.add('lt-nacht');

export const kopfGespeichert = (): Kopf => { const k = lies('lt_kopf'); return k === 'mitaehren' || k === 'aehren' ? k : 'markise'; };
export function designSetzen(d: Design) { try { localStorage.setItem('lt_design', d); } catch { /* egal */ } window.location.reload(); }
export function kopfSetzen(k: Kopf) { try { localStorage.setItem('lt_kopf', k); } catch { /* egal */ } }
/** Klassen für die Wurzel der App */
export const modusKlassen = (kopf: Kopf) => `${NACHT ? ' lt-dark' : ''}${kopf !== 'markise' ? ` lt-kopf-${kopf}` : ''}`;
