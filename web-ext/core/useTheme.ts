import { useContext, useEffect } from "react";
import StoreContext from "./storeContext";

export type ThemePreference = "system" | "dark" | "light";
type ResolvedTheme = "dark" | "light";

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
    return "dark";
  }
  return pref;
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const ctx = useContext(StoreContext)!;
  const pref: ThemePreference = ctx.store.ui?.theme ?? "system";

  useEffect(() => {
    applyTheme(resolveTheme(pref));

    if (pref !== "system" || typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => applyTheme(resolveTheme("system"));
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [pref]);
}
