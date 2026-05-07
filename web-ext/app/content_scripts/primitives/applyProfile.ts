import { getActiveProfile } from "../../../utils/storage/profileStore";
import type { ProfilePrimitiveConfig } from "../../../data/profiles.data";
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

// ---------------------------------------------------------------------------
// Watch profile application
// ---------------------------------------------------------------------------

/**
 * Apply the active profile's watch-scope primitive states.
 *
 * Call this after the watch page handler has completed its own setup so that
 * Audio Mode and other components are already initialised before we apply
 * profile overrides on top.
 *
 * If no profile is active all primitives are reset to their defaults
 * (visible / unmodified), which is the same as calling resetAll() —
 * this ensures switching from an active profile back to "no profile"
 * cleanly restores the page.
 *
 * @param overrideConfig  Optional config to apply directly instead of reading
 *                        from storage. Used when profile switching mid-session.
 */
export async function applyWatchProfile(
  overrideConfig?: ProfilePrimitiveConfig,
): Promise<void> {
  const config =
    overrideConfig ?? (await getActiveProfile())?.primitives ?? null;

  // --- Reset all to defaults first, then apply profile on top. ---
  // This guarantees a clean state whether we are entering, switching, or
  // leaving a profile.
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

  // --- Watch primitives ---
  if (config["watch.sidebar"] !== undefined) {
    void setSidebarVisible(config["watch.sidebar"].visible);
  }
  if (config["watch.comments"] !== undefined) {
    void setCommentsVisible(config["watch.comments"].visible);
  }
  if (config["watch.endCards"] !== undefined) {
    void setEndCardsVisible(config["watch.endCards"].visible);
  }

  // --- Home primitives ---
  if (config["home.thumbnails"] !== undefined) {
    void setHomeThumbnailMode(config["home.thumbnails"].mode);
  }
  if (config["home.feed"] !== undefined) {
    void setHomeFeedVisible(config["home.feed"].visible);
  }
  if (config["home.shorts"] !== undefined) {
    void setHomeShortsVisible(config["home.shorts"].visible);
  }

  // --- Search primitives ---
  if (config["search.thumbnails"] !== undefined) {
    void setSearchThumbnailMode(config["search.thumbnails"].mode);
  }
  if (config["search.metadata"] !== undefined) {
    void setSearchMetadataVisible(config["search.metadata"].visible);
  }
  if (config["search.shorts"] !== undefined) {
    void setSearchShortsVisible(config["search.shorts"].visible);
  }

  // --- Shorts shelf (home + search) ---
  if (config["shorts.shelf"] !== undefined) {
    void setShortsShelfVisible(config["shorts.shelf"].visible);
  }
}

/**
 * Read the current active profile and return its primitives, or null if
 * no profile is active. Lightweight — used for on-demand checks.
 */
export async function getActivePrimitives(): Promise<ProfilePrimitiveConfig | null> {
  const profile = await getActiveProfile();
  return profile?.primitives ?? null;
}
