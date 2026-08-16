import type { Segment, SegmentConfig, PlayStep } from "./types";

function randomId(): string {
  return crypto.randomUUID();
}

// Callers that do not yet know the duration pass 0 and are responsible for
// rewriting endTime once the video's metadata loads.
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
    count: 0,
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

export function addSegmentToConfig(
  config: SegmentConfig,
  startTime: number,
  endTime: number,
  label?: string,
): SegmentConfig {
  const newSeg: Segment = { id: randomId(), startTime, endTime, label };

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
    // Lands in the first step by default; rearranging is left to the user.
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

// Also drops any step left with no segments, so the sequence never contains a
// step the engine would spin on forever.
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

export function generateConfigLabel(existingCount: number): string {
  return `Segment Config ${existingCount + 1}`;
}

// Returns null when the split would leave either half under 0.1 s, which is the
// same floor the markers enforce while dragging.
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

  const newSequence = config.sequence.map((step) => {
    const idx = step.segmentIds.indexOf(segmentId);
    if (idx < 0) return step;
    const ids = [...step.segmentIds];
    ids.splice(idx + 1, 0, newSegId);
    return { ...step, segmentIds: ids };
  });

  return { ...config, segments: newSegments, sequence: newSequence, updatedAt: Date.now() };
}
