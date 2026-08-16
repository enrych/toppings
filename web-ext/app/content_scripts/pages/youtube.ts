// Handles every YouTube page that is not watch, playlist or shorts, which is why
// it applies the profile too: home and search primitives would otherwise only
// take effect once the user opened a video.

import type { YoutubeContext } from "../../background/context";
import { applyWatchProfile } from "../primitives/applyProfile";
import { CHROME_STORAGE_LOCAL_KEY } from "../../../data/core";

const onProfileStoreChangedYoutube = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string,
): void => {
  if (area !== "local") return;
  if (!(CHROME_STORAGE_LOCAL_KEY.PROFILE_STORE in changes)) return;
  void applyWatchProfile();
};

const onYoutubePage = async (_ctx: YoutubeContext): Promise<void> => {
  void applyWatchProfile();

  chrome.storage.onChanged.removeListener(onProfileStoreChangedYoutube);
  chrome.storage.onChanged.addListener(onProfileStoreChangedYoutube);
};

export default onYoutubePage;
