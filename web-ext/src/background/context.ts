import {
  ENDPOINTS,
  ERROR,
  HTTP_METHOD,
  PAGE,
  SHORTS_ID_PATH_SEGMENT,
  SYSTEM_PLAYLIST_ID,
  URL_PATH,
  URL_QUERY,
} from "@toppings/constants";
import { api } from "../shared/api";
import { getStorage, Storage } from "./store";

export type Context = WatchContext | PlaylistContext | ShortsContext | null;

export interface BaseContext {
  pathname: string;
  payload: Record<string, any>;
  store: Storage;
}

export type WatchContext = BaseContext & {
  pathname: typeof PAGE.WATCH;
  payload: WatchPayload;
};

export type WatchPayload = {
  videoId: string | null;
};

export type PlaylistContext = BaseContext & {
  pathname: typeof PAGE.PLAYLIST;
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
    | typeof SYSTEM_PLAYLIST_ID.WATCH_LATER
    | typeof SYSTEM_PLAYLIST_ID.LIKED
    | string
    | null;
};

export type PlaylistResponse = PlaylistContext;

export type ShortsContext = BaseContext & {
  pathname: typeof PAGE.SHORTS;
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

  if (url.pathname.startsWith(URL_PATH.WATCH)) {
    const videoId = url.searchParams.get(URL_QUERY.VIDEO_ID);
    if (!videoId) return null;

    return {
      pathname: PAGE.WATCH,
      payload: { videoId },
      store,
    } as const;
  } else if (url.pathname.startsWith(URL_PATH.PLAYLIST)) {
    const playlistId = url.searchParams.get(URL_QUERY.PLAYLIST_ID);

    if (
      !playlistId ||
      playlistId === SYSTEM_PLAYLIST_ID.WATCH_LATER ||
      playlistId === SYSTEM_PLAYLIST_ID.LIKED
    ) {
      return {
        pathname: PAGE.PLAYLIST,
        payload: { playlistId },
        store,
      } as const;
    }

    try {
      const response = await api.fetch(
        ENDPOINTS.PLAYLIST,
        { playlistId },
        { method: HTTP_METHOD.GET },
      );

      if (!response.ok) {
        throw new Error(ERROR.PLAYLIST_FETCH_FAILED);
      }

      const body = (await response.json()) as PlaylistResponse;

      return {
        ...body,
        store,
      } as const;
    } catch (error) {
      console.error(ERROR.PLAYLIST_FETCH_FAILED, error);
      return {
        pathname: PAGE.PLAYLIST,
        payload: { playlistId },
        store,
      } as const;
    }
  } else if (url.pathname.startsWith(URL_PATH.SHORTS)) {
    const shortId =
      url.pathname.split("/")[SHORTS_ID_PATH_SEGMENT] || null;
    return {
      pathname: PAGE.SHORTS,
      payload: { shortId },
      store,
    } as const;
  }

  return null;
};
