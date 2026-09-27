import { afterEach, describe, expect, test } from "bun:test";
import { createPlaylistRuntime } from "./index";

// The playlist header layouts YouTube serves, reduced to what the feature
// resolves against.
const layouts = {
  "header card": `<ytd-browse page-subtype="playlist"><ytd-playlist-header-renderer><div class="metadata-action-bar">
      <div class="metadata-text-wrapper"><ytd-playlist-byline-renderer>10 videos</ytd-playlist-byline-renderer></div>
    </div></ytd-playlist-header-renderer></ytd-browse>`,
  "page header": `<ytd-browse page-subtype="playlist"><yt-page-header-renderer><div class="ytPageHeaderViewModelHost">
      <yt-content-metadata-view-model class="ytContentMetadataViewModelHost"><div><span class="ytContentMetadataViewModelMetadataText">Playlist</span><span class="ytContentMetadataViewModelDelimiter">•</span><span class="ytContentMetadataViewModelMetadataText" style="color: rgb(170, 170, 170)">10 videos</span></div></yt-content-metadata-view-model>
    </div></yt-page-header-renderer></ytd-browse>`,
  sidebar: `<ytd-browse page-subtype="playlist"><ytd-playlist-sidebar-primary-info-renderer><div id="stats">10 videos</div></ytd-playlist-sidebar-primary-info-renderer></ytd-browse>`,
};

const runtime = { playlistId: "PL1", totalVideos: 10, totalRuntime: 13054, averageRuntime: 1305 };

function feature(overrides: Partial<Parameters<typeof createPlaylistRuntime>[0]> = {}) {
  return createPlaylistRuntime({
    getRuntime: async () => runtime,
    isEnabled: async () => true,
    ...overrides,
  });
}

const playlistRoute = { name: "playlist", playlistId: "PL1", system: false } as const;
const settle = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
  document.body.innerHTML = "";
});

