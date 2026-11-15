# Hinkel Lern-Theke – Wissen für Claude

Lern-App der Bäckerei Hinkel (Quiz, Spiele, Nachschlagen, Ausbildung, Ausbilder-Bereich).
React 19 + TypeScript 6, gebaut mit Vite 8. Daten in Firebase Realtime Database.
Mehr zum Aufbau: `README.md`.

## Mit dem Nutzer
- **Immer Deutsch.** Kurz und einfach, keine Fachwörter ohne Erklärung. Er programmiert nicht selbst.
- Vor größeren Änderungen 2–3 Vorschläge machen, eine Empfehlung nennen, dann fragen.
- Nach jeder Version sagen: was neu ist, was geprüft wurde, was er selbst testen soll.
- Wichtig: Persönliche Angaben (z. B. Geburtstag) immer **freiwillig**, nie Pflicht.
- Er hat **Nein** gesagt zu: Urkunden/Zertifikaten, automatischer Sicherung vor dem Löschen,
  Team-Nachhilfe aus den häufigsten Fehlern, Auswertung als Excel, Paten für Neue, Thema der Woche,
  Allergen-Liste zum Ausdrucken und „So geht's“-Anleitungen (nicht gewählt, könnte später nochmal passen),
  „Was ist neu?“-Seite, Profilbild,
  Absturz-Schutz/Team-Code/Datenschutz-Seite (Vorschlag „Muss“-Liste, wollte lieber andere Ideen),
  Schicht-Checklisten, Prüfungs-Countdown für Azubis, dunkler Modus **als Standard** (gefällt ihm nicht; seit 187 nur als Wahl „Backstube bei Nacht“, hell bleibt Standard).
- Teamziel gibt es schon als **Wochenziel** – nicht nochmal vorschlagen.
- Außerdem **Nein** (14.11.2026): Spiel „Wer bin ich?“ (will er ausdrücklich nicht), Allergie-Profi-Spiel, „Heute neu gelernt“-Karte (die meisten schließen die App einfach), Update-Hinweis „Neue Version da“.
- Außerdem **Nein** (15.11.2026): Bestenliste mit Podest (macht den Kassenbon-Look kaputt), Lernen-Seite mit Fortschrittsringen, Team-Fotos im Bilderquiz, Saison-Vorbereitung auf der Startseite, App in anderen Sprachen, Erinnerung aufs Handy. Stufen-Feier: Vorschau gezeigt, am 15.11. **Ja** gesagt.
- Außerdem **Nein** (15.11.2026): Kassen-Geräusche, „Das verwechseln viele“ im Steckbrief, Quiz-Blitz.
- **Startseite bei jeder neuen Funktion mit aufräumen** (Wunsch des Nutzers): nicht einfach eine Karte dazupacken, sondern prüfen, was zusammengefasst/zugeklappt werden kann.
- Der Brotkorb auf der Startseite bleibt (er zeigt auch Stufe und Meister-Fortschritt).

## Stil der App
- **Keine Emojis** auf Karten, Überschriften und neuen Seiten. Symbole: `LtIcon` mit `ICON.*` aus `src/basis/symbole.tsx` (Strich-Symbole, z. B. `ICON.chat`, `ICON.bread`).
- Farben: `LT` (`src/basis/marke.tsx`) bzw. `TH` (`src/ui/basis.tsx`). Karten: `cardStyle`, Knöpfe: `btnPrimary`.
- Überschriften im Ausbilder-Bereich wie `sectionTitle`: Serif, 30px, darunter grauer Text 17px.

## Wichtige Regeln im Code
- **Neue Daten nur im eigenen Fortschritt speichern** (`progress/<name>/_feld`), wie Spruch, Kundenfragen, Tipps.
  Umfragen liegen unter `progress/admin/_umfragen` ("admin" wird aus allen Mitarbeiter-Listen gefiltert).
  Die echten Firebase-Regeln liegen NICHT im Repo und sind unbekannt. Neue Bereiche ganz oben in der
  Datenbank könnten abgelehnt werden und dann auch das Speichern von Punkten blockieren.
  Nur der Ausbilder schreibt in fremde Fortschritte und in `customQuestions`, `customProducts`, `pinboard` usw.
- Speichern immer über `mutateCloudData(curr => …)` (siehe `src/cloud/useCloud.ts`).
- **Hooks nie hinter `if (!username) return <LoginScreen …>`** in `App.tsx` (sonst Absturz beim An-/Abmelden).
- Große Excel-/Zusatz-Bibliotheken nur per `await import(...)` im Ausbilder-Bereich laden.
- Neue Pakete: exakte Version, mindestens 2 Wochen alt.

