export default function Sparkline({ points, optLow, optHigh, colors }) {
  if (!points || points.length < 2) return null;

  const w = 80, h = 28, pad = 3;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals, optLow) * 0.95;
  const max = Math.max(...vals, optHigh) * 1.05;
  const range = max - min || 1;

  const toX = (i) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const toY = (v) => h - pad - ((v - min) / range) * (h - pad * 2);

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(" ");

  const optY1 = toY(optHigh);
  const optY2 = toY(optLow);

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const trending = last.value > prev.value ? "up" : last.value < prev.value ? "down" : "flat";

  return (
    <div style={{ position: "relative", cursor: "default" }} title={points.map((p) => `${p.label}: ${p.value}`).join(" → ")}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        {/* Optimal zone band */}
        <rect x={pad} y={Math.min(optY1, optY2)} width={w - pad * 2} height={Math.abs(optY2 - optY1)} fill={colors.optimal + "15"} rx={2} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={colors.accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          const inOpt = p.value >= optLow && p.value <= optHigh;
          return (
            <circle key={i} cx={toX(i)} cy={toY(p.value)} r={isLast ? 3 : 1.5}
              fill={isLast ? (inOpt ? colors.optimal : colors.flag) : colors.textTertiary} />
          );
        })}
      </svg>
    </div>
  );
}
