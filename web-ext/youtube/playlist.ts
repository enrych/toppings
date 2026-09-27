import { resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

// YouTube serves two playlist layouts: the page-header one, whose class names
// are generated so only the custom elements are matched, and the older
// sidebar one.
const HEADER_STRATEGIES = [
  "yt-page-header-renderer yt-content-metadata-view-model",
  "ytd-playlist-header-renderer .metadata-action-bar",
  "ytd-playlist-sidebar-primary-info-renderer #stats",
  "yt-page-header-renderer",
  "ytd-playlist-header-renderer",
] as const;

export function resolvePlaylistHeader(): Promise<PrimitiveResolution> {
  return resolveTarget(HEADER_STRATEGIES);
}

// The title block of the playlist panel beside the player on a watch page:
// playlist name, then the "channel · 2/10" line.
const WATCH_PANEL_STRATEGIES = [
  "#secondary ytd-playlist-panel-renderer #header-description",
  "ytd-playlist-panel-renderer #header-description",
  "ytd-playlist-panel-renderer #header-contents",
  "ytd-playlist-panel-renderer #header",
] as const;

export function resolveWatchPlaylistPanel(): Promise<PrimitiveResolution> {
  return resolveTarget(WATCH_PANEL_STRATEGIES);
}
