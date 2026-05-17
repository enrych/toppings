import { StatusError } from "itty-router";
import type { PlaylistResponse, VideoResponse } from "../types";
import { ERROR, HTTP_STATUS, NUMBER, PAGE } from "@toppings/constants";
import { interpolateTemplate, parseDuration, round } from "@toppings/utils";
import {
  buildPlaylistItemsApiUrl,
  buildVideosApiUrl,
} from "../utils/googleapi";

async function requestPlaylistPage(
  apiKey: string,
  playlistId: string,
  pageToken: string,
): Promise<PlaylistResponse> {
  const response = await fetch(
    buildPlaylistItemsApiUrl({ apiKey, playlistId, pageToken }),
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
}

async function requestVideoDurationsTotal(
  apiKey: string,
  videoIds: string[],
): Promise<number> {
  const response = await fetch(buildVideosApiUrl({ apiKey, videoIds }));

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
}

export async function getPlaylistMetadata(playlistId: string, env: Env) {
  const { YOUTUBE_DATA_API_V3_KEY: apiKey } = env;

  let totalVideos = NUMBER.N0;
  let totalRuntime = NUMBER.N0;
  let pageToken = "";

  do {
    const page = await requestPlaylistPage(apiKey, playlistId, pageToken);
    const videoIds = page.items.map((item) => item.contentDetails.videoId);
    totalVideos += videoIds.length;

    if (videoIds.length === 0) break;

    totalRuntime += await requestVideoDurationsTotal(apiKey, videoIds);
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
