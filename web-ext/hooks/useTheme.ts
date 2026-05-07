import { useContext, useEffect } from "react";
import StoreContext from "../context/store";
import {
  ThemePreference,
  resolveTheme,
  applyTheme,
} from "../utils/theme";

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
