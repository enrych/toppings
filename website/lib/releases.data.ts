export const RELEASE_VERSION = {
  WIP: "next",
} as const;

export const RELEASE_ITEM_KIND = {
  FEAT: "feat",
  FIX: "fix",
  POLISH: "polish",
  INTERNAL: "internal",
} as const;

export type ReleaseItemKind =
  (typeof RELEASE_ITEM_KIND)[keyof typeof RELEASE_ITEM_KIND];

export interface ReleaseItem {
  kind: ReleaseItemKind;
  text: string;
}

export interface ReleaseEntry {
  version: string;
  date: string;
  title?: string;
  items: ReleaseItem[];
}

/** Stub text inserted on release when no WIP entry exists. */
export const RELEASE_STUB = {
  TITLE: "TODO: one-line tagline",
  ITEM_TEXT: "TODO: add release notes for {{version}}",
} as const;

export const RELEASE_TODO_PREFIX = "TODO";

export const RELEASES: ReleaseEntry[] = [
  {
    version: "next",
    date: "2026-05-23",
    title: "Segments — multi-segment playback sequencer",
    items: [
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Segments: define multiple time-range markers on any video and play them in sequence — each with its own loop count, playback rate, and per-iteration rate overrides",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Advanced Sequence editor: compose compound steps with any custom segment order (duplicates allowed), enabling complex remix patterns like [seg3, seg3, seg1] × 2",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Three save tiers: last-used (auto, volatile), default slot (one-click save), and unlimited named configs each assignable a keyboard shortcut",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Z = load last-used / toggle off; Shift+Z = fresh slate (full video, infinite loop); named config shortcuts for instant switching",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Segment merge: drag adjacent markers together for 500 ms to merge two segments into one with a pulse animation",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Below-video control panel with segment list, loop counts, playback rates, and collapsible Advanced Sequence editor",
      },
      {
        kind: RELEASE_ITEM_KIND.INTERNAL,
        text: "Migrates existing saved loop segments transparently to the new per-video VideoSegmentData IndexedDB store (DB_VERSION 4)",
      },
    ],
  },
  {
    version: "3.0.3",
    date: "2026-05-15",
    title: "Audio Mode, full UI revamp, on-site docs",
    items: [
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Audio Mode for the watch page — listen without the visual, with black / visualizer / custom backgrounds",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Custom audio-mode background images can be uploaded from your computer",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Per-video audio-mode pins persist across visits",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "Theme picker for the extension UI (System / Dark / Light)",
      },
      {
        kind: RELEASE_ITEM_KIND.POLISH,
        text: "Visualizer reworked into an AM-style waveform with sensitivity control",
      },
      {
        kind: RELEASE_ITEM_KIND.POLISH,
        text: "Popup redesigned: live status row, feature toggles, brand-aligned look",
      },
      {
        kind: RELEASE_ITEM_KIND.POLISH,
        text: "Options page redesigned with a real component library and confirm dialogs",
      },
      {
        kind: RELEASE_ITEM_KIND.POLISH,
        text: "Marketing site implements the Claude Design handoff end to end",
      },
      {
        kind: RELEASE_ITEM_KIND.FEAT,
        text: "On-site documentation replaces the GitHub wiki: install guide, keybindings reference, FAQ",
      },
      {
        kind: RELEASE_ITEM_KIND.FIX,
        text: "Audio kept dropping when switching from visualizer to a black or custom screen",
      },
      {
        kind: RELEASE_ITEM_KIND.FIX,
        text: "Audio mode now persists across SPA navigation between videos",
      },
    ],
  },
];
