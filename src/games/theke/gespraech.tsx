// ═══ Theken-Simulator: Gespräch zusammenbauen ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { shuffleArray } from '../../hilfen/allgemein';
import { euro } from '../Kassenblitz';
import { SimOpt, SimStep, Persona, Conversation, pick, sample, rnd, parseCents, SWEETS, ROLLS, SLICE, TYPE_LABEL, PERSONAS, timeGreeting, Core, opts } from './basis';
import { scPrice } from './szenarienVerkauf';
import { SCENARIOS } from './szenarienAlltag';
import { SLICE_EXCLUDE } from '../SchneideProfi';

export const GENERAL_TOPICS = ['Begrüßung', 'Schnitt', 'Zusatzverkauf', 'Summe', 'Rückgeld', 'Verabschiedung', 'Kartenzahlung', 'Trinkgeld', 'Smalltalk'];

// Kleine Zwischenfragen für längere Gespräche
export const SMALLTALK: ((p: Persona) => SimStep)[] = [
  () => ({ topic: 'Smalltalk', customer: [pick(['Ganz schön ungemütlich draußen heute, oder?', 'Was für ein schönes Wetter heute!', 'Puh, heute ist ja wieder was los in der Stadt.'])], options: opts([
    { text: pick(['Ja, wirklich! Da tut etwas Frisches vom Bäcker doch gut.', 'Stimmt, umso schöner, dass Sie bei uns vorbeischauen!', 'Absolut. Dann machen wir es Ihnen hier wenigstens gemütlich.']), correct: true },
    { text: '(Nicht reagieren und weiter einpacken.)', correct: false, why: 'Kurz und freundlich auf Smalltalk eingehen, das macht den Einkauf persönlich.' },
    { text: 'Ach, erzählen Sie mir nichts, mein Tag war auch furchtbar, ich bin seit fünf Uhr hier …', correct: false, why: 'Eigene Sorgen gehören nicht an die Theke, freundlich und positiv bleiben.' },
    { text: 'Hm. Was wollten Sie noch mal?', correct: false, why: 'Lieber kurz freundlich antworten, dann weiter bedienen.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: ['Ich habe meinen Einkaufsbeutel vergessen …'], options: opts([
    { text: pick(['Kein Problem, ich gebe Ihnen gern eine Tüte.', 'Macht nichts, dafür haben wir Tüten. Ich packe Ihnen alles ein.']), correct: true },
    { text: 'Dann müssen Sie das so tragen, Tüten haben wir nicht für jeden.', correct: false, why: 'Hilfsbereit sein: eine Tüte anbieten.' },
    { text: 'Selbst schuld, das nächste Mal denken Sie dran.', correct: false, why: 'Nie belehren, einfach freundlich helfen.' },
    { text: '(Die Ware lose auf die Theke legen.)', correct: false, why: 'Biete eine Tüte an und packe ordentlich ein.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: [pick(['Ist das Brot eigentlich von heute?', 'Backen Sie das hier selbst?'])], options: opts([
    { text: pick(['Ja, wir backen alles selbst in unserer Backstube auf der Hohen Straße, ganz frisch.', 'Ja, alles aus unserer eigenen Backstube, handwerklich gebacken.']), correct: true },
    { text: 'Keine Ahnung, das kommt morgens einfach mit dem Wagen.', correct: false, why: 'Wir backen selbst in unserer Backstube, darauf sind wir stolz.' },
    { text: 'Nein, das ist Fertigware, wie überall.', correct: false, why: 'Falsch: Hinkel backt handwerklich in der eigenen Backstube.' },
    { text: 'Ist doch egal, schmeckt doch.', correct: false, why: 'Kundenfragen ernst nehmen und stolz von unserer Backstube erzählen.' },
  ]) }),
  (p) => ({ topic: 'Smalltalk', customer: [`(${p.title} telefoniert noch kurz.)`, 'Moment … ja, ich bin gleich da … Entschuldigung!'], options: opts([
    { text: pick(['Kein Problem, lassen Sie sich Zeit!', '(Kurz lächeln und warten, dann weiter bedienen.)']), correct: true },
    { text: 'Hallo? Hier sind noch andere Kunden!', correct: false, why: 'Geduldig und freundlich bleiben, kurz warten.' },
    { text: '(Schon den nächsten Kunden bedienen.)', correct: false, why: 'Den Kunden nicht stehen lassen, kurz warten und dann weitermachen.' },
    { text: 'Telefonieren ist hier eigentlich nicht erlaubt.', correct: false, why: 'Kein Verbot, einfach freundlich warten.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: ['Ihre Kollegin hat mich letzte Woche so toll beraten!'], options: opts([
    { text: pick(['Oh, das freut mich sehr, das richte ich ihr gern aus!', 'Wie schön! Das sage ich ihr, darüber freut sie sich bestimmt.']), correct: true },
    { text: 'Ach, die? Na ja, die ist eigentlich eher langsam.', correct: false, why: 'Nie schlecht über Kollegen sprechen, Lob freundlich weitergeben.' },
    { text: 'Hm. Und, was wollen Sie heute?', correct: false, why: 'Lob annehmen und weitergeben, das freut alle.' },
    { text: 'Ich berate aber viel besser, glauben Sie mir.', correct: false, why: 'Teamgeist zeigen, Lob gern weitergeben.' },
  ]) }),
  () => ({ topic: 'Smalltalk', customer: ['Bis wann haben Sie heute eigentlich geöffnet?'], options: opts([
    { text: 'Das schaue ich Ihnen gern nach. Die Öffnungszeiten hängen auch an der Tür und stehen auf unserer Internetseite.', correct: true },
    { text: 'Keine Ahnung, ich arbeite hier nur.', correct: false, why: 'Hilfsbereit sein: nachschauen oder auf Aushang und Internetseite verweisen.' },
    { text: 'Bis die Ware weg ist, dann machen wir zu.', correct: false, why: 'Lieber verlässlich auf die Öffnungszeiten an Tür und Internetseite verweisen.' },
    { text: 'Rund um die Uhr, wir sind ja eine Bäckerei.', correct: false, why: 'Nichts erfinden, nachschauen oder auf den Aushang verweisen.' },
  ]) }),
];

export function pickScenario(focus?: string) {
  const pool = focus && !GENERAL_TOPICS.includes(focus) ? SCENARIOS.filter(x => x.topics.includes(focus)) : SCENARIOS;
  const list = (pool.length ? pool : SCENARIOS).flatMap(x => Array(x.weight).fill(x.fn) as (() => Core | null)[]);
  return pick(list);
}

/** Baut ein komplettes Verkaufsgespräch */
export const coreKeyOf = (c: Core) => `${c.steps[0]?.topic || ''}|${c.bread?.name || c.basket[0]?.name || ''}`;

export function buildConversation(focus?: string, skip: string[] = []): Conversation {
  const g = timeGreeting();
  let core: Core | null = null;
  for (let i = 0; i < 40 && !core; i++) {
    const c = pickScenario(focus)();
    if (c && focus === 'Schnitt' && !c.bread) continue;
    if (c && i < 35 && skip.includes(coreKeyOf(c))) continue;
    core = c;
  }
  if (!core) core = scPrice() as Core;
  const persona = core.persona || pick(PERSONAS);

  const steps: SimStep[] = [];
  // Mal kurz, mal ausführlich: nicht jedes Gespräch hat gleich viele Schritte
  const shape: 'kurz' | 'normal' | 'lang' = focus && GENERAL_TOPICS.includes(focus) ? 'normal' : pick(['kurz', 'kurz', 'normal', 'normal', 'normal', 'lang', 'lang']);
  const want = (t: string) => focus === t;

  // 1) Begrüßung
  const isRegular = /Stammkund/i.test(persona.who);
  steps.push({
    topic: 'Begrüßung',
    customer: [pick([...g.customer, ...(isRegular ? ['Na, da bin ich wieder!', 'Hallo, alles gut bei Ihnen?'] : []), '(Die Kundin lächelt und schaut in die Auslage.)'.replace('Die Kundin', persona.title.startsWith('Herr') ? 'Der Kunde' : 'Die Kundin')])],
    options: (() => {
      const phrase = pick(['Schön, dass Sie da sind, was darf es für Sie sein?', 'Was darf ich Ihnen heute Gutes einpacken?', 'Wie kann ich Ihnen heute weiterhelfen?', 'Was darf es heute sein?', 'Womit kann ich Ihnen eine Freude machen?', 'Was darf’s sein?', 'Was hätten Sie gern?', 'Na, worauf haben Sie heute Lust?', 'Herzlich willkommen bei Hinkel, was darf ich Ihnen anbieten?', 'Schön Sie zu sehen! Wie immer oder mal was Neues?'].filter(x => isRegular || !x.includes('Wie immer')));
      const greet = isRegular ? `${g.std}, ${persona.title}!` : `${g.std}!`;
      const wrongPool: SimOpt[] = [
        { text: `${g.wrong}! ${phrase}`, correct: false, why: `Achte auf die Tageszeit, jetzt passt „${g.std}“.` },
        { text: pick(['Ja, hallo, einen Moment, ich muss erst noch die Brötchen auffüllen.', 'Gleich, ich räume nur noch kurz das Blech hier weg, ja?', 'Moment, ich muss eben noch die Kasse zählen.']), correct: false, why: 'Der Kunde geht immer vor, erst begrüßen und bedienen.' },
        { text: pick(['Hallo! Na, was willst du denn heute haben? Sag einfach.', 'Hi! Was brauchst du? Sag einfach Bescheid, ich mach dir das.']), correct: false, why: 'Kunden siezen wir, freundlich mit Tagesgruß begrüßen.' },
        { text: '(Ohne aufzuschauen:) Ja bitte?', correct: false, why: 'Blickkontakt, Lächeln und ein freundlicher Tagesgruß gehören dazu.' },
        { text: 'Der Nächste! … Ach, Sie. Was soll es sein?', correct: false, why: 'Jeden Kunden persönlich und freundlich begrüßen, nicht abfertigen.' },
      ];
      return opts([{ text: `${greet} ${phrase}`, correct: true }, ...sample(wrongPool, 3)]);
    })(),
  });

  // 2) Beratung
  steps.push(...core.steps);
  const basket = [...core.basket];

  // 3) Schneiden (nur bei Brot)
  if (core.bread && core.bread.breadType && !SLICE_EXCLUDE.includes(core.bread.name) && (want('Schnitt') || shape !== 'kurz' || Math.random() < 0.4)) {
    const mm = SLICE[core.bread.breadType];
    const label = TYPE_LABEL[core.bread.breadType];
    const others = ['5,5 mm', '9 mm', '12 mm'].filter(x => x !== mm);
    steps.push({
      topic: 'Schnitt',
      learn: { product: core.bread.name, kind: 'schnitt' },
      customer: (() => {
        const ask = pick(['Können Sie mir das bitte schneiden? Wie dünn machen Sie das?', 'Schneiden Sie mir das? Auf wie viel Millimeter geht das?', 'Gerne geschnitten bitte, wie dick werden die Scheiben?']);
        if (core.sliceIntro && core.sliceIntro.length >= 2) return core.sliceIntro;
        if (core.sliceIntro && core.sliceIntro.length === 1) return [core.sliceIntro[0], ask];
        return [pick(['Ach super, das nehme ich!', 'Prima, dann nehme ich das.', 'Wunderbar, genau das hab ich gesucht.']), ask];
      })(),
      options: opts([
        ...(() => { const tpl = pick([(x: string) => `Gerne! Das schneide ich Ihnen auf ${x}, so schneiden wir ${label}.`, (x: string) => `Mach ich! ${label} kommt bei uns auf ${x}.`, (x: string) => `Selbstverständlich. Für ${label} nehmen wir ${x}, dann passt die Scheibe perfekt.`, (x: string) => `Klar, ${x} ist für ${label} genau richtig.`]); return [{ text: tpl(mm), correct: true }, ...others.map(o => ({ text: tpl(o), correct: false, why: `${label} schneiden wir auf ${mm}.` }))]; })(),
        { text: 'Ganze Brote schneiden wir leider nicht, das müssten Sie zuhause machen.', correct: false, why: `Natürlich schneiden wir, ${label} auf ${mm}.` },
      ]),
    });
  }

  // 4) Sonst noch etwas?
  const askMore = core.forceRoll || want('Zusatzverkauf') || shape === 'lang' || (shape === 'normal' && Math.random() < 0.75);
  const addRoll = askMore && (core.forceRoll || Math.random() < 0.55) && ROLLS.length > 0;
  const roll = pick(ROLLS);
  const rollQty = rnd(2, 6);
  if (askMore) steps.push({
    topic: 'Zusatzverkauf',
    customer: [pick(['Danke schön!', 'Super, danke.', 'Prima.', 'Toll, danke!', 'Wunderbar.'])],
    options: opts([
      { text: pick(['Sehr gerne! Darf es denn sonst noch etwas für Sie sein?', 'Gerne doch! Kann ich Ihnen sonst noch etwas Gutes einpacken?', 'Mach ich sofort! Darf es sonst noch etwas dazu sein?', `Gern! Darf es dazu vielleicht noch ein paar frische ${pick(ROLLS).name} sein?`, 'Gern! Noch was dazu?', 'Sehr gern. Darf ich Ihnen noch etwas anbieten, vielleicht etwas Süßes für den Nachmittag?', `Kommt sofort! Unsere ${pick(SWEETS.length ? SWEETS : ROLLS).name} sind heute übrigens besonders lecker, darf es eins dazu sein?`]), correct: true },
      ...sample([
        { text: 'Das war’s dann, oder? Hinter Ihnen warten schon Leute.', correct: false, why: 'Nie drängeln, freundlich nachfragen, ob noch etwas dazu soll.' },
        { text: 'Nehmen Sie doch noch Brötchen mit, die müssen heute weg.', correct: false, why: 'So verkauft man nicht, frag offen und freundlich nach weiteren Wünschen.' },
        { text: 'Alles klar, dann tippe ich das jetzt schon mal in die Kasse.', correct: false, why: 'Frag aktiv nach: „Darf es sonst noch etwas sein?“' },
        { text: 'So. Zahlen Sie bar?', correct: false, why: 'Erst nach weiteren Wünschen fragen, dann kassieren.' },
        { text: 'Mehr gibt’s heute eh nicht, das Beste ist schon weg.', correct: false, why: 'Positiv bleiben und aktiv anbieten: „Darf es sonst noch etwas sein?“' },
      ] as SimOpt[], 3),
    ]),
  });
  if (addRoll) basket.push({ name: roll.name, qty: rollQty, cents: parseCents(roll.price) });

  // Lange Gespräche: noch eine kleine Zwischenfrage oder etwas Smalltalk
  if (shape === 'lang') {
    const extras = sample(SMALLTALK, Math.random() < 0.35 ? 2 : 1).map(f => f(persona));
    steps.push(...extras);
  }

  // 5) Summe
  const total = basket.reduce((s, b) => s + b.cents * b.qty, 0);
  const listText = basket.map(b => `${b.qty > 1 ? b.qty + '× ' : ''}${b.name}`).join(' und ');
  const totalWrong = new Set<number>();
  const tweaks = shuffleArray([-100, 100, -50, 50, -10, 10, -20, 20]);
  if (addRoll) { totalWrong.add(total - parseCents(roll.price) * rollQty); totalWrong.add(total + parseCents(roll.price)); }
  (core.extraWrongTotals || []).forEach(v => totalWrong.add(total + v));
  for (const t of tweaks) { if (totalWrong.size >= 6) break; if (total + t > 0) totalWrong.add(total + t); }
  totalWrong.delete(total);
  Array.from(totalWrong).forEach(v => { if (v <= 0) totalWrong.delete(v); });
  const showSum = want('Summe') || shape !== 'kurz' || Math.random() < 0.4;
  if (showSum) steps.push({
    topic: 'Summe',
    prices: basket.map(b => ({ ...b })),
    customer: [addRoll ? `Ja, geben Sie mir noch ${rollQty} ${roll.name}, bitte.` : pick(['Nein danke, das wäre alles.', 'Das war’s für heute.', 'Nein, das reicht. Was macht das?']), addRoll ? 'Das wäre dann alles. Was bekommen Sie?' : 'Was bekommen Sie von mir?'],
    options: (() => {
      const tpl = pick([(v: number) => `${listText}, das macht zusammen ${euro(v)}.`, (v: number) => `Dann bekomme ich ${euro(v)} von Ihnen, bitte.`, (v: number) => `Das macht ${euro(v)}, bitte schön.`, (v: number) => `Zusammen sind das ${euro(v)}.`]);
      return opts([
        { text: tpl(total), correct: true },
        ...sample(Array.from(totalWrong), 3).map(w => ({ text: tpl(w), correct: false, why: `Richtig: ${basket.map(b => `${b.qty} × ${euro(b.cents)}`).join(' + ')} = ${euro(total)}.` })),
      ]);
    })(),
  });

  // 6) Bezahlen: bar, mit Karte, „Stimmt so“ oder „Machen Sie … draus“ (Trinkgeld)
  let tipCents = 0;
  const payIdx = steps.length;
  const payRoll = Math.random();
  const notes = [500, 1000, 2000, 5000];
  const nextNote = notes.find(n => n > total) || Math.ceil(total / 1000) * 1000 + 1000;
  const noteText = (c: number) => euro(c).replace(',00 €', ' Euro');
  const changeOpts = (change: number, given: number, base: number, prefix: string) => {
    const chWrong = new Set<number>();
    for (const t of shuffleArray([-100, 100, -50, 50, -10, 10, -20, 20, -500, 500])) { if (chWrong.size >= 5) break; if (change + t > 0) chWrong.add(change + t); }
    chWrong.delete(change);
    const pre = showSum ? prefix : `${prefix}das macht ${euro(base)}, `;
    return opts([
      { text: `${pre}${euro(change)} bekommen Sie zurück.`, correct: true },
      ...sample(Array.from(chWrong), 3).map(w => ({ text: `${pre}${euro(w)} bekommen Sie zurück.`, correct: false, why: `${euro(given)} − ${euro(base)} = ${euro(change)}.` })),
    ]);
  };
  if (payRoll < 0.15) {
    // Kartenzahlung
    steps.push({
      topic: 'Kartenzahlung',
      customer: [pick(['Ich zahle mit Karte.', 'Kann ich mit Karte zahlen?', 'Mit dem Handy geht auch, oder?'])],
      options: opts([
        { text: 'Sehr gerne, das Gerät ist bereit, halten Sie Karte oder Handy einfach dran.', correct: true },
        { text: 'Sagen Sie mir die PIN ruhig laut, dann tippe ich sie schnell für Sie ein.', correct: false, why: 'Die PIN gibt nur der Kunde selbst ein, niemals nachfragen oder mitlesen.' },
        { text: 'Karte? Na gut … aber nächstes Mal bitte bar, das ist für uns einfacher.', correct: false, why: 'Kartenzahlung freundlich annehmen, ohne Kommentar.' },
        { text: 'Halten Sie die Karte schon mal hin, ich bediene derweil den Nächsten.', correct: false, why: 'Den Bezahlvorgang in Ruhe zu Ende bringen, dann den nächsten Kunden bedienen.' },
      ]),
    });
  } else if (payRoll < 0.28 && nextNote - total < 150 && nextNote - total > 0) {
    // „Stimmt so!“, Rest ist Trinkgeld
    tipCents = nextNote - total;
    steps.push({
      topic: 'Trinkgeld', tipStep: true,
      customer: [pick([`Hier sind ${noteText(nextNote)}, stimmt so!`, `${noteText(nextNote)}, bitte. Der Rest ist für Sie!`])],
      options: opts([
        { text: 'Oh, vielen herzlichen Dank, das ist sehr lieb! Das kommt in unsere Trinkgeldkasse.', correct: true },
        { text: `Nein, nein, hier sind Ihre ${euro(tipCents)}, Trinkgeld nehmen wir grundsätzlich nicht an.`, correct: false, why: 'Trinkgeld darfst du freundlich und dankend annehmen.' },
        { text: '(Das Geld wortlos in die Kasse legen und den nächsten Kunden aufrufen.)', correct: false, why: 'Bedanke dich für das Trinkgeld, das ist eine nette Geste.' },
        { text: 'Danke! Das stecke ich mir gleich selbst ein, das merkt ja keiner.', correct: false, why: 'Trinkgeld kommt in die Trinkgeldkasse, und ein ehrliches Dankeschön gehört dazu.' },
      ]),
    });
  } else if (payRoll < 0.4) {
    // „Machen Sie … draus“
    const round = total < 500 ? Math.ceil((total + 20) / 50) * 50 : Math.ceil((total + 30) / 100) * 100;
    const given = notes.find(n => n >= round) || nextNote;
    if (given > round) {
      tipCents = round - total;
      steps.push({
        topic: 'Trinkgeld', tipStep: true,
        customer: [pick([`Hier sind ${noteText(given)}, machen Sie ${noteText(round)} draus.`, `Ich gebe Ihnen ${noteText(given)}. Machen Sie einfach ${noteText(round)}, der Rest ist für Sie.`])],
        options: changeOpts(given - round, given, round, 'Vielen Dank, das ist sehr nett! '),
      });
    } else {
      steps.push({ topic: 'Rückgeld', customer: [`Hier sind ${noteText(nextNote)}.`], options: changeOpts(nextNote - total, nextNote, total, 'Vielen Dank, ') });
    }
  } else {
    // Normal bar, manchmal mit passendem Kleingeld
    let given = nextNote;
    let givenText = noteText(given);
    if (Math.random() < 0.35) {
      const rest = total % 100;
      given = rest === 0 ? total + 100 : total - rest + 100 + (rest > 50 ? 0 : 50);
      if (given <= total) given = Math.ceil(total / 100) * 100 + 100;
      givenText = euro(given);
    }
    steps.push({
      topic: 'Rückgeld',
      customer: [pick([`Hier sind ${givenText}.`, `Ich gebe Ihnen ${givenText}.`, `Bitte schön, ${givenText}.`, `${givenText}, passt das?`])],
      options: changeOpts(given - total, given, total, 'Vielen Dank, '),
    });
    // Manchmal wandert danach etwas in die Trinkgelddose
    if (Math.random() < 0.15) {
      tipCents = pick([20, 30, 50]);
      steps.push({
        topic: 'Trinkgeld', tipStep: true,
        customer: [`(${persona.title} wirft ${euro(tipCents)} in die Trinkgelddose.)`, pick(['Für die Kaffeekasse!', 'Sie machen das immer so nett hier.'])],
        options: opts([
          { text: 'Oh, wie lieb, vielen Dank! Darüber freut sich das ganze Team.', correct: true },
          { text: 'Das müssen Sie aber wirklich nicht, nehmen Sie das ruhig wieder raus.', correct: false, why: 'Trinkgeld freundlich annehmen und sich bedanken.' },
          { text: '(Nichts sagen, man sieht ja, dass es in die Dose geht.)', correct: false, why: 'Ein kurzes, herzliches Dankeschön gehört dazu.' },
          { text: 'Nur 50 Cent? Na ja, besser als nichts.', correct: false, why: 'Jedes Trinkgeld ist eine nette Geste, herzlich bedanken.' },
        ].map(o => o.text.startsWith('Nur 50 Cent') ? { ...o, text: `Nur ${euro(tipCents)}? Na ja, besser als nichts.` } : o)),
      });
    }
  }

  if (!showSum && steps[payIdx]) steps[payIdx].prices = basket.map(b => ({ ...b }));

  // 7) Verabschiedung
  if (want('Verabschiedung') || shape !== 'kurz' || Math.random() < 0.6) steps.push({
    topic: 'Verabschiedung',
    customer: [pick(['Danke schön!', 'Super, danke.', 'Wunderbar, danke Ihnen!', 'Dann bis bald!', 'Schönen Tag noch!'])],
    options: opts([
      { text: pick([`Vielen Dank, ${persona.title}, ich wünsche Ihnen einen schönen Tag!`, `Ich danke Ihnen, ${persona.title}! Einen schönen Tag und bis bald!`, `Danke Ihnen, ${persona.title}, lassen Sie es sich schmecken!`, 'Vielen Dank und guten Appetit, bis zum nächsten Mal!']), correct: true },
      ...sample([
        { text: 'So, tschüss dann, und der Nächste bitte, hier geht’s weiter!', correct: false, why: 'Erst den Kunden freundlich verabschieden, dann den nächsten bedienen.' },
        { text: 'Den Kassenbon brauchen Sie ja bestimmt nicht, den werfe ich weg.', correct: false, why: 'Zum Schluss steht die freundliche Verabschiedung, den Bon bieten wir an, statt ihn wegzuwerfen.' },
        { text: 'Jo, danke, tschüss. Und Tür bitte hinter sich zumachen!', correct: false, why: 'Zu knapp und unhöflich, bedanken, schönen Tag wünschen, gern mit Namen.' },
        { text: '(Schon dem nächsten Kunden zuwenden, ohne etwas zu sagen.)', correct: false, why: 'Jeden Kunden freundlich verabschieden, mit Blickkontakt und einem guten Wunsch.' },
        { text: 'Ciao! Und morgen bitte etwas früher, dann ist mehr da.', correct: false, why: 'Freundlich bedanken und einen schönen Tag wünschen, keine Belehrungen.' },
      ] as SimOpt[], 3),
    ]),
  });

  const endLines = [pick(tipCents > 0
    ? ['Gern geschehen, Sie haben mich toll beraten. Bis bald!', 'Das haben Sie sich verdient. Tschüss!', 'Ihnen auch einen schönen Tag, bis zum nächsten Mal!']
    : ['Danke, Ihnen auch! Bis morgen!', 'Gleichfalls, bis zum nächsten Mal!', 'Danke, war wie immer super hier. Tschüss!', 'Ihnen auch einen schönen Tag!', 'Bis bald, und danke für die nette Beratung!', 'Tschüss, bis Samstag!'])];
  return { persona, steps, endLines, tipCents, coreKey: coreKeyOf(core), coreTopics: core.steps.map(st => st.topic) };
}
