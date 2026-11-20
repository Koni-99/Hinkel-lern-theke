// ═══ Einbettung in die Lern-Theke (Version 266) ═══
// Die Seite läuft in einem iframe der App (Spielen → Zum Abschalten). Welches Spiel: #lauf, #chaos, #tour, #schutz, #schleuder, #stapler.
// Die App schickt leichte Quizfragen und den eigenen Rekord aus der Datenbank, die Seite meldet am Rundenende die Punkte zurück.
const wunsch = () => { const k = (location.hash || '').slice(1); return SPIELE[k] ? k : 'lauf'; };
function waehle(k){
  spiel = SPIELE[k]; laeuft = false; document.querySelectorAll('.frage').forEach((d) => d.remove()); frageOffen = false; FX.teile = []; FX.texte = [];
  spiel.start(); setHud([]); zeigeStart();
}
const melde = (d) => { try { if (parent !== window) parent.postMessage(d, location.origin); } catch {} };
const altEnde = ende; ende = function (p, z) { altEnde(p, z); melde({ typ: 'lt-abschalten-ende', key: spiel.key, punkte: p }); };
addEventListener('message', (e) => {
  if (e.origin !== location.origin) return;
  const d = e.data || {};
  if (d.typ !== 'lt-abschalten-daten') return;
  if (Array.isArray(d.fragen) && d.fragen.length >= 5) FRAGEN = d.fragen;
  let neu = false;
  Object.entries(d.rekord || {}).forEach(([k, v]) => { if (Number(v) > rekordLesen(k)) { rekordSetzen(k, Number(v)); neu = true; } });
  if (neu && !laeuft && !ueber.hidden && ueber.classList.contains('start')) zeigeStart();
});
addEventListener('hashchange', () => waehle(wunsch()));
// Pausieren, wenn die App im Hintergrund ist (Handy gesperrt, anderer Tab)
document.addEventListener('visibilitychange', () => { if (document.hidden && laeuft && !frageOffen) { laeuft = false; ueber.hidden = false; ueber.className = 'ueber start'; ueber.innerHTML = '<div class="karte"><span class="marke">Pause</span><h2>' + spiel.name + '</h2><button class="los">Weiter</button></div>'; ueber.querySelector('.los').addEventListener('click', () => { ueber.hidden = true; laeuft = true; }); } });
addEventListener('resize', groesse);
groesse(); waehle(wunsch()); requestAnimationFrame(schleife);
melde({ typ: 'lt-abschalten-bereit' });
