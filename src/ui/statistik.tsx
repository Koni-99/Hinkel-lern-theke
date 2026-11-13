// ═══ Statistik-Ansicht ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { ReactNode } from 'react';
import { SORTIMENT_SUBFILTERS } from '../daten/data';
import { TH, cardStyle } from './basis';
import { scoreDay } from './kalender';

// ───────────────────────── Meine Statistik ─────────────────────────
export type StatQ = { id: number; category: string; subgroup?: string };

export const pctColor = (p: number) => (p >= 80 ? '#2F7D4A' : p >= 60 ? '#8DB33A' : p >= 40 ? '#E9A23B' : '#D9572B');

export function Ring({ pct, size = 150, stroke = 16, color, children }: { pct: number; size?: number; stroke?: number; color: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: `0 0 ${size}px` }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TH.line} strokeWidth={stroke} />
        <circle className="lt-ring-arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, pct)) / 100)} style={{ ['--lt-c' as any]: c }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
}

export function StatistikView({ name, avatar, avatarClass, levelTitle, levelIcon, levelPct, nextInfo, points, prog, questions, scores, badgesEarned, badgesTotal, streakNow, streakBest, onPractice, onBack }: {
  name: string; avatar?: string; avatarClass?: string; levelTitle: string; levelIcon: string; levelPct: number; nextInfo: string; points: number;
  prog: any; questions: StatQ[]; scores: { score: number; date: string; category?: string }[]; badgesEarned: number; badgesTotal: number; streakNow: number; streakBest: number;
  onPractice: (cat: string) => void; onBack: () => void;
}) {
  const qs: Record<string, number[]> = (prog && prog._qs) || {};
  const byId = new Map(questions.map(q => [String(q.id), q]));
  let right = 0, wrong = 0;
  const cat: Record<string, { r: number; w: number; seen: number; total: number; mastered: number }> = {};
  const sub: Record<string, { r: number; w: number }> = {};
  questions.forEach(q => { (cat[q.category] = cat[q.category] || { r: 0, w: 0, seen: 0, total: 0, mastered: 0 }).total++; });
  // Gemeistert wie auf der Lernen-Seite (richtig beantwortete Fragen pro Bereich)
  const masteredIds = new Set<string>();
  Object.keys(cat).forEach(c => { [...(Array.isArray(prog?.[`${c}_easy`]) ? prog[`${c}_easy`] : []), ...(Array.isArray(prog?.[`${c}_hard`]) ? prog[`${c}_hard`] : [])].forEach((id: any) => masteredIds.add(String(id))); });
  questions.forEach(q => { if (masteredIds.has(String(q.id))) cat[q.category].mastered++; });
  Object.keys(qs).forEach(id => {
    const v = qs[id]; const q = byId.get(id); if (!Array.isArray(v) || !q) return;
    const r = Number(v[0]) || 0, w = Number(v[1]) || 0; right += r; wrong += w;
    const c = cat[q.category]; if (c) { c.r += r; c.w += w; if (!masteredIds.has(id)) c.seen++; }
    if (q.subgroup) { const sg = (sub[q.subgroup] = sub[q.subgroup] || { r: 0, w: 0 }); sg.r += r; sg.w += w; }
  });
  const quote = right + wrong > 0 ? Math.round((right / (right + wrong)) * 100) : 0;
  const cats = Object.entries(cat).filter(([c]) => c !== 'Prüfung').map(([c, v]) => ({ c, pct: v.total ? Math.round((v.mastered / v.total) * 100) : 0, hit: v.r + v.w > 0 ? Math.round((v.r / (v.r + v.w)) * 100) : null, mastered: v.mastered, seen: v.seen + v.mastered, total: v.total, n: v.r + v.w }));
  const subLabel = (id: string) => (SORTIMENT_SUBFILTERS.find(f => f.id === id)?.label || id).replace(/^\S+\s/, '');
  const subs = Object.entries(sub).filter(([, v]) => v.r + v.w >= 3).map(([c, v]) => ({ c: subLabel(c), pct: Math.round((v.r / (v.r + v.w)) * 100), n: v.r + v.w })).sort((a, b) => b.pct - a.pct);
  const strong = subs.slice(0, 3), weak = subs.length > 3 ? subs.slice(-3).reverse() : [];
  // letzte 14 Tage
  const days: { k: string; label: string; pts: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; days.push({ k, label: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()], pts: 0 }); }
  const dayIdx = new Map(days.map((d, i) => [d.k, i]));
  const perCat: Record<string, number> = {};
  scores.forEach(s => { const k = scoreDay(s.date); const i = dayIdx.get(k); if (i !== undefined) days[i].pts += Number(s.score) || 0; const c = String(s.category || 'Quiz').replace(/:.*$/, ''); perCat[c] = (perCat[c] || 0) + (Number(s.score) || 0); });
  const learned = new Set(Array.isArray(prog?._days) ? prog._days : []);
  const maxPts = Math.max(1, ...days.map(d => d.pts));
  const topGames = Object.entries(perCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = Math.max(1, ...topGames.map(g => g[1]));
  const GOLD_IC: Record<string, string[]> = {
    ok: ['M20 6 9 17l-5-5'],
    target: ['M12 22a10 10 0 1 0 0-20a10 10 0 0 0 0 20z', 'M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12z', 'M12 14a2 2 0 1 0 0-4a2 2 0 0 0 0 4z'],
    flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
    medal: ['M12 15a6 6 0 1 0 0-12a6 6 0 0 0 0 12z', 'M8.2 13.9 7 22l5-3 5 3-1.2-8.1'],
  };
  const tile = (icon: string, value: string, label: string, _bg: string, i: number) => (
    <div className="lt-tile" style={{ animationDelay: `${i * 0.06}s`, padding: '16px', borderRadius: '20px', backgroundColor: TH.white, boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{(GOLD_IC[icon] || GOLD_IC.ok).map((d, k) => <path key={k} d={d} />)}</svg>
      </span>
      <span style={{ fontFamily: TH.serif, fontSize: '32px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: '14px', color: TH.muted }}>{label}</span>
    </div>
  );
  const h2 = (t: string) => <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '28px' }}>{t}</h2>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 16px 0 10px', borderRadius: '999px', border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 8px 18px -12px rgba(31,20,12,.4)', color: TH.brown, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Zurück</button>
      {/* Kopf */}
      <section className="lt-stat-hero" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '22px', padding: '26px', borderRadius: '28px', backgroundColor: '#4B2A14', backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1.4px), radial-gradient(ellipse 80% 60% at 100% 0, rgba(255,199,44,.2), rgba(255,199,44,0) 60%)', backgroundSize: '6px 6px, auto', color: '#FFF6E0', boxShadow: '0 18px 32px -16px rgba(75,42,20,.7)' }}>
        <Ring pct={levelPct} color={TH.yellow} size={150}>
          <span className={avatarClass} style={{ fontSize: '48px', lineHeight: 1 }}>{avatar || levelIcon}</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#F0D9AE', maxWidth: '96px', lineHeight: 1.2, marginTop: '2px' }}>{levelPct} % zur nächsten Stufe</span>
        </Ring>
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: TH.yellow }}>Meine Statistik</span>
          <span style={{ fontFamily: TH.serif, fontSize: '40px', lineHeight: 1.05 }}>{name}</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>{levelIcon} {levelTitle} · {points.toLocaleString('de-DE')} Punkte</span>
          <span style={{ fontSize: '15px', color: '#F0D9AE' }}>{nextInfo}</span>
        </div>
      </section>
      {/* Kacheln */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        {tile('ok', right.toLocaleString('de-DE'), 'richtige Antworten', TH.tintSage, 0)}
        {tile('target', `${quote} %`, 'Trefferquote', TH.tintBlue, 1)}
        {tile('flame', String(streakNow), `${streakNow === 1 ? 'Tag' : 'Tage'} Serie (Rekord ${streakBest})`, TH.tintPeach, 2)}
        {tile('medal', `${badgesEarned}/${badgesTotal}`, 'Abzeichen', '#FFF0C2', 3)}
      </div>
      {/* Bereiche */}
      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {h2('Deine Lernbereiche')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
          {cats.map((c, i) => (
            <button key={c.c} onClick={() => onPractice(c.c)} className="lt-card lt-tile" style={{ animationDelay: `${i * 0.08}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 10px', borderRadius: '20px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, cursor: 'pointer', color: TH.ink }}>
              <Ring pct={c.pct} size={120} stroke={13} color={pctColor(c.pct)}>
                <span style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1 }}>{`${c.pct}%`}</span>
                <span style={{ fontSize: '11px', color: TH.muted, fontWeight: 700 }}>gemeistert</span>
              </Ring>
              <span style={{ fontWeight: 800, fontSize: '16px', textAlign: 'center' }}>{c.c}</span>
              <span style={{ fontSize: '13px', color: TH.muted }}>{c.mastered} von {c.total} gemeistert{c.hit !== null ? ` · ${c.hit} % Treffer` : ''}</span>
            </button>
          ))}
        </div>
        <span style={{ fontSize: '14px', color: TH.muted }}>Tipp: Antippen startet ein Quiz in diesem Bereich.</span>
      </section>
      {/* Stärken / Üben */}
      {(strong.length > 0 || weak.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[{ t: 'Da bist du stark', list: strong, bg: TH.tintSage }, { t: 'Hier lohnt sich Üben', list: weak, bg: TH.tintPeach }].filter(b => b.list.length).map(b => (
            <section key={b.t} style={{ padding: '20px', borderRadius: '24px', backgroundColor: b.bg, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '19px' }}>{b.t}</div>
              {b.list.map((x, i) => (
                <div key={x.c} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}><span>{x.c}</span><span>{x.pct} %</span></div>
                  <div style={{ height: '12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,.7)', overflow: 'hidden' }}>
                    <div className="lt-bar-grow" style={{ animationDelay: `${0.2 + i * 0.1}s`, width: `${Math.max(4, x.pct)}%`, height: '100%', borderRadius: '999px', backgroundColor: pctColor(x.pct) }} />
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
      {/* 14 Tage */}
      <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {h2('Deine letzten 14 Tage')}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '170px', padding: '0 2px' }}>
          {days.map((d, i) => {
            const h = d.pts > 0 ? Math.max(8, Math.round((d.pts / maxPts) * 130)) : 4;
            const isToday = i === days.length - 1;
            return (
              <div key={d.k} title={`${d.pts} Punkte`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                {d.pts > 0 && <span style={{ fontSize: '11px', fontWeight: 700, color: TH.muted }}>{d.pts}</span>}
                <div className="lt-col-grow" style={{ animationDelay: `${i * 0.04}s`, width: '100%', maxWidth: '34px', height: `${h}px`, borderRadius: '8px 8px 4px 4px', backgroundColor: d.pts > 0 ? (isToday ? '#1F140C' : TH.yellow) : TH.line, boxShadow: d.pts > 0 && !isToday ? 'inset 0 -3px 0 rgba(185,138,10,.35)' : 'none' }} />
                <span style={{ fontSize: '12px', fontWeight: isToday ? 800 : 500, color: isToday ? TH.ink : TH.muted }}>{d.label}</span>
                <span aria-hidden="true" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: learned.has(d.k) ? TH.green : 'transparent' }} />
              </div>
            );
          })}
        </div>
        <span style={{ fontSize: '14px', color: TH.muted }}>Balken: Punkte pro Tag · grüner Punkt: an dem Tag gelernt</span>
      </section>
      {/* Lieblingsspiele */}
      {topGames.length > 0 && (
        <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {h2('Hier holst du deine Punkte')}
          {topGames.map(([g, v], i) => (
            <div key={g} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 38%) 1fr auto', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g}</span>
              <div style={{ height: '16px', borderRadius: '999px', backgroundColor: TH.line, overflow: 'hidden' }}>
                <div className="lt-bar-grow" style={{ animationDelay: `${0.1 + i * 0.08}s`, width: `${Math.max(4, Math.round((v / topMax) * 100))}%`, height: '100%', borderRadius: '999px', backgroundColor: TH.yellow }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800 }}>{v.toLocaleString('de-DE')}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
