/**
 * Search scope — search result thumbnail visibility/blur primitive.
 *
 * Hiding thumbnails turns search results into a plain text list,
 * ideal for distraction-free / SFW profiles.
 */

import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";
import type { ThumbnailMode } from "../../../../data/profiles.data";

const STRATEGIES = [
  "ytd-search ytd-video-renderer ytd-thumbnail img#img",
  "ytd-search ytd-video-renderer a.ytd-thumbnail img",
  "#contents.ytd-section-list-renderer ytd-video-renderer ytd-thumbnail img",
] as const;

const BLUR_FILTER = "blur(12px)";

export async function setSearchThumbnailMode(mode: ThumbnailMode): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("search.thumbnails", "search", resolution);
  applySearchThumbnailMode(mode);
}

export function applySearchThumbnailMode(mode: ThumbnailMode): void {
  const selector = [
    "ytd-search ytd-video-renderer ytd-thumbnail img#img",
    "ytd-search ytd-video-renderer a.ytd-thumbnail img",
    "#contents.ytd-section-list-renderer ytd-video-renderer ytd-thumbnail img",
  ].join(", ");

  const images = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  for (const img of images) {
    img.style.filter = mode === "blur" ? BLUR_FILTER : "";
    img.style.visibility = mode === "hide" ? "hidden" : "";
  }
}

export function resetSearchThumbnails(): void {
  applySearchThumbnailMode("show");
}
