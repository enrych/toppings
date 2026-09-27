export type Change = { kind: "new" | "fix" | "polish"; text: string };

export const releases: readonly {
  version: string;
  date: string;
  title: string;
  changes: readonly Change[];
}[] = [
  {
    version: "next",
    date: "2026-05-23",
    title: "Segments",
    changes: [
      { kind: "new", text: "Segments: mark several ranges on a video and play them in sequence, each with its own loop count and playback rate." },
      { kind: "new", text: "Sequence editor for compound patterns, with duplicates allowed." },
      { kind: "new", text: "Three save tiers: last-used, a default slot, and named configs with their own shortcuts." },
      { kind: "new", text: "Z loads the last-used setup or turns segments off; Shift+Z starts a fresh slate." },
      { kind: "new", text: "Drag two adjacent markers together to merge segments." },
      { kind: "new", text: "A control panel under the video for segments, loop counts and rates." },
      { kind: "polish", text: "Audio mode is now the Audio preset. B and the headphones button in the player still turn it on and off, and any profile can cover the video with black, the visualizer or your own image while keeping the controls." },
      { kind: "new", text: "Every profile can have its own shortcut; pressing it again goes back to the profile you had before." },
      { kind: "polish", text: "Per-video audio-mode pins and the visualizer sensitivity setting are gone." },
    ],
  },
  {
    version: "3.0.3",
    date: "2026-05-15",
    title: "Audio mode, new UI, on-site docs",
    changes: [
      { kind: "new", text: "Audio mode on the watch page, with black, visualizer or custom backgrounds." },
      { kind: "new", text: "Custom audio-mode backgrounds can be uploaded from your computer." },
      { kind: "new", text: "Per-video audio-mode pins persist across visits." },
      { kind: "new", text: "Theme picker for the extension UI: system, dark, light." },
      { kind: "new", text: "Docs moved from the GitHub wiki to this site." },
      { kind: "polish", text: "Visualizer reworked into a waveform with a sensitivity control." },
      { kind: "polish", text: "Popup and options page redesigned." },
      { kind: "fix", text: "Audio no longer drops when switching from the visualizer to a black or custom screen." },
      { kind: "fix", text: "Audio mode persists when navigating between videos." },
    ],
  },
];
