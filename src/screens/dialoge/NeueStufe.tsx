// ═══ Pop-up: neue Stufe erreicht (Stufen-Feier) ═══
// Dunkle Bühne mit goldenen Lichtstrahlen, Brezelregen hinter dem Text, das Stufen-Zeichen springt in einer
// goldenen Medaille herein, darunter der neue Titel, der Weg von der alten zur neuen Stufe und ein Balken
// bis zur nächsten Stufe. Bei „Bewegung reduzieren“ / „Animationen aus“ steht alles still.
import { dc } from '../../daten/data';
import { LEVELS } from '../../basis/serie';

export type NeueStufeProps = {
  username: string;
  myTotalScore: number;
  myLevel: { next: { min: number; title: string; icon: string; }; pct: number; toNext: number; min: number; title: string; icon: string; no: number; };
  markLevelSeen: () => void;
};

const CSS = `
.lt-sf{position:fixed;inset:0;z-index:1300;display:flex;align-items:center;justify-content:center;padding:20px;overflow:hidden;
  background:radial-gradient(ellipse at 50% 38%,#6A3F1E 0%,#2B170A 62%,#1A0D05 100%);animation:ltSfEin .35s ease both}
.lt-sf-strahlen{position:absolute;left:50%;top:38%;width:220vmax;height:220vmax;transform:translate(-50%,-50%);pointer-events:none;
  background:repeating-conic-gradient(from 0deg,rgba(255,199,44,.16) 0deg 8deg,rgba(255,199,44,0) 8deg 20deg);
  -webkit-mask:radial-gradient(circle,#000 0%,transparent 55%);mask:radial-gradient(circle,#000 0%,transparent 55%);animation:ltSfDrehen 24s linear infinite}
.lt-sf-regen{position:absolute;inset:0;pointer-events:none;z-index:0}
.lt-sf-brezel{position:absolute;top:-60px;animation:ltSfFallen linear infinite;opacity:.55;filter:saturate(.9)}
.lt-sf-karte{position:relative;z-index:1;width:100%;max-width:400px;text-align:center;color:#FFF6E0;display:flex;flex-direction:column;align-items:center;gap:14px}
.lt-sf-ueber{font-size:14px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#FFE27A;animation:ltSfHoch .5s cubic-bezier(.2,.8,.2,1) .25s both}
.lt-sf-medaille{position:relative;width:160px;height:160px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:80px;line-height:1;
  background:radial-gradient(circle at 35% 30%,#FFF3C4,#FFC72C 45%,#C9971C 100%);box-shadow:0 0 0 8px rgba(255,199,44,.25),0 0 60px rgba(255,199,44,.55),inset 0 -8px 16px rgba(120,80,0,.35);
  animation:ltSfPop .9s cubic-bezier(.2,1.6,.4,1) .35s both}
.lt-sf-medaille::after{content:"";position:absolute;inset:-14px;border-radius:50%;border:2px dashed rgba(255,226,122,.6);animation:ltSfKreis 14s linear infinite reverse}
.lt-sf-titel{font-family:'Bricolage Grotesque','Atkinson Hyperlegible',Verdana,sans-serif;font-weight:800;font-size:clamp(32px,10vw,46px);line-height:1.02;color:#FFE27A;text-shadow:0 2px 0 #8A5A00,0 10px 30px rgba(0,0,0,.45);animation:ltSfHoch .6s cubic-bezier(.2,.8,.2,1) .8s both}
.lt-sf-stufe{font-size:18px;font-weight:700;animation:ltSfHoch .5s ease 1s both}
.lt-sf-weg{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px;font-size:15px;color:#F0D9AE;animation:ltSfHoch .5s ease 1.1s both}
.lt-sf-weg b{color:#FFF6E0}
.lt-sf-balken{width:100%;max-width:320px;animation:ltSfHoch .5s ease 1.2s both}
.lt-sf-spur{height:14px;border-radius:999px;background:rgba(255,246,224,.15);overflow:hidden}
.lt-sf-fuell{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#C9971C,#FFC72C,#FFE27A);animation:ltSfFuellen 1.4s cubic-bezier(.2,.8,.2,1) 1.4s forwards}
.lt-sf-text{margin-top:6px;font-size:14px;color:#F0D9AE}
.lt-sf-knopf{margin-top:8px;min-height:60px;width:100%;max-width:320px;border:none;border-radius:18px;background:#FFC72C;color:#2B170A;font-size:20px;font-weight:800;box-shadow:0 6px 0 #C9971C;cursor:pointer;font-family:inherit;animation:ltSfHoch .5s ease 1.5s both}
@keyframes ltSfEin{from{opacity:0}to{opacity:1}}
@keyframes ltSfDrehen{to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes ltSfKreis{to{transform:rotate(360deg)}}
@keyframes ltSfPop{0%{transform:scale(0) rotate(-30deg);opacity:0}60%{transform:scale(1.15) rotate(6deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes ltSfHoch{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes ltSfFuellen{to{width:var(--ziel)}}
@keyframes ltSfFallen{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(115vh) rotate(540deg)}}
@media (prefers-reduced-motion: reduce){.lt-sf *,.lt-sf{animation-duration:.01s !important;animation-delay:0s !important}.lt-sf-brezel,.lt-sf-strahlen{display:none}}
html.lt-noanim .lt-sf-brezel,html.lt-noanim .lt-sf-strahlen{display:none}
html.lt-noanim .lt-sf-fuell{width:var(--ziel)}
`;

