// ═══ Theken-Simulator: Verkaufs-Situationen ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { shuffleArray } from '../../hilfen/allgemein';
import { SHOP_PRODUCTS } from '../../daten/shopProducts';
import { ALT_MAP } from '../../daten/data';
import { ShopItem, SimStep, pick, sample, rnd, closeByName, parseCents, BREADS, SWEETS, ROLLS, TYPE_LABEL, ALLERGY_TARGETS, hasAllergen, allergenText, Core, opts, evenOpts } from './basis';

// ── Beratungs-Szenarien ──

export function scAllergyBread(): Core | null {
  const t = pick(ALLERGY_TARGETS);
  const good = BREADS.filter(p => !hasAllergen(p, t.key));
  const bad = BREADS.filter(p => hasAllergen(p, t.key));
  if (good.length < 1 || bad.length < 3) return null;
  const right = pick(good);
  const wrong = closeByName(bad, right, 3);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Allergie',
      customer: [pick([`Ich suche ein Brot, aber: ${pick(t.says)} Was können Sie mir empfehlen?`, `${pick(t.says)} Welches Brot kann ich da bedenkenlos nehmen?`, `Ich bräuchte ein Brot ohne ${t.label}. ${pick(t.says)}`])],
      options: evenOpts([
        { text: `Da kann ich Ihnen ${right.name} empfehlen, da ${t.verb} ${t.neg} drin.`, correct: true },
        ...wrong.map(w => ({ text: `Da kann ich Ihnen ${w.name} empfehlen, da ${t.verb} ${t.neg} drin.`, correct: false, why: `${w.name} enthält ${t.label} (Allergene: ${allergenText(w)}).` })),
      ]),
      afterWrong: `Oh, warten Sie, ${t.verb} da wirklich ${t.neg} drin? … Dann nehme ich lieber ${right.name}.`,
    }],
  };
}

export function scVeganBread(): Core | null {
  const good = BREADS.filter(p => p.vegan);
  const bad = BREADS.filter(p => !p.vegan && p.allergens.some(a => a === 'Milch' || a === 'Eier'));
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  const wrong = closeByName(bad, right, 3);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Vegan',
      customer: [pick(['Ich ernähre mich vegan. Welches Brot ist für mich geeignet?', 'Haben Sie auch veganes Brot? Meine Tochter isst keine tierischen Produkte.', 'Ich suche ein Brot ganz ohne Milch und Ei, also vegan.'])],
      options: evenOpts([
        { text: `${right.name} ist vegan, das kann ich Ihnen empfehlen.`, correct: true },
        ...wrong.map(w => ({ text: `${w.name} ist vegan, das kann ich Ihnen empfehlen.`, correct: false, why: `${w.name} ist nicht vegan (Allergene: ${allergenText(w)}).` })),
      ]),
      afterWrong: `Hm, ich glaube da ist doch Milch oder Ei drin … Dann nehme ich ${right.name}.`,
    }],
  };
}

export function scTaste(): Core | null {
  const mild = Math.random() < 0.5;
  const goodTypes = mild ? ['weizen', 'stuten', 'dinkel'] : ['schwarzbrot', 'roggen'];
  const badTypes = mild ? ['schwarzbrot', 'roggen', 'roggenmisch'] : ['weizen', 'stuten'];
  const noRye = (p: ShopItem) => !/roggen/i.test(p.flour || '') && !/roggen/i.test(p.fullIngredients) && !p.allergens.some(a => /roggen/i.test(a));
  const good = BREADS.filter(p => goodTypes.includes(p.breadType || '') && (!mild || noRye(p)));
  const bad = BREADS.filter(p => badTypes.includes(p.breadType || ''));
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  const wrong = closeByName(bad, right, 3);
  const ask = mild
    ? pick(['Ich hätte gern ein mildes Brot, gerne ganz ohne Roggen. Was haben Sie da?', 'Meine Kinder mögen kein dunkles Brot, haben Sie etwas Helles, Mildes?', 'Ich suche ein leichtes, mildes Brot ohne Roggen fürs Frühstück.'])
    : pick(['Ich mag es richtig kräftig und herzhaft. Welches Brot empfehlen Sie?', 'Ich suche ein dunkles, kräftiges Brot, gerne mit viel Roggen.', 'Was haben Sie Herzhaftes für die Leberwurst?']);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: mild ? 'Mild & ohne Roggen' : 'Kräftig',
      customer: [ask],
      options: evenOpts([
        { text: `Da passt ${right.name}, das ist schön ${mild ? 'mild und ohne Roggen' : 'kräftig und herzhaft'}.`, correct: true },
        ...wrong.map(w => ({ text: `Da passt ${w.name}, das ist schön ${mild ? 'mild und ohne Roggen' : 'kräftig und herzhaft'}.`, correct: false, why: `${w.name} ist ein ${TYPE_LABEL[w.breadType || ''] || 'anderes Brot'} (${w.flour || 'andere Mehlmischung'}), nicht ${mild ? 'mild und ohne Roggen' : 'kräftig'}.` })),
      ]),
      afterWrong: `Hm, das klingt nicht ganz nach dem, was ich suche … Dann nehme ich ${right.name}.`,
    }],
  };
}

