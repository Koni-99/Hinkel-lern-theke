// ═══ Karteikarten: Produkt-Steckbriefe (Liste) ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import type { Dispatch, SetStateAction } from 'react';
import { dc } from '../../daten/data';
import { TH, cardStyle, productImageKey, ProductImages } from '../../ui/basis';
import { groupColor, getProductEmoji, Profile } from './daten';

export type SteckbriefListeProps = {
  favorites: number[];
  images: ProductImages;
  setOpenProfileKey: Dispatch<SetStateAction<string | null>>;
  filteredProfiles: Profile[];
};

export function SteckbriefListe({ favorites, images, setOpenProfileKey, filteredProfiles }: SteckbriefListeProps) {
  return (
    filteredProfiles.length === 0 ? (
      <div style={{ ...cardStyle, width: "100%", textAlign: "center" }}>
        <p style={{ color: TH.muted, fontSize: "18px", margin: 0 }}>Kein passender Steckbrief gefunden.</p>
      </div>
    ) : (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontSize: "17px", color: TH.muted, textAlign: "left" }}>
          {(() => { const extra = filteredProfiles.filter((p: any) => ['Sonstiges', 'Backmischung'].includes(p.shop?.group || p.group)).length; const prod = filteredProfiles.length - extra; return `${prod} ${prod === 1 ? 'Produkt' : 'Produkte'}${extra ? ` und ${extra} ${extra === 1 ? 'Backmischung oder Sonstiges' : 'Backmischungen und Sonstiges'}` : ''}, tippe auf einen Steckbrief für alle Infos.`; })()}
        </div>
        <div className="fc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
          {filteredProfiles.map((prod, pi) => {
            const key = `${prod.name}_${prod.ids[0]}`;
            const fav = favorites.includes(prod.ids[0]);
            const sub = [prod.group, prod.shop?.price].filter(Boolean).join(" · ");
            return (
              <button key={key} onClick={() => setOpenProfileKey(key)} className="lt-card fc-item" style={{ animationDelay: `${Math.min(pi, 14) * 0.035}s`, display: "flex", alignItems: "center", gap: "14px", minHeight: "84px", padding: "12px 16px", borderRadius: "20px", border: `2px solid ${TH.line}`, borderLeft: `8px solid ${groupColor(prod.shop?.group || prod.group)}`, backgroundColor: TH.white, color: TH.ink, textAlign: "left", cursor: "pointer" }}>
                {images[productImageKey(prod.name)] ? (
                  <img src={images[productImageKey(prod.name)]} alt="" style={{ flex: "0 0 64px", width: "64px", height: "64px", objectFit: "cover", borderRadius: "16px" }} />
                ) : (
                  <span aria-hidden="true" style={{ flex: "0 0 56px", height: "56px", borderRadius: "16px", backgroundColor: TH.tintYellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>
                    {getProductEmoji(prod.name, prod.group)}
                  </span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: TH.serif, fontSize: "23px", lineHeight: 1.15 }}>{prod.name}</span>
                  <span style={{ display: "block", fontSize: "16px", color: TH.muted, marginTop: "2px" }}>{sub}</span>
                  <span style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {prod.slice && <span style={{ fontSize: "14px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", backgroundColor: TH.cream, border: `1px solid ${TH.line}` }}>Schnitt {prod.slice}</span>}
                    {prod.shop?.vegan && <span style={{ fontSize: "14px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", backgroundColor: TH.tintSage, color: TH.green }}>vegan</span>}
                    {prod.shop && prod.shop.allergens.length === 0 && !prod.shop.allergenNote && <span style={{ fontSize: "14px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", backgroundColor: TH.tintSage, color: TH.green }}>keine Allergene</span>}
                  </span>
                </span>
                {fav && <span aria-label="gemerkt" style={{ fontSize: "22px", color: dc('#B87A00') }}>★</span>}
                <span aria-hidden="true" style={{ fontSize: "22px", color: TH.muted }}>›</span>
              </button>
            );
          })}
        </div>
      </div>
    )
  );
}
