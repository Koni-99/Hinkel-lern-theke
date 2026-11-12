// ═══ Theken-Simulator: Alltags-Situationen und Liste aller Situationen ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { pick, sample, closeByName, parseCents, BREADS, Core, opts, evenOpts } from './basis';
import { scAllergyBread, scVeganBread, scTaste, scSoldOut, scIngredients, scFlour, scPrice, scAllergenCheck, scSweets, scComplaint, scPreorder, scBrunch, scGrill, scPriceObjection, scKids, scOfficeOrder, scPocketMoney, scEnglish } from './szenarienVerkauf';

// ── Noch mehr Situationen aus dem Theken-Alltag ──

export function scStorage(): Core | null {
  const x = pick(BREADS);
  const freeze = Math.random() < 0.45;
  if (freeze) {
    return {
      bread: x,
      sliceIntro: [pick(['Gut zu wissen, danke! Dann nehme ich gleich zwei Hälften … nein, eins reicht.', 'Super Tipp! Dann nehme ich es mit.'])],
      basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
      steps: [{
        topic: 'Aufbewahrung',
        customer: [pick([`Ich nehme ${x.name}, kann ich das auch einfrieren?`, `Wir schaffen ${x.name} nie ganz. Kann man das einfrieren?`])],
        options: opts([
          { text: 'Ja, sehr gut sogar! Am besten luftdicht verpackt und schon in Scheiben, dann tauen Sie nur auf, was Sie brauchen.', correct: true },
          { text: 'Lieber nicht, Brot verliert beim Einfrieren seinen ganzen Geschmack und wird danach sofort hart.', correct: false, why: 'Brot lässt sich gut einfrieren: luftdicht verpackt, am besten scheibenweise.' },
          { text: 'Ja, einfach im Ganzen in der Papiertüte ins Gefrierfach legen, mehr müssen Sie nicht beachten.', correct: false, why: 'In der Papiertüte trocknet es aus, luftdicht verpacken und am besten in Scheiben einfrieren.' },
          { text: 'Einfrieren geht, aber nur höchstens zwei Tage, danach wird es ungenießbar.', correct: false, why: 'Luftdicht verpackt hält eingefrorenes Brot deutlich länger, Tipp: scheibenweise einfrieren.' },
        ]),
        afterWrong: 'Hm, ich habe gehört, man soll es in Scheiben einfrieren … mache ich so. Ich nehme es.',
      }],
    };
  }
  return {
    bread: x,
    sliceIntro: [pick(['Ah, gut zu wissen, das mache ich bisher falsch! Dann nehme ich es.', 'Danke für den Tipp! Dann nehme ich es mit.'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Aufbewahrung',
      customer: [pick([`Wie bewahre ich ${x.name} zu Hause am besten auf, damit es lange frisch bleibt?`, `Bei mir wird Brot immer so schnell schlecht. Wo lagere ich ${x.name} am besten?`])],
      options: opts([
        { text: 'Am besten bei Raumtemperatur in einer Brotdose mit ein paar Luftlöchern, bitte nicht in den Kühlschrank.', correct: true },
        { text: 'Am besten im Kühlschrank, die Kälte hält das Brot frisch und es schimmelt nicht so schnell.', correct: false, why: 'Im Kühlschrank wird Brot schneller altbacken, besser Raumtemperatur, Brotdose mit Luftlöchern.' },
        { text: 'In einer luftdichten Plastiktüte, gut verschlossen, dann kommt gar keine Luft dran.', correct: false, why: 'Ohne Luftaustausch staut sich Feuchtigkeit und es schimmelt schneller, Brotdose mit Luftlöchern.' },
        { text: 'Einfach offen auf die Arbeitsfläche legen, mit der Schnittfläche nach oben, so atmet es am besten.', correct: false, why: 'Offen trocknet es aus, besser in eine Brotdose mit Luftlöchern bei Raumtemperatur.' },
      ]),
      afterWrong: 'Wirklich? Ich habe gelesen, Brotdose mit Luftlöchern ist am besten … Ich nehme es jedenfalls.',
    }],
  };
}

export function scLongFresh(): Core | null {
  const good = BREADS.filter(p => p.breadType === 'schwarzbrot');
  const bad = BREADS.filter(p => p.breadType === 'weizen');
  if (!good.length || bad.length < 3) return null;
  const right = pick(good);
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Frische-Beratung',
      customer: [pick(['Ich kaufe nur einmal die Woche ein. Welches Brot hält sich am längsten frisch?', 'Ich brauche ein Brot, das ein paar Tage durchhält, was nehme ich da?'])],
      options: evenOpts([
        { text: `Da nehmen Sie am besten ${right.name}, Roggenvollkornschrot bindet viel Wasser, so bleibt es lange saftig.`, correct: true },
        ...closeByName(bad, right, 3).map(w => ({ text: `Da nehmen Sie am besten ${w.name}, das bindet viel Wasser und bleibt so lange saftig.`, correct: false, why: `${w.name} ist ein Weizenbrot, das schmeckt frisch am besten. Lange frisch halten Vollkorn-Roggenbrote wie ${right.name}.` })),
      ]),
      afterWrong: `Hm, ein Weizenbrot hält doch nicht so lange … Ich nehme lieber ${right.name}.`,
    }],
  };
}

