import { EXTERNAL_URL } from "./links";

export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export const MESSAGE_FIELD = {
  TYPE: "type",
  PAYLOAD: "payload",
} as const;

export const MESSAGE_TYPE = {
  CONTEXT: "context",
  EVENT: "event",
} as const;

export const MESSAGE_EVENT = {
  CONNECTED: "connected",
} as const;

export const INSTALL_REASON = {
  INSTALL: "install",
  UPDATE: "update",
} as const;

export const INSTALL_URL = {
  WELCOME_TAB: EXTERNAL_URL.GITHUB_PAGES_TOPPINGS,
  UNINSTALL: EXTERNAL_URL.GITHUB_ISSUES,
} as const;

export const STORAGE_KEY = {
  OPTIONS_PENDING_ROUTE: "options_pending_route",
  AUDIO_MODE_PIN_PREFIX: "audioMode_pin_",
  AUDIO_MODE_PIN: "{{prefix}}{{videoId}}",
  OPTIONS_SIDEBAR_COLLAPSED: "options_sidebar_collapsed",
  AUDIO_MODE_GLOBAL_CUSTOM_IMAGE: "audioMode_globalCustomImage",
} as const;

/** Page ids — match preferences and content-script handlers. */
export const PAGE = {
  WATCH: "watch",
  PLAYLIST: "playlist",
  SHORTS: "shorts",
} as const;

/** youtube.com URL patterns used to resolve a tab to a PAGE. */
export const URL_PATH = {
  WATCH: "/watch",
  PLAYLIST: "/playlist",
  SHORTS: "/shorts",
} as const;

export const URL_QUERY = {
  VIDEO_ID: "v",
  PLAYLIST_ID: "list",
} as const;

export const SYSTEM_PLAYLIST_ID = {
  WATCH_LATER: "WL",
  LIKED: "LL",
} as const;

/** Path segment index of the video id in `/shorts/{id}` URLs. */
export const SHORTS_ID_PATH_SEGMENT = 2;
