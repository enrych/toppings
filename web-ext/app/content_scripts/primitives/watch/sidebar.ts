import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

// ---------------------------------------------------------------------------
// Recommendations sidebar primitive
//
// Controls the "Up next" / related videos panel on the watch page.
// ---------------------------------------------------------------------------

const STRATEGIES = [
  "#secondary",
  "ytd-watch-next-secondary-results-renderer",
  "#related",
  "ytd-watch-flexy #secondary-inner",
] as const;

let hiddenByToppings = false;

/**
 * Hide or show the recommendations sidebar.
 * Writes the resolution result to the capability cache so the options UI
 * can surface this primitive as supported or unsupported.
 */
export async function setSidebarVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("watch.sidebar", "watch", resolution);

  if (!resolution.resolved) return;

  const sidebar = resolution.element as HTMLElement;
  if (visible) {
    if (hiddenByToppings) {
      sidebar.style.display = "";
      hiddenByToppings = false;
    }
  } else {
    sidebar.style.display = "none";
    hiddenByToppings = true;
  }
}

/** Restore sidebar to its original state (called on navigation / teardown). */
export function resetSidebar(): void {
  if (!hiddenByToppings) return;
  const el = STRATEGIES
    .map((s) => document.querySelector<HTMLElement>(s))
    .find(Boolean) ?? null;
  if (el) el.style.display = "";
  hiddenByToppings = false;
}
