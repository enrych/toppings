/** YouTube page DOM hooks used by content scripts. */
export const YOUTUBE_PAGE_DOM = {
  MOVIE_PLAYER_ELEMENT_ID: "movie_player",
  AD_SHOWING_CLASS: "ad-showing",
} as const;

export const EXTENSION_AUDIO_MODE_DOM = {
  OVERLAY_ELEMENT_ID: "tppng-audio-mode-overlay",
  UI_CONTAINER_ELEMENT_ID: "tppng-audio-mode-ui",
  MOVIE_PLAYER_AUDIO_MODE_CLASS: "tppng-audio-mode-on",
} as const;
