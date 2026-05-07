export interface DocsKeybindingRow {
  name: string;
  desc: string;
  combo: readonly string[];
  single?: boolean;
}

export interface DocsKeybindingGroup {
  title: string;
  rows: readonly DocsKeybindingRow[];
}

/** Default keys — keep in sync with web-ext/data/store.data.ts */
export const KEYBINDING_GROUPS: readonly DocsKeybindingGroup[] = [
  {
    title: "Watch page",
    rows: [
      { name: "Toggle Audio mode", desc: "Replace the video stream with audio-only", combo: ["B"], single: true },
      { name: "Toggle Segments (last used)", desc: "Load the last-used segment config and enable it; if already active, disables segments", combo: ["Z"], single: true },
      { name: "Fresh Slate Segments", desc: "Start a brand-new segment config: one segment spanning the full video, infinite loop", combo: ["Shift", "Z"] },
      { name: "Set active segment in", desc: "Pin the start of the active segment (the one containing the playhead) to the current time", combo: ["Q"], single: true },
      { name: "Set active segment out", desc: "Pin the end of the active segment to the current time", combo: ["E"], single: true },
      { name: "Nudge segment start back", desc: "Move the active segment's start marker back with acceleration (1→2→4→8→16 s)", combo: ["Shift", "Q"] },
      { name: "Nudge segment end forward", desc: "Move the active segment's end marker forward with acceleration (1→2→4→8→16 s)", combo: ["Shift", "E"] },
      { name: "Toggle playback speed", desc: "Snap between 1× and your favorite fast rate", combo: ["X"], single: true },
      { name: "Speed up", desc: "Increase playback rate by 0.25×", combo: ["W"], single: true },
      { name: "Speed down", desc: "Reduce playback rate by 0.25×", combo: ["S"], single: true },
    ],
  },
  {
    title: "Seek",
    rows: [
      { name: "Seek back", desc: "Custom duration (default 15s)", combo: ["A"], single: true },
      { name: "Seek forward", desc: "Custom duration (default 15s)", combo: ["D"], single: true },
    ],
  },
  {
    title: "Shorts",
    rows: [
      { name: "Toggle playback speed", desc: "Snap between 1× and your favorite fast rate", combo: ["X"], single: true },
      { name: "Seek back", desc: "Custom duration (default 5s)", combo: ["A"], single: true },
      { name: "Seek forward", desc: "Custom duration (default 5s)", combo: ["D"], single: true },
    ],
  },
];
