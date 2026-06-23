import type { PlayerLayout, PlayerVisuals } from "../utils/primitive";

// ---------------------------------------------------------------------------
// Profile primitive config
//
// Each key maps to a primitiveId. The value is that primitive's desired
// state when the profile is active. Absent keys mean "use default / no
// change from YouTube's own behaviour".
// ---------------------------------------------------------------------------

export interface WatchPrimitiveConfig {
  "watch.layout"?: { value: PlayerLayout };
  "watch.visuals"?: { value: PlayerVisuals };
  "watch.sidebar"?: { visible: boolean };
  "watch.comments"?: { visible: boolean };
  "watch.endCards"?: { visible: boolean };
}

/** Feed thumbnail display mode. blur uses CSS filter; hide removes from view. */
export type ThumbnailMode = "show" | "hide" | "blur";

export interface HomePrimitiveConfig {
  "home.thumbnails"?: { mode: ThumbnailMode };
  "home.feed"?: { visible: boolean };
  "home.shorts"?: { visible: boolean };
}

export interface SearchPrimitiveConfig {
  "search.thumbnails"?: { mode: ThumbnailMode };
  "search.metadata"?: { visible: boolean };
  "search.shorts"?: { visible: boolean };
}

export interface ShortsPrimitiveConfig {
  "shorts.shelf"?: { visible: boolean };
}

// Union of all scope configs — extends naturally as new scopes are added.
export type ProfilePrimitiveConfig = WatchPrimitiveConfig &
  HomePrimitiveConfig &
  SearchPrimitiveConfig &
  ShortsPrimitiveConfig;

// ---------------------------------------------------------------------------
// Profile type
// ---------------------------------------------------------------------------

export interface Profile {
  /** Stable unique identifier. Presets use "preset:<name>", custom use uuid. */
  id: string;
  /** Display name shown in UI. */
  name: string;
  /**
   * True for Toppings-shipped presets. Preset profiles are not editable or
   * deletable by the user — they are derived from constants, not stored.
   */
  isPreset: boolean;
  /** Unix timestamp (ms) of creation. 0 for presets. */
  createdAt: number;
  /** Primitive states to apply when this profile is active. */
  primitives: ProfilePrimitiveConfig;
}

// ---------------------------------------------------------------------------
// Profile storage shape (chrome.storage.local)
// ---------------------------------------------------------------------------

export interface ProfileStore {
  /**
   * ID of the currently active profile, or null if no profile is active
   * (extension runs using individual preferences from chrome.storage.sync).
   */
  activeProfileId: string | null;
  /** User-created custom profiles. Presets are not stored here. */
  profiles: Profile[];
}

export const DEFAULT_PROFILE_STORE: ProfileStore = {
  activeProfileId: null,
  profiles: [],
};

// ---------------------------------------------------------------------------
// Built-in presets
//
// Presets are constants — never written to storage, always derived at
// runtime. This means preset definitions update automatically when the
// extension updates, without any migration.
// ---------------------------------------------------------------------------

export const PRESET_AUDIO: Profile = {
  id: "preset:audio",
  name: "Audio",
  isPreset: true,
  createdAt: 0,
  primitives: {
    "watch.layout": { value: "no-video" },
    "watch.visuals": { value: "black" },
    "watch.sidebar": { visible: false },
  },
};

export const PRESET_FOCUS: Profile = {
  id: "preset:focus",
  name: "Focus",
  isPreset: true,
  createdAt: 0,
  primitives: {
    "watch.sidebar": { visible: false },
    "watch.comments": { visible: false },
    "watch.endCards": { visible: false },
  },
};

/** All built-in presets in display order. */
export const BUILT_IN_PRESETS: readonly Profile[] = [
  PRESET_AUDIO,
  PRESET_FOCUS,
];
