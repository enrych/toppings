import type { Layout, Thumbnails, Visibility, Visuals } from "@/youtube/primitives";

export type { PlayerLayout, ThumbnailMode, VisualsMode } from "@/youtube/primitives";

// Keyed by primitive id. An absent key means "leave YouTube alone", which is
// not the same as a default value and is what lets profiles stay small.
export interface ProfilePrimitiveConfig {
  "watch.layout"?: Layout;
  "watch.visuals"?: Visuals;
  "watch.sidebar"?: Visibility;
  "watch.comments"?: Visibility;
  "watch.endCards"?: Visibility;
  "home.thumbnails"?: Thumbnails;
  "home.feed"?: Visibility;
  "home.shorts"?: Visibility;
  "search.thumbnails"?: Thumbnails;
  "search.metadata"?: Visibility;
  "search.shorts"?: Visibility;
  "shorts.shelf"?: Visibility;
}

export interface Profile {
  id: string;
  name: string;
  isPreset: boolean;
  createdAt: number;
  primitives: ProfilePrimitiveConfig;
}

// Presets are constants, never stored, so editing one here reaches existing
// users on update with no migration; that is also why the UI cannot edit them.
export const PRESET_AUDIO: Profile = {
  id: "preset:audio",
  name: "Audio",
  isPreset: true,
  createdAt: 0,
  primitives: {
    "watch.visuals": { value: "visualizer" },
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

export const BUILT_IN_PRESETS: readonly Profile[] = [PRESET_AUDIO, PRESET_FOCUS];
