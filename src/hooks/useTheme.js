import { useMemo } from "react";
import { THEMES } from "../data/themes";

export function useTheme(theme) {
  const colors = useMemo(() => THEMES[theme] || THEMES.dark, [theme]);
  return { colors, isDark: theme === "dark" };
}
