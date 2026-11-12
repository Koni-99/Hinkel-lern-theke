
/** Versionsnummer dieser Datei, muss zur App.tsx passen (wird unten in der App angezeigt) */
export const GAMES_VERSION: number = 65;

// Die Inhalte liegen jetzt in eigenen Dateien. Diese Datei sammelt sie, damit alle bisherigen Importe weiter funktionieren.
export * from '../games/spielBasis';
export * from '../games/Kassenblitz';
export * from '../games/theke/basis';
export * from '../games/theke/szenarienVerkauf';
export * from '../games/theke/szenarienAlltag';
export * from '../games/theke/gespraech';
export * from '../games/theke/ThekenSimulator';
export * from '../games/BilderQuiz';
export * from '../games/AllergenTrainer';
export * from '../games/PreisDuell';
export * from '../games/SchneideProfi';
export * from '../games/produktDesTages';
export * from '../games/Advent';
export * from '../games/ThekenAnsturm';
