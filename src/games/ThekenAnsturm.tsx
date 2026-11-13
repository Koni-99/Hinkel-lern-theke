// ═══ Spiel: Theken-Ansturm ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { TH, cardStyle, PageHead, StatChip, GameIntro, GameResult, productImageKey, ProductImages, ConfettiOverlay } from '../ui/basis';
import { scrollToPlay } from '../ui/belohnungen';

// ───────── Theken-Ansturm ─────────
export const ANSTURM_FACES = ['👩', '👨', '👵', '👴', '🧑', '👩‍🦰', '👨‍🦳', '🧔', '👱‍♀️', '👷'];

export function ThekenAnsturmView({ images, onSaveScore, onBest }: { images: ProductImages; onSaveScore: (points: number, category: string) => void; onBest?: (served: number) => void }) {
  const allPool = SHOP_PRODUCTS.filter(p => !['Sonstiges', 'Backmischung'].includes(p.group) && !/stollen/i.test(p.name));
  const withImg = allPool.filter(p => images[productImageKey(p.name)]);
  const pool = withImg.length >= 12 ? withImg : allPool;
  const [state, setState] = useState<'menu' | 'play' | 'result'>('menu');
  const [shelf, setShelf] = useState<any[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [packed, setPacked] = useState<string[]>([]);
  const [face, setFace] = useState('👩');
  const [served, setServed] = useState(0);
  const [lost, setLost] = useState(0);
  const [score, setScore] = useState(0);
  const [patience, setPatience] = useState(1);
  const [wrongName, setWrongName] = useState('');
  const startRef = useRef(0);
  const penaltyRef = useRef(0);
  const busyRef = useRef(false);
  const servedRef = useRef(0);
  const limitFor = (n: number) => Math.max(6000, 14000 - n * 500);

  const newCustomer = (n: number) => {
    const sh = shuffleArray(pool).slice(0, 8);
    const size = Math.min(4, 2 + Math.floor(n / 4));
    setShelf(sh);
    setOrder(shuffleArray(sh).slice(0, size).map((p: any) => p.name));
    setPacked([]);
    setFace(ANSTURM_FACES[Math.floor(Math.random() * ANSTURM_FACES.length)]);
    startRef.current = Date.now(); penaltyRef.current = 0; setPatience(1);
    busyRef.current = false;
  };
  const start = () => { setServed(0); servedRef.current = 0; setLost(0); setScore(0); setState('play'); newCustomer(0); scrollToPlay(); };
  const finish = (s: number) => { setState('result'); if (s > 0) onSaveScore(s, 'Theken-Ansturm 🏃'); onBest?.(servedRef.current); };

  const tap = (name: string) => {
    if (busyRef.current || packed.includes(name)) return;
    if (!order.includes(name)) { penaltyRef.current += 1500; setWrongName(name); window.setTimeout(() => setWrongName(''), 1200); return; }
    const np = [...packed, name];
    setPacked(np);
    if (np.length === order.length) {
      busyRef.current = true;
      const bonus = Math.round(patience * 10);
      const ns = score + order.length * 5 + bonus;
      const n = served + 1;
      setScore(ns); setServed(n); servedRef.current = n;
      window.setTimeout(() => newCustomer(n), 600);
    }
  };

  useEffect(() => {
    if (state !== 'play') return;
    const t = window.setInterval(() => {
      if (busyRef.current) return;
      const f = 1 - (Date.now() - startRef.current + penaltyRef.current) / limitFor(served);
      if (f > 0) { setPatience(f); return; }
      busyRef.current = true;
      const nl = lost + 1;
      setLost(nl); setPatience(0);
      window.setTimeout(() => { if (nl >= 3) finish(score); else newCustomer(served); }, 700);
    }, 100);
    return () => window.clearInterval(t);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <ConfettiOverlay active={state === 'result' && served >= 8} />
      <PageHead title="Theken-Ansturm" subtitle="Die Schlange wird länger. Pack jede Bestellung, bevor der Kunde ungeduldig wird." />
      {state === 'menu' && <GameIntro title="So geht's" text="Der Kunde sagt, was er möchte. Erkenne die Ware am Foto und tippe sie an, bis alles in der Tüte ist. Den Namen siehst du erst nach dem Antippen. Falsches Produkt kostet Geduld. Drei verärgerte Kunden und das Spiel ist vorbei." hint="Je schneller du bist, desto mehr Bonuspunkte." startLabel="Theke öffnen" onStart={start} />}
      {state === 'play' && (
        <div id="lt-game-card" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <StatChip label="Punkte" value={String(score)} />
            <StatChip label="Bedient" value={String(served)} />
            <StatChip label="Verärgert" value={`${lost} / 3`} />
          </div>
          <div className="lt-ansturm-order" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span key={served + '-' + lost} className="lt-pop-in" style={{ fontSize: '54px', lineHeight: 1 }}>{patience <= 0 ? '😠' : patience < 0.3 ? '😤' : face}</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '16px', backgroundColor: '#F4EADB', fontSize: '17px', lineHeight: 1.4 }}>
                Ich hätte gern: {order.map((o, i) => <span key={o} style={{ display: 'inline-block', marginRight: '6px' }}><b style={{ textDecoration: packed.includes(o) ? 'line-through' : 'none', opacity: packed.includes(o) ? 0.5 : 1 }}>{o}</b>{i < order.length - 2 ? ',' : i === order.length - 2 ? ' und' : '.'}</span>)}
              </div>
              <div style={{ height: '10px', borderRadius: '999px', backgroundColor: TH.line, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, patience) * 100}%`, height: '100%', backgroundColor: patience > 0.3 ? TH.green : TH.red }} />
              </div>
            </div>
          </div>
          <div className="lt-ansturm-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
            {shelf.map(p => {
              const done = packed.includes(p.name);
              return (
                <button key={p.name} onClick={() => tap(p.name)} disabled={done} style={{ padding: '6px', borderRadius: '14px', border: `3px solid ${wrongName === p.name ? TH.red : done ? TH.green : TH.line}`, backgroundColor: done ? TH.tintSage : TH.white, cursor: done ? 'default' : 'pointer', opacity: done ? 0.55 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  {images[productImageKey(p.name)] ? <img src={images[productImageKey(p.name)]} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px' }} /> : <span style={{ fontSize: '44px', lineHeight: 1.4 }}>🥖</span>}
                  {/* Name nur ohne Foto zeigen: so muss man die Ware am Bild erkennen */}
                  {(!images[productImageKey(p.name)] || done || wrongName === p.name) && <span style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2, color: wrongName === p.name ? TH.red : undefined }}>{p.name}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {state === 'result' && <GameResult title="Laden zu!" big={`${score} Punkte`} text={`Du hast ${served} Kunden bedient.`} againLabel="Nochmal" onAgain={start} celebrate={served >= 8} stars={served >= 10 ? 3 : served >= 6 ? 2 : served >= 3 ? 1 : 0} />}
    </div>
  );
}
