// ═══ Version 251: Sprach-Suche (Mikrofon) ═══
// Nutzt die Spracherkennung des Handys (Chrome/Android, Safari/iPhone). Wo es sie nicht gibt, erscheint kein Knopf.
// Es wird nichts gespeichert, das Handy wandelt nur das Gesprochene in Text um.
import { useState, useRef, useEffect } from 'react';
import { TH } from './basis';
import { dc } from '../daten/data';

const Erkennung = (): any => (typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null);
export const kannSprechen = () => !!Erkennung();

export function SprachKnopf({ onText, gross }: { onText: (text: string) => void; gross?: boolean }) {
  const [hoert, setHoert] = useState(false);
  const [fehler, setFehler] = useState('');
  const ref = useRef<any>(null);
  useEffect(() => () => { try { ref.current && ref.current.abort(); } catch { /* egal */ } }, []);
  if (!kannSprechen()) return null;
  const start = () => {
    if (hoert) { try { ref.current && ref.current.stop(); } catch { /* egal */ } return; }
    const E = Erkennung(); if (!E) return;
    const r = new E();
    r.lang = 'de-DE'; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: any) => { const t = e.results && e.results[0] && e.results[0][0] ? String(e.results[0][0].transcript || '') : ''; if (t.trim()) onText(t.trim().replace(/[.?!]$/, '')); };
    r.onerror = (e: any) => { setFehler(e && e.error === 'not-allowed' ? 'Mikrofon nicht erlaubt' : 'Nicht verstanden'); window.setTimeout(() => setFehler(''), 2500); };
    r.onend = () => setHoert(false);
    ref.current = r; setFehler('');
    try { r.start(); setHoert(true); } catch { setHoert(false); }
  };
  const s = gross ? 52 : 46;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flex: '0 0 auto' }}>
      <button type="button" className={'lt-sprach-knopf' + (hoert ? ' lt-hoert' : '')} onClick={start} aria-label={hoert ? 'Zuhören beenden' : 'Mit Sprache suchen'} title={hoert ? 'Ich höre zu …' : 'Mit Sprache suchen'}
        style={{ width: s, height: s, borderRadius: '50%', border: 'none', backgroundColor: hoert ? dc('#E5301C') : TH.yellow, color: hoert ? '#FFFFFF' : TH.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: hoert ? '0 0 0 6px rgba(229,48,28,.25)' : 'none', transition: 'box-shadow .2s' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
      </button>
      {fehler && <span role="status" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 700, color: TH.red }}>{fehler}</span>}
    </span>
  );
}
