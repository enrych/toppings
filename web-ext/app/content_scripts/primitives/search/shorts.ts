/**
 * Search scope — Shorts shelf visibility in search results.
 */

import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

const STRATEGIES = [
  "ytd-search ytd-reel-shelf-renderer",
  "ytd-search ytd-shelf-renderer:has(ytd-reel-item-renderer)",
  "#contents.ytd-section-list-renderer ytd-reel-shelf-renderer",
] as const;

export async function setSearchShortsVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("search.shorts", "search", resolution);
  if (!resolution.resolved) return;
  (resolution.element as HTMLElement).style.display = visible ? "" : "none";
}

export function resetSearchShorts(): void {
  const selector = STRATEGIES.join(", ");
  const el = document.querySelector(selector) as HTMLElement | null;
  if (el) el.style.display = "";
}
