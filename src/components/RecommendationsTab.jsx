import { useMemo } from "react";
import { computeRecommendations } from "../utils/recommendations";

export default function RecommendationsTab({ values, colors, mode }) {
  const recs = useMemo(() => computeRecommendations(values, mode), [values, mode]);

  return (
    <div>
      {/* Priorities */}
      {recs.priorities.length > 0 && (
        <Section title="Priorités d'action" colors={colors}>
          <div style={{ display: "grid", gap: 10 }}>
            {recs.priorities.map((p, i) => (
              <div key={i} style={{
                padding: "16px 18px", borderRadius: 10,
                background: p.severity === "critical" ? colors.flagBg : colors.surface,
                border: `1px solid ${p.severity === "critical" ? colors.flag + "40" : colors.border}`,
                borderLeft: `4px solid ${p.severity === "critical" ? colors.flag : p.severity === "high" ? colors.normal : colors.textTertiary}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{p.title}</span>
                </div>
                <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.7 }}>{p.content}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths */}
      {recs.strengths.length > 0 && (
        <Section title="Points forts à maintenir" colors={colors}>
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))" }}>
            {recs.strengths.map((s, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 8,
                background: colors.optimalBg, border: `1px solid ${colors.optimal}30`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.optimal }}>{s.title}</span>
                </div>
                <div style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 1.5 }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Nutrition */}
      <Section title="Alimentation" colors={colors}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
          <NutritionColumn title="Privilégier" icon="✅" items={recs.nutrition.favor} colors={colors} type="favor" />
          <NutritionColumn title="Réduire" icon="⚠" items={recs.nutrition.reduce} colors={colors} type="reduce" />
          <NutritionColumn title="Éviter" icon="🚫" items={recs.nutrition.avoid} colors={colors} type="avoid" />
        </div>
      </Section>

      {/* Training */}
      <Section title="Entraînement" colors={colors}>
        <div style={{ display: "grid", gap: 12 }}>
          {recs.training.map((tr, i) => (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 10,
              background: colors.surface, border: `1px solid ${colors.border}`,
              borderTop: `2px solid ${tr.priority === "critical" ? colors.accent : tr.priority === "high" ? colors.normal : colors.textTertiary}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{tr.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.text, textTransform: "uppercase", letterSpacing: 0.5 }}>{tr.category}</span>
              </div>
              <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                {tr.items.map((item, j) => (
                  <ActionItem key={j} action={item.action} text={item.text} colors={colors} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: colors.textTertiary, lineHeight: 1.6, borderTop: `1px solid ${colors.borderAccent}`, paddingTop: 10 }}>
                {tr.explanation}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Lifestyle */}
      <Section title="Hygiène de vie" colors={colors}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
          {recs.lifestyle.map((ls, i) => (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 10,
              background: colors.surface, border: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{ls.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{ls.category}</span>
              </div>
              <div style={{ display: "grid", gap: 5 }}>
                {ls.items.map((item, j) => (
                  <ActionItem key={j} action={item.action} text={item.text} colors={colors} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Follow-up */}
      <Section title="Suivi recommandé" colors={colors}>
        <div style={{ display: "grid", gap: 12 }}>
          {recs.followUp.map((fu, i) => (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 10,
              background: colors.surface, border: `1px solid ${colors.border}`,
              borderLeft: `3px solid ${fu.urgency === "3 mois" ? colors.flag : fu.urgency === "Prochain bilan" ? colors.normal : colors.accent}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  background: fu.urgency === "3 mois" ? colors.flag + "20" : colors.accentBg,
                  color: fu.urgency === "3 mois" ? colors.flag : colors.accent,
                  textTransform: "uppercase", letterSpacing: 0.5,
                }}>{fu.urgency}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{fu.title}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {fu.tests.map((test, j) => (
                  <span key={j} style={{
                    fontSize: 10, padding: "3px 8px", borderRadius: 4,
                    background: colors.inputBg, color: colors.textSecondary, fontWeight: 500,
                  }}>{test}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: colors.textTertiary, lineHeight: 1.6 }}>{fu.reason}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Disclaimer */}
      <div style={{
        marginTop: 24, padding: 14, background: colors.surface,
        borderRadius: 8, border: `1px solid ${colors.borderAccent}`,
        fontSize: 10, color: colors.textDimmed, lineHeight: 1.6,
      }}>
        <strong>Disclaimer:</strong> Ces recommandations sont générées automatiquement à partir de tes résultats sanguins et de ton profil physiologique. Elles ne remplacent pas un avis médical. Discute-les avec ton médecin avant de modifier ton traitement ou ta supplémentation.
      </div>
    </div>
  );
}

function Section({ title, children, colors }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function ActionItem({ action, text, colors }) {
  const icon = action === "do" ? "→" : action === "dont" ? "✕" : "⚠";
  const color = action === "do" ? colors.optimal : action === "dont" ? colors.flag : colors.normal;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ fontSize: 11, color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function NutritionColumn({ title, icon, items, colors, type }) {
  const borderColor = type === "favor" ? colors.optimal : type === "reduce" ? colors.normal : colors.flag;
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 10,
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderTop: `3px solid ${borderColor}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: borderColor, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span> {title}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, color: colors.text, fontWeight: 600 }}>{item.item}</div>
            <div style={{ fontSize: 10, color: colors.textTertiary, lineHeight: 1.4, marginTop: 2 }}>{item.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
