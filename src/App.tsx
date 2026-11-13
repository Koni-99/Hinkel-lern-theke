import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { dc, isDarkMode, BASE_BAKING_SCHEDULE, BASE_SEASONAL_MAP } from './daten/data';
import { CATS, questions as rawQuestions, examQuestions } from './daten/questions';
import { SHOP_PRODUCTS } from './daten/shopProducts';
// Versionsnummer, unten in der App sichtbar. So sieht man sofort, ob alle Dateien neu eingefügt wurden.
const APP_VERSION: number = 168;
// Diese Bereiche werden erst geladen, wenn man sie öffnet (schnellerer Start)
const FlashcardView = lazy(() => import('./components/FlashcardView').then((m) => ({ default: m.FlashcardView })));
const ScoreboardView = lazy(() => import('./components/ScoreboardView').then((m) => ({ default: m.ScoreboardView })));
const BattleView = lazy(() => import('./components/BattleView').then((m) => ({ default: m.BattleView })));
const TuetenBlitzView = lazy(() => import('./components/TuetenBlitzView').then((m) => ({ default: m.TuetenBlitzView })));
const AlternativenJaegerView = lazy(() => import('./components/AlternativenJaegerView').then((m) => ({ default: m.AlternativenJaegerView })));
import { CloudPayload, PinEntry } from './types';
import { useCloud } from './cloud/useCloud';
import { KundenfragenSeite } from './screens/KundenfragenSeite';
import { alleKundenfragen, alleTipps, tippGeben } from './hilfen/kollegen';
import { gelesenAm, gelesenBestaetigen, offeneLobPunkte, lobPunkteGutschreiben, meineNotizen, notizSpeichern } from './hilfen/team';
import { LobKarte } from './screens/LobKarte';
import { UmfrageKarten } from './screens/UmfrageKarten';
import { setFocusData, setFocusSaver, flushFocus, applyWeakDelta, WEAK_MAX } from './focus';
import { getRankByPercentage, formatEndpointUrl, matchesSortimentSubfilter, shuffleArray, todayLocal, sanitizeUsername, isLeaderboardExcludedCategory } from './hilfen/allgemein';
import { shuffleQuestionOptions } from './hilfen/pruefung';
import { hasAdminSession, adminSignOut, withAdminAuth, ADMIN_EXPIRED_EVENT } from './hilfen/anmeldung';
import { settleBattle, awardBattlePoints, battleWinnerSide } from './hilfen/battle';
import { applyProductFixes, patchProductQuestion, registerNewProducts } from './hilfen/produkte';
// Ausbilder-Bereich wird erst geladen, wenn er gebraucht wird (schnellerer Start für alle anderen)
const AdminView = lazy(() => import('./components/AdminView').then((m) => ({ default: m.AdminView })));
import { KassenblitzView } from './games/Kassenblitz';
import { ThekenSimulatorView } from './games/theke/ThekenSimulator';
import { BilderQuizView, buildPhotoBattleQuestions, buildBilderPool } from './games/BilderQuiz';
import { AllergenTrainerView } from './games/AllergenTrainer';
import { PreisDuellView } from './games/PreisDuell';
import { SchneideProfiView } from './games/SchneideProfi';
import { AdventView, adventPoints, AdventDone } from './games/Advent';
import { ThekenAnsturmView } from './games/ThekenAnsturm';
import { LEARN_PATTERNS, LearnItem, LearnKind, KnownMap } from './games/spielBasis';
import { productImageKey, TH, cardStyle, btnPrimary, btnSecondary, PageHead, ProductImages, ConfettiOverlay } from './ui/basis';
import { ScratchCard, drawLosPrize, LosPrize, ProfileView, ProfileData, YearReviewView, YearData } from './ui/belohnungen';
import { AusbildungView } from './ui/ausbildung';
import { LernpfadView, GluecksradCard, buildPfad, WHEEL } from './ui/lernpfadRad';
import { onboardingStatus, computeBadges, correctIdSet, appWeekStatus, StaffRole } from './ui/lernstand';
import { FloatingReportButton, setGameReporter, reportKeyOf, GameReport } from './ui/melden';
import { StatistikView } from './ui/statistik';
import { comboTake, comboReset } from './ui/antwortFx';
import { IntroTour, HilfeView } from './ui/hilfe';
import { LoginRewardDialog, LOGIN_REWARDS, OsterEi, OSTER_TABS, osterZeit, monthChampions, prevMonthKey, monthLabel } from './ui/kalender';
import { DEFAULT_CLOUD_URL, emptyCloud, HINKEL_LOGO, HINKEL_KUEKEN, LT, BTN_YELLOW, LT_CSS, TAB_ORDER } from './basis/marke';
import { TIP_DAY_CAP, TIP_SHOP, JOKER_FIELD, shopPrice, inSeason, GAME_EMOJI, tipEuro, ShopIcon3D, nameClassOf, PT_SHOP, TipShop } from './basis/laden';
import { DuelSwords, DuelBadge, LtIcon, ICON } from './basis/symbole';
import { wxKindOf, WxIcon } from './basis/fakten';
import { idbGet, idbSet, shiftDayKey, TEAM_CAT, TEAM_REWARD, weekIdNow, dayKey, stampInit, markLearnDay, streakMultFor, computeStreak, LEVELS, levelFor, AdminGift, useCountUp, seasonFor, mondayOf, parseBonDate, cleanCat } from './basis/serie';
import type { ShopItem, PtItem } from './basis/laden';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { QuizResult } from './screens/quiz/QuizResult';
import { QuizQuestion } from './screens/quiz/QuizQuestion';
import { QuizLevels } from './screens/quiz/QuizLevels';
import { QuizCategories } from './screens/quiz/QuizCategories';
import { AusbilderNachricht } from './screens/dialoge/AusbilderNachricht';
import { RolleWaehlen } from './screens/dialoge/RolleWaehlen';
import { Fuehrerschein } from './screens/dialoge/Fuehrerschein';
import { AppWocheGeschafft } from './screens/dialoge/AppWocheGeschafft';
import { StempelkarteVoll } from './screens/dialoge/StempelkarteVoll';
import { NeuesAbzeichen } from './screens/dialoge/NeuesAbzeichen';
import { PinFestlegen } from './screens/dialoge/PinFestlegen';
import { FrageMelden } from './screens/dialoge/FrageMelden';
import { NeueStufe } from './screens/dialoge/NeueStufe';
import { Wochenrueckblick } from './screens/dialoge/Wochenrueckblick';
import { InstallHilfe } from './screens/dialoge/InstallHilfe';
import { EinarbeitungSeite } from './screens/EinarbeitungSeite';
import { NachschlagenSeite } from './screens/NachschlagenSeite';
import { SpielenSeite } from './screens/SpielenSeite';



