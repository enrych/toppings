interface PlaylistItem {
	contentDetails: {
		videoId: string;
	};
}

interface PlaylistResponse {
	items: PlaylistItem[];
	nextPageToken?: string;
}

interface VideoItem {
	contentDetails: {
		duration: string;
	};
}

interface VideoResponse {
	items: VideoItem[];
}
