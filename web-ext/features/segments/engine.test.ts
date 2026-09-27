import { describe, expect, test } from "bun:test";
import { SegmentEngine } from "./engine";
import type { PlayStep, Segment, SegmentConfig } from "./types";

function fakeVideo(duration = 100): HTMLVideoElement {
  const video = document.createElement("video");
  Object.defineProperty(video, "duration", { value: duration, configurable: true });
  return video;
}

function config(segments: Segment[], sequence: Array<Partial<PlayStep> & { segmentIds: string[] }>): SegmentConfig {
  return {
    id: "c",
    label: "Test",
    segments,
    sequence: sequence.map((step, i) => ({ id: `step${i}`, count: 0, playbackRate: null, perIterationRates: [], ...step })),
    shortcutKey: "",
    createdAt: 0,
    updatedAt: 0,
  };
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
  test("adjacent segments play through their step's count before the next step", () => {
    const video = fakeVideo();
    const engine = new SegmentEngine(
      video,
      config(
        [
          { id: "a", startTime: 0, endTime: 10 },
          { id: "b", startTime: 10, endTime: 20 },
          { id: "c", startTime: 30, endTime: 40 },
        ],
        [{ segmentIds: ["a", "b"], count: 2 }, { segmentIds: ["c"], count: 1 }],
      ),
    );
    engine.start();
    const visited: number[] = [];
    for (let i = 0; i < 4; i++) {
      playTo(video, video.currentTime + 10);
      video.dispatchEvent(new Event("seeking"));
      visited.push(video.currentTime);
    }
    expect(visited).toEqual([10, 0, 10, 30]);
  });

  test("a segment nested in another ends on its own end", () => {
    const video = fakeVideo(200);
    const engine = new SegmentEngine(
      video,
      config(
        [
          { id: "a", startTime: 0, endTime: 100 },
          { id: "b", startTime: 40, endTime: 50 },
        ],
        [{ segmentIds: ["a", "b"] }],
      ),
    );
    engine.start();
    playTo(video, 100);
    expect(video.currentTime).toBe(40);
    playTo(video, 50);
    expect(video.currentTime).toBe(0);
  });

  test("a user seek into another segment adopts it", () => {
    const video = fakeVideo();
    const engine = new SegmentEngine(
      video,
      config(
        [
          { id: "a", startTime: 0, endTime: 10 },
          { id: "b", startTime: 50, endTime: 60 },
        ],
        [{ segmentIds: ["a"] }, { segmentIds: ["b"] }],
      ),
    );
    engine.start();
    seekTo(video, 55);
    expect(video.currentTime).toBe(55);
    expect(engine.getCurrentSegment()?.id).toBe("b");
  });

  test("editing a segment so the playhead falls outside it keeps that segment in view", () => {
    const video = fakeVideo(200);
    const segments = [
      { id: "a", startTime: 0, endTime: 50 },
      { id: "b", startTime: 100, endTime: 150 },
    ];
    const engine = new SegmentEngine(video, config(segments, [{ segmentIds: ["a", "b"] }]));
    video.currentTime = 120;
    engine.start();
    engine.setConfig(config([segments[0], { ...segments[1], endTime: 110 }], [{ segmentIds: ["a", "b"] }]));
    video.dispatchEvent(new Event("timeupdate"));
    expect(video.currentTime).toBe(100);
    expect(engine.getCurrentSegment()?.id).toBe("b");
  });

  test("a segment inside the last 0.3 s plays instead of seeking every tick", () => {
    const video = fakeVideo();
    const engine = new SegmentEngine(video, config([{ id: "a", startTime: 99.8, endTime: 100 }], [{ segmentIds: ["a"] }]));
    engine.start();
    expect(video.currentTime).toBe(99.8);
    playTo(video, 99.9);
    expect(video.currentTime).toBe(99.9);
  });

  test("a mid-roll ad in the same video is left alone, and segments resume after it", () => {
    const video = fakeVideo();
    let ad = false;
    const engine = new SegmentEngine(video, config([{ id: "a", startTime: 40, endTime: 60 }], [{ segmentIds: ["a"], playbackRate: 0.5 }]), () => ad);
    engine.start();
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
    const engine = new SegmentEngine(video, config([{ id: "a", startTime: 120, endTime: 140 }], [{ segmentIds: ["a"] }]));
    engine.start();
    await new Promise((r) => setTimeout(r, 0));
    expect(seeks).toBeLessThan(3);
  });

  test("scrubbing a segment outside the sequence leaves the playhead there", () => {
    const video = fakeVideo(200);
    const engine = new SegmentEngine(video, config([{ id: "a", startTime: 10, endTime: 20 }, { id: "b", startTime: 50, endTime: 60 }, { id: "loose", startTime: 30, endTime: 40 }], [{ segmentIds: ["a", "b"] }]));
    engine.start();
    seekTo(video, 32);
    expect(video.currentTime).toBe(32);
  });

  test("stop leaves a rate the user chose alone", () => {
    const video = fakeVideo();
    const engine = new SegmentEngine(video, config([{ id: "a", startTime: 0, endTime: 50 }], [{ segmentIds: ["a"] }]));
    engine.start();
    video.playbackRate = 1.5;
    playTo(video, 5);
    engine.stop();
    expect(video.playbackRate).toBe(1.5);
  });

  test("stop restores the rate the engine replaced", () => {
    const video = fakeVideo();
    const engine = new SegmentEngine(video, config([{ id: "a", startTime: 0, endTime: 50 }], [{ segmentIds: ["a"], playbackRate: 0.5 }]));
    engine.start();
    playTo(video, 5);
    expect(video.playbackRate).toBe(0.5);
    engine.stop();
    expect(video.playbackRate).toBe(1);
  });
});
