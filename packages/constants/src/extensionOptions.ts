export const OPTIONS_HTML = "options/index.html";

export const OPTIONS_ICON_SRC = "/assets/icons/icon48.png";

export type ExtensionOptionsPage = {
  readonly segment: string;
  readonly path: string;
  readonly label: string;
  readonly icon: string;
  readonly sectionNav?: true;
};

export const OPTIONS_PAGES = [
  { segment: "", path: "/", label: "General", icon: "general" },
  {
    segment: "watch",
    path: "/watch",
    label: "Watch",
    icon: "watch",
    sectionNav: true,
  },
  {
    segment: "audio-mode",
    path: "/audio-mode",
    label: "Audio Mode",
    icon: "audio",
    sectionNav: true,
  },
  { segment: "shorts", path: "/shorts", label: "Shorts", icon: "shorts" },
  {
    segment: "playlist",
    path: "/playlist",
    label: "Playlist",
    icon: "playlist",
  },
  {
    segment: "keybindings",
    path: "/keybindings",
    label: "Shortcuts",
    icon: "keyboard",
    sectionNav: true,
  },
] as const satisfies readonly ExtensionOptionsPage[];
