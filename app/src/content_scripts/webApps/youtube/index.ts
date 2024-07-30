import type {
  YouTubeContext,
  YouTubePlaylistContext,
  YouTubeWatchContext,
  YouTubeShortsContext,
} from "../../../background/parsers//parseYouTubeContext";
import runWatch from "./routes/watch";
import runPlaylist from "./routes/playlist";
import runShorts from "./routes/shorts";
import { YouTubeConfig } from "./webApp.config";
import "./global.css";

const runYouTube = async (context: YouTubeContext): Promise<void> => {
  const { activeRoute } = context.contextData;
  const webAppConfig = context.webAppConfig as YouTubeConfig;

  switch (activeRoute) {
    case "watch": {
      const isWatchEnabled = webAppConfig.routes.watch.isEnabled;
      isWatchEnabled && (await runWatch(context as YouTubeWatchContext));
      break;
    }
    case "playlist": {
      const isPlaylistEnabled = webAppConfig.routes.playlist.isEnabled;
      isPlaylistEnabled &&
        (await runPlaylist(context as YouTubePlaylistContext));
      break;
    }
    case "shorts": {
      const isShortsEnabled = webAppConfig.routes.shorts.isEnabled;
      isShortsEnabled && (await runShorts(context as YouTubeShortsContext));
      break;
    }
    default:
      break;
  }
};

export default runYouTube;
