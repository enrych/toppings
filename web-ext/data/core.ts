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

export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export const EXTENSION_INSTALL_REASON = {
  INSTALL: "install",
  UPDATE: "update",
} as const;

export const EXTENSION_MESSAGE_BODY = {
  TYPE: "type",
  PAYLOAD: "payload",
} as const;

export const EXTENSION_MESSAGE_TYPE = {
  CONTEXT: "context",
  EVENT: "event",
} as const;

export const EXTENSION_MESSAGE_EVENT = {
  CONNECTED: "connected",
} as const;

export const CHROME_STORAGE_LOCAL = {
  OPTIONS_SIDEBAR_COLLAPSED: "toppings:options_sidebar_collapsed",
  AUDIO_MODE_GLOBAL_CUSTOM_IMAGE: "toppings:audio_mode_global_custom_image",
  PROFILE_STORE: "toppings:profile_store",
  FEATURE_REPORTS: "toppings:feature_reports",
  FEATURE_RECOVERED: "toppings:feature_recovered",
  PLAYLIST_CACHE_PREFIX: "toppings:playlist_cache:",
} as const;

export const BROWSER_STORAGE_IDB = {
  VIDEO_PREFERENCE: "video_preference",
  CAPABILITY_CACHE: "capability_cache",
  LOOP_SEGMENT: "loop_segment",
  SEGMENT_DATA: "segment_data",
} as const;
