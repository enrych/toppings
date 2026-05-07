/**
 * Shorts scope — Shorts shelf visibility primitive.
 *
 * Hides the Shorts shelf from both the home page and search results.
 * Uses a broad strategy list since the Shorts shelf appears in multiple
 * YouTube page contexts.
 */

import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

/** Selectors that match the Shorts shelf in home + search. */
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

  // Apply to all matching elements (shelf can appear multiple times on page).
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
