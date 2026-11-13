// ═══ Pop-up: Wochenrückblick ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';
import { dc } from '../../daten/data';
import { LT } from '../../basis/marke';

export type WochenrueckblickProps = {
  username: string;
  wrSlide: number;
  setWrSlide: Dispatch<SetStateAction<number>>;
  wrTouch: MutableRefObject<number | null>;
  thisMonday: Date;
  lastMonday: Date;
  weekPoints: number;
  weekDays: number;
  favGame: string;
  masteredNow: number;
  weekMastered: number | null;
  weekTip: string;
  closeWeekReview: () => void;
};

export function Wochenrueckblick({ username, wrSlide, setWrSlide, wrTouch, thisMonday, lastMonday, weekPoints, weekDays, favGame, masteredNow, weekMastered, weekTip, closeWeekReview }: WochenrueckblickProps) {
  return (
    <div className="lt-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1250, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {(() => {
        const range = `${lastMonday.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} bis ${new Date(thisMonday.getTime() - 86400000).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;
        const slides = [
          { bg: LT.yellow, icon: '📅', top: 'Dein Wochenrückblick', big: `Neue Woche, ${username}!`, sub: `So lief deine letzte Woche (${range}). Tippe rechts für weiter.` },
          { bg: dc('#FFE7C2'), icon: '🔥', top: 'Lerntage', big: `${Math.min(6, weekDays)} / 6`, sub: weekDays >= 5 ? 'Wahnsinn, fast jeden Tag gelernt!' : weekDays >= 2 ? 'Schön dran geblieben! 👍' : weekDays === 1 ? 'Ein Lerntag ist ein Anfang, diese Woche schaffst du mehr!' : 'Letzte Woche war Pause, diese Woche geht’s wieder los!' },
          { bg: dc('#E1EEDC'), icon: '⭐', top: 'Punkte', big: weekPoints.toLocaleString('de-DE'), sub: weekMastered !== null ? `Dazu ${weekMastered} ${weekMastered === 1 ? 'Frage' : 'Fragen'} neu gemeistert.` : `Du hast ${masteredNow} Fragen gemeistert.` },
          { bg: dc('#E3ECF7'), icon: '🎮', top: 'Lieblingsspiel', big: favGame || 'Noch keins', sub: favGame ? 'Das hast du am meisten gespielt.' : 'Probier diese Woche mal ein Spiel aus!' },
          { bg: LT.cream, icon: '💡', top: 'Tipp für diese Woche', big: '', sub: weekTip },
        ];
        const n = slides.length; const i = Math.min(wrSlide, n - 1); const sl = slides[i];
        const go = (d: number) => setWrSlide(Math.max(0, Math.min(n - 1, i + d)));
        const finish = () => { setWrSlide(0); closeWeekReview(); };
        return (
          <div className="lt-dialog" role="dialog" aria-modal="true" aria-label="Dein Wochenrückblick" style={{ width: '100%', maxWidth: '420px', backgroundColor: sl.bg, borderRadius: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', overflow: 'hidden', transition: 'background-color .35s ease', userSelect: 'none' }}
            onTouchStart={(e) => { wrTouch.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => { if (wrTouch.current == null) return; const dx = e.changedTouches[0].clientX - wrTouch.current; wrTouch.current = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); }}>
            <div style={{ display: 'flex', gap: '5px', padding: '14px 16px 0' }}>
              {slides.map((_, k) => <span key={k} className="lt-story-bar"><i style={{ width: k <= i ? '100%' : '0%', transition: 'width .35s ease' }} /></span>)}
            </div>
            <div style={{ position: 'relative', minHeight: '360px', display: 'flex' }}>
              <button aria-label="Zurück" onClick={() => go(-1)} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', background: 'none', border: 'none', cursor: i > 0 ? 'pointer' : 'default', zIndex: 1 }} />
              {i < n - 1 && <button aria-label="Weiter" onClick={() => go(1)} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '65%', background: 'none', border: 'none', cursor: 'pointer', zIndex: 1 }} />}
              <div key={i} className="lt-pop-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '28px 26px', textAlign: 'center' }}>
                <span className="lt-emo-bob" style={{ fontSize: '64px', lineHeight: 1 }}>{sl.icon}</span>
                <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: LT.brown }}>{sl.top}</div>
                {sl.big && <div className="lt-count" style={{ fontFamily: LT.serif, fontSize: sl.big.length > 14 ? '30px' : '46px', lineHeight: 1.1 }}>{sl.big}</div>}
                <div style={{ fontSize: '18px', lineHeight: 1.45, color: LT.ink, maxWidth: '320px' }}>{sl.sub}</div>
              </div>
            </div>
            <div style={{ padding: '0 22px 22px', display: 'flex', gap: '10px', position: 'relative', zIndex: 2 }}>
              {i < n - 1 ? (
                <>
                  <button onClick={finish} style={{ minHeight: '52px', padding: '0 16px', border: `2px solid ${LT.line}`, borderRadius: '16px', backgroundColor: 'rgba(255,255,255,.7)', color: LT.brown, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Überspringen</button>
                  <button onClick={() => go(1)} autoFocus style={{ flex: 1, minHeight: '52px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>Weiter ›</button>
                </>
              ) : (
                <button onClick={finish} autoFocus style={{ flex: 1, minHeight: '58px', border: 'none', borderRadius: '16px', backgroundColor: LT.brown, color: dc('#FFF6E0'), fontSize: '19px', fontWeight: 700, cursor: 'pointer' }}>Los geht’s!</button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
