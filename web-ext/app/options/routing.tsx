import React, { type ComponentType } from "react";
import { OPTIONS_PAGES } from "./data";
import SectionNav from "../../components/layout/SectionNav";

type SectionNavSegment = "watch" | "keybindings";

const SECTION_NAV: Record<
  SectionNavSegment,
  readonly { id: string; label: string }[]
> = {
  watch: [
    { id: "playback-rate", label: "Playback Rate" },
    { id: "seek", label: "Seek" },
    { id: "loop", label: "Loop Segments" },
  ],
  keybindings: [
    { id: "watch", label: "Watch" },
    { id: "shorts", label: "Shorts" },
    { id: "profiles", label: "Profiles" },
    { id: "nudge", label: "Nudge" },
  ],
};

function sectionRail(segment: SectionNavSegment): ComponentType {
  const items = SECTION_NAV[segment];
  return function SectionRail() {
    return <SectionNav items={items} />;
  };
}

const SECTION_RAIL_BY_SEGMENT: Record<SectionNavSegment, ComponentType> = {
  watch: sectionRail("watch"),
  keybindings: sectionRail("keybindings"),
};

export const SECTION_RAILS = Object.fromEntries(
  OPTIONS_PAGES.filter((page) => page.sectionNav).map((page) => [
    page.path,
    SECTION_RAIL_BY_SEGMENT[page.segment as SectionNavSegment],
  ]),
) as Partial<Record<string, ComponentType>>;
