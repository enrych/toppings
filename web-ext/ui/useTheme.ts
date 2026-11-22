import { useEffect } from "preact/hooks";
import { useSettings } from "@/kernel/useSettings";
import { appSettings, type ThemePreference } from "@/kernel/appSettings";

export type { ThemePreference };

const resolve = (pref: ThemePreference): "dark" | "light" =>
  pref === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : pref;

const stamp = (pref: ThemePreference) => document.documentElement.setAttribute("data-theme", resolve(pref));

// The setting arrives from storage after the first paint, which flashed the
// dark default at light-theme users each time the popup opened. The last
// choice is mirrored where it can be read synchronously.
const MIRROR = "tppng:theme";
stamp((localStorage.getItem(MIRROR) as ThemePreference | null) ?? "system");

export function useTheme() {
  const { value, update } = useSettings(appSettings);

  useEffect(() => {
    const apply = () => stamp(value.theme);
    apply();
    localStorage.setItem(MIRROR, value.theme);
    if (value.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [value.theme]);

  return { theme: value.theme, setTheme: (theme: ThemePreference) => update({ theme }) };
}
