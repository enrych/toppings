export const PLAYLIST_VIDEO_IDS_ENDPOINT =
  "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&fields=items/contentDetails/videoId,nextPageToken&maxResults=50";

export const VIDEO_DURATIONS_ENDPOINT =
  "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&fields=items/contentDetails/duration";
