import { HttpError } from "./http";

const YOUTUBE = "https://www.googleapis.com/youtube/v3";

// YouTube's Data API v3 returns durations as ISO 8601, e.g. PT1H2M3S.
const ISO_DURATION = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;

function seconds(isoDuration: string): number {
  const match = ISO_DURATION.exec(isoDuration);
  if (!match) return 0;
  const [, h = "0", m = "0", s = "0"] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

async function youtube<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = new URL(`${YOUTUBE}/${path}`);
  for (const [key, value] of Object.entries({ ...params, key: apiKey })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  if (response.status === 404) throw new HttpError(404, "Playlist not found or private");
  if (!response.ok) throw new HttpError(response.status, `YouTube: ${response.statusText}`);
  return response.json() as Promise<T>;
}

type ItemsPage = { items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string };
type VideosPage = { items: { contentDetails: { duration: string } }[] };

export async function playlistRuntime(playlistId: string, apiKey: string) {
  let totalVideos = 0;
  let totalRuntime = 0;
  let pageToken = "";

  do {
    const page = await youtube<ItemsPage>(
      "playlistItems",
      {
        part: "contentDetails",
        fields: "items/contentDetails/videoId,nextPageToken",
        maxResults: "50",
        playlistId,
        pageToken,
      },
      apiKey,
    );
    const videoIds = (page.items ?? []).map((item) => item.contentDetails.videoId);
    if (videoIds.length === 0) break;
    totalVideos += videoIds.length;

    const videos = await youtube<VideosPage>(
      "videos",
      { part: "contentDetails", fields: "items/contentDetails/duration", id: videoIds.join(",") },
      apiKey,
    );
    for (const video of videos.items) totalRuntime += seconds(video.contentDetails.duration);

    pageToken = page.nextPageToken ?? "";
  } while (pageToken);

  return {
    playlistId,
    totalVideos,
    totalRuntime,
    averageRuntime: totalVideos === 0 ? 0 : Math.round(totalRuntime / totalVideos),
  };
}
