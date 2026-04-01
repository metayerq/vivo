import { computeTrainingZones } from "../data/trainingZones";

export default function TrainingZones({ metrics, colors, isDark }) {
  const zones = computeTrainingZones(metrics);
  const totalRange = metrics.hrMax - 0;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Zones d'entraînement
      </div>
      <div style={{
        display: "flex", borderRadius: 8, overflow: "hidden", height: 36,
        border: `1px solid ${colors.border}`,
      }}>
        {zones.map((zone) => {
          const width = ((zone.high - zone.low + 1) / totalRange) * 100;
          const zoneColor = isDark ? zone.color : zone.lightColor;
          return (
            <div
              key={zone.id}
              title={`${zone.name}: ${zone.low}–${zone.high} bpm`}
              style={{
                width: `${width}%`, background: zoneColor + "25",
                borderRight: `1px solid ${colors.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "default", transition: "background 0.2s",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: zoneColor }}>{zone.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", marginTop: 6, gap: 2 }}>
        {zones.map((zone) => {
          const width = ((zone.high - zone.low + 1) / totalRange) * 100;
          const zoneColor = isDark ? zone.color : zone.lightColor;
          return (
            <div key={zone.id} style={{ width: `${width}%`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: colors.textTertiary }}>{zone.low}–{zone.high}</div>
              <div style={{ fontSize: 8, color: zoneColor, fontWeight: 600 }}>{zone.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
