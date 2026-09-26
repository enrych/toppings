import { HttpError } from "./http";

export async function playlistRuntime(playlistId: string, apiKey: string) {
  let totalVideos = 0;
  let totalRuntime = 0;

  for await (const videoIds of playlistPages(playlistId, apiKey)) {
    totalVideos += videoIds.length;
    totalRuntime += sum(await videoDurations(videoIds, apiKey));
  }

  return {
    playlistId,
    totalVideos,
    totalRuntime,
    averageRuntime: totalVideos === 0 ? 0 : Math.round(totalRuntime / totalVideos),
  };
}

type PlaylistPage = { items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string };
type VideoPage = { items?: { contentDetails: { duration: string } }[] };

async function* playlistPages(playlistId: string, apiKey: string): AsyncGenerator<string[]> {
  let pageToken: string | undefined;
  do {
    const page = await youtube<PlaylistPage>("playlistItems", apiKey, {
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

async function videoDurations(videoIds: string[], apiKey: string): Promise<number[]> {
  if (videoIds.length === 0) return [];
  const page = await youtube<VideoPage>("videos", apiKey, {
    part: "contentDetails",
    fields: "items/contentDetails/duration",
    id: videoIds.join(","),
  });
  return (page.items ?? []).map((video) => isoDurationToSeconds(video.contentDetails.duration));
}

// The Data API answers 404 for a playlist that is private or deleted.
async function youtube<T>(
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
  if (!response.ok) throw new HttpError(response.status, `YouTube: ${response.statusText}`);
  return response.json() as Promise<T>;
}

// ISO 8601 as YouTube writes it: PT1H2M3S, any part optional.
function isoDurationToSeconds(duration: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/.exec(duration);
  if (!match) return 0;
  const [, hours = "0", minutes = "0", seconds = "0"] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function sum(numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}
