import { StatusError } from "itty-router";
import parseDuration from "../utils/parseDuration";

class PlaylistService {
  static async getPlaylistMetadata(playlistId: string, env: Env) {
    const { YOUTUBE_API_KEY } = env;
    let videoCount = 0;
    let totalRuntime = 0;
    let nextPageToken = "";

    do {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${YOUTUBE_API_KEY}&playlistId=${playlistId}&pageToken=${nextPageToken}`;
      const playlistResponse = await fetch(playlistUrl);

      if (playlistResponse.status === 404) {
        throw new StatusError(404, "Playlist not found or private");
      }
      if (!playlistResponse.ok) {
        throw new StatusError(
          playlistResponse.status,
          `Failed to fetch playlist items: ${playlistResponse.statusText}`,
        );
      }

      const playlistData: PlaylistResponse = await playlistResponse.json();
      const videoIDs = playlistData.items.map(
        (item) => item.contentDetails.videoId,
      );
      videoCount += videoIDs.length;

      if (videoIDs.length === 0) break;

      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIDs.join(",")}&key=${YOUTUBE_API_KEY}&fields=items/contentDetails/duration`;
      const videoResponse = await fetch(videoUrl);

      if (!videoResponse.ok) {
        throw new StatusError(
          videoResponse.status,
          `Failed to fetch video details: ${videoResponse.statusText}`,
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
      pathname: "playlist",
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
