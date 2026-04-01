export default function TabButton({ active, label, onClick, count, colors }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 16px", fontSize: 12, fontWeight: active ? 700 : 500,
      color: active ? colors.accent : colors.textTertiary,
      background: active ? colors.accentBg : "transparent",
      border: active ? `1px solid ${colors.accentBorder}` : "1px solid transparent",
      borderRadius: 8, cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase",
      letterSpacing: 0.8, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
    }}>
      {label}
      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: 10, background: colors.badgeBg, color: colors.badgeText, borderRadius: 10,
          padding: "1px 6px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        }}>{count}</span>
      )}
    </button>
  );
}
