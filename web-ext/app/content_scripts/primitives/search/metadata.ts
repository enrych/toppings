/**
 * Search scope — video metadata (view count, date) visibility primitive.
 *
 * Hides metadata lines below the title in search results.
 */

import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

const STRATEGIES = [
  "ytd-search ytd-video-renderer #metadata-line",
  "ytd-search ytd-video-renderer .ytd-video-meta-block",
  "#contents.ytd-section-list-renderer ytd-video-renderer #metadata-line",
] as const;

export async function setSearchMetadataVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("search.metadata", "search", resolution);

  applySearchMetadataVisible(visible);
}

export function applySearchMetadataVisible(visible: boolean): void {
  const selector = [
    "ytd-search ytd-video-renderer #metadata-line",
    "ytd-search ytd-video-renderer .ytd-video-meta-block",
    "#contents.ytd-section-list-renderer ytd-video-renderer #metadata-line",
  ].join(", ");

  const els = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  for (const el of els) {
    el.style.display = visible ? "" : "none";
  }
}

export function resetSearchMetadata(): void {
  applySearchMetadataVisible(true);
}
