// ═══ Theken-Simulator: Alltags-Situationen und Liste aller Situationen ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { pick, sample, closeByName, parseCents, BREADS, ROLLS, SWEETS, PERSONAS, Core, opts, evenOpts, ALLERGY_TARGETS, hasAllergen, allergenText } from './basis';
import { SHOP_PRODUCTS } from '../../daten/shopProducts';
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
          { text: 'Ja, klar! Am besten schon geschnitten und gut verpackt, dann nehmen Sie immer nur raus, was Sie brauchen.', correct: true },
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
        { text: 'Am besten im Brotkasten oder in einer Brotdose. Bloß nicht in den Kühlschrank, da wird es schneller trocken.', correct: true },
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
        { text: `Nehmen Sie ${right.name}, das hält sich lange. Da ist viel Roggenschrot drin, das bleibt schön saftig.`, correct: true },
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
        { text: `Da haben wir ${bw.name}, das ist ohne Gluten gebacken. Ich muss aber ehrlich sagen: Bei uns fliegt viel Mehl rum, Spuren von Weizen und Roggen können drin sein.`, correct: true },
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
        { text: `Ja, nehmen Sie das ${small.name}. Gleicher Teig, nur kleiner.`, correct: true },
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
      customer: [pick([`Entschuldigung, ich hab’s furchtbar eilig, mein Bus kommt gleich! Einmal ${x.name}, bitte.`, `Ganz schnell bitte, ich muss zur Arbeit: ${x.name}!`])],
      options: opts([
        { text: `Klar, kommt sofort.`, correct: true },
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
        { text: 'Moment bitte, ich bin hier gerade noch dran. Danach sind Sie sofort dran.', correct: true },
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
        { text: 'Oh, das tut mir leid. Haben Sie den Bon noch? Dann schauen wir das zusammen nach.', correct: true },
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
        { text: 'Oh, danke, das freut mich! Das sag ich unseren Bäckern weiter.', correct: true },
        { text: 'Ach, das ist doch nur Brot, so besonders ist das jetzt auch nicht.', correct: false, why: 'Lob dankend annehmen und weitergeben, nicht kleinreden.' },
        { text: 'Ja, wir sind auch viel besser als die Bäckerei gegenüber, die backt ja nur auf.', correct: false, why: 'Nie über die Konkurrenz lästern, einfach bedanken und weitergeben.' },
        { text: 'Danke. Was darf’s sein? Hinter Ihnen ist es schon voll.', correct: false, why: 'Kurz innehalten und sich ehrlich bedanken, das gehört zum guten Service.' },
      ]),
      afterWrong: 'Na, ich fand es jedenfalls super …',
    }],
  };
}

