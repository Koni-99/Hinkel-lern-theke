// ═══ Version 259: Was muss der Ausbilder erledigen? ═══
// Eine Liste aller offenen Sachen (Meldungen, Freigaben, Fragen, Bestätigungen …) für die rote Zahl am „Ausbilder“-Knopf,
// die Karte „Zu erledigen“ oben im Ausbilder-Bereich und die Meldung beim Öffnen der App, wenn etwas Neues dazukommt.
// Kundenstimmen haben keinen „erledigt“-Stand: neu = seit der Ausbilder den Reiter Rückmeldungen zuletzt geöffnet hat
// (progress/admin/_kstimmenGesehen).
import { CloudPayload } from '../types';
import { alleKundenfragen, alleTipps } from './kollegen';
import { alleIdeen, alleKundenstimmen } from './rueckmeldungen';
import { lobeZurFreigabe } from './team';
import { neueAntworten } from './nachrichten';
import { alleAzubiFragen } from './azubiExtras';
import { alleEigenenKarten } from './eigeneKarten';

export type AdminZiel = 'reports' | 'kollegen' | 'message' | 'settings' | 'oben' | 'ausbildung';
export type AdminAufgabe = { id: string; text: string; n: number; ziel: AdminZiel; keys: string[] };

const plural = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`;

export function adminAufgaben(progress: CloudPayload['progress'] | undefined, jetzt = Date.now()): AdminAufgabe[] {
  const pr: Record<string, any> = progress || {};
  const out: AdminAufgabe[] = [];
  const dazu = (id: string, n: number, text: string, ziel: AdminZiel, keys: string[]) => { if (n > 0) out.push({ id, n, text, ziel, keys }); };

  // Fehler-Meldungen zu Fragen/Spielen (bleiben offen, bis der Ausbilder sie erledigt)
  const meldungen = new Set<string>(); const mKeys: string[] = [];
  Object.entries(pr).forEach(([u, p]) => { const r = (p && p._reports) || {}; Object.entries(r).forEach(([qid, e]: [string, any]) => { if (!e) return; meldungen.add(qid); mKeys.push(`m_${u}_${qid}_${Number(e.ts) || 0}`); }); });
  dazu('meldungen', meldungen.size, plural(meldungen.size, 'Fehler-Meldung prüfen', 'Fehler-Meldungen prüfen'), 'reports', mKeys);

  const sprueche = Object.entries(pr).filter(([, p]) => p && p._spruch && p._spruch.status === 'pending');
  dazu('sprueche', sprueche.length, plural(sprueche.length, 'Spruch freigeben', 'Sprüche freigeben'), 'oben', sprueche.map(([k, p]) => `s_${k}_${p._spruch.ts || 0}`));

  const lobe = lobeZurFreigabe(progress);
  dazu('lob', lobe.length, plural(lobe.length, 'anonymes Lob freigeben', 'anonyme Lobe freigeben'), 'kollegen', lobe.map((l) => `l_${l.von}_${l.id}`));

  const kf = alleKundenfragen(progress).filter((f) => !f.a);
  dazu('kundenfragen', kf.length, plural(kf.length, 'Kundenfrage beantworten', 'Kundenfragen beantworten'), 'kollegen', kf.map((f) => `kf_${f.user}_${f.id}`));

  const tipps = alleTipps(progress, undefined, 'pending');
  dazu('tipps', tipps.length, plural(tipps.length, 'Verkaufstipp freigeben', 'Verkaufstipps freigeben'), 'kollegen', tipps.map((t) => `t_${t.user}_${t.id}`));

  const ideen = alleIdeen(progress).filter((i) => !i.a);
  dazu('ideen', ideen.length, plural(ideen.length, 'Idee beantworten', 'Ideen beantworten'), 'kollegen', ideen.map((i) => `i_${i.user}_${i.id}`));

  const gesehen = Number((pr.admin || {})._kstimmenGesehen) || 0;
  const ks = alleKundenstimmen(progress).filter((s) => (Number(s.ts) || 0) > gesehen);
  dazu('kundenstimmen', ks.length, plural(ks.length, 'neue Kundenstimme lesen', 'neue Kundenstimmen lesen'), 'kollegen', ks.map((s) => `ks_${s.user}_${s.id}`));

  const antw = neueAntworten(progress, 'admin');
  dazu('antworten', antw, plural(antw, 'neue Antwort auf deine Nachrichten', 'neue Antworten auf deine Nachrichten'), 'message', antw ? [`a_${antw}_${Number((pr.admin || {})._antwortenGesehen) || 0}`] : []);

  const azF = alleAzubiFragen(progress).filter((f) => !f.a);
  dazu('azubifragen', azF.length, plural(azF.length, 'Frage eines Azubis beantworten', 'Fragen von Azubis beantworten'), 'ausbildung', azF.map((f) => `af_${f.user}_${f.id}`));

  const planKeys: string[] = [];
  Object.entries(pr).forEach(([k, p]) => {
    if (k === 'admin' || !p || p._role !== 'azubi') return;
    Object.keys(p._azubiPlan || {}).forEach((id) => { if ((p._azubiPlan || {})[id] && !(p._azubiOk || {})[id] && /^j\d_/.test(id)) planKeys.push(`p_${k}_${id}`); });
  });
  dazu('plan', planKeys.length, plural(planKeys.length, 'Punkt im Ausbildungsplan bestätigen', 'Punkte im Ausbildungsplan bestätigen'), 'ausbildung', planKeys);

  const karten = alleEigenenKarten(progress).filter((x) => x.s === 'warte');
  dazu('karten', karten.length, plural(karten.length, 'Lernkarte eines Azubis bestätigen', 'Lernkarten von Azubis bestätigen'), 'ausbildung', karten.map((x) => `k_${x.user}_${x.id}`));

  const letzte = Number((pr.admin || {})._letzteSicherung) || 0;
  const tage = letzte ? Math.floor((jetzt - letzte) / 86400000) : -1;
  if (tage < 0 || tage >= 7) out.push({ id: 'sicherung', n: 1, text: tage < 0 ? 'Daten sichern (noch nie gesichert)' : `Daten sichern (letzte Sicherung vor ${tage} Tagen)`, ziel: 'oben', keys: [] });

  return out;
}

/** Gesamtzahl für die rote Zahl am Knopf */
export const adminOffen = (liste: AdminAufgabe[]) => liste.reduce((s, a) => s + a.n, 0);

/** Kurzer Text für die Meldung: „2 Fehler-Meldungen prüfen, 1 anonymes Lob freigeben“ */
export const aufgabenText = (liste: AdminAufgabe[]) => liste.map((a) => a.text).join(', ');
