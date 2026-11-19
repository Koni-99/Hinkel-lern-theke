// ═══ Version 262: Neustart der Bestenliste (Ausbilder → Einstellungen) ═══
// Nutzer-Wunsch: Punkte aus der Testphase sollen beim echten Start nicht mehr zählen.
// Nur die Bestenliste fängt neu an (Gesamt, Monat, Spiele). Stufe, Punkte-Guthaben, Trinkgeld, Lernstand und Abzeichen bleiben.
// Nichts wird gelöscht, darum lässt sich der Neustart auch zurücknehmen.
import { TH, cardStyle, btnPrimary } from '../ui/basis';
import { neustartVon } from '../hilfen/wertungen';
import type { CloudPayload } from '../types';

export function BestenlisteNeustart({ cloudData, mutateCloudData }: { cloudData: CloudPayload; mutateCloudData: (u: (c: CloudPayload) => CloudPayload) => void }) {
  const n = neustartVon(cloudData.progress);
  const starten = () => {
    if (!window.confirm('Bestenliste jetzt neu starten? Alle fangen in der Bestenliste bei 0 Punkten an. Stufe, Trinkgeld, gekaufte Sachen und alles Gelernte bleiben.')) return;
    if (!window.confirm('Ganz sicher? Das gilt sofort für alle Mitarbeiter.')) return;
    mutateCloudData((curr) => {
      curr.progress = curr.progress || {};
      const ausgaben: Record<string, number> = {};
      Object.entries(curr.progress).forEach(([k, pr]: [string, any]) => { const v = Number(pr?._ptsSpent) || 0; if (k !== 'admin' && v > 0) ausgaben[k] = v; });
      curr.progress.admin = { ...(curr.progress.admin || {}), _bestenlisteNeu: { ts: Date.now(), ausgaben } };
      return curr;
    });
  };
  const zuruecknehmen = () => {
    if (!window.confirm('Neustart zurücknehmen? Dann zählen in der Bestenliste wieder alle Punkte, auch die aus der Zeit davor.')) return;
    mutateCloudData((curr) => { curr.progress = curr.progress || {}; curr.progress.admin = { ...(curr.progress.admin || {}), _bestenlisteNeu: null }; return curr; });
  };
  return (
    <section className="lt-bestenliste-neustart" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ fontFamily: TH.serif, fontSize: '30px', lineHeight: 1.15 }}>Neustart der Bestenliste</div>
        <div style={{ fontSize: '17px', color: TH.muted }}>Für den echten Start nach der Testphase: In der Bestenliste fangen alle wieder bei 0 Punkten an. Stufe, Punkte-Guthaben für die Schatzkammer, Trinkgeld, gekaufte Sachen, Lernstand und Abzeichen bleiben. Gelöscht wird nichts.</div>
      </div>
      {n ? (
        <>
          <div className="lt-neustart-stand" style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: TH.tintSage, color: TH.green, fontSize: '17px', fontWeight: 700 }}>Die Bestenliste zählt seit {new Date(n.ts).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })} Uhr.</div>
          <button type="button" className="lt-neustart-zurueck" onClick={zuruecknehmen} style={{ alignSelf: 'flex-start', minHeight: '48px', padding: '0 18px', borderRadius: '14px', border: `2px solid ${TH.line}`, background: 'transparent', color: TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Neustart zurücknehmen</button>
        </>
      ) : (
        <button type="button" className="lt-neustart-knopf" onClick={starten} style={{ ...btnPrimary, alignSelf: 'flex-start' }}>Bestenliste jetzt neu starten</button>
      )}
    </section>
  );
}
