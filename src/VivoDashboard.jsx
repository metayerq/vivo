import { useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { PHYSIOLOGICAL_PROFILE } from "./data/physiologicalProfile";
import { BLOOD_CATEGORIES, DEFAULT_VALUES } from "./data/bloodCategories";
import { getAdjustedVo2 } from "./data/vo2Adjustments";
import { computeIndices, computeCrossRefs, computeCompositeScores, computeProjections } from "./utils/calculations";
import TabButton from "./components/ui/TabButton";
import SettingsPanel from "./components/SettingsPanel";
import PhysioTab from "./components/PhysioTab";
import BloodTab from "./components/BloodTab";
import IndicesTab from "./components/IndicesTab";
import CrossRefTab from "./components/CrossRefTab";
import SynthesisTab from "./components/SynthesisTab";
import HistoryPanel from "./components/HistoryPanel";

function getInitialTheme() {
  try {
    const stored = localStorage.getItem("vivo-theme");
    if (stored) return JSON.parse(stored);
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export default function VivoDashboard() {
  const [tab, setTab] = useState("cross");
  const [values, setValues] = useLocalStorage("vivo-values", DEFAULT_VALUES);
  const [theme, setTheme] = useLocalStorage("vivo-theme", getInitialTheme());
  const [mode, setMode] = useLocalStorage("vivo-mode", "informed");
  const [modality, setModality] = useLocalStorage("vivo-modality", "bike");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useLocalStorage("vivo-history", []);

  const { colors, isDark } = useTheme(theme);

  // Apply bg color to body
  useEffect(() => {
    document.body.style.background = colors.bg;
  }, [colors.bg]);

  const handleChange = (id, val) => setValues((prev) => ({ ...prev, [id]: val }));

  const filledCount = Object.values(values).filter((v) => v !== "" && v !== undefined).length;
  const totalMarkers = BLOOD_CATEGORIES.reduce((acc, c) => acc + c.markers.length, 0);

  const p = PHYSIOLOGICAL_PROFILE.metrics;
  const { adjusted: adjustedVo2 } = getAdjustedVo2(p.vo2max, modality);

  const calcs = useMemo(() => computeIndices(values, p.chronoAge, mode, p), [values, mode]);
  const crossRefs = useMemo(() => computeCrossRefs(values, mode, adjustedVo2), [values, mode, adjustedVo2]);
  const compositeScores = useMemo(() => computeCompositeScores(values, mode, p), [values, mode]);
  const projections = useMemo(() => computeProjections(history, values), [history, values]);

  const handleSaveHistory = () => {
    const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
    setHistory((prev) => [{ date, values: { ...values } }, ...prev]);
  };

  const handleLoadHistory = (idx) => {
    if (confirm("Charger ce bilan ? Les valeurs actuelles seront remplacées.")) {
      setValues(history[idx].values);
      setHistoryOpen(false);
    }
  };

  const handleDeleteHistory = (idx) => {
    if (confirm("Supprimer ce bilan ?")) {
      setHistory((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleReset = () => {
    if (confirm("Réinitialiser tous les réglages et valeurs ?")) {
      setValues(DEFAULT_VALUES);
      setTheme("dark");
      setMode("informed");
      setModality("bike");
      setSettingsOpen(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: colors.bg, color: colors.text, minHeight: "100vh", padding: 0,
      transition: "background 0.3s, color 0.3s",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "24px 28px", borderBottom: `1px solid ${colors.border}`,
        background: colors.headerGradient,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: colors.accent }}>VIVO</span>
              <span style={{ fontSize: 10, color: colors.textDimmed, letterSpacing: 1, borderLeft: `1px solid ${colors.divider}`, paddingLeft: 10 }}>PRECISION HEALTH INTELLIGENCE</span>
            </div>
            <div style={{ fontSize: 12, color: colors.textTertiary }}>Cross-référencement biomarqueurs × physiologie × objectifs</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>Quentin Métayer</div>
              <div style={{ fontSize: 11, color: colors.textTertiary }}>34 ans · 190 cm · 90.8 kg · Objectif: 18% BF</div>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              style={{
                background: colors.surface, border: `1px solid ${colors.border}`,
                borderRadius: 8, padding: "8px 10px", cursor: "pointer",
                color: colors.textTertiary, fontSize: 16, lineHeight: 1,
                transition: "border-color 0.2s",
              }}
              title="Historique"
            >
              📋
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              style={{
                background: colors.surface, border: `1px solid ${colors.border}`,
                borderRadius: 8, padding: "8px 10px", cursor: "pointer",
                color: colors.textTertiary, fontSize: 16, lineHeight: 1,
                transition: "border-color 0.2s",
              }}
              title="Réglages"
            >
              ⚙
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        padding: "12px 28px", display: "flex", gap: 8, overflowX: "auto",
        borderBottom: `1px solid ${colors.borderAccent}`,
      }}>
        <TabButton active={tab === "profil"} label="Profil Physio" onClick={() => setTab("profil")} colors={colors} />
        <TabButton active={tab === "blood"} label="Bilan Sanguin" onClick={() => setTab("blood")} count={filledCount} colors={colors} />
        <TabButton active={tab === "indices"} label="Indices Calculés" onClick={() => setTab("indices")} count={calcs.length} colors={colors} />
        <TabButton active={tab === "cross"} label="Analyses Croisées" onClick={() => setTab("cross")} count={crossRefs.length} colors={colors} />
        <TabButton active={tab === "synthesis"} label="Synthèse" onClick={() => setTab("synthesis")} colors={colors} />
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px", maxWidth: 960, margin: "0 auto" }}>
        {tab === "profil" && (
          <PhysioTab profile={PHYSIOLOGICAL_PROFILE} colors={colors} isDark={isDark} modality={modality} setModality={setModality} />
        )}
        {tab === "blood" && (
          <BloodTab values={values} onChange={handleChange} filledCount={filledCount} totalMarkers={totalMarkers} colors={colors} />
        )}
        {tab === "indices" && (
          <IndicesTab calcs={calcs} colors={colors} />
        )}
        {tab === "cross" && (
          <CrossRefTab crossRefs={crossRefs} colors={colors} />
        )}
        {tab === "synthesis" && (
          <SynthesisTab values={values} calcs={calcs} crossRefs={crossRefs} compositeScores={compositeScores} projections={projections} filledCount={filledCount} totalMarkers={totalMarkers} colors={colors} />
        )}
      </div>

      {/* History */}
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSave={handleSaveHistory}
        onLoad={handleLoadHistory}
        onDelete={handleDeleteHistory}
        currentValues={values}
        colors={colors}
      />

      {/* Settings */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        mode={mode}
        setMode={setMode}
        modality={modality}
        setModality={setModality}
        onReset={handleReset}
        colors={colors}
      />
    </div>
  );
}
