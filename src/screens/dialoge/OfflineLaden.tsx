// ═══ Version 260: „Für ohne Internet laden“ (Menü → Einstellungen und Hilfe) ═══
// Lädt alle Produktfotos in den Foto-Speicher des Service Workers (lern-theke-fotos-1), damit Steckbriefe und Spiele
// auch ohne Netz Fotos zeigen. App-Dateien speichert der Service Worker schon von selbst. Die natürlichen Stimmen
// (über 200 MB) bleiben online, ohne Netz liest die Handy-Stimme.
import { useEffect, useRef, useState } from 'react';
import { dc } from '../../daten/data';
import { LT } from '../../basis/marke';
import { alleFotoDateien } from '../../daten/fotos';

const SPEICHER = 'lern-theke-fotos-1';

export function OfflineLaden({ schliessen }: { schliessen: () => void }) {
  const dateien = useRef(alleFotoDateien()).current;
  const [da, setDa] = useState<number | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState(0);
  const stopp = useRef(false);
  const geht = typeof caches !== 'undefined';

  const zaehlen = async () => {
    if (!geht) return;
    try {
      const c = await caches.open(SPEICHER);
      const keys = new Set((await c.keys()).map((r) => new URL(r.url).pathname));
      setDa(dateien.filter((d) => keys.has(new URL(d, location.href).pathname)).length);
    } catch { setDa(0); }
  };
  useEffect(() => { zaehlen(); return () => { stopp.current = true; }; }, []);

  const laden = async () => {
    if (!geht || laeuft) return;
    setLaeuft(true); setFehler(0); stopp.current = false;
    try { await (navigator.storage as any)?.persist?.(); } catch { /* egal */ }
    const c = await caches.open(SPEICHER);
    const vorhanden = new Set((await c.keys()).map((r) => new URL(r.url).pathname));
    const offen = dateien.filter((d) => !vorhanden.has(new URL(d, location.href).pathname));
    let fertig = dateien.length - offen.length, kaputt = 0;
    setDa(fertig);
    for (let i = 0; i < offen.length && !stopp.current; i += 6) {
      await Promise.all(offen.slice(i, i + 6).map(async (d) => {
        try { const res = await fetch(d); if (res.ok) { await c.put(new URL(d, location.href).href, res); fertig++; } else kaputt++; } catch { kaputt++; }
      }));
      setDa(fertig); setFehler(kaputt);
      if (kaputt > 20) break; // kein Netz mehr: aufhören, später weitermachen
    }
    setLaeuft(false);
  };

  const alle = dateien.length;
  const pct = da === null ? 0 : Math.round((da / alle) * 100);
  const komplett = da !== null && da >= alle;
  return (
    <div className="lt-overlay" onClick={laeuft ? undefined : schliessen} style={{ position: 'fixed', inset: 0, zIndex: 125, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="lt-dialog lt-offline-laden" role="dialog" aria-modal="true" aria-label="Für ohne Internet laden" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: LT.cream, borderRadius: '28px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', color: LT.ink }}>
        <div style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.1 }}>Für ohne Internet laden</div>
        <div style={{ fontSize: '16px', color: LT.muted, lineHeight: 1.45 }}>Die App selbst, deine Punkte und alle Fragen sind schon auf dem Handy. Hier holst du dir zusätzlich alle Produktfotos (etwa 45 MB). Dann zeigen Steckbriefe und Spiele auch ohne Netz Fotos. Am besten im WLAN, zum Beispiel zu Hause.</div>
        {!geht ? <div style={{ fontSize: '16px', fontWeight: 700, color: '#B42318' }}>Das geht in diesem Browser leider nicht.</div> : (
          <>
            <div style={{ fontSize: '17px', fontWeight: 700 }}>{da === null ? 'Wird geprüft …' : komplett ? 'Alle Fotos sind auf dem Handy.' : `${da} von ${alle} Fotos auf dem Handy (${pct} %)`}</div>
            <div aria-hidden="true" className="lt-papier" style={{ height: '14px', borderRadius: '999px', backgroundColor: '#E8DCC8', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,#E0A526,#C9971C)', transition: 'width .3s' }} />
            </div>
            {fehler > 0 && !laeuft && !komplett && <div style={{ fontSize: '15px', color: '#B42318' }}>Einige Fotos kamen nicht an. Gerade kein gutes Netz? Einfach später nochmal tippen, es geht dort weiter.</div>}
            {!komplett && <button type="button" className="lt-offline-start" onClick={laden} disabled={laeuft || da === null} style={{ minHeight: '54px', border: 'none', borderRadius: '16px', backgroundColor: LT.yellow, color: LT.ink, fontSize: '18px', fontWeight: 800, cursor: laeuft ? 'wait' : 'pointer' }}>{laeuft ? 'Lädt … bitte offen lassen' : da ? 'Weiter laden' : 'Fotos jetzt laden'}</button>}
          </>
        )}
        <div style={{ fontSize: '15px', color: LT.muted, lineHeight: 1.45 }}>Die natürlichen Stimmen bleiben online, sie wären über 200 MB groß. Ohne Netz liest die Stimme des Handys vor.</div>
        <button type="button" onClick={() => { stopp.current = true; schliessen(); }} style={{ minHeight: '54px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '18px', fontWeight: 800, cursor: 'pointer' }}>{laeuft ? 'Abbrechen' : 'Fertig'}</button>
      </div>
    </div>
  );
}
