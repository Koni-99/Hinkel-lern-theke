// ═══ Ausbilder-Bereich: Quizfragen aus Excel übernehmen ═══
// Vorlage herunterladen, ausfüllen, hochladen, Vorschau prüfen, übernehmen.
// Die Excel-Bausteine werden erst geladen, wenn sie gebraucht werden (App bleibt für alle schnell).
import { useState, CSSProperties } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary } from '../ui/basis';
import { CloudPayload } from '../types';
import { fragenAusTabelle, ImportErgebnis, VORLAGE_SPALTEN } from '../hilfen/fragenImport';

const knopf: CSSProperties = { minHeight: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center' };

export function FragenImport({ bereiche, vorhandeneFragen, mutateCloudData }: { bereiche: string[]; vorhandeneFragen: string[]; mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void }) {
  const [ergebnis, setErgebnis] = useState<ImportErgebnis | null>(null);
  const [datei, setDatei] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const vorlage = async () => {
    try {
      const { default: writeExcelFile } = await import('write-excel-file/browser');
      const rows: (string | null)[][] = [
        VORLAGE_SPALTEN,
        [bereiche.includes('Sortiment & Warenkunde') ? 'Sortiment & Warenkunde' : bereiche[0], 'leicht', 'Welche Brotsorte ist ganz ohne Weizen?', 'Reines Roggenbrot', 'Weizenmischbrot', 'Toastbrot', 'Ciabatta', 'Reines Roggenbrot wird nur aus Roggenmehl gebacken.'],
        [bereiche.includes('Service & Verkauf') ? 'Service & Verkauf' : bereiche[0], 'schwer', 'Ein Kunde fragt nach etwas Saftigem. Was empfiehlst du?', 'Ein Brot mit Saaten oder Sauerteig', 'Ein Baguette', null, null, null],
      ];
      await writeExcelFile(rows, { columns: [{ width: 24 }, { width: 10 }, { width: 50 }, { width: 30 }, { width: 24 }, { width: 24 }, { width: 24 }, { width: 50 }] }).toFile('lern-theke-fragen-vorlage.xlsx');
      setMsg(`Vorlage heruntergeladen. Erlaubte Bereiche: ${bereiche.join(', ')}. Stufe: leicht oder schwer.`);
    } catch { setMsg('Die Vorlage konnte nicht erstellt werden. Bitte nochmal versuchen.'); }
  };

  const lesen = async (file?: File | null) => {
    if (!file) return;
    setBusy(true); setMsg(''); setErgebnis(null); setDatei(file.name);
    try {
      if (!/\.xlsx$/i.test(file.name)) throw new Error('kein xlsx');
      const { readSheet } = await import('read-excel-file/browser');
      const rows = (await readSheet(file)) as unknown[][];
      const r = fragenAusTabelle(rows, bereiche, vorhandeneFragen);
      setErgebnis(r);
      if (!r.fragen.length && !r.fehler.length) setMsg(r.doppelt ? 'Alle Fragen aus der Datei gibt es schon.' : 'In der Datei wurden keine Fragen gefunden.');
    } catch {
      setMsg('Die Datei konnte nicht gelesen werden. Bitte eine Excel-Datei (.xlsx) wählen, am besten die Vorlage.');
    } finally { setBusy(false); }
  };

  const uebernehmen = () => {
    if (!ergebnis || !ergebnis.fragen.length) return;
    const neu = ergebnis.fragen;
    mutateCloudData((curr) => {
      const liste = curr.customQuestions || (curr.customQuestions = []);
      const schon = new Set(liste.map((q) => q.question.trim().toLowerCase()));
      let id = Math.max(900000, ...liste.map((q) => q.id));
      neu.forEach((q) => { if (!schon.has(q.question.trim().toLowerCase())) liste.push({ id: ++id, ...q }); });
      return curr;
    });
    setMsg(`${neu.length} ${neu.length === 1 ? 'Frage ist' : 'Fragen sind'} übernommen. Sie erscheinen ab sofort im Quiz aller Mitarbeiter.`);
    setErgebnis(null); setDatei('');
  };

  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '30px', lineHeight: 1.1 }}>Fragen aus Excel übernehmen</h2>
        <div style={{ fontSize: '17px', color: TH.muted, marginTop: '4px' }}>Viele Quizfragen auf einmal: Vorlage herunterladen, ausfüllen, hier hochladen. Vor dem Übernehmen siehst du eine Vorschau.</div>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button type="button" onClick={vorlage} style={knopf}>Vorlage herunterladen</button>
        <label style={{ ...knopf, cursor: busy ? 'wait' : 'pointer' }}>
          {busy ? 'Lese Datei …' : 'Excel-Datei wählen'}
          <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" aria-label="Excel-Datei mit Fragen" onChange={(e) => { lesen(e.target.files && e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
        </label>
      </div>
      {msg && <div style={{ fontSize: '16px', fontWeight: 700, color: /nicht|keine|schon/.test(msg) ? TH.red : TH.green }}>{msg}</div>}
      {ergebnis && (ergebnis.fragen.length > 0 || ergebnis.fehler.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', backgroundColor: TH.cream }}>
          <strong style={{ fontSize: '17px' }}>{datei}: {ergebnis.fragen.length} {ergebnis.fragen.length === 1 ? 'Frage' : 'Fragen'} erkannt{ergebnis.doppelt ? `, ${ergebnis.doppelt} gibt es schon (werden übersprungen)` : ''}{ergebnis.fehler.length ? `, ${ergebnis.fehler.length} mit Fehlern` : ''}</strong>
          {ergebnis.fehler.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '15px', color: TH.red }}>
              {ergebnis.fehler.slice(0, 12).map((f) => <span key={f.zeile}>Zeile {f.zeile}: {f.grund}</span>)}
              {ergebnis.fehler.length > 12 && <span>… und {ergebnis.fehler.length - 12} weitere</span>}
              <span style={{ color: TH.muted }}>Zeilen mit Fehlern werden nicht übernommen. Du kannst sie in Excel korrigieren und die Datei nochmal hochladen.</span>
            </div>
          )}
          {ergebnis.fragen.slice(0, 8).map((q, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: '12px', backgroundColor: dc('#FFFFFF'), fontSize: '15px', lineHeight: 1.45 }}>
              <div><strong>{q.question}</strong> <span style={{ color: TH.muted }}>· {q.category}, {q.level === 'hard' ? 'schwer' : 'leicht'}</span></div>
              <div><span style={{ color: TH.green, fontWeight: 700 }}>✓ {q.options[q.correct]}</span> <span style={{ color: TH.muted }}>· falsch: {q.options.filter((_, j) => j !== q.correct).join(', ')}</span></div>
            </div>
          ))}
          {ergebnis.fragen.length > 8 && <span style={{ fontSize: '15px', color: TH.muted }}>… und {ergebnis.fragen.length - 8} weitere</span>}
          {ergebnis.fragen.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" onClick={uebernehmen} style={btnPrimary}>{ergebnis.fragen.length} {ergebnis.fragen.length === 1 ? 'Frage' : 'Fragen'} übernehmen</button>
              <button type="button" onClick={() => { setErgebnis(null); setDatei(''); }} style={knopf}>Abbrechen</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
