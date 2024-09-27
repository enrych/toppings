import type {
  YouTubeContext,
  YouTubePlaylistContext,
  YouTubeShortsContext,
  YouTubeWatchContext,
} from "../../../background/parsers/parseYouTubeContext";
import onPlaylistPage from "./routes/playlist";
import onShortsPage from "./routes/shorts";
import onWatchPage from "./routes/watch";
import type { YouTubeConfig } from "./webApp.config";
import "./index.css";

const onYouTubeLoaded = async (context: YouTubeContext): Promise<void> => {
  const { activeRoute } = context.contextData;
  const webAppConfig = context.webAppConfig as YouTubeConfig;

  switch (activeRoute) {
    case "watch": {
      const isWatchEnabled = webAppConfig.routes.watch.isEnabled;
      isWatchEnabled && (await onWatchPage(context as YouTubeWatchContext));
      break;
    }
    case "playlist": {
      const isPlaylistEnabled = webAppConfig.routes.playlist.isEnabled;
      isPlaylistEnabled &&
        (await onPlaylistPage(context as YouTubePlaylistContext));
      break;
    }
    case "shorts": {
      const isShortsEnabled = webAppConfig.routes.shorts.isEnabled;
      isShortsEnabled && (await onShortsPage(context as YouTubeShortsContext));
      break;
    }
    default:
      break;
  }
};

export default onYouTubeLoaded;
