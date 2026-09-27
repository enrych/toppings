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

const style = `
  :host { position: absolute; left: 0; right: 0; bottom: 100%; height: 0; overflow: visible; pointer-events: none; }
  .marker {
    position: absolute; bottom: 0; z-index: 9999; cursor: grab; user-select: none; pointer-events: all; touch-action: none;
  }
  .marker[data-role="end"] { transform: translateX(-100%); }
  .marker[data-dragging] { cursor: grabbing; }
  .marker[data-merging] { animation: pulse .4s ease-in-out infinite alternate; }
  svg { display: block; pointer-events: none; }
  @keyframes pulse { from { filter: brightness(1); } to { filter: brightness(1.8); } }
`;

// Right-trapezoid trim handles, NLE-style: the flat edge faces the segment and
// the bottom tip marks the exact cut, which is why the end marker is shifted
// back by its own width.
function Handle({ color, number, role }: { color: string; number: number; role: Role }) {
  const path = role === "start" ? "M 0,26 L 5,0 L 14,0 L 14,26 Z" : "M 14,26 L 9,0 L 0,0 L 0,26 Z";
  return (
    <svg width="14" height="26" viewBox="0 0 14 26">
      <path d={path} fill={color} stroke="rgba(255,255,255,.25)" stroke-width="0.75" />
      <text x={role === "start" ? 10 : 4} y="11" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,.95)" font-size="8" font-weight="bold" font-family="'YouTube Sans', Roboto, monospace">
        {number}
      </text>
    </svg>
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
      {sorted.flatMap((segment, index) =>
        (["start", "end"] as const).map((role) => (
          <div
            key={`${segment.id}-${role}`}
            class="marker"
            data-role={role}
            data-dragging={drag.current?.id === segment.id && drag.current.role === role ? "" : undefined}
            data-merging={merge.current && (merge.current.keepId === segment.id || merge.current.removeId === segment.id) ? "" : undefined}
            style={{ left: `${pct(role === "start" ? segment.startTime : segment.endTime)}%` }}
            title={`Segment ${index + 1} ${role === "start" ? "in" : "out"}-point — drag to adjust`}
            onPointerDown={(e) => onPointerDown(e, segment.id, role)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <Handle color={colorForIndex(index)} number={index + 1} role={role} />
          </div>
        )),
      )}
    </>
  );
}
