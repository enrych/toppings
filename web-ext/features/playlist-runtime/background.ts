import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import { getPlaylistRuntime, type PlaylistRuntime } from "./messages";

const API_BASE =
  process.env.NODE_ENV === "development" ? "http://127.0.0.1:8787/api" : "https://toppings.enry.ch/api";

// Cached so a playlist page visit does not hit the API every time; a refresh
// from the page evicts the entry.
const CACHE_TTL_MS = 30 * 60 * 1000;

interface CacheEntry {
  data: PlaylistRuntime;
  cachedAt: number;
}

function cacheKey(playlistId: string): string {
  return `${CHROME_STORAGE_LOCAL_KEY.PLAYLIST_CACHE_PREFIX}${playlistId}`;
}

async function readCache(playlistId: string): Promise<PlaylistRuntime | null> {
  const key = cacheKey(playlistId);
  const entry = (await chrome.storage.local.get(key))[key] as CacheEntry | undefined;
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    await chrome.storage.local.remove(key);
    return null;
  }
  return entry.data;
}

async function fetchRuntime(playlistId: string): Promise<PlaylistRuntime | null> {
  const response = await fetch(`${API_BASE}/v1/playlist/${playlistId}`, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const body = (await response.json()) as { payload: PlaylistRuntime };
  return body.payload;
}

export function servePlaylistRuntime(): void {
  getPlaylistRuntime.handle(async ({ playlistId, refresh }) => {
    if (!refresh) {
      const cached = await readCache(playlistId);
      if (cached) return cached;
    }
    const data = await fetchRuntime(playlistId);
    if (data) await chrome.storage.local.set({ [cacheKey(playlistId)]: { data, cachedAt: Date.now() } satisfies CacheEntry });
    return data;
  });
}
