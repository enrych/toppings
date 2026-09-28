import { afterEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { Markers } from "./Markers";
import type { Segment } from "./types";

const TRACK_WIDTH = 1000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

let container: HTMLElement;
let errors: unknown[];
const onError = (event: ErrorEvent) => errors.push(event.error);

afterEach(() => {
  render(null, container);
  container.remove();
  window.removeEventListener("error", onError);
});

// Stands in for the session: previews and merges come back as new props.
function harness(initial: Segment[], duration = 100) {
  container = document.createElement("div");
  document.body.append(container);
  errors = [];
  window.addEventListener("error", onError);
  const track = document.createElement("div");
  track.getBoundingClientRect = () => new DOMRect(0, 0, TRACK_WIDTH, 4);
  const state = { segments: initial, previews: [] as Segment[][], merges: [] as string[][] };
  const draw = () =>
    render(
      h(Markers, {
        segments: state.segments,
        duration,
        track,
        onPreview: (segments) => {
          state.previews.push(segments);
          state.segments = segments;
          draw();
        },
        onSeek: () => undefined,
        onCommit: () => undefined,
        onMerge: (keepId, removeId) => {
          state.merges.push([keepId, removeId]);
          const remove = state.segments.find((s) => s.id === removeId)!;
          state.segments = state.segments.filter((s) => s !== remove).map((s) => (s.id === keepId ? { ...s, endTime: remove.endTime } : s));
          draw();
        },
      }),
      container,
    );
  draw();
  const grab = (segmentIndex: number, role: "start" | "end") =>
    container.querySelectorAll(".marker")[segmentIndex * 2 + (role === "start" ? 0 : 1)].querySelector(".grab")!;
  const pointer = (target: Element, type: string, pct: number) =>
    target.dispatchEvent(new PointerEvent(type, { clientX: (pct / 100) * TRACK_WIDTH, pointerId: 1, bubbles: true }));
  return { state, grab, pointer };
}

const pair = (): Segment[] => [
  { id: "a", startTime: 0, endTime: 40 },
  { id: "b", startTime: 50, endTime: 100 },
];

describe("Markers", () => {
  test("releasing before the hold elapses cancels the merge", async () => {
    const { state, grab, pointer } = harness(pair());
    const end = grab(0, "end");
    pointer(end, "pointerdown", 40);
    pointer(end, "pointermove", 49);
    pointer(end, "pointerup", 49);
    await wait(600);
    expect(state.merges).toEqual([]);
  });

  test("a merge ends the drag, so the merged range survives further moves", async () => {
    const { state, grab, pointer } = harness(pair());
    const end = grab(0, "end");
    pointer(end, "pointerdown", 40);
    pointer(end, "pointermove", 49);
    await wait(600);
    expect(state.merges).toEqual([["a", "b"]]);
    pointer(grab(0, "end"), "pointermove", 45);
    expect(state.segments).toEqual([{ id: "a", startTime: 0, endTime: 100 }]);
  });

  test("merging away the segment being dragged by its start leaves nothing to trip on", async () => {
    const { state, grab, pointer } = harness(pair());
    const start = grab(1, "start");
    pointer(start, "pointerdown", 50);
    pointer(start, "pointermove", 40.5);
    await wait(600);
    expect(state.merges).toEqual([["a", "b"]]);
    pointer(grab(0, "end"), "pointermove", 60);
    expect(errors).toEqual([]);
    expect(state.segments).toEqual([{ id: "a", startTime: 0, endTime: 100 }]);
  });

  test("unmounting cancels a pending merge", async () => {
    const { state, grab, pointer } = harness(pair());
    const end = grab(0, "end");
    pointer(end, "pointerdown", 40);
    pointer(end, "pointermove", 49);
    render(null, container);
    await wait(600);
    expect(state.merges).toEqual([]);
  });

  test("a start marker never passes its own end, even inside a longer segment", () => {
    const { state, grab, pointer } = harness(
      [
        { id: "a", startTime: 0, endTime: 100 },
        { id: "b", startTime: 40, endTime: 50 },
      ],
      200,
    );
    const start = grab(1, "start");
    pointer(start, "pointerdown", 20);
    pointer(start, "pointermove", 22);
    const b = state.segments.find((s) => s.id === "b")!;
    expect(b.startTime).toBeLessThan(b.endTime);
    expect(b.startTime).toBeGreaterThanOrEqual(0);
  });
});
