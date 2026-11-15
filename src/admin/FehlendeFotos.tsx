// ═══ Ausbilder-Bereich: Produkte ohne Foto ═══
// Zeigt alle Produkte, für die noch kein Foto da ist. Pro Produkt ein Foto aufnehmen oder auswählen,
// es wird verkleinert und sofort für alle Mitarbeiter gespeichert (Steckbriefe, Bilderquiz, Allergene-Training).
import { useState, CSSProperties } from 'react';
import { TH, cardStyle, productImageKey, ProductImages } from '../ui/basis';
import { SHOP_PRODUCTS } from '../daten/shopProducts';

const knopf: CSSProperties = { minHeight: '44px', padding: '0 14px', borderRadius: '12px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontFamily: 'inherit', whiteSpace: 'nowrap' };

/** Produkte ohne Foto (Name oder eine andere Schreibweise hat kein Bild); „Sonstiges“ zählt nicht */
export function ohneFoto(images: ProductImages): { name: string; group: string }[] {
  return SHOP_PRODUCTS
    .filter((p) => p.group !== 'Sonstiges')
    .filter((p) => ![p.name, ...(p.aliases || [])].some((n) => images[productImageKey(n)]))
    .map((p) => ({ name: p.name, group: p.group }))
    .sort((a, b) => a.group.localeCompare(b.group, 'de') || a.name.localeCompare(b.name, 'de'));
}

export function FehlendeFotos({ images, onUpload }: { images: ProductImages; onUpload?: (name: string, file: File) => Promise<string> }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const liste = ohneFoto(images);
  const hochladen = async (name: string, file?: File | null) => {
    if (!file || !onUpload) return;
    setBusy(name); setMsg('');
    setMsg(await onUpload(name, file));
    setBusy('');
  };
  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '30px', lineHeight: 1.1 }}>Produkte ohne Foto</h2>
        <div style={{ fontSize: '17px', color: TH.muted, marginTop: '4px' }}>{liste.length ? `${liste.length} ${liste.length === 1 ? 'Produkt hat' : 'Produkte haben'} noch kein Foto. Am Handy kannst du direkt ein Foto machen.` : 'Alle Produkte haben ein Foto.'}</div>
      </div>
      {msg && <div style={{ fontSize: '16px', fontWeight: 700, color: /nicht|kein/i.test(msg) ? TH.red : TH.green }}>{msg}</div>}
      {liste.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '460px', overflowY: 'auto' }}>
          {liste.map((p) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '12px', backgroundColor: TH.cream }}>
              <span style={{ flex: 1, minWidth: 0 }}><strong style={{ fontSize: '16px' }}>{p.name}</strong><span style={{ display: 'block', fontSize: '14px', color: TH.muted }}>{p.group}</span></span>
              <label style={{ ...knopf, cursor: busy ? 'wait' : 'pointer', opacity: onUpload ? 1 : 0.5 }}>
                {busy === p.name ? 'Lädt …' : 'Foto hinzufügen'}
                <input type="file" accept="image/*" disabled={!!busy || !onUpload} aria-label={`Foto für ${p.name}`} onChange={(e) => { hochladen(p.name, e.target.files && e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
