import { defineSettings } from "@/kernel/settings";

export interface ProfilesSettings {
  // Extra places to switch profiles from; the popup always has a switcher.
  gearMenu: boolean;
  nativeSettings: boolean;
}

export const profilesSettings = defineSettings<ProfilesSettings>(
  "profiles-surfaces",
  { gearMenu: false, nativeSettings: false },
  {
    legacy: (store) => {
      const ui = store.ui as { gearMenuEnabled?: boolean; nativeSettingsEnabled?: boolean } | undefined;
      if (!ui) return undefined;
      return { gearMenu: ui.gearMenuEnabled, nativeSettings: ui.nativeSettingsEnabled };
    },
  },
);
