import { StatusError } from "itty-router";
import {
  ERROR,
  HTTP_STATUS,
  PLAYLIST_VIDEO_IDS_ENDPOINT,
  VIDEO_DURATIONS_ENDPOINT,
} from "../constants";
import { parseDuration } from "../utils";

export async function getPlaylistMetadata(playlistId: string, env: Env) {
  const apiKey = env.YOUTUBE_DATA_API_V3_KEY;
  let totalVideos = 0;
  let totalRuntime = 0;
  let pageToken = "";

  do {
    const itemsRes = await fetch(
      `${PLAYLIST_VIDEO_IDS_ENDPOINT}&key=${apiKey}&playlistId=${playlistId}&pageToken=${pageToken}`,
    );

    if (itemsRes.status === HTTP_STATUS.NOT_FOUND) {
      throw new StatusError(HTTP_STATUS.NOT_FOUND, ERROR.PLAYLIST_UNAVAILABLE);
    }
    if (!itemsRes.ok) {
      throw new StatusError(
        itemsRes.status,
        `${ERROR.YOUTUBE_PLAYLIST_FETCH_FAILED}: ${itemsRes.statusText}`,
      );
    }

    const page = (await itemsRes.json()) as {
      items?: { contentDetails: { videoId: string } }[];
      nextPageToken?: string;
    };
    const videoIds = (page.items ?? []).map(
      (item) => item.contentDetails.videoId,
    );
    totalVideos += videoIds.length;
    if (videoIds.length === 0) break;

    const videosRes = await fetch(
      `${VIDEO_DURATIONS_ENDPOINT}&key=${apiKey}&id=${videoIds.join(",")}`,
    );

    if (!videosRes.ok) {
      throw new StatusError(
        videosRes.status,
        `${ERROR.YOUTUBE_VIDEO_FETCH_FAILED}: ${videosRes.statusText}`,
      );
    }

    const videos = (await videosRes.json()) as {
      items: { contentDetails: { duration: string } }[];
    };
    for (const item of videos.items) {
      totalRuntime += parseDuration(item.contentDetails.duration);
    }

    pageToken = page.nextPageToken ?? "";
  } while (pageToken);

  return {
    scope: "playlist",
    payload: {
      playlistId,
      totalVideos,
      totalRuntime,
      averageRuntime:
        totalVideos === 0 ? 0 : Math.round(totalRuntime / totalVideos),
    },
  };
}
