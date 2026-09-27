import { beforeEach, describe, expect, test } from "bun:test";
import { defineSettings, migrateSettings } from "./settings";

const slice = defineSettings("demo", { enabled: true, size: 3 }, {
  legacy: (store) => {
    const legacy = store.preferences as { demo?: { isEnabled: boolean } } | undefined;
    return legacy?.demo ? { enabled: legacy.demo.isEnabled } : undefined;
  },
});

beforeEach(() => chrome.storage.sync.clear());

describe("settings slice", () => {
  test("reads defaults when nothing is stored", async () => {
    expect(await slice.get()).toEqual({ enabled: true, size: 3 });
  });

  test("merges a partial patch and keeps other keys", async () => {
    await slice.set({ size: 5 });
    expect(await slice.get()).toEqual({ enabled: true, size: 5 });
  });

  test("fills in a setting added after the user's last write", async () => {
    await chrome.storage.sync.set({ [slice.key]: { enabled: false } });
    expect(await slice.get()).toEqual({ enabled: false, size: 3 });
  });
});

describe("legacy migration", () => {
  test("copies the old value once, then leaves the slice alone", async () => {
    await chrome.storage.sync.set({ preferences: { demo: { isEnabled: false } } });
    await migrateSettings([slice]);
    expect(await slice.get()).toEqual({ enabled: false, size: 3 });

    await slice.set({ enabled: true });
    await migrateSettings([slice]);
    expect((await slice.get()).enabled).toBe(true);
  });

  test("writes nothing when there is no legacy value", async () => {
    await migrateSettings([slice]);
    expect(await chrome.storage.sync.get(null)).toEqual({});
  });
});
