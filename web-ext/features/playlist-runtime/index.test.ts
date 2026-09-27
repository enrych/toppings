import { afterEach, describe, expect, test } from "bun:test";
import { createPlaylistRuntime } from "./index";

// The two playlist header layouts YouTube serves, reduced to what the feature
// resolves against.
const layouts = {
  "page header": `<ytd-browse><yt-page-header-renderer><div class="ytPageHeaderViewModelHost">
      <yt-content-metadata-view-model class="ytContentMetadataViewModelHost"><span>10 videos</span></yt-content-metadata-view-model>
    </div></yt-page-header-renderer></ytd-browse>`,
  sidebar: `<ytd-playlist-header-renderer><div class="metadata-action-bar"><div>10 videos</div></div></ytd-playlist-header-renderer>`,
};

const runtime = { playlistId: "PL1", totalVideos: 10, totalRuntime: 13054, averageRuntime: 1305 };

function feature(overrides: Partial<Parameters<typeof createPlaylistRuntime>[0]> = {}) {
  return createPlaylistRuntime({
    getRuntime: async () => runtime,
    isEnabled: async () => true,
    iconUrl: () => "icon.png",
    ...overrides,
  });
}

const playlistRoute = { name: "playlist", playlistId: "PL1", system: false } as const;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("playlist runtime", () => {
  for (const [name, html] of Object.entries(layouts)) {
    test(`renders the runtimes into the ${name} layout`, async () => {
      document.body.innerHTML = html;
      const unmount = await feature().mount({ route: playlistRoute });

      const host = document.getElementById("tppng-playlist-runtime");
      expect(host).not.toBeNull();
      const text = host!.shadowRoot!.textContent;
      expect(text).toContain("3:37:34 total·21:45 avg");

      unmount?.();
      expect(document.getElementById("tppng-playlist-runtime")).toBeNull();
    });
  }

  test("adds a badge to the playlist panel on a watch page", async () => {
    document.body.innerHTML = `<ytd-playlist-panel-renderer><div id="header"><div id="header-description"><h3>Neural networks</h3><div id="publisher-container">3Blue1Brown · 2/10</div></div></div></ytd-playlist-panel-renderer>`;
    const unmount = await feature().mount({ route: { name: "watch", videoId: "v1", playlistId: "PL1" } });
    const badge = document.getElementById("tppng-watch-playlist-runtime");
    expect(badge!.parentElement!.id).toBe("header-description");
    expect(badge!.shadowRoot!.textContent).toContain("3:37:34 total·21:45 avg");
    unmount?.();
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

    const root = document.getElementById("tppng-playlist-runtime")!.shadowRoot!;
    root.querySelector("button")!.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(calls).toEqual([false, true]);
    expect(root.textContent).toContain("1:00 total");
  });
});