export function scSoldOut(): Core | null {
  // Alternativen laut Liste des Ausbilders (ALT_MAP in data.ts)
  const priced = (n: string) => SHOP_PRODUCTS.find(p => p.name === n && parseCents(p.price) > 0);
  const keys = Object.keys(ALT_MAP).filter(k => priced(k) && ALT_MAP[k].some(a => priced(a)));
  if (!keys.length) return null;
  const missingName = pick(keys);
  const missing = priced(missingName)!;
  const allowed = ALT_MAP[missingName];
  const right = priced(pick(allowed.filter(a => priced(a))))!;
  let wrongPool = SHOP_PRODUCTS.filter(p => parseCents(p.price) > 0 && p.name !== missing.name && !allowed.includes(p.name) && p.group === missing.group && (!missing.breadType || p.breadType !== missing.breadType));
  if (wrongPool.length < 2) wrongPool = SHOP_PRODUCTS.filter(p => parseCents(p.price) > 0 && p.name !== missing.name && !allowed.includes(p.name) && p.group === missing.group);
  if (wrongPool.length < 2) return null;
  const wrong = closeByName(wrongPool, right, 2);
  const good = allowed.length > 1 ? `Für ${missing.name} passen ${allowed.slice(0, -1).join(', ')} oder ${allowed[allowed.length - 1]}.` : `Für ${missing.name} passt ${allowed[0]}.`;
  return {
    bread: right.breadType ? right : undefined,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Ausverkauft',
      customer: [pick([`Haben Sie noch ${missing.name}?`, `Ich hätte gern ${missing.name}, bitte.`, `Ist ${missing.name} heute noch da?`]), `(${missing.name} ist leider schon ausverkauft.)`],
      options: evenOpts([
        { text: `${missing.name} ist leider schon weg, aber ich kann Ihnen ${right.name} empfehlen, das passt sehr gut.`, correct: true },
        ...wrong.map(w => ({ text: `${missing.name} ist leider schon weg, aber ich kann Ihnen ${w.name} empfehlen, das passt sehr gut.`, correct: false, why: `${w.name} ist keine gute Alternative. ${good}` })),
        { text: `${missing.name} ist leider schon ausverkauft, kommen Sie doch morgen früh einfach noch mal vorbei.`, correct: false, noPad: true, why: `Biete immer aktiv eine passende Alternative an. ${good}` },
      ]),
      afterWrong: `Hm, ist das wirklich ähnlich? … Ich nehme lieber ${right.name}.`,
    }],
  };
}

export function scIngredients(): Core | null {
  const right = pick(BREADS);
  const seen = new Set<string>([right.shortIngredients]);
  const len = right.shortIngredients.length;
  const others = shuffleArray(BREADS.filter(p => p.breadType !== right.breadType))
    .sort((a, b) => Math.abs(a.shortIngredients.length - len) - Math.abs(b.shortIngredients.length - len))
    .slice(0, 10)
    .filter(p => {
    if (seen.has(p.shortIngredients)) return false;
    seen.add(p.shortIngredients);
    return true;
  }).slice(0, 3);
  if (others.length < 3) return null;
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Zutaten',
      learn: { product: right.name, kind: 'inhalt' },
      customer: [pick([`Ich überlege, ${right.name} zu nehmen. Was ist da eigentlich drin?`, `Was ist denn in ${right.name} alles drin?`, `${right.name} sieht lecker aus, woraus ist das?`])],
      options: opts([
        { text: right.shortIngredients, correct: true },
        ...others.map(o => ({ text: o.shortIngredients, correct: false, why: `Das sind die Zutaten von ${o.name}.` })),
      ]),
      afterWrong: `Ach so? Ich dachte … na egal, ich nehme ${right.name} trotzdem.`,
    }],
  };
}

