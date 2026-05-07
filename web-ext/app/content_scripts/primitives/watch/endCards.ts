import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

// ---------------------------------------------------------------------------
// End screen cards primitive
//
// Controls the clickable overlay cards that appear in the final seconds
// of a YouTube video (subscribe prompts, related video cards, etc.).
// ---------------------------------------------------------------------------

const STRATEGIES = [
  ".ytp-ce-element",
  ".ytp-endscreen-element",
  ".html5-endscreen",
  ".ytp-player-content .ytp-ce-element",
] as const;

/**
 * Whether end cards are currently suppressed by Toppings.
 * We use CSS visibility rather than display:none to preserve layout flow.
 */
let suppressedByToppings = false;

/**
 * Hide or show end screen cards.
 * Writes the resolution result to the capability cache.
 *
 * Note: we target the container rather than individual cards so that
 * cards injected dynamically (e.g. mid-video) are also covered.
 */
export async function setEndCardsVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("watch.endCards", "watch", resolution);

  if (!resolution.resolved) return;

  const container = resolution.element as HTMLElement;
  if (visible) {
    if (suppressedByToppings) {
      container.style.display = "";
      suppressedByToppings = false;
    }
  } else {
    container.style.display = "none";
    suppressedByToppings = true;
  }
}

/** Restore end cards to their original state (called on navigation / teardown). */
export function resetEndCards(): void {
  if (!suppressedByToppings) return;
  const el = STRATEGIES
    .map((s) => document.querySelector<HTMLElement>(s))
    .find(Boolean) ?? null;
  if (el) el.style.display = "";
  suppressedByToppings = false;
}
