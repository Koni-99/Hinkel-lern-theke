// ═══ Nachschlagen-Seite „Unsere Theke“ (Version 285, Nutzer wählte die Vorschau) ═══
// Oben die Suche „Was fragt der Kunde?“ mit Mikrofon, darunter die Produkte als Fotos mit kleinem Preisschild
// wie vor der echten Auslage (antippen öffnet den Steckbrief), danach die anderen Bereiche und der Saisonkalender.
import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../daten/data';
import { LT } from '../basis/marke';
import { LtIcon, ICON } from '../basis/symbole';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { kleinesFoto } from '../daten/fotos';
import { productImageKey, ProductImages } from '../ui/basis';
import { SprachKnopf } from '../ui/sprachKnopf';
import { suchNorm } from '../hilfen/suche';
import { zuletztLesen } from '../hilfen/steckbriefExtras';
import { getProductEmoji } from '../components/karteikarten/daten';

export type NachschlagenSeiteProps = {
  openSeasons: Record<string, boolean>;
  setOpenSeasons: Dispatch<SetStateAction<Record<string, boolean>>>;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setSpickArea: Dispatch<SetStateAction<"produkt" | "fach">>;
  setSpickView: Dispatch<SetStateAction<"dictionary" | undefined>>;
  fullSeasonalMap: Record<string, string[]>;
  kundenfragenNeu?: number;
  images?: ProductImages;
  /** öffnet den Steckbrief eines Produkts */
  zeigeSteckbrief?: (name: string) => void;
};

const DISPLAY = "'Bricolage Grotesque', 'Atkinson Hyperlegible', sans-serif";
const REITER = ['Alles', 'Brot', 'Brötchen', 'Kleingebäck', 'Feingebäck', 'Kuchen', 'Stuten & Brioche', 'Herzhafte Snacks', 'Weihnachtsgebäck', 'Saisongebäck'];
const AUF_EINEN_BLICK = 9;
const preisKurz = (p?: string) => (p || '').replace(/\s*€\s*$/, '').trim();