export function scFlour(): Core | null {
  const withFlour = BREADS.filter(p => !!p.flour);
  const right = pick(withFlour);
  const flours = Array.from(new Set(withFlour.map(p => p.flour as string).filter(f => f !== right.flour)));
  if (flours.length < 3) return null;
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Mehl',
      learn: { product: right.name, kind: 'mehl' },
      customer: [pick([`Welches Mehl ist in ${right.name}?`, `Ist ${right.name} eher Weizen oder Roggen?`, `Ich achte aufs Mehl, woraus ist ${right.name} gebacken?`])],
      options: opts([
        { text: `${right.name}: ${right.flour}.`, correct: true },
        ...sample(flours, 3).map(f => ({ text: `${right.name}: ${f}.`, correct: false, why: `Richtig wäre: ${right.flour}.` })),
      ]),
      afterWrong: `Hm, da bin ich mir nicht sicher … ich nehme es trotzdem mal mit.`,
    }],
  };
}

export function scPrice(): Core | null {
  const right = pick(BREADS);
  const rc = parseCents(right.price);
  const prices = Array.from(new Set(BREADS.map(p => p.price as string).filter(pr => pr !== right.price && Math.abs(parseCents(pr) - rc) <= 250)));
  if (prices.length < 3) return null;
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: rc }],
    steps: [{
      topic: 'Preis',
      learn: { product: right.name, kind: 'preis' },
      customer: [pick([`Was kostet ${right.name}?`, `Und was nehmen Sie für ${right.name}?`, `${right.name}, wie teuer ist das?`])],
      options: opts([
        { text: `${right.name} kostet ${right.price}.`, correct: true },
        ...sample(prices, 3).map(pr => ({ text: `${right.name} kostet ${pr}.`, correct: false, why: `${right.name} kostet ${right.price}.` })),
      ]),
      afterWrong: `Ah, ${right.price} steht da auf dem Schild. Gut, das nehme ich.`,
    }],
  };
}

export function scAllergenCheck(): Core | null {
  const t = pick(ALLERGY_TARGETS);
  const p = pick(BREADS);
  const contains = hasAllergen(p, t.key);
  const steps: SimStep[] = [{
    topic: 'Allergene prüfen',
    customer: [pick([`Ist in ${p.name} ${t.label} drin? ${pick(t.says)}`, `${pick(t.says)} Kann ich ${p.name} nehmen?`])],
    options: opts(contains ? [
      { text: `Leider ja, in ${p.name} ${t.verb} ${t.label} enthalten, das kann ich Ihnen nicht empfehlen.`, correct: true },
      { text: `Nein, keine Sorge, in ${p.name} ${t.verb} ${t.neg} enthalten, das können Sie nehmen.`, correct: false, why: `${p.name} enthält ${t.label} (Allergene: ${allergenText(p)}).` },
      { text: `In ${p.name} ${t.verb} nur ganz wenig ${t.label} drin, das macht bei einer Allergie bestimmt nichts.`, correct: false, why: `Bei Allergien gibt es kein „ein bisschen“, ${p.name} enthält ${t.label}.` },
      { text: `Das weiß ich bei ${p.name} leider nicht genau, probieren Sie es doch einfach mal aus.`, correct: false, why: 'Bei Allergie-Fragen immer in den Spickzettel schauen, niemals raten!' },
    ] : [
      { text: `Nein, keine Sorge, in ${p.name} ${t.verb} ${t.neg} enthalten, das können Sie nehmen.`, correct: true },
      { text: `Leider ja, in ${p.name} ${t.verb} ${t.label} enthalten, das kann ich Ihnen nicht empfehlen.`, correct: false, why: `${p.name} ist ohne ${t.label} (Allergene: ${allergenText(p)}).` },
      { text: `In ${p.name} ${t.verb} nur ganz wenig ${t.label} drin, das macht bei einer Allergie bestimmt nichts.`, correct: false, why: `${p.name} enthält gar ${t.neg}, und „ein bisschen“ gibt es bei Allergien nicht.` },
      { text: `Das weiß ich bei ${p.name} leider nicht genau, probieren Sie es doch einfach mal aus.`, correct: false, why: 'Bei Allergie-Fragen immer in den Spickzettel schauen, niemals raten!' },
    ]),
  }];
  if (!contains) {
    return { bread: p, basket: [{ name: p.name, qty: 1, cents: parseCents(p.price) }], steps: [{ ...steps[0], afterWrong: `Gut, dass ich gefragt habe … dann nehme ich ${p.name}.` }] };
  }
  const good = BREADS.filter(b => !hasAllergen(b, t.key) && b.name !== p.name);
  const bad = BREADS.filter(b => hasAllergen(b, t.key) && b.name !== p.name);
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  steps.push({
    topic: 'Alternative ohne Allergen',
    customer: [`Schade. Was hätten Sie denn ohne ${t.label}?`],
    options: evenOpts([
      { text: `${right.name} ist ohne ${t.label}, das kann ich Ihnen empfehlen.`, correct: true },
      ...closeByName(bad, right, 3).map(w => ({ text: `${w.name} ist ohne ${t.label}, das kann ich Ihnen empfehlen.`, correct: false, why: `${w.name} enthält ${t.label} (Allergene: ${allergenText(w)}).` })),
    ]),
    afterWrong: `Moment … dann lieber ${right.name}, da bin ich auf der sicheren Seite.`,
  });
  return { bread: right, basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }], steps };
}

