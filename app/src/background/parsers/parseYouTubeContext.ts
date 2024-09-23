import { YouTubeConfig } from "../../content_scripts/webApps/youtube/webApp.config";
import getWebAppConfig from "../../lib/getWebAppConfig";
import { type SupportedWebAppContext } from "../webAppContext";

export interface YouTubeWatchContext extends SupportedWebAppContext {
  contextData: {
    webAppURL: URL;
    activeRoute: "watch";
    payload: YouTubeVideo;
  };
}

export interface YouTubeVideo {
  videoID: string;
}

export interface YouTubePlaylistContext extends SupportedWebAppContext {
  contextData: {
    webAppURL: URL;
    activeRoute: "playlist";
    payload: YouTubeValidPlaylist | YouTubeInvalidPlaylist;
  };
}

export interface YouTubeValidPlaylist {
  playlistId: string;
  averageRuntime: number;
  totalRuntime: number;
  totalVideos: string;
}

export interface YouTubeInvalidPlaylist {
  playlistId: "WL" | "LL";
}

export interface YouTubePlaylistResponse {
  ok: boolean;
  status: number;
  error_message: string;
  data: {
    num_videos: string;
    playlist_id: string;
    avg_runtime: number;
    total_runtime: number;
  };
}

export interface YouTubeShortsContext extends SupportedWebAppContext {
  contextData: {
    webAppURL: URL;
    activeRoute: "shorts";
    payload: YouTubeShort;
  };
}

export interface YouTubeShort {
  shortID: string;
}

export type YouTubeContext =
  | YouTubeWatchContext
  | YouTubePlaylistContext
  | YouTubeShortsContext
  | SupportedWebAppContext;

export default async function parseYoutubeContext(
  webAppURL: URL,
): Promise<YouTubeContext> {
  const youtubeConfig = (await getWebAppConfig("youtube")) as YouTubeConfig;

  if (!youtubeConfig) {
    throw new Error("YouTube configuration not found.");
  }

  switch (webAppURL.pathname) {
    case "/playlist": {
      const playlistId = webAppURL.searchParams.get("list");
      if (playlistId != null && playlistId !== "WL" && playlistId !== "LL") {
        const SERVER_BASE_URI =
          process.env.NODE_ENV === "development"
            ? "http://localhost:8080"
            : "https://toppings.onrender.com";
        const response = await fetch(
          `${SERVER_BASE_URI}/youtube/playlist/${playlistId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const body = (await response.json()) as YouTubePlaylistResponse;

        return {
          isSupported: true,
          appName: "youtube",
          webAppConfig: youtubeConfig,
          contextData: {
            webAppURL,
            activeRoute: "playlist",
            payload: {
              averageRuntime: body.data.avg_runtime,
              totalRuntime: body.data.total_runtime,
              totalVideos: body.data.num_videos,
            },
          },
        };
      } else {
        return {
          isSupported: true,
          appName: "youtube",
          webAppConfig: youtubeConfig,
          contextData: {
            webAppURL,
            activeRoute: "playlist",
          },
        };
      }
      break;
    }

    case "/watch": {
      const videoID = webAppURL.searchParams.get("v");
      if (videoID != null) {
        return {
          isSupported: true,
          appName: "youtube",
          webAppConfig: youtubeConfig,
          contextData: {
            webAppURL,
            activeRoute: "watch",
            payload: {
              videoID,
            },
          },
        };
      }
      break;
    }

    default: {
      if (webAppURL.pathname.startsWith("/shorts")) {
        const shortID = webAppURL.pathname.split("/").at(2);
        return {
          isSupported: true,
          appName: "youtube",
          webAppConfig: youtubeConfig,
          contextData: {
            webAppURL,
            activeRoute: "shorts",
            payload: {
              shortID,
            },
          },
        };
      }
    }
  }

  return {
    isSupported: true,
    appName: "youtube",
    webAppConfig: youtubeConfig,
    contextData: {
      webAppURL,
    },
  };
}
