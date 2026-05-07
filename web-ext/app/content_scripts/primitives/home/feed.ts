/**
 * Home scope — entire feed visibility primitive.
 *
 * Hides/shows the main content area of the YouTube home page.
 */

import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../utils/storage/capabilityCache";

const STRATEGIES = [
  "ytd-rich-grid-renderer",
  "ytd-browse[page-subtype='home'] ytd-rich-grid-renderer",
  "#contents.ytd-rich-grid-renderer",
] as const;

export async function setHomeFeedVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("home.feed", "home", resolution);
  if (!resolution.resolved) return;

  (resolution.element as HTMLElement).style.display = visible ? "" : "none";
}

export function resetHomeFeed(): void {
  const selectors = STRATEGIES.join(", ");
  const el = document.querySelector(selectors) as HTMLElement | null;
  if (el) el.style.display = "";
}
