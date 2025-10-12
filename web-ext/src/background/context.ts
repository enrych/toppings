import {
  LOCAL_SERVER_URL,
  NODE_ENV,
  PROD_SERVER_URL,
  PATHNAME as YOUTUBE_PATHNAME,
  WATCH_LATER_PLAYLIST_ID,
  LIKED_VIDEOS_PLAYLIST_ID,
  ERROR_MESSAGE,
  YOUTUBE_SEARCH_PARAM,
  HTTP_METHOD,
  HTTP_ACCEPT,
  HTTP_STATUS,
} from "../constants/global.constants";
import { getStorage, Storage } from "./store";

const SERVER_BASE_URL =
  process.env.NODE_ENV === NODE_ENV.DEVELOPMENT
    ? LOCAL_SERVER_URL
    : PROD_SERVER_URL;

export type Context = WatchContext | PlaylistContext | ShortsContext | null;

export interface BaseContext {
  pathname: string;
  payload: Record<string, any>;
  store: Storage;
}

export type WatchContext = BaseContext & {
  pathname: typeof YOUTUBE_PATHNAME.WATCH;
  payload: WatchPayload;
};

export type WatchPayload = {
  videoId: string | null;
};

export type PlaylistContext = BaseContext & {
  pathname: typeof YOUTUBE_PATHNAME.PLAYLIST;
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
    | typeof WATCH_LATER_PLAYLIST_ID
    | typeof LIKED_VIDEOS_PLAYLIST_ID
    | string
    | null;
};

export type PlaylistResponse = PlaylistContext;

export type ShortsContext = BaseContext & {
  pathname: typeof YOUTUBE_PATHNAME.SHORTS;
  payload: ShortsPayload;
};

export type ShortsPayload = {
  shortId: string | null;
};

export const getContext = async (rawURL: string): Promise<Context> => {
  const url = new URL(rawURL);
  const store = await getStorage();

  if (!store) {
    throw new Error(ERROR_MESSAGE.STORE_NOT_FOUND);
  }

  if (url.pathname.startsWith("/watch")) {
    const videoId = url.searchParams.get(YOUTUBE_SEARCH_PARAM.VIDEO_ID);
    if (!videoId) return null;

    return {
      pathname: YOUTUBE_PATHNAME.WATCH,
      payload: { videoId },
      store,
    } as const;
  } else if (url.pathname.startsWith("/playlist")) {
    const playlistId = url.searchParams.get(YOUTUBE_SEARCH_PARAM.PLAYLIST_ID);

    if (
      !playlistId ||
      playlistId === WATCH_LATER_PLAYLIST_ID ||
      playlistId === LIKED_VIDEOS_PLAYLIST_ID
    ) {
      return {
        pathname: YOUTUBE_PATHNAME.PLAYLIST,
        payload: { playlistId },
        store,
      } as const;
    }

    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/playlist/${playlistId}`,
        {
          method: HTTP_METHOD.GET,
          headers: { Accept: HTTP_ACCEPT.JSON },
        },
      );

      if (!response.ok) {
        throw new Error(ERROR_MESSAGE.FAILED_FETCHING_PLAYLIST_DATA);
      }

      const body = (await response.json()) as PlaylistResponse;

      return {
        ...body,
        store,
      } as const;
    } catch (error) {
      console.error(ERROR_MESSAGE.FAILED_FETCHING_PLAYLIST_DATA, error);
      return {
        pathname: YOUTUBE_PATHNAME.PLAYLIST,
        payload: { playlistId },
        store,
      } as const;
    }
  } else if (url.pathname.startsWith("/shorts")) {
    const shortId = url.pathname.split("/")[2] || null;
    return {
      pathname: YOUTUBE_PATHNAME.SHORTS,
      payload: { shortId },
      store,
    } as const;
  }

  return null;
};
