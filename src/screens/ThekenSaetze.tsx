// ═══ Version 256: Gute Sätze für die Theke (Nachschlagen) ═══
// Formulierungen zum Nachlesen und Vorlesen lassen. Inhalt in daten/thekenSaetze.ts.
import { useState } from 'react';
import { TH, cardStyle, PageHead } from '../ui/basis';
import { dc } from '../daten/data';
import { SpeakButton } from '../games/spielBasis';
import { THEKEN_SAETZE } from '../daten/thekenSaetze';

export function ThekenSaetzeSeite({ onBack }: { onBack: () => void }) {
  const [offen, setOffen] = useState<string>(THEKEN_SAETZE[0].gruppe);
  return (
    <div className="lt-themed lt-theken-saetze" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', color: TH.ink, textAlign: 'left' }}>
      <PageHead title="Gute Sätze für die Theke" subtitle="So klingt ein gutes Verkaufsgespräch. Tippe auf eine Gruppe, mit Vorlesen hörst du, wie es klingt." onBack={onBack} backLabel="Zurück zu Nachschlagen" />
      {THEKEN_SAETZE.map((g) => {
        const auf = offen === g.gruppe;
        return (
          <section key={g.gruppe} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <button type="button" onClick={() => setOffen(auf ? '' : g.gruppe)} aria-expanded={auf} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '60px', padding: '14px 20px', border: 'none', background: 'transparent', color: TH.ink, textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ flex: 1, fontFamily: TH.serif, fontSize: '24px', lineHeight: 1.1 }}>{g.gruppe}</span>
              <span style={{ fontSize: '15px', color: TH.muted }}>{g.saetze.length} Sätze</span>
              <span aria-hidden="true" style={{ fontSize: '18px' }}>{auf ? '▴' : '▾'}</span>
            </button>
            {auf && (
              <div style={{ padding: '0 20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TH.brown }}>Tipp: {g.tipp}</div>
                {g.saetze.map((s) => (
                  <div key={s} className="lt-satz" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '14px', backgroundColor: dc('#FFF8EA'), border: `2px solid ${TH.line}` }}>
                    <span style={{ flex: 1, fontSize: '18px', lineHeight: 1.4 }}>„{s}“</span>
                    <SpeakButton small text={s} label="Vorlesen" />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
