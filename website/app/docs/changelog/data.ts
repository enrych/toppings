export type ReleaseKind = "feat" | "fix" | "polish" | "internal";

export const PAGE = {
  EYEBROW: "What changed, and when",
  TITLE_BEFORE: "The ",
  TITLE_HIGHLIGHT: "changelog",
  TITLE_AFTER: ".",
  CRUMB_GROUP: "Reference",
  CRUMB_CURRENT: "Changelog",
  LEDE_BEFORE:
    "Every Toppings release in user-facing terms. The currently published version is ",
  LEDE_LINK_LABEL: "GitHub history",
} as const;

export type ReleaseItem = {
  KIND: ReleaseKind;
  TEXT: string;
};

export type Release = {
  VERSION: string;
  DATE: string;
  TITLE?: string;
  ITEMS: ReleaseItem[];
};

export const KIND_TONE: Record<
  ReleaseKind,
  { LABEL: string; BG: string; FG: string }
> = {
  feat: { LABEL: "New", BG: "rgba(252,169,41,0.12)", FG: "var(--ink)" },
  fix: { LABEL: "Fix", BG: "rgba(10,10,10,0.06)", FG: "var(--fg-2)" },
  polish: { LABEL: "Polish", BG: "rgba(10,10,10,0.06)", FG: "var(--fg-2)" },
  internal: {
    LABEL: "Internal",
    BG: "rgba(10,10,10,0.04)",
    FG: "var(--fg-3)",
  },
};

export const RELEASES: Release[] = [
  {
    VERSION: "next",
    DATE: "2026-05-23",
    TITLE: "Segments — multi-segment playback sequencer",
    ITEMS: [
      {
        KIND: "feat",
        TEXT: "Segments: define multiple time-range markers on any video and play them in sequence — each with its own loop count, playback rate, and per-iteration rate overrides",
      },
      {
        KIND: "feat",
        TEXT: "Advanced Sequence editor: compose compound steps with any custom segment order (duplicates allowed), enabling complex remix patterns like [seg3, seg3, seg1] × 2",
      },
      {
        KIND: "feat",
        TEXT: "Three save tiers: last-used (auto, volatile), default slot (one-click save), and unlimited named configs each assignable a keyboard shortcut",
      },
      {
        KIND: "feat",
        TEXT: "Z = load last-used / toggle off; Shift+Z = fresh slate (full video, infinite loop); named config shortcuts for instant switching",
      },
      {
        KIND: "feat",
        TEXT: "Segment merge: drag adjacent markers together for 500 ms to merge two segments into one with a pulse animation",
      },
      {
        KIND: "feat",
        TEXT: "Below-video control panel with segment list, loop counts, playback rates, and collapsible Advanced Sequence editor",
      },
      {
        KIND: "internal",
        TEXT: "Migrates existing saved loop segments transparently to the new per-video VideoSegmentData IndexedDB store (DB_VERSION 4)",
      },
    ],
  },
  {
    VERSION: "3.0.3",
    DATE: "2026-05-15",
    TITLE: "Audio Mode, full UI revamp, on-site docs",
    ITEMS: [
      {
        KIND: "feat",
        TEXT: "Audio Mode for the watch page — listen without the visual, with black / visualizer / custom backgrounds",
      },
      {
        KIND: "feat",
        TEXT: "Custom audio-mode background images can be uploaded from your computer",
      },
      {
        KIND: "feat",
        TEXT: "Per-video audio-mode pins persist across visits",
      },
      {
        KIND: "feat",
        TEXT: "Theme picker for the extension UI (System / Dark / Light)",
      },
      {
        KIND: "polish",
        TEXT: "Visualizer reworked into an AM-style waveform with sensitivity control",
      },
      {
        KIND: "polish",
        TEXT: "Popup redesigned: live status row, feature toggles, brand-aligned look",
      },
      {
        KIND: "polish",
        TEXT: "Options page redesigned with a real component library and confirm dialogs",
      },
      {
        KIND: "polish",
        TEXT: "Marketing site implements the Claude Design handoff end to end",
      },
      {
        KIND: "feat",
        TEXT: "On-site documentation replaces the GitHub wiki: install guide, keybindings reference, FAQ",
      },
      {
        KIND: "fix",
        TEXT: "Audio kept dropping when switching from visualizer to a black or custom screen",
      },
      {
        KIND: "fix",
        TEXT: "Audio mode now persists across SPA navigation between videos",
      },
    ],
  },
];
