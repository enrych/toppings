import type { Segment, SegmentConfig, PlayStep, SegmentId } from "./types";

// Decides when to seek and at what rate, and nothing else: no storage, no UI,
// no DOM beyond the video element. Keep it that way — the panel and markers
// both drive this class, so anything stateful added here leaks into both.

interface EngineState {
  stepIndex: number;
  iterationInStep: number;
  segmentIndexInStep: number; // step.segmentIds is user-ordered and may repeat an id
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

  start(): void {
    if (this._active) this.stop();
    this.state = initialState();
    this._active = true;
    this.originalRate = this.video.playbackRate;

    // Never seek when the playhead already sits inside a segment: enabling
    // segments mid-playback should not jump the video out from under the user.
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

  // Reconciles rather than restarts so that dragging a marker, which swaps the
  // config on every pointer move, does not restart playback on every frame.
  setConfig(config: SegmentConfig): void {
    this.config = config;
    if (this._active) {
      this.reconcileStateToCurrentTime();
    } else {
      this.state = initialState();
    }
  }

  getCurrentSegment(): Segment | null {
    return this.resolveCurrentSegment();
  }

  getSegmentAt(currentTime: number): Segment | null {
    const segs = this.config.segments;
    if (segs.length === 0) return null;

    const containing = segs.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime,
    );
    if (containing) return containing;

    return segs.reduce((best, seg) => {
      const mid = (seg.startTime + seg.endTime) / 2;
      const bestMid = (best.startTime + best.endTime) / 2;
      return Math.abs(currentTime - mid) < Math.abs(currentTime - bestMid)
        ? seg
        : best;
    });
  }

  private onTimeUpdate(): void {
    const seg = this.resolveCurrentSegment();
    if (!seg) return;

    const rate = this.getEffectiveRate();
    if (rate !== null && Math.abs(this.video.playbackRate - rate) > 0.001) {
      this.video.playbackRate = rate;
    }

    const ct = this.video.currentTime;

    // 0.3 s short of the true end: seeking into the unmuxed tail of a YouTube
    // stream can stall playback rather than fire the next timeupdate.
    const safeEnd = Math.min(
      seg.endTime,
      this.video.duration > 0 ? this.video.duration - 0.3 : seg.endTime,
    );

    if (ct >= seg.startTime && ct < safeEnd) return;

    // A manual seek into another segment adopts that segment instead of being
    // yanked back — otherwise the engine would fight the user's own seeking.
    const seekedInto = this.config.segments.find(
      (s) => s.id !== seg.id && ct >= s.startTime && ct <= s.endTime,
    );
    if (seekedInto) {
      this.updateStateToSegment(seekedInto.id);
      return;
    }

    if (ct >= safeEnd) {
      this.advance();
    } else {
      this.snapToNearestSegmentForward(ct);
    }
  }

  private snapToNearestSegmentForward(currentTime: number): void {
    const sorted = [...this.config.segments].sort(
      (a, b) => a.startTime - b.startTime,
    );
    const next = sorted.find((s) => s.startTime >= currentTime);
    if (next) {
      this.video.currentTime = next.startTime;
    } else {
      const last = sorted[sorted.length - 1];
      if (last) this.video.currentTime = last.startTime;
    }
  }

  private advance(): void {
    const step = this.currentStep();
    if (!step) return;

    const nextSegIdx = this.state.segmentIndexInStep + 1;

    if (nextSegIdx < step.segmentIds.length) {
      this.state.segmentIndexInStep = nextSegIdx;
      this.seekToCurrentSegment();
      return;
    }

    const nextIteration = this.state.iterationInStep + 1;
    this.state.segmentIndexInStep = 0;

    // count 0 is the stored encoding for "loop forever".
    if (step.count === 0 || nextIteration < step.count) {
      this.state.iterationInStep = nextIteration;
      this.seekToCurrentSegment();
      return;
    }

    const nextStepIdx =
      (this.state.stepIndex + 1) % this.config.sequence.length;
    this.state.stepIndex = nextStepIdx;
    this.state.iterationInStep = 0;
    this.state.segmentIndexInStep = 0;
    this.seekToCurrentSegment();
  }

  private reconcileStateToCurrentTime(): void {
    const ct = this.video.currentTime;
    const containingSeg = this.config.segments.find(
      (s) => ct >= s.startTime && ct <= s.endTime,
    );
    if (containingSeg) {
      for (let si = 0; si < this.config.sequence.length; si++) {
        const step = this.config.sequence[si];
        const segIdx = step.segmentIds.indexOf(containingSeg.id);
        if (segIdx !== -1) {
          this.state = { stepIndex: si, iterationInStep: 0, segmentIndexInStep: segIdx };
          return;
        }
      }
    }
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

  // null means "no override" — the caller leaves the user's rate untouched.
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
