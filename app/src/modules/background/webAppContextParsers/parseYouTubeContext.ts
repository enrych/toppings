import { type SupportedWebAppContext } from "../webAppContext";
import { getWorkerConfig, type YouTubeWorkerConfig } from "../../../store/";

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

    default: {
      if (webAppURL.pathname.startsWith("/shorts")) {
        const shortID = webAppURL.pathname.split("/").at(2);
        return {
          isSupported: true,
          appName: "youtube",
          workerConfig: youtubeWorkerConfig,
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
    workerConfig: youtubeWorkerConfig,
    contextData: {
      webAppURL,
    },
  };
}