export function scSweets(): Core | null {
  const good = SWEETS.filter(p => !hasAllergen(p, 'Nüsse'));
  const bad = SWEETS.filter(p => hasAllergen(p, 'Nüsse'));
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  const qty = rnd(3, 8);
  return {
    basket: [{ name: right.name, qty, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Süßes ohne Nüsse',
      customer: [pick([
        `Ich brauche ${qty} Stück Gebäck für die Kaffeepause, aber eine Kollegin verträgt keine Nüsse. Was nehme ich da?`,
        `Für den Geburtstag meiner Tochter hätte ich gern ${qty} süße Teilchen. Ein Kind hat eine Nussallergie.`,
        `Ich hätte gern ${qty} Teilchen zum Kaffee, aber bitte ohne Nüsse und Mandeln.`,
      ])],
      options: evenOpts([
        { text: `Da passt ${right.name}, ganz ohne Nüsse und Mandeln.`, correct: true },
        ...closeByName(bad, right, 3).map(w => ({ text: `Da passt ${w.name}, ganz ohne Nüsse und Mandeln.`, correct: false, why: `${w.name} enthält Nüsse oder Mandeln (Allergene: ${allergenText(w)}).` })),
      ]),
      afterWrong: `Hm, ich glaube da sind Nüsse drin … dann lieber ${qty}× ${right.name}.`,
    }],
  };
}

// ── Weitere Szenarien: Service-Situationen ──

export const WEIZEN_BREADS = () => BREADS.filter(p => (p.breadType === 'weizen') && /weizen/i.test(p.flour || '') && !/roggen/i.test(p.flour || ''));

