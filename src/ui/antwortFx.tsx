// ═══ Antwort-Effekte und Combo-Zähler, Fortschrittsleiste ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { useEffect } from 'react';
import { dc } from '../daten/data';
import { TH } from './basis';

// ───────────────────────── Rückmeldung nach einer Antwort ─────────────────────────

/** Was nach einer Antwort kurz eingeblendet wird */
export type AnswerFxState = { k: number; ok: boolean; text: string; streak?: number; pts?: number } | null;

/**
 * Kleine schwebende Plakette nach einer Antwort (z. B. „💶 Stimmt!“ oder „🔥 3 in Folge!“).
 * Der Container drumherum braucht position: relative. Mit k wird die Animation bei jeder Antwort neu gestartet.
 */
export const FX_CSS = `
@keyframes ltFxFloat{0%{opacity:0;transform:translateY(14px) scale(.7)}10%{opacity:1;transform:translateY(0) scale(1.12)}18%{transform:scale(1)}82%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-18px)}}
.lt-fx{position:fixed;top:calc(env(safe-area-inset-top, 0px) + 72px);left:50%;transform:translateX(-50%);z-index:1150;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;width:max-content;max-width:92vw}
.lt-fx>span{animation:ltFxFloat 3.2s ease forwards}
@media (prefers-reduced-motion:reduce){.lt-fx>span{animation:ltFxFade 3.2s ease forwards}}
@keyframes ltFxFade{0%,85%{opacity:1}100%{opacity:0}}
`;

/**
 * Schwebende Plakette nach einer Antwort (z. B. „+20 Punkte“, „🔥 3 in Folge!“).
 * Sie steht fest oben am Bildschirm, damit man sie auch sieht, wenn die Seite zur Erklärung scrollt.
 * Mit k wird die Animation bei jeder Antwort neu gestartet.
 */
// ── Combo-Bonus: alle 5 richtigen Antworten in Folge gibt es +0,2 auf die Punkte, höchstens ×2,0 (in allen Spielen) ──
export let comboRun = 0, comboMultSum = 0, comboHits = 0, comboExact = 0, comboExactHits = 0;

export const comboMultFor = (run: number) => Math.min(2, 1 + 0.2 * Math.floor(run / 5));

/** Jede Antwort zählt einzeln: Punkte dieser Antwort × Combo-Faktor */
export function comboRegister(ok: boolean, pts?: number) {
  if (!ok) { comboRun = 0; return; }
  comboRun++; comboHits++;
  const m = comboMultFor(comboRun);
  comboMultSum += m;
  if (typeof pts === 'number' && Number.isFinite(pts) && pts >= 0) { comboExact += pts * (m - 1); comboExactHits++; }
}

/** Combo-Extrapunkte der Runde, exakt pro Antwort (sonst über den Durchschnitt) und zurücksetzen */
export function comboTake(roundScore: number): number {
  const exact = comboHits > 0 && comboExactHits === comboHits;
  const extra = exact ? comboExact : roundScore * ((comboHits ? comboMultSum / comboHits : 1) - 1);
  comboReset();
  return Math.max(0, Math.round(extra));
}

export function comboReset() { try { document.body.classList.remove('lt-hot'); } catch { /* egal */ } comboRun = 0; comboMultSum = 0; comboHits = 0; comboExact = 0; comboExactHits = 0; }

export function AnswerFx({ fx, streakIcon = '🔥' }: { fx: AnswerFxState; streakIcon?: string; pos?: 'top' | 'bottom' }) {
  const fxKey = fx ? `${fx.k}|${fx.ok}` : null;
  useEffect(() => { if (fx) { comboRegister(!!fx.ok, fx.pts); try { document.body.classList.toggle('lt-hot', comboRun >= 5); } catch { /* egal */ } } }, [fxKey]);
  if (!fx) return null;
  return (
    <div key={fx.k} className="lt-fx" aria-hidden="true">
      <style>{FX_CSS}</style>
      <span style={{ padding: '10px 20px', borderRadius: '999px', backgroundColor: fx.ok ? TH.green : TH.red, color: dc('#FFFFFF'), fontWeight: 700, fontSize: '20px', boxShadow: '0 10px 24px -6px rgba(0,0,0,.4)', whiteSpace: 'nowrap' }}>{fx.text}</span>
      {fx.ok && (fx.streak || 0) >= 3 && (
        <span style={{ padding: '8px 16px', borderRadius: '999px', backgroundColor: dc('#FCE1D2'), color: dc('#C2410C'), fontWeight: 700, fontSize: '18px', animationDelay: '.15s', opacity: 0, animationFillMode: 'forwards', boxShadow: '0 8px 18px -8px rgba(0,0,0,.3)' }}>{streakIcon} {fx.streak} in Folge!</span>
      )}
    </div>
  );
}

// ───────────────────────── Fortschrittsleiste – in allen Spielen gleich ─────────────────────────

/**
 * Zeigt, wie weit man in einer Runde ist („Foto 3 von 10 · noch 7“) – bleibt beim Scrollen oben stehen.
 * Für Spiele auf Zeit: left/right selbst setzen und value/max für den Balken.
 */
export function GameProgress({ label, index, total, answered, left, right, value, max, warn }: { label?: string; index?: number; total?: number; answered?: boolean; left?: string; right?: string; value?: number; max?: number; warn?: boolean }) {
  const t = Math.max(1, total || max || 1);
  const done = value !== undefined ? value : Math.min(t, (index || 0) + (answered ? 1 : 0));
  const pct = Math.max(0, Math.min(100, Math.round((done / t) * 100)));
  const leftText = left ?? `${label || 'Frage'} ${Math.min(t, (index || 0) + 1)} von ${t}`;
  const rest = t - done;
  const rightText = right ?? (rest <= 0 ? 'geschafft!' : `noch ${rest}`);
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 6, backgroundColor: TH.cream, padding: '8px 2px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', fontSize: '16px' }}>
        <strong style={{ color: TH.ink }}>{leftText}</strong>
        <span style={{ color: warn ? TH.red : TH.muted, fontWeight: 700 }}>{rightText}</span>
      </div>
      <div style={{ height: '12px', backgroundColor: dc('#F4EADB'), borderRadius: '999px', overflow: 'hidden', border: `1px solid ${TH.line}` }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: warn ? TH.red : TH.yellow, borderRadius: '999px', transition: 'width .45s cubic-bezier(.2,.8,.2,1)' }} />
      </div>
    </div>
  );
}
