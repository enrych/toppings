import type { Feature } from "@/kernel/features";
import { mount } from "@/kernel/dom/mount";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import { adoptTextStyle } from "@/kernel/dom/adoptTextStyle";
import { metadataTextIn, resolvePlaylistHeader, resolveWatchPlaylistPanel } from "@/youtube/playlist";
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
      if (route.name === "watch") return mountBadge(route.playlistId);
      if (route.name !== "playlist" || !route.playlistId || route.system) return;
      if (!(await deps.isEnabled())) return;
      const playlistId = route.playlistId;

      const header = await resolvePlaylistHeader();
      void setCapabilityStatus("playlist.runtime", "playlist", header);
      if (!header.resolved) return;

      const { sample, separator } = metadataTextIn(header.element);
      const view = (runtime: PlaylistRuntime | null) => (
        <RuntimeLine
          runtime={runtime}
          separator={separator}
          onRefresh={async () => {
            section.update(view(null));
            const fresh = await deps.getRuntime(playlistId, true);
            section.update(view(fresh ?? runtime));
          }}
        />
      );
      const section = mount("tppng-playlist-runtime", header.element, view(null));
      adoptTextStyle(section.host, sample);
      const runtime = await deps.getRuntime(playlistId, false);
      if (!runtime) {
        section.unmount();
        return;
      }
      section.update(view(runtime));
      return () => section.unmount();
    },
  };

  // On a watch page opened from a playlist, a one-line badge in the panel header.
  async function mountBadge(playlistId: string | null) {
    if (!playlistId || !(await deps.isEnabled())) return;
    const panel = await resolveWatchPlaylistPanel();
    if (!panel.resolved) return;
    const { sample, separator } = metadataTextIn(panel.element);
    const badge = mount("tppng-watch-playlist-runtime", panel.element, <RuntimeLine runtime={null} separator={separator} />);
    adoptTextStyle(badge.host, sample);
    const runtime = await deps.getRuntime(playlistId, false);
    if (!runtime) {
      badge.unmount();
      return;
    }
    badge.update(<RuntimeLine runtime={runtime} separator={separator} />);
    return () => badge.unmount();
  }
}

export const playlistRuntime = createPlaylistRuntime({
  getRuntime: (playlistId, refresh) => getPlaylistRuntime.send({ playlistId, refresh }),
  isEnabled: async () => (await playlistRuntimeSettings.get()).enabled,
});
