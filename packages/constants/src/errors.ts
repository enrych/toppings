export const ERROR = {
  STORE_NOT_FOUND: "Store not found",
  PLAYLIST_FETCH_FAILED: "Failed fetching playlist data",
  MISSING_PLAYLIST_ID: "Missing playlistId",
  PLAYLIST_UNAVAILABLE: "Playlist not found or private",
  NO_CONTENT_HANDLER: "[Toppings] No content script handler for pathname:",
  YOUTUBE_PLAYLIST_FETCH_FAILED:
    "Failed to fetch playlist items: {{statusText}}",
  YOUTUBE_VIDEO_FETCH_FAILED: "Failed to fetch video details: {{statusText}}",
  MISSING_RELEASE_ENTRY:
    'No RELEASES entry for version "{{version}}". Update packages/constants/src/releases.ts.',
  BAD_SEMVER: "Bad semver: {{version}}",
} as const;
