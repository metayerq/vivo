export default function PhysioCard({ label, value, unit, sub, color, colors }) {
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: 12, padding: "16px 18px", minWidth: 150, flex: "1 1 150px",
    }}>
      <div style={{ fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || colors.textHeading, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: colors.textTertiary, marginLeft: 4 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
