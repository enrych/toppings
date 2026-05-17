import { StatusError } from "itty-router";
import type { PlaylistResponse, VideoResponse } from "../types";
import {
  GOOGLE_API_ORIGIN,
  GOOGLE_API_QUERY,
  GOOGLE_API_URL,
  HTTP_STATUS,
  ERROR,
  PAGE,
  YOUTUBE_API_ENDPOINT,
  YOUTUBE_API_PLAYLIST,
  YOUTUBE_API_QUERY,
  YOUTUBE_API_VIDEO,
} from "@toppings/constants";
import { interpolateTemplate } from "@toppings/utils";
import parseDuration from "../utils/parseDuration";

function buildResourceUrl(path: string): string {
  return interpolateTemplate(GOOGLE_API_URL.RESOURCE, {
    origin: GOOGLE_API_ORIGIN,
    path,
  });
}

function buildPlaylistItemsUrl(
  playlistId: string,
  apiKey: string,
  pageToken: string,
): string {
  const url = new URL(buildResourceUrl(YOUTUBE_API_ENDPOINT.PLAYLIST_ITEMS));
  url.searchParams.set(GOOGLE_API_QUERY.PART, YOUTUBE_API_PLAYLIST.PART);
  url.searchParams.set(
    GOOGLE_API_QUERY.MAX_RESULTS,
    String(YOUTUBE_API_PLAYLIST.PAGE_SIZE),
  );
  url.searchParams.set(GOOGLE_API_QUERY.FIELDS, YOUTUBE_API_PLAYLIST.FIELDS);
  url.searchParams.set(GOOGLE_API_QUERY.KEY, apiKey);
  url.searchParams.set(YOUTUBE_API_QUERY.PLAYLIST_ID, playlistId);
  if (pageToken) {
    url.searchParams.set(GOOGLE_API_QUERY.PAGE_TOKEN, pageToken);
  }
  return url.toString();
}

function buildVideosUrl(videoIds: string[], apiKey: string): string {
  const url = new URL(buildResourceUrl(YOUTUBE_API_ENDPOINT.VIDEOS));
  url.searchParams.set(GOOGLE_API_QUERY.PART, YOUTUBE_API_VIDEO.PART);
  url.searchParams.set(GOOGLE_API_QUERY.ID, videoIds.join(","));
  url.searchParams.set(GOOGLE_API_QUERY.KEY, apiKey);
  url.searchParams.set(GOOGLE_API_QUERY.FIELDS, YOUTUBE_API_VIDEO.FIELDS);
  return url.toString();
}

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
          ERROR.PLAYLIST_UNAVAILABLE,
        );
      }
      if (!playlistResponse.ok) {
        throw new StatusError(
          playlistResponse.status,
          interpolateTemplate(ERROR.YOUTUBE_PLAYLIST_FETCH_FAILED, {
            statusText: playlistResponse.statusText,
          }),
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
          interpolateTemplate(ERROR.YOUTUBE_VIDEO_FETCH_FAILED, {
            statusText: videoResponse.statusText,
          }),
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
      pathname: PAGE.PLAYLIST,
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
