// ═══ Prüfung: Auswertung und Antworten mischen ═══
// Vorher in utils.ts. Inhalt unverändert übernommen.
import { shuffleArray } from './allgemein';

export function getExamEvaluation(points: number, total: number) {
  const pct = total > 0 ? Math.round((points / total) * 100) : 0;
  if (pct >= 92)
    return {
      grade: "Note 1 (Sehr gut)",
      pct,
      title: `${pct}%, Note 1 (Sehr gut)`,
      desc: "Herausragende Prüfungsleistung! (ab 92%)",
      passed: true,
      color: "#065f46",
      bg: "#d1fae5",
    };
  if (pct >= 81)
    return {
      grade: "Note 2 (Gut)",
      pct,
      title: `${pct}%, Note 2 (Gut)`,
      desc: "Sehr sicheres Fachwissen! (81% bis 91%)",
      passed: true,
      color: "#065f46",
      bg: "#d1fae5",
    };
  if (pct >= 67)
    return {
      grade: "Note 3 (Befriedigend)",
      pct,
      title: `${pct}%, Note 3 (Befriedigend)`,
      desc: "Solide Leistung, Prüfung sicher bestanden! (67% bis 80%)",
      passed: true,
      color: "#065f46",
      bg: "#ecfdf5",
    };
  if (pct >= 50)
    return {
      grade: "Note 4 (Ausreichend)",
      pct,
      title: `${pct}%, Note 4 (Ausreichend)`,
      desc: "Prüfung bestanden (ab 50%), aber noch Lernpotenzial.",
      passed: true,
      color: "#b45309",
      bg: "#fef3c7",
    };
  if (pct >= 30)
    return {
      grade: "Note 5 (Mangelhaft)",
      pct,
      title: `${pct}%, Note 5 (Mangelhaft)`,
      desc: "Leider nicht bestanden (unter 50%). Grundlagen wiederholen!",
      passed: false,
      color: "#9f1239",
      bg: "#ffe4e6",
    };
  return {
    grade: "Note 6 (Ungenügend)",
    pct,
    title: `${pct}%, Note 6 (Ungenügend)`,
    desc: "Nicht bestanden. Bitte Lernkarten wiederholen!",
    passed: false,
    color: "#9f1239",
    bg: "#ffe4e6",
  };
}

export function shuffleQuestionOptions(q: any) {
  const originalOptions = q.options;
  const originalCorrectMulti: number[] = q.correctMulti || [
    q.correct !== undefined ? q.correct : 0,
  ];
  const indexedOptions = shuffleArray(
    originalOptions.map((opt: string, idx: number) => ({
      text: opt,
      isCorrect: originalCorrectMulti.includes(idx),
    }))
  );

  const newOptions = indexedOptions.map((item: any) => item.text);
  const newCorrectMulti: number[] = [];
  indexedOptions.forEach((item: any, idx: number) => {
    if (item.isCorrect) newCorrectMulti.push(idx);
  });

  return {
    ...q,
    options: newOptions,
    correct: newCorrectMulti[0] ?? 0,
    correctMulti: newCorrectMulti,
  };
}