## Wo was liegt
- `src/App.tsx` – Zustand und Abläufe (groß, ~2500 Zeilen, nicht weiter zerlegen ohne Grund)
- `src/screens/` – Seiten (Anmeldung, Start, Quiz, Spiele-Auswahl, Nachschlagen, Kundenfragen, `dialoge/` Pop-ups)
- `src/games/` – Spiele, `src/ui/` – gemeinsame Bausteine, `src/basis/` – Marke, Symbole, Laden, Serie
- `src/admin/` – Reiter des Ausbilder-Bereichs, `src/components/AdminView.tsx` hält deren Zustand
- `src/components/karteikarten/` – Nachschlagen/Steckbriefe, `src/hilfen/` – Logik (Anmeldung, PIN, Zusammenführen, Kollegen, Fragen-Import)
- `src/cloud/` – Firebase laden/speichern/live, `src/daten/` – Produkte, Fragen
- `sw-template.js` + `vite.config.ts` – Service Worker (App geht ohne Internet auf)

## Arbeitsablauf
1. Branch: `claude/app-github-development-hn3cz2`. Jeder Push wird von GitHub gebaut, geprüft und online gestellt
   (`.github/workflows/deploy.yml`): Typen prüfen → `vite build --base=/Hinkel-lern-theke/` → `tests/app-test.js` → GitHub Pages.
2. Bei jeder Version `APP_VERSION` in `src/App.tsx` um 1 erhöhen (steht unten in der App).
3. Vor dem Push selbst prüfen:
   ```
   npm run typecheck
   npx vite build --base=/Hinkel-lern-theke/
   node tests/serve.js build 5055 /Hinkel-lern-theke &
   node tests/app-test.js http://127.0.0.1:5055/Hinkel-lern-theke/
   ```
   Mit Firebase-Emulator (Anmeldung, Live, Kundenfragen): im Ordner `tests/`
   `npx firebase-tools@15.36.0 emulators:exec --only database --project demo-hinkel "EMU=http://127.0.0.1:9000 node app-test.js http://127.0.0.1:5055/Hinkel-lern-theke/"`
   (In der Claude-Umgebung dafür die Proxy-Variablen weglassen: `env -u HTTPS_PROXY -u https_proxy -u GLOBAL_AGENT_HTTPS_PROXY -u NODE_OPTIONS`.)
4. Neue Funktionen auch in `tests/app-test.js` aufnehmen. Pop-ups vorher mit `clearPopups` wegklicken.
   **Immer** (Wunsch des Nutzers): jede neue oder geänderte Funktion auch in „So funktioniert die Lern-Theke“ (`src/ui/hilfe.tsx`) erklären, bei Bedarf auch in „Wo finde ich was?“ und der Einführung; das Thema in den Hilfe-Test in `tests/app-test.js` aufnehmen.
5. Browser-Ports 5060 sind gesperrt (unsicherer Port), lieber 5055–5059 oder 5070.

## Umgebung
- Online: https://koni-99.github.io/Hinkel-lern-theke/ (alter Link https://66jqlv.csb.app leitet weiter, `umzug/index.tsx`).
- Aus der Claude-Umgebung sind `github.io` und die echte Firebase-Datenbank nicht erreichbar → der Nutzer muss
  Änderungen mit echten Daten selbst kurz testen.
- Firebase-Projekt: `hinkel-lern-app`. Anonyme Anmeldung und „Erstellen aktivieren (Registrierung)“ müssen an sein.

