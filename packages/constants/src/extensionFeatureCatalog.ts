import { OPTIONS_DOCUMENT_PATH } from "./extensionOptionsNavigation";

export type ExtensionFeatureStatus =
  | "stable"
  | "new"
  | "beta"
  | "deprecated";

export const FEATURE_STATUS = {
  STABLE: "stable",
  NEW: "new",
  BETA: "beta",
  DEPRECATED: "deprecated",
} as const;

export const FEATURE_SURFACE = {
  WATCH: "watch",
  SHORTS: "shorts",
  PLAYLIST: "playlist",
} as const;

export type ExtensionFeatureSurface =
  (typeof FEATURE_SURFACE)[keyof typeof FEATURE_SURFACE];

export interface ExtensionFeatureDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  anchor?: string;
  status: ExtensionFeatureStatus;
  surfaces: ExtensionFeatureSurface[];
}

export const EXTENSION_FEATURE_ANCHOR = {
  PLAYBACK_RATE: "playback-rate",
  WATCH: "watch",
  LOOP: "loop",
  SEEK: "seek",
} as const;

export const EXTENSION_WHATS_NEW_VERSION = {
  NEXT: "next",
} as const;

export const EXTENSION_WHATS_NEW_DATE = {
  MAY_2026: "2026-05",
} as const;

export const EXTENSION_WHATS_NEW_ITEM = {
  AUDIO_MODE:
    "New: Audio Mode — listen without the video, with black / visualizer / custom backgrounds",
  VISUALIZER_SENSITIVITY: "New: Visualizer sensitivity control",
  THEMES: "Themes: pick between system / dark / light",
  OPTIONS_REDESIGN:
    "Redesigned options page with a sidebar, sections, toasts, and confirm dialogs",
} as const;

export const EXTENSION_FEATURE_ID = {
  AUDIO_MODE: "audio-mode",
  CUSTOM_PLAYBACK_RATES: "custom-playback-rates",
  TOGGLE_PLAYBACK_RATE: "toggle-playback-rate",
  LOOP_SEGMENTS: "loop-segments",
  SEEK_SHORTCUTS: "seek-shortcuts",
  SHORTS_AUTOSCROLL: "shorts-autoscroll",
  PLAYLIST_RUNTIME: "playlist-runtime",
} as const;

export const EXTENSION_ICON_NAME = {
  AUDIO: "audio",
  WATCH: "watch",
  KEYBOARD: "keyboard",
  SHORTS: "shorts",
  PLAYLIST: "playlist",
} as const;

export const EXTENSION_FEATURE_DEFINITIONS: ExtensionFeatureDefinition[] = [
  {
    id: EXTENSION_FEATURE_ID.AUDIO_MODE,
    name: "Audio Mode",
    description:
      "Hide the video and listen to audio only — perfect for office or background play.",
    icon: EXTENSION_ICON_NAME.AUDIO,
    route: OPTIONS_DOCUMENT_PATH.AUDIO_MODE,
    status: FEATURE_STATUS.NEW,
    surfaces: [FEATURE_SURFACE.WATCH],
  },
  {
    id: EXTENSION_FEATURE_ID.CUSTOM_PLAYBACK_RATES,
    name: "Custom Playback Rates",
    description:
      "Add granular speeds beyond YouTube's defaults — anywhere from 0.0625× to 16×.",
    icon: EXTENSION_ICON_NAME.WATCH,
    route: OPTIONS_DOCUMENT_PATH.WATCH,
    anchor: EXTENSION_FEATURE_ANCHOR.PLAYBACK_RATE,
    status: FEATURE_STATUS.STABLE,
    surfaces: [FEATURE_SURFACE.WATCH],
  },
  {
    id: EXTENSION_FEATURE_ID.TOGGLE_PLAYBACK_RATE,
    name: "Toggle Playback Rate",
    description:
      "Press one key to flip between normal speed and your preferred fast rate.",
    icon: EXTENSION_ICON_NAME.WATCH,
    route: OPTIONS_DOCUMENT_PATH.KEYBINDINGS,
    anchor: EXTENSION_FEATURE_ANCHOR.WATCH,
    status: FEATURE_STATUS.STABLE,
    surfaces: [FEATURE_SURFACE.WATCH, FEATURE_SURFACE.SHORTS],
  },
  {
    id: EXTENSION_FEATURE_ID.LOOP_SEGMENTS,
    name: "Loop Segments",
    description:
      "Mark a start and end point in any video to loop a section continuously.",
    icon: EXTENSION_ICON_NAME.WATCH,
    route: OPTIONS_DOCUMENT_PATH.WATCH,
    anchor: EXTENSION_FEATURE_ANCHOR.LOOP,
    status: FEATURE_STATUS.STABLE,
    surfaces: [FEATURE_SURFACE.WATCH],
  },
  {
    id: EXTENSION_FEATURE_ID.SEEK_SHORTCUTS,
    name: "Seek Shortcuts",
    description:
      "Jump forward and backward with configurable durations via keyboard shortcuts.",
    icon: EXTENSION_ICON_NAME.KEYBOARD,
    route: OPTIONS_DOCUMENT_PATH.WATCH,
    anchor: EXTENSION_FEATURE_ANCHOR.SEEK,
    status: FEATURE_STATUS.STABLE,
    surfaces: [FEATURE_SURFACE.WATCH, FEATURE_SURFACE.SHORTS],
  },
  {
    id: EXTENSION_FEATURE_ID.SHORTS_AUTOSCROLL,
    name: "Shorts Auto-Scroll",
    description: "Automatically advance to the next Short when one ends.",
    icon: EXTENSION_ICON_NAME.SHORTS,
    route: OPTIONS_DOCUMENT_PATH.SHORTS,
    status: FEATURE_STATUS.STABLE,
    surfaces: [FEATURE_SURFACE.SHORTS],
  },
  {
    id: EXTENSION_FEATURE_ID.PLAYLIST_RUNTIME,
    name: "Playlist Runtime",
    description:
      "See total and average runtime stats injected at the top of playlists.",
    icon: EXTENSION_ICON_NAME.PLAYLIST,
    route: OPTIONS_DOCUMENT_PATH.PLAYLIST,
    status: FEATURE_STATUS.STABLE,
    surfaces: [FEATURE_SURFACE.PLAYLIST],
  },
];

export interface ExtensionWhatsNewEntry {
  version: string;
  date: string;
  items: string[];
}

export const EXTENSION_WHATS_NEW: ExtensionWhatsNewEntry[] = [
  {
    version: EXTENSION_WHATS_NEW_VERSION.NEXT,
    date: EXTENSION_WHATS_NEW_DATE.MAY_2026,
    items: [
      EXTENSION_WHATS_NEW_ITEM.AUDIO_MODE,
      EXTENSION_WHATS_NEW_ITEM.VISUALIZER_SENSITIVITY,
      EXTENSION_WHATS_NEW_ITEM.THEMES,
      EXTENSION_WHATS_NEW_ITEM.OPTIONS_REDESIGN,
    ],
  },
];
