// ═══ Ausbilder-Bereich: Reiter Einstellungen ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { CSSProperties } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary, btnSecondary } from '../ui/basis';
import { CloudPayload } from '../types';
import { compactScores, compactCutoff } from '../hilfen/bestenliste';
import type { Tombstones } from '../types';

export type EinstellungenTabProps = {
  cloudData: CloudPayload;
  setCloudUrl: (u: string) => void;
  cloudConnected: boolean;
  setCloudConnected: (b: boolean) => void;
  fetchCloudData: (url?: string | undefined) => void;
  overwriteCloudDataDirectly: (updater: (curr: CloudPayload) => CloudPayload) => void;
  imageCount: number;
  onImportImages: ((file: File) => Promise<string>) | undefined;
  setImageMsg: Dispatch<SetStateAction<string>>;
  imageMsg: string;
  imageBusy: boolean;
  setImageBusy: Dispatch<SetStateAction<boolean>>;
  backupMsg: string;
  downloadBackup: () => void;
  restoreBackup: (file?: File | null | undefined) => void;
  tempCloudUrl: string;
  setTempCloudUrl: Dispatch<SetStateAction<string>>;
  markDeleted: (curr: CloudPayload, kind: keyof Tombstones, key: string) => void;
  inputStyle: CSSProperties;
  labelStyle: CSSProperties;
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  sectionTitle: (title: string, sub?: string | undefined) => JSX.Element;
};

export function EinstellungenTab({ cloudData, setCloudUrl, cloudConnected, setCloudConnected, fetchCloudData, overwriteCloudDataDirectly, imageCount, onImportImages, setImageMsg, imageMsg, imageBusy, setImageBusy, backupMsg, downloadBackup, restoreBackup, tempCloudUrl, setTempCloudUrl, markDeleted, inputStyle, labelStyle, smallBtn, sectionTitle }: EinstellungenTabProps) {
  return (
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
  );
}
