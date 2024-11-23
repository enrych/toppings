import parseDuration from './lib/parseDuration';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { pathname, searchParams } = new URL(request.url);

		if (request.method === 'GET' && pathname.startsWith('/playlist/')) {
			const playlistID = pathname.split('/')[3];
			if (!playlistID) return jsonResponse({ ok: false, error_message: 'Missing playlistID parameter' }, 400);

			try {
				const response = await getPlaylistStats(env.API_KEY, playlistID);
				return jsonResponse({ ok: true, data: response });
			} catch (error) {
				return jsonResponse({ ok: false, error_message: error.message }, 500);
			}
		}

		return jsonResponse({ ok: false, error_message: 'Not found' }, 404);
	},
} satisfies ExportedHandler<Env>;

const PLAYLIST_BASE_ENDPOINT = (apiKey: string, playlistId: string, pageToken: string) =>
	`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${apiKey}&playlistId=${playlistId}&pageToken=${pageToken}`;

const VIDEO_BASE_ENDPOINT = (apiKey: string, videoIds: string) =>
	`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}&fields=items/contentDetails/duration`;

const jsonResponse = (data: any, status: number = 200): Response =>
	new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const fetchYouTubeData = async (url: string): Promise<any> => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`YouTube API request failed: ${response.statusText}`);
	return response.json();
};

const getPlaylistStats = async (
	apiKey: string,
	playlistID: string,
): Promise<{
	playlist_id: string;
	num_videos: number;
	total_runtime: number;
	avg_runtime: number;
}> => {
	let videoCount = 0;
	let totalRuntime = 0;
	let nextPageToken = '';

	do {
		const playlistUrl = PLAYLIST_BASE_ENDPOINT(apiKey, playlistID, nextPageToken);
		const playlistData = await fetchYouTubeData(playlistUrl);

		const videoIDs = playlistData.items.map((item: any) => item.contentDetails.videoId);
		videoCount += videoIDs.length;

		const videoUrl = VIDEO_BASE_ENDPOINT(apiKey, videoIDs.join(','));
		const videoData = await fetchYouTubeData(videoUrl);

		totalRuntime += videoData.items.reduce((sum: number, item: any) => sum + parseDuration(item.contentDetails.duration), 0);

		nextPageToken = playlistData.nextPageToken || '';
	} while (nextPageToken);

	return {
		playlist_id: playlistID,
		num_videos: videoCount,
		total_runtime: totalRuntime,
		avg_runtime: Math.round(totalRuntime / videoCount),
	};
};
