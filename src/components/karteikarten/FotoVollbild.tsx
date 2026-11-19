// ═══ Version 260: Produktfotos im Vollbild (antippen), wischen wie in der Handy-Galerie, doppelt tippen = vergrößern ═══
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useZurueckSchliesst } from '../../hilfen/zurueck';

export function FotoVollbild({ fotos, start, name, onClose }: { fotos: string[]; start: number; name: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [nr, setNr] = useState(start);
  const [zoom, setZoom] = useState<{ i: number; x: number; y: number } | null>(null);
  const letzterTipp = useRef(0);
  useZurueckSchliesst(true, onClose);
  useEffect(() => {
    const el = ref.current; if (el) el.scrollLeft = start * el.clientWidth;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') geh(1); if (e.key === 'ArrowLeft') geh(-1); };
    document.addEventListener('keydown', esc);
    const alt = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = alt; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const geh = (d: number) => { const el = ref.current; if (!el) return; setZoom(null); const z = Math.max(0, Math.min(fotos.length - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth)) + d)); el.scrollTo({ left: z * el.clientWidth, behavior: 'smooth' }); };
  const tipp = (i: number, e: React.MouseEvent<HTMLImageElement>) => {
    const jetzt = Date.now();
    if (jetzt - letzterTipp.current < 320) {
      const r = e.currentTarget.getBoundingClientRect();
      setZoom(zoom ? null : { i, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      letzterTipp.current = 0;
    } else letzterTipp.current = jetzt;
  };
  const knopf: React.CSSProperties = { width: '48px', height: '48px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,.18)', color: '#FFFFFF', fontSize: '26px', fontWeight: 800, cursor: 'pointer' };
  return createPortal(
    <div className="lt-papier lt-foto-vollbild" role="dialog" aria-modal="true" aria-label={`Fotos von ${name}`} style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: '#0E0B08', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', color: '#FFFFFF' }}>
        <span style={{ flex: 1, fontSize: '18px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}{fotos.length > 1 ? `  ·  ${nr + 1} / ${fotos.length}` : ''}</span>
        <button type="button" className="lt-vollbild-zu" onClick={onClose} aria-label="Schließen" style={knopf}>×</button>
      </div>
      <div ref={ref} className="lt-vollbild-band" onScroll={(e) => { const el = e.currentTarget; const n = Math.round(el.scrollLeft / Math.max(1, el.clientWidth)); if (n !== nr) { setNr(n); setZoom(null); } }}
        style={{ flex: 1, display: 'flex', overflowX: zoom ? 'hidden' : 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
        {fotos.map((f, i) => (
          <div key={f} style={{ flex: '0 0 100%', width: '100%', height: '100%', overflow: 'hidden', scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={f} alt={`${name}, Foto ${i + 1} von ${fotos.length}`} onClick={(e) => tipp(i, e)} draggable={false}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform .25s', transform: zoom && zoom.i === i ? 'scale(2.2)' : 'none', transformOrigin: zoom && zoom.i === i ? `${zoom.x}% ${zoom.y}%` : 'center', userSelect: 'none' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '12px 14px 20px', color: 'rgba(255,255,255,.75)', fontSize: '15px' }}>
        {fotos.length > 1 && <button type="button" aria-label="Vorheriges Foto" onClick={() => geh(-1)} disabled={nr === 0} style={{ ...knopf, opacity: nr === 0 ? 0.35 : 1 }}>‹</button>}
        <span style={{ textAlign: 'center' }}>{fotos.length > 1 ? 'Wischen für mehr Fotos · ' : ''}Doppelt tippen zum Vergrößern</span>
        {fotos.length > 1 && <button type="button" aria-label="Nächstes Foto" onClick={() => geh(1)} disabled={nr === fotos.length - 1} style={{ ...knopf, opacity: nr === fotos.length - 1 ? 0.35 : 1 }}>›</button>}
      </div>
    </div>,
    document.body
  );
}
