import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { profiles } from "./index";
import { profilesSettings } from "./settings";
import { createProfile, getActiveProfile, setActiveProfileId } from "./store";

const watchPage = `
  <div id="movie_player" class="html5-video-player">
    <video></video>
    <button class="ytp-settings-button"></button>
    <div class="ytp-settings-menu"><div class="ytp-panel"><div class="ytp-panel-menu"><div class="ytp-menuitem">Quality</div></div></div></div>
  </div>
  <div id="secondary"></div>
  <ytd-comments id="comments"></ytd-comments>
  <ytd-guide-renderer><div id="sections"></div></ytd-guide-renderer>`;

const watch = { name: "watch", videoId: "v", playlistId: null } as const;
const home = { name: "home" } as const;
const tick = () => new Promise((r) => setTimeout(r, 10));
const sidebar = () => document.getElementById("secondary")!;
const press = (key: string) => document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

let unmount: (() => void) | undefined | void;
const mountOn = async (route: typeof watch | typeof home) => {
  unmount = await profiles.mount({ route });
};

beforeEach(async () => {
  await chrome.storage.sync.clear();
  await chrome.storage.local.clear();
  document.body.innerHTML = watchPage;
});
afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

describe("profiles", () => {
  test("applies the active preset on its route and restores on unmount", async () => {
    await setActiveProfileId("preset:focus");
    await mountOn(watch);
    expect(sidebar().style.display).toBe("none");
    expect(document.getElementById("comments")!.style.display).toBe("none");
    unmount?.();
    unmount = undefined;
    expect(sidebar().style.display).toBe("");
  });

  test("follows profile changes while mounted", async () => {
    await mountOn(watch);
    expect(sidebar().style.display).toBe("");
    await setActiveProfileId("preset:focus");
    await tick();
    expect(sidebar().style.display).toBe("none");
    await setActiveProfileId(null);
    await tick();
    expect(sidebar().style.display).toBe("");
  });

  test("custom profiles apply too", async () => {
    const mine = await createProfile({ name: "Mine", primitives: { "watch.sidebar": { visible: false } } });
    await setActiveProfileId(mine.id);
    await mountOn(watch);
    expect(sidebar().style.display).toBe("none");
    expect(document.getElementById("comments")!.style.display).toBe("");
  });

  test("the cycle key walks default, presets, then custom profiles", async () => {
    await chrome.storage.sync.set({ "settings:keybindings": { "profiles.cycle": "P" } });
    await createProfile({ name: "Mine", primitives: {} });
    await mountOn(watch);
    await tick();
    for (const expected of ["preset:audio", "preset:focus"]) {
      press("p");
      await tick();
      expect((await getActiveProfile())?.id).toBe(expected);
    }
    press("p");
    await tick();
    expect((await getActiveProfile())?.name).toBe("Mine");
    press("p");
    await tick();
    expect(await getActiveProfile()).toBeNull();
  });

  test("gear menu entry lists profiles and quick toggles", async () => {
    await profilesSettings.set({ gearMenu: true });
    await mountOn(watch);
    document.querySelector<HTMLElement>(".ytp-settings-button")!.click();
    await tick();
    const entry = document.getElementById("tppng-gear-entry")!;
    expect(entry.textContent).toContain("Toppings");
    entry.click();
    await tick();
    const panel = document.getElementById("tppng-gear-panel")!;
    expect(panel.hidden).toBe(false);
    const labels = [...panel.querySelectorAll(".ytp-menuitem-label")].map((e) => e.textContent);
    expect(labels).toContain("Recommendations sidebar");
    expect(labels).toContain("Focus");

    const toggle = panel.querySelector<HTMLElement>("[role=menuitemcheckbox]")!;
    toggle.click();
    expect(sidebar().style.display).toBe("none");

    const focus = [...panel.querySelectorAll<HTMLElement>("[role=menuitemradio]")].find((e) => e.textContent === "Focus")!;
    focus.click();
    await tick();
    expect((await getActiveProfile())?.id).toBe("preset:focus");
    expect(panel.hidden).toBe(true);

    unmount?.();
    unmount = undefined;
    expect(document.getElementById("tppng-gear-entry")).toBeNull();
  });

  test("unmounting with the menu closed restores YouTube's own settings panel", async () => {
    await profilesSettings.set({ gearMenu: true });
    await mountOn(watch);
    document.querySelector<HTMLElement>(".ytp-settings-button")!.click();
    await tick();
    document.getElementById("tppng-gear-entry")!.click();
    await tick();
    const mainPanel = document.querySelector<HTMLElement>(".ytp-settings-menu .ytp-panel")!;
    expect(mainPanel.style.display).toBe("none");
    document.querySelector<HTMLElement>(".ytp-settings-menu")!.style.display = "none";
    unmount?.();
    unmount = undefined;
    expect(mainPanel.style.display).toBe("");
  });

  test("native settings adds a guide link and an overlay", async () => {
    await profilesSettings.set({ nativeSettings: true });
    await mountOn(watch);
    const link = document.getElementById("tppng-guide-link")!;
    expect(link.shadowRoot!.textContent).toContain("Toppings");
    link.shadowRoot!.querySelector<HTMLElement>(".link")!.click();
    await tick();
    const overlay = document.getElementById("tppng-native-settings")!.shadowRoot!;
    expect(overlay.querySelector(".overlay")).not.toBeNull();
    [...overlay.querySelectorAll<HTMLElement>(".chip")].find((c) => c.textContent === "Audio")!.click();
    await tick();
    expect((await getActiveProfile())?.id).toBe("preset:audio");
    overlay.querySelector<HTMLElement>(".back")!.click();
    expect(overlay.querySelector(".overlay")).toBeNull();
  });

  test("home route leaves watch primitives alone", async () => {
    await setActiveProfileId("preset:focus");
    await mountOn(home);
    expect(sidebar().style.display).toBe("");
  });
});
