export type ThemePreference = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
    return "dark";
  }
  return pref;
}

export function applyTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
