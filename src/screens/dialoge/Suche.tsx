// ═══ Version 251: Suche überall (Lupe oben in der Markise) ═══
// Ein Suchfeld (auch mit Sprache) für Produkte, Quizfragen, Hilfe-Themen und Seiten.
// Die Hilfe wird unsichtbar mitgezeichnet und ihr Text durchsucht, so bleibt die Suche immer aktuell.
import { useState, useEffect, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { TH, productImageKey, ProductImages } from '../../ui/basis';
import { LtIcon, ICON } from '../../basis/symbole';
import { SHOP_PRODUCTS } from '../../daten/shopProducts';
import { kleinesFoto } from '../../daten/fotos';
import { getRightAnswerText } from '../../hilfen/allgemein';
import { SEITEN } from '../../hilfen/nutzung';
import { suchen } from '../../hilfen/suche';
import { SprachKnopf } from '../../ui/sprachKnopf';
import { useZurueckSchliesst } from '../../hilfen/zurueck';

const OHNE_SEITE = new Set(['home', 'profil', 'statistik', 'ausbildung', 'advent', 'jahr', 'appwoche', 'flashcards']);

export function SucheDialog({ fragen, images, hilfe, onClose, onSteckbrief, onSeite, onHilfe }: {
  fragen: any[]; images: ProductImages; hilfe: ReactNode; onClose: () => void;
  onSteckbrief: (name: string) => void; onSeite: (tab: string) => void; onHilfe: (titel: string) => void;
}) {
  useZurueckSchliesst(true, onClose);
  const [q, setQ] = useState('');
  const [offen, setOffen] = useState<number | null>(null);
  const [hilfeIndex, setHilfeIndex] = useState<{ titel: string; text: string }[]>([]);
  const versteckt = useRef<HTMLDivElement>(null);
  const feld = useRef<HTMLInputElement>(null);
  useEffect(() => { window.setTimeout(() => feld.current?.focus(), 50); }, []);
  useEffect(() => {
    // Version 272: die Hilfe wird erst bei Bedarf geladen → warten, bis sie da ist
    let n = 0;
    const lies = () => {
      const el = versteckt.current; if (!el) return;
      const liste = [...el.querySelectorAll('details')].map((d) => ({ titel: (d.querySelector('summary')?.textContent || '').replace('▾', '').trim(), text: (d.textContent || '') })).filter((x) => x.titel);
      if (liste.length || ++n > 100) { setHilfeIndex(liste); window.clearInterval(t); }
    };
    const t = window.setInterval(lies, 100);
    lies();
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => { const t = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', t); return () => window.removeEventListener('keydown', t); }, [onClose]);

  const seiten = useMemo(() => Object.entries(SEITEN).filter(([k]) => !OHNE_SEITE.has(k)).map(([k, titel]) => ({ k, titel })), []);
  const s = q.trim();
  const produkte = s.length >= 2 ? suchen(SHOP_PRODUCTS, s, (p) => `${p.group} ${(p.aliases || []).join(' ')} ${p.shortIngredients} ${p.allergens.join(' ')}`, (p) => p.name, 8) : [];
  const quiz = s.length >= 3 ? suchen(fragen.filter((x) => x && x.question), s, (x) => `${(x.options || []).join(' ')} ${x.category || ''} ${x.product || ''}`, (x) => x.question, 8) : [];
  const hilfeFunde = s.length >= 3 ? suchen(hilfeIndex, s, (h) => h.text, (h) => h.titel, 5) : [];
  const seitenFunde = s.length >= 2 ? suchen(seiten, s, () => '', (x) => x.titel, 4) : [];
  const nichts = s.length >= 2 && !produkte.length && !quiz.length && !hilfeFunde.length && !seitenFunde.length;

  const gruppe = (titel: string, kinder: ReactNode) => (
    <section className="lt-suche-gruppe" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: TH.muted }}>{titel}</div>
      {kinder}
    </section>
  );
  const zeile = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minHeight: '56px', padding: '8px 12px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, textAlign: 'left' as const, fontSize: '17px', cursor: 'pointer' };

  return (
    <div className="lt-overlay lt-suche" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 140, backgroundColor: 'rgba(43,23,10,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'max(12px, env(safe-area-inset-top)) 12px 12px' }}>
      <div role="dialog" aria-modal="true" aria-label="Suchen" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '640px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', backgroundColor: TH.cream, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
        <div className="lt-papier" style={{ backgroundColor: TH.yellow, color: TH.ink, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LtIcon paths={ICON.search} size={24} />
          <input ref={feld} value={q} onChange={(e) => { setQ(e.target.value); setOffen(null); }} placeholder="Produkt, Frage oder Thema …" aria-label="Suchbegriff" enterKeyHint="search"
            style={{ flex: 1, minWidth: 0, minHeight: '48px', padding: '0 14px', borderRadius: '14px', border: 'none', fontSize: '18px', backgroundColor: TH.white, color: TH.ink }} />
          <SprachKnopf onText={(t) => { setQ(t); setOffen(null); }} />
          <button onClick={onClose} aria-label="Schließen" style={{ flex: '0 0 44px', height: '44px', borderRadius: '50%', border: 'none', backgroundColor: TH.white, color: TH.ink, fontSize: '22px', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {s.length < 2 && <div style={{ fontSize: '16px', color: TH.muted, lineHeight: 1.5 }}>Suche nach einem Produkt („Dinkel“, „Mohn“), einer Zutat oder einem Allergen, nach Wissen aus dem Quiz („Sauerteig“) oder nach einer Funktion („Laden“, „Urlaub“). Mit dem Mikrofon kannst du auch sprechen.</div>}
          {nichts && <div style={{ fontSize: '17px', color: TH.muted }}>Nichts gefunden zu „{s}“.</div>}
          {produkte.length > 0 && gruppe('Produkte', produkte.map((p) => {
            const bild = images[productImageKey(p.name)];
            return (
              <button key={p.name} className="lt-suche-produkt" onClick={() => onSteckbrief(p.name)} style={zeile}>
                {bild ? <img src={kleinesFoto(bild)} alt="" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', flex: '0 0 auto' }} /> : <span style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: TH.tintYellow, flex: '0 0 auto' }} />}
                <span style={{ flex: 1, minWidth: 0 }}><strong style={{ display: 'block' }}>{p.name}</strong><span style={{ fontSize: '14px', color: TH.muted }}>{[p.group, p.price].filter(Boolean).join(' · ')}</span></span>
                <span aria-hidden="true" style={{ fontSize: '20px', color: TH.muted }}>›</span>
              </button>
            );
          }))}
          {seitenFunde.length > 0 && gruppe('Seiten', seitenFunde.map((x) => (
            <button key={x.k} className="lt-suche-seite" onClick={() => onSeite(x.k)} style={zeile}><span style={{ flex: 1 }}><strong>{x.titel}</strong></span><span aria-hidden="true" style={{ fontSize: '20px', color: TH.muted }}>›</span></button>
          )))}
          {quiz.length > 0 && gruppe('Aus dem Quiz', quiz.map((x, i) => (
            <button key={x.id ?? i} className="lt-suche-frage" onClick={() => setOffen(offen === i ? null : i)} aria-expanded={offen === i} style={{ ...zeile, flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
              <span style={{ fontWeight: 700, lineHeight: 1.4 }}>{x.question}</span>
              {offen === i ? <span style={{ color: TH.green, fontSize: '16px' }}>Richtig: <strong>{getRightAnswerText(x)}</strong></span> : <span style={{ fontSize: '14px', color: TH.muted }}>Antippen zeigt die Antwort</span>}
            </button>
          )))}
          {hilfeFunde.length > 0 && gruppe('Hilfe', hilfeFunde.map((h) => (
            <button key={h.titel} className="lt-suche-hilfe" onClick={() => onHilfe(h.titel)} style={zeile}><LtIcon paths={ICON.bulb} size={20} /><span style={{ flex: 1 }}><strong>{h.titel}</strong></span><span aria-hidden="true" style={{ fontSize: '20px', color: TH.muted }}>›</span></button>
          )))}
        </div>
      </div>
      <div ref={versteckt} aria-hidden="true" style={{ display: 'none' }}>{hilfe}</div>
    </div>
  );
}
