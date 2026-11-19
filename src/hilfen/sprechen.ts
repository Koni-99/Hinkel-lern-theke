// ═══ Version 261: Spricht gerade eine Stimme? (für Teigis Mund) ═══
// Erkennt die Handy-Stimme (speechSynthesis) und die natürlichen Stimmen (Tondateien), die über merkeAudio angemeldet sind.
const audios = new Set<HTMLAudioElement>();
/** Tondatei-Abspieler anmelden (spielBasis, Hör-Lernen). Gibt ihn unverändert zurück. */
export function merkeAudio<T extends HTMLAudioElement>(a: T): T { audios.add(a); return a; }
export function sprichtGerade(): boolean {
  try { const s = window.speechSynthesis; if (s && s.speaking && !s.paused) return true; } catch { /* egal */ }
  for (const a of audios) if (!a.paused && !a.ended && a.currentTime > 0) return true;
  return false;
}
