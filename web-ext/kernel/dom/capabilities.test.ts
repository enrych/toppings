import { beforeEach, describe, expect, test } from "bun:test";
import { clearCapabilityCache, getAllCapabilityEntries, getCapabilityStatus, setCapabilityStatus } from "./capabilities";

const found = { resolved: true, element: document.createElement("div"), strategyIndex: 1 } as const;
const missing = { resolved: false, element: null, strategyIndex: null } as const;

beforeEach(async () => {
  await chrome.storage.local.clear();
});

describe("capability cache", () => {
  test("statuses written by the content script are read back from extension storage", async () => {
    await Promise.all([setCapabilityStatus("watch.player", "watch", found), setCapabilityStatus("watch.ratePanel", "watch", missing)]);
    expect(await getCapabilityStatus("watch.player")).toBe("supported");
    expect(await getCapabilityStatus("watch.ratePanel")).toBe("unsupported");
    expect(await getCapabilityStatus("watch.sidebar")).toBe("untested");
    expect((await getAllCapabilityEntries()).map((e) => e.primitiveId).sort()).toEqual(["watch.player", "watch.ratePanel"]);
  });

  test("an unchanged status is not rewritten", async () => {
    await setCapabilityStatus("watch.player", "watch", found);
    const key = "toppings:capability:watch.player";
    const first = (await chrome.storage.local.get(key))[key];
    await new Promise((r) => setTimeout(r, 5));
    await setCapabilityStatus("watch.player", "watch", found);
    expect((await chrome.storage.local.get(key))[key].lastCheckedAt).toBe(first.lastCheckedAt);
  });

  test("clearing removes only capability entries", async () => {
    await chrome.storage.local.set({ other: 1 });
    await setCapabilityStatus("watch.player", "watch", found);
    await clearCapabilityCache();
    expect(await getAllCapabilityEntries()).toEqual([]);
    expect(await chrome.storage.local.get("other")).toEqual({ other: 1 });
  });
});
