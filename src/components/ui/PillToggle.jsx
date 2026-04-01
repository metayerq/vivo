export default function PillToggle({ options, value, onChange, colors }) {
  return (
    <div style={{
      display: "inline-flex", gap: 0, borderRadius: 8, overflow: "hidden",
      border: `1px solid ${colors.border}`,
    }}>
      {options.map((opt, i) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              padding: "6px 14px", fontSize: 11, fontWeight: active ? 700 : 500,
              color: active ? colors.badgeText : colors.textTertiary,
              background: active ? colors.accent : colors.surface,
              border: "none",
              borderRight: i < options.length - 1 ? `1px solid ${colors.border}` : "none",
              cursor: "pointer", transition: "all 0.15s",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
