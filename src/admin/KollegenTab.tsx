// ═══ Ausbilder-Bereich: Reiter „Fragen & Tipps“ ═══
// Kundenfragen beantworten (optional als Quizfrage übernehmen) und Verkaufstipps freigeben.
import { useState, CSSProperties } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle } from '../ui/basis';
import { CloudPayload } from '../types';
import { alleKundenfragen, alleTipps, kfrageBeantworten, kfrageLoeschen, tippEntscheiden, tippLoeschen, KFrageEintrag } from '../hilfen/kollegen';
import { alleLobs, lobLoeschen } from '../hilfen/team';

const datum = (ts: number) => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
const knopf = (tone: 'plain' | 'ok' | 'danger' = 'plain'): CSSProperties => ({
  minHeight: '44px', padding: '0 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
  border: tone === 'plain' ? `2px solid ${TH.line}` : 'none',
  backgroundColor: tone === 'ok' ? TH.green : tone === 'danger' ? dc('#FCE1D2') : TH.white,
  color: tone === 'ok' ? dc('#FFFFFF') : tone === 'danger' ? TH.red : TH.ink,
});
const feld: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '12px', border: `2px solid ${TH.line}`, fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' };

export function offeneKollegenSachen(progress: CloudPayload['progress'] | undefined): number {
  return alleKundenfragen(progress).filter((f) => !f.a).length + alleTipps(progress, undefined, 'pending').length;
}

function FrageKarte({ f, mutateCloudData, onAlsQuizfrage }: { f: KFrageEintrag; mutateCloudData: KollegenTabProps['mutateCloudData']; onAlsQuizfrage: KollegenTabProps['onAlsQuizfrage'] }) {
  const [antwort, setAntwort] = useState(f.a || '');
  const [bearbeiten, setBearbeiten] = useState(!f.a);
  const speichern = () => { if (!antwort.trim()) return; mutateCloudData(kfrageBeantworten(f.user, f.id, antwort)); setBearbeiten(false); };
  const loeschen = () => { if (confirm(`Frage von ${f.name} löschen?`)) mutateCloudData(kfrageLoeschen(f.user, f.id)); };
  return (
    <div style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: f.a ? TH.cream : TH.tintYellow, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '16px', lineHeight: 1.45 }}>
      <div><strong>„{f.q}“</strong> <span style={{ fontSize: '14px', color: TH.muted }}>· {f.name}, {datum(f.ts)}</span></div>
      {bearbeiten ? (
        <>
          <textarea value={antwort} onChange={(e) => setAntwort(e.target.value)} rows={3} placeholder="Deine Antwort, so wie man sie dem Kunden sagen würde" aria-label={`Antwort auf: ${f.q}`} style={feld} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={speichern} disabled={!antwort.trim()} style={{ ...knopf('ok'), opacity: antwort.trim() ? 1 : 0.5 }}>✓ Antwort speichern</button>
            {f.a && <button type="button" onClick={() => { setAntwort(f.a || ''); setBearbeiten(false); }} style={knopf()}>Abbrechen</button>}
            <button type="button" onClick={loeschen} style={knopf('danger')}>Löschen</button>
          </div>
        </>
      ) : (
        <>
          <div>💬 {f.a}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onAlsQuizfrage(f.q, f.a || '')} style={knopf()}>➕ Als Quizfrage anlegen</button>
            <button type="button" onClick={() => setBearbeiten(true)} style={knopf()}>✏️ Antwort ändern</button>
            <button type="button" onClick={loeschen} style={knopf('danger')}>Löschen</button>
          </div>
        </>
      )}
    </div>
  );
}

export type KollegenTabProps = {
  cloudData: CloudPayload;
  mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void;
  onAlsQuizfrage: (frage: string, antwort: string) => void;
};

