// ═══ Karteikarten: Fragen-Katalog ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { dc } from '../../daten/data';
import { getRightAnswerText } from '../../hilfen/allgemein';

export type FragenkatalogProps = {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  filteredCards: any[];
};

export function Fragenkatalog({ favorites, toggleFavorite, filteredCards }: FragenkatalogProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {filteredCards.map((item, ci) => (
        <div
          key={item.id}
          className="fc-item"
          style={{
            animationDelay: `${Math.min(ci, 14) * 0.03}s`,
            backgroundColor: dc('#ffffff'),
            padding: "16px 18px",
            borderRadius: "16px",
            border: `2px solid ${dc('#F1E3C8')}`,
            boxShadow: "none",
            textAlign: "left",
            position: "relative",
          }}
        >
          <button
            onClick={() => toggleFavorite(item.id)}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            {favorites.includes(item.id) ? "★" : "☆"}
          </button>
          <span
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: dc('#8A5A00'),
              backgroundColor: dc('#FFF0C2'),
              padding: "3px 10px",
              borderRadius: "999px",
            }}
          >
            {item.category}
          </span>
          <h4
            style={{
              margin: "10px 0 6px 0",
              fontSize: "19px",
              fontWeight: "700",
              color: dc('#2B170A'),
              paddingRight: "28px",
            }}
          >
            {item.question}
          </h4>
          <div
            style={{
              fontSize: "17px",
              fontWeight: "700",
              color: dc('#2F5D3A'),
              marginBottom: "4px",
            }}
          >
            ✓ {getRightAnswerText(item)}
          </div>
          <div
            style={{ fontSize: "16px", color: dc('#6B4A30'), lineHeight: 1.4 }}
          >
            {item.explanation}
          </div>
        </div>
      ))}
    </div>
  );
}
