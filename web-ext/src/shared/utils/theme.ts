export type ThemePreference = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

/**
 * Resolve a user preference into the actual theme to render. Returns "dark"
 * or "light" — never "system" (which defers to the OS).
 */
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

/**
 * Apply a theme to the document. Sets a data-theme attribute on <html>
 * which the CSS theme-token rules key off of. Idempotent.
 */
export function applyTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
