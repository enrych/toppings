import { getStorage, Storage } from "./store";

const SERVER_BASE_URI =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8787"
    : "https://toppings.enry.ch";

export type Context = WatchContext | PlaylistContext | ShortsContext | null;

export interface BaseContext {
  pageName: string;
  payload: Record<string, any> | null;
  store: Storage;
}

export type WatchContext = BaseContext & {
  pageName: "watch";
  payload: WatchPayload;
};

export type WatchPayload = {
  videoId: string | null;
};

export type PlaylistContext = BaseContext & {
  pageName: "playlist";
  payload: ValidPlaylistPayload | InvalidPlaylistPayload;
};

export type ValidPlaylistPayload = {
  playlistId: string;
  averageRuntime: number;
  totalRuntime: number;
  totalVideos: string;
};

export type InvalidPlaylistPayload = {
  playlistId: "WL" | "LL" | null;
};

export type PlaylistResponse = {
  pathName: "playlist";
  payload: {
    playlist_id: string;
    total_videos: string;
    total_runtime_seconds: number;
    average_runtime_seconds: number;
  };
};

export type ShortsContext = BaseContext & {
  pageName: "shorts";
  payload: ShortsPayload;
};

export type ShortsPayload = {
  shortId: string | null;
};

export const getContext = async (rawURL: string): Promise<Context> => {
  const url = new URL(rawURL);
  const store = await getStorage();

  if (!store) {
    throw new Error("Extension store not found.");
  }

  if (url.pathname.startsWith("/watch")) {
    const videoId = url.searchParams.get("v") || null;

    return {
      pageName: "watch",
      payload: { videoId },
      store,
    } as const;
  } else if (url.pathname.startsWith("/playlist")) {
    const playlistId = url.searchParams.get("list") || null;

    if (playlistId === null || playlistId === "WL" || playlistId === "LL") {
      return {
        pageName: "playlist",
        payload: { playlistId },
        store,
      } as const;
    }

    try {
      const response = await fetch(
        `${SERVER_BASE_URI}/playlist/${playlistId}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist data: ${response.status}`);
      }

      const body = (await response.json()) as PlaylistResponse;

      return {
        pageName: "playlist",
        payload: {
          playlistId: body.payload.playlist_id,
          averageRuntime: body.payload.average_runtime_seconds,
          totalRuntime: body.payload.total_runtime_seconds,
          totalVideos: body.payload.total_videos,
        },
        store,
      } as const;
    } catch (error) {
      console.error("Error fetching playlist data:", error);
      return {
        pageName: "playlist",
        payload: { playlistId: null },
        store,
      } as const;
    }
  } else if (url.pathname.startsWith("/shorts")) {
    const shortId = url.pathname.split("/")[2] || null;
    return {
      pageName: "shorts",
      payload: { shortId },
      store,
    } as const;
  }

  return null;
};

/**
 * Dispatches the provided context to the specified tab using `chrome.tabs.sendMessage`.
 *
 * @param {number} tabId - The ID of the tab to send the message to.
 * @param {Context} ctx - The context to be sent to the tab.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 *
 * @remarks
 * - **Serialization in different browsers:**
 *   - **Firefox**: Uses the Structured Clone Algorithm.
 *   - **Chrome**: Currently uses JSON serialization, but may adopt the Structured Clone Algorithm in the future (Chrome issue 248548).
 *
 * - **Structured Clone Algorithm** (used by Firefox):
 *   - Supports a broader range of object types compared to JSON serialization.
 *
 * - **JSON Serialization** (used by Chrome):
 *   - Does not handle certain object types like DOM objects natively.
 *   - Objects with a `toJSON()` method (e.g., `URL`, `PerformanceEntry`) can be serialized with JSON, but they are still not structured cloneable.
 *
 * @note For extensions relying on `toJSON()`, use `JSON.stringify()` followed by `JSON.parse()` to ensure the message is structurally cloneable across browsers.
 */
export const dispatchContext = async (
  tabId: number,
  ctx: Exclude<Context, null>,
): Promise<void> => {
  // For URL, To ensure the message is structurally cloneable across browsers.
  const message = { type: "context", payload: ctx };
  const serializedContext = JSON.stringify(message);
  // sendMessage will throw "Error: Could not establish connection. Receiving end does not exist."
  // if there is no content script loaded in the given tab. This error is
  // noisy and mysterious (it usually doesn't have a valid line number), so we silence it.
  return await chrome.tabs
    .sendMessage(tabId, serializedContext)
    .catch(() => {});
};
