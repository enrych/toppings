import { EXTENSION_CONTEXT_SCOPE } from "@/lib/protocol";
import { YOUTUBE_QUERY_PARAM, YOUTUBE_URL_PATH } from "@/lib/youtube";
import { getStorage, Storage } from "@/lib/store";

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
  payload: { playlistId: string | null };
};

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
    throw new Error("Store not found");
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
    return {
      scope: EXTENSION_CONTEXT_SCOPE.PLAYLIST,
      payload: { playlistId: url.searchParams.get(YOUTUBE_QUERY_PARAM.PLAYLIST_ID) },
      store,
    } as const;
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
