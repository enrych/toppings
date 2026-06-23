/**
 * Generic YouTube page handler (home, search, channel, etc.)
 *
 * Runs `applyWatchProfile` so that home/search/shorts profile primitives
 * take effect on every YouTube navigation — not just the watch page.
 *
 * Also re-applies primitives when the profile store changes (popup or options
 * page interaction while browsing YouTube).
 */

import type { YoutubeContext } from "../../background/context";
import { applyWatchProfile } from "../primitives/applyProfile";

const onProfileStoreChangedYoutube = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string,
): void => {
  if (area !== "local") return;
  if (!("toppings:profile_store" in changes)) return;
  void applyWatchProfile();
};

const onYoutubePage = async (_ctx: YoutubeContext): Promise<void> => {
  // Apply active profile's home/search/shorts primitives.
  void applyWatchProfile();

  // Keep in sync with profile store changes from other surfaces.
  chrome.storage.onChanged.removeListener(onProfileStoreChangedYoutube);
  chrome.storage.onChanged.addListener(onProfileStoreChangedYoutube);
};

export default onYoutubePage;
