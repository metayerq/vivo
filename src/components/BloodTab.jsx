import { useState } from "react";
import { BLOOD_CATEGORIES } from "../data/bloodCategories";
import MarkerInput from "./ui/MarkerInput";

export default function BloodTab({ values, onChange, filledCount, totalMarkers, colors }) {
  const [expandedCat, setExpandedCat] = useState(null);

  return (
    <div>
      <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>
        Saisis tes résultats par catégorie. Les indices dérivés et analyses croisées se calculent automatiquement.
        <span style={{ color: colors.accent, fontWeight: 600 }}> {filledCount}/{totalMarkers} marqueurs renseignés.</span>
      </div>
      {BLOOD_CATEGORIES.map((cat) => {
        const isExpanded = expandedCat === cat.id;
        const catFilled = cat.markers.filter((m) => values[m.id] && values[m.id] !== "").length;
        return (
          <div key={cat.id} style={{
            marginBottom: 8, borderRadius: 12, overflow: "hidden",
            border: `1px solid ${colors.border}`, background: colors.surface,
          }}>
            <button onClick={() => setExpandedCat(isExpanded ? null : cat.id)} style={{
              width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10,
              background: "transparent", border: "none", cursor: "pointer", color: colors.text,
            }}>
              <span style={{ fontSize: 16, color: cat.color }}>{cat.icon}</span>
              <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600 }}>{cat.label}</span>
              <span style={{
                fontSize: 11, color: catFilled > 0 ? colors.optimal : colors.textDimmed,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{catFilled}/{cat.markers.length}</span>
              <span style={{ color: colors.textTertiary, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
            </button>
            {isExpanded && (
              <div style={{ padding: "0 18px 14px" }}>
                {cat.markers.map((m) => (
                  <MarkerInput key={m.id} marker={m} value={values[m.id]} onChange={onChange} colors={colors} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
