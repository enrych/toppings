import { resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

// YouTube serves two playlist layouts: the page-header one, whose class names
// are generated so only the custom elements are matched, and the older
// sidebar one.
const HEADER_STRATEGIES = [
  "yt-page-header-renderer yt-content-metadata-view-model",
  "ytd-playlist-header-renderer .metadata-action-bar",
  "ytd-playlist-sidebar-primary-info-renderer #stats",
] as const;

export function resolvePlaylistHeader(): Promise<PrimitiveResolution> {
  return resolveTarget(HEADER_STRATEGIES);
}

// The playlist panel beside the player on a watch page.
const WATCH_PANEL_STRATEGIES = [
  "#playlist-container .ytd-playlist-panel-renderer #header",
  "ytd-playlist-panel-renderer #header",
  "#secondary ytd-playlist-panel-renderer #header-title",
  "#secondary ytd-playlist-panel-renderer",
] as const;

export function resolveWatchPlaylistPanel(): Promise<PrimitiveResolution> {
  return resolveTarget(WATCH_PANEL_STRATEGIES);
}
