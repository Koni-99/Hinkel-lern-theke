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
// Mehrere Teile laufen gleichzeitig (schneller). Jeder Teil sammelt seine Zeilen und gibt sie am Ende am Stück aus.
const { AsyncLocalStorage } = require('async_hooks');
const ausgabe = new AsyncLocalStorage();
const ok = (name, cond, info = '') => {
  results.push({ name, pass: !!cond });
  const zeile = `${cond ? 'OK    ' : 'FEHLER'}  ${name}${info ? `  (${info})` : ''}`;
  const puffer = ausgabe.getStore();
  if (puffer) puffer.push(zeile); else console.log(zeile);
};
/** Teile mit höchstens `gleichzeitig` Browsern zur selben Zeit abarbeiten. Ein Absturz in einem Teil stoppt die anderen nicht. */
async function abarbeiten(teile, gleichzeitig) {
  let naechster = 0;
  const arbeiter = async () => {
    while (naechster < teile.length) {
      const [name, fn] = teile[naechster++];
      const puffer = [];
      await ausgabe.run(puffer, async () => {
        try { await fn(); } catch (e) { ok(`${name}: lief ohne Abbruch durch`, false, String(e.message || e).split('\n')[0]); }
      });
      puffer.forEach((z) => console.log(z));
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, gleichzeitig) }, arbeiter));
}
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
/** App-Dateien kurz übersetzen und laden (für Rechen-Prüfungen ohne Browser) */
function kompiliere(dateien) {
  const path = require('path'), os = require('os'), fs = require('fs');
  const root = path.resolve(__dirname, '..'), out = fs.mkdtempSync(path.join(root, 'node_modules', '.lt-tsc-')); // im Projekt, damit react gefunden wird
  require('child_process').execFileSync(path.join(root, 'node_modules/.bin/tsc'), [...dateien, '--ignoreConfig', '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--esModuleInterop', '--jsx', 'react-jsx', '--rootDir', 'src'], { cwd: root });
  process.on('exit', () => { try { fs.rmSync(out, { recursive: true, force: true }); } catch {} });
  const res = {};
  dateien.forEach((f) => { const rel = f.replace(/^src\//, '').replace(/\.tsx?$/, ''); res[rel.replace(/\//g, '_')] = require(path.join(out, rel + '.js')); });
  return res;
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
  const teile = [];
  // Anmeldeseite
  teile.push(['Anmeldeseite', async () => {
    const d = await device();
    ok('Anmeldeseite zeigt das Namensfeld', (await d.page.locator('input[placeholder="z. B. Anna"]').count()) === 1);
    ok('Anmeldeseite ohne Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Alle Hauptseiten, Handy und PC, Mitarbeiter und Ausbilder
  for (const vp of [{ width: 1100, height: 900, n: 'PC' }, { width: 390, height: 844, n: 'Handy' }]) {
    for (const who of ['Anna', 'admin']) teile.push([`Hauptseiten ${vp.n}, ${who}`, async () => {
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
    }]);
  }
  // Eine ganze Quizrunde
  teile.push(['Eine ganze Quizrunde', async () => {
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
  }]);
  // Hör-Lernen: Seite geht auf, Auswahl und Abspiel-Knopf sind da
  teile.push(['Hör-Lernen: Seite geht auf, Auswahl und Abspiel-Knopf sind da', async () => {
    const d = await device({ user: 'Anna' });
    await click(nav(d.page).nth(1)); await settle(d.page);
    await click(d.page.locator('button.lt-card', { hasText: 'Hör-Lernen' }).first()); await settle(d.page);
    ok('Hör-Lernen: Seite mit Abspiel-Knopf', (await d.page.getByRole('button', { name: 'Vorlesen starten' }).count()) > 0 && (await d.page.getByRole('button', { name: /^Alles \(/ }).count()) > 0);
    ok('Hör-Lernen: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Anmeldung immer mit gelber Markise (Version 196)
  teile.push(['Anmeldung immer mit gelber Markise (Version 196)', async () => {
    const d = await device({ viewport: { width: 390, height: 844 } });
    const kl = await d.page.evaluate(() => document.querySelector('.lt-root')?.className || '');
    ok('Anmeldung: gelbe Markise (ohne Ähren-Kopf)', !!kl && !/lt-kopf-/.test(kl), kl);
    await d.ctx.close().catch(() => {});
  }]);
  // Aussehen (Version 187): hell ist Standard, „Backstube bei Nacht“ und Kopf mit Ähren wählbar
  teile.push(['Aussehen (Version 187): hell ist Standard, „Backstube bei Nacht“ und Kopf mit Ähren wählbar', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    const wurzel = () => d.page.evaluate(() => ({ root: document.querySelector('.lt-root')?.className || '', html: document.documentElement.className, bg: getComputedStyle(document.body).backgroundColor }));
    let w = await wurzel();
    ok('Aussehen: Standard ist hell mit Goldenen Ähren', !/lt-dark/.test(w.root) && /lt-kopf-aehren/.test(w.root) && !/lt-nacht/.test(w.html), w.root);
    await click(d.page.getByRole('button', { name: 'Menü' }).first());
    await click(d.page.getByRole('menuitem', { name: 'Aussehen' }).first()); await d.page.waitForTimeout(300);
    await click(d.page.locator('[aria-label="Aussehen"] button', { hasText: /^Markise\s*Gelbe/ }).first()); await d.page.waitForTimeout(200);
    const markise = (await wurzel()).root;
    ok('Aussehen: Kopf „Markise“ wählbar', !/lt-kopf-/.test(markise), markise);
    await click(d.page.locator('[aria-label="Aussehen"] button', { hasText: /^Goldene Ähren/ }).first()); await d.page.waitForTimeout(200);
    w = await wurzel();
    const buehne = await d.page.evaluate(() => { const b = document.querySelector('.lt-awning .lt-buehne'); return b ? getComputedStyle(b).display : 'fehlt'; });
    ok('Aussehen: Kopf „Goldene Ähren“ zeigt die Bühne', /lt-kopf-aehren/.test(w.root) && buehne === 'block', w.root + ' ' + buehne);
    await click(d.page.locator('[aria-label="Aussehen"] button', { hasText: 'Markise mit Ähren' }).first()); await d.page.waitForTimeout(200);
    w = await wurzel();
    ok('Aussehen: Kopf „Markise mit Ähren“', /lt-kopf-mitaehren/.test(w.root), w.root);
    await Promise.all([d.page.waitForEvent('load'), click(d.page.locator('[aria-label="Aussehen"] button', { hasText: 'Backstube bei Nacht' }).first())]);
    await settle(d.page); await d.page.waitForTimeout(800);
    w = await wurzel();
    ok('Aussehen: „Backstube bei Nacht“ macht die App dunkel, Kopf bleibt', /lt-dark/.test(w.root) && /lt-nacht/.test(w.html) && /lt-kopf-mitaehren/.test(w.root) && w.bg === 'rgb(20, 16, 12)', JSON.stringify(w));
    // Version 241: Tageskarte nachts hellbraun wie „Heute dran“ (Wunsch des Nutzers), Schrift hell
    const papier = await d.page.evaluate(() => { const m = document.querySelector('.lt-menu.lt-papier'); const z = m && m.querySelector('.lt-menu-row span span span'); return m ? [getComputedStyle(m).backgroundImage, z ? getComputedStyle(z).color : ''] : ['fehlt', '']; });
    const hellText = (papier[1].match(/\d+/g) || [0]).map(Number)[0] > 200;
    ok('Aussehen: Tageskarte nachts hellbraun mit heller Schrift', /rgb\(90, 56, 32\)/.test(papier[0]) && hellText, JSON.stringify(papier));
    await d.page.evaluate(() => { localStorage.setItem('lt_design', 'hell'); localStorage.setItem('lt_kopf', 'markise'); });
    await d.ctx.close().catch(() => {});
  }]);
  // Keine Gedankenstriche in sichtbaren Texten (Wunsch des Nutzers) und am PC keine große Lücke auf der Startseite (Version 201)
  teile.push(['Keine Gedankenstriche in sichtbaren Texten (Wunsch des Nutzers) und am PC keine große Lücke auf der Startseite (Version 201)', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 1300, height: 900 } });
    await clearPopups(d.page); await d.page.waitForTimeout(800);
    const hoehen = await d.page.evaluate(() => { const m = document.querySelector('.lt-home-main'), s = document.querySelector('.lt-home-side'); return m && s ? [m.getBoundingClientRect().height, s.getBoundingClientRect().height] : [0, 0]; });
    ok('Startseite am PC: beide Spalten fast gleich lang', hoehen[0] > 0 && Math.abs(hoehen[0] - hoehen[1]) < 300, hoehen.map(Math.round).join(' / '));
    // Version 227: Karten dürfen nicht dauernd zwischen den Spalten hin und her springen (Tablet quer flackerte)
    const wechsel = await d.page.evaluate(() => new Promise((res) => {
      const lies = () => [...document.querySelectorAll('.lt-blk')].map((e) => e.getAttribute('data-blk') + (e.closest('.lt-home-side') ? 'R' : 'L')).join(',');
      let last = lies(), n = 0;
      const t = setInterval(() => { const x = lies(); if (x !== last) { n++; last = x; } }, 30);
      setTimeout(() => { clearInterval(t); res(n); }, 3000);
    }));
    ok('Startseite am PC: Karten springen nicht hin und her', wechsel <= 1, `${wechsel} Wechsel in 3 s`);
    const striche = [];
    for (const seite of [() => click(nav(d.page).nth(0)), async () => { await click(d.page.getByRole('button', { name: 'Menü' }).first()); await click(d.page.getByRole('menuitem', { name: 'So funktioniert die Lern-Theke' }).first()); }]) {
      await seite(); await settle(d.page, 600);
      await d.page.evaluate(() => document.querySelectorAll('details').forEach((x) => { x.open = true; }));
      const t = await d.page.evaluate(() => document.body.innerText);
      for (const m of t.matchAll(/.{0,30}(–|—|\s-\s).{0,30}/g)) striche.push(m[0]);
    }
    ok('Keine Gedankenstriche in sichtbaren Texten (Startseite, Hilfe)', striche.length === 0, striche.slice(0, 3).join(' | '));
    await d.ctx.close();
  }]);
  // Theken-Simulator wie ein echtes Gespräch (Version 202): fremde Kunden ohne Namen, keine Millimeter-Fragen
  teile.push(['Theken-Simulator wie ein echtes Gespräch (Version 202): fremde Kunden ohne Namen, keine Millimeter-Fragen', async () => {
    const G = kompiliere(['src/games/theke/gespraech.tsx']).games_theke_gespraech;
    let fehler = [];
    for (let i = 0; i < 150; i++) {
      const c = G.buildConversation();
      const bekannt = /Stammkund/i.test(c.persona.who);
      for (const st of c.steps) {
        if (/millimeter|wie dünn|wie dick/i.test(st.customer.join(' '))) fehler.push('Kunde fragt nach Millimetern: ' + st.customer.join(' '));
        const ok = st.options.find((o) => o.correct);
        if (!bekannt && ok && /(Frau|Herr) [A-ZÄÖÜ]/.test(ok.text)) fehler.push('Fremder Kunde mit Namen angesprochen: ' + ok.text);
        if (ok && /–/.test(ok.text)) fehler.push('Gedankenstrich: ' + ok.text);
      }
      if (!bekannt && /^(Frau|Herr) /.test(c.persona.name)) fehler.push('Fremder Kunde hat einen Namen: ' + c.persona.name);
      // Ablauf wie an der echten Theke: erst „Sonst noch was?“, dann der Preis, dann bezahlen
      const t = c.steps.map((x) => x.topic);
      const iZ = t.indexOf('Zusatzverkauf'), iS = t.indexOf('Summe'), iP = t.findIndex((x) => ['Rückgeld', 'Kartenzahlung', 'Trinkgeld'].includes(x));
      if (iZ < 0 || iS < 0 || !(iZ < iS && iS < iP)) fehler.push('Reihenfolge stimmt nicht: ' + t.join(' > '));
      if (iZ >= 0 && iS >= 0) {
        const angebot = (c.steps[iZ].options.find((o) => o.correct) || {}).text || '';
        const m = angebot.match(/Noch ein paar (.+) dazu\?/);
        if (m && !c.steps[iS].customer.join(' ').includes(m[1])) fehler.push('Angebot und Antwort passen nicht: ' + angebot + ' / ' + c.steps[iS].customer.join(' '));
      }
    }
    ok('Theken-Simulator: echte Gespräche (fremde Kunden ohne Namen, keine Millimeter-Fragen)', fehler.length === 0, fehler.slice(0, 2).join(' | '));
  }]);
  // Extras im Quiz (Version 198): Glücksfrage nach 5 richtigen, Wissens-Pause, Küken-Geheimnis
  teile.push(['Extras im Quiz (Version 198): Glücksfrage nach 5 richtigen, Wissens-Pause, Küken-Geheimnis', async () => {
    const Q = kompiliere(['src/daten/questions.ts']).daten_questions;
    // Schlüssel = Fragetext + alle Antworten (es gibt Fragen mit gleichem Text, aber anderen Antworten)
    const schluessel = (frage, antworten) => `${frage.trim()}|${antworten.map((t) => String(t).replace(/^[A-D]\n/, '').trim()).sort().join('|')}`;
    const richtig = new Map(); (Q.questions || []).forEach((q) => { if (!(Array.isArray(q.correctMulti) && q.correctMulti.length > 1)) richtig.set(schluessel(q.question, q.options), q.options[q.correct]); });
    const d = await device({ user: 'Anna' });
    await clearPopups(d.page);
    // Küken-Geheimnis: Küken neben „Wusstest du?“ antippen
    await click(d.page.locator('.lt-fact-kueken').first()); await d.page.waitForTimeout(300);
    ok('Startseite: Küken antippen zeigt ein Küken-Geheimnis', (await d.page.locator('.lt-fact-from', { hasText: 'Küken-Geheimnis' }).count()) > 0);
    await click(nav(d.page).nth(1)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible').first()); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible').first()); await settle(d.page);
    let lauf = 0, glueck = false, beantwortet = 0;
    for (let i = 0; i < 40 && !glueck; i++) {
      const opts = d.page.locator('button.lt-qopt:visible');
      if (!(await opts.count())) break;
      if (lauf >= 5 && (await d.page.locator('.lt-gluecksfrage').count())) { glueck = true; break; }
      const frage = (await d.page.locator('.lt-frage').first().innerText()).trim();
      const texte = await opts.allInnerTexts();
      const ziel = richtig.get(schluessel(frage, texte));
      const genau = ziel ? texte.findIndex((t) => t.replace(/^[A-D]\s*/, '').trim() === String(ziel).trim()) : -1;
      const idx = genau >= 0 ? genau : ziel ? texte.findIndex((t) => t.includes(String(ziel))) : -1;
      await click(opts.nth(idx >= 0 ? idx : 0)); await settle(d.page, 250); beantwortet++;
      // warten, bis die Antwort ausgewertet ist (bei voll ausgelastetem Rechner dauert das länger)
      await d.page.locator('.lt-qcard.lt-ans-ok, .lt-qcard.lt-ans-bad').first().waitFor({ timeout: 5000 }).catch(() => {});
      lauf = (await d.page.locator('.lt-qcard.lt-ans-ok').count()) ? lauf + 1 : 0;
      if (process.env.DEBUG && !lauf) console.log('DEBUG falsch:', frage.slice(0, 60), '| ziel', ziel, '| texte', JSON.stringify(texte));
      const next = d.page.locator('button.lt-sticky-next:visible');
      if (!(await next.count())) break;
      await click(next.first()); await settle(d.page, 250);
    }
    ok('Quiz: nach 5 richtigen in Folge kommt eine Glücksfrage', glueck, `${beantwortet} beantwortet, Lauf ${lauf}`);
    // Runde zu Ende spielen: Kassenbon mit Wissens-Pause
    for (let i = 0; i < 40; i++) {
      const opts = d.page.locator('button.lt-qopt:visible');
      if (!(await opts.count())) break;
      await click(opts.first()); await settle(d.page, 250);
      const next = d.page.locator('button.lt-sticky-next:visible');
      if (!(await next.count())) break;
      await click(next.first()); await settle(d.page, 250);
    }
    await settle(d.page, 800);
    ok('Quiz: Kassenbon zeigt eine Wissens-Pause', (await d.page.locator('.lt-wissenspause').count()) > 0);
    ok('Quiz: Kassenbon zeigt den Punkte-Bonus ×1,5', (await d.page.getByText(/Punkte-Bonus ×1,5/i).count()) > 0);
    ok('Quiz-Extras: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Hilfe für Neue: Orientierung und neue Funktionen erklärt, Einführung mit 7 Seiten
  teile.push(['Hilfe für Neue: Orientierung und neue Funktionen erklärt, Einführung mit 7 Seiten', async () => {
    const d = await device({ user: 'Anna' });
    await click(d.page.getByRole('button', { name: 'Menü' }).first());
    await click(d.page.getByRole('menuitem', { name: 'So funktioniert die Lern-Theke' }).first()); await settle(d.page);
    const themen = ['Wo finde ich was?', 'Trinkgeld und Laden', 'Steckbriefe der Produkte', 'Lernpfad', 'Kundenfragen und Verkaufstipps', 'Lob, Umfragen und wichtige Nachrichten', 'Hör-Lernen und eigene Notizen', 'Ideen-Box, Kundenstimmen, Geburtstag', 'Persönliche Nachrichten', 'Englisch für die Theke', 'Mein Monat', 'Aussehen: hell oder dunkel', 'Extras im Quiz', 'Theken-Simulator', 'Ofen-Kette', 'Urlaub', 'Ausbildung (für Azubis)', 'Rechen-Trainer und Prüfung', 'Für den Ausbilder: Zu erledigen', 'Für den Ausbilder: Start-Übersicht, Rückblick und Sortiment', 'Was die App speichert', 'Ohne Internet'];
    const fehlt = [];
    for (const t of themen) if (!(await d.page.getByText(t, { exact: true }).count())) fehlt.push(t);
    ok('Hilfe: neue Themen für Neue da', fehlt.length === 0, fehlt.join(', '));
    await click(d.page.getByRole('button', { name: /Einführung noch einmal ansehen/ }).first()); await d.page.waitForTimeout(400);
    let seiten = 1, titel = [];
    for (let i = 0; i < 10; i++) {
      titel.push(await d.page.locator('[aria-label="Kurze Einführung"]').innerText().catch(() => ''));
      const weiter = d.page.locator('[aria-label="Kurze Einführung"] button', { hasText: 'Weiter' });
      if (!(await weiter.count())) break;
      await click(weiter.first()); await d.page.waitForTimeout(250); seiten++;
    }
    ok('Einführung: 7 Seiten mit „Wo finde ich was?“ und „Gemeinsam im Team“', seiten === 7 && titel.some((t) => t.includes('Wo finde ich was?')) && titel.some((t) => t.includes('Gemeinsam im Team')), `${seiten} Seiten`);
    ok('Hilfe: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Trinkgeld-Laden: Antippen zeigt erst die Vorschau am Namen, gekauft wird erst mit „Kaufen“
  teile.push(['Trinkgeld-Laden: Antippen zeigt erst die Vorschau am Namen, gekauft wird erst mit „Kaufen“', async () => {
    const d = await device({ user: 'Anna' });
    await click(d.page.locator('[title="Trinkgeld-Laden öffnen"]').first()); await settle(d.page, 600);
    await click(d.page.locator('.lt-shelf .lt-shop-item').first()); await settle(d.page, 400);
    const vorschau = await d.page.getByText('So sieht es bei dir aus').count() > 0;
    if (process.env.SHOT2) await d.page.screenshot({ path: process.env.SHOT2 });
    await click(d.page.getByRole('button', { name: 'Doch nicht' }).first()); await settle(d.page, 300);
    const zu = await d.page.getByText('So sieht es bei dir aus').count() === 0;
    ok('Laden: Vorschau am Namen vor dem Kauf', vorschau && zu, `Vorschau ${vorschau}, wieder zu ${zu}`);
    ok('Laden: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Zurück-Taste des Handys: eine Seite zurück, Steckbrief schließen, App nicht verlassen
  teile.push(['Zurück-Taste des Handys: eine Seite zurück, Steckbrief schließen, App nicht verlassen', async () => {
    const d = await device({ user: 'Anna' });
    const titel = async () => (await d.page.locator('main h1').first().innerText().catch(() => '')).trim();
    await click(nav(d.page).nth(1)); await settle(d.page, 500);
    const lernen = await titel();
    await click(nav(d.page).nth(3)); await settle(d.page, 500);
    await d.page.goBack(); await settle(d.page, 600);
    const zurueck1 = (await titel()) === lernen;
    await click(nav(d.page).nth(3)); await settle(d.page, 500);
    await click(d.page.locator('main button:visible').first()); await settle(d.page, 800);
    const karte = d.page.locator('.lt-foto-raster button').first();
    let sheetZu = false;
    if (await karte.count()) {
      await click(karte); await settle(d.page, 500);
      const auf = await d.page.locator('.fc-sheet').count();
      const galerie = await d.page.locator('.lt-galerie img').count();
      ok('Steckbrief: mehrere Shop-Fotos zum Wischen', galerie >= 2, `${galerie} Fotos`);
      await d.page.goBack(); await settle(d.page, 500);
      sheetZu = auf > 0 && (await d.page.locator('.fc-sheet').count()) === 0 && (await d.page.locator('.lt-foto-raster').count()) > 0;
    }
    ok('Zurück-Taste: eine Seite zurück und Steckbrief schließen', zurueck1 && sheetZu, `Seite ${zurueck1}, Steckbrief ${sheetZu}`);
    // Neu laden: man bleibt auf der Seite, auf der man war
    await click(nav(d.page).nth(2)); await settle(d.page, 500);
    const vorher = await titel();
    await d.page.reload(); await settle(d.page, 2500);
    const nachher = await titel();
    ok('Neu laden: bleibt auf der gleichen Seite', vorher.length > 0 && vorher === nachher, `vorher „${vorher}“, nachher „${nachher}“`);
    ok('Zurück-Taste: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Mein Monat: Seite geht auf (Menü) und die Rechnung stimmt
  teile.push(['Mein Monat: Seite geht auf (Menü) und die Rechnung stimmt', async () => {
    const d = await device({ user: 'Anna' });
    await click(d.page.getByRole('button', { name: 'Menü' }).first());
    await click(d.page.getByRole('menuitem', { name: 'Mein Monat' }).first()); await settle(d.page);
    ok('Mein Monat: Seite mit Monatsauswahl', (await d.page.getByRole('heading', { name: 'Mein Monat' }).count()) > 0 && (await d.page.getByRole('button', { name: /dieser Monat/ }).count()) > 0);
    ok('Mein Monat: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
    const M = kompiliere(['src/hilfen/meinMonat.ts']).hilfen_meinMonat;
    const heute = new Date(); const tt = (tag, mo = 0) => { const x = new Date(heute.getFullYear(), heute.getMonth() - mo, tag); return `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}.${String(x.getFullYear()).slice(2)}`; };
    const mk = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}`;
    const scores = [
      { username: 'Anna', score: 100, date: tt(1), category: 'Quiz: Fachwissen' }, { username: 'Anna', score: 50, date: tt(1), category: 'Bilderquiz' },
      { username: 'Anna', score: 30, date: tt(2), category: 'Quiz: Service' }, { username: 'Ben', score: 500, date: tt(1), category: 'Quiz' },
      { username: 'Anna', score: 80, date: tt(5, 1), category: 'Quiz' }, { username: 'Anna', score: 999, date: tt(1), category: 'Bonus vom Ausbilder' },
    ];
    const r = M.monatsDaten({ mo: mk, ich: 'anna', scores, tage: [`${mk}-01`, `${mk}-02`], snap: { mo: mk, m: 10 }, gemeistertJetzt: 14 });
    ok('Mein Monat: Rechnung (Punkte, Platz, Tage, Lieblings-Spiel, neu gemeistert)', r.punkte === 180 && r.punkteVormonat === 80 && r.platz === 2 && r.mitspieler === 2 && r.lerntage === 2 && r.lieblingsSpiel === 'Quiz' && r.neuGemeistert === 4 && r.runden === 3 && r.besterTag && r.besterTag.punkte === 150, JSON.stringify(r));
    const s1 = M.neuerMonatSnap({ mo: '2020-01', m: 3 }, 9); const s2 = M.neuerMonatSnap({ mo: mk, m: 3 }, 9);
    ok('Mein Monat: Monats-Stand nur einmal pro Monat', s1 && s1.mo === mk && s1.m === 9 && !s1.vorher && s2 === null);
  }]);
  // Hör-Lernen mit natürlicher Stimme: Tondateien werden abgespielt (Test-Töne statt echter Dateien)
  teile.push(['Hör-Lernen mit natürlicher Stimme: Tondateien werden abgespielt (Test-Töne statt echter Dateien)', async () => {
    const keys = stimmeKeys();
    // Version 215: zu jeder Frage und Antwort gibt es eine echte Tondatei (vier Stimmen im Wechsel)
    {
      const fs = require('fs'), path = require('path');
      const dir = path.resolve(__dirname, '../public/stimme');
      const liste = new Set(JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')));
      const fehlt = keys.filter((k) => !liste.has(k) || !fs.existsSync(path.join(dir, k + '.mp3')));
      ok(`Hör-Lernen: Tondateien für alle ${keys.length} Texte vorhanden`, fehlt.length === 0, `${fehlt.length} fehlen (Werkzeug: node tools/stimme/erzeugen.mjs)`);
    }
    const ctxRoute = async (ctx) => {
      await ctx.route(/\/stimme\/index\.json/, (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(keys) }));
      await ctx.route(/\/stimme\/[0-9a-f]+\.mp3/, (r) => { tonAbrufe++; r.fulfill({ contentType: 'audio/wav', body: stilleWav() }); });
    };
    let tonAbrufe = 0;
    const d = await device({ user: 'Anna', vorher: ctxRoute });
    await click(nav(d.page).nth(1)); await settle(d.page);
    await click(d.page.locator('button.lt-card', { hasText: 'Hör-Lernen' }).first()); await settle(d.page);
    await click(d.page.getByRole('button', { name: 'Vorlesen starten' }).first());
    // bis zu 20 s warten (bei gleichzeitig laufenden Teilen ist der Rechner langsamer), meist reichen 5 bis 9 s
    for (let i = 0; i < 80 && tonAbrufe < 2; i++) await d.page.waitForTimeout(250);
    ok('Hör-Lernen: spielt Tondateien ab (Frage und Antwort)', tonAbrufe >= 2, `${tonAbrufe} Tondateien geladen`);
    await click(d.page.getByRole('button', { name: 'Vorlesen anhalten' }).first());
    ok('Hör-Lernen mit Tondateien: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Alle Spiele öffnen und ein paar Mal klicken
  teile.push(['Alle Spiele öffnen und ein paar Mal klicken', async () => {
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
  }]);
  // Theken-Simulator (Version 208): neue Situationen und Zuhören (Kunde spricht, Text verdeckt bis antippen)
  teile.push(['Theken-Simulator (Version 208): neue Situationen und Zuhören (Kunde spricht, Text verdeckt bis antippen)', async () => {
    const G = kompiliere(['src/games/theke/gespraech.tsx']).games_theke_gespraech;
    const neu = ['Vorbestellung abholen', 'Falsche Ware bekommen', 'Allergene bei Saisonware'];
    const fehlt = neu.filter((t) => { for (let i = 0; i < 20; i++) { if (G.buildConversation(t).steps.some((s) => s.topic === t)) return false; } return true; });
    ok('Theken-Simulator: neue Situationen (Abholung, falsche Ware, Saison-Allergene)', fehlt.length === 0, fehlt.join(', '));
    const d = await device({ user: 'Anna' });
    await d.page.addInitScript(() => { window.__gesagt = []; const S = window.speechSynthesis; if (S) { S.speak = (u) => { window.__gesagt.push(u.text); setTimeout(() => u.onend && u.onend(), 10); }; } });
    let bausteinAbrufe = 0; d.page.on('request', (rq) => { if (/\/stimme\/teile\/[0-9a-f]+\.mp3/.test(rq.url())) bausteinAbrufe++; });
    await d.page.reload(); await settle(d.page); await clearPopups(d.page);
    await click(nav(d.page).nth(2)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible', { hasText: 'Theken-Simulator' }).first()); await settle(d.page, 1200);
    const schalter = d.page.locator('button.lt-hoeren-schalter');
    ok('Theken-Simulator: Schalter „Zuhören“ da', (await schalter.count()) > 0);
    if (await schalter.count()) {
      await click(schalter); await settle(d.page, 300);
      await click(d.page.getByRole('button', { name: 'Ersten Kunden bedienen' })); await settle(d.page, 1200);
      const zu = d.page.locator('button.lt-hoer-zu');
      // Beginnt das Gespräch nur mit einer Beschreibung, gibt es noch nichts zu hören: erst antworten
      for (let k = 0; k < 4 && !(await zu.count()); k++) { await click(d.page.locator('main button', { has: d.page.locator('span', { hasText: /^A$/ }) }).first()); await settle(d.page, 2200); }
      await settle(d.page, 800);
      const gesagt = (await d.page.evaluate(() => window.__gesagt.length)) + bausteinAbrufe; // Handy-Stimme oder natürliche Bausteine
      ok('Zuhören: Kunde spricht, Satz verdeckt', (await zu.count()) > 0 && gesagt > 0, `verdeckt ${await zu.count()}, gesprochen ${gesagt}`);
      if (await zu.count()) { await click(zu.first()); await settle(d.page, 300); }
      ok('Zuhören: Antippen zeigt den Satz', (await zu.count()) === 0 && (await d.page.getByRole('button', { name: 'Nochmal hören' }).count()) > 0);
    }
    ok('Theken-Simulator mit Zuhören: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Nachschlagen und Karteikarten
  teile.push(['Nachschlagen und Karteikarten', async () => {
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
  }]);
  // Englisch-Wörterbuch: neue Bereiche für den Verkauf
  teile.push(['Englisch-Wörterbuch: neue Bereiche für den Verkauf', async () => {
    const d = await device({ user: 'Anna' });
    await click(nav(d.page).nth(3)); await settle(d.page);
    let gefunden = false;
    const n = await d.page.locator('main button:visible').count();
    for (let e = 0; e < n && !gefunden; e++) {
      await click(nav(d.page).nth(3)); await settle(d.page, 400);
      await click(d.page.locator('main button:visible').nth(e)); await settle(d.page, 400);
      const tab = d.page.getByRole('button', { name: 'Wörterbuch Englisch' });
      if (await tab.count()) { await click(tab.first()); await settle(d.page, 400); gefunden = true; }
    }
    const bereiche = ['Das sagen Kunden', 'Bezahlen', 'Zahlen & Mengen'];
    const fehlt = [];
    for (const b of bereiche) if (!(await d.page.getByRole('button', { name: new RegExp('^' + b.replace('&', '\\&')) }).count())) fehlt.push(b);
    ok('Wörterbuch: Bereiche „Das sagen Kunden“, „Bezahlen“, „Zahlen & Mengen“', gefunden && fehlt.length === 0, gefunden ? fehlt.join(', ') : 'Wörterbuch nicht gefunden');
    ok('Wörterbuch: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Ohne Internet: App geht auf (Service Worker hat die Dateien gespeichert)
  teile.push(['Ohne Internet: App geht auf (Service Worker hat die Dateien gespeichert)', async () => {
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
  }]);
  // Version 214: „... haben heute schon gelernt“ aufklappen, alle Namen sehen
  teile.push(['Version 214: „... haben heute schon gelernt“ aufklappen, alle Namen sehen', async () => {
    const heute = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    ['Claudia', 'Koni', 'Mia', 'Tom'].forEach((n) => { probe.progress[n.toLowerCase()] = { ...(probe.progress[n.toLowerCase()] || {}), _displayName: n, _days: [heute] }; });
    const d = await device({ user: 'Anna', backup: probe });
    await clearPopups(d.page);
    const knopf = d.page.locator('.lt-team-knopf');
    const tagFormatOk = (await knopf.count()) > 0;
    if (tagFormatOk) { await click(knopf.first()); await settle(d.page, 400); }
    const liste = tagFormatOk ? await d.page.locator('.lt-team-liste').innerText().catch(() => '') : '';
    ok('Startseite: „heute gelernt“ aufklappen zeigt alle Namen', ['Claudia', 'Koni', 'Mia', 'Tom'].every((n) => liste.includes(n)), liste.replace(/\n/g, ' ').slice(0, 120) || 'keine Zeile (Tagesformat?)');
    ok('Startseite aufklappen: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 216: natürliche Kundenstimme aus Bausteinen (Theken-Simulator, Telefon): fast jeder Satz ist abgedeckt
  teile.push(['Version 216: natürliche Kundenstimme aus Bausteinen (Theken-Simulator, Telefon): fast jeder Satz ist abgedeckt', async () => {
    const fs = require('fs'), path = require('path');
    const M = kompiliere(['src/games/theke/gespraech.tsx', 'src/games/telefonLogik.ts', 'src/hilfen/bausteine.ts']);
    const G = M.games_theke_gespraech, T = M.games_telefonLogik, B = M.hilfen_bausteine;
    const idx = new Set(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/stimme/teile/index.json'), 'utf8')));
    const abgedeckt = (text, st) => B.zerlege(text).every((t) => idx.has(B.teilKey(B.KUNDEN_STIMMEN[st], t)));
    let saetze = 0, ok1 = 0;
    for (let i = 0; i < 400; i++) {
      const c = G.buildConversation();
      for (const s of c.steps) { const t = s.customer.join(' '); if (!B.zerlege(t).length) continue; saetze++; if (abgedeckt(t, i % 2 ? 'frau' : 'mann')) ok1++; }
    }
    let anrufe = 0, ok2 = 0;
    for (let i = 0; i < 300; i++) { const b = T.neueBestellung(T.STUFEN_RUNDE[i % 5], new Set()); anrufe++; if (abgedeckt(b.text.join(' '), i % 2 ? 'frau' : 'mann')) ok2++; }
    ok('Natürliche Stimme: Theken-Simulator, mind. 97 % der Kundensätze aus Bausteinen', ok1 / saetze >= 0.97, `${ok1} von ${saetze}`);
    ok('Natürliche Stimme: Telefon-Bestellung, mind. 99 % der Anrufe aus Bausteinen', ok2 / anrufe >= 0.99, `${ok2} von ${anrufe}`);
    ok('Bausteine: Menge und Produkt bleiben zusammen', B.zerlege('Und zwar 12 Laugenstangen, einmal Münsterländer, geschnitten, und 3 Berliner.').join('|') === 'Und zwar|12 Laugenstangen|einmal Münsterländer|geschnitten, und|3 Berliner', B.zerlege('Und zwar 12 Laugenstangen, einmal Münsterländer, geschnitten, und 3 Berliner.').join('|'));
  }]);
  // Version 217: Vorlesen mit natürlicher Stimme (Steckbrief, Produktkarte, Bilderquiz, Schneide-Profi), Lernkarten mit Hör-Lernen-Dateien
  teile.push(['Version 217: Vorlesen mit natürlicher Stimme (Steckbrief, Produktkarte, Bilderquiz, Schneide-Profi), Lernkarten mit Hör-Lernen-Dateien', async () => {
    const fs = require('fs'), path = require('path');
    const M = kompiliere(['src/hilfen/vorlesen.ts', 'src/daten/shopProducts.ts']);
    const V = M.hilfen_vorlesen, P = M.daten_shopProducts.SHOP_PRODUCTS;
    const idx = new Set(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/stimme/saetze/index.json'), 'utf8')));
    const fehlt = [];
    for (const sp of P) for (const t of [V.steckbriefText(sp), V.bilderText(sp)]) V.saetze(t).forEach((x) => { if (!idx.has(V.satzKey(x))) fehlt.push(x); });
    ok('Natürliche Stimme: Steckbrief und Bilderquiz, alle Sätze vorhanden', fehlt.length === 0, fehlt.slice(0, 2).join(' | '));
    const fehltK = []; for (const sp of P) V.saetze(V.produktKarteVorne(sp.name)).forEach((x) => { if (!idx.has(V.satzKey(x))) fehltK.push(x); });
    ok('Natürliche Stimme: Lernkarte vorne (Name und Frage), alle Sätze vorhanden, ohne „…“', fehltK.length === 0 && !/…/.test(V.produktKarteVorne('Test')), fehltK.slice(0, 2).join(' | '));
    const Qz = kompiliere(['src/daten/questions.ts']).daten_questions;
    const fehltQ = [];
    [...(Qz.questions || []), ...(Qz.examQuestions || [])].forEach((q) => V.saetze(V.quizVorherText(q.question, q.options)).forEach((x) => { if (!idx.has(V.satzKey(x))) fehltQ.push(x); }));
    ok('Natürliche Stimme: Quiz vorlesen (Frage und Antwort-Möglichkeiten), alle Sätze vorhanden', fehltQ.length === 0, `${fehltQ.length} fehlen: ${fehltQ.slice(0, 2).join(' | ')}`);
    ok('Vorlesen: Sätze ohne Satzzeichen am Ende', V.saetze('Das ist Feinbrot. Warengruppe: Brot.').join('|') === 'Das ist Feinbrot|Warengruppe: Brot');
  }]);
  // Version 220: Startseite kürzer: Team-Challenge kompakt (aufklappbar), Statistik + Lern-Bon + Fortschritt in „Deine Zahlen“
  teile.push(['Version 220: Startseite kürzer: Team-Challenge kompakt (aufklappbar), Statistik + Lern-Bon + Fortschritt in „Deine Zahlen“', async () => {
    const d = await device({ user: 'Anna' });
    await clearPopups(d.page);
    const zahlen = d.page.locator('details.lt-zahlen');
    const zu = (await zahlen.count()) > 0 && !(await zahlen.evaluate((e) => e.open));
    if (await zahlen.count()) { await click(zahlen.locator('summary')); await settle(d.page, 400); }
    const inhalt = (await zahlen.innerText().catch(() => '')) || '';
    ok('Startseite: „Deine Zahlen“ zugeklappt, enthält Statistik, Lern-Bon und Serie', zu && /Deine Statistik/.test(inhalt) && /BÄCKEREI HINKEL/.test(inhalt) && /Lern-Serie/i.test(inhalt), inhalt.slice(0, 80));
    const team = d.page.locator('details.lt-teamgoal');
    ok('Startseite: Team-Challenge kompakt mit Balken, Erklärung zum Aufklappen', (await team.count()) > 0 && (await team.locator('summary [role=progressbar]').count()) === 1);
    ok('Startseite neu: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 221: Tüten-Blitz: Produktname passt am Handy in die Karte, Punkte begrenzt (1 pro Tüte, ab 10 in Folge 2)
  teile.push(['Version 221: Tüten-Blitz: Produktname passt am Handy in die Karte, Punkte begrenzt (1 pro Tüte, ab 10 in Folge 2)', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 360, height: 780 } });
    await clearPopups(d.page);
    await click(nav(d.page).nth(2)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible', { hasText: 'Tüten-Blitz' }).first()); await settle(d.page, 800);
    await click(d.page.getByRole('button', { name: /Tüten-Blitz starten/ })); await settle(d.page, 600);
    let gesehen = 0;
    let zuBreit = 0, punkte = 0;
    for (let i = 0; i < 25; i++) {
      const name = d.page.locator('main div', { hasText: /.+/ }).filter({ has: d.page.locator('xpath=self::*[contains(@style,"clamp(24px")]') });
      const breit = await d.page.evaluate(() => { const el = [...document.querySelectorAll('main div')].find((e) => (e.getAttribute('style') || '').includes('clamp(24px')); return el ? el.scrollWidth - el.clientWidth : 0; });
      if (breit > 1) zuBreit++;
      if (await d.page.evaluate(() => [...document.querySelectorAll('main div')].some((e) => (e.getAttribute('style') || '').includes('clamp(24px')))) gesehen++;
      const knopf = d.page.locator('main button:visible', { hasText: /Nach (oben|unten)/ });
      if (!(await knopf.count())) break;
      await click(knopf.nth(i % 2)); await settle(d.page, 350);
      void name;
    }
    punkte = Number((await d.page.locator('main').innerText()).match(/Punkte\s*(\d+)/)?.[1] || 0);
    ok('Tüten-Blitz: Produktname passt am Handy in die Karte', gesehen >= 10 && zuBreit === 0, `${gesehen} Produkte gesehen, ${zuBreit} mal zu breit`);
    ok('Tüten-Blitz: Punkte begrenzt (höchstens 2 pro Tüte)', punkte > 0 && punkte <= 50, `${punkte} Punkte nach 25 Tüten`);
    ok('Tüten-Blitz: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 226: Laden-Extras (Serien-Schutz, Geschenke, Sammel-Sets) ohne Browser prüfen
  teile.push(['Version 226: Laden-Extras (Serien-Schutz, Geschenke, Sammel-Sets) ohne Browser prüfen', async () => {
    const M = kompiliere(['src/hilfen/geschenke.ts', 'src/basis/serie.tsx', 'src/basis/laden.tsx']);
    const S = M.basis_serie, G = M.hilfen_geschenke, L = M.basis_laden;
    const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return S.dayKey(d); };
    // Lerntage: vorgestern und davor, gestern verpasst (Sonntage zählen nicht)
    const arbeitstage = []; { const d = new Date(); while (arbeitstage.length < 6) { d.setDate(d.getDate() - 1); if (d.getDay() !== 0) arbeitstage.push(S.dayKey(new Date(d))); } }
    const gelernt = arbeitstage.slice(1, 5); const verpasst = arbeitstage[0];
    const ohne = S.computeStreak(gelernt).current, mit = S.computeStreak(gelernt, [verpasst]).current;
    ok('Serien-Schutz: geschützter Tag hält die Serie (zählt aber nicht mit)', ohne === 0 && mit === 4, `ohne ${ohne}, mit ${mit}`);
    const curr = { progress: { anna: { _displayName: 'Anna', _days: gelernt, _jokersSchutz: 1 } } };
    G.schutzEinsetzen('anna', 'Anna')(curr);
    ok('Serien-Schutz: wird automatisch eingesetzt und verbraucht 1 Joker', curr.progress.anna._jokersSchutz === 0 && curr.progress.anna._schutzTage.includes(verpasst), JSON.stringify(curr.progress.anna._schutzTage));
    const zwei = { progress: { ben: { _days: arbeitstage.slice(2, 5), _jokersSchutz: 1 } } };
    G.schutzEinsetzen('ben', 'Ben')(zwei);
    ok('Serien-Schutz: 2 verpasste Tage mit nur 1 Joker: nichts verbraucht', zwei.progress.ben._jokersSchutz === 1 && !zwei.progress.ben._schutzTage);
    const c2 = { progress: { anna: { _displayName: 'Anna', _tipCents: 1000, _tipSpent: 0 }, ben: { _displayName: 'Ben' } } };
    for (let i = 0; i < 4; i++) G.geschenkSchicken('anna', 'Anna', 'ben', 'Ben', 'j_los', Date.now() + i)(c2);
    ok('Geschenk: höchstens 3 am Tag, bezahlt mit Trinkgeld', Object.keys(c2.progress.anna._geschenke).length === 3 && c2.progress.anna._tipSpent === 150, `${Object.keys(c2.progress.anna._geschenke || {}).length} Geschenke, ${c2.progress.anna._tipSpent} Cent`);
    G.offeneGeschenke(c2.progress, 'ben').forEach((g) => G.geschenkAnnehmen('ben', 'Ben', g)(c2));
    G.offeneGeschenke(c2.progress, 'ben').forEach((g) => G.geschenkAnnehmen('ben', 'Ben', g)(c2));
    ok('Geschenk: Beschenkter bekommt jedes Los genau einmal', c2.progress.ben._jokersLos === 3 && G.offeneGeschenke(c2.progress, 'ben').length === 0, `${c2.progress.ben._jokersLos} Lose`);
    const st = L.setStand(['a_brot', 'a_brezel', 'a_croissant', 'a_baguette', 'a_aehre', 'a_keks']);
    ok('Sammel-Sets: Brotkorb voll, Süße Theke nicht', st.find((x) => x.id === 'brot').voll && !st.find((x) => x.id === 'suess').voll);
    const torte = L.TIP_SHOP.find((i) => i.id === 'a_torte');
    ok('Laden: keine Torte mehr (jetzt Berliner), viele neue Teile', torte.label === 'Berliner' && !L.TIP_SHOP.some((i) => /Torte/.test(i.label)) && L.TIP_SHOP.length >= 70, `${L.TIP_SHOP.length} Teile`);
  }]);
  // Version 228: Steckbrief im dunklen Design: dunkle Schrift auf dem gelben Kopf, Allergen-Kästchen ohne Überstand
  teile.push(['Version 228: Steckbrief im dunklen Design: dunkle Schrift auf dem gelben Kopf, Allergen-Kästchen ohne Überstand', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 1000, height: 667 }, vorher: async (ctx) => ctx.addInitScript(() => { if (sessionStorage.getItem('__v228')) return; sessionStorage.setItem('__v228', '1'); localStorage.setItem('lt_design', 'nacht'); sessionStorage.setItem('lt_seite', 'nachschlagen'); }) });
    await clearPopups(d.page);
    const k = d.page.locator('button, [role=button], .lt-card', { hasText: /Steckbriefe/ }).first();
    if (await k.count()) { await click(k); await settle(d.page, 600); }
    await click(d.page.getByText('Abendschnitte', { exact: true }).first()); await settle(d.page, 800);
    const info = await d.page.evaluate(() => {
      const kopf = document.querySelector('.lt-sb-kopf');
      const titel = kopf ? kopf.querySelector('div > div') : null;
      const rgb = titel ? getComputedStyle(titel).color.match(/\d+/g).map(Number) : [255, 255, 255];
      const ueber = [...document.querySelectorAll('.lt-allergen')].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
      return { hell: (rgb[0] + rgb[1] + rgb[2]) / 3, ueber, n: document.querySelectorAll('.lt-allergen').length };
    });
    ok('Steckbrief nachts: Name auf dem gelben Kopf in dunkler Schrift', info.hell < 90, `Helligkeit ${Math.round(info.hell)}`);
    ok('Steckbrief: Allergen-Kästchen ohne überstehenden Text', info.n > 0 && info.ueber === 0, `${info.ueber} von ${info.n} stehen über`);
    ok('Steckbrief nachts: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 229: Laden-Neuheiten ohne Browser (Tüte, Wochen-Teile, Teigi, Schrift am Namen)
  teile.push(['Version 229: Laden-Neuheiten ohne Browser (Tüte, Wochen-Teile, Teigi, Schrift am Namen)', async () => {
    const L = kompiliere(['src/basis/laden.tsx']).basis_laden;
    const alle = L.TIP_SHOP.filter((i) => ['avatar', 'effect', 'title', 'theme', 'schrift', 'jubel'].includes(i.kind) && !i.months && !i.woche && i.price <= 1000).map((i) => i.id);
    let schlecht = 0, arten = new Set();
    for (let i = 0; i < 400; i++) { const t = L.tueteAuslosen(alle.slice(0, 20)); arten.add(t.art); if (t.art === 'teil' && (alle.slice(0, 20).includes(t.it.id) || t.it.months || t.it.woche)) schlecht++; if (t.art === 'joker' && !L.JOKER_FIELD[t.it.id]) schlecht++; }
    ok('Überraschungstüte: nie etwas, das man schon hat, alle drei Arten kommen vor', schlecht === 0 && arten.size === 3, `${schlecht} falsch, Arten ${[...arten].join(',')}`);
    const w1 = L.wochenTeile(new Date(2026, 10, 16)), w2 = L.wochenTeile(new Date(2026, 10, 23));
    ok('Wochen-Teile: 2 verschiedene pro Woche, nächste Woche andere', w1.length === 2 && w1[0] !== w1[1] && w1.join() !== w2.join(), `${w1} / ${w2}`);
    const t0 = L.teigiStand(['2026-11-16'], 3, new Date(2026, 10, 16)), t1 = L.teigiStand(['2026-11-10'], 20, new Date(2026, 10, 16));
    ok('Teigi: wächst mit Lerntagen und wird ohne Lernen schlapp', t0.stufe === 0 && t0.laune === 'froh' && t1.stufe === 2 && t1.laune === 'schlapp', `${t0.stufe}/${t0.laune}, ${t1.stufe}/${t1.laune}`);
    ok('Schrift am Namen: Klasse für Schrift und Farbe zusammen', L.nameClassOf({ _schrift: 'sf_kreide', _gold: true }) === 'lt-goldname lt-sf-kreide');
  }]);
  // Version 233: Teigi für alle: Schalter ganz unten, Laden-Abteilung „Teigi“
  teile.push(['Version 233: Teigi für alle: Schalter ganz unten, Laden-Abteilung „Teigi“', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    ok('Teigi im Brotkorb ohne Kauf', (await d.page.locator('.lt-teigi-zeile').count()) === 1);
    ok('Teigi begleitet auch auf der Startseite', (await d.page.locator('.lt-teigi-begleiter').count()) === 1);
    await click(d.page.locator('button.lt-teigi-schalter').first()); await settle(d.page, 400);
    ok('Schalter ganz unten blendet Teigi aus', (await d.page.locator('.lt-teigi-zeile').count()) === 0 && /einschalten/.test(await d.page.locator('button.lt-teigi-schalter').innerText()));
    await click(d.page.locator('button.lt-teigi-schalter').first()); await settle(d.page, 400);
    ok('Schalter blendet Teigi wieder ein', (await d.page.locator('.lt-teigi-zeile').count()) === 1);
    await click(d.page.locator('button[title="Trinkgeld-Laden öffnen"]').first()); await settle(d.page, 600);
    const laden = d.page.locator('[role=dialog][aria-label="Trinkgeld-Laden"]');
    await click(laden.getByRole('tab', { name: 'Teigi' })); await settle(d.page, 300);
    const teile = await laden.locator('button.lt-shop-item').allInnerTexts();
    ok('Laden: Abteilung „Teigi“ mit Hüten, Gläsern und Tänzen', teile.some((t) => /Bäckermütze/.test(t)) && teile.some((t) => /Goldglas/.test(t)) && teile.some((t) => /Salto/.test(t)), `${teile.length} Teile`);
    const gesicht = await d.page.evaluate(() => { const svg = document.querySelector('.lt-shelf svg.lt-teigi'); if (!svg) return false; const auge = svg.querySelector('.lt-teigi-auge'); return !!auge && Number(auge.getAttribute('cy')) > 40 && Number(auge.getAttribute('cy')) < 110; });
    ok('Teigi: Gesicht sitzt im Glas', gesicht);
    ok('Teigi für alle: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 241: dunkles Design: Startseite hellbraun, Fortschrittsbalken und Schalter gut sichtbar
  teile.push(['Version 241: dunkles Design', async () => {
    const css = kompiliere(['src/thema/artisan.ts']).thema_artisan.ARTISAN_CSS;
    const regeln = ['.lt-home .lt-basket', '.lt-home .lt-fact-bubble', '.lt-fortschritt-balken', '.lt-knopf-hellbraun', '.lt-hoer-anzeige', '.lt-schalter.lt-schalter-an', '.lt-schalter-knopf'];
    ok('Dunkles Design: Startseite und Hör-Lernen-Anzeige hellbraun, Fortschrittsbalken und Schalter gut sichtbar', regeln.every((r) => css.includes(r)), regeln.filter((r) => !css.includes(r)).join(', '));
  }]);
  // Version 245: Produktdaten nach PDF korrigiert (Florentiner mit Kuvertüre/Soja, Schweineohr mit Schokolade beginnt mit Butter)
  teile.push(['Version 245: Florentiner und Schweineohr nach PDF', async () => {
    const P = kompiliere(['src/daten/shopProducts.ts']).daten_shopProducts.SHOP_PRODUCTS;
    const flor = P.find((x) => x.name === 'Florentiner'), ohr = P.find((x) => x.name === 'Schweineohr mit Schokolade');
    ok('Florentiner: Kuvertüre mit Sojalecithin, Allergen Soja', flor && /Kuvertüre/.test(flor.fullIngredients) && /SOJALEZITHIN/.test(flor.fullIngredients) && flor.allergens.includes('Soja'));
    const taler = P.find((x) => x.name === 'Florentinertaler');
    ok('Florentinertaler: Kuvertüre mit Sojalecithin, Allergen Soja', taler && /SOJALEZITHIN/.test(taler.fullIngredients) && taler.allergens.includes('Soja'));
    ok('Schweineohr mit Schokolade: erste Zutat Butter, Allergen Milch', ohr && /^BUTTER,/.test(ohr.fullIngredients) && ohr.allergens.includes('Milch'));
  }]);
  // Version 248: Teigi-Name (freiwillig) und Produkte vergleichen im Steckbrief
  teile.push(['Version 248: Teigi-Name und Vergleichen', async () => {
    const d = await device({ user: 'Anna' });
    await clearPopups(d.page);
    const knopf = d.page.locator('.lt-teigi-name-knopf');
    ok('Teigi: Knopf „Teigi einen Namen geben“ im Brotkorb', (await knopf.count()) === 1);
    if (await knopf.count()) {
      await click(knopf); await settle(d.page, 300);
      await d.page.locator('.lt-teigi-name input').fill('Bruno');
      await click(d.page.locator('.lt-teigi-name button')); await settle(d.page, 500);
    }
    let name = false;
    for (let i = 0; i < 30 && !name; i++) { name = (await d.page.locator('.lt-teigi-zeile', { hasText: 'Bruno (Baby-Teigi)' }).count()) > 0; if (!name) await d.page.waitForTimeout(100); }
    ok('Teigi: eigener Name steht im Brotkorb', name);
    await click(nav(d.page).nth(3)); await settle(d.page, 500);
    await click(d.page.locator('main button:visible').first()); await settle(d.page, 800);
    const kachel = d.page.locator('.lt-foto-raster button').first();
    for (let i = 0; i < 30 && !(await kachel.count()); i++) await d.page.waitForTimeout(100);
    if (await kachel.count()) { await click(kachel); await settle(d.page, 500); }
    const vgl = d.page.locator('.lt-vergleich-knopf');
    ok('Steckbrief: Knopf „Vergleichen“', (await vgl.count()) > 0);
    if (await vgl.count()) { await click(vgl.first()); await settle(d.page, 500); }
    const zeilen = await d.page.locator('.lt-vergleich .lt-vergleich-zeile').count();
    ok('Vergleichen: zwei Produkte mit Preis, Verkaufstext und Allergenen nebeneinander', zeilen >= 4, `${zeilen} Zeilen`);
    ok('Teigi-Name/Vergleichen: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 247: Teigi wächst sichtbar (größer, Deckel hebt sich, Teig quillt heraus)
  teile.push(['Version 247: Teigi-Stufen', async () => {
    const path = require('path');
    const React = require(path.resolve(__dirname, '../node_modules/react')), { renderToStaticMarkup } = require(path.resolve(__dirname, '../node_modules/react-dom/server'));
    const L = kompiliere(['src/basis/laden.tsx']).basis_laden;
    const bild = (stufe) => renderToStaticMarkup(React.createElement(L.TeigiGlas, { stufe, laune: 'froh', size: 72 }));
    ok('Teigi: Baby kleiner als Meister, Meister mit übergequollenem Teig', /scale\(0\.76\)/.test(bild(0)) && !/scale\(/.test(bild(3)) && /rotate\(-14/.test(bild(3)));
  }]);
  // Version 244: Hinkel-Küken als glatte 3D-Vektorgrafik (überall, wo vorher das kleine Bild war)
  teile.push(['Version 244: Küken als 3D-Vektorbild', async () => {
    const K = kompiliere(['src/basis/kuekenBild.ts']).basis_kuekenBild;
    ok('Küken: Vektorbild, im CSS sicher eingebettet', K.KUEKEN_3D.startsWith('data:image/svg+xml,') && !/[()']/.test(K.KUEKEN_3D));
    const d = await device({ user: 'Anna' });
    const breite = await d.page.evaluate(() => { const i = document.querySelector('.lt-fact-kueken'); return i ? i.naturalWidth : 0; });
    ok('Startseite: Küken neben „Wusstest du?“ wird angezeigt', breite > 0, String(breite));
    ok('Küken: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 239: Produkt-Lernkarten mit wechselnden natürlichen Stimmen, alle Sätze erzeugt
  teile.push(['Version 239: Produkt-Lernkarten mit wechselnden natürlichen Stimmen, alle Sätze erzeugt', async () => {
    const V = kompiliere(['src/hilfen/vorlesen.ts']).hilfen_vorlesen;
    const stimmen = new Set(['Abendschnitte', 'Roggenstange', 'Laugenbrezel', 'Mohnbrötchen', 'Kürbiskernbrot', 'Butterhörnchen'].map((n) => V.karteStimme(n)));
    ok('Lernkarten: Stimmen wechseln je Produkt (mindestens 2 verschiedene)', stimmen.size >= 2, [...stimmen].join(','));
    const satz = V.saetze(V.produktKarteVorne('Abendschnitte'))[0];
    const datei = require('path').join(__dirname, '..', 'public', 'stimme', 'saetze', V.satzKey(satz, V.karteStimme('Abendschnitte')) + '.mp3');
    ok('Lernkarten: Satz in der Kartenstimme ist erzeugt', require('fs').existsSync(datei), datei);
  }]);
  // Version 238: Lernkarten als Karteikarten mit Lernkasten
  teile.push(['Version 238: Lernkarten als Karteikarten mit Lernkasten', async () => {
    const K = kompiliere(['src/hilfen/lernkasten.ts']).hilfen_lernkasten;
    const c = { progress: { anna: { _displayName: 'Anna' } } };
    K.karteBewerten('anna', 'Anna', 'Abendschnitte', true)(c); K.karteBewerten('anna', 'Anna', 'Abendschnitte', true)(c);
    const zwei = K.fachVon(K.lernkastenVon(c.progress, 'anna'), 'Abendschnitte');
    K.karteBewerten('anna', 'Anna', 'Abendschnitte', false)(c);
    ok('Lernkasten: „Wusste ich“ schiebt ein Fach weiter, „Nochmal“ zurück in Fach 1', zwei === 3 && K.fachVon(K.lernkastenVon(c.progress, 'anna'), 'Abendschnitte') === 1);
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 }, vorher: async (ctx) => ctx.addInitScript(() => { if (sessionStorage.getItem('__v238')) return; sessionStorage.setItem('__v238', '1'); sessionStorage.setItem('lt_seite', 'nachschlagen'); }) });
    await clearPopups(d.page);
    const kp = d.page.locator('button, .lt-card', { hasText: /Produktkenntnis|Steckbriefe/ }).first(); if (await kp.count()) { await click(kp); await settle(d.page, 500); }
    await click(d.page.getByRole('button', { name: /^Lernkarten/ }).first()); await settle(d.page, 700);
    const karte = d.page.locator('.lt-kk-stapel').first();
    ok('Lernkarten: echte Karteikarte, vorne nur der Name (kein Emoji)', (await karte.count()) === 1 && (await d.page.locator('.lt-kk-vorne .lt-kk-name').count()) === 1 && !/\p{Extended_Pictographic}/u.test(await d.page.locator('.lt-kk-vorne').innerText()));
    await click(karte.locator('[role=button]')); await settle(d.page, 900);
    ok('Lernkarten: hinten Stichpunkte, Knöpfe „Nochmal“ und „Wusste ich“', (await d.page.locator('.lt-kk-liste li').count()) >= 3 && (await d.page.locator('.lt-kk-gewusst').count()) === 1);
    await click(d.page.locator('.lt-kk-gewusst')); await settle(d.page, 500);
    const faecher = await d.page.locator('.lt-kk-fach b').allInnerTexts();
    ok('Lernkasten: nach „Wusste ich“ liegt eine Karte in Fach 2', faecher[1] === '1', faecher.join(','));
    // Version 239: Fachwissen-Lernkarten auch als Karteikarte mit Lernkasten
    await click(d.page.locator('.fc-area button', { hasText: 'Fachwissen' })); await settle(d.page, 600);
    const lk = d.page.getByRole('button', { name: /^Lernkarten/ }).first(); if (await lk.count()) { await click(lk); await settle(d.page, 700); }
    const fk = d.page.locator('.lt-kk-stapel').first();
    ok('Fachwissen-Lernkarten: echte Karteikarte mit Frage vorne', (await fk.count()) === 1 && (await d.page.locator('.lt-kk-vorne .lt-kk-fragetext').count()) === 1);
    await click(fk.locator('[role=button]')); await settle(d.page, 900);
    const vorher239 = (await d.page.locator('.lt-kk-fach b').allInnerTexts())[1];
    await click(d.page.locator('.lt-kk-gewusst')); await settle(d.page, 500);
    const nach239 = (await d.page.locator('.lt-kk-fach b').allInnerTexts())[1];
    ok('Fachwissen-Lernkasten: „Wusste ich“ legt die Karte in Fach 2', Number(nach239) === Number(vorher239) + 1, `${vorher239} → ${nach239}`);
    ok('Lernkarten: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 229: Hinweis-Joker und Zweite Chance im Lernen-Quiz
  teile.push(['Version 229: Hinweis-Joker und Zweite Chance im Lernen-Quiz', async () => {
    const Q = kompiliere(['src/daten/questions.ts']).daten_questions;
    const richtig = new Map(); (Q.questions || []).forEach((q) => { if (!(Array.isArray(q.correctMulti) && q.correctMulti.length > 1)) richtig.set(q.question.trim(), q.options[q.correct]); });
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    probe.progress.anna = { ...probe.progress.anna, _jokersHinweis: 2, _jokersChance: 1 };
    const d = await device({ user: 'Anna', backup: probe });
    await clearPopups(d.page);
    await click(nav(d.page).nth(1)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible').first()); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible').first()); await settle(d.page);
    // eine Frage mit einfacher Antwort finden (Hinweis gibt es nicht bei mehreren richtigen)
    for (let i = 0; i < 5 && !(await d.page.locator('.lt-joker-hinweis').count()); i++) { await click(d.page.locator('button.lt-qopt:visible').first()); await settle(d.page, 300); const w = d.page.getByRole('button', { name: /Nächste Frage|Weiter/ }).first(); if (await w.count()) { await click(w); await settle(d.page, 300); } }
    const opts = d.page.locator('button.lt-qopt:visible');
    const vorher = await opts.count();
    await click(d.page.locator('.lt-joker-hinweis').first()); await settle(d.page, 300);
    const nachHinweis = await opts.count();
    ok('Hinweis-Joker: eine falsche Antwort verschwindet', vorher >= 3 && nachHinweis === vorher - 1, `${vorher} → ${nachHinweis}`);
    await click(d.page.locator('.lt-joker-chance').first()); await settle(d.page, 300);
    const an = (await d.page.locator('.lt-chance-an').count()) > 0;
    const frage = (await d.page.locator('.lt-frage').first().innerText()).trim();
    const ziel = String(richtig.get(frage) || '');
    const texte = await opts.allInnerTexts();
    const falsch = texte.findIndex((t) => ziel && !t.includes(ziel));
    if (falsch >= 0) { await click(opts.nth(falsch)); await settle(d.page, 400); }
    const nochOffen = (await d.page.locator('.lt-qcard.lt-ans-bad, .lt-qcard.lt-ans-ok').count()) === 0;
    ok('Zweite Chance: falsche Antwort zählt nicht, man darf nochmal', an && falsch >= 0 && nochOffen && (await opts.count()) === nachHinweis - 1 && (await d.page.locator('.lt-chance-an').count()) === 0, `an ${an}, offen ${nochOffen}, ${await opts.count()} Antworten`);
    // Version 231: Teigi begleitet im Quiz und reagiert auf Antworten
    const begleiter = d.page.locator('.lt-teigi-begleiter');
    ok('Teigi begleitet im Quiz (jeder hat ihn, ohne Kauf)', (await begleiter.count()) === 1);
    const opts2 = d.page.locator('button.lt-qopt:visible');
    const frage2 = (await d.page.locator('.lt-frage').first().innerText()).trim();
    const ziel2 = String(richtig.get(frage2) || '');
    const r2 = (await opts2.allInnerTexts()).findIndex((t) => ziel2 && t.includes(ziel2));
    let hops = 0;
    if (r2 >= 0) { await click(opts2.nth(r2)); for (let i = 0; i < 40 && !hops; i++) { hops = await d.page.locator('.lt-teigi-begleiter .lt-teigi-hops').count(); if (!hops) await d.page.waitForTimeout(50); } }
    ok('Teigi hüpft bei einer richtigen Antwort', hops === 1);
    await d.page.waitForTimeout(800);
    await click(begleiter.locator('button'));
    let sprech = 0;
    for (let i = 0; i < 40 && !sprech; i++) { sprech = await d.page.locator('.lt-teigi-sprech').count(); if (!sprech) await d.page.waitForTimeout(50); }
    ok('Teigi antippen: bleibt da, hüpft und sagt etwas', (await begleiter.count()) === 1 && sprech === 1);
    ok('Neue Joker: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 223: Theken-Ansturm: am Handy 3 große Fotos pro Reihe statt 4
  teile.push(['Version 223: Theken-Ansturm: am Handy 3 große Fotos pro Reihe statt 4', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    await click(nav(d.page).nth(2)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible', { hasText: 'Theken-Ansturm' }).first()); await settle(d.page, 800);
    await click(d.page.getByRole('button', { name: /Theke öffnen/ })); await settle(d.page, 800);
    const breiten = await d.page.locator('.lt-ansturm-grid').evaluate((e) => [...e.children].map((c) => Math.round(c.getBoundingClientRect().width))).catch(() => []);
    const ueber = await d.page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok('Theken-Ansturm: Fotos am Handy groß (3 pro Reihe)', breiten.length === 8 && Math.min(...breiten) >= 100 && ueber <= 1, `Breiten ${breiten.join(',')}, über ${ueber}px`);
    ok('Theken-Ansturm: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 251: Suche überall (Lupe oben), auch mit Sprache
  teile.push(['Version 251: Suche überall (Lupe oben)', async () => {
    const S = kompiliere(['src/hilfen/suche.ts']).hilfen_suche;
    ok('Suche: Umlaute egal, alle Wörter müssen passen', S.treffer('Bäckerei Brötchen', 'broetchen') > 0 && S.treffer('Bäckerei', 'brötchen') === 0 && S.suchen([{ n: 'Mohnbrötchen' }, { n: 'Mohnschnecke' }, { n: 'Kornspitz' }], 'mohn', () => '', (x) => x.n).length === 2);
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    if (process.env.OFEN_BILD) { await d.page.getByRole('button', { name: 'Suchen' }).first().waitFor().catch(() => {}); await sleep(2500); await d.page.screenshot({ path: process.env.OFEN_BILD + '-kopf.png' }); }
    await click(d.page.getByRole('button', { name: 'Suchen' }).first()); await settle(d.page, 400);
    await d.page.getByLabel('Suchbegriff').fill('laugenbrezel');
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-suche-produkt').count()); w++) await sleep(100);
    ok('Suche: Produkt gefunden', (await d.page.locator('.lt-suche-produkt').first().innerText().catch(() => '')).includes('Laugenbrezel'));
    await click(d.page.locator('.lt-suche-produkt').first()); await settle(d.page, 800);
    for (let w = 0; w < 40 && !(await d.page.locator('.fc-sheet').count()); w++) await sleep(100);
    ok('Suche: Produkt öffnet den Steckbrief', /Laugenbrezel/.test(await d.page.locator('.lt-sb-kopf').innerText().catch(() => '')));
    await click(d.page.getByRole('button', { name: 'Schließen' }).first()); await settle(d.page, 400);
    await click(d.page.getByRole('button', { name: 'Suchen' }).first()); await settle(d.page, 400);
    await d.page.getByLabel('Suchbegriff').fill('sauerteig');
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-suche-frage').count()); w++) await sleep(100);
    ok('Suche: Quizfragen gefunden, Antwort aufklappbar', (await d.page.locator('.lt-suche-frage').count()) > 0);
    if (await d.page.locator('.lt-suche-frage').count()) { await click(d.page.locator('.lt-suche-frage').first()); await settle(d.page, 200); }
    ok('Suche: richtige Antwort sichtbar', /Richtig:/.test(await d.page.locator('.lt-suche-frage').first().innerText().catch(() => '')));
    await d.page.getByLabel('Suchbegriff').fill('teigi namen');
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-suche-hilfe').count()); w++) await sleep(100);
    ok('Suche: Hilfe-Thema gefunden', (await d.page.locator('.lt-suche-hilfe').count()) > 0);
    if (await d.page.locator('.lt-suche-hilfe').count()) { await click(d.page.locator('.lt-suche-hilfe').first()); await settle(d.page, 800); }
    ok('Suche: Hilfe-Thema geöffnet', (await d.page.locator('main details[open]').count()) >= 1 && /So funktioniert/.test(await d.page.locator('main h1').first().innerText().catch(() => '')));
    await click(d.page.getByRole('button', { name: 'Suchen' }).first()); await settle(d.page, 400);
    await d.page.getByLabel('Suchbegriff').fill('ofen');
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-suche-seite').count()); w++) await sleep(100);
    ok('Suche: Seite (Ofen-Kette) gefunden', (await d.page.locator('.lt-suche-seite').innerText().catch(() => '')).includes('Ofen-Kette'));
    const breit = await d.page.evaluate(() => document.documentElement.scrollWidth);
    ok('Suche: nichts steht seitlich über', breit <= 392, String(breit));
    ok('Suche: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 262: Neustart der Bestenliste (nur Bestenliste, Stufe und Trinkgeld bleiben)
  teile.push(['Version 262: Neustart der Bestenliste', async () => {
    const W = kompiliere(['src/hilfen/wertungen.ts']).hilfen_wertungen;
    const ts = new Date(2027, 0, 1, 6, 0).getTime();
    const sc = [{ id: 'anna_1700000000000', username: 'Anna', score: 900, date: '20.12.26, 08:00', category: 'Quiz' }, { id: `ben_${ts + 5000}`, username: 'Ben', score: 50, date: '01.01.27, 06:00', category: 'Kassenblitz ⚡' }, { id: 'x', username: 'Anna', score: 30, date: '01.01.27, 06:00', category: 'Quiz' }];
    const pr = { admin: { _bestenlisteNeu: { ts, ausgaben: { anna: 15000 } } }, anna: { _ptsSpent: 15500 }, ben: {} };
    ok('Neustart: nur Einträge ab dem Neustart zählen', W.abNeustart(sc, pr).length === 2 && W.abNeustart(sc, {}).length === 3);
    ok('Neustart: Schatzkammer zählt nur, was danach ausgegeben wurde', W.ausgabenInWertung(pr, 'anna') === 500 && W.ausgabenInWertung({ anna: { _ptsSpent: 700 } }, 'anna') === 700);
    const r = W.alleRanglisten(sc, pr);
    ok('Neustart: Gesamtwertung neu (Ben vorne, Anna mit Ausgaben im Minus fällt raus)', r.total.liste.join() === 'ben', r.total.liste.join());
    // Ausbilder drückt den Knopf
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    const a = await device({ admin: true, backup: probe });
    a.page.on('dialog', (dlg) => dlg.accept());
    await click(a.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(a.page);
    for (let w = 0; w < 50 && !(await a.page.locator('[role=tab]').count()); w++) await sleep(100);
    await click(a.page.getByRole('tab', { name: /Einstellungen/ }).first()); await settle(a.page, 500);
    await click(a.page.locator('.lt-neustart-knopf')); await settle(a.page, 400);
    ok('Ausbilder: Neustart gespeichert („zählt seit …“)', /zählt seit/.test(await a.page.locator('.lt-neustart-stand').innerText().catch(() => '')));
    await click(a.page.locator('[aria-label="Hauptmenü"] button[title="Bestenliste"]:visible').first()); await settle(a.page, 800);
    const bon = await a.page.locator('.sb-bon').innerText().catch(() => '');
    ok('Bestenliste nach Neustart: alte Punkte zählen nicht mehr, „Wertung seit“', /Wertung seit/.test(bon) && !/BEN/.test(bon) && /Noch keine Einträge/.test(bon), bon.slice(0, 200));
    await click(a.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(a.page);
    await click(a.page.getByRole('tab', { name: /Einstellungen/ }).first()); await settle(a.page, 500);
    await click(a.page.locator('.lt-neustart-zurueck')); await settle(a.page, 400);
    ok('Ausbilder: Neustart zurückgenommen', (await a.page.locator('.lt-neustart-knopf').count()) === 1);
    ok('Neustart: keine Fehler beim Ausbilder', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
    // Mitarbeiter: Stufe bleibt, Bestenliste zeigt nur Neues, ein Hinweis statt „überholt“
    const p2 = JSON.parse(JSON.stringify(SAMPLE));
    p2.progress.admin = { _bestenlisteNeu: { ts: Date.now() - 3600000, ausgaben: {} } };
    p2.scores.push({ id: `anna_${Date.now() - 60000}`, username: 'Anna', score: 42, date: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }), category: 'Quiz' });
    const d = await device({ user: 'Anna', backup: p2, viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    await click(d.page.locator('[aria-label="Hauptmenü"] button[title="Bestenliste"]:visible').first()); await settle(d.page, 800);
    const b2 = await d.page.locator('.sb-bon').innerText().catch(() => '');
    ok('Mitarbeiter: Bestenliste zählt nur neue Punkte (Anna 42, Ben fehlt)', /ANNA[^\n]*\n?[^\n]*42/.test(b2) && !/BEN/.test(b2), b2.slice(0, 220));
    ok('Neustart: keine Fehler beim Mitarbeiter', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 261: Teigi bewegt den Mund, solange eine Stimme vorliest
  teile.push(['Version 261: Teigi spricht mit', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    const mund = () => d.page.locator('.lt-teigi-begleiter .lt-teigi-mund-spricht').count();
    let m0 = 1;
    for (let w = 0; w < 50 && m0; w++) { m0 = await mund(); if (m0) await sleep(100); }
    ok('Teigi: ohne Stimme und ohne Sprechblase kein Sprechmund', m0 === 0);
    await click(d.page.locator('.lt-teigi-begleiter button').first());
    let mt = 0;
    for (let w = 0; w < 20 && !mt; w++) { mt = await mund(); if (!mt) await sleep(100); }
    ok('Teigi antippen: Sprechblase und Mund bewegt sich', mt === 1 && (await d.page.locator('.lt-teigi-sprech').count()) === 1);
    for (let w = 0; w < 50 && mt; w++) { mt = await mund(); if (mt) await sleep(100); }
    ok('Teigi antippen: Mund geht danach wieder zu', mt === 0);
    await d.page.evaluate(() => { window.__spricht = true; Object.defineProperty(window.speechSynthesis, 'speaking', { configurable: true, get: () => window.__spricht }); });
    let m = 0;
    for (let w = 0; w < 30 && !m; w++) { m = await mund(); if (!m) await sleep(100); }
    ok('Teigi: bewegt den Mund, solange die Handy-Stimme spricht', m === 1 && (await d.page.locator('.lt-teigi-begleiter.lt-teigi-spricht').count()) === 1);
    const anim = await d.page.locator('.lt-teigi-mund-spricht').first().evaluate((el) => { const alt = document.documentElement.classList.contains('lt-noanim'); document.documentElement.classList.remove('lt-noanim'); const n = getComputedStyle(el).animationName; if (alt) document.documentElement.classList.add('lt-noanim'); return n; });
    ok('Teigi: Mund geht auf und zu (Bewegung läuft)', anim === 'ltTeigiPlapper', anim);
    await d.page.evaluate(() => { window.__spricht = false; });
    for (let w = 0; w < 30 && m; w++) { m = await mund(); if (m) await sleep(100); }
    ok('Teigi: hört auf, wenn die Stimme fertig ist', m === 0);
    // natürliche Stimme (Tondatei): Steckbrief vorlesen
    await click(d.page.getByRole('button', { name: 'Suchen' }).first()); await settle(d.page, 400);
    await d.page.getByLabel('Suchbegriff').fill('laugenbrezel');
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-suche-produkt').count()); w++) await sleep(100);
    await click(d.page.locator('.lt-suche-produkt').first()); await settle(d.page, 800);
    const vorlesen = d.page.locator('.fc-sheet button', { hasText: /vorlesen/i }).first();
    if (await vorlesen.count()) {
      await vorlesen.click().catch(() => {});
      let mm = 0;
      for (let w = 0; w < 50 && !mm; w++) { mm = await mund(); if (!mm) await sleep(100); }
      ok('Teigi: spricht auch mit der natürlichen Stimme (Steckbrief vorlesen)', mm === 1);
    }
    ok('Teigi spricht: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 260: Start-Übersicht, Wochen-Rückblick, Sortiment, Foto-Vollbild, „Zu mir springen“, Fotos für ohne Internet
  teile.push(['Version 260: Ausbilder Start-Übersicht, Rückblick und Sortiment', async () => {
    const T = kompiliere(['src/hilfen/teamStart.ts']).hilfen_teamStart;
    const jetzt = new Date(2026, 10, 19, 12); // Donnerstag
    const prog = { anna: { _role: 'azubi', _intro: true, _days: ['2026-11-10', '2026-11-12'], _seit: '2026-11-10', _handy: true }, ben: { _days: [] }, cem: { _urlaub: [{ von: '2026-11-09', bis: '2026-11-14' }], _days: ['2026-10-01'] } };
    const st = T.startStand(prog, { anna: { h: 'x' } }, ['anna', 'ben', 'cem']);
    ok('Start-Übersicht: wer noch nicht losgelegt hat, steht oben', st[0].key !== 'anna' && st.find((z) => z.key === 'anna').offen === false && st.find((z) => z.key === 'anna').pin && st.find((z) => z.key === 'anna').handy && st.find((z) => z.key === 'ben').offen, JSON.stringify(st.map((z) => [z.key, z.offen])));
    const r = T.wochenRueckblick(prog, [{ username: 'Anna', score: 200, date: '11.11.26, 08:00' }, { username: 'Ben', score: 50, date: '18.11.26, 08:00' }], ['anna', 'ben', 'cem'], jetzt);
    ok('Rückblick: letzte Woche Mo bis So, Punkte, Fleißigste, Neu, Urlaub', r.von === '2026-11-09' && r.bis === '2026-11-15' && r.punkte === 200 && r.lerntage === 2 && r.top[0].key === 'anna' && r.neu.join() === 'anna' && r.nicht.join() === 'ben' && r.urlaub.join() === 'cem', JSON.stringify(r));
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    const d0 = new Date(); d0.setDate(d0.getDate() - ((d0.getDay() + 6) % 7) - 5); // Mittwoch letzter Woche
    const tk = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}-${String(d0.getDate()).padStart(2, '0')}`;
    probe.progress.anna._days = [tk]; probe.progress.anna._intro = true;
    probe.scores = [];
    probe.scores.push({ id: 's9', username: 'Anna', score: 77, date: `${d0.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}, 08:00`, category: 'Quiz' });
    const a = await device({ admin: true, backup: probe });
    a.page.on('dialog', (dlg) => dlg.accept());
    await click(a.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(a.page);
    for (let w = 0; w < 50 && !(await a.page.locator('.lt-wochen-rueckblick').count()); w++) await sleep(100);
    const rb = await a.page.locator('.lt-wochen-rueckblick').first().innerText().catch(() => '');
    ok('Rückblick oben im Ausbilder-Bereich: 1 von 2, Anna am fleißigsten, Ben nicht', /1 von 2 haben gelernt/.test(rb) && /Am fleißigsten\s*Anna/.test(rb) && /Nicht gelernt\s*Ben/.test(rb), rb.slice(0, 200));
    await click(a.page.locator('.lt-rueckblick-gelesen')); await settle(a.page, 300);
    ok('Rückblick: „Gelesen“ blendet ihn aus', (await a.page.locator('.lt-wochen-rueckblick').count()) === 0);
    await click(a.page.getByRole('tab', { name: /Mitarbeiter/ }).first()); await settle(a.page, 500);
    const su = a.page.locator('.lt-start-uebersicht');
    ok('Start-Übersicht: 2 angemeldet, 1 noch nicht losgelegt', /2 angemeldet/.test(await su.innerText().catch(() => '')) && /1 noch nicht/.test(await su.innerText().catch(() => '')));
    await click(su.locator('summary')); await settle(a.page, 300);
    const zeilen = await a.page.locator('.lt-start-zeile').allInnerTexts();
    ok('Start-Übersicht: Ben (ohne Rolle) oben, Anna mit Rolle und Einführung', zeilen.length === 2 && /Ben/.test(zeilen[0]) && /✓ Rolle/.test(zeilen[1]) && /✓ Einführung/.test(zeilen[1]), zeilen.join(' | ').slice(0, 200));
    await click(a.page.getByRole('tab', { name: /Inhalte/ }).first()); await settle(a.page, 500);
    await a.page.getByLabel('Produkt suchen').fill('kappeskopp');
    for (let w = 0; w < 30 && !(await a.page.locator('.lt-sortiment-treffer').count()); w++) await sleep(100);
    await click(a.page.locator('.lt-sortiment-treffer button').first()); await settle(a.page, 400);
    ok('Sortiment: Kappeskopp herausgenommen', /Kappeskopp/.test(await a.page.locator('.lt-sortiment-raus').first().innerText().catch(() => '')));
    await click(a.page.locator('.lt-sortiment-raus button').first()); await settle(a.page, 300);
    ok('Sortiment: wieder ins Sortiment geholt', (await a.page.locator('.lt-sortiment-raus').count()) === 0);
    ok('Ausbilder 260: keine Fehler', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
    // Mitarbeiter: herausgenommenes Produkt ist weg (Suche, Quizfragen)
    const p2 = JSON.parse(JSON.stringify(SAMPLE));
    p2.productFixes = { Kappeskopp: { aus: true, ts: Date.now() } };
    const d = await device({ user: 'Anna', backup: p2, viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    await click(d.page.getByRole('button', { name: 'Suchen' }).first()); await settle(d.page, 400);
    await d.page.getByLabel('Suchbegriff').fill('kappeskopp');
    await sleep(600);
    const prod = await d.page.locator('.lt-suche-produkt').count(), fr = await d.page.locator('.lt-suche-frage').count();
    ok('Nicht im Sortiment: kein Steckbrief und keine Quizfrage mehr in der Suche', prod === 0 && fr === 0, `${prod} Produkte, ${fr} Fragen`);
    await d.page.getByLabel('Suchbegriff').fill('zimtmonde');
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-suche-produkt').count()); w++) await sleep(100);
    ok('Andere Produkte bleiben', (await d.page.locator('.lt-suche-produkt').count()) > 0);
    ok('Sortiment beim Mitarbeiter: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  teile.push(['Version 260: Foto-Vollbild, „Zu mir springen“, Fotos für ohne Internet', async () => {
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    ['Cem', 'Dora', 'Emil', 'Finn'].forEach((n, i) => { probe.scores.push({ id: 'x' + i, username: n, score: 900 + i * 10, date: '12.11.26, 08:00', category: 'Quiz' }); probe.progress[n.toLowerCase()] = { _displayName: n }; });
    const d = await device({ user: 'Anna', backup: probe, viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    // Steckbrief: Foto antippen = Vollbild, wischen, schließen
    await click(d.page.getByRole('button', { name: 'Suchen' }).first()); await settle(d.page, 400);
    await d.page.getByLabel('Suchbegriff').fill('laugenbrezel');
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-suche-produkt').count()); w++) await sleep(100);
    await click(d.page.locator('.lt-suche-produkt').first()); await settle(d.page, 800);
    for (let w = 0; w < 40 && !(await d.page.locator('.lt-foto-gross').count()); w++) await sleep(100);
    await click(d.page.locator('.lt-foto-gross').first()); await settle(d.page, 400);
    const vb = d.page.locator('.lt-foto-vollbild');
    ok('Steckbrief: Foto antippen öffnet das Vollbild mit allen Fotos', (await vb.count()) === 1 && (await vb.locator('img').count()) >= 2 && /1 \/ \d/.test(await vb.innerText()));
    await click(vb.getByRole('button', { name: 'Nächstes Foto' })); await sleep(900);
    ok('Vollbild: weiter zum nächsten Foto', /2 \/ \d/.test(await vb.innerText().catch(() => '')));
    await d.page.goBack(); await settle(d.page, 500);
    ok('Vollbild: Zurück-Taste schließt nur das Vollbild', (await d.page.locator('.lt-foto-vollbild').count()) === 0 && (await d.page.locator('.fc-sheet').count()) === 1);
    await d.page.goBack(); await settle(d.page, 500);
    // Bestenliste: zu mir springen
    await click(d.page.locator('[aria-label="Hauptmenü"] button[title="Bestenliste"]:visible').first()); await settle(d.page, 800);
    for (let w = 0; w < 40 && !(await d.page.locator('.sb-zu-mir').count()); w++) await sleep(100);
    const zm = await d.page.locator('.sb-zu-mir').innerText().catch(() => '');
    ok('Bestenliste: Knopf „Zu mir springen“ mit eigenem Platz', /Platz \d/.test(zm), zm);
    await click(d.page.locator('.sb-zu-mir')); await sleep(300);
    ok('Bestenliste: eigene Zeile leuchtet auf', (await d.page.locator('.sb-me.sb-me-puls').count()) === 1);
    // Menü: Fotos für ohne Internet laden
    await click(d.page.getByRole('button', { name: 'Menü' }).first()); await settle(d.page, 300);
    await click(d.page.locator('.lt-menu-offline')); await settle(d.page, 300);
    let txt = '';
    for (let w = 0; w < 40 && !/von \d+ Fotos|Alle Fotos/.test(txt); w++) { txt = await d.page.locator('.lt-offline-laden').innerText().catch(() => ''); await sleep(100); }
    const vorher = Number((txt.match(/(\d+) von/) || [])[1] || 0);
    ok('Für ohne Internet: zeigt, wie viele Fotos schon da sind', /von \d+ Fotos/.test(txt), txt.slice(0, 120));
    await click(d.page.locator('.lt-offline-start'));
    let nachher = vorher;
    for (let w = 0; w < 80 && nachher < vorher + 30; w++) { nachher = Number(((await d.page.locator('.lt-offline-laden').innerText().catch(() => '')).match(/(\d+) von/) || [])[1] || 0); await sleep(100); }
    ok('Für ohne Internet: Fotos werden aufs Gerät geladen', nachher >= vorher + 30, `${vorher} → ${nachher}`);
    const gespeichert = await d.page.evaluate(async () => (await (await caches.open('lern-theke-fotos-1')).keys()).length);
    ok('Für ohne Internet: Fotos liegen im Foto-Speicher', gespeichert >= 30, String(gespeichert));
    await click(d.page.locator('.lt-offline-laden button', { hasText: /Abbrechen|Fertig/ }).last()); await settle(d.page, 300);
    ok('Für ohne Internet: Fenster geht zu', (await d.page.locator('.lt-offline-laden').count()) === 0);
    ok('Vollbild, Bestenliste, Offline: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 259: Ausbilder: „Zu erledigen“, rote Zahl am Knopf, Meldung bei Neuem
  teile.push(['Version 259: Ausbilder-Benachrichtigungen', async () => {
    const A = kompiliere(['src/hilfen/adminAufgaben.ts']).hilfen_adminAufgaben;
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    const jetzt = Date.now();
    probe.progress.anna._reports = { 4001: { r: 'Antwort falsch', t: 'Testmeldung', ts: jetzt } };
    probe.progress.anna._kfragen = { f1: { q: 'Ist da Ei drin?', ts: jetzt } };
    probe.progress.anna._kollegenLob = { l1: { an: 'ben', anName: 'Ben', t: 'Danke!', ts: jetzt, anonym: true, warte: true } };
    probe.progress.anna._azubiPlan = { j1_hygiene: true };
    probe.progress.admin = { _letzteSicherung: jetzt };
    const liste = A.adminAufgaben(probe.progress, jetzt);
    const ids = liste.map((x) => x.id);
    ok('Zu erledigen: Meldung, Spruch, Lob, Kundenfrage, Ausbildungsplan erkannt, Sicherung nicht fällig', ['meldungen', 'sprueche', 'lob', 'kundenfragen', 'plan'].every((x) => ids.includes(x)) && !ids.includes('sicherung'), ids.join(','));
    ok('Zu erledigen: Sicherung nach 7 Tagen', A.adminAufgaben({ admin: { _letzteSicherung: jetzt - 8 * 86400000 } }, jetzt).some((x) => x.id === 'sicherung'));
    const a = await device({ admin: true, backup: probe });
    for (let w = 0; w < 50 && !(await nav(a.page).filter({ hasText: 'Ausbilder' }).locator('.lt-duel-badge').count()); w++) await sleep(100);
    const zahl = await nav(a.page).filter({ hasText: 'Ausbilder' }).locator('.lt-duel-badge').first().innerText().catch(() => '');
    ok('Ausbilder-Knopf: rote Zahl mit offenen Sachen', Number(zahl) >= 5, zahl);
    let toast = '';
    for (let w = 0; w < 40 && !/Neu für dich/.test(toast); w++) { toast = await a.page.locator('body').innerText().catch(() => ''); await sleep(100); }
    ok('Meldung beim Öffnen: „Neu für dich …“', /Neu für dich/.test(toast));
    await click(a.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(a.page);
    for (let w = 0; w < 50 && !(await a.page.locator('.lt-zu-erledigen').count()); w++) await sleep(100);
    const liste2 = await a.page.locator('.lt-zu-erledigen .lt-aufgabe').allInnerTexts();
    ok('Zu erledigen: Liste oben im Ausbilder-Bereich', liste2.length >= 5 && liste2.some((t) => /anonymes Lob/.test(t)), liste2.join(' | ').slice(0, 160));
    await click(a.page.locator('.lt-zu-erledigen .lt-aufgabe', { hasText: 'anonymes Lob' }).locator('button')); await settle(a.page, 600);
    ok('Zu erledigen: „Ansehen“ springt zur Freigabe', (await a.page.locator('.lt-lob-freigabe').count()) === 1);
    await click(a.page.locator('.lt-zu-erledigen .lt-aufgabe', { hasText: 'Ausbildungsplan' }).locator('button')); await settle(a.page, 800);
    for (let w = 0; w < 40 && !(await a.page.locator('.lt-azubi-bestaetigen').count()); w++) await sleep(100);
    ok('Zu erledigen: „Zur Ausbildung“ öffnet die Bestätigung', (await a.page.locator('.lt-azubi-bestaetigen').count()) === 1);
    ok('Ausbilder-Benachrichtigungen: keine Fehler', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
  }]);
  // Version 258: anonymes Lob wartet auf den Ausbilder, er sieht den Absender
  teile.push(['Version 258: anonymes Lob nur nach Freigabe', async () => {
    const T = kompiliere(['src/hilfen/team.ts']).hilfen_team;
    const c = { progress: { anna: { _displayName: 'Anna' }, ben: { _displayName: 'Ben' } }, scores: [] };
    T.lobSchicken('anna', 'Anna', 'ben', 'Ben', 'Danke fürs Einspringen!', 1000, true)(c);
    ok('Anonymes Lob: wartet, Ben bekommt noch nichts', T.lobeZurFreigabe(c.progress).length === 1 && T.offeneLobPunkte(c.progress, 'ben').length === 0);
    const l = T.lobeZurFreigabe(c.progress)[0];
    T.lobFreigeben(l.von, l.id)(c);
    ok('Anonymes Lob: nach Freigabe sichtbar, Ben bekommt Punkte, Name bleibt geheim', T.lobeZurFreigabe(c.progress).length === 0 && T.offeneLobPunkte(c.progress, 'ben').length === 1 && T.lobVon(T.alleLobs(c.progress)[0]) === 'Ein Kollege');
    T.lobSchicken('ben', 'Ben', 'anna', 'Anna', 'Super gemacht', 999999999, false)(c);
    ok('Normales Lob: sofort sichtbar', T.offeneLobPunkte(c.progress, 'anna').length === 1);
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    probe.progress.anna._kollegenLob = { l1: { an: 'ben', anName: 'Ben', t: 'Anonymer Testdank', ts: Date.now(), anonym: true, warte: true } };
    const a = await device({ admin: true, backup: probe });
    await click(a.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(a.page);
    for (let w = 0; w < 50 && !(await a.page.locator('[role=tab]').count()); w++) await sleep(100);
    await click(a.page.getByRole('tab', { name: /Rückmeldungen/ }).first()); await settle(a.page, 600);
    const fr = await a.page.locator('.lt-lob-freigabe').innerText().catch(() => '');
    ok('Ausbilder: anonymes Lob mit echtem Namen zur Freigabe', /Anna/.test(fr) && /anonym/.test(fr) && /Anonymer Testdank/.test(fr), fr.slice(0, 100));
    await click(a.page.locator('.lt-lob-freigabe button', { hasText: 'Freigeben' }).first()); await settle(a.page, 400);
    ok('Ausbilder: nach Freigabe nichts mehr offen', (await a.page.locator('.lt-lob-freigabe').count()) === 0);
    ok('Lob-Freigabe: keine Fehler', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
    const d = await device({ user: 'Ben', backup: probe });
    await clearPopups(d.page);
    const karte = await d.page.locator('section[aria-label="Lob der Woche"]').innerText().catch(() => '');
    ok('Kollegen sehen wartendes anonymes Lob nicht', !/Anonymer Testdank/.test(karte));
    await d.ctx.close();
  }]);
  // Version 257: Aufräumen: Menü in Gruppen, Papier im dunklen Design hell (Lern-Bon, Stickerheft)
  teile.push(['Version 257: Menü in Gruppen, Papier im dunklen Design', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 667 }, vorher: async (ctx) => ctx.addInitScript(() => { localStorage.setItem('lt_design', 'nacht'); }) });
    await clearPopups(d.page);
    await click(d.page.getByRole('button', { name: 'Menü' }).first()); await settle(d.page, 300);
    const gruppen = await d.page.locator('.lt-menu-gruppe').allInnerTexts();
    ok('Menü: drei Gruppen', gruppen.length === 3 && /Für mich/i.test(gruppen[0]) && /Mitmachen/i.test(gruppen[1]), gruppen.join(', '));
    const menu = await d.page.locator('.lt-menu-pop').evaluate((e) => ({ h: e.getBoundingClientRect().height, sh: e.scrollHeight, ch: e.clientHeight }));
    ok('Menü: passt auch auf kleine Handys (scrollt)', menu.h <= 667, JSON.stringify(menu));
    await d.page.keyboard.press('Escape'); await clearPopups(d.page);
    const hell = await d.page.evaluate(() => {
      document.querySelectorAll('details.lt-zahlen').forEach((x) => { x.open = true; });
      const papier = document.querySelector('.lt-zahlen-bon .lt-bon > div:nth-child(2)');
      if (!papier) return -1;
      const m = getComputedStyle(papier).backgroundColor.match(/\d+/g).map(Number);
      return (m[0] + m[1] + m[2]) / 3;
    });
    ok('Dunkles Design: Lern-Bon bleibt helles Papier', hell > 200, String(hell));
    ok('Aufräumen: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 256: Frage an den Ausbilder, Wochenziel, Lehrjahr-Quiz, Rückblick, Gute Sätze, Prüfungsfragen im Hör-Lernen
  teile.push(['Version 256: Azubi-Fragen, Wochenziel, Rückblick, Gute Sätze', async () => {
    const X = kompiliere(['src/hilfen/azubiExtras.ts']).hilfen_azubiExtras;
    const c = { progress: {} };
    X.frageStellen('anna', 'Anna', 'Warum Sauerteig?', 10)(c);
    const fid = Object.keys(c.progress.anna._azubiFragen)[0];
    X.frageBeantworten('anna', fid, 'Weil Roggen sonst klebt.', 20)(c);
    const f = X.alleAzubiFragen(c.progress)[0];
    ok('Frage an den Ausbilder: Antwort kommt an, erst ungelesen', f.a === 'Weil Roggen sonst klebt.' && !f.gesehen);
    X.antwortenGelesen('anna')(c);
    ok('Frage an den Ausbilder: danach gelesen', X.alleAzubiFragen(c.progress)[0].gesehen === true);
    X.zielSetzen('anna', 'Anna', '2026-11-16', 'Kasse abrechnen')(c); X.zielBewerten('anna', 'Anna', '2026-11-16', true)(c);
    ok('Wochenziel: setzen und bewerten', X.zieleVon(c.progress.anna)['2026-11-16'].ok === true);
    ok('Rückblick: nur in den Sommerferien (Juli/August)', X.istRueckblickZeit(new Date(2026, 6, 20)) && X.istRueckblickZeit(new Date(2026, 7, 31)) && !X.istRueckblickZeit(new Date(2026, 8, 1)) && !X.istRueckblickZeit(new Date(2026, 5, 30)));
    const rb = X.rueckblick({ _days: ['2025-07-30', '2025-08-02', '2026-07-10'], _azubiPlan: { a: true, b: true }, _azubiOk: { a: 1 } }, ['a', 'b', 'c'], new Date(2026, 6, 20));
    ok('Rückblick: Lerntage seit 1. August, bestätigte Planpunkte', rb.lerntage === 2 && rb.planOk === 1 && rb.planGesamt === 3, JSON.stringify(rb));
    // Azubi: Ziel, Frage, Lehrjahr-Quiz
    const d = await device({ user: 'Anna', backup: SAMPLE, viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    for (let w = 0; w < 40 && !(await nav(d.page).filter({ hasText: 'Ausbildung' }).count()); w++) await sleep(100);
    await click(nav(d.page).filter({ hasText: 'Ausbildung' }).first()).catch(() => {});
    for (let w = 0; w < 40 && !(await d.page.locator('.lt-wochenziel').count()); w++) await sleep(100);
    await d.page.getByLabel('Mein Wochenziel').fill('Kassenabrechnung alleine machen');
    await click(d.page.getByRole('button', { name: 'Ziel speichern' })); await settle(d.page, 400);
    ok('Wochenziel gespeichert', /Kassenabrechnung alleine machen/.test(await d.page.locator('.lt-wochenziel').innerText().catch(() => '')));
    await d.page.getByLabel('Deine Frage an den Ausbilder').fill('Was ist eine Teigausbeute?');
    await click(d.page.getByRole('button', { name: 'Frage schicken' })); await settle(d.page, 400);
    ok('Frage an den Ausbilder: wartet auf Antwort', /Teigausbeute[\s\S]*Wartet auf die Antwort/.test(await d.page.locator('.lt-azubi-frage').innerText().catch(() => '')));
    ok('Quiz zu meinem Lehrjahr: Knopf da', (await d.page.locator('.lt-lehrjahr-quiz').count()) === 1);
    await click(d.page.locator('.lt-lehrjahr-quiz')); await settle(d.page, 700);
    ok('Quiz zu meinem Lehrjahr startet', (await d.page.locator('button.lt-qopt').count()) > 0);
    // Gute Sätze unter Nachschlagen
    await click(nav(d.page).filter({ hasText: /Nachschlagen/ }).first()); await settle(d.page, 500);
    await click(d.page.locator('button.lt-card', { hasText: 'Gute Sätze für die Theke' }).first()); await settle(d.page, 700);
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-satz').count()); w++) await sleep(100);
    ok('Gute Sätze: Seite mit Sätzen', (await d.page.locator('.lt-satz').count()) >= 3);
    // Hör-Lernen: Prüfungsfragen wählbar
    await click(nav(d.page).nth(1)); await settle(d.page, 500);
    await click(d.page.locator('main button', { hasText: 'Hör-Lernen' }).first()); await settle(d.page, 700);
    ok('Hör-Lernen: Prüfungsfragen wählbar', (await d.page.locator('main button', { hasText: /^Prüfungsfragen \(\d+\)$/ }).count()) === 1);
    ok('Azubi-Extras: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
    // Ausbilder beantwortet
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    probe.progress.anna._azubiFragen = { f1: { q: 'Was ist Teigausbeute?', ts: 1 } };
    const a = await device({ admin: true, backup: probe });
    for (let w = 0; w < 40 && !(await nav(a.page).filter({ hasText: 'Ausbildung' }).count()); w++) await sleep(100);
    await click(nav(a.page).filter({ hasText: 'Ausbildung' }).first()).catch(() => {});
    for (let w = 0; w < 40 && !(await a.page.locator('.lt-azubi-fragen-admin').count()); w++) await sleep(100);
    await a.page.getByLabel('Antwort an Anna').fill('Teig aus 100 kg Mehl.');
    await click(a.page.locator('.lt-azubi-fragen-admin button', { hasText: 'Antworten' })); await settle(a.page, 400);
    ok('Ausbilder: Frage beantwortet, steht unter „Beantwortet“', /Beantwortet \(1\)/.test(await a.page.locator('.lt-azubi-fragen-admin').innerText().catch(() => '')));
    ok('Ausbilder Azubi-Fragen: keine Fehler', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
  }]);
  // Version 255: Prüfungsgespräch im Theken-Simulator mit Bewertungsbogen
  teile.push(['Version 255: Prüfungsgespräch mit Bewertungsbogen', async () => {
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    await click(nav(d.page).nth(2)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible', { hasText: 'Theken-Simulator' }).first()); await settle(d.page, 1000);
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-pruefung-start').count()); w++) await sleep(100);
    await click(d.page.locator('.lt-pruefung-start')); await settle(d.page, 600);
    let schritte = 0, hinweise = 0;
    for (let i = 0; i < 30 && !(await d.page.locator('.lt-pruefungsbogen').count()); i++) {
      const o = d.page.locator('main button', { hasText: /\S/ }).filter({ has: d.page.locator('span') });
      const opt = d.page.locator('.lt-pop-in button').filter({ hasNotText: /Vorlesen|Nochmal hören/ });
      if (await opt.count()) { await click(opt.first()); schritte++; }
      await sleep(900);
      hinweise = Math.max(hinweise, await d.page.locator('.lt-msg', { hasText: /^✓ |^✗ / }).count());
      if (!(await d.page.locator('.lt-pop-in button').count()) && !(await d.page.locator('.lt-pruefungsbogen').count())) await sleep(500);
      void o;
    }
    const bogen = await d.page.locator('.lt-pruefungsbogen').innerText().catch(() => '');
    ok('Prüfungsgespräch: Bewertungsbogen mit Note am Ende', /Note \d/.test(bogen) && /Kontakt und Begrüßung/.test(bogen) && /Kassieren/i.test(bogen), bogen.slice(0, 80));
    ok('Prüfungsgespräch: langes Gespräch, keine Hinweise zwischendurch', schritte >= 5 && hinweise === 0, `${schritte} Schritte, ${hinweise} Hinweise`);
    ok('Prüfungsgespräch: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 254: Berufsschul-Lernkarten und eigene Karten (Ausbilder bestätigt)
  teile.push(['Version 254: Berufsschul-Lernkarten, eigene Karten', async () => {
    const M = kompiliere(['src/daten/berufsschule.ts', 'src/hilfen/eigeneKarten.ts']);
    const B = M.daten_berufsschule, E = M.hilfen_eigeneKarten;
    const ids = B.BERUFSSCHUL_KARTEN.map((k) => k.id);
    ok('Berufsschule: über 50 Karten, ids eindeutig, jedes Fach dabei', ids.length >= 50 && new Set(ids).size === ids.length && B.BS_FAECHER.every((f) => B.BERUFSSCHUL_KARTEN.some((k) => k.fach === f)));
    ok('Berufsschule: keine Gedankenstriche, keine Torten/Getränke', !B.BERUFSSCHUL_KARTEN.some((k) => /–|Torte|Getränk|belegte/.test(k.begriff + k.erklaerung)));
    const c = { progress: {} };
    E.karteSchreiben('anna', 'Anna', 'Teigausbeute', 'Teig aus 100 kg Mehl', 'Warenkunde', 5)(c);
    const id = Object.keys(c.progress.anna._eigeneKarten)[0];
    ok('Eigene Karte: wartet zuerst', E.alleEigenenKarten(c.progress)[0].s === 'warte');
    E.karteEntscheiden('anna', id, true)(c);
    ok('Eigene Karte: Ausbilder bestätigt', E.alleEigenenKarten(c.progress)[0].s === 'ok');
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    probe.progress.ben._role = 'azubi';
    probe.progress.ben._eigeneKarten = { k1: { b: 'Testbegriff Ben', e: 'Erklärung von Ben', f: 'Warenkunde', ts: 1, s: 'warte' } };
    const a = await device({ admin: true, backup: probe });
    for (let w = 0; w < 40 && !(await nav(a.page).filter({ hasText: 'Ausbildung' }).count()); w++) await sleep(100);
    await click(nav(a.page).filter({ hasText: 'Ausbildung' }).first()).catch(() => {});
    for (let w = 0; w < 40 && !(await a.page.locator('.lt-karten-bestaetigen').count()); w++) await sleep(100);
    ok('Ausbilder: Karte zum Bestätigen', /Testbegriff Ben/.test(await a.page.locator('.lt-karten-bestaetigen').innerText().catch(() => '')));
    await click(a.page.locator('.lt-karten-bestaetigen button', { hasText: 'Bestätigen' }).first()); await settle(a.page, 400);
    ok('Ausbilder: nach Bestätigen nichts mehr offen', (await a.page.locator('.lt-karten-bestaetigen').count()) === 0);
    ok('Ausbilder Karten: keine Fehler', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
    probe.progress.ben._eigeneKarten.k1.s = 'ok';
    const d = await device({ user: 'Anna', backup: probe, viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    for (let w = 0; w < 40 && !(await nav(d.page).filter({ hasText: 'Ausbildung' }).count()); w++) await sleep(100);
    await click(nav(d.page).filter({ hasText: 'Ausbildung' }).first()).catch(() => {});
    for (let w = 0; w < 40 && !(await d.page.locator('.lt-bs-karte').count()); w++) await sleep(100);
    const karte = d.page.locator('.lt-bs-karte');
    if (process.env.OFEN_BILD) await d.page.locator('.lt-bs-karten').screenshot({ path: process.env.OFEN_BILD + '-karten.png' }).catch(() => {});
    ok('Berufsschul-Karte mit Begriff vorne', (await karte.locator('.lt-bs-begriff').count()) === 1);
    await click(karte); await settle(d.page, 200);
    ok('Karte umgedreht: Erklärung', (await karte.locator('.lt-bs-erklaerung').count()) === 1);
    await click(d.page.locator('.lt-bs-karten button', { hasText: 'Wusste ich' })); await settle(d.page, 300);
    await click(d.page.locator('.lt-bs-karten button', { hasText: 'Eigene Karten' }).first()); await settle(d.page, 300);
    ok('Bestätigte Karte von Ben sichtbar', /Testbegriff Ben/.test(await karte.innerText().catch(() => '')));
    await click(d.page.getByRole('button', { name: 'Eigene Karte schreiben' })); await settle(d.page, 200);
    await d.page.getByLabel('Begriff').fill('Meine Testkarte');
    await d.page.getByLabel('Erklärung', { exact: true }).fill('So erkläre ich es');
    await click(d.page.getByRole('button', { name: 'Zum Bestätigen schicken' })); await settle(d.page, 400);
    ok('Eigene Karte geschickt, wartet', /Meine Testkarte · wartet auf Bestätigung/.test(await d.page.locator('.lt-eigene-karte').innerText().catch(() => '')));
    ok('Berufsschul-Karten: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 253: Rechen-Trainer und Prüfungs-Auswertung nach Themen
  teile.push(['Version 253: Rechen-Trainer, Prüfung nach Themen', async () => {
    const M = kompiliere(['src/games/rechenLogik.ts', 'src/hilfen/pruefungThemen.ts', 'src/daten/questions.ts']);
    const R = M.games_rechenLogik, T = M.hilfen_pruefungThemen, Q = M.daten_questions;
    const fehler = [];
    for (let i = 0; i < 600; i++) {
      for (const art of ['summe', 'rueckgeld', 'grundpreis', 'rabatt', 'mwst', 'dreisatz']) {
        const a = R.neueAufgabe(art);
        if (!(Number.isInteger(a.cent) && a.cent > 0) || !a.text || a.weg.length < 2 || /NaN|undefined/.test(a.text + a.weg.join())) fehler.push(art + ': ' + a.text);
        if (!a.weg.join(' ').includes(R.euro(a.cent))) fehler.push(art + ' Rechenweg ohne Ergebnis: ' + a.text);
      }
    }
    ok('Rechen-Trainer: 3600 Aufgaben sinnvoll, Rechenweg endet beim Ergebnis', fehler.length === 0, fehler.slice(0, 2).join(' | '));
    const g = R.neueAufgabe('grundpreis', () => 0.0);
    ok('Rechen-Trainer: Kilopreis richtig gerechnet', /wiegt (\d+) g und kostet/.test(g.text));
    const runde = R.neueRunde();
    ok('Rechen-Trainer: Runde mit 8 Aufgaben, alle Arten dabei', runde.length === 8 && new Set(runde.map((x) => x.art)).size === 6);
    const th = Q.examQuestions.map(T.pruefungsThema);
    ok('Prüfung: fast alle Fragen haben ein Thema', th.filter((x) => x === T.SONST).length <= 5, String(th.filter((x) => x === T.SONST).length));
    const aus = T.themenAuswertung([{ id: 1, question: 'Was ist Sauerteig im Brot?' }, { id: 2, question: 'Wie viel Mehrwertsteuer (MwSt) …' }, { id: 3, question: 'Mehltype?' }], new Set([2]));
    ok('Prüfung: Auswertung pro Thema, schwächstes zuerst', aus[0].thema === 'Rechnen und Kalkulation' && aus[0].pct === 0 && aus[1].pct === 100, JSON.stringify(aus));
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    await click(nav(d.page).nth(2)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible', { hasText: 'Rechen-Trainer' }).first()); await settle(d.page, 1000);
    await click(d.page.getByRole('button', { name: "Los geht's" })); await settle(d.page, 500);
    for (let w = 0; w < 30 && !(await d.page.locator('.lt-rechen-aufgabe').count()); w++) await sleep(100);
    ok('Rechen-Trainer: Aufgabe steht da', (await d.page.locator('.lt-rechen-aufgabe').innerText().catch(() => '')).length > 20);
    await d.page.getByLabel('Ergebnis in Euro').fill('1,23');
    await click(d.page.getByRole('button', { name: 'Prüfen' })); await settle(d.page, 300);
    ok('Rechen-Trainer: Rechenweg nach der Antwort', /So rechnest du/i.test(await d.page.locator('.lt-rechenweg').innerText().catch(() => '')));
    for (let i = 0; i < 8; i++) {
      const w = d.page.getByRole('button', { name: /^(Weiter|Auswertung)$/ });
      if (await w.count()) { await click(w.first()); await settle(d.page, 300); }
      if (await d.page.getByLabel('Ergebnis in Euro').count() && await d.page.getByRole('button', { name: 'Prüfen' }).count()) { await d.page.getByLabel('Ergebnis in Euro').fill('2'); await click(d.page.getByRole('button', { name: 'Prüfen' })); await settle(d.page, 200); }
    }
    ok('Rechen-Trainer: Auswertung am Ende', (await d.page.locator('.lt-receipt').count()) > 0);
    ok('Rechen-Trainer: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  teile.push(['Version 253: Prüfung, Auswertung nach Themen', async () => {
    const d = await device({ user: 'Anna', backup: SAMPLE, viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    // Prüfung üben (Ausbildung → 10 zufällige Fragen) → Themen-Auswertung
    for (let w = 0; w < 40 && !(await nav(d.page).filter({ hasText: 'Ausbildung' }).count()); w++) await sleep(100);
    await click(nav(d.page).filter({ hasText: 'Ausbildung' }).first()).catch(() => {}); await settle(d.page, 600);
    const zehn = d.page.getByRole('button', { name: /10 zufällige Fragen üben/ }).first();
    if (await zehn.count()) {
      await click(zehn); await settle(d.page, 600);
      for (let i = 0; i < 25 && !(await d.page.locator('.lt-themen-auswertung').count()); i++) {
        const o = d.page.locator('button.lt-qopt:visible'); if (await o.count()) { await click(o.first()); await settle(d.page, 150); }
        const w = d.page.getByRole('button', { name: /Nächste Frage|Kassenbon zeigen|Weiter|Abgeben|Auswerten/ }); if (await w.count()) { await click(w.first()); await settle(d.page, 200); }
      }
    }
    if (process.env.OFEN_BILD) await d.page.screenshot({ path: process.env.OFEN_BILD + '-pruefung.png' });
    ok('Prüfung: Auswertung nach Themen am Ende', (await d.page.locator('.lt-themen-auswertung').count()) === 1);
    const ueb = d.page.locator('.lt-themen-auswertung button', { hasText: 'Hier noch üben' });
    if (await ueb.count()) { await click(ueb.first()); await settle(d.page, 600); }
    ok('Prüfung: „Hier noch üben“ startet ein Quiz', !(await ueb.count()) || (await d.page.locator('button.lt-qopt').count()) > 0);
    ok('Prüfung Themen: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 252: Azubi-Bereich (Lehrjahr aus Beginn, Bestätigung, Üben, Notizen der Woche)
  teile.push(['Version 252: Azubi-Bereich ausgebaut', async () => {
    const A = kompiliere(['src/hilfen/azubi.ts']).hilfen_azubi;
    const h = new Date(2026, 10, 19);
    ok('Azubi: Lehrjahr aus dem Ausbildungsbeginn', A.lehrjahrAus('2026-08', h) === 1 && A.lehrjahrAus('2025-08', h) === 2 && A.lehrjahrAus('2024-09', h) === 3 && A.lehrjahrAus('2020-01', h) === 3 && A.lehrjahrAus('', h) === 0);
    const fr = [{ category: 'Arbeit & Hygiene', question: 'Hände waschen?', options: ['a', 'b'] }, { category: 'Service & Verkauf', question: 'Wie gehst du mit einer Reklamation um?', options: ['a', 'b'] }];
    ok('Azubi: Üben findet passende Fragen', A.fragenZuPunkt('j1_hygiene', fr).length === 1 && A.fragenZuPunkt('j2_reklamation', fr).length === 1);
    const mo = new Date(2026, 10, 16);
    const g = A.geuebtInWoche([{ id: 'anna_' + new Date(2026, 10, 17, 9).getTime(), username: 'Anna', category: 'Kassenblitz ⚡' }, { id: 'anna_' + new Date(2026, 10, 18, 9).getTime(), username: 'Anna', category: 'Kassenblitz ⚡' }, { id: 'anna_' + new Date(2026, 10, 2).getTime(), username: 'Anna', category: 'Quiz' }], 'anna', mo);
    ok('Azubi: „diese Woche geübt“ aus der Bestenliste', g.length === 1 && /Kassenblitz/.test(g[0]) && /2×/.test(g[0]), JSON.stringify(g));
    const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'src/ui/ausbildung.tsx'), 'utf8');
    ok('Ausbildungsplan ohne belegte Brötchen', !/Belegte Brötchen und Snacks zubereiten/.test(src) && /Ware vorbereiten und Theke auffüllen/.test(src));
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    probe.progress.anna._azubiPlan = { j1_hygiene: true, j1_kasse: true };
    probe.progress.anna._azubiOk = { j1_hygiene: Date.now() };
    // Ausbilder bestätigt
    const a = await device({ admin: true, backup: probe });
    for (let w = 0; w < 40 && !(await nav(a.page).filter({ hasText: 'Ausbildung' }).count()); w++) await sleep(100);
    await click(nav(a.page).filter({ hasText: 'Ausbildung' }).first()).catch(() => {});
    for (let w = 0; w < 40 && !(await a.page.locator('.lt-azubi-bestaetigen').count()); w++) await sleep(100);
    const best = a.page.locator('.lt-azubi-bestaetigen button');
    ok('Ausbilder: offener Punkt wartet auf Bestätigung', (await best.count()) === 1, String(await best.count()));
    if (await best.count()) { await click(best.first()); await settle(a.page, 400); }
    ok('Ausbilder: nach Bestätigen nichts mehr offen', (await a.page.locator('.lt-azubi-bestaetigen').count()) === 0);
    ok('Ausbilder Azubis: keine Fehler', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
    // Azubi
    const d = await device({ user: 'Anna', backup: probe, viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    for (let w = 0; w < 40 && !(await nav(d.page).filter({ hasText: 'Ausbildung' }).count()); w++) await sleep(100);
    await click(nav(d.page).filter({ hasText: 'Ausbildung' }).first()).catch(() => {});
    for (let w = 0; w < 40 && !(await d.page.locator('.lt-azubi-start').count()); w++) await sleep(100);
    await d.page.getByLabel('Ausbildungsbeginn').fill('2025-08'); await settle(d.page, 500);
    ok('Azubi: Lehrjahr rechnet sich aus dem Beginn', /im 2\. Lehrjahr/.test(await d.page.locator('.lt-azubi-start').innerText().catch(() => '')));
    if (process.env.OFEN_BILD) await d.page.screenshot({ path: process.env.OFEN_BILD + '-azubi.png', fullPage: true });
    const punkte = await d.page.locator('.lt-planpunkt').allInnerTexts();
    ok('Azubi: bestätigt und wartend werden angezeigt', punkte.some((t) => /Vom Ausbilder bestätigt/.test(t)) && punkte.some((t) => /Wartet auf Bestätigung/.test(t)));
    const ueben = d.page.locator('.lt-ueben button', { hasText: /^Üben: Quiz/ });
    ok('Azubi: „Üben“-Knöpfe da', (await ueben.count()) > 0);
    await d.page.locator('.lt-bericht-notiz').fill('Testnotiz der Woche');
    await d.page.locator('.lt-bericht-notiz').blur(); await settle(d.page, 400);
    await click(d.page.getByRole('button', { name: /Woche davor/ })); await settle(d.page, 300);
    const leer = await d.page.locator('.lt-bericht-notiz').inputValue();
    await click(d.page.getByRole('button', { name: /Woche danach/ })); await settle(d.page, 300);
    ok('Azubi: Notizen pro Woche gespeichert', leer === '' && (await d.page.locator('.lt-bericht-notiz').inputValue()) === 'Testnotiz der Woche', leer);
    if (await ueben.count()) { await click(ueben.first()); await settle(d.page, 800); }
    ok('Azubi: Üben startet ein Quiz', (await d.page.locator('.lt-frage').count()) > 0);
    ok('Azubi-Bereich: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 251: Lieblingsfragen (Stern), Urlaubsmodus, Willkommen zurück
  teile.push(['Version 251: Lieblingsfragen, Urlaub, Willkommen zurück', async () => {
    const U = kompiliere(['src/hilfen/urlaub.ts']).hilfen_urlaub;
    const h = new Date(2026, 10, 19);
    ok('Willkommen zurück: nach 7 Tagen Pause ja, nach 3 nein, ganz Neue nein', U.willkommenZurueck(['2026-11-10', '2026-11-19'], h) && !U.willkommenZurueck(['2026-11-16'], h) && !U.willkommenZurueck([], h) && !U.willkommenZurueck(['2026-11-19'], h));
    const pr = {};
    ok('Urlaub: 6 Wochen gehen, mehr nicht', U.urlaubPruefen(pr, '2026-11-20', '2026-12-31', h) === '' && /6 Wochen/.test(U.urlaubPruefen(pr, '2026-11-20', '2027-01-30', h) + U.urlaubPruefen({ _urlaub: [{ von: '2026-01-01', bis: '2026-02-05' }] }, '2026-11-20', '2026-11-30', h)));
    U.urlaubEintragen(pr, '2026-11-15', '2026-11-25');
    ok('Urlaub: Tage, heute im Urlaub, Überschneidung abgelehnt', U.urlaubsTage(pr, '2026-11-19').length === 5 && U.urlaubHeute(pr, h).bis === '2026-11-25' && /schon Urlaub/.test(U.urlaubPruefen(pr, '2026-11-24', '2026-11-28', h)));
    U.urlaubBeenden(pr, h);
    ok('Urlaub: „Ich bin zurück“ beendet ihn gestern', U.urlaubeVon(pr)[0].bis === '2026-11-18' && !U.urlaubHeute(pr, h));
    const Ser = kompiliere(['src/basis/serie.tsx']).basis_serie;
    const tage = []; for (let i = 20; i >= 12; i--) { const d = new Date(); d.setDate(d.getDate() - i); if (d.getDay() !== 0) tage.push(Ser.dayKey(d)); }
    const ur = []; for (let i = 11; i >= 1; i--) { const d = new Date(); d.setDate(d.getDate() - i); ur.push(Ser.dayKey(d)); }
    ok('Urlaub: Lern-Serie reißt im Urlaub nicht', Ser.computeStreak(tage, ur).current >= 5 && Ser.computeStreak(tage, []).current === 0, `${Ser.computeStreak(tage, ur).current}`);
    // In der App: Stern im Quiz, Lieblingsfragen-Karte, Urlaub eintragen
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    await click(nav(d.page).nth(1)); await settle(d.page, 600);
    ok('Lieblingsfragen: Karte erst da, wenn eine Frage gemerkt ist', (await d.page.locator('.lt-lieblingsfragen').count()) === 0);
    await click(d.page.locator('main button.lt-card:visible').first()); await settle(d.page, 600);
    for (let i = 0; i < 4 && !(await d.page.locator('.lt-lieblings-stern').count()); i++) { const b = d.page.locator('main button:visible', { hasText: /Gemischt|Leicht|Alle|Los|Start/ }).first(); if (await b.count()) { await click(b); await settle(d.page, 600); } else break; }
    const stern = d.page.locator('.lt-lieblings-stern');
    ok('Lieblingsfragen: Stern im Quiz', (await stern.count()) === 1);
    if (await stern.count()) { await click(stern); await settle(d.page, 300); }
    ok('Lieblingsfragen: Stern bleibt an', (await stern.getAttribute('aria-pressed').catch(() => '')) === 'true');
    await click(nav(d.page).nth(0)); await settle(d.page, 500); await click(nav(d.page).nth(1)); await settle(d.page, 600);
    const zurueck = d.page.getByRole('button', { name: /Zurück|Bereiche/ }).first(); if (!(await d.page.locator('.lt-lieblingsfragen').count()) && await zurueck.count()) { await click(zurueck); await settle(d.page, 500); }
    ok('Lieblingsfragen: Karte unter Lernen mit 1 Frage', /1 Frage/.test(await d.page.locator('.lt-lieblingsfragen').innerText().catch(() => '')));
    await click(d.page.getByRole('button', { name: 'Menü' }).first()); await click(d.page.getByRole('menuitem', { name: 'Urlaub' }).first()); await settle(d.page, 600);
    const dk = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    const b = new Date(); b.setDate(b.getDate() + 5);
    await d.page.getByLabel('Letzter Urlaubstag').fill(dk(b));
    await click(d.page.getByRole('button', { name: 'Urlaub eintragen' })); await settle(d.page, 500);
    ok('Urlaub: eingetragen, „im Urlaub bis …“ und „Ich bin schon zurück“', (await d.page.locator('.lt-urlaub-jetzt').count()) === 1);
    await click(d.page.getByRole('button', { name: 'Ich bin schon zurück' })); await settle(d.page, 500);
    ok('Urlaub: vorzeitig beendet', (await d.page.locator('.lt-urlaub-jetzt').count()) === 0);
    ok('Lieblingsfragen und Urlaub: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 250: falsch gewählte Antwort für den Ausbilder, Steckbrief mit Backtagen, Preis geändert, Spickzettel, an Kollegen schicken
  teile.push(['Version 250: falsch gewählte Antworten, Steckbrief-Extras', async () => {
    const M = kompiliere(['src/hilfen/falscheAntworten.ts', 'src/hilfen/steckbriefExtras.ts']);
    const F = M.hilfen_falscheAntworten, S = M.hilfen_steckbriefExtras;
    const pr = {}; F.merkeFalsch(pr, 7, 'Roggen'); F.merkeFalsch(pr, 7, 'Roggen'); F.merkeFalsch(pr, 7, 'Dinkel');
    ok('Falsche Antwort: wird gezählt, häufigste zuerst', JSON.stringify(F.falschVon(pr, 7)) === JSON.stringify([{ text: 'Roggen', n: 2 }, { text: 'Dinkel', n: 1 }]), JSON.stringify(F.falschVon(pr, 7)));
    for (let i = 0; i < 6; i++) F.merkeFalsch(pr, 8, 'A' + i);
    ok('Falsche Antwort: höchstens 4 pro Frage', F.falschVon(pr, 8).length === 4);
    const team = F.falschImTeam({ a: pr, b: { _falschGewaehlt: { 7: [['Roggen', 1, 1]] } } }, ['a', 'b'], 7);
    ok('Falsche Antwort: Team zusammengezählt mit Namen', team[0].text === 'Roggen' && team[0].n === 3 && team[0].wer.join() === 'a,b', JSON.stringify(team));
    ok('Falsche Antwort: Text der Auswahl (auch mehrere)', F.gewaehlterText({ options: ['x', 'y', 'z'] }, 1) === 'y' && F.gewaehlterText({ options: ['x', 'y', 'z'] }, [2, 0]) === 'x + z');
    const bt = (n) => (S.backtageVon(n) || { tage: [] }).tage.join(',');
    ok('Backtage aus dem Backkalender', bt('Chia-Brot') === 'Mo' && bt('Kartäuser').split(',').length >= 2 && bt('Bärentatze') !== '' && bt('Laugenbrezel') === '', `Chia ${bt('Chia-Brot')}, Kartäuser ${bt('Kartäuser')}, Bärentatze ${bt('Bärentatze')}, Brezel ${bt('Laugenbrezel')}`);
    const fx = S.preisMerken({ price: '2,50 €' }, undefined, '2,30 €', 1000);
    const fx2 = S.preisMerken({ price: '2,50 €' }, fx, '2,50 €', 5000);
    ok('Preis geändert: Datum und alter Preis gemerkt, bleibt beim nächsten Speichern', fx.priceTs === 1000 && fx.priceVorher === '2,30 €' && fx2.priceTs === 1000 && fx2.priceVorher === '2,30 €');
    const pit = S.produkteImText('Sind in den Laugenbrezeln Nüsse? Und im Chia-Brot?');
    ok('Kundenfrage: passende Steckbriefe im Text gefunden', pit.includes('Laugenbrezel') && pit.includes('Chia-Brot') && S.produkteImText('Wie spät ist es?').length === 0, pit.join(', '));
    // Ausbilder sieht die falsche Antwort
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    probe.progress.anna._falschGewaehlt = { 4001: [['Falsche Testantwort', 2, Date.now()]] };
    probe.progress.ben._nachrichten = { m5000: { an: { anna: 'Anna' }, t: 'Schau dir mal den Steckbrief „Chia-Brot“ an.', ts: 5000, sb: 'Chia-Brot' } };
    const a = await device({ admin: true, backup: probe });
    await click(a.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(a.page);
    for (let w = 0; w < 50 && !(await a.page.locator('[role=tab]').count()); w++) await sleep(100);
    await click(a.page.locator('button', { hasText: 'Ganzes Team' }).first()); await settle(a.page, 500);
    const txt = await a.page.locator('.lt-falsch-gewaehlt').first().innerText().catch(() => '');
    ok('Ausbilder: „Falsch gewählt“ mit Antwort und Name', /Falsche Testantwort/.test(txt) && /Anna/.test(txt), txt.slice(0, 80));
    ok('Ausbilder falsche Antworten: keine Fehler', a.errors.length === 0, a.errors[0]);
    await a.ctx.close();
    // Mitarbeiter: Steckbrief per Nachricht bekommen, Backtage, Spickzettel, an Kollegen schicken
    const d = await device({ user: 'Anna', backup: probe, viewport: { width: 390, height: 844 } });
    let pop = false;
    for (let i = 0; i < 20 && !pop; i++) { pop = (await d.page.locator('.lt-einzel-popup').count()) > 0; if (!pop) { const o = d.page.locator('.lt-overlay:visible button:visible, [role=dialog][aria-modal=true]:visible button:visible'); if (await o.count()) await o.last().click({ timeout: 2000 }).catch(() => {}); await sleep(400); } }
    ok('Steckbrief-Nachricht: Pop-up mit „Steckbrief ansehen“', pop && (await d.page.locator('.lt-einzel-popup .lt-sb-ansehen').count()) === 1);
    if (pop) { await click(d.page.locator('.lt-einzel-popup .lt-sb-ansehen')); await settle(d.page, 800); }
    for (let w = 0; w < 40 && !(await d.page.locator('.fc-sheet').count()); w++) await sleep(100);
    const kopf = await d.page.locator('.lt-sb-kopf').innerText().catch(() => '');
    ok('Steckbrief-Nachricht öffnet den Steckbrief', /Chia-Brot/.test(kopf), kopf.slice(0, 40));
    const back = await d.page.locator('.lt-backtage').innerText().catch(() => '');
    ok('Steckbrief: Backtage stehen drin', /Backtage/i.test(back) && /Mo/.test(back), back.slice(0, 60));
    ok('Steckbrief: „An Kollegen schicken“ da', (await d.page.getByRole('button', { name: 'An Kollegen schicken' }).count()) === 1);
    await click(d.page.getByRole('button', { name: 'An Kollegen schicken' })); await settle(d.page, 300);
    await d.page.getByLabel('Kollege').selectOption({ label: 'Ben' }).catch(() => {});
    await click(d.page.getByRole('button', { name: 'Schicken', exact: true })); await settle(d.page, 400);
    ok('Steckbrief an Kollegen geschickt', (await d.page.locator('.lt-sb-schicken').innerText().catch(() => '')).includes('an Ben geschickt'));
    await click(d.page.getByRole('button', { name: 'Schließen' }).first()); await settle(d.page, 500);
    const zul = await d.page.locator('.lt-zuletzt').innerText().catch(() => '');
    ok('Spickzettel: „Zuletzt angesehen“ zeigt Chia-Brot', /Chia-Brot/.test(zul), zul.slice(0, 60));
    ok('Steckbrief-Extras: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 249: Ofen-Kette (fallende Produktfotos, 4 gleiche werden goldbraun)
  teile.push(['Version 249: Ofen-Kette (fallende Produktfotos, 4 gleiche werden goldbraun)', async () => {
    const O = kompiliere(['src/games/ofenLogik.ts']).games_ofenLogik;
    let vier = 0; for (let i = 0; i < 2000; i++) { const t = O.neuesTeil(4 + (i % 7)); if (new Set(t.zellen.map((z) => z.p)).size < 2) vier++; }
    ok('Ofen-Kette: ein Teil hat nie 4 gleiche Bilder', vier === 0, `${vier} Teile`);
    const r = O.leeresRaster(), K = (p) => ({ p, glut: 0, alter: 0 });
    r[11][0] = K(1); r[11][1] = K(1); r[10][1] = K(1); r[10][2] = K(1); r[11][2] = K(2);
    const g1 = O.findeGruppen(r, (p) => p);
    ok('Ofen-Kette: 4 gleiche zusammenhängend werden erkannt', g1.weg.size === 4 && g1.gruppen.length === 1, JSON.stringify([...g1.weg]));
    r[10][2].alter = O.VERBRANNT_AB;
    ok('Ofen-Kette: verbranntes Bild zählt nicht für 4 gleiche', O.findeGruppen(r, (p) => p).weg.size === 0);
    for (let x = 0; x < O.COLS; x++) r[11][x] = r[11][x] || K(5);
    ok('Ofen-Kette: volle Reihe erkannt (auch mit verbranntem Bild)', O.volleReihen(r).join() === '11');
    const r2 = O.leeresRaster(); r2[3][0] = K(7); O.nachRutschen(r2);
    ok('Ofen-Kette: Bilder rutschen nach unten', r2[11][0] && r2[11][0].p === 7 && !r2[3][0]);
    const r3 = O.leeresRaster(); r3[11][3] = K(2); r3[11][6] = K(2); r3[11][0] = K(4); r3[10][3] = { p: -1, glut: 0, alter: 0, gold: true };
    ok('Ofen-Kette: goldenes Brötchen backt alle gleichen darunter weg', O.goldZiel(r3, 3, 10, (p) => p).size === 3);
    const P = kompiliere(['src/daten/shopProducts.ts']).daten_shopProducts.SHOP_PRODUCTS;
    const kopf = (a) => a.replace(/\s*\(.*\)\s*$/, '').trim(); const fehlerA = [];
    for (const p of P) for (let i = 0; i < 5; i++) {
      const f = O.allergenFrage(p.name); if (!f) continue;
      const drin = p.allergens.map(kopf);
      if (!drin.includes(f.richtig) || f.optionen.filter((o) => drin.includes(o)).length !== 1 || f.optionen.length !== 3 || f.optionen.includes('Soja')) fehlerA.push(p.name + ': ' + f.optionen.join('/'));
    }
    ok('Ofen-Kette: Allergen-Frage hat genau eine richtige Antwort, nie Soja', fehlerA.length === 0, fehlerA.slice(0, 2).join(' | '));
    const alle = O.ofenSortiment(10), a1 = O.tagesAuswahl(alle, new Date(2026, 10, 18)), a2 = O.tagesAuswahl(alle, new Date(2026, 10, 18)), a3 = O.tagesAuswahl(alle, new Date(2026, 10, 19));
    ok('Ofen-Kette: 10 Produkte am Tag, für alle gleich, jeden Tag andere, mehrere Gruppen', a1.length === 10 && new Set(a1).size === 10 && a1.join() === a2.join() && a1.join() !== a3.join() && new Set(a1.map(O.gruppeVon)).size >= 4, a1.join(', '));
    ok('Ofen-Kette: keine Weihnachtsware im Juni', !O.ofenSortiment(5).some((n) => O.gruppeVon(n) === 'Weihnachtsgebäck'));
    ok('Ofen-Kette: höchstens 250 Punkte, ruhig zählt halb', O.bestenlistenPunkte(900, false) === 250 && O.bestenlistenPunkte(100, true) === 50 && O.bestenlistenPunkte(900, true) === 125);
    ok('Ofen-Kette: Gruppen-Tag mittwochs und samstags', O.istGruppenTag(new Date(2026, 10, 18)) && O.istGruppenTag(new Date(2026, 10, 21)) && !O.istGruppenTag(new Date(2026, 10, 19)));
    // In der App, am Handy
    const d = await device({ user: 'Anna', viewport: { width: 390, height: 844 } });
    await clearPopups(d.page);
    await click(nav(d.page).nth(2)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible', { hasText: 'Ofen-Kette' }).first()); await settle(d.page, 1200);
    for (let w = 0; w < 50 && !(await d.page.locator('.lt-ok-heute img').count()); w++) await sleep(100);
    ok('Ofen-Kette: „Heute im Ofen“ zeigt 10 Produkte mit Foto', (await d.page.locator('.lt-ok-heute img').count()) === 10, String(await d.page.locator('.lt-ok-heute img').count()));
    await click(d.page.getByRole('button', { name: 'Ofen an', exact: true })); await settle(d.page, 800);
    for (let w = 0; w < 50 && !(await d.page.locator('.lt-ok-ofen canvas').count()); w++) await sleep(100);
    const cv = await d.page.locator('.lt-ok-ofen canvas').boundingBox();
    ok('Ofen-Kette: Spielfeld groß genug (Bild mind. 36 Punkte breit), passt in die Breite', cv && cv.width / 7 >= 36 && cv.x >= 0 && cv.x + cv.width <= 390, JSON.stringify(cv));
    ok('Ofen-Kette: Bestellung steht oben', /\d× \S/.test(await d.page.locator('.lt-ok-bestellung').innerText().catch(() => '')));
    const fallen = d.page.getByRole('button', { name: 'Fallen lassen' });
    if (process.env.OFEN_BILD) { await sleep(1500); await d.page.screenshot({ path: process.env.OFEN_BILD + '-1.png' }); }
    for (let i = 0; i < 12; i++) { await clearPopups(d.page); await click(fallen); await sleep(900); if (await d.page.locator('.lt-ok-bon').count()) break; }
    const breit = await d.page.evaluate(() => document.documentElement.scrollWidth);
    ok('Ofen-Kette: nichts steht seitlich über', breit <= 392, String(breit));
    if (!(await d.page.locator('.lt-ok-bon').count())) { await click(d.page.getByRole('button', { name: /Beenden/ })); await settle(d.page, 500); }
    for (let w = 0; w < 50 && !(await d.page.locator('.lt-ok-bon').count()); w++) await sleep(100);
    const bon = await d.page.locator('.lt-ok-bon').innerText().catch(() => '');
    if (process.env.OFEN_BILD) await d.page.screenshot({ path: process.env.OFEN_BILD + '-2.png', fullPage: true });
    ok('Ofen-Kette: Ergebnis als Kassenbon mit Summe', /SUMME/i.test(bon) && /Längste Kette/i.test(bon), bon.slice(0, 120));
    ok('Ofen-Kette: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 213: Telefon-Bestellung (Kunde ruft an, Bestellzettel ausfüllen)
  teile.push(['Version 213: Telefon-Bestellung (Kunde ruft an, Bestellzettel ausfüllen)', async () => {
    const T = kompiliere(['src/games/telefonLogik.ts']).games_telefonLogik;
    const fehler = [];
    const BACK = { 'Burgunderstuten': [4], 'Jan-Wellem Stuten': [3], 'Chia-Brot': [0], 'Reines Roggen': [1, 3], 'Buchweizenbrot': [1, 3], 'Heidesand': [0], 'Kokosmakronen': [1, 3] };
    for (let i = 0; i < 400; i++) {
      const stufe = T.STUFEN_RUNDE[i % T.STUFEN_RUNDE.length];
      const b = T.neueBestellung(stufe, new Set(), 10);
      const satz = b.text.join(' ');
      if (/–/.test(satz)) fehler.push('Gedankenstrich: ' + satz);
      if ((satz.match(/Und zwar/g) || []).length > 1) fehler.push('Doppelt „Und zwar“: ' + satz);
      if (b.tag === 5 && b.zeit > 15 * 60) fehler.push('Samstag zu spät: ' + satz);
      if (b.zeit >= 13 * 60 && !/nachmittags|\d+ Uhr/.test(satz)) fehler.push('Nachmittag nicht eindeutig: ' + satz);
      for (const p of b.positionen) {
        if (BACK[p.name] && !BACK[p.name].includes(b.tag)) fehler.push(`${p.name} an ${T.TAGE[b.tag]} gibt es nicht`);
        if (p.name === 'Landbaguette' && b.zeit < 11 * 60) fehler.push('Landbaguette vor 11 Uhr');
        if (p.geschnitten !== undefined && !T.schneidbar(p.name)) fehler.push(`${p.name} wird nicht geschnitten`);
        if (/ (\d+|zwei|drei) (Großes|Kleines|Schweineohr |Innsbrucker Roggenlaib\b)/.test(satz)) fehler.push('Mehrzahl falsch: ' + satz);
      }
      if (!b.positionen.every((p) => b.auswahl.includes(p.name))) fehler.push('Bestelltes fehlt auf dem Zettel');
      if (b.auswahl.length < 8 || new Set(b.auswahl).size !== b.auswahl.length) fehler.push('Zettel zu kurz oder doppelt');
      if (!satz.includes(b.name)) fehler.push('Name fehlt im Anruf');
      // alles richtig ausgefüllt → alles grün; eine Menge falsch → genau ein Fehler
      const z = { name: b.name.toLowerCase(), tag: b.tag, zeit: b.zeit, mengen: Object.fromEntries(b.positionen.map((p) => [p.name, p.menge])), geschnitten: Object.fromEntries(b.positionen.filter((p) => p.geschnitten).map((p) => [p.name, true])) };
      if (!T.pruefe(b, z).every((r) => r.ok)) fehler.push('Richtiger Zettel nicht erkannt: ' + JSON.stringify(T.pruefe(b, z).filter((r) => !r.ok)));
      const z2 = { ...z, mengen: { ...z.mengen, [b.positionen[0].name]: b.positionen[0].menge + 1 } };
      if (T.pruefe(b, z2).filter((r) => !r.ok).length !== 1) fehler.push('Falsche Menge nicht genau einmal erkannt');
    }
    // Ganzes Sortiment: nach wenigen Runden war jeder Artikel einmal dran
    const alle = T.sortiment(10).map((a) => a.name); const g = new Set(); let anrufe = 0;
    while (alle.some((x) => !g.has(x)) && anrufe < 300) { T.neueBestellung(T.STUFEN_RUNDE[anrufe % 5], g, 10).positionen.forEach((p) => g.add(p.name)); anrufe++; }
    ok(`Telefon-Bestellung: ganzes Sortiment (${alle.length} Artikel) nach ${anrufe} Anrufen einmal dran`, anrufe < 100 && alle.every((x) => g.has(x)), `${anrufe} Anrufe`);
    ok('Telefon-Bestellung: 400 Anrufe (alle Stufen) sinnvoll, Prüfung stimmt', fehler.length === 0, fehler.slice(0, 2).join(' | '));
    ok('Telefon-Bestellung: Süßes wird nie geschnitten', !T.schneidbar('Wunderzopf') && !T.schneidbar('Rosinenstriezel') && !T.schneidbar('Heidesand') && !T.schneidbar('Berliner') && T.schneidbar('Münsterländer'));
    ok('Telefon-Bestellung: Name tolerant (Krueger = Krüger, ein Tippfehler)', T.nameStimmt('krueger', 'Krüger') && T.nameStimmt('Schmiz', 'Schmitz') && !T.nameStimmt('Weber', 'Becker'));
    ok('Telefon-Bestellung: Uhrzeit wie gesprochen', T.zeitGesprochen(8 * 60 + 30) === 'um halb neun' && T.zeitGesprochen(16 * 60) === 'um vier Uhr nachmittags' && T.zeitGesprochen(15 * 60 + 45) === 'um Viertel vor vier nachmittags');
    const d = await device({ user: 'Anna' });
    await clearPopups(d.page);
    await click(nav(d.page).nth(2)); await settle(d.page);
    await click(d.page.locator('button.lt-card:visible', { hasText: 'Telefon-Bestellung' }).first()); await settle(d.page, 1200);
    await click(d.page.getByRole('button', { name: 'Anruf annehmen' })); await settle(d.page, 800);
    const zettel = d.page.locator('.lt-bestellzettel');
    ok('Telefon-Bestellung: Bestellzettel (mind. 8 Waren) und Stufe „Einfach“', (await zettel.count()) > 0 && (await d.page.locator('.lt-zettel-zeile').count()) >= 8 && (await d.page.getByText('Einfach', { exact: true }).count()) > 0);
    const lesen = d.page.getByRole('button', { name: 'Text lesen' });
    if (await lesen.count()) { await click(lesen); await settle(d.page, 300); }
    const text = await d.page.locator('.lt-telefon-text').innerText().catch(() => '');
    ok('Telefon-Bestellung: Anruf als Text lesbar', text.length > 30, text.slice(0, 80));
    await d.page.getByLabel('Name des Kunden').fill('Test');
    await click(d.page.getByRole('button', { name: /mehr$/ }).first()); await settle(d.page, 200);
    await click(d.page.getByRole('button', { name: 'Bestellung prüfen' })); await settle(d.page, 500);
    ok('Telefon-Bestellung: Prüfung zeigt richtig/falsch', (await d.page.locator('.lt-telefon-ergebnis').count()) > 0 && (await d.page.getByText(/richtig: /).count()) > 0);
    ok('Telefon-Bestellung: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 212: Was wird genutzt? (nur Summen, keine Namen) und Erinnerung an die Sicherung
  teile.push(['Version 212: Was wird genutzt? (nur Summen, keine Namen) und Erinnerung an die Sicherung', async () => {
    const N = kompiliere(['src/hilfen/nutzung.ts']).hilfen_nutzung;
    const m = N.monatJetzt();
    const sum = N.addiereNutzung({ [m]: { quiz: 2 } }, { [m]: { quiz: 3, theke: 1 } });
    ok('Nutzung: Zählungen werden addiert', sum[m].quiz === 5 && sum[m].theke === 1, JSON.stringify(sum));
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    const namen = Object.keys(probe.progress || {}).filter((k) => k !== 'admin');
    namen.forEach((k, i) => { probe.progress[k]._nutzung = { [m]: { theke: 5 + i, quiz: 2 } }; });
    const team = N.teamNutzung(probe.progress, m);
    ok('Nutzung: Team-Summe ohne Namen', team[0] && team[0].seite === 'theke' && team[0].personen === namen.length, JSON.stringify(team.slice(0, 2)));
    const d = await device({ admin: true, backup: probe });
    await click(d.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(d.page);
    for (let w = 0; w < 50 && !(await d.page.locator('[role=tab]').count()); w++) await sleep(100);
    const erinnerung = d.page.locator('.lt-sicherung-erinnerung');
    ok('Sicherung: Erinnerung oben im Ausbilder-Bereich', (await erinnerung.count()) > 0);
    if (await erinnerung.count()) {
      const [dl] = await Promise.all([d.page.waitForEvent('download', { timeout: 5000 }).catch(() => null), click(erinnerung.getByRole('button', { name: 'Jetzt sichern' }))]);
      await settle(d.page, 600);
      ok('Sicherung: „Jetzt sichern“ lädt Datei herunter, Erinnerung verschwindet', !!dl && /lern-theke-sicherung/.test(dl.suggestedFilename()) && (await erinnerung.count()) === 0, dl ? dl.suggestedFilename() : 'kein Download');
    }
    await click(d.page.getByRole('tab', { name: 'Auswertung' })); await settle(d.page, 500);
    const box = d.page.locator('.lt-nutzung');
    ok('Ausbilder: „Was wird genutzt?“ zeigt Theken-Simulator oben', (await box.count()) > 0 && (await box.locator('.lt-nutzung-zeile').first().innerText()).includes('Theken-Simulator'));
    ok('Nutzung und Sicherung: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Version 224: Ausbilder schreibt Einzel-Nachrichten und vergibt das Recht dazu
  teile.push(['Version 224: Ausbilder schreibt Einzel-Nachrichten und vergibt das Recht dazu', async () => {
    // Version 225: neue Antwort auf eine Nachricht des Ausbilders zeigt „(1 neu)“ am Reiter
    const NM = kompiliere(['src/hilfen/nachrichten.ts']).hilfen_nachrichten;
    const probe = JSON.parse(JSON.stringify(SAMPLE));
    const wer = Object.keys(probe.progress).find((k) => k !== 'admin');
    probe.progress.admin = { ...(probe.progress.admin || {}), _nachrichten: { m1000: { an: { [wer]: wer }, t: 'Testnachricht', ts: 1000 } } };
    probe.progress[wer]._postfach = { [NM.postfachKey('admin', 'm1000')]: { g: 2000, a: 'Alles klar', aTs: 2000 } };
    const d = await device({ admin: true, backup: probe });
    await click(d.page.locator('[aria-label="Ausbilder"]:visible, [title="Ausbilder"]:visible').last()); await settle(d.page);
    for (let w = 0; w < 50 && !(await d.page.locator('[role=tab]').count()); w++) await sleep(100);
    ok('Ausbilder: neue Antwort zeigt „(1 neu)“ am Reiter', (await d.page.getByRole('tab', { name: 'Nachricht & Umfrage (1 neu)' }).count()) === 1);
    await click(d.page.getByRole('tab', { name: 'Nachricht & Umfrage' })); await settle(d.page, 800);
    ok('Ausbilder: Antwort sichtbar, Zahl verschwindet nach dem Öffnen', (await d.page.locator('.lt-einzel-gesendet').innerText().catch(() => '')).includes('Alles klar') && (await d.page.getByRole('tab', { name: /neu\)/ }).count()) === 0);
    const recht = d.page.locator('.lt-einzel-recht button');
    ok('Ausbilder: „Nachricht an einzelne“ und „Wer darf schicken?“ da', (await d.page.locator('.lt-einzel-schreiben').count()) > 0 && (await recht.count()) > 0);
    if (await recht.count()) { await click(recht.first()); await settle(d.page, 300); }
    ok('Ausbilder: Recht vergeben schaltet um', (await recht.first().getAttribute('aria-pressed').catch(() => '')) === 'true');
    ok('Ausbilder Einzel-Nachrichten: keine Fehler', d.errors.length === 0, d.errors[0]);
    await d.ctx.close();
  }]);
  // Ausbilder-Bereich: alle Reiter mit Beispieldaten
  teile.push(['Ausbilder-Bereich: alle Reiter mit Beispieldaten', async () => {
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
    // Produktliste aus Excel: Datei hochladen, Felder wählen, Vorschau, übernehmen
    try {
      const writeXlsx = require('write-excel-file/node');
      const tabelle = [['Produktname', 'Preis Filiale (Kasse)', 'Allergene', 'Vegan'], ['Mohnbrötchen', '0,75 €', 'Gluten (Weizen), Milch', 'Nein'], ['Gibt es nicht', '1,00 €', '', 'Ja']];
      const buf = await (writeXlsx.default || writeXlsx)(tabelle.map((r) => r.map((v) => ({ value: v })))).toBuffer();
      await click(d.page.getByRole('tab', { name: 'Inhalte' })); await settle(d.page, 500);
      await d.page.locator('input[aria-label="Excel-Datei mit der Produktliste"]').setInputFiles({ name: 'produkte.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(buf) });
      await d.page.getByText(/Produkte erkannt/).first().waitFor({ timeout: 8000 });
      const vorschau = await d.page.getByText('0,70 €').count() > 0 && await d.page.getByText('0,75 €').count() > 0;
      await click(d.page.getByRole('button', { name: /Änderung(en)? übernehmen/ }).first()); await settle(d.page, 500);
      const fertig = await d.page.getByText(/übernommen\. Sie gelten ab sofort/).count() > 0;
      ok('Ausbilder: Produktliste aus Excel (Vorschau und Übernehmen)', vorschau && fertig, `Vorschau ${vorschau}, übernommen ${fertig}`);
    } catch (e) { ok('Ausbilder: Produktliste aus Excel (Vorschau und Übernehmen)', false, String(e.message || e).slice(0, 160)); }
    ok('Ausbilder: keine Fehler beim Einlesen', d.errors.length === 0, d.errors[0]);
    await click(d.page.getByRole('tab', { name: 'Einstellungen' })); await settle(d.page, 500);
    // Seit Version 193 haben alle Produkte ein Shop-Foto: dann steht dort „Alle Produkte haben ein Foto.“
    ok('Ausbilder: Liste „Produkte ohne Foto“ (mit Foto-Knöpfen oder „alle haben ein Foto“)', (await d.page.getByRole('heading', { name: 'Produkte ohne Foto' }).count()) > 0 && ((await d.page.locator('input[aria-label^="Foto für "]').count()) > 0 || (await d.page.getByText('Alle Produkte haben ein Foto.').count()) > 0));

    const mf = await d.page.evaluate(async () => { const m = await (await fetch('manifest.json')).json(); const r = await Promise.all(m.icons.map((i) => fetch(i.src).then((x) => x.ok && (x.headers.get('content-type') || '').includes('png')))); return m.icons.length >= 3 && r.every(Boolean); });
    ok('App-Symbol: Manifest mit Symbolen, alle abrufbar', mf);
    // Ausbilder: Foto-Knopf direkt im Steckbrief
    await click(d.page.locator('[aria-label="Hauptmenü"] button:visible', { hasText: /Nachschlagen/ }).first().or(nav(d.page).nth(3))); await settle(d.page, 600);
    await click(d.page.locator('main button:visible').first()); await settle(d.page, 800);
    const kachel = d.page.locator('.lt-foto-raster button').first();
    // Version 212: Raster zeigt kleine Vorschaubilder (schnell auf alten Handys), die Datei gibt es wirklich
    const vorschau = await d.page.locator('.lt-foto-raster img').first().getAttribute('src').catch(() => '');
    const vorschauOk = /\/fotos\/klein\//.test(vorschau || '') && (await d.page.evaluate(async (u) => { const r = await fetch(u); return r.ok && (r.headers.get('content-type') || '').includes('jpeg'); }, vorschau));
    ok('Foto-Raster: kleine Vorschaubilder', vorschauOk, vorschau);
    if (await kachel.count()) { await click(kachel); await settle(d.page, 500); }
    ok('Ausbilder: Foto-Knopf im Steckbrief', (await d.page.locator('.fc-sheet input[aria-label^="Foto für "]').count()) === 1);
    await d.ctx.close();
  }]);
  return teile;
}

async function cloudTests() {
  const teile = [];
  await db('PUT', '', { progress: { ben: { _displayName: 'Ben' } }, lastSeen: {}, scores: [{ id: 'b1', username: 'Ben', score: 50, date: '12.11.26, 08:00', category: 'Quiz' }] });
  // Anmeldung: neuer Name → PIN festlegen, zweites Gerät: falsche und richtige PIN
  teile.push(['Anmeldung: neuer Name → PIN festlegen, zweites Gerät: falsche und richtige PIN', async () => {
    const A = await device({ cloud: true });
    await A.page.fill('input[placeholder="z. B. Anna"]', 'Testi'); await A.page.keyboard.press('Enter');
    await A.page.waitForSelector('input[placeholder="4 bis 6 Ziffern"]', { timeout: 10000 }).catch(() => {});
    const pins = A.page.locator('input[placeholder="4 bis 6 Ziffern"]');
    ok('Anmeldung: neuer Name führt zu „PIN festlegen“', (await pins.count()) === 2);
    if ((await pins.count()) === 2) { await pins.nth(0).fill('4711'); await pins.nth(1).fill('4711'); await A.page.getByText('PIN speichern').click(); }
    await sleep(2500);
    ok('Anmeldung: nach „PIN speichern“ angemeldet', (await A.page.evaluate(() => localStorage.getItem('hinkel_username'))) === 'Testi');
    let pin = null; for (let i = 0; i < 150 && !(pin && pin.h); i++) { pin = await db('GET', '/pins/testi'); if (!(pin && pin.h)) await sleep(100); }
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
  }]);
  // Stufen-Feier: Kollegin mit genug Punkten für Stufe 3 sieht die Feier (andere Pop-ups vorher wegklicken)
  teile.push(['Stufen-Feier: Kollegin mit genug Punkten für Stufe 3 sieht die Feier (andere Pop-ups vorher wegklicken)', async () => {
    await db('PATCH', '/progress', { lena: { _displayName: 'Lena', _role: 'verkauf', _intro: true, _levelSeen: 1 } });
    await db('PATCH', '', { scores: [{ id: 'b1', username: 'Ben', score: 50, date: '12.11.26, 08:00', category: 'Quiz' }, { id: 'l1', username: 'Lena', score: 450, date: '12.11.26, 09:00', category: 'Quiz' }] });
    const L = await device({ cloud: true, user: 'Lena' });
    let gesehen = false;
    for (let k = 0; k < 14 && !gesehen; k++) {
      await sleep(700);
      if (await L.page.locator('[aria-label="Neue Stufe erreicht"]').count()) { gesehen = true; break; }
      const pinFelder = L.page.locator('input[placeholder="4 bis 6 Ziffern"]:visible');
      if ((await pinFelder.count()) === 2) { await pinFelder.nth(0).fill('4711'); await pinFelder.nth(1).fill('4711'); await L.page.getByText('PIN speichern').click().catch(() => {}); continue; }
      const o = L.page.locator('.lt-overlay:visible button:visible, [role=dialog][aria-modal=true]:visible button:visible');
      if (await o.count()) await o.last().click({ timeout: 2000 }).catch(() => {});
    }
    if (process.env.SHOT) { await sleep(gesehen ? 2600 : 0); await L.page.screenshot({ path: process.env.SHOT }); }
    const titel = gesehen ? await L.page.locator('.lt-sf-titel').innerText().catch(() => '') : '';
    if (gesehen) { await L.page.getByRole('button', { name: 'Weiter so!' }).click().catch(() => {}); await sleep(1500); }
    const weg = gesehen && (await L.page.locator('[aria-label="Neue Stufe erreicht"]').count()) === 0;
    ok('Stufen-Feier: erscheint mit neuem Titel und geht mit „Weiter so!“ zu', gesehen && titel.length > 2 && weg, `gesehen ${gesehen}, Titel „${titel}“, zu ${weg}`);
    ok('Stufen-Feier: keine Fehler', L.errors.length === 0, L.errors[0]);
    await L.ctx.close();
  }]);
  // Version 222: „überholt“ auch in den einzelnen Wertungen (hier Tüten-Blitz), nicht nur in den Gesamtpunkten
  teile.push(['Version 222: „überholt“ auch in den einzelnen Wertungen (hier Tüten-Blitz), nicht nur in den Gesamtpunkten', async () => {
    await db('PATCH', '', { scores: [{ id: 'b1', username: 'Ben', score: 50, date: '12.11.26, 08:00', category: 'Quiz' }, { id: 'l1', username: 'Lena', score: 450, date: '12.11.26, 09:00', category: 'Quiz' }, { id: 't1', username: 'Lena', score: 30, date: '13.11.26, 09:00', category: 'Tüten-Blitz 🛍️' }, { id: 't2', username: 'Ben', score: 60, date: '13.11.26, 10:00', category: 'Tüten-Blitz 🛍️' }] });
    const L = await device({ cloud: true, user: 'Lena', vorher: async (ctx) => ctx.addInitScript(() => { try { localStorage.setItem('lt_rang2_lena', JSON.stringify({ 'cat:Tüten-Blitz': { place: 1, above: [] } })); localStorage.setItem('hinkel_lvl_seen_lena', '9'); } catch {} }) });
    let meldung = '';
    for (let k = 0; k < 16 && !meldung; k++) {
      await sleep(700);
      const t = await L.page.getByText(/dich bei „Tüten-Blitz“ überholt/).first().innerText().catch(() => '');
      if (t) { meldung = t; break; }
      const pinFelder = L.page.locator('input[placeholder="4 bis 6 Ziffern"]:visible');
      const n = await pinFelder.count();
      if (n === 2) { await pinFelder.nth(0).fill('4711'); await pinFelder.nth(1).fill('4711'); await L.page.getByText('PIN speichern').click().catch(() => {}); continue; }
      if (n === 1) { await pinFelder.first().fill('4711'); await pinFelder.first().press('Enter').catch(() => {}); continue; }
      const o = L.page.locator('.lt-overlay:visible button:visible, [role=dialog][aria-modal=true]:visible button:visible');
      if (await o.count()) await o.last().click({ timeout: 2000 }).catch(() => {});
    }
    ok('Überholt: Meldung auch in einer Spiel-Wertung (Tüten-Blitz)', /Ben hat dich bei „Tüten-Blitz“ überholt/.test(meldung), meldung || 'keine Meldung');
    ok('Überholt: keine Fehler', L.errors.length === 0, L.errors[0]);
    await L.ctx.close();
  }]);
  // Live-Updates: Änderung eines Kollegen kommt sofort an
  teile.push(['Live-Updates: Änderung eines Kollegen kommt sofort an', async () => {
    const A = await device({ cloud: true, user: 'Anna' });
    const live = async () => A.page.evaluate(() => document.documentElement.dataset.cloudLive || '');
    for (let i = 0; i < 150 && (await live()) !== '1'; i++) await sleep(100);
    ok('Live: Verbindung steht', (await live()) === '1');
    const t0 = Date.now();
    await db('PATCH', '/progress', { carla: { _displayName: 'Carla' } });
    let arrived = false;
    for (let i = 0; i < 180 && !arrived; i++) { arrived = await A.page.evaluate(() => !!(JSON.parse(localStorage.getItem('hinkel_cloud_backup') || '{}').progress || {}).carla); if (!arrived) await sleep(50); }
    ok('Live: Änderung eines Kollegen kommt sofort an', arrived, `${Date.now() - t0} ms`);
    ok('Live: Annas Aktivität ist gespeichert', !!(await db('GET', '/lastSeen/anna')));
    await A.ctx.close();
  }]);
  // Kundenfragen: Mitarbeiter fragt, Ausbilder antwortet, Antwort kommt live an
  teile.push(['Kundenfragen: Mitarbeiter fragt, Ausbilder antwortet, Antwort kommt live an', async () => {
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
    for (let i = 0; i < 150 && !shown; i++) { shown = (await A.page.getByText('Ja, alle Brote gibt es auch halb.').count()) > 0; if (!shown) await sleep(100); }
    ok('Kundenfragen: Antwort vom Ausbilder erscheint sofort', shown);
    ok('Kundenfragen: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }]);
  // Wichtige Nachricht bestätigen und Team-Umfrage abstimmen
  teile.push(['Wichtige Nachricht bestätigen und Team-Umfrage abstimmen', async () => {
    const ts = Date.now();
    await db('PATCH', '', { pinboard: { text: 'Testnachricht wichtig', author: 'Ausbilder', updatedAt: 'heute', timestamp: ts, pflicht: true } });
    await db('PATCH', '/progress/admin', { _umfragen: { u1: { frage: 'Testumfrage?', optionen: ['Ja', 'Nein'], anonym: true, ts, offen: true } } });
    const A = await device({ cloud: true, user: 'Anna' });
    const knopf = A.page.locator('[role=dialog] button', { hasText: 'Gelesen und verstanden' });
    // Andere Pop-ups (Anmelde-Belohnung, Tüte …) können sich davorschieben: wie ein Mensch wegklicken
    for (let i = 0; i < 150 && !(await knopf.count()); i++) {
      const andere = A.page.locator('.lt-overlay:visible button:visible, [role=dialog][aria-modal=true]:visible button:visible');
      if (i % 10 === 9 && (await andere.count())) await andere.last().click({ timeout: 2000 }).catch(() => {});
      await sleep(100);
    }
    ok('Gelesen: wichtige Nachricht zeigt „Gelesen und verstanden“', (await knopf.count()) > 0);
    if (await knopf.count()) { await knopf.first().click(); await sleep(1500); }
    const g = (await db('GET', '/progress/anna/_gelesen')) || {};
    ok('Gelesen: Bestätigung wird gespeichert', Number(g[String(ts)]) > 0);
    await clearPopups(A.page);
    await click(nav(A.page).nth(0)); await settle(A.page);
    const ja = A.page.getByRole('button', { name: 'Ja', exact: true });
    for (let i = 0; i < 90 && !(await ja.count()); i++) await sleep(100);
    if (await ja.count()) { await ja.first().click(); await sleep(1500); }
    ok('Umfrage: Stimme wird gespeichert', (await db('GET', '/progress/anna/_stimmen/u1')) === 0);
    ok('Gelesen/Umfrage: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }]);
  // Version 242: Team-Challenge geschafft: 500 Punkte + Überraschungstüte + Rubbellos (wer schon 75 bekam: 425 dazu)
  teile.push(['Version 242: Team-Challenge geschafft: 500 Punkte + Überraschungstüte + Rubbellos (wer schon 75 bekam: 425 dazu)', async () => {
    const heute = new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
    const tag = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const n = new Date(); const woche = tag(new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7)));
    const scores = ((await db('GET', '/scores')) || []).filter(Boolean);
    scores.push({ id: 't242a', username: 'Ben', score: 90000, date: heute, category: 'Quiz' }, { id: 't242b', username: 'Anna', score: 100, date: heute, category: 'Quiz' }, { id: 't242c', username: 'Carla', score: 100, date: heute, category: 'Quiz' });
    await db('PUT', '/scores', scores);
    await db('PATCH', '/progress/carla', { _displayName: 'Carla', _teamWon: [woche] });
    const losVorher = Number(await db('GET', '/progress/anna/_jokersLos')) || 0;
    const A = await device({ cloud: true, user: 'Anna' });
    const pop = A.page.locator('.lt-tuete-popup');
    for (let i = 0; i < 180 && !(await pop.count()); i++) await sleep(100);
    const tueteText = (await pop.count()) ? await pop.innerText() : '';
    ok('Team-Challenge: Überraschungstüte geht auf', /Team-Challenge geschafft/i.test(tueteText));
    // Die Tüte kann selbst ein Rubbellos enthalten, dann sind es zwei
    const losErwartet = losVorher + 1 + (/Rubbellos/.test(tueteText) ? 1 : 0);
    await sleep(1500);
    const pa = (await db('GET', '/progress/anna')) || {};
    const sa = ((await db('GET', '/scores')) || []).filter((x) => x && x.username === 'Anna' && /Team-Challenge/.test(x.category || ''));
    ok('Team-Challenge: 500 Punkte und ein Rubbellos', sa.length === 1 && sa[0].score === 500 && Number(pa._jokersLos) === losErwartet && (pa._teamPaket || []).includes(woche), JSON.stringify({ sa, los: `${losVorher} → ${pa._jokersLos}`, paket: pa._teamPaket }));
    await A.ctx.close();
    const C = await device({ cloud: true, user: 'Carla' });
    for (let i = 0; i < 180 && !(await C.page.locator('.lt-tuete-popup').count()); i++) await sleep(100);
    await sleep(1500);
    const sc = ((await db('GET', '/scores')) || []).filter((x) => x && x.username === 'Carla' && /Team-Challenge/.test(x.category || ''));
    ok('Team-Challenge: wer schon 75 bekam, bekommt 425 dazu', sc.length === 1 && sc[0].score === 425, JSON.stringify(sc));
    ok('Team-Challenge: keine Fehler', A.errors.length === 0 && C.errors.length === 0, A.errors[0] || C.errors[0]);
    await C.ctx.close();
    await db('PUT', '/scores', scores.filter((x) => !/^t242/.test(x.id || '')));
  }]);
  // Lob von Kollegen: der Gelobte bekommt die Punkte genau einmal
  teile.push(['Lob von Kollegen: der Gelobte bekommt die Punkte genau einmal', async () => {
    await db('PATCH', '/progress/ben', { _displayName: 'Ben', _kollegenLob: { l1: { an: 'anna', anName: 'Anna', t: 'Danke für die Hilfe!', ts: Date.now() } } });
    await db('PATCH', '/progress/carla', { _displayName: 'Carla', _kollegenLob: { l2: { an: 'anna', anName: 'Anna', t: 'Heimlich danke!', ts: Date.now() - 1000, anonym: true } } });
    const A = await device({ cloud: true, user: 'Anna' });
    let pkt = [];
    for (let i = 0; i < 180 && pkt.length < 2; i++) { const sc = (await db('GET', '/scores')) || []; pkt = (Array.isArray(sc) ? sc : Object.values(sc)).filter((x) => x && x.category === 'Lob von Kollegen' && x.username === 'Anna'); if (pkt.length < 2) await sleep(100); }
    ok('Lob: Gelobte bekommt je Lob 15 Punkte (2 Lobe, eins davon anonym)', pkt.length === 2 && pkt.every((x) => x.score === 15), `${pkt.length} Einträge`);
    ok('Lob: Karte „Lob der Woche“ zeigt das Lob', (await A.page.getByText('Danke für die Hilfe!', { exact: false }).count()) > 0);
    const anonymZeile = await A.page.locator('section[aria-label="Lob der Woche"] div', { hasText: 'Heimlich danke!' }).first().innerText().catch(() => '');
    ok('Lob: anonymes Danke zeigt „Ein Kollege“ statt Namen', /Ein Kollege/.test(anonymZeile) && !/Carla/.test(anonymZeile), anonymZeile);
    ok('Lob: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }]);
  // Version 224: Einzel-Nachrichten (Koni schreibt an Anna und Ben, Anna antwortet im Pop-up, Koni sieht die Antwort)
  teile.push(['Version 224: Einzel-Nachrichten (Koni schreibt an Anna und Ben, Anna antwortet im Pop-up, Koni sieht die Antwort)', async () => {
    await db('PATCH', '/progress/ben', { _displayName: 'Ben' });
    await db('PATCH', '/progress/lena', { _displayName: 'Lena' });
    { const alle = (await db('GET', '/pins')) || {}; const einer = Object.values(alle)[0]; if (einer) await db('PATCH', '/pins', { koni: einer, lena: alle.lena || einer, ben: alle.ben || einer }); }
    const K = await device({ cloud: true, user: 'Koni' });
    for (let r = 0; r < 4; r++) { await sleep(600); await clearPopups(K.page); }
    await K.page.getByRole('button', { name: 'Menü', exact: true }).click(); await sleep(300);
    await K.page.getByRole('menuitem', { name: /Meine Nachrichten/ }).click(); await settle(K.page);
    const schreiben = K.page.locator('.lt-einzel-schreiben');
    for (let i = 0; i < 150 && !(await schreiben.locator('button', { hasText: /^Anna$/ }).count()); i++) await sleep(100);
    await click(schreiben.locator('button', { hasText: /^Anna$/ }).first()).catch(() => {});
    await click(schreiben.locator('button', { hasText: /^Ben$/ }).first()).catch(() => {});
    await K.page.fill('textarea[aria-label="Deine Nachricht"]', 'Bitte morgen die Stollen-Schulung machen.');
    await click(schreiben.getByRole('button', { name: 'Nachricht schicken' }));
    let gesendet = null;
    for (let i = 0; i < 150 && !gesendet; i++) { const m = await db('GET', '/progress/koni/_nachrichten'); gesendet = m && Object.values(m)[0]; if (!gesendet) await sleep(100); }
    ok('Einzel-Nachricht: Koni schickt an Anna und Ben (nicht an alle)', !!gesendet && Object.keys(gesendet.an || {}).sort().join(',') === 'anna,ben', JSON.stringify(gesendet && gesendet.an));
    await K.ctx.close();
    const A = await device({ cloud: true, user: 'Anna' });
    const pop = A.page.locator('.lt-einzel-popup');
    for (let i = 0; i < 36 && !(await pop.count()); i++) {
      const andere = A.page.locator('.lt-overlay:visible button:visible, [role=dialog][aria-modal=true]:visible button:visible');
      if (!(await pop.count()) && (await andere.count())) await andere.last().click({ timeout: 2000 }).catch(() => {});
      await sleep(500);
    }
    ok('Einzel-Nachricht: Anna bekommt das Pop-up mit Text', (await pop.count()) > 0 && (await pop.innerText()).includes('Stollen-Schulung'));
    if (await pop.count()) { await pop.locator('input').fill('Mach ich!'); await click(pop.getByRole('button', { name: 'Antworten' })); }
    let pf = null;
    for (let i = 0; i < 150 && !(pf && pf.a); i++) { const m = await db('GET', '/progress/anna/_postfach'); pf = m && Object.values(m)[0]; if (!(pf && pf.a)) await sleep(100); }
    ok('Einzel-Nachricht: Antwort und „gelesen“ im eigenen Fortschritt', !!pf && pf.a === 'Mach ich!' && pf.g > 0, JSON.stringify(pf));
    await A.page.getByRole('button', { name: 'Menü', exact: true }).click(); await sleep(300);
    await A.page.getByRole('menuitem', { name: /Meine Nachrichten/ }).click(); await settle(A.page);
    ok('Einzel-Nachricht: steht in Annas Postfach, Anna darf selbst nicht schreiben', (await A.page.locator('.lt-postfach').innerText()).includes('Stollen-Schulung') && (await A.page.locator('.lt-einzel-schreiben').count()) === 0);
    ok('Einzel-Nachricht (Anna): keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
    const L = await device({ cloud: true, user: 'Lena' });
    for (let r = 0; r < 4; r++) { if (await L.page.locator('.lt-einzel-popup').count()) break; await sleep(600); await clearPopups(L.page); }
    ok('Einzel-Nachricht: Lena (nicht ausgewählt) bekommt nichts', (await L.page.locator('.lt-einzel-popup').count()) === 0);
    await L.ctx.close();
    const K2 = await device({ cloud: true, user: 'Koni' });
    for (let r = 0; r < 4; r++) { await sleep(600); await clearPopups(K2.page); }
    await K2.page.getByRole('button', { name: 'Menü', exact: true }).click(); await sleep(300);
    await K2.page.getByRole('menuitem', { name: /Meine Nachrichten/ }).click(); await settle(K2.page);
    let liste = '';
    for (let i = 0; i < 150 && !liste.includes('Mach ich!'); i++) { liste = await K2.page.locator('.lt-einzel-gesendet').innerText().catch(() => ''); if (!liste.includes('Mach ich!')) await sleep(100); }
    ok('Einzel-Nachricht: Koni sieht „Gelesen: 1 von 2“ und Annas Antwort', liste.includes('Gelesen: 1 von 2') && liste.includes('Mach ich!'), liste.slice(0, 160));
    ok('Einzel-Nachricht (Koni): keine Fehler', K2.errors.length === 0, K2.errors[0]);
    await K2.ctx.close();
  }]);
  // Version 226: Anna schenkt Ben im Laden ein Rubbellos, Ben bekommt das Pop-up
  teile.push(['Version 226: Anna schenkt Ben im Laden ein Rubbellos, Ben bekommt das Pop-up', async () => {
    await db('PATCH', '/progress/anna', { _tipCents: 2000 });
    const A = await device({ cloud: true, user: 'Anna' });
    for (let r = 0; r < 4; r++) { await sleep(600); await clearPopups(A.page); }
    await click(A.page.locator('button[title="Trinkgeld-Laden öffnen"]').first()); await settle(A.page, 600);
    const laden = A.page.locator('[role=dialog][aria-label="Trinkgeld-Laden"]');
    await click(laden.getByRole('tab', { name: 'Titel' })); await settle(A.page, 300);
    ok('Laden: Sammel-Sets im Reiter „Titel“', (await laden.locator('.lt-sammelset').count()) >= 6);
    await click(laden.getByRole('tab', { name: 'Joker' })); await settle(A.page, 300);
    const box = laden.locator('.lt-schenken');
    ok('Laden: „Einem Kollegen etwas schenken“ unter Joker', (await box.count()) === 1);
    if (await box.count()) {
      await box.locator('select').selectOption('ben');
      await click(box.getByRole('button', { name: /an Ben schenken/ }));
    }
    let gs = null;
    for (let i = 0; i < 150 && !gs; i++) { const m = await db('GET', '/progress/anna/_geschenke'); gs = m && Object.values(m)[0]; if (!gs) await sleep(100); }
    ok('Geschenk: im eigenen Fortschritt gespeichert', !!gs && gs.an === 'ben' && gs.j === 'j_los', JSON.stringify(gs));
    ok('Geschenk (Anna): keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
    const vorher = Number(await db('GET', '/progress/ben/_jokersLos')) || 0;
    // Team-Belohnung (Tüte) würde sich vor das Geschenk-Pop-up schieben: für diese und letzte Woche als erhalten markieren
    const wk = (w) => { const n = new Date(); const d = new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7) - 7 * w); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    await db('PATCH', '/progress/ben', { _levelSeen: 25, _teamPaket: [wk(0), wk(1)], _teamWon: [wk(0), wk(1)] });
    const B = await device({ cloud: true, user: 'Ben', vorher: async (ctx) => ctx.addInitScript(() => { try { localStorage.setItem('hinkel_lvl_seen_ben', '9'); } catch {} }) });
    const pop = B.page.locator('.lt-geschenk-popup');
    for (let i = 0; i < 90 && !(await pop.count()); i++) {
      const skip = B.page.locator('button:visible:has-text("Überspringen")');
      if (await skip.count()) { await skip.first().click({ timeout: 2000 }).catch(() => {}); await sleep(400); continue; }
      const andere = B.page.locator('.lt-overlay:visible button:visible, [role=dialog][aria-modal=true]:visible button:visible, button:visible:has-text("Weiter so!")');
      if (await andere.count()) await andere.last().click({ timeout: 2000 }).catch(() => {});
      await sleep(500);
    }
    ok('Geschenk: Ben bekommt das Pop-up „Anna schenkt dir“', (await pop.count()) > 0 && /Anna schenkt dir/.test(await pop.innerText()));
    if (await pop.count()) await click(pop.getByRole('button', { name: 'Danke!' }));
    let nachher = vorher;
    for (let i = 0; i < 150 && nachher === vorher; i++) { nachher = Number(await db('GET', '/progress/ben/_jokersLos')) || 0; if (nachher === vorher) await sleep(100); }
    ok('Geschenk: Ben hat ein Rubbellos mehr', nachher === vorher + 1, `${vorher} → ${nachher}`);
    ok('Geschenk (Ben): keine Fehler', B.errors.length === 0, B.errors[0]);
    await B.ctx.close();
  }]);
  // Geburtstag (freiwillig) und Ideen-Box
  teile.push(['Geburtstag (freiwillig) und Ideen-Box', async () => {
    const d = new Date();
    await db('PATCH', '/progress/ben', { _displayName: 'Ben', _geburtstag: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` });
    const A = await device({ cloud: true, user: 'Anna' });
    await clearPopups(A.page);
    let karte = false; for (let i = 0; i < 150 && !karte; i++) { karte = (await A.page.getByText('Heute hat Ben Geburtstag').count()) > 0; if (!karte) await sleep(100); }
    ok('Geburtstag: Karte „Heute hat Ben Geburtstag“', karte);
    await A.page.getByRole('button', { name: 'Menü', exact: true }).click(); await sleep(300);
    await A.page.getByRole('menuitem', { name: 'Idee einreichen' }).click(); await settle(A.page);
    await A.page.fill('textarea[aria-label="Deine Idee"]', 'Testidee').catch(() => {});
    await click(A.page.getByRole('button', { name: 'Idee einreichen' }).first()).catch(() => {}); await sleep(1500);
    const ideen = (await db('GET', '/progress/anna/_ideen')) || {};
    ok('Ideen-Box: Idee wird gespeichert', Object.values(ideen).some((x) => x && x.t === 'Testidee'));
    ok('Geburtstag/Ideen: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }]);
  // Ersatzweg: Live-Verbindung blockiert → Daten kommen trotzdem
  teile.push(['Ersatzweg: Live-Verbindung blockiert → Daten kommen trotzdem', async () => {
    const A = await device({ cloud: true, user: 'Anna', blockLive: true });
    let ok1 = false;
    for (let i = 0; i < 180 && !ok1; i++) { ok1 = await A.page.evaluate(() => (JSON.parse(localStorage.getItem('hinkel_cloud_backup') || '{}').scores || []).some((s) => s.id === 'b1')); if (!ok1) await sleep(100); }
    ok('Ersatzweg: ohne Live-Verbindung werden die Daten trotzdem geladen', ok1);
    ok('Ersatzweg: keine Fehler', A.errors.length === 0, A.errors[0]);
    await A.ctx.close();
  }]);
  await abarbeiten(teile, 1);
}

(async () => {
  browser = await chromium.launch();
  try {
    // Ohne Emulator: Teile gleichzeitig. Die Emulator-Prüfungen hängen voneinander ab (gemeinsame Datenbank),
    // darum laufen sie hintereinander, aber neben den anderen Teilen her.
    // NUR=Suchwort: nur Teile prüfen, deren Name passt (zum schnellen Nachprüfen einzelner Teile)
    const teile = (await offlineTests()).filter(([n]) => !process.env.NUR || new RegExp(process.env.NUR, 'i').test(n));
    const gleichzeitig = Number(process.env.GLEICHZEITIG) || 3;
    const start = Date.now();
    await Promise.all([
      abarbeiten(teile, gleichzeitig),
      EMU ? (async () => { const puffer = []; await ausgabe.run(puffer, async () => { try { await cloudTests(); } catch (e) { ok('Emulator-Prüfungen liefen ohne Abbruch durch', false, String(e.message || e).split('\n')[0]); } }); puffer.forEach((z) => console.log(z)); })() : Promise.resolve(),
    ]);
    if (!EMU) console.log('(Anmeldung und Live-Updates übersprungen: kein Firebase-Emulator, EMU nicht gesetzt)');
    console.log(`(Dauer der Prüfung: ${Math.round((Date.now() - start) / 1000)} s, ${gleichzeitig} Teile gleichzeitig)`);
  } catch (e) {
    ok('Prüfung lief ohne Abbruch durch', false, e.message.split('\n')[0]);
  }
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length} von ${results.length} Prüfungen bestanden`);
  process.exit(failed.length ? 1 : 0);
})();
