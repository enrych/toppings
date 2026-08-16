import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../core/capabilityCache";
import type { ThumbnailMode } from "../../../../data/profiles";

const STRATEGIES = [
  "ytd-rich-grid-renderer ytd-rich-item-renderer img#img",
  "ytd-rich-grid-renderer ytd-thumbnail img",
  "#contents ytd-rich-item-renderer yt-image img",
] as const;

const BLUR_FILTER = "blur(12px)";

let lastMode: ThumbnailMode = "show";

export async function setHomeThumbnailMode(mode: ThumbnailMode): Promise<void> {
  lastMode = mode;

  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("home.thumbnails", "home", resolution);

  applyHomeThumbnailMode(mode);
}

// Synchronous by design: the feed re-renders constantly, so this is called
// repeatedly and cannot afford to await a resolveTarget on each pass.
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
