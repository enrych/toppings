import { findTarget, resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

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

export function resolveReelVideo(): Promise<PrimitiveResolution> {
  return resolveTarget(VIDEO_STRATEGIES);
}

export function resolveReelActionBar(): Promise<PrimitiveResolution> {
  return resolveTarget(ACTION_BAR_STRATEGIES);
}

// The button's label is localised; its container's id is not.
const NEXT_REEL_STRATEGIES = ["#navigation-button-down button"] as const;

const OPEN_PANEL_STRATEGIES = ["ytd-engagement-panel-section-list-renderer[visibility='ENGAGEMENT_PANEL_VISIBILITY_EXPANDED']"] as const;

export function nextReelButton(): HTMLButtonElement | null {
  return findTarget(NEXT_REEL_STRATEGIES) as HTMLButtonElement | null;
}

// Advancing would close an open comments, description or audio panel under
// the user.
export function isReelPanelOpen(): boolean {
  return findTarget(OPEN_PANEL_STRATEGIES) !== null;
}
