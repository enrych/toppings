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
  test("a navigation during a slow mount stops the rest of the old one", async () => {
    const nav = navigator();
    let release!: () => void;
    const mountedAfter: string[] = [];
    let slowUnmounts = 0;
    const slow: Feature = {
      id: "slow",
      routes: ["watch"],
      mount: () => new Promise((r) => (release = () => r(() => slowUnmounts++))),
    };
    const later: Feature = { id: "later", routes: ["watch"], mount: ({ route }) => void mountedAfter.push(route.name) };
    bootFeatures([slow, later], nav.onNavigate);

    nav.go(watch);
    await settle();
    const firstRelease = release;
    nav.go({ name: "home" });
    firstRelease();
    await settle();

    expect(slowUnmounts).toBe(1);
    expect(mountedAfter).toEqual([]);
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
