import { describe, expect, test } from "bun:test";
import { SegmentEngine } from "./engine";
import type { Segment, SegmentConfig } from "./types";

function fakeVideo(duration = 100): HTMLVideoElement {
  const video = document.createElement("video");
  Object.defineProperty(video, "duration", { value: duration, configurable: true });
  return video;
}

function config(...segments: Array<Partial<Segment> & Pick<Segment, "id" | "startTime" | "endTime">>): SegmentConfig {
  return { id: "c", label: "Test", segments: segments.map((s) => ({ rate: null, loops: null, ...s })) };
}

// happy-dom never fires seeking, so tests play the browser's part.
function playTo(video: HTMLVideoElement, time: number): void {
  video.currentTime = time;
  video.dispatchEvent(new Event("timeupdate"));
}

function seekTo(video: HTMLVideoElement, time: number): void {
  video.currentTime = time;
  video.dispatchEvent(new Event("seeking"));
  video.dispatchEvent(new Event("timeupdate"));
}

describe("SegmentEngine", () => {
  test("a segment without a loop count loops forever", () => {
    const video = fakeVideo();
    new SegmentEngine(video, config({ id: "a", startTime: 10, endTime: 20 }, { id: "b", startTime: 30, endTime: 40 })).start();
    for (let i = 0; i < 5; i++) {
      playTo(video, 20);
      expect(video.currentTime).toBe(10);
    }
  });

  test("each segment plays its loop count, then playback runs on past the last", () => {
    const video = fakeVideo();
    new SegmentEngine(video, config({ id: "b", startTime: 10, endTime: 20, loops: 1 }, { id: "a", startTime: 0, endTime: 10, loops: 2 })).start();
    const visited: number[] = [];
    for (let i = 0; i < 3; i++) {
      playTo(video, video.currentTime + 10);
      video.dispatchEvent(new Event("seeking"));
      visited.push(video.currentTime);
    }
    expect(visited).toEqual([0, 10, 20]);
    playTo(video, 50);
    expect(video.currentTime).toBe(50);
  });

  test("seeking back into a segment after the last pass plays it again", () => {
    const video = fakeVideo();
    new SegmentEngine(video, config({ id: "a", startTime: 10, endTime: 20, loops: 1, rate: 2 })).start();
    playTo(video, 15);
    playTo(video, 20);
    expect(video.playbackRate).toBe(1);
    seekTo(video, 12);
    expect(video.playbackRate).toBe(2);
    playTo(video, 20);
    playTo(video, 30);
    expect(video.currentTime).toBe(30);
  });

  test("a user seek into another segment adopts it", () => {
    const video = fakeVideo();
    new SegmentEngine(video, config({ id: "a", startTime: 0, endTime: 10 }, { id: "b", startTime: 50, endTime: 60 })).start();
    seekTo(video, 55);
    expect(video.currentTime).toBe(55);
    playTo(video, 60);
    expect(video.currentTime).toBe(50);
  });

  test("editing a segment so the playhead falls outside it keeps that segment in view", () => {
    const video = fakeVideo(200);
    const a = { id: "a", startTime: 0, endTime: 50 };
    const b = { id: "b", startTime: 100, endTime: 150 };
    const engine = new SegmentEngine(video, config(a, b));
    video.currentTime = 120;
    engine.start();
    engine.setConfig(config(a, { ...b, endTime: 110 }));
    video.dispatchEvent(new Event("timeupdate"));
    expect(video.currentTime).toBe(100);
  });

  test("a rate outside the media range is clamped rather than thrown", () => {
    const video = fakeVideo();
    new SegmentEngine(video, config({ id: "a", startTime: 0, endTime: 50, rate: 400 })).start();
    playTo(video, 5);
    expect(video.playbackRate).toBe(16);
  });

  test("a segment inside the last 0.3 s plays instead of seeking every tick", () => {
    const video = fakeVideo();
    new SegmentEngine(video, config({ id: "a", startTime: 99.8, endTime: 100 })).start();
    expect(video.currentTime).toBe(99.8);
    playTo(video, 99.9);
    expect(video.currentTime).toBe(99.9);
  });

  test("a mid-roll ad in the same video is left alone, and segments resume after it", () => {
    const video = fakeVideo();
    let ad = false;
    new SegmentEngine(video, config({ id: "a", startTime: 40, endTime: 60, rate: 0.5 }), () => ad).start();
    playTo(video, 45);
    ad = true;
    video.playbackRate = 1;
    seekTo(video, 3);
    playTo(video, 20);
    expect(video.currentTime).toBe(20);
    expect(video.playbackRate).toBe(1);
    ad = false;
    playTo(video, 45);
    expect(video.currentTime).toBe(45);
    expect(video.playbackRate).toBe(0.5);
    playTo(video, 60);
    expect(video.currentTime).toBe(40);
  });

  test("a segment starting past the video's end does not seek forever", async () => {
    const video = fakeVideo(100);
    let time = 0;
    let seeks = 0;
    // Browsers fire seeking for every seek, the engine's own included.
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: () => time,
      set: (t: number) => {
        time = t;
        if (++seeks < 50) queueMicrotask(() => video.dispatchEvent(new Event("seeking")));
      },
    });
    new SegmentEngine(video, config({ id: "a", startTime: 120, endTime: 140 })).start();
    await new Promise((r) => setTimeout(r, 0));
    expect(seeks).toBeLessThan(3);
  });

  test("stop leaves a rate the user chose alone", () => {
    const video = fakeVideo();
    const engine = new SegmentEngine(video, config({ id: "a", startTime: 0, endTime: 50 }));
    engine.start();
    video.playbackRate = 1.5;
    playTo(video, 5);
    engine.stop();
    expect(video.playbackRate).toBe(1.5);
  });

  test("stop restores the rate the engine replaced", () => {
    const video = fakeVideo();
    const engine = new SegmentEngine(video, config({ id: "a", startTime: 0, endTime: 50, rate: 0.5 }));
    engine.start();
    playTo(video, 5);
    expect(video.playbackRate).toBe(0.5);
    engine.stop();
    expect(video.playbackRate).toBe(1);
  });
});
