import type { Segment, SegmentConfig, PlayStep, SegmentId } from "./types";

// ---------------------------------------------------------------------------
// SegmentEngine — playback state machine
//
// Single responsibility: decide when to seek and at what rate.
// No DOM access except HTMLVideoElement. No storage access. No UI.
// ---------------------------------------------------------------------------

interface EngineState {
  stepIndex: number;
  iterationInStep: number;      // how many full segmentIds cycles completed in this step
  segmentIndexInStep: number;   // index into step.segmentIds (user-defined order, may have dupes)
}

function initialState(): EngineState {
  return { stepIndex: 0, iterationInStep: 0, segmentIndexInStep: 0 };
}

export class SegmentEngine {
  private video: HTMLVideoElement;
  private config: SegmentConfig;
  private state: EngineState = initialState();
  private listener: (() => void) | null = null;
  private originalRate: number | null = null;
  private _active = false;

  constructor(video: HTMLVideoElement, config: SegmentConfig) {
    this.video = video;
    this.config = config;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  start(): void {
    if (this._active) this.stop();
    this.state = initialState();
    this._active = true;
    this.originalRate = this.video.playbackRate;

    // If the playhead is already inside a segment, start tracking from here
    // without seeking — no disruptive jump mid-playback.
    // Only seek to a segment's start when we're outside all of them.
    const ct = this.video.currentTime;
    const alreadyInside = this.config.segments.find(
      (s) => ct >= s.startTime && ct <= s.endTime,
    );
    if (alreadyInside) {
      this.reconcileStateToCurrentTime();
    } else {
      this.seekToCurrentSegment();
    }

    this.listener = () => this.onTimeUpdate();
    this.video.addEventListener("timeupdate", this.listener);
  }

  stop(): void {
    if (this.listener) {
      this.video.removeEventListener("timeupdate", this.listener);
      this.listener = null;
    }
    // Restore original playback rate if we changed it.
    if (
      this.originalRate !== null &&
      this.video.playbackRate !== this.originalRate
    ) {
      this.video.playbackRate = this.originalRate;
    }
    this.originalRate = null;
    this._active = false;
  }

  isActive(): boolean {
    return this._active;
  }

  /**
   * Hot-swap the config without stopping playback. If the playhead is already
   * inside a segment, update state in place and don't seek — this prevents
   * disruptive restarts while the user is dragging markers. Only seeks when the
   * playhead is outside all segment ranges.
   */
  setConfig(config: SegmentConfig): void {
    this.config = config;
    if (this._active) {
      this.reconcileStateToCurrentTime();
    } else {
      this.state = initialState();
    }
  }

  /**
   * Return the segment that the engine is currently enforcing, or null if the
   * config/sequence is empty.
   */
  getCurrentSegment(): Segment | null {
    return this.resolveCurrentSegment();
  }

  /**
   * Find the segment whose range contains `currentTime`. Used by Q/E shortcuts
   * to target the "active" segment for boundary editing.
   *
   * Tie-breaking: if the playhead is between segments, return the one whose
   * end time is closest to `currentTime`. If no segments exist, returns null.
   */
  getSegmentAt(currentTime: number): Segment | null {
    const segs = this.config.segments;
    if (segs.length === 0) return null;

    // 1. Prefer a segment that contains the playhead.
    const containing = segs.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime,
    );
    if (containing) return containing;

    // 2. Fall back to nearest by absolute distance to midpoint.
    return segs.reduce((best, seg) => {
      const mid = (seg.startTime + seg.endTime) / 2;
      const bestMid = (best.startTime + best.endTime) / 2;
      return Math.abs(currentTime - mid) < Math.abs(currentTime - bestMid)
        ? seg
        : best;
    });
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private onTimeUpdate(): void {
    const seg = this.resolveCurrentSegment();
    if (!seg) return;

    // Apply rate if the step/iteration specifies one.
    const rate = this.getEffectiveRate();
    if (rate !== null && Math.abs(this.video.playbackRate - rate) > 0.001) {
      this.video.playbackRate = rate;
    }

    const ct = this.video.currentTime;

    // Use a small 0.3 s safety margin at the very end of the video so we
    // never seek into an unmuxed tail.
    const safeEnd = Math.min(
      seg.endTime,
      this.video.duration > 0 ? this.video.duration - 0.3 : seg.endTime,
    );

    // Still within the current segment — nothing to do.
    if (ct >= seg.startTime && ct < safeEnd) return;

    // Playhead is outside the current segment's valid range.
    // Before advancing or snapping, check whether the user seeked directly
    // into a different segment — if so, start tracking it without seeking.
    const seekedInto = this.config.segments.find(
      (s) => s.id !== seg.id && ct >= s.startTime && ct <= s.endTime,
    );
    if (seekedInto) {
      this.updateStateToSegment(seekedInto.id);
      return;
    }

    // Not inside any segment: advance on natural end, or snap forward from a gap.
    if (ct >= safeEnd) {
      this.advance();
    } else {
      // ct < seg.startTime — seeked backward into a gap before the current segment.
      this.snapToNearestSegmentForward(ct);
    }
  }

  /**
   * Snap to the start of the nearest segment whose startTime is ≥ currentTime.
   * Falls back to the last segment if we are past all of them.
   */
  private snapToNearestSegmentForward(currentTime: number): void {
    const sorted = [...this.config.segments].sort(
      (a, b) => a.startTime - b.startTime,
    );
    const next = sorted.find((s) => s.startTime >= currentTime);
    if (next) {
      this.video.currentTime = next.startTime;
    } else {
      // Past all segments — go to last segment's start.
      const last = sorted[sorted.length - 1];
      if (last) this.video.currentTime = last.startTime;
    }
  }

  private advance(): void {
    const step = this.currentStep();
    if (!step) return;

    const nextSegIdx = this.state.segmentIndexInStep + 1;

    // More segments left in this step's list → move to the next one.
    if (nextSegIdx < step.segmentIds.length) {
      this.state.segmentIndexInStep = nextSegIdx;
      this.seekToCurrentSegment();
      return;
    }

    // Completed one full cycle through segmentIds.
    const nextIteration = this.state.iterationInStep + 1;
    this.state.segmentIndexInStep = 0;

    // step.count === 0 means infinite; otherwise keep cycling until count.
    if (step.count === 0 || nextIteration < step.count) {
      this.state.iterationInStep = nextIteration;
      this.seekToCurrentSegment();
      return;
    }

    // This step is exhausted → move to the next step (wrap for global loop).
    const nextStepIdx =
      (this.state.stepIndex + 1) % this.config.sequence.length;
    this.state.stepIndex = nextStepIdx;
    this.state.iterationInStep = 0;
    this.state.segmentIndexInStep = 0;
    this.seekToCurrentSegment();
  }

  /**
   * Update this.state to reflect whichever segment contains the current
   * playhead, without seeking. If the playhead is outside all segments,
   * reset to the beginning and seek there instead.
   */
  private reconcileStateToCurrentTime(): void {
    const ct = this.video.currentTime;
    const containingSeg = this.config.segments.find(
      (s) => ct >= s.startTime && ct <= s.endTime,
    );
    if (containingSeg) {
      // Playhead is inside a valid segment — locate it in the sequence.
      for (let si = 0; si < this.config.sequence.length; si++) {
        const step = this.config.sequence[si];
        const segIdx = step.segmentIds.indexOf(containingSeg.id);
        if (segIdx !== -1) {
          this.state = { stepIndex: si, iterationInStep: 0, segmentIndexInStep: segIdx };
          return;
        }
      }
    }
    // Playhead is outside all segments (or segment not in sequence) — reset.
    this.state = initialState();
    this.seekToCurrentSegment();
  }

  private seekToCurrentSegment(): void {
    const seg = this.resolveCurrentSegment();
    if (seg && this.video.duration > 0) {
      const seekTo = Math.max(0, Math.min(seg.startTime, this.video.duration));
      this.video.currentTime = seekTo;
    }
  }

  private updateStateToSegment(segId: SegmentId): void {
    for (let si = 0; si < this.config.sequence.length; si++) {
      const step = this.config.sequence[si];
      const segIdx = step.segmentIds.indexOf(segId);
      if (segIdx !== -1) {
        this.state = { stepIndex: si, iterationInStep: 0, segmentIndexInStep: segIdx };
        return;
      }
    }
  }

  private resolveCurrentSegment(): Segment | null {
    const step = this.currentStep();
    if (!step || step.segmentIds.length === 0) return null;
    const segId = step.segmentIds[this.state.segmentIndexInStep];
    return this.config.segments.find((s) => s.id === segId) ?? null;
  }

  private currentStep(): PlayStep | null {
    return this.config.sequence[this.state.stepIndex] ?? null;
  }

  /**
   * Effective playback rate for the current step + iteration.
   * Returns null when no override is in effect (leave rate unchanged).
   */
  private getEffectiveRate(): number | null {
    const step = this.currentStep();
    if (!step) return null;
    if (step.perIterationRates.length > 0) {
      const idx = Math.min(
        this.state.iterationInStep,
        step.perIterationRates.length - 1,
      );
      return step.perIterationRates[idx];
    }
    return step.playbackRate;
  }
}
