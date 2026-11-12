// ═══ Lernstand: Einarbeitung, App-Woche, Rollen, Abzeichen, IHK-Note ═══
// Vorher in components/minigameUtils.tsx. Inhalt unverändert übernommen.
import { osterZeit } from './kalender';

// ───────────────────────── Lernstand: Einarbeitung & Abzeichen ─────────────────────────

/** Zusätzliche Zähler pro Mitarbeiter (in der Cloud unter progress[user]._stats) */
export type LearnStats = { bilderBest?: number; bilderRight?: number; allergenBest?: number; fehlerDone?: number; examBest?: number; priceBest?: number; sliceBest?: number; ansturmBest?: number };

/** Alle IDs, die jemand schon einmal richtig beantwortet hat */
export function correctIdSet(prog: any): Set<number> {
  const s = new Set<number>();
  Object.keys(prog || {}).forEach(k => {
    if (/_(easy|hard)$/.test(k) && Array.isArray(prog[k])) prog[k].forEach((id: any) => { const n = Number(id); if (!isNaN(n)) s.add(n); });
  });
  return s;
}

/** Längste Lern-Serie (Tage am Stück) aus den gespeicherten Lerntagen */
export function bestStreakOf(days: string[]): number {
  const sorted = Array.from(new Set((days || []).filter(Boolean))).sort();
  let best = 0, run = 0, prev: number | null = null;
  sorted.forEach(d => {
    const t = new Date(d + 'T12:00:00').getTime();
    const gap = prev !== null ? Math.round((t - prev) / 86400000) : 0;
    const sundayBetween = gap === 2 && prev !== null && new Date(prev + 86400000).getDay() === 0;
    run = prev !== null && (gap === 1 || sundayBetween) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  });
  return best;
}

export function thekeTotals(prog: any): { ok: number; bad: number } {
  const st = (prog && prog._theke) || {};
  return Object.keys(st).reduce((a, k) => ({ ok: a.ok + (Number(st[k]?.ok) || 0), bad: a.bad + (Number(st[k]?.bad) || 0) }), { ok: 0, bad: 0 });
}

export type OnboardingItem = { id: string; title: string; desc: string; manual?: boolean; go?: 'fach' | 'bilder' | 'theke' | 'allergene' | 'lernen' | 'steckbriefe' | 'bestenliste' | 'daily' | 'spielen' };

export const ONBOARDING_ITEMS: OnboardingItem[] = [
  { id: 'gesund', title: 'Gesundheitszeugnis abgegeben', desc: 'Bei der Filialleitung vorgelegt, Kosten nur mit Quittung erstattet.', manual: true },
  { id: 'hygiene', title: 'Hygienebelehrung gemacht', desc: 'Erstbelehrung (auch online möglich) und Unterweisung im Betrieb.', manual: true },
  { id: 'regeln', title: 'Regeln für Mitarbeiter gelesen', desc: 'Krankmeldung, Urlaub, Kleidung, Haare & Nägel, steht im Spickzettel Fachwissen.', manual: true, go: 'fach' },
  { id: 'schnitt', title: 'Schnittgrößen sitzen', desc: 'Alle drei Fragen zu den Schnittgrößen (5,5 / 9 / 12 mm) richtig beantwortet.', go: 'lernen' },
  { id: 'geschmack', title: 'Geschmackstabelle kennen', desc: 'Mindestens 5 Fragen zu den Geschmacksvokabeln richtig beantwortet.', go: 'lernen' },
  { id: 'bilder', title: '20 Produkte am Foto erkannt', desc: 'Im Spiel „Welches Brot ist das?“ insgesamt 20 richtige Antworten.', go: 'bilder' },
  { id: 'theke', title: 'Erste Verkaufsgespräche geführt', desc: 'Mindestens 5 Antworten im Theken-Simulator gegeben.', go: 'theke' },
  { id: 'allergene', title: 'Allergene geübt', desc: 'Im Allergene-Training einmal mindestens 7 von 10 geschafft.', go: 'allergene' },
  { id: 'fragen', title: '50 Fragen gemeistert', desc: 'Egal in welchem Bereich, 50 verschiedene Fragen richtig.', go: 'lernen' },
  { id: 'serie', title: '3 Tage am Stück gelernt', desc: 'Drei Tage hintereinander mindestens eine Runde.' },
];

