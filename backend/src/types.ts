export interface PlaylistItem {
	contentDetails: {
		videoId: string;
	};
}

export interface PlaylistResponse {
	items: PlaylistItem[];
	nextPageToken?: string;
}

export interface VideoItem {
	contentDetails: {
		duration: string;
	};
}

export interface VideoResponse {
	items: VideoItem[];
}
