export default function PhysioCard({ label, value, unit, sub, color, colors }) {
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: "12px 14px", minWidth: 0, flex: "1 1 140px",
    }}>
      <div style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || colors.textHeading, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}<span style={{ fontSize: 11, fontWeight: 400, color: colors.textTertiary, marginLeft: 3 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 10, color: colors.textTertiary, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
