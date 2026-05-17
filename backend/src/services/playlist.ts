import { StatusError } from "itty-router";
import type { PlaylistResponse, VideoResponse } from "../types";
import {
  GOOGLE_API_QUERY_PARAM,
  GOOGLE_API_URL,
  HTTP_STATUS,
  ERROR,
  NUMBER,
  PAGE,
  YOUTUBE_API_ENDPOINT,
  YOUTUBE_API_PLAYLIST,
  YOUTUBE_API_QUERY,
  YOUTUBE_API_VIDEO,
} from "@toppings/constants";
import {
  interpolateTemplate,
  parseDuration,
  round,
  withQuery,
} from "@toppings/utils";

const googleApiResource = (path: string): string =>
  interpolateTemplate(GOOGLE_API_URL, { path });

const buildPlaylistItemsUrl =
  (apiKey: string) =>
  (playlistId: string, pageToken = ""): string =>
    withQuery(googleApiResource(YOUTUBE_API_ENDPOINT.PLAYLIST_ITEMS), {
      [GOOGLE_API_QUERY_PARAM.PART]: YOUTUBE_API_PLAYLIST.PART,
      [GOOGLE_API_QUERY_PARAM.MAX_RESULTS]: YOUTUBE_API_PLAYLIST.PAGE_SIZE,
      [GOOGLE_API_QUERY_PARAM.FIELDS]: YOUTUBE_API_PLAYLIST.FIELDS,
      [GOOGLE_API_QUERY_PARAM.KEY]: apiKey,
      [YOUTUBE_API_QUERY.PLAYLIST_ID]: playlistId,
      [GOOGLE_API_QUERY_PARAM.PAGE_TOKEN]: pageToken,
    });

const buildVideosUrl =
  (apiKey: string) =>
  (videoIds: string[]): string =>
    withQuery(googleApiResource(YOUTUBE_API_ENDPOINT.VIDEOS), {
      [GOOGLE_API_QUERY_PARAM.PART]: YOUTUBE_API_VIDEO.PART,
      [GOOGLE_API_QUERY_PARAM.ID]: videoIds.join(","),
      [GOOGLE_API_QUERY_PARAM.KEY]: apiKey,
      [GOOGLE_API_QUERY_PARAM.FIELDS]: YOUTUBE_API_VIDEO.FIELDS,
    });

const fetchPlaylistPage =
  (apiKey: string) =>
  async (
    playlistId: string,
    pageToken: string,
  ): Promise<PlaylistResponse> => {
    const response = await fetch(
      buildPlaylistItemsUrl(apiKey)(playlistId, pageToken),
    );

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      throw new StatusError(HTTP_STATUS.NOT_FOUND, ERROR.PLAYLIST_UNAVAILABLE);
    }
    if (!response.ok) {
      throw new StatusError(
        response.status,
        interpolateTemplate(ERROR.YOUTUBE_PLAYLIST_FETCH_FAILED, {
          statusText: response.statusText,
        }),
      );
    }

    return response.json();
  };

const fetchVideoDurationsTotal =
  (apiKey: string) =>
  async (videoIds: string[]): Promise<number> => {
    const response = await fetch(buildVideosUrl(apiKey)(videoIds));

    if (!response.ok) {
      throw new StatusError(
        response.status,
        interpolateTemplate(ERROR.YOUTUBE_VIDEO_FETCH_FAILED, {
          statusText: response.statusText,
        }),
      );
    }

    const data: VideoResponse = await response.json();
    let total = 0;
    for (const item of data.items) {
      total += parseDuration(item.contentDetails.duration);
    }
    return total;
  };

export async function getPlaylistMetadata(playlistId: string, env: Env) {
  const { YOUTUBE_API_KEY: apiKey } = env;
  const fetchPage = fetchPlaylistPage(apiKey);
  const sumDurations = fetchVideoDurationsTotal(apiKey);

  let totalVideos = NUMBER.N0;
  let totalRuntime = NUMBER.N0;
  let pageToken = "";

  do {
    const page = await fetchPage(playlistId, pageToken);
    const videoIds = page.items.map((item) => item.contentDetails.videoId);
    totalVideos += videoIds.length;

    if (videoIds.length === 0) break;

    totalRuntime += await sumDurations(videoIds);
    pageToken = page.nextPageToken ?? "";
  } while (pageToken);

  return {
    pathname: PAGE.PLAYLIST,
    payload: {
      playlistId,
      totalVideos,
      totalRuntime,
      averageRuntime: round(totalRuntime / totalVideos),
    },
  };
}
