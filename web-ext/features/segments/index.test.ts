import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { segments } from "./index";
import { openVideoSegments } from "./store";
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

let unmount: (() => void) | undefined | void;

beforeEach(async () => {
  await chrome.storage.sync.clear();
  await chrome.storage.local.clear();
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
  unmount = await segments.mount({ signal: new AbortController().signal, route });
  await tick();
};

describe("segments", () => {
  test("stays off, keys included, when switched off", async () => {
    await chrome.storage.sync.set({ "settings:segments": { enabled: false } });
    await mountOn();
    press("z");
    await tick();
    expect(document.getElementById("tppng-segment-button")).toBeNull();
    expect(document.getElementById("tppng-segment-panel")).toBeNull();
  });

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

  test("adding a segment on a slate that fills the video splits it instead of nesting one inside", async () => {
    await mountOn();
    button().click();
    await tick();
    [...panel().querySelectorAll("button")].find((b) => b.textContent === "+ Add Segment")!.click();
    await tick();
    expect([...panel().querySelectorAll(".range")].map((r) => r.textContent)).toEqual(["0:00 → 1:40", "1:40 → 3:20"]);
  });

  test("the config name field keeps what is typed", async () => {
    await mountOn();
    button().click();
    await tick();
    [...panel().querySelectorAll("button")].find((b) => b.textContent === "Save as…")!.click();
    await tick();
    const input = panel().querySelector<HTMLInputElement>("input.text")!;
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, input.value.length]);
    input.value = "Verse";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(input.selectionStart).toBe(input.selectionEnd);
  });

  test("auto-load waits out a pre-roll ad rather than clamping to its length", async () => {
    const store = openVideoSegments("v1");
    const config = { ...createFreshConfig(200), label: "Intro" };
    await store.saveConfig(config);
    await store.setDefaultConfig(config.id);
    await chrome.storage.sync.set({ "settings:segments": { autoLoad: "default" } });
    const player = document.getElementById("movie_player")!;
    player.className = "html5-video-player ad-showing";
    const video = document.querySelector("video")!;
    Object.defineProperty(video, "duration", { value: 15, configurable: true });
    await mountOn();
    expect(button().getAttribute("aria-pressed")).toBe("false");

    player.classList.remove("ad-showing");
    Object.defineProperty(video, "duration", { value: 200, configurable: true });
    video.dispatchEvent(new Event("timeupdate"));
    await tick();
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(panel().querySelector(".range")?.textContent).toBe("0:00 → 3:20");
  });

  test("a segment row edits its own loop count and rate, and refuses a rate the player cannot take", async () => {
    await mountOn();
    button().click();
    await tick();
    const [loops, rate] = panel().querySelectorAll<HTMLInputElement>(".segment input");
    // Both events: once another test file has loaded preact/compat, Preact
    // listens for "input" where it would otherwise listen for "change".
    const type = async (input: HTMLInputElement, value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await tick();
    };
    await type(loops, "3");
    await type(rate, "1.5");
    await type(rate, "40");
    expect(rate.value).toBe("1.5");
    expect((await openVideoSegments("v1").getLastUsed())?.segments[0]).toMatchObject({ loops: 3, rate: 1.5 });
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
