export const GOOGLE_API_ORIGIN = "https://www.googleapis.com";

export const GOOGLE_API_URL = {
  RESOURCE: "{{origin}}{{path}}",
} as const;

export const GOOGLE_API_QUERY = {
  PART: "part",
  MAX_RESULTS: "maxResults",
  FIELDS: "fields",
  KEY: "key",
  PAGE_TOKEN: "pageToken",
  ID: "id",
} as const;

export const YOUTUBE_API_ENDPOINT = {
  PLAYLIST_ITEMS: "/youtube/v3/playlistItems",
  VIDEOS: "/youtube/v3/videos",
} as const;

export const YOUTUBE_API_QUERY = {
  PLAYLIST_ID: "playlistId",
} as const;

export const YOUTUBE_API_PLAYLIST = {
  PART: "contentDetails",
  FIELDS: "items/contentDetails/videoId,nextPageToken",
  PAGE_SIZE: 50,
} as const;

export const YOUTUBE_API_VIDEO = {
  PART: "contentDetails",
  FIELDS: "items/contentDetails/duration",
} as const;
