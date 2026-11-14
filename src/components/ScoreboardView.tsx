import { useState } from "react";
import { dc } from '../daten/data';
import { monthChampions, monthTotals, monthKeyOf, prevMonthKey, monthLabel } from '../ui/kalender';
import { ScoreEntry, Tombstones } from "../types";
import { getRankByPercentage, isLeaderboardExcludedCategory } from '../hilfen/allgemein';
import { battleOutcomeSinceReset, battleTime } from '../hilfen/battle';

// ───────────────────────── Bestenliste als „Bon der Besten“ ─────────────────────────

const C = {
  ink: dc('#2B170A'),
  brown: dc('#4B2A14'),
  muted: dc('#6B4A30'),
  cream: dc('#FFFBF2'),
  line: dc('#E3D3B6'),
  yellow: dc('#FFF0C2'),
  serif: "'Fredoka', Georgia, serif",
  mono: "'Courier Prime', 'Courier New', monospace",
};

const SB_CSS = `
.sb-wrap{display:flex;flex-direction:column;gap:20px;align-items:stretch}
.sb-keys{display:flex;flex-direction:column;gap:10px}
.sb-keylist{display:flex;flex-wrap:wrap;gap:8px;padding:4px 2px 10px}
.sb-keylist .sb-key{flex:0 0 auto;white-space:nowrap}
.sb-bon{width:100%;max-width:500px;margin:0 auto;font-size:19px}
.sb-frame{display:inline-block;color:#C9971C;animation:sbFrame 2s ease-in-out infinite}
@keyframes sbFrame{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
.sb-hofrow{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}
.sb-key{transition:transform .1s ease}
.sb-key:active{transform:translateY(3px)}
@keyframes sbPrint{from{clip-path:inset(0 0 100% 0);transform:translateY(-18px)}to{clip-path:inset(0 0 0 0);transform:none}}
@keyframes sbRow{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
@keyframes sbGlow{0%,100%{box-shadow:0 0 0 0 rgba(255,199,44,0)}50%{box-shadow:0 0 0 6px rgba(255,199,44,.55)}}
@keyframes sbKey{0%{transform:translateY(0)}40%{transform:translateY(4px)}100%{transform:translateY(0)}}
.sb-print{animation:sbPrint .9s cubic-bezier(.3,.7,.3,1) both}
.sb-row{animation:sbRow .4s cubic-bezier(.2,.8,.2,1) both}
.sb-me{animation:sbRow .4s cubic-bezier(.2,.8,.2,1) both,sbGlow 1.1s ease-in-out 2}
.sb-key[aria-selected=true]{animation:sbKey .25s ease}
@media (prefers-reduced-motion:reduce){.sb-print,.sb-row,.sb-me,.sb-key{animation:none !important}}
@media (max-width:820px){
  .sb-bon{max-width:440px;font-size:16px;transform:none !important}
  .sb-keylist{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin}
}
`;

/** Emojis am Ende von Kategorienamen entfernen ("Kassenblitz ⚡" → "Kassenblitz") */
const cleanLabel = (cat: string) =>
  cat.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[☀-➿️‍]/g, "").trim();

// Wertungen bündeln: echte Spiele einzeln, alle Quiz-Runden zusammen, Glücksspiele gar nicht
const GAME_NAMES = ["Theken-Simulator", "Theken-Ansturm", "Kassenblitz", "Bilderquiz", "Allergene-Training", "Teurer oder billiger", "Schneide-Profi", "Tüten-Blitz", "Alternativen-Jäger", "Adventskalender"];
const QUIZ_KEY = "Lernen & Quiz";
const scoreGroup = (cat: string): string | null => {
  const c = cleanLabel(cat || "");
  if (!c || /^Quiz Battle|^Regal einräumen|^Bonus vom Ausbilder|^Glücksrad|^Rubbellos|^Stempelkarte/.test(c)) return null;
  const g = GAME_NAMES.find((n) => c.startsWith(n));
  return g || QUIZ_KEY;
};

type BonRow = { key: string; name: string; value: string; sub?: string };

