// ---------------------------------------------------------------------------
// Segments — core data types
// All segment-related logic depends on these; keep this file logic-free.
// ---------------------------------------------------------------------------

export type SegmentId = string;
export type StepId = string;
export type ConfigId = string;

/** A single named time-range within a video. */
export interface Segment {
  id: SegmentId;
  startTime: number; // seconds ≥ 0
  endTime: number;   // seconds > startTime
  label?: string;
}

/**
 * One unit in a playback sequence.
 *
 * `segmentIds` is an ordered list of segment references — the playback engine
 * plays them in exactly that order. Duplicates are intentional: [seg3, seg3,
 * seg1] plays seg3 twice then seg1 once. This is the primary way to express
 * custom playback arrangements without needing a separate count-per-reference
 * field.
 *
 * `count` governs how many times the whole `segmentIds` list is played through:
 *   0  = loop forever
 *   1+ = play that many full cycles, then advance to the next step
 *
 * `perIterationRates` overrides `playbackRate` on a per-cycle basis.
 * Index 0 = first cycle, index 1 = second cycle, etc. The last entry repeats
 * for any cycle beyond the array length. An empty array means `playbackRate`
 * is used for every cycle.
 */
export interface PlayStep {
  id: StepId;
  segmentIds: SegmentId[];
  count: number;
  playbackRate: number | null;  // null = keep current video rate
  perIterationRates: number[];
}

/**
 * A complete, saveable playback configuration for a video.
 *
 * `sequence` is an ordered list of steps. When the last step finishes
 * (count ≠ 0), the engine wraps back to step 0 for a global infinite loop.
 * Set the last step's count = 0 if you want that step to loop forever.
 */
export interface SegmentConfig {
  id: ConfigId;
  label: string;          // required; auto-generated if user leaves blank
  segments: Segment[];
  sequence: PlayStep[];
  shortcutKey: string;    // "" = no shortcut; e.g. "Ctrl+1"
  createdAt: number;      // unix ms
  updatedAt: number;
}

/**
 * Per-video auto-load override.
 *
 *   null              → no pin; fall back to the global preference
 *   "off"             → always skip auto-load for this video
 *   "last-used"       → always restore the volatile last-used snapshot
 *   "default"         → always restore the default saved config
 *   { configId }      → always restore a specific named config
 */
export type SegmentAutoLoadPin =
  | null
  | "off"
  | "last-used"
  | "default"
  | { configId: string };

/**
 * Per-video persistence record stored in IndexedDB.
 *
 * Three tiers:
 *   lastUsed      — auto-updated volatile snapshot; never requires explicit save
 *   configs       — explicitly saved named configurations
 *   defaultConfigId — which of configs[] is the "default" quick-save slot
 *
 * autoLoadPin overrides the global "segments.autoLoad" preference for this
 * specific video. Undefined / null = honour the global preference.
 */
export interface VideoSegmentData {
  videoId: string;
  lastUsed: SegmentConfig | null;
  configs: SegmentConfig[];
  defaultConfigId: string | null;
  autoLoadPin?: SegmentAutoLoadPin;
  savedAt: number;
}
