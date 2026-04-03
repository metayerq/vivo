import CalculatedIndex from "./ui/CalculatedIndex";

export default function IndicesTab({ calcs, colors }) {
  if (calcs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: colors.textDimmed }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>∅</div>
        <div style={{ fontSize: 14 }}>Saisis au minimum glycémie + insuline ou triglycérides + HDL pour activer les indices calculés.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))" }}>
      {calcs.map((c, i) => (
        <CalculatedIndex key={i} {...c} colors={colors} />
      ))}
    </div>
  );
}
