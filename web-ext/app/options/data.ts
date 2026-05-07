import { EXTENSION_CONTEXT_SCOPE } from "@toppings/constants";

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
    segment: EXTENSION_CONTEXT_SCOPE.WATCH,
    path: "/watch",
    label: "Watch",
    icon: "watch",
    sectionNav: true,
  },
  {
    segment: EXTENSION_CONTEXT_SCOPE.SHORTS,
    path: "/shorts",
    label: "Shorts",
    icon: "shorts",
  },
  {
    segment: EXTENSION_CONTEXT_SCOPE.PLAYLIST,
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
  {
    segment: "profiles",
    path: "/profiles",
    label: "Profiles",
    icon: "profiles",
  },
] as const satisfies readonly ExtensionOptionsPage[];