export function scComplaint(): Core | null {
  const x = pick(BREADS.filter(p => p.breadType !== 'stuten'));
  const problem = pick(['war innen noch ganz feucht', 'war schon nach einem Tag steinhart', 'war an der Unterseite fast verbrannt', 'war beim Schneiden total krümelig']);
  return {
    bread: x,
    forceRoll: true,
    sliceIntro: [pick(['Das ist sehr nett, danke. Dann nehme ich ein frisches.', 'Oh, prima, dann nehme ich gern ein frisches mit.'])],
    basket: [{ name: `${x.name} (Ersatz, kostenlos)`, qty: 1, cents: 0 }],
    extraWrongTotals: [parseCents(x.price)],
    steps: [{
      topic: 'Reklamation',
      customer: [pick([`Ich muss mich leider beschweren: ${x.name} von gestern ${problem}.`, `Hören Sie mal, ${x.name}, das ich gestern gekauft habe, ${problem}. Das ärgert mich schon.`])],
      options: opts([
        { text: `Das tut mir leid! Ich gebe Ihnen gern ein frisches ${x.name}, und sage der Backstube Bescheid.`, correct: true },
        { text: `Das kann eigentlich nicht sein, bei uns ist ${x.name} immer gut, das war bestimmt nur Zufall.`, correct: false, why: 'Nie widersprechen: zuhören, Verständnis zeigen, entschuldigen und unkompliziert Ersatz anbieten.' },
        { text: `Haben Sie ${x.name} vielleicht falsch gelagert? Dann kann ich da leider auch nichts machen.`, correct: false, why: 'Gib dem Kunden nicht die Schuld, entschuldige dich und biete Ersatz an.' },
        { text: 'Da müssen Sie sich leider bei der Zentrale melden, ich darf hier vorne selbst überhaupt nichts entscheiden.', correct: false, why: 'Bei einer berechtigten Reklamation bieten wir direkt Ersatz an oder holen die Filialleitung dazu.' },
      ]),
      afterWrong: 'Hm, das finde ich jetzt nicht so toll … Na gut, geben Sie mir bitte einfach ein frisches.',
    }],
  };
}

