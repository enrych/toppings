export const BASE_URL = {
  LOCAL: "http://127.0.0.1:8787",
  PRODUCTION: "https://toppings.enry.ch",
} as const;

export const ENDPOINTS = {
  PING: "/ping",
  PLAYLIST: "/api/v1/playlist/{{playlistId}}",
} as const;
