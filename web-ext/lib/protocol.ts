export const EXTENSION_CONTEXT_SCOPE = {
  WATCH: "watch",
  PLAYLIST: "playlist",
  SHORTS: "shorts",
  YOUTUBE: "youtube",
  UNSUPPORTED: "unsupported",
} as const;

export type ExtensionContextScope =
  (typeof EXTENSION_CONTEXT_SCOPE)[keyof typeof EXTENSION_CONTEXT_SCOPE];

export const EXTENSION_MESSAGE_TYPE = {
  CONTEXT: "context",
  EVENT: "event",
} as const;

export const EXTENSION_MESSAGE_EVENT = {
  CONNECTED: "connected",
} as const;
