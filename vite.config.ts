// Build mit Vite (vorher Create React App).
// Auf GitHub Pages liegt die App im Unterordner /Hinkel-lern-theke/ (siehe .github/workflows/deploy.yml: --base).
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

/** Erzeugt sw.js mit der Liste aller App-Dateien, damit die App auch ohne Internet aufgeht (siehe sw-template.js) */
function offlineServiceWorker(): Plugin {
  return {
    name: 'lern-theke-offline',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = ['./', 'index.html', 'manifest.json', ...Object.keys(bundle).filter((f) => f !== 'index.html' && !f.endsWith('.map'))].sort();
      const version = createHash('sha1').update(files.join('|')).digest('hex').slice(0, 12);
      const code = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8')
        .replace("const VERSION = '__VERSION__';", `const VERSION = ${JSON.stringify(version)};`)
        .replace('const FILES = __FILES__;', `const FILES = ${JSON.stringify(files)};`);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: code });
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
  build: {
    outDir: 'build',
    // Auch ältere Handys (Safari 14, Chrome 87 …) sollen die App öffnen können
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    // Die Hauptdatei ist groß (Logo und Küken stecken als Bild im Code), das war vorher auch so
    chunkSizeWarningLimit: 1600,
  },
});
