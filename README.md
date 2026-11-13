# Hinkel Lern-Theke

Lern-App für die Bäckerei Hinkel: Quiz, Spiele, Nachschlagen, Ausbildung und Ausbilder-Bereich.
Daten (Punkte, Fortschritt, PINs) liegen in Firebase.

**Online:** https://koni-99.github.io/Hinkel-lern-theke/
(der alte Link https://66jqlv.csb.app leitet dorthin weiter, siehe `umzug/index.tsx`)

## Wie Änderungen online gehen

Jede Änderung auf dem Branch wird von GitHub Actions automatisch gebaut und auf GitHub Pages
veröffentlicht (`.github/workflows/deploy.yml`). Nach 1 bis 2 Minuten ist sie online.
Die Versionsnummer steht in `src/App.tsx` (`APP_VERSION`) und unten in der App.

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

```
npm ci
DISABLE_ESLINT_PLUGIN=true npx react-scripts build
```
