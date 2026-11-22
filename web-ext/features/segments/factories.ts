import type { Segment, SegmentConfig } from "./types";

function createSegment(startTime: number, endTime: number): Segment {
  return { id: crypto.randomUUID(), startTime, endTime, rate: null, loops: null };
}

export function createFreshConfig(videoDuration: number): SegmentConfig {
  return { id: crypto.randomUUID(), label: "", segments: [createSegment(0, videoDuration > 0 ? videoDuration : 0)] };
}

export function addSegmentToConfig(config: SegmentConfig, startTime: number, endTime: number): SegmentConfig {
  return { ...config, segments: [...config.segments, createSegment(startTime, endTime)] };
}

export function removeSegmentFromConfig(config: SegmentConfig, segmentId: string): SegmentConfig {
  return { ...config, segments: config.segments.filter((s) => s.id !== segmentId) };
}

export function updateSegment(config: SegmentConfig, segmentId: string, change: Partial<Omit<Segment, "id">>): SegmentConfig {
  return { ...config, segments: config.segments.map((s) => (s.id === segmentId ? { ...s, ...change } : s)) };
}

export function generateConfigLabel(existingCount: number): string {
  return `Segment Config ${existingCount + 1}`;
}

// Returns null when the split would leave either half under 0.1 s, which is the
// same floor the markers enforce while dragging.
export function splitSegmentAtTime(config: SegmentConfig, segmentId: string, splitTime: number): SegmentConfig | null {
  const seg = config.segments.find((s) => s.id === segmentId);
  if (!seg) return null;
  if (splitTime <= seg.startTime + 0.1 || splitTime >= seg.endTime - 0.1) return null;
  const first = updateSegment(config, segmentId, { endTime: splitTime });
  return { ...first, segments: [...first.segments, { ...seg, id: crypto.randomUUID(), startTime: splitTime }] };
}
