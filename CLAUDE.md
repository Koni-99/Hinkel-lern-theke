# Hinkel Lern-Theke – Wissen für Claude

Lern-App der Bäckerei Hinkel (Quiz, Spiele, Nachschlagen, Ausbildung, Ausbilder-Bereich).
React 19 + TypeScript 6, gebaut mit Vite 8. Daten in Firebase Realtime Database.
Mehr zum Aufbau: `README.md`.

## Mit dem Nutzer
- **Hinkel verkauft KEINE Getränke, KEINE Torten, KEINE belegten Sachen.** Verkaufs-/Zusatzverkauf-Tipps nur mit eigenen Backwaren.
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
- Außerdem **Nein** (18.11.2026): Zutaten-Detektiv und Foto-Zoom-Raten (**will er nie wieder vorgeschlagen bekommen**), Preis-Reihe sortieren, „Neu“-Schild im Nachschlagen, Brötchen-Memory, Turnier der Woche, Produkt-Album, Teigi-Feier bei neuer Stufe, Teigi-Rangliste, Wissens-Check pro Mitarbeiter. **Ja** (18.11.): Willkommen-zurück-Bonus, Kundenfrage als Quizfrage übernehmen, Sprach-Suche im Nachschlagen, Schnell-Spickzettel (zuletzt angesehene Steckbriefe). Er mag eher Praktisches für Alltag/Ausbilder als neue Spiele. Weitere **Ja** (18.11.): Suche überall (Lupe oben: Produkte, Quizfragen, Hilfe), Kundenfrage zeigt passenden Steckbrief, Urlaubsmodus (Serie + Teigi pausieren, **höchstens 6 Wochen im Jahr**), „Preis geändert am …“ im Steckbrief (2 Wochen), Steckbrief per persönlicher Nachricht an Kollegen schicken, Lieblingsfragen im Quiz merken. **Nein**: Nachricht an Gruppen (einzeln ist besser), QR-Code für Neue (kommt beim geplanten Umzug). Dritte Runde: **Ja** Backtage im Steckbrief; **Nein** „Ohne“-Filter, Aufgabe an Mitarbeiter, Ausbilder-Notiz zu Mitarbeitern, Hinweis am Produkt, Gramm-Rechner, Antwort-Bilanz pro Frage
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
4. Neue Funktionen auch in `tests/app-test.js` aufnehmen, als eigener Teil `teile.push(['Name', async () => { … }])` in `offlineTests` (seit 242: 3 Teile laufen gleichzeitig, `GLEICHZEITIG=1` für hintereinander; Emulator-Teil `cloudTests` läuft hintereinander daneben; Dauer ~2,7 statt ~15 Min.). Nicht mit festen kurzen Wartezeiten prüfen, sondern in einer Schleife warten, bis es da ist. Pop-ups vorher mit `clearPopups` wegklicken.
   **Immer** (Wunsch des Nutzers): jede neue oder geänderte Funktion auch in „So funktioniert die Lern-Theke“ (`src/ui/hilfe.tsx`) erklären, bei Bedarf auch in „Wo finde ich was?“ und der Einführung; das Thema in den Hilfe-Test in `tests/app-test.js` aufnehmen.
5. Browser-Ports 5060 sind gesperrt (unsicherer Port), lieber 5055–5059 oder 5070.

## Umgebung
- Online: https://koni-99.github.io/Hinkel-lern-theke/ (alter Link https://66jqlv.csb.app leitet weiter, `umzug/index.tsx`).
- Aus der Claude-Umgebung sind `github.io` und die echte Firebase-Datenbank nicht erreichbar → der Nutzer muss
  Änderungen mit echten Daten selbst kurz testen.
- Firebase-Projekt: `hinkel-lern-app`. Anonyme Anmeldung und „Erstellen aktivieren (Registrierung)“ müssen an sein.

## Technische Merkpunkte (Kurzfassung, Details in `VERSIONEN.md`)
- **Versionsliste** steht in `VERSIONEN.md` (nur bei Bedarf lesen/durchsuchen). Nach jeder Version dort 1 bis 3 Zeilen anhängen, NICHT in diese Datei.
- Dunkles Design: Inline-Farben werden umgerechnet; echte Farben (Papier, gelbe Flächen mit Text) mit Klasse `lt-papier` + dunkler Schrift. CSS in `theke-design.ts` wird auch umgerechnet, außer der Selektor enthält `lt-papier`.
- Spiel-Namen in `scores` (z. B. 'Kassenblitz ⚡') nie ändern (Bestenliste). Emojis nur noch als Spiel-Inhalt (Laden-Zeichen, Abzeichen, Adventskalender, Platzhalter ohne Foto).
- Natürliche Stimmen (Google TTS, Schlüssel als Network secret für `texttospeech.googleapis.com`, Header `X-Goog-Api-Key`; Umgebung „Hinkel-lern-theke“ gibt es zur Zeit NICHT, Nutzer wollte am 21.11. keine neue): `tools/stimme/erzeugen.mjs` (Hör-Lernen/Quiz), `saetze.mjs` (Vorlesen + Wörterbuch Englisch), `bausteine.mjs` (Simulator/Telefon) erzeugen nur Fehlendes und schneiden die Stille weg (`stille.mjs`). Nach neuen Fragen oder Simulator-Texten laufen lassen, sonst schlagen Tests fehl. Tondatei-Abspieler immer mit `merkeAudio` anmelden (Teigi spricht mit).
- „Zum Abschalten“: Quellen in `tools/abschalten/`, bauen mit `python3 tools/abschalten/baue.py` → `public/abschalten/index.html` (nicht von Hand ändern). Medaillen in `spiele/*.js` und `hilfen/abschalten.ts` gleich halten.
- Teigi-Begleiter nur auf `TEIGI_SEITEN` (App.tsx) und im laufenden Quiz. `AnswerFx` = eine Plakette ohne Emoji.
- Quiz-Tests: gleiche Fragetexte gibt es mehrfach mit anderen Antworten → passende Frage über die sichtbaren Antworten finden.
- Sparsam arbeiten (Nutzer achtet aufs Nutzungslimit): keine Helfer-Agenten ohne Rückfrage, nicht nach jeder Version selbst den Online-Stand abfragen, Tests gezielt (`NUR=`), voller Lauf einmal vor dem Push.

## Offene Ideen (vom Nutzer noch nicht entschieden)
- PIN-Schutz verbessern (braucht Firebase-Regeln + bezahlten Tarif)
