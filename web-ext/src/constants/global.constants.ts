export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export const PROD_SERVER_URL = "https://toppings.enry.ch";
export const LOCAL_SERVER_URL = "http://localhost:8787";

export const INSTALL_URL = "https://enrych.github.io/toppings/greetings";
export const UNINSTALL_URL = "https://enrych.github.io/toppings/farewell";

export const INSTALL_REASON = {
  INSTALL: "install",
  UPDATE: "update",
} as const;

export const WATCH_LATER_PLAYLIST_ID = "WL" as const;
export const LIKED_VIDEOS_PLAYLIST_ID = "LL" as const;

export const PATHNAME = {
  WATCH: "watch",
  PLAYLIST: "playlist",
  SHORTS: "shorts",
} as const;

export const ERROR_MESSAGE = {
  STORE_NOT_FOUND: "Extension store not found.",
  FAILED_FETCHING_PLAYLIST_DATA: "Failed to fetch playlist data.",
} as const;

export const WARNING_MESSAGE = {
  NO_HANDLER_FOUND: "No handler found",
};

export const YOUTUBE_SEARCH_PARAM = {
  VIDEO_ID: "v",
  PLAYLIST_ID: "list",
} as const;

export const HTTP_METHOD = {
  GET: "GET",
} as const;

export const HTTP_ACCEPT = {
  JSON: "application/json",
} as const;

export const HTTP_STATUS = {
  NOT_FOUND: 404,
} as const;

export const MESSAGE_TYPE = {
  EVENT: "event",
  CONTEXT: "context",
} as const;

export const EVENT_TYPE = {
  CONNECTED: "connected",
} as const;
