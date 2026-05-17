export const GOOGLE_API_URL = "https://www.googleapis.com{{path}}";

export const GOOGLE_API_QUERY_PARAM = {
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
