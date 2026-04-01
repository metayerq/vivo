import { STATUS_LABELS } from "../../data/themes";

export default function CalculatedIndex({ label, value, unit, status, explanation, colors }) {
  const statusColor = colors[status] || colors.empty;
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${statusColor}30`,
      borderRadius: 12, padding: 16, borderLeft: `3px solid ${statusColor}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 4,
          background: statusColor + "20", color: statusColor, fontWeight: 600,
        }}>{STATUS_LABELS[status]}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: statusColor, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: colors.textTertiary, marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6, lineHeight: 1.5 }}>{explanation}</div>
    </div>
  );
}