export function scGlutenfree(): Core | null {
  const bw = BREADS.find(p => /buchweizen/i.test(p.name));
  if (!bw) return null;
  return {
    bread: bw,
    sliceIntro: [pick(['Danke, dass Sie das so ehrlich sagen. Spuren sind bei mir zum Glück okay, ich nehme es.', 'Gut zu wissen, danke! Dann probiere ich es.'])],
    basket: [{ name: bw.name, qty: 1, cents: parseCents(bw.price) }],
    steps: [{
      topic: 'Glutenfrei',
      customer: [pick(['Ich habe Zöliakie. Haben Sie ein glutenfreies Brot?', 'Haben Sie etwas ohne Gluten? Ich vertrage das nicht.'])],
      options: opts([
        { text: `Unser ${bw.name} hat eine glutenfreie Rezeptur, durch Mehlstaub in unserer Backstube können aber Spuren von Roggen und Weizen enthalten sein.`, correct: true },
        { text: 'Nehmen Sie unseren Dinkeltraum, Dinkel ist ein Urgetreide und enthält deshalb kein Gluten.', correct: false, why: 'Dinkel enthält Gluten! Glutenfreie Rezeptur hat nur das Buchweizenbrot, mit möglichen Spuren.' },
        { text: 'Das Reine Roggen ist glutenfrei, weil es nur mit Natursauerteig gebacken wird.', correct: false, why: 'Roggen enthält Gluten. Glutenfreie Rezeptur: Buchweizenbrot, mit Hinweis auf mögliche Spuren.' },
        { text: `${bw.name} ist garantiert zu 100 % glutenfrei, da müssen Sie sich keine Sorgen machen.`, correct: false, why: 'Nie „garantiert“ sagen: Die Rezeptur ist glutenfrei, aber durch die Backstube sind Spuren möglich.' },
      ]),
      afterWrong: `Hm, da bin ich vorsichtig … Ich nehme lieber ${bw.name} und lese die Zutaten nochmal nach.`,
    }],
  };
}

export function scSmallLoaf(): Core | null {
  const smalls = BREADS.filter(p => p.name.startsWith('Kleines ') && BREADS.some(b => b.name === p.name.replace('Kleines ', 'Großes ')));
  if (!smalls.length) return null;
  const small = pick(smalls);
  const big = small.name.replace('Kleines ', 'Großes ');
  const otherSmall = BREADS.filter(p => p.name.startsWith('Kleines ') && p.name !== small.name);
  return {
    bread: small,
    basket: [{ name: small.name, qty: 1, cents: parseCents(small.price) }],
    steps: [{
      topic: 'Größe beraten',
      customer: [pick([`Ich wohne allein, das ${big} ist mir einfach zu viel. Gibt es das auch kleiner?`, `Das ${big} schaffe ich nie, bevor es trocken wird. Haben Sie das auch in klein?`])],
      options: evenOpts([
        { text: `Ja, nehmen Sie das ${small.name}, gleicher Teig, nur kleiner.`, correct: true },
        ...sample(otherSmall, 2).map(o => ({ text: `Ja, nehmen Sie das ${o.name}, gleicher Teig, nur kleiner.`, correct: false, why: `${o.name} ist ein anderes Brot, das kleine ${big.replace('Großes ', '')} heißt ${small.name}.` })),
        { text: `Nein, das ${big} gibt es leider nur in dieser Größe.`, correct: false, noPad: true, why: `Doch, es gibt das ${small.name}.` },
      ]),
      afterWrong: `Ach, ich glaube, es gibt doch das ${small.name}? Das nehme ich.`,
    }],
  };
}

