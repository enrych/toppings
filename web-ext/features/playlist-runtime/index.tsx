import type { Feature, Unmount } from "@/kernel/features";
import { mount } from "@/kernel/dom/mount";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import { adoptTextStyle } from "@/kernel/dom/adoptTextStyle";
import { metadataTextIn, resolvePlaylistHeader, resolveWatchPlaylistPanel } from "@/youtube/playlist";
import { isSystemPlaylist } from "@/youtube/route";
import { getPlaylistRuntime, type PlaylistRuntime } from "./messages";
import { RuntimeLine } from "./RuntimeLine";
import { playlistRuntimeSettings } from "./settings";

export interface PlaylistRuntimeDeps {
  getRuntime(playlistId: string, refresh: boolean): Promise<PlaylistRuntime | null>;
  isEnabled(): Promise<boolean>;
}

export function createPlaylistRuntime(deps: PlaylistRuntimeDeps): Feature {
  return {
    id: "playlist-runtime",
    routes: ["playlist", "watch"],
    async mount({ route }) {
      if (route.name !== "playlist" && route.name !== "watch") return;
      const { playlistId } = route;
      if (!playlistId || isSystemPlaylist(playlistId) || !(await deps.isEnabled())) return;

      if (route.name === "watch") {
        const panel = await resolveWatchPlaylistPanel();
        if (!panel.resolved) return;
        return showRuntime("tppng-watch-playlist-runtime", panel.element, playlistId, false);
      }
      const header = await resolvePlaylistHeader();
      void setCapabilityStatus("playlist.runtime", "playlist", header);
      if (!header.resolved) return;
      return showRuntime("tppng-playlist-runtime", header.element, playlistId, true);
    },
  };

  // Returns as soon as the skeleton is up: features mount one after another,
  // so waiting here would hold every later feature behind the network.
  function showRuntime(id: string, container: Element, playlistId: string, refreshable: boolean): Unmount {
    const { sample, separator } = metadataTextIn(container);
    let mounted = true;
    let shown: PlaylistRuntime | null = null;

    const view = (runtime: PlaylistRuntime | null) => (
      <RuntimeLine runtime={runtime} separator={separator} onRefresh={refreshable && runtime ? () => void load(true) : undefined} />
    );
    const line = mount(id, container, view(null));
    adoptTextStyle(line.host, sample);
    const remove = () => {
      if (!mounted) return;
      mounted = false;
      line.unmount();
    };

    const load = async (refresh: boolean) => {
      line.update(view(null));
      const runtime = await deps.getRuntime(playlistId, refresh).catch(() => null);
      if (!mounted) return;
      shown = runtime ?? shown;
      if (shown) line.update(view(shown));
      else remove();
    };
    void load(false);
    return remove;
  }
}

export const playlistRuntime = createPlaylistRuntime({
  getRuntime: (playlistId, refresh) => getPlaylistRuntime.send({ playlistId, refresh }),
  isEnabled: async () => (await playlistRuntimeSettings.get()).enabled,
});
