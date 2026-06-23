import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

// ---------------------------------------------------------------------------
// Comments section primitive
//
// Controls the comments section below the video on the watch page.
// ---------------------------------------------------------------------------

const STRATEGIES = [
  "ytd-comments#comments",
  "#comments",
  "ytd-item-section-renderer #contents ytd-comments",
  "ytd-watch-flexy #comments",
] as const;

let hiddenByToppings = false;

/**
 * Hide or show the comments section.
 * Writes the resolution result to the capability cache.
 */
export async function setCommentsVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("watch.comments", "watch", resolution);

  if (!resolution.resolved) return;

  const comments = resolution.element as HTMLElement;
  if (visible) {
    if (hiddenByToppings) {
      comments.style.display = "";
      hiddenByToppings = false;
    }
  } else {
    comments.style.display = "none";
    hiddenByToppings = true;
  }
}

/** Restore comments to their original state (called on navigation / teardown). */
export function resetComments(): void {
  if (!hiddenByToppings) return;
  const el = STRATEGIES
    .map((s) => document.querySelector<HTMLElement>(s))
    .find(Boolean) ?? null;
  if (el) el.style.display = "";
  hiddenByToppings = false;
}
