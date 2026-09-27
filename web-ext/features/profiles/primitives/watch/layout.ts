import { resolveTarget } from "@/kernel/dom/resolve";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import type { PlayerLayout } from "../../profiles";

// YouTube keeps the player in #player-container-outer normally and moves it
// into #full-bleed-container for theater mode, so the container is found by
// what it holds. The container is collapsed rather than the <video> hidden: a
// display:none video may be treated as not playing, while a zero-height
// container keeps playback and audio untouched.
const STRATEGIES = [
  "#full-bleed-container:has(#movie_player)",
  "#player-container-outer:has(#movie_player)",
  "#player-container:has(#movie_player)",
] as const;

let collapsed: HTMLElement | null = null;
let theaterObserver: MutationObserver | null = null;

export async function setPlayerLayout(layout: PlayerLayout): Promise<void> {
  if (layout !== "no-video") {
    resetPlayerLayout();
    return;
  }

  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("watch.layout", "watch", resolution);
  if (!resolution.resolved) return;

  const container = resolution.element as HTMLElement;
  if (collapsed && collapsed !== container) expand(collapsed);
  container.style.height = "0";
  container.style.minHeight = "0";
  container.style.overflow = "hidden";
  collapsed = container;

  // Toggling theater mode moves the player to the other container, slightly
  // after the attribute changes, hence the second, delayed pass.
  const flexy = document.querySelector("ytd-watch-flexy");
  if (flexy && !theaterObserver) {
    theaterObserver = new MutationObserver(() => {
      void setPlayerLayout("no-video");
      setTimeout(() => void setPlayerLayout("no-video"), 500);
    });
    theaterObserver.observe(flexy, { attributes: true, attributeFilter: ["theater"] });
  }
}

export function resetPlayerLayout(): void {
  theaterObserver?.disconnect();
  theaterObserver = null;
  if (collapsed) expand(collapsed);
}

function expand(container: HTMLElement): void {
  container.style.height = "";
  container.style.minHeight = "";
  container.style.overflow = "";
  collapsed = null;
}
