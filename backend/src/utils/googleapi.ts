import {
  GOOGLE_API_QUERY_PARAM,
  GOOGLE_API_URL,
  YOUTUBE_API_ENDPOINT,
  YOUTUBE_API_PLAYLIST,
  YOUTUBE_API_QUERY,
  YOUTUBE_API_VIDEO,
} from "@toppings/constants";
import { interpolateTemplate, withQuery } from "@toppings/utils";

export function buildGoogleApiUrl(path: string): string {
  return interpolateTemplate(GOOGLE_API_URL, { path });
}

export function buildPlaylistItemsApiUrl(options: {
  apiKey: string;
  playlistId: string;
  pageToken?: string;
}): string {
  const { apiKey, playlistId, pageToken = "" } = options;
  return withQuery(buildGoogleApiUrl(YOUTUBE_API_ENDPOINT.PLAYLIST_ITEMS), {
    [GOOGLE_API_QUERY_PARAM.PART]: YOUTUBE_API_PLAYLIST.PART,
    [GOOGLE_API_QUERY_PARAM.MAX_RESULTS]: YOUTUBE_API_PLAYLIST.PAGE_SIZE,
    [GOOGLE_API_QUERY_PARAM.FIELDS]: YOUTUBE_API_PLAYLIST.FIELDS,
    [GOOGLE_API_QUERY_PARAM.KEY]: apiKey,
    [YOUTUBE_API_QUERY.PLAYLIST_ID]: playlistId,
    [GOOGLE_API_QUERY_PARAM.PAGE_TOKEN]: pageToken,
  });
}

export function buildVideosApiUrl(options: {
  apiKey: string;
  videoIds: string[];
}): string {
  const { apiKey, videoIds } = options;
  return withQuery(buildGoogleApiUrl(YOUTUBE_API_ENDPOINT.VIDEOS), {
    [GOOGLE_API_QUERY_PARAM.PART]: YOUTUBE_API_VIDEO.PART,
    [GOOGLE_API_QUERY_PARAM.ID]: videoIds.join(","),
    [GOOGLE_API_QUERY_PARAM.KEY]: apiKey,
    [GOOGLE_API_QUERY_PARAM.FIELDS]: YOUTUBE_API_VIDEO.FIELDS,
  });
}
