import CrossRefCard from "./ui/CrossRefCard";

export default function CrossRefTab({ crossRefs, colors }) {
  if (crossRefs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: colors.textDimmed }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⊘</div>
        <div style={{ fontSize: 14 }}>Les analyses croisées s'activent au fur et à mesure de la saisie. Commence par la testostérone, l'insuline, les GGT ou la ferritine pour les premiers insights.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {crossRefs.map((cr, i) => (
        <CrossRefCard key={i} {...cr} colors={colors} />
      ))}
    </div>
  );
}
