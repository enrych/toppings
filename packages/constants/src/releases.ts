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

export const RELEASES: ReleaseEntry[] = [
  {
    version: "3.0.3",
    date: "2026-05-15",
    title: "Audio Mode, full UI revamp, on-site docs",
    items: [
      { kind: RELEASE_ITEM_KIND.FEAT, text: "Audio Mode for the watch page — listen without the visual, with black / visualizer / custom backgrounds" },
      { kind: RELEASE_ITEM_KIND.FEAT, text: "Custom audio-mode background images can be uploaded from your computer" },
      { kind: RELEASE_ITEM_KIND.FEAT, text: "Per-video audio-mode pins persist across visits" },
      { kind: RELEASE_ITEM_KIND.FEAT, text: "Theme picker for the extension UI (System / Dark / Light)" },
      { kind: RELEASE_ITEM_KIND.POLISH, text: "Visualizer reworked into an AM-style waveform with sensitivity control" },
      { kind: RELEASE_ITEM_KIND.POLISH, text: "Popup redesigned: live status row, feature toggles, brand-aligned look" },
      { kind: RELEASE_ITEM_KIND.POLISH, text: "Options page redesigned with a real component library and confirm dialogs" },
      { kind: RELEASE_ITEM_KIND.POLISH, text: "Marketing site implements the Claude Design handoff end to end" },
      { kind: RELEASE_ITEM_KIND.FEAT, text: "On-site documentation replaces the GitHub wiki: install guide, keybindings reference, FAQ" },
      { kind: RELEASE_ITEM_KIND.FIX, text: "Audio kept dropping when switching from visualizer to a black or custom screen" },
      { kind: RELEASE_ITEM_KIND.FIX, text: "Audio mode now persists across SPA navigation between videos" },
    ],
  },
];
