import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { watchVisuals } from "./primitives";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";

const player = () => document.getElementById("movie_player")!;
const covers = () => [...player().children].filter((child) => child.tagName === "DIV" && (child as HTMLElement).style.zIndex === "17") as HTMLElement[];
const tick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  await chrome.storage.local.clear();
  document.body.innerHTML = `<div id="movie_player" class="html5-video-player"><div class="html5-video-container"><video></video></div><div class="ytp-chrome-bottom"></div></div>`;
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("watch.visuals", () => {
  test("covers the picture below the controls, letting clicks through", () => {
    watchVisuals.apply(player(), { value: "black" });
    expect(covers()).toHaveLength(1);
    expect(covers()[0].style.pointerEvents).toBe("none");
    expect(player().querySelector("video")).not.toBeNull();
  });

  test("re-applying the same screen keeps one cover, and the video screen removes it", () => {
    watchVisuals.apply(player(), { value: "visualizer" });
    watchVisuals.apply(player(), { value: "visualizer" });
    expect(covers()).toHaveLength(1);
    watchVisuals.apply(player(), { value: "video" });
    expect(covers()).toHaveLength(0);
  });

  test("reset removes the cover", () => {
    watchVisuals.apply(player(), { value: "black" });
    watchVisuals.reset(player());
    expect(covers()).toHaveLength(0);
  });

  test("the custom screen shows the stored image", async () => {
    await chrome.storage.local.set({ [CHROME_STORAGE_LOCAL_KEY.VISUALS_IMAGE]: "data:image/png;base64,AAAA" });
    watchVisuals.apply(player(), { value: "custom" });
    await tick();
    expect(covers()[0].style.backgroundImage).toContain("data:image/png;base64,AAAA");
  });

  test("a newly chosen image replaces the one on a covered player", async () => {
    watchVisuals.apply(player(), { value: "custom" });
    await chrome.storage.local.set({ [CHROME_STORAGE_LOCAL_KEY.VISUALS_IMAGE]: "data:image/png;base64,BBBB" });
    await tick();
    expect(covers()[0].style.backgroundImage).toContain("BBBB");
  });

  test("accepts only known screens", () => {
    expect(watchVisuals.parse({ value: "visualizer" })).toEqual({ value: "visualizer" });
    expect(watchVisuals.parse({ value: "sparkles" })).toBeUndefined();
  });
});
