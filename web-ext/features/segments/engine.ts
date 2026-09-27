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
  private detach: (() => void) | null = null;
  private originalRate: number | null = null;
  private appliedRate: number | null = null;
  private _active = false;
  private isHeld: () => boolean;

  // isHeld pauses the engine while the video is not the content, as during a
  // mid-roll ad, which YouTube plays in this same element on its own clock.
  constructor(video: HTMLVideoElement, config: SegmentConfig, isHeld: () => boolean = () => false) {
    this.video = video;
    this.config = config;
    this.isHeld = isHeld;
  }

  start(): void {
    if (this._active) this.stop();
    this.state = initialState();
    this._active = true;
    this.originalRate = this.video.playbackRate;

    // Never seek when the playhead already sits inside a segment: enabling
    // segments mid-playback should not jump the video out from under the user.
    if (!this.adoptSegmentAt(this.video.currentTime)) this.seekToCurrentSegment();

    const onTimeUpdate = () => this.onTimeUpdate();
    const onSeeking = () => this.onSeeking();
    this.video.addEventListener("timeupdate", onTimeUpdate);
    this.video.addEventListener("seeking", onSeeking);
    this.detach = () => {
      this.video.removeEventListener("timeupdate", onTimeUpdate);
      this.video.removeEventListener("seeking", onSeeking);
    };
  }

  stop(): void {
    this.detach?.();
    this.detach = null;
    // Only undo a rate the engine set and nobody has changed since, so a speed
    // the user picked while segments ran survives turning them off.
    if (this.originalRate !== null && this.appliedRate === this.video.playbackRate) {
      this.video.playbackRate = this.originalRate;
    }
    this.originalRate = null;
    this.appliedRate = null;
    this._active = false;
  }

  isActive(): boolean {
    return this._active;
  }

  // Reconciles rather than restarts so that dragging a marker, which swaps the
  // config on every pointer move, does not restart playback on every frame.
  setConfig(config: SegmentConfig): void {
    this.config = config;
    if (!this._active) {
      this.state = initialState();
      return;
    }
    // An edit that leaves the playhead outside the segment it was in restarts
    // that segment, rather than the next tick advancing past what is being edited.
    const current = this.resolveCurrentSegment();
    const ct = this.video.currentTime;
    if (current && ct >= current.startTime && ct <= current.endTime) return;
    if (this.adoptSegmentAt(ct)) return;
    if (!current) this.state = initialState();
    this.seekToCurrentSegment();
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
    if (this.isHeld()) return;
    // A tick queued before a seek reports the new position before the seeking
    // event has had a chance to adopt it.
    if (this.video.seeking) return;
    const seg = this.resolveCurrentSegment();
    if (!seg) return;

    const rate = this.getEffectiveRate();
    if (rate !== null && Math.abs(this.video.playbackRate - rate) > 0.001) {
      this.video.playbackRate = rate;
      this.appliedRate = this.video.playbackRate;
    }

    const ct = this.video.currentTime;

    // 0.3 s short of the true end: seeking into the unmuxed tail of a YouTube
    // stream can stall playback rather than fire the next timeupdate. A segment
    // lying wholly in that tail plays to its real end instead.
    const tail = this.video.duration - 0.3;
    const safeEnd = tail > seg.startTime ? Math.min(seg.endTime, tail) : seg.endTime;

    if (ct >= safeEnd) {
      this.advance();
    } else if (ct < seg.startTime) {
      this.seekToCurrentSegment();
    }
  }

  // Only a seek adopts another segment: during playback, reaching the end of
  // one segment is where an adjacent or enclosing one starts, and adopting it
  // there would reset the step's count or loop it forever.
  private onSeeking(): void {
    if (this.isHeld()) return;
    const ct = this.video.currentTime;
    const current = this.resolveCurrentSegment();
    if (current && ct >= current.startTime && ct < current.endTime) return;
    if (this.adoptSegmentAt(ct)) return;
    const ahead = [...this.config.segments].sort((a, b) => a.startTime - b.startTime).filter((s) => s.startTime >= ct);
    for (const segment of ahead) {
      if (this.adoptSegment(segment.id)) {
        this.seekToCurrentSegment();
        return;
      }
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

  private seekToCurrentSegment(): void {
    if (this.isHeld()) return;
    const seg = this.resolveCurrentSegment();
    if (seg && this.video.duration > 0) {
      const seekTo = Math.max(0, Math.min(seg.startTime, this.video.duration));
      this.video.currentTime = seekTo;
    }
  }

  // Half-open, so a boundary shared by two segments belongs to the later one.
  private adoptSegmentAt(time: number): boolean {
    return this.config.segments.some((s) => time >= s.startTime && time < s.endTime && this.adoptSegment(s.id));
  }

  // The current step is tried first so moving within it keeps its iteration.
  private adoptSegment(segId: SegmentId): boolean {
    const { stepIndex, iterationInStep } = this.state;
    const order = [stepIndex, ...this.config.sequence.map((_, i) => i).filter((i) => i !== stepIndex)];
    for (const si of order) {
      const segIdx = this.config.sequence[si]?.segmentIds.indexOf(segId) ?? -1;
      if (segIdx !== -1) {
        this.state = { stepIndex: si, iterationInStep: si === stepIndex ? iterationInStep : 0, segmentIndexInStep: segIdx };
        return true;
      }
    }
    return false;
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
