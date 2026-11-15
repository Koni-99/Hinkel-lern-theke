// ═══ Zurück-Taste des Handys / Browsers ═══
// Ohne das schließt die Zurück-Taste die ganze App. Jetzt gilt:
// 1. Ist etwas aufgeklappt (z. B. ein Steckbrief), schließt die Taste zuerst das.
// 2. Sonst geht es eine Seite zurück (App.tsx merkt sich die besuchten Seiten).
// 3. Erst auf der ersten Seite verlässt die Taste die App wie gewohnt.
import { useEffect, useRef } from 'react';

type Schliesser = { id: number; close: () => void };
const offen: Schliesser[] = [];
let naechsteId = 1;
let ueberspringen = 0; // so viele „popstate“ kommen von uns selbst (history.back nach Schließen per Knopf)

/** Für App.tsx: true = die Zurück-Taste wurde hier schon verbraucht (Fenster geschlossen oder eigener Rücksprung) */
export function zurueckVerbraucht(): boolean {
  if (ueberspringen > 0) { ueberspringen--; return true; }
  const s = offen.pop();
  if (s) { try { s.close(); } catch { /* egal */ } return true; }
  return false;
}

/** Aufklappbares Fenster an die Zurück-Taste hängen: solange `auf` true ist, schließt die Taste es */
export function useZurueckSchliesst(auf: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!auf) return;
    const id = naechsteId++;
    try { history.pushState({ ltFenster: id }, ''); } catch { /* egal */ }
    offen.push({ id, close: () => closeRef.current() });
    return () => {
      const i = offen.findIndex((s) => s.id === id);
      if (i >= 0) {
        // per Knopf geschlossen: den zusätzlichen Verlaufs-Eintrag wieder entfernen
        offen.splice(i, 1);
        ueberspringen++;
        try { history.back(); } catch { ueberspringen--; }
      }
    };
  }, [auf]);
}
