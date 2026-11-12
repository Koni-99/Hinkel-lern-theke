// ── Für die ALTE CodeSandbox (66jqlv): diese Datei ersetzt dort src/index.tsx ──
// Die Lern-Theke läuft jetzt auf GitHub Pages und wird dort automatisch aktuell gehalten.
// Wer den alten Link öffnet, landet sofort auf der neuen Adresse. Der Name wird mitgenommen,
// dann muss man nur noch seine PIN eingeben. Punkte und Fortschritt liegen in Firebase und bleiben.
const ZIEL = 'https://koni-99.github.io/Hinkel-lern-theke/';

let name = '';
try { name = localStorage.getItem('hinkel_username') || ''; } catch {}
const url = name ? `${ZIEL}?name=${encodeURIComponent(name)}` : ZIEL;

document.body.innerHTML = `<p style="font-family:sans-serif;font-size:20px;text-align:center;margin-top:40px">
  Die Lern-Theke ist umgezogen …<br><a href="${url}">Hier geht es weiter</a></p>`;
window.location.replace(url);

export {};
