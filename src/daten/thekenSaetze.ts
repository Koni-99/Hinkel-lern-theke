// ═══ Version 256: Gute Sätze für die Theke ═══
// Formulierungen für Beratung, Reklamation, Zusatzverkauf und mehr. Nur eigene Backwaren (keine Getränke, keine Torten, nichts Belegtes).
export const THEKEN_SAETZE: { gruppe: string; tipp: string; saetze: string[] }[] = [
  { gruppe: 'Begrüßen', tipp: 'Blickkontakt, lächeln, Tageszeit beachten.', saetze: [
    'Guten Morgen! Was darf es sein?',
    'Hallo, schön, dass Sie da sind. Was hätten Sie gern?',
    'Einen Moment bitte, ich bin gleich für Sie da.',
    'Danke fürs Warten, was darf ich Ihnen geben?',
  ] },
  { gruppe: 'Beraten', tipp: 'Offene Fragen stellen, dann gezielt empfehlen.', saetze: [
    'Wofür soll das Brot sein, eher zum Frühstück oder zum Abendbrot?',
    'Mögen Sie es lieber kräftig oder eher mild?',
    'Das Münsterländer ist mild und saftig, das schmeckt fast jedem.',
    'Wenn Sie es lange frisch haben möchten, nehmen Sie ein Roggenbrot mit Sauerteig.',
    'Darf ich Ihnen das kurz zum Probieren geben?',
  ] },
  { gruppe: 'Allergien und Zutaten', tipp: 'Nie raten. Immer im Steckbrief oder in der Allergenliste nachsehen.', saetze: [
    'Einen Moment, ich schaue für Sie in der Zutatenliste nach.',
    'Da ist leider Sesam drin. Ich kann Ihnen stattdessen das hier empfehlen.',
    'Spuren von Nüssen kann ich bei uns leider nie ganz ausschließen, weil wir in der Backstube auch mit Nüssen arbeiten.',
    'Ganz ohne Gluten haben wir leider nichts. Dinkel enthält auch Gluten.',
  ] },
  { gruppe: 'Zusatzverkauf', tipp: 'Passend und freundlich anbieten, nie aufdrängen.', saetze: [
    'Darf es dazu noch ein paar Brötchen für morgen früh sein?',
    'Zum Kaffee am Nachmittag passt unser Butterkuchen sehr gut.',
    'Heute ganz frisch: unsere Laugenbrezeln, noch warm.',
    'Möchten Sie noch etwas Süßes für unterwegs?',
  ] },
  { gruppe: 'Ausverkauft', tipp: 'Bedauern zeigen und eine ähnliche Alternative anbieten.', saetze: [
    'Das ist leider schon aus. Ganz ähnlich ist das hier, möchten Sie das probieren?',
    'Das backen wir nur dienstags und donnerstags. Soll ich Ihnen eins zurücklegen?',
    'Für morgen kann ich Ihnen gern eins bestellen.',
  ] },
  { gruppe: 'Reklamation', tipp: 'Ruhig bleiben, zuhören, entschuldigen, Lösung anbieten.', saetze: [
    'Das tut mir leid. Danke, dass Sie es uns sagen.',
    'Was genau war denn nicht in Ordnung?',
    'Ich gebe Ihnen gern ein neues, oder möchten Sie lieber das Geld zurück?',
    'Ich gebe das an die Backstube weiter, damit es nicht wieder passiert.',
  ] },
  { gruppe: 'Kassieren', tipp: 'Betrag laut nennen, Rückgeld vorzählen.', saetze: [
    'Das macht zusammen 6,40 Euro, bitte.',
    'Sie haben mir 10 Euro gegeben, 3,60 Euro zurück.',
    'Mit Karte? Gern, einfach hier dranhalten.',
    'Möchten Sie den Bon?',
  ] },
  { gruppe: 'Schwierige Situationen', tipp: 'Freundlich, aber klar bleiben.', saetze: [
    'Ich verstehe, dass Sie es eilig haben. Ich beeile mich.',
    'Entschuldigung, die Dame war zuerst dran. Sie sind gleich danach.',
    'Den Preis kann ich leider nicht ändern. Ich zeige Ihnen aber gern etwas Günstigeres.',
  ] },
  { gruppe: 'Verabschieden', tipp: 'Danke sagen und einen schönen Tag wünschen.', saetze: [
    'Vielen Dank und einen schönen Tag noch!',
    'Lassen Sie es sich schmecken, bis zum nächsten Mal!',
    'Schönes Wochenende!',
  ] },
];
