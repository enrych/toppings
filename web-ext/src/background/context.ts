import { getStorage, Storage } from "./store";

export interface IContext {
  isSupported: boolean;
  store: Storage;
  pathname: "watch" | "playlist" | "shorts" | null;
  payload: Record<string, any> | null;
}

export interface WatchContext extends IContext {
  pathname: "watch";
  payload: WatchPayload;
}

export interface WatchPayload {
  videoId: string;
}

export interface PlaylistContext extends IContext {
  pathname: "playlist";
  payload: ValidPlaylistPayload | InvalidPlaylistPayload;
}

export interface ValidPlaylistPayload {
  playlistId: string;
  averageRuntime: number;
  totalRuntime: number;
  totalVideos: string;
}

export interface InvalidPlaylistPayload {
  playlistId: "WL" | "LL" | "";
}

export interface PlaylistResponse {
  ok: boolean;
  status: number;
  error_message: string;
  data: {
    num_videos: string;
    playlist_id: string;
    avg_runtime: number;
    total_runtime: number;
  };
}

export interface ShortsContext extends IContext {
  pathname: "shorts";
  payload: ShortsPayload;
}

export interface ShortsPayload {
  shortId: string;
}

export type Context = WatchContext | PlaylistContext | ShortsContext;

export const getContext = async (href: string): Promise<IContext> => {
  const url = new URL(href);
  const store = await getStorage();

  if (!store) {
    throw new Error("extension store not found.");
  }

  switch (url.pathname) {
    case "/playlist": {
      const playlistId = url.searchParams.get("list");
      if (playlistId != null && playlistId !== "WL" && playlistId !== "LL") {
        const SERVER_BASE_URI =
          process.env.NODE_ENV === "development"
            ? "http://localhost:8787"
            : "https://toppings.enry.ch";
        const response = await fetch(
          `${SERVER_BASE_URI}/youtube/playlist/${playlistId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const body = (await response.json()) as PlaylistResponse;

        return {
          isSupported: true,
          store: store,
          pathname: "playlist",
          payload: {
            playlistId: playlistId,
            averageRuntime: body.data.avg_runtime,
            totalRuntime: body.data.total_runtime,
            totalVideos: body.data.num_videos,
          },
        } as PlaylistContext;
      } else {
        return {
          isSupported: true,
          store: store,
          pathname: "playlist",
          payload: {
            playlistId: playlistId ?? "",
          },
        } as PlaylistContext;
      }
    }

    case "/watch": {
      const videoId = url.searchParams.get("v");
      if (videoId != null) {
        return {
          isSupported: true,
          store: store,
          pathname: "watch",
          payload: {
            videoId,
          },
        } as WatchContext;
      }
      break;
    }

    default: {
      if (url.pathname.startsWith("/shorts")) {
        const shortId = url.pathname.split("/").at(2) ?? "";
        return {
          isSupported: true,
          store: store,
          pathname: "shorts",
          payload: {
            shortId,
          },
        } as ShortsContext;
      }
    }
  }

  return {
    isSupported: false,
    store: store,
    pathname: null,
    payload: null,
  };
};

/**
 * Dispatches the provided context to the specified tab using `chrome.tabs.sendMessage`.
 *
 * @param {number} tabId - The ID of the tab to send the message to.
 * @param {IContext} ctx - The context to be sent to the tab.
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
  ctx: IContext,
): Promise<void> => {
  // For URL, To ensure the message is structurally cloneable across browsers.
  const serializedContext = JSON.stringify(ctx);
  return await chrome.tabs.sendMessage(tabId, serializedContext);
};
