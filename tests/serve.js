// Kleiner Webserver für den fertigen Build (ohne zusätzliches Paket).
// node tests/serve.js <ordner> <port> [<pfad-präfix>]
// Beispiel: node tests/serve.js build 5055 /Hinkel-lern-theke
const http = require('http');
const fs = require('fs');
const path = require('path');

const [dir = 'build', port = '5055', prefix = ''] = process.argv.slice(2);
const root = path.resolve(dir);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.map': 'application/json', '.txt': 'text/plain' };

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (prefix && url.startsWith(prefix)) url = url.slice(prefix.length) || '/';
  let file = path.join(root, url);
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file = path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(Number(port), '127.0.0.1', () => console.log(`Build läuft auf http://127.0.0.1:${port}${prefix}/`));
