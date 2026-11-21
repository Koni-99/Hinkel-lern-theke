// Ausbildungsplan der Azubis (vorher in ui/ausbildung.tsx)
export type PlanItem = { id: string; text: string; lehrgang?: boolean };

export const AUSBILDUNGSPLAN: { jahr: 1 | 2 | 3; title: string; items: PlanItem[] }[] = [
  { jahr: 1, title: '1. Lehrjahr: Ankommen und Grundlagen', items: [
    { id: 'j1_betrieb', text: 'Betrieb kennenlernen: Geschäfte, Backstube, Ansprechpartner' },
    { id: 'j1_hygiene', text: 'Hygieneregeln, Gesundheitsbelehrung und Arbeitsschutz' },
    { id: 'j1_kleidung', text: 'Arbeitskleidung und gepflegtes Erscheinungsbild' },
    { id: 'j1_ware', text: 'Ware annehmen, kontrollieren und richtig lagern' },
    { id: 'j1_brote', text: 'Unsere Brotsorten, Mehlarten und Geschmacksrichtungen kennen' },
    { id: 'j1_schneiden', text: 'Brot schneiden: Schnittstärken und sicherer Umgang mit der Maschine' },
    { id: 'j1_theke', text: 'Theke einräumen und Ware ansprechend präsentieren' },
    { id: 'j1_bedienen', text: 'Kunden begrüßen, bedienen und verabschieden' },
    { id: 'j1_kasse', text: 'Kassieren: Bargeld, Rückgeld und Kartenzahlung' },
    { id: 'j1_packen', text: 'Ware richtig einpacken' },
  ] },
  { jahr: 2, title: '2. Lehrjahr: Beraten und Verkaufen', items: [
    { id: 'j2_gespraech', text: 'Verkaufsgespräche führen und Kunden beraten' },
    { id: 'j2_allergene', text: 'Zutaten und Allergene sicher erklären' },
    { id: 'j2_zusatz', text: 'Zusatzverkauf und passende Empfehlungen' },
    { id: 'j2_alternativ', text: 'Alternativen anbieten, wenn etwas ausverkauft ist' },
    { id: 'j2_reklamation', text: 'Reklamationen freundlich bearbeiten' },
    { id: 'j2_snacks', text: 'Ware vorbereiten und Theke auffüllen' }, // Version 252: Hinkel verkauft keine belegten Sachen (id bleibt, damit Haken bleiben)
    { id: 'j2_feingebaeck', text: 'Feingebäck, Kuchen und Saisonware kennen und verkaufen' },
    { id: 'j2_bestellung', text: 'Vorbestellungen annehmen und richtig aufschreiben' },
    { id: 'j2_abrechnung', text: 'Kassenabrechnung am Tagesende' },
    { id: 'j2_zp', text: 'Zwischenprüfung vorbereiten' },
  ] },
  { jahr: 3, title: '3. Lehrjahr: Verantwortung übernehmen', items: [
    { id: 'j3_bestellen', text: 'Ware bestellen und den Bedarf planen' },
    { id: 'j3_kalkulation', text: 'Preise, Kalkulation und Grundpreise verstehen' },
    { id: 'j3_deko', text: 'Dekoration, Schaufenster und Saisonaktionen gestalten' },
    { id: 'j3_platten', text: 'Platten und Geschenkkörbe zusammenstellen' },
    { id: 'j3_recht', text: 'Lebensmittelrecht und Kennzeichnung' },
    { id: 'j3_qualitaet', text: 'Qualität sichern: Kühlkette, Haltbarkeit, Kontrollen' },
    { id: 'j3_einarbeiten', text: 'Neue Kolleginnen und Kollegen einarbeiten' },
    { id: 'j3_ap', text: 'Abschlussprüfung vorbereiten' },
  ] },
];