// ── Version 273: Dinge, die es bei Hinkel nicht gibt (keine Getränke, keine Torten, nichts Belegtes) ──
export function scGibtEsNicht(): Core | null {
  const kuchen = SHOP_PRODUCTS.filter((p) => p.group === 'Kuchen' && parseCents(p.price) > 0);
  const art = pick(['kaffee', 'torte', 'belegt'] as const);
  const x = art === 'kaffee' ? pick(SWEETS) : art === 'torte' ? pick(kuchen.length ? kuchen : SWEETS) : pick(ROLLS);
  if (!x) return null;
  const fall = {
    kaffee: {
      kunde: pick(['Einen Kaffee zum Mitnehmen, bitte.', 'Machen Sie mir noch einen Cappuccino dazu?']),
      richtig: `Getränke haben wir leider nicht, wir sind eine reine Bäckerei. Aber zum Kaffee zu Hause passt ${x.name} super.`,
      falsch: [
        { text: 'Klar, kommt sofort. Mit Milch und Zucker?', why: 'Hinkel verkauft keine Getränke. Nichts versprechen, was es nicht gibt, sondern freundlich etwas Eigenes anbieten.' },
        { text: 'Nein, haben wir nicht.', why: 'Zu knapp. Freundlich erklären und gleich etwas aus unserem Sortiment anbieten.' },
      ],
    },
    torte: {
      kunde: pick(['Ich bräuchte eine Torte für den Geburtstag meiner Frau.', 'Haben Sie auch Sahnetorte? Wir feiern heute Nachmittag.']),
      richtig: `Torten haben wir leider nicht. Für die Feier kann ich Ihnen aber ${x.name} empfehlen, der kommt immer gut an.`,
      falsch: [
        { text: 'Gern, welche Torte darf es sein? Schwarzwälder Kirsch?', why: 'Hinkel verkauft keine Torten. Ehrlich sagen und dafür etwas aus unserem Sortiment anbieten.' },
        { text: 'Torte? Da sind Sie hier falsch.', why: 'Unfreundlich. Höflich erklären und eine Alternative aus unserem Sortiment nennen.' },
      ],
    },
    belegt: {
      kunde: pick(['Ein belegtes Brötchen mit Käse, bitte.', 'Haben Sie auch was Belegtes für die Mittagspause?']),
      richtig: `Belegte Brötchen haben wir leider nicht. Aber nehmen Sie doch ${x.name}, ganz frisch und prima zum selbst Belegen.`,
      falsch: [
        { text: 'Moment, ich schmier Ihnen schnell eins mit Käse.', why: 'Hinkel verkauft keine belegten Sachen. Freundlich sagen und ein frisches Brötchen zum selbst Belegen anbieten.' },
        { text: 'Belegt? Nein. Sonst noch was?', why: 'Zu knapp und abweisend. Erklären und ein passendes Brötchen anbieten.' },
      ],
    },
  }[art];
  return {
    persona: pick(PERSONAS),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    steps: [{
      topic: 'Gibt es bei uns nicht',
      customer: [fall.kunde],
      options: opts([
        { text: fall.richtig, correct: true },
        ...fall.falsch.map((f) => ({ ...f, correct: false })),
        { text: 'Fragen Sie mal im Café nebenan, die haben so was.', correct: false, why: 'Kunden nicht wegschicken. Lieber freundlich erklären und etwas aus unserem eigenen Sortiment anbieten.' },
      ]),
      afterWrong: 'Hm. Und was haben Sie dann für mich?',
    }],
  };
}