export function scHurry(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Peters', title: 'Herr Peters', who: 'hat es ein bisschen eilig' }, { name: 'Herr Schulz', title: 'Herr Schulz', who: 'Busfahrer auf dem Weg zur Schicht' }, { name: 'Frau Wolf', title: 'Frau Wolf', who: 'Krankenschwester nach der Nachtschicht' }]),
    sliceIntro: [pick(['Super, danke!', 'Perfekt, danke Ihnen!']), pick(['Und schnell geschnitten bitte, wie dünn?', 'Bitte noch schnell schneiden, auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Eiliger Kunde',
      customer: [pick([`Entschuldigung, ich hab’s furchtbar eilig, mein Bus kommt gleich! Ein ${x.name}, bitte.`, `Ganz schnell bitte, ich muss zur Arbeit: ${x.name}!`])],
      options: opts([
        { text: `Kommt sofort! Ein ${x.name}, ich beeile mich.`, correct: true },
        { text: `Oh, kennen Sie eigentlich schon unser ganzes Sortiment? Da gibt es neben ${x.name} noch ganz viel anderes …`, correct: false, why: 'Eilige Kunden zügig bedienen, keine langen Erklärungen jetzt.' },
        { text: 'Immer mit der Ruhe, hier geht alles der Reihe nach, Hektik bringt doch nichts.', correct: false, why: 'Verständnis zeigen und zügig bedienen statt belehren.' },
        { text: 'Dann hätten Sie halt früher kommen müssen, ich mache das jetzt trotzdem in meinem Tempo.', correct: false, why: 'Nie patzig, freundlich und schnell bedienen.' },
      ]),
      afterWrong: 'Bitte … ich muss wirklich los!',
    }],
  };
}

export function scQueue(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    sliceIntro: [pick([`Danke, dass Sie das geklärt haben. Ich hätte gern ${x.name}.`, `Danke! Also, ich nehme ${x.name}.`]), pick(['Schneiden Sie mir das bitte? Wie dünn machen Sie das?', 'Bitte geschnitten, auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Vordrängeln',
      customer: ['(Mitten in der Bestellung drängelt sich ein Mann vor: „Ich will nur schnell zwei Brötchen, geht ganz fix!“)'],
      options: opts([
        { text: 'Einen kleinen Moment bitte, ich bediene gerade noch hier, dann sind Sie sofort dran.', correct: true },
        { text: 'Na gut, wenn es nur zwei Brötchen sind, Sie warten doch bestimmt kurz, oder?', correct: false, why: 'Fair bleiben: Wer dran ist, wird zuerst bedient. Freundlich auf die Reihenfolge hinweisen.' },
        { text: 'Hallo?! Hinten anstellen, aber zackig, Sie sehen doch, dass hier Leute warten!', correct: false, why: 'Auch beim Vordrängeln bleiben wir höflich: „Einen Moment bitte, Sie sind gleich dran.“' },
        { text: '(Den Mann einfach ignorieren und so tun, als hätte man nichts gehört.)', correct: false, why: 'Nicht ignorieren, freundlich sagen, dass er gleich dran ist.' },
      ]),
      afterWrong: 'Äh … ich war eigentlich zuerst dran.',
    }],
  };
}

