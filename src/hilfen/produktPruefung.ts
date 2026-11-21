// ═══ Version 275: Produktdaten-Prüfung (Ausbilder → Rückmeldungen → Fehler-Meldungen) ═══
// Sucht Widersprüche in den Produktdaten, bevor jemand im Spiel etwas Falsches lernt:
// Zutat mit Allergen (in den Zutaten GROSS geschrieben) ohne passendes Allergen, Allergen ohne passende Zutat,
// „vegan“ mit Milch/Ei/Honig, fehlender Preis.
import type { ShopProduct } from '../daten/shopProducts';

export type Befund = { name: string; stufe: 'wichtig' | 'pruefen'; text: string };

/** Allergen-Teil (wie in den Daten) → Wörter in den Zutaten, die darauf hinweisen */
const REGELN: { teil: RegExp; label: string; gross: RegExp; klein: RegExp }[] = [
  { teil: /Gluten.*Weizen/, label: 'Gluten (Weizen)', gross: /WEIZEN/, klein: /weizen/i },
  { teil: /Gluten.*Roggen/, label: 'Gluten (Roggen)', gross: /ROGGEN/, klein: /roggen/i },
  { teil: /Gluten.*Gerste/, label: 'Gluten (Gerste)', gross: /GERSTE/, klein: /gerste/i },
  { teil: /Gluten.*Hafer/, label: 'Gluten (Hafer)', gross: /HAFER/, klein: /hafer/i },
  { teil: /Gluten.*Dinkel/, label: 'Gluten (Dinkel)', gross: /DINKEL/, klein: /dinkel/i },
  { teil: /Schalenfrüchte.*Mandel/, label: 'Schalenfrüchte (Mandeln)', gross: /MANDEL/, klein: /mandel/i },
  { teil: /Schalenfrüchte.*Haselnüss/, label: 'Schalenfrüchte (Haselnüsse)', gross: /HASELN/, klein: /haseln/i },
  { teil: /Schalenfrüchte.*Walnüss/, label: 'Schalenfrüchte (Walnüsse)', gross: /WALNUSS|WALNÜSS/, klein: /walnu|walnü/i },
  { teil: /Schalenfrüchte.*Pistazie/, label: 'Schalenfrüchte (Pistazien)', gross: /PISTAZ/, klein: /pistaz/i },
  { teil: /^Milch/, label: 'Milch', gross: /MILCH|BUTTER|SAHNE|QUARK|JOGHURT|KÄSE|MOLKE|LAKTOSE|RAHM/, klein: /milch|butter|sahne|quark|joghurt|käse|molke|laktose|rahm/i },
  { teil: /^Eier/, label: 'Eier', gross: /(^|[^A-ZÄÖÜ])(EIER|EIGELB|EIKLAR|VOLLEI|HÜHNEREI|EIWEI)/, klein: /(^|[^a-zäöü])(ei|eier|eigelb|eiklar|vollei\w*|hühnerei\w*|eiweiß\w*)([^a-zäöü]|$)/i },
  { teil: /^Soja/, label: 'Soja', gross: /SOJA/, klein: /soja/i },
  { teil: /^Sesam/, label: 'Sesam', gross: /SESAM/, klein: /sesam/i },
  { teil: /^Senf/, label: 'Senf', gross: /SENF/, klein: /senf/i },
  { teil: /^Sellerie/, label: 'Sellerie', gross: /SELLERIE/, klein: /sellerie/i },
];

/** „Kann Spuren von … enthalten“ gehört nicht zu den Zutaten */
const ohneSpuren = (t: string) => (t || '')
  .replace(/[A-ZÄÖÜa-zäöüß-]+\s*\((SPUR|SPUREN|Spur|Spuren)\)/g, ' ') // „MILCH (SPUR)“
  .replace(/(kann\s+)?spuren?\s+(von|an)?[^.;]*[.;]?/gi, ' ');

const NICHT_IM_VERKAUF = new Set(['Sonstiges', 'Backmischung']);

export function pruefeProdukte(produkte: ShopProduct[]): Befund[] {
  const out: Befund[] = [];
  for (const p of produkte) {
    // Kakaobutter und Hafermilch sind keine Milch
    const z = ohneSpuren(p.fullIngredients || '').replace(/kakaobutter|hafermilch|kokosmilch|mandelmilch/gi, ' ');
    const all = p.allergens || [];
    const hat = (r: RegExp) => all.some((a) => r.test(a));
    for (const r of REGELN) {
      if (r.gross.test(z) && !hat(r.teil)) out.push({ name: p.name, stufe: 'wichtig', text: `In den Zutaten steht ${(z.match(r.gross) || [''])[0].replace(/^[^A-ZÄÖÜ]+/, '')}, bei den Allergenen fehlt „${r.label}“.` });
      else if (hat(r.teil) && z.trim() && !/folgt/i.test(z) && !r.klein.test(z) && !p.allergenNote) out.push({ name: p.name, stufe: 'pruefen', text: `„${r.label}“ steht bei den Allergenen, in den Zutaten finde ich dazu aber nichts.` });
    }
    if (p.vegan && (hat(/^Milch/) || hat(/^Eier/) || /honig/i.test(z) || /MILCH|BUTTER|SAHNE|QUARK|EIER|EIGELB|VOLLEI/.test(z))) out.push({ name: p.name, stufe: 'wichtig', text: 'Ist als vegan markiert, enthält laut Daten aber Milch, Ei oder Honig.' });
    if (!p.price && !NICHT_IM_VERKAUF.has(p.group)) out.push({ name: p.name, stufe: 'pruefen', text: 'Kein Preis eingetragen. Im Kassenblitz und in Preis-Fragen fehlt das Produkt dann.' });
  }
  return out.sort((a, b) => (a.stufe === b.stufe ? a.name.localeCompare(b.name, 'de') : a.stufe === 'wichtig' ? -1 : 1));
}
