import { useEffect } from "preact/hooks";
import { useSettings } from "@/kernel/useSettings";
import { appSettings, type ThemePreference } from "@/app/settings";

export type { ThemePreference };

const resolve = (pref: ThemePreference): "dark" | "light" =>
  pref === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : pref;

// Stamps the resolved theme on <html>, which is where the CSS tokens key off.
export function useTheme() {
  const { value, update } = useSettings(appSettings);

  useEffect(() => {
    const apply = () => document.documentElement.setAttribute("data-theme", resolve(value.theme));
    apply();
    if (value.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [value.theme]);

  return { theme: value.theme, setTheme: (theme: ThemePreference) => update({ theme }) };
}
