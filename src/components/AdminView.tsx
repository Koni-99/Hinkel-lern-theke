import { useState, FormEvent, CSSProperties } from 'react';
import { dc } from '../data';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead, onboardingStatus, computeBadges, correctIdSet, ROLE_INFO, StaffRole } from './minigameUtils';
import { weakThekeTopics } from './KassenblitzView';

// ── Hilfen für die Wochenübersicht ──
const dayKeyA = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const weekStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
const weekDayKeys = () => { const m = weekStart(); return Array.from({ length: 7 }, (_, i) => { const d = new Date(m); d.setDate(m.getDate() + i); return dayKeyA(d); }); };
/** Datum aus „02.11.26, 07:34“ lesen */
const parseScoreDate = (txt?: string): Date | null => {
  const m = (txt || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!m) return null;
  const y = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
  return new Date(y, Number(m[2]) - 1, Number(m[1]));
};
const streakOf = (days: string[]) => {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(dayKeyA(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKeyA(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
};
import { CloudPayload } from '../types';
import { getRankByPercentage, cleanStatNumber, getRightAnswerText, scoreKey, originalProductData, compactScores, compactCutoff } from '../utils';
import { SHOP_PRODUCTS } from '../shopProducts';
import { ALT_MAP } from '../data';
import { CATS, questions as BUILTIN_QUESTIONS, examQuestions as BUILTIN_EXAMS } from '../questions';
import type { Question } from '../questions';

export function AdminView({
  cloudData,
  cloudUrl,
  setCloudUrl,
  cloudConnected,
  setCloudConnected,
  isSyncing,
  fetchCloudData,
  allKnownUserKeys,
  questions,
  examQuestions,
  allFlashcards,
  getUserMasteryPercent,
  mutateCloudData,
  overwriteCloudDataDirectly,
  imageCount = 0,
  onImportImages
}: {
  cloudData: CloudPayload;
  cloudUrl: string;
  setCloudUrl: (u: string) => void;
  cloudConnected: boolean;
  setCloudConnected: (b: boolean) => void;
  isSyncing: boolean;
  fetchCloudData: (url?: string) => void;
  allKnownUserKeys: string[];
  questions: any[];
  examQuestions: any[];
  allFlashcards: any[];
  getUserMasteryPercent: (uKey?: string) => number;
  mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void;
  overwriteCloudDataDirectly: (updater: (curr: CloudPayload) => CloudPayload) => void;
  imageCount?: number;
  onImportImages?: (file: File) => Promise<string>;
}) {
  const [imageMsg, setImageMsg] = useState<string>('');
  const [imageBusy, setImageBusy] = useState<boolean>(false);
  const fachIds = questions.filter((q: any) => q.category === 'Fachwissen').map((q: any) => q.id);
  const learnInfo = (userKey: string) => {
    const prog = (cloudData.progress || {})[userKey] || {};
    const ok = correctIdSet(prog);
    const fachPct = fachIds.length ? Math.round((fachIds.filter((id: number) => ok.has(id)).length / fachIds.length) * 100) : 0;
    return { ob: onboardingStatus(prog), badges: computeBadges(prog, getUserMasteryPercent(userKey), fachPct), exam: prog._exam || {} };
  };
  const [newProdName, setNewProdName] = useState('');
  const [newProdGroup, setNewProdGroup] = useState('Roggenmischbrot');
  const [newProdSlice, setNewProdSlice] = useState('9 mm');
  const [newProdInfo, setNewProdInfo] = useState('');
  const [targetArea, setTargetArea] = useState<'profile' | 'bake_day' | 'seasonal'>('profile');
  const [selectedBakeDayForAdd, setSelectedBakeDayForAdd] = useState<number>(1);
  const [selectedSeasonForAdd, setSelectedSeasonForAdd] = useState<string>('Frühling');
  const [pinboardDraft, setPinboardDraft] = useState('');
  const [pinImage, setPinImage] = useState<string>('');
  const [pinBanner, setPinBanner] = useState<boolean>(false);
  const [pinUntil, setPinUntil] = useState<string>('');
  // ── Sicherung ──
  const [backupMsg, setBackupMsg] = useState('');
  const downloadBackup = () => {
    try {
      const data = JSON.stringify({ app: 'lern-theke', savedAt: new Date().toISOString(), data: cloudData });
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const d = new Date();
      a.href = url; a.download = `lern-theke-sicherung-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setBackupMsg('Sicherung heruntergeladen. Du findest sie in deinen Downloads.');
    } catch { setBackupMsg('Fehler: Die Sicherung konnte nicht erstellt werden.'); }
  };
  const restoreBackup = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const data = parsed && parsed.app === 'lern-theke' && parsed.data ? parsed.data : null;
        if (!data || typeof data !== 'object' || !data.progress) { setBackupMsg('Fehler: Das ist keine Sicherung der Lern-Theke.'); return; }
        const when = parsed.savedAt ? new Date(parsed.savedAt).toLocaleString('de-DE') : 'unbekannt';
        if (!confirm(`Sicherung vom ${when} wiederherstellen? Der aktuelle Stand wird dabei ersetzt.`)) return;
        mutateCloudData(() => ({ scores: [], progress: {}, lastSeen: {}, wrongStats: {}, ...data }));
        setBackupMsg(`Sicherung vom ${when} wiederhergestellt.`);
      } catch { setBackupMsg('Fehler: Die Datei konnte nicht gelesen werden.'); }
    };
    reader.readAsText(file);
  };
  const [pinImgBusy, setPinImgBusy] = useState(false);
  // Foto für die Nachricht: auf max. 1000 px verkleinern, damit die Datenbank klein bleibt
  const loadPinImage = (file?: File | null) => {
    if (!file) return;
    setPinImgBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
        const sc = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        const ctx = c.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0, c.width, c.height); setPinImage(c.toDataURL('image/jpeg', 0.75)); }
        setPinImgBusy(false);
      };
      img.onerror = () => { setPinImgBusy(false); alert('Das Foto konnte nicht geladen werden.'); };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };
  const [tempCloudUrl, setTempCloudUrl] = useState(cloudUrl);
  const [adminTab, setAdminTab] = useState<'team' | 'reports' | 'message' | 'content' | 'stats' | 'settings'>('team');
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [teamCat, setTeamCat] = useState<string>('');
  const [editingQId, setEditingQId] = useState<number | null>(null);
  const [editingPId, setEditingPId] = useState<string | null>(null);
  // Neues Produkt im Sortiment (mit automatischen Quizfragen)
  const emptyNp = { id: '', name: '', group: 'Feingebäck', breadType: '', weight: '', price: '', info: '', shortIngredients: '', fullIngredients: '', allergens: [] as string[], traces: [] as string[], createdAt: 0 };
  const [np, setNp] = useState<typeof emptyNp>(emptyNp);
  const [npMsg, setNpMsg] = useState('');

  // Neuer Quizfragen-State
  const [quizQuestionText, setQuizQuestionText] = useState('');
  const [quizCat, setQuizCat] = useState(CATS[0]);
  const [quizLevel, setQuizLevel] = useState<'easy' | 'hard'>('easy');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOptIdx, setCorrectOptIdx] = useState<number>(0);
  const [quizExplanation, setQuizExplanation] = useState('');
  // Katalogfragen korrigieren
  const [fixId, setFixId] = useState<number | null>(null);
  const [fixQ, setFixQ] = useState('');
  const [fixOpts, setFixOpts] = useState<string[]>([]);
  const [fixCorrect, setFixCorrect] = useState(0);
  const [fixExpl, setFixExpl] = useState('');
  const [fixSearch, setFixSearch] = useState('');
  // Produkt korrigieren (Preis, Zutaten, Allergene, Alternativen) – gilt in allen Spielen
  const [pfName, setPfName] = useState<string | null>(null);
  const [pfPrice, setPfPrice] = useState('');
  const [pfShort, setPfShort] = useState('');
  const [pfAllergens, setPfAllergens] = useState<string[]>([]);
  const [pfAlts, setPfAlts] = useState<string[]>([]);
  const [pfMsg, setPfMsg] = useState('');
  const [pfReportKey, setPfReportKey] = useState<string | null>(null);
  const [pfPick, setPfPick] = useState('');
  const [fixMsg, setFixMsg] = useState('');

  const customProducts = cloudData.customProducts || [];
  const customQuestions: Question[] = cloudData.customQuestions || [];
  const activePinboard = cloudData.pinboard || null;
  const cloudProgress = cloudData.progress || {};
  const cloudLastSeen = cloudData.lastSeen || {};
  const cloudScores = cloudData.scores || [];

  const handleAddCustomProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdInfo.trim()) {
      alert("Bitte Artikelname und Beschreibung ausfüllen!");
      return;
    }
    const item = {
      id: editingPId || 'custom_' + Date.now(),
      name: newProdName.trim(),
      group: newProdGroup,
      slice: newProdSlice,
      info: newProdInfo.trim(),
      targetArea,
      dayOfWeek: targetArea === 'bake_day' ? selectedBakeDayForAdd : undefined,
      seasonKey: targetArea === 'seasonal' ? selectedSeasonForAdd : undefined
    };
    const wasEditing = !!editingPId;
    mutateCloudData((curr) => {
      if (!curr.customProducts) curr.customProducts = [];
      if (wasEditing && curr.customProducts.some(p => p.id === item.id)) {
        curr.customProducts = curr.customProducts.map(p => (p.id === item.id ? item : p));
      } else {
        curr.customProducts.push(item);
      }
      return curr;
    });
    setNewProdName('');
    setNewProdInfo('');
    setEditingPId(null);
    alert(wasEditing ? 'Änderungen am Artikel gespeichert.' : 'Artikel gespeichert.');
  };

  const NP_ALLERGENS = ['Gluten (Weizen)', 'Gluten (Roggen)', 'Gluten (Dinkel)', 'Gluten (Hafer)', 'Gluten (Gerste)', 'Eier', 'Milch', 'Soja', 'Sesam', 'Senf', 'Sellerie', 'Lupinen', 'Erdnüsse', 'Schalenfrüchte (Mandeln)', 'Schalenfrüchte (Haselnüsse)', 'Schalenfrüchte (Walnüsse)', 'Schalenfrüchte (Pistazien)', 'Schalenfrüchte (Cashewkerne)', 'Sulfite'];
  const npGroups = Array.from(new Set(SHOP_PRODUCTS.map(p => p.group))).filter(g => g !== 'Sonstiges' && g !== 'Backmischung').sort((a, b) => a.localeCompare(b, 'de'));
  const sortimentProducts = (cloudData.customProducts || []).filter((p: any) => p.targetArea === 'sortiment');
  const saveNewProduct = (e: FormEvent) => {
    e.preventDefault();
    const name = np.name.trim();
    if (!name || !np.shortIngredients.trim() || !np.info.trim()) { setNpMsg('Bitte mindestens Name, Beschreibung und „Im Verkauf sagen“ ausfüllen.'); return; }
    if (np.price.trim() && !/^\d+,\d\d\s*€?$/.test(np.price.trim())) { setNpMsg('Bitte den Preis so schreiben: 2,90 €'); return; }
    const clash = SHOP_PRODUCTS.some(p => p.name.toLowerCase() === name.toLowerCase() && !sortimentProducts.some((x: any) => x.name === p.name && x.id === np.id));
    if (clash) { setNpMsg(`„${name}“ gibt es schon im Sortiment. Zum Ändern bitte unten „Produktdaten korrigieren“ nutzen.`); return; }
    const price = np.price.trim() ? np.price.trim().replace(/\s*€?$/, ' €') : '';
    const item: any = { ...np, id: np.id || 'np_' + Date.now(), name, price, slice: '', targetArea: 'sortiment', createdAt: np.createdAt || Date.now(), breadType: np.group === 'Brot' ? (np.breadType || 'roggenmisch') : '' };
    mutateCloudData((curr) => {
      const list = (curr.customProducts || []).filter((p: any) => p.id !== item.id);
      curr.customProducts = [...list, item];
      return curr;
    });
    setNp(emptyNp);
    setNpMsg(`Gespeichert. „${name}“ steht jetzt in den Steckbriefen, und die Quizfragen dazu sind sofort da. Auf der Startseite erscheint 3 Wochen lang „🆕 Neu im Sortiment“.`);
  };
  const editNewProduct = (p: any) => { setNp({ ...emptyNp, ...p, allergens: [...(p.allergens || [])], traces: [...(p.traces || [])] }); setNpMsg(''); window.setTimeout(() => document.getElementById('lt-np-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); };
  const deleteNewProduct = (p: any) => {
    if (!confirm(`„${p.name}“ aus dem Sortiment entfernen? Die Quizfragen dazu verschwinden auch.`)) return;
    mutateCloudData((curr) => { curr.customProducts = (curr.customProducts || []).filter((x: any) => x.id !== p.id); return curr; });
  };
  const toggleNpList = (field: 'allergens' | 'traces', a: string) => setNp(prev => ({ ...prev, [field]: prev[field].includes(a) ? prev[field].filter(x => x !== a) : [...prev[field], a] }));

  const handleAddCustomQuizQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!quizQuestionText.trim() || !optA.trim() || !optB.trim() || !quizExplanation.trim()) {
      alert("Bitte mindestens Frage, Option A, Option B und eine Erklärung ausfüllen!");
      return;
    }

    const rawOptions = [optA.trim(), optB.trim(), optC.trim(), optD.trim()];
    if (!rawOptions[correctOptIdx]) {
      alert("Die als richtig markierte Antwort ist leer. Bitte Text eintragen oder eine andere Antwort als richtig wählen!");
      return;
    }
    // Leere Felder fallen weg, die Position der richtigen Antwort wird dabei mitgerechnet
    const optionsList = rawOptions.filter(Boolean);
    const correctIndex = rawOptions.slice(0, correctOptIdx).filter(Boolean).length;

    const editId = editingQId;
    mutateCloudData((curr) => {
      if (!curr.customQuestions) curr.customQuestions = [];
      const data = {
        category: quizCat,
        level: quizLevel,
        question: quizQuestionText.trim(),
        options: optionsList,
        correct: correctIndex,
        explanation: quizExplanation.trim()
      };
      if (editId !== null && curr.customQuestions.some(q => q.id === editId)) {
        curr.customQuestions = curr.customQuestions.map(q => (q.id === editId ? { ...q, ...data } : q));
      } else {
        const nextId = Math.max(900000, ...curr.customQuestions.map((q) => q.id)) + 1;
        curr.customQuestions.push({ id: nextId, ...data });
      }
      return curr;
    });
    setEditingQId(null);

    setQuizQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOptIdx(0);
    setQuizExplanation('');
    alert(editId !== null ? 'Änderungen an der Quizfrage gespeichert.' : 'Neue Quizfrage gespeichert, sie erscheint ab sofort im Quiz aller Mitarbeiter.');
  };

  const startEditQuestion = (cq: Question) => {
    const o = [...cq.options, '', '', '', ''];
    setQuizQuestionText(cq.question);
    setQuizCat(cq.category);
    setQuizLevel(cq.level);
    setOptA(o[0]); setOptB(o[1]); setOptC(o[2]); setOptD(o[3]);
    setCorrectOptIdx(Math.min(3, Math.max(0, Number(cq.correct) || 0)));
    setQuizExplanation(cq.explanation || '');
    setEditingQId(cq.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditQuestion = () => {
    setEditingQId(null);
    setQuizQuestionText(''); setOptA(''); setOptB(''); setOptC(''); setOptD(''); setCorrectOptIdx(0); setQuizExplanation('');
  };
  const startEditProduct = (cp: any) => {
    setNewProdName(cp.name || '');
    setNewProdGroup(cp.group || 'Roggenmischbrot');
    setNewProdSlice(cp.slice || '9 mm');
    setNewProdInfo(cp.info || '');
    setTargetArea((cp.targetArea === 'sortiment' ? 'profile' : cp.targetArea) || 'profile');
    if (cp.dayOfWeek) setSelectedBakeDayForAdd(cp.dayOfWeek);
    if (cp.seasonKey) setSelectedSeasonForAdd(cp.seasonKey);
    setEditingPId(cp.id);
  };
  const cancelEditProduct = () => { setEditingPId(null); setNewProdName(''); setNewProdInfo(''); };

  const handleDeleteCustomQuestion = (id: number) => {
    if (!confirm("Möchtest du diese Quizfrage wirklich löschen?")) return;
    overwriteCloudDataDirectly((curr) => {
      if (curr.customQuestions) curr.customQuestions = curr.customQuestions.filter((q) => q.id !== id);
      markDeleted(curr, 'questions', String(id));
      return curr;
    });
  };

  const handleDeleteCustomProduct = (id: string) => {
    if (!confirm("Möchtest du diesen Eintrag wirklich löschen?")) return;
    overwriteCloudDataDirectly((curr) => {
      if (curr.customProducts) curr.customProducts = curr.customProducts.filter(p => p.id !== id);
      markDeleted(curr, 'products', id);
      return curr;
    });
  };

  const adminResetUserWrongStats = (targetUserKey: string, dispName: string) => {
    if (!confirm('Möchtest du den Fehler-Stapel von "' + dispName + '" wirklich leeren?')) return;
    overwriteCloudDataDirectly((curr) => {
      if (curr.progress && curr.progress[targetUserKey]) { curr.progress[targetUserKey].wrongStats = {}; curr.progress[targetUserKey]._fehler = {}; }
      markDeleted(curr, 'wrongReset', targetUserKey);
      return curr;
    });
  };

  const adminResetUserProgress = (targetUserKey: string, dispName: string) => {
    if (!confirm('Möchtest du den gesamten Lernfortschritt von "' + dispName + '" wirklich auf 0% zurücksetzen?')) return;
    overwriteCloudDataDirectly((curr) => {
      if (curr.progress && curr.progress[targetUserKey]) {
        curr.progress[targetUserKey] = { _displayName: dispName, wrongStats: {}, _onboarding: curr.progress[targetUserKey]._onboarding, _role: curr.progress[targetUserKey]._role, _ersteWocheFertig: curr.progress[targetUserKey]._ersteWocheFertig };
      }
      markDeleted(curr, 'progressReset', targetUserKey);
      return curr;
    });
  };

  // PIN vergessen: Der Mitarbeiter legt beim nächsten Öffnen der App eine neue fest
  const adminResetUserPin = (targetUserKey: string, dispName: string) => {
    if (!confirm('PIN von "' + dispName + '" zurücksetzen? ' + dispName + ' legt beim nächsten Öffnen der App eine neue PIN fest.')) return;
    overwriteCloudDataDirectly((curr) => {
      curr.pins = { ...(curr.pins || {}), [targetUserKey]: { ts: Date.now() } };
      return curr;
    });
  };

  const adminDeleteUserCompletely = (targetUserKey: string, dispName: string) => {
    if (!confirm('Möchtest du den Benutzer "' + dispName + '" inklusive aller Punkte und Fortschritte komplett löschen?')) return;
    overwriteCloudDataDirectly((curr) => {
      if (curr.progress) delete curr.progress[targetUserKey];
      if (curr.lastSeen) delete curr.lastSeen[targetUserKey];
      if (Array.isArray(curr.scores)) {
        curr.scores = curr.scores.filter(s => s.username?.toLowerCase() !== targetUserKey);
      }
      markDeleted(curr, 'users', targetUserKey);
      return curr;
    });
  };

  // Löschungen merken, damit veraltete Geräte sie nicht zurückbringen
  const markDeleted = (curr: CloudPayload, kind: keyof NonNullable<CloudPayload['tombstones']>, key: string) => {
    const t = { ...(curr.tombstones || {}) };
    t[kind] = { ...(t[kind] || {}), [key]: Date.now() };
    curr.tombstones = t;
  };

  // ── Punkte löschen ──
  const sameScore = (a: any, b: any) =>
    a.id && b.id ? a.id === b.id : a.username === b.username && a.score === b.score && a.date === b.date && a.category === b.category;

  const adminDeleteScoreEntry = (entry: any, dispName: string) => {
    if (!confirm(`Diesen Eintrag von „${dispName}“ löschen?\n\n${entry.category || 'Punkte'}: ${entry.score} Punkte (${entry.date || 'ohne Datum'})`)) return;
    overwriteCloudDataDirectly((curr) => {
      if (Array.isArray(curr.scores)) curr.scores = curr.scores.filter((s) => !sameScore(s, entry));
      markDeleted(curr, 'scores', scoreKey(entry));
      return curr;
    });
  };

  const adminDeleteAllUserPoints = (targetUserKey: string, dispName: string) => {
    if (!confirm(`Alle Punkte von „${dispName}“ löschen? Der Lernfortschritt bleibt erhalten.`)) return;
    overwriteCloudDataDirectly((curr) => {
      if (Array.isArray(curr.scores)) curr.scores = curr.scores.filter((s) => s.username?.toLowerCase() !== targetUserKey);
      markDeleted(curr, 'pointsReset', targetUserKey);
      return curr;
    });
  };


  // ── Meldungen der Mitarbeiter („Frage melden“) ──
  const allQById = new Map<number, any>();
  [...BUILTIN_QUESTIONS, ...BUILTIN_EXAMS, ...customQuestions].forEach((q: any) => { if (q && q.id !== undefined) allQById.set(Number(q.id), q); });
  const qEdits = cloudData.questionEdits || {};
  const activeEdit = (id: number) => { const e = qEdits[String(id)]; return e && !e.restored ? e : null; };
  // Angezeigt wird immer die korrigierte Fassung
  allQById.forEach((q, id) => {
    const e = activeEdit(id);
    if (e) allQById.set(id, { ...q, ...(e.question ? { question: e.question } : {}), ...(e.options ? { options: e.options } : {}), ...(typeof e.correct === 'number' ? { correct: e.correct } : {}), ...(typeof e.explanation === 'string' ? { explanation: e.explanation } : {}) });
  });
  const builtInById = new Map<number, any>();
  [...BUILTIN_QUESTIONS, ...BUILTIN_EXAMS].forEach((q: any) => builtInById.set(Number(q.id), q));
  const startFix = (id: number) => {
    const q = allQById.get(id);
    if (!q) return;
    setFixId(id); setFixQ(q.question || ''); setFixOpts([...(q.options || [])]); setFixCorrect(typeof q.correct === 'number' ? q.correct : 0); setFixExpl(q.explanation || ''); setFixMsg('');
    window.setTimeout(() => document.getElementById('lt-fix-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };
  const saveFix = () => {
    if (fixId === null) return;
    const opts = fixOpts.map(o => o.trim());
    if (!fixQ.trim() || opts.some(o => !o)) { setFixMsg('Bitte Frage und alle Antworten ausfüllen.'); return; }
    if (new Set(opts).size !== opts.length) { setFixMsg('Zwei Antworten sind gleich, bitte unterschiedlich formulieren.'); return; }
    const id = fixId;
    const isBuiltIn = builtInById.has(id);
    mutateCloudData((curr) => {
      if (isBuiltIn) {
        curr.questionEdits = { ...(curr.questionEdits || {}), [String(id)]: { question: fixQ.trim(), options: opts, correct: fixCorrect, explanation: fixExpl.trim(), ts: Date.now() } };
      } else if (curr.customQuestions) {
        curr.customQuestions = curr.customQuestions.map(q => (q.id === id ? { ...q, question: fixQ.trim(), options: opts, correct: fixCorrect, explanation: fixExpl.trim() } : q));
      }
      clearReports(curr, String(id));
      return curr;
    });
    setFixId(null);
    setFixMsg('Gespeichert. Alle Mitarbeiter sehen ab sofort die korrigierte Frage.');
  };
  const restoreOriginal = (id: number) => {
    if (!confirm('Die Original-Frage wiederherstellen? Deine Korrektur wird verworfen.')) return;
    mutateCloudData((curr) => {
      curr.questionEdits = { ...(curr.questionEdits || {}), [String(id)]: { restored: true, ts: Date.now() } };
      return curr;
    });
  };
  const editedIds = Object.keys(qEdits).filter(k => qEdits[k] && !qEdits[k].restored).map(Number).filter(id => builtInById.has(id));
  const fixResults = fixSearch.trim().length >= 3
    ? Array.from(allQById.values()).filter((q: any) => `${q.question} ${(q.options || []).join(' ')} ${q.product || ''}`.toLowerCase().includes(fixSearch.trim().toLowerCase())).slice(0, 15)
    : [];
  const renderFixEditor = () => fixId !== null && (() => {
    const orig = builtInById.get(fixId);
    const multi = Array.isArray(allQById.get(fixId)?.correctMulti) && allQById.get(fixId).correctMulti.length > 1;
    return (
      <div id="lt-fix-editor" className="lt-pop-in" style={{ ...cardStyle, borderColor: TH.brown, borderWidth: '3px', scrollMarginTop: '12px' }}>
        {sectionTitle('Frage korrigieren', `Nr. ${fixId}${orig ? ' · aus dem Fragenkatalog' : ' · eigene Frage'} · die Änderung gilt sofort für alle.`)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={labelStyle}>Frage<textarea rows={2} value={fixQ} onChange={(e) => setFixQ(e.target.value)} style={inputStyle} /></label>
          {fixOpts.map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, minWidth: '86px', cursor: multi ? 'default' : 'pointer' }}>
                <input type="radio" name="fix-correct" checked={fixCorrect === i} disabled={multi} onChange={() => setFixCorrect(i)} />{String.fromCharCode(65 + i)} {fixCorrect === i ? '✓' : ''}
              </label>
              <input value={o} onChange={(e) => setFixOpts(prev => prev.map((x, j) => (j === i ? e.target.value : x)))} style={{ ...inputStyle, borderColor: fixCorrect === i ? TH.green : TH.line }} />
            </div>
          ))}
          <div style={{ fontSize: '15px', color: TH.muted }}>{multi ? 'Bei dieser Frage sind mehrere Antworten richtig, die richtigen bleiben wie im Original. Du kannst die Texte ändern.' : 'Den Punkt bei der richtigen Antwort setzen.'}</div>
          <label style={labelStyle}>Erklärung<textarea rows={3} value={fixExpl} onChange={(e) => setFixExpl(e.target.value)} style={inputStyle} /></label>
          {orig && (
            <details style={{ fontSize: '15px', color: TH.muted }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Original anzeigen</summary>
              <div style={{ marginTop: '6px', lineHeight: 1.5 }}>{orig.question}<br />Richtig: {getRightAnswerText(orig)}<br />{orig.explanation}</div>
            </details>
          )}
          {fixMsg && <div style={{ color: TH.red, fontWeight: 700 }}>{fixMsg}</div>}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={saveFix} style={btnPrimary}>Korrektur speichern</button>
            <button onClick={() => { setFixId(null); setFixMsg(''); }} style={btnSecondary}>Abbrechen</button>
          </div>
        </div>
      </div>
    );
  })();

  type ReportItem = { user: string; r: string; t: string; d: string; ts: number; g?: string };
  const reportMap: Record<string, { qid: string; q: any; items: ReportItem[]; game?: string; ctx?: string; product?: string }> = {};
  Object.keys(cloudProgress).forEach(u => {
    const rp = (cloudProgress[u] || {})._reports || {};
    Object.keys(rp).forEach(qid => {
      const e = rp[qid];
      if (!e) return;
      if (!reportMap[qid]) reportMap[qid] = { qid, q: /^\d+$/.test(qid) ? allQById.get(Number(qid)) : undefined, items: [] };
      const m = reportMap[qid];
      if (e.g && !m.game) m.game = String(e.g);
      if (e.c && !m.ctx) m.ctx = String(e.c);
      if (e.p && !m.product) m.product = String(e.p);
      if (!m.product && m.q && m.q.product) m.product = m.q.product;
      m.items.push({ user: u, r: String(e.r || ''), t: String(e.t || ''), d: String(e.d || ''), ts: Number(e.ts) || 0, g: e.g ? String(e.g) : undefined });
    });
  });
  const reports = Object.values(reportMap).sort((a, b) => Math.max(...b.items.map(i => i.ts)) - Math.max(...a.items.map(i => i.ts)));
  const hiddenMap: Record<string, number> = cloudData.tombstones?.questions || {};
  const builtInIds = new Set([...BUILTIN_QUESTIONS, ...BUILTIN_EXAMS].map((q: any) => Number(q.id)));
  const hiddenBuiltIn = Object.keys(hiddenMap).map(Number).filter(id => builtInIds.has(id));
  const clearReports = (curr: CloudPayload, qid: string) => {
    Object.keys(curr.progress || {}).forEach(u => {
      const rp = curr.progress[u]?._reports;
      if (rp && rp[qid]) { const n = { ...rp }; delete n[qid]; curr.progress[u]._reports = n; }
    });
  };
  const resolveReport = (qid: string) => mutateCloudData((curr) => { clearReports(curr, qid); return curr; });
  const hideQuestion = (qid: string) => {
    if (!confirm('Diese Frage für alle ausblenden? Sie kommt dann in keinem Quiz und keinem Spiel mehr dran. Du kannst sie später wieder einblenden.')) return;
    overwriteCloudDataDirectly((curr) => { markDeleted(curr, 'questions', qid); clearReports(curr, qid); return curr; });
  };
  const restoreQuestion = (id: number) => overwriteCloudDataDirectly((curr) => {
    if (curr.tombstones?.questions) { const n = { ...curr.tombstones.questions }; delete n[String(id)]; curr.tombstones = { ...curr.tombstones, questions: n }; }
    return curr;
  });

  // ── Produktdaten korrigieren ──
  const pFixes = cloudData.productFixes || {};
  const fixedProducts = Object.keys(pFixes).filter(n => pFixes[n] && !pFixes[n].restored).sort();
  const shopNames = SHOP_PRODUCTS.map(p => p.name).sort((a, b) => a.localeCompare(b, 'de'));
  const allAllergens = Array.from(new Set(SHOP_PRODUCTS.reduce<string[]>((acc, p) => acc.concat(p.allergens), []))).sort((a, b) => a.localeCompare(b, 'de'));
  const startProductFix = (name: string, reportKey?: string) => {
    const p = SHOP_PRODUCTS.find(x => x.name === name);
    if (!p) return;
    setPfName(name); setPfPrice(p.price || ''); setPfShort(p.shortIngredients || ''); setPfAllergens([...p.allergens]); setPfAlts([...(ALT_MAP[name] || [])]);
    setPfMsg(''); setPfReportKey(reportKey || null); setPfPick('');
    window.setTimeout(() => document.getElementById('lt-pfix-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };
  const saveProductFix = () => {
    if (!pfName) return;
    const orig = originalProductData(pfName);
    if (!orig) return;
    if (pfPrice.trim() && !/\d+,\d\d/.test(pfPrice)) { setPfMsg('Bitte den Preis so schreiben: 2,90 €'); return; }
    const sameList = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x));
    const fix: any = { ts: Date.now() };
    if (pfPrice.trim() && pfPrice.trim() !== (orig.price || '')) fix.price = pfPrice.trim();
    if (pfShort.trim() && pfShort.trim() !== orig.shortIngredients) fix.shortIngredients = pfShort.trim();
    if (!sameList(pfAllergens, orig.allergens)) fix.allergens = [...pfAllergens];
    if (!sameList(pfAlts, orig.alts)) fix.alts = [...pfAlts];
    const name = pfName;
    const rk = pfReportKey;
    const changed = Object.keys(fix).length > 1;
    mutateCloudData((curr) => {
      curr.productFixes = { ...(curr.productFixes || {}), [name]: changed ? fix : { restored: true, ts: Date.now() } };
      if (rk) clearReports(curr, rk);
      return curr;
    });
    setPfName(null);
    setPfMsg(changed ? `Gespeichert. „${name}“ ist ab sofort in allen Spielen, Steckbriefen und Quizfragen korrigiert.` : `Keine Änderung zum Original, „${name}“ bleibt wie im Shop.`);
  };
  const restoreProduct = (name: string) => {
    if (!confirm(`Die Originaldaten von „${name}“ wiederherstellen? Deine Korrektur wird verworfen.`)) return;
    mutateCloudData((curr) => { curr.productFixes = { ...(curr.productFixes || {}), [name]: { restored: true, ts: Date.now() } }; return curr; });
  };
  const chip = (on: boolean): CSSProperties => ({ minHeight: '42px', padding: '0 12px', borderRadius: '999px', border: on ? 'none' : `2px solid ${TH.line}`, backgroundColor: on ? TH.brown : TH.white, color: on ? dc('#FFF6E0') : TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer' });
  const renderProductFixEditor = () => pfName && (() => {
    const orig = originalProductData(pfName);
    return (
      <div id="lt-pfix-editor" className="lt-pop-in" style={{ ...cardStyle, borderColor: TH.brown, borderWidth: '3px', scrollMarginTop: '12px' }}>
        {sectionTitle(`Produkt korrigieren: ${pfName}`, 'Die Änderung gilt sofort für alle: in allen Spielen, im Theken-Simulator, in den Steckbriefen und in den passenden Quizfragen.')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={labelStyle}>Preis<input value={pfPrice} onChange={(e) => setPfPrice(e.target.value)} placeholder="z. B. 2,90 €" style={inputStyle} /></label>
          <label style={labelStyle}>Im Verkauf sagen (Kurz-Zutaten)<textarea rows={2} value={pfShort} onChange={(e) => setPfShort(e.target.value)} style={inputStyle} /></label>
          <div style={labelStyle}>
            Allergene (antippen zum An- und Ausschalten)
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allAllergens.map(a => {
                const on = pfAllergens.includes(a);
                return <button key={a} type="button" onClick={() => setPfAllergens(prev => (on ? prev.filter(x => x !== a) : [...prev, a]))} style={chip(on)}>{on ? '✓ ' : ''}{a}</button>;
              })}
            </div>
          </div>
          <div style={labelStyle}>
            Passende Alternativen, wenn es ausverkauft ist
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {pfAlts.length === 0 && <span style={{ fontWeight: 400, color: TH.muted }}>Keine festgelegt</span>}
              {pfAlts.map(a => <button key={a} type="button" onClick={() => setPfAlts(prev => prev.filter(x => x !== a))} style={chip(true)}>{a} ✕</button>)}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select value={pfPick} onChange={(e) => setPfPick(e.target.value)} style={{ ...inputStyle, flex: '1 1 220px', width: 'auto' }}>
                <option value="">Alternative hinzufügen …</option>
                {shopNames.filter(n => n !== pfName && !pfAlts.includes(n)).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button type="button" disabled={!pfPick} onClick={() => { if (pfPick) { setPfAlts(prev => [...prev, pfPick]); setPfPick(''); } }} style={{ ...smallBtn('warn'), opacity: pfPick ? 1 : 0.5 }}>+ Hinzufügen</button>
            </div>
          </div>
          {orig && (
            <details style={{ fontSize: '15px', color: TH.muted }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Original anzeigen</summary>
              <div style={{ marginTop: '6px', lineHeight: 1.5 }}>Preis: {orig.price || '–'}<br />Im Verkauf sagen: {orig.shortIngredients}<br />Allergene: {orig.allergens.join(', ') || 'keine'}<br />Alternativen: {orig.alts.join(', ') || 'keine'}</div>
            </details>
          )}
          {pfMsg && <div style={{ color: TH.red, fontWeight: 700 }}>{pfMsg}</div>}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={saveProductFix} style={btnPrimary}>Korrektur speichern</button>
            <button onClick={() => { setPfName(null); setPfMsg(''); }} style={btnSecondary}>Abbrechen</button>
          </div>
        </div>
      </div>
    );
  })();
  const copyReportText = (rep: { game?: string; product?: string; ctx?: string; items: ReportItem[] }) => {
    const txt = [`Meldung aus der Lern-Theke: ${rep.game || ''}${rep.product ? ` · ${rep.product}` : ''}`, rep.ctx || '', ...rep.items.map(i => `${nameOf(i.user)}: ${i.r}${i.t ? `, „${i.t}“` : ''}`)].join('\n');
    try { navigator.clipboard.writeText(txt); setPfMsg('Meldung kopiert. Du kannst sie mir (Claude) schicken, dann ändere ich den Spieltext.'); } catch { setPfMsg(txt); }
  };

  // ── Schwachstellen im Team: richtig/falsch pro Frage, Bereich, Produkt und Theken-Thema ──
  const qStats: Record<number, { r: number; w: number; users: number }> = {};
  allKnownUserKeys.forEach(u => {
    const prog = cloudProgress[u] || {};
    const qs = prog._qs || {};
    const ws = prog.wrongStats || {};
    new Set([...Object.keys(qs), ...Object.keys(ws)]).forEach(idStr => {
      const id = Number(idStr);
      if (isNaN(id)) return;
      let r = 0, w = 0;
      if (Array.isArray(qs[idStr])) { r = Number(qs[idStr][0]) || 0; w = Number(qs[idStr][1]) || 0; }
      else w = cleanStatNumber(ws[idStr]);
      if (!r && !w) return;
      const e = qStats[id] || (qStats[id] = { r: 0, w: 0, users: 0 });
      e.r += r; e.w += w; if (w > 0) e.users++;
    });
  });
  const groupStats = (keyOf: (q: any) => string | null) => {
    const m: Record<string, { r: number; w: number }> = {};
    Object.keys(qStats).forEach(idStr => {
      const q = allQById.get(Number(idStr));
      if (!q) return;
      const k = keyOf(q);
      if (!k) return;
      const e = m[k] || (m[k] = { r: 0, w: 0 });
      e.r += qStats[Number(idStr)].r; e.w += qStats[Number(idStr)].w;
    });
    return Object.keys(m).map(k => ({ key: k, ...m[k], rate: m[k].r + m[k].w ? Math.round((m[k].w / (m[k].r + m[k].w)) * 100) : 0 }));
  };
  const catWeak = groupStats(q => q.category || (q.examGroup ? 'Prüfung' : null)).sort((a, b) => b.rate - a.rate);
  const productWeak = groupStats(q => q.product || null).filter(x => x.w > 0).sort((a, b) => b.w - a.w || b.rate - a.rate).slice(0, 8);
  const thekeTeam: Record<string, { ok: number; bad: number }> = {};
  allKnownUserKeys.forEach(u => {
    const th = (cloudProgress[u] || {})._theke || {};
    Object.keys(th).forEach(t => { const e = thekeTeam[t] || (thekeTeam[t] = { ok: 0, bad: 0 }); e.ok += Number(th[t]?.ok) || 0; e.bad += Number(th[t]?.bad) || 0; });
  });
  const thekeWeakTeam = Object.keys(thekeTeam).map(t => ({ key: t, ...thekeTeam[t], rate: thekeTeam[t].ok + thekeTeam[t].bad ? Math.round((thekeTeam[t].bad / (thekeTeam[t].ok + thekeTeam[t].bad)) * 100) : 0 }))
    .filter(x => x.bad > 0).sort((a, b) => b.rate - a.rate).slice(0, 6);
  const hardestQs = Object.keys(qStats).map(Number).filter(id => qStats[id].w > 0 && allQById.has(id) && !hiddenMap[String(id)])
    .sort((a, b) => qStats[b].w - qStats[a].w || (qStats[b].w / (qStats[b].r + qStats[b].w)) - (qStats[a].w / (qStats[a].r + qStats[a].w)))
    .slice(0, 10);
  const rateBar = (rate: number) => (
    <div style={{ height: '8px', backgroundColor: dc('#F4EADB'), borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
      <div style={{ width: `${rate}%`, height: '100%', backgroundColor: rate >= 40 ? TH.red : rate >= 20 ? dc('#C98A1B') : TH.green, borderRadius: '999px' }} />
    </div>
  );

  // ── Darstellung ──
  const inputStyle: CSSProperties = { width: '100%', minHeight: '52px', padding: '10px 14px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: TH.cream, color: TH.ink, fontSize: '17px', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle: CSSProperties = { fontSize: '16px', fontWeight: 700, color: TH.ink, display: 'flex', flexDirection: 'column', gap: '6px' };
  const smallBtn = (tone: 'plain' | 'danger' | 'warn' = 'plain'): CSSProperties => ({
    minHeight: '46px', padding: '0 16px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
    border: tone === 'plain' ? `2px solid ${TH.line}` : 'none',
    backgroundColor: tone === 'danger' ? TH.tintPeach : tone === 'warn' ? TH.tintYellow : TH.white,
    color: tone === 'danger' ? TH.red : TH.ink,
  });
  const sectionTitle = (title: string, sub?: string) => (
    <div style={{ marginBottom: '14px' }}>
      <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '30px', lineHeight: 1.1 }}>{title}</h2>
      {sub && <div style={{ fontSize: '17px', color: TH.muted, marginTop: '4px' }}>{sub}</div>}
    </div>
  );

  const thisWeek = weekDayKeys();
  const wStart = weekStart();
  const weekInfo = (userKey: string) => {
    const prog = cloudProgress[userKey] || {};
    const days: string[] = Array.isArray(prog._days) ? prog._days : [];
    const learnDays = thisWeek.filter(k => days.includes(k));
    const weekPoints = cloudScores
      .filter(s => s.username?.toLowerCase() === userKey)
      .filter(s => { const d = parseScoreDate(s.date); return !!d && d >= wStart; })
      .reduce((sum, s) => sum + (Number(s.score) || 0), 0);
    const catPcts = CATS.map(cat => {
      const total = questions.filter(q => q.category === cat).length;
      const done = new Set([...(Array.isArray(prog[cat + '_easy']) ? prog[cat + '_easy'] : []), ...(Array.isArray(prog[cat + '_hard']) ? prog[cat + '_hard'] : [])]).size;
      return { cat, pct: total ? Math.round((done / total) * 100) : 0 };
    }).sort((a, b) => a.pct - b.pct);
    return { days, learnDays, weekPoints, streak: streakOf(days), weakestCat: catPcts[0], thekeWeak: weakThekeTopics(prog._theke, 2) };
  };
  const nameOf = (userKey: string) => cloudLastSeen[userKey]?.displayName || cloudProgress[userKey]?._displayName || userKey;

  const buildReportText = () => {
    const from = wStart.toLocaleDateString('de-DE');
    const lines = [`Wochenbericht Lern-Theke: Woche ab ${from}`, ''];
    allKnownUserKeys.forEach(k => {
      const w = weekInfo(k);
      lines.push(`${nameOf(k)}: ${w.learnDays.length} Lerntage, ${w.weekPoints} Punkte, Serie ${w.streak} Tage` +
        (w.weakestCat ? `, schwächster Bereich: ${w.weakestCat.cat} (${w.weakestCat.pct} %)` : '') +
        (w.thekeWeak.length ? `, Theke üben: ${w.thekeWeak.map(t => t.topic).join(', ')}` : ''));
    });
    return lines.join('\n');
  };
  const copyReport = async () => {
    const txt = buildReportText();
    try { await navigator.clipboard.writeText(txt); alert('Wochenbericht kopiert, du kannst ihn jetzt z. B. in WhatsApp oder eine E-Mail einfügen.'); }
    catch { window.prompt('Bericht zum Kopieren:', txt); }
  };

  const onlineCount = allKnownUserKeys.filter(k => cloudLastSeen[k]?.timestamp && Date.now() - cloudLastSeen[k].timestamp < 120000).length;
  const tabs: { id: typeof adminTab; label: string }[] = [
    { id: 'team', label: `Mitarbeiter (${allKnownUserKeys.length})` },
    { id: 'reports', label: reports.length ? `Meldungen (${reports.length})` : 'Meldungen' },
    { id: 'message', label: 'Nachricht' },
    { id: 'content', label: 'Inhalte' },
    { id: 'stats', label: 'Auswertung' },
    { id: 'settings', label: 'Einstellungen' },
  ];

  return (
    <div className="lt-themed" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: TH.ink, textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <PageHead title="Ausbilder-Bereich" subtitle={`${allKnownUserKeys.length} Mitarbeiter · ${onlineCount} gerade online · ${cloudConnected ? 'Cloud verbunden' : 'offline'}`} />
        {cloudUrl && (
          <button onClick={() => fetchCloudData()} style={{ ...btnSecondary, minHeight: '48px', fontSize: '16px' }}>{isSyncing ? 'Lädt …' : 'Aktualisieren'}</button>
        )}
      </div>

            {(() => {
              const pend = Object.entries(cloudData.progress || {}).filter(([, pr]: [string, any]) => pr && pr._spruch && pr._spruch.status === 'pending');
              if (!pend.length) return null;
              const decide = (k: string, ok: boolean) => mutateCloudData((curr) => {
                const pr: any = curr.progress[k]; if (!pr || !pr._spruch || pr._spruch.status !== 'pending') return curr;
                if (ok) { const d = new Date(); pr._spruch = { ...pr._spruch, status: 'ok', okTs: Date.now(), day: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }; }
                else { pr._spruch = { ...pr._spruch, status: 'no' }; pr._ptsSpent = Math.max(0, (Number(pr._ptsSpent) || 0) - (Number(pr._spruch.price) || 15000)); }
                return curr;
              });
              return (
                <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '16px', backgroundColor: '#FFF4C7', border: '2px solid #C9971C', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <strong style={{ fontSize: '17px' }}>💬 Sprüche zur Freigabe ({pend.length})</strong>
                  <span style={{ fontSize: '14px', color: TH.muted }}>Mitarbeiter haben dafür 15.000 Punkte bezahlt. Freigegeben erscheint der Spruch heute bei allen auf der Startseite. Abgelehnt bekommt die Person die Punkte zurück.</span>
                  {pend.map(([k, pr]: [string, any]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
                      <span style={{ flex: '1 1 240px', fontSize: '16px' }}><strong>{pr._displayName || k}:</strong> „{pr._spruch.text}“</span>
                      <button onClick={() => decide(k, true)} style={smallBtn()}>✓ Freigeben</button>
                      <button onClick={() => decide(k, false)} style={smallBtn('danger')}>✗ Ablehnen</button>
                    </div>
                  ))}
                </div>
              );
            })()}
      <div role="tablist" aria-label="Ausbilder-Bereiche" style={{ display: 'flex', gap: '6px', padding: '6px', borderRadius: '18px', backgroundColor: dc('#F4EADB'), overflowX: 'auto' }}>
        {tabs.map(t => {
          const active = adminTab === t.id;
          return (
            <button key={t.id} role="tab" aria-selected={active} onClick={() => setAdminTab(t.id)} style={{ flex: '1 0 auto', minHeight: '52px', padding: '0 18px', borderRadius: '14px', border: 'none', backgroundColor: active ? TH.brown : 'transparent', color: active ? dc('#FFF6E0') : TH.brown, fontSize: '17px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{t.label}</button>
          );
        })}
      </div>

      {/* ═════════ MITARBEITER ═════════ */}
      {adminTab === 'team' && (
        allKnownUserKeys.length === 0 ? (
          <div style={cardStyle}><p style={{ margin: 0, fontSize: '18px', color: TH.muted }}>Noch keine Mitarbeiter angemeldet.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                shown.slice(0, 20).forEach((x, i) => lines.push(`${i + 1}. ${x.q.question}\n   Richtig: ${getRightAnswerText(x.q)}\n   Offen bei: ${x.users.map(nameOf).join(', ')}`));
                const txt = lines.join('\n');
                try { await navigator.clipboard.writeText(txt); alert('Liste kopiert, z. B. für die Teambesprechung oder WhatsApp.'); } catch { window.prompt('Liste zum Kopieren:', txt); }
              };
              return (
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', border: `2px solid ${TH.yellow}` }}>
                  <button onClick={() => setTeamOpen(!teamOpen)} aria-expanded={teamOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', padding: '16px 20px', border: 'none', background: 'transparent', color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
                    <span style={{ flex: '0 0 52px', height: '52px', borderRadius: '50%', backgroundColor: TH.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>👥</span>
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
              const lastSeenTime = seenInfo?.time || matchingScores[0]?.date || '–';
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
              const sortedScores = [...matchingScores].sort((a, b) => Number(b.score) - Number(a.score));

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
                                { l: 'Schwächster Bereich', v: w.weakestCat ? `${w.weakestCat.cat} (${w.weakestCat.pct} %)` : '–' },
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
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
      )}

      {/* ═════════ NACHRICHT ═════════ */}
      {adminTab === 'message' && (
        <div style={cardStyle}>
          {sectionTitle('Nachricht an alle', 'Erscheint auf der Startseite und einmal als Pop-up bei jedem Mitarbeiter.')}
          {activePinboard && activePinboard.text && (
            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: TH.tintYellow, marginBottom: '14px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Aktuell angepinnt · {activePinboard.updatedAt}{(activePinboard as any).banner ? ` · 📣 Banner${(activePinboard as any).until ? ` bis ${String((activePinboard as any).until).split('-').reverse().join('.')}` : ''}` : ''}</div>
              {activePinboard.image && <img src={activePinboard.image} alt="" style={{ width: '100%', maxWidth: '360px', borderRadius: '14px', marginTop: '8px', display: 'block' }} />}
              <div style={{ fontFamily: TH.serif, fontSize: '24px', marginTop: '6px', whiteSpace: 'pre-line' }}>„{activePinboard.text}“</div>
            </div>
          )}
          <label style={labelStyle}>
            Neue Nachricht
            <textarea rows={4} value={pinboardDraft} onChange={(e) => setPinboardDraft(e.target.value)} placeholder="z. B. Diese Woche: Fokus auf Allergene!" style={{ ...inputStyle, minHeight: '120px' }} />
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>Foto (freiwillig)</span>
            {pinImage ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <img src={pinImage} alt="Vorschau" style={{ width: '160px', borderRadius: '12px', border: `2px solid ${TH.line}` }} />
                <button type="button" onClick={() => setPinImage('')} style={smallBtn('danger')}>Foto entfernen</button>
              </div>
            ) : (
              <label style={{ ...smallBtn(), display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', gap: '8px' }}>
                📷 {pinImgBusy ? 'Wird geladen …' : 'Foto auswählen'}
                <input type="file" accept="image/*" onChange={(e) => { loadPinImage(e.target.files && e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
              </label>
            )}
            <span style={{ fontSize: '15px', color: TH.muted }}>Ohne Foto erscheint nur der Text.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintYellow }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>
              <input type="checkbox" checked={pinBanner} onChange={(e) => setPinBanner(e.target.checked)} style={{ width: '22px', height: '22px', accentColor: TH.brown }} />
              📣 Zusätzlich als Banner oben auf jeder Seite zeigen
            </label>
            {pinBanner && (
              <label style={labelStyle}>
                Banner zeigen bis (freiwillig)
                <input type="date" value={pinUntil} onChange={(e) => setPinUntil(e.target.value)} style={{ ...inputStyle, maxWidth: '240px' }} />
              </label>
            )}
            <span style={{ fontSize: '15px', color: TH.muted }}>Der Banner ist auffälliger als die normale Nachricht. Jeder kann ihn für sich wegklicken.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button
              type="button"
              disabled={!pinboardDraft.trim()}
              onClick={() => {
                if (!pinboardDraft.trim()) return;
                const nowStr = new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
                overwriteCloudDataDirectly((curr) => {
                  curr.pinboard = { text: pinboardDraft.trim(), author: 'Ausbilder', updatedAt: nowStr, timestamp: Date.now(), ...(pinImage ? { image: pinImage } : {}), ...(pinBanner ? { banner: true, until: pinUntil || '' } : {}) } as any;
                  return curr;
                });
                setPinboardDraft('');
                setPinImage('');
                setPinBanner(false); setPinUntil('');
                alert('Die Nachricht ist jetzt für alle angepinnt.');
              }}
              style={{ ...btnPrimary, opacity: pinboardDraft.trim() ? 1 : 0.5 }}
            >
              Nachricht anpinnen
            </button>
            {activePinboard && (
              <button type="button" onClick={() => { if (confirm('Aktuelle Nachricht entfernen?')) overwriteCloudDataDirectly((curr) => { curr.pinboard = null; return curr; }); }} style={smallBtn('danger')}>Aktuelle Nachricht entfernen</button>
            )}
          </div>
        </div>
      )}

      {/* ═════════ INHALTE ═════════ */}
      {adminTab === 'content' && (
        <>
          {renderFixEditor()}
          <div style={cardStyle}>
            {sectionTitle('Katalogfragen korrigieren', 'Fehler in einer Frage entdeckt? Suche sie und korrigiere sie direkt, ohne Code.')}
            <input value={fixSearch} onChange={(e) => setFixSearch(e.target.value)} placeholder="Suchbegriff, z. B. „Kartäuser“ oder „Schnittstärke“ (mind. 3 Buchstaben)" style={inputStyle} />
            {fixMsg && fixId === null && <div style={{ marginTop: '10px', color: TH.green, fontWeight: 700 }}>{fixMsg}</div>}
            {fixResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {fixResults.map((q: any) => (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.cream, border: `1px solid ${TH.line}` }}>
                    <span style={{ flex: '1 1 260px', fontSize: '16px', lineHeight: 1.4 }}>
                      {q.question}
                      <span style={{ display: 'block', fontSize: '14px', color: TH.muted }}>{q.category || (q.examGroup ? 'Prüfung' : '')}{q.product ? ` · ${q.product}` : ''}{activeEdit(q.id) ? ' · korrigiert' : ''}</span>
                    </span>
                    <button onClick={() => startFix(q.id)} style={smallBtn('warn')}>✏️ Korrigieren</button>
                  </div>
                ))}
              </div>
            )}
            {fixSearch.trim().length >= 3 && fixResults.length === 0 && <div style={{ marginTop: '10px', color: TH.muted }}>Keine Frage gefunden.</div>}
            {editedIds.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '17px' }}>Korrigierte Fragen ({editedIds.length})</strong>
                {editedIds.map(id => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.tintSage }}>
                    <span style={{ flex: '1 1 240px', fontSize: '16px' }}>{allQById.get(id)?.question}</span>
                    <button onClick={() => startFix(id)} style={smallBtn()}>Bearbeiten</button>
                    <button onClick={() => restoreOriginal(id)} style={smallBtn('danger')}>Original wiederherstellen</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={cardStyle}>
            {sectionTitle(editingQId !== null ? 'Quizfrage bearbeiten' : 'Neue Quizfrage', editingQId !== null ? 'Ändere die Felder und speichere.' : 'Erscheint sofort im Quiz aller Mitarbeiter.')}
            <form onSubmit={handleAddCustomQuizQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={labelStyle}>Frage<textarea rows={2} placeholder="Fragetext eingeben …" value={quizQuestionText} onChange={(e) => setQuizQuestionText(e.target.value)} style={inputStyle} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <label style={labelStyle}>Bereich<select value={quizCat} onChange={(e) => setQuizCat(e.target.value)} style={inputStyle}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
                <label style={labelStyle}>Schwierigkeit<select value={quizLevel} onChange={(e) => setQuizLevel(e.target.value as any)} style={inputStyle}><option value="easy">Einfach</option><option value="hard">Schwer</option></select></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { l: 'Antwort A (Pflicht)', v: optA, set: setOptA },
                  { l: 'Antwort B (Pflicht)', v: optB, set: setOptB },
                  { l: 'Antwort C (optional)', v: optC, set: setOptC },
                  { l: 'Antwort D (optional)', v: optD, set: setOptD },
                ].map((o, i) => (
                  <label key={i} style={labelStyle}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {o.l}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 400, fontSize: '15px' }}>
                        <input type="radio" name="correctOpt" checked={correctOptIdx === i} onChange={() => setCorrectOptIdx(i)} /> richtig
                      </span>
                    </span>
                    <input type="text" value={o.v} onChange={(e) => o.set(e.target.value)} style={{ ...inputStyle, borderColor: correctOptIdx === i ? TH.green : TH.line, backgroundColor: correctOptIdx === i ? TH.tintSage : TH.cream }} />
                  </label>
                ))}
              </div>
              <label style={labelStyle}>Erklärung<textarea rows={2} placeholder="Warum ist die Antwort richtig?" value={quizExplanation} onChange={(e) => setQuizExplanation(e.target.value)} style={inputStyle} /></label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="submit" style={btnPrimary}>{editingQId !== null ? 'Änderungen speichern' : 'Quizfrage speichern'}</button>
                {editingQId !== null && <button type="button" onClick={cancelEditQuestion} style={smallBtn()}>Abbrechen</button>}
              </div>
            </form>
            {customQuestions.length > 0 && (
              <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '17px' }}>Eigene Quizfragen ({customQuestions.length})</strong>
                {customQuestions.map((cq) => (
                  <div key={cq.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.cream }}>
                    <span style={{ flex: '1 1 240px', fontSize: '16px' }}><strong>{cq.category}:</strong> {cq.question}</span>
                    <button onClick={() => startEditQuestion(cq)} style={smallBtn()}>Bearbeiten</button>
                    <button onClick={() => handleDeleteCustomQuestion(cq.id)} style={smallBtn('danger')}>Löschen</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div id="lt-np-form" style={{ ...cardStyle, borderColor: TH.green, borderWidth: '3px' }}>
            {sectionTitle(np.id ? `Neues Produkt bearbeiten: ${np.name}` : '🆕 Neues Produkt ins Sortiment', 'Für neue Ware oder Saisonware. Das Produkt bekommt einen Steckbrief, kommt in die Spiele, und die Quizfragen (Zutaten, Allergene, Preis, Warengruppe, Beschreibung, Schnitt) entstehen automatisch.')}
            <form onSubmit={saveNewProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <label style={labelStyle}>Name<input type="text" placeholder="z. B. Lebkuchenherz" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} style={inputStyle} /></label>
                <label style={labelStyle}>Warengruppe
                  <select value={np.group} onChange={(e) => setNp({ ...np, group: e.target.value })} style={inputStyle}>{npGroups.map(g => <option key={g} value={g}>{g}</option>)}</select>
                </label>
                {np.group === 'Brot' && (
                  <label style={labelStyle}>Brotsorte (für den Schnitt)
                    <select value={np.breadType || 'roggenmisch'} onChange={(e) => setNp({ ...np, breadType: e.target.value })} style={inputStyle}>
                      <option value="schwarzbrot">Vollkornschwarzbrot (5,5 mm)</option><option value="roggen">Roggenbrot (9 mm)</option><option value="roggenmisch">Roggenmischbrot (9 mm)</option><option value="weizenmisch">Weizenmischbrot (9 mm)</option><option value="dinkel">Dinkelbrot (9 mm)</option><option value="spezial">Spezialbrot (9 mm)</option><option value="weizen">Weizenbrot (12 mm)</option><option value="stuten">Stuten (12 mm)</option>
                    </select>
                  </label>
                )}
                <label style={labelStyle}>Preis<input type="text" inputMode="decimal" placeholder="2,90 €" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} style={inputStyle} /></label>
                <label style={labelStyle}>Gewicht<input type="text" placeholder="z. B. 750 g" value={np.weight} onChange={(e) => setNp({ ...np, weight: e.target.value })} style={inputStyle} /></label>
              </div>
              <label style={labelStyle}>Beschreibung (wie im Shop)<textarea rows={3} placeholder="Unser Lebkuchenherz ist …" value={np.info} onChange={(e) => setNp({ ...np, info: e.target.value })} style={{ ...inputStyle, minHeight: '90px' }} /></label>
              <label style={labelStyle}>Im Verkauf sagen (Kurz-Zutaten)<input type="text" placeholder="z. B. Lebkuchenteig, Honig, Mandeln, Zuckerguss" value={np.shortIngredients} onChange={(e) => setNp({ ...np, shortIngredients: e.target.value })} style={inputStyle} /></label>
              <label style={labelStyle}>Vollständige Zutatenliste (optional)<textarea rows={3} value={np.fullIngredients} onChange={(e) => setNp({ ...np, fullIngredients: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} /></label>
              {(['allergens', 'traces'] as const).map(field => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>{field === 'allergens' ? 'Allergene (enthalten)' : 'Kann Spuren enthalten von'}</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {NP_ALLERGENS.map(a => <button key={a} type="button" onClick={() => toggleNpList(field, a)} style={chip(np[field].includes(a))}>{np[field].includes(a) ? '✓ ' : ''}{a}</button>)}
                  </div>
                </div>
              ))}
              {npMsg && <div style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: npMsg.startsWith('Gespeichert') ? TH.tintSage : TH.tintPeach, fontSize: '16px' }}>{npMsg}</div>}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="submit" style={btnPrimary}>{np.id ? 'Änderungen speichern' : 'Produkt anlegen'}</button>
                {np.id && <button type="button" onClick={() => { setNp(emptyNp); setNpMsg(''); }} style={smallBtn()}>Abbrechen</button>}
              </div>
            </form>
            {sortimentProducts.length > 0 && (
              <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '17px' }}>Von dir angelegte Produkte ({sortimentProducts.length})</strong>
                {sortimentProducts.map((p: any) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.cream }}>
                    <span style={{ flex: '1 1 240px', fontSize: '16px' }}><strong>{p.name}</strong> <span style={{ color: TH.muted }}>· {p.group}{p.price ? ` · ${p.price}` : ''}{Date.now() - (Number(p.createdAt) || 0) < 21 * 864e5 ? ' · 🆕 auf der Startseite' : ''}</span></span>
                    <button onClick={() => editNewProduct(p)} style={smallBtn()}>Bearbeiten</button>
                    <button onClick={() => deleteNewProduct(p)} style={smallBtn('danger')}>Entfernen</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            {sectionTitle(editingPId ? 'Artikel bearbeiten' : 'Neuer Artikel oder Aktion', editingPId ? 'Ändere die Felder und speichere.' : 'Als Steckbrief, im Backkalender oder im Saisonkalender.')}
            <form onSubmit={handleAddCustomProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <label style={labelStyle}>Name<input type="text" placeholder="z. B. Osterstollen" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} style={inputStyle} /></label>
                <label style={labelStyle}>Wo soll er erscheinen?
                  <select value={targetArea} onChange={(e) => setTargetArea(e.target.value as any)} style={inputStyle}>
                    <option value="profile">Als Steckbrief</option>
                    <option value="bake_day">Im Backkalender</option>
                    <option value="seasonal">Im Saisonkalender</option>
                  </select>
                </label>
                {targetArea === 'bake_day' && (
                  <label style={labelStyle}>Wochentag
                    <select value={selectedBakeDayForAdd} onChange={(e) => setSelectedBakeDayForAdd(Number(e.target.value))} style={inputStyle}>
                      {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'].map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
                    </select>
                  </label>
                )}
                {targetArea === 'seasonal' && (
                  <label style={labelStyle}>Jahreszeit
                    <select value={selectedSeasonForAdd} onChange={(e) => setSelectedSeasonForAdd(e.target.value)} style={inputStyle}>
                      <option value="Frühling">Frühling</option><option value="Sommer">Sommer</option><option value="Herbst">Herbst</option><option value="Winter">Winter & Karneval</option>
                    </select>
                  </label>
                )}
                {targetArea !== 'seasonal' && (
                  <>
                    <label style={labelStyle}>Gruppe
                      <select value={newProdGroup} onChange={(e) => setNewProdGroup(e.target.value)} style={inputStyle}>
                        <option value="Roggenmischbrot">Roggenmischbrot</option>
                        <option value="Rheinisches Schwarzbrot">Schwarzbrot</option>
                        <option value="Weizenbrot & Baguette">Weizenbrot</option>
                        <option value="Süße Stuten & Brioche">Stuten & Brioche</option>
                        <option value="Brötchen & Feingebäck">Brötchen & Gebäck</option>
                        <option value="Kuchen & Dauergebäck">Kuchen & Dauergebäck</option>
                      </select>
                    </label>
                    <label style={labelStyle}>Schnitt
                      <select value={newProdSlice} onChange={(e) => setNewProdSlice(e.target.value)} style={inputStyle}>
                        <option value="5,5 mm">5,5 mm</option><option value="9 mm">9 mm</option><option value="12 mm">12 mm</option><option value="Nach Wunsch">Nach Wunsch</option>
                      </select>
                    </label>
                  </>
                )}
              </div>
              <label style={labelStyle}>Beschreibung<textarea rows={2} placeholder={targetArea === 'seasonal' ? 'Beschreibung der Aktion …' : 'Produktinfos, Mehl, Besonderheit …'} value={newProdInfo} onChange={(e) => setNewProdInfo(e.target.value)} style={inputStyle} /></label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="submit" style={btnPrimary}>{editingPId ? 'Änderungen speichern' : 'Artikel speichern'}</button>
                {editingPId && <button type="button" onClick={cancelEditProduct} style={smallBtn()}>Abbrechen</button>}
              </div>
            </form>
            {customProducts.filter(cp => cp.targetArea !== 'sortiment').length > 0 && (
              <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '17px' }}>Hinzugefügte Artikel ({customProducts.filter(cp => cp.targetArea !== 'sortiment').length})</strong>
                {customProducts.filter(cp => cp.targetArea !== 'sortiment').map(cp => (
                  <div key={cp.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.cream }}>
                    <span style={{ flex: '1 1 240px', fontSize: '16px' }}><strong>{cp.name}</strong> <span style={{ color: TH.muted }}>· {cp.targetArea === 'bake_day' ? `Backkalender (${['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][cp.dayOfWeek || 0] || ''})` : cp.targetArea === 'seasonal' ? `Saison (${cp.seasonKey})` : 'Steckbrief'}</span></span>
                    <button onClick={() => startEditProduct(cp)} style={smallBtn()}>Bearbeiten</button>
                    <button onClick={() => handleDeleteCustomProduct(cp.id)} style={smallBtn('danger')}>Löschen</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═════════ MELDUNGEN ═════════ */}
      {adminTab === 'reports' && (
        <>
          {renderFixEditor()}
          {renderProductFixEditor()}
          {!pfName && pfMsg && <div style={{ ...cardStyle, padding: '14px 18px', fontWeight: 700, color: TH.green, whiteSpace: 'pre-line' }}>{pfMsg}</div>}
          <div style={cardStyle}>
            {sectionTitle('Gemeldete Fehler', 'Mitarbeiter können im Quiz, in allen Spielen, in den Lernkarten und Steckbriefen auf „Fehler melden“ tippen und einen Verbesserungsvorschlag schreiben. Hier siehst du alle Meldungen.')}
            {reports.length === 0 ? (
              <p style={{ margin: 0, fontSize: '18px', color: TH.muted }}>Keine offenen Meldungen, alles in Ordnung. 👍</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.map(rep => (
                  <div key={rep.qid} style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.cream, border: `2px solid ${TH.line}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rep.q ? (
                      <div style={{ fontSize: '17px', lineHeight: 1.45 }}>
                        <div style={{ fontSize: '14px', color: TH.muted, fontWeight: 700 }}>{rep.q.category || (rep.q.examGroup ? 'Prüfung' : '')}{rep.q.product ? ` · ${rep.q.product}` : ''} · Nr. {rep.qid}</div>
                        <div style={{ fontWeight: 700, marginTop: '2px' }}>{rep.q.question}</div>
                        <div style={{ color: TH.green, marginTop: '4px' }}>Hinterlegte Antwort: <strong>{getRightAnswerText(rep.q)}</strong></div>
                        {rep.q.explanation && <div style={{ color: TH.muted, fontSize: '15px', marginTop: '2px' }}>{rep.q.explanation}</div>}
                      </div>
                    ) : rep.game ? (
                      <div style={{ fontSize: '17px', lineHeight: 1.45 }}>
                        <div style={{ fontSize: '14px', color: TH.muted, fontWeight: 700 }}>{rep.game}{rep.product ? ` · ${rep.product}` : ''}</div>
                        <div style={{ marginTop: '4px', whiteSpace: 'pre-line' }}>{rep.ctx}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '17px', color: TH.muted }}>Frage Nr. {rep.qid} (gibt es nicht mehr)</div>
                    )}
                    {rep.q && rep.game && <div style={{ fontSize: '14px', color: TH.muted, fontWeight: 700 }}>Gemeldet aus: {Array.from(new Set(rep.items.map(i => i.g || 'Quiz'))).join(', ')}</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {rep.items.map((it, i) => (
                        <div key={i} style={{ padding: '10px 12px', borderRadius: '12px', backgroundColor: TH.tintYellow, fontSize: '16px', lineHeight: 1.4 }}>
                          <strong>{nameOf(it.user)}</strong> · {it.d}: <strong>{it.r}</strong>{it.t ? `, „${it.t}“` : ''}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {rep.q && <button onClick={() => startFix(Number(rep.qid))} style={smallBtn('warn')}>✏️ Frage korrigieren</button>}
                      {rep.product && SHOP_PRODUCTS.some(p => p.name === rep.product) && <button onClick={() => startProductFix(rep.product!, rep.qid)} style={smallBtn('warn')}>🛠️ Produkt korrigieren</button>}
                      {!rep.q && rep.game && <button onClick={() => copyReportText(rep)} style={smallBtn()}>📋 Meldung kopieren</button>}
                      <button onClick={() => resolveReport(rep.qid)} style={smallBtn()}>Erledigt ✓</button>
                      {rep.q && <button onClick={() => hideQuestion(rep.qid)} style={smallBtn('danger')}>Frage ausblenden</button>}
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: '15px', color: TH.muted }}>Tipp: Mit „Frage korrigieren“ änderst du Text, Antworten oder Erklärung einer Quizfrage. Mit „Produkt korrigieren“ änderst du Preis, Zutaten, Allergene oder Alternativen eines Produkts, das gilt dann in allen Spielen. Die Meldung wird dabei automatisch erledigt. Geht es um einen Spieltext (z. B. im Theken-Simulator), tippe auf „Meldung kopieren“ und schick sie mir.</div>
              </div>
            )}
          </div>
          <div style={cardStyle}>
            {sectionTitle('Produktdaten korrigieren', 'Auch ohne Meldung: Preis, Zutaten, Allergene oder Alternativen eines Produkts ändern. Gilt sofort in allen Spielen.')}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select value="" onChange={(e) => e.target.value && startProductFix(e.target.value)} style={{ ...inputStyle, flex: '1 1 260px', width: 'auto' }}>
                <option value="">Produkt auswählen …</option>
                {shopNames.map(n => <option key={n} value={n}>{n}{pFixes[n] && !pFixes[n].restored ? ' (korrigiert)' : ''}</option>)}
              </select>
            </div>
            {fixedProducts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Bereits korrigiert</div>
                {fixedProducts.map(n => {
                  const f = pFixes[n];
                  const what = [f.price ? 'Preis' : '', f.shortIngredients ? 'Zutaten' : '', f.allergens ? 'Allergene' : '', f.alts ? 'Alternativen' : ''].filter(Boolean).join(', ');
                  return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream }}>
                      <span style={{ flex: '1 1 220px', fontSize: '16px' }}><strong>{n}</strong>{what ? ` · ${what}` : ''}</span>
                      <button onClick={() => startProductFix(n)} style={smallBtn('warn')}>Bearbeiten</button>
                      <button onClick={() => restoreProduct(n)} style={smallBtn()}>Original</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {hiddenBuiltIn.length > 0 && (
            <div style={cardStyle}>
              {sectionTitle(`Ausgeblendete Fragen (${hiddenBuiltIn.length})`, 'Diese Fragen kommen gerade nirgends dran.')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hiddenBuiltIn.map(id => {
                  const q = allQById.get(id);
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.cream }}>
                      <span style={{ flex: '1 1 260px', fontSize: '16px' }}>{q?.question || `Frage Nr. ${id}`}</span>
                      <button onClick={() => restoreQuestion(id)} style={smallBtn()}>Wieder einblenden</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═════════ AUSWERTUNG ═════════ */}
      {adminTab === 'stats' && (() => {
        const active = allKnownUserKeys.filter(k => weekInfo(k).learnDays.length > 0);
        const lastDay = (k: string) => { const d = weekInfo(k).days; return d.length ? [...d].sort().slice(-1)[0] : ''; };
        const twoWeeks = new Date(); twoWeeks.setDate(twoWeeks.getDate() - 7);
        const limit = `${twoWeeks.getFullYear()}-${String(twoWeeks.getMonth() + 1).padStart(2, '0')}-${String(twoWeeks.getDate()).padStart(2, '0')}`;
        const behind = allKnownUserKeys.filter(k => { const l = lastDay(k); return !l || l < limit; });
        const check = Object.keys(qStats).map(Number).filter(id => { const st = qStats[id]; const n = st.r + st.w; return n >= 5 && st.w / n >= 0.6 && allQById.has(id) && !hiddenMap[String(id)]; })
          .sort((x, y) => (qStats[y].w / (qStats[y].r + qStats[y].w)) - (qStats[x].w / (qStats[x].r + qStats[x].w)));
        return (
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sectionTitle('Auf einen Blick', 'Wer ist dabei, wer braucht einen Schubs, welche Fragen solltest du prüfen?')}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.tintSage }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>Diese Woche aktiv</div>
                <div style={{ fontFamily: TH.serif, fontSize: '34px', lineHeight: 1.1 }}>{active.length} von {allKnownUserKeys.length}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: behind.length ? TH.tintPeach : TH.cream }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.muted }}>Seit über einer Woche nicht gelernt</div>
                {behind.length === 0 ? <div style={{ fontSize: '17px', fontWeight: 700, color: TH.green, marginTop: '4px' }}>Niemand, super!</div> : behind.map(k => (
                  <div key={k} style={{ fontSize: '16px', marginTop: '4px' }}><strong>{nameOf(k)}</strong> · {lastDay(k) ? `zuletzt ${lastDay(k).split('-').reverse().join('.')}` : 'noch nie'}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '19px' }}>Fragen zum Prüfen {check.length > 0 ? `(${check.length})` : ''}</div>
              <div style={{ fontSize: '15px', color: TH.muted }}>Mindestens 5 Antworten und über 60 % falsch. Oft ist die Frage unklar oder die Antwort stimmt nicht mehr.</div>
              {check.length === 0 ? <div style={{ fontSize: '17px', color: TH.green, fontWeight: 700 }}>Gerade keine auffälligen Fragen.</div> : check.slice(0, 15).map(id => {
                const q = allQById.get(id); const st = qStats[id]; const rate = Math.round(st.w / (st.r + st.w) * 100);
                return (
                  <div key={id} style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintPeach, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '17px', lineHeight: 1.4 }}>{q.question}</div>
                    <div style={{ fontSize: '15px', color: TH.green }}>Richtig laut App: <strong>{getRightAnswerText(q)}</strong></div>
                    <div style={{ fontSize: '15px', color: TH.red, fontWeight: 700 }}>{rate} % falsch · {st.r + st.w} Antworten von {st.users} {st.users === 1 ? 'Person' : 'Personen'}</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => startFix(id)} style={smallBtn('warn')}>✏️ Korrigieren</button>
                      <button onClick={() => hideQuestion(String(id))} style={smallBtn('danger')}>Ausblenden</button>
                    </div>
                  </div>
                );
              })}
              {renderFixEditor()}
            </div>
          </div>
        );
      })()}

      {adminTab === 'stats' && (
        <div style={{ ...cardStyle, marginBottom: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
            {sectionTitle('Wochenbericht', `Woche ab ${wStart.toLocaleDateString('de-DE')}, wer war wie aktiv?`)}
            {allKnownUserKeys.length > 0 && <button onClick={copyReport} style={smallBtn()}>Bericht kopieren</button>}
          </div>
          {allKnownUserKeys.length === 0 ? (
            <p style={{ margin: 0, fontSize: '18px', color: TH.muted }}>Noch keine Mitarbeiter angemeldet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px', minWidth: '640px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: TH.muted }}>
                    {['Name', 'Lerntage', 'Punkte', 'Serie', 'Schwächster Bereich', 'Theke üben'].map(h => <th key={h} style={{ padding: '8px 10px', borderBottom: `2px solid ${TH.line}`, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...allKnownUserKeys].sort((a, b) => weekInfo(b).learnDays.length - weekInfo(a).learnDays.length).map(k => {
                    const w = weekInfo(k);
                    return (
                      <tr key={k} style={{ backgroundColor: w.learnDays.length === 0 ? TH.tintPeach : 'transparent' }}>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}`, fontWeight: 700 }}>{nameOf(k)}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.learnDays.length} / 7</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.weekPoints.toLocaleString('de-DE')}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.streak}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.weakestCat ? `${w.weakestCat.cat} (${w.weakestCat.pct} %)` : '–'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${TH.line}` }}>{w.thekeWeak.length ? w.thekeWeak.map(t => t.topic).join(', ') : '–'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ fontSize: '15px', color: TH.muted, marginTop: '8px' }}>Rot markiert: diese Woche noch nicht gelernt.</div>
            </div>
          )}
        </div>
      )}

      {adminTab === 'stats' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
            {sectionTitle('Schwachstellen im Team', 'Wo passieren die meisten Fehler? Hier lohnt sich eine kurze Schulung.')}
            {hardestQs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (!confirm('Die Fehler-Statistik des ganzen Teams auf 0 zurücksetzen? (Der Fehler-Stapel der Mitarbeiter bleibt.)')) return;
                  overwriteCloudDataDirectly((curr) => {
                    curr.wrongStats = {};
                    Object.keys(curr.progress || {}).forEach(uKey => { if (curr.progress[uKey]) { curr.progress[uKey].wrongStats = {}; curr.progress[uKey]._qs = {}; } });
                    return curr;
                  });
                }}
                style={smallBtn('danger')}
              >
                Statistik zurücksetzen
              </button>
            )}
          </div>
          {hardestQs.length === 0 && thekeWeakTeam.length === 0 ? (
            <p style={{ margin: 0, fontSize: '18px', color: TH.muted }}>Noch keine Fehler aufgezeichnet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.cream, border: `2px solid ${TH.line}` }}>
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Fehlerquote je Bereich</div>
                  {catWeak.length === 0 ? <div style={{ color: TH.muted }}>Noch keine Daten.</div> : catWeak.map(c => (
                    <div key={c.key} style={{ marginBottom: '10px', fontSize: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><span>{c.key}</span><strong>{c.rate} %</strong></div>
                      {rateBar(c.rate)}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.cream, border: `2px solid ${TH.line}` }}>
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Produkte mit den meisten Fehlern</div>
                  {productWeak.length === 0 ? <div style={{ color: TH.muted }}>Noch keine Daten.</div> : productWeak.map(c => (
                    <div key={c.key} style={{ marginBottom: '10px', fontSize: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><span>{c.key}</span><strong>{c.w}× falsch</strong></div>
                      {rateBar(c.rate)}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: TH.cream, border: `2px solid ${TH.line}` }}>
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Theken-Simulator: schwierigste Themen</div>
                  {thekeWeakTeam.length === 0 ? <div style={{ color: TH.muted }}>Noch keine Daten.</div> : thekeWeakTeam.map(c => (
                    <div key={c.key} style={{ marginBottom: '10px', fontSize: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><span>{c.key}</span><strong>{c.rate} % falsch</strong></div>
                      {rateBar(c.rate)}
                    </div>
                  ))}
                </div>
              </div>
              {hardestQs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '19px' }}>{hardestQs.length === 1 ? 'Die schwierigste Frage' : `Die ${hardestQs.length} schwierigsten Fragen`}</div>
                  {hardestQs.map((qId, idx) => {
                    const foundQ = allQById.get(qId);
                    const st = qStats[qId];
                    const rate = st.r + st.w ? Math.round((st.w / (st.r + st.w)) * 100) : 0;
                    return (
                      <div key={qId} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', borderRadius: '16px', backgroundColor: idx < 3 ? TH.tintPeach : TH.cream, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: TH.serif, fontSize: '28px', lineHeight: 1, minWidth: '32px' }}>{idx + 1}</span>
                        <div style={{ flex: '1 1 260px', fontSize: '17px', lineHeight: 1.45 }}>
                          <div style={{ fontWeight: 700 }}>{foundQ.question}</div>
                          <div style={{ color: TH.muted, fontSize: '15px' }}>{foundQ.category || (foundQ.examGroup === 'ZP' ? 'Zwischenprüfung' : 'Abschlussprüfung')}{foundQ.product ? ` · ${foundQ.product}` : ''}</div>
                          <div style={{ color: TH.green, marginTop: '4px' }}>Richtig: <strong>{getRightAnswerText(foundQ)}</strong></div>
                        </div>
                        <span style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: TH.white, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'right', fontSize: '15px', lineHeight: 1.4 }}>
                          {st.w}× falsch{st.r ? ` · ${rate} %` : ''}<br /><span style={{ fontWeight: 400, color: TH.muted }}>bei {st.users} {st.users === 1 ? 'Person' : 'Personen'}</span>
                        </span>
                      </div>
                    );
                  })}
                  <div style={{ fontSize: '15px', color: TH.muted }}>Prozent = Anteil falscher Antworten. Richtige Antworten werden ab diesem Update mitgezählt, die Quote wird also mit der Zeit genauer.</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═════════ EINSTELLUNGEN ═════════ */}
      {adminTab === 'settings' && (
        <>
          <div style={cardStyle}>
            {sectionTitle('Sicherung (Backup)', 'Alle Daten der App als Datei sichern: Punkte, Lernfortschritt, Meldungen, Korrekturen, Nachrichten und eigene Inhalte. Die Produktfotos sind nicht dabei.')}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" onClick={downloadBackup} style={btnPrimary}>💾 Sicherung herunterladen</button>
              <label style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                ↩️ Sicherung wiederherstellen
                <input type="file" accept=".json,application/json" onChange={(e) => { restoreBackup(e.target.files && e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
              </label>
            </div>
            {backupMsg && <div style={{ marginTop: '10px', fontWeight: 700, color: backupMsg.startsWith('Fehler') ? TH.red : TH.green }}>{backupMsg}</div>}
            <div style={{ fontSize: '15px', color: TH.muted, marginTop: '10px' }}>Tipp: Einmal im Monat eine Sicherung herunterladen und gut aufheben. Beim Wiederherstellen wird der aktuelle Stand durch die Sicherung ersetzt.</div>
          </div>
          <div style={cardStyle}>
            {sectionTitle('Produktfotos', 'Die Fotos für Steckbriefe, Bilderquiz und Allergene-Training. Einmal hochladen, dann sehen alle Mitarbeiter sie.')}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '14px', backgroundColor: imageCount > 0 ? TH.tintSage : TH.tintYellow, color: imageCount > 0 ? TH.green : TH.ink, fontSize: '17px', fontWeight: 700, marginBottom: '14px' }}>
              {imageCount > 0 ? `${imageCount} Fotos geladen` : 'Noch keine Fotos geladen'}
            </div>
            <label style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: imageBusy ? 0.6 : 1 }}>
              {imageBusy ? 'Wird hochgeladen …' : 'Datei „hinkel_bilder.json“ auswählen'}
              <input
                type="file"
                accept=".json,application/json"
                disabled={imageBusy || !onImportImages}
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const f = e.target.files && e.target.files[0];
                  e.target.value = '';
                  if (!f || !onImportImages) return;
                  setImageBusy(true); setImageMsg('');
                  const msg = await onImportImages(f);
                  setImageBusy(false); setImageMsg(msg);
                }}
              />
            </label>
            {imageMsg && <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '14px', backgroundColor: TH.tintYellow, fontSize: '17px', fontWeight: 700 }}>{imageMsg}</div>}
          </div>

          <div style={cardStyle}>
            {sectionTitle('Cloud-Verbindung', 'Hier werden Punkte, Fortschritt und Nachrichten aller Mitarbeiter gespeichert.')}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '14px', backgroundColor: cloudConnected ? TH.tintSage : TH.tintPeach, color: cloudConnected ? TH.green : TH.red, fontSize: '17px', fontWeight: 700, marginBottom: '14px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cloudConnected ? TH.green : TH.red }} />
              {cloudConnected ? 'Verbunden, alles wird synchronisiert' : 'Nicht verbunden, Daten nur auf diesem Gerät'}
            </div>
            <label style={labelStyle}>
              Adresse der Datenbank
              <input type="text" value={tempCloudUrl} onChange={(e) => setTempCloudUrl(e.target.value)} placeholder="https://…firebasedatabase.app" style={inputStyle} />
            </label>
            <button
              type="button"
              onClick={() => {
                const clean = tempCloudUrl.trim();
                setCloudUrl(clean);
                localStorage.setItem('hinkel_cloud_url', clean);
                if (clean) fetchCloudData(clean);
                else setCloudConnected(false);
              }}
              style={{ ...btnPrimary, marginTop: '14px' }}
            >
              Speichern & verbinden
            </button>
          </div>

          <div style={{ ...cardStyle, borderColor: dc('#F5C6AE') }}>
            {(() => {
              const cutoff = compactCutoff();
              const prev = compactScores(cloudData.scores || [], cutoff);
              const kb = (n: number) => Math.max(1, Math.round(JSON.stringify((cloudData.scores || []).slice(0, n)).length / 1024));
              const saved = prev.before > 0 ? Math.round((1 - JSON.stringify(prev.scores).length / Math.max(1, JSON.stringify(cloudData.scores || []).length)) * 100) : 0;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {sectionTitle('Bestenliste aufräumen', 'Hält die App schnell, wenn sich über die Monate viele Spielrunden ansammeln.')}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.white, border: `2px solid ${TH.line}` }}>
                    <span style={{ fontSize: '17px', flex: '1 1 260px' }}>
                      <strong>Alte Runden zusammenfassen</strong>
                      <span style={{ display: 'block', color: TH.muted, fontSize: '15px', lineHeight: 1.45 }}>
                        Runden vor dem {new Date(cutoff).toLocaleDateString('de-DE')} werden pro Person, Spiel und Monat zu einem Eintrag. Punkte, Level, Monatskronen, Rundenzahl und Bestwerte bleiben gleich, nur die einzelnen Tage alter Monate entfallen.
                      </span>
                      <span style={{ display: 'block', fontSize: '15px', marginTop: '6px', fontWeight: 700 }}>
                        {prev.merged > 0 ? `Jetzt: ${prev.before.toLocaleString('de-DE')} Einträge (${kb(prev.before)} KB) → danach ${prev.after.toLocaleString('de-DE')} (etwa ${saved} % weniger Daten)` : `Nichts zu tun: ${prev.before.toLocaleString('de-DE')} Einträge, alle aus den letzten Monaten.`}
                      </span>
                    </span>
                    <button
                      disabled={prev.merged === 0}
                      onClick={() => {
                        if (!confirm(`${prev.merged.toLocaleString('de-DE')} alte Runden zusammenfassen? Punkte und Ranglisten bleiben gleich. Einzelne alte Runden kannst du danach nicht mehr einzeln löschen.`)) return;
                        overwriteCloudDataDirectly((curr) => {
                          const r = compactScores(curr.scores || [], cutoff);
                          curr.scores = r.scores;
                          curr.compactedUntil = Math.max(Number(curr.compactedUntil) || 0, cutoff);
                          return curr;
                        });
                      }}
                      style={{ ...smallBtn('warn'), opacity: prev.merged === 0 ? 0.5 : 1, cursor: prev.merged === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      Zusammenfassen
                    </button>
                  </div>
                </div>
              );
            })()}
            {sectionTitle('Gefahrenzone', 'Diese Aktionen lassen sich nicht rückgängig machen.')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '14px 16px', borderRadius: '16px', backgroundColor: TH.tintPeach }}>
                <span style={{ fontSize: '17px' }}><strong>Gesamte Bestenliste leeren</strong><span style={{ display: 'block', color: TH.muted, fontSize: '15px' }}>Löscht alle Punkte aller Mitarbeiter. Lernfortschritt bleibt.</span></span>
                <button
                  onClick={() => {
                    if (confirm('Wirklich die gesamte Bestenliste leeren? Alle Punkte aller Mitarbeiter werden gelöscht.')) {
                      overwriteCloudDataDirectly((curr) => { curr.scores = []; markDeleted(curr, 'pointsReset', '_all'); return curr; });
                      alert('Die Bestenliste wurde geleert.');
                    }
                  }}
                  style={{ ...smallBtn('danger'), backgroundColor: TH.red, color: dc('#FFFFFF') }}
                >
                  Bestenliste leeren
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}