/**
 * Home scope — Shorts shelf visibility primitive.
 *
 * Hides the Shorts row that appears in the YouTube home feed.
 */

import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

const STRATEGIES = [
  "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])",
  "ytd-rich-shelf-renderer[is-shorts]",
  "#shorts-container",
  "ytd-reel-shelf-renderer",
] as const;

export async function setHomeShortsVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("home.shorts", "home", resolution);
  if (!resolution.resolved) return;

  (resolution.element as HTMLElement).style.display = visible ? "" : "none";
}

export function resetHomeShorts(): void {
  const selectors = STRATEGIES.join(", ");
  const el = document.querySelector(selectors) as HTMLElement | null;
  if (el) el.style.display = "";
}
