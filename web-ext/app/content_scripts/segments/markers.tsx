import React from "dom-chef";
import type { Segment, SegmentId } from "./types";

// Owns the marker elements on YouTube's progress bar and nothing else:
// no playback logic, no storage.

const SEGMENT_COLORS = [
  "#ff3333",
  "#3ea6ff",
  "#4caf50",
  "#ff9800",
  "#9c27b0",
  "#00bcd4",
  "#f5c518",
];

function colorForSegment(index: number): string {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
}

// Right-trapezoid trim handles in a 14×26 viewBox, NLE-style. The flat vertical
// edge faces inward toward the segment and the bottom tip marks the exact cut,
// so the tip must land on `left: X%` — which is what the transform in
// buildMarkerElement compensates for.
function makeMarkerSVG(color: string, segNumber: number, role: "start" | "end"): SVGElement {
  const d = role === "start"
    ? "M 0,26 L 5,0 L 14,0 L 14,26 Z"   // tip bottom-left
    : "M 14,26 L 9,0 L 0,0 L 0,26 Z";   // tip bottom-right

  // Offset into the wide half of the trapezoid, away from the diagonal.
  const tx = role === "start" ? "10" : "4";

  return (
    <svg
      width="14"
      height="26"
      viewBox="0 0 14 26"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: "none", display: "block" }}
    >
      <path
        d={d}
        fill={color}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.75"
        strokeLinejoin="miter"
      />
      <text
        x={tx}
        y="11"
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(255,255,255,0.95)"
        fontSize="8"
        fontFamily="'YouTube Sans','Roboto',monospace"
        fontWeight="bold"
      >
        {segNumber}
      </text>
    </svg>
  ) as unknown as SVGElement;
}

interface MarkerRecord {
  segmentId: SegmentId;
  role: "start" | "end";
  element: HTMLElement;
}

export class SegmentMarkersController {
  private container: HTMLElement;
  private video: HTMLVideoElement;
  private records: MarkerRecord[] = [];
  private segments: Segment[] = [];

  private dragging: MarkerRecord | null = null;
  private mergeTimer: ReturnType<typeof setTimeout> | null = null;
  private mergeCandidate: { keepId: SegmentId; removeId: SegmentId } | null = null;

  private onSegmentsChangedCb: ((segs: Segment[]) => void) | null = null;
  private onMergeRequestCb:
    | ((keepId: SegmentId, removeId: SegmentId) => void)
    | null = null;
  private onDragEndCb: (() => void) | null = null;

  private boundMouseMove = (e: MouseEvent) => this.handleMouseMove(e);
  private boundMouseUp = () => this.handleMouseUp();

  constructor(container: HTMLElement, video: HTMLVideoElement) {
    this.container = container;
    this.video = video;
    // Deliberately sets overflow only: YouTube's progress bar container is
    // already positioned, and overriding `position` breaks its internal layout.
    container.style.overflow = "visible";
  }

  setSegments(segments: Segment[]): void {
    this.segments = segments;
    this.rebuild();
  }

  getSegments(): Segment[] {
    return [...this.segments];
  }

  updateSegmentPosition(
    segmentId: SegmentId,
    role: "start" | "end",
    timeSeconds: number,
  ): void {
    if (!this.video.duration) return;
    const pct = (timeSeconds / this.video.duration) * 100;
    const record = this.records.find(
      (r) => r.segmentId === segmentId && r.role === role,
    );
    if (record) {
      record.element.style.left = `${pct}%`;
    }
    this.segments = this.segments.map((s) =>
      s.id === segmentId
        ? { ...s, [role === "start" ? "startTime" : "endTime"]: timeSeconds }
        : s,
    );
  }

  setActiveSegment(segmentId: SegmentId | null): void {
    this.records.forEach((r) => {
      r.element.style.filter =
        r.segmentId === segmentId
          ? "drop-shadow(0 0 4px rgba(255,255,255,0.8))"
          : "";
    });
  }

  onSegmentsChanged(cb: (segs: Segment[]) => void): void {
    this.onSegmentsChangedCb = cb;
  }

