// Sonnige Theke: 3D-Neigen mit Glanzlicht für die großen Karten auf der Startseite.
// Läuft ohne Änderungen an App.tsx; aus bei "Animationen ausschalten", reduzierter Bewegung und im Dunkelmodus.
const SELECTOR = ".lt-hero-cta, .lt-herocard";
const MAX_DEG = 7;

function calm(): boolean {
  return (
    document.documentElement.classList.contains("lt-noanim") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!document.querySelector(".lt-root.lt-dark")
  );
}

function glareOf(el: HTMLElement): HTMLElement {
  let g = el.querySelector(":scope > .lt-glare") as HTMLElement | null;
  if (!g) {
    g = document.createElement("span");
    g.className = "lt-glare";
    g.setAttribute("aria-hidden", "true");
    if (getComputedStyle(el).position === "static")
      el.style.position = "relative";
    el.appendChild(g);
  }
  return g;
}

let active: HTMLElement | null = null;

function reset(el: HTMLElement | null) {
  if (!el) return;
  el.style.transform = "";
  el.classList.remove("lt-tilting");
}

function onMove(e: PointerEvent) {
  const el = (e.target as Element | null)?.closest?.(
    SELECTOR
  ) as HTMLElement | null;
  if (el !== active) {
    reset(active);
    active = el;
  }
  if (!el || calm()) return;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width; // 0..1
  const y = (e.clientY - r.top) / r.height;
  const g = glareOf(el);
  g.style.setProperty("--gx", `${Math.round(x * 100)}%`);
  g.style.setProperty("--gy", `${Math.round(y * 100)}%`);
  el.classList.add("lt-tilting");
  el.style.transform = `perspective(900px) rotateX(${(
    (0.5 - y) *
    MAX_DEG
  ).toFixed(2)}deg) rotateY(${((x - 0.5) * MAX_DEG).toFixed(2)}deg)`;
}

function onLeave() {
  reset(active);
  active = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  window.addEventListener("pointerup", onLeave, { passive: true });
  window.addEventListener("pointercancel", onLeave, { passive: true });
  document.addEventListener("pointerleave", onLeave, { passive: true });
  window.addEventListener("scroll", onLeave, { passive: true });
}

export {};
