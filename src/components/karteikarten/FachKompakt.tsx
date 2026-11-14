// ═══ Karteikarten: Fachwissen kompakt ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { dc } from '../../daten/data';
import { LtIcon, ICON } from '../../basis/symbole';

const FACH_ICON: Record<string, string[]> = { geschmack: ICON.drop, sonderverkauf: ICON.swap, begriffe: ICON.book, frische: ICON.bread, mehl: ICON.leaf, sauerteig: ICON.basket, schnitt: ICON.knife, gutzuwissen: ICON.bulb, geschichte: ICON.calendar, geschaefte: ICON.home, mitarbeiter: ICON.checklist };
import { FachSection } from './daten';

export type FachKompaktProps = {
  searchQuery: string;
  fachTerm: string;
  filteredFach: FachSection[];
};

export function FachKompakt({ searchQuery, fachTerm, filteredFach }: FachKompaktProps) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
      {filteredFach.length === 0 && (
        <div style={{ backgroundColor: dc('#FFFFFF'), border: `2px solid ${dc('#F1E3C8')}`, borderRadius: "18px", padding: "24px", fontSize: "18px", color: dc('#6B4A30'), textAlign: "center" }}>
          Nichts gefunden zu „{searchQuery}“.
        </div>
      )}
      {filteredFach.map((sec, si) => (
        <section key={sec.id} className="fc-item" style={{ animationDelay: `${Math.min(si, 8) * 0.05}s`, backgroundColor: dc('#FFFFFF'), border: `2px solid ${dc('#F1E3C8')}`, borderRadius: "20px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Fredoka', Georgia, serif", fontWeight: 400, fontSize: "28px", color: dc('#2B170A') }}>
            <span style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: dc('#FFF0C2'), display: "inline-flex", alignItems: "center", justifyContent: "center", color: dc('#4B2A14'), flexShrink: 0 }}><LtIcon paths={FACH_ICON[sec.id] || ICON.book} size={24} /></span>
            {sec.title}
          </h3>
          {sec.intro && <p style={{ margin: 0, fontSize: "17px", color: dc('#6B4A30') }}>{sec.intro}</p>}
          {sec.items.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sec.items.map((it, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "baseline", backgroundColor: dc('#FFFBF2'), border: `1px solid ${dc('#F1E3C8')}`, borderRadius: "12px", padding: "10px 14px", flexWrap: "wrap" }}>
                  {it.term && <strong style={{ fontSize: "17px", color: dc('#4B2A14'), minWidth: "130px" }}>{it.term}</strong>}
                  <span style={{ fontSize: "17px", lineHeight: 1.45, color: dc('#2B170A'), flex: "1 1 220px" }}>{it.text}</span>
                </div>
              ))}
            </div>
          )}
          {sec.columns && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
              {sec.columns.map((col) => (
                <div key={col.title} style={{ borderRadius: "14px", border: `2px solid ${dc('#F1E3C8')}`, overflow: "hidden" }}>
                  <div style={{ backgroundColor: dc('#FFC72C'), color: dc('#2B170A'), fontWeight: 800, fontSize: "17px", padding: "8px 12px" }}>{col.title}</div>
                  <ul style={{ margin: 0, padding: "8px 10px 10px 24px", fontSize: "16px", lineHeight: 1.6, color: dc('#2B170A'), overflowWrap: "anywhere" }}>
                    {col.breads.map((b) => {
                      const hit = !!fachTerm && b.toLowerCase().includes(fachTerm);
                      return <li key={b} style={hit ? { fontWeight: 800, backgroundColor: dc('#FFF0C2') } : undefined}>{b}</li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
      <p style={{ margin: "4px 0 0", fontSize: "15px", color: dc('#6B4A30'), textAlign: "center" }}>Quelle: Verkaufsmappe Bäckerei Hinkel</p>
    </div>
  );
}
