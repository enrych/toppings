import { EXTERNAL_URL } from "./links";

export const BASE_URL = {
  LOCAL: "http://127.0.0.1:8787",
  PRODUCTION: EXTERNAL_URL.WEBSITE,
} as const;

export const ENDPOINTS = {
  PING: "/ping",
  PLAYLIST: "/api/v1/playlist/{{playlistId}}",
} as const;
