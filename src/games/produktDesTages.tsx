// ═══ Produkt des Tages ═══
// Vorher in components/KassenblitzView.tsx. Inhalt unverändert übernommen.
import { SHOP_PRODUCTS } from '../daten/shopProducts';
import { ProductImages } from '../ui/basis';
import { seededShuffle, imgOf } from './spielBasis';
import { ShopProduct } from './BilderQuiz';

// ═════════════════════════ Produkt des Tages ═════════════════════════

/** Jeden Tag ein anderes Produkt, für alle gleich. Saisonware nur in ihrer Zeit. */
export function productOfTheDay(images: ProductImages, date = new Date()): ShopProduct | null {
  const month = date.getMonth();
  const hasImages = Object.keys(images).length > 0;
  const pool = SHOP_PRODUCTS.filter(p => {
    if (['Sonstiges', 'Backmischung'].includes(p.group)) return false;
    if (p.group === 'Weihnachtsgebäck' && month !== 10 && month !== 11) return false;
    if (p.group === 'Saisongebäck' && month !== 10) return false;
    return !hasImages || !!imgOf(images, p);
  });
  if (pool.length === 0) return null;
  const order = seededShuffle(pool, date.getFullYear() * 7 + 3);
  const start = new Date(date.getFullYear(), 0, 1);
  const dayNo = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start.getTime()) / 86400000);
  return order[dayNo % order.length];
}
