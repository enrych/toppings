import { defineSettings } from "@/kernel/settings";
import type { AutoLoad } from "./store";

export interface SegmentsSettings {
  enabled: boolean;
  autoLoad: AutoLoad;
  // Repeated nudges in the same direction grow from base by multiplier up to max.
  nudgeBaseStep: number;
  nudgeMultiplier: number;
  nudgeMaxStep: number;
}

interface LegacyWatch {
  isEnabled?: boolean;
  segments?: { autoLoad?: AutoLoad };
  nudgeLoopSegment?: { baseStep?: string; multiplier?: string; maxStep?: string };
}

const number = (value: string | undefined) => (value === undefined ? undefined : Number(value));

export const segmentsSettings = defineSettings<SegmentsSettings>(
  "segments",
  { enabled: true, autoLoad: "off", nudgeBaseStep: 1, nudgeMultiplier: 2, nudgeMaxStep: 16 },
  {
    legacy: (store) => {
      const watch = (store.preferences as { watch?: LegacyWatch } | undefined)?.watch;
      if (!watch) return undefined;
      // The old watch-page switch covered segments as well as playback.
      return {
        enabled: watch.isEnabled,
        autoLoad: watch.segments?.autoLoad,
        nudgeBaseStep: number(watch.nudgeLoopSegment?.baseStep),
        nudgeMultiplier: number(watch.nudgeLoopSegment?.multiplier),
        nudgeMaxStep: number(watch.nudgeLoopSegment?.maxStep),
      };
    },
  },
);
