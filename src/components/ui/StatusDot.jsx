export default function StatusDot({ status, colors }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      backgroundColor: colors[status] || colors.empty, marginRight: 6, flexShrink: 0,
    }} />
  );
}
