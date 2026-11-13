// ═══ Ausbilder-Bereich: Reiter Inhalte ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { FormEvent, CSSProperties } from 'react';
import { TH, cardStyle, btnPrimary } from '../ui/basis';
import { CATS } from '../daten/questions';
import type { Question } from '../daten/questions';
import type { CustomProductItem, QuestionEdit } from '../types';

export type InhalteTabProps = {
  newProdName: string;
  setNewProdName: Dispatch<SetStateAction<string>>;
  newProdGroup: string;
  setNewProdGroup: Dispatch<SetStateAction<string>>;
  newProdSlice: string;
  setNewProdSlice: Dispatch<SetStateAction<string>>;
  newProdInfo: string;
  setNewProdInfo: Dispatch<SetStateAction<string>>;
  targetArea: "profile" | "bake_day" | "seasonal";
  setTargetArea: Dispatch<SetStateAction<"profile" | "bake_day" | "seasonal">>;
  selectedBakeDayForAdd: number;
  setSelectedBakeDayForAdd: Dispatch<SetStateAction<number>>;
  selectedSeasonForAdd: string;
  setSelectedSeasonForAdd: Dispatch<SetStateAction<string>>;
  editingQId: number | null;
  editingPId: string | null;
  emptyNp: { id: string; name: string; group: string; breadType: string; weight: string; price: string; info: string; shortIngredients: string; fullIngredients: string; allergens: string[]; traces: string[]; createdAt: number; };
  np: { id: string; name: string; group: string; breadType: string; weight: string; price: string; info: string; shortIngredients: string; fullIngredients: string; allergens: string[]; traces: string[]; createdAt: number; };
  setNp: Dispatch<SetStateAction<{ id: string; name: string; group: string; breadType: string; weight: string; price: string; info: string; shortIngredients: string; fullIngredients: string; allergens: string[]; traces: string[]; createdAt: number; }>>;
  npMsg: string;
  setNpMsg: Dispatch<SetStateAction<string>>;
  quizQuestionText: string;
  setQuizQuestionText: Dispatch<SetStateAction<string>>;
  quizCat: string;
  setQuizCat: Dispatch<SetStateAction<string>>;
  quizLevel: "easy" | "hard";
  setQuizLevel: Dispatch<SetStateAction<"easy" | "hard">>;
  optA: string;
  setOptA: Dispatch<SetStateAction<string>>;
  optB: string;
  setOptB: Dispatch<SetStateAction<string>>;
  optC: string;
  setOptC: Dispatch<SetStateAction<string>>;
  optD: string;
  setOptD: Dispatch<SetStateAction<string>>;
  correctOptIdx: number;
  setCorrectOptIdx: Dispatch<SetStateAction<number>>;
  quizExplanation: string;
  setQuizExplanation: Dispatch<SetStateAction<string>>;
  fixId: number | null;
  fixSearch: string;
  setFixSearch: Dispatch<SetStateAction<string>>;
  fixMsg: string;
  customProducts: CustomProductItem[];
  customQuestions: Question[];
  handleAddCustomProduct: (e: FormEvent<Element>) => void;
  NP_ALLERGENS: string[];
  npGroups: string[];
  sortimentProducts: CustomProductItem[];
  saveNewProduct: (e: FormEvent<Element>) => void;
  editNewProduct: (p: any) => void;
  deleteNewProduct: (p: any) => void;
  toggleNpList: (field: "allergens" | "traces", a: string) => void;
  handleAddCustomQuizQuestion: (e: FormEvent<Element>) => void;
  startEditQuestion: (cq: Question) => void;
  cancelEditQuestion: () => void;
  startEditProduct: (cp: any) => void;
  cancelEditProduct: () => void;
  handleDeleteCustomQuestion: (id: number) => void;
  handleDeleteCustomProduct: (id: string) => void;
  allQById: Map<number, any>;
  activeEdit: (id: number) => QuestionEdit | null;
  startFix: (id: number) => void;
  restoreOriginal: (id: number) => void;
  editedIds: number[];
  fixResults: any[];
  renderFixEditor: () => false | JSX.Element;
  chip: (on: boolean) => CSSProperties;
  inputStyle: CSSProperties;
  labelStyle: CSSProperties;
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  sectionTitle: (title: string, sub?: string | undefined) => JSX.Element;
};

export function InhalteTab({ newProdName, setNewProdName, newProdGroup, setNewProdGroup, newProdSlice, setNewProdSlice, newProdInfo, setNewProdInfo, targetArea, setTargetArea, selectedBakeDayForAdd, setSelectedBakeDayForAdd, selectedSeasonForAdd, setSelectedSeasonForAdd, editingQId, editingPId, emptyNp, np, setNp, npMsg, setNpMsg, quizQuestionText, setQuizQuestionText, quizCat, setQuizCat, quizLevel, setQuizLevel, optA, setOptA, optB, setOptB, optC, setOptC, optD, setOptD, correctOptIdx, setCorrectOptIdx, quizExplanation, setQuizExplanation, fixId, fixSearch, setFixSearch, fixMsg, customProducts, customQuestions, handleAddCustomProduct, NP_ALLERGENS, npGroups, sortimentProducts, saveNewProduct, editNewProduct, deleteNewProduct, toggleNpList, handleAddCustomQuizQuestion, startEditQuestion, cancelEditQuestion, startEditProduct, cancelEditProduct, handleDeleteCustomQuestion, handleDeleteCustomProduct, allQById, activeEdit, startFix, restoreOriginal, editedIds, fixResults, renderFixEditor, chip, inputStyle, labelStyle, smallBtn, sectionTitle }: InhalteTabProps) {
  return (
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
  );
}
