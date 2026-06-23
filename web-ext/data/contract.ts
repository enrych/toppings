export const EXTENSION_CONTEXT_SCOPE = {
  WATCH: "watch",
  PLAYLIST: "playlist",
  SHORTS: "shorts",
  YOUTUBE: "youtube",
  UNSUPPORTED: "unsupported",
} as const;

export type ExtensionContextScope =
  (typeof EXTENSION_CONTEXT_SCOPE)[keyof typeof EXTENSION_CONTEXT_SCOPE];

export const YOUTUBE_HOSTNAME_SUFFIX = "youtube.com";

export const YOUTUBE_URL_PATH = {
  WATCH: "/watch",
  PLAYLIST: "/playlist",
  SHORTS: "/shorts",
} as const;

export const YOUTUBE_QUERY_PARAM = {
  VIDEO_ID: "v",
  PLAYLIST_ID: "list",
} as const;

export const YOUTUBE_SYSTEM_PLAYLIST_ID = {
  WATCH_LATER: "WL",
  LIKED: "LL",
} as const;
