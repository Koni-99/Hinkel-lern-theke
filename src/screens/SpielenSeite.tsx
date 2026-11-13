// ═══ Spiele-Auswahl ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../daten/data';
import { CloudPayload } from '../types';
import { topWeak } from '../focus';
import { LT } from '../basis/marke';
import { DuelSwords, DuelBadge, LtIcon, ICON, GAME_ICON } from '../basis/symbole';
import { cleanCat } from '../basis/serie';

export type SpielenSeiteProps = {
  fetchCloudData: (customUrl?: string | undefined) => Promise<CloudPayload | null>;
  cloudData: CloudPayload;
  isAdmin: boolean;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setBattleState: Dispatch<SetStateAction<"menu" | "playing" | "waiting">>;
  setAdventPreview: Dispatch<SetStateAction<boolean>>;
  duelInvites: number;
  userKeyLower: string;
  myStats: any;
  nowMonth: number;
  adventOpenNow: number;
  showAdventCard: boolean;
};

export function SpielenSeite({ fetchCloudData, cloudData, isAdmin, setActiveTab, setBattleState, setAdventPreview, duelInvites, userKeyLower, myStats, nowMonth, adventOpenNow, showAdventCard }: SpielenSeiteProps) {
  type G = { title: string; short: string; time: string; best?: string; learn?: boolean; duel?: number; action: () => void };
  const games: Record<string, G> = {
    kasse: { title: 'Kassenblitz', short: 'Rückgeld rechnen mit echten Preisen', time: '45 Sek.', action: () => setActiveTab('kassenblitz') },
    tueten: { title: 'Tüten-Blitz', short: 'Richtig einpacken, Schweres nach unten', time: '30 Sek.', action: () => setActiveTab('tueten') },
    ansturm: { title: 'Theken-Ansturm', short: 'Bestellungen packen, bevor die Geduld weg ist', time: 'Bis 3 Fehler', best: myStats.ansturmBest ? `Bestwert ${myStats.ansturmBest}` : undefined, action: () => setActiveTab('ansturm') },
    preis: { title: 'Teurer oder billiger?', short: 'Kennst du unsere Preise?', time: 'Bis zum 1. Fehler', best: myStats.priceBest ? `Beste Serie ${myStats.priceBest}` : undefined, learn: true, action: () => setActiveTab('preisduell') },
    bilder: { title: 'Welches Brot ist das?', short: 'Produkte am Foto erkennen', time: '10 Bilder', best: myStats.bilderBest ? `Bestwert ${myStats.bilderBest}/10` : undefined, learn: true, action: () => setActiveTab('bilderquiz') },
    schneiden: { title: 'Schneide-Profi', short: 'Die Brotschneidemaschine richtig einstellen', time: '10 Brote', best: myStats.sliceBest ? `Bestwert ${myStats.sliceBest}/10` : undefined, learn: true, action: () => setActiveTab('schneiden') },
    allergene: { title: 'Allergene-Training', short: 'Kunden mit Allergien richtig beraten', time: '10 Kunden', best: myStats.allergenBest ? `Bestwert ${myStats.allergenBest}/10` : undefined, learn: true, action: () => setActiveTab('allergene') },
    theke: { title: 'Theken-Simulator', short: 'Ein ganzes Verkaufsgespräch: begrüßen, beraten, kassieren', time: 'Ein Gespräch', learn: true, action: () => setActiveTab('theke') },
    alt: { title: 'Alternativen-Jäger', short: 'Ausverkauft? Die beste Empfehlung finden', time: '6 Runden', learn: true, action: () => setActiveTab('alternativen') },
    battle: { title: 'Quiz Battle', short: 'Kollegen herausfordern, 15 Sek. pro Frage', time: '5 Fragen', learn: true, duel: duelInvites, action: () => { setActiveTab('battle'); setBattleState('menu'); fetchCloudData(); } },
    advent: { title: 'Adventskalender', short: nowMonth === 10 ? 'Ab 1. Dezember jeden Tag ein Türchen' : 'Jeden Tag ein Türchen mit Extra-Punkten', time: adventOpenNow ? `${adventOpenNow} offen` : '1 Frage am Tag', learn: true, action: () => { setAdventPreview(false); setActiveTab('advent'); } },
  };
  const groups: { title: string; tint: string; ink: string; keys: string[] }[] = [
    ...(showAdventCard ? [{ title: 'Saison', tint: dc('#F4EADB'), ink: dc('#3A2010'), keys: ['advent'] }] : []),
    { title: 'Beraten wie an der Theke', tint: dc('#FFF0C2'), ink: dc('#4B2A14'), keys: ['theke', 'alt'] },
    { title: 'Produkte kennen', tint: dc('#E1EEDC'), ink: dc('#2F5D3A'), keys: ['bilder', 'allergene', 'schneiden'] },
    { title: 'Schnell an der Kasse', tint: dc('#FCE1D2'), ink: dc('#9A3412'), keys: ['kasse', 'preis', 'ansturm', 'tueten'] },
    { title: 'Gegen Kollegen', tint: dc('#DDE6F7'), ink: dc('#2F4F8A'), keys: ['battle'] },
  ];
  // Zuletzt gespielt: jüngster eigener Eintrag in der Bestenliste, der zu einem Spiel gehört
  const lastKey = (() => {
    let best = 0, key = '';
    (cloudData.scores || []).forEach((sc: any) => {
      if (String(sc?.username || '').toLowerCase() !== userKeyLower) return;
      const ts = Number(String(sc.id || '').split('_').pop()) || 0;
      const cat = cleanCat(String(sc.category || ''));
      const k = Object.keys(games).find(g => cat.startsWith(cleanCat(games[g].title)));
      if (k && ts > best) { best = ts; key = k; }
    });
    return key;
  })();
  const chip = (text: string, ink: string, strong?: boolean) => <span style={{ padding: '3px 9px', borderRadius: '999px', backgroundColor: dc('#F6EFE2'), color: ink, fontSize: '13px', fontWeight: strong ? 800 : 700, whiteSpace: 'nowrap' }}>{text}</span>;
  const card = (k: string, _tint: string, ink: string) => {
    const g = games[k];
    return (
      <button key={k} onClick={g.action} className="lt-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px', minWidth: 0, borderRadius: '20px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '14px', backgroundColor: g.duel ? dc('#FFFFFF') : '#1F140C', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(g.duel ? {} : { boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }) }}>
          {g.duel ? <><DuelSwords size={34} /><DuelBadge n={g.duel} /></> : <span style={{ color: '#FFD86B', display: 'flex' }} aria-hidden="true"><LtIcon paths={GAME_ICON[g.title] || ICON.game} size={25} width={1.9} /></span>}
        </span>
        <span style={{ fontFamily: LT.serif, fontSize: '21px', lineHeight: 1.15, overflowWrap: 'anywhere' }}>{g.title}</span>
        {g.duel ? <span style={{ fontSize: '15px', fontWeight: 800, color: dc('#B42318') }}>{g.duel === 1 ? 'Du wurdest herausgefordert!' : `${g.duel} Herausforderungen warten!`}</span> : <span className="lt-hide-mobile" style={{ fontSize: '16px', lineHeight: 1.4, color: LT.brown }}>{g.short}</span>}
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
          {chip(g.time, ink, true)}
          {g.best && chip(g.best, ink)}
          {g.learn && chip('📚 zählt fürs Lernen', dc('#2F4F8A'))}
        </span>
      </button>
    );
  };
  const lastGroup = groups.find(gr => gr.keys.includes(lastKey));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '44px' }}>Spielen</h1>
        <p style={{ margin: '6px 0 0', fontSize: '18px', color: LT.brown }}>Jedes Spiel bringt Punkte für die Bestenliste. Mit 📚 hakst du nebenbei auch Lernfragen ab.</p>
      </div>
      {lastKey && lastGroup && (
        <button onClick={games[lastKey].action} className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '20px', border: 'none', backgroundColor: LT.brown, color: dc('#FFF6E0'), textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ flex: '0 0 48px', height: '48px', borderRadius: '14px', backgroundColor: '#1F140C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD86B', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={GAME_ICON[games[lastKey].title] || ICON.game} size={25} width={1.9} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '14px', color: dc('#F0D9AE') }}>Zuletzt gespielt</span>
            <span style={{ display: 'block', fontFamily: LT.serif, fontSize: '22px', lineHeight: 1.15 }}>{games[lastKey].title}</span>
          </span>
          <span style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: LT.yellow, color: dc('#2B170A'), fontWeight: 800, fontSize: '16px', whiteSpace: 'nowrap' }}>Nochmal →</span>
        </button>
      )}
      {!isAdmin && (() => {
        const tw = topWeak(5);
        return (
          <section aria-labelledby="lt-focus-h" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 18px', borderRadius: '20px', backgroundColor: dc('#FFFFFF'), border: `2px solid ${LT.line}` }}>
            <h2 id="lt-focus-h" style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '24px' }}>🎯 Dein Schwachstellen-Training</h2>
            {tw.length > 0 ? (
              <>
                <p style={{ margin: 0, fontSize: '16px', color: LT.brown, lineHeight: 1.45 }}>Diese Produkte kommen in „Welches Brot ist das?“, Allergene-Training, „Teurer oder billiger?“, Schneide-Profi und Alternativen-Jäger jetzt öfter dran, bis du sie sicher kannst:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tw.map(x => <span key={x.name} style={{ padding: '6px 12px', borderRadius: '999px', backgroundColor: x.level >= 4 ? dc('#FCE1D2') : dc('#FFF0C2'), color: x.level >= 4 ? dc('#9A3412') : dc('#6B4A12'), fontWeight: 700, fontSize: '15px' }}>{x.name}</span>)}
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: '16px', color: LT.brown, lineHeight: 1.45 }}>Noch keine Schwachstellen. Liegst du in einem Spiel oder im Quiz bei einem Produkt daneben, kommt es danach automatisch öfter dran, bis es sitzt.</p>
            )}
          </section>
        );
      })()}
      {groups.map(gr => (
        <section key={gr.title} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '24px' }}>{gr.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '14px' }}>
            {gr.keys.map(k => card(k, gr.tint, gr.ink))}
          </div>
        </section>
      ))}
    </div>
  );
}
