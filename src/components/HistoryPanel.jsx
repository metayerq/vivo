import { useState } from "react";
import { BLOOD_CATEGORIES } from "../data/bloodCategories";
import { getStatus } from "../utils/statusHelpers";

export default function HistoryPanel({ open, onClose, history, onSave, onLoad, onDelete, currentValues, colors }) {
  const [compareIdx, setCompareIdx] = useState(null);

  if (!open) return null;

  const allMarkers = BLOOD_CATEGORIES.flatMap((c) => c.markers);

  const compareEntry = compareIdx !== null ? history[compareIdx] : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: colors.settingsOverlay,
        zIndex: 1000, display: "flex", justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480, maxWidth: "95vw", height: "100%",
          background: colors.settingsBg, borderLeft: `1px solid ${colors.border}`,
          padding: 28, overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: colors.text, letterSpacing: 1 }}>HISTORIQUE</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: colors.textTertiary,
            fontSize: 20, cursor: "pointer", padding: 4,
          }}>✕</button>
        </div>

        <button
          onClick={onSave}
          style={{
            width: "100%", padding: "10px 0", background: colors.accentBg,
            color: colors.accent, border: `1px solid ${colors.accentBorder}`,
            borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 24,
          }}
        >
          Sauvegarder le bilan actuel
        </button>

        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: colors.textDimmed }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13 }}>Aucun bilan sauvegardé. Sauvegarde ton bilan actuel pour commencer le suivi.</div>
          </div>
        ) : (
          <div>
            {history.map((entry, idx) => {
              const filledCount = Object.values(entry.values).filter((v) => v !== "" && v !== undefined).length;
              const isComparing = compareIdx === idx;
              return (
                <div key={idx} style={{
                  padding: 14, borderRadius: 10, marginBottom: 8,
                  background: isComparing ? colors.accentBg : colors.surface,
                  border: `1px solid ${isComparing ? colors.accentBorder : colors.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{entry.date}</span>
                    <span style={{ fontSize: 11, color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace" }}>
                      {filledCount} marqueurs
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <MiniButton label="Charger" onClick={() => onLoad(idx)} colors={colors} />
                    <MiniButton
                      label={isComparing ? "Fermer" : "Comparer"}
                      onClick={() => setCompareIdx(isComparing ? null : idx)}
                      colors={colors}
                      active={isComparing}
                    />
                    <MiniButton label="Supprimer" onClick={() => { onDelete(idx); if (compareIdx === idx) setCompareIdx(null); }} colors={colors} danger />
                  </div>

                  {isComparing && (
                    <div style={{ marginTop: 12, borderTop: `1px solid ${colors.border}`, paddingTop: 10 }}>
                      <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Comparaison vs bilan actuel
                      </div>
                      {allMarkers.map((marker) => {
                        const oldVal = parseFloat(entry.values[marker.id]);
                        const newVal = parseFloat(currentValues[marker.id]);
                        if (isNaN(oldVal) && isNaN(newVal)) return null;
                        const diff = !isNaN(oldVal) && !isNaN(newVal) ? newVal - oldVal : null;
                        const oldStatus = getStatus(entry.values[marker.id], marker);
                        const newStatus = getStatus(currentValues[marker.id], marker);
                        const improved = newStatus === "optimal" && oldStatus !== "optimal";
                        const worsened = newStatus === "flag" && oldStatus !== "flag";
                        if (diff === null || Math.abs(diff) < 0.001) return null;
                        return (
                          <div key={marker.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "4px 0", fontSize: 12,
                          }}>
                            <span style={{ color: colors.textSecondary, flex: 1 }}>{marker.label}</span>
                            <span style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", width: 55, textAlign: "right" }}>
                              {isNaN(oldVal) ? "—" : oldVal}
                            </span>
                            <span style={{
                              width: 30, textAlign: "center", fontSize: 14,
                              color: improved ? colors.optimal : worsened ? colors.flag : colors.textTertiary,
                            }}>
                              {diff > 0 ? "↑" : "↓"}
                            </span>
                            <span style={{
                              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, width: 55, textAlign: "right",
                              color: improved ? colors.optimal : worsened ? colors.flag : colors.text,
                            }}>
                              {isNaN(newVal) ? "—" : newVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniButton({ label, onClick, colors, danger, active }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 10px", fontSize: 10, fontWeight: 600, borderRadius: 4, cursor: "pointer",
      background: danger ? colors.flag + "15" : active ? colors.accentBg : "transparent",
      color: danger ? colors.flag : active ? colors.accent : colors.textTertiary,
      border: `1px solid ${danger ? colors.flag + "30" : active ? colors.accentBorder : colors.border}`,
      textTransform: "uppercase", letterSpacing: 0.3,
    }}>
      {label}
    </button>
  );
}