// ── Version 273: Kunde hört schlecht ──
export function scSchwerhoerig(): Core | null {
  const x = pick(BREADS);
  if (!x) return null;
  return {
    bread: x,
    persona: pick([{ name: 'Herr Albers', title: 'Herr Albers', who: 'hört nicht mehr so gut' }, { name: 'Frau Kühn', title: 'Frau Kühn', who: 'Seniorin mit Hörgerät' }]),
    basket: [{ name: x.name, qty: 1, cents: parseCents(x.price) }],
    sliceIntro: [pick(['Ah, jetzt hab ich es verstanden. Danke!', 'So ist es gut, danke schön.'])],
    steps: [{
      topic: 'Schwerhöriger Kunde',
      customer: [pick([`Wie bitte? Ich höre nicht mehr so gut. Was kostet ${x.name}?`, `Entschuldigung, was haben Sie gesagt? Ich verstehe Sie so schlecht.`])],
      options: opts([
        { text: `(Anschauen, langsam und deutlich:) ${x.name} kostet ${x.price}.`, correct: true },
        { text: `(Ganz laut über die Theke rufen:) ${x.name.toUpperCase()}! ${x.price}!`, correct: false, why: 'Nicht schreien. Den Kunden anschauen und langsam und deutlich sprechen, dann kann er auch vom Mund ablesen.' },
        { text: '(Seufzen und es genauso schnell nochmal sagen.)', correct: false, why: 'Geduldig bleiben. Langsamer und deutlicher sprechen, nicht nur wiederholen.' },
        { text: 'Das steht doch vorne auf dem Schild.', correct: false, why: 'Unhöflich. Ruhig, langsam und deutlich antworten, beim Sprechen den Kunden anschauen.' },
      ]),
      afterWrong: 'Wie bitte? Ich habe Sie wieder nicht verstanden …',
    }, {
      topic: 'Schwerhöriger Kunde',
      customer: ['Und welches ist das genau? Das da hinten im Regal?'],
      options: opts([
        { text: `(Auf das Brot zeigen und es hochhalten:) Genau, dieses hier.`, correct: true },
        { text: 'Das sieht man doch, das da hinten!', correct: false, why: 'Zeigen hilft mehr als Worte: das Brot hochhalten, dann weiß der Kunde sofort Bescheid.' },
        { text: '(Wegdrehen und beim Einpacken weiterreden.)', correct: false, why: 'Beim Sprechen den Kunden anschauen, sonst versteht er nichts. Am besten die Ware zeigen.' },
        { text: '(Nichts sagen und einfach irgendeins einpacken.)', correct: false, why: 'Nachfragen und die Ware zeigen, damit der Kunde bekommt, was er möchte.' },
      ]),
      afterWrong: 'Hm? Welches meinen Sie jetzt?',
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
      customer: [pick([`Na endlich! Ich stehe hier schon ewig. ${x.name}, aber zack zack!`, `Können Sie mal aufpassen? Ich will ${x.name}, und zwar jetzt!`])],
      options: opts([
        { text: `Entschuldigung, dass Sie warten mussten. Kommt sofort.`, correct: true },
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
      customer: [`Einmal ${x.name}, bitte. Aber geben Sie mir das doch für die Hälfte, ist ja eh bald Feierabend, oder?`],
      options: opts([
        { text: 'Das darf ich leider nicht, die Preise sind fest. Aber das Brot ist von heute früh.', correct: true },
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
        { text: `Bitte nicht anfassen, ich zeig es Ihnen gern. (Mit der Zange hochnehmen.) Das ist von heute früh.`, correct: true },
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
    zahltMit: 20000, // bezahlt am Ende auch wirklich mit dem 200-Euro-Schein
    sliceIntro: [pick(['Super, danke!', 'Okay, danke.'])],
    steps: [{
      topic: 'Großer Geldschein',
      customer: [`Einmal ${x.name}. Ich habe leider nur einen 200-Euro-Schein, geht das?`],
      options: opts([
        { text: 'Moment, ich schau kurz, ob ich genug Wechselgeld habe. (Schein prüfen: fühlen, sehen, kippen.)', correct: true },
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
    sliceIntro: [pick([`(Legt auf.) Oh, sorry! Einmal ${x.name}, bitte.`, `(Steckt das Handy weg.) Entschuldigung. Ich hätte gern ${x.name}.`])],
    steps: [{
      topic: 'Kunde blockiert die Schlange',
      customer: ['(Telefoniert laut, die Schlange hinter ihm wird lang.) … ja, Moment … was wollte ich hier noch mal?'],
      options: opts([
        { text: `Wenn Sie noch überlegen, nehm ich schon mal die Nächste dran, okay? Ich bin gleich wieder bei Ihnen.`, correct: true },
        { text: 'Legen Sie mal auf, hier wollen auch andere einkaufen!', correct: false, why: 'Freundlich bleiben und eine Lösung anbieten, statt den Kunden bloßzustellen.' },
        { text: '(Einfach warten, egal wie lang die Schlange wird.)', correct: false, why: 'Freundlich anbieten, schon den nächsten Kunden zu bedienen.' },
        { text: '(Über den Kunden hinweg mit den Wartenden schimpfen.)', correct: false, why: 'Nie über Kunden lästern, höflich eine Lösung anbieten.' },
      ]),
      afterWrong: 'Ähm … ja … Moment noch …',
    }],
  };
}


// ── Version 208: weitere echte Situationen ──

/** Kunde holt eine Vorbestellung ab */
export function scAbholung(): Core | null {
  if (!ROLLS.length) return null;
  const r = pick(ROLLS);
  const n = pick([10, 12, 15, 20, 25, 30]);
  const name = pick(['Müller', 'Schmitz', 'Yildiz', 'Becker', 'Hoffmann', 'Wagner']);
  return {
    basket: [{ name: r.name, qty: n, cents: parseCents(r.price) }],
    steps: [{
      topic: 'Vorbestellung abholen',
      customer: [pick([`Hallo, ich hab was vorbestellt. Auf ${name}.`, `Ich wollte meine Bestellung abholen, auf den Namen ${name}.`])],
      options: opts([
        { text: `Moment, ich schau kurz nach. (In der Bestell-Liste nachsehen.) Ja, hier: ${n} ${r.name}. Passt das so?`, correct: true },
        { text: 'Davon weiß ich nichts, da müssen Sie morgen nochmal kommen.', correct: false, why: 'Erst in der Bestell-Liste nachsehen, statt den Kunden wegzuschicken.' },
        { text: `(Irgendeine Tüte aus dem Regal nehmen und rübergeben.)`, correct: false, why: 'Immer Name und Bestellung prüfen, sonst bekommt jemand die falsche Tüte.' },
        { text: 'Bestellungen macht meine Kollegin, die ist heute nicht da.', correct: false, why: 'Jeder kann nachsehen: Bestell-Liste prüfen und die Ware raussuchen.' },
      ]),
      afterWrong: 'Hm, ich hab das aber wirklich bestellt …',
    }],
    sliceIntro: [pick(['Ja, genau, danke!', 'Super, das passt.'])],
  };
}

/** Kunde hat die falsche Ware in der Tüte */
export function scFalscheWare(): Core | null {
  if (BREADS.length < 3) return null;
  const [gewollt, bekommen, dazu] = sample(BREADS, 3);
  return {
    bread: dazu,
    basket: [{ name: dazu.name, qty: 1, cents: parseCents(dazu.price) }],
    steps: [{
      topic: 'Falsche Ware bekommen',
      customer: [pick([`Entschuldigung, ich war vorhin hier. Ich wollte ${gewollt.name}, in der Tüte ist aber ${bekommen.name}.`, `Ich hab gerade gesehen: Das ist gar nicht ${gewollt.name}, das ist ${bekommen.name}.`])],
      options: opts([
        { text: `Oh, das tut mir leid! Ich tausch Ihnen das sofort um. (${gewollt.name} einpacken.)`, correct: true },
        { text: 'Das haben Sie aber so bestellt, da kann ich nichts machen.', correct: false, why: 'Fehler passieren. Freundlich entschuldigen und sofort umtauschen.' },
        { text: 'Umtausch geht nur mit Bon. Ohne Bon nicht.', correct: false, why: 'Bei einer Verwechslung einfach umtauschen, der Kunde hat ja schon bezahlt.' },
        { text: 'Das schmeckt doch auch, behalten Sie das ruhig.', correct: false, why: 'Der Kunde wollte etwas anderes: entschuldigen und das Richtige geben.' },
      ]),
      afterWrong: 'Na ja, ich wollte aber wirklich das andere …',
    }],
    sliceIntro: [pick([`Danke! Und wenn ich schon mal da bin: einmal ${dazu.name}, bitte.`, `Super, danke. Dann nehm ich noch ${dazu.name} mit.`])],
  };
}

/** Kunde fragt nach Allergenen bei Saison- oder Weihnachtsgebäck */
export function scSaisonAllergen(): Core | null {
  const t = pick(ALLERGY_TARGETS);
  const saison = SHOP_PRODUCTS.filter((p) => (p.group === 'Weihnachtsgebäck' || p.group === 'Saisongebäck') && !p.allergenNote);
  if (!saison.length || !BREADS.length) return null;
  const p = pick(saison);
  const drin = hasAllergen(p as any, t.key);
  const brot = pick(BREADS);
  return {
    bread: brot,
    basket: [{ name: brot.name, qty: 1, cents: parseCents(brot.price) }],
    steps: [{
      topic: 'Allergene bei Saisonware',
      learn: { product: p.name, kind: 'allergene' },
      customer: [pick([`Ist in ${p.name} was mit ${t.label} drin? ${pick(t.says)}`, `${pick(t.says)} Kann ich ${p.name} nehmen?`])],
      options: opts([
        { text: drin ? `Da ${t.verb} leider ${t.label} drin, das würde ich nicht nehmen.` : `Da ${t.verb} ${t.neg} drin, das können Sie nehmen.`, correct: true },
        { text: drin ? `Da ${t.verb} ${t.neg} drin, das können Sie nehmen.` : `Da ${t.verb} leider ${t.label} drin, das würde ich nicht nehmen.`, correct: false, why: `${p.name}: Allergene ${allergenText(p as any)}.` },
        { text: 'Das ist ja nur Weihnachtsgebäck, da ist bestimmt nichts Schlimmes drin.', correct: false, why: 'Auch bei Saisonware immer im Spickzettel nachsehen, nie raten.' },
        { text: 'Weiß ich nicht genau. Probieren Sie einfach ein kleines Stück.', correct: false, why: 'Bei Allergien nie probieren lassen: im Spickzettel nachsehen.' },
      ]),
      afterWrong: 'Hm, sind Sie sicher? Dann lass ich das lieber.',
    }],
    sliceIntro: [pick([`Gut zu wissen, danke. Dann nur ${brot.name}, bitte.`, `Okay, danke. Dann nehm ich heute nur ${brot.name}.`])],
  };
}

// ── Version 241: Situationen für Januar bis März (Berliner-Saison, gute Vorsätze) ──

/** Ostersonntag (Gauß), daraus Aschermittwoch = Ostern − 46 Tage */
const ostern = (j: number) => {
  const a = j % 19, b = Math.floor(j / 100), c = j % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mon = Math.floor((h + l - 7 * m + 114) / 31), tag = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(j, mon - 1, tag);
};

/** Berliner-Saison: ab 27. Dezember (Silvester) bis Aschermittwoch (Karneval). Dann gibt es auch andere Füllungen. */
export function berlinerSaison(jetzt: Date = new Date()): 'silvester' | 'karneval' | null {
  if (jetzt.getMonth() === 11) return jetzt.getDate() >= 27 ? 'silvester' : null;
  const asch = ostern(jetzt.getFullYear()); asch.setDate(asch.getDate() - 46);
  return jetzt.getTime() < asch.getTime() + 86400000 ? 'karneval' : null;
}

const prod = (n: string) => SHOP_PRODUCTS.find((p) => p.name === n);

/** Kunde fragt nach dem Unterschied zwischen Berliner und Krapfen (gibt es das ganze Jahr) */
export function scBerlinerKrapfen(): Core | null {
  const berliner = prod('Berliner'), krapfen = prod('Krapfen');
  if (!berliner || !krapfen || !parseCents(berliner.price) || !parseCents(krapfen.price)) return null;
  const nimmt = pick([berliner, krapfen]);
  const n = pick([2, 3, 4]);
  return {
    basket: [{ name: nimmt.name, qty: n, cents: parseCents(nimmt.price) }],
    steps: [{
      topic: 'Berliner oder Krapfen',
      learn: { product: 'Krapfen', kind: 'inhalt' },
      customer: [pick(['Sagen Sie mal, was ist eigentlich der Unterschied zwischen Berliner und Krapfen?', 'Berliner, Krapfen … ist das nicht dasselbe?'])],
      options: opts([
        { text: 'Der Berliner ist aus Hefeteig und mit Erdbeerkonfitüre gefüllt. Unser Krapfen ist aus Brandteig mit Rosinen und in Zimt-Zucker gewälzt.', correct: true },
        { text: 'Das ist dasselbe, das sagt man nur in jeder Gegend anders.', correct: false, why: 'Bei uns sind das zwei verschiedene Sachen: Berliner aus Hefeteig mit Erdbeerkonfitüre, Krapfen aus Brandteig mit Rosinen und Zimt-Zucker.' },
        { text: 'Der Krapfen ist mit Erdbeerkonfitüre gefüllt, der Berliner hat Rosinen im Teig.', correct: false, why: 'Genau andersrum: Der Berliner hat die Erdbeerkonfitüre, der Krapfen die Rosinen.' },
        { text: 'Beide sind aus Brandteig, der Krapfen ist nur ein bisschen größer.', correct: false, why: 'Nur der Krapfen ist aus Brandteig. Der Berliner ist aus Hefeteig.' },
      ]),
      afterWrong: 'Ach so? Ich dachte, das ist was anderes … Na egal.',
    }],
    sliceIntro: [pick([`Ah, gut zu wissen! Dann nehme ich ${n} ${nimmt.name === 'Berliner' ? 'Berliner' : 'Krapfen'}.`, `Danke! Dann probiere ich mal ${n} ${nimmt.name === 'Berliner' ? 'Berliner' : 'Krapfen'}.`])],
  };
}

/** Silvester oder Karneval: viele Berliner fürs Büro, mit anderen Füllungen. Nur in der Berliner-Saison. */
export function scBerlinerSaison(): Core | null {
  const saison = berlinerSaison();
  const berliner = prod('Berliner');
  if (!saison || !berliner || !parseCents(berliner.price)) return null;
  const n = pick([20, 24, 30, 40]);
  const anlass = saison === 'silvester' ? pick(['für unsere Silvesterfeier', 'für Silvester']) : pick(['für Weiberfastnacht im Büro', 'für unsere Karnevalsfeier im Büro']);
  const jetzt = pick([2, 3]);
  return {
    basket: [{ name: 'Berliner', qty: jetzt, cents: parseCents(berliner.price) }],
    steps: [{
      topic: 'Berliner-Saison',
      customer: [pick([`Ich brauche ${n} Berliner ${anlass}. Gibt es die auch mit was anderem als Erdbeere?`, `Wir wollen ${anlass} ${n} Berliner haben. Haben Sie auch andere Füllungen?`])],
      options: opts([
        { text: 'Ja, jetzt in der Berliner-Saison gibt es auch Vanillepudding, Schokopudding und Eierlikör. Für so viele schreibe ich Ihnen eine Bestellung: Auf welchen Namen, wann holen Sie ab und welche Sorten?', correct: true },
        { text: 'Nein, Berliner gibt es bei uns nur mit Erdbeere.', correct: false, why: 'In der Berliner-Saison (Silvester, Karneval) gibt es auch Vanillepudding, Schokopudding und Eierlikör. Große Mengen als Bestellung aufschreiben.' },
        { text: 'So viele? Kommen Sie am besten am Tag selbst ganz früh, dann schauen wir, was noch da ist.', correct: false, why: 'Gerade in der Saison sind Berliner schnell weg. Große Mengen immer als Bestellung aufschreiben: Name, Abholzeit, Sorten.' },
        { text: 'Klar, das merke ich mir. Sagen Sie einfach am Tag Ihren Namen.', correct: false, why: 'Bestellungen nie nur merken: Name, Abholzeit, Menge und Sorten aufschreiben.' },
      ]),
      afterWrong: 'Hm, ich hätte das schon gern richtig bestellt. Schreiben Sie bitte auf: halb Vanille, halb Erdbeere.',
    }],
    sliceIntro: [pick([`Super, danke! Und für jetzt nehme ich schon mal ${jetzt} Berliner mit.`, `Prima. Und heute hätte ich gern ${jetzt} Berliner zum Probieren.`])],
  };
}

/** Gute Vorsätze: Kunde möchte mehr Vollkorn essen */
export function scVollkorn(): Core | null {
  const gut = BREADS.filter((p) => /vollkorn/i.test(p.name));
  const falsch = BREADS.filter((p) => p.breadType === 'weizen' && !/vollkorn|dinkel/i.test(p.name + ' ' + p.shortIngredients));
  if (!gut.length || falsch.length < 3) return null;
  const right = pick(gut);
  const januar = new Date().getMonth() === 0;
  return {
    bread: right,
    basket: [{ name: right.name, qty: 1, cents: parseCents(right.price) }],
    steps: [{
      topic: 'Vollkorn',
      learn: { product: right.name, kind: 'mehl' },
      customer: [januar
        ? pick(['Ich hab mir fürs neue Jahr vorgenommen, mehr Vollkorn zu essen. Was nehme ich da?', 'Guter Vorsatz fürs neue Jahr: mehr Vollkorn. Was haben Sie da?'])
        : pick(['Ich möchte mehr Vollkorn essen. Was empfehlen Sie mir?', 'Haben Sie ein richtiges Vollkornbrot?'])],
      options: evenOpts([
        { text: `Da nehmen Sie am besten ${right.name}. Das ist aus Roggenschrot, also mit dem ganzen Korn.`, correct: true },
        ...closeByName(falsch, right, 3).map((w) => ({ text: `Da nehmen Sie am besten ${w.name}. Das ist ein richtiges Vollkornbrot.`, correct: false, why: `${w.name} ist ein Weizenbrot, kein Vollkorn. Mit dem ganzen Korn ist zum Beispiel ${right.name}.` })),
      ]),
      afterWrong: `Hm, das sieht mir aber ganz hell aus … Ich nehme lieber ${right.name}.`,
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
  { fn: scAbholung, topics: ['Vorbestellung abholen'], weight: 1 },
  { fn: scFalscheWare, topics: ['Falsche Ware bekommen'], weight: 1 },
  { fn: scSaisonAllergen, topics: ['Allergene bei Saisonware'], weight: 1 },
  { fn: scGibtEsNicht, topics: ['Gibt es bei uns nicht'], weight: 1 },
  { fn: scSchwerhoerig, topics: ['Schwerhöriger Kunde'], weight: 1 },
  { fn: scBerlinerKrapfen, topics: ['Berliner oder Krapfen'], weight: 1 },
  { fn: scBerlinerSaison, topics: ['Berliner-Saison'], weight: 3 },
  { fn: scVollkorn, topics: ['Vollkorn'], weight: 1 },
];
