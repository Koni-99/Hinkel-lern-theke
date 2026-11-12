import { useState, FormEvent, CSSProperties } from 'react';
import { dc } from '../data';
import { TH, cardStyle, btnPrimary, btnSecondary, PageHead, onboardingStatus, computeBadges, correctIdSet } from './minigameUtils';
import { weakThekeTopics } from './KassenblitzView';
import { weekStart, weekDayKeys, parseScoreDate, streakOf } from '../admin/adminHelfer';
import type { ReportItem } from '../admin/adminHelfer';

import { CloudPayload } from '../types';
import { cleanStatNumber, getRightAnswerText, scoreKey, originalProductData } from '../utils';
import { SHOP_PRODUCTS } from '../shopProducts';
import { ALT_MAP } from '../data';
import { CATS, questions as BUILTIN_QUESTIONS, examQuestions as BUILTIN_EXAMS } from '../questions';
import type { Question } from '../questions';
import { EinstellungenTab } from '../admin/EinstellungenTab';
import { AuswertungSchwachstellen } from '../admin/AuswertungSchwachstellen';
import { AuswertungWoche } from '../admin/AuswertungWoche';
import { AuswertungUeberblick } from '../admin/AuswertungUeberblick';
import { MeldungenTab } from '../admin/MeldungenTab';
import { InhalteTab } from '../admin/InhalteTab';
import { NachrichtTab } from '../admin/NachrichtTab';
import { TeamTab } from '../admin/TeamTab';

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
      {adminTab === 'team' && <TeamTab {...{ cloudData, allKnownUserKeys, questions, examQuestions, allFlashcards, getUserMasteryPercent, mutateCloudData, learnInfo, openUser, setOpenUser, setTeamOpen, teamOpen, teamCat, setTeamCat, cloudProgress, cloudLastSeen, cloudScores, adminResetUserWrongStats, adminResetUserProgress, adminResetUserPin, adminDeleteUserCompletely, adminDeleteScoreEntry, adminDeleteAllUserPoints, allQById, hiddenMap, smallBtn, thisWeek, weekInfo, nameOf }} />}

      {/* ═════════ NACHRICHT ═════════ */}
      {adminTab === 'message' && <NachrichtTab {...{ overwriteCloudDataDirectly, pinboardDraft, setPinboardDraft, pinImage, setPinImage, pinBanner, setPinBanner, pinUntil, setPinUntil, pinImgBusy, loadPinImage, activePinboard, inputStyle, labelStyle, smallBtn, sectionTitle }} />}

      {/* ═════════ INHALTE ═════════ */}
      {adminTab === 'content' && <InhalteTab {...{ newProdName, setNewProdName, newProdGroup, setNewProdGroup, newProdSlice, setNewProdSlice, newProdInfo, setNewProdInfo, targetArea, setTargetArea, selectedBakeDayForAdd, setSelectedBakeDayForAdd, selectedSeasonForAdd, setSelectedSeasonForAdd, editingQId, editingPId, emptyNp, np, setNp, npMsg, setNpMsg, quizQuestionText, setQuizQuestionText, quizCat, setQuizCat, quizLevel, setQuizLevel, optA, setOptA, optB, setOptB, optC, setOptC, optD, setOptD, correctOptIdx, setCorrectOptIdx, quizExplanation, setQuizExplanation, fixId, fixSearch, setFixSearch, fixMsg, customProducts, customQuestions, handleAddCustomProduct, NP_ALLERGENS, npGroups, sortimentProducts, saveNewProduct, editNewProduct, deleteNewProduct, toggleNpList, handleAddCustomQuizQuestion, startEditQuestion, cancelEditQuestion, startEditProduct, cancelEditProduct, handleDeleteCustomQuestion, handleDeleteCustomProduct, allQById, activeEdit, startFix, restoreOriginal, editedIds, fixResults, renderFixEditor, chip, inputStyle, labelStyle, smallBtn, sectionTitle }} />}

      {/* ═════════ MELDUNGEN ═════════ */}
      {adminTab === 'reports' && <MeldungenTab {...{ pfName, pfMsg, allQById, startFix, renderFixEditor, reports, hiddenBuiltIn, resolveReport, hideQuestion, restoreQuestion, pFixes, fixedProducts, shopNames, startProductFix, restoreProduct, renderProductFixEditor, copyReportText, inputStyle, smallBtn, sectionTitle, nameOf }} />}

      {/* ═════════ AUSWERTUNG ═════════ */}
      {adminTab === 'stats' && <AuswertungUeberblick {...{ allKnownUserKeys, allQById, startFix, renderFixEditor, hiddenMap, hideQuestion, qStats, smallBtn, sectionTitle, weekInfo, nameOf }} />}

      {adminTab === 'stats' && <AuswertungWoche {...{ allKnownUserKeys, smallBtn, sectionTitle, wStart, weekInfo, nameOf, copyReport }} />}

      {adminTab === 'stats' && <AuswertungSchwachstellen {...{ overwriteCloudDataDirectly, allQById, qStats, catWeak, productWeak, thekeWeakTeam, hardestQs, rateBar, smallBtn, sectionTitle }} />}

      {/* ═════════ EINSTELLUNGEN ═════════ */}
      {adminTab === 'settings' && <EinstellungenTab {...{ cloudData, setCloudUrl, cloudConnected, setCloudConnected, fetchCloudData, overwriteCloudDataDirectly, imageCount, onImportImages, setImageMsg, imageMsg, imageBusy, setImageBusy, backupMsg, downloadBackup, restoreBackup, tempCloudUrl, setTempCloudUrl, markDeleted, inputStyle, labelStyle, smallBtn, sectionTitle }} />}
    </div>
  );
}