import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { profiles } from "./index";
import { profilesSettings } from "./settings";
import { createProfile, getActiveProfile, setActiveProfileId } from "./store";
import { keybindings } from "@/kernel/keys";

const watchPage = `
  <div id="movie_player" class="html5-video-player">
    <video></video>
    <button class="ytp-settings-button"></button>
    <div class="ytp-popup ytp-settings-menu" style="width: 303px; height: 305px;"><div class="ytp-popup-content"><div class="ytp-panel" style="width: 303px; height: 305px;"><div class="ytp-panel-menu" style="height: 305px;"><div class="ytp-menuitem">Quality</div></div></div></div></div>
  </div>
  <div id="secondary"></div>
  <ytd-comments id="comments"></ytd-comments>
  <ytd-guide-renderer><div id="sections"></div></ytd-guide-renderer>`;

const watch = { name: "watch", videoId: "v", playlistId: null } as const;
const home = { name: "home" } as const;
const tick = () => new Promise((r) => setTimeout(r, 10));
const sidebar = () => document.getElementById("secondary")!;
const gearButton = () => document.querySelector<HTMLElement>(".ytp-settings-button")!;
const popupContent = () => document.querySelector<HTMLElement>(".ytp-popup-content")!;
const mainPanel = () => document.querySelector<HTMLElement>(".ytp-popup-content > .ytp-panel")!;
const press = (key: string, init: KeyboardEventInit = {}) => document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));

let unmount: (() => void) | undefined | void;
const mountOn = async (route: typeof watch | typeof home) => {
  unmount = await profiles.mount({ signal: new AbortController().signal, route });
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

  test("B switches to Audio and back to the profile that was on before", async () => {
    await setActiveProfileId("preset:focus");
    await mountOn(watch);
    press("b");
    await tick();
    expect((await getActiveProfile())?.id).toBe("preset:audio");
    press("b");
    await tick();
    expect((await getActiveProfile())?.id).toBe("preset:focus");
  });

  test("a custom profile's shortcut toggles it from Default", async () => {
    const mine = await createProfile({ name: "Work", primitives: { "watch.sidebar": { visible: false } } });
    await keybindings.set({ [`profiles.${mine.id}`]: "Shift+W" });
    await mountOn(watch);
    press("W", { shiftKey: true });
    await tick();
    expect((await getActiveProfile())?.id).toBe(mine.id);
    expect(sidebar().style.display).toBe("none");
    press("W", { shiftKey: true });
    await tick();
    expect(await getActiveProfile()).toBeNull();
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

  test("the gear menu gets a native Profile row showing the active profile", async () => {
    await profilesSettings.set({ gearMenu: true });
    await setActiveProfileId("preset:focus");
    await mountOn(watch);
    gearButton().click();
    await tick();
    const row = document.getElementById("tppng-profile-row")!;
    expect(row.getAttribute("aria-haspopup")).toBe("true");
    expect(row.querySelector(".ytp-menuitem-icon svg")).not.toBeNull();
    expect(row.querySelector(".ytp-menuitem-label")!.textContent).toBe("Profile");
    expect(row.querySelector(".ytp-menuitem-content")!.textContent).toBe("Focus");
  });

  test("the Profile submenu takes the main panel's place, and picking goes back with the new name", async () => {
    await profilesSettings.set({ gearMenu: true });
    await mountOn(watch);
    gearButton().click();
    await tick();
    const main = mainPanel();
    document.getElementById("tppng-profile-row")!.click();
    await tick();
    const panel = document.getElementById("tppng-profile-panel")!;
    expect(panel.parentElement).toBe(popupContent());
    expect(main.isConnected).toBe(false);
    expect(panel.querySelector(".ytp-panel-title")!.textContent).toBe("Profile");
    const options = [...panel.querySelectorAll<HTMLElement>("[role=menuitemradio]")];
    expect(options.map((o) => o.textContent)).toEqual(["Default", "Audio", "Focus"]);
    expect(options[0].getAttribute("aria-checked")).toBe("true");

    options[1].click();
    await tick();
    expect((await getActiveProfile())?.id).toBe("preset:audio");
    expect(main.parentElement).toBe(popupContent());
    expect(document.getElementById("tppng-profile-panel")).toBeNull();
    expect(document.querySelector("#tppng-profile-row .ytp-menuitem-content")!.textContent).toBe("Audio");
  });

  test("back puts YouTube's panel back at the size YouTube gave it", async () => {
    await profilesSettings.set({ gearMenu: true });
    await mountOn(watch);
    gearButton().click();
    await tick();
    document.getElementById("tppng-profile-row")!.click();
    await tick();
    document.querySelector<HTMLElement>("#tppng-profile-panel .ytp-panel-back-button")!.click();
    expect(mainPanel().getAttribute("style")).toBe("width: 303px; height: 305px;");
    expect(document.querySelector(".ytp-settings-menu")!.getAttribute("style")).toBe("width: 303px; height: 305px;");
  });

  test("closing the menu from the submenu leaves YouTube's main panel in it for next time", async () => {
    await profilesSettings.set({ gearMenu: true });
    await mountOn(watch);
    gearButton().click();
    await tick();
    const main = mainPanel();
    document.getElementById("tppng-profile-row")!.click();
    await tick();
    document.querySelector<HTMLElement>(".ytp-settings-menu")!.style.display = "none";
    await tick();
    expect(main.parentElement).toBe(popupContent());
    expect(document.getElementById("tppng-profile-panel")).toBeNull();
  });

  test("unmounting takes the row out and leaves YouTube's panel in place", async () => {
    await profilesSettings.set({ gearMenu: true });
    await mountOn(watch);
    gearButton().click();
    await tick();
    const main = mainPanel();
    document.getElementById("tppng-profile-row")!.click();
    await tick();
    unmount?.();
    unmount = undefined;
    expect(main.parentElement).toBe(popupContent());
    expect(document.getElementById("tppng-profile-row")).toBeNull();
  });

  test("home route leaves watch primitives alone", async () => {
    await setActiveProfileId("preset:focus");
    await mountOn(home);
    expect(sidebar().style.display).toBe("");
  });
});
