import { findWithin, resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

// YouTube reuses one reel renderer for every Short in the newer layout and
// extracts the action bar next to it; the older layout marked the visible
// reel with is-active and kept #actions inside it.
const VIDEO_STRATEGIES = [
  "ytd-reel-video-renderer[is-active] video",
  "#shorts-player video",
  "ytd-reel-video-renderer video",
] as const;

const ACTION_BAR_STRATEGIES = [
  "reel-action-bar-view-model",
  "ytd-reel-video-renderer[is-active] #actions",
  "ytd-reel-video-renderer #actions",
] as const;

// The button's label is localised; its container's id is not.
const NEXT_REEL_STRATEGIES = ["#navigation-button-down button"] as const;

const OPEN_PANEL_STRATEGIES = ["ytd-engagement-panel-section-list-renderer[visibility='ENGAGEMENT_PANEL_VISIBILITY_EXPANDED']"] as const;

export function resolveReelVideo(): Promise<PrimitiveResolution> {
  return resolveTarget(VIDEO_STRATEGIES);
}

export function resolveReelActionBar(): Promise<PrimitiveResolution> {
  return resolveTarget(ACTION_BAR_STRATEGIES);
}

// A watch page left in the background keeps its own engagement panels, so
// reel controls are looked up in the Shorts page the playing reel is on.
function shortsPageOf(reel: Element): ParentNode {
  return reel.closest("ytd-shorts") ?? document;
}

export function nextReelButton(reel: Element): HTMLButtonElement | null {
  return findWithin(shortsPageOf(reel), NEXT_REEL_STRATEGIES).element as HTMLButtonElement | null;
}

// Advancing would close an open comments, description or audio panel under
// the user.
export function isReelPanelOpen(reel: Element): boolean {
  return findWithin(shortsPageOf(reel), OPEN_PANEL_STRATEGIES).resolved;
}
