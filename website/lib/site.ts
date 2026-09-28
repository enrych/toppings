export const site = {
  name: "Toppings",
  tagline: "Your YouTube, your way.",
  description:
    "A free, open-source browser extension for YouTube. Profiles, loop segments, custom playback speeds, one-key seeking. No accounts, no trackers.",
  version: "3.0.3",
  license: "GPL-3.0",
  url: "https://toppings.enry.ch",
  github: "https://github.com/enrych/toppings",
  issues: "https://github.com/enrych/toppings/issues",
  commits: "https://github.com/enrych/toppings/commits/main",
  chrome:
    "https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl",
  firefox: "https://addons.mozilla.org/en-US/firefox/addon/toppings/",
  support: "https://darhkvoyd.me/sponsor",
  feedback:
    "mailto:divyadityasnaruka@gmail.com?subject=Feedback%20for%20Toppings",
} as const;

export const features = [
  {
    name: "Profiles",
    blurb:
      "Presets that reshape YouTube in one switch. Audio covers the video with a waveform and keeps the controls; Focus hides the sidebar, comments and end cards. Make your own.",
  },
  {
    name: "Loop segments",
    blurb:
      "Mark in and out points and loop the section, or sequence several segments.",
  },
  {
    name: "Custom playback rates",
    blurb: "Speeds YouTube doesn't offer, from 0.0625× to 16×, right in the player's speed panel.",
  },
  {
    name: "Toggle playback rate",
    blurb: "One key flips between 1× and your preferred fast rate.",
  },
  {
    name: "Seek shortcuts",
    blurb: "Jump back and forward by a duration you choose.",
  },
  {
    name: "Shorts auto-scroll",
    blurb: "Advance to the next Short when one ends.",
  },
  {
    name: "Playlist runtime",
    blurb: "Total and average runtime shown at the top of every playlist.",
  },
] as const;

export type Shortcut = {
  keys: readonly string[];
  name: string;
  blurb: string;
};

export const shortcuts: readonly { group: string; rows: readonly Shortcut[] }[] =
  [
    {
      group: "Watch page",
      rows: [
        { keys: ["Z"], name: "Segments", blurb: "Load the last-used segments, or turn them off" },
        { keys: ["Shift", "Z"], name: "Fresh slate", blurb: "One segment spanning the whole video, looping" },
        { keys: ["Q"], name: "Segment in", blurb: "Pin the active segment's start to now" },
        { keys: ["E"], name: "Segment out", blurb: "Pin the active segment's end to now" },
        { keys: ["Shift", "Q"], name: "Nudge start back", blurb: "1 → 2 → 4 → 8 → 16 s on repeat" },
        { keys: ["Shift", "E"], name: "Nudge end forward", blurb: "1 → 2 → 4 → 8 → 16 s on repeat" },
        { keys: ["X"], name: "Toggle speed", blurb: "Snap between 1× and your fast rate" },
        { keys: ["W"], name: "Speed up", blurb: "+0.25×" },
        { keys: ["S"], name: "Speed down", blurb: "−0.25×" },
        { keys: ["A"], name: "Seek back", blurb: "15 s by default" },
        { keys: ["D"], name: "Seek forward", blurb: "15 s by default" },
      ],
    },
    {
      group: "Shorts",
      rows: [
        { keys: ["X"], name: "Toggle speed", blurb: "Snap between 1× and your fast rate" },
        { keys: ["A"], name: "Seek back", blurb: "5 s by default" },
        { keys: ["D"], name: "Seek forward", blurb: "5 s by default" },
      ],
    },
  ];

export const dockKeys = shortcuts[0].rows.filter((row) => row.keys.length === 1);
