import { defineSettings } from "@/kernel/settings";

export interface ProfilesSettings {
  // Extra places to switch profiles from; the popup always has a switcher.
  gearMenu: boolean;
  // A player button that toggles the Audio profile.
  audioButton: boolean;
}

export const profilesSettings = defineSettings<ProfilesSettings>(
  "profiles-surfaces",
  { gearMenu: false, audioButton: true },
  {
    legacy: (store) => {
      const ui = store.ui as { gearMenuEnabled?: boolean } | undefined;
      const audioMode = (store.preferences as { watch?: { audioMode?: { isEnabled?: boolean } } } | undefined)?.watch?.audioMode;
      if (!ui && !audioMode) return undefined;
      return { gearMenu: ui?.gearMenuEnabled, audioButton: audioMode?.isEnabled };
    },
  },
);
