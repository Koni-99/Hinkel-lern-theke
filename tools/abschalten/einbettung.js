// ═══ Einbettung in die Lern-Theke (Version 266) ═══
// Die Seite läuft in einem iframe der App (Spielen → Zum Abschalten). Welches Spiel: #lauf, #chaos, #tour, #schutz, #schleuder, #stapler.
// Die App schickt leichte Quizfragen und den eigenen Rekord aus der Datenbank, die Seite meldet am Rundenende die Punkte zurück.
const wunsch = () => { const k = (location.hash || '').slice(1); return SPIELE[k] ? k : 'lauf'; };
function waehle(k){
  spiel = SPIELE[k]; laeuft = false; document.querySelectorAll('.frage').forEach((d) => d.remove()); frageOffen = false; FX.teile = []; FX.texte = [];
  spiel.start(); setHud([]); zeigeStart();
}
const melde = (d) => { try { if (parent !== window) parent.postMessage(d, location.origin); } catch {} };
// Gemütliche Runden zählen nicht (Version 267)
const altEnde = ende; ende = function (p, z) { const gem = rundeGemuetlich; altEnde(p, z); if (!gem) melde({ typ: 'lt-abschalten-ende', key: spiel.key, punkte: p }); };
addEventListener('message', (e) => {
  if (e.origin !== location.origin) return;
  const d = e.data || {};
  if (d.typ !== 'lt-abschalten-daten') return;
  if (Array.isArray(d.fragen) && d.fragen.length >= 5) FRAGEN = d.fragen;
  if (d.ziele && typeof d.ziele === 'object') ZIELE = d.ziele;
  if (d.medaillen && typeof d.medaillen === 'object') MEDAILLEN = d.medaillen;
  if (d.teigiSvg) setTeigiSvg(d.teigiSvg, d.teigiSkala);
  let neu = false;
  Object.entries(d.rekord || {}).forEach(([k, v]) => { if (Number(v) > rekordLesen(k)) { rekordSetzen(k, Number(v)); neu = true; } });
  if (!laeuft && !pausiert && !ueber.hidden && ueber.classList.contains('start')) zeigeStart();
});
addEventListener('hashchange', () => waehle(wunsch()));
// Pausieren, wenn die App im Hintergrund ist (Handy gesperrt, anderer Tab)
document.addEventListener('visibilitychange', () => { if (document.hidden) pausieren(); });
addEventListener('resize', groesse);
groesse(); waehle(wunsch()); requestAnimationFrame(schleife);
melde({ typ: 'lt-abschalten-bereit' });
