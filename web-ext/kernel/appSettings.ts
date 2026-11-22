import { defineSettings } from "@/kernel/settings";

export type ThemePreference = "system" | "dark" | "light";

export interface AppSettings {
  // The master switch: off means no feature mounts anywhere.
  enabled: boolean;
  theme: ThemePreference;
}

export const appSettings = defineSettings<AppSettings>(
  "app",
  { enabled: true, theme: "system" },
  {
    legacy: (store) => ({
      enabled: store.isExtensionEnabled as boolean | undefined,
      theme: (store.ui as { theme?: ThemePreference } | undefined)?.theme,
    }),
  },
);
