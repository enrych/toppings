// Exists to keep every playlist page visit from hitting the Toppings API. Users
// can force a fresh call by refreshing from the playlist UI, which evicts the entry.

import type { ValidPlaylistPayload } from "../../background/context";
import { CHROME_STORAGE_LOCAL_KEY } from "../../../data/core";

const CACHE_KEY_PREFIX = CHROME_STORAGE_LOCAL_KEY.PLAYLIST_CACHE_PREFIX;
const CACHE_TTL_MS = 30 * 60 * 1000;

interface PlaylistCacheEntry {
  playlistId: string;
  data: ValidPlaylistPayload;
  cachedAt: number; // Unix timestamp (ms)
}

function storageKey(playlistId: string): string {
  return `${CACHE_KEY_PREFIX}${playlistId}`;
}

export async function getCachedPlaylist(
  playlistId: string,
): Promise<ValidPlaylistPayload | null> {
  const key = storageKey(playlistId);
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      const entry = result[key] as PlaylistCacheEntry | undefined;
      if (!entry) { resolve(null); return; }
      if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
        chrome.storage.local.remove(key);
        resolve(null);
        return;
      }
      resolve(entry.data);
    });
  });
}

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

export async function invalidateCachedPlaylist(
  playlistId: string,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(storageKey(playlistId), resolve);
  });
}

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
