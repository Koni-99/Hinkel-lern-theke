// ═══ Ausbilder-Bereich: Produktliste aus Excel übernehmen ═══
// Die Shop-Produktliste hochladen, auswählen welche Angaben übernommen werden, Änderungen prüfen, übernehmen.
// Logik in hilfen/produktImport.ts. Die Excel-Bausteine werden erst geladen, wenn sie gebraucht werden.
import { useState, useMemo, CSSProperties } from 'react';
import { dc } from '../daten/data';
import { TH, cardStyle, btnPrimary } from '../ui/basis';
import { CloudPayload } from '../types';
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { vergleichen, IMPORT_FELDER, ImportFeld } from '../hilfen/produktImport';

const knopf: CSSProperties = { minHeight: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${TH.line}`, backgroundColor: TH.white, color: TH.ink, fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontFamily: 'inherit' };
const kurz = (t: string, n = 140) => (t.length > n ? t.slice(0, n) + ' …' : t);

export function ProduktImport({ mutateCloudData }: { mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void }) {
  const [blaetter, setBlaetter] = useState<{ data: unknown[][] }[] | null>(null);
  const [datei, setDatei] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [felder, setFelder] = useState<ImportFeld[]>(['preis', 'allergene', 'zutaten']);
  const [aus, setAus] = useState<Set<string>>(new Set()); // abgewählte Änderungen (Produkt|Feld)
  const [stand, setStand] = useState(0); // nach dem Übernehmen neu vergleichen

  const vergleich = useMemo(() => (blaetter ? vergleichen(blaetter, SHOP_PRODUCTS, felder) : null), [blaetter, felder, stand]);
  const proProdukt = useMemo(() => {
    const m = new Map<string, NonNullable<typeof vergleich>['aenderungen']>();
    (vergleich?.aenderungen || []).forEach((a) => m.set(a.produkt, [...(m.get(a.produkt) || []), a]));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'de'));
  }, [vergleich]);
  const gewaehlt = (vergleich?.aenderungen || []).filter((a) => !aus.has(`${a.produkt}|${a.feld}`));

  const lesen = async (file?: File | null) => {
    if (!file) return;
    setBusy(true); setMsg(''); setBlaetter(null); setAus(new Set()); setDatei(file.name);
    try {
      if (!/\.xlsx$/i.test(file.name)) throw new Error('kein xlsx');
      const { default: readXlsxFile } = await import('read-excel-file/browser');
      const sheets = (await readXlsxFile(file)) as unknown as { sheet: string; data: unknown[][] }[];
      const ok = sheets.some((s) => s.data.some((r) => Array.isArray(r) && r.some((c) => /^produktname$|^produkt$/i.test(String(c ?? '').trim()))));
      if (!ok) { setMsg('In der Datei wurde keine Spalte „Produktname“ gefunden. Bitte die Produktliste aus dem Shop nehmen.'); return; }
      setBlaetter(sheets);
    } catch {
      setMsg('Die Datei konnte nicht gelesen werden. Bitte eine Excel-Datei (.xlsx) wählen.');
    } finally { setBusy(false); }
  };

  const umschalten = (f: ImportFeld) => setFelder((v) => (v.includes(f) ? v.filter((x) => x !== f) : [...v, f]));
  const aenderungUmschalten = (k: string) => setAus((v) => { const n = new Set(v); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const uebernehmen = () => {
    if (!gewaehlt.length) return;
    const proName: Record<string, Record<string, unknown>> = {};
    gewaehlt.forEach((a) => { proName[a.produkt] = { ...(proName[a.produkt] || {}), ...a.wert }; });
    mutateCloudData((curr) => {
      const fixes = { ...(curr.productFixes || {}) };
      Object.keys(proName).forEach((name) => {
        const alt = fixes[name] && !fixes[name].restored ? fixes[name] : {};
        fixes[name] = { ...alt, ...proName[name], ts: Date.now() } as any;
      });
      curr.productFixes = fixes;
      return curr;
    });
    setMsg(`${gewaehlt.length} ${gewaehlt.length === 1 ? 'Änderung' : 'Änderungen'} bei ${Object.keys(proName).length} ${Object.keys(proName).length === 1 ? 'Produkt' : 'Produkten'} übernommen. Sie gelten ab sofort in Steckbriefen, Quiz und Spielen. Zurücknehmen geht pro Produkt unter Meldungen → „Produktdaten korrigieren“ → Original.`);
    setAus(new Set());
    window.setTimeout(() => setStand((n) => n + 1), 300);
  };

  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: TH.serif, fontWeight: 400, fontSize: '30px', lineHeight: 1.1 }}>Produktliste aus Excel übernehmen</h2>
        <div style={{ fontSize: '17px', color: TH.muted, marginTop: '4px' }}>Die Produktliste aus dem Shop hochladen. Du wählst, welche Angaben übernommen werden, und siehst vorher jede Änderung.</div>
      </div>
      <label style={{ ...knopf, alignSelf: 'flex-start', cursor: busy ? 'wait' : 'pointer' }}>
        {busy ? 'Lese Datei …' : 'Excel-Datei wählen'}
        <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" aria-label="Excel-Datei mit der Produktliste" onChange={(e) => { lesen(e.target.files && e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
      </label>
      {msg && <div style={{ fontSize: '16px', fontWeight: 700, color: /nicht|keine/.test(msg) ? TH.red : TH.green }}>{msg}</div>}
      {vergleich && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', borderRadius: '16px', backgroundColor: TH.cream }}>
          <strong style={{ fontSize: '17px' }}>{datei}: {vergleich.gefunden} Produkte erkannt{vergleich.unbekannt.length ? `, ${vergleich.unbekannt.length} gibt es in der App nicht` : ''}.</strong>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Was soll übernommen werden?</div>
            <div role="group" aria-label="Angaben auswählen" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {IMPORT_FELDER.map((f) => {
                const da = vergleich.spalten.includes(f.id); const an = felder.includes(f.id) && da;
                return (
                  <button key={f.id} type="button" disabled={!da} aria-pressed={an} onClick={() => umschalten(f.id)} title={da ? '' : 'Diese Spalte fehlt in der Datei'}
                    style={{ minHeight: '44px', padding: '0 14px', borderRadius: '999px', border: an ? 'none' : `2px solid ${TH.line}`, backgroundColor: an ? TH.brown : dc('#FFFFFF'), color: an ? dc('#FFF6E0') : TH.ink, fontSize: '15px', fontWeight: 800, cursor: da ? 'pointer' : 'not-allowed', opacity: da ? 1 : 0.45, fontFamily: 'inherit' }}>
                    {an ? '✓ ' : ''}{f.label}
                  </button>
                );
              })}
            </div>
          </div>
          {proProdukt.length === 0 ? (
            <div style={{ fontSize: '16px', color: TH.green, fontWeight: 700 }}>{felder.length ? 'Keine Unterschiede: Die App stimmt bei den gewählten Angaben schon mit der Liste überein.' : 'Bitte oben mindestens eine Angabe auswählen.'}</div>
          ) : (
            <>
              <div style={{ fontSize: '15px', color: TH.muted }}>{vergleich.aenderungen.length} Unterschiede bei {proProdukt.length} Produkten. Haken weg = wird nicht übernommen.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                {proProdukt.map(([name, liste]) => (
                  <div key={name} style={{ padding: '10px 12px', borderRadius: '12px', backgroundColor: dc('#FFFFFF'), fontSize: '15px', lineHeight: 1.45 }}>
                    <strong style={{ fontSize: '16px' }}>{name}</strong>
                    {liste.map((a) => {
                      const k = `${a.produkt}|${a.feld}`; const an = !aus.has(k);
                      return (
                        <label key={k} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '6px', cursor: 'pointer', opacity: an ? 1 : 0.5 }}>
                          <input type="checkbox" checked={an} onChange={() => aenderungUmschalten(k)} style={{ width: '22px', height: '22px', marginTop: '2px', flex: '0 0 auto' }} />
                          <span style={{ minWidth: 0 }}>
                            <span style={{ fontWeight: 700 }}>{IMPORT_FELDER.find((f) => f.id === a.feld)?.label}: </span>
                            <span style={{ color: TH.muted, textDecoration: 'line-through' }}>{kurz(a.alt)}</span>{' → '}
                            <span style={{ color: TH.green, fontWeight: 700 }}>{kurz(a.neu)}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" onClick={uebernehmen} disabled={!gewaehlt.length} style={{ ...btnPrimary, opacity: gewaehlt.length ? 1 : 0.5 }}>{gewaehlt.length} {gewaehlt.length === 1 ? 'Änderung' : 'Änderungen'} übernehmen</button>
                <button type="button" onClick={() => { setBlaetter(null); setDatei(''); setMsg(''); }} style={knopf}>Abbrechen</button>
              </div>
            </>
          )}
          {vergleich.unbekannt.length > 0 && (
            <details style={{ fontSize: '15px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Nicht in der App ({vergleich.unbekannt.length})</summary>
              <div style={{ color: TH.muted, marginTop: '6px', lineHeight: 1.5 }}>{vergleich.unbekannt.join(', ')}. Neue Produkte legst du oben unter „Neues Produkt ins Sortiment“ an.</div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
