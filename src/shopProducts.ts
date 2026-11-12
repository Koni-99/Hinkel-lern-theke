/**
 * Sortiment aus dem Hinkel-Shop (hinkel-shop.de).
 * Texte, Zutaten und Allergene sind 1:1 aus den Shop-Seiten übernommen.
 * "shortIngredients" ist die Kurzfassung für das Verkaufsgespräch, sie nennt nur Zutaten,
 * die auch in der vollständigen Liste stehen. Bei Allergie-Fragen immer die vollständige Liste nehmen!
 */
export interface ShopProduct {
  name: string;
  /** Weitere Schreibweisen, damit der Artikel zu einem vorhandenen Steckbrief passt */
  aliases?: string[];
  group: string;
  description: string;
  weight?: string;
  price?: string;
  pricePerKg?: string;
  /** „Im Verkauf sagen“, kurz und einfach */
  shortIngredients: string;
  /** Vollständige Zutatenliste exakt wie im Shop */
  fullIngredients: string;
  /** Allergene exakt wie im Shop; leer = im Shop keine angegeben */
  allergens: string[];
  /** Hinweis zu den Allergenen (z. B. wenn sie aus der Zutatenliste abgeleitet wurden) */
  allergenNote?: string;
  note?: string;
  /** Mehl-Zusammensetzung, z. B. „70 % Roggen, 30 % Weizen“ */
  flour?: string;
  /** Brotsorte für Steckbrief-Gruppe und Schnittstärke */
  breadType?: 'schwarzbrot' | 'roggen' | 'roggenmisch' | 'weizenmisch' | 'weizen' | 'stuten' | 'dinkel' | 'spezial';
  /** Ohne tierische Zutaten */
  vegan?: boolean;
}

const BACKMALZ =
  'Backmalz (Weizenmalzmehl, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, Weizenmalzextrakt, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, Weizenmehl, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme)';
