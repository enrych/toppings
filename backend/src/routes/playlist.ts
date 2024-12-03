import { IRequest } from 'itty-router';

import parseDuration from '../lib/parseDuration';

const getPlaylist = async (request: IRequest, env: Env) => {
	const { playlistID } = request.params;

	if (!playlistID) {
		return new Response(JSON.stringify({ error_message: 'Missing playlistID parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const data = await calculatePlaylistMetrics(playlistID, env.GOOGLE_SECRET);

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ error_message: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

const calculatePlaylistMetrics = async (playlistID: string, apiKey: string) => {
	let videoCount = 0;
	let totalRuntime = 0;
	let nextPageToken = '';

	do {
		const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${apiKey}&playlistId=${playlistID}&pageToken=${nextPageToken}`;
		const playlistResponse = await fetch(playlistUrl);
		if (!playlistResponse.ok) throw new Error(`Failed to fetch playlist items: ${playlistResponse.statusText}`);
		const playlistData: PlaylistResponse = await playlistResponse.json();

		const videoIDs = playlistData.items.map((item) => item.contentDetails.videoId);
		videoCount += videoIDs.length;

		const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIDs.join(
			',',
		)}&key=${apiKey}&fields=items/contentDetails/duration`;
		const videoResponse = await fetch(videoUrl);
		if (!videoResponse.ok) throw new Error(`Failed to fetch video details: ${videoResponse.statusText}`);
		const videoData: VideoResponse = await videoResponse.json();

		totalRuntime += videoData.items.reduce((sum, item) => sum + parseDuration(item.contentDetails.duration), 0);

		nextPageToken = playlistData.nextPageToken || '';
	} while (nextPageToken);

	return {
		pathname: 'playlist',
		payload: {
			id: playlistID,
			total_videos: videoCount,
			total_runtime_seconds: totalRuntime,
			average_runtime_seconds: Math.round(totalRuntime / videoCount),
		},
	};
};

export default getPlaylist;
