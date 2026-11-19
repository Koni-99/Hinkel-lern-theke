// ═══ Version 250: falsch gewählte Antworten anzeigen (Ausbilder) ═══
import { TH } from '../ui/basis';
import { dc } from '../daten/data';

export function FalschGewaehlt({ liste, nameOf }: { liste: { text: string; n: number; wer: string[] }[]; nameOf?: (userKey: string) => string }) {
  if (!liste.length) return null;
  return (
    <div className="lt-falsch-gewaehlt" style={{ color: TH.red, display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span>Falsch gewählt:</span>
      {liste.slice(0, 4).map((e) => (
        <span key={e.text} style={{ paddingLeft: '10px', borderLeft: `3px solid ${dc('#F2B8AE')}` }}>
          <strong>{e.text}</strong> ({e.n}×{nameOf && e.wer.length ? `: ${e.wer.map(nameOf).join(', ')}` : ''})
        </span>
      ))}
    </div>
  );
}
