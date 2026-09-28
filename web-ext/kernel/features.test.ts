import { describe, expect, test } from "bun:test";
import type { Route } from "@/youtube/route";
import { bootFeatures, type Feature } from "./features";

const watch: Route = { name: "watch", videoId: "v1", playlistId: null };
const settle = () => new Promise((r) => setTimeout(r, 0));

function navigator() {
  let listener: (route: Route) => void = () => {};
  return {
    onNavigate: (l: (route: Route) => void) => (listener = l),
    go: (route: Route) => listener(route),
  };
}

describe("bootFeatures", () => {
  test("a mount that finishes after the next navigation is undone", async () => {
    const nav = navigator();
    let release!: () => void;
    let unmounts = 0;
    const slow: Feature = { id: "slow", routes: ["watch"], mount: () => new Promise((r) => (release = () => r(() => unmounts++))) };
    bootFeatures([slow], nav.onNavigate);

    nav.go(watch);
    await settle();
    const stale = release;
    nav.go({ name: "home" });
    stale();
    await settle();
    expect(unmounts).toBe(1);
  });

  test("features mount without waiting for each other, and see the navigation end", async () => {
    const nav = navigator();
    let signal: AbortSignal | undefined;
    let quickMounted = false;
    const slow: Feature = { id: "slow", routes: ["watch"], mount: (ctx) => new Promise(() => void (signal = ctx.signal)) };
    const quick: Feature = { id: "quick", routes: ["watch"], mount: () => void (quickMounted = true) };
    bootFeatures([slow, quick], nav.onNavigate);

    nav.go(watch);
    await settle();
    expect(quickMounted).toBe(true);
    expect(signal?.aborted).toBe(false);
    nav.go({ name: "home" });
    expect(signal?.aborted).toBe(true);
  });

  test("stop unmounts everything and ignores later navigations", async () => {
    const nav = navigator();
    let mounts = 0;
    let unmounts = 0;
    const feature: Feature = { id: "f", routes: ["watch", "home"], mount: () => (mounts++, () => unmounts++) };
    const booted = bootFeatures([feature], nav.onNavigate);
    nav.go(watch);
    await settle();
    booted.stop();
    expect(unmounts).toBe(1);
    nav.go({ name: "home" });
    booted.refresh();
    await settle();
    expect(mounts).toBe(1);
  });

  test("the previous route's features unmount on navigation", async () => {
    const nav = navigator();
    let unmounts = 0;
    const feature: Feature = { id: "f", routes: ["watch"], mount: () => () => unmounts++ };
    bootFeatures([feature], nav.onNavigate);
    nav.go(watch);
    await settle();
    nav.go({ name: "home" });
    await settle();
    expect(unmounts).toBe(1);
  });
});
