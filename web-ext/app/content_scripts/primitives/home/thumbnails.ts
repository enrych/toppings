/**
 * Home scope — feed thumbnail visibility/blur primitive.
 *
 * Strategy arrays cover the main thumbnail image elements inside the home
 * feed, ordered by the most common YouTube DOM variant first.
 */

import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";
import type { ThumbnailMode } from "../../../../data/profiles.data";

const STRATEGIES = [
  "ytd-rich-grid-renderer ytd-rich-item-renderer img#img",
  "ytd-rich-grid-renderer ytd-thumbnail img",
  "#contents ytd-rich-item-renderer yt-image img",
] as const;

/** CSS filter applied for blur mode. */
const BLUR_FILTER = "blur(12px)";

let lastMode: ThumbnailMode = "show";

export async function setHomeThumbnailMode(mode: ThumbnailMode): Promise<void> {
  lastMode = mode;

  // Capability probe — just resolve the container once.
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("home.thumbnails", "home", resolution);

  applyHomeThumbnailMode(mode);
}

/**
 * Apply the thumbnail mode synchronously to all current thumbnails in the DOM.
 * Safe to call at any time — operates on the live DOM without async.
 */
export function applyHomeThumbnailMode(mode: ThumbnailMode): void {
  const selector = [
    "ytd-rich-grid-renderer ytd-rich-item-renderer img#img",
    "ytd-rich-grid-renderer ytd-thumbnail img",
    "#contents ytd-rich-item-renderer yt-image img",
  ].join(", ");

  const images = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  for (const img of images) {
    img.style.filter = mode === "blur" ? BLUR_FILTER : "";
    img.style.visibility = mode === "hide" ? "hidden" : "";
  }
}

export function resetHomeThumbnails(): void {
  lastMode = "show";
  applyHomeThumbnailMode("show");
}

export { lastMode as currentHomeThumbnailMode };
