import { beforeEach, describe, expect, test } from "bun:test";
import { createFreshConfig } from "./factories";
import { openVideoSegments } from "./store";

beforeEach(() => chrome.storage.local.clear());

describe("openVideoSegments", () => {
  test("keeps one versioned record per video in extension storage", async () => {
    const config = createFreshConfig(100);
    await openVideoSegments("v1").setLastUsed(config);
    expect(await chrome.storage.local.get()).toEqual({ "toppings:segments:v1": { v: 1, lastUsed: config, configs: [], defaultConfigId: null } });
  });

  test("removes the record once nothing is left in it", async () => {
    const store = openVideoSegments("v1");
    const config = createFreshConfig(100);
    await store.saveConfig(config);
    await store.setDefaultConfig(config.id);
    await store.deleteConfig(config.id);
    expect(await chrome.storage.local.get()).toEqual({});
  });
});
