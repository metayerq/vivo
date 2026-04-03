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
      display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
      borderBottom: `1px solid ${colors.borderAccent}`,
    }}>
      <StatusDot status={status} colors={colors} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: colors.text, display: "flex", alignItems: "center", gap: 6 }}>
          {marker.label}
          {marker.extra && <span style={{ fontSize: 9, background: colors.extraBadgeBg, color: colors.extraBadgeText, padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>AJOUTÉ</span>}
          {pct && (
            <span style={{
              fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              color: pct.percentile <= 25 || pct.percentile >= 75 ? colors.textSecondary : colors.textTertiary,
              background: colors.inputBg, padding: "1px 5px", borderRadius: 3,
            }}>
              {pct.label}
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, color: colors.textDimmed }}>
          Réf: {marker.low}–{marker.high} {marker.unit} · Optimal: {marker.optLow}–{marker.optHigh}
        </div>
        {pct && (
          <div style={{ marginTop: 3, height: 3, borderRadius: 2, background: colors.borderMedium, position: "relative", maxWidth: 120 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 2,
              width: `${pct.percentile}%`,
              background: status === "optimal" ? colors.optimal : status === "normal" ? colors.normal : colors.flag,
              transition: "width 0.3s",
            }} />
          </div>
        )}
      </div>
      {historicalPoints && historicalPoints.length >= 2 && (
        <Sparkline points={historicalPoints} optLow={marker.optLow} optHigh={marker.optHigh} colors={colors} />
      )}
      <input
        type="number"
        step="any"
        value={value || ""}
        onChange={(e) => onChange(marker.id, e.target.value)}
        placeholder="—"
        style={{
          width: 80, padding: "6px 8px",
          background: hasValue ? colors.inputBg : colors.inputBgEmpty,
          border: `1px solid ${hasValue ? statusColor + "60" : colors.borderMedium}`,
          borderRadius: 6, color: colors.textHeading, fontSize: 14, textAlign: "right",
          fontFamily: "'JetBrains Mono', monospace", outline: "none",
        }}
      />
      <span style={{ fontSize: 11, color: colors.textTertiary, width: 50 }}>{marker.unit}</span>
    </div>
  );
}
