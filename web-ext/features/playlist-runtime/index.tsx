import type { Feature } from "@/kernel/features";
import { mount } from "@/kernel/dom/mount";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import { resolvePlaylistHeader, resolveWatchPlaylistPanel } from "@/youtube/playlist";
import { Badge } from "./Badge";
import { getPlaylistRuntime, type PlaylistRuntime } from "./messages";
import { Section } from "./Section";
import { playlistRuntimeSettings } from "./settings";

export interface PlaylistRuntimeDeps {
  getRuntime(playlistId: string, refresh: boolean): Promise<PlaylistRuntime | null>;
  isEnabled(): Promise<boolean>;
  iconUrl(): string;
}

export function createPlaylistRuntime(deps: PlaylistRuntimeDeps): Feature {
  return {
    id: "playlist-runtime",
    routes: ["playlist", "watch"],
    async mount({ route }) {
      if (route.name === "watch") return mountBadge(route.playlistId);
      if (route.name !== "playlist" || !route.playlistId || route.system) return;
      if (!(await deps.isEnabled())) return;
      const playlistId = route.playlistId;

      const header = await resolvePlaylistHeader();
      void setCapabilityStatus("playlist.runtime", "playlist", header);
      if (!header.resolved) return;

      const runtime = await deps.getRuntime(playlistId, false);
      if (!runtime) return;

      const view = (state: { runtime: PlaylistRuntime; refreshing: boolean }) => (
        <Section
          runtime={state.runtime}
          iconUrl={deps.iconUrl()}
          refreshing={state.refreshing}
          onRefresh={async () => {
            section.update(view({ runtime: state.runtime, refreshing: true }));
            const fresh = await deps.getRuntime(playlistId, true);
            section.update(view({ runtime: fresh ?? state.runtime, refreshing: false }));
          }}
        />
      );
      const section = mount("tppng-playlist-runtime", header.element, view({ runtime, refreshing: false }));
      return () => section.unmount();
    },
  };

  // On a watch page opened from a playlist, a one-line badge in the panel header.
  async function mountBadge(playlistId: string | null) {
    if (!playlistId || !(await deps.isEnabled())) return;
    const panel = await resolveWatchPlaylistPanel();
    if (!panel.resolved) return;
    const runtime = await deps.getRuntime(playlistId, false);
    if (!runtime) return;
    const badge = mount("tppng-watch-playlist-runtime", panel.element, <Badge runtime={runtime} />);
    return () => badge.unmount();
  }
}

export const playlistRuntime = createPlaylistRuntime({
  getRuntime: (playlistId, refresh) => getPlaylistRuntime.send({ playlistId, refresh }),
  isEnabled: async () => (await playlistRuntimeSettings.get()).enabled,
  iconUrl: () => chrome.runtime.getURL("assets/icons/icon128.png"),
});
