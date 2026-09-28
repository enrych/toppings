export const CHROME_STORAGE_LOCAL_KEY = {
  OPTIONS_SIDEBAR_COLLAPSED: "toppings:options_sidebar_collapsed",
  PROFILE_STORE: "toppings:profile_store",
  FEATURE_REPORTS: "toppings:feature_reports",
  FEATURE_RECOVERED: "toppings:feature_recovered",
  PLAYLIST_CACHE_PREFIX: "toppings:playlist_cache:",
  CAPABILITY_PREFIX: "toppings:capability:",
  // The name predates profiles; kept so an image chosen in 3.x still shows.
  VISUALS_IMAGE: "toppings:audio_mode_global_custom_image",
} as const;

export const BROWSER_STORAGE_IDB_STORE = {
  VIDEO_PREFERENCE: "video_preference",
  LOOP_SEGMENT: "loop_segment",
  SEGMENT_DATA: "segment_data",
} as const;