export function NeueStufe({ username, myTotalScore, myLevel, markLevelSeen }: NeueStufeProps) {
  const vorher = myLevel.no >= 2 ? LEVELS[myLevel.no - 2] : null;
  const ziel = Math.max(2, Math.min(100, Math.round(myLevel.pct || 0)));
  return (
    <div className="lt-sf" role="dialog" aria-modal="true" aria-label="Neue Stufe erreicht">
      <style>{CSS}</style>
      <div className="lt-sf-strahlen" aria-hidden="true" />
      <div className="lt-sf-regen" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="lt-sf-brezel" style={{ left: `${(i * 37 + 5) % 100}%`, fontSize: `${20 + (i % 4) * 7}px`, animationDuration: `${3.4 + (i % 5) * 0.7}s`, animationDelay: `${0.4 + (i % 7) * 0.35}s` }}>{i % 5 === 0 ? '🥐' : '🥨'}</span>
        ))}
      </div>
      <div className="lt-sf-karte">
        <div className="lt-sf-ueber">Neue Stufe erreicht</div>
        <div className="lt-sf-medaille" aria-hidden="true">{myLevel.icon}</div>
        <div className="lt-sf-titel">{myLevel.title}</div>
        <div className="lt-sf-stufe">Stufe {myLevel.no} von {LEVELS.length} · Glückwunsch, {username}!</div>
        {vorher && <div className="lt-sf-weg"><span>{vorher.title}</span><span aria-hidden="true">→</span><b>{myLevel.title}</b></div>}
        <div className="lt-sf-balken" style={{ ['--ziel' as any]: `${ziel}%` }}>
          {myLevel.next ? (
            <>
              <div className="lt-sf-spur"><div className="lt-sf-fuell" /></div>
              <div className="lt-sf-text">{myTotalScore.toLocaleString('de-DE')} Punkte · noch {myLevel.toNext.toLocaleString('de-DE')} bis {myLevel.next.title}</div>
            </>
          ) : <div className="lt-sf-text" style={{ color: dc('#FFE27A'), fontWeight: 800 }}>{myTotalScore.toLocaleString('de-DE')} Punkte · das ist die höchste Stufe!</div>}
        </div>
        <button className="lt-sf-knopf" onClick={markLevelSeen} autoFocus>Weiter so!</button>
      </div>
    </div>
  );
}
