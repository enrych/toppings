import { describe, expect, test } from "bun:test";
import { routeFor } from "./route";

const at = (path: string) => routeFor(new URL(`https://www.youtube.com${path}`));

describe("routeFor", () => {
  test("watch pages carry the video id", () => {
    expect(at("/watch?v=abc123")).toEqual({ name: "watch", videoId: "abc123", playlistId: null });
    expect(at("/watch?v=abc123&list=PL1")).toMatchObject({ playlistId: "PL1" });
  });

  test("playlists distinguish YouTube's own lists", () => {
    expect(at("/playlist?list=PL1")).toEqual({ name: "playlist", playlistId: "PL1", system: false });
    expect(at("/playlist?list=WL")).toEqual({ name: "playlist", playlistId: "WL", system: true });
    expect(at("/playlist?list=LL")).toMatchObject({ system: true });
  });

  test("shorts carry the short id", () => {
    expect(at("/shorts/xyz")).toEqual({ name: "shorts", shortId: "xyz" });
  });

  test("home, search and everything else", () => {
    expect(at("/").name).toBe("home");
    expect(at("/results?search_query=q").name).toBe("search");
    expect(at("/@channel").name).toBe("other");
  });
});
