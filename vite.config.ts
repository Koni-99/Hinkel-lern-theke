// Build mit Vite (vorher Create React App).
// Auf GitHub Pages liegt die App im Unterordner /Hinkel-lern-theke/ (siehe .github/workflows/deploy.yml: --base).
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** Erzeugt sw.js mit der Liste aller App-Dateien, damit die App auch ohne Internet aufgeht (siehe sw-template.js) */
function offlineServiceWorker(): Plugin {
  return {
    name: 'lern-theke-offline',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = ['./', 'index.html', 'manifest.json', 'start-kueken.png', 'favicon-64.png', 'icon-192.png', 'apple-touch-icon.png', 'abschalten/index.html', ...Object.keys(bundle).filter((f) => f !== 'index.html' && !f.endsWith('.map'))].sort();
      const version = createHash('sha1').update(files.join('|')).digest('hex').slice(0, 12);
      const code = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8')
        .replace("const VERSION = '__VERSION__';", `const VERSION = ${JSON.stringify(version)};`)
        .replace('const FILES = __FILES__;', `const FILES = ${JSON.stringify(files)};`);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: code });
    },
  };
}

export default defineConfig({
  // Jedes Element läuft durch src/thema/jsx-runtime.ts: neue Schrift, im Design „Backstube bei Nacht“ auch dunkle Farben
  plugins: [react({ jsxImportSource: '@thema' }), offlineServiceWorker()],
  resolve: { alias: { '@thema': fileURLToPath(new URL('./src/thema', import.meta.url)) } },
  build: {
    outDir: 'build',
    // Auch ältere Handys (Safari 14, Chrome 87 …) sollen die App öffnen können
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    chunkSizeWarningLimit: 1600,
    // Selten Geändertes in eigene Dateien: Bei einer neuen App-Version muss das Handy nur das Neue laden
    // (der Service Worker übernimmt unveränderte Dateien vom Gerät, siehe sw-template.js)
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (/src[\\/]daten[\\/]questions\.ts$/.test(id)) return 'fragen';
          return undefined;
        },
      },
    },
  },
});