/** „Meine erste Woche“ in 5 Tagen, jeder Tag mit einem Thema */
export const ONBOARDING_DAYS: { no: number; icon: string; title: string; text: string; ids: string[] }[] = [
  { no: 1, icon: '👋', title: 'Ankommen', text: 'Die wichtigsten Formalitäten und unsere Regeln im Team.', ids: ['gesund', 'hygiene', 'regeln'] },
  { no: 2, icon: '🍞', title: 'Unsere Brote', text: 'Schnittstärken und die Brote auf einen Blick erkennen.', ids: ['schnitt', 'bilder'] },
  { no: 3, icon: '💬', title: 'Beraten', text: 'Wie schmeckt was, und wie läuft ein Verkaufsgespräch?', ids: ['geschmack', 'theke'] },
  { no: 4, icon: '🛡️', title: 'Allergien', text: 'Sicher beraten, wenn ein Kunde eine Allergie hat.', ids: ['allergene'] },
  { no: 5, icon: '🏁', title: 'Fit für die Theke', text: 'Dranbleiben, dann gibt es den Theken-Führerschein.', ids: ['fragen', 'serie'] },
];

/** „Meine erste Woche mit der App“ – für alle, die schon bei Hinkel sind: die App in Ruhe kennenlernen */
export const APP_WEEK_ITEMS: OnboardingItem[] = [
  { id: 'quiz', title: '10 Quizfragen richtig', desc: 'Im Bereich „Lernen“ ein paar Runden gespielt.', go: 'lernen' },
  { id: 'daily', title: 'Tages-Challenge gemacht', desc: 'Einmal die 5 Fragen des Tages beantwortet.', go: 'daily' },
  { id: 'steckbrief', title: 'Steckbriefe angeschaut', desc: 'Unter „Nachschlagen“ ein paar Produkte geöffnet.', manual: true, go: 'steckbriefe' },
  { id: 'bestenliste', title: 'Bestenliste angeschaut', desc: 'Wer liegt vorne, und welche Abzeichen gibt es?', manual: true, go: 'bestenliste' },
  { id: 'bilder', title: '10 Produkte am Foto erkannt', desc: 'Im Bilderquiz insgesamt 10 richtige Antworten.', go: 'bilder' },
  { id: 'theke', title: 'Theken-Simulator ausprobiert', desc: 'Mindestens 5 Antworten im Verkaufsgespräch gegeben.', go: 'theke' },
  { id: 'allergene', title: 'Allergene-Training gespielt', desc: 'Einmal eine Runde im Allergene-Training.', go: 'allergene' },
  { id: 'fragen', title: '50 Fragen gemeistert', desc: 'Egal in welchem Bereich, 50 verschiedene Fragen richtig.', go: 'lernen' },
  { id: 'serie', title: '3 Tage am Stück dabei', desc: 'Drei Tage hintereinander mindestens eine Runde.' },
];

export const APP_WEEK_DAYS: { no: number; icon: string; title: string; text: string; ids: string[] }[] = [
  { no: 1, icon: '📚', title: 'Lernen', text: 'So funktionieren Quiz und Tages-Challenge.', ids: ['quiz', 'daily'] },
  { no: 2, icon: '🔎', title: 'Nachschlagen', text: 'Alles über unsere Produkte und das Team.', ids: ['steckbrief', 'bestenliste'] },
  { no: 3, icon: '🎮', title: 'Spielen', text: 'Lernen mit Spaß: Fotos, Verkaufsgespräche und Allergien.', ids: ['bilder', 'theke', 'allergene'] },
  { no: 4, icon: '🏁', title: 'Dranbleiben', text: 'Ein paar Tage dranbleiben, dann kennst du die App.', ids: ['fragen', 'serie'] },
];

