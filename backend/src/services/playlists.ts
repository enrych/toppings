import { StatusError } from "itty-router";
import {
  BACKEND_ERROR_MESSAGE,
  FETCH_ERROR_TEMPLATE,
  GOOGLEAPIS_HOST,
  HTTP_STATUS,
  PATHNAME,
  YOUTUBE_API_FIELDS_VALUE,
  YOUTUBE_API_MAX_RESULTS_DEFAULT,
  YOUTUBE_API_PART_VALUE,
  YOUTUBE_API_QUERY,
  YOUTUBE_DATA_API_PATH,
} from "toppings-constants";
import parseDuration from "../utils/parseDuration";

function buildPlaylistItemsUrl(
  playlistId: string,
  apiKey: string,
  pageToken: string,
): string {
  const url = new URL(
    `${GOOGLEAPIS_HOST}${YOUTUBE_DATA_API_PATH.PLAYLIST_ITEMS}`,
  );
  url.searchParams.set(
    YOUTUBE_API_QUERY.PART,
    YOUTUBE_API_PART_VALUE.PLAYLIST_ITEMS,
  );
  url.searchParams.set(
    YOUTUBE_API_QUERY.MAX_RESULTS,
    String(YOUTUBE_API_MAX_RESULTS_DEFAULT),
  );
  url.searchParams.set(
    YOUTUBE_API_QUERY.FIELDS,
    YOUTUBE_API_FIELDS_VALUE.PLAYLIST_ITEMS,
  );
  url.searchParams.set(YOUTUBE_API_QUERY.KEY, apiKey);
  url.searchParams.set(YOUTUBE_API_QUERY.PLAYLIST_ID, playlistId);
  if (pageToken) {
    url.searchParams.set(YOUTUBE_API_QUERY.PAGE_TOKEN, pageToken);
  }
  return url.toString();
}

function buildVideosUrl(videoIds: string[], apiKey: string): string {
  const url = new URL(`${GOOGLEAPIS_HOST}${YOUTUBE_DATA_API_PATH.VIDEOS}`);
  url.searchParams.set(YOUTUBE_API_QUERY.PART, YOUTUBE_API_PART_VALUE.VIDEOS);
  url.searchParams.set(YOUTUBE_API_QUERY.ID, videoIds.join(","));
  url.searchParams.set(YOUTUBE_API_QUERY.KEY, apiKey);
  url.searchParams.set(
    YOUTUBE_API_QUERY.FIELDS,
    YOUTUBE_API_FIELDS_VALUE.VIDEOS_ITEMS_DURATION,
  );
  return url.toString();
}

import type { PlaylistResponse, VideoResponse } from "../types";

class PlaylistService {
  static async getPlaylistMetadata(playlistId: string, env: Env) {
    const { YOUTUBE_API_KEY } = env;
    let videoCount = 0;
    let totalRuntime = 0;
    let nextPageToken = "";

    do {
      const playlistUrl = buildPlaylistItemsUrl(
        playlistId,
        YOUTUBE_API_KEY,
        nextPageToken,
      );
      const playlistResponse = await fetch(playlistUrl);

      if (playlistResponse.status === HTTP_STATUS.NOT_FOUND) {
        throw new StatusError(
          HTTP_STATUS.NOT_FOUND,
          BACKEND_ERROR_MESSAGE.PLAYLIST_NOT_FOUND_OR_PRIVATE,
        );
      }
      if (!playlistResponse.ok) {
        throw new StatusError(
          playlistResponse.status,
          `${FETCH_ERROR_TEMPLATE.PLAYLIST_ITEMS} ${playlistResponse.statusText}`,
        );
      }

      const playlistData: PlaylistResponse = await playlistResponse.json();
      const videoIDs = playlistData.items.map(
        (item) => item.contentDetails.videoId,
      );
      videoCount += videoIDs.length;

      if (videoIDs.length === 0) break;

      const videoUrl = buildVideosUrl(videoIDs, YOUTUBE_API_KEY);
      const videoResponse = await fetch(videoUrl);

      if (!videoResponse.ok) {
        throw new StatusError(
          videoResponse.status,
          `${FETCH_ERROR_TEMPLATE.VIDEO_DETAILS} ${videoResponse.statusText}`,
        );
      }

      const videoData: VideoResponse = await videoResponse.json();
      totalRuntime += videoData.items.reduce(
        (sum, item) => sum + parseDuration(item.contentDetails.duration),
        0,
      );

      nextPageToken = playlistData.nextPageToken || "";
    } while (nextPageToken);

    return {
      pathname: PATHNAME.PLAYLIST,
      payload: {
        playlistId: playlistId,
        totalVideos: videoCount,
        totalRuntime: totalRuntime,
        averageRuntime: Math.round(totalRuntime / videoCount),
      },
    };
  }
}

export default PlaylistService;
