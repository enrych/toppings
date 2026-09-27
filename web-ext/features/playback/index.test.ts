import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { playback } from "./index";
import { playbackSettings } from "./settings";

const SPEED_ICON = "M12 1c1.44 0 2.87.28 4.21.83a11 11 0 0 1 3.45 2.27";
const page = (label = "Playback speed", normal = "Normal") => `
  <div id="movie_player" class="html5-video-player">
    <video></video>
    <button class="ytp-settings-button"></button>
    <div class="ytp-settings-menu">
      <div class="ytp-panel"><div class="ytp-panel-menu">
        <div class="ytp-menuitem"><div class="ytp-menuitem-icon"><svg><path d="${SPEED_ICON}"></path></svg></div><div class="ytp-menuitem-label">${label}</div><div class="ytp-menuitem-content">${normal}</div></div>
      </div></div>
      <div class="ytp-panel"><div class="ytp-variable-speed-panel-content">
        <div class="ytp-variable-speed-panel-display"><span>1.00x</span></div>
        <input class="ytp-speedslider" type="range" min="0.25" max="2" step="0.05" value="1">
        <div class="ytp-variable-speed-panel-chips"><div class="ytp-variable-speed-panel-preset-button-wrapper"><button><span>1.0</span></button></div></div>
      </div></div>
    </div>
  </div>`;

const route = { name: "watch", videoId: "v1", playlistId: null } as const;
const press = (key: string) => document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
const video = () => document.querySelector("video") as HTMLVideoElement;
const tick = () => new Promise((r) => setTimeout(r, 5));
const flashPill = () => document.getElementById("tppng-seek-flash")?.shadowRoot?.querySelector(".pill");
const chips = () => [...document.querySelectorAll(".ytp-variable-speed-panel-chips button")];

let unmount: (() => void) | undefined | void;
const mountPlayback = async () => {
  unmount = await playback.mount({ signal: new AbortController().signal, route });
};

async function openSpeedPanel() {
  document.querySelector<HTMLElement>(".ytp-settings-button")!.click();
  await tick();
  document.querySelector<HTMLElement>(".ytp-menuitem-label")!.parentElement!.click();
  await tick();
}

beforeEach(async () => {
  await chrome.storage.sync.clear();
  document.body.innerHTML = page();
  video().currentTime = 60;
});
afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

describe("playback", () => {
  test("applies the default rate on mount", async () => {
    await playbackSettings.set({ defaultRate: 1.25 });
    await mountPlayback();
    expect(video().playbackRate).toBe(1.25);
    expect(document.querySelector(".ytp-menuitem-content")!.textContent).toBe("1.25");
  });

  test("rate keys toggle, step and clamp", async () => {
    await playbackSettings.set({ toggleRate: 2, rateStep: 0.5 });
    await mountPlayback();
    press("x");
    expect(video().playbackRate).toBe(2);
    press("w");
    expect(video().playbackRate).toBe(2.5);
    press("x");
    expect(video().playbackRate).toBe(1);
    for (let i = 0; i < 5; i++) press("s");
    expect(video().playbackRate).toBe(0.0625);
  });

  test("sixteenth steps stay exact", async () => {
    await playbackSettings.set({ rateStep: 0.0625 });
    await mountPlayback();
    press("w");
    press("w");
    expect(video().playbackRate).toBe(1.125);
    expect(document.querySelector(".ytp-menuitem-content")!.textContent).toBe("1.125");
  });

  test("seek keys move the playhead and flash the amount", async () => {
    await playbackSettings.set({ seekForward: 10, seekBackward: 30 });
    await mountPlayback();
    press("d");
    expect(video().currentTime).toBe(70);
    expect(flashPill()?.textContent).toBe("+10s");
    expect(flashPill()?.hasAttribute("data-visible")).toBe(true);
    press("a");
    expect(video().currentTime).toBe(40);
    expect(flashPill()?.textContent).toBe("−30s");
    unmount?.();
    unmount = undefined;
    expect(document.getElementById("tppng-seek-flash")).toBeNull();
  });

  test("custom rates replace YouTube's speed chips", async () => {
    await playbackSettings.set({ customRates: [1, 1.5, 3] });
    await mountPlayback();
    await openSpeedPanel();
    expect(chips().map((b) => b.textContent)).toEqual(["1.0", "1.5", "3.0"]);
    expect(chips().map((b) => b.getAttribute("aria-pressed"))).toEqual(["true", "false", "false"]);

    (chips()[2] as HTMLElement).click();
    expect(video().playbackRate).toBe(3);
    expect(chips()[2].getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector(".ytp-variable-speed-panel-display span")!.textContent).toBe("3.00x");
    expect(document.querySelector<HTMLInputElement>(".ytp-speedslider")!.value).toBe("3");
  });

  test("the panel reflects a rate set by keyboard", async () => {
    await playbackSettings.set({ customRates: [1, 2], toggleRate: 2 });
    await mountPlayback();
    press("x");
    await openSpeedPanel();
    expect(document.querySelector(".ytp-variable-speed-panel-display span")!.textContent).toBe("2.00x");
    expect(chips()[1].getAttribute("aria-pressed")).toBe("true");
  });

  test("without custom rates the panel is left to YouTube", async () => {
    await mountPlayback();
    await openSpeedPanel();
    expect(chips().map((b) => b.textContent)).toEqual(["1.0"]);
  });

  test("the speed row follows a rate set while the menu is closed", async () => {
    document.querySelector<HTMLElement>(".ytp-settings-menu")!.style.display = "none";
    await playbackSettings.set({ toggleRate: 2 });
    await mountPlayback();
    press("x");
    expect(document.querySelector(".ytp-menuitem-content")!.textContent).toBe("2");
  });

  test("the speed row keeps YouTube's own word for 1x in any language", async () => {
    document.body.innerHTML = page("Wiedergabegeschwindigkeit", "Standard");
    await playbackSettings.set({ defaultRate: 1.25, toggleRate: 2 });
    await mountPlayback();
    const value = () => document.querySelector(".ytp-menuitem-content")!.textContent;
    expect(value()).toBe("1.25");
    press("x");
    expect(value()).toBe("Standard");
    press("x");
    expect(value()).toBe("2");
    press("x");
    expect(value()).toBe("Standard");
  });

  test("custom rates reach the speed panel in any language", async () => {
    document.body.innerHTML = page("Wiedergabegeschwindigkeit", "Standard");
    await playbackSettings.set({ customRates: [1, 1.5, 3] });
    await mountPlayback();
    await openSpeedPanel();
    expect(chips().map((b) => b.textContent)).toEqual(["1.0", "1.5", "3.0"]);
  });

  test("keys stop working after unmount", async () => {
    await mountPlayback();
    unmount?.();
    unmount = undefined;
    press("x");
    expect(video().playbackRate).toBe(1);
  });
});