## Versionen (Kurzüberblick)
- 150–152: Code von CodeSandbox nach GitHub, Live-Updates, Team-Übersicht der Fehler
- 153–162: Umbau in viele kleine Dateien (Etappen A–J), Verhalten unverändert
- 163: Vite statt Create React App, automatische Prüfung vor dem Online-Stellen
- 164: Kundenfragen („Das hat ein Kunde gefragt“) und Verkaufstipps
- 165: App geht ohne Internet auf (Service Worker), Sprechblasen-Symbol
- 166: Quizfragen aus Excel übernehmen (Ausbilder → Inhalte)
- 167: „Gelesen“-Bestätigung für wichtige Nachrichten, Team-Umfragen (Reiter „Nachricht & Umfrage“, Karte auf der Startseite)
- 168: Lob unter Kollegen (Startseite, 1× am Tag, +10 Punkte, Gelobter schreibt sich Punkte selbst gut; Feld `_kollegenLob`, NICHT `_lob` = Ausbilder-Lob), eigene Notiz im Steckbrief (`_notizen`, Schlüssel per Code, weil Produktnamen Sonderzeichen haben)
- 169: Hör-Lernen (Lernen → „Hör-Lernen“, `src/screens/HoerLernen.tsx`): liest Frage, Denkpause, Antwort vor; Tempo, Bereich, Fehler-Stapel; hält den Bildschirm an
- 170: Geburtstage (freiwillig, Menü → „Mein Geburtstag“, Karte + Gratulieren), Ideen-Box (Menü, anonym möglich, Ausbilder antwortet), Kundenstimmen (Lob/Kritik/Wunsch, Nachschlagen + Menü). Ausbilder-Reiter heißt jetzt „Rückmeldungen“ (Kundenfragen, Tipps, Ideen, Kundenstimmen, Lob). Logik: `src/hilfen/rueckmeldungen.ts`
- 171: Hilfe für Neue (`src/ui/hilfe.tsx`): Einführung 7 Seiten (neu „Wo finde ich was?“, „Gemeinsam im Team“), Hilfe-Seite mit „Wo finde ich was?“ oben + Themen zu allen neuen Funktionen. Neue Funktionen künftig auch dort erklären!
- 172: Hilfe-Seite und Einführung ohne Emojis (alles `LtIcon`)
- 173: Englisch-Wörterbuch (`src/daten/data.ts` DICTIONARY_EXTRA, Produkte automatisch in `karteikarten/daten.tsx`): neue Bereiche „Das sagen Kunden“, „Bezahlen“, „Zahlen & Mengen“, mehr Verkaufssätze, Übersetzungen korrigiert (z. B. „ohne Schokolade“ zählte als Schokolade), Wörterbuch-Seite ohne Emojis (`ICON.speaker`)
- 174: „Mein Monat“ (Menü, `src/screens/MeinMonat.tsx`, Logik `src/hilfen/meinMonat.ts`): Punkte + Vergleich Vormonat, Platz im Team, Lerntage, neu gemeistert (Stand am Monatsanfang in `_monatSnap`), Lieblings-Spiel, bester Tag, Tipp. Dunkler Modus entfernt (`dc()` gibt Farbe nur noch weiter)
- 175: Emojis aufgeräumt auf Überschriften, Knöpfen, Filtern, Hinweisen, Pop-ups, Ausbilder-Knöpfen. **Bewusst geblieben** (Spiel-Inhalt): Laden-Zeichen, Abzeichen, Stufen-Symbole, Ränge, Glücksrad/Rubbellos-Preise, Adventskalender, Gesichter im Theken-Ansturm/Simulator, Produkt-Platzhalter ohne Foto, kleine Animationen. Spiel-Namen in `scores` (z. B. 'Kassenblitz ⚡') NICHT ändern, sonst zerfällt die Bestenliste
- 176: Markise am Handy (bis 560px breit) größer (232px hoch, Logo 132px), zwei Reihen: oben Punkte/Trinkgeld/Menü, darunter großes Logo, Wetter links unten (`theke-design.ts`, Klasse `lt-hdr-logo`). Hilfe-Thema „Englisch für die Theke“
- 177: Hilfe-Zeilen brechen am Handy um („Was ist was?“ jetzt Begriff oben, Erklärung darunter). Schatzkammer-Namensfarben (`.lt-goldname`, `.lt-nc-*`) kräftiger, ohne die hellen 3D-Schatten der Begrüßung (die machten sie blass)
- 178: Produktdaten mit Excel „Hinkel_Produktliste_Shopify_korrigiert“ abgeglichen: doppelt angehängte Zutaten-Enden bei 41 Produkten entfernt (alter Fehler `' + BACKMALZ + …`), Roggenstange-Allergene, Apfelring-Zutat („Zeel.Quarkini“ → Quarkbällchen-Backmischung), Spuntino „Zucchini“, Warnhinweis Prasselkuchen (Marzipan fehlt in Zutaten), neu: Stollen-Konfekt. Preise der App = Filialpreise (Kasse 07.11.2026)
- 179: Schnellerer Start (12 Seiten/Spiele per `lazy()`, nach 4 s still vorgeladen; Ladebild nur 2,5 s, wenn gespeicherter Stand da), Seitenwechsel deutlicher (56px, .42s), Startseite aufgeräumt (Backkalender zu, Lern-Bon zugeklappt, Erledigtes in „Heute erledigt“). Saison-Deko auf der Markise gab es schon
- 180: Steckbrief (`karteikarten/SteckbriefDetail.tsx`): Foto groß (4:3), Allergene als farbige Kästchen (Farbe je Allergen-Gruppe, `ALLERGEN_STIL`), Allergene vor der Beschreibung; Hilfe-Thema „Steckbriefe der Produkte“
- 181: Ausbilder → Inhalte → „Produktliste aus Excel übernehmen“ (`src/admin/ProduktImport.tsx`, Logik `src/hilfen/produktImport.ts`): liest alle Blätter, Spalten Produktname/Preis Filiale/Allergene/Zutaten/Beschreibung/Vegan/Gewicht; Ausbilder wählt Felder + einzelne Änderungen; gespeichert als `productFixes` (neue Felder pricePerKg, allergenNote, fullIngredients, description, vegan, weight; Zurücknehmen unter Meldungen → Produktdaten korrigieren → Original). 3 weitere doppelte Zutaten-Enden entfernt (Spekulatius, Hüftgold)
- 182: Steckbriefe als Foto-Raster (2 pro Reihe am Handy, `.lt-foto-raster`), Offline-Hinweis klein neben den Punkten (`.lt-offline`, am Handy nur Punkt), App-Symbol + Startbild (`public/icon-*.png`, `apple-touch-icon.png`, `start-logo.png`, Splash in `index.html`, Manifest „Hinkel Lern-Theke“), Ausbilder → Einstellungen „Produkte ohne Foto“ (`src/admin/FehlendeFotos.tsx`, Einzelfoto-Upload nach `hinkel_bilder/images/<key>` + version)
- 183: Quiz Battle 40 s pro Frage (`BATTLE_SEKUNDEN` in `hilfen/battle.ts`), Alternativen-Jäger 30 s (`ALT_SEKUNDEN`, Punkte max. 70 wie vorher), Anmelde-Belohnung 0,30–1,50 € (`LOGIN_REWARDS`) mit 3D-Münzen statt Emojis (gleich auf Android/iPhone), Mehlstaub-Effekt und Kippen beim Antippen entfernt, **Zurück-Taste des Handys** geht eine Seite zurück (`hilfen/zurueck.ts`, Seitenstapel in App.tsx; `useZurueckSchliesst` für aufgeklappte Fenster wie Steckbrief), Schneide-Profi neues Brot-Bild (angeschnittener Laib + Scheiben + Maß), Theken-Ansturm größere Fotos (4 Spalten, weniger Rand). Daily-Cap Theken-Simulator 6 € zählt nur Simulator-Trinkgeld des Tages
- 184: Stufen-Feier (`screens/dialoge/NeueStufe.tsx`: Bühne, Strahlen, Brezelregen hinter dem Text, Medaille, alter→neuer Titel, Balken), Trinkgeld-Laden mit Anprobieren (erst Vorschau am Namen, dann „Kaufen“; auch Schatzkammer außer Spruch), Fachwissen-Überschriften brechen am Handy um. Quiz-Ergebnis ist schon ein Kassenbon (nichts geändert)
- 185: Abzeichen als Stickerheft (`BadgeAlbumView` in `ui/belohnungen.tsx`: Papierseiten + Spirale, Blatt dreht sich beim Blättern, neue Sticker fliegen rein/werden eingeklebt; gesehene Sticker im Gerät `lt_heft_gesehen`), Lernpfad als SVG-Spielbrett (Straße, Felder in Bereichsfarben, Sterne-Meilensteine, Spielfigur mit Zeichen), Ausbilder: Foto-Knopf im Steckbrief (`onFoto`), „Lange nicht da“ (2 Wochen) oben im Team-Reiter. „Fragen zum Prüfen“ gab es schon (Auswertung)
- 186: Neu laden bleibt auf der aktuellen Seite (`sessionStorage` 'lt_seite' für `activeTab`; laufendes Quiz startet wieder bei der Bereichsauswahl). Zurück-Taste nach dem Neuladen auf Unterseite → erst Startseite
- 187: Design von Claude Fable („Backstube bei Nacht“, Patch v179) übernommen, aber **hell ist Standard**. Menü → „Aussehen“ (`screens/dialoge/Aussehen.tsx`, pro Gerät in localStorage `lt_design` hell/nacht und `lt_kopf` markise/mitaehren/aehren, Logik `src/thema/modus.ts`). Neue Schriften Fraunces + Plus Jakarta Sans in beiden Designs. Jedes Element läuft durch `src/thema/jsx-runtime.ts` (vite `jsxImportSource: '@thema'`): im Nacht-Design `themaProps` (Farben umrechnen), sonst nur `schriftProps`. Inline-Farben werden im Nacht-Design umgerechnet → echte Farben, die bleiben sollen, als CSS-Klasse in `<style>` setzen. PC: Menü als Leiste links, Startseite zweispaltig. Behobene Fable-Fehler: Zeichen vor dem Namen durchsichtig, heller Seitenhintergrund/Startbild im Nacht-Design, CSS-Umrechnung beim Bauen (machte helles Design kaputt) entfernt
- 188: Logo dreht sich beim Antippen wieder ganz (Ähren-Kopf: kein `preserve-3d`), Markise auf Unterseiten am Handy größer (≥124px, zwei Reihen wie Startseite, Logo 58px), Verkaufstipp im Steckbrief (`getSalesTip` in `hilfen/produkte.ts`, kam von einer anderen Sitzung) ohne Gedankenstriche – Nutzer mag **keine „–“ in Texten**
- 189: „Papier“ im Nacht-Design: Klasse `lt-papier` (Kassenbons `lt-receipt`, Lern-Bon `lt-bon`, Bestenliste `sb-bon`, Tageskarte `lt-menu`) behält echte Farben (`themaProps` schreibt Flächen als `var(--pf-…, dunkel)` mit `--papier`; `PAPIER_RE` lässt deren CSS unverändert). Neue Papier-Elemente einfach mit `lt-papier` markieren. Laden-Bon `lt-shopbon` auch Papier. Goldener Knopf unten (`.lt-nav-ind` Verlauf) jetzt auch im hellen Design. 14-Tage-Balken: kurze Zahlen (27k, 4,4k), heutiger Balken nachts gold
- 190: Goldener Logo-Knopf (Kopf „Goldene Ähren“) am Handy kleiner (Logo 100px), Logo-Schatten ohne harten Versatz (kleine Schrift stand doppelt, auch kleines Logo auf Unterseiten), Startbild zeigt nur noch das Küken (`public/start-kueken.png` statt Logo)
- 191: Ähren-Köpfe (aehren/mitaehren) auf Tablet/PC groß (Start 250px, Logo 128px, Unterseiten 130px, Ähren größer), Menüleiste links dann etwas tiefer. Einzelfoto-Upload schärfer (1400px, JPEG 0,88)
- 192: Ähren-Köpfe auf Tablet/PC noch größer (Start 300px, Logo 150px, Unterseiten 150px/86px). Produktfotos stammen aus Screenshots (Nutzer schickte Screenshots, frühere Sitzung machte daraus `hinkel_bilder.json`) → deshalb unscharf, wenn groß gezeigt
- 193: **Produktfotos aus dem Online-Shop** (hinkel-shop.de/products.json, Shopify): 141 Produkte, bis zu 4 Fotos je Produkt, 820px JPEG in `public/fotos/<schlüssel>.jpg` bzw. `-2/-3/-4.jpg`, Liste + Anzahl in `src/daten/fotos.ts` (`mitShopFotos` legt sie über die Datenbank-Fotos, Spiele bekommen pro App-Start zufällig eins; `alleFotos` für die Galerie im Steckbrief). Service Worker speichert Fotos in eigenem Speicher `lern-theke-fotos-1`. Achtung: Ausbilder-Foto für ein Produkt mit Shop-Foto wird überdeckt. Lernpfad neu als kleiner Weg (Variante B, `.lt-pfad` in `ui/lernpfadRad.tsx`). Mehr Ähren im Kopf (`lt-b-breit` nur ab 561px), Logo am PC genau mittig
- 194: Verkaufstipp im Steckbrief heißt jetzt „Tipp für den Zusatzverkauf“ (Überschrift + Korb-Symbol), Texte nach Gruppe sagen, was man noch anbieten kann

## Offene Ideen (vom Nutzer noch nicht entschieden)
- Natürliche Stimme für Hör-Lernen: App-Seite fertig (spielt `public/stimme/<code>.mp3`, sonst Handy-Stimme; Erzeuger `tools/stimme/erzeugen.mjs`). Pausiert: Piper-Stimmen gefielen nicht (Thorsten = beste Qualität, Stimme nicht gemocht), Google braucht hinterlegte Karte + Schlüssel (Network secret `texttospeech.googleapis.com`, Header `X-Goog-Api-Key`). Nutzer will beste Qualität → später Google.
- PIN-Schutz verbessern (braucht Firebase-Regeln + bezahlten Tarif)
