import { useMemo } from "react";
import RadarChart from "./RadarChart";
import { BLOOD_CATEGORIES } from "../data/bloodCategories";
import { getStatus } from "../utils/statusHelpers";

export default function SynthesisTab({ values, calcs, crossRefs, compositeScores, projections, filledCount, totalMarkers, colors }) {
  const radarData = useMemo(() => {
    const cats = [
      { label: "Glucides", markers: ["glucose", "hba1c", "insulin"] },
      { label: "Lipides", markers: ["cholTotal", "hdl", "ldl", "triglycerides"] },
      { label: "Foie", markers: ["alt", "ast", "ggt"] },
      { label: "Reins", markers: ["urea", "creatinine"] },
      { label: "Hormones", markers: ["testosterone", "tsh"] },
      { label: "Fer/Vit", markers: ["iron", "ferritin", "vitD"] },
      { label: "Inflam.", markers: ["crp", "vs"] },
      { label: "Ions", markers: ["sodium", "potassium", "chloride"] },
    ];
    return cats.map((cat) => {
      const filledMarkers = cat.markers.filter((m) => values[m] && values[m] !== "");
      if (filledMarkers.length === 0) return { label: cat.label, value: 0 };
      const scores = filledMarkers.map((m) => {
        const marker = BLOOD_CATEGORIES.flatMap((c) => c.markers).find((mk) => mk.id === m);
        if (!marker) return 50;
        const s = getStatus(values[m], marker);
        return s === "optimal" ? 90 : s === "normal" ? 60 : 25;
      });
      return { label: cat.label, value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) };
    });
  }, [values]);

  const globalScore = useMemo(() => {
    const filled = radarData.filter((d) => d.value > 0);
    if (filled.length === 0) return null;
    return Math.round(filled.reduce((a, b) => a + b.value, 0) / filled.length);
  }, [radarData]);

  if (filledCount < 5) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: colors.textDimmed }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>◌</div>
        <div style={{ fontSize: 14 }}>Renseigne au minimum 5 marqueurs pour une première vue d'ensemble.</div>
      </div>
    );
  }

  const markerLabels = {};
  BLOOD_CATEGORIES.forEach(c => c.markers.forEach(m => { markerLabels[m.id] = m.label; }));

  return (
    <div>
      {/* Radar + Global Score */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginBottom: 32 }}>
        <RadarChart data={radarData} colors={colors} />
        <div style={{ flex: 1, minWidth: 200 }}>
          {globalScore && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Score Biomarqueurs</div>
              <div style={{
                fontSize: 48, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: globalScore >= 70 ? colors.optimal : globalScore >= 40 ? colors.normal : colors.flag,
              }}>
                {globalScore}<span style={{ fontSize: 18, color: colors.textTertiary }}>/100</span>
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.6 }}>
            Score MetaClinic physio: <strong style={{ color: colors.accent }}>84/100</strong><br />
            Marqueurs renseignés: <strong style={{ color: colors.text }}>{filledCount}/{totalMarkers}</strong><br />
            Indices calculés: <strong style={{ color: colors.text }}>{calcs.length}</strong><br />
            Analyses croisées: <strong style={{ color: colors.text }}>{crossRefs.length}</strong>
          </div>
        </div>
      </div>

      {/* Composite Scores */}
      {compositeScores.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Scores Composites</div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", marginBottom: 28 }}>
            {compositeScores.map((sc) => (
              <CompositeScoreCard key={sc.id} score={sc} colors={colors} />
            ))}
          </div>
        </>
      )}

      {/* Key Signals */}
      <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Signaux clés</div>
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        {crossRefs.filter(r => r.status === "flag").length > 0 ? (
          crossRefs.filter(r => r.status === "flag").map((r, i) => (
            <div key={i} style={{
              padding: "12px 16px", borderRadius: 8,
              background: colors.flagBg, borderLeft: `3px solid ${colors.flag}`,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: colors.flag }}>⚠ {r.title}</span>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{r.content}</div>
            </div>
          ))
        ) : crossRefs.length > 0 ? (
          <div style={{
            padding: "12px 16px", borderRadius: 8,
            background: colors.optimalBg, borderLeft: `3px solid ${colors.optimal}`,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.optimal }}>✓ Aucun signal d'alerte détecté</span>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Tous les croisements biomarqueurs × profil physiologique sont cohérents. Profil favorable pour la recomposition corporelle.
            </div>
          </div>
        ) : null}
      </div>

      {/* Projections */}
      {projections.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Tendances (basées sur l'historique)</div>
          <div style={{ display: "grid", gap: 6, marginBottom: 24 }}>
            {projections.map((proj) => {
              const label = markerLabels[proj.markerId] || proj.markerId;
              const arrow = proj.trend === "up" ? "↑" : "↓";
              const arrowColor = proj.trend === "up" ? colors.flag : colors.optimal;
              return (
                <div key={proj.markerId} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                  background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8,
                }}>
                  <span style={{ fontSize: 14, color: arrowColor }}>{arrow}</span>
                  <span style={{ fontSize: 12, color: colors.text, flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 11, color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace" }}>
                    {proj.currentValue} → {proj.projectedValue}
                  </span>
                  <span style={{ fontSize: 10, color: colors.textDimmed }}>
                    ({proj.dataPoints} pts)
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Recommendations */}
      <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Recommandations contextualisées</div>
      <div style={{
        background: colors.surface, border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: 18, fontSize: 13, color: colors.textSecondary, lineHeight: 1.8,
      }}>
        {crossRefs.length > 0 ? (
          <>
            Les recommandations intègrent tes résultats sanguins avec ton profil MetaClinic (score 84, âge bio 33 ans) et ton objectif de recomposition vers 18% de masse grasse.
            <br /><br />
            {crossRefs.filter(r => r.status === "flag").map((r, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <strong style={{ color: colors.normal }}>→ {r.title}:</strong> Action prioritaire. Voir l'analyse croisée.
              </div>
            ))}
            {crossRefs.filter(r => r.status === "optimal").length > 0 && (
              <div style={{ marginTop: 8, color: colors.textSecondary }}>
                <strong style={{ color: colors.optimal }}>Points forts confirmés:</strong>{" "}
                {crossRefs.filter(r => r.status === "optimal").map(r => r.title).join(", ")}.
              </div>
            )}
          </>
        ) : (
          "Continue à renseigner tes résultats pour générer des recommandations personnalisées."
        )}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: 24, padding: 14, background: colors.surface,
        borderRadius: 8, border: `1px solid ${colors.borderAccent}`,
        fontSize: 10, color: colors.textDimmed, lineHeight: 1.6,
      }}>
        <strong>Disclaimer:</strong> VIVO fournit une aide à l'interprétation et ne remplace pas un avis médical. Les indices calculés et analyses croisées sont basés sur la littérature scientifique récente mais doivent être interprétés par un professionnel de santé dans le contexte clinique complet.
      </div>
    </div>
  );
}

function CompositeScoreCard({ score, colors }) {
  const statusColor = colors[score.status] || colors.normal;
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: 12, padding: 18, borderTop: `3px solid ${statusColor}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{score.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, flex: 1 }}>{score.label}</span>
        <span style={{
          fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
          color: statusColor,
        }}>
          {score.score}<span style={{ fontSize: 12, color: colors.textTertiary }}>/100</span>
        </span>
      </div>

      {/* Sub-scores bars */}
      <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        {score.subsScores.map((sub) => (
          <div key={sub.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: colors.textTertiary, width: 75, flexShrink: 0 }}>{sub.label}</span>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: colors.borderMedium, position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 2,
                width: `${sub.value}%`,
                background: sub.value >= 70 ? colors.optimal : sub.value >= 40 ? colors.normal : colors.flag,
                transition: "width 0.3s",
              }} />
            </div>
            <span style={{ fontSize: 9, color: colors.textDimmed, fontFamily: "'JetBrains Mono', monospace", width: 90, textAlign: "right", flexShrink: 0 }}>
              {sub.detail}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.6 }}>{score.explanation}</div>
    </div>
  );
}
