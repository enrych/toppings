import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { shorts } from "./index";
import { shortsSettings } from "./settings";

// The older layout with is-active and #actions inside the renderer, and the
// newer one with a reused renderer and an extracted action bar.
const layouts = {
  active: `<ytd-reel-video-renderer is-active><video></video><div id="actions"></div></ytd-reel-video-renderer>
    <button aria-label="Next video"></button>`,
  extracted: `<ytd-reel-video-renderer id="reel-video-renderer"><div id="shorts-player"><video></video></div></ytd-reel-video-renderer>
    <div><reel-action-bar-view-model><like-button-view-model></like-button-view-model></reel-action-bar-view-model></div>
    <button aria-label="Next video"></button>`,
};
const reel = layouts.active;

const route = { name: "shorts", shortId: "s1" } as const;
const press = (key: string) => document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
const video = () => document.querySelector("video") as HTMLVideoElement;
const controls = () => document.getElementById("tppng-shorts-controls")!.shadowRoot!;

beforeEach(async () => {
  await chrome.storage.sync.clear();
  document.body.innerHTML = reel;
  video().currentTime = 30;
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("shorts", () => {
  for (const [name, html] of Object.entries(layouts)) {
    test(`puts the two controls in the action column (${name} layout)`, async () => {
      document.body.innerHTML = html;
      const unmount = await shorts.mount({ route });
      const buttons = [...controls().querySelectorAll("button")].map((b) => b.textContent);
      expect(buttons).toEqual(["Auto", "1.5×"]);
      unmount?.();
      expect(document.getElementById("tppng-shorts-controls")).toBeNull();
    });
  }

  test("seek keys move the playhead by the configured amount", async () => {
    await shortsSettings.set({ seekForward: 7 });
    const unmount = await shorts.mount({ route });
    press("d");
    expect(video().currentTime).toBe(37);
    press("a");
    expect(video().currentTime).toBe(32);
    unmount?.();
  });

  test("the rate key toggles between 1 and the configured rate", async () => {
    await shortsSettings.set({ toggleRate: 2 });
    const unmount = await shorts.mount({ route });
    press("x");
    expect(video().playbackRate).toBe(2);
    press("x");
    expect(video().playbackRate).toBe(1);
    unmount?.();
  });

  test("advances to the next reel when one ends", async () => {
    let next = 0;
    document.querySelector("[aria-label='Next video']")!.addEventListener("click", () => next++);
    const unmount = await shorts.mount({ route });
    video().dispatchEvent(new Event("ended"));
    expect(next).toBe(1);
    unmount?.();
  });

  test("the Auto button turns auto-scroll off and persists it", async () => {
    const unmount = await shorts.mount({ route });
    controls().querySelector("button")!.click();
    await new Promise((r) => setTimeout(r, 0));
    expect((await shortsSettings.get()).autoScroll).toBe(false);
    let next = 0;
    document.querySelector("[aria-label='Next video']")!.addEventListener("click", () => next++);
    video().dispatchEvent(new Event("ended"));
    expect(next).toBe(0);
    unmount?.();
  });

  test("does nothing when disabled", async () => {
    await shortsSettings.set({ enabled: false });
    await shorts.mount({ route });
    expect(document.getElementById("tppng-shorts-controls")).toBeNull();
  });
});
