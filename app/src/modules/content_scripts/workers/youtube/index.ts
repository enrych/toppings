import type {
  YouTubeContext,
  YouTubePlaylistContext,
  YouTubeWatchContext,
  YouTubeShortsContext,
} from "../../../background/webAppContextParsers/parseYouTubeContext";
import { type YouTubeWorkerConfig } from "./config";
import runWatchWorker from "./routes/watch";
import runPlaylistWorker from "./routes/playlist";
import runShortsWorker from "./routes/shorts";
import "./global.css";

const runYouTubeWorker = async (context: YouTubeContext): Promise<void> => {
  const { activeRoute } = context.contextData;
  const workerConfig = context.workerConfig as YouTubeWorkerConfig;

  switch (activeRoute) {
    case "watch": {
      const isWatchWorkerEnabled = workerConfig.routes.watch.isEnabled;
      isWatchWorkerEnabled &&
        (await runWatchWorker(context as YouTubeWatchContext));
      break;
    }
    case "playlist": {
      const isPlaylistWorkerEnabled = workerConfig.routes.playlist.isEnabled;
      isPlaylistWorkerEnabled &&
        (await runPlaylistWorker(context as YouTubePlaylistContext));
      break;
    }
    case "shorts": {
      const isShortsWorkerEnabled = workerConfig.routes.shorts.isEnabled;
      isShortsWorkerEnabled &&
        (await runShortsWorker(context as YouTubeShortsContext));
      break;
    }
    default:
      break;
  }
};

export default runYouTubeWorker;
