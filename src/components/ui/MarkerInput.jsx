import { getStatus } from "../../utils/statusHelpers";
import { getPercentile } from "../../utils/calculations";
import StatusDot from "./StatusDot";
import Sparkline from "./Sparkline";

export default function MarkerInput({ marker, value, onChange, colors, historicalPoints }) {
  const status = getStatus(value, marker);
  const hasValue = value !== "" && value !== undefined;
  const statusColor = colors[status] || colors.empty;
  const pct = hasValue ? getPercentile(marker.id, value) : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 0",
      borderBottom: `1px solid ${colors.borderAccent}`,
      flexWrap: "wrap",
    }}>
      <StatusDot status={status} colors={colors} />
      <div style={{ flex: "1 1 120px", minWidth: 0 }}>
        <div style={{ fontSize: 12, color: colors.text, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          <span style={{ whiteSpace: "nowrap" }}>{marker.label}</span>
          {marker.extra && <span style={{ fontSize: 8, background: colors.extraBadgeBg, color: colors.extraBadgeText, padding: "1px 4px", borderRadius: 3, fontWeight: 700 }}>AJOUTÉ</span>}
          {pct && (
            <span style={{
              fontSize: 8, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              color: colors.textTertiary, background: colors.inputBg, padding: "1px 4px", borderRadius: 3,
            }}>{pct.label}</span>
          )}
        </div>
        <div style={{ fontSize: 9, color: colors.textDimmed, marginTop: 1 }}>
          {marker.optLow}–{marker.optHigh} {marker.unit}
        </div>
        {pct && (
          <div style={{ marginTop: 2, height: 2, borderRadius: 1, background: colors.borderMedium, position: "relative", maxWidth: 100 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 1,
              width: `${pct.percentile}%`,
              background: status === "optimal" ? colors.optimal : status === "normal" ? colors.normal : colors.flag,
            }} />
          </div>
        )}
      </div>
      {historicalPoints && historicalPoints.length >= 2 && (
        <Sparkline points={historicalPoints} optLow={marker.optLow} optHigh={marker.optHigh} colors={colors} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <input
          type="number"
          step="any"
          value={value || ""}
          onChange={(e) => onChange(marker.id, e.target.value)}
          placeholder="—"
          style={{
            width: 65, padding: "5px 6px",
            background: hasValue ? colors.inputBg : colors.inputBgEmpty,
            border: `1px solid ${hasValue ? statusColor + "60" : colors.borderMedium}`,
            borderRadius: 5, color: colors.textHeading, fontSize: 13, textAlign: "right",
            fontFamily: "'JetBrains Mono', monospace", outline: "none",
          }}
        />
        <span style={{ fontSize: 9, color: colors.textTertiary, width: 40 }}>{marker.unit}</span>
      </div>
    </div>
  );
}
