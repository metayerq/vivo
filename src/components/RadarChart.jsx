export default function RadarChart({ data, colors }) {
  const cx = 140, cy = 140, r = 110;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const polygonPoints = data.map((d, i) => {
    const p = getPoint(i, d.value);
    return `${p.x},${p.y}`;
  }).join(" ");

  const gridLevels = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 280 280" style={{ width: "100%", maxWidth: 280 }}>
      {gridLevels.map(level => {
        const pts = data.map((_, i) => {
          const p = getPoint(i, level);
          return `${p.x},${p.y}`;
        }).join(" ");
        return <polygon key={level} points={pts} fill="none" stroke={colors.border} strokeWidth={1} />;
      })}
      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={colors.border} strokeWidth={1} />;
      })}
      <polygon points={polygonPoints} fill={colors.accent + "25"} stroke={colors.accent} strokeWidth={2} />
      {data.map((d, i) => {
        const p = getPoint(i, d.value);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={d.value >= 70 ? colors.optimal : d.value >= 40 ? colors.normal : colors.flag} />;
      })}
      {data.map((d, i) => {
        const p = getPoint(i, 115);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 9, fill: colors.textSecondary }}>
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