export function scPreorder(): Core | null {
  const x = pick(BREADS);
  const n = pick([10, 12, 15, 20, 25, 30]);
  const roll = pick(ROLLS);
  const when = pick(['morgen früh', 'Samstag früh', 'morgen um halb acht']);
  return {
    bread: x,
    sliceIntro: [pick([`Prima. Und für heute nehme ich noch ${x.name} mit.`, `Super, danke! Für jetzt hätte ich gern noch ${x.name}.`]), pick(['Schneiden Sie mir das bitte? Wie dünn machen Sie das?', 'Können Sie mir das schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Vorbestellung',
      customer: [pick([`Kann ich für ${when} ${n} ${roll.name} vorbestellen? Wir haben im Büro ein Frühstück.`, `Ich bräuchte ${when} ${n} ${roll.name} für unser Team, kann ich die vorbestellen?`])],
      options: opts([
        { text: 'Sehr gerne! Ich schreibe Ihnen alles auf, auf welchen Namen und um wie viel Uhr holen Sie es ab?', correct: true },
        { text: 'Vorbestellen geht bei uns leider nicht, kommen Sie einfach morgen ganz früh vorbei, dann klappt das.', correct: false, why: 'Bestellungen nehmen wir gern an, immer mit Name, Abholzeit und Menge notieren.' },
        { text: 'Klar, das merke ich mir einfach, sagen Sie morgen an der Theke nur kurz Ihren Namen, dann passt das.', correct: false, why: 'Bestellungen immer schriftlich festhalten: Name, Menge, Abholzeit, nicht „merken“.' },
        { text: `Dann packe ich Ihnen die ${n} ${roll.name} gleich jetzt schon ein, die halten bis morgen.`, correct: false, why: 'Vorbestellte Ware soll frisch sein, Bestellung notieren und morgen frisch bereitstellen.' },
      ]),
      afterWrong: 'Hm, ich hätte es lieber richtig aufgeschrieben … Schreiben Sie bitte auf: Name Becker, Abholung acht Uhr.',
    }],
  };
}

export function scBrunch(): Core | null {
  const stuten = BREADS.filter(p => p.breadType === 'stuten');
  if (!stuten.length || !ROLLS.length) return null;
  const s = pick(stuten);
  const roll = pick(ROLLS);
  const people = pick([6, 8, 10]);
  return {
    bread: s,
    sliceIntro: [`Gute Idee! Dann nehme ich ${s.name} und ${people} ${roll.name}.`, pick(['Den Stuten schneiden Sie mir bitte auch, wie dünn wird der?', 'Können Sie den Stuten schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: s.name, qty: 1, cents: parseCents(s.price) }, { name: roll.name, qty: people, cents: parseCents(roll.price) }],
    steps: [{
      topic: 'Anlass-Beratung',
      customer: [pick([`Wir machen Sonntag einen Brunch für ${people} Personen. Was können Sie mir da empfehlen?`, `Ich habe am Wochenende ${people} Gäste zum Frühstück, was würden Sie mir einpacken?`])],
      options: opts([
        { text: 'Ich würde gemischte Brötchen nehmen und dazu einen Stuten, so haben Sie Herzhaftes und Süßes.', correct: true },
        { text: 'Für so viele Gäste reicht ein großes Schwarzbrot, das ist schön kräftig und hält auch lange.', correct: false, why: 'Bei Anlässen auf Abwechslung achten: Brötchen für alle und etwas Süßes wie Stuten.' },
        { text: `Nehmen Sie doch einfach ${people} Berliner mit, süße Teilchen passen zu jedem Brunch am besten.`, correct: false, why: 'Nur Süßes ist einseitig, empfiehl eine Mischung aus Brötchen und Süßem.' },
        { text: 'Für so viele Personen müssen Sie leider vorher bestellen, sonst kann ich Ihnen gar nichts geben.', correct: false, why: 'Der Kunde ist jetzt da, berate ihn und stelle eine passende Auswahl zusammen.' },
      ]),
      afterWrong: 'Hm, ich dachte eher an etwas Gemischtes … Ich nehme Brötchen und einen Stuten.',
    }],
  };
}

export function scGrill(): Core | null {
  const good = WEIZEN_BREADS();
  const bad = BREADS.filter(p => p.breadType === 'schwarzbrot' || p.breadType === 'stuten');
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Anlass-Beratung',
      customer: [pick(['Wir grillen heute Abend. Welches Brot passt da am besten dazu?', 'Ich suche ein Brot für unseren Grillabend, was empfehlen Sie?'])],
      options: evenOpts([
        { text: `Zum Grillen empfehle ich ${right.name}, ein helles, lockeres Weizenbrot.`, correct: true },
        ...closeByName(bad, right, 3).map(w => ({ text: `Zum Grillen empfehle ich ${w.name}, ein helles, lockeres Weizenbrot.`, correct: false, why: `${w.name} ist ${w.breadType === 'stuten' ? 'ein süßer Stuten' : 'ein kräftiges Vollkornschwarzbrot'}, zum Grillen passt helles Weizenbrot.` })),
      ]),
      afterWrong: `Hm, das passt doch nicht so zum Grillen … Dann nehme ich ${right.name}.`,
    }],
  };
}

export function scPriceObjection(): Core | null {
  const x = pick(BREADS.filter(p => parseCents(p.price) >= 350));
  return {
    bread: x,
    sliceIntro: [pick(['Na gut, da haben Sie recht, dann nehme ich es.', 'Okay, überzeugt. Dann probiere ich es mal.'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Preis-Einwand',
      customer: [pick([`Was, ${x.price} für ${x.name}? Im Discounter kostet Brot die Hälfte!`, `${x.price}? Das ist aber ganz schön teuer für ein Brot …`])],
      options: opts([
        { text: 'Ich verstehe Sie, bei uns wird alles von Hand mit langer Teigführung gebacken, dadurch bleibt es lange frisch.', correct: true },
        { text: 'Na gut, dann gebe ich Ihnen heute ausnahmsweise 20 Prozent Rabatt, aber sagen Sie es bitte bloß keinem weiter.', correct: false, why: 'Keine Rabatte verschenken, mit Qualität argumentieren: Handwerk, Zutaten, Frische.' },
        { text: 'Dann kaufen Sie Ihr Brot doch einfach beim Discounter, das ist ja letztendlich ganz allein Ihre Entscheidung.', correct: false, why: 'Nie patzig werden, Verständnis zeigen und den Wert unseres Brotes erklären.' },
        { text: 'Die Preise macht bei uns die Chefin, da kann ich Ihnen leider überhaupt gar nichts zu sagen, tut mir leid.', correct: false, why: 'Du kannst den Preis erklären: handwerkliche Herstellung, gute Zutaten, lange Frische.' },
      ]),
      afterWrong: 'Hm, so richtig überzeugt bin ich nicht … aber gut, ich nehme es trotzdem.',
    }],
  };
}

export function scKids(): Core | null {
  const x = pick(BREADS);
  const kid = pick(['Sohn', 'Tochter']);
  return {
    bread: x,
    persona: pick([{ name: 'Frau Yilmaz', title: 'Frau Yilmaz', who: 'Mutter mit zwei Kindern' }, { name: 'Herr Jansen', title: 'Herr Jansen', who: 'Vater mit Kind an der Hand' }]),
    sliceIntro: [pick([`Oh, wie lieb, ja, das darf ${kid === 'Sohn' ? 'er' : 'sie'} gern haben!`, `Das ist ja nett, danke!`]), pick(['Schneiden Sie mir das bitte? Wie dünn machen Sie das?', 'Können Sie es mir schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Kinder an der Theke',
      customer: [pick([`Ich hätte gern ${x.name}, bitte.`, `Einmal ${x.name}, bitte.`, `Für mich bitte ${x.name}.`]), `(Während du das Brot holst, schaut ein Kind neugierig über die Theke.)`, pick([`Mein ${kid} guckt schon ganz gespannt in die Auslage …`, `Entschuldigung, mein ${kid} ist heute ganz aufgeregt.`])],
      options: opts([
        { text: `Darf ich Ihrem ${kid === 'Sohn' ? 'Sohn' : 'Kind'} ein kleines Mürbchen schenken? Das bekommen bei uns alle Kinder gratis.`, correct: true },
        { text: 'Hier, nimm dir einen Lolli und einen Luftballon, das bekommen bei uns alle Kinder geschenkt.', correct: false, why: 'Bei Hinkel bekommen Kinder ein kleines Mürbchen, und vorher die Eltern fragen (Allergien!).' },
        { text: 'Kinder müssen leider kurz draußen warten, die Theke ist wirklich zu eng für alle.', correct: false, why: 'Kinder sind willkommen! Bei uns gibt es für sie ein kleines Mürbchen.' },
        { text: 'Komm, such dir einfach irgendein Stück Kuchen aus der Theke aus, das geht heute aufs Haus.', correct: false, why: 'Erst die Eltern fragen, und bei Hinkel bekommen Kinder ein kleines Mürbchen geschenkt.' },
      ]),
      afterWrong: 'Oh … wir fragen lieber erst. Ein kleines Mürbchen wäre schön.',
    }],
  };
}

export function scOfficeOrder(): Core | null {
  if (ROLLS.length < 2) return null;
  const [a, b] = sample(ROLLS, 2);
  const na = pick([10, 12, 15]), nb = pick([8, 10]);
  return {
    persona: pick([{ name: 'Frau Neumann', title: 'Frau Neumann', who: 'holt das Frühstück fürs Büro' }, { name: 'Herr Krüger', title: 'Herr Krüger', who: 'Azubi aus der Kanzlei nebenan' }]),
    basket: [{ name: a.name, qty: na, cents: parseCents(a.price) }, { name: b.name, qty: nb, cents: parseCents(b.price) }],
    steps: [{
      topic: 'Großbestellung',
      customer: [pick([`Ich brauche ${na} ${a.name} und ${nb} ${b.name} für unser Büro. Geht das jetzt sofort?`, `Für unsere Besprechung hätte ich gern ${na} ${a.name} und ${nb} ${b.name}, bitte.`])],
      options: opts([
        { text: 'Sehr gern! Ich packe die Sorten getrennt in Tüten, dann zerdrückt nichts und Sie finden alles schnell wieder.', correct: true },
        { text: 'So viel auf einmal geht nur mit Vorbestellung, kommen Sie lieber morgen nochmal wieder.', correct: false, why: 'Was da ist, verkaufen wir gern sofort. Vorbestellen ist nur für das, was nicht vorrätig ist.' },
        { text: 'Ich werfe einfach alles zusammen in eine große Tüte, das geht am schnellsten.', correct: false, why: 'Bei großen Mengen sorgfältig packen: Sorten getrennt, Schweres nach unten, nichts zerdrücken.' },
        { text: 'Puh, so viele? Dann müssen die anderen Kunden jetzt aber warten, das dauert.', correct: false, why: 'Große Bestellungen freundlich und zügig bedienen, ohne zu stöhnen.' },
      ]),
      afterWrong: 'Hm, ich hätte die Brötchen schon gern ordentlich verpackt, bitte.',
    }],
  };
}

export function scPocketMoney(): Core | null {
  const cheap = SWEETS.filter(p => parseCents(p.price) > 0 && parseCents(p.price) <= 250);
  if (cheap.length < 3) return null;
  const x = pick(cheap);
  const kid = pick(['Sohn', 'Tochter']);
  const wrong = SWEETS.filter(p => parseCents(p.price) > 300);
  const w = wrong.length ? pick(wrong) : null;
  return {
    persona: pick([{ name: 'Herr Jansen', title: 'Herr Jansen', who: `Vater, der ${kid === 'Sohn' ? 'Sohn' : 'Tochter'} selbst bezahlen lässt` }, { name: 'Frau Wagner', title: 'Frau Wagner', who: 'Oma mit Enkelkind' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Taschengeld',
      customer: [`(Ein Kind legt Münzen auf die Theke.)`, pick(['Ich hab 2 Euro 50 Taschengeld. Was kann ich mir dafür kaufen?', 'Reicht mein Geld für was Süßes? Ich hab 2 Euro 50.'])],
      options: opts([
        { text: `Da hast du gut gespart! Für dein Geld bekommst du zum Beispiel ${x.name}, das kostet ${x.price}. Magst du das?`, correct: true },
        { text: 'Das ist zu wenig, da kann ich dir leider gar nichts verkaufen.', correct: false, why: 'Kinder ernst nehmen und zeigen, was es für ihr Geld gibt.' },
        ...(w ? [{ text: `Nimm doch ${w.name}, den Rest legt deine Begleitung bestimmt drauf.`, correct: false, why: `${w.name} kostet ${w.price}, das ist mehr als das Taschengeld. Etwas passendes zeigen.` }] : []),
        { text: '(Über das Kind hinweg nur mit dem Erwachsenen sprechen.)', correct: false, why: 'Wenn das Kind selbst einkauft, sprich es direkt und freundlich an.' },
        { text: 'Komm, das schenke ich dir, Geld brauchst du nicht.', correct: false, why: 'Lass das Kind ruhig selbst bezahlen, das ist für viele Kinder etwas Besonderes.' },
      ].slice(0, 4)),
      afterWrong: `(Das Kind schaut unsicher.) Ähm … dann vielleicht ${x.name}?`,
    }],
  };
}

export const EN_TYPE: Record<string, string> = { schwarzbrot: 'dark wholegrain rye bread', roggen: 'rye bread', roggenmisch: 'rye bread with some wheat', weizenmisch: 'wheat bread with some rye', dinkel: 'spelt bread', spezial: 'special bread', weizen: 'light wheat bread', stuten: 'sweet milk bread' };

export function scEnglish(): Core | null {
  const list = BREADS.filter(p => p.breadType && EN_TYPE[p.breadType]);
  if (list.length < 4) return null;
  const x = pick(list);
  return {
    bread: x,
    persona: pick([{ name: 'Mr. Smith', title: 'Mr. Smith', who: 'Tourist aus England' }, { name: 'Ms. Carter', title: 'Ms. Carter', who: 'Touristin aus den USA' }]),
    sliceIntro: [pick(['Great, I take it! Äh … schneiden, bitte?', 'Perfect, thank you! Can you cut it? Schneiden?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Englisch sprechen',
      customer: [pick([`Hello! Sorry, my German is not so good. What is this bread, the ${x.name}?`, `Hi! Ich spreche nur ein bisschen Deutsch. Can you tell me about the ${x.name}?`])],
      options: opts([
        { text: `No problem! This is ${x.name}, a ${EN_TYPE[x.breadType!]}. It is very popular here.`, correct: true },
        { text: `Das ist ${x.name}! (Lauter und langsamer:) DAS. IST. EIN. BROT.`, correct: false, why: 'Lauter sprechen hilft nicht. Ein paar einfache englische Worte und Zeigen helfen viel mehr.' },
        { text: 'Sorry, no English. Next customer, please!', correct: false, why: 'Gib dir Mühe, einfache Worte und Zeigen reichen völlig, jeder Kunde ist willkommen.' },
        { text: `This is ${x.name}, a sweet cake with chocolate.`, correct: false, why: `${x.name} ist ein ${TYPE_LABEL[x.breadType!] || 'Brot'}, auch auf Englisch richtig beschreiben.` },
      ]),
      afterWrong: `Hmm … okay. I just take the ${x.name}, please.`,
    }],
  };
}
