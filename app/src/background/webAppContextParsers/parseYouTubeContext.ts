import { type SupportedWebAppContext } from "../webAppContext";
import getWorkerConfig from "../getWorkerConfig";
import { YouTubeWorkerConfig } from "../../content_scripts/workers/youtube/config";

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
    payload: YouTubePlaylist;
  };
}

export interface YouTubePlaylist {
  playlistID: string;
}

export type YouTubeContext =
  | YouTubeWatchContext
  | YouTubePlaylistContext
  | SupportedWebAppContext;

export default async function parseYoutubeContext(
  webAppURL: URL,
): Promise<YouTubeContext> {
  const youtubeWorkerConfig = (await getWorkerConfig(
    "youtube",
  )) as YouTubeWorkerConfig;

  if (!youtubeWorkerConfig) {
    throw new Error("YouTube worker configuration not found.");
  }

  switch (webAppURL.pathname) {
    case "/playlist": {
      const playlistID = webAppURL.searchParams.get("list");
      if (playlistID != null) {
        return {
          isSupported: true,
          appName: "youtube",
          workerConfig: youtubeWorkerConfig,
          contextData: {
            webAppURL,
            activeRoute: "playlist",
            payload: {
              playlistID,
            },
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
          workerConfig: youtubeWorkerConfig,
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
  }

  return {
    isSupported: true,
    appName: "youtube",
    workerConfig: youtubeWorkerConfig,
    contextData: {
      webAppURL,
    },
  };
}
