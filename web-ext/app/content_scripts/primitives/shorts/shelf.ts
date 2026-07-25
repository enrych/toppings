import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../core/capabilityCache";

// Deliberately broad: the same shelf renders under different tags on home and
// on search results.
const STRATEGIES = [
  "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])",
  "ytd-reel-shelf-renderer",
  "ytd-rich-shelf-renderer[is-shorts]",
  "#shorts-container",
  "ytd-shelf-renderer:has(ytd-reel-item-renderer)",
] as const;

export async function setShortsShelfVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("shorts.shelf", "shorts", resolution);

  // Every match, not just the first: a feed can render several shelves.
  applyShortsShelfVisible(visible);
}

export function applyShortsShelfVisible(visible: boolean): void {
  const selector = STRATEGIES.join(", ");
  const els = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  for (const el of els) {
    el.style.display = visible ? "" : "none";
  }
}

export function resetShortsShelf(): void {
  applyShortsShelfVisible(true);
}
