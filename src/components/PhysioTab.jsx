import PhysioCard from "./ui/PhysioCard";
import PillToggle from "./ui/PillToggle";
import TrainingZones from "./TrainingZones";
import { VO2_MODALITIES, getAdjustedVo2 } from "../data/vo2Adjustments";

export default function PhysioTab({ profile, colors, isDark, modality, setModality }) {
  const p = profile.metrics;
  const { adjusted, factor } = getAdjustedVo2(p.vo2max, modality);
  const modLabel = VO2_MODALITIES.find((m) => m.id === modality)?.label || "Vélo";

  return (
    <div>
      <div style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 16, letterSpacing: 0.5 }}>
        SOURCE: {profile.source} — {profile.date}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Composition corporelle</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <PhysioCard label="% MG (4-C)" value={p.bodyFatPct4C} unit="%" sub="Réf. Wang — objectif 18%" color={colors.normal} colors={colors} />
          <PhysioCard label="% MG (DEXA)" value={p.bodyFatPctDEXA} unit="%" sub="Surestim. connue vs 4-C" colors={colors} />
          <PhysioCard label="IMM" value={p.leanMassIndex} unit="kg/m²" sub="Bas-normal" color={colors.normal} colors={colors} />
          <PhysioCard label="ALMI" value={p.almi} unit="kg/m²" sub="Normal" color={colors.optimal} colors={colors} />
          <PhysioCard label="SMM" value={p.skeletalMuscleMass} unit="kg" sub="InBody — haut de la norme" color={colors.optimal} colors={colors} />
          <PhysioCard label="G. viscérale" value={p.visceralFatVolume} unit="cm³" sub="Normale" color={colors.optimal} colors={colors} />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Métabolisme de repos</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <PhysioCard label="REE mesuré" value={p.ree} unit="kcal/j" sub="-1% du prédit (H-B)" color={colors.optimal} colors={colors} />
          <PhysioCard label="RQ repos" value={p.rq} unit="" sub="Oxydation lipidique dominante" color={colors.optimal} colors={colors} />
          <PhysioCard label="FAT %" value={p.fatOxPct} unit="%" sub="Substrat lipidique au repos" color={colors.optimal} colors={colors} />
          <PhysioCard label="CHO %" value={p.choOxPct} unit="%" sub="Glucidique résiduel" colors={colors} />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Aptitude cardiorespiratoire</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {/* VO2max expanded card */}
          <div style={{
            background: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: 10, padding: "12px 14px", minWidth: 0, flex: "1 1 100%",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 0.5, textTransform: "uppercase" }}>VO₂max</span>
              <PillToggle
                options={VO2_MODALITIES}
                value={modality}
                onChange={setModality}
                colors={colors}
              />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.optimal, fontFamily: "'JetBrains Mono', monospace" }}>
              {p.vo2max}<span style={{ fontSize: 11, fontWeight: 400, color: colors.textTertiary, marginLeft: 3 }}>mL/kg/min</span>
              <span style={{ fontSize: 10, fontWeight: 400, color: colors.textTertiary, marginLeft: 6 }}>mesuré ({modLabel})</span>
            </div>
            {modality !== "treadmill" && (
              <div style={{ fontSize: 18, fontWeight: 600, color: colors.accent, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                {adjusted}<span style={{ fontSize: 12, fontWeight: 400, color: colors.textTertiary, marginLeft: 4 }}>mL/kg/min</span>
                <span style={{ fontSize: 11, fontWeight: 400, color: colors.textSecondary, marginLeft: 8 }}>estimé tapis (+{((factor - 1) * 100).toFixed(1)}%)</span>
              </div>
            )}
            <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: 6 }}>Sup. moyenne — P60 pour {p.chronoAge} ans</div>
          </div>

          <PhysioCard label="FATmax" value={p.fatmax} unit="g/h" sub={`@ ${p.fatmaxHR} bpm`} color={colors.optimal} colors={colors} />
          <PhysioCard label="VT1" value={p.vt1HR} unit="bpm" sub={`${p.vt1Power}W — plafond Z2`} colors={colors} />
          <PhysioCard label="FC repos" value={p.hrRest} unit="bpm" sub="Normale" color={colors.optimal} colors={colors} />
          <PhysioCard label="HRR₁" value={p.hrr1} unit="bpm" sub="Normal, optimisable" color={colors.normal} colors={colors} />
          <PhysioCard label="RMSSD" value={p.rmssd} unit="ms" sub="Bon — tonus vagal OK" color={colors.optimal} colors={colors} />
        </div>

        <TrainingZones metrics={p} colors={colors} isDark={isDark} />
      </div>

      <div style={{
        background: colors.accentSubtle, border: `1px solid ${colors.accentStrongBorder}`,
        borderRadius: 12, padding: 16, marginTop: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 40, fontWeight: 700, color: colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{p.metaScore}</span>
            <span style={{ fontSize: 14, color: colors.textTertiary }}>/100</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>Score MetaClinic — Très bon</div>
            <div style={{ fontSize: 12, color: colors.textSecondary }}>Âge biologique: {p.bioAge} ans (chrono: {p.chronoAge}) · Projection 6 mois: 91</div>
          </div>
        </div>
      </div>
    </div>
  );
}
