import { getActiveProfile } from "../../../core/profileStore";
import type { ProfilePrimitiveConfig } from "../../../data/profiles";
import {
  setSidebarVisible,
  setCommentsVisible,
  setEndCardsVisible,
  resetSidebar,
  resetComments,
  resetEndCards,
} from "./watch";
import {
  setHomeThumbnailMode,
  resetHomeThumbnails,
  setHomeFeedVisible,
  resetHomeFeed,
  setHomeShortsVisible,
  resetHomeShorts,
} from "./home";
import {
  setSearchThumbnailMode,
  resetSearchThumbnails,
  setSearchMetadataVisible,
  resetSearchMetadata,
  setSearchShortsVisible,
  resetSearchShorts,
} from "./search";
import {
  setShortsShelfVisible,
  resetShortsShelf,
} from "./shorts";

// Must run after the watch page handler's own setup, so profile overrides land
// on initialised components rather than being overwritten by them.
export async function applyWatchProfile(
  overrideConfig?: ProfilePrimitiveConfig,
): Promise<void> {
  const config =
    overrideConfig ?? (await getActiveProfile())?.primitives ?? null;

  // Reset first, unconditionally: entering, switching and leaving a profile all
  // have to start from the same clean state, and no profile means reset only.
  resetSidebar();
  resetComments();
  resetEndCards();
  resetHomeThumbnails();
  resetHomeFeed();
  resetHomeShorts();
  resetSearchThumbnails();
  resetSearchMetadata();
  resetSearchShorts();
  resetShortsShelf();

  if (!config) return;

  if (config["watch.sidebar"] !== undefined) {
    void setSidebarVisible(config["watch.sidebar"].visible);
  }
  if (config["watch.comments"] !== undefined) {
    void setCommentsVisible(config["watch.comments"].visible);
  }
  if (config["watch.endCards"] !== undefined) {
    void setEndCardsVisible(config["watch.endCards"].visible);
  }

  if (config["home.thumbnails"] !== undefined) {
    void setHomeThumbnailMode(config["home.thumbnails"].mode);
  }
  if (config["home.feed"] !== undefined) {
    void setHomeFeedVisible(config["home.feed"].visible);
  }
  if (config["home.shorts"] !== undefined) {
    void setHomeShortsVisible(config["home.shorts"].visible);
  }

  if (config["search.thumbnails"] !== undefined) {
    void setSearchThumbnailMode(config["search.thumbnails"].mode);
  }
  if (config["search.metadata"] !== undefined) {
    void setSearchMetadataVisible(config["search.metadata"].visible);
  }
  if (config["search.shorts"] !== undefined) {
    void setSearchShortsVisible(config["search.shorts"].visible);
  }

  if (config["shorts.shelf"] !== undefined) {
    void setShortsShelfVisible(config["shorts.shelf"].visible);
  }
}

export async function getActivePrimitives(): Promise<ProfilePrimitiveConfig | null> {
  const profile = await getActiveProfile();
  return profile?.primitives ?? null;
}
