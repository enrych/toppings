import type { Segment, SegmentConfig, PlayStep } from "./types";

// ---------------------------------------------------------------------------
// Segment config factories
// ---------------------------------------------------------------------------

function randomId(): string {
  return crypto.randomUUID();
}

/**
 * Build the default "fresh slate" config for a video.
 *
 * Produces a single segment spanning the full video duration with one step
 * that loops it infinitely — identical to the previous Loop Segment default.
 *
 * Pass `videoDuration = 0` when the duration isn't known yet; callers should
 * update the endTime once the video's metadata loads.
 */
export function createFreshConfig(videoDuration: number): SegmentConfig {
  const segId = randomId();
  const stepId = randomId();

  const segment: Segment = {
    id: segId,
    startTime: 0,
    endTime: videoDuration > 0 ? videoDuration : 0,
  };

  const step: PlayStep = {
    id: stepId,
    segmentIds: [segId],
    count: 0,          // 0 = infinite loop
    playbackRate: null,
    perIterationRates: [],
  };

  const now = Date.now();
  return {
    id: randomId(),
    label: "Default",
    segments: [segment],
    sequence: [step],
    shortcutKey: "",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a new empty config placeholder (no segments, no steps).
 * Used when adding a brand-new named config before the user populates it.
 */
export function createEmptyConfig(label: string): SegmentConfig {
  const now = Date.now();
  return {
    id: randomId(),
    label,
    segments: [],
    sequence: [],
    shortcutKey: "",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add a new segment to an existing config, appending it to both the segments
 * list and the first (or only) step's segmentIds. Returns a new config object
 * (immutable update pattern).
 */
export function addSegmentToConfig(
  config: SegmentConfig,
  startTime: number,
  endTime: number,
  label?: string,
): SegmentConfig {
  const newSeg: Segment = { id: randomId(), startTime, endTime, label };

  // If there are no steps yet, create a default infinite step.
  let newSequence: PlayStep[];
  if (config.sequence.length === 0) {
    const step: PlayStep = {
      id: randomId(),
      segmentIds: [newSeg.id],
      count: 0,
      playbackRate: null,
      perIterationRates: [],
    };
    newSequence = [step];
  } else {
    // Append to the first step's segmentIds by default; user can rearrange.
    newSequence = config.sequence.map((step, i) =>
      i === 0 ? { ...step, segmentIds: [...step.segmentIds, newSeg.id] } : step,
    );
  }

  return {
    ...config,
    segments: [...config.segments, newSeg],
    sequence: newSequence,
    updatedAt: Date.now(),
  };
}

/**
 * Remove a segment from a config, also purging its ID from all steps.
 * Steps that become empty of segmentIds are also removed.
 */
export function removeSegmentFromConfig(
  config: SegmentConfig,
  segmentId: string,
): SegmentConfig {
  const newSegments = config.segments.filter((s) => s.id !== segmentId);
  const newSequence = config.sequence
    .map((step) => ({
      ...step,
      segmentIds: step.segmentIds.filter((id) => id !== segmentId),
    }))
    .filter((step) => step.segmentIds.length > 0);

  return {
    ...config,
    segments: newSegments,
    sequence: newSequence,
    updatedAt: Date.now(),
  };
}

/**
 * Update a single segment's time boundaries within a config.
 */
export function updateSegmentTimes(
  config: SegmentConfig,
  segmentId: string,
  startTime: number,
  endTime: number,
): SegmentConfig {
  return {
    ...config,
    segments: config.segments.map((s) =>
      s.id === segmentId ? { ...s, startTime, endTime } : s,
    ),
    updatedAt: Date.now(),
  };
}

/** Generate a human-readable auto-label for new named configs. */
export function generateConfigLabel(existingCount: number): string {
  return `Segment Config ${existingCount + 1}`;
}

/**
 * Split a segment at `splitTime`, replacing it with two adjacent segments.
 *
 * The original segment [start → end] becomes:
 *   Segment A: [start → splitTime]   (replaces original in-place)
 *   Segment B: [splitTime → end]     (new, inserted right after A in all steps)
 *
 * Returns null if the split point is too close to either boundary (< 0.1 s gap).
 */
export function splitSegmentAtTime(
  config: SegmentConfig,
  segmentId: string,
  splitTime: number,
): SegmentConfig | null {
  const seg = config.segments.find((s) => s.id === segmentId);
  if (!seg) return null;
  if (splitTime <= seg.startTime + 0.1 || splitTime >= seg.endTime - 0.1) return null;

  const newSegId = randomId();
  const segA: Segment = { ...seg, endTime: splitTime };
  const segB: Segment = { id: newSegId, startTime: splitTime, endTime: seg.endTime };

  const newSegments = config.segments.map((s) => (s.id === segmentId ? segA : s)).concat(segB);

  // Insert segB after segA in every step that references the original.
  const newSequence = config.sequence.map((step) => {
    const idx = step.segmentIds.indexOf(segmentId);
    if (idx < 0) return step;
    const ids = [...step.segmentIds];
    ids.splice(idx + 1, 0, newSegId);
    return { ...step, segmentIds: ids };
  });

  return { ...config, segments: newSegments, sequence: newSequence, updatedAt: Date.now() };
}