  onMergeRequest(cb: (keepId: SegmentId, removeId: SegmentId) => void): void {
    this.onMergeRequestCb = cb;
  }

  onDragEnd(cb: () => void): void {
    this.onDragEndCb = cb;
  }

  showAll(): void {
    this.records.forEach((r) => {
      r.element.style.display = "block";
    });
  }

  hideAll(): void {
    this.records.forEach((r) => {
      r.element.style.display = "none";
    });
  }

  destroy(): void {
    for (const r of this.records) {
      r.element.remove();
    }
    this.records = [];
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
    if (this.mergeTimer !== null) clearTimeout(this.mergeTimer);
  }

  private rebuild(): void {
    for (const r of this.records) r.element.remove();
    this.records = [];

    const sorted = [...this.segments].sort((a, b) => a.startTime - b.startTime);

    sorted.forEach((seg, i) => {
      const color = colorForSegment(i);
      const segNumber = i + 1;

      const startEl = this.buildMarkerElement(seg, "start", color, segNumber);
      const endEl = this.buildMarkerElement(seg, "end", color, segNumber);

      if (this.video.duration > 0) {
        startEl.style.left = `${(seg.startTime / this.video.duration) * 100}%`;
        endEl.style.left = `${(seg.endTime / this.video.duration) * 100}%`;
      } else {
        startEl.style.left = "0%";
        endEl.style.left = "100%";
      }

      this.container.appendChild(startEl);
      this.container.appendChild(endEl);

      this.records.push({ segmentId: seg.id, role: "start", element: startEl });
      this.records.push({ segmentId: seg.id, role: "end", element: endEl });
    });
  }

  private buildMarkerElement(
    seg: Segment,
    role: "start" | "end",
    color: string,
    segNumber: number,
  ): HTMLElement {
    // Shifts the element so its tip, not its box, sits on the cut line: the
    // start tip is at x=0 so no shift, the end tip is at x=14 so shift a full width.
    const transform = role === "start" ? "translateX(0)" : "translateX(-100%)";

    const el = (
      <div
        data-segment-id={seg.id}
        data-role={role}
        title={`Segment ${segNumber} ${role === "start" ? "in-point" : "out-point"} — drag to adjust`}
        style={{
          position: "absolute",
          bottom: "100%",
          display: "none",
          transform,
          zIndex: "9999",
          cursor: "grab",
          userSelect: "none",
          pointerEvents: "all",
        }}
        onMouseDown={(e: MouseEvent) => this.handleMarkerMouseDown(e, seg.id, role)}
      >
        {makeMarkerSVG(color, segNumber, role)}
      </div>
    ) as HTMLElement;

    return el;
  }

  private handleMarkerMouseDown(
    e: MouseEvent,
    segmentId: SegmentId,
    role: "start" | "end",
  ): void {
    e.preventDefault();
    e.stopPropagation();
    const record = this.records.find(
      (r) => r.segmentId === segmentId && r.role === role,
    );
    if (!record) return;
    this.dragging = record;
    (record.element as HTMLElement).style.cursor = "grabbing";
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.dragging) return;

    const rect = this.container.getBoundingClientRect();
    const rawPct = ((e.clientX - rect.left) / rect.width) * 100;

    const { segmentId, role } = this.dragging;
    const clampedPct = this.clampMarkerPct(rawPct, segmentId, role);

    this.dragging.element.style.left = `${clampedPct}%`;

    const duration = this.video.duration || 1;
    const newTime = (clampedPct / 100) * duration;
    this.segments = this.segments.map((s) => {
      if (s.id !== segmentId) return s;
      return role === "start"
        ? { ...s, startTime: newTime }
        : { ...s, endTime: newTime };
    });

    if (role === "start") {
      this.video.currentTime = newTime;
    }

