import {
  EXTENSION_CONTEXT_SCOPE,
  YOUTUBE_QUERY_PARAM,
  YOUTUBE_SYSTEM_PLAYLIST_ID,
  YOUTUBE_URL_PATH,
} from "../../data/contract";
import { ERROR } from "../../data/errors";
import { HTTP_METHOD } from "../../data/http";
import { EXTENSION_API_ENDPOINT } from "../../data/api.data";
import { api } from "../../utils/api";
import { getStorage, Storage } from "./store";
import {
  getCachedPlaylist,
  setCachedPlaylist,
} from "../../utils/storage/playlistCache";

export type YoutubeContext = BaseContext & {
  scope: typeof EXTENSION_CONTEXT_SCOPE.YOUTUBE;
  payload: Record<string, never>;
};

export type Context = WatchContext | PlaylistContext | ShortsContext | YoutubeContext | null;

export interface BaseContext {
  scope: string;
  payload: Record<string, any>;
  store: Storage;
}

export type WatchContext = BaseContext & {
  scope: typeof EXTENSION_CONTEXT_SCOPE.WATCH;
  payload: WatchPayload;
};

export type WatchPayload = {
  videoId: string | null;
};

export type PlaylistContext = BaseContext & {
  scope: typeof EXTENSION_CONTEXT_SCOPE.PLAYLIST;
  payload: ValidPlaylistPayload | InvalidPlaylistPayload;
};

export type ValidPlaylistPayload = {
  playlistId: string;
  averageRuntime: number;
  totalRuntime: number;
  totalVideos: number;
};

export type InvalidPlaylistPayload = {
  playlistId:
  | typeof YOUTUBE_SYSTEM_PLAYLIST_ID.WATCH_LATER
  | typeof YOUTUBE_SYSTEM_PLAYLIST_ID.LIKED
  | string
  | null;
};

export type PlaylistResponse = PlaylistContext;

export type ShortsContext = BaseContext & {
  scope: typeof EXTENSION_CONTEXT_SCOPE.SHORTS;
  payload: ShortsPayload;
};

export type ShortsPayload = {
  shortId: string | null;
};

export const getContext = async (rawURL: string): Promise<Context> => {
  const url = new URL(rawURL);
  const store = await getStorage();

  if (!store) {
    throw new Error(ERROR.STORE_NOT_FOUND);
  }

  if (url.pathname.startsWith(YOUTUBE_URL_PATH.WATCH)) {
    const videoId = url.searchParams.get(YOUTUBE_QUERY_PARAM.VIDEO_ID);
    if (!videoId) return null;

    return {
      scope: EXTENSION_CONTEXT_SCOPE.WATCH,
      payload: { videoId },
      store,
    } as const;
  } else if (url.pathname.startsWith(YOUTUBE_URL_PATH.PLAYLIST)) {
    const playlistId = url.searchParams.get(YOUTUBE_QUERY_PARAM.PLAYLIST_ID);

    if (
      !playlistId ||
      playlistId === YOUTUBE_SYSTEM_PLAYLIST_ID.WATCH_LATER ||
      playlistId === YOUTUBE_SYSTEM_PLAYLIST_ID.LIKED
    ) {
      return {
        scope: EXTENSION_CONTEXT_SCOPE.PLAYLIST,
        payload: { playlistId },
        store,
      } as const;
    }

    try {
      // Check cache before hitting the API.
      const cached = await getCachedPlaylist(playlistId);
      if (cached) {
        return {
          scope: EXTENSION_CONTEXT_SCOPE.PLAYLIST,
          payload: cached,
          store,
        } as const;
      }

      const response = await api.fetch(
        EXTENSION_API_ENDPOINT.PLAYLIST_V1,
        { playlistId },
        { method: HTTP_METHOD.GET },
      );

      if (!response.ok) {
        throw new Error(ERROR.PLAYLIST_FETCH_FAILED);
      }

      const body = (await response.json()) as PlaylistResponse;

      // Persist to cache for subsequent visits.
      if (body.scope === EXTENSION_CONTEXT_SCOPE.PLAYLIST && "totalRuntime" in body.payload) {
        void setCachedPlaylist(playlistId, body.payload as ValidPlaylistPayload);
      }

      return {
        ...body,
        store,
      } as const;
    } catch (error) {
      console.error(ERROR.PLAYLIST_FETCH_FAILED, error);
      return {
        scope: EXTENSION_CONTEXT_SCOPE.PLAYLIST,
        payload: { playlistId },
        store,
      } as const;
    }
  } else if (url.pathname.startsWith(YOUTUBE_URL_PATH.SHORTS)) {
    const shortId =
      url.pathname.split("/")[2] || null;
    return {
      scope: EXTENSION_CONTEXT_SCOPE.SHORTS,
      payload: { shortId },
      store,
    } as const;
  }

  // Generic YouTube page (home, search, channel, etc.) — return a YouTube
  // scope context so the content script can apply profile primitives that
  // target these pages (home feed, search results, Shorts shelf).
  return {
    scope: EXTENSION_CONTEXT_SCOPE.YOUTUBE,
    payload: {},
    store,
  } as const;
};
