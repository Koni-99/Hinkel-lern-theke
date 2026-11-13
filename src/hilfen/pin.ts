// ═══ PIN: Format prüfen, verschlüsselt speichern und prüfen ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.
import { PinEntry } from '../types';

// ── Persönliche PIN ──
// Gespeichert wird nur ein Hash. Hinweis: Solange die Datenbank für alle lesbar ist, schützt die PIN
// vor dem Anmelden unter fremdem Namen in der App, nicht vor jemandem, der die Datenbank direkt ausliest.
export const PIN_MIN = 4;

export const PIN_MAX = 6;

export function pinFormatError(pin: string): string {
  if (!/^\d+$/.test(pin)) return 'Die PIN darf nur Ziffern enthalten.';
  if (pin.length < PIN_MIN || pin.length > PIN_MAX) return `Die PIN braucht ${PIN_MIN} bis ${PIN_MAX} Ziffern.`;
  if (/^(\d)\1+$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin)) return 'Diese PIN ist zu leicht zu erraten. Bitte nimm eine andere.';
  return '';
}

export async function sha256Hex(text: string): Promise<string> {
  if (!window.crypto?.subtle) throw new Error('Kein sicherer Browser-Kontext');
  const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function makePinEntry(userKey: string, pin: string): Promise<PinEntry> {
  const saltBytes = new Uint8Array(8);
  window.crypto.getRandomValues(saltBytes);
  const s = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return { h: await sha256Hex(`hinkel-pin|${s}|${userKey}|${pin}`), s, ts: Date.now() };
}

export async function checkPin(userKey: string, pin: string, entry?: PinEntry | null): Promise<boolean> {
  if (!entry?.h || !entry.s) return false;
  return (await sha256Hex(`hinkel-pin|${entry.s}|${userKey}|${pin}`)) === entry.h;
}
