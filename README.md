# Hinkel Lern-Theke

Lern-App für die Bäckerei Hinkel: Quiz, Spiele, Nachschlagen, Ausbildung und Ausbilder-Bereich.
Daten (Punkte, Fortschritt, PINs) liegen in Firebase.

**Online:** https://koni-99.github.io/Hinkel-lern-theke/
(der alte Link https://66jqlv.csb.app leitet dorthin weiter, siehe `umzug/index.tsx`)

## Wie Änderungen online gehen

Jede Änderung auf dem Branch wird von GitHub Actions automatisch gebaut und auf GitHub Pages
veröffentlicht (`.github/workflows/deploy.yml`). Nach 1 bis 2 Minuten ist sie online.
Die Versionsnummer steht in `src/App.tsx` (`APP_VERSION`) und unten in der App.

## Automatische Prüfung

Vor dem Online-Stellen prüft GitHub die fertige App in einem echten Browser (`tests/app-test.js`):
Anmeldeseite, alle Hauptseiten (Handy und PC, Mitarbeiter und Ausbilder), eine ganze Quizrunde,
alle Spiele, Nachschlagen/Karteikarten, alle Ausbilder-Reiter und mit dem Firebase-Emulator
Anmeldung mit PIN sowie Live-Updates. Jeder Fehler im Browser zählt. Schlägt etwas fehl,
bleibt die bisherige Version online. Das Ergebnis steht unter „Actions“ im Repository.

Von Hand (nach dem Bauen mit `--base=/Hinkel-lern-theke/`):
```
node tests/serve.js build 5055 /Hinkel-lern-theke &
node tests/app-test.js http://127.0.0.1:5055/Hinkel-lern-theke/
```

## Aufbau von `src/`

| Ordner / Datei | Inhalt |
|---|---|
| `App.tsx` | Zustand der App, Abläufe, Navigation |
| `basis/` | Gemeinsame Bausteine: Marke und Farben (`LT`), Symbole, Laden, Fakten/Wetter, Lern-Serie, PIN-Formular |
| `theke-design.ts` | Das Design (CSS) als Text, wird als `<style>` eingefügt |
| `cloud/` | Laden, Speichern und Live-Updates mit Firebase |
| `screens/` | Anmeldung, Startseite, Spiele-Auswahl, Nachschlagen, Einarbeitung, `quiz/` (Bereich, Stufe, Frage, Auswertung), `dialoge/` (Pop-ups) |
| `games/` | Die Spiele, `theke/` ist der Theken-Simulator |
| `ui/` | Bausteine für alle Bereiche: Knöpfe, Abzeichen, Statistik, Hilfe, Belohnungen … |
| `admin/` | Ausbilder-Bereich, ein Reiter pro Datei |
| `components/` | Größere Ansichten: Ausbilder-Bereich, Karteikarten (`karteikarten/`), Bestenliste, Battle, Tüten-Blitz, Alternativen-Jäger |
| `daten/` | Produkte, Fragen, Sortiment |
| `hilfen/` | Hilfsfunktionen: Allgemeines, Battle, Daten zusammenführen, PIN, Produkte, Prüfung, Anmeldung, Bestenliste |
| `types.ts`, `focus.ts` | Datentypen, Lernschwerpunkte |

## Lokal bauen

Gebaut wird mit [Vite](https://vite.dev) (vorher Create React App).
```
npm ci
npm run dev          # zum Entwickeln, mit automatischem Neuladen
npm run typecheck    # TypeScript prüfen
npx vite build --base=/Hinkel-lern-theke/   # fertige App in build/
```
Die App wird auch für ältere Handys gebaut (Safari 14, Chrome 87 und neuer, siehe `vite.config.ts`).
