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

// Mounted inside YouTube's progress bar, which stacks its progress lists at
// 32, chapter marks at 40 and the playhead dot at 43: at 42 the markers sit
// under the dot. Everything is drawn above the bar, never on it, so the bar
// and its chapter gaps stay exactly as YouTube draws them.
const markerStyle = `
  :host { position: absolute; inset: 0; z-index: 42; pointer-events: none; }
  .rail { position: absolute; bottom: calc(100% + 3px); height: 2px; background: var(--seg); opacity: .75; border-radius: 1px; }
  .marker { position: absolute; bottom: 100%; width: 0; height: 0; color: var(--seg); }
  .head { position: absolute; left: -7px; bottom: 1px; filter: drop-shadow(0 1px 1.5px rgba(0,0,0,.6)); transition: transform .12s ease, filter .12s ease; transform-origin: 50% 100%; }
  .head svg { display: block; }
  .grab { position: absolute; left: -10px; width: 20px; bottom: -2px; height: 16px; cursor: ew-resize; touch-action: none; pointer-events: all; }
  .marker:hover .head, .marker[data-dragging] .head { transform: scale(1.15); filter: drop-shadow(0 1px 2px rgba(0,0,0,.7)) brightness(1.15); }
  .marker[data-merging] .head { animation: pulse .4s ease-in-out infinite alternate; }
  @keyframes pulse { from { filter: brightness(1); } to { filter: brightness(1.9); } }
`;

// An editor's in or out point: a trapezoid whose narrow edge sits on the
// timeline at the exact cut.
function Head() {
  return (
    <span class="head">
      <svg width="14" height="9" viewBox="0 0 14 9">
        <path d="M1.2 0H12.8A1.2 1.2 0 0 1 13.9 1.7L9.6 8.4A1.2 1.2 0 0 1 8.6 9H5.4A1.2 1.2 0 0 1 4.4 8.4L.1 1.7A1.2 1.2 0 0 1 1.2 0Z" fill="currentColor" stroke="rgba(0,0,0,.35)" stroke-width=".6" />
      </svg>
    </span>
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
      <style>{markerStyle}</style>
      {sorted.map((segment, index) => (
        <div
          key={`${segment.id}-rail`}
          class="rail"
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
            <Head />
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
