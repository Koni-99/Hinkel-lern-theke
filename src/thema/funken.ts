// Goldfunken bei einer richtigen Antwort. Aus bei „Animationen ausschalten“ und bei reduzierter Bewegung.
let lx = 0, ly = 0;
if (typeof window !== 'undefined') {
  lx = window.innerWidth / 2; ly = window.innerHeight / 2;
  window.addEventListener('pointerdown', (e) => { lx = e.clientX; ly = e.clientY; }, { passive: true, capture: true });
}
const ruhig = () => document.documentElement.classList.contains('lt-noanim') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function goldFunken(menge = 18) {
  try {
    if (ruhig() || !document.body.animate) return;
    const farben = ['#EAB308', '#FDE68A', '#D9822B', '#FFFFFF', '#FFC72C'];
    for (let i = 0; i < menge; i++) {
      const f = document.createElement('i');
      const g = 5 + Math.random() * 7, stern = i % 4 === 0;
      f.setAttribute('aria-hidden', 'true');
      f.style.cssText = `position:fixed;left:0;top:0;z-index:3000;pointer-events:none;width:${g}px;height:${g}px;border-radius:${stern ? '2px' : '50%'};background:${farben[i % farben.length]};box-shadow:0 0 ${g * 1.6}px ${farben[i % 3]};will-change:transform,opacity`;
      document.body.appendChild(f);
      const w = (Math.PI * 2 * i) / menge + Math.random() * 0.5, weit = 60 + Math.random() * 90;
      const x1 = lx + Math.cos(w) * weit, y1 = ly + Math.sin(w) * weit;
      f.animate(
        [
          { transform: `translate(${lx}px,${ly}px) scale(.3) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${x1}px,${y1}px) scale(1.15) rotate(${stern ? 180 : 0}deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${x1 + Math.cos(w) * 14}px,${y1 + 46}px) scale(0) rotate(${stern ? 320 : 0}deg)`, opacity: 0 },
        ],
        { duration: 720 + Math.random() * 380, easing: 'cubic-bezier(.15,.75,.3,1)' }
      ).onfinish = () => f.remove();
    }
  } catch { /* egal */ }
}
