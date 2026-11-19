// ═══ Version 254: Berufsschul-Lernkarten (Fachbegriffe für Azubis im Bäckerei-Verkauf) ═══
// Begriff vorne, Erklärung hinten. Kurz und einfach, so wie man es in der Prüfung sagen würde.
// Die id bleibt fest (Lernkasten merkt sich Karten über die id).

export type BegriffKarte = { id: string; fach: string; begriff: string; erklaerung: string };

export const BS_FAECHER = ['Warenkunde', 'Verkauf und Beratung', 'Hygiene und Recht', 'Rechnen und Wirtschaft', 'Arbeit und Ausbildung'] as const;

export const BERUFSSCHUL_KARTEN: BegriffKarte[] = [
  // Warenkunde
  { id: 'w1', fach: 'Warenkunde', begriff: 'Mehltype', erklaerung: 'Die Typenzahl sagt, wie viel Mineralstoffe (Asche) im Mehl sind: Milligramm pro 100 g Mehl. Hohe Type = dunkleres Mehl mit mehr Schale, z. B. Weizenmehl Type 550 ist hell, Type 1050 dunkler.' },
  { id: 'w2', fach: 'Warenkunde', begriff: 'Vollkorn', erklaerung: 'Vollkornmehl oder Vollkornschrot enthält alle Teile des Korns: Mehlkörper, Keimling und Schale. Ein Vollkornbrot muss zu mindestens 90 % aus Vollkornerzeugnissen bestehen.' },
  { id: 'w3', fach: 'Warenkunde', begriff: 'Schrot', erklaerung: 'Grob zerkleinertes Getreide. Vollkornschrot enthält das ganze Korn, nur gröber als Mehl.' },
  { id: 'w4', fach: 'Warenkunde', begriff: 'Aufbau des Getreidekorns', erklaerung: 'Drei Teile: Mehlkörper (Stärke und Eiweiß), Keimling (Fett, Vitamine) und Schale mit Aleuronschicht (Ballaststoffe, Mineralstoffe).' },
  { id: 'w5', fach: 'Warenkunde', begriff: 'Kleber (Gluten)', erklaerung: 'Eiweiß im Weizen (auch Dinkel, Roggen, Gerste). Mit Wasser bildet es ein dehnbares Netz, das das Gas im Teig festhält. Wichtig für Allergiker: Gluten ist ein Hauptallergen.' },
  { id: 'w6', fach: 'Warenkunde', begriff: 'Sauerteig', erklaerung: 'Teig, der mit Milchsäurebakterien und Hefen gärt. Er macht Roggenbrot backfähig, gibt Geschmack und hält das Brot länger frisch.' },
  { id: 'w7', fach: 'Warenkunde', begriff: 'Warum braucht Roggen Sauerteig?', erklaerung: 'Roggen bildet kaum Kleber. Die Säure hemmt Enzyme, die sonst die Stärke abbauen würden. Ohne Säure würde die Krume klebrig und nass.' },
  { id: 'w8', fach: 'Warenkunde', begriff: 'Hefe', erklaerung: 'Kleiner Pilz, der Zucker in Kohlendioxid und Alkohol umwandelt (Gärung). Das Gas lockert den Teig. Beim Backen stirbt die Hefe ab, der Alkohol verdampft.' },
  { id: 'w9', fach: 'Warenkunde', begriff: 'Teiglockerung', erklaerung: 'Biologisch (Hefe, Sauerteig), chemisch (Backpulver, Hirschhornsalz, Pottasche) und physikalisch (eingeschlagene Luft, Wasserdampf, z. B. bei Blätterteig und Brandmasse).' },
  { id: 'w10', fach: 'Warenkunde', begriff: 'Hirschhornsalz und Pottasche', erklaerung: 'Chemische Lockerungsmittel für flache Gebäcke wie Printen und Lebkuchen. Hirschhornsalz (ABC-Trieb) nur für flache Gebäcke, weil sonst Ammoniak im Gebäck bleibt.' },
  { id: 'w11', fach: 'Warenkunde', begriff: 'Bräunung der Kruste', erklaerung: 'Beim Backen reagieren Zucker und Eiweiß miteinander (Maillard-Reaktion) und Zucker karamellisiert. Das gibt Farbe und Duft.' },
  { id: 'w12', fach: 'Warenkunde', begriff: 'Blätterteig', erklaerung: 'Teig aus Mehl und Wasser, mit Fett in vielen Lagen tourniert. Ohne Hefe: Er geht durch den Wasserdampf zwischen den Fettschichten auf.' },
  { id: 'w13', fach: 'Warenkunde', begriff: 'Plunderteig', erklaerung: 'Hefeteig, in den Fett eingezogen (tourniert) wird. Er ist locker und blättrig, z. B. für Croissants und Plunderteilchen.' },
  { id: 'w14', fach: 'Warenkunde', begriff: 'Mürbeteig (1-2-3)', erklaerung: 'Klassisch 1 Teil Zucker, 2 Teile Fett, 3 Teile Mehl. Er wird nicht lange geknetet, sonst wird er zäh („brandig“).' },
  { id: 'w15', fach: 'Warenkunde', begriff: 'Brandmasse', erklaerung: 'Masse aus Wasser, Fett, Mehl und Eiern. Das Mehl wird im Topf „abgeröstet“. Lockerung durch Wasserdampf, z. B. für Windbeutel und Eclairs.' },
  { id: 'w16', fach: 'Warenkunde', begriff: 'Biskuitmasse', erklaerung: 'Masse aus Eiern, Zucker und Mehl. Gelockert durch eingeschlagene Luft beim Aufschlagen.' },
  { id: 'w17', fach: 'Warenkunde', begriff: 'Kuvertüre', erklaerung: 'Echte Schokoladenüberzugsmasse mit Kakaobutter. Muss temperiert werden, damit sie glänzt und knackt.' },
  { id: 'w18', fach: 'Warenkunde', begriff: 'Kakaohaltige Fettglasur', erklaerung: 'Überzug, bei dem die Kakaobutter durch anderes Fett ersetzt ist. Einfacher zu verarbeiten, darf aber nicht „Schokolade“ heißen.' },
  { id: 'w19', fach: 'Warenkunde', begriff: 'Marzipan und Persipan', erklaerung: 'Marzipan wird aus Mandeln gemacht, Persipan aus Aprikosen- oder Pfirsichkernen. Persipan ist günstiger und muss so gekennzeichnet sein.' },
  { id: 'w20', fach: 'Warenkunde', begriff: 'Altbacken werden', erklaerung: 'Die Stärke im Brot gibt Wasser ab und wird wieder fest (Retrogradation). Darum Brot nicht im Kühlschrank lagern, da geht es am schnellsten.' },
  { id: 'w21', fach: 'Warenkunde', begriff: 'Roggenmischbrot / Weizenmischbrot', erklaerung: 'Roggenmischbrot: mehr als 50 % Roggen, weniger als 90 %. Weizenmischbrot: mehr als 50 % Weizen, weniger als 90 %.' },
  { id: 'w22', fach: 'Warenkunde', begriff: 'Dinkel', erklaerung: 'Alte Weizenart. Enthält Gluten und ist darum nicht für Menschen mit Zöliakie geeignet.' },
  // Verkauf und Beratung
  { id: 'v1', fach: 'Verkauf und Beratung', begriff: 'Offene Frage', erklaerung: 'Frage mit W-Wort, auf die der Kunde nicht nur ja oder nein sagen kann: „Wofür soll das Brot sein?“ Gut, um Wünsche herauszufinden.' },
  { id: 'v2', fach: 'Verkauf und Beratung', begriff: 'Geschlossene Frage', erklaerung: 'Frage, auf die der Kunde mit ja oder nein antwortet: „Darf es geschnitten sein?“ Gut, um etwas zu klären.' },
  { id: 'v3', fach: 'Verkauf und Beratung', begriff: 'Alternativfrage', erklaerung: 'Der Kunde wählt zwischen zwei Möglichkeiten: „Lieber das Kleine oder das Große?“ Hilft bei der Entscheidung.' },
  { id: 'v4', fach: 'Verkauf und Beratung', begriff: 'Zusatzverkauf', erklaerung: 'Dem Kunden passend etwas anbieten, das er noch nicht im Kopf hatte, z. B. zum Brot ein paar Brötchen für morgen. Immer freundlich, nie aufdrängen.' },
  { id: 'v5', fach: 'Verkauf und Beratung', begriff: 'Sie-Stil', erklaerung: 'Den Kunden in den Mittelpunkt stellen: „Sie bekommen hier …“ statt „Wir haben …“.' },
  { id: 'v6', fach: 'Verkauf und Beratung', begriff: 'Einwandbehandlung', erklaerung: 'Auf Bedenken des Kunden eingehen, statt zu widersprechen: zuhören, Verständnis zeigen, dann einen Vorteil nennen („Ja, das ist etwas teurer, dafür …“).' },
  { id: 'v7', fach: 'Verkauf und Beratung', begriff: 'Reklamation', erklaerung: 'Die Ware hat einen Mangel. Ruhig bleiben, zuhören, entschuldigen, eine Lösung anbieten (Ersatz oder Geld zurück).' },
  { id: 'v8', fach: 'Verkauf und Beratung', begriff: 'Umtausch', erklaerung: 'Die Ware ist in Ordnung, der Kunde möchte sie nur nicht mehr. Ein Umtausch ist freiwillig (Kulanz), keine Pflicht.' },
  { id: 'v9', fach: 'Verkauf und Beratung', begriff: 'Kaufmotive', erklaerung: 'Gründe, warum Kunden kaufen: Genuss, Gesundheit, Bequemlichkeit, Preis, Tradition, Geschenk.' },
  { id: 'v10', fach: 'Verkauf und Beratung', begriff: 'Warenpräsentation', erklaerung: 'Ware so zeigen, dass sie Lust macht: voll, ordentlich, sauber, mit Preisschild. In Augenhöhe verkauft sich am meisten.' },
  { id: 'v11', fach: 'Verkauf und Beratung', begriff: 'Durchschnittsbon', erklaerung: 'Umsatz geteilt durch die Zahl der Kunden. Zeigt, wie viel ein Kunde im Schnitt kauft. Zusatzverkauf erhöht ihn.' },
  // Hygiene und Recht
  { id: 'h1', fach: 'Hygiene und Recht', begriff: 'HACCP', erklaerung: 'Gefahrenanalyse und kritische Kontrollpunkte. Ein System, mit dem der Betrieb Gefahren für Lebensmittel erkennt, überwacht und dokumentiert.' },
  { id: 'h2', fach: 'Hygiene und Recht', begriff: 'Infektionsschutzgesetz (§ 43)', erklaerung: 'Vor der ersten Arbeit mit Lebensmitteln braucht man eine Belehrung vom Gesundheitsamt. Danach belehrt der Arbeitgeber regelmäßig (alle 2 Jahre).' },
  { id: 'h3', fach: 'Hygiene und Recht', begriff: 'Kreuzkontamination', erklaerung: 'Keime oder Allergene gehen von einem Lebensmittel auf ein anderes über, z. B. über Zange, Messer oder Hände.' },
  { id: 'h4', fach: 'Hygiene und Recht', begriff: 'Mindesthaltbarkeitsdatum (MHD)', erklaerung: 'Bis dahin behält das Lebensmittel seine Eigenschaften mindestens. Danach darf es noch verkauft werden, wenn es in Ordnung ist (Hinweis geben).' },
  { id: 'h5', fach: 'Hygiene und Recht', begriff: 'Verbrauchsdatum', erklaerung: '„Zu verbrauchen bis“: bei leicht verderblichen Lebensmitteln. Danach darf es nicht mehr verkauft werden.' },
  { id: 'h6', fach: 'Hygiene und Recht', begriff: '14 Hauptallergene', erklaerung: 'Glutenhaltiges Getreide, Krebstiere, Eier, Fisch, Erdnüsse, Soja, Milch, Schalenfrüchte, Sellerie, Senf, Sesam, Schwefeldioxid/Sulfite, Lupinen, Weichtiere. Sie müssen auch bei loser Ware angegeben werden.' },
  { id: 'h7', fach: 'Hygiene und Recht', begriff: 'LMIV', erklaerung: 'Lebensmittel-Informationsverordnung der EU. Regelt, was auf Lebensmitteln stehen muss, z. B. Zutaten und Allergene.' },
  { id: 'h8', fach: 'Hygiene und Recht', begriff: 'Lose Ware', erklaerung: 'Unverpackte Ware wie an der Theke. Allergene müssen trotzdem angegeben werden, z. B. auf einem Schild oder in einer Liste.' },
  { id: 'h9', fach: 'Hygiene und Recht', begriff: 'Fertigpackung', erklaerung: 'Ware, die ohne den Kunden verpackt wurde. Braucht Etikett mit Bezeichnung, Zutaten, Allergenen, Menge, MHD und Hersteller.' },
  { id: 'h10', fach: 'Hygiene und Recht', begriff: 'Kühlkette', erklaerung: 'Gekühlte Ware muss ohne Unterbrechung kühl bleiben, vom Hersteller bis zum Kunden. Temperatur regelmäßig kontrollieren und aufschreiben.' },
  { id: 'h11', fach: 'Hygiene und Recht', begriff: 'Personalhygiene', erklaerung: 'Saubere Arbeitskleidung, Haare zusammen und bedeckt, kein Schmuck an Händen und Armen, kurze saubere Nägel, oft Hände waschen.' },
  { id: 'h12', fach: 'Hygiene und Recht', begriff: 'Preisangabenverordnung', erklaerung: 'Preise müssen gut sichtbar und als Endpreis (mit Mehrwertsteuer) angegeben sein. Bei Ware nach Gewicht auch der Grundpreis, z. B. pro Kilo.' },
  { id: 'h13', fach: 'Hygiene und Recht', begriff: 'Grundpreis', erklaerung: 'Preis pro Kilogramm (oder 100 g, Liter). Damit kann der Kunde verschiedene Packungsgrößen vergleichen.' },
  // Rechnen und Wirtschaft
  { id: 'r1', fach: 'Rechnen und Wirtschaft', begriff: 'Mehrwertsteuer bei Backwaren', erklaerung: 'Zum Mitnehmen 7 %. Wer im Café vor Ort isst und trinkt, zahlt 19 %.' },
  { id: 'r2', fach: 'Rechnen und Wirtschaft', begriff: 'Brutto und Netto (Preis)', erklaerung: 'Brutto = mit Mehrwertsteuer (was der Kunde zahlt). Netto = ohne Steuer. Netto = Brutto : 1,07 (bei 7 %).' },
  { id: 'r3', fach: 'Rechnen und Wirtschaft', begriff: 'Dreisatz', erklaerung: 'Erst auf 1 rechnen, dann auf die gesuchte Menge. 6 Brötchen kosten 3,00 €, 1 kostet 0,50 €, also kosten 10 genau 5,00 €.' },
  { id: 'r4', fach: 'Rechnen und Wirtschaft', begriff: 'Prozentrechnung', erklaerung: 'Prozentwert = Grundwert × Prozentsatz : 100. 20 % von 5,00 € sind 1,00 €.' },
  { id: 'r5', fach: 'Rechnen und Wirtschaft', begriff: 'Umsatz', erklaerung: 'Alles, was in einer Zeit eingenommen wurde (Menge × Preis). Umsatz ist noch kein Gewinn.' },
  { id: 'r6', fach: 'Rechnen und Wirtschaft', begriff: 'Fixe und variable Kosten', erklaerung: 'Fixe Kosten bleiben gleich, egal wie viel verkauft wird (Miete, Gehälter). Variable Kosten steigen mit der Menge (Rohstoffe, Verpackung).' },
  { id: 'r7', fach: 'Rechnen und Wirtschaft', begriff: 'Kalkulation', erklaerung: 'So entsteht der Verkaufspreis: Wareneinsatz + Kosten (Gemeinkosten) = Selbstkosten. Plus Gewinn = Nettoverkaufspreis. Plus Mehrwertsteuer = Bruttoverkaufspreis.' },
  { id: 'r8', fach: 'Rechnen und Wirtschaft', begriff: 'Retourenquote', erklaerung: 'Wie viel Ware am Ende des Tages übrig bleibt, im Verhältnis zur gelieferten Ware. Zu viel Retoure kostet Geld, zu wenig heißt: Kunden fanden nichts mehr.' },
  { id: 'r9', fach: 'Rechnen und Wirtschaft', begriff: 'Inventur', erklaerung: 'Bestandsaufnahme: Alle Waren und Vorräte werden gezählt und aufgeschrieben, mindestens einmal im Jahr.' },
  { id: 'r10', fach: 'Rechnen und Wirtschaft', begriff: 'Kassenabrechnung', erklaerung: 'Am Tagesende: Bargeld zählen, mit dem Kassenbericht vergleichen, Differenzen klären und dokumentieren.' },
  // Arbeit und Ausbildung
  { id: 'a1', fach: 'Arbeit und Ausbildung', begriff: 'Probezeit in der Ausbildung', erklaerung: 'Mindestens 1 Monat, höchstens 4 Monate. In der Probezeit können beide ohne Grund und ohne Frist kündigen.' },
  { id: 'a2', fach: 'Arbeit und Ausbildung', begriff: 'Berichtsheft (Ausbildungsnachweis)', erklaerung: 'Darin steht, was du im Betrieb und in der Schule gelernt hast. Der Ausbilder zeichnet es ab. Ohne Berichtsheft keine Zulassung zur Abschlussprüfung.' },
  { id: 'a3', fach: 'Arbeit und Ausbildung', begriff: 'Jugendarbeitsschutzgesetz', erklaerung: 'Schützt Beschäftigte unter 18: z. B. höchstens 8 Stunden am Tag und 40 in der Woche, genug Pausen, Nachtruhe.' },
  { id: 'a4', fach: 'Arbeit und Ausbildung', begriff: 'Die fünf Sozialversicherungen', erklaerung: 'Kranken-, Pflege-, Renten-, Arbeitslosen- und Unfallversicherung. Die Unfallversicherung zahlt der Arbeitgeber allein.' },
  { id: 'a5', fach: 'Arbeit und Ausbildung', begriff: 'Berufsgenossenschaft (BGN)', erklaerung: 'Träger der Unfallversicherung für Bäckereien. Zuständig bei Arbeits- und Wegeunfällen.' },
  { id: 'a6', fach: 'Arbeit und Ausbildung', begriff: 'Brutto- und Nettolohn', erklaerung: 'Bruttolohn = vereinbarter Lohn. Davon gehen Steuern und Sozialversicherung ab. Was übrig bleibt und aufs Konto kommt, ist der Nettolohn.' },
  { id: 'a7', fach: 'Arbeit und Ausbildung', begriff: 'Duales System', erklaerung: 'Die Ausbildung findet an zwei Orten statt: im Betrieb (Praxis) und in der Berufsschule (Theorie).' },
];
