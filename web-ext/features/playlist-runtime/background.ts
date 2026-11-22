import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import { getPlaylistRuntime, type PlaylistRuntime } from "./messages";

// Set at build time; `TOPPINGS_API=http://127.0.0.1:8787/api bun run dev`
// points a build at a local Worker.
const API_BASE = process.env.TOPPINGS_API;

// A playlist's runtime changes only when videos are added or removed, so a
// day-old answer is nearly always right; the refresh button bypasses it.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// YouTube announces a hard load more than once, so the same playlist is often
// asked for again before its first answer is back.
const inFlight = new Map<string, Promise<PlaylistRuntime | null>>();

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
  const response = await fetch(`${API_BASE}/v1/playlist/${encodeURIComponent(playlistId)}`, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const body = (await response.json()) as { payload: PlaylistRuntime };
  return body.payload;
}

async function fetchAndCache(playlistId: string): Promise<PlaylistRuntime | null> {
  const data = await fetchRuntime(playlistId);
  // An empty answer means the API could not see the list, not that it is empty.
  if (!data || data.totalVideos === 0) return null;
  await chrome.storage.local.set({ [cacheKey(playlistId)]: { data, cachedAt: Date.now() } satisfies CacheEntry });
  return data;
}

export function servePlaylistRuntime(): void {
  getPlaylistRuntime.handle(async ({ playlistId, refresh }) => {
    if (!refresh) {
      const cached = await readCache(playlistId);
      if (cached) return cached;
    }
    let pending = inFlight.get(playlistId);
    if (!pending) {
      pending = fetchAndCache(playlistId).finally(() => inFlight.delete(playlistId));
      inFlight.set(playlistId, pending);
    }
    return pending;
  });
}
