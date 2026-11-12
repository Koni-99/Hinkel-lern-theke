// ═══ Ausbilder-Bereich: Reiter Nachricht ═══
// Vorher mitten in components/AdminView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { CSSProperties } from 'react';
import { TH, cardStyle, btnPrimary } from '../components/minigameUtils';
import { CloudPayload } from '../types';
import type { PinboardMessage } from '../types';

export type NachrichtTabProps = {
  overwriteCloudDataDirectly: (updater: (curr: CloudPayload) => CloudPayload) => void;
  pinboardDraft: string;
  setPinboardDraft: Dispatch<SetStateAction<string>>;
  pinImage: string;
  setPinImage: Dispatch<SetStateAction<string>>;
  pinBanner: boolean;
  setPinBanner: Dispatch<SetStateAction<boolean>>;
  pinUntil: string;
  setPinUntil: Dispatch<SetStateAction<string>>;
  pinImgBusy: boolean;
  loadPinImage: (file?: File | null | undefined) => void;
  activePinboard: PinboardMessage | null;
  inputStyle: CSSProperties;
  labelStyle: CSSProperties;
  smallBtn: (tone?: "plain" | "danger" | "warn") => CSSProperties;
  sectionTitle: (title: string, sub?: string | undefined) => JSX.Element;
};

export function NachrichtTab({ overwriteCloudDataDirectly, pinboardDraft, setPinboardDraft, pinImage, setPinImage, pinBanner, setPinBanner, pinUntil, setPinUntil, pinImgBusy, loadPinImage, activePinboard, inputStyle, labelStyle, smallBtn, sectionTitle }: NachrichtTabProps) {
  return (
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
  );
}
