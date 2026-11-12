// ═══ Ausbilder-Bereich: Reiter Meldungen ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { CSSProperties } from 'react';
import { TH, cardStyle } from '../components/minigameUtils';
import type { ReportItem } from './adminHelfer';
import { getRightAnswerText } from '../utils';
import { SHOP_PRODUCTS } from '../shopProducts';
import type { ProductFix } from '../types';

export type MeldungenTabProps = {
  pfName: string | null;
  pfMsg: string;
  allQById: Map<number, any>;
  startFix: (id: number) => void;
  renderFixEditor: () => false | JSX.Element;
  reports: { qid: string; q: any; items: ReportItem[]; game?: string | undefined; ctx?: string | undefined; product?: string | undefined; }[];
  hiddenBuiltIn: number[];
  resolveReport: (qid: string) => void;
  hideQuestion: (qid: string) => void;
  restoreQuestion: (id: number) => void;
  pFixes: Record<string, ProductFix>;
  fixedProducts: string[];
  shopNames: string[];
  startProductFix: (name: string, reportKey?: string | undefined) => void;
  restoreProduct: (name: string) => void;
  renderProductFixEditor: () => "" | JSX.Element | null;
  copyReportText: (rep: { game?: string | undefined; product?: string | undefined; ctx?: string | undefined; items: ReportItem[]; }) => void;
  inputStyle: CSSProperties;
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  sectionTitle: (title: string, sub?: string | undefined) => JSX.Element;
  nameOf: (userKey: string) => any;
};

export function MeldungenTab({ pfName, pfMsg, allQById, startFix, renderFixEditor, reports, hiddenBuiltIn, resolveReport, hideQuestion, restoreQuestion, pFixes, fixedProducts, shopNames, startProductFix, restoreProduct, renderProductFixEditor, copyReportText, inputStyle, smallBtn, sectionTitle, nameOf }: MeldungenTabProps) {
  return (
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
  );
}
