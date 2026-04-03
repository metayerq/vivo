import PillToggle from "./ui/PillToggle";

const THEME_OPTIONS = [
  { id: "dark", label: "Sombre" },
  { id: "light", label: "Clair" },
];

const MODE_OPTIONS = [
  { id: "clinical", label: "Clinique" },
  { id: "informed", label: "Informé" },
  { id: "simple", label: "Essentiel" },
];

const MODALITY_OPTIONS = [
  { id: "bike", label: "Vélo" },
  { id: "treadmill", label: "Tapis" },
  { id: "rower", label: "Rameur" },
];

const MODE_DESCRIPTIONS = {
  clinical: "Jargon médical, références scientifiques, valeurs de référence détaillées.",
  informed: "Langage clair avec termes techniques expliqués, contexte pratique.",
  simple: "Vulgarisation maximale, métaphores, focus sur les actions concrètes.",
};

export default function SettingsPanel({ open, onClose, theme, setTheme, mode, setMode, modality, setModality, onReset, colors }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: colors.settingsOverlay,
        zIndex: 1000, display: "flex", justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 340, maxWidth: "100vw", height: "100%",
          background: colors.settingsBg, borderLeft: `1px solid ${colors.border}`,
          padding: 28, overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: colors.text, letterSpacing: 1 }}>RÉGLAGES</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: colors.textTertiary,
            fontSize: 20, cursor: "pointer", padding: 4,
          }}>✕</button>
        </div>

        <Section label="Thème" colors={colors}>
          <PillToggle options={THEME_OPTIONS} value={theme} onChange={setTheme} colors={colors} />
        </Section>

        <Section label="Mode d'explication" colors={colors}>
          <PillToggle options={MODE_OPTIONS} value={mode} onChange={setMode} colors={colors} />
          <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: 8, lineHeight: 1.5 }}>
            {MODE_DESCRIPTIONS[mode]}
          </div>
        </Section>

        <Section label="Modalité test VO₂max" colors={colors}>
          <PillToggle options={MODALITY_OPTIONS} value={modality} onChange={setModality} colors={colors} />
          <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: 8, lineHeight: 1.5 }}>
            Le VO₂max mesuré sur vélo sous-estime ~7.5% vs tapis roulant. L'ajustement est appliqué automatiquement.
          </div>
        </Section>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={onReset}
            style={{
              width: "100%", padding: "10px 0", background: colors.flag + "15",
              color: colors.flag, border: `1px solid ${colors.flag}30`,
              borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}
          >
            Réinitialiser tout
          </button>
          <div style={{ fontSize: 10, color: colors.textDimmed, marginTop: 8, textAlign: "center" }}>
            Remet tous les réglages et valeurs par défaut.
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children, colors }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
