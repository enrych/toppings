import { EXTERNAL_URL } from "./links";

export const INSTALL_REASON = {
  INSTALL: "install",
  UPDATE: "update",
} as const;

export const INSTALL_URL = EXTERNAL_URL.GITHUB_PAGES_TOPPINGS;

export const UNINSTALL_URL = EXTERNAL_URL.GITHUB_ISSUES;

export const MESSAGE_TYPE = {
  CONTEXT: "context",
  EVENT: "event",
} as const;

export const EVENT_TYPE = {
  CONNECTED: "connected",
} as const;

export const JSON_MESSAGE_FIELD = {
  TYPE: "type",
  PAYLOAD: "payload",
} as const;

export const PATHNAME = {
  WATCH: "watch",
  PLAYLIST: "playlist",
  SHORTS: "shorts",
} as const;

export const YOUTUBE_PAGE_PATH = {
  WATCH: "/watch",
  PLAYLIST: "/playlist",
  SHORTS: "/shorts",
} as const;

export const WATCH_LATER_PLAYLIST_ID = "WL";

export const LIKED_VIDEOS_PLAYLIST_ID = "LL";

export const YOUTUBE_SEARCH_PARAM = {
  VIDEO_ID: "v",
  PLAYLIST_ID: "list",
} as const;

export const WARNING_MESSAGE = {
  NO_HANDLER_FOUND: "[Toppings] No content script handler for pathname:",
} as const;

export const ERROR_MESSAGE = {
  STORE_NOT_FOUND: "Store not found",
  FAILED_FETCHING_PLAYLIST_DATA: "Failed fetching playlist data",
} as const;

export const LOCAL_SERVER_URL = "http://127.0.0.1:8787";

export const PROD_SERVER_URL = "https://toppings.enry.ch";

export const WORKER_API_PATH = {
  PLAYLIST_PREFIX: "/playlist",
} as const;

export const ROUTE_PATH_ABSOLUTE_PREFIX = "/" as const;

export const YOUTUBE_URL_PATH_SEGMENT_INDEX = {
  SHORTS_VIDEO_ID: 2,
} as const;
