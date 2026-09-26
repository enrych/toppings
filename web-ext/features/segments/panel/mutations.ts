import { addSegmentToConfig, removeSegmentFromConfig, splitSegmentAtTime } from "../factories";
import { setLastUsed } from "../segmentStore";
import type { PlayStep, SegmentConfig, SegmentId, StepId } from "../types";
import { activeConfig, currentVideoId, emitConfigChange, render } from "./state";

export function mutateConfig(updater: (config: SegmentConfig) => SegmentConfig): void {
  if (!activeConfig) return;
  const next = updater(activeConfig);
  emitConfigChange(next);
  render(next);
  if (currentVideoId) void setLastUsed(currentVideoId, next);
}

function updateStep(stepId: StepId, change: (step: PlayStep) => PlayStep): void {
  mutateConfig((c) => ({
    ...c,
    sequence: c.sequence.map((s) => (s.id === stepId ? change(s) : s)),
    updatedAt: Date.now(),
  }));
}

export function addNewSegment(config: SegmentConfig): void {
  const video = document.querySelector("video") as HTMLVideoElement | null;
  if (!video) return;
  const duration = video.duration || 100;
  const currentTime = video.currentTime;

  // Split the segment under the playhead when there is one; otherwise append
  // after the last segment.
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  const atPlayhead = sorted.find((s) => currentTime > s.startTime + 0.1 && currentTime < s.endTime - 0.1);
  if (atPlayhead) {
    const split = splitSegmentAtTime(config, atPlayhead.id, currentTime);
    if (split) {
      mutateConfig(() => split);
      return;
    }
  }

  const last = sorted[sorted.length - 1];
  const start = last ? Math.min(last.endTime, duration - 2) : 0;
  const end = Math.min(start + Math.min(30, (duration - start) * 0.5), duration);
  mutateConfig((c) => addSegmentToConfig(c, Math.max(0, start), Math.max(start + 1, end)));
}

export function removeSegment(config: SegmentConfig, segmentId: SegmentId): void {
  if (config.segments.length <= 1) return;
  mutateConfig((c) => removeSegmentFromConfig(c, segmentId));
}

export function addStep(config: SegmentConfig): void {
  const firstSegmentId = config.segments[0]?.id;
  if (!firstSegmentId) return;
  const step: PlayStep = {
    id: crypto.randomUUID(),
    segmentIds: [firstSegmentId],
    count: 1,
    playbackRate: null,
    perIterationRates: [],
  };
  mutateConfig((c) => ({ ...c, sequence: [...c.sequence, step], updatedAt: Date.now() }));
}

export function removeStep(stepId: StepId): void {
  mutateConfig((c) => {
    if (c.sequence.length <= 1) return c;
    return { ...c, sequence: c.sequence.filter((s) => s.id !== stepId), updatedAt: Date.now() };
  });
}

export function addSegmentToStep(stepId: StepId, segmentId: SegmentId): void {
  updateStep(stepId, (s) => ({ ...s, segmentIds: [...s.segmentIds, segmentId] }));
}

export function removeSegmentFromStep(stepId: StepId, index: number): void {
  updateStep(stepId, (s) => {
    const ids = s.segmentIds.filter((_, i) => i !== index);
    return ids.length === 0 ? s : { ...s, segmentIds: ids };
  });
}

export function reorderStepSegments(stepId: StepId, from: number, to: number): void {
  updateStep(stepId, (s) => {
    const ids = [...s.segmentIds];
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    return { ...s, segmentIds: ids };
  });
}

export function updateStepCount(stepId: StepId, count: number): void {
  updateStep(stepId, (s) => ({ ...s, count }));
}

export function updateStepRate(stepId: StepId, playbackRate: number | null): void {
  updateStep(stepId, (s) => ({ ...s, playbackRate }));
}

export function updateStepPerIterationRates(stepId: StepId, perIterationRates: number[]): void {
  updateStep(stepId, (s) => ({ ...s, perIterationRates }));
}
