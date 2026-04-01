export function computeTrainingZones(metrics) {
  const { fatmaxHR, vt1HR, hrMax } = metrics;
  const z3Top = Math.round(hrMax * 0.87);
  const z4Top = Math.round(hrMax * 0.95);
  return [
    { id: "z1", label: "Z1", name: "Récupération", low: 0, high: fatmaxHR - 1, color: "#94a3b8", lightColor: "#A8A29E" },
    { id: "z2", label: "Z2", name: "Endurance", low: fatmaxHR, high: vt1HR, color: "#14b8a6", lightColor: "#0F766E" },
    { id: "z3", label: "Z3", name: "Tempo", low: vt1HR + 1, high: z3Top, color: "#f59e0b", lightColor: "#D97706" },
    { id: "z4", label: "Z4", name: "Seuil", low: z3Top + 1, high: z4Top, color: "#f97316", lightColor: "#EA580C" },
    { id: "z5", label: "Z5", name: "VO₂max", low: z4Top + 1, high: hrMax, color: "#ef4444", lightColor: "#DC2626" },
  ];
}
