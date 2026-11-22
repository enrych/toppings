import { defineMessage } from "@/kernel/messaging";

export interface PlaylistRuntime {
  playlistId: string;
  totalVideos: number;
  totalRuntime: number;
  averageRuntime: number;
}

// Answered by the background, which is the only surface allowed to call the
// Toppings API from a YouTube page. `refresh` bypasses the cache.
export const getPlaylistRuntime = defineMessage<{ playlistId: string; refresh?: boolean }, PlaylistRuntime | null>(
  "playlist-runtime",
);
