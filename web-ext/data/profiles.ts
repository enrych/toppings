export type PlayerLayout = "default" | "theatre" | "no-video";
export type PlayerVisuals = "video" | "black" | "visualizer" | "custom";

// Every key is a primitiveId and its value is that primitive's state while the
// profile is active. An absent key means "leave YouTube alone" — which is not the
// same as a false value, and is what lets profiles compose without fighting.

export interface WatchPrimitiveConfig {
  "watch.layout"?: { value: PlayerLayout };
  "watch.visuals"?: { value: PlayerVisuals };
  "watch.sidebar"?: { visible: boolean };
  "watch.comments"?: { visible: boolean };
  "watch.endCards"?: { visible: boolean };
}

export type ThumbnailMode = "show" | "hide" | "blur"; // blur is a CSS filter, hide removes

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

export type ProfilePrimitiveConfig = WatchPrimitiveConfig &
  HomePrimitiveConfig &
  SearchPrimitiveConfig &
  ShortsPrimitiveConfig;

export interface Profile {
  id: string; // "preset:<name>" for presets, uuid for custom
  name: string;
  isPreset: boolean;
  createdAt: number; // unix ms; 0 for presets, which are never created
  primitives: ProfilePrimitiveConfig;
}

export interface ProfileStore {
  activeProfileId: string | null; // null runs on individual preferences instead
  profiles: Profile[]; // custom only; presets are constants, not stored
}

export const DEFAULT_PROFILE_STORE: ProfileStore = {
  activeProfileId: null,
  profiles: [],
};

// Presets are derived at runtime and never written to storage, so editing a
// definition here reaches existing users on update with no migration. That is
// also why they cannot be edited or deleted from the UI.

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

// Order here is the order the UI displays them in.
export const BUILT_IN_PRESETS: readonly Profile[] = [
  PRESET_AUDIO,
  PRESET_FOCUS,
];
