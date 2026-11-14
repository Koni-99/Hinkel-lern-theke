import { useState } from "react";
import { getRankByPercentage, BATTLE_POINTS } from '../hilfen/allgemein';
import { battleOutcomeSinceReset, battleTimeOf, formatBattleTime } from '../hilfen/battle';
import { dc } from '../daten/data';
import { Tombstones } from "../types";
import { GameProgress, AnswerFx } from '../ui/antwortFx';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead, StatChip, ProductImages, ConfettiOverlay } from '../ui/basis';
import { ReportLink, ReportContext } from '../ui/melden';
import { Swords3D } from '../ui/hilfe';

export function BattleView({
  username,
  cloudBattles,
  allKnownUserKeys,
  cloudLastSeen,
  cloudProgress,
  getUserMasteryPercent,
  battleState,
  setBattleState,
  battleQuestions,
  battleIndex,
  battleTimeLeft,
  selectedAnswer,
  isAnswered,
  battleCorrects,
  fetchCloudData,
  createBattleChallenge,
  acceptBattleChallenge,
  handleBattleAnswer,
  images = {},
  tombstones,
  timeJokers = 0,
  onTimeJoker,
  myTime = 0,
  activeBattle = null,
  myBalance = 0,
  levelOf,
}: {
  levelOf?: (uKey: string) => string;
  myBalance?: number;
  myTime?: number;
  activeBattle?: any;
  timeJokers?: number;
  onTimeJoker?: () => void;
  images?: ProductImages;
  tombstones?: Tombstones;
  username: string;
  cloudBattles: Record<string, any>;
  allKnownUserKeys: string[];
  cloudLastSeen: Record<string, any>;
  cloudProgress: Record<string, any>;
  getUserMasteryPercent: (uKey?: string) => number;
  battleState: "menu" | "playing" | "waiting";
  setBattleState: (s: "menu" | "playing" | "waiting") => void;
  battleQuestions: any[];
  battleIndex: number;
  battleTimeLeft: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  battleCorrects: number;
  fetchCloudData: () => void;
  createBattleChallenge: (uKey: string, name: string, stake?: number) => void;
  acceptBattleChallenge: (b: any) => void;
  handleBattleAnswer: (idx: number) => void;
}) {
  const myKey = username.toLowerCase();
  const [stake, setStake] = useState<number>(0);

  let wonCount = 0,
    tieCount = 0,
    lostCount = 0;
  Object.values(cloudBattles).forEach((b: any) => {
    const outcome = battleOutcomeSinceReset(b, myKey, tombstones);
    if (outcome === "won") wonCount++;
    else if (outcome === "tie") tieCount++;
    else if (outcome === "lost") lostCount++;
  });

  // Offene Duelle, in denen ich noch spielen muss:
  //, der Herausgeforderte zuerst, danach ist der Herausforderer an der Reihe.
  const pendingBattles = Object.values(cloudBattles).filter((b: any) => {
    if (
      (b.status === "pending" || b.status === "waiting_opponent") &&
      b.opponentKey === myKey
    )
      return true;
    if (b.status === "waiting_challenger" && b.challengerKey === myKey)
      return true;
    return false;
  });

  const finishedBattles = Object.values(cloudBattles)
    .filter(
      (b: any) =>
        b.status === "finished" &&
        (b.challengerKey === myKey || b.opponentKey === myKey) &&
        battleOutcomeSinceReset(b, myKey, tombstones) !== null
    )
    .slice(-10)
    .reverse();

  const others = allKnownUserKeys.filter((k) => k !== myKey);
  const sectionTitle = (t: string) => (
    <h2 style={{ margin: "0 0 12px", fontFamily: TH.serif, fontWeight: 400, fontSize: "28px" }}>{t}</h2>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", color: TH.ink }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
        <PageHead
          title="Quiz Battle"
          subtitle={`Fordere Kollegen heraus: 5 gemischte Fragen, auch mit Produktfotos, 15 Sekunden pro Frage. Bei gleich vielen richtigen Antworten gewinnt, wer schneller war. Sieg +${BATTLE_POINTS} Punkte, Niederlage −${BATTLE_POINTS} Punkte.`}
        />
        {battleState === "menu" && (
          <button onClick={() => fetchCloudData()} style={{ ...btnSecondary, minHeight: "48px", fontSize: "16px" }}>Aktualisieren</button>
        )}
      </div>

      {battleState === "menu" && (
        <>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <StatChip label="Gewonnen" value={wonCount} tone="yellow" />
            <StatChip label="Unentschieden" value={tieCount} />
            <StatChip label="Verloren" value={lostCount} />
          </div>

          {pendingBattles.length > 0 && (
            <div style={{ ...cardStyle, backgroundColor: TH.tintYellow, border: "none" }}>
              {sectionTitle(`Du bist dran (${pendingBattles.length})`)}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pendingBattles.map((b: any) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", backgroundColor: TH.white, padding: "14px 16px", borderRadius: "16px" }}>
                    <div style={{ fontSize: "18px", lineHeight: 1.4 }}>
                      {b.challengerKey === myKey
                        ? <><strong>{b.opponent}</strong> hat gespielt, jetzt bist du dran!</>
                        : <><strong>{b.challenger}</strong> fordert dich heraus!</>}
                      {Number(b.stake) > 0 && <span style={{ display: "inline-block", marginLeft: "8px", padding: "2px 10px", borderRadius: "999px", backgroundColor: "#FFE27A", fontSize: "15px", fontWeight: 800 }}>Einsatz {b.stake} Pkt</span>}
                    </div>
                    <button onClick={() => acceptBattleChallenge(b)} style={{ ...btnPrimary, minHeight: "52px", fontSize: "17px" }}>Jetzt spielen</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={cardStyle}>
            {sectionTitle("Kollegen herausfordern")}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              <span style={{ fontSize: "17px", fontWeight: 700 }}>Einsatz:</span>
              {[0, 50, 100, 250].map(v => (
                <button key={v} onClick={() => setStake(v)} disabled={v > 0 && myBalance < v} style={{ minHeight: "44px", padding: "0 14px", borderRadius: "999px", border: stake === v ? "none" : `2px solid ${TH.line}`, backgroundColor: stake === v ? TH.brown : TH.white, color: stake === v ? "#FFE27A" : TH.ink, fontSize: "16px", fontWeight: 800, cursor: v > 0 && myBalance < v ? "not-allowed" : "pointer", opacity: v > 0 && myBalance < v ? 0.45 : 1 }}>{v === 0 ? "ohne" : `${v} Pkt`}</button>
              ))}
              <span style={{ fontSize: "14px", color: TH.muted, flexBasis: "100%" }}>{stake > 0 ? `Wer gewinnt, bekommt ${stake} Punkte vom anderen, zusätzlich zu den ±${BATTLE_POINTS}.` : "Mit Einsatz wird es spannender: Der Sieger bekommt die Punkte vom anderen."}</span>
            </div>
            {others.length === 0 ? (
              <p style={{ margin: 0, fontSize: "18px", color: TH.muted }}>Es sind noch keine anderen Spieler angemeldet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {others.map((userKey) => {
                  const dispName = cloudLastSeen[userKey]?.displayName || cloudProgress[userKey]?._displayName || userKey;
                  const uPct = getUserMasteryPercent(userKey);
                  const uRank = getRankByPercentage(uPct);
                  return (
                    <div key={userKey} style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", padding: "12px 14px", borderRadius: "16px", backgroundColor: TH.cream, border: `1px solid ${TH.line}` }}>
                      <span style={{ flex: "0 0 48px", height: "48px", borderRadius: "50%", backgroundColor: TH.tintYellow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TH.serif, fontSize: "22px" }}>{String(dispName).charAt(0).toUpperCase()}</span>
                      <span style={{ flex: "1 1 160px" }}>
                        <strong style={{ fontSize: "18px" }}>{dispName}</strong>
                        <span style={{ display: "block", fontSize: "16px", color: TH.muted }}>{levelOf ? levelOf(userKey) : uRank.title} · {uPct} % gemeistert</span>
                      </span>
                      <button onClick={() => createBattleChallenge(userKey, dispName, stake)} style={{ ...btnPrimary, minHeight: "50px", fontSize: "17px", backgroundColor: "#C2462A", color: "#FFFFFF", boxShadow: "0 4px 0 #7A2A14, 0 12px 20px -12px rgba(122,42,20,.7)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Swords3D size={22} />Herausfordern</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            {sectionTitle("Letzte Duelle")}
            {finishedBattles.length === 0 ? (
              <p style={{ margin: 0, fontSize: "18px", color: TH.muted }}>Noch keine abgeschlossenen Duelle.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {finishedBattles.map((b: any) => {
                  const outcome = battleOutcomeSinceReset(b, myKey, tombstones);
                  const isWinner = outcome === "won";
                  const isTie = outcome === "tie";
                  return (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "12px 16px", borderRadius: "16px", backgroundColor: isTie ? TH.cream : isWinner ? TH.tintSage : TH.tintPeach }}>
                      <div style={{ fontSize: "17px" }}>
                        <strong>{b.challenger}</strong> gegen <strong>{b.opponent}</strong>
                        {(() => {
                          const n = Array.isArray(b.questions) && b.questions.length ? b.questions.length : 5;
                          const ct = formatBattleTime(battleTimeOf(b, "challenger")), ot = formatBattleTime(battleTimeOf(b, "opponent"));
                          const line = (name: string, sc: number, t: string, win: boolean) => (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: TH.ink, marginTop: "4px" }}>
                              <span style={{ minWidth: "18px" }} aria-hidden="true">{win ? "🏆" : ""}</span>
                              <span style={{ fontWeight: win ? 800 : 500 }}>{name}</span>
                              <span style={{ padding: "2px 8px", borderRadius: "999px", backgroundColor: TH.white, fontWeight: 800 }}>{sc}/{n}</span>
                              {t && <span style={{ color: TH.muted }}>⏱️ {t}</span>}
                            </div>
                          );
                          return <>{line(b.challenger, b.challengerScore, ct, b.winner === b.challenger)}{line(b.opponent, b.opponentScore, ot, b.winner === b.opponent)}</>;
                        })()}
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "17px", color: isTie ? TH.ink : isWinner ? TH.green : TH.red }}>
                          {isTie ? "Unentschieden" : isWinner ? `Sieg${b.challengerScore === b.opponentScore ? " (schneller)" : ""} · +${BATTLE_POINTS + (Number(b.stake) || 0)}` : `Niederlage${b.challengerScore === b.opponentScore ? " (langsamer)" : ""} · −${BATTLE_POINTS + (Number(b.stake) || 0)}`}
                        </span>
                        {(() => {
                          const otherKey = b.challengerKey === myKey ? b.opponentKey : b.challengerKey;
                          const otherName = b.challengerKey === myKey ? b.opponent : b.challenger;
                          if (!otherKey || otherKey === "admin") return null;
                          const running = Object.values(cloudBattles).some((x: any) => x && x.status !== "finished" && ((x.challengerKey === myKey && x.opponentKey === otherKey) || (x.opponentKey === myKey && x.challengerKey === otherKey)));
                          if (running) return <span style={{ fontSize: "15px", color: TH.muted, fontWeight: 700 }}>Neues Duell läuft</span>;
                          return <button onClick={() => createBattleChallenge(otherKey, otherName)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 16px", borderRadius: "999px", border: "none", backgroundColor: "#C2462A", color: "#FFFFFF", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 0 #7A2A14" }}><Swords3D size={20} />{isWinner ? "Nochmal" : "Revanche"}</button>;
                        })()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {battleState === "playing" && battleQuestions.length > 0 && (() => {
        const currentQ = battleQuestions[battleIndex];
        return (
          <>
            <GameProgress label="Frage" index={battleIndex} answered={isAnswered} total={battleQuestions.length} />
            {currentQ && <ReportContext report={{ game: "Quiz Battle", qid: typeof currentQ.id === "number" ? currentQ.id : undefined, product: (currentQ as any).product || ((currentQ as any).imageKey ? currentQ.options[currentQ.correct] : undefined), text: currentQ.question, detail: typeof currentQ.id === "number" ? undefined : `Richtig laut App: ${currentQ.options[currentQ.correct]}` }} />}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <StatChip label="Frage" value={`${battleIndex + 1} / ${battleQuestions.length}`} />
              <StatChip label="Zeit" value={`${battleTimeLeft} s`} tone={battleTimeLeft <= 5 ? "warn" : "yellow"} />
              {onTimeJoker && timeJokers > 0 && !isAnswered && (
                <button onClick={onTimeJoker} style={{ minHeight: "46px", padding: "0 14px", borderRadius: "12px", border: `2px dashed ${TH.brown}`, backgroundColor: TH.tintYellow, color: TH.ink, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>⏱️ +10 Sekunden ({timeJokers})</button>
              )}
            </div>
            <div style={{ height: "10px", backgroundColor: dc('#F4EADB'), borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (battleTimeLeft / 15) * 100)}%`, height: "100%", backgroundColor: battleTimeLeft <= 5 ? TH.red : TH.yellow, transition: "width 0.95s linear" }} />
            </div>
            <div key={battleIndex} className="lt-pop-in" style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "18px", padding: "28px", position: "relative" }}>
              <AnswerFx fx={isAnswered ? { k: battleIndex, ok: selectedAnswer === currentQ.correct, text: selectedAnswer === null ? "⏱️ Zeit um" : selectedAnswer === currentQ.correct ? "⚔️ Treffer!" : "✗ Daneben" } : null} />
              {currentQ.imageKey && (
                images[currentQ.imageKey]
                  ? <img src={images[currentQ.imageKey]} alt="Welches Produkt ist das?" style={{ width: "100%", maxWidth: "300px", alignSelf: "center", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "20px", border: `2px solid ${TH.line}` }} />
                  : <div style={{ alignSelf: "center", padding: "40px 20px", borderRadius: "20px", backgroundColor: TH.cream, color: TH.muted, fontSize: "17px" }}>Foto wird geladen …</div>
              )}
              <h3 style={{ margin: 0, fontSize: "24px", lineHeight: 1.4, fontWeight: 700 }}>{currentQ.question}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {currentQ.options.map((option: string, idx: number) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrectOption = idx === currentQ.correct;
                  let bg = TH.cream, border = TH.line, color = TH.ink;
                  if (isAnswered) {
                    if (isCorrectOption) { bg = TH.tintSage; border = TH.green; }
                    else if (isSelected) { bg = TH.tintPeach; border = TH.red; }
                    else { bg = TH.white; color = TH.muted; }
                  }
                  return (
                    <button key={idx} className={isAnswered ? (isCorrectOption ? "lt-correct" : isSelected ? "lt-wrong" : undefined) : undefined} onClick={() => handleBattleAnswer(idx)} disabled={isAnswered || selectedAnswer !== null} style={{ display: "flex", alignItems: "center", gap: "14px", minHeight: "62px", padding: "12px 16px", borderRadius: "16px", border: `3px solid ${border}`, backgroundColor: bg, color, fontSize: "19px", lineHeight: 1.35, textAlign: "left", cursor: isAnswered ? "default" : "pointer" }}>
                      <span style={{ flex: "0 0 38px", height: "38px", borderRadius: "50%", backgroundColor: TH.white, border: `2px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, boxSizing: "border-box" }}>{String.fromCharCode(65 + idx)}</span>
                      <span style={{ flex: 1 }}>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        );
      })()}

      {battleState === "waiting" && (
        <div className="lt-pop-in" style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", padding: "32px 24px", position: "relative", overflow: "hidden" }}>
          <ConfettiOverlay active={battleQuestions.length > 0 && battleCorrects === battleQuestions.length} />
          <div style={{ fontSize: "16px", fontWeight: 700, color: TH.muted, textTransform: "uppercase", letterSpacing: "2px" }}>Runde gespeichert</div>
          <div className="lt-count" style={{ fontFamily: TH.serif, fontSize: "60px", lineHeight: 1 }}>{battleCorrects} / {battleQuestions.length}</div>
          {myTime > 0 && <div style={{ padding: "6px 14px", borderRadius: "999px", backgroundColor: TH.tintYellow, fontSize: "18px", fontWeight: 800 }}>⏱️ Deine Zeit: {formatBattleTime(myTime)}</div>}
          {activeBattle && activeBattle.status === "finished" ? (() => {
            const oc = battleOutcomeSinceReset(activeBattle, myKey, tombstones) || (activeBattle.winner === "Unentschieden" ? "tie" : activeBattle.winner && activeBattle.winner.toLowerCase() === myKey ? "won" : "lost");
            const iAmCh = activeBattle.challengerKey === myKey;
            const other = iAmCh ? activeBattle.opponent : activeBattle.challenger;
            const oSc = iAmCh ? activeBattle.opponentScore : activeBattle.challengerScore;
            const oT = formatBattleTime(battleTimeOf(activeBattle, iAmCh ? "opponent" : "challenger"));
            const same = activeBattle.challengerScore === activeBattle.opponentScore;
            return (
              <div className="lt-levelup" style={{ padding: "14px 18px", borderRadius: "18px", backgroundColor: oc === "won" ? TH.tintSage : oc === "tie" ? TH.cream : TH.tintPeach, maxWidth: "480px" }}>
                <div style={{ fontFamily: TH.serif, fontSize: "30px", lineHeight: 1.1, color: oc === "won" ? TH.green : oc === "tie" ? TH.ink : TH.red }}>{oc === "won" ? `Gewonnen${same ? ", du warst schneller!" : "!"}` : oc === "tie" ? "Unentschieden" : `Verloren${same ? ", knapp zu langsam" : ""}`}</div>
                <div style={{ fontSize: "17px", color: TH.brown, marginTop: "6px" }}>{other}: {oSc}/{battleQuestions.length}{oT ? ` · ⏱️ ${oT}` : ""}</div>
              </div>
            );
          })() : (
            <p style={{ margin: 0, fontSize: "19px", lineHeight: 1.5, color: TH.brown, maxWidth: "480px" }}>Fragen richtig. Sobald dein Gegner gespielt hat, rechnet die App den Sieger aus. Bei gleich vielen richtigen Antworten gewinnt, wer schneller war.</p>
          )}
          <button onClick={() => setBattleState("menu")} style={{ ...btnPrimary, marginTop: "6px" }}>Zurück zur Übersicht</button>
          {battleQuestions.length > 0 && (
            <details style={{ width: "100%", textAlign: "left", marginTop: "8px" }}>
              <summary style={{ cursor: "pointer", fontSize: "17px", fontWeight: 700, color: TH.muted, minHeight: "44px", display: "flex", alignItems: "center" }}>Fragen dieser Runde ansehen (Fehler melden)</summary>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                {battleQuestions.map((q: any, i: number) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: "14px", backgroundColor: TH.cream, fontSize: "16px", lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 700 }}>{q.question}</div>
                    <div style={{ color: TH.green, marginTop: "4px" }}>Richtig: <strong>{q.options[q.correct]}</strong></div>
                    <ReportLink report={{ game: "Quiz Battle", qid: typeof q.id === "number" ? q.id : undefined, product: q.product || (q.imageKey ? q.options[q.correct] : undefined), text: `${q.question}\nRichtig laut App: ${q.options[q.correct]}` }} />
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}