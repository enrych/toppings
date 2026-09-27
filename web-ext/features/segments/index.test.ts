import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createSegments } from "./index";
import { memorySegmentStorage, openVideoSegments, type SegmentStorage } from "./store";
import { createFreshConfig } from "./factories";

const page = `
  <div id="movie_player">
    <video></video>
    <div class="ytp-right-controls"><button class="ytp-settings-button"></button></div>
    <div class="ytp-progress-bar-container"></div>
  </div>
  <div id="above-the-fold"><h1>Title</h1></div>`;

const route = { name: "watch", videoId: "v1", playlistId: null } as const;
const press = (key: string, init: KeyboardEventInit = {}) => document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));
const tick = () => new Promise((r) => setTimeout(r, 10));
const button = () => document.getElementById("tppng-segment-button")!;
const panel = () => document.getElementById("tppng-segment-panel")!.shadowRoot!;
const markers = () => document.getElementById("tppng-segment-markers")!.shadowRoot!.querySelectorAll(".marker");

let storage: SegmentStorage;
let unmount: (() => void) | undefined | void;

beforeEach(async () => {
  await chrome.storage.sync.clear();
  storage = memorySegmentStorage();
  document.body.innerHTML = page;
  const video = document.querySelector("video")!;
  Object.defineProperty(video, "duration", { value: 200, configurable: true });
  Object.defineProperty(video, "readyState", { value: 1, configurable: true });
});
afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const mountOn = async () => {
  unmount = await createSegments({ storage }).mount({ route });
  await tick();
};

describe("segments", () => {
  test("mounts a control-bar button, and the toggle key shows the panel and markers", async () => {
    await mountOn();
    expect(button().getAttribute("aria-pressed")).toBe("false");
    expect(panel().querySelector(".panel")).toBeNull();

    press("z");
    await tick();
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(panel().querySelector(".title")?.textContent).toBe("Segments");
    expect(panel().querySelector(".range")?.textContent).toBe("0:00 → 3:20");
    expect(markers()).toHaveLength(2);

    press("z");
    await tick();
    expect(panel().querySelector(".panel")).toBeNull();
    expect(markers()).toHaveLength(0);
  });

  test("the button toggles too, and the panel can add a segment at the playhead", async () => {
    await mountOn();
    button().click();
    await tick();
    document.querySelector("video")!.currentTime = 100;
    [...panel().querySelectorAll("button")].find((b) => b.textContent === "+ Add Segment")!.click();
    await tick();
    expect([...panel().querySelectorAll(".range")].map((r) => r.textContent)).toEqual(["0:00 → 1:40", "1:40 → 3:20"]);
    expect(markers()).toHaveLength(4);
  });

  test("auto-load restores the default config on mount", async () => {
    const store = openVideoSegments(storage, "v1");
    const config = { ...createFreshConfig(200), label: "Intro" };
    await store.saveConfig(config);
    await store.setDefaultConfig(config.id);
    await chrome.storage.sync.set({ "settings:segments": { autoLoad: "default" } });
    await mountOn();
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(panel().querySelector(".chip")?.textContent).toContain("Intro");
  });

  test("a saved config's own shortcut loads it", async () => {
    const store = openVideoSegments(storage, "v1");
    await store.saveConfig({ ...createFreshConfig(200), label: "Solo", shortcutKey: "Ctrl+1" });
    await mountOn();
    press("1", { ctrlKey: true });
    await tick();
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(panel().querySelector(".chip")?.textContent).toContain("Solo");
  });

  test("unmount removes everything it added", async () => {
    await mountOn();
    press("z");
    await tick();
    unmount?.();
    unmount = undefined;
    expect(document.getElementById("tppng-segment-button")).toBeNull();
    expect(document.getElementById("tppng-segment-panel")).toBeNull();
    expect(document.getElementById("tppng-segment-markers")).toBeNull();
    expect(document.querySelector<HTMLElement>(".ytp-progress-bar-container")!.style.overflow).toBe("");
  });
});