/** Welche Punkte von „Meine erste Woche mit der App“ sind erledigt? */
export function appWeekStatus(prog: any, dailyDone: boolean): { items: (OnboardingItem & { done: boolean; self?: boolean })[]; done: number; total: number } {
  const p = prog || {};
  const ok = correctIdSet(p);
  const st: LearnStats = p._stats || {};
  const manual = p._appWeek || {};
  const th = thekeTotals(p);
  const auto: Record<string, boolean> = {
    quiz: ok.size >= 10,
    daily: dailyDone,
    bilder: (Number(st.bilderRight) || 0) >= 10,
    theke: th.ok + th.bad >= 5,
    allergene: (Number(st.allergenBest) || 0) > 0,
    fragen: ok.size >= 50,
    serie: bestStreakOf(Array.isArray(p._days) ? p._days : []) >= 3,
  };
  const items = APP_WEEK_ITEMS.map(it => ({ ...it, done: !!manual[it.id] || (!it.manual && !!auto[it.id]), self: !it.manual && !!manual[it.id] && !auto[it.id] }));
  return { items, done: items.filter(i => i.done).length, total: items.length };
}

/** Wer ist man bei Hinkel? Wird beim ersten Anmelden gefragt */
export type StaffRole = 'neu' | 'erfahren' | 'azubi';

export const ROLE_INFO: Record<StaffRole, { icon: string; title: string; desc: string }> = {
  neu: { icon: '🌱', title: 'Neu bei Hinkel', desc: 'Ich fange gerade an. Mit Plan für die erste Woche.' },
  erfahren: { icon: '🥖', title: 'Schon länger dabei', desc: 'Ich kenne mich aus und will mein Wissen auffrischen.' },
  azubi: { icon: '🎓', title: 'Azubi', desc: 'Ich mache eine Ausbildung bei Hinkel.' },
};

export const SCHNITT_IDS = [60, 61, 62];

export const GESCHMACK_IDS = [70, 71, 72, 73, 74, 503, 504, 505, 506, 5001, 5002, 5003];

/** Welche Punkte der Einarbeitungs-Checkliste sind erledigt? */
export function onboardingStatus(prog: any): { items: (OnboardingItem & { done: boolean; self?: boolean })[]; done: number; total: number } {
  const p = prog || {};
  const ok = correctIdSet(p);
  const st: LearnStats = p._stats || {};
  const manual = p._onboarding || {};
  const th = thekeTotals(p);
  const auto: Record<string, boolean> = {
    schnitt: SCHNITT_IDS.every(id => ok.has(id)),
    geschmack: GESCHMACK_IDS.filter(id => ok.has(id)).length >= 5,
    bilder: (Number(st.bilderRight) || 0) >= 20,
    theke: th.ok + th.bad >= 5,
    allergene: (Number(st.allergenBest) || 0) >= 7,
    fragen: ok.size >= 50,
    serie: bestStreakOf(Array.isArray(p._days) ? p._days : []) >= 3,
  };
  // Selbst abgehakt („Kann ich schon“) zählt auch bei den Übungs-Punkten
  const items = ONBOARDING_ITEMS.map(it => ({ ...it, done: !!manual[it.id] || (!it.manual && !!auto[it.id]), self: !it.manual && !!manual[it.id] && !auto[it.id] }));
  return { items, done: items.filter(i => i.done).length, total: items.length };
}

export type Badge = { id: string; icon: string; title: string; desc: string; ok: boolean };

export const knownCount = (p: any, game: string) => (p && p._known && Array.isArray(p._known[game]) ? p._known[game].length : 0);

