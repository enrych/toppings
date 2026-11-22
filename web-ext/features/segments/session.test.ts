import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { createFreshConfig } from "./factories";
import { SegmentSession } from "./session";
import { openVideoSegments } from "./store";

function fakeVideo(duration = 100): HTMLVideoElement {
  const video = document.createElement("video");
  Object.defineProperty(video, "duration", { value: duration, configurable: true });
  Object.defineProperty(video, "readyState", { value: 1, configurable: true });
  return video;
}

const settings = { enabled: true, autoLoad: "off" as const, nudgeBaseStep: 1, nudgeMultiplier: 2, nudgeMaxStep: 4 };
let toasts: string[];
let video: HTMLVideoElement;
let store: ReturnType<typeof openVideoSegments>;
let session: SegmentSession;

beforeEach(async () => {
  await chrome.storage.local.clear();
  toasts = [];
  video = fakeVideo();
  store = openVideoSegments("v1");
  session = new SegmentSession({ video, store, settings, toast: (m) => toasts.push(m) });
  await session.init();
});

describe("SegmentSession", () => {
  test("toggle starts a fresh slate, which is stored only once it is edited", async () => {
    await session.toggle();
    expect(session.state.active).toBe(true);
    expect(session.state.config?.segments).toHaveLength(1);
    expect(session.state.config?.segments[0].endTime).toBe(100);

    session.deactivate();
    expect(session.state.active).toBe(false);
    expect(await chrome.storage.local.get()).toEqual({});
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

  test("nudges stop at the neighbouring segment", async () => {
    await session.toggle();
    const [a] = session.state.config!.segments;
    session.mutate((c) => ({ ...c, segments: [{ ...a, endTime: 40 }, { ...a, id: "b", startTime: 50, endTime: 100 }] }));
    video.currentTime = 30;
    for (const _ of [1, 2, 3, 4]) session.nudgeMarker("end", "forward");
    expect(session.state.config!.segments[0].endTime).toBe(50);

    session.mutate((c) => ({ ...c, segments: [{ ...a, endTime: 40 }, c.segments[1]] }));
    video.currentTime = 70;
    for (const _ of [1, 2, 3, 4]) session.nudgeMarker("start", "backward");
    expect(session.state.config!.segments[1].startTime).toBe(40);
  });

  test("the save key names a new slate once, then overwrites it", async () => {
    await session.toggle();
    await session.save();
    video.currentTime = 20;
    session.setStart();
    await session.save();
    expect(session.state.saved.map((c) => c.label)).toEqual(["Segment Config 1"]);
    expect(session.state.saved[0].segments[0].startTime).toBe(20);
    expect(session.loaded).toBe(session.state.saved[0]);
  });

  test("the save key does nothing while segments are off", async () => {
    await session.toggle();
    video.currentTime = 20;
    session.setStart();
    session.deactivate();
    await session.save();
    expect(session.state.saved).toEqual([]);
    expect(await store.getLastUsed()).not.toBeNull();
  });

  test("a failed save says so", async () => {
    const failing = new SegmentSession({ video, store: { ...store, saveConfig: () => Promise.reject(new Error("quota")) }, settings, toast: (m) => toasts.push(m) });
    const logged = spyOn(console, "error").mockImplementation(() => undefined);
    await failing.toggle();
    await failing.saveNamed("Chorus");
    logged.mockRestore();
    expect(toasts).toEqual(["Couldn't save segments"]);
    expect(failing.state.saved).toEqual([]);
  });

  test("restore honours the auto-load setting, and what it loads becomes last used", async () => {
    const config = createFreshConfig(100);
    await store.saveConfig({ ...config, label: "Intro" });
    await store.setDefaultConfig(config.id);
    await session.restore();
    expect(session.state.active).toBe(false);

    const withDefault = new SegmentSession({ video, store, settings: { ...settings, autoLoad: "default" }, toast: (m) => toasts.push(m) });
    await withDefault.restore();
    expect(withDefault.state.config?.label).toBe("Intro");
    expect(toasts).toContain("↺ Segments restored");
    expect((await store.getLastUsed())?.id).toBe(config.id);
  });

  test("merge joins two segments into one", async () => {
    await session.toggle();
    const a = session.state.config!.segments[0];
    session.mutate((c) => ({ ...c, segments: [{ ...a, endTime: 40 }, { ...a, id: "b", startTime: 40 }] }));
    session.merge(a.id, "b");
    expect(session.state.config!.segments).toEqual([a]);
  });

  test("save as named keeps the config it was saved from", async () => {
    await session.toggle();
    await session.saveNamed("First");
    video.currentTime = 20;
    session.setStart();
    await session.saveNamed("Second");
    expect(session.state.saved.map((c) => c.label)).toEqual(["First", "Second"]);
    expect(session.state.saved[0].segments[0].startTime).toBe(0);
    expect(session.state.saved[1].segments[0].startTime).toBe(20);
  });

  test("nothing activates once disposed, even if storage answers later", async () => {
    const config = createFreshConfig(100);
    await store.saveConfig({ ...config, segments: [{ ...config.segments[0], startTime: 10, endTime: 20 }] });
    await store.setDefaultConfig(config.id);
    const restoring = new SegmentSession({ video, store, settings: { ...settings, autoLoad: "default" }, toast: (m) => toasts.push(m) });
    video.currentTime = 50;
    const pending = restoring.restore();
    restoring.dispose();
    await pending;
    expect(restoring.state.active).toBe(false);
    expect(video.currentTime).toBe(50);
    expect(toasts).not.toContain("↺ Segments restored");

    const toggling = new SegmentSession({ video, store, settings, toast: () => undefined });
    const toggled = toggling.toggle();
    toggling.dispose();
    await toggled;
    expect(toggling.state.active).toBe(false);
  });

  test("segments stay off until the video has a finite duration", async () => {
    Object.defineProperty(video, "duration", { value: NaN, configurable: true });
    await session.toggle();
    session.fresh();
    expect(session.state.active).toBe(false);
    expect(await store.getLastUsed()).toBeNull();

    Object.defineProperty(video, "duration", { value: Infinity, configurable: true });
    await session.toggle();
    expect(session.state.active).toBe(false);
  });

  test("segments stay off while an ad plays in the video", async () => {
    const player = document.createElement("div");
    player.className = "html5-video-player ad-showing";
    player.append(video);
    await session.toggle();
    expect(session.state.active).toBe(false);
    player.classList.remove("ad-showing");
    await session.toggle();
    expect(session.state.active).toBe(true);
  });

  test("toggle still starts a fresh slate when storage fails", async () => {
    const failing = new SegmentSession({
      video,
      store: { ...store, getLastUsed: () => Promise.reject(new Error("blocked")) },
      settings,
      toast: () => undefined,
    });
    const logged = spyOn(console, "error").mockImplementation(() => undefined);
    await failing.toggle();
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
    expect(failing.state.active).toBe(true);
  });
});