const VANILLEAROMA =
  'Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe)';

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    name: 'Abendschnitte',
    aliases: ['Abendschnitte (Eiweißbrot)'],
    group: 'Brot',
    price: '15,00 €',
    pricePerKg: '15,00 € / kg',
    weight: '1000 g',
    description:
      'Unsere Abendschnitte kommt ganz ohne Mehl und Hefe aus. Gebacken aus Haferflocken, Sonnenblumenkernen, Leinsamen, Mandeln, Chiasamen, Flohsamenschalen, rheinischer Ackerbohne, Honig, Salz und Wasser. Ihr nussiger Geschmack und die kernige Konsistenz machen sie zu einer besonderen Alternative im Brotsortiment, und als Proteinquelle passt sie gut in eine ausgewogene Ernährung. Auch als Backmischung für zuhause im Shop erhältlich.',
    shortIngredients:
      'Ohne Mehl und Hefe: Haferflocken, Sonnenblumenkerne, Leinsamen, Mandeln, Chiasamen, Ackerbohne, Flohsamenschalen, Honig',
    fullIngredients:
      'Wasser, HAFER, Sonnenblumenkerne, Leinsaat, MANDELN, Chiasamen, Ackerbohne, Flohsamenschalen, Honig, Salz',
    allergens: ['Gluten (Hafer)', 'Schalenfrüchte (Mandeln)'],
    flour: 'Ganz ohne Mehl',
    breadType: 'spezial'
  },
  {
    name: 'Apfelring',
    group: 'Feingebäck',
    price: '2,80 €',
    description:
      'Unser Apfelring ist außen goldbraun, innen herrlich weich und steckt voller saftiger Apfelstücke. Der lockere Hefeteig erhält durch das Ausbacken eine besonders feine Kruste. Direkt nach dem Backen wird der Ring in Zucker gewälzt, was ihm einen angenehmen Crunch verleiht und die Süße der Äpfel perfekt abrundet.',
    shortIngredients: 'Hefeteig mit Äpfeln, Quark, Butter, Ei und Zimt, in Zucker gewälzt',
    fullIngredients:
      'Apfel, WEIZENMEHL, Zucker, Wasser, Pflanzenfett (Sonnenblumenöl, Kokosnussöl, Zitronensäure), VOLLEI, Zeel.Quarkini 632 25kg (WEIZENMEHL, Rapsöl, Palmöl, Zucker, VOLLEIPULVER, WEIZENSTÄRKE, Salz, Natriumcarbonat, Diphosphate, Monoglyceride von Speisefettsäuren, Diglyceride von Speisefettsäuren, WEIZENLECITHIN, HÜHNEREIWEIßPULVER, Glukosesirup, Guarkernmehl, natürliches Aroma (BUTTER), MILCHEIWEIß, Kaliumtartrate), EIGELB, Hefe, BUTTER, MAGERQUARK, VOLLMILCHPULVER, WEIZENKLEBER, Zimt, Salz, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), natürliches Bourbon-Vanillearoma' +
      VANILLEAROMA +
      ', ' +
      BACKMALZ +
      ', natürliches Bourbon-Vanillearoma',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Apfeltasche',
    group: 'Feingebäck',
    price: '2,80 €',
    description:
      'Unsere Apfeltasche ist ein handgefertigtes Plundergebäck, das sich durch echte Handwerkskunst und beste Zutaten auszeichnet. Der Teig wird mit hochwertiger Markenbutter zubereitet und sorgt so für den typisch blättrigen, buttrigen Biss. Die Füllung besteht aus frischen Äpfeln, Mandeln, Rosinen und einer feinen Zimtnote. Jede einzelne Apfeltasche wird bei uns von Hand gefüllt, sorgfältig gefaltet und abschließend aprikotiert und mit feinem Fondant überzogen.',
    shortIngredients: 'Blätterteig mit Butter, gefüllt mit Äpfeln, Rosinen, Mandeln und Zimt, aprikotiert',
    fullIngredients:
      'Apfel (Apfel, Wasser, Zitronensäure, Ascorbinsäure), WEIZENMEHL, Wasser, MILCH, Fondant (Zucker, Glukosesirup), Zucker, Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), VOLLEI, Braun Kabi Saftbinder (acetyliertes Distärkephosphat, acetyliertes Distärkeadipat, Zucker), Hefe, Rosinen (Rosinen, Sonnenblumenöl), MANDELN, BUTTER, VOLLMILCHPULVER, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz, Fruchtsäure (Wasser, Zitronensäure), Zimt' +
      BACKMALZ +
      ', Salz, Fruchtsäure (Wasser, Zitronensäure), Zimt',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Backmischung Abendschnitte',
    group: 'Backmischung',
    price: '7,00 €',
    pricePerKg: '14,00 € / kg',
    weight: '500 g',
    description:
      'Die Backmischung für unsere beliebte Abendschnitte: ohne Mehl, ohne Hefe, eine Proteinquelle und schnell gebacken. Einfach Wasser und Agavendicksaft (oder Honig) dazugeben, verrühren, ab in den Ofen und genießen! Mehr Infos zur Abendschnitte gibt es im Video ab Minute 30:00.',
    shortIngredients:
      'Trockenmischung aus Haferflocken, Sonnenblumenkernen, Leinsamen, Mandeln, Chiasamen, Ackerbohne und Flohsamenschalen, dazu kommen Wasser und Agavendicksaft (oder Honig)',
    fullIngredients:
      'HAFER, Sonnenblumenkerne, Leinsaat, MANDELN, Chiasamen, Ackerbohne, Flohsamenschalen, Salz',
    allergens: ['Gluten (Hafer)', 'Schalenfrüchte (Mandeln)'],
    note: 'Die genaue Anleitung steht auf der Rückseite der Verpackung. Das Mindesthaltbarkeitsdatum steht ebenfalls auf der Verpackung.',
    vegan: true
  },
  {
    name: 'Bärentatze',
    group: 'Feingebäck',
    price: '2,80 €',
    description:
      'Unsere Bärentatze ist ein echter Klassiker unter den feinen Gebäcken. Buttrig zartes Spritzgebäck trifft auf eine großzügige Portion dunkler Kuvertüre. Einmal mittig gefüllt, einmal zur Hälfte überzogen. Ein knusprig schokoladiger Genuss für alle, die es süß und kräftig mögen.',
    shortIngredients: 'Butter-Spritzgebäck mit Ei, mit dunkler Kuvertüre gefüllt bzw. überzogen',
    fullIngredients:
      'WEIZENMEHL, BUTTER, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), Zucker, Kondensmilch (MILCH, Natriumphosphate, Carrageen), VOLLEI, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), natürliches Bourbon-Vanillearoma, Salz' +
      VANILLEAROMA +
      ', natürliches Bourbon-Vanillearoma, Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Soja', 'Milch']
  },
  {
    name: 'Berliner',
    group: 'Feingebäck',
    price: '1,90 €',
    description:
      'Unser Berliner ist ein echter Klassiker aus lockerem Hefeteig, goldbraun ausgebacken und in der klassischen Version mit feiner Erdbeerkonfitüre gefüllt. Der Teig ist weich und saftig, die Zuckerschicht außen sorgt für den typischen süßen Abschluss. Zur Berliner-Saison, etwa an Silvester oder zu Karneval, gibt es ihn auch in weiteren Varianten, mit Vanillepudding, Schokopudding, Eierlikör oder mit feinem Guss statt Zucker.',
    shortIngredients: 'Hefeteig mit Ei und Butter, gefüllt mit Erdbeerkonfitüre, in Zucker gewälzt',
    fullIngredients:
      'Erdbeerkonfitüre (Erdbeeren, Zucker, Glukose-Fruktose-Sirup, Pektin, Zitronensäure, Trinatriumcitrat, Calciumcitrat), WEIZENMEHL, Zucker, Wasser, VOLLEI, EIGELB, Hefe, BUTTER, Pflanzenfett (Sonnenblumenöl, Kokosnussöl, Zitronensäure), VOLLMILCHPULVER, WEIZENKLEBER, Salz, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), natürliches Bourbon-Vanillearoma' +
      VANILLEAROMA +
      ', ' +
      BACKMALZ +
      ', natürliches Bourbon-Vanillearoma',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Bratapfelkuchen',
    group: 'Kuchen',
    price: '2,90 €',
    description:
      'Unser Bratapfelkuchen vereint alles, was man an herbstlichem und winterlichem Gebäck liebt. Saftige Apfelstücke, aromatisch abgeschmeckt mit Zimt und einem Hauch Rum, treffen auf einen buttrigen Rührteig. Dazu kommen feines Marzipan und gehackte Mandeln, die dem Kuchen eine besonders weiche, aber zugleich leicht nussige Note verleihen. Ein runder, vollmundiger Geschmack.',
    shortIngredients: 'Rührteig mit Äpfeln, Marzipan und Mandeln, mit Zimt und einem Hauch Rum',
    fullIngredients:
      'Apfel (Apfel, Wasser, Zitronensäure, Ascorbinsäure), WEIZENMEHL, Zucker, BUTTER, VOLLEI, MANDELN, WEIZENSTÄRKE, Wasser, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), VOLLMILCHPULVER, EIGELB, Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke), Zimt, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Rum 38% vol., Salz' +
      VANILLEAROMA +
      ', Rum 38% vol., Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Brötchen (Piepken)',
    aliases: ['Brötchen', 'Piepken', 'Pipken', 'Brötchen / Pipken'],
    group: 'Brötchen',
    price: '0,55 €',
    description:
      'Unser Piepken ist das klassische Hinkel-Brötchen, mild aromatisch, mit zartsplittriger Kruste und saftiger Krume. Jedes Brötchen ist ein Unikat, von Hand aufgemacht und aus besonders weichem Teig hergestellt, der maschinell nicht verarbeitet werden kann. Für alle, die echtes Bäckerhandwerk schon beim Frühstück schmecken möchten.',
    shortIngredients: 'Weizenmehl, Wasser, Hefe, Salz und etwas Butter',
    fullIngredients:
      'WEIZENMEHL, Wasser, Hefe, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), BUTTER' + BACKMALZ + ', Butter',
    allergens: ['Gluten (Weizen)', 'Milch'],
    flour: '100 % Weizen'
  },
  {
    name: 'Buchweizenbrot',
    group: 'Brot',
    price: '12,50 €',
    pricePerKg: '10,00 € / kg',
    weight: '1250 g',
    description:
      'Unser Buchweizenbrot wird aus Buchweizenvollkornmehl, Leinsamen und Apfelessig gebacken. Mild, nussig und mit dem typischen Buchweizen-Geschmack ist dieses Brot nicht nur für Menschen mit Glutenunverträglichkeit eine Bereicherung, sondern für alle, die charaktervollen Geschmack schätzen. Die Rezeptur ist von Natur aus glutenfrei, kann jedoch durch handwerkliche Verarbeitung Spuren von Gluten enthalten.',
    shortIngredients: 'Buchweizenmehl, Wasser, Apfelessig, Apfelmark, Leinsamen, Salz, Hefe',
    fullIngredients:
      'Buchweizenmehl, Wasser, Apfelessig, Apfelmark (Apfel, Ascorbinsäure), Leinsaat, Salz, Hefe',
    allergens: [],
    allergenNote: 'Die Rezeptur ist von Natur aus glutenfrei, durch Mehlstaub in der Backstube kann es aber Spuren von Gluten (Roggen, Weizen) enthalten.',
    flour: '100 % Buchweizen',
    breadType: 'spezial',
    vegan: true
  },
  {
    name: 'Burgunderstuten',
    group: 'Stuten & Brioche',
    price: '5,00 €',
    pricePerKg: '10,00 € / kg',
    weight: '500 g',
    description:
      'Unser Burgunder-Stuten ist ein reichhaltiger Brioche-Stuten mit viel Butter und Ei. Weich, buttrig und einfach ein Fest fürs Frühstück oder den Nachmittagskaffee.',
    shortIngredients: 'Weizenmehl, Eier, Butter, Zucker, Hefe, Salz',
    fullIngredients: 'WEIZENMEHL, VOLLEI, BUTTER, Zucker, Hefe, Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch'],
    flour: '100 % Weizen',
    breadType: 'stuten'
  },
  {
    name: 'Butter-Croissant',
    aliases: ['Buttercroissant'],
    group: 'Feingebäck',
    price: '2,00 €',
    description:
      'Unser Butter-Croissant wird ganz klassisch französisch mit viel Butter im Teig touriert. Durch den hohen Butteranteil entsteht eine blättrige, zarte Struktur und ein Geschmack, der an die Auslagen einer Pariser Boulangerie erinnert. Außen goldbraun gebacken, innen luftig und herrlich aromatisch.',
    shortIngredients: 'Weizenmehl, viel Butter, Wasser, Ei, Zucker, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, BUTTER, Wasser, Zucker, VOLLEI, VOLLMILCHPULVER, Hefe, Salz, Plunderbackmittel (WEIZENKLEBER, WEIZENMEHL, Monoglyceride von Speisefettsäuren, Diglyceride von Speisefettsäuren, Essigsäureester von Mono - und Diglyceriden von Speisefettsäuren, Calciumphosphate, Ascorbinsäure)',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Butterkuchen',
    group: 'Kuchen',
    price: '2,50 €',
    description:
      'Unser Butterkuchen ist ein saftiger Blechkuchen aus lockerem Hefeteig, der mit zartem Marzipan, fein gehobelten Mandeln, reichlich Butter und einem Hauch Sahne veredelt wird. Ein knusprig karamellisierter Zuckerbelag rundet das Ganze ab und macht ihn zu einem echten Genussmoment für jeden Tag.',
    shortIngredients: 'Hefeteig mit viel Butter und Sahne, Marzipan und Mandeln, Zuckerbelag',
    fullIngredients:
      'WEIZENMEHL, BUTTER, Wasser, VOLLEI, Zucker, Sahne (SAHNE, Carrageen), Cremepulver (Zucker, modifizierte Stärke, VOLLMILCHPULVER, MAGERMILCHPULVER, Dextrose, Natriumalginat, Diphosphate, Monoglyceride von Speisefettsäuren, MILCHEIWEIß, Karottenkonzentrat), Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Hefe, VOLLMILCHPULVER, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme)' +
      BACKMALZ,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Butterspekulatius',
    group: 'Weihnachtsgebäck',
    price: '3,80 €',
    pricePerKg: '38,00 € / kg',
    description:
      'Unser Spekulatius ist knusprig, hauchdünn und sorgfältig gebacken nach bewährter Handwerkstradition. Mit viel Fingerspitzengefühl werden die filigranen Motive geprägt und die feine Rezeptur in jeder Charge frisch zubereitet.',
    shortIngredients: 'Weizenmehl, Zucker, Butter, Milchpulver, etwas Marzipan, Spekulatiusgewürz',
    fullIngredients:
      'WEIZENMEHL, Zucker, BUTTER, Wasser, VOLLMILCHPULVER, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Spekulatiusgewürz (Zimt, Nelken, Anis, Ingwer, Muskatnuss, Cardamom), Salz, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat)' +
      VANILLEAROMA +
      ', Hirschhornsalz ABC Trieb (Ammoniumhydrogencarbonat, Magnesiumcarbonat)',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)'],
    note: 'Gleiche Zutaten wie der Gewürzspekulatius, nur andere Reihenfolge.'
  },
  {
    name: 'Campaillette',
    group: 'Brot',
    price: '3,10 €',
    pricePerKg: '12,40 € / kg',
    weight: '250 g',
    description:
      'Unser Campaillette ist ein französisches Baguette mit rustikaler Kruste und feiner, lockerer Krume. Die besondere Tiefe im Geschmack entsteht durch fermentiertes Mehl, das dem Teig bereits zu Beginn zugegeben wird. In Kombination mit der langen Teigführung entsteht ein Brot mit ausgewogenem Aroma und echter Backtradition. Besonders gut geeignet zu einer Käseplatte mit einer Auswahl aus Weich- und Hartkäse.',
    shortIngredients: 'Weizenmehl, Wasser, Salz, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Salz, Hefe',
    allergens: ['Gluten (Weizen)'],
    note: 'Verkaufstipp: zur Käseplatte mit Weich- und Hartkäse.',
    flour: '100 % Weizen',
    breadType: 'weizen',
    vegan: true
  },
  {
    name: 'Casanova',
    group: 'Brot',
    price: '8,80 €',
    pricePerKg: '17,60 € / kg',
    weight: '500 g',
    description:
      'Unser Casanova ist für alle gedacht, die es ausgefallen mögen. Der Teig aus 100 Prozent Roggenvollkornschrot wird mit Cranberrys und einem Hauch Lakritz verfeinert, eine ungewöhnliche, aber faszinierende Kombination aus süß, herzhaft und leicht würzig. Handlich, kräftig und einfach anders. Für Abwechslung sorgen auch die Walnuss- oder Kürbiskernvarianten.',
    shortIngredients: 'Roggenschrot, Cranberries, Lakritz, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Cranberries (Cranberries, Maismehl), Lakritz (Süßholz-Wurzel, Gelatine, modifizierte Stärke, Agar-Agar, Anis, Pektin), Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    note: 'Schwarzbrotstange mit Cranberries und Lakritz. Das Lakritz enthält Gelatine, nicht vegetarisch.',
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot'
  },
  {
    name: 'Chia-Brot',
    group: 'Brot',
    price: '4,60 €',
    pricePerKg: '9,20 € / kg',
    weight: '500 g',
    description:
      'Unser Chia-Brot ist kräftig im Geschmack, fein in der Textur und besonders in der Wirkung. In diesem Roggenmischbrot treffen traditioneller Sauerteig und nährstoffreiche Chiasamen aufeinander. Die kleinen Körner stecken voller Omega-3-Fettsäuren, Ballaststoffe und pflanzlichem Eiweiß und machen das Brot damit zur wertvollen Ergänzung auf dem Speiseplan.',
    shortIngredients: 'Roggenmehl, Wasser, Chiasamen, Weizenmehl, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, Chiasamen, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Nur montags!',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Christstollen',
    aliases: ['Weihnachtsstollen', 'Stollen'],
    group: 'Weihnachtsgebäck',
    price: '35,00 € (mit Marzipan)',
    pricePerKg: '29,17 € / kg',
    weight: '1200 g',
    description:
      'Unser Weihnachtsstollen wird in sorgfältiger Handarbeit gefertigt, nach überliefertem Familienrezept und mit viel Zeit. Der Teig hat eine lange Ruhezeit vor dem Backen, damit sich Aromen und Struktur optimal entwickeln können. Nach dem Backen reift jeder Stollen erneut über viele Tage, um seinen vollen Geschmack zu entfalten: Ein Prozess, der Erfahrung, Geduld und Sorgfalt erfordert. Verarbeitet werden ausschließlich hochwertige Zutaten wie gute Butter, geröstete Mandeln und aromatische Sultaninen. Für den besonderen rheinischen Akzent werden die Mandeln in Altbier und die Rosinen in Düsseldorfer Killepitsch eingelegt, eine traditionelle Veredelung mit lokaler Handschrift. Jeder Stollen wird von Hand geformt, gebacken und mit Butter und Zucker veredelt. Ganz im Sinne klassischer Stollenherstellung. Erhältlich mit oder ohne Marzipan, als Mini-Stollen oder in Form von feinem Stollen-Konfekt. Der Stollen wird ohne Aufpreis in einer hochwertigen Hinkel-Blechdose verpackt.',
    shortIngredients: 'Stollenteig mit Butter, Rosinen (in Killepitsch), Mandeln (in Altbier), Marzipan, Zitronat & Orangeat',
    fullIngredients:
      'WEIZENMEHL, Rosinen, BUTTER, MANDELN, Wasser, Zucker, Schumacher Altbier (Wasser, GERSTENRÖSTMALZ, Hopfen, Hefe), Ethylalkohol, Hefe, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), VOLLMILCHPULVER, Christstollen-Aroma, Salz, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Zitronenschale (Zitronenschale, Zucker, Dextrose), Orangenschale (Orangenschale, Zucker, Dextrose)' +
      VANILLEAROMA +
      ', Zitronenschale (Zitronenschale, Zucker, Dextrose), Orangenschale (Orangenschale, Zucker, Dextrose)',
    allergens: ['Gluten (Weizen, Gerste)', 'Milch', 'Schalenfrüchte (Mandeln)'],
    note: 'Mit oder ohne Marzipan erhältlich, kostenlos in Hinkel-Blechdose. Auch als Mini-Stollen.'
  },
  {
    name: 'Dinkel Hafer Cookies',
    aliases: ['Dinkel-Hafer-Cookies'],
    group: 'Kleingebäck',
    price: '3,80 €',
    pricePerKg: '38,00 € / kg',
    description:
      'Unsere Dinkel Hafer Cookies sind genau das Richtige für alle, die es kernig und aromatisch mögen. Aus Dinkelvollkornmehl, zarten Haferflocken, Mandeln und Butter gebacken, bringen sie eine ausgewogene Mischung aus Knusprigkeit und feiner Süße mit. Ein ehrlicher Keks mit gutem Biss und einem Hauch Vanille.',
    shortIngredients: 'Butter, Haferflocken, Zucker, Mandeln, Dinkelvollkornmehl, Ei, Vanille, Zimt',
    fullIngredients:
      'BUTTER, HAFER, Zucker, MANDELN, DINKELVOLLKORNMEHL, VOLLEI, MILCH, natürliches Bourbon-Vanillearoma, Zimt, Salz',
    allergens: ['Gluten (Dinkel, Hafer)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Dinkel-Sprösschen',
    group: 'Brot',
    price: '5,70 €',
    pricePerKg: '7,60 € / kg',
    weight: '750 g',
    description:
      'Unser Dinkel-Sprösschen ist ein besonders saftiges 100 % Dinkelvollkornbrot, gebacken mit hauseigenem Sauerteig, Dinkelsprossen, der rheinischen Ackerbohne und Sonnenblumenkernen. Die Kombination aus Dinkelmehl, Dinkelschrot, Dinkelflocken und einer langen Teigführung sorgt für eine weiche Krume und langanhaltende Frische. Vollkornbrot mit Charakter, sättigend, mild-nussig und rund im Geschmack.',
    shortIngredients: 'Dinkelvollkornmehl, Sonnenblumenkerne, Dinkel, Dinkelschrot, Dinkelflocken, Kartoffelflocken, Apfelessig, Salz, Hefe',
    fullIngredients:
      'Wasser, DINKELVOLLKORNMEHL, Sonnenblumenkerne, DINKEL, DINKELSCHROT, DINKELFLOCKEN, Kartoffelflocken (Kartoffel, Monoglyceride von Speisefettsäuren), Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), Apfelessig, Hefe',
    allergens: ['Gluten (Dinkel)'],
    flour: '100 % Dinkel',
    breadType: 'dinkel',
    vegan: true
  },
  {
    name: 'Dinkelchen',
    group: 'Brötchen',
    price: '1,10 €',
    description:
      'Unser Dinkelchen ist ein saftiges Dinkelvollkornbrötchen mit Walnüssen und kleinen Apfelstücken. Die Kombination aus nussiger Tiefe und feiner Fruchtnote macht es zu einer besonderen Abwechslung im Brötchenkorb und durch den hohen Dinkelanteil auch zur bewussten Alternative beim Frühstück.',
    shortIngredients: 'Dinkelvollkornmehl, Dinkelmehl, Walnüsse, Apfel, Rapsöl, Salz, Hefe',
    fullIngredients: 'DINKELVOLLKORNMEHL, Wasser, DINKELMEHL, WALNUSSKERNE, Apfel, Rapsöl, Salz, Hefe',
    allergens: ['Gluten (Dinkel)', 'Schalenfrüchte (Walnüsse)'],
    flour: '100 % Dinkel',
    vegan: true
  },
  {
    name: 'Dinkeltraum',
    group: 'Brot',
    price: '6,10 €',
    pricePerKg: '8,71 € / kg',
    weight: '700 g',
    description:
      'Unser Dinkeltraum ist ein geschmacksintensives 100 % Dinkelbrot mit hohem Vollkornanteil. Ganze Walnüsse und Haselnüsse sorgen für knackige Bissmomente und harmonieren wunderbar mit der milden Süße von Honig und Malz. Durch die lange Teigführung und den Verzicht auf Weizen entsteht ein saftiges, vollwertiges Brot mit kräftigem Aroma.',
    shortIngredients: 'Dinkel (hoher Vollkornanteil), Walnüsse, Haselnüsse, Honig, Malz',
    fullIngredients: 'Vollständige Zutatenliste folgt.',
    allergens: ['Gluten (Dinkel)', 'Schalenfrüchte (Walnüsse, Haselnüsse)'],
    flour: '100 % Dinkel',
    breadType: 'dinkel'
  },
  {
    name: 'Düsselhappen',
    group: 'Kleingebäck',
    price: '3,00 €',
    description:
      'Unser Düsselhappen ist ein saftiges Gebäck aus fein abgestimmter Haselnussmasse, veredelt mit hochwertiger Zartbitterschokolade. Der Überzug aus Kuvertüre sorgt für den intensiven Schokoladengeschmack, die nussige Basis für aromatische Tiefe und eine zart-weiche Textur.',
    shortIngredients: 'Haselnussmasse, Zucker, Ei, Zartbitter-Kuvertüre',
    fullIngredients:
      'Nussmasse (HASELNÜSSE, Zucker, Wasser, Invertzucker), Zucker, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), VOLLEI, Wasser',
    allergens: ['Eier', 'Soja', 'Schalenfrüchte (Haselnüsse)']
  },
  {
    name: 'Düsselwelle',
    group: 'Kuchen',
    price: '3,00 €',
    description:
      'Unsere Düsselwelle ist ein saftiger Marmorsandkuchen vom Blech, der mit eingebackenen Kirschen und feinen Quarktupfen für fruchtige Frische sorgt. Verfeinert mit Schokoladendrops und buttrigen Streuseln wird dieser Kuchen zu einem süßen Highlight, das jeden Kaffeetisch verschönert.',
    shortIngredients: 'Marmor-Rührteig, Kirschen, Schokodrops, Butterstreusel, etwas Rum',
    fullIngredients:
      'Kirschen (Kirschen, Glukosesirup, Invertzucker, Fruktose, WEIZENSTÄRKE, Ethylalkohol, Milchsäure, Holunderbeerensaftkonzentrat, natürliche Aromastoffe, SCHALENFRÜCHTE (SPUREN), Rote-Bete, EIER (SPUR), NÜSSE (SPUR), MILCH (SPUR)), WEIZENMEHL, Zucker, BUTTER, VOLLEI, WEIZENSTÄRKE, Wasser, Kuvertüre (Kakaomasse, Zucker, Kakaobutter, SOJALEZITHIN, MILCH (SPUR)), Kakaopulver, EIGELB, VOLLMILCHPULVER, Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke), Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Rum 38% vol., Salz' +
      VANILLEAROMA +
      ', Rum 38% vol., Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Soja', 'Milch'],
    allergenNote: 'Kann Spuren enthalten: Schalenfrüchte.'
  },
  {
    name: 'Elsässer',
    group: 'Brot',
    price: '5,20 €',
    pricePerKg: '10,40 € / kg',
    weight: '500 g',
    description:
      'Unser Elsässer zeichnet sich durch einen kräftigen Roggenmischteig, natürlichen Sauerteig und eine feine Auswahl an Nüssen und Kernen aus. Pistazien, Haselnüsse, Walnüsse, Kürbiskerne und Sonnenblumenkerne verleihen ihm eine aromatische Tiefe und angenehme Bissfestigkeit, herzhaft, nussig, unverwechselbar.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Kürbis- und Sonnenblumenkerne, Walnüsse, Pistazien, Haselnüsse, Sauerteig',
    fullIngredients:
      'Wasser, ROGGENMEHL, Elsässer Mischung (Kürbiskerne, Sonnenblumenkerne, WALNUSSKERNE, PISTAZIEN, HASELNÜSSE), WEIZENMEHL, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Salz, Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)', 'Schalenfrüchte (Haselnüsse, Walnüsse, Pistazien)'],
    note: 'Drei Nusssorten: Walnüsse, Pistazien, Haselnüsse.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Feinbrot',
    group: 'Brot',
    price: '5,70 €',
    pricePerKg: '5,70 € / kg',
    weight: '1000 g',
    description:
      'Unser Feinbrot ist ein mildes Roggenmischbrot mit Sauerteig, das durch seine Kastenform eine besonders weiche Krume und nur eine dezente Kruste entwickelt. Außen sanft, innen locker und saftig, ein Brot, das vor allem bei Kindern sehr beliebt ist.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Im Kasten gebacken, weiche Kruste, bei Kindern sehr beliebt.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Feuriges',
    aliases: ['Feurige', 'Feurigen'],
    group: 'Brot',
    price: '3,40 €',
    pricePerKg: '13,60 € / kg',
    weight: '250 g',
    description:
      'Unser Feuriges hat Charakter. In einem milden Weizenmischteig vereinen sich getrocknete Tomaten, Paprika, Peperoni, Knoblauch und zwei Sorten Pfeffer zu einer kräftigen Komposition mit Schärfe und Tiefe. Die grünen Pfefferkörner sorgen für den ersten Kick, Peperoni und schwarzer Pfeffer geben ordentlich nach. Wer gerne würzig isst und seinem Abendbrot oder Grillabend ein bisschen Feuer verleihen will, ist hier genau richtig.',
    shortIngredients: 'Weizen- und Roggenmehl, getrocknete Tomaten, Paprika, Peperoni, Quark, Knoblauch, grüner und schwarzer Pfeffer',
    fullIngredients:
      'Wasser, WEIZENMEHL, ROGGENMEHL, Tomaten getr (Tomaten, Salz), Paprika (Paprika, Wasser, Zucker, SELLERIE), Peperoni (Peperoni, Wasser, Branntweinessig, Salz, Zitronensäure, Calciumchlorid), MAGERQUARK, Paprika, Salz, Hefe, Knoblauch, grüner Pfeffer (Pfeffer, Wasser), Pfeffer, ROGGENSAUER',
    allergens: ['Gluten (Weizen, Roggen)', 'Milch', 'Sellerie'],
    note: 'Scharf! Verkaufstipp: zum Grillabend.',
    flour: '60 % Weizen, 40 % Roggen',
    breadType: 'weizenmisch'
  },
  {
    name: 'Florentiner',
    aliases: ['Florentiner Kekse'],
    group: 'Kleingebäck',
    price: '4,55 €',
    pricePerKg: '45,50 € / kg',
    description:
      'Unsere Florentiner sind feine Gebäcktaler aus einer goldbraun gerösteten Mandelmasse mit Honig, Zucker, Butter und Sahne. Fruchtige Belegkirschen sorgen für das gewisse Extra, während der Boden mit Zartbitterkuvertüre veredelt wird. Knusprig, aromatisch und voll im Geschmack.',
    shortIngredients: 'Mandeln, Zucker, Sahne, Honig, Zitronat & Orangeat, Butter, Zartbitter-Boden',
    fullIngredients:
      'MANDELN, Zucker, Sahne (SAHNE, Carrageen), Honig, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), BUTTER, natürliches Bourbon-Vanillearoma',
    allergens: ['Milch', 'Schalenfrüchte (Mandeln)'],
    note: 'Große Variante: Florentinertaler.'
  },
  {
    name: 'Florentinertaler',
    group: 'Kleingebäck',
    price: '3,30 €',
    description:
      'Unser Florentinertaler vereint eine goldbraun geröstete Mandelmasse mit Honig, Zucker, Sahne und Butter. Belegkirschen sorgen für fruchtige Akzente, während die feine Zartbitter-Kuvertüre den perfekten Abschluss bildet.',
    shortIngredients: 'Mandeln, Zucker, Honig, Sahne, Butter, Zitronat & Orangeat, Zartbitter-Boden',
    fullIngredients:
      'MANDELN, Zucker, Honig, Sahne (SAHNE, Carrageen), BUTTER, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure)',
    allergens: ['Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Fränzchen',
    group: 'Brötchen',
    price: '1,00 €',
    description:
      'Unser Fränzchen ist ein klassisches Baguettebrötchen mit besonders lockerer Krume und fein ausgebackener Kruste. Die lange und kühle Teigführung mit Vorteig sorgt für eine ausgeprägte Aromatik und luftige Porung. Leicht, mild und eines unserer beliebtesten Brötchen.',
    shortIngredients: 'Weizenmehl, Wasser, etwas Roggenmehl, Salz, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, ROGGENMEHL, Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Salz, Hefe',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Lange, kühle Teigführung mit Vorteig.',
    flour: 'Weizen mit etwas Roggen',
    vegan: true
  },
  {
    name: 'Französisches Landbrot',
    aliases: ['Französische Landbrot', 'Französischen Landbrots'],
    group: 'Brot',
    price: '3,80 €',
    pricePerKg: '7,60 € / kg',
    weight: '500 g',
    description:
      'Unser französisches Landbrot überzeugt mit knuspriger Kruste und besonders weicher, luftiger Krume. Perfekt für ein Frühstück mit Butter und Marmelade oder als Grundlage für aromatische Bruschetta.',
    shortIngredients: 'Weizenmehl, Wasser, Salz, Hefe',
    fullIngredients: 'WEIZENMEHL, Wasser, Salz, Hefe',
    allergens: ['Gluten (Weizen)'],
    note: 'Nur 4 Zutaten. Verkaufstipp: mit Butter und Marmelade oder als Bruschetta. Schlanke Variante: Französische Landbrotstange.',
    flour: '100 % Weizen',
    breadType: 'weizen',
    vegan: true
  },
  {
    name: 'Französische Landbrotstange',
    group: 'Brot',
    price: '3,60 €',
    pricePerKg: '8,00 € / kg',
    weight: '450 g',
    description:
      'Unsere französische Landbrotstange ist die schlanke Variante des französischen Landbrots. Außen besonders knusprig, innen zart und locker, eine feine Baguette-Stange mit intensiv gebackener Kruste und mildem Aroma.',
    shortIngredients: 'Weizenmehl, Wasser, Salz, Hefe',
    fullIngredients: 'WEIZENMEHL, Wasser, Salz, Hefe',
    allergens: ['Gluten (Weizen)'],
    note: 'Nur 4 Zutaten. Schlanke Variante des Französischen Landbrots.',
    flour: '100 % Weizen',
    breadType: 'weizen',
    vegan: true
  },
  {
    name: 'Gewürzprinten',
    group: 'Weihnachtsgebäck',
    price: '3,20 €',
    pricePerKg: '32,00 € / kg',
    description:
      'Unsere Gewürzprinten sind saftig, kräftig & natürlich würzig im Geschmack. Der Teig basiert wie bei all unseren Printen auf einem alten Familienrezept mit typischen Printengewürzen wie Zimt, Anis und Kardamom. Durch die Ruhezeit entfalten sich die Aromen besonders intensiv. 100 Gramm sind ca. 5 Stück.',
    shortIngredients: 'Zuckersirup, Weizen- und Roggenmehl, Zitronat & Orangeat, Printengewürz',
    fullIngredients:
      'Zuckersirup, WEIZENMEHL, Zucker, ROGGENMEHL, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), Wasser, Printengewürz (Koriander, Zimt, Fenchel, Anis, Piment, Leinmehl, Reisstärke, Vanillin), Anis, Salz, Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat), zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, ROGGENSAUER, WEIZENGRIEß)',
    allergens: ['Gluten (Weizen, Roggen)'],
    vegan: true
  },
  {
    name: 'Gewürzspekulatius',
    group: 'Weihnachtsgebäck',
    price: '3,80 €',
    pricePerKg: '38,00 € / kg',
    description:
      'Unser Spekulatius ist knusprig, hauchdünn und sorgfältig gebacken nach bewährter Handwerkstradition. Mit viel Fingerspitzengefühl werden die filigranen Motive geprägt und die feine Rezeptur in jeder Charge frisch zubereitet.',
    shortIngredients: 'Weizenmehl, Zucker, Butter, Milchpulver, Spekulatiusgewürz, etwas Marzipan',
    fullIngredients:
      'WEIZENMEHL, Zucker, BUTTER, Wasser, VOLLMILCHPULVER, Spekulatiusgewürz (Zimt, Nelken, Anis, Ingwer, Muskatnuss, Cardamom), Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Salz, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat)' +
      VANILLEAROMA +
      ', Hirschhornsalz ABC Trieb (Ammoniumhydrogencarbonat, Magnesiumcarbonat)',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Granola',
    group: 'Sonstiges',
    price: '5,85 €',
    pricePerKg: '19,50 € / kg',
    weight: '300 g',
    description:
      'Unser Granola ist eine ofengeröstete Mischung aus Hafer, Leinsaat, Roggenmalzflocken, Sonnenblumenkernen, Kürbiskernen, Mandeln und Haselnüssen - verfeinert mit Cranberries, Ahornsirup und einem Hauch Zimt. Knusprig, ausgewogen und vielseitig und somit ideal zum Frühstück oder als Topping. Unser Granola ist vegan.',
    shortIngredients: 'Hafer, Leinsaat, Roggenmalzflocken, Kerne, Cranberries, Ahornsirup, Mandeln, Haselnüsse, Zimt',
    fullIngredients:
      'HAFER, Leinsaat, ROGGENMALZFLOCKEN, Sonnenblumenkerne, Cranberries (Cranberries, Maismehl), Kürbiskerne, Ahornsirup, pflanzliche Fette, MANDELN, HASELNÜSSE, Zimt',
    allergens: ['Gluten (Roggen, Hafer)', 'Schalenfrüchte (Mandeln, Haselnüsse)'],
    vegan: true
  },
  {
    name: 'Große Schokoladenprinte',
    aliases: ['Große Schokoprinte'],
    group: 'Weihnachtsgebäck',
    price: '6,00 €',
    pricePerKg: '48,00 € / kg',
    weight: '125 g',
    description:
      'Unsere große Schokoladenprinte ist die majestätische Schwester unserer klassischen Printen und ein echter Blickfang in jeder weihnachtlichen Auslage. Sie wird aus unserem bewährten Printenteig gefertigt, sorgfältig gebacken und anschließend großzügig mit feiner Zartbitterschokolade überzogen. In der Mitte zieren sie ganze Mandeln, während der Rand mit gerösteten, gehackten Haselnüssen bestreut wird. Das Ergebnis ist ein wunderbar würziges, schokoladiges Gebäck mit eleganter Optik.',
    shortIngredients: 'Printenteig, Zartbitter-Überzug, ganze Mandeln, gehackte Haselnüsse',
    fullIngredients:
      'Zuckersirup, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), WEIZENMEHL, Zucker, ROGGENMEHL, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), MANDELN, HASELNÜSSE, Wasser, Printengewürz (Koriander, Zimt, Fenchel, Anis, Piment, Leinmehl, Reisstärke, Vanillin), Anis, Salz, Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat), zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, WEIZENMALZMEHL, ROGGENSAUER, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)', 'Soja', 'Schalenfrüchte (Mandeln, Haselnüsse)'],
    vegan: true
  },
  {
    name: 'Großes Schwarzwälder',
    group: 'Brot',
    price: '5,70 €',
    pricePerKg: '5,70 € / kg',
    weight: '1000 g',
    description:
      'Unser Schwarzwälder ist ein echtes Stück Hinkel-Tradition: ein rustikales Roggenmischbrot mit kräftiger Kruste, saftigem Inneren und herzhaftem Geschmack. Gebacken mit hauseigenem Sauerteig und einem Mehlanteil von 70 % Roggen und 30 % Weizen, steht dieses Brot für echtes Handwerk und ehrlichen Genuss.',
    shortIngredients: 'Roggenmehl (70 %), Weizenmehl (30 %), Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Auch als Kleines Schwarzwälder (500 g) und Sternchen (250 g).',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Großes Sonnenblumenkern-Schwarzbrot',
    group: 'Brot',
    price: '5,60 €',
    pricePerKg: '5,60 € / kg',
    weight: '1000 g',
    description:
      'Unser Schwarzbrot wird aus 100 Prozent Roggenvollkornschrot und nach einem überlieferten Rezept gebacken. Bei dieser Ausführung geben wir zusätzlich viele Sonnenblumenkerne hinzu, die für einen nussigen Geschmack und eine angenehm saftige Textur sorgen. Jeder Bissen bringt kernige Aromen und satte Energie auf den Teller. Eine tolle Alternative zum Klassiker, ebenso wie unser Kürbiskern- oder Walnussschwarzbrot.',
    shortIngredients: 'Roggenschrot, Sonnenblumenkerne, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Sonnenblumenkerne, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Großes Vollkornschwarzbrot',
    group: 'Brot',
    price: '5,40 €',
    pricePerKg: '5,40 € / kg',
    weight: '1000 g',
    description:
      'Unser Schwarzbrot wird aus 100 Prozent Roggenvollkornschrot und nach einem überlieferten Rezept gebacken. Damit ist es ein echtes Stück rheinischer Backtradition. Es wird besonders lange und schonend gebacken, wodurch es seine kräftige Farbe, die intensive Kruste und sein volles Aroma entwickelt. Wer es kerniger mag, findet in unseren Varianten mit Sonnenblumen- oder Kürbiskernen eine schöne Ergänzung.',
    shortIngredients: 'Roggenschrot, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Grünschnabel',
    group: 'Brot',
    price: '6,00 €',
    pricePerKg: '12,00 € / kg',
    weight: '500 g',
    description:
      'Unser Grünschnabel ist das perfekte Brot für den Herbst und unser Monatsbrot im Oktober und November. Der kräftige Roggenmischteig wird verfeinert mit deftigem Grünkohl, würzigen Mettenden und einem Hauch ABB Senf. So vereint sich in jeder Scheibe echte rheinische Hausmannskost mit traditionellem Bäckerhandwerk. Ideal für alle, die es herzhaft mögen oder zur Grünkohlzeit mal etwas Neues probieren möchten.',
    shortIngredients: 'Roggenmischteig mit Grünkohl, geräucherten Mettenden (Schwein), Schinkenwürfeln, Zwiebeln und ABB-Senf',
    fullIngredients:
      'ROGGENMEHL, Wasser, Grünkohl, geräucherte Mettenden (Schweinefleisch, SENFSAAT, Gewürze, Salz, Dextrose, Glukosesirup, Kaliumtartrate, Aromaextrakte, Ascorbinsäure, Natriumcarbonat, Echtes Karmin, Mononatriumglutamat, Natriumnitrit, Zitronensäure), Zwiebel, Schinkenwürfel (Schweinefleisch, Salz, Dextrose, Gewürze, Milchsäure, Kaliumsorbat, Ascorbinsäure), SENF (Wasser, Branntweinessig, SENFSAAT, Salz, Zucker, Gewürze), WEIZENMEHL, Hefe, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Salz, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)', 'Senf'],
    note: 'Monatsbrot im Oktober und November. Enthält Schweinefleisch.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch'
  },
  {
    name: 'Harzer',
    aliases: ['Harzer Brot'],
    group: 'Brot',
    price: '4,00 €',
    pricePerKg: '8,00 € / kg',
    weight: '500 g',
    description:
      'Unser Harzer Brot ist ein kräftiges Roggenmischbrot mit Sauerteig und einer feinen Portion Roggenvollkornschrot. Durch den hohen Roggenanteil erhält es eine herzhafte, würzige Note, die perfekt zu deftigem Belag passt. Die lange Teigführung sorgt für ein ausgewogenes Aroma und eine saftige, kompakte Krume.',
    shortIngredients: 'Roggenmehl, Roggenschrot, Weizenmehl, Wasser, Sauerteig, Sirup, Salz, Hefe',
    fullIngredients:
      'Wasser, ROGGENMEHL, ROGGENSCHROT, WEIZENMEHL, Salz, Hefe, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Nussige Variante: Harzer Nuss-Stange.',
    flour: '70 % Roggen, 20 % Weizen, 10 % Roggenvollkornschrot',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Harzer Nuss-Stange',
    group: 'Brot',
    price: '4,80 €',
    pricePerKg: '9,60 € / kg',
    weight: '500 g',
    description:
      'Unsere Harzer Nuss-Stange ist die nussige Variante unseres klassischen Harzer Brots, kräftig im Geschmack, saftig in der Krume und mit einem rustikalen Charakter. Die Basis bildet ein Roggenmischteig mit Sauerteig, ergänzt durch eine Portion Roggenvollkornschrot für mehr Biss und Tiefe, die dann noch großzügig mit aromatischen Walnüssen verfeinert wird.',
    shortIngredients: 'Harzer-Teig (Roggenmehl, Roggenschrot, Weizenmehl, Sauerteig) mit Walnüssen',
    fullIngredients:
      'Wasser, ROGGENMEHL, WALNUSSKERNE, ROGGENSCHROT, WEIZENMEHL, Salz, Hefe, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)', 'Schalenfrüchte (Walnüsse)'],
    flour: '70 % Roggen, 20 % Weizen, 10 % Roggenvollkornschrot',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Heidesand',
    group: 'Kleingebäck',
    price: '5,30 €',
    pricePerKg: '26,50 € / kg',
    weight: '200 g',
    description:
      'Unser Heidesand ist ein echter Klassiker unter den Plätzchen, mürbe, zart und voll im Geschmack. Der feine Mürbeteig mit Butter und Marzipan sorgt für eine besonders zarte Konsistenz, die beim ersten Biss auf der Zunge zergeht. In feinen Farinzucker gewälzt, bekommen die Plätzchen ihre typische, leicht karamellige Note.',
    shortIngredients: 'Mürbeteig aus Weizenmehl, Butter, Zucker, Marzipan und Ei, in Farinzucker gewälzt',
    fullIngredients:
      'WEIZENMEHL, BUTTER, Zucker, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), VOLLEI, Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke)',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Hinkelsteine',
    aliases: ['Hinkelstein'],
    group: 'Brötchen',
    price: '1,00 €',
    description:
      'Unser Hinkelstein ist ein kräftiges Sauerteigbrötchen mit 70 % Roggen- und 30 % Weizenmehl. Die dunkle, scharf ausgebackene Kruste und das würzige Aroma machen es zur ersten Wahl für alle, die es rustikal mögen.',
    shortIngredients: 'Roggenmehl (70 %), Weizenmehl (30 %), Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    flour: '70 % Roggen, 30 % Weizen',
    vegan: true
  },
  {
    name: 'Holzkohlebrot',
    group: 'Brot',
    price: '4,60 €',
    pricePerKg: '6,13 € / kg',
    weight: '750 g',
    description:
      'Unser Holzkohlebrot ist ein mediterranes Weizenbrot mit einer besonders aromatischen Krume. Durch die Zugabe von Olivenöl und vorgeröstetem Mehl entsteht ein mild-nussiger Geschmack und eine weiche, saftige Textur unter der kräftigen Kruste. Besonders gut geeignet zu Antipasti und mediterranen Vorspeisen.',
    shortIngredients: 'Weizenmehl, Wasser, Olivenöl, Salz, Hefe',
    fullIngredients: 'WEIZENMEHL, Wasser, Olivenöl, Salz, Hefe',
    allergens: ['Gluten (Weizen)'],
    note: 'Verkaufstipp: zu Antipasti und mediterranen Vorspeisen.',
    flour: '100 % Weizen',
    breadType: 'weizen',
    vegan: true
  },
  {
    name: 'Hüftgold',
    group: 'Kleingebäck',
    price: '3,80 €',
    pricePerKg: '38,00 € / kg',
    weight: '100 g',
    description:
      'Unser Hüftgold ist ein zartes Mandel-Spritzgebäck mit feiner Struktur und buttrigem Geschmack. Auf den beiden Plätzchen sorgt ein Klecks roter Fruchtmarmelade für fruchtige Frische und eine schöne Balance zur Süße. Abgerundet wird das Ganze mit einer feinen Schicht Puderzucker. Ein kleines Gebäck mit großem Suchtfaktor.',
    shortIngredients: 'Mandel-Spritzgebäck mit Butter, Himbeer-Johannisbeer-Konfitüre, Puderzucker',
    fullIngredients:
      'BUTTER, WEIZENMEHL, Zucker, MANDELN, Himbeer-Johannisbeer-Konfitüre (Himbeeren, Zucker, Zitronensaftkonzentrat, Pektin), Kondensmilch (MILCH, Natriumphosphate, Carrageen), VOLLEI, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), NATUERLICHES BOURBON VANILLEAROMA, Salz' +
      VANILLEAROMA +
      ', natürliches Bourbon-Vanillearoma, Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Innsbrucker Roggenlaib',
    aliases: ['Innsbrucker Roggenloab'],
    group: 'Brot',
    price: '9,50 €',
    pricePerKg: '12,67 € / kg',
    weight: '750 g',
    description:
      'Unser Innsbrucker Roggenlaib ist ein kräftiges Roggenvollkornbrot ohne Weizenanteil. Es wird mit hauseigenem Sauerteig gebacken und dezent mit gemahlenem Kümmel und Koriander gewürzt. Die dunkle, saftige Krume und die ausgewogene Würze erinnern an klassische Brote aus den Alpenregionen - herzhaft, charaktervoll und mit langer Tradition.',
    shortIngredients: 'Roggenmehl, Wasser, Salz, Sauerteig, Koriander, gemahlener Kümmel, ohne Weizen',
    fullIngredients: 'Wasser, ROGGENVOLLKORNMEHL, Salz, Koriander, Kümmel gemahlen (Kümmel, Wasser), ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    flour: '100 % Roggenvollkorn',
    breadType: 'roggen',
    vegan: true
  },
  {
    name: 'Jan-Wellem Stuten',
    aliases: ['Jan-Wellem-Stuten'],
    group: 'Stuten & Brioche',
    price: '5,20 €',
    pricePerKg: '10,40 € / kg',
    weight: '500 g',
    description:
      'Unser Jan-Wellem-Stuten ist ein saftiger Brioche-Stuten mit getrockneten Aprikosen, Rosinen und ganzen, ungeschälten Mandeln. Ein gehaltvoller Genuss mit besonderem Charakter.',
    shortIngredients: 'Brioche-Teig mit Ei und Quark, Rosinen, Aprikosen, ganze Mandeln',
    fullIngredients:
      'WEIZENMEHL, VOLLEI, Rosinen, MANDELN, Aprikosen (Aprikosen, Maismehl), Zucker, MAGERQUARK, Wasser, Hefe, Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)'],
    flour: '100 % Weizen',
    breadType: 'stuten'
  },
  {
    name: 'Kartäuser',
    group: 'Brot',
    price: '8,00 €',
    pricePerKg: '5,33 € / kg',
    weight: '1500 g',
    description:
      'Unser Kartäuser ist ein reines Roggenvollkornbrot mit Sauerteig, das durch seine kompakte Kastenform und die saftige Krume überzeugt. Es kommt ganz ohne Gewürze aus und setzt stattdessen auf den vollen Geschmack des Roggens. Ein kräftiges, puristisches Brot mit angenehmer Frische und langer Haltbarkeit.',
    shortIngredients: 'Roggenmehl, Wasser, Salz, Sauerteig',
    fullIngredients: 'Wasser, ROGGENVOLLKORNMEHL, Salz, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    note: 'Nur 4 Zutaten, ohne Gewürze, im Kasten gebacken.',
    flour: '100 % Roggenvollkorn',
    breadType: 'roggen',
    vegan: true
  },
  {
    name: 'Käsebrötchen',
    group: 'Brötchen',
    price: '1,70 €',
    description:
      'Unser Käsebrötchen ist ein mildes Weizenbrötchen, goldgelb überbacken mit geriebenem Gouda. Die saftige Krume und die fein-aromatische Käsekruste machen es zum herzhaften Klassiker für jede Gelegenheit.',
    shortIngredients: 'Weizenmehl, Wasser, Gouda, Hefe, Salz, etwas Butter',
    fullIngredients:
      'WEIZENMEHL, Wasser, Gouda (MILCH, Salz, Lab, Maisstärke), Hefe, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), BUTTER' + BACKMALZ + ', Butter',
    allergens: ['Gluten (Weizen)', 'Milch'],
    flour: '100 % Weizen'
  },
  {
    name: 'Käselaugenstange',
    group: 'Brötchen',
    price: '2,10 €',
    description:
      'Unsere Käselaugenstange verbindet milden Weizenteig, feines Laugenaroma und goldbraun gebackenen Gouda. Die herzhafte Käsekruste trifft auf die typische Laugennote und ist somit ideal für alle, die es etwas würziger mögen.',
    shortIngredients: 'Laugenteig (Weizenmehl, Butter, Brezelmalz), Gouda',
    fullIngredients:
      'WEIZENMEHL, Wasser, Gouda (MILCH, Salz, Lab, Maisstärke), Hefe, Salz, BUTTER, Brezelmalz (Palmfett, Rapsöl, Sonnenblumenöl, Erbsenextrakt, GERSTENMALZEXTRAKT, Zucker, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, Traubenzucker, HAFERVOLLKORNMEHL, GERSTENMALZMEHL, Hefe, Calciumcarbonat, WEIZENMALZMEHL, WEIZENMEHL, WEIZENSTÄRKE, Ascorbinsäure)',
    allergens: ['Gluten (Weizen, Gerste, Hafer)', 'Milch'],
    flour: '100 % Weizen'
  },
  {
    name: 'Kleines Schwarzwälder',
    aliases: ['Schwarzwälder'],
    group: 'Brot',
    price: '2,90 €',
    pricePerKg: '5,80 € / kg',
    weight: '500 g',
    description:
      'Unser Schwarzwälder ist ein echtes Stück Hinkel-Tradition: ein rustikales Roggenmischbrot mit kräftiger Kruste, saftigem Inneren und herzhaftem Geschmack. Gebacken mit hauseigenem Sauerteig und einem Mehlanteil von 70 % Roggen und 30 % Weizen, steht dieses Brot für echtes Handwerk und ehrlichen Genuss.',
    shortIngredients: 'Roggenmehl (70 %), Weizenmehl (30 %), Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Noch kleiner: das Sternchen (250 g).',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Kleines Sonnenblumenkern-Schwarzbrot',
    group: 'Brot',
    price: '3,30 €',
    pricePerKg: '6,60 € / kg',
    weight: '500 g',
    description:
      'Unser Schwarzbrot wird aus 100 Prozent Roggenvollkornschrot und nach einem überlieferten Rezept gebacken. Bei dieser Ausführung geben wir zusätzlich viele Sonnenblumenkerne hinzu, die für einen nussigen Geschmack und eine angenehm saftige Textur sorgen. Jeder Bissen bringt kernige Aromen und satte Energie auf den Teller. Eine tolle Alternative zum Klassiker, ebenso wie unser Kürbiskern- oder Walnussschwarzbrot.',
    shortIngredients: 'Roggenschrot, Sonnenblumenkerne, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Sonnenblumenkerne, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Kleines Vollkornschwarzbrot',
    group: 'Brot',
    price: '3,10 €',
    pricePerKg: '6,20 € / kg',
    weight: '500 g',
    description:
      'Unser Schwarzbrot wird aus 100 Prozent Roggenvollkornschrot und nach einem überlieferten Rezept gebacken. Damit ist es ein echtes Stück rheinischer Backtradition. Es wird besonders lange und schonend gebacken, wodurch es seine kräftige Farbe, die intensive Kruste und sein volles Aroma entwickelt. Wer es kerniger mag, findet in unseren Varianten mit Sonnenblumen- oder Kürbiskernen eine schöne Ergänzung.',
    shortIngredients: 'Roggenschrot, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Knäckebrot',
    group: 'Sonstiges',
    price: '4,40 €',
    pricePerKg: '22,00 € / kg',
    weight: '200 g',
    description:
      'Unser Knäckebrot kommt ganz ohne Zusätze aus und besteht aus genau den Zutaten, die reingehören, nicht mehr und nicht weniger. Roggenmehl, Saaten, Kerne und ein Schuss Olivenöl sorgen für einen herzhaften Geschmack und einen angenehmen Biss. Dünn ausgebacken, knusprig und aromatisch, ein ehrliches Knäckebrot, wie man es sich wünscht.',
    shortIngredients: 'Roggenmehl, Leinsaat, Kürbis- und Sonnenblumenkerne, Sesam, Olivenöl, Salz',
    fullIngredients: 'Wasser, ROGGENMEHL, Leinsaat, Kürbiskerne, Sonnenblumenkerne, Olivenöl, SESAMSAAT, Salz',
    allergens: ['Gluten (Roggen)', 'Sesam'],
    flour: '100 % Roggen',
    vegan: true
  },
  {
    name: 'Kokosmakronen',
    group: 'Kleingebäck',
    price: '3,80 €',
    pricePerKg: '38,00 € / kg',
    weight: '100 g',
    description:
      'Unsere Kokosmakronen bestehen aus feinen, getrockneten Kokosflocken und werden außen goldbraun gebacken, während sie innen herrlich saftig bleiben. Ein süßer Klassiker, der mit seinem intensiven Kokosgeschmack einfach immer passt.',
    shortIngredients: 'Kokosflocken, Zucker, Eiweiß, etwas Cremepulver',
    fullIngredients:
      'Zucker, Kokosnuss, Wasser, Eiweißpulver (Zucker, HÜHNEREIWEIßPULVER, Natrium-Carboxymethylcellulose, Johannisbrotkernmehl, Monokaliumphosphat, Salz), Cremepulver (Zucker, modifizierte Stärke, VOLLMILCHPULVER, MAGERMILCHPULVER, Dextrose, Natriumalginat, Diphosphate, Monoglyceride von Speisefettsäuren, MILCHEIWEIß, Karottenkonzentrat)',
    allergens: ['Eier', 'Milch'],
    allergenNote: 'Kann Spuren enthalten: Gluten.'
  },
  {
    name: 'Krapfen',
    group: 'Feingebäck',
    price: '2,50 €',
    description:
      'Unser Krapfen ist ein echtes Stück Handwerkskunst aus lockerem Brandteig mit Rosinen. In heißem Fett goldbraun ausgebacken und anschließend in Zucker gewälzt, entsteht ein süßes Gebäck mit feiner Kruste und besonders luftigem Inneren. Die Rosinen bringen eine fruchtige Note, die perfekt mit der leichten Süße harmoniert.',
    shortIngredients: 'Brandteig mit Rosinen und Ei, ausgebacken, in Zimt-Zucker gewälzt',
    fullIngredients:
      'Wasser, Brandmasse (WEIZENMEHL, WEIZENSTÄRKE, VOLLEIPULVER, Palmfett, Diphosphate, Natriumcarbonat, Salz, Monoglyceride von Speisefettsäuren, Diglyceride von Speisefettsäuren, Natrium-Carboxymethylcellulose), Zucker, Rosinen (Rosinen, Sonnenblumenöl), Pflanzenfett (Sonnenblumenöl, Kokosnussöl, Zitronensäure), VOLLEI, Zimt',
    allergens: ['Gluten (Weizen)', 'Eier'],
    note: 'Aus Brandteig (nicht Hefeteig wie ein Berliner).'
  },
  {
    name: 'Krautling',
    group: 'Brötchen',
    price: '1,30 €',
    description:
      'Unser Krautling ist ein herzhaftes Brötchen mit feinem Sauerkraut im Teig, knusprigen Röstzwiebeln und einer Prise Kümmel. Außen goldbraun gebacken, innen locker und aromatisch, ein Brötchen mit einzigartigem Charakter.',
    shortIngredients: 'Weizenmehl, Sauerkraut, Röstzwiebeln, Roggenmehl, Kümmel, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, Sauerkraut (Weißkohl, Salz), Röstzwiebel (Zwiebel, Palmöl, WEIZENMEHL, Salz), ROGGENMEHL, Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Salz, Kümmel, Hefe, Pfeffer',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Besonderheit: Sauerkraut im Teig.',
    flour: 'Weizen mit etwas Roggen',
    vegan: true
  },
  {
    name: 'Kümmeling',
    group: 'Brötchen',
    price: '1,10 €',
    description:
      'Unser Kümmeling ist ein locker gebackenes Brötchen aus mildem Baguette-Teig mit knuspriger Kruste und luftiger Krume. Großzügig mit aromatischem Kümmel und ein wenig grobem Salz bestreut, bringt es Würze und Charakter in jedes Frühstück und ist damit ein Muss für echte Kümmelfans.',
    shortIngredients: 'Baguette-Teig (Weizenmehl, Wasser, Hefe, Salz), Kümmel, grobes Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, Kümmel, Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Jodsalz, Salz, Hefe',
    allergens: ['Gluten (Weizen)'],
    flour: '100 % Weizen',
    vegan: true
  },
  {
    name: 'Kümmelstange',
    group: 'Brot',
    price: '3,70 €',
    pricePerKg: '7,40 € / kg',
    weight: '500 g',
    description:
      'Unsere Kümmelstange ist ein kräftiges Stangenbrot auf Roggenmischbasis mit Sauerteig. Der großzügige Anteil an ganzem Kümmel sorgt für ein intensives, würziges Aroma und macht sie besonders beliebt bei Liebhabern herzhafter Brote.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, ganzer Kümmel, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Kümmel, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)'],
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Kürbiskern-Käselaugenstange',
    group: 'Brötchen',
    price: '2,20 €',
    description:
      'Unsere Kürbiskern-Käselaugenstange ist eine herzhafte Käselaugenstange, die zusätzlich mit vielen knackigen Kürbiskernen getoppt wird. Das verleiht ihr nicht nur noch mehr Biss, sondern auch ein nussiges Aroma, das wunderbar mit der käsigen Kruste harmoniert. Unsere Kürbiskerne beziehen wir ausschließlich aus der Steiermark.',
    shortIngredients: 'Laugenteig, Gouda, Kürbiskerne aus der Steiermark',
    fullIngredients:
      'WEIZENMEHL, Wasser, Gouda (MILCH, Salz, Lab, Maisstärke), Hefe, Salz, BUTTER, Brezelmalz (Palmfett, Rapsöl, Sonnenblumenöl, Erbsenextrakt, GERSTENMALZEXTRAKT, Zucker, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, Traubenzucker, HAFERVOLLKORNMEHL, GERSTENMALZMEHL, Hefe, Calciumcarbonat, WEIZENMALZMEHL, WEIZENMEHL, WEIZENSTÄRKE, Ascorbinsäure)',
    allergens: ['Gluten (Weizen, Gerste, Hafer)', 'Milch'],
    note: 'Kürbiskerne ausschließlich aus der Steiermark.',
    flour: '100 % Weizen'
  },
  {
    name: 'Kürbiskern-Schwarzbrot',
    group: 'Brot',
    price: '5,80 €',
    pricePerKg: '7,73 € / kg',
    weight: '750 g',
    description:
      'Unser Kürbiskernschwarzbrot verbindet die kräftige Tiefe von Roggenvollkornschrot mit dem feinen Aroma gerösteter Kürbiskerne. Das macht es nicht nur geschmacklich besonders, sondern auch optisch. Gebacken nach unserem alten Hausrezept, ist es ideal für alle, die dem Schwarzbrotklassiker eine nussige Note verleihen möchten. Unsere Kürbiskerne beziehen wir ausschließlich aus der Steiermark.',
    shortIngredients: 'Roggenschrot, Kürbiskerne, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Kürbiskerne, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, Hefe, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    note: 'Kürbiskerne ausschließlich aus der Steiermark.',
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Kürbiskernbrötchen',
    group: 'Brötchen',
    price: '1,30 €',
    description:
      'Unser Kürbiskernbrötchen ist ein locker-saftiges Weizenbrötchen mit mildem Roggenanteil und vielen knackigen Kürbiskernen, außen wie innen. Die Kerne liefern nicht nur einen angenehmen Biss und nussiges Aroma, sondern sind auch reich an wertvollen Nährstoffen wie Magnesium, Eisen und ungesättigten Fettsäuren. Unsere Kürbiskerne beziehen wir ausschließlich aus der Steiermark.',
    shortIngredients: 'Weizenmehl, Kürbiskerne, Roggenmehl, Wasser, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Kürbiskerne, Wasser, ROGGENMEHL, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)' + BACKMALZ + ', Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Kürbiskerne ausschließlich aus der Steiermark.',
    flour: 'Weizen mit etwas Roggen',
    vegan: true
  },
  {
    name: 'Landbaguette',
    group: 'Brot',
    price: '3,30 €',
    pricePerKg: '13,20 € / kg',
    weight: '250 g',
    description:
      'Unser Landbaguette ist ein traditionell französisches Weizenbaguette mit besonders aromatischer Note und einer wunderbar krossen Kruste. Die rustikale Krume entsteht durch die lange Teigführung mit einem hauseigenen Levain, einem natürlichen Weizensauerteig, der ganz ohne zugesetzte Hefe auskommt. Unser Levain ist über 5 Jahre alt und wird täglich von Hand gepflegt, wodurch er dem Brot Tiefe, Herzhaftigkeit und eine unverwechselbare Struktur verleiht. Besonders lecker schmeckt das Landbaguette ganz pur mit etwas Kräuterbutter, Antipasti oder Käse.',
    shortIngredients: 'Weizenmehl, Wasser, Salz, Levain (Weizensauerteig)',
    fullIngredients: 'WEIZENMEHL, Wasser, Hefe, Salz',
    allergens: ['Gluten (Weizen)'],
    note: 'Hauseigener Levain, über 5 Jahre alt. Verkaufstipp: mit Kräuterbutter, Antipasti oder Käse.',
    flour: '100 % Weizen',
    breadType: 'weizen',
    vegan: true
  },
  {
    name: 'Laugenbrezel',
    aliases: ['Brezel'],
    group: 'Brötchen',
    price: '1,50 €',
    description:
      'Unsere Brezel wird in traditioneller Handarbeit gefertigt. Mit feiner Kruste, weicher Krume und dem typischen, milden Laugenaroma ist sie ein echter Klassiker aus der Backstube.',
    shortIngredients: 'Weizenmehl, Wasser, Hefe, Salz, Butter, Brezelmalz, Brezelsalz',
    fullIngredients:
      'WEIZENMEHL, Wasser, Hefe, Jodsalz, Salz, BUTTER, Brezelmalz (Palmfett, Rapsöl, Sonnenblumenöl, Erbsenextrakt, GERSTENMALZEXTRAKT, Zucker, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, Traubenzucker, HAFERVOLLKORNMEHL, GERSTENMALZMEHL, Hefe, Calciumcarbonat, WEIZENMALZMEHL, WEIZENMEHL, WEIZENSTÄRKE, Ascorbinsäure)',
    allergens: ['Gluten (Weizen, Gerste, Hafer)', 'Milch'],
    flour: '100 % Weizen'
  },
  {
    name: 'Laugenstange',
    group: 'Brötchen',
    price: '1,35 €',
    description:
      'Unsere Laugenstange wird aus mildem Weizenteig hergestellt und erhält durch das Laugenbad ihre typische Farbe und das feine Aroma. Mit etwas Brezelsalz bestreut und goldbraun gebacken, ein herzhafter Klassiker, der einfach immer passt.',
    shortIngredients: 'Weizenmehl, Wasser, Hefe, Salz, Butter, Brezelmalz, Brezelsalz',
    fullIngredients:
      'WEIZENMEHL, Wasser, Hefe, Jodsalz, Salz, BUTTER, Brezelmalz (Palmfett, Rapsöl, Sonnenblumenöl, Erbsenextrakt, GERSTENMALZEXTRAKT, Zucker, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, Traubenzucker, HAFERVOLLKORNMEHL, GERSTENMALZMEHL, Hefe, Calciumcarbonat, WEIZENMALZMEHL, WEIZENMEHL, WEIZENSTÄRKE, Ascorbinsäure)',
    allergens: ['Gluten (Weizen, Gerste, Hafer)', 'Milch'],
    flour: '100 % Weizen'
  },
  {
    name: 'Mambolito',
    group: 'Herzhafte Snacks',
    price: '1,80 €',
    description:
      'Unser Mambolito ist ein würzig-pikanter Snack aus Weizenteig, verfeinert mit getrockneten Tomaten, Zwiebeln, Mais, Markerbsen und Paprika. Abgeschmeckt mit Chili, Knoblauch und mediterranen Kräutern, bringt er eine feine Schärfe mit, gefüllt mit Feta und überbacken mit Gouda.',
    shortIngredients: 'Weizenteig mit getrockneten Tomaten, Röstzwiebeln, Mais, Erbsen, Paprika, Feta, Gouda, Chili',
    fullIngredients:
      'WEIZENMEHL, Wasser, Tomaten getr (Tomaten, Salz), Röstzwiebel (Zwiebel, Palmöl, WEIZENMEHL, Salz), ROGGENMEHL, Mexikomix (Mais, Erbsen, Wasser, Paprika, Salz), Feta (MILCH, Salz, Buttereikulturen), Gouda (MILCH, Salz, Lab, Maisstärke), Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Hefe, Salz, Oregano, Basilikum, Olivenöl, Paprika, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), Chili, Knoblauch' +
      BACKMALZ +
      ', Hefe, Salz, Oregano, Basilikum, Olivenöl, Paprika, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), Chili, Knoblauch',
    allergens: ['Gluten (Weizen, Roggen)', 'Milch'],
    note: 'Leicht scharf (Chili).'
  },
  {
    name: 'Mandelhörnchen',
    group: 'Kleingebäck',
    price: '2,90 €',
    description:
      'Unser Mandelhörnchen ist ein echter Klassiker für alle Marzipanliebhaber. Die Basis bildet eine saftige Marzipanmasse, die außen von feinen gehobelten Mandeln umhüllt wird. An den Enden sorgt dunkle Kuvertüre für den vollendeten Genuss. Aromatisch, zart und einfach unwiderstehlich.',
    shortIngredients: 'Marzipanmasse, gehobelte Mandeln, Enden in dunkler Kuvertüre, etwas Rum',
    fullIngredients:
      'Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Zucker, MANDELN, Wasser, Eiweißpulver (Zucker, HÜHNEREIWEIßPULVER, Natrium-Carboxymethylcellulose, Johannisbrotkernmehl, Monokaliumphosphat, Salz), Rum 38% vol.',
    allergens: ['Eier', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Mandelsplitter Vollmilch',
    group: 'Weihnachtsgebäck',
    price: '4,65 €',
    pricePerKg: '46,50 € / kg',
    description:
      'Unsere Vollmilch-Mandelsplitter sind ein feines Konfekt aus knackig gerösteten Mandeln, die von zart schmelzender Vollmilchschokolade umhüllt werden. Der Mix aus süßer Cremigkeit und nussigem Crunch macht sie zu einem kleinen Hochgenuss für zwischendurch. Auch als Ausführung mit Zartbitterschokolade erhältlich.',
    shortIngredients: 'Geröstete Mandeln in Vollmilch-Kuvertüre',
    fullIngredients:
      'MANDELN, Kuvertüre (Zucker, Kakaobutter, VOLLMILCHPULVER, Kakaomasse, SOJALEZITHIN, natürliches Aroma Vanille), Zucker',
    allergens: ['Soja', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Mandelsplitter Zartbitter',
    group: 'Weihnachtsgebäck',
    price: '4,65 €',
    pricePerKg: '46,50 € / kg',
    description:
      'Unsere Zartbitter-Mandelsplitter sind ein feines Konfekt aus knackig gerösteten Mandeln, die von zart schmelzender Zartbitterschokolade umhüllt werden. Der Mix aus süßer Cremigkeit und nussigem Crunch macht sie zu einem kleinen Hochgenuss für zwischendurch. Auch als Ausführung mit Vollmilch-Schokolade erhältlich.',
    shortIngredients: 'Geröstete Mandeln in Zartbitter-Kuvertüre',
    fullIngredients:
      'MANDELN, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), Zucker',
    allergens: ['Soja', 'Schalenfrüchte (Mandeln)'],
    vegan: true
  },
  {
    name: 'Mandelstuten',
    group: 'Stuten & Brioche',
    price: '4,50 €',
    pricePerKg: '9,00 € / kg',
    weight: '500 g',
    description:
      'Unser Mandelstuten ist mit gestifteten, leicht gerösteten Mandeln verfeinert und bringt so ein zartes Nussaroma in jeden Bissen. Saftig, mild und herrlich duftend.',
    shortIngredients: 'Weizenmehl, Mandeln, Zucker, Butter, Milchpulver, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, MANDELN, Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' + BACKMALZ + ', Salz',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)'],
    flour: '100 % Weizen',
    breadType: 'stuten'
  },
  {
    name: 'Marzipan-Croissant',
    aliases: ['Marzipancroissant'],
    group: 'Feingebäck',
    price: '2,90 €',
    description:
      'Unser Marzipan-Croissant wird aus buttrigem Croissantteig gefertigt, liebevoll mit Marzipan gefüllt und mit gehobelten Mandeln sowie Puderzucker veredelt. Die Kombination aus saftigem Inneren und knuspriger Kruste bringt französischen Genuss mit einer nussigen Note.',
    shortIngredients: 'Croissant-Teig mit Butter, Marzipanfüllung, gehobelte Mandeln, Puderzucker',
    fullIngredients:
      'WEIZENMEHL, MANDELN, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), BUTTER, Wasser, Zucker, VOLLEI, VOLLMILCHPULVER, Hefe, Salz, Plunderbackmittel (WEIZENKLEBER, WEIZENMEHL, Monoglyceride von Speisefettsäuren, Diglyceride von Speisefettsäuren, Essigsäureester von Mono - und Diglyceriden von Speisefettsäuren, Calciumphosphate, Ascorbinsäure)',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Mehrkornbrot',
    group: 'Brot',
    price: '6,20 €',
    pricePerKg: '6,20 € / kg',
    weight: '1000 g',
    description:
      'Unser Mehrkornbrot ist ein kräftiges Roggenmischbrot mit Sauerteig, das im Kasten gebacken wird und mit einer großzügigen Mischung aus Getreideflocken und Körnern veredelt ist. Die Kombination aus Leinsaat, Sesam, Sonnenblumenkernen, Kürbiskernen und Roggenflocken sorgt für ein herzhaftes Aroma und angenehmen Biss.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Leinsaat, Sesam, Sonnenblumen- und Kürbiskerne, Roggenflocken, Hafer, Sauerteig',
    fullIngredients:
      'Wasser, ROGGENMEHL, Mehrkorn Mischung (Leinsaat, SESAMSAAT, Sonnenblumenkerne, Kürbiskerne, ROGGENFLOCKEN), WEIZENMEHL, HAFER, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Salz, Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen, Hafer)', 'Sesam'],
    note: 'Im Kasten gebacken.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Mehrkornbrötchen',
    group: 'Brötchen',
    price: '1,10 €',
    description:
      'Unser Mehrkornbrötchen ist ein kerniges, rustikales Brötchen mit kräftiger Kruste und aromatischer Krume. Leinsaat, Sesam, Sonnenblumen- und Kürbiskerne sowie Roggenflocken verleihen ihm seinen typischen Biss und eine nussige Tiefe.',
    shortIngredients: 'Weizenmehl, Leinsaat, Sesam, Sonnenblumen- und Kürbiskerne, Roggenflocken, Roggenmehl, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, Mehrkorn Mischung (Leinsaat, SESAMSAAT, Sonnenblumenkerne, Kürbiskerne, ROGGENFLOCKEN), ROGGENMEHL, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)' +
      BACKMALZ +
      ', Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)',
    allergens: ['Gluten (Weizen, Roggen)', 'Sesam'],
    flour: 'Weizen mit etwas Roggen',
    vegan: true
  },
  {
    name: 'Mini-Stollen',
    aliases: ['Ministollen'],
    group: 'Weihnachtsgebäck',
    price: '7,50 €',
    pricePerKg: '30,00 € / kg',
    weight: '250 g',
    description:
      'Unser Mini-Stollen ist der kleine Bruder unseres Christstollens: gleiches überliefertes Familienrezept, gleiche Sorgfalt, nur im handlichen Format. Wie der große Stollen wird er von Hand gefertigt und mit viel Zeit hergestellt. Der Teig ruht vor dem Backen lange, damit sich Aromen und Struktur gut entwickeln. Nach dem Backen reift auch jeder Mini-Stollen über viele Tage, bis er seinen vollen Geschmack hat. Dafür braucht es Erfahrung, Geduld und Sorgfalt, ganz gleich, wie groß der Stollen ist. Wir verwenden ausschließlich hochwertige Zutaten wie gute Butter, geröstete Mandeln und aromatische Sultaninen. Für den rheinischen Akzent legen wir die Mandeln in Altbier und die Rosinen in Düsseldorfer Killepitsch ein. Das ist eine traditionelle Veredelung mit lokaler Handschrift. Jeder Mini-Stollen wird von Hand geformt, gebacken und mit Butter und Zucker veredelt, ganz im Sinne klassischer Stollenherstellung. Er wird ohne Marzipan gebacken und eignet sich für kleinere Haushalte, zum Probieren, als Mitbringsel oder als Geschenk.',
    shortIngredients: 'Stollenteig mit Butter, Rosinen (in Killepitsch), Mandeln (in Altbier), Zitronat & Orangeat',
    fullIngredients:
      'WEIZENMEHL, Rosinen, BUTTER, MANDELN, Wasser, Zucker, Schumacher Altbier (Wasser, GERSTENRÖSTMALZ, Hopfen, Hefe), Ethylalkohol, Hefe, VOLLMILCHPULVER, Christstollen-Aroma, Salz, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Zitronenschale (Zitronenschale, Zucker, Dextrose), Orangenschale (Orangenschale, Zucker, Dextrose)' +
      VANILLEAROMA +
      ', Zitronenschale (Zitronenschale, Zucker, Dextrose), Orangenschale (Orangenschale, Zucker, Dextrose)',
    allergens: ['Gluten (Weizen, Gerste)', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Mohnbrötchen',
    group: 'Brötchen',
    price: '0,70 €',
    description:
      'Unser Mohnbrötchen ist ein mild-aromatisches Spitzbrötchen, von Hand gefertigt und mit Blaumohn bestreut. Die zartsplittrige Kruste und der nussige Mohn machen es zum Klassiker auf jedem Frühstückstisch.',
    shortIngredients: 'Weizenmehl, Wasser, Mohn, Hefe, Salz, etwas Butter',
    fullIngredients: 'WEIZENMEHL, Wasser, Mohn, Hefe, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), BUTTER' + BACKMALZ + ', Butter',
    allergens: ['Gluten (Weizen)', 'Milch'],
    flour: '100 % Weizen'
  },
  {
    name: 'Mohnschnecke',
    group: 'Feingebäck',
    price: '2,90 €',
    description:
      'Unsere Mohnschnecke vereint handwerkliche Tradition mit feinsten Zutaten. Die Mohnfüllung wird aus frisch gemahlenem Blaumohn gekocht, der für ein besonders intensives Aroma direkt in unserer Backstube verarbeitet wird. Der Plunderteig wird mit reiner Butter zubereitet und sorgt für eine zarte, blättrige Textur. Obenauf runden buttrige Streusel das Gebäck ab, zum Schluss wird es aprikotiert und mit Fondant überzogen.',
    shortIngredients: 'Butter-Plunderteig, gekochte Mohnfüllung, Streusel, aprikotiert',
    fullIngredients:
      'WEIZENMEHL, Wasser, MILCH, Zucker, Mohn, Fondant (Zucker, Glukosesirup), BUTTER, Süße Brösel (WEIZENMEHL, Zucker, MILCH, Wasser, MANDELN, Kakaomasse, HÜHNEREIWEIßPULVER, Kakaobutter, Salz, SOJALEZITHIN, natürliches Aroma Vanille, Invertzucker, Rum 38% vol.), VOLLMILCHPULVER, Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), VOLLEI, Hefe, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme)' +
      BACKMALZ,
    allergens: ['Gluten (Weizen)', 'Eier', 'Soja', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Mohnstreusel',
    group: 'Kuchen',
    price: '2,80 €',
    description:
      'Unser Mohnstreusel ist ein echter Genuss für alle Mohnliebhaber. Auf lockerem Hefeteig liegt eine gekochte Mohnmasse aus frisch gemahlenem Mohn, die besonders aromatisch und saftig ist. Obendrauf kommen knusprige Butterstreusel und ein feiner Fondant auf der Aprikotur, der dem Ganzen den perfekten Abschluss verleiht.',
    shortIngredients: 'Hefeteig, gekochte Mohnmasse, Butterstreusel, Guss',
    fullIngredients:
      'Wasser, WEIZENMEHL, Zucker, Mohn, BUTTER, Süße Brösel (WEIZENMEHL, Zucker, MILCH, Wasser, MANDELN, Kakaomasse, HÜHNEREIWEIßPULVER, Kakaobutter, Salz, SOJALEZITHIN, natürliches Aroma Vanille, Invertzucker, Rum 38% vol.), Fondant (Zucker, Glukosesirup), VOLLMILCHPULVER, Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), Hefe, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' +
      BACKMALZ +
      ', Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Soja', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Monte Christo',
    group: 'Feingebäck',
    price: '2,50 €',
    description:
      'Unser Monte Christo ist der Inbegriff von saftigem, süßem Hefegebäck. Der Teig wird mit besonders viel Ei und Butter angesetzt, was ihm seine weiche, fast schon puddingartige Krume verleiht. Rosinen und Hagelzucker sorgen für Süße und Struktur. Von Hand abgewogen und geformt ist er nicht nur optisch ein Hingucker, sondern vor allem purer Genuss für alle, die es richtig schön klebrig mögen.',
    shortIngredients: 'Hefeteig mit viel Ei und Butter, Rosinen, Hagelzucker',
    fullIngredients:
      'WEIZENMEHL, Zucker, Wasser, Rosinen, VOLLEI, BUTTER, Hefe, VOLLMILCHPULVER, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' + BACKMALZ + ', Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Münsterländer',
    group: 'Brot',
    price: '9,50 €',
    pricePerKg: '4,75 € / kg',
    weight: '2000 g',
    description:
      'Unser Münsterländer ist ein mildes Weizenmischbrot mit einem kleinen Anteil Roggenmehl und einer besonders saftigen Krume. Die Zugabe von Quark macht es nicht nur angenehm frisch im Geschmack, sondern sorgt auch für eine zarte, feinporige Textur. Ein echter Klassiker für alle, die es weich und dennoch aromatisch mögen.',
    shortIngredients: 'Weizenmehl, Roggenmehl, Wasser, Magerquark, Sauerteig, Hefe, Salz',
    fullIngredients: 'Wasser, WEIZENMEHL, ROGGENMEHL, MAGERQUARK, Hefe, Salz, ROGGENSAUER',
    allergens: ['Gluten (Weizen, Roggen)', 'Milch'],
    note: '2-kg-Laib. Besondere Zutat: Quark im Teig.',
    flour: '60 % Weizen, 40 % Roggen',
    breadType: 'weizenmisch'
  },
  {
    name: 'Mürbchen',
    group: 'Feingebäck',
    price: '1,05 €',
    description:
      'Unser Mürbchen ist herrlich weich, fein süß und besonders saftig. Ein Hauch Marzipan im Teig sorgt für eine dezente Note, die es wunderbar abrundet. Ein kleines Stück Kindheit mit jedem Bissen.',
    shortIngredients: 'Weizenmehl, Butter, Zucker, Milchpulver, etwas Marzipan, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' +
      BACKMALZ +
      ', Salz',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Mürbestuten',
    group: 'Stuten & Brioche',
    price: '3,70 €',
    pricePerKg: '7,40 € / kg',
    weight: '500 g',
    description:
      'Unser Mürbestuten ist ein klassischer, leicht gesüßter Weizenstuten mit zarter Krume und feinem Geschmack. Ob pur oder mit Marmelade, er passt zu jedem Frühstückstisch.',
    shortIngredients: 'Weizenmehl, Wasser, Zucker, Butter, Milchpulver, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' + BACKMALZ + ', Salz',
    allergens: ['Gluten (Weizen)', 'Milch'],
    flour: '100 % Weizen',
    breadType: 'stuten'
  },
  {
    name: 'Müslibrot',
    group: 'Brot',
    price: '6,40 €',
    pricePerKg: '8,53 € / kg',
    weight: '750 g',
    description:
      'Unser Müslibrot ist vollgepackt mit getrockneten Pflaumen, sonnengereiften Aprikosen, knackigen Haselnüssen und zarten Haferflocken. Der kräftige Roggenmischteig bildet die herzhafte Basis für diese fruchtig-nussige Mischung. Die Süße der Früchte harmoniert wunderbar mit der rustikalen Kruste und sorgt dafür, dass das Brot lange saftig bleibt.',
    shortIngredients: 'Roggenmischteig mit Körnern, Aprikosen, Rosinen, Pflaumen, Haselnüssen und Hafer',
    fullIngredients:
      'Wasser, Mehrkorn Mischung (Leinsaat, SESAMSAAT, Sonnenblumenkerne, Kürbiskerne, ROGGENFLOCKEN), ROGGENMEHL, Aprikosen (Aprikosen, Maismehl), Rosinen, ganze Haselnüsse (HASELNÜSSE, Maismehl), Pflaumen (Pflaumen, Maismehl), HAFER, WEIZENMEHL, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Salz, Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen, Hafer)', 'Schalenfrüchte (Haselnüsse)', 'Sesam'],
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Muzenmandeln',
    aliases: ['Rheinische Muzenmandeln'],
    group: 'Kleingebäck',
    price: '4,00 €',
    pricePerKg: '40,00 € / kg',
    description:
      'Unsere Muzenmandeln sind ein traditionelles Fettgebäck mit feinem Mandelaroma und zarter Rum-Note. Der Teig wird in kleinen Stücken goldbraun ausgebacken, wodurch sie außen knusprig und innen angenehm weich bleiben. Nach dem Backen werden sie in Zucker gewendet und erhalten so ihren charakteristischen süßen Mantel. 100 Gramm sind ca. 12 Stück.',
    shortIngredients: 'Teig aus Weizenmehl, Zucker, Ei, Butter, Mandeln, etwas Rum, ausgebacken, in Zucker gewendet',
    fullIngredients:
      'WEIZENMEHL, Zucker, VOLLEI, BUTTER, MANDELN, Riskin (Sonnenblumenöl, Kokosnussöl, Zitronensäure), Rum 38 % vol., Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke), Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Nuss-Kuss',
    group: 'Kleingebäck',
    price: '2,50 €',
    description:
      'Unser Nuss-Kuss ist ein feines Gebäck aus saftiger Nussmasse, liebevoll garniert mit ganzen Haselnüssen. Eine Schicht dunkler Kuvertüre sorgt für das perfekte Finish und macht jeden Bissen zu einem kleinen Hochgenuss.',
    shortIngredients: 'Nussmasse (Zucker, Haselnüsse, Weizenmehl), dunkle Kuvertüre',
    fullIngredients:
      'Nussmasse (Zucker, HASELNÜSSE, WEIZENMEHL, Maismehl, Diphosphate, Natriumcarbonat, Salz, Zimt, Kakaopulver, Aromaextrakte), Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), Wasser',
    allergens: ['Gluten (Weizen)', 'Eier', 'Soja', 'Milch', 'Schalenfrüchte (Haselnüsse)']
  },
  {
    name: 'Nussecke',
    group: 'Kleingebäck',
    price: '3,40 €',
    description:
      'Unsere Nussecke vereint einen knusprigen Mürbeteig mit einer saftigen Schicht aus aromatischen Haselnüssen, verfeinert mit Honig, Sahne, Zimt und feinem Bourbon-Vanillearoma. Ummantelt von zartschmelzender Kuvertüre entsteht eine perfekt ausbalancierte Nussecke mit goldbrauner Röstnote und intensiver Schokoladentiefe.',
    shortIngredients: 'Mürbeteig, Haselnüsse, Honig, Sahne, Zimt, Kuvertüre',
    fullIngredients:
      'WEIZENMEHL, Zucker, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), HASELNÜSSE, BUTTER, Honig, Sahne (SAHNE, Carrageen), VOLLEI, Wasser, Zimt, Hirschhornsalz ABC Trieb (Ammoniumhydrogencarbonat, Magnesiumcarbonat), Salz, natürliches Bourbon-Vanillearoma',
    allergens: ['Gluten (Weizen)', 'Eier', 'Soja', 'Milch', 'Schalenfrüchte (Haselnüsse)']
  },
  {
    name: 'Nussknacker',
    group: 'Kleingebäck',
    price: '3,30 €',
    description:
      'Unser Nussknacker ist ein kraftvoller Genuss für Liebhaber gerösteter Haselnüsse. Auf einem Bett aus feiner Zartbitter-Kuvertüre liegt eine karamellisierte Schicht aus Honig, Zucker, Butter und Sahne.',
    shortIngredients: 'Haselnüsse in Honig-Karamell auf Zartbitter-Kuvertüre',
    fullIngredients:
      'HASELNÜSSE, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), Zucker, Honig, Sahne (SAHNE, Carrageen), Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), BUTTER',
    allergens: ['Soja', 'Milch', 'Schalenfrüchte (Haselnüsse)']
  },
  {
    name: 'Nussschleife',
    group: 'Feingebäck',
    price: '2,90 €',
    description:
      'Unsere Nussschleife ist ein buttriges Plunderteilchen, das mit einer kräftigen Portion saftiger Nussfüllung gewickelt wird. Fein gemahlene Haselnüsse, sanft gewürzt und mit Zucker abgeschmeckt, geben der Schleife ihr intensives Aroma. Das Aprikotieren rundet das Gebäck ab und bringt eine angenehme Süße ins Spiel. Außen knusprig, innen nussig.',
    shortIngredients: 'Plunderteig, Haselnuss-Füllung, Marzipan, aprikotiert',
    fullIngredients:
      'WEIZENMEHL, Wasser, MILCH, Nussmasse (Zucker, HASELNÜSSE, WEIZENMEHL, Maismehl, Diphosphate, Natriumcarbonat, Salz, Zimt, Kakaopulver, Aromaextrakte), HASELNÜSSE, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Fondant (Zucker, Glukosesirup), Zucker, VOLLEI, Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), BUTTER, Hefe, VOLLMILCHPULVER, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme)' +
      BACKMALZ,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln, Haselnüsse)']
  },
  {
    name: 'Oberländer',
    group: 'Brot',
    price: '5,70 €',
    pricePerKg: '5,70 € / kg',
    weight: '1000 g',
    description:
      'Unser Oberländer ist ein Roggenmischbrot mit Sauerteig und besonders milder Kruste. Die glatte Oberfläche und die ausgewogene Krume machen es zu einem angenehm zurückhaltenden Brot mit feinem, leicht herzhaftem Geschmack.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Besonders milde Kruste mit glatter Oberfläche.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Olivenstange',
    group: 'Brot',
    price: '4,30 €',
    pricePerKg: '8,60 € / kg',
    weight: '500 g',
    description:
      'Unsere Olivenstange ist eine herzhafte Weizenstange mit kräftigem Charakter und einer saftig-lockeren Krume. Der Teig ist derselbe wie bei unserem Weinstock, also mild gesäuert, außen schön kross gebacken und innen wunderbar weich. Die vielen schwarzen Oliven geben dem Brot eine mediterrane Note und machen es zur idealen Begleitung beim Grillen, zu Antipasti oder einfach mit einem Klecks Hummus.',
    shortIngredients: 'Weizenmehl, Wasser, schwarze Oliven, Traubensaft, Salz, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Oliven schwarz (Oliven, Salz), Traubensaft, Salz, Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Hefe',
    allergens: ['Gluten (Weizen)'],
    note: 'Gleicher Teig wie beim Weinstock. Verkaufstipp: zum Grillen, zu Antipasti oder mit Hummus.',
    flour: '100 % Weizen',
    breadType: 'weizen',
    vegan: true
  },
  {
    name: 'Paniermehl',
    group: 'Sonstiges',
    price: '1,50 €',
    pricePerKg: '7,50 € / kg',
    weight: '200 g',
    description:
      'Unser Paniermehl entsteht aus unseren Haus-Brötchen und wird in der Backstube frisch zerkleinert. Die Grundlage bildet ein mildes Brötchen mit Butter, das durch seine feine Krume ein besonders gleichmäßiges und hochwertiges Paniermehl ergibt. Ideal zum Verfeinern, Panieren oder als Bindemittel in der Küche, für alle, die auch bei den kleinen Dingen auf Handwerksqualität achten.',
    shortIngredients: 'Zerkleinerte Haus-Brötchen (Weizenmehl, Wasser, Hefe, Salz, etwas Butter)',
    fullIngredients: 'WEIZENMEHL, Wasser, Hefe, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), BUTTER' + BACKMALZ + ', Butter',
    allergens: ['Gluten (Weizen)', 'Milch']
  },
  {
    name: 'Pistazien Kekse',
    aliases: ['Pistazien-Kekse', 'Pistazien Cookies'],
    group: 'Kleingebäck',
    price: '8,80 €',
    pricePerKg: '44,00 € / kg',
    weight: '200 g',
    description:
      'Unsere Pistazien Cookies sind buttrig zart, mürbe im Biss und voller nussiger Aromen. Sie vereinen alles, was man am klassischen Heidesand liebt, mit dem feinen Geschmack von gerösteten Pistazien und einem Hauch Zitrone.',
    shortIngredients: 'Weizenmehl, Zucker, Pistazien, Butter, Ei, Pistazienmark, Zitrone',
    fullIngredients:
      'WEIZENMEHL, Zucker, PISTAZIEN, BUTTER, VOLLEI, Pistazienpaste (PISTAZIENMARK, Farbstoffe, EIER (SPUR), MILCH (SPUR), SCHALENFRÜCHTE (SPUREN)), Zitronenpulver (Reismehl, Zucker, Fruktose, Saflorkonzentrat, Alpha-Tocopherol, MILCH (SPUR), EIER (SPUR), SOJA (SPUREN)), Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke)',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Pistazien)'],
    allergenNote: 'Kann Spuren enthalten: Soja.',
    note: 'Wie Heidesand, mit Pistazien und Zitrone.'
  },
  {
    name: 'Prasselkuchen',
    group: 'Kleingebäck',
    price: '3,20 €',
    description:
      'Unser Prasselkuchen, vielerorts auch als „Bobbes“ bekannt, ist ein buttrig-knuspriges Gebäck mit einfacher, aber überzeugender Kombination. Eine Schicht Blätterteig bildet die Basis und sorgt für eine zarte, leicht splitternde Struktur. Darauf liegt eine feine Marzipanschicht, die für Saftigkeit und eine dezente Süße sorgt, bevor goldene Butterstreusel dem Ganzen den typischen, mürben Biss verleihen.',
    shortIngredients: 'Blätterteig, Marzipanschicht, Butterstreusel',
    fullIngredients: 'WEIZENMEHL, BUTTER, Zucker, Wasser, VOLLMILCHPULVER, Salz',
    allergens: ['Gluten (Weizen)', 'Milch']
  },
  {
    name: 'Printenbruch',
    group: 'Weihnachtsgebäck',
    price: '7,50 €',
    pricePerKg: '30,00 € / kg',
    weight: '250 g',
    description:
      'Unser Printenbruch ist nicht einfach nur ein Gebäck, er ist ein Stück gelebte Geschichte. Nach dem ältesten Rezept unserer Bäckerei gefertigt, braucht er vor allem eins: Zeit. Ganze drei Monate darf er ruhen, damit sich die vielschichtigen Aromen aus Zuckersirup, Gewürzen und kandierten Zitrusschalen voll entfalten können. Jean Hinkel, der Gründer unserer Bäckerei, präsentierte dieses Traditionsgebäck bereits damals auf einer Weltausstellung. Seitdem hat sich am Rezept nichts geändert, und das schmeckt man mit jedem Bissen. Ein würzig aromatischer Klassiker für echte Liebhaber.',
    shortIngredients: 'Zuckersirup, Weizen- und Roggenmehl, kandierte Zitrusschalen, Printengewürz',
    fullIngredients:
      'Zuckersirup, WEIZENMEHL, Zucker, ROGGENMEHL, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), Wasser, Printengewürz (Koriander, Zimt, Fenchel, Anis, Piment, Leinmehl, Reisstärke, Vanillin), Anis, Salz, Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat), zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Ältestes Rezept der Bäckerei, ruht 3 Monate. Gründer Jean Hinkel zeigte es auf einer Weltausstellung.',
    vegan: true
  },
  {
    name: 'Puddingbrezel',
    group: 'Feingebäck',
    price: '2,90 €',
    description:
      'Unsere Puddingbrezel besteht aus zartem Butterplunder und wird in der Mitte mit einem Klecks selbstgekochtem Vanillepudding gefüllt. Der Pudding sorgt mit seiner feinen Vanillenote für einen cremigen Kontrast zur knusprigen Brezel. Nach dem Backen wird die Puddingbrezel aprikotiert, mit Fondant überzogen und erhält dadurch ihren typischen Glanz und eine leichte Süße.',
    shortIngredients: 'Butterplunder, selbstgekochter Vanillepudding, aprikotiert',
    fullIngredients:
      'Wasser, WEIZENMEHL, MILCH, Zucker, Fondant (Zucker, Glukosesirup), Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), VOLLMILCHPULVER, EIGELB, WEIZENSTÄRKE, BUTTER, VOLLEI, Hefe, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe)' +
      BACKMALZ +
      ', ' +
      VANILLEAROMA,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Quarkbällchen',
    group: 'Feingebäck',
    price: '0,70 €',
    description:
      'Unsere Quarkbällchen sind außen goldbraun und knusprig, innen herrlich locker und saftig. Der Rührteig mit feinem Magerquark sorgt für eine leichte, fluffige Textur und ein angenehm frisches Aroma. Nach dem Ausbacken werden die kleinen Bällchen in Zucker gewendet und erhalten so ihre typisch süße Hülle.',
    shortIngredients: 'Rührteig mit Magerquark, ausgebacken, in Zucker gewendet',
    fullIngredients:
      'Quarkbällchen-Backmischung (WEIZENMEHL, Rapsöl, Palmöl, Zucker, VOLLEIPULVER, WEIZENSTÄRKE, Salz, Natriumcarbonat, Diphosphate, Monoglyceride von Speisefettsäuren, Diglyceride von Speisefettsäuren, WEIZENLECITHIN, HÜHNEREIWEIßPULVER, Glukosesirup, Guarkernmehl, natürliches Aroma (BUTTER), MILCHEIWEIß, Kaliumtartrate), Wasser, MAGERQUARK, Zucker, Pflanzenfett (Sonnenblumenöl, Kokosnussöl, Zitronensäure)',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Quarkschnecke mit Himbeeren',
    aliases: ['Quarkschnecke'],
    group: 'Feingebäck',
    price: '2,80 €',
    description:
      'Unsere Quarkschnecke mit Himbeeren vereint luftigen Hefeteig mit einer cremigen Quarkmasse und fruchtigen Himbeeren. Beim Backen verschmelzen die süßsäuerlichen Beeren mit der feinen Quarkfüllung zu einem herrlich saftigen Kern. Der Teig wird sanft aufgerollt und gebacken, bevor sie zum Schluss aprikotiert und mit Fondant überzogen wird.',
    shortIngredients: 'Hefeteig, Quarkfüllung, Himbeeren, aprikotiert',
    fullIngredients:
      'MAGERQUARK, WEIZENMEHL, Himbeeren, Fondant (Zucker, Glukosesirup), Zucker, Wasser, BUTTER, Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), VOLLEI, Cremepulver (Maisstärke, natürliches Aroma Vanille, Salz, Natriumphosphate, GLUTENHALTIGES GETREIDE, EIER (SPUR), MILCH (SPUR), NÜSSE (SPUR)), Cremepulver (Zucker, modifizierte Stärke, VOLLMILCHPULVER, MAGERMILCHPULVER, Dextrose, Natriumalginat, Diphosphate, Monoglyceride von Speisefettsäuren, MILCHEIWEIß, Karottenkonzentrat), Hefe, VOLLMILCHPULVER, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' +
      BACKMALZ +
      ', Salz',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch'],
    allergenNote: 'Kann Spuren enthalten: Schalenfrüchte.'
  },
  {
    name: 'Reines Roggen',
    aliases: ['Reine Roggen', 'Reines Roggenbrot'],
    group: 'Brot',
    price: '4,60 €',
    pricePerKg: '6,13 € / kg',
    weight: '750 g',
    description:
      'Unser Reines Roggen ist ein kräftiges Roggenbrot, das ganz ohne Hefe auskommt. Gebacken im Kasten und gesäuert mit natürlichem Sauerteig, entsteht eine saftige Krume mit angenehm herber Note.',
    shortIngredients: 'Roggenmehl, Wasser, Salz, Sauerteig, ohne Hefe',
    fullIngredients: 'ROGGENMEHL, Wasser, Salz, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    note: 'Ganz ohne Hefe, nur 4 Zutaten. Im Kasten gebacken.',
    flour: '100 % Roggen',
    breadType: 'roggen',
    vegan: true
  },
  {
    name: 'Röggelchen',
    group: 'Brötchen',
    price: '1,05 €',
    description:
      'Unser Röggelchen ist ein rheinisches Brötchen aus einer Mischung aus Weizen- und Roggenmehl. Saftig, aromatisch und traditionell paarweise aneinander gebacken. Der Brötchen-Klassiker aus dem Rheinland.',
    shortIngredients: 'Weizenmehl, Roggenmehl, Wasser, Sauerteig, Salz, Hefe',
    fullIngredients: 'WEIZENMEHL, Wasser, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz, ROGGENMEHL, Hefe, ROGGENSAUER' + BACKMALZ + ', Salz, Roggenmehl, Hefe, Roggensauer',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Rheinischer Klassiker, traditionell paarweise aneinander gebacken.',
    flour: 'Weizen- und Roggenmehl',
    vegan: true
  },
  {
    name: 'Roggenstange',
    group: 'Brot',
    price: '3,20 €',
    pricePerKg: '6,40 € / kg',
    weight: '500 g',
    description:
      'Unsere Roggenstange ist ein rustikales Stangenbrot aus Roggenmischteig mit hauseigenem Sauerteig. Aromatisch, kräftig und mit fester Kruste ist sie vielseitig einsetzbar und ideal zum Aufschneiden oder Dippen.',
    shortIngredients: 'Schwarzwälder-Teig: Roggenmehl (70 %), Weizenmehl (30 %), Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'Roggenmehl, Wasser, Weizenmehl, Salz, zerkleinertes Roggenmischbrot (Roggenmehl, Weizenmehl, Roggensauer, Salz, Hefe, Weizengrieß, Weizenmalzmehl, Wasser), Hefe, Roggensauer, Weizenmalzmehl, Weizengrieß',
    allergens: ['Gluten', 'Weizen'],
    note: 'Gleicher Teig wie das Schwarzwälder, nur als Stange gebacken.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Römer',
    group: 'Brötchen',
    price: '1,30 €',
    description:
      'Unser Römer-Brötchen ist groß, rustikal und besonders knusprig. Mit 98 % Weizen und einem kleinen Anteil Roggen erhält es eine milde, aromatische Note und eine saftige Krume. Die Allzweckwaffe zu jedem Frühstück.',
    shortIngredients: 'Weizenmehl (98 %), etwas Roggenmehl, Wasser, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, ROGGENMEHL, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)' + BACKMALZ + ', Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)',
    allergens: ['Gluten (Weizen, Roggen)'],
    flour: '98 % Weizen, 2 % Roggen',
    vegan: true
  },
  {
    name: 'Rosinenmürbchen',
    aliases: ['Rosinen-Mürbchen'],
    group: 'Feingebäck',
    price: '1,20 €',
    description:
      'Unser Rosinen-Mürbchen überzeugt mit besonders vielen Rosinen und einer angenehm weichen, saftigen Krume. Der feine Marzipananteil im Teig verleiht ihm eine harmonische Süße, die es von anderen abhebt.',
    shortIngredients: 'Weizenmehl, Rosinen, Butter, Zucker, Milchpulver, etwas Marzipan, Hefe',
    fullIngredients:
      'WEIZENMEHL, Rosinen, Wasser, Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' +
      BACKMALZ +
      ', Salz',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Rosinenschnecke',
    group: 'Feingebäck',
    price: '2,85 €',
    description:
      'Unsere Rosinenschnecke ist ein feines Plunderstück mit saftigen Rosinen und einer Schicht aus zarter Marzipanmasse. Der buttrige Plunderteig wird sorgfältig aufgerollt, damit sich Rosinen und Marzipan harmonisch miteinander verbinden. Nach dem Backen wird die Schnecke fein aprikotiert und mit Fondant überzogen, was sie leicht glänzen lässt und ihre süßen Aromen abrundet.',
    shortIngredients: 'Plunderteig, Marzipanmasse, Rosinen, aprikotiert',
    fullIngredients:
      'WEIZENMEHL, MILCH, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Rosinen, Wasser, Zucker, Fondant (Zucker, Glukosesirup), VOLLEI, Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), BUTTER, Hefe, VOLLMILCHPULVER, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme)' +
      BACKMALZ,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Rosinenstriezel',
    group: 'Feingebäck',
    price: '5,50 €',
    description:
      'Unser Rosinenstriezel ist ein echter Klassiker für alle, die es süß und saftig mögen. In seinem Inneren verbirgt sich eine üppige Mischung aus Rosinen, feinem Marzipan und zarten gestifteten Mandeln. All das wird von lockerem Hefeteig umhüllt, der beim Backen goldbraun aufgeht und für eine herrlich weiche Krume sorgt. Der Striezel wird nach dem Backen sorgfältig aprikotiert und mit Fondant überzogen, was ihm einen feinen Glanz und eine zarte Süße verleiht. Besonders schön: Hier wird wirklich nicht gespart, weder bei Rosinen noch bei Marzipan oder Mandeln. Jeder Bissen steckt voller Aroma und Textur.',
    shortIngredients: 'Hefeteig mit Rosinen, Marzipan und gestifteten Mandeln, aprikotiert',
    fullIngredients:
      'Rosinen (Rosinen, Sonnenblumenöl), WEIZENMEHL, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Wasser, Zucker, Fondant (Zucker, Glukosesirup), Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), VOLLEI, MANDELN, BUTTER, Hefe, VOLLMILCHPULVER, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme)' +
      BACKMALZ,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Rosinenstuten',
    group: 'Stuten & Brioche',
    price: '3,90 €',
    pricePerKg: '7,80 € / kg',
    weight: '500 g',
    description:
      'Unser Rosinen-Stuten überzeugt durch seine üppige Füllung mit saftigen Rosinen. Ein süßer Klassiker für alle, die es gerne ein wenig fruchtiger haben.',
    shortIngredients: 'Weizenmehl, Wasser, Rosinen, Zucker, Butter, Milchpulver, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, Rosinen, Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' + BACKMALZ + ', Salz',
    allergens: ['Gluten (Weizen)', 'Milch'],
    flour: '100 % Weizen',
    breadType: 'stuten'
  },
  {
    name: 'Schlesisches Bauernbrot',
    aliases: ['Schlesische Bauernbrot'],
    group: 'Brot',
    price: '9,50 €',
    pricePerKg: '4,75 € / kg',
    weight: '2000 g',
    description:
      'Unser Schlesisches Bauernbrot ist mit 2 Kilogramm eines der ganz Großen bei uns. Durch die Größe des Laibs entwickelt sich beim Backen nicht nur eine besonders aromatische Kruste, sondern auch eine langanhaltende Frische im Inneren. Gebacken aus Roggenmischteig mit hohem Sauerteig-Anteil, überrascht es mit einem angenehm milden Geschmack.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Mit 2 kg eines der größten Brote, bleibt lange frisch.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Schoko-Croissant',
    group: 'Feingebäck',
    price: '2,20 €',
    description:
      'Unser Schoko-Croissant ist ein echt französisches Buttergebäck, touriert mit viel Butter für den unverwechselbar zarten Biss. In der Mitte sorgen zwei feine Schokoladenstäbchen für eine süße Füllung, die perfekt mit dem blättrigen Teig harmoniert.',
    shortIngredients: 'Croissant-Teig mit viel Butter, zwei Schokostäbchen',
    fullIngredients:
      'WEIZENMEHL, BUTTER, Schokostäbe (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), Wasser, Zucker, VOLLEI, VOLLMILCHPULVER, Hefe, Salz, Plunderbackmittel (WEIZENKLEBER, WEIZENMEHL, Monoglyceride von Speisefettsäuren, Diglyceride von Speisefettsäuren, Essigsäureester von Mono - und Diglyceriden von Speisefettsäuren, Calciumphosphate, Ascorbinsäure)',
    allergens: ['Gluten (Weizen)', 'Eier', 'Soja', 'Milch']
  },
  {
    name: 'Schokokuchen',
    aliases: ['Veganer Schokokuchen'],
    group: 'Kuchen',
    price: '3,30 €',
    description:
      'Unser Schokokuchen ist herrlich saftig und besonders schokoladig. Fruchtige Himbeeren sorgen für eine feine Säure und machen ihn wunderbar ausgewogen. Abgerundet mit etwas Puderzucker ist dieser Kuchen ein vollmundiger Genuss, der ganz ohne tierische Zutaten auskommt und damit vegan ist.',
    shortIngredients: 'Hafermilch, Zucker, Weizenmehl, Himbeer-Johannisbeer-Konfitüre, Rapsöl, Kuvertüre, Kakao',
    fullIngredients:
      'Hafermilch (Wasser, HAFER), Zucker, WEIZENMEHL, Himbeer-Johannisbeer-Konfitüre (Himbeeren, Zucker, Zitronensaftkonzentrat, Pektin), Rapsöl, Kuvertüre (Kakaomasse, Zucker, Kakaobutter, SOJALEZITHIN, MILCH (SPUR)), Kakaopulver, Ahornsirup, Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke), Natron, Salz',
    allergens: ['Gluten (Weizen, Hafer)', 'Soja'],
    vegan: true,
    allergenNote: 'Kann Spuren enthalten: Milch.'
  },
  {
    name: 'Schokoladen-Printen',
    aliases: ['Schokoladenprinten'],
    group: 'Weihnachtsgebäck',
    price: '4,00 €',
    pricePerKg: '40,00 € / kg',
    description:
      'Unsere Schokoladenprinten sind die elegante, längliche Variante unseres traditionellen Printengebäcks. Der würzige Teig wird mit einer kräftigen Mischung aus ausgewählten Gewürzen gebacken und entfaltet durch die lange Reifezeit sein volles Aroma. Zum Abschluss wird jede Printe von Hand in feinste Zartbitterschokolade getaucht. So entsteht ein weihnachtlicher Klassiker mit kräftigem Biss und schokoladigem Glanz. 100 Gramm sind ca. 3-4 Stück.',
    shortIngredients: 'Printenteig (Zuckersirup, Weizen- und Roggenmehl, Printengewürz), Zartbitter-Kuvertüre',
    fullIngredients:
      'Zuckersirup, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), WEIZENMEHL, Zucker, ROGGENMEHL, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), Wasser, Printengewürz (Koriander, Zimt, Fenchel, Anis, Piment, Leinmehl, Reisstärke, Vanillin), Anis, Salz, Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat), zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)', 'Soja'],
    vegan: true
  },
  {
    name: 'Schokomürbchen',
    aliases: ['Schoko-Mürbchen'],
    group: 'Feingebäck',
    price: '1,25 €',
    description:
      'Unser Schoko-Mürbchen ist vollgepackt mit kräftigen Schokostückchen und bleibt dabei herrlich weich und ausgewogen süß. Der dezente Marzipananteil im Teig sorgt für eine feine Note, die perfekt zur Schokolade passt.',
    shortIngredients: 'Weizenmehl, Schokostückchen, Butter, Zucker, Milchpulver, etwas Marzipan, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Kuvertüre (Kakaomasse, Zucker, Kakaobutter, SOJALEZITHIN, MILCH (SPUR)), Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' +
      BACKMALZ +
      ', Salz',
    allergens: ['Gluten (Weizen)', 'Soja', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Schwarz-Weiß Gebäck',
    aliases: ['Schwarz-Weiß-Gebäck'],
    group: 'Kleingebäck',
    price: '5,30 €',
    pricePerKg: '26,50 € / kg',
    weight: '200 g',
    description:
      'Unser Schwarz-Weiß Gebäck ist ein zartes Mürbeteigplätzchen mit feiner Kakaonote und dem typischen zweifarbigen Muster. Die Kombination aus hellem Teig und dunklem Kakaoteig sorgt nicht nur optisch für Abwechslung, sondern bringt auch geschmacklich eine angenehme Balance.',
    shortIngredients: 'Mürbeteig aus Weizenmehl, Butter, Zucker, Marzipan, Ei, Kakao',
    fullIngredients:
      'WEIZENMEHL, BUTTER, Zucker, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Kakaopulver, VOLLEI, Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke)',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Schwarzbrotstange',
    group: 'Brot',
    price: '3,40 €',
    pricePerKg: '6,80 € / kg',
    weight: '500 g',
    description:
      'Unsere Schwarzbrot-Stange wird aus dem klassischen Teig unseres rheinischen Roggenvollkornbrots gefertigt, aber in Stangenform gebacken. Das sorgt für kleinere, runde Scheiben mit etwas mehr Kruste und eignet sich somit ideal zum Belegen, als Snack oder zum Servieren auf der Käseplatte. Wer es raffinierter mag, findet mit der Walnuss- oder Casanova-Stange spannende Varianten.',
    shortIngredients: 'Roggenschrot, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    note: 'Varianten zum Empfehlen: Walnuss-Schwarzbrotstange und Casanova.',
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Schweineohr mit Schokolade',
    group: 'Feingebäck',
    price: '3,10 €',
    description:
      'Unsere Schweineohren sind ein klassisches Blätterteiggebäck aus reiner Butter, das in traditioneller Handarbeit touriert wird. Der feine Kristallzucker karamellisiert beim Backen zu einer herrlich knusprigen Kruste. Eine Hälfte wird in Zartbitterschokolade getaucht und macht das Öhrchen zu einem echten Genussmoment.',
    shortIngredients: 'Butter-Blätterteig, Zucker, halb in Zartbitterschokolade getaucht',
    fullIngredients:
      'MILCH, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), WEIZENMEHL, Wasser, Zucker, VOLLMILCHPULVER, Salz',
    allergens: ['Gluten (Weizen)', 'Soja', 'Milch'],
    note: 'Gibt es auch ohne Schokolade (Schweineohr ohne Schokolade).'
  },
  {
    name: 'Schweineohr ohne Schokolade',
    aliases: ['Schweineohr'],
    group: 'Feingebäck',
    price: '2,60 €',
    description:
      'Unsere Schweineohren sind ein klassisches Blätterteiggebäck aus reiner Butter, das in traditioneller Handarbeit touriert wird. Der feine Kristallzucker karamellisiert beim Backen zu einer herrlich knusprigen Kruste.',
    shortIngredients: 'Butter, Weizenmehl, Zucker, Wasser, Milchpulver, Salz',
    fullIngredients: 'BUTTER, WEIZENMEHL, Zucker, Wasser, VOLLMILCHPULVER, Salz',
    allergens: ['Gluten (Weizen)', 'Milch']
  },
  {
    name: 'Schweizer',
    group: 'Brot',
    price: '4,60 €',
    pricePerKg: '6,13 € / kg',
    weight: '750 g',
    description:
      'Unser Schweizer Brot überzeugt durch seine ausgewogene Mischung aus Weizen und Roggen sowie die besondere Zutat Quark, die dem Teig eine feine, saftige Struktur verleiht. Die kräftig ausgebackene Kruste sorgt für Biss, während das Innere angenehm weich bleibt. Ein bodenständiges Brot mit feiner Note, das zu jedem Belag passt.',
    shortIngredients: 'Weizenmehl, Roggenmehl, Wasser, Magerquark, Sauerteig, Hefe, Salz',
    fullIngredients: 'Wasser, WEIZENMEHL, ROGGENMEHL, MAGERQUARK, Hefe, Salz, ROGGENSAUER',
    allergens: ['Gluten (Weizen, Roggen)', 'Milch'],
    note: 'Besondere Zutat: Quark im Teig.',
    flour: '60 % Weizen, 40 % Roggen',
    breadType: 'weizenmisch'
  },
  {
    name: 'Senfkruste',
    aliases: ['Senfkrustenbrot', 'Senf-Krusten-Brot'],
    group: 'Brot',
    price: '4,90 €',
    pricePerKg: '9,80 € / kg',
    weight: '500 g',
    description:
      'Unser Senf-Krusten-Brot ist ein Weizenbrot mit einem Anteil an Vollkornschrot aus Weizen und Roggen. Der Teig wird mit etwas Gouda verfeinert, wobei das Highlight die rustikale Kruste ist: Sonnenblumenkerne, geröstet in echtem Düsseldorfer ABB-Senf, sorgen für eine kräftige Würze und besonderen Biss. Besonders empfehlenswert zu Ofenkäse oder einem klassischen Käsefondue.',
    shortIngredients: 'Weizenmehl, Senf, Sonnenblumenkerne, Weizen- und Roggenschrot, Gouda, Salz, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, SENF (Wasser, Branntweinessig, SENFSAAT, Salz, Zucker, Gewürze), Sonnenblumenkerne, WEIZENSCHROT, Gouda (MILCH, Salz, Lab, Maisstärke), ROGGENSCHROT, SENFSAAT, Salz, Hefe',
    allergens: ['Gluten (Weizen, Roggen)', 'Milch', 'Senf'],
    note: 'Kruste mit echtem Düsseldorfer ABB-Senf. Verkaufstipp: zu Ofenkäse oder Käsefondue.',
    flour: '90 % Weizen, 10 % Roggenschrot',
    breadType: 'weizen'
  },
  {
    name: 'Sesambrötchen',
    group: 'Brötchen',
    price: '0,70 €',
    description:
      'Unser Sesambrötchen ist ein handgearbeitetes Spitzbrötchen mit mildem Aroma und zartsplittriger Kruste. Bestreut mit goldgelbem Sesam für eine feine Röstnote und ein rundes Geschmackserlebnis.',
    shortIngredients: 'Weizenmehl, Wasser, Sesam, Hefe, Salz, etwas Butter',
    fullIngredients: 'WEIZENMEHL, Wasser, SESAMSAAT, Hefe, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), BUTTER' + BACKMALZ + ', Butter',
    allergens: ['Gluten (Weizen)', 'Milch', 'Sesam'],
    flour: '100 % Weizen'
  },
  {
    name: 'Sonnenblumenbrot',
    group: 'Brot',
    price: '4,20 €',
    pricePerKg: '8,40 € / kg',
    weight: '500 g',
    description:
      'Unser Sonnenblumenbrot ist ein saftiges Roggenmischbrot mit kräftigem Roggenvollkornschrot und einer ordentlichen Portion Sonnenblumenkerne. Diese bringen nicht nur einen nussigen Geschmack, sondern auch eine feine Röstnote in die Krume. Der Sauerteig sorgt für eine angenehme Frische und eine ausgewogene Balance zwischen Milde und Würze. Ein echtes Klassikerbrot, das sowohl zum Frühstück als auch zur herzhaften Brotzeit passt.',
    shortIngredients: 'Sonnenblumenkerne, Roggenmehl, Roggenschrot, Weizenmehl, Sauerteig, Salz, Hefe',
    fullIngredients:
      'Wasser, Sonnenblumenkerne, ROGGENMEHL, ROGGENSCHROT, WEIZENMEHL, Salz, Hefe, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)'],
    flour: '70 % Roggen, 20 % Weizen, 10 % Roggenvollkornschrot',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Sonnenblumenkern-Schwarzbrot (Kasten)',
    aliases: ['Sonnenblumenschwarzbrot', 'Sonnenblumenkern-Schwarzbrot'],
    group: 'Brot',
    price: '3,40 €',
    pricePerKg: '6,80 € / kg',
    weight: '500 g',
    description:
      'Unser Schwarzbrot wird aus 100 Prozent Roggenvollkornschrot und nach einem überlieferten Rezept gebacken. In dieser Version geben wir zusätzlich viele Sonnenblumenkerne hinzu, die für einen nussigen Geschmack und eine angenehm saftige Textur sorgen. Jeder Bissen bringt kernige Aromen und satte Energie auf den Teller. In dieser Variante wird unser Schwarzbrot im Kasten gebacken. Somit sind alle Scheiben gleich groß. Unser Schwarzbrot aus dem Kasten kann nicht am Stück gekauft werden.',
    shortIngredients: 'Roggenschrot, Sonnenblumenkerne, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Sonnenblumenkerne, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    note: 'Aus dem Kasten gibt es das Schwarzbrot nur geschnitten, nicht am Stück.',
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Spezialbrot',
    group: 'Brot',
    price: '5,70 €',
    pricePerKg: '5,70 € / kg',
    weight: '1000 g',
    description:
      'Unser Spezialbrot ist ein Roggenmischbrot mit Sauerteig und besonders kräftiger Kruste. Durch das doppelte Backen entsteht eine intensive Röstnote außen und eine saftige, ausgewogene Krume im Inneren.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Besonderheit: doppelt gebacken, dadurch die kräftige Kruste.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Spinatstange',
    aliases: ['Vesperstange mit Spinat'],
    group: 'Herzhafte Snacks',
    price: '2,90 €',
    description:
      'Unsere Spinatstange ist ein herzhaftes Blätterteiggebäck, gefüllt mit würzigem Gouda, frischem Spinat und Zwiebeln. Außen knusprig mit Sesam bestreut, innen aromatisch und saftig. Ein vegetarischer Snack für jede Gelegenheit.',
    shortIngredients: 'Teig aus Weizen- und Roggenmehl, Spinat, Gouda, Zwiebeln, Sesam',
    fullIngredients:
      'Spinat, WEIZENMEHL, Gouda (MILCH, Salz, Lab, Maisstärke), Wasser, Zwiebel, MILCH, SESAMSAAT, ROGGENMEHL, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), Muskatnuss, Pfeffer' +
      BACKMALZ +
      ', Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), Muskatnuss, Pfeffer',
    allergens: ['Gluten (Weizen, Roggen)', 'Milch', 'Sesam'],
    note: 'Vegetarische Alternative zur Vesperstange mit Speck.'
  },
  {
    name: 'Spitzkuchen',
    group: 'Weihnachtsgebäck',
    price: '4,25 €',
    pricePerKg: '42,50 € / kg',
    description:
      'Unser Spitzkuchen ist ein echter Klassiker aus unserer Weihnachtsbäckerei. Die Basis bildet ein saftiger Honigkuchenteig, der mit winterlichen Gewürzen verfeinert wird. Außen wird der kleine Genussmoment mit einem Überzug aus herber Zartbitterschokolade abgerundet. 100 Gramm sind ca. 9-10 Stück.',
    shortIngredients: 'Honigkuchenteig mit Gewürzen und etwas Marzipan, Zartbitter-Überzug',
    fullIngredients:
      'Honig, Kuvertüre (Zucker, Kakaomasse, Kakaobutter, SOJALEZITHIN, natürliches Aroma Vanille), WEIZENMEHL, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), ROGGENMEHL, Printengewürz (Koriander, Zimt, Fenchel, Anis, Piment, Leinmehl, Reisstärke, Vanillin), Marzipan (MANDELN, Zucker, Wasser, Invertzucker), BUTTER, Anis, Salz, Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat), Natron, Kakaopulver',
    allergens: ['Gluten (Weizen, Roggen)', 'Soja', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Spritzgebäck',
    group: 'Kleingebäck',
    price: '5,30 €',
    pricePerKg: '26,50 € / kg',
    weight: '200 g',
    description:
      'Unser Spritzgebäck wird von Hand gefertigt und mit echter Butter gebacken. Die feine Vanillenote, kombiniert mit einer zart mürben Textur, macht jeden Bissen zu einem kleinen Genussmoment. Ob pur oder zum Kaffee serviert - dieses klassische Gebäck gehört einfach in jede Keksdose.',
    shortIngredients: 'Weizenmehl, Butter, Zucker, Kondensmilch, Ei, Vanille',
    fullIngredients:
      'WEIZENMEHL, BUTTER, Zucker, Kondensmilch (MILCH, Natriumphosphate, Carrageen), VOLLEI, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe), Salz, natürliches Bourbon-Vanillearoma' +
      VANILLEAROMA +
      ', Salz, natürliches Bourbon-Vanillearoma',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Spuntino Mediterano',
    group: 'Herzhafte Snacks',
    price: '4,20 €',
    description:
      'Unser Spuntino Mediterano ist ein lockeres Weizenbrötchen, welches gefüllt mit Paprika, Zucchini & Feta-Käse und überbacken mit Gouda der ideale Snack für Zwischendurch ist.',
    shortIngredients: 'Weizenbrötchen mit Paprika, Zucchini, Tomaten, Feta, überbacken mit Gouda',
    fullIngredients:
      'WEIZENMEHL, Wasser, Gouda (MILCH, Salz, Lab, Maisstärke), Tomaten, Zuccini, Feta (MILCH, Salz, Buttereikulturen), Paprika, Zwiebel, Hefe, Salz, Knoblauchpulver, Zitronensäure, Basilikum, Pfeffer, Olivenöl',
    allergens: ['Gluten (Weizen)', 'Milch']
  },
  {
    name: 'Sternchen',
    group: 'Brot',
    price: '2,00 €',
    pricePerKg: '8,00 € / kg',
    weight: '250 g',
    description:
      'Unser Sternchen ist die kleine Version unseres Schwarzwälders - genauso kräftig, saftig und aromatisch, aber handlicher im Format. Gebacken mit Sauerteig und einem Roggen-Weizen-Verhältnis von 70 zu 30 überzeugt es mit rustikaler Kruste und herzhafter Krume. Ideal für kleinere Haushalte oder wenn’s einfach mal nicht das ganze Brot sein soll.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Streuselkuchen',
    group: 'Kuchen',
    price: '2,50 €',
    description:
      'Unser Streuselkuchen wird aus einem lockeren Butterhefeteig gebacken, der mit einem Hauch Vanillepudding verfeinert wird. Obenauf kommt eine großzügige Schicht goldgelber Butterstreusel, die beim Backen herrlich knusprig werden.',
    shortIngredients: 'Butterhefeteig mit Vanillepudding, Butterstreusel (Weizenmehl, Zucker, Butter)',
    fullIngredients:
      'WEIZENMEHL, Zucker, BUTTER, Wasser, VOLLMILCHPULVER, Hefe, EIGELB, WEIZENSTÄRKE, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe)' +
      BACKMALZ +
      ', ' +
      VANILLEAROMA,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch']
  },
  {
    name: 'Tarte Depart',
    group: 'Feingebäck',
    price: '3,70 €',
    description:
      'Unsere Tarte Depart ist eigentlich als saisonale Liebeserklärung entstanden, doch sie wurde zur festen Größe. Ursprünglich haben wir sie 2017 zur Tour de France in Düsseldorf gebacken, um den Start der berühmten Rundfahrt auf unsere Art zu feiern. Doch was als einmalige Hommage begann, wurde von unseren Kundinnen und Kunden so begeistert aufgenommen, dass schnell klar war: Diese Tarte darf nicht wieder verschwinden. Gebettet auf feinem Blätterteig liegt ein Klecks unserer hauseigenen Puddingcreme, darüber kommen frische Apfelscheiben, geröstete Mandelblättchen und eine Prise Zimt mit Zucker. Beim Backen karamellisiert alles leicht, wodurch ein wunderbar knusprig-saftiges Gebäck entsteht. Ein feiner, süßer Genuss mit Geschichte.',
    shortIngredients: 'Blätterteig, Puddingcreme, Apfel, Mandeln, Zimt und Zucker',
    fullIngredients:
      'Apfel, MILCH, WEIZENMEHL, Wasser, MANDELN, Zucker, VOLLMILCHPULVER, EIGELB, WEIZENSTÄRKE, Salz, Zimt, Vanillearoma (Dextrose, Vanillin, Propylenglycol, Aromaextrakte, natürliche Aromastoffe)' +
      VANILLEAROMA,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)'],
    note: 'Entstanden 2017 zum Tour-de-France-Start in Düsseldorf.'
  },
  {
    name: 'Toastbrot',
    group: 'Brot',
    price: '3,80 €',
    pricePerKg: '7,60 € / kg',
    weight: '500 g',
    description:
      'Unser Toastbrot ist ein ungesüßtes Weißbrot mit einem kleinen Anteil Butter. Die feine Krume und der milde Geschmack machen es ideal für herzhafte oder süße Beläge, ob frisch oder knusprig getoastet.',
    shortIngredients: 'Weizenmehl, Wasser, Butter, Milchpulver, Hefe, Salz',
    fullIngredients:
      'WEIZENMEHL, Wasser, BUTTER, VOLLMILCHPULVER, Hefe, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Zucker, Salz' + BACKMALZ + ', Zucker, Salz',
    allergens: ['Gluten (Weizen)', 'Milch'],
    flour: '100 % Weizen',
    breadType: 'weizen'
  },
  {
    name: 'Vesperstange mit Speck',
    group: 'Herzhafte Snacks',
    price: '2,90 €',
    description:
      'Unsere Vesperstange mit Speck ist ein rustikales Blätterteiggebäck, gefüllt mit würzigem Gouda, Röstzwiebeln und feinem Speck. Außen knusprig mit Mohn und Sesam bestreut, innen herzhaft und saftig. Der ideale Snack für unterwegs oder zwischendurch.',
    shortIngredients: 'Teig aus Weizen- und Roggenmehl, Gouda, Schinkenwürfel (Schwein), Röstzwiebeln, Sesam, Mohn',
    fullIngredients:
      'Gouda (MILCH, Salz, Lab, Maisstärke), WEIZENMEHL, Wasser, Schinkenwürfel (Schweinefleisch, Salz, Dextrose, Gewürze, Milchsäure, Kaliumsorbat, Ascorbinsäure), MILCH, Röstzwiebel (Zwiebel, Palmöl, WEIZENMEHL, Salz), ROGGENMEHL, SESAMSAAT, Mohn, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)' +
      BACKMALZ +
      ', Hefe, Salz, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure)',
    allergens: ['Gluten (Weizen, Roggen)', 'Milch', 'Sesam'],
    note: 'Enthält Schweinefleisch, nicht vegetarisch und nicht für Kunden, die kein Schwein essen.'
  },
  {
    name: 'Vinschgauer',
    group: 'Brot',
    price: '2,70 €',
    pricePerKg: '10,80 € / kg',
    weight: '250 g',
    description:
      'Unser Vinschgauer ist ein kräftig gewürztes Roggenmischbrot mit Kümmel, Koriander, Anis und Fenchel. Die kompakte Form, die saftige Krume und das ausgewogene Zusammenspiel der Gewürze verleihen ihm seinen typisch herzhaften Charakter.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, Sauerteig, Kümmel, Fenchel, Anis, Koriander, Brotklee',
    fullIngredients:
      'ROGGENMEHL, Wasser, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, Kümmel, Fenchel, Anis, Koriander, Brotklee, ROGGENSAUER, WEIZENMALZMEHL, WEIZENGRIEß',
    allergens: ['Gluten (Weizen, Roggen)'],
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Vollkornschwarzbrot (Kasten)',
    aliases: ['Vollkornschwarzbrot'],
    group: 'Brot',
    price: '3,20 €',
    pricePerKg: '6,40 € / kg',
    weight: '500 g',
    description:
      'Unser Schwarzbrot wird aus 100 Prozent Roggenvollkornschrot und nach einem überlieferten Rezept gebacken. Damit ist es ein echtes Stück rheinischer Backtradition. Es wird besonders lange und schonend gebacken, wodurch es seine kräftige Farbe, die intensive Kruste und sein volles Aroma entwickelt. In dieser Variante wird unser Schwarzbrot im Kasten gebacken. Somit sind alle Scheiben gleich groß. Unser Schwarzbrot aus dem Kasten kann nicht am Stück gekauft werden.',
    shortIngredients: 'Roggenschrot, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)'],
    note: 'Aus dem Kasten gibt es das Schwarzbrot nur geschnitten, nicht am Stück.',
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Vollmilch-Nuss-Printen',
    aliases: ['Vollmilch-Nussprinten'],
    group: 'Weihnachtsgebäck',
    price: '4,20 €',
    pricePerKg: '42,00 € / kg',
    description:
      'Unsere Vollmilch-Nussprinten verbinden den kräftig gewürzten Teig der klassischen Printe mit einer besonders feinen Hülle. Überzogen mit zartschmelzender Vollmilchschokolade und bestreut mit gerösteten Haselnüssen entsteht ein Gebäck, das würzige Tiefe mit süß-nussigem Genuss vereint. Ein festlicher Begleiter für die Adventszeit und genau das Richtige für alle, die es etwas milder und besonders knackig mögen. 100 Gramm sind ca. 3 Stück.',
    shortIngredients: 'Printenteig (Weizen- und Roggenmehl, Zuckersirup, Printengewürz), Vollmilch-Kuvertüre, Haselnüsse',
    fullIngredients:
      'Kuvertüre (Zucker, Kakaobutter, VOLLMILCHPULVER, Kakaomasse, SOJALEZITHIN, natürliches Aroma Vanille), Zuckersirup, HASELNÜSSE, WEIZENMEHL, Zucker, ROGGENMEHL, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), Wasser, Printengewürz (Koriander, Zimt, Fenchel, Anis, Piment, Leinmehl, Reisstärke, Vanillin), Anis, Salz, Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat), zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)', 'Soja', 'Milch', 'Schalenfrüchte (Haselnüsse)']
  },
  {
    name: 'Walnuss-Brot',
    aliases: ['Walnussbrot'],
    group: 'Brot',
    price: '2,60 €',
    pricePerKg: '10,40 € / kg',
    weight: '250 g',
    description:
      'Unser Walnussbrot ist ein kleines, aromatisches Roggenmischbrot mit hauseigenem Sauerteig. Die mild gebackene Kruste sorgt für ein ausgewogenes Verhältnis von Saftigkeit und Biss, während die vielen Walnüsse im Inneren für nussige Tiefe sorgen.',
    shortIngredients: 'Roggenmehl, Weizenmehl, Wasser, Walnüsse, Sauerteig, Salz, Hefe',
    fullIngredients:
      'ROGGENMEHL, Wasser, WALNUSSKERNE, WEIZENMEHL, Salz, zerkleinertes Roggenmischbrot (ROGGENMEHL, WEIZENMEHL, ROGGENSAUER, Salz, Hefe, WEIZENGRIEß, WEIZENMALZMEHL, Wasser), Hefe, ROGGENSAUER, WEIZENGRIEß, WEIZENMALZMEHL',
    allergens: ['Gluten (Weizen, Roggen)', 'Schalenfrüchte (Walnüsse)'],
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  },
  {
    name: 'Walnuss-Schwarzbrotstange',
    group: 'Brot',
    price: '4,30 €',
    pricePerKg: '8,60 € / kg',
    weight: '500 g',
    description:
      'Unsere Walnuss-Schwarzbrotstange wird aus unserem rheinischen Schwarzbrotteig mit ganzen Walnüssen gebacken, die sich wunderbar mit der kräftigen Säure des Roggens verbinden. Die handliche Form ergibt kleine Scheiben mit Biss, ideal als herzhafter Snack oder als Brot zur Käseplatte. Wer ein wenig experimenteller unterwegs ist, findet in unserem Casanova eine spannende Alternative mit Lakritz & Cranberries.',
    shortIngredients: 'Roggenschrot, Walnüsse, Wasser, Sirup, Sauerteig, Salz',
    fullIngredients:
      'ROGGENSCHROT, Wasser, WALNUSSKERNE, Ablaufsirup (Zuckerablaufsirup, Karamellzucker, Zitronensäure), zerkleinertes Schwarzbrot (ROGGENVOLLKORNSCHROT, ROGGENSAUER, Salz, Hefe, Wasser), Salz, ROGGENMEHL, ROGGENSAUER',
    allergens: ['Gluten (Roggen)', 'Schalenfrüchte (Walnüsse)'],
    note: 'Alternative zum Empfehlen: Casanova (mit Lakritz & Cranberries).',
    flour: '100 % Roggenvollkorn (Roggenschrot)',
    breadType: 'schwarzbrot',
    vegan: true
  },
  {
    name: 'Walnusshaube',
    group: 'Kleingebäck',
    price: '3,20 €',
    description:
      'Unsere Walnusshaube vereint zarten Mürbeteig mit einer Schicht feinstem Marzipan und reichlich gerösteten Walnüssen. Die aprikotierte, mit Fondant überzogene Oberfläche bringt nicht nur Glanz, sondern auch eine feine Süße, die perfekt mit dem nussigen Aroma harmoniert. Ein kleines Gebäck mit großem Geschmack.',
    shortIngredients: 'Mürbeteig, Marzipan, Walnüsse, Aprikosenmarmelade, etwas Rum',
    fullIngredients:
      'Marzipan (MANDELN, Zucker, Wasser, Invertzucker), WALNUSSKERNE, Zucker, WEIZENMEHL, Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), Wasser, MANDELN, BUTTER, Fondant (Zucker, Glukosesirup), Eiweißpulver (Zucker, HÜHNEREIWEIßPULVER, Natrium-Carboxymethylcellulose, Johannisbrotkernmehl, Monokaliumphosphat, Salz), VOLLEI, Rum 38% vol., Triebmittel: Hirschhornsalz (Ammoniumhydrogencarbonat, Magnesiumcarbonat), Salz, natürliches Bourbon-Vanillearoma',
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln, Walnüsse)']
  },
  {
    name: 'Weckmann',
    group: 'Saisongebäck',
    price: '3,40 €',
    pricePerKg: '17,00 € / kg',
    weight: '200 g',
    description:
      'Unser Weckmann ist ein Klassiker, den wir nach eigener Rezeptur mit einem kleinen Geheimnis backen. Was ihn so besonders macht, ist die Zugabe von feinem Marzipan im Teig, das für eine wunderbar saftige und aromatische Krume sorgt. Die traditionelle Form bleibt dabei natürlich erhalten, liebevoll von Hand geformt. Je nach Wunsch gibt es unseren Weckmann mit oder ohne Mandelüberzug.',
    shortIngredients: 'Weizenmehl, Butter, Zucker, Milchpulver, Marzipan im Teig, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Salz',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)'],
    note: 'Geheimnis: Marzipan im Teig. Auch mit Mandelüberzug erhältlich (Weckmann mit Mandeln).'
  },
  {
    name: 'Weckmann mit Mandeln',
    group: 'Saisongebäck',
    price: '3,90 €',
    pricePerKg: '19,50 € / kg',
    weight: '200 g',
    description:
      'Unser Weckmann ist ein Klassiker, den wir nach eigener Rezeptur mit einem kleinen Geheimnis backen. Was ihn so besonders macht, ist die Zugabe von feinem Marzipan im Teig, das für eine wunderbar saftige und aromatische Krume sorgt. Die traditionelle Form bleibt dabei natürlich erhalten, liebevoll von Hand geformt. Je nach Wunsch gibt es unseren Weckmann mit oder ohne Mandelüberzug.',
    shortIngredients: 'Weckmann-Teig mit Marzipan, Überzug aus Mandeln, Fondant und Aprikosenmarmelade',
    fullIngredients:
      'WEIZENMEHL, Wasser, MANDELN, Fondant (Zucker, Glukosesirup), Aprikosenmarmelade (Glukose-Fruktose-Sirup, Aprikosen, Zucker, Pektin, Zitronensäure), Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Marzipan (MANDELN, Zucker, Wasser, Invertzucker), Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Salz',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)']
  },
  {
    name: 'Weinstock',
    group: 'Brot',
    price: '2,95 €',
    pricePerKg: '11,80 € / kg',
    weight: '250 g',
    description:
      'Unser Weinstock ist ein kleines Weizenbrot mit grober Porung, rustikaler Kruste und einem besonders aromatischen Teig. Statt mit Wasser wird der Weizensauerteig mit Traubensaft angesetzt, was dem Brot eine feine Fruchtnote und eine saftige Krume verleiht. Besonders gut geeignet zum puristischen Dippen in Olivenöl mit Balsamico, Salz und Pfeffer.',
    shortIngredients: 'Weizenmehl, Wasser, Traubensaft, Salz, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Traubensaft, Salz, Malzbackmittel (WEIZENMEHL, Hefe, Salz, Dextrose, Rapsöl, Ascorbinsäure), Hefe',
    allergens: ['Gluten (Weizen)'],
    note: 'Verkaufstipp: zum Dippen in Olivenöl mit Balsamico, Salz und Pfeffer.',
    flour: '100 % Weizen',
    breadType: 'weizen',
    vegan: true
  },
  {
    name: 'Wochenendstuten',
    aliases: ['Wochenend-Stuten'],
    group: 'Stuten & Brioche',
    price: '4,50 €',
    pricePerKg: '9,00 € / kg',
    weight: '500 g',
    description:
      'Unser Wochenendstuten vereint Rosinen, gestiftete Mandeln, Zitronat und Orangeat zu einer aromatischen Mischung.',
    shortIngredients: 'Weizenmehl, Butter, Zucker, Milchpulver, Rosinen, Mandeln, Zitronat & Orangeat, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Zucker, BUTTER, Hefe, VOLLMILCHPULVER, Zitromischung (Orangenschale, Zitronenschale, Glukose-Fruktose-Sirup, Zucker, Zitronensäure), Rosinen, MANDELN, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme), Salz' +
      BACKMALZ +
      ', Salz',
    allergens: ['Gluten (Weizen)', 'Milch', 'Schalenfrüchte (Mandeln)'],
    flour: '100 % Weizen',
    breadType: 'stuten'
  },
  {
    name: 'Wölkchen',
    group: 'Kleingebäck',
    price: '4,00 €',
    pricePerKg: '40,00 € / kg',
    description:
      'Unsere Wölkchen sind so luftig und zart wie ihr Name. Die feine Masse aus aufgeschlagenem Ei und hochwertigem Marzipan wird mit reinem Pistazienmark und gerösteten Pistazien verfeinert. Außen leicht gebräunt, innen weich und saftig, ein zarter Genuss mit nussiger Note, der förmlich auf der Zunge schmilzt.',
    shortIngredients: 'Marzipan, Ei, Zucker, Pistazienmark, Pistazien',
    fullIngredients:
      'Marzipan (MANDELN, Zucker, Wasser, Invertzucker), VOLLEI, Zucker, Pistazienpaste (PISTAZIENMARK, Farbstoffe, EIER (SPUR), MILCH (SPUR), SCHALENFRÜCHTE (SPUREN)), Backpulver (Diphosphate, Natriumcarbonat, Calciumcarbonat, Maisstärke), PISTAZIEN',
    allergens: ['Eier', 'Schalenfrüchte (Mandeln, Pistazien)'],
    allergenNote: 'Kann Spuren enthalten: Milch.'
  },
  {
    name: 'Wunderzopf',
    group: 'Stuten & Brioche',
    price: '5,30 €',
    description:
      'Der Wunderzopf ist eine köstliche Brioche-Spezialität, die speziell für das Wochenende kreiert wurde. Diese delikate Leckerei ist mit karamellisierten Mandeln verfeinert und aprikotiert, was ihr ein einzigartiges Aroma verleiht. Jeder Bissen ist ein wahres Geschmackserlebnis, das Ihre Geschmacksknospen verwöhnt. Perfekt geeignet für gemütliche Frühstücke oder als süßer Snack zwischendurch.',
    shortIngredients: 'Brioche-Teig (Weizenmehl, Eigelb, Butter, Zucker), karamellisierte Mandeln',
    fullIngredients:
      'WEIZENMEHL, MANDELN, Wasser, Zucker, EIGELB, BUTTER, Hefe, VOLLMILCHPULVER, Salz, Backmalz (WEIZENMALZMEHL, Guarkernmehl, Natrium-Carboxymethylcellulose, Zucker, WEIZENMALZEXTRAKT, Monocetylweinsäureester v. Monoglyceriden v. Speisefettsäure, WEIZENMEHL, Diphosphate, Calciumphosphate, Dextrose, Aromaextrakte, Ascorbinsäure, Backenzyme)' + BACKMALZ,
    allergens: ['Gluten (Weizen)', 'Eier', 'Milch', 'Schalenfrüchte (Mandeln)'],
    note: 'Wochenend-Spezialität.',
    flour: '100 % Weizen',
    breadType: 'stuten'
  },
  {
    name: 'Zeusstange',
    group: 'Brot',
    price: '4,40 €',
    pricePerKg: '8,80 € / kg',
    weight: '500 g',
    description:
      'Unsere Zeusstange ist eine herzhafte Weizenstange mit würzigem Feta, eingelegter Peperoni und Paprika. Die saftige Krume und die kräftige Füllung machen sie zum unverzichtbaren Begleiter für Grillabende, zur Brotzeit oder als würzige Ergänzung auf dem Abendbrottisch.',
    shortIngredients: 'Weizenmehl, Wasser, Feta, Peperoni, Paprika, Salz, Hefe',
    fullIngredients:
      'WEIZENMEHL, Wasser, Peperoni (Peperoni, Wasser, Branntweinessig, Salz, Zitronensäure, Calciumchlorid), Feta (MILCH, Salz, Buttereikulturen), Paprika (Paprika, Wasser, Zucker, SELLERIE), Salz, Hefe',
    allergens: ['Gluten (Weizen)', 'Milch', 'Sellerie'],
    flour: '100 % Weizen',
    breadType: 'weizen'
  },
  {
    name: 'Zimtsterne',
    group: 'Weihnachtsgebäck',
    price: '4,65 €',
    pricePerKg: '46,50 € / kg',
    description:
      'Unsere Zimtsterne gehören zur Weihnachtszeit einfach dazu. Sie werden einzeln von Hand ausgestochen und bestehen aus einer saftigen Mandel-Haselnuss-Masse mit feinem Zimt. Die leicht knusprige Eiweiß-Zucker-Haube auf der Oberseite sorgt für den typischen Biss und rundet den Geschmack perfekt ab. 100 Gramm sind ca. 7-8 Stück.',
    shortIngredients: 'Mandeln, Haselnüsse, Zucker, Eiweiß-Zucker-Haube, Zimt',
    fullIngredients:
      'Zucker, MANDELN, Wasser, HASELNÜSSE, Eiweißpulver (Zucker, HÜHNEREIWEIßPULVER, Natrium-Carboxymethylcellulose, Johannisbrotkernmehl, Monokaliumphosphat, Salz), Zimt, Zitronenpulver (Reismehl, Zucker, Fruktose, Saflorkonzentrat, Alpha-Tocopherol, MILCH (SPUR), EIER (SPUR), SOJA (SPUREN))',
    allergens: ['Eier', 'Schalenfrüchte (Mandeln, Haselnüsse)'],
    allergenNote: 'Kann Spuren enthalten: Soja, Milch.'
  },
  {
    name: 'Zwiebelstange',
    group: 'Brot',
    price: '3,70 €',
    pricePerKg: '7,40 € / kg',
    weight: '500 g',
    description:
      'Unsere Zwiebelstange bringt kräftiges Aroma auf den Tisch. Der rustikale Roggenmischteig mit Sauerteig wird durch fein geröstete Zwiebeln ergänzt, die dem Brot eine herzhafte Tiefe und eine saftige Krume verleihen.',
    shortIngredients: 'Schwarzwälder-Teig (Roggenmehl 70 %, Weizenmehl 30 %, Sauerteig) mit Röstzwiebeln',
    fullIngredients:
      'Roggenmehl, Wasser, Weizenmehl, Salz, zerkleinertes Roggenmischbrot (Roggenmehl, Weizenmehl, Roggensauer, Salz, Hefe, Weizengrieß, Weizenmalzmehl, Wasser), Hefe, Roggensauer, Weizenmalzmehl, Weizengrieß, Röstzwiebel (Zwiebel, Palmöl, Weizenmehl, Salz)',
    allergens: ['Gluten (Weizen, Roggen)'],
    note: 'Schwarzwälder-Teig mit gerösteten Zwiebeln, als Stange gebacken.',
    flour: '70 % Roggen, 30 % Weizen',
    breadType: 'roggenmisch',
    vegan: true
  }
];