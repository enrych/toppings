import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../core/capabilityCache";

const STRATEGIES = [
  ".ytp-ce-element",
  ".ytp-endscreen-element",
  ".html5-endscreen",
  ".ytp-player-content .ytp-ce-element",
] as const;

// Tracked so reset only touches what this file hid, never YouTube's own state.
let suppressedByToppings = false;

// Targets the container, not the cards: YouTube injects cards mid-video, and
// anything hidden per-element would miss the ones that appear later.
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

export function resetEndCards(): void {
  if (!suppressedByToppings) return;
  const el = STRATEGIES
    .map((s) => document.querySelector<HTMLElement>(s))
    .find(Boolean) ?? null;
  if (el) el.style.display = "";
  suppressedByToppings = false;
}
