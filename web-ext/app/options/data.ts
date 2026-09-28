import type { IconName } from "@/ui/primitives/Icon";
import type { SectionNavItem } from "@/ui/layout/SectionNav";

export const OPTIONS_HTML = "options/index.html";
export const OPTIONS_ICON_SRC = "/assets/icons/icon48.png";

export interface OptionsPage {
  // The hash segment; "" is the landing page.
  segment: string;
  label: string;
  icon: IconName;
  sections?: readonly SectionNavItem[];
}

export const OPTIONS_PAGES: readonly OptionsPage[] = [
  { segment: "", label: "General", icon: "general" },
  {
    segment: "watch",
    label: "Watch",
    icon: "watch",
    sections: [
      { id: "playback-rate", label: "Playback rate" },
      { id: "seek", label: "Seek" },
      { id: "segments", label: "Segments" },
      { id: "feature-availability", label: "Availability" },
    ],
  },
  { segment: "shorts", label: "Shorts", icon: "shorts" },
  { segment: "playlist", label: "Playlist", icon: "playlist" },
  { segment: "profiles", label: "Profiles", icon: "profiles" },
  {
    segment: "shortcuts",
    label: "Shortcuts",
    icon: "keyboard",
    sections: [
      { id: "playback", label: "Playback" },
      { id: "segments", label: "Segments" },
      { id: "shorts", label: "Shorts" },
      { id: "profiles", label: "Profiles" },
    ],
  },
];
