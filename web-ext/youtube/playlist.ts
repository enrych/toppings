import { resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

// Scoped to the playlist page: YouTube keeps the page you came from alive but
// hidden, and a channel page carries a yt-page-header-renderer of its own.
// Course playlists get a header card, whose "10 videos · Last updated" block
// is the first strategy; regular playlists get the page header, whose
// "Playlist · 34 videos · views" block is the second; the rest are fallbacks.
const PLAYLIST_PAGE = "ytd-browse[page-subtype='playlist']";
const HEADER_STRATEGIES = [
  `${PLAYLIST_PAGE} ytd-playlist-header-renderer .metadata-text-wrapper`,
  `${PLAYLIST_PAGE} yt-page-header-renderer yt-content-metadata-view-model`,
  `${PLAYLIST_PAGE} ytd-playlist-header-renderer .metadata-action-bar`,
  `${PLAYLIST_PAGE} ytd-playlist-sidebar-primary-info-renderer #stats`,
  `${PLAYLIST_PAGE} yt-page-header-renderer`,
  `${PLAYLIST_PAGE} ytd-playlist-header-renderer`,
];

// The title block of the playlist panel beside the player on a watch page:
// playlist name, then the "channel · 2/10" line.
const WATCH_PANEL_STRATEGIES = [
  "#secondary ytd-playlist-panel-renderer #header-description",
  "ytd-playlist-panel-renderer #header-description",
  "ytd-playlist-panel-renderer #header-contents",
  "ytd-playlist-panel-renderer #header",
] as const;

export function resolvePlaylistHeader(): Promise<PrimitiveResolution> {
  return resolveTarget(HEADER_STRATEGIES);
}

export function resolveWatchPlaylistPanel(): Promise<PrimitiveResolution> {
  return resolveTarget(WATCH_PANEL_STRATEGIES);
}

// YouTube's own metadata text in a header or panel, to copy the type from,
// and the separator it puts between items there. The course card and the
// watch panel space their items instead of separating them, hence null.
export function metadataTextIn(container: Element): { sample: Element | null; separator: string | null } {
  const samples = container.querySelectorAll(".ytContentMetadataViewModelMetadataText, .byline-item, #publisher-container .publisher, #stats yt-formatted-string");
  const separator = container.querySelector(".ytContentMetadataViewModelDelimiter")?.textContent?.trim() || null;
  return { sample: samples[samples.length - 1] ?? null, separator };
}
