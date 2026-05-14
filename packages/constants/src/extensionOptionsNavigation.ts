import { PATHNAME } from "./extensionProtocol";
import { CHROME_STORAGE_LOCAL_KEY } from "./extensionStorage";

export { CHROME_STORAGE_LOCAL_KEY };

export const OPTIONS_ROUTE_ONLY_SEGMENT = {
  AUDIO_MODE: "audio-mode",
  KEYBINDINGS: "keybindings",
} as const;

export const OPTIONS_ROUTE_CHILD_PATH = {
  EMPTY: "",
  WATCH: PATHNAME.WATCH,
  AUDIO_MODE: OPTIONS_ROUTE_ONLY_SEGMENT.AUDIO_MODE,
  SHORTS: PATHNAME.SHORTS,
  PLAYLIST: PATHNAME.PLAYLIST,
  KEYBINDINGS: OPTIONS_ROUTE_ONLY_SEGMENT.KEYBINDINGS,
} as const;

/** Full document paths inside the options memory router. */
export const OPTIONS_DOCUMENT_PATH = {
  HOME: "/",
  WATCH: `/${PATHNAME.WATCH}`,
  AUDIO_MODE: `/${OPTIONS_ROUTE_ONLY_SEGMENT.AUDIO_MODE}`,
  SHORTS: `/${PATHNAME.SHORTS}`,
  PLAYLIST: `/${PATHNAME.PLAYLIST}`,
  KEYBINDINGS: `/${OPTIONS_ROUTE_ONLY_SEGMENT.KEYBINDINGS}`,
} as const;

/** Memory router root path (parent route). */
export const OPTIONS_MEMORY_ROUTER_ROOT_PATH = "/";

export const OPTIONS_RAIL_PATH = {
  WATCH: OPTIONS_DOCUMENT_PATH.WATCH,
  AUDIO_MODE: OPTIONS_DOCUMENT_PATH.AUDIO_MODE,
  KEYBINDINGS: OPTIONS_DOCUMENT_PATH.KEYBINDINGS,
} as const;

export const OPTIONS_SIDEBAR_ICON_NAME = {
  GENERAL: "general",
  WATCH: "watch",
  AUDIO: "audio",
  SHORTS: "shorts",
  PLAYLIST: "playlist",
  KEYBOARD: "keyboard",
} as const;

export const OPTIONS_SIDEBAR_NAV_LABEL = {
  GENERAL: "General",
  WATCH: "Watch",
  AUDIO_MODE: "Audio Mode",
  SHORTS: "Shorts",
  PLAYLIST: "Playlist",
  KEYBINDINGS: "Shortcuts",
} as const;

export const OPTIONS_SIDEBAR_NAV_ITEM = [
  {
    documentPath: OPTIONS_DOCUMENT_PATH.HOME,
    label: OPTIONS_SIDEBAR_NAV_LABEL.GENERAL,
    icon: OPTIONS_SIDEBAR_ICON_NAME.GENERAL,
  },
  {
    documentPath: OPTIONS_DOCUMENT_PATH.WATCH,
    label: OPTIONS_SIDEBAR_NAV_LABEL.WATCH,
    icon: OPTIONS_SIDEBAR_ICON_NAME.WATCH,
  },
  {
    documentPath: OPTIONS_DOCUMENT_PATH.AUDIO_MODE,
    label: OPTIONS_SIDEBAR_NAV_LABEL.AUDIO_MODE,
    icon: OPTIONS_SIDEBAR_ICON_NAME.AUDIO,
  },
  {
    documentPath: OPTIONS_DOCUMENT_PATH.SHORTS,
    label: OPTIONS_SIDEBAR_NAV_LABEL.SHORTS,
    icon: OPTIONS_SIDEBAR_ICON_NAME.SHORTS,
  },
  {
    documentPath: OPTIONS_DOCUMENT_PATH.PLAYLIST,
    label: OPTIONS_SIDEBAR_NAV_LABEL.PLAYLIST,
    icon: OPTIONS_SIDEBAR_ICON_NAME.PLAYLIST,
  },
  {
    documentPath: OPTIONS_DOCUMENT_PATH.KEYBINDINGS,
    label: OPTIONS_SIDEBAR_NAV_LABEL.KEYBINDINGS,
    icon: OPTIONS_SIDEBAR_ICON_NAME.KEYBOARD,
  },
] as const;

export const OPTIONS_SIDEBAR_UI = {
  SETTINGS_SECTION_LABEL: "Settings",
  BRAND_NAME: "Toppings",
  TAGLINE: "Your YouTube, Your Way.",
  TOOLTIP_EXPAND: "Expand sidebar",
  TOOLTIP_COLLAPSE: "Collapse sidebar",
  TOOLTIP_GITHUB: "GitHub",
  ARIA_EXPAND: "Expand sidebar",
  ARIA_COLLAPSE: "Collapse sidebar",
  ARIA_GITHUB_REPO: "GitHub repository",
  ALT_LOGO: "Toppings logo",
  ALT_LOGO_COLLAPSED: "Toppings",
  FOOTER_GITHUB_LABEL: "GitHub",
} as const;
