// ═══ „Mein Monat“: wie lief dein Monat? Nur für dich sichtbar ═══
// Logik in hilfen/meinMonat.ts. Kein Ausdruck, keine Urkunde, nur eine Übersicht.
import { useState } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, PageHead } from '../ui/basis';
import { LtIcon, ICON } from '../basis/symbole';
import { monthKeyOf, prevMonthKey, monthLabel } from '../ui/kalender';
import { monatsDaten, MonatSnap } from '../hilfen/meinMonat';

type Props = { username: string; scores: any[]; tage: string[]; snap?: MonatSnap; gemeistertJetzt: number; tipp: string };

export function MeinMonat({ username, scores, tage, snap, gemeistertJetzt, tipp }: Props) {
  const ich = (username || '').toLowerCase();
  const [mo, setMo] = useState(monthKeyOf());
  const dieser = mo === monthKeyOf();
  const d = monatsDaten({ mo, ich, scores, tage, snap, gemeistertJetzt });
  const name = (k: string) => monthLabel(k).split(' ')[0];
  const diff = d.punkte - d.punkteVormonat;
  const leer = d.punkte === 0 && d.lerntage === 0 && d.runden === 0;
  const chip = (aktiv: boolean) => ({ minHeight: '46px', padding: '0 18px', borderRadius: '999px', border: aktiv ? 'none' : `2px solid ${TH.line}`, backgroundColor: aktiv ? TH.brown : dc('#FFFFFF'), color: aktiv ? dc('#FFF6E0') : TH.ink, fontSize: '16px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' });
  const kachel = (icon: string[], wert: string, text: string, extra?: string) => (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px' }}>
      <span aria-hidden="true" style={{ color: TH.brown }}><LtIcon paths={icon} size={26} /></span>
      <span style={{ fontFamily: TH.serif, fontSize: '34px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{wert}</span>
      <span style={{ fontSize: '15px', color: TH.muted }}>{text}</span>
      {extra && <span style={{ fontSize: '14px', fontWeight: 700, color: TH.ink }}>{extra}</span>}
    </div>
  );
  const tagText = (t: string) => { const [y, m, dd] = t.split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }); };
  return (
    <div className="lt-themed" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: TH.ink, textAlign: 'left' }}>
      <PageHead title="Mein Monat" subtitle="Wie lief dein Monat? Das siehst nur du." />
      <div role="group" aria-label="Monat wählen" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setMo(monthKeyOf())} aria-pressed={dieser} style={chip(dieser)}>{name(monthKeyOf())} (dieser Monat)</button>
        <button type="button" onClick={() => setMo(prevMonthKey())} aria-pressed={!dieser} style={chip(!dieser)}>{name(prevMonthKey())}</button>
      </div>
      {leer ? (
        <div style={{ ...cardStyle, fontSize: '17px', lineHeight: 1.5 }}>
          {dieser ? 'In diesem Monat hast du noch nichts gelernt oder gespielt. Eine kurze Runde reicht für den Anfang!' : `Im ${name(mo)} hast du nichts gelernt oder gespielt.`}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {kachel(ICON.sparkle, d.punkte.toLocaleString('de-DE'), 'Punkte', d.punkteVormonat > 0 ? `${diff >= 0 ? '+' : '−'}${Math.abs(diff).toLocaleString('de-DE')} zum Vormonat` : undefined)}
            {kachel(ICON.trophy, d.platz ? `${d.platz}.` : '–', d.platz ? `Platz von ${d.mitspieler} im Team` : 'noch kein Platz')}
            {kachel(ICON.calendar, String(d.lerntage), d.lerntage === 1 ? 'Tag gelernt' : 'Tage gelernt')}
            {kachel(ICON.checklist, d.neuGemeistert === null ? '–' : String(d.neuGemeistert), d.neuGemeistert === null ? 'neu gemeistert (wird ab jetzt gezählt)' : d.neuGemeistert === 1 ? 'Frage neu gemeistert' : 'Fragen neu gemeistert')}
          </div>
          <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '17px' }}>
            <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '26px' }}>Dein {name(mo)}</h2>
            <span><strong>{d.runden.toLocaleString('de-DE')}</strong> {d.runden === 1 ? 'Runde' : 'Runden'} gespielt und gelernt</span>
            {d.lieblingsSpiel && <span>Am liebsten gemacht: <strong>{d.lieblingsSpiel}</strong></span>}
            {d.besterTag && <span>Bester Tag: <strong>{tagText(d.besterTag.tag)}</strong> mit {d.besterTag.punkte.toLocaleString('de-DE')} Punkten</span>}
          </section>
        </>
      )}
      {dieser && tipp && (
        <section style={{ ...cardStyle, display: 'flex', gap: '14px', alignItems: 'flex-start', backgroundColor: dc('#FFF0C2') }}>
          <span aria-hidden="true" style={{ color: TH.brown, flex: '0 0 auto' }}><LtIcon paths={ICON.bulb} size={28} /></span>
          <span style={{ fontSize: '17px', lineHeight: 1.5 }}><strong>Tipp für den Rest vom Monat:</strong> {tipp}</span>
        </section>
      )}
    </div>
  );
}
