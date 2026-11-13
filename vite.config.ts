// Build mit Vite (vorher Create React App).
// Auf GitHub Pages liegt die App im Unterordner /Hinkel-lern-theke/ (siehe .github/workflows/deploy.yml: --base).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    // Auch ältere Handys (Safari 14, Chrome 87 …) sollen die App öffnen können
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    // Die Hauptdatei ist groß (Logo und Küken stecken als Bild im Code), das war vorher auch so
    chunkSizeWarningLimit: 1600,
  },
});
