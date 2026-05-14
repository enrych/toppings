export const BACKEND_ROUTE = {
  PING: "/ping",
  PLAYLIST_MOUNT: "/playlist/*",
} as const;

export const PLAYLIST_ROUTER_BASE = "/playlist";

export const PLAYLIST_ROUTE_PARAM = {
  PLAYLIST_ID: "/:playlistId",
} as const;

export const BACKEND_RESPONSE_BODY = {
  PING_OK: "pong",
} as const;

export const BACKEND_ERROR_MESSAGE = {
  MISSING_PLAYLIST_ID: "Missing playlistId",
  PLAYLIST_NOT_FOUND_OR_PRIVATE: "Playlist not found or private",
} as const;

export const GOOGLEAPIS_HOST = "https://www.googleapis.com";

export const YOUTUBE_DATA_API_PATH = {
  PLAYLIST_ITEMS: "/youtube/v3/playlistItems",
  VIDEOS: "/youtube/v3/videos",
} as const;

export const YOUTUBE_API_QUERY = {
  PART: "part",
  MAX_RESULTS: "maxResults",
  FIELDS: "fields",
  KEY: "key",
  PLAYLIST_ID: "playlistId",
  PAGE_TOKEN: "pageToken",
  ID: "id",
} as const;

export const YOUTUBE_API_PART_VALUE = {
  PLAYLIST_ITEMS: "contentDetails",
  VIDEOS: "contentDetails",
} as const;

export const YOUTUBE_API_FIELDS_VALUE = {
  PLAYLIST_ITEMS:
    "items/contentDetails/videoId,nextPageToken",
  VIDEOS_ITEMS_DURATION: "items/contentDetails/duration",
} as const;

export const YOUTUBE_API_MAX_RESULTS_DEFAULT = 50;

export const FETCH_ERROR_TEMPLATE = {
  PLAYLIST_ITEMS: "Failed to fetch playlist items:",
  VIDEO_DETAILS: "Failed to fetch video details:",
} as const;
