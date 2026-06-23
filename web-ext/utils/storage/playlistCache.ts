/**
 * Playlist data cache stored in chrome.storage.local.
 *
 * The background service worker calls the Toppings API for every playlist
 * page visit. This cache stores the response keyed by playlistId and
 * returns stale data within the TTL window, cutting unnecessary API calls.
 *
 * TTL: 30 minutes by default. Users can manually refresh from the
 * playlist UI, which clears the entry and forces a fresh call.
 */

import type { ValidPlaylistPayload } from "../../app/background/context";

const CACHE_KEY_PREFIX = "toppings:playlist_cache:";
/** Cache TTL in milliseconds. */
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface PlaylistCacheEntry {
  playlistId: string;
  data: ValidPlaylistPayload;
  cachedAt: number; // Unix timestamp (ms)
}

function storageKey(playlistId: string): string {
  return `${CACHE_KEY_PREFIX}${playlistId}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve cached playlist data. Returns null if absent or expired.
 */
export async function getCachedPlaylist(
  playlistId: string,
): Promise<ValidPlaylistPayload | null> {
  const key = storageKey(playlistId);
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      const entry = result[key] as PlaylistCacheEntry | undefined;
      if (!entry) { resolve(null); return; }
      if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
        // Expired — purge and return null.
        chrome.storage.local.remove(key);
        resolve(null);
        return;
      }
      resolve(entry.data);
    });
  });
}

/**
 * Write playlist data to the cache.
 */
export async function setCachedPlaylist(
  playlistId: string,
  data: ValidPlaylistPayload,
): Promise<void> {
  const entry: PlaylistCacheEntry = {
    playlistId,
    data,
    cachedAt: Date.now(),
  };
  return new Promise((resolve) => {
    chrome.storage.local.set({ [storageKey(playlistId)]: entry }, resolve);
  });
}

/**
 * Evict the cached entry for a specific playlist (manual refresh).
 */
export async function invalidateCachedPlaylist(
  playlistId: string,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(storageKey(playlistId), resolve);
  });
}

/**
 * Evict all cached playlist entries.
 */
export async function clearPlaylistCache(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (all) => {
      const keys = Object.keys(all).filter((k) =>
        k.startsWith(CACHE_KEY_PREFIX),
      );
      if (keys.length === 0) { resolve(); return; }
      chrome.storage.local.remove(keys, resolve);
    });
  });
}