describe("playlist runtime", () => {
  for (const [name, html] of Object.entries(layouts)) {
    test(`renders the runtimes into the ${name} layout`, async () => {
      document.body.innerHTML = html;
      const unmount = await feature().mount({ route: playlistRoute });
      await settle();

      const host = document.getElementById("tppng-playlist-runtime");
      expect(host).not.toBeNull();
      const text = host!.shadowRoot!.textContent;
      expect(text).toMatch(/3:37:34 total•?21:45 avg/);

      unmount?.();
      expect(document.getElementById("tppng-playlist-runtime")).toBeNull();
    });
  }

  test("lands under the byline, not in a hidden channel page left behind by navigation", async () => {
    document.body.innerHTML = `<ytd-browse page-subtype="channels" hidden><yt-page-header-renderer><yt-content-metadata-view-model></yt-content-metadata-view-model></yt-page-header-renderer></ytd-browse>${layouts["header card"]}`;
    const unmount = await feature().mount({ route: playlistRoute });
    const host = document.getElementById("tppng-playlist-runtime")!;
    expect(host.parentElement!.className).toBe("metadata-text-wrapper");
    expect(host.previousElementSibling!.tagName.toLowerCase()).toBe("ytd-playlist-byline-renderer");
    unmount?.();
  });

  test("adds a badge to the playlist panel on a watch page", async () => {
    document.body.innerHTML = `<ytd-playlist-panel-renderer><div id="header"><div id="header-description"><h3>Neural networks</h3><div id="publisher-container">3Blue1Brown · 2/10</div></div></div></ytd-playlist-panel-renderer>`;
    const unmount = await feature().mount({ route: { name: "watch", videoId: "v1", playlistId: "PL1" } });
    await settle();
    const badge = document.getElementById("tppng-watch-playlist-runtime");
    expect(badge!.parentElement!.id).toBe("header-description");
    expect(badge!.shadowRoot!.textContent).toContain("3:37:34 total21:45 avg");
    unmount?.();
    expect(document.getElementById("tppng-watch-playlist-runtime")).toBeNull();
  });

  test("takes YouTube's separator and text colour in the page-header layout", async () => {
    document.body.innerHTML = layouts["page header"];
    const unmount = await feature().mount({ route: playlistRoute });
    await settle();
    const host = document.getElementById("tppng-playlist-runtime")!;
    expect(host.shadowRoot!.textContent).toContain("3:37:34 total•21:45 avg");
    expect(host.style.color).toBe("rgb(170, 170, 170)");
    unmount?.();
  });

  test("mounts without waiting for the runtime, holding the space with a skeleton", async () => {
    document.body.innerHTML = layouts["header card"];
    let answer!: (r: typeof runtime) => void;
    const unmount = await feature({ getRuntime: () => new Promise((r) => (answer = r)) }).mount({ route: playlistRoute });
    const root = document.getElementById("tppng-playlist-runtime")!.shadowRoot!;
    expect(root.querySelector(".bone")).not.toBeNull();
    answer(runtime);
    await settle();
    expect(root.querySelector(".bone")).toBeNull();
    expect(root.textContent).toContain("3:37:34 total");
    unmount?.();
  });

  test("removes the skeleton when the runtime cannot be fetched", async () => {
    document.body.innerHTML = layouts["header card"];
    await feature({ getRuntime: async () => null }).mount({ route: playlistRoute });
    await settle();
    expect(document.getElementById("tppng-playlist-runtime")).toBeNull();
  });

  test("removes the skeleton when asking for the runtime throws", async () => {
    document.body.innerHTML = layouts["header card"];
    await feature({ getRuntime: () => Promise.reject(new Error("offline")) }).mount({ route: playlistRoute });
    await settle();
    expect(document.getElementById("tppng-playlist-runtime")).toBeNull();
  });

  test("draws nothing when the runtime arrives after navigating away", async () => {
    document.body.innerHTML = layouts["header card"];
    let answer!: (r: typeof runtime) => void;
    const unmount = await feature({ getRuntime: () => new Promise((r) => (answer = r)) }).mount({ route: playlistRoute });
    unmount?.();
    answer(runtime);
    await settle();
    expect(document.getElementById("tppng-playlist-runtime")).toBeNull();
  });

  test("skips mixes in the watch page's playlist panel", async () => {
    document.body.innerHTML = `<ytd-playlist-panel-renderer><div id="header"><div id="header-description"></div></div></ytd-playlist-panel-renderer>`;
    await feature().mount({ route: { name: "watch", videoId: "v1", playlistId: "RDv1" } });
    expect(document.getElementById("tppng-watch-playlist-runtime")).toBeNull();
  });

  test("does nothing when disabled", async () => {
    document.body.innerHTML = layouts.sidebar;
    await feature({ isEnabled: async () => false }).mount({ route: playlistRoute });
    expect(document.getElementById("tppng-playlist-runtime")).toBeNull();
  });

  test("skips Watch Later and Liked", async () => {
    document.body.innerHTML = layouts.sidebar;
    await feature().mount({ route: { name: "playlist", playlistId: "WL", system: true } });
    expect(document.getElementById("tppng-playlist-runtime")).toBeNull();
  });

  test("refresh asks for uncached data and shows it", async () => {
    document.body.innerHTML = layouts.sidebar;
    const calls: boolean[] = [];
    await feature({
      getRuntime: async (_, refresh) => {
        calls.push(refresh);
        return refresh ? { ...runtime, totalRuntime: 60, averageRuntime: 6 } : runtime;
      },
    }).mount({ route: playlistRoute });
    await settle();

    const root = document.getElementById("tppng-playlist-runtime")!.shadowRoot!;
    root.querySelector("button")!.click();
    expect(root.querySelector(".bone")).not.toBeNull();
    await new Promise((r) => setTimeout(r, 0));

    expect(calls).toEqual([false, true]);
    expect(root.querySelector(".bone")).toBeNull();
    expect(root.textContent).toContain("1:00 total");
  });

  test("a refresh that fails keeps showing the last runtime", async () => {
    document.body.innerHTML = layouts.sidebar;
    await feature({ getRuntime: async (_, refresh) => (refresh ? Promise.reject(new Error("offline")) : runtime) }).mount({ route: playlistRoute });
    await settle();
    const root = document.getElementById("tppng-playlist-runtime")!.shadowRoot!;
    root.querySelector("button")!.click();
    await settle();
    expect(root.querySelector(".bone")).toBeNull();
    expect(root.textContent).toContain("3:37:34 total");
  });
});
