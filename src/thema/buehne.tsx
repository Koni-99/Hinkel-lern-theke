// Bühne im Kopf der Seite: Ähren und Mehlstaub in drei Tiefen. Bewegt sich mit der Maus (PC) und beim Scrollen (Handy).
// Nur Schmuck: keine Funktion hängt daran. Sichtbar nur ohne gekaufte Markise/Sorte (siehe artisan.ts).
import { useEffect, useRef } from 'react';

const Aehre = ({ tiefe, links, rechts, hoch, verz }: { tiefe: 1 | 2 | 3; links?: string; rechts?: string; hoch: number; verz: number }) => (
  <span className={`lt-b-ebene lt-b-t${tiefe}`} style={{ left: links, right: rechts, height: `${hoch}px`, width: `${hoch * 0.3}px` }}>
    <span style={{ display: 'block', height: '100%', transform: rechts ? 'scaleX(-1)' : undefined }}>
    <svg className="lt-b-aehre" style={{ animationDelay: `${verz}s` }} viewBox="0 0 60 220" aria-hidden="true">
      <path d="M32 220C31 165 27 110 30 42" fill="none" stroke="url(#lt-b-gold)" strokeWidth="2.4" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const y = 52 + i * 17;
        return (
          <g key={i}>
            <path d={`M17 ${y - 9}L5 ${y - 36}M43 ${y - 17}L55 ${y - 44}`} stroke="url(#lt-b-gold)" strokeWidth="1" strokeLinecap="round" opacity=".7" />
            <ellipse cx="21" cy={y} rx="6.4" ry="12" transform={`rotate(-24 21 ${y})`} fill="url(#lt-b-korn)" />
            <ellipse cx="39" cy={y - 8} rx="6.4" ry="12" transform={`rotate(24 39 ${y - 8})`} fill="url(#lt-b-korn)" />
          </g>
        );
      })}
      <path d="M30 22L30 0" stroke="url(#lt-b-gold)" strokeWidth="1" strokeLinecap="round" opacity=".7" />
      <ellipse cx="30" cy="32" rx="6" ry="13" fill="url(#lt-b-korn)" />
    </svg>
    </span>
  </span>
);

export function Buehne() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const kopf = ref.current?.parentElement;
    if (!kopf) return;
    let bild = 0, zx = 0, zy = 0;
    const setz = () => { bild = 0; kopf.style.setProperty('--px', zx.toFixed(3)); kopf.style.setProperty('--py', zy.toFixed(3)); };
    const plan = () => { if (!bild) bild = requestAnimationFrame(setz); };
    const ruhig = () => document.documentElement.classList.contains('lt-noanim') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const maus = (e: PointerEvent) => { if (e.pointerType === 'touch' || ruhig()) return; zx = (e.clientX / window.innerWidth - 0.5) * 2; zy = (e.clientY / window.innerHeight - 0.5) * 2; plan(); };
    const roll = () => { if (ruhig() || window.matchMedia('(hover: hover)').matches) return; zy = Math.min(1, window.scrollY / 220); plan(); };
    window.addEventListener('pointermove', maus, { passive: true });
    window.addEventListener('scroll', roll, { passive: true });
    return () => { window.removeEventListener('pointermove', maus); window.removeEventListener('scroll', roll); if (bild) cancelAnimationFrame(bild); };
  }, []);
  return (
    <div ref={ref} className="lt-buehne" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="lt-b-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FDE68A" /><stop offset="1" stopColor="#B4690E" /></linearGradient>
          <linearGradient id="lt-b-korn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FDE68A" /><stop offset=".55" stopColor="#EAB308" /><stop offset="1" stopColor="#B4690E" /></linearGradient>
        </defs>
      </svg>
      <span className="lt-b-licht" />
      <Aehre tiefe={1} links="3%" hoch={130} verz={-1.2} />
      <Aehre tiefe={1} rechts="5%" hoch={120} verz={-2.6} />
      <Aehre tiefe={2} links="11%" hoch={170} verz={-0.4} />
      <Aehre tiefe={2} rechts="13%" hoch={180} verz={-3.1} />
      <Aehre tiefe={3} links="-1%" hoch={230} verz={-2} />
      <Aehre tiefe={3} rechts="-2%" hoch={240} verz={-0.9} />
      {Array.from({ length: 22 }, (_, i) => (
        <i key={i} className={`lt-b-staub lt-b-t${(i % 3) + 1}`} style={{ left: `${(i * 37 + 9) % 100}%`, top: `${(i * 53 + 11) % 92}%`, width: `${2 + (i % 4) * 1.5}px`, height: `${2 + (i % 4) * 1.5}px`, animationDelay: `${-(i * 0.71) % 7}s`, animationDuration: `${6 + (i % 5) * 1.3}s` }} />
      ))}
    </div>
  );
}
