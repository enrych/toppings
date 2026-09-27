import { beforeEach, describe, expect, test } from "bun:test";
import { createFreshConfig } from "./factories";
import { SegmentSession } from "./session";
import { memorySegmentStorage, openVideoSegments } from "./store";

function fakeVideo(duration = 100): HTMLVideoElement {
  const video = document.createElement("video");
  Object.defineProperty(video, "duration", { value: duration, configurable: true });
  Object.defineProperty(video, "readyState", { value: 1, configurable: true });
  return video;
}

const settings = { autoLoad: "off" as const, nudgeBaseStep: 1, nudgeMultiplier: 2, nudgeMaxStep: 4 };
let toasts: string[];
let video: HTMLVideoElement;
let store: ReturnType<typeof openVideoSegments>;
let session: SegmentSession;

beforeEach(async () => {
  toasts = [];
  video = fakeVideo();
  store = openVideoSegments(memorySegmentStorage(), "v1");
  session = new SegmentSession({ video, store, settings, toast: (m) => toasts.push(m) });
  await session.init();
});

describe("SegmentSession", () => {
  test("toggle starts a fresh slate, then remembers it as last used", async () => {
    await session.toggle();
    expect(session.state.active).toBe(true);
    expect(session.state.config?.segments).toHaveLength(1);
    expect(session.state.config?.segments[0].endTime).toBe(100);

    session.deactivate();
    expect(session.state.active).toBe(false);
    expect((await store.getLastUsed())?.id).toBe(session.state.config?.id);
  });

  test("set start and end move the segment under the playhead", async () => {
    await session.toggle();
    video.currentTime = 20;
    session.setStart();
    video.currentTime = 60;
    session.setEnd();
    const [segment] = session.state.config!.segments;
    expect(segment.startTime).toBe(20);
    expect(segment.endTime).toBe(60);
    expect((await store.getLastUsed())?.segments[0].endTime).toBe(60);
  });

  test("repeated nudges accelerate up to the maximum", async () => {
    await session.toggle();
    video.currentTime = 50;
    session.setStart();
    for (const _ of [1, 2, 3, 4]) session.nudgeMarker("start", "backward");
    // 1 + 2 + 4 + 4 = 11 seconds back from 50
    expect(session.state.config!.segments[0].startTime).toBe(39);
    expect(video.currentTime).toBe(39);
  });

  test("named saves land in the saved list and become the active label", async () => {
    await session.toggle();
    await session.saveNamed("Chorus");
    expect(session.state.saved.map((c) => c.label)).toEqual(["Chorus"]);
    expect(session.state.config?.label).toBe("Chorus");
    await session.saveDefault();
    expect(session.state.defaultId).toBe(session.state.config!.id);
  });

  test("restore honours the global setting and a per-video pin", async () => {
    const config = createFreshConfig(100);
    await store.saveConfig({ ...config, label: "Pinned" });
    await store.setDefaultConfig(config.id);
    await session.restore();
    expect(session.state.active).toBe(false);

    const withDefault = new SegmentSession({ video, store, settings: { ...settings, autoLoad: "default" }, toast: (m) => toasts.push(m) });
    await withDefault.restore();
    expect(withDefault.state.config?.label).toBe("Pinned");
    expect(toasts).toContain("↺ Segments restored");

    await store.setPin("off");
    const pinnedOff = new SegmentSession({ video, store, settings: { ...settings, autoLoad: "default" }, toast: () => undefined });
    await pinnedOff.restore();
    expect(pinnedOff.state.active).toBe(false);
  });

  test("merge joins two segments into one", async () => {
    await session.toggle();
    const a = session.state.config!.segments[0];
    session.mutate((c) => ({
      ...c,
      segments: [{ ...a, endTime: 40 }, { id: "b", startTime: 40, endTime: 100 }],
      sequence: [{ ...c.sequence[0], segmentIds: [a.id, "b"] }],
    }));
    session.merge(a.id, "b");
    expect(session.state.config!.segments).toHaveLength(1);
    expect(session.state.config!.segments[0].endTime).toBe(100);
    expect(session.state.config!.sequence[0].segmentIds).toEqual([a.id]);
  });

  test("the save key clears the last-used slate while inactive", async () => {
    await session.toggle();
    session.deactivate();
    expect(await store.getLastUsed()).not.toBeNull();
    await session.save();
    expect(await store.getLastUsed()).toBeNull();
  });
});