export const adventMax = (p: any) => Math.max(0, ...Object.values((p && p._advent) || {}).map((y: any) => Object.keys(y || {}).length));

export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export const MONTH_ICONS = ['❄️', '💝', '🌱', '🌷', '🌼', '☀️', '🍓', '🌻', '🍎', '🎃', '🏮', '🎄'];

export const monthHeroCount = (p: any, mi: number) => Object.keys((p && p._monthHero) || {}).filter(k => Number(k.slice(5, 7)) === mi + 1).length;

export const SECRETS = [
  { id: 'eule', icon: '🦉', title: 'Nachteule', desc: 'Nach 22 Uhr noch gelernt' },
  { id: 'frueh', icon: '🐓', title: 'Frühaufsteher', desc: 'Vor 6 Uhr morgens gelernt' },
  { id: 'sonntag', icon: '🛋️', title: 'Sonntagslerner', desc: 'Am freien Sonntag gelernt' },
  { id: 'perfekt', icon: '💯', title: 'Fehlerlos', desc: '5 Quizrunden hintereinander alles richtig' },
  { id: 'glueck', icon: '🍀', title: 'Glückstreffer', desc: 'Das seltene Goldlos gezogen' },
];

/** Abzeichen, werden aus dem Lernstand berechnet, nichts muss extra gespeichert werden */
export function computeBadges(prog: any, masteryPct: number, fachPct: number, allProducts = false, allPhotos = false): Badge[] {
  const p = prog || {};
  const ok = correctIdSet(p);
  const st: LearnStats = p._stats || {};
  const best = bestStreakOf(Array.isArray(p._days) ? p._days : []);
  const th = thekeTotals(p);
  const ob = onboardingStatus(p);
  return [
    { id: 'start', icon: '🥨', title: 'Erste Schritte', desc: '10 Fragen gemeistert', ok: ok.size >= 10 },
    { id: 'fleiss', icon: '📚', title: 'Fleißige Biene', desc: '100 Fragen gemeistert', ok: ok.size >= 100 },
    { id: 'halb', icon: '🏅', title: 'Halbzeit', desc: '50 % aller Fragen gemeistert', ok: masteryPct >= 50 },
    { id: 'meister100', icon: '🎖️', title: 'Hinkel-Meister', desc: '100 % aller Fragen gemeistert', ok: masteryPct >= 100 },
    { id: 'serie7', icon: '🔥', title: 'Eine Woche dran', desc: '7 Tage Lern-Serie', ok: best >= 7 },
    { id: 'serie30', icon: '🌟', title: 'Dauerbrenner', desc: '30 Tage Lern-Serie', ok: best >= 30 },
    { id: 'auge', icon: '👀', title: 'Brot-Kenner', desc: 'Bilderquiz mit 10 von 10', ok: (Number(st.bilderBest) || 0) >= 10 },
    { id: 'allergie', icon: '🛡️', title: 'Allergie-Profi', desc: 'Allergene-Training mit 10 von 10', ok: (Number(st.allergenBest) || 0) >= 10 },
    { id: 'theke', icon: '💬', title: 'Theken-Talent', desc: '25 richtige Antworten im Theken-Simulator', ok: th.ok >= 25 },
    { id: 'fehler', icon: '🔁', title: 'Fehler-Killer', desc: '10 Fragen aus dem Fehler-Stapel endgültig gelernt', ok: (Number(st.fehlerDone) || 0) >= 10 },
    { id: 'pruefung', icon: '🎓', title: 'Prüfungsreif', desc: 'Prüfungssimulation mit Note 2 oder besser', ok: (Number(st.examBest) || 0) >= 81 },
    { id: 'angekommen', icon: '✅', title: 'Angekommen', desc: 'Checkliste „Meine erste Woche“ komplett', ok: ob.done === ob.total },
    { id: 'fach', icon: '🧠', title: 'Fachwissen-Meister', desc: 'Alle Fachwissen-Fragen gemeistert', ok: fachPct >= 100 },
    // Abzeichen für die neuen Spiele
    { id: 'preis', icon: '💶', title: 'Preis-Profi', desc: 'Teurer oder billiger: 10 in Folge richtig', ok: (Number(st.priceBest) || 0) >= 10 },
    { id: 'schneide', icon: '🔪', title: 'Schneide-Meister', desc: 'Schneide-Profi mit 10 von 10', ok: (Number(st.sliceBest) || 0) >= 10 },
    { id: 'brote', icon: '🍞', title: 'Brot-Experte', desc: '50 verschiedene Brote richtig geschnitten', ok: knownCount(p, 'schnitt') >= 50 },
    { id: 'alternativen', icon: '🤝', title: 'Alternativen-Ass', desc: '30 Ausverkauft-Situationen gemeistert', ok: knownCount(p, 'alternativen') >= 30 },
    { id: 'beratung', icon: '🛎️', title: 'Beratungs-Profi', desc: '20 verschiedene Beratungen im Theken-Simulator gemeistert', ok: knownCount(p, 'theke') >= 20 },
    { id: 'advent', icon: '🎄', title: 'Adventsheld', desc: 'Alle 24 Türchen im Adventskalender geöffnet', ok: adventMax(p) >= 24 },
    // Neue Abzeichen
    { id: 'wissen300', icon: '🧠', title: 'Wissensriese', desc: '300 Fragen gemeistert', ok: ok.size >= 300 },
    { id: 'alles', icon: '🏰', title: 'Hinkel-Legende', desc: 'Alle Fragen, alle Produkte und alle Fotos geschafft', ok: masteryPct >= 100 && allProducts && allPhotos },
    { id: 'pfad1', icon: '🎲', title: 'Losgelaufen', desc: 'Erstes Feld im Lernpfad geschafft', ok: (Number(p._pfad) || 0) >= 1 },
    { id: 'pfad12', icon: '🥐', title: 'Halber Weg', desc: '12 Felder im Lernpfad', ok: (Number(p._pfad) || 0) >= 12 },
    { id: 'pfad24', icon: '👑', title: 'Brotmeister', desc: 'Lernpfad bis zum Ziel', ok: (Number(p._pfad) || 0) >= 24 },
    { id: 'album25', icon: '📒', title: 'Foto-Sammler', desc: '25 Produkte im Bilderquiz erkannt', ok: (Array.isArray(p._bilderOk) ? p._bilderOk.length : 0) >= 25 },
    { id: 'album80', icon: '🖼️', title: 'Foto-Held', desc: '80 Produkte im Bilderquiz erkannt', ok: (Array.isArray(p._bilderOk) ? p._bilderOk.length : 0) >= 80 },
    { id: 'sortiment', icon: '🧺', title: 'Sortiments-Profi', desc: 'Zu jedem Produkt mindestens eine Frage gemeistert', ok: allProducts },
    { id: 'fotoprofi', icon: '📸', title: 'Foto-Profi', desc: 'Alle Produkte im Bilderquiz erkannt', ok: allPhotos },
    { id: 'ansturm', icon: '🏃', title: 'Ruhe im Ansturm', desc: 'Im Theken-Ansturm 10 Kunden in einer Runde bedient', ok: (Number(st.ansturmBest) || 0) >= 10 },
    { id: 'heute7', icon: '🗓️', title: 'Planvoll', desc: '7-mal „Heute dran“ gespielt', ok: (Number(p._heuteCount) || 0) >= 7 },
    { id: 'los', icon: '🎫', title: 'Glückslos', desc: 'Ein Rubbellos freigerubbelt', ok: (Number(p._losCount) || 0) >= 1 },
    { id: 'schatz', icon: '💎', title: 'Schatzsucher', desc: 'Etwas in der Schatzkammer gekauft', ok: Array.isArray(p._ptsOwned) && p._ptsOwned.length > 0 },
    { id: 'rad', icon: '🎡', title: 'Glückspilz', desc: 'Am Glücksrad gedreht', ok: !!p._wheel },
    { id: 'spar10', icon: '🫙', title: 'Sparschwein', desc: '10 € Trinkgeld verdient', ok: (Number(p._tipCents) || 0) >= 1000 },
    { id: 'spar50', icon: '💰', title: 'Trinkgeld-König', desc: '50 € Trinkgeld verdient', ok: (Number(p._tipCents) || 0) >= 5000 },
    { id: 'laden', icon: '🛍️', title: 'Stammkunde', desc: '5 Sachen im Trinkgeld-Laden gekauft', ok: (Array.isArray(p._shopOwned) ? p._shopOwned.length : 0) >= 5 },
    { id: 'serie14', icon: '⚡', title: 'Zwei Wochen dran', desc: '14 Tage Lern-Serie', ok: best >= 14 },
    { id: 'theke100', icon: '🛎️', title: 'Theken-Profi', desc: '100 richtige Antworten im Theken-Simulator', ok: th.ok >= 100 },
    { id: 'login7', icon: '🎁', title: 'Treue Seele', desc: '7 Tage am Stück die Anmelde-Belohnung abgeholt', ok: (Number(p._loginBest) || 0) >= 7 },
    { id: 'ostern', icon: '🐣', title: 'Eier-Detektiv', desc: osterZeit() ? 'Finde zu Ostern alle versteckten Eier in der App' : 'Nur in der Osterzeit zu finden', ok: Array.isArray(p._osternDone) && p._osternDone.length > 0 },
    { id: 'meister', icon: '👑', title: 'Monatsmeister', desc: 'Einen Monat die meisten Punkte gesammelt', ok: Array.isArray(p._meister) && p._meister.length > 0 },
    { id: 'geheim', icon: '🥨', title: 'Geheimnis entdeckt', desc: p._egg ? 'Du hast das Geheimnis gefunden!' : 'Irgendwo in der App versteckt sich etwas …', ok: !!p._egg },
    // Monats-Abzeichen: an 15 Tagen in einem Monat gelernt, zählt jedes Jahr weiter
    ...MONTHS.map((m, mi) => { const n = monthHeroCount(p, mi); return { id: `monat${mi + 1}`, icon: MONTH_ICONS[mi], title: `${m}-Held${n > 1 ? ` ×${n}` : ''}`, desc: n > 1 ? `In ${n} Jahren an 15 Tagen im ${m} gelernt` : `An 15 Tagen im ${m} gelernt`, ok: n > 0 }; }),
    { id: 'jahresheld', icon: '🏆', title: 'Jahres-Held', desc: 'Alle 12 Monats-Abzeichen gesammelt', ok: MONTHS.every((_, mi) => monthHeroCount(p, mi) > 0) },
    // Geheime Abzeichen: erst sichtbar, wenn gefunden
    ...SECRETS.map(sb => { const got = !!(p._secret && p._secret[sb.id]); return got ? { id: 'g_' + sb.id, icon: sb.icon, title: sb.title, desc: sb.desc, ok: true } : { id: 'g_' + sb.id, icon: '❔', title: 'Geheimes Abzeichen', desc: 'Wird erst verraten, wenn du es findest …', ok: false }; }),
  ];
}

/** Notenschlüssel der Kammer (100-Punkte-Schlüssel) */
export function ihkGrade(pct: number): { note: number; text: string; passed: boolean } {
  if (pct >= 92) return { note: 1, text: 'sehr gut', passed: true };
  if (pct >= 81) return { note: 2, text: 'gut', passed: true };
  if (pct >= 67) return { note: 3, text: 'befriedigend', passed: true };
  if (pct >= 50) return { note: 4, text: 'ausreichend', passed: true };
  if (pct >= 30) return { note: 5, text: 'mangelhaft', passed: false };
  return { note: 6, text: 'ungenügend', passed: false };
}
