import youtubeWorkerConfig, {
  type YouTubeWorkerConfig,
} from "../../../modules/content_scripts/workers/youtube/config";
import udemyWorkerConfig, {
  UdemyWorkerConfig,
} from "../../../modules/content_scripts/workers/udemy/config";

export type { YouTubeWorkerConfig, UdemyWorkerConfig };

const workersConfig = {
  youtube: youtubeWorkerConfig,
  udemy: udemyWorkerConfig,
};

export type WorkerName = keyof typeof workersConfig;

export default workersConfig;
