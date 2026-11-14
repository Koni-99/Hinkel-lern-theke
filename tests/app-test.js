// ═══ Automatische Prüfung der Lern-Theke ═══
// Läuft vor jedem Online-Stellen (GitHub Actions) und lässt sich auch von Hand starten:
//   node tests/serve.js build 5055 /Hinkel-lern-theke &
//   node tests/app-test.js http://127.0.0.1:5055/Hinkel-lern-theke/
// Mit Firebase-Emulator (Anmeldung und Live-Updates): EMU=http://127.0.0.1:9000 setzen.
// Jeder Fehler im Browser (Absturz, Skriptfehler) zählt als „nicht bestanden“.
const { chromium } = require('playwright');

const APP = process.argv[2] || 'http://127.0.0.1:5055/Hinkel-lern-theke/';
const EMU = process.env.EMU || '';
const NS = 'demo-hinkel';
const CLOUD = `${EMU}/hinkel_app.json?ns=${NS}`;

const results = [];
const ok = (name, cond, info = '') => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? 'OK    ' : 'FEHLER'}  ${name}${info ? `  (${info})` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Unsichtbare Firebase-Anmeldung für den Emulator nachmachen (er prüft die Signatur nicht)
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const fakeToken = () => {
  const n = Math.floor(Date.now() / 1000);
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'test', user_id: 'test', iat: n, exp: n + 3600, aud: NS, iss: `https://securetoken.google.com/${NS}`, firebase: { sign_in_provider: 'anonymous' } })}.`;
};
const db = async (method, path = '', body) => {
  const res = await fetch(`${EMU}/hinkel_app${path}.json?ns=${NS}`, { method, headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return res.json();
};

const SAMPLE = (() => {
  const now = Date.now();
  return {
    scores: [{ id: 's1', username: 'Anna', score: 120, date: '10.11.26, 08:00', category: 'Quiz' }, { id: 's2', username: 'Ben', score: 340, date: '11.11.26, 09:00', category: 'Theken-Simulator' }],
    progress: { anna: { _displayName: 'Anna', wrongStats: { 4001: 3, 4501: 1 }, _role: 'azubi' }, ben: { _displayName: 'Ben', wrongStats: { 4001: 2 }, _spruch: { text: 'Brot ist Leben', status: 'pending', price: 15000 } } },
    lastSeen: { anna: { displayName: 'Anna', time: '12.11.26, 09:55', timestamp: now - 60000 }, ben: { displayName: 'Ben', time: '11.11.26, 09:00', timestamp: now - 9e7 } },
    battles: {}, wrongStats: {}, pinboard: null, customProducts: [], customQuestions: [], pins: {}, tombstones: {}, questionEdits: {}, productFixes: {},
  };
})();

let browser;
/** Neues „Gerät“: user = angemeldeter Name, cloud = mit Emulator verbinden, sonst ohne Internet-Datenbank */
async function device({ user = '', admin = false, cloud = false, backup = null, viewport = { width: 1100, height: 900 }, blockLive = false, vorher = null } = {}) {
  const ctx = await browser.newContext({ viewport });
  if (vorher) await vorher(ctx);
  await ctx.route(/open-meteo|fonts\.g/, (r) => r.abort());
  if (cloud) {
    await ctx.route(/googleapis\.com/, (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ idToken: fakeToken(), id_token: fakeToken(), refreshToken: 'r', refresh_token: 'r', expiresIn: '3600', expires_in: '3600', localId: 'test' }) }));
    if (blockLive) await ctx.route(/127\.0\.0\.1:9000/, (r) => ((r.request().headers().accept || '').includes('text/event-stream') ? r.abort() : r.continue()));
  } else {
    await ctx.route(/googleapis|firebasedatabase|firebaseio/, (r) => r.abort());
  }
  await ctx.addInitScript(([o]) => {
    if (sessionStorage.getItem('__init')) return;
    sessionStorage.setItem('__init', '1');
    localStorage.setItem('hinkel_intro_done', '1');
    localStorage.setItem('hinkel_anim', '0');
    if (o.cloud) localStorage.setItem('hinkel_cloud_url', o.cloud);
    if (o.user) localStorage.setItem('hinkel_username', o.user);
    if (o.admin) localStorage.setItem('hinkel_admin_auth', JSON.stringify({ idToken: 'x', refreshToken: 'r', exp: 9e15, uid: 'a', email: 'test@example.de' }));
    if (o.backup) localStorage.setItem('hinkel_cloud_backup', JSON.stringify(o.backup));
  }, [{ user: admin ? 'admin' : user, admin, cloud: cloud ? CLOUD : '', backup }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(APP);
  await settle(page, 2500);
  return { ctx, page, errors };
}
/** Codes aller Hör-Lernen-Texte, genau wie die App sie berechnet (App-Code kurz übersetzen) */
function stimmeKeys() {
  const path = require('path'), os = require('os'), fs = require('fs');
  const root = path.resolve(__dirname, '..'), out = fs.mkdtempSync(path.join(os.tmpdir(), 'lt-keys-'));
  require('child_process').execFileSync(path.join(root, 'node_modules/.bin/tsc'), ['src/daten/questions.ts', 'src/hilfen/stimme.ts', '--ignoreConfig', '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--esModuleInterop', '--rootDir', 'src'], { cwd: root });
  const Q = require(path.join(out, 'daten/questions.js')), { hoerTexte, stimmeKey } = require(path.join(out, 'hilfen/stimme.js'));
  const keys = new Set();
  [...(Q.questions || []), ...(Q.examQuestions || [])].forEach((q) => { const t = hoerTexte(q); keys.add(stimmeKey(t.frage)); keys.add(stimmeKey(t.antwort)); });
  return [...keys];
}
/** 0,3 Sekunden Stille als WAV (Ersatz für eine echte Tondatei) */
function stilleWav() {
  const n = 2400, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24); b.writeUInt32LE(16000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  return b;
}
/** Warten, bis nachgeladene Bereiche da sind (kein „Lädt …“ mehr) */
async function settle(page, ms = 800) {
  await page.waitForTimeout(ms);
  for (let i = 0; i < 40; i++) {
    const loading = await page.evaluate(() => /role="status" style="padding: 48px/.test(document.body.innerHTML)).catch(() => false);
    if (!loading) return;
    await page.waitForTimeout(150);
  }
}
const nav = (page) => page.locator('[aria-label="Hauptmenü"] button:visible');
const mainText = async (page) => ((await page.locator('main').first().innerText().catch(() => '')) || '').trim().length;
const click = (loc) => loc.evaluate((el) => el.click());
/** Offene Pop-ups (Belohnung, Rückblick …) wegklicken, so wie ein Mensch es tun würde */
async function clearPopups(page) {
  for (let k = 0; k < 8; k++) {
    const o = page.locator('.lt-overlay:visible button:visible, [role=dialog][aria-modal=true]:visible button:visible');
    if (!(await o.count())) return;
    await o.last().click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(400);
  }
}

async function offlineTests() {
  // Anmeldeseite
  {
    const d = await device();
    ok('Anmeldeseite zeigt das Namensfeld', (await d.page.locator('input[placeholder="z. B. Anna"]').count()) === 1);
    ok('Anmeldeseite ohne Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }
  // Alle Hauptseiten, Handy und PC, Mitarbeiter und Ausbilder
  for (const vp of [{ width: 1100, height: 900, n: 'PC' }, { width: 390, height: 844, n: 'Handy' }]) {
    for (const who of ['Anna', 'admin']) {
      const d = await device({ user: who, admin: who === 'admin', backup: SAMPLE, viewport: vp });
      const n = await nav(d.page).count();
      let empty = 0;
      for (let i = 0; i < n; i++) {
        await click(nav(d.page).nth(i)); await settle(d.page);
        if ((await mainText(d.page)) < 20) empty++;
      }
      ok(`${vp.n}, ${who}: alle ${n} Hauptseiten öffnen sich mit Inhalt`, n >= 5 && empty === 0, `${empty} leer`);
      ok(`${vp.n}, ${who}: keine Fehler`, d.errors.length === 0, d.errors[0]);
      await d.ctx.close();
    }
  }
  // Eine ganze Quizrunde
  {
    const d = await device({ user: 'Anna' });
    await click(nav(d.page).nth(1)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible').first()); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible').first()); await settle(d.page);
    let answered = 0;
    for (let i = 0; i < 40; i++) {
      const opts = d.page.locator('button.lt-qopt:visible');
      if (!(await opts.count())) break;
      await click(opts.nth(i % 2)); await settle(d.page, 300); answered++;
      const next = d.page.locator('button.lt-sticky-next:visible');
      if (!(await next.count())) break;
      await click(next.first()); await settle(d.page, 300);
    }
    const stillQuestion = await d.page.locator('button.lt-qopt:visible').count();
    ok('Quiz: ganze Runde bis zur Auswertung', answered >= 5 && stillQuestion === 0, `${answered} Fragen beantwortet`);
    ok('Quiz: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }
  // Hör-Lernen: Seite geht auf, Auswahl und Abspiel-Knopf sind da
  {
    const d = await device({ user: 'Anna' });
    await click(nav(d.page).nth(1)); await settle(d.page);
    await click(d.page.locator('button.lt-card', { hasText: 'Hör-Lernen' }).first()); await settle(d.page);
    ok('Hör-Lernen: Seite mit Abspiel-Knopf', (await d.page.getByRole('button', { name: 'Vorlesen starten' }).count()) > 0 && (await d.page.getByRole('button', { name: /^Alles \(/ }).count()) > 0);
    ok('Hör-Lernen: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }
  // Hör-Lernen mit natürlicher Stimme: Tondateien werden abgespielt (Test-Töne statt echter Dateien)
  {
    const keys = stimmeKeys();
    const ctxRoute = async (ctx) => {
      await ctx.route(/\/stimme\/index\.json/, (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(keys) }));
      await ctx.route(/\/stimme\/[0-9a-f]+\.mp3/, (r) => { tonAbrufe++; r.fulfill({ contentType: 'audio/wav', body: stilleWav() }); });
    };
    let tonAbrufe = 0;
    const d = await device({ user: 'Anna', vorher: ctxRoute });
    await click(nav(d.page).nth(1)); await settle(d.page);
    await click(d.page.locator('button.lt-card', { hasText: 'Hör-Lernen' }).first()); await settle(d.page);
    await click(d.page.getByRole('button', { name: 'Vorlesen starten' }).first());
    await d.page.waitForTimeout(9000);
    ok('Hör-Lernen: spielt Tondateien ab (Frage und Antwort)', tonAbrufe >= 2, `${tonAbrufe} Tondateien geladen`);
    await click(d.page.getByRole('button', { name: 'Vorlesen anhalten' }).first());
    ok('Hör-Lernen mit Tondateien: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }
  // Alle Spiele öffnen und ein paar Mal klicken
  {
    const d0 = await device({ user: 'Anna' });
    await click(nav(d0.page).nth(2)); await settle(d0.page);
    const games = await d0.page.locator('button.lt-card:visible').allInnerTexts();
    await d0.ctx.close();
    const failed = [];
    for (let g = 0; g < games.length; g++) {
      const d = await device({ user: 'Anna' });
      await click(nav(d.page).nth(2)); await settle(d.page);
      await click(d.page.locator('button.lt-card:visible').nth(g)); await settle(d.page, 1500);
      for (let k = 0; k < 6; k++) {
        const btn = d.page.locator('main button:visible:not([disabled])');
        const c = await btn.count(); if (!c) break;
        await click(btn.nth((k * 5 + g) % Math.min(c, 12))); await settle(d.page, 500);
      }
      if (d.errors.length || (await mainText(d.page)) < 20) failed.push(`${games[g].split('\n')[0]}: ${d.errors[0] || 'leer'}`);
      await d.ctx.close();
    }
    ok(`Spiele: alle ${games.length} öffnen und laufen ohne Fehler`, games.length >= 8 && failed.length === 0, failed.join('; '));
  }
  // Nachschlagen und Karteikarten
  {
    const failed = [];
    for (let e = 0; e < 3; e++) {
      const d = await device({ user: 'Anna' });
      await click(nav(d.page).nth(3)); await settle(d.page);
      const entries = d.page.locator('main button:visible');
      if ((await entries.count()) <= e) { await d.ctx.close(); break; }
      await click(entries.nth(e)); await settle(d.page);
      const n = Math.min(await d.page.locator('.fc-root button:visible').count(), 20);
      for (let i = 0; i < n; i++) {
        const b = d.page.locator('.fc-root button:visible');
        if ((await b.count()) <= i) break;
        await click(b.nth(i)); await settle(d.page, 300);
      }
      if (d.errors.length) failed.push(`Eintrag ${e}: ${d.errors[0]}`);
      await d.ctx.close();
    }
    ok('Nachschlagen: Karteikarten und Filter ohne Fehler', failed.length === 0, failed.join('; '));
  }
  // Ohne Internet: App geht auf (Service Worker hat die Dateien gespeichert)
  {
    const d = await device({ user: 'Anna' });
    await d.page.waitForFunction(() => !!navigator.serviceWorker && !!navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
    const sw = await d.page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
    ok('Offline: Service Worker ist aktiv', sw);
    await d.ctx.setOffline(true);
    await d.page.reload(); await settle(d.page, 2500);
    const n = await nav(d.page).count();
    let empty = 0;
    for (let i = 0; i < n; i++) { await click(nav(d.page).nth(i)); await settle(d.page); if ((await mainText(d.page)) < 20) empty++; }
    ok('Offline: App geht ohne Internet auf, alle Hauptseiten mit Inhalt', n >= 5 && empty === 0, `${n} Seiten, ${empty} leer`);
    ok('Offline: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }
  // Ausbilder-Bereich: alle Reiter mit Beispieldaten
  {
    const d = await device({ admin: true, backup: SAMPLE });
    await click(d.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(d.page);
    for (let w = 0; w < 50 && !(await d.page.locator('[role=tab]').count()); w++) await sleep(100);
    const tabs = d.page.locator('[role=tab]');
    const n = await tabs.count();
    let empty = 0;
    for (let i = 0; i < n; i++) {
      await click(tabs.nth(i)); await settle(d.page, 400);
      const opener = d.page.locator('button[aria-expanded="false"]:visible');
      if (await opener.count()) { await click(opener.first()); await settle(d.page, 300); }
      if ((await mainText(d.page)) < 20) empty++;
    }
    ok(`Ausbilder: alle ${n} Reiter mit Inhalt`, n >= 5 && empty === 0, `${empty} leer`);
    ok('Ausbilder: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }
}

async function cloudTests() {
  await db('PUT', '', { progress: { ben: { _displayName: 'Ben' } }, lastSeen: {}, scores: [{ id: 'b1', username: 'Ben', score: 50, date: '12.11.26, 08:00', category: 'Quiz' }] });
  // Anmeldung: neuer Name → PIN festlegen, zweites Gerät: falsche und richtige PIN
  {
    const A = await device({ cloud: true });
    await A.page.fill('input[placeholder="z. B. Anna"]', 'Testi'); await A.page.keyboard.press('Enter');
    await A.page.waitForSelector('input[placeholder="4 bis 6 Ziffern"]', { timeout: 10000 }).catch(() => {});
    const pins = A.page.locator('input[placeholder="4 bis 6 Ziffern"]');
    ok('Anmeldung: neuer Name führt zu „PIN festlegen“', (await pins.count()) === 2);
    if ((await pins.count()) === 2) { await pins.nth(0).fill('4711'); await pins.nth(1).fill('4711'); await A.page.getByText('PIN speichern').click(); }
    await sleep(2500);
    ok('Anmeldung: nach „PIN speichern“ angemeldet', (await A.page.evaluate(() => localStorage.getItem('hinkel_username'))) === 'Testi');
    const pin = await db('GET', '/pins/testi');
    ok('Anmeldung: PIN liegt verschlüsselt in Firebase', !!(pin && pin.h) && !JSON.stringify(pin).includes('4711'));
    const B = await device({ cloud: true });
    await B.page.fill('input[placeholder="z. B. Anna"]', 'Testi'); await B.page.keyboard.press('Enter');
    await B.page.waitForSelector('input[placeholder="PIN"]', { timeout: 10000 }).catch(() => {});
    await B.page.fill('input[placeholder="PIN"]', '1111').catch(() => {}); await B.page.keyboard.press('Enter'); await sleep(1500);
    ok('Anmeldung: falsche PIN wird abgelehnt', !(await B.page.evaluate(() => localStorage.getItem('hinkel_username'))));
    await B.page.fill('input[placeholder="PIN"]', '4711').catch(() => {}); await B.page.keyboard.press('Enter'); await sleep(2000);
    ok('Anmeldung: richtige PIN meldet an', (await B.page.evaluate(() => localStorage.getItem('hinkel_username'))) === 'Testi');
    ok('Anmeldung: keine Fehler', !A.errors.length && !B.errors.length, A.errors[0] || B.errors[0]);
    await A.ctx.close(); await B.ctx.close();
  }
  // Live-Updates: Änderung eines Kollegen kommt sofort an
  {
    const A = await device({ cloud: true, user: 'Anna' });
    const live = async () => A.page.evaluate(() => document.documentElement.dataset.cloudLive || '');
    for (let i = 0; i < 50 && (await live()) !== '1'; i++) await sleep(100);
    ok('Live: Verbindung steht', (await live()) === '1');
    const t0 = Date.now();
    await db('PATCH', '/progress', { carla: { _displayName: 'Carla' } });
    let arrived = false;
    for (let i = 0; i < 60 && !arrived; i++) { arrived = await A.page.evaluate(() => !!(JSON.parse(localStorage.getItem('hinkel_cloud_backup') || '{}').progress || {}).carla); if (!arrived) await sleep(50); }
    ok('Live: Änderung eines Kollegen kommt sofort an', arrived, `${Date.now() - t0} ms`);
    ok('Live: Annas Aktivität ist gespeichert', !!(await db('GET', '/lastSeen/anna')));
    await A.ctx.close();
  }
  // Kundenfragen: Mitarbeiter fragt, Ausbilder antwortet, Antwort kommt live an
  {
    await db('PATCH', '/pins', { anna: { h: 'x', s: 'y', ts: 1 } });
    const A = await device({ cloud: true, user: 'Anna' });
    await clearPopups(A.page);
    await click(nav(A.page).nth(3)); await settle(A.page);
    await click(A.page.getByText('Das hat ein Kunde gefragt').first()); await settle(A.page);
    await A.page.fill('textarea[aria-label="Frage des Kunden"]', 'Gibt es das Brot auch halb?').catch(() => {});
    await click(A.page.getByText('Frage an den Ausbilder schicken').first()).catch(() => {}); await sleep(2000);
    const kf = (await db('GET', '/progress/anna/_kfragen')) || {};
    const id = Object.keys(kf).find((k) => kf[k] && kf[k].q === 'Gibt es das Brot auch halb?');
    ok('Kundenfragen: Frage wird gespeichert', !!id);
    if (id) await db('PATCH', `/progress/anna/_kfragen/${id}`, { a: 'Ja, alle Brote gibt es auch halb.', aTs: Date.now(), seen: false });
    let shown = false;
    for (let i = 0; i < 50 && !shown; i++) { shown = (await A.page.getByText('Ja, alle Brote gibt es auch halb.').count()) > 0; if (!shown) await sleep(100); }
    ok('Kundenfragen: Antwort vom Ausbilder erscheint sofort', shown);
    ok('Kundenfragen: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }
  // Wichtige Nachricht bestätigen und Team-Umfrage abstimmen
  {
    const ts = Date.now();
    await db('PATCH', '', { pinboard: { text: 'Testnachricht wichtig', author: 'Ausbilder', updatedAt: 'heute', timestamp: ts, pflicht: true } });
    await db('PATCH', '/progress/admin', { _umfragen: { u1: { frage: 'Testumfrage?', optionen: ['Ja', 'Nein'], anonym: true, ts, offen: true } } });
    const A = await device({ cloud: true, user: 'Anna' });
    const knopf = A.page.locator('[role=dialog] button', { hasText: 'Gelesen und verstanden' });
    for (let i = 0; i < 50 && !(await knopf.count()); i++) await sleep(100);
    ok('Gelesen: wichtige Nachricht zeigt „Gelesen und verstanden“', (await knopf.count()) > 0);
    if (await knopf.count()) { await knopf.first().click(); await sleep(1500); }
    const g = (await db('GET', '/progress/anna/_gelesen')) || {};
    ok('Gelesen: Bestätigung wird gespeichert', Number(g[String(ts)]) > 0);
    await clearPopups(A.page);
    await click(nav(A.page).nth(0)); await settle(A.page);
    const ja = A.page.getByRole('button', { name: 'Ja', exact: true });
    for (let i = 0; i < 30 && !(await ja.count()); i++) await sleep(100);
    if (await ja.count()) { await ja.first().click(); await sleep(1500); }
    ok('Umfrage: Stimme wird gespeichert', (await db('GET', '/progress/anna/_stimmen/u1')) === 0);
    ok('Gelesen/Umfrage: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }
  // Lob von Kollegen: der Gelobte bekommt die Punkte genau einmal
  {
    await db('PATCH', '/progress/ben', { _displayName: 'Ben', _kollegenLob: { l1: { an: 'anna', anName: 'Anna', t: 'Danke für die Hilfe!', ts: Date.now() } } });
    const A = await device({ cloud: true, user: 'Anna' });
    let pkt = [];
    for (let i = 0; i < 60 && pkt.length === 0; i++) { const sc = (await db('GET', '/scores')) || []; pkt = (Array.isArray(sc) ? sc : Object.values(sc)).filter((x) => x && x.category === 'Lob von Kollegen' && x.username === 'Anna'); if (!pkt.length) await sleep(100); }
    ok('Lob: Gelobte bekommt 10 Punkte', pkt.length === 1 && pkt[0].score === 10, `${pkt.length} Einträge`);
    ok('Lob: Karte „Lob der Woche“ zeigt das Lob', (await A.page.getByText('Danke für die Hilfe!', { exact: false }).count()) > 0);
    ok('Lob: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }
  // Geburtstag (freiwillig) und Ideen-Box
  {
    const d = new Date();
    await db('PATCH', '/progress/ben', { _displayName: 'Ben', _geburtstag: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` });
    const A = await device({ cloud: true, user: 'Anna' });
    await clearPopups(A.page);
    let karte = false; for (let i = 0; i < 50 && !karte; i++) { karte = (await A.page.getByText('Heute hat Ben Geburtstag').count()) > 0; if (!karte) await sleep(100); }
    ok('Geburtstag: Karte „Heute hat Ben Geburtstag“', karte);
    await A.page.getByRole('button', { name: 'Menü', exact: true }).click(); await sleep(300);
    await A.page.getByRole('menuitem', { name: 'Idee einreichen' }).click(); await settle(A.page);
    await A.page.fill('textarea[aria-label="Deine Idee"]', 'Testidee').catch(() => {});
    await click(A.page.getByRole('button', { name: 'Idee einreichen' }).first()).catch(() => {}); await sleep(1500);
    const ideen = (await db('GET', '/progress/anna/_ideen')) || {};
    ok('Ideen-Box: Idee wird gespeichert', Object.values(ideen).some((x) => x && x.t === 'Testidee'));
    ok('Geburtstag/Ideen: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }
  // Ersatzweg: Live-Verbindung blockiert → Daten kommen trotzdem
  {
    const A = await device({ cloud: true, user: 'Anna', blockLive: true });
    let ok1 = false;
    for (let i = 0; i < 60 && !ok1; i++) { ok1 = await A.page.evaluate(() => (JSON.parse(localStorage.getItem('hinkel_cloud_backup') || '{}').scores || []).some((s) => s.id === 'b1')); if (!ok1) await sleep(100); }
    ok('Ersatzweg: ohne Live-Verbindung werden die Daten trotzdem geladen', ok1);
    ok('Ersatzweg: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }
}

(async () => {
  browser = await chromium.launch();
  try {
    await offlineTests();
    if (EMU) await cloudTests();
    else console.log('(Anmeldung und Live-Updates übersprungen: kein Firebase-Emulator, EMU nicht gesetzt)');
  } catch (e) {
    ok('Prüfung lief ohne Abbruch durch', false, e.message.split('\n')[0]);
  }
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length} von ${results.length} Prüfungen bestanden`);
  process.exit(failed.length ? 1 : 0);
})();
