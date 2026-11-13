// ═══ Quiz Battle: Zeiten, Sieger, Punkte ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.
import { BattleEntry, CloudPayload, Tombstones } from '../types';
import { BATTLE_POINTS } from './allgemein';

// ───────────────────────── Quiz Battle ─────────────────────────

/** Gesamtzeit eines Spielers im Battle in Millisekunden (null = nicht gemessen, z. B. alte Duelle) */
export function battleTimeOf(b: BattleEntry, side: "challenger" | "opponent"): number | null {
  const v = (b as any)[side === "challenger" ? "challengerTime" : "opponentTime"];
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}

/** Zeit lesbar, auf Zehntelsekunden: 23,4 s */
export function formatBattleTime(ms: number | null | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return "";
  return (Math.round(ms / 100) / 10).toFixed(1).replace(".", ",") + " s";
}

/** Wer hat gewonnen? Mehr richtige Antworten, bei Gleichstand die schnellere Zeit (auf Zehntelsekunden). */
export function battleWinnerSide(b: BattleEntry): "challenger" | "opponent" | "tie" | null {
  if (b.challengerScore === null || b.challengerScore === undefined || b.opponentScore === null || b.opponentScore === undefined) return null;
  if (b.challengerScore > b.opponentScore) return "challenger";
  if (b.opponentScore > b.challengerScore) return "opponent";
  const ct = battleTimeOf(b, "challenger"), ot = battleTimeOf(b, "opponent");
  if (ct === null || ot === null) return "tie";
  const c10 = Math.round(ct / 100), o10 = Math.round(ot / 100);
  return c10 < o10 ? "challenger" : o10 < c10 ? "opponent" : "tie";
}

/** Leitet Status und Sieger aus den beiden Punktzahlen ab (so kann sich ein Stand nie „verklemmen“). */
export function settleBattle(b: BattleEntry): BattleEntry {
  const c = b.challengerScore !== null && b.challengerScore !== undefined;
  const o = b.opponentScore !== null && b.opponentScore !== undefined;
  if (c && o) {
    b.status = "finished";
    const w = battleWinnerSide(b);
    b.winner = w === "challenger" ? b.challenger : w === "opponent" ? b.opponent : "Unentschieden";
  } else if (c) {
    b.status = "waiting_opponent";
    b.winner = null;
  } else if (o) {
    b.status = "waiting_challenger";
    b.winner = null;
  } else {
    b.status = "pending";
    b.winner = null;
  }
  return b;
}

/** Ergebnis eines beendeten Battles aus Sicht eines Spielers (userKey = Kleinschreibung des Namens). */
export function getBattleOutcome(
  b: BattleEntry,
  userKey: string
): "won" | "lost" | "tie" | null {
  if (b.status !== "finished") return null;
  if (b.challengerScore === null || b.challengerScore === undefined)
    return null;
  if (b.opponentScore === null || b.opponentScore === undefined) return null;
  const isChallenger = b.challengerKey === userKey;
  const isOpponent = b.opponentKey === userKey;
  if (!isChallenger && !isOpponent) return null;
  const w = battleWinnerSide(b);
  if (w === "tie" || w === null) return "tie";
  return isChallenger === (w === "challenger") ? "won" : "lost";
}

/** Zeitpunkt eines Battles aus seiner ID (battle_1730000000000_abcde) */
export function battleTime(b: BattleEntry): number {
  const m = String(b?.id || "").match(/_(\d{12,})_/);
  return m ? Number(m[1]) : 0;
}

/** Wann wurden die Punkte dieses Spielers zuletzt gelöscht (einzeln, ganze Bestenliste oder Spieler gelöscht)? */
export function pointsResetFor(t: Tombstones | undefined, userKey: string): number {
  return Math.max(t?.pointsReset?._all || 0, t?.pointsReset?.[userKey] || 0, t?.users?.[userKey] || 0);
}

/** Wie getBattleOutcome, aber Battles von vor dem Löschen der Punkte zählen nicht mehr */
export function battleOutcomeSinceReset(b: BattleEntry, userKey: string, t?: Tombstones): "won" | "lost" | "tie" | null {
  const reset = pointsResetFor(t, userKey);
  if (reset && battleTime(b) <= reset) return null;
  return getBattleOutcome(b, userKey);
}

/** Schreibt Sieger +25 / Verlierer −25 Punkte in die Bestenliste (genau einmal pro Battle). */
export function awardBattlePoints(curr: CloudPayload, b: BattleEntry): void {
  if (b.status !== "finished" || b.winner === "Unentschieden") return;
  if (!Array.isArray(curr.scores)) curr.scores = [];
  const nowStr = new Date().toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const players = [
    { key: b.challengerKey, name: b.challenger },
    { key: b.opponentKey, name: b.opponent },
  ];
  players.forEach(({ key, name }) => {
    const outcome = getBattleOutcome(b, key);
    if (outcome !== "won" && outcome !== "lost") return;
    const id = `battle_${b.id}_${key}`;
    if (curr.scores.some((s) => s.id === id)) return;
    curr.scores.push({
      id,
      username: name,
      score: (outcome === "won" ? 1 : -1) * (BATTLE_POINTS + (Number((b as any).stake) || 0)),
      date: nowStr,
      category: "Quiz Battle",
    });
  });
}

/** Führt zwei Stände desselben Battles zusammen: Punktzahlen, die einer schon hat, gehen nicht verloren. */
export function mergeBattleEntry(a: BattleEntry, b: BattleEntry): BattleEntry {
  const merged: BattleEntry = {
    ...b,
    ...a,
    questions: a.questions || b.questions,
    challengerScore: a.challengerScore ?? b.challengerScore ?? null,
    opponentScore: a.opponentScore ?? b.opponentScore ?? null,
  };
  const at = a as any, bt = b as any;
  (merged as any).challengerTime = at.challengerTime ?? bt.challengerTime ?? null;
  (merged as any).opponentTime = at.opponentTime ?? bt.opponentTime ?? null;
  return settleBattle(merged);
}
