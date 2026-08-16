export type SegmentId = string;
export type StepId = string;
export type ConfigId = string;

export interface Segment {
  id: SegmentId;
  startTime: number; // seconds
  endTime: number; // seconds
  label?: string;
}

// Repeats in `segmentIds` are intentional and are the only way to express an
// arrangement like "seg3 twice, then seg1" — there is no count-per-reference field.
export interface PlayStep {
  id: StepId;
  segmentIds: SegmentId[];
  count: number; // full cycles through segmentIds; 0 loops forever
  playbackRate: number | null; // null keeps the video's current rate
  perIterationRates: number[]; // per cycle; last entry repeats, empty falls back to playbackRate
}

// The engine wraps from the last step back to step 0, so a sequence loops
// globally unless its final step sets count = 0 and loops on its own.
export interface SegmentConfig {
  id: ConfigId;
  label: string; // auto-generated when the user leaves it blank
  segments: Segment[];
  sequence: PlayStep[];
  shortcutKey: string; // "" = unbound, e.g. "Ctrl+1"
  createdAt: number; // unix ms
  updatedAt: number;
}

// null defers to the global preference; "off" actively suppresses auto-load for
// this one video. The two are not interchangeable.
export type SegmentAutoLoadPin =
  | null
  | "off"
  | "last-used"
  | "default"
  | { configId: string };

export interface VideoSegmentData {
  videoId: string;
  lastUsed: SegmentConfig | null; // volatile snapshot, written without an explicit save
  configs: SegmentConfig[];
  defaultConfigId: string | null;
  autoLoadPin?: SegmentAutoLoadPin;
  savedAt: number;
}
