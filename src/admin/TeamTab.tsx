// ═══ Ausbilder-Bereich: Reiter Mitarbeiter ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { CSSProperties } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle } from '../ui/basis';
import { ROLE_INFO, StaffRole } from '../ui/lernstand';
import { streakOf } from './adminHelfer';
import { CloudPayload } from '../types';
import { getRankByPercentage, cleanStatNumber, getRightAnswerText } from '../hilfen/allgemein';
import { CATS } from '../daten/questions';
import type { Badge, OnboardingItem } from '../ui/lernstand';
import { LtIcon, ICON } from '../basis/symbole';
import { falschVon, falschImTeam } from '../hilfen/falscheAntworten';
import { urlaubHeute } from '../hilfen/urlaub';
import { FalschGewaehlt } from './FalschGewaehlt';
import { startStand } from '../hilfen/teamStart';
import type { ScoreEntry } from '../types';
import { parseBonDate } from '../basis/serie';

export type TeamTabProps = {
  cloudData: CloudPayload;
  allKnownUserKeys: string[];
  questions: any[];
  examQuestions: any[];
  allFlashcards: any[];
  getUserMasteryPercent: (uKey?: string | undefined) => number;
  mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void;
  learnInfo: (userKey: string) => { ob: { items: (OnboardingItem & { done: boolean; self?: boolean | undefined; })[]; done: number; total: number; }; badges: Badge[]; exam: any; };
  openUser: string | null;
  setOpenUser: Dispatch<SetStateAction<string | null>>;
  setTeamOpen: Dispatch<SetStateAction<boolean>>;
  teamOpen: boolean;
  teamCat: string;
  setTeamCat: Dispatch<SetStateAction<string>>;
  cloudProgress: Record<string, Record<string, any>>;
  cloudLastSeen: Record<string, { displayName: string; time: string; timestamp: number; }>;
  cloudScores: ScoreEntry[];
  adminResetUserWrongStats: (targetUserKey: string, dispName: string) => void;
  adminResetUserProgress: (targetUserKey: string, dispName: string) => void;
  adminResetUserPin: (targetUserKey: string, dispName: string) => void;
  adminDeleteUserCompletely: (targetUserKey: string, dispName: string) => void;
  adminDeleteScoreEntry: (entry: any, dispName: string) => void;
  adminDeleteAllUserPoints: (targetUserKey: string, dispName: string) => void;
  allQById: Map<number, any>;
  hiddenMap: Record<string, number>;
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  thisWeek: string[];
  weekInfo: (userKey: string) => { days: string[]; learnDays: string[]; weekPoints: number; streak: number; weakestCat: { cat: string; pct: number; }; thekeWeak: { rate: number; topic: string; ok: number; bad: number; }[]; };
  nameOf: (userKey: string) => any;
};

