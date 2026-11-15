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
        {/* Foto-Raster: Produkte als Bilder nebeneinander, am Handy zwei pro Reihe */}
        <div className="fc-grid lt-foto-raster" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
          {filteredProfiles.map((prod, pi) => {
            const key = `${prod.name}_${prod.ids[0]}`;
            const fav = favorites.includes(prod.ids[0]);
            const bild = images[productImageKey(prod.name)];
            return (
              <button key={key} onClick={() => setOpenProfileKey(key)} aria-label={`Steckbrief ${prod.name}`} className="lt-card fc-item" style={{ animationDelay: `${Math.min(pi, 14) * 0.035}s`, position: "relative", display: "flex", flexDirection: "column", padding: 0, borderRadius: "20px", border: `2px solid ${TH.line}`, backgroundColor: dc('#FFFFFF'), overflow: "hidden", cursor: "pointer", textAlign: "left", color: TH.ink, fontFamily: "inherit" }}>
                {bild ? (
                  <img src={bild} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
                ) : (
                  <span aria-hidden="true" style={{ width: "100%", aspectRatio: "1 / 1", backgroundColor: TH.tintYellow, borderBottom: `4px solid ${groupColor(prod.group)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "54px" }}>
                    {getProductEmoji(prod.name, prod.group)}
                  </span>
                )}
                {fav && <span aria-label="gemerkt" style={{ position: "absolute", top: "8px", right: "8px", width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: dc('#B87A00') }}>★</span>}
                <span style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "10px 12px 12px" }}>
                  <span style={{ fontFamily: TH.serif, fontSize: "19px", lineHeight: 1.15 }}>{prod.name}</span>
                  <span style={{ fontSize: "14px", color: TH.muted }}>{[prod.group, prod.shop?.price].filter(Boolean).join(" · ")}</span>
                  {(prod.shop?.vegan || (prod.shop && prod.shop.allergens.length === 0 && !prod.shop.allergenNote)) && (
                    <span style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {prod.shop?.vegan && <span style={{ fontSize: "13px", fontWeight: 700, padding: "1px 8px", borderRadius: "999px", backgroundColor: TH.tintSage, color: TH.green }}>vegan</span>}
                      {prod.shop && prod.shop.allergens.length === 0 && !prod.shop.allergenNote && <span style={{ fontSize: "13px", fontWeight: 700, padding: "1px 8px", borderRadius: "999px", backgroundColor: TH.tintSage, color: TH.green }}>keine Allergene</span>}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    )
  );
}