export function NachschlagenSeite({ openSeasons, setOpenSeasons, setActiveTab, setSpickArea, setSpickView, fullSeasonalMap, kundenfragenNeu = 0, images = {}, zeigeSteckbrief }: NachschlagenSeiteProps) {
  const [suche, setSuche] = useState('');
  const [reiter, setReiter] = useState('Alles');
  const produkte = useMemo(() => SHOP_PRODUCTS.filter((p) => !['Sonstiges', 'Backmischung'].includes(p.group)), []);
  const reiterDa = REITER.filter((r) => r === 'Alles' || produkte.some((p) => p.group === r));
  const zuletzt = useMemo(() => zuletztLesen(), []);
  const q = suchNorm(suche);
  const gefiltert = produkte.filter((p) => {
    if (reiter !== 'Alles' && p.group !== reiter) return false;
    if (!q) return true;
    const text = suchNorm([p.name, ...(p.aliases || []), p.group, p.shortIngredients, p.vegan ? 'vegan' : ''].join(' '));
    return q.split(' ').every((w) => text.includes(w));
  });
  const eingeschraenkt = !q && reiter === 'Alles';
  // Auf einen Blick: zuerst die zuletzt angesehenen, dann die mit Foto
  const liste = eingeschraenkt
    ? [...gefiltert].sort((a, b) => {
      const za = zuletzt.indexOf(a.name), zb = zuletzt.indexOf(b.name);
      if (za !== zb) return (za < 0 ? 99 : za) - (zb < 0 ? 99 : zb);
      return (images[productImageKey(b.name)] ? 1 : 0) - (images[productImageKey(a.name)] ? 1 : 0);
    }).slice(0, AUF_EINEN_BLICK)
    : gefiltert.slice(0, 60);
  const alleSteckbriefe = () => { setSpickArea('produkt'); setSpickView(undefined); setActiveTab('flashcards'); };
  const oeffne = (name: string) => (zeigeSteckbrief ? zeigeSteckbrief(name) : alleSteckbriefe());

  // Version 287: Karten wie auf der Lernen-Seite (weiß, dunkles Symbol-Kästchen, Serif-Überschrift), Wunsch des Nutzers
  const bereich = (opt: { titel: string; text: string; icon: string[]; onClick: () => void; neu?: string }) => (
    <button key={opt.titel} onClick={opt.onClick} className="lt-card lt-theke-bereich" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '22px', borderRadius: '22px', border: 'none', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', color: LT.ink, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
      {opt.neu && <span style={{ position: 'absolute', top: '18px', right: '18px', padding: '4px 12px', borderRadius: '999px', backgroundColor: LT.yellow, color: '#2B170A', fontSize: '14px', fontWeight: 800 }} className="lt-papier">{opt.neu}</span>}
      <span aria-hidden="true" style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1F140C', color: '#FFD86B', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,216,107,.18), 0 4px 10px -6px rgba(31,20,12,.6)' }}><LtIcon paths={opt.icon} size={24} /></span>
      <span style={{ fontFamily: LT.serif, fontSize: '24px', lineHeight: 1.1 }}>{opt.titel}</span>
      <span style={{ fontSize: '17px', lineHeight: 1.4 }}>{opt.text}</span>
    </button>
  );

  return (
    <div className="lt-theke-seite" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: '40px', letterSpacing: '-1px', lineHeight: 1 }}>Unsere Theke</h1>
        <p style={{ margin: '8px 0 0', fontSize: '18px', color: LT.brown }}>Der Kunde fragt, du schlägst es hier nach.</p>
      </div>

      <div className="lt-theke-suche" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 6px 6px 16px', borderRadius: '20px', backgroundColor: dc('#FFFFFF'), border: `2px solid ${LT.yellow}`, boxShadow: '0 12px 26px -18px rgba(31,20,12,.55)' }}>
        <span aria-hidden="true" style={{ color: LT.brown, display: 'flex' }}><LtIcon paths={ICON.search} size={22} /></span>
        <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Was fragt der Kunde?" aria-label="Produkt suchen"
          style={{ flex: 1, minWidth: 0, minHeight: '48px', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '18px', color: LT.ink, fontFamily: 'inherit' }} />
        {suche && <button type="button" onClick={() => setSuche('')} aria-label="Suche leeren" style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: dc('#F3EADA'), color: LT.ink, fontSize: '20px', cursor: 'pointer' }}>×</button>}
        <SprachKnopf gross onText={(t) => { setSuche(t); setReiter('Alles'); }} />
      </div>

      <div className="lt-theke-reiter" role="tablist" aria-label="Warengruppe" style={{ display: 'flex', gap: '8px', overflowX: 'auto', margin: '0 -4px', padding: '2px 4px 4px', scrollbarWidth: 'none' }}>
        {reiterDa.map((r) => {
          const an = r === reiter;
          return <button key={r} role="tab" aria-selected={an} onClick={() => setReiter(r)} className={an ? 'lt-papier' : undefined} style={{ flex: '0 0 auto', minHeight: '42px', padding: '0 16px', borderRadius: '999px', border: `2px solid ${an ? '#3A1F0E' : LT.line}`, backgroundColor: an ? '#3A1F0E' : dc('#FFFFFF'), color: an ? '#FFC72C' : LT.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{r === 'Alles' ? 'Alles' : r}</button>;
        })}
      </div>

      {liste.length === 0 ? (
        <div style={{ padding: '18px', borderRadius: '20px', backgroundColor: dc('#FFF5DC'), fontSize: '17px', lineHeight: 1.45 }}>
          Dazu gibt es kein Produkt. Probier ein anderes Wort, zum Beispiel einen Teil vom Namen.
          <button onClick={() => setActiveTab('kundenfragen')} className="lt-papier" style={{ display: 'block', marginTop: '10px', minHeight: '46px', padding: '0 16px', borderRadius: '14px', border: 'none', backgroundColor: '#3A1F0E', color: '#FFC72C', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Den Ausbilder fragen</button>
        </div>
      ) : (
        <div className="lt-theke-raster" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: '14px 10px' }}>
          {liste.map((p) => {
            const bild = images[productImageKey(p.name)];
            return (
              <button key={p.name} onClick={() => oeffne(p.name)} aria-label={`Steckbrief ${p.name}${p.price ? `, ${p.price}` : ''}`} className="lt-theke-ware" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px', padding: 0, border: 'none', background: 'none', color: LT.ink, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                {bild
                  ? <img src={kleinesFoto(bild)} alt="" loading="lazy" decoding="async" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '16px', display: 'block', boxShadow: '0 8px 16px -12px rgba(31,20,12,.6)' }} />
                  : <span aria-hidden="true" style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '16px', backgroundColor: dc('#FFF3CF'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px' }}>{getProductEmoji(p.name, p.group)}</span>}
                {p.price && <span className="lt-preisschild lt-papier" style={{ position: 'absolute', top: '6px', right: '-4px', padding: '4px 8px 4px 15px', backgroundColor: '#FFFCF5', color: '#2B170A', fontFamily: DISPLAY, fontWeight: 800, fontSize: '14px', clipPath: 'polygon(10px 0,100% 0,100% 100%,10px 100%,0 50%)', borderRadius: '0 7px 7px 0', boxShadow: '0 3px 6px rgba(0,0,0,.3)', transform: 'rotate(5deg)' }}>{preisKurz(p.price)}</span>}
                <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.2, hyphens: 'auto', overflowWrap: 'anywhere' }} lang="de">{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
      {(eingeschraenkt || gefiltert.length > liste.length) && (
        <button onClick={alleSteckbriefe} className="lt-alle-produkte lt-papier" style={{ minHeight: '54px', borderRadius: '16px', border: 'none', backgroundColor: '#3A1F0E', color: '#FFC72C', fontSize: '18px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Alle {produkte.length} Produkte mit Filter ansehen
        </button>
      )}

      <h2 style={{ margin: '10px 0 -4px', fontFamily: DISPLAY, fontWeight: 700, fontSize: '24px' }}>Mehr nachschlagen</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {bereich({ titel: 'Spickzettel Fachwissen', text: 'Sauerteig, Mehl, Frische, Schnittgrößen', icon: ICON.book, onClick: () => { setSpickArea('fach'); setSpickView(undefined); setActiveTab('flashcards'); } })}
        {bereich({ titel: 'Das hat ein Kunde gefragt', text: 'Fragen von der Theke mit Antwort', icon: ICON.chat, onClick: () => setActiveTab('kundenfragen'), neu: kundenfragenNeu > 0 ? (kundenfragenNeu === 1 ? 'Neue Antwort' : `${kundenfragenNeu} neu`) : undefined })}
        {bereich({ titel: 'Englisch-Wörterbuch', text: 'Sätze für Gäste, mit Vorlesen', icon: ICON.globe, onClick: () => { setSpickArea('fach'); setSpickView('dictionary'); setActiveTab('flashcards'); } })}
        {bereich({ titel: 'Gute Sätze für die Theke', text: 'Begrüßen, Beraten, Kassieren', icon: ICON.speaker, onClick: () => setActiveTab('saetze') })}
        {bereich({ titel: 'Kundenstimmen', text: 'Lob oder Kritik kurz notieren', icon: ICON.heart, onClick: () => setActiveTab('kundenstimmen') })}
      </div>

      <section style={{ padding: '18px', borderRadius: '22px', backgroundColor: dc('#FFFFFF'), border: `1px solid ${LT.line}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><LtIcon paths={ICON.leaf} size={24} />Saisonkalender</h2>
        <p style={{ margin: 0, fontSize: '16px', color: LT.brown }}>Was gibt es wann? Tippe auf eine Jahreszeit.</p>
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
                <button onClick={() => setOpenSeasons(prev => ({ ...prev, [seas.key]: !prev[seas.key] }))} aria-expanded={!!isOpen} style={{ width: '100%', minHeight: '52px', backgroundColor: 'transparent', border: 'none', padding: '0 16px', textAlign: 'left', fontWeight: 700, fontSize: '17px', color: LT.ink, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit' }}>
                  <span>{seas.title}</span><span style={{ color: LT.muted }}>{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px', fontSize: '16px', lineHeight: 1.45, color: LT.brown, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {itemsList.length === 0 ? <div>Noch keine Einträge.</div> : itemsList.map((txt, i) => (<div key={i}>• {txt}</div>))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