export function scChangeClaim(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    sliceIntro: [pick([`Danke, sehr freundlich. Wenn ich schon mal da bin: ${x.name}, bitte.`, `Prima, danke! Dann nehme ich noch ${x.name} mit.`]), pick(['Bitte auch geschnitten, wie dünn machen Sie das?', 'Können Sie es schneiden? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Wechselgeld-Reklamation',
      customer: [pick(['Entschuldigung, ich war vorhin schon da. Ich glaube, Sie haben mir einen Euro zu wenig rausgegeben.', 'Sie haben mir heute Morgen falsch rausgegeben, da fehlen 50 Cent.'])],
      options: opts([
        { text: 'Oh, das tut mir leid! Haben Sie den Bon noch? Dann prüfe ich das gleich und wir klären das sofort.', correct: true },
        { text: 'Das kann nicht sein, ich verzähle mich nie, da haben Sie sich bestimmt geirrt.', correct: false, why: 'Nicht abwimmeln: freundlich bleiben, Bon ansehen und in Ruhe prüfen (ggf. Filialleitung dazuholen).' },
        { text: 'Da kann ich jetzt leider nichts mehr machen, Sie hätten direkt an der Kasse nachzählen müssen.', correct: false, why: 'Wir nehmen Hinweise ernst: entschuldigen, Bon prüfen, Kasse kontrollieren.' },
        { text: 'Kein Problem, hier haben Sie einfach zwei Euro aus der Kasse, dann ist es auf jeden Fall erledigt.', correct: false, why: 'Nicht ohne Prüfung Geld herausgeben, erst den Bon ansehen und in Ruhe klären.' },
      ]),
      afterWrong: 'Hm. Ich habe den Bon hier, schauen Sie doch bitte einfach nach.',
    }],
  };
}

export function scCompliment(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    sliceIntro: [pick([`Dann nehme ich heute wieder ${x.name}.`, `Und heute bitte wieder ${x.name}.`]), pick(['Wie immer geschnitten, wie dünn war das nochmal?', 'Schneiden Sie es mir? Auf wie viel Millimeter?'])],
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Lob vom Kunden',
      customer: [pick([`Ich muss mal was loswerden: Ihr ${x.name} ist wirklich das beste Brot weit und breit!`, `Letzte Woche hatte ich ${x.name}, die ganze Familie war begeistert!`])],
      options: opts([
        { text: 'Oh, vielen Dank, das freut uns riesig! Das gebe ich gern an unsere Bäcker in der Backstube weiter.', correct: true },
        { text: 'Ach, das ist doch nur Brot, so besonders ist das jetzt auch nicht.', correct: false, why: 'Lob dankend annehmen und weitergeben, nicht kleinreden.' },
        { text: 'Ja, wir sind auch viel besser als die Bäckerei gegenüber, die backt ja nur auf.', correct: false, why: 'Nie über die Konkurrenz lästern, einfach bedanken und weitergeben.' },
        { text: 'Danke. Was darf’s sein? Hinter Ihnen ist es schon voll.', correct: false, why: 'Kurz innehalten und sich ehrlich bedanken, das gehört zum guten Service.' },
      ]),
      afterWrong: 'Na, ich fand es jedenfalls super …',
    }],
  };
}

/** Alle Szenarien mit ihren Themen (für „gezielt üben“) und Gewichtung */
// ───────── Schwierige Kunden ─────────
export function scRude(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Krause', title: 'Herr Krause', who: 'hat schlechte Laune' }, { name: 'Frau Brandt', title: 'Frau Brandt', who: 'ist genervt vom Tag' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Unhöflicher Kunde',
      customer: [pick([`Na endlich! Ich stehe hier schon ewig. ${x.name}, aber zack zack!`, `Können Sie mal aufpassen? Ich will ein ${x.name}, und zwar jetzt!`])],
      options: opts([
        { text: `Entschuldigen Sie die Wartezeit! Ein ${x.name}, kommt sofort.`, correct: true },
        { text: 'So redet man aber nicht mit mir, dann warten Sie eben noch.', correct: false, why: 'Ruhig und freundlich bleiben, nicht auf den Ton einsteigen.' },
        { text: '(Augen verdrehen und langsam weitermachen.)', correct: false, why: 'Professionell bleiben, kurz entschuldigen und zügig bedienen.' },
        { text: 'Wenn Ihnen das nicht passt, gehen Sie doch woanders hin.', correct: false, why: 'Nie patzig, freundlich bleibt man auch bei schlechter Laune des Kunden.' },
      ]),
      afterWrong: 'Unglaublich, dieser Service hier …',
    }],
  };
}

