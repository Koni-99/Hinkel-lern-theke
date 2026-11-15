// Daten fürs Allergene-Training (ohne Bildschirm, damit auch Werkzeuge wie tools/stimme/saetze.mjs sie nutzen können)
import { SHOP_PRODUCTS } from '../daten/shopProducts';

type ShopProduct = (typeof SHOP_PRODUCTS)[number];

export type AllergenTest = { id: string; label: string; kein: string; tag: RegExp; ing: RegExp; safeRounds: boolean };

export const ALLERGEN_TESTS: AllergenTest[] = [
  { id: 'milch', label: 'Milch', kein: 'keine Milch', tag: /^milch/i, ing: /milch|butter|sahne|quark|käse|joghurt|molke|laktose|gouda|feta/i, safeRounds: true },
  { id: 'eier', label: 'Eier', kein: 'keine Eier', tag: /^eier?$/i, ing: /\beier?\b|vollei|hühnerei|eigelb|eiweiß|eiklar/i, safeRounds: true },
  { id: 'nuesse', label: 'Nüsse', kein: 'keine Nüsse', tag: /schalenfrüchte|mandel|pistazie|haselnu|walnu/i, ing: /nuss|nüsse|mandel|haselnu|walnu|pistazie|cashew|pekan|macadamia/i, safeRounds: true },
  { id: 'sesam', label: 'Sesam', kein: 'keinen Sesam', tag: /sesam/i, ing: /sesam/i, safeRounds: false },
  { id: 'senf', label: 'Senf', kein: 'keinen Senf', tag: /^senf/i, ing: /senf/i, safeRounds: false },
  { id: 'sellerie', label: 'Sellerie', kein: 'keinen Sellerie', tag: /sellerie/i, ing: /sellerie/i, safeRounds: false },
];

export function splitByAllergen(t: AllergenTest) {
  const withIt: ShopProduct[] = [], without: ShopProduct[] = [];
  SHOP_PRODUCTS.forEach(p => {
    if (p.allergens.length === 0) return; // ohne Angabe im Shop: lieber nicht verwenden
    const tagged = p.allergens.some(a => t.tag.test(a));
    const inIngredients = t.ing.test(p.fullIngredients || '');
    if (tagged) withIt.push(p);
    else if (!inIngredients) without.push(p); // Zutatenliste und Allergene passen nicht zusammen → weglassen
  });
  return { withIt, without };
}

