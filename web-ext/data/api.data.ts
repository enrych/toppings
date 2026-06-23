export const EXTENSION_API_BASE_URL = {
  LOCAL: "http://127.0.0.1:8787/api{{endpoint}}",
  PRODUCTION: "https://toppings.enry.ch/api{{endpoint}}",
} as const;

export const EXTENSION_API_ENDPOINT = {
  PING: "/ping",
  PLAYLIST_V1: "/v1/playlist/{{playlistId}}",
} as const;