export function scHaggle(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Vogel', title: 'Herr Vogel', who: 'handelt gern' }, { name: 'Frau Kaya', title: 'Frau Kaya', who: 'sucht ein Schnäppchen' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Rabatt verlangen',
      customer: [`Ein ${x.name} bitte. Aber geben Sie mir das doch für die Hälfte, ist ja eh bald Feierabend, oder?`],
      options: opts([
        { text: 'Das darf ich leider nicht, unsere Preise sind fest. Dafür ist das Brot ganz frisch aus unserer Backstube.', correct: true },
        { text: 'Na gut, weil Sie es sind, aber nichts verraten.', correct: false, why: 'Eigenmächtig Rabatt geben ist nicht erlaubt. Freundlich bei den festen Preisen bleiben.' },
        { text: 'Nein. Wir sind doch kein Flohmarkt.', correct: false, why: 'Freundlich ablehnen und den Wert des Produkts erklären.' },
        { text: 'Dann kommen Sie halt kurz vor Ladenschluss wieder und hoffen.', correct: false, why: 'Nicht abwimmeln, freundlich die festen Preise erklären.' },
      ]),
      afterWrong: 'Ach kommen Sie, ein bisschen was geht doch immer …',
    }],
  };
}

export function scTouch(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Lange', title: 'Herr Lange', who: 'will ganz genau prüfen' }, { name: 'Frau Roth', title: 'Frau Roth', who: 'ist sehr wählerisch' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Ware anfassen',
      customer: [`(Greift über die Theke.) Ich drück mal kurz, ob das ${x.name} auch wirklich frisch ist.`],
      options: opts([
        { text: `Moment, ich zeige es Ihnen gern! Aus Hygienegründen reiche ich die Ware mit Zange oder Handschuh. Das ${x.name} ist von heute.`, correct: true },
        { text: '(Nichts sagen, der Kunde wird schon wissen, was er tut.)', correct: false, why: 'Hygiene geht vor: Kunden fassen die Ware nicht an, freundlich darauf hinweisen.' },
        { text: 'Finger weg! Das ist doch eklig!', correct: false, why: 'Freundlich erklären statt anschreien.' },
        { text: 'Drücken Sie ruhig, ich verkaufe das dann dem Nächsten.', correct: false, why: 'Angefasste Ware darf nicht weiterverkauft werden. Freundlich auf Hygiene hinweisen.' },
      ]),
      afterWrong: 'Wieso, ich will doch nur schauen …',
    }],
  };
}

export function scBigNote(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Engel', title: 'Herr Engel', who: 'hat nur einen großen Schein' }, { name: 'Frau Pohl', title: 'Frau Pohl', who: 'kommt gerade von der Bank' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Großer Geldschein',
      customer: [`Ein ${x.name}. Ich habe leider nur einen 200-Euro-Schein, geht das?`],
      options: opts([
        { text: 'Ich schaue kurz, ob ich genug Wechselgeld habe, und prüfe den Schein mit Fühlen, Sehen, Kippen. Einen Moment bitte.', correct: true },
        { text: 'Klar, her damit. (Ohne Prüfen in die Kasse legen.)', correct: false, why: 'Große Scheine immer prüfen: Fühlen, Sehen, Kippen. Und vorher ans Wechselgeld denken.' },
        { text: 'Nein, so große Scheine nehmen wir grundsätzlich nicht.', correct: false, why: 'Nicht pauschal ablehnen: Wechselgeld prüfen, Schein kontrollieren oder Kartenzahlung anbieten.' },
        { text: 'Dann zahlen Sie halt morgen.', correct: false, why: 'Lösung anbieten: Wechselgeld prüfen oder mit Karte zahlen lassen.' },
      ]),
      afterWrong: 'Und, geht das jetzt oder nicht?',
    }],
  };
}

