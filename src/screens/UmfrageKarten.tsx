// ═══ Startseite: offene Team-Umfragen ═══
// Antippen = abstimmen. Danach sieht man das Ergebnis. Beendete Umfragen verschwinden.
import { dc } from '../daten/data';
import { LT } from '../basis/marke';
import { CloudPayload } from '../types';
import { alleUmfragen, stimmen, meineStimme, abstimmen } from '../hilfen/team';

export function UmfrageKarten({ cloudData, username, mutateCloudData }: { cloudData: CloudPayload; username: string; mutateCloudData: (updater: (curr: CloudPayload) => CloudPayload) => void }) {
  const me = (username || '').toLowerCase();
  const offen = alleUmfragen(cloudData.progress).filter((u) => u.offen);
  if (!me || !offen.length) return null;
  return (
    <>
      {offen.map((u) => {
        const meine = meineStimme(cloudData.progress, me, u.id);
        const st = stimmen(cloudData.progress, u);
        return (
          <section key={u.id} aria-label="Umfrage" style={{ padding: '22px', borderRadius: '24px', backgroundColor: dc('#FFFFFF'), boxShadow: '0 1px 2px rgba(31,20,12,.05), 0 10px 24px -16px rgba(31,20,12,.4)', display: 'flex', flexDirection: 'column', gap: '12px', color: LT.ink }}>
            <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: LT.muted }}>Umfrage vom Ausbilder{u.anonym ? ' · anonym' : ''}</span>
            <span style={{ fontFamily: LT.serif, fontSize: '28px', lineHeight: 1.15 }}>{u.frage}</span>
            {meine === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {u.optionen.map((o, i) => (
                  <button key={i} type="button" onClick={() => mutateCloudData(abstimmen(me, username, u.id, i))}
                    style={{ minHeight: '54px', padding: '0 18px', borderRadius: '16px', border: `2px solid ${LT.line}`, backgroundColor: LT.cream, color: LT.ink, fontSize: '18px', fontWeight: 700, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>{o}</button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {u.optionen.map((o, i) => {
                  const pct = st.gesamt ? Math.round((st.anzahl[i] / st.gesamt) * 100) : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '17px', fontWeight: i === meine ? 800 : 500 }}><span>{o}{i === meine ? ' (deine Wahl)' : ''}</span><span>{pct} %</span></div>
                      <div style={{ height: '10px', borderRadius: '999px', backgroundColor: LT.line, overflow: 'hidden', marginTop: '4px' }}><div style={{ width: `${pct}%`, height: '100%', backgroundColor: i === meine ? LT.brown : LT.yellow }} /></div>
                    </div>
                  );
                })}
                <span style={{ fontSize: '15px', color: LT.muted }}>Danke für deine Stimme! {st.gesamt} {st.gesamt === 1 ? 'Stimme' : 'Stimmen'} bisher.</span>
                <button type="button" onClick={() => mutateCloudData((curr) => { const pr: any = curr.progress[me]; if (pr && pr._stimmen) { const n = { ...pr._stimmen }; delete n[u.id]; pr._stimmen = n; } return curr; })}
                  style={{ alignSelf: 'flex-start', minHeight: '40px', padding: '0 12px', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: LT.muted, fontSize: '15px', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}>Stimme ändern</button>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