export default function App() {
  const [username, setUsername] = useState(() => {
    const u = sanitizeUsername(localStorage.getItem('hinkel_username') || '');
    // Ausbilder-Modus nur mit gültiger Firebase-Anmeldung, ein gespeicherter Name „admin“ reicht nicht
    return u.toLowerCase() === 'admin' && !hasAdminSession() ? '' : u;
  });
  // Umzug vom alten CodeSandbox-Link: der alte Link schickt den Namen mit (…?name=Anna), dann nur noch PIN eingeben
  const [tempUsername, setTempUsername] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const n = sanitizeUsername(sp.get('name') || '');
      if (sp.has('name')) window.history.replaceState(null, '', window.location.pathname);
      return n.toLowerCase() === 'admin' ? 'admin' : n;
    } catch { return ''; }
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminEmail, setAdminEmail] = useState(() => { try { return localStorage.getItem('hinkel_admin_email') || ''; } catch { return ''; } });
  const [adminLoginMsg, setAdminLoginMsg] = useState('');
  const [pinError, setPinError] = useState(false);
  // Anmeldung in Schritten: Name → PIN eingeben (oder beim ersten Mal festlegen)
  const [loginStep, setLoginStep] = useState<'name' | 'pin' | 'setpin'>('name');
  const [loginPin, setLoginPin] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  const resetLogin = () => { setLoginStep('name'); setLoginPin(''); setLoginBusy(false); setLoginMsg(''); };

  const [cloudUrl, setCloudUrl] = useState(() => localStorage.getItem('hinkel_cloud_url') || DEFAULT_CLOUD_URL);

  // Laden, Speichern und Live-Updates liegen in src/cloud/ (siehe useCloud.ts)
  const { cloudData, cloudDataRef, isSyncing, cloudConnected, setCloudConnected, unsyncedRef, fetchCloudData, mutateCloudData } =
    useCloud(cloudUrl, emptyCloud, () => activeTabRef.current === 'battle');

  const todayDayNum = new Date().getDay();
  const [selectedBakeDay, setSelectedBakeDay] = useState<number>(todayDayNum >= 1 && todayDayNum <= 6 ? todayDayNum : 1);
  const [showBakingCalendar, setShowBakingCalendar] = useState<boolean>(true);
  const [openSeasons, setOpenSeasons] = useState<Record<string, boolean>>({
    'Frühling': false, 'Sommer': false, 'Herbst': false, 'Winter': false
  });

  // Erledigt-Merker (Tages-Challenge, Experten-Ecke, Produkt der Woche, Heute dran) liegen in der Cloud,
  // damit sie auf Handy und Tablet gleich sind. Der alte Merker im Gerät zählt weiter mit.
  const doneGet = (kind: 'daily' | 'expert' | 'wp' | 'heute', val: string): boolean => {
    if (!username) return false;
    const k = username.toLowerCase();
    const pr: any = (cloudData.progress || {})[k] || {};
    if (pr._done && pr._done[kind] === val) return true;
    const lsKey = kind === 'heute' ? `hinkel_heute_${k}` : `hinkel_${kind}_${k}`;
    try { return localStorage.getItem(lsKey) === val; } catch { return false; }
  };
  const doneSet = (kind: 'daily' | 'expert' | 'wp' | 'heute', val: string) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    const lsKey = kind === 'heute' ? `hinkel_heute_${k}` : `hinkel_${kind}_${k}`;
    try { localStorage.setItem(lsKey, val); } catch {}
    mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._done = { ...(pr._done || {}), [kind]: val }; return curr; });
  };

  // Löschen/Überschreiben (Admin, Fortschritt zurücksetzen) nutzt jetzt denselben sicheren Weg.
  const overwriteCloudDataDirectly = mutateCloudData;

  // PIN speichern. Hat in der Zwischenzeit ein anderes Gerät schon eine neuere PIN festgelegt, bleibt diese.
  const savePin = (key: string, entry: PinEntry, knownTs: number) => {
    mutateCloudData((curr) => {
      const cur = (curr.pins || {})[key];
      if (cur?.h && (cur.ts || 0) > knownTs && cur.ts !== entry.ts) return curr;
      curr.pins = { ...(curr.pins || {}), [key]: entry };
      return curr;
    });
  };
  // Ausbilder-Konto gesperrt oder Passwort geändert: zurück zur Anmeldung
  useEffect(() => {
    const onExpired = () => { if (username.toLowerCase() === 'admin') { setUsername(''); setTempUsername('admin'); setAdminLoginMsg('Bitte melde dich neu an.'); setPinError(true); } };
    window.addEventListener(ADMIN_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(ADMIN_EXPIRED_EVENT, onExpired);
  }, [username]);
  const finishLogin = (clean: string) => {
    resetLogin();
    setUsername(clean);
    try { localStorage.setItem('hinkel_username', clean); } catch {}
  };

  // ── Produktfotos: liegen in Firebase neben den App-Daten (hinkel_bilder) und werden pro Gerät zwischengespeichert ──
  const imagesUrl = (() => { const u = formatEndpointUrl(cloudUrl); return /hinkel_app\.json$/.test(u) ? u.replace(/hinkel_app\.json$/, 'hinkel_bilder') : ''; })();
  const [productImages, setProductImages] = useState<ProductImages>({});
  const imagesVersionRef = useRef<number>(0);
  const cacheImages = (version: number, images: ProductImages) => {
    imagesVersionRef.current = version;
    setProductImages(images);
    idbSet('bilder', { version, images }).catch(() => {});
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1) Fotos sofort aus dem Gerätespeicher zeigen
      try {
        const cached = await idbGet('bilder');
        if (!cancelled && cached && cached.images && !imagesVersionRef.current) {
          imagesVersionRef.current = Number(cached.version) || 0;
          setProductImages(cached.images);
        }
      } catch {}
      try { localStorage.removeItem('hinkel_bilder_cache'); } catch {} // alter Zwischenspeicher, macht Platz
      // 2) Nur neu laden, wenn der Ausbilder neue Fotos hochgeladen hat
      if (!imagesUrl) return;
      try {
        const vRes = await fetch(await withAdminAuth(`${imagesUrl}/version.json?t=${Date.now()}`));
        if (!vRes.ok) return;
        const version = Number(await vRes.json()) || 0;
        if (!version || version === imagesVersionRef.current) return; // schon aktuell
        const res = await fetch(await withAdminAuth(`${imagesUrl}/images.json`));
        if (!res.ok) return;
        const imgs = await res.json();
        if (!cancelled && imgs && typeof imgs === 'object') cacheImages(version, imgs);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [imagesUrl]);

  // Ausbilder lädt die Bilder-Datei einmal hoch, danach sehen alle die Fotos
  const importImagesFile = async (file: File): Promise<string> => {
    if (!imagesUrl) return 'Es ist keine Firebase-Datenbank eingestellt.';
    let data: any;
    try { data = JSON.parse(await file.text()); } catch { return 'Die Datei konnte nicht gelesen werden, ist es die Datei „hinkel_bilder.json“?'; }
    const imgs = data && data.images;
    const count = imgs && typeof imgs === 'object' ? Object.keys(imgs).length : 0;
    if (!count || !Object.values(imgs).every((v: any) => typeof v === 'string' && v.startsWith('data:image/'))) return 'Das ist keine gültige Bilder-Datei.';
    const version = Date.now();
    try {
      const res = await fetch(await withAdminAuth(`${imagesUrl}.json`), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version, images: imgs }) });
      if (!res.ok) return 'Hochladen hat nicht geklappt, bitte Internetverbindung prüfen.';
    } catch { return 'Hochladen hat nicht geklappt, bitte Internetverbindung prüfen.'; }
    cacheImages(version, imgs);
    return `${count} Produktfotos importiert, alle Mitarbeiter sehen sie ab jetzt.`;
  };

  // Offline-Modus: Hinweis anzeigen, wenn keine Verbindung besteht, und melden, wenn alles nachgeschickt wurde
  const [offlineSince, setOfflineSince] = useState<number>(0);
  const [offlineDismissed, setOfflineDismissed] = useState(false);
  const wasOfflineRef = useRef(false);
  useEffect(() => {
    if (!cloudConnected) {
      const t = window.setTimeout(() => { setOfflineSince(Date.now()); wasOfflineRef.current = true; }, 6000);
      return () => window.clearTimeout(t);
    }
    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setOfflineSince(0); setOfflineDismissed(false);
      if (!unsyncedRef.current) { setToast('📶 Wieder online! Alles, was du offline gemacht hast, ist gespeichert.'); window.setTimeout(() => setToast(''), 4000); }
    }
  }, [cloudConnected]);

  const registerUserActivity = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const userKey = clean.toLowerCase();
    const nowStr = new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
    mutateCloudData((curr) => {
      curr.lastSeen[userKey] = { displayName: clean, time: nowStr, timestamp: Date.now() };
      if (!curr.progress[userKey]) curr.progress[userKey] = { _displayName: clean };
      else curr.progress[userKey]._displayName = clean;
      return curr;
    });
  };

  useEffect(() => {
    if (!username) return;
    registerUserActivity(username);
  }, [username]);

  // Fragen aus dem Buch + eigene Fragen, die der Ausbilder in der Cloud angelegt hat
  // Fragen, die der Ausbilder ausgeblendet hat (z. B. nach einer Meldung), kommen nirgends mehr dran
  const hiddenQ = cloudData.tombstones?.questions || {};
  const hiddenKey = Object.keys(hiddenQ).sort().join(',');
  // Vom Ausbilder korrigierte Katalogfragen ersetzen das Original
  const qEdits = cloudData.questionEdits || {};
  const editsKey = Object.keys(qEdits).map(k => `${k}:${qEdits[k]?.ts}`).sort().join(',');
  // Fragen rund um Soja kommen nirgends dran (auch keine eigenen oder korrigierten)
  const ohneSojaFrage = (q: any) => !/soja/i.test([q.question, q.explanation, ...(q.options || [])].join(' '));
  const applyEdit = <T extends { id: number }>(q: T): T => {
    const e = qEdits[String(q.id)];
    if (!e || e.restored) return q;
    return { ...q, ...(e.question ? { question: e.question } : {}), ...(Array.isArray(e.options) && e.options.length >= 2 ? { options: e.options } : {}), ...(typeof e.correct === 'number' ? { correct: e.correct } : {}), ...(typeof e.explanation === 'string' ? { explanation: e.explanation } : {}) };
  };
  // Vom Ausbilder korrigierte Produktdaten (Preis, Zutaten, Allergene, Alternativen) gelten in allen Spielen
  const pFixes = cloudData.productFixes || {};
  const pFixKey = Object.keys(pFixes).map(k => `${k}:${pFixes[k]?.ts}`).sort().join(',');
  // Neue Produkte vom Ausbilder: kommen ins Sortiment und bekommen automatisch Quizfragen
  const newProductList = (cloudData.customProducts || []).filter((p: any) => p && p.targetArea === 'sortiment');
  const newProdKey = JSON.stringify(newProductList);
  const newProductQs = useMemo(() => registerNewProducts(newProductList), [newProdKey]);
  useMemo(() => applyProductFixes(pFixes), [pFixKey, newProdKey]);
  const questions = useMemo(
    () => [...rawQuestions, ...newProductQs, ...(cloudData.customQuestions || [])].filter(q => !hiddenQ[String(q.id)]).map(q => applyEdit(patchProductQuestion(q))).filter(ohneSojaFrage),
    [cloudData.customQuestions, hiddenKey, editsKey, pFixKey, newProductQs]
  );
  const examQs = useMemo(() => examQuestions.filter(q => !hiddenQ[String(q.id)]).map(applyEdit).filter(ohneSojaFrage), [hiddenKey, editsKey]);
  const azubiArea = username.toLowerCase() === 'admin' || ((cloudData.progress || {})[username.toLowerCase()] || {})._role === 'azubi';
  const examAllowed = true; // Prüfungen sind für alle freigeschaltet
  const allFlashcards = useMemo(() => (examAllowed ? [...questions, ...examQs] : questions), [questions, examQs, examAllowed]);
  const isAdmin = username.toLowerCase() === 'admin';
  // Schon angemeldete Kollegen ohne PIN (oder nach Zurücksetzen) legen sie einmal fest. Nur mit frischem Cloud-Stand,
  // damit keine PIN von einem anderen Gerät überschrieben wird.
  const needPinSetup = !!username && !isAdmin && cloudConnected && !!formatEndpointUrl(cloudUrl) && !(cloudData.pins || {})[username.toLowerCase()]?.h;

  // ── Schwachstellen-Training: Schwächen aus den Spielen (_weak) plus falsch beantwortete Produkt-Quizfragen ──
  const qProduct = useMemo(() => {
    const m: Record<string, string> = {};
    questions.forEach((q: any) => {
      const t = String(q.question || '');
      if (!Object.values(LEARN_PATTERNS).some((re) => re.test(t))) return;
      const mm = /„([^“”"]+)[“”"]/.exec(t);
      if (mm) m[String(q.id)] = mm[1];
    });
    return m;
  }, [questions]);
  const focusProg: any = (cloudData.progress || {})[username.toLowerCase()] || {};
  const focusWeakKey = JSON.stringify(focusProg._weak || {});
  const focusWrongKey = JSON.stringify(focusProg.wrongStats || {});
  const focusMap = useMemo(() => {
    const w: Record<string, number> = {};
    Object.entries(focusProg._weak || {}).forEach(([k, v]) => { if (Number(v) > 0) w[k] = Number(v); });
    Object.entries(focusProg.wrongStats || {}).forEach(([qid, c]) => {
      const pn = qProduct[qid];
      if (pn && Number(c) > 0) w[pn] = Math.min(WEAK_MAX, (w[pn] || 0) + Math.min(3, Number(c)));
    });
    return w;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusWeakKey, focusWrongKey, qProduct]);
  setFocusData(isAdmin ? {} : focusMap);
  useEffect(() => {
    if (!username || isAdmin) { setFocusSaver(null); return; }
    const k = username.toLowerCase();
    // Ergebnisse werden gesammelt und gebündelt gespeichert (nicht nach jeder einzelnen Antwort)
    setFocusSaver((delta) => mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      pr._weak = applyWeakDelta(pr._weak, delta);
      return curr;
    }));
    const onHide = () => { if (document.visibilityState === 'hidden') flushFocus(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { flushFocus(); document.removeEventListener('visibilitychange', onHide); setFocusSaver(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, isAdmin]);

  // ── Team-Challenge: ein gemeinsames Wochenziel für alle ──
  // Ziel = Durchschnitt der letzten 4 Wochen + 10 %, gerundet auf 100, mindestens 500 Punkte.
  // Wer in der Woche mitgespielt hat, bekommt beim Erreichen einmal TEAM_REWARD Punkte.
  const team = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
    const sums = [0, 0, 0, 0, 0, 0];
    const who: Set<string>[] = [new Set(), new Set()];
    (cloudData.scores || []).forEach((sc) => {
      if (!sc?.username || sc.n) return;
      const k = sc.username.toLowerCase();
      if (k === 'admin' || sc.category === 'Bonus vom Ausbilder' || sc.category === TEAM_CAT) return;
      const d = parseBonDate(sc.date); if (!d) return;
      const w = Math.floor((start - d.getTime()) / (7 * 86400000)) + 1; // 0 = diese Woche, 1 = letzte …
      if (d.getTime() >= start) { sums[0] += Number(sc.score) || 0; who[0].add(k); return; }
      if (w >= 1 && w <= 5) { sums[w] += Number(sc.score) || 0; if (w === 1) who[1].add(k); }
    });
    const goalFor = (w: number) => {
      const prev = sums.slice(w + 1, w + 5).filter((x) => x > 0);
      const avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
      return Math.max(500, Math.ceil((avg * 1.1) / 100) * 100);
    };
    const wk = (w: number) => dayKey(new Date(start - w * 7 * 86400000));
    const goal = goalFor(0), lastGoal = goalFor(1);
    const daysLeft = 7 - ((now.getDay() + 6) % 7);
    return {
      week: wk(0), goal, points: sums[0], reached: sums[0] >= goal, players: who[0], daysLeft,
      lastWeek: wk(1), lastGoal, lastPoints: sums[1], lastReached: sums[1] >= lastGoal, lastPlayers: who[1],
    };
  }, [cloudData.scores]);
  const teamClaimRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!username || isAdmin || !cloudConnected) return;
    const k = username.toLowerCase();
    const won: string[] = Array.isArray(focusProg._teamWon) ? focusProg._teamWon : [];
    const due = [
      team.reached && team.players.has(k) ? team.week : '',
      team.lastReached && team.lastPlayers.has(k) ? team.lastWeek : '',
    ].filter((w) => w && !won.includes(w) && !teamClaimRef.current.has(w));
    if (!due.length) return;
    due.forEach((w) => teamClaimRef.current.add(w));
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      const have: string[] = Array.isArray(pr._teamWon) ? pr._teamWon : [];
      const fresh = due.filter((w) => !have.includes(w));
      if (!fresh.length) return curr;
      pr._teamWon = [...have, ...fresh].slice(-12);
      if (!Array.isArray(curr.scores)) curr.scores = [];
      fresh.forEach((_w, i) => curr.scores.push({ id: `${k}_team_${Date.now() + i}`, username, score: TEAM_REWARD, date: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }), category: TEAM_CAT }));
      return curr;
    });
    setToast(`🤝 Team-Challenge geschafft! +${TEAM_REWARD * due.length} Punkte für dich.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.reached, team.lastReached, team.week, cloudConnected, username, isAdmin, focusWeakKey, JSON.stringify(focusProg._teamWon || [])]);

  const [activeTab, setActiveTab] = useState('home');
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const [obDay, setObDay] = useState<number | null>(null);
  const [spickArea, setSpickArea] = useState<'produkt' | 'fach'>('produkt');
  const [spickView, setSpickView] = useState<'dictionary' | undefined>(undefined);

  // Größere Schrift (A+), wird pro Gerät gemerkt
  const [bigFont, setBigFont] = useState<boolean>(() => { try { return localStorage.getItem('hinkel_big_font') === '1'; } catch { return false; } });
  const toggleBigFont = () => {
    setBigFont(prev => {
      const next = !prev;
      try { localStorage.setItem('hinkel_big_font', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // Hell / Dunkel: wird pro Gerät gemerkt, die App lädt danach kurz neu
  const darkMode = isDarkMode();
  useEffect(() => {
    try { document.documentElement.style.backgroundColor = LT.cream; document.body.style.backgroundColor = LT.cream; } catch {}
  }, []);

  // „Auf den Startbildschirm“: Anleitung + direkter Installieren-Knopf, wo der Browser es anbietet
  const [showInstallHelp, setShowInstallHelp] = useState<boolean>(false);
  const [showTipShop, setShowTipShop] = useState<boolean>(false);
  const [hdrMenu, setHdrMenu] = useState<boolean>(false);
  const [pfadMsg, setPfadMsg] = useState<string>('');
  const [showWheel, setShowWheel] = useState<boolean>(false);
  const [losPrize, setLosPrize] = useState<LosPrize | null>(null);
  const [profileKey, setProfileKey] = useState<string>('');
  const [lastComboExtra, setLastComboExtra] = useState<number>(0);
  useEffect(() => { comboReset(); }, [activeTab]);
  const [loginOpenDay, setLoginOpenDay] = useState<number>(0);
  const [masteryStart, setMasteryStart] = useState<{ ids: number; products: number } | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [installHidden, setInstallHidden] = useState<boolean>(() => { try { return localStorage.getItem('lt_install_hidden') === '1'; } catch { return false; } });
  const hideInstall = () => { try { localStorage.setItem('lt_install_hidden', '1'); } catch {} setInstallHidden(true); setShowInstallHelp(false); };
  useEffect(() => { const f = () => hideInstall(); window.addEventListener('appinstalled', f); return () => window.removeEventListener('appinstalled', f); }, []);
  const [doubleOn, setDoubleOn] = useState<boolean>(false);
  const [brezelRain, setBrezelRain] = useState<boolean>(false);
  const logoTaps = useRef<number[]>([]);
  const [weather, setWeather] = useState<{ code: number; temp: number } | null>(null);
  // Wetter in Düsseldorf (Open-Meteo, ohne Anmeldung): Regen, Schnee oder Wolken auf der Markise
  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch('https://api.open-meteo.com/v1/forecast?latitude=51.2277&longitude=6.7735&current=temperature_2m,weather_code&timezone=Europe%2FBerlin')
        .then(r => (r.ok ? r.json() : null))
        .then(d => { if (alive && d && d.current) setWeather({ code: Number(d.current.weather_code), temp: Math.round(Number(d.current.temperature_2m)) }); })
        .catch(() => {});
    };
    load();
    const t = window.setInterval(load, 30 * 60 * 1000);
    return () => { alive = false; window.clearInterval(t); };
  }, []);
  // 3D-Effekt: Karten kippen beim Antippen (Tablet) und unter der Maus (PC)
  useEffect(() => {
    let reduce = true; // ruhiger: Karten kippen nicht mehr
    if (reduce) return;
    const SEL = '.lt-card, .lt-maincard, .lt-tilt';
    let cur: HTMLElement | null = null;
    const tilt = (el: HTMLElement, x: number, y: number, press: boolean) => {
      if (document.documentElement.classList.contains('lt-noanim')) return;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      const px = (x - r.left) / r.width - 0.5, py = (y - r.top) / r.height - 0.5;
      const max = r.width > 500 ? 4 : 9;
      el.classList.add('lt-tilt3d');
      el.style.transform = `perspective(800px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) ${press ? 'scale(.98)' : 'translateY(-3px)'}`;
    };
    const reset = (el: HTMLElement | null) => { if (!el) return; el.style.transform = ''; window.setTimeout(() => { if (el !== cur) el.classList.remove('lt-tilt3d'); }, 380); };
    const onDown = (e: PointerEvent) => { const el = (e.target as HTMLElement)?.closest?.(SEL) as HTMLElement | null; if (!el || (el as HTMLButtonElement).disabled) return; cur = el; tilt(el, e.clientX, e.clientY, true); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as HTMLElement)?.closest?.(SEL) as HTMLElement | null;
      if (el !== cur) { reset(cur); cur = el; }
      if (el && !(el as HTMLButtonElement).disabled) tilt(el, e.clientX, e.clientY, e.buttons > 0);
    };
    const onUp = () => { const el = cur; if (el) { el.style.transform = ''; } if (el && el.matches(':hover') && window.matchMedia('(hover: hover)').matches) return; reset(el); cur = null; };
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointercancel', onUp, { passive: true });
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); document.removeEventListener('pointercancel', onUp); };
  }, []);
  const [bannerHidden, setBannerHidden] = useState<string>(() => { try { return localStorage.getItem('lt_banner_hidden') || ''; } catch { return ''; } });
  const [jokerHide, setJokerHide] = useState<{ key: string; idx: number[] } | null>(null);
  const installPromptRef = useRef<any>(null);
  const [canInstallDirect, setCanInstallDirect] = useState<boolean>(false);
  const isStandaloneApp = (() => {
    try { return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true; } catch { return false; }
  })();
  const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  useEffect(() => {
    const onPrompt = (e: any) => { e.preventDefault(); installPromptRef.current = e; setCanInstallDirect(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  const installDirect = async () => {
    const ev = installPromptRef.current;
    if (!ev) return;
    ev.prompt();
    try { await ev.userChoice; } catch {}
    installPromptRef.current = null;
    setCanInstallDirect(false);
    setShowInstallHelp(false);
  };

  // Schriften der Lern-Theke einmalig laden
  useEffect(() => {
    if (document.getElementById('lt-fonts')) return;
    const link = document.createElement('link');
    link.id = 'lt-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Courier+Prime:wght@400;700&family=Fredoka:wght@600&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Caveat:wght@600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Beim Wechsel des Bereichs nach oben scrollen
  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);
  const [currentQuizCategory, setCurrentQuizCategory] = useState<string | null>(null);
  const [selectedSubfilter, setSelectedSubfilter] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [quizList, setQuizList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [lastDelta, setLastDelta] = useState<number | null>(null); // Punkte der letzten Antwort (für die kleine Animation)
  const [quizRun, setQuizRun] = useState(0); // richtige Antworten in Folge
  // „Nur neue Fragen“: schon richtig beantwortete Fragen überspringen (pro Gerät gemerkt)
  const [onlyNew, setOnlyNew] = useState<boolean>(() => { try { return localStorage.getItem('hinkel_only_new') !== '0'; } catch { return true; } });
  const toggleOnlyNew = () => setOnlyNew(prev => { const next = !prev; try { localStorage.setItem('hinkel_only_new', next ? '1' : '0'); } catch {} return next; });

  const [examTimerEnabled, setExamTimerEnabled] = useState<boolean>(false);
  const [examSecondsLeft, setExamSecondsLeft] = useState<number>(900);
  const isExamMode = selectedLevel === 'exam';
  useEffect(() => {
    if (!isAnswered || activeTab !== 'quiz') return;
    const t = window.setTimeout(() => {
      const el = document.querySelector('.lt-expl');
      if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [isAnswered, activeTab]);
  // Nächste Frage: wieder nach oben zur Frage
  useEffect(() => {
    if (activeTab !== 'quiz') return;
    const el = document.getElementById('lt-quiz-top');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentIndex, activeTab]);
  const [examSim, setExamSim] = useState<boolean>(false);
  const [examPrev, setExamPrev] = useState<{ last: number | null; best: number | null; hist: number[] }>({ last: null, best: null, hist: [] });

  const examTimerRunning = activeTab === 'quiz' && isExamMode && (examTimerEnabled || examSim) && !quizFinished && quizList.length > 0;

  useEffect(() => {
    if (!examTimerRunning) return;
    const timer = window.setInterval(() => setExamSecondsLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [examTimerRunning]);

  // Zeit abgelaufen → Auswertung zeigen (Prüfungen kommen nicht in die Bestenliste)
  useEffect(() => {
    if (examTimerRunning && examSecondsLeft === 0) {
      if (examSim) {
        // Zeit um: alle noch offenen Fragen zählen als falsch
        const open = quizList.slice(currentIndex);
        setWrongQuestions(prev => [...prev, ...open.filter(q => !prev.some(w => w.id === q.id))]);
        finishExamSim(correctCount);
      } else setQuizFinished(true);
    }
  }, [examTimerRunning, examSecondsLeft]);

  // Quiz Battle State
  const [battleState, setBattleState] = useState<'menu' | 'playing' | 'waiting'>('menu');
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [battleQuestions, setBattleQuestions] = useState<any[]>([]);
  const [battleIndex, setBattleIndex] = useState(0);
  const [battleCorrects, setBattleCorrects] = useState(0);
  const [battleTimeLeft, setBattleTimeLeft] = useState(15);
  const battleTimerRef = useRef<any>(null);
  // Zeitmessung fürs Battle: Start der aktuellen Frage und Summe aller Fragen (ms)
  const battleQStartRef = useRef<number>(0);
  const battleElapsedRef = useRef<number>(0);
  const [battleElapsed, setBattleElapsed] = useState<number>(0);
  const stopBattleClock = () => { if (battleQStartRef.current) { battleElapsedRef.current += Math.max(0, Date.now() - battleQStartRef.current); battleQStartRef.current = 0; } };

  useEffect(() => {
    if (activeTab === 'battle' && battleState === 'playing' && !isAnswered) {
      battleTimerRef.current = window.setInterval(() => {
        setBattleTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(battleTimerRef.current);
    }
  }, [battleState, battleIndex, activeTab, isAnswered]);

  // Zeit pro Frage abgelaufen → Frage zählt als falsch, weiter zur nächsten
  useEffect(() => {
    if (activeTab === 'battle' && battleState === 'playing' && !isAnswered && battleTimeLeft === 0) {
      clearInterval(battleTimerRef.current);
      stopBattleClock();
      setIsAnswered(true);
      window.setTimeout(() => nextBattleQuestion(battleCorrects), 1500);
    }
  }, [battleTimeLeft, battleState, activeTab, isAnswered]);

  const createBattleChallenge = (opponentKey: string, opponentName: string, stake = 0) => {
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    // 3 Wissensfragen + 2 Foto-Fragen (wenn die Produktfotos geladen sind)
    const photo = buildPhotoBattleQuestions(productImages, 2);
    const selected = shuffleArray([...shuffleArray(allFlashcards).slice(0, 5 - photo.length).map(q => shuffleQuestionOptions(q)), ...photo]);
    mutateCloudData((curr) => {
      if (!curr.battles) curr.battles = {};
      curr.battles[battleId] = { id: battleId, challenger: username, challengerKey: username.toLowerCase(), opponent: opponentName, opponentKey, questions: selected, challengerScore: null, opponentScore: null, status: 'pending', winner: null, ...(stake > 0 ? { stake } : {}) } as any;
      return curr;
    });
    showNote(`Herausforderung an ${opponentName} gesendet! ⚔️${stake > 0 ? ` Einsatz: ${stake} Punkte.` : ''}`);
  };

  const acceptBattleChallenge = (battle: any) => {
    setActiveBattleId(battle.id); setBattleQuestions(battle.questions); setBattleIndex(0); setBattleCorrects(0); setBattleTimeLeft(15); setIsAnswered(false); setSelectedAnswer(null); setBattleState('playing');
    battleElapsedRef.current = 0; battleQStartRef.current = Date.now(); setBattleElapsed(0);
  };

  const handleBattleAnswer = (idx: number) => {
    if (isAnswered) return;
    clearInterval(battleTimerRef.current);
    stopBattleClock();
    const bq = battleQuestions[battleIndex];
    const isRight = idx === bq.correct;
    const totalCorrect = battleCorrects + (isRight ? 1 : 0);
    // Echte Katalog-Fragen zählen auch im Battle für den Lernstand (Foto-Fragen nicht)
    if (bq && typeof bq.id === 'number' && !bq.imageKey) {
      const cat = bq.examGroup ? (bq.examGroup === 'ZP' ? 'Zwischenprüfungen' : 'Abschlussprüfungen') : bq.category;
      if (cat) recordAnsweredQuestion(cat, bq.level || 'easy', bq.id, isRight);
    }
    setSelectedAnswer(idx); setIsAnswered(true);
    setBattleCorrects(totalCorrect);
    // Der aktuelle Stand wird mitgegeben, sonst würde die letzte Antwort nicht mitgezählt
    window.setTimeout(() => nextBattleQuestion(totalCorrect), 1500);
  };

  const nextBattleQuestion = (totalCorrect: number) => {
    if (battleIndex + 1 < battleQuestions.length) {
      setBattleIndex(prev => prev + 1); setBattleTimeLeft(15); setSelectedAnswer(null); setIsAnswered(false);
      battleQStartRef.current = Date.now();
    } else {
      const currentUsrKey = username.toLowerCase();
      const myTime = Math.max(100, Math.round(battleElapsedRef.current));
      setBattleElapsed(myTime);
      mutateCloudData((curr) => {
        if (!curr.battles || !activeBattleId || !curr.battles[activeBattleId]) return curr;
        const b = curr.battles[activeBattleId];
        if (b.challengerKey === currentUsrKey) { b.challengerScore = totalCorrect; (b as any).challengerTime = myTime; }
        else { b.opponentScore = totalCorrect; (b as any).opponentTime = myTime; }
        settleBattle(b);
        awardBattlePoints(curr, b);
        return curr;
      });
      setBattleState('waiting');
    }
  };

  const getAnsweredIds = (cat: string, level: string): number[] => {
    try {
      const userProg = (cloudData.progress || {})[username.toLowerCase()] || {};
      return Array.isArray(userProg[`${cat}_${level}`]) ? userProg[`${cat}_${level}`] : [];
    } catch { return []; }
  };

  // Eine Antwort im Lernstand eintragen (gemeistert, Fehler-Stapel, Richtig/Falsch-Zähler)
  const applyAnswer = (curr: CloudPayload, userKey: string, cat: string, level: string, questionId: number, isCorrect: boolean) => {
    if (!curr.progress[userKey]) curr.progress[userKey] = { _displayName: username };
    const key = `${cat}_${level}`;
    const existing: number[] = Array.isArray(curr.progress[userKey][key]) ? curr.progress[userKey][key] : [];
    if (isCorrect && !existing.includes(questionId)) curr.progress[userKey][key] = [...existing, questionId];
    if (!curr.progress[userKey].wrongStats) curr.progress[userKey].wrongStats = {};
    if (!isCorrect) curr.progress[userKey].wrongStats[questionId] = (curr.progress[userKey].wrongStats[questionId] || 0) + 1;
    else if (curr.progress[userKey].wrongStats[questionId]) {
      curr.progress[userKey].wrongStats[questionId] = Math.max(0, curr.progress[userKey].wrongStats[questionId] - 1);
      if (curr.progress[userKey].wrongStats[questionId] === 0) delete curr.progress[userKey].wrongStats[questionId];
    }
    // Fehler-Stapel (Lernkurve): falsch → morgen wieder; richtig, wenn fällig → nach 3, 7 und 14 Tagen nochmal, dann gelernt
    const today = dayKey(new Date());
    const fs: Record<string, { l: number; d: string }> = { ...(curr.progress[userKey]._fehler || {}) };
    const entry = fs[questionId];
    if (!isCorrect) fs[questionId] = { l: 0, d: shiftDayKey(1) };
    else if (entry && String(entry.d) <= today) {
      const lvl = (Number(entry.l) || 0) + 1;
      if (lvl >= 4) {
        delete fs[questionId];
        const st = { ...(curr.progress[userKey]._stats || {}) };
        st.fehlerDone = (Number(st.fehlerDone) || 0) + 1;
        curr.progress[userKey]._stats = st;
      } else fs[questionId] = { l: lvl, d: shiftDayKey(lvl === 1 ? 3 : lvl === 2 ? 7 : 14) };
    }
    curr.progress[userKey]._fehler = fs;
    // Richtig/falsch pro Frage, für die Schwachstellen-Übersicht im Ausbilder-Bereich
    const qs: Record<string, number[]> = { ...(curr.progress[userKey]._qs || {}) };
    const cur = Array.isArray(qs[questionId]) ? qs[questionId] : [0, 0];
    qs[questionId] = isCorrect ? [(Number(cur[0]) || 0) + 1, Number(cur[1]) || 0] : [Number(cur[0]) || 0, (Number(cur[1]) || 0) + 1];
    curr.progress[userKey]._qs = qs;
  };

  const recordAnsweredQuestion = (cat: string, level: string, questionId: number, isCorrect: boolean) => {
    if (!username) return;
    const userKey = username.toLowerCase();
    const nowStr = new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
    mutateCloudData((curr) => {
      applyAnswer(curr, userKey, cat, level, questionId, isCorrect);
      curr.lastSeen[userKey] = { displayName: username, time: nowStr, timestamp: Date.now() };
      markLearnDay(curr, userKey, username);
      return curr;
    });
  };

  // ── Spielen zählt fürs Lernen: passende Katalog-Fragen zu einer Spiel-Antwort finden und abhaken ──
  const learnIndex = useMemo(() => {
    const m = new Map<string, any[]>();
    questions.forEach((q: any) => {
      if (!q || !q.product || typeof q.id !== 'number') return;
      (Object.keys(LEARN_PATTERNS) as LearnKind[]).forEach(kind => {
        if (LEARN_PATTERNS[kind].test(q.question)) {
          const k = `${kind}|${q.product}`;
          m.set(k, [...(m.get(k) || []), q]);
        }
      });
    });
    return m;
  }, [questions]);
  // Gibt zurück: Anzahl neu gemeisterter Fragen · 0 = schon gemeistert · -1 = keine passende Frage
  const learnFromGame = (items: LearnItem[]): number => {
    if (!username) return -1;
    const userKey = username.toLowerCase();
    const qs = items.flatMap(it => learnIndex.get(`${it.kind}|${it.product}`) || []);
    if (qs.length === 0) return -1;
    const done = correctIdSet((cloudDataRef.current.progress || {})[userKey] || {});
    const fresh = qs.filter(q => !done.has(q.id)).length;
    mutateCloudData((curr) => {
      qs.forEach(q => applyAnswer(curr, userKey, q.category, q.level || 'easy', q.id, true));
      markLearnDay(curr, userKey, username);
      return curr;
    });
    return fresh;
  };

  const saveScoreToLeaderboard = (finalScore: number, customCat?: string, allowZero = false) => {
    if (!username) return;
    const catName = customCat || currentQuizCategory || 'Quiz';
    if (isLeaderboardExcludedCategory(catName)) return;
    if (username.toLowerCase() === 'admin') return; // Ausbilder taucht nicht in der Bestenliste auf
    const userKey = username.toLowerCase();
    const nowStr = new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
    if (catName === 'Tages-Challenge') doneSet('daily', todayLocal());
    // Keine Einträge mit 0 oder Minuspunkten in der Bestenliste
    if (!Number.isFinite(finalScore) || finalScore < 0 || (finalScore === 0 && !allowZero)) return;
    // Serien-Bonus auf positive Punkte (Quiz Battle hat eigene Punkte)
    const mult = finalScore > 0 && catName !== 'Quiz Battle' ? streakMult : 1;
    const comboRaw = comboTake(finalScore);
    const comboExtra = finalScore > 0 && catName !== 'Quiz Battle' ? comboRaw : 0;
    setLastComboExtra(comboExtra);
    const withBonus = Math.round((finalScore + comboExtra) * mult);
    if (withBonus > finalScore && activeTab !== 'quiz') setToast(`${comboExtra > 0 ? `⚡ Combo-Bonus +${comboExtra}` : ''}${comboExtra > 0 && mult > 1 ? ' · ' : ''}${mult > 1 ? `🔥 Serien-Bonus ×${mult.toFixed(1).replace('.', ',')}` : ''}: ${withBonus} statt ${finalScore} Punkte!`);
    finalScore = withBonus;
    mutateCloudData((curr) => {
      curr.scores.push({ id: `${userKey}_${Date.now()}`, username, score: finalScore, date: nowStr, category: catName });
      markLearnDay(curr, userKey, username);
      curr.scores.sort((a, b) => b.score - a.score);
      return curr;
    });
  };

  // Ausbilder schickt ein Lob, das beim Mitarbeiter als Pop-up erscheint
  const sendPraise = (key: string, text: string) => {
    if (!isAdmin || !key) return;
    mutateCloudData((curr) => { const pr = curr.progress[key] || (curr.progress[key] = { _displayName: key }); pr._lob = { text, ts: Date.now() }; return curr; });
  };
  const lobDue: { text: string; ts: number } | null = (() => {
    if (!username || isAdmin) return null;
    const pr: any = (cloudData.progress || {})[username.toLowerCase()] || {};
    return pr._lob && Number(pr._lob.ts) > (Number(pr._lobSeen) || 0) ? pr._lob : null;
  })();
  const closeLob = () => { if (!username || !lobDue) return; const k = username.toLowerCase(); const ts = lobDue.ts; mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._lobSeen = ts; return curr; }); };

  // Ausbilder schenkt Punkte / Trinkgeld
  const adminGive = (key: string, pts: number, cents: number) => {
    if (!isAdmin || !key) return;
    const name = ((cloudData.progress || {})[key] || {})._displayName || key;
    mutateCloudData((curr) => {
      if (pts) { curr.scores.push({ id: `${key}_bonus_${Date.now()}`, username: name, score: pts, date: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }), category: 'Bonus vom Ausbilder' }); curr.scores.sort((a, b) => b.score - a.score); }
      if (cents) { const pr = curr.progress[key] || (curr.progress[key] = { _displayName: name }); pr._tipCents = Math.max(0, (Number(pr._tipCents) || 0) + cents); }
      return curr;
    });
  };

  // Theken-Simulator: Ergebnisse pro Thema beim Mitarbeiter speichern (für Stärken/Schwächen)
  const recordThekeResults = (results: { topic: string; ok: boolean }[]) => {
    if (!username || isAdmin || results.length === 0) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const st: Record<string, { ok: number; bad: number }> = { ...(curr.progress[k]._theke || {}) };
      results.forEach(r => {
        const e = st[r.topic] || { ok: 0, bad: 0 };
        st[r.topic] = { ok: (Number(e.ok) || 0) + (r.ok ? 1 : 0), bad: (Number(e.bad) || 0) + (r.ok ? 0 : 1) };
      });
      curr.progress[k]._theke = st;
      markLearnDay(curr, k, username);
      return curr;
    });
  };

  // Ausbildungsplan abhaken und Lehrjahr merken
  const toggleAzubiPlan = (id: string) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      const pl = { ...(pr._azubiPlan || {}) };
      if (pl[id]) delete pl[id]; else pl[id] = true;
      pr._azubiPlan = pl;
      return curr;
    });
  };
  const setAzubiLehrjahr = (n: number) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      pr._lehrjahr = n;
      return curr;
    });
  };

  // Trinkgeld aus dem Theken-Simulator dauerhaft speichern
  const addTip = (cents: number) => {
    if (!username || isAdmin || !(cents > 0)) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const pr = curr.progress[k];
      const today = dayKey(new Date());
      const used = pr._tipDay && pr._tipDay.d === today ? Number(pr._tipDay.c) || 0 : 0;
      const add = Math.max(0, Math.min(cents, TIP_DAY_CAP - used));
      if (add <= 0) return curr;
      pr._tipDay = { d: today, c: used + add };
      pr._tipCents = (Number(pr._tipCents) || 0) + add;
      return curr;
    });
  };
  // Trinkgeld-Laden: kaufen und anlegen
  const buyShopItem = (item: ShopItem) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      const balance = (Number(pr._tipCents) || 0) - (Number(pr._tipSpent) || 0);
      const owned: string[] = Array.isArray(pr._shopOwned) ? pr._shopOwned : [];
      const price = shopPrice(item);
      if (balance < price) return curr;
      if (item.kind !== 'joker' && owned.includes(item.id)) return curr;
      if (item.kind !== 'joker' && !inSeason(item)) return curr;
      pr._tipSpent = (Number(pr._tipSpent) || 0) + price;
      if (item.kind === 'joker') { const f = JOKER_FIELD[item.id]; pr[f] = (Number(pr[f]) || 0) + 1; }
      else { pr._shopOwned = [...owned, item.id]; if (item.kind === 'avatar') pr._avatar = item.icon; else if (item.kind === 'theme') pr._theme = item.id; else if (item.kind === 'effect') pr._effect = item.id; else pr._title = item.label; }
      return curr;
    });
  };
  const equipShopItem = (kind: 'avatar' | 'title' | 'theme' | 'effect', value: string | null) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      if (kind === 'avatar') pr._avatar = value || null; else if (kind === 'theme') pr._theme = value || null; else if (kind === 'effect') pr._effect = value || null; else pr._title = value || null;
      return curr;
    });
  };
  const applyJoker = (key: string, wrong: number[]) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    const n = Number((cloudData.progress?.[k] || {})._jokers) || 0;
    if (n <= 0 || wrong.length < 2) return;
    setJokerHide({ key, idx: shuffleArray([...wrong]).slice(0, 2) });
    mutateCloudData((curr) => {
      const pr = curr.progress[k];
      if (pr) pr._jokers = Math.max(0, (Number(pr._jokers) || 0) - 1);
      return curr;
    });
  };

  const spendJoker = (field: string) => {
    const k = username.toLowerCase();
    mutateCloudData((curr) => { const pr = curr.progress[k]; if (pr) pr[field] = Math.max(0, (Number(pr[field]) || 0) - 1); return curr; });
  };
  const applyTimeJoker = () => {
    if (!username || isAdmin || (Number(((cloudData.progress || {})[username.toLowerCase()] || {})._jokersTime) || 0) <= 0) return;
    setBattleTimeLeft(t => t + 10);
    spendJoker('_jokersTime');
  };
  const applySwapJoker = () => {
    if (!username || isAdmin || isAnswered) return;
    if ((Number(((cloudData.progress || {})[username.toLowerCase()] || {})._jokersSwap) || 0) <= 0) return;
    const cur = quizList[currentIndex]; if (!cur) return;
    const used = new Set(quizList.map(q => q.id));
    const same = questions.filter(q => !used.has(q.id) && q.category === cur.category && !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1));
    const pool = same.length ? same : questions.filter(q => !used.has(q.id));
    if (!pool.length) return;
    const next = shuffleQuestionOptions(shuffleArray(pool)[0]);
    setQuizList(list => list.map((q, i) => (i === currentIndex ? next : q)));
    setSelectedAnswer(null); setSelectedMulti([]); setJokerHide(null);
    spendJoker('_jokersSwap');
  };
  // Experten-Ecke: die schwersten Fragen, einmal am Tag, doppelte Punkte
  const EXPERT_MIN = 25;
  // Meister-Runde: für alle, die 100 % gemeistert haben, ohne Tageslimit, dreifache Punkte
  const launchMeisterRunde = () => {
    if (getUserMasteryPercent(username) < 100) return;
    setExamSim(false);
    const single = [...questions, ...examQs].filter(q => !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1));
    const hard = single.filter(q => q.level === 'hard');
    setCurrentQuizCategory('Meister-Runde'); setSelectedLevel('mixed');
    setQuizList(shuffleArray(hard.length >= 15 ? hard : single).slice(0, 15).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };
  const launchExpertQuiz = () => {
    setExamSim(false);
    if (getUserMasteryPercent(username) < EXPERT_MIN) { showNote(`Die Experten-Ecke öffnet sich, wenn du ${EXPERT_MIN} % aller Fragen gemeistert hast.`); return; }
    if (doneGet('expert', todayLocal())) { showNote('Die Experten-Ecke hast du heute schon gespielt. Morgen gibt es neue Fragen!'); return; }
    const stats: Record<string, [number, number]> = {};
    Object.values(cloudData.progress || {}).forEach((pr: any) => {
      const qs = (pr && pr._qs) || {};
      Object.keys(qs).forEach(id => { const v = qs[id]; if (!Array.isArray(v)) return; const e = stats[id] || [0, 0]; stats[id] = [e[0] + (Number(v[0]) || 0), e[1] + (Number(v[1]) || 0)]; });
    });
    const rate = (id: number) => { const e = stats[String(id)]; return e && e[0] + e[1] >= 3 ? e[1] / (e[0] + e[1]) : 0; };
    const single = questions.filter(q => !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1));
    const tough = single.filter(q => rate(q.id) >= 0.4);
    const hard = single.filter(q => q.level === 'hard' && !tough.includes(q));
    const pick = shuffleArray(tough).slice(0, 5);
    const list = [...pick, ...shuffleArray(hard).slice(0, 10 - pick.length)];
    doneSet('expert', todayLocal());
    setCurrentQuizCategory('Experten-Ecke'); setSelectedLevel('mixed');
    setQuizList(shuffleArray(list).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };

  // Lernpfad: 24 Felder, je 5 Fragen, ab 4 richtigen weiterziehen
  const PFAD = buildPfad(CATS);
  const launchPfad = (i: number) => {
    const f = PFAD[i]; if (!f) return;
    setExamSim(false); setPfadMsg('');
    const single = questions.filter(q => q.category === f.cat && !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1) && (f.level === 'mixed' || q.level === f.level));
    const done = correctIdSet((cloudData.progress || {})[username.toLowerCase()] || {});
    const fresh = single.filter(q => !done.has(q.id));
    const pool = [...shuffleArray(fresh), ...shuffleArray(single.filter(q => done.has(q.id)))].slice(0, 5);
    setCurrentQuizCategory(`Lernpfad · Feld ${f.no}`); setSelectedLevel('mixed');
    setQuizList(pool.map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };
  const finishPfad = (right: number) => {
    const m = String(currentQuizCategory || '').match(/^Lernpfad · Feld (\d+)/); if (!m) return;
    const no = Number(m[1]);
    const k = username.toLowerCase();
    const cur = Number(((cloudData.progress || {})[k] || {})._pfad) || 0;
    if (right >= 4 && no === cur + 1) {
      mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._pfad = Math.max(Number(pr._pfad) || 0, no); return curr; });
      const ms = PFAD[no - 1]?.milestone;
      setPfadMsg(no >= PFAD.length ? '👑 Ziel erreicht, du bist Brotmeister!' : ms ? `${ms.icon} Meilenstein: ${ms.title}! Weiter auf Feld ${no + 1}.` : `✓ Feld ${no} geschafft, weiter auf Feld ${no + 1}!`);
    } else if (no === cur + 1) setPfadMsg(`Diesmal ${right} von 5, ab 4 richtigen geht es weiter. Versuch es gleich nochmal!`);
  };
  // Glücksrad: einmal pro Woche
  const spinWheel = (extra: boolean): number => {
    if (!username || isAdmin) return -1;
    const k = username.toLowerCase();
    const prNow = (cloudData.progress || {})[k] || {};
    if (extra ? (Number(prNow._jokersSpin) || 0) <= 0 : prNow._wheel === weekIdNow()) return -1;
    const weights = [3, 3, 3, 3, 1, 2, 3, 3];
    let r = Math.random() * weights.reduce((a, b) => a + b, 0), idx = 0;
    for (; idx < weights.length; idx++) { r -= weights[idx]; if (r < 0) break; }
    idx = Math.min(idx, WHEEL.length - 1);
    const label = WHEEL[idx].label;
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      if (extra) pr._jokersSpin = Math.max(0, (Number(pr._jokersSpin) || 0) - 1); else pr._wheel = weekIdNow();
      if (label.includes('50:50')) pr._jokers = (Number(pr._jokers) || 0) + 1;
      else if (label.includes('Tausch')) pr._jokersSwap = (Number(pr._jokersSwap) || 0) + 1;
      else if (label.includes('Zeit')) pr._jokersTime = (Number(pr._jokersTime) || 0) + 1;
      else if (label.includes('€')) pr._tipCents = (Number(pr._tipCents) || 0) + (label.includes('2') ? 200 : 100);
      return curr;
    });
    const pts = label.match(/\+(\d+) Punkte/);
    if (pts) window.setTimeout(() => saveScoreToLeaderboard(Number(pts[1]), 'Glücksrad'), 4400);
    return idx;
  };

  // Stempelkarte: 10 Lerntage = volle Karte, feste Belohnung plus geheime Überraschung
  const claimStampCard = () => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    const pool = [
      { id: 'los2', icon: '🎫', text: '2 Rubbellose extra!' },
      { id: 'spin2', icon: '🎡', text: '2 Extra-Drehs am Glücksrad!' },
      { id: 'tip5', icon: '💰', text: '5 € extra Trinkgeld!' },
      { id: 'p300', icon: '⭐', text: '300 Extra-Punkte!' },
      { id: 'dbl2', icon: '✖️', text: '2 Doppelte-Punkte-Joker!' },
    ];
    const sur = pool[Math.floor(Math.random() * pool.length)];
    let ok = false;
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      const full = Math.floor((Number(pr._stamps) || 0) / 10);
      if (full <= (Number(pr._stampClaimed) || 0)) return curr;
      ok = true;
      pr._stampClaimed = (Number(pr._stampClaimed) || 0) + 1;
      pr._tipCents = (Number(pr._tipCents) || 0) + 300;
      if (sur.id === 'los2') pr._jokersLos = (Number(pr._jokersLos) || 0) + 2;
      if (sur.id === 'spin2') pr._jokersSpin = (Number(pr._jokersSpin) || 0) + 2;
      if (sur.id === 'tip5') pr._tipCents = (Number(pr._tipCents) || 0) + 500;
      if (sur.id === 'dbl2') pr._jokersDouble = (Number(pr._jokersDouble) || 0) + 2;
      return curr;
    });
    if (!ok) return;
    saveScoreToLeaderboard(500 + (sur.id === 'p300' ? 300 : 0), 'Stempelkarte');
    setStampPrize({ icon: sur.icon, text: sur.text });
  };

  // Rubbellos: Gewinn wird beim Öffnen gezogen und nach dem Freirubbeln gutgeschrieben
  const openLos = () => {
    if (!username || isAdmin || losPrize) return;
    const pr = (cloudData.progress || {})[username.toLowerCase()] || {};
    if ((Number(pr._jokersLos) || 0) <= 0) return;
    const prize = drawLosPrize();
    setLosPrize(prize);
    claimLos(prize);
  };
  function claimLos(prize: LosPrize) {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      if ((Number(pr._jokersLos) || 0) <= 0) return curr;
      pr._jokersLos = (Number(pr._jokersLos) || 0) - 1;
      pr._losCount = (Number(pr._losCount) || 0) + 1;
      if (prize.id === 'tip') pr._tipCents = (Number(pr._tipCents) || 0) + 200;
      if (prize.id === 'p5000') pr._secret = { ...(pr._secret || {}), glueck: 1 };
      if (prize.id === 'joker') { const f = ['_jokers', '_jokersSwap', '_jokersTime', '_jokersDouble', '_jokersSpin'][Math.floor(Math.random() * 5)]; pr[f] = (Number(pr[f]) || 0) + 1; }
      return curr;
    });
    if (prize.id === 'p50' || prize.id === 'p150' || prize.id === 'p5000') saveScoreToLeaderboard(prize.id === 'p50' ? 50 : prize.id === 'p150' ? 150 : 5000, 'Rubbellos');
  }


  // Produkt der Woche: alle Fragen zu einem Produkt, doppelte Punkte, einmal pro Woche
  const weekId = weekIdNow();
  const weekProduct = (() => {
    const counts: Record<string, number> = {};
    questions.forEach((q: any) => { if (q.product && !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1)) counts[q.product] = (counts[q.product] || 0) + 1; });
    const names = Object.keys(counts).filter(n => counts[n] >= 4).sort();
    if (!names.length) return null;
    const seed = weekId.split('-').reduce((a, x) => a * 31 + Number(x), 7);
    return names[seed % names.length];
  })();
  const weekProductDone = doneGet('wp', weekId);
  // „Neu im Sortiment“: Produkte, die der Ausbilder in den letzten 21 Tagen angelegt hat
  const freshProducts = newProductList.filter((p: any) => Date.now() - (Number(p.createdAt) || 0) < 21 * 864e5).map((p: any) => String(p.name));
  const launchNewProducts = () => {
    const pool = questions.filter((q: any) => q.product && freshProducts.includes(q.product));
    if (!pool.length) return;
    setExamSim(false);
    setCurrentQuizCategory('Neu im Sortiment'); setSelectedLevel('mixed');
    setQuizList(shuffleArray(pool).slice(0, 10).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };
  const launchWeekProduct = () => {
    if (!weekProduct) return;
    if (weekProductDone) { showNote('Das Produkt der Woche hast du diese Woche schon geschafft. Am Montag gibt es ein neues!'); return; }
    setExamSim(false);
    doneSet('wp', weekId);
    const pool = questions.filter((q: any) => q.product === weekProduct && !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1));
    setCurrentQuizCategory(`Produkt der Woche: ${weekProduct}`); setSelectedLevel('mixed');
    setQuizList(shuffleArray(pool).slice(0, 8).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };

  const recordGameResult = (kind: 'bilder' | 'allergen', right: number, total: number, recognized: string[] = []) => {
    if (!username || isAdmin || total <= 0) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const st = { ...(curr.progress[k]._stats || {}) };
      const of10 = Math.round((right / total) * 10);
      if (kind === 'bilder') {
        st.bilderBest = Math.max(Number(st.bilderBest) || 0, of10);
        st.bilderRight = (Number(st.bilderRight) || 0) + right;
        // Welche Produkte wurden schon am Foto erkannt?
        const prev: string[] = Array.isArray(curr.progress[k]._bilderOk) ? curr.progress[k]._bilderOk : [];
        curr.progress[k]._bilderOk = Array.from(new Set([...prev, ...recognized]));
      }
      else st.allergenBest = Math.max(Number(st.allergenBest) || 0, of10);
      curr.progress[k]._stats = st;
      markLearnDay(curr, k, username);
      return curr;
    });
  };

  // Bestwerte der neuen Spiele (Teurer oder billiger, Schneide-Profi)
  const recordStatBest = (key: 'priceBest' | 'sliceBest' | 'ansturmBest', value: number) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const st = { ...(curr.progress[k]._stats || {}) };
      st[key] = Math.max(Number(st[key]) || 0, value);
      curr.progress[k]._stats = st;
      markLearnDay(curr, k, username);
      return curr;
    });
  };

  // Adventskalender: Türchen beantworten (einmal pro Türchen)
  const answerAdvent = (day: number, ok: boolean, q: any) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    const year = String(new Date().getFullYear());
    const already = ((cloudDataRef.current.progress[k] || {})._advent || {})[year]?.[day];
    if (already) return;
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const adv = { ...(curr.progress[k]._advent || {}) };
      const y = { ...(adv[year] || {}) };
      if (!y[day]) y[day] = { ok, d: dayKey(new Date()), qid: q?.id };
      adv[year] = y;
      curr.progress[k]._advent = adv;
      markLearnDay(curr, k, username);
      return curr;
    });
    if (q && typeof q.id === 'number') recordAnsweredQuestion(q.category, q.level || 'easy', q.id, ok);
    if (ok) saveScoreToLeaderboard(adventPoints(day), 'Adventskalender 🎄');
  };

  // Frage melden: landet beim Ausbilder unter „Meldungen“
  // Auch aus allen Spielen: dann steht zusätzlich dabei, welches Spiel, was angezeigt wurde und welches Produkt
  const submitReport = (q: any, reason: string, text: string) => {
    if (!username || !q) return;
    const g: GameReport | undefined = q.__g;
    if (!g && q.id === undefined) return;
    const key = g ? reportKeyOf(g) : String(q.id);
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const rep = { ...(curr.progress[k]._reports || {}) };
      rep[key] = { r: reason, t: text.trim().slice(0, 300), d: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }), ts: Date.now(), ...(g ? { g: g.game, c: (g.text + (g.detail ? '\n' + g.detail : '')).slice(0, 700), ...(g.product ? { p: g.product } : {}) } : {}) };
      curr.progress[k]._reports = rep;
      return curr;
    });
  };

  // „Nur neue …“ in den Spielen: richtig Gelöstes merken (pro Spiel, in der Cloud)
  const markKnown = (game: string, keys: string[]) => {
    if (!username || keys.length === 0) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const kn: Record<string, string[]> = { ...(curr.progress[k]._known || {}) };
      const prev = Array.isArray(kn[game]) ? kn[game] : [];
      kn[game] = Array.from(new Set([...prev, ...keys]));
      curr.progress[k]._known = kn;
      return curr;
    });
  };

  // Einarbeitung: Punkte zum Abhaken (Gesundheitszeugnis usw.)
  const toggleOnboarding = (id: string, field: '_onboarding' | '_appWeek' = '_onboarding') => {
    if (!username) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const ob = { ...(curr.progress[k][field] || {}) };
      if (ob[id]) delete ob[id]; else ob[id] = dayKey(new Date());
      curr.progress[k][field] = ob;
      return curr;
    });
  };

  // Fragen für Bereich + Schwierigkeit; mit „Nur neue Fragen“ ohne die schon richtig beantworteten
  const quizPool = (level: string, onlyNewQs: boolean) => {
    let available = currentQuizCategory !== 'Alle'
      ? questions.filter(q => q.category === currentQuizCategory && (level === 'mixed' || level === 'all_at_once' ? true : q.level === level))
      : questions.filter(q => (level === 'mixed' || level === 'all_at_once' ? true : q.level === level));
    if (currentQuizCategory === 'Sortiment & Warenkunde' && selectedSubfilter !== 'all') {
      available = available.filter(q => matchesSortimentSubfilter(q, selectedSubfilter));
    }
    if (onlyNewQs) {
      const done = correctIdSet((cloudData.progress || {})[username.toLowerCase()] || {});
      available = available.filter(q => !done.has(q.id));
    }
    return available;
  };

  const launchQuizWithLevel = (level: string) => {
    const available = quizPool(level, onlyNew);
    if (available.length === 0) {
      showNote(onlyNew ? 'Super, hier hast du schon alle Fragen richtig beantwortet! 🎉 Schalte „Nur neue Fragen“ aus, um alles zu wiederholen.' : 'Hier gibt es leider keine Fragen.');
      return;
    }
    setExamSim(false);
    setSelectedLevel(level);
    const shuffled = shuffleArray(available);
    const sliceCount = level === 'all_at_once' ? shuffled.length : Math.min(8, shuffled.length);
    setQuizList(shuffled.slice(0, sliceCount).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
  };

  const launchDailyChallenge = () => {
    setExamSim(false);
    if (doneGet('daily', todayLocal())) {
      showNote("Du hast die Tages-Challenge heute bereits einmal absolviert! Komm morgen wieder für neue Punkte! 🌟");
      return;
    }
    setCurrentQuizCategory('Tages-Challenge'); setSelectedLevel('mixed');
    // Bis zu 2 der 5 Fragen sind Wiederholungen: was man vor ein paar Tagen falsch hatte (fällig im Fehler-Stapel)
    const prog: any = (cloudData.progress || {})[username.toLowerCase()] || {};
    const today = dayKey(new Date());
    const fs: Record<string, { l: number; d: string }> = prog._fehler || {};
    const dueIds = new Set(Object.keys(fs).filter(id => fs[id] && String(fs[id].d) <= today));
    const qsStats: Record<string, number[]> = prog._qs || {};
    const wrongBefore = new Set(Object.keys(qsStats).filter(id => Array.isArray(qsStats[id]) && Number(qsStats[id][1]) > 0 && Number(qsStats[id][1]) >= Number(qsStats[id][0])));
    const repeats = shuffleArray(questions.filter(q => dueIds.has(String(q.id)))).concat(shuffleArray(questions.filter(q => !dueIds.has(String(q.id)) && wrongBefore.has(String(q.id))))).slice(0, 2);
    const rest = shuffleArray(questions.filter(q => !repeats.includes(q))).slice(0, 5 - repeats.length);
    const shuffled = shuffleArray([...repeats, ...rest]).map(q => shuffleQuestionOptions(q));
    setQuizList(shuffled); setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
  };

  // Saison-Quiz: Bonusfragen zu den Produkten der aktuellen Saison (Punkte wie bei der Tages-Challenge)
  const seasonNow = seasonFor(new Date());
  const seasonPool = seasonNow ? questions.filter((q: any) => q.product && seasonNow.products.includes(q.product)) : [];
  const launchSeasonQuiz = () => {
    if (!seasonNow || seasonPool.length < 4) return;
    setExamSim(false);
    setCurrentQuizCategory(`Saison-Quiz: ${seasonNow.title}`); setSelectedLevel('mixed');
    setQuizList(shuffleArray(seasonPool).slice(0, 8).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };

  // „Heute dran“: 5 Minuten persönlicher Plan aus fälligen Fehlern und den schwächsten Themen
  const heuteDone = doneGet('heute', dayKey(new Date()));
  const heutePlan = () => {
    const prog: any = (cloudData.progress || {})[String(username || '').toLowerCase()] || {};
    const ok = correctIdSet(prog);
    const today = dayKey(new Date());
    const fs: Record<string, { l: number; d: string }> = prog._fehler || {};
    const single = questions.filter(q => !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1));
    const due = shuffleArray(single.filter(q => fs[String(q.id)] && String(fs[String(q.id)].d) <= today)).slice(0, 3);
    const openAll = single.filter(q => !ok.has(q.id) && !due.includes(q));
    // Am Anfang lieber leichte Fragen, damit der Einstieg nicht frustriert
    const openEasy = openAll.filter(q => q.level === 'easy');
    const open = ok.size < 150 && openEasy.length >= 8 ? openEasy : openAll;
    const byCat: Record<string, number[]> = {};
    single.forEach(q => { const c = String(q.category || ''); if (!byCat[c]) byCat[c] = [0, 0]; byCat[c][1]++; if (ok.has(q.id)) byCat[c][0]++; });
    const weakCats = Object.keys(byCat).filter(c => byCat[c][0] < byCat[c][1]).sort((a, b) => byCat[a][0] / byCat[a][1] - byCat[b][0] / byCat[b][1]).slice(0, 2);
    const weak = shuffleArray(open.filter(q => weakCats.includes(String(q.category)))).slice(0, 8 - due.length);
    const fill = shuffleArray((open.length ? open : single).filter(q => !weak.includes(q) && !due.includes(q))).slice(0, 8 - due.length - weak.length);
    return { list: [...due, ...weak, ...fill], due: due.length, cats: weakCats };
  };
  const launchHeuteDran = () => {
    const plan = heutePlan();
    if (!plan.list.length) return;
    setExamSim(false);
    const firstToday = !doneGet('heute', dayKey(new Date()));
    doneSet('heute', dayKey(new Date()));
    if (username && !isAdmin && firstToday) { const hk = username.toLowerCase(); mutateCloudData((curr) => { const pr = curr.progress[hk] || (curr.progress[hk] = { _displayName: username }); pr._heuteCount = (Number(pr._heuteCount) || 0) + 1; return curr; }); }
    setCurrentQuizCategory('Heute dran'); setSelectedLevel('mixed');
    setQuizList(shuffleArray(plan.list).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };

  // Gezielt die Produkte üben, die im Zähler noch fehlen
  const launchProductQuiz = (names: string[]) => {
    const list = questions.filter((q: any) => names.includes(q.product) && !(Array.isArray(q.correctMulti) && q.correctMulti.length > 1));
    if (!list.length) return;
    setExamSim(false);
    setCurrentQuizCategory('Offene Produkte'); setSelectedLevel('mixed');
    setQuizList(shuffleArray(list).slice(0, 15).map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
    setActiveTab('quiz');
  };

  // Backkalender: passendes Produktfoto finden (genauer Name, sonst längster enthaltener Produktname)
  const BAKE_IMG_ALIAS: Record<string, string> = { 'Klassische Schwarzbrote & Stangen': 'Großes Vollkornschwarzbrot' };
  const bakeImg = (name: string): string => {
    if (BAKE_IMG_ALIAS[name] && productImages[productImageKey(BAKE_IMG_ALIAS[name])]) return productImages[productImageKey(BAKE_IMG_ALIAS[name])];
    const direct = productImages[productImageKey(name)];
    if (direct) return direct;
    const n = name.toLowerCase();
    const hit = SHOP_PRODUCTS.filter(p => n.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(n)).sort((a, b) => b.name.length - a.name.length).find(p => productImages[productImageKey(p.name)]);
    return hit ? productImages[productImageKey(hit.name)] : '';
  };

  // Fehler-Stapel: welche Fragen sind heute dran?
  const getFehlerInfo = () => {
    const prog = (cloudData.progress || {})[username.toLowerCase()] || {};
    const fs: Record<string, { l: number; d: string }> = prog._fehler || {};
    const ws: Record<string, number> = prog.wrongStats || {};
    const known = new Set(allFlashcards.map(q => String(q.id)));
    const today = dayKey(new Date());
    const inStack = Object.keys(fs).filter(k => known.has(k));
    const legacy = Object.keys(ws).filter(k => ws[k] > 0 && !fs[k] && known.has(k)); // alte Stolpersteine von vorher
    const due = [...inStack.filter(k => String(fs[k]?.d || '') <= today), ...legacy];
    const nextDay = inStack.map(k => String(fs[k]?.d || '')).filter(d => d > today).sort()[0] || '';
    return { due: due.map(Number), total: inStack.length + legacy.length, nextDay };
  };

  const launchPersonalWeaknessQuiz = () => {
    setExamSim(false);
    const info = getFehlerInfo();
    if (info.due.length === 0) {
      if (info.total === 0) showNote('Dein Fehler-Stapel ist leer, prima! 🎉 Falsch beantwortete Fragen landen automatisch hier.');
      else showNote(`Heute ist nichts fällig. ${info.total} Fragen warten im Stapel, die nächste kommt am ${info.nextDay.split('-').reverse().join('.')} wieder.`);
      return;
    }
    const pool = shuffleArray(allFlashcards.filter(q => info.due.includes(q.id))).slice(0, 10).map(q => shuffleQuestionOptions(q));
    setCurrentQuizCategory('Fehler-Stapel · Stolpersteine'); setSelectedLevel('mixed');
    setQuizList(pool); setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
  };

  const launchSonderverkaufTrainer = () => {
    setExamSim(false);
    const beratungsPool = shuffleArray(questions.filter(q => {
      const txt = (q.question + ' ' + q.explanation).toLowerCase();
      return (q.id >= 70 && q.id <= 77) || (q.id >= 298 && q.id <= 315) || txt.includes('empfehlen') || txt.includes('alternative') || txt.includes('ausverkauft');
    })).slice(0, 8).map(q => shuffleQuestionOptions(q));
    setCurrentQuizCategory('Alternativen & Sonderverkauf 🤝'); setSelectedLevel('mixed');
    setQuizList(beratungsPool); setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
  };

  const launchSpecificExam = (group: 'ZP' | 'AP', num?: number) => {
    setExamSim(false);
    let list = examQs.filter(q => q.examGroup === group);
    let title = group === 'ZP' ? 'Zwischenprüfung (Mix)' : 'Abschlussprüfung (Mix)';
    if (num) { list = list.filter(q => q.examNumber === num); title = list[0]?.examTitle || `${group} ${num}`; }
    else list = shuffleArray(list).slice(0, 10);
    setCurrentQuizCategory(title); setSelectedLevel('exam'); setExamSecondsLeft(900);
    setQuizList(list.map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
  };

  const retryWrongQuestions = () => {
    setExamSim(false);
    if (wrongQuestions.length === 0) return;
    const preparedList = shuffleArray(wrongQuestions).map(q => shuffleQuestionOptions(q));
    setCurrentQuizCategory('Wiederholung (Stolpersteine)');
    setSelectedLevel('mixed');
    setQuizList(preparedList);
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
  };

  const evaluateSubmission = (isCorrect: boolean, currentQ: any) => {
    let newScore = score;
    if (isExamMode) {
      if (isCorrect) { newScore += 10; setCorrectCount(prev => prev + 1); }
      else if (!wrongQuestions.some(q => q.id === currentQ.id)) setWrongQuestions(prev => [...prev, currentQ]);
    } else {
      const isDaily = currentQuizCategory === 'Tages-Challenge' || currentQuizCategory === 'Neu im Sortiment' || String(currentQuizCategory || '').startsWith('Saison-Quiz');
      const isExpert = currentQuizCategory === 'Experten-Ecke' || String(currentQuizCategory || '').startsWith('Produkt der Woche');
      const isMeisterR = currentQuizCategory === 'Meister-Runde';
      const easyPoints = isMeisterR ? 30 : isExpert ? 20 : isDaily ? 15 : 10;
      const hardPoints = isMeisterR ? 60 : isExpert ? 40 : isDaily ? 30 : 20;
      if (isCorrect) { newScore += (currentQ.level === 'easy' ? easyPoints : hardPoints); setCorrectCount(prev => prev + 1); }
      else {
        if (!isNewcomer) newScore -= (currentQ.level === 'easy' ? 10 : 15);
        if (!wrongQuestions.some(q => q.id === currentQ.id)) setWrongQuestions(prev => [...prev, currentQ]);
      }
    }
    setLastDelta(isExamMode || newScore === score ? null : newScore - score);
    setQuizRun(r => (isCorrect ? r + 1 : 0));
    setScore(newScore);
    const progCat = currentQ.examGroup ? (currentQ.examGroup === 'ZP' ? 'Zwischenprüfungen' : 'Abschlussprüfungen') : currentQ.category;
    recordAnsweredQuestion(progCat, currentQ.level || 'easy', currentQ.id, isCorrect);
    setIsAnswered(true);
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    const currentQ = quizList[currentIndex];
    const isMulti = Array.isArray(currentQ.correctMulti) && currentQ.correctMulti.length > 1;
    if (isMulti) {
      setSelectedMulti(selectedMulti.includes(index) ? selectedMulti.filter(i => i !== index) : [...selectedMulti, index]);
    } else if (examSim) {
      setSelectedAnswer(index); // erst merken, ausgewertet wird am Ende
    } else {
      setSelectedAnswer(index);
      evaluateSubmission(index === currentQ.correct, currentQ);
    }
  };

  const launchExamSimulation = (group: 'ZP' | 'AP') => {
    const list = shuffleArray(examQs.filter(q => q.examGroup === group)).slice(0, 20);
    setExamSim(true);
    setCurrentQuizCategory(group === 'ZP' ? 'Simulation Zwischenprüfung' : 'Simulation Abschlussprüfung');
    setSelectedLevel('exam'); setExamSecondsLeft(30 * 60);
    setQuizList(list.map(q => shuffleQuestionOptions(q)));
    setCurrentIndex(0); setScore(0); setQuizRun(0); setCorrectCount(0); setWrongQuestions([]); setSelectedAnswer(null); setSelectedMulti([]); setIsAnswered(false); setQuizFinished(false);
  };

  const finishExamSim = (finalCorrect: number) => {
    setQuizFinished(true);
    if (!username || isAdmin || quizList.length === 0) return;
    const pct = Math.round((finalCorrect / quizList.length) * 100);
    const group = String(currentQuizCategory || '').includes('Zwischen') ? 'ZP' : 'AP';
    const k = username.toLowerCase();
    { const pe = (((cloudData.progress || {})[k] || {})._exam || {})[group] || {}; const hh = ((((cloudData.progress || {})[k] || {})._examHist || {})[group] || []) as number[];
      setExamPrev({ last: typeof pe.last === 'number' ? pe.last : null, best: typeof pe.best === 'number' ? pe.best : null, hist: [...hh, pct].slice(-8) }); }
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      const eh = { ...(curr.progress[k]._examHist || {}) }; eh[group] = [...(Array.isArray(eh[group]) ? eh[group] : []), pct].slice(-8); curr.progress[k]._examHist = eh;
      const ex = { ...(curr.progress[k]._exam || {}) };
      const prev = ex[group] || {};
      ex[group] = { best: Math.max(Number(prev.best) || 0, pct), last: pct, date: dayKey(new Date()) };
      curr.progress[k]._exam = ex;
      const st = { ...(curr.progress[k]._stats || {}) };
      st.examBest = Math.max(Number(st.examBest) || 0, pct);
      curr.progress[k]._stats = st;
      markLearnDay(curr, k, username);
      return curr;
    });
  };

  // In der Simulation gibt es keine Lösung nach jeder Frage, erst am Ende
  const examSimNext = () => {
    const q = quizList[currentIndex];
    if (!q) return;
    const req: number[] = q.correctMulti || [q.correct];
    const multi = req.length > 1;
    const answered = multi ? selectedMulti.length > 0 : selectedAnswer !== null;
    const ok = multi
      ? [...selectedMulti].sort((a, b) => a - b).join(',') === [...req].sort((a, b) => a - b).join(',')
      : selectedAnswer === q.correct;
    const newCorrect = correctCount + (ok ? 1 : 0);
    if (ok) setCorrectCount(newCorrect);
    else setWrongQuestions(prev => prev.some(w => w.id === q.id) ? prev : [...prev, q]);
    if (answered) recordAnsweredQuestion(q.examGroup === 'ZP' ? 'Zwischenprüfungen' : 'Abschlussprüfungen', q.level || 'easy', q.id, ok);
    if (currentIndex + 1 < quizList.length) { setCurrentIndex(currentIndex + 1); setSelectedAnswer(null); setSelectedMulti([]); }
    else finishExamSim(newCorrect);
  };

  const submitMultiAnswer = () => {
    if (isAnswered || selectedMulti.length === 0) return;
    const currentQ = quizList[currentIndex];
    const required: number[] = currentQ.correctMulti || [currentQ.correct];
    const sortedSel = [...selectedMulti].sort((a, b) => a - b);
    const sortedReq = [...required].sort((a, b) => a - b);
    const isCorrect = sortedSel.length === sortedReq.length && sortedSel.every((val, idx) => val === sortedReq[idx]);
    evaluateSubmission(isCorrect, currentQ);
  };

  const handleResetMyProgress = () => {
    if (!confirm("Möchtest du deinen persönlichen Lernfortschritt wirklich komplett zurücksetzen? Alle gemeisterten Fragen, dein Fehler-Stapel und deine Serie werden gelöscht.")) return;
    const userKey = username.toLowerCase();
    overwriteCloudDataDirectly((curr) => {
      if (curr.progress && curr.progress[userKey]) curr.progress[userKey] = { _displayName: username, _pinSeen: curr.progress[userKey]._pinSeen, _onboarding: curr.progress[userKey]._onboarding, _role: curr.progress[userKey]._role, _ersteWocheFertig: curr.progress[userKey]._ersteWocheFertig };
      curr.tombstones = { ...(curr.tombstones || {}), progressReset: { ...(curr.tombstones?.progressReset || {}), [userKey]: Date.now() } };
      return curr;
    });
  };

  const getCategoryProgress = (cat: string) => {
    const validCatQuestions = cat === 'Alle' ? questions : questions.filter(q => q.category === cat);
    const total = validCatQuestions.length;
    if (total === 0) return { totalAnswered: 0, total: 0 };
    const validIds = new Set(validCatQuestions.map(q => q.id));
    const uniqueAnswered = new Set<number>();
    (cat === 'Alle' ? CATS : [cat]).forEach(c => {
      getAnsweredIds(c, 'easy').forEach(id => { if (validIds.has(id)) uniqueAnswered.add(id); });
      getAnsweredIds(c, 'hard').forEach(id => { if (validIds.has(id)) uniqueAnswered.add(id); });
    });
    return { totalAnswered: Math.min(total, uniqueAnswered.size), total };
  };

  // Stempelkarte einmalig neu starten (Version 2), damit niemand eine leere Karte mit „voll“ sieht
  const stampNeedsInit = !!username && !!(((cloudData as any).progress || {})[(username || '').toLowerCase()]) && !(((cloudData as any).progress || {})[(username || '').toLowerCase()] || {})._stampV2;
  useEffect(() => {
    if (!username || !cloudConnected || username.toLowerCase() === 'admin' || !stampNeedsInit) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => { const p2 = curr.progress[k]; if (!p2 || p2._stampV2) return curr; stampInit(p2, Array.isArray(p2._days) ? p2._days.filter((d: any) => typeof d === 'string') : []); return curr; });
  }, [username, cloudConnected, stampNeedsInit]);

  // Gemeisterte Fragen und Produkte (für „Das hast du dazugelernt“)
  // Nur Produkte zählen, zu denen es auch Fragen gibt, sonst bleibt der Zähler z. B. bei 136 von 139 hängen
  const productsWithQ = new Set(questions.map((q: any) => q.product).filter(Boolean));
  const albumNames = new Set(SHOP_PRODUCTS.filter(p => !['Sonstiges', 'Backmischung'].includes(p.group) && productsWithQ.has(p.name)).map(p => p.name));
  const productTotal = albumNames.size;
  const masteredState = () => masteredStateOf((cloudData.progress || {})[(username || '').toLowerCase()] || {});
  const bilderPoolSize = buildBilderPool(productImages).length;
  const allProdOf = (pr: any) => productTotal > 0 && masteredStateOf(pr).products.size >= productTotal;
  const allPhotoOf = (pr: any) => { if (bilderPoolSize < 4) return false; const ok = new Set(Array.isArray(pr._bilderOk) ? pr._bilderOk : []); return buildBilderPool(productImages).every(p => ok.has(productImageKey(p.name))); };
  function masteredStateOf(pr: any) {
    const valid = new Map(questions.map((q: any) => [q.id, q.product]));
    const ids = new Set<number>(); const products = new Set<string>();
    CATS.forEach(c => { [...(Array.isArray(pr[`${c}_easy`]) ? pr[`${c}_easy`] : []), ...(Array.isArray(pr[`${c}_hard`]) ? pr[`${c}_hard`] : [])].forEach((id: number) => { if (valid.has(id)) { ids.add(id); const pd = valid.get(id); if (pd && albumNames.has(pd)) products.add(pd); } }); });
    return { ids, products };
  }
  const getUserMasteryPercent = (targetUserKey?: string) => {
    const total = questions.length;
    if (total === 0) return 0;
    const uKey = (targetUserKey || username || '').toLowerCase();
    const userProgObj = (cloudData.progress || {})[uKey] || {};
    const validIds = new Set(questions.map(q => q.id));
    const uniqueAnswered = new Set<number>();
    CATS.forEach(cat => {
      const easyArr = Array.isArray(userProgObj[`${cat}_easy`]) ? userProgObj[`${cat}_easy`] : [];
      const hardArr = Array.isArray(userProgObj[`${cat}_hard`]) ? userProgObj[`${cat}_hard`] : [];
      [...easyArr, ...hardArr].forEach((id: number) => { if (validIds.has(id)) uniqueAnswered.add(id); });
    });
    return Math.min(100, Math.round((uniqueAnswered.size / total) * 100));
  };

  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('hinkel_favorites') || '[]'); } catch { return []; }
  });

  const toggleFavorite = (id: number) => {
    const updated = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updated);
    try { localStorage.setItem('hinkel_favorites', JSON.stringify(updated)); } catch {}
    if (username && !isAdmin) { const k = username.toLowerCase(); mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._fav = updated; return curr; }); }
  };
  // Gemerkte Karten aus der Cloud übernehmen (gleich auf allen Geräten)
  const cloudFav = username ? ((cloudData.progress || {})[username.toLowerCase()] || {})._fav : undefined;
  useEffect(() => { if (Array.isArray(cloudFav) && JSON.stringify(cloudFav) !== JSON.stringify(favorites)) setFavorites(cloudFav); // eslint-disable-next-line
  }, [JSON.stringify(cloudFav || null)]);

  // ── Punkte-Zähler, Seitenrichtung, App-Symbol und Foto-Platzhalter ──
  const scoreTarget = username ? (cloudData.scores || []).filter(s => s.username?.toLowerCase() === username.toLowerCase()).reduce((sum, s) => sum + (Number(s.score) || 0), 0) : 0;
  const shownScore = useCountUp(scoreTarget);
  const tipTarget = username ? (() => { const pr: any = ((cloudData as any).progress || {})[username.toLowerCase()] || {}; return Math.max(0, (Number(pr._tipCents) || 0) - (Number(pr._tipSpent) || 0)); })() : 0;
  const shownTip = useCountUp(tipTarget);
  const [wrSlide, setWrSlide] = useState(0);
  const [resOpen, setResOpen] = useState<number | null>(null);
  const [bootWait, setBootWait] = useState(true);
  const [stampPrize, setStampPrize] = useState<{ icon: string; text: string } | null>(null);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      try {
        if ((window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('lt-noanim')) return;
        const el = (e.target as HTMLElement)?.closest?.('button') as HTMLElement | null;
        if (!el || el.offsetHeight < 50 || el.closest('.lt-bag')) return;
        for (let i = 0; i < 9; i++) {
          const d = document.createElement('span'); d.className = 'lt-flour';
          const a = Math.random() * Math.PI * 2, r = 18 + Math.random() * 30;
          d.style.left = (e.clientX - 3) + 'px'; d.style.top = (e.clientY - 3) + 'px';
          d.style.setProperty('--fx', Math.cos(a) * r + 'px'); d.style.setProperty('--fy', (Math.sin(a) * r - 14) + 'px');
          const sz = 3 + Math.random() * 5; d.style.width = sz + 'px'; d.style.height = sz + 'px';
          document.body.appendChild(d); window.setTimeout(() => d.remove(), 800);
        }
      } catch { /* egal */ }
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);
  useEffect(() => { const t = window.setTimeout(() => setBootWait(false), 6000); return () => window.clearTimeout(t); }, []);
  useEffect(() => { setResOpen(null); }, [quizFinished]);
  const wrTouch = useRef<number | null>(null);
  const prevTabRef = useRef(activeTab);
  const tabDirRef = useRef<'l' | 'r' | 'u'>('u');
  if (prevTabRef.current !== activeTab) {
    const a = TAB_ORDER(prevTabRef.current), b = TAB_ORDER(activeTab);
    tabDirRef.current = b > a ? 'r' : b < a ? 'l' : 'u';
    prevTabRef.current = activeTab;
  }
  const [reportQ, setReportQ] = useState<any>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportText, setReportText] = useState<string>('');
  const reportSentRef = useRef<(() => void) | null>(null);
  const [toast, setToast] = useState<string>('');
  // Monatsmeister: einmalig Abzeichen und 2 € Trinkgeld
  useEffect(() => {
    if (!username || username.toLowerCase() === 'admin' || !cloudConnected || isSyncing) return;
    const k = username.toLowerCase();
    const ch = monthChampions((cloudData.scores || []) as any);
    if (!ch.length || ch[0].month !== prevMonthKey() || ch[0].key !== k) return;
    const pr = (cloudData.progress || {})[k] || {};
    if (Array.isArray(pr._meister) && pr._meister.includes(ch[0].month)) return;
    mutateCloudData((curr) => { const p2 = curr.progress[k] || (curr.progress[k] = { _displayName: username }); const m: string[] = Array.isArray(p2._meister) ? p2._meister : []; if (!m.includes(ch[0].month)) { p2._meister = [...m, ch[0].month]; p2._tipCents = (Number(p2._tipCents) || 0) + 200; } return curr; });
    setToast(`👑 Du bist Monatsmeister ${monthLabel(ch[0].month)}! +2,00 € Trinkgeld.`);
  }, [username, cloudConnected, isSyncing, (cloudData.scores || []).length]);
  // Stand beim Quiz-Start merken, um am Ende den Lernfortschritt zu zeigen
  useEffect(() => {
    if (!quizList.length) { setMasteryStart(null); return; }
    const m = masteredState(); setMasteryStart({ ids: m.ids.size, products: m.products.size }); comboReset();
  }, [quizList]);
  // Glücksrad wieder bereit: einmal pro Woche Bescheid geben
  useEffect(() => {
    if (!username || username.toLowerCase() === 'admin' || !cloudConnected || isSyncing) return;
    const pr = (cloudData.progress || {})[username.toLowerCase()] || {};
    if (pr._wheel === weekIdNow() || !pr._role || (!pr._intro && (Array.isArray(pr._days) ? pr._days.length : 0) < 3)) return;
    if (pr._login?.d !== dayKey(new Date())) return; // erst nach der Anmelde-Belohnung
    const key = `lt_wheel_note_${username.toLowerCase()}`;
    try { if (localStorage.getItem(key) === weekIdNow()) return; } catch { return; }
    const t = window.setTimeout(() => { try { localStorage.setItem(key, weekIdNow()); } catch {} setToast(pr._wheel ? '🎡 Das Glücksrad ist wieder bereit! Dreh auf der Startseite.' : '🎡 Dein erstes Glücksrad wartet auf der Startseite!'); }, 1500);
    return () => window.clearTimeout(t);
  }, [username, cloudConnected, isSyncing, (cloudData.progress || {})[username.toLowerCase()]?._wheel, (cloudData.progress || {})[username.toLowerCase()]?._intro, (cloudData.progress || {})[username.toLowerCase()]?._login?.d, (cloudData.progress || {})[username.toLowerCase()]?._role]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), toast.length > 70 ? 5500 : 3200); return () => window.clearTimeout(t); }, [toast]);
  // Hinweise als Einblendung statt Browser-Fenster („Die Seite sagt …“)
  function showNote(m: string) { setToast(m); }
  const [adventPreview, setAdventPreview] = useState<boolean>(false);
  // Animationen ein- und ausschalten (gilt nur auf diesem Gerät)
  const [skyOn, setSkyOn] = useState<boolean>(() => { try { return localStorage.getItem('hinkel_sky') === '1'; } catch { return false; } });
  const toggleSky = () => setSkyOn(v => { try { localStorage.setItem('hinkel_sky', v ? '0' : '1'); } catch {} return !v; });
  const [animOn, setAnimOn] = useState<boolean>(() => { try { return localStorage.getItem('hinkel_anim') !== '0'; } catch { return true; } });
  const toggleAnim = () => setAnimOn(v => { const n = !v; try { localStorage.setItem('hinkel_anim', n ? '1' : '0'); } catch {} return n; });
  useEffect(() => { document.documentElement.classList.toggle('lt-noanim', !animOn); }, [animOn]);
  const myMarkise = username ? String(((cloudData.progress || {})[username.toLowerCase()] || {})._markise || '') : '';
  useEffect(() => { PT_SHOP.filter(x => x.kind === 'markise').forEach(x => document.documentElement.classList.toggle(`lt-${x.id}`, myMarkise === x.id)); }, [myMarkise]);

  // Wochenrückblick: Wer in der Woche davor noch nichts gemacht hat, bekommt keinen leeren Rückblick
  useEffect(() => {
    if (!username || username.toLowerCase() === 'admin' || !cloudConnected) return;
    const k = username.toLowerCase();
    const prog = (cloudData.progress || {})[k];
    if (!prog) return;
    const thisWeek = dayKey(mondayOf(new Date()));
    if (prog._weekSeen === thisWeek) return;
    const monday = mondayOf(new Date()).getTime();
    const days: string[] = Array.isArray(prog._days) ? prog._days : [];
    const hadBefore = days.some(d => new Date(d + 'T12:00:00').getTime() < monday) || (cloudData.scores || []).some(sc => sc.username?.toLowerCase() === k && (parseBonDate(sc.date)?.getTime() || Infinity) < monday);
    if (!hadBefore) {
      const mastered = correctIdSet(prog).size;
      mutateCloudData((curr) => {
        if (!curr.progress[k]) return curr;
        curr.progress[k]._weekSeen = thisWeek;
        curr.progress[k]._weekSnap = { w: thisWeek, m: mastered };
        return curr;
      });
    }
  }, [username, cloudConnected, cloudData.progress?.[username.toLowerCase()]?._weekSeen]);

  // Fotos blenden weich ein; solange sie laden, schimmert ein Platzhalter
  useEffect(() => {
    const mark = (e: Event) => { const el = e.target as HTMLElement; if (el && el.tagName === 'IMG') el.classList.add('lt-loaded'); };
    document.addEventListener('load', mark, true);
    document.addEventListener('error', mark, true);
    return () => { document.removeEventListener('load', mark, true); document.removeEventListener('error', mark, true); };
  }, []);

  // „Auf den Startbildschirm“: Hinkel-Symbol, Name und Vollbild, ohne extra Dateien
  useEffect(() => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const make = (size: number) => {
            const c = document.createElement('canvas');
            c.width = c.height = size;
            const x = c.getContext('2d');
            if (!x) return '';
            x.fillStyle = LT.yellow; x.fillRect(0, 0, size, size);
            x.imageSmoothingEnabled = true; (x as any).imageSmoothingQuality = 'high';
            const box = size * 0.7, r = img.width / img.height;
            const w = r > 1 ? box : box * r, h = r > 1 ? box / r : box;
            x.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
            return c.toDataURL('image/png');
          };
          const i180 = make(180), i192 = make(192), i512 = make(512);
          if (!i180) return;
          const setTag = (sel: string, create: () => HTMLElement, apply: (el: any) => void) => {
            let el = document.head.querySelector(sel) as any;
            if (!el) { el = create(); document.head.appendChild(el); }
            apply(el);
          };
          const link = (rel: string) => () => { const l = document.createElement('link'); l.rel = rel; return l; };
          const meta = (name: string) => () => { const m = document.createElement('meta'); m.name = name; return m; };
          setTag('link[rel="apple-touch-icon"]', link('apple-touch-icon'), el => { el.href = i180; });
          setTag('link[rel="icon"]', link('icon'), el => { el.href = i192; el.type = 'image/png'; });
          setTag('meta[name="theme-color"]', meta('theme-color'), el => { el.content = LT.brown; });
          setTag('meta[name="apple-mobile-web-app-capable"]', meta('apple-mobile-web-app-capable'), el => { el.content = 'yes'; });
          setTag('meta[name="mobile-web-app-capable"]', meta('mobile-web-app-capable'), el => { el.content = 'yes'; });
          setTag('meta[name="apple-mobile-web-app-title"]', meta('apple-mobile-web-app-title'), el => { el.content = 'Lern-Theke'; });
          setTag('meta[name="apple-mobile-web-app-status-bar-style"]', meta('apple-mobile-web-app-status-bar-style'), el => { el.content = 'default'; });
          // auf GitHub Pages liegt die App im Unterordner /Hinkel-lern-theke/
          const origin = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
          const manifest = {
            name: 'Hinkel Lern-Theke', short_name: 'Lern-Theke', description: 'Lernen, spielen und Wissen auffrischen, für alle Brotfreunde.',
            start_url: origin, scope: origin, display: 'standalone', orientation: 'any',
            background_color: LT.cream, theme_color: LT.brown,
            icons: [
              { src: i192, sizes: '192x192', type: 'image/png' },
              { src: i512, sizes: '512x512', type: 'image/png', purpose: 'any' },
              { src: i512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          };
          const url = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
          document.head.querySelectorAll('link[rel="manifest"]').forEach(l => l.parentNode?.removeChild(l));
          const ml = document.createElement('link'); ml.rel = 'manifest'; ml.href = url; document.head.appendChild(ml);
          document.title = 'Hinkel Lern-Theke';
        } catch {}
      };
      img.src = HINKEL_LOGO;
    } catch {}
  }, []);

  // ── Abzeichen-Wertung: wann wurde welches Abzeichen erreicht? (für „wer war schneller“) ──
  const fachIdsAll = questions.filter(q => q.category === 'Fachwissen').map(q => q.id);
  const badgeStatsOf = (uKey: string): { count: number; at: number } => {
    const prog = (cloudData.progress || {})[uKey] || {};
    const ok = correctIdSet(prog);
    const fachPct = fachIdsAll.length ? Math.round((fachIdsAll.filter(id => ok.has(id)).length / fachIdsAll.length) * 100) : 0;
    const earned = computeBadges(prog, getUserMasteryPercent(uKey), fachPct, allProdOf(prog), allPhotoOf(prog)).filter(b => b.ok);
    const atMap = prog._badgesAt || {};
    const times = earned.map(b => Number(atMap[b.id]) || 0).filter(t => t > 0);
    return { count: earned.length, at: earned.length ? (times.length === earned.length ? Math.max(...times) : Number.MAX_SAFE_INTEGER) : 0 };
  };
  useEffect(() => {
    if (!username || username.toLowerCase() === 'admin' || !cloudConnected) return;
    const k = username.toLowerCase();
    const prog = (cloudData.progress || {})[k];
    if (!prog) return;
    const ok = correctIdSet(prog);
    const fachPct = fachIdsAll.length ? Math.round((fachIdsAll.filter(id => ok.has(id)).length / fachIdsAll.length) * 100) : 0;
    const atMap = prog._badgesAt || {};
    const missing = computeBadges(prog, getUserMasteryPercent(k), fachPct, allProdOf(prog), allPhotoOf(prog)).filter(b => b.ok && !atMap[b.id]).map(b => b.id);
    if (missing.length === 0) return;
    const now = Date.now();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) return curr;
      const at = { ...(curr.progress[k]._badgesAt || {}) };
      missing.forEach(id => { if (!at[id]) at[id] = now; });
      curr.progress[k]._badgesAt = at;
      return curr;
    });
  }, [username, cloudConnected, cloudData.progress]);

  // ── Überholt in der Bestenliste? (Gesamtpunkte, gilt auf diesem Gerät) ──
  const rankTable = (() => {
    const sums: Record<string, number> = {};
    (cloudData.scores || []).forEach(x => { if (!x?.username) return; const k = x.username.toLowerCase(); if (k === 'admin') return; sums[k] = (sums[k] || 0) + (Number(x.score) || 0); });
    Object.keys(sums).forEach(k => { sums[k] -= Number(((cloudData.progress || {})[k] || {})._ptsSpent) || 0; });
    return Object.entries(sums).sort((a, b) => b[1] - a[1]);
  })();
  const myRankIdx = rankTable.findIndex(([k]) => k === username.toLowerCase());
  const [overtaken, setOvertaken] = useState<{ by: string[]; place: number; gap: number } | null>(null);
  useEffect(() => {
    if (!username || isAdmin || !cloudConnected || isSyncing || myRankIdx < 0) return;
    const key = `lt_rank_${username.toLowerCase()}`;
    const above = rankTable.slice(0, myRankIdx).map(([k]) => k);
    let prev: { place: number; above: string[] } | null = null;
    try { prev = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
    try { localStorage.setItem(key, JSON.stringify({ place: myRankIdx + 1, above })); } catch {}
    if (!prev || !Array.isArray(prev.above)) return;
    const passers = above.filter(k => !prev!.above.includes(k));
    if (passers.length && myRankIdx + 1 > prev.place) {
      const names = passers.map(k => (cloudData.lastSeen || {})[k]?.displayName || (cloudData.progress || {})[k]?._displayName || k);
      const gap = Math.max(1, (rankTable[myRankIdx - 1]?.[1] || 0) - (rankTable[myRankIdx]?.[1] || 0) + 1);
      setOvertaken({ by: names, place: myRankIdx + 1, gap });
      if (activeTab !== 'scoreboard') setToast(`🏃💨 ${names.length === 1 ? `${names[0]} hat` : `${names.slice(0, 2).join(' und ')}${names.length > 2 ? ' und andere haben' : ' haben'}`} dich überholt! Jetzt Platz ${myRankIdx + 1}.`);
    }
  }, [username, cloudConnected, isSyncing, myRankIdx, rankTable.map(r => r[0]).join(',')]);

  // Hinweis, wenn der Ausbilder eine eigene Kundenfrage beantwortet hat (pro Antwort nur einmal)
  const kfNeu = isAdmin || !username ? [] : alleKundenfragen(cloudData.progress).filter(f => f.user === username.toLowerCase() && f.a && !f.seen);
  const kfNeuKey = kfNeu.map(f => f.id).join(',');
  useEffect(() => {
    if (!kfNeuKey || activeTab === 'kundenfragen') return;
    let shown: string[] = [];
    try { shown = JSON.parse(localStorage.getItem('hinkel_kf_hinweis') || '[]'); } catch {}
    const fresh = kfNeuKey.split(',').filter(id => !shown.includes(id));
    if (!fresh.length) return;
    try { localStorage.setItem('hinkel_kf_hinweis', JSON.stringify([...shown, ...fresh].slice(-50))); } catch {}
    setToast('💬 Der Ausbilder hat deine Kundenfrage beantwortet. Du findest die Antwort unter Nachschlagen → „Das hat ein Kunde gefragt“.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kfNeuKey]);
  // Lob von Kollegen: Punkte selbst gutschreiben, sobald ein neues Lob an mich da ist (siehe hilfen/team.ts)
  const lobNeu = isAdmin || !username ? [] : offeneLobPunkte(cloudData.progress, username.toLowerCase());
  const lobNeuKey = lobNeu.map(l => `${l.von}_${l.id}`).join(',');
  useEffect(() => {
    if (!lobNeuKey || !cloudConnected) return;
    mutateCloudData(lobPunkteGutschreiben(username.toLowerCase(), username, lobNeu));
    const l = lobNeu[0];
    setToast(lobNeu.length === 1 ? `${l.vonName} hat dich gelobt: „${l.t}“ (+10 Punkte)` : `Du wurdest ${lobNeu.length}-mal gelobt! (+${lobNeu.length * 10} Punkte)`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobNeuKey, cloudConnected]);
  if (!username) return <LoginScreen {...{ tempUsername, setTempUsername, adminPinInput, setAdminPinInput, adminEmail, setAdminEmail, setAdminLoginMsg, adminLoginMsg, setPinError, pinError, loginStep, setLoginStep, loginPin, setLoginPin, loginBusy, setLoginBusy, setLoginMsg, loginMsg, resetLogin, cloudUrl, fetchCloudData, cloudDataRef, savePin, finishLogin, bigFont, toggleBigFont, darkMode }} />;

  const overallPercent = getUserMasteryPercent(username);
  const myRank = getRankByPercentage(overallPercent);
  const myTotalScore = (cloudData.scores || []).filter(s => s.username?.toLowerCase() === username?.toLowerCase()).reduce((sum, s) => sum + (Number(s.score) || 0), 0);
  const ptsBalance = myTotalScore - (Number(((cloudData.progress || {})[(username || '').toLowerCase()] || {})._ptsSpent) || 0);
  const buyPtsItem = (it: PtItem, text?: string) => {
    if (!username || isAdmin || ptsBalance < it.price) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      const owned: string[] = Array.isArray(pr._ptsOwned) ? pr._ptsOwned : [];
      if (it.kind !== 'spruch' && owned.includes(it.id)) return curr;
      if (it.kind === 'spruch') { if (!text || (pr._spruch && pr._spruch.status === 'pending')) return curr; pr._spruch = { text: String(text).slice(0, 80), ts: Date.now(), status: 'pending', price: it.price }; }
      else { pr._ptsOwned = [...owned, it.id]; if (it.kind === 'gold') pr._gold = true; else if (it.kind === 'namecolor') { pr._nameColor = it.id; pr._gold = false; } else if (it.kind === 'frame') pr._frame = it.id; else if (it.kind === 'avatar') pr._avatar = it.icon; else if (it.kind === 'markise') pr._markise = it.id; }
      pr._ptsSpent = (Number(pr._ptsSpent) || 0) + it.price;
      return curr;
    });
    setToast(it.kind === 'spruch' ? '💬 Dein Spruch ist eingereicht. Sobald der Ausbilder ihn freigibt, sehen ihn alle einen Tag lang.' : `💎 ${it.label} gehört jetzt dir!`);
  };
  // ── Verkaufstipps und Kundenfragen (siehe hilfen/kollegen.ts) ──
  const sendTipp = (produkt: string, text: string) => {
    if (!username || isAdmin || !text.trim()) return;
    mutateCloudData(tippGeben(username.toLowerCase(), username, produkt, text));
    setToast('💡 Danke für deinen Tipp! Sobald der Ausbilder ihn freigibt, sehen ihn alle im Steckbrief.');
  };
  const equipPtsItem = (it: PtItem, on: boolean) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      if (it.kind === 'gold') pr._gold = on; else if (it.kind === 'namecolor') { pr._nameColor = on ? it.id : null; if (on) pr._gold = false; } else if (it.kind === 'frame') pr._frame = on ? it.id : null; else if (it.kind === 'avatar') pr._avatar = on ? it.icon : null; else if (it.kind === 'markise') pr._markise = on ? it.id : null;
      return curr;
    });
  };
  const customProducts = cloudData.customProducts || [];
  const activePinboard = cloudData.pinboard || null;
  const cloudScores = (cloudData.scores || []).filter(s => s.username?.toLowerCase() !== 'admin'); // Ausbilder nie in der Bestenliste
  const cloudProgress = cloudData.progress || {};
  const cloudLastSeen = cloudData.lastSeen || {};
  const cloudBattles = cloudData.battles || {};
  // Offene Duell-Einladungen (ich bin dran) → Schwerter-Animation unten bei „Spielen“
  const duelInvites = isAdmin || !username ? 0 : Object.values(cloudBattles).filter((b: any) => b && (
    ((b.status === 'pending' || b.status === 'waiting_opponent') && b.opponentKey === username.toLowerCase()) ||
    (b.status === 'waiting_challenger' && b.challengerKey === username.toLowerCase())
  )).length;

  const fehlerInfo = getFehlerInfo();
  const myWrongCount = fehlerInfo.total;
  const fehlerDue = fehlerInfo.due.length;

  const allKnownUserKeys = Array.from(new Set([...Object.keys(cloudLastSeen), ...Object.keys(cloudProgress), ...cloudScores.map((s: any) => s.username?.toLowerCase()).filter(Boolean)])).filter((k) => Boolean(k) && k !== 'admin');

  const fullBakingSchedule = JSON.parse(JSON.stringify(BASE_BAKING_SCHEDULE));
  customProducts.filter(p => p.targetArea === 'bake_day' && p.dayOfWeek).forEach(p => {
    if (fullBakingSchedule[p.dayOfWeek!]) fullBakingSchedule[p.dayOfWeek!].items.push({ name: p.name, type: p.group, info: p.info });
  });

  const fullSeasonalMap: Record<string, string[]> = JSON.parse(JSON.stringify(BASE_SEASONAL_MAP));
  customProducts.filter(p => p.targetArea === 'seasonal' && p.seasonKey).forEach(p => {
    if (!fullSeasonalMap[p.seasonKey!]) fullSeasonalMap[p.seasonKey!] = [];
    fullSeasonalMap[p.seasonKey!].push(`${p.name}: ${p.info}`);
  });

  // ── Werte für die Lern-Theke ──
  const userKeyLower = username.toLowerCase();
  const hourNow = new Date().getHours();
  const greeting = hourNow < 4 ? 'Hallo' : hourNow < 11 ? 'Guten Morgen' : hourNow < 18 ? 'Hallo' : 'Guten Abend';
  const todayLong = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const isDailyDone = doneGet('daily', todayLocal());
  // Ein klarer Hauptknopf auf der Startseite: das Wichtigste, was heute ansteht
  const heroKey = isAdmin ? '' : !heuteDone ? 'heute' : fehlerDue > 0 ? 'fehler' : !isDailyDone ? 'daily' : 'nochmal';
  const allProgress = getCategoryProgress('Alle');
  const catPercent = (cat: string) => {
    const p = getCategoryProgress(cat);
    return p.total > 0 ? Math.round((p.totalAnswered / p.total) * 100) : 0;
  };
  const myDays: string[] = Array.isArray((cloudProgress[userKeyLower] || {})._days) ? (cloudProgress[userKeyLower] || {})._days : [];
  const streak = computeStreak(myDays);
  const weekDots = (() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const k = dayKey(d);
      return { label, done: myDays.includes(k), isToday: k === dayKey(now), future: d > now && k !== dayKey(now) };
    });
  })();
  const nextMilestone = [3, 7, 14, 30, 60, 100].find(m => m > streak.current) || null;
  const isMeister = !isAdmin && overallPercent >= 100;
  const meisterLeft = (() => { if (isAdmin || isMeister || overallPercent < 90) return 0; const tot = questions.length; return Math.max(1, Math.ceil(tot - (overallPercent / 100) * tot)); })();
  const streakToday = streak.learnedToday ? streak.current : streak.current + 1;
  const streakMult = isAdmin ? 1 : streakMultFor(streakToday);

  const goLernen = () => { setActiveTab('quiz'); setCurrentQuizCategory(null); setSelectedLevel(null); };

  // Einarbeitung & Abzeichen
  const myProg = cloudProgress[userKeyLower] || {};
  // Markise zeigt den echten Himmel über Düsseldorf: Tageszeit + aktuelles Wetter. Gekaufte Markise oder Farbthema haben Vorrang
  const skySky: { bg: string; bottom: string; dark: boolean } | null = (() => {
    if (!skyOn || myMarkise || myProg._theme) return null;
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    const c = weather ? weather.code : 0;
    const storm = c >= 95, snow = (c >= 71 && c <= 77) || c === 85 || c === 86, rain = (c >= 51 && c <= 67) || (c >= 80 && c <= 82);
    const fog = c === 45 || c === 48, overcast = c === 3, partly = c === 1 || c === 2;
    const night = h < 6 || h >= 20.5, dawn = h >= 6 && h < 8.5, dusk = h >= 17 && h < 20.5;
    let st = ['#3D8BE0', '#7DB9F0', '#CFE6F7'];
    if (night) st = storm || rain ? ['#0E1424', '#161D2E', '#1E2638'] : snow || fog || overcast ? ['#232A3D', '#2E354A', '#3A4258'] : ['#0B1840', '#1E2F6B', '#3B4C8C'];
    else if (storm) st = ['#2E2A3E', '#4A4560', '#6B6580'];
    else if (rain) st = ['#5B6B7E', '#7D8B9C', '#A3AEBB'];
    else if (snow) st = ['#B9C4D0', '#D8DFE7', '#F1F4F7'];
    else if (fog) st = ['#B8BDC2', '#CED2D5', '#E3E5E6'];
    else if (overcast) st = ['#8C9AAA', '#AAB6C2', '#C8D0D8'];
    else if (dawn) st = ['#6C8FD6', '#F2A6B5', '#FFD59A'];
    else if (dusk) st = ['#3B4A9A', '#D9677A', '#FFB25C'];
    else if (partly) st = ['#4C93DB', '#8CC0EE', '#D7EAF7'];
    return { bg: `linear-gradient(180deg, ${st[0]} 0%, ${st[1]} 55%, ${st[2]} 100%)`, bottom: st[2], dark: night || storm };
  })();
  const wxC = skyOn && weather ? weather.code : -1;
  const wxRain = wxC >= 0 && ((wxC >= 51 && wxC <= 67) || (wxC >= 80 && wxC <= 82) || wxC >= 95);
  const wxSnow = wxC >= 0 && ((wxC >= 71 && wxC <= 77) || wxC === 85 || wxC === 86);
  const wxSun = wxC >= 0 && wxC <= 1 && new Date().getHours() >= 8 && new Date().getHours() < 18;
  const isNewcomer = !isAdmin && (() => { const d = Array.isArray(myProg._days) ? [...myProg._days].sort() : []; if (!d.length) return true; return (Date.now() - new Date(String(d[0]) + 'T00:00:00').getTime()) < 7 * 864e5; })();
  const onLogoTap = () => {
    const now = Date.now();
    logoTaps.current = [...logoTaps.current.filter(t => now - t < 2500), now];
    if (logoTaps.current.length < 5) return;
    logoTaps.current = [];
    setBrezelRain(true); window.setTimeout(() => setBrezelRain(false), 4200);
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    if (((cloudData.progress || {})[k] || {})._egg) { setToast('🥨 Brezelregen! Du kennst das Geheimnis ja schon.'); return; }
    mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._egg = true; return curr; });
    setToast('🤫 Geheimnis entdeckt! Neues Abzeichen freigeschaltet.');
  };
  // Monatsmeister, Ostereier, Anmelde-Belohnung
  const champs = monthChampions((cloudData.scores || []) as any);
  // Jahresrückblick: im Dezember (und bis 10. Januar fürs Vorjahr)
  const yrNow = new Date();
  const reviewYear = yrNow.getMonth() === 11 ? yrNow.getFullYear() : (yrNow.getMonth() === 0 && yrNow.getDate() <= 10 ? yrNow.getFullYear() - 1 : 0);
  const yearData: YearData | null = (() => {
    if (!reviewYear || isAdmin || !username || activeTab !== 'jahr') return null;
    const k = username.toLowerCase();
    const pr: any = (cloudData.progress || {})[k] || {};
    const yy = String(reviewYear).slice(2);
    const sc = (cloudData.scores || []).filter(x => x.username?.toLowerCase() === k && new RegExp(`\\.${yy}(,|$)`).test(String(x.date || '')));
    const cnt: Record<string, number> = {};
    sc.forEach(x => { const c = String((x as any).category || ''); if (GAME_EMOJI[c] !== undefined && c !== 'Rubbellos' && c !== 'Glücksrad' && c !== 'Bonus vom Ausbilder') cnt[c] = (cnt[c] || 0) + (Number(x.n) || 1); });
    const fav = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const days = (Array.isArray(pr._days) ? pr._days : []).filter((d: string) => String(d).startsWith(String(reviewYear)));
    const ok = correctIdSet(pr);
    const fachPct = fachIdsAll.length ? Math.round((fachIdsAll.filter(id => ok.has(id)).length / fachIdsAll.length) * 100) : 0;
    const mastery = getUserMasteryPercent(k);
    const bs = computeBadges(pr, mastery, fachPct, allProdOf(pr), allPhotoOf(pr));
    let bw = 0; Object.values(cloudBattles || {}).forEach((b: any) => { if (!b || (b.challengerKey !== k && b.opponentKey !== k)) return; const w = battleWinnerSide(b); if (w && w !== 'tie' && ((w === 'challenger') === (b.challengerKey === k))) bw++; });
    const catPct = CATS.map((c: string) => { const qs = questions.filter((q: any) => q.category === c); return { c, p: qs.length ? qs.filter((q: any) => ok.has(q.id)).length / qs.length : 0 }; }).sort((a, b) => b.p - a.p)[0];
    return {
      year: reviewYear, name: pr._displayName || username, points: sc.reduce((a, x) => a + (Number(x.score) || 0), 0), rounds: sc.reduce((a, x) => a + (Number(x.n) || 1), 0), days: days.length,
      favGame: fav ? `${GAME_EMOJI[fav] || ''} ${fav.replace(/\s*\p{Extended_Pictographic}+$/u, '')}`.trim() : undefined,
      bestStreak: computeStreak(days).best, badges: bs.filter(b => b.ok).length, badgesTotal: bs.length,
      crowns: monthChampions((cloudData.scores || []) as any).filter(c => c.key === k && String((c as any).month || '').startsWith(String(reviewYear))).length,
      battlesWon: bw, mastery, topCat: catPct && catPct.p > 0 ? catPct.c : undefined,
    };
  })();

  // Profilseite (Tippen auf einen Namen in der Bestenliste)
  const profileData: ProfileData | null = (() => {
    if (activeTab !== 'profil' || !profileKey) return null;
    const k = profileKey;
    const pr: any = (cloudData.progress || {})[k] || {};
    const sc = (cloudData.scores || []).filter(x => x.username?.toLowerCase() === k);
    const gross = sc.reduce((a, x) => a + (Number(x.score) || 0), 0);
    const lv = levelFor(gross);
    const ok = correctIdSet(pr);
    const fachPct = fachIdsAll.length ? Math.round((fachIdsAll.filter(id => ok.has(id)).length / fachIdsAll.length) * 100) : 0;
    const mastery = getUserMasteryPercent(k);
    const cnt: Record<string, number> = {};
    sc.forEach(x => { const c = String((x as any).category || ''); if (GAME_EMOJI[c] !== undefined && c !== 'Rubbellos' && c !== 'Glücksrad') cnt[c] = (cnt[c] || 0) + (Number(x.n) || 1); });
    const fav = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const st = computeStreak(Array.isArray(pr._days) ? pr._days : []);
    const bt = { w: 0, l: 0, d: 0 };
    Object.values(cloudBattles || {}).forEach((b: any) => {
      if (!b || (b.challengerKey !== k && b.opponentKey !== k)) return;
      const w = battleWinnerSide(b); if (!w) return;
      if (w === 'tie') bt.d++; else if ((w === 'challenger') === (b.challengerKey === k)) bt.w++; else bt.l++;
    });
    const name = pr._displayName || sc[0]?.username || k;
    return {
      name, avatar: pr._avatar, avatarClass: pr._effect ? `lt-fx-${String(pr._effect).replace('fx_', '')}` : 'lt-emo-bob', nameClass: nameClassOf(pr), title: pr._title || undefined,
      levelNo: lv.no, levelTitle: lv.title, levelIcon: (lv as any).icon, points: Math.max(0, gross - (Number(pr._ptsSpent) || 0)), mastery,
      badges: computeBadges(pr, mastery, fachPct, allProdOf(pr), allPhotoOf(pr)), favGame: fav ? `${GAME_EMOJI[fav] || ''} ${fav.replace(/\s*\p{Extended_Pictographic}+$/u, '')}`.trim() : undefined,
      streak: st.current, bestStreak: st.best, crowns: monthChampions((cloudData.scores || []) as any).filter(c => c.key === k).length,
      battles: bt, isMe: k === String(username || '').toLowerCase(),
    };
  })();
  const lastChamp = champs.length && champs[0].month === prevMonthKey() ? champs[0] : null;
  const osterAktiv = osterZeit();
  const osterYear = String(new Date().getFullYear());
  const osterFound: string[] = myProg._ostern && myProg._ostern.y === osterYear && Array.isArray(myProg._ostern.e) ? myProg._ostern.e : [];
  const findOsterEi = (tab: string) => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    let all = false;
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      const o = pr._ostern && pr._ostern.y === osterYear && Array.isArray(pr._ostern.e) ? pr._ostern : { y: osterYear, e: [] };
      if (!o.e.includes(tab)) o.e = [...o.e, tab];
      pr._ostern = o;
      if (o.e.length >= OSTER_TABS.length) {
        const done: string[] = Array.isArray(pr._osternDone) ? pr._osternDone : [];
        if (!done.includes(osterYear)) { pr._osternDone = [...done, osterYear]; pr._tipCents = (Number(pr._tipCents) || 0) + 150; all = true; }
      }
      return curr;
    });
    const left = OSTER_TABS.length - osterFound.length - 1;
    setBrezelRain(false);
    setToast(all || left <= 0 ? '🐣 Alle Eier gefunden! +1,50 € Trinkgeld und ein neues Abzeichen.' : `🥚 Ei gefunden! Noch ${left} versteckt.`);
  };
  const introDue = !isAdmin && !!username && cloudConnected && !isSyncing && !!cloudProgress[userKeyLower] && !!myProg._role && !myProg._intro && (Array.isArray(myProg._days) ? myProg._days.length : 0) < 3;
  const finishIntro = () => {
    setShowIntro(false);
    if (!username || isAdmin) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._intro = true; return curr; });
  };
  const todayKeyLR = dayKey(new Date());
  const loginDue = !isAdmin && !!username && cloudConnected && !isSyncing && !!cloudProgress[userKeyLower] && !!myProg._role && !introDue && !showIntro && (myProg._login?.d !== todayKeyLR);
  const loginDay = (() => { const y = new Date(); y.setDate(y.getDate() - 1); if (y.getDay() === 0 && myProg._login?.d !== dayKey(y)) y.setDate(y.getDate() - 1); return myProg._login && myProg._login.d === dayKey(y) ? (Number(myProg._login.n) || 0) % 7 + 1 : 1; })(); // Sonntag zählt nicht als verpasst
  const claimLogin = () => {
    if (!username || isAdmin) return;
    const k = username.toLowerCase(); const day = loginDay;
    mutateCloudData((curr) => {
      const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username });
      if (pr._login && pr._login.d === todayKeyLR) return curr;
      pr._login = { d: todayKeyLR, n: day };
      pr._loginBest = Math.max(Number(pr._loginBest) || 0, day);
      pr._tipCents = (Number(pr._tipCents) || 0) + LOGIN_REWARDS[day - 1];
      if (day === 7) { const f = ['_jokers', '_jokersSwap', '_jokersTime', '_jokersDouble', '_jokersSpin'][Math.floor(Math.random() * 5)]; pr[f] = (Number(pr[f]) || 0) + 1; }
      return curr;
    });
  };
  const wheelReady = !isAdmin && !!username && myProg._wheel !== weekIdNow();
  const onboarding = onboardingStatus(myProg);
  const onboardingComplete = onboarding.done === onboarding.total;
  // Wer ist man? (neu, schon länger dabei, Azubi) – wird beim ersten Anmelden gefragt
  const myRole: StaffRole | undefined = ['neu', 'erfahren', 'azubi'].includes(myProg._role) ? myProg._role : undefined;
  // Erste Woche: aufgeräumte Startseite für Neue und Azubis, der Rest kommt nach und nach (oder per Knopf)
  const simpleStart = !isAdmin && (myRole === 'neu' || myRole === 'azubi') && !onboardingComplete && !myProg._fullStart && (Array.isArray(myProg._days) ? myProg._days.length : 0) < 7;
  const showFullStart = () => { if (!username) return; const k = username.toLowerCase(); mutateCloudData((curr) => { const pr = curr.progress[k] || (curr.progress[k] = { _displayName: username }); pr._fullStart = true; return curr; }); };
  const needRole = !isAdmin && cloudConnected && !!username && !myRole;
  // „Meine erste Woche“ nur für Neue, bis sie abgeschlossen ist
  // Sobald alles erledigt ist, verschwindet der Plan; der Theken-Führerschein kommt einmal als Pop-up
  // Azubis im 1. Lehrjahr sind auch neu im Betrieb: sie bekommen den Plan „Meine erste Woche bei Hinkel“
  const newcomerPlan = myRole === 'neu' || (myRole === 'azubi' && (Number(myProg._lehrjahr) || 1) <= 1 && !myProg._appWeekFertig);
  const showErsteWoche = !isAdmin && newcomerPlan && !myProg._ersteWocheFertig && !onboardingComplete;
  const showFuehrerschein = !isAdmin && newcomerPlan && !myProg._ersteWocheFertig && onboardingComplete;
  // „Meine erste Woche mit der App“: für alle anderen, die App in Ruhe kennenlernen; verschwindet, wenn alles erledigt ist
  const dailyEverDone = (cloudData.scores || []).some(sc => sc && String(sc.username).toLowerCase() === userKeyLower && sc.category === 'Tages-Challenge');
  const appWeek = appWeekStatus(myProg, dailyEverDone);
  const appWeekComplete = appWeek.done === appWeek.total;
  const showAppWeek = !isAdmin && !!myRole && !newcomerPlan && !myProg._appWeekFertig && !appWeekComplete;
  const showAppWeekDone = !isAdmin && !!myRole && !newcomerPlan && !myProg._appWeekFertig && appWeekComplete;
  const finishAppWeek = () => {
    if (!username) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      curr.progress[k]._appWeekFertig = dayKey(new Date());
      return curr;
    });
    if (activeTab === 'appwoche') setActiveTab('home');
  };
  const setMyRole = (r: StaffRole) => {
    if (!username) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      curr.progress[k]._role = r;
      return curr;
    });
  };
  const finishErsteWoche = () => {
    if (!username) return;
    const k = username.toLowerCase();
    mutateCloudData((curr) => {
      if (!curr.progress[k]) curr.progress[k] = { _displayName: username };
      curr.progress[k]._ersteWocheFertig = dayKey(new Date());
      return curr;
    });
    if (activeTab === 'einarbeitung') setActiveTab('home');
  };
  const badges = computeBadges(myProg, overallPercent, catPercent('Fachwissen'), allProdOf(myProg), allPhotoOf(myProg));
  const earnedBadges = badges.filter(b => b.ok);
  const seenBadges: string[] = Array.isArray(myProg._badgesSeen) ? myProg._badgesSeen : [];
  const newBadges = earnedBadges.filter(b => !seenBadges.includes(b.id));
  const markBadgesSeen = () => {
    const ids = earnedBadges.map(b => b.id);
    mutateCloudData((curr) => {
      if (!curr.progress[userKeyLower]) curr.progress[userKeyLower] = { _displayName: username };
      curr.progress[userKeyLower]._badgesSeen = ids;
      return curr;
    });
  };
  const myExam = myProg._exam || {};
  const myStats = myProg._stats || {};

  // Stufe aus den Punkten + Aufstiegs-Feier (einmal pro neuer Stufe)
  const myLevel = levelFor(myTotalScore);
  const shownLevel = levelFor(shownScore.value);
  const levelSeen = Number(myProg._levelSeen) || 1;
  const showLevelUp = !isAdmin && cloudConnected && myLevel.no > levelSeen && myLevel.no > 1;
  const markLevelSeen = () => {
    const no = myLevel.no;
    mutateCloudData((curr) => {
      if (!curr.progress[userKeyLower]) curr.progress[userKeyLower] = { _displayName: username };
      curr.progress[userKeyLower]._levelSeen = no;
      return curr;
    });
  };

  // Adventskalender: ab 1.12. offen, im November als Vorschau auf der Startseite
  const nowMonth = new Date().getMonth();
  const adventYear = String(new Date().getFullYear());
  const myAdvent: AdventDone = ((myProg._advent || {})[adventYear]) || {};
  const adventToday = nowMonth === 11 ? Math.min(new Date().getDate(), 24) : 0;
  const adventOpenNow = nowMonth === 11 ? Array.from({ length: adventToday }, (_, i) => i + 1).filter(d => !myAdvent[d]).length : 0;
  // Adventskalender: sichtbar ab 20. November bis Ende Dezember (Kachel und Spielen-Karte)
  const showAdventCard = (nowMonth === 10 && new Date().getDate() >= 20) || nowMonth === 11;
  const myReports: Record<string, any> = myProg._reports || {};
  // „⚑ Fehler melden“ in allen Spielen öffnet denselben Dialog wie im Quiz (nicht für den Ausbilder)
  setGameReporter(isAdmin || !username ? null : (r: GameReport, onSent: () => void) => {
    reportSentRef.current = onSent;
    setReportQ({ __g: r, id: r.qid, question: r.text });
    setReportReason(''); setReportText('');
  }, myReports);
  const myKnown: KnownMap = myProg._known || {};

  // ── Wochenrückblick (einmal pro Woche, am ersten Tag, an dem man sich anmeldet) ──
  const thisMonday = mondayOf(new Date());
  const thisWeekKey = dayKey(thisMonday);
  const lastMonday = new Date(thisMonday); lastMonday.setDate(lastMonday.getDate() - 7);
  const inLastWeek = (d: Date | null) => !!d && d >= lastMonday && d < thisMonday;
  const myScoresLastWeek = cloudScores.filter(sc => sc.username?.toLowerCase() === userKeyLower && inLastWeek(parseBonDate(sc.date)));
  const weekPoints = myScoresLastWeek.reduce((sum, sc) => sum + (Number(sc.score) || 0), 0);
  const weekDays = myDays.filter(d => inLastWeek(new Date(d + 'T12:00:00'))).length;
  const favCounts: Record<string, number> = {};
  myScoresLastWeek.forEach(sc => { const c = cleanCat(String(sc.category || 'Quiz')); favCounts[c] = (favCounts[c] || 0) + 1; });
  const favGame = Object.keys(favCounts).sort((a, b) => favCounts[b] - favCounts[a])[0] || '';
  const masteredNow = correctIdSet(myProg).size;
  const weekSnap = myProg._weekSnap && typeof myProg._weekSnap.m === 'number' ? myProg._weekSnap : null;
  const weekMastered = weekSnap ? Math.max(0, masteredNow - weekSnap.m) : null;
  const weakestCat = CATS.map(c => ({ c, p: catPercent(c) })).sort((a, b) => a.p - b.p)[0];
  const weekTip = fehlerDue > 0
    ? `In deinem Fehler-Stapel warten ${fehlerDue} ${fehlerDue === 1 ? 'Frage' : 'Fragen'}, damit startest du am besten.`
    : weakestCat ? `Nimm dir diese Woche „${weakestCat.c}“ vor, da hast du erst ${weakestCat.p} % geschafft.` : 'Weiter so!';
  const showWeekReview = !isAdmin && cloudConnected && myProg._weekSeen !== thisWeekKey && (weekDays > 0 || weekPoints > 0 || myDays.some(d => new Date(d + 'T12:00:00') < thisMonday));
  const closeWeekReview = () => {
    const m = masteredNow;
    mutateCloudData((curr) => {
      if (!curr.progress[userKeyLower]) curr.progress[userKeyLower] = { _displayName: username };
      curr.progress[userKeyLower]._weekSeen = thisWeekKey;
      curr.progress[userKeyLower]._weekSnap = { w: thisWeekKey, m };
      return curr;
    });
  };
  const learnableCount = new Set(Array.from(learnIndex.values()).flat().map((q: any) => q.id)).size;
  const goOnboardingTarget = (go?: string) => {
    if (go === 'fach') { setSpickArea('fach'); setSpickView(undefined); setActiveTab('flashcards'); }
    else if (go === 'bilder') setActiveTab('bilderquiz');
    else if (go === 'theke') setActiveTab('theke');
    else if (go === 'allergene') setActiveTab('allergene');
    else if (go === 'lernen') goLernen();
    else if (go === 'steckbriefe') { setSpickArea('produkt'); setSpickView(undefined); setActiveTab('flashcards'); }
    else if (go === 'bestenliste') { setActiveTab('scoreboard'); fetchCloudData(); }
    else if (go === 'daily') { setActiveTab('quiz'); launchDailyChallenge(); }
    else if (go === 'spielen') setActiveTab('spielen');
  };

  // Pop-up: neue Nachricht vom Ausbilder, pro Nachricht nur einmal (gespeichert in der Cloud beim Mitarbeiter)
  const myPinSeen = (cloudProgress[userKeyLower] || {})._pinSeen;
  const showPinPopup = !needRole && !introDue && !showIntro && !isAdmin && !!activePinboard && !!activePinboard.text && !!activePinboard.timestamp && myPinSeen !== activePinboard.timestamp;
  // Wichtige Nachricht: „Gelesen und verstanden“ im eigenen Fortschritt vermerken (siehe hilfen/team.ts)
  const pinGelesen = () => {
    if (!activePinboard || !activePinboard.pflicht || isAdmin || !username) return;
    mutateCloudData(gelesenBestaetigen(userKeyLower, username, activePinboard));
  };
  const markPinSeen = () => {
    if (!activePinboard) return;
    const ts = activePinboard.timestamp;
    mutateCloudData((curr) => {
      if (!curr.progress[userKeyLower]) curr.progress[userKeyLower] = { _displayName: username };
      curr.progress[userKeyLower]._pinSeen = ts;
      return curr;
    });
  };

  const GAME_TABS = ['spielen', 'ansturm', 'battle', 'kassenblitz', 'tueten', 'alternativen', 'theke', 'bilderquiz', 'allergene', 'preisduell', 'schneiden', 'advent'];
  const myRoleEarly = ((cloudData.progress || {})[username.toLowerCase()] || {})._role;
  const navItems = [
    { id: 'home', label: 'Start', icon: ICON.home, active: activeTab === 'home', action: () => setActiveTab('home'), mobile: true },
    { id: 'quiz', label: 'Lernen', icon: ICON.book, active: activeTab === 'quiz' || activeTab === 'pfad', action: goLernen, mobile: true },
    { id: 'spielen', label: 'Spielen', icon: ICON.game, active: GAME_TABS.includes(activeTab), action: () => setActiveTab('spielen'), mobile: true },
    { id: 'nachschlagen', label: 'Nachschlagen', icon: ICON.search, active: activeTab === 'nachschlagen' || activeTab === 'flashcards', action: () => setActiveTab('nachschlagen'), mobile: true },
    ...(myRoleEarly === 'azubi' || isAdmin ? [{ id: 'ausbildung', label: 'Ausbildung', icon: ICON.cap, active: activeTab === 'ausbildung', action: () => setActiveTab('ausbildung'), mobile: myRoleEarly === 'azubi' }] : []),
    { id: 'scoreboard', label: 'Bestenliste', icon: ICON.trophy, active: activeTab === 'scoreboard', action: () => { setActiveTab('scoreboard'); fetchCloudData(); }, mobile: true },
    ...(isAdmin ? [{ id: 'admin', label: 'Ausbilder', icon: ICON.sliders, active: activeTab === 'admin', action: () => { setActiveTab('admin'); fetchCloudData(); }, mobile: true }] : [])
  ];

  const isWidePage = activeTab === 'hilfe' || activeTab === 'kundenfragen' || activeTab === 'statistik' || activeTab === 'home' || activeTab === 'spielen' || activeTab === 'nachschlagen' || activeTab === 'scoreboard' || activeTab === 'flashcards' || activeTab === 'admin' || activeTab === 'ausbildung' || activeTab === 'pfad' || activeTab === 'album' || (activeTab === 'quiz' && currentQuizCategory === null);
  const examSection = (
          <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '32px' }}>Prüfungen</h2>
                  <div style={{ fontSize: '17px', color: LT.muted }}>{examQs.length} echte Prüfungsfragen</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '50px', padding: '0 16px', borderRadius: '14px', backgroundColor: examTimerEnabled ? TH.tintYellow : LT.cream, border: `2px solid ${LT.line}`, fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="checkbox" checked={examTimerEnabled} onChange={(e) => setExamTimerEnabled(e.target.checked)} style={{ width: '22px', height: '22px', accentColor: LT.brown }} />
                  15-Minuten-Timer
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  { group: 'ZP' as const, title: 'Zwischenprüfung', tint: '#F6EFE2', items: ['Rohstoffe, Getreide & Müllerei', 'Warenkunde Brot & Gebäck', 'Hygiene & Arbeitssicherheit', 'Verkaufskunde & Fachrechnen'] },
                  { group: 'AP' as const, title: 'Abschlussprüfung', tint: '#F6EFE2', items: ['Lebensmittelrecht & Leitsätze', 'Kalkulation & Fachrechnen', 'Verkauf, Reklamation & Marketing', 'Wirtschafts- & Sozialkunde'] }
                ].map(part => (
                  <div key={part.group} style={{ backgroundColor: part.tint, borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '19px', marginBottom: '4px' }}>{part.title}</div>
                    {part.items.map((label, i) => (
                      <button key={i} onClick={() => launchSpecificExam(part.group, i + 1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', minHeight: '54px', padding: '0 16px', borderRadius: '14px', border: 'none', backgroundColor: dc('#FFFFFF'), color: LT.ink, fontSize: '17px', fontWeight: 700, textAlign: 'left', cursor: 'pointer' }}>
                        <span>{part.group} {i + 1}: {label}</span><span style={{ color: LT.muted, whiteSpace: 'nowrap' }}>10 Fragen ›</span>
                      </button>
                    ))}
                    <button onClick={() => launchSpecificExam(part.group)} style={{ ...btnSecondary, minHeight: '54px', fontSize: '17px', marginTop: '4px' }}>10 zufällige Fragen üben</button>
                    <button onClick={() => launchExamSimulation(part.group)} style={{ ...btnPrimary, minHeight: '62px', fontSize: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <span>{part.title} simulieren</span>
                      <span style={{ fontSize: '14px', fontWeight: 400, opacity: 0.85 }}>20 Fragen · 30 Minuten · Note am Ende{myExam[part.group]?.best ? ` · Bestwert ${myExam[part.group].best} %` : ''}</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
  );

  return (
    <div className={darkMode ? 'lt-root lt-dark' : `lt-root${myProg._theme ? ` lt-${String(myProg._theme).replace('th_', 'th-')}` : ''}`} style={{ minHeight: '100vh', backgroundColor: LT.cream, color: LT.ink, paddingBottom: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', zoom: bigFont ? 1.15 : 1 }}>
      <style>{LT_CSS}</style>
      {bootWait && !cloudConnected && (typeof navigator === 'undefined' || navigator.onLine) && <div className="lt-boot" role="status"><img src={HINKEL_KUEKEN} alt="" className="lt-loaded lt-boot-kueken" style={{ height: '110px', width: 'auto' }} /><div className="lt-boot-bar" aria-hidden="true"><i /></div><strong style={{ fontSize: '18px', color: LT.brown }}>Frische Daten werden geholt …</strong></div>}

      {/* ── Gelbe Markise mit Logo ── */}
      <div style={{ width: '100%' }}>
        <div className={`${activeTab === 'home' ? 'lt-awning' : 'lt-awning lt-awning-sm'}${skySky ? ' lt-wx-on' : ''}`} style={{ position: 'relative', overflow: 'hidden', backgroundColor: LT.yellow, backgroundImage: 'linear-gradient(180deg, rgba(75,42,20,0.12) 0px, rgba(75,42,20,0) 18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'env(safe-area-inset-top)' }}>
          {skySky && <>
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: skySky.bg, pointerEvents: 'none' }} />
          </>}
          {skyOn && weather && (() => {
            const c = weather.code;
            const rain = (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95;
            const snow = (c >= 71 && c <= 77) || c === 85 || c === 86;
            const cloudy = (c >= 2 && c <= 3) || c === 45 || c === 48 || rain || snow;
            return (
              <>
                {cloudy && [0, 1, 2].map(i => <span key={'c' + i} aria-hidden="true" className="lt-cloud" style={{ top: `${2 + i * 24}%`, animationDuration: `${50 + i * 17}s`, animationDelay: `${-i * 19}s` }}><WxIcon kind={rain ? 'rain' : snow ? 'snow' : 'cloud'} size={i === 1 ? 46 : 58} /></span>)}
                {rain && <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,40,60,.25), rgba(30,40,60,.05))', pointerEvents: 'none' }} />}
                {rain && <><span aria-hidden="true" className="lt-raincloud" /></>}
                {rain && Array.from({ length: 30 }, (_, i) => <span key={'r' + i} aria-hidden="true" className={`lt-rain ${i % 3 === 0 ? 'lt-rain-near' : i % 3 === 1 ? 'lt-rain-far' : ''}`} style={{ left: `${(i * 37 + (i % 3) * 13) % 104}%`, animationDuration: `${(i % 3 === 0 ? 0.55 : i % 3 === 1 ? 0.95 : 0.75) + (i % 5) * 0.08}s`, animationDelay: `${-((i * 0.137) % 1.2)}s` }} />)}
                {snow && Array.from({ length: 40 }, (_, i) => <span key={'s' + i} aria-hidden="true" className="lt-snow" style={{ left: `${(i * 41) % 100}%`, fontSize: `${12 + (i % 4) * 4}px`, animationDuration: `${5 + (i % 4)}s`, animationDelay: `${-(i % 6)}s` }}>❄</span>)}
                {c >= 95 && <span aria-hidden="true" className="lt-flash" />}
              </>
            );
          })()}
          {skyOn && (!weather || weather.code < 3) && (() => {
            // Sonne oder Mond wandert mit der Uhrzeit über die Markise
            const h = new Date().getHours() + new Date().getMinutes() / 60;
            const day = h >= 6 && h < 18, dusk = h >= 18 && h < 21;
            const pos = day ? (h - 6) / 12 : dusk ? 0.9 + (h - 18) / 30 : ((h + 24 - 21) % 24) / 9;
            const night = !day && !dusk;
            return <>{night && Array.from({ length: 12 }, (_, i) => <span key={'st' + i} aria-hidden="true" className="lt-star" style={{ top: `${8 + ((i * 29) % 70)}%`, left: `${(i * 37 + 5) % 96}%`, fontSize: `${8 + (i % 3) * 4}px`, animationDelay: `${-(i % 6) * 0.4}s` }}>✦</span>)}<span aria-hidden="true" className="lt-sky" style={{ position: 'absolute', top: `${10 + Math.sin(Math.PI * Math.min(1, Math.max(0, pos))) * -6 + 6}px`, left: `${8 + Math.min(1, Math.max(0, pos)) * 84}%`, pointerEvents: 'none' }}><WxIcon kind={day ? 'sun' : dusk ? 'dusk' : 'moon'} size={40} /></span></>;
          })()}
          {wxSun && Array.from({ length: 9 }, (_, i) => <span key={'gl' + i} aria-hidden="true" className="lt-glint" style={{ top: `${10 + ((i * 31) % 72)}%`, left: `${(i * 41 + 7) % 94}%`, animationDelay: `${(i * 0.53) % 3}s` }}>✦</span>)}
          {seasonNow && seasonNow.deco.map((e, i) => (
            <span key={i} aria-hidden="true" className="lt-sway" style={{ position: 'absolute', top: i % 2 ? '52%' : '22%', [i < 2 ? 'left' : 'right']: i % 2 ? '14%' : '5%', fontSize: i % 2 ? '30px' : '40px', animationDelay: `${i * 0.4}s`, opacity: 0.95 } as any}>{e}</span>
          ))}
          <div className="lt-hdr-row">
            <div className="lt-hdr-left" style={{ gap: '6px', alignItems: 'center' }}>
              {skyOn && weather && <span className="lt-wxpill" title="Aktuelles Wetter in Düsseldorf"><WxIcon kind={wxKindOf(weather.code, new Date().getHours() + new Date().getMinutes() / 60)} size={26} />{weather.temp}°</span>}
            {!isAdmin && (
              <button onClick={() => setActiveTab('home')} className="lt-kasse lt-pill" title={`Stufe ${shownLevel.no}: ${shownLevel.title}`}>
                <LtIcon paths={['M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z']} size={17} width={2.2} />
                <span>{shownScore.value.toLocaleString('de-DE')}</span>
                
                {shownScore.delta && <span key={shownScore.delta.k} className="lt-float" aria-hidden="true" style={{ position: 'absolute', top: '-6px', right: '-6px', padding: '3px 9px', borderRadius: '999px', backgroundColor: LT.yellow, color: LT.ink, fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>+{shownScore.delta.v}</span>}
              </button>
            )}
            </div>
            <button onClick={() => setActiveTab('home')} aria-label="Zur Startseite" title="Zur Startseite" style={{ position: 'relative', zIndex: 1, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'block' }}>
              {skySky && <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '260%', height: '150%', transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,236,170,.85), rgba(255,236,170,0))', pointerEvents: 'none', zIndex: -1 }} />}
              <img className="lt-logo" onClick={(e) => { const el = e.currentTarget; el.classList.remove('lt-spin'); void el.offsetWidth; el.classList.add('lt-spin'); onLogoTap(); }} src={HINKEL_LOGO} alt="Bäckerei Hinkel, Die Bäckerei der Brotfreunde" style={{ width: 'auto', display: 'block' }} />
            </button>
            <div className="lt-hdr-pills lt-headbtns">
            {!isAdmin && (
              <button onClick={() => setShowTipShop(true)} className="lt-kasse lt-pill" title="Trinkgeld-Laden öffnen" aria-label={`Trinkgeld-Laden, in deiner Kasse ${tipEuro(Math.max(0, (Number(myProg._tipCents) || 0) - (Number(myProg._tipSpent) || 0)))}`}>
                <LtIcon paths={ICON.coins} size={17} width={2.2} />
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{tipEuro(shownTip.value)}</span>
                {shownTip.delta && <span key={'c' + shownTip.delta.k} className="lt-coinfly" aria-hidden="true">🪙</span>}
                {shownTip.delta && <span key={'f' + shownTip.delta.k} className="lt-float" aria-hidden="true" style={{ position: 'absolute', top: '-6px', right: '-6px', padding: '3px 9px', borderRadius: '999px', backgroundColor: LT.yellow, color: LT.ink, fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>+{tipEuro(shownTip.delta.v)}</span>}
                
              </button>
            )}
              <button onClick={() => setHdrMenu(true)} className="lt-pill lt-pill-round" aria-label="Menü: Schrift, App, Abmelden" aria-expanded={hdrMenu} title="Menü"><LtIcon paths={['M4 7h16', 'M4 12h16', 'M4 17h16']} size={20} width={2.4} /></button>
            </div>
          </div>
        </div>
        <div aria-hidden="true" style={{ position: 'relative', filter: 'drop-shadow(0 4px 0 rgba(75,42,20,0.12))' }}><div className="lt-awning-edge" style={{ position: 'relative', height: '20px', backgroundColor: skySky ? skySky.bottom : LT.yellow, WebkitMaskImage: 'radial-gradient(circle at 20px 0px, #000 20px, transparent 20.5px)', maskImage: 'radial-gradient(circle at 20px 0px, #000 20px, transparent 20.5px)', WebkitMaskSize: '40px 20px', maskSize: '40px 20px', WebkitMaskRepeat: 'repeat-x', maskRepeat: 'repeat-x' } as any}>{wxSnow && <span className="lt-snowcap" />}</div>
          {wxRain && Array.from({ length: 30 }, (_, i) => i % 2 ? null : <span key={'d' + i} className="lt-drip" style={{ left: `${i * 40 + 18}px`, animationDelay: `${((i * 7) % 11) * 0.27}s`, animationDuration: `${1.9 + (i % 4) * 0.35}s` }} />)}
        </div>
      </div>

      {hdrMenu && (
        <div onClick={() => setHdrMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 119, backgroundColor: 'rgba(31,20,12,.25)' }}>
          <div className="lt-menu-pop" role="menu" onClick={(e) => e.stopPropagation()}>
            <div className="lt-menu-who">{isAdmin ? 'Ausbilder-Modus' : username} · {isSyncing ? 'synchronisiert …' : cloudConnected ? 'online' : 'offline'}</div>
            <button role="menuitem" onClick={() => { toggleBigFont(); }} aria-pressed={bigFont}><span style={{ width: '24px', fontWeight: 800 }}>A+</span>{bigFont ? 'Normale Schrift' : 'Größere Schrift'}</button>
            {!isStandaloneApp && !installHidden && <button role="menuitem" onClick={() => { setHdrMenu(false); setShowInstallHelp(true); }}><LtIcon paths={ICON.phone} size={22} />Auf den Startbildschirm</button>}
            {!isAdmin && <button role="menuitem" onClick={() => { setHdrMenu(false); setActiveTab('statistik'); }}><LtIcon paths={ICON.medal} size={22} />Meine Statistik</button>}
            <button role="menuitem" onClick={() => { setHdrMenu(false); setActiveTab('hilfe'); }}><LtIcon paths={ICON.bulb} size={22} />So funktioniert die Lern-Theke</button>
            <button role="menuitem" onClick={() => { setHdrMenu(false); if (isAdmin) adminSignOut(); setUsername(''); setTempUsername(''); setAdminPinInput(''); setPinError(false); resetLogin(); setActiveTab('home'); localStorage.removeItem('hinkel_username'); }} style={{ color: '#B42318' }}><LtIcon paths={ICON.logout} size={22} />Abmelden</button>
          </div>
        </div>
      )}

      {/* ── Banner-Ankündigung vom Ausbilder ── */}
      {username && activePinboard && (activePinboard as any).banner && (!(activePinboard as any).until || dayKey(new Date()) <= String((activePinboard as any).until)) && bannerHidden !== String(activePinboard.timestamp || '') && (
        <div role="status" style={{ width: '92%', maxWidth: '1100px', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '18px', backgroundColor: dc('#B42318'), color: '#FFFFFF', boxShadow: '0 8px 20px -8px rgba(180,35,24,.6)' }}>
          <span aria-hidden="true" className="lt-emo-shake" style={{ fontSize: '26px' }}>📣</span>
          <span style={{ flex: 1, fontSize: '17px', fontWeight: 700, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{activePinboard.text}</span>
          <button onClick={() => { const v = String(activePinboard.timestamp || ''); setBannerHidden(v); try { localStorage.setItem('lt_banner_hidden', v); } catch {} }} aria-label="Banner ausblenden" style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,.2)', color: '#FFFFFF', fontSize: '18px', cursor: 'pointer', flex: '0 0 auto' }}>✕</button>
        </div>
      )}

      {/* ── Menü (Tablet/PC) ── */}
      <nav className="lt-desknav" aria-label="Hauptmenü" style={{ maxWidth: '1100px', width: '92%', marginTop: '18px', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {navItems.map(item => (
          <button key={item.id} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '50px', padding: '0 18px', borderRadius: '14px', border: item.active ? 'none' : `2px solid ${LT.line}`, backgroundColor: item.active ? LT.brown : dc('#FFFFFF'), color: item.active ? dc('#FFF6E0') : LT.ink, fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>
            {item.id === 'spielen' && duelInvites > 0
              ? <span style={{ position: 'relative', display: 'inline-flex' }}><DuelSwords size={26} /><DuelBadge n={duelInvites} /></span>
              : item.id === 'scoreboard' && overtaken ? <span className="lt-overtake-ic" aria-hidden="true" style={{ fontSize: '20px', lineHeight: 1 }}>😱</span> : <LtIcon paths={item.icon} size={20} />}{item.label}{item.id === 'scoreboard' && overtaken && <span className="lt-dot-pulse" aria-label="Du wurdest überholt" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D92D20', marginLeft: '2px' }} />}
          </button>
        ))}
      </nav>

      {username && offlineSince > 0 && !cloudConnected && !offlineDismissed && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px auto 0', maxWidth: '1100px', width: 'calc(100% - 24px)', padding: '6px 6px 6px 14px', borderRadius: '999px', backgroundColor: dc('#F4EADB'), color: LT.ink, fontSize: '15px', lineHeight: 1.35, boxSizing: 'border-box' }}>
          <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dc('#B54708'), flex: '0 0 auto' }} />
          <span style={{ flex: 1 }}><b>Offline</b> · Punkte werden gespeichert</span>
          <button onClick={() => setOfflineDismissed(true)} aria-label="Hinweis schließen" style={{ minWidth: '44px', minHeight: '44px', borderRadius: '999px', border: 'none', backgroundColor: 'transparent', color: LT.muted, fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      <main key={`${activeTab}-${activeTab === 'quiz' ? (currentQuizCategory === null ? 'o' : selectedLevel === null ? 'l' : quizFinished ? 'r' : 'q') : ''}`} className={`lt-page lt-dir-${tabDirRef.current}`} style={{ position: 'relative', maxWidth: isWidePage ? '1100px' : '760px', width: '92%', marginTop: '22px' }}>
      <Suspense fallback={<div role="status" style={{ padding: '48px 0', textAlign: 'center', color: LT.muted, fontSize: '17px' }}>Wird geladen …</div>}>

        {/* ═════════ STARTSEITE ═════════ */}
        {activeTab === 'home' && <HomeScreen pinGelesenAm={gelesenAm(cloudData.progress, userKeyLower, activePinboard)} onPinGelesen={pinGelesen} teamKarten={isAdmin ? null : <><UmfrageKarten cloudData={cloudData} username={username} mutateCloudData={mutateCloudData} /><LobKarte cloudData={cloudData} username={username} kollegen={allKnownUserKeys.map(k => ({ key: k, name: (cloudData.lastSeen || {})[k]?.displayName || (cloudData.progress || {})[k]?._displayName || k }))} mutateCloudData={mutateCloudData} setToast={setToast} /></>} {...{ username, fetchCloudData, todayDayNum, selectedBakeDay, setSelectedBakeDay, setShowBakingCalendar, showBakingCalendar, productImages, questions, azubiArea, examAllowed, isAdmin, team, setActiveTab, setSpickArea, setSpickView, setShowTipShop, setShowWheel, setCurrentQuizCategory, setSelectedSubfilter, setSelectedLevel, openLos, weekProduct, weekProductDone, freshProducts, launchNewProducts, launchWeekProduct, launchDailyChallenge, seasonNow, seasonPool, launchSeasonQuiz, heuteDone, launchHeuteDran, bakeImg, launchPersonalWeaknessQuiz, handleResetMyProgress, setToast, setAdventPreview, overallPercent, myRank, myTotalScore, activePinboard, cloudScores, cloudProgress, cloudLastSeen, myWrongCount, fehlerDue, fullBakingSchedule, userKeyLower, greeting, todayLong, isDailyDone, heroKey, allProgress, catPercent, myDays, streak, weekDots, nextMilestone, isMeister, meisterLeft, streakToday, streakMult, goLernen, myProg, reviewYear, lastChamp, osterAktiv, osterFound, wheelReady, onboarding, onboardingComplete, simpleStart, showFullStart, showErsteWoche, appWeek, showAppWeek, badges, earnedBadges, myLevel, shownLevel, nowMonth, adventOpenNow, showAdventCard, masteredNow }} />}

        {/* ═════════ SPIELE-AUSWAHL ═════════ */}
        {activeTab === 'spielen' && <SpielenSeite {...{ fetchCloudData, cloudData, isAdmin, setActiveTab, setBattleState, setAdventPreview, duelInvites, userKeyLower, myStats, nowMonth, adventOpenNow, showAdventCard }} />}

        {/* ═════════ NACHSCHLAGEN ═════════ */}
        {activeTab === 'nachschlagen' && <NachschlagenSeite kundenfragenNeu={kfNeu.length} {...{ openSeasons, setOpenSeasons, setActiveTab, setSpickArea, setSpickView, fullSeasonalMap }} />}

        {/* ═════════ LERNEN-ÜBERSICHT ═════════ */}
        {activeTab === 'quiz' && currentQuizCategory === null && <QuizCategories {...{ username, fetchCloudData, questions, isAdmin, setActiveTab, setPfadMsg, setCurrentQuizCategory, setSelectedSubfilter, setSelectedLevel, setBattleState, EXPERT_MIN, launchMeisterRunde, launchExpertQuiz, launchDailyChallenge, launchPersonalWeaknessQuiz, launchSonderverkaufTrainer, getCategoryProgress, overallPercent, myWrongCount, fehlerDue, isDailyDone, isMeister, meisterLeft, myProg, onboarding, showErsteWoche, appWeek, showAppWeek, nowMonth, learnableCount, examSection }} />}

        {/* ═════════ SCHWIERIGKEIT WÄHLEN ═════════ */}
        {activeTab === 'quiz' && currentQuizCategory !== null && selectedLevel === null && <QuizLevels {...{ questions, isAdmin, currentQuizCategory, setCurrentQuizCategory, selectedSubfilter, setSelectedSubfilter, onlyNew, toggleOnlyNew, quizPool, launchQuizWithLevel, overallPercent, myProg }} />}

        {/* ═════════ FRAGE ═════════ */}
        {activeTab === 'quiz' && selectedLevel !== null && quizList.length > 0 && !quizFinished && <QuizQuestion {...{ username, mutateCloudData, isAdmin, doubleOn, setDoubleOn, jokerHide, currentQuizCategory, setCurrentQuizCategory, setSelectedLevel, quizList, currentIndex, setCurrentIndex, selectedAnswer, setSelectedAnswer, selectedMulti, setSelectedMulti, isAnswered, setIsAnswered, score, correctCount, wrongQuestions, setQuizFinished, lastDelta, quizRun, examTimerEnabled, examSecondsLeft, isExamMode, examSim, saveScoreToLeaderboard, applyJoker, spendJoker, applySwapJoker, finishPfad, handleOptionClick, examSimNext, submitMultiAnswer, setToast, myProg }} />}

        {/* ═════════ AUSWERTUNG ═════════ */}
        {activeTab === 'quiz' && quizFinished && currentQuizCategory !== null && <QuizResult {...{ fetchCloudData, questions, isAdmin, setActiveTab, pfadMsg, lastComboExtra, masteryStart, currentQuizCategory, setCurrentQuizCategory, setSelectedLevel, quizList, score, correctCount, wrongQuestions, quizRun, isExamMode, examSim, examPrev, launchProductQuiz, retryWrongQuestions, albumNames, productTotal, masteredState, resOpen, setResOpen, streakMult, isNewcomer }} />}

        {activeTab === 'bilderquiz' && <BilderQuizView images={productImages} known={Array.isArray((cloudProgress[userKeyLower] || {})._bilderOk) ? (cloudProgress[userKeyLower] || {})._bilderOk : []} onSaveScore={saveScoreToLeaderboard} onFinished={(r, t, rec) => recordGameResult('bilder', r, t, rec)} onLearn={learnFromGame} />}
        {activeTab === 'allergene' && <AllergenTrainerView images={productImages} onSaveScore={saveScoreToLeaderboard} onFinished={(r, t) => recordGameResult('allergen', r, t)} onLearn={learnFromGame} known={myKnown} onKnown={markKnown} />}
        {(activeTab === 'einarbeitung' || activeTab === 'appwoche') && <EinarbeitungSeite {...{ activeTab, setActiveTab, obDay, setObDay, toggleOnboarding, onboarding, appWeek, goOnboardingTarget }} />}
        {activeTab === 'kassenblitz' && <KassenblitzView onSaveScore={saveScoreToLeaderboard} />}
        {activeTab === 'preisduell' && <PreisDuellView images={productImages} best={Number(myStats.priceBest) || 0} onSaveScore={saveScoreToLeaderboard} onFinished={(n) => recordStatBest('priceBest', n)} onLearn={learnFromGame} known={myKnown} onKnown={markKnown} />}
        {activeTab === 'schneiden' && <SchneideProfiView images={productImages} best={Number(myStats.sliceBest) || 0} onSaveScore={saveScoreToLeaderboard} onFinished={(r) => recordStatBest('sliceBest', r)} onLearn={learnFromGame} known={myKnown} onKnown={markKnown} />}
        {activeTab === 'advent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isAdmin && (
              <button onClick={() => setAdventPreview(v => !v)} role="switch" aria-checked={adventPreview} style={{ ...btnSecondary, alignSelf: 'flex-start', minHeight: '48px', fontSize: '16px', backgroundColor: adventPreview ? TH.tintBlue : dc('#FFFFFF') }}>
                {adventPreview ? 'Vorschau beenden' : 'Vorschau: alle Türchen testen'}
              </button>
            )}
            <div key={adventPreview ? 'p' : 'n'}><AdventView questions={questions} done={myAdvent} onAnswer={answerAdvent} preview={isAdmin && adventPreview} /></div>
          </div>
        )}
        {activeTab === 'theke' && <ThekenSimulatorView tipTodayLeft={Math.max(0, TIP_DAY_CAP - (myProg._tipDay && myProg._tipDay.d === dayKey(new Date()) ? Number(myProg._tipDay.c) || 0 : 0))} onTip={isAdmin ? undefined : addTip} tipBalance={(Number(myProg._tipCents) || 0) - (Number(myProg._tipSpent) || 0)} onOpenShop={isAdmin ? undefined : () => setShowTipShop(true)} onSaveScore={saveScoreToLeaderboard} onTopicResults={recordThekeResults} topicStats={(cloudProgress[userKeyLower] || {})._theke} onLearn={learnFromGame} known={myKnown} onKnown={markKnown} />}
        {activeTab === 'tueten' && <TuetenBlitzView onSaveScore={saveScoreToLeaderboard} />}
        {activeTab === 'alternativen' && <AlternativenJaegerView onSaveScore={saveScoreToLeaderboard} onLearn={learnFromGame} known={myKnown} onKnown={markKnown} />}
        {activeTab === 'pfad' && <LernpfadView felder={PFAD} done={Number(myProg._pfad) || 0} avatar={myProg._avatar || '🥨'} onPlay={launchPfad} lastResult={pfadMsg} />}
        {activeTab === 'ansturm' && <ThekenAnsturmView images={productImages} onSaveScore={saveScoreToLeaderboard} onBest={(n: number) => recordStatBest('ansturmBest', n)} />}
        {activeTab === 'jahr' && yearData && <YearReviewView d={yearData} onBack={() => setActiveTab('home')} />}
        {activeTab === 'profil' && profileData && <ProfileView d={profileData} onBack={() => setActiveTab('scoreboard')} onPraise={isAdmin ? (t: string) => sendPraise(profileKey, t) : undefined} />}
        {activeTab === 'kundenfragen' && <KundenfragenSeite cloudData={cloudData} username={username} isAdmin={isAdmin} mutateCloudData={mutateCloudData} setToast={setToast} />}
        {activeTab === 'hilfe' && <HilfeView onInstall={() => { try { localStorage.removeItem('lt_install_hidden'); } catch {} setInstallHidden(false); setShowInstallHelp(true); }} levels={LEVELS} jokers={TIP_SHOP.filter(i => i.kind === 'joker')} onTour={() => setShowIntro(true)} onBack={() => setActiveTab('home')} />}
        {activeTab === 'statistik' && (
          <StatistikView name={username} avatar={myProg._avatar} avatarClass={myProg._effect ? `lt-fx-${String(myProg._effect).replace('fx_', '')}` : 'lt-emo-bob'}
            levelTitle={`Stufe ${myLevel.no}: ${myLevel.title}`} levelIcon={myLevel.icon} levelPct={myLevel.pct} points={myTotalScore}
            nextInfo={myLevel.next ? `Noch ${myLevel.toNext.toLocaleString('de-DE')} Punkte bis ${myLevel.next.icon} ${myLevel.next.title}` : 'Höchste Stufe erreicht, Respekt!'}
            prog={myProg} questions={questions as any} scores={(cloudData.scores || []).filter(x => x.username?.toLowerCase() === userKeyLower)}
            badgesEarned={earnedBadges.length} badgesTotal={badges.length} streakNow={streak.current} streakBest={streak.best}
            onPractice={(cat) => { setCurrentQuizCategory(cat); setSelectedSubfilter('all'); setSelectedLevel(null); setActiveTab('quiz'); }}
            onBack={() => setActiveTab('home')} />
        )}
        {osterAktiv && !isAdmin && OSTER_TABS.some(t => t.id === activeTab) && !osterFound.includes(activeTab) && (activeTab !== 'quiz' || currentQuizCategory === null) && <OsterEi tab={activeTab} onFind={findOsterEi} />}
        {activeTab === 'ausbildung' && azubiArea && (
          <AusbildungView isAzubi={myRole === 'azubi'} isAdmin={isAdmin} plan={myProg._azubiPlan || {}} lehrjahr={Number(myProg._lehrjahr) || 0} onToggle={toggleAzubiPlan} onSetLehrjahr={setAzubiLehrjahr} examSection={examSection} exam={myProg._exam || {}}
            azubis={isAdmin ? Object.keys(cloudProgress).filter(k => k !== 'admin' && (cloudProgress[k] || {})._role === 'azubi').map(k => ({ name: cloudProgress[k]._displayName || k, plan: cloudProgress[k]._azubiPlan || {}, lehrjahr: Number(cloudProgress[k]._lehrjahr) || 0, exam: cloudProgress[k]._exam || {} })) : []} />
        )}
        {activeTab === 'battle' && (
          <BattleView
            myTime={battleElapsed} myBalance={ptsBalance} activeBattle={activeBattleId ? cloudBattles[activeBattleId] : null} levelOf={(uk: string) => { const pts = (cloudData.scores || []).filter(x => x.username?.toLowerCase() === uk).reduce((a, x) => a + (Number(x.score) || 0), 0); const l = levelFor(pts); return `${l.icon} Stufe ${l.no}: ${l.title}`; }} username={username} cloudBattles={cloudBattles} allKnownUserKeys={allKnownUserKeys}
            cloudLastSeen={cloudLastSeen} cloudProgress={cloudProgress} getUserMasteryPercent={getUserMasteryPercent}
            battleState={battleState} setBattleState={setBattleState} battleQuestions={battleQuestions}
            battleIndex={battleIndex} battleTimeLeft={battleTimeLeft} selectedAnswer={selectedAnswer}
            isAnswered={isAnswered} battleCorrects={battleCorrects} fetchCloudData={fetchCloudData}
            timeJokers={isAdmin ? 0 : Number(myProg._jokersTime) || 0} onTimeJoker={applyTimeJoker}
            createBattleChallenge={createBattleChallenge} acceptBattleChallenge={acceptBattleChallenge}
            handleBattleAnswer={handleBattleAnswer}
            images={productImages} tombstones={cloudData.tombstones}
          />
        )}
        {activeTab === 'flashcards' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <PageHead title="Spickzettel" subtitle="Produktkenntnis und Fachwissen, alles zum Nachsehen." onBack={() => setActiveTab('nachschlagen')} backLabel="Zurück zu Nachschlagen" />
            <div key={`${spickArea}-${spickView || ''}`} style={{ display: 'contents' }}><FlashcardView initialArea={spickArea} initialView={spickView} images={productImages} questions={allFlashcards} customProducts={customProducts} favorites={favorites} toggleFavorite={toggleFavorite} kollegenTipps={alleTipps(cloudData.progress, undefined, 'ok')} meineTipps={alleTipps(cloudData.progress).filter(t => t.user === (username || '').toLowerCase())} onTipp={isAdmin ? undefined : sendTipp} meineNotizen={meineNotizen(cloudData.progress, (username || '').toLowerCase())} onNotiz={isAdmin ? undefined : (produkt: string, text: string) => mutateCloudData(notizSpeichern(username.toLowerCase(), username, produkt, text))} /></div>
          </div>
        )}
        {activeTab === 'scoreboard' && overtaken && (
          <div className="lt-overtake" role="status" style={{ position: 'relative', overflow: 'hidden', marginBottom: '18px', padding: '18px 20px', borderRadius: '22px', background: 'linear-gradient(135deg,#FCE1D2,#FFF0C2)', border: '2px solid #F2B58C', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span className="lt-overtake-run" aria-hidden="true">🏃💨</span>
            <span className="lt-overtake-ic" style={{ fontSize: '42px', lineHeight: 1 }} aria-hidden="true">😱</span>
            <span style={{ flex: '1 1 240px' }}>
              <span style={{ display: 'block', fontFamily: LT.serif, fontSize: '26px', lineHeight: 1.1 }}>{overtaken.by.length === 1 ? `${overtaken.by[0]} hat dich überholt!` : `${overtaken.by.slice(0, 2).join(' und ')}${overtaken.by.length > 2 ? ' und andere haben' : ' haben'} dich überholt!`}</span>
              <span style={{ display: 'block', fontSize: '17px', color: LT.brown, marginTop: '4px' }}>Du bist jetzt auf Platz {overtaken.place}. Mit {overtaken.gap.toLocaleString('de-DE')} Punkten holst du dir den Platz zurück. 💪</span>
            </span>
            <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => { setOvertaken(null); setActiveTab('spielen'); }} style={{ minHeight: '48px', padding: '0 16px', borderRadius: '14px', border: 'none', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>Zurückholen! 🎮</button>
              <button onClick={() => setOvertaken(null)} aria-label="Hinweis schließen" style={{ minHeight: '48px', padding: '0 14px', borderRadius: '14px', border: `2px solid ${LT.line}`, backgroundColor: dc('#FFFFFF'), fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Okay</button>
            </span>
          </div>
        )}
        {activeTab === 'scoreboard' && <ScoreboardView onOpenProfile={(k: string) => { setProfileKey(k); setActiveTab('profil'); window.scrollTo(0, 0); }} badgeStats={badgeStatsOf} badgeTotal={badges.length} cloudScores={cloudScores} allKnownUserKeys={allKnownUserKeys} cloudLastSeen={cloudLastSeen} cloudProgress={cloudProgress} cloudBattles={cloudBattles} currentUsername={username} getUserMasteryPercent={getUserMasteryPercent} onRefresh={() => fetchCloudData()} isSyncing={isSyncing} tombstones={cloudData.tombstones} />}
        {activeTab === 'admin' && isAdmin && <AdminGift users={allKnownUserKeys.filter(k => k !== 'admin').map(k => ({ key: k, name: ((cloudData.progress || {})[k] || {})._displayName || k })).sort((x, y) => x.name.localeCompare(y.name, 'de'))} onGive={adminGive} />}
        {activeTab === 'admin' && isAdmin && (
          <Suspense fallback={<div role="status" style={{ padding: '32px 0', textAlign: 'center', color: LT.muted, fontSize: '17px' }}>Ausbilder-Bereich wird geladen …</div>}>
          <AdminView
            cloudData={cloudData} cloudUrl={cloudUrl} setCloudUrl={setCloudUrl}
            cloudConnected={cloudConnected} setCloudConnected={setCloudConnected}
            isSyncing={isSyncing} fetchCloudData={fetchCloudData}
            allKnownUserKeys={allKnownUserKeys} questions={questions}
            examQuestions={examQs} allFlashcards={allFlashcards}
            getUserMasteryPercent={getUserMasteryPercent}
            mutateCloudData={mutateCloudData}
            overwriteCloudDataDirectly={overwriteCloudDataDirectly}
            imageCount={Object.keys(productImages).length}
            onImportImages={importImagesFile}
          />
          </Suspense>
        )}
      </Suspense>
      </main>

      {/* ── Versionsanzeige ── */}
      {(() => {
        return (
          <div style={{ marginTop: '40px', fontSize: '14px', color: LT.muted, fontWeight: 400, textAlign: 'center', padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {username && <button onClick={() => setActiveTab('hilfe')} style={{ minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: 'none', backgroundColor: LT.yellow, color: LT.ink, fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>So funktioniert die Lern-Theke</button>}
                        {activeTab === 'home' && <button onClick={toggleSky} aria-pressed={!skyOn} style={{ minHeight: '44px', padding: '0 14px', borderRadius: '999px', border: `2px solid ${LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              {skyOn ? 'Markise wieder gelb' : 'Markise zeigt das Wetter'}
            </button>}
            {activeTab === 'home' && <button onClick={toggleAnim} aria-pressed={!animOn} style={{ minHeight: '44px', padding: '0 14px', borderRadius: '999px', border: `2px solid ${LT.line}`, backgroundColor: dc('#FFFFFF'), color: LT.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              {animOn ? 'Animationen ausschalten' : 'Animationen einschalten'}
            </button>}
            <span>{`Lern-Theke · Version ${APP_VERSION}`}</span>
          </div>
        );
      })()}

      {/* ── Menüleiste unten (Handy) ── */}
      {(() => { const dock = navItems; const ai = dock.findIndex(n => n.active); return (
      <nav className="lt-bottomnav" aria-label="Hauptmenü" style={{ gridTemplateColumns: `repeat(${dock.length}, minmax(0, 1fr))` }}>
        <span className="lt-nav-ind" aria-hidden="true" style={{ width: `calc((100% - 16px) / ${dock.length})`, transform: `translateX(${Math.max(0, ai) * 100}%)`, opacity: ai < 0 ? 0 : 1 }} />
        {dock.map(item => (
          <button key={item.id} onClick={item.action} className={item.active ? 'lt-on lt-nav-pop' : undefined} title={item.label} aria-current={item.active ? 'page' : undefined} aria-label={item.id === 'spielen' && duelInvites > 0 ? `Spielen, ${duelInvites === 1 ? 'eine Einladung' : `${duelInvites} Einladungen`} zum Duell` : item.id === 'scoreboard' && overtaken ? 'Bestenliste, du wurdest überholt' : item.label}>
            {item.id === 'spielen' && duelInvites > 0
              ? <span style={{ position: 'relative', display: 'inline-flex' }}><DuelSwords size={36} /><DuelBadge n={duelInvites} /></span>
              : item.id === 'scoreboard' && overtaken ? <span style={{ position: 'relative', display: 'inline-flex' }}><LtIcon paths={item.icon} size={25} width={item.active ? 2.4 : 2} /><span className="lt-dot-pulse" aria-hidden="true" style={{ position: 'absolute', top: '-3px', right: '-5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D92D20' }} /></span>
              : <LtIcon paths={item.icon} size={25} width={item.active ? 2.4 : 2} />}
          </button>
        ))}
      </nav>); })()}

      {/* ── Trinkgeld-Laden ── */}
      {showTipShop && !isAdmin && <TipShop prog={myProg} onBuy={buyShopItem} onEquip={equipShopItem} onClose={() => setShowTipShop(false)} ptsBalance={ptsBalance} onBuyPts={buyPtsItem} onEquipPts={equipPtsItem} />}

      {/* ── Anleitung: App auf den Startbildschirm ── */}
      {showInstallHelp && <InstallHilfe {...{ setShowInstallHelp, hideInstall, canInstallDirect, isAppleDevice, installDirect }} />}

      {/* ── Pop-up: Wochenrückblick ── */}
      {showWeekReview && !needRole && !showFuehrerschein && !showAppWeekDone && !showPinPopup && newBadges.length === 0 && !showLevelUp && !loginDue && loginOpenDay === 0 && !showWheel && !losPrize && <Wochenrueckblick {...{ username, wrSlide, setWrSlide, wrTouch, thisMonday, lastMonday, weekPoints, weekDays, favGame, masteredNow, weekMastered, weekTip, closeWeekReview }} />}

      {/* ── Pop-up: neue Stufe erreicht ── */}
      {showLevelUp && !needRole && !showFuehrerschein && !showAppWeekDone && !showPinPopup && newBadges.length === 0 && <NeueStufe {...{ username, myTotalScore, myLevel, markLevelSeen }} />}

      {/* ── Frage melden ── */}
      {activeTab !== 'quiz' && <FloatingReportButton />}
      {reportQ && <FrageMelden {...{ submitReport, setReportQ, reportQ, reportReason, setReportReason, reportText, setReportText, reportSentRef, setToast }} />}

      {(introDue || showIntro) && !needRole && <IntroTour name={username} onDone={finishIntro} />}
      {needPinSetup && <PinFestlegen {...{ username, cloudDataRef, savePin }} />}
      {loginDue && !needRole && !showFuehrerschein && !showAppWeekDone && !showPinPopup && !showWheel && <LoginRewardDialog day={loginDay} onClaim={() => { setLoginOpenDay(loginDay); claimLogin(); }} onClose={() => setLoginOpenDay(0)} />}
      {loginOpenDay > 0 && !loginDue && <LoginRewardDialog day={loginOpenDay} claimedAlready onClaim={() => {}} onClose={() => setLoginOpenDay(0)} />}
      {lobDue && !losPrize && !needRole && !introDue && !showIntro && !showFuehrerschein && !showAppWeekDone && !showPinPopup && !showWheel && !loginDue && loginOpenDay === 0 && !showWeekReview && !showLevelUp && newBadges.length === 0 && (
        <div className="lt-overlay" onClick={closeLob} style={{ position: 'fixed', inset: 0, zIndex: 108, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="lt-dialog lt-pop-in" role="dialog" aria-modal="true" aria-label="Lob vom Ausbilder" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', backgroundColor: LT.cream, borderRadius: '24px', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
            <ConfettiOverlay active />
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: LT.muted }}>Lob von deinem Ausbilder</div>
            <div style={{ fontFamily: LT.serif, fontSize: '32px', lineHeight: 1.2 }}>{lobDue.text}</div>
            <button onClick={closeLob} style={{ minHeight: '50px', borderRadius: '14px', border: 'none', backgroundColor: LT.ink, color: dc('#FFFFFF'), fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>Danke! 😊</button>
          </div>
        </div>
      )}
      {losPrize && !isAdmin && (
        <div className="lt-overlay" onClick={() => setLosPrize(null)} style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Rubbellos" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '420px', backgroundColor: '#FFFBF2', borderRadius: '26px', padding: '24px 20px 22px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
            <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><ShopIcon3D k="j_los" size={40} />Rubbellos</h2>
            <ScratchCard prize={losPrize} onRevealed={() => {}} />
            <button onClick={() => setLosPrize(null)} style={BTN_YELLOW}>Schließen</button>
          </div>
        </div>
      )}
      {showWheel && !isAdmin && (
        <div className="lt-overlay" onClick={() => setShowWheel(false)} style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Glücksrad" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', padding: '22px' }}>
            <button onClick={() => setShowWheel(false)} aria-label="Schließen" style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 3, width: '48px', height: '48px', borderRadius: '50%', border: 'none', backgroundColor: dc('#FFFFFF'), fontSize: '22px', cursor: 'pointer' }}>✕</button>
            <GluecksradCard plain canSpin={wheelReady} extraSpins={Number(myProg._jokersSpin) || 0} onSpin={spinWheel} />
          </div>
        </div>
      )}
      {brezelRain && (
        <div className="lt-brezel-rain" aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDuration: `${2.2 + (i % 5) * 0.35}s`, animationDelay: `${(i % 7) * 0.18}s` }}>{i % 4 === 0 ? '🥐' : '🥨'}</span>)}
        </div>
      )}
      {toast && (
        <div role="status" style={{ position: 'fixed', left: '50%', bottom: '120px', transform: 'translateX(-50%)', zIndex: 1400, maxWidth: '90vw', padding: '14px 20px', borderRadius: '16px', backgroundColor: LT.ink, color: dc('#FFF6E0'), fontSize: '17px', fontWeight: 700, boxShadow: '0 12px 28px -8px rgba(0,0,0,.45)', animation: 'ltToast .3s cubic-bezier(.2,.8,.2,1)' }}>{toast}</div>
      )}

      {/* ── Pop-up: neues Abzeichen (nur wenn gerade keine Nachricht offen ist) ── */}
      {!isAdmin && !needRole && !showFuehrerschein && !showAppWeekDone && !showPinPopup && !showWheel && !losPrize && !stampPrize && !brezelRain && !loginDue && !introDue && !showIntro && loginOpenDay === 0 && newBadges.length > 0 && cloudConnected && <NeuesAbzeichen {...{ username, newBadges, markBadgesSeen }} />}

      {/* ── Pop-up: Stempelkarte voll ── */}
      {!isAdmin && cloudConnected && (stampPrize || (!needRole && !showFuehrerschein && !showAppWeekDone && !showPinPopup && !showWheel && !losPrize && !loginDue && !introDue && !showIntro && loginOpenDay === 0 && !showWeekReview && !showLevelUp && newBadges.length === 0 && !!myProg._stampV2 && Math.floor((Number(myProg._stamps) || 0) / 10) > (Number(myProg._stampClaimed) || 0))) && <StempelkarteVoll {...{ username, claimStampCard, stampPrize, setStampPrize }} />}

      {/* ── Pop-up: neue Nachricht vom Ausbilder ── */}
      {showAppWeekDone && !needRole && <AppWocheGeschafft {...{ username, finishAppWeek }} />}
      {showFuehrerschein && !needRole && <Fuehrerschein {...{ username, finishErsteWoche }} />}
      {needRole && <RolleWaehlen {...{ username, setMyRole }} />}
      {showPinPopup && activePinboard && <AusbilderNachricht activePinboard={activePinboard} markPinSeen={() => { markPinSeen(); if (activePinboard.pflicht) pinGelesen(); }} />}
    </div>
  );
}