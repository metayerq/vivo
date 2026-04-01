export default function CrossRefCard({ title, icon, content, status, colors }) {
  const statusColor = colors[status || "normal"] || colors.normal;
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: 12, padding: 18, borderTop: `2px solid ${statusColor}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</span>
      </div>
      <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.7 }}>{content}</div>
    </div>
  );
}