export function TeamTab({ cloudData, allKnownUserKeys, questions, examQuestions, allFlashcards, getUserMasteryPercent, mutateCloudData, learnInfo, openUser, setOpenUser, setTeamOpen, teamOpen, teamCat, setTeamCat, cloudProgress, cloudLastSeen, cloudScores, adminResetUserWrongStats, adminResetUserProgress, adminResetUserPin, adminDeleteUserCompletely, adminDeleteScoreEntry, adminDeleteAllUserPoints, allQById, hiddenMap, smallBtn, thisWeek, weekInfo, nameOf }: TeamTabProps) {
  return (
    allKnownUserKeys.length === 0 ? (
      <div style={cardStyle}><p style={{ margin: 0, fontSize: '18px', color: TH.muted }}>Noch keine Mitarbeiter angemeldet.</p></div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* ── Version 260: Start-Übersicht (wer ist angemeldet, wer hat schon losgelegt) ── */}
        {(() => {
          const zeilen = startStand(cloudProgress, cloudData.pins, allKnownUserKeys);
          const offen = zeilen.filter((z) => z.offen);
          const nameVon = (k: string) => cloudLastSeen[k]?.displayName || cloudProgress[k]?._displayName || k;
          const haken = (ok: boolean, text: string) => <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '14px', fontWeight: 700, backgroundColor: ok ? TH.tintSage : TH.tintPeach, color: ok ? TH.green : TH.red, whiteSpace: 'nowrap' }}>{ok ? '✓' : '✗'} {text}</span>;
          return (
            <details className="lt-start-uebersicht" style={{ ...cardStyle, padding: '16px 18px' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ flex: '0 0 44px', height: '44px', borderRadius: '50%', backgroundColor: TH.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.flag} size={22} /></span>
                <span style={{ flex: '1 1 200px' }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: '18px' }}>Start-Übersicht: {zeilen.length} angemeldet</span>
                  <span style={{ display: 'block', fontSize: '15px', color: TH.muted }}>{offen.length ? `${offen.length} noch nicht richtig losgelegt` : 'Alle haben schon losgelegt'} · Antippen für Details</span>
                </span>
              </summary>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '15px', color: TH.muted }}>Wer hier fehlt, hat sich noch nie angemeldet. Oben stehen alle, die noch keine Rolle gewählt oder noch nie gelernt haben.</div>
                {zeilen.map((z) => (
                  <div key={z.key} className="lt-start-zeile" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', padding: '8px 10px', borderRadius: '12px', backgroundColor: z.offen ? TH.tintPeach : 'transparent', borderBottom: `1px solid ${TH.line}` }}>
                    <span style={{ flex: '1 1 160px', fontSize: '16px' }}><strong>{nameVon(z.key)}</strong> <span style={{ color: TH.muted }}>{z.seit ? `seit ${z.seit.split('-').reverse().join('.')}` : ''}</span></span>
                    {haken(z.rolle, 'Rolle')}{haken(z.einfuehrung, 'Einführung')}{haken(z.pin, 'PIN')}{haken(z.handy, 'App auf dem Handy')}{haken(z.lerntage > 0, z.lerntage ? `${z.lerntage} ${z.lerntage === 1 ? 'Lerntag' : 'Lerntage'}` : 'noch nie gelernt')}
                  </div>
                ))}
                <div style={{ fontSize: '14px', color: TH.muted }}>„App auf dem Handy“ erscheint, sobald die Person die Lern-Theke einmal über das Symbol auf dem Startbildschirm geöffnet hat.</div>
              </div>
            </details>
          );
        })()}
        {/* ── Lange nicht da: seit über zwei Wochen nicht gelernt (gezielt ansprechen) ── */}
        {(() => {
          const grenze = new Date(); grenze.setDate(grenze.getDate() - 14);
          const gk = `${grenze.getFullYear()}-${String(grenze.getMonth() + 1).padStart(2, '0')}-${String(grenze.getDate()).padStart(2, '0')}`;
          const zuletzt = (k: string) => { const d: string[] = Array.isArray(cloudProgress[k]?._days) ? cloudProgress[k]._days : []; return d.length ? [...d].sort().slice(-1)[0] : ''; };
          // Version 251: wer gerade Urlaub eingetragen hat, steht nicht in der Liste, sondern darunter
          const imUrlaub = allKnownUserKeys.map((k) => ({ k, u: urlaubHeute(cloudProgress[k]) })).filter((x) => x.u);
          const weg = allKnownUserKeys.filter((k) => { const l = zuletzt(k); return (!l || l < gk) && !urlaubHeute(cloudProgress[k]); }).sort((a, b) => zuletzt(a).localeCompare(zuletzt(b)));
          const nameVon = (k: string) => cloudLastSeen[k]?.displayName || cloudProgress[k]?._displayName || k;
          return (
            <div style={{ ...cardStyle, padding: '16px 18px', backgroundColor: weg.length ? TH.tintPeach : TH.tintSage, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: 800, fontSize: '18px' }}>Lange nicht da {weg.length ? `(${weg.length})` : ''}</div>
              <div style={{ fontSize: '15px', color: TH.muted }}>Seit über zwei Wochen nicht gelernt. Vielleicht kurz ansprechen.</div>
              {weg.length === 0 ? <div style={{ fontSize: '16px', fontWeight: 700, color: TH.green }}>Alle waren in den letzten zwei Wochen da.</div> : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {weg.map((k) => <span key={k} style={{ padding: '4px 12px', borderRadius: '999px', backgroundColor: dc('#FFFFFF'), fontSize: '15px' }}><strong>{nameVon(k)}</strong> · {zuletzt(k) ? `zuletzt ${zuletzt(k).split('-').reverse().join('.')}` : 'noch nie'}</span>)}
                </div>
              )}
              {imUrlaub.length > 0 && <div className="lt-im-urlaub" style={{ fontSize: '15px', color: TH.muted }}>Im Urlaub: {imUrlaub.map((x) => `${nameVon(x.k)} (bis ${x.u!.bis.split('-').reverse().slice(0, 2).join('.')}.)`).join(', ')}</div>}
            </div>
          );
        })()}
        {/* ── Ganzes Team: offene Stolpersteine aller Mitarbeiter zusammen (Version 151) ── */}
        {(() => {
          const open: Record<number, { users: string[]; w: number }> = {};
          allKnownUserKeys.forEach(u => {
            const ws = (cloudProgress[u] || {}).wrongStats || {};
            Object.keys(ws).forEach(idStr => {
              const id = Number(idStr); const c = cleanStatNumber(ws[idStr]);
              if (isNaN(id) || c <= 0) return;
              const e = open[id] || (open[id] = { users: [], w: 0 });
              e.users.push(u); e.w += c;
            });
          });
          const cardById = new Map<number, any>();
          allFlashcards.forEach((q: any) => { if (q && q.id !== undefined) cardById.set(Number(q.id), q); });
          const catOf = (q: any): string => q.category || (q.examGroup === 'ZP' ? 'Zwischenprüfungen' : q.examGroup === 'AP' ? 'Abschlussprüfungen' : 'Sonstiges');
          const items = Object.keys(open).map(Number)
            .map(id => ({ id, q: cardById.get(id) || allQById.get(id), ...open[id] }))
            .filter(x => x.q && !hiddenMap[String(x.id)]);
          const people = new Set(items.flatMap(x => x.users)).size;
          const catCount: Record<string, number> = {};
          items.forEach(x => { const c = catOf(x.q); catCount[c] = (catCount[c] || 0) + 1; });
          const cats = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a]);
          const cat = cats.includes(teamCat) ? teamCat : '';
          const shown = items.filter(x => !cat || catOf(x.q) === cat).sort((a, b) => b.users.length - a.users.length || b.w - a.w);
          const shared = items.filter(x => x.users.length > 1).length;
          const copyTeam = async () => {
            const lines = [`Offene Fehler im Team${cat ? ` (${cat})` : ''}: ${shown.length} Fragen`, ''];
            shown.slice(0, 20).forEach((x, i) => { const f = falschImTeam(cloudProgress, x.users, x.id); lines.push(`${i + 1}. ${x.q.question}\n   Richtig: ${getRightAnswerText(x.q)}${f.length ? `\n   Falsch gewählt: ${f.map((e) => `${e.text} (${e.n}×)`).join('; ')}` : ''}\n   Offen bei: ${x.users.map(nameOf).join(', ')}`); });
            const txt = lines.join('\n');
            try { await navigator.clipboard.writeText(txt); alert('Liste kopiert, z. B. für die Teambesprechung oder WhatsApp.'); } catch { window.prompt('Liste zum Kopieren:', txt); }
          };
          return (
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', border: `2px solid ${TH.yellow}` }}>
              <button onClick={() => setTeamOpen(!teamOpen)} aria-expanded={teamOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', padding: '16px 20px', border: 'none', background: 'transparent', color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ flex: '0 0 52px', height: '52px', borderRadius: '50%', backgroundColor: TH.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LtIcon paths={ICON.users} size={24} /></span>
                <span style={{ flex: '1 1 200px' }}>
                  <span style={{ display: 'block', fontSize: '20px', fontWeight: 700 }}>Ganzes Team</span>
                  <span style={{ display: 'block', fontSize: '16px', color: TH.muted }}>{items.length === 0 ? 'Keine offenen Fehler, top!' : `${items.length} offene ${items.length === 1 ? 'Frage' : 'Fragen'} bei ${people} ${people === 1 ? 'Person' : 'Personen'} · ${shared} bei mehreren`}</span>
                </span>
                <span style={{ fontSize: '16px', color: TH.muted, whiteSpace: 'nowrap' }}>{teamOpen ? 'Schließen ▲' : 'Details ▼'}</span>
              </button>
              {teamOpen && (
                <div style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: `2px solid ${TH.line}` }}>
                  <span style={{ marginTop: '12px', fontSize: '15px', color: TH.muted }}>Fragen, die gerade im Fehler-Stapel der Mitarbeiter liegen. Oben stehen die, die bei den meisten Leuten offen sind, da lohnt sich eine kurze Erklärung für alle.</span>
                  {items.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {['', ...cats].map(c => (
                        <button key={c || 'alle'} type="button" onClick={() => setTeamCat(c)} style={{ minHeight: '42px', padding: '0 14px', borderRadius: '999px', border: cat === c ? 'none' : `2px solid ${TH.line}`, backgroundColor: cat === c ? TH.brown : TH.white, color: cat === c ? dc('#FFF6E0') : TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>{c ? `${c} (${catCount[c]})` : `Alle (${items.length})`}</button>
                      ))}
                      <button type="button" onClick={copyTeam} style={{ ...smallBtn(), marginLeft: 'auto' }}>Liste kopieren</button>
                    </div>
                  )}
                  {shown.length === 0 ? <div style={{ fontSize: '16px', color: TH.green, fontWeight: 700 }}>Keine offenen Fehler, top!</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                      {shown.map(x => (
                        <div key={x.id} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: x.users.length > 1 ? TH.tintPeach : TH.cream, fontSize: '16px', lineHeight: 1.4, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                            <strong style={{ flex: '1 1 240px' }}>{x.q.question}</strong>
                            <span style={{ fontWeight: 700, whiteSpace: 'nowrap', color: x.users.length > 1 ? TH.red : TH.ink }}>{x.users.length} {x.users.length === 1 ? 'Person' : 'Personen'} · {x.w}× falsch</span>
                          </div>
                          <div style={{ fontSize: '14px', color: TH.muted }}>{catOf(x.q)}{x.q.product ? ` · ${x.q.product}` : ''}</div>
                          <div style={{ color: TH.green }}>Richtig: <strong>{getRightAnswerText(x.q)}</strong></div>
                          <FalschGewaehlt liste={falschImTeam(cloudProgress, x.users, x.id)} nameOf={nameOf} />
                          <div style={{ fontSize: '15px' }}>Offen bei: {x.users.map(nameOf).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
        {allKnownUserKeys.map(userKey => {
          const seenInfo = cloudLastSeen[userKey];
          const userProgObj = cloudProgress[userKey] || {};
          const matchingScores = cloudScores.filter(s => s.username?.toLowerCase() === userKey);
          const totalUserPoints = matchingScores.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
          const displayName = seenInfo?.displayName || userProgObj._displayName || matchingScores[0]?.username || userKey;
          const lastSeenTime = seenInfo?.time || matchingScores[0]?.date || 'noch nie';
          const isOnline = seenInfo?.timestamp ? (Date.now() - seenInfo.timestamp < 120000) : false;
          const masteryPct = getUserMasteryPercent(userKey);
          const uRank = getRankByPercentage(masteryPct);
          const isOpen = openUser === userKey;
    
          const rawUserWrong = userProgObj.wrongStats || {};
          const cleanUserWrongMap: Record<number, number> = {};
          Object.keys(rawUserWrong).forEach(qIdStr => {
            const qId = Number(qIdStr);
            const c = cleanStatNumber(rawUserWrong[qIdStr]);
            if (!isNaN(qId) && c > 0) cleanUserWrongMap[qId] = c;
          });
          const sortedUserWrongIds = Object.keys(cleanUserWrongMap).map(Number).sort((a, b) => cleanUserWrongMap[b] - cleanUserWrongMap[a]);
    
          const zpTotal = examQuestions.filter((q) => q.examGroup === 'ZP').length;
          const apTotal = examQuestions.filter((q) => q.examGroup === 'AP').length;
          const doneOf = (keys: string[]) => new Set(keys.flatMap(k => Array.isArray(userProgObj[k]) ? userProgObj[k] : [])).size;
          const bars = [
            ...CATS.map(catName => ({ label: catName, done: doneOf([catName + '_easy', catName + '_hard']), total: questions.filter(q => q.category === catName).length })),
            { label: 'Zwischenprüfungen', done: doneOf(['Zwischenprüfungen_easy', 'Zwischenprüfungen_hard']), total: zpTotal },
            { label: 'Abschlussprüfungen', done: doneOf(['Abschlussprüfungen_easy', 'Abschlussprüfungen_hard']), total: apTotal },
          ];
          // Version 293: neueste Einträge zuerst (vorher nach Punkten, wirkte durcheinander). Ohne Datum: Zeit aus der Kennung, sonst ganz unten
          const zeitVon = (sc: ScoreEntry) => { const d = parseBonDate(sc.date); if (d) { const u = String(sc.date || '').match(/(\d{1,2}):(\d{2})/); return d.getTime() + (u ? (Number(u[1]) * 60 + Number(u[2])) * 60000 : 0); } const m = String(sc.id || '').match(/(\d{12,})/); return m ? Number(m[1]) : -Infinity; };
          const sortedScores = [...matchingScores].sort((a, b) => zeitVon(b) - zeitVon(a));
    
          return (
            <div key={userKey} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <button onClick={() => setOpenUser(isOpen ? null : userKey)} aria-expanded={isOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', padding: '16px 20px', border: 'none', background: 'transparent', color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ position: 'relative', flex: '0 0 52px', height: '52px', borderRadius: '50%', backgroundColor: TH.tintYellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TH.serif, fontSize: '24px' }}>
                  {String(displayName).charAt(0).toUpperCase()}
                  <span title={isOnline ? 'online' : 'offline'} style={{ position: 'absolute', right: '0px', bottom: '2px', width: '14px', height: '14px', borderRadius: '50%', border: `3px solid ${dc('#FFFFFF')}`, backgroundColor: isOnline ? TH.green : dc('#C9BBA6') }} />
                </span>
                <span style={{ flex: '1 1 200px' }}>
                  <span style={{ display: 'block', fontSize: '20px', fontWeight: 700 }}>{displayName}</span>
                  <span style={{ display: 'block', fontSize: '16px', color: TH.muted }}>{uRank.title} · {masteryPct} % · Serie {streakOf(Array.isArray(userProgObj._days) ? userProgObj._days : [])} · aktiv {lastSeenTime}</span>
                  {(() => { const li = learnInfo(userKey); return <span style={{ display: 'block', fontSize: '15px', color: TH.muted, marginTop: '2px' }}>Einarbeitung {li.ob.done}/{li.ob.total} · {li.badges.filter(b => b.ok).length} Abzeichen</span>; })()}
                </span>
                <span style={{ padding: '8px 14px', borderRadius: '12px', backgroundColor: TH.tintYellow, fontWeight: 700, fontSize: '17px', whiteSpace: 'nowrap' }}>{totalUserPoints.toLocaleString('de-DE')} Pkt.</span>
                <span style={{ fontSize: '16px', color: TH.muted, whiteSpace: 'nowrap' }}>{isOpen ? 'Schließen ▲' : 'Details ▼'}</span>
              </button>
    
              {isOpen && (
                <div style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `2px solid ${TH.line}` }}>
                  {(() => {
                    const w = weekInfo(userKey);
                    return (
                      <div style={{ marginTop: '14px', padding: '16px', borderRadius: '16px', backgroundColor: TH.tintBlue, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <strong style={{ fontSize: '18px' }}>Diese Woche</strong>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((l, i) => {
                            const done = w.days.includes(thisWeek[i]);
                            return (
                              <span key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: done ? TH.yellow : TH.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{done ? '✓' : ''}</span>
                                <span style={{ fontSize: '13px', color: TH.muted }}>{l}</span>
                              </span>
                            );
                          })}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                          {[
                            { l: 'Lerntage', v: `${w.learnDays.length} von 7` },
                            { l: 'Punkte diese Woche', v: w.weekPoints.toLocaleString('de-DE') },
                            { l: 'Lern-Serie', v: `${w.streak} ${w.streak === 1 ? 'Tag' : 'Tage'}` },
                            { l: 'Schwächster Bereich', v: w.weakestCat ? `${w.weakestCat.cat} (${w.weakestCat.pct} %)` : 'keiner' },
                          ].map(x => (
                            <div key={x.l} style={{ padding: '10px 12px', borderRadius: '12px', backgroundColor: TH.white }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{x.l}</div>
                              <div style={{ fontSize: '17px', fontWeight: 700 }}>{x.v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '16px' }}>
                          <strong>Theken-Simulator üben: </strong>
                          {w.thekeWeak.length ? w.thekeWeak.map(t => `${t.topic} (${t.ok} von ${t.ok + t.bad} richtig)`).join(' · ') : 'noch zu wenige Beratungen'}
                        </div>
                      </div>
                    );
                  })()}
                  {(() => {
                    const li = learnInfo(userKey);
                    const ex = li.exam || {};
                    return (
                      <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.cream, border: `2px solid ${TH.line}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(() => {
                          const role: StaffRole | undefined = (cloudProgress[userKey] || {})._role;
                          const setRole = (r: StaffRole) => mutateCloudData((curr) => { if (!curr.progress[userKey]) curr.progress[userKey] = { _displayName: nameOf(userKey) }; curr.progress[userKey]._role = r; return curr; });
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '18px' }}>Ist:</strong>
                              {(['neu', 'erfahren', 'azubi'] as StaffRole[]).map(r => (
                                <button key={r} type="button" onClick={() => setRole(r)} style={{ minHeight: '42px', padding: '0 12px', borderRadius: '999px', border: role === r ? 'none' : `2px solid ${TH.line}`, backgroundColor: role === r ? TH.brown : TH.white, color: role === r ? dc('#FFF6E0') : TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>{ROLE_INFO[r].icon} {ROLE_INFO[r].title}</button>
                              ))}
                              {!role && <span style={{ fontSize: '15px', color: TH.muted }}>noch nicht gewählt</span>}
                            </div>
                          );
                        })()}
                        <strong style={{ fontSize: '18px' }}>Einarbeitung „Meine erste Woche“, {li.ob.done} von {li.ob.total}{(cloudProgress[userKey] || {})._ersteWocheFertig ? ' · abgeschlossen ✓' : ''}</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '6px' }}>
                          {li.ob.items.map(it => (
                            <span key={it.id} style={{ fontSize: '16px', color: it.done ? TH.green : TH.muted, fontWeight: it.done ? 700 : 400 }}>{it.done ? '✓' : '○'} {it.title}</span>
                          ))}
                        </div>
                        <strong style={{ fontSize: '18px', marginTop: '4px' }}>Abzeichen</strong>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {li.badges.filter(b => b.ok).length === 0 ? <span style={{ fontSize: '16px', color: TH.muted }}>noch keine</span> : li.badges.filter(b => b.ok).map(b => (
                            <span key={b.id} title={b.desc} style={{ padding: '6px 12px', borderRadius: '999px', backgroundColor: TH.white, border: `2px solid ${TH.yellow}`, fontSize: '15px', fontWeight: 700 }}>{b.icon} {b.title}</span>
                          ))}
                        </div>
                        {(ex.ZP || ex.AP) && (
                          <div style={{ fontSize: '16px' }}><strong>Prüfungssimulation: </strong>
                            {ex.ZP ? `Zwischenprüfung bester Wert ${ex.ZP.best} % (zuletzt ${ex.ZP.last} %)` : ''}{ex.ZP && ex.AP ? ' · ' : ''}{ex.AP ? `Abschlussprüfung bester Wert ${ex.AP.best} % (zuletzt ${ex.AP.last} %)` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {bars.map(b => {
                      const p = b.total ? Math.min(100, Math.round((b.done / b.total) * 100)) : 0;
                      return (
                        <div key={b.label} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '16px' }}><span>{b.label}</span><strong>{p} %</strong></div>
                          <div style={{ height: '8px', borderRadius: '999px', backgroundColor: dc('#F4EADB'), overflow: 'hidden', marginTop: '6px' }}><div style={{ width: p + '%', height: '100%', backgroundColor: TH.brown }} /></div>
                          <div style={{ fontSize: '14px', color: TH.muted, marginTop: '4px' }}>{b.done} von {b.total}</div>
                        </div>
                      );
                    })}
                  </div>
    
                  {/* Punkte */}
                  <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.tintYellow }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '18px' }}>Punkte ({sortedScores.length} Einträge · {totalUserPoints.toLocaleString('de-DE')} Pkt.)</strong>
                      {sortedScores.length > 0 && <button onClick={() => adminDeleteAllUserPoints(userKey, displayName)} style={smallBtn('danger')}>Alle Punkte löschen</button>}
                    </div>
                    {sortedScores.length === 0 ? (
                      <div style={{ fontSize: '16px', color: TH.muted }}>Noch keine Punkte.</div>
                    ) : (
                      <div className="lt-punkte-liste" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                        {sortedScores.map((sc, i) => (
                          <div key={(sc.id || '') + i} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '8px 12px', borderRadius: '12px', backgroundColor: TH.white }}>
                            <span style={{ flex: '1 1 180px', fontSize: '16px' }}>
                              <strong>{sc.category || 'Punkte'}</strong>
                              <span style={{ display: 'block', fontSize: '14px', color: TH.muted }}>{sc.n ? `${(sc.date || '').replace(/^01\./, '').replace(/\.(\d\d)$/, '.20$1')} · ${sc.n} Runden zusammengefasst` : (sc.date || 'ohne Datum')}</span>
                            </span>
                            <strong style={{ fontSize: '17px', color: Number(sc.score) < 0 ? TH.red : TH.ink, whiteSpace: 'nowrap' }}>{Number(sc.score).toLocaleString('de-DE')} Pkt.</strong>
                            <button onClick={() => adminDeleteScoreEntry(sc, displayName)} aria-label="Eintrag löschen" style={{ ...smallBtn('danger'), minHeight: '42px', padding: '0 12px' }}>Löschen</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
    
                  {/* Stolpersteine */}
                  <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.tintPeach }}>
                    <strong style={{ display: 'block', fontSize: '18px', marginBottom: '8px' }}>Offene Stolpersteine ({sortedUserWrongIds.length})</strong>
                    {sortedUserWrongIds.length === 0 ? (
                      <div style={{ fontSize: '16px', color: TH.muted }}>Keine offenen Fehler, top!</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                        {sortedUserWrongIds.map(qId => {
                          const foundQ = allFlashcards.find((q: any) => q.id === qId);
                          if (!foundQ) return null;
                          return (
                            <div key={qId} style={{ padding: '8px 12px', borderRadius: '12px', backgroundColor: TH.white, fontSize: '16px', lineHeight: 1.4 }}>
                              <div><strong>{cleanUserWrongMap[qId]}× falsch:</strong> {foundQ.question}</div>
                              <div style={{ color: TH.green, marginTop: '2px' }}>Richtig: <strong>{getRightAnswerText(foundQ)}</strong></div>
                              <FalschGewaehlt liste={falschVon(userProgObj, qId).map((e) => ({ ...e, wer: [] }))} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
    
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button onClick={() => adminResetUserWrongStats(userKey, displayName)} style={smallBtn('warn')}>Fehler-Stapel leeren</button>
                    <button onClick={() => adminResetUserProgress(userKey, displayName)} style={smallBtn('warn')}>Lernfortschritt auf 0 %</button>
                    {(cloudData.pins || {})[userKey]?.h && <button onClick={() => adminResetUserPin(userKey, displayName)} style={smallBtn('warn')}>PIN zurücksetzen</button>}
                    <button onClick={() => adminDeleteUserCompletely(userKey, displayName)} style={{ ...smallBtn('danger'), backgroundColor: TH.red, color: dc('#FFFFFF') }}>Mitarbeiter komplett löschen</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )
  );
}
