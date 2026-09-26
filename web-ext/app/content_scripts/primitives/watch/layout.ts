import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../core/capabilityCache";
import type { PlayerLayout } from "../../../../data/profiles";

// The container is collapsed rather than the <video> hidden: a display:none
// video may be treated as not playing, while a zero-height container keeps
// playback and audio untouched.
const STRATEGIES = ["#player-container-outer", "#player-container", "ytd-player"] as const;

let collapsedByToppings = false;

export async function setPlayerLayout(layout: PlayerLayout): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("watch.layout", "watch", resolution);
  if (!resolution.resolved) return;

  const container = resolution.element as HTMLElement;
  if (layout === "no-video") {
    container.style.height = "0";
    container.style.minHeight = "0";
    container.style.overflow = "hidden";
    collapsedByToppings = true;
  } else if (collapsedByToppings) {
    expand(container);
  }
}

export function resetPlayerLayout(): void {
  if (!collapsedByToppings) return;
  const container = STRATEGIES.map((s) => document.querySelector<HTMLElement>(s)).find(Boolean);
  if (container) expand(container);
}

function expand(container: HTMLElement): void {
  container.style.height = "";
  container.style.minHeight = "";
  container.style.overflow = "";
  collapsedByToppings = false;
}
