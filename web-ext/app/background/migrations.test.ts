import { beforeEach, describe, expect, test } from "bun:test";
import { migrateLegacyStore } from "./migrations";
import { appSettings } from "@/app/settings";
import { playbackSettings } from "@/features/playback/settings";
import { shortsSettings } from "@/features/shorts/settings";
import { segmentsSettings } from "@/features/segments/settings";
import { profilesSettings } from "@/features/profiles/settings";
import { profileStore } from "@/features/profiles/store";
import { keybindings } from "@/kernel/keys";

const legacy = {
  isExtensionEnabled: false,
  ui: { theme: "light", gearMenuEnabled: true },
  preferences: {
    watch: {
      isEnabled: true,
      defaultPlaybackRate: { value: "1.5" },
      togglePlaybackRate: { key: "T", value: "2" },
      increasePlaybackRate: { key: "W", value: "0.5" },
      seekBackward: { key: "A", value: "10" },
      seekForward: { key: "D", value: "20" },
      customPlaybackRates: ["1.00", "1.50"],
      toggleLoopSegment: { key: "L" },
      nudgeLoopSegment: { startBackwardKey: "Shift+Q", baseStep: "2", multiplier: "3", maxStep: "8" },
      segments: { freshSlateKey: "Shift+Z", autoLoad: "last-used" },
    },
    shorts: { isEnabled: false, reelAutoScroll: { value: false }, togglePlaybackRate: { key: "X", value: "1.75" } },
  },
};

beforeEach(async () => {
  await chrome.storage.sync.clear();
  await chrome.storage.local.clear();
});

describe("migrateLegacyStore", () => {
  test("copies every slice out of the old store and drops the old keys", async () => {
    await chrome.storage.sync.set(legacy);
    await chrome.storage.local.set({ "toppings:profile_store": { activeProfileId: "preset:focus", profiles: [] } });
    await migrateLegacyStore();

    expect(await appSettings.get()).toEqual({ enabled: false, theme: "light" });
    expect(await playbackSettings.get()).toEqual({ enabled: true, defaultRate: 1.5, toggleRate: 2, rateStep: 0.5, seekBackward: 10, seekForward: 20, customRates: [1, 1.5] });
    expect(await shortsSettings.get()).toMatchObject({ enabled: false, autoScroll: false, toggleRate: 1.75, seekBackward: 5 });
    expect(await segmentsSettings.get()).toEqual({ enabled: true, autoLoad: "last-used", nudgeBaseStep: 2, nudgeMultiplier: 3, nudgeMaxStep: 8 });
    expect(await profilesSettings.get()).toEqual({ gearMenu: true, audioButton: true });
    expect((await profileStore.get()).activeProfileId).toBe("preset:focus");
    expect(await keybindings.get()).toEqual({ "playback.toggleRate": "T", "playback.increaseRate": "W", "playback.seekBackward": "A", "playback.seekForward": "D", "segments.toggle": "L", "segments.fresh": "Shift+Z", "segments.nudgeStartBackward": "Shift+Q", "shorts.toggleRate": "X" });
    expect(Object.keys(await chrome.storage.sync.get()).filter((k) => !k.startsWith("settings:"))).toEqual([]);
  });

  test("a watch page switched off keeps segments off too", async () => {
    await chrome.storage.sync.set({ preferences: { watch: { ...legacy.preferences.watch, isEnabled: false } } });
    await migrateLegacyStore();
    expect((await playbackSettings.get()).enabled).toBe(false);
    expect((await segmentsSettings.get()).enabled).toBe(false);
  });

  test("3.x audio mode's key and player button carry over to the Audio profile", async () => {
    await chrome.storage.sync.set({ preferences: { watch: { audioMode: { isEnabled: false, toggleAudioMode: { key: "Shift+B" } } } } });
    await migrateLegacyStore();
    expect((await keybindings.get())["profiles.preset:audio"]).toBe("Shift+B");
    expect((await profilesSettings.get()).audioButton).toBe(false);
  });

  test("a fresh install keeps every default", async () => {
    await migrateLegacyStore();
    expect(await appSettings.get()).toEqual({ enabled: true, theme: "system" });
    expect(await playbackSettings.get()).toEqual(playbackSettings.defaults);
  });

  test("runs once: a slice the user already changed is left alone", async () => {
    await chrome.storage.sync.set({ ...legacy, "settings:app": { enabled: true, theme: "dark" } });
    await migrateLegacyStore();
    expect(await appSettings.get()).toEqual({ enabled: true, theme: "dark" });
  });
});
