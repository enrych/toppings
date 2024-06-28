import runWatchWorker from "./routes/watch";
import runPlaylistWorker from "./routes/playlist";
import { type YouTubeContext } from "../../../background/webAppContextParsers";
import { type YouTubeWorkerConfig } from "./config";
import {
  YouTubePlaylistContext,
  YouTubeWatchContext,
} from "../../../background/webAppContextParsers/parseYouTubeContext";

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
    default:
      break;
  }
};

export default runYouTubeWorker;
