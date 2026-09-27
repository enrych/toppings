import { defineSettings } from "@/kernel/settings";

export interface ShortsSettings {
  enabled: boolean;
  autoScroll: boolean;
  toggleRate: number;
  seekBackward: number;
  seekForward: number;
}

interface LegacyShorts {
  isEnabled?: boolean;
  reelAutoScroll?: { value?: boolean };
  togglePlaybackRate?: { value?: string };
  seekBackward?: { value?: string };
  seekForward?: { value?: string };
}

const number = (value: string | undefined) => (value === undefined ? undefined : Number(value));

export const shortsSettings = defineSettings<ShortsSettings>(
  "shorts",
  { enabled: true, autoScroll: true, toggleRate: 1.5, seekBackward: 5, seekForward: 5 },
  (store) => {
    const legacy = (store.preferences as { shorts?: LegacyShorts } | undefined)?.shorts;
    if (!legacy) return undefined;
    return {
      enabled: legacy.isEnabled,
      autoScroll: legacy.reelAutoScroll?.value,
      toggleRate: number(legacy.togglePlaybackRate?.value),
      seekBackward: number(legacy.seekBackward?.value),
      seekForward: number(legacy.seekForward?.value),
    };
  },
);