export function KollegenTab({ cloudData, mutateCloudData, onAlsQuizfrage }: KollegenTabProps) {
  const fragen = alleKundenfragen(cloudData.progress);
  const offen = fragen.filter((f) => !f.a);
  const beantwortet = fragen.filter((f) => f.a);
  const tippsOffen = alleTipps(cloudData.progress, undefined, 'pending');
  const tippsOk = alleTipps(cloudData.progress, undefined, 'ok');
  const lobs = alleLobs(cloudData.progress).filter((l) => l.ts >= Date.now() - 30 * 86400000);
  const titel = (t: string, sub: string) => (
    <div><h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '30px', lineHeight: 1.1 }}>{t}</h2><div style={{ fontSize: '17px', color: TH.muted, marginTop: '4px' }}>{sub}</div></div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {titel(`Neue Kundenfragen (${offen.length})`, 'Fragen, die Kunden an der Theke gestellt haben. Deine Antwort sehen danach alle unter Nachschlagen → „Das hat ein Kunde gefragt“.')}
        {offen.length === 0 ? <div style={{ fontSize: '16px', color: TH.green, fontWeight: 700 }}>Keine offenen Fragen.</div>
          : offen.map((f) => <FrageKarte key={`${f.user}_${f.id}`} f={f} mutateCloudData={mutateCloudData} onAlsQuizfrage={onAlsQuizfrage} />)}
      </div>

      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {titel(`Verkaufstipps zur Freigabe (${tippsOffen.length})`, 'Freigegebene Tipps erscheinen bei allen im Steckbrief des Produkts.')}
        {tippsOffen.length === 0 ? <div style={{ fontSize: '16px', color: TH.green, fontWeight: 700 }}>Keine Tipps zur Freigabe.</div> : tippsOffen.map((t) => (
          <div key={`${t.user}_${t.id}`} style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.tintYellow, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '16px' }}>
            <span style={{ flex: '1 1 260px' }}><strong>{t.p}</strong> · {t.name}: „{t.t}“</span>
            <button type="button" onClick={() => mutateCloudData(tippEntscheiden(t.user, t.id, true))} style={knopf('ok')}>✓ Freigeben</button>
            <button type="button" onClick={() => mutateCloudData(tippEntscheiden(t.user, t.id, false))} style={knopf('danger')}>✗ Ablehnen</button>
          </div>
        ))}
      </div>

      {beantwortet.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {titel(`Beantwortete Kundenfragen (${beantwortet.length})`, 'Gute Fragen kannst du mit einem Klick als Quizfrage für alle übernehmen.')}
          {beantwortet.map((f) => <FrageKarte key={`${f.user}_${f.id}_${f.aTs || 0}`} f={f} mutateCloudData={mutateCloudData} onAlsQuizfrage={onAlsQuizfrage} />)}
        </div>
      )}

      {tippsOk.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {titel(`Freigegebene Tipps (${tippsOk.length})`, 'Diese Tipps sehen alle. Unpassende kannst du wieder entfernen.')}
          {tippsOk.map((t) => (
            <div key={`${t.user}_${t.id}`} style={{ padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.cream, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '16px' }}>
              <span style={{ flex: '1 1 260px' }}><strong>{t.p}</strong> · {t.name}: „{t.t}“</span>
              <button type="button" onClick={() => { if (confirm('Diesen Tipp entfernen?')) mutateCloudData(tippLoeschen(t.user, t.id)); }} style={knopf('danger')}>Entfernen</button>
            </div>
          ))}
        </div>
      )}
      {lobs.length > 0 && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {titel(`Lob unter Kollegen (${lobs.length})`, 'Die letzten 30 Tage. Steht auf der Startseite unter „Lob der Woche“. Unpassendes kannst du entfernen.')}
          {lobs.map((l) => (
            <div key={`${l.von}_${l.id}`} style={{ padding: '10px 14px', borderRadius: '14px', backgroundColor: TH.cream, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '16px' }}>
              <span style={{ flex: '1 1 260px' }}><strong>{l.vonName}</strong> an <strong>{l.anName}</strong>: „{l.t}“ <span style={{ color: TH.muted, fontSize: '14px' }}>· {datum(l.ts)}</span></span>
              <button type="button" onClick={() => { if (confirm('Dieses Lob entfernen?')) mutateCloudData(lobLoeschen(l.von, l.id)); }} style={knopf('danger')}>Entfernen</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
