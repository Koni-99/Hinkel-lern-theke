// ═══ Karteikarten: Schnittstärken und Allergen-Check ═══
// Vorher mitten in components/FlashcardView.tsx. Der Inhalt ist unverändert übernommen, die Werte kommen als Props.
import { dc } from '../../daten/data';

export type LeitfaedenProps = {

};

export function Leitfaeden({  }: LeitfaedenProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: dc('#ffffff'),
          padding: "22px",
          borderRadius: "18px",
          border: `2px solid ${dc('#F1E3C8')}`,
          boxShadow: "none",
          textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        <h3
          style={{
            margin: "0 0 14px 0",
            color: dc('#2B170A'),
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Offizielle Schnittstärken an der Brotschneidemaschine
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: dc('#FFFBF2'),
              padding: "16px",
              borderRadius: "14px",
              border: `1.5px solid ${dc('#E8A317')}`,
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: dc('#4B2A14'),
              }}
            >
              5,5 mm
            </div>
            <strong style={{ fontSize: "18px", color: dc('#2B170A') }}>
              Alle Schwarzbrote
            </strong>
            <p
              style={{
                fontSize: "16px",
                color: dc('#6B4A30'),
                margin: "6px 0 0 0",
                lineHeight: 1.4,
              }}
            >
              Vollkornschwarzbrot, Sonnenblumenschwarzbrot,
              Kürbiskern-Schwarzbrot, Casanova & Schwarzbrotstangen.
            </p>
          </div>
          <div
            style={{
              backgroundColor: dc('#E1EEDC'),
              padding: "16px",
              borderRadius: "14px",
              border: `1.5px solid ${dc('#2F5D3A')}`,
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: dc('#2F5D3A'),
              }}
            >
              9,0 mm
            </div>
            <strong style={{ fontSize: "18px", color: dc('#2F5D3A') }}>
              Roggen / Roggenmisch, Weizenmisch & Dinkel
            </strong>
            <p
              style={{
                fontSize: "16px",
                color: dc('#6B4A30'),
                margin: "6px 0 0 0",
                lineHeight: 1.4,
              }}
            >
              Roggen & Roggenmisch: Schwarzwälder, Oberländer, Feinbrot,
              Spezialbrot, Harzer, Elsässer, Müslibrot, Mehrkornbrot,
              Schlesisches Bauernbrot, Reines Roggen, Kartäuser &
              Innsbrucker. Weizenmisch: Münsterländer, Schweizer & Feuriges.
              Dinkel: Dinkeltraum & Dinkel-Sprösschen.
            </p>
          </div>
          <div
            style={{
              backgroundColor: dc('#DDE6F7'),
              padding: "16px",
              borderRadius: "14px",
              border: `1.5px solid ${dc('#2F4F8A')}`,
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: dc('#2F4F8A'),
              }}
            >
              12,0 mm
            </div>
            <strong style={{ fontSize: "18px", color: dc('#2F4F8A') }}>
              Stuten & Weizenbrote
            </strong>
            <p
              style={{
                fontSize: "16px",
                color: dc('#6B4A30'),
                margin: "6px 0 0 0",
                lineHeight: 1.4,
              }}
            >
              Mürbestuten, Rosinenstuten, Mandelstuten, Burgunderstuten,
              Jan-Wellem-Stuten, Wochenend-Stuten, Franz. Landbrot,
              Toastbrot & Holzkohlebrot.
            </p>
          </div>
        </div>
      </div>
    
      <div
        style={{
          backgroundColor: dc('#ffffff'),
          padding: "22px",
          borderRadius: "18px",
          border: `2px solid ${dc('#F1E3C8')}`,
          boxShadow: "none",
          textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        <h3
          style={{
            margin: "0 0 14px 0",
            color: dc('#2B170A'),
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          1-Klick Allergen- & Spezial-Check für Kundengespräche
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "17px",
          }}
        >
          <div
            style={{
              backgroundColor: dc('#E1EEDC'),
              padding: "12px 16px",
              borderRadius: "12px",
              border: `1px solid ${dc('#CFE3C9')}`,
            }}
          >
            <strong
              style={{
                color: dc('#2F5D3A'),
                display: "block",
                marginBottom: "4px",
              }}
            >
              100 % Glutenfreie Rezeptur (ohne Weizen/Roggen/Dinkel):
            </strong>
            <span>
              • <strong>Buchweizenbrot</strong> (100% Buchweizenvollkornmehl
              mit Leinsamen & Apfelessig, gebacken Di. & Do., zu kaufen Di. bis Sa.)
              <br />• <strong>Düsselhappen</strong> (Dauergebäck aus
              Haselnüssen, Zucker, Vollei & Zartbitterkuvertüre komplett
              ohne Mehl)
              <br />Achtung: Beim Buchweizenbrot können durch Mehlstaub in der Backstube Spuren von Roggen und Weizen enthalten sein. Bei Zöliakie immer darauf hinweisen.
            </span>
          </div>
          <div
            style={{
              backgroundColor: dc('#FFFBF2'),
              padding: "12px 16px",
              borderRadius: "12px",
              border: `2px solid ${dc('#F1E3C8')}`,
            }}
          >
            <strong
              style={{
                color: dc('#4B2A14'),
                display: "block",
                marginBottom: "4px",
              }}
            >
              Komplett ohne Bäckerhefe gebacken:
            </strong>
            <span>
              • <strong>Reines Roggen</strong> (100 % Roggen, nur mit
              Natursauerteig, gebacken Di. & Do., zu kaufen Di. bis Sa.)
              <br />• <strong>
                Kartäuser & Innsbrucker Roggenlaib
              </strong>{" "}
              (100 % Roggenvollkorn, nur mit Sauerteig)
              <br />• <strong>Abendschnitte</strong> (komplett ohne Mehl &
              ohne Hefe, gebacken Mo., Mi. & Fr., zu kaufen täglich)
              <br />• <strong>Knäckebrot</strong> (Roggenmehl, Saaten &
              Olivenöl)
            </span>
          </div>
          <div
            style={{
              backgroundColor: dc('#DDE6F7'),
              padding: "12px 16px",
              borderRadius: "12px",
              border: `1px solid ${dc('#C9D6EE')}`,
            }}
          >
            <strong
              style={{
                color: dc('#2F4F8A'),
                display: "block",
                marginBottom: "4px",
              }}
            >
              Mit Milchprodukten (Laktose / Milcheiweiß beachten!):
            </strong>
            <span>
              • <strong>Quark im Teig:</strong> Münsterländer, Schweizer,
              Feuriges, Jan-Wellem-Stuten, Quarkbällchen, Quarkschnecke
              <br />• <strong>Butter/Milch/Ei:</strong> Toastbrot, alle
              Stuten & Brioche, Croissants, Monte Christo, Wunderzopf
              <br />• <strong>Käse:</strong> Zeusstange (Feta), Hellasstange
              (Schafskäse), Senfkruste & Käsebrötchen (Gouda),
              Käselaugenstangen, Vesperstangen, Mambolito & Spuntino
            </span>
          </div>
          <div
            style={{
              backgroundColor: dc('#FCE1D2'),
              padding: "12px 16px",
              borderRadius: "12px",
              border: `1px solid ${dc('#F5C6AE')}`,
            }}
          >
            <strong
              style={{
                color: dc('#9A3412'),
                display: "block",
                marginBottom: "4px",
              }}
            >
              Pikante Stangen, Mit vs. Ohne Käse:
            </strong>
            <span>
              • <strong>Feuriges (250 g):</strong> Mit Paprika, Peperoni &
              getrockneten Tomaten, ohne Käse, aber mit Quark im Teig
              <br />• <strong>Zeusstange:</strong> Gefüllt mit Feta-Käse,
              eingelegter Peperoni & Paprika
            </span>
          </div>
          <div
            style={{
              backgroundColor: dc('#FFFBF2'),
              padding: "12px 16px",
              borderRadius: "12px",
              border: `2px solid ${dc('#F1E3C8')}`,
            }}
          >
            <strong
              style={{
                color: dc('#2B170A'),
                display: "block",
                marginBottom: "4px",
              }}
            >
              Mit Düsseldorfer ABB-Senf (Allergen Senf):
            </strong>
            <span>
              • <strong>Senfkrustenbrot</strong> (mit Gouda im Teig) &{" "}
              <strong>Grünschnabel</strong> (Monatsbrot Okt./Nov. mit
              Grünkohl & Mettenden)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