export function ScoreboardView({
  cloudScores,
  allKnownUserKeys,
  cloudLastSeen,
  cloudProgress,
  cloudBattles,
  currentUsername,
  getUserMasteryPercent,
  onRefresh,
  isSyncing,
  tombstones,
  badgeStats,
  badgeTotal = 0,
  onOpenProfile,
}: {
  onOpenProfile?: (uKey: string) => void;
  tombstones?: Tombstones;
  badgeStats?: (uKey: string) => { count: number; at: number };
  badgeTotal?: number;
  cloudScores: ScoreEntry[];
  allKnownUserKeys: string[];
  cloudLastSeen: Record<string, any>;
  cloudProgress: Record<string, any>;
  cloudBattles: Record<string, any>;
  currentUsername: string;
  getUserMasteryPercent: (uKey?: string) => number;
  onRefresh: () => void;
  isSyncing: boolean;
}) {
  const [mode, setMode] = useState<string>("total");
  const [showAll, setShowAll] = useState<boolean>(false);
  const [gamesOpen, setGamesOpen] = useState<boolean>(false);
  const myKey = currentUsername.toLowerCase();
  const champs = monthChampions(cloudScores as any);
  const lastChamp = champs.length && champs[0].month === prevMonthKey() ? champs[0] : null;

  const ptsBy = new Map<string, number>();
  cloudScores.forEach((sc: any) => { if (sc?.username) { const k = String(sc.username).toLowerCase(); ptsBy.set(k, (ptsBy.get(k) || 0) + (Number(sc.score) || 0)); } });
  const frameFor = (k: string) => { const p = ptsBy.get(k) || 0; return p >= 12500 ? "lt-frame-gold" : p >= 5000 ? "lt-frame-silver" : p >= 1300 ? "lt-frame-bronze" : ""; };
  const displayName = (uKey: string, fallback?: string) => {
    const n = cloudLastSeen[uKey]?.displayName || cloudProgress[uKey]?._displayName || fallback || uKey;
    const av = cloudProgress[uKey]?._avatar;
    const crown = lastChamp && lastChamp.key === uKey ? "👑 " : "";
    const meister = uKey !== "admin" && getUserMasteryPercent(uKey) >= 100 ? "🎖️ " : "";
    return crown + meister + (av ? `${av} ${n}` : n);
  };

  // Einzelwertungen: alle Kategorien, in denen es Punkte gibt (ohne Battle und ausgeschlossene)
  const singleCategories = Array.from(
    new Set(
      cloudScores
        .filter((s) => s.category && !isLeaderboardExcludedCategory(s.category))
        .map((s) => scoreGroup(s.category || ""))
        .filter((c): c is string => !!c && c !== QUIZ_KEY)
    )
  ).sort((a, b) => a.localeCompare(b, "de"));
  const hasQuiz = cloudScores.some((s) => s.category && !isLeaderboardExcludedCategory(s.category) && scoreGroup(s.category) === QUIZ_KEY);

  const keys: { id: string; label: string }[] = [
    { id: "total", label: "Gesamtpunkte" },
    { id: "month", label: `Monatswertung ${monthLabel(monthKeyOf()).split(" ")[0]}` },
    { id: "mastery", label: "Warenkunde-Rang" },
    { id: "battle", label: "Quiz Battle" },
    ...(hasQuiz ? [{ id: "quiz", label: "Lernen & Quiz" }] : []),
    ...(badgeStats ? [{ id: "badges", label: "Abzeichen" }] : []),
    ...singleCategories.map((c) => ({ id: `cat:${c}`, label: cleanLabel(c) })),
  ];
  const activeMode = keys.some((k) => k.id === mode) ? mode : "total";
  const activeLabel = keys.find((k) => k.id === activeMode)?.label || "Gesamtpunkte";

  // ── Zeilen für den Bon berechnen ──
  let rows: BonRow[] = [];
  let footer: { left: string; right: string }[] = [];

  if (activeMode === "total") {
    const sums = new Map<string, { name: string; sum: number }>();
    cloudScores.forEach((s) => {
      if (!s?.username) return;
      const k = s.username.toLowerCase();
      const cur = sums.get(k) || { name: displayName(k, s.username), sum: 0 };
      cur.sum += Number(s.score) || 0;
      sums.set(k, cur);
    });
    // In der Schatzkammer ausgegebene Punkte fehlen in der Gesamtwertung
    sums.forEach((v, k) => { v.sum -= Number(cloudProgress[k]?._ptsSpent) || 0; });
    const list = Array.from(sums.entries())
      .filter(([k]) => k !== "admin")
      .sort((a, b) => b[1].sum - a[1].sum);
    rows = list.map(([k, v]) => ({ key: k, name: v.name, value: v.sum.toLocaleString("de-DE"), sub: Number(cloudProgress[k]?._ptsSpent) > 0 ? `💎 ${Number(cloudProgress[k]?._ptsSpent).toLocaleString("de-DE")} Pkt in der Schatzkammer` : undefined }));
    const team = list.reduce((t, [, v]) => t + v.sum, 0);
    footer = [
      { left: "TEAM GESAMT", right: `${team.toLocaleString("de-DE")} PKT` },
      { left: "Mitspieler", right: String(list.length) },
    ];
  } else if (activeMode === "month") {
    const tot = monthTotals(cloudScores as any)[monthKeyOf()] || {};
    const list = Object.entries(tot).sort((a, b) => b[1] - a[1]);
    rows = list.map(([k, v]) => ({ key: k, name: displayName(k), value: v.toLocaleString("de-DE") }));
    const d = new Date(); const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    footer = [
      { left: "WER VORNE LIEGT", right: "WIRD 👑" },
      { left: "Noch Tage im Monat", right: String(last - d.getDate()) },
    ];
  } else if (activeMode === "mastery") {
    const list = allKnownUserKeys
      .map((k) => ({ k, pct: getUserMasteryPercent(k) }))
      .sort((a, b) => b.pct - a.pct);
    rows = list.map((u) => ({
      key: u.k,
      name: displayName(u.k),
      value: `${u.pct} %`,
      sub: getRankByPercentage(u.pct).title,
    }));
    footer = [{ left: "Ab 90 %", right: "Warenkunde-Meister" }];
  } else if (activeMode === "badges" && badgeStats) {
    // Meiste Abzeichen; bei Gleichstand gewinnt, wer die Zahl zuerst erreicht hat
    const list = allKnownUserKeys
      .map((k) => ({ k, ...badgeStats(k) }))
      .filter((u) => u.count > 0)
      .sort((a, b) => b.count - a.count || a.at - b.at);
    rows = list.map((u) => ({
      key: u.k,
      name: displayName(u.k),
      value: `${u.count} / ${badgeTotal}`,
      sub: u.at > 0 && u.at < Number.MAX_SAFE_INTEGER ? `erreicht am ${new Date(u.at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}` : undefined,
    }));
    footer = [{ left: "Gleichstand", right: "wer zuerst da war" }];
  } else if (activeMode === "battle") {
    const list = allKnownUserKeys
      .map((k) => {
        let won = 0, tie = 0, lost = 0;
        Object.values(cloudBattles || {}).forEach((b: any) => {
          const o = battleOutcomeSinceReset(b, k, tombstones);
          if (o === "won") won++;
          else if (o === "tie") tie++;
          else if (o === "lost") lost++;
        });
        return { k, won, tie, lost };
      })
      .filter((u) => u.won + u.tie + u.lost > 0)
      .sort((a, b) => b.won - a.won || a.lost - b.lost);
    rows = list.map((u) => ({
      key: u.k,
      name: displayName(u.k),
      value: `${u.won} Siege`,
      sub: `${u.tie} unentschieden · ${u.lost} verloren`,
    }));
    const allReset = tombstones?.pointsReset?._all || 0;
    const total = Object.values(cloudBattles || {}).filter((b: any) => b?.status === "finished" && battleTime(b) > allReset).length;
    footer = [{ left: "Battles gespielt", right: String(total) }];
  } else {
    // Alle Runden zählen: Punkte werden pro Spiel aufaddiert (so ist nicht irgendwann jeder Erster)
    const cat = activeMode === "quiz" ? QUIZ_KEY : activeMode.slice(4);
    const agg = new Map<string, { name: string; sum: number; rounds: number; best: number }>();
    cloudScores
      .filter((s) => s.username && s.category && !isLeaderboardExcludedCategory(s.category) && scoreGroup(s.category) === cat)
      .forEach((s) => {
        const k = s.username.toLowerCase();
        const cur = agg.get(k) || { name: displayName(k, s.username), sum: 0, rounds: 0, best: 0 };
        const v = Number(s.score) || 0;
        cur.sum += v; cur.rounds += 1; cur.best = Math.max(cur.best, v);
        agg.set(k, cur);
      });
    const list = Array.from(agg.entries()).filter(([k]) => k !== "admin").sort((a, b) => b[1].sum - a[1].sum || b[1].best - a[1].best);
    rows = list.map(([k, v]) => ({
      key: k,
      name: v.name,
      value: v.sum.toLocaleString("de-DE"),
      sub: `${v.rounds} ${v.rounds === 1 ? "Runde" : "Runden"} · Bestwert ${v.best.toLocaleString("de-DE")}`,
    }));
    footer = [{ left: "Wertung", right: "Summe aller Runden" }];
  }

  const myPlace = rows.findIndex((r) => r.key === myKey);
  const now = new Date();
  const stamp = `${now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}, ${now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;

  const dash = (thick = 2) => <div style={{ borderTop: `${thick}px dashed ${C.ink}`, margin: "10px 0" }} />;

  return (
    <div style={{ width: "100%", color: C.ink }}>
      <style>{SB_CSS}</style>
      <div className="sb-wrap">
        {/* ── Oben: Überschrift und Wertungen als Kassentasten nebeneinander ── */}
        <div className="sb-keys">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: C.serif, fontWeight: 400, fontSize: "46px", lineHeight: 1.05 }}>Bestenliste</h1>
              <p style={{ margin: "6px 0 0", fontSize: "18px", lineHeight: 1.5, color: C.brown }}>
                Wähle, wonach sortiert wird.
                {myPlace >= 0 && <> Du bist gerade auf <strong>Platz {myPlace + 1}</strong>.</>}
              </p>
            </div>
            <button onClick={onRefresh} style={{ minHeight: "44px", padding: "0 16px", borderRadius: "999px", border: "none", backgroundColor: "#FFFFFF", boxShadow: "0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)", color: C.brown, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
              {isSyncing ? "Wird aktualisiert …" : "↻ Aktualisieren"}
            </button>
          </div>
          {(() => {
            const keyBtn = (k: { id: string; label: string }, small = false) => {
              const active = k.id === activeMode;
              return (
                <button key={k.id} role="tab" aria-selected={active} className="sb-key" onClick={() => { setMode(k.id); setShowAll(false); if (k.id.startsWith("cat:")) setGamesOpen(false); }}
                  style={{ minHeight: small ? "42px" : "46px", padding: "0 18px", borderRadius: "999px", border: "none", backgroundColor: active ? "#1F140C" : "#FFFFFF", color: active ? "#FFD86B" : C.ink, boxShadow: active ? "0 8px 18px -10px rgba(31,20,12,.7)" : "0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)", fontSize: small ? "15px" : "16px", fontWeight: 700, cursor: "pointer", transition: "background-color .2s, color .2s" }}>
                  {k.label}
                </button>
              );
            };
            const mainKeys = keys.filter(k => !k.id.startsWith("cat:"));
            const gameKeys = keys.filter(k => k.id.startsWith("cat:"));
            const gameActive = activeMode.startsWith("cat:");
            return (
              <>
                <div className="sb-keylist" role="tablist" aria-label="Wertung">
                  {mainKeys.map(k => keyBtn(k))}
                  {gameKeys.length > 0 && (
                    <button className="sb-key" aria-expanded={gamesOpen} onClick={() => setGamesOpen(!gamesOpen)}
                      style={{ minHeight: "46px", padding: "0 18px", borderRadius: "999px", border: "none", backgroundColor: gameActive ? "#1F140C" : "#FFFFFF", color: gameActive ? "#FFD86B" : C.ink, boxShadow: gameActive ? "0 8px 18px -10px rgba(31,20,12,.7)" : "0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
                      {gameActive ? keys.find(k => k.id === activeMode)?.label : `Spiele (${gameKeys.length})`} {gamesOpen ? "▴" : "▾"}
                    </button>
                  )}
                </div>
                {gamesOpen && gameKeys.length > 0 && (
                  <div className="lt-pop-in" role="tablist" aria-label="Spiele" style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "12px", borderRadius: "20px", backgroundColor: "#F6EFE2" }}>
                    {gameKeys.map(k => keyBtn(k, true))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* ── Rechte Seite: der Bon ── */}
        <div className="sb-bon" style={{ transform: "rotate(1.5deg)", filter: "drop-shadow(0 18px 24px rgba(75,42,20,0.22))" }}>
          <div aria-hidden="true" style={{ height: "14px", backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%), linear-gradient(225deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%)`, backgroundSize: "20px 14px", backgroundRepeat: "repeat-x", backgroundPosition: "bottom left" }} />
          <div key={activeMode} className="sb-print" style={{ backgroundColor: dc('#FFFFFF'), padding: "22px 26px 26px", fontFamily: C.mono, lineHeight: 1.65 }}>
            <div style={{ textAlign: "center", fontWeight: 700, fontSize: "1.2em", letterSpacing: "2px" }}>BÄCKEREI HINKEL</div>
            <div style={{ textAlign: "center", fontSize: "0.85em" }}>Bestenliste · {activeLabel}</div>
            <div style={{ textAlign: "center", fontSize: "0.85em" }}>Stand {stamp}</div>
            {dash()}

            {rows.length === 0 ? (
              <div style={{ textAlign: "center", padding: "18px 0" }}>Noch keine Einträge,<br />spiel eine Runde!</div>
            ) : (
              (() => {
                const LIMIT = 10;
                const visible = showAll || rows.length <= LIMIT + 2 ? rows.map((r, i) => ({ r, i })) : rows.map((r, i) => ({ r, i })).filter(({ i, r }) => i < LIMIT || r.key === myKey);
                return visible.map(({ r, i }, vi) => {
                const isMe = r.key === myKey;
                const skipped = vi > 0 && i - visible[vi - 1].i > 1;
                const top = i < 3;
                return (
                  <div key={r.key}>
                    {i === 3 && !skipped && <div style={{ borderTop: `1px dashed ${C.ink}`, margin: "8px 0" }} />}
                    {skipped && <div style={{ textAlign: "center", letterSpacing: "4px", color: C.muted, margin: "2px 0" }}>· · ·</div>}
                    <div
                      className={isMe ? "sb-me" : "sb-row"}
                      role={onOpenProfile ? "button" : undefined}
                      title={onOpenProfile ? "Profil ansehen" : undefined}
                      onClick={onOpenProfile ? () => onOpenProfile(r.key) : undefined}
                      style={{
                        cursor: onOpenProfile ? "pointer" : undefined,
                        animationDelay: `${0.35 + Math.min(i, 15) * 0.07}s${isMe ? `, ${0.6 + Math.min(i, 15) * 0.07}s` : ""}`,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontWeight: top || isMe ? 700 : 400,
                        fontSize: i === 0 ? "1.15em" : undefined,
                        backgroundColor: isMe ? C.yellow : "transparent",
                        margin: isMe ? "0 -10px" : 0,
                        padding: isMe ? "2px 10px" : 0,
                        borderRadius: "4px",
                      }}
                    >
                      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {i + 1} {i === 0 ? <span className="lt-emo-spin">★</span> : "·"} {(() => { const pr = cloudProgress[r.key] || {}; const fr = ({ pt_fr_sterne: "✦", pt_fr_brezel: "🥨", pt_fr_herz: "♥", pt_fr_croissant: "🥐", pt_fr_krone: "👑" } as Record<string, string>)[pr._frame] || ""; return <>{fr && <span className="sb-frame">{fr} </span>}{(() => { const av = pr._avatar ? String(pr._avatar) : ""; const fc = frameFor(r.key); const cls = pr._nameColor ? `lt-nc lt-nc-${String(pr._nameColor).replace("pt_nc_", "")}` : pr._gold ? "lt-goldname" : undefined; if (!av || !fc || !r.name.includes(av + " ")) return <span className={cls}>{r.name.toUpperCase()}</span>; const [pre, post] = [r.name.slice(0, r.name.indexOf(av + " ")), r.name.slice(r.name.indexOf(av + " ") + av.length + 1)]; return <>{pre}<span className={fc} title="Rahmen nach Stufe" style={{ width: "1.9em", height: "1.9em" }}>{av}</span> <span className={cls}>{post.toUpperCase()}</span></>; })()}{fr && <span className="sb-frame"> {fr}</span>}</>; })()}{isMe ? " (DU)" : ""}
                      </span>
                      <span style={{ whiteSpace: "nowrap" }}>{r.value}</span>
                    </div>
                    {r.sub && (
                      <div style={{ fontSize: "0.78em", color: C.muted, marginTop: "-4px", marginBottom: "2px", paddingLeft: "2.2em" }}>{r.sub}</div>
                    )}
                  </div>
                );
              });
              })()
            )}
            {rows.length > 12 && (
              <button onClick={() => setShowAll(!showAll)} style={{ display: "block", width: "100%", marginTop: "10px", minHeight: "44px", border: `1px dashed ${C.ink}`, borderRadius: "8px", backgroundColor: "transparent", fontFamily: C.mono, fontSize: "0.85em", fontWeight: 700, color: C.ink, cursor: "pointer" }}>
                {showAll ? "▲ Nur Top 10 zeigen" : `▼ Alle ${rows.length} anzeigen`}
              </button>
            )}

            {dash()}
            {footer.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontWeight: i === 0 ? 700 : 400, fontSize: i === 0 ? undefined : "0.85em" }}>
                <span>{f.left}</span><span>{f.right}</span>
              </div>
            ))}
            <div aria-hidden="true" style={{ height: "44px", marginTop: "14px", backgroundImage: `repeating-linear-gradient(90deg, ${C.ink} 0px, ${C.ink} 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 5px, ${C.ink} 5px, ${C.ink} 6px, rgba(0,0,0,0) 6px, rgba(0,0,0,0) 10px)` }} />
            <div style={{ textAlign: "center", fontSize: "0.85em", marginTop: "8px" }}>Weiter so, Brotfreunde!</div>
          </div>
          <div aria-hidden="true" style={{ height: "14px", backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%), linear-gradient(-45deg, rgba(0,0,0,0) 50%, ${dc('#FFFFFF')} 50%)`, backgroundSize: "20px 14px", backgroundRepeat: "repeat-x", transform: "rotate(180deg)" }} />
        </div>

        {champs.length > 0 && (
          <div style={{ width: "100%", maxWidth: "760px", margin: "0 auto", padding: "18px", borderRadius: "22px", background: "linear-gradient(135deg, #4B2A14, #7A4A26)", color: "#FFF6E0", display: "flex", flexDirection: "column", gap: "10px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: C.serif, fontSize: "26px", color: "#FFE27A" }}>Hall of Fame</span>
              <span style={{ fontSize: "14px", opacity: 0.85 }}>Die Monatsmeister</span>
            </div>
            <div className="sb-hofrow">
              {champs.slice(0, 12).map((c, i) => (
                <div key={c.month} className="sb-row" style={{ animationDelay: `${0.2 + i * 0.06}s`, flex: "0 0 auto", minWidth: "150px", padding: "12px 14px", borderRadius: "16px", backgroundColor: i === 0 ? "rgba(255,226,122,.2)" : "rgba(255,255,255,.08)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "13px", opacity: 0.85 }}>{monthLabel(c.month)}</span>
                  <span style={{ fontWeight: 800, fontSize: "17px" }}>{i === 0 ? "👑" : "🥇"} {cloudLastSeen[c.key]?.displayName || cloudProgress[c.key]?._displayName || c.key}</span>
                  <span style={{ fontSize: "14px", color: "#FFE27A" }}>{c.points.toLocaleString("de-DE")} Pkt</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}