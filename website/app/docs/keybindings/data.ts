export const PAGE = {
  EYEBROW: "Reference",
  TITLE_BEFORE: "Every key, ",
  TITLE_HIGHLIGHT: "yours",
  TITLE_AFTER: " to remap.",
  CRUMB_GROUP: "Reference",
  CRUMB_CURRENT: "Keybindings",
} as const;

export type KeybindingRow = {
  NAME: string;
  DESC: string;
  COMBO: readonly string[];
  SINGLE?: true;
};

export type KeybindingGroup = {
  TITLE: string;
  ROWS: readonly KeybindingRow[];
};

/** Default keys — keep in sync with web-ext/data/store.ts */
export const GROUPS: readonly KeybindingGroup[] = [
  {
    TITLE: "Watch page",
    ROWS: [
      { NAME: "Toggle Audio mode", DESC: "Replace the video stream with audio-only", COMBO: ["B"], SINGLE: true },
      { NAME: "Toggle Segments (last used)", DESC: "Load the last-used segment config and enable it; if already active, disables segments", COMBO: ["Z"], SINGLE: true },
      { NAME: "Fresh Slate Segments", DESC: "Start a brand-new segment config: one segment spanning the full video, infinite loop", COMBO: ["Shift", "Z"] },
      { NAME: "Set active segment in", DESC: "Pin the start of the active segment (the one containing the playhead) to the current time", COMBO: ["Q"], SINGLE: true },
      { NAME: "Set active segment out", DESC: "Pin the end of the active segment to the current time", COMBO: ["E"], SINGLE: true },
      { NAME: "Nudge segment start back", DESC: "Move the active segment's start marker back with acceleration (1→2→4→8→16 s)", COMBO: ["Shift", "Q"] },
      { NAME: "Nudge segment end forward", DESC: "Move the active segment's end marker forward with acceleration (1→2→4→8→16 s)", COMBO: ["Shift", "E"] },
      { NAME: "Toggle playback speed", DESC: "Snap between 1× and your favorite fast rate", COMBO: ["X"], SINGLE: true },
      { NAME: "Speed up", DESC: "Increase playback rate by 0.25×", COMBO: ["W"], SINGLE: true },
      { NAME: "Speed down", DESC: "Reduce playback rate by 0.25×", COMBO: ["S"], SINGLE: true },
    ],
  },
  {
    TITLE: "Seek",
    ROWS: [
      { NAME: "Seek back", DESC: "Custom duration (default 15s)", COMBO: ["A"], SINGLE: true },
      { NAME: "Seek forward", DESC: "Custom duration (default 15s)", COMBO: ["D"], SINGLE: true },
    ],
  },
  {
    TITLE: "Shorts",
    ROWS: [
      { NAME: "Toggle playback speed", DESC: "Snap between 1× and your favorite fast rate", COMBO: ["X"], SINGLE: true },
      { NAME: "Seek back", DESC: "Custom duration (default 5s)", COMBO: ["A"], SINGLE: true },
      { NAME: "Seek forward", DESC: "Custom duration (default 5s)", COMBO: ["D"], SINGLE: true },
    ],
  },
];
