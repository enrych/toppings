import { MAX_RATE, MIN_RATE } from "@/youtube/player";
import type { Segment, SegmentConfig, SegmentId } from "./types";

// Decides when to seek and at what rate, and nothing else: no storage, no UI,
// no DOM beyond the video element. Keep it that way — the panel and markers
// both drive this class, so anything stateful added here leaks into both.

interface EngineState {
  // null once the last segment has played its last pass: playback runs on.
  segmentId: SegmentId | null;
  pass: number;
}

export class SegmentEngine {
  private video: HTMLVideoElement;
  private config: SegmentConfig;
  private state: EngineState = { segmentId: null, pass: 0 };
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
    this.state = this.firstSegment();
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
    this.releaseRate();
    this.originalRate = null;
    this._active = false;
  }

  // Reconciles rather than restarts so that dragging a marker, which swaps the
  // config on every pointer move, does not restart playback on every frame.
  setConfig(config: SegmentConfig): void {
    const finished = this.state.segmentId === null;
    this.config = config;
    if (!this._active) return;
    // An edit that leaves the playhead outside the segment it was in restarts
    // that segment, rather than the next tick advancing past what is being edited.
    const current = this.currentSegment();
    const ct = this.video.currentTime;
    if (current && ct >= current.startTime && ct <= current.endTime) return;
    if (this.adoptSegmentAt(ct) || finished) return;
    if (!current) this.state = this.firstSegment();
    this.seekToCurrentSegment();
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
    const seg = this.currentSegment();
    if (!seg) return;

    // Clamped because a rate outside the media element's range throws on assignment.
    if (seg.rate !== null && Number.isFinite(seg.rate)) {
      const rate = Math.min(MAX_RATE, Math.max(MIN_RATE, seg.rate));
      if (Math.abs(this.video.playbackRate - rate) > 0.001) {
        this.video.playbackRate = rate;
        this.appliedRate = this.video.playbackRate;
      }
    }

    const ct = this.video.currentTime;

    // 0.3 s short of the true end: seeking into the unmuxed tail of a YouTube
    // stream can stall playback rather than fire the next timeupdate. A segment
    // lying wholly in that tail plays to its real end instead.
    const tail = this.video.duration - 0.3;
    const safeEnd = tail > seg.startTime ? Math.min(seg.endTime, tail) : seg.endTime;

    if (ct >= safeEnd) {
      this.advance(seg);
    } else if (ct < seg.startTime) {
      this.seekToCurrentSegment();
    }
  }

  // Only a seek adopts another segment: during playback, reaching the end of
  // one segment is where an adjacent one starts, and adopting it there would
  // cut the first segment's passes short.
  private onSeeking(): void {
    if (this.isHeld()) return;
    const ct = this.video.currentTime;
    const current = this.currentSegment();
    if (current && ct >= current.startTime && ct < current.endTime) return;
    if (this.adoptSegmentAt(ct)) return;
    const ahead = this.ordered().find((s) => s.startTime >= ct);
    // The engine's own seek toward a segment past the video's end lands short
    // of it; seeking there again would never stop.
    if (!ahead || ahead.id === current?.id) return;
    this.state = { segmentId: ahead.id, pass: 0 };
    this.seekToCurrentSegment();
  }

  private advance(seg: Segment): void {
    const pass = this.state.pass + 1;
    if (seg.loops === null || pass < seg.loops) {
      this.state.pass = pass;
      this.seekToCurrentSegment();
      return;
    }
    const ordered = this.ordered();
    const next = ordered[ordered.indexOf(seg) + 1];
    this.state = { segmentId: next?.id ?? null, pass: 0 };
    if (next) this.seekToCurrentSegment();
    else this.releaseRate();
  }

  private seekToCurrentSegment(): void {
    if (this.isHeld()) return;
    const seg = this.currentSegment();
    if (seg && this.video.duration > 0) {
      const seekTo = Math.max(0, Math.min(seg.startTime, this.video.duration));
      this.video.currentTime = seekTo;
    }
  }

  // Half-open, so a boundary shared by two segments belongs to the later one.
  // Staying in the current segment keeps its pass count.
  private adoptSegmentAt(time: number): boolean {
    const segment = this.config.segments.find((s) => time >= s.startTime && time < s.endTime);
    if (!segment) return false;
    if (segment.id !== this.state.segmentId) this.state = { segmentId: segment.id, pass: 0 };
    return true;
  }

  // Only undoes a rate the engine set and nobody has changed since, so a speed
  // the user picked while segments ran survives them ending.
  private releaseRate(): void {
    if (this.originalRate !== null && this.appliedRate === this.video.playbackRate) {
      this.video.playbackRate = this.originalRate;
    }
    this.appliedRate = null;
  }

  private ordered(): Segment[] {
    return [...this.config.segments].sort((a, b) => a.startTime - b.startTime);
  }

  private firstSegment(): EngineState {
    return { segmentId: this.ordered()[0]?.id ?? null, pass: 0 };
  }

  private currentSegment(): Segment | null {
    return this.config.segments.find((s) => s.id === this.state.segmentId) ?? null;
  }
}
