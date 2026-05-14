import {
  ERROR_MESSAGE,
  HTTP_ACCEPT,
  HTTP_HEADER,
  HTTP_METHOD,
  LIKED_VIDEOS_PLAYLIST_ID,
  LOCAL_SERVER_URL,
  NODE_ENV,
  PATHNAME as YOUTUBE_PATHNAME,
  PROD_SERVER_URL,
  WATCH_LATER_PLAYLIST_ID,
  WORKER_API_PATH,
  YOUTUBE_PAGE_PATH,
  YOUTUBE_SEARCH_PARAM,
  YOUTUBE_URL_PATH_SEGMENT_INDEX,
} from "toppings-constants";
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

  if (url.pathname.startsWith(YOUTUBE_PAGE_PATH.WATCH)) {
    const videoId = url.searchParams.get(YOUTUBE_SEARCH_PARAM.VIDEO_ID);
    if (!videoId) return null;

    return {
      pathname: YOUTUBE_PATHNAME.WATCH,
      payload: { videoId },
      store,
    } as const;
  } else if (url.pathname.startsWith(YOUTUBE_PAGE_PATH.PLAYLIST)) {
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
        `${SERVER_BASE_URL}${WORKER_API_PATH.PLAYLIST_PREFIX}/${playlistId}`,
        {
          method: HTTP_METHOD.GET,
          headers: { [HTTP_HEADER.ACCEPT]: HTTP_ACCEPT.JSON },
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
  } else if (url.pathname.startsWith(YOUTUBE_PAGE_PATH.SHORTS)) {
    const shortId =
      url.pathname.split("/")[YOUTUBE_URL_PATH_SEGMENT_INDEX.SHORTS_VIDEO_ID] ||
      null;
    return {
      pathname: YOUTUBE_PATHNAME.SHORTS,
      payload: { shortId },
      store,
    } as const;
  }

  return null;
};
