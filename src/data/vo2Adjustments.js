export const VO2_MODALITIES = [
  { id: "bike", label: "Vélo", factor: 1.075 },
  { id: "treadmill", label: "Tapis", factor: 1.0 },
  { id: "rower", label: "Rameur", factor: 1.04 },
];

export function getAdjustedVo2(measuredVo2, testModality) {
  const mod = VO2_MODALITIES.find((m) => m.id === testModality);
  if (!mod || mod.id === "treadmill") return { adjusted: measuredVo2, factor: 1.0 };
  const adjusted = Math.round(measuredVo2 * mod.factor * 10) / 10;
  return { adjusted, factor: mod.factor };
}