    this.onSegmentsChangedCb?.(this.segments);
    this.checkMerge(segmentId, role, clampedPct);
  }

  private handleMouseUp(): void {
    if (this.dragging) {
      this.dragging.element.style.cursor = "grab";
    }
    this.dragging = null;
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
    if (this.mergeCandidate === null && this.mergeTimer !== null) {
      clearTimeout(this.mergeTimer);
      this.mergeTimer = null;
    }
    this.onDragEndCb?.();
  }

  private clampMarkerPct(
    rawPct: number,
    segmentId: SegmentId,
    role: "start" | "end",
  ): number {
    const duration = this.video.duration || 1;
    const sorted = [...this.segments].sort((a, b) => a.startTime - b.startTime);
    const idx = sorted.findIndex((s) => s.id === segmentId);
    const seg = sorted[idx];
    const EPSILON_PCT = 0.2;

    if (role === "start") {
      const ownEndPct = (seg.endTime / duration) * 100;
      const prev = sorted[idx - 1];
      const prevEndPct = prev ? (prev.endTime / duration) * 100 : 0;
      return Math.max(prevEndPct + EPSILON_PCT, Math.min(rawPct, ownEndPct - EPSILON_PCT));
    } else {
      const ownStartPct = (seg.startTime / duration) * 100;
      const next = sorted[idx + 1];
      const nextStartPct = next ? (next.startTime / duration) * 100 : 100;
      return Math.min(nextStartPct - EPSILON_PCT, Math.max(rawPct, ownStartPct + EPSILON_PCT));
    }
  }

  private static readonly MERGE_THRESHOLD_PCT = 1.5;
  private static readonly MERGE_HOLD_MS = 500;

  private checkMerge(
    draggedSegId: SegmentId,
    role: "start" | "end",
    pct: number,
  ): void {
    const sorted = [...this.segments].sort((a, b) => a.startTime - b.startTime);
    const duration = this.video.duration || 1;
    const threshold = SegmentMarkersController.MERGE_THRESHOLD_PCT;

    let candidate: { keepId: SegmentId; removeId: SegmentId } | null = null;

    if (role === "end") {
      const idx = sorted.findIndex((s) => s.id === draggedSegId);
      const next = sorted[idx + 1];
      if (next) {
        const nextStartPct = (next.startTime / duration) * 100;
        if (Math.abs(pct - nextStartPct) < threshold) {
          candidate = { keepId: draggedSegId, removeId: next.id };
        }
      }
    } else {
      const idx = sorted.findIndex((s) => s.id === draggedSegId);
      const prev = sorted[idx - 1];
      if (prev) {
        const prevEndPct = (prev.endTime / duration) * 100;
        if (Math.abs(pct - prevEndPct) < threshold) {
          candidate = { keepId: prev.id, removeId: draggedSegId };
        }
      }
    }

    if (candidate) {
      this.applyMergePulse(candidate.keepId, candidate.removeId, true);
      if (
        this.mergeCandidate?.keepId !== candidate.keepId ||
        this.mergeCandidate?.removeId !== candidate.removeId
      ) {
        if (this.mergeTimer !== null) clearTimeout(this.mergeTimer);
        this.mergeCandidate = candidate;
        this.mergeTimer = setTimeout(() => {
          if (this.mergeCandidate) {
            const { keepId, removeId } = this.mergeCandidate;
            this.onMergeRequestCb?.(keepId, removeId);
            this.mergeCandidate = null;
            this.mergeTimer = null;
          }
        }, SegmentMarkersController.MERGE_HOLD_MS);
      }
    } else {
      if (this.mergeCandidate) {
        this.applyMergePulse(this.mergeCandidate.keepId, this.mergeCandidate.removeId, false);
        this.mergeCandidate = null;
      }
      if (this.mergeTimer !== null) {
        clearTimeout(this.mergeTimer);
        this.mergeTimer = null;
      }
    }
  }

  private applyMergePulse(
    keepId: SegmentId,
    removeId: SegmentId,
    active: boolean,
  ): void {
    [keepId, removeId].forEach((id) => {
      this.records
        .filter((r) => r.segmentId === id)
        .forEach((r) => {
          r.element.style.animation = active
            ? "tppng-merge-pulse 0.4s ease-in-out infinite alternate"
            : "";
        });
    });
  }
}