export function scDrunkLoud(): Core | null {
  const x = pick(BREADS);
  return {
    bread: x,
    persona: pick([{ name: 'Herr Meier', title: 'Herr Meier', who: 'telefoniert sehr laut' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Kunde blockiert die Schlange',
      customer: ['(Telefoniert laut, die Schlange hinter ihm wird lang.) … ja, Moment … was wollte ich hier noch mal?'],
      options: opts([
        { text: `Darf ich Ihnen kurz helfen? Wenn Sie noch überlegen, bediene ich gern schon die nächste Kundin und bin gleich wieder bei Ihnen.`, correct: true },
        { text: 'Legen Sie mal auf, hier wollen auch andere einkaufen!', correct: false, why: 'Freundlich bleiben und eine Lösung anbieten, statt den Kunden bloßzustellen.' },
        { text: '(Einfach warten, egal wie lang die Schlange wird.)', correct: false, why: 'Freundlich anbieten, schon den nächsten Kunden zu bedienen.' },
        { text: '(Über den Kunden hinweg mit den Wartenden schimpfen.)', correct: false, why: 'Nie über Kunden lästern, höflich eine Lösung anbieten.' },
      ]),
      afterWrong: 'Ähm … ja … Moment noch …',
    }],
  };
}

export const SCENARIOS: { fn: () => Core | null; topics: string[]; weight: number }[] = [
  { fn: scAllergyBread, topics: ['Allergie'], weight: 3 },
  { fn: scAllergenCheck, topics: ['Allergene prüfen', 'Alternative ohne Allergen'], weight: 3 },
  { fn: scVeganBread, topics: ['Vegan'], weight: 2 },
  { fn: scTaste, topics: ['Mild & ohne Roggen', 'Kräftig'], weight: 2 },
  { fn: scSoldOut, topics: ['Ausverkauft'], weight: 2 },
  { fn: scIngredients, topics: ['Zutaten'], weight: 2 },
  { fn: scFlour, topics: ['Mehl'], weight: 2 },
  { fn: scPrice, topics: ['Preis'], weight: 1 },
  { fn: scSweets, topics: ['Süßes ohne Nüsse'], weight: 2 },
  { fn: scComplaint, topics: ['Reklamation'], weight: 2 },
  { fn: scPreorder, topics: ['Vorbestellung'], weight: 2 },
  { fn: scBrunch, topics: ['Anlass-Beratung'], weight: 1 },
  { fn: scGrill, topics: ['Anlass-Beratung'], weight: 1 },
  { fn: scPriceObjection, topics: ['Preis-Einwand'], weight: 2 },
  { fn: scKids, topics: ['Kinder an der Theke'], weight: 1 },
  { fn: scStorage, topics: ['Aufbewahrung'], weight: 2 },
  { fn: scLongFresh, topics: ['Frische-Beratung'], weight: 1 },
  { fn: scGlutenfree, topics: ['Glutenfrei'], weight: 1 },
  { fn: scSmallLoaf, topics: ['Größe beraten'], weight: 1 },
  { fn: scHurry, topics: ['Eiliger Kunde'], weight: 1 },
  { fn: scQueue, topics: ['Vordrängeln'], weight: 1 },
  { fn: scChangeClaim, topics: ['Wechselgeld-Reklamation'], weight: 1 },
  { fn: scCompliment, topics: ['Lob vom Kunden'], weight: 1 },
  { fn: scOfficeOrder, topics: ['Großbestellung'], weight: 1 },
  { fn: scPocketMoney, topics: ['Taschengeld'], weight: 1 },
  { fn: scEnglish, topics: ['Englisch sprechen'], weight: 1 },
  { fn: scRude, topics: ['Unhöflicher Kunde'], weight: 1 },
  { fn: scHaggle, topics: ['Rabatt verlangen'], weight: 1 },
  { fn: scTouch, topics: ['Ware anfassen'], weight: 1 },
  { fn: scBigNote, topics: ['Großer Geldschein'], weight: 1 },
  { fn: scDrunkLoud, topics: ['Kunde blockiert die Schlange'], weight: 1 },
];
