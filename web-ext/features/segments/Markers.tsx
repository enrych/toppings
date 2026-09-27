import { useRef } from "preact/hooks";
import { colorForIndex } from "./format";
import type { Segment, SegmentId } from "./types";

type Role = "start" | "end";

export interface MarkersProps {
  segments: Segment[];
  duration: number;
  // The progress bar, for turning pointer positions into times.
  track: HTMLElement;
  onPreview: (segments: Segment[]) => void;
  // Scrubbing a start marker follows it with the playhead.
  onSeek: (time: number) => void;
  onCommit: () => void;
  onMerge: (keepId: SegmentId, removeId: SegmentId) => void;
}

const EPSILON_PCT = 0.2;
const MERGE_THRESHOLD_PCT = 1.5;
const MERGE_HOLD_MS = 500;

// The host covers YouTube's 6px progress-bar container. The visible bar is
// 4px tall inside it and grows to 6px on hover, so the tint is centred at 4px
// and the cut line spans the full container.
const style = `
  :host { position: absolute; inset: 0; pointer-events: none; z-index: 40; }
  .range {
    position: absolute; top: 50%; height: 4px; transform: translateY(-50%);
    background: var(--seg); opacity: .45; border-radius: 1px;
  }
  .marker {
    position: absolute; top: 0; bottom: 0; width: 0;
    color: var(--seg); cursor: ew-resize; touch-action: none; pointer-events: none;
  }
  .grab { position: absolute; left: -8px; width: 16px; top: -14px; bottom: -4px; pointer-events: all; }
  .cut { position: absolute; left: -1px; width: 2px; top: -3px; bottom: -3px; background: currentColor; border-radius: 1px; box-shadow: 0 0 0 .5px rgba(0,0,0,.35); }
  .head { position: absolute; left: -6px; bottom: calc(100% + 2px); filter: drop-shadow(0 1px 1px rgba(0,0,0,.5)); }
  .head svg { display: block; }
  .marker:hover .head, .marker[data-dragging] .head, .marker:hover .cut, .marker[data-dragging] .cut { filter: brightness(1.25); }
  .marker[data-merging] .cut, .marker[data-merging] .head { animation: pulse .4s ease-in-out infinite alternate; }
  @keyframes pulse { from { filter: brightness(1); } to { filter: brightness(1.9); } }
`;

// Editors draw in and out points as a trapezoid head on a line through the
// timeline: the line is the exact cut, the head is what you grab.
function Handle() {
  return (
    <>
      <span class="head">
        <svg width="12" height="8" viewBox="0 0 12 8">
          <path d="M1 0H11A1 1 0 0 1 11.8 1.6L8 8H4L.2 1.6A1 1 0 0 1 1 0Z" fill="currentColor" />
        </svg>
      </span>
      <span class="cut" />
    </>
  );
}

const byStart = (segments: Segment[]) => [...segments].sort((a, b) => a.startTime - b.startTime);

export function Markers({ segments, duration, track, onPreview, onSeek, onCommit, onMerge }: MarkersProps) {
  const drag = useRef<{ id: SegmentId; role: Role } | null>(null);
  const merge = useRef<{ keepId: SegmentId; removeId: SegmentId; timer: ReturnType<typeof setTimeout> } | null>(null);
  const sorted = byStart(segments);
  const pct = (time: number) => (duration > 0 ? (time / duration) * 100 : 0);

  const clearMerge = () => {
    if (merge.current) clearTimeout(merge.current.timer);
    merge.current = null;
  };

  const clamp = (raw: number, id: SegmentId, role: Role) => {
    const index = sorted.findIndex((s) => s.id === id);
    const own = sorted[index];
    if (role === "start") {
      const floor = sorted[index - 1] ? pct(sorted[index - 1].endTime) : 0;
      return Math.max(floor + EPSILON_PCT, Math.min(raw, pct(own.endTime) - EPSILON_PCT));
    }
    const ceiling = sorted[index + 1] ? pct(sorted[index + 1].startTime) : 100;
    return Math.min(ceiling - EPSILON_PCT, Math.max(raw, pct(own.startTime) + EPSILON_PCT));
  };

  // Holding a marker against its neighbour for a moment merges the two.
  const watchMerge = (id: SegmentId, role: Role, at: number) => {
    const index = sorted.findIndex((s) => s.id === id);
    const neighbour = role === "end" ? sorted[index + 1] : sorted[index - 1];
    const edge = neighbour ? pct(role === "end" ? neighbour.startTime : neighbour.endTime) : null;
    const candidate = neighbour && edge !== null && Math.abs(at - edge) < MERGE_THRESHOLD_PCT
      ? role === "end" ? { keepId: id, removeId: neighbour.id } : { keepId: neighbour.id, removeId: id }
      : null;
    if (!candidate) {
      clearMerge();
      return;
    }
    if (merge.current?.keepId === candidate.keepId && merge.current.removeId === candidate.removeId) return;
    clearMerge();
    merge.current = {
      ...candidate,
      timer: setTimeout(() => {
        merge.current = null;
        onMerge(candidate.keepId, candidate.removeId);
      }, MERGE_HOLD_MS),
    };
  };

  const onPointerDown = (e: PointerEvent, id: SegmentId, role: Role) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id, role };
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!drag.current || !duration) return;
    const { id, role } = drag.current;
    const rect = track.getBoundingClientRect();
    const at = clamp(((e.clientX - rect.left) / rect.width) * 100, id, role);
    const time = (at / 100) * duration;
    onPreview(segments.map((s) => (s.id === id ? { ...s, [role === "start" ? "startTime" : "endTime"]: time } : s)));
    if (role === "start") onSeek(time);
    watchMerge(id, role, at);
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    if (merge.current === null) clearMerge();
    onCommit();
  };

  return (
    <>
      <style>{style}</style>
      {sorted.map((segment, index) => (
        <div
          key={`${segment.id}-range`}
          class="range"
          style={{ "--seg": colorForIndex(index), left: `${pct(segment.startTime)}%`, width: `${pct(segment.endTime) - pct(segment.startTime)}%` }}
        />
      ))}
      {sorted.flatMap((segment, index) =>
        (["start", "end"] as const).map((role) => (
          <div
            key={`${segment.id}-${role}`}
            class="marker"
            data-role={role}
            data-dragging={drag.current?.id === segment.id && drag.current.role === role ? "" : undefined}
            data-merging={merge.current && (merge.current.keepId === segment.id || merge.current.removeId === segment.id) ? "" : undefined}
            style={{ "--seg": colorForIndex(index), left: `${pct(role === "start" ? segment.startTime : segment.endTime)}%` }}
          >
            <Handle />
            <span
              class="grab"
              title={`Segment ${index + 1} ${role === "start" ? "in" : "out"} point. Drag to adjust.`}
              onPointerDown={(e) => onPointerDown(e, segment.id, role)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
        )),
      )}
    </>
  );
}
