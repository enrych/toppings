import { useContext, useEffect } from "react";
import StoreContext from "../store";
import {
  ThemePreference,
  resolveTheme,
  applyTheme,
} from "../utils/theme";

/**
 * Reads the user's theme preference from the store, resolves it (handling
 * the "system" case), applies it to <html data-theme>, and re-applies when
 * the OS preference changes (only relevant if the user picked "system").
 */
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
