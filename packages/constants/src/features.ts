export type Feature = {
  readonly name: string;
  readonly description: string;
  readonly isNew?: boolean;
};

export const FEATURES: readonly Feature[] = [
  {
    name: "Audio Mode",
    description:
      "Hide the video and listen to audio only — perfect for office or background play.",
    isNew: true,
  },
  {
    name: "Custom Playback Rates",
    description:
      "Add granular speeds beyond YouTube's defaults — anywhere from 0.0625× to 16×.",
  },
  {
    name: "Toggle Playback Rate",
    description:
      "Press one key to flip between normal speed and your preferred fast rate.",
  },
  {
    name: "Loop Segments",
    description:
      "Mark a start and end point in any video to loop a section continuously.",
  },
  {
    name: "Seek Shortcuts",
    description:
      "Jump forward and backward with configurable durations via keyboard shortcuts.",
  },
  {
    name: "Shorts Auto-Scroll",
    description: "Automatically advance to the next Short when one ends.",
  },
  {
    name: "Playlist Runtime",
    description:
      "See total and average runtime stats injected at the top of playlists.",
  },
];
