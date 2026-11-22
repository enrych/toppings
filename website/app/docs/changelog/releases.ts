export type Change = { kind: "new" | "fix" | "polish"; text: string };

export const releases: readonly {
  version: string;
  date: string;
  title: string;
  changes: readonly Change[];
}[] = [
  {
    version: "4.0.0",
    date: "2026-11-22",
    title: "Segments, profiles and schedules",
    changes: [
      { kind: "new", text: "Segments: mark several ranges on a video, each with its own loop count and playback rate. After its last pass a segment hands over to the next, and the video plays on after the final one." },
      { kind: "new", text: "A control panel under the video for segments, and markers on the progress bar you can drag. Hold two neighbouring markers together to merge them." },
      { kind: "new", text: "Z loads the last-used segments or turns them off; Shift+Z starts a fresh slate. Setups can be saved per video under a name and loaded again." },
      { kind: "new", text: "Profiles: Audio and Focus are built in, and you can make your own from the sidebar, comments, end cards, Shorts shelves, thumbnails and the video screen." },
      { kind: "new", text: "Every profile can have its own shortcut; pressing it again goes back to the profile you had before. The player's gear menu can show a Profile row too." },
      { kind: "new", text: "Schedules turn a profile on by time of day or while you're at a saved place, with a toolbar badge and a heads-up before each change." },
      { kind: "new", text: "Your own playback rates replace the chips in the player's speed panel, and a seek shows how far it jumped." },
      { kind: "new", text: "Playlist runtime also appears beside the queue while you watch a playlist." },
      { kind: "new", text: "Auto-scroll and speed buttons in the Shorts action column." },
      { kind: "polish", text: "Audio mode is now the Audio preset. B and the headphones button in the player still turn it on and off, and any profile can cover the video with black, the visualizer or your own image while keeping the controls." },
      { kind: "polish", text: "An update reaches YouTube tabs you already have open, without a reload." },
      { kind: "polish", text: "Rate and seek shortcuts leave ads alone." },
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
