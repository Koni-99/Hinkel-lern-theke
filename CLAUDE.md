# Hinkel Lern-Theke – Wissen für Claude

Lern-App der Bäckerei Hinkel (Quiz, Spiele, Nachschlagen, Ausbildung, Ausbilder-Bereich).
React 19 + TypeScript 6, gebaut mit Vite 8. Daten in Firebase Realtime Database.
Mehr zum Aufbau: `README.md`.

## Mit dem Nutzer
- **Immer Deutsch.** Kurz und einfach, keine Fachwörter ohne Erklärung. Er programmiert nicht selbst.
- Vor größeren Änderungen 2–3 Vorschläge machen, eine Empfehlung nennen, dann fragen.
- Nach jeder Version sagen: was neu ist, was geprüft wurde, was er selbst testen soll.
- Er hat **Nein** gesagt zu: Urkunden/Zertifikaten, automatischer Sicherung vor dem Löschen,
  Team-Nachhilfe aus den häufigsten Fehlern, Auswertung als Excel, Paten für Neue, Thema der Woche,
  Absturz-Schutz/Team-Code/Datenschutz-Seite (Vorschlag „Muss“-Liste, wollte lieber andere Ideen).
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

## Offene Ideen (vom Nutzer noch nicht entschieden)
- PIN-Schutz verbessern (braucht Firebase-Regeln + bezahlten Tarif)
