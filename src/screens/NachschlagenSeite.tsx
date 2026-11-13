// ═══ Nachschlagen-Seite ═══
// Vorher mitten in App.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../daten/data';
import { LT } from '../basis/marke';
import { LtIcon, ICON } from '../basis/symbole';

export type NachschlagenSeiteProps = {
  openSeasons: Record<string, boolean>;
  setOpenSeasons: Dispatch<SetStateAction<Record<string, boolean>>>;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setSpickArea: Dispatch<SetStateAction<"produkt" | "fach">>;
  setSpickView: Dispatch<SetStateAction<"dictionary" | undefined>>;
  fullSeasonalMap: Record<string, string[]>;
};

export function NachschlagenSeite({ openSeasons, setOpenSeasons, setActiveTab, setSpickArea, setSpickView, fullSeasonalMap }: NachschlagenSeiteProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '44px' }}>Nachschlagen</h1>
        <p style={{ margin: '6px 0 0', fontSize: '19px', color: LT.brown }}>Schnell etwas nachsehen, Produkte, Zutaten, Allergene und was es wann gibt.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <button onClick={() => { setSpickArea('produkt'); setSpickView(undefined); setActiveTab('flashcards'); }} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '26px', borderRadius: '26px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ width: '60px', height: '60px', borderRadius: '18px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.bread} size={28} width={1.9} /></span>
          <span style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.05 }}>Spickzettel Produktkenntnis</span>
          <span style={{ fontSize: '18px', lineHeight: 1.45, color: LT.brown }}>Alle Produkte mit Zutaten, Allergenen und Schnitt, die Steckbriefe zum Nachsehen an der Theke.</span>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '56px', borderRadius: '16px', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>Produkte öffnen</span>
        </button>
        <button onClick={() => { setSpickArea('fach'); setSpickView(undefined); setActiveTab('flashcards'); }} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '26px', borderRadius: '26px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ width: '60px', height: '60px', borderRadius: '18px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.book} size={28} width={1.9} /></span>
          <span style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.05 }}>Spickzettel Fachwissen</span>
          <span style={{ fontSize: '18px', lineHeight: 1.45, color: LT.brown }}>Geschmack, Sauerteig, Mehl, Frischhaltung, Schnittgrößen, Geschichte & mehr, kompakt aus der Verkaufsmappe.</span>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '56px', borderRadius: '16px', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>Fachwissen öffnen</span>
        </button>
        <button onClick={() => { setSpickArea('fach'); setSpickView('dictionary'); setActiveTab('flashcards'); }} className="lt-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '26px', borderRadius: '26px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ width: '60px', height: '60px', borderRadius: '18px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.globe} size={28} width={1.9} /></span>
          <span style={{ fontFamily: LT.serif, fontSize: '30px', lineHeight: 1.05 }}>Englisch-Wörterbuch</span>
          <span style={{ fontSize: '18px', lineHeight: 1.45, color: LT.brown }}>Sätze für die Theke, Allergene, Fachbegriffe und alle Produkte auf Englisch, mit Suche und Vorlesen.</span>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '56px', borderRadius: '16px', backgroundColor: '#1F140C', color: '#FFD86B', fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>Wörterbuch öffnen</span>
        </button>
        <section style={{ padding: '26px', borderRadius: '26px', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ width: '60px', height: '60px', borderRadius: '18px', backgroundColor: '#1F140C', color: '#FFD86B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }} aria-hidden="true"><LtIcon paths={ICON.leaf} size={28} width={1.9} /></span>
          <h2 style={{ margin: 0, fontFamily: LT.serif, fontWeight: 400, fontSize: '34px', lineHeight: 1 }}>Saisonkalender</h2>
          <p style={{ margin: 0, fontSize: '18px', color: LT.brown }}>Was gibt es wann? Tippe auf eine Jahreszeit.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { key: 'Frühling', title: 'Frühling' },
              { key: 'Sommer', title: 'Sommer' },
              { key: 'Herbst', title: 'Herbst' },
              { key: 'Winter', title: 'Winter & Karneval' }
            ].map(seas => {
              const isOpen = openSeasons[seas.key];
              const itemsList = fullSeasonalMap[seas.key] || [];
              return (
                <div key={seas.key} style={{ backgroundColor: LT.cream, borderRadius: '14px', border: `1px solid ${LT.line}`, overflow: 'hidden' }}>
                  <button onClick={() => setOpenSeasons(prev => ({ ...prev, [seas.key]: !prev[seas.key] }))} aria-expanded={!!isOpen} style={{ width: '100%', minHeight: '54px', backgroundColor: 'transparent', border: 'none', padding: '0 16px', textAlign: 'left', fontWeight: 700, fontSize: '18px', color: LT.ink, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{seas.title}</span><span style={{ color: LT.muted }}>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 16px 14px', fontSize: '17px', lineHeight: 1.45, color: LT.brown, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {itemsList.length === 0 ? <div>Noch keine Einträge.</div> : itemsList.map((txt, i) => (<div key={i}>• {txt}</div>))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
