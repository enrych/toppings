import { defineSettings } from "@/kernel/settings";

export interface PlaybackSettings {
  enabled: boolean;
  defaultRate: number;
  toggleRate: number;
  rateStep: number;
  seekBackward: number;
  seekForward: number;
  customRates: number[];
}

interface LegacyWatch {
  isEnabled?: boolean;
  defaultPlaybackRate?: { value?: string };
  togglePlaybackRate?: { value?: string };
  increasePlaybackRate?: { value?: string };
  seekBackward?: { value?: string };
  seekForward?: { value?: string };
  customPlaybackRates?: string[];
}

export const MIN_RATE = 0.0625;
export const MAX_RATE = 16;

const number = (value: string | undefined) => (value === undefined ? undefined : Number(value));

export const playbackSettings = defineSettings<PlaybackSettings>(
  "playback",
  { enabled: true, defaultRate: 1, toggleRate: 1.5, rateStep: 0.25, seekBackward: 15, seekForward: 15, customRates: [] },
  {
    legacy: (store) => {
      const legacy = (store.preferences as { watch?: LegacyWatch } | undefined)?.watch;
      if (!legacy) return undefined;
      return {
        enabled: legacy.isEnabled,
        defaultRate: number(legacy.defaultPlaybackRate?.value),
        toggleRate: number(legacy.togglePlaybackRate?.value),
        rateStep: number(legacy.increasePlaybackRate?.value),
        seekBackward: number(legacy.seekBackward?.value),
        seekForward: number(legacy.seekForward?.value),
        customRates: legacy.customPlaybackRates?.map(Number),
      };
    },
  },
);

// A rate list must keep 1 so the user can always return to normal speed.
export function parseRates(text: string): number[] | undefined {
  if (text.trim() === "") return [];
  const rates = text.split(",").map((part) => Number(part.trim()));
  const valid = rates.every((rate) => Number.isFinite(rate) && rate >= MIN_RATE && rate <= MAX_RATE);
  return valid && rates.includes(1) ? [...new Set(rates)].sort((a, b) => a - b) : undefined;
}
