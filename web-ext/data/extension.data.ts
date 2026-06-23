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

export const EXTENSION_LOCAL_STORAGE_KEY = {
  OPTIONS_SIDEBAR_COLLAPSED: "toppings:options_sidebar_collapsed",
  AUDIO_MODE_GLOBAL_CUSTOM_IMAGE: "toppings:audio_mode_global_custom_image",
} as const;
