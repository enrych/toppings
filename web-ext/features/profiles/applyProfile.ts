import { getActiveProfile } from "./profileStore";
import type { ProfilePrimitiveConfig } from "./profiles";
import { setSidebarVisible, resetSidebar } from "./primitives/watch/sidebar";
import { setCommentsVisible, resetComments } from "./primitives/watch/comments";
import { setEndCardsVisible, resetEndCards } from "./primitives/watch/endCards";
import { setPlayerLayout, resetPlayerLayout } from "./primitives/watch/layout";
import { setHomeThumbnailMode, resetHomeThumbnails } from "./primitives/home/thumbnails";
import { setHomeFeedVisible, resetHomeFeed } from "./primitives/home/feed";
import { setHomeShortsVisible, resetHomeShorts } from "./primitives/home/shorts";
import { setSearchThumbnailMode, resetSearchThumbnails } from "./primitives/search/thumbnails";
import { setSearchMetadataVisible, resetSearchMetadata } from "./primitives/search/metadata";
import { setSearchShortsVisible, resetSearchShorts } from "./primitives/search/shorts";
import { setShortsShelfVisible, resetShortsShelf } from "./primitives/shorts/shelf";

// Must run after the watch page handler's own setup, so profile overrides land
// on initialised components rather than being overwritten by them.
export async function applyWatchProfile(
  overrideConfig?: ProfilePrimitiveConfig,
): Promise<void> {
  const config =
    overrideConfig ?? (await getActiveProfile())?.primitives ?? null;

  // Reset first, unconditionally: entering, switching and leaving a profile all
  // have to start from the same clean state, and no profile means reset only.
  resetPlayerLayout();
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

  if (config["watch.layout"] !== undefined) {
    void setPlayerLayout(config["watch.layout"].value);
  }
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

