import { resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

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

export function nextReelButton(): HTMLButtonElement | null {
  return document.querySelector("[aria-label='Next video']");
}

// Advancing while the comments panel is open would close it under the user.
export function isCommentsPanelOpen(): boolean {
  return (
    document.querySelector("ytd-engagement-panel-section-list-renderer")?.getAttribute("visibility") ===
    "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"
  );
}
