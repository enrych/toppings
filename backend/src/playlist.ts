import { HttpError } from "./http";

export async function getPlaylistRuntime(playlistId: string, apiKey: string) {
  let totalVideos = 0;
  let totalRuntime = 0;

  for await (const videoIds of videoIdsByPage(playlistId, apiKey)) {
    totalVideos += videoIds.length;
    totalRuntime += await fetchDurationSeconds(videoIds, apiKey);
  }

  return {
    playlistId,
    totalVideos,
    totalRuntime,
    averageRuntime: totalVideos === 0 ? 0 : Math.round(totalRuntime / totalVideos),
  };
}

type PlaylistPage = { items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string };

async function* videoIdsByPage(playlistId: string, apiKey: string): AsyncGenerator<string[]> {
  let pageToken: string | undefined;
  do {
    const page = await fetchYouTube<PlaylistPage>("playlistItems", apiKey, {
      part: "contentDetails",
      fields: "items/contentDetails/videoId,nextPageToken",
      maxResults: "50",
      playlistId,
      pageToken,
    });
    yield (page.items ?? []).map((item) => item.contentDetails.videoId);
    pageToken = page.nextPageToken;
  } while (pageToken);
}

type VideoPage = { items?: { contentDetails: { duration: string } }[] };

async function fetchDurationSeconds(videoIds: string[], apiKey: string): Promise<number> {
  if (videoIds.length === 0) return 0;
  const page = await fetchYouTube<VideoPage>("videos", apiKey, {
    part: "contentDetails",
    fields: "items/contentDetails/duration",
    id: videoIds.join(","),
  });
  let total = 0;
  for (const video of page.items ?? []) total += toSeconds(video.contentDetails.duration);
  return total;
}

// YouTube writes durations as ISO 8601, e.g. PT1H2M3S, with any part optional.
function toSeconds(isoDuration: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/.exec(isoDuration);
  if (!match) return 0;
  const [, hours = "0", minutes = "0", seconds = "0"] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

// The Data API answers 404 for a playlist that is private or deleted.
async function fetchYouTube<T>(
  resource: string,
  apiKey: string,
  params: Record<string, string | undefined>,
): Promise<T> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
  url.searchParams.set("key", apiKey);
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(name, value);
  }

  const response = await fetch(url);
  if (response.status === 404) throw new HttpError(404, "Playlist not found or private");
  if (!response.ok) throw new HttpError(response.status, `YouTube: ${await errorMessage(response)}`);
  return response.json() as Promise<T>;
}

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
  return body?.error?.message ?? response.statusText;
}
