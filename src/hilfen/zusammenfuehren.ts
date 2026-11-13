// ═══ Daten zusammenführen: Bestenliste, Löschvermerke, PINs, Korrekturen, ganzer Cloud-Stand ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.
import { BattleEntry, CloudPayload, CustomProductItem, ScoreEntry, Tombstones } from '../types';
import type { Question } from '../daten/questions';
import { cleanStatNumber } from './allgemein';
import { mergeBattleEntry } from './battle';

// ───────────────────────── Cloud-Abgleich ─────────────────────────

// ───────────── Gelöschtes bleibt gelöscht (Tombstones) ─────────────

/** Eindeutiger Schlüssel eines Bestenlisten-Eintrags */
export function scoreKey(s: ScoreEntry): string {
  return s.id || `${s.username}_${s.score}_${s.date}_${s.category || ""}`;
}

/** Doppelte Einträge (gleiche ID) entfernen. Bis Version 149 konnte ein neuer Eintrag beim Nachprüfen
 *  mehrfach angehängt werden; so verschwinden diese Kopien beim nächsten Laden und Speichern. */
export function dedupeScores(list: ScoreEntry[]): ScoreEntry[] {
  const seen = new Set<string>();
  return (list || []).filter((s) => {
    if (!s) return false;
    const k = scoreKey(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Zeitpunkt eines Eintrags: aus der ID (name_1730000000000) oder aus dem Datum „02.11.26, 07:34“ */
export function scoreTime(s: ScoreEntry): number {
  const m = String(s.id || "").match(/_(\d{12,})$/);
  if (m) return Number(m[1]);
  const d = String(s.date || "").match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:,?\s*(\d{1,2}):(\d{2}))?/);
  if (!d) return 0;
  const y = Number(d[3]) < 100 ? 2000 + Number(d[3]) : Number(d[3]);
  return new Date(y, Number(d[2]) - 1, Number(d[1]), Number(d[4] || 0), Number(d[5] || 0)).getTime();
}

export const MAX_TOMBSTONE_AGE = 1000 * 60 * 60 * 24 * 180;

 // nach einem halben Jahr vergessen

export function mergeStampMaps(a?: Record<string, number>, b?: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  const now = Date.now();
  [a || {}, b || {}].forEach((m) =>
    Object.keys(m).forEach((k) => {
      const v = Number(m[k]) || 0;
      if (v > 0 && now - v < MAX_TOMBSTONE_AGE) out[k] = Math.max(out[k] || 0, v);
    })
  );
  return out;
}

export function mergeTombstones(a?: Tombstones, b?: Tombstones): Tombstones {
  const keys: (keyof Tombstones)[] = ["scores", "pointsReset", "users", "progressReset", "wrongReset", "products", "questions"];
  const out: Tombstones = {};
  keys.forEach((k) => {
    const m = mergeStampMaps(a?.[k], b?.[k]);
    if (Object.keys(m).length) out[k] = m;
  });
  return out;
}

/** Entfernt alles, was der Ausbilder gelöscht hat, egal, welches Gerät es wieder mitbringt */
export function applyTombstones(p: CloudPayload): CloudPayload {
  const t = p.tombstones || {};
  const sc = t.scores || {};
  const pr = t.pointsReset || {};
  const us = t.users || {};
  const cu = Number(p.compactedUntil) || 0;
  p.scores = (p.scores || []).filter((s) => {
    if (!s || !s.username) return false;
    // schon zusammengefasst: alte Einzelrunde nicht doppelt zählen
    if (cu && !s.n) { const t = scoreTime(s); if (t && t < cu) return false; }
    if (sc[scoreKey(s)]) return false;
    const u = s.username.toLowerCase();
    const reset = Math.max(pr[u] || 0, pr._all || 0, us[u] || 0);
    return !(reset && scoreTime(s) <= reset);
  });
  Object.keys(us).forEach((u) => {
    const seen = p.lastSeen?.[u];
    // Nur entfernen, wenn sich der Mitarbeiter seit der Löschung nicht neu angemeldet hat
    if (!seen || (seen.timestamp || 0) <= us[u]) {
      if (p.progress) delete p.progress[u];
      if (p.lastSeen) delete p.lastSeen[u];
    }
    // PIN eines gelöschten Mitarbeiters gilt nicht mehr (außer er hat danach eine neue festgelegt)
    const pin = p.pins?.[u];
    if (pin && (pin.ts || 0) <= us[u]) delete p.pins![u];
  });
  if (t.products) p.customProducts = (p.customProducts || []).filter((x) => !t.products![x.id]);
  if (t.questions) p.customQuestions = (p.customQuestions || []).filter((q) => !t.questions![String(q.id)]);
  return p;
}

/** PINs: pro Mitarbeiter gewinnt die neueste Änderung (auch ein Zurücksetzen durch den Ausbilder) */
export function mergePins(a?: CloudPayload['pins'], b?: CloudPayload['pins']): NonNullable<CloudPayload['pins']> {
  const out: NonNullable<CloudPayload['pins']> = { ...(a || {}) };
  Object.keys(b || {}).forEach((u) => {
    const e = (b || {})[u];
    if (e && (!out[u] || (Number(e.ts) || 0) > (Number(out[u].ts) || 0))) out[u] = e;
  });
  return out;
}

/** Korrigierte Fragen: pro Frage gewinnt die neueste Änderung */
export function mergeQuestionEdits(a?: CloudPayload['questionEdits'], b?: CloudPayload['questionEdits']): NonNullable<CloudPayload['questionEdits']> {
  const out: NonNullable<CloudPayload['questionEdits']> = { ...(a || {}) };
  Object.keys(b || {}).forEach((id) => {
    const e = (b || {})[id];
    if (e && (!out[id] || (Number(e.ts) || 0) > (Number(out[id].ts) || 0))) out[id] = e;
  });
  return out;
}

/** Korrigierte Produktdaten: pro Produkt gewinnt die neueste Änderung */
export function mergeProductFixes(a?: CloudPayload['productFixes'], b?: CloudPayload['productFixes']): NonNullable<CloudPayload['productFixes']> {
  const out: NonNullable<CloudPayload['productFixes']> = { ...(a || {}) };
  Object.keys(b || {}).forEach((name) => {
    const e = (b || {})[name];
    if (e && (!out[name] || (Number(e.ts) || 0) > (Number(out[name].ts) || 0))) out[name] = e;
  });
  return out;
}

export function mergePayloads(
  local: CloudPayload,
  remote: CloudPayload
): CloudPayload {
  const scoreMap = new Map<string, ScoreEntry>();
  [...(remote.scores || []), ...(local.scores || [])].forEach((s) => {
    if (!s || !s.username) return;
    const key =
      s.id || `${s.username}_${s.score}_${s.date}_${s.category || ""}`;
    scoreMap.set(key, s);
  });
  const mergedScores = Array.from(scoreMap.values()).sort(
    (a, b) => b.score - a.score
  );

  const tR = remote.tombstones || {};
  const tL = local.tombstones || {};
  const unseen = (kind: keyof Tombstones, userKey: string) =>
    (tR[kind]?.[userKey] || 0) > (tL[kind]?.[userKey] || 0);

  const mergedProgress: Record<string, Record<string, any>> = {
    ...(remote.progress || {}),
  };
  Object.keys(local.progress || {}).forEach((userKey) => {
    // Gerät kennt die Löschung / das Zurücksetzen noch nicht → seine alten Daten nicht zurückholen
    if (unseen("users", userKey) || unseen("progressReset", userKey)) return;
    const skipWrong = unseen("wrongReset", userKey);
    if (!mergedProgress[userKey]) {
      mergedProgress[userKey] = { ...local.progress[userKey] };
    } else {
      Object.keys(local.progress[userKey] || {}).forEach((catKey) => {
        if (skipWrong && (catKey === "wrongStats" || catKey === "_fehler")) return;
        if (catKey.startsWith("_")) {
          mergedProgress[userKey][catKey] = local.progress[userKey][catKey];
        } else if (catKey === "wrongStats") {
          const statsA = mergedProgress[userKey].wrongStats || {};
          const statsB = local.progress[userKey].wrongStats || {};
          const mergedStats: Record<string, number> = {};
          new Set([...Object.keys(statsA), ...Object.keys(statsB)]).forEach(
            (qId) => {
              const val = Math.max(
                cleanStatNumber(statsA[qId]),
                cleanStatNumber(statsB[qId])
              );
              if (val > 0) mergedStats[qId] = val;
            }
          );
          mergedProgress[userKey].wrongStats = mergedStats;
        } else {
          const arrA = Array.isArray(mergedProgress[userKey][catKey])
            ? mergedProgress[userKey][catKey]
            : [];
          const arrB = Array.isArray(local.progress[userKey][catKey])
            ? local.progress[userKey][catKey]
            : [];
          mergedProgress[userKey][catKey] = Array.from(
            new Set(
              [...arrA, ...arrB].filter((x) => x !== null && x !== undefined)
            )
          );
        }
      });
    }
  });

  // Battles einzeln zusammenführen, sonst überschreibt der veraltete lokale Stand das Ergebnis des Gegners
  const mergedBattles: Record<string, BattleEntry> = {
    ...(remote.battles || {}),
  };
  Object.keys(local.battles || {}).forEach((id) => {
    const l = (local.battles || {})[id];
    if (!l) return;
    mergedBattles[id] = mergedBattles[id]
      ? mergeBattleEntry(l, mergedBattles[id])
      : l;
  });

  const mergedLastSeen = { ...(remote.lastSeen || {}) };
  Object.keys(local.lastSeen || {}).forEach((userKey) => {
    const loc = local.lastSeen[userKey];
    const rem = mergedLastSeen[userKey];
    if (!rem || (loc?.timestamp || 0) >= (rem?.timestamp || 0)) {
      mergedLastSeen[userKey] = loc;
    }
  });

  const mergedWrongStats: Record<string, number> = {};
  const remWrong = remote.wrongStats || {};
  const locWrong = local.wrongStats || {};
  new Set([...Object.keys(remWrong), ...Object.keys(locWrong)]).forEach(
    (qId) => {
      const val = Math.max(
        cleanStatNumber(remWrong[qId]),
        cleanStatNumber(locWrong[qId])
      );
      if (val > 0) mergedWrongStats[qId] = val;
    }
  );

  let mergedPinboard =
    remote.pinboard !== undefined ? remote.pinboard : local.pinboard;
  if (local.pinboard && remote.pinboard) {
    mergedPinboard =
      (local.pinboard.timestamp || 0) >= (remote.pinboard.timestamp || 0)
        ? local.pinboard
        : remote.pinboard;
  }

  const uniqueProdsMap = new Map<string, CustomProductItem>();
  [...(remote.customProducts || []), ...(local.customProducts || [])].forEach(
    (p) => {
      if (p && p.id) uniqueProdsMap.set(p.id, p);
    }
  );

  const uniqueQuestionsMap = new Map<number, Question>();
  [...(remote.customQuestions || []), ...(local.customQuestions || [])].forEach(
    (q) => {
      if (q && q.id !== undefined && q.id !== null)
        uniqueQuestionsMap.set(q.id, q);
    }
  );

  return applyTombstones({
    scores: mergedScores,
    progress: mergedProgress,
    lastSeen: mergedLastSeen,
    battles: mergedBattles,
    wrongStats: mergedWrongStats,
    pinboard: mergedPinboard || null,
    customProducts: Array.from(uniqueProdsMap.values()),
    customQuestions: Array.from(uniqueQuestionsMap.values()),
    tombstones: mergeTombstones(remote.tombstones, local.tombstones),
    questionEdits: mergeQuestionEdits(remote.questionEdits, local.questionEdits),
    productFixes: mergeProductFixes(remote.productFixes, local.productFixes),
    pins: mergePins(remote.pins, local.pins),
    compactedUntil: Math.max(Number(remote.compactedUntil) || 0, Number(local.compactedUntil) || 0) || undefined,
  });
}
